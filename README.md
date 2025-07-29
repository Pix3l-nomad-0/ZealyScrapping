# Zealy Socials Scraper

A web application that collects social links (Website, Discord, Twitter, Telegram) from Zealy projects. Built with React, TypeScript, and deployed on Netlify with serverless functions.

## Features

- **Single Page UI**: Clean, modern interface with textarea for input
- **Flexible Input**: Accepts both Zealy URLs and slugs
- **Real-time Scraping**: Uses Playwright to scrape social links from Zealy project pages
- **CSV Export**: Download results as CSV file
- **Progress Tracking**: Visual progress bar during scraping
- **Error Handling**: Graceful error handling with retry logic
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Netlify Functions (serverless)
- **Scraping**: Playwright AWS Lambda
- **Deployment**: Netlify

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd zealy-socials-scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Test Netlify Functions locally**
   ```bash
   npm run netlify:dev
   ```

The app will be available at `http://localhost:3000` and the Netlify dev server at `http://localhost:8888`.

## Usage

1. **Input Data**: Paste Zealy slugs or URLs in the textarea (one per line)
   ```
   https://zealy.io/cw/pofucoin
   garth
   aynigold
   ```

2. **Collect Links**: Click the "Collect" button to start scraping

3. **View Results**: Results appear in a table with columns:
   - Slug
   - Website
   - Discord
   - Twitter
   - Telegram
   - Error (if any)

4. **Download**: Click "Download CSV" to export results

5. **Clear**: Click "Clear" to reset the form

## 🚀 Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/TernoaSupport/ZealyScrapping)

**One-click deploy to Netlify!** Just click the button above and follow the setup.

## Deployment

#### Option 1: Deploy via Netlify UI

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Click "Deploy site"

3. **Configure Functions**:
   - Go to Site settings > Functions
   - Ensure functions directory is set to `netlify/functions`

#### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Deploy to Render

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - Build Command: `npm run build`
   - Start Command: `npm run preview`
   - Environment: Node

## Project Structure

```
zealy-socials-scraper/
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   ├── types.ts             # TypeScript type definitions
│   ├── utils.ts             # Utility functions
│   └── index.css            # Styles
├── netlify/
│   └── functions/
│       └── scrape.ts        # Serverless function for scraping
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── netlify.toml             # Netlify configuration
└── README.md                # This file
```

## API Endpoints

### POST /api/scrape

Scrapes social links for given Zealy slugs.

**Request Body:**
```json
{
  "slugs": ["pofucoin", "garth", "aynigold"]
}
```

**Response:**
```json
{
  "rows": [
    {
      "slug": "pofucoin",
      "website": "https://pofucoin.com/",
      "discord": "",
      "twitter": "https://x.com/pofucoineth",
      "telegram": "",
      "error": ""
    }
  ]
}
```

## Limitations

- Maximum 50 slugs per request
- 10-second timeout per slug
- Requires JavaScript enabled in browser
- Depends on Zealy's page structure

## Troubleshooting

### Common Issues

1. **Function timeout**: Increase function timeout in Netlify settings
2. **Memory issues**: Reduce batch size or optimize scraping logic
3. **CORS errors**: Ensure proper CORS headers in function response
4. **Build failures**: Check Node.js version compatibility

### Environment Variables

No environment variables are required for basic functionality.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review Netlify function logs in the dashboard 