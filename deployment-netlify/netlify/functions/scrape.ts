import type { Handler } from '@netlify/functions';

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

    console.log(`Netlify function: Processing ${slugs.length} slugs`);
    console.log(`Netlify function: Calling Railway service at https://zealyscrapping-production.up.railway.app/scrape`);

    // Call the Railway browser service using the correct production URL
    const railwayResponse = await fetch('https://zealyscrapping-production.up.railway.app/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slugs }),
    });

    console.log(`Netlify function: Railway response status: ${railwayResponse.status}`);

    if (!railwayResponse.ok) {
      const errorText = await railwayResponse.text();
      console.error(`Netlify function: Railway service error: ${railwayResponse.status} - ${errorText}`);
      
      // Return a more helpful error message
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          error: 'Railway service is not responding properly',
          details: `Status: ${railwayResponse.status}, Response: ${errorText}`,
          suggestion: 'Please check if the Railway service is deployed and running'
        }),
      };
    }

    const railwayData = await railwayResponse.json();
    console.log(`Netlify function: Successfully processed ${railwayData.rows?.length || 0} results`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(railwayData),
    };
  } catch (error) {
    console.error('Netlify function: Scraping error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please try again or contact support if the issue persists'
      }),
    };
  }
}; 