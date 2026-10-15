import { z } from 'zod'
import { emailSchema } from '../email'
import type { CommonErrorCode } from '../errors'
import { invitationIdSchema, teamIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { invitableRoleSchema } from '../tenancy'
import type { CoreErrorCode } from './errors'
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
 * Invitation instead of `invitation.already_pending`, the same key with a different body is
 * `request.idempotency_key_reused`, and the same key while the first request is still running is
 * `request.idempotency_in_progress`.
 */
export const createInvitationRequestSchema = z.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional(),
})

/**
 * Every error code `POST /v1/invitations` may answer with. `invitation.already_pending` and
 * `invitation.already_member` (409) are about the address; `invitation.pending_limit` (409, 1,000
 * pending) and `invitation.daily_limit` (429, 2,000 in 24 hours, with `details.retryAfter` and a
 * `Retry-After` header) are the Organization-wide limits; `rate.limited` is only the per-request
 * rate. `team.not_found` is a `teamId` that is not a Team of this Organization.
 */
export const CREATE_INVITATION_ERROR_CODES = [
  'invitation.already_pending',
  'invitation.already_member',
  'invitation.pending_limit',
  'invitation.daily_limit',
  'team.not_found',
  'request.invalid',
  'request.idempotency_key_reused',
  'request.idempotency_in_progress',
  'auth.unauthenticated',
  'auth.token_expired',
  'auth.token_invalid',
  'auth.forbidden',
  'auth.unavailable',
  'organization.suspended',
  'organization.deleted',
  'rate.limited',
] as const satisfies readonly (CoreErrorCode | CommonErrorCode)[]

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
