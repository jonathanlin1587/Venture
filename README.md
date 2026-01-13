# Venture

**Capture, share, and complete life's adventures**

Venture is a collaborative goal-tracking app that transforms your dreams into goals, your goals into plans, and your plans into memories. Organize your life adventures into meaningful buckets—whether solo journeys, shared experiences with a partner, or group quests with friends.

## Features

### 📦 Buckets
- **Three Types**: Solo, Duo, or Group buckets for different collaboration needs
- **Customizable Themes**: Choose from 10 colors and 24 icons to personalize your buckets
- **Cover Images**: Add custom cover images to make your buckets visually unique
- **Real-time Collaboration**: Share buckets with friends and see updates instantly
- **Member Management**: Add friends via email or from your friends list, manage member roles

### 🎯 Goals
- **Rich Goal Creation**: Add titles, descriptions, due dates, and categories
- **16 Goal Categories**: Adventure, Career, Creative, Education, Family, Fitness, Food & Drink, Health, Hobby, Mindfulness, Music, Personal, Relationship, Social, Sports, Travel
- **Completion Tracking**: Mark goals as complete with custom completion dates
- **Memory Vault**: Add photos and journal entries when completing goals to preserve memories
- **Favorites**: Star important goals for quick access
- **Smart Filtering**: Filter by status (all/active/completed), category, and search by keywords
- **Flexible Sorting**: Sort by date, favorites, due date, title, or category

### 👥 Social Features
- **Friends System**: Send friend requests, accept/reject invitations, and manage your friend network
- **User Search**: Find users by email or display name
- **Real-time Updates**: See friend requests and friend list updates in real-time
- **Profile Management**: Edit your display name, bio, and profile photo
- **Share Buckets**: Easily share duo or group buckets with friends

### 🔍 Discovery
- **Trending Goals**: Browse popular goals that others are adding
- **Popular Goals**: Discover what's trending in your area
- **AI Suggestions**: Get personalized goal recommendations
- **Quick Add**: Add discovered goals directly to your buckets with one tap

### 📸 Memory Features
- **Photo Gallery**: Attach multiple photos when completing goals
- **Memory Journal**: Write journal entries to capture the story behind each achievement
- **Completion Timeline**: View when goals were completed with full details

### 🛠️ Additional Features
- **Cross-Platform**: Native iOS and Android apps, plus full web support
- **Real-time Sync**: All changes sync instantly across all your devices
- **Multiple Auth Options**: Sign in with Email/Password, Google, or Apple
- **Admin Features**: Admin panel for managing the platform
- **Privacy & Security**: Full Terms of Service and Privacy Policy
- **Settings**: Customize your app experience
- **Help & Support**: Built-in support resources

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
Venture/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BucketCard.tsx   # Bucket display card
│   │   ├── GoalItem.tsx     # Goal display item
│   │   └── VentureLogo.tsx  # App logo component
│   ├── screens/             # Screen components
│   │   ├── LandingScreen.tsx      # Welcome/landing page
│   │   ├── LoginScreen.tsx        # Authentication
│   │   ├── BucketsScreen.tsx      # Main buckets list
│   │   ├── BucketDetailScreen.tsx # Bucket & goals management
│   │   ├── DiscoverScreen.tsx     # Goal discovery
│   │   ├── ProfileScreen.tsx      # User profile & friends
│   │   ├── SettingsScreen.tsx     # App settings
│   │   ├── AdminScreen.tsx        # Admin panel
│   │   └── ...                    # Other screens
│   ├── navigation/          # React Navigation setup
│   │   └── AppNavigator.tsx # Navigation configuration
│   ├── services/            # Firebase & API services
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── authService.ts   # Authentication logic
│   │   ├── bucketService.ts # Bucket & goal operations
│   │   ├── friendService.ts # Friends & friend requests
│   │   └── adminService.ts  # Admin operations
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # All type definitions
│   ├── hooks/               # Custom React hooks
│   │   └── useGoogleSignIn.ts
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── store/               # Zustand state management
│   │   └── bucketStore.ts   # Bucket & goal state
│   └── theme.ts             # App theme configuration
├── firebase/
│   └── firestore.rules      # Firestore security rules
├── scripts/                 # Utility scripts
│   └── setAdmin.js          # Admin setup script
├── App.tsx                  # App entry point
├── app.config.js            # Expo configuration
└── package.json             # Dependencies & scripts
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

## Deployment

### Web Deployment (Vercel)
The app is configured for deployment on Vercel. See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed instructions.

**Quick Deploy:**
1. Connect your GitHub repository to Vercel
2. Add required environment variables (Firebase config, Google OAuth)
3. Deploy automatically on push to main

### Mobile Deployment
- **iOS**: Build and deploy through Expo EAS or App Store Connect
- **Android**: Build and deploy through Expo EAS or Google Play Console

## Environment Variables

Required environment variables for full functionality:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Google OAuth (for web)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=

# Google OAuth (for iOS)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=

# Google OAuth (for Android)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

See [SETUP.md](./SETUP.md) and [GOOGLE_SIGNIN_SETUP.md](./GOOGLE_SIGNIN_SETUP.md) for detailed setup instructions.

## Troubleshooting

- **Google Sign-In issues**: See [FIX_POPUP_CLOSING.md](./FIX_POPUP_CLOSING.md)
- **Authentication problems**: See [DEBUG_AUTH.md](./DEBUG_AUTH.md)
- **Mobile-specific issues**: See [MOBILE_FEATURES.md](./MOBILE_FEATURES.md)
- **Admin setup**: See [QUICK_ADMIN_SETUP.md](./QUICK_ADMIN_SETUP.md)

## Contributing

This is a private project. For questions or support, please refer to the Help & Support section within the app.

## Documentation

Additional documentation is available in the repository:
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Web deployment guide
- [GOOGLE_SIGNIN_SETUP.md](./GOOGLE_SIGNIN_SETUP.md) - Google Sign-In configuration
- [FIX_POPUP_CLOSING.md](./FIX_POPUP_CLOSING.md) - Troubleshooting Google Sign-In
- [QUICK_ADMIN_SETUP.md](./QUICK_ADMIN_SETUP.md) - Admin panel setup
- [MOBILE_FEATURES.md](./MOBILE_FEATURES.md) - Mobile-specific features and notes

## License

Private project - All rights reserved

