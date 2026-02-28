
'use client';

import { Navbar } from '@/components/navbar';
import { MOCK_ITEMS } from '@/lib/mock-data';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Package, Heart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dashboard() {
  // Simulate user's own items
  const myItems = MOCK_ITEMS.slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-muted">
                <AvatarImage src="https://picsum.photos/seed/user/200/200" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold font-headline">Alex Smith</h2>
              <p className="text-sm text-muted-foreground mb-6">alex.smith@university.edu</p>
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
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6">
                Post New Item
              </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white border p-1 h-12 w-full md:w-auto justify-start gap-2">
                <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-6">
                  Active Listings ({myItems.length})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-6">
                  Resolved
                </TabsTrigger>
                <TabsTrigger value="drafts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-6">
                  Drafts
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="pt-6">
                {myItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <ItemCard item={item} />
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="shadow-lg h-8">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                    <p className="text-muted-foreground">You don't have any active listings yet.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="resolved" className="pt-6">
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                  <p className="text-muted-foreground">No resolved items yet. Hopefully soon!</p>
                </div>
              </TabsContent>

              <TabsContent value="drafts" className="pt-6">
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                  <p className="text-muted-foreground">No saved drafts.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
