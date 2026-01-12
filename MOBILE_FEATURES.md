# Mobile Features Status

## What Works in Expo Go

✅ **Email/Password Authentication** - Works perfectly
✅ **Google Sign-In** - Should work with proper OAuth setup (see FIX_GOOGLE_OAUTH.md)
✅ **Basic App Functionality** - All core features work
✅ **Firebase Integration** - Full Firebase support
✅ **Navigation** - React Navigation works
✅ **State Management** - Zustand works

## What Requires Development Build

❌ **Apple Sign-In** - Requires a development build (doesn't work in Expo Go)
  - `expo-apple-authentication` needs native code compilation
  - You'll see the button but it won't work in Expo Go
  - To use: Run `npx expo prebuild` then `npx expo run:ios`

## Google Sign-In Troubleshooting

If Google Sign-In isn't working:

1. **Check OAuth Consent Screen**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent?project=questlist-60033)
   - Make sure it's configured (see FIX_GOOGLE_OAUTH.md)
   - Add your email as a test user

2. **Check Redirect URIs**:
   - In Google Cloud Console → Credentials → Your Web Client ID
   - Add these redirect URIs:
     - `https://auth.expo.io/@anonymous/venture`
     - `exp://localhost:8081`

3. **Check Firebase**:
   - Make sure Google Sign-In is enabled in Firebase Console
   - Go to Authentication → Sign-in method → Google → Enable

4. **Check Console Logs**:
   - Look for error messages when you try to sign in
   - Share the exact error message for help

## Building a Development Build (for Apple Sign-In)

If you want to use Apple Sign-In:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile development

# Or use local build
npx expo prebuild
npx expo run:ios
```

## Current Status

- ✅ Email/Password: Working
- ⚠️ Google Sign-In: Needs OAuth setup (see FIX_GOOGLE_OAUTH.md)
- ❌ Apple Sign-In: Requires development build (not available in Expo Go)
