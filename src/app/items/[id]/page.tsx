'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MapPin, User, ChevronLeft, Loader2, Info, CheckCircle2, ImageOff, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIMatches } from '@/components/ai-matches';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CampusItem } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isResolving, setIsResolving] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const itemDocRef = useMemo(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'items', id as string);
  }, [firestore, id]);

  const { data: item, loading } = useDoc<CampusItem>(itemDocRef);

  const handleResolve = async () => {
    if (!firestore || !id || !item) return;
    setIsResolving(true);
    try {
      const docRef = doc(firestore, 'items', id as string);
      await updateDoc(docRef, { status: 'closed' });
      toast({
        title: "Item Resolved!",
        description: "Your report has been marked as resolved.",
      });
    } catch (error) {
      console.error("Error resolving item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update item status.",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const displayImage = useMemo(() => {
    // If we have a user/AI image and it hasn't errored yet, use it
    if (item?.imageUrl && item.imageUrl.trim() !== "" && !imgError) {
      return item.imageUrl;
    }
    // Fallback to category placeholder
    const categoryPlaceholder = PlaceHolderImages.find(p => p.id === item?.category);
    return categoryPlaceholder?.imageUrl || PlaceHolderImages.find(p => p.id === 'other')?.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop';
  }, [item?.imageUrl, item?.category, imgError]);

  const imageHint = useMemo(() => {
    if (item?.imageUrl && item.imageUrl.trim() !== "") return "reported item";
    const categoryPlaceholder = PlaceHolderImages.find(p => p.id === item?.category);
    return categoryPlaceholder?.imageHint || "campus item";
  }, [item?.imageUrl, item?.category]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-black text-primary mb-4">Report Not Found</h1>
        <p className="text-muted-foreground mb-8">This item may have been removed or resolved.</p>
        <Link href="/items">
          <Button size="lg">Back to Feed</Button>
        </Link>
      </div>
    </div>
  );

  const isLost = item.type === 'lost';
  const isOwner = user?.uid === item.userId;
  const isOpen = item.status === 'open';

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/items" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6 hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border shadow-xl bg-slate-50 flex items-center justify-center">
            <Image 
              src={displayImage} 
              alt={item.title || 'Campus Item'} 
              fill 
              className="object-cover" 
              data-ai-hint={imageHint}
              onError={() => setImgError(true)}
              unoptimized={displayImage.startsWith('data:')}
            />
            <Badge className={cn("absolute left-6 top-6 px-6 py-2 shadow-2xl text-lg font-black uppercase tracking-widest", isLost ? "bg-red-500" : "bg-emerald-500 text-white")}>
              {item.type}
            </Badge>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="px-4 py-1 rounded-full uppercase text-xs font-bold tracking-wider">{item.category}</Badge>
                <Badge variant="outline" className={cn("px-4 py-1 rounded-full uppercase text-xs font-bold tracking-wider", isOpen ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground")}>
                  {item.status}
                </Badge>
              </div>
              <h1 className="text-5xl font-black text-slate-900 leading-tight break-words">{item.title || 'Untitled Report'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-lg">
                <MapPin className="h-5 w-5 text-accent" />
                {item.location}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" /> 
                Report Description
              </h3>
              <p className="text-slate-500 text-lg leading-relaxed whitespace-pre-wrap italic">
                "{item.description}"
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900">
                {isOwner ? "Manage Your Report" : "Contact Reporter"}
              </h3>
              
              {isOwner ? (
                <div className="space-y-4">
                  {isOpen ? (
                    <Button 
                      className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]"
                      onClick={handleResolve}
                      disabled={isResolving}
                    >
                      {isResolving ? <Loader2 className="animate-spin h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                      Mark as Resolved
                    </Button>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-emerald-700 font-bold">
                      Report Resolved Successfully
                    </div>
                  )}
                  <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl" disabled>
                    Edit Details
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Posted By</p>
                      <p className="text-lg font-bold text-slate-800">{item.posterName || 'Campus User'}</p>
                    </div>
                  </div>
                  <Button className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20" asChild>
                    <a href={`mailto:${item.posterEmail}`}>
                      Contact Reporter
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-16">
            <AIMatches currentItem={item} />
          </div>
        )}
      </main>
    </div>
  );
}
