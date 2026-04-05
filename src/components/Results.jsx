import { motion } from 'framer-motion';
import questionsData from '../data/questions.json';
import { getRadarData } from '../utils/scoring';
import RadarChart from './RadarChart';
import DimensionDetail from './DimensionDetail';
import ShareCard from './ShareCard';
import ResourceGate from './ResourceGate';
import styles from './Results.module.css';

export default function Results({
  scores,
  profile,
  resources,
  resourcesUnlocked,
  onUnlockResources,
  onRestart,
}) {
  const radarData = getRadarData(scores);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cognitive Debt Profile</h1>
        <h2 className={styles.profileTitle}>{profile.title}</h2>
      </div>

      <RadarChart data={radarData} />

      <motion.p
        className={styles.summary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {profile.summary}
      </motion.p>

      <div className={styles.dimensions}>
        <h3 className={styles.sectionTitle}>Dimension Breakdown</h3>
        {questionsData.dimensions.map(dim => (
          <DimensionDetail
            key={dim.id}
            dimensionId={dim.id}
            label={dim.label}
            score={scores[dim.id]}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <ShareCard profile={profile} scores={scores} resources={resources} />
      </div>

      <ResourceGate
        resources={resources}
        unlocked={resourcesUnlocked}
        onUnlock={onUnlockResources}
        scores={scores}
      />

      <div className={styles.footer}>
        <button className={styles.restartButton} onClick={onRestart}>
          Retake the Quiz
        </button>
      </div>
    </div>
  );
}
