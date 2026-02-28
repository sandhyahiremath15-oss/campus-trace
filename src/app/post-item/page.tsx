
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, Loader2 } from 'lucide-react';
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    type: 'lost' as 'lost' | 'found',
    title: '',
    description: '',
    category: '',
    location: '',
    imageUrl: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max size is 10MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;
    
    setIsSubmitting(true);
    const itemData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      location: formData.location,
      imageUrl: formData.imageUrl,
      userId: user.uid,
      status: 'open',
      createdAt: serverTimestamp(),
      // Adding these for display convenience on details page
      posterName: user.displayName || 'Campus User',
      posterEmail: user.email || '',
    };

    try {
      await addDoc(collection(firestore, 'items'), itemData);
      setIsSubmitting(false);
      setStep(2);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      toast({ variant: "destructive", title: "Error", description: "Failed to publish report." });
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-4 bg-white p-8 rounded-2xl border shadow-sm max-w-sm">
        <h2 className="text-2xl font-black font-headline text-primary">Sign In Required</h2>
        <p className="text-muted-foreground">You need to be logged in to report a lost or found item.</p>
        <Button className="w-full" onClick={() => router.push('/auth/login')}>Log In Now</Button>
      </div>
    </div>
  );

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-black font-headline text-primary">Report Published!</h1>
            <p className="text-muted-foreground text-lg">Your report is now live. We'll scan for potential matches using AI.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/items')} size="lg" className="h-12">Browse All Listings</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>Go to My Dashboard</Button>
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
        <h1 className="text-4xl font-black font-headline text-primary text-center mb-8">Report an Item</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
          <div className="space-y-3">
            <Label className="text-lg font-bold">What happened?</Label>
            <RadioGroup 
              defaultValue="lost" 
              className="grid grid-cols-2 gap-4" 
              onValueChange={(val) => setFormData({...formData, type: val as 'lost' | 'found'})}
            >
              <div className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="cursor-pointer font-bold">I lost something</Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="cursor-pointer font-bold">I found something</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Item Title</Label>
            <Input 
              id="title" 
              placeholder="E.g., Blue Hydro Flask Water Bottle" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea 
              id="description" 
              placeholder="Mention any unique marks, brand names, colors, or identifying features..." 
              required 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select required onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Category" />
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
            <div className="space-y-2">
              <Label>Location</Label>
              <Input 
                placeholder="E.g., Library 2nd floor silent area" 
                required 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-all flex flex-col items-center gap-2 group"
            >
              {formData.imageUrl ? (
                <div className="relative aspect-video w-full max-w-[300px] border rounded-lg overflow-hidden">
                  <Image src={formData.imageUrl} fill className="object-cover" alt="Preview" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground">
                {formData.imageUrl ? 'Click to change photo' : 'Click to upload a photo of the item'}
              </p>
              <p className="text-xs text-muted-foreground/60">Max size 10MB. JPEG, PNG supported.</p>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Publishing Report...
              </span>
            ) : 'Publish Report'}
          </Button>
        </form>
      </main>
    </div>
  );
}
