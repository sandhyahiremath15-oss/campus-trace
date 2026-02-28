
import { CampusItem } from './types';

export const MOCK_ITEMS: CampusItem[] = [
  {
    id: '1',
    title: 'iPhone 13',
    description: 'iPhone 13 with a cracked screen and a blue silicone case. Left on a bench near the Student Union.',
    category: 'electronics',
    location: 'Student Union, Central Plaza',
    type: 'lost',
    status: 'open',
    userId: 'user123',
    posterName: 'Alex Smith',
    posterEmail: 'alex.smith@university.edu',
    createdAt: '2024-05-15T10:00:00Z',
    imageUrl: 'https://picsum.photos/seed/iphone/600/400'
  },
  {
    id: '2',
    title: 'North Face Jacket',
    description: 'Found a black North Face jacket in the library, 3rd floor quiet zone. Seems to be a size Large.',
    category: 'apparel',
    location: 'Main Library, 3rd Floor',
    type: 'found',
    status: 'open',
    userId: 'user456',
    posterName: 'Jane Doe',
    posterEmail: 'jane.doe@university.edu',
    createdAt: '2024-05-16T14:30:00Z',
    imageUrl: 'https://picsum.photos/seed/jacket/600/400'
  },
  {
    id: '3',
    title: 'Toyota Car Keys',
    description: 'Set of car keys with a Toyota logo and a keychain of a small rubber duck. Found near the gym entrance.',
    category: 'keys',
    location: 'Campus Gym Entrance',
    type: 'found',
    status: 'open',
    userId: 'user789',
    posterName: 'Mark Wilson',
    posterEmail: 'mark.wilson@university.edu',
    createdAt: '2024-05-14T09:15:00Z',
    imageUrl: 'https://picsum.photos/seed/keys/600/400'
  },
  {
    id: '4',
    title: 'Brown Leather Wallet',
    description: 'Brown leather wallet containing a student ID for "Chris Evans" and some cash. Lost between Physics Lab and Cafeteria.',
    category: 'wallets',
    location: 'Science Quad',
    type: 'lost',
    status: 'open',
    userId: 'user123',
    posterName: 'Chris Evans',
    posterEmail: 'chris.evans@university.edu',
    createdAt: '2024-05-13T16:45:00Z',
    imageUrl: 'https://picsum.photos/seed/wallet/600/400'
  },
  {
    id: '5',
    title: 'MacBook Air 2022',
    description: 'Grey MacBook Air 2022 found in the cafeteria. It has a sticker of a rocket ship on the lid.',
    category: 'electronics',
    location: 'Main Cafeteria',
    type: 'found',
    status: 'open',
    userId: 'user999',
    posterName: 'Sarah Connor',
    posterEmail: 'sarah.connor@university.edu',
    createdAt: '2024-05-17T12:00:00Z',
    imageUrl: 'https://picsum.photos/seed/macbook/600/400'
  }
];
