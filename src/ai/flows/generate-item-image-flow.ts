
'use server';
/**
 * @fileOverview A campus item visualization AI agent using Gemini 2.5 Flash Image.
 * Generates a realistic visual representing the lost or found item.
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
 * Defined at the top level to avoid re-registration errors during Server Action lifecycle.
 */
const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (flowInput) => {
    const promptText = `Task: Generate a realistic, high-quality photograph of a specific campus item.
    
    Item Identity:
    - Title: ${flowInput.title}
    - Details: ${flowInput.description}
    - Category: ${flowInput.category}
    
    Requirements:
    1. The image MUST strictly represent the item described in the title and description.
    2. Style: A realistic photograph taken with a high-resolution smartphone camera.
    3. Setting: Place the item in a typical campus environment (e.g., a library desk, a wooden bench, or concrete pavement).
    4. Composition: Close-up shot, centered, with natural daylight lighting.
    5. Constraints: NO people, NO hands, NO text overlays, and NO artistic filters.
    
    The output should be a single clear image that matches the visual identity of the reported item.`;

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
      throw new Error('Nano-Banana was unable to generate a visual for this specific item description.');
    }

    return {
      imageUrl: media.url,
    };
  }
);

export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}
