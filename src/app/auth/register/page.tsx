
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Mail, Lock, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const [fullname, setFullname] = useState('');
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
        title: "Account Ready!",
        description: "Successfully signed up with Google.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not register with Google.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await updateProfile(user, { displayName: fullname });

      await setDoc(doc(db, 'users', user.uid), {
        name: fullname,
        email: email,
        profileImage: '',
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Welcome aboard!",
        description: "Your account has been created successfully.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to create account.",
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 md:p-6 font-body">
      <div className="flex flex-col items-center gap-4 mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            <MapPin className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-blue-600 font-headline tracking-tighter">CampusTrace</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] bg-white rounded-[24px] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 font-headline">Create your Account</h1>
          <p className="text-slate-500 mt-2">Join the campus lost & found network</p>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullname" className="text-sm font-semibold text-slate-700 ml-1">Full name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <Input 
                id="fullname" 
                placeholder="Sandhya" 
                className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-base"
                required 
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="sandhya@gmail.com" 
                className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-base"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" title="At least 6 characters" className="text-sm font-semibold text-slate-700 ml-1">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-base"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row-reverse items-center justify-between gap-4 pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto px-8 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all flex items-center justify-center gap-2 group"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  Register
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <Link href="/auth/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in instead
            </Link>
          </div>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
              <span className="bg-white px-4">OR</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 text-base"
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
                <span className="truncate">Continue with Google Account</span>
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        <div className="flex items-center justify-center gap-6">
          <Link href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-slate-600 transition-colors">Help Center</Link>
        </div>
      </div>
    </div>
  );
}
