import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getArchetype } from './archetypeLoader.js';
import { getMythicCore } from '../mythicTranslator.js';
import { augmentMythicPrompt, TRAIT_EXTRACTION_PROMPT } from './mythic_gen.js';
import { getRegionalStory } from './regionalLoader.js';
import { getOracleDispatch } from '../config/dispatch.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is not set. Add it to .env or .env.local.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = process.env.MYTHIC_IMAGE_MODEL || 'gemini-2.5-flash-image';

function parseMaybeJson(text) {
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

function parseDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') return { mimeType: '', base64: '' };
    const match = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
    if (!match) return { mimeType: '', base64: '' };
    return { mimeType: match[1], base64: match[2] };
}

function extractImageFromResponse(response) {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part?.inlineData?.data && part?.inlineData?.mimeType?.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return null;
}

async function extractStructuredTraits(base64Image, mimeType) {
    const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [{
            role: 'user',
            parts: [
                { text: TRAIT_EXTRACTION_PROMPT },
                { inlineData: { mimeType, data: base64Image } },
            ],
        }],
        config: { responseMimeType: 'application/json' },
    });
    return parseMaybeJson(response.text || '');
}

// --- ROUTES ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'Online', textModel: TEXT_MODEL, imageModel: IMAGE_MODEL });
});

app.get('/', (req, res) => {
    res.send('The Mythical Mirror API is Online. Use /api/generate-brief for requests.');
});


// ... (existing imports)

/**
 * THE ORACLE: Generates the Mythopoetic Brief (Text)
 */
app.post('/api/generate-brief', async (req, res) => {
    try {
        const { userData, userImage } = req.body;
        if (!userData) {
            return res.status(400).json({ error: 'Missing user data.' });
        }
        if (!userData.archetypeRef) {
            return res.status(400).json({ error: 'Missing archetype reference in user data.' });
        }

        const hasBirthData = !!(userData.date && userData.location);
        const { mimeType, base64 } = parseDataUrl(userImage);
        const hasPhoto = !!base64;
        const MYTHIC_ENV_CURRENT = process.env.MYTHIC_ENV_CURRENT || "The lush, salt-mist jungle of Nosara, Costa Rica";
        const MYTHIC_ENV_ANCHOR = process.env.MYTHIC_ENV_ANCHOR || "The limestone, dry-creek bedrock of Austin, Texas";
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
        3. LOST SCRIPTURE (Descent): The 'descent' field MUST be a substantial narrative (150-200 words). Use double-line breaks (\n\n) to separate distinct thoughts or stanzas. Dark, subtractive, ancient. YOU MUST WEAVE the 'Environmental Dispatch' locations (Current Realm & Ancestral Anchor) into this origin story, describing how the soul fell from the stars into these specific earthly terrains.
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
          "descent": "LOST SCRIPTURE: [Insert 150+ words. CRITICAL: Use the ESCAPED string '\\n\\n' for line breaks. Do NOT use actual line breaks in the JSON value.]",
          "reclamation": "The Reclamation (Advice) - Actionable insight",
          "devotion": "The Devotion (Ritual) - Mantra/Closing",
          "likeness_lore": "ARCHITECTURAL COVENANT: Poetic interpretation of facial features (MAX 20 WORDS).",
          "visual_attire": "A 1-sentence visual description for a tarot portrait",
          "one_liner": "A single, punchy quotable sentence summing up their essence"
        }`;

        // Fan out: narrative generation and (if a photo is provided) vision-based
        // trait extraction run in parallel on gemini-2.5-flash. The vision call
        // used to happen serially inside /api/generate-mythic-image; hoisting it
        // here removes a round-trip from the user-perceived MANIFESTING stage and
        // lets the brief assemble a likeness-locked Imagen prompt up front.
        const narrativePromise = ai.models.generateContent({
            model: TEXT_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" },
        });

        const traitsPromise = hasPhoto
            ? extractStructuredTraits(base64, mimeType).catch(err => {
                console.warn('[Biometric Uplink] Trait extraction failed:', err.message);
                return null;
            })
            : Promise.resolve(null);

        const [narrativeResponse, physicalTraits] = await Promise.all([narrativePromise, traitsPromise]);

        const responseJson = parseMaybeJson(narrativeResponse.text || '');
        if (!responseJson) {
            console.error("Failed to parse Gemini response:", responseText);
            throw new Error("Gemini returned invalid JSON.");
        }

        responseJson.hasBirthData = hasBirthData;
        responseJson.culture = userData.archetypeRef.culture;
        responseJson.physical_traits = physicalTraits;

        // Assemble the final Imagen prompt with the structured likeness baked in.
        // The image endpoint becomes a thin Imagen renderer with no Vision call.
        if (responseJson.hasBirthData) {
            const archetype = getArchetype(responseJson.archetype_name);
            if (archetype) {
                const imageRegionalStory = getRegionalStory(archetype.culture);
                const tonalCore = "Frequency, communal harmony, and the high-view perspective. Subterranean wisdom and abyssal clarity.";
                responseJson.visual_attire = augmentMythicPrompt(archetype, "the subject", tonalCore, imageRegionalStory, physicalTraits);
            }
        }

        res.json(responseJson);

    } catch (error) {
        console.error("[The Oracle] Failure:", error);
        res.status(500).json({ error: error.message || 'The Oracle is silent.' });
    }
});



/**
 * MANIFESTATION: Renders the mythic portrait via Gemini 2.5 Flash Image.
 * Feeds the reference photo so the actual face is preserved (true
 * image-to-image), with the assembled mythic prompt directing the
 * transfiguration into the archetype.
 */
app.post('/api/generate-mythic-image', async (req, res) => {
    try {
        const { visualDescription, userImage } = req.body;
        if (!visualDescription || typeof visualDescription !== 'string') {
            return res.status(400).json({ error: 'Missing visualDescription.' });
        }

        const { mimeType, base64 } = parseDataUrl(userImage);
        const parts = [{ text: visualDescription }];
        if (base64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } });

        let finalImage = null;
        let attempts = 0;
        let lastError = null;

        while (attempts < 3 && !finalImage) {
            try {
                const response = await ai.models.generateContent({
                    model: IMAGE_MODEL,
                    contents: [{ role: 'user', parts }],
                    config: { responseModalities: ['IMAGE'] },
                });
                finalImage = extractImageFromResponse(response);
                if (!finalImage) throw new Error('Flash Image returned no image data.');
            } catch (error) {
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

    } catch (error) {
        console.error("[Manifestation] Failure:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[Mythical Mirror Backend] Listening on http://localhost:${PORT}`);
});
