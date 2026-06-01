import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    imageModel: process.env.MYTHIC_IMAGE_MODEL || 'gemini-2.5-flash-image',
    hasGeminiKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    region: process.env.VERCEL_REGION || null,
    deployment: process.env.VERCEL_DEPLOYMENT_ID || null,
  });
}
