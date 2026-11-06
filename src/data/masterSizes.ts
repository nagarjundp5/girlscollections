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
 * Standard Indian Kids Size Chart (Bangalore / Commercial St / Traditional Ethnic Wear)
 * Scaled from Newborn (0-3M, 16" Chest) through Teens (14-15Y, 34" Chest).
 */
export const KIDS_MASTER_SIZES: MasterSizeDefinition[] = [
  // Newborn & Infant Sizing
  { division: 'kids', code: '0-3M', label: '0–3 Months (16–17" Chest, 55–61 cm)', numeric_size: '000', age_range: '0-3M', sort_order: 20, measurements: { chest_in: '16-17', height_cm: '55-61', weight_kg: '3.5-5.5', length_in: '14', chest_cm: '41-43' } },
  { division: 'kids', code: '3-6M', label: '3–6 Months (17–18" Chest, 61–67 cm)', numeric_size: '00', age_range: '3-6M', sort_order: 21, measurements: { chest_in: '17-18', height_cm: '61-67', weight_kg: '5.5-7.5', length_in: '15', chest_cm: '43-46' } },
  { division: 'kids', code: '6-12M', label: '6–12 Months (18–19" Chest, 67–75 cm)', numeric_size: '1', age_range: '6-12M', sort_order: 22, measurements: { chest_in: '18-19', height_cm: '67-75', weight_kg: '7.5-9.5', length_in: '17', chest_cm: '46-48' } },
  
  // Toddler Sizing
  { division: 'kids', code: '1-2Y', label: '1–2 Years (19–20" Chest, 75–86 cm)', numeric_size: '16', age_range: '1-2Y', sort_order: 23, measurements: { chest_in: '19-20', height_cm: '75-86', weight_kg: '9.5-12', length_in: '20', chest_cm: '48-51' } },
  { division: 'kids', code: '2-3Y', label: '2–3 Years (20–21" Chest, 86–96 cm)', numeric_size: '18', age_range: '2-3Y', sort_order: 24, measurements: { chest_in: '20-21', height_cm: '86-96', weight_kg: '12-14.5', length_in: '22', chest_cm: '51-53' } },
  { division: 'kids', code: '3-4Y', label: '3–4 Years (21–22" Chest, 96–104 cm)', numeric_size: '20', age_range: '3-4Y', sort_order: 25, measurements: { chest_in: '21-22', height_cm: '96-104', weight_kg: '14.5-17', length_in: '24', chest_cm: '53-56' } },
  
  // Young Children Sizing (Combined & Granular)
  { division: 'kids', code: '4-6Y', label: '4–6 Years (22–24" Chest, 104–116 cm)', numeric_size: '24', age_range: '4-6Y', sort_order: 26, measurements: { chest_in: '22-24', height_cm: '104-116', weight_kg: '17-21', length_in: '27', chest_cm: '56-61' } },
  { division: 'kids', code: '6-8Y', label: '6–8 Years (24–26" Chest, 116–128 cm)', numeric_size: '28', age_range: '6-8Y', sort_order: 27, measurements: { chest_in: '24-26', height_cm: '116-128', weight_kg: '21-26', length_in: '31', chest_cm: '61-66' } },
  { division: 'kids', code: '8-10Y', label: '8–10 Years (26–28" Chest, 128–140 cm)', numeric_size: '30', age_range: '8-10Y', sort_order: 28, measurements: { chest_in: '26-28', height_cm: '128-140', weight_kg: '26-33', length_in: '35', chest_cm: '66-71' } },
  
  // Pre-Teens & Teens Sizing
  { division: 'kids', code: '10-12Y', label: '10–12 Years (28–30" Chest, 140–152 cm)', numeric_size: '34', age_range: '10-12Y', sort_order: 29, measurements: { chest_in: '28-30', height_cm: '140-152', weight_kg: '33-42', length_in: '39', chest_cm: '71-76' } },
  { division: 'kids', code: '12-14Y', label: '12–14 Years (30–32" Chest, 152–162 cm)', numeric_size: '38', age_range: '12-14Y', sort_order: 30, measurements: { chest_in: '30-32', height_cm: '152-162', weight_kg: '42-50', length_in: '43', chest_cm: '76-81' } },
  { division: 'kids', code: '14-15Y', label: '14–15 Years (32–34" Chest, 162–170 cm)', numeric_size: '42', age_range: '14-15Y', sort_order: 31, measurements: { chest_in: '32-34', height_cm: '162-170', weight_kg: '50-58', length_in: '46', chest_cm: '81-86' } },

  // Supplementary Granular Single-Year Tags (for exact inventory tracking)
  { division: 'kids', code: '4-5Y', label: '4–5 Years (Size 22)', numeric_size: '22', age_range: '4-5Y', sort_order: 32, measurements: { chest_in: '22-23', height_cm: '104-110', weight_kg: '16-18', length_in: '26' } },
  { division: 'kids', code: '5-6Y', label: '5–6 Years (Size 24)', numeric_size: '24', age_range: '5-6Y', sort_order: 33, measurements: { chest_in: '23-24', height_cm: '110-116', weight_kg: '18-21', length_in: '28' } },
  { division: 'kids', code: '6-7Y', label: '6–7 Years (Size 26)', numeric_size: '26', age_range: '6-7Y', sort_order: 34, measurements: { chest_in: '24-25', height_cm: '116-122', weight_kg: '21-23', length_in: '30' } },
  { division: 'kids', code: '7-8Y', label: '7–8 Years (Size 28)', numeric_size: '28', age_range: '7-8Y', sort_order: 35, measurements: { chest_in: '25-26', height_cm: '122-128', weight_kg: '23-26', length_in: '32' } },
  { division: 'kids', code: '8-9Y', label: '8–9 Years (Size 30)', numeric_size: '30', age_range: '8-9Y', sort_order: 36, measurements: { chest_in: '26-27', height_cm: '128-134', weight_kg: '26-29', length_in: '34' } },
  { division: 'kids', code: '9-10Y', label: '9–10 Years (Size 32)', numeric_size: '32', age_range: '9-10Y', sort_order: 37, measurements: { chest_in: '27-28', height_cm: '134-140', weight_kg: '29-33', length_in: '36' } },
  { division: 'kids', code: '10-11Y', label: '10–11 Years (Size 34)', numeric_size: '34', age_range: '10-11Y', sort_order: 38, measurements: { chest_in: '28-29', height_cm: '140-146', weight_kg: '33-37', length_in: '38' } },
  { division: 'kids', code: '11-12Y', label: '11–12 Years (Size 36)', numeric_size: '36', age_range: '11-12Y', sort_order: 39, measurements: { chest_in: '29-30', height_cm: '146-152', weight_kg: '37-42', length_in: '40' } },
  { division: 'kids', code: '12-13Y', label: '12–13 Years (Size 38)', numeric_size: '38', age_range: '12-13Y', sort_order: 40, measurements: { chest_in: '30-31', height_cm: '152-158', weight_kg: '42-46', length_in: '42' } },
  { division: 'kids', code: '13-14Y', label: '13–14 Years (Size 40)', numeric_size: '40', age_range: '13-14Y', sort_order: 41, measurements: { chest_in: '31-32', height_cm: '158-164', weight_kg: '46-50', length_in: '44' } },
  { division: 'kids', code: '15-16Y', label: '15–16 Years (Size 44)', numeric_size: '44', age_range: '15-16Y', sort_order: 42, measurements: { chest_in: '34-35', height_cm: '168-175', weight_kg: '55-62', length_in: '48' } },
];

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
