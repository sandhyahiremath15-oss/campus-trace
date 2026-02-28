
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { firebaseConfig } from '@/firebase/config';

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
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      setConfigError(true);
    }
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
        title: "Account Ready!",
        description: "Successfully signed in with Google.",
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
        title: "Account Created!",
        description: "Welcome to CampusTrace.",
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 font-body">
      <div className="max-w-[1024px] w-full flex flex-col md:flex-row items-center gap-12 md:gap-24 animate-in fade-in duration-700">
        
        {/* Left Side: Brand Info */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <MapPin className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-slate-900 tracking-tight">
            Create account
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Join the community to reunite with your lost items.
          </p>
          
          <div className="hidden md:block pt-8">
            <p className="text-sm text-slate-400">
              Already have an account? 
              <br />
              <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline mt-1">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Box */}
        <div className="w-full max-w-[450px] border border-slate-200 rounded-[24px] p-8 md:p-10 bg-white shadow-2xl shadow-slate-100 flex flex-col min-h-[500px]">
          {configError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription>
                Firebase configuration is missing.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSignUp} className="flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-sm font-semibold text-slate-700">Full name</Label>
                <Input 
                  id="fullname" 
                  placeholder="John Doe" 
                  className="h-14 text-lg rounded-xl border-slate-200" 
                  required 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@university.edu" 
                  className="h-14 text-lg rounded-xl border-slate-200" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Create password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Min. 6 characters" 
                  className="h-14 text-lg rounded-xl border-slate-200" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full h-14 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 gap-3"
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
                      Register with Google
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Link href="/auth/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Sign in instead
              </Link>
              <Button 
                type="submit" 
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-blue-100"
                disabled={loading || configError}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Next"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
