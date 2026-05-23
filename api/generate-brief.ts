import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore – JS helpers bundled by Vercel
import { getArchetype } from '../server/archetypeLoader.js';
// @ts-ignore
import { augmentMythicPrompt, TRAIT_EXTRACTION_PROMPT } from '../server/mythic_gen.js';
// @ts-ignore
import { getRegionalStory } from '../server/regionalLoader.js';
// @ts-ignore
import { getOracleDispatch } from '../config/dispatch.js';

const TEXT_MODEL = 'gemini-2.5-flash';

// Free readings allowed per account. Mirror of FREE_READING_LIMIT in
// services/dbService.ts — keep the two in sync.
const FREE_READING_LIMIT = 3;

/**
 * Enforces the per-account free-reading gate using the caller's Supabase JWT.
 * RLS scopes the count to the user's own rows. Returns an error response to
 * send, or null to proceed.
 */
async function enforceReadingLimit(req: VercelRequest, res: VercelResponse) {
  // The gate ships dormant — only enforce when explicitly switched on.
  if (process.env.VITE_RATE_LIMIT_ENABLED !== 'true') return null;

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null; // Supabase not configured — skip the gate.

  const sb = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: auth, error: authErr } = await sb.auth.getUser();
  if (authErr || !auth?.user) return res.status(401).json({ error: 'Invalid session.' });

  // Permanent unlimited lane (admins / testers) survives even when the gate is on.
  const unlimitedEmails = (process.env.VITE_RATE_LIMIT_UNLIMITED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (auth.user.email && unlimitedEmails.includes(auth.user.email.toLowerCase())) return null;

  const { count, error: countErr } = await sb
    .from('readings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id);
  if (countErr) return null; // Don't hard-fail generation on a count hiccup.

  if ((count ?? 0) >= FREE_READING_LIMIT) {
    return res.status(429).json({
      error: `You've reached your ${FREE_READING_LIMIT} free readings.`,
      limitReached: true,
    });
  }
  return null;
}

function makeClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
}

function parseMaybeJson(text: string): any {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```json([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    try { return JSON.parse(text.substring(first, last + 1)); } catch {}
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const limitResponse = await enforceReadingLimit(req, res);
    if (limitResponse) return limitResponse;

    const { userData, userImage } = req.body;
    if (!userData) return res.status(400).json({ error: 'Missing user data.' });
    if (!userData.archetypeRef) return res.status(400).json({ error: 'Missing archetype reference in user data.' });

    const hasBirthData = !!(userData.date && userData.location);
    const photoMatch = typeof userImage === 'string'
      ? userImage.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/)
      : null;
    const photoMimeType = photoMatch ? photoMatch[1] : '';
    const photoBase64 = photoMatch ? photoMatch[2] : '';
    const hasPhoto = !!photoBase64;

    const MYTHIC_ENV_CURRENT = process.env.MYTHIC_ENV_CURRENT || 'The lush, salt-mist jungle of Nosara, Costa Rica';
    const MYTHIC_ENV_ANCHOR = process.env.MYTHIC_ENV_ANCHOR || 'The limestone, dry-creek bedrock of Austin, Texas';
    const currentContext = `Present Realm: ${MYTHIC_ENV_CURRENT}. Ancestral Anchor: ${MYTHIC_ENV_ANCHOR}.`;

    const dynamicInstruction = getOracleDispatch(userData);
    const regionalStory = getRegionalStory(userData.archetypeRef.culture);

    const prompt = `${dynamicInstruction}

        Act as the Mythical Mirror. Your task is to generate a mythopoetic brief for the archetype: "${userData.archetypeRef.name}".
        Base the brief on this birth data: ${JSON.stringify(userData)}.

        ENVIRONMENTAL DISPATCH:
        Weave this atmospheric context into the reading where appropriate (grounding the user in their current reality and ancestral roots):
        ${currentContext}

        To ground your narrative, incorporate themes and tones from the following ancient story snippet, which is associated with the archetype's cultural roots.
        <regional_story_snippet>
        ${regionalStory}
        </regional_story_snippet>

        CRITICAL RULES:
        1. ZERO TECHNICALITY: NEVER use terms like "Projector", "Bazi", "Gene Key". Use Mythic equivalents (e.g. "The Orchestrator").
        2. TONE: Ancient, high-mythic, poetic.
        3. LOST SCRIPTURE (Descent): The 'descent' field MUST be a substantial narrative (150-200 words). Use double-line breaks (\\n\\n) to separate distinct thoughts or stanzas. Dark, subtractive, ancient. YOU MUST WEAVE the 'Environmental Dispatch' locations (Current Realm & Ancestral Anchor) into this origin story, describing how the soul fell from the stars into these specific earthly terrains.
        4. LIKENESS LORE: If a photo or description is provided, interpret the subject's features as an "Architectural Covenant". LIMIT TO 20 WORDS MAX. Format as a subtle, italicized bridge.

        DATA POINTS & MYTHIC BRIDGE:
        - VEDIC CALIBRATION: The 'Nakshatra' (Lunar Mansion) is the primary Vedic anchor. If the user's data is missing or 'N/A', assume a "Noon-Standard" calculation to determine the likely Nakshatra. NEVER return 'N/A' or 'Unknown'. Always provide a full mythic reading.
        - DYNAMIC NUMEROLOGY (Life Path): Explain HOW this specific vibration empowers the primary Archetype. Do not just list the number.
        - BAZI ELEVATION (Mythic Emissary): Transform the Pillar (e.g. 'Water Pig') into a "Mythic Emissary". Focus on the dynamic interaction between the Element and the Animal.
        - SUN SIGN DEPTH (Solar Hearth): Interpret the Western Sun Sign as the "Solar Hearth" - the fuel that burns within to power the Archetype.
        - EARTH MEDICINE: Focus on "Mythic Traits" of the Totem Animal (Spirit's journey).

        CRITICAL CONSTRAINT - LENGTH & DEPTH:
        - The 'cosmic_readings' fields (hds, gk, mayan, soulLevel, etc.) must EACH be EXACTLY 3 SENTENCES.
        - This provides a consistent "Visual Rhythm" to the Ledger.
        - Use "Mythic Reasoning" to bridge technical data into the narrative.

        MYTHIC SYNTHESIS TEMPLATES (TONAL BENCHMARK):
        1. "You are not meant to toil in the fields, but to stand upon the hill and see how the rivers should flow." (The Orchestrator)
        2. "Deep within the obsidian depths, a vast wisdom remains unperturbed by the surface winds." (The Reservoir)

        USER CONTEXT:
        - If residency is provided, weave "Environmental Cues" (e.g., Austin -> dry heat, stone, rivers) into the narrative.

        Return a JSON object with this exact structure, ensuring 'archetype_name' is ALWAYS "${userData.archetypeRef.name}":
        {
          "archetype_name": "${userData.archetypeRef.name}",
          "anchor": "A short profile/anchor text",
          "gift": "The primary gift/talent (Mythic terminology only)",
          "kin": "Mayan Kin or similar identifier (Mythic terminology only)",
          "totem": "Animal Totem",
          "cosmic_readings": {
            "hds": "Human Design reading (Mythic translation - EXACTLY 3 SENTENCES)",
            "gk": "Gene Keys reading (Mythic translation - EXACTLY 3 SENTENCES)",
            "mayan": "Mayan reading (Mythic translation - EXACTLY 3 SENTENCES)",
            "soulLevel": "Soul Level Astrology reading (EXACTLY 3 SENTENCES, mention specific placement)",
            "biometric": "Biometric Synthesis reading (EXACTLY 3 SENTENCES)",
            "bazi": "Bazi Mythic Emissary reading (EXACTLY 3 SENTENCES, explain Element + Animal dynamic)",
            "numerology": "Numerology Life Path reading (EXACTLY 3 SENTENCES, focus on empowerment)",
            "vedic": "Vedic Nakshatra reading (EXACTLY 3 SENTENCES, mention the Nakshatra name)",
            "sunSign": "Sun Sign Solar Hearth reading (EXACTLY 3 SENTENCES, how it fuels the archetype)"
          },
          "descent": "LOST SCRIPTURE: [Insert 150+ words. CRITICAL: Use the ESCAPED string '\\\\n\\\\n' for line breaks. Do NOT use actual line breaks in the JSON value.]",
          "reclamation": "The Reclamation (Advice) - Actionable insight",
          "devotion": "The Devotion (Ritual) - Mantra/Closing",
          "likeness_lore": "ARCHITECTURAL COVENANT: Poetic interpretation of facial features (MAX 20 WORDS).",
          "visual_attire": "A 1-sentence visual description for a tarot portrait",
          "one_liner": "A single, punchy quotable sentence summing up their essence"
        }`;

    const ai = makeClient();

    // Fan out narrative + vision-trait extraction in parallel.
    const narrativePromise = ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const traitsPromise: Promise<any> = hasPhoto
      ? ai.models.generateContent({
          model: TEXT_MODEL,
          contents: [{
            role: 'user',
            parts: [
              { text: TRAIT_EXTRACTION_PROMPT },
              { inlineData: { mimeType: photoMimeType, data: photoBase64 } },
            ],
          }],
          config: { responseMimeType: 'application/json' },
        }).then(r => parseMaybeJson(r.text || ''))
          .catch((err: any) => {
            console.warn('[Biometric Uplink] Trait extraction failed:', err.message);
            return null;
          })
      : Promise.resolve(null);

    const [narrativeResponse, physicalTraits] = await Promise.all([narrativePromise, traitsPromise]);

    const responseJson = parseMaybeJson(narrativeResponse.text || '');
    if (!responseJson) {
      console.error('Failed to parse Gemini response:', narrativeResponse.text);
      throw new Error('Gemini returned invalid JSON.');
    }

    responseJson.hasBirthData = hasBirthData;
    responseJson.culture = userData.archetypeRef.culture;
    responseJson.physical_traits = physicalTraits;

    if (responseJson.hasBirthData) {
      const archetype = getArchetype(responseJson.archetype_name);
      if (archetype) {
        const imageRegionalStory = getRegionalStory(archetype.culture);
        const tonalCore = 'Frequency, communal harmony, and the high-view perspective. Subterranean wisdom and abyssal clarity.';
        responseJson.visual_attire = augmentMythicPrompt(archetype, 'the subject', tonalCore, imageRegionalStory, physicalTraits);
      }
    }

    res.json(responseJson);
  } catch (error: any) {
    console.error('[The Oracle] Failure:', error);
    res.status(500).json({ error: error.message || 'The Oracle is silent.' });
  }
}
