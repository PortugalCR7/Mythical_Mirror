# Story Logic & Visual Mechanics

## 1. Animation Logic: The Reveal Protocol
**Target**: Central Archetype Portrait (and result container).

### Gaussian-Blur-In
- **Trigger**: `AppState.REVEALED`
- **Duration**: `1200ms`
- **Curve**: `ease-out` (Cubic Bezier: `0.22, 1, 0.36, 1`)
- **Initial State**:
  - `filter: blur(20px)`
  - `opacity: 0`
  - `transform: scale(0.95)`
- **Final State**:
  - `filter: blur(0px)`
  - `opacity: 1`
  - `transform: scale(1)`

**CSS Implementation Reference**:
```css
@keyframes mythicReveal {
  0% {
    filter: blur(20px);
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    filter: blur(0px);
    opacity: 1;
    transform: scale(1);
  }
}

.reveal-anim {
  animation: mythicReveal 1200ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
```

## 2. Cosmic Code Data Hookup
**Purpose**: Map the raw `OracleResult` data to the UI "Cosmic Code" section using the Gold/All-Caps styling.

### Data Source Mapping
The application state `result` object contains the source of truth.

| UI Label (Gold, All-Caps) | Data Path | Backup / Fallback |
| :--- | :--- | :--- |
| **HUMAN DESIGN** | `result.cosmicReadings.hds` | `result.fingerprint.humanDesignProfile` |
| **EARTH MEDICINE** | `result.totem` | `result.fingerprint.animalTotem` |
| **BAZI** | `result.fingerprint.bazi` | "Water Pig" (Generic Fallback) |
| **NUMEROLOGY** | `result.fingerprint.lifePath` | Calculated from Birth Date |
| **VEDIC ASTROLOGY** | `result.fingerprint.vedic` | `result.fingerprint.nakshatra` |
| **GENE KEYS** | `result.cosmicReadings.gk` | `result.fingerprint.geneKeyGift` |
| **SOUL LEVEL ASTROLOGY** | `result.cosmicReadings.soulLevel` | "The Guardian" |
| **MAYAN TZOLKIN** | `result.fingerprint.mayanKin` | "Blue Storm" |
| **SUN SIGN ARCHETYPE** | `result.fingerprint.sunArchetype` | "The Cardinal" |
| **BIOMETRIC SYNTHESIS** | `result.biometricAnalysis` | "Visual synthesis complete." |

### Styling Rules
- **Label**:
  - Font: `Inter` (or System Sans)
  - Weight: `500` (Medium)
  - Color: `#F3D060` (Gold)
  - Transform: `Uppercase`
  - Letter Spacing: `0.05em`
  - Icon: A 4-pointed star (✨) should precede each label.

- **Value**:
  - Font: `Cinzel` (or Serif)
  - Color: `#E1E1E1` (Off-white)
  - Size: `1.1em`

## 3. The Lore Triad (Narrative Flow)
The `MythopoeticBrief` is structured into three distinct phases.

1.  **DESCENT (Origin)**
    *   *Context*: The user's past, karmic debt, or origin story.
    *   *Visuals*: Top of the brief, typically darker tones.

2.  **RECLAMATION (Advice)**
    *   *Context*: The actionable insight or "weapon" given to the user.
    *   *Visuals*: Middle section, highlighted or italicized.

3.  **DEVOTION (Ritual)**
    *   *Context*: How to maintain this energy.
    *   *Visuals*: Bottom section, often concludes with a mantra or closing statement.

## 4. Narrative Engine (Logic)

### Zero Technicality Rule
- **Constraint**: The output must be strictly mythic and storytelling-driven.
- **Prohibited Terms**: "Projector", "Bazi", "Life Path", "Gene Key", "Human Design", "Strategy", "Authority".
- **Benchmark**: Use "Mythic Synthesis Templates" as the tonal standard.
- **Goal**: Transform technical data points into narrative archetypes (e.g., "Projector" becomes "The Orchestrator", "Line 5" becomes "The Heretic-Savior").

### User Integration
- **Contextual Synthesis**: The narrative must weave in the user's provided birth data and current residence.
- **Environmental Cues**:
  - Residency (e.g., "Austin") should influence the setting or elemental metaphors (e.g., "The dry heat of the plains," "The river that cuts through stone").
  - Seasonality based on current date or birth season.

## 5. Mythic Synthesis Lexicon & Templates

### Translation Rules
Before rendering, map technical modalities to their Mythic Equivalent Labels.
- **Rule**: If data triggers "Life Path", translate to **"The Weaver"**.
- **Rule**: If data triggers "Nakshatra", translate to **"The Rainmaker"**.

### Mythic Templates (The Tonal Core)
Use these text blocks as the absolute benchmark for tone.

#### 1. THE ORCHESTRATOR OF RHYTHMS (Projector / HDS)
> "You are not meant to toil in the fields, but to stand upon the hill and see how the rivers should flow. Your vision is a tuning fork; when you speak, the chaotic energies of others find their song."

#### 2. THE RESERVOIR OF STILL WATERS (Bazi / Water)
> "Deep within the obsidian depths, a vast wisdom remains unperturbed by the surface winds. You carry the weight of ancient oceans, a silent power that nourishes the roots of the world."

#### 3. THE WEAVER OF FOUNDATIONS (Life Path / Numerology)
> "You are the architect of the invisible. While others build on sand, you carve your truth into the bedrock of time, ensuring that what you create can withstand the floods of change."

#### 4. THE CELESTIAL RAINMAKER (Nakshatra / Vedic)
> "Your presence is a cooling mist upon a parched spirit. You do not force growth; you provide the spiritual atmosphere in which the most fragile dreams finally find the courage to bloom."

#### 5. THE SEED OF THE GREAT CANOPY (Gene Keys)
> "You contain the blueprint of a forest within a single heartbeat. Your journey is the slow, inevitable reach toward the stars, turning the darkness of the soil into the glory of the heights."

#### 6. THE SPIRIT CALLER (Earth Medicine)
> "You speak the language of the wind and the rain. Your emotions are not burdens, but the very elements you use to fertilize the spirit and call forth the hidden magic of the earth."

#### 7. THE EYE OF THE TRANSFORMATION (Mayan Tzolkin)
> "You are the calm point around which the universe spins its frantic dance. In the heat of intensity, you do not break—you transmute the lightning into a steady, guiding light."

#### 8. THE SENTINEL OF THE INNER WATERS (Soul Level Astrology)
> "You are the guardian of the sacred pool. You understand that some truths must be protected behind gates of silver, ensuring that the purity of your inner world remains untouched by the world’s clamor."

#### 9. THE FIRST CURRENT (Sun Sign Archetype)
> "You are the mountain spring that begins the river’s journey. Your role is to initiate the flow, to wash away the stagnant, and to remind the world that everything begins with a single drop of courage."

#### 10. THE VERDANT SENTINEL (Biometric Synthesis)
> "Your physical form is a mirror of the wild world. As the rain finds the leaves, your own vitality confirms that you are in perfect resonance with the environment that birthed you."
