'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item using Gemini 2.5 Flash Image (Nano-Banana).
 * 
 * - generateItemImage - A function that handles the AI image generation process.
 * - GenerateItemImageInput - The input type for the function.
 * - GenerateItemImageOutput - The return type for the function.
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
 * Uses Gemini 2.5 Flash Image (Nano-Banana) to ensure visual matching.
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
    // Highly descriptive prompt for Nano-Banana to ensure the visual matches the text description
    const prompt = `Task: Generate a realistic, professional photograph of a lost or found campus item.
          
    ITEM TO VISUALIZE:
    - Name: ${input.title}
    - Specific Details: ${input.description}
    - Category: ${input.category}
    
    VISUAL REQUIREMENTS:
    - The image MUST accurately reflect the colors, materials, and physical characteristics described in the "Specific Details".
    - Place the item naturally in a clean campus environment (e.g., on a wooden table, in a library, or on green grass).
    - Use natural lighting and soft focus for the background to make the item stand out.
    - DO NOT include any text, logos, hands, or faces in the image.
    - The style should look like a high-quality smartphone photo taken by a student.
    - If the item is "Spectacles", show them clearly with the described frame color and style.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Nano-Banana was unable to generate a visual for this item at this time.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
