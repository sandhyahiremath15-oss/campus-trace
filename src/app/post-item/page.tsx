
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, Loader2, ChevronLeft, ImagePlus, Wand2, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useFirebase, useAuth } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import Image from 'next/image';
import { generateItemImage } from '@/ai/flows/generate-item-image-flow';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PostItem() {
  const router = useRouter();
  const { toast } = useToast();
  const { isInitialized } = useFirebase();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    type: 'found' as 'lost' | 'found',
    title: '',
    description: '',
    category: '',
    location: '',
    imageUrl: '',
    price: '',
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
    
    if (!firestore) {
      toast({ variant: "destructive", title: "Connection Error", description: "Database is not initialized." });
      return;
    }

    if (!formData.category) {
      toast({ variant: "destructive", title: "Missing Category", description: "Please select an item category." });
      return;
    }
    
    setIsSubmitting(true);

    try {
      let finalUser = user;
      if (!finalUser && auth) {
        try {
          const result = await signInAnonymously(auth);
          finalUser = result.user;
        } catch (authErr) {
          console.warn("Anonymous auth failed");
        }
      }

      let finalImageUrl = formData.imageUrl;

      // Automatically generate image if not provided
      if (!finalImageUrl) {
        try {
          const aiResult = await generateItemImage({
            title: formData.title,
            description: formData.description,
            category: formData.category,
          });
          finalImageUrl = aiResult.imageUrl;
        } catch (err) {
          console.error("Auto image generation failed", err);
          finalImageUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop";
        }
      }

      await addDoc(collection(firestore, 'items'), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        location: formData.location,
        imageUrl: finalImageUrl,
        price: formData.price || 'N/A',
        userId: finalUser?.uid || 'anonymous_guest',
        status: 'open',
        createdAt: serverTimestamp(),
        posterName: finalUser?.displayName || 'Guest User',
        posterEmail: finalUser?.email || 'anonymous@campustrace.local',
      });
      
      setStep(2);
      toast({ title: "Success", description: "Your report has been published." });
    } catch (err: any) {
      console.error("Firestore submission error:", err);
      toast({ variant: "destructive", title: "Submission Error", description: "Could not save your report." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary/40" />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Published!</h1>
            <p className="text-slate-500 font-medium text-lg">Your report is now live with an AI-enhanced visual.</p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => router.push('/items')} size="lg" className="h-14 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20">View Feed</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="h-14 rounded-2xl font-bold text-slate-400">Dashboard</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href="/items" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold mb-8 group">
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </Link>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[48px] shadow-2xl space-y-10 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Post Listing</h2>
            <p className="text-slate-500 font-medium">Add details and let AI handle the photography.</p>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</Label>
            <RadioGroup 
              value={formData.type} 
              className="grid grid-cols-2 gap-4" 
              onValueChange={(val) => setFormData({...formData, type: val as 'lost' | 'found'})}
            >
              <div className={cn("flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all", formData.type === 'lost' ? "border-red-500 bg-red-50 text-red-900" : "border-slate-50 bg-slate-50/50")}>
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="font-bold cursor-pointer">Lost Item</Label>
              </div>
              <div className={cn("flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all", formData.type === 'found' ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-50 bg-slate-50/50")}>
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="font-bold cursor-pointer">Found Item</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Title</Label>
              <Input id="title" placeholder="e.g. Vintage Camera" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estimated Value ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="price" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-14 pl-10 rounded-2xl bg-slate-50 border-none shadow-inner" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</Label>
              <Select required value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
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
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location</Label>
              <Input placeholder="Last seen / Found at..." required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</Label>
            <Textarea id="description" placeholder="Provide details for AI generation..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none py-4 shadow-inner" />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Image (Optional)</Label>
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className={cn(
                "border-2 border-dashed border-slate-100 rounded-[32px] p-10 text-center cursor-pointer hover:bg-slate-50 transition-all group min-h-[180px] flex flex-col items-center justify-center bg-slate-50/30",
                formData.imageUrl && "p-2 border-primary/20 bg-primary/5"
              )}
            >
              {formData.imageUrl ? (
                <div className="relative aspect-video w-full rounded-[24px] overflow-hidden shadow-2xl">
                  <Image src={formData.imageUrl} fill className="object-cover" alt="Preview" unoptimized />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300 shadow-sm border border-slate-100 group-hover:text-primary transition-colors">
                    <Camera className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Upload a photo</p>
                    <p className="text-xs text-slate-400 max-w-[200px] mx-auto mt-1">Leave blank to let AI generate a professional product shot.</p>
                  </div>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.01]" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-6 w-6" />
                Processing AI Visual...
              </span>
            ) : "Publish Listing"}
          </Button>
        </form>
      </main>
    </div>
  );
}
