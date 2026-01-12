# Deploying Venture to Vercel

This guide will help you deploy your Venture app to Vercel for free hosting.

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. A Vercel account (free at [vercel.com](https://vercel.com))
3. Your Firebase project configured

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Set Up Vercel

### Option A: Using Vercel Web Interface (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository (`jonathanlin1587/venture`)
4. Vercel will auto-detect the settings from `vercel.json`
5. **Important**: If build fails, you may need to manually configure:
   - Framework Preset: "Other" or "Expo"
   - Build Command: `npm run build:web`
   - Output Directory: `web-build`
   - Install Command: `npm install`

### Option B: Using Vercel CLI

Run the deployment script:
```bash
./deploy-vercel.sh
```

Or manually:
```bash
vercel login
vercel --prod
```

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Firebase Configuration
- `EXPO_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID

### Google OAuth (if using)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Your Google OAuth web client ID

### How to find these values:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Click on your web app (or create one if needed)
6. Copy the config values

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `your-project.vercel.app`

## Step 5: Update Firebase Auth Domain

After deployment, you need to add your Vercel domain to Firebase:

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", click "Add domain"
3. Add your Vercel domain (e.g., `your-project.vercel.app`)
4. Also add your custom domain if you set one up

## Step 6: (Optional) Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `venture.app`)
3. Follow DNS configuration instructions
4. Add the custom domain to Firebase authorized domains

## Troubleshooting

### Build fails with "expo-router/node/render.js" error
This is a known issue with Expo SDK 54 and React Navigation apps. Solutions:
1. **Recommended**: Use Vercel's web interface - it handles Expo builds better
2. Try setting Framework Preset to "Other" in Vercel project settings
3. The build script will create a minimal structure - Vercel will build the actual app

### Build fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Make sure `npm install` completes successfully
- Try clearing Vercel build cache in project settings

### Authentication not working
- Verify Firebase environment variables are correct
- Check that your Vercel domain is in Firebase authorized domains
- Check browser console for errors

### App shows blank screen
- Check that `web-build` folder is being generated
- Verify `vercel.json` configuration is correct
- Check Vercel build logs for errors
- Ensure all Firebase environment variables are set correctly

## Local Testing

Test the production build locally:

```bash
npm run build:web
npx serve web-build
```

Visit `http://localhost:3000` to test.

## Continuous Deployment

Vercel automatically deploys when you push to your main branch. Each push creates a new deployment preview.

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Deployment](https://docs.expo.dev/distribution/publishing-websites/)
- Check build logs in Vercel dashboard for specific errors
