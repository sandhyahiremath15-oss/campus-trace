
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Tag, ChevronRight } from 'lucide-react';
import { CampusItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ItemCardProps {
  item?: CampusItem;
  loading?: boolean;
}

export function ItemCard({ item, loading }: ItemCardProps) {
  if (loading || !item) {
    return (
      <Card className="overflow-hidden border-none shadow-sm">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <CardHeader className="p-4 pb-2 space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const isLost = item.type === 'lost';
  const formattedDate = item.createdAt?.toDate 
    ? item.createdAt.toDate().toLocaleDateString() 
    : item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent';

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-none bg-white shadow-sm ring-1 ring-slate-200/60">
      <Link href={`/items/${item.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.imageUrl || 'https://picsum.photos/seed/item/600/400'}
            alt={item.title || 'Campus Item'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint="lost found item"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge
            className={cn(
              "absolute right-3 top-3 px-3 py-1 font-bold shadow-lg",
              isLost ? "bg-red-500 hover:bg-red-600" : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {isLost ? 'LOST' : 'FOUND'}
          </Badge>
          {item.status !== 'open' && (
            <Badge variant="secondary" className="absolute left-3 top-3 bg-white/90 backdrop-blur-sm text-xs font-black border-none shadow-sm text-slate-900">
              {item.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-widest">
            <Tag className="h-3 w-3" />
            {item.category}
          </div>
          <h3 className="font-bold text-lg line-clamp-1 leading-tight text-slate-900 group-hover:text-primary transition-colors font-headline">
            {item.title || 'Untitled Report'}
          </h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t bg-slate-50/50 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            By {item.posterName?.split(' ')[0] || 'User'}
          </span>
          <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-wider">
            View details
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
