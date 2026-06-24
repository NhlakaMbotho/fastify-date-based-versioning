import { z } from 'zod'

export const userV1ItemZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})

export type UserV1 = z.infer<typeof userV1ItemZodSchema>

export const userV1CreateBodyZodSchema = z.object({
  name: z.string(),
  email: z.string().email(),
}).strict()

export const userV1UpdateBodyZodSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
}).strict()



export const userV1Schema = {
  openApiName: 'UserV1',
  description: 'Initial release: single name field',
  item: {
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  },
  createBody: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
  updateBody: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
  examples: {
    item: { id: 'string', name: 'string', email: 'user@example.com' },
    createBody: { name: 'string', email: 'user@example.com' },
    updateBody: { name: 'string', email: 'user@example.com' },
  },
} as const
