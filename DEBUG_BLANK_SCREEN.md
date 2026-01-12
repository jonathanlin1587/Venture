# Debugging Blank Screen Issue

If you're seeing a blank screen, try these steps:

## Quick Fixes

### 1. Clear Cache and Restart
```bash
npm run clear
# or
npm run reset
```

### 2. Check Console for Errors
Look for any red error messages in:
- Terminal/console where you ran `npm start`
- Browser console (if running on web)
- React Native debugger

### 3. Check if it's an Admin Check Issue

The blank screen might be caused by the admin check. To test:

1. **Temporarily disable admin check** in `src/navigation/AppNavigator.tsx`:
   - Comment out the admin tab: `{/* userIsAdmin && ... */}`
   - See if app loads

2. **Check AuthContext logs**:
   - Look for "AuthContext: Error checking admin status" in console
   - This would indicate the admin check is failing

## Common Issues

### Issue: Admin check hanging
**Solution**: The `isAdmin` function now has better error handling. If it still hangs, check:
- Firebase connection
- Firestore permissions
- Network connectivity

### Issue: Navigation error
**Solution**: Check if all screen components are properly imported and exported

### Issue: AuthContext error
**Solution**: Check console for "AuthContext: Error" messages

## Test Without Admin Features

To test if admin features are causing the issue:

1. In `src/navigation/AppNavigator.tsx`, change:
   ```typescript
   const userIsAdmin = Boolean(isAdmin);
   ```
   to:
   ```typescript
   const userIsAdmin = false; // Temporarily disable
   ```

2. Restart the app
3. If it works, the issue is with admin check
4. If it still doesn't work, the issue is elsewhere

## Check Browser Console (Web)

If running on web:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

## Check React Native Logs

If running on mobile:
```bash
# iOS
npx react-native log-ios

# Android  
npx react-native log-android
```

## Still Not Working?

1. Check if you can see the login screen
2. Check if you can sign in
3. Check if the issue happens after sign in
4. Share the console error messages
