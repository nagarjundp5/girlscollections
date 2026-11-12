import { getSynonym, getSynonymVariants } from './synonyms';

export interface SearchableItem {
  id: string;
  slug: string;
  name: string;
  category?: string;
  categoryName?: string;
  target?: 'women' | 'kids' | string;
  division?: 'women' | 'kids' | string;
  tags?: string[];
  colour?: string;
  color?: string;
  fabric?: string;
  occasion?: string;
  price?: number;
  originalPrice?: number;
  compare_price?: number;
  images?: string[];
  image?: string;
  inStock?: boolean;
}

export interface MatchScoreResult<T extends SearchableItem> {
  item: T;
  score: number;
  isExactOrPrefix: boolean;
  isCorrected: boolean;
  correctedQuery?: string;
  matchedFields: string[];
}

/**
 * Normalizes query string:
 * - lowercase
 * - remove diacritics / accents
 * - standardizes coord/co-ord phrases
 * - removes punctuation
 * - collapses spaces
 * - basic English singularization (kurtas -> kurta, lehengas -> lehenga, frocks -> frock)
 */
export function normalizeQuery(q: string): string {
  if (!q) return '';
  let str = q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Standardize coordinate set spellings
  str = str.replace(/co[\s-_]?ord(s)?\s*(set)?/g, 'coord set');

  // Strip punctuation except spaces
  str = str.replace(/[^a-z0-9\s]/g, ' ');

  // Collapse whitespace
  str = str.replace(/\s+/g, ' ').trim();

  // Simple singularization for common clothing plurals
  const tokens = str.split(' ').map((tok) => {
    if (tok.length > 4 && tok.endsWith('s') && !tok.endsWith('ss')) {
      return tok.slice(0, -1);
    }
    return tok;
  });

  return tokens.join(' ');
}

/**
 * Damerau-Levenshtein distance calculation (handles insertion, deletion, substitution, and transposition).
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let min = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        min = Math.min(min, matrix[i - 2][j - 2] + cost);
      }
      matrix[i][j] = min;
    }
  }

  return matrix[al][bl];
}

/**
 * Computes trigram similarity between two strings (0 to 1).
 */
export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  function getTrigrams(s: string): Set<string> {
    const padded = `  ${s} `;
    const set = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) {
      set.add(padded.slice(i, i + 3));
    }
    return set;
  }

  const setA = getTrigrams(a);
  const setB = getTrigrams(b);
  let intersection = 0;
  setA.forEach((tri) => {
    if (setB.has(tri)) intersection++;
  });

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Checks single token match against a target word:
 * Exact (score 10) > Prefix (score 7) > Synonym (score 6) > Fuzzy Damerau-Levenshtein (score 3-5).
 */
function matchTokenToWord(token: string, word: string): { matched: boolean; score: number; isFuzzy: boolean; isSynonym: boolean } {
  if (!token || !word) return { matched: false, score: 0, isFuzzy: false, isSynonym: false };

  // 1. Exact match
  if (token === word) {
    return { matched: true, score: 10, isFuzzy: false, isSynonym: false };
  }

  // 2. Prefix match (e.g. "lehen" in "lehenga")
  if (word.startsWith(token) && token.length >= 3) {
    return { matched: true, score: 7 + (token.length / word.length) * 2, isFuzzy: false, isSynonym: false };
  }

  // 3. Synonym match
  const canonToken = getSynonym(token);
  const canonWord = getSynonym(word);
  if (canonToken === canonWord && canonToken !== token) {
    return { matched: true, score: 7.5, isFuzzy: false, isSynonym: true };
  }

  const variants = getSynonymVariants(token);
  if (variants.includes(word)) {
    return { matched: true, score: 7, isFuzzy: false, isSynonym: true };
  }

  // 4. Fuzzy Damerau-Levenshtein match
  // Rules:
  // - tokens under 4 characters: no fuzzy
  // - tokens 4-6 characters: max distance 1
  // - tokens 7+ characters: max distance 2
  if (token.length >= 4) {
    const maxDist = token.length <= 6 ? 1 : 2;
    const dist = damerauLevenshtein(token, word);
    if (dist <= maxDist) {
      const trigram = trigramSimilarity(token, word);
      return { matched: true, score: 5 - dist + trigram * 2, isFuzzy: true, isSynonym: false };
    }

    // Check fuzzy against canonical synonym too (e.g. "lehnga" -> canonical "lehenga")
    if (canonWord !== word) {
      const distCanon = damerauLevenshtein(token, canonWord);
      if (distCanon <= maxDist) {
        return { matched: true, score: 4.5 - distCanon, isFuzzy: true, isSynonym: true };
      }
    }
  }

  return { matched: false, score: 0, isFuzzy: false, isSynonym: false };
}

/**
 * Matches a list of searchable items against a search query.
 */
export function matchProducts<T extends SearchableItem>(
  items: T[],
  query: string,
  options: {
    targetPreference?: 'women' | 'kids';
    limit?: number;
    colorFilter?: string;
  } = {}
): {
  results: T[];
  correctedQuery?: string;
  bestFuzzyTerm?: string;
} {
  const normQuery = normalizeQuery(query);
  if (!normQuery) {
    return { results: [] };
  }

  const queryTokens = normQuery.split(' ').filter(Boolean);
  if (queryTokens.length === 0) return { results: [] };

  const scoredItems: MatchScoreResult<T>[] = [];
  let detectedTypoCorrection: string | undefined = undefined;

  for (const item of items) {
    // Collect fields with weights
    const nameNorm = normalizeQuery(item.name || '');
    const catNorm = normalizeQuery(`${item.category || ''} ${item.categoryName || ''}`);
    const colorNorm = normalizeQuery(`${item.colour || ''} ${item.color || ''}`);
    const metaNorm = normalizeQuery(
      `${(item.tags || []).join(' ')} ${item.fabric || ''} ${item.occasion || ''}`
    );

    const nameWords = nameNorm.split(' ').filter(Boolean);
    const catWords = catNorm.split(' ').filter(Boolean);
    const colorWords = colorNorm.split(' ').filter(Boolean);
    const metaWords = metaNorm.split(' ').filter(Boolean);

    let totalScore = 0;
    let tokensMatchedCount = 0;
    let hasFuzzy = false;
    let hasExactOrPrefix = false;
    const matchedFields: string[] = [];

    for (const qToken of queryTokens) {
      let bestTokenScore = 0;
      let tokenMatched = false;

      // 1. Name field (weight: 3.0)
      for (const w of nameWords) {
        const m = matchTokenToWord(qToken, w);
        if (m.matched) {
          const score = m.score * 3.0;
          if (score > bestTokenScore) {
            bestTokenScore = score;
            tokenMatched = true;
            if (m.isFuzzy) hasFuzzy = true;
            if (!m.isFuzzy) hasExactOrPrefix = true;
            if (!matchedFields.includes('name')) matchedFields.push('name');
            if (m.isFuzzy || m.isSynonym) {
              const canon = getSynonym(w);
              if (canon !== qToken) detectedTypoCorrection = canon;
            }
          }
        }
      }

      // 2. Category field (weight: 2.5)
      for (const w of catWords) {
        const m = matchTokenToWord(qToken, w);
        if (m.matched) {
          const score = m.score * 2.5;
          if (score > bestTokenScore) {
            bestTokenScore = score;
            tokenMatched = true;
            if (m.isFuzzy) hasFuzzy = true;
            if (!m.isFuzzy) hasExactOrPrefix = true;
            if (!matchedFields.includes('category')) matchedFields.push('category');
            if (m.isFuzzy || m.isSynonym) {
              const canon = getSynonym(w);
              if (canon !== qToken) detectedTypoCorrection = canon;
            }
          }
        }
      }

      // 3. Color field (weight: 2.0)
      for (const w of colorWords) {
        const m = matchTokenToWord(qToken, w);
        if (m.matched) {
          const score = m.score * 2.0;
          if (score > bestTokenScore) {
            bestTokenScore = score;
            tokenMatched = true;
            if (!matchedFields.includes('colour')) matchedFields.push('colour');
          }
        }
      }

      // 4. Tags / Fabric / Occasion (weight: 1.5)
      for (const w of metaWords) {
        const m = matchTokenToWord(qToken, w);
        if (m.matched) {
          const score = m.score * 1.5;
          if (score > bestTokenScore) {
            bestTokenScore = score;
            tokenMatched = true;
            if (!matchedFields.includes('meta')) matchedFields.push('meta');
          }
        }
      }

      if (tokenMatched) {
        tokensMatchedCount++;
        totalScore += bestTokenScore;
      }
    }

    // AND matching: all query tokens must match
    // If not all matched, heavily penalize or check partial match fallback
    const allMatched = tokensMatchedCount === queryTokens.length;
    if (allMatched) {
      // In-stock boost
      if (item.inStock !== false) {
        totalScore += 5;
      }

      // Target / Division boost
      const itemTarget = (item.target || item.division || '').toLowerCase();
      if (options.targetPreference && itemTarget === options.targetPreference.toLowerCase()) {
        totalScore += 4;
      }

      scoredItems.push({
        item,
        score: totalScore,
        isExactOrPrefix: hasExactOrPrefix,
        isCorrected: hasFuzzy && !hasExactOrPrefix,
        matchedFields,
      });
    } else if (tokensMatchedCount > 0 && queryTokens.length > 1) {
      // Partial match fallback ranked lower
      const partialScore = (totalScore / queryTokens.length) * (tokensMatchedCount / queryTokens.length);
      scoredItems.push({
        item,
        score: partialScore,
        isExactOrPrefix: false,
        isCorrected: false,
        matchedFields,
      });
    }
  }

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  const limit = options.limit || 24;
  const results = scoredItems.slice(0, limit).map((s) => s.item);

  return {
    results,
    correctedQuery: detectedTypoCorrection,
    bestFuzzyTerm: detectedTypoCorrection,
  };
}

