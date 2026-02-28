
'use client';

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  Firestore,
  Query,
  DocumentData,
  doc,
  setDoc,
  deleteDoc,
  getDocs
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

/**
 * Returns a query for items saved by a user.
 */
export function getSavedItemsQuery(db: Firestore, userId: string): Query<DocumentData> {
  return query(
    collection(db, 'savedItems'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Toggles the saved state of an item for a user.
 */
export async function toggleSaveItem(db: Firestore, userId: string, itemId: string) {
  const saveId = `${userId}_${itemId}`;
  const saveRef = doc(db, 'savedItems', saveId);
  
  const q = query(collection(db, 'savedItems'), where('userId', '==', userId), where('itemId', '==', itemId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    await deleteDoc(doc(db, 'savedItems', snapshot.docs[0].id));
    return false; // Unsaved
  } else {
    await setDoc(saveRef, {
      userId,
      itemId,
      createdAt: new Date(),
    });
    return true; // Saved
  }
}
