
'use server';
/**
 * @fileOverview A campus item visualization AI agent using Gemini 2.5 Flash Image (Nano-Banana).
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
 * Defined at the top level to avoid re-registration errors during Server Action lifecycle.
 */
const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (flowInput) => {
    const promptText = `Task: Generate a realistic, high-quality photograph of a campus item.
    
    Item Details:
    - Title: ${flowInput.title}
    - Description: ${flowInput.description}
    - Category: ${flowInput.category}
    
    Requirements:
    1. The image MUST strictly represent the item described.
    2. The style must be a realistic photograph, taken with a smartphone.
    3. Place the item in a natural campus environment focus.
    4. NO text, hands, faces, or identifiable people.
    5. Output must be purely the generated image.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: promptText,
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

export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}
