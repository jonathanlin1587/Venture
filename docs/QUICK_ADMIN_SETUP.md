# Quick Admin Setup Guide

Follow these steps to set up your first admin user.

## Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **questlist-60033**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. Click **"Generate Key"** in the confirmation dialog
7. Save the downloaded JSON file as `serviceAccountKey.json` in your project root:
   ```
   /Users/jonathanlin/Desktop/Projects/QuestList/serviceAccountKey.json
   ```

⚠️ **IMPORTANT**: This file contains sensitive credentials. It's already added to `.gitignore` - never commit it to git!

## Step 2: Sign Up Your Admin User

1. Run your app: `npm start`
2. Sign up with the email you want to make admin (e.g., `admin@example.com`)
3. Note the email address you used

## Step 3: Run the Admin Script

```bash
# Make a user admin (replace with your email)
npm run admin:set admin@example.com

# Or use the script directly
node scripts/setAdmin.js admin@example.com
```

The script will:
- ✅ Find the user by email
- ✅ Set Firebase Auth custom claims (`admin: true`)
- ✅ Update Firestore user document (`isAdmin: true`)

## Step 4: Sign Out and Sign Back In

**Important**: Custom claims are cached in the auth token. The user must:
1. Sign out of the app
2. Sign back in
3. The Admin tab should now appear in the bottom navigation! ⚙️

## Verify It Worked

After signing back in:
- ✅ Admin tab appears between "Discover" and "Profile"
- ✅ Can access Admin Panel with stats, users, and buckets
- ✅ Can grant/revoke admin status for other users

## Remove Admin Status

```bash
npm run admin:set user@example.com false
```

## Troubleshooting

### "Service account key not found"
- Make sure the file is named exactly `serviceAccountKey.json`
- Place it in the project root (same folder as `package.json`)
- Check the file path in the error message

### "No user found with email"
- User must sign up first in the app
- Check the email spelling
- User might be using a different email address

### Admin tab not showing
- User must sign out and sign back in (custom claims are cached)
- Check Firebase Console → Authentication → Users → [User] → Custom Claims
- Should show: `admin: true`

### Permission denied errors
- Deploy Firestore rules: `npm run deploy:rules`
- Make sure custom claims are set correctly
- User must sign out and back in after admin status is granted

## Next Steps

Once you have admin access:
- View app statistics in the Admin Panel
- Manage users and grant admin to others
- Moderate content (view/delete buckets)
- All admin features are in the Admin tab

---

**Need help?** See `ADMIN_SETUP.md` for detailed documentation.
