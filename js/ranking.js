/** NEON BIKE RIDE — offline/static-safe career ranking.
 *  This build is static-hosting ready: no /api serverless function is required.
 */
const KEY = 'neon_bike_rankings_v1';

export function getCareerScore(state) {
  const p = state.player || {};
  return Math.max(0, Math.round((p.xp||0) + (p.missionsCompleted||0)*900 + (p.racesWon||0)*1200 + (p.jobsCompleted||0)*250 + (p.distanceDriven||0)*12 + Math.min(100000, p.money||0)/100));
}

export function getRankTier(score) {
  if (score >= 60000) return 'NEON LEGEND';
  if (score >= 35000) return 'ELITE RIDER';
  if (score >= 18000) return 'PRO RIDER';
  if (score >= 8000) return 'RISING RIDER';
  return 'ROOKIE RIDER';
}

export function loadLocalRanks() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export function saveLocalRank(state) {
  try {
    const p = state.player || {};
    const score = getCareerScore(state);
    const id = state._rankId || ('rider_' + Math.random().toString(36).slice(2,10));
    state._rankId = id;
    const a = loadLocalRanks().filter(x => x && x.id !== id);
    a.push({
      id,
      name: String(p.name || 'Rider').slice(0,24),
      score,
      level: p.level || 1,
      wins: p.racesWon || 0,
      missions: p.missionsCompleted || 0,
      updated: Date.now()
    });
    a.sort((x,y) => y.score - x.score);
    a.splice(50);
    localStorage.setItem(KEY, JSON.stringify(a));
    return a;
  } catch {
    return [];
  }
}

export function getLocalRank(state) {
  const a = saveLocalRank(state);
  const score = getCareerScore(state);
  const idx = a.findIndex(x => x.id === state._rankId);
  return { position: idx + 1, total: a.length, score, tier: getRankTier(score), leaders: a };
}

export async function syncGlobalRank(state) {
  // Static/Vercel-safe: no serverless API call, no 500 risk, no /api dependency.
  const local = getLocalRank(state);
  return {
    online: false,
    drivers: local.leaders,
    riders: local.leaders,
    position: local.position,
    score: local.score,
    tier: local.tier
  };
}
