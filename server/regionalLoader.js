import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping from culture keywords to JSON file names
const cultureToFileMap = {
    'africa': 'africa_mythologies.json',
    'americas': 'americas_mythologies.json',
    'asia': 'asia_mythologies.json',
    'europe': 'europe_mythologies.json',
    'oceania': 'oceania_mythologies.json'
};

const cultureKeywords = {
    'africa': ["egyptian", "yoruba", "kongo", "maasai", "dahomey/vodun", "west african", "malian", "vodou", "vodun"],
    'europe': ["greek", "roman", "norse", "anglo-saxon", "slavic", "irish", "celtic", "baltic", "welsh", "pelasgian", "thracian", "germanic", "british", "macedonian", "frankish", "geatish", "finnish", "finnic", "gaulish", "arthurian", "sumerian"], // Sumerian is West Asian but often grouped with ancient European myth
    'americas': ["navajo", "diné", "inuit", "maya", "aztec", "inca", "andean", "lakota", "hopi", "mexican", "caribbean", "pacific northwest", "pueblo", "cree", "native american"],
    'asia': ["chinese", "japanese", "hindu", "buddhist", "mesopotamian", "persian", "babylonian", "canaanite", "anatolian", "tibetan buddhist", "israelite", "jewish folklore", "vedic", "east asian", "south asian", "west asian", "zoroastrian", "balinese", "filipino", "indonesian", "malay"],
    'oceania': ["polynesian", "aboriginal", "melanesian", "micronesian", "maori", "hawaiian", "samoan", "tongan", "tahitian", "cook islander", "rapa nui", "nauruan"]
};

function getRegionFromCulture(culture) {
    const lowerCulture = culture.toLowerCase();
    for (const region in cultureKeywords) {
        if (cultureKeywords[region].some(keyword => lowerCulture.includes(keyword))) {
            return region;
        }
    }
    return null;
}

export function getRegionalStory(culture) {
    const region = getRegionFromCulture(culture);
    if (!region) {
        console.warn(`[Regional Loader] No region found for culture: ${culture}`);
        return "A tale lost to the ages.";
    }

    const fileName = cultureToFileMap[region];
    const filePath = path.join(__dirname, '../jsons', fileName);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Return a random story snippet from the 'story' array
        const stories = data.story;
        if (stories && stories.length > 0) {
            const randomIndex = Math.floor(Math.random() * stories.length);
            return stories[randomIndex];
        }
        return "A tale whispered only in silence.";
    } catch (error) {
        console.error(`[Regional Loader] Failed to load or parse ${fileName}:`, error);
        return "A tale fragmented by time.";
    }
}
