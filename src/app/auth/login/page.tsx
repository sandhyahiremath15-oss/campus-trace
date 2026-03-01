'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('sandhya@gmail.com');
  const [password, setPassword] = useState('sandhya@123');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router, mounted]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase authentication is not configured properly. Check your environment variables.",
      });
      return;
    }
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName || 'Campus User',
            email: user.email,
            profileImage: user.photoURL || '',
            createdAt: serverTimestamp(),
          });
        }
      }

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.email}`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      
      let description = error.message || "Could not sign in with Google.";
      if (error.code === 'auth/unauthorized-domain') {
        description = "This domain is not authorized. Please add " + window.location.hostname + " to the 'Authorized Domains' list in the Firebase Console (Authentication > Settings).";
      }

      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    if (!auth) return;
    setGuestLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: "Guest Access Enabled",
        description: "You are now browsing as a guest.",
      });
      router.push('/items');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Guest Access Failed",
        description: "Could not enable guest access.",
      });
    } finally {
      setGuestLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Access granted.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-body selection:bg-white selection:text-black">
      <nav className="flex justify-between items-center p-6 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-white" />
          <span className="text-xl font-bold tracking-tight">CampusTrace</span>
        </Link>
        <Link href="/auth/register">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold px-6 h-9">
            Sign Up
          </Button>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Welcome Back</h1>
            <p className="text-white/50 font-medium">Log in to manage your campus reports</p>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              type="button" 
              className="w-full h-14 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all flex items-center justify-center gap-3 text-sm"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <Globe className="h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>

            <Button 
              type="button" 
              variant="outline"
              className="w-full h-14 rounded-xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm"
              onClick={handleGuestSignIn}
              disabled={guestLoading}
            >
              {guestLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <Globe className="h-5 w-5" />
                  Continue as Guest
                </>
              )}
            </Button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
              <span className="bg-black px-4">OR EMAIL</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="h-14 bg-[#111] border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/30 text-white placeholder:text-white/20 transition-all"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                type="password" 
                placeholder="Password" 
                className="h-14 bg-[#111] border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/30 text-white placeholder:text-white/20 transition-all"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold transition-all text-base group"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center pt-6">
            <p className="text-white/40 text-sm">
              Don't have an account? <Link href="/auth/register" className="text-white hover:underline font-bold">Create Account</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center mt-auto">
        <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  );
}
