export interface UserV2 {
  id: string
  firstName: string
  lastName: string
  email: string
}

export const userV2Schema = {
  openApiName: 'UserV2',
  description: 'Breaking: name split into firstName + lastName',
  item: {
    type: 'object',
    required: ['id', 'firstName', 'lastName', 'email'],
    properties: {
      id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  },
  createBody: {
    type: 'object',
    required: ['firstName', 'lastName', 'email'],
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
  updateBody: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
  examples: {
    item: { id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com' },
    createBody: { firstName: 'string', lastName: 'string', email: 'user@example.com' },
    updateBody: { firstName: 'string', lastName: 'string', email: 'user@example.com' },
  },
} as const
