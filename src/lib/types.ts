
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'matched' | 'closed';
export type MatchStatus = 'pending' | 'approved' | 'rejected';

export interface CampusItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  type: ItemType;
  status: ItemStatus;
  imageUrl?: string;
  userId: string;
  posterName: string;
  posterEmail: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  createdAt: string;
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  matchedAt: string;
  status: MatchStatus;
}

export type Category = 'electronics' | 'apparel' | 'stationery' | 'keys' | 'wallets' | 'other';
