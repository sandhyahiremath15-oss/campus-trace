'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Tag, SlidersHorizontal, PackageSearch, Filter, ChevronDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) || 
        item.location?.toLowerCase().includes(searchLower);
        
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = item.status === 'open';
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });

    return [...result].sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0;
        if (val.toDate) return val.toDate().getTime();
        return new Date(val).getTime() || 0;
      };
      const dateA = getTime(a.createdAt);
      const dateB = getTime(b.createdAt);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [items, searchQuery, categoryFilter, typeFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Campus Feed</h1>
            <p className="text-slate-500 font-medium text-lg">Discover and report lost belongings in real-time.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-sm ring-1 ring-slate-100/50">
            <button 
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                typeFilter === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
              )}
              onClick={() => setTypeFilter('all')}
            >
              All Items
            </button>
            <button 
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                typeFilter === 'lost' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:bg-slate-50"
              )}
              onClick={() => setTypeFilter('lost')}
            >
              Lost
            </button>
            <button 
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                typeFilter === 'found' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:bg-slate-50"
              )}
              onClick={() => setTypeFilter('found')}
            >
              Found
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          <div className="md:col-span-8 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by title, description or location..." 
              className="pl-14 h-16 rounded-[24px] border-slate-200 bg-white shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-primary/5 transition-all text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-4 flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-16 rounded-[24px] border-slate-200 bg-white shadow-xl shadow-slate-200/40 font-bold px-6">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="keys">Keys</SelectItem>
                <SelectItem value="wallets">Wallets</SelectItem>
                <SelectItem value="stationery">Stationery</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-16 w-[180px] rounded-[24px] border-slate-200 bg-white shadow-xl shadow-slate-200/40 font-bold px-6">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Live Community Log
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
            <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold">
              {loading ? '...' : filteredItems.length} Reports
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
            <div className="py-40 text-center space-y-6 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <PackageSearch className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No results found</h3>
                <p className="text-slate-400 font-medium">Try adjusting your keywords or clearing the filters.</p>
              </div>
              <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}