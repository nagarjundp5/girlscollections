'use client';

import React, { useEffect, useState } from 'react';
import CategoryForm from '@/components/CategoryForm';
import { dbService } from '@/lib/db';
import { Category } from '@/types';
import { useToast } from '@/components/ToastContainer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { addToast } = useToast();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      try {
        const cats = await dbService.getAllCategories();
        const found = cats.find(c => c.id === params.id);
        if (found) {
          setCategory(found);
        } else {
          addToast('Category not found', 'error');
        }
      } catch (err) {
        addToast('Failed to load category', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [params.id, addToast]);

  if (loading) return <div className="py-8 text-center text-zinc-500">Loading category...</div>;

  if (!category) return (
    <div className="py-8 text-center space-y-4">
      <p className="text-brand-red font-bold">Category not found.</p>
      <Link href="/admin/categories" className="text-zinc-500 hover:text-brand-offwhite underline">
        Return to Categories
      </Link>
    </div>
  );

  return (
    <div className="py-6">
      <CategoryForm mode="edit" initialData={category} />
    </div>
  );
}
