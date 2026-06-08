/**
 * Date Version Resolver
 *
 * A client pins to a date via Accept-Version and receives the API as it
 * existed at that point. Any date >= a version's release date resolves to
 * that version, until the next version's date takes over.
 *
 * Generic — accepts the resource's supported version list so each resource
 * can have its own set of dates.
 */
export function resolveVersion(
  acceptVersion: string | undefined,
  supportedVersions: readonly string[],
): string {
  if (supportedVersions.length === 0) return ''
  if (!acceptVersion) return supportedVersions[0]

  for (let i = supportedVersions.length - 1; i >= 0; i--) {
    if (acceptVersion >= supportedVersions[i]) return supportedVersions[i]
  }

  return supportedVersions[0]
}
