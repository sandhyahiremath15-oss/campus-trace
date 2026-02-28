
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Mail, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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

      toast({
        title: "Welcome back!",
        description: "Signed in with Google.",
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
        description: "You are now signed in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Email Sign In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] p-4 font-body">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <MapPin className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-blue-600 font-headline tracking-tight">CampusTrace</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-800 font-headline mb-1">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Sign in to manage your lost and found reports.</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="email@university.edu" 
                className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-base"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-bold text-slate-700">Password</Label>
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-base"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <>
                Sign In
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">OR CONTINUE WITH</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            className="w-full h-14 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all gap-3 text-base"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                University Google Account
              </>
            )}
          </Button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 font-bold hover:underline transition-all">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
