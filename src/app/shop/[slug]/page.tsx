import React, { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import { Product as ShopProduct } from '@/data/shopData';
import { getSiteUrl } from '@/lib/getSiteUrl';
import { cl } from '@/lib/cloudinary';
import { PDPClientView } from './PDPClientView';

export const revalidate = 3600; // ISR revalidation (1 hour, purged by admin write hooks)

interface PDPPageProps {
  params: {
    slug: string;
  };
}

function formatDbProductToShopProduct(p: any): ShopProduct {
  const priceRupees = p.price > 100000 ? Math.round(p.price / 100) : p.price;
  const originalPriceRupees = p.compare_price
    ? (p.compare_price > 100000 ? Math.round(p.compare_price / 100) : p.compare_price)
    : undefined;

  let sizesList: any[] = [];
  if (p.product_sizes && Array.isArray(p.product_sizes) && p.product_sizes.length > 0) {
    sizesList = p.product_sizes
      .filter((s: any) => s.is_active !== false)
      .map((s: any) => {
        const pRup = s.price > 100000 ? Math.round(s.price / 100) : s.price;
        const mrpRup = s.mrp ? (s.mrp > 100000 ? Math.round(s.mrp / 100) : s.mrp) : undefined;
        return {
          size: s.size_key,
          price: pRup,
          originalPrice: mrpRup,
          inStock: Number(s.stock ?? 0) > 0,
        };
      });
  } else if (Array.isArray(p.sizes)) {
    sizesList = p.sizes.map((s: any) =>
      typeof s === 'string' ? { size: s, inStock: true } : s
    );
  } else if (p.stock_quantity && typeof p.stock_quantity === 'object') {
    sizesList = Object.entries(p.stock_quantity).map(([size, qty]) => ({
      size,
      inStock: Number(qty) > 0,
    }));
  }

  if (sizesList.length === 0) {
    sizesList = [
      { size: 'XS', inStock: true },
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ];
  }

  const cat = (p.category || '').toLowerCase();
  const isKids = p.gender === 'kids' || cat.includes('kids') || cat.includes('children') || cat.includes('frock');

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category || 'ethnic-wear',
    target: isKids ? 'kids' : 'women',
    subcategory: p.subcategory || p.category || '',
    occasion: p.occasion || 'Festive',
    price: priceRupees,
    originalPrice: originalPriceRupees,
    isNew: true,
    isBestSeller: !!p.is_featured,
    isSale: !!originalPriceRupees,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
    sizes: sizesList,
    colors: Array.isArray(p.colours) && p.colours.length > 0
      ? p.colours.map((c: string) => ({ name: c, hex: '#B8924A' }))
      : [{ name: 'Standard', hex: '#C9A66B' }],
    fabric: p.fabric || p.description || 'Premium Ethnic Wear',
    style_silhouette: p.style_silhouette || undefined,
    work_type: p.work_type || undefined,
    sleeve: p.sleeve || undefined,
    neckline: p.neckline || undefined,
    length_type: p.length_type || undefined,
    set_type: p.set_type || undefined,
    description: p.description || '',
    careInstructions: p.care_instructions ? [p.care_instructions] : ['Dry Clean Only', 'Store in Cotton Garment Bag'],
  };
}

// React cache ensures only 1 DB fetch between generateMetadata and Page execution
const getCachedProduct = cache(async (slug: string): Promise<ShopProduct | null> => {
  try {
    const raw = await dbService.getProductBySlug(slug);
    if (!raw) return null;
    return formatDbProductToShopProduct(raw);
  } catch (err) {
    console.error(`[PDP] Error fetching product "${slug}":`, err);
    return null;
  }
});

export async function generateMetadata({ params }: PDPPageProps): Promise<Metadata> {
  const product = await getCachedProduct(params.slug);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/shop/${params.slug}`;

  if (!product) {
    return {
      title: 'Product Not Found | The Girls Collections',
      description: 'The requested product could not be found.',
    };
  }

  const rawImage = product.images?.[0] || '/logo.png';
  const ogImageUrl = rawImage.startsWith('http')
    ? cl(rawImage, { w: 1200, h: 630, crop: 'fill', q: 'auto:good' })
    : `${siteUrl}${rawImage}`;

  const priceFormatted = `₹${product.price.toLocaleString('en-IN')}`;
  const title = `${product.name} | The Girls Collections`;
  const description =
    product.description ||
    `Shop ${product.name} in handcrafted luxury ethnic wear. Available now for ${priceFormatted} with Pan-India delivery.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'The Girls Collections',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PDPPageProps) {
  const product = await getCachedProduct(params.slug);

  if (!product) {
    notFound();
  }

  let relatedProducts: ShopProduct[] = [];
  try {
    const all = await dbService.getAllProducts();
    relatedProducts = (all || [])
      .map(formatDbProductToShopProduct)
      .filter((p) => p.id !== product.id && p.target === product.target)
      .slice(0, 4);
  } catch {}

  return (
    <PDPClientView product={product} relatedProducts={relatedProducts} />
  );
}
