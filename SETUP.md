# QuestList - Setup Guide

This guide will help you set up the QuestList app with Firebase and get it running.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- (Optional) Google Cloud Console account for Google Sign-In
- (Optional) Apple Developer account for Apple Sign-In (iOS only)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enable the following services:
   - **Authentication**: Enable Email/Password, Google, and Apple sign-in methods
   - **Cloud Firestore**: Create a database in production mode (we'll deploy rules later)
   - **Storage**: Enable Firebase Storage

4. Register your app:
   - For **Web**: Click the web icon (`</>`), register your app, and copy the config
   - For **iOS**: Click the iOS icon, register your app with bundle ID `com.questlist.app`
   - For **Android**: Click the Android icon, register your app with package name `com.questlist.app`

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth Configuration (Optional - for Google Sign-In)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
```

2. Fill in the values from your Firebase project settings

## Step 4: Set Up Google Sign-In (Optional)

If you want to enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your Firebase project
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs:
   - **Web client ID**: For web platform
   - **iOS client ID**: For iOS (use the same bundle ID as Firebase)
   - **Android client ID**: For Android (use the same package name as Firebase)
5. Add these client IDs to your `.env` file

## Step 5: Deploy Firestore Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Choose `firebase/firestore.rules` as the rules file
   - Don't overwrite existing rules

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 6: Run the App

### Development Mode

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

### Platform-Specific

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Step 7: Test Authentication

1. Open the app
2. Try signing up with email/password
3. (Optional) Test Google Sign-In
4. (iOS only) Test Apple Sign-In

## Troubleshooting

### Firebase Connection Issues

- Make sure all environment variables are set correctly
- Check that your Firebase project has the required services enabled
- Verify your Firestore rules are deployed

### Google Sign-In Not Working

- Ensure Google+ API is enabled in Google Cloud Console
- Check that OAuth client IDs match your app's bundle/package IDs
- For iOS, make sure the reversed client ID is added to Info.plist (handled automatically by Expo)

### Apple Sign-In Not Working (iOS)

- Apple Sign-In only works on physical iOS devices or simulator with iOS 13+
- Ensure you're signed in to iCloud on the simulator
- Check that Apple Sign-In is enabled in Firebase Authentication

## Project Structure

```
QuestList/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── services/        # Firebase & API services
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   ├── store/           # Zustand state management
│   └── utils/           # Utility functions
├── firebase/
│   └── firestore.rules  # Firestore security rules
├── App.tsx              # Main app entry
└── app.config.js        # Expo configuration
```

## Next Steps

After setup, you can:
1. Create your first bucket
2. Add goals to buckets
3. Invite friends to shared buckets
4. Check off completed goals

## Future Features

- Memory Vault (transform completed goals into memory posts)
- Smart Discovery (trending goals, clone feature, AI suggestions)
- Timeline/profile view
- Media uploads for Memory Vault

