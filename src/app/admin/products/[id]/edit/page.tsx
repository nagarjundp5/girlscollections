'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';

const ProductForm = dynamic(() => import('@/components/ProductForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] text-zinc-500 text-xs uppercase tracking-widest font-mono">
      Loading studio...
    </div>
  ),
});


export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Use a ref for addToast so it never appears in the useEffect dep array
  const addToastRef = React.useRef(addToast);
  React.useEffect(() => { addToastRef.current = addToast; });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function loadProduct() {
      try {
        const list = await db.getAllProducts();
        if (cancelled) return;
        const found = list.find((p) => p.id === id);
        if (found) {
          setProduct(found);
        } else {
          addToastRef.current('Product not found in catalogue', 'error');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) addToastRef.current('Failed to fetch product details', 'error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadProduct();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="py-6">
      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
