import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ progress, total }) {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.bar}
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
      <span className={styles.label}>
        {Math.round(progress * total)} / {total}
      </span>
    </div>
  );
}
