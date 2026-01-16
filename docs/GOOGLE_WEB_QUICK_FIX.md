# Quick Fix: Google Sign-In on Vercel

## Most Common Issue: Missing Environment Variable

**90% of the time, this is the problem:**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **Venture** project
3. Go to **Settings** → **Environment Variables**
4. Check if `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` exists
5. If it doesn't exist:
   - Click **"Add New"**
   - Key: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Value: Your Google OAuth Web Client ID (from Google Cloud Console)
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**
6. **Redeploy** your app (Deployments → Latest → Redeploy)

## Second Most Common: Vercel Domain Not Authorized

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Check if your Vercel domain is listed (e.g., `venture-xxx.vercel.app`)
5. If not, click **"Add domain"** and add it

## Third: Google OAuth Client Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find your **Web Client ID** (OAuth 2.0 Client ID)
5. Click to edit it
6. Under **Authorized redirect URIs**, make sure you have:
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/__/auth/handler`
7. Click **Save**

## Quick Test

After making changes:
1. Redeploy on Vercel
2. Open your app in an **incognito window**
3. Try Google Sign-In
4. Open browser console (F12) and check for errors

## What Error Are You Seeing?

- **Popup closes immediately**: Usually missing environment variable or unauthorized domain
- **"auth/unauthorized-domain"**: Add Vercel domain to Firebase authorized domains
- **"auth/operation-not-allowed"**: Enable Google Sign-In in Firebase Authentication
- **Popup blocked**: Check browser popup blocker settings
