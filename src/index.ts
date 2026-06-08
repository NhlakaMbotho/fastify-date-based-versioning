import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { API_REGISTRY } from './api-registry'
import { buildDocsConfig, swaggerExtensionsCss, domConstantsJs, operationVersionSelectorJs, schemaBadgesJs } from './docs'

const app = Fastify({
  logger: true,
  ajv: {
    // Allow x-examples on body schemas — @fastify/swagger promotes it to
    // requestBody.content['application/json'].examples in the OpenAPI spec.
    plugins: [(ajv: { addKeyword: (opts: object) => void }) =>
      ajv.addKeyword({ keyword: 'x-examples' })
    ],
  },
})

const { versionConfig, versionIndexMap } = buildDocsConfig(API_REGISTRY)

// Register all resource schemas with Fastify — @fastify/swagger picks them up
// into components/schemas automatically.
for (const resource of Object.values(API_REGISTRY)) {
  if (resource.sharedSchemas) {
    for (const [name, schema] of Object.entries(resource.sharedSchemas)) {
      app.addSchema({ $id: name, ...(schema as object) })
    }
  }
  for (const [version, entry] of Object.entries(resource.versionRegistry).sort(([a], [b]) => b.localeCompare(a))) {
    app.addSchema({
      $id: entry.openApiName,
      ...(entry.item as object),
      description: `${entry.description} (${version})`,
    })
  }
}

app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
  },
})

app.register(swaggerUi, {
  routePrefix: '/docs',
  theme: {
    css: [
      { filename: 'swagger-extensions.css', content: swaggerExtensionsCss },
    ],
    js: [
      {
        filename: 'ver-config.js',
        content: `window.__VER_CONFIG__=${JSON.stringify(versionConfig)};window.__VERSION_INDEX_MAP__=${JSON.stringify(versionIndexMap)};`,
      },
      { filename: 'dom-constants.js', content: domConstantsJs },
      { filename: 'operation-version-selector.js', content: operationVersionSelectorJs },
      { filename: 'schema-badges.js', content: schemaBadgesJs },
    ],
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    tryItOutEnabled: true,
  },
})

for (const resource of Object.values(API_REGISTRY)) {
  app.register(resource.registerRoutes)
}

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
