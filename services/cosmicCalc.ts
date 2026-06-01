import { BirthData, CosmicFingerprint } from './types';
import feminineDb from '../jsons/master_feminine_archetypes_db.json';
import masculineDb from '../jsons/master_masculine_archetypes_db.json';

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

export const calculateCosmicFingerprint = (data: BirthData): CosmicFingerprint => {
  const seed = hashString(data.name + data.date + data.time + data.location);
  const birthYear = new Date(data.date).getFullYear();

  // Kept pseudo-random — these require astronomical computation (moon/planetary positions):
  const humanDesignProfiles = ["1/3", "1/4", "2/4", "2/5", "3/5", "3/6", "4/6", "4/1", "5/1", "5/2", "6/2", "6/3"];
  const animals = ["Wolf", "Bear", "Eagle", "Snake", "Owl", "Jaguar", "Salmon", "Buffalo"];
  const elements = ["Fire", "Earth", "Air", "Water", "Ether"];
  const gifts = ["Clarity", "Innovation", "Compassion", "Transmutation", "Stillness", "Vitality"];
  const planets = ["Saturn", "Jupiter", "Mars", "Venus", "Mercury", "Moon", "Sun"];
  const nodes = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  return {
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
