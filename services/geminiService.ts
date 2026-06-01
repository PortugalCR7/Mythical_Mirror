/**
 * THE ORACLE: Generates the Mythopoetic Brief.
 * Sends the photo too — the brief endpoint runs narrative generation and
 * vision-based trait extraction in parallel, then bakes the structured
 * physical traits into the Imagen prompt it returns as `visual_attire`.
 */
export const generateMythopoeticBrief = async (userData: any, base64Photo?: string) => {
  console.log("Contacting the Oracle...");

  try {
    const response = await fetch('/api/generate-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userData, userImage: base64Photo }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'The Oracle is silent.');
    }

    const data = await response.json();
    console.log("Oracle Response:", data);
    return data;
  } catch (error) {
    console.error("The Oracle is silent:", error);
    throw error;
  }
};

/**
 * THE ARTIST: Renders the mythic portrait via Gemini 2.5 Flash Image
 * (image-to-image), so the actual face from the reference photo is preserved
 * inside the archetype rather than pasted onto a generic mythic body.
 */
export const generateMythicImage = async (base64Photo: string, prompt: string, archetype?: string, techId?: string) => {
  console.log("Contacting Biometric Uplink...");

  const response = await fetch('/api/generate-mythic-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userImage: base64Photo,
      visualDescription: prompt,
      archetype,
      techId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Biometric Uplink Severed');
  }

  const data = await response.json();
  console.log("Biometric Uplink Successful. Model:", data.model);
  return data;
};
