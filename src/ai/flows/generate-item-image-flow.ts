'use server';
/**
 * @fileOverview A campus item visualization AI agent using Gemini 2.5 Flash Image.
 * 
 * - generateItemImage - A function that handles the AI image generation process.
 * - GenerateItemImageInput - The input type for the function.
 * - GenerateItemImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
 * Generates a realistic visual of a campus item based on its title and description.
 * Uses Nano-Banana (Gemini 2.5 Flash Image) for high-fidelity matching.
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
    // The prompt is engineered to ensure Nano-Banana "reaches" for the exact user details
    const prompt = `Task: Generate a realistic photograph of a lost or found item.
    
    Item Title: ${input.title}
    Description: ${input.description}
    Category: ${input.category}
    
    Instructions:
    - Create a realistic, high-quality photograph of the item described above.
    - Focus strictly on the physical details provided (color, material, shape).
    - If the item is "Spectacles", show them clearly with the specific frame details mentioned.
    - Place the item on a neutral campus background (like a library table, grass, or concrete).
    - Use natural lighting and a high-end smartphone photography style.
    - DO NOT include any human hands, faces, or text in the image.
    - The image must look like a real photo taken by a student.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Nano-Banana was unable to generate a visual for this item.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
