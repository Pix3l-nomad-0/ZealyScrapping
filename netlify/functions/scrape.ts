import type { Handler } from '@netlify/functions';
import playwright from 'playwright-aws-lambda';

interface SocialRow {
  slug: string;
  website: string;
  discord: string;
  twitter: string;
  telegram: string;
  error?: string;
}

interface ScrapeRequest {
  slugs: string[];
}

interface ScrapeResponse {
  rows: SocialRow[];
}

const SOCIAL_MAP = {
  discord: /discord\.(gg|com)/i,
  twitter: /(x\.com|twitter\.com)/i,
  telegram: /(t\.me|telegram\.)/i,
};

async function grabLinks(page: any, slug: string): Promise<SocialRow> {
  const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Wait for modal (dialog) to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    const modal = page.locator('[role="dialog"]');

    // Collect all external links inside the dialog
    const hrefs = await modal.locator('a[href^="http"]').evaluateAll(
      (els: any[]) => els.map((e: any) => e.href)
    );
    
    // Filter out zealy.io links
    const externalLinks = hrefs.filter((h: string) => !h.toLowerCase().includes('zealy.io'));

    // Deduplicate keeping first occurrences
    const seen = new Set();
    const links: string[] = [];
    for (const h of externalLinks) {
      if (!seen.has(h)) {
        links.push(h);
        seen.add(h);
      }
    }

    // Classify links
    const result: SocialRow = {
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
          if (!result[key as keyof SocialRow]) {
            result[key as keyof SocialRow] = link;
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
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body: ScrapeRequest = JSON.parse(event.body || '{}');
    const { slugs } = body;

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request: slugs array is required' }),
      };
    }

    // Limit the number of slugs to prevent abuse
    if (slugs.length > 50) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Too many slugs. Maximum 50 allowed.' }),
      };
    }

    const rows: SocialRow[] = [];
    
    // Launch browser
    const browser = await playwright.launchChromium();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Process each slug
      for (const slug of slugs) {
        const row = await grabLinks(page, slug);
        rows.push(row);
      }
    } finally {
      await browser.close();
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ rows } as ScrapeResponse),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}; 