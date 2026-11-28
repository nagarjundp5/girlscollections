-- Performance indexes for homepage trending & product image lateral join
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS product_images_product_sort_idx ON product_images (product_id, sort_order, created_at);
CREATE INDEX IF NOT EXISTS products_active_gender_cat_idx ON products (is_active, gender, category);
