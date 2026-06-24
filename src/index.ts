import fs from 'fs'
import path from 'path'
import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { API_REGISTRY } from './api-registry'
import { ROUTE_BODY_EXAMPLES } from './schemas/users'

const swaggerExtensionsCss = fs.readFileSync(
  path.join(__dirname, 'public/swagger-extensions.css'), 'utf-8'
)

const app = Fastify({ logger: true })

// Use Zod for request validation and response serialization.
// The hybrid serializer falls back to JSON.stringify for non-Zod response
// schemas (the content-wrapped OpenAPI schemas used for swagger docs).
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(({ schema, method, url }) => {
  if (schema && typeof (schema as any).safeParse === 'function') {
    return serializerCompiler({ schema, method, url } as any)
  }
  return (data) => JSON.stringify(data)
})

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

// Custom swagger transform: converts Zod request schemas to JSON Schema, then
// re-attaches x-examples so the version-selector UI works for request bodies.
app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
  },
  transform: ({ schema, url, route }: { schema: any; url: string; route: any }) => {
    // jsonSchemaTransform can't handle the content-wrapped OpenAPI response schemas;
    // strip them out first, then re-attach after Zod conversion.
    const { response, ...requestSchema } = schema as any
    const result = jsonSchemaTransform({ schema: requestSchema, url })
    if (response) result.schema.response = response

    // Re-attach x-examples so the version-selector UI keeps working.
    const method = (Array.isArray(route?.method) ? route.method[0] : route?.method ?? '') as string
    const openApiUrl = url.replace(/:([^/]+)/g, '{$1}')
    const examples = ROUTE_BODY_EXAMPLES[`${method.toUpperCase()} ${openApiUrl}`]
    if (examples && result.schema.body) {
      ;(result.schema.body as any)['x-examples'] = examples
    }
    return result
  },
})

// schemaName → date version string for deprecated schemas (omitted for latest).
// Versions sort lexicographically (YYYY.MM.DD), so the last sorted key is latest.
const versionConfig: Record<string, string[]> = {}
const schemaConfig: Record<string, string> = {}
for (const resource of Object.values(API_REGISTRY)) {
  for (const [endpoint, versions] of Object.entries(resource.endpointVersions)) {
    versionConfig[endpoint] = [...versions].sort((a, b) => b.localeCompare(a))
  }
  const sortedVersions = Object.keys(resource.versionRegistry).sort()
  const latestVersion = sortedVersions[sortedVersions.length - 1]
  for (const [version, entry] of Object.entries(resource.versionRegistry)) {
    if (version !== latestVersion) schemaConfig[(entry as any).openApiName] = version
  }
}

// Injected as a theme script so it's available as a browser global at render time.
// The plugin function is serialized as source — closures don't survive — so
// server-side data must reach the browser this way.
const versionConfigJs = `
  window.__VER_CONFIG__ = ${JSON.stringify(versionConfig)};
  window.__SCHEMA_CONFIG__ = ${JSON.stringify(schemaConfig)};
`

function VersionSelectorPlugin(_system: any) {
  const config: Record<string, string[]> = (window as any).__VER_CONFIG__ || {}
  const schemas: Record<string, string> = (window as any).__SCHEMA_CONFIG__ || {}
  const STORAGE_KEY = 'ver-selection'
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!

  function loadSelections(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
  }

  function saveSelection(key: string, version: string) {
    const selections = loadSelections()
    selections[key] = version
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
  }

  function setSelectValue(sel: HTMLSelectElement, value: string) {
    nativeSetter.call(sel, value)
    sel.dispatchEvent(new Event('change', { bubbles: true }))
  }

  return {
    wrapComponents: {
      ObjectModel: function (Original: any, { React }: any) {
        return function (props: any) {
          let schema = props.schema
          if (schema && schema.get) {
            const title: string = schema.get('title') || ''
            const baseTitle: string = title.replace(/V\d+$/, '')
            if (baseTitle !== title) {
              const deprecatedVersion: string = schemas[title] || ''
              schema = schema.set('title', baseTitle)
              if (deprecatedVersion) {
                const inner = React.createElement(Original, Object.assign({}, props, { schema: schema }))
                return React.createElement('div', { className: 'deprecated-model-container', style: { display: 'contents', '--deprecated-version': `"Version ${deprecatedVersion}"` } as any }, inner)
              }
            }
          }
          return React.createElement(Original, Object.assign({}, props, { schema: schema }))
        }
      },
      ModelCollapse: function (Original: any, { React }: any) {
        return function (props: any) {
          const displayName: string = props.displayName || ''
          // Strip trailing VN suffix (UserV3 → User). If nothing to strip, pass through.
          const baseName: string = displayName.replace(/V\d+$/, '')
          if (baseName === displayName) return React.createElement(Original, props)

          const deprecatedVersion: string = schemas[displayName] || ''
          const newTitle = React.createElement('span', { className: 'model-box' },
            React.createElement('span', { className: 'model model-title' },
              baseName,
              deprecatedVersion
                ? React.createElement('span', { className: 'schema-deprecated-badge' }, `Version ${deprecatedVersion}`)
                : null,
            ),
          )
          return React.createElement(Original, Object.assign({}, props, { title: newTitle, displayName: baseName }))
        }
      },
      OperationSummary: function (Original: any, { React }: any) {
        return function VersionSelectorSummary(props: any) {
          const op = props.operationProps && props.operationProps.toJS()
          const path: string = op ? (op.path || '') : ''
          const method: string = op ? (op.method || '').toUpperCase() : ''
          const key = method + ' ' + path
          const versions = config[key] || []
          const latestVersion = versions[0] || ''
          const [selected, setSelected] = React.useState(() => loadSelections()[key] ?? latestVersion)
          const isLatest = versions.length <= 1 || selected === latestVersion
          const anchorRef = React.useRef(null)
          const controlsRef = React.useRef(null)

          React.useLayoutEffect(function () {
            const anchor = anchorRef.current
            const controls = controlsRef.current
            if (!anchor) return
            const opblock = anchor.closest('.opblock')
            if (!opblock) return

            // Insert controls into opblock-summary just before the expand/collapse
            // arrow button, so: [copy icon] [our controls] [▼]
            if (controls) {
              const summary = opblock.querySelector('.opblock-summary')
              if (summary && !summary.contains(controls)) {
                const arrowBtn = summary.querySelector('.opblock-control-arrow')
                if (arrowBtn) {
                  summary.insertBefore(controls, arrowBtn)
                } else {
                  summary.appendChild(controls)
                }
              }
            }

            // Sync the hidden examples-select after every render
            if (selected) {
              opblock.querySelectorAll('.examples-select select').forEach(function (sel: any) {
                if (sel.value !== selected) setSelectValue(sel, selected)
              })
            }
          })

          return React.createElement('span', { ref: anchorRef, style: { display: 'contents' } },
            React.createElement(Original, props),
            versions.length >= 1 && React.createElement('span', {
              ref: controlsRef,
              style: { display: 'contents' },
              onClick: function (e: any) { e.stopPropagation() },
            },
              !isLatest && React.createElement('span', {
                className: 'version-deprecated-warning',
              }, 'You are using a deprecated API Version'),
              React.createElement('select', {
                className: 'version-drop-down' + (isLatest ? '' : ' deprecated'),
                value: selected,
                onClick: function (e: any) { e.stopPropagation() },
                onChange: function (e: any) {
                  const version = e.target.value
                  setSelected(version)
                  saveSelection(key, version)
                  const opblock = (e.target as HTMLElement).closest('.opblock')
                  if (!opblock) return
                  opblock.querySelectorAll('.examples-select select').forEach(function (sel: any) {
                    if (sel.value !== version) setSelectValue(sel, version)
                  })
                },
              },
                React.createElement('option', { value: latestVersion }, 'Latest Version'),
                ...versions.slice(1).map(function (v: string) {
                  return React.createElement('option', { key: v, value: v }, v)
                }),
              ),
            )
          )
        }
      },
    },
  }
}

app.register(swaggerUi, {
  routePrefix: '/docs',
  theme: {
    css: [{ filename: 'swagger-extensions.css', content: swaggerExtensionsCss }],
    js: [{ filename: 'ver-config.js', content: versionConfigJs }],
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    tryItOutEnabled: true,
    plugins: [VersionSelectorPlugin],
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
