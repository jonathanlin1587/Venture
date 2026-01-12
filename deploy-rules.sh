#!/bin/bash

echo "🚀 Deploying Firestore Security Rules..."
echo ""

# Check if already logged in
if firebase projects:list &>/dev/null; then
    echo "✅ Already logged in to Firebase"
else
    echo "⚠️  Not logged in. Please login..."
    echo "Opening Firebase login page..."
    firebase login
fi

echo ""
echo "Setting project to questlist-60033..."
firebase use questlist-60033

echo ""
echo "Deploying Firestore rules from firebase/firestore.rules..."
firebase deploy --only firestore:rules

echo ""
echo "✅ Deployment complete!"
echo ""
echo "You can verify the rules in Firebase Console:"
echo "https://console.firebase.google.com/project/questlist-60033/firestore/rules"

