import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  FIELD_GROUPS,
  fieldGroupSchema,
  MAX_PROVIDER_API_KEY_LENGTH,
  MAX_PROVIDERS,
  microDollarsSchema,
  monthSchema,
  providerKeySchema,
} from './values'

/**
 * What an Organization sees of one provider. There is no key field: the key an Admin entered is
 * stored encrypted and never returned, logged or put in an error report; `credentialSet` says only
 * whether one is stored. `groups` are the field groups the provider can serve.
 */
export const providerSettingsSchema = z.object({
  provider: providerKeySchema,
  enabled: z.boolean(),
  credentialSet: z.boolean(),
  credentialUpdatedAt: timestampSchema.nullable(),
  groups: z.array(fieldGroupSchema).max(FIELD_GROUPS.length),
  updatedAt: timestampSchema.nullable(),
})

/** What an Organization sees of one provider; it holds no key. */
export type ProviderSettings = z.infer<typeof providerSettingsSchema>

/** A provider API key as typed: 8 to 512 printable characters without spaces. Write-only; no response holds it. */
export const providerApiKeySchema = z
  .string()
  .min(8)
  .max(MAX_PROVIDER_API_KEY_LENGTH)
  .regex(/^[\x21-\x7e]+$/)

/**
 * The body to change a provider: switch it on or off and, optionally, set its key (`apiKey`) or
 * remove it (`null`). Leaving `apiKey` out keeps the stored key. The key is never read back.
 */
export const setProviderRequestSchema = z.strictObject({
  enabled: z.boolean(),
  apiKey: providerApiKeySchema.nullable().optional(),
})

/** The body to change a provider. */
export type SetProviderRequest = z.infer<typeof setProviderRequestSchema>

/** The query of a provider list: cursor and limit (at most 100). */
export const listProvidersQuerySchema = pageQuerySchema

/** One page of providers, by key. */
export const listProvidersResponseSchema = pageSchema(providerSettingsSchema)

const orderSchema = z
  .array(providerKeySchema)
  .max(MAX_PROVIDERS)
  .refine((order) => new Set(order).size === order.length, 'A provider is listed once')

/** The Organization's provider order per field group; the waterfall asks them first to last. */
const orderShape = {
  person: orderSchema,
  company: orderSchema,
  email_verification: orderSchema,
}

export const waterfallOrderSchema = z.object(orderShape)

/** The provider order per field group. */
export type WaterfallOrder = z.infer<typeof waterfallOrderSchema>

/** The saved provider order with its version and when it was saved. Version 0 is the default order, never saved. */
export const waterfallSchema = z.object({
  order: waterfallOrderSchema,
  version: z.number().int().min(0).max(1_000_000),
  updatedAt: timestampSchema.nullable(),
})

/** The saved provider order. */
export type Waterfall = z.infer<typeof waterfallSchema>

/** The body to save the provider order: the order and the `expectedVersion` the caller read. */
export const setWaterfallRequestSchema = z.strictObject({
  order: z.strictObject(orderShape),
  expectedVersion: z.number().int().min(0).max(1_000_000),
})

/** The body to save the provider order. */
export type SetWaterfallRequest = z.infer<typeof setWaterfallRequestSchema>

/**
 * The Organization's enrichment budget this month: the limit, what was spent (in micro-dollars),
 * what is left, when the month resets (UTC) and the ceiling one run may reach. A run stops before
 * the call that would pass either.
 */
export const enrichmentBudgetSchema = z.object({
  month: monthSchema,
  monthlyLimitMicros: microDollarsSchema,
  perRunCeilingMicros: microDollarsSchema,
  spentMicros: microDollarsSchema,
  remainingMicros: microDollarsSchema,
  resetsAt: timestampSchema,
  version: z.number().int().min(0).max(1_000_000),
  updatedAt: timestampSchema.nullable(),
})

/** The Organization's enrichment budget. */
export type EnrichmentBudget = z.infer<typeof enrichmentBudgetSchema>

/** The body to set the budget: the monthly limit, the per-run ceiling (not above the limit) and the `expectedVersion` the caller read. */
export const setBudgetRequestSchema = z
  .strictObject({
    monthlyLimitMicros: microDollarsSchema,
    perRunCeilingMicros: microDollarsSchema,
    expectedVersion: z.number().int().min(0).max(1_000_000),
  })
  .refine(
    (budget) => budget.perRunCeilingMicros <= budget.monthlyLimitMicros,
    'The run ceiling is not above the monthly limit'
  )

/** The body to set the budget. */
export type SetBudgetRequest = z.infer<typeof setBudgetRequestSchema>

/** What one provider cost in one month: micro-dollars and calls made. */
export const spendEntrySchema = z.object({
  month: monthSchema,
  provider: providerKeySchema,
  costMicros: microDollarsSchema,
  calls: z.number().int().min(0).max(1_000_000_000),
})

/** What one provider cost in one month. */
export type SpendEntry = z.infer<typeof spendEntrySchema>

/** The query of a spend list: cursor, limit (at most 100) and an optional month. */
export const listSpendQuerySchema = pageQuerySchema.extend({ month: monthSchema.optional() })

/** One page of spend entries, newest month first (then provider). */
export const listSpendResponseSchema = pageSchema(spendEntrySchema)
