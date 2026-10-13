import { z } from 'zod'
import { emailSchema } from '../email'
import { organizationIdSchema, userIdSchema } from '../ids'
import { invitableRoleSchema, organizationStatusSchema, roleSchema } from '../tenancy'
import type { CoreErrorCode } from './errors'
import {
  invitationTokenSchema,
  organizationNameSchema,
  personNameSchema,
  storedNameSchema,
} from './values'

/*
 * The calls the auth service makes to core. They are not part of core's public API: they are
 * served on the internal network only, and never take an Organization from the caller. A
 * deployment serves one Region, so none of them names one. Each call that has effects carries an
 * `Idempotency-Key` header (see `IDEMPOTENCY_KEY_HEADER`). Requests are strict; responses strip
 * keys they do not name, so core must send the output of `Schema.parse(row)`, never the row.
 */

/** The internal calls, by name. */
export type InternalCallName =
  | 'createOrganization'
  | 'acceptInvitation'
  | 'membership'
  | 'updateMemberProfile'

/**
 * The complete list of domain error codes each internal call may return, for core's tests to
 * assert against. Common codes (`auth.*`, `request.*`, `server.*`) can come from any call and are
 * not listed. Accepting an Invitation never returns an Organization status code, so a suspended or
 * deleted Organization is indistinguishable from an unknown token. The membership lookup returns
 * no domain error: it answers `found: false`. A profile change for a user with no membership is
 * `member.not_found`, which the caller treats as nothing to do.
 */
export const INTERNAL_CALL_ERRORS: Readonly<Record<InternalCallName, readonly CoreErrorCode[]>> =
  Object.freeze({
    createOrganization: Object.freeze(['membership.already_member'] as const),
    acceptInvitation: Object.freeze(['invitation.invalid', 'membership.already_member'] as const),
    membership: Object.freeze([] as const),
    updateMemberProfile: Object.freeze(['member.not_found'] as const),
  })

/**
 * Internal: `POST /internal/organizations`, the body of a sign-up that creates an Organization;
 * the user becomes its Owner. `email` and `name` are the person's, copied onto the Membership for
 * the member list (the auth service holds them; see `memberSchema`): `name` is the display name
 * auth composes from the first and last names, or `null` when the person gave neither. Both are
 * optional only so a `0.5.0` caller, which sends neither, still parses and core can deploy before
 * auth sends them; each becomes required once auth sends them. Core returns only
 * `membership.already_member`.
 */
export const internalCreateOrganizationRequestSchema = z.strictObject({
  userId: userIdSchema,
  organizationName: organizationNameSchema,
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional(),
})

/** Internal: the body of a sign-up that creates an Organization. */
export type InternalCreateOrganizationRequest = z.infer<
  typeof internalCreateOrganizationRequestSchema
>

/** Internal: the answer to creating an Organization at sign-up; the role is always `owner`. */
export const internalCreateOrganizationResponseSchema = z.object({
  organizationId: organizationIdSchema,
  role: z.literal('owner'),
})

/** Internal: the answer to creating an Organization at sign-up. */
export type InternalCreateOrganizationResponse = z.infer<
  typeof internalCreateOrganizationResponseSchema
>

/**
 * Internal: `POST /internal/invitations/accept`, the body of a sign-up that accepts an Invitation
 * with its raw token and the verified address. `name` is the person's display name as auth
 * composes it, or `null` when the person gave none; the address is copied onto the Membership
 * too. `name` is optional only so a `0.5.0` caller, which sends none, still parses and core can
 * deploy before auth sends it; it becomes required once auth sends it. Core compares the address, folded, with the Invitation's and answers
 * `invitation.invalid` on a mismatch, like an unknown, used, revoked or expired token. Core
 * returns only `invitation.invalid` or `membership.already_member`, never an Organization status.
 */
export const internalAcceptInvitationRequestSchema = z.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  name: personNameSchema.nullable().optional(),
  invitationToken: invitationTokenSchema,
})

/** Internal: the body of a sign-up that accepts an Invitation. */
export type InternalAcceptInvitationRequest = z.infer<typeof internalAcceptInvitationRequestSchema>

/** Internal: the answer to accepting an Invitation; the role is the one offered, never `owner`. */
export const internalAcceptInvitationResponseSchema = z.object({
  organizationId: organizationIdSchema,
  role: invitableRoleSchema,
})

/** Internal: the answer to accepting an Invitation. */
export type InternalAcceptInvitationResponse = z.infer<
  typeof internalAcceptInvitationResponseSchema
>

/** Internal: the request for the membership of one user, which the token hook makes before issuing a token. */
export const internalMembershipRequestSchema = z.strictObject({
  userId: userIdSchema,
})

/** Internal: the request for the membership of one user. */
export type InternalMembershipRequest = z.infer<typeof internalMembershipRequestSchema>

/**
 * Internal: the membership of a user, or `{ found: false }` for a user with none. A user with an
 * Organization that is suspended or deleted is found: the token hook decides what to do with the
 * status. The lookup returns no domain error.
 */
export const internalMembershipResponseSchema = z.discriminatedUnion('found', [
  z.object({
    found: z.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema,
  }),
  z.object({ found: z.literal(false) }),
])

/** Internal: the membership of a user, or none. */
export type InternalMembershipResponse = z.infer<typeof internalMembershipResponseSchema>

/** Internal: the path parameters of a profile change; the user is named in the path, never in the body. */
export const internalUpdateMemberProfileParamsSchema = z.strictObject({
  userId: userIdSchema,
})

/** Internal: the path parameters of a profile change. */
export type InternalUpdateMemberProfileParams = z.infer<
  typeof internalUpdateMemberProfileParamsSchema
>

/**
 * Internal: `PATCH /internal/members/{userId}`, the body of the call auth makes when a person's
 * name or email changes, to bring core's copy up to date. Each field is the new value, never a
 * delta, so the call is idempotent: a repeat leaves the same state and answers the same. At least
 * one field is required. `name: null` clears the name; the address cannot be cleared. It applies
 * to the person's Membership in whichever Organization holds it, and answers `member.not_found`
 * for a user with none, which the caller treats as nothing to do. It carries an `Idempotency-Key`
 * header. The auth service has no route that changes a name or an address yet; the call is
 * defined ahead of it.
 */
export const internalUpdateMemberProfileRequestSchema = z
  .strictObject({
    email: emailSchema.optional(),
    name: personNameSchema.nullable().optional(),
  })
  .refine((body) => body.email !== undefined || body.name !== undefined, {
    message: 'Send an email, a name or both',
  })

/** Internal: the body of a profile change. */
export type InternalUpdateMemberProfileRequest = z.infer<
  typeof internalUpdateMemberProfileRequestSchema
>

/** Internal: the answer to a profile change: the address and name core now holds for the user. */
export const internalUpdateMemberProfileResponseSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable(),
})

/** Internal: the answer to a profile change. */
export type InternalUpdateMemberProfileResponse = z.infer<
  typeof internalUpdateMemberProfileResponseSchema
>
