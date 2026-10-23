import { ErrorDefinition as ErrorDefinition_8gwh45 } from "..";
/**
* Every `area.reason` code the auth service answers with, beyond the common ones in `ERRORS`:
* sign-in, sign-up verification, passwords, sessions and Sign in with Google (`oidc.*`; the 503
* `oidc.provider_unavailable` is answered with a `Retry-After` header). The sign-up codes and core's
* `organization.deleted` (returned by sign-in and refresh when the user's Organization was deleted)
* are the same entries as in `SIGNUP_ERRORS` and `CORE_ERRORS`, not copies. A missing or
* invalid access token is one of the common `auth.*` token codes in `ERRORS`; a refresh token that
* is not valid is `session.invalid_token`.
*/
declare const AUTH_ERRORS: {
	readonly "organization.deleted": ErrorDefinition_8gwh45<"organization.deleted">;
	readonly "auth.invalid_credentials": ErrorDefinition_8gwh45<"auth.invalid_credentials">;
	readonly "auth.no_organization": ErrorDefinition_8gwh45<"auth.no_organization">;
	readonly "auth.user_banned": ErrorDefinition_8gwh45<"auth.user_banned">;
	readonly "email.invalid": ErrorDefinition_8gwh45<"email.invalid">;
	readonly "flow.invalid_step": ErrorDefinition_8gwh45<"flow.invalid_step">;
	readonly "flow.not_found": ErrorDefinition_8gwh45<"flow.not_found">;
	readonly "mail.unavailable": ErrorDefinition_8gwh45<"mail.unavailable">;
	readonly "membership.unavailable": ErrorDefinition_8gwh45<"membership.unavailable">;
	readonly "oidc.access_denied": ErrorDefinition_8gwh45<"oidc.access_denied">;
	readonly "oidc.disabled": ErrorDefinition_8gwh45<"oidc.disabled">;
	readonly "oidc.email_unverified": ErrorDefinition_8gwh45<"oidc.email_unverified">;
	readonly "oidc.invitation_mismatch": ErrorDefinition_8gwh45<"oidc.invitation_mismatch">;
	readonly "oidc.provider_unavailable": ErrorDefinition_8gwh45<"oidc.provider_unavailable">;
	readonly "oidc.state_invalid": ErrorDefinition_8gwh45<"oidc.state_invalid">;
	readonly "password.breached": ErrorDefinition_8gwh45<"password.breached">;
	readonly "password.common": ErrorDefinition_8gwh45<"password.common">;
	readonly "password.contains_user_info": ErrorDefinition_8gwh45<"password.contains_user_info">;
	readonly "password.too_long": ErrorDefinition_8gwh45<"password.too_long">;
	readonly "password.too_short": ErrorDefinition_8gwh45<"password.too_short">;
	readonly "session.expired": ErrorDefinition_8gwh45<"session.expired">;
	readonly "session.invalid_token": ErrorDefinition_8gwh45<"session.invalid_token">;
	readonly "session.reuse_detected": ErrorDefinition_8gwh45<"session.reuse_detected">;
	readonly "session.revoked": ErrorDefinition_8gwh45<"session.revoked">;
	readonly "signup.invitation_invalid": ErrorDefinition_8gwh45<"signup.invitation_invalid">;
	readonly "signup.organization_name_invalid": ErrorDefinition_8gwh45<"signup.organization_name_invalid">;
	readonly "verification.expired": ErrorDefinition_8gwh45<"verification.expired">;
	readonly "verification.invalid_code": ErrorDefinition_8gwh45<"verification.invalid_code">;
	readonly "verification.too_many_attempts": ErrorDefinition_8gwh45<"verification.too_many_attempts">;
};
/** A code from the {@link AUTH_ERRORS} registry. */
type AuthErrorCode = keyof typeof AUTH_ERRORS;
import { z as z2 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh452 } from "..";
import { ZodObject as ZodObject_qx5az2 } from "zod";
import { ZodNumber as ZodNumber_qqlmmw } from "zod";
import { $strict as $strict_gffh7x } from "zod/v4/core";
/**
* The errors core returns, as `area.reason` codes. None says whether an email address or a user
* exists in another Organization: `invitation.invalid` covers an unknown, used, revoked and expired
* token alike, and `membership.already_member` is only ever about the user making the call (so
* an address that already belongs to a member of the inviting Organization is the distinct
* `invitation.already_member`, which only a caller allowed to invite sees). The Organization-wide
* invitation limits are their own codes, apart from the per-request `rate.limited`:
* `invitation.pending_limit` (1,000 pending) and `invitation.daily_limit` (2,000 in 24 hours,
* answered with `details` of `DAILY_LIMIT_DETAILS_SCHEMA` (`retryAfter` in seconds) and a `Retry-After` header). A role
* that is not allowed is the common `auth.forbidden`. `organization.not_abandonable` is the one
* answer when the abandon guard refuses, whichever of its conditions failed. Which internal call
* returns which code is `INTERNAL_CALL_ERRORS`.
*/
declare const CORE_ERRORS: {
	readonly "invitation.already_member": ErrorDefinition_8gwh452<"invitation.already_member">;
	readonly "invitation.already_pending": ErrorDefinition_8gwh452<"invitation.already_pending">;
	readonly "invitation.daily_limit": ErrorDefinition_8gwh452<"invitation.daily_limit">;
	readonly "invitation.invalid": ErrorDefinition_8gwh452<"invitation.invalid">;
	readonly "invitation.not_found": ErrorDefinition_8gwh452<"invitation.not_found">;
	readonly "invitation.pending_limit": ErrorDefinition_8gwh452<"invitation.pending_limit">;
	readonly "member.last_owner": ErrorDefinition_8gwh452<"member.last_owner">;
	readonly "member.not_found": ErrorDefinition_8gwh452<"member.not_found">;
	readonly "membership.already_member": ErrorDefinition_8gwh452<"membership.already_member">;
	readonly "organization.deleted": ErrorDefinition_8gwh452<"organization.deleted">;
	readonly "organization.not_abandonable": ErrorDefinition_8gwh452<"organization.not_abandonable">;
	readonly "organization.not_found": ErrorDefinition_8gwh452<"organization.not_found">;
	readonly "organization.suspended": ErrorDefinition_8gwh452<"organization.suspended">;
	readonly "team.name_taken": ErrorDefinition_8gwh452<"team.name_taken">;
	readonly "team.not_found": ErrorDefinition_8gwh452<"team.not_found">;
};
/** The `details` shape of `invitation.daily_limit`: `retryAfter` in seconds, the same as its `Retry-After` header. */
declare const DAILY_LIMIT_DETAILS_SCHEMA: ZodObject_qx5az2<{
	retryAfter: ZodNumber_qqlmmw;
}, $strict_gffh7x>;
/** A code from the {@link CORE_ERRORS} registry. */
type CoreErrorCode = keyof typeof CORE_ERRORS;
/**
* The errors the auth service returns about sign-up and Organization membership. They are named
* for what the person signing up sees; auth turns core's `invitation.invalid` into
* `signup.invitation_invalid` and an unreachable core into `membership.unavailable`.
*/
declare const SIGNUP_ERRORS: {
	readonly "auth.no_organization": ErrorDefinition_8gwh452<"auth.no_organization">;
	readonly "membership.unavailable": ErrorDefinition_8gwh452<"membership.unavailable">;
	readonly "signup.invitation_invalid": ErrorDefinition_8gwh452<"signup.invitation_invalid">;
	readonly "signup.organization_name_invalid": ErrorDefinition_8gwh452<"signup.organization_name_invalid">;
};
/** A code from the {@link SIGNUP_ERRORS} registry. */
type SignupErrorCode = keyof typeof SIGNUP_ERRORS;
import { z } from "zod";
/** An error code in `area.reason` form, such as `request.invalid`. */
declare const errorCodeSchema: z.ZodString;
/** The one body every service returns for a failure. */
declare const errorBodySchema: z.ZodObject<{
	error: z.ZodObject<{
		code: z.ZodString;
		message: z.ZodString;
		details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
	}, z.core.$strip>;
}, z.core.$strip>;
/** The body of a failure response, as returned by every service. */
type ErrorBody = z.infer<typeof errorBodySchema>;
/** What a registry knows about one error: its code, HTTP status and default message. */
type ErrorDefinition<Code extends string = string> = {
	readonly code: Code;
	readonly status: number;
	readonly message: string;
};
declare const common: readonly [ErrorDefinition<"request.invalid">, ErrorDefinition<"request.not_found">, ErrorDefinition<"request.conflict">, ErrorDefinition<"request.idempotency_key_reused">, ErrorDefinition<"request.idempotency_in_progress">, ErrorDefinition<"request.too_large">, ErrorDefinition<"request.method_not_allowed">, ErrorDefinition<"request.unsupported_media_type">, ErrorDefinition<"request.unprocessable">, ErrorDefinition<"auth.unauthenticated">, ErrorDefinition<"auth.forbidden">, ErrorDefinition<"auth.token_expired">, ErrorDefinition<"auth.token_invalid">, ErrorDefinition<"auth.unavailable">, ErrorDefinition<"rate.limited">, ErrorDefinition<"server.internal">, ErrorDefinition<"server.unavailable">, ErrorDefinition<"server.timeout">];
type CommonEntry = (typeof common)[number];
/** The errors common to every service, keyed by code. */
declare const ERRORS: Readonly<{ [E in CommonEntry as E["code"]] : E }>;
/** A code from the {@link ERRORS} registry. */
type CommonErrorCode = keyof typeof ERRORS;
/** What a service supplies for one of its own errors; the code comes from the area and key. */
type ErrorInput = {
	readonly status: number;
	readonly message: string;
};
/** Declares a service's own errors: prefixes each reason with the area and returns a frozen registry. */
declare function defineErrors<
	const Area extends string,
	const Reason extends string
>(area: Area, entries: Readonly<Record<Reason, ErrorInput>>): Readonly<{ [R in Reason as `${Area}.${R}`] : ErrorDefinition<`${Area}.${R}`> }>;
/** The longest `returnTo` path, in UTF-16 code units. */
declare const MAX_RETURN_TO_LENGTH = 512;
/** The longest authorization URL the start route answers with. */
declare const MAX_AUTHORIZATION_URL_LENGTH = 2048;
/**
* Where to send the person after Google sign-in: a path on the same origin. It starts with `/` but
* never `//` or `/\`, has no backslash, no scheme, no control or bidirectional character and no
* lone surrogate, no whitespace or invisible format character, no `.` or `..` segment (which could
* collapse to `//host` when resolved), and is at most `MAX_RETURN_TO_LENGTH` long. A
* percent-encoded form is checked after decoding once too, so a consumer must decode exactly once; so `/%2F/evil` and `/%5Cevil` are refused, and so is a malformed escape. The
* service also checks it against the portal's route allow-list and keeps it in the attempt; it is
* never read from the callback. The value has already been decoded once by the query or JSON
* parser: a consumer must not decode it again.
*/
declare const returnToSchema: z2.ZodString;
/** Why the person is using Google: to `sign_in` to an account or to `sign_up` for one. */
declare const googleIntentSchema: z2.ZodEnum<{
	sign_in: "sign_in";
	sign_up: "sign_up";
}>;
/** Why the person is using Google. */
type GoogleIntent = z2.infer<typeof googleIntentSchema>;
/** The body that starts a Sign in with Google: the intent and an optional same-origin `returnTo`. Unknown keys are rejected. */
declare const googleStartRequestSchema: z2.ZodObject<{
	intent: z2.ZodEnum<{
		sign_in: "sign_in";
		sign_up: "sign_up";
	}>;
	returnTo: z2.ZodOptional<z2.ZodString>;
}, z2.core.$strict>;
/** The body that starts a Sign in with Google. */
type GoogleStartRequest = z2.infer<typeof googleStartRequestSchema>;
/**
* The URL the browser is sent to: `https`, or `http` only to a loopback host (for local
* development), with no credentials and no leading or trailing whitespace. The contract cannot
* pin the host, so a consumer must also check it against an allow-list (the portal checks
* `accounts.google.com` plus the local fake issuer).
*/
declare const authorizationUrlSchema: z2.ZodString;
/** The answer to a start: where to send the browser. It carries nothing else; the attempt secret is in a cookie. */
declare const googleStartResponseSchema: z2.ZodObject<{
	authorizationUrl: z2.ZodString;
}, z2.core.$strict>;
/** The answer to a start. */
type GoogleStartResponse = z2.infer<typeof googleStartResponseSchema>;
/** An attempt id as the portal receives it in the sign-up step's query and sends it to complete: 1 to 128 letters, digits, `_` or `-`. */
declare const attemptIdSchema: z2.ZodString;
/** The portal path of the step where a new Google user names an Organization or accepts an invitation. */
declare const GOOGLE_SIGN_UP_PATH = "/sign-up/google";
/** The query parameter of {@link GOOGLE_SIGN_UP_PATH} that holds the attempt id. */
declare const GOOGLE_SIGN_UP_ATTEMPT_PARAM = "attempt";
/** The portal path the callback redirects to when it fails. */
declare const GOOGLE_ERROR_PATH = "/sign-in";
/** The query parameter of {@link GOOGLE_ERROR_PATH} that holds the error code (an `area.reason` code). */
declare const GOOGLE_ERROR_PARAM = "error";
/** The base name of the attempt cookie. Auth adds {@link OIDC_COOKIE_SECURE_PREFIX} outside `local` only, because Safari refuses a `__Secure-` cookie over http even on loopback. */
declare const OIDC_COOKIE_BASE_NAME = "tula_oidc";
/** The prefix of the attempt cookie's name outside `local`. */
declare const OIDC_COOKIE_SECURE_PREFIX = "__Secure-";
/** The query of the portal's sign-up step after a Google sign-in: the attempt id. Unknown keys are rejected. */
declare const googleSignUpQuerySchema: z2.ZodObject<{
	attempt: z2.ZodString;
}, z2.core.$strict>;
/** The query of the portal's sign-in page after a failed Google sign-in: one error code. Unknown keys are rejected. */
declare const googleErrorQuerySchema: z2.ZodObject<{
	error: z2.ZodString;
}, z2.core.$strict>;
/**
* The body that finishes a Sign in with Google for a new user: the `attemptId` from the redirect
* (the secret is in the cookie) and exactly one way to get an Organization, an `organizationName`
* or an `invitationToken`. Unknown keys are rejected. The email is never sent: it is the one Google
* verified.
*/
declare const googleCompleteRequestSchema: z2.ZodObject<{
	attemptId: z2.ZodString;
	organizationName: z2.ZodOptional<z2.ZodString>;
	invitationToken: z2.ZodOptional<z2.ZodString>;
}, z2.core.$strict>;
/** The body that finishes a Sign in with Google. */
type GoogleCompleteRequest = z2.infer<typeof googleCompleteRequestSchema>;
/** The tokens of a signed-in session for the `browser` client: the refresh token is in the `Set-Cookie` header, never in the body. A secret: never log it. */
declare const browserSessionTokensSchema: z2.ZodObject<{
	sessionId: z2.ZodString;
	accessToken: z2.ZodString;
	accessTokenExpiresAt: z2.ZodISODateTime;
	organization: z2.ZodObject<{
		id: z2.ZodString;
		role: z2.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
	}, z2.core.$strict>;
	userId: z2.ZodOptional<z2.core.$ZodBranded<z2.ZodString, "usr", "out">>;
}, z2.core.$strict>;
/** The tokens of a signed-in session for the `browser` client. */
type BrowserSessionTokens = z2.infer<typeof browserSessionTokensSchema>;
/**
* The answer to a complete, shaped like the auth service's browser flow response so the portal has
* one completion path: the attempt `id`, its `kind`, `expiresAt`, a `complete` step and the
* `session` (for the `browser` client: the refresh token is in the cookie, never in the body).
* Fields it does not know, such as an attempt secret, are dropped. A secret: never log it.
*/
declare const googleCompleteResponseSchema: z2.ZodObject<{
	id: z2.ZodString;
	kind: z2.ZodEnum<{
		sign_in: "sign_in";
		sign_up: "sign_up";
	}>;
	expiresAt: z2.ZodISODateTime;
	step: z2.ZodObject<{
		status: z2.ZodLiteral<"complete">;
	}, z2.core.$strip>;
	session: z2.ZodObject<{
		sessionId: z2.ZodString;
		accessToken: z2.ZodString;
		accessTokenExpiresAt: z2.ZodISODateTime;
		organization: z2.ZodObject<{
			id: z2.ZodString;
			role: z2.ZodEnum<{
				admin: "admin";
				manager: "manager";
				owner: "owner";
				rep: "rep";
			}>;
		}, z2.core.$strict>;
		userId: z2.ZodOptional<z2.core.$ZodBranded<z2.ZodString, "usr", "out">>;
	}, z2.core.$strict>;
}, z2.core.$strip>;
/** The answer to a complete. */
type GoogleCompleteResponse = z2.infer<typeof googleCompleteResponseSchema>;
/** Which sign-in providers are on, so the portal hides a button that would only fail. */
declare const authProvidersSchema: z2.ZodObject<{
	google: z2.ZodDefault<z2.ZodBoolean>;
}, z2.core.$strip>;
/** Which sign-in providers are on. */
type AuthProviders = z2.infer<typeof authProvidersSchema>;
/** The path of the auth options route. */
declare const AUTH_OPTIONS_PATH = "/v1/client/auth-options";
/**
* The answer to the auth options route, `GET /v1/client/auth-options`, which the auth service
* owns (a new route): `providers` says which sign-in providers are on, so the portal hides a button
* that would only fail. A payload without `providers`, such as `{}`, parses with every provider
* off, and fields this schema does not know are dropped.
*/
declare const authOptionsResponseSchema: z2.ZodObject<{
	providers: z2.ZodDefault<z2.ZodObject<{
		google: z2.ZodDefault<z2.ZodBoolean>;
	}, z2.core.$strip>>;
}, z2.core.$strip>;
/** The answer to the auth options route. */
type AuthOptionsResponse = z2.infer<typeof authOptionsResponseSchema>;
/** What a service needs to describe one auth route for its OpenAPI document. */
type AuthRoute = {
	readonly method: "GET" | "POST";
	readonly path: string;
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly (AuthErrorCode | CoreErrorCode)[];
	/** Codes the route never answers as an HTTP status: they reach the browser as the `error` query parameter of a redirect. */
	readonly redirectErrors: readonly (AuthErrorCode | CoreErrorCode)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document. */
	readonly description: string;
};
/** The auth options route, owned by the auth service (a new route): which sign-in providers are on. */
declare const AUTH_OPTIONS_ROUTE: AuthRoute;
/**
* The Sign in with Google routes, by name: the description a service puts in its OpenAPI document,
* the success statuses and every error code each route may answer with. None needs a session. The
* callback answers every outcome but `oidc.disabled` with a 302, so its other codes are in
* `redirectErrors`: they reach the browser as the `error` query parameter of the redirect to
* `GOOGLE_ERROR_PATH`, not as an HTTP status.
*/
declare const GOOGLE_ROUTES: Readonly<Record<"start" | "callback" | "complete", AuthRoute>>;
import { z as z3 } from "zod";
/**
* The denial codes of a Contact Check (ADR 0003, ADR 0021). A denial is a typed result of a
* successful call, never an HTTP error: the caller branches on `code`. `consent.unavailable` is
* not answered by core: the kit's client synthesises it when core times out or answers 5xx, so a
* failed check is a denial and never an allowance.
*/
declare const CONTACT_DENIAL_CODES: readonly ["consent.missing", "consent.withdrawn", "consent.suppressed", "consent.unavailable"];
/** A code that denies a contact. */
declare const contactDenialCodeSchema: z3.ZodEnum<{
	"consent.missing": "consent.missing";
	"consent.suppressed": "consent.suppressed";
	"consent.unavailable": "consent.unavailable";
	"consent.withdrawn": "consent.withdrawn";
}>;
/** A code that denies a contact. */
type ContactDenialCode = z3.infer<typeof contactDenialCodeSchema>;
/** Why a contact was allowed: a granted consent, a Rep acting on a Prospect, an answer to the Prospect's own message, or an email to an address that is not suppressed. The basis is informative and the denial rules do not depend on it; a LinkedIn contact is allowed on `rep_initiated` or `reply`. */
declare const CONTACT_ALLOW_BASES: readonly ["consent_granted", "rep_initiated", "reply", "email_no_suppression"];
/**
* Internal: the body of a Contact Check. The calling service has no user token, so it names the
* Organization (ADR 0013) and itself as `caller`; the purpose is set by that service from what it
* is about to do, and there is no field that waives the check. The target is exactly one of a
* Prospect or an address (an email, a phone or a LinkedIn address), which core normalises.
*/
declare const contactCheckRequestSchema: z3.ZodObject<{
	email: z3.ZodOptional<z3.ZodPipe<z3.ZodPipe<z3.ZodString, z3.ZodTransform<string, string>>, z3.ZodString>>;
	phone: z3.ZodOptional<z3.ZodPipe<z3.ZodString, z3.ZodString>>;
	linkedinUrl: z3.ZodOptional<z3.ZodPipe<z3.ZodString, z3.ZodString>>;
	organizationId: z3.core.$ZodBranded<z3.ZodString, "org", "out">;
	prospectId: z3.ZodOptional<z3.core.$ZodBranded<z3.ZodString, "prs", "out">>;
	channel: z3.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	purpose: z3.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
	caller: z3.ZodString;
}, z3.core.$strict>;
/** The body of a Contact Check. */
type ContactCheckRequest = z3.infer<typeof contactCheckRequestSchema>;
/**
* The answer to a Contact Check: an allowance with its `basis`, or a denial with a `consent.*`
* `code`. Every answered check is logged under `checkId`; a denial for a Prospect that does not
* exist is `consent.missing`, so the answer never reveals whether a record exists.
*/
declare const contactCheckResultSchema: z3.ZodUnion<readonly [z3.ZodObject<{
	allowed: z3.ZodLiteral<true>;
	checkId: z3.core.$ZodBranded<z3.ZodString, "chk", "out">;
	basis: z3.ZodEnum<{
		consent_granted: "consent_granted";
		email_no_suppression: "email_no_suppression";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
}, z3.core.$strict>, z3.ZodObject<{
	allowed: z3.ZodLiteral<false>;
	checkId: z3.ZodNullable<z3.core.$ZodBranded<z3.ZodString, "chk", "out">>;
	code: z3.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>;
	suppressionReason: z3.ZodNullable<z3.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z3.core.$strict>]>;
/** The answer to a Contact Check. */
type ContactCheckResult = z3.infer<typeof contactCheckResultSchema>;
/** One logged Contact Check, for the Organization's audit. The address is never stored with it. */
declare const contactCheckLogEntrySchema: z3.ZodObject<{
	id: z3.core.$ZodBranded<z3.ZodString, "chk", "out">;
	prospectId: z3.ZodNullable<z3.core.$ZodBranded<z3.ZodString, "prs", "out">>;
	channel: z3.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	purpose: z3.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
	caller: z3.ZodString;
	allowed: z3.ZodBoolean;
	code: z3.ZodNullable<z3.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>>;
	basis: z3.ZodNullable<z3.ZodEnum<{
		consent_granted: "consent_granted";
		email_no_suppression: "email_no_suppression";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>>;
	checkedAt: z3.ZodISODateTime;
}, z3.core.$strip>;
/** One logged Contact Check. */
type ContactCheckLogEntry = z3.infer<typeof contactCheckLogEntrySchema>;
/** The query parameters of a request to list logged Contact Checks, newest first, with optional filters. */
declare const listContactChecksQuerySchema: z3.ZodObject<{
	cursor: z3.ZodOptional<z3.ZodString>;
	limit: z3.ZodDefault<z3.ZodPipe<z3.ZodPipe<z3.ZodUnion<readonly [z3.ZodNumber, z3.ZodString]>, z3.ZodTransform<number, string | number>>, z3.ZodNumber>>;
	channel: z3.ZodOptional<z3.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	purpose: z3.ZodOptional<z3.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>>;
	allowed: z3.ZodOptional<z3.ZodEnum<{
		false: "false";
		true: "true";
	}>>;
	prospectId: z3.ZodOptional<z3.core.$ZodBranded<z3.ZodString, "prs", "out">>;
	code: z3.ZodOptional<z3.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>>;
}, z3.core.$strict>;
/** The query parameters of a request to list logged Contact Checks. */
type ListContactChecksQuery = z3.infer<typeof listContactChecksQuerySchema>;
/** One page of logged Contact Checks. */
declare const contactCheckLogPageSchema: z3.ZodObject<{
	items: z3.ZodArray<z3.ZodObject<{
		id: z3.core.$ZodBranded<z3.ZodString, "chk", "out">;
		prospectId: z3.ZodNullable<z3.core.$ZodBranded<z3.ZodString, "prs", "out">>;
		channel: z3.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		purpose: z3.ZodEnum<{
			agent_initiated: "agent_initiated";
			rep_initiated: "rep_initiated";
			reply: "reply";
		}>;
		caller: z3.ZodString;
		allowed: z3.ZodBoolean;
		code: z3.ZodNullable<z3.ZodEnum<{
			"consent.missing": "consent.missing";
			"consent.suppressed": "consent.suppressed";
			"consent.unavailable": "consent.unavailable";
			"consent.withdrawn": "consent.withdrawn";
		}>>;
		basis: z3.ZodNullable<z3.ZodEnum<{
			consent_granted: "consent_granted";
			email_no_suppression: "email_no_suppression";
			rep_initiated: "rep_initiated";
			reply: "reply";
		}>>;
		checkedAt: z3.ZodISODateTime;
	}, z3.core.$strip>>;
	nextCursor: z3.ZodNullable<z3.ZodString>;
}, z3.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh453 } from "..";
/**
* The errors the consent routes return, as `area.reason` codes.
*
* - `consent.not_found` (404): a Consent Wording, form, Suppression entry or import that does not
*   exist or belongs to another Organization; `details.resource` is `wording`, `form`, `entry` or
*   `import`. An unknown Prospect is `prospect.not_found`.
* - `consent.wording_locked` (409): the wording is referenced by a consent event or a published
*   form, so it cannot be edited; write a new version.
* - `consent.invalid_token` (400): the token of a public route is tampered, expired or unknown. It
*   never says which, and never echoes an address.
* - `consent.entry_not_removable` (409): only a `manual` Suppression entry can be removed.
* - `consent.missing`, `consent.withdrawn`, `consent.suppressed` and `consent.unavailable` are the
*   denial codes of a Contact Check. They are results (see `CONTACT_DENIAL_CODES`), never the error
*   of a route; they sit in this registry so every service names them the same way. The status
*   shown is for a caller that chooses to surface a denial over HTTP; `consent.unavailable` is
*   synthesised by the kit's client, never answered by core.
*/
declare const CONSENT_ERRORS: {
	readonly "consent.entry_not_removable": ErrorDefinition_8gwh453<"consent.entry_not_removable">;
	readonly "consent.invalid_token": ErrorDefinition_8gwh453<"consent.invalid_token">;
	readonly "consent.missing": ErrorDefinition_8gwh453<"consent.missing">;
	readonly "consent.not_found": ErrorDefinition_8gwh453<"consent.not_found">;
	readonly "consent.suppressed": ErrorDefinition_8gwh453<"consent.suppressed">;
	readonly "consent.unavailable": ErrorDefinition_8gwh453<"consent.unavailable">;
	readonly "consent.withdrawn": ErrorDefinition_8gwh453<"consent.withdrawn">;
	readonly "consent.wording_locked": ErrorDefinition_8gwh453<"consent.wording_locked">;
};
/** A consent error code. */
type ConsentErrorCode = keyof typeof CONSENT_ERRORS;
import { z as z4 } from "zod";
/** `consent.granted` (version 1): a Contact Consent was recorded on a channel. Ids and kinds only: no address, no wording text. */
declare const consentGrantedEvent: {
	type: "consent.granted";
	version: 1;
	schema: z4.ZodObject<{
		id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
		occurredAt: z4.ZodISODateTime;
		organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
		region: z4.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z4.ZodLiteral<"consent.granted">;
		version: z4.ZodLiteral<1>;
		data: z4.ZodObject<{
			consentEventId: z4.core.$ZodBranded<z4.ZodString, "cev", "out">;
			prospectId: z4.core.$ZodBranded<z4.ZodString, "prs", "out">;
			channel: z4.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			source: z4.ZodEnum<{
				crm: "crm";
				hosted_form: "hosted_form";
				import_attestation: "import_attestation";
				manual: "manual";
				verbal_call: "verbal_call";
			}>;
			wordingId: z4.core.$ZodBranded<z4.ZodString, "cwd", "out">;
		}, z4.core.$strict>;
	}, z4.core.$strip>;
	parse: (input: unknown) => {
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "consent.granted";
		version: 1;
		data: {
			consentEventId: string & z4.$brand<"cev">;
			prospectId: string & z4.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
			wordingId: string & z4.$brand<"cwd">;
		};
	};
	safeParse: (input: unknown) => z4.ZodSafeParseResult<{
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "consent.granted";
		version: 1;
		data: {
			consentEventId: string & z4.$brand<"cev">;
			prospectId: string & z4.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
			wordingId: string & z4.$brand<"cwd">;
		};
	}>;
};
/** `consent.withdrawn` (version 1): a Contact Consent was withdrawn on a channel; `stopAll` is true for each event of a STOP-all. One event per channel. */
declare const consentWithdrawnEvent: {
	type: "consent.withdrawn";
	version: 1;
	schema: z4.ZodObject<{
		id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
		occurredAt: z4.ZodISODateTime;
		organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
		region: z4.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z4.ZodLiteral<"consent.withdrawn">;
		version: z4.ZodLiteral<1>;
		data: z4.ZodObject<{
			consentEventId: z4.core.$ZodBranded<z4.ZodString, "cev", "out">;
			prospectId: z4.core.$ZodBranded<z4.ZodString, "prs", "out">;
			channel: z4.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			source: z4.ZodEnum<{
				crm: "crm";
				manual: "manual";
				stop_reply: "stop_reply";
				unsubscribe: "unsubscribe";
			}>;
			stopAll: z4.ZodBoolean;
		}, z4.core.$strict>;
	}, z4.core.$strip>;
	parse: (input: unknown) => {
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "consent.withdrawn";
		version: 1;
		data: {
			consentEventId: string & z4.$brand<"cev">;
			prospectId: string & z4.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "manual" | "stop_reply" | "unsubscribe";
			stopAll: boolean;
		};
	};
	safeParse: (input: unknown) => z4.ZodSafeParseResult<{
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "consent.withdrawn";
		version: 1;
		data: {
			consentEventId: string & z4.$brand<"cev">;
			prospectId: string & z4.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "manual" | "stop_reply" | "unsubscribe";
			stopAll: boolean;
		};
	}>;
};
/** `suppression.added` (version 1): an address was added to the Suppression list. `prospectId` is null when no Prospect has the address. */
declare const suppressionAddedEvent: {
	type: "suppression.added";
	version: 1;
	schema: z4.ZodObject<{
		id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
		occurredAt: z4.ZodISODateTime;
		organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
		region: z4.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z4.ZodLiteral<"suppression.added">;
		version: z4.ZodLiteral<1>;
		data: z4.ZodObject<{
			suppressionEntryId: z4.core.$ZodBranded<z4.ZodString, "sup", "out">;
			addressKind: z4.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
			}>;
			reason: z4.ZodEnum<{
				bounce: "bounce";
				complaint: "complaint";
				crm: "crm";
				erased: "erased";
				manual: "manual";
				stop: "stop";
				unsubscribe: "unsubscribe";
			}>;
			prospectId: z4.ZodNullable<z4.core.$ZodBranded<z4.ZodString, "prs", "out">>;
		}, z4.core.$strict>;
	}, z4.core.$strip>;
	parse: (input: unknown) => {
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.added";
		version: 1;
		data: {
			suppressionEntryId: string & z4.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
			reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
			prospectId: (string & z4.$brand<"prs">) | null;
		};
	};
	safeParse: (input: unknown) => z4.ZodSafeParseResult<{
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.added";
		version: 1;
		data: {
			suppressionEntryId: string & z4.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
			reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
			prospectId: (string & z4.$brand<"prs">) | null;
		};
	}>;
};
/** `suppression.removed` (version 1): a manual entry was removed from the Suppression list. */
declare const suppressionRemovedEvent: {
	type: "suppression.removed";
	version: 1;
	schema: z4.ZodObject<{
		id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
		occurredAt: z4.ZodISODateTime;
		organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
		region: z4.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z4.ZodLiteral<"suppression.removed">;
		version: z4.ZodLiteral<1>;
		data: z4.ZodObject<{
			suppressionEntryId: z4.core.$ZodBranded<z4.ZodString, "sup", "out">;
			addressKind: z4.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
			}>;
		}, z4.core.$strict>;
	}, z4.core.$strip>;
	parse: (input: unknown) => {
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.removed";
		version: 1;
		data: {
			suppressionEntryId: string & z4.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
		};
	};
	safeParse: (input: unknown) => z4.ZodSafeParseResult<{
		id: string & z4.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z4.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.removed";
		version: 1;
		data: {
			suppressionEntryId: string & z4.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
		};
	}>;
};
/** Every consent event, by type. */
declare const CONSENT_EVENTS: {
	readonly "consent.granted": {
		type: "consent.granted";
		version: 1;
		schema: z4.ZodObject<{
			id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
			occurredAt: z4.ZodISODateTime;
			organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
			region: z4.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z4.ZodLiteral<"consent.granted">;
			version: z4.ZodLiteral<1>;
			data: z4.ZodObject<{
				consentEventId: z4.core.$ZodBranded<z4.ZodString, "cev", "out">;
				prospectId: z4.core.$ZodBranded<z4.ZodString, "prs", "out">;
				channel: z4.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				source: z4.ZodEnum<{
					crm: "crm";
					hosted_form: "hosted_form";
					import_attestation: "import_attestation";
					manual: "manual";
					verbal_call: "verbal_call";
				}>;
				wordingId: z4.core.$ZodBranded<z4.ZodString, "cwd", "out">;
			}, z4.core.$strict>;
		}, z4.core.$strip>;
		parse: (input: unknown) => {
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "consent.granted";
			version: 1;
			data: {
				consentEventId: string & z4.$brand<"cev">;
				prospectId: string & z4.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
				wordingId: string & z4.$brand<"cwd">;
			};
		};
		safeParse: (input: unknown) => z4.ZodSafeParseResult<{
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "consent.granted";
			version: 1;
			data: {
				consentEventId: string & z4.$brand<"cev">;
				prospectId: string & z4.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
				wordingId: string & z4.$brand<"cwd">;
			};
		}>;
	};
	readonly "consent.withdrawn": {
		type: "consent.withdrawn";
		version: 1;
		schema: z4.ZodObject<{
			id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
			occurredAt: z4.ZodISODateTime;
			organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
			region: z4.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z4.ZodLiteral<"consent.withdrawn">;
			version: z4.ZodLiteral<1>;
			data: z4.ZodObject<{
				consentEventId: z4.core.$ZodBranded<z4.ZodString, "cev", "out">;
				prospectId: z4.core.$ZodBranded<z4.ZodString, "prs", "out">;
				channel: z4.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				source: z4.ZodEnum<{
					crm: "crm";
					manual: "manual";
					stop_reply: "stop_reply";
					unsubscribe: "unsubscribe";
				}>;
				stopAll: z4.ZodBoolean;
			}, z4.core.$strict>;
		}, z4.core.$strip>;
		parse: (input: unknown) => {
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "consent.withdrawn";
			version: 1;
			data: {
				consentEventId: string & z4.$brand<"cev">;
				prospectId: string & z4.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "manual" | "stop_reply" | "unsubscribe";
				stopAll: boolean;
			};
		};
		safeParse: (input: unknown) => z4.ZodSafeParseResult<{
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "consent.withdrawn";
			version: 1;
			data: {
				consentEventId: string & z4.$brand<"cev">;
				prospectId: string & z4.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "manual" | "stop_reply" | "unsubscribe";
				stopAll: boolean;
			};
		}>;
	};
	readonly "suppression.added": {
		type: "suppression.added";
		version: 1;
		schema: z4.ZodObject<{
			id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
			occurredAt: z4.ZodISODateTime;
			organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
			region: z4.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z4.ZodLiteral<"suppression.added">;
			version: z4.ZodLiteral<1>;
			data: z4.ZodObject<{
				suppressionEntryId: z4.core.$ZodBranded<z4.ZodString, "sup", "out">;
				addressKind: z4.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
				}>;
				reason: z4.ZodEnum<{
					bounce: "bounce";
					complaint: "complaint";
					crm: "crm";
					erased: "erased";
					manual: "manual";
					stop: "stop";
					unsubscribe: "unsubscribe";
				}>;
				prospectId: z4.ZodNullable<z4.core.$ZodBranded<z4.ZodString, "prs", "out">>;
			}, z4.core.$strict>;
		}, z4.core.$strip>;
		parse: (input: unknown) => {
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.added";
			version: 1;
			data: {
				suppressionEntryId: string & z4.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
				reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
				prospectId: (string & z4.$brand<"prs">) | null;
			};
		};
		safeParse: (input: unknown) => z4.ZodSafeParseResult<{
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.added";
			version: 1;
			data: {
				suppressionEntryId: string & z4.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
				reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
				prospectId: (string & z4.$brand<"prs">) | null;
			};
		}>;
	};
	readonly "suppression.removed": {
		type: "suppression.removed";
		version: 1;
		schema: z4.ZodObject<{
			id: z4.core.$ZodBranded<z4.ZodString, "evt", "out">;
			occurredAt: z4.ZodISODateTime;
			organizationId: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
			region: z4.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z4.ZodLiteral<"suppression.removed">;
			version: z4.ZodLiteral<1>;
			data: z4.ZodObject<{
				suppressionEntryId: z4.core.$ZodBranded<z4.ZodString, "sup", "out">;
				addressKind: z4.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
				}>;
			}, z4.core.$strict>;
		}, z4.core.$strip>;
		parse: (input: unknown) => {
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.removed";
			version: 1;
			data: {
				suppressionEntryId: string & z4.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
			};
		};
		safeParse: (input: unknown) => z4.ZodSafeParseResult<{
			id: string & z4.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z4.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.removed";
			version: 1;
			data: {
				suppressionEntryId: string & z4.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
			};
		}>;
	};
};
/** The type of a consent event. */
type ConsentEventType = keyof typeof CONSENT_EVENTS;
import { z as z5 } from "zod";
/**
* One ledger event with everything that proves it: the wording shown (id, version and exact text)
* and, for a hosted form, the IP address and user agent core read from the request. Only Owner and
* Admin read it. `submission` is set exactly for a `hosted_form` event.
*/
declare const evidenceEventSchema: z5.ZodIntersection<z5.ZodObject<{
	id: z5.core.$ZodBranded<z5.ZodString, "cev", "out">;
	prospectId: z5.core.$ZodBranded<z5.ZodString, "prs", "out">;
	channel: z5.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	kind: z5.ZodEnum<{
		granted: "granted";
		withdrawn: "withdrawn";
	}>;
	source: z5.ZodUnion<readonly [z5.ZodEnum<{
		crm: "crm";
		hosted_form: "hosted_form";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>, z5.ZodEnum<{
		crm: "crm";
		manual: "manual";
		stop_reply: "stop_reply";
		unsubscribe: "unsubscribe";
	}>]>;
	wordingId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "cwd", "out">>;
	evidenceRef: z5.ZodNullable<z5.ZodPipe<z5.ZodString, z5.ZodString>>;
	callId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "call", "out">>;
	formId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "cfm", "out">>;
	stopAll: z5.ZodBoolean;
	recordedByUserId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "usr", "out">>;
	occurredAt: z5.ZodISODateTime;
	recordedAt: z5.ZodISODateTime;
}, z5.core.$strip>, z5.ZodObject<{
	wording: z5.ZodNullable<z5.ZodObject<{
		id: z5.core.$ZodBranded<z5.ZodString, "cwd", "out">;
		version: z5.ZodNumber;
		text: z5.ZodString;
	}, z5.core.$strip>>;
	submission: z5.ZodNullable<z5.ZodObject<{
		ipAddress: z5.ZodString;
		userAgent: z5.ZodString;
	}, z5.core.$strip>>;
}, z5.core.$strip>>;
/** One ledger event with its evidence. */
type EvidenceEvent = z5.infer<typeof evidenceEventSchema>;
/** The query parameters of a request for a Prospect's evidence, newest first, optionally one channel. */
declare const listEvidenceQuerySchema: z5.ZodObject<{
	cursor: z5.ZodOptional<z5.ZodString>;
	limit: z5.ZodDefault<z5.ZodPipe<z5.ZodPipe<z5.ZodUnion<readonly [z5.ZodNumber, z5.ZodString]>, z5.ZodTransform<number, string | number>>, z5.ZodNumber>>;
	channel: z5.ZodOptional<z5.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z5.core.$strict>;
/** One page of evidence events. */
declare const evidencePageSchema: z5.ZodObject<{
	items: z5.ZodArray<z5.ZodIntersection<z5.ZodObject<{
		id: z5.core.$ZodBranded<z5.ZodString, "cev", "out">;
		prospectId: z5.core.$ZodBranded<z5.ZodString, "prs", "out">;
		channel: z5.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z5.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z5.ZodUnion<readonly [z5.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z5.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "cwd", "out">>;
		evidenceRef: z5.ZodNullable<z5.ZodPipe<z5.ZodString, z5.ZodString>>;
		callId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "call", "out">>;
		formId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "cfm", "out">>;
		stopAll: z5.ZodBoolean;
		recordedByUserId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "usr", "out">>;
		occurredAt: z5.ZodISODateTime;
		recordedAt: z5.ZodISODateTime;
	}, z5.core.$strip>, z5.ZodObject<{
		wording: z5.ZodNullable<z5.ZodObject<{
			id: z5.core.$ZodBranded<z5.ZodString, "cwd", "out">;
			version: z5.ZodNumber;
			text: z5.ZodString;
		}, z5.core.$strip>>;
		submission: z5.ZodNullable<z5.ZodObject<{
			ipAddress: z5.ZodString;
			userAgent: z5.ZodString;
		}, z5.core.$strip>>;
	}, z5.core.$strip>>>;
	nextCursor: z5.ZodNullable<z5.ZodString>;
}, z5.core.$strip>;
/** The columns of the CSV evidence export, in order. The file carries the same fields as the JSON and no more. */
declare const EVIDENCE_CSV_COLUMNS: readonly ["event_id", "prospect_id", "channel", "kind", "source", "occurred_at", "recorded_at", "wording_id", "wording_version", "wording_text", "evidence_ref", "ip_address", "user_agent"];
import { z as z6 } from "zod";
/** The current state of one channel's Contact Consent, derived from the ledger and never edited. */
declare const CONSENT_STATES: readonly ["granted", "withdrawn", "none"];
/** The current state of a channel's Contact Consent. */
declare const consentStateSchema: z6.ZodEnum<{
	granted: "granted";
	none: "none";
	withdrawn: "withdrawn";
}>;
/** The current state of a channel's Contact Consent. */
type ConsentState = z6.infer<typeof consentStateSchema>;
/**
* One event of the append-only consent ledger (ADR 0021). A `granted` event carries the Consent
* Wording shown (`wordingId`), the `evidenceRef` and, by source, the Call (`verbal_call`) or the
* hosted form (`hosted_form`); a `withdrawn` event needs neither wording nor evidence and has a
* withdrawal source. `stopAll` is true on each event a STOP-all appended. `occurredAt` is when the
* Prospect agreed or withdrew, `recordedAt` when core stored it; `recordedByUserId` is null when a
* system (a form, a STOP reply, a sync) recorded it. The ledger is never updated or deleted.
*/
declare const consentEventSchema: z6.ZodObject<{
	id: z6.core.$ZodBranded<z6.ZodString, "cev", "out">;
	prospectId: z6.core.$ZodBranded<z6.ZodString, "prs", "out">;
	channel: z6.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	kind: z6.ZodEnum<{
		granted: "granted";
		withdrawn: "withdrawn";
	}>;
	source: z6.ZodUnion<readonly [z6.ZodEnum<{
		crm: "crm";
		hosted_form: "hosted_form";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>, z6.ZodEnum<{
		crm: "crm";
		manual: "manual";
		stop_reply: "stop_reply";
		unsubscribe: "unsubscribe";
	}>]>;
	wordingId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cwd", "out">>;
	evidenceRef: z6.ZodNullable<z6.ZodPipe<z6.ZodString, z6.ZodString>>;
	callId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "call", "out">>;
	formId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cfm", "out">>;
	stopAll: z6.ZodBoolean;
	recordedByUserId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "usr", "out">>;
	occurredAt: z6.ZodISODateTime;
	recordedAt: z6.ZodISODateTime;
}, z6.core.$strip>;
/** One event of the consent ledger. */
type ConsentEvent = z6.infer<typeof consentEventSchema>;
/** The state of one channel for a Prospect: `since` and the last event are null while there is no event. */
declare const channelConsentSchema: z6.ZodObject<{
	channel: z6.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	state: z6.ZodEnum<{
		granted: "granted";
		none: "none";
		withdrawn: "withdrawn";
	}>;
	since: z6.ZodNullable<z6.ZodISODateTime>;
	lastEventId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cev", "out">>;
	wordingId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cwd", "out">>;
}, z6.core.$strip>;
/**
* A Prospect's Contact Consent per channel, derived from the ledger, with whether the Prospect
* is on the Suppression list and why. Every channel appears exactly once. `suppressed` is true
* exactly when `suppressionReason` is set; a suppressed Prospect is refused on every channel.
*/
declare const prospectConsentSchema: z6.ZodObject<{
	prospectId: z6.core.$ZodBranded<z6.ZodString, "prs", "out">;
	channels: z6.ZodArray<z6.ZodObject<{
		channel: z6.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		state: z6.ZodEnum<{
			granted: "granted";
			none: "none";
			withdrawn: "withdrawn";
		}>;
		since: z6.ZodNullable<z6.ZodISODateTime>;
		lastEventId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cev", "out">>;
		wordingId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cwd", "out">>;
	}, z6.core.$strip>>;
	suppressed: z6.ZodBoolean;
	suppressionReason: z6.ZodNullable<z6.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z6.core.$strip>;
/** A Prospect's Contact Consent per channel. */
type ProspectConsent = z6.infer<typeof prospectConsentSchema>;
/**
* The body of a request to record a granted Contact Consent. `source` is one a person may claim
* (never `hosted_form`; core sets that from the form); the wording must be one the Organization
* wrote that covers the channel, and `evidenceRef` points at the artefact. A `verbal_call` grant
* names the Call as `callId`; other sources must not. The actor is the caller, set by core.
* `occurredAt` defaults to now and may not be in the future. Without a source, wording and
* reference core refuses the request: a checkbox is not proof. Accepts an `Idempotency-Key`.
*/
declare const recordConsentRequestSchema: z6.ZodObject<{
	channel: z6.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	source: z6.ZodEnum<{
		crm: "crm";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>;
	wordingId: z6.core.$ZodBranded<z6.ZodString, "cwd", "out">;
	evidenceRef: z6.ZodPipe<z6.ZodString, z6.ZodString>;
	callId: z6.ZodOptional<z6.core.$ZodBranded<z6.ZodString, "call", "out">>;
	occurredAt: z6.ZodOptional<z6.ZodISODateTime>;
}, z6.core.$strict>;
/** The body of a request to record a granted Contact Consent. */
type RecordConsentRequest = z6.infer<typeof recordConsentRequestSchema>;
/**
* The body of a request to record a withdrawal: the named `channels`, or `all: true` for a
* STOP-all that withdraws every channel. Exactly one of the two. A withdrawal on some channels
* leaves the others alone. The source is `manual` and the actor the caller, set by core.
*/
declare const withdrawConsentRequestSchema: z6.ZodObject<{
	channels: z6.ZodOptional<z6.ZodArray<z6.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>>;
	all: z6.ZodOptional<z6.ZodLiteral<true>>;
	occurredAt: z6.ZodOptional<z6.ZodISODateTime>;
}, z6.core.$strict>;
/** The body of a request to record a withdrawal. */
type WithdrawConsentRequest = z6.infer<typeof withdrawConsentRequestSchema>;
/** The path parameters of a request about one Prospect's consent. */
declare const consentProspectParamsSchema: z6.ZodObject<{
	prospectId: z6.core.$ZodBranded<z6.ZodString, "prs", "out">;
}, z6.core.$strict>;
/** The query parameters of a request to list a Prospect's consent events: newest first, optionally one channel. */
declare const listConsentEventsQuerySchema: z6.ZodObject<{
	cursor: z6.ZodOptional<z6.ZodString>;
	limit: z6.ZodDefault<z6.ZodPipe<z6.ZodPipe<z6.ZodUnion<readonly [z6.ZodNumber, z6.ZodString]>, z6.ZodTransform<number, string | number>>, z6.ZodNumber>>;
	channel: z6.ZodOptional<z6.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z6.core.$strict>;
/** The query parameters of a request to list consent events. */
type ListConsentEventsQuery = z6.infer<typeof listConsentEventsQuerySchema>;
/** One page of consent events. */
declare const consentEventPageSchema: z6.ZodObject<{
	items: z6.ZodArray<z6.ZodObject<{
		id: z6.core.$ZodBranded<z6.ZodString, "cev", "out">;
		prospectId: z6.core.$ZodBranded<z6.ZodString, "prs", "out">;
		channel: z6.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z6.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z6.ZodUnion<readonly [z6.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z6.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cwd", "out">>;
		evidenceRef: z6.ZodNullable<z6.ZodPipe<z6.ZodString, z6.ZodString>>;
		callId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "call", "out">>;
		formId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cfm", "out">>;
		stopAll: z6.ZodBoolean;
		recordedByUserId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "usr", "out">>;
		occurredAt: z6.ZodISODateTime;
		recordedAt: z6.ZodISODateTime;
	}, z6.core.$strip>>;
	nextCursor: z6.ZodNullable<z6.ZodString>;
}, z6.core.$strip>;
/** The answer to recording a grant or a withdrawal: the events appended (one per channel) and the Prospect's consent now. */
declare const recordedConsentSchema: z6.ZodObject<{
	events: z6.ZodArray<z6.ZodObject<{
		id: z6.core.$ZodBranded<z6.ZodString, "cev", "out">;
		prospectId: z6.core.$ZodBranded<z6.ZodString, "prs", "out">;
		channel: z6.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z6.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z6.ZodUnion<readonly [z6.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z6.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cwd", "out">>;
		evidenceRef: z6.ZodNullable<z6.ZodPipe<z6.ZodString, z6.ZodString>>;
		callId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "call", "out">>;
		formId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cfm", "out">>;
		stopAll: z6.ZodBoolean;
		recordedByUserId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "usr", "out">>;
		occurredAt: z6.ZodISODateTime;
		recordedAt: z6.ZodISODateTime;
	}, z6.core.$strip>>;
	consent: z6.ZodObject<{
		prospectId: z6.core.$ZodBranded<z6.ZodString, "prs", "out">;
		channels: z6.ZodArray<z6.ZodObject<{
			channel: z6.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			state: z6.ZodEnum<{
				granted: "granted";
				none: "none";
				withdrawn: "withdrawn";
			}>;
			since: z6.ZodNullable<z6.ZodISODateTime>;
			lastEventId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cev", "out">>;
			wordingId: z6.ZodNullable<z6.core.$ZodBranded<z6.ZodString, "cwd", "out">>;
		}, z6.core.$strip>>;
		suppressed: z6.ZodBoolean;
		suppressionReason: z6.ZodNullable<z6.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>>;
	}, z6.core.$strip>;
}, z6.core.$strip>;
/** The answer to recording a grant or a withdrawal. */
type RecordedConsent = z6.infer<typeof recordedConsentSchema>;
import { z as z7 } from "zod";
/** The path parameters of every public route: the signed token from the link. */
declare const consentTokenParamsSchema: z7.ZodObject<{
	token: z7.ZodString;
}, z7.core.$strict>;
/**
* The body of a hosted consent form submission. Each channel the form offers is an explicit,
* unticked-by-default choice (`agreed` has no default), at least one must be agreed, and the
* address a channel needs is required: a phone for phone, sms and whatsapp, an email for email.
* The wording is the one the page showed. The IP address and user agent are read from the request
* by core as evidence, and the Prospect is found or made by core: neither is in the body. Accepts
* an `Idempotency-Key`, so a double click records once.
*/
declare const hostedConsentSubmissionSchema: z7.ZodObject<{
	wordingId: z7.core.$ZodBranded<z7.ZodString, "cwd", "out">;
	firstName: z7.ZodOptional<z7.ZodPipe<z7.ZodString, z7.ZodString>>;
	lastName: z7.ZodOptional<z7.ZodPipe<z7.ZodString, z7.ZodString>>;
	email: z7.ZodOptional<z7.ZodPipe<z7.ZodPipe<z7.ZodString, z7.ZodTransform<string, string>>, z7.ZodString>>;
	phone: z7.ZodOptional<z7.ZodPipe<z7.ZodString, z7.ZodString>>;
	choices: z7.ZodArray<z7.ZodObject<{
		channel: z7.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		agreed: z7.ZodBoolean;
	}, z7.core.$strict>>;
}, z7.core.$strict>;
/** The body of a hosted consent form submission. */
type HostedConsentSubmission = z7.infer<typeof hostedConsentSubmissionSchema>;
/** What the hosted form page shows: the Organization's name, the exact wording and the channels offered. Nothing about any Prospect. */
declare const hostedConsentFormViewSchema: z7.ZodObject<{
	organizationName: z7.ZodPipe<z7.ZodString, z7.ZodString>;
	wordingId: z7.core.$ZodBranded<z7.ZodString, "cwd", "out">;
	wordingVersion: z7.ZodNumber;
	wordingText: z7.ZodPipe<z7.ZodString, z7.ZodString>;
	channels: z7.ZodArray<z7.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z7.core.$strip>;
/** What the hosted form page shows. */
type HostedConsentFormView = z7.infer<typeof hostedConsentFormViewSchema>;
/** The receipt of a hosted submission: the channels recorded and when. It never repeats the address. */
declare const hostedConsentReceiptSchema: z7.ZodObject<{
	channels: z7.ZodArray<z7.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	recordedAt: z7.ZodISODateTime;
}, z7.core.$strip>;
/** The receipt of a hosted submission. */
type HostedConsentReceipt = z7.infer<typeof hostedConsentReceiptSchema>;
/** What the unsubscribe page shows for a link: the Organization's name and the channel, never the address. */
declare const unsubscribePreviewSchema: z7.ZodObject<{
	organizationName: z7.ZodPipe<z7.ZodString, z7.ZodString>;
	channel: z7.ZodLiteral<"email">;
}, z7.core.$strip>;
/** What the unsubscribe page shows. */
type UnsubscribePreview = z7.infer<typeof unsubscribePreviewSchema>;
/** The one-click unsubscribe body of RFC 8058 (`List-Unsubscribe-Post`): exactly this pair. */
declare const oneClickUnsubscribeRequestSchema: z7.ZodObject<{
	"List-Unsubscribe": z7.ZodLiteral<"One-Click">;
}, z7.core.$strict>;
/** The one-click unsubscribe body. */
type OneClickUnsubscribeRequest = z7.infer<typeof oneClickUnsubscribeRequestSchema>;
/** The receipt of an unsubscribe: it happened and when. A replayed link answers the same. It never repeats the address. */
declare const unsubscribeReceiptSchema: z7.ZodObject<{
	unsubscribed: z7.ZodLiteral<true>;
	recordedAt: z7.ZodISODateTime;
}, z7.core.$strip>;
/** The receipt of an unsubscribe. */
type UnsubscribeReceipt = z7.infer<typeof unsubscribeReceiptSchema>;
import { z as z8 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh454 } from "..";
/**
* The errors the Prospect routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A record of another Organization, or one the caller may not see (a
* Rep's view of another Rep's Prospect), is `prospect.not_found` (404, never 403), so existence is
* not revealed; `details.resource` names which kind of record it was.
*
* - `prospect.duplicate_identity` (409): another Prospect of the Organization already has this
*   normalised email, phone or LinkedIn address. `details` is {@link duplicateIdentityDetailsSchema};
*   `prospectId` is present only when the caller may see that Prospect.
* - `prospect.import_invalid` (422): the upload was refused before anything was stored;
*   `details.reason` is one of `PROSPECT_IMPORT_INVALID_REASONS`. A bad row is never an HTTP error:
*   it is a row in the report.
* - `prospect.merge_conflict` (409): the merge cannot be made or undone, for example a Prospect is
*   already merged, the same Prospect is named twice, or the thirty-day undo window has passed.
* - `prospect.forbidden_owner` (403): the named owner is not allowed: a member of another
*   Organization, someone who is not a Rep or Manager, or a Rep naming someone other than themselves.
*/
declare const PROSPECT_ERRORS: {
	readonly "prospect.duplicate_identity": ErrorDefinition_8gwh454<"prospect.duplicate_identity">;
	readonly "prospect.forbidden_owner": ErrorDefinition_8gwh454<"prospect.forbidden_owner">;
	readonly "prospect.import_invalid": ErrorDefinition_8gwh454<"prospect.import_invalid">;
	readonly "prospect.merge_conflict": ErrorDefinition_8gwh454<"prospect.merge_conflict">;
	readonly "prospect.not_found": ErrorDefinition_8gwh454<"prospect.not_found">;
};
/** A code from the {@link PROSPECT_ERRORS} registry. */
type ProspectErrorCode = keyof typeof PROSPECT_ERRORS;
/** The `details` of `prospect.not_found`: which kind of record was not found. */
declare const prospectNotFoundDetailsSchema: z8.ZodObject<{
	resource: z8.ZodEnum<{
		company: "company";
		import: "import";
		merge: "merge";
		prospect: "prospect";
	}>;
}, z8.core.$strict>;
/** The `details` of `prospect.not_found`. */
type ProspectNotFoundDetails = z8.infer<typeof prospectNotFoundDetailsSchema>;
/** The `details` of `prospect.duplicate_identity`: which kind of identity clashed and, when the caller may see it, the other Prospect. */
declare const duplicateIdentityDetailsSchema: z8.ZodObject<{
	identityKind: z8.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>;
	prospectId: z8.ZodOptional<z8.core.$ZodBranded<z8.ZodString, "prs", "out">>;
}, z8.core.$strict>;
/** The `details` of `prospect.duplicate_identity`. */
type DuplicateIdentityDetails = z8.infer<typeof duplicateIdentityDetailsSchema>;
import { z as z9 } from "zod";
/** Every Region an Organization can be created in. */
declare const REGIONS: readonly ["us", "eu"];
/** A Region: the geography whose boundary an Organization's data never crosses. */
declare const regionSchema: z9.ZodEnum<{
	eu: "eu";
	us: "us";
}>;
/** A Region. */
type Region = z9.infer<typeof regionSchema>;
/** Every role, ordered from most to least privileged. */
declare const ROLES: readonly ["owner", "admin", "manager", "rep"];
/** A member's role in an Organization. */
declare const roleSchema: z9.ZodEnum<{
	admin: "admin";
	manager: "manager";
	owner: "owner";
	rep: "rep";
}>;
/** A role. */
type Role = z9.infer<typeof roleSchema>;
/** Whether `role` is at least as privileged as `minimum`; an unrecognised role is never enough. */
declare function roleAtLeast(role: Role, minimum: Role): boolean;
/** The roles an Invitation can offer; ownership passes by promoting a member, never by Invitation. */
declare const INVITABLE_ROLES: readonly ["admin", "manager", "rep"];
/** A role an Invitation can offer: any role except `owner`. */
declare const invitableRoleSchema: z9.ZodEnum<{
	admin: "admin";
	manager: "manager";
	rep: "rep";
}>;
/** A role an Invitation can offer. */
type InvitableRole = z9.infer<typeof invitableRoleSchema>;
/** Every state an Organization is in; `deleted` keeps the record for the retention window. */
declare const ORGANIZATION_STATUSES: readonly ["active", "suspended", "deleted"];
/** The state of an Organization. */
declare const organizationStatusSchema: z9.ZodEnum<{
	active: "active";
	deleted: "deleted";
	suspended: "suspended";
}>;
/** The state of an Organization. */
type OrganizationStatus = z9.infer<typeof organizationStatusSchema>;
/** The roles that may read and record consent for the Prospects they can see. */
declare const CONSENT_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that manage wordings, forms, the Suppression list, evidence and the check log. */
declare const CONSENT_ADMIN_ROLES: readonly ["owner", "admin"];
/** The consent routes, by name. */
type ConsentRouteName = "getProspectConsent" | "listProspectConsentEvents" | "recordConsent" | "withdrawConsent" | "getProspectConsentEvidence" | "listConsentWordings" | "getConsentWording" | "createConsentWording" | "updateConsentWording" | "createConsentWordingVersion" | "listConsentForms" | "getConsentForm" | "createConsentForm" | "publishConsentForm" | "closeConsentForm" | "addSuppression" | "listSuppressionEntries" | "lookupSuppression" | "getSuppressionEntry" | "removeSuppression" | "uploadSuppressionImport" | "listSuppressionImports" | "getSuppressionImport" | "listSuppressionImportRows" | "listContactChecks" | "getHostedConsentForm" | "submitHostedConsentForm" | "previewUnsubscribe" | "oneClickUnsubscribe" | "contactCheck" | "recordWithdrawal" | "recordDeliveryFailure";
/** Who calls a route: a signed-in member, anyone holding a signed link, or another service. */
type ConsentRouteAccess = "user" | "public" | "internal";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type ConsentRoute = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** `public` routes take a signed token in the path; `internal` ones the shared secret (ADR 0013). */
	readonly access: ConsentRouteAccess;
	/** The roles allowed; empty for a public or internal route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when the route accepts an `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** The domain codes the route may return, beyond the common ones. A Contact Check denial is never one. */
	readonly errors: readonly (ConsentErrorCode | ProspectErrorCode | CommonErrorCode)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The consent routes (spec M3). Every user route may also return the common `auth.*`, `rate.limited`
* and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record
* of another Organization is always not found. A Contact Check denial is a result in a 200 body,
* never an error of a route. No route or body can switch off Contact Consent or the AI and
* recording disclosure (ADR 0003).
*/
declare const CONSENT_ROUTES: Readonly<Record<ConsentRouteName, ConsentRoute>>;
import { z as z10 } from "zod";
/** The longest reason or note on a Suppression change, in characters. */
declare const MAX_SUPPRESSION_NOTE_LENGTH = 500;
/**
* A Suppression entry as core returns it (ADR 0021): an Organization's record that an address
* must not be contacted on any channel. The address itself and its salted hash are never
* returned: `maskedAddress` is for display and is `null` for an `erased` entry, which keeps no
* data about the person. `removable` is true exactly for a `manual` entry; the others are lifted
* only by a new granted consent with new evidence. `channel` is where the request arrived (a STOP
* on SMS), `sourceRef` the message, bounce or sync it came from. A removed entry says when, by
* whom and why.
*/
declare const suppressionEntrySchema: z10.ZodObject<{
	id: z10.core.$ZodBranded<z10.ZodString, "sup", "out">;
	addressKind: z10.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>;
	maskedAddress: z10.ZodNullable<z10.ZodString>;
	reason: z10.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>;
	channel: z10.ZodNullable<z10.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	sourceRef: z10.ZodNullable<z10.ZodString>;
	addedByUserId: z10.ZodNullable<z10.core.$ZodBranded<z10.ZodString, "usr", "out">>;
	removable: z10.ZodBoolean;
	createdAt: z10.ZodISODateTime;
	removedAt: z10.ZodNullable<z10.ZodISODateTime>;
	removedByUserId: z10.ZodNullable<z10.core.$ZodBranded<z10.ZodString, "usr", "out">>;
	removalReason: z10.ZodNullable<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
}, z10.core.$strip>;
/** A Suppression entry. */
type SuppressionEntry = z10.infer<typeof suppressionEntrySchema>;
/** The path parameters of a request about one Suppression entry. */
declare const suppressionEntryParamsSchema: z10.ZodObject<{
	entryId: z10.core.$ZodBranded<z10.ZodString, "sup", "out">;
}, z10.core.$strict>;
/**
* The body of a request to add an address by hand: exactly one of `email`, `phone` or
* `linkedinUrl`, normalised by core (ADR 0011). The reason is `manual` and the actor the caller,
* both set by core. Adding an address already suppressed answers 200 with the existing entry.
*/
declare const addSuppressionRequestSchema: z10.ZodObject<{
	email: z10.ZodOptional<z10.ZodPipe<z10.ZodPipe<z10.ZodString, z10.ZodTransform<string, string>>, z10.ZodString>>;
	phone: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	linkedinUrl: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	note: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
}, z10.core.$strict>;
/** The body of a request to add an address to the Suppression list. */
type AddSuppressionRequest = z10.infer<typeof addSuppressionRequestSchema>;
/** The body of a request to remove a manual entry: the reason is recorded. */
declare const removeSuppressionRequestSchema: z10.ZodObject<{
	reason: z10.ZodPipe<z10.ZodString, z10.ZodString>;
}, z10.core.$strict>;
/** The body of a request to remove a manual entry. */
type RemoveSuppressionRequest = z10.infer<typeof removeSuppressionRequestSchema>;
/** Whether a list shows live entries or removed ones. */
declare const suppressionListStateSchema: z10.ZodEnum<{
	active: "active";
	removed: "removed";
}>;
/**
* The query parameters of a request to list the Suppression list, newest first: filters by
* reason, address kind and state (default `active`). An address is never a query parameter (query strings reach access logs): look one up with
* {@link lookupSuppressionRequestSchema}.
*/
declare const listSuppressionEntriesQuerySchema: z10.ZodObject<{
	cursor: z10.ZodOptional<z10.ZodString>;
	limit: z10.ZodDefault<z10.ZodPipe<z10.ZodPipe<z10.ZodUnion<readonly [z10.ZodNumber, z10.ZodString]>, z10.ZodTransform<number, string | number>>, z10.ZodNumber>>;
	reason: z10.ZodOptional<z10.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
	addressKind: z10.ZodOptional<z10.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>>;
	state: z10.ZodOptional<z10.ZodEnum<{
		active: "active";
		removed: "removed";
	}>>;
}, z10.core.$strict>;
/** The body of a lookup of one address on the Suppression list: exactly one address, normalised and hashed by core; there is no substring search. */
declare const lookupSuppressionRequestSchema: z10.ZodObject<{
	email: z10.ZodOptional<z10.ZodPipe<z10.ZodPipe<z10.ZodString, z10.ZodTransform<string, string>>, z10.ZodString>>;
	phone: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	linkedinUrl: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
}, z10.core.$strict>;
/** The query parameters of a request to list Suppression entries. */
type ListSuppressionEntriesQuery = z10.infer<typeof listSuppressionEntriesQuerySchema>;
/** One page of Suppression entries. */
declare const suppressionEntryPageSchema: z10.ZodObject<{
	items: z10.ZodArray<z10.ZodObject<{
		id: z10.core.$ZodBranded<z10.ZodString, "sup", "out">;
		addressKind: z10.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
		}>;
		maskedAddress: z10.ZodNullable<z10.ZodString>;
		reason: z10.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>;
		channel: z10.ZodNullable<z10.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		sourceRef: z10.ZodNullable<z10.ZodString>;
		addedByUserId: z10.ZodNullable<z10.core.$ZodBranded<z10.ZodString, "usr", "out">>;
		removable: z10.ZodBoolean;
		createdAt: z10.ZodISODateTime;
		removedAt: z10.ZodNullable<z10.ZodISODateTime>;
		removedByUserId: z10.ZodNullable<z10.core.$ZodBranded<z10.ZodString, "usr", "out">>;
		removalReason: z10.ZodNullable<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	}, z10.core.$strip>>;
	nextCursor: z10.ZodNullable<z10.ZodString>;
}, z10.core.$strip>;
/**
* Internal: the body of a STOP the channel adapter received. The Organization comes from the
* adapter's own record of the message (an internal call has no token), the address from the
* message sender. Core appends a `stop_reply` withdrawal on `channel` (or on every channel when
* `stopAll`), adds a `stop` Suppression entry and publishes the events. Idempotent on `sourceRef`.
*/
declare const recordWithdrawalRequestSchema: z10.ZodObject<{
	email: z10.ZodOptional<z10.ZodPipe<z10.ZodPipe<z10.ZodString, z10.ZodTransform<string, string>>, z10.ZodString>>;
	phone: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	linkedinUrl: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	organizationId: z10.core.$ZodBranded<z10.ZodString, "org", "out">;
	channel: z10.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	stopAll: z10.ZodDefault<z10.ZodBoolean>;
	sourceRef: z10.ZodString;
}, z10.core.$strict>;
/** Internal: the body of a STOP. */
type RecordWithdrawalRequest = z10.infer<typeof recordWithdrawalRequestSchema>;
/** Why an email address was suppressed by delivery: it bounced or the recipient complained. */
declare const DELIVERY_FAILURE_REASONS: readonly ["bounce", "complaint"];
/** Internal: the body of a bounce or complaint the email channel received; core adds the Suppression entry. Idempotent on `sourceRef`. */
declare const recordDeliveryFailureRequestSchema: z10.ZodObject<{
	organizationId: z10.core.$ZodBranded<z10.ZodString, "org", "out">;
	email: z10.ZodPipe<z10.ZodPipe<z10.ZodString, z10.ZodTransform<string, string>>, z10.ZodString>;
	reason: z10.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
	}>;
	sourceRef: z10.ZodString;
}, z10.core.$strict>;
/** Internal: the body of a bounce or complaint. */
type RecordDeliveryFailureRequest = z10.infer<typeof recordDeliveryFailureRequestSchema>;
/** Internal: what recording a STOP or a delivery failure answers: the entry (an existing one on a replay) and the Prospect if one is known. */
declare const recordedSuppressionSchema: z10.ZodObject<{
	entryId: z10.core.$ZodBranded<z10.ZodString, "sup", "out">;
	prospectId: z10.ZodNullable<z10.core.$ZodBranded<z10.ZodString, "prs", "out">>;
}, z10.core.$strip>;
/** The largest Suppression import file, in bytes (10 MB). */
declare const MAX_SUPPRESSION_IMPORT_BYTES: number;
/** The most data rows a Suppression import may hold. */
declare const MAX_SUPPRESSION_IMPORT_ROWS = 5e4;
/** The name of the one file part of the multipart upload; the request carries an `Idempotency-Key` header. */
declare const SUPPRESSION_IMPORT_FILE_FIELD = "file";
/** The one column of the CSV: an email, a phone number or a LinkedIn address per row. */
declare const SUPPRESSION_IMPORT_COLUMNS: readonly ["address"];
/** The states of a Suppression import; `completed` and `failed` are final. */
declare const SUPPRESSION_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of a Suppression import. */
declare const suppressionImportStateSchema: z10.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** Why a whole Suppression import failed after it was accepted. */
declare const SUPPRESSION_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable"];
/**
* A Suppression import: a queued job that adds every address of an uploaded CSV with the reason
* `manual`. The counts are set exactly when `completed` and add up to `totalRows`; a failed import
* carries `failureReason`. A bad row is reported, never dropped.
*/
declare const suppressionImportSchema: z10.ZodObject<{
	id: z10.core.$ZodBranded<z10.ZodString, "simp", "out">;
	state: z10.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z10.ZodNullable<z10.ZodEnum<{
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	totalRows: z10.ZodNullable<z10.ZodNumber>;
	addedRows: z10.ZodNullable<z10.ZodNumber>;
	alreadySuppressedRows: z10.ZodNullable<z10.ZodNumber>;
	invalidRows: z10.ZodNullable<z10.ZodNumber>;
	createdAt: z10.ZodISODateTime;
	completedAt: z10.ZodNullable<z10.ZodISODateTime>;
	createdByUserId: z10.core.$ZodBranded<z10.ZodString, "usr", "out">;
}, z10.core.$strip>;
/** A Suppression import. */
type SuppressionImport = z10.infer<typeof suppressionImportSchema>;
/** The path parameters of a request about one Suppression import. */
declare const suppressionImportParamsSchema: z10.ZodObject<{
	importId: z10.core.$ZodBranded<z10.ZodString, "simp", "out">;
}, z10.core.$strict>;
/** The query parameters of a request to list Suppression imports, newest first. */
declare const listSuppressionImportsQuerySchema: z10.ZodObject<{
	cursor: z10.ZodOptional<z10.ZodString>;
	limit: z10.ZodDefault<z10.ZodPipe<z10.ZodPipe<z10.ZodUnion<readonly [z10.ZodNumber, z10.ZodString]>, z10.ZodTransform<number, string | number>>, z10.ZodNumber>>;
}, z10.core.$strict>;
/** One page of Suppression imports. */
declare const suppressionImportPageSchema: z10.ZodObject<{
	items: z10.ZodArray<z10.ZodObject<{
		id: z10.core.$ZodBranded<z10.ZodString, "simp", "out">;
		state: z10.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z10.ZodNullable<z10.ZodEnum<{
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		totalRows: z10.ZodNullable<z10.ZodNumber>;
		addedRows: z10.ZodNullable<z10.ZodNumber>;
		alreadySuppressedRows: z10.ZodNullable<z10.ZodNumber>;
		invalidRows: z10.ZodNullable<z10.ZodNumber>;
		createdAt: z10.ZodISODateTime;
		completedAt: z10.ZodNullable<z10.ZodISODateTime>;
		createdByUserId: z10.core.$ZodBranded<z10.ZodString, "usr", "out">;
	}, z10.core.$strip>>;
	nextCursor: z10.ZodNullable<z10.ZodString>;
}, z10.core.$strip>;
/** The result of one row of a Suppression import. */
declare const SUPPRESSION_IMPORT_ROW_RESULTS: readonly ["added", "already_suppressed", "invalid"];
/** One row of the import report: its number and result; no cell of the file is returned. */
declare const suppressionImportRowSchema: z10.ZodObject<{
	rowNumber: z10.ZodNumber;
	result: z10.ZodEnum<{
		added: "added";
		already_suppressed: "already_suppressed";
		invalid: "invalid";
	}>;
	reason: z10.ZodNullable<z10.ZodEnum<{
		unreadable_address: "unreadable_address";
		unsupported_address: "unsupported_address";
	}>>;
}, z10.core.$strip>;
/** One row of the import report. */
type SuppressionImportRow = z10.infer<typeof suppressionImportRowSchema>;
/** The query parameters of a request to read the import report in CSV order, optionally only one result. */
declare const listSuppressionImportRowsQuerySchema: z10.ZodObject<{
	cursor: z10.ZodOptional<z10.ZodString>;
	limit: z10.ZodDefault<z10.ZodPipe<z10.ZodPipe<z10.ZodUnion<readonly [z10.ZodNumber, z10.ZodString]>, z10.ZodTransform<number, string | number>>, z10.ZodNumber>>;
	result: z10.ZodOptional<z10.ZodEnum<{
		added: "added";
		already_suppressed: "already_suppressed";
		invalid: "invalid";
	}>>;
}, z10.core.$strict>;
/** One page of import report rows. */
declare const suppressionImportRowPageSchema: z10.ZodObject<{
	items: z10.ZodArray<z10.ZodObject<{
		rowNumber: z10.ZodNumber;
		result: z10.ZodEnum<{
			added: "added";
			already_suppressed: "already_suppressed";
			invalid: "invalid";
		}>;
		reason: z10.ZodNullable<z10.ZodEnum<{
			unreadable_address: "unreadable_address";
			unsupported_address: "unsupported_address";
		}>>;
	}, z10.core.$strip>>;
	nextCursor: z10.ZodNullable<z10.ZodString>;
}, z10.core.$strip>;
import { z as z11 } from "zod";
/** The channels a Prospect can be contacted on, and a Contact Consent or Suppression can name. */
declare const CONSENT_CHANNELS: readonly ["phone", "sms", "whatsapp", "email", "linkedin"];
/** A channel a Prospect can be contacted on. */
declare const consentChannelSchema: z11.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
	sms: "sms";
	whatsapp: "whatsapp";
}>;
/** A channel a Prospect can be contacted on. */
type ConsentChannel = z11.infer<typeof consentChannelSchema>;
/**
* The channels where an Agent-initiated contact needs a granted Contact Consent (ADR 0003). Email
* needs no Suppression and an unsubscribe path instead. This is a fact of the rule, not a setting.
*/
declare const CONSENT_REQUIRED_CHANNELS: readonly ["phone", "sms", "whatsapp"];
/** Where a granted Contact Consent came from. Core sets `hosted_form` from the public route; a person records the others. */
declare const CONSENT_GRANT_SOURCES: readonly ["hosted_form", "verbal_call", "import_attestation", "crm", "manual"];
/** Where a granted Contact Consent came from. */
declare const consentGrantSourceSchema: z11.ZodEnum<{
	crm: "crm";
	hosted_form: "hosted_form";
	import_attestation: "import_attestation";
	manual: "manual";
	verbal_call: "verbal_call";
}>;
/** Where a granted Contact Consent came from. */
type ConsentGrantSource = z11.infer<typeof consentGrantSourceSchema>;
/** The sources a Rep or Admin may name when recording a grant; the hosted form is never claimed in a body. */
declare const CONSENT_RECORDABLE_SOURCES: readonly ["verbal_call", "import_attestation", "crm", "manual"];
/** Where a withdrawal came from: a one-click unsubscribe, a STOP reply, or a person or sync. */
declare const CONSENT_WITHDRAWAL_SOURCES: readonly ["unsubscribe", "stop_reply", "manual", "crm"];
/** Where a withdrawal came from. */
declare const consentWithdrawalSourceSchema: z11.ZodEnum<{
	crm: "crm";
	manual: "manual";
	stop_reply: "stop_reply";
	unsubscribe: "unsubscribe";
}>;
/** Where a withdrawal came from. */
type ConsentWithdrawalSource = z11.infer<typeof consentWithdrawalSourceSchema>;
/** Every source a ledger event can have. */
declare const consentSourceSchema: z11.ZodUnion<readonly [z11.ZodEnum<{
	crm: "crm";
	hosted_form: "hosted_form";
	import_attestation: "import_attestation";
	manual: "manual";
	verbal_call: "verbal_call";
}>, z11.ZodEnum<{
	crm: "crm";
	manual: "manual";
	stop_reply: "stop_reply";
	unsubscribe: "unsubscribe";
}>]>;
/** Every source a ledger event can have. */
type ConsentSource = z11.infer<typeof consentSourceSchema>;
/** The longest evidence reference (a form submission, a Call, an attestation note), in characters. */
declare const MAX_EVIDENCE_REF_LENGTH = 200;
/** A reference to the artefact that shows a consent: bounded text with no control character. */
declare const evidenceRefSchema: z11.ZodPipe<z11.ZodString, z11.ZodString>;
/**
* The opaque signed token of a public route (an unsubscribe link, a hosted consent form): 22 to
* 256 URL-safe characters. It names no address; core verifies its signature and expiry and
* answers `consent.invalid_token` for a tampered, expired or unknown one.
*/
declare const consentTokenSchema: z11.ZodString;
/** The purposes a Contact Check is asked for, set by the calling service and never by an outside request body. */
declare const CONTACT_PURPOSES: readonly ["agent_initiated", "rep_initiated", "reply"];
/** The purpose of a Contact Check. */
declare const contactPurposeSchema: z11.ZodEnum<{
	agent_initiated: "agent_initiated";
	rep_initiated: "rep_initiated";
	reply: "reply";
}>;
/** The purpose of a Contact Check. */
type ContactPurpose = z11.infer<typeof contactPurposeSchema>;
/** Why an address is on the Suppression list. */
declare const SUPPRESSION_REASONS: readonly ["unsubscribe", "stop", "bounce", "complaint", "manual", "crm", "erased"];
/** Why an address is on the Suppression list. */
declare const suppressionReasonSchema: z11.ZodEnum<{
	bounce: "bounce";
	complaint: "complaint";
	crm: "crm";
	erased: "erased";
	manual: "manual";
	stop: "stop";
	unsubscribe: "unsubscribe";
}>;
/** Why an address is on the Suppression list. */
type SuppressionReason = z11.infer<typeof suppressionReasonSchema>;
/** The reasons an Admin may remove an entry for, with a recorded reason; every other entry is permanent (ADR 0021). */
declare const SUPPRESSION_REMOVABLE_REASONS: readonly ["manual"];
/** The kinds of address a Suppression entry is kept for. */
declare const SUPPRESSION_ADDRESS_KINDS: readonly ["email", "phone", "linkedin"];
/** The kind of address a Suppression entry is kept for. */
declare const suppressionAddressKindSchema: z11.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
}>;
/** The kind of address a Suppression entry is kept for. */
type SuppressionAddressKind = z11.infer<typeof suppressionAddressKindSchema>;
/** A masked address for display (`a***@example.com`): 1 to 100 characters, never the whole address. */
declare const maskedAddressSchema: z11.ZodString;
/** The address fields of a request that names one address: an email, a phone or a LinkedIn address. Pair with {@link hasExactlyOneAddress}. */
declare const addressFieldsShape: {
	email: z11.ZodOptional<z11.ZodPipe<z11.ZodPipe<z11.ZodString, z11.ZodTransform<string, string>>, z11.ZodString>>;
	phone: z11.ZodOptional<z11.ZodPipe<z11.ZodString, z11.ZodString>>;
	linkedinUrl: z11.ZodOptional<z11.ZodPipe<z11.ZodString, z11.ZodString>>;
};
/** True when exactly one of the address fields is present. */
declare const hasExactlyOneAddress: (body: {
	email?: unknown;
	phone?: unknown;
	linkedinUrl?: unknown;
}) => boolean;
/** The message of a request that must name exactly one address. */
declare const ONE_ADDRESS_MESSAGE = "Give exactly one of email, phone or linkedinUrl";
import { z as z12 } from "zod";
/** The longest Consent Wording, in characters. */
declare const MAX_CONSENT_WORDING_LENGTH = 5e3;
/** The longest name of a hosted consent form, in characters. */
declare const MAX_CONSENT_FORM_NAME_LENGTH = 100;
/** Consent Wording text: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
declare const consentWordingTextSchema: z12.ZodPipe<z12.ZodString, z12.ZodString>;
/**
* A Consent Wording: the exact text a Prospect is shown when agreeing, for the `channels` it
* covers. It is immutable once any consent event or published form references it (`locked`); a
* change is a new version, which names the one it replaces as `supersedesId`. `version` starts at
* 1 and grows by one per version of the same lineage.
*/
declare const consentWordingSchema: z12.ZodObject<{
	id: z12.core.$ZodBranded<z12.ZodString, "cwd", "out">;
	version: z12.ZodNumber;
	text: z12.ZodPipe<z12.ZodString, z12.ZodString>;
	channels: z12.ZodArray<z12.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	locked: z12.ZodBoolean;
	supersedesId: z12.ZodNullable<z12.core.$ZodBranded<z12.ZodString, "cwd", "out">>;
	createdAt: z12.ZodISODateTime;
	createdByUserId: z12.core.$ZodBranded<z12.ZodString, "usr", "out">;
}, z12.core.$strip>;
/** A Consent Wording. */
type ConsentWording = z12.infer<typeof consentWordingSchema>;
/** The path parameters of a request about one wording. */
declare const consentWordingParamsSchema: z12.ZodObject<{
	wordingId: z12.core.$ZodBranded<z12.ZodString, "cwd", "out">;
}, z12.core.$strict>;
/** The body of a request to write a Consent Wording (version 1) or the next version of one. Lawyer-reviewed text is the Organization's to supply. */
declare const createConsentWordingRequestSchema: z12.ZodObject<{
	text: z12.ZodPipe<z12.ZodString, z12.ZodString>;
	channels: z12.ZodArray<z12.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z12.core.$strict>;
/** The body of a request to write a Consent Wording. */
type CreateConsentWordingRequest = z12.infer<typeof createConsentWordingRequestSchema>;
/** The body of a request to edit a wording that is not yet locked; a locked one is `consent.wording_locked`. At least one field. */
declare const updateConsentWordingRequestSchema: z12.ZodObject<{
	text: z12.ZodOptional<z12.ZodPipe<z12.ZodString, z12.ZodString>>;
	channels: z12.ZodOptional<z12.ZodArray<z12.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>>;
}, z12.core.$strict>;
/** The body of a request to edit a wording. */
type UpdateConsentWordingRequest = z12.infer<typeof updateConsentWordingRequestSchema>;
/** The query parameters of a request to list wordings, newest first. */
declare const listConsentWordingsQuerySchema: z12.ZodObject<{
	cursor: z12.ZodOptional<z12.ZodString>;
	limit: z12.ZodDefault<z12.ZodPipe<z12.ZodPipe<z12.ZodUnion<readonly [z12.ZodNumber, z12.ZodString]>, z12.ZodTransform<number, string | number>>, z12.ZodNumber>>;
}, z12.core.$strict>;
/** One page of wordings. */
declare const consentWordingPageSchema: z12.ZodObject<{
	items: z12.ZodArray<z12.ZodObject<{
		id: z12.core.$ZodBranded<z12.ZodString, "cwd", "out">;
		version: z12.ZodNumber;
		text: z12.ZodPipe<z12.ZodString, z12.ZodString>;
		channels: z12.ZodArray<z12.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		locked: z12.ZodBoolean;
		supersedesId: z12.ZodNullable<z12.core.$ZodBranded<z12.ZodString, "cwd", "out">>;
		createdAt: z12.ZodISODateTime;
		createdByUserId: z12.core.$ZodBranded<z12.ZodString, "usr", "out">;
	}, z12.core.$strip>>;
	nextCursor: z12.ZodNullable<z12.ZodString>;
}, z12.core.$strip>;
/** The states of a hosted consent form; publishing locks its wording and closing stops submissions. */
declare const CONSENT_FORM_STATES: readonly ["draft", "published", "closed"];
/** The state of a hosted consent form. */
declare const consentFormStateSchema: z12.ZodEnum<{
	closed: "closed";
	draft: "draft";
	published: "published";
}>;
/** The state of a hosted consent form. */
type ConsentFormState = z12.infer<typeof consentFormStateSchema>;
/**
* A hosted consent form: a wording and the `channels` it offers, each with its own unticked
* choice. `publishedAt` is set exactly once published (a closed form keeps it). `token` goes in the
* hosted page's URL and is the only credential of the public routes, so core returns it to Owner
* and Admin only and it is `null` for a Manager or Rep, and for a draft.
*/
declare const consentFormSchema: z12.ZodObject<{
	id: z12.core.$ZodBranded<z12.ZodString, "cfm", "out">;
	wordingId: z12.core.$ZodBranded<z12.ZodString, "cwd", "out">;
	name: z12.ZodPipe<z12.ZodString, z12.ZodString>;
	channels: z12.ZodArray<z12.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	state: z12.ZodEnum<{
		closed: "closed";
		draft: "draft";
		published: "published";
	}>;
	token: z12.ZodNullable<z12.ZodString>;
	createdAt: z12.ZodISODateTime;
	createdByUserId: z12.core.$ZodBranded<z12.ZodString, "usr", "out">;
	publishedAt: z12.ZodNullable<z12.ZodISODateTime>;
	closedAt: z12.ZodNullable<z12.ZodISODateTime>;
}, z12.core.$strip>;
/** A hosted consent form. */
type ConsentForm = z12.infer<typeof consentFormSchema>;
/** The path parameters of a request about one form. */
declare const consentFormParamsSchema: z12.ZodObject<{
	formId: z12.core.$ZodBranded<z12.ZodString, "cfm", "out">;
}, z12.core.$strict>;
/** The body of a request to create a form (a draft) from a wording; the channels must be among the wording's. */
declare const createConsentFormRequestSchema: z12.ZodObject<{
	wordingId: z12.core.$ZodBranded<z12.ZodString, "cwd", "out">;
	name: z12.ZodPipe<z12.ZodString, z12.ZodString>;
	channels: z12.ZodArray<z12.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z12.core.$strict>;
/** The body of a request to create a form. */
type CreateConsentFormRequest = z12.infer<typeof createConsentFormRequestSchema>;
/** The query parameters of a request to list forms, newest first, optionally one state. */
declare const listConsentFormsQuerySchema: z12.ZodObject<{
	cursor: z12.ZodOptional<z12.ZodString>;
	limit: z12.ZodDefault<z12.ZodPipe<z12.ZodPipe<z12.ZodUnion<readonly [z12.ZodNumber, z12.ZodString]>, z12.ZodTransform<number, string | number>>, z12.ZodNumber>>;
	state: z12.ZodOptional<z12.ZodEnum<{
		closed: "closed";
		draft: "draft";
		published: "published";
	}>>;
}, z12.core.$strict>;
/** One page of forms. */
declare const consentFormPageSchema: z12.ZodObject<{
	items: z12.ZodArray<z12.ZodObject<{
		id: z12.core.$ZodBranded<z12.ZodString, "cfm", "out">;
		wordingId: z12.core.$ZodBranded<z12.ZodString, "cwd", "out">;
		name: z12.ZodPipe<z12.ZodString, z12.ZodString>;
		channels: z12.ZodArray<z12.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		state: z12.ZodEnum<{
			closed: "closed";
			draft: "draft";
			published: "published";
		}>;
		token: z12.ZodNullable<z12.ZodString>;
		createdAt: z12.ZodISODateTime;
		createdByUserId: z12.core.$ZodBranded<z12.ZodString, "usr", "out">;
		publishedAt: z12.ZodNullable<z12.ZodISODateTime>;
		closedAt: z12.ZodNullable<z12.ZodISODateTime>;
	}, z12.core.$strip>>;
	nextCursor: z12.ZodNullable<z12.ZodString>;
}, z12.core.$strip>;
import { z as z13 } from "zod";
/** The internal calls, by name. */
type InternalCallName = "createOrganization" | "acceptInvitation" | "membership" | "updateMemberProfile" | "abandonOrganization";
/**
* The complete list of domain error codes each internal call may return, for core's tests to
* assert against. Common codes (`auth.*`, `request.*`, `server.*`) can come from any call and are
* not listed. Accepting an Invitation never returns an Organization status code, so a suspended or
* deleted Organization is indistinguishable from an unknown token. The membership lookup returns
* no domain error: it answers `found: false`. A profile change for a user with no membership is
* `member.not_found`, which the caller treats as nothing to do. Abandoning an Organization returns
* only `organization.not_abandonable`, for a live Organization that fails the guard; it has no
* not-found code (see `internalAbandonOrganizationRequestSchema`).
*/
declare const INTERNAL_CALL_ERRORS: Readonly<Record<InternalCallName, readonly CoreErrorCode[]>>;
/**
* Internal: `POST /internal/organizations`, the body of a sign-up that creates an Organization;
* the user becomes its Owner. `email` and `name` are the person's, copied onto the Membership for
* the member list (the auth service holds them; see `memberSchema`): `name` is the display name
* auth composes from the first and last names, or `null` when the person gave neither. Both are
* optional only so a `0.5.0` caller, which sends neither, still parses and core can deploy before
* auth sends them; each becomes required once auth sends them. Core returns only
* `membership.already_member`.
*/
declare const internalCreateOrganizationRequestSchema: z13.ZodObject<{
	userId: z13.core.$ZodBranded<z13.ZodString, "usr", "out">;
	organizationName: z13.ZodPipe<z13.ZodString, z13.ZodString>;
	email: z13.ZodOptional<z13.ZodPipe<z13.ZodPipe<z13.ZodString, z13.ZodTransform<string, string>>, z13.ZodString>>;
	name: z13.ZodOptional<z13.ZodNullable<z13.ZodPipe<z13.ZodString, z13.ZodString>>>;
}, z13.core.$strict>;
/** Internal: the body of a sign-up that creates an Organization. */
type InternalCreateOrganizationRequest = z13.infer<typeof internalCreateOrganizationRequestSchema>;
/** Internal: the answer to creating an Organization at sign-up; the role is always `owner`. */
declare const internalCreateOrganizationResponseSchema: z13.ZodObject<{
	organizationId: z13.core.$ZodBranded<z13.ZodString, "org", "out">;
	role: z13.ZodLiteral<"owner">;
}, z13.core.$strip>;
/** Internal: the answer to creating an Organization at sign-up. */
type InternalCreateOrganizationResponse = z13.infer<typeof internalCreateOrganizationResponseSchema>;
/**
* Internal: `POST /internal/invitations/accept`, the body of a sign-up that accepts an Invitation
* with its raw token and the verified address. `name` is the person's display name as auth
* composes it, or `null` when the person gave none; the address is copied onto the Membership
* too. `name` is optional only so a `0.5.0` caller, which sends none, still parses and core can
* deploy before auth sends it; it becomes required once auth sends it. Core compares the address,
* folded, with the Invitation's and answers `invitation.invalid` on a mismatch, like an unknown,
* used, revoked or expired token. Core returns only `invitation.invalid` or
* `membership.already_member`, never an Organization status.
*/
declare const internalAcceptInvitationRequestSchema: z13.ZodObject<{
	userId: z13.core.$ZodBranded<z13.ZodString, "usr", "out">;
	email: z13.ZodPipe<z13.ZodPipe<z13.ZodString, z13.ZodTransform<string, string>>, z13.ZodString>;
	name: z13.ZodOptional<z13.ZodNullable<z13.ZodPipe<z13.ZodString, z13.ZodString>>>;
	invitationToken: z13.ZodString;
}, z13.core.$strict>;
/** Internal: the body of a sign-up that accepts an Invitation. */
type InternalAcceptInvitationRequest = z13.infer<typeof internalAcceptInvitationRequestSchema>;
/** Internal: the answer to accepting an Invitation; the role is the one offered, never `owner`. */
declare const internalAcceptInvitationResponseSchema: z13.ZodObject<{
	organizationId: z13.core.$ZodBranded<z13.ZodString, "org", "out">;
	role: z13.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
}, z13.core.$strip>;
/** Internal: the answer to accepting an Invitation. */
type InternalAcceptInvitationResponse = z13.infer<typeof internalAcceptInvitationResponseSchema>;
/** Internal: the request for the membership of one user, which the token hook makes before issuing a token. */
declare const internalMembershipRequestSchema: z13.ZodObject<{
	userId: z13.core.$ZodBranded<z13.ZodString, "usr", "out">;
}, z13.core.$strict>;
/** Internal: the request for the membership of one user. */
type InternalMembershipRequest = z13.infer<typeof internalMembershipRequestSchema>;
/**
* Internal: the membership of a user, or `{ found: false }` for a user with none. A user with an
* Organization that is suspended or deleted is found: the token hook decides what to do with the
* status. The lookup returns no domain error.
*/
declare const internalMembershipResponseSchema: z13.ZodDiscriminatedUnion<[z13.ZodObject<{
	found: z13.ZodLiteral<true>;
	organizationId: z13.core.$ZodBranded<z13.ZodString, "org", "out">;
	role: z13.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	organizationStatus: z13.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
}, z13.core.$strip>, z13.ZodObject<{
	found: z13.ZodLiteral<false>;
}, z13.core.$strip>], "found">;
/** Internal: the membership of a user, or none. */
type InternalMembershipResponse = z13.infer<typeof internalMembershipResponseSchema>;
/** Internal: the path parameters of a profile change; the user is in the path, not the body. */
declare const internalUpdateMemberProfileParamsSchema: z13.ZodObject<{
	userId: z13.core.$ZodBranded<z13.ZodString, "usr", "out">;
}, z13.core.$strict>;
/** Internal: the path parameters of a profile change. */
type InternalUpdateMemberProfileParams = z13.infer<typeof internalUpdateMemberProfileParamsSchema>;
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
declare const internalUpdateMemberProfileRequestSchema: z13.ZodObject<{
	email: z13.ZodOptional<z13.ZodPipe<z13.ZodPipe<z13.ZodString, z13.ZodTransform<string, string>>, z13.ZodString>>;
	name: z13.ZodOptional<z13.ZodNullable<z13.ZodPipe<z13.ZodString, z13.ZodString>>>;
}, z13.core.$strict>;
/** Internal: the body of a profile change. */
type InternalUpdateMemberProfileRequest = z13.infer<typeof internalUpdateMemberProfileRequestSchema>;
/** Internal: the answer to a profile change: the address and name core now holds for the user. */
declare const internalUpdateMemberProfileResponseSchema: z13.ZodObject<{
	userId: z13.core.$ZodBranded<z13.ZodString, "usr", "out">;
	email: z13.ZodPipe<z13.ZodPipe<z13.ZodString, z13.ZodTransform<string, string>>, z13.ZodString>;
	name: z13.ZodNullable<z13.ZodString>;
}, z13.core.$strip>;
/** Internal: the answer to a profile change. */
type InternalUpdateMemberProfileResponse = z13.infer<typeof internalUpdateMemberProfileResponseSchema>;
/** The hours after creation during which an Organization can be abandoned. */
declare const ABANDON_MAX_AGE_HOURS = 24;
/** Internal: the path parameters of an abandon; the Organization is named in the path. */
declare const internalAbandonOrganizationParamsSchema: z13.ZodObject<{
	organizationId: z13.core.$ZodBranded<z13.ZodString, "org", "out">;
}, z13.core.$strict>;
/** Internal: the path parameters of an abandon. */
type InternalAbandonOrganizationParams = z13.infer<typeof internalAbandonOrganizationParamsSchema>;
/**
* Internal: `POST /internal/organizations/{organizationId}/abandon`, the body of the call auth
* makes when the account write fails after core created the Organization, and from its sweep of
* abandoned sign-ups. It carries an `Idempotency-Key` header.
*
* The call is defined by its end state. It answers success,
* `{ organizationId, status: 'deleted' }`, whenever no live Organization with that id exists when
* the call returns: abandoned by this call, abandoned or deleted earlier by anyone, or never
* created. A repeat with the same key, a new key or a different `userId` after the Organization
* is gone all answer success, so the caller must not read success as "this call deleted it". Only
* a live Organization that fails the guard answers `organization.not_abandonable`: it has another
* member, its one member is not `userId`, or it was created `ABANDON_MAX_AGE_HOURS` hours ago or
* more. Otherwise core marks the Organization `deleted` and frees the user id.
* Success means no live Organization remains, not that the user id is free yet: an Organization
* deleted earlier may still hold its members until the deletion job empties it, so auth must not
* depend on the id being free immediately.
*
* The holder of the internal token can tell a live Organization id from any other id (409 against
* 200); the single refusal code hides only which guard condition failed. Needing the Organization
* id and the user id together means a guess cannot abandon an Organization, not that an id cannot
* be probed.
*/
declare const internalAbandonOrganizationRequestSchema: z13.ZodObject<{
	userId: z13.core.$ZodBranded<z13.ZodString, "usr", "out">;
}, z13.core.$strict>;
/** Internal: the body of an abandon. */
type InternalAbandonOrganizationRequest = z13.infer<typeof internalAbandonOrganizationRequestSchema>;
/**
* Internal: the answer to an abandon: always `deleted`, whether this call, an earlier one or
* nobody ever created the Organization. A retry cannot be told from the original.
*/
declare const internalAbandonOrganizationResponseSchema: z13.ZodObject<{
	organizationId: z13.core.$ZodBranded<z13.ZodString, "org", "out">;
	status: z13.ZodLiteral<"deleted">;
}, z13.core.$strip>;
/** Internal: the answer to an abandon. */
type InternalAbandonOrganizationResponse = z13.infer<typeof internalAbandonOrganizationResponseSchema>;
import { z as z14 } from "zod";
/**
* An Invitation as core returns it. The raw token is not here and never will be: it is delivered
* by email only, so a response cannot leak it.
*/
declare const invitationSchema: z14.ZodObject<{
	id: z14.core.$ZodBranded<z14.ZodString, "inv", "out">;
	email: z14.ZodPipe<z14.ZodPipe<z14.ZodString, z14.ZodTransform<string, string>>, z14.ZodString>;
	role: z14.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z14.ZodNullable<z14.core.$ZodBranded<z14.ZodString, "team", "out">>;
	state: z14.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>;
	invitedByUserId: z14.core.$ZodBranded<z14.ZodString, "usr", "out">;
	expiresAt: z14.ZodISODateTime;
	createdAt: z14.ZodISODateTime;
}, z14.core.$strip>;
/** An Invitation as core returns it. */
type Invitation = z14.infer<typeof invitationSchema>;
/**
* The body of a request to invite someone: an address and a role that is never `owner`. The call
* accepts an `Idempotency-Key` header (`idempotencyKeySchema`): a replay returns the original
* Invitation instead of `invitation.already_pending`, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`.
*/
declare const createInvitationRequestSchema: z14.ZodObject<{
	email: z14.ZodPipe<z14.ZodPipe<z14.ZodString, z14.ZodTransform<string, string>>, z14.ZodString>;
	role: z14.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z14.ZodOptional<z14.core.$ZodBranded<z14.ZodString, "team", "out">>;
}, z14.core.$strict>;
/**
* Every error code `POST /v1/invitations` may answer with. `invitation.already_pending` and
* `invitation.already_member` (409) are about the address; `invitation.pending_limit` (409, 1,000
* pending) and `invitation.daily_limit` (429, 2,000 in 24 hours, with `details.retryAfter` and a
* `Retry-After` header) are the Organization-wide limits; `rate.limited` is only the per-request
* rate. `team.not_found` is a `teamId` that is not a Team of this Organization.
*/
declare const CREATE_INVITATION_ERROR_CODES: readonly ["invitation.already_pending", "invitation.already_member", "invitation.pending_limit", "invitation.daily_limit", "team.not_found", "request.invalid", "request.idempotency_key_reused", "request.idempotency_in_progress", "auth.unauthenticated", "auth.token_expired", "auth.token_invalid", "auth.forbidden", "auth.unavailable", "organization.suspended", "organization.deleted", "rate.limited"];
/** The body of a request to invite someone. */
type CreateInvitationRequest = z14.infer<typeof createInvitationRequestSchema>;
/**
* The query parameters of a request to list Invitations: a page, and the `state` to list, which
* is `pending` unless asked otherwise. An unknown parameter is rejected.
*/
declare const listInvitationsQuerySchema: z14.ZodObject<{
	cursor: z14.ZodOptional<z14.ZodString>;
	limit: z14.ZodDefault<z14.ZodPipe<z14.ZodPipe<z14.ZodUnion<readonly [z14.ZodNumber, z14.ZodString]>, z14.ZodTransform<number, string | number>>, z14.ZodNumber>>;
	state: z14.ZodDefault<z14.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>>;
}, z14.core.$strict>;
/** The query parameters of a request to list Invitations. */
type ListInvitationsQuery = z14.infer<typeof listInvitationsQuerySchema>;
/** One page of Invitations. */
declare const listInvitationsResponseSchema: z14.ZodObject<{
	items: z14.ZodArray<z14.ZodObject<{
		id: z14.core.$ZodBranded<z14.ZodString, "inv", "out">;
		email: z14.ZodPipe<z14.ZodPipe<z14.ZodString, z14.ZodTransform<string, string>>, z14.ZodString>;
		role: z14.ZodEnum<{
			admin: "admin";
			manager: "manager";
			rep: "rep";
		}>;
		teamId: z14.ZodNullable<z14.core.$ZodBranded<z14.ZodString, "team", "out">>;
		state: z14.ZodEnum<{
			accepted: "accepted";
			pending: "pending";
			revoked: "revoked";
		}>;
		invitedByUserId: z14.core.$ZodBranded<z14.ZodString, "usr", "out">;
		expiresAt: z14.ZodISODateTime;
		createdAt: z14.ZodISODateTime;
	}, z14.core.$strip>>;
	nextCursor: z14.ZodNullable<z14.ZodString>;
}, z14.core.$strip>;
/** One page of Invitations. */
type ListInvitationsResponse = z14.infer<typeof listInvitationsResponseSchema>;
/** The path parameters of a request about one Invitation, such as revoking it. */
declare const invitationParamsSchema: z14.ZodObject<{
	invitationId: z14.core.$ZodBranded<z14.ZodString, "inv", "out">;
}, z14.core.$strict>;
/** The path parameters of a request about one Invitation. */
type InvitationParams = z14.infer<typeof invitationParamsSchema>;
import { z as z15 } from "zod";
/**
* A member of the caller's Organization: a user's Membership and the role it holds. `email` and
* `name` are core's copy of what the auth service holds for the person: given at sign-up and kept
* current by the internal profile change. `name` is the display name auth composes from the first
* and last names, and is `null` when the person gave neither at sign-up (both are optional
* there). Neither is a search key or a filter in this version.
*/
declare const memberSchema: z15.ZodObject<{
	id: z15.core.$ZodBranded<z15.ZodString, "mem", "out">;
	userId: z15.core.$ZodBranded<z15.ZodString, "usr", "out">;
	email: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	name: z15.ZodNullable<z15.ZodString>;
	role: z15.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	createdAt: z15.ZodISODateTime;
	updatedAt: z15.ZodISODateTime;
}, z15.core.$strip>;
/** A member of an Organization. */
type Member = z15.infer<typeof memberSchema>;
/**
* The least privileged role that may list the Organization's members (`GET /v1/members`): Owner,
* Admin and Manager (see `roleAtLeast`). Anyone who sees member emails needs at least this role.
*/
declare const LIST_MEMBERS_MIN_ROLE: "manager";
/** The query parameters of a request to list members: a cursor and a limit of at most the maximum page size. */
declare const listMembersQuerySchema: z15.ZodObject<{
	cursor: z15.ZodOptional<z15.ZodString>;
	limit: z15.ZodDefault<z15.ZodPipe<z15.ZodPipe<z15.ZodUnion<readonly [z15.ZodNumber, z15.ZodString]>, z15.ZodTransform<number, string | number>>, z15.ZodNumber>>;
}, z15.core.$strict>;
/** The query parameters of a request to list members. */
type ListMembersQuery = z15.infer<typeof listMembersQuerySchema>;
/** One page of members. */
declare const listMembersResponseSchema: z15.ZodObject<{
	items: z15.ZodArray<z15.ZodObject<{
		id: z15.core.$ZodBranded<z15.ZodString, "mem", "out">;
		userId: z15.core.$ZodBranded<z15.ZodString, "usr", "out">;
		email: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
		name: z15.ZodNullable<z15.ZodString>;
		role: z15.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z15.ZodISODateTime;
		updatedAt: z15.ZodISODateTime;
	}, z15.core.$strip>>;
	nextCursor: z15.ZodNullable<z15.ZodString>;
}, z15.core.$strip>;
/** One page of members. */
type ListMembersResponse = z15.infer<typeof listMembersResponseSchema>;
/** The path parameters of a request about one member. */
declare const memberParamsSchema: z15.ZodObject<{
	membershipId: z15.core.$ZodBranded<z15.ZodString, "mem", "out">;
}, z15.core.$strict>;
/** The path parameters of a request about one member. */
type MemberParams = z15.infer<typeof memberParamsSchema>;
/** The body of a request to change a member's role; promoting to `owner` is how ownership passes. */
declare const changeMemberRoleRequestSchema: z15.ZodObject<{
	role: z15.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
}, z15.core.$strict>;
/** The body of a request to change a member's role. */
type ChangeMemberRoleRequest = z15.infer<typeof changeMemberRoleRequestSchema>;
import { z as z16 } from "zod";
/** An Organization as core returns it, for both reading it and renaming it. */
declare const organizationSchema: z16.ZodObject<{
	id: z16.core.$ZodBranded<z16.ZodString, "org", "out">;
	name: z16.ZodString;
	region: z16.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	status: z16.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
	createdAt: z16.ZodISODateTime;
	updatedAt: z16.ZodISODateTime;
}, z16.core.$strip>;
/** An Organization as core returns it. */
type Organization = z16.infer<typeof organizationSchema>;
/** The body of a request to rename the caller's Organization. */
declare const renameOrganizationRequestSchema: z16.ZodObject<{
	name: z16.ZodPipe<z16.ZodString, z16.ZodString>;
}, z16.core.$strict>;
/** The body of a request to rename the caller's Organization. */
type RenameOrganizationRequest = z16.infer<typeof renameOrganizationRequestSchema>;
import { z as z17 } from "zod";
/** A Team as core returns it. */
declare const teamSchema: z17.ZodObject<{
	id: z17.core.$ZodBranded<z17.ZodString, "team", "out">;
	name: z17.ZodString;
	createdAt: z17.ZodISODateTime;
	updatedAt: z17.ZodISODateTime;
}, z17.core.$strip>;
/** A Team as core returns it. */
type Team = z17.infer<typeof teamSchema>;
/**
* The body of a request to create a Team. The call accepts an `Idempotency-Key` header
* (`idempotencyKeySchema`): a replay returns the original Team, the same key with a different
* body is `request.idempotency_key_reused`, and the same key while the first request is still
* running is `request.idempotency_in_progress`.
*/
declare const createTeamRequestSchema: z17.ZodObject<{
	name: z17.ZodPipe<z17.ZodString, z17.ZodString>;
}, z17.core.$strict>;
/** The body of a request to create a Team. */
type CreateTeamRequest = z17.infer<typeof createTeamRequestSchema>;
/** The body of a request to rename a Team. */
declare const renameTeamRequestSchema: z17.ZodObject<{
	name: z17.ZodPipe<z17.ZodString, z17.ZodString>;
}, z17.core.$strict>;
/** The body of a request to rename a Team. */
type RenameTeamRequest = z17.infer<typeof renameTeamRequestSchema>;
/** The query parameters of a request to list Teams. */
declare const listTeamsQuerySchema: z17.ZodObject<{
	cursor: z17.ZodOptional<z17.ZodString>;
	limit: z17.ZodDefault<z17.ZodPipe<z17.ZodPipe<z17.ZodUnion<readonly [z17.ZodNumber, z17.ZodString]>, z17.ZodTransform<number, string | number>>, z17.ZodNumber>>;
}, z17.core.$strict>;
/** The query parameters of a request to list Teams. */
type ListTeamsQuery = z17.infer<typeof listTeamsQuerySchema>;
/** One page of Teams. */
declare const listTeamsResponseSchema: z17.ZodObject<{
	items: z17.ZodArray<z17.ZodObject<{
		id: z17.core.$ZodBranded<z17.ZodString, "team", "out">;
		name: z17.ZodString;
		createdAt: z17.ZodISODateTime;
		updatedAt: z17.ZodISODateTime;
	}, z17.core.$strip>>;
	nextCursor: z17.ZodNullable<z17.ZodString>;
}, z17.core.$strip>;
/** One page of Teams. */
type ListTeamsResponse = z17.infer<typeof listTeamsResponseSchema>;
/** The path parameters of a request about one Team, such as renaming or deleting it. */
declare const teamParamsSchema: z17.ZodObject<{
	teamId: z17.core.$ZodBranded<z17.ZodString, "team", "out">;
}, z17.core.$strict>;
/** The path parameters of a request about one Team. */
type TeamParams = z17.infer<typeof teamParamsSchema>;
/** The body of a request to add a member to a Team. */
declare const addTeamMemberRequestSchema: z17.ZodObject<{
	membershipId: z17.core.$ZodBranded<z17.ZodString, "mem", "out">;
}, z17.core.$strict>;
/** The body of a request to add a member to a Team. */
type AddTeamMemberRequest = z17.infer<typeof addTeamMemberRequestSchema>;
/** A member's place in a Team, as core returns it after adding one. */
declare const teamMemberSchema: z17.ZodObject<{
	teamId: z17.core.$ZodBranded<z17.ZodString, "team", "out">;
	membershipId: z17.core.$ZodBranded<z17.ZodString, "mem", "out">;
	createdAt: z17.ZodISODateTime;
}, z17.core.$strip>;
/** A member's place in a Team. */
type TeamMember = z17.infer<typeof teamMemberSchema>;
/** The path parameters of a request to remove a member from a Team. */
declare const teamMemberParamsSchema: z17.ZodObject<{
	teamId: z17.core.$ZodBranded<z17.ZodString, "team", "out">;
	membershipId: z17.core.$ZodBranded<z17.ZodString, "mem", "out">;
}, z17.core.$strict>;
/** The path parameters of a request to remove a member from a Team. */
type TeamMemberParams = z17.infer<typeof teamMemberParamsSchema>;
/** The query parameters of a request to list a Team's members: a cursor and a limit of at most the maximum page size. */
declare const listTeamMembersQuerySchema: z17.ZodObject<{
	cursor: z17.ZodOptional<z17.ZodString>;
	limit: z17.ZodDefault<z17.ZodPipe<z17.ZodPipe<z17.ZodUnion<readonly [z17.ZodNumber, z17.ZodString]>, z17.ZodTransform<number, string | number>>, z17.ZodNumber>>;
}, z17.core.$strict>;
/** The query parameters of a request to list a Team's members. */
type ListTeamMembersQuery = z17.infer<typeof listTeamMembersQuerySchema>;
/**
* One page of a Team's members, for `GET /v1/teams/{teamId}/members` (path parameters
* `teamParamsSchema`). Each item is a member exactly as the Organization's members list returns it.
*/
declare const listTeamMembersResponseSchema: z17.ZodObject<{
	items: z17.ZodArray<z17.ZodObject<{
		id: z17.core.$ZodBranded<z17.ZodString, "mem", "out">;
		userId: z17.core.$ZodBranded<z17.ZodString, "usr", "out">;
		email: z17.ZodPipe<z17.ZodPipe<z17.ZodString, z17.ZodTransform<string, string>>, z17.ZodString>;
		name: z17.ZodNullable<z17.ZodString>;
		role: z17.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z17.ZodISODateTime;
		updatedAt: z17.ZodISODateTime;
	}, z17.core.$strip>>;
	nextCursor: z17.ZodNullable<z17.ZodString>;
}, z17.core.$strip>;
/** One page of a Team's members. */
type ListTeamMembersResponse = z17.infer<typeof listTeamMembersResponseSchema>;
/**
* The least privileged role that may list a Team's members: exactly `LIST_MEMBERS_MIN_ROLE`, the
* role that lists the Organization's members, because each item carries the member's email and
* name. It is not loosened to the roles that may only view a Team.
*/
declare const LIST_TEAM_MEMBERS_MIN_ROLE: "manager";
/**
* Every error code `GET /v1/teams/{teamId}/members` may answer with. Who may call it is
* `LIST_TEAM_MEMBERS_MIN_ROLE`; a role that is not allowed is `auth.forbidden`. A Team in another
* Organization is `team.not_found`.
*/
declare const LIST_TEAM_MEMBERS_ERROR_CODES: readonly ["team.not_found", "request.invalid", "auth.unauthenticated", "auth.token_expired", "auth.token_invalid", "auth.forbidden", "auth.unavailable", "organization.suspended", "organization.deleted", "rate.limited"];
import { z as z18 } from "zod";
/** The longest Organization or Team name, in characters; the same bound as the database check. */
declare const MAX_NAME_LENGTH = 200;
/**
* An Organization's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no
* lone surrogate) and no control characters. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const organizationNameSchema: z18.ZodPipe<z18.ZodString, z18.ZodString>;
/**
* A Team's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no lone
* surrogate) and no control characters. Zero-width and direction-override characters are allowed,
* so display code must treat a name as untrusted text.
*/
declare const teamNameSchema: z18.ZodPipe<z18.ZodString, z18.ZodString>;
/**
* The longest name of a person in a request, in characters: a first and a last name of 100 each
* and the space between. The database column for a member's name must allow at least this many
* characters after trimming, which is more than the 200 of Organization and Team names.
*/
declare const MAX_PERSON_NAME_LENGTH = 201;
/**
* A person's display name in a request, as auth composes it from the first and last names it
* holds (each at most 100 characters, joined by one space): trimmed, then 1 to 201 characters,
* well-formed UTF-16 and no control characters. A person with no name is `null` where the
* request allows it, never an empty string. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const personNameSchema: z18.ZodPipe<z18.ZodString, z18.ZodString>;
/**
* A name as a response carries it: any 1 to 1000 character string. The database bounds the length
* of the name after trimming spaces, so a stored name may carry surrounding spaces and run past
* 200; the response form is loose enough for anything the database allows. Core writes only the
* trimmed output of the request schemas. Display code must treat a name as untrusted text.
*/
declare const storedNameSchema: z18.ZodString;
/** The states an Invitation is in; "expired" is not a state, it is read from `expiresAt`. */
declare const INVITATION_STATES: readonly ["pending", "accepted", "revoked"];
/** The state of an Invitation. */
declare const invitationStateSchema: z18.ZodEnum<{
	accepted: "accepted";
	pending: "pending";
	revoked: "revoked";
}>;
/** The state of an Invitation. */
type InvitationState = z18.infer<typeof invitationStateSchema>;
/** A point in time as an ISO 8601 string with an offset, as every response carries it. */
declare const timestampSchema: z18.ZodISODateTime;
/**
* The raw token of an Invitation: 22 to 256 URL-safe characters (128 bits or more). It exists in
* the email sent to the invitee and in the sign-up call to core, never in a response.
*/
declare const invitationTokenSchema: z18.ZodString;
/**
* The `details` of an error answered with a `Retry-After` header: how many whole seconds to wait,
* the same number as the header. Used by `invitation.daily_limit`.
*/
declare const retryAfterDetailsSchema: z18.ZodObject<{
	retryAfter: z18.ZodNumber;
}, z18.core.$strict>;
/** The `details` of an error answered with a `Retry-After` header. */
type RetryAfterDetails = z18.infer<typeof retryAfterDetailsSchema>;
/**
* The header that carries an idempotency key on a call that has effects. Every public POST accepts
* it too: a replay returns the original result, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`, answered with `details.retryAfter` in seconds and a
* `Retry-After` header, as a rate-limited call is.
*/
declare const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
/** The value of the {@link IDEMPOTENCY_KEY_HEADER} header: 16 to 128 characters from `A-Za-z0-9_.:-`, such as a UUID. */
declare const idempotencyKeySchema: z18.ZodString;
/** An idempotency key. */
type IdempotencyKey = z18.infer<typeof idempotencyKeySchema>;
import { z as z19 } from "zod";
/** The longest email address stored, in characters; the same bound as the database check. */
declare const MAX_EMAIL_LENGTH = 320;
/**
* Lower-cases the ASCII letters A to Z and nothing else, so the result does not depend on the
* locale. `toLowerCase()` is wrong here: it also folds letters such as `É`, and the database does
* not. Use this wherever an email or a Team name is compared or stored.
*/
declare function foldAscii(text: string): string;
/**
* An email address, folded to lower case (ASCII letters only) and checked with the rule the
* database enforces: 3 to 320 characters, exactly one `@` that is neither first nor last, and
* every character printable ASCII (`!` to `~`), so whitespace, control characters, zero-width and
* no-break spaces, bidirectional overrides and a fullwidth `@` are all refused. An
* internationalised domain is stored in its ASCII (A-label, punycode) form: the service converts
* it before validating, and this schema does not convert. It is a backstop, not an address
* parser; a verified address comes from the auth service.
*/
declare const emailSchema: z19.ZodPipe<z19.ZodPipe<z19.ZodString, z19.ZodTransform<string, string>>, z19.ZodString>;
/** An email address, folded to lower case. */
type Email = z19.output<typeof emailSchema>;
import { z as z20 } from "zod";
/** An event type in `area.event_name` form, such as `team.created`. */
declare const eventTypeSchema: z20.ZodString;
/** An event type. */
type EventType = z20.infer<typeof eventTypeSchema>;
/** The envelope every event shares, wrapping a payload validated by `dataSchema`. */
declare function eventEnvelopeSchema<D extends z20.ZodType>(dataSchema: D): z20.ZodObject<{
	id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
	type: z20.ZodString;
	version: z20.ZodNumber;
	occurredAt: z20.ZodISODateTime;
	organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
	region: z20.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	data: D;
}, z20.core.$strip>;
/** Declares one event type at one version; its schema accepts only that type and version. */
declare function defineEvent<
	const T extends string,
	const V extends number,
	D extends z20.ZodType
>(type: T, version: V, dataSchema: D): {
	type: T;
	version: V;
	schema: z20.ZodObject<{
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	}, z20.core.$strip>;
	/** Parses an envelope of this type and version; throws a ZodError for anything else. */
	parse: (input: unknown) => ({
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z20.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z20.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never;
	/** Parses without throwing. Queue consumers use this, so a malformed message is a result to handle, not an exception to retry. */
	safeParse: (input: unknown) => z20.ZodSafeParseResult<({
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z20.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z20.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z20.core.$ZodBranded<z20.ZodString, "evt", "out">;
		occurredAt: z20.ZodISODateTime;
		organizationId: z20.core.$ZodBranded<z20.ZodString, "org", "out">;
		region: z20.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z20.ZodLiteral<T>;
		version: z20.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never>;
};
import { z as z21 } from "zod";
/** An id string branded with its prefix, so ids of different kinds cannot be mixed up. */
type Id<Prefix extends string> = string & z21.core.$brand<Prefix>;
/** An id for one prefix: `<prefix>_<32 lowercase hex characters>`, branded with the prefix. */
declare function idSchema<const Prefix extends string>(prefix: Prefix): PropertyKey extends Prefix ? z21.ZodString : z21.core.$ZodBranded<z21.ZodString, Prefix, "out">;
/** The id of an Organization (`org_…`). */
declare const organizationIdSchema: z21.core.$ZodBranded<z21.ZodString, "org", "out">;
/** The id of a user (`usr_…`). */
declare const userIdSchema: z21.core.$ZodBranded<z21.ZodString, "usr", "out">;
/** The id of a membership of a user in an Organization (`mem_…`). */
declare const membershipIdSchema: z21.core.$ZodBranded<z21.ZodString, "mem", "out">;
/** The id of a Team (`team_…`). */
declare const teamIdSchema: z21.core.$ZodBranded<z21.ZodString, "team", "out">;
/** The id of an Invitation to join an Organization (`inv_…`). */
declare const invitationIdSchema: z21.core.$ZodBranded<z21.ZodString, "inv", "out">;
/** The id of a Prospect (`prs_…`). */
declare const prospectIdSchema: z21.core.$ZodBranded<z21.ZodString, "prs", "out">;
/** The id of a Prospect Company (`pco_…`). */
declare const prospectCompanyIdSchema: z21.core.$ZodBranded<z21.ZodString, "pco", "out">;
/** The id of a Prospect import (`pimp_…`). */
declare const prospectImportIdSchema: z21.core.$ZodBranded<z21.ZodString, "pimp", "out">;
/** The id of a Prospect merge record (`pmrg_…`). */
declare const prospectMergeIdSchema: z21.core.$ZodBranded<z21.ZodString, "pmrg", "out">;
/** The id of a consent event in the ledger (`cev_…`). */
declare const consentEventIdSchema: z21.core.$ZodBranded<z21.ZodString, "cev", "out">;
/** The id of a Consent Wording version (`cwd_…`). */
declare const consentWordingIdSchema: z21.core.$ZodBranded<z21.ZodString, "cwd", "out">;
/** The id of a Suppression entry (`sup_…`). */
declare const suppressionEntryIdSchema: z21.core.$ZodBranded<z21.ZodString, "sup", "out">;
/** The id of a hosted consent form (`cfm_…`). */
declare const consentFormIdSchema: z21.core.$ZodBranded<z21.ZodString, "cfm", "out">;
/** The id of one Contact Check, as its audit row is named (`chk_…`). */
declare const contactCheckIdSchema: z21.core.$ZodBranded<z21.ZodString, "chk", "out">;
/** The id of a Suppression import (`simp_…`). */
declare const suppressionImportIdSchema: z21.core.$ZodBranded<z21.ZodString, "simp", "out">;
/** The id of a Playbook document (`doc_…`). */
declare const documentIdSchema: z21.core.$ZodBranded<z21.ZodString, "doc", "out">;
/** The opaque id of a Deal record (`deal_…`), used in every URL path; the customer's own deal id never travels in a path. */
declare const dealRecordIdSchema: z21.core.$ZodBranded<z21.ZodString, "deal", "out">;
/** The id of a Call (`call_…`). */
declare const callIdSchema: z21.core.$ZodBranded<z21.ZodString, "call", "out">;
/** The id of a Deal import (`dimp_…`). */
declare const dealImportIdSchema: z21.core.$ZodBranded<z21.ZodString, "dimp", "out">;
/** The id of an event (`evt_…`). */
declare const eventIdSchema: z21.core.$ZodBranded<z21.ZodString, "evt", "out">;
/** The id of a request, for tracing (`req_…`). */
declare const requestIdSchema: z21.core.$ZodBranded<z21.ZodString, "req", "out">;
/** The id of a Demo Request (`dreq_…`), a Visitor's submitted wish to see Closeline. */
declare const demoRequestIdSchema: z21.core.$ZodBranded<z21.ZodString, "dreq", "out">;
/** The id of an Organization. */
type OrganizationId = z21.infer<typeof organizationIdSchema>;
/** The id of a user. */
type UserId = z21.infer<typeof userIdSchema>;
/** The id of a membership. */
type MembershipId = z21.infer<typeof membershipIdSchema>;
/** The id of a Team. */
type TeamId = z21.infer<typeof teamIdSchema>;
/** The id of an Invitation. */
type InvitationId = z21.infer<typeof invitationIdSchema>;
/** The id of a consent event. */
type ConsentEventId = z21.infer<typeof consentEventIdSchema>;
/** The id of a Consent Wording version. */
type ConsentWordingId = z21.infer<typeof consentWordingIdSchema>;
/** The id of a Suppression entry. */
type SuppressionEntryId = z21.infer<typeof suppressionEntryIdSchema>;
/** The id of a hosted consent form. */
type ConsentFormId = z21.infer<typeof consentFormIdSchema>;
/** The id of one Contact Check. */
type ContactCheckId = z21.infer<typeof contactCheckIdSchema>;
/** The id of a Suppression import. */
type SuppressionImportId = z21.infer<typeof suppressionImportIdSchema>;
/** The id of a Prospect. */
type ProspectId = z21.infer<typeof prospectIdSchema>;
/** The id of a Prospect Company. */
type ProspectCompanyId = z21.infer<typeof prospectCompanyIdSchema>;
/** The id of a Prospect import. */
type ProspectImportId = z21.infer<typeof prospectImportIdSchema>;
/** The id of a Prospect merge record. */
type ProspectMergeId = z21.infer<typeof prospectMergeIdSchema>;
/** The id of a Playbook document. */
type DocumentId = z21.infer<typeof documentIdSchema>;
/** The opaque id of a Deal record. */
type DealRecordId = z21.infer<typeof dealRecordIdSchema>;
/** The id of a Call. */
type CallId = z21.infer<typeof callIdSchema>;
/** The id of a Deal import. */
type DealImportId = z21.infer<typeof dealImportIdSchema>;
/** The id of an event. */
type EventId = z21.infer<typeof eventIdSchema>;
/** The id of a request. */
type RequestId = z21.infer<typeof requestIdSchema>;
/** The id of a Demo Request. */
type DemoRequestId = z21.infer<typeof demoRequestIdSchema>;
/** Turns a UUID (any case; 32 hex characters or the dashed 8-4-4-4-12 form) into an id with the given prefix; throws otherwise. */
declare function formatId<const Prefix extends string>(prefix: Prefix, uuid: string): Id<Prefix>;
import { z as z22 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh455 } from "..";
/**
* The errors the marketing routes return, as `area.reason` codes. They are the only domain
* errors of the public Demo Request route. `marketing.invalid_request` (400) is a body that fails
* `createDemoRequestRequestSchema`, or a missing or malformed `Idempotency-Key` header; it
* replaces the common `request.invalid` on this route so a Visitor-facing form branches on one
* area. `marketing.rate_limited` (429) is the per-client-address limit, answered with `details`
* of `retryAfterDetailsSchema` (`retryAfter` in seconds) and a `Retry-After` header. Neither
* message says why a request was refused beyond that, and a filled honeypot is not an error.
*/
declare const MARKETING_ERRORS: {
	readonly "marketing.invalid_request": ErrorDefinition_8gwh455<"marketing.invalid_request">;
	readonly "marketing.rate_limited": ErrorDefinition_8gwh455<"marketing.rate_limited">;
};
/** A code from the {@link MARKETING_ERRORS} registry. */
type MarketingErrorCode = keyof typeof MARKETING_ERRORS;
/** The most characters a Demo Request message may carry. */
declare const MAX_DEMO_REQUEST_MESSAGE_LENGTH = 2e3;
/** The most characters of the source page path and of the honeypot field. */
declare const MAX_DEMO_REQUEST_FIELD_LENGTH = 200;
/**
* The free-text message of a Demo Request: at most 2,000 characters, trimmed, with line breaks
* and tabs allowed and every other control character refused. It is untrusted text: the team
* email and any display must escape it and never treat it as instructions.
*/
declare const demoRequestMessageSchema: z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>;
/**
* The site page a Visitor submitted from: an absolute path such as `/pricing`, at most 200
* characters of printable ASCII with no whitespace, so a full URL or a script cannot be put in it.
*/
declare const demoRequestSourcePageSchema: z22.ZodString;
/**
* The body of `POST /v1/marketing/demo-requests`, sent by a Visitor (nobody signed in): name, work
* email (folded to lower case), company name, an optional message, the page it came from and a
* honeypot. The honeypot, `website`, is a field the form hides from people: a Visitor leaves it
* empty (and may omit it), so a non-empty value marks a bot. It still parses, so the service can
* answer exactly as it does for a real request and store nothing. The idempotency key is not in
* the body; it is the `Idempotency-Key` header (`idempotencyKeySchema`). The schema is strict:
* an unknown key is `marketing.invalid_request`.
*/
declare const createDemoRequestRequestSchema: z22.ZodObject<{
	name: z22.ZodPipe<z22.ZodString, z22.ZodString>;
	workEmail: z22.ZodPipe<z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>, z22.ZodString>;
	companyName: z22.ZodPipe<z22.ZodString, z22.ZodString>;
	message: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>>;
	sourcePage: z22.ZodString;
	website: z22.ZodDefault<z22.ZodString>;
}, z22.core.$strict>;
/** The body of a request to submit a Demo Request. */
type CreateDemoRequestRequest = z22.infer<typeof createDemoRequestRequestSchema>;
/**
* The acknowledgement of a Demo Request: its id and nothing else, so no submitted field comes
* back. A replay under the same `Idempotency-Key` returns the same id.
*/
declare const createDemoRequestResponseSchema: z22.ZodObject<{
	id: z22.core.$ZodBranded<z22.ZodString, "dreq", "out">;
}, z22.core.$strip>;
/** The acknowledgement of a Demo Request. */
type CreateDemoRequestResponse = z22.infer<typeof createDemoRequestResponseSchema>;
/** What the service needs to describe a marketing route for its OpenAPI document. */
type MarketingRoute = {
	readonly method: "POST";
	readonly path: string;
	/** True: the route takes no token and no Organization; anyone may call it. */
	readonly public: true;
	/** Whether the `Idempotency-Key` header is `required` for this route. */
	readonly idempotencyKey: "required";
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return. */
	readonly errors: readonly MarketingErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document. */
	readonly description: string;
};
/** The marketing routes, by name. */
type MarketingRouteName = "createDemoRequest";
/**
* The marketing routes: the description a service puts in its OpenAPI document, the success
* statuses and every error code each route may answer with. No marketing route answers
* `auth.*`: it is public.
*/
declare const MARKETING_ROUTES: Readonly<Record<MarketingRouteName, MarketingRoute>>;
/**
* Every error code `POST /v1/marketing/demo-requests` may answer with: the two `marketing.*`
* codes first, then the common ones. It never answers `auth.*`, `request.invalid` or
* `rate.limited`: `marketing.invalid_request` and `marketing.rate_limited` stand in for them.
*/
declare const CREATE_DEMO_REQUEST_ERROR_CODES: readonly ["marketing.invalid_request", "marketing.rate_limited", "request.too_large", "request.unsupported_media_type", "request.idempotency_key_reused", "request.idempotency_in_progress", "server.internal", "server.unavailable", "server.timeout"];
import { z as z23 } from "zod";
/** The largest page any list endpoint returns. */
declare const MAX_PAGE_SIZE = 100;
/** The page size used when a request does not ask for one. */
declare const DEFAULT_PAGE_SIZE = 25;
/** The longest cursor accepted or produced; about 380 bytes of JSON. */
declare const MAX_CURSOR_LENGTH = 512;
/** The query parameters of a list request: an optional cursor and a bounded limit (from a number or digit string). */
declare const pageQuerySchema: z23.ZodObject<{
	cursor: z23.ZodOptional<z23.ZodString>;
	limit: z23.ZodDefault<z23.ZodPipe<z23.ZodPipe<z23.ZodUnion<readonly [z23.ZodNumber, z23.ZodString]>, z23.ZodTransform<number, string | number>>, z23.ZodNumber>>;
}, z23.core.$strip>;
/** The parsed query parameters of a list request. */
type PageQuery = z23.infer<typeof pageQuerySchema>;
/** Builds the schema of one page of `itemSchema` items and the cursor for the next page, or null at the end. */
declare function pageSchema<T extends z23.ZodType>(itemSchema: T): z23.ZodObject<{
	items: z23.ZodArray<T>;
	nextCursor: z23.ZodNullable<z23.ZodString>;
}, z23.core.$strip>;
/** One page of items, as returned by a list endpoint. */
type Page<T> = {
	items: T[];
	nextCursor: string | null;
};
/**
* Encodes a JSON-serialisable position as a URL-safe cursor (base64url of its JSON); throws if the
* result would exceed {@link MAX_CURSOR_LENGTH}. A cursor is not signed or encrypted: the client
* can read and forge it, so it must carry only a position. The Organization always comes from the
* verified token, never from a cursor.
*/
declare function encodeCursor(value: unknown): string;
/**
* Decodes a cursor made by {@link encodeCursor}; returns undefined, never throws, for anything
* invalid. The decoded value is client-controlled input: use it as a position only.
*/
declare function decodeCursor<T extends z23.ZodType>(text: string, schema: T): z23.output<T> | undefined;
import { ErrorDefinition as ErrorDefinition_8gwh456 } from "..";
/**
* The errors the playbook service returns, as `area.reason` codes. No body carries a file name,
* file content or text taken from a document: every message is fixed. A role that is not allowed
* is the common `auth.forbidden`; a malformed multipart body is the common `request.invalid`.
* There is no page-limit code: the page count is checked in the ingestion job, so a document over
* the limit ends in state `failed` with `failureReason: 'too_many_pages'`. `quota_exceeded` covers
* both the document count and the total size and does not say which, as no domain error in this
* library carries typed details. `document.not_restorable` (410) is a deleted
* document whose purge time has passed but which the purge has not yet removed. There is no
* tombstone: once purged the record is gone and the answer is `document.not_found` (404).
*/
declare const PLAYBOOK_ERRORS: {
	readonly "document.not_found": ErrorDefinition_8gwh456<"document.not_found">;
	readonly "document.not_restorable": ErrorDefinition_8gwh456<"document.not_restorable">;
	readonly "document.quota_exceeded": ErrorDefinition_8gwh456<"document.quota_exceeded">;
	readonly "document.too_large": ErrorDefinition_8gwh456<"document.too_large">;
	readonly "document.unsupported_type": ErrorDefinition_8gwh456<"document.unsupported_type">;
};
/** A code from the {@link PLAYBOOK_ERRORS} registry. */
type PlaybookErrorCode = keyof typeof PLAYBOOK_ERRORS;
/** The roles that may change the Playbook (ADR 0016, choice 4). */
declare const PLAYBOOK_WRITE_ROLES: readonly ["owner", "admin"];
/** The roles that may list and read documents: every role (ADR 0016, choice 4). */
declare const PLAYBOOK_READ_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The playbook routes, by name. */
type PlaybookRouteName = "uploadDocument" | "listDocuments" | "getDocument" | "deleteDocument" | "restoreDocument" | "removeOrganizationDocuments";
/** What the service needs to describe one route: its method, path, who may call it, what it answers. */
type PlaybookRoute = {
	readonly method: "GET" | "POST" | "DELETE";
	readonly path: string;
	/** True for a route on the internal network only; it takes no role and names the Organization in the path. */
	readonly internal: boolean;
	/** The roles allowed; empty for an internal route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly PlaybookErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The playbook routes: the description a service puts in its OpenAPI document, the roles, the
* success statuses and every error code each route may answer with. Every route may also return
* the common `auth.*`, `rate.limited` and `server.*` codes. A route on another Organization's
* document answers `document.not_found`.
*/
declare const PLAYBOOK_ROUTES: Readonly<Record<PlaybookRouteName, PlaybookRoute>>;
import { z as z24 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh457 } from "..";
/**
* The errors the sales-history routes return, as `area.reason` codes. No body carries a file name,
* a deal id, a speaker label or text from a Call: every message is fixed. A role that is not
* allowed is the common `auth.forbidden`.
*
* - A second upload of the same Call under the same Deal is an answer (200, the stored Call), as
*   for a document in ADR 0016, so it has no code; the same content under another Deal id is
*   `call.content_in_other_deal`, and the answer does not say which Deal.
* - A recording longer than `MAX_RECORDING_SECONDS` and a page-less Transcript with no turns are
*   found by the job, so they are failure reasons on the Call, not codes.
* - A CSV row that fails (including an Outcome already decided) is a row result in the import
*   report, never an HTTP error.
* - `call.quota_exceeded` covers the number of Calls, the Recording bytes and the number of Deals,
*   and says deleted Calls count until purged.
* - `call.not_restorable` (410) is for a deleted Call past its purge time that the purge has not
*   yet removed; once purged the answer is `call.not_found` (404).
* - `rights.confirmation_required` (403) carries `details` of {@link rightsRequiredDetailsSchema},
*   so the portal knows which version of the wording to show.
*/
declare const SALES_HISTORY_ERRORS: {
	readonly "call.content_in_other_deal": ErrorDefinition_8gwh457<"call.content_in_other_deal">;
	readonly "call.not_found": ErrorDefinition_8gwh457<"call.not_found">;
	readonly "call.not_restorable": ErrorDefinition_8gwh457<"call.not_restorable">;
	readonly "call.quota_exceeded": ErrorDefinition_8gwh457<"call.quota_exceeded">;
	readonly "call.rep_invalid": ErrorDefinition_8gwh457<"call.rep_invalid">;
	readonly "call.rep_not_changeable": ErrorDefinition_8gwh457<"call.rep_not_changeable">;
	readonly "call.too_large": ErrorDefinition_8gwh457<"call.too_large">;
	readonly "call.unsupported_type": ErrorDefinition_8gwh457<"call.unsupported_type">;
	readonly "deal.not_found": ErrorDefinition_8gwh457<"deal.not_found">;
	readonly "deal_import.busy": ErrorDefinition_8gwh457<"deal_import.busy">;
	readonly "deal_import.header_invalid": ErrorDefinition_8gwh457<"deal_import.header_invalid">;
	readonly "deal_import.not_found": ErrorDefinition_8gwh457<"deal_import.not_found">;
	readonly "deal_import.too_large": ErrorDefinition_8gwh457<"deal_import.too_large">;
	readonly "deal_import.unsupported_type": ErrorDefinition_8gwh457<"deal_import.unsupported_type">;
	readonly "rights.confirmation_required": ErrorDefinition_8gwh457<"rights.confirmation_required">;
	readonly "rights.version_outdated": ErrorDefinition_8gwh457<"rights.version_outdated">;
};
/** A code from the {@link SALES_HISTORY_ERRORS} registry. */
type SalesHistoryErrorCode = keyof typeof SALES_HISTORY_ERRORS;
/** The `details` of a `rights.confirmation_required` body: the version of the wording the portal must show. */
declare const rightsRequiredDetailsSchema: z24.ZodObject<{
	wordingVersion: z24.ZodNumber;
}, z24.core.$strict>;
/** The `details` of a `rights.confirmation_required` body. */
type RightsRequiredDetails = z24.infer<typeof rightsRequiredDetailsSchema>;
/** The roles that may read Calls, Deals, imports and the rights confirmation: Owner and Admin only, the owner's decision of 2026-10-13 (the writers are the same two roles). Managers and Reps get `auth.forbidden`. */
declare const SALES_HISTORY_READ_ROLES: readonly ["owner", "admin"];
/** The sales-history routes, by name. */
type SalesHistoryRouteName = "uploadCall" | "listCalls" | "getCall" | "deleteCall" | "restoreCall" | "setCallRep" | "listDeals" | "getDeal" | "lookupDeal" | "setDealOutcome" | "uploadDealImport" | "listDealImports" | "getDealImport" | "listDealImportRows" | "getRightsConfirmation" | "confirmRights";
/**
* What the service needs to describe one sales-history route. It has the shape of `PlaybookRoute`
* but its own method list (it adds `PUT`) and its own error codes, so the 0.7.0 `PlaybookRoute`
* type is not widened. Use `ALL_PLAYBOOK_ROUTES` for both tables in one map.
*/
type SalesHistoryRoute = {
	readonly method: "GET" | "POST" | "PUT" | "DELETE";
	readonly path: string;
	/** True for a route on the internal network only; none of these is. */
	readonly internal: boolean;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly SalesHistoryErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The sales-history routes (ADR 0018), described as `PLAYBOOK_ROUTES` describes the document
* routes: method, path, roles, success statuses, domain error codes and the OpenAPI description.
* Every route may also return the common `auth.*`, `rate.limited` and `server.*` codes. A route on
* another Organization's Call, Deal or import answers the not-found code. No response carries a
* Transcript, audio or a turn. Reads are Owner and Admin only ({@link SALES_HISTORY_READ_ROLES}).
*/
declare const SALES_HISTORY_ROUTES: Readonly<Record<SalesHistoryRouteName, SalesHistoryRoute>>;
import { z as z25 } from "zod";
/** The most Moments a search returns (the `limit` ceiling). */
declare const MAX_SEARCH_LIMIT = 20;
/** How many Moments a search returns when `limit` is left out. */
declare const DEFAULT_SEARCH_LIMIT = 5;
/** The most turns in a search query: the live window of the conversation, at most six turns. */
declare const MAX_SEARCH_TURNS = 6;
/** The most characters (Unicode code points) of all the turns of a search query together. */
declare const MAX_SEARCH_TEXT_CHARACTERS = 2e3;
/** The most characters (Unicode code points) of one snippet in a search result. */
declare const MAX_MOMENT_SNIPPET_CHARACTERS = 512;
/** The most candidate Moments a search looks at before it keeps the best `limit`; it bounds `evidence`. */
declare const MAX_SEARCH_CANDIDATES = 100;
/** One turn of the live conversation: who spoke (`rep` or `prospect`) and what was said. Tenant conversation text: never logged. */
declare const searchTurnSchema: z25.ZodObject<{
	role: z25.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
	}>;
	text: z25.ZodString;
}, z25.core.$strict>;
/** One turn of the live conversation. */
type SearchTurn = z25.infer<typeof searchTurnSchema>;
/**
* The body of a search over won Deals: the latest turns of the conversation (1 to
* `MAX_SEARCH_TURNS`, at most `MAX_SEARCH_TEXT_CHARACTERS` code points in all) and an optional
* `limit` (1 to `MAX_SEARCH_LIMIT`, default `DEFAULT_SEARCH_LIMIT`). It is conversation text of the
* Organization, so it is sent in a body and never logged. An unknown key is rejected.
*/
declare const searchMomentsRequestSchema: z25.ZodObject<{
	turns: z25.ZodArray<z25.ZodObject<{
		role: z25.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		text: z25.ZodString;
	}, z25.core.$strict>>;
	limit: z25.ZodDefault<z25.ZodNumber>;
}, z25.core.$strict>;
/** The body of a search over won Deals, with the default limit applied. */
type SearchMomentsRequest = z25.infer<typeof searchMomentsRequestSchema>;
/**
* A short piece of a Moment's text: at most `MAX_MOMENT_SNIPPET_CHARACTERS` code points, possibly
* empty, well-formed and with no control or bidirectional character (newlines and tabs included),
* the same rule as a speaker excerpt. Build one with {@link momentSnippet}. Tenant Transcript text.
*/
declare const momentSnippetSchema: z25.ZodString;
/**
* Makes a snippet from stored Transcript text: whitespace collapsed, control and bidirectional
* characters removed and the text cut to `MAX_MOMENT_SNIPPET_CHARACTERS` code points at a word
* boundary with an ellipsis. It always passes {@link momentSnippetSchema}. Never log the result.
*/
declare function momentSnippet(text: string): string;
/**
* One similar Moment from a won Deal: the Call and Deal it comes from (opaque ids), its similarity
* `score` (higher is closer) and two snippets, what the Prospect said and what the Rep said next.
* It never carries the customer's `dealId`, name or amount; unknown fields are dropped. The
* snippets are tenant Transcript text: never logged.
*/
declare const momentMatchSchema: z25.ZodObject<{
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
	score: z25.ZodNumber;
	prospect: z25.ZodString;
	repNext: z25.ZodString;
}, z25.core.$strip>;
/** One similar Moment from a won Deal. */
type MomentMatch = z25.infer<typeof momentMatchSchema>;
/** How much a search found: `moments` candidates that may be returned and the distinct won Deals (`deals`) among them, both at most `MAX_SEARCH_CANDIDATES`. */
declare const searchEvidenceSchema: z25.ZodObject<{
	moments: z25.ZodNumber;
	deals: z25.ZodNumber;
}, z25.core.$strip>;
/** How much a search found. */
type SearchEvidence = z25.infer<typeof searchEvidenceSchema>;
/**
* The answer to a search: the best matches, at most `MAX_SEARCH_LIMIT`, best first, and the
* evidence. There is no cursor: the result is a bounded top-k. The items are the first of the
* `moments` candidates and the Deals are among them, so neither count is above `evidence.moments`, and `evidence.deals` is at least the number of distinct Deals among the items.
*/
declare const searchMomentsResponseSchema: z25.ZodObject<{
	items: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		score: z25.ZodNumber;
		prospect: z25.ZodString;
		repNext: z25.ZodString;
	}, z25.core.$strip>>;
	evidence: z25.ZodObject<{
		moments: z25.ZodNumber;
		deals: z25.ZodNumber;
	}, z25.core.$strip>;
}, z25.core.$strip>;
/** The answer to a search. */
type SearchMomentsResponse = z25.infer<typeof searchMomentsResponseSchema>;
/**
* The text that is embedded for a window of turns: one `Rep: ` or `Prospect: ` line per turn,
* joined by a newline. The indexer (a Moment's text) and the search (the query) both call this, so
* what is stored and what is asked cannot drift, so the indexer must use this function too. Each
* turn's text is trimmed. It adds no speaker label and no Rep reply. The
* result is tenant conversation text: never log it.
*/
declare function momentQueryText(turns: readonly SearchTurn[]): string;
/** The body of a search over Playbook documents: the same turns and limit as {@link searchMomentsRequestSchema}, with the same bounds. Tenant conversation text: never logged. */
declare const searchDocumentsRequestSchema: z25.ZodObject<{
	turns: z25.ZodArray<z25.ZodObject<{
		role: z25.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		text: z25.ZodString;
	}, z25.core.$strict>>;
	limit: z25.ZodDefault<z25.ZodNumber>;
}, z25.core.$strict>;
/**
* The text that is embedded to search Playbook documents: each turn's text trimmed and joined by a
* newline, with no role labels, because document chunks are embedded as plain text and a label
* would skew the similarity. The Moments search uses {@link momentQueryText} instead. The result
* is tenant conversation text: never log it.
*/
declare function documentQueryText(turns: readonly SearchTurn[]): string;
/** The body of a search over Playbook documents. */
type SearchDocumentsRequest = SearchMomentsRequest;
/**
* One matching passage of a Playbook document: the document (`documentId`, and its `fileName`, the
* Organization's own file name, the same as the document's `fileName`), the `page` it is on, its
* similarity `score` (higher is closer) and a `snippet` of the passage, cleaned and cut with
* {@link momentSnippet}. `page` is the 1-based page for a paginated format (PDF) and `null` for a
* format without pages (TXT, MD, DOCX, and anything else the parser reads as one page); the service
* decides by media type. One item per chunk. Unknown fields are dropped. The snippet is the
* Organization's own sales material: never log it.
*/
declare const documentMatchSchema: z25.ZodObject<{
	documentId: z25.core.$ZodBranded<z25.ZodString, "doc", "out">;
	fileName: z25.ZodPipe<z25.ZodPipe<z25.ZodString, z25.ZodTransform<string, string>>, z25.ZodString>;
	page: z25.ZodNullable<z25.ZodNumber>;
	score: z25.ZodNumber;
	snippet: z25.ZodString;
}, z25.core.$strip>;
/** One matching passage of a Playbook document. */
type DocumentMatch = z25.infer<typeof documentMatchSchema>;
/** How much a document search found: `chunks` that may be returned and the distinct `documents` among them, both at most `MAX_SEARCH_CANDIDATES`. */
declare const documentSearchEvidenceSchema: z25.ZodObject<{
	chunks: z25.ZodNumber;
	documents: z25.ZodNumber;
}, z25.core.$strip>;
/** How much a document search found. */
type DocumentSearchEvidence = z25.infer<typeof documentSearchEvidenceSchema>;
/**
* The answer to a document search: the best passages, at most `MAX_SEARCH_LIMIT`, best first, and
* the evidence. There is no cursor. As for Moments, neither the items nor the documents exceed
* `evidence.chunks`, and `evidence.documents` is at least the number of distinct documents among
* the items.
*/
declare const searchDocumentsResponseSchema: z25.ZodObject<{
	items: z25.ZodArray<z25.ZodObject<{
		documentId: z25.core.$ZodBranded<z25.ZodString, "doc", "out">;
		fileName: z25.ZodPipe<z25.ZodPipe<z25.ZodString, z25.ZodTransform<string, string>>, z25.ZodString>;
		page: z25.ZodNullable<z25.ZodNumber>;
		score: z25.ZodNumber;
		snippet: z25.ZodString;
	}, z25.core.$strip>>;
	evidence: z25.ZodObject<{
		chunks: z25.ZodNumber;
		documents: z25.ZodNumber;
	}, z25.core.$strip>;
}, z25.core.$strip>;
/** The answer to a document search. */
type SearchDocumentsResponse = z25.infer<typeof searchDocumentsResponseSchema>;
/** The search routes, by name. */
type SearchRouteName = "searchMoments" | "searchDocuments";
/**
* The search routes: read-only `POST`s (the body is conversation text). `searchMoments` is for
* Owner and Admin only (the roles that read sales history); `searchDocuments` is for every role
* that reads the Playbook. They use existing codes only, so they have no domain code of their own.
*/
declare const SEARCH_ROUTES: Readonly<Record<SearchRouteName, PlaybookRoute>>;
import { ErrorDefinition as ErrorDefinition_8gwh458 } from "..";
/** Every Playbook route name: the document routes of 0.7.0, the sales-history routes and the search route. */
type AllPlaybookRouteName = PlaybookRouteName | SalesHistoryRouteName | SearchRouteName;
/**
* Every Playbook route in one map, for a service that builds one OpenAPI document. `PLAYBOOK_ROUTES`
* and `PLAYBOOK_ERRORS` keep their 0.7.0 types, so code written against them still compiles; use
* this map and `ALL_PLAYBOOK_ERRORS` when you want both areas.
*/
declare const ALL_PLAYBOOK_ROUTES: Readonly<Record<AllPlaybookRouteName, PlaybookRoute | SalesHistoryRoute>>;
/** Every Playbook error code in one registry: the document codes of 0.7.0 and the sales-history codes. */
declare const ALL_PLAYBOOK_ERRORS: Readonly<{
	"call.content_in_other_deal": ErrorDefinition_8gwh458<"call.content_in_other_deal">;
	"call.not_found": ErrorDefinition_8gwh458<"call.not_found">;
	"call.not_restorable": ErrorDefinition_8gwh458<"call.not_restorable">;
	"call.quota_exceeded": ErrorDefinition_8gwh458<"call.quota_exceeded">;
	"call.rep_invalid": ErrorDefinition_8gwh458<"call.rep_invalid">;
	"call.rep_not_changeable": ErrorDefinition_8gwh458<"call.rep_not_changeable">;
	"call.too_large": ErrorDefinition_8gwh458<"call.too_large">;
	"call.unsupported_type": ErrorDefinition_8gwh458<"call.unsupported_type">;
	"deal.not_found": ErrorDefinition_8gwh458<"deal.not_found">;
	"deal_import.busy": ErrorDefinition_8gwh458<"deal_import.busy">;
	"deal_import.header_invalid": ErrorDefinition_8gwh458<"deal_import.header_invalid">;
	"deal_import.not_found": ErrorDefinition_8gwh458<"deal_import.not_found">;
	"deal_import.too_large": ErrorDefinition_8gwh458<"deal_import.too_large">;
	"deal_import.unsupported_type": ErrorDefinition_8gwh458<"deal_import.unsupported_type">;
	"document.not_found": ErrorDefinition_8gwh458<"document.not_found">;
	"document.not_restorable": ErrorDefinition_8gwh458<"document.not_restorable">;
	"document.quota_exceeded": ErrorDefinition_8gwh458<"document.quota_exceeded">;
	"document.too_large": ErrorDefinition_8gwh458<"document.too_large">;
	"document.unsupported_type": ErrorDefinition_8gwh458<"document.unsupported_type">;
	"rights.confirmation_required": ErrorDefinition_8gwh458<"rights.confirmation_required">;
	"rights.version_outdated": ErrorDefinition_8gwh458<"rights.version_outdated">;
}>;
import { z as z27 } from "zod";
import { z as z26 } from "zod";
/**
* The states a Call is in (ADR 0018, with ADR 0016). A Transcript goes `uploaded`, `processing`,
* `ready`; a Recording goes `uploaded`, `transcribing`, then `awaiting_rep` (no Rep chosen yet) or
* `processing`, then `ready`. `processing` is also where a Call goes when its Rep changes and its
* Moments are rebuilt, and where a restored Call goes. `awaiting_rep` is the named wait of choice 9:
* no Moments exist and the Call is not in search. `deleted` is soft-deleted and awaiting purge. A
* Call held back from search because its Deal is not won is `ready`: that is read from the Deal,
* not a state. An upload still streaming has no Call yet, so it has no state.
*/
declare const CALL_STATES: readonly ["uploaded", "transcribing", "awaiting_rep", "processing", "ready", "failed", "deleted"];
/** The state of a Call. */
declare const callStateSchema: z26.ZodEnum<{
	awaiting_rep: "awaiting_rep";
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	transcribing: "transcribing";
	uploaded: "uploaded";
}>;
/** The state of a Call. */
type CallState = z26.infer<typeof callStateSchema>;
/**
* Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text.
* `too_long` is found by the job from the audio, not at upload, so it is a reason and not an HTTP
* code. `too_many_speakers` is a Call with more speakers than `MAX_CALL_SPEAKERS`. `rep_label_not_found` and `not_per_side` can be fixed by changing the Rep (see {@link repChangeAllowed}). The list is the
* lead's reading of ADR 0018.
*/
declare const CALL_FAILURE_REASONS: readonly ["no_turns", "too_few_speakers", "too_many_speakers", "rep_label_not_found", "not_per_side", "too_long", "transcription_failed", "transcription_timed_out", "unreadable", "processing_failed"];
/** Why a Call ended in `failed`. */
declare const callFailureReasonSchema: z26.ZodEnum<{
	no_turns: "no_turns";
	not_per_side: "not_per_side";
	processing_failed: "processing_failed";
	rep_label_not_found: "rep_label_not_found";
	too_few_speakers: "too_few_speakers";
	too_long: "too_long";
	too_many_speakers: "too_many_speakers";
	transcription_failed: "transcription_failed";
	transcription_timed_out: "transcription_timed_out";
	unreadable: "unreadable";
}>;
/** Why a Call ended in `failed`. */
type CallFailureReason = z26.infer<typeof callFailureReasonSchema>;
/** What a Call was uploaded as: a written Transcript or an audio Recording. */
declare const CALL_KINDS: readonly ["transcript", "recording"];
/** What a Call was uploaded as. */
declare const callKindSchema: z26.ZodEnum<{
	recording: "recording";
	transcript: "transcript";
}>;
/** What a Call was uploaded as. */
type CallKind = z26.infer<typeof callKindSchema>;
/** The lead's default (ADR 0018, refinements; not the owner's): the Transcript extensions accepted: plain text, WebVTT, SRT and a JSON turn list. */
declare const ACCEPTED_TRANSCRIPT_EXTENSIONS: readonly [".txt", ".vtt", ".srt", ".json"];
/** The lead's default (ADR 0018, refinements; not the owner's): the Recording extensions accepted. */
declare const ACCEPTED_RECORDING_EXTENSIONS: readonly [".mp3", ".m4a", ".wav", ".ogg", ".webm", ".flac"];
/** An accepted Call file extension. */
type AcceptedCallExtension = (typeof ACCEPTED_TRANSCRIPT_EXTENSIONS)[number] | (typeof ACCEPTED_RECORDING_EXTENSIONS)[number];
/** The media type of a stored Call file, as the service detected it from the content. */
declare const CALL_MEDIA_TYPES: readonly ["text/plain", "text/vtt", "application/x-subrip", "application/json", "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm", "audio/flac"];
/** The media type of a stored Call file. */
declare const callMediaTypeSchema: z26.ZodEnum<{
	"application/json": "application/json";
	"application/x-subrip": "application/x-subrip";
	"audio/flac": "audio/flac";
	"audio/mp4": "audio/mp4";
	"audio/mpeg": "audio/mpeg";
	"audio/ogg": "audio/ogg";
	"audio/wav": "audio/wav";
	"audio/webm": "audio/webm";
	"text/plain": "text/plain";
	"text/vtt": "text/vtt";
}>;
/** The media type of a stored Call file. */
type CallMediaType = z26.infer<typeof callMediaTypeSchema>;
/** The media type each accepted Call extension stands for. */
declare const MEDIA_TYPE_BY_CALL_EXTENSION: Readonly<Record<AcceptedCallExtension, CallMediaType>>;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest Transcript accepted, 5 MB counted as 5 * 1024 * 1024 bytes. */
declare const MAX_TRANSCRIPT_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest Recording accepted, 500 MB counted as 500 * 1024 * 1024 bytes; streamed, never held whole. */
declare const MAX_RECORDING_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the longest Recording, 3 hours in seconds; the job checks it, so a longer one ends `failed` with `too_long`. */
declare const MAX_RECORDING_SECONDS: number;
/** The ticket's default (ADR 0018 leaves it open): hours after which the parts of an incomplete streamed upload are discarded. */
declare const INCOMPLETE_UPLOAD_PARTS_TTL_HOURS = 24;
/** The ticket's default (ADR 0018 leaves it open): the most Rep turns stored after a Moment (choice 11). */
declare const MAX_REP_FOLLOWING_TURNS = 5;
/** The ticket's default (ADR 0018 leaves it open): the most characters (Unicode code points) of Rep turns stored after a Moment, so a long turn cannot make it unbounded. */
declare const MAX_REP_FOLLOWING_CHARACTERS = 4e3;
/** The ticket's default (ADR 0018 leaves it open): Calls an Organization may hold, soft-deleted and `awaiting_rep` ones included until purged. */
declare const DEFAULT_MAX_CALLS = 2e3;
/** The ticket's default (ADR 0018 leaves it open): Recording bytes an Organization may hold, 50 GB counted as 50 * 1024^3. */
declare const DEFAULT_MAX_RECORDING_BYTES_TOTAL: number;
/** The ticket's default (ADR 0018 leaves it open): Deals an Organization may hold. */
declare const DEFAULT_MAX_DEALS = 2e4;
/** The ticket's default (ADR 0018 leaves it open): the most speakers a Call may have and list for a Rep pick; a Call with more fails with `too_many_speakers`. */
declare const MAX_CALL_SPEAKERS = 20;
/** The longest speaker label, in Unicode code points, once control and direction characters are stripped. */
declare const MAX_SPEAKER_LABEL_LENGTH = 64;
/** The most UTF-8 bytes a stored speaker label can take: 64 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_SPEAKER_LABEL_BYTES: number;
/** The stored form of a speaker label: control and bidirectional characters removed, then trimmed. Labels read from a file and labels in a request must both pass through this. */
declare function normaliseSpeakerLabel(label: string): string;
/**
* A speaker label, in a request and in a response: at most 1000 raw Unicode code points, then control and
* bidirectional characters are removed and the rest trimmed to 1 to 64 well-formed Unicode code
* points (at most `MAX_SPEAKER_LABEL_BYTES` bytes in UTF-8). It is text taken from a file (`Alice`, or `A` from the transcriber), so display code must
* treat it as untrusted text, and it never appears in an error body. It is compared exactly and
* case-sensitively with the labels in the file.
*/
declare const speakerLabelSchema: z26.ZodPipe<z26.ZodPipe<z26.ZodString, z26.ZodTransform<string, string>>, z26.ZodString>;
/** The most Unicode code points of a speaker excerpt, the ellipsis included. */
declare const MAX_SPEAKER_EXCERPT_LENGTH = 240;
/**
* Cleans text for a short excerpt or snippet and cuts it to `max` code points: whitespace
* (newlines and tabs included) collapsed to one space, control and bidirectional characters and
* lone surrogates removed, then, when still too long, cut at a word boundary with an ellipsis (a
* single word longer than `max` is cut hard); the cut never splits a code point. What it returns
* always passes the excerpt and snippet schemas. The result is tenant text: never log it.
*/
declare function excerptText(text: string, max: number): string;
/**
* Builds the excerpt that helps a person pick the Rep: the speaker's first turns joined with a
* space and cleaned and cut by {@link excerptText} to at most `MAX_SPEAKER_EXCERPT_LENGTH` code
* points. The result is tenant Transcript text: never log it.
*/
declare function speakerExcerpt(turns: readonly string[]): string;
/**
* One speaker of a Call with a short excerpt of what they said, so a person can tell who is the
* Rep. The label is untrusted text from the file and the excerpt is tenant Transcript text: both
* are returned only to the owning Organization's Owner and Admin and are never logged.
*/
declare const speakerExcerptSchema: z26.ZodObject<{
	label: z26.ZodPipe<z26.ZodPipe<z26.ZodString, z26.ZodTransform<string, string>>, z26.ZodString>;
	excerpt: z26.ZodString;
}, z26.core.$strict>;
/** One speaker of a Call with a short excerpt. */
type SpeakerExcerpt = z26.infer<typeof speakerExcerptSchema>;
/** The channels of a per-side Recording: the left one or the right one. */
declare const CALL_CHANNELS: readonly ["left", "right"];
/** A channel of a per-side Recording. */
declare const callChannelSchema: z26.ZodEnum<{
	left: "left";
	right: "right";
}>;
/**
* Which side of a Call is the Rep: a speaker label (a Transcript, or a Recording that waited in
* `awaiting_rep`) or a channel (a per-side Recording). A Recording whose Rep is not yet known has
* no choice at all (`null` on the Call, an absent `rep` at upload).
*/
declare const repChoiceSchema: z26.ZodDiscriminatedUnion<[z26.ZodObject<{
	by: z26.ZodLiteral<"speaker">;
	label: z26.ZodPipe<z26.ZodPipe<z26.ZodString, z26.ZodTransform<string, string>>, z26.ZodString>;
}, z26.core.$strict>, z26.ZodObject<{
	by: z26.ZodLiteral<"channel">;
	channel: z26.ZodEnum<{
		left: "left";
		right: "right";
	}>;
}, z26.core.$strict>], "by">;
/** Which side of a Call is the Rep. */
type RepChoice = z26.infer<typeof repChoiceSchema>;
/**
* Whether a Rep choice suits a Call of this kind, for the one moment named. At `upload`, a
* Transcript needs a speaker label (ADR 0018, refinements), and a Recording takes a channel (the
* uploader declares it per-side) or nothing (it then waits in `awaiting_rep`); a speaker label for
* a Recording is not known at upload. At `change`, a choice is required: a Transcript takes a
* speaker label and a Recording takes a speaker label (from the detected speakers) or a channel.
* Whether a channel fits the file (exactly two channels) is the service's check, and a mismatch
* ends the Call `failed` with `not_per_side`. A failure here is `call.rep_invalid`.
*/
declare function repChoiceSuits(kind: CallKind, rep: RepChoice | null | undefined, when: "upload" | "change"): boolean;
/** What fixes a failed Call: a different Rep, a re-upload of the same file (the reason may be transient), or deleting the Call and uploading a corrected file. */
type CallFailureFix = "change_rep" | "reupload" | "delete_and_upload";
/**
* What fixes each failure reason. `change_rep`: `rep_label_not_found` and `not_per_side` are fixed
* by choosing a different Rep. `reupload`: `transcription_failed`, `transcription_timed_out` and
* `processing_failed` may be transient, so a same-Deal re-upload of the same content re-queues the
* Call. `delete_and_upload`: `too_many_speakers`, `no_turns`, `too_few_speakers`, `too_long` and
* `unreadable` come from the file itself, so the Call must be deleted and a corrected file uploaded.
*/
declare const CALL_FAILURE_FIXES: Readonly<Record<CallFailureReason, CallFailureFix>>;
/**
* Whether a same-Deal re-upload of identical content re-queues a `failed` Call: only for a reason
* that can be transient (`reupload` in {@link CALL_FAILURE_FIXES}). For any other reason the upload
* answers 200 with the failed Call unchanged, as the same file would fail the same way.
*/
declare function callReuploadRequeues(failureReason: CallFailureReason | null): boolean;
/**
* Whether a Call's Rep may be picked or changed: when it is `ready` or `awaiting_rep`, or `failed`
* with a reason a different Rep can fix (`rep_label_not_found`, `not_per_side`). Any other state
* or reason is `call.rep_not_changeable`.
*/
declare function repChangeAllowed(state: CallState, failureReason: CallFailureReason | null): boolean;
/**
* A Call as the service returns it. It names the file and the Deal but never carries a Transcript,
* audio or any turn (only the short `speakers` excerpts below). `kind` is what it was uploaded as. `rep` is the chosen Rep and is `null`
* exactly while the state is `awaiting_rep` (and for a Recording not yet transcribed or failed
* before a choice); a `ready` Call always has one. `speakerLabels` are the labels the Call's
* speakers carry (those of the file, or `A`, `B` from the transcriber), at most
* `MAX_CALL_SPEAKERS`, for the portal's Rep pick; they are untrusted text. `failureReason` is set
* exactly when `state` is `failed`; `deletedAt` and `purgeAt` exactly when it is `deleted`. A
* Transcript is never `transcribing` or `awaiting_rep`, has no duration and is within
* `MAX_TRANSCRIPT_BYTES`; `kind` agrees with `mediaType` (text for a Transcript, audio for a
* Recording); the labels are unique; and a `ready` Call's speaker Rep is one of them. A Call with
* more speakers than `MAX_CALL_SPEAKERS` fails with `too_many_speakers`, lists no speaker labels and
* never reaches a response with more than the cap, so a read route cannot throw on it. `durationSeconds` is `null` for a
* Transcript and until a Recording has been read. `dealRecordId` is the Deal's opaque id (the one
* a Deal's path uses) and `dealOutcome` its Outcome; `inSearch` is true only for a `ready` Call of a
* `won` Deal, and may be false for a Call whose Deal has just become won until the re-tag job
* finishes (the database decides, the index may lag). `dealId` is the customer's text and is never
* logged. The service must send the output of
* `callSchema.parse(row)`, never the row.
*
* `speakers` is optional: a short excerpt per speaker label ({@link speakerExcerpt}, 1 to
* `MAX_SPEAKER_EXCERPT_LENGTH` code points) so a person can tell who is the Rep. It is present
* only for a Recording with labels (above all one in `awaiting_rep`), is never empty, repeats no
* label and names only labels in `speakerLabels`; a speaker with no text is left out. It is tenant
* Transcript text, returned only to the owning Organization's Owner and Admin, and never logged.
*/
declare const callSchema: z27.ZodObject<{
	id: z27.core.$ZodBranded<z27.ZodString, "call", "out">;
	dealId: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	dealRecordId: z27.core.$ZodBranded<z27.ZodString, "deal", "out">;
	dealOutcome: z27.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z27.ZodBoolean;
	kind: z27.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	mediaType: z27.ZodEnum<{
		"application/json": "application/json";
		"application/x-subrip": "application/x-subrip";
		"audio/flac": "audio/flac";
		"audio/mp4": "audio/mp4";
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
		"audio/webm": "audio/webm";
		"text/plain": "text/plain";
		"text/vtt": "text/vtt";
	}>;
	sizeBytes: z27.ZodNumber;
	durationSeconds: z27.ZodNullable<z27.ZodNumber>;
	state: z27.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z27.ZodNullable<z27.ZodEnum<{
		no_turns: "no_turns";
		not_per_side: "not_per_side";
		processing_failed: "processing_failed";
		rep_label_not_found: "rep_label_not_found";
		too_few_speakers: "too_few_speakers";
		too_long: "too_long";
		too_many_speakers: "too_many_speakers";
		transcription_failed: "transcription_failed";
		transcription_timed_out: "transcription_timed_out";
		unreadable: "unreadable";
	}>>;
	rep: z27.ZodNullable<z27.ZodDiscriminatedUnion<[z27.ZodObject<{
		by: z27.ZodLiteral<"speaker">;
		label: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	}, z27.core.$strict>, z27.ZodObject<{
		by: z27.ZodLiteral<"channel">;
		channel: z27.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z27.core.$strict>], "by">>;
	speakerLabels: z27.ZodArray<z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>>;
	speakers: z27.ZodOptional<z27.ZodArray<z27.ZodObject<{
		label: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
		excerpt: z27.ZodString;
	}, z27.core.$strict>>>;
	deletedAt: z27.ZodNullable<z27.ZodISODateTime>;
	purgeAt: z27.ZodNullable<z27.ZodISODateTime>;
	uploadedByUserId: z27.core.$ZodBranded<z27.ZodString, "usr", "out">;
	createdAt: z27.ZodISODateTime;
	updatedAt: z27.ZodISODateTime;
}, z27.core.$strip>;
/** A Call as the service returns it. */
type Call = z27.infer<typeof callSchema>;
/** The most characters the `rep` form field may hold; a longer text is refused without being parsed. */
declare const MAX_REP_FIELD_LENGTH = 512;
/**
* The text fields of the multipart upload of a Call, beside the one file part
* ({@link UPLOAD_FILE_FIELD} `file`, as for a document): `dealId` (a deal id; a Deal that does not
* exist is created `open`) and `rep`, the {@link repChoiceSchema} as JSON text, which is a speaker
* label for a Transcript, a channel for a per-side Recording (the uploader declares it), or absent
* for a Recording that will wait in `awaiting_rep`. The request carries an `Idempotency-Key`
* header. Parse the text of `rep` with {@link parseRepField}.
*/
declare const uploadCallFieldsSchema: z27.ZodObject<{
	dealId: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	rep: z27.ZodOptional<z27.ZodString>;
}, z27.core.$strict>;
/** The text fields of the multipart upload of a Call. */
type UploadCallFields = z27.infer<typeof uploadCallFieldsSchema>;
/** What {@link parseRepField} answers: a Rep choice, no Rep at all (the field was not sent), or an invalid field. */
type ParseRepFieldResult = {
	readonly ok: true;
	readonly rep: RepChoice | null;
} | {
	readonly ok: false;
	readonly code: "call.rep_invalid";
};
/**
* Reads the `rep` form field. An absent field (`undefined`) is `{ ok: true, rep: null }`, which
* suits a Recording that will wait in `awaiting_rep`; a field that is present but empty, longer
* than {@link MAX_REP_FIELD_LENGTH}, not JSON or not a valid Rep choice is `call.rep_invalid`
* (422), never silently treated as absent. It never throws.
*/
declare function parseRepField(text: string | undefined): ParseRepFieldResult;
/** The path parameters of a request about one Call. */
declare const callParamsSchema: z27.ZodObject<{
	callId: z27.core.$ZodBranded<z27.ZodString, "call", "out">;
}, z27.core.$strict>;
/** The path parameters of a request about one Call. */
type CallParams = z27.infer<typeof callParamsSchema>;
/**
* The query parameters of a request to list Calls: a page, and optionally one `state` and one
* `dealRecordId` (the Deal's opaque id; the customer's deal id never goes in a query string). With no `state`, every Call that is not `deleted` is listed; `state=deleted` lists
* those that can still be restored, and `state=awaiting_rep` the ones waiting for a Rep. An
* unknown parameter is rejected.
*/
declare const listCallsQuerySchema: z27.ZodObject<{
	cursor: z27.ZodOptional<z27.ZodString>;
	limit: z27.ZodDefault<z27.ZodPipe<z27.ZodPipe<z27.ZodUnion<readonly [z27.ZodNumber, z27.ZodString]>, z27.ZodTransform<number, string | number>>, z27.ZodNumber>>;
	state: z27.ZodOptional<z27.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>>;
	dealRecordId: z27.ZodOptional<z27.core.$ZodBranded<z27.ZodString, "deal", "out">>;
}, z27.core.$strict>;
/** The query parameters of a request to list Calls. */
type ListCallsQuery = z27.infer<typeof listCallsQuerySchema>;
/**
* A Call in a list: a {@link callSchema} Call without `speakers`, and strict, so one that carries
* excerpts is refused. Only the single-Call read returns speaker excerpts, which keeps a page of up
* to 100 Calls from carrying up to 20 excerpts each of tenant Transcript text.
*/
declare const callListItemSchema: z27.ZodObject<{
	id: z27.core.$ZodBranded<z27.ZodString, "call", "out">;
	dealId: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	dealRecordId: z27.core.$ZodBranded<z27.ZodString, "deal", "out">;
	dealOutcome: z27.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z27.ZodBoolean;
	kind: z27.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	mediaType: z27.ZodEnum<{
		"application/json": "application/json";
		"application/x-subrip": "application/x-subrip";
		"audio/flac": "audio/flac";
		"audio/mp4": "audio/mp4";
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
		"audio/webm": "audio/webm";
		"text/plain": "text/plain";
		"text/vtt": "text/vtt";
	}>;
	sizeBytes: z27.ZodNumber;
	durationSeconds: z27.ZodNullable<z27.ZodNumber>;
	state: z27.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z27.ZodNullable<z27.ZodEnum<{
		no_turns: "no_turns";
		not_per_side: "not_per_side";
		processing_failed: "processing_failed";
		rep_label_not_found: "rep_label_not_found";
		too_few_speakers: "too_few_speakers";
		too_long: "too_long";
		too_many_speakers: "too_many_speakers";
		transcription_failed: "transcription_failed";
		transcription_timed_out: "transcription_timed_out";
		unreadable: "unreadable";
	}>>;
	rep: z27.ZodNullable<z27.ZodDiscriminatedUnion<[z27.ZodObject<{
		by: z27.ZodLiteral<"speaker">;
		label: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	}, z27.core.$strict>, z27.ZodObject<{
		by: z27.ZodLiteral<"channel">;
		channel: z27.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z27.core.$strict>], "by">>;
	speakerLabels: z27.ZodArray<z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>>;
	deletedAt: z27.ZodNullable<z27.ZodISODateTime>;
	purgeAt: z27.ZodNullable<z27.ZodISODateTime>;
	uploadedByUserId: z27.core.$ZodBranded<z27.ZodString, "usr", "out">;
	createdAt: z27.ZodISODateTime;
	updatedAt: z27.ZodISODateTime;
}, z27.core.$strict>;
/** One page of Calls, without speaker excerpts. */
declare const listCallsResponseSchema: z27.ZodObject<{
	items: z27.ZodArray<z27.ZodObject<{
		id: z27.core.$ZodBranded<z27.ZodString, "call", "out">;
		dealId: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
		dealRecordId: z27.core.$ZodBranded<z27.ZodString, "deal", "out">;
		dealOutcome: z27.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		inSearch: z27.ZodBoolean;
		kind: z27.ZodEnum<{
			recording: "recording";
			transcript: "transcript";
		}>;
		fileName: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
		mediaType: z27.ZodEnum<{
			"application/json": "application/json";
			"application/x-subrip": "application/x-subrip";
			"audio/flac": "audio/flac";
			"audio/mp4": "audio/mp4";
			"audio/mpeg": "audio/mpeg";
			"audio/ogg": "audio/ogg";
			"audio/wav": "audio/wav";
			"audio/webm": "audio/webm";
			"text/plain": "text/plain";
			"text/vtt": "text/vtt";
		}>;
		sizeBytes: z27.ZodNumber;
		durationSeconds: z27.ZodNullable<z27.ZodNumber>;
		state: z27.ZodEnum<{
			awaiting_rep: "awaiting_rep";
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			transcribing: "transcribing";
			uploaded: "uploaded";
		}>;
		failureReason: z27.ZodNullable<z27.ZodEnum<{
			no_turns: "no_turns";
			not_per_side: "not_per_side";
			processing_failed: "processing_failed";
			rep_label_not_found: "rep_label_not_found";
			too_few_speakers: "too_few_speakers";
			too_long: "too_long";
			too_many_speakers: "too_many_speakers";
			transcription_failed: "transcription_failed";
			transcription_timed_out: "transcription_timed_out";
			unreadable: "unreadable";
		}>>;
		rep: z27.ZodNullable<z27.ZodDiscriminatedUnion<[z27.ZodObject<{
			by: z27.ZodLiteral<"speaker">;
			label: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
		}, z27.core.$strict>, z27.ZodObject<{
			by: z27.ZodLiteral<"channel">;
			channel: z27.ZodEnum<{
				left: "left";
				right: "right";
			}>;
		}, z27.core.$strict>], "by">>;
		speakerLabels: z27.ZodArray<z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>>;
		deletedAt: z27.ZodNullable<z27.ZodISODateTime>;
		purgeAt: z27.ZodNullable<z27.ZodISODateTime>;
		uploadedByUserId: z27.core.$ZodBranded<z27.ZodString, "usr", "out">;
		createdAt: z27.ZodISODateTime;
		updatedAt: z27.ZodISODateTime;
	}, z27.core.$strict>>;
	nextCursor: z27.ZodNullable<z27.ZodString>;
}, z27.core.$strip>;
/** One page of Calls. */
type ListCallsResponse = z27.infer<typeof listCallsResponseSchema>;
/**
* The body of the request that picks or changes a Call's Rep: a required choice (`null` is not a
* choice). It is for a Call `awaiting_rep`, `ready` or `failed`, otherwise `call.rep_not_changeable`;
* a choice that does not suit the Call's kind or, for a speaker, is not among its labels is
* `call.rep_invalid`. It is idempotent by end state.
*/
declare const setCallRepRequestSchema: z27.ZodObject<{
	rep: z27.ZodDiscriminatedUnion<[z27.ZodObject<{
		by: z27.ZodLiteral<"speaker">;
		label: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	}, z27.core.$strict>, z27.ZodObject<{
		by: z27.ZodLiteral<"channel">;
		channel: z27.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z27.core.$strict>], "by">;
}, z27.core.$strict>;
/** The body of the request that picks or changes a Call's Rep. */
type SetCallRepRequest = z27.infer<typeof setCallRepRequestSchema>;
/** What the service reads off the file part of a Call upload, and the kind it was recognised as. */
declare const uploadCallFileSchema: z27.ZodObject<{
	fileName: z27.ZodPipe<z27.ZodPipe<z27.ZodString, z27.ZodTransform<string, string>>, z27.ZodString>;
	declaredMediaType: z27.ZodNullable<z27.ZodString>;
	sizeBytes: z27.ZodNumber;
}, z27.core.$strict>;
/** The answer of {@link checkCallFile}: the parsed file and its kind, or the one error code to return. */
type CheckCallFileResult = {
	readonly ok: true;
	readonly kind: CallKind;
	readonly file: z27.infer<typeof uploadCallFileSchema>;
} | {
	readonly ok: false;
	readonly code: "call.too_large" | "call.unsupported_type" | "request.invalid";
};
/**
* The one call that checks the file part of a Call upload, in the style of `checkUploadFile`. It
* runs the size check first against the largest limit (`MAX_RECORDING_BYTES`, `call.too_large`
* 413), then the type on the stored form of the name (`call.unsupported_type` 415: the extension
* is judged after control and bidirectional characters are stripped and the name trimmed), then
* the limit of the recognised kind (a Transcript over `MAX_TRANSCRIPT_BYTES` is `call.too_large`),
* then the shape (`request.invalid`). The kind comes from the extension; the service confirms it
* from the content. Fields are read once, as own properties, into a copy all checks use, and a
* non-finite size, a missing field or an extra own key is `request.invalid`. The Recording's
* duration is not known here: the job checks `MAX_RECORDING_SECONDS`. The result carries no name or
* content, so it is safe to log.
*/
declare function checkCallFile(input: unknown): CheckCallFileResult;
/** The position a Call list continues from: `createdAt`, then the Call's own `id`. It never holds a deal id. */
declare const callCursorSchema: z27.ZodObject<{
	createdAt: z27.ZodISODateTime;
	id: z27.core.$ZodBranded<z27.ZodString, "call", "out">;
}, z27.core.$strict>;
/** The position a Call list continues from. */
type CallCursor = z27.infer<typeof callCursorSchema>;
import { z as z28 } from "zod";
/**
* A Deal as the service returns it. A Deal is named by the Organization's own `dealId` (customer
* text, never logged, never in a URL path) and addressed by its opaque `id` (`deal_…`). It is never
* deleted on its own in phase 1. `closedAt` is a calendar date `YYYY-MM-DD`
* (no time, no time zone; a timestamp until 0.11.0). An `open` Deal may carry a `closedAt`, an expected close date from
* a CRM; an `amount` always comes with a `currency`. `closedAt`, `amount`, `currency` and `name` are `null`
* until given. `callCount` counts Calls that are not deleted. `appearedInImport` is false for a
* Deal created by a Call upload that no CSV has named, so the portal can list likely typos. The
* Outcome sequence the re-tag job uses is not here. The service must send the output of
* `dealSchema.parse(row)`.
*/
declare const dealSchema: z28.ZodObject<{
	id: z28.core.$ZodBranded<z28.ZodString, "deal", "out">;
	dealId: z28.ZodPipe<z28.ZodPipe<z28.ZodString, z28.ZodTransform<string, string>>, z28.ZodString>;
	name: z28.ZodNullable<z28.ZodPipe<z28.ZodString, z28.ZodString>>;
	outcome: z28.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z28.ZodNullable<z28.ZodISODate>;
	amount: z28.ZodNullable<z28.ZodString>;
	currency: z28.ZodNullable<z28.ZodString>;
	callCount: z28.ZodNumber;
	appearedInImport: z28.ZodBoolean;
	createdAt: z28.ZodISODateTime;
	updatedAt: z28.ZodISODateTime;
}, z28.core.$strip>;
/** A Deal as the service returns it. */
type Deal = z28.infer<typeof dealSchema>;
/** The path parameters of a request about one Deal: its opaque id, never the customer's deal id. */
declare const dealParamsSchema: z28.ZodObject<{
	dealRecordId: z28.core.$ZodBranded<z28.ZodString, "deal", "out">;
}, z28.core.$strict>;
/** The path parameters of a request about one Deal. */
type DealParams = z28.infer<typeof dealParamsSchema>;
/**
* The query parameters of a request to list Deals: a page, and optionally one `outcome` and
* `appearedInImport` (`true` or `false`). `appearedInImport=false` lists the Deals that have Calls
* but never appeared in a CSV. An unknown parameter is rejected.
*/
declare const listDealsQuerySchema: z28.ZodObject<{
	cursor: z28.ZodOptional<z28.ZodString>;
	limit: z28.ZodDefault<z28.ZodPipe<z28.ZodPipe<z28.ZodUnion<readonly [z28.ZodNumber, z28.ZodString]>, z28.ZodTransform<number, string | number>>, z28.ZodNumber>>;
	outcome: z28.ZodOptional<z28.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>>;
	appearedInImport: z28.ZodOptional<z28.ZodPipe<z28.ZodEnum<{
		false: "false";
		true: "true";
	}>, z28.ZodTransform<boolean, "false" | "true">>>;
}, z28.core.$strict>;
/** The query parameters of a request to list Deals. */
type ListDealsQuery = z28.infer<typeof listDealsQuerySchema>;
/** One page of Deals. */
declare const listDealsResponseSchema: z28.ZodObject<{
	items: z28.ZodArray<z28.ZodObject<{
		id: z28.core.$ZodBranded<z28.ZodString, "deal", "out">;
		dealId: z28.ZodPipe<z28.ZodPipe<z28.ZodString, z28.ZodTransform<string, string>>, z28.ZodString>;
		name: z28.ZodNullable<z28.ZodPipe<z28.ZodString, z28.ZodString>>;
		outcome: z28.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		closedAt: z28.ZodNullable<z28.ZodISODate>;
		amount: z28.ZodNullable<z28.ZodString>;
		currency: z28.ZodNullable<z28.ZodString>;
		callCount: z28.ZodNumber;
		appearedInImport: z28.ZodBoolean;
		createdAt: z28.ZodISODateTime;
		updatedAt: z28.ZodISODateTime;
	}, z28.core.$strip>>;
	nextCursor: z28.ZodNullable<z28.ZodString>;
}, z28.core.$strip>;
/** One page of Deals. */
type ListDealsResponse = z28.infer<typeof listDealsResponseSchema>;
/**
* The body of the request that sets or corrects a Deal's Outcome (Owner and Admin, any Deal, even
* a decided one): the `outcome` and an optional `closedAt`, which an `open` Deal may carry too (an
* expected close date), as in the CSV. It is idempotent by end state, and a change queues the
* re-tag of the Deal's Moments.
*/
declare const setDealOutcomeRequestSchema: z28.ZodObject<{
	outcome: z28.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z28.ZodOptional<z28.ZodNullable<z28.ZodISODate>>;
}, z28.core.$strict>;
/** The body of the request that sets or corrects a Deal's Outcome. */
type SetDealOutcomeRequest = z28.infer<typeof setDealOutcomeRequestSchema>;
/**
* The body of the request that finds a Deal by the customer's deal id, so the id goes in a POST
* body and never in a URL. The answer is the Deal, or `deal.not_found`. Matching is exact after the
* trim.
*/
declare const lookupDealRequestSchema: z28.ZodObject<{
	dealId: z28.ZodPipe<z28.ZodPipe<z28.ZodString, z28.ZodTransform<string, string>>, z28.ZodString>;
}, z28.core.$strict>;
/** The body of the request that finds a Deal by the customer's deal id. */
type LookupDealRequest = z28.infer<typeof lookupDealRequestSchema>;
/** The position a Deal list continues from: `createdAt`, then the Deal's opaque `id`, never the customer's deal id. */
declare const dealCursorSchema: z28.ZodObject<{
	createdAt: z28.ZodISODateTime;
	id: z28.core.$ZodBranded<z28.ZodString, "deal", "out">;
}, z28.core.$strict>;
/** The position a Deal list continues from. */
type DealCursor = z28.infer<typeof dealCursorSchema>;
/** The position a Deal import list continues from: `createdAt`, then the import's `id`. */
declare const dealImportCursorSchema: z28.ZodObject<{
	createdAt: z28.ZodISODateTime;
	id: z28.core.$ZodBranded<z28.ZodString, "dimp", "out">;
}, z28.core.$strict>;
/** The position a Deal import list continues from. */
type DealImportCursor = z28.infer<typeof dealImportCursorSchema>;
/** The position an import report continues from: the `rowNumber` of the last row returned. */
declare const dealImportRowCursorSchema: z28.ZodObject<{
	rowNumber: z28.ZodNumber;
}, z28.core.$strict>;
/** The position an import report continues from. */
type DealImportRowCursor = z28.infer<typeof dealImportRowCursorSchema>;
/** The fields of the multipart upload of a Deal import: the CSV is the one file part (`file`), with no other part. The request carries an `Idempotency-Key` header. */
declare const DEAL_IMPORT_FILE_FIELD = "file";
/**
* A Deal import as the service returns it. It carries no file name and no cell. The counts are
* `null` until `completed`; `failureReason` is set exactly when `state` is `failed`. The report is
* the paginated rows ({@link listDealImportRowsResponseSchema}).
*/
declare const dealImportSchema: z28.ZodObject<{
	id: z28.core.$ZodBranded<z28.ZodString, "dimp", "out">;
	state: z28.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z28.ZodNullable<z28.ZodEnum<{
		processing_failed: "processing_failed";
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z28.ZodNullable<z28.ZodNumber>;
	appliedCount: z28.ZodNullable<z28.ZodNumber>;
	rejectedCount: z28.ZodNullable<z28.ZodNumber>;
	uploadedByUserId: z28.core.$ZodBranded<z28.ZodString, "usr", "out">;
	createdAt: z28.ZodISODateTime;
	updatedAt: z28.ZodISODateTime;
}, z28.core.$strip>;
/** A Deal import as the service returns it. */
type DealImport = z28.infer<typeof dealImportSchema>;
/** The path parameters of a request about one Deal import. */
declare const dealImportParamsSchema: z28.ZodObject<{
	importId: z28.core.$ZodBranded<z28.ZodString, "dimp", "out">;
}, z28.core.$strict>;
/** The path parameters of a request about one Deal import. */
type DealImportParams = z28.infer<typeof dealImportParamsSchema>;
/** The query parameters of a request to list Deal imports: a page. An unknown parameter is rejected. */
declare const listDealImportsQuerySchema: z28.ZodObject<{
	cursor: z28.ZodOptional<z28.ZodString>;
	limit: z28.ZodDefault<z28.ZodPipe<z28.ZodPipe<z28.ZodUnion<readonly [z28.ZodNumber, z28.ZodString]>, z28.ZodTransform<number, string | number>>, z28.ZodNumber>>;
}, z28.core.$strict>;
/** The query parameters of a request to list Deal imports. */
type ListDealImportsQuery = z28.infer<typeof listDealImportsQuerySchema>;
/** One page of Deal imports. */
declare const listDealImportsResponseSchema: z28.ZodObject<{
	items: z28.ZodArray<z28.ZodObject<{
		id: z28.core.$ZodBranded<z28.ZodString, "dimp", "out">;
		state: z28.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z28.ZodNullable<z28.ZodEnum<{
			processing_failed: "processing_failed";
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z28.ZodNullable<z28.ZodNumber>;
		appliedCount: z28.ZodNullable<z28.ZodNumber>;
		rejectedCount: z28.ZodNullable<z28.ZodNumber>;
		uploadedByUserId: z28.core.$ZodBranded<z28.ZodString, "usr", "out">;
		createdAt: z28.ZodISODateTime;
		updatedAt: z28.ZodISODateTime;
	}, z28.core.$strip>>;
	nextCursor: z28.ZodNullable<z28.ZodString>;
}, z28.core.$strip>;
/** One page of Deal imports. */
type ListDealImportsResponse = z28.infer<typeof listDealImportsResponseSchema>;
/**
* One row of an import report: the CSV `rowNumber`, the record number with the header as record 1
* (so the first data row is 2). A quoted cell that spans lines is one record, so `rowNumber` can
* differ from the physical line (see `parseCsv`),
* the `dealId` (the one free-text cell echoed; `null` when the cell was missing or not a valid deal
* id, so a bad cell is never echoed), the `result` and, for a rejected row, the `reason`. `reason`
* is `null` exactly when the result is `applied`. No other cell is ever part of a report.
*/
declare const dealImportRowSchema: z28.ZodObject<{
	rowNumber: z28.ZodNumber;
	dealId: z28.ZodNullable<z28.ZodPipe<z28.ZodPipe<z28.ZodString, z28.ZodTransform<string, string>>, z28.ZodString>>;
	result: z28.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>;
	reason: z28.ZodNullable<z28.ZodEnum<{
		blank_row: "blank_row";
		deal_limit_reached: "deal_limit_reached";
		duplicate_in_file: "duplicate_in_file";
		invalid_amount: "invalid_amount";
		invalid_closed_at: "invalid_closed_at";
		invalid_currency: "invalid_currency";
		invalid_deal_id: "invalid_deal_id";
		invalid_name: "invalid_name";
		invalid_outcome: "invalid_outcome";
		outcome_already_decided: "outcome_already_decided";
		wrong_column_count: "wrong_column_count";
	}>>;
}, z28.core.$strip>;
/** One row of an import report. */
type DealImportRow = z28.infer<typeof dealImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page, and optionally only the `rejected` or only the `applied` rows. Rows are in CSV order. An unknown parameter is rejected. */
declare const listDealImportRowsQuerySchema: z28.ZodObject<{
	cursor: z28.ZodOptional<z28.ZodString>;
	limit: z28.ZodDefault<z28.ZodPipe<z28.ZodPipe<z28.ZodUnion<readonly [z28.ZodNumber, z28.ZodString]>, z28.ZodTransform<number, string | number>>, z28.ZodNumber>>;
	result: z28.ZodOptional<z28.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>>;
}, z28.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListDealImportRowsQuery = z28.infer<typeof listDealImportRowsQuerySchema>;
/** One page of an import report. */
declare const listDealImportRowsResponseSchema: z28.ZodObject<{
	items: z28.ZodArray<z28.ZodObject<{
		rowNumber: z28.ZodNumber;
		dealId: z28.ZodNullable<z28.ZodPipe<z28.ZodPipe<z28.ZodString, z28.ZodTransform<string, string>>, z28.ZodString>>;
		result: z28.ZodEnum<{
			applied: "applied";
			rejected: "rejected";
		}>;
		reason: z28.ZodNullable<z28.ZodEnum<{
			blank_row: "blank_row";
			deal_limit_reached: "deal_limit_reached";
			duplicate_in_file: "duplicate_in_file";
			invalid_amount: "invalid_amount";
			invalid_closed_at: "invalid_closed_at";
			invalid_currency: "invalid_currency";
			invalid_deal_id: "invalid_deal_id";
			invalid_name: "invalid_name";
			invalid_outcome: "invalid_outcome";
			outcome_already_decided: "outcome_already_decided";
			wrong_column_count: "wrong_column_count";
		}>>;
	}, z28.core.$strip>>;
	nextCursor: z28.ZodNullable<z28.ZodString>;
}, z28.core.$strip>;
/** One page of an import report. */
type ListDealImportRowsResponse = z28.infer<typeof listDealImportRowsResponseSchema>;
import { z as z29 } from "zod";
/** The Outcome of a Deal: `won`, `lost` or still `open` (glossary). */
declare const OUTCOMES: readonly ["won", "lost", "open"];
/** The Outcome of a Deal. */
declare const outcomeSchema: z29.ZodEnum<{
	lost: "lost";
	open: "open";
	won: "won";
}>;
/** The Outcome of a Deal. */
type Outcome = z29.infer<typeof outcomeSchema>;
/** The ticket's choice (ADR 0018 leaves it open): the longest deal id, in Unicode code points, after trimming. */
declare const MAX_DEAL_ID_LENGTH = 128;
/** The most UTF-8 bytes a stored deal id can take: 128 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_ID_BYTES: number;
/**
* Normalises a deal id: trims surrounding whitespace and changes nothing else. The comparison is
* exact and case-sensitive (`A-1` and `a-1` are two Deals) with no Unicode normalisation, as ADR
* 0018 says, so two ids are the same only if they are the same code points after the trim.
*/
declare function normaliseDealId(dealId: string): string;
/**
* A deal id (the Organization's own identifier for a Deal), in a body, a CSV cell, the upload field,
* a list filter and a response, never in a URL path (a Deal's path id is the opaque `deal_…` id): at
* most 1000 raw Unicode code points, trimmed, then 1 to 128 Unicode code points (at most
* `MAX_DEAL_ID_BYTES` bytes in UTF-8), well-formed, with no control character, bidirectional
* character, Unicode format character (category Cf, so no soft hyphen, zero-width, word joiner or
* tag character), line or paragraph separator or Hangul filler; homoglyphs are accepted and stay
* distinct ids. It is customer-chosen text that may hold a person's or a company's name, so it is
* never logged. Unlike a file name it is rejected, not stripped, because stripping could make two
* ids equal. It is compared exactly and case-sensitively after the trim ({@link normaliseDealId}).
* It is the only free-text cell an import report may echo, and untrusted text for display.
*/
declare const dealIdSchema: z29.ZodPipe<z29.ZodPipe<z29.ZodString, z29.ZodTransform<string, string>>, z29.ZodString>;
/** A deal id. */
type DealId = z29.infer<typeof dealIdSchema>;
/** The longest Deal name, in Unicode code points, once trimmed. */
declare const MAX_DEAL_NAME_LENGTH = 200;
/** The most UTF-8 bytes a stored Deal name can take: 200 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_NAME_BYTES: number;
/** A Deal's optional name: trimmed, 1 to 200 well-formed Unicode code points (at most `MAX_DEAL_NAME_BYTES` bytes), no control character. Untrusted text for display, never logged. */
declare const dealNameSchema: z29.ZodPipe<z29.ZodString, z29.ZodString>;
/** A money amount as a decimal string, never a float: not negative, at most 15 integer digits (the maximum is 999999999999999.99) and 2 fraction digits, no leading zero beyond a single `0`. */
declare const dealAmountSchema: z29.ZodString;
/** A currency as an upper-case ISO 4217 code of three letters. */
declare const dealCurrencySchema: z29.ZodString;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest CSV accepted, 10 MB counted as 10 * 1024 * 1024 bytes. */
declare const MAX_DEAL_IMPORT_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the most data rows in one CSV. */
declare const MAX_DEAL_IMPORT_ROWS = 5e4;
/** The most Deal imports one Organization may have not yet finished (state `uploaded` or `processing`); a further upload is refused with `deal_import.busy` (429). */
declare const MAX_QUEUED_DEAL_IMPORTS = 5;
/** The required columns of the CSV template, in order. */
declare const DEAL_IMPORT_REQUIRED_COLUMNS: readonly ["deal_id", "outcome", "closed_at", "amount", "currency"];
/** The optional column of the CSV template, which may follow the required ones. */
declare const DEAL_IMPORT_OPTIONAL_COLUMN = "name";
/** The longest header, its trimmed cells joined by commas, in characters; a longer one is refused. A valid header is under 50, so this only bounds padding-free garbage. It is about the trimmed content, not how much of the file is read: that is {@link DEAL_IMPORT_HEADER_PREFIX_CHARS}. */
declare const MAX_DEAL_IMPORT_HEADER_LENGTH = 1024;
/**
* How much of the start of the file the upload route passes to {@link checkDealImportHeaderText}:
* 8192 characters, more than the largest header that is valid under the cell limit (six cells of
* 1000 characters, each also quoted, plus separators, a byte order mark and a line break, about
* 6020). A header record that is still not finished at the end of a full prefix cannot be judged, so
* the early check answers `{ ok: true, deferred: true }` (no refusal) and leaves the verdict to the
* job; it never refuses a header it has only seen part of.
*/
declare const DEAL_IMPORT_HEADER_PREFIX_CHARS = 8192;
/** Why a CSV header was refused: a closed list, so the answer never echoes a cell. */
declare const DEAL_IMPORT_HEADER_PROBLEMS: readonly ["empty", "too_long", "missing_column", "unexpected_column", "wrong_order", "malformed_csv"];
/** Why a CSV header was refused. */
type DealImportHeaderProblem = (typeof DEAL_IMPORT_HEADER_PROBLEMS)[number];
/** The answer of {@link checkDealImportHeader}. */
type CheckDealImportHeaderResult = {
	readonly ok: true;
	readonly hasName: boolean;
} | {
	readonly ok: false;
	readonly code: "deal_import.header_invalid";
	readonly problem: DealImportHeaderProblem;
};
/**
* Checks the first record of a CSV against the fixed template: `deal_id,outcome,closed_at,amount,
* currency` in that order, optionally followed by `name`. Column names are lower case and exact;
* each cell is trimmed. It takes the record as {@link parseCsv} or {@link firstCsvRecord} produced
* it, so quoting, a byte order mark and every line ending are already handled and both readers give
* one verdict. A refusal is `deal_import.header_invalid` (422) and names a closed `problem`, never a
* cell. The upload route calls {@link checkDealImportHeaderText} on the start of the file; the job
* re-checks the first record of its full parse with this.
*/
declare function checkDealImportHeader(record: readonly string[]): CheckDealImportHeaderResult;
/** The answer of {@link checkDealImportHeaderText}: the verdict, or `{ ok: true, deferred: true }` when the prefix ended before the header did and the job must decide. */
type CheckDealImportHeaderTextResult = CheckDealImportHeaderResult | {
	readonly ok: true;
	readonly deferred: true;
};
/**
* The early header check of the upload route: reads the first record of the start of the file with
* {@link firstCsvRecord} (the same rules and limits as the full parse) and checks it with
* {@link checkDealImportHeader}. The caller passes the first `DEAL_IMPORT_HEADER_PREFIX_CHARS`
* characters of the file (or all of it if shorter). If that is a full prefix and the header record is
* still unfinished, the answer is `{ ok: true, deferred: true }`, not a refusal. A cell over the limit is
* `too_long` and a quoting error is `malformed_csv`, and the verdict equals the one the job reaches
* from the whole file.
*/
declare function checkDealImportHeaderText(text: string): CheckDealImportHeaderTextResult;
/** The states a Deal import is in: `uploaded`, then `processing`, then `completed` or `failed`. */
declare const DEAL_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of a Deal import. */
declare const dealImportStateSchema: z29.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of a Deal import. */
type DealImportState = z29.infer<typeof dealImportStateSchema>;
/** Why a whole import ended `failed`: a closed list. A bad row is not a failure of the import. */
declare const DEAL_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable", "processing_failed"];
/** Why a whole import ended `failed`. */
declare const dealImportFailureReasonSchema: z29.ZodEnum<{
	processing_failed: "processing_failed";
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import ended `failed`. */
type DealImportFailureReason = z29.infer<typeof dealImportFailureReasonSchema>;
/** The result of one CSV row: `applied`, or `rejected` with a reason. */
declare const DEAL_IMPORT_ROW_RESULTS: readonly ["applied", "rejected"];
/** The result of one CSV row. */
declare const dealImportRowResultSchema: z29.ZodEnum<{
	applied: "applied";
	rejected: "rejected";
}>;
/** The result of one CSV row. */
type DealImportRowResult = z29.infer<typeof dealImportRowResultSchema>;
/**
* Why a row was rejected: a closed list, never a cell. A row is rejected, not silently dropped,
* and never an HTTP error. `outcome_already_decided` is a row for a Deal already `won` or `lost`
* (ADR 0018, choice 5); `duplicate_in_file` is a deal id repeated after its first row; `blank_row`
* is an interior blank line, reported so the report has no gap in its row numbers.
*/
declare const DEAL_IMPORT_ROW_REASONS: readonly ["wrong_column_count", "invalid_deal_id", "duplicate_in_file", "invalid_outcome", "invalid_closed_at", "invalid_amount", "invalid_currency", "invalid_name", "outcome_already_decided", "deal_limit_reached", "blank_row"];
/** Why a row was rejected. */
declare const dealImportRowReasonSchema: z29.ZodEnum<{
	blank_row: "blank_row";
	deal_limit_reached: "deal_limit_reached";
	duplicate_in_file: "duplicate_in_file";
	invalid_amount: "invalid_amount";
	invalid_closed_at: "invalid_closed_at";
	invalid_currency: "invalid_currency";
	invalid_deal_id: "invalid_deal_id";
	invalid_name: "invalid_name";
	invalid_outcome: "invalid_outcome";
	outcome_already_decided: "outcome_already_decided";
	wrong_column_count: "wrong_column_count";
}>;
/** Why a row was rejected. */
type DealImportRowReason = z29.infer<typeof dealImportRowReasonSchema>;
/** The answer of a CSV cell parser: the parsed value, or not valid. */
type CellResult<T> = {
	readonly ok: true;
	readonly value: T;
} | {
	readonly ok: false;
};
/** The earliest year a `closed_at` may have (inclusive), so a typo such as year 0001 or 9999 is caught. */
declare const DEAL_CLOSED_AT_MIN_YEAR = 1970;
/** The latest year a `closed_at` may have (inclusive). */
declare const DEAL_CLOSED_AT_MAX_YEAR = 2100;
/** Reads the `outcome` cell: `won`, `lost` or `open`, compared case-insensitively after trimming. A blank cell is not valid: the column is required. */
declare function parseOutcomeCell(cell: string): CellResult<Outcome>;
/** A calendar date as `YYYY-MM-DD`, with no time and no time zone, a real day (2026-02-30 is refused) in the years 1970 to 2100, as the CSV `closed_at` accepts. Used for a Deal's `closedAt`. */
declare const calendarDateSchema: z29.ZodISODate;
/**
* Reads the `closed_at` cell. Blank is none (`null`); `won` and `lost` do not require it, and an
* `open` Deal may carry an expected close date. Otherwise it is a plain calendar date `YYYY-MM-DD`
* (a real day), kept exactly as written: a value with a time or an offset is not valid (it would
* name a different day in another time zone). The year must be from `DEAL_CLOSED_AT_MIN_YEAR`
* (1970) to `DEAL_CLOSED_AT_MAX_YEAR` (2100) inclusive, else it is not valid.
*/
declare function parseClosedAtCell(cell: string): CellResult<string | null>;
/** Reads the `amount` cell: blank is none; otherwise a non-negative decimal as {@link dealAmountSchema} describes (at most 999999999999999.99). */
declare function parseAmountCell(cell: string): CellResult<string | null>;
/** Reads the `currency` cell: blank is none; otherwise three letters, folded to upper case. A currency is required when an amount is present, which {@link checkDealImportRow} checks. */
declare function parseCurrencyCell(cell: string): CellResult<string | null>;
/** One CSV data row once its cells are read. */
type ParsedDealImportRow = {
	readonly dealId: string;
	readonly outcome: Outcome;
	readonly closedAt: string | null;
	readonly amount: string | null;
	readonly currency: string | null;
	readonly name: string | null;
};
/** The answer of {@link checkDealImportRow}: the parsed row, or the one reason code of the report. */
type CheckDealImportRowResult = {
	readonly ok: true;
	readonly row: ParsedDealImportRow;
} | {
	readonly ok: false;
	readonly reason: DealImportRowReason;
};
/**
* Reads one CSV record's cells (already split, so a quoted cell with a comma or a line break is one
* cell; see {@link parseCsv}) against the template, so the portal and the service agree. Every cell
* is trimmed; blank optional cells are none. Cell count must be 5, or 6 when the header has `name`
* (`wrong_column_count`). The problems are reported in column order and only the first is returned:
* `invalid_deal_id`, `invalid_outcome`, `invalid_closed_at`, `invalid_amount`, `invalid_currency`
* (including an amount with no currency) and `invalid_name`. Whether the Deal is already decided,
* repeated in the file or over the quota is the service's, as those need its data.
*/
declare function checkDealImportRow(cells: readonly string[], hasName: boolean): CheckDealImportRowResult;
/**
* The longest cell {@link parseCsv} reads, in Unicode code points: 1000, the raw bound the deal id
* and Deal name schemas allow before they trim. It only bounds memory; the row checks do the
* reporting, so a name of 201 characters is a rejected row (`invalid_name`) and a valid name padded
* with spaces still imports. A cell over 1000 characters, like a quoting error, fails the whole file.
*/
declare const MAX_DEAL_IMPORT_CELL_LENGTH = 1e3;
/** Why a CSV could not be read: more records than allowed, a cell over the length limit, a quote that never closes, or a quote where RFC 4180 does not allow one. */
declare const CSV_FAILURES: readonly ["too_many_records", "cell_too_long", "unterminated_quote", "bad_quote"];
/** Why a CSV could not be read. */
type CsvFailure = (typeof CSV_FAILURES)[number];
/** The limits of a CSV read. */
type CsvOptions = {
	/** The most records to read, header and blank records included; default `MAX_DEAL_IMPORT_ROWS + 1`. */
	readonly maxRecords?: number;
	/** The longest cell, in Unicode code points; default `MAX_DEAL_IMPORT_CELL_LENGTH`. */
	readonly maxCellLength?: number;
};
/** The answer of {@link parseCsv}: the records, or the failure and how many records were read before it. */
type CsvResult = {
	readonly ok: true;
	readonly records: string[][];
} | {
	readonly ok: false;
	readonly failure: CsvFailure;
	readonly recordsRead: number;
};
/** The answer of {@link firstCsvRecord}: the first record (`undefined` for empty text) and whether a line break ended it, or the failure. */
type FirstCsvRecordResult = {
	readonly ok: true;
	readonly record: string[] | undefined;
	readonly complete: boolean;
} | {
	readonly ok: false;
	readonly failure: CsvFailure;
	readonly recordsRead: number;
};
/**
* Splits CSV text into records of cells under strict RFC 4180: a cell may be double-quoted, `""` is
* a quote inside one, and a quoted cell may hold commas and line breaks; a line break is `\n`, `\r\n`
* or `\r`, a leading byte order mark is dropped, and one final line break does not add a record. A
* quote inside an unquoted cell, or any text between a closing quote and the next comma or line
* break, fails the whole file as `bad_quote`, and a quote that never closes is `unterminated_quote`;
* there is no leniency.
*
* It stops as soon as a limit is passed, having built at most that much: more than
* `options.maxRecords` records is `too_many_records` and a cell longer than `options.maxCellLength`
* code points is `cell_too_long`, each with `recordsRead`. The caller passes
* `maxRecords: MAX_DEAL_IMPORT_ROWS + 1` (the default): the header is record 1, and blank records
* count toward the limit because they cost memory. It needs the whole text in memory (up to
* `MAX_DEAL_IMPORT_BYTES`), so it belongs in a background job, never on a request path; the upload
* route reads only the header, with {@link checkDealImportHeaderText}.
*
* The first record is the header, so the **record number** is the index plus one, with the header
* as record 1: a report's `rowNumber` is a record number, and a quoted cell spanning lines is one
* record, so it can differ from the physical line. A blank line is a record of one empty cell
* ({@link isBlankCsvRecord}); a run of them at the end of the file is dropped, and an interior one is kept, so numbers match what a spreadsheet shows, and the caller
* reports it as a rejected `blank_row` row.
*/
declare function parseCsv(text: string, options?: CsvOptions): CsvResult;
/**
* Reads only the first record of CSV text with the same rules and limits as {@link parseCsv}, and
* stops there: a later bad record does not change its answer. `record` is `undefined` for empty text, and `complete` is whether a line break ended it (false when the text ran out first).
*/
declare function firstCsvRecord(text: string, options?: CsvOptions): FirstCsvRecordResult;
/** Whether a CSV record is a blank line: one empty cell. A caller reports an interior one as a rejected `blank_row` row; it counts in the record number. {@link parseCsv} already drops a trailing run. */
declare function isBlankCsvRecord(record: readonly string[]): boolean;
import { z as z30 } from "zod";
/**
* A Playbook document as the service returns it. It names the file but never carries its content,
* and no text taken from it. The extension of `fileName` and `mediaType` are not checked against each other: that agreement is
* the service's job, as only it knows the declared and the detected type, and the contract does
* not enforce it. `failureReason` is set exactly when `state` is `failed`. `purgeAt` is
* set exactly when `state` is `deleted`: the time the file and record will be purged
* (`DOCUMENT_RETENTION_DAYS` after `deletedAt`); a restore is refused after it. `pageCount` is
* `null` until ingestion has counted the pages. The service must send the output of
* `documentSchema.parse(row)`, never the row.
*/
declare const documentSchema: z30.ZodObject<{
	id: z30.core.$ZodBranded<z30.ZodString, "doc", "out">;
	fileName: z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>;
	mediaType: z30.ZodEnum<{
		"application/pdf": "application/pdf";
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		"text/markdown": "text/markdown";
		"text/plain": "text/plain";
	}>;
	sizeBytes: z30.ZodNumber;
	pageCount: z30.ZodNullable<z30.ZodNumber>;
	state: z30.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>;
	failureReason: z30.ZodNullable<z30.ZodEnum<{
		no_text: "no_text";
		password_protected: "password_protected";
		processing_failed: "processing_failed";
		too_many_pages: "too_many_pages";
		unreadable: "unreadable";
	}>>;
	deletedAt: z30.ZodNullable<z30.ZodISODateTime>;
	purgeAt: z30.ZodNullable<z30.ZodISODateTime>;
	uploadedByUserId: z30.core.$ZodBranded<z30.ZodString, "usr", "out">;
	createdAt: z30.ZodISODateTime;
	updatedAt: z30.ZodISODateTime;
}, z30.core.$strip>;
/** A Playbook document as the service returns it. */
type PlaybookDocument = z30.infer<typeof documentSchema>;
/** The name of the multipart form field that carries the file. */
declare const UPLOAD_FILE_FIELD = "file";
/** The content type of an upload request: `multipart/form-data` with one file part named {@link UPLOAD_FILE_FIELD}. */
declare const UPLOAD_CONTENT_TYPE = "multipart/form-data";
/**
* What the service reads off the file part of an upload before it stores anything: the
* `fileName` of the part, the media type the client declared (`declaredMediaType`, advisory only;
* the service inspects the content too, because an upload is untrusted data) and the `sizeBytes`
* counted while reading. The file itself is a multipart part, not a JSON field, and appears in no
* schema. The request has no other part; it carries an `Idempotency-Key` header.
*
* This schema checks only shape (a well-formed name, a non-empty file) and a failure is
* `request.invalid` (400). A service calls {@link checkUploadFile}, which runs it after the size
* and type checks so each gets its own code.
*/
declare const uploadDocumentFileSchema: z30.ZodObject<{
	fileName: z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>;
	declaredMediaType: z30.ZodNullable<z30.ZodString>;
	sizeBytes: z30.ZodNumber;
}, z30.core.$strict>;
/** What the service reads off the file part of an upload. */
type UploadDocumentFile = z30.infer<typeof uploadDocumentFileSchema>;
/** The path parameters of a request about one document. */
declare const documentParamsSchema: z30.ZodObject<{
	documentId: z30.core.$ZodBranded<z30.ZodString, "doc", "out">;
}, z30.core.$strict>;
/** The path parameters of a request about one document. */
type DocumentParams = z30.infer<typeof documentParamsSchema>;
/**
* The query parameters of a request to list documents: a page, and optionally one `state`. With
* no `state`, every document that is not `deleted` is listed; `state=deleted` lists the documents
* that can still be restored. An unknown parameter is rejected.
*/
declare const listDocumentsQuerySchema: z30.ZodObject<{
	cursor: z30.ZodOptional<z30.ZodString>;
	limit: z30.ZodDefault<z30.ZodPipe<z30.ZodPipe<z30.ZodUnion<readonly [z30.ZodNumber, z30.ZodString]>, z30.ZodTransform<number, string | number>>, z30.ZodNumber>>;
	state: z30.ZodOptional<z30.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>>;
}, z30.core.$strict>;
/** The query parameters of a request to list documents. */
type ListDocumentsQuery = z30.infer<typeof listDocumentsQuerySchema>;
/** One page of documents. */
declare const listDocumentsResponseSchema: z30.ZodObject<{
	items: z30.ZodArray<z30.ZodObject<{
		id: z30.core.$ZodBranded<z30.ZodString, "doc", "out">;
		fileName: z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>;
		mediaType: z30.ZodEnum<{
			"application/pdf": "application/pdf";
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			"text/markdown": "text/markdown";
			"text/plain": "text/plain";
		}>;
		sizeBytes: z30.ZodNumber;
		pageCount: z30.ZodNullable<z30.ZodNumber>;
		state: z30.ZodEnum<{
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			uploaded: "uploaded";
		}>;
		failureReason: z30.ZodNullable<z30.ZodEnum<{
			no_text: "no_text";
			password_protected: "password_protected";
			processing_failed: "processing_failed";
			too_many_pages: "too_many_pages";
			unreadable: "unreadable";
		}>>;
		deletedAt: z30.ZodNullable<z30.ZodISODateTime>;
		purgeAt: z30.ZodNullable<z30.ZodISODateTime>;
		uploadedByUserId: z30.core.$ZodBranded<z30.ZodString, "usr", "out">;
		createdAt: z30.ZodISODateTime;
		updatedAt: z30.ZodISODateTime;
	}, z30.core.$strip>>;
	nextCursor: z30.ZodNullable<z30.ZodString>;
}, z30.core.$strip>;
/** One page of documents. */
type ListDocumentsResponse = z30.infer<typeof listDocumentsResponseSchema>;
/**
* Internal: the path parameters of the call that removes everything an Organization has in the
* Playbook. The Organization is named in the path, never taken from the caller's token.
*/
declare const internalRemoveOrganizationDocumentsParamsSchema: z30.ZodObject<{
	organizationId: z30.core.$ZodBranded<z30.ZodString, "org", "out">;
}, z30.core.$strict>;
/** Internal: the path parameters of the remove-everything call. */
type InternalRemoveOrganizationDocumentsParams = z30.infer<typeof internalRemoveOrganizationDocumentsParamsSchema>;
/**
* Internal: `POST /internal/playbook/organizations/{organizationId}/remove-all`, for offboarding
* and erasure; no caller yet. The body is empty. It cancels ingestion in flight and removes every
* file, chunk, vector and record the Organization has, soft-deleted documents included, without
* waiting for retention. It carries an `Idempotency-Key` header and is defined by its end state:
* it answers success whenever nothing remains when it returns, whether this call, an earlier one
* or nobody ever stored anything, so a repeat under any key answers the same and success does not
* mean this call removed anything. It returns no domain error code.
*/
declare const internalRemoveOrganizationDocumentsRequestSchema: z30.ZodObject<{}, z30.core.$strict>;
/** Internal: the body of the remove-everything call. */
type InternalRemoveOrganizationDocumentsRequest = z30.infer<typeof internalRemoveOrganizationDocumentsRequestSchema>;
/** Internal: the answer to the remove-everything call: always `removed`. */
declare const internalRemoveOrganizationDocumentsResponseSchema: z30.ZodObject<{
	organizationId: z30.core.$ZodBranded<z30.ZodString, "org", "out">;
	status: z30.ZodLiteral<"removed">;
}, z30.core.$strip>;
/** Internal: the answer to the remove-everything call. */
type InternalRemoveOrganizationDocumentsResponse = z30.infer<typeof internalRemoveOrganizationDocumentsResponseSchema>;
/** The answer of {@link checkUploadFile}: the parsed file, or the one error code to return. */
type CheckUploadFileResult = {
	readonly ok: true;
	readonly file: UploadDocumentFile;
} | {
	readonly ok: false;
	readonly code: "document.too_large" | "document.unsupported_type" | "request.invalid";
};
/**
* The one call that checks the file part of an upload, so a service cannot skip a step. It runs
* the size check first (`document.too_large`, 413, so an over-size `.exe` is only too large), then
* the type check on the stored form of the name (`document.unsupported_type`, 415: the extension
* is judged after control and bidirectional characters are stripped and the name is trimmed, so
* `report.pdf ` is accepted and stored as `report.pdf`), then the shape
* ({@link uploadDocumentFileSchema}, `request.invalid`, 400). Input that is not an object with a
* string name and a finite numeric size (so `NaN` and the infinities too), or that has an own key
* other than the three, is `request.invalid`. Each field is read once, as an own property, into a
* copy that all three checks use, so a changing getter or an inherited property cannot pass a check
* the parsed value would fail. On success `file` is the parsed form, with
* the stored name. The result carries no name or content, so it is safe to log and to return.
*/
declare function checkUploadFile(input: unknown): CheckUploadFileResult;
import { z as z31 } from "zod";
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}: the document to ingest. */
declare const documentUploadedPayloadSchema: z31.ZodObject<{
	documentId: z31.core.$ZodBranded<z31.ZodString, "doc", "out">;
}, z31.core.$strict>;
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}. */
type DocumentUploadedPayload = z31.infer<typeof documentUploadedPayloadSchema>;
/**
* The message that starts ingestion of a document: published after an upload is stored, and again
* when a soft-deleted document is restored (it is re-ingested from the kept file). The job is
* idempotent and resumable, keyed on the document.
*/
declare const DOCUMENT_UPLOADED_MESSAGE: {
	readonly type: "playbook.document_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z31.ZodObject<{
		documentId: z31.core.$ZodBranded<z31.ZodString, "doc", "out">;
	}, z31.core.$strict>;
};
/** The largest `deletionSeq`: the db column is a Postgres `integer`, so the message cannot carry more. */
declare const MAX_DELETION_SEQ = 2147483647;
/**
* The payload of {@link DOCUMENT_DELETED_MESSAGE}: the document and its `deletionSeq`, an integer
* from 1 to {@link MAX_DELETION_SEQ} that the service increases in the same write as each delete. The cleanup applies only
* when the document is still `deleted` and its stored sequence equals this one, so a restore, or
* a later delete, makes an older message do nothing. A timestamp is not the guard: Postgres keeps
* microseconds, a JSON timestamp does not, and two deletions can share a clock tick. The sequence
* is not on the public document schema. Only a delete that changes the state bumps it: a repeated
* delete of an already deleted document does not bump the sequence and does not publish again.
*/
declare const documentDeletedPayloadSchema: z31.ZodObject<{
	documentId: z31.core.$ZodBranded<z31.ZodString, "doc", "out">;
	deletionSeq: z31.ZodNumber;
}, z31.core.$strict>;
/** The payload of {@link DOCUMENT_DELETED_MESSAGE}. */
type DocumentDeletedPayload = z31.infer<typeof documentDeletedPayloadSchema>;
/**
* The message that queues the removal of a deleted document's vectors, published by the delete
* request. It is cleanup only: search hides a deleted document by its state, never by this job.
*/
declare const DOCUMENT_DELETED_MESSAGE: {
	readonly type: "playbook.document_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z31.ZodObject<{
		documentId: z31.core.$ZodBranded<z31.ZodString, "doc", "out">;
		deletionSeq: z31.ZodNumber;
	}, z31.core.$strict>;
};
import { z as z32 } from "zod";
/** The largest wording version number; versions are positive integers, one for each entry of `RIGHTS_WORDINGS`. */
declare const MAX_RIGHTS_WORDING_VERSION = 1e6;
/** The version of the rights-confirmation wording: a positive integer. The text of each version is in `RIGHTS_WORDINGS`. */
declare const rightsWordingVersionSchema: z32.ZodNumber;
/**
* The recorded confirmation (ADR 0018, choice 12): that an Owner or Admin confirmed the
* Organization may share its Recordings and Transcripts, with the `wordingVersion` shown, who
* (`confirmedByUserId`) and when. There is one per Organization; a new one replaces it.
*/
declare const rightsConfirmationSchema: z32.ZodObject<{
	wordingVersion: z32.ZodNumber;
	confirmedByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
	confirmedAt: z32.ZodISODateTime;
}, z32.core.$strip>;
/** The recorded confirmation. */
type RightsConfirmation = z32.infer<typeof rightsConfirmationSchema>;
/**
* The answer to reading the confirmation: the `currentWordingVersion` the portal must show,
* the stored `confirmation` (`null` if none) and `confirmed`, true only when the stored version
* is the current one. `currentWording` is the text of the current version, optional so a service
* built before the wording moved into the contract still parses and a consumer reads the text from
* `RIGHTS_WORDINGS` when it is absent.
* The schema does not check that the text belongs to `currentWordingVersion` (a consumer on an older
* library has a shorter version table and must still parse a newer service's answer): a consumer
* shows the text for the version it sends from `rightsWordingFor`, and confirms that version only. Uploads of Calls are refused with `rights.confirmation_required` unless
* `confirmed`; existing Calls stay and stay searchable.
*/
declare const rightsStatusSchema: z32.ZodObject<{
	currentWordingVersion: z32.ZodNumber;
	confirmation: z32.ZodNullable<z32.ZodObject<{
		wordingVersion: z32.ZodNumber;
		confirmedByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
		confirmedAt: z32.ZodISODateTime;
	}, z32.core.$strip>>;
	confirmed: z32.ZodBoolean;
	currentWording: z32.ZodOptional<z32.ZodObject<{
		heading: z32.ZodString;
		paragraphs: z32.ZodArray<z32.ZodString>;
		checkbox: z32.ZodString;
		draft: z32.ZodOptional<z32.ZodLiteral<true>>;
	}, z32.core.$strict>>;
}, z32.core.$strip>;
/** The answer to reading the confirmation. */
type RightsStatus = z32.infer<typeof rightsStatusSchema>;
/**
* The body of the request that records the confirmation: the `wordingVersion` the member was shown,
* which must be the current one (else `rights.version_outdated`). Who and when come from the token
* and the clock, never from the body. Idempotent by end state.
*/
declare const confirmRightsRequestSchema: z32.ZodObject<{
	wordingVersion: z32.ZodNumber;
}, z32.core.$strict>;
/** The body of the request that records the confirmation. */
type ConfirmRightsRequest = z32.infer<typeof confirmRightsRequestSchema>;
import { z as z33 } from "zod";
/** The longest heading of a wording, in Unicode code points. */
declare const MAX_RIGHTS_HEADING_LENGTH = 200;
/** The most paragraphs a wording may have. */
declare const MAX_RIGHTS_PARAGRAPHS = 10;
/** The longest paragraph or confirmation sentence of a wording, in Unicode code points. */
declare const MAX_RIGHTS_TEXT_LENGTH = 2e3;
/**
* The text of one version of the rights confirmation: a `heading`, up to ten `paragraphs` and the
* `checkbox` sentence the member agrees to. It is plain text (no markup) and is shown exactly as
* written, never interpolated with a name or a value. `draft` is true while a lawyer has not
* checked the text; the screen says so.
*/
declare const rightsWordingSchema: z33.ZodObject<{
	heading: z33.ZodString;
	paragraphs: z33.ZodArray<z33.ZodString>;
	checkbox: z33.ZodString;
	draft: z33.ZodOptional<z33.ZodLiteral<true>>;
}, z33.core.$strict>;
/** The text of one version of the rights confirmation. */
type RightsWording = z33.infer<typeof rightsWordingSchema>;
/**
* The text of every version of the rights confirmation (ADR 0018, choice 12), keyed by version,
* frozen. A version is published once and never edited: a change to the text is a new version here
* and therefore a contract release, and the current version below follows from it.
*
* PENDING A LAWYER'S CHECK: version 1 is a draft (the owner decision of 2026-10-14 put the wording
* in the contract; ADR 0018 requires a lawyer to check it before real customers use it). Remove
* `draft` only in a new version, once it has been checked. It is taken verbatim from the portal's
* draft.
*/
declare const RIGHTS_WORDINGS: Readonly<Record<number, RightsWording>>;
/** The current version of the rights wording: the highest key of {@link RIGHTS_WORDINGS}. A service reads it instead of a setting. */
declare const CURRENT_RIGHTS_WORDING_VERSION: number;
/** The text of a version, or undefined when the contract has none; a version without text cannot be confirmed. */
declare function rightsWordingFor(version: number): RightsWording | undefined;
import { z as z34 } from "zod";
/** The largest Outcome or Rep sequence: the db column is a Postgres `integer`, like {@link MAX_DELETION_SEQ}. */
declare const MAX_SEQ = 2147483647;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
declare const callUploadedPayloadSchema: z34.ZodObject<{
	callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
}, z34.core.$strict>;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
type CallUploadedPayload = z34.infer<typeof callUploadedPayloadSchema>;
/** Starts ingestion of a Call: transcription of a Recording, or parsing of a Transcript. Published after the upload is stored and again on restore (the kept Transcript is reused, never transcribed twice). */
declare const CALL_UPLOADED_MESSAGE: {
	readonly type: "playbook.call_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z34.ZodObject<{
		callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
	}, z34.core.$strict>;
};
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
declare const callTranscribedPayloadSchema: z34.ZodObject<{
	callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
}, z34.core.$strict>;
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
type CallTranscribedPayload = z34.infer<typeof callTranscribedPayloadSchema>;
/** Moves a Recording from transcription to building Moments, published when the Transcript is stored and the Rep is known (a per-side Recording, or one whose Rep was picked). A Call with no Rep waits in `awaiting_rep` and publishes `playbook.call_rep_changed` when it is picked. */
declare const CALL_TRANSCRIBED_MESSAGE: {
	readonly type: "playbook.call_transcribed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z34.ZodObject<{
		callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
	}, z34.core.$strict>;
};
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}: the Call and its `repSeq`. */
declare const callRepChangedPayloadSchema: z34.ZodObject<{
	callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
	repSeq: z34.ZodNumber;
}, z34.core.$strict>;
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}. */
type CallRepChangedPayload = z34.infer<typeof callRepChangedPayloadSchema>;
/** Rebuilds a Call's Moments after its Rep is picked or changed. The service bumps `repSeq` in the same write as the change; the job applies only when the Call's stored sequence equals this one, and the Call is out of search until it finishes. */
declare const CALL_REP_CHANGED_MESSAGE: {
	readonly type: "playbook.call_rep_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z34.ZodObject<{
		callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
		repSeq: z34.ZodNumber;
	}, z34.core.$strict>;
};
/** The payload of {@link CALL_DELETED_MESSAGE}: the Call and its `deletionSeq`. */
declare const callDeletedPayloadSchema: z34.ZodObject<{
	callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
	deletionSeq: z34.ZodNumber;
}, z34.core.$strict>;
/** The payload of {@link CALL_DELETED_MESSAGE}. */
type CallDeletedPayload = z34.infer<typeof callDeletedPayloadSchema>;
/** Queues the removal of a deleted Call's Moments and vectors, as `playbook.document_deleted` does for a document: it applies only if the Call is still deleted and its stored `deletionSeq` equals this one. Only a delete that changes the state bumps it or publishes. Search hides a deleted Call by its state, never by this job. */
declare const CALL_DELETED_MESSAGE: {
	readonly type: "playbook.call_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z34.ZodObject<{
		callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
		deletionSeq: z34.ZodNumber;
	}, z34.core.$strict>;
};
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}: the Deal's opaque id (never the customer's text) and its `outcomeSeq`. */
declare const dealOutcomeChangedPayloadSchema: z34.ZodObject<{
	dealRecordId: z34.core.$ZodBranded<z34.ZodString, "deal", "out">;
	outcomeSeq: z34.ZodNumber;
}, z34.core.$strict>;
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}. */
type DealOutcomeChangedPayload = z34.infer<typeof dealOutcomeChangedPayloadSchema>;
/** Re-tags a Deal's Moments in the index after its Outcome changes. The job reads the current Outcome from the database and applies only when the Deal's stored `outcomeSeq` equals this one, so two changes cannot finish in the wrong order. */
declare const DEAL_OUTCOME_CHANGED_MESSAGE: {
	readonly type: "playbook.deal_outcome_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z34.ZodObject<{
		dealRecordId: z34.core.$ZodBranded<z34.ZodString, "deal", "out">;
		outcomeSeq: z34.ZodNumber;
	}, z34.core.$strict>;
};
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
declare const dealImportUploadedPayloadSchema: z34.ZodObject<{
	importId: z34.core.$ZodBranded<z34.ZodString, "dimp", "out">;
}, z34.core.$strict>;
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
type DealImportUploadedPayload = z34.infer<typeof dealImportUploadedPayloadSchema>;
/** Starts the processing of an uploaded CSV. The job is idempotent and resumable, keyed on the import. */
declare const DEAL_IMPORT_UPLOADED_MESSAGE: {
	readonly type: "playbook.deal_import_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z34.ZodObject<{
		importId: z34.core.$ZodBranded<z34.ZodString, "dimp", "out">;
	}, z34.core.$strict>;
};
import { z as z35 } from "zod";
/**
* The states a Playbook document is in, in the order a document passes through them (ADR 0016).
* `deleted` means soft-deleted and awaiting purge. The db library builds its column from this
* same list, so the names are the contract between the two.
*/
declare const DOCUMENT_STATES: readonly ["uploaded", "processing", "ready", "failed", "deleted"];
/** The state of a Playbook document. */
declare const documentStateSchema: z35.ZodEnum<{
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	uploaded: "uploaded";
}>;
/** The state of a Playbook document. */
type DocumentState = z35.infer<typeof documentStateSchema>;
/**
* Why a document ended in `failed`: a closed list the portal maps to its own wording. Never free
* text, so a reason cannot carry the content or name of a file. This list is the lead's reading
* of ADR 0016, which names only the page limit; the owner did not choose the rest.
*/
declare const DOCUMENT_FAILURE_REASONS: readonly ["too_many_pages", "unreadable", "password_protected", "no_text", "processing_failed"];
/** Why a document ended in `failed`. */
declare const documentFailureReasonSchema: z35.ZodEnum<{
	no_text: "no_text";
	password_protected: "password_protected";
	processing_failed: "processing_failed";
	too_many_pages: "too_many_pages";
	unreadable: "unreadable";
}>;
/** Why a document ended in `failed`. */
type DocumentFailureReason = z35.infer<typeof documentFailureReasonSchema>;
/** Owner's choice (ADR 0016, choice 2): the file extensions phase 1 accepts, lower case with the dot. */
declare const ACCEPTED_DOCUMENT_EXTENSIONS: readonly [".pdf", ".docx", ".pptx", ".txt", ".md"];
/** An accepted file extension. */
type AcceptedDocumentExtension = (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number];
/** Owner's choice (ADR 0016, choice 2): the media types phase 1 accepts, one for each accepted extension. */
declare const ACCEPTED_DOCUMENT_MEDIA_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/markdown"];
/** The media type of a stored document, as the service detected it from the content. */
declare const documentMediaTypeSchema: z35.ZodEnum<{
	"application/pdf": "application/pdf";
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	"text/markdown": "text/markdown";
	"text/plain": "text/plain";
}>;
/** The media type of a stored document. */
type DocumentMediaType = z35.infer<typeof documentMediaTypeSchema>;
/** The media type each accepted extension stands for. */
declare const MEDIA_TYPE_BY_EXTENSION: Readonly<Record<AcceptedDocumentExtension, DocumentMediaType>>;
/** Owner's choice (ADR 0016, choice 2): the largest file accepted, 25 MB counted as 25 * 1024 * 1024 bytes. */
declare const MAX_DOCUMENT_BYTES: number;
/** Owner's choice (ADR 0016, choice 2): the most pages a document may have; checked by the ingestion job, not at upload. */
declare const MAX_DOCUMENT_PAGES = 300;
/** The lead's default (ADR 0016), not the owner's: days a soft-deleted document is kept before it is purged. */
declare const DOCUMENT_RETENTION_DAYS = 30;
/** The lead's default (ADR 0016), not the owner's: documents an Organization may hold, soft-deleted ones included until purged. */
declare const DEFAULT_MAX_DOCUMENTS = 500;
/** The lead's default (ADR 0016), not the owner's: bytes an Organization may hold, 2 GB counted as 2 * 1024^3. */
declare const DEFAULT_MAX_DOCUMENT_BYTES_TOTAL: number;
/**
* How lengths are counted in this area: in Unicode code points, as Zod's string `min` and `max`
* count them, so an astral-plane character counts as 1 (not 2 as JavaScript's `.length` has it). A
* database `varchar(n)` or `char_length` check counts code points too, so the column limit is the
* same number; a column must also allow {@link MAX_UTF8_BYTES_PER_CODE_POINT} bytes per code point
* (the most UTF-8 takes), such as `MAX_DOCUMENT_FILE_NAME_BYTES`.
*/
declare const MAX_UTF8_BYTES_PER_CODE_POINT = 4;
/** The longest file name, in Unicode code points, once control and direction characters are stripped. */
declare const MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
/** The most UTF-8 bytes a stored file name can take: 255 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DOCUMENT_FILE_NAME_BYTES: number;
/** The stored form of a file name: control and bidirectional characters removed, then trimmed. */
declare function normaliseFileName(name: string): string;
/** The accepted extension a file name ends with, compared without case, or undefined. */
declare function documentExtension(fileName: string): AcceptedDocumentExtension | undefined;
/**
* A document's file name, in a request and in a response: at most 1000 raw Unicode code points,
* then control and bidirectional characters are removed (not rejected) and the rest is trimmed to
* 1 to 255 well-formed Unicode code points with no `/` or `\` and a visible stem before the last
* dot (`.pdf`, or an invisible character plus `.pdf`, is rejected). It does not check the
* extension: that is {@link documentTypeCheckSchema}, which has its own error code. Parsing a
* stored name yields a safe one. The name is for display only and is never a storage key or a
* path: the service keys storage on the document id. It is stricter than a person's name (which
* keeps direction characters) because a file name is shown beside the person's own text in lists
* and downloads, where a right-to-left override can disguise an extension, and a person's name has
* no extension to disguise. Zero-width characters other than in the stem are allowed, so display
* code must still treat a name as untrusted text. A name is never part of an error body.
*/
declare const documentFileNameSchema: z35.ZodPipe<z35.ZodPipe<z35.ZodString, z35.ZodTransform<string, string>>, z35.ZodString>;
/** The name of an uploaded file. */
type DocumentFileName = z35.infer<typeof documentFileNameSchema>;
/**
* The type check of an upload, on the file name in its stored form (control and bidirectional
* characters stripped, then trimmed): it must end in an accepted extension. A failure is
* `document.unsupported_type` (415). Services call `checkUploadFile`, not this. The service also inspects the content, because the name
* and the declared type are untrusted.
*/
declare const documentTypeCheckSchema: z35.ZodPipe<z35.ZodPipe<z35.ZodString, z35.ZodTransform<string, string>>, z35.ZodString>;
/**
* The size check of an upload, on the byte count: at most {@link MAX_DOCUMENT_BYTES}. A failure
* is `document.too_large` (413). Services call `checkUploadFile`, not this. Emptiness is not checked here: an empty file fails the upload
* schema as `request.invalid`.
*/
declare const documentSizeCheckSchema: z35.ZodNumber;
/** Lower-cases a media type and drops its parameters, so `Text/Plain; charset=utf-8` becomes `text/plain`. */
declare function normaliseMediaType(mediaType: string): string;
/** Whether text holds a control or bidirectional character (the ones a file name has stripped), so an identifier can refuse it. */
declare function hasStrippableCharacter(text: string): boolean;
/** Whether text is well-formed UTF-16: no lone surrogate. */
declare function isWellFormedText(text: string): boolean;
import { z as z36 } from "zod";
/**
* `prospect.created` (version 1): a Prospect was created. Carries ids and the Source kind, no
* personal data; a consumer that needs the person reads the Prospect from core.
*/
declare const prospectCreatedEvent: {
	type: "prospect.created";
	version: 1;
	schema: z36.ZodObject<{
		id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
		occurredAt: z36.ZodISODateTime;
		organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
		region: z36.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z36.ZodLiteral<"prospect.created">;
		version: z36.ZodLiteral<1>;
		data: z36.ZodObject<{
			prospectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
			companyId: z36.ZodNullable<z36.core.$ZodBranded<z36.ZodString, "pco", "out">>;
			ownerMembershipId: z36.ZodNullable<z36.core.$ZodBranded<z36.ZodString, "mem", "out">>;
			source: z36.ZodUnion<readonly [z36.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z36.ZodString]>;
		}, z36.core.$strict>;
	}, z36.core.$strip>;
	parse: (input: unknown) => {
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.created";
		version: 1;
		data: {
			prospectId: string & z36.$brand<"prs">;
			companyId: (string & z36.$brand<"pco">) | null;
			ownerMembershipId: (string & z36.$brand<"mem">) | null;
			source: string;
		};
	};
	safeParse: (input: unknown) => z36.ZodSafeParseResult<{
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.created";
		version: 1;
		data: {
			prospectId: string & z36.$brand<"prs">;
			companyId: (string & z36.$brand<"pco">) | null;
			ownerMembershipId: (string & z36.$brand<"mem">) | null;
			source: string;
		};
	}>;
};
/**
* `prospect.updated` (version 1): a Prospect changed. `changedFields` names the fields whose
* current value changed (names only, never values); `ownerChanged`, `companyChanged` and
* `statusChanged` flag the other attributes. Published once per change.
*/
declare const prospectUpdatedEvent: {
	type: "prospect.updated";
	version: 1;
	schema: z36.ZodObject<{
		id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
		occurredAt: z36.ZodISODateTime;
		organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
		region: z36.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z36.ZodLiteral<"prospect.updated">;
		version: z36.ZodLiteral<1>;
		data: z36.ZodObject<{
			prospectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
			changedFields: z36.ZodArray<z36.ZodEnum<{
				email: "email";
				firstName: "firstName";
				jobTitle: "jobTitle";
				lastName: "lastName";
				linkedinUrl: "linkedinUrl";
				phone: "phone";
			}>>;
			ownerChanged: z36.ZodBoolean;
			companyChanged: z36.ZodBoolean;
			statusChanged: z36.ZodBoolean;
			source: z36.ZodUnion<readonly [z36.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z36.ZodString]>;
		}, z36.core.$strict>;
	}, z36.core.$strip>;
	parse: (input: unknown) => {
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.updated";
		version: 1;
		data: {
			prospectId: string & z36.$brand<"prs">;
			changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
			ownerChanged: boolean;
			companyChanged: boolean;
			statusChanged: boolean;
			source: string;
		};
	};
	safeParse: (input: unknown) => z36.ZodSafeParseResult<{
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.updated";
		version: 1;
		data: {
			prospectId: string & z36.$brand<"prs">;
			changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
			ownerChanged: boolean;
			companyChanged: boolean;
			statusChanged: boolean;
			source: string;
		};
	}>;
};
/** `prospect.merged` (version 1): Prospects were merged into a survivor; links (such as Deal links) move to the survivor. Ids only. */
declare const prospectMergedEvent: {
	type: "prospect.merged";
	version: 1;
	schema: z36.ZodObject<{
		id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
		occurredAt: z36.ZodISODateTime;
		organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
		region: z36.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z36.ZodLiteral<"prospect.merged">;
		version: z36.ZodLiteral<1>;
		data: z36.ZodObject<{
			mergeId: z36.core.$ZodBranded<z36.ZodString, "pmrg", "out">;
			survivorProspectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
			mergedProspectIds: z36.ZodArray<z36.core.$ZodBranded<z36.ZodString, "prs", "out">>;
		}, z36.core.$strict>;
	}, z36.core.$strip>;
	parse: (input: unknown) => {
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merged";
		version: 1;
		data: {
			mergeId: string & z36.$brand<"pmrg">;
			survivorProspectId: string & z36.$brand<"prs">;
			mergedProspectIds: (string & z36.$brand<"prs">)[];
		};
	};
	safeParse: (input: unknown) => z36.ZodSafeParseResult<{
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merged";
		version: 1;
		data: {
			mergeId: string & z36.$brand<"pmrg">;
			survivorProspectId: string & z36.$brand<"prs">;
			mergedProspectIds: (string & z36.$brand<"prs">)[];
		};
	}>;
};
/** `prospect.merge_undone` (version 1): a merge was reversed and the merged Prospects restored; links move back. Ids only. */
declare const prospectMergeUndoneEvent: {
	type: "prospect.merge_undone";
	version: 1;
	schema: z36.ZodObject<{
		id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
		occurredAt: z36.ZodISODateTime;
		organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
		region: z36.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z36.ZodLiteral<"prospect.merge_undone">;
		version: z36.ZodLiteral<1>;
		data: z36.ZodObject<{
			mergeId: z36.core.$ZodBranded<z36.ZodString, "pmrg", "out">;
			survivorProspectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
			restoredProspectIds: z36.ZodArray<z36.core.$ZodBranded<z36.ZodString, "prs", "out">>;
		}, z36.core.$strict>;
	}, z36.core.$strip>;
	parse: (input: unknown) => {
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merge_undone";
		version: 1;
		data: {
			mergeId: string & z36.$brand<"pmrg">;
			survivorProspectId: string & z36.$brand<"prs">;
			restoredProspectIds: (string & z36.$brand<"prs">)[];
		};
	};
	safeParse: (input: unknown) => z36.ZodSafeParseResult<{
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merge_undone";
		version: 1;
		data: {
			mergeId: string & z36.$brand<"pmrg">;
			survivorProspectId: string & z36.$brand<"prs">;
			restoredProspectIds: (string & z36.$brand<"prs">)[];
		};
	}>;
};
/**
* `prospect.erased` (version 1): a Prospect was erased. The Playbook consumes it to drop its
* links; it is idempotent on redelivery. It carries the opaque id and nothing about the person.
*/
declare const prospectErasedEvent: {
	type: "prospect.erased";
	version: 1;
	schema: z36.ZodObject<{
		id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
		occurredAt: z36.ZodISODateTime;
		organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
		region: z36.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z36.ZodLiteral<"prospect.erased">;
		version: z36.ZodLiteral<1>;
		data: z36.ZodObject<{
			prospectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
		}, z36.core.$strict>;
	}, z36.core.$strip>;
	parse: (input: unknown) => {
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.erased";
		version: 1;
		data: {
			prospectId: string & z36.$brand<"prs">;
		};
	};
	safeParse: (input: unknown) => z36.ZodSafeParseResult<{
		id: string & z36.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z36.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.erased";
		version: 1;
		data: {
			prospectId: string & z36.$brand<"prs">;
		};
	}>;
};
/** Every Prospect event, by type. */
declare const PROSPECT_EVENTS: {
	readonly "prospect.created": {
		type: "prospect.created";
		version: 1;
		schema: z36.ZodObject<{
			id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
			occurredAt: z36.ZodISODateTime;
			organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
			region: z36.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z36.ZodLiteral<"prospect.created">;
			version: z36.ZodLiteral<1>;
			data: z36.ZodObject<{
				prospectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
				companyId: z36.ZodNullable<z36.core.$ZodBranded<z36.ZodString, "pco", "out">>;
				ownerMembershipId: z36.ZodNullable<z36.core.$ZodBranded<z36.ZodString, "mem", "out">>;
				source: z36.ZodUnion<readonly [z36.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z36.ZodString]>;
			}, z36.core.$strict>;
		}, z36.core.$strip>;
		parse: (input: unknown) => {
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.created";
			version: 1;
			data: {
				prospectId: string & z36.$brand<"prs">;
				companyId: (string & z36.$brand<"pco">) | null;
				ownerMembershipId: (string & z36.$brand<"mem">) | null;
				source: string;
			};
		};
		safeParse: (input: unknown) => z36.ZodSafeParseResult<{
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.created";
			version: 1;
			data: {
				prospectId: string & z36.$brand<"prs">;
				companyId: (string & z36.$brand<"pco">) | null;
				ownerMembershipId: (string & z36.$brand<"mem">) | null;
				source: string;
			};
		}>;
	};
	readonly "prospect.updated": {
		type: "prospect.updated";
		version: 1;
		schema: z36.ZodObject<{
			id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
			occurredAt: z36.ZodISODateTime;
			organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
			region: z36.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z36.ZodLiteral<"prospect.updated">;
			version: z36.ZodLiteral<1>;
			data: z36.ZodObject<{
				prospectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
				changedFields: z36.ZodArray<z36.ZodEnum<{
					email: "email";
					firstName: "firstName";
					jobTitle: "jobTitle";
					lastName: "lastName";
					linkedinUrl: "linkedinUrl";
					phone: "phone";
				}>>;
				ownerChanged: z36.ZodBoolean;
				companyChanged: z36.ZodBoolean;
				statusChanged: z36.ZodBoolean;
				source: z36.ZodUnion<readonly [z36.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z36.ZodString]>;
			}, z36.core.$strict>;
		}, z36.core.$strip>;
		parse: (input: unknown) => {
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.updated";
			version: 1;
			data: {
				prospectId: string & z36.$brand<"prs">;
				changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
				ownerChanged: boolean;
				companyChanged: boolean;
				statusChanged: boolean;
				source: string;
			};
		};
		safeParse: (input: unknown) => z36.ZodSafeParseResult<{
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.updated";
			version: 1;
			data: {
				prospectId: string & z36.$brand<"prs">;
				changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
				ownerChanged: boolean;
				companyChanged: boolean;
				statusChanged: boolean;
				source: string;
			};
		}>;
	};
	readonly "prospect.merged": {
		type: "prospect.merged";
		version: 1;
		schema: z36.ZodObject<{
			id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
			occurredAt: z36.ZodISODateTime;
			organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
			region: z36.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z36.ZodLiteral<"prospect.merged">;
			version: z36.ZodLiteral<1>;
			data: z36.ZodObject<{
				mergeId: z36.core.$ZodBranded<z36.ZodString, "pmrg", "out">;
				survivorProspectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
				mergedProspectIds: z36.ZodArray<z36.core.$ZodBranded<z36.ZodString, "prs", "out">>;
			}, z36.core.$strict>;
		}, z36.core.$strip>;
		parse: (input: unknown) => {
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merged";
			version: 1;
			data: {
				mergeId: string & z36.$brand<"pmrg">;
				survivorProspectId: string & z36.$brand<"prs">;
				mergedProspectIds: (string & z36.$brand<"prs">)[];
			};
		};
		safeParse: (input: unknown) => z36.ZodSafeParseResult<{
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merged";
			version: 1;
			data: {
				mergeId: string & z36.$brand<"pmrg">;
				survivorProspectId: string & z36.$brand<"prs">;
				mergedProspectIds: (string & z36.$brand<"prs">)[];
			};
		}>;
	};
	readonly "prospect.merge_undone": {
		type: "prospect.merge_undone";
		version: 1;
		schema: z36.ZodObject<{
			id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
			occurredAt: z36.ZodISODateTime;
			organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
			region: z36.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z36.ZodLiteral<"prospect.merge_undone">;
			version: z36.ZodLiteral<1>;
			data: z36.ZodObject<{
				mergeId: z36.core.$ZodBranded<z36.ZodString, "pmrg", "out">;
				survivorProspectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
				restoredProspectIds: z36.ZodArray<z36.core.$ZodBranded<z36.ZodString, "prs", "out">>;
			}, z36.core.$strict>;
		}, z36.core.$strip>;
		parse: (input: unknown) => {
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merge_undone";
			version: 1;
			data: {
				mergeId: string & z36.$brand<"pmrg">;
				survivorProspectId: string & z36.$brand<"prs">;
				restoredProspectIds: (string & z36.$brand<"prs">)[];
			};
		};
		safeParse: (input: unknown) => z36.ZodSafeParseResult<{
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merge_undone";
			version: 1;
			data: {
				mergeId: string & z36.$brand<"pmrg">;
				survivorProspectId: string & z36.$brand<"prs">;
				restoredProspectIds: (string & z36.$brand<"prs">)[];
			};
		}>;
	};
	readonly "prospect.erased": {
		type: "prospect.erased";
		version: 1;
		schema: z36.ZodObject<{
			id: z36.core.$ZodBranded<z36.ZodString, "evt", "out">;
			occurredAt: z36.ZodISODateTime;
			organizationId: z36.core.$ZodBranded<z36.ZodString, "org", "out">;
			region: z36.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z36.ZodLiteral<"prospect.erased">;
			version: z36.ZodLiteral<1>;
			data: z36.ZodObject<{
				prospectId: z36.core.$ZodBranded<z36.ZodString, "prs", "out">;
			}, z36.core.$strict>;
		}, z36.core.$strip>;
		parse: (input: unknown) => {
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.erased";
			version: 1;
			data: {
				prospectId: string & z36.$brand<"prs">;
			};
		};
		safeParse: (input: unknown) => z36.ZodSafeParseResult<{
			id: string & z36.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z36.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.erased";
			version: 1;
			data: {
				prospectId: string & z36.$brand<"prs">;
			};
		}>;
	};
};
/** The type of a Prospect event. */
type ProspectEventType = keyof typeof PROSPECT_EVENTS;
import { z as z37 } from "zod";
/** The largest import file, in bytes (10 MB). */
declare const MAX_PROSPECT_IMPORT_BYTES: number;
/** The most data rows an import may hold. */
declare const MAX_PROSPECT_IMPORT_ROWS = 5e4;
/** The name of the one file part of the multipart upload; the request carries an `Idempotency-Key` header. */
declare const PROSPECT_IMPORT_FILE_FIELD = "file";
/**
* The columns of the CSV template, in order. A row needs an email, a phone or a LinkedIn address.
* `owner_email` names a member (Rep or Manager) of the Organization; `tags` is separated by `;`.
* Values are written with the Source `import` and never replace a manual value (ADR 0020).
*/
declare const PROSPECT_IMPORT_COLUMNS: readonly ["first_name", "last_name", "email", "phone", "linkedin_url", "job_title", "company_name", "company_domain", "owner_email", "tags"];
/** The states of an import; `completed` and `failed` are final. */
declare const PROSPECT_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of an import. */
declare const prospectImportStateSchema: z37.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of an import. */
type ProspectImportState = z37.infer<typeof prospectImportStateSchema>;
/** Why a whole import failed after it was accepted. */
declare const PROSPECT_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable"];
/** Why a whole import failed. */
declare const prospectImportFailureReasonSchema: z37.ZodEnum<{
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import failed. */
type ProspectImportFailureReason = z37.infer<typeof prospectImportFailureReasonSchema>;
/** What happened to one row. */
declare const PROSPECT_IMPORT_ROW_RESULTS: readonly ["created", "updated", "skipped", "rejected"];
/** What happened to one row. */
declare const prospectImportRowResultSchema: z37.ZodEnum<{
	created: "created";
	rejected: "rejected";
	skipped: "skipped";
	updated: "updated";
}>;
/** What happened to one row. */
type ProspectImportRowResult = z37.infer<typeof prospectImportRowResultSchema>;
/** Why a row was skipped: the file changes nothing for it. */
declare const PROSPECT_IMPORT_SKIP_REASONS: readonly ["no_change", "manual_values_kept"];
/** Why a row was rejected: the row is not applied and the file needs fixing. */
declare const PROSPECT_IMPORT_REJECT_REASONS: readonly ["wrong_column_count", "blank_row", "missing_identity", "invalid_email", "invalid_phone", "invalid_linkedin_url", "invalid_name", "invalid_job_title", "invalid_company", "invalid_tags", "owner_not_found", "owner_not_allowed", "duplicate_in_file", "identity_conflict"];
/** Why a row was skipped or rejected. */
declare const prospectImportRowReasonSchema: z37.ZodEnum<{
	blank_row: "blank_row";
	duplicate_in_file: "duplicate_in_file";
	identity_conflict: "identity_conflict";
	invalid_company: "invalid_company";
	invalid_email: "invalid_email";
	invalid_job_title: "invalid_job_title";
	invalid_linkedin_url: "invalid_linkedin_url";
	invalid_name: "invalid_name";
	invalid_phone: "invalid_phone";
	invalid_tags: "invalid_tags";
	manual_values_kept: "manual_values_kept";
	missing_identity: "missing_identity";
	no_change: "no_change";
	owner_not_allowed: "owner_not_allowed";
	owner_not_found: "owner_not_found";
	wrong_column_count: "wrong_column_count";
}>;
/** Why a row was skipped or rejected. */
type ProspectImportRowReason = z37.infer<typeof prospectImportRowReasonSchema>;
/**
* A Prospect import as core returns it. It carries no file name and no cell. The counts are
* `null` until `completed`, then `rowCount` is the sum of the other four; `failureReason` is set
* exactly when `state` is `failed`. The report is the paginated rows. An import is a queued,
* idempotent and resumable job, so the page can be closed and the import read again by id.
*/
declare const prospectImportSchema: z37.ZodObject<{
	id: z37.core.$ZodBranded<z37.ZodString, "pimp", "out">;
	state: z37.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z37.ZodNullable<z37.ZodEnum<{
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z37.ZodNullable<z37.ZodNumber>;
	createdCount: z37.ZodNullable<z37.ZodNumber>;
	updatedCount: z37.ZodNullable<z37.ZodNumber>;
	skippedCount: z37.ZodNullable<z37.ZodNumber>;
	rejectedCount: z37.ZodNullable<z37.ZodNumber>;
	uploadedByUserId: z37.core.$ZodBranded<z37.ZodString, "usr", "out">;
	createdAt: z37.ZodISODateTime;
	updatedAt: z37.ZodISODateTime;
}, z37.core.$strip>;
/** A Prospect import as core returns it. */
type ProspectImport = z37.infer<typeof prospectImportSchema>;
/** The path parameters of a request about one import. */
declare const prospectImportParamsSchema: z37.ZodObject<{
	importId: z37.core.$ZodBranded<z37.ZodString, "pimp", "out">;
}, z37.core.$strict>;
/** The path parameters of a request about one import. */
type ProspectImportParams = z37.infer<typeof prospectImportParamsSchema>;
/** The query parameters of a request to list imports: a page. */
declare const listProspectImportsQuerySchema: z37.ZodObject<{
	cursor: z37.ZodOptional<z37.ZodString>;
	limit: z37.ZodDefault<z37.ZodPipe<z37.ZodPipe<z37.ZodUnion<readonly [z37.ZodNumber, z37.ZodString]>, z37.ZodTransform<number, string | number>>, z37.ZodNumber>>;
}, z37.core.$strict>;
/** The query parameters of a request to list imports. */
type ListProspectImportsQuery = z37.infer<typeof listProspectImportsQuerySchema>;
/** One page of imports, newest first (by `createdAt`, then id, both descending). */
declare const listProspectImportsResponseSchema: z37.ZodObject<{
	items: z37.ZodArray<z37.ZodObject<{
		id: z37.core.$ZodBranded<z37.ZodString, "pimp", "out">;
		state: z37.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z37.ZodNullable<z37.ZodEnum<{
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z37.ZodNullable<z37.ZodNumber>;
		createdCount: z37.ZodNullable<z37.ZodNumber>;
		updatedCount: z37.ZodNullable<z37.ZodNumber>;
		skippedCount: z37.ZodNullable<z37.ZodNumber>;
		rejectedCount: z37.ZodNullable<z37.ZodNumber>;
		uploadedByUserId: z37.core.$ZodBranded<z37.ZodString, "usr", "out">;
		createdAt: z37.ZodISODateTime;
		updatedAt: z37.ZodISODateTime;
	}, z37.core.$strip>>;
	nextCursor: z37.ZodNullable<z37.ZodString>;
}, z37.core.$strip>;
/** One page of imports. */
type ListProspectImportsResponse = z37.infer<typeof listProspectImportsResponseSchema>;
/** The position in an import list. */
declare const prospectImportCursorSchema: z37.ZodObject<{
	createdAt: z37.ZodISODateTime;
	id: z37.core.$ZodBranded<z37.ZodString, "pimp", "out">;
}, z37.core.$strict>;
/** The position in an import list. */
type ProspectImportCursor = z37.infer<typeof prospectImportCursorSchema>;
/**
* One row of the report: the record number (the header is record 1, so the first data row is 2),
* the `result` and, for a skipped or rejected row, the `reason`. `prospectId` is the Prospect the
* row created or updated (or matched, when skipped) and is `null` for a rejected row. No cell of
* the file is echoed, so a report carries no personal data.
*/
declare const prospectImportRowSchema: z37.ZodObject<{
	rowNumber: z37.ZodNumber;
	result: z37.ZodEnum<{
		created: "created";
		rejected: "rejected";
		skipped: "skipped";
		updated: "updated";
	}>;
	reason: z37.ZodNullable<z37.ZodEnum<{
		blank_row: "blank_row";
		duplicate_in_file: "duplicate_in_file";
		identity_conflict: "identity_conflict";
		invalid_company: "invalid_company";
		invalid_email: "invalid_email";
		invalid_job_title: "invalid_job_title";
		invalid_linkedin_url: "invalid_linkedin_url";
		invalid_name: "invalid_name";
		invalid_phone: "invalid_phone";
		invalid_tags: "invalid_tags";
		manual_values_kept: "manual_values_kept";
		missing_identity: "missing_identity";
		no_change: "no_change";
		owner_not_allowed: "owner_not_allowed";
		owner_not_found: "owner_not_found";
		wrong_column_count: "wrong_column_count";
	}>>;
	prospectId: z37.ZodNullable<z37.core.$ZodBranded<z37.ZodString, "prs", "out">>;
}, z37.core.$strip>;
/** One row of an import report. */
type ProspectImportRow = z37.infer<typeof prospectImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page and optionally one `result`. Rows are in CSV order. An unknown parameter is refused. */
declare const listProspectImportRowsQuerySchema: z37.ZodObject<{
	cursor: z37.ZodOptional<z37.ZodString>;
	limit: z37.ZodDefault<z37.ZodPipe<z37.ZodPipe<z37.ZodUnion<readonly [z37.ZodNumber, z37.ZodString]>, z37.ZodTransform<number, string | number>>, z37.ZodNumber>>;
	result: z37.ZodOptional<z37.ZodEnum<{
		created: "created";
		rejected: "rejected";
		skipped: "skipped";
		updated: "updated";
	}>>;
}, z37.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListProspectImportRowsQuery = z37.infer<typeof listProspectImportRowsQuerySchema>;
/** One page of an import report. */
declare const listProspectImportRowsResponseSchema: z37.ZodObject<{
	items: z37.ZodArray<z37.ZodObject<{
		rowNumber: z37.ZodNumber;
		result: z37.ZodEnum<{
			created: "created";
			rejected: "rejected";
			skipped: "skipped";
			updated: "updated";
		}>;
		reason: z37.ZodNullable<z37.ZodEnum<{
			blank_row: "blank_row";
			duplicate_in_file: "duplicate_in_file";
			identity_conflict: "identity_conflict";
			invalid_company: "invalid_company";
			invalid_email: "invalid_email";
			invalid_job_title: "invalid_job_title";
			invalid_linkedin_url: "invalid_linkedin_url";
			invalid_name: "invalid_name";
			invalid_phone: "invalid_phone";
			invalid_tags: "invalid_tags";
			manual_values_kept: "manual_values_kept";
			missing_identity: "missing_identity";
			no_change: "no_change";
			owner_not_allowed: "owner_not_allowed";
			owner_not_found: "owner_not_found";
			wrong_column_count: "wrong_column_count";
		}>>;
		prospectId: z37.ZodNullable<z37.core.$ZodBranded<z37.ZodString, "prs", "out">>;
	}, z37.core.$strip>>;
	nextCursor: z37.ZodNullable<z37.ZodString>;
}, z37.core.$strip>;
/** One page of an import report. */
type ListProspectImportRowsResponse = z37.infer<typeof listProspectImportRowsResponseSchema>;
/** The position in an import report: the record number of the last row of the page. */
declare const prospectImportRowCursorSchema: z37.ZodObject<{
	rowNumber: z37.ZodNumber;
}, z37.core.$strict>;
/** The position in an import report. */
type ProspectImportRowCursor = z37.infer<typeof prospectImportRowCursorSchema>;
/** The columns of the downloadable report CSV, in order. */
declare const PROSPECT_IMPORT_REPORT_COLUMNS: readonly ["row_number", "result", "reason", "prospect_id"];
/** Why an upload is refused with `prospect.import_invalid`, carried in `details.reason`. */
declare const PROSPECT_IMPORT_INVALID_REASONS: readonly ["unsupported_type", "too_large", "header_invalid", "too_many_rows"];
/** The `details` of `prospect.import_invalid`: which check the upload failed. */
declare const prospectImportInvalidDetailsSchema: z37.ZodObject<{
	reason: z37.ZodEnum<{
		header_invalid: "header_invalid";
		too_large: "too_large";
		too_many_rows: "too_many_rows";
		unsupported_type: "unsupported_type";
	}>;
}, z37.core.$strict>;
/** The `details` of `prospect.import_invalid`. */
type ProspectImportInvalidDetails = z37.infer<typeof prospectImportInvalidDetailsSchema>;
import { z as z38 } from "zod";
/** How many days after a merge it can be undone (spec M2, story 13). */
declare const PROSPECT_MERGE_UNDO_DAYS = 30;
/** The most Prospects one merge folds into the survivor. */
declare const MAX_MERGED_PROSPECTS = 5;
/** The path parameters of a request about one merge. */
declare const prospectMergeParamsSchema: z38.ZodObject<{
	mergeId: z38.core.$ZodBranded<z38.ZodString, "pmrg", "out">;
}, z38.core.$strict>;
/** The path parameters of a request about one merge. */
type ProspectMergeParams = z38.infer<typeof prospectMergeParamsSchema>;
/**
* The body of a request to merge Prospects into the survivor named in the path (`prospectId`).
* `fieldChoices` says, per field, which of the merging Prospects' value to keep, by Prospect id
* (the survivor's or one of `mergedProspectIds`); a field not named keeps the value that ADR 0020
* would choose across all the records. Every merged Prospect's history is kept, with the
* survivor's. Owner and Admin only. A Prospect that is not visible, or already merged, is
* `prospect.merge_conflict` or `prospect.not_found`. Accepts an `Idempotency-Key` header.
*/
declare const mergeProspectsRequestSchema: z38.ZodObject<{
	mergedProspectIds: z38.ZodArray<z38.core.$ZodBranded<z38.ZodString, "prs", "out">>;
	fieldChoices: z38.ZodDefault<z38.ZodRecord<z38.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z38.core.$partial, z38.core.$ZodBranded<z38.ZodString, "prs", "out">>>;
}, z38.core.$strict>;
/** The body of a request to merge Prospects. */
type MergeProspectsRequest = z38.infer<typeof mergeProspectsRequestSchema>;
/** The states of a merge: `merged`, or `undone` once reversed. */
declare const PROSPECT_MERGE_STATES: readonly ["merged", "undone"];
/**
* A merge record. Undo is possible while `state` is `merged` and now is before `undoableUntil`
* (thirty days after `createdAt`); later it is `prospect.merge_conflict`. `undoneAt` is set exactly
* when the state is `undone`. The snapshot that restores both records stays in core and is not returned.
*/
declare const prospectMergeSchema: z38.ZodObject<{
	id: z38.core.$ZodBranded<z38.ZodString, "pmrg", "out">;
	survivorProspectId: z38.core.$ZodBranded<z38.ZodString, "prs", "out">;
	mergedProspectIds: z38.ZodArray<z38.core.$ZodBranded<z38.ZodString, "prs", "out">>;
	fieldChoices: z38.ZodRecord<z38.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z38.core.$partial, z38.core.$ZodBranded<z38.ZodString, "prs", "out">>;
	state: z38.ZodEnum<{
		merged: "merged";
		undone: "undone";
	}>;
	mergedByUserId: z38.core.$ZodBranded<z38.ZodString, "usr", "out">;
	createdAt: z38.ZodISODateTime;
	undoableUntil: z38.ZodISODateTime;
	undoneAt: z38.ZodNullable<z38.ZodISODateTime>;
}, z38.core.$strip>;
/** A merge record. */
type ProspectMerge = z38.infer<typeof prospectMergeSchema>;
/**
* The query parameters of a request to list suspected duplicates: a page and optionally the
* `prospectId` whose duplicates to list. Matching runs on the indexed normalised identities.
*/
declare const listProspectDuplicatesQuerySchema: z38.ZodObject<{
	cursor: z38.ZodOptional<z38.ZodString>;
	limit: z38.ZodDefault<z38.ZodPipe<z38.ZodPipe<z38.ZodUnion<readonly [z38.ZodNumber, z38.ZodString]>, z38.ZodTransform<number, string | number>>, z38.ZodNumber>>;
	prospectId: z38.ZodOptional<z38.core.$ZodBranded<z38.ZodString, "prs", "out">>;
}, z38.core.$strict>;
/** The query parameters of a request to list suspected duplicates. */
type ListProspectDuplicatesQuery = z38.infer<typeof listProspectDuplicatesQuerySchema>;
/** One suspected duplicate: two Prospects (in id order) and the identity kinds they share. */
declare const prospectDuplicateSchema: z38.ZodObject<{
	prospectIds: z38.ZodTuple<[z38.core.$ZodBranded<z38.ZodString, "prs", "out">, z38.core.$ZodBranded<z38.ZodString, "prs", "out">], null>;
	matchedOn: z38.ZodArray<z38.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>>;
}, z38.core.$strip>;
/** One suspected duplicate. */
type ProspectDuplicate = z38.infer<typeof prospectDuplicateSchema>;
/** One page of suspected duplicates. */
declare const listProspectDuplicatesResponseSchema: z38.ZodObject<{
	items: z38.ZodArray<z38.ZodObject<{
		prospectIds: z38.ZodTuple<[z38.core.$ZodBranded<z38.ZodString, "prs", "out">, z38.core.$ZodBranded<z38.ZodString, "prs", "out">], null>;
		matchedOn: z38.ZodArray<z38.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
		}>>;
	}, z38.core.$strip>>;
	nextCursor: z38.ZodNullable<z38.ZodString>;
}, z38.core.$strip>;
/** One page of suspected duplicates. */
type ListProspectDuplicatesResponse = z38.infer<typeof listProspectDuplicatesResponseSchema>;
/** The position in the suspected-duplicate list. */
declare const prospectDuplicateCursorSchema: z38.ZodObject<{
	first: z38.core.$ZodBranded<z38.ZodString, "prs", "out">;
	second: z38.core.$ZodBranded<z38.ZodString, "prs", "out">;
}, z38.core.$strict>;
/** The position in the suspected-duplicate list. */
type ProspectDuplicateCursor = z38.infer<typeof prospectDuplicateCursorSchema>;
import { z as z39 } from "zod";
/** The states of a Prospect: `active`, or `archived` to hide it from the default list without erasing it. */
declare const PROSPECT_STATUSES: readonly ["active", "archived"];
/** The state of a Prospect. */
declare const prospectStatusSchema: z39.ZodEnum<{
	active: "active";
	archived: "archived";
}>;
/** The state of a Prospect. */
type ProspectStatus = z39.infer<typeof prospectStatusSchema>;
/**
* A Prospect as core returns it. `fields` holds the current value of each field that has one, with
* its Source, time and actor (ADR 0020); a field with no value is absent. `email`, `phone` and
* `linkedinUrl` are the normalised identity values (ADR 0011: ASCII-folded email, E.164 phone,
* normalised LinkedIn address). `source` is the Source kind that created the Prospect.
* `ownerMembershipId` is the owner Rep's Membership, `null` while unassigned.
*/
declare const prospectSchema: z39.ZodObject<{
	id: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
	companyId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "pco", "out">>;
	ownerMembershipId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "mem", "out">>;
	status: z39.ZodEnum<{
		active: "active";
		archived: "archived";
	}>;
	source: z39.ZodUnion<readonly [z39.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z39.ZodString]>;
	tags: z39.ZodArray<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	notes: z39.ZodNullable<z39.ZodString>;
	fields: z39.ZodRecord<z39.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z39.core.$partial, z39.ZodObject<{
		value: z39.ZodString;
		source: z39.ZodUnion<readonly [z39.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z39.ZodString]>;
		sourceRef: z39.ZodNullable<z39.ZodString>;
		setAt: z39.ZodISODateTime;
		setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
	}, z39.core.$strip>>;
	createdAt: z39.ZodISODateTime;
	updatedAt: z39.ZodISODateTime;
}, z39.core.$strip>;
/** A Prospect as core returns it. */
type Prospect = z39.infer<typeof prospectSchema>;
/** The path parameters of a request about one Prospect. */
declare const prospectParamsSchema: z39.ZodObject<{
	prospectId: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
}, z39.core.$strict>;
/** The path parameters of a request about one Prospect. */
type ProspectParams = z39.infer<typeof prospectParamsSchema>;
/**
* The body of a request to create a Prospect by hand. It must carry at least one of a name, an
* email, a phone or a LinkedIn address. The Source is `manual` and the actor the caller, both set
* by core, never read from the body, so an unknown field such as `source` is refused. A Rep is the
* owner of the Prospect they create; only Owner and Admin may name another `ownerMembershipId`,
* and anyone else gets `prospect.forbidden_owner`. An identity another Prospect of the
* Organization already has is `prospect.duplicate_identity`. The call accepts an `Idempotency-Key`
* header (`idempotencyKeySchema`): a replay returns the original Prospect.
*/
declare const createProspectRequestSchema: z39.ZodObject<{
	firstName: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	lastName: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	jobTitle: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	email: z39.ZodOptional<z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>>;
	phone: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	linkedinUrl: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	companyId: z39.ZodOptional<z39.core.$ZodBranded<z39.ZodString, "pco", "out">>;
	ownerMembershipId: z39.ZodOptional<z39.core.$ZodBranded<z39.ZodString, "mem", "out">>;
	tags: z39.ZodOptional<z39.ZodArray<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	notes: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
}, z39.core.$strict>;
/** The body of a request to create a Prospect. */
type CreateProspectRequest = z39.infer<typeof createProspectRequestSchema>;
/**
* The body of a request to edit a Prospect. Only the fields sent change; each is written with the
* Source `manual`, which beats every other Source (ADR 0020). A `null` clears a field or the
* Prospect Company, the explicit Rep or Admin action that is the only way to remove a manual
* value. At least one field is required. Ownership is changed by the owner routes, not here.
*/
declare const updateProspectRequestSchema: z39.ZodObject<{
	firstName: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	lastName: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	jobTitle: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	email: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>>>;
	phone: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	linkedinUrl: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	companyId: z39.ZodOptional<z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "pco", "out">>>;
	status: z39.ZodOptional<z39.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	tags: z39.ZodOptional<z39.ZodArray<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	notes: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
}, z39.core.$strict>;
/** The body of a request to edit a Prospect. */
type UpdateProspectRequest = z39.infer<typeof updateProspectRequestSchema>;
/** The search text of a list request: trimmed, 1 to 100 characters, matched against name, email and company. */
declare const prospectSearchSchema: z39.ZodPipe<z39.ZodString, z39.ZodString>;
/**
* The query parameters of a request to list Prospects: a cursor and a limit of at most 100, and
* optionally `ownerMembershipId`, `source` (the Source kind that created it), `companyId`,
* `status` and `q`. An unknown parameter is refused. Who sees which Prospect is decided from the
* token's role and Team membership (a Rep sees what they own, a Manager what their Team's Reps
* own, Owner and Admin all); a filter can narrow that, never widen it.
*/
declare const listProspectsQuerySchema: z39.ZodObject<{
	cursor: z39.ZodOptional<z39.ZodString>;
	limit: z39.ZodDefault<z39.ZodPipe<z39.ZodPipe<z39.ZodUnion<readonly [z39.ZodNumber, z39.ZodString]>, z39.ZodTransform<number, string | number>>, z39.ZodNumber>>;
	ownerMembershipId: z39.ZodOptional<z39.core.$ZodBranded<z39.ZodString, "mem", "out">>;
	source: z39.ZodOptional<z39.ZodUnion<readonly [z39.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z39.ZodString]>>;
	companyId: z39.ZodOptional<z39.core.$ZodBranded<z39.ZodString, "pco", "out">>;
	status: z39.ZodOptional<z39.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	q: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
}, z39.core.$strict>;
/** The query parameters of a request to list Prospects. */
type ListProspectsQuery = z39.infer<typeof listProspectsQuerySchema>;
/** One page of Prospects, newest first (by `createdAt`, then id, both descending). */
declare const listProspectsResponseSchema: z39.ZodObject<{
	items: z39.ZodArray<z39.ZodObject<{
		id: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
		companyId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "pco", "out">>;
		ownerMembershipId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "mem", "out">>;
		status: z39.ZodEnum<{
			active: "active";
			archived: "archived";
		}>;
		source: z39.ZodUnion<readonly [z39.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z39.ZodString]>;
		tags: z39.ZodArray<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
		notes: z39.ZodNullable<z39.ZodString>;
		fields: z39.ZodRecord<z39.ZodEnum<{
			email: "email";
			firstName: "firstName";
			jobTitle: "jobTitle";
			lastName: "lastName";
			linkedinUrl: "linkedinUrl";
			phone: "phone";
		}> & z39.core.$partial, z39.ZodObject<{
			value: z39.ZodString;
			source: z39.ZodUnion<readonly [z39.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z39.ZodString]>;
			sourceRef: z39.ZodNullable<z39.ZodString>;
			setAt: z39.ZodISODateTime;
			setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
		}, z39.core.$strip>>;
		createdAt: z39.ZodISODateTime;
		updatedAt: z39.ZodISODateTime;
	}, z39.core.$strip>>;
	nextCursor: z39.ZodNullable<z39.ZodString>;
}, z39.core.$strip>;
/** One page of Prospects. */
type ListProspectsResponse = z39.infer<typeof listProspectsResponseSchema>;
/** The position in a Prospect list: where the last item of the page was. */
declare const prospectCursorSchema: z39.ZodObject<{
	createdAt: z39.ZodISODateTime;
	id: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
}, z39.core.$strict>;
/** The position in a Prospect list. */
type ProspectCursor = z39.infer<typeof prospectCursorSchema>;
/** The path parameters of a request for the history of one Prospect field. */
declare const prospectFieldParamsSchema: z39.ZodObject<{
	prospectId: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
	field: z39.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}>;
}, z39.core.$strict>;
/** The path parameters of a request for the history of one Prospect field. */
type ProspectFieldParams = z39.infer<typeof prospectFieldParamsSchema>;
/** The query parameters of a request for a field's history: a page. */
declare const listFieldHistoryQuerySchema: z39.ZodObject<{
	cursor: z39.ZodOptional<z39.ZodString>;
	limit: z39.ZodDefault<z39.ZodPipe<z39.ZodPipe<z39.ZodUnion<readonly [z39.ZodNumber, z39.ZodString]>, z39.ZodTransform<number, string | number>>, z39.ZodNumber>>;
}, z39.core.$strict>;
/** The query parameters of a request for a field's history. */
type ListFieldHistoryQuery = z39.infer<typeof listFieldHistoryQuerySchema>;
/** One page of a field's history, newest first; the current value, earlier values and enrichment suggestions all appear, each with its Source. */
declare const listFieldHistoryResponseSchema: z39.ZodObject<{
	items: z39.ZodArray<z39.ZodObject<{
		value: z39.ZodString;
		source: z39.ZodUnion<readonly [z39.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z39.ZodString]>;
		sourceRef: z39.ZodNullable<z39.ZodString>;
		setAt: z39.ZodISODateTime;
		setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
		state: z39.ZodEnum<{
			current: "current";
			suggested: "suggested";
			superseded: "superseded";
		}>;
	}, z39.core.$strip>>;
	nextCursor: z39.ZodNullable<z39.ZodString>;
}, z39.core.$strip>;
/** One page of a field's history. */
type ListFieldHistoryResponse = z39.infer<typeof listFieldHistoryResponseSchema>;
/** The position in a field's history. */
declare const fieldHistoryCursorSchema: z39.ZodObject<{
	setAt: z39.ZodISODateTime;
	seq: z39.ZodNumber;
}, z39.core.$strict>;
/** The position in a field's history. */
type FieldHistoryCursor = z39.infer<typeof fieldHistoryCursorSchema>;
/**
* The body of a request to change a Prospect's owner Rep. The new owner must be a Rep or Manager
* of the same Organization, else `prospect.forbidden_owner`. Owner and Admin only.
*/
declare const setProspectOwnerRequestSchema: z39.ZodObject<{
	ownerMembershipId: z39.core.$ZodBranded<z39.ZodString, "mem", "out">;
}, z39.core.$strict>;
/** The body of a request to change a Prospect's owner. */
type SetProspectOwnerRequest = z39.infer<typeof setProspectOwnerRequestSchema>;
/** The most Prospects one bulk assignment may name. */
declare const MAX_BULK_ASSIGN_PROSPECTS = 5e3;
/** Up to this many Prospects of a bulk assignment are applied before the call answers; more are queued and answered 202. */
declare const BULK_ASSIGN_SYNC_LIMIT = 500;
/**
* The body of a request to assign many Prospects to one owner: 1 to 5,000 distinct ids. Up to 500
* are applied at once (200); more are queued (202). A Prospect that does not exist or is not
* visible is not named in the answer, only counted as `skipped`. Accepts an `Idempotency-Key`
* header: a retry changes nothing twice.
*/
declare const bulkAssignProspectsRequestSchema: z39.ZodObject<{
	prospectIds: z39.ZodArray<z39.core.$ZodBranded<z39.ZodString, "prs", "out">>;
	ownerMembershipId: z39.core.$ZodBranded<z39.ZodString, "mem", "out">;
}, z39.core.$strict>;
/** The body of a request to assign many Prospects. */
type BulkAssignProspectsRequest = z39.infer<typeof bulkAssignProspectsRequestSchema>;
/** The answer to a bulk assignment: `applied` counts when it ran at once, `queued` when it was handed to a job (then the counts are `null`). */
declare const bulkAssignProspectsResponseSchema: z39.ZodObject<{
	state: z39.ZodEnum<{
		applied: "applied";
		queued: "queued";
	}>;
	requested: z39.ZodNumber;
	assigned: z39.ZodNullable<z39.ZodNumber>;
	skipped: z39.ZodNullable<z39.ZodNumber>;
}, z39.core.$strip>;
/** The answer to a bulk assignment. */
type BulkAssignProspectsResponse = z39.infer<typeof bulkAssignProspectsResponseSchema>;
/** The answer to an erasure request: it is a queued job, so the Prospect is gone once `prospect.erased` is published. Carries no personal data. */
declare const eraseProspectResponseSchema: z39.ZodObject<{
	prospectId: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
	state: z39.ZodLiteral<"queued">;
}, z39.core.$strip>;
/** The answer to an erasure request. */
type EraseProspectResponse = z39.infer<typeof eraseProspectResponseSchema>;
/**
* A Prospect Company as core returns it: the name and domain with their Source, time and actor.
* `domain` is the normalised domain (ASCII-folded host). `name` is always present.
*/
declare const prospectCompanySchema: z39.ZodObject<{
	id: z39.core.$ZodBranded<z39.ZodString, "pco", "out">;
	fields: z39.ZodObject<{
		name: z39.ZodObject<{
			value: z39.ZodString;
			source: z39.ZodUnion<readonly [z39.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z39.ZodString]>;
			sourceRef: z39.ZodNullable<z39.ZodString>;
			setAt: z39.ZodISODateTime;
			setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
		}, z39.core.$strip>;
		domain: z39.ZodOptional<z39.ZodObject<{
			value: z39.ZodString;
			source: z39.ZodUnion<readonly [z39.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z39.ZodString]>;
			sourceRef: z39.ZodNullable<z39.ZodString>;
			setAt: z39.ZodISODateTime;
			setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
		}, z39.core.$strip>>;
	}, z39.core.$strip>;
	createdAt: z39.ZodISODateTime;
	updatedAt: z39.ZodISODateTime;
}, z39.core.$strip>;
/** A Prospect Company as core returns it. */
type ProspectCompany = z39.infer<typeof prospectCompanySchema>;
/** The path parameters of a request about one Prospect Company. */
declare const prospectCompanyParamsSchema: z39.ZodObject<{
	companyId: z39.core.$ZodBranded<z39.ZodString, "pco", "out">;
}, z39.core.$strict>;
/** The path parameters of a request about one Prospect Company. */
type ProspectCompanyParams = z39.infer<typeof prospectCompanyParamsSchema>;
/** The path parameters of a request for the history of one Prospect Company field. */
declare const prospectCompanyFieldParamsSchema: z39.ZodObject<{
	companyId: z39.core.$ZodBranded<z39.ZodString, "pco", "out">;
	field: z39.ZodEnum<{
		domain: "domain";
		name: "name";
	}>;
}, z39.core.$strict>;
/** The path parameters of a request for the history of one Prospect Company field. */
type ProspectCompanyFieldParams = z39.infer<typeof prospectCompanyFieldParamsSchema>;
/**
* The body of a request to create a Prospect Company, written with the Source `manual`. Accepts an
* `Idempotency-Key` header: a replay returns the original record.
*/
declare const createProspectCompanyRequestSchema: z39.ZodObject<{
	name: z39.ZodPipe<z39.ZodString, z39.ZodString>;
	domain: z39.ZodOptional<z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>>;
}, z39.core.$strict>;
/** The body of a request to create a Prospect Company. */
type CreateProspectCompanyRequest = z39.infer<typeof createProspectCompanyRequestSchema>;
/** The body of a request to edit a Prospect Company: only the fields sent change, written with the Source `manual`; `null` clears the domain. At least one field is required. */
declare const updateProspectCompanyRequestSchema: z39.ZodObject<{
	name: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
	domain: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>>>;
}, z39.core.$strict>;
/** The body of a request to edit a Prospect Company. */
type UpdateProspectCompanyRequest = z39.infer<typeof updateProspectCompanyRequestSchema>;
/** The query parameters of a request to list Prospect Companies: a page and optionally a `q` search on name and domain. An unknown parameter is refused. */
declare const listProspectCompaniesQuerySchema: z39.ZodObject<{
	cursor: z39.ZodOptional<z39.ZodString>;
	limit: z39.ZodDefault<z39.ZodPipe<z39.ZodPipe<z39.ZodUnion<readonly [z39.ZodNumber, z39.ZodString]>, z39.ZodTransform<number, string | number>>, z39.ZodNumber>>;
	q: z39.ZodOptional<z39.ZodPipe<z39.ZodString, z39.ZodString>>;
}, z39.core.$strict>;
/** The query parameters of a request to list Prospect Companies. */
type ListProspectCompaniesQuery = z39.infer<typeof listProspectCompaniesQuerySchema>;
/** One page of Prospect Companies, newest first (by `createdAt`, then id, both descending). */
declare const listProspectCompaniesResponseSchema: z39.ZodObject<{
	items: z39.ZodArray<z39.ZodObject<{
		id: z39.core.$ZodBranded<z39.ZodString, "pco", "out">;
		fields: z39.ZodObject<{
			name: z39.ZodObject<{
				value: z39.ZodString;
				source: z39.ZodUnion<readonly [z39.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z39.ZodString]>;
				sourceRef: z39.ZodNullable<z39.ZodString>;
				setAt: z39.ZodISODateTime;
				setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
			}, z39.core.$strip>;
			domain: z39.ZodOptional<z39.ZodObject<{
				value: z39.ZodString;
				source: z39.ZodUnion<readonly [z39.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z39.ZodString]>;
				sourceRef: z39.ZodNullable<z39.ZodString>;
				setAt: z39.ZodISODateTime;
				setByUserId: z39.ZodNullable<z39.core.$ZodBranded<z39.ZodString, "usr", "out">>;
			}, z39.core.$strip>>;
		}, z39.core.$strip>;
		createdAt: z39.ZodISODateTime;
		updatedAt: z39.ZodISODateTime;
	}, z39.core.$strip>>;
	nextCursor: z39.ZodNullable<z39.ZodString>;
}, z39.core.$strip>;
/** One page of Prospect Companies. */
type ListProspectCompaniesResponse = z39.infer<typeof listProspectCompaniesResponseSchema>;
/** The position in a Prospect Company list. */
declare const prospectCompanyCursorSchema: z39.ZodObject<{
	createdAt: z39.ZodISODateTime;
	id: z39.core.$ZodBranded<z39.ZodString, "pco", "out">;
}, z39.core.$strict>;
/** The position in a Prospect Company list. */
type ProspectCompanyCursor = z39.infer<typeof prospectCompanyCursorSchema>;
/** The roles that may do everything to every Prospect: merge, import, erase, assign in bulk. */
declare const PROSPECT_ADMIN_ROLES: readonly ["owner", "admin"];
/** The roles that may create, read and edit Prospects, each within what they may see (a Rep their own, a Manager their Team's Reps', Owner and Admin all). */
declare const PROSPECT_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The Prospect routes, by name. */
type ProspectRouteName = "createProspect" | "listProspects" | "getProspect" | "updateProspect" | "setProspectOwner" | "bulkAssignProspects" | "eraseProspect" | "listProspectFieldHistory" | "createProspectCompany" | "listProspectCompanies" | "getProspectCompany" | "updateProspectCompany" | "listProspectCompanyFieldHistory" | "listProspectDuplicates" | "mergeProspects" | "getProspectMerge" | "undoProspectMerge" | "uploadProspectImport" | "listProspectImports" | "getProspectImport" | "listProspectImportRows" | "downloadProspectImportReport";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type ProspectRoute = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when the route accepts an `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly ProspectErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The Prospect routes (spec M2), described as `SALES_HISTORY_ROUTES` describes its routes. Every
* route may also return the common `auth.*`, `rate.limited` and `server.*` codes. Every list is
* cursor-paginated with at most 100 items per page. A record of another Organization is always
* `prospect.not_found`. Source and actor are set by core from the route and the token, never read
* from a body.
*/
declare const PROSPECT_ROUTES: Readonly<Record<ProspectRouteName, ProspectRoute>>;
import { z as z40 } from "zod";
/** True when the text holds a control character; line breaks and tabs are allowed when `allowLineBreaks` is set. */
declare function hasControlCharacter(text: string, allowLineBreaks: boolean): boolean;
/** Trimmed text of 1 to `maxLength` characters with no control character; a request value is untrusted text for display code. */
declare function boundedTextSchema(maxLength: number): z40.ZodPipe<z40.ZodString, z40.ZodString>;
/** The longest first or last name, in characters. */
declare const MAX_PROSPECT_NAME_PART_LENGTH = 100;
/** The longest job title, in characters. */
declare const MAX_PROSPECT_JOB_TITLE_LENGTH = 200;
/** The longest Prospect Company name, in characters. */
declare const MAX_PROSPECT_COMPANY_NAME_LENGTH = 200;
/** The longest Prospect note, in characters. */
declare const MAX_PROSPECT_NOTES_LENGTH = 5e3;
/** The longest tag, in characters. */
declare const MAX_PROSPECT_TAG_LENGTH = 50;
/** The most tags one Prospect carries. */
declare const MAX_PROSPECT_TAGS = 20;
/** The longest search text of a list request, in characters. */
declare const MAX_PROSPECT_SEARCH_LENGTH = 100;
/** The longest value a stored field returns, in characters. */
declare const MAX_PROSPECT_FIELD_VALUE_LENGTH = 320;
/** The longest Source reference (an import job id, a CRM record id), in characters. */
declare const MAX_SOURCE_REF_LENGTH = 200;
/** A first or last name in a request: trimmed, 1 to 100 characters, no control character. */
declare const prospectNamePartSchema: z40.ZodPipe<z40.ZodString, z40.ZodString>;
/** A job title in a request: trimmed, 1 to 200 characters, no control character. */
declare const prospectJobTitleSchema: z40.ZodPipe<z40.ZodString, z40.ZodString>;
/** A Prospect Company name in a request: trimmed, 1 to 200 characters, no control character. */
declare const prospectCompanyNameSchema: z40.ZodPipe<z40.ZodString, z40.ZodString>;
/** Free-text notes on a Prospect: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
declare const prospectNotesSchema: z40.ZodPipe<z40.ZodString, z40.ZodString>;
/** The tags of a Prospect in a request: at most 20, each trimmed and 1 to 50 characters, no duplicates. */
declare const prospectTagsSchema: z40.ZodArray<z40.ZodPipe<z40.ZodString, z40.ZodString>>;
/**
* A phone number as typed in a request: 3 to 40 characters of digits, spaces, `+`, `(`, `)`, `.`
* and `-`. Core normalises it to E.164 (ADR 0011) and refuses what it cannot, as `request.invalid`.
*/
declare const rawPhoneSchema: z40.ZodPipe<z40.ZodString, z40.ZodString>;
/** A phone number in E.164 form, as a response carries a normalised one: `+` and 7 to 15 digits. */
declare const e164PhoneSchema: z40.ZodString;
/**
* A LinkedIn profile address as typed in a request: 1 to 300 characters naming `linkedin.com`.
* Core normalises it (ADR 0011) and refuses what it cannot, as `request.invalid`.
*/
declare const rawLinkedinUrlSchema: z40.ZodPipe<z40.ZodString, z40.ZodString>;
/**
* A company web domain in a request: folded to lower case, 3 to 253 characters, dotted ASCII
* labels of letters, digits and hyphens (an internationalised domain is sent in punycode).
*/
declare const prospectCompanyDomainSchema: z40.ZodPipe<z40.ZodPipe<z40.ZodString, z40.ZodTransform<string, string>>, z40.ZodString>;
/** The kinds of identity a Prospect is matched on (ADR 0011). */
declare const PROSPECT_IDENTITY_KINDS: readonly ["email", "phone", "linkedin"];
/** The kind of identity a Prospect is matched on. */
declare const prospectIdentityKindSchema: z40.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
}>;
/** The kind of identity a Prospect is matched on. */
type ProspectIdentityKind = z40.infer<typeof prospectIdentityKindSchema>;
/** The fields of a Prospect that carry a Source, in the camelCase the API uses. Email, phone and LinkedIn are also its identities. */
declare const PROSPECT_FIELD_NAMES: readonly ["firstName", "lastName", "jobTitle", "email", "phone", "linkedinUrl"];
/** The name of a Prospect field that carries a Source. */
declare const prospectFieldNameSchema: z40.ZodEnum<{
	email: "email";
	firstName: "firstName";
	jobTitle: "jobTitle";
	lastName: "lastName";
	linkedinUrl: "linkedinUrl";
	phone: "phone";
}>;
/** The name of a Prospect field that carries a Source. */
type ProspectFieldName = z40.infer<typeof prospectFieldNameSchema>;
/** The fields of a Prospect Company that carry a Source. */
declare const PROSPECT_COMPANY_FIELD_NAMES: readonly ["name", "domain"];
/** The name of a Prospect Company field that carries a Source. */
declare const prospectCompanyFieldNameSchema: z40.ZodEnum<{
	domain: "domain";
	name: "name";
}>;
/** The name of a Prospect Company field that carries a Source. */
type ProspectCompanyFieldName = z40.infer<typeof prospectCompanyFieldNameSchema>;
/** The most history entries kept per field (ADR 0020 bounds the history); the oldest non-current entries go first. */
declare const MAX_FIELD_HISTORY_ENTRIES = 50;
/** The Source kinds that are fixed words; `enrichment:<provider>` is the open one. */
declare const FIXED_SOURCE_KINDS: readonly ["manual", "import", "crm:hubspot", "crm:salesforce", "form"];
/**
* A Source kind (ADR 0020): `manual`, `import`, `crm:hubspot`, `crm:salesforce`, `form` or
* `enrichment:<provider>` with a provider of 1 to 32 lower-case letters, digits and underscores.
* Writers never choose it in a request body: core sets it from the route and the token.
*/
declare const sourceKindSchema: z40.ZodUnion<readonly [z40.ZodEnum<{
	"crm:hubspot": "crm:hubspot";
	"crm:salesforce": "crm:salesforce";
	form: "form";
	import: "import";
	manual: "manual";
}>, z40.ZodString]>;
/** A Source kind. */
type SourceKind = z40.infer<typeof sourceKindSchema>;
/**
* A stored value with where it came from, when and who set it (ADR 0020). `sourceRef` names the
* import job or CRM record and is `null` for manual entry; `setByUserId` is `null` when a system
* (an import job, a sync, a provider) set the value rather than a person.
*/
declare const fieldValueSchema: z40.ZodObject<{
	value: z40.ZodString;
	source: z40.ZodUnion<readonly [z40.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z40.ZodString]>;
	sourceRef: z40.ZodNullable<z40.ZodString>;
	setAt: z40.ZodISODateTime;
	setByUserId: z40.ZodNullable<z40.core.$ZodBranded<z40.ZodString, "usr", "out">>;
}, z40.core.$strip>;
/** A stored value with its Source, time and actor. */
type FieldValue = z40.infer<typeof fieldValueSchema>;
/** The states of a history entry: `current` is the value in force, `superseded` an earlier one, `suggested` an enrichment value kept beside an own value (ADR 0020). */
declare const FIELD_HISTORY_STATES: readonly ["current", "superseded", "suggested"];
/** The state of a history entry. */
declare const fieldHistoryStateSchema: z40.ZodEnum<{
	current: "current";
	suggested: "suggested";
	superseded: "superseded";
}>;
/** One entry of a field's history: the value with its Source, time and actor, and whether it is current, superseded or only suggested. */
declare const fieldHistoryEntrySchema: z40.ZodObject<{
	value: z40.ZodString;
	source: z40.ZodUnion<readonly [z40.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z40.ZodString]>;
	sourceRef: z40.ZodNullable<z40.ZodString>;
	setAt: z40.ZodISODateTime;
	setByUserId: z40.ZodNullable<z40.core.$ZodBranded<z40.ZodString, "usr", "out">>;
	state: z40.ZodEnum<{
		current: "current";
		suggested: "suggested";
		superseded: "superseded";
	}>;
}, z40.core.$strip>;
/** One entry of a field's history. */
type FieldHistoryEntry = z40.infer<typeof fieldHistoryEntrySchema>;
/** This library's package name, so a consumer can report which shared libraries it resolved. */
declare const PACKAGE = "tula-closeline-contract";
export { ABANDON_MAX_AGE_HOURS, ACCEPTED_DOCUMENT_EXTENSIONS, ACCEPTED_DOCUMENT_MEDIA_TYPES, ACCEPTED_RECORDING_EXTENSIONS, ACCEPTED_TRANSCRIPT_EXTENSIONS, ALL_PLAYBOOK_ERRORS, ALL_PLAYBOOK_ROUTES, AUTH_ERRORS, AUTH_OPTIONS_PATH, AUTH_OPTIONS_ROUTE, AcceptedCallExtension, AcceptedDocumentExtension, AddSuppressionRequest, AddTeamMemberRequest, AllPlaybookRouteName, AuthErrorCode, AuthOptionsResponse, AuthProviders, AuthRoute, BULK_ASSIGN_SYNC_LIMIT, BrowserSessionTokens, BulkAssignProspectsRequest, BulkAssignProspectsResponse, CALL_CHANNELS, CALL_DELETED_MESSAGE, CALL_FAILURE_FIXES, CALL_FAILURE_REASONS, CALL_KINDS, CALL_MEDIA_TYPES, CALL_REP_CHANGED_MESSAGE, CALL_STATES, CALL_TRANSCRIBED_MESSAGE, CALL_UPLOADED_MESSAGE, CONSENT_ADMIN_ROLES, CONSENT_ALL_ROLES, CONSENT_CHANNELS, CONSENT_ERRORS, CONSENT_EVENTS, CONSENT_FORM_STATES, CONSENT_GRANT_SOURCES, CONSENT_RECORDABLE_SOURCES, CONSENT_REQUIRED_CHANNELS, CONSENT_ROUTES, CONSENT_STATES, CONSENT_WITHDRAWAL_SOURCES, CONTACT_ALLOW_BASES, CONTACT_DENIAL_CODES, CONTACT_PURPOSES, CORE_ERRORS, CREATE_DEMO_REQUEST_ERROR_CODES, CREATE_INVITATION_ERROR_CODES, CSV_FAILURES, CURRENT_RIGHTS_WORDING_VERSION, Call, CallCursor, CallDeletedPayload, CallFailureFix, CallFailureReason, CallId, CallKind, CallMediaType, CallParams, CallRepChangedPayload, CallState, CallTranscribedPayload, CallUploadedPayload, CellResult, ChangeMemberRoleRequest, CheckCallFileResult, CheckDealImportHeaderResult, CheckDealImportHeaderTextResult, CheckDealImportRowResult, CheckUploadFileResult, CommonErrorCode, ConfirmRightsRequest, ConsentChannel, ConsentErrorCode, ConsentEvent, ConsentEventId, ConsentEventType, ConsentForm, ConsentFormId, ConsentFormState, ConsentGrantSource, ConsentRoute, ConsentRouteAccess, ConsentRouteName, ConsentSource, ConsentState, ConsentWithdrawalSource, ConsentWording, ConsentWordingId, ContactCheckId, ContactCheckLogEntry, ContactCheckRequest, ContactCheckResult, ContactDenialCode, ContactPurpose, CoreErrorCode, CreateConsentFormRequest, CreateConsentWordingRequest, CreateDemoRequestRequest, CreateDemoRequestResponse, CreateInvitationRequest, CreateProspectCompanyRequest, CreateProspectRequest, CreateTeamRequest, CsvFailure, CsvOptions, CsvResult, DAILY_LIMIT_DETAILS_SCHEMA, DEAL_CLOSED_AT_MAX_YEAR, DEAL_CLOSED_AT_MIN_YEAR, DEAL_IMPORT_FAILURE_REASONS, DEAL_IMPORT_FILE_FIELD, DEAL_IMPORT_HEADER_PREFIX_CHARS, DEAL_IMPORT_HEADER_PROBLEMS, DEAL_IMPORT_OPTIONAL_COLUMN, DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_ROW_REASONS, DEAL_IMPORT_ROW_RESULTS, DEAL_IMPORT_STATES, DEAL_IMPORT_UPLOADED_MESSAGE, DEAL_OUTCOME_CHANGED_MESSAGE, DEFAULT_MAX_CALLS, DEFAULT_MAX_DEALS, DEFAULT_MAX_DOCUMENTS, DEFAULT_MAX_DOCUMENT_BYTES_TOTAL, DEFAULT_MAX_RECORDING_BYTES_TOTAL, DEFAULT_PAGE_SIZE, DEFAULT_SEARCH_LIMIT, DELIVERY_FAILURE_REASONS, DOCUMENT_DELETED_MESSAGE, DOCUMENT_FAILURE_REASONS, DOCUMENT_RETENTION_DAYS, DOCUMENT_STATES, DOCUMENT_UPLOADED_MESSAGE, Deal, DealCursor, DealId, DealImport, DealImportCursor, DealImportFailureReason, DealImportHeaderProblem, DealImportId, DealImportParams, DealImportRow, DealImportRowCursor, DealImportRowReason, DealImportRowResult, DealImportState, DealImportUploadedPayload, DealOutcomeChangedPayload, DealParams, DealRecordId, DemoRequestId, DocumentDeletedPayload, DocumentFailureReason, DocumentFileName, DocumentId, DocumentMatch, DocumentMediaType, DocumentParams, DocumentSearchEvidence, DocumentState, DocumentUploadedPayload, DuplicateIdentityDetails, ERRORS, EVIDENCE_CSV_COLUMNS, Email, EraseProspectResponse, ErrorBody, ErrorDefinition, ErrorInput, EventId, EventType, EvidenceEvent, FIELD_HISTORY_STATES, FIXED_SOURCE_KINDS, FieldHistoryCursor, FieldHistoryEntry, FieldValue, FirstCsvRecordResult, GOOGLE_ERROR_PARAM, GOOGLE_ERROR_PATH, GOOGLE_ROUTES, GOOGLE_SIGN_UP_ATTEMPT_PARAM, GOOGLE_SIGN_UP_PATH, GoogleCompleteRequest, GoogleCompleteResponse, GoogleIntent, GoogleStartRequest, GoogleStartResponse, HostedConsentFormView, HostedConsentReceipt, HostedConsentSubmission, IDEMPOTENCY_KEY_HEADER, INCOMPLETE_UPLOAD_PARTS_TTL_HOURS, INTERNAL_CALL_ERRORS, INVITABLE_ROLES, INVITATION_STATES, Id, IdempotencyKey, InternalAbandonOrganizationParams, InternalAbandonOrganizationRequest, InternalAbandonOrganizationResponse, InternalAcceptInvitationRequest, InternalAcceptInvitationResponse, InternalCallName, InternalCreateOrganizationRequest, InternalCreateOrganizationResponse, InternalMembershipRequest, InternalMembershipResponse, InternalRemoveOrganizationDocumentsParams, InternalRemoveOrganizationDocumentsRequest, InternalRemoveOrganizationDocumentsResponse, InternalUpdateMemberProfileParams, InternalUpdateMemberProfileRequest, InternalUpdateMemberProfileResponse, InvitableRole, Invitation, InvitationId, InvitationParams, InvitationState, LIST_MEMBERS_MIN_ROLE, LIST_TEAM_MEMBERS_ERROR_CODES, LIST_TEAM_MEMBERS_MIN_ROLE, ListCallsQuery, ListCallsResponse, ListConsentEventsQuery, ListContactChecksQuery, ListDealImportRowsQuery, ListDealImportRowsResponse, ListDealImportsQuery, ListDealImportsResponse, ListDealsQuery, ListDealsResponse, ListDocumentsQuery, ListDocumentsResponse, ListFieldHistoryQuery, ListFieldHistoryResponse, ListInvitationsQuery, ListInvitationsResponse, ListMembersQuery, ListMembersResponse, ListProspectCompaniesQuery, ListProspectCompaniesResponse, ListProspectDuplicatesQuery, ListProspectDuplicatesResponse, ListProspectImportRowsQuery, ListProspectImportRowsResponse, ListProspectImportsQuery, ListProspectImportsResponse, ListProspectsQuery, ListProspectsResponse, ListSuppressionEntriesQuery, ListTeamMembersQuery, ListTeamMembersResponse, ListTeamsQuery, ListTeamsResponse, LookupDealRequest, MARKETING_ERRORS, MARKETING_ROUTES, MAX_AUTHORIZATION_URL_LENGTH, MAX_BULK_ASSIGN_PROSPECTS, MAX_CALL_SPEAKERS, MAX_CONSENT_FORM_NAME_LENGTH, MAX_CONSENT_WORDING_LENGTH, MAX_CURSOR_LENGTH, MAX_DEAL_ID_BYTES, MAX_DEAL_ID_LENGTH, MAX_DEAL_IMPORT_BYTES, MAX_DEAL_IMPORT_CELL_LENGTH, MAX_DEAL_IMPORT_HEADER_LENGTH, MAX_DEAL_IMPORT_ROWS, MAX_DEAL_NAME_BYTES, MAX_DEAL_NAME_LENGTH, MAX_DELETION_SEQ, MAX_DEMO_REQUEST_FIELD_LENGTH, MAX_DEMO_REQUEST_MESSAGE_LENGTH, MAX_DOCUMENT_BYTES, MAX_DOCUMENT_FILE_NAME_BYTES, MAX_DOCUMENT_FILE_NAME_LENGTH, MAX_DOCUMENT_PAGES, MAX_EMAIL_LENGTH, MAX_EVIDENCE_REF_LENGTH, MAX_FIELD_HISTORY_ENTRIES, MAX_MERGED_PROSPECTS, MAX_MOMENT_SNIPPET_CHARACTERS, MAX_NAME_LENGTH, MAX_PAGE_SIZE, MAX_PERSON_NAME_LENGTH, MAX_PROSPECT_COMPANY_NAME_LENGTH, MAX_PROSPECT_FIELD_VALUE_LENGTH, MAX_PROSPECT_IMPORT_BYTES, MAX_PROSPECT_IMPORT_ROWS, MAX_PROSPECT_JOB_TITLE_LENGTH, MAX_PROSPECT_NAME_PART_LENGTH, MAX_PROSPECT_NOTES_LENGTH, MAX_PROSPECT_SEARCH_LENGTH, MAX_PROSPECT_TAGS, MAX_PROSPECT_TAG_LENGTH, MAX_QUEUED_DEAL_IMPORTS, MAX_RECORDING_BYTES, MAX_RECORDING_SECONDS, MAX_REP_FIELD_LENGTH, MAX_REP_FOLLOWING_CHARACTERS, MAX_REP_FOLLOWING_TURNS, MAX_RETURN_TO_LENGTH, MAX_RIGHTS_HEADING_LENGTH, MAX_RIGHTS_PARAGRAPHS, MAX_RIGHTS_TEXT_LENGTH, MAX_RIGHTS_WORDING_VERSION, MAX_SEARCH_CANDIDATES, MAX_SEARCH_LIMIT, MAX_SEARCH_TEXT_CHARACTERS, MAX_SEARCH_TURNS, MAX_SEQ, MAX_SOURCE_REF_LENGTH, MAX_SPEAKER_EXCERPT_LENGTH, MAX_SPEAKER_LABEL_BYTES, MAX_SPEAKER_LABEL_LENGTH, MAX_SUPPRESSION_IMPORT_BYTES, MAX_SUPPRESSION_IMPORT_ROWS, MAX_SUPPRESSION_NOTE_LENGTH, MAX_TRANSCRIPT_BYTES, MAX_UTF8_BYTES_PER_CODE_POINT, MEDIA_TYPE_BY_CALL_EXTENSION, MEDIA_TYPE_BY_EXTENSION, MarketingErrorCode, MarketingRoute, MarketingRouteName, Member, MemberParams, MembershipId, MergeProspectsRequest, MomentMatch, OIDC_COOKIE_BASE_NAME, OIDC_COOKIE_SECURE_PREFIX, ONE_ADDRESS_MESSAGE, ORGANIZATION_STATUSES, OUTCOMES, OneClickUnsubscribeRequest, Organization, OrganizationId, OrganizationStatus, Outcome, PACKAGE, PLAYBOOK_ERRORS, PLAYBOOK_READ_ROLES, PLAYBOOK_ROUTES, PLAYBOOK_WRITE_ROLES, PROSPECT_ADMIN_ROLES, PROSPECT_ALL_ROLES, PROSPECT_COMPANY_FIELD_NAMES, PROSPECT_ERRORS, PROSPECT_EVENTS, PROSPECT_FIELD_NAMES, PROSPECT_IDENTITY_KINDS, PROSPECT_IMPORT_COLUMNS, PROSPECT_IMPORT_FAILURE_REASONS, PROSPECT_IMPORT_FILE_FIELD, PROSPECT_IMPORT_INVALID_REASONS, PROSPECT_IMPORT_REJECT_REASONS, PROSPECT_IMPORT_REPORT_COLUMNS, PROSPECT_IMPORT_ROW_RESULTS, PROSPECT_IMPORT_SKIP_REASONS, PROSPECT_IMPORT_STATES, PROSPECT_MERGE_STATES, PROSPECT_MERGE_UNDO_DAYS, PROSPECT_ROUTES, PROSPECT_STATUSES, Page, PageQuery, ParseRepFieldResult, ParsedDealImportRow, PlaybookDocument, PlaybookErrorCode, PlaybookRoute, PlaybookRouteName, Prospect, ProspectCompany, ProspectCompanyCursor, ProspectCompanyFieldName, ProspectCompanyFieldParams, ProspectCompanyId, ProspectCompanyParams, ProspectConsent, ProspectCursor, ProspectDuplicate, ProspectDuplicateCursor, ProspectErrorCode, ProspectEventType, ProspectFieldName, ProspectFieldParams, ProspectId, ProspectIdentityKind, ProspectImport, ProspectImportCursor, ProspectImportFailureReason, ProspectImportId, ProspectImportInvalidDetails, ProspectImportParams, ProspectImportRow, ProspectImportRowCursor, ProspectImportRowReason, ProspectImportRowResult, ProspectImportState, ProspectMerge, ProspectMergeId, ProspectMergeParams, ProspectNotFoundDetails, ProspectParams, ProspectRoute, ProspectRouteName, ProspectStatus, REGIONS, RIGHTS_WORDINGS, ROLES, RecordConsentRequest, RecordDeliveryFailureRequest, RecordWithdrawalRequest, RecordedConsent, Region, RemoveSuppressionRequest, RenameOrganizationRequest, RenameTeamRequest, RepChoice, RequestId, RetryAfterDetails, RightsConfirmation, RightsRequiredDetails, RightsStatus, RightsWording, Role, SALES_HISTORY_ERRORS, SALES_HISTORY_READ_ROLES, SALES_HISTORY_ROUTES, SEARCH_ROUTES, SIGNUP_ERRORS, SUPPRESSION_ADDRESS_KINDS, SUPPRESSION_IMPORT_COLUMNS, SUPPRESSION_IMPORT_FAILURE_REASONS, SUPPRESSION_IMPORT_FILE_FIELD, SUPPRESSION_IMPORT_ROW_RESULTS, SUPPRESSION_IMPORT_STATES, SUPPRESSION_REASONS, SUPPRESSION_REMOVABLE_REASONS, SalesHistoryErrorCode, SalesHistoryRoute, SalesHistoryRouteName, SearchDocumentsRequest, SearchDocumentsResponse, SearchEvidence, SearchMomentsRequest, SearchMomentsResponse, SearchRouteName, SearchTurn, SetCallRepRequest, SetDealOutcomeRequest, SetProspectOwnerRequest, SignupErrorCode, SourceKind, SpeakerExcerpt, SuppressionAddressKind, SuppressionEntry, SuppressionEntryId, SuppressionImport, SuppressionImportId, SuppressionImportRow, SuppressionReason, Team, TeamId, TeamMember, TeamMemberParams, TeamParams, UPLOAD_CONTENT_TYPE, UPLOAD_FILE_FIELD, UnsubscribePreview, UnsubscribeReceipt, UpdateConsentWordingRequest, UpdateProspectCompanyRequest, UpdateProspectRequest, UploadCallFields, UploadDocumentFile, UserId, WithdrawConsentRequest, addSuppressionRequestSchema, addTeamMemberRequestSchema, addressFieldsShape, attemptIdSchema, authOptionsResponseSchema, authProvidersSchema, authorizationUrlSchema, boundedTextSchema, browserSessionTokensSchema, bulkAssignProspectsRequestSchema, bulkAssignProspectsResponseSchema, calendarDateSchema, callChannelSchema, callCursorSchema, callDeletedPayloadSchema, callFailureReasonSchema, callIdSchema, callKindSchema, callListItemSchema, callMediaTypeSchema, callParamsSchema, callRepChangedPayloadSchema, callReuploadRequeues, callSchema, callStateSchema, callTranscribedPayloadSchema, callUploadedPayloadSchema, changeMemberRoleRequestSchema, channelConsentSchema, checkCallFile, checkDealImportHeader, checkDealImportHeaderText, checkDealImportRow, checkUploadFile, confirmRightsRequestSchema, consentChannelSchema, consentEventIdSchema, consentEventPageSchema, consentEventSchema, consentFormIdSchema, consentFormPageSchema, consentFormParamsSchema, consentFormSchema, consentFormStateSchema, consentGrantSourceSchema, consentGrantedEvent, consentProspectParamsSchema, consentSourceSchema, consentStateSchema, consentTokenParamsSchema, consentTokenSchema, consentWithdrawalSourceSchema, consentWithdrawnEvent, consentWordingIdSchema, consentWordingPageSchema, consentWordingParamsSchema, consentWordingSchema, consentWordingTextSchema, contactCheckIdSchema, contactCheckLogEntrySchema, contactCheckLogPageSchema, contactCheckRequestSchema, contactCheckResultSchema, contactDenialCodeSchema, contactPurposeSchema, createConsentFormRequestSchema, createConsentWordingRequestSchema, createDemoRequestRequestSchema, createDemoRequestResponseSchema, createInvitationRequestSchema, createProspectCompanyRequestSchema, createProspectRequestSchema, createTeamRequestSchema, dealAmountSchema, dealCurrencySchema, dealCursorSchema, dealIdSchema, dealImportCursorSchema, dealImportFailureReasonSchema, dealImportIdSchema, dealImportParamsSchema, dealImportRowCursorSchema, dealImportRowReasonSchema, dealImportRowResultSchema, dealImportRowSchema, dealImportSchema, dealImportStateSchema, dealImportUploadedPayloadSchema, dealNameSchema, dealOutcomeChangedPayloadSchema, dealParamsSchema, dealRecordIdSchema, dealSchema, decodeCursor, defineErrors, defineEvent, demoRequestIdSchema, demoRequestMessageSchema, demoRequestSourcePageSchema, documentDeletedPayloadSchema, documentExtension, documentFailureReasonSchema, documentFileNameSchema, documentIdSchema, documentMatchSchema, documentMediaTypeSchema, documentParamsSchema, documentQueryText, documentSchema, documentSearchEvidenceSchema, documentSizeCheckSchema, documentStateSchema, documentTypeCheckSchema, documentUploadedPayloadSchema, duplicateIdentityDetailsSchema, e164PhoneSchema, emailSchema, encodeCursor, eraseProspectResponseSchema, errorBodySchema, errorCodeSchema, eventEnvelopeSchema, eventIdSchema, eventTypeSchema, evidenceEventSchema, evidencePageSchema, evidenceRefSchema, excerptText, fieldHistoryCursorSchema, fieldHistoryEntrySchema, fieldHistoryStateSchema, fieldValueSchema, firstCsvRecord, foldAscii, formatId, googleCompleteRequestSchema, googleCompleteResponseSchema, googleErrorQuerySchema, googleIntentSchema, googleSignUpQuerySchema, googleStartRequestSchema, googleStartResponseSchema, hasControlCharacter, hasExactlyOneAddress, hasStrippableCharacter, hostedConsentFormViewSchema, hostedConsentReceiptSchema, hostedConsentSubmissionSchema, idSchema, idempotencyKeySchema, internalAbandonOrganizationParamsSchema, internalAbandonOrganizationRequestSchema, internalAbandonOrganizationResponseSchema, internalAcceptInvitationRequestSchema, internalAcceptInvitationResponseSchema, internalCreateOrganizationRequestSchema, internalCreateOrganizationResponseSchema, internalMembershipRequestSchema, internalMembershipResponseSchema, internalRemoveOrganizationDocumentsParamsSchema, internalRemoveOrganizationDocumentsRequestSchema, internalRemoveOrganizationDocumentsResponseSchema, internalUpdateMemberProfileParamsSchema, internalUpdateMemberProfileRequestSchema, internalUpdateMemberProfileResponseSchema, invitableRoleSchema, invitationIdSchema, invitationParamsSchema, invitationSchema, invitationStateSchema, invitationTokenSchema, isBlankCsvRecord, isWellFormedText, listCallsQuerySchema, listCallsResponseSchema, listConsentEventsQuerySchema, listConsentFormsQuerySchema, listConsentWordingsQuerySchema, listContactChecksQuerySchema, listDealImportRowsQuerySchema, listDealImportRowsResponseSchema, listDealImportsQuerySchema, listDealImportsResponseSchema, listDealsQuerySchema, listDealsResponseSchema, listDocumentsQuerySchema, listDocumentsResponseSchema, listEvidenceQuerySchema, listFieldHistoryQuerySchema, listFieldHistoryResponseSchema, listInvitationsQuerySchema, listInvitationsResponseSchema, listMembersQuerySchema, listMembersResponseSchema, listProspectCompaniesQuerySchema, listProspectCompaniesResponseSchema, listProspectDuplicatesQuerySchema, listProspectDuplicatesResponseSchema, listProspectImportRowsQuerySchema, listProspectImportRowsResponseSchema, listProspectImportsQuerySchema, listProspectImportsResponseSchema, listProspectsQuerySchema, listProspectsResponseSchema, listSuppressionEntriesQuerySchema, listSuppressionImportRowsQuerySchema, listSuppressionImportsQuerySchema, listTeamMembersQuerySchema, listTeamMembersResponseSchema, listTeamsQuerySchema, listTeamsResponseSchema, lookupDealRequestSchema, lookupSuppressionRequestSchema, maskedAddressSchema, memberParamsSchema, memberSchema, membershipIdSchema, mergeProspectsRequestSchema, momentMatchSchema, momentQueryText, momentSnippet, momentSnippetSchema, normaliseDealId, normaliseFileName, normaliseMediaType, normaliseSpeakerLabel, oneClickUnsubscribeRequestSchema, organizationIdSchema, organizationNameSchema, organizationSchema, organizationStatusSchema, outcomeSchema, pageQuerySchema, pageSchema, parseAmountCell, parseClosedAtCell, parseCsv, parseCurrencyCell, parseOutcomeCell, parseRepField, personNameSchema, prospectCompanyCursorSchema, prospectCompanyDomainSchema, prospectCompanyFieldNameSchema, prospectCompanyFieldParamsSchema, prospectCompanyIdSchema, prospectCompanyNameSchema, prospectCompanyParamsSchema, prospectCompanySchema, prospectConsentSchema, prospectCreatedEvent, prospectCursorSchema, prospectDuplicateCursorSchema, prospectDuplicateSchema, prospectErasedEvent, prospectFieldNameSchema, prospectFieldParamsSchema, prospectIdSchema, prospectIdentityKindSchema, prospectImportCursorSchema, prospectImportFailureReasonSchema, prospectImportIdSchema, prospectImportInvalidDetailsSchema, prospectImportParamsSchema, prospectImportRowCursorSchema, prospectImportRowReasonSchema, prospectImportRowResultSchema, prospectImportRowSchema, prospectImportSchema, prospectImportStateSchema, prospectJobTitleSchema, prospectMergeIdSchema, prospectMergeParamsSchema, prospectMergeSchema, prospectMergeUndoneEvent, prospectMergedEvent, prospectNamePartSchema, prospectNotFoundDetailsSchema, prospectNotesSchema, prospectParamsSchema, prospectSchema, prospectSearchSchema, prospectStatusSchema, prospectTagsSchema, prospectUpdatedEvent, rawLinkedinUrlSchema, rawPhoneSchema, recordConsentRequestSchema, recordDeliveryFailureRequestSchema, recordWithdrawalRequestSchema, recordedConsentSchema, recordedSuppressionSchema, regionSchema, removeSuppressionRequestSchema, renameOrganizationRequestSchema, renameTeamRequestSchema, repChangeAllowed, repChoiceSchema, repChoiceSuits, requestIdSchema, retryAfterDetailsSchema, returnToSchema, rightsConfirmationSchema, rightsRequiredDetailsSchema, rightsStatusSchema, rightsWordingFor, rightsWordingSchema, rightsWordingVersionSchema, roleAtLeast, roleSchema, searchDocumentsRequestSchema, searchDocumentsResponseSchema, searchEvidenceSchema, searchMomentsRequestSchema, searchMomentsResponseSchema, searchTurnSchema, setCallRepRequestSchema, setDealOutcomeRequestSchema, setProspectOwnerRequestSchema, sourceKindSchema, speakerExcerpt, speakerExcerptSchema, speakerLabelSchema, storedNameSchema, suppressionAddedEvent, suppressionAddressKindSchema, suppressionEntryIdSchema, suppressionEntryPageSchema, suppressionEntryParamsSchema, suppressionEntrySchema, suppressionImportIdSchema, suppressionImportPageSchema, suppressionImportParamsSchema, suppressionImportRowPageSchema, suppressionImportRowSchema, suppressionImportSchema, suppressionImportStateSchema, suppressionListStateSchema, suppressionReasonSchema, suppressionRemovedEvent, teamIdSchema, teamMemberParamsSchema, teamMemberSchema, teamNameSchema, teamParamsSchema, teamSchema, timestampSchema, unsubscribePreviewSchema, unsubscribeReceiptSchema, updateConsentWordingRequestSchema, updateProspectCompanyRequestSchema, updateProspectRequestSchema, uploadCallFieldsSchema, uploadCallFileSchema, uploadDocumentFileSchema, userIdSchema, withdrawConsentRequestSchema };
