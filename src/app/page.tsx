
import Link from 'next/link';
import { MapPin, Search, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { MOCK_ITEMS } from '@/lib/mock-data';
import { ItemCard } from '@/components/item-card';

export default function Home() {
  const latestItems = MOCK_ITEMS.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <MapPin className="h-4 w-4" />
                <span>Trusted Campus Lost & Found</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black font-headline text-primary leading-tight">
                Trace it back to its <span className="text-accent underline decoration-4 underline-offset-8">owner.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                The community-driven platform for finding lost items and returning found belongings on campus. Powered by AI to match reports instantly.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/post-item">
                  <Button size="lg" className="h-14 px-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90">
                    Report an Item
                  </Button>
                </Link>
                <Link href="/items">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary/5">
                    Browse All
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 bg-primary/5 blur-3xl rounded-full -z-10" />
          <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -z-10" />
        </section>

        {/* Latest Listings */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold font-headline">Latest Listings</h2>
                <p className="text-muted-foreground mt-1">Recently reported lost and found items in your area.</p>
              </div>
              <Link href="/items" className="text-primary font-semibold flex items-center gap-1 group">
                View all items
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Smart Search</h3>
                <p className="text-muted-foreground">Filter by category, location, and date to find exactly what you're looking for.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent">
                  <PlusCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Instant Reporting</h3>
                <p className="text-muted-foreground">Quick and easy form for reporting items you've found or lost on campus.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">AI Matching</h3>
                <p className="text-muted-foreground">Our AI cross-references listings to suggest potential matches between lost and found reports.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary font-headline">
              CampusTrace
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 CampusTrace. A community project for safer and more connected campuses.
          </p>
        </div>
      </footer>
    </div>
  );
}
