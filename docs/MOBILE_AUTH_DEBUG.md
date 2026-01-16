# Mobile Authentication Debugging Guide

## Step 1: Check Console Logs

When you try to sign in, check the terminal/console for these logs:

1. **Firebase Config Check** - Should show:
   - `hasApiKey: true`
   - `hasAuthDomain: true`
   - `hasProjectId: true`
   - `platform: "ios"` or `"android"`

2. **Auth Initialization** - Should see:
   - `"Initializing Firebase Auth for mobile with AsyncStorage"`
   - `"✅ Firebase Auth initialized with AsyncStorage persistence"`

3. **Sign-in Attempt** - Should see:
   - `"Attempting sign in with email: [your-email]"`
   - `"Auth instance check: { hasAuth: true, platform: 'ios' }"`
   - `"Calling signInWithEmailAndPassword..."`

4. **Errors** - Look for:
   - `"❌ Email sign-in error:"` with error code and message

## Step 2: Verify Firebase Configuration

1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/questlist-60033/authentication)
2. Click **"Sign-in method"** tab
3. **Enable Email/Password**:
   - Find "Email/Password" in the list
   - Click on it
   - Toggle **"Enable"** to ON
   - Click **"Save"**

4. **Enable Google** (if using):
   - Find "Google" in the list
   - Click on it
   - Toggle **"Enable"** to ON
   - Add your Web Client ID: `158074708628-q57etqvaf7hthh3hs61rtko6npfss5dh.apps.googleusercontent.com`
   - Click **"Save"**

## Step 3: Check Network Connectivity

Make sure your phone:
- Is connected to the internet
- Can reach Firebase servers
- Is not behind a firewall blocking Firebase

## Step 4: Common Error Codes

### `auth/operation-not-allowed`
- **Cause**: Email/Password or Google Sign-In not enabled in Firebase
- **Fix**: Enable the sign-in method in Firebase Console (Step 2)

### `auth/network-request-failed`
- **Cause**: Network connectivity issue
- **Fix**: Check internet connection, try again

### `auth/invalid-api-key`
- **Cause**: Firebase API key is incorrect or missing
- **Fix**: Check your `.env` file has correct `EXPO_PUBLIC_FIREBASE_API_KEY`

### `auth/user-not-found`
- **Cause**: Trying to sign in with an email that doesn't exist
- **Fix**: Sign up first, or use the correct email

### `auth/wrong-password`
- **Cause**: Incorrect password
- **Fix**: Use the correct password

## Step 5: Test Email/Password Sign-Up

Try creating a NEW account:
1. Switch to "Sign Up" mode
2. Enter email, password, and display name
3. Check console logs for errors
4. If sign-up works but sign-in doesn't, there's a different issue

## Step 6: Restart Everything

1. **Stop Expo server** (Ctrl+C)
2. **Clear cache and restart**:
   ```bash
   npm start --clear
   ```
3. **Reload app** on your phone
4. **Try again**

## Step 7: Check Firestore Rules

Make sure Firestore rules allow user creation:
- Go to [Firestore Rules](https://console.firebase.google.com/project/questlist-60033/firestore/rules)
- Rules should allow authenticated users to create/update their user document

## What to Share for Debugging

If it still doesn't work, share:
1. The **exact error message** from the Alert
2. The **console logs** from the terminal (especially the error logs)
3. Which **sign-in method** you tried (email/password, Google, Apple)
4. Whether **sign-up works** but sign-in doesn't
