
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item based on its specific description using Imagen 4.
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
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A high-resolution, professional product photograph of a lost/found campus item. 
      Item: ${input.title}. 
      Specific Visual Details: ${input.description}. 
      
      CRITICAL INSTRUCTION: The image must precisely reflect the physical description provided. If the user mentioned "spectacles" with "black frames", do not show anything else. 
      The item should be centered, sharply focused, and set against a clean, neutral, high-end surface (like light wood or marble). 
      The lighting should be natural and professional. No text, no people, no distorted shapes.`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate accurate item image');
    }

    return {
      imageUrl: media.url,
    };
  }
);
