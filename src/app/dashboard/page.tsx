
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Heart, Bell, Plus, CheckCircle2, UserCircle, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useUser, useAuth } from '@/firebase';
import { getUserItemsQuery } from '@/lib/db';
import { CampusItem, SavedItem } from '@/lib/types';
import { doc, updateDoc, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DashboardView = 'listings' | 'saved' | 'notifications';

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [currentView, setCurrentView] = useState<DashboardView>('listings');
  const [savedItemsData, setSavedItemsData] = useState<CampusItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [isResolvingId, setIsResolvingId] = useState<string | null>(null);

  const isAnonymous = user?.isAnonymous;

  const userItemsQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return getUserItemsQuery(firestore, user.uid);
  }, [firestore, user?.uid]);

  const savedItemsMappingQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'savedItems'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: myItemsRaw, loading: itemsLoading } = useCollection<CampusItem>(userItemsQuery);
  const { data: savedMapping } = useCollection<SavedItem>(savedItemsMappingQuery);

  const sortedItems = useMemo(() => {
    if (!myItemsRaw) return [];
    return [...myItemsRaw].sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0;
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        const d = new Date(val).getTime();
        return isNaN(d) ? 0 : d;
      };
      return getTime(b.createdAt) - getTime(a.createdAt);
    });
  }, [myItemsRaw]);

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!firestore || !savedMapping || savedMapping.length === 0) {
        setSavedItemsData([]);
        return;
      }
      setSavedLoading(true);
      try {
        const itemIds = savedMapping.map(m => m.itemId).filter(Boolean);
        if (itemIds.length === 0) {
          setSavedItemsData([]);
          return;
        }

        const results: CampusItem[] = [];
        const chunks = [];
        for (let i = 0; i < itemIds.length; i += 10) {
          chunks.push(itemIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
          if (chunk.length === 0) continue;
          const q = query(collection(firestore, 'items'), where(documentId(), 'in', chunk));
          const snap = await getDocs(q);
          snap.forEach(doc => results.push({ id: doc.id, ...doc.data() } as CampusItem));
        }
        setSavedItemsData(results);
      } catch (err) {
        console.error("Error fetching saved items:", err);
      } finally {
        setSavedLoading(false);
      }
    };

    fetchSavedItems();
  }, [firestore, savedMapping]);

  const handleResolve = async (id: string) => {
    if (!firestore) return;
    setIsResolvingId(id);
    try {
      const docRef = doc(firestore, 'items', id);
      await updateDoc(docRef, { status: 'closed' });
      toast({
        title: "Item Resolved",
        description: "Your report has been marked as closed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resolve item.",
      });
    } finally {
      setIsResolvingId(null);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const userInitial = useMemo(() => {
    if (!user) return '?';
    if (user.isAnonymous) return 'G';
    return (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Skeleton className="h-96 w-full rounded-[40px]" />
            <div className="lg:col-span-3 space-y-8">
              <Skeleton className="h-20 w-full rounded-[24px]" />
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
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-12 rounded-[48px] text-center space-y-6">
            <div className="h-20 w-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-4 text-primary">
              <UserCircle className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Login Required</h2>
            <p className="text-slate-500 font-medium">Please sign in to access your personal dashboard.</p>
            <Button className="w-full h-14 rounded-2xl text-lg font-bold" onClick={() => router.push('/auth/login')}>
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const activeItems = sortedItems.filter(item => item.status === 'open');
  const resolvedItems = sortedItems.filter(item => item.status !== 'open');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-xl shadow-slate-100/50 text-center">
              <div className="relative inline-block mb-6">
                <Avatar className="h-28 w-28 border-4 border-white ring-1 ring-slate-100 shadow-xl">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} />
                  <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 h-6 w-6 bg-emerald-500 border-4 border-white rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight truncate px-2">
                {user.isAnonymous ? 'Guest User' : (user.displayName || 'Campus User')}
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-8 tracking-tight truncate px-2">
                {user.isAnonymous ? 'Public Session' : user.email}
              </p>
              
              <div className="space-y-3">
                {!user.isAnonymous && (
                  <Button variant="outline" className="w-full gap-2 rounded-2xl h-12 font-bold border-slate-200 hover:bg-slate-50">
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Button>
                )}
                {user.isAnonymous && (
                  <Button 
                    className="w-full gap-2 rounded-2xl h-12 font-bold bg-primary text-white"
                    onClick={() => router.push('/auth/register')}
                  >
                    Link Account
                  </Button>
                )}
                <Button variant="ghost" className="w-full gap-2 rounded-2xl h-12 font-bold text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            <nav className="bg-white rounded-[32px] border border-slate-200/60 shadow-lg shadow-slate-100/50 overflow-hidden p-2">
              <div className="space-y-1">
                <button 
                  onClick={() => setCurrentView('listings')}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all",
                    currentView === 'listings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Package className="h-4 w-4" />
                  My Listings
                </button>
                <button 
                  onClick={() => setCurrentView('saved')}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all",
                    currentView === 'saved' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Heart className="h-4 w-4" />
                  Saved Items
                </button>
                <button 
                  onClick={() => setCurrentView('notifications')}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all",
                    currentView === 'notifications' ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  Alerts Center
                </button>
              </div>
            </nav>
          </aside>

          <div className="lg:col-span-9 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  {currentView === 'listings' ? 'Manage Reports' : currentView === 'saved' ? 'My Collections' : 'Notifications'}
                </h1>
                <p className="text-slate-500 font-medium">
                  {currentView === 'listings' ? 'Track your active reports and campus history.' : 'Items you have bookmarked for tracking.'}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/post-item')}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 h-14 rounded-2xl font-bold shadow-xl shadow-accent/20 gap-2 transition-transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                New Report
              </Button>
            </div>

            {currentView === 'listings' && (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-white border border-slate-200/60 p-1 h-14 w-full md:w-auto rounded-2xl shadow-sm">
                  <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 rounded-xl font-bold">
                    Active ({activeItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 rounded-xl font-bold">
                    History ({resolvedItems.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="pt-8 outline-none">
                  {itemsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[1, 2, 3, 4].map(i => <ItemCard key={i} loading />)}
                    </div>
                  ) : activeItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {activeItems.map((item) => (
                        <div key={item.id} className="space-y-3">
                          <ItemCard item={item} />
                          <Button 
                            variant="outline" 
                            className="w-full h-12 rounded-xl gap-2 font-bold text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                            onClick={() => handleResolve(item.id)}
                            disabled={isResolvingId === item.id}
                          >
                            {isResolvingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Mark as Resolved
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center gap-6">
                      <div className="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                        <Package className="h-10 w-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-slate-900">No active reports</p>
                        <p className="text-slate-400 font-medium">You haven't posted any lost or found items yet.</p>
                      </div>
                      <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => router.push('/post-item')}>
                        Start Reporting
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
                    <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">No resolved items in your history.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {currentView === 'saved' && (
              <div className="pt-2">
                {savedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => <ItemCard key={i} loading />)}
                  </div>
                ) : savedItemsData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {savedItemsData.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center gap-6">
                    <div className="h-20 w-20 bg-red-50 rounded-[32px] flex items-center justify-center text-red-200">
                      <Heart className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-slate-900">Collection Empty</p>
                      <p className="text-slate-400 font-medium">Items you bookmark will appear here for easy tracking.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => router.push('/items')}>
                      Explore Campus Feed
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentView === 'notifications' && (
              <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100 flex flex-col items-center gap-4">
                <div className="h-20 w-20 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-200">
                  <Bell className="h-10 w-10" />
                </div>
                <p className="text-slate-400 font-bold text-lg">Your notifications center is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
