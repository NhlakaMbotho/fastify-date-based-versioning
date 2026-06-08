import { FastifySchema } from 'fastify'
import { userV1Schema } from './users/v1/users'
import { userV2Schema } from './users/v2/users'
import { userV3Schema } from './users/v3/users'

// Re-export interfaces so consumers import from one place
export type { UserV1 } from './users/v1/users'
export type { UserV2 } from './users/v2/users'
export type { UserV3 } from './users/v3/users'
export { addressSchema } from './users/shared'

// ─── Version Registry ─────────────────────────────────────────────────────────
// Maps each release date to its schema file. The vX/ files are the source of
// truth — add a new version by creating schemas/users/vN/users.ts and linking
// it here.

export const VERSION_REGISTRY = {
  '2023.01.01': userV1Schema,
  '2024.06.01': userV2Schema,
  '2025.03.01': userV3Schema,
} as const

export type ApiVersion = keyof typeof VERSION_REGISTRY
export const API_VERSIONS = Object.keys(VERSION_REGISTRY) as ApiVersion[]

// Explicit date → version-number map. Drives badge display: UserV2 → 2024.06.01.
// Add a new entry whenever a new version is added above.
export const VERSION_INDEX_MAP: Record<ApiVersion, number> = {
  '2023.01.01': 1,
  '2024.06.01': 2,
  '2025.03.01': 3,
}

// ─── Endpoint availability ────────────────────────────────────────────────────

export const ENDPOINT_VERSIONS: Record<string, ApiVersion[]> = {
  'GET /api/users':         ['2023.01.01', '2024.06.01', '2025.03.01'],
  'POST /api/users':        ['2023.01.01', '2024.06.01', '2025.03.01'],
  'PATCH /api/users/{id}':  ['2023.01.01', '2024.06.01', '2025.03.01'],
  'DELETE /api/users/{id}': [],
}

export const ENDPOINT_EXAMPLE_FIELDS: Record<string, {
  request?: 'createBody' | 'updateBody'
  response?: 'item'
  responseIsArray?: boolean
}> = {
  'GET /api/users':         { response: 'item', responseIsArray: true },
  'POST /api/users':        { request: 'createBody', response: 'item' },
  'PATCH /api/users/{id}':  { request: 'updateBody', response: 'item' },
  'DELETE /api/users/{id}': {},
}

// ─── Derived Fastify schemas (auto-built from the registry) ───────────────────

// Response schemas reference named components registered via app.addSchema().
// Request body schemas stay inline — they aren't named components.
const allItemRefs = API_VERSIONS.map(v => ({ $ref: `${VERSION_REGISTRY[v].openApiName}#` }))
const allCreateBodies = API_VERSIONS.map(v => VERSION_REGISTRY[v].createBody)
const allUpdateBodies = API_VERSIONS.map(v => VERSION_REGISTRY[v].updateBody)

const userIdParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string' } },
}

export const listFastifySchema: FastifySchema = {
  response: { 200: { type: 'array', items: { oneOf: allItemRefs } } },
}

export const createFastifySchema: FastifySchema = {
  body: { oneOf: allCreateBodies },
  response: { 201: { oneOf: allItemRefs } },
}

export const updateFastifySchema: FastifySchema = {
  params: userIdParams,
  body: { oneOf: allUpdateBodies },
  response: { 200: { oneOf: allItemRefs } },
}

export const deleteFastifySchema: FastifySchema = {
  params: userIdParams,
  response: { 204: { type: 'null' } },
}
