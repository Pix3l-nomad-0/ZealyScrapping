# Quick Deployment Guide

## 🚀 Deploy to Netlify (Recommended)

### Option 1: One-Click Deploy
1. Click the "Deploy to Netlify" button below
2. Connect your GitHub account
3. The app will be automatically deployed

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/zealy-socials-scraper)

### Option 2: Manual Deploy
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/zealy-socials-scraper.git
   git push -u origin main
   ```

2. **Deploy via Netlify UI**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

3. **Configure Functions**:
   - Go to Site settings > Functions
   - Ensure functions directory is set to `netlify/functions`

### Option 3: Using the Deploy Script
```bash
./deploy.sh
```

## 🌐 Deploy to Render

1. **Create a new Web Service** on [render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Configure the service**:
   - Build Command: `npm run build`
   - Start Command: `npm run preview`
   - Environment: Node

## 📋 Pre-deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Build passes (`npm run build`)
- [ ] Development server works (`npm run dev`)
- [ ] Netlify Functions work locally (`npm run netlify:dev`)
- [ ] Code pushed to GitHub repository

## 🔧 Environment Variables

No environment variables are required for basic functionality.

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (18+ required)
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors

2. **Function Timeout**:
   - Increase function timeout in Netlify settings
   - Reduce batch size in the scraping function

3. **CORS Errors**:
   - Ensure proper CORS headers in function response
   - Check function URL configuration

4. **Memory Issues**:
   - Reduce the number of slugs processed at once
   - Optimize the scraping logic

### Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review Netlify function logs in the dashboard
- Create an issue on GitHub for bugs or feature requests

## 🎉 Success!

Once deployed, your app will be available at:
- Netlify: `https://your-app-name.netlify.app`
- Render: `https://your-app-name.onrender.com`

The app includes:
- ✅ Modern React UI with TypeScript
- ✅ Serverless scraping with Playwright
- ✅ CSV export functionality
- ✅ Responsive design
- ✅ Error handling and progress tracking 