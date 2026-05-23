import { supabase } from './supabaseClient';
import { OracleResult } from './types';

/**
 * THE MEMORY VAULT — Supabase edition.
 * Readings live in the `readings` table (RLS-scoped to auth.uid()).
 * Generated portraits live in the private `portraits` bucket at
 * `{user_id}/{reading_id}.{ext}`. User reference photos are NOT stored.
 */

const BUCKET = 'portraits';

// Free readings allowed per account before the monetization gate.
// Mirror this value in api/generate-brief.ts (server-side enforcement).
export const FREE_READING_LIMIT = 3;

// The gate ships dormant. It only activates when VITE_RATE_LIMIT_ENABLED is
// 'true'; until then every account is unlimited (the testing lane). Emails in
// VITE_RATE_LIMIT_UNLIMITED_EMAILS stay unlimited even after the gate is on.
export const RATE_LIMIT_ENABLED = import.meta.env.VITE_RATE_LIMIT_ENABLED === 'true';

const UNLIMITED_EMAILS = (import.meta.env.VITE_RATE_LIMIT_UNLIMITED_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export function isUnlimited(email?: string | null): boolean {
  if (!RATE_LIMIT_ENABLED) return true;
  return !!(email && UNLIMITED_EMAILS.includes(email.toLowerCase()));
}

export const getReadingCount = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from('readings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (error) {
    console.error('[Vault] Count error:', error);
    return 0;
  }
  return count ?? 0;
};

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
  if (!m) throw new Error('Invalid portrait data URL');
  const mime = m[1];
  const bytes = atob(m[2]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  return { blob: new Blob([arr], { type: mime }), ext };
}

async function uploadPortrait(userId: string, readingId: string, dataUrl: string): Promise<string> {
  const { blob, ext } = dataUrlToBlob(dataUrl);
  const path = `${userId}/${readingId}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    upsert: true,
  });
  if (error) throw error;
  return path;
}

async function signedPortraitUrl(path: string): Promise<string | undefined> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error || !data) return undefined;
  return data.signedUrl;
}

export const saveReading = async (reading: OracleResult): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let portraitPath: string | null = null;
  if (reading.generatedImage?.startsWith('data:image')) {
    portraitPath = await uploadPortrait(user.id, reading.id, reading.generatedImage);
  }

  // Strip the user reference photo — explicit decision: don't store it.
  const { image: _stripped, ...birthDataSanitized } = reading.birthData;

  const { error } = await supabase.from('readings').insert({
    id: reading.id,
    user_id: user.id,
    created_at: new Date(reading.timestamp).toISOString(),
    birth_data: birthDataSanitized,
    fingerprint: reading.fingerprint,
    archetype: reading.archetype,
    profile: reading.profile,
    gift: reading.gift,
    kin: reading.kin,
    totem: reading.totem,
    cosmic_readings: reading.cosmicReadings,
    mythopoetic_brief: reading.mythopoeticBrief,
    culture: reading.culture ?? null,
    portrait_path: portraitPath,
  });
  if (error) throw error;
};

export const getAllReadings = async (): Promise<OracleResult[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Vault] History retrieval error:', error);
    return [];
  }

  return Promise.all(
    (data ?? []).map(async (r: any) => {
      const portrait = r.portrait_path ? await signedPortraitUrl(r.portrait_path) : undefined;
      return {
        id: r.id,
        timestamp: new Date(r.created_at).getTime(),
        birthData: r.birth_data,
        fingerprint: r.fingerprint,
        archetype: r.archetype,
        profile: r.profile,
        gift: r.gift,
        kin: r.kin,
        totem: r.totem,
        cosmicReadings: r.cosmic_readings,
        mythopoeticBrief: r.mythopoetic_brief,
        culture: r.culture ?? undefined,
        generatedImage: portrait,
      } as OracleResult;
    })
  );
};

export const deleteReading = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: list } = await supabase.storage.from(BUCKET).list(user.id);
  const toDelete = (list ?? [])
    .filter((f) => f.name.startsWith(id + '.'))
    .map((f) => `${user.id}/${f.name}`);
  if (toDelete.length) await supabase.storage.from(BUCKET).remove(toDelete);

  const { error } = await supabase
    .from('readings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
};
