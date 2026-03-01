'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a realistic image 
 * of a lost or found item based on its specific description using Gemini 2.5 Flash Image (Nano-Banana).
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
      prompt: `Task: Generate a professional, high-resolution product photograph of the following campus item.
      
      ITEM TITLE: ${input.title}
      ITEM DESCRIPTION: ${input.description}
      
      STYLE REQUIREMENTS:
      - The item must be the sole focus, perfectly centered.
      - Realistic lighting and textures.
      - Background: A slightly blurred, neutral campus setting like a university library shelf, a wooden desk, or a stone courtyard bench.
      - NO text, NO watermarks, NO people.
      - The image should look like a clear photo taken with a smartphone.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Extract the media part from the response
    const imagePart = response.message?.content.find(part => !!part.media);
    
    if (!imagePart || !imagePart.media || !imagePart.media.url) {
      // Fallback if the specific image model fails (sometimes due to modality constraints)
      throw new Error('AI generation failed to produce a valid image part.');
    }

    return {
      imageUrl: imagePart.media.url,
    };
  }
);
