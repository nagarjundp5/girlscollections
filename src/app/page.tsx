import React from 'react';
import HomePageClient from '@/components/home/HomePageClient';
import { dbService } from '@/lib/db';
import { MOCK_PRODUCTS } from '@/data/shopData';
import { Product } from '@/types';

export const revalidate = 60; // Revalidate homepage every 60s

const mappedMockProducts: Product[] = MOCK_PRODUCTS.map((p: any) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: p.price > 100000 ? p.price : p.price * 100,
  compare_price: p.originalPrice ? (p.originalPrice > 100000 ? p.originalPrice : p.originalPrice * 100) : undefined,
  category: p.category,
  subcategory: p.subcategory,
  gender: p.target === 'kids' ? 'unisex' : 'women',
  images: p.images,
  sizes: p.sizes ? p.sizes.map((s: any) => (typeof s === 'string' ? s : s.size)) : ['XS', 'S', 'M', 'L', 'XL'],
  stock_quantity: { S: 10, M: 10, L: 10 },
  is_featured: !!p.isBestSeller,
  is_active: true,
  weight_grams: 250,
  units_sold: p.reviewsCount || 10,
  created_at: new Date().toISOString(),
}));

export default async function HomePage() {
  let allProducts: Product[] = [];
  try {
    allProducts = await dbService.getProducts();
  } catch (err) {
    console.error('Failed to load DB products for homepage:', err);
  }

  // Fallback to mapped mock products if DB returns zero active products
  const products: Product[] = allProducts.length > 0 ? allProducts : mappedMockProducts;

  // Trending Products (sorted by units_sold descending)
  const trendingProducts: Product[] = [...products]
    .sort((a, b) => (b.units_sold ?? 0) - (a.units_sold ?? 0))
    .slice(0, 12);

  // New Drops (sorted by created_at descending)
  const newDrops: Product[] = [...products]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 12);

  const spotlightProduct = trendingProducts[0] || products[0] || null;

  return (
    <HomePageClient
      trendingProducts={trendingProducts}
      newDrops={newDrops}
      spotlightProduct={spotlightProduct}
    />
  );
}
