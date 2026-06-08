import { addressSchema } from '../shared'

export interface UserV3 {
  id: string
  firstName: string
  lastName: string
  email: string
  address: {
    street: string
    city: string
    country: string
  }
}

export const userV3Schema = {
  openApiName: 'UserV3',
  description: 'Breaking: nested address object added',
  item: {
    type: 'object',
    required: ['id', 'firstName', 'lastName', 'email', 'address'],
    properties: {
      id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      address: addressSchema,
    },
  },
  createBody: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'address'],
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      address: addressSchema,
    },
    additionalProperties: false,
  },
  updateBody: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  examples: {
    item: { id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com', address: { street: 'string', city: 'string', country: 'string' } },
    createBody: { firstName: 'string', lastName: 'string', email: 'user@example.com', address: { street: 'string', city: 'string', country: 'string' } },
    updateBody: { firstName: 'string', lastName: 'string', email: 'user@example.com', address: { street: 'string', city: 'string', country: 'string' } },
  },
} as const
