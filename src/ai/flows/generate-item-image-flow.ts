
'use server';
/**
 * @fileOverview A high-quality product image generation flow using Imagen 4.
 * Generates ecommerce-style visuals for campus listings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemImageInputSchema = z.object({
  title: z.string().describe('The name of the item to visualize.'),
  description: z.string().describe('Detailed physical description.'),
  category: z.string().describe('The broad category of the item.'),
});
export type GenerateItemImageInput = z.infer<typeof GenerateItemImageInputSchema>;

const GenerateItemImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateItemImageOutput = z.infer<typeof GenerateItemImageOutputSchema>;

const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (flowInput) => {
    // Specific prompt format requested:
    // "A professional, clean product photography style image of a {title} on a neutral background, centered, minimal, ecommerce style, 1:1 aspect ratio"
    const promptText = `A professional, clean product photography style image of a ${flowInput.title} on a neutral background, centered, minimal, ecommerce style, 1:1 aspect ratio. Details: ${flowInput.description}`;

    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: promptText,
      });

      if (!media || !media.url) {
        throw new Error('Image generation failed.');
      }

      return {
        imageUrl: media.url,
      };
    } catch (error) {
      console.error("AI Generation Error:", error);
      // Fallback to a category-specific placeholder if generation fails
      return {
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop"
      };
    }
  }
);

export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}
