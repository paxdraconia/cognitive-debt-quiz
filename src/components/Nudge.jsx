import { motion } from 'framer-motion';
import styles from './Nudge.module.css';

export default function Nudge({ nudge, onContinue }) {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>Pause & Reflect</div>
      <p className={styles.body}>{nudge.body}</p>
      <p className={styles.reflection}>{nudge.reflectionPrompt}</p>
      <motion.button
        className={styles.continueButton}
        onClick={onContinue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Continue
      </motion.button>
    </div>
  );
}
