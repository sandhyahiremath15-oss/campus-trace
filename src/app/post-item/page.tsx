'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, Loader2, Sparkles, AlertCircle, ChevronLeft } from 'lucide-react';
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
import { generateItemImage } from '@/ai/flows/generate-item-image-flow';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PostItem() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    title: '',
    description: '',
    category: '',
    location: '',
    imageUrl: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max size is 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Sign In Required",
        description: "Please log in to publish a report.",
      });
      return;
    }

    if (!formData.category) {
      toast({ variant: "destructive", title: "Category Required", description: "Please select an item category." });
      return;
    }
    
    setIsSubmitting(true);
    let finalImageUrl = formData.imageUrl;

    // AI Generation if no user photo
    if (!finalImageUrl) {
      setIsGeneratingImage(true);
      try {
        const result = await generateItemImage({
          title: formData.title,
          description: formData.description,
          category: formData.category,
        });
        if (result && result.imageUrl) {
          finalImageUrl = result.imageUrl;
        }
      } catch (err) {
        console.error("AI Generation failed:", err);
        toast({
          title: "Generation Notice",
          description: "AI visualization skipped. Using category placeholder.",
        });
      } finally {
        setIsGeneratingImage(false);
      }
    }

    try {
      await addDoc(collection(firestore, 'items'), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        location: formData.location,
        imageUrl: finalImageUrl || '',
        userId: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
        posterName: user.displayName || 'Campus User',
        posterEmail: user.email || '',
      });
      setStep(2);
      toast({ title: "Report Published", description: "Item successfully shared with the community." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to publish report." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-8 w-8 text-primary/40" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="text-center space-y-6 bg-white p-12 rounded-[40px] shadow-xl max-w-sm">
          <h2 className="text-3xl font-bold">Sign In Required</h2>
          <Button className="w-full h-14 rounded-2xl font-bold" onClick={() => router.push('/auth/login')}>Log In</Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold">Report Published!</h1>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => router.push('/items')} size="lg" className="h-14 rounded-2xl font-bold">View Feed</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="h-14 rounded-2xl font-bold">My Dashboard</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <Link href="/items" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold mb-8">
          <ChevronLeft className="h-5 w-5" />
          Back
        </Link>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-2xl space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-bold">Report Type</Label>
            <RadioGroup defaultValue="lost" className="grid grid-cols-2 gap-4" onValueChange={(val) => setFormData({...formData, type: val as 'lost' | 'found'})}>
              <div className={cn("flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer", formData.type === 'lost' ? "border-primary bg-primary/5" : "border-slate-100")}>
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="font-bold">Lost</Label>
              </div>
              <div className={cn("flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer", formData.type === 'found' ? "border-emerald-500 bg-emerald-50" : "border-slate-100")}>
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="font-bold">Found</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label htmlFor="title" className="font-bold">What is the item?</Label>
            <Input id="title" placeholder="e.g. Blue Spectacles" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-14 rounded-xl" />
          </div>

          <div className="space-y-4">
            <Label className="font-bold">Category</Label>
            <Select required onValueChange={(val) => setFormData({...formData, category: val})}>
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel/Accessories</SelectItem>
                <SelectItem value="keys">Keys</SelectItem>
                <SelectItem value="wallets">Wallets</SelectItem>
                <SelectItem value="stationery">Stationery</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label htmlFor="description" className="font-bold">Description</Label>
            <Textarea id="description" placeholder="Color, brand, markings..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[120px] rounded-xl" />
          </div>

          <div className="space-y-4">
            <Label className="font-bold">Location</Label>
            <Input placeholder="e.g. Library 2nd Floor" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-14 rounded-xl" />
          </div>

          <div className="space-y-4">
            <Label className="font-bold">Photo (Optional)</Label>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:bg-slate-50 transition-all">
              {formData.imageUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <Image src={formData.imageUrl} fill className="object-cover" alt="Preview" unoptimized />
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-500">Upload Photo</p>
                  <p className="text-xs text-slate-400">Or we'll generate one with AI</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button type="submit" className="w-full h-16 text-xl font-bold rounded-2xl" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                {isGeneratingImage ? "Nano-Banana Visualizing..." : "Publishing..."}
              </span>
            ) : "Publish Report"}
          </Button>
        </form>
      </main>
    </div>
  );
}
