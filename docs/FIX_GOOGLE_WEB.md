# Fixing Google Sign-In on Vercel (Web)

If Google Sign-In isn't working on your Vercel deployment, follow these steps:

## Common Issues & Solutions

### 1. Missing Environment Variable in Vercel

**Problem**: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is not set in Vercel.

**Solution**:
1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` with your Google OAuth Web Client ID
3. Make sure it's set for **Production**, **Preview**, and **Development**
4. **Redeploy** your app after adding the variable

### 2. Vercel Domain Not in Firebase Authorized Domains

**Problem**: Firebase blocks sign-in from unauthorized domains.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain (e.g., `venture-xxx.vercel.app`)
6. Also add your custom domain if you have one
7. Click **"Add"**

### 3. Google OAuth Client ID Not Configured in Firebase

**Problem**: Firebase doesn't have your Google OAuth client ID configured.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Make sure it's **Enabled**
6. Under **Web SDK configuration**, add your **Web client ID** (from Google Cloud Console)
7. Click **Save**

### 4. Google OAuth Client ID Missing Authorized Redirect URIs

**Problem**: Google OAuth client doesn't allow redirects from your Vercel domain.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find your **Web Client ID** (OAuth 2.0 Client ID)
5. Click to edit it
6. Under **Authorized redirect URIs**, add:
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/__/auth/handler` (Firebase Auth handler)
   - Your custom domain if you have one
7. Click **Save**

### 5. Check Browser Console for Errors

**How to debug**:
1. Open your Vercel app in a browser
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Try to sign in with Google
5. Look for error messages

Common errors:
- `auth/unauthorized-domain` → Add Vercel domain to Firebase authorized domains
- `auth/operation-not-allowed` → Enable Google Sign-In in Firebase
- `auth/popup-closed-by-user` → User closed the popup (not an error)
- `auth/popup-blocked` → Browser blocked the popup (check popup blocker)

## Step-by-Step Checklist

✅ **Environment Variables in Vercel**:
- [ ] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set
- [ ] Variable is available for Production environment
- [ ] App has been redeployed after adding variable

✅ **Firebase Configuration**:
- [ ] Google Sign-In is enabled in Firebase Authentication
- [ ] Web Client ID is added in Firebase Authentication settings
- [ ] Vercel domain is in Firebase authorized domains

✅ **Google Cloud Console**:
- [ ] Web Client ID exists
- [ ] Vercel domain is in authorized redirect URIs
- [ ] OAuth consent screen is configured

✅ **Testing**:
- [ ] Check browser console for errors
- [ ] Try signing in and check what error appears
- [ ] Verify popup is not blocked by browser

## Quick Test

After making changes:

1. **Redeploy** your Vercel app (or wait for automatic redeploy)
2. Open your app in an **incognito/private window** (to avoid cached issues)
3. Try signing in with Google
4. Check the browser console for any errors

## Still Not Working?

If you've checked everything above and it still doesn't work:

1. **Check the exact error** in browser console
2. **Verify your Google OAuth Client ID** is correct:
   - Should look like: `123456789-abc123def456.apps.googleusercontent.com`
   - Should be a "Web application" type in Google Cloud Console
3. **Make sure you're using the Web Client ID**, not iOS or Android client ID
4. **Check Firebase logs**:
   - Firebase Console → Authentication → Users
   - See if any sign-in attempts are being logged

## Need Your Google OAuth Web Client ID?

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Look for **OAuth 2.0 Client IDs**
5. Find the one with type **"Web application"**
6. Copy the **Client ID** (not the Client Secret)
