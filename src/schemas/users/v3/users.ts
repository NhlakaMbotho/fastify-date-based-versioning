import { z } from 'zod'
import { addressSchema, addressZodSchema } from '../shared'

export const userV3ItemZodSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  address: addressZodSchema,
})

export type UserV3 = z.infer<typeof userV3ItemZodSchema>

export const userV3CreateBodyZodSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  address: addressZodSchema,
}).strict()

export const userV3UpdateBodyZodSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  address: addressZodSchema.partial().optional(),
}).strict()

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
