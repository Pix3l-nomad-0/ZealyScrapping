const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Social media regex patterns (exactly like Python code)
const SOCIAL_MAP = {
  discord: /discord\.(gg|com)/i,
  twitter: /(x\.com|twitter\.com)/i,
  telegram: /(t\.me|telegram\.)/i,
};

// Extract slug from URL (exactly like Python code)
function slugFrom(line) {
  line = line.trim();
  if (!line) return "";
  if (line.startsWith("http")) {
    // expected forms: https://zealy.io/cw/<slug>/...
    const url = new URL(line);
    const parts = url.pathname.split("/").filter(p => p);
    return parts.length >= 2 && parts[0] === "cw" ? parts[1] : "";
  }
  return line; // assume it's already a slug
}

// Grab links function (exactly like Python code)
async function grabLinks(page, slug) {
  const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Wait for modal (dialog) to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    const modal = page.locator('[role="dialog"]');

    // Collect all external links inside the dialog
    const hrefs = await modal.locator('a[href^="http"]').evaluateAll(
      els => els.map(e => e.href)
    );
    
    // Filter out zealy.io links
    const externalLinks = hrefs.filter(h => !h.toLowerCase().includes('zealy.io'));

    // Deduplicate keeping first occurrences
    const seen = new Set();
    const links = [];
    for (const h of externalLinks) {
      if (!seen.has(h)) {
        links.push(h);
        seen.add(h);
      }
    }

    // Classify links
    const result = {
      slug,
      website: '',
      discord: '',
      twitter: '',
      telegram: ''
    };

    for (const link of links) {
      const lower = link.toLowerCase();
      let matched = false;
      
      for (const [key, regex] of Object.entries(SOCIAL_MAP)) {
        if (regex.test(lower)) {
          if (!result[key]) {
            result[key] = link;
          }
          matched = true;
          break;
        }
      }
      
      if (!matched && !result.website) {
        // treat as website if it isn't a known social
        result.website = link;
      }
    }

    return result;
  } catch (error) {
    return {
      slug,
      website: '',
      discord: '',
      twitter: '',
      telegram: '',
      error: error.message
    };
  }
}

// Main scraping endpoint
app.post('/scrape', async (req, res) => {
  try {
    const { slugs } = req.body;

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return res.status(400).json({ error: 'Invalid request: slugs array is required' });
    }

    // Limit the number of slugs to prevent abuse
    if (slugs.length > 50) {
      return res.status(400).json({ error: 'Too many slugs. Maximum 50 allowed.' });
    }

    const rows = [];
    
    // Launch browser
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Process each slug
      for (const slug of slugs) {
        const row = await grabLinks(page, slug);
        rows.push(row);
        
        // Add a small delay between requests
        if (slugs.indexOf(slug) < slugs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      await browser.close();
    }

    res.json({ rows });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Browser service running on port ${PORT}`);
}); 