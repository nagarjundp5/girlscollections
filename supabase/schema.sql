-- DRFTN CLOTHING - Database Schema and Seed Data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- TABLES
-- =========================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    compare_price NUMERIC,
    category TEXT NOT NULL, -- tees, hoodies, joggers, accessories
    gender TEXT NOT NULL, -- unisex, men, women
    images TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{"XS", "S", "M", "L", "XL", "XXL"}'::text[],
    stock_quantity JSONB DEFAULT '{"XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0}'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL, -- {line1, line2, city, state, pincode}
    items JSONB NOT NULL, -- array of {id, name, size, quantity, price, image}
    subtotal NUMERIC NOT NULL,
    shipping_charge NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
    payment_id TEXT, -- Razorpay Payment ID
    order_status TEXT DEFAULT 'placed', -- placed, confirmed, packed, shipped, delivered, cancelled
    tracking_number TEXT, -- NimbusPost AWB
    courier_partner TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DISCOUNT CODES TABLE
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- percent, flat
    discount_value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CONTACT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Allow public read active categories" ON categories 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin full categories access" ON categories 
    FOR ALL TO authenticated USING (true);

-- Products Policies
CREATE POLICY "Allow public read active products" ON products 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin full products access" ON products 
    FOR ALL TO authenticated USING (true);

-- Orders Policies
CREATE POLICY "Allow public insert orders" ON orders 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full orders access" ON orders 
    FOR ALL TO authenticated USING (true);

-- Discount Codes Policies
CREATE POLICY "Allow public read active discount codes" ON discount_codes 
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Allow admin full discount codes access" ON discount_codes 
    FOR ALL TO authenticated USING (true);

-- Settings Policies
CREATE POLICY "Allow public read settings" ON settings 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin full settings access" ON settings 
    FOR ALL TO authenticated USING (true);

-- Contact Submissions Policies
CREATE POLICY "Allow public insert submissions" ON contact_submissions 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full submissions access" ON contact_submissions 
    FOR ALL TO authenticated USING (true);

-- =========================================================================
-- SECURITY DEFINER FUNCTION FOR ORDER TRACKING
-- =========================================================================
-- This allows customers to query details of their own order securely
-- without granting SELECT permissions to the public on the entire orders table.

CREATE OR REPLACE FUNCTION get_order_by_tracking(p_order_number TEXT, p_contact TEXT)
RETURNS SETOF orders
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM orders
    WHERE order_number = p_order_number
      AND (customer_phone = p_contact OR customer_email = p_contact);
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Insert Categories
INSERT INTO categories (name, slug, image_url, is_active) VALUES
('Tees', 'tees', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', true),
('Hoodies', 'hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80', true),
('Joggers', 'joggers', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', true),
('Accessories', 'accessories', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert 8 Streetwear Products
INSERT INTO products (name, slug, description, price, compare_price, category, gender, images, sizes, stock_quantity, is_featured, is_active) VALUES
(
  'Aero Carbon Heavyweight Tee',
  'aero-carbon-heavyweight-tee',
  'Crafted from 280 GSM ultra-heavyweight cotton. Features a relaxed drop-shoulder streetwear silhouette, high-density puff print detailing on the back, and ribbed crewneck collar. Pre-shrunk and double-stitched for maximum durability.',
  999,
  1499,
  'tees',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['S', 'M', 'L', 'XL'],
  '{"S": 12, "M": 20, "L": 15, "XL": 8}'::jsonb,
  true,
  true
),
(
  'Neo-Tokyo Oversized Graphic Tee',
  'neo-tokyo-oversized-graphic-tee',
  'Imported unisex streetwear tee featuring custom cyber-punk anime inspired screen printed graphics. 240 GSM organic combed cotton, styled for comfort and heavy daily rotation.',
  1199,
  1799,
  'tees',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  '{"XS": 5, "S": 10, "M": 14, "L": 10, "XL": 5}'::jsonb,
  true,
  true
),
(
  'Yelahanka Core Classic Tee',
  'yelahanka-core-classic-tee',
  'The essential streetwear basics pack. Heavy knit 220 GSM boxy tee featuring subtle embroidered "DRFTN" typography on the chest. The ultimate Bangalore street staple.',
  799,
  999,
  'tees',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  '{"S": 15, "M": 25, "L": 25, "XL": 15, "XXL": 5}'::jsonb,
  false,
  true
),
(
  'Retrograde Acid Wash Hoodie',
  'retrograde-acid-wash-hoodie',
  '450 GSM French Terry cotton hoodie with custom hand-dyed acid wash texture. Embroidered branding on cuffs, heavy kangaroo pocket, and double-lined hood without drawcords for a clean aesthetic.',
  2499,
  3499,
  'hoodies',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['S', 'M', 'L', 'XL'],
  '{"S": 5, "M": 8, "L": 12, "XL": 4}'::jsonb,
  true,
  true
),
(
  'Cyber-Grid Tech Zip-Up Hoodie',
  'cyber-grid-tech-zip-up-hoodie',
  'Modern streetwear zip-up featuring technical details. Lightweight yet warm 360 GSM fleece, custom gunmetal double zipper, mesh utility pocket on left sleeve, and contrast piping.',
  2299,
  2999,
  'hoodies',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['M', 'L', 'XL'],
  '{"M": 10, "L": 12, "XL": 6}'::jsonb,
  false,
  true
),
(
  'DRFTN Utility Cargo Joggers',
  'drftn-utility-cargo-joggers',
  'Heavy cargo streetwear pants with tapered ankle cuffs. Features adjustable straps, multiple 3D storage pockets, water-resistant outer coating, and elastic drawstring waist.',
  1899,
  2499,
  'joggers',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['S', 'M', 'L', 'XL'],
  '{"S": 8, "M": 15, "L": 10, "XL": 5}'::jsonb,
  true,
  true
),
(
  'Apex Heavy Fleece Sweatpants',
  'apex-heavy-fleece-sweatpants',
  'Made from 400 GSM soft French terry fleece. Relaxed straight fit with side pockets and a zippered back pocket. Minimalist design matches perfectly with our hoodies.',
  1599,
  1999,
  'joggers',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['S', 'M', 'L'],
  '{"S": 10, "M": 15, "L": 10}'::jsonb,
  false,
  true
),
(
  'D R F T N Classic Dad Cap',
  'drftn-classic-dad-cap',
  'Unstructured 6-panel street cap in stonewashed canvas. Features curved visor, adjustable metal buckle closure, and high-density logo embroidery on front.',
  699,
  999,
  'accessories',
  'unisex',
  ARRAY[
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&auto=format&fit=crop&q=80'
  ],
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], -- Caps are single size or adjustable, but we map sizes to bypass client validation
  '{"XS":0, "S": 0, "M": 50, "L": 0, "XL": 0, "XXL": 0}'::jsonb,
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Discount Codes
INSERT INTO discount_codes (code, discount_type, discount_value, min_order_value, usage_limit, used_count, is_active, expires_at) VALUES
('DRFTN10', 'percent', 10, 0, 100, 0, true, NULL),
('BLRSTREET', 'flat', 250, 1499, 50, 0, true, NULL),
('FREESHIP', 'flat', 99, 0, 500, 0, true, NULL)
ON CONFLICT (code) DO NOTHING;

-- Insert Default Settings
INSERT INTO settings (key, value) VALUES
('store_name', 'DRFTN CLOTHING'),
('contact_number', '+91 7406164512'),
('instagram_handle', '@drftnclothing'),
('free_shipping_threshold', '999'),
('default_shipping_charge', '99'),
('razorpay_key_id', 'rzp_test_placeholderkey'),
('razorpay_key_secret', 'placeholder_secret'),
('nimbuspost_api_key', 'nimbus_placeholder_apikey')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
