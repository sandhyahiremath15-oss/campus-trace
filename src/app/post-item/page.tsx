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
        title: "Submission Failed",
        description: "You must be signed in to report an item.",
      });
      return;
    }

    if (!formData.category) {
      toast({ variant: "destructive", title: "Category Required", description: "Please select a category for your item." });
      return;
    }
    
    setIsSubmitting(true);
    let finalImageUrl = formData.imageUrl;

    // Auto-generate image if none provided by user
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
        console.error("Nano-Banana Generation failed:", err);
        // We continue anyway, the ItemCard will use a category fallback if imageUrl is empty
      } finally {
        setIsGeneratingImage(false);
      }
    }

    const itemData = {
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
    };

    try {
      await addDoc(collection(firestore, 'items'), itemData);
      setStep(2);
      toast({ title: "Report Published", description: "Your item is now live in the community feed." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to publish report. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin h-10 w-10 text-primary/40" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="text-center space-y-6 bg-white p-12 rounded-[40px] border shadow-xl max-w-sm">
          <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In Required</h2>
          <p className="text-slate-500 font-medium">You need to be logged in to report a lost or found item.</p>
          <Button className="w-full h-14 rounded-2xl font-bold text-lg" onClick={() => router.push('/auth/login')}>Log In Now</Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Report Published!</h1>
              <p className="text-slate-500 text-lg font-medium">Your report is now live. Smart matching is scanning for potential connections.</p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => router.push('/items')} size="lg" className="h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">Browse Feed</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="h-14 rounded-2xl font-bold text-slate-500">My Dashboard</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <Link href="/items" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold mb-8">
          <ChevronLeft className="h-5 w-5" />
          Back to Feed
        </Link>

        <div className="text-center space-y-2 mb-12">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Report an Item</h1>
          <p className="text-slate-500 text-lg font-medium">Help the community identify your item with accurate details.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-200/60 shadow-2xl shadow-slate-200/50 space-y-10">
          <div className="space-y-4">
            <Label className="text-lg font-bold text-slate-900">What happened?</Label>
            <RadioGroup 
              defaultValue="lost" 
              className="grid grid-cols-2 gap-4" 
              onValueChange={(val) => setFormData({...formData, type: val as 'lost' | 'found'})}
            >
              <div className={cn(
                "flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all",
                formData.type === 'lost' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
              )}>
                <RadioGroupItem value="lost" id="lost" className="h-5 w-5" />
                <Label htmlFor="lost" className="cursor-pointer font-bold text-base text-slate-700">I lost something</Label>
              </div>
              <div className={cn(
                "flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all",
                formData.type === 'found' ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-slate-200"
              )}>
                <RadioGroupItem value="found" id="found" className="h-5 w-5" />
                <Label htmlFor="found" className="cursor-pointer font-bold text-base text-slate-700">I found something</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="font-bold text-slate-700">Item Title</Label>
              <Input 
                id="title" 
                placeholder="E.g., Blue Spectacles" 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className="h-14 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-slate-700">Category</Label>
              <Select required onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger className="h-14 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="keys">Keys</SelectItem>
                  <SelectItem value="wallets">Wallets</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="font-bold text-slate-700">Detailed Description</Label>
            <Textarea 
              id="description" 
              placeholder="Provide colors, brands, or unique marks (e.g., 'Black round frame spectacles with a small scratch on left lens')..." 
              required 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="min-h-[140px] rounded-xl border-slate-200 p-4"
            />
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-slate-700">Location</Label>
            <Input 
              placeholder="E.g., Library 3rd floor quiet zone" 
              required 
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})} 
              className="h-14 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-slate-700">Photo</Label>
              {!formData.imageUrl && (
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Nano-Banana Gen Enabled
                </div>
              )}
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="border-3 border-dashed border-slate-100 rounded-[32px] p-12 text-center cursor-pointer hover:bg-slate-50 transition-all flex flex-col items-center gap-4 group"
            >
              {formData.imageUrl ? (
                <div className="relative aspect-video w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image src={formData.imageUrl} fill className="object-cover" alt="Preview" unoptimized />
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-[20px] bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Camera className="h-8 w-8 text-slate-300 group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-600">Upload a Photo</p>
                    <p className="text-sm text-slate-400 font-medium">Or let Nano-Banana generate a realistic photo based on your description.</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button type="submit" className="w-full h-16 text-xl font-bold bg-primary text-white rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" /> 
                {isGeneratingImage ? "Nano-Banana Visualizing..." : "Publishing Report..."}
              </span>
            ) : 'Publish Report'}
          </Button>
        </form>
      </main>
    </div>
  );
}
