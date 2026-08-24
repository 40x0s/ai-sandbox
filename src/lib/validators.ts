import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(72, 'Passwords cannot exceed 72 characters'), // bcrypt truncates beyond 72 bytes
})

export type Credentials = z.infer<typeof credentialsSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export const orderLineSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1).max(20),
  color: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(99),
})

export const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  fullName: z.string().trim().min(2, 'Enter your full name').max(80),
  address: z.string().trim().min(4, 'Enter a street address').max(200),
  city: z.string().trim().min(2, 'Enter a city').max(80),
  postcode: z.string().trim().min(2, 'Enter a postcode').max(20),
  country: z.string().trim().min(2, 'Enter a country').max(80),
  lines: z.array(orderLineSchema).min(1, 'Your bag is empty').max(50),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
