/**
 * @file config/dispatch.js
 * @description Determines the Oracle's depth based on incoming data presence.
 */

import { SYSTEM_INSTRUCTION } from './settings.js';

/**
 * Generates the specific system prompt based on user data.
 * @param {Object} userData - Contains birth_date, birth_time, etc.
 * @returns {string} - The targeted System Prompt.
 */
export function getOracleDispatch(userData) {
  // Use 'date' and 'location' from form, not birth_date/birth_location
  const hasBirthData = userData && userData.date && userData.location;

  if (hasBirthData) {
    return `
      ${SYSTEM_INSTRUCTION}
      CURRENT PHASE: THE FINAL DESCENT.
      The birth coordinates have been struck. Transition from general guidance to the 
      FULL ARCHETYPAL REVEAL. Your primary focus is now the specific mythic figure 
      and the 'Identity Realized' synthesis.
    `;
  }

  return `
    ${SYSTEM_INSTRUCTION}
    CURRENT PHASE: ABYSSAL CLARITY.
    No birth coordinates provided. Focus exclusively on the MODALITY LEXICON. 
    Speak as the 'Orchestrator of the Deep' to reveal the tonal core of their 
    Human Design and Bazi technicalities.
  `;
}