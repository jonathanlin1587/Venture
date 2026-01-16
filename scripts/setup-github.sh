#!/bin/bash

# GitHub Setup Script for Venture
# Usage: ./setup-github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo "Usage: ./setup-github.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="venture"

echo "🚀 Setting up GitHub for Venture..."
echo "📝 GitHub Username: $GITHUB_USERNAME"
echo "📦 Repository: $REPO_NAME"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists!"
    echo "Current remote URL: $(git remote get-url origin)"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        echo "✅ Updated remote URL"
    else
        echo "❌ Aborted. Please remove the existing remote first with: git remote remove origin"
        exit 1
    fi
else
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "✅ Added remote 'origin'"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ask if user wants to rename to 'main'
if [ "$CURRENT_BRANCH" != "main" ]; then
    read -p "Do you want to rename branch to 'main'? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -M main
        echo "✅ Renamed branch to 'main'"
        CURRENT_BRANCH="main"
    fi
fi

echo ""
echo "📤 Ready to push to GitHub!"
echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
read -p "Push to GitHub now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Pushing to GitHub..."
    git push -u origin $CURRENT_BRANCH
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Success! Your code is now on GitHub!"
        echo "🌐 View it at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    else
        echo ""
        echo "❌ Push failed. Common issues:"
        echo "   - Repository doesn't exist on GitHub (create it first)"
        echo "   - Authentication failed (use Personal Access Token or SSH)"
        echo "   - See GITHUB_SETUP.md for troubleshooting"
    fi
else
    echo "⏭️  Skipped push. Run this when ready:"
    echo "   git push -u origin $CURRENT_BRANCH"
fi
