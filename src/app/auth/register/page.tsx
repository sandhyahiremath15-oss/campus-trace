
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
    // Check if Firebase config is present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("Firebase configuration is missing.");
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
    console.log("Attempting account creation for:", email);

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
      let errorMessage = "Failed to create account.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid university email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak.";
      }

      toast({
        variant: "destructive",
        title: "Registration Failed",
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
          <h1 className="text-3xl font-black font-headline text-primary">Join the Community</h1>
          <p className="text-muted-foreground mt-2">Help others and get your things back faster.</p>
        </div>

        {configError && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Missing</AlertTitle>
            <AlertDescription>
              Firebase environment variables are missing. Please configure them in your project settings.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-xl space-y-6">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="fullname" 
                  placeholder="John Doe" 
                  className="pl-10 h-12" 
                  required 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@university.edu" 
                  className="pl-10 h-12" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Min. 6 characters" 
                  className="pl-10 h-12" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
                  <Loader2 className="animate-spin h-5 w-5" /> Creating Account...
                </span>
              ) : (
                <>
                  Create Account
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
          Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
