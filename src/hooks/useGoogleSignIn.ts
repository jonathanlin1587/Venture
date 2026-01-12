import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { signInWithGoogle } from '../services/authService';

// Google OAuth configuration
const googleConfig = {
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  webClientId: Constants.expoConfig?.extra?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
};

// Debug: Log Google config (without full client IDs)
console.log('Google Config Check:', {
  hasIosClientId: !!googleConfig.iosClientId,
  hasAndroidClientId: !!googleConfig.androidClientId,
  hasWebClientId: !!googleConfig.webClientId,
  platform: Platform.OS,
});

/**
 * Hook for Google Sign-In on mobile platforms
 * Returns a function to trigger Google sign-in
 */
export const useGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Use platform-specific client ID, fallback to webClientId for Expo Go
    iosClientId: googleConfig.iosClientId || googleConfig.webClientId || undefined,
    androidClientId: googleConfig.androidClientId || googleConfig.webClientId || undefined,
    webClientId: googleConfig.webClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
    // Request both id_token and access_token
    responseType: 'id_token' as const,
    additionalParameters: {},
  });

  // Handle response changes
  useEffect(() => {
    if (response?.type === 'error') {
      console.error('Google auth response error:', response.error);
      setError(response.error?.message || 'Google sign-in failed');
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      // On web, use the service directly (it uses Firebase popup)
      setLoading(true);
      setError(null);
      try {
        await signInWithGoogle();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // On mobile, use expo-auth-session
      setLoading(true);
      setError(null);
      
      // Check if client IDs are configured
      // For Expo Go, we can use webClientId as a fallback
      const hasClientId = Platform.OS === 'ios' 
        ? (!!googleConfig.iosClientId || !!googleConfig.webClientId)
        : (!!googleConfig.androidClientId || !!googleConfig.webClientId);
      
      if (!hasClientId) {
        const errorMsg = `Google Sign-In is not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (or platform-specific client ID) in your .env file. See GOOGLE_SIGNIN_SETUP.md for instructions.`;
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      try {
        if (!request) {
          console.warn('Google auth request not ready, waiting...');
          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 500));
          if (!request) {
            throw new Error('Google auth request not ready. Please try again.');
          }
        }

        console.log('Prompting Google auth...');
        const result = await promptAsync();
        
        console.log('Google auth result:', {
          type: result.type,
          hasParams: !!result.params,
          paramKeys: result.params ? Object.keys(result.params) : [],
        });
        
        if (result.type === 'success') {
          const { id_token, access_token } = result.params;
          console.log('Google auth tokens:', {
            hasIdToken: !!id_token,
            hasAccessToken: !!access_token,
          });
          
          if (id_token || access_token) {
            console.log('Signing in with Firebase using Google tokens...');
            await signInWithGoogle(id_token, access_token);
            console.log('✅ Google sign-in completed successfully');
          } else {
            console.error('No tokens in result.params:', result.params);
            throw new Error('No ID token or access token received from Google. Please check your OAuth configuration.');
          }
        } else if (result.type === 'cancel') {
          // Don't throw error for cancellation - user intentionally cancelled
          console.log('Google sign-in was cancelled by user');
          setError(null);
          return; // Just return without throwing
        } else if (result.type === 'error') {
          const errorMessage = result.error?.message || result.error?.code || 'Google sign-in failed';
          console.error('Google auth error:', {
            error: result.error,
            message: errorMessage,
            fullError: JSON.stringify(result.error, null, 2),
          });
          
          // Provide more helpful error messages
          let userFriendlyMessage = errorMessage;
          if (errorMessage.includes('invalid_request') || errorMessage.includes('400')) {
            userFriendlyMessage = 'Google Sign-In configuration error. Please check FIX_GOOGLE_OAUTH.md for setup instructions.';
          } else if (errorMessage.includes('access_denied')) {
            userFriendlyMessage = 'Google Sign-In was denied. Please try again.';
          }
          
          throw new Error(userFriendlyMessage);
        } else {
          console.error('Unknown result type:', result);
          throw new Error(`Google sign-in failed: ${result.type}`);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to sign in with Google';
        console.error('Google sign-in error:', err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    handleGoogleSignIn,
    loading,
    error,
  };
};

