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

// ─── Per-version OpenAPI examples ─────────────────────────────────────────────
// Builds the named examples map for the `content` form of a route schema.
// @fastify/swagger passes `content` objects through directly to the OpenAPI spec.

function versionExamples(
  endpoint: string,
  field: 'item' | 'createBody' | 'updateBody',
  array = false,
): Record<string, { summary: string; value: unknown }> {
  return Object.fromEntries(
    (ENDPOINT_VERSIONS[endpoint] ?? []).map(v => {
      const val = (VERSION_REGISTRY[v].examples as Record<string, unknown>)[field]
      return [v, { summary: `Version ${v}`, value: array ? [val] : val }]
    }),
  )
}

// ─── Derived Fastify schemas (auto-built from the registry) ───────────────────
// Responses use $ref to named components registered via app.addSchema().
// Examples are embedded here using the OpenAPI `content` wrapper so
// @fastify/swagger places them at the correct spec path natively —
// no transformObject post-processing needed.

const allItemRefs = API_VERSIONS.map(v => ({ $ref: `${VERSION_REGISTRY[v].openApiName}#` }))
const allCreateBodies = API_VERSIONS.map(v => VERSION_REGISTRY[v].createBody)
const allUpdateBodies = API_VERSIONS.map(v => VERSION_REGISTRY[v].updateBody)

const userIdParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string' } },
}

export const listFastifySchema: FastifySchema = {
  response: {
    200: {
      content: {
        'application/json': {
          schema: { type: 'array', items: { oneOf: allItemRefs } },
          examples: versionExamples('GET /api/users', 'item', true),
        },
      },
    },
  },
}

export const createFastifySchema: FastifySchema = {
  body: {
    oneOf: allCreateBodies,
    'x-examples': versionExamples('POST /api/users', 'createBody'),
  },
  response: {
    201: {
      content: {
        'application/json': {
          schema: { oneOf: allItemRefs },
          examples: versionExamples('POST /api/users', 'item'),
        },
      },
    },
  },
}

export const updateFastifySchema: FastifySchema = {
  params: userIdParams,
  body: {
    oneOf: allUpdateBodies,
    'x-examples': versionExamples('PATCH /api/users/{id}', 'updateBody'),
  },
  response: {
    200: {
      content: {
        'application/json': {
          schema: { oneOf: allItemRefs },
          examples: versionExamples('PATCH /api/users/{id}', 'item'),
        },
      },
    },
  },
}

export const deleteFastifySchema: FastifySchema = {
  params: userIdParams,
  response: { 204: { type: 'null' } },
}
