import { BirthData, CosmicFingerprint } from './types';
import feminineDb from '../jsons/master_feminine_archetypes_db.json';
import masculineDb from '../jsons/master_masculine_archetypes_db.json';
import { SiderealTime, SunPosition, EclipticGeoMoon } from 'astronomy-engine';

const TROPICAL_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// 27 lunar mansions of sidereal (Vedic) astrology.
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Traditional (domicile) rulers — the classic chart-ruler mapping.
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const norm360 = (deg: number): number => ((deg % 360) + 360) % 360;
const rad = (deg: number): number => (deg * Math.PI) / 180;
const deg = (r: number): number => (r * 180) / Math.PI;
const signFromLongitude = (lon: number): string => TROPICAL_SIGNS[Math.floor(norm360(lon) / 30)];

interface GeoResult { latitude: number; longitude: number; timezone: string; }

// Keyless, CORS-friendly geocoding (Open-Meteo) → coordinates + IANA timezone.
const geocode = async (location: string): Promise<GeoResult | null> => {
  const name = location.split(',')[0].trim();
  if (!name) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const hit = json?.results?.[0];
  if (!hit || typeof hit.latitude !== 'number' || typeof hit.longitude !== 'number') return null;
  return { latitude: hit.latitude, longitude: hit.longitude, timezone: hit.timezone || 'UTC' };
};

// Offset (minutes) of an IANA timezone at a given UTC instant, via Intl.
const tzOffsetMinutes = (utcMillis: number, timeZone: string): number => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts: Record<string, number> = {};
  for (const p of dtf.formatToParts(new Date(utcMillis))) {
    if (p.type !== 'literal') parts[p.type] = parseInt(p.value, 10);
  }
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second);
  return Math.round((asUTC - utcMillis) / 60000);
};

// Local wall-clock birth time (in the birthplace's timezone) → real UTC Date.
const wallTimeToUtc = (dateStr: string, timeStr: string, timeZone: string): Date => {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = (timeStr || '12:00').split(':').map(Number);
  const naiveUTC = Date.UTC(y, mo - 1, d, h || 0, mi || 0);
  // One correction pass resolves the offset (good except at the DST cusp).
  const offset = tzOffsetMinutes(naiveUTC, timeZone);
  return new Date(naiveUTC - offset * 60000);
};

// Mean obliquity of the ecliptic (degrees) — Laskar/Meeus polynomial.
const meanObliquity = (date: Date): number => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  return 23.4392911 - 0.0130041667 * t - 1.6e-7 * t * t + 5.04e-7 * t * t * t;
};

// Lahiri ayanāṃśa (degrees) — linear precession from the J2000 anchor (~23.853°).
const lahiriAyanamsa = (date: Date): number => {
  const year = date.getUTCFullYear() + date.getUTCMonth() / 12;
  return 23.853 + 0.0139552 * (year - 2000);
};

// Ascendant ecliptic longitude (degrees) from RAMC, obliquity, geographic latitude.
const ascendantLongitude = (ramcDeg: number, epsDeg: number, latDeg: number): number => {
  const ramc = rad(ramcDeg), eps = rad(epsDeg), lat = rad(latDeg);
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
  );
  return norm360(deg(asc));
};

export interface AstroPlacements {
  moonSign: string;
  risingSign: string;
  nakshatra: string;
  rulingPlanet: string;
  latitude: number;
  longitude: number;
}

// Real ephemeris-derived placements. Throws on geocode/parse failure so the
// caller can fall back to the legacy hash-based values.
const computeAstroPlacements = async (data: BirthData): Promise<AstroPlacements> => {
  const geo = await geocode(data.location);
  if (!geo) throw new Error('Geocoding failed for ' + data.location);

  const utc = wallTimeToUtc(data.date, data.time, geo.timezone);
  if (Number.isNaN(utc.getTime())) throw new Error('Invalid birth date/time');

  const moonLon = norm360(EclipticGeoMoon(utc).lon);
  const moonSign = signFromLongitude(moonLon);

  const moonSidereal = norm360(moonLon - lahiriAyanamsa(utc));
  const nakIndex = Math.floor(moonSidereal / (360 / 27)) % 27;
  const pada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1;
  const nakshatra = `${NAKSHATRAS[nakIndex]} (Pada ${pada})`;

  const gastHours = SiderealTime(utc);
  const ramc = norm360((gastHours + geo.longitude / 15) * 15);
  const risingSign = signFromLongitude(ascendantLongitude(ramc, meanObliquity(utc), geo.latitude));

  return {
    moonSign,
    risingSign,
    nakshatra,
    rulingPlanet: SIGN_RULERS[risingSign],
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
};

export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const calculateLifePath = (dateStr: string): number => {
  const digits = dateStr.replace(/\D/g, '');
  if (!digits) return 1;
  let sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return sum;
};

// Real sun sign from birth date — simple date range calculation
const getSunSign = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

// Real Mayan Tzolkin — 260-day calendar combining 20 Day Signs × 13 Tone Numbers.
// Reference anchor: Aug 11, 1999 = 1 Imix (GMT correlation)
const getMayanTzolkin = (dateStr: string): string => {
  const DAY_SIGNS = [
    'Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat',
    'Muluk', 'Ok', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban',
    'Etznab', 'Cauac', 'Ahau'
  ];
  const ref = new Date('1999-08-11'); // 1 Imix
  const target = new Date(dateStr);
  const days = Math.round((target.getTime() - ref.getTime()) / 86400000);
  const signIndex = ((days % 20) + 20) % 20;
  const tone = (((days % 13) + 13) % 13) + 1;
  return `${tone} ${DAY_SIGNS[signIndex]}`;
};

// Real Bazi Year Pillar — 60-year stem/branch cycle.
// 1984 = Jia Zi (stem 0, branch 0). Formula anchored to 4 CE = Jia Zi.
const getBaziYearPillar = (year: number): string => {
  const ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
  const BRANCHES = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const branchIndex = ((year - 4) % 12 + 12) % 12;
  return `${ELEMENTS[stemIndex]} ${BRANCHES[branchIndex]}`;
};

export const calculateCosmicFingerprint = async (data: BirthData): Promise<CosmicFingerprint> => {
  const seed = hashString(data.name + data.date + data.time + data.location);
  const birthYear = new Date(data.date).getFullYear();

  // Esoteric systems with no direct ephemeris mapping — kept hash-derived:
  const humanDesignProfiles = ["1/3", "1/4", "2/4", "2/5", "3/5", "3/6", "4/6", "4/1", "5/1", "5/2", "6/2", "6/3"];
  const animals = ["Wolf", "Bear", "Eagle", "Snake", "Owl", "Jaguar", "Salmon", "Buffalo"];
  const elements = ["Fire", "Earth", "Air", "Water", "Ether"];
  const gifts = ["Clarity", "Innovation", "Compassion", "Transmutation", "Stillness", "Vitality"];
  const planets = ["Saturn", "Jupiter", "Mars", "Venus", "Mercury", "Moon", "Sun"];
  const nodes = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  const fingerprint: CosmicFingerprint = {
    humanDesignProfile: humanDesignProfiles[seed % humanDesignProfiles.length],
    activeGates: [seed % 64 + 1, (seed * 2) % 64 + 1, (seed * 3) % 64 + 1],
    animalTotem: animals[seed % animals.length],
    elementalClan: elements[seed % elements.length],
    lifePathNumber: calculateLifePath(data.date),
    geneKeyGift: gifts[seed % gifts.length],
    mayanKin: getMayanTzolkin(data.date),
    sunSignArchetype: getSunSign(data.date),
    soulNode: "North Node in " + nodes[seed % 12],
    rulingPlanet: planets[seed % planets.length],
    bazi: getBaziYearPillar(birthYear),
  };

  // Real ephemeris placements (Moon sign, Nakshatra, Rising sign, chart ruler).
  // On any failure (bad city, geocoding/network down) fall back to the hash
  // values above so a reading is always produced.
  try {
    const astro = await computeAstroPlacements(data);
    fingerprint.moonSign = astro.moonSign;
    fingerprint.risingSign = astro.risingSign;
    fingerprint.nakshatra = astro.nakshatra;
    fingerprint.vedic = astro.nakshatra;
    fingerprint.rulingPlanet = astro.rulingPlanet;
    fingerprint.latitude = astro.latitude;
    fingerprint.longitude = astro.longitude;
  } catch (err) {
    console.warn('[Cosmic] Astronomical calculation failed, using hash fallback:', err);
  }

  return fingerprint;
};

export const selectArchetype = (fingerprint: CosmicFingerprint, gender: 'masculine' | 'feminine'): any => {
  const vault = gender === 'feminine' ? feminineDb : masculineDb;

  if (!vault || vault.length === 0) {
    console.error("The selected Archetype vault is inaccessible or incorrectly formatted.");
    return null;
  }

  const selectionIndex = (
    fingerprint.lifePathNumber +
    fingerprint.activeGates.reduce((a, b) => a + b, 0) +
    hashString(fingerprint.animalTotem)
  ) % vault.length;

  return vault[selectionIndex];
};
