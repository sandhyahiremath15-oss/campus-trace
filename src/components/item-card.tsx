
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Tag, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { CampusItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { toggleSaveItem } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where } from 'firebase/firestore';

interface ItemCardProps {
  item?: CampusItem;
  loading?: boolean;
}

export function ItemCard({ item, loading }: ItemCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const savedQuery = query(
    collection(firestore, 'savedItems'), 
    where('userId', '==', user?.uid || ''), 
    where('itemId', '==', item?.id || '')
  );
  const { data: savedData } = useCollection(user ? savedQuery : null);

  useEffect(() => {
    setIsSaved(!!savedData && savedData.length > 0);
  }, [savedData]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to save items.",
      });
      return;
    }
    if (!item || isSaving) return;

    setIsSaving(true);
    try {
      const saved = await toggleSaveItem(firestore, user.uid, item.id);
      setIsSaved(saved);
      toast({
        title: saved ? "Item Saved" : "Item Unsaved",
        description: saved ? "Added to your saved items." : "Removed from your saved items.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update saved status.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !item) {
    return (
      <Card className="overflow-hidden border-none shadow-sm bg-white ring-1 ring-slate-100">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  const isLost = item.type === 'lost';
  const formattedDate = item.createdAt?.toDate 
    ? item.createdAt.toDate().toLocaleDateString() 
    : item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent';

  return (
    <Card className="overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group border-none bg-white shadow-md ring-1 ring-slate-200/60">
      <Link href={`/items/${item.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.imageUrl || 'https://picsum.photos/seed/item/600/400'}
            alt={item.title || 'Campus Item'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="lost found item"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <Badge
            className={cn(
              "absolute right-3 top-3 px-3 py-1 font-black shadow-lg z-10",
              isLost ? "bg-red-500 hover:bg-red-600" : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {isLost ? 'LOST' : 'FOUND'}
          </Badge>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "absolute left-3 top-3 h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all z-20",
              isSaved 
                ? "bg-red-50 text-red-500 scale-110" 
                : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 hover:bg-white"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className={cn("h-5 w-5 transition-transform", isSaved && "fill-current scale-110")} />
            )}
          </button>

          {item.status !== 'open' && (
            <Badge variant="secondary" className="absolute left-3 bottom-3 bg-white/90 backdrop-blur-sm text-[10px] font-black border-none shadow-sm text-slate-900 px-3">
              {item.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-widest">
            <Tag className="h-3 w-3 text-accent" />
            {item.category}
          </div>
          <h3 className="font-bold text-xl line-clamp-1 leading-tight text-slate-900 group-hover:text-primary transition-colors font-headline">
            {item.title || 'Untitled Report'}
          </h3>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </CardContent>
        <CardFooter className="px-5 py-4 border-t bg-slate-50/40 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
              {item.posterName?.charAt(0) || 'U'}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {item.posterName?.split(' ')[0] || 'User'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-wider">
            Details
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
