#!/bin/bash

# Manual Netlify Deployment Script
# This script builds the project and prepares it for manual upload to Netlify

echo "🚀 Preparing Zealy Socials Scraper for manual Netlify deployment..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment directory
echo "📁 Creating deployment directory..."
rm -rf deployment-netlify
mkdir -p deployment-netlify

# Copy built files
echo "📋 Copying built files..."
cp -r dist/* deployment-netlify/
cp -r netlify deployment-netlify/

# Create netlify.toml in deployment directory
echo "⚙️ Creating Netlify configuration..."
cat > deployment-netlify/netlify.toml << EOF
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

echo "✅ Deployment files prepared!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://netlify.com"
echo "2. Click 'New site from Git' or 'Deploy manually'"
echo "3. If using manual deploy:"
echo "   - Drag the 'deployment-netlify' folder to Netlify"
echo "4. If using Git deploy:"
echo "   - Connect your GitHub repository"
echo "   - Set build command: npm run build"
echo "   - Set publish directory: dist"
echo "   - Set functions directory: netlify/functions"
echo ""
echo "🎉 Your Railway service is already working at:"
echo "   https://zealyscrapping-production.up.railway.app"
echo ""
echo "📁 Deployment files are in: deployment-netlify/" 