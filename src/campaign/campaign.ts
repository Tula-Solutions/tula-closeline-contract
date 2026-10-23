import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { campaignIdSchema, membershipIdSchema, playIdSchema, teamIdSchema } from '../ids'
import { sendWindowSchema } from '../mail/values'
import { pageQuerySchema, pageSchema } from '../pagination'
import { audienceSchema } from './audience'
import {
  campaignApprovalModeSchema,
  campaignLanguageSchema,
  campaignNameSchema,
  campaignStateSchema,
  countSchema,
  goalSchema,
  MAX_CAMPAIGN_DAILY_CAP,
  windowZoneSchema,
} from './values'

/**
 * A Campaign: a Sequence run against an audience for a goal. `sequenceVersion` is the version
 * saved last (0 while it has no Steps); `previewedVersion` is the Sequence version a preview was
 * accepted for (null if none), so editing the Sequence makes the Campaign need a new preview.
 * `sendWindow` is when it sends, read in the zone `windowZone` names; `dailyCap` bounds sends per
 * day across all its Mailboxes. A Prospect is in at most one active Campaign, and there is no
 * setting to change that. No message text is stored here.
 */
export const campaignSchema = z.strictObject({
  id: campaignIdSchema,
  name: campaignNameSchema,
  goal: goalSchema,
  state: campaignStateSchema,
  audience: audienceSchema,
  audienceVersion: z.number().int().min(0).max(1_000_000),
  sequenceVersion: z.number().int().min(0).max(1_000_000),
  previewedVersion: z.number().int().min(1).max(1_000_000).nullable(),
  previewedAt: timestampSchema.nullable(),
  approvalMode: campaignApprovalModeSchema,
  language: campaignLanguageSchema,
  sendWindow: sendWindowSchema,
  windowZone: windowZoneSchema,
  dailyCap: z.number().int().min(1).max(MAX_CAMPAIGN_DAILY_CAP),
  ownerMembershipId: membershipIdSchema,
  teamId: teamIdSchema.nullable(),
  playId: playIdSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  launchedAt: timestampSchema.nullable(),
  archivedAt: timestampSchema.nullable(),
})

/** A Campaign. */
export type Campaign = z.infer<typeof campaignSchema>

/** The settings a person gives a new Campaign, and the ones they may later change. */
const campaignSettingsShape = {
  name: campaignNameSchema,
  goal: goalSchema,
  audience: audienceSchema,
  approvalMode: campaignApprovalModeSchema,
  language: campaignLanguageSchema,
  sendWindow: sendWindowSchema,
  windowZone: windowZoneSchema,
  dailyCap: z.number().int().min(1).max(MAX_CAMPAIGN_DAILY_CAP),
  teamId: teamIdSchema.nullable(),
}

/**
 * The body that creates a Campaign in `draft` with no Steps. With `playId` the Sequence starts as
 * a copy of that accepted Play. The creator owns it. `approvalMode` defaults to `review`, the
 * safe choice, when left out.
 */
export const createCampaignRequestSchema = z.strictObject({
  ...campaignSettingsShape,
  approvalMode: campaignApprovalModeSchema.default('review'),
  language: campaignLanguageSchema.default('en'),
  windowZone: windowZoneSchema.default('campaign'),
  teamId: teamIdSchema.nullable().default(null),
  playId: playIdSchema.nullable().default(null),
})

/** The body that creates a Campaign. */
export type CreateCampaignRequest = z.input<typeof createCampaignRequestSchema>

/**
 * The body that changes a Campaign's settings: at least one field. Changing the audience or the
 * send window of a `ready` Campaign returns it to `draft`; a `running` one keeps running and
 * applies the change to Prospects not yet enrolled.
 */
export const updateCampaignRequestSchema = z
  .strictObject({
    name: campaignSettingsShape.name.optional(),
    goal: campaignSettingsShape.goal.optional(),
    audience: campaignSettingsShape.audience.optional(),
    approvalMode: campaignSettingsShape.approvalMode.optional(),
    sendWindow: campaignSettingsShape.sendWindow.optional(),
    windowZone: campaignSettingsShape.windowZone.optional(),
    dailyCap: campaignSettingsShape.dailyCap.optional(),
    teamId: campaignSettingsShape.teamId.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Change at least one field')

/** The body that changes a Campaign's settings. */
export type UpdateCampaignRequest = z.infer<typeof updateCampaignRequestSchema>

/** The body that duplicates a Campaign into a new `draft`: the new name only. Enrollments are not copied. */
export const duplicateCampaignRequestSchema = z.strictObject({ name: campaignNameSchema })

/** The path parameters of a request about one Campaign. */
export const campaignParamsSchema = z.strictObject({ campaignId: campaignIdSchema })

/** The query parameters of a Campaign list: filters over what the caller may see. */
export const listCampaignsQuerySchema = pageQuerySchema
  .extend({
    state: campaignStateSchema.optional(),
    ownerMembershipId: membershipIdSchema.optional(),
    teamId: teamIdSchema.optional(),
  })
  .strict()

/** The query parameters of a Campaign list. */
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>

/** One page of Campaigns, newest first (by `createdAt`, then id). */
export const listCampaignsResponseSchema = pageSchema(campaignSchema)

/** The position in a Campaign list. */
export const campaignCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: campaignIdSchema,
})

/** The position in a Campaign list. */
export type CampaignCursor = z.infer<typeof campaignCursorSchema>

/**
 * Counts of a Campaign's Enrollments by outcome. `enrolled` is every Prospect ever enrolled;
 * `active`, `completed` and `stopped` partition it; `replied`, `positiveReplied` (null until the
 * reply classification exists), `meetings`, `bounced` and `unsubscribed` are among those and none
 * is above `enrolled`. There are no open or click counts: nothing is tracked.
 */
export const campaignStatsSchema = z
  .strictObject({
    campaignId: campaignIdSchema,
    enrolled: countSchema,
    active: countSchema,
    completed: countSchema,
    stopped: countSchema,
    sent: countSchema,
    replied: countSchema,
    positiveReplied: countSchema.nullable(),
    meetings: countSchema,
    bounced: countSchema,
    unsubscribed: countSchema,
    computedAt: timestampSchema,
  })
  .superRefine((s, ctx) => {
    if (s.active + s.completed + s.stopped !== s.enrolled) {
      ctx.addIssue({
        code: 'custom',
        path: ['enrolled'],
        message: 'Active, completed and stopped add up to the enrolled',
      })
    }
    for (const field of ['replied', 'meetings', 'bounced', 'unsubscribed'] as const) {
      if (s[field] > s.enrolled) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'No count is above the enrolled' })
      }
    }
  })

/** Counts of a Campaign's Enrollments by outcome. */
export type CampaignStats = z.infer<typeof campaignStatsSchema>
