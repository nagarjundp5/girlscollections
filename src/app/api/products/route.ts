export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { toPublicProductDTO, toPublicProductDTOList } from '@/lib/dto/product';

// Cache products for 60s at the CDN/edge — products don't change on every request.
// Admin mutations should call revalidatePath('/') / revalidateTag to bust this.
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await dbService.getProductBySlug(slug);
      if (!product || product.is_active === false) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(
        { product: toPublicProductDTO(product) },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    const rawProducts = await dbService.getProducts();
    const products = toPublicProductDTOList(rawProducts);

    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Public products GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
