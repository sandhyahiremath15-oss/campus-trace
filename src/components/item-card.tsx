
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Tag, ChevronRight, Heart, Loader2, ImageOff } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const savedQuery = useMemo(() => {
    if (!firestore || !user || !item?.id) return null;
    return query(
      collection(firestore, 'savedItems'), 
      where('userId', '==', user.uid), 
      where('itemId', '==', item.id)
    );
  }, [firestore, user, item?.id]);

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
        title: "Sign in required",
        description: "Join the community to save items.",
      });
      return;
    }
    if (!item?.id || isSaving || !firestore) return;

    setIsSaving(true);
    try {
      const saved = await toggleSaveItem(firestore, user.uid, item.id);
      setIsSaved(saved);
      toast({
        title: saved ? "Item Saved" : "Item Unsaved",
        description: saved ? "Added to your collection." : "Removed from your collection.",
      });
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = useMemo(() => {
    if (!mounted || !item?.createdAt) return '';
    try {
      const date = typeof item.createdAt.toDate === 'function' 
        ? item.createdAt.toDate() 
        : new Date(item.createdAt);
      
      if (isNaN(date.getTime())) return 'Recently';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  }, [mounted, item?.createdAt]);

  const displayImage = useMemo(() => {
    // If we have an image and no error, use it.
    if (item?.imageUrl && item.imageUrl.trim() !== "" && !imgError) {
      return item.imageUrl;
    }
    // Fallback to category placeholder if image is missing or errored
    const categoryPlaceholder = PlaceHolderImages.find(p => p.id === item?.category);
    return categoryPlaceholder?.imageUrl || PlaceHolderImages.find(p => p.id === 'other')?.imageUrl || `https://picsum.photos/seed/${item?.id || 'campus'}/600/400`;
  }, [item?.imageUrl, item?.category, item?.id, imgError]);

  const imageHint = useMemo(() => {
    if (item?.imageUrl && item.imageUrl.trim() !== "") return "user reported item";
    const categoryPlaceholder = PlaceHolderImages.find(p => p.id === item?.category);
    return categoryPlaceholder?.imageHint || "campus item";
  }, [item?.imageUrl, item?.category]);

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
  const posterInitial = (item.posterName?.charAt(0) || item.posterEmail?.charAt(0) || 'U').toUpperCase();

  return (
    <Card className="overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group border-none bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 rounded-[32px]">
      <Link href={`/items/${item.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
          {imgError && !item.imageUrl ? (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <ImageOff className="h-10 w-10" />
              <span className="text-[10px] font-black uppercase tracking-widest">Image missing</span>
            </div>
          ) : (
            <Image
              src={displayImage}
              alt={item.title || 'Campus Item'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              data-ai-hint={imageHint}
              onError={() => setImgError(true)}
              unoptimized={displayImage.startsWith('data:')}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          
          <Badge
            className={cn(
              "absolute right-4 top-4 px-4 py-1.5 font-bold shadow-lg z-10 rounded-[12px] uppercase tracking-widest text-[10px]",
              isLost ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            )}
          >
            {isLost ? 'Lost' : 'Found'}
          </Badge>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "absolute left-4 top-4 h-10 w-10 rounded-[12px] flex items-center justify-center shadow-lg transition-all z-20 backdrop-blur-md",
              isSaved 
                ? "bg-red-500 text-white" 
                : "bg-white/80 text-slate-400 hover:text-red-500"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={cn("h-4 w-4 transition-transform", isSaved && "fill-current scale-110")} />
            )}
          </button>

          {item.status !== 'open' && (
            <Badge variant="secondary" className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm text-[10px] font-black border-none shadow-lg text-slate-900 px-3 py-1 rounded-[10px] uppercase tracking-widest">
              {item.status}
            </Badge>
          )}
        </div>
        
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
            <Tag className="h-3 w-3" />
            {item.category}
          </div>
          <h3 className="font-bold text-xl line-clamp-1 leading-tight text-slate-900 group-hover:text-primary transition-colors tracking-tight">
            {item.title || 'Untitled Report'}
          </h3>
        </CardHeader>
        
        <CardContent className="px-6 pb-4 pt-0 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-white shadow-sm">
              <AvatarImage src={`https://picsum.photos/seed/${item.userId}/100/100`} />
              <AvatarFallback className="text-[8px] font-bold">{posterInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-700 leading-none">
                {item.posterName?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                {formattedDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            View
            <ChevronRight className="h-3 w-3" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
