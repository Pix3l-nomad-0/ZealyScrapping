import { SocialRow } from './types';

export function normalizeSlug(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';
  
  if (trimmed.startsWith('http')) {
    // Extract slug from URL like https://zealy.io/cw/<slug>/...
    try {
      const url = new URL(trimmed);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return pathParts[0] === 'cw' && pathParts[1] ? pathParts[1] : '';
    } catch {
      return '';
    }
  }
  
  return trimmed; // Assume it's already a slug
}

export function downloadCSV(rows: SocialRow[], filename: string = 'zealy-socials.csv'): void {
  const headers = ['slug', 'website', 'twitter', 'discord', 'telegram', 'error'];
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const value = row[header as keyof SocialRow] || '';
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
          ? `"${escaped}"` 
          : escaped;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyToClipboard(rows: SocialRow[]): Promise<boolean> {
  try {
    const headers = ['slug', 'website', 'twitter', 'discord', 'telegram', 'error'];
    const csvContent = [
      headers.join('\t'), // Use tabs for Google Sheets compatibility
      ...rows.map(row => 
        headers.map(header => {
          const value = row[header as keyof SocialRow] || '';
          return String(value);
        }).join('\t')
      )
    ].join('\n');

    await navigator.clipboard.writeText(csvContent);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
} 