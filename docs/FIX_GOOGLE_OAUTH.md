# Fix Google OAuth 400 Error

## Step 1: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **project-158074708628** (or questlist-60033)
3. Navigate to **APIs & Services** → **OAuth consent screen**

### Configure the Consent Screen:

1. **User Type**: Choose "External" (unless you have a Google Workspace)
2. Click **Create**

3. Fill in the required fields:
   - **App name**: `Venture` (or `QuestList`)
   - **User support email**: Your email (jonathanlin1587@gmail.com)
   - **Developer contact information**: Your email
   - Click **Save and Continue**

4. **Scopes** (Step 2):
   - Click **Add or Remove Scopes**
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update** then **Save and Continue**

5. **Test users** (Step 3):
   - Click **Add Users**
   - Add your email: `jonathanlin1587@gmail.com`
   - Click **Add** then **Save and Continue**

6. **Summary** (Step 4):
   - Review and click **Back to Dashboard**

## Step 2: Configure OAuth Client Redirect URIs

1. Go to **APIs & Services** → **Credentials**
2. Find your **Web Client ID**: `158074708628-q57etqvaf7hthh3hs61rtko6npfss5dh.apps.googleusercontent.com`
3. Click on it to edit

4. Under **Authorized redirect URIs**, add these:
   ```
   https://auth.expo.io/@anonymous/venture
   exp://localhost:8081
   ```
   
   **Note**: For Expo Go, you might also need:
   ```
   exp://192.168.x.x:8081
   ```
   (Replace with your local IP if needed)

5. Under **Authorized JavaScript origins**, add:
   ```
   https://auth.expo.io
   ```

6. Click **Save**

## Step 3: Publish the App (Optional but Recommended)

If you want to allow any user to sign in (not just test users):

1. Go back to **OAuth consent screen**
2. Click **Publish App**
3. This will make it available to all users (after Google review if needed)

**OR** keep it in testing mode and add all test user emails.

## Step 4: Verify Configuration

1. Make sure Google Sign-In is enabled in Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/project/questlist-60033/authentication/settings)
   - **Sign-in method** → **Google** → Enable it
   - Add your Web Client ID if prompted

2. Restart your Expo dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```

3. Reload your app and try signing in again

## Common Issues:

- **Still getting 400 error**: Make sure you added your email as a test user
- **Redirect URI mismatch**: Check that the redirect URIs match exactly
- **App not verified**: If publishing, Google may need to verify your app (can take a few days)
