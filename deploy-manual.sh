#!/bin/bash

echo "🚀 Preparing Zealy Socials Scraper for manual deployment..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/
cp -r netlify deployment/

echo "✅ Deployment package created in 'deployment/' folder"
echo ""
echo "🎯 Manual Deployment Steps:"
echo "1. Go to https://netlify.com"
echo "2. Drag and drop the 'deployment' folder to deploy"
echo "3. Or use 'New site from Git' with your repository:"
echo "   https://github.com/TernoaSupport/ZealyScrapping"
echo ""
echo "📋 Build Settings:"
echo "- Build command: npm run build"
echo "- Publish directory: dist"
echo "- Functions directory: netlify/functions"
echo ""
echo "🔗 Your repository: https://github.com/TernoaSupport/ZealyScrapping" 