import { z } from 'zod'

export const addressSchema = {
  type: 'object' as const,
  required: ['street', 'city', 'country'],
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
  },
}

export const addressZodSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
})
