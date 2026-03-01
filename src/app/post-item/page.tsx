'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { generateItemImage } from '@/ai/flows/generate-item-image-flow';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PostItem() {
  const router = useRouter();
  const { toast } = useToast();
  const { isInitialized } = useFirebase();
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
        title: "Session Required",
        description: "Please sign in to publish a report.",
      });
      return;
    }

    if (!formData.category) {
      toast({ variant: "destructive", title: "Missing Category", description: "Please select an item category." });
      return;
    }
    
    setIsSubmitting(true);
    let finalImageUrl = formData.imageUrl;

    try {
      if (!finalImageUrl) {
        setIsGeneratingImage(true);
        try {
          const result = await generateItemImage({
            title: formData.title,
            description: formData.description,
            category: formData.category,
          });
          
          if (result?.imageUrl) {
            finalImageUrl = result.imageUrl;
          }
        } catch (err) {
          console.error("AI Visualization failed:", err);
        } finally {
          setIsGeneratingImage(false);
        }
      }

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
      toast({
        title: "Success",
        description: "Your report has been published.",
      });
    } catch (err: any) {
      console.error("Firestore submission error:", err);
      toast({ 
        variant: "destructive", 
        title: "Submission Error", 
        description: err.message || "Could not save your report." 
      });
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
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6 bg-white p-12 rounded-[40px] shadow-xl max-w-sm border border-slate-100">
            <h2 className="text-3xl font-bold">Sign In Required</h2>
            <p className="text-slate-500 font-medium">You must be logged in to contribute to the campus feed.</p>
            <Button className="w-full h-14 rounded-2xl font-bold" onClick={() => router.push('/auth/login')}>Log In</Button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Report Published!</h1>
            <p className="text-slate-500 font-medium text-lg">Your report is now live. The community will be notified of your update.</p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => router.push('/items')} size="lg" className="h-14 rounded-2xl font-bold shadow-lg">View Feed</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="h-14 rounded-2xl font-bold text-slate-500">My Dashboard</Button>
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
        <Link href="/items" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold mb-8 group">
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </Link>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-2xl space-y-8 border border-slate-100">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">New Report</h2>
            <p className="text-slate-500 font-medium">Provide clear details to help us match this item.</p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Report Type</Label>
            <RadioGroup 
              value={formData.type} 
              className="grid grid-cols-2 gap-4" 
              onValueChange={(val) => setFormData({...formData, type: val as 'lost' | 'found'})}
            >
              <div className={cn("flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all", formData.type === 'lost' ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50")}>
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="font-bold cursor-pointer">Lost Item</Label>
              </div>
              <div className={cn("flex items-center space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all", formData.type === 'found' ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:bg-slate-50")}>
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="font-bold cursor-pointer">Found Item</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label htmlFor="title" className="text-sm font-black uppercase tracking-widest text-slate-400">Item Title</Label>
            <Input id="title" placeholder="e.g. Blue Water Bottle" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-14 rounded-xl text-base shadow-sm" />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Category</Label>
            <Select required value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
              <SelectTrigger className="h-14 rounded-xl shadow-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
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
            <Label htmlFor="description" className="text-sm font-black uppercase tracking-widest text-slate-400">Detailed Description</Label>
            <Textarea id="description" placeholder="Brand, colors, unique stickers or marks..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[120px] rounded-xl text-base py-4 shadow-sm" />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Location</Label>
            <Input placeholder="e.g. Student Center, Level 1" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-14 rounded-xl text-base shadow-sm" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Visual</Label>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-1">
                <Sparkles className="h-3 w-3 mr-1" /> AI Visualization
              </Badge>
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className={cn(
                "border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:bg-slate-50 transition-all group",
                formData.imageUrl && "p-2 border-primary/20 bg-primary/5"
              )}
            >
              {formData.imageUrl ? (
                <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-lg">
                  <Image src={formData.imageUrl} fill className="object-cover" alt="Preview" unoptimized />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-white font-bold text-sm">Change Photo</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:bg-white group-hover:text-primary transition-colors">
                    <Camera className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Upload a photo</p>
                    <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">Or let AI generate a visual representation for you.</p>
                  </div>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-6 w-6" />
                {isGeneratingImage ? "Visualizing..." : "Publishing..."}
              </span>
            ) : "Publish Report"}
          </Button>
        </form>
      </main>
    </div>
  );
}