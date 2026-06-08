import { FastifyInstance } from 'fastify'
import {
  VERSION_REGISTRY as usersVersions,
  ENDPOINT_VERSIONS as usersEndpoints,
  ENDPOINT_EXAMPLE_FIELDS as usersExampleFields,
  VERSION_INDEX_MAP as usersVersionIndexMap,
  addressSchema,
} from './schemas/users'
import { userRoutes } from './routes/users'

// ─── Resource definition types ────────────────────────────────────────────────

export type VersionEntry = {
  openApiName: string
  description: string
  item: object
  examples: Record<string, object>
}

export type ExampleFields = {
  request?: string
  response?: string
  responseIsArray?: boolean
}

export type ResourceDefinition = {
  /** Per-version schemas and examples — the core schema definition. */
  versionRegistry: Record<string, VersionEntry>
  /** Which versions each endpoint supports. Empty array = version-agnostic. */
  endpointVersions: Record<string, string[]>
  /** Maps each endpoint to which example fields in the registry apply. */
  endpointExampleFields: Record<string, ExampleFields>
  /** Explicit date → version-number map (e.g. '2024.06.01' → 2).
   *  Used by the Swagger badge JS to display EntityV2 → 2024.06.01. */
  versionIndexMap: Record<string, number>
  /** Extra OpenAPI component schemas (e.g. shared sub-objects). */
  sharedSchemas?: Record<string, object>
  /** Fastify plugin that registers this resource's routes. */
  registerRoutes: (app: FastifyInstance) => Promise<void>
}

// ─── API Registry ─────────────────────────────────────────────────────────────
// To add a new resource: create its schemas file and routes file, then add
// one entry here. Swagger UI and version handling update automatically.

export const API_REGISTRY: Record<string, ResourceDefinition> = {
  users: {
    versionRegistry: usersVersions as Record<string, VersionEntry>,
    endpointVersions: usersEndpoints,
    endpointExampleFields: usersExampleFields,
    versionIndexMap: usersVersionIndexMap,
    sharedSchemas: { Address: addressSchema },
    registerRoutes: userRoutes,
  },

  // cars: {
  //   versionRegistry: carsVersions as Record<string, VersionEntry>,
  //   endpointVersions: carsEndpoints,
  //   endpointExampleFields: carsExampleFields,
  //   registerRoutes: carRoutes,
  // },
}
