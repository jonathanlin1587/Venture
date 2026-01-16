# Fix: Google Sign-In Popup Closes Immediately

If the Google Sign-In popup opens then closes immediately, follow these steps **in order**:

## Step 1: Add Environment Variable to Vercel (MOST IMPORTANT)

Your Google Web Client ID: `158074708628-q57etqvaf7hthh3hs61rtko6npfss5dh.apps.googleusercontent.com`

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **Venture** project
3. Click **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key**: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - **Value**: `158074708628-q57etqvaf7hthh3hs61rtko6npfss5dh.apps.googleusercontent.com`
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**
7. **IMPORTANT**: Go to **Deployments** → Click **"..."** on latest deployment → **Redeploy**

## Step 2: Add Vercel Domain to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Find your Vercel domain (it will be something like `venture-xxx.vercel.app`)
   - You can find it in your Vercel dashboard under your project's domains
5. If it's NOT listed, click **"Add domain"**
6. Enter your Vercel domain (e.g., `venture-abc123.vercel.app`)
7. Click **Add**

## Step 3: Configure Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find your **Web Client ID**: `158074708628-q57etqvaf7hthh3hs61rtko6npfss5dh.apps.googleusercontent.com`
5. Click on it to edit
6. Under **Authorized redirect URIs**, add:
   ```
   https://your-project.vercel.app     
   https://your-project.vercel.app/__/auth/handler
   ```
   (Replace `your-project.vercel.app` with your actual Vercel domain)
7. Under **Authorized JavaScript origins**, add:
   ```
   https://your-project.vercel.app
   ```
8. Click **Save**

## Step 4: Verify Firebase Google Sign-In is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Make sure it's **Enabled**
6. Under **Web SDK configuration**, make sure your **Web client ID** is set:
   - `158074708628-q57etqvaf7hthh3hs61rtko6npfss5dh.apps.googleusercontent.com`
7. Click **Save**

## Step 5: Test Again

1. **Redeploy** your Vercel app (if you haven't already)
2. Open your app in an **incognito/private window**
3. Try Google Sign-In again
4. Open browser console (F12 → Console) to see detailed error messages

## Debugging: Check Browser Console

After clicking "Sign in with Google", check the browser console for:

- ✅ **Good signs**: 
  - `🌐 Web Google Sign-In: Starting...`
  - `📱 Opening Google Sign-In popup...`
  
- ❌ **Error codes to look for**:
  - `auth/unauthorized-domain` → Step 2 (add domain to Firebase)
  - `auth/operation-not-allowed` → Step 4 (enable Google Sign-In)
  - `auth/popup-closed-by-user` → User cancelled (not an error)
  - `auth/popup-blocked` → Browser blocked popup (check popup blocker)

## Quick Checklist

- [ ] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` added to Vercel environment variables
- [ ] Vercel app redeployed after adding environment variable
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Google OAuth client has Vercel domain in authorized redirect URIs
- [ ] Google Sign-In enabled in Firebase Authentication
- [ ] Web Client ID configured in Firebase Authentication settings

## Still Not Working?

1. **Check the exact error** in browser console (F12)
2. **Verify your Vercel domain** - it should be in the format: `venture-xxx.vercel.app`
3. **Wait a few minutes** after making changes (sometimes takes time to propagate)
4. **Try in incognito mode** to avoid cached issues
