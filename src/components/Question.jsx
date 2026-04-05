import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Question.module.css';

const LABELS = [
  '',
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
];

export default function Question({ question, onAnswer, onNext }) {
  const [value, setValue] = useState(null);

  const handleNext = () => {
    if (value === null) return;
    onAnswer(question.id, value);
    setValue(null);
    onNext();
  };

  return (
    <div className={styles.card}>
      <p className={styles.stem}>{question.stem}</p>

      <div className={styles.sliderContainer}>
        <div className={styles.scaleLabels}>
          <span className={styles.scaleEnd}>Strongly Disagree</span>
          <span className={styles.scaleEnd}>Strongly Agree</span>
        </div>

        <div className={styles.dots}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`${styles.dot} ${value === n ? styles.dotActive : ''}`}
              onClick={() => setValue(n)}
              aria-label={LABELS[n]}
            >
              <span className={styles.dotNumber}>{n}</span>
            </button>
          ))}
        </div>

        {value !== null && (
          <motion.p
            className={styles.valueLabel}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={value}
          >
            {LABELS[value]}
          </motion.p>
        )}
      </div>

      {value !== null && (
        <motion.button
          className={styles.nextButton}
          onClick={handleNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Next
        </motion.button>
      )}
    </div>
  );
}
