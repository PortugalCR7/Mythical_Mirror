import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getArchetype } from './archetypeLoader.js';
import { getMythicCore } from '../mythicTranslator.js';
import { augmentMythicPrompt, TRAIT_EXTRACTION_PROMPT } from './mythic_gen.js';
import { getRegionalStory } from './regionalLoader.js';
import { getOracleDispatch } from '../config/dispatch.js';

// Load environment variables from .env.local (if it exists) and .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images

// Initialize Vertex AI
const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.VITE_GCP_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.VITE_GCP_LOCATION || 'us-central1';

if (!project) {
    console.error("ERROR: Google Cloud Project ID is missing.");
    console.error("Please set GOOGLE_CLOUD_PROJECT in .env or VITE_GCP_PROJECT_ID in .env.local");
    process.exit(1);
}

const vertex_ai = new VertexAI({ project: project, location: location });
const generativeModel = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
const visionModel = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

async function extractStructuredTraits(base64Image, mimeType) {
    const result = await visionModel.generateContent({
        contents: [{
            role: 'user',
            parts: [
                { text: TRAIT_EXTRACTION_PROMPT },
                { inlineData: { mimeType, data: base64Image } },
            ],
        }],
        generationConfig: { responseMimeType: 'application/json' },
    });
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseMaybeJson(text);
}

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Online', project: project || 'Pending Config' });
});

// Root Route
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
        const narrativePromise = generativeModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
        });

        const traitsPromise = hasPhoto
            ? extractStructuredTraits(base64, mimeType).catch(err => {
                console.warn('[Biometric Uplink] Trait extraction failed:', err.message);
                return null;
            })
            : Promise.resolve(null);

        const [narrativeResult, physicalTraits] = await Promise.all([narrativePromise, traitsPromise]);

        const responseText = narrativeResult.response.candidates[0].content.parts[0].text;
        const responseJson = parseMaybeJson(responseText);
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



// Primary renderer: Gemini 2.5 Flash Image ("nano-banana") accepts the
// reference photo as input and renders the same person in a new style. This
// is what AI Studio used for the reference portraits. Imagen 3 generate-001
// is text-only and is kept as a degraded fallback only.
const PRIMARY_IMAGE_MODEL = process.env.MYTHIC_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';
const FALLBACK_IMAGE_MODEL = 'imagen-3.0-generate-001';

function extractImageFromResponse(response) {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part?.inlineData?.data && part?.inlineData?.mimeType?.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return null;
}

async function renderWithFlashImage(prompt, base64, mimeType) {
    const model = vertex_ai.getGenerativeModel({ model: PRIMARY_IMAGE_MODEL });
    const parts = [{ text: prompt }];
    if (base64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
    });
    const img = extractImageFromResponse(result.response);
    if (!img) throw new Error('Flash Image returned no image data.');
    return img;
}

async function renderWithImagenFallback(prompt) {
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
 * Feeds the reference photo to Gemini 2.5 Flash Image so the actual face is
 * preserved (true image-to-image), with the assembled mythic prompt directing
 * the transfiguration. Falls back to Imagen 3 text-only if Flash Image fails.
 */
app.post('/api/generate-mythic-image', async (req, res) => {
    try {
        const { visualDescription, userImage } = req.body;
        if (!visualDescription || typeof visualDescription !== 'string') {
            return res.status(400).json({ error: 'Missing visualDescription.' });
        }

        const { mimeType, base64 } = parseDataUrl(userImage);

        let finalImage = null;
        let modelUsed = PRIMARY_IMAGE_MODEL;
        let attempts = 0;
        let lastError = null;

        while (attempts < 3 && !finalImage) {
            try {
                finalImage = await renderWithFlashImage(visualDescription, base64, mimeType);
            } catch (error) {
                lastError = error;
                if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
                    attempts++;
                    console.warn(`[Manifestation] 429 on ${PRIMARY_IMAGE_MODEL}. Attempt ${attempts}/3. Waiting 3s...`);
                    await sleep(3000);
                    continue;
                }
                console.warn(`[Manifestation] ${PRIMARY_IMAGE_MODEL} failed, falling back to ${FALLBACK_IMAGE_MODEL}:`, error.message);
                finalImage = await renderWithImagenFallback(visualDescription);
                modelUsed = FALLBACK_IMAGE_MODEL;
            }
        }

        if (!finalImage) throw lastError || new Error('Manifestation failed.');

        res.json({ image: finalImage, model: modelUsed });

    } catch (error) {
        console.error("[Manifestation] Failure:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[Mythical Mirror Backend] Listening on http://localhost:${PORT}`);
});
