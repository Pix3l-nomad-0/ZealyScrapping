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

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🎉 Your app is now live on Netlify!"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 