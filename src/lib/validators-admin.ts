import { z } from 'zod'

/** Admin product form. Prices are dollars in the form, cents in the database. */
export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens')
    .max(140),
  description: z.string().trim().min(10, 'Add a description (min 10 characters)').max(2000),
  price: z.coerce.number().positive('Price must be greater than zero').max(100000),
  compareAtPrice: z.coerce.number().positive().max(100000).optional().or(z.literal('')),
  imageUrl: z.string().trim().min(1, 'Image URL is required').max(500),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').max(100000),
  featured: z.boolean().optional(),
  categoryId: z.string().min(1, 'Choose a category'),
  sizeLabels: z.array(z.string()).default([]),
  colorSlugs: z.array(z.string()).default([]),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
