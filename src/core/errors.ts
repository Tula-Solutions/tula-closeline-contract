import { defineErrors } from '../errors'

/**
 * The errors core returns, as `area.reason` codes. None says whether an email address or a user
 * exists in another Organization: `invitation.invalid` covers an unknown, used, revoked and expired
 * token alike, and `membership.already_member` is only ever about the user making the call. A role
 * that is not allowed is the common `auth.forbidden`. `organization.not_abandonable` is the one
 * answer when the abandon guard refuses, whichever of its conditions failed. Which internal call
 * returns which code is `INTERNAL_CALL_ERRORS`.
 */
export const CORE_ERRORS = {
  ...defineErrors('organization', {
    not_found: { status: 404, message: 'The Organization was not found.' },
    suspended: { status: 403, message: 'This Organization is suspended.' },
    deleted: { status: 410, message: 'This Organization has been deleted.' },
    not_abandonable: { status: 409, message: 'This Organization cannot be abandoned.' },
  }),
  ...defineErrors('member', {
    not_found: { status: 404, message: 'The member was not found.' },
    last_owner: {
      status: 409,
      message:
        'The last Owner cannot be removed or demoted. Promote a different member to Owner first.',
    },
  }),
  ...defineErrors('membership', {
    already_member: { status: 409, message: 'You already belong to an Organization.' },
  }),
  ...defineErrors('invitation', {
    invalid: { status: 422, message: 'The invitation is not valid.' },
    not_found: { status: 404, message: 'The invitation was not found.' },
    already_pending: {
      status: 409,
      message: 'A matching invitation is already pending. Revoke it to send a new one.',
    },
  }),
  ...defineErrors('team', {
    not_found: { status: 404, message: 'The Team was not found.' },
    name_taken: { status: 409, message: 'A Team with that name already exists.' },
  }),
} as const

/** A code from the {@link CORE_ERRORS} registry. */
export type CoreErrorCode = keyof typeof CORE_ERRORS

/**
 * The errors the auth service returns about sign-up and Organization membership. They are named
 * for what the person signing up sees; auth turns core's `invitation.invalid` into
 * `signup.invitation_invalid` and an unreachable core into `membership.unavailable`.
 */
export const SIGNUP_ERRORS = {
  ...defineErrors('auth', {
    no_organization: {
      status: 403,
      message: 'You do not belong to an Organization, so you cannot sign in.',
    },
  }),
  ...defineErrors('signup', {
    invitation_invalid: { status: 422, message: 'The invitation is not valid.' },
    organization_name_invalid: { status: 422, message: 'Enter a valid Organization name.' },
  }),
  ...defineErrors('membership', {
    unavailable: {
      status: 503,
      message: 'Organization membership is unavailable right now. Try again shortly.',
    },
  }),
} as const

/** A code from the {@link SIGNUP_ERRORS} registry. */
export type SignupErrorCode = keyof typeof SIGNUP_ERRORS
