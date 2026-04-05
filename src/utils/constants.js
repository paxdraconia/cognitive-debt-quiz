export const ZONE_LABELS = {
  low: 'Low Debt',
  accumulating: 'Accumulating',
  compounding: 'Compounding',
};

export const DIMENSION_LABELS = {
  'focus-energy': 'Focus, Energy & Overwhelm',
  'faster-work': 'Faster Work',
  'fading-knowledge': '"Fading" Company Knowledge',
  'skill-loss': 'Skill Loss & the Future Workforce',
  'mental-habits': 'Building Lasting Mental Habits',
};

/**
 * Groups resources by dimension and sorts by zone priority and user scores.
 * Returns sorted [dimensionId, items[]] entries array.
 */
export function groupAndSortResources(resources, scores) {
  const zoneOrder = { compounding: 0, accumulating: 1, low: 2 };

  const byDimension = {};
  for (const r of resources) {
    if (!byDimension[r.dimension]) byDimension[r.dimension] = [];
    byDimension[r.dimension].push(r);
  }

  for (const dim in byDimension) {
    byDimension[dim].sort((a, b) => zoneOrder[a.zone] - zoneOrder[b.zone]);
  }

  return Object.entries(byDimension).sort(([dimA], [dimB]) => {
    const scoreA = scores?.[dimA]?.normalized ?? 0;
    const scoreB = scores?.[dimB]?.normalized ?? 0;
    return scoreB - scoreA;
  });
}
