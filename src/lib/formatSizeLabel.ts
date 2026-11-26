/**
 * Frontend-only helper to format size keys for display.
 * Strips leading alphabetic prefix before digits (k16 -> 16, k20 -> 20, K-18 -> 18)
 * while preserving standard text labels like S, M, XL, Free Size, 36, etc.
 * The underlying value sent to the cart, API, database and order stays the original raw string.
 */
export function formatSizeLabel(raw: string | undefined | null): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  // Strip leading alphabetic prefix if directly preceding digits (e.g., k16, k-16, K22)
  if (/^[a-zA-Z]+-?\d+$/.test(trimmed)) {
    return trimmed.replace(/^[a-zA-Z]+-?/, '');
  }
  return trimmed;
}

/**
 * Returns the recommended age subtitle for kids garment sizes.
 */
export function getSizeAgeSubtitle(raw: string | undefined | null, isKids: boolean = false): string | null {
  if (!raw || !isKids) return null;
  const num = formatSizeLabel(raw);
  const ageMap: Record<string, string> = {
    '12': '3-9 mos',
    '14': '1 yr',
    '16': '1.5 yrs',
    '18': '2 yrs',
    '20': '3 yrs',
    '22': '4 yrs',
    '24': '5 yrs',
    '26': '6 yrs',
    '28': '7 yrs',
    '30': '8 yrs',
    '32': '9 yrs',
    '34': '10 yrs',
    '36': '11 yrs',
    '38': '13-14 yrs',
    '40': '15-17 yrs',
  };
  return ageMap[num] || null;
}

/**
 * Returns the secondary sizing label for women's garment sizes (e.g. 36 -> M, or M -> 36).
 */
export function getWomenSizeSubtitle(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim().toUpperCase();
  const letterToNum: Record<string, string> = {
    XS: '32',
    S: '34',
    M: '36',
    L: '38',
    XL: '40',
    XXL: '42',
    '2XL': '42',
    '3XL': '44',
  };
  const numToLetter: Record<string, string> = {
    '32': 'XS',
    '34': 'S',
    '36': 'M',
    '38': 'L',
    '40': 'XL',
    '42': 'XXL',
    '44': '3XL',
  };
  if (letterToNum[trimmed]) return `Size ${letterToNum[trimmed]}`;
  if (numToLetter[trimmed]) return numToLetter[trimmed];
  return null;
}

export default formatSizeLabel;
