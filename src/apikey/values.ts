import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { apiKeyIdSchema, membershipIdSchema, organizationIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema } from '../prospect/values'
import { roleSchema } from '../tenancy'

/**
 * The areas an API key may be scoped to. A closed list: keys never reach the Organization's own
 * administration (members, billing, API keys, audit log, exports, Agent instructions and controls).
 */
export const API_KEY_AREAS = [
  'prospects',
  'consent',
  'enrichment',
  'campaigns',
  'messaging',
  'bookings',
  'playbook',
  'calls',
] as const

/** The area of an API key scope. */
export const apiKeyAreaSchema = z.enum(API_KEY_AREAS)

/** Every scope name, `<area>:read` or `<area>:write`, in a fixed order. `write` does not include `read`: a key lists both when it needs both. */
export const API_KEY_SCOPES = [
  'prospects:read',
  'prospects:write',
  'consent:read',
  'consent:write',
  'enrichment:read',
  'enrichment:write',
  'campaigns:read',
  'campaigns:write',
  'messaging:read',
  'messaging:write',
  'bookings:read',
  'bookings:write',
  'playbook:read',
  'playbook:write',
  'calls:read',
  'calls:write',
] as const

/** The name of an API key scope: `<area>:read` or `<area>:write`. */
export const apiKeyScopeSchema = z.enum(API_KEY_SCOPES)

/** The name of an API key scope. */
export type ApiKeyScope = z.infer<typeof apiKeyScopeSchema>

/** The longest name of an API key, in characters. */
export const MAX_API_KEY_NAME_LENGTH = 80

/** The prefix every API key secret starts with, so a leaked key is recognisable to secret scanners. */
export const API_KEY_SECRET_PREFIX = 'clk_'

/** The number of characters of the secret kept for display: the prefix and the next 8. */
export const API_KEY_DISPLAY_PREFIX_LENGTH = 12

/** The API key secret: `clk_` and 43 URL-safe characters (256 bits). Shown once, on creation. */
export const apiKeySecretSchema = z.string().regex(/^clk_[A-Za-z0-9_-]{43}$/)

/** The part of an API key secret kept and shown for recognition: `clk_` and 8 characters. Not enough to use the key. */
export const apiKeyDisplayPrefixSchema = z.string().regex(/^clk_[A-Za-z0-9_-]{8}$/)

const scopeListSchema = z
  .array(apiKeyScopeSchema)
  .min(1)
  .max(API_KEY_SCOPES.length)
  .refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Each scope appears once',
  })

/**
 * The body of a request to create an API key: a name, the scopes it needs, the highest role it may
 * act as (never above the creator's, default `rep`) and an optional expiry. Unknown fields are refused.
 */
export const createApiKeyRequestSchema = z.strictObject({
  name: boundedTextSchema(MAX_API_KEY_NAME_LENGTH),
  scopes: scopeListSchema,
  roleCeiling: roleSchema.default('rep'),
  expiresAt: timestampSchema.nullable().default(null),
})

/** The body of a request to create an API key. */
export type CreateApiKeyRequest = z.infer<typeof createApiKeyRequestSchema>

/** An API key as read: never the secret or its hash, only the display prefix, use and state. */
export const apiKeySchema = z.object({
  id: apiKeyIdSchema,
  name: boundedTextSchema(MAX_API_KEY_NAME_LENGTH),
  prefix: apiKeyDisplayPrefixSchema,
  scopes: scopeListSchema,
  roleCeiling: roleSchema,
  expiresAt: timestampSchema.nullable(),
  lastUsedAt: timestampSchema.nullable(),
  revokedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  createdByMembershipId: membershipIdSchema,
})

/** An API key as read. */
export type ApiKey = z.infer<typeof apiKeySchema>

/** The answer to creating an API key: the key and its secret, returned this once and never again (a replay of the same request has `secret: null`). */
export const createApiKeyResponseSchema = apiKeySchema.extend({
  secret: apiKeySecretSchema.nullable(),
})

/** The answer to creating an API key. */
export type CreateApiKeyResponse = z.infer<typeof createApiKeyResponseSchema>

/** The query of an API key list: cursor, limit (at most 100) and whether revoked keys are included. */
export const listApiKeysQuerySchema = pageQuerySchema.extend({
  includeRevoked: z
    .union([z.boolean(), z.enum(['true', 'false']).transform((text) => text === 'true')])
    .optional(),
})

/** One page of API keys, newest first. Never carries a secret. */
export const listApiKeysResponseSchema = pageSchema(apiKeySchema)

/** The body of the internal call that verifies a presented key secret (auth to core). */
export const verifyApiKeyRequestSchema = z.strictObject({ secret: apiKeySecretSchema })

/** The answer to a successful key verification: who the key acts for and what it may do. */
export const verifyApiKeyResponseSchema = z.object({
  apiKeyId: apiKeyIdSchema,
  organizationId: organizationIdSchema,
  scopes: scopeListSchema,
  roleCeiling: roleSchema,
  expiresAt: timestampSchema.nullable(),
})

/** The answer to a successful key verification. */
export type VerifyApiKeyResponse = z.infer<typeof verifyApiKeyResponseSchema>
