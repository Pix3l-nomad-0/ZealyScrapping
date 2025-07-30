const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Social media regex patterns
const SOCIAL_MAP = {
  discord: /discord\.(gg|com)/i,
  twitter: /(x\.com|twitter\.com)/i,
  telegram: /(t\.me|telegram\.)/i,
};

// Extract slug from URL
function slugFrom(line) {
  line = line.trim();
  if (!line) return "";
  if (line.startsWith("http")) {
    const url = new URL(line);
    const parts = url.pathname.split("/").filter(p => p);
    return parts.length >= 2 && parts[0] === "cw" ? parts[1] : "";
  }
  return line;
}

// Railway-optimized slug processing with timeout protection
async function processSlugRailway(slug) {
  console.log(`\n=== Processing ${slug} (Railway Optimized) ===`);
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // Launch browser with Railway-optimized settings
    console.log(`Launching browser for ${slug}...`);
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to the page
    const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Wait for dialog with Railway-optimized strategy
    let links = [];
    let dialogFound = false;
    
    // Strategy 1: Quick check for dialog
    try {
      console.log('Strategy 1: Quick dialog check (10s timeout)...');
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      dialogFound = true;
      console.log('✅ Dialog found with Strategy 1');
    } catch (error) {
      console.log(`❌ Strategy 1 failed: ${error.message}`);
    }
    
    // Strategy 2: Wait and retry (Railway-optimized timing)
    if (!dialogFound) {
      try {
        console.log('Strategy 2: Waiting 3s then retry (10s timeout)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
        dialogFound = true;
        console.log('✅ Dialog found with Strategy 2');
      } catch (error) {
        console.log(`❌ Strategy 2 failed: ${error.message}`);
      }
    }
    
    // Extract links if dialog found (Railway-optimized)
    if (dialogFound) {
      try {
        console.log('Extracting links from dialog...');
        const modal = page.locator('[role="dialog"]');
        
        // Use evaluateAll with timeout protection
        try {
          const hrefs = await Promise.race([
            modal.locator('a[href^="http"]').evaluateAll(
              els => els.map(e => e.href)
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('evaluateAll timeout')), 15000)
            )
          ]);
          
          links = hrefs.filter(h => !h.toLowerCase().includes('zealy.io'));
          console.log(`✅ Extracted ${links.length} links using evaluateAll`);
        } catch (evaluateError) {
          console.log(`❌ evaluateAll failed: ${evaluateError.message}`);
          
          // Railway-optimized fallback: use evaluate instead of .all()
          try {
            console.log('Using Railway-optimized fallback method...');
            const hrefs = await page.evaluate(() => {
              const dialog = document.querySelector('[role="dialog"]');
              if (!dialog) return [];
              
              const links = dialog.querySelectorAll('a[href^="http"]');
              return Array.from(links).map(link => link.href);
            });
            
            links = hrefs.filter(h => !h.toLowerCase().includes('zealy.io'));
            console.log(`✅ Extracted ${links.length} links using Railway fallback`);
          } catch (fallbackError) {
            console.log(`❌ Railway fallback failed: ${fallbackError.message}`);
          }
        }
      } catch (dialogError) {
        console.log(`❌ Error extracting from dialog: ${dialogError.message}`);
      }
    }
    
    // Strategy 3: Railway-optimized social link search
    if (links.length === 0) {
      try {
        console.log('Strategy 3: Looking for social links (Railway optimized)...');
        
        // Use evaluate instead of locator.all() for better Railway compatibility
        const socialLinks = await page.evaluate(() => {
          const links = document.querySelectorAll('a[href*="twitter"], a[href*="discord"], a[href*="telegram"], a[href*="t.me"], a[href*="x.com"]');
          return Array.from(links).map(link => link.href);
        });
        
        links = socialLinks.filter(h => !h.toLowerCase().includes('zealy.io'));
        console.log(`✅ Found ${links.length} social links using Railway method`);
      } catch (evaluateError) {
        console.log(`❌ Railway social link search failed: ${evaluateError.message}`);
      }
    }
    
    // Deduplicate links
    const uniqueLinks = [...new Set(links)];
    console.log(`Final unique links: ${uniqueLinks.length}`);
    
    // Classify links
    const result = {
      slug,
      website: '',
      discord: '',
      twitter: '',
      telegram: ''
    };

    for (const link of uniqueLinks) {
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
        result.website = link;
      }
    }

    console.log(`✅ Successfully processed ${slug}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error processing ${slug}:`, error.message);
    return {
      slug,
      website: '',
      discord: '',
      twitter: '',
      telegram: '',
      error: error.message
    };
  } finally {
    // Railway-optimized cleanup
    console.log(`Cleaning up resources for ${slug}...`);
    
    const cleanupPromises = [];
    
    if (page) {
      cleanupPromises.push(
        page.close().catch(e => console.log(`❌ Error closing page: ${e.message}`))
      );
    }
    
    if (context) {
      cleanupPromises.push(
        context.close().catch(e => console.log(`❌ Error closing context: ${e.message}`))
      );
    }
    
    if (browser) {
      cleanupPromises.push(
        browser.close().catch(e => console.log(`❌ Error closing browser: ${e.message}`))
      );
    }
    
    // Wait for all cleanup operations with timeout
    try {
      await Promise.race([
        Promise.all(cleanupPromises),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 5000))
      ]);
      console.log(`✅ Cleanup completed for ${slug}`);
    } catch (cleanupError) {
      console.log(`⚠️ Cleanup timeout for ${slug}: ${cleanupError.message}`);
    }
    
    console.log(`=== Completed processing ${slug} ===\n`);
  }
}

// Main scraping endpoint with Railway optimizations
app.post('/scrape', async (req, res) => {
  console.log('Received scrape request:', req.body);
  
  try {
    const { slugs } = req.body;

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      console.log('Invalid request: no slugs provided');
      return res.status(400).json({ error: 'Invalid request: slugs array is required' });
    }

    if (slugs.length > 50) {
      console.log('Too many slugs requested:', slugs.length);
      return res.status(400).json({ error: 'Too many slugs. Maximum 50 allowed.' });
    }

    console.log(`Starting to process ${slugs.length} slugs`);
    const rows = [];
    
    // Process each slug with Railway optimizations
    for (const slug of slugs) {
      try {
        const row = await processSlugRailway(slug);
        rows.push(row);
        
        // Shorter delay for Railway
        if (slugs.indexOf(slug) < slugs.length - 1) {
          console.log('Waiting 500ms before next request...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to process ${slug}:`, error.message);
        rows.push({
          slug,
          website: '',
          discord: '',
          twitter: '',
          telegram: '',
          error: error.message
        });
      }
    }

    console.log(`Completed processing ${rows.length} slugs`);
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
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Zealy Browser Service is running (Railway Optimized)',
    endpoints: {
      health: '/health',
      scrape: '/scrape (POST)'
    },
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling for Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Railway-optimized browser service running on port ${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   GET  / - Service info`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /scrape - Scrape social links`);
}); 