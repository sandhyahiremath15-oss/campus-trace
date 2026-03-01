'use client';

import { useState, useEffect, useMemo } from 'react';
import { aiMatchingSuggestions } from '@/ai/flows/ai-matching-suggestions';
import { CampusItem } from '@/lib/types';
import { Sparkles, Loader2, CheckCircle2, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItemCard } from './item-card';
import { useFirestore, useCollection } from '@/firebase';
import { getPotentialMatchesQuery } from '@/lib/db';
import { Progress } from '@/components/ui/progress';

interface AIMatchesProps {
  currentItem: CampusItem;
}

export function AIMatches({ currentItem }: AIMatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const firestore = useFirestore();

  const itemsQuery = useMemo(() => {
    if (!firestore) return null;
    return getPotentialMatchesQuery(firestore, currentItem.type);
  }, [firestore, currentItem.type]);

  const { data: itemsToCompare, loading: itemsLoading } = useCollection<CampusItem>(itemsQuery);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (aiLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 500);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

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
        console.error("Failed to fetch matching suggestions:", error);
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
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner">
        <div className="relative">
          <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary animate-pulse">
            <BrainCircuit className="h-10 w-10" />
          </div>
          <Loader2 className="h-24 w-24 absolute -top-2 -left-2 text-primary/30 animate-spin" />
        </div>
        <div className="space-y-4 w-full max-w-xs mx-auto">
          <div className="space-y-2">
            <p className="font-black text-slate-900 font-headline uppercase tracking-widest text-xs">Smart Matchmaking</p>
            <p className="text-slate-500 font-medium text-sm">Analyzing physical attributes and location data to find the owner...</p>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section className="space-y-8 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent/20 text-accent ring-1 ring-accent/30 shadow-lg shadow-accent/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Smart Matches</h2>
            <p className="text-slate-500 text-sm font-medium">Potential connections identified between listings.</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((item) => (
          <div key={item.id} className="group space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <ItemCard item={item} />
            <Card className="border-accent/20 bg-accent/5 rounded-2xl shadow-sm ring-1 ring-accent/10 transition-all group-hover:bg-accent/10">
              <CardContent className="p-4 text-sm flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <span className="font-black text-accent uppercase text-[10px] tracking-widest block mb-1">Match Reasoning</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{item.matchReason}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
