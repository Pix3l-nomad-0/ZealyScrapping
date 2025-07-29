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

# Initialize Netlify site if not already linked
if ! netlify status &> /dev/null || ! netlify status | grep -q "Site ID"; then
    echo "🔗 Initializing Netlify site..."
    netlify init --manual
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🎉 Your app is now live on Netlify!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure Functions in Netlify dashboard"
    echo "2. Set functions directory to: netlify/functions"
    echo "3. Test your app with sample data"
else
    echo "❌ Deployment failed. Please check the error messages above."
    echo ""
    echo "💡 Alternative deployment method:"
    echo "1. Go to https://netlify.com"
    echo "2. Click 'New site from Git'"
    echo "3. Connect your GitHub repository: https://github.com/TernoaSupport/ZealyScrapping"
    echo "4. Set build command: npm run build"
    echo "5. Set publish directory: dist"
    exit 1
fi 