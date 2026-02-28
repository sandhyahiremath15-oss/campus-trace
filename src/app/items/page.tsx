
'use client';

import { useState } from 'react';
import { Search, Filter, MapPin, Tag } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MOCK_ITEMS } from '@/lib/mock-data';
import { ItemCard } from '@/components/item-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black font-headline text-primary">Browse Listings</h1>
            <p className="text-muted-foreground">Find what you lost or return what you found.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap gap-3">
            <Badge variant="outline" className="h-8 px-4 cursor-pointer hover:bg-muted" onClick={() => setStatusFilter('all')}>All</Badge>
            <Badge variant={statusFilter === 'lost' ? 'default' : 'outline'} className="h-8 px-4 cursor-pointer" onClick={() => setStatusFilter('lost')}>Lost</Badge>
            <Badge variant={statusFilter === 'found' ? 'default' : 'outline'} className="h-8 px-4 cursor-pointer" onClick={() => setStatusFilter('found')}>Found</Badge>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 p-6 bg-white rounded-xl shadow-sm border">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by description or location..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
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
            </SelectContent>
          </Select>

          <Select defaultValue="newest">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Results
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {filteredItems.length}
              </span>
            </h2>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">No items found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all'); }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
