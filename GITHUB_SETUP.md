# Setting Up GitHub for Your Project

Follow these steps to get your code on GitHub, then deploy to Vercel.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `venture` (or `questlist` or whatever you prefer)
4. **Don't** initialize with README, .gitignore, or license (we already have code)
5. Click "Create repository"

## Step 2: Connect Your Local Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/jonathanlin/Desktop/Projects/QuestList

# Add all your files
git add .

# Commit everything
git commit -m "Initial commit - Venture app"

# Add the GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/venture.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important:** Replace `YOUR_USERNAME` with your actual GitHub username!

## Step 3: Verify It Worked

1. Go to your GitHub repository page
2. You should see all your files there
3. Now you can proceed with Vercel deployment!

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create venture --public --source=. --remote=origin --push
```

## Troubleshooting

### "Repository not found" error
- Make sure you created the repository on GitHub first
- Check that the repository name matches
- Verify your GitHub username is correct

### "Authentication failed"
- You may need to use a Personal Access Token instead of password
- Or set up SSH keys for GitHub
- See: https://docs.github.com/en/authentication

### Files not showing up
- Make sure you ran `git add .` before committing
- Check `.gitignore` isn't excluding important files
