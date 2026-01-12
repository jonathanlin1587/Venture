import { Timestamp } from 'firebase/firestore';

export type BucketType = 'solo' | 'duo' | 'group';

export type MemberRole = 'owner' | 'member';

export interface BucketTheme {
  color: string;
  icon: string;
}

// Preset theme colors
export const BUCKET_COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#5856D6', // Indigo
  '#00C7BE', // Teal
  '#FFD60A', // Yellow
  '#8E8E93', // Gray
] as const;

// Preset icons (emojis)
export const BUCKET_ICONS = [
  '🎯', '⭐', '🏆', '🎨', '📚', '💪', '🌟', '🚀', 
  '💡', '🎵', '✈️', '🏠', '💼', '🎮', '🌱', '❤️',
  '🔥', '⚡', '🌈', '🎉', '📸', '🍎', '☕', '🎁',
] as const;

// Goal categories with colors and icons
export interface GoalCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  { id: 'adventure', name: 'Adventure', color: '#FF9500', icon: '🏔️' },
  { id: 'career', name: 'Career', color: '#5856D6', icon: '💼' },
  { id: 'creative', name: 'Creative', color: '#FF2D55', icon: '🎨' },
  { id: 'education', name: 'Education', color: '#007AFF', icon: '📚' },
  { id: 'family', name: 'Family', color: '#FF3B30', icon: '👨‍👩‍👧‍👦' },
  { id: 'fitness', name: 'Fitness', color: '#34C759', icon: '💪' },
  { id: 'food', name: 'Food & Drink', color: '#FF9500', icon: '🍽️' },
  { id: 'health', name: 'Health', color: '#00C7BE', icon: '🏥' },
  { id: 'hobby', name: 'Hobby', color: '#AF52DE', icon: '🎮' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#5856D6', icon: '🧘' },
  { id: 'music', name: 'Music', color: '#FF2D55', icon: '🎵' },
  { id: 'personal', name: 'Personal', color: '#8E8E93', icon: '✨' },
  { id: 'relationship', name: 'Relationship', color: '#FF3B30', icon: '❤️' },
  { id: 'social', name: 'Social', color: '#007AFF', icon: '👥' },
  { id: 'sports', name: 'Sports', color: '#34C759', icon: '⚽' },
  { id: 'travel', name: 'Travel', color: '#00C7BE', icon: '✈️' },
];

export interface BucketMember {
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  bio?: string;
  isAdmin?: boolean;
}

export interface Bucket {
  id: string;
  name: string;
  type: BucketType;
  ownerId: string;
  createdAt: Date;
  members: BucketMember[];
  description?: string;
  theme?: BucketTheme;
  coverImage?: string; // Base64 encoded cover image
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  createdBy: string;
  bucketId: string;
  dueDate?: Date;
  isFavorite?: boolean;
  order?: number;
  completionPhotos?: string[];
  categories?: string[]; // Category IDs from GOAL_CATEGORIES
  memoryJournal?: string; // Journal entry for completed goals (memory section)
}

// Firestore document types (with timestamps as Firestore Timestamp)
export interface BucketDocument {
  name: string;
  type: BucketType;
  ownerId: string;
  createdAt: Timestamp;
  members: Array<{
    userId: string;
    role: MemberRole;
    joinedAt: Timestamp;
  }>;
  description?: string;
  theme?: BucketTheme;
  coverImage?: string;
}

export interface GoalDocument {
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
  bucketId: string;
  dueDate?: Timestamp;
  isFavorite?: boolean;
  order?: number;
  completionPhotos?: string[];
  categories?: string[];
  memoryJournal?: string;
}

export interface UserDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  bio?: string;
  isAdmin?: boolean;
}

