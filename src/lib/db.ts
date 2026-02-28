'use client';

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  Firestore,
  Query,
  DocumentData
} from 'firebase/firestore';
import { CampusItem } from './types';

/**
 * Returns a query for all open items, ordered by creation date.
 */
export function getItemsQuery(db: Firestore): Query<DocumentData> {
  return query(
    collection(db, 'items'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Returns a query for items posted by a specific user.
 */
export function getUserItemsQuery(db: Firestore, userId: string): Query<DocumentData> {
  return query(
    collection(db, 'items'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Returns a query for potential matches (opposite type) for a given item.
 */
export function getPotentialMatchesQuery(db: Firestore, itemType: 'lost' | 'found'): Query<DocumentData> {
  const oppositeType = itemType === 'lost' ? 'found' : 'lost';
  return query(
    collection(db, 'items'),
    where('type', '==', oppositeType),
    where('status', '==', 'open'),
    limit(20)
  );
}
