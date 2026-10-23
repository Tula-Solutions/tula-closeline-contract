import { z } from 'zod'
import { hasControlCharacter } from '../prospect/values'

/** The most Prospects one enrichment request may name. */
export const MAX_ENRICH_PROSPECTS = 500

/** The longest value of an enriched field kept, in characters; a longer one is cut and flagged `truncated`. */
export const MAX_ENRICHED_VALUE_LENGTH = 320

/** The most providers the Organization may configure. */
export const MAX_PROVIDERS = 50

/** The longest provider key (the `<provider>` of `enrichment:<provider>`), in characters. */
export const MAX_PROVIDER_KEY_LENGTH = 32

/** The longest API key an Organization may enter for a provider, in characters. It is write-only. */
export const MAX_PROVIDER_API_KEY_LENGTH = 512

/** The most attempts one run records; a run asks each enabled provider of each group at most once. */
export const MAX_ATTEMPTS_PER_RUN = 150

/** The largest cost value, in micro-dollars (one million dollars). */
export const MAX_MICRO_DOLLARS = 1_000_000_000_000

/** The longest text of a signal or a note, in characters. */
export const MAX_SIGNAL_TEXT_LENGTH = 1000

/** The longest short label of a signal (a title, a technology, a department), in characters. */
export const MAX_SIGNAL_LABEL_LENGTH = 200

/** The longest web address of a signal, in characters. */
export const MAX_SIGNAL_URL_LENGTH = 2048

/** The most days a signal of one kind stays fresh. */
export const MAX_SIGNAL_FRESHNESS_DAYS = 3650

/** The most fit criteria an Organization may keep. */
export const MAX_FIT_CRITERIA = 50

/** The longest name of a fit criterion, in characters. */
export const MAX_CRITERION_NAME_LENGTH = 100

/** The most values one fit criterion lists. */
export const MAX_CRITERION_VALUES = 20

/** The longest value of a fit criterion, in characters. */
export const MAX_CRITERION_VALUE_LENGTH = 100

/** The heaviest weight one fit criterion may carry. */
export const MAX_CRITERION_WEIGHT = 100

/** Text of 1 to `maxLength` characters, trimmed, with no control character; line breaks are allowed when `multiline`. */
export function enrichmentTextSchema(maxLength: number, multiline = false) {
  return z
    .string()
    .max(maxLength * 2)
    .trim()
    .pipe(
      z
        .string()
        .min(1)
        .max(maxLength)
        .refine((text) => !hasControlCharacter(text, multiline), 'No control characters')
    )
}

/**
 * Text that came from outside (a provider, a web page, a webhook): untrusted data, kept as a plain
 * string of at most `maxLength` characters with control characters taken out, and never run as an
 * instruction. Unlike {@link enrichmentTextSchema} it does not refuse long input; it cuts it, and
 * the field beside it records the cut.
 */
export function vendorTextSchema(maxLength: number) {
  return z
    .string()
    .max(maxLength * 20)
    .transform((text) => {
      // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what this removes
      const clean = text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim()
      return clean.slice(0, maxLength)
    })
    .pipe(z.string().min(1).max(maxLength))
}

/** An integer cost in micro-dollars (millionths of a dollar), never negative. */
export const microDollarsSchema = z.number().int().min(0).max(MAX_MICRO_DOLLARS)

/**
 * A provider key: 1 to 32 lower-case letters, digits and underscores, starting with a letter. It
 * is an opaque name the Organization and the service agree on and is the `<provider>` of the
 * Source `enrichment:<provider>`. The contract names no vendor.
 */
export const providerKeySchema = z
  .string()
  .max(MAX_PROVIDER_KEY_LENGTH)
  .regex(/^[a-z][a-z0-9_]*$/)

/** A provider key. */
export type ProviderKey = z.infer<typeof providerKeySchema>

/** The field groups a waterfall fills, each with its own ordered providers. */
export const FIELD_GROUPS = ['person', 'company', 'email_verification'] as const

/** A field group of the waterfall. */
export const fieldGroupSchema = z.enum(FIELD_GROUPS)

/** A field group of the waterfall. */
export type FieldGroup = z.infer<typeof fieldGroupSchema>

/** The fields enrichment can fill, in the camelCase the API uses. Phone numbers are never enriched (ADR 0003). */
export const ENRICHED_FIELDS = [
  'firstName',
  'lastName',
  'jobTitle',
  'linkedinUrl',
  'email',
  'companyName',
  'companyDomain',
  'industry',
  'employeeCount',
  'region',
  'technologies',
] as const

/** A field enrichment can fill. */
export const enrichedFieldNameSchema = z.enum(ENRICHED_FIELDS)

/** A field enrichment can fill. */
export type EnrichedFieldName = z.infer<typeof enrichedFieldNameSchema>

/** Which group fills which field. `email` is checked by the verification group, not looked up. */
export const FIELD_GROUP_OF: Readonly<Record<EnrichedFieldName, FieldGroup>> = Object.freeze({
  firstName: 'person',
  lastName: 'person',
  jobTitle: 'person',
  linkedinUrl: 'person',
  email: 'email_verification',
  companyName: 'company',
  companyDomain: 'company',
  industry: 'company',
  employeeCount: 'company',
  region: 'company',
  technologies: 'company',
})

/** The months an enrichment budget is counted in, as `YYYY-MM` (UTC). */
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
