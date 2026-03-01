'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item using Gemini 2.5 Flash Image (Nano-Banana).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
    // Find a reference image based on category for lighting/style context
    const reference = PlaceHolderImages.find(p => p.id === input.category) || PlaceHolderImages.find(p => p.id === 'other')!;

    // Using Gemini 2.5 Flash Image (Nano-Banana) with direct media destructuring
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {
          text: `Task: Generate a realistic, high-quality photograph of this item: ${input.title}.
          
          SPECIFIC DETAILS:
          - Item: ${input.title}
          - Appearance: ${input.description}
          
          REQUIREMENTS:
          - Create a crisp, clear image of the object.
          - The object should be resting on a campus-like surface (e.g., a library table, grass, or a wooden bench).
          - Match the lighting and professional photography style of the provided reference.
          - NO people, NO text, NO watermarks.`,
        },
        {
          media: {
            url: reference.imageUrl,
            contentType: 'image/jpeg',
          },
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Nano-Banana failed to generate a visual for this item.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
