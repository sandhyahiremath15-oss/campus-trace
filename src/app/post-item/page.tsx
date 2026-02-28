
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Tag, ArrowRight, CheckCircle2, AlertCircle, X, Loader2, Type } from 'lucide-react';
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
    type: 'lost',
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
      ...formData,
      status: 'open',
      userId: user.uid,
      posterName: user.displayName || 'Campus User',
      posterEmail: user.email || '',
      createdAt: new Date().toISOString(),
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
  if (!user) return <div className="p-8 text-center"><Button onClick={() => router.push('/auth/login')}>Sign In to Post</Button></div>;

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
            <h1 className="text-3xl font-black font-headline text-primary">Report Published!</h1>
            <Button onClick={() => router.push('/items')}>Browse Listings</Button>
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
          <RadioGroup defaultValue="lost" className="flex gap-4" onValueChange={(val) => setFormData({...formData, type: val as any})}>
            <div className="flex items-center space-x-2 border p-4 rounded-xl flex-1"><RadioGroupItem value="lost" id="lost" /><Label htmlFor="lost">I lost something</Label></div>
            <div className="flex items-center space-x-2 border p-4 rounded-xl flex-1"><RadioGroupItem value="found" id="found" /><Label htmlFor="found">I found something</Label></div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="title">Item Title</Label>
            <Input id="title" placeholder="E.g., Blue Water Bottle" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea id="description" placeholder="Any unique marks, brand, color..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="keys">Keys</SelectItem>
                  <SelectItem value="wallets">Wallets</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="E.g., Library 2nd floor" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50">
              {formData.imageUrl ? <div className="relative aspect-video w-full"><Image src={formData.imageUrl} fill className="object-cover rounded-lg" alt="Preview" /></div> : <Camera className="mx-auto h-8 w-8 text-muted-foreground" />}
              <p className="text-sm mt-2">{formData.imageUrl ? 'Change Photo' : 'Upload Photo'}</p>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button type="submit" className="w-full h-12 bg-accent text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Post Listing'}
          </Button>
        </form>
      </main>
    </div>
  );
}
