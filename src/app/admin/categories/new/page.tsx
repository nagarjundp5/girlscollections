'use client';

import React from 'react';
import CategoryForm from '@/components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="py-6">
      <CategoryForm mode="create" />
    </div>
  );
}
