import { z } from 'zod'
import { emailSchema } from '../email'
import { invitationIdSchema, teamIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { invitableRoleSchema } from '../tenancy'
import { invitationStateSchema, timestampSchema } from './values'

/**
 * An Invitation as core returns it. The raw token is not here and never will be: it is delivered
 * by email only, so a response cannot leak it.
 */
export const invitationSchema = z.object({
  id: invitationIdSchema,
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.nullable(),
  state: invitationStateSchema,
  invitedByUserId: userIdSchema,
  expiresAt: timestampSchema,
  createdAt: timestampSchema,
})

/** An Invitation as core returns it. */
export type Invitation = z.infer<typeof invitationSchema>

/**
 * The body of a request to invite someone: an address and a role that is never `owner`. The call
 * accepts an `Idempotency-Key` header (`idempotencyKeySchema`): a replay returns the original
 * Invitation instead of `invitation.already_pending`, and the same key with a different body is
 * `request.idempotency_key_reused`.
 */
export const createInvitationRequestSchema = z.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional(),
})

/** The body of a request to invite someone. */
export type CreateInvitationRequest = z.infer<typeof createInvitationRequestSchema>

/**
 * The query parameters of a request to list Invitations: a page, and the `state` to list, which
 * is `pending` unless asked otherwise. An unknown parameter is rejected.
 */
export const listInvitationsQuerySchema = pageQuerySchema
  .extend({ state: invitationStateSchema.default('pending') })
  .strict()

/** The query parameters of a request to list Invitations. */
export type ListInvitationsQuery = z.infer<typeof listInvitationsQuerySchema>

/** One page of Invitations. */
export const listInvitationsResponseSchema = pageSchema(invitationSchema)

/** One page of Invitations. */
export type ListInvitationsResponse = z.infer<typeof listInvitationsResponseSchema>

/** The path parameters of a request about one Invitation, such as revoking it. */
export const invitationParamsSchema = z.strictObject({
  invitationId: invitationIdSchema,
})

/** The path parameters of a request about one Invitation. */
export type InvitationParams = z.infer<typeof invitationParamsSchema>
