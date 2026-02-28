
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Heart, Bell, Loader2, Plus, CheckCircle2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { getUserItemsQuery } from '@/lib/db';
import { CampusItem } from '@/lib/types';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();

  const userItemsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return getUserItemsQuery(firestore, user.uid);
  }, [firestore, user]);

  const { data: myItems, loading: itemsLoading } = useCollection<CampusItem>(userItemsQuery);

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
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </aside>
            <div className="lg:col-span-3 space-y-8">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-12 w-40" />
              </div>
              <Skeleton className="h-12 w-full max-w-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="bg-white p-8 rounded-[32px] border shadow-xl shadow-slate-200/50">
              <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                <UserCircle className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-black font-headline text-slate-900 mb-2">Authentication Required</h2>
              <p className="text-slate-500 mb-8">Please sign in to view your personal dashboard and manage your reports.</p>
              <Button className="w-full h-12 rounded-xl text-lg font-bold" onClick={() => router.push('/auth/login')}>
                Sign In to Your Account
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-slate-50 ring-1 ring-slate-100 shadow-inner">
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                  {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-black font-headline text-slate-900">{user.displayName || 'Campus User'}</h2>
              <p className="text-sm text-slate-400 font-medium mb-6">{user.email}</p>
              <Button variant="outline" className="w-full gap-2 rounded-xl h-11 font-bold border-slate-200 hover:bg-slate-50">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <nav className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">My Account</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                <li>
                  <button className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-primary hover:bg-slate-50 transition-colors">
                    <Package className="h-4 w-4" />
                    My Listings
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                    <Heart className="h-4 w-4" />
                    Saved Items
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 font-medium">Manage your reports and track potential matches.</p>
              </div>
              <Button 
                onClick={() => router.push('/post-item')}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 h-12 rounded-xl font-bold shadow-lg shadow-accent/20 gap-2"
              >
                <Plus className="h-5 w-5" />
                Post New Item
              </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white border border-slate-200/60 p-1.5 h-14 w-full md:w-auto justify-start gap-2 rounded-2xl shadow-sm">
                <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-8 rounded-xl font-bold transition-all">
                  Active ({activeItems.length})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-8 rounded-xl font-bold transition-all">
                  Resolved ({resolvedItems.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="pt-6 outline-none">
                {itemsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <ItemCard key={i} loading />)}
                  </div>
                ) : activeItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeItems.map((item) => (
                      <div key={item.id} className="space-y-3">
                        <ItemCard item={item} />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-10 rounded-xl gap-2 font-bold text-accent border-accent/20 hover:bg-accent/5 hover:border-accent"
                          onClick={() => handleResolve(item.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as Resolved
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-slate-300 flex flex-col items-center gap-6 shadow-sm">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <Package className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-slate-900">No active listings</p>
                      <p className="text-slate-500">You don't have any open lost or found reports.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl px-8 h-11 font-bold border-slate-200" onClick={() => router.push('/post-item')}>
                      Create your first report
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="resolved" className="pt-6 outline-none">
                {resolvedItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resolvedItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-slate-300 shadow-sm">
                    <p className="text-slate-400 font-medium">Your resolution history will appear here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
