'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item based on its specific description using Gemini 2.5 Flash Image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemImageInputSchema = z.object({
  title: z.string().describe('The title of the item.'),
  description: z.string().describe('A detailed description of the item including color, shape, and unique markings.'),
});
export type GenerateItemImageInput = z.infer<typeof GenerateItemImageInputSchema>;

const GenerateItemImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateItemImageOutput = z.infer<typeof GenerateItemImageOutputSchema>;

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
    // Using Gemini 2.5 Flash Image (Nano-Banana) for generation
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: `Generate a single, professional, high-resolution product photograph of a lost or found campus item.
      
      ITEM: ${input.title}
      DESCRIPTION: ${input.description}
      
      VISUAL RULES:
      - The image MUST strictly show the item described.
      - The item must be centered and in clear focus.
      - Background: A clean, neutral, blurred campus setting (library desk or stone bench).
      - Lighting: Bright, natural, professional.
      - No people, no text, no watermarks.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!response.media || !response.media.url) {
      throw new Error('Failed to generate accurate item image');
    }

    return {
      imageUrl: response.media.url,
    };
  }
);
