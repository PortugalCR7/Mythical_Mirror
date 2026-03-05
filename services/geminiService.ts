export const generateMythopoeticBrief = async (userData: any) => {

  console.log("Contacting the Oracle...");

  try {

    const response = await fetch('/api/generate-brief', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({ userData }),

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

 * THE ARTIST: Generates the Mythic Image (Imagen 3)

 * Note: Imagen 3 access via API Key is limited/specific.

 * If strictly using Gemini 2.0 Flash, we might need to rely on its capabilities

 * or check if the user has a specific endpoint that works with the API key.

 * For now, we will mock this or try a standard generation path if available,

 * but the original code used Vertex AI path which won't work in browser without a proxy.

 *

 * TEMPORARY FIX: Return the user image to prevent crash, as direct Vertex AI calls

 * from browser are blocked by CORS/Auth usually.

 */

export const generateMythicImage = async (base64Photo: string, prompt: string, archetype?: string, techId?: string) => {

  console.log("Contacting Biometric Uplink...");



  const response = await fetch('/api/generate-mythic-image', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

    },

    body: JSON.stringify({

      userImage: base64Photo,

      visualDescription: prompt,

      archetype,

      techId

    }),

  });



  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(errorData.error || 'Biometric Uplink Severed');

  }



  const data = await response.json();

  console.log("Biometric Uplink Successful. Traits:", data.physicalTraits);

  return data; // Expecting { image: base64, physicalTraits: string, archetypedata: object }

};