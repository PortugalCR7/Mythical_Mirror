# The Mythical Mirror — Project Brief

## What this is
A mythic oracle web app. Users enter birth data + photo → the app calculates a cosmic fingerprint → Gemini 2.5 Flash generates a mythopoetic narrative → Imagen 3 paints them as their matched archetype from a 150-entry cultural mythology database.

## Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express server (`server/server.js`) on port 5001, proxied by Vite in dev
- **AI**: Vertex AI — `gemini-2.5-flash` for narrative, `imagen-3.0-generate-001` for portraits
- **Data**: 150 feminine + 150 masculine archetypes across 20+ world mythologies (`jsons/`)
- **Storage**: IndexedDB (local, current) → Supabase (planned)
- **Deployment**: Vercel (planned — Express routes → serverless API functions)

## Key files
| File | Purpose |
|---|---|
| `components/App.tsx` | State machine: IDLE → ANALYZING → COMMUNING → MANIFESTING → REVEALED |
| `components/InputForm.tsx` | Collects name, birth date/time, location, gender, photo |
| `components/ResultReveal.tsx` | Two-phase reveal: SCRIPTURE (descent) → MANIFESTATION (full dashboard) |
| `services/cosmicCalc.ts` | Cosmic fingerprint calculation — mix of real math and hash-based |
| `services/geminiService.ts` | Frontend proxy calls to the Express backend |
| `server/server.js` | Express API: `/api/generate-brief` + `/api/generate-mythic-image` |
| `server/mythic_gen.js` | Imagen 3 prompt builder — 22-culture visual DNA system |
| `jsons/master_feminine_archetypes_db.json` | 150 feminine archetypes |
| `jsons/master_masculine_archetypes_db.json` | 150 masculine archetypes |

## Cosmic fingerprint — what's real vs hash-based
**Real calculations** (pure date math):
- Life Path number (numerology reduction)
- Western Sun Sign (date ranges)
- Mayan Tzolkin (GMT correlation, Aug 11 1999 = 1 Imix anchor)
- Bazi Year Pillar (60-year stem/branch cycle, anchored to 4 CE)

**Hash-based** (require astronomical computation to make real):
- Human Design profile, Gene Key gift, Animal Totem, Elemental Clan, Soul Node, Ruling Planet, Nakshatra

## Decisions already made
- **Hosting**: Vercel (convert Express routes to serverless functions)
- **Auth/DB**: Supabase — accounts from day one, readings stored server-side
- **Monetization**: TBD — design for flexibility, rate limit per user account for now
- **Models**: Gemini + Imagen on Vertex AI (stay on GCP stack)

## Roadmap (priority order)
1. **Vercel deployment** — convert Express routes to `/api/*.ts` serverless functions, handle Vertex AI credentials via env vars
2. **Supabase auth + DB** — replace IndexedDB with real persistence, user accounts
3. **Rate limiting** — per user account (3 free readings gate before monetization decision)
4. **Two-phase biometric pipeline** — Gemini Vision analyzes photo → extracts physical traits → feeds into Imagen prompt for accurate likeness
5. **Share-optimized portrait export** — portrait-format card (name + archetype + one-liner) optimized for social sharing
6. **Real astronomical calculations** — Moon sign, Nakshatra, Rising sign (requires birth time + location + ephemeris)

## What was done in the last session
- Upgraded `gemini-2.0-flash` → `gemini-2.5-flash`
- Upgraded `imagen-3.0-fast-001` → `imagen-3.0-generate-001`
- Replaced single-string Imagen prompt with structured 11-directive cultural DNA system (22 traditions)
- Added real Sun Sign, Mayan Tzolkin, and Bazi Year Pillar calculations
- Fixed 3 UI bugs: Reclamation section now renders, raw Imagen prompt removed from UI, biometric title is now dynamic
- Removed artificial 2-second delay before image generation

## Git
- Working branch: `claude/describe-observations-69g04`
- To push: requires a classic GitHub PAT with `repo` scope (fine-grained PATs need Contents: write explicitly set)
