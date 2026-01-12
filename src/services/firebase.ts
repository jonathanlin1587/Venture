import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Debug: Log Firebase config (without sensitive keys)
const isWeb = Platform.OS === 'web';
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId,
  platform: Platform.OS,
  isWeb,
  apiKeyPrefix: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'MISSING',
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('⚠️ Firebase configuration is missing! Check your .env file and app.config.js');
  console.error('Required: apiKey, projectId, authDomain, storageBucket, messagingSenderId, appId');
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Auth with AsyncStorage persistence for React Native
    if (Platform.OS !== 'web') {
      try {
        console.log('Initializing Firebase Auth for mobile with AsyncStorage');
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
        console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
      } catch (error: any) {
        console.warn('Auth initialization error:', error.code, error.message);
        // If auth is already initialized, just get it
        if (error.code === 'auth/already-initialized') {
          console.log('Auth already initialized, using existing instance');
          auth = getAuth(app);
        } else {
          console.error('Failed to initialize auth, falling back to getAuth:', error);
          // Fallback to regular getAuth if initializeAuth fails
          auth = getAuth(app);
        }
      }
    } else {
      console.log('Initializing Firebase Auth for web');
      auth = getAuth(app);
    }
    
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase already initialized');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { app, auth, db, storage };
export default { app, auth, db, storage };

