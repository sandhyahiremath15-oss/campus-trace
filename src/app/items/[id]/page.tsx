
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MapPin, User, ChevronLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIMatches } from '@/components/ai-matches';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { CampusItem } from '@/lib/types';
import { useMemo } from 'react';

export default function ItemDetail() {
  const { id } = useParams();
  const firestore = useFirestore();
  
  const itemDocRef = useMemo(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'items', id as string);
  }, [firestore, id]);

  const { data: item, loading } = useDoc<CampusItem>(itemDocRef);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-black font-headline text-primary mb-4">Report Not Found</h1>
        <p className="text-muted-foreground mb-8">The item you're looking for might have been removed or moved.</p>
        <Link href="/items">
          <Button size="lg">Back to Browse</Button>
        </Link>
      </div>
    </div>
  );

  const isLost = item.type === 'lost';

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/items" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6 hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border shadow-xl bg-white group">
            <Image 
              src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/600`} 
              alt={item.title || 'Campus Item'} 
              fill 
              className="object-cover" 
            />
            <Badge className={cn("absolute left-6 top-6 px-6 py-2 shadow-2xl text-lg font-black uppercase tracking-widest", isLost ? "bg-red-500" : "bg-accent text-accent-foreground")}>
              {item.type}
            </Badge>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="px-4 py-1 rounded-full uppercase text-xs font-bold tracking-wider">{item.category}</Badge>
                <Badge variant="outline" className="px-4 py-1 rounded-full uppercase text-xs font-bold tracking-wider border-primary text-primary">{item.status}</Badge>
              </div>
              <h1 className="text-5xl font-black font-headline text-primary leading-tight">{item.title || 'Untitled Report'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-lg">
                <MapPin className="h-5 w-5 text-accent" />
                {item.location}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
              <h3 className="text-xl font-black font-headline text-primary flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" /> 
                Report Description
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
              <h3 className="text-xl font-black font-headline text-primary">Contact Reporter</h3>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Posted By</p>
                  <p className="text-xl font-bold">{item.posterName || 'Anonymous'}</p>
                </div>
              </div>
              <Button className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <a href={`mailto:${item.posterEmail}`}>
                  Contact via Email
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* AI Matches Section */}
        <div className="mt-16">
          <AIMatches currentItem={item} />
        </div>
      </main>
    </div>
  );
}
