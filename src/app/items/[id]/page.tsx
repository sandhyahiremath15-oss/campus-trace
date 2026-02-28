
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MapPin, Calendar, User, Mail, ChevronLeft, Flag, Share2, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!item) return <div className="p-20 text-center"><h1>Item Not Found</h1><Link href="/items"><Button>Back to Browse</Button></Link></div>;

  const isLost = item.type === 'lost';

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/items" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6"><ChevronLeft className="h-4 w-4" />Back</Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm">
            <Image 
              src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/600`} 
              alt={item.title || 'Campus Item'} 
              fill 
              className="object-cover" 
            />
            <Badge className={cn("absolute left-4 top-4 px-4 py-1.5 shadow-lg", isLost ? "bg-red-500" : "bg-accent text-accent-foreground")}>
              {item.type.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline" className="capitalize">{item.status}</Badge>
              </div>
              <h1 className="text-4xl font-black font-headline text-primary">{item.title || 'Untitled Report'}</h1>
              <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" />{item.location}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h3 className="font-bold">Contact Reporter</h3>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User /></div>
                <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{item.posterName}</p></div>
              </div>
              <Button className="w-full bg-accent text-accent-foreground" asChild>
                <a href={`mailto:${item.posterEmail}`}>Send Email</a>
              </Button>
            </div>
          </div>
        </div>
        <AIMatches currentItem={item} />
      </main>
    </div>
  );
}
