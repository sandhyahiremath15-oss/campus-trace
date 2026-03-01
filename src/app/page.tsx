'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Search, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { ItemCard } from '@/components/item-card';
import { useFirestore, useCollection } from '@/firebase';
import { query, collection, limit } from 'firebase/firestore';
import { CampusItem } from '@/lib/types';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const latestQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'items'),
      limit(10)
    );
  }, [firestore]);

  const { data: rawItems, loading } = useCollection<CampusItem>(latestQuery);

  const latestItems = useMemo(() => {
    if (!rawItems) return [];
    
    const safeGetTime = (val: any) => {
      if (!val) return 0;
      if (typeof val.toDate === 'function') return val.toDate().getTime();
      const d = new Date(val).getTime();
      return isNaN(d) ? 0 : d;
    };

    return [...rawItems]
      .filter(item => item.status === 'open')
      .sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt))
      .slice(0, 3);
  }, [rawItems]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-white">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-6xl md:text-8xl font-black font-headline text-slate-900 leading-[0.9] tracking-tighter">
                Trace it back to <br />
                <span className="text-primary italic">its owner.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                The community-driven platform for reuniting campus belongings. 
                Smart matching, instant alerts, and zero friction.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/post-item" className="w-full sm:w-auto">
                  <Button size="lg" className="h-16 px-12 text-xl font-black rounded-[24px] w-full bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                    Report an Item
                  </Button>
                </Link>
                <Link href="/items" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-black rounded-[24px] w-full border-slate-200 hover:bg-slate-50 transition-all">
                    Browse Feed
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
          </div>
        </section>

        {/* Latest Listings */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline text-slate-900 tracking-tighter">Recently Reported</h2>
                <p className="text-slate-500 font-bold text-lg">Fresh entries from the campus community.</p>
              </div>
              <Link href="/items" className="text-primary font-black flex items-center gap-2 group text-lg">
                View All Items
                <div className="h-10 w-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <div key={i} className="h-[400px] rounded-[32px] bg-white animate-pulse border border-slate-100" />)}
              </div>
            ) : latestItems && latestItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {latestItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-lg">No active reports found. Be the first!</p>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-slate-900 text-white rounded-[60px] mx-4 mb-24 overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-3 gap-16 text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/20 rounded-[32px] flex items-center justify-center mx-auto text-primary">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tight">Smart Search</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">Filter by category, location, and date to find exactly what you're looking for.</p>
              </div>
              <div className="space-y-6">
                <div className="w-20 h-20 bg-accent/20 rounded-[32px] flex items-center justify-center mx-auto text-accent">
                  <PlusCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tight">Instant Reporting</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">Quick and easy form for reporting items you've found or lost on campus.</p>
              </div>
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/20 rounded-[32px] flex items-center justify-center mx-auto text-primary">
                  <MapPin className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tight">Smart Matching</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">Our matching system cross-references listings to suggest potential connections instantly.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(36,102,179,0.1),transparent_50%)]" />
        </section>
      </main>

      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-primary font-headline">
              CampusTrace
            </span>
          </div>
          <div className="flex justify-center gap-8 text-slate-400 font-bold text-sm uppercase tracking-widest">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
          <p className="text-slate-400 font-medium">
            © 2024 CampusTrace. Built for a connected campus community.
          </p>
        </div>
      </footer>
    </div>
  );
}
