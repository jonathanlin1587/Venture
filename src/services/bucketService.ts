import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Bucket, Goal, BucketDocument, GoalDocument, BucketType, BucketMember, MemberRole } from '../types';

/**
 * Compress and convert an image file to base64
 * Max dimension is 800px to keep file size reasonable for Firestore
 */
export const compressAndConvertToBase64 = (file: File, maxDimension: number = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if needed
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with JPEG compression (quality 0.7)
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert Firestore document to Bucket
 */
const documentToBucket = (id: string, data: BucketDocument): Bucket => {
  return {
    id,
    name: data.name,
    type: data.type,
    ownerId: data.ownerId,
    createdAt: data.createdAt.toDate(),
    members: data.members.map((m) => ({
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt.toDate(),
    })),
    description: data.description,
    theme: data.theme,
    coverImage: data.coverImage,
  };
};

/**
 * Convert Firestore document to Goal
 */
const documentToGoal = (id: string, data: GoalDocument): Goal => {
  return {
    id,
    title: data.title,
    description: data.description,
    completed: data.completed,
    completedAt: data.completedAt?.toDate(),
    createdAt: data.createdAt.toDate(),
    createdBy: data.createdBy,
    bucketId: data.bucketId,
    dueDate: data.dueDate?.toDate(),
    isFavorite: data.isFavorite || false,
    order: data.order || 0,
    completionPhotos: data.completionPhotos || [],
    categories: data.categories || [],
    memoryJournal: data.memoryJournal,
  };
};

/**
 * Create a new bucket
 */
export const createBucket = async (
  name: string,
  type: BucketType,
  ownerId: string,
  description?: string,
  memberIds?: string[],
  theme?: { color: string; icon: string }
): Promise<string> => {
  try {
    const members: BucketMember[] = [
      {
        userId: ownerId,
        role: 'owner',
        joinedAt: new Date(),
      },
    ];

    // Add additional members if provided
    if (memberIds && memberIds.length > 0) {
      memberIds.forEach((memberId) => {
        if (memberId !== ownerId) {
          members.push({
            userId: memberId,
            role: 'member',
            joinedAt: new Date(),
          });
        }
      });
    }

    const bucketData: Record<string, any> = {
      name,
      type,
      ownerId,
      members: members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: Timestamp.fromDate(m.joinedAt),
      })),
      createdAt: serverTimestamp(),
    };

    // Only add description if it has a value
    if (description) {
      bucketData.description = description;
    }

    // Add theme if provided
    if (theme) {
      bucketData.theme = theme;
    }

    console.log('Creating bucket with data:', { name, type, ownerId, description, theme });
    
    const docRef = await addDoc(collection(db, 'buckets'), bucketData);

    console.log('Bucket created successfully:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating bucket:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create bucket';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is unavailable. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get a single bucket by ID
 */
export const getBucket = async (bucketId: string): Promise<Bucket | null> => {
  try {
    const docRef = doc(db, 'buckets', bucketId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return documentToBucket(docSnap.id, docSnap.data() as BucketDocument);
  } catch (error: any) {
    console.error('Error getting bucket:', error);
    throw new Error(error.message || 'Failed to get bucket');
  }
};

/**
 * Get all buckets for a user (owned or member of)
 */
export const getUserBuckets = async (userId: string): Promise<Bucket[]> => {
  try {
    const bucketsQuery = query(
      collection(db, 'buckets'),
      where('ownerId', '==', userId)
    );

    // Get owned buckets
    const ownedSnap = await getDocs(bucketsQuery);

    // For member buckets, we need to fetch all and filter (Firestore limitation)
    // In production, consider using a separate members collection for better queries
    const allBucketsQuery = query(collection(db, 'buckets'));
    const allSnap = await getDocs(allBucketsQuery);

    const buckets: Bucket[] = [];

    // Add owned buckets
    ownedSnap.forEach((doc) => {
      buckets.push(documentToBucket(doc.id, doc.data() as BucketDocument));
    });

    // Add member buckets (where user is member but not owner)
    allSnap.forEach((doc) => {
      const data = doc.data() as BucketDocument;
      const isMember = data.ownerId !== userId && 
                      data.members.some((m) => m.userId === userId);
      if (isMember) {
        const bucket = documentToBucket(doc.id, data);
        // Avoid duplicates
        if (!buckets.find((b) => b.id === bucket.id)) {
          buckets.push(bucket);
        }
      }
    });

    return buckets;
  } catch (error: any) {
    console.error('Error getting user buckets:', error);
    throw new Error(error.message || 'Failed to get user buckets');
  }
};

/**
 * Subscribe to real-time updates for user's buckets
 * Note: Firestore doesn't support efficient queries for array-contains with objects,
 * so we subscribe to all buckets and filter client-side for member buckets
 */
export const subscribeToUserBuckets = (
  userId: string,
  callback: (buckets: Bucket[]) => void
): Unsubscribe => {
  // Subscribe to buckets owned by the user
  const ownedBucketsQuery = query(
    collection(db, 'buckets'),
    where('ownerId', '==', userId)
  );

  let ownedBuckets: Bucket[] = [];
  let memberBuckets: Bucket[] = [];
  let unsubscribeMember: Unsubscribe | null = null;

  const updateCallback = () => {
    // Combine owned and member buckets, removing duplicates
    const allBucketsMap = new Map<string, Bucket>();
    ownedBuckets.forEach((b) => allBucketsMap.set(b.id, b));
    memberBuckets.forEach((b) => {
      if (!allBucketsMap.has(b.id)) {
        allBucketsMap.set(b.id, b);
      }
    });
    callback(Array.from(allBucketsMap.values()));
  };

  const unsubscribeOwned = onSnapshot(ownedBucketsQuery, (snapshot) => {
    ownedBuckets = [];
    snapshot.forEach((doc) => {
      ownedBuckets.push(documentToBucket(doc.id, doc.data() as BucketDocument));
    });
    updateCallback();
  });

  // Subscribe to all buckets for member check (only once)
  const allBucketsQuery = query(collection(db, 'buckets'));
  unsubscribeMember = onSnapshot(allBucketsQuery, (allSnapshot) => {
    memberBuckets = [];
    allSnapshot.forEach((doc) => {
      const data = doc.data() as BucketDocument;
      // Check if user is a member (but not owner, as those are handled above)
      const isMember = data.ownerId !== userId && 
                      data.members.some((m) => m.userId === userId);
      if (isMember) {
        memberBuckets.push(documentToBucket(doc.id, data));
      }
    });
    updateCallback();
  });

  // Return function that unsubscribes from both
  return () => {
    unsubscribeOwned();
    if (unsubscribeMember) {
      unsubscribeMember();
    }
  };
};

/**
 * Update bucket details
 */
export const updateBucket = async (
  bucketId: string,
  updates: Partial<Pick<Bucket, 'name' | 'description' | 'type' | 'theme' | 'coverImage'>>
): Promise<void> => {
  try {
    const bucketRef = doc(db, 'buckets', bucketId);
    await updateDoc(bucketRef, {
      ...updates,
    });
  } catch (error: any) {
    console.error('Error updating bucket:', error);
    throw new Error(error.message || 'Failed to update bucket');
  }
};

/**
 * Delete a bucket
 */
export const deleteBucket = async (bucketId: string): Promise<void> => {
  try {
    // First, delete all goals in the bucket
    const goalsRef = collection(db, 'buckets', bucketId, 'goals');
    const goalsSnap = await getDocs(goalsRef);
    
    const deletePromises = goalsSnap.docs.map((goalDoc) =>
      deleteDoc(goalDoc.ref)
    );
    await Promise.all(deletePromises);

    // Then delete the bucket
    const bucketRef = doc(db, 'buckets', bucketId);
    await deleteDoc(bucketRef);
  } catch (error: any) {
    console.error('Error deleting bucket:', error);
    throw new Error(error.message || 'Failed to delete bucket');
  }
};

/**
 * Add a member to a bucket
 */
export const addBucketMember = async (
  bucketId: string,
  userId: string
): Promise<void> => {
  try {
    const bucketRef = doc(db, 'buckets', bucketId);
    const bucketSnap = await getDoc(bucketRef);

    if (!bucketSnap.exists()) {
      throw new Error('Bucket not found');
    }

    const data = bucketSnap.data() as BucketDocument;
    const isAlreadyMember = data.members.some((m) => m.userId === userId);

    if (isAlreadyMember) {
      return; // Already a member
    }

    const newMember: BucketMember = {
      userId,
      role: 'member',
      joinedAt: new Date(),
    };

    await updateDoc(bucketRef, {
      members: [
        ...data.members,
        {
          userId: newMember.userId,
          role: newMember.role,
          joinedAt: Timestamp.fromDate(newMember.joinedAt),
        },
      ],
    });
  } catch (error: any) {
    console.error('Error adding bucket member:', error);
    throw new Error(error.message || 'Failed to add bucket member');
  }
};

/**
 * Remove a member from a bucket
 */
export const removeBucketMember = async (
  bucketId: string,
  userId: string
): Promise<void> => {
  try {
    const bucketRef = doc(db, 'buckets', bucketId);
    const bucketSnap = await getDoc(bucketRef);

    if (!bucketSnap.exists()) {
      throw new Error('Bucket not found');
    }

    const data = bucketSnap.data() as BucketDocument;
    
    // Prevent removing the owner
    if (data.ownerId === userId) {
      throw new Error('Cannot remove the bucket owner');
    }

    const updatedMembers = data.members.filter((m) => m.userId !== userId);

    await updateDoc(bucketRef, {
      members: updatedMembers,
    });
  } catch (error: any) {
    console.error('Error removing bucket member:', error);
    throw new Error(error.message || 'Failed to remove bucket member');
  }
};

/**
 * Add multiple members to a bucket at once
 */
export const addBucketMembers = async (
  bucketId: string,
  userIds: string[]
): Promise<void> => {
  try {
    if (userIds.length === 0) {
      return;
    }

    const bucketRef = doc(db, 'buckets', bucketId);
    const bucketSnap = await getDoc(bucketRef);

    if (!bucketSnap.exists()) {
      throw new Error('Bucket not found');
    }

    const data = bucketSnap.data() as BucketDocument;
    const existingMemberIds = new Set(data.members.map((m) => m.userId));
    
    // Filter out users who are already members
    const newUserIds = userIds.filter((userId) => !existingMemberIds.has(userId));
    
    if (newUserIds.length === 0) {
      return; // All users are already members
    }

    const newMembers = newUserIds.map((userId) => ({
      userId,
      role: 'member' as MemberRole,
      joinedAt: Timestamp.fromDate(new Date()),
    }));

    await updateDoc(bucketRef, {
      members: [
        ...data.members,
        ...newMembers,
      ],
    });
  } catch (error: any) {
    console.error('Error adding bucket members:', error);
    throw new Error(error.message || 'Failed to add bucket members');
  }
};

/**
 * Check if a user has access to a bucket (owner or member)
 */
export const hasBucketAccess = async (
  bucketId: string,
  userId: string
): Promise<boolean> => {
  try {
    const bucket = await getBucket(bucketId);
    if (!bucket) {
      return false;
    }

    return bucket.ownerId === userId || 
           bucket.members.some((m) => m.userId === userId);
  } catch (error) {
    console.error('Error checking bucket access:', error);
    return false;
  }
};

/**
 * Get user's role in a bucket
 */
export const getUserBucketRole = async (
  bucketId: string,
  userId: string
): Promise<MemberRole | null> => {
  try {
    const bucket = await getBucket(bucketId);
    if (!bucket) {
      return null;
    }

    if (bucket.ownerId === userId) {
      return 'owner';
    }

    const member = bucket.members.find((m) => m.userId === userId);
    return member?.role || null;
  } catch (error) {
    console.error('Error getting user bucket role:', error);
    return null;
  }
};

// ==================== GOAL OPERATIONS ====================

/**
 * Create a goal in a bucket
 */
export const createGoal = async (
  bucketId: string,
  title: string,
  createdBy: string,
  description?: string,
  dueDate?: Date,
  completed?: boolean,
  completedAt?: Date,
  categories?: string[]
): Promise<string> => {
  try {
    // Get current goal count to set order
    const goalsRef = collection(db, 'buckets', bucketId, 'goals');
    const goalsSnap = await getDocs(goalsRef);
    const order = goalsSnap.size;

    const goalData: Record<string, any> = {
      title,
      completed: completed || false,
      createdBy,
      bucketId,
      isFavorite: false,
      order,
      createdAt: serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (description) {
      goalData.description = description;
    }
    if (dueDate) {
      goalData.dueDate = Timestamp.fromDate(dueDate);
    }
    if (completed && completedAt) {
      goalData.completedAt = Timestamp.fromDate(completedAt);
    }
    if (categories && categories.length > 0) {
      goalData.categories = categories;
    }

    const docRef = await addDoc(goalsRef, goalData);

    return docRef.id;
  } catch (error: any) {
    console.error('Error creating goal:', error);
    throw new Error(error.message || 'Failed to create goal');
  }
};

/**
 * Get all goals for a bucket
 */
export const getBucketGoals = async (bucketId: string): Promise<Goal[]> => {
  try {
    const goalsRef = collection(db, 'buckets', bucketId, 'goals');
    const goalsSnap = await getDocs(goalsRef);

    const goals: Goal[] = [];
    goalsSnap.forEach((doc) => {
      goals.push(documentToGoal(doc.id, doc.data() as GoalDocument));
    });

    return goals;
  } catch (error: any) {
    console.error('Error getting bucket goals:', error);
    throw new Error(error.message || 'Failed to get bucket goals');
  }
};

/**
 * Subscribe to real-time updates for bucket goals
 */
export const subscribeToBucketGoals = (
  bucketId: string,
  callback: (goals: Goal[]) => void
): Unsubscribe => {
  const goalsRef = collection(db, 'buckets', bucketId, 'goals');

  return onSnapshot(goalsRef, (snapshot) => {
    const goals: Goal[] = [];
    snapshot.forEach((doc) => {
      goals.push(documentToGoal(doc.id, doc.data() as GoalDocument));
    });
    // Sort by order, then by createdAt
    goals.sort((a, b) => {
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    callback(goals);
  });
};

/**
 * Update a goal
 */
export const updateGoal = async (
  bucketId: string,
  goalId: string,
  updates: Partial<Pick<Goal, 'title' | 'description' | 'completed' | 'completedAt' | 'dueDate' | 'isFavorite' | 'order' | 'completionPhotos' | 'categories' | 'memoryJournal'>>
): Promise<void> => {
  try {
    const goalRef = doc(db, 'buckets', bucketId, 'goals', goalId);
    const updateData: Record<string, any> = {};

    // Only add fields that are defined
    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description || null;
    }

    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
      // Only auto-set completedAt if not explicitly provided
      if (updates.completedAt === undefined) {
        updateData.completedAt = updates.completed
          ? serverTimestamp()
          : null;
      }
    }

    // Allow setting a custom completedAt date
    if (updates.completedAt !== undefined) {
      updateData.completedAt = updates.completedAt
        ? Timestamp.fromDate(updates.completedAt)
        : null;
    }

    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate
        ? Timestamp.fromDate(updates.dueDate)
        : null;
    }

    if (updates.isFavorite !== undefined) {
      updateData.isFavorite = updates.isFavorite;
    }

    if (updates.order !== undefined) {
      updateData.order = updates.order;
    }

    if (updates.completionPhotos !== undefined) {
      updateData.completionPhotos = updates.completionPhotos;
    }

    if (updates.categories !== undefined) {
      updateData.categories = updates.categories && updates.categories.length > 0 ? updates.categories : [];
    }

    await updateDoc(goalRef, updateData);
  } catch (error: any) {
    console.error('Error updating goal:', error);
    throw new Error(error.message || 'Failed to update goal');
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (
  bucketId: string,
  goalId: string
): Promise<void> => {
  try {
    const goalRef = doc(db, 'buckets', bucketId, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    throw new Error(error.message || 'Failed to delete goal');
  }
};

/**
 * Toggle goal completion status
 */
export const toggleGoalCompletion = async (
  bucketId: string,
  goalId: string,
  completed: boolean
): Promise<void> => {
  await updateGoal(bucketId, goalId, { completed });
};

/**
 * Toggle goal favorite status
 */
export const toggleGoalFavorite = async (
  bucketId: string,
  goalId: string,
  isFavorite: boolean
): Promise<void> => {
  await updateGoal(bucketId, goalId, { isFavorite });
};

