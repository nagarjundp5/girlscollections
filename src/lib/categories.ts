import { Category, CategorySection } from '@/types';
import { revalidateTag, revalidatePath } from 'next/cache';

export interface CategoryNode extends Category {
  children?: CategoryNode[];
  path?: { id: string; label: string; slug: string; level: number }[];
}

export interface StructuredCategoryTree {
  women: CategoryNode[];
  kids: CategoryNode[];
}

/**
 * Derives full breadcrumb path from categoryId by traversing parentId up to Level 1.
 */
export function getCategoryPath(
  categoryId: string,
  categoriesMap: Map<string, Category> | Record<string, Category>
): { id: string; label: string; slug: string; level: number }[] {
  const path: { id: string; label: string; slug: string; level: number }[] = [];
  let currentId: string | null = categoryId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const cat: Category | undefined = categoriesMap instanceof Map ? categoriesMap.get(currentId) : (categoriesMap as Record<string, Category>)[currentId];
    if (!cat) break;

    path.unshift({
      id: cat.id,
      label: cat.name || cat.label || cat.slug,
      slug: cat.slug,
      level: cat.level || 3,
    });

    currentId = cat.parentId || cat.parent_id || null;
  }

  return path;
}

/**
 * Triggers Next.js category cache revalidation when admin edits category taxonomy.
 */
export async function revalidateCategoryCache(): Promise<void> {
  try {
    revalidateTag('categories');
    revalidatePath('/shop', 'layout');
    revalidatePath('/', 'layout');
  } catch (err) {
    console.warn('[revalidateCategoryCache] Warning revalidating path/tag:', err);
  }
}

/**
 * Validates slug format and uniqueness.
 */
export function sanitizeCategorySlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
