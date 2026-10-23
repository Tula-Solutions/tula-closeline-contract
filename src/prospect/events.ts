import { z } from 'zod'
import { defineEvent } from '../events'
import {
  membershipIdSchema,
  prospectCompanyIdSchema,
  prospectIdSchema,
  prospectMergeIdSchema,
} from '../ids'
import { MAX_MERGED_PROSPECTS } from './merge'
import { prospectFieldNameSchema, sourceKindSchema } from './values'

/**
 * `prospect.created` (version 1): a Prospect was created. Carries ids and the Source kind, no
 * personal data; a consumer that needs the person reads the Prospect from core.
 */
export const prospectCreatedEvent = defineEvent(
  'prospect.created',
  1,
  z.strictObject({
    prospectId: prospectIdSchema,
    companyId: prospectCompanyIdSchema.nullable(),
    ownerMembershipId: membershipIdSchema.nullable(),
    source: sourceKindSchema,
  })
)

/**
 * `prospect.updated` (version 1): a Prospect changed. `changedFields` names the fields whose
 * current value changed (names only, never values); `ownerChanged`, `companyChanged` and
 * `statusChanged` flag the other attributes. Published once per change.
 */
export const prospectUpdatedEvent = defineEvent(
  'prospect.updated',
  1,
  z.strictObject({
    prospectId: prospectIdSchema,
    changedFields: z.array(prospectFieldNameSchema).max(6),
    ownerChanged: z.boolean(),
    companyChanged: z.boolean(),
    statusChanged: z.boolean(),
    source: sourceKindSchema,
  })
)

/** `prospect.merged` (version 1): Prospects were merged into a survivor; links (such as Deal links) move to the survivor. Ids only. */
export const prospectMergedEvent = defineEvent(
  'prospect.merged',
  1,
  z.strictObject({
    mergeId: prospectMergeIdSchema,
    survivorProspectId: prospectIdSchema,
    mergedProspectIds: z.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS),
  })
)

/**
 * `prospect.erased` (version 1): a Prospect was erased. The Playbook consumes it to drop its
 * links; it is idempotent on redelivery. It carries the opaque id and nothing about the person.
 */
export const prospectErasedEvent = defineEvent(
  'prospect.erased',
  1,
  z.strictObject({ prospectId: prospectIdSchema })
)

/** Every Prospect event, by type. */
export const PROSPECT_EVENTS = {
  'prospect.created': prospectCreatedEvent,
  'prospect.updated': prospectUpdatedEvent,
  'prospect.merged': prospectMergedEvent,
  'prospect.erased': prospectErasedEvent,
} as const

/** The type of a Prospect event. */
export type ProspectEventType = keyof typeof PROSPECT_EVENTS
