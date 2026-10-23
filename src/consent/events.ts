import { z } from 'zod'
import { defineEvent } from '../events'
import {
  consentEventIdSchema,
  consentWordingIdSchema,
  prospectIdSchema,
  suppressionEntryIdSchema,
} from '../ids'
import {
  consentChannelSchema,
  consentGrantSourceSchema,
  consentWithdrawalSourceSchema,
  suppressionAddressKindSchema,
  suppressionReasonSchema,
} from './values'

/** `consent.granted` (version 1): a Contact Consent was recorded on a channel. Ids and kinds only: no address, no wording text. */
export const consentGrantedEvent = defineEvent(
  'consent.granted',
  1,
  z.strictObject({
    consentEventId: consentEventIdSchema,
    prospectId: prospectIdSchema,
    channel: consentChannelSchema,
    source: consentGrantSourceSchema,
    wordingId: consentWordingIdSchema,
  })
)

/** `consent.withdrawn` (version 1): a Contact Consent was withdrawn on a channel; `stopAll` is true for each event of a STOP-all. One event per channel. */
export const consentWithdrawnEvent = defineEvent(
  'consent.withdrawn',
  1,
  z.strictObject({
    consentEventId: consentEventIdSchema,
    prospectId: prospectIdSchema,
    channel: consentChannelSchema,
    source: consentWithdrawalSourceSchema,
    stopAll: z.boolean(),
  })
)

/** `suppression.added` (version 1): an address was added to the Suppression list. `prospectId` is null when no Prospect has the address. */
export const suppressionAddedEvent = defineEvent(
  'suppression.added',
  1,
  z.strictObject({
    suppressionEntryId: suppressionEntryIdSchema,
    addressKind: suppressionAddressKindSchema,
    reason: suppressionReasonSchema,
    prospectId: prospectIdSchema.nullable(),
  })
)

/** `suppression.removed` (version 1): a manual entry was removed from the Suppression list. */
export const suppressionRemovedEvent = defineEvent(
  'suppression.removed',
  1,
  z.strictObject({
    suppressionEntryId: suppressionEntryIdSchema,
    addressKind: suppressionAddressKindSchema,
  })
)

/** Every consent event, by type. */
export const CONSENT_EVENTS = {
  'consent.granted': consentGrantedEvent,
  'consent.withdrawn': consentWithdrawnEvent,
  'suppression.added': suppressionAddedEvent,
  'suppression.removed': suppressionRemovedEvent,
} as const

/** The type of a consent event. */
export type ConsentEventType = keyof typeof CONSENT_EVENTS
