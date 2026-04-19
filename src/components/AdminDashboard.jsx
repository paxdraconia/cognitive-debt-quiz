import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(e) {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin-stats', {
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) {
        setError('Wrong password');
        setStats(null);
      } else if (!res.ok) {
        setError(`Error: ${res.status}`);
      } else {
        setStats(await res.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!stats) {
    return (
      <div className={styles.gate}>
        <h1>Admin Dashboard</h1>
        <form onSubmit={load}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            autoFocus
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Loading…' : 'Unlock'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  const avgData = Object.entries(stats.averages).map(([id, d]) => ({
    name: d.label || id,
    avg: d.average,
  }));

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button className={styles.refresh} onClick={load} disabled={loading}>
          {loading ? '…' : 'Refresh'}
        </button>
      </header>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Total submissions</h2>
        <p className={styles.big}>{stats.total}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Average score per dimension</h2>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={avgData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#1a2a45" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Zone distribution</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Low</th>
              <th>Accumulating</th>
              <th>Compounding</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.zoneCounts).map(([dim, counts]) => (
              <tr key={dim}>
                <td>{stats.averages[dim]?.label || dim}</td>
                <td>{counts.low}</td>
                <td>{counts.accumulating}</td>
                <td>{counts.compounding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Profile frequency</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.profileCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([profile, count]) => (
                <tr key={profile}>
                  <td>{profile}</td>
                  <td>{count}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Recent submissions</h2>
        <ul className={styles.list}>
          {stats.recent.map((r, i) => (
            <li key={i}>
              <span>{new Date(r.at).toLocaleString()}</span>
              <span>{r.profile || '—'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
