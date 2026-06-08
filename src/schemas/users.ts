import { FastifySchema } from 'fastify'

export interface UserV1 {
  id: string
  name: string
  email: string
}

export interface UserV2 {
  id: string
  firstName: string
  lastName: string
  email: string
}

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

export const addressObject = {
  type: 'object' as const,
  required: ['street', 'city', 'country'],
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
  },
}

export const userV1Item = {
  type: 'object',
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
}

export const userV2Item = {
  type: 'object',
  required: ['id', 'firstName', 'lastName', 'email'],
  properties: {
    id: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
}

export const userV3Item = {
  type: 'object',
  required: ['id', 'firstName', 'lastName', 'email', 'address'],
  properties: {
    id: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: addressObject,
  },
}

export const userDynamicListSchema: FastifySchema = {
  response: {
    200: {
      type: 'array',
      items: { oneOf: [userV1Item, userV2Item, userV3Item] },
    },
  },
}

const userIdParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string' } },
}

const userV1UpdateBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
}

const userV2UpdateBody = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
}

const userV3UpdateBody = {
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
}

export const userDynamicUpdateSchema: FastifySchema = {
  params: userIdParams,
  body: { oneOf: [userV1UpdateBody, userV2UpdateBody, userV3UpdateBody] },
  response: { 200: { oneOf: [userV1Item, userV2Item, userV3Item] } },
}

const userV1CreateBody = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
}

const userV2CreateBody = {
  type: 'object',
  required: ['firstName', 'lastName', 'email'],
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
}

const userV3CreateBody = {
  type: 'object',
  required: ['firstName', 'lastName', 'email', 'address'],
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: addressObject,
  },
  additionalProperties: false,
}

export const userDynamicCreateSchema: FastifySchema = {
  body: { oneOf: [userV1CreateBody, userV2CreateBody, userV3CreateBody] },
  response: {
    201: { oneOf: [userV1Item, userV2Item, userV3Item] },
  },
}

export const userDeleteSchema: FastifySchema = {
  params: userIdParams,
  response: { 204: { type: 'null' } },
}

const exampleAddress = { street: 'string', city: 'string', country: 'string' }

export const exampleV1User = { id: 'string', name: 'string', email: 'user@example.com' }
export const exampleV2User = { id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com' }
export const exampleV3User = { id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com', address: exampleAddress }

export const exampleV1UpdateBody = { name: 'string', email: 'user@example.com' }
export const exampleV2UpdateBody = { firstName: 'string', lastName: 'string', email: 'user@example.com' }
export const exampleV3UpdateBody = { firstName: 'string', lastName: 'string', email: 'user@example.com', address: exampleAddress }
