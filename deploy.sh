#!/bin/bash

# Zealy Socials Scraper - Deployment Script
# This script helps deploy the application to Netlify

echo "🚀 Deploying Zealy Socials Scraper to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Installing..."
    npm install -g netlify-cli
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please log in to Netlify..."
    netlify login
fi

# Check if site is already linked
if [ ! -f ".netlify/state.json" ]; then
    echo "🔗 Linking to Netlify site..."
    echo "📝 Please create a new site or link to existing site:"
    echo "   1. For new site: Choose 'Create & configure a new project'"
    echo "   2. For existing site: Choose 'Use current git remote origin'"
    echo ""
    netlify link
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🎉 Your app is now live on Netlify!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Configure Functions in Netlify dashboard"
    echo "   2. Set functions directory to: netlify/functions"
    echo "   3. Test your app with sample data"
else
    echo "❌ Deployment failed. Please check the error messages above."
    echo ""
    echo "🔧 Alternative deployment methods:"
    echo "   1. Manual deploy: Drag 'dist' folder to netlify.com"
    echo "   2. Git deploy: Push to GitHub and connect to Netlify"
    echo "   3. See QUICK_DEPLOY.md for detailed instructions"
    exit 1
fi 