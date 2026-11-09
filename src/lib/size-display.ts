import { KIDS_MASTER_SIZES, WOMEN_MASTER_SIZES } from '@/data/masterSizes';

export interface FormattedCardSize {
  raw: string;
  label: string; // Compact readable label e.g. "S", "M", "Size 22", "4 yrs"
  inStock: boolean;
  sizeParam: string; // The URL query param e.g. "k22" or "M"
}

// Build fast lookup table
const KIDS_LOOKUP = new Map<string, { label: string; ageRange?: string; numericSize?: string }>();
KIDS_MASTER_SIZES.forEach((s) => {
  KIDS_LOOKUP.set(s.code.toLowerCase(), {
    label: `Size ${s.numeric_size || s.code.replace(/\D/g, '')}`,
    ageRange: s.age_range,
    numericSize: s.numeric_size,
  });
});

export function formatCardSize(
  rawSize: string | { size: string; inStock?: boolean; stock?: number },
  target?: string
): FormattedCardSize {
  const sizeStr = typeof rawSize === 'string' ? rawSize : rawSize.size || '';
  const inStock = typeof rawSize === 'string' ? true : (rawSize.inStock ?? ((rawSize.stock ?? 1) > 0));

  const clean = sizeStr.trim();
  const lower = clean.toLowerCase();

  // 1. Check Kids size
  if (lower.startsWith('k') && /k\d+/.test(lower)) {
    const num = lower.replace(/\D/g, '');
    const meta = KIDS_LOOKUP.get(lower);
    return {
      raw: clean,
      label: meta?.numericSize ? `${meta.numericSize}` : num,
      inStock,
      sizeParam: clean,
    };
  }

  // 2. Check if numeric for kids
  if (/^\d{2}$/.test(clean) && (target === 'kids' || Number(clean) <= 30)) {
    return {
      raw: clean,
      label: clean,
      inStock,
      sizeParam: clean,
    };
  }

  // 3. Women alpha sizes
  const womenUpper = clean.toUpperCase();
  if (['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL', '6XL', 'FS'].includes(womenUpper)) {
    return {
      raw: clean,
      label: womenUpper === '2XL' ? 'XXL' : womenUpper,
      inStock,
      sizeParam: clean,
    };
  }

  if (womenUpper === 'FREE SIZE') {
    return {
      raw: clean,
      label: 'FS',
      inStock,
      sizeParam: clean,
    };
  }

  return {
    raw: clean,
    label: clean,
    inStock,
    sizeParam: clean,
  };
}

