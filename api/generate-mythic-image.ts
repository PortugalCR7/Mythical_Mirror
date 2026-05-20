import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VertexAI } from '@google-cloud/vertexai';
// @ts-ignore – JS helpers bundled by Vercel
import { injectPhysicalLikeness } from '../server/mythic_gen.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TRAIT_EXTRACTION_PROMPT = `You are a forensic portrait analyst. Examine the subject's face in this photo and return a single comma-separated line of physical likeness traits suitable for guiding a portrait painter.

Include, where visible: skin tone, eye shape and color, eyebrow shape, nose shape, lip shape, cheekbone structure, jawline, face shape, hair color, hair texture, hair length, facial hair, approximate age range, and any distinguishing features (freckles, dimples, glasses, etc.).

Rules:
- Output ONLY the trait line. No preamble, no explanation, no markdown.
- 15 to 30 words. Lowercase phrases separated by commas.
- Describe what is visible. Do not invent ethnicity, mood, or personality.
- Do not name the person. Do not reference clothing or background.`;

function makeVertexAI() {
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.VITE_GCP_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.VITE_GCP_LOCATION || 'us-central1';
  if (!project) throw new Error('GOOGLE_CLOUD_PROJECT is not configured');
  const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  return new VertexAI({
    project,
    location,
    ...(credJson && { googleAuthOptions: { credentials: JSON.parse(credJson) } }),
  });
}

async function extractPhysicalTraits(vertex_ai: VertexAI, base64Image: string, mimeType: string): Promise<string> {
  const visionModel = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await visionModel.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: TRAIT_EXTRACTION_PROMPT },
        { inlineData: { mimeType, data: base64Image } },
      ],
    }],
  });
  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim().replace(/^["']|["']$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userImage, visualDescription } = req.body;

    const mimeMatch = typeof userImage === 'string' ? userImage.match(/^data:(image\/[a-zA-Z]+);base64,/) : null;
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Image = typeof userImage === 'string'
      ? userImage.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
      : '';

    const vertex_ai = makeVertexAI();

    let physicalTraits = '';
    if (base64Image) {
      try {
        physicalTraits = await extractPhysicalTraits(vertex_ai, base64Image, mimeType);
        console.log('[Biometric Uplink] Extracted traits:', physicalTraits);
      } catch (err: any) {
        console.warn('[Biometric Uplink] Vision extraction failed, continuing without traits:', err.message);
      }
    }

    const finalPrompt = injectPhysicalLikeness(visualDescription, physicalTraits);

    const imagenModel = vertex_ai.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

    let attempts = 0;
    let imagenResponse: any = null;

    while (attempts < 3 && !imagenResponse) {
      try {
        imagenResponse = await imagenModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        });
      } catch (error: any) {
        if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
          attempts++;
          console.warn(`[QUOTA] Rate limit hit. Attempt ${attempts}/3. Waiting 3s...`);
          await sleep(3000);
        } else {
          throw error;
        }
      }
    }

    if (!imagenResponse) throw new Error('Manifestation timed out. Defaulting to headshot.');

    const generatedContent = imagenResponse.response.candidates?.[0]?.content?.parts?.[0];
    const finalImage = `data:${generatedContent.inlineData.mimeType};base64,${generatedContent.inlineData.data}`;

    res.json({ image: finalImage, physicalTraits });
  } catch (error: any) {
    console.error('[Biometric Uplink] Failure:', error);
    res.status(500).json({ error: error.message });
  }
}
