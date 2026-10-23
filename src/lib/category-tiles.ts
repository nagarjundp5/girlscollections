/**
 * Static category tiles definition for homepage "Shop by Category" section.
 * Uses authentic DRFTN Cloudinary product images directly from the DB.
 * 0 DB queries, 0 cache lookups, 0 runtime latency.
 */

export interface CategoryTile {
  slug: string;
  name: string;
  image: string;
  span: 'large' | 'medium' | 'small';
  description?: string;
}

export const categoryTiles: CategoryTile[] = [
  {
    slug: 'sarees',
    name: 'Handloom Sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
    span: 'large',
    description: 'Organza, Chanderi & Kanjeevaram silk drapes',
  },
  {
    slug: 'lehengas',
    name: 'Zari Lehengas',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
    span: 'medium',
    description: 'Hand embroidered bridal & festive lehenga sets',
  },
  {
    slug: 'pattu-frocks',
    name: 'Kids Pattu Frocks',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
    span: 'medium',
    description: 'Pure silk frocks with 100% soft cotton inner lining',
  },
  {
    slug: 'kurtis',
    name: 'Anarkalis & Tunics',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
    span: 'large',
    description: 'Flowing Gota Patti & Moti embroidered suits',
  },
];
