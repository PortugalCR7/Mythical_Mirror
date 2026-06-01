import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getArchetype } from './archetypeLoader.js';
import { getMythicCore } from '../mythicTranslator.js';
import { augmentMythicPrompt } from './mythic_gen.js';
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
// Production (Vercel): credentials come from GOOGLE_CREDENTIALS_BASE64 env var
// Local dev: credentials come from GOOGLE_APPLICATION_CREDENTIALS file path
const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.VITE_GCP_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.VITE_GCP_LOCATION || 'us-central1';

if (!project) {
    console.error("ERROR: Google Cloud Project ID is missing.");
    console.error("Please set GOOGLE_CLOUD_PROJECT in Vercel or VITE_GCP_PROJECT_ID in .env.local");
    process.exit(1);
}

let vertexAuthOptions = {};
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    try {
        const credentials = JSON.parse(
            Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
        );
        vertexAuthOptions = { googleAuthOptions: { credentials } };
        console.log("[Auth] Using base64-encoded service account credentials.");
    } catch (e) {
        console.error("[Auth] Failed to parse GOOGLE_CREDENTIALS_BASE64:", e.message);
    }
} else {
    console.log("[Auth] Using GOOGLE_APPLICATION_CREDENTIALS file path.");
}

const vertex_ai = new VertexAI({ project, location, ...vertexAuthOptions });
const generativeModel = vertex_ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
        const { userData } = req.body;
        if (!userData) {
            return res.status(400).json({ error: 'Missing user data.' });
        }
        if (!userData.archetypeRef) {
            return res.status(400).json({ error: 'Missing archetype reference in user data.' });
        }

        const hasBirthData = !!(userData.date && userData.location);
        const userLocation = userData.location ? userData.location.trim() : null;
        const currentContext = userLocation ? `Place of Origin: ${userLocation}.` : null;

        const dynamicInstruction = getOracleDispatch(userData);
        const regionalStory = getRegionalStory(userData.archetypeRef.culture);

        const prompt = `${dynamicInstruction}

        Act as the Mythical Mirror. Your task is to generate a mythopoetic brief for the archetype: "${userData.archetypeRef.name}".
        Base the brief on this birth data: ${JSON.stringify(userData)}.
        
        ${currentContext ? `ENVIRONMENTAL DISPATCH:
        If it feels natural, you may weave the user's geographic origin into the reading:
        ${currentContext}` : ''}

        To ground your narrative, incorporate themes and tones from the following ancient story snippet, which is associated with the archetype's cultural roots.
        <regional_story_snippet>
        ${regionalStory}
        </regional_story_snippet>

        CRITICAL RULES:
        1. ZERO TECHNICALITY: NEVER use terms like "Projector", "Bazi", "Gene Key". Use Mythic equivalents (e.g. "The Orchestrator").
        2. TONE: Ancient, high-mythic, poetic.
        3. LOST SCRIPTURE (Descent): The 'descent' field MUST be a substantial narrative (150-200 words). Use double-line breaks (\n\n) to separate distinct thoughts or stanzas. Dark, subtractive, ancient. Draw the soul's descent from the cosmos into the earthly realm using mythic, universal imagery — not literal place names unless the user's birth location is provided.
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

        const result = await generativeModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.candidates[0].content.parts[0].text;

        // ROBUST JSON EXTRACTION
        let responseJson;
        try {
            // Attempt 1: Direct Parse
            responseJson = JSON.parse(responseText);
        } catch (e1) {
            try {
                // Attempt 2: Extract from Markdown ```json ... ```
                const match = responseText.match(/```json([\s\S]*?)```/);
                if (match) {
                    responseJson = JSON.parse(match[1]);
                } else {
                    // Attempt 3: Find first '{' and last '}'
                    const firstOpen = responseText.indexOf('{');
                    const lastClose = responseText.lastIndexOf('}');
                    if (firstOpen !== -1 && lastClose !== -1) {
                        responseJson = JSON.parse(responseText.substring(firstOpen, lastClose + 1));
                    } else {
                        throw new Error("No JSON structure found.");
                    }
                }
            } catch (e2) {
                console.error("Failed to parse Gemini response:", responseText);
                throw new Error("Gemini returned invalid JSON: " + e2.message);
            }
        }

        // Add hasBirthData to the response
        responseJson.hasBirthData = hasBirthData;
        responseJson.culture = userData.archetypeRef.culture;

        // If birth data is present, inject the full visual prompt
        if (responseJson.hasBirthData) {
            const archetype = getArchetype(responseJson.archetype_name);
            if (archetype) {
                const imageRegionalStory = getRegionalStory(archetype.culture);
                // Using a default tonal core as it's not present in the brief generation
                const tonalCore = "Frequency, communal harmony, and the high-view perspective. Subterranean wisdom and abyssal clarity.";
                responseJson.visual_attire = augmentMythicPrompt(archetype, "the subject", tonalCore, imageRegionalStory);
            }
        }

        res.json(responseJson);

    } catch (error) {
        console.error("[The Oracle] Failure:", error);
        res.status(500).json({ error: error.message || 'The Oracle is silent.' });
    }
});



/**
 * BIOMETRIC UPLINK: Generates Mythic Archetypal Image
 * Uses Gemini 2.0 Flash with IMAGE responseModality — the only image-generation
 * path available via the @google-cloud/vertexai SDK v1.x.
 * (imagen-3.0-fast-001 is NOT accessible via getGenerativeModel — wrong API surface.)
 */
app.post('/api/generate-mythic-image', async (req, res) => {
    try {
        const { userImage, visualDescription } = req.body;

        const base64Image = userImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        // Gemini 2.0 Flash with IMAGE output — supports multimodal input (reference photo)
        const imageModel = vertex_ai.getGenerativeModel({
            model: 'gemini-2.0-flash-preview-image-generation',
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
            }
        });

        let attempts = 0;
        let imageResponse = null;

        // THE PATIENCE LOOP
        while (attempts < 3 && !imageResponse) {
            try {
                imageResponse = await imageModel.generateContent({
                    contents: [{
                        role: 'user',
                        parts: [
                            {
                                text: `Transform this person into their mythic archetypal form. Do not simply overlay symbols on a photo — fully reimagine them as the living embodiment of this archetype. ${visualDescription}. Cinematic, 8K, sacred dramatic lighting, mythic atmosphere. The result should feel like an ancient painting brought to life, not a photo with costume additions.`
                            },
                            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                        ]
                    }]
                });
            } catch (error) {
                if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
                    attempts++;
                    console.warn(`[QUOTA] Rate limit hit. Attempt ${attempts}/3. Waiting 3s...`);
                    await sleep(3000);
                } else {
                    throw error;
                }
            }
        }

        if (!imageResponse) throw new Error("Manifestation timed out.");

        // Find the image part — Gemini image responses embed inlineData in parts
        const parts = imageResponse.response.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

        if (!imagePart) {
            console.error("[Biometric Uplink] No image part found. Parts returned:", JSON.stringify(parts));
            throw new Error("The Oracle returned no image. Model may not support IMAGE modality in this region.");
        }

        const finalImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        res.json({ image: finalImage });

    } catch (error) {
        console.error("[Biometric Uplink] Failure:", error);
        res.status(500).json({ error: error.message });
    }
});

// Only bind to a port in local dev — Vercel invokes the handler directly
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`[Mythical Mirror Backend] Listening on http://localhost:${PORT}`);
    });
}

export default app;
