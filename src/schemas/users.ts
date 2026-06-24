import { z } from 'zod'
import { FastifySchema } from 'fastify'
import { userV1Schema, userV1CreateBodyZodSchema, userV1UpdateBodyZodSchema } from './users/v1/users'
import { userV2Schema, userV2CreateBodyZodSchema, userV2UpdateBodyZodSchema } from './users/v2/users'
import { userV3Schema, userV3CreateBodyZodSchema, userV3UpdateBodyZodSchema } from './users/v3/users'

// Re-export types so consumers import from one place
export type { UserV1 } from './users/v1/users'
export type { UserV2 } from './users/v2/users'
export type { UserV3 } from './users/v3/users'
export { addressSchema, addressZodSchema } from './users/shared'

// ─── Version Registry ─────────────────────────────────────────────────────────

export const VERSION_REGISTRY = {
  '2023.01.01': userV1Schema,
  '2024.06.01': userV2Schema,
  '2025.03.01': userV3Schema,
} as const

export type ApiVersion = keyof typeof VERSION_REGISTRY
export const API_VERSIONS = Object.keys(VERSION_REGISTRY) as ApiVersion[]

export const VERSION_INDEX_MAP: Record<ApiVersion, number> = {
  '2023.01.01': 1,
  '2024.06.01': 2,
  '2025.03.01': 3,
}

// ─── Endpoint availability ────────────────────────────────────────────────────

export const ENDPOINT_VERSIONS: Record<string, ApiVersion[]> = {
  'GET /api/users': ['2023.01.01', '2024.06.01', '2025.03.01'],
  'POST /api/users': ['2023.01.01', '2024.06.01', '2025.03.01'],
  'PATCH /api/users/{id}': ['2023.01.01', '2024.06.01'],
  'DELETE /api/users/{id}': [],
}

// ─── Per-version OpenAPI examples ─────────────────────────────────────────────

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

// ─── Zod request schemas ──────────────────────────────────────────────────────
// Used in routes for validation + automatic TypeScript inference.

export const userIdParamsZodSchema = z.object({ id: z.string() })

// Accept-Version is optional; passthrough lets other standard headers through.
export const acceptVersionHeaderZodSchema = z.object({
  'accept-version': z.string().optional(),
}).passthrough()

// Union tries most-specific version first so strict() correctly rejects bodies
// that carry fields belonging to a later schema version.
export const createBodyZodSchema = z.union([
  userV3CreateBodyZodSchema,
  userV2CreateBodyZodSchema,
  userV1CreateBodyZodSchema,
])

export const updateBodyZodSchema = z.union([
  userV3UpdateBodyZodSchema,
  userV2UpdateBodyZodSchema,
  userV1UpdateBodyZodSchema,
])

// x-examples for request bodies, keyed by "METHOD /openapi/path".
// Used by the custom swagger transform to re-attach per-version examples after
// jsonSchemaTransform converts the Zod union schema to plain JSON Schema.
export const ROUTE_BODY_EXAMPLES: Record<string, Record<string, { summary: string; value: unknown }>> = {
  'POST /api/users': versionExamples('POST /api/users', 'createBody'),
  'PATCH /api/users/{id}': versionExamples('PATCH /api/users/{id}', 'updateBody'),
}

// ─── Response-only Fastify schemas ───────────────────────────────────────────
// Body and params are now provided as Zod schemas directly in routes.
// These objects carry only the `response` section (for OpenAPI docs).

const allItemRefs = API_VERSIONS.map(v => ({ $ref: `${VERSION_REGISTRY[v].openApiName}#` }))

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
  response: { 204: { type: 'null' } },
}
