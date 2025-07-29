# Development Guide

## 🚀 Local Development

### Option 1: Full Stack Development (Recommended)

This runs both the frontend and Express API server locally:

```bash
npm run dev:full
```

This will start:
- Frontend: http://localhost:3000
- Express API: http://localhost:8888

### Option 2: Manual Setup

If you prefer to run servers separately:

1. **Start the API server**:
   ```bash
   npm run server
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   npm run dev
   ```

### Option 3: Frontend Only

If you only want to work on the UI:

```bash
npm run dev
```

**Note**: API calls will fail with this option since the Express API server isn't running.

### Option 4: Netlify Functions Only

If you only want to test the Netlify Functions (for production deployment):

```bash
npm run netlify:dev
```

## 🧪 Testing the Application

1. **Start the development server**:
   ```bash
   npm run dev:full
   ```

2. **Open your browser** to http://localhost:3000

3. **Test with sample data**:
   Copy and paste the contents of `sample-slugs.txt` into the textarea:
   ```
   https://zealy.io/cw/pofucoin
   https://zealy.io/cw/garth
   https://zealy.io/cw/aynigold
   ```

4. **Click "Collect"** to test the scraping functionality

5. **Check the results** in the table

6. **Test CSV download** by clicking "Download CSV"

## 🔧 Troubleshooting

### Common Issues

1. **404 Error on API calls**:
   - Make sure you're using `npm run dev:full` instead of `npm run dev`
   - Check that the Express API server is running on port 8888
   - Verify the API endpoint: `http://localhost:8888/api/health`

2. **Function timeout**:
   - The scraping function has a 10-second timeout per slug
   - Some Zealy pages might be slow to load

3. **CORS errors**:
   - The Express API server includes CORS headers
   - Make sure you're using the correct development setup

4. **Build errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors with `npm run build`

### Debugging

1. **Check browser console** for frontend errors
2. **Check terminal** for Netlify Function logs
3. **Test API directly**:
   ```bash
   curl -X POST http://localhost:8888/api/scrape \
     -H "Content-Type: application/json" \
     -d '{"slugs": ["pofucoin"]}'
   ```

## 📁 Project Structure

```
src/
├── App.tsx              # Main React component
├── main.tsx             # React entry point
├── types.ts             # TypeScript definitions
├── utils.ts             # Utility functions
└── index.css            # Styles

netlify/functions/
└── scrape.ts            # Serverless scraping function
```

## 🎯 Development Workflow

1. **Make changes** to the code
2. **Test locally** with `npm run dev:full`
3. **Build and test** with `npm run build`
4. **Deploy** when ready with `./deploy.sh`

## 📝 Notes

- The frontend runs on port 3000
- Express API server runs on port 8888
- API calls are proxied from 3000 to 8888 during development
- The scraping function uses Playwright AWS Lambda for headless browser automation
- For production deployment, use the Netlify Functions in `netlify/functions/` 