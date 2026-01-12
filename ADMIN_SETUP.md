# Admin Setup Guide

This guide explains how to set up admin controls for QuestList.

## Overview

Admin controls allow designated users to:
- View app-wide statistics (users, buckets, goals)
- Manage all users (view, grant/revoke admin status)
- Manage all buckets (view, delete)
- Access all data for moderation and support

## How Admin Status Works

Admin status is determined by **Firebase Auth Custom Claims**. This is the secure, recommended way to handle admin privileges in Firebase.

### Two-Level Check

1. **Primary**: Firebase Auth Custom Claims (`admin: true`)
   - Set via Firebase Admin SDK (server-side)
   - Fast and secure
   - Works with Firestore security rules

2. **Fallback**: Firestore user document (`isAdmin: true`)
   - Stored in user's Firestore document
   - Used if custom claims aren't set yet
   - Can be updated via Admin Panel

## Setting Up Admin Users

### Option 1: Using Firebase Admin SDK (Recommended)

This is the most secure method. You'll need to create a simple Node.js script or use Firebase Functions.

#### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

#### Step 2: Create Admin Script

Create a file `scripts/setAdmin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get user by email
async function setAdminByEmail(email, isAdmin = true) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: isAdmin });
    console.log(`✅ Admin status ${isAdmin ? 'granted' : 'revoked'} for ${email}`);
    
    // Also update Firestore document
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).update({ isAdmin });
    console.log(`✅ Firestore document updated`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
const email = process.argv[2];
if (!email) {
  console.error('Usage: node setAdmin.js <email>');
  process.exit(1);
}

setAdminByEmail(email, true);
```

#### Step 3: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file securely (don't commit to git!)

#### Step 4: Run the Script

```bash
node scripts/setAdmin.js admin@example.com
```

### Option 2: Using Firebase Console (Temporary/Testing)

For quick testing, you can temporarily set admin status via the Admin Panel in the app (if you already have one admin), but this only updates Firestore, not custom claims.

**Important**: For production, always use Firebase Admin SDK to set custom claims.

### Option 3: Using Firebase CLI

You can also use Firebase CLI with a Cloud Function:

```bash
firebase functions:config:set admin.emails="admin1@example.com,admin2@example.com"
```

Then in your Cloud Function, check if the user's email is in the admin list.

## Verifying Admin Status

After setting admin status:

1. **User must sign out and sign back in** for custom claims to refresh
2. The admin tab should appear in the bottom navigation
3. Accessing `/admin` should show the Admin Panel

## Admin Features

### Statistics Tab
- Total users
- Active users (last 30 days)
- Total buckets
- Total goals
- Completed goals
- Completion rate

### Users Tab
- View all users
- See user details (email, join date)
- Grant/revoke admin status (updates Firestore)
- Admin badge indicator

### Buckets Tab
- View all buckets
- See bucket details (type, members, creation date)
- Delete buckets (with confirmation)

## Security Notes

1. **Custom Claims are Primary**: Firestore rules check `request.auth.token.admin == true`
2. **Firestore is Fallback**: The app checks Firestore `isAdmin` field as a fallback
3. **Always Use Admin SDK**: For production, always set custom claims via Admin SDK
4. **Don't Expose Service Account**: Never commit service account keys to git
5. **Limit Admin Access**: Only grant admin to trusted users

## Troubleshooting

### Admin tab not showing
- Check if `isAdmin` is true in AuthContext
- User may need to sign out and sign back in
- Verify custom claims are set: Check Firebase Console → Authentication → Users → [User] → Custom Claims

### Permission denied errors
- Verify Firestore rules are deployed: `npm run deploy:rules`
- Check that custom claims are set correctly
- Ensure user has signed out and back in after admin status was granted

### Admin status not persisting
- Custom claims are cached in the auth token
- User must sign out and sign back in to refresh
- Or call `user.getIdToken(true)` to force refresh

## Example: First Admin Setup

1. Create your first admin user account (sign up normally)
2. Get the user's UID from Firebase Console → Authentication
3. Run the admin setup script:
   ```bash
   node scripts/setAdmin.js your-email@example.com
   ```
4. Sign out and sign back in
5. Admin tab should appear!

## Next Steps

- Set up automated admin assignment (e.g., specific email domains)
- Add more admin features (content moderation, user management)
- Create admin audit logs
- Set up admin notifications
