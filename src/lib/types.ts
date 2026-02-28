
import type { Item as AIItem } from '@/ai/flows/ai-matching-suggestions';

export type ItemStatus = 'lost' | 'found';

export interface CampusItem extends AIItem {
  id: string;
  posterName: string;
  posterEmail: string;
  datePosted: string;
  userId?: string;
}

export type Category = 'electronics' | 'apparel' | 'stationery' | 'keys' | 'wallets' | 'other';
