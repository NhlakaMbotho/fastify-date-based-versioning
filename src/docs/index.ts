import fs from 'fs'
import path from 'path'
import { ResourceDefinition } from '../api-registry'

export const swaggerExtensionsCss = fs.readFileSync(
  path.join(__dirname, '../public/swagger-extensions.css'), 'utf-8',
)
export const domConstantsJs = fs.readFileSync(
  path.join(__dirname, '../public/dom-constants.js'), 'utf-8',
)
export const operationVersionSelectorJs = fs.readFileSync(
  path.join(__dirname, '../public/operation-version-selector.js'), 'utf-8',
)
export const schemaBadgesJs = fs.readFileSync(
  path.join(__dirname, '../public/schema-badges.js'), 'utf-8',
)

export function buildDocsConfig(registry: Record<string, ResourceDefinition>) {
  const versionConfig: Record<string, string[]> = {}
  const versionIndexMap: Record<string, number> = {}

  for (const resource of Object.values(registry)) {
    Object.assign(versionIndexMap, resource.versionIndexMap)
    for (const [endpoint, versions] of Object.entries(resource.endpointVersions)) {
      versionConfig[endpoint] = [...versions]
    }
  }

  return { versionConfig, versionIndexMap }
}
