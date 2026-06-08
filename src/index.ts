import fs from 'fs'
import path from 'path'
import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { userRoutes } from './routes/users'
import {
  addressObject, userV1Item, userV2Item, userV3Item,
  exampleV1User, exampleV2User, exampleV3User,
  exampleV1UpdateBody, exampleV2UpdateBody, exampleV3UpdateBody,
} from './schemas/users'

const customJs = fs.readFileSync(path.join(__dirname, 'public/operation-version-selector.js'), 'utf-8')
const schemaBadgesJs = fs.readFileSync(path.join(__dirname, 'public/schema-badges.js'), 'utf-8')

const app = Fastify({ logger: true })

// Maps "METHOD /path" (OpenAPI format) → date versions that support it.
// Update this whenever a new version adds or removes an endpoint.
const VERSION_CONFIG: Record<string, string[]> = {
  'GET /api/users': ['2023.01.01', '2024.06.01', '2025.03.01'],
  'POST /api/users': [],
  'PATCH /api/users/{id}': ['2023.01.01', '2024.06.01', '2025.03.01'],
  'DELETE /api/users/{id}': [],
}

const EXAMPLES_CONFIG: Record<string, Record<string, { response?: unknown; request?: unknown }>> = {
  'GET /api/users': {
    '2023.01.01': { response: [exampleV1User] },
    '2024.06.01': { response: [exampleV2User] },
    '2025.03.01': { response: [exampleV3User] },
  },
  'PATCH /api/users/{id}': {
    '2023.01.01': { request: exampleV1UpdateBody, response: exampleV1User },
    '2024.06.01': { request: exampleV2UpdateBody, response: exampleV2User },
    '2025.03.01': { request: exampleV3UpdateBody, response: exampleV3User },
  },
}

app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Users API',
      version: '1.0.0',
    },
    tags: [
      { name: 'Users', description: 'User management endpoints.' },
    ],
  },
  transformObject: (doc) => {
    if (!('openapiObject' in doc)) return doc.swaggerObject
    const api = doc.openapiObject as Record<string, any>

    api.components ??= {}
    api.components.schemas = {
      Address: addressObject,
      UserV1: { ...userV1Item, description: 'User shape for API version 2023.01.01' },
      UserV2: { ...userV2Item, description: 'User shape for API version 2024.06.01' },
      UserV3: { ...userV3Item, description: 'User shape for API version 2025.03.01 (latest)' },
    }

    Object.entries(VERSION_CONFIG).forEach(([configKey, versions]) => {
      if (versions.length === 0) return
      const spaceIdx = configKey.indexOf(' ')
      const method = configKey.slice(0, spaceIdx).toLowerCase()
      const urlPath = configKey.slice(spaceIdx + 1)
      const operation = api.paths?.[urlPath]?.[method]
      if (!operation) return

      const examplesByVersion = EXAMPLES_CONFIG[configKey]
      if (!examplesByVersion) return

      const responseExamples: Record<string, object> = {}
      const requestExamples: Record<string, object> = {}
      Object.entries(examplesByVersion).forEach(([ver, ex]) => {
        if (ex.response !== undefined) responseExamples[ver] = { summary: `Version ${ver}`, value: ex.response }
        if (ex.request !== undefined) requestExamples[ver] = { summary: `Version ${ver}`, value: ex.request }
      })

      Object.values(operation.responses ?? {}).forEach((res: any) => {
        const mt = res?.content?.['application/json']
        if (mt && Object.keys(responseExamples).length > 0) mt.examples = responseExamples
      })

      const reqMt = operation.requestBody?.content?.['application/json']
      if (reqMt && Object.keys(requestExamples).length > 0) reqMt.examples = requestExamples
    })

    return doc.openapiObject
  },
})

app.register(swaggerUi, {
  routePrefix: '/docs',
  theme: {
    js: [
      {
        filename: 'ver-config.js',
        content: `window.__VER_CONFIG__=${JSON.stringify(VERSION_CONFIG)};`,
      },
      {
        filename: 'operation-version-selector.js',
        content: customJs,
      },
      {
        filename: 'schema-badges.js',
        content: schemaBadgesJs,
      },
    ],
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    tryItOutEnabled: true,
  },
})

app.register(userRoutes)

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`
  ┌──────────────────────────────────────────┐
  │  Users API  →  http://localhost:3000     │
  │  Docs       →  http://localhost:3000/docs│
  │                                          │
  │  GET    /api/users                       │
  │  POST   /api/users                       │
  │  PATCH  /api/users/:id                   │
  │  DELETE /api/users/:id                   │
  │  Accept-Version: 2023.01.01              │
  │                   2024.06.01             │
  │                   2025.03.01             │
  └──────────────────────────────────────────┘
  `)
})
