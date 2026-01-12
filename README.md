# QuestList - Shared Ambitions App

A collaborative goal-tracking app where you can create solo, duo, or group "buckets" to track shared ambitions with friends.

## Features

- ✅ **Collaborative Buckets**: Create solo, duo, or group buckets for your goals
- ✅ **Real-time Sync**: Goals update in real-time across all devices
- ✅ **Multiple Auth Options**: Sign in with email, Google, or Apple
- ✅ **Goal Management**: Add, complete, and track goals within buckets
- ✅ **Cross-Platform**: Works on iOS, Android, and Web

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password, Google, Apple)
   - Enable Cloud Firestore
   - Copy your Firebase config

3. **Configure environment:**
   - Create a `.env` file in the root directory
   - Add your Firebase credentials (see `SETUP.md` for details)

4. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Run the app:**
   ```bash
   # Easiest way - use the run script:
   ./run.sh
   
   # Or use npm scripts:
   npm start          # Start Expo (then press i/a/w or scan QR code)
   npm run dev        # Same as npm start
   npm run ios        # Directly open iOS simulator
   npm run android    # Directly open Android emulator
   npm run web        # Directly open web browser
   npm run clear      # Clear cache and start fresh
   ```

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Project Structure

```
QuestList/
├── src/
│   ├── components/      # UI components (BucketCard, GoalItem)
│   ├── screens/         # Screen components (Login, Buckets, BucketDetail)
│   ├── navigation/      # React Navigation setup
│   ├── services/        # Firebase services (auth, buckets)
│   ├── types/           # TypeScript definitions
│   ├── hooks/           # Custom hooks (useGoogleSignIn)
│   ├── context/         # React Context (AuthContext)
│   ├── store/           # Zustand state management
│   └── utils/           # Utility functions
├── firebase/
│   └── firestore.rules  # Firestore security rules
└── App.tsx              # App entry point
```

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Authentication**: Firebase Auth, Google Sign-In, Apple Sign-In

## Scripts

### Quick Start
- `./run.sh` - Easy launcher (checks dependencies, then starts Expo)
- `./run.sh ios` - Start directly on iOS simulator
- `./run.sh android` - Start directly on Android emulator
- `./run.sh web` - Start directly on web browser
- `./run.sh tunnel` - Start with tunnel for physical device testing
- `./run.sh clear` - Clear cache and start fresh

### NPM Scripts
- `npm start` or `npm run dev` - Start Expo dev server (press i/a/w or scan QR code)
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser
- `npm run clear` or `npm run reset` - Clear cache and start
- `npm run tunnel` - Start with tunnel mode (for testing on physical devices)
- `npm run deploy:rules` - Deploy Firestore security rules

## Next Features (Coming Soon)

- 📸 **Memory Vault**: Transform completed goals into memory posts with photos
- 🔍 **Smart Discovery**: Trending goals, clone feature, AI suggestions
- 📊 **Timeline**: View your accomplishments chronologically
- 👥 **Social Features**: Invite friends, share achievements

## License

Private project

