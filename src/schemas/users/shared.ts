export const addressSchema = {
  type: 'object' as const,
  required: ['street', 'city', 'country'],
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
  },
}
