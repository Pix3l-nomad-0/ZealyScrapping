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

// Process a single slug with proper error handling
async function processSlug(slug) {
  console.log(`\n=== Processing ${slug} ===`);
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // Launch browser
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
        '--single-process'
      ]
    });
    
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to the page
    const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Wait for dialog with multiple strategies
    let links = [];
    let dialogFound = false;
    
    // Strategy 1: Wait for dialog with long timeout
    try {
      console.log('Strategy 1: Waiting for dialog (20s timeout)...');
      await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
      dialogFound = true;
      console.log('✅ Dialog found with Strategy 1');
    } catch (error) {
      console.log(`❌ Strategy 1 failed: ${error.message}`);
    }
    
    // Strategy 2: Wait longer and try again
    if (!dialogFound) {
      try {
        console.log('Strategy 2: Waiting 5s then trying again (15s timeout)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
        dialogFound = true;
        console.log('✅ Dialog found with Strategy 2');
      } catch (error) {
        console.log(`❌ Strategy 2 failed: ${error.message}`);
      }
    }
    
    // Extract links if dialog found
    if (dialogFound) {
      try {
        console.log('Extracting links from dialog...');
        const modal = page.locator('[role="dialog"]');
        
        // Try evaluateAll first
        try {
          const hrefs = await modal.locator('a[href^="http"]').evaluateAll(
            els => els.map(e => e.href)
          );
          links = hrefs.filter(h => !h.toLowerCase().includes('zealy.io'));
          console.log(`✅ Extracted ${links.length} links using evaluateAll`);
        } catch (evaluateError) {
          console.log(`❌ evaluateAll failed: ${evaluateError.message}`);
          
          // Fallback: get links one by one
          try {
            const linkElements = await modal.locator('a[href^="http"]').all();
            console.log(`Found ${linkElements.length} link elements`);
            
            for (const link of linkElements) {
              try {
                const href = await link.getAttribute('href');
                if (href && !href.toLowerCase().includes('zealy.io')) {
                  links.push(href);
                }
              } catch (linkError) {
                console.log(`Error getting href: ${linkError.message}`);
              }
            }
            console.log(`✅ Extracted ${links.length} links using fallback method`);
          } catch (allError) {
            console.log(`❌ Fallback method failed: ${allError.message}`);
          }
        }
      } catch (dialogError) {
        console.log(`❌ Error extracting from dialog: ${dialogError.message}`);
      }
    }
    
    // Strategy 3: Look for social links anywhere on page
    if (links.length === 0) {
      try {
        console.log('Strategy 3: Looking for social links anywhere on page...');
        const socialLinks = await page.locator('a[href*="twitter"], a[href*="discord"], a[href*="telegram"], a[href*="t.me"], a[href*="x.com"]').evaluateAll(
          els => els.map(e => e.href)
        );
        links = socialLinks.filter(h => !h.toLowerCase().includes('zealy.io'));
        console.log(`✅ Found ${links.length} social links on page`);
      } catch (evaluateError) {
        console.log(`❌ evaluateAll for social links failed: ${evaluateError.message}`);
        
        // Fallback for social links
        try {
          const socialElements = await page.locator('a[href*="twitter"], a[href*="discord"], a[href*="telegram"], a[href*="t.me"], a[href*="x.com"]').all();
          for (const link of socialElements) {
            try {
              const href = await link.getAttribute('href');
              if (href && !href.toLowerCase().includes('zealy.io')) {
                links.push(href);
              }
            } catch (linkError) {
              console.log(`Error getting social link href: ${linkError.message}`);
            }
          }
          console.log(`✅ Found ${links.length} social links using fallback`);
        } catch (allError) {
          console.log(`❌ Social links fallback failed: ${allError.message}`);
        }
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
    // Cleanup resources
    console.log(`Cleaning up resources for ${slug}...`);
    
    if (page) {
      try {
        await page.close();
        console.log(`✅ Page closed for ${slug}`);
      } catch (e) {
        console.log(`❌ Error closing page for ${slug}:`, e.message);
      }
    }
    
    if (context) {
      try {
        await context.close();
        console.log(`✅ Context closed for ${slug}`);
      } catch (e) {
        console.log(`❌ Error closing context for ${slug}:`, e.message);
      }
    }
    
    if (browser) {
      try {
        await browser.close();
        console.log(`✅ Browser closed for ${slug}`);
      } catch (e) {
        console.log(`❌ Error closing browser for ${slug}:`, e.message);
      }
    }
    
    console.log(`=== Completed processing ${slug} ===\n`);
  }
}

// Main scraping endpoint
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
    
    // Process each slug sequentially with proper error handling
    for (const slug of slugs) {
      try {
        const row = await processSlug(slug);
        rows.push(row);
        
        // Add delay between requests
        if (slugs.indexOf(slug) < slugs.length - 1) {
          console.log('Waiting 1 second before next request...');
          await new Promise(resolve => setTimeout(resolve, 1000));
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
    message: 'Zealy Browser Service is running',
    endpoints: {
      health: '/health',
      scrape: '/scrape (POST)'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Browser service running on port ${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   GET  / - Service info`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /scrape - Scrape social links`);
}); 