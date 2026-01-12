import { collection, getDocs, query, orderBy, limit, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, UserDocument, Bucket, BucketDocument, Goal, GoalDocument } from '../types';
import { Timestamp } from 'firebase/firestore';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(usersQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data() as UserDocument;
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date();
      
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt,
        bio: data.bio,
        isAdmin: data.isAdmin || false,
      };
    });
  } catch (error: any) {
    console.error('Error getting all users:', error);
    throw new Error(error.message || 'Failed to get users');
  }
};

/**
 * Get all buckets (admin only)
 */
export const getAllBuckets = async (): Promise<Bucket[]> => {
  try {
    const bucketsQuery = query(
      collection(db, 'buckets'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(bucketsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data() as BucketDocument;
      return {
        id: doc.id,
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
    });
  } catch (error: any) {
    console.error('Error getting all buckets:', error);
    throw new Error(error.message || 'Failed to get buckets');
  }
};

/**
 * Get all goals for a bucket (admin only)
 */
export const getBucketGoals = async (bucketId: string): Promise<Goal[]> => {
  try {
    const goalsQuery = query(
      collection(db, 'buckets', bucketId, 'goals'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(goalsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data() as GoalDocument;
      return {
        id: doc.id,
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
    });
  } catch (error: any) {
    console.error('Error getting bucket goals:', error);
    throw new Error(error.message || 'Failed to get goals');
  }
};

/**
 * Get app statistics (admin only)
 */
export const getAppStats = async (): Promise<{
  totalUsers: number;
  totalBuckets: number;
  totalGoals: number;
  completedGoals: number;
  activeUsers: number;
}> => {
  try {
    const [usersSnap, bucketsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'buckets')),
    ]);

    const totalUsers = usersSnap.size;
    const totalBuckets = bucketsSnap.size;

    // Get all goals from all buckets
    let totalGoals = 0;
    let completedGoals = 0;
    const bucketIds: string[] = [];

    bucketsSnap.forEach((doc) => {
      bucketIds.push(doc.id);
    });

    // Get goals for each bucket (in batches to avoid too many requests)
    const goalPromises = bucketIds.slice(0, 50).map(async (bucketId) => {
      try {
        const goalsSnap = await getDocs(collection(db, 'buckets', bucketId, 'goals'));
        return goalsSnap.docs.map((doc) => doc.data() as GoalDocument);
      } catch (error) {
        console.warn(`Error getting goals for bucket ${bucketId}:`, error);
        return [];
      }
    });

    const allGoalsArrays = await Promise.all(goalPromises);
    const allGoals = allGoalsArrays.flat();
    totalGoals = allGoals.length;
    completedGoals = allGoals.filter((g) => g.completed).length;

    // Calculate active users (users who created buckets in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUserIds = new Set<string>();
    
    bucketsSnap.forEach((doc) => {
      const data = doc.data() as BucketDocument;
      if (data.createdAt.toDate() >= thirtyDaysAgo) {
        activeUserIds.add(data.ownerId);
      }
    });

    return {
      totalUsers,
      totalBuckets,
      totalGoals,
      completedGoals,
      activeUsers: activeUserIds.size,
    };
  } catch (error: any) {
    console.error('Error getting app stats:', error);
    throw new Error(error.message || 'Failed to get app statistics');
  }
};

/**
 * Delete a bucket (admin only)
 */
export const deleteBucketAdmin = async (bucketId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'buckets', bucketId));
  } catch (error: any) {
    console.error('Error deleting bucket:', error);
    throw new Error(error.message || 'Failed to delete bucket');
  }
};

/**
 * Update user admin status in Firestore (admin only)
 * Note: This updates Firestore, but Firebase Auth custom claims should be set via Admin SDK
 */
export const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isAdmin });
  } catch (error: any) {
    console.error('Error updating user admin status:', error);
    throw new Error(error.message || 'Failed to update admin status');
  }
};
