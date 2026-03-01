
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'matched' | 'closed';
export type MatchStatus = 'pending' | 'approved' | 'rejected';

export interface CampusItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ItemType;
  location: string;
  imageUrl?: string;
  userId: string;
  status: ItemStatus;
  createdAt: any; // Firestore Timestamp
  price?: string; // New field for listings
  // Extra fields for de-normalization/UI convenience
  posterName?: string;
  posterEmail?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  createdAt: any; // Firestore Timestamp
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  matchedAt: any; // Firestore Timestamp
  status: MatchStatus;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: any;
}

export type Category = 'electronics' | 'apparel' | 'stationery' | 'keys' | 'wallets' | 'other';
