
'use client';

import { useState, useEffect } from 'react';
import { aiMatchingSuggestions, MatchedItemSuggestionSchema } from '@/ai/flows/ai-matching-suggestions';
import { CampusItem } from '@/lib/types';
import { MOCK_ITEMS } from '@/lib/mock-data';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCard } from './item-card';

interface AIMatchesProps {
  currentItem: CampusItem;
}

export function AIMatches({ currentItem }: AIMatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const itemsToCompare = MOCK_ITEMS.filter(item => item.id !== currentItem.id && item.status !== currentItem.status);
        const result = await aiMatchingSuggestions({
          itemToMatch: currentItem,
          itemsToCompareAgainst: itemsToCompare
        });
        
        // Find the actual item objects for the IDs returned by AI
        const suggestedItems = result.matchedItems.map(suggestion => {
          const item = itemsToCompare.find(i => i.id === suggestion.id);
          return item ? { ...item, matchReason: suggestion.reason, score: suggestion.score } : null;
        }).filter(Boolean);

        setMatches(suggestedItems);
      } catch (error) {
        console.error("Failed to fetch AI matches:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [currentItem]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="font-medium">AI is scanning listings for potential matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-accent/20 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold font-headline">AI-Powered Suggestions</h2>
      </div>
      <p className="text-muted-foreground">Our AI engine identified these items as potential matches based on your description.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((item) => (
          <div key={item.id} className="space-y-3">
            <ItemCard item={item} />
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-3 text-sm flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p><span className="font-semibold text-accent">Match Reason:</span> {item.matchReason}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
