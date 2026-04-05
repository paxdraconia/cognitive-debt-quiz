import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import styles from './RadarChart.module.css';

export default function RadarChart({ data }) {
  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={320}>
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(26, 42, 69, 0.1)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#333333', fontSize: 13, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#00C4CC"
            fill="#00C4CC"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 4, fill: '#00C4CC', strokeWidth: 0 }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#00C4CC' }} />
          Low Debt (0-33)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#FFC759' }} />
          Accumulating (34-66)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#FF6B6B' }} />
          Compounding (67-100)
        </span>
      </div>
    </div>
  );
}
