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
- Built roadmap #5 (share-optimized portrait export) — see roadmap entry above for the full feature description. Key files: `components/ShareCard.tsx` (the 1080×1920 card), `components/ResultReveal.tsx` (preview + share/export logic + cross-origin portrait resolution), `share-preview.html` / `share-preview.tsx` / `scripts/render-share-card.mjs` (headless render harness).
- Explored 3 layouts (descent / tablet / band) against headless renders, then locked to **Descent** at the user's choice and removed the other two + the layout picker.
- Merged PR #3 (`claude/share-portrait-card`) → `main`; confirmed working in a live reading. Final UI/UX polish intentionally deferred (function-first).

## Open loops at session end
- **#5 follow-up (cosmetic)**: PR #3 body still describes the original 1080×1350 circular card, not the final 1080×1920 Descent design. Harmless; update if it bothers you.
- **#5 not independently verified**: the cross-origin *history* export path (Supabase signed URL → data URL) was only validated headlessly + on a fresh reading. Worth confirming a history-loaded reading exports cleanly (depends on Supabase Storage CORS allowing the fetch).
- **Supabase**: env vars set; the three forks (auth method, image storage, IndexedDB migration) were resolved enough to wire auth + readings storage (PR #1 merged earlier). Revisit if deeper DB work is needed.

## NEXT UP — Full front-end redesign

Full visual redesign of The Mythical Mirror in code, screen by screen. The state machine, the image pipeline, and the 9:16 / 2K share-card framing are locked; everything else is in scope. Share card is redesigned last.

### Direction (locked)
**One-line read:** *A streaming-key-art poster, made personal. Sacred-reverent in pacing, mythic-enthronement at the reveal, editorial in voice, disciplined in ornament.*

- **Mood:** Sacred & reverent. Hushed, temple-like, ceremonial — every moment earned.
- **Reveal emotion:** Mythic enthronement. The moment the archetype portrait + name land should hit like a hero being named on screen (Vikings / Rings of Power / GoT key-art register).
- **References:** GoT key art, *The Rings of Power* posters, *Vikings* cover art. Streaming-key-art DNA: hero portrait + monumental editorial type on a black field, equal-weight, often interlocking. Hero emerges from dark.
- **Color:** Keep obsidian + gold, refine it. **No per-archetype accent for now** (deferred — clan-derived accent stays an option to revisit if the system feels under-signatured post-ship).
  - Obsidian field with the faintest indigo bleed (not pure jet).
  - Disciplined gold range, three values only: warm cream "lumen" (display), true ceremonial gold ("inscription"), muted antique gold ("metadata/CTA").
  - Lavender-silver for wide-tracked metadata / eyebrows.
- **Type:** Editorial, inscribed, serif-led across the whole system (no separate sans for UI).
  - Display: high-contrast inscribed serif, all caps, generous tracking, warm cream.
  - Eyebrow: wide-tracked small caps — lavender for section/meta, antique gold for action.
  - Scripture body: italic serif, drop-capped, justified. **No small caps in scripture body** (small caps reserved for eyebrows/metadata only).
  - Reading body / data values: clean cream serif, comfortable size, same family.
- **Motion:** Restrained & precise. No ambient drift, no breathing glows. Three canonical eases: *Inscribe* (slow draw-in, 1200–1800ms), *Bloom* (opacity + luminance lift, 600ms), *Hush* (held silence, 400–800ms). No spinners anywhere — loading states use the inscription metaphor.
- **Ornament:** One reserved ornament glyph (hairline knot/diamond), used only at chapter breaks and on the share-card wordmark. The existing hairline gold rule + sparkle/diamond bullet stay. **No knotwork textures, plaques, or engraved bevels** — the poster references are a vibe, not a transplant.
- **Layout DNA:** Hero portrait IS the surface, not a card on a card. Vertical inscription rail along an edge for loading/desktop margins (replaces centered spinners). Asymmetric, never centered-by-default — the center is reserved for the reveal moment.

### Measure & scale (the rule that fixes the current biggest readability problem)
The current downloadable revelation strips body copy into a too-narrow column, forcing awful line breaks and a "thin strip down the middle" feel. Hard rules:
- **Body / scripture measure: 60–75 characters per line** (`max-width: ~65ch`), not 320–400px columns.
- **Mobile: single column, full width minus 24–32px gutters.** The reading is the canvas — nothing floats as a slim card.
- **Desktop: editorial column 560–640px** for scripture/body. Side rails (vertical inscription, metadata) live *outside* that column, not by stealing width from it.
- **Modular type scale, viewport-aware.** Capped 5-step scale (display / title / heading / body-large / body); display headlines scale **down** on small viewports — never assume the full TLALOC scale on phone.
- **In-app reading is editorial web. The share card is the separate 1080×1920 artifact.** Share-card framing must not leak into the in-app layout.

### Constraints (locked, not in scope to change)
- State machine: IDLE → ANALYZING → MANIFESTING → REVEALED stays as-is.
- Share card framing: 1080×1920 (9:16), single Descent layout, render harness (`share-preview.html` + `scripts/render-share-card.mjs`) keeps working.
- Image pipeline: Gemini 2.5 Flash narrative + vision traits → Gemini 2.5 Flash Image with reference photo. Not regressing.

### Flow change locked this session — form-first, email-on-download
- **No auth gate up front.** The sign-in modal ("THE MIRROR / IDENTIFY YOURSELF TO DESCEND") is dropped from the primary flow. InputForm IS the front door.
- **SHARE PORTRAIT stays seamless.** One-tap native share / Instagram, no friction, no email.
- **FULL REVELATION download is email-gated.** Clicking it triggers a small email-capture step → the revelation is emailed to the user. Email becomes the soft account; no password.
- **Existing Supabase auth code stays for now.** The redesign just bypasses the modal visually; code-path cleanup is a separate decision.
- **Loading states drop the mono footer line entirely** (no `system.attuning_to_signal…` strip).

### Screens in scope (redesign order)
1. IDLE / InputForm (one screen — the front door)
2. ANALYZING (loading)
3. MANIFESTING (loading)
4. REVEALED — Scripture phase
5. REVEALED — Manifestation phase (hero portrait + archetype lockup + Cosmic Code / Celestial Signature)
6. Email-capture micro-step (new — triggered by FULL REVELATION download)
7. ShareCard (last — must respect locked 1080×1920 framing)

### Process for this redesign
1. ~~**Direction interview**~~ — DONE this thread.
2. **Capture "before" screenshots** of each screen with the user, one at a time.
3. **Step 1 of build:** propose design-language tokens (color/type/spacing/motion) + reusable primitives → stop for sign-off before touching screens.
4. **Step 2 of build:** redesign screen-by-screen in the order above. Share card last.
5. **Verify on Vercel** once deployed.

## Git
- Production branch: `main`
- Most recent feature branch: `claude/share-portrait-card` (merged via PR #3)
- Don't auto-create PRs — direct merges are fine when user asks for them
