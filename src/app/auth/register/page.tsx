
'use client';

import Link from 'next/link';
import { MapPin, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-body p-4">
      <div className="max-w-md w-full space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:rotate-12 transition-transform">
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-primary font-headline">
              CampusTrace
            </span>
          </Link>
          <h1 className="text-3xl font-black font-headline text-primary">Join the Community</h1>
          <p className="text-muted-foreground mt-2">Help others and get your things back faster.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullname" placeholder="John Doe" className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john.doe@university.edu" className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Min. 8 characters" className="pl-10 h-12" required />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" id="terms" className="rounded border-muted text-primary focus:ring-primary" required />
            <label htmlFor="terms">I agree to the <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link></label>
          </div>

          <Button className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90">
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <p className="text-center text-muted-foreground">
          Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
