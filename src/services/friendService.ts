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
import { FriendRequest, FriendRequestDocument, User, UserDocument } from '../types';

/**
 * Convert Firestore document to FriendRequest
 */
const documentToFriendRequest = (id: string, data: FriendRequestDocument): FriendRequest => {
  return {
    id,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    status: data.status,
    createdAt: data.createdAt.toDate(),
  };
};

/**
 * Send a friend request
 */
export const sendFriendRequest = async (fromUserId: string, toUserId: string): Promise<string> => {
  try {
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if a request already exists
    // Firestore doesn't support nested or/and queries easily, so we check both directions
    const request1Query = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );
    const request2Query = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', toUserId),
      where('toUserId', '==', fromUserId)
    );
    
    const [snap1, snap2] = await Promise.all([
      getDocs(request1Query),
      getDocs(request2Query)
    ]);
    
    const existingSnap = snap1.empty ? snap2 : snap1;

    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      const existingData = existingDoc.data() as FriendRequestDocument;
      
      if (existingData.status === 'accepted') {
        throw new Error('You are already friends with this user');
      } else if (existingData.status === 'pending') {
        throw new Error('Friend request already sent');
      }
    }

    const requestData: FriendRequestDocument = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'friendRequests'), requestData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    throw new Error(error.message || 'Failed to send friend request');
  }
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, {
      status: 'accepted',
    });
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    throw new Error(error.message || 'Failed to accept friend request');
  }
};

/**
 * Reject a friend request (delete it)
 */
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    await deleteDoc(requestRef);
  } catch (error: any) {
    console.error('Error rejecting friend request:', error);
    throw new Error(error.message || 'Failed to reject friend request');
  }
};

/**
 * Remove a friend (delete the friend request)
 */
export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
  try {
    const request1Query = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', userId),
      where('toUserId', '==', friendId),
      where('status', '==', 'accepted')
    );
    const request2Query = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', friendId),
      where('toUserId', '==', userId),
      where('status', '==', 'accepted')
    );

    const [snap1, snap2] = await Promise.all([
      getDocs(request1Query),
      getDocs(request2Query)
    ]);

    const snap = snap1.empty ? snap2 : snap1;
    if (snap.empty) {
      throw new Error('Friend relationship not found');
    }

    const requestRef = snap.docs[0].ref;
    await deleteDoc(requestRef);
  } catch (error: any) {
    console.error('Error removing friend:', error);
    throw new Error(error.message || 'Failed to remove friend');
  }
};

/**
 * Get all friend requests for a user (both sent and received)
 */
export const getUserFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const requestsFromQuery = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', userId)
    );
    const requestsToQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', userId)
    );

    const [snapFrom, snapTo] = await Promise.all([
      getDocs(requestsFromQuery),
      getDocs(requestsToQuery)
    ]);

    const requests: FriendRequest[] = [];
    const requestIds = new Set<string>();

    snapFrom.forEach((doc) => {
      if (!requestIds.has(doc.id)) {
        requestIds.add(doc.id);
        requests.push(documentToFriendRequest(doc.id, doc.data() as FriendRequestDocument));
      }
    });

    snapTo.forEach((doc) => {
      if (!requestIds.has(doc.id)) {
        requestIds.add(doc.id);
        requests.push(documentToFriendRequest(doc.id, doc.data() as FriendRequestDocument));
      }
    });

    return requests;
  } catch (error: any) {
    console.error('Error getting friend requests:', error);
    throw new Error(error.message || 'Failed to get friend requests');
  }
};

/**
 * Subscribe to friend requests for a user
 */
export const subscribeToFriendRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
): Unsubscribe => {
  // Firestore doesn't support or() in a single query easily, so we subscribe to both
  let requestsFrom: FriendRequest[] = [];
  let requestsTo: FriendRequest[] = [];
  
  const requestsFromQuery = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', userId)
  );
  
  const requestsToQuery = query(
    collection(db, 'friendRequests'),
    where('toUserId', '==', userId)
  );
  
  const updateCallback = () => {
    const allRequests = [...requestsFrom, ...requestsTo];
    // Remove duplicates
    const uniqueRequests = Array.from(
      new Map(allRequests.map(r => [r.id, r])).values()
    );
    callback(uniqueRequests);
  };
  
  const unsubscribeFrom = onSnapshot(requestsFromQuery, (snapshot) => {
    requestsFrom = [];
    snapshot.forEach((doc) => {
      requestsFrom.push(documentToFriendRequest(doc.id, doc.data() as FriendRequestDocument));
    });
    updateCallback();
  });
  
  const unsubscribeTo = onSnapshot(requestsToQuery, (snapshot) => {
    requestsTo = [];
    snapshot.forEach((doc) => {
      requestsTo.push(documentToFriendRequest(doc.id, doc.data() as FriendRequestDocument));
    });
    updateCallback();
  });
  
  return () => {
    unsubscribeFrom();
    unsubscribeTo();
  };
};

/**
 * Get all friends for a user (accepted friend requests)
 */
export const getUserFriends = async (userId: string): Promise<User[]> => {
  try {
    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('status', '==', 'accepted')
    );

    const snap = await getDocs(friendRequestsQuery);
    const friendIds: string[] = [];

    snap.forEach((doc) => {
      const data = doc.data() as FriendRequestDocument;
      if (data.fromUserId === userId) {
        friendIds.push(data.toUserId);
      } else if (data.toUserId === userId) {
        friendIds.push(data.fromUserId);
      }
    });

    // Get user profiles for all friends
    const { getUserProfile } = await import('./authService');
    const friends = await Promise.all(
      friendIds.map((friendId) => getUserProfile(friendId))
    );

    return friends.filter((friend): friend is User => friend !== null);
  } catch (error: any) {
    console.error('Error getting user friends:', error);
    throw new Error(error.message || 'Failed to get friends');
  }
};

/**
 * Subscribe to friends list for a user
 * Listens to all accepted friend requests and filters for the current user
 */
export const subscribeToFriends = (
  userId: string,
  callback: (friends: User[]) => void
): Unsubscribe => {
  // Subscribe to all accepted friend requests
  // This ensures both users see updates when a request is accepted
  const friendRequestsQuery = query(
    collection(db, 'friendRequests'),
    where('status', '==', 'accepted')
  );

  const unsubscribe = onSnapshot(friendRequestsQuery, async (snapshot) => {
    const friendIds: string[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as FriendRequestDocument;
      // Include friend if user is either the sender or receiver
      if (data.fromUserId === userId) {
        friendIds.push(data.toUserId);
      } else if (data.toUserId === userId) {
        friendIds.push(data.fromUserId);
      }
    });

    // Get user profiles for all friends
    const { getUserProfile } = await import('./authService');
    const friends = await Promise.all(
      friendIds.map((friendId) => getUserProfile(friendId))
    );

    const validFriends = friends.filter((friend): friend is User => friend !== null);
    
    // Always update - the subscription should fire for both users when status changes
    callback(validFriends);
  });

  return unsubscribe;
};

/**
 * Search for users by email or display name
 */
export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<User[]> => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    const usersQuery = query(collection(db, 'users'));
    const snap = await getDocs(usersQuery);

    const users: User[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as UserDocument;
      const userId = doc.id;

      // Skip current user
      if (userId === currentUserId) {
        return;
      }

      // Check if email or display name matches
      const emailMatch = data.email.toLowerCase().includes(term);
      const nameMatch = data.displayName.toLowerCase().includes(term);

      if (emailMatch || nameMatch) {
        const createdAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date();

        users.push({
          id: userId,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt,
          bio: data.bio,
        });
      }
    });

    return users;
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
};

/**
 * Check if two users are friends
 */
export const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  try {
    const friendRequestQuery = query(
      collection(db, 'friendRequests'),
      where('status', '==', 'accepted')
    );

    const snap = await getDocs(friendRequestQuery);
    
    for (const doc of snap.docs) {
      const data = doc.data() as FriendRequestDocument;
      if (
        (data.fromUserId === userId1 && data.toUserId === userId2) ||
        (data.fromUserId === userId2 && data.toUserId === userId1)
      ) {
        return true;
      }
    }

    return false;
  } catch (error: any) {
    console.error('Error checking friendship:', error);
    return false;
  }
};
