'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Tag, ChevronRight, Heart, Loader2, Package } from 'lucide-react';
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
    if (!user) {
      toast({ title: "Sign In Required", description: "Log in to save items." });
      return;
    }
    if (!item?.id || isSaving || !firestore) return;
    setIsSaving(true);
    try {
      const saved = await toggleSaveItem(firestore, user.uid, item.id);
      setIsSaved(saved);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const displayImage = useMemo(() => {
    if (item?.imageUrl && item.imageUrl.trim() !== "" && !imgError) {
      return item.imageUrl;
    }
    const categoryPlaceholder = PlaceHolderImages.find(p => p.id === item?.category);
    return categoryPlaceholder?.imageUrl || PlaceHolderImages.find(p => p.id === 'other')?.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop';
  }, [item?.imageUrl, item?.category, imgError]);

  if (loading || !item) {
    return (
      <Card className="overflow-hidden border-none shadow-sm rounded-[32px]">
        <Skeleton className="aspect-[16/10] w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    );
  }

  const isLost = item.type === 'lost';

  return (
    <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-200/60 rounded-[32px] group hover:shadow-2xl hover:-translate-y-1 transition-all">
      <Link href={`/items/${item.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
          {imgError ? (
            <div className="text-center space-y-2 opacity-30">
              <Package className="h-10 w-10 mx-auto" />
              <p className="text-[10px] font-black uppercase">Image Unavailable</p>
            </div>
          ) : (
            <Image
              src={displayImage}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => setImgError(true)}
              unoptimized={displayImage.startsWith('data:')}
            />
          )}
          
          <Badge className={cn("absolute right-4 top-4 font-bold rounded-xl", isLost ? "bg-red-500" : "bg-emerald-500")}>
            {item.type.toUpperCase()}
          </Badge>

          <button onClick={handleSave} className={cn("absolute left-4 top-4 h-10 w-10 rounded-xl flex items-center justify-center bg-white/80 backdrop-blur-md shadow-lg", isSaved && "text-red-500")}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />}
          </button>
        </div>
        
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
            <Tag className="h-3 w-3" />
            {item.category}
          </div>
          <h3 className="font-bold text-xl line-clamp-1 text-slate-900 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </CardHeader>
        
        <CardContent className="px-6 pb-4 pt-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://picsum.photos/seed/${item.userId}/100/100`} />
              <AvatarFallback className="text-[8px] font-bold">U</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-bold text-slate-700">{item.posterName?.split(' ')[0]}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardFooter>
      </Link>
    </Card>
  );
}
