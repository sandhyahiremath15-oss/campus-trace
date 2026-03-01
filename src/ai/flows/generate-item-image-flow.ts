'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item using Gemini 2.5 Flash Image (Nano-Banana).
 * It uses a reference category image to guide the AI's style and accuracy.
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
    // Find a reference image based on category to give Nano-Banana style context
    const reference = PlaceHolderImages.find(p => p.id === input.category) || PlaceHolderImages.find(p => p.id === 'other')!;

    // Using Gemini 2.5 Flash Image (Nano-Banana)
    // We provide both the text description AND a reference image to ensure high-quality output
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {
          text: `Task: Generate a high-resolution, realistic smartphone photograph of a lost campus item.
          
          ITEM DETAILS:
          - Title: ${input.title}
          - Description: ${input.description}
          - Category: ${input.category}
          
          STYLE REQUIREMENTS:
          - Match the visual style and high-quality lighting of the provided reference image.
          - The item must be the sole focus, resting on a realistic campus surface (desk, bench, or grass).
          - Ensure the physical details (colors, marks, materials) mentioned in the description are perfectly accurate.
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

    // Extract the media part from the response
    const imagePart = response.message?.content.find(part => !!part.media);
    
    if (!imagePart || !imagePart.media || !imagePart.media.url) {
      throw new Error('Nano-Banana failed to produce a valid image part.');
    }

    return {
      imageUrl: imagePart.media.url,
    };
  }
);
