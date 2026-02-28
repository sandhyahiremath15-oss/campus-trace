
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { firebaseConfig } from '@/firebase/config';

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
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Check if Firebase config is present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("Firebase configuration is missing. Check your Vercel Environment Variables.");
      setConfigError(true);
    }

    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth || !db) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Auth service is not available. Please try again later.",
      });
      return;
    }
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
        title: "Welcome!",
        description: "Successfully signed in with Google.",
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
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Service Unavailable",
        description: "Firebase Auth not initialized.",
      });
      return;
    }
    
    setLoading(true);
    console.log("Attempting sign in for:", email);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Email Sign In Error:", error);
      let errorMessage = "Invalid email or password.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      }

      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-black font-headline text-primary">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage your lost and found reports.</p>
        </div>

        {configError && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Missing</AlertTitle>
            <AlertDescription>
              Firebase environment variables are not set. If you are on Vercel, ensure you've added them in the dashboard.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-xl space-y-6">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@university.edu" 
                  className="pl-10 h-12" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-sm text-primary hover:underline" onClick={() => toast({ title: "Coming Soon", description: "Password reset functionality is being implemented." })}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={loading || configError}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" /> Signing In...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative text-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <span className="relative bg-white px-2 text-xs text-muted-foreground uppercase">Or continue with</span>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 border-muted hover:bg-muted/50 gap-2 px-4 text-sm sm:text-base overflow-hidden" 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || configError}
            type="button"
          >
            {googleLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="truncate">University Google Account</span>
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-sm">
          Don't have an account? <Link href="/auth/register" className="text-primary font-bold hover:underline">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}
