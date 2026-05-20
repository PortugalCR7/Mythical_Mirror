import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VertexAI } from '@google-cloud/vertexai';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userImage, visualDescription } = req.body;

    const base64Image = userImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const vertex_ai = makeVertexAI();
    const imagenModel = vertex_ai.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

    let attempts = 0;
    let imagenResponse = null;

    while (attempts < 3 && !imagenResponse) {
      try {
        imagenResponse = await imagenModel.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { text: visualDescription },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            ],
          }],
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

    res.json({ image: finalImage });
  } catch (error: any) {
    console.error('[Biometric Uplink] Failure:', error);
    res.status(500).json({ error: error.message });
  }
}
