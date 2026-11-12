// Dictionary of search synonyms and spelling variations for ethnic & modern wear.
// Each array represents an equivalence class: all tokens in the array map to the canonical first token.
export const SYNONYM_GROUPS: string[][] = [
  ['kurti', 'kurta', 'kurtha', 'kurtis', 'tunic', 'tunics'],
  ['lehenga', 'lehnga', 'lengha', 'langa', 'ghagra', 'lehangas', 'choli'],
  ['frock', 'frok', 'gown', 'dress', 'frocks', 'gowns', 'dresses'],
  ['anarkali', 'anarkli', 'anarkaly', 'anarkalis'],
  ['saree', 'sari', 'sarees', 'saris'],
  ['bodycon', 'body con', 'bodycone', 'body-con'],
  ['skirt and top', 'skirt top', 'skirt set', 'crop top and skirt', 'skirt and blouse'],
  ['pattu', 'pattu pavadai', 'silk langa', 'pavadai', 'pattu pavada', 'pavadai sattai'],
  ['sharara', 'gharara', 'garara', 'shararas'],
  ['coord set', 'co-ord set', 'coordinate set', 'coord', 'co-ord', 'coords', 'co ord', 'co ord set'],
  ['kids', 'children', 'girls', 'boys', 'kid', 'child'],
];

// Pre-computed lookup table for O(1) synonym resolution
const synonymLookup: Map<string, string> = new Map();

for (const group of SYNONYM_GROUPS) {
  const canonical = group[0];
  for (const variant of group) {
    synonymLookup.set(variant.toLowerCase().trim(), canonical);
  }
}

/**
 * Resolves a token or multi-word phrase to its canonical synonym if one exists.
 */
export function getSynonym(token: string): string {
  const clean = token.toLowerCase().trim();
  return synonymLookup.get(clean) || clean;
}

/**
 * Returns all synonymous variations for a given word or phrase.
 */
export function getSynonymVariants(token: string): string[] {
  const clean = token.toLowerCase().trim();
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => g.toLowerCase() === clean)) {
      return group;
    }
  }
  return [token];
}

