export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMMUNING = 'COMMUNING',
  MANIFESTING = 'MANIFESTING',
  REVEALED = 'REVEALED',
  ERROR = 'ERROR'
}

export interface BirthData {
  name: string;
  date: string;
  time: string;
  location: string;
  gender: 'masculine' | 'feminine';
  image?: string;
}

export interface CosmicFingerprint {
  humanDesignProfile: string;
  activeGates: number[];
  animalTotem: string;
  elementalClan: string;
  lifePathNumber: number;
  geneKeyGift: string;
  mayanKin: string;
  sunSignArchetype: string;
  soulNode: string;
  rulingPlanet: string;
  bazi?: string;
  vedic?: string;
  nakshatra?: string;
  moonSign?: string;
  risingSign?: string;
  latitude?: number;
  longitude?: number;
}

export interface ArchetypeData {
  id: string | number;
  name: string;
  culture: string;
  archetype: string;
  description: string;
}

export interface MythopoeticBrief {
  descent: string;
  reclamation: string;
  devotion: string;
  visual_attire: string;
  one_liner?: string;
  likeness_lore?: string;
}

export interface OracleResult {
  id: string;
  timestamp: number;
  birthData: BirthData;
  fingerprint: CosmicFingerprint;
  archetype: string;
  profile: string;
  gift: string;
  kin: string;
  totem: string;
  cosmicReadings: {
    hds: string;
    gk: string;
    mayan: string;
    soulLevel?: string;
    biometric?: string;
    bazi?: string; // New: 3-sentence mythic reading
    numerology?: string; // New: 3-sentence mythic reading
    vedic?: string; // New: 3-sentence mythic reading
    sunSign?: string; // New: 3-sentence mythic reading
  };
  mythopoeticBrief: MythopoeticBrief;
  generatedImage?: string;
  userImage?: string;
  culture?: string;
}