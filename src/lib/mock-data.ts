
import { CampusItem } from './types';

export const MOCK_ITEMS: CampusItem[] = [
  {
    id: '1',
    description: 'iPhone 13 with a cracked screen and a blue silicone case. Left on a bench near the Student Union.',
    category: 'electronics',
    location: 'Student Union, Central Plaza',
    status: 'lost',
    posterName: 'Alex Smith',
    posterEmail: 'alex.smith@university.edu',
    datePosted: '2024-05-15',
    photoDataUri: 'https://picsum.photos/seed/iphone/600/400'
  },
  {
    id: '2',
    description: 'Found a black North Face jacket in the library, 3rd floor quiet zone. Seems to be a size Large.',
    category: 'apparel',
    location: 'Main Library, 3rd Floor',
    status: 'found',
    posterName: 'Jane Doe',
    posterEmail: 'jane.doe@university.edu',
    datePosted: '2024-05-16',
    photoDataUri: 'https://picsum.photos/seed/jacket/600/400'
  },
  {
    id: '3',
    description: 'Set of car keys with a Toyota logo and a keychain of a small rubber duck. Found near the gym entrance.',
    category: 'keys',
    location: 'Campus Gym Entrance',
    status: 'found',
    posterName: 'Mark Wilson',
    posterEmail: 'mark.wilson@university.edu',
    datePosted: '2024-05-14',
    photoDataUri: 'https://picsum.photos/seed/keys/600/400'
  },
  {
    id: '4',
    description: 'Brown leather wallet containing a student ID for "Chris Evans" and some cash. Lost between Physics Lab and Cafeteria.',
    category: 'wallets',
    location: 'Science Quad',
    status: 'lost',
    posterName: 'Chris Evans',
    posterEmail: 'chris.evans@university.edu',
    datePosted: '2024-05-13',
    photoDataUri: 'https://picsum.photos/seed/wallet/600/400'
  },
  {
    id: '5',
    description: 'Grey MacBook Air 2022 found in the cafeteria. It has a sticker of a rocket ship on the lid.',
    category: 'electronics',
    location: 'Main Cafeteria',
    status: 'found',
    posterName: 'Sarah Connor',
    posterEmail: 'sarah.connor@university.edu',
    datePosted: '2024-05-17',
    photoDataUri: 'https://picsum.photos/seed/macbook/600/400'
  }
];
