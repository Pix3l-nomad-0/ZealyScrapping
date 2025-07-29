#!/bin/bash

# Railway Deployment Script for Browser Service
# This script helps deploy the browser-service to Railway

echo "🚂 Deploying Browser Service to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Navigate to browser-service directory
cd browser-service

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Railway deployment completed successfully!"
    echo "🎉 Your browser service is now live on Railway!"
    echo ""
    echo "📋 Service URL: https://zealyscrapping.railway.app"
    echo "📋 Health check: https://zealyscrapping.railway.app/health"
    echo "📋 Scrape endpoint: https://zealyscrapping.railway.app/scrape"
else
    echo "❌ Railway deployment failed. Please check the error messages above."
    echo ""
    echo "💡 Alternative deployment method:"
    echo "1. Go to https://railway.app"
    echo "2. Create a new project"
    echo "3. Connect your GitHub repository"
    echo "4. Set the root directory to: browser-service"
    echo "5. Deploy the project"
    exit 1
fi 