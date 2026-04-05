import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDimensionSummary } from '../utils/scoring';
import { ZONE_LABELS } from '../utils/constants';
import styles from './DimensionDetail.module.css';

export default function DimensionDetail({ dimensionId, label, score }) {
  const [open, setOpen] = useState(false);
  const summary = getDimensionSummary(dimensionId, score.zone);

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className={styles.headerLeft}>
          <span className={styles.label}>{label}</span>
          <span className={`${styles.zone} ${styles[score.zone]}`}>
            {ZONE_LABELS[score.zone]}
          </span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.scoreValue}>{score.normalized}</span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
            &#9662;
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.body}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className={styles.summary}>{summary}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
