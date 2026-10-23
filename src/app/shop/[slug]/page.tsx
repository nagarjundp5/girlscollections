'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS, Product } from '@/data/shopData';
import { ProductGallery } from '@/components/pdp/ProductGallery';
import { ProductInfo } from '@/components/pdp/ProductInfo';
import { StickyAddToCartBar } from '@/components/pdp/StickyAddToCartBar';
import { ProductCard } from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';
import { ButterflyMotif } from '@/components/ui/Motifs';

interface PDPProps {
  params: {
    slug: string;
  };
}

function formatDbProductToShopProduct(p: any): Product {
  const priceRupees = p.price > 10000 ? Math.round(p.price / 100) : p.price;
  const originalPriceRupees = p.compare_price
    ? (p.compare_price > 10000 ? Math.round(p.compare_price / 100) : p.compare_price)
    : undefined;

  let sizesList: any[] = [];
  if (Array.isArray(p.sizes)) {
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
    rating: 5.0,
    reviewsCount: 18,
  };
}

export default function ProductDetailPage({ params }: PDPProps) {
  const { addToCart } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products?slug=${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            const formatted = formatDbProductToShopProduct(data.product);
            setProduct(formatted);

            // Load related products
            const allRes = await fetch('/api/products');
            if (allRes.ok) {
              const allData = await allRes.json();
              if (allData.products) {
                const formattedAll: Product[] = allData.products.map(formatDbProductToShopProduct);
                const related = formattedAll.filter((p) => p.id !== formatted.id).slice(0, 4);
                setRelatedProducts(related);
              }
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }

      // Fallback to MOCK_PRODUCTS
      const mockProd = MOCK_PRODUCTS.find((p) => p.slug === params.slug) || MOCK_PRODUCTS[0];
      setProduct(mockProd);
      setRelatedProducts(MOCK_PRODUCTS.filter((p) => p.id !== mockProd.id).slice(0, 4));
    }

    loadProduct();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-3 text-navy">
        <Loader2 className="w-6 h-6 animate-spin text-zariGold" />
        <span className="text-xs font-sans font-bold uppercase tracking-widest text-zariGold">Loading Garment Details...</span>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const selectedSize = product.sizes.find((s) => s.inStock)?.size || 'Free Size';

  return (
    <div className="bg-ivory text-navy min-h-screen pb-24">
      {/* Breadcrumbs Navigation with Graceful Ellipsis Truncation */}
      <div className="bg-blush/15 border-b border-roseGold/20 py-3.5 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-1.5 text-xs font-sans text-charcoal-muted overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-roseGold transition-colors shrink-0">Home</Link>
            <ChevronRight className="w-3 h-3 text-roseGold/40 shrink-0" />
            <Link href="/shop" className="hover:text-roseGold transition-colors shrink-0">Shop</Link>
            <ChevronRight className="w-3 h-3 text-roseGold/40 shrink-0" />
            <span className="capitalize shrink-0 text-navy font-medium">{product.target}</span>
            <span className="hidden sm:inline-flex items-center space-x-1.5 shrink-0">
              <ChevronRight className="w-3 h-3 text-roseGold/40 shrink-0" />
              <span className="text-navy font-semibold truncate max-w-[280px]">
                {product.name}
              </span>
            </span>
          </nav>
        </div>
      </div>

      {/* Main PDP Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Information & CTAs */}
          <div className="lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* "You May Also Like" Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-20 border-t border-roseGold/20 mt-16 sm:mt-20">
          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center space-x-2 text-roseGold text-xs uppercase tracking-eyebrow font-semibold">
              <ButterflyMotif className="w-4 h-4" />
              <span>Curated Recommendations</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-navy mt-1">
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Add To Bag Bar */}
      <StickyAddToCartBar
        product={product}
        selectedSize={selectedSize}
        onAddToCart={() => addToCart(product, selectedSize)}
      />
    </div>
  );
}
