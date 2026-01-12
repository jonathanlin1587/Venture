import { 
  signInWithCredential, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserDocument } from '../types';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Timestamp } from 'firebase/firestore';

// Complete web browser authentication for Google
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google
 * Note: For mobile, this should be called from a component that uses useAuthRequest hook
 * For web, this uses Firebase's signInWithPopup
 */
export const signInWithGoogle = async (idToken?: string, accessToken?: string): Promise<User> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation using Firebase popup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return await createOrUpdateUserProfile(result.user);
    } else {
      // Mobile implementation - requires idToken or accessToken from expo-auth-session
      if (!idToken && !accessToken) {
        throw new Error('idToken or accessToken is required for mobile Google sign-in');
      }
      
      console.log('Creating Firebase credential', { hasIdToken: !!idToken, hasAccessToken: !!accessToken });
      try {
        // Try with idToken first (preferred), fallback to accessToken
        let credential;
        if (idToken) {
          credential = GoogleAuthProvider.credential(idToken);
        } else if (accessToken) {
          // Use accessToken as second parameter (idToken is null)
          credential = GoogleAuthProvider.credential(null, accessToken);
        } else {
          throw new Error('No valid token provided');
        }
        
        console.log('Credential created, signing in with Firebase');
        const userCredential = await signInWithCredential(auth, credential);
        console.log('Firebase sign-in successful:', userCredential.user.uid);
        return await createOrUpdateUserProfile(userCredential.user);
      } catch (firebaseError: any) {
        console.error('Firebase credential error:', {
          code: firebaseError.code,
          message: firebaseError.message,
          error: firebaseError,
        });
        
        // Provide more helpful error messages
        if (firebaseError.code === 'auth/invalid-credential') {
          throw new Error('Invalid Google credentials. Please try signing in again.');
        } else if (firebaseError.code === 'auth/operation-not-allowed') {
          throw new Error('Google Sign-In is not enabled in Firebase. Please enable it in Firebase Console.');
        }
        throw firebaseError;
      }
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign in with Apple (iOS only)
 */
export const signInWithApple = async (): Promise<User> => {
  try {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken } = credential;
    if (!identityToken) {
      throw new Error('Apple Sign-In failed: No identity token');
    }

    const provider = new OAuthProvider('apple.com');
    const appleCredential = provider.credential({
      idToken: identityToken,
    });

    const userCredential = await signInWithCredential(auth, appleCredential);
    return await createOrUpdateUserProfile(userCredential.user);
  } catch (error: any) {
    console.error('Apple sign-in error:', error);
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple sign-in was cancelled');
    }
    throw new Error(error.message || 'Failed to sign in with Apple');
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting sign in with email:', email);
    console.log('Auth instance check:', { 
      hasAuth: !!auth, 
      platform: Platform.OS,
      authType: auth ? typeof auth : 'undefined'
    });
    
    if (!auth) {
      console.error('❌ Firebase auth is not initialized!');
      throw new Error('Firebase auth not initialized');
    }
    
    console.log('Calling signInWithEmailAndPassword...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Sign in successful:', userCredential.user.uid);
    return await createOrUpdateUserProfile(userCredential.user);
  } catch (error: any) {
    console.error('❌ Email sign-in error:', {
      code: error.code,
      message: error.message,
      error: error,
    });
    // Provide more specific error messages
    let errorMessage = 'Failed to sign in with email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please sign up first.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    console.log('Attempting sign up with email:', email);
    console.log('Auth instance check:', { 
      hasAuth: !!auth, 
      platform: Platform.OS 
    });
    
    if (!auth) {
      console.error('❌ Firebase auth is not initialized!');
      throw new Error('Firebase auth not initialized');
    }
    
    console.log('Calling createUserWithEmailAndPassword...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Sign up successful:', userCredential.user.uid);
    // Update display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return await createOrUpdateUserProfile(userCredential.user);
  } catch (error: any) {
    console.error('❌ Email sign-up error:', {
      code: error.code,
      message: error.message,
      error: error,
    });
    // Provide more specific error messages
    let errorMessage = 'Failed to sign up with email';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists. Please sign in instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password authentication is not enabled in Firebase.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Check if current user is admin
 * Checks both Firebase Auth custom claims and Firestore user document
 */
export const isAdmin = async (userId?: string): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    const uid = userId || currentUser?.uid;
    
    if (!uid) {
      return false;
    }

    // Check Firebase Auth custom claims (primary source of truth)
    // Only check if we're checking the current user (not a different userId)
    if (currentUser && (!userId || currentUser.uid === userId)) {
      try {
        // Force token refresh to get latest claims
        await currentUser.getIdToken(true);
        const tokenResult = await currentUser.getIdTokenResult();
        if (tokenResult.claims.admin === true) {
          return true;
        }
      } catch (tokenError) {
        // If token refresh fails, continue to Firestore check
        console.warn('Could not refresh token for admin check:', tokenError);
      }
    }

    // Fallback: Check Firestore user document
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserDocument;
        return userData.isAdmin === true;
      }
    } catch (firestoreError) {
      console.warn('Could not check Firestore for admin status:', firestoreError);
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Create or update user profile in Firestore
 */
const createOrUpdateUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
  try {
    console.log('Creating/updating user profile for:', firebaseUser.uid);
    console.log('Firestore db check:', { hasDb: !!db });
    
    if (!db) {
      console.error('❌ Firestore db is not initialized!');
      throw new Error('Firestore database not initialized');
    }
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    console.log('Getting user document...');
    const userSnap = await getDoc(userRef);

    // Build user data, only including fields that have values (Firestore doesn't allow undefined)
    const userData: any = {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      createdAt: userSnap.exists() 
        ? userSnap.data().createdAt 
        : Timestamp.now(),
    };

    // Only add photoURL if it exists (don't set undefined)
    if (firebaseUser.photoURL) {
      userData.photoURL = firebaseUser.photoURL;
    }

    // Only add bio if it exists in existing document
    if (userSnap.exists() && userSnap.data().bio) {
      userData.bio = userSnap.data().bio;
    }

    // Preserve admin status if it exists
    if (userSnap.exists() && userSnap.data().isAdmin) {
      userData.isAdmin = userSnap.data().isAdmin;
    }

    console.log('Saving user document to Firestore...', { 
      fields: Object.keys(userData),
      hasPhotoURL: !!userData.photoURL 
    });
    await setDoc(userRef, userData, { merge: true });
    console.log('✅ User profile saved successfully');

    const createdAt = userData.createdAt instanceof Timestamp
      ? userData.createdAt.toDate()
      : new Date();

    // Check admin status from custom claims
    let isAdminValue = false;
    try {
      await firebaseUser.getIdToken(true); // Refresh token to get latest claims
      const tokenResult = await firebaseUser.getIdTokenResult();
      isAdminValue = tokenResult.claims.admin === true;
    } catch (error) {
      console.warn('Could not check admin claims:', error);
    }

    // Fallback to Firestore value if custom claims not set
    if (!isAdminValue && userSnap.exists() && userSnap.data().isAdmin) {
      isAdminValue = userSnap.data().isAdmin === true;
    }

    return {
      id: firebaseUser.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      createdAt,
      bio: userData.bio,
      isAdmin: isAdminValue,
    };
  } catch (error: any) {
    console.error('❌ Error creating/updating user profile:', {
      code: error.code,
      message: error.message,
      error: error,
    });
    // If Firestore fails, we should still return a user object from Firebase Auth
    // This allows the user to sign in even if profile creation fails
    console.warn('⚠️ Firestore profile creation failed, returning basic user info');
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
      bio: undefined,
    };
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data() as UserDocument;
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date();

    // Check admin status from custom claims
    let isAdminValue = false;
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await auth.currentUser.getIdToken(true);
        const tokenResult = await auth.currentUser.getIdTokenResult();
        isAdminValue = tokenResult.claims.admin === true;
      } catch (error) {
        console.warn('Could not check admin claims:', error);
      }
    }

    // Fallback to Firestore value
    if (!isAdminValue && data.isAdmin) {
      isAdminValue = data.isAdmin === true;
    }

    return {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt,
      bio: data.bio,
      isAdmin: isAdminValue,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'bio'>>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);

    // Also update Firebase Auth profile if displayName changed
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Get user by email (for adding members)
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase())
    );
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data() as UserDocument;
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date();

    return {
      id: userDoc.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt,
      bio: data.bio,
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

