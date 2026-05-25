import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const IMAGE_MODEL = process.env.MYTHIC_IMAGE_MODEL || 'gemini-2.5-flash-image';
// Portrait output tuned for the 1080×1920 (9:16) share card — generate
// natively at that aspect so crowns/headdresses/costume aren't cropped, at 2K
// so the long edge covers the card height without upscaling. Env-overridable.
const IMAGE_ASPECT_RATIO = process.env.MYTHIC_IMAGE_ASPECT || '9:16';
const IMAGE_SIZE = process.env.MYTHIC_IMAGE_SIZE || '2K';

function makeClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
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

/**
 * MANIFESTATION: Renders the mythic portrait via Gemini 2.5 Flash Image.
 * Feeds the reference photo so the actual face is preserved (true
 * image-to-image), with the assembled mythic prompt directing the
 * transfiguration into the archetype.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { visualDescription, userImage } = req.body;
    if (!visualDescription || typeof visualDescription !== 'string') {
      return res.status(400).json({ error: 'Missing visualDescription.' });
    }

    const { mimeType, base64 } = parseDataUrl(userImage);
    const parts: any[] = [{ text: visualDescription }];
    if (base64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } });

    const ai = makeClient();

    let finalImage: string | null = null;
    let attempts = 0;
    let lastError: any = null;

    while (attempts < 3 && !finalImage) {
      try {
        const response = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: [{ role: 'user', parts }],
          config: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: IMAGE_ASPECT_RATIO, imageSize: IMAGE_SIZE },
          },
        });
        finalImage = extractImageFromResponse(response);
        if (!finalImage) throw new Error('Flash Image returned no image data.');
      } catch (error: any) {
        lastError = error;
        if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
          attempts++;
          console.warn(`[Manifestation] 429 on ${IMAGE_MODEL}. Attempt ${attempts}/3. Waiting 3s...`);
          await sleep(3000);
          continue;
        }
        throw error;
      }
    }

    if (!finalImage) throw lastError || new Error('Manifestation failed.');

    res.json({ image: finalImage, model: IMAGE_MODEL });
  } catch (error: any) {
    console.error('[Manifestation] Failure:', error);
    res.status(500).json({ error: error.message });
  }
}
