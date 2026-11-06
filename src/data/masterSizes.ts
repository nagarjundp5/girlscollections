export interface MasterSizeDefinition {
  division: 'women' | 'kids';
  code: string;
  label: string;
  numeric_size?: string;
  age_range?: string;
  sort_order: number;
  measurements: {
    chest_in?: string;
    waist_in?: string;
    hip_in?: string;
    length_in?: string;
    shoulder_in?: string;
    height_cm?: string;
    chest_cm?: string;
    waist_cm?: string;
    hip_cm?: string;
    length_cm?: string;
    weight_kg?: string;
  };
}

/**
 * Standard Indian Women's Size Chart (Bangalore / Commercial St / Top Indian D2C Brands)
 * Covers Standard Retail (XS-XXL), Extended (3XL), and Plus Size (4XL-6XL), plus Free Size.
 */
export const WOMEN_MASTER_SIZES: MasterSizeDefinition[] = [
  { division: 'women', code: 'XS', label: 'XS (Size 32 — Bust 32")', numeric_size: '32', sort_order: 1, measurements: { chest_in: '32', waist_in: '26', hip_in: '34', length_in: '44', shoulder_in: '13.5', chest_cm: '81', waist_cm: '66', hip_cm: '86', length_cm: '112' } },
  { division: 'women', code: 'S', label: 'S (Size 34 — Bust 34")', numeric_size: '34', sort_order: 2, measurements: { chest_in: '34', waist_in: '28', hip_in: '36', length_in: '45', shoulder_in: '14.0', chest_cm: '86', waist_cm: '71', hip_cm: '91', length_cm: '114' } },
  { division: 'women', code: 'M', label: 'M (Size 36 — Bust 36")', numeric_size: '36', sort_order: 3, measurements: { chest_in: '36', waist_in: '30', hip_in: '38', length_in: '45', shoulder_in: '14.5', chest_cm: '91', waist_cm: '76', hip_cm: '97', length_cm: '114' } },
  { division: 'women', code: 'L', label: 'L (Size 38 — Bust 38")', numeric_size: '38', sort_order: 4, measurements: { chest_in: '38', waist_in: '32', hip_in: '40', length_in: '46', shoulder_in: '15.0', chest_cm: '96', waist_cm: '81', hip_cm: '102', length_cm: '117' } },
  { division: 'women', code: 'XL', label: 'XL (Size 40 — Bust 40")', numeric_size: '40', sort_order: 5, measurements: { chest_in: '40', waist_in: '34', hip_in: '42', length_in: '46', shoulder_in: '15.5', chest_cm: '101', waist_cm: '86', hip_cm: '107', length_cm: '117' } },
  { division: 'women', code: 'XXL', label: 'XXL (Size 42 — Bust 42")', numeric_size: '42', sort_order: 6, measurements: { chest_in: '42', waist_in: '36', hip_in: '44', length_in: '46', shoulder_in: '16.0', chest_cm: '107', waist_cm: '91', hip_cm: '112', length_cm: '117' } },
  { division: 'women', code: '3XL', label: '3XL / XXXL (Size 44 — Bust 44")', numeric_size: '44', sort_order: 7, measurements: { chest_in: '44', waist_in: '38', hip_in: '46', length_in: '46', shoulder_in: '16.5', chest_cm: '112', waist_cm: '97', hip_cm: '117', length_cm: '117' } },
  
  // Plus Size Additions
  { division: 'women', code: '4XL', label: '4XL (Size 46 — Bust 46" Plus)', numeric_size: '46', sort_order: 8, measurements: { chest_in: '46', waist_in: '40', hip_in: '48', length_in: '46', shoulder_in: '17.0', chest_cm: '117', waist_cm: '102', hip_cm: '122', length_cm: '117' } },
  { division: 'women', code: '5XL', label: '5XL (Size 48 — Bust 48" Plus)', numeric_size: '48', sort_order: 9, measurements: { chest_in: '48', waist_in: '42', hip_in: '50', length_in: '46', shoulder_in: '17.5', chest_cm: '122', waist_cm: '107', hip_cm: '127', length_cm: '117' } },
  { division: 'women', code: '6XL', label: '6XL (Size 50 — Bust 50" Plus)', numeric_size: '50', sort_order: 10, measurements: { chest_in: '50', waist_in: '44', hip_in: '52', length_in: '46', shoulder_in: '18.0', chest_cm: '127', waist_cm: '112', hip_cm: '132', length_cm: '117' } },
  
  // Free Size / Semi-stitched
  { division: 'women', code: 'FREE SIZE', label: 'Free Size (Semi-Stitched / Adjustable 32-44")', numeric_size: 'FS', sort_order: 11, measurements: { chest_in: '32-44', waist_in: '26-40', hip_in: '34-46', length_in: '46', shoulder_in: '15.0' } },
];

/**
 * Numeric Indian Garment Sizes (Even numbers 12 to 40)
 * Standard even sizing (12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40)
 * Widely used for ready-made kurtis, ethnic sets, frocks, lehengas & blouses.
 */
export const NUMERIC_MASTER_SIZES: MasterSizeDefinition[] = [
  { division: 'kids', code: '12', label: 'Size 12', numeric_size: '12', sort_order: 50, measurements: { chest_in: '12' } },
  { division: 'kids', code: '14', label: 'Size 14', numeric_size: '14', sort_order: 51, measurements: { chest_in: '14' } },
  { division: 'kids', code: '16', label: 'Size 16', numeric_size: '16', sort_order: 52, measurements: { chest_in: '16' } },
  { division: 'kids', code: '18', label: 'Size 18', numeric_size: '18', sort_order: 53, measurements: { chest_in: '18' } },
  { division: 'kids', code: '20', label: 'Size 20', numeric_size: '20', sort_order: 54, measurements: { chest_in: '20' } },
  { division: 'kids', code: '22', label: 'Size 22', numeric_size: '22', sort_order: 55, measurements: { chest_in: '22' } },
  { division: 'kids', code: '24', label: 'Size 24', numeric_size: '24', sort_order: 56, measurements: { chest_in: '24' } },
  { division: 'kids', code: '26', label: 'Size 26', numeric_size: '26', sort_order: 57, measurements: { chest_in: '26' } },
  { division: 'women', code: '28', label: 'Size 28', numeric_size: '28', sort_order: 58, measurements: { chest_in: '28' } },
  { division: 'women', code: '30', label: 'Size 30', numeric_size: '30', sort_order: 59, measurements: { chest_in: '30' } },
  { division: 'women', code: '32', label: 'Size 32', numeric_size: '32', sort_order: 60, measurements: { chest_in: '32' } },
  { division: 'women', code: '34', label: 'Size 34', numeric_size: '34', sort_order: 61, measurements: { chest_in: '34' } },
  { division: 'women', code: '36', label: 'Size 36', numeric_size: '36', sort_order: 62, measurements: { chest_in: '36' } },
  { division: 'women', code: '38', label: 'Size 38', numeric_size: '38', sort_order: 63, measurements: { chest_in: '38' } },
  { division: 'women', code: '40', label: 'Size 40', numeric_size: '40', sort_order: 64, measurements: { chest_in: '40' } },
];

/**
 * Updated Master Kids Size Chart
 * Stable keys: k12, k14, k16, k18, k20, k22, k24, k26, k28, k30, k32, k34, k36, k38, k40.
 * Rendered everywhere as "Size 22 (4 years)".
 */
export const KIDS_MASTER_SIZES: MasterSizeDefinition[] = [
  { division: 'kids', code: 'k12', label: 'Size 12 (3-9 months)', numeric_size: '12', age_range: '3-9 months', sort_order: 10, measurements: { chest_in: '16-17', length_in: '14' } },
  { division: 'kids', code: 'k14', label: 'Size 14 (1 year)', numeric_size: '14', age_range: '1 year', sort_order: 11, measurements: { chest_in: '18-19', length_in: '16' } },
  { division: 'kids', code: 'k16', label: 'Size 16 (1.5 years)', numeric_size: '16', age_range: '1.5 years', sort_order: 12, measurements: { chest_in: '19-20', length_in: '18' } },
  { division: 'kids', code: 'k18', label: 'Size 18 (2 years)', numeric_size: '18', age_range: '2 years', sort_order: 13, measurements: { chest_in: '20-21', length_in: '20' } },
  { division: 'kids', code: 'k20', label: 'Size 20 (3 years)', numeric_size: '20', age_range: '3 years', sort_order: 14, measurements: { chest_in: '21-22', length_in: '22' } },
  { division: 'kids', code: 'k22', label: 'Size 22 (4 years)', numeric_size: '22', age_range: '4 years', sort_order: 15, measurements: { chest_in: '22-23', length_in: '24' } },
  { division: 'kids', code: 'k24', label: 'Size 24 (5 years)', numeric_size: '24', age_range: '5 years', sort_order: 16, measurements: { chest_in: '23-24', length_in: '26' } },
  { division: 'kids', code: 'k26', label: 'Size 26 (6 years)', numeric_size: '26', age_range: '6 years', sort_order: 17, measurements: { chest_in: '24-25', length_in: '28' } },
  { division: 'kids', code: 'k28', label: 'Size 28 (7 years)', numeric_size: '28', age_range: '7 years', sort_order: 18, measurements: { chest_in: '25-26', length_in: '30' } },
  { division: 'kids', code: 'k30', label: 'Size 30 (8 years)', numeric_size: '30', age_range: '8 years', sort_order: 19, measurements: { chest_in: '26-27', length_in: '32' } },
  { division: 'kids', code: 'k32', label: 'Size 32 (9 years)', numeric_size: '32', age_range: '9 years', sort_order: 20, measurements: { chest_in: '27-28', length_in: '34' } },
  { division: 'kids', code: 'k34', label: 'Size 34 (10 years)', numeric_size: '34', age_range: '10 years', sort_order: 21, measurements: { chest_in: '28-29', length_in: '36' } },
  { division: 'kids', code: 'k36', label: 'Size 36 (11 years)', numeric_size: '36', age_range: '11 years', sort_order: 22, measurements: { chest_in: '29-30', length_in: '38' } },
  { division: 'kids', code: 'k38', label: 'Size 38 (13-14 years)', numeric_size: '38', age_range: '13-14 years', sort_order: 23, measurements: { chest_in: '30-32', length_in: '42' } },
  { division: 'kids', code: 'k40', label: 'Size 40 (15-17 years)', numeric_size: '40', age_range: '15-17 years', sort_order: 24, measurements: { chest_in: '32-34', length_in: '46' } },
];

export const LEGACY_KIDS_SIZE_MAP: Record<string, string> = {
  '0-3M': 'k12',
  '3-6M': 'k12',
  '6-12M': 'k14',
  '1-2Y': 'k16',
  '2-3Y': 'k18',
  '3-4Y': 'k20',
  '4-5Y': 'k22',
  '5-6Y': 'k24',
  '6-7Y': 'k26',
  '7-8Y': 'k28',
  '8-9Y': 'k30',
  '8-10Y': 'k30',
  '9-10Y': 'k32',
  '10-11Y': 'k34',
  '10-12Y': 'k34',
  '11-12Y': 'k36',
  '12-13Y': 'k38',
  '12-14Y': 'k38',
  '13-14Y': 'k38',
  '14-15Y': 'k38',
  '15-16Y': 'k40',
  '12': 'k12',
  '14': 'k14',
  '16': 'k16',
  '18': 'k18',
  '20': 'k20',
  '22': 'k22',
  '24': 'k24',
  '26': 'k26',
  '28': 'k28',
  '30': 'k30',
  '32': 'k32',
  '34': 'k34',
  '36': 'k36',
  '38': 'k38',
  '40': 'k40',
};

export function mapLegacyKidsSize(legacyCode: string): string {
  return LEGACY_KIDS_SIZE_MAP[legacyCode] || legacyCode;
}

export function getSizeLabel(code: string): string {
  if (!code) return '';
  const kidsMatch = KIDS_MASTER_SIZES.find((s) => s.code === code);
  if (kidsMatch) return kidsMatch.label;
  const womenMatch = WOMEN_MASTER_SIZES.find((s) => s.code === code);
  if (womenMatch) return womenMatch.label;
  const numMatch = NUMERIC_MASTER_SIZES.find((s) => s.code === code);
  if (numMatch) return numMatch.label;
  return code;
}

export const ALL_MASTER_SIZES: MasterSizeDefinition[] = [
  ...WOMEN_MASTER_SIZES,
  ...KIDS_MASTER_SIZES,
  ...NUMERIC_MASTER_SIZES,
];

export const MASTER_ATTRIBUTES_SEED: Array<{ type: string; name: string; slug: string; sort_order: number; hex_code?: string }> = [
  // Occasions
  { type: 'occasion', name: 'Festive Wear', slug: 'festive-wear', sort_order: 1 },
  { type: 'occasion', name: 'Wedding Guest', slug: 'wedding-guest', sort_order: 2 },
  { type: 'occasion', name: 'Bridal & Trousseau', slug: 'bridal-trousseau', sort_order: 3 },
  { type: 'occasion', name: 'Reception & Cocktail', slug: 'reception-cocktail', sort_order: 4 },
  { type: 'occasion', name: 'Haldi & Mehendi', slug: 'haldi-mehendi', sort_order: 5 },
  { type: 'occasion', name: 'Pooja & Traditional', slug: 'pooja-traditional', sort_order: 6 },
  { type: 'occasion', name: 'Sangeet & Dance', slug: 'sangeet-dance', sort_order: 7 },
  { type: 'occasion', name: 'Casual Festive', slug: 'casual-festive', sort_order: 8 },
  { type: 'occasion', name: 'Party Wear', slug: 'party-wear', sort_order: 9 },

  // Fabrics
  { type: 'fabric', name: 'Chanderi Silk', slug: 'chanderi-silk', sort_order: 1 },
  { type: 'fabric', name: 'Pure Georgette', slug: 'pure-georgette', sort_order: 2 },
  { type: 'fabric', name: 'Silk Organza', slug: 'silk-organza', sort_order: 3 },
  { type: 'fabric', name: 'Banarasi Brocade', slug: 'banarasi-brocade', sort_order: 4 },
  { type: 'fabric', name: 'Raw Silk', slug: 'raw-silk', sort_order: 5 },
  { type: 'fabric', name: 'Soft Rayon', slug: 'soft-rayon', sort_order: 6 },
  { type: 'fabric', name: 'Luxe Velvet', slug: 'luxe-velvet', sort_order: 7 },
  { type: 'fabric', name: 'Cotton Mulmul', slug: 'cotton-mulmul', sort_order: 8 },
  { type: 'fabric', name: 'Tussar Silk', slug: 'tussar-silk', sort_order: 9 },
  { type: 'fabric', name: 'Crepe Silk', slug: 'crepe-silk', sort_order: 10 },

  // Style / Silhouette
  { type: 'style', name: 'Anarkali Set', slug: 'anarkali-set', sort_order: 1 },
  { type: 'style', name: 'A-Line Kurti', slug: 'a-line-kurti', sort_order: 2 },
  { type: 'style', name: 'Straight Cut Suit', slug: 'straight-cut-suit', sort_order: 3 },
  { type: 'style', name: 'Flared Lehenga', slug: 'flared-lehenga', sort_order: 4 },
  { type: 'style', name: 'Peplum & Sharara', slug: 'peplum-sharara', sort_order: 5 },
  { type: 'style', name: 'Kalidar Gown', slug: 'kalidar-gown', sort_order: 6 },
  { type: 'style', name: 'Tiered Frock (Kids)', slug: 'tiered-frock', sort_order: 7 },
  { type: 'style', name: 'Pattu Pavadai (Kids)', slug: 'pattu-pavadai', sort_order: 8 },
  { type: 'style', name: 'Angrakha Style', slug: 'angrakha-style', sort_order: 9 },

  // Work Type / Craft
  { type: 'work_type', name: 'Handwoven Zari', slug: 'handwoven-zari', sort_order: 1 },
  { type: 'work_type', name: 'Gotapatti Border Work', slug: 'gotapatti-border', sort_order: 2 },
  { type: 'work_type', name: 'Real Mirror Embroidery', slug: 'real-mirror-embroidery', sort_order: 3 },
  { type: 'work_type', name: 'Chikankari Thread Work', slug: 'chikankari-thread', sort_order: 4 },
  { type: 'work_type', name: 'Micro-Sequin Shimmer', slug: 'micro-sequin', sort_order: 5 },
  { type: 'work_type', name: 'Hand Block Print', slug: 'hand-block-print', sort_order: 6 },
  { type: 'work_type', name: 'Zardozi Handwork', slug: 'zardozi-handwork', sort_order: 7 },
  { type: 'work_type', name: 'Dori & Resham Work', slug: 'dori-resham', sort_order: 8 },

  // Colours (with hex codes for filter swatches)
  { type: 'colour', name: 'Red', slug: 'red', sort_order: 1, hex_code: '#D72638' },
  { type: 'colour', name: 'Pink', slug: 'pink', sort_order: 2, hex_code: '#FF69B4' },
  { type: 'colour', name: 'Blue', slug: 'blue', sort_order: 3, hex_code: '#1E6FAE' },
  { type: 'colour', name: 'Green', slug: 'green', sort_order: 4, hex_code: '#2E8B57' },
  { type: 'colour', name: 'Yellow', slug: 'yellow', sort_order: 5, hex_code: '#FFD700' },
  { type: 'colour', name: 'Orange', slug: 'orange', sort_order: 6, hex_code: '#FF8C00' },
  { type: 'colour', name: 'Purple', slug: 'purple', sort_order: 7, hex_code: '#7B2FBE' },
  { type: 'colour', name: 'Maroon', slug: 'maroon', sort_order: 8, hex_code: '#800000' },
  { type: 'colour', name: 'Navy', slug: 'navy', sort_order: 9, hex_code: '#001F5B' },
  { type: 'colour', name: 'Gold', slug: 'gold', sort_order: 10, hex_code: '#CFB53B' },
  { type: 'colour', name: 'White', slug: 'white', sort_order: 11, hex_code: '#FFFFFF' },
  { type: 'colour', name: 'Black', slug: 'black', sort_order: 12, hex_code: '#1C1417' },
  { type: 'colour', name: 'Beige', slug: 'beige', sort_order: 13, hex_code: '#F5F0E6' },
  { type: 'colour', name: 'Peach', slug: 'peach', sort_order: 14, hex_code: '#FFCBA4' },
  { type: 'colour', name: 'Mint', slug: 'mint', sort_order: 15, hex_code: '#98FF98' },
  { type: 'colour', name: 'Lavender', slug: 'lavender', sort_order: 16, hex_code: '#C9A9E9' },
  { type: 'colour', name: 'Turquoise', slug: 'turquoise', sort_order: 17, hex_code: '#40E0D0' },
  { type: 'colour', name: 'Rust', slug: 'rust', sort_order: 18, hex_code: '#B7410E' },
  { type: 'colour', name: 'Teal', slug: 'teal', sort_order: 19, hex_code: '#008080' },
  { type: 'colour', name: 'Multi', slug: 'multi', sort_order: 20, hex_code: '#CF84DF' },
];
