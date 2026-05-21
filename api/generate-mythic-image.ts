import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VertexAI } from '@google-cloud/vertexai';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Primary renderer: Gemini 2.5 Flash Image ("nano-banana") accepts the
// reference photo as input and renders the same person in a new style.
// This is the model AI Studio used for the reference outputs — true
// image-to-image transfiguration, not text-driven generation with a
// hallucinated face.
//
// Fallback: imagen-3.0-generate-001 is text-only and cannot preserve
// likeness, but is kept as a degraded path if Flash Image is unavailable.
const PRIMARY_IMAGE_MODEL = process.env.MYTHIC_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';
const FALLBACK_IMAGE_MODEL = 'imagen-3.0-generate-001';

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

function parseDataUrl(dataUrl: unknown) {
  if (typeof dataUrl !== 'string') return { mimeType: '', base64: '' };
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
  if (!m) return { mimeType: '', base64: '' };
  return { mimeType: m[1], base64: m[2] };
}

function extractImageFromResponse(response: any): string | null {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data && part?.inlineData?.mimeType?.startsWith('image/')) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

async function renderWithFlashImage(vertex_ai: VertexAI, prompt: string, base64: string, mimeType: string): Promise<string> {
  const model = vertex_ai.getGenerativeModel({ model: PRIMARY_IMAGE_MODEL } as any);
  const parts: any[] = [{ text: prompt }];
  if (base64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE'] } as any,
  });
  const img = extractImageFromResponse(result.response);
  if (!img) throw new Error('Flash Image returned no image data.');
  return img;
}

async function renderWithImagenFallback(vertex_ai: VertexAI, prompt: string): Promise<string> {
  const model = vertex_ai.getGenerativeModel({ model: FALLBACK_IMAGE_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  const img = extractImageFromResponse(result.response);
  if (!img) throw new Error('Imagen fallback returned no image data.');
  return img;
}

/**
 * MANIFESTATION: Renders the mythic portrait.
 *
 * Two-input pipeline:
 *   1. `visualDescription` — the assembled mythic prompt (built by the brief
 *      endpoint, includes archetype identity, cultural DNA, and the
 *      photo-extracted PHYSICAL LIKENESS directive as a prompt enhancer).
 *   2. `userImage` — the reference photo. Fed to Gemini 2.5 Flash Image so
 *      the actual face is preserved, matching the AI Studio reference outputs.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { visualDescription, userImage } = req.body;
    if (!visualDescription || typeof visualDescription !== 'string') {
      return res.status(400).json({ error: 'Missing visualDescription.' });
    }

    const { mimeType, base64 } = parseDataUrl(userImage);
    const vertex_ai = makeVertexAI();

    let finalImage: string | null = null;
    let modelUsed = PRIMARY_IMAGE_MODEL;
    let attempts = 0;
    let lastError: any = null;

    while (attempts < 3 && !finalImage) {
      try {
        finalImage = await renderWithFlashImage(vertex_ai, visualDescription, base64, mimeType);
      } catch (error: any) {
        lastError = error;
        if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
          attempts++;
          console.warn(`[Manifestation] 429 on ${PRIMARY_IMAGE_MODEL}. Attempt ${attempts}/3. Waiting 3s...`);
          await sleep(3000);
          continue;
        }
        console.warn(`[Manifestation] ${PRIMARY_IMAGE_MODEL} failed, falling back to ${FALLBACK_IMAGE_MODEL}:`, error.message);
        try {
          finalImage = await renderWithImagenFallback(vertex_ai, visualDescription);
          modelUsed = FALLBACK_IMAGE_MODEL;
        } catch (fallbackErr: any) {
          throw fallbackErr;
        }
      }
    }

    if (!finalImage) throw lastError || new Error('Manifestation failed.');

    res.json({ image: finalImage, model: modelUsed });
  } catch (error: any) {
    console.error('[Manifestation] Failure:', error);
    res.status(500).json({ error: error.message });
  }
}
