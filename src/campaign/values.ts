import { z } from 'zod'
import { hasControlCharacter } from '../prospect/values'

/** The longest Campaign or Play name, in characters. */
export const MAX_CAMPAIGN_NAME_LENGTH = 100

/** The longest goal of a Campaign or Step, in characters. */
export const MAX_GOAL_LENGTH = 500

/** The longest instruction text of a Step, Variant angle or Rep task, in characters. */
export const MAX_STEP_TEXT_LENGTH = 500

/** The most Steps one Sequence has. A send key carries the Step's position, so this stays under `MAX_SEQUENCE_STEP`. */
export const MAX_SEQUENCE_STEPS = 50

/** The most Prospects one request may name. */
export const MAX_PROSPECTS_PER_REQUEST = 100

/** The most Prospects an explicit audience may list; larger audiences use a filter. */
export const MAX_AUDIENCE_PROSPECTS = 500

/** The most a Campaign may send in a day, whatever the Mailbox limits add up to. */
export const MAX_CAMPAIGN_DAILY_CAP = 5000

/** The longest a wait or Rep task may last, in hours (90 days). */
export const MAX_WAIT_HOURS = 2160

/** The most Plays a proposal request returns. */
export const MAX_PROPOSED_PLAYS = 5

/** The most Citations one Play carries. */
export const MAX_PLAY_CITATIONS = 20

/** Text of 1 to `maxLength` characters, trimmed; line breaks and tabs are allowed, other control characters are not. */
export function multilineTextSchema(maxLength: number) {
  return z
    .string()
    .max(maxLength * 2)
    .trim()
    .pipe(
      z
        .string()
        .min(1)
        .max(maxLength)
        .refine((text) => !hasControlCharacter(text, true), 'No control characters')
    )
}

/** A Campaign or Play name: trimmed, 1 to 100 characters, no control character. */
export const campaignNameSchema = z
  .string()
  .max(MAX_CAMPAIGN_NAME_LENGTH * 2)
  .trim()
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_CAMPAIGN_NAME_LENGTH)
      .refine((text) => !hasControlCharacter(text, false), 'No control characters')
  )

/** A goal: what the Campaign or Step is for, 1 to 500 characters. */
export const goalSchema = multilineTextSchema(MAX_GOAL_LENGTH)

/** Instruction text for a Step, a Variant angle or a Rep task, 1 to 500 characters. */
export const stepTextSchema = multilineTextSchema(MAX_STEP_TEXT_LENGTH)

/**
 * The key of a Step or Variant inside a Sequence: 1 to 40 characters of lowercase letters, digits,
 * `_` and `-`, starting with a letter. Steps point at one another by key.
 */
export const stepKeySchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z][a-z0-9_-]*$/)

/** The key of a Step or Variant. */
export type StepKey = z.infer<typeof stepKeySchema>

/** A whole number of hours from 1 to `MAX_WAIT_HOURS`. */
export const hoursSchema = z.number().int().min(1).max(MAX_WAIT_HOURS)

/**
 * The state of a Campaign: `draft` (being built), `ready` (previewed, can launch), `running`,
 * `paused` (nothing is sent; Enrollments keep their place) and `archived` (history kept, nothing
 * runs). Editing the Sequence or the audience of a `ready` Campaign returns it to `draft`.
 */
export const CAMPAIGN_STATES = ['draft', 'ready', 'running', 'paused', 'archived'] as const

/** The state of a Campaign. */
export const campaignStateSchema = z.enum(CAMPAIGN_STATES)

/** The state of a Campaign. */
export type CampaignState = z.infer<typeof campaignStateSchema>

/**
 * How drafts reach a Prospect: `auto` (the Agent sends grounded drafts that pass every check),
 * `review` (every draft waits in the approvals inbox) or `mixed` (auto for grounded drafts, review
 * for the rest). A draft that fails a check or is not grounded waits for review in every mode.
 */
export const CAMPAIGN_APPROVAL_MODES = ['auto', 'review', 'mixed'] as const

/** How drafts reach a Prospect. */
export const campaignApprovalModeSchema = z.enum(CAMPAIGN_APPROVAL_MODES)

/** How drafts reach a Prospect. */
export type CampaignApprovalMode = z.infer<typeof campaignApprovalModeSchema>

/** The languages a Campaign writes in in this release: English only. */
export const CAMPAIGN_LANGUAGES = ['en'] as const

/** The language a Campaign writes in. */
export const campaignLanguageSchema = z.enum(CAMPAIGN_LANGUAGES)

/** The language a Campaign writes in. */
export type CampaignLanguage = z.infer<typeof campaignLanguageSchema>

/** Whose time zone the send window is read in: the Campaign's own, or each Prospect's where known (the Campaign's otherwise). */
export const WINDOW_ZONES = ['campaign', 'prospect'] as const

/** Whose time zone the send window is read in. */
export const windowZoneSchema = z.enum(WINDOW_ZONES)

/** Whose time zone the send window is read in. */
export type WindowZone = z.infer<typeof windowZoneSchema>

/**
 * A count of Prospects, Enrollments or sends: a whole number from 0 up to a generous bound, so a
 * schema never accepts an absurd value.
 */
export const countSchema = z.number().int().min(0).max(100_000_000)
