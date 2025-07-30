const { chromium } = require('playwright');

async function debugSlug(slug, headless = true) {
  console.log(`🔍 Debugging slug: ${slug} (headless: ${headless})`);
  
  const browser = await chromium.launch({ 
    headless: headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
    console.log(`📄 Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log('✅ Page loaded');
    
    // Wait a bit to see if dialog appears
    console.log('⏳ Waiting for dialog...');
    
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
      console.log('✅ Dialog found!');
      
      // Take a screenshot
      await page.screenshot({ path: `debug-screenshot-${headless ? 'headless' : 'headed'}.png` });
      console.log(`📸 Screenshot saved as debug-screenshot-${headless ? 'headless' : 'headed'}.png`);
      
      const modal = page.locator('[role="dialog"]');
      const hrefs = await modal.locator('a[href^="http"]').evaluateAll(
        els => els.map(e => e.href)
      );
      
      console.log('🔗 Found links:', hrefs);
      
    } catch (dialogError) {
      console.log('❌ Dialog not found, checking page content...');
      
      // Take a screenshot anyway
      await page.screenshot({ path: `debug-screenshot-${headless ? 'headless' : 'headed'}.png` });
      console.log(`📸 Screenshot saved as debug-screenshot-${headless ? 'headless' : 'headed'}.png`);
      
      // Check what's actually on the page
      const pageContent = await page.content();
      console.log('📄 Page title:', await page.title());
      
      // Look for any elements that might contain links
      const allLinks = await page.locator('a[href^="http"]').evaluateAll(
        els => els.map(e => ({ href: e.href, text: e.textContent?.trim() }))
      );
      
      console.log('🔗 All external links on page:', allLinks);
      
      // Check if there are any elements with role="dialog"
      const dialogs = await page.locator('[role="dialog"]').count();
      console.log(`🎭 Elements with role="dialog": ${dialogs}`);
      
      // Check for other potential selectors
      const modals = await page.locator('.modal, [class*="modal"], [class*="dialog"]').count();
      console.log(`🎭 Modal-like elements: ${modals}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Test both headless and headed modes
async function runTests() {
  console.log('=== TESTING HEADED MODE ===');
  await debugSlug('bestwallet', false);
  
  console.log('\n=== TESTING HEADLESS MODE ===');
  await debugSlug('bestwallet', true);
}

runTests().catch(console.error); 