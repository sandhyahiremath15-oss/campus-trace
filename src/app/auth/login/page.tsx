'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Mail, ChevronRight, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Login() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('sandhya@gmail.com');
  const [password, setPassword] = useState('sandhya@123');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;

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
      console.error("Google Sign In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Could not sign in with Google.",
      });
    } finally {
      setGoogleLoading(false);
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-body selection:bg-white selection:text-black">
      {/* Top Navigation */}
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

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
        <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Log in to CampusTrace</h1>
            <p className="text-white/50 font-medium">Public access enabled for campus members</p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="h-14 bg-[#111] border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/30 text-white placeholder:text-white/20 transition-all"
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative group">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="h-14 bg-[#111] border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/30 text-white placeholder:text-white/20 transition-all"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all text-base"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Continue with Email"}
            </Button>
          </form>

          <div className="space-y-3 pt-2">
            <Button 
              type="button" 
              variant="outline"
              className="w-full h-14 rounded-xl border-white/10 bg-transparent text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-sm"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              className="w-full h-14 rounded-xl border-white/10 bg-transparent text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-sm opacity-50 cursor-not-allowed"
              disabled
            >
              <Globe className="h-5 w-5" />
              Continue with University SSO
            </Button>
          </div>

          <div className="text-center pt-8">
            <p className="text-white/40 text-sm">
              Don't have an account? <Link href="/auth/register" className="text-white hover:underline font-bold">Sign Up</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 text-center">
        <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
        </div>
      </footer>
    </div>
  );
}
