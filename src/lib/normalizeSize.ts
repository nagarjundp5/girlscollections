/**
 * normalizeSize.ts
 *
 * Universal size normalizer for The Girls Collections.
 * Maps any variant input (e.g. "k26", "K26", "26", "Size 26 (6 years)", "6-7Y", "XL", "xl", "Free Size")
 * to the canonical master size key used across database, stock management, cart, and orders.
 *
 * Canonical Master Keys:
 * - Kids : 'k12', 'k14', 'k16', 'k18', 'k20', 'k22', 'k24', 'k26', 'k28', 'k30', 'k32', 'k34', 'k36', 'k38', 'k40'
 * - Women: 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', 'FREE SIZE'
 * - Numeric Garment Sizes: '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40'
 */

import { LEGACY_KIDS_SIZE_MAP } from '@/data/masterSizes';

const CANONICAL_KIDS_SIZES = new Set([
  'k12', 'k14', 'k16', 'k18', 'k20', 'k22', 'k24', 'k26', 'k28', 'k30', 'k32', 'k34', 'k36', 'k38', 'k40'
]);

const CANONICAL_WOMEN_SIZES = new Set([
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', 'FREE SIZE'
]);

const CANONICAL_NUMERIC_SIZES = new Set([
  '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40'
]);

export function normalizeSize(
  productDivision: 'kids' | 'women' | 'all' | string | null | undefined,
  rawValue: string | null | undefined
): string | null {
  if (!rawValue || typeof rawValue !== 'string') return null;

  const raw = rawValue.trim();
  if (!raw) return null;

  const division = (productDivision || '').toLowerCase().trim();
  const isKidsDivision = division === 'kids' || division === 'kid' || division === 'girl' || division === 'girls' || division === 'children';
  const isWomenDivision = division === 'women' || division === 'woman' || division === 'adult' || division === 'female';

  // 1. Direct match check (case-insensitive) for Kids master size (k12 .. k40)
  const lower = raw.toLowerCase();
  if (/^k(1[2-9]|[2-3][0-9]|40)$/.test(lower)) {
    return lower;
  }

  // 2. Direct match check for Women master size (XS..6XL, FREE SIZE)
  const upper = raw.toUpperCase().replace(/\s+/g, ' ');
  if (upper === 'FREE SIZE' || upper === 'FREE-SIZE' || upper === 'FREESIZE' || upper === 'FS') {
    return 'FREE SIZE';
  }
  if (CANONICAL_WOMEN_SIZES.has(upper)) {
    return upper;
  }
  if (upper === '2XL') return 'XXL';
  if (upper === 'XXXL') return '3XL';

  // 3. Legacy kids size mapping (e.g. '6-7Y' -> 'k26', '1-2Y' -> 'k16')
  if (LEGACY_KIDS_SIZE_MAP[upper]) {
    return LEGACY_KIDS_SIZE_MAP[upper];
  }
  if (LEGACY_KIDS_SIZE_MAP[raw]) {
    return LEGACY_KIDS_SIZE_MAP[raw];
  }

  // 4. Extract from strings like "Size 26 (6 years)", "Size 26", "26 (6Y)", "Size 40"
  const sizePrefixMatch = upper.match(/SIZE\s*(\d{2})/i) || raw.match(/(\d{2})\s*(?:YEARS|YRS|Y|M)/i);
  if (sizePrefixMatch && sizePrefixMatch[1]) {
    const num = sizePrefixMatch[1];
    if (isWomenDivision) {
      const bustMap: Record<string, string> = {
        '32': 'XS', '34': 'S', '36': 'M', '38': 'L', '40': 'XL', '42': 'XXL', '44': '3XL', '46': '4XL', '48': '5XL', '50': '6XL'
      };
      if (bustMap[num]) return bustMap[num];
      if (CANONICAL_NUMERIC_SIZES.has(num)) return num;
    }
    if (CANONICAL_KIDS_SIZES.has(`k${num}`)) {
      return `k${num}`;
    }
  }

  // 5. Women label parsing, e.g. "XL (Size 40 — Bust 40\")" or "M (Size 36)"
  const womenLabelMatch = upper.match(/^(XS|S|M|L|XL|XXL|3XL|4XL|5XL|6XL)\b/);
  if (womenLabelMatch && womenLabelMatch[1]) {
    return womenLabelMatch[1];
  }

  // 6. Bare numeric inputs (e.g. "26", "22", "32", "36")
  if (/^\d{2}$/.test(raw)) {
    const num = raw;
    if (isKidsDivision) {
      if (CANONICAL_KIDS_SIZES.has(`k${num}`)) return `k${num}`;
    }
    if (isWomenDivision) {
      // Map bust sizes to standard women alpha if applicable
      const bustMap: Record<string, string> = {
        '32': 'XS',
        '34': 'S',
        '36': 'M',
        '38': 'L',
        '40': 'XL',
        '42': 'XXL',
        '44': '3XL',
        '46': '4XL',
        '48': '5XL',
        '50': '6XL',
      };
      if (bustMap[num]) return bustMap[num];
      if (CANONICAL_NUMERIC_SIZES.has(num)) return num;
    }

    // Ambiguous division:
    // Numbers 12..26 are predominantly kids even sizes in Indian ethnic wear
    const n = parseInt(num, 10);
    if (n >= 12 && n <= 26 && n % 2 === 0) {
      return `k${num}`;
    }
    if (CANONICAL_NUMERIC_SIZES.has(num)) {
      return num;
    }
  }

  // 7. Check if canonical
  if (CANONICAL_KIDS_SIZES.has(lower)) return lower;
  if (CANONICAL_WOMEN_SIZES.has(upper)) return upper;
  if (CANONICAL_NUMERIC_SIZES.has(raw)) return raw;

  return null;
}

export function isValidCanonicalSize(size: string | null | undefined): boolean {
  if (!size) return false;
  return (
    CANONICAL_KIDS_SIZES.has(size) ||
    CANONICAL_WOMEN_SIZES.has(size) ||
    CANONICAL_NUMERIC_SIZES.has(size)
  );
}
