
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, PlusCircle, LayoutDashboard, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Browse', href: '/items', icon: Search },
    { name: 'Post Item', href: '/post-item', icon: PlusCircle },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary font-headline">
              CampusTrace
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary flex items-center gap-1.5",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="/post-item">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Report Item
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
