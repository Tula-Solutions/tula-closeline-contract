import { z } from 'zod'
import { emailSchema } from '../email'
import { organizationIdSchema, userIdSchema } from '../ids'
import { invitableRoleSchema, organizationStatusSchema, roleSchema } from '../tenancy'
import { invitationTokenSchema, organizationNameSchema } from './values'

/*
 * The calls the auth service makes to core. They are not part of core's public API: they are
 * served on the internal network only, and never take an Organization from the caller. A
 * deployment serves one Region, so none of them names one. Each call that has effects carries an
 * `Idempotency-Key` header (see `IDEMPOTENCY_KEY_HEADER`).
 */

/** Internal: the body of a sign-up that creates an Organization; the user becomes its Owner. */
export const internalCreateOrganizationRequestSchema = z.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  organizationName: organizationNameSchema,
})

/** Internal: the body of a sign-up that creates an Organization. */
export type InternalCreateOrganizationRequest = z.infer<
  typeof internalCreateOrganizationRequestSchema
>

/** Internal: the answer to creating an Organization at sign-up; the role is always `owner`. */
export const internalCreateOrganizationResponseSchema = z.strictObject({
  organizationId: organizationIdSchema,
  role: z.literal('owner'),
})

/** Internal: the answer to creating an Organization at sign-up. */
export type InternalCreateOrganizationResponse = z.infer<
  typeof internalCreateOrganizationResponseSchema
>

/** Internal: the body of a sign-up that accepts an Invitation with its raw token and the verified address. */
export const internalAcceptInvitationRequestSchema = z.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  invitationToken: invitationTokenSchema,
})

/** Internal: the body of a sign-up that accepts an Invitation. */
export type InternalAcceptInvitationRequest = z.infer<typeof internalAcceptInvitationRequestSchema>

/** Internal: the answer to accepting an Invitation; the role is the one offered, never `owner`. */
export const internalAcceptInvitationResponseSchema = z.strictObject({
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
 * status.
 */
export const internalMembershipResponseSchema = z.discriminatedUnion('found', [
  z.strictObject({
    found: z.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema,
  }),
  z.strictObject({ found: z.literal(false) }),
])

/** Internal: the membership of a user, or none. */
export type InternalMembershipResponse = z.infer<typeof internalMembershipResponseSchema>
