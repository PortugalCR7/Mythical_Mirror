/**
 * Cultural Visual DNA — art direction per mythological tradition.
 * Each entry defines palette, style, setting, lighting, motifs, and negative guidance
 * for gemini-2.5-flash-image portrait generation (image-to-image; the user's
 * reference photo is sent alongside the assembled prompt).
 */
const CULTURE_DNA = {
  'Greek': {
    palette: 'marble white, Aegean deep blue, Olympic gold, ash grey, blood crimson',
    style: 'Hellenistic sculptural realism fused with Pre-Raphaelite painterly detail',
    setting: 'Olympian summit at twilight, crumbling marble columns, a storm-lit Aegean sea at the horizon, black cypress trees',
    lighting: 'Mediterranean golden hour, dramatic chiaroscuro side-lighting, silver moonrise behind storm clouds',
    motifs: 'laurel wreath, serpent coils, owl feathers, sacred Olympic flame, grapevine, thunderbolt',
    avoid: 'stock Renaissance imagery, pale Northern European features, plastic skin',
  },
  'Sumerian': {
    palette: 'lapis lazuli, fired clay terracotta, bitumen black, gold leaf, ochre sand',
    style: 'Sacred cylinder seal iconography elevated to cinematic realism, rigid frontal divine gaze',
    setting: 'Apex of a massive ziggurat at the edge of the Tigris at night, reed marshes below, star-crowded Mesopotamian sky',
    lighting: 'Torch-warm gold against infinite dark sky, bronze reflection from sacred vessels',
    motifs: 'cuneiform tablets, eight-pointed star of Inanna, divine horned crown, lion-headed eagle (Anzu), date palm',
    avoid: 'generic Middle Eastern tropes, orientalist clichés',
  },
  'Egyptian': {
    palette: 'lapis lazuli, desert gold, onyx black, papyrus ivory, kohl grey, turquoise faience',
    style: 'Sacred realism with hieroglyphic geometric precision, Gustav Klimt gold-leaf treatment',
    setting: 'Inner sanctum of a flooded Nile temple, star-map ceiling, torchlit alabaster columns',
    lighting: 'Single shaft of divine sunlight through stone, torch-amber glow on gold surfaces',
    motifs: 'ankh, scarab, Eye of Horus, lotus blossom, djed pillar, uraeus serpent crown, was-scepter',
    avoid: 'Hollywood Cleopatra tropes, inappropriately European facial features',
  },
  'Babylonian': {
    palette: 'deep indigo, hammered gold, burned sienna, jade green, starlight silver',
    style: 'Mesopotamian royal relief carving translated to cinematic photorealism',
    setting: 'Hanging Gardens terrace at night, Euphrates river glimmering below, ziggurat silhouette on the horizon',
    lighting: 'Astral lantern light, sacred fire reflection in still water, dense Babylonian star field above',
    motifs: 'dragon-serpent (mušḫuššu), solar disc, lion, lamassu wings, cedar sacred tree, seven stars of the Pleiades',
    avoid: 'generic ancient Middle Eastern fantasy, anachronistic visual elements',
  },
  'Hindu': {
    palette: 'vermilion, saffron gold, peacock blue, lotus pink, turmeric yellow, deep violet',
    style: 'Classical Indian miniature painting elevated to photorealistic 8K, Madhubani meets Rajput court art',
    setting: 'Mount Meru summit wreathed in cosmic fire and lotus mist, celestial Apsaras visible in the far distance',
    lighting: 'Inner divine radiance (prabhamandala), golden halo, sacred fire (yajna) reflection',
    motifs: 'lotus throne, trident, chakra disc, sacred river, third eye, crescent moon, jeweled mukut crown',
    avoid: 'caricature, disrespectful representation, tourist-market aesthetics',
  },
  'Japanese': {
    palette: 'indigo aizome, vermilion red, ivory white, sumi ink black, cherry blossom blush, gold',
    style: 'Ukiyo-e woodblock print psychology elevated to cinematic photorealism, Hokusai meets hyper-realism',
    setting: 'Ancient Shinto shrine forest at night, torii gate silhouette, moonlit sacred spring, stone lanterns',
    lighting: 'Paper lantern warm amber, full moonlight through bamboo grove, bioluminescent sacred mist',
    motifs: 'torii gate, sakura petals, koi, magatama jewel, shimenawa rope, sacred mirror (kagami)',
    avoid: 'anime, manga aesthetics, modern Japanophile clichés',
  },
  'Chinese': {
    palette: 'imperial vermilion, jade green, phoenix gold, midnight blue, cloud white, ink black',
    style: 'Song Dynasty ink painting elevated to 8K photorealism, classical Gongbi brushwork precision',
    setting: 'Celestial palace above a mountain cloud sea (shanshui), dragon-carved stone terrace, pine trees in mist',
    lighting: 'Celestial radiance through parting clouds, jade green moonlight, lantern festival amber glow',
    motifs: 'dragon, phoenix, jade bi disc, cloud scroll, eight trigrams (bagua), peach of immortality, lotus',
    avoid: 'stereotyped "oriental" tropes, modern anachronisms',
  },
  'Norse': {
    palette: 'iron grey, blood red, storm silver, bone white, frost blue, forge ember orange',
    style: 'Viking age illuminated manuscript meets Arthur Rackham fantasy realism',
    setting: 'Wind-hammered cliff top at the edge of Midgard, Yggdrasil ash tree visible in a lightning-split sky',
    lighting: 'Northern lights (aurora borealis), forge ember glow, silver storm light',
    motifs: 'Valknut, ravens (Huginn and Muninn), wolf, Midgard serpent, runic inscription, longship prow carving',
    avoid: 'Marvel superhero aesthetics, horned helmets, generic Viking fantasy',
  },
  'Irish': {
    palette: 'emerald green, bog amber, silver mist, raven black, sunset crimson, birch white',
    style: 'Book of Kells illumination elevated to cinematic Pre-Raphaelite realism',
    setting: 'Ancient Irish hillfort (rath) at dusk, megalithic standing stones, a mist-filled valley below, sacred hawthorn',
    lighting: 'Celtic twilight — diffused silver-gold, will-o-wisp glimmer, fire of a sacred hilltop',
    motifs: 'triple spiral (triskelion), crow and raven, sacred hound, bronze cauldron, ogham inscription, sacred oak',
    avoid: 'tourist-Ireland clichés, New Age appropriation',
  },
  'Slavic': {
    palette: 'birch white, midnight blue, blood red, forest deep green, bone yellow, storm violet',
    style: 'Ivan Bilibin folk illustration elevated to photorealism, Slavic folk art tapestry',
    setting: 'Primordial Slavic forest at equinox night, fireflies, ancient oak roots, a silver river beyond',
    lighting: 'Otherworldly bioluminescence through ancient trees, distant village bonfire glow',
    motifs: 'Firebird feather, bear paw, embroidered folk border, Baba Yaga mortar traces, silver birch bark',
    avoid: 'generic European fairy tale, Western fantasy stock images',
  },
  'Yoruba': {
    palette: 'electric indigo, copper gold, Ṣàngó red, Yemoja turquoise, Osun forest green, Obatala white',
    style: 'West African Ifá iconographic realism, Benin bronze court art elevated to 8K cinematic portrait',
    setting: 'Sacred iroko tree grove at the crossroads at dusk, the river Osun glittering in the distance, cowrie shells on the earth',
    lighting: 'Tropical noon divine fire, electric storm light from Ṣàngó, sacred river moonlight',
    motifs: 'double axe (oshe Ṣàngó), cowrie shells, iron tools, sacred calabash, beaded Yoruba crown (ade)',
    avoid: 'Afrofuturism stereotype, exoticization, Western fantasy "African queen" tropes',
  },
  'Aztec': {
    palette: 'jade green, obsidian black, turquoise, solar gold, blood red, quetzal feather emerald',
    style: 'Aztec codex illumination elevated to photorealistic cinematic hyper-detail',
    setting: 'Summit of the Templo Mayor at night, stars aligned overhead, jungle canopy stretching to the horizon below',
    lighting: 'Obsidian mirror reflection of stars, sacred copal incense smoke catching torchlight, volcanic glow',
    motifs: 'quetzal feather headdress, obsidian blade, xiuhcoatl fire serpent, sun stone, sacred calendar glyphs',
    avoid: 'stereotyped Mayan conflation, Hollywood "Apocalypto" aesthetic',
  },
  'Vodou': {
    palette: 'Baron Samedi purple-black, royal blue and gold (Ezili), Ogou red and black, Damballa white-silver',
    style: 'Haitian Vodou ceremonial vèvè sacred geometry integrated into photorealistic portrait',
    setting: 'A crossroads at midnight in a moonlit tropical forest, rum offering on the earth, white candles lit',
    lighting: 'Candlelight and starlight, spectral loa radiance from within the subject',
    motifs: 'vèvè symbols, rum bottle, Baron\'s top hat, Ghede purple, Damballa sacred serpent, iron and rum',
    avoid: 'Hollywood horror "voodoo" clichés, disrespectful stereotyping',
  },
  'Canaanite': {
    palette: 'cedarwood brown, Phoenician purple, desert gold, sea blue, bone ivory',
    style: 'Ancient Near Eastern relief carving in photorealistic cinematic realism',
    setting: 'Cedar forest summit of Mount Zaphon, Baal\'s storm clouds gathering above, Phoenician coast below',
    lighting: 'Lightning from above, sacred storm light, cedar resin fire glow',
    motifs: 'storm bolt, cedar staff, bull horns (El), crescent moon, sea serpent (Yam), fertility vessel',
    avoid: 'generic Bible illustration, anachronistic elements',
  },
  'Balinese': {
    palette: 'saffron yellow, deep temple red, jungle green, gold leaf, shadow black',
    style: 'Balinese Kamasan traditional painting in photorealistic detail, wayang kulit silhouette influence',
    setting: 'Pura Besakih temple terrace at dawn, Mount Agung behind, incense smoke through carved stone gates',
    lighting: 'Tropical dawn gold, sacred fire (api suci) amber, volcanic ash twilight',
    motifs: 'kris blade, barong lion mask, lotus offering (canang), carved stone demon gate (candi), garuda wings',
    avoid: 'tourist resort aesthetics, generic "Southeast Asian" conflation',
  },
  'Mexican': {
    palette: 'marigold gold (cempasúchil), deep purple, turquoise, blood red, bone white, earth brown',
    style: 'Día de los Muertos sacred folk art elevated to cinematic photorealism, Diego Rivera mural influence',
    setting: 'Ofrenda altar at midnight, marigold path leading to the beyond, ancient Mexican highlands above',
    lighting: 'Candlelight, marigold petal glow, silver moonlight, underworld luminescence',
    motifs: 'sugar skull motifs, marigold petals, La Catrina elements, obsidian mirror, copal smoke, serpent',
    avoid: 'Halloween kitsch, generic Aztec conflation',
  },
  'Finnic': {
    palette: 'birch white, midnight blue, Arctic aurora green, blood red, bear brown, lake silver',
    style: 'Kalevala-era Akseli Gallen-Kallela Nordic symbolism in photorealistic 8K',
    setting: 'Frozen lake shore at polar night, aurora borealis overhead, ancient pine forest, smoke from a sauna',
    lighting: 'Aurora green-violet, fire reflection on black ice, blue polar twilight',
    motifs: 'bear skull, kantele harp strings, Swan of Tuonela, rune-carved birch bark, iron Sampo mill',
    avoid: 'generic Viking conflation, generic Scandinavian aesthetics',
  },
  'Native American': {
    palette: 'ochre earth, turquoise sky, blood red, sage grey-green, bone white, raven black',
    style: 'Plains ledger art and Pueblo ceramic iconography elevated to sacred cinematic realism',
    setting: 'Sacred canyon wall at golden hour, eagle circling above, desert mesa stretching below, petroglyphs on stone',
    lighting: 'Desert golden hour, ceremonial fire glow, thundercloud silver',
    motifs: 'dreamcatcher, eagle feather, medicine wheel, buffalo skull, corn, sacred pipe (chanunpa)',
    avoid: 'pan-Indian stereotyping, Hollywood "chief" tropes, generic headdress, Dances with Wolves aesthetic',
  },
  'Roman': {
    palette: 'imperial purple (Tyrian), Roman gold, marble white, blood red, laurel green',
    style: 'Roman Republican sculpture meets Lawrence Alma-Tadema Victorian classicism in photorealism',
    setting: 'Forum steps at dawn, Senate colonnades, Tiber river in the distance, eternal flame of Vesta',
    lighting: 'Italian midday sun, marble-reflected light, sacred Vestal fire amber',
    motifs: 'laurel crown, eagle standard (aquila), toga border, sacred fasces, she-wolf, Capitoline triad symbols',
    avoid: 'Gladiator movie aesthetic, sword-and-sandal clichés',
  },
  'Welsh': {
    palette: 'emerald, slate grey, dragon red, silver mist, oak brown, gold',
    style: 'Mabinogion illuminated manuscript meets Arthur Rackham Pre-Raphaelite realism',
    setting: 'Misty Welsh hillside at dawn, ancient standing stone, Red Dragon banner on the wind, sacred spring',
    lighting: 'Celtic mist-diffused silver-gold, sacred spring reflection, distant balefire',
    motifs: 'red dragon, cauldron of Annwn, white hound, sacred well, mistletoe, bardic harp',
    avoid: 'Arthurian Hollywood fantasy, generic Celtic conflation',
  },
  'Baltic': {
    palette: 'amber gold, Baltic pine green, linen white, storm grey, earth brown',
    style: 'Baltic folk art and Daina song illumination elevated to photorealism',
    setting: 'Ancient Baltic grove (romuva sacred oak) at midsummer, amber beads on the earth, sea behind pine forests',
    lighting: 'Midsummer golden light, sacred fire (ugnis) amber, Baltic amber glow',
    motifs: 'amber beads, sacred oak, sun cross (saule), serpent (žaltys), linen weaving, thunder cross (pērkons)',
    avoid: 'generic Slavic conflation, Viking conflation',
  },
  'Andean': {
    palette: 'Andean textile crimson, electric blue, earth brown, condor silver, sun gold',
    style: 'Incan textile iconography elevated to photorealistic cinematic portrait',
    setting: 'Machu Picchu terrace summit above the clouds at dawn, condors riding thermals below, sacred Apus mountains',
    lighting: 'High-altitude equatorial sun, cloud shadow and light, sacred lightning (Illapa) in the distance',
    motifs: 'condor, puma, serpent (three cosmic realms), quipu knot cords, sun disc (Inti), Andean cross (chakana)',
    avoid: 'tourist site photography aesthetic, Indiana Jones adventure clichés',
  },
  'East Asian': {
    palette: 'celadon jade, gold, midnight blue, bamboo green, vermilion, cloud white',
    style: 'Classical court Gongbi painting with Hokusai compositional power at 8K photorealism',
    setting: 'Celestial mountain pavilion above a cloud sea, ancient pine, koi pond reflection, distant sacred peak',
    lighting: 'Cloud-filtered celestial light, palace lantern glow, moonlit mountain mist',
    motifs: 'phoenix, dragon, jade, lotus, sacred mountain mist, painted silk scroll, Kunlun peak',
    avoid: 'generic "Asian" conflation, orientalist clichés',
  },
  'default': {
    palette: 'ancient gold, obsidian black, sacred crimson, moonstone silver, deep indigo',
    style: 'Sacred mythic realism — timeless, ultra-detailed, award-winning cinematic portrait',
    setting: 'Ancient sacred ground between worlds, cosmic star field above, earthly roots below',
    lighting: 'Divine inner radiance, cosmic star-field backlight, sacred fire reflection',
    motifs: 'sacred symbols of origin, ancestral artifacts, elemental forces made visible',
    avoid: 'generic fantasy stock art, cartoon, anime, flat illustration',
  },
};

function getCultureDNA(culture = '') {
  if (CULTURE_DNA[culture]) return CULTURE_DNA[culture];
  const lower = culture.toLowerCase();
  for (const key of Object.keys(CULTURE_DNA)) {
    if (key === 'default') continue;
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return CULTURE_DNA[key];
    }
  }
  return CULTURE_DNA['default'];
}

const TRAIT_FIELDS = [
  'skinTone', 'eyeShape', 'eyeColor', 'eyebrowShape',
  'noseShape', 'lipShape', 'cheekbones', 'jawline',
  'faceShape', 'hairColor', 'hairTexture', 'hairLength',
  'facialHair', 'ageRange', 'distinguishingFeatures',
];

function cleanTrait(value) {
  if (value === null || value === undefined) return '';
  const s = String(value).trim().toLowerCase();
  if (!s || s === 'n/a' || s === 'none' || s === 'unknown' || s === 'null') return '';
  return s;
}

/**
 * Turns a structured trait object (extracted by Gemini Vision) into a short
 * identity-anchor phrase folded into the SUBJECT beat of the prompt.
 *
 * The reference photo (passed to gemini-2.5-flash-image alongside the prompt)
 * is what physically carries the likeness, so this is a light recognition cue —
 * NOT a lock. It keeps the person identifiable while leaving the model free to
 * transfigure. Returns empty string when no usable traits are present.
 */
export function formatPhysicalLikeness(traits) {
  if (!traits || typeof traits !== 'object') return '';

  const t = {};
  for (const key of TRAIT_FIELDS) t[key] = cleanTrait(traits[key]);

  const parts = [];
  if (t.skinTone) parts.push(`${t.skinTone} skin`);

  const eye = [t.eyeShape, t.eyeColor].filter(Boolean).join(' ');
  if (eye) parts.push(`${eye} eyes`);

  if (t.faceShape) parts.push(`${t.faceShape} face`);

  const hair = [t.hairLength, t.hairTexture, t.hairColor].filter(Boolean).join(' ');
  if (hair) parts.push(`${hair} hair`);

  if (t.facialHair && t.facialHair !== 'clean-shaven' && t.facialHair !== 'clean shaven') {
    parts.push(t.facialHair);
  }
  if (t.ageRange) parts.push(t.ageRange);
  if (t.distinguishingFeatures) parts.push(t.distinguishingFeatures);

  if (parts.length === 0) return '';

  return parts.join(', ');
}

/**
 * Builds the image prompt from archetype + cultural DNA.
 *
 * Production renders with gemini-2.5-flash-image (true image-to-image): the
 * user's photo is sent to the model ALONGSIDE this text. The photo carries the
 * likeness natively, so this prompt does NOT police the face — it supplies a
 * light identity anchor and spends its weight on transfiguration and cultural
 * art direction. Every line is meant to steer the model somewhere it wouldn't
 * go on its own; generic quality incantations ("8K", "subsurface scattering")
 * are deliberately omitted as noise.
 */
export function augmentMythicPrompt(archetype, userLikenessPrompt = "the subject", tonalCore = "Ancient, sacred, and timeless.", regionalStory = "", physicalTraits = null) {
  const { name, culture, description } = archetype;
  const dna = getCultureDNA(culture);

  const regionalAtmosphere = regionalStory
    ? regionalStory.split('.')[0].trim()
    : '';

  const anchor = formatPhysicalLikeness(physicalTraits);
  const anchorClause = anchor ? ` (${anchor})` : '';

  // Beat 1 — WHO + the transformation intent (identity anchored, fully transfigured)
  const subject = `A cinematic, photorealistic portrait of the person in the reference image, reborn as ${name} — ${description}. The same individual: their face stays recognizably theirs${anchorClause}, but they are fully transfigured into the deity — divine luminosity, sacred adornment, the bearing and presence of a god. A true metamorphosis, not a costume or an overlay on a photo.`;

  // Beat 2 — the cultural art lane (palette/scene/lighting + motifs as influence)
  const artLane = `Drawn from the ${culture} tradition: ${dna.setting}. Palette of ${dna.palette}. ${dna.lighting}. The visual language of ${dna.style} informs the composition, color, and sacred motifs (${dna.motifs}) as natural adornment and setting — but the finish is photoreal, never illustrated or flat.`;

  // Beat 3 — mood
  const atmosphere = `Mood: ${tonalCore}${regionalAtmosphere ? ` ${regionalAtmosphere}.` : ''}`;

  // Beat 4 — composition
  const composition = `Heroic 3/4 portrait, the subject filling the frame, cosmic depth behind.`;

  // Beat 5 — only load-bearing negatives (cultural stereotype guards + the
  // illustrated/flat guard that the photoreal decision makes meaningful)
  const avoid = `Avoid: ${dna.avoid}; cartoon, anime, flat illustration.`;

  return [subject, artLane, atmosphere, composition, avoid].join('\n\n');
}

/**
 * Forensic-portrait vision prompt. Returns a structured trait JSON object
 * shaped for formatPhysicalLikeness.
 */
export const TRAIT_EXTRACTION_PROMPT = `You are a forensic portrait analyst. Examine the subject's face in this photo and return a JSON object describing their visible physical features. The downstream system will use this to render a faithful portrait, so accuracy and specificity matter more than poetic language.

Return ONLY a JSON object with these exact keys:
{
  "skinTone": "warm olive | cool porcelain | deep umber | etc. — 2-4 words",
  "eyeShape": "almond | round | hooded | monolid | downturned | upturned | etc.",
  "eyeColor": "deep brown | hazel-green | grey-blue | amber | etc.",
  "eyebrowShape": "arched | straight | thick | thin | etc.",
  "noseShape": "straight | aquiline | button | broad | narrow | etc.",
  "lipShape": "full | thin | bow-shaped | wide | etc.",
  "cheekbones": "high | soft | prominent | flat | etc.",
  "jawline": "sharp | rounded | square | tapered | etc.",
  "faceShape": "oval | round | square | heart | long | etc.",
  "hairColor": "jet black | auburn | platinum blonde | salt-and-pepper | etc.",
  "hairTexture": "straight | wavy | coily | curly | etc.",
  "hairLength": "buzzed | short | shoulder-length | long | etc.",
  "facialHair": "clean-shaven | stubble | full beard | mustache | goatee | etc.",
  "ageRange": "early 20s | mid 30s | late 50s | etc.",
  "distinguishingFeatures": "comma-separated list: freckles, dimples, glasses, beauty mark, scar, etc. — empty string if none"
}

Rules:
- Describe only what is visible. Do not infer ethnicity, nationality, mood, or personality.
- Each field is a short lowercase phrase, no trailing punctuation, no markdown.
- If a feature is genuinely indeterminable from the photo, use an empty string for that field.
- Return ONLY the JSON object. No preamble, no explanation, no code fences.`;
