# 🚀 Quick Deployment Guide

Your Zealy Socials Scraper is ready to deploy! Here are the easiest ways to get it online:

## Option 1: Deploy to Netlify (Recommended)

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `zealy-socials-scraper`
3. **Don't** initialize with README (we already have one)

### Step 2: Push to GitHub
```bash
git remote add origin https://github.com/Pix3l-nomad-0/ZealyScrapping.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository: **`Pix3l-nomad-0/ZealyScrapping`**
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

### Step 4: Configure Functions
1. Go to Site settings > Functions
2. Ensure functions directory is set to `netlify/functions`
3. Your app will be live at `https://your-site-name.netlify.app`

## Option 2: Deploy to Render

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `zealy-socials-scraper`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
   - **Environment**: Node
5. Click "Create Web Service"

## Option 3: Deploy to Vercel

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

## Option 4: Manual Netlify Deploy

If you prefer to deploy without Git:

1. Run the build command:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `dist` folder to deploy
4. Upload the `netlify/functions` folder separately

## 🎯 What You Get

After deployment, you'll have:
- ✅ **Live web app** accessible from anywhere
- ✅ **Serverless functions** for scraping
- ✅ **Automatic HTTPS** and CDN
- ✅ **Custom domain** support (optional)

## 🔧 Post-Deployment

1. **Test your app** with the sample data
2. **Share the URL** with others
3. **Monitor usage** in your hosting dashboard
4. **Set up custom domain** if needed

## 🐛 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (18+ required)
2. **Functions not working**: Verify functions directory in Netlify settings
3. **CORS errors**: Functions include proper CORS headers
4. **Timeout issues**: Increase function timeout in hosting settings

### Need Help?
- Check the [README.md](README.md) for detailed documentation
- Review hosting platform logs for errors
- Test locally first with `npm run dev:full`

## 🎉 Success!

Once deployed, your app will be available at:
- **Netlify**: `https://your-site-name.netlify.app`
- **Render**: `https://your-app-name.onrender.com`
- **Vercel**: `https://your-project.vercel.app`

**Your Zealy Socials Scraper is now live and ready to use!** 🚀 