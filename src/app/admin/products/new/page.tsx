'use client';

import dynamic from 'next/dynamic';

const ProductForm = dynamic(() => import('@/components/ProductForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] text-zinc-500 text-xs uppercase tracking-widest font-mono">
      Loading studio...
    </div>
  ),
});

export default function NewProductPage() {
  return (
    <div className="py-6">
      <ProductForm mode="create" />
    </div>
  );
}
