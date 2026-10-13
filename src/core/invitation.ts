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
export const invitationSchema = z.strictObject({
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

/** The body of a request to invite someone: an address and a role that is never `owner`. */
export const createInvitationRequestSchema = z.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional(),
})

/** The body of a request to invite someone. */
export type CreateInvitationRequest = z.infer<typeof createInvitationRequestSchema>

/** The query parameters of a request to list pending Invitations. */
export const listInvitationsQuerySchema = pageQuerySchema

/** The query parameters of a request to list pending Invitations. */
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
