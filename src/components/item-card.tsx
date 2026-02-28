'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const savedQuery = useMemo(() => {
    if (!firestore || !user || !item) return null;
    return query(
      collection(firestore, 'savedItems'), 
      where('userId', '==', user.uid), 
      where('itemId', '==', item.id)
    );
  }, [firestore, user, item]);

  const { data: savedData } = useCollection(savedQuery);

  useEffect(() => {
    if (savedData) {
      setIsSaved(savedData.length > 0);
    }
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
    if (!item || isSaving || !firestore) return;

    setIsSaving(true);
    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const saved = await toggleSaveItem(firestore, user.uid, item.id);
      setIsSaved(saved);
      toast({
        title: saved ? "Item Saved" : "Item Unsaved",
        description: saved ? "Added to your collection." : "Removed from your collection.",
      });
    } catch (error) {
      setIsSaved(previousState);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update collection.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = useMemo(() => {
    if (!mounted || !item?.createdAt) return '...';
    try {
      const date = typeof item.createdAt.toDate === 'function' 
        ? item.createdAt.toDate() 
        : new Date(item.createdAt);
      
      if (isNaN(date.getTime())) return 'Recent';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'Recent';
    }
  }, [mounted, item?.createdAt]);

  if (loading || !item) {
    return (
      <Card className="overflow-hidden border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-[32px]">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-2/3 rounded-md" />
          </div>
        </div>
      </Card>
    );
  }

  const isLost = item.type === 'lost';
  const posterInitial = (item.posterName?.charAt(0) || 'U').toUpperCase();

  return (
    <Card className="overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group border-none bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/60 rounded-[32px]">
      <Link href={`/items/${item.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.imageUrl || 'https://picsum.photos/seed/item/600/400'}
            alt={item.title || 'Campus Item'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          <Badge
            className={cn(
              "absolute right-4 top-4 px-4 py-1.5 font-black shadow-2xl z-10 rounded-[12px] uppercase tracking-widest text-[10px]",
              isLost ? "bg-red-500 hover:bg-red-600 text-white" : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {isLost ? 'Lost' : 'Found'}
          </Badge>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "absolute left-4 top-4 h-11 w-11 rounded-[14px] flex items-center justify-center shadow-2xl transition-all z-20 backdrop-blur-md",
              isSaved 
                ? "bg-red-500 text-white scale-110" 
                : "bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className={cn("h-5 w-5 transition-transform", isSaved && "fill-current scale-110")} />
            )}
          </button>

          {item.status !== 'open' && (
            <Badge variant="secondary" className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm text-[10px] font-black border-none shadow-lg text-slate-900 px-4 py-1.5 rounded-[12px] uppercase tracking-widest">
              {item.status}
            </Badge>
          )}
        </div>
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary mb-2 uppercase tracking-[0.2em]">
            <Tag className="h-3 w-3 text-accent" />
            {item.category}
          </div>
          <h3 className="font-black text-2xl line-clamp-1 leading-tight text-slate-900 group-hover:text-primary transition-colors font-headline tracking-tighter">
            {item.title || 'Untitled Report'}
          </h3>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <div className="flex items-center gap-2.5 text-sm text-slate-500 font-bold">
            <MapPin className="h-5 w-5 shrink-0 text-accent" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-5 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
              <AvatarImage src={`https://picsum.photos/seed/${item.userId}/100/100`} />
              <AvatarFallback className="text-[8px] font-black">{posterInitial}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {item.posterName?.split(' ')[0] || 'User'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
            View Details
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}