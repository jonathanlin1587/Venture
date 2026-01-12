# Google Sign-In Setup Guide for Mobile

## Quick Fix for Expo Go

If you're using **Expo Go**, the easiest solution is to use the **Web Client ID** for all platforms:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Find or create a **Web Client ID** (OAuth 2.0 Client ID)
5. Copy the Client ID
6. Add it to your `.env` file as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## Full Setup (Recommended for Production)

### Step 1: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** sign-in provider
5. Add your OAuth client IDs (from Step 2)

### Step 2: Create OAuth 2.0 Client IDs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

#### For Web:
- Application type: **Web application**
- Name: "Venture Web Client"
- Authorized redirect URIs: Add your web domain (if applicable)
- Click **Create**
- Copy the **Client ID**

#### For iOS:
- Application type: **iOS**
- Name: "Venture iOS Client"
- Bundle ID: `com.venture.app` (must match your app.config.js)
- Click **Create**
- Copy the **Client ID**

#### For Android:
- Application type: **Android**
- Name: "Venture Android Client"
- Package name: `com.venture.app` (must match your app.config.js)
- SHA-1 certificate fingerprint: (optional for Expo Go, required for production builds)
- Click **Create**
- Copy the **Client ID**

### Step 3: Add Client IDs to Your Project

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your client IDs:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id_here
   ```

3. **Important**: Restart your Expo dev server after adding/changing `.env` variables:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm start
   ```

### Step 4: Test Google Sign-In

1. Make sure your `.env` file is in the root directory
2. Restart Expo dev server
3. Try signing in with Google on your device
4. Check the console/terminal for any error messages

## Troubleshooting

### "Google Sign-In is not configured" Error
- Make sure your `.env` file exists in the project root
- Check that the variable names start with `EXPO_PUBLIC_`
- Restart your Expo dev server after adding/changing `.env` variables

### "No ID token received from Google"
- Verify your OAuth client IDs are correct
- Make sure Google Sign-In is enabled in Firebase Console
- Check that the bundle ID/package name matches in both Google Cloud Console and app.config.js

### Sign-In Opens but Fails
- Check the browser console or Expo logs for specific error messages
- Verify the OAuth consent screen is configured in Google Cloud Console
- Make sure you're using the correct client ID for your platform

### For Expo Go Specifically
- You can use the **Web Client ID** for all platforms as a quick workaround
- For production, you should use platform-specific client IDs

## Notes

- The `.env` file should NOT be committed to git (it's in .gitignore)
- Environment variables must start with `EXPO_PUBLIC_` to be accessible in Expo
- After changing `.env`, you MUST restart the Expo dev server
