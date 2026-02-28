
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MapPin, User, ChevronLeft, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIMatches } from '@/components/ai-matches';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CampusItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isResolving, setIsResolving] = useState(false);
  
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
        description: "Your report has been marked as resolved and moved to your history.",
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
                <Badge variant="outline" className={cn("px-4 py-1 rounded-full uppercase text-xs font-bold tracking-wider", isOpen ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground")}>
                  {item.status}
                </Badge>
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
              <h3 className="text-xl font-black font-headline text-primary">
                {isOwner ? "Manage Your Report" : "Contact Reporter"}
              </h3>
              
              {isOwner ? (
                <div className="space-y-4">
                  {isOpen ? (
                    <Button 
                      className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 flex items-center justify-center gap-2"
                      onClick={handleResolve}
                      disabled={isResolving}
                    >
                      {isResolving ? <Loader2 className="animate-spin h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                      Mark as Resolved
                    </Button>
                  ) : (
                    <div className="p-4 bg-muted/30 border rounded-2xl text-center text-muted-foreground font-medium">
                      This item has been marked as {item.status}.
                    </div>
                  )}
                  <Button variant="outline" className="w-full h-14 text-lg font-bold" disabled>
                    Edit Listing
                  </Button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Matches Section */}
        {isOpen && (
          <div className="mt-16">
            <AIMatches currentItem={item} />
          </div>
        )}
      </main>
    </div>
  );
}
