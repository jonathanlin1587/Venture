#!/bin/bash

# Vercel Deployment Script for Venture
# This script helps you deploy to Vercel

echo "🚀 Venture - Vercel Deployment Helper"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 You need to log in to Vercel"
    echo "Running: vercel login"
    vercel login
else
    echo "✅ Already logged in to Vercel"
    vercel whoami
fi

echo ""
echo "📤 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your Firebase environment variables in Vercel project settings"
echo "2. Add your Vercel domain to Firebase authorized domains"
echo "3. See VERCEL_DEPLOY.md for detailed instructions"
