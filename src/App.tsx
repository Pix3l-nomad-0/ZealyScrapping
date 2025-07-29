import { useState } from 'react';
import { SocialRow, ScrapeStatus } from './types';
import { normalizeSlug, downloadCSV, copyToClipboard } from './utils';

function App() {
  const [inputText, setInputText] = useState('');
  const [rows, setRows] = useState<SocialRow[]>([]);
  const [status, setStatus] = useState<ScrapeStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSlug, setCurrentSlug] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

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

  const handleCopyToClipboard = async () => {
    if (rows.length === 0) {
      alert('No data to copy');
      return;
    }

    setCopyStatus('copying');
    const success = await copyToClipboard(rows);
    
    if (success) {
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleClear = () => {
    setInputText('');
    setRows([]);
    setStatus('idle');
    setProgress(0);
    setCurrentSlug('');
    setCopyStatus('idle');
  };

  const renderLink = (url: string) => {
    if (!url) return '-';
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="link">
        {url}
      </a>
    );
  };

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying': return 'Copying...';
      case 'success': return 'Copied!';
      case 'error': return 'Copy Failed';
      default: return 'Copy for Sheets';
    }
  };

  const getCopyButtonClass = () => {
    switch (copyStatus) {
      case 'copying': return 'button button-secondary';
      case 'success': return 'button button-success';
      case 'error': return 'button button-danger';
      default: return 'button button-secondary';
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">Zealy Socials Scraper</h1>
        <p className="subtitle">Paste Zealy slugs or URLs (one per line) to collect social links</p>
      </div>

      <div className="main-content">
        <div className="input-section">
          <label htmlFor="slugs-input" className="input-label">Zealy Slugs/URLs</label>
          <textarea
            id="slugs-input"
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
            {status === 'scraping' ? (
              <>
                <span className="spinner"></span>
                Collecting...
              </>
            ) : (
              'Collect'
            )}
          </button>
          <button
            className={getCopyButtonClass()}
            onClick={handleCopyToClipboard}
            disabled={rows.length === 0 || copyStatus === 'copying'}
          >
            {getCopyButtonText()}
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
            <p className="progress-text">Progress: {progress}%</p>
            {currentSlug && <p className="current-slug">Processing: {currentSlug}</p>}
          </div>
        )}

        {rows.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3 className="results-title">Results ({rows.length} projects)</h3>
              <div className="results-actions">
                <button
                  className="button button-sm button-secondary"
                  onClick={handleCopyToClipboard}
                  disabled={copyStatus === 'copying'}
                >
                  {getCopyButtonText()}
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Slug</th>
                    <th>Website</th>
                    <th>Twitter (X)</th>
                    <th>Discord</th>
                    <th>Telegram</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="slug-cell">{row.slug}</td>
                      <td>{renderLink(row.website)}</td>
                      <td>{renderLink(row.twitter)}</td>
                      <td>{renderLink(row.discord)}</td>
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
          </div>
        )}

        {status === 'completed' && (
          <div className="status status-success">
            <span className="status-icon">✅</span>
            Scraping completed successfully!
          </div>
        )}

        {status === 'error' && (
          <div className="status status-error">
            <span className="status-icon">❌</span>
            An error occurred during scraping. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 