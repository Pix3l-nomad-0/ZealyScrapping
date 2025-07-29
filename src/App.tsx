import { useState } from 'react';
import { SocialRow, ScrapeStatus } from './types';
import { normalizeSlug, downloadCSV } from './utils';

function App() {
  const [inputText, setInputText] = useState('');
  const [rows, setRows] = useState<SocialRow[]>([]);
  const [status, setStatus] = useState<ScrapeStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSlug, setCurrentSlug] = useState('');

  const handleCollect = async () => {
    if (!inputText.trim()) {
      alert('Please enter some slugs or URLs');
      return;
    }

    const slugs = inputText
      .split('\n')
      .map(normalizeSlug)
      .filter(Boolean)
      .filter((slug, index, arr) => arr.indexOf(slug) === index); // Remove duplicates

    if (slugs.length === 0) {
      alert('No valid slugs found');
      return;
    }

    setStatus('scraping');
    setProgress(0);
    setRows([]);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slugs }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRows(data.rows);
      setStatus('completed');
      setProgress(100);
    } catch (error) {
      console.error('Scraping failed:', error);
      setStatus('error');
      alert('Scraping failed. Please try again.');
    }
  };

  const handleDownloadCSV = () => {
    if (rows.length === 0) {
      alert('No data to download');
      return;
    }
    downloadCSV(rows);
  };

  const handleClear = () => {
    setInputText('');
    setRows([]);
    setStatus('idle');
    setProgress(0);
    setCurrentSlug('');
  };

  const renderLink = (url: string) => {
    if (!url) return '-';
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="link">
        {url}
      </a>
    );
  };

  return (
    <div className="container">
      <h1>Zealy Socials Scraper</h1>
      <p>Paste Zealy slugs or URLs (one per line) to collect social links</p>

      <div>
        <textarea
          className="textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter Zealy slugs or URLs here...&#10;Example:&#10;https://zealy.io/cw/pofucoin&#10;garth&#10;aynigold"
        />
      </div>

      <div className="button-group">
        <button
          className="button button-primary"
          onClick={handleCollect}
          disabled={status === 'scraping'}
        >
          {status === 'scraping' ? 'Collecting...' : 'Collect'}
        </button>
        <button
          className="button button-secondary"
          onClick={handleDownloadCSV}
          disabled={rows.length === 0}
        >
          Download CSV
        </button>
        <button
          className="button button-danger"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {status === 'scraping' && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>Progress: {progress}%</p>
          {currentSlug && <p>Processing: {currentSlug}</p>}
        </div>
      )}

      {rows.length > 0 && (
        <div className="table-container">
          <h3>Results ({rows.length} projects)</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Website</th>
                <th>Discord</th>
                <th>Twitter</th>
                <th>Telegram</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.slug}</td>
                  <td>{renderLink(row.website)}</td>
                  <td>{renderLink(row.discord)}</td>
                  <td>{renderLink(row.twitter)}</td>
                  <td>{renderLink(row.telegram)}</td>
                  <td>
                    {row.error ? (
                      <span className="error">{row.error}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === 'completed' && (
        <div className="status status-success">
          ✅ Scraping completed successfully!
        </div>
      )}

      {status === 'error' && (
        <div className="status status-error">
          ❌ An error occurred during scraping. Please try again.
        </div>
      )}
    </div>
  );
}

export default App; 