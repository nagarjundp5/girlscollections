export interface ProductSize {
  size: string;
  inStock: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string; // 'anarkalis' | 'kurtis' | 'lehengas' | 'indo-western' | 'pattu-frocks' | 'kids-kurta' | 'kids-lehenga'
  target: 'women' | 'kids';
  subcategory: string;
  occasion: 'Festive' | 'Wedding Guest' | 'Everyday' | 'Gifting';
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isSale?: boolean;
  images: string[];
  sizes: ProductSize[];
  colors: ProductColor[];
  fabric: string;
  style_silhouette?: string;
  work_type?: string;
  sleeve?: string;
  neckline?: string;
  length_type?: string;
  set_type?: string;
  description: string;
  careInstructions: string[];
  rating: number;
  reviewsCount: number;
}

export interface CategoryMenu {
  id: string;
  title: string;
  slug: string;
  featuredImg: string;
  promoText: string;
  subcategories: { name: string; slug: string }[];
  occasions: { name: string; slug: string }[];
}

// Mega Menu Navigation Data Structure
export const NAVIGATION_CATEGORIES: CategoryMenu[] = [
  {
    id: "women",
    title: "Women",
    slug: "women",
    featuredImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=600",
    promoText: "The Festive Edit — Handwoven Silk & Zari Collection",
    subcategories: [
      { name: "Anarkali Suit Sets", slug: "anarkalis" },
      { name: "Kurtis & Tunics", slug: "kurtis" },
      { name: "Lehenga Cholis", slug: "lehengas" },
      { name: "Indo-Western Gowns", slug: "indo-western" },
      { name: "Co-ord Sets", slug: "co-ords" },
    ],
    occasions: [
      { name: "Festive Splendor", slug: "festive" },
      { name: "Wedding Guest", slug: "wedding-guest" },
      { name: "Everyday Elegance", slug: "everyday" },
      { name: "Royal Gifting", slug: "gifting" },
    ],
  },
  {
    id: "kids",
    title: "Kids Ethnic",
    slug: "kids",
    featuredImg: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800",
    promoText: "Little Royalty — Pure Silk Pattu Frocks & Soft Cotton Kurtas",
    subcategories: [
      { name: "Pattu Frocks", slug: "pattu-frocks" },
      { name: "Girls Lehenga Cholis", slug: "kids-lehenga" },
      { name: "Boys Kurta & Dhoti Sets", slug: "kids-kurta" },
      { name: "Festive Anarkalis", slug: "kids-anarkali" },
    ],
    occasions: [
      { name: "First Birthday & Ceremonies", slug: "ceremonies" },
      { name: "Festive Gatherings", slug: "festive" },
      { name: "Family Weddings", slug: "wedding-guest" },
    ],
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    slug: "new-arrivals",
    featuredImg: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=600",
    promoText: "Monsoon Couture '26 — Fresh Dropped Styles",
    subcategories: [
      { name: "Women's New Drops", slug: "women-new" },
      { name: "Kids' New Drops", slug: "kids-new" },
      { name: "Matching Mom & Me", slug: "mom-and-me" },
    ],
    occasions: [
      { name: "Monsoon Celebrations", slug: "festive" },
      { name: "Pre-Bridal Events", slug: "wedding-guest" },
    ],
  },
  {
    id: "festive-edit",
    title: "Festive Edit",
    slug: "festive-edit",
    featuredImg: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=600",
    promoText: "Blush & Gold Signature Festive Wear",
    subcategories: [
      { name: "Royal Silk Anarkalis", slug: "anarkalis" },
      { name: "Embroidered Kurta Sets", slug: "kurtis" },
      { name: "Silk Lehenga Sets", slug: "lehengas" },
      { name: "Kids Silk Collection", slug: "pattu-frocks" },
    ],
    occasions: [
      { name: "Diwali & Navratri", slug: "festive" },
      { name: "Puja Ceremonies", slug: "ceremonies" },
    ],
  },
  {
    id: "sale",
    title: "Sale",
    slug: "sale",
    featuredImg: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=600",
    promoText: "End of Season Royal Vault — Up to 40% Off",
    subcategories: [
      { name: "Women's Sale", slug: "women-sale" },
      { name: "Kids Sale", slug: "kids-sale" },
      { name: "Under ₹2,999", slug: "under-2999" },
    ],
    occasions: [
      { name: "Clearance Jewels", slug: "festive" },
    ],
  },
];

// Mock Products Catalog
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "tgc-101",
    slug: "gulmohar-blush-organza-suit",
    name: "Gulmohar Blush Organza Anarkali Set",
    category: "anarkalis",
    target: "women",
    subcategory: "Anarkali Suit Sets",
    occasion: "Festive",
    price: 4999,
    originalPrice: 6499,
    isNew: true,
    isBestSeller: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "XS", inStock: true },
      { size: "S", inStock: true },
      { size: "M", inStock: true },
      { size: "L", inStock: false },
    ],
    colors: [
      { name: "Blush Pink", hex: "#E8C9C4" },
      { name: "Rose Gold", hex: "#C9A66B" },
      { name: "Sage Green", hex: "#7C9070" },
    ],
    fabric: "Pure Organza Silk with Handwoven Zari Border",
    description: "Crafted for festive gatherings, this ethereal blush organza anarkali suit features delicate hand-embroidered floral motifs along the scalloped gold zari border. Comes with a matching dupatta and trousers.",
    careInstructions: ["Dry Clean Only", "Store in Cotton Garment Bag", "Iron on Low Heat with Cloth Overlay"],
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    id: "tgc-102",
    slug: "royal-navy-zari-lehenga",
    name: "Royal Navy Chanderi Zari Lehenga",
    category: "lehengas",
    target: "women",
    subcategory: "Lehenga Cholis",
    occasion: "Wedding Guest",
    price: 8999,
    originalPrice: 11999,
    isNew: true,
    isBestSeller: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "XS", inStock: true },
      { size: "S", inStock: true },
      { size: "M", inStock: true },
      { size: "L", inStock: true },
      { size: "XL", inStock: false },
    ],
    colors: [
      { name: "Deep Navy", hex: "#16213E" },
      { name: "Emerald Green", hex: "#1F4E3D" },
    ],
    fabric: "Chanderi Silk with Metallic Threadwork",
    description: "A commanding deep navy lehenga skirt featuring intricate royal gold zari kalis. Paired with a fitted sweetheart neck blouse and lightweight netted dupatta with rose gold tassels.",
    careInstructions: ["Dry Clean Only", "Do Not Wring", "Steam Iron Only"],
    rating: 4.8,
    reviewsCount: 24,
  },
  {
    id: "tgc-103",
    slug: "aadhya-kids-pattu-frock",
    name: "Aadhya Kanjeevaram Pattu Frock",
    category: "pattu-frocks",
    target: "kids",
    subcategory: "Pattu Frocks",
    occasion: "Festive",
    price: 3299,
    originalPrice: 4299,
    isNew: false,
    isBestSeller: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "1-2Y", inStock: true },
      { size: "2-3Y", inStock: true },
      { size: "4-5Y", inStock: true },
      { size: "6-7Y", inStock: true },
      { size: "8-9Y", inStock: false },
    ],
    colors: [
      { name: "Rose Pink & Gold", hex: "#B76E79" },
      { name: "Golden Cream", hex: "#FAF6F0" },
    ],
    fabric: "Soft Pure Kanjeevaram Silk with Cotton Lining",
    description: "Designed specifically for your little princess's sensitive skin. Features soft breathable 100% cotton lining beneath traditional Kanjeevaram silk weave with non-scratchy soft seam finish.",
    careInstructions: ["Gentle Dry Clean", "Do Not Bleach", "Warm Iron on Reverse"],
    rating: 5.0,
    reviewsCount: 52,
  },
  {
    id: "tgc-104",
    slug: "ananya-rose-gold-anarkali",
    name: "Ananya Embroidered Rose Gold Anarkali",
    category: "kurtis",
    target: "women",
    subcategory: "Kurtis & Tunics",
    occasion: "Festive",
    price: 5499,
    originalPrice: 6999,
    isNew: true,
    isBestSeller: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "S", inStock: true },
      { size: "M", inStock: true },
      { size: "L", inStock: true },
      { size: "XL", inStock: true },
      { size: "XXL", inStock: false },
    ],
    colors: [
      { name: "Rose Gold", hex: "#C9A66B" },
      { name: "Ivory White", hex: "#FAF6F0" },
    ],
    fabric: "Georgette with Moti & Gota Patti Work",
    description: "Floor-length flowing Anarkali silhouette studded with gold gota patti and subtle pearl accents. Includes matching stretch lycra churidar and sheer organza dupatta.",
    careInstructions: ["Dry Clean Only", "Store Hung"],
    rating: 4.7,
    reviewsCount: 19,
  },
  {
    id: "tgc-105",
    slug: "little-nawab-boys-kurta-set",
    name: "Little Nawab Silk Kurta & Dhoti Set",
    category: "kids-kurta",
    target: "kids",
    subcategory: "Boys Kurta & Dhoti Sets",
    occasion: "Festive",
    price: 2499,
    originalPrice: 3199,
    isNew: true,
    isBestSeller: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "2-3Y", inStock: true },
      { size: "4-5Y", inStock: true },
      { size: "6-7Y", inStock: true },
      { size: "8-9Y", inStock: true },
    ],
    colors: [
      { name: "Deep Navy", hex: "#16213E" },
      { name: "Mustard Gold", hex: "#C9A66B" },
    ],
    fabric: "Dupion Silk Blend with Soft Cotton Inner",
    description: "Dapper traditional ethnic ensemble for young gentlemen. Mandarian collar shirt kurta accented with gold buttons paired with comfortable elasticated pre-stitched dhoti pants.",
    careInstructions: ["Hand Wash Cold separately", "Line Dry in Shade"],
    rating: 4.9,
    reviewsCount: 41,
  },
  {
    id: "tgc-106",
    slug: "meera-indo-western-cape-set",
    name: "Meera Draped Indo-Western Cape Set",
    category: "indo-western",
    target: "women",
    subcategory: "Indo-Western Gowns",
    occasion: "Wedding Guest",
    price: 6999,
    originalPrice: 8499,
    isNew: false,
    isBestSeller: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "XS", inStock: true },
      { size: "S", inStock: true },
      { size: "M", inStock: true },
      { size: "L", inStock: false },
    ],
    colors: [
      { name: "Blush Pink", hex: "#E8C9C4" },
      { name: "Charcoal Navy", hex: "#16213E" },
    ],
    fabric: "Fluid Satin Crepe & Sheer Net Cape",
    description: "Modern elegance meets traditional grace. Features a high-waisted flared pant, silk crop bustier, and a dramatic floor-sweeping sheer cape adorned with sequin botanicals.",
    careInstructions: ["Dry Clean Only"],
    rating: 4.8,
    reviewsCount: 31,
  },
  {
    id: "tgc-107",
    slug: "tara-kids-lehenga-choli",
    name: "Tara Mirror Work Kids Lehenga Choli",
    category: "kids-lehenga",
    target: "kids",
    subcategory: "Girls Lehenga Cholis",
    occasion: "Festive",
    price: 3799,
    originalPrice: 4799,
    isNew: true,
    isBestSeller: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "2-3Y", inStock: true },
      { size: "4-5Y", inStock: true },
      { size: "6-7Y", inStock: true },
      { size: "8-9Y", inStock: true },
      { size: "10-11Y", inStock: false },
    ],
    colors: [
      { name: "Soft Coral & Blush", hex: "#E8C9C4" },
      { name: "Sage Green", hex: "#7C9070" },
    ],
    fabric: "Georgette with Soft Lining & Lightweight Foil Mirror Work",
    description: "Lightweight, twirl-worthy lehenga crafted specially for young girls. Non-irritating foil mirror work with elasticated waist for all-day festive comfort.",
    careInstructions: ["Gentle Dry Clean Only"],
    rating: 5.0,
    reviewsCount: 64,
  },
  {
    id: "tgc-108",
    slug: "samaira-handloom-cotton-co-ord",
    name: "Samaira Handloom Cotton Festive Co-ord",
    category: "co-ords",
    target: "women",
    subcategory: "Co-ord Sets",
    occasion: "Everyday",
    price: 3499,
    originalPrice: 4199,
    isNew: false,
    isBestSeller: false,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=1200",
    ],
    sizes: [
      { size: "S", inStock: true },
      { size: "M", inStock: true },
      { size: "L", inStock: true },
      { size: "XL", inStock: true },
    ],
    colors: [
      { name: "Ivory Cream", hex: "#FAF6F0" },
      { name: "Muted Rose", hex: "#B76E79" },
    ],
    fabric: "100% Handloom Cotton with Gold Thread Stripes",
    description: "Breathe quiet luxury in this tailored peplum tunic and matching straight-cut trouser set. Enhanced with handmade fabric buttons and gold hairline embroidery.",
    careInstructions: ["Hand Wash in Cold Water", "Dry in Shade"],
    rating: 4.6,
    reviewsCount: 15,
  },
];

// Occasion categories for homepage & PLP
export const OCCASIONS_DATA = [
  {
    id: "festive",
    title: "Festive Edit",
    subtitle: "Zari, Silk & Royal Motifs",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800",
    count: "42 items",
  },
  {
    id: "wedding-guest",
    title: "Wedding Guest",
    subtitle: "Statement Lehengas & Drapes",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800",
    count: "28 items",
  },
  {
    id: "everyday",
    title: "Everyday Luxe",
    subtitle: "Breathable Silks & Cottons",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800",
    count: "35 items",
  },
  {
    id: "gifting",
    title: "Royal Gifting",
    subtitle: "Curated Sets & Heritage Boxes",
    image: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800",
    count: "18 items",
  },
];

// Announcement Marquee Ticker Messages
export const MARQUEE_MESSAGES = [
  "✦ COMPLIMENTARY PAN-INDIA SHIPPING ON ORDERS ABOVE ₹1,999 ✦",
  "✦ MONSOON FESTIVE EDIT NOW LIVE — EXPLORE WOMEN & KIDS ETHNIC WEAR ✦",
  "✦ EASY 7-DAY RETURNS & COD AVAILABLE ACROSS INDIA ✦",
  "✦ USE CODE 'GIRLS10' FOR 10% OFF YOUR FIRST ORDER ✦",
];
