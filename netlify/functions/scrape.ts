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
    
    // For now, return mock data to test if the function is working
    for (const slug of slugs) {
      rows.push({
        slug,
        website: `https://example.com/${slug}`,
        discord: `https://discord.gg/${slug}`,
        twitter: `https://twitter.com/${slug}`,
        telegram: `https://t.me/${slug}`,
        error: 'Mock data - playwright integration pending'
      });
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