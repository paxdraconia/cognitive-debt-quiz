import questionsData from '../data/questions.json';
import summariesData from '../data/summaries.json';
import resourcesData from '../data/resources.json';

// INVERTED: higher score = MORE debt (agreeing with statements = bad)
const ZONE_THRESHOLDS = {
  low: { min: 3, max: 6 },
  accumulating: { min: 7, max: 10 },
  compounding: { min: 11, max: 15 },
};

export function getZone(rawScore) {
  if (rawScore <= ZONE_THRESHOLDS.low.max) return 'low';
  if (rawScore <= ZONE_THRESHOLDS.accumulating.max) return 'accumulating';
  return 'compounding';
}

export function normalizeScore(rawScore) {
  return Math.round(((rawScore - 3) / 12) * 100);
}

export function computeScores(answers) {
  const dimensions = {};

  for (const dim of questionsData.dimensions) {
    dimensions[dim.id] = { raw: 0, max: 15, normalized: 0, zone: 'low', label: dim.label, shortLabel: dim.shortLabel };
  }

  for (const [questionId, answer] of Object.entries(answers)) {
    const question = questionsData.questions.find(q => q.id === questionId);
    if (question) {
      dimensions[question.dimension].raw += answer.score;
    }
  }

  for (const dim of Object.values(dimensions)) {
    dim.normalized = normalizeScore(dim.raw);
    dim.zone = getZone(dim.raw);
  }

  return dimensions;
}

export function matchProfile(scores) {
  const zones = Object.entries(scores).map(([id, s]) => ({ id, zone: s.zone }));
  const profiles = summariesData.overallProfiles;

  for (const profile of profiles) {
    const { rule, zone, zones: allowedZones, threshold, dimension } = profile.condition;

    if (rule === 'allZonesIn') {
      if (zones.every(z => allowedZones.includes(z.zone))) return profile;
    }

    if (rule === 'majorityInZone') {
      const count = zones.filter(z => z.zone === zone).length;
      if (count >= threshold) return profile;
    }

    if (rule === 'highestDebt') {
      // Sort by most debt first (compounding > accumulating > low), then by raw score descending
      const sorted = [...zones].sort((a, b) => {
        const order = { compounding: 0, accumulating: 1, low: 2 };
        return order[a.zone] - order[b.zone] || (scores[b.id].raw - scores[a.id].raw);
      });
      if (sorted[0].id === dimension) return profile;
    }

    if (rule === 'default') return profile;
  }

  return profiles[profiles.length - 1];
}

export function getResourcesForProfile(scores) {
  return resourcesData.resources.filter(r => {
    const dimScore = scores[r.dimension];
    return dimScore && dimScore.zone === r.zone;
  });
}

export function getDimensionSummary(dimensionId, zone) {
  return summariesData.dimensionSummaries[dimensionId]?.[zone] || '';
}

export function getRadarData(scores) {
  return questionsData.dimensions.map(dim => ({
    dimension: dim.shortLabel,
    score: scores[dim.id]?.normalized || 0,
    fullMark: 100,
  }));
}

// V2-ready: structured payload for Gemini API
export function getGeminiPayload(answers, scores, profile) {
  return {
    answers: Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      score: answer.score,
    })),
    dimensionScores: Object.fromEntries(
      Object.entries(scores).map(([id, s]) => [id, { raw: s.raw, zone: s.zone }])
    ),
    overallProfile: profile.id,
  };
}
