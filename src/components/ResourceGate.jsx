import { DIMENSION_LABELS, groupAndSortResources } from '../utils/constants';
import styles from './ResourceGate.module.css';

const SUBSTACK_URL = 'https://alyn.substack.com/subscribe';

export default function ResourceGate({ resources, unlocked, onUnlock, scores }) {
  if (!unlocked) {
    return (
      <div className={styles.gate}>
        <h3 className={styles.gateTitle}>Your personalized reading list is ready</h3>
        <p className={styles.gateText}>
          We've pulled together Nerd Out episodes, book recommendations, and research
          specifically for your profile. Subscribe to unlock your full resource list.
        </p>
        <div className={styles.gateActions}>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.subscribeButton}
            onClick={() => onUnlock()}
          >
            Subscribe to Nerd Out
          </a>
          <button
            className={styles.skipButton}
            onClick={onUnlock}
          >
            Show me anyway
          </button>
        </div>
      </div>
    );
  }

  const sortedDimensions = groupAndSortResources(resources, scores);

  return (
    <div className={styles.resourceList}>
      <h3 className={styles.resourceTitle}>Custom Reading List</h3>
      <div className={styles.whitepaperBanner}>
        <div className={styles.whitepaperText}>
          <strong>Want to go deeper?</strong> The Cognitive Debt white paper covers the research and
          frameworks behind these results.
        </div>
        <a
          href="/cognitive-debt-whitepaper.pdf"
          download
          className={styles.whitepaperDownload}
        >
          Download White Paper
        </a>
      </div>
      {sortedDimensions.map(([dim, items]) => (
        <div key={dim} className={styles.dimensionGroup}>
          <h4 className={styles.dimensionLabel}>{DIMENSION_LABELS[dim]}</h4>
          {items.map(r => (
            <div key={r.id} className={styles.resource}>
              <span className={`${styles.typeBadge} ${styles[r.type]}`}>
                {r.type === 'episode' ? 'Episode' : 'Book'}
              </span>
              <div className={styles.resourceInfo}>
                {(r.url || r.affiliateUrl) ? (
                  <a href={r.affiliateUrl || r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
                    {r.title}
                  </a>
                ) : (
                  <span className={styles.resourceName}>{r.title}</span>
                )}
                <p className={styles.resourceDesc}>{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
