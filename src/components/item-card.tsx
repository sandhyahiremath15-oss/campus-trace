
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { CampusItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: CampusItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const isLost = item.status === 'lost';

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md group">
      <Link href={`/items/${item.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.photoDataUri || 'https://picsum.photos/seed/item/600/400'}
            alt={item.description}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            data-ai-hint="lost found item"
          />
          <Badge
            className={cn(
              "absolute right-2 top-2",
              isLost ? "bg-red-500 hover:bg-red-600" : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {isLost ? 'LOST' : 'FOUND'}
          </Badge>
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1 capitalize">
            <Tag className="h-3 w-3" />
            {item.category}
          </div>
          <h3 className="font-semibold text-lg line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {item.description}
          </h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{item.datePosted}</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t bg-muted/30 flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">
            By {item.posterName}
          </span>
          <span className="text-primary font-semibold text-xs uppercase tracking-wider">
            View Details
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
