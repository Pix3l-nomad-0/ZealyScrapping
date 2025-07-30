const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

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

// Grab links function (improved version)
async function grabLinks(page, slug) {
  const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
  
  try {
    console.log(`Processing slug: ${slug}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for the page to fully load
    await page.waitForTimeout(2000);
    
    // Try multiple strategies to find the dialog/modal
    let modal = null;
    let dialogFound = false;
    
    // Strategy 1: Wait for role="dialog" (original approach)
    try {
      console.log(`Strategy 1: Waiting for [role="dialog"]`);
      await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
      modal = page.locator('[role="dialog"]');
      dialogFound = true;
      console.log(`✅ Dialog found with strategy 1`);
    } catch (error) {
      console.log(`❌ Strategy 1 failed: ${error.message}`);
    }
    
    // Strategy 2: Look for any dialog-like elements
    if (!dialogFound) {
      try {
        console.log(`Strategy 2: Looking for dialog-like elements`);
        const dialogSelectors = [
          '[role="dialog"]',
          '.modal',
          '[class*="modal"]',
          '[class*="dialog"]',
          '[data-testid*="modal"]',
          '[data-testid*="dialog"]'
        ];
        
        for (const selector of dialogSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`Found ${count} elements with selector: ${selector}`);
            modal = page.locator(selector).first();
            dialogFound = true;
            console.log(`✅ Dialog found with strategy 2 (${selector})`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Strategy 2 failed: ${error.message}`);
      }
    }
    
    // Strategy 3: Look for links directly on the page
    if (!dialogFound) {
      try {
        console.log(`Strategy 3: Looking for links directly on page`);
        const allLinks = await page.locator('a[href^="http"]').evaluateAll(
          els => els.map(e => e.href)
        );
        
        if (allLinks.length > 0) {
          console.log(`Found ${allLinks.length} external links on page`);
          // Filter out zealy.io links
          const externalLinks = allLinks.filter(h => !h.toLowerCase().includes('zealy.io'));
          
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

          console.log(`Found ${links.length} links for ${slug} (strategy 3)`);
          return result;
        }
      } catch (error) {
        console.log(`❌ Strategy 3 failed: ${error.message}`);
      }
    }
    
    // If we found a modal, extract links from it
    if (dialogFound && modal) {
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

      console.log(`Found ${links.length} links for ${slug}`);
      return result;
    }
    
    // If no dialog found and no links extracted, return empty result
    console.log(`No dialog or links found for ${slug}`);
    return {
      slug,
      website: '',
      discord: '',
      twitter: '',
      telegram: '',
      error: 'No dialog or external links found on page'
    };
    
  } catch (error) {
    console.error(`Error processing ${slug}:`, error.message);
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

async function testImprovedScraping() {
  console.log('🧪 Testing improved scraping logic...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Test the problematic slug
    const result = await grabLinks(page, 'bestwallet');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.log('❌ Test failed with error:', result.error);
    } else {
      console.log('✅ Test successful!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

testImprovedScraping().catch(console.error); 