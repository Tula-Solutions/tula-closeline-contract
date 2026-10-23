import { z } from 'zod'

const PREFIX_PATTERN = /^[a-z]{2,5}$/

/** An id string branded with its prefix, so ids of different kinds cannot be mixed up. */
export type Id<Prefix extends string> = string & z.core.$brand<Prefix>

/** An id for one prefix: `<prefix>_<32 lowercase hex characters>`, branded with the prefix. */
export function idSchema<const Prefix extends string>(prefix: Prefix) {
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(`Invalid id prefix: ${prefix}`)
  }
  return z
    .string()
    .regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`))
    .brand<Prefix>()
}

/** The id of an Organization (`org_…`). */
export const organizationIdSchema = idSchema('org')
/** The id of a user (`usr_…`). */
export const userIdSchema = idSchema('usr')
/** The id of a membership of a user in an Organization (`mem_…`). */
export const membershipIdSchema = idSchema('mem')
/** The id of a Team (`team_…`). */
export const teamIdSchema = idSchema('team')
/** The id of an Invitation to join an Organization (`inv_…`). */
export const invitationIdSchema = idSchema('inv')
/** The id of a Prospect (`prs_…`). */
export const prospectIdSchema = idSchema('prs')
/** The id of a Prospect Company (`pco_…`). */
export const prospectCompanyIdSchema = idSchema('pco')
/** The id of a Prospect import (`pimp_…`). */
export const prospectImportIdSchema = idSchema('pimp')
/** The id of a Prospect merge record (`pmrg_…`). */
export const prospectMergeIdSchema = idSchema('pmrg')
/** The id of a consent event in the ledger (`cev_…`). */
export const consentEventIdSchema = idSchema('cev')
/** The id of a Consent Wording version (`cwd_…`). */
export const consentWordingIdSchema = idSchema('cwd')
/** The id of a Suppression entry (`sup_…`). */
export const suppressionEntryIdSchema = idSchema('sup')
/** The id of a hosted consent form (`cfm_…`). */
export const consentFormIdSchema = idSchema('cfm')
/** The id of one Contact Check, as its audit row is named (`chk_…`). */
export const contactCheckIdSchema = idSchema('chk')
/** The id of a Suppression import (`simp_…`). */
export const suppressionImportIdSchema = idSchema('simp')
/** The id of a Playbook document (`doc_…`). */
export const documentIdSchema = idSchema('doc')
/** The opaque id of a Deal record (`deal_…`), used in every URL path; the customer's own deal id never travels in a path. */
export const dealRecordIdSchema = idSchema('deal')
/** The id of a Call (`call_…`). */
export const callIdSchema = idSchema('call')
/** The id of a Copilot Card (`ccard_…`), one piece of advice shown to a Rep during a Call. */
export const copilotCardIdSchema = idSchema('ccard')
/** The id of a Line (`line_…`), a phone number an Organization uses to place and receive Calls. */
export const lineIdSchema = idSchema('line')
/** The id of a Deal import (`dimp_…`). */
export const dealImportIdSchema = idSchema('dimp')
/** The id of an event (`evt_…`). */
export const eventIdSchema = idSchema('evt')
/** The id of a request, for tracing (`req_…`). */
export const requestIdSchema = idSchema('req')

/** The id of a Demo Request (`dreq_…`), a Visitor's submitted wish to see Closeline. */
export const demoRequestIdSchema = idSchema('dreq')

/** The id of a Booking (`bkg_…`), a time reserved on a Rep's calendar for a Prospect. */
export const bookingIdSchema = idSchema('bkg')
/** The id of a Booking Type (`bkt_…`), a named kind of Booking with a length, buffers and mode. */
export const bookingTypeIdSchema = idSchema('bkt')
/** The id of a Routing Rule (`rrl_…`). */
export const routingRuleIdSchema = idSchema('rrl')
/** The id of a stored routing decision (`rdc_…`): which rule picked which Rep, and who was skipped. */
export const routingDecisionIdSchema = idSchema('rdc')

/** The id of an Organization. */
export type OrganizationId = z.infer<typeof organizationIdSchema>
/** The id of a user. */
export type UserId = z.infer<typeof userIdSchema>
/** The id of a membership. */
export type MembershipId = z.infer<typeof membershipIdSchema>
/** The id of a Team. */
export type TeamId = z.infer<typeof teamIdSchema>
/** The id of an Invitation. */
export type InvitationId = z.infer<typeof invitationIdSchema>
/** The id of a consent event. */
export type ConsentEventId = z.infer<typeof consentEventIdSchema>
/** The id of a Consent Wording version. */
export type ConsentWordingId = z.infer<typeof consentWordingIdSchema>
/** The id of a Suppression entry. */
export type SuppressionEntryId = z.infer<typeof suppressionEntryIdSchema>
/** The id of a hosted consent form. */
export type ConsentFormId = z.infer<typeof consentFormIdSchema>
/** The id of one Contact Check. */
export type ContactCheckId = z.infer<typeof contactCheckIdSchema>
/** The id of a Suppression import. */
export type SuppressionImportId = z.infer<typeof suppressionImportIdSchema>
/** The id of a Prospect. */
export type ProspectId = z.infer<typeof prospectIdSchema>
/** The id of a Prospect Company. */
export type ProspectCompanyId = z.infer<typeof prospectCompanyIdSchema>
/** The id of a Prospect import. */
export type ProspectImportId = z.infer<typeof prospectImportIdSchema>
/** The id of a Prospect merge record. */
export type ProspectMergeId = z.infer<typeof prospectMergeIdSchema>
/** The id of a Playbook document. */
export type DocumentId = z.infer<typeof documentIdSchema>
/** The opaque id of a Deal record. */
export type DealRecordId = z.infer<typeof dealRecordIdSchema>
/** The id of a Call. */
export type CallId = z.infer<typeof callIdSchema>
/** The id of a Copilot Card. */
export type CopilotCardId = z.infer<typeof copilotCardIdSchema>
/** The id of a Line. */
export type LineId = z.infer<typeof lineIdSchema>
/** The id of a Deal import. */
export type DealImportId = z.infer<typeof dealImportIdSchema>
/** The id of an event. */
export type EventId = z.infer<typeof eventIdSchema>
/** The id of a request. */
export type RequestId = z.infer<typeof requestIdSchema>
/** The id of a Demo Request. */
export type DemoRequestId = z.infer<typeof demoRequestIdSchema>
/** The id of a Booking. */
export type BookingId = z.infer<typeof bookingIdSchema>
/** The id of a Booking Type. */
export type BookingTypeId = z.infer<typeof bookingTypeIdSchema>
/** The id of a Routing Rule. */
export type RoutingRuleId = z.infer<typeof routingRuleIdSchema>
/** The id of a stored routing decision. */
export type RoutingDecisionId = z.infer<typeof routingDecisionIdSchema>

const UUID_PATTERN =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

/** Turns a UUID (any case; 32 hex characters or the dashed 8-4-4-4-12 form) into an id with the given prefix; throws otherwise. */
export function formatId<const Prefix extends string>(prefix: Prefix, uuid: string): Id<Prefix> {
  if (typeof uuid !== 'string' || !UUID_PATTERN.test(uuid)) {
    throw new Error('Not a UUID: expected 32 hexadecimal characters or the 8-4-4-4-12 form')
  }
  const hex = uuid.replaceAll('-', '').toLowerCase()
  return idSchema(prefix).parse(`${prefix}_${hex}`) as Id<Prefix>
}
