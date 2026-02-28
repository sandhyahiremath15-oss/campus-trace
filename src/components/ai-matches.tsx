
'use client';

import { useState, useEffect, useMemo } from 'react';
import { aiMatchingSuggestions } from '@/ai/flows/ai-matching-suggestions';
import { CampusItem } from '@/lib/types';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItemCard } from './item-card';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';

interface AIMatchesProps {
  currentItem: CampusItem;
}

export function AIMatches({ currentItem }: AIMatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const firestore = useFirestore();

  const itemsQuery = useMemo(() => {
    if (!firestore) return null;
    const oppositeType = currentItem.type === 'lost' ? 'found' : 'lost';
    return query(
      collection(firestore, 'items'), 
      where('type', '==', oppositeType),
      where('status', '==', 'open'),
      limit(10)
    );
  }, [firestore, currentItem.type]);

  const { data: itemsToCompare, loading: itemsLoading } = useCollection<CampusItem>(itemsQuery);

  useEffect(() => {
    async function fetchAiMatches() {
      if (!itemsToCompare || itemsToCompare.length === 0) return;
      
      setAiLoading(true);
      try {
        const result = await aiMatchingSuggestions({
          itemToMatch: currentItem,
          itemsToCompareAgainst: itemsToCompare
        });
        
        const suggestedItems = result.matchedItems.map(suggestion => {
          const item = itemsToCompare.find(i => i.id === suggestion.id);
          return item ? { ...item, matchReason: suggestion.reason, score: suggestion.score } : null;
        }).filter(Boolean);

        setMatches(suggestedItems);
      } catch (error) {
        console.error("Failed to fetch AI matches:", error);
      } finally {
        setAiLoading(false);
      }
    }

    if (!itemsLoading && itemsToCompare) {
      fetchAiMatches();
    }
  }, [currentItem, itemsToCompare, itemsLoading]);

  if (itemsLoading || aiLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="font-medium">AI is scanning listings for potential matches...</p>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-accent/20 text-accent"><Sparkles className="h-5 w-5" /></div>
        <h2 className="text-2xl font-bold font-headline">AI-Powered Suggestions</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((item) => (
          <div key={item.id} className="space-y-3">
            <ItemCard item={item} />
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-3 text-sm flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div><span className="font-semibold text-accent">Match Reason:</span> {item.matchReason}</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
