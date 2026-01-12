# Adding Firebase Environment Variables to Vercel

This guide will help you add your Firebase configuration to Vercel so your app works in production.

## Step 1: Get Your Firebase Configuration Values

### Option A: From Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Firebase project
3. Click the **gear icon** (⚙️) next to "Project Overview" → **Project Settings**
4. Scroll down to the **"Your apps"** section
5. Find your **Web app** (or click **"Add app"** → **Web** if you don't have one)
6. You'll see your Firebase config. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Option B: From Your Local .env File

If you have a `.env` file locally, you can check it for the values (but don't commit it to GitHub!).

## Step 2: Add Environment Variables to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your **Venture** project
3. Click on **Settings** (in the top navigation)
4. Click on **Environment Variables** (in the left sidebar)
5. Add each variable one by one:

### Required Firebase Variables

Click **"Add New"** and add these one at a time:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Your Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Your Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` | Your Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Your Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Your Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abc123` | Your Firebase app ID |

### Optional: Google OAuth (if using Google Sign-In)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Your Google OAuth web client ID |

### For Each Variable:
- **Key**: Enter the variable name (e.g., `EXPO_PUBLIC_FIREBASE_API_KEY`)
- **Value**: Paste the corresponding value from Firebase
- **Environment**: Select **Production**, **Preview**, and **Development** (or just **Production** if you only want it for production)
- Click **Save**

## Step 3: Redeploy Your App

After adding all environment variables:

1. Go to the **Deployments** tab in your Vercel project
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger an automatic redeploy

## Step 4: Verify It Works

1. After redeployment, visit your Vercel URL
2. Open browser developer tools (F12) → Console tab
3. You should see Firebase initialization logs (not errors about missing config)
4. Try signing in to verify authentication works

## Step 5: Add Vercel Domain to Firebase

After your app is deployed, you need to authorize your Vercel domain in Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain (e.g., `venture-xxx.vercel.app`)
6. Click **"Add"**

## Quick Reference: All Required Variables

Copy-paste this list to make sure you add everything:

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (optional)
```

## Troubleshooting

### "Firebase configuration is missing" error
- Make sure all variables are added in Vercel
- Make sure variable names start with `EXPO_PUBLIC_`
- Redeploy after adding variables

### Authentication not working
- Check that your Vercel domain is in Firebase authorized domains
- Verify all environment variables are correct
- Check browser console for specific errors

### Variables not showing up
- Make sure you selected the correct environments (Production/Preview/Development)
- Redeploy after adding variables
- Check that variable names match exactly (case-sensitive)
