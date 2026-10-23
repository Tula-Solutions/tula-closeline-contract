import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { foldAscii } from '../email'
import { userIdSchema } from '../ids'

const MAX_RAW_LENGTH = 1000

/** True when the text holds a control character; line breaks and tabs are allowed when `allowLineBreaks` is set. */
export function hasControlCharacter(text: string, allowLineBreaks: boolean): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (allowLineBreaks && (code === 0x0a || code === 0x09)) {
      continue
    }
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) {
      return true
    }
  }
  return false
}

/** Trimmed text of 1 to `maxLength` characters with no control character; a request value is untrusted text for display code. */
export function boundedTextSchema(maxLength: number) {
  return z
    .string()
    .max(Math.max(MAX_RAW_LENGTH, maxLength))
    .trim()
    .pipe(
      z
        .string()
        .min(1)
        .max(maxLength)
        .refine((text) => !hasControlCharacter(text, false), 'No control characters')
    )
}

/** The longest first or last name, in characters. */
export const MAX_PROSPECT_NAME_PART_LENGTH = 100
/** The longest job title, in characters. */
export const MAX_PROSPECT_JOB_TITLE_LENGTH = 200
/** The longest Prospect Company name, in characters. */
export const MAX_PROSPECT_COMPANY_NAME_LENGTH = 200
/** The longest Prospect note, in characters. */
export const MAX_PROSPECT_NOTES_LENGTH = 5000
/** The longest tag, in characters. */
export const MAX_PROSPECT_TAG_LENGTH = 50
/** The most tags one Prospect carries. */
export const MAX_PROSPECT_TAGS = 20
/** The longest search text of a list request, in characters. */
export const MAX_PROSPECT_SEARCH_LENGTH = 100
/** The longest value a stored field returns, in characters: a `technologies` list is stored as JSON text of up to 5,300. */
export const MAX_PROSPECT_FIELD_VALUE_LENGTH = 5300
/** The longest Source reference (an import job id, a CRM record id), in characters. */
export const MAX_SOURCE_REF_LENGTH = 200

/** A first or last name in a request: trimmed, 1 to 100 characters, no control character. */
export const prospectNamePartSchema = boundedTextSchema(MAX_PROSPECT_NAME_PART_LENGTH)

/** A job title in a request: trimmed, 1 to 200 characters, no control character. */
export const prospectJobTitleSchema = boundedTextSchema(MAX_PROSPECT_JOB_TITLE_LENGTH)

/** A Prospect Company name in a request: trimmed, 1 to 200 characters, no control character. */
export const prospectCompanyNameSchema = boundedTextSchema(MAX_PROSPECT_COMPANY_NAME_LENGTH)

/** The most technologies one Prospect Company carries. */
export const MAX_PROSPECT_COMPANY_TECHNOLOGIES = 50
/** The longest technology name, in characters. */
export const MAX_PROSPECT_COMPANY_TECHNOLOGY_LENGTH = 100
/** The largest employee count of a Prospect Company. */
export const MAX_PROSPECT_COMPANY_EMPLOYEE_COUNT = 999_999_999

/** A Prospect Company industry in a request: trimmed, 1 to 200 characters, no control character. */
export const prospectCompanyIndustrySchema = boundedTextSchema(MAX_PROSPECT_COMPANY_NAME_LENGTH)

/** A Prospect Company region in a request: trimmed, 1 to 200 characters, no control character. */
export const prospectCompanyRegionSchema = boundedTextSchema(MAX_PROSPECT_COMPANY_NAME_LENGTH)

/** A Prospect Company employee count in a request: an integer from 0 to 999,999,999. */
export const prospectCompanyEmployeeCountSchema = z
  .number()
  .int()
  .min(0)
  .max(MAX_PROSPECT_COMPANY_EMPLOYEE_COUNT)

/** The technologies of a Prospect Company in a request: at most 50, each trimmed and 1 to 100 characters. */
export const prospectCompanyTechnologiesSchema = z
  .array(boundedTextSchema(MAX_PROSPECT_COMPANY_TECHNOLOGY_LENGTH))
  .max(MAX_PROSPECT_COMPANY_TECHNOLOGIES)

/** Free-text notes on a Prospect: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
export const prospectNotesSchema = z
  .string()
  .max(MAX_PROSPECT_NOTES_LENGTH * 2)
  .trim()
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_PROSPECT_NOTES_LENGTH)
      .refine((text) => !hasControlCharacter(text, true), 'No control characters')
  )

/** The tags of a Prospect in a request: at most 20, each trimmed and 1 to 50 characters, no duplicates. */
export const prospectTagsSchema = z
  .array(boundedTextSchema(MAX_PROSPECT_TAG_LENGTH))
  .max(MAX_PROSPECT_TAGS)
  .refine((tags) => new Set(tags).size === tags.length, 'No duplicate tags')

/**
 * A phone number as typed in a request: 3 to 40 characters of digits, spaces, `+`, `(`, `)`, `.`
 * and `-`. Core normalises it to E.164 (ADR 0011) and refuses what it cannot, as `request.invalid`.
 */
export const rawPhoneSchema = z
  .string()
  .max(MAX_RAW_LENGTH)
  .trim()
  .pipe(
    z
      .string()
      .min(3)
      .max(40)
      .regex(/^\+?[0-9 ().-]+$/)
  )

/** A phone number in E.164 form, as a response carries a normalised one: `+` and 7 to 15 digits. */
export const e164PhoneSchema = z.string().regex(/^\+[1-9][0-9]{6,14}$/)

/**
 * A LinkedIn profile address as typed in a request: 1 to 300 characters naming `linkedin.com`.
 * Core normalises it (ADR 0011) and refuses what it cannot, as `request.invalid`.
 */
export const rawLinkedinUrlSchema = z
  .string()
  .max(MAX_RAW_LENGTH)
  .trim()
  .pipe(
    z
      .string()
      .min(1)
      .max(300)
      .refine((text) => /linkedin\.com\//i.test(text), 'A linkedin.com address')
      .refine((text) => !hasControlCharacter(text, false), 'No control characters')
  )

/**
 * A company web domain in a request: folded to lower case, 3 to 253 characters, dotted ASCII
 * labels of letters, digits and hyphens (an internationalised domain is sent in punycode).
 */
export const prospectCompanyDomainSchema = z
  .string()
  .max(MAX_RAW_LENGTH)
  .trim()
  .transform(foldAscii)
  .pipe(
    z
      .string()
      .min(3)
      .max(253)
      .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/)
  )

/** The kinds of identity a Prospect is matched on (ADR 0011). */
export const PROSPECT_IDENTITY_KINDS = ['email', 'phone', 'linkedin'] as const

/** The kind of identity a Prospect is matched on. */
export const prospectIdentityKindSchema = z.enum(PROSPECT_IDENTITY_KINDS)

/** The kind of identity a Prospect is matched on. */
export type ProspectIdentityKind = z.infer<typeof prospectIdentityKindSchema>

/** The fields of a Prospect that carry a Source, in the camelCase the API uses. Email, phone and LinkedIn are also its identities. */
export const PROSPECT_FIELD_NAMES = [
  'firstName',
  'lastName',
  'jobTitle',
  'email',
  'phone',
  'linkedinUrl',
] as const

/** The name of a Prospect field that carries a Source. */
export const prospectFieldNameSchema = z.enum(PROSPECT_FIELD_NAMES)

/** The name of a Prospect field that carries a Source. */
export type ProspectFieldName = z.infer<typeof prospectFieldNameSchema>

/** The fields of a Prospect Company that carry a Source, in the camelCase the API and the enrichment payload use. */
export const PROSPECT_COMPANY_FIELD_NAMES = [
  'name',
  'domain',
  'industry',
  'employeeCount',
  'region',
  'technologies',
] as const

/** The name of a Prospect Company field that carries a Source. */
export const prospectCompanyFieldNameSchema = z.enum(PROSPECT_COMPANY_FIELD_NAMES)

/** The name of a Prospect Company field that carries a Source. */
export type ProspectCompanyFieldName = z.infer<typeof prospectCompanyFieldNameSchema>

/** The most history entries kept per field (ADR 0020 bounds the history); the oldest non-current entries go first. */
export const MAX_FIELD_HISTORY_ENTRIES = 50

/** The Source kinds that are fixed words; `enrichment:<provider>` is the open one. */
export const FIXED_SOURCE_KINDS = [
  'manual',
  'import',
  'crm:hubspot',
  'crm:salesforce',
  'form',
] as const

/**
 * A Source kind (ADR 0020): `manual`, `import`, `crm:hubspot`, `crm:salesforce`, `form` or
 * `enrichment:<provider>` with a provider of 1 to 32 lower-case letters, digits and underscores.
 * Writers never choose it in a request body: core sets it from the route and the token.
 */
export const sourceKindSchema = z.union([
  z.enum(FIXED_SOURCE_KINDS),
  z.string().regex(/^enrichment:[a-z][a-z0-9_]{0,31}$/),
])

/** A Source kind. */
export type SourceKind = z.infer<typeof sourceKindSchema>

/**
 * A stored value with where it came from, when and who set it (ADR 0020). `sourceRef` names the
 * import job or CRM record and is `null` for manual entry; `setByUserId` is `null` when a system
 * (an import job, a sync, a provider) set the value rather than a person.
 */
export const fieldValueSchema = z.object({
  value: z.string().min(1).max(MAX_PROSPECT_FIELD_VALUE_LENGTH),
  source: sourceKindSchema,
  sourceRef: z.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  setAt: timestampSchema,
  setByUserId: userIdSchema.nullable(),
})

/** A stored value with its Source, time and actor. */
export type FieldValue = z.infer<typeof fieldValueSchema>

/** The states of a history entry: `current` is the value in force, `superseded` an earlier one, `suggested` an enrichment value kept beside an own value (ADR 0020). */
export const FIELD_HISTORY_STATES = ['current', 'superseded', 'suggested'] as const

/** The state of a history entry. */
export const fieldHistoryStateSchema = z.enum(FIELD_HISTORY_STATES)

/** One entry of a field's history: the value with its Source, time and actor, and whether it is current, superseded or only suggested. */
export const fieldHistoryEntrySchema = fieldValueSchema.extend({ state: fieldHistoryStateSchema })

/** One entry of a field's history. */
export type FieldHistoryEntry = z.infer<typeof fieldHistoryEntrySchema>
