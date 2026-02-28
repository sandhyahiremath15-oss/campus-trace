'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting potential matches between a given item
 * (either lost or found) and a list of existing items of the opposite status.
 *
 * - aiMatchingSuggestions - A function that handles the AI matching process.
 * - AIMatchingSuggestionsInput - The input type for the aiMatchingSuggestions function.
 * - AIMatchingSuggestionsOutput - The return type for the aiMatchingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single item
const ItemSchema = z.object({
  id: z.string().describe('Unique identifier of the item.'),
  description: z.string().describe('A detailed description of the item.'),
  category: z.string().describe('The category of the item (e.g., electronics, apparel, stationery).'),
  location: z.string().describe('The location associated with the item (e.g., where it was lost/found).'),
  photoDataUri: z.string().optional().describe(
    "Optional photo of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  status: z.enum(['lost', 'found']).describe('The status of the item (lost or found).'),
});
export type Item = z.infer<typeof ItemSchema>; // Reusable type for individual items

// Define the input schema for the AI matching suggestions flow
const AIMatchingSuggestionsInputSchema = z.object({
  itemToMatch: ItemSchema.omit({id: true}).extend({id: z.string().optional()}).describe('The item (lost or found) for which to find potential matches.'),
  itemsToCompareAgainst: z.array(ItemSchema).describe('A list of existing items (of the opposite status) to compare against.'),
});
export type AIMatchingSuggestionsInput = z.infer<typeof AIMatchingSuggestionsInputSchema>;

// Define the output schema for a single matched item suggestion
const MatchedItemSuggestionSchema = z.object({
  id: z.string().describe('The ID of the suggested matched item from the itemsToCompareAgainst list.'),
  reason: z.string().describe('A brief explanation of why this item is considered a potential match.'),
  score: z.number().min(0).max(1).optional().describe('A confidence score (0-1) indicating the strength of the match.'),
});

// Define the overall output schema for the AI matching suggestions flow
const AIMatchingSuggestionsOutputSchema = z.object({
  matchedItems: z.array(MatchedItemSuggestionSchema).describe('A list of potential matched items.'),
});
export type AIMatchingSuggestionsOutput = z.infer<typeof AIMatchingSuggestionsOutputSchema>;

// Wrapper function for the flow
export async function aiMatchingSuggestions(input: AIMatchingSuggestionsInput): Promise<AIMatchingSuggestionsOutput> {
  return aiMatchingSuggestionsFlow(input);
}

// Define the prompt for the AI matching suggestions
const prompt = ai.definePrompt({
  name: 'aiMatchingSuggestionsPrompt',
  input: { schema: AIMatchingSuggestionsInputSchema },
  output: { schema: AIMatchingSuggestionsOutputSchema },
  prompt: `You are an intelligent assistant designed to match lost and found items.
Your task is to review a primary item and a list of other items, identifying strong potential matches.

Consider the following details for matching:
- **Description:** Look for similarities in physical attributes, brands, colors, distinguishing marks, etc.
- **Category:** Items should ideally belong to the same or very similar categories.
- **Location:** Proximity of lost and found locations increases matching probability.

The primary item is:
Status: {{{itemToMatch.status}}}
Description: {{{itemToMatch.description}}}
Category: {{{itemToMatch.category}}}
Location: {{{itemToMatch.location}}}
{{#if itemToMatch.photoDataUri}}Photo: {{media url=itemToMatch.photoDataUri}}{{/if}}

Compare the primary item with the following existing items.
Only suggest matches if the existing item's status is the opposite of the primary item's status (e.g., if the primary item is 'lost', only match with 'found' items and vice versa).
For each potential match, provide the item's ID, a concise reason for the match, and an optional confidence score between 0 and 1.

Existing items to compare against:
{{#each itemsToCompareAgainst}}
---
ID: {{{this.id}}}
Status: {{{this.status}}}
Description: {{{this.description}}}
Category: {{{this.category}}}
Location: {{{this.location}}}
{{#if this.photoDataUri}}Photo: {{media url=this.photoDataUri}}{{/if}}
{{/each}}

Based on the comparison, provide a JSON array of matched items. If no matches are found, return an empty array.
`,
});

// Define the Genkit flow for AI matching suggestions
const aiMatchingSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiMatchingSuggestionsFlow',
    inputSchema: AIMatchingSuggestionsInputSchema,
    outputSchema: AIMatchingSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
