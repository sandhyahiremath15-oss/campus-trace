
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
 * Returns a query for items. 
 * Note: We use a simple query to avoid the need for composite indexes.
 * Filtering by 'status' is handled in memory for the browse page to ensure immediate functionality.
 */
export function getItemsQuery(db: Firestore): Query<DocumentData> {
  return query(
    collection(db, 'items')
  );
}

/**
 * Returns a query for items posted by a specific user.
 * Simplified to avoid index requirement.
 */
export function getUserItemsQuery(db: Firestore, userId: string): Query<DocumentData> {
  return query(
    collection(db, 'items'),
    where('userId', '==', userId)
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
    limit(20)
  );
}

/**
 * Returns a query for items saved by a user.
 */
export function getSavedItemsQuery(db: Firestore, userId: string): Query<DocumentData> {
  return query(
    collection(db, 'savedItems'),
    where('userId', '==', userId)
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
