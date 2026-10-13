import { z } from 'zod'

/** The largest page any list endpoint returns. */
export const MAX_PAGE_SIZE = 100

/** The page size used when a request does not ask for one. */
export const DEFAULT_PAGE_SIZE = 25

const MAX_CURSOR_LENGTH = 512

const cursorTextSchema = z.string().min(1).max(MAX_CURSOR_LENGTH)

/** The query parameters of a list request: an optional cursor and a bounded limit (from a number or digit string). */
export const pageQuerySchema = z.object({
  cursor: cursorTextSchema.optional(),
  limit: z
    .union([z.number(), z.string().regex(/^\d{1,3}$/)])
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1).max(MAX_PAGE_SIZE))
    .default(DEFAULT_PAGE_SIZE),
})

/** The parsed query parameters of a list request. */
export type PageQuery = z.infer<typeof pageQuerySchema>

/** Builds the schema of one page of `itemSchema` items and the cursor for the next page, or null at the end. */
export function pageSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema).max(MAX_PAGE_SIZE),
    nextCursor: cursorTextSchema.nullable(),
  })
}

/** One page of items, as returned by a list endpoint. */
export type Page<T> = { items: T[]; nextCursor: string | null }

/** Encodes a JSON-serialisable value as an opaque URL-safe cursor (base64url of its JSON). */
export function encodeCursor(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

/** Decodes a cursor made by {@link encodeCursor}; returns undefined, never throws, for anything invalid. */
export function decodeCursor<T extends z.ZodType>(
  text: string,
  schema: T
): z.output<T> | undefined {
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length > MAX_CURSOR_LENGTH) {
    return undefined
  }
  try {
    const padded = text.replaceAll('-', '+').replaceAll('_', '/')
    const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    const result = schema.safeParse(JSON.parse(json))
    return result.success ? result.data : undefined
  } catch {
    return undefined
  }
}
