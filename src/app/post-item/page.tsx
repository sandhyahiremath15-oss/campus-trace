'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Tag, ArrowRight, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';

export default function PostItem() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    status: 'lost',
    description: '',
    category: '',
    location: '',
    photoDataUri: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 10MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoDataUri: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photoDataUri: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to post an item.",
      });
      return;
    }
    
    setIsSubmitting(true);

    const itemData = {
      ...formData,
      posterName: user.displayName || 'Campus User',
      posterEmail: user.email || 'user@university.edu',
      datePosted: new Date().toISOString(),
      userId: user.uid,
    };

    const itemsRef = collection(firestore, 'items');

    addDoc(itemsRef, itemData)
      .then(() => {
        setIsSubmitting(false);
        setStep(2);
        toast({
          title: "Success!",
          description: "Your report has been published to the community.",
        });
      })
      .catch(async (serverError) => {
        setIsSubmitting(false);
        const permissionError = new FirestorePermissionError({
          path: itemsRef.path,
          operation: 'create',
          requestResourceData: itemData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl font-black font-headline text-primary mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">You need to be signed in to report a lost or found item.</p>
              <Button className="w-full" onClick={() => router.push('/auth/login')}>
                Sign In to Continue
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-black font-headline text-primary">Report Published!</h1>
            <p className="text-muted-foreground">
              Thank you for contributing to the community. We've automatically started scanning for potential matches.
            </p>
            <div className="flex gap-4">
              <Button className="flex-1" variant="outline" onClick={() => router.push('/dashboard')}>
                My Posts
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => router.push('/items')}>
                Browse All
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-4 mb-10 text-center">
          <h1 className="text-4xl font-black font-headline text-primary">Report an Item</h1>
          <p className="text-muted-foreground">Provide as much detail as possible to increase the chances of a match.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-bold">What happened?</Label>
              <RadioGroup 
                defaultValue="lost" 
                className="flex gap-6"
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-xl flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost" className="font-semibold cursor-pointer">I lost something</Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-xl flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found" className="font-semibold cursor-pointer">I found something</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-bold">Item Description</Label>
              <Textarea 
                id="description" 
                placeholder="E.g., Blue iPhone 13 with a cracked screen and a NASA sticker on the back..." 
                className="min-h-[120px] text-base"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                AI works best with detailed descriptions including brand, color, and unique marks.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="category" className="text-lg font-bold">Category</Label>
                <Select 
                  required 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger id="category">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="keys">Keys</SelectItem>
                    <SelectItem value="wallets">Wallets</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-lg font-bold">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    placeholder="E.g., Main Library, 3rd Floor" 
                    className="pl-10" 
                    required 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-bold">Upload Photo</Label>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              
              {!formData.photoDataUri ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Camera className="h-8 w-8" />
                  </div>
                  <p className="font-semibold">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or JPEG (max. 10MB)</p>
                </div>
              ) : (
                <div className="relative aspect-video rounded-2xl overflow-hidden border">
                  <Image 
                    src={formData.photoDataUri} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                  />
                  <button 
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Post Listing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
