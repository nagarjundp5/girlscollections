import { Product } from '@/types';

export interface PublicProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  category: string;
  subcategory?: string | null;
  gender: string;
  images: string[];
  sizes: string[];
  stock_quantity: Record<string, number>;
  is_featured: boolean;
  is_trending?: boolean;
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  is_active: boolean;
  units_sold?: number;
  age_ranges?: string[];
  colours?: string[];
  fabric?: string | null;
  occasion?: string | null;
  style_silhouette?: string | null;
  work_type?: string | null;
  sleeve?: string | null;
  neckline?: string | null;
  length_type?: string | null;
  set_type?: string | null;
  care_instructions?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  variants?: any[];
}

/**
 * Strict whitelist DTO mapper for public storefront product responses.
 * Guarantees internal database fields, cost prices, suppliers, and internal notes never reach clients.
 */
export function toPublicProductDTO(product: any): PublicProductDTO {
  if (!product) return product;

  return {
    id: String(product.id || ''),
    name: String(product.name || ''),
    slug: String(product.slug || ''),
    description: String(product.description || ''),
    price: Number(product.price || 0),
    compare_price: product.compare_price ? Number(product.compare_price) : undefined,
    category: String(product.category || ''),
    subcategory: product.subcategory || null,
    gender: String(product.gender || 'women'),
    images: Array.isArray(product.images) ? product.images : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    stock_quantity: product.stock_quantity && typeof product.stock_quantity === 'object' ? product.stock_quantity : {},
    is_featured: Boolean(product.is_featured),
    is_trending: Boolean(product.is_trending),
    is_best_seller: Boolean(product.is_best_seller),
    is_new_arrival: Boolean(product.is_new_arrival),
    is_active: Boolean(product.is_active),
    units_sold: typeof product.units_sold === 'number' ? product.units_sold : 0,
    age_ranges: Array.isArray(product.age_ranges) ? product.age_ranges : [],
    colours: Array.isArray(product.colours) ? product.colours : [],
    fabric: product.fabric || null,
    occasion: product.occasion || null,
    style_silhouette: product.style_silhouette || null,
    work_type: product.work_type || null,
    sleeve: product.sleeve || null,
    neckline: product.neckline || null,
    length_type: product.length_type || null,
    set_type: product.set_type || null,
    care_instructions: product.care_instructions || null,
    seo_title: product.seo_title || null,
    seo_description: product.seo_description || null,
    created_at: product.created_at ? new Date(product.created_at).toISOString() : undefined,
    variants: Array.isArray(product.variants)
      ? product.variants.map((v: any) => ({
          id: String(v.id || ''),
          colour_name: String(v.colour_name || ''),
          colour_hex: v.colour_hex || null,
          images: Array.isArray(v.images) ? v.images : [],
          sizes: Array.isArray(v.sizes) ? v.sizes : [],
          stock_quantity: v.stock_quantity || {},
          sku: String(v.sku || ''),
          price_override: v.price_override ? Number(v.price_override) : undefined,
        }))
      : undefined,
  };
}

export function toPublicProductDTOList(products: any[]): PublicProductDTO[] {
  if (!Array.isArray(products)) return [];
  return products.filter((p) => p && p.is_active !== false).map(toPublicProductDTO);
}
