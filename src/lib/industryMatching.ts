import { industries, signals, prospects, Industry, Signal, Prospect } from "@/data/mockData";

/**
 * Match user's target industry names (from profile) to mock data industries.
 * Uses fuzzy substring matching since AI-generated names may not exactly match.
 */
export function matchUserIndustries(targetIndustries: string[] | null): Industry[] {
  if (!targetIndustries || targetIndustries.length === 0) return industries;

  const matched = industries.filter((ind) =>
    targetIndustries.some((target) => {
      const t = target.toLowerCase();
      const n = ind.name.toLowerCase();
      return n.includes(t) || t.includes(n) || levenshteinSimilarity(t, n) > 0.6;
    })
  );

  // If no matches found, return all industries
  return matched.length > 0 ? matched : industries;
}

export function getRelevantSignals(targetIndustries: string[] | null): Signal[] {
  const matched = matchUserIndustries(targetIndustries);
  const matchedIds = new Set(matched.map((i) => i.id));

  if (matchedIds.size === industries.length) return signals;

  // Return signals that tag any of the user's industries
  const relevant = signals.filter((s) =>
    s.industryTags.some((tag) => matchedIds.has(tag))
  );

  // If too few, supplement with high-severity signals
  if (relevant.length < 5) {
    const extras = signals
      .filter((s) => !relevant.includes(s) && s.severity >= 4)
      .slice(0, 5 - relevant.length);
    return [...relevant, ...extras];
  }

  return relevant;
}

export function getRelevantProspects(targetIndustries: string[] | null): Prospect[] {
  const matched = matchUserIndustries(targetIndustries);
  const matchedIds = new Set(matched.map((i) => i.id));

  if (matchedIds.size === industries.length) return prospects;

  const relevant = prospects.filter((p) => matchedIds.has(p.industryId));

  // If too few, supplement with high-score prospects
  if (relevant.length < 3) {
    const extras = prospects
      .filter((p) => !relevant.includes(p) && p.vigylScore >= 70)
      .slice(0, 3 - relevant.length);
    return [...relevant, ...extras];
  }

  return relevant;
}

function levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - matrix[b.length][a.length] / maxLen;
}
