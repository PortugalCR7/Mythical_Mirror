# The Mythical Mirror — Project Brief

# The Mythical Mirror — Project Brief

## What this is
A mythic oracle web app. Users enter birth data + photo → the app calculates a cosmic fingerprint → Gemini 2.5 Flash generates a mythopoetic narrative → Gemini 2.5 Flash Image transfigures the user's photo into their matched archetype from a 150-entry cultural mythology database.

## Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express server (`server/server.js`) on port 5001 for dev; Vercel serverless functions (`api/*.ts`) in prod
- **AI**: `@google/genai` SDK against the Gemini Developer API — `gemini-2.5-flash` for narrative + vision-trait extraction, `gemini-2.5-flash-image` for image-to-image portrait rendering
- **Auth**: Single env var `GEMINI_API_KEY` (Gemini Developer API key, format starts with `AQ.`). No service account, no Vertex AI enablement needed.
- **Data**: 150 feminine + 150 masculine archetypes across 20+ world mythologies (`jsons/`)
- **Storage**: IndexedDB (local, current) → Supabase (in progress — Vercel env vars set, schema not yet wired)
- **Deployment**: Vercel, production = `main` branch, prod URL `mythical-mirror.vercel.app`

## Key files
| File | Purpose |
|---|---|
| `components/App.tsx` | State machine: IDLE → ANALYZING → COMMUNING → MANIFESTING → REVEALED |
| `components/InputForm.tsx` | Collects name, birth date/time, location, gender, photo |
| `components/ResultReveal.tsx` | Two-phase reveal: SCRIPTURE (descent) → MANIFESTATION (full dashboard) |
| `services/cosmicCalc.ts` | Cosmic fingerprint calculation — mix of real math and hash-based |
| `services/geminiService.ts` | Frontend proxy calls to `/api/generate-brief` + `/api/generate-mythic-image` |
| `server/server.js` | Local Express API (dev only) |
| `api/generate-brief.ts` | Vercel serverless: narrative + vision-trait extraction in parallel, returns assembled image prompt |
| `api/generate-mythic-image.ts` | Vercel serverless: thin Gemini 2.5 Flash Image wrapper, takes prompt + reference photo |
| `server/mythic_gen.js` | Image prompt builder + `TRAIT_EXTRACTION_PROMPT` + `formatPhysicalLikeness` |
| `jsons/master_*_archetypes_db.json` | 150 feminine / 150 masculine archetypes |
| `vercel.json` | Function config — `iad1` region, `jsons/**` included for brief fn, 120s timeout for image fn |

## Cosmic fingerprint — what's real vs hash-based
**Real calculations** (pure date math):
- Life Path number (numerology reduction)
- Western Sun Sign (date ranges)
- Mayan Tzolkin (GMT correlation, Aug 11 1999 = 1 Imix anchor)
- Bazi Year Pillar (60-year stem/branch cycle, anchored to 4 CE)

**Hash-based** (require astronomical computation to make real):
- Human Design profile, Gene Key gift, Animal Totem, Elemental Clan, Soul Node, Ruling Planet, Nakshatra

## Image pipeline (the load-bearing one)
The whole product hinges on this: **the user's actual face must appear inside the archetype**, not a generic mythic face with the user's face pasted on. AI Studio's reference outputs (Shiva, Aztec lord, Costa Rican elder, Odin, Finnic bard) prove the bar.

Flow:
1. `/api/generate-brief` receives `{ userData, userImage }`.
2. Two Gemini calls fire in parallel:
   - Narrative generation (text only) → returns the mythopoetic brief JSON.
   - Vision trait extraction (photo + `TRAIT_EXTRACTION_PROMPT`) → returns structured JSON: `skinTone, eyeShape, eyeColor, faceShape, hair*, facialHair, ageRange, distinguishingFeatures, …`.
3. Brief assembles the final image prompt via `augmentMythicPrompt(archetype, "the subject", tonalCore, regionalStory, physicalTraits)` — which produces the layered prompt with a `PHYSICAL LIKENESS (preserve exactly): …` directive baked in.
4. `/api/generate-mythic-image` takes `{ visualDescription, userImage }`, calls `gemini-2.5-flash-image` with `responseModalities: ['IMAGE']` and the reference photo as an `inlineData` part. The photo carries the likeness; the prompt directs the transfiguration.

Critical: do NOT regress this back to Imagen 3 / text-only rendering — Imagen can't see the photo.

## Decisions already made
- **Hosting**: Vercel, prod from `main`
- **Auth/DB**: Supabase — accounts from day one, readings stored server-side
- **Monetization**: TBD — design for flexibility, rate limit per user account for now
- **Models**: Gemini Developer API (`@google/genai` SDK), single API key — NOT Vertex AI

## Roadmap (priority order)
1. ~~**Vercel deployment**~~ — DONE (code shipped; verification pending user setting `GEMINI_API_KEY` env var + redeploy)
2. **Supabase auth + DB** — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Vercel; schema + RLS + wiring not started. Three decisions needed from user before starting: (a) auth method (email/password vs magic link vs Google OAuth), (b) image storage (Supabase Storage bucket vs inline base64), (c) drop existing IndexedDB readings or migrate up
3. **Rate limiting** — per user account (3 free readings gate before monetization decision)
4. ~~**Two-phase biometric pipeline**~~ — DONE differently than originally planned: instead of "Vision describes face → Imagen invents new face matching description", we switched to true image-to-image via Gemini 2.5 Flash Image. Vision still extracts structured traits as a prompt enhancer, but the reference photo flows all the way through to the renderer.
5. ~~**Share-optimized portrait export**~~ — DONE (PR #3 merged to `main`, confirmed working in a live reading). 1080×1920 (9:16) story card, single "Descent" layout: full-bleed mythic portrait + obsidian→gold scrims carrying archetype title, one-liner, name, and "The Mythical Mirror" wordmark/URL watermark. In-app "Your Story Card" preview renders below the reading; Share Portrait button rasterizes via html-to-image → Web Share API (mobile) / download (desktop). Cross-origin history portraits (Supabase signed URLs) are fetched + inlined to data URLs before rasterizing so export doesn't taint the canvas. Headless render harness: `share-preview.html` + `share-preview.tsx` + `npm run render:cards` (Playwright, env-overridable `CHROME_PATH`; output PNGs gitignored). Final UI/UX polish deferred — function-first.
6. **Real astronomical calculations** — Moon sign, Nakshatra, Rising sign (requires birth time + location + ephemeris)

## What was done in the most recent session
Closed out the three open loops left from the share-card work:
- **History export hardened (loop #1, most pertinent):** `sharePortrait` in `components/ResultReveal.tsx` no longer fails silently. A tainted-canvas `SecurityError` (cross-origin Supabase portrait that couldn't be inlined) now surfaces a user-facing message under the share buttons ("Could not render this saved portrait… try a fresh reading, or download the Full Revelation"); other failures get a generic retry message. The pre-fetch → data-URL resolution + `crossOrigin="anonymous"` img remain the happy path; this just makes the failure mode observable. Typecheck clean.
- **PR #3 description updated (loop #2):** rewrote the merged PR #3 body to match the shipped 1080×1920 full-bleed Descent card (was still describing the original 1080×1350 circular design) and documented the preview, cross-origin resolution, and render harness.
- **Supabase forks (loop #3):** confirmed resolved-enough; folded into roadmap #2 rather than tracked separately. No code change.

### Prior session (roadmap #5 build, for context)
- Built `components/ShareCard.tsx` (1080×1920 card), `ResultReveal.tsx` preview + share/export logic, and the `share-preview.*` / `scripts/render-share-card.mjs` headless harness.
- Explored 3 layouts (descent / tablet / band), locked to **Descent**, removed the others + picker. Merged PR #3 → `main`.

## Open loops at session end
- **All three prior open loops closed** this session — see "What was done" above.
- **History export now confirmed end-to-end:** a real history-loaded reading exported a card cleanly in the deployed app (no tainted-canvas error), so the cross-origin Supabase signed URL → data URL path works and Storage CORS is allowing the fetch. The graceful-failure surface added this session is the safety net, not the primary path.
- **No open loops remain.** Next up is roadmap #6 (real astronomical calculations).

## Git
- Production branch: `main`
- Most recent feature branch: `claude/share-portrait-card` (merged via PR #3)
- Don't auto-create PRs — direct merges are fine when user asks for them
