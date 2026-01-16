# Debugging Authentication Issues

## Step 1: Check Browser Console
1. Open your browser console (F12 or Right-click → Inspect → Console)
2. Look for:
   - "Firebase Config Check" log message
   - Any red error messages
   - Console logs from sign-up/sign-in attempts

## Step 2: Enable Email/Password in Firebase
1. Go to: https://console.firebase.google.com/project/questlist-60033/authentication
2. Click "Sign-in method" tab
3. Find "Email/Password" provider
4. Click on it and Enable it
5. Click "Save"

## Step 3: Check Firebase Rules
Make sure Firestore rules allow user creation:
- Rules should be deployed (already done)
- Users collection should allow create/update for authenticated users

## Step 4: Try Again
After enabling Email/Password:
1. Refresh your browser
2. Try signing up again
3. Check console for error messages

## Common Errors:
- "auth/operation-not-allowed" = Email/Password not enabled
- "auth/invalid-api-key" = Firebase config issue
- "auth/network-request-failed" = Network/connectivity issue

