#!/bin/bash

echo "🚀 Pushing Zealy Socials Scraper to GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Run 'git init' first."
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "📝 Please set your GitHub repository URL:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/zealy-socials-scraper.git"
    echo ""
    echo "Replace YOUR_USERNAME with your actual GitHub username"
    exit 1
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Update: Zealy Socials Scraper web app"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to https://netlify.com"
echo "2. Click 'New site from Git'"
echo "3. Choose your repository"
echo "4. Set build command: npm run build"
echo "5. Set publish directory: dist"
echo "6. Deploy!"
echo ""
echo "📖 For detailed instructions, see QUICK_DEPLOY.md" 