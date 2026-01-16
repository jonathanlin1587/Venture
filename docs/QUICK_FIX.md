# Quick Fix Checklist for Mobile Authentication

## ⚠️ CRITICAL: Enable Email/Password in Firebase

**This is the #1 reason authentication fails!**

1. Go to: https://console.firebase.google.com/project/questlist-60033/authentication/settings
2. Click **"Sign-in method"** tab
3. Find **"Email/Password"** in the list
4. Click on it
5. Toggle **"Enable"** to ON
6. Click **"Save"**

**Do this NOW before trying anything else!**

## Check Console Logs

When you try to sign in, look for these in your terminal:

### ✅ Good Signs:
- `"Firebase Config Check: { hasApiKey: true, hasAuthDomain: true, ... }"`
- `"✅ Firebase initialized successfully"`
- `"Initializing Firebase Auth for mobile with AsyncStorage"`
- `"Attempting sign in with email: [your-email]"`

### ❌ Bad Signs:
- `"⚠️ Firebase configuration is missing!"`
- `"❌ Firebase auth is not initialized!"`
- `"❌ Email sign-in error: { code: 'auth/operation-not-allowed', ... }"`

## Common Error Codes:

### `auth/operation-not-allowed`
**FIX**: Enable Email/Password in Firebase (see above)

### `auth/network-request-failed`
**FIX**: Check internet connection

### `auth/invalid-api-key`
**FIX**: Check your `.env` file has the correct Firebase API key

### `auth/user-not-found`
**FIX**: Sign up first, or use correct email

## Test Steps:

1. **Enable Email/Password** in Firebase (CRITICAL!)
2. **Restart Expo**: `npm start --clear`
3. **Reload app** on phone
4. **Try signing UP** with a new email (not sign in)
5. **Check terminal logs** for errors
6. **Share the exact error message** if it still fails

## Still Not Working?

Share these details:
1. The **exact error message** from the Alert
2. The **console logs** from terminal (especially lines with ❌ or ⚠️)
3. Whether you **enabled Email/Password** in Firebase
4. Whether **sign-up works** but sign-in doesn't (or vice versa)
