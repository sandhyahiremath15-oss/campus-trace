
'use server';
/**
 * @fileOverview A campus item visualization AI agent using Gemini 2.5 Flash Image (Nano-Banana).
 * 
 * - generateItemImage - A function that handles the AI image generation process.
 * - GenerateItemImageInput - The input type for the function.
 * - GenerateItemImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateItemImageInputSchema = z.object({
  title: z.string().describe('The name of the item to visualize.'),
  description: z.string().describe('Detailed physical description including color, brand, and material.'),
  category: z.string().describe('The broad category of the item.'),
});
export type GenerateItemImageInput = z.infer<typeof GenerateItemImageInputSchema>;

const GenerateItemImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateItemImageOutput = z.infer<typeof GenerateItemImageOutputSchema>;

/**
 * Internal Genkit flow for generating images. 
 * Defined at the top level to prevent re-registration errors.
 */
const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (flowInput) => {
    const prompt = `Task: Generate a realistic, high-quality photograph of a campus item.
    
    Item Details:
    - Title: ${flowInput.title}
    - Description: ${flowInput.description}
    - Category: ${flowInput.category}
    
    Requirements:
    1. The image MUST strictly represent the item described above. If "Spectacles" are mentioned, show glasses. If "Blue water bottle" is mentioned, show that exact item.
    2. The style must be a realistic photograph, like one taken with a modern smartphone.
    3. Place the item in a natural campus environment (e.g., on a library table, a bench, or a classroom floor).
    4. Use natural lighting. Ensure the item is the central focus.
    5. DO NOT include any text, hands, faces, or identifiable people in the image.
    6. The output must be purely the generated image of the item.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Nano-Banana was unable to generate a visual for this specific item.');
    }

    return {
      imageUrl: media.url,
    };
  }
);

/**
 * Generates a realistic visual of a campus item based on its title and description.
 * Uses Nano-Banana (Gemini 2.5 Flash Image) for high-fidelity matching.
 */
export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}
