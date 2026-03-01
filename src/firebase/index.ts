
'use client';

/**
 * @fileOverview Central export point for Firebase functionality.
 * Note: We avoid exporting client-provider here to prevent circular dependencies.
 */

export * from './init';
export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
