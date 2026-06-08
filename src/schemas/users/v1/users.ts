export interface UserV1 {
  id: string
  name: string
  email: string
}

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
