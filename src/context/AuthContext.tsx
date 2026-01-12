import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signInWithApple, 
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  isAdmin,
} from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'bio'>>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('AuthContext: Auth state changed', { 
        hasFirebaseUser: !!firebaseUser,
        uid: firebaseUser?.uid 
      });
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('AuthContext: Fetching user profile...');
          const userProfile = await getUserProfile(firebaseUser.uid);
          console.log('AuthContext: User profile fetched', { 
            hasProfile: !!userProfile,
            userId: userProfile?.id 
          });
          
          // Check admin status (with error handling)
          let adminCheck = false;
          try {
            adminCheck = await isAdmin(firebaseUser.uid);
          } catch (adminError) {
            console.warn('AuthContext: Error checking admin status, defaulting to false:', adminError);
            adminCheck = false;
          }
          setAdminStatus(adminCheck);
          
          // If profile doesn't exist in Firestore yet, create a basic one from Firebase Auth
          if (!userProfile) {
            console.log('AuthContext: Profile not found, creating from Firebase Auth');
            const basicUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
              bio: undefined,
              isAdmin: adminCheck,
            };
            setUser(basicUser);
          } else {
            // Update admin status from check
            setUser({ ...userProfile, isAdmin: adminCheck });
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user profile', error);
          // Fallback to basic user from Firebase Auth
          const basicUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            bio: undefined,
            isAdmin: false,
          };
          setUser(basicUser);
          setAdminStatus(false);
        }
      } else {
        setUser(null);
        setAdminStatus(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      // For mobile, this will be handled by a hook in the component
      // For web, this uses Firebase popup
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const handleSignInWithApple = async () => {
    try {
      await signInWithApple();
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      await signUpWithEmail(email, password, displayName);
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('AuthContext: handleSignOut called');
      // Sign out from Firebase first - this will trigger onAuthStateChange
      await signOut();
      console.log('AuthContext: Firebase signOut completed');
      // The onAuthStateChange listener will automatically set user to null
      // when Firebase auth state changes to null
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      setFirebaseUser(null);
      throw error;
    }
  };

  const handleUpdateProfile = async (updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'bio'>>) => {
    if (!firebaseUser) {
      throw new Error('No user logged in');
    }
    try {
      await updateUserProfile(firebaseUser.uid, updates);
      // Refresh user profile
      const userProfile = await getUserProfile(firebaseUser.uid);
      setUser(userProfile);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const handleRefreshUser = async () => {
    if (!firebaseUser) return;
    try {
      const userProfile = await getUserProfile(firebaseUser.uid);
      setUser(userProfile);
    } catch (error: any) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAdmin: adminStatus,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithApple: handleSignInWithApple,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    refreshUser: handleRefreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

