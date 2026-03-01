'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item using Gemini 2.5 Flash Image (Nano-Banana).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemImageInputSchema = z.object({
  title: z.string().describe('The title of the item.'),
  description: z.string().describe('A detailed description of the item.'),
  category: z.string().describe('The category of the item for visual reference.'),
});
export type GenerateItemImageInput = z.infer<typeof GenerateItemImageInputSchema>;

const GenerateItemImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateItemImageOutput = z.infer<typeof GenerateItemImageOutputSchema>;

/**
 * Generates a realistic visual of a campus item based on its title and description.
 * Uses Gemini 2.5 Flash Image (Nano-Banana).
 */
export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}

const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (input) => {
    // Construct a highly descriptive prompt for the model
    const prompt = `Task: Generate a realistic, high-quality photograph of this item: ${input.title}.
          
    SPECIFIC DETAILS TO REFLECT:
    - Item Name: ${input.title}
    - Visual Description: ${input.description}
    - Category: ${input.category}
    
    SCENE REQUIREMENTS:
    - The object should be resting naturally on a campus-like surface (e.g., a library table, grass, or a wooden bench).
    - Use natural lighting and a professional photography style.
    - IMPORTANT: Ensure the colors and physical characteristics mentioned in the description are clearly visible.
    - NO people, NO hands, NO faces.
    - NO text, NO watermarks, NO brand logos.
    - Focus strictly on the physical object described.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // Set permissive safety thresholds to avoid blocking generation of items like ID cards or wallets
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Nano-Banana failed to generate a visual for this item. Media was not returned.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
