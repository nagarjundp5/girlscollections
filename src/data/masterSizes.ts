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
    chest_cm?: string;
    waist_cm?: string;
    hip_cm?: string;
    length_cm?: string;
  };
}

export const WOMEN_MASTER_SIZES: MasterSizeDefinition[] = [
  { division: 'women', code: 'XS', label: 'XS (Bust 32")', numeric_size: '32', sort_order: 1, measurements: { chest_in: '32-33', waist_in: '26-27', hip_in: '35-36', length_in: '44', shoulder_in: '13.5', chest_cm: '81-84', waist_cm: '66-69', hip_cm: '89-91', length_cm: '112' } },
  { division: 'women', code: 'S', label: 'S (Bust 34")', numeric_size: '34', sort_order: 2, measurements: { chest_in: '34-35', waist_in: '28-29', hip_in: '37-38', length_in: '45', shoulder_in: '14.0', chest_cm: '86-89', waist_cm: '71-74', hip_cm: '94-97', length_cm: '114' } },
  { division: 'women', code: 'M', label: 'M (Bust 36")', numeric_size: '36', sort_order: 3, measurements: { chest_in: '36-37', waist_in: '30-31', hip_in: '39-40', length_in: '45', shoulder_in: '14.5', chest_cm: '91-94', waist_cm: '76-79', hip_cm: '99-102', length_cm: '114' } },
  { division: 'women', code: 'L', label: 'L (Bust 38")', numeric_size: '38', sort_order: 4, measurements: { chest_in: '38-39', waist_in: '32-33', hip_in: '41-42', length_in: '46', shoulder_in: '15.0', chest_cm: '96-99', waist_cm: '81-84', hip_cm: '104-107', length_cm: '117' } },
  { division: 'women', code: 'XL', label: 'XL (Bust 40")', numeric_size: '40', sort_order: 5, measurements: { chest_in: '40-41', waist_in: '34-35', hip_in: '43-44', length_in: '46', shoulder_in: '15.5', chest_cm: '101-104', waist_cm: '86-89', hip_cm: '109-112', length_cm: '117' } },
  { division: 'women', code: 'XXL', label: 'XXL (Bust 42")', numeric_size: '42', sort_order: 6, measurements: { chest_in: '42-43', waist_in: '36-37', hip_in: '45-46', length_in: '46', shoulder_in: '16.0', chest_cm: '107-109', waist_cm: '91-94', hip_cm: '114-117', length_cm: '117' } },
  { division: 'women', code: '3XL', label: '3XL (Bust 44")', numeric_size: '44', sort_order: 7, measurements: { chest_in: '44-45', waist_in: '38-39', hip_in: '47-48', length_in: '46', shoulder_in: '16.5', chest_cm: '112-114', waist_cm: '96-99', hip_cm: '119-122', length_cm: '117' } },
  { division: 'women', code: '4XL', label: '4XL (Bust 46")', numeric_size: '46', sort_order: 8, measurements: { chest_in: '46-47', waist_in: '40-41', hip_in: '49-50', length_in: '46', shoulder_in: '17.0', chest_cm: '117-119', waist_cm: '101-104', hip_cm: '124-127', length_cm: '117' } },
  { division: 'women', code: '5XL', label: '5XL (Bust 48")', numeric_size: '48', sort_order: 9, measurements: { chest_in: '48-50', waist_in: '42-44', hip_in: '51-53', length_in: '46', shoulder_in: '17.5', chest_cm: '122-127', waist_cm: '107-112', hip_cm: '130-135', length_cm: '117' } },
  { division: 'women', code: 'FREE_SIZE', label: 'Free Size (Semi-Stitched / Adjustable)', numeric_size: 'FS', sort_order: 10, measurements: { chest_in: '32-44', waist_in: '26-40', hip_in: '35-46', length_in: '46', shoulder_in: '15.0' } },
];

export const KIDS_MASTER_SIZES: MasterSizeDefinition[] = [
  { division: 'kids', code: '0-3M', label: '0-3 Months (Size 000)', numeric_size: '000', age_range: '0-3M', sort_order: 20, measurements: { chest_in: '16-17', waist_in: '16-17', length_in: '14', chest_cm: '41-43', waist_cm: '41-43', length_cm: '36' } },
  { division: 'kids', code: '3-6M', label: '3-6 Months (Size 00)', numeric_size: '00', age_range: '3-6M', sort_order: 21, measurements: { chest_in: '17-18', waist_in: '17-18', length_in: '15', chest_cm: '43-46', waist_cm: '43-46', length_cm: '38' } },
  { division: 'kids', code: '6-9M', label: '6-9 Months (Size 0)', numeric_size: '0', age_range: '6-9M', sort_order: 22, measurements: { chest_in: '18-19', waist_in: '18-19', length_in: '16', chest_cm: '46-48', waist_cm: '46-48', length_cm: '41' } },
  { division: 'kids', code: '9-12M', label: '9-12 Months (Size 1)', numeric_size: '1', age_range: '9-12M', sort_order: 23, measurements: { chest_in: '19-20', waist_in: '19-20', length_in: '18', chest_cm: '48-51', waist_cm: '48-51', length_cm: '46' } },
  { division: 'kids', code: '1-2Y', label: '1-2 Years (Size 16)', numeric_size: '16', age_range: '1-2Y', sort_order: 24, measurements: { chest_in: '20-21', waist_in: '19-20', length_in: '20', chest_cm: '51-53', waist_cm: '48-51', length_cm: '51' } },
  { division: 'kids', code: '2-3Y', label: '2-3 Years (Size 18)', numeric_size: '18', age_range: '2-3Y', sort_order: 25, measurements: { chest_in: '21-22', waist_in: '20-21', length_in: '22', chest_cm: '53-56', waist_cm: '51-53', length_cm: '56' } },
  { division: 'kids', code: '3-4Y', label: '3-4 Years (Size 20)', numeric_size: '20', age_range: '3-4Y', sort_order: 26, measurements: { chest_in: '22-23', waist_in: '21-22', length_in: '24', chest_cm: '56-58', waist_cm: '53-56', length_cm: '61' } },
  { division: 'kids', code: '4-5Y', label: '4-5 Years (Size 22)', numeric_size: '22', age_range: '4-5Y', sort_order: 27, measurements: { chest_in: '23-24', waist_in: '22-23', length_in: '26', chest_cm: '58-61', waist_cm: '56-58', length_cm: '66' } },
  { division: 'kids', code: '5-6Y', label: '5-6 Years (Size 24)', numeric_size: '24', age_range: '5-6Y', sort_order: 28, measurements: { chest_in: '24-25', waist_in: '23-24', length_in: '28', chest_cm: '61-64', waist_cm: '58-61', length_cm: '71' } },
  { division: 'kids', code: '6-7Y', label: '6-7 Years (Size 26)', numeric_size: '26', age_range: '6-7Y', sort_order: 29, measurements: { chest_in: '25-26', waist_in: '24-25', length_in: '30', chest_cm: '64-66', waist_cm: '61-64', length_cm: '76' } },
  { division: 'kids', code: '7-8Y', label: '7-8 Years (Size 28)', numeric_size: '28', age_range: '7-8Y', sort_order: 30, measurements: { chest_in: '26-27', waist_in: '25-26', length_in: '32', chest_cm: '66-69', waist_cm: '64-66', length_cm: '81' } },
  { division: 'kids', code: '8-9Y', label: '8-9 Years (Size 30)', numeric_size: '30', age_range: '8-9Y', sort_order: 31, measurements: { chest_in: '27-28', waist_in: '26-27', length_in: '34', chest_cm: '69-71', waist_cm: '66-69', length_cm: '86' } },
  { division: 'kids', code: '9-10Y', label: '9-10 Years (Size 32)', numeric_size: '32', age_range: '9-10Y', sort_order: 32, measurements: { chest_in: '28-29', waist_in: '27-28', length_in: '36', chest_cm: '71-74', waist_cm: '69-71', length_cm: '91' } },
  { division: 'kids', code: '10-11Y', label: '10-11 Years (Size 34)', numeric_size: '34', age_range: '10-11Y', sort_order: 33, measurements: { chest_in: '29-30', waist_in: '28-29', length_in: '38', chest_cm: '74-76', waist_cm: '71-74', length_cm: '97' } },
  { division: 'kids', code: '11-12Y', label: '11-12 Years (Size 36)', numeric_size: '36', age_range: '11-12Y', sort_order: 34, measurements: { chest_in: '30-31', waist_in: '29-30', length_in: '40', chest_cm: '76-79', waist_cm: '74-76', length_cm: '102' } },
  { division: 'kids', code: '12-13Y', label: '12-13 Years (Size 38)', numeric_size: '38', age_range: '12-13Y', sort_order: 35, measurements: { chest_in: '31-32', waist_in: '30-31', length_in: '42', chest_cm: '79-81', waist_cm: '76-79', length_cm: '107' } },
  { division: 'kids', code: '13-14Y', label: '13-14 Years (Size 40)', numeric_size: '40', age_range: '13-14Y', sort_order: 36, measurements: { chest_in: '32-33', waist_in: '31-32', length_in: '44', chest_cm: '81-84', waist_cm: '79-81', length_cm: '112' } },
  { division: 'kids', code: '14-15Y', label: '14-15 Years (Size 42)', numeric_size: '42', age_range: '14-15Y', sort_order: 37, measurements: { chest_in: '33-34', waist_in: '32-33', length_in: '46', chest_cm: '84-86', waist_cm: '81-84', length_cm: '117' } },
  { division: 'kids', code: '15-16Y', label: '15-16 Years (Size 44)', numeric_size: '44', age_range: '15-16Y', sort_order: 38, measurements: { chest_in: '34-35', waist_in: '33-34', length_in: '48', chest_cm: '86-89', waist_cm: '84-86', length_cm: '122' } },
];

export const MASTER_ATTRIBUTES_SEED = [
  // Occasions (Lagorii style)
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

  // Sleeve Styling
  { type: 'sleeve', name: 'Full Sleeves', slug: 'full-sleeves', sort_order: 1 },
  { type: 'sleeve', name: '3/4th Sleeves', slug: 'three-quarter-sleeves', sort_order: 2 },
  { type: 'sleeve', name: 'Short Sleeves', slug: 'short-sleeves', sort_order: 3 },
  { type: 'sleeve', name: 'Sleeveless', slug: 'sleeveless', sort_order: 4 },
  { type: 'sleeve', name: 'Bell Sleeves', slug: 'bell-sleeves', sort_order: 5 },
  { type: 'sleeve', name: 'Cape Sleeves', slug: 'cape-sleeves', sort_order: 6 },

  // Neckline
  { type: 'neckline', name: 'Round Neck', slug: 'round-neck', sort_order: 1 },
  { type: 'neckline', name: 'V-Neck', slug: 'v-neck', sort_order: 2 },
  { type: 'neckline', name: 'Sweetheart Neck', slug: 'sweetheart-neck', sort_order: 3 },
  { type: 'neckline', name: 'Mandarin / Collar Neck', slug: 'mandarin-collar', sort_order: 4 },
  { type: 'neckline', name: 'Boat Neck', slug: 'boat-neck', sort_order: 5 },
  { type: 'neckline', name: 'Square Neck', slug: 'square-neck', sort_order: 6 },
  { type: 'neckline', name: 'Angrakha Overlap', slug: 'angrakha-overlap', sort_order: 7 },

  // Colours
  { type: 'colour', name: 'Royal Crimson Red', slug: 'crimson-red', hex_code: '#800020', sort_order: 1 },
  { type: 'colour', name: 'Emerald Green', slug: 'emerald-green', hex_code: '#004B23', sort_order: 2 },
  { type: 'colour', name: 'Zari Gold', slug: 'zari-gold', hex_code: '#B8924A', sort_order: 3 },
  { type: 'colour', name: 'Royal Rani Pink', slug: 'rani-pink', hex_code: '#D11D66', sort_order: 4 },
  { type: 'colour', name: 'Peacock Teal Blue', slug: 'peacock-teal', hex_code: '#006D77', sort_order: 5 },
  { type: 'colour', name: 'Wine Plum', slug: 'wine-plum', hex_code: '#4A154B', sort_order: 6 },
  { type: 'colour', name: 'Deep Navy', slug: 'deep-navy', hex_code: '#1A1E3A', sort_order: 7 },
  { type: 'colour', name: 'Mustard Yellow', slug: 'mustard-yellow', hex_code: '#E0A96D', sort_order: 8 },
  { type: 'colour', name: 'Ivory Cream', slug: 'ivory-cream', hex_code: '#FAF6EE', sort_order: 9 },
  { type: 'colour', name: 'Lilac Lavender', slug: 'lilac-lavender', hex_code: '#B39DDB', sort_order: 10 },
  { type: 'colour', name: 'Peach', slug: 'peach', hex_code: '#FFDAB9', sort_order: 11 },
];
