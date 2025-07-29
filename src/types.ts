export interface SocialRow {
  slug: string;
  website: string;
  discord: string;
  twitter: string;
  telegram: string;
  error?: string;
}

export interface ScrapeRequest {
  slugs: string[];
}

export interface ScrapeResponse {
  rows: SocialRow[];
}

export type ScrapeStatus = 'idle' | 'scraping' | 'completed' | 'error'; 