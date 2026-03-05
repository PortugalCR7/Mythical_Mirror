/**
 * Transforms raw JSON archetype data into a cinematic technical prompt.
 * @param {Object} archetype - The entry from master_archetypes_db.json
 * @param {string} userLikenessPrompt - A brief tag for the user likeness
 * @returns {string} - The expanded mythic brief
 */
export function augmentMythicPrompt(archetype, userLikenessPrompt = "the subject", tonalCore = "Ancient, sacred, and timeless.", regionalStory = "") {
  const { name, culture, description } = archetype;

  // Customizing the visual DNA based on your Master DB fields
  return `${description}. A photorealistic, ultra-detailed, cinematic, mythic hybrid synthesis of a subject with the following features: ${userLikenessPrompt}, as '${name}' from ${culture} mythology.
SCENE: Unreal Engine. Octane Render.
LIGHTING: Dramatic cinematic mythic lighting with volumetric ethereal shadows, god rays, and a golden bioluminescent aura.
ATMOSPHERE: ${tonalCore}. Mystical fog.
REGIONAL CONTEXT: ${regionalStory}.
TECHNICAL: 8k resolution, intricate textures, high-detail facial mesh blending, maintaining the subject's likeness while manifesting the divine artifacts of '${name}'.`.replace(/\s+/g, ' ').trim();
}