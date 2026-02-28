'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Heart, Bell, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { getUserItemsQuery } from '@/lib/db';
import { CampusItem } from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();

  const userItemsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return getUserItemsQuery(firestore, user.uid);
  }, [firestore, user]);

  const { data: myItems, loading: itemsLoading } = useCollection<CampusItem>(userItemsQuery);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl font-black font-headline text-primary mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">Please sign in to view your personal dashboard and manage your reports.</p>
              <Button className="w-full" onClick={() => router.push('/auth/login')}>
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
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-muted">
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold font-headline">{user.displayName || 'Campus User'}</h2>
              <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
              <Button variant="outline" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <nav className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/30 border-b">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">My Account</h3>
              </div>
              <ul className="divide-y">
                <li>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary hover:bg-muted transition-colors">
                    <Package className="h-4 w-4" />
                    My Listings
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Heart className="h-4 w-4" />
                    Saved Items
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black font-headline text-primary">My Dashboard</h1>
                <p className="text-muted-foreground">Manage your reports and track potential matches.</p>
              </div>
              <Button 
                onClick={() => router.push('/post-item')}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 gap-2"
              >
                <Plus className="h-4 w-4" />
                Post New Item
              </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white border p-1 h-12 w-full md:w-auto justify-start gap-2">
                <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-6">
                  Active Listings ({activeItems.length})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-6">
                  Resolved ({resolvedItems.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="pt-6">
                {itemsLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activeItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed flex flex-col items-center gap-4">
                    <Package className="h-12 w-12 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">You don't have any active listings yet.</p>
                    <Button variant="outline" size="sm" onClick={() => router.push('/post-item')}>
                      Post your first report
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="resolved" className="pt-6">
                {resolvedItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resolvedItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                    <p className="text-muted-foreground">No resolved items yet. Hopefully soon!</p>
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
