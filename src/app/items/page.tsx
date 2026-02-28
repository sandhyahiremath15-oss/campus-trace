
'use client';

import { useState, useMemo } from 'react';
import { Search, Tag, SlidersHorizontal, PackageSearch } from 'lucide-react';
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
import { getItemsQuery } from '@/lib/db';
import { CampusItem } from '@/lib/types';

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const firestore = useFirestore();
  
  const itemsQuery = useMemo(() => {
    if (!firestore) return null;
    return getItemsQuery(firestore);
  }, [firestore]);

  const { data: items, loading } = useCollection<CampusItem>(itemsQuery);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    let result = items.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) || 
        item.location.toLowerCase().includes(searchLower);
        
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });

    return [...result].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [items, searchQuery, categoryFilter, typeFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-5xl font-black font-headline text-slate-900 tracking-tighter">Campus Feed</h1>
            <p className="text-slate-500 font-medium text-lg">Real-time lost & found community log.</p>
          </div>
          
          <div className="w-full md:w-auto flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm ring-1 ring-slate-100">
            <Button 
              variant={typeFilter === 'all' ? 'default' : 'ghost'} 
              size="sm"
              className="h-11 px-8 rounded-xl font-bold transition-all"
              onClick={() => setTypeFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={typeFilter === 'lost' ? 'default' : 'ghost'} 
              size="sm"
              className="h-11 px-8 rounded-xl font-bold transition-all"
              onClick={() => setTypeFilter('lost')}
            >
              Lost
            </Button>
            <Button 
              variant={typeFilter === 'found' ? 'default' : 'ghost'} 
              size="sm"
              className="h-11 px-8 rounded-xl font-bold transition-all"
              onClick={() => setTypeFilter('found')}
            >
              Found
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12 p-5 bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 animate-in fade-in zoom-in-95 duration-700 delay-100">
          <div className="md:col-span-6 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search items, keywords, locations..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 font-bold px-6">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
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
              <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 font-bold px-6">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-8 animate-in fade-in duration-700 delay-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black font-headline text-slate-900 tracking-tight uppercase tracking-widest text-[12px]">
              Live Results
            </h2>
            <Badge variant="secondary" className="rounded-full h-6 px-3 bg-slate-200 text-slate-700 font-bold border-none">
              {loading ? '...' : filteredItems.length}
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ItemCard key={i} loading />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="py-40 text-center space-y-6 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm animate-in zoom-in-95">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <PackageSearch className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Nothing found</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Try adjusting your filters or search keywords.</p>
              </div>
              <Button variant="outline" className="h-11 px-8 rounded-xl font-bold border-slate-200" onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
