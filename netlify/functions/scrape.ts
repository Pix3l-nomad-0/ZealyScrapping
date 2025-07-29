import type { Handler } from '@netlify/functions';

const SOCIAL_MAP = {
  discord: /discord\.(gg|com)/i,
  twitter: /(x\.com|twitter\.com)/i,
  telegram: /(t\.me|telegram\.)/i,
};

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

async function grabLinks(slug: string): Promise<SocialRow> {
  const url = `https://zealy.io/cw/${slug}/leaderboard?show-info=true`;
  
  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract links using regex patterns
    const linkPatterns = [
      /href=["'](https?:\/\/[^"']+)["']/gi,
      /href=["'](https?:\/\/[^"']+)["']/gi,
    ];

    const links: string[] = [];
    
    // Find all external links
    for (const pattern of linkPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const link = match[1];
        if (link && !link.toLowerCase().includes('zealy.io') && !links.includes(link)) {
          links.push(link);
        }
      }
    }

    // Also look for social media patterns in the text
    const socialPatterns = [
      /(https?:\/\/discord\.(?:gg|com)\/[^\s"']+)/gi,
      /(https?:\/\/(?:x\.com|twitter\.com)\/[^\s"']+)/gi,
      /(https?:\/\/t\.me\/[^\s"']+)/gi,
      /(https?:\/\/telegram\.me\/[^\s"']+)/gi,
    ];

    for (const pattern of socialPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const link = match[1];
        if (link && !links.includes(link)) {
          links.push(link);
        }
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
    console.error(`Error scraping ${slug}:`, error);
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
    
    // Process each slug with a small delay to be respectful
    for (const slug of slugs) {
      const row = await grabLinks(slug);
      rows.push(row);
      
      // Add a small delay between requests
      if (slugs.indexOf(slug) < slugs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
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