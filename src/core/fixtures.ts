const HEX = '0190a5e0b3c17d2a8f4e5b6c7d8e9f01'

/** A valid id for a prefix, for tests. */
export const id = (prefix: string, n = 1): string =>
  `${prefix}_${HEX.slice(0, -2)}${n.toString(16).padStart(2, '0')}`

/** A valid timestamp, for tests. */
export const NOW = '2026-10-12T09:30:00.000Z'
