import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to JSON databases (assuming server/ is one level deep)
const BASE_DIR = path.join(__dirname, '..');
const FEMININE_DB_PATH = path.join(BASE_DIR, 'jsons', 'master_feminine_archetypes_db.json');
const MASCULINE_DB_PATH = path.join(BASE_DIR, 'jsons', 'master_masculine_archetypes_db.json');

let archetypes = {};

/**
 * Loads and processes archetype databases.
 */
const loadDatabases = () => {
    try {
        const loadFile = (filePath) => {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                data.forEach(processEntry);
            } else {
                console.warn(`[ArchetypeLoader] Warning: Database file not found at ${filePath}`);
            }
        };

        loadFile(FEMININE_DB_PATH);
        loadFile(MASCULINE_DB_PATH);

        console.log(`[ArchetypeLoader] Loaded ${Object.keys(archetypes).length} archetypes.`);
    } catch (error) {
        console.error("[ArchetypeLoader] Error loading databases:", error);
    }
};

/**
 * Processes a single archetype entry, enriching with missing fields.
 * @param {Object} entry 
 */
const processEntry = (entry) => {
    if (!entry.name) return;

    const key = entry.name.toLowerCase();

    // Enrichment: Mythic Motif
    if (!entry.mythic_motif) {
        const desc = entry.description || "";
        // Extract first sentence or use fallback
        const dotIndex = desc.indexOf('.');
        if (dotIndex !== -1) {
            entry.mythic_motif = desc.substring(0, dotIndex).trim();
        } else {
            entry.mythic_motif = desc || "Ancient and ethereal presence";
        }
    }

    // Enrichment: Image Path
    if (!entry.image_path) {
        const safeName = entry.name.toLowerCase().replace(/ /g, '_');
        // Relative path from project root for frontend/API usage
        entry.image_path = `./images/archetypes/${safeName}.jpg`;
    }

    archetypes[key] = entry;
};

// Initialize on load
loadDatabases();

/**
 * Retrieves an archetype by name (case-insensitive).
 * @param {string} name 
 * @returns {Object|null}
 */
export const getArchetype = (name) => {
    if (!name) return null;
    return archetypes[name.toLowerCase()] || null;
};
