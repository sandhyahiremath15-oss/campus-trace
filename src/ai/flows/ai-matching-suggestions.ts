
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting potential matches between a given item
 * (either lost or found) and a list of existing items of the opposite type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ItemSchema = z.object({
  id: z.string().describe('Unique identifier of the item.'),
  title: z.string().describe('Short title of the item.'),
  description: z.string().describe('A detailed description of the item.'),
  category: z.string().describe('The category of the item (e.g., electronics, apparel, stationery).'),
  type: z.enum(['lost', 'found']).describe('The type of the item (lost or found).'),
  location: z.string().describe('The location associated with the item.'),
  imageUrl: z.string().optional().describe(
    "Optional photo of the item, as a data URI."
  ),
  status: z.enum(['open', 'matched', 'closed']).describe('The lifecycle status of the item.'),
});

const AIMatchingSuggestionsInputSchema = z.object({
  itemToMatch: ItemSchema.omit({id: true}).extend({id: z.string().optional()}),
  itemsToCompareAgainst: z.array(ItemSchema),
});
export type AIMatchingSuggestionsInput = z.infer<typeof AIMatchingSuggestionsInputSchema>;

const MatchedItemSuggestionSchema = z.object({
  id: z.string().describe('The ID of the suggested matched item.'),
  reason: z.string().describe('A brief explanation of why this item matches.'),
  score: z.number().min(0).max(1).optional(),
});

const AIMatchingSuggestionsOutputSchema = z.object({
  matchedItems: z.array(MatchedItemSuggestionSchema),
});
export type AIMatchingSuggestionsOutput = z.infer<typeof AIMatchingSuggestionsOutputSchema>;

export async function aiMatchingSuggestions(input: AIMatchingSuggestionsInput): Promise<AIMatchingSuggestionsOutput> {
  return aiMatchingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMatchingSuggestionsPrompt',
  input: { schema: AIMatchingSuggestionsInputSchema },
  output: { schema: AIMatchingSuggestionsOutputSchema },
  prompt: `You are an intelligent assistant designed to match lost and found items.
Your task is to review a primary item and a list of other items, identifying strong potential matches.

Consider the following details for matching:
- **Title & Description:** Look for similarities in physical attributes, brands, colors, distinguishing marks.
- **Category:** Items should belong to the same or very similar categories.
- **Location:** Proximity of lost and found locations increases matching probability.

The primary item is:
Type: {{{itemToMatch.type}}}
Title: {{{itemToMatch.title}}}
Description: {{{itemToMatch.description}}}
Category: {{{itemToMatch.category}}}
Location: {{{itemToMatch.location}}}
{{#if itemToMatch.imageUrl}}Photo: {{media url=itemToMatch.imageUrl}}{{/if}}

Compare the primary item with the following items.
Only suggest matches if the existing item's type is the opposite of the primary item's type.
Only suggest matches for items with status 'open'.

Existing items:
{{#each itemsToCompareAgainst}}
---
ID: {{{this.id}}}
Type: {{{this.type}}}
Title: {{{this.title}}}
Description: {{{this.description}}}
Category: {{{this.category}}}
Location: {{{this.location}}}
{{#if this.imageUrl}}Photo: {{media url=this.imageUrl}}{{/if}}
{{/each}}
`,
});

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
