import { supabase } from './supabaseClient';
import { OracleResult } from './types';

export const saveReading = async (reading: OracleResult): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('readings').upsert({
    id: reading.id,
    user_id: user.id,
    birth_data: reading.birthData,
    fingerprint: reading.fingerprint,
    archetype: reading.archetype,
    profile: reading.profile,
    gift: reading.gift,
    kin: reading.kin,
    totem: reading.totem,
    cosmic_readings: reading.cosmicReadings,
    mythopoetic_brief: reading.mythopoeticBrief,
    generated_image: reading.generatedImage,
    culture: reading.culture,
  });

  if (error) console.error('[Vault] Save error:', error);
  else console.log(`[Vault] Revelation ${reading.id} secured.`);
};

export const getAllReadings = async (): Promise<OracleResult[]> => {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Vault] Retrieval error:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    timestamp: new Date(row.created_at).getTime(),
    birthData: row.birth_data,
    fingerprint: row.fingerprint,
    archetype: row.archetype,
    profile: row.profile,
    gift: row.gift,
    kin: row.kin,
    totem: row.totem,
    cosmicReadings: row.cosmic_readings,
    mythopoeticBrief: row.mythopoetic_brief,
    generatedImage: row.generated_image,
    culture: row.culture,
  }));
};

export const deleteReading = async (id: string): Promise<void> => {
  const { error } = await supabase.from('readings').delete().eq('id', id);
  if (error) console.error('[Vault] Delete error:', error);
};
