'use client';

import { useState, useMemo } from 'react';
import { Search, Tag, Loader2, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/item-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { CampusItem } from '@/lib/types';

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const firestore = useFirestore();
  
  // Memoize query to prevent infinite loops in useCollection
  const itemsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'items'), orderBy('datePosted', 'desc'));
  }, [firestore]);

  const { data: items, loading } = useCollection<CampusItem>(itemsQuery);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    let result = items.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.description.toLowerCase().includes(searchLower) || 
        item.location.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower);
        
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Apply client-side sorting based on selection
    return [...result].sort((a, b) => {
      const dateA = new Date(a.datePosted).getTime();
      const dateB = new Date(b.datePosted).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [items, searchQuery, categoryFilter, statusFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black font-headline text-primary">Browse Listings</h1>
            <p className="text-muted-foreground">Find what you lost or return what you found on campus.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap gap-2 bg-white p-1 rounded-xl border shadow-sm">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'ghost'} 
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'lost' ? 'default' : 'ghost'} 
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={() => setStatusFilter('lost')}
            >
              Lost
            </Button>
            <Button 
              variant={statusFilter === 'found' ? 'default' : 'ghost'} 
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={() => setStatusFilter('found')}
            >
              Found
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10 p-4 bg-white rounded-2xl shadow-sm border">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search description, location, or keywords..." 
              className="pl-10 h-11 border-muted focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 border-muted">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="keys">Keys</SelectItem>
                <SelectItem value="wallets">Wallets</SelectItem>
                <SelectItem value="stationery">Stationery</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 border-muted">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Results
              <Badge variant="secondary" className="rounded-full px-2.5">
                {filteredItems.length}
              </Badge>
            </h2>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-muted-foreground bg-white/50 rounded-2xl border border-dashed">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              <p className="font-medium">Refreshing campus records...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center space-y-6 bg-white rounded-2xl border border-dashed shadow-sm">
              <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="h-10 w-10 opacity-40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-headline text-primary">No results found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  We couldn't find anything matching your current filters. Try broader terms or check back later!
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/5"
                onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all'); }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
