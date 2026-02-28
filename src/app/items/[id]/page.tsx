
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MOCK_ITEMS } from '@/lib/mock-data';
import { MapPin, Calendar, Tag, User, Mail, ChevronLeft, Flag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AIMatches } from '@/components/ai-matches';
import { cn } from '@/lib/utils';

export default function ItemDetail() {
  const { id } = useParams();
  const item = MOCK_ITEMS.find(i => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Item Not Found</h1>
            <Link href="/items">
              <Button>Back to Browse</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isLost = item.status === 'lost';

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/items" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm group">
              <Image
                src={item.photoDataUri || 'https://picsum.photos/seed/detail/800/600'}
                alt={item.description}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                priority
              />
              <Badge
                className={cn(
                  "absolute left-4 top-4 px-4 py-1.5 text-sm shadow-lg",
                  isLost ? "bg-red-500" : "bg-accent text-accent-foreground"
                )}
              >
                {isLost ? 'LOST' : 'FOUND'}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                  <Image src={`https://picsum.photos/seed/detail-${i}/200/200`} alt="Thumbnail" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 capitalize">{item.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Posted on {item.datePosted}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-headline text-primary leading-tight">
                {item.description}
              </h1>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                {item.location}
              </div>
            </div>

            <Separator />

            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              <h3 className="font-bold text-xl font-headline">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reported by</p>
                    <p className="font-semibold text-lg">{item.posterName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email address</p>
                    <p className="font-semibold text-lg">{item.posterEmail}</p>
                  </div>
                </div>
              </div>
              <Button className="w-full h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <a href={`mailto:${item.posterEmail}`}>Send Message</a>
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" className="flex-1 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Flag className="h-4 w-4" />
                Report Post
              </Button>
            </div>
          </div>
        </div>

        {/* AI Matches Section */}
        <AIMatches currentItem={item} />
      </main>
    </div>
  );
}
