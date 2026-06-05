/**
 * Date Version Resolver
 *
 * Supported version dates in ascending order.
 * A client pins to a date and receives the API as it existed at that point.
 * Any date >= a version's release date resolves to that version,
 * until the next version's date takes over.
 *
 * 2023.01.01 — initial release
 * 2024.06.01 — breaking: name split into firstName + lastName
 * 2025.03.01 — breaking: address nested object added
 */
const VERSION_DATES = ['2023.01.01', '2024.06.01', '2025.03.01'] as const
export type VersionDate = (typeof VERSION_DATES)[number]

/**
 * Resolves the client's Accept-Version header to a known version date.
 *
 * - If the header is missing or before the earliest version, defaults to the earliest.
 * - If the header is beyond the latest version, defaults to the latest.
 * - Otherwise resolves to the highest supported version <= the client's pinned date.
 */
export function resolveVersion(acceptVersion: string | undefined): VersionDate {
  if (!acceptVersion) return VERSION_DATES[0]

  // Walk backwards to find the highest version <= the pinned date
  for (let i = VERSION_DATES.length - 1; i >= 0; i--) {
    if (acceptVersion >= VERSION_DATES[i]) {
      return VERSION_DATES[i]
    }
  }

  return VERSION_DATES[0]
}
