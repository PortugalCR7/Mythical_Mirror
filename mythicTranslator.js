import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappingPath = path.join(__dirname, 'modality_mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

export const getMythicCore = (techId) => {
  const mapping = mappingData.modalities.find(item => item.tech_id === techId);
  return mapping ? {
    label: mapping.mythic_label,
    core: mapping.tonal_core,
    color: mapping.visual_token
  } : null;
};