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
/** The id of an event (`evt_…`). */
export const eventIdSchema = idSchema('evt')
/** The id of a request, for tracing (`req_…`). */
export const requestIdSchema = idSchema('req')

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
/** The id of a Prospect. */
export type ProspectId = z.infer<typeof prospectIdSchema>
/** The id of an event. */
export type EventId = z.infer<typeof eventIdSchema>
/** The id of a request. */
export type RequestId = z.infer<typeof requestIdSchema>

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
