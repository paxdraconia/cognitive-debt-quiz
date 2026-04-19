import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const provided = req.headers['x-admin-password'];
    if (!process.env.ADMIN_PASSWORD || provided !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('Missing env', { hasUrl: !!url, hasKey: !!key });
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('scores, profile_key, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error', error);
      return res.status(500).json({ error: error.message || 'Query failed', details: error });
    }

    const rows = data || [];
    const total = rows.length;
    const dimensions = {};
    const profileCounts = {};
    const zoneCounts = {};

    for (const row of rows) {
      if (row.profile_key) {
        profileCounts[row.profile_key] = (profileCounts[row.profile_key] || 0) + 1;
      }
      for (const [dim, s] of Object.entries(row.scores || {})) {
        if (!dimensions[dim]) dimensions[dim] = { sum: 0, count: 0, label: s.label };
        dimensions[dim].sum += s.normalized;
        dimensions[dim].count += 1;

        if (!zoneCounts[dim]) zoneCounts[dim] = { low: 0, accumulating: 0, compounding: 0 };
        if (s.zone) zoneCounts[dim][s.zone] = (zoneCounts[dim][s.zone] || 0) + 1;
      }
    }

    const averages = Object.fromEntries(
      Object.entries(dimensions).map(([dim, d]) => [
        dim,
        { label: d.label, average: d.count ? Math.round(d.sum / d.count) : 0 },
      ])
    );

    return res.status(200).json({
      total,
      averages,
      zoneCounts,
      profileCounts,
      recent: rows.slice(0, 20).map(r => ({ profile: r.profile_key, at: r.created_at })),
    });
  } catch (err) {
    console.error('admin-stats handler threw', err);
    return res.status(500).json({ error: err?.message || 'Unknown error', stack: err?.stack });
  }
}
