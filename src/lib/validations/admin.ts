import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().optional(),
  section: z.enum(['women', 'kids']),
  parentId: z.string().nullable().optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  label: z.string().min(1, 'Label is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-kebab-case'),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  bannerImage: z.object({
    url: z.string().url(),
    publicId: z.string().min(1),
    width: z.number().optional(),
    height: z.number().optional(),
    uploadedAt: z.string().optional(),
  }).nullable().optional(),
});

export const ProductCategoryAssignSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  primaryCategoryId: z.string().min(1, 'Primary category ID is required'),
  categoryIds: z.array(z.string()).min(1, 'At least one category ID is required'),
}).refine((data) => data.categoryIds.includes(data.primaryCategoryId), {
  message: 'Primary category must be included in categoryIds list',
  path: ['primaryCategoryId'],
});

export const StaffInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  role: z.enum(['admin', 'staff']),
  permissions: z.array(z.string()).default(['products.read', 'products.write', 'categories.read', 'orders.read']),
});

export const CloudinaryDestroySchema = z.object({
  publicId: z.string().min(1, 'Cloudinary publicId is required'),
});

export const BulkReassignSchema = z.object({
  productIds: z.array(z.string()).min(1, 'Select at least one product'),
  targetSubcategoryId: z.string().min(1, 'Target subcategory ID is required'),
});
