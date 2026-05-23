import React from 'react';
import ReactDOM from 'react-dom/client';
import ShareCard, { ShareLayout } from './components/ShareCard';
import { OracleResult } from './services/types';

// A deliberately "busy" stand-in portrait (bright sky top → worst case for
// gold/white type; saturated figure mid-frame) so we can judge scrim coverage
// and typographic legibility against the real component, with no API cost.
const SAMPLE_PORTRAIT =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6e9c8"/>
      <stop offset="0.45" stop-color="#cdb98a"/>
      <stop offset="1" stop-color="#5c6b4a"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.25" r="0.4">
      <stop offset="0" stop-color="#fff8e0"/>
      <stop offset="1" stop-color="#fff8e0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#sky)"/>
  <rect width="1080" height="1350" fill="url(#sun)"/>
  <!-- pyramid backdrop -->
  <polygon points="540,260 820,900 260,900" fill="#7a6a4a" opacity="0.5"/>
  <!-- feather headdress -->
  <g fill="#2f7d4f" opacity="0.9">
    <ellipse cx="540" cy="430" rx="240" ry="110"/>
    <ellipse cx="540" cy="380" rx="170" ry="90" fill="#3a9b5c"/>
  </g>
  <!-- face -->
  <ellipse cx="540" cy="560" rx="120" ry="150" fill="#c79b76"/>
  <!-- beard -->
  <ellipse cx="540" cy="660" rx="90" ry="70" fill="#8a8a8a"/>
  <!-- feathered cape / torso -->
  <path d="M300 760 Q540 700 780 760 L820 1350 L260 1350 Z" fill="#256a44"/>
  <path d="M360 820 Q540 780 720 820 L740 1350 L340 1350 Z" fill="#2f7d4f"/>
  <!-- jade collar -->
  <ellipse cx="540" cy="780" rx="150" ry="40" fill="#3fae74"/>
</svg>`);

const mockResult: OracleResult = {
  id: 'preview',
  timestamp: Date.now(),
  birthData: { name: 'Alexander Marius Castellanos' } as OracleResult['birthData'],
  fingerprint: {} as OracleResult['fingerprint'],
  archetype: 'Quetzalcoatl',
  profile: '',
  gift: '',
  kin: '',
  totem: '',
  cosmicReadings: { hds: '', gk: '', mayan: '' },
  mythopoeticBrief: {
    descent: '',
    reclamation: '',
    devotion: '',
    visual_attire: '',
    one_liner: 'The Feathered Serpent who carries dawn',
  },
  culture: 'Mesoamerican',
  generatedImage: SAMPLE_PORTRAIT,
};

const params = new URLSearchParams(window.location.search);
const layout = (params.get('layout') as ShareLayout) || 'descent';

const root = ReactDOM.createRoot(document.getElementById('card-root')!);
root.render(<ShareCard result={mockResult} layout={layout} />);

// Signal readiness to the headless renderer once fonts + portrait are settled.
(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 300));
  (window as any).__CARD_READY__ = true;
})();
