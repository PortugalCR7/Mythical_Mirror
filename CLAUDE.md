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
5. **Share-optimized portrait export** — portrait-format card (name + archetype + one-liner) optimized for social sharing
6. **Real astronomical calculations** — Moon sign, Nakshatra, Rising sign (requires birth time + location + ephemeris)

## What was done in the most recent session
- Switched image renderer from `imagen-3.0-generate-001` (text-only) → `gemini-2.5-flash-image` (true image-to-image). Imagen could not see the photo, which is why local rendering was producing generic mythic faces while AI Studio (which uses Flash Image) preserves likeness.
- Swapped SDK: `@google-cloud/vertexai` → `@google/genai`. Auth went from service-account-JSON to a single `GEMINI_API_KEY` env var.
- Hoisted Gemini Vision trait extraction up into the brief endpoint, running in parallel with narrative generation. Pipeline went from 3 sequential round-trips → 2.
- Brief endpoint now bakes structured `PHYSICAL LIKENESS (preserve exactly): …` directive into the assembled image prompt.
- `vercel.json`: pinned functions to `iad1`, bumped image function timeout to 120s, included `jsons/**` for the brief function bundle.
- Merged `claude/fix-imagen-image-to-image-J0wj8` → `main`. Vercel auto-deploys on push to main.

## Open loops at session end
- **Awaiting user**: rotate the leaked Gemini API key (was pasted in chat), add fresh `GEMINI_API_KEY` to Vercel env vars (Production + Preview), trigger a redeploy, share build logs.
- **Awaiting verification**: no live request has hit the new `@google/genai` + Flash Image pipeline yet. First successful deploy needs a smoke test — confirm `model` field in `/api/generate-mythic-image` response equals `gemini-2.5-flash-image`, and the rendered portrait actually preserves the user's likeness (compare against AI Studio reference outputs the user shared).
- **Possible follow-up**: if `gemini-2.5-flash-image` returns a model-not-found error, set Vercel env var `MYTHIC_IMAGE_MODEL=gemini-2.5-flash-image-preview` to use the preview tier instead.
- **Supabase**: env vars set, but the three forks (auth method, image storage, IndexedDB migration) haven't been answered. Schema and wiring blocked on those answers.

## Git
- Production branch: `main`
- Most recent feature branch: `claude/fix-imagen-image-to-image-J0wj8` (merged)
- Don't auto-create PRs — direct merges are fine when user asks for them
