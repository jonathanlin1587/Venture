#!/bin/bash

# Script to deploy Firestore security rules
# Make sure you're logged in to Firebase first: firebase login

echo "Setting Firebase project to questlist-60033..."
firebase use questlist-60033

echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo "Done! Your Firestore rules have been deployed."

