
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Heart, Bell, Loader2, Plus, CheckCircle2, UserCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { getUserItemsQuery } from '@/lib/db';
import { CampusItem, SavedItem } from '@/lib/types';
import { doc, updateDoc, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DashboardView = 'listings' | 'saved' | 'notifications';

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const [currentView, setCurrentView] = useState<DashboardView>('listings');
  const [savedItemsData, setSavedItemsData] = useState<CampusItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Queries
  const userItemsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return getUserItemsQuery(firestore, user.uid);
  }, [firestore, user]);

  const savedItemsMappingQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'savedItems'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: myItems, loading: itemsLoading } = useCollection<CampusItem>(userItemsQuery);
  const { data: savedMapping } = useCollection<SavedItem>(savedItemsMappingQuery);

  // Fetch actual items from saved mapping
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!firestore || !savedMapping || savedMapping.length === 0) {
        setSavedItemsData([]);
        return;
      }
      setSavedLoading(true);
      try {
        const itemIds = savedMapping.map(m => m.itemId);
        // Firestore 'in' query has a limit of 10 items
        const chunks = [];
        for (let i = 0; i < itemIds.length; i += 10) {
          chunks.push(itemIds.slice(i, i + 10));
        }

        const results: CampusItem[] = [];
        for (const chunk of chunks) {
          const q = query(collection(firestore, 'items'), where(documentId(), 'in', chunk));
          const snap = await getDocs(q);
          snap.forEach(doc => results.push({ id: doc.id, ...doc.data() } as CampusItem));
        }
        setSavedItemsData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSavedLoading(false);
      }
    };

    if (currentView === 'saved') {
      fetchSavedItems();
    }
  }, [firestore, savedMapping, currentView]);

  const handleResolve = async (id: string) => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'items', id);
      await updateDoc(docRef, { status: 'closed' });
      toast({
        title: "Resolved",
        description: "Report marked as closed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resolve item.",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </aside>
            <div className="lg:col-span-3 space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-3">
                  <Skeleton className="h-12 w-64 rounded-xl" />
                  <Skeleton className="h-5 w-80 rounded-lg" />
                </div>
                <Skeleton className="h-12 w-48 rounded-xl" />
              </div>
              <Skeleton className="h-14 w-full max-w-md rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => <ItemCard key={i} loading />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white p-10 rounded-[40px] border shadow-2xl shadow-slate-200/50">
              <div className="h-24 w-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-primary">
                <UserCircle className="h-14 w-14" />
              </div>
              <h2 className="text-3xl font-black font-headline text-slate-900 mb-3 tracking-tight">Access Restricted</h2>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium text-lg">Sign in to your university account to manage your listings and see saved items.</p>
              <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" onClick={() => router.push('/auth/login')}>
                Sign In Now
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeItems = (myItems || []).filter(item => item.status === 'open');
  const resolvedItems = (myItems || []).filter(item => item.status !== 'open');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-100/50 text-center animate-in slide-in-from-left-4 duration-500">
              <Avatar className="h-28 w-28 mx-auto mb-6 border-4 border-white ring-1 ring-slate-100 shadow-2xl">
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                  {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-black font-headline text-slate-900 mb-1 tracking-tight">{user.displayName || 'Campus User'}</h2>
              <p className="text-sm text-slate-400 font-bold mb-8 tracking-tight">{user.email}</p>
              <Button variant="outline" className="w-full gap-2 rounded-2xl h-12 font-bold border-slate-200 hover:bg-slate-50 transition-all hover:border-primary/30">
                <Settings className="h-4 w-4" />
                Profile Settings
              </Button>
            </div>

            <nav className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-100/50 overflow-hidden animate-in slide-in-from-left-6 duration-700">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Account Control</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                <li>
                  <button 
                    onClick={() => setCurrentView('listings')}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-5 text-sm font-bold transition-all group",
                      currentView === 'listings' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Package className={cn("h-5 w-5", currentView === 'listings' ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                    My Listings
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView('saved')}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-5 text-sm font-bold transition-all group",
                      currentView === 'saved' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", currentView === 'saved' ? "text-white" : "text-slate-400 group-hover:text-red-500")} />
                    Saved Items
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView('notifications')}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-5 text-sm font-bold transition-all group",
                      currentView === 'notifications' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Bell className={cn("h-5 w-5", currentView === 'notifications' ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                    Notifications
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-5xl font-black font-headline text-slate-900 tracking-tighter">
                  {currentView === 'listings' ? 'My Dashboard' : currentView === 'saved' ? 'Saved Collections' : 'Alerts'}
                </h1>
                <p className="text-slate-500 font-bold text-lg mt-1">
                  {currentView === 'listings' ? 'Track your active and historical reports.' : 'Items you have bookmarked for later.'}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/post-item')}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 h-14 rounded-2xl font-black shadow-2xl shadow-accent/30 gap-3 text-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6" />
                Post Item
              </Button>
            </div>

            {currentView === 'listings' && (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-white border border-slate-200/60 p-2 h-16 w-full md:w-auto justify-start gap-3 rounded-[24px] shadow-sm">
                  <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-10 rounded-[18px] font-black transition-all">
                    Active ({activeItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-10 rounded-[18px] font-black transition-all">
                    History ({resolvedItems.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="pt-8 outline-none">
                  {itemsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[1, 2, 3, 4].map(i => <ItemCard key={i} loading />)}
                    </div>
                  ) : activeItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                      {activeItems.map((item) => (
                        <div key={item.id} className="space-y-4">
                          <ItemCard item={item} />
                          <Button 
                            variant="outline" 
                            className="w-full h-12 rounded-2xl gap-3 font-black text-accent border-accent/20 hover:bg-accent/5 hover:border-accent transition-all"
                            onClick={() => handleResolve(item.id)}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Mark as Resolved
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center gap-8 shadow-inner animate-in zoom-in-95">
                      <div className="h-24 w-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                        <Package className="h-12 w-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-slate-900 tracking-tight">Quiet on your end</p>
                        <p className="text-slate-400 font-bold text-lg">You haven't posted any lost or found items yet.</p>
                      </div>
                      <Button variant="outline" className="rounded-2xl px-10 h-14 font-black border-slate-200 text-lg hover:bg-slate-50" onClick={() => router.push('/post-item')}>
                        Report Your First Item
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="resolved" className="pt-8 outline-none">
                  {resolvedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {resolvedItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
                      <p className="text-slate-400 font-black text-xl">No historical records yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {currentView === 'saved' && (
              <div className="pt-4">
                {savedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => <ItemCard key={i} loading />)}
                  </div>
                ) : savedItemsData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
                    {savedItemsData.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center gap-8 shadow-inner">
                    <div className="h-24 w-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-200">
                      <Heart className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">Nothing bookmarked</p>
                      <p className="text-slate-400 font-bold text-lg">Save items you want to keep an eye on.</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl px-10 h-14 font-black border-slate-200 text-lg" onClick={() => router.push('/items')}>
                      Go to Campus Feed
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentView === 'notifications' && (
              <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <div className="h-24 w-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-blue-300">
                  <Bell className="h-12 w-12" />
                </div>
                <p className="text-slate-400 font-black text-xl">Your notifications center is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
