import { ResourceDefinition } from '../api-registry'

export type DocsConfig = {
  examplesConfig: Record<string, Record<string, { response?: unknown; request?: unknown }>>
  versionConfig: Record<string, string[]>
  versionIndexMap: Record<string, number>
}

export function buildDocsConfig(registry: Record<string, ResourceDefinition>): DocsConfig {
  const examplesConfig: Record<string, Record<string, { response?: unknown; request?: unknown }>> = {}
  const versionConfig: Record<string, string[]> = {}
  const versionIndexMap: Record<string, number> = {}

  for (const resource of Object.values(registry)) {
    Object.assign(versionIndexMap, resource.versionIndexMap)

    for (const [endpoint, versions] of Object.entries(resource.endpointVersions)) {
      versionConfig[endpoint] = [...versions]
    }

    for (const [endpoint, versions] of Object.entries(resource.endpointVersions)) {
      if (versions.length === 0) continue
      const fields = resource.endpointExampleFields[endpoint] ?? {}
      examplesConfig[endpoint] = Object.fromEntries(
        versions.map((v) => {
          const examples = resource.versionRegistry[v].examples as Record<string, unknown>
          const ex: { response?: unknown; request?: unknown } = {}
          if (fields.response) {
            const raw = examples[fields.response]
            ex.response = fields.responseIsArray ? [raw] : raw
          }
          if (fields.request) {
            ex.request = examples[fields.request]
          }
          return [v, ex]
        }),
      )
    }
  }

  return { examplesConfig, versionConfig, versionIndexMap }
}
