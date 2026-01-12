#!/usr/bin/env node

/**
 * Set Admin Status Script
 * 
 * This script sets admin custom claims for a user in Firebase Auth
 * and updates their Firestore document.
 * 
 * Usage:
 *   node scripts/setAdmin.js <email> [true|false]
 * 
 * Examples:
 *   node scripts/setAdmin.js admin@example.com
 *   node scripts/setAdmin.js admin@example.com true
 *   node scripts/setAdmin.js user@example.com false
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Get command line arguments
const email = process.argv[2];
const shouldBeAdmin = process.argv[3] !== 'false'; // Default to true if not specified

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('\nUsage:');
  console.log('  node scripts/setAdmin.js <email> [true|false]');
  console.log('\nExamples:');
  console.log('  node scripts/setAdmin.js admin@example.com');
  console.log('  node scripts/setAdmin.js admin@example.com true');
  console.log('  node scripts/setAdmin.js user@example.com false');
  process.exit(1);
}

// Find service account key
const possiblePaths = [
  path.join(__dirname, '..', 'serviceAccountKey.json'),
  path.join(__dirname, '..', 'firebase-service-account.json'),
  path.join(process.cwd(), 'serviceAccountKey.json'),
  path.join(process.cwd(), 'firebase-service-account.json'),
];

let serviceAccountPath = null;
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    serviceAccountPath = possiblePath;
    break;
  }
}

if (!serviceAccountPath) {
  console.error('❌ Error: Service account key not found!');
  console.log('\nPlease download your service account key:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to Project Settings → Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Save the JSON file as "serviceAccountKey.json" in the project root');
  console.log('\nOr set the path via SERVICE_ACCOUNT_KEY environment variable');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);
  
  // Check if already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\nMake sure your service account key is valid JSON');
  process.exit(1);
}

// Main function
async function setAdminStatus() {
  try {
    console.log(`\n🔍 Looking up user: ${email}`);
    
    // Get user by email
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log(`✅ Found user: ${user.displayName || user.email} (${user.uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error(`❌ Error: No user found with email ${email}`);
        console.log('\nMake sure the user has signed up first!');
        process.exit(1);
      }
      throw error;
    }

    // Set custom claims
    console.log(`\n🔐 Setting admin custom claim to: ${shouldBeAdmin}`);
    await admin.auth().setCustomUserClaims(user.uid, { admin: shouldBeAdmin });
    console.log('✅ Custom claims updated');

    // Update Firestore document
    console.log('📝 Updating Firestore document...');
    const db = admin.firestore();
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({ isAdmin: shouldBeAdmin });
      console.log('✅ Firestore document updated');
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isAdmin: shouldBeAdmin,
      }, { merge: true });
      console.log('✅ Firestore document created');
    }

    console.log('\n🎉 Success!');
    console.log(`\nUser ${email} is now ${shouldBeAdmin ? 'an ADMIN' : 'a regular user'}`);
    console.log('\n⚠️  Important: The user must sign out and sign back in for changes to take effect!');
    console.log('   (Custom claims are cached in the auth token)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  }
}

// Run the script
setAdminStatus();
