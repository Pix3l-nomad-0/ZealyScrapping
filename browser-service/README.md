# Zealy Browser Service

A browser service that replicates the Python Playwright scraping logic for extracting social links from Zealy projects.

## Features

- **Exact Python Logic**: Replicates the Python code exactly
- **Playwright Integration**: Uses headless Chrome to execute JavaScript
- **Modal Dialog Detection**: Waits for and extracts links from the modal dialog
- **Social Media Classification**: Categorizes Discord, Twitter, Telegram, and website links
- **Rate Limiting**: Respectful delays between requests

## Deployment on Railway

### 1. Create Railway Project

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Connect your GitHub repository or deploy from this directory

### 2. Deploy

Railway will automatically detect the Node.js project and install dependencies.

### 3. Environment Variables

No environment variables needed - the service uses default settings.

## API Usage

### Scrape Social Links

**Endpoint:** `POST /scrape`

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

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Local Development

```bash
npm install
npm start
```

The service will be available at `http://localhost:3000`

## Integration with Netlify

Once deployed on Railway, update the Netlify function to call this service instead of trying to scrape directly. # Trigger Railway redeploy
