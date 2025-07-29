#!/bin/bash

# Zealy Socials Scraper - Simple Deployment Script
# This script builds the project and provides deployment instructions

echo "🚀 Zealy Socials Scraper - Simple Deployment"
echo "=============================================="

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Build folder 'dist' not found. Build may have failed."
    exit 1
fi

echo "🎯 Deployment Options:"
echo "======================"
echo ""
echo "Option 1: Manual Netlify Deploy (Easiest)"
echo "------------------------------------------"
echo "1. Go to https://netlify.com"
echo "2. Drag and drop the 'dist' folder to deploy"
echo "3. Your site will be live immediately!"
echo "4. Upload 'netlify/functions' folder separately for API"
echo ""
echo "Option 2: GitHub + Netlify (Recommended)"
echo "----------------------------------------"
echo "1. Push to GitHub: ./push-to-github.sh"
echo "2. Go to https://netlify.com"
echo "3. Click 'New site from Git'"
echo "4. Choose your repository"
echo "5. Set build command: npm run build"
echo "6. Set publish directory: dist"
echo ""
echo "Option 3: Render Deployment"
echo "---------------------------"
echo "1. Push to GitHub: ./push-to-github.sh"
echo "2. Go to https://render.com"
echo "3. Create new Web Service"
echo "4. Connect your GitHub repository"
echo "5. Set build command: npm run build"
echo "6. Set start command: npm run preview"
echo ""
echo "📁 Build files ready in: dist/"
echo "📁 Functions ready in: netlify/functions/"
echo ""
echo "🎉 Choose your preferred deployment method above!" 