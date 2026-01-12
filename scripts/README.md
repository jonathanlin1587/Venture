# Admin Scripts

This directory contains scripts for managing admin users.

## Setup

### 1. Install Firebase Admin SDK

```bash
npm install --save-dev firebase-admin
```

### 2. Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (questlist-60033)
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the JSON file as `serviceAccountKey.json` in the project root
6. **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (already done)

### 3. Run the Script

```bash
# Make admin
node scripts/setAdmin.js admin@example.com

# Or explicitly set to true
node scripts/setAdmin.js admin@example.com true

# Remove admin status
node scripts/setAdmin.js user@example.com false
```

## Security Notes

- **Never commit** `serviceAccountKey.json` to git
- Keep your service account key secure
- Only run this script on trusted machines
- The service account key has full admin access to your Firebase project

## Troubleshooting

### "Service account key not found"
- Make sure the JSON file is named `serviceAccountKey.json`
- Place it in the project root directory
- Or set the path via `SERVICE_ACCOUNT_KEY` environment variable

### "No user found with email"
- The user must have signed up first
- Check the email spelling
- User might be using a different email

### "Custom claims not working"
- User must sign out and sign back in
- Custom claims are cached in the auth token
- Force token refresh: `user.getIdToken(true)`
