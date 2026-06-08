type ExamplesConfig = Record<string, Record<string, { response?: unknown; request?: unknown }>>

export function buildTransformObject(examplesConfig: ExamplesConfig) {
  return (doc: any) => {
    if (!('openapiObject' in doc)) return doc.swaggerObject
    const api = doc.openapiObject as Record<string, any>

    Object.entries(examplesConfig).forEach(([configKey, byVersion]) => {
      const spaceIdx = configKey.indexOf(' ')
      const method = configKey.slice(0, spaceIdx).toLowerCase()
      const urlPath = configKey.slice(spaceIdx + 1)
      const operation = api.paths?.[urlPath]?.[method]
      if (!operation) return

      const responseExamples: Record<string, object> = {}
      const requestExamples: Record<string, object> = {}
      Object.entries(byVersion).forEach(([ver, ex]) => {
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
  }
}
