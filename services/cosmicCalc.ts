import { BirthData, CosmicFingerprint } from './types';
import feminineDb from '../jsons/master_feminine_archetypes_db.json';
import masculineDb from '../jsons/master_masculine_archetypes_db.json';

/**
 * THE MATHEMATICAL ENGINE (cosmicCalc.ts)
 * Responsible for deterministic hashing and archetype selection.
 */

/**
 * A robust string hash function.
 * Converts any string into a unique, consistent integer to serve as a seed.
 */
export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Standard Numerology Reduction for Life Path Number calculation.
 * Reduces the birth date down to a single digit or a Master Number (11, 22, 33).
 */
const calculateLifePath = (dateStr: string): number => {
  const digits = dateStr.replace(/\D/g, '');
  if (!digits) return 1;
  let sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return sum;
};

/**
 * Generates the 10-point Cosmic Fingerprint.
 * This data acts as the technical metadata for the AI Lore Synthesis.
 */
export const calculateCosmicFingerprint = (data: BirthData): CosmicFingerprint => {
  const seed = hashString(data.name + data.date + data.time + data.location);

  const humanDesignProfiles = ["1/3", "1/4", "2/4", "2/5", "3/5", "3/6", "4/6", "4/1", "5/1", "5/2", "6/2", "6/3"];
  const animals = ["Wolf", "Bear", "Eagle", "Snake", "Owl", "Jaguar", "Salmon", "Buffalo"];
  const elements = ["Fire", "Earth", "Air", "Water", "Ether"];
  const gifts = ["Clarity", "Innovation", "Compassion", "Transmutation", "Stillness", "Vitality"];
  const kins = ["Red Dragon", "White Wind", "Blue Night", "Yellow Seed", "Red Serpent"];
  const archetypes = ["The Hero", "The Caregiver", "The Explorer", "The Rebel", "The Lover", "The Creator"];
  const planets = ["Saturn", "Jupiter", "Mars", "Venus", "Mercury", "Moon", "Sun"];

  return {
    humanDesignProfile: humanDesignProfiles[seed % humanDesignProfiles.length],
    activeGates: [seed % 64 + 1, (seed * 2) % 64 + 1, (seed * 3) % 64 + 1],
    animalTotem: animals[seed % animals.length],
    elementalClan: elements[seed % elements.length],
    lifePathNumber: calculateLifePath(data.date),
    geneKeyGift: gifts[seed % gifts.length],
    mayanKin: kins[seed % kins.length],
    sunSignArchetype: archetypes[seed % archetypes.length],
    soulNode: "North Node in " + (["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][seed % 12]),
    rulingPlanet: planets[seed % planets.length]
  };
};

/**
 * Vault Selection Logic.
 * Navigates the refined 150-item JSON libraries based on the user's path choice.
 */
export const selectArchetype = (fingerprint: CosmicFingerprint, gender: 'masculine' | 'feminine'): any => {
  // 1. Point to the specific flat array based on gender choice in InputForm
  const vault = gender === 'feminine' ? feminineDb : masculineDb;
  
  if (!vault || vault.length === 0) {
    console.error("The selected Archetype vault is inaccessible or incorrectly formatted.");
    return null;
  }

  // 2. Deterministic Index Calculation.
  // Combines the Life Path, active gate signals, and totem seed to pick one of the 150 archetypes.
  const selectionIndex = (
    fingerprint.lifePathNumber + 
    fingerprint.activeGates.reduce((a, b) => a + b, 0) + 
    hashString(fingerprint.animalTotem)
  ) % vault.length;
  
  // 3. Return the specific archetype object for the Oracle's synthesis.
  return vault[selectionIndex];
};