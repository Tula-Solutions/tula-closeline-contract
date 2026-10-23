// src/errors.ts
import { z } from "zod";
var CODE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
var AREA_PATTERN = /^[a-z][a-z0-9_]*$/;
var errorCodeSchema = z.string().max(100).regex(CODE_PATTERN);
var errorBodySchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string().min(1).max(2000),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
var freezeEntry = (code, status, message) => Object.freeze({ code, status, message });
var common = [
  freezeEntry("request.invalid", 400, "The request is not valid."),
  freezeEntry("request.not_found", 404, "The resource was not found."),
  freezeEntry("request.conflict", 409, "The request conflicts with the current state."),
  freezeEntry("request.idempotency_key_reused", 422, "The idempotency key was already used with a different request."),
  freezeEntry("request.idempotency_in_progress", 409, "A request with this idempotency key is still in progress. Try again shortly."),
  freezeEntry("request.too_large", 413, "The request body is too large."),
  freezeEntry("request.method_not_allowed", 405, "This method is not allowed for this route."),
  freezeEntry("request.unsupported_media_type", 415, "The request content type is not supported."),
  freezeEntry("request.unprocessable", 422, "The request cannot be processed."),
  freezeEntry("auth.unauthenticated", 401, "Authentication is required."),
  freezeEntry("auth.forbidden", 403, "You are not allowed to do this."),
  freezeEntry("auth.token_expired", 401, "The access token has expired. Refresh it and try again."),
  freezeEntry("auth.token_invalid", 401, "The access token is not valid."),
  freezeEntry("auth.unavailable", 503, "Tokens cannot be verified right now. Try again later."),
  freezeEntry("rate.limited", 429, "Too many requests. Try again later."),
  freezeEntry("server.internal", 500, "Something went wrong on our side."),
  freezeEntry("server.unavailable", 503, "The service is temporarily unavailable."),
  freezeEntry("server.timeout", 504, "The request took too long to complete.")
];
var ERRORS = Object.freeze(Object.fromEntries(common.map((entry) => [entry.code, entry])));
var statusSchema = z.number().int().min(400).max(599);
var messageSchema = z.string().min(1).max(2000);
function defineErrors(area, entries) {
  if (!AREA_PATTERN.test(area)) {
    throw new Error(`Invalid error area: ${area}`);
  }
  const registry = {};
  for (const [reason, input] of Object.entries(entries)) {
    const code = errorCodeSchema.parse(`${area}.${reason}`);
    if (code in ERRORS || code in registry) {
      throw new Error(`Duplicate error code: ${code}`);
    }
    registry[code] = Object.freeze({
      code,
      status: statusSchema.parse(input.status),
      message: messageSchema.parse(input.message)
    });
  }
  return Object.freeze(registry);
}

// src/core/values.ts
import { z as z2 } from "zod";
var MAX_NAME_LENGTH = 200;
function hasControlCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 32 || code >= 127 && code <= 159) {
      return true;
    }
  }
  return false;
}
function isWellFormed(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 55296 && code <= 56319) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 56320 && next <= 57343)) {
        return false;
      }
      index += 1;
    } else if (code >= 56320 && code <= 57343) {
      return false;
    }
  }
  return true;
}
var MAX_RAW_NAME_LENGTH = 1000;
function boundedName(maxLength) {
  return z2.string().max(MAX_RAW_NAME_LENGTH).trim().pipe(z2.string().min(1).max(maxLength).refine(isWellFormed, "Well-formed text only").refine((text) => !hasControlCharacter(text), "No control characters"));
}
var nameSchema = boundedName(MAX_NAME_LENGTH);
var organizationNameSchema = nameSchema;
var teamNameSchema = nameSchema;
var MAX_PERSON_NAME_LENGTH = 201;
var personNameSchema = boundedName(MAX_PERSON_NAME_LENGTH);
var storedNameSchema = z2.string().min(1).max(1000);
var INVITATION_STATES = ["pending", "accepted", "revoked"];
var invitationStateSchema = z2.enum(INVITATION_STATES);
var timestampSchema = z2.iso.datetime({ offset: true }).max(64);
var invitationTokenSchema = z2.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var retryAfterDetailsSchema = z2.strictObject({
  retryAfter: z2.number().int().positive()
});
var IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
var idempotencyKeySchema = z2.string().min(16).max(128).regex(/^[A-Za-z0-9_.:-]+$/);

// src/core/errors.ts
var CORE_ERRORS = {
  ...defineErrors("organization", {
    not_found: { status: 404, message: "The Organization was not found." },
    suspended: { status: 403, message: "This Organization is suspended." },
    deleted: { status: 410, message: "This Organization has been deleted." },
    not_abandonable: { status: 409, message: "This Organization cannot be abandoned." }
  }),
  ...defineErrors("member", {
    not_found: { status: 404, message: "The member was not found." },
    last_owner: {
      status: 409,
      message: "The last Owner cannot be removed or demoted. Promote a different member to Owner first."
    }
  }),
  ...defineErrors("membership", {
    already_member: { status: 409, message: "You already belong to an Organization." }
  }),
  ...defineErrors("invitation", {
    invalid: { status: 422, message: "The invitation is not valid." },
    not_found: { status: 404, message: "The invitation was not found." },
    already_pending: {
      status: 409,
      message: "A matching invitation is already pending. Revoke it to send a new one."
    },
    already_member: {
      status: 409,
      message: "The invitee is already a member of this Organization."
    },
    pending_limit: {
      status: 409,
      message: "This Organization has too many pending invitations. Revoke some to send more."
    },
    daily_limit: {
      status: 429,
      message: "This Organization has sent too many invitations today. Try again later."
    }
  }),
  ...defineErrors("team", {
    not_found: { status: 404, message: "The Team was not found." },
    name_taken: { status: 409, message: "A Team with that name already exists." }
  })
};
var DAILY_LIMIT_DETAILS_SCHEMA = retryAfterDetailsSchema;
var SIGNUP_ERRORS = {
  ...defineErrors("auth", {
    no_organization: {
      status: 403,
      message: "You do not belong to an Organization, so you cannot sign in."
    }
  }),
  ...defineErrors("signup", {
    invitation_invalid: { status: 422, message: "The invitation is not valid." },
    organization_name_invalid: { status: 422, message: "Enter a valid Organization name." }
  }),
  ...defineErrors("membership", {
    unavailable: {
      status: 503,
      message: "Organization membership is unavailable right now. Try again shortly."
    }
  })
};

// src/auth/errors.ts
var AUTH_ERRORS = {
  ...defineErrors("auth", {
    invalid_credentials: { status: 401, message: "The email address or password is not right." },
    user_banned: { status: 403, message: "This account cannot sign in." }
  }),
  ...defineErrors("email", {
    invalid: { status: 422, message: "Enter a valid email address." }
  }),
  ...defineErrors("password", {
    too_short: { status: 422, message: "The password is too short." },
    too_long: { status: 422, message: "The password is too long." },
    contains_user_info: { status: 422, message: "The password contains your name or email." },
    common: { status: 422, message: "The password is too common." },
    breached: {
      status: 422,
      message: "The password appeared in a data breach. Choose a different one."
    }
  }),
  ...defineErrors("verification", {
    invalid_code: { status: 422, message: "The code is not right." },
    expired: { status: 422, message: "The code has expired. Ask for a new one." },
    too_many_attempts: { status: 429, message: "Too many wrong codes. Ask for a new one." }
  }),
  ...defineErrors("flow", {
    not_found: { status: 404, message: "This sign-in or sign-up was not found or has ended." },
    invalid_step: { status: 409, message: "This step is not available now. Start again." }
  }),
  ...SIGNUP_ERRORS,
  "organization.deleted": CORE_ERRORS["organization.deleted"],
  ...defineErrors("oidc", {
    disabled: { status: 404, message: "Sign in with Google is not available." },
    state_invalid: {
      status: 400,
      message: "This sign-in has expired or is not valid. Start again."
    },
    email_unverified: { status: 403, message: "Google has not verified this email address." },
    access_denied: { status: 400, message: "Sign in with Google was cancelled." },
    provider_unavailable: {
      status: 503,
      message: "Google is not available right now. Try again later."
    },
    invitation_mismatch: {
      status: 403,
      message: "Use the Google account that matches the invited email address."
    }
  }),
  ...defineErrors("mail", {
    unavailable: { status: 503, message: "The email could not be sent right now. Try again." }
  }),
  ...defineErrors("session", {
    invalid_token: { status: 401, message: "The refresh token is not valid." },
    revoked: { status: 401, message: "This session has ended." },
    expired: { status: 401, message: "This session has expired. Sign in again." },
    reuse_detected: {
      status: 401,
      message: "A refresh token was used twice, so the session was ended. Sign in again."
    }
  })
};
// src/auth/oidc.ts
import { z as z5 } from "zod";

// src/ids.ts
import { z as z3 } from "zod";
var PREFIX_PATTERN = /^[a-z]{2,5}$/;
function idSchema(prefix) {
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(`Invalid id prefix: ${prefix}`);
  }
  return z3.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`)).brand();
}
var organizationIdSchema = idSchema("org");
var userIdSchema = idSchema("usr");
var membershipIdSchema = idSchema("mem");
var teamIdSchema = idSchema("team");
var invitationIdSchema = idSchema("inv");
var prospectIdSchema = idSchema("prs");
var prospectCompanyIdSchema = idSchema("pco");
var prospectImportIdSchema = idSchema("pimp");
var prospectMergeIdSchema = idSchema("pmrg");
var consentEventIdSchema = idSchema("cev");
var consentWordingIdSchema = idSchema("cwd");
var suppressionEntryIdSchema = idSchema("sup");
var consentFormIdSchema = idSchema("cfm");
var contactCheckIdSchema = idSchema("chk");
var suppressionImportIdSchema = idSchema("simp");
var documentIdSchema = idSchema("doc");
var dealRecordIdSchema = idSchema("deal");
var callIdSchema = idSchema("call");
var dealImportIdSchema = idSchema("dimp");
var eventIdSchema = idSchema("evt");
var requestIdSchema = idSchema("req");
var demoRequestIdSchema = idSchema("dreq");
var UUID_PATTERN = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
function formatId(prefix, uuid) {
  if (typeof uuid !== "string" || !UUID_PATTERN.test(uuid)) {
    throw new Error("Not a UUID: expected 32 hexadecimal characters or the 8-4-4-4-12 form");
  }
  const hex = uuid.replaceAll("-", "").toLowerCase();
  return idSchema(prefix).parse(`${prefix}_${hex}`);
}

// src/tenancy.ts
import { z as z4 } from "zod";
var REGIONS = ["us", "eu"];
var regionSchema = z4.enum(REGIONS);
var ROLES = ["owner", "admin", "manager", "rep"];
var roleSchema = z4.enum(ROLES);
function roleAtLeast(role, minimum) {
  const have = ROLES.indexOf(role);
  const need = ROLES.indexOf(minimum);
  return have !== -1 && need !== -1 && have <= need;
}
var INVITABLE_ROLES = ["admin", "manager", "rep"];
var invitableRoleSchema = z4.enum(INVITABLE_ROLES);
var ORGANIZATION_STATUSES = ["active", "suspended", "deleted"];
var organizationStatusSchema = z4.enum(ORGANIZATION_STATUSES);

// src/auth/oidc.ts
var MAX_RETURN_TO_LENGTH = 512;
var MAX_AUTHORIZATION_URL_LENGTH = 2048;
function hasUnsafeCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code <= 31 || code >= 127 && code <= 159 || code === 1564 || code === 8206 || code === 8207 || code >= 8234 && code <= 8238 || code >= 8294 && code <= 8297) {
      return true;
    }
    if (code >= 55296 && code <= 56319) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 56320 && next <= 57343)) {
        return true;
      }
      index += 1;
    } else if (code >= 56320 && code <= 57343) {
      return true;
    }
  }
  return false;
}
var DOT_SEGMENTS = new Set([".", ".."]);
function isLocalPath(path, raw) {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\") || path.includes("\\") || hasUnsafeCharacter(path)) {
    return false;
  }
  if (raw && /[\s\p{Cf}]/u.test(path)) {
    return false;
  }
  return !path.split(/[?#]/)[0]?.split("/").some((segment) => DOT_SEGMENTS.has(segment));
}
var returnToSchema = z5.string().refine((path) => path.length <= MAX_RETURN_TO_LENGTH, "Within the length limit").refine((path) => isLocalPath(path, true), "A path on this site").refine((path) => {
  try {
    return isLocalPath(decodeURIComponent(path), false);
  } catch {
    return false;
  }
}, "A path on this site");
var googleIntentSchema = z5.enum(["sign_in", "sign_up"]);
var googleStartRequestSchema = z5.strictObject({
  intent: googleIntentSchema,
  returnTo: returnToSchema.optional()
});
function isLoopbackHost(hostname) {
  if (hostname === "localhost" || hostname === "[::1]") {
    return true;
  }
  const octets = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  return octets !== null && octets.slice(1).every((octet) => Number(octet) <= 255);
}
function isAuthorizationUrl(text) {
  if (hasUnsafeCharacter(text) || text !== text.trim()) {
    return false;
  }
  let url;
  try {
    url = new URL(text);
  } catch {
    return false;
  }
  if (url.username !== "" || url.password !== "") {
    return false;
  }
  return url.protocol === "https:" || url.protocol === "http:" && isLoopbackHost(url.hostname);
}
var authorizationUrlSchema = z5.string().max(MAX_AUTHORIZATION_URL_LENGTH).refine(isAuthorizationUrl, "An https URL, or http to a loopback host");
var googleStartResponseSchema = z5.strictObject({
  authorizationUrl: authorizationUrlSchema
});
var attemptIdSchema = z5.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
var GOOGLE_SIGN_UP_PATH = "/sign-up/google";
var GOOGLE_SIGN_UP_ATTEMPT_PARAM = "attempt";
var GOOGLE_ERROR_PATH = "/sign-in";
var GOOGLE_ERROR_PARAM = "error";
var OIDC_COOKIE_BASE_NAME = "tula_oidc";
var OIDC_COOKIE_SECURE_PREFIX = "__Secure-";
var googleSignUpQuerySchema = z5.strictObject({
  [GOOGLE_SIGN_UP_ATTEMPT_PARAM]: attemptIdSchema
});
var googleErrorQuerySchema = z5.strictObject({
  [GOOGLE_ERROR_PARAM]: errorCodeSchema
});
var storable = (text) => !text.includes(String.fromCharCode(0)) && !hasUnsafeCharacter(text);
var googleCompleteRequestSchema = z5.strictObject({
  attemptId: attemptIdSchema,
  organizationName: z5.string().trim().min(1).max(120).refine(storable, "Storable text").optional(),
  invitationToken: z5.string().min(1).max(512).refine(storable, "Storable text").optional()
}).refine((body) => body.organizationName === undefined !== (body.invitationToken === undefined), {
  message: "Send exactly one of organizationName and invitationToken.",
  path: ["organizationName"]
});
var browserSessionTokensSchema = z5.strictObject({
  sessionId: z5.string().min(1).max(128),
  accessToken: z5.string().min(1).max(4096),
  accessTokenExpiresAt: timestampSchema,
  organization: z5.strictObject({ id: z5.string().min(1).max(128), role: roleSchema }),
  userId: userIdSchema.optional()
});
var googleCompleteResponseSchema = z5.object({
  id: z5.string().min(1).max(128),
  kind: z5.enum(["sign_in", "sign_up"]),
  expiresAt: timestampSchema,
  step: z5.object({ status: z5.literal("complete") }),
  session: browserSessionTokensSchema
});
var authProvidersSchema = z5.object({ google: z5.boolean().default(false) });
var AUTH_OPTIONS_PATH = "/v1/client/auth-options";
var authOptionsResponseSchema = z5.object({
  providers: authProvidersSchema.default({ google: false })
});
var route = (definition) => Object.freeze(definition);
var AUTH_OPTIONS_ROUTE = route({
  method: "GET",
  path: AUTH_OPTIONS_PATH,
  success: [200],
  errors: [],
  redirectErrors: [],
  commonErrors: ["rate.limited", "server.unavailable"],
  description: "Tells a client which sign-in providers are on, so the portal can hide the Continue with Google button when Google is not set up. The auth service owns this route; it is a new route, not a change to an existing one. It needs no session and returns nothing about any account."
});
var GOOGLE_ROUTES = Object.freeze({
  start: route({
    method: "POST",
    path: "/v1/client/google/start",
    success: [200],
    errors: ["oidc.disabled", "oidc.provider_unavailable"],
    redirectErrors: [],
    commonErrors: ["request.invalid", "rate.limited", "server.unavailable"],
    description: "Starts a Sign in with Google with an intent (sign_in or sign_up) and an optional same-origin returnTo path. It runs the OpenID Connect authorization-code flow with PKCE (S256), a state and a nonce, keeps them in an attempt that lives 10 minutes, sets a short-lived attempt cookie (named tula_oidc, with the __Secure- prefix outside local only, because Safari refuses a __Secure- cookie over http even on loopback) that holds the attempt secret, and answers the authorizationUrl to send the browser to (https, or http to a loopback host in local development; a consumer also checks its host against an allow-list). It asks for openid, email and profile only, with no offline access. The returnTo is checked against the portal route allow-list and kept in the attempt; it is never read from the callback. oidc.disabled (404) when Google is not set up; oidc.provider_unavailable (503) with a Retry-After header when Google cannot be reached."
  }),
  callback: route({
    method: "GET",
    path: "/v1/client/google/callback",
    success: [302],
    errors: ["oidc.disabled"],
    redirectErrors: [
      "oidc.state_invalid",
      "oidc.email_unverified",
      "oidc.access_denied",
      "oidc.provider_unavailable",
      "auth.user_banned",
      "auth.no_organization",
      "organization.deleted",
      "membership.unavailable"
    ],
    commonErrors: ["rate.limited", "server.unavailable"],
    description: "Where Google sends the browser back, with a code and a state (or an error). The state must match the attempt cookie and the attempt is single-use; a replayed, expired or mismatched state is oidc.state_invalid. If the person cancels at Google (error=access_denied) the code is oidc.access_denied, and any other error from Google is oidc.provider_unavailable. The code is exchanged once, with the PKCE verifier, and the ID token is verified (RS256 only, issuer, audience, expiry, nonce, a present sub and email, and a verified email). A Google account that is already known, by its sub and never by its email, is signed in with the same checks as a password sign-in, and the answer is a 302 to the portal with the refresh cookie on it. No token appears in a URL. A new Google user is created by nothing here: the 302 goes to /sign-up/google?attempt=<id> and the person finishes with complete. An existing password account with the same email is linked only when Google verified the email, else oidc.email_unverified. It answers every outcome with a 302 except oidc.disabled (404): a failure redirects the browser to /sign-in?error=<code>, so oidc.state_invalid, oidc.email_unverified, oidc.access_denied, oidc.provider_unavailable (whose catalogue status is 503, with a Retry-After header only where it is a real response), auth.user_banned, auth.no_organization, organization.deleted and membership.unavailable come back as the error parameter of that redirect, and the catalogue status of a code is not the HTTP status of this response. Codes, tokens and Authorization headers are never logged."
  }),
  complete: route({
    method: "POST",
    path: "/v1/client/google/complete",
    success: [200],
    errors: [
      "oidc.disabled",
      "oidc.state_invalid",
      "oidc.invitation_mismatch",
      "oidc.provider_unavailable",
      "signup.invitation_invalid",
      "signup.organization_name_invalid",
      "membership.already_member",
      "auth.no_organization",
      "organization.deleted",
      "membership.unavailable"
    ],
    redirectErrors: [],
    commonErrors: ["request.invalid", "rate.limited", "server.unavailable"],
    description: "Finishes the sign-up of a new Google user: it takes the attempt id (the secret is in the cookie) and exactly one of an organizationName or an invitationToken. It creates the Organization or joins the invited one through the same sign-up path as an email sign-up, with no emailed code because Google verified the email, and stores the user and a google identity with no password. For an invitation the Google email must equal the invited address, else oidc.invitation_mismatch (403); a user who already belongs to an Organization gets membership.already_member (409). An attempt that is missing, used or expired is oidc.state_invalid (400). An attempt is single-use. A repeat is refused with oidc.state_invalid (400) and nothing is created twice. Answers the browser flow response (id, kind, expiresAt, a complete step and the session); the refresh token is in the cookie, never in the body. The attempt secret, tokens and the email are never logged."
  })
});
// src/consent/contact-check.ts
import { z as z10 } from "zod";

// src/pagination.ts
import { z as z6 } from "zod";
var MAX_PAGE_SIZE = 100;
var DEFAULT_PAGE_SIZE = 25;
var MAX_CURSOR_LENGTH = 512;
var cursorTextSchema = z6.string().min(1).max(MAX_CURSOR_LENGTH);
var pageQuerySchema = z6.object({
  cursor: cursorTextSchema.optional(),
  limit: z6.union([z6.number(), z6.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z6.number().int().min(1).max(MAX_PAGE_SIZE)).default(DEFAULT_PAGE_SIZE)
});
function pageSchema(itemSchema) {
  return z6.object({
    items: z6.array(itemSchema).max(MAX_PAGE_SIZE),
    nextCursor: cursorTextSchema.nullable()
  });
}
function encodeCursor(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const cursor = btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  if (cursor.length > MAX_CURSOR_LENGTH) {
    throw new Error(`Cursor is ${cursor.length} characters; the limit is ${MAX_CURSOR_LENGTH}. Put less in the position.`);
  }
  return cursor;
}
function decodeCursor(text, schema) {
  if (typeof text !== "string" || text.length > MAX_CURSOR_LENGTH || !/^[A-Za-z0-9_-]+$/.test(text)) {
    return;
  }
  try {
    const padded = text.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const result = schema.safeParse(JSON.parse(json));
    return result.success ? result.data : undefined;
  } catch {
    return;
  }
}

// src/consent/values.ts
import { z as z9 } from "zod";

// src/email.ts
import { z as z7 } from "zod";
var MAX_EMAIL_LENGTH = 320;
function foldAscii(text) {
  return text.replace(/[A-Z]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 32));
}
function isPrintableAscii(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 33 || code > 126) {
      return false;
    }
  }
  return true;
}
function hasOneInteriorAt(text) {
  const first = text.indexOf("@");
  return first > 0 && first < text.length - 1 && text.indexOf("@", first + 1) === -1;
}
var emailSchema = z7.string().max(MAX_EMAIL_LENGTH).transform(foldAscii).pipe(z7.string().min(3).refine(hasOneInteriorAt, "Exactly one @, neither first nor last").refine(isPrintableAscii, "Printable ASCII only"));

// src/prospect/values.ts
import { z as z8 } from "zod";
var MAX_RAW_LENGTH = 1000;
function hasControlCharacter2(text, allowLineBreaks) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (allowLineBreaks && (code === 10 || code === 9)) {
      continue;
    }
    if (code < 32 || code >= 127 && code <= 159) {
      return true;
    }
  }
  return false;
}
function boundedTextSchema(maxLength) {
  return z8.string().max(Math.max(MAX_RAW_LENGTH, maxLength)).trim().pipe(z8.string().min(1).max(maxLength).refine((text) => !hasControlCharacter2(text, false), "No control characters"));
}
var MAX_PROSPECT_NAME_PART_LENGTH = 100;
var MAX_PROSPECT_JOB_TITLE_LENGTH = 200;
var MAX_PROSPECT_COMPANY_NAME_LENGTH = 200;
var MAX_PROSPECT_NOTES_LENGTH = 5000;
var MAX_PROSPECT_TAG_LENGTH = 50;
var MAX_PROSPECT_TAGS = 20;
var MAX_PROSPECT_SEARCH_LENGTH = 100;
var MAX_PROSPECT_FIELD_VALUE_LENGTH = 320;
var MAX_SOURCE_REF_LENGTH = 200;
var prospectNamePartSchema = boundedTextSchema(MAX_PROSPECT_NAME_PART_LENGTH);
var prospectJobTitleSchema = boundedTextSchema(MAX_PROSPECT_JOB_TITLE_LENGTH);
var prospectCompanyNameSchema = boundedTextSchema(MAX_PROSPECT_COMPANY_NAME_LENGTH);
var prospectNotesSchema = z8.string().max(MAX_PROSPECT_NOTES_LENGTH * 2).trim().pipe(z8.string().min(1).max(MAX_PROSPECT_NOTES_LENGTH).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
var prospectTagsSchema = z8.array(boundedTextSchema(MAX_PROSPECT_TAG_LENGTH)).max(MAX_PROSPECT_TAGS).refine((tags) => new Set(tags).size === tags.length, "No duplicate tags");
var rawPhoneSchema = z8.string().max(MAX_RAW_LENGTH).trim().pipe(z8.string().min(3).max(40).regex(/^\+?[0-9 ().-]+$/));
var e164PhoneSchema = z8.string().regex(/^\+[1-9][0-9]{6,14}$/);
var rawLinkedinUrlSchema = z8.string().max(MAX_RAW_LENGTH).trim().pipe(z8.string().min(1).max(300).refine((text) => /linkedin\.com\//i.test(text), "A linkedin.com address").refine((text) => !hasControlCharacter2(text, false), "No control characters"));
var prospectCompanyDomainSchema = z8.string().max(MAX_RAW_LENGTH).trim().transform(foldAscii).pipe(z8.string().min(3).max(253).regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/));
var PROSPECT_IDENTITY_KINDS = ["email", "phone", "linkedin"];
var prospectIdentityKindSchema = z8.enum(PROSPECT_IDENTITY_KINDS);
var PROSPECT_FIELD_NAMES = [
  "firstName",
  "lastName",
  "jobTitle",
  "email",
  "phone",
  "linkedinUrl"
];
var prospectFieldNameSchema = z8.enum(PROSPECT_FIELD_NAMES);
var PROSPECT_COMPANY_FIELD_NAMES = ["name", "domain"];
var prospectCompanyFieldNameSchema = z8.enum(PROSPECT_COMPANY_FIELD_NAMES);
var MAX_FIELD_HISTORY_ENTRIES = 50;
var FIXED_SOURCE_KINDS = [
  "manual",
  "import",
  "crm:hubspot",
  "crm:salesforce",
  "form"
];
var sourceKindSchema = z8.union([
  z8.enum(FIXED_SOURCE_KINDS),
  z8.string().regex(/^enrichment:[a-z][a-z0-9_]{0,31}$/)
]);
var fieldValueSchema = z8.object({
  value: z8.string().min(1).max(MAX_PROSPECT_FIELD_VALUE_LENGTH),
  source: sourceKindSchema,
  sourceRef: z8.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  setAt: timestampSchema,
  setByUserId: userIdSchema.nullable()
});
var FIELD_HISTORY_STATES = ["current", "superseded", "suggested"];
var fieldHistoryStateSchema = z8.enum(FIELD_HISTORY_STATES);
var fieldHistoryEntrySchema = fieldValueSchema.extend({ state: fieldHistoryStateSchema });

// src/consent/values.ts
var CONSENT_CHANNELS = ["phone", "sms", "whatsapp", "email", "linkedin"];
var consentChannelSchema = z9.enum(CONSENT_CHANNELS);
var CONSENT_REQUIRED_CHANNELS = [
  "phone",
  "sms",
  "whatsapp"
];
var CONSENT_GRANT_SOURCES = [
  "hosted_form",
  "verbal_call",
  "import_attestation",
  "crm",
  "manual"
];
var consentGrantSourceSchema = z9.enum(CONSENT_GRANT_SOURCES);
var CONSENT_RECORDABLE_SOURCES = [
  "verbal_call",
  "import_attestation",
  "crm",
  "manual"
];
var CONSENT_WITHDRAWAL_SOURCES = ["unsubscribe", "stop_reply", "manual", "crm"];
var consentWithdrawalSourceSchema = z9.enum(CONSENT_WITHDRAWAL_SOURCES);
var consentSourceSchema = z9.union([
  consentGrantSourceSchema,
  consentWithdrawalSourceSchema
]);
var MAX_EVIDENCE_REF_LENGTH = 200;
var evidenceRefSchema = boundedTextSchema(MAX_EVIDENCE_REF_LENGTH);
var consentTokenSchema = z9.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var CONTACT_PURPOSES = ["agent_initiated", "rep_initiated", "reply"];
var contactPurposeSchema = z9.enum(CONTACT_PURPOSES);
var SUPPRESSION_REASONS = [
  "unsubscribe",
  "stop",
  "bounce",
  "complaint",
  "manual",
  "crm",
  "erased"
];
var suppressionReasonSchema = z9.enum(SUPPRESSION_REASONS);
var SUPPRESSION_REMOVABLE_REASONS = ["manual"];
var SUPPRESSION_ADDRESS_KINDS = ["email", "phone", "linkedin"];
var suppressionAddressKindSchema = z9.enum(SUPPRESSION_ADDRESS_KINDS);
var maskedAddressSchema = z9.string().min(1).max(100);
var addressFieldsShape = {
  email: emailSchema.optional(),
  phone: rawPhoneSchema.optional(),
  linkedinUrl: rawLinkedinUrlSchema.optional()
};
var hasExactlyOneAddress = (body) => [body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1;
var ONE_ADDRESS_MESSAGE = "Give exactly one of email, phone or linkedinUrl";

// src/consent/contact-check.ts
var CONTACT_DENIAL_CODES = [
  "consent.missing",
  "consent.withdrawn",
  "consent.suppressed",
  "consent.unavailable"
];
var contactDenialCodeSchema = z10.enum(CONTACT_DENIAL_CODES);
var CONTACT_ALLOW_BASES = [
  "consent_granted",
  "rep_initiated",
  "reply",
  "email_no_suppression"
];
var MAX_CALLER_LENGTH = 32;
var contactCheckRequestSchema = z10.strictObject({
  organizationId: organizationIdSchema,
  prospectId: prospectIdSchema.optional(),
  ...addressFieldsShape,
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z10.string().min(1).max(MAX_CALLER_LENGTH).regex(/^[a-z][a-z0-9_-]*$/)
}).refine((body) => [body.prospectId, body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1, "Give exactly one of prospectId, email, phone or linkedinUrl");
var allowedSchema = z10.strictObject({
  allowed: z10.literal(true),
  checkId: contactCheckIdSchema,
  basis: z10.enum(CONTACT_ALLOW_BASES)
});
var deniedSchema = z10.strictObject({
  allowed: z10.literal(false),
  checkId: contactCheckIdSchema.nullable(),
  code: contactDenialCodeSchema,
  suppressionReason: suppressionReasonSchema.nullable()
}).refine((r) => r.code === "consent.suppressed" === (r.suppressionReason !== null), "Only a suppressed denial carries a Suppression reason").refine((r) => r.code === "consent.unavailable" === (r.checkId === null), "Only an unavailable denial has no logged check");
var contactCheckResultSchema = z10.union([allowedSchema, deniedSchema]);
var contactCheckLogEntrySchema = z10.object({
  id: contactCheckIdSchema,
  prospectId: prospectIdSchema.nullable(),
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z10.string().min(1).max(MAX_CALLER_LENGTH),
  allowed: z10.boolean(),
  code: contactDenialCodeSchema.nullable(),
  basis: z10.enum(CONTACT_ALLOW_BASES).nullable(),
  checkedAt: timestampSchema
});
var listContactChecksQuerySchema = pageQuerySchema.extend({
  channel: consentChannelSchema.optional(),
  purpose: contactPurposeSchema.optional(),
  allowed: z10.enum(["true", "false"]).optional(),
  prospectId: prospectIdSchema.optional(),
  code: contactDenialCodeSchema.optional()
}).strict();
var contactCheckLogPageSchema = pageSchema(contactCheckLogEntrySchema);
// src/consent/errors.ts
var CONSENT_ERRORS = {
  ...defineErrors("consent", {
    not_found: {
      status: 404,
      message: "The requested Consent Wording, form, Suppression entry or import was not found."
    },
    missing: { status: 403, message: "There is no Contact Consent for this contact." },
    withdrawn: { status: 403, message: "The Contact Consent for this contact was withdrawn." },
    suppressed: { status: 403, message: "This contact is on the Suppression list." },
    unavailable: { status: 503, message: "The Contact Check could not be completed." },
    wording_locked: {
      status: 409,
      message: "This Consent Wording is in use and cannot be edited. Write a new version."
    },
    invalid_token: { status: 400, message: "This link is not valid or has expired." },
    entry_not_removable: {
      status: 409,
      message: "Only a manually added Suppression entry can be removed."
    }
  })
};
// src/consent/events.ts
import { z as z12 } from "zod";

// src/events.ts
import { z as z11 } from "zod";
var eventTypeSchema = errorCodeSchema;
var versionSchema = z11.number().int().positive();
var occurredAtSchema = z11.iso.datetime({ offset: true }).max(64);
var envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: occurredAtSchema,
  organizationId: organizationIdSchema,
  region: regionSchema
};
function eventEnvelopeSchema(dataSchema) {
  return z11.object({ ...envelopeShape, data: dataSchema });
}
function defineEvent(type, version, dataSchema) {
  const schema = z11.object({
    ...envelopeShape,
    type: z11.literal(eventTypeSchema.parse(type)),
    version: z11.literal(versionSchema.parse(version)),
    data: dataSchema
  });
  return {
    type,
    version,
    schema,
    parse: (input) => schema.parse(input),
    safeParse: (input) => schema.safeParse(input)
  };
}

// src/consent/events.ts
var consentGrantedEvent = defineEvent("consent.granted", 1, z12.strictObject({
  consentEventId: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  source: consentGrantSourceSchema,
  wordingId: consentWordingIdSchema
}));
var consentWithdrawnEvent = defineEvent("consent.withdrawn", 1, z12.strictObject({
  consentEventId: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  source: consentWithdrawalSourceSchema,
  stopAll: z12.boolean()
}));
var suppressionAddedEvent = defineEvent("suppression.added", 1, z12.strictObject({
  suppressionEntryId: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema,
  reason: suppressionReasonSchema,
  prospectId: prospectIdSchema.nullable()
}));
var suppressionRemovedEvent = defineEvent("suppression.removed", 1, z12.strictObject({
  suppressionEntryId: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema
}));
var CONSENT_EVENTS = {
  "consent.granted": consentGrantedEvent,
  "consent.withdrawn": consentWithdrawnEvent,
  "suppression.added": suppressionAddedEvent,
  "suppression.removed": suppressionRemovedEvent
};
// src/consent/evidence.ts
import { z as z14 } from "zod";

// src/consent/ledger.ts
import { z as z13 } from "zod";
var CONSENT_STATES = ["granted", "withdrawn", "none"];
var consentStateSchema = z13.enum(CONSENT_STATES);
var consentEventSchema = z13.object({
  id: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  kind: z13.enum(["granted", "withdrawn"]),
  source: consentSourceSchema,
  wordingId: consentWordingIdSchema.nullable(),
  evidenceRef: evidenceRefSchema.nullable(),
  callId: callIdSchema.nullable(),
  formId: consentFormIdSchema.nullable(),
  stopAll: z13.boolean(),
  recordedByUserId: userIdSchema.nullable(),
  occurredAt: timestampSchema,
  recordedAt: timestampSchema
}).superRefine((event, ctx) => {
  const issue = (message) => ctx.addIssue({ code: "custom", message });
  const grant = event.kind === "granted";
  if (grant !== CONSENT_GRANT_SOURCES.includes(event.source)) {
    issue(grant ? "A grant has a grant source" : "A withdrawal has a withdrawal source");
  }
  if (grant && (event.wordingId === null || event.evidenceRef === null)) {
    issue("A grant carries the wording shown and an evidence reference");
  }
  if (grant && event.stopAll) {
    issue("Only a withdrawal can be a STOP-all");
  }
  if (event.source === "verbal_call" !== (event.callId !== null)) {
    issue("A verbal grant links the Call, and only a verbal grant does");
  }
  if (event.source === "hosted_form" !== (event.formId !== null)) {
    issue("A hosted grant links the form, and only a hosted grant does");
  }
});
var channelConsentSchema = z13.object({
  channel: consentChannelSchema,
  state: consentStateSchema,
  since: timestampSchema.nullable(),
  lastEventId: consentEventIdSchema.nullable(),
  wordingId: consentWordingIdSchema.nullable()
}).refine((c) => c.state === "none" === (c.since === null && c.lastEventId === null) && (c.state === "granted" || c.wordingId === null), "A channel with no event has no time or event; only a grant carries wording");
var prospectConsentSchema = z13.object({
  prospectId: prospectIdSchema,
  channels: z13.array(channelConsentSchema).length(CONSENT_CHANNELS.length),
  suppressed: z13.boolean(),
  suppressionReason: suppressionReasonSchema.nullable()
}).refine((c) => new Set(c.channels.map((channel) => channel.channel)).size === CONSENT_CHANNELS.length, "Each channel appears once").refine((c) => c.suppressed === (c.suppressionReason !== null), "A suppressed Prospect has a reason");
var recordConsentRequestSchema = z13.strictObject({
  channel: consentChannelSchema,
  source: z13.enum(CONSENT_RECORDABLE_SOURCES),
  wordingId: consentWordingIdSchema,
  evidenceRef: evidenceRefSchema,
  callId: callIdSchema.optional(),
  occurredAt: timestampSchema.optional()
}).refine((body) => body.source === "verbal_call" === (body.callId !== undefined), "A verbal grant names the Call, and only a verbal grant does");
var withdrawConsentRequestSchema = z13.strictObject({
  channels: z13.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length).refine((channels) => new Set(channels).size === channels.length, "No repeats").optional(),
  all: z13.literal(true).optional(),
  occurredAt: timestampSchema.optional()
}).refine((body) => body.channels === undefined !== (body.all === undefined), "Give channels or all");
var consentProspectParamsSchema = z13.strictObject({ prospectId: prospectIdSchema });
var listConsentEventsQuerySchema = pageQuerySchema.extend({ channel: consentChannelSchema.optional() }).strict();
var consentEventPageSchema = pageSchema(consentEventSchema);
var recordedConsentSchema = z13.object({
  events: z13.array(consentEventSchema).min(1).max(CONSENT_CHANNELS.length),
  consent: prospectConsentSchema
});

// src/consent/evidence.ts
var MAX_IP_LENGTH = 64;
var MAX_USER_AGENT_LENGTH = 512;
var evidenceEventSchema = consentEventSchema.and(z14.object({
  wording: z14.object({
    id: consentWordingIdSchema,
    version: z14.number().int().min(1),
    text: z14.string().min(1).max(1e4)
  }).nullable(),
  submission: z14.object({
    ipAddress: z14.string().min(1).max(MAX_IP_LENGTH),
    userAgent: z14.string().max(MAX_USER_AGENT_LENGTH)
  }).nullable()
})).refine((e) => e.source === "hosted_form" === (e.submission !== null), "A hosted grant carries the submission evidence, and only a hosted grant does");
var listEvidenceQuerySchema = pageQuerySchema.extend({ channel: consentChannelSchema.optional() }).strict();
var evidencePageSchema = pageSchema(evidenceEventSchema);
var EVIDENCE_CSV_COLUMNS = [
  "event_id",
  "prospect_id",
  "channel",
  "kind",
  "source",
  "occurred_at",
  "recorded_at",
  "wording_id",
  "wording_version",
  "wording_text",
  "evidence_ref",
  "ip_address",
  "user_agent"
];
// src/consent/public.ts
import { z as z16 } from "zod";

// src/consent/wording.ts
import { z as z15 } from "zod";
var MAX_CONSENT_WORDING_LENGTH = 5000;
var MAX_CONSENT_FORM_NAME_LENGTH = 100;
var consentWordingTextSchema = z15.string().max(MAX_CONSENT_WORDING_LENGTH * 2).trim().pipe(z15.string().min(1).max(MAX_CONSENT_WORDING_LENGTH).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
var channelsSchema = z15.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length).refine((channels) => new Set(channels).size === channels.length, "No repeats");
var consentWordingSchema = z15.object({
  id: consentWordingIdSchema,
  version: z15.number().int().min(1),
  text: consentWordingTextSchema,
  channels: channelsSchema,
  locked: z15.boolean(),
  supersedesId: consentWordingIdSchema.nullable(),
  createdAt: timestampSchema,
  createdByUserId: userIdSchema
}).refine((w) => w.version === 1 === (w.supersedesId === null), "Only version 1 supersedes nothing");
var consentWordingParamsSchema = z15.strictObject({ wordingId: consentWordingIdSchema });
var createConsentWordingRequestSchema = z15.strictObject({
  text: consentWordingTextSchema,
  channels: channelsSchema
});
var updateConsentWordingRequestSchema = z15.strictObject({ text: consentWordingTextSchema.optional(), channels: channelsSchema.optional() }).refine((body) => body.text !== undefined || body.channels !== undefined, "Change something");
var listConsentWordingsQuerySchema = pageQuerySchema.strict();
var consentWordingPageSchema = pageSchema(consentWordingSchema);
var CONSENT_FORM_STATES = ["draft", "published", "closed"];
var consentFormStateSchema = z15.enum(CONSENT_FORM_STATES);
var consentFormSchema = z15.object({
  id: consentFormIdSchema,
  wordingId: consentWordingIdSchema,
  name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
  channels: channelsSchema,
  state: consentFormStateSchema,
  token: consentTokenSchema.nullable(),
  createdAt: timestampSchema,
  createdByUserId: userIdSchema,
  publishedAt: timestampSchema.nullable(),
  closedAt: timestampSchema.nullable()
}).refine((f) => f.state === "draft" === (f.publishedAt === null) && (f.state !== "draft" || f.token === null), "A form has a publish time exactly once published, and a draft has no token").refine((f) => f.state === "closed" === (f.closedAt !== null), "A form has a close time exactly when closed");
var consentFormParamsSchema = z15.strictObject({ formId: consentFormIdSchema });
var createConsentFormRequestSchema = z15.strictObject({
  wordingId: consentWordingIdSchema,
  name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
  channels: channelsSchema
});
var listConsentFormsQuerySchema = pageQuerySchema.extend({ state: consentFormStateSchema.optional() }).strict();
var consentFormPageSchema = pageSchema(consentFormSchema);

// src/consent/public.ts
var consentTokenParamsSchema = z16.strictObject({ token: consentTokenSchema });
var MAX_NAME_LENGTH2 = 100;
var PHONE_CHANNELS = ["phone", "sms", "whatsapp"];
var choiceSchema = z16.strictObject({
  channel: consentChannelSchema,
  agreed: z16.boolean()
});
var hostedConsentSubmissionSchema = z16.strictObject({
  wordingId: consentWordingIdSchema,
  firstName: boundedTextSchema(MAX_NAME_LENGTH2).optional(),
  lastName: boundedTextSchema(MAX_NAME_LENGTH2).optional(),
  email: addressFieldsShape.email,
  phone: addressFieldsShape.phone,
  choices: z16.array(choiceSchema).min(1).max(CONSENT_CHANNELS.length).refine((choices) => new Set(choices.map((c) => c.channel)).size === choices.length, "No repeats")
}).superRefine((body, ctx) => {
  const agreed = body.choices.filter((choice) => choice.agreed);
  if (agreed.length === 0) {
    ctx.addIssue({ code: "custom", path: ["choices"], message: "Agree to at least one channel" });
  }
  for (const choice of agreed) {
    if (PHONE_CHANNELS.includes(choice.channel) && body.phone === undefined) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "A phone number is needed" });
    }
    if (choice.channel === "email" && body.email === undefined) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "An email address is needed" });
    }
    if (choice.channel === "linkedin") {
      ctx.addIssue({
        code: "custom",
        path: ["choices"],
        message: "LinkedIn is not offered on a hosted form"
      });
    }
  }
});
var hostedConsentFormViewSchema = z16.object({
  organizationName: boundedTextSchema(200),
  wordingId: consentWordingIdSchema,
  wordingVersion: z16.number().int().min(1),
  wordingText: consentWordingTextSchema,
  channels: z16.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length)
});
var hostedConsentReceiptSchema = z16.object({
  channels: z16.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length),
  recordedAt: timestampSchema
});
var unsubscribePreviewSchema = z16.object({
  organizationName: boundedTextSchema(200),
  channel: z16.literal("email")
});
var oneClickUnsubscribeRequestSchema = z16.strictObject({
  "List-Unsubscribe": z16.literal("One-Click")
});
var unsubscribeReceiptSchema = z16.object({
  unsubscribed: z16.literal(true),
  recordedAt: timestampSchema
});
// src/consent/routes.ts
var CONSENT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var CONSENT_ADMIN_ROLES = ["owner", "admin"];
var route2 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var CONSENT_ROUTES = Object.freeze({
  getProspectConsent: route2({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads a Prospect's Contact Consent on each channel, derived from the ledger, and whether the Prospect is suppressed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  listProspectConsentEvents: route2({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent-events",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists a Prospect's consent ledger events, newest first, one cursor-paginated page at a time (at most 100); optionally one channel. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  recordConsent: route2({
    method: "POST",
    path: "/v1/prospects/{prospectId}/consents",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found", "consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Records a granted Contact Consent on one channel with the Consent Wording shown, the source and an evidence reference; without them it is refused (request.invalid). The source is never hosted_form. A verbal_call grant names the Call. Appends to the ledger and publishes consent.granted; answers 201, or 200 for a replay of the same Idempotency-Key. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  withdrawConsent: route2({
    method: "POST",
    path: "/v1/prospects/{prospectId}/consent-withdrawals",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Records a withdrawal of Contact Consent on the named channels, or on every channel with all: true. Appends to the ledger and publishes consent.withdrawn once per channel; the source is manual. A withdrawal never needs a reason and is always allowed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  getProspectConsentEvidence: route2({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent-evidence",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Exports a Prospect's consent evidence as JSON, newest first, one cursor-paginated page at a time (at most 100): each ledger event with the wording text shown and, for a hosted form, the IP address and user agent. Owner and Admin only. Send Accept: text/csv for the same events as CSV, with the columns in EVIDENCE_CSV_COLUMNS."
  }),
  listConsentWordings: route2({
    method: "GET",
    path: "/v1/consent-wordings",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Consent Wordings, newest first, one cursor-paginated page at a time (at most 100)."
  }),
  getConsentWording: route2({
    method: "GET",
    path: "/v1/consent-wordings/{wordingId}",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Consent Wording with its version and whether it is locked."
  }),
  createConsentWording: route2({
    method: "POST",
    path: "/v1/consent-wordings",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Writes a new Consent Wording (version 1) for the channels it covers. The text is the Organization's own, reviewed by its own counsel; Closeline ships none. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  updateConsentWording: route2({
    method: "PATCH",
    path: "/v1/consent-wordings/{wordingId}",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "consent.wording_locked"],
    commonErrors: ["request.invalid"],
    description: "Edits a Consent Wording that nothing references yet. Once a consent event or a published form uses it, it is consent.wording_locked (409) and the change is a new version. Owner and Admin only."
  }),
  createConsentWordingVersion: route2({
    method: "POST",
    path: "/v1/consent-wordings/{wordingId}/versions",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Writes the next version of a Consent Wording; the old version stays as it was and keeps its evidence. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  listConsentForms: route2({
    method: "GET",
    path: "/v1/consent-forms",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's hosted consent forms, newest first, one cursor-paginated page at a time (at most 100); optionally one state."
  }),
  getConsentForm: route2({
    method: "GET",
    path: "/v1/consent-forms/{formId}",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one hosted consent form. The public link token is shown to Owner and Admin only."
  }),
  createConsentForm: route2({
    method: "POST",
    path: "/v1/consent-forms",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Creates a draft hosted consent form from a Consent Wording and the channels to offer, each its own unticked choice. A wording that does not exist is consent.not_found. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  publishConsentForm: route2({
    method: "POST",
    path: "/v1/consent-forms/{formId}/publication",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "request.conflict"],
    commonErrors: ["request.invalid"],
    description: "Publishes a draft form: it gets its public link token and its wording becomes locked. Publishing a form that is not a draft is request.conflict. Owner and Admin only."
  }),
  closeConsentForm: route2({
    method: "POST",
    path: "/v1/consent-forms/{formId}/closure",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "request.conflict"],
    commonErrors: ["request.invalid"],
    description: "Closes a published form: its link answers consent.invalid_token afterwards, and the consent already recorded stays. Closing a form that is not published is request.conflict. Owner and Admin only."
  }),
  addSuppression: route2({
    method: "POST",
    path: "/v1/suppression-entries",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Adds one email, phone or LinkedIn address to the Suppression list with the reason manual. Adding an address already suppressed answers 200 with the existing entry. The address is never returned. Owner and Admin only. Publishes suppression.added."
  }),
  listSuppressionEntries: route2({
    method: "GET",
    path: "/v1/suppression-entries",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists Suppression entries, newest first, one cursor-paginated page at a time (at most 100); filters: reason, addressKind, state (active by default). Entries show a masked address, never the address or its hash. Owner and Admin only."
  }),
  lookupSuppression: route2({
    method: "POST",
    path: "/v1/suppression-entries/lookups",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Looks up one exact email, phone or LinkedIn address on the Suppression list, in the body so it never reaches an access log. Answers the active entries for it (a masked address, never the address or its hash), none if it is not suppressed. Owner and Admin only."
  }),
  getSuppressionEntry: route2({
    method: "GET",
    path: "/v1/suppression-entries/{entryId}",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Suppression entry with a masked address. Owner and Admin only."
  }),
  removeSuppression: route2({
    method: "POST",
    path: "/v1/suppression-entries/{entryId}/removal",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "consent.entry_not_removable"],
    commonErrors: ["request.invalid"],
    description: "Removes a manual Suppression entry, with a recorded reason. Any other reason is consent.entry_not_removable (409): an unsubscribe, STOP, bounce, complaint, CRM or erased entry is lifted only by a new granted consent with new evidence. Owner and Admin only. Publishes suppression.removed."
  }),
  uploadSuppressionImport: route2({
    method: "POST",
    path: "/v1/suppression-imports",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [202, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Uploads a CSV of up to 50,000 addresses (one column, address; at most 10 MB) as multipart form data in the part named file. It is queued and answers 202 with the import; a replay of the same Idempotency-Key answers 200. Every address is added with the reason manual. A file that cannot be read is request.invalid; a larger one is request.too_large. Owner and Admin only."
  }),
  listSuppressionImports: route2({
    method: "GET",
    path: "/v1/suppression-imports",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists Suppression imports, newest first, one cursor-paginated page at a time (at most 100). Owner and Admin only."
  }),
  getSuppressionImport: route2({
    method: "GET",
    path: "/v1/suppression-imports/{importId}",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Suppression import with its state and counts. Owner and Admin only."
  }),
  listSuppressionImportRows: route2({
    method: "GET",
    path: "/v1/suppression-imports/{importId}/rows",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists the per-row report of a Suppression import in file order, one cursor-paginated page at a time (at most 100); optionally one result. No cell of the file is returned. Owner and Admin only."
  }),
  listContactChecks: route2({
    method: "GET",
    path: "/v1/contact-checks",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists logged Contact Checks, newest first, one cursor-paginated page at a time (at most 100); filters: channel, purpose, allowed, prospectId and code. Owner and Admin only."
  }),
  getHostedConsentForm: route2({
    method: "GET",
    path: "/v1/public/consent-forms/{token}",
    access: "public",
    roles: [],
    success: [200],
    idempotent: false,
    errors: ["consent.invalid_token"],
    commonErrors: ["rate.limited"],
    description: "Reads what the hosted consent page shows: the Organization's name, the exact Consent Wording and the channels offered. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  submitHostedConsentForm: route2({
    method: "POST",
    path: "/v1/public/consent-forms/{token}/submissions",
    access: "public",
    roles: [],
    success: [201, 200],
    idempotent: true,
    errors: ["consent.invalid_token"],
    commonErrors: [...IDEMPOTENT_ERRORS, "rate.limited"],
    description: "Submits a hosted consent form: an explicit choice per channel and the address each needs. Core finds or creates the Prospect, reads the IP address and user agent from the request as evidence, appends the ledger and publishes consent.granted. Answers 201, or 200 for a replay of the same Idempotency-Key. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  previewUnsubscribe: route2({
    method: "GET",
    path: "/v1/public/unsubscribe/{token}",
    access: "public",
    roles: [],
    success: [200],
    idempotent: false,
    errors: ["consent.invalid_token"],
    commonErrors: ["rate.limited"],
    description: "Reads what the unsubscribe page shows: the Organization's name and the channel. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  oneClickUnsubscribe: route2({
    method: "POST",
    path: "/v1/public/unsubscribe/{token}",
    access: "public",
    roles: [],
    success: [200],
    idempotent: false,
    errors: ["consent.invalid_token"],
    commonErrors: ["rate.limited"],
    description: "Unsubscribes the address behind the link (RFC 8058 List-Unsubscribe-Post): it adds a Suppression entry with the reason unsubscribe, withdraws the email consent and publishes the events. Replaying a link answers the same. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  contactCheck: route2({
    method: "POST",
    path: "/internal/v1/contact-checks",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Answers whether a contact may be made, from the ledger and the Suppression list. Answers 200 with a result: an allowance, or a denial with a consent.* code in the body; a denial is never an HTTP error. Every answered check is logged. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  }),
  recordWithdrawal: route2({
    method: "POST",
    path: "/internal/v1/consent-withdrawals",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Records a STOP the channel received: a withdrawal on the channel (or every channel), a Suppression entry with the reason stop, and the events. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  }),
  recordDeliveryFailure: route2({
    method: "POST",
    path: "/internal/v1/delivery-failures",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Records a bounce or complaint on an email address: a Suppression entry with that reason and the event. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  })
});
// src/consent/suppression.ts
import { z as z17 } from "zod";
var MAX_SUPPRESSION_NOTE_LENGTH = 500;
var isRemovableReason = (reason) => SUPPRESSION_REMOVABLE_REASONS.includes(reason);
var suppressionEntrySchema = z17.object({
  id: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema,
  maskedAddress: maskedAddressSchema.nullable(),
  reason: suppressionReasonSchema,
  channel: consentChannelSchema.nullable(),
  sourceRef: z17.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  addedByUserId: userIdSchema.nullable(),
  removable: z17.boolean(),
  createdAt: timestampSchema,
  removedAt: timestampSchema.nullable(),
  removedByUserId: userIdSchema.nullable(),
  removalReason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).nullable()
}).refine((e) => e.removable === isRemovableReason(e.reason), "Only a manual entry is removable").refine((e) => e.reason === "erased" === (e.maskedAddress === null), "An erased entry keeps no address").refine((e) => e.removedAt === null === (e.removedByUserId === null) && e.removedAt === null === (e.removalReason === null), "A removed entry says when, by whom and why");
var suppressionEntryParamsSchema = z17.strictObject({ entryId: suppressionEntryIdSchema });
var addSuppressionRequestSchema = z17.strictObject({
  ...addressFieldsShape,
  note: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).optional()
}).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var removeSuppressionRequestSchema = z17.strictObject({
  reason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH)
});
var suppressionListStateSchema = z17.enum(["active", "removed"]);
var listSuppressionEntriesQuerySchema = pageQuerySchema.extend({
  reason: suppressionReasonSchema.optional(),
  addressKind: suppressionAddressKindSchema.optional(),
  state: suppressionListStateSchema.optional()
}).strict();
var lookupSuppressionRequestSchema = z17.strictObject(addressFieldsShape).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var suppressionEntryPageSchema = pageSchema(suppressionEntrySchema);
var recordWithdrawalRequestSchema = z17.strictObject({
  organizationId: organizationIdSchema,
  channel: consentChannelSchema,
  ...addressFieldsShape,
  stopAll: z17.boolean().default(false),
  sourceRef: z17.string().min(1).max(MAX_SOURCE_REF_LENGTH)
}).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var DELIVERY_FAILURE_REASONS = ["bounce", "complaint"];
var recordDeliveryFailureRequestSchema = z17.strictObject({
  organizationId: organizationIdSchema,
  email: addressFieldsShape.email.unwrap(),
  reason: z17.enum(DELIVERY_FAILURE_REASONS),
  sourceRef: z17.string().min(1).max(MAX_SOURCE_REF_LENGTH)
});
var recordedSuppressionSchema = z17.object({
  entryId: suppressionEntryIdSchema,
  prospectId: prospectIdSchema.nullable()
});
var MAX_SUPPRESSION_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_SUPPRESSION_IMPORT_ROWS = 50000;
var SUPPRESSION_IMPORT_FILE_FIELD = "file";
var SUPPRESSION_IMPORT_COLUMNS = ["address"];
var SUPPRESSION_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var suppressionImportStateSchema = z17.enum(SUPPRESSION_IMPORT_STATES);
var SUPPRESSION_IMPORT_FAILURE_REASONS = ["too_many_rows", "unreadable"];
var suppressionImportSchema = z17.object({
  id: suppressionImportIdSchema,
  state: suppressionImportStateSchema,
  failureReason: z17.enum(SUPPRESSION_IMPORT_FAILURE_REASONS).nullable(),
  totalRows: z17.number().int().min(0).max(MAX_SUPPRESSION_IMPORT_ROWS).nullable(),
  addedRows: z17.number().int().min(0).nullable(),
  alreadySuppressedRows: z17.number().int().min(0).nullable(),
  invalidRows: z17.number().int().min(0).nullable(),
  createdAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
  createdByUserId: userIdSchema
}).refine((i) => i.failureReason !== null === (i.state === "failed"), "A failed import has a reason").refine((i) => i.completedAt !== null === (i.state === "completed" || i.state === "failed"), "A final import has a completion time").refine((i) => {
  if (i.state !== "completed") {
    return i.totalRows === null && i.addedRows === null && i.alreadySuppressedRows === null && i.invalidRows === null;
  }
  return i.totalRows !== null && i.addedRows !== null && i.alreadySuppressedRows !== null && i.invalidRows !== null && i.addedRows + i.alreadySuppressedRows + i.invalidRows === i.totalRows;
}, "The counts are set exactly when completed and add up");
var suppressionImportParamsSchema = z17.strictObject({ importId: suppressionImportIdSchema });
var listSuppressionImportsQuerySchema = pageQuerySchema.strict();
var suppressionImportPageSchema = pageSchema(suppressionImportSchema);
var SUPPRESSION_IMPORT_ROW_RESULTS = ["added", "already_suppressed", "invalid"];
var suppressionImportRowSchema = z17.object({
  rowNumber: z17.number().int().min(1).max(MAX_SUPPRESSION_IMPORT_ROWS + 1),
  result: z17.enum(SUPPRESSION_IMPORT_ROW_RESULTS),
  reason: z17.enum(["unreadable_address", "unsupported_address"]).nullable()
});
var listSuppressionImportRowsQuerySchema = pageQuerySchema.extend({ result: z17.enum(SUPPRESSION_IMPORT_ROW_RESULTS).optional() }).strict();
var suppressionImportRowPageSchema = pageSchema(suppressionImportRowSchema);
// src/core/internal.ts
import { z as z18 } from "zod";
var INTERNAL_CALL_ERRORS = Object.freeze({
  createOrganization: Object.freeze(["membership.already_member"]),
  acceptInvitation: Object.freeze(["invitation.invalid", "membership.already_member"]),
  membership: Object.freeze([]),
  updateMemberProfile: Object.freeze(["member.not_found"]),
  abandonOrganization: Object.freeze(["organization.not_abandonable"])
});
var internalCreateOrganizationRequestSchema = z18.strictObject({
  userId: userIdSchema,
  organizationName: organizationNameSchema,
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
});
var internalCreateOrganizationResponseSchema = z18.object({
  organizationId: organizationIdSchema,
  role: z18.literal("owner")
});
var internalAcceptInvitationRequestSchema = z18.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  name: personNameSchema.nullable().optional(),
  invitationToken: invitationTokenSchema
});
var internalAcceptInvitationResponseSchema = z18.object({
  organizationId: organizationIdSchema,
  role: invitableRoleSchema
});
var internalMembershipRequestSchema = z18.strictObject({
  userId: userIdSchema
});
var internalMembershipResponseSchema = z18.discriminatedUnion("found", [
  z18.object({
    found: z18.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema
  }),
  z18.object({ found: z18.literal(false) })
]);
var internalUpdateMemberProfileParamsSchema = z18.strictObject({
  userId: userIdSchema
});
var internalUpdateMemberProfileRequestSchema = z18.strictObject({
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
}).refine((body) => body.email !== undefined || body.name !== undefined, {
  message: "Send an email, a name or both"
});
var internalUpdateMemberProfileResponseSchema = z18.object({
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable()
});
var ABANDON_MAX_AGE_HOURS = 24;
var internalAbandonOrganizationParamsSchema = z18.strictObject({
  organizationId: organizationIdSchema
});
var internalAbandonOrganizationRequestSchema = z18.strictObject({
  userId: userIdSchema
});
var internalAbandonOrganizationResponseSchema = z18.object({
  organizationId: organizationIdSchema,
  status: z18.literal("deleted")
});
// src/core/invitation.ts
import { z as z19 } from "zod";
var invitationSchema = z19.object({
  id: invitationIdSchema,
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.nullable(),
  state: invitationStateSchema,
  invitedByUserId: userIdSchema,
  expiresAt: timestampSchema,
  createdAt: timestampSchema
});
var createInvitationRequestSchema = z19.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional()
});
var CREATE_INVITATION_ERROR_CODES = [
  "invitation.already_pending",
  "invitation.already_member",
  "invitation.pending_limit",
  "invitation.daily_limit",
  "team.not_found",
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress",
  "auth.unauthenticated",
  "auth.token_expired",
  "auth.token_invalid",
  "auth.forbidden",
  "auth.unavailable",
  "organization.suspended",
  "organization.deleted",
  "rate.limited"
];
var listInvitationsQuerySchema = pageQuerySchema.extend({ state: invitationStateSchema.default("pending") }).strict();
var listInvitationsResponseSchema = pageSchema(invitationSchema);
var invitationParamsSchema = z19.strictObject({
  invitationId: invitationIdSchema
});
// src/core/member.ts
import { z as z20 } from "zod";
var memberSchema = z20.object({
  id: membershipIdSchema,
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable(),
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var LIST_MEMBERS_MIN_ROLE = "manager";
var listMembersQuerySchema = pageQuerySchema.strict();
var listMembersResponseSchema = pageSchema(memberSchema);
var memberParamsSchema = z20.strictObject({
  membershipId: membershipIdSchema
});
var changeMemberRoleRequestSchema = z20.strictObject({
  role: roleSchema
});
// src/core/organization.ts
import { z as z21 } from "zod";
var organizationSchema = z21.object({
  id: organizationIdSchema,
  name: storedNameSchema,
  region: regionSchema,
  status: organizationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var renameOrganizationRequestSchema = z21.strictObject({
  name: organizationNameSchema
});
// src/core/team.ts
import { z as z22 } from "zod";
var teamSchema = z22.object({
  id: teamIdSchema,
  name: storedNameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var createTeamRequestSchema = z22.strictObject({
  name: teamNameSchema
});
var renameTeamRequestSchema = z22.strictObject({
  name: teamNameSchema
});
var listTeamsQuerySchema = pageQuerySchema.strict();
var listTeamsResponseSchema = pageSchema(teamSchema);
var teamParamsSchema = z22.strictObject({
  teamId: teamIdSchema
});
var addTeamMemberRequestSchema = z22.strictObject({
  membershipId: membershipIdSchema
});
var teamMemberSchema = z22.object({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
  createdAt: timestampSchema
});
var teamMemberParamsSchema = z22.strictObject({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema
});
var listTeamMembersQuerySchema = pageQuerySchema.strict();
var listTeamMembersResponseSchema = pageSchema(memberSchema);
var LIST_TEAM_MEMBERS_MIN_ROLE = LIST_MEMBERS_MIN_ROLE;
var LIST_TEAM_MEMBERS_ERROR_CODES = [
  "team.not_found",
  "request.invalid",
  "auth.unauthenticated",
  "auth.token_expired",
  "auth.token_invalid",
  "auth.forbidden",
  "auth.unavailable",
  "organization.suspended",
  "organization.deleted",
  "rate.limited"
];
// src/marketing/demo-request.ts
import { z as z23 } from "zod";
var MAX_DEMO_REQUEST_MESSAGE_LENGTH = 2000;
var MAX_DEMO_REQUEST_FIELD_LENGTH = 200;
function hasForbiddenControlCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    const allowedWhitespace = code === 10 || code === 13 || code === 9;
    if (code < 32 && !allowedWhitespace || code >= 127 && code <= 159) {
      return true;
    }
  }
  return false;
}
var demoRequestMessageSchema = z23.string().max(MAX_DEMO_REQUEST_MESSAGE_LENGTH).refine((text) => !hasForbiddenControlCharacter(text), "No control characters").transform((text) => text.trim());
var demoRequestSourcePageSchema = z23.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).regex(/^\/[\x21-\x7e]*$/, "An absolute path");
var createDemoRequestRequestSchema = z23.strictObject({
  name: personNameSchema,
  workEmail: emailSchema,
  companyName: organizationNameSchema,
  message: demoRequestMessageSchema.optional(),
  sourcePage: demoRequestSourcePageSchema,
  website: z23.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).default("")
});
var createDemoRequestResponseSchema = z23.object({
  id: demoRequestIdSchema
});
var createDemoRequest = Object.freeze({
  method: "POST",
  path: "/v1/marketing/demo-requests",
  public: true,
  idempotencyKey: "required",
  success: [201, 200],
  errors: ["marketing.invalid_request", "marketing.rate_limited"],
  commonErrors: [
    "request.too_large",
    "request.unsupported_media_type",
    "request.idempotency_key_reused",
    "request.idempotency_in_progress",
    "server.internal",
    "server.unavailable",
    "server.timeout"
  ],
  description: "Public: no token, no Organization. A Visitor submits a Demo Request: name, work email, company name, an optional message of at most 2,000 characters, the page it came from and a hidden honeypot field. Requires an Idempotency-Key header (16 to 128 characters; the client generates one per form submission): a replay returns the original acknowledgement with 200 instead of storing a second Demo Request, the same key with a different body is request.idempotency_key_reused, and the same key while the first request is running is request.idempotency_in_progress. Answers 201 with only the id of the new Demo Request. A filled honeypot is answered exactly as a real request (201 with an id) and stores nothing. A body that fails validation, has an unknown key, or a missing or malformed Idempotency-Key header is marketing.invalid_request (400). The limit per client address is marketing.rate_limited (429) with details.retryAfter in seconds and a Retry-After header. A body over the size limit is request.too_large."
});
var MARKETING_ROUTES = Object.freeze({ createDemoRequest });
var CREATE_DEMO_REQUEST_ERROR_CODES = [
  ...createDemoRequest.errors,
  ...createDemoRequest.commonErrors
];
// src/marketing/errors.ts
var MARKETING_ERRORS = {
  ...defineErrors("marketing", {
    invalid_request: { status: 400, message: "The request is not valid." },
    rate_limited: {
      status: 429,
      message: "Too many requests from this address. Try again later."
    }
  })
};
// src/playbook/errors.ts
var PLAYBOOK_ERRORS = {
  ...defineErrors("document", {
    not_found: { status: 404, message: "The document was not found." },
    unsupported_type: { status: 415, message: "This file type is not supported." },
    too_large: { status: 413, message: "The file is larger than the upload limit." },
    quota_exceeded: {
      status: 409,
      message: "The Organization has reached its limit on the number or total size of documents. Deleted documents count until they are purged."
    },
    not_restorable: {
      status: 410,
      message: "The document was purged after its retention period and cannot be restored."
    }
  })
};

// src/playbook/routes.ts
var PLAYBOOK_WRITE_ROLES = ["owner", "admin"];
var PLAYBOOK_READ_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var route3 = (definition) => Object.freeze(definition);
var PLAYBOOK_ROUTES = Object.freeze({
  uploadDocument: route3({
    method: "POST",
    path: "/playbook/documents",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [201, 200],
    errors: ["document.unsupported_type", "document.too_large", "document.quota_exceeded"],
    commonErrors: [
      "request.invalid",
      "request.too_large",
      "request.unsupported_media_type",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: `Uploads one file (multipart/form-data, one part named "file") to the Organization's Playbook. Owner and Admin only; Managers and Reps get auth.forbidden. The type and size of the file part are checked before anything is stored: document.unsupported_type (415) and document.too_large (413); a malformed name or an empty file is request.invalid. The common request.too_large and request.unsupported_media_type apply to the whole request instead: a body over the envelope limit, or a body that is not multipart. Answers 201 with the new document in state "uploaded". If the content matches a document the Organization already has, answers 200 with that stored document, with its stored fileName (not the new upload's name), so a duplicate is an answer, not an error: a match on a "deleted" document restores it (state "processing"), and a match on a "failed" document re-queues it for processing and answers with state "uploaded". The page limit is not checked here: a document over it ends in state "failed" with failureReason "too_many_pages". Accepts an Idempotency-Key header.`
  }),
  listDocuments: route3({
    method: "GET",
    path: "/playbook/documents",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's documents, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner, Admin, Manager and Rep may read. Soft-deleted documents are left out unless state=deleted is asked for."
  }),
  getDocument: route3({
    method: "GET",
    path: "/playbook/documents/{documentId}",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: ["document.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one document and its state, with the failure reason when it failed and the purge time when it was deleted. Owner, Admin, Manager and Rep may read."
  }),
  deleteDocument: route3({
    method: "DELETE",
    path: "/playbook/documents/{documentId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["document.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Soft-deletes a document: it is hidden at once and purged after the retention period, and can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the document in state "deleted" and its purge time, and deleting an already deleted document answers the same. Takes no body.'
  }),
  restoreDocument: route3({
    method: "POST",
    path: "/playbook/documents/{documentId}/restore",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["document.not_found", "document.not_restorable"],
    commonErrors: ["request.invalid"],
    description: 'Restores a soft-deleted document within the retention period; it is re-ingested from the kept file and shows as "processing". Owner and Admin only. Idempotent by end state: a document that is no longer deleted (restored by an earlier call, or never deleted) answers 200 with the document as it is. A deleted document whose purge time has passed but which the purge has not yet removed is document.not_restorable (410); once purged the record is gone and the answer is document.not_found (404). Takes no body.'
  }),
  removeOrganizationDocuments: route3({
    method: "POST",
    path: "/internal/playbook/organizations/{organizationId}/remove-all",
    internal: true,
    roles: [],
    success: [200],
    errors: [],
    commonErrors: [
      "request.invalid",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress",
      "server.unavailable"
    ],
    description: "Internal, for offboarding and erasure; no caller yet. Removes every document, file, chunk and vector an Organization has, and, since ADR 0018, its Calls, Recordings, Transcripts, Moments, Deals and Deal imports (and the copy the transcription vendor holds of a Recording), soft-deleted ones included, without waiting for retention. Idempotent by end state: it answers 200 whenever nothing remains, and never answers 200 while data remains. A transient failure (the store, the vector index or the vendor is briefly unreachable) answers 503 server.unavailable with a Retry-After header, and a repeat with the same Idempotency-Key or without reaches 200 once the removal finishes; a failure that will not go away stays an error. Served on the internal network only; takes the Organization from the path."
  })
});

// src/playbook/sales-history-errors.ts
import { z as z27 } from "zod";

// src/playbook/rights.ts
import { z as z26 } from "zod";

// src/playbook/rights-wording.ts
import { z as z25 } from "zod";

// src/playbook/values.ts
import { z as z24 } from "zod";
var DOCUMENT_STATES = ["uploaded", "processing", "ready", "failed", "deleted"];
var documentStateSchema = z24.enum(DOCUMENT_STATES);
var DOCUMENT_FAILURE_REASONS = [
  "too_many_pages",
  "unreadable",
  "password_protected",
  "no_text",
  "processing_failed"
];
var documentFailureReasonSchema = z24.enum(DOCUMENT_FAILURE_REASONS);
var ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt", ".md"];
var ACCEPTED_DOCUMENT_MEDIA_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown"
];
var documentMediaTypeSchema = z24.enum(ACCEPTED_DOCUMENT_MEDIA_TYPES);
var MEDIA_TYPE_BY_EXTENSION = Object.freeze({
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".md": "text/markdown"
});
var MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
var MAX_DOCUMENT_PAGES = 300;
var DOCUMENT_RETENTION_DAYS = 30;
var DEFAULT_MAX_DOCUMENTS = 500;
var DEFAULT_MAX_DOCUMENT_BYTES_TOTAL = 2 * 1024 * 1024 * 1024;
var MAX_UTF8_BYTES_PER_CODE_POINT = 4;
var MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
var MAX_RAW_FILE_NAME_LENGTH = 1000;
var MAX_DOCUMENT_FILE_NAME_BYTES = MAX_DOCUMENT_FILE_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
function isStripped(code) {
  return code <= 31 || code >= 127 && code <= 159 || code === 1564 || code === 8206 || code === 8207 || code >= 8234 && code <= 8238 || code >= 8294 && code <= 8297;
}
function normaliseFileName(name) {
  return stripUnsafe(name).trim();
}
function stripUnsafe(text) {
  let out = "";
  for (let index = 0;index < text.length; index += 1) {
    if (!isStripped(text.charCodeAt(index))) {
      out += text[index];
    }
  }
  return out;
}
function isWellFormed2(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 55296 && code <= 56319) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 56320 && next <= 57343)) {
        return false;
      }
      index += 1;
    } else if (code >= 56320 && code <= 57343) {
      return false;
    }
  }
  return true;
}
function documentExtension(fileName) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_DOCUMENT_EXTENSIONS.find((extension) => lower.endsWith(extension));
}
var INVISIBLE_STEM = /^[\s\u200b-\u200d\u2060\ufeff]*$/;
function hasStem(name) {
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  return !INVISIBLE_STEM.test(stem);
}
var documentFileNameSchema = z24.string().max(MAX_RAW_FILE_NAME_LENGTH).transform(normaliseFileName).pipe(z24.string().min(1).max(MAX_DOCUMENT_FILE_NAME_LENGTH).refine(isWellFormed2, "Well-formed text only").refine((name) => !/[/\\]/.test(name), "No path separators").refine(hasStem, "A name before the extension"));
var documentTypeCheckSchema = z24.string().transform(normaliseFileName).pipe(z24.string().refine((name) => documentExtension(name) !== undefined, "An accepted file type only"));
var documentSizeCheckSchema = z24.number().max(MAX_DOCUMENT_BYTES);
function normaliseMediaType(mediaType) {
  return (mediaType.split(";")[0] ?? "").trim().toLowerCase();
}
function hasStrippableCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    if (isStripped(text.charCodeAt(index))) {
      return true;
    }
  }
  return false;
}
function isWellFormedText(text) {
  return isWellFormed2(text);
}

// src/playbook/rights-wording.ts
var MAX_RIGHTS_HEADING_LENGTH = 200;
var MAX_RIGHTS_PARAGRAPHS = 10;
var MAX_RIGHTS_TEXT_LENGTH = 2000;
var textSchema = (max) => z25.string().min(1).max(max).refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control or direction characters").refine((text) => text.trim() === text, "No surrounding spaces");
var rightsWordingSchema = z25.strictObject({
  heading: textSchema(MAX_RIGHTS_HEADING_LENGTH),
  paragraphs: z25.array(textSchema(MAX_RIGHTS_TEXT_LENGTH)).min(1).max(MAX_RIGHTS_PARAGRAPHS),
  checkbox: textSchema(MAX_RIGHTS_TEXT_LENGTH),
  draft: z25.literal(true).optional()
});
function freeze(wording) {
  return Object.freeze({
    ...wording,
    paragraphs: Object.freeze([...wording.paragraphs])
  });
}
var RIGHTS_WORDINGS = Object.freeze({
  1: freeze({
    draft: true,
    heading: "Confirm your right to share Calls",
    paragraphs: [
      "Before you upload Transcripts or Recordings of past Calls, Closeline records that your Organization has the right to share them.",
      "The Calls you upload hold the words, and in a Recording the voices, of your Reps and of your Prospects. Closeline stores them for your Organization and uses them to find similar Moments from won Deals. It does not share them with other Organizations."
    ],
    checkbox: "I confirm that I am authorised to act for my Organization, that my Organization has the right to share the Transcripts and Recordings it uploads to Closeline, and that any notice to the people on those Calls and any consent the law requires have been given or obtained. I understand that this confirmation is recorded with my name and the time."
  })
});
var CURRENT_RIGHTS_WORDING_VERSION = Math.max(...Object.keys(RIGHTS_WORDINGS).map(Number));
function rightsWordingFor(version) {
  return Object.hasOwn(RIGHTS_WORDINGS, version) ? RIGHTS_WORDINGS[version] : undefined;
}

// src/playbook/rights.ts
var MAX_RIGHTS_WORDING_VERSION = 1e6;
var rightsWordingVersionSchema = z26.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION);
var rightsConfirmationSchema = z26.object({
  wordingVersion: rightsWordingVersionSchema,
  confirmedByUserId: userIdSchema,
  confirmedAt: timestampSchema
});
var rightsStatusSchema = z26.object({
  currentWordingVersion: rightsWordingVersionSchema,
  confirmation: rightsConfirmationSchema.nullable(),
  confirmed: z26.boolean(),
  currentWording: rightsWordingSchema.optional()
}).refine((status) => status.confirmed === (status.confirmation !== null && status.confirmation.wordingVersion === status.currentWordingVersion), { message: "Confirmed exactly when the stored version is the current one", path: ["confirmed"] });
var confirmRightsRequestSchema = z26.strictObject({
  wordingVersion: rightsWordingVersionSchema
});

// src/playbook/sales-history-errors.ts
var SALES_HISTORY_ERRORS = {
  ...defineErrors("call", {
    not_found: { status: 404, message: "The Call was not found." },
    unsupported_type: { status: 415, message: "This file type is not supported." },
    too_large: { status: 413, message: "The file is larger than the upload limit." },
    quota_exceeded: {
      status: 409,
      message: "The Organization has reached its limit on Calls, Recordings or Deals. Deleted Calls count until they are purged."
    },
    content_in_other_deal: {
      status: 409,
      message: "This Call was already uploaded for a different Deal."
    },
    rep_invalid: { status: 422, message: "The Rep choice is not valid for this Call." },
    rep_not_changeable: {
      status: 409,
      message: "The Rep of this Call cannot be changed in its current state."
    },
    not_restorable: {
      status: 410,
      message: "The Call was purged after its retention period and cannot be restored."
    }
  }),
  ...defineErrors("deal", {
    not_found: { status: 404, message: "The Deal was not found." }
  }),
  ...defineErrors("deal_import", {
    not_found: { status: 404, message: "The import was not found." },
    unsupported_type: { status: 415, message: "This file type is not supported." },
    too_large: { status: 413, message: "The file is larger than the upload limit." },
    header_invalid: {
      status: 422,
      message: "The first row does not match the template."
    },
    busy: {
      status: 429,
      message: "Too many imports are waiting. Try again when some have finished."
    }
  }),
  ...defineErrors("rights", {
    confirmation_required: {
      status: 403,
      message: "Confirm that your Organization may share these Calls before uploading them."
    },
    version_outdated: {
      status: 409,
      message: "The confirmation wording has changed. Reload and confirm the current version."
    }
  })
};
var rightsRequiredDetailsSchema = z27.strictObject({
  wordingVersion: z27.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION)
});

// src/playbook/sales-history-routes.ts
var SALES_HISTORY_READ_ROLES = PLAYBOOK_WRITE_ROLES;
var route4 = (definition) => Object.freeze(definition);
var ENVELOPE_ERRORS = [
  "request.invalid",
  "request.too_large",
  "request.unsupported_media_type",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var SALES_HISTORY_ROUTES = Object.freeze({
  uploadCall: route4({
    method: "POST",
    path: "/playbook/calls",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [201, 200],
    errors: [
      "rights.confirmation_required",
      "call.unsupported_type",
      "call.too_large",
      "call.quota_exceeded",
      "call.rep_invalid",
      "call.content_in_other_deal"
    ],
    commonErrors: [...ENVELOPE_ERRORS],
    description: 'Uploads one Call as a Transcript (txt, vtt, srt or json, up to 5 MB) or a Recording (mp3, m4a, wav, ogg, webm or flac, up to 500 MB, streamed to storage and never held whole), as multipart/form-data with one file part named "file" and the text fields "dealId" and "rep". Owner and Admin only; Managers and Reps get auth.forbidden. A Transcript needs "rep", the JSON {"by":"speaker","label":...}; a per-side Recording takes {"by":"channel","channel":"left"|"right"}; a Recording with no "rep" waits in state "awaiting_rep" after transcription until an Owner or Admin picks one. A Deal that does not exist yet is created "open". Refused with rights.confirmation_required (403, its details name the wording version to show) until the Organization has a current rights confirmation. The type and size of the file part are checked before anything is stored: call.unsupported_type (415) and call.too_large (413); a malformed name, an empty file or a bad field is request.invalid, and a Rep choice that does not suit the kind is call.rep_invalid. The common request.too_large and request.unsupported_media_type apply to the whole request instead. Answers 201 with the new Call in state "uploaded". If the content matches a Call the Organization already has under the same Deal, answers 200 with that stored Call: a match on a "deleted" Call restores it (state "processing") and a match on a "failed" Call under the same Deal whose failureReason is transcription_failed, transcription_timed_out or processing_failed (reasons that can be transient) re-queues it for processing (state "uploaded"); a match on a failed Call with any other reason answers 200 with the failed Call unchanged, because the same file would fail the same way: rep_label_not_found and not_per_side are fixed by changing the Rep, and too_many_speakers, no_turns, too_few_speakers, too_long and unreadable by choosing to delete the Call and upload a corrected file; any other match returns the Call as it is. The same content under another deal id is call.content_in_other_deal. A recording over 3 hours, a Transcript with no turns or fewer than two speakers, or a Rep label not in the file is not checked here: the Call ends in state "failed" with a failureReason. Accepts an Idempotency-Key header.'
  }),
  listCalls: route4({
    method: "GET",
    path: "/playbook/calls",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Calls, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. Deleted Calls are left out unless state=deleted is asked for; state=awaiting_rep lists the Calls waiting for a Rep and dealRecordId (the opaque Deal id) limits the list to one Deal. A list item never carries speakers: only the single-Call read returns speaker excerpts."
  }),
  getCall: route4({
    method: "GET",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Call and its state, with the failure reason when it failed, the speaker labels to pick a Rep from and the purge time when it was deleted. For a Recording with speaker labels, above all one awaiting its Rep, it also returns speakers: a short excerpt per label (the first turns of the speaker, at most 240 characters, cut at a word boundary with an ellipsis; at most 20 speakers) so a person can tell who is the Rep. The excerpts are tenant Transcript text: returned only to the Owner and Admin of the owning Organization and never logged. No other Transcript text or audio is returned. Owner and Admin only."
  }),
  deleteCall: route4({
    method: "DELETE",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Soft-deletes a Call: it and its Moments are hidden from search at once and purged after 30 days, and it can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the Call in state "deleted" and its purge time, and deleting an already deleted Call answers the same. Takes no body.'
  }),
  restoreCall: route4({
    method: "POST",
    path: "/playbook/calls/{callId}/restore",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found", "call.not_restorable"],
    commonErrors: ["request.invalid"],
    description: 'Restores a soft-deleted Call within the retention period; it is processed again from the kept Transcript (a Recording is never transcribed twice) and shows as "processing". Owner and Admin only. Idempotent by end state: a Call that is no longer deleted answers 200 with the Call as it is. A deleted Call whose purge time has passed but which the purge has not yet removed is call.not_restorable (410); once purged the record is gone and the answer is call.not_found (404). Takes no body.'
  }),
  setCallRep: route4({
    method: "PUT",
    path: "/playbook/calls/{callId}/rep",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found", "call.rep_invalid", "call.rep_not_changeable"],
    commonErrors: ["request.invalid"],
    description: 'Picks the Rep of a Call waiting in "awaiting_rep", or changes the Rep of a "ready" Call or a "failed" Call whose failureReason is rep_label_not_found or not_per_side, with {"rep":{"by":"speaker","label":...}} or {"rep":{"by":"channel","channel":...}}. Owner and Admin only, and any of them may pick, not only the uploader. A choice that does not suit the Call, or a label that is not among its speakers, is call.rep_invalid; a Call in any other state or with any other failure reason is call.rep_not_changeable. A different Rep answers 200 with the Call in state "processing": its Moments are rebuilt by a queued job and the Call is out of search until it finishes. Idempotent by end state: choosing the Rep the Call already has changes nothing and answers 200 with the Call as it is.'
  }),
  listDeals: route4({
    method: "GET",
    path: "/playbook/deals",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Deals, newest first (sorted by createdAt, then id, the opaque Deal id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. outcome limits the list to one Outcome and appearedInImport=false lists the Deals that have Calls but never appeared in a CSV, so a mistyped deal id is visible."
  }),
  getDeal: route4({
    method: "GET",
    path: "/playbook/deals/{dealRecordId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Deal by its opaque id (the deal_ id from a list or a lookup, never the customer deal id, which is found with the lookup route). Owner and Admin only. A Deal cannot be deleted on its own."
  }),
  lookupDeal: route4({
    method: "POST",
    path: "/playbook/deals/lookup",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Finds a Deal by the customer deal id, sent in the JSON body {"dealId":...} so it never appears in a URL, a query string or a cursor (trimmed, otherwise exact and case-sensitive). Answers 200 with the Deal, whose opaque id is then used in every path, or deal.not_found. Owner and Admin only. It changes nothing.'
  }),
  setDealOutcome: route4({
    method: "PUT",
    path: "/playbook/deals/{dealRecordId}/outcome",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: "Sets or corrects a Deal's Outcome (won, lost or open), even a decided one. Owner and Admin only. Idempotent by end state. A change bumps the Deal's Outcome sequence and queues the re-tag of its Moments; search follows the database at once for a lost Deal and may lag for a Deal that has just become won."
  }),
  uploadDealImport: route4({
    method: "POST",
    path: "/playbook/deal-imports",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [202],
    errors: [
      "deal_import.unsupported_type",
      "deal_import.too_large",
      "deal_import.header_invalid",
      "deal_import.busy"
    ],
    commonErrors: [...ENVELOPE_ERRORS],
    description: 'Uploads the fixed CSV template (columns deal_id, outcome, closed_at, amount, currency and optionally name; closed_at is a plain YYYY-MM-DD date, kept as written, and a value with a time or an offset is a rejected row with the reason invalid_closed_at; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and first row are checked before anything is stored: deal_import.unsupported_type (415), deal_import.too_large (413) and deal_import.header_invalid (422). An Organization with MAX_QUEUED_DEAL_IMPORTS (5) imports not yet finished (state uploaded or processing) is refused with deal_import.busy (429) and nothing is stored; the count is checked before the file is stored, so a refused upload leaves no import. The header is read with checkDealImportHeaderText (the same reader and limits as parseCsv) on the first 8192 characters of the file (a header still unfinished there is deferred to the job, not refused), and the job re-checks the header of its full parse with the same verdict. The rest of the file is parsed in the background job, never on the request path, under strict RFC 4180 quoting: a stray quote fails the file, and a cell over 1000 characters fails the whole file too (a cell up to 1000 characters is checked row by row, and a bad one is a rejected row); blank lines at the end of the file are ignored, and an interior blank line is a rejected row with the reason blank_row, so the report has no gap, and it still counts in the row numbers, and rowNumber is the record number with the header as record 1. Answers 202 with the import in state "uploaded"; it is processed in the background. Imports are not deduplicated by content: each upload is a new import, and only the Idempotency-Key makes a retry of the same request answer with the stored import. Valid rows are applied and bad rows are reported, never dropped: a deal id already won or lost, or repeated within the file, is a rejected row in the report, not an HTTP error. A file with more rows than the limit, a cell over the length limit or a quoting error ends in state "failed" with failureReason "too_many_rows" or "unreadable". Accepts an Idempotency-Key header.'
  }),
  listDealImports: route4({
    method: "GET",
    path: "/playbook/deal-imports",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Deal imports, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only."
  }),
  getDealImport: route4({
    method: "GET",
    path: "/playbook/deal-imports/{importId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal_import.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one import: its state, failure reason and the counts of rows, applied rows and rejected rows. Owner and Admin only."
  }),
  listDealImportRows: route4({
    method: "GET",
    path: "/playbook/deal-imports/{importId}/rows",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal_import.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads the report of an import, in CSV order, one cursor-paginated page at a time (at most 100); result=rejected lists only the rows that need fixing. Each row has its row number (the header is row 1), the deal id when it was valid, the result and a reason code. No other cell is returned. Owner and Admin only."
  }),
  getRightsConfirmation: route4({
    method: "GET",
    path: "/playbook/rights-confirmation",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's recorded confirmation that it may share Recordings and Transcripts, with who confirmed and when, the version of the wording they saw, the current wording version, optionally the text of that version (also in RIGHTS_WORDINGS) and whether the stored one is current. Owner and Admin only. Without a current confirmation, uploads of Calls are refused; existing Calls are kept and stay searchable."
  }),
  confirmRights: route4({
    method: "PUT",
    path: "/playbook/rights-confirmation",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["rights.version_outdated"],
    commonErrors: ["request.invalid"],
    description: "Records the confirmation, with the wording version the member was shown, which must be the current one (else rights.version_outdated, 409). Owner and Admin only. Who confirmed and when come from the token and the clock, never from the body. Idempotent by end state: confirming the current version again changes nothing. A lawyer is to check the wording before real customers use it."
  })
});

// src/playbook/search.ts
import { z as z29 } from "zod";

// src/playbook/call-values.ts
import { z as z28 } from "zod";
var CALL_STATES = [
  "uploaded",
  "transcribing",
  "awaiting_rep",
  "processing",
  "ready",
  "failed",
  "deleted"
];
var callStateSchema = z28.enum(CALL_STATES);
var CALL_FAILURE_REASONS = [
  "no_turns",
  "too_few_speakers",
  "too_many_speakers",
  "rep_label_not_found",
  "not_per_side",
  "too_long",
  "transcription_failed",
  "transcription_timed_out",
  "unreadable",
  "processing_failed"
];
var callFailureReasonSchema = z28.enum(CALL_FAILURE_REASONS);
var CALL_KINDS = ["transcript", "recording"];
var callKindSchema = z28.enum(CALL_KINDS);
var ACCEPTED_TRANSCRIPT_EXTENSIONS = [".txt", ".vtt", ".srt", ".json"];
var ACCEPTED_RECORDING_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".webm",
  ".flac"
];
var CALL_MEDIA_TYPES = [
  "text/plain",
  "text/vtt",
  "application/x-subrip",
  "application/json",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/flac"
];
var callMediaTypeSchema = z28.enum(CALL_MEDIA_TYPES);
var MEDIA_TYPE_BY_CALL_EXTENSION = Object.freeze({
  ".txt": "text/plain",
  ".vtt": "text/vtt",
  ".srt": "application/x-subrip",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".webm": "audio/webm",
  ".flac": "audio/flac"
});
var MAX_TRANSCRIPT_BYTES = 5 * 1024 * 1024;
var MAX_RECORDING_BYTES = 500 * 1024 * 1024;
var MAX_RECORDING_SECONDS = 3 * 60 * 60;
var INCOMPLETE_UPLOAD_PARTS_TTL_HOURS = 24;
var MAX_REP_FOLLOWING_TURNS = 5;
var MAX_REP_FOLLOWING_CHARACTERS = 4000;
var DEFAULT_MAX_CALLS = 2000;
var DEFAULT_MAX_RECORDING_BYTES_TOTAL = 50 * 1024 * 1024 * 1024;
var DEFAULT_MAX_DEALS = 20000;
var MAX_CALL_SPEAKERS = 20;
var MAX_SPEAKER_LABEL_LENGTH = 64;
var MAX_SPEAKER_LABEL_BYTES = MAX_SPEAKER_LABEL_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
function normaliseSpeakerLabel(label) {
  return normaliseFileName(label);
}
var speakerLabelSchema = z28.string().max(1000).transform(normaliseSpeakerLabel).pipe(z28.string().min(1).max(MAX_SPEAKER_LABEL_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((label) => !hasStrippableCharacter(label), "No control characters"));
var MAX_SPEAKER_EXCERPT_LENGTH = 240;
var SPACES = new RegExp(`[\\s${String.fromCharCode(133)}]+`, "g");
var ELLIPSIS = String.fromCodePoint(8230);
function isLoneSurrogate(char) {
  const code = char.codePointAt(0) ?? 0;
  return char.length === 1 && code >= 55296 && code <= 57343;
}
function excerptText(text, max) {
  const collapse = (value) => value.replace(SPACES, " ");
  const clean = collapse(normaliseSpeakerLabel(collapse(text)));
  const chars = Array.from(clean).filter((char) => !isLoneSurrogate(char));
  if (chars.length <= max) {
    return chars.join("");
  }
  const room = max - 1;
  let end = room;
  if (chars[room] !== " ") {
    const space = chars.slice(0, room).lastIndexOf(" ");
    end = space > 0 ? space : room;
  }
  return chars.slice(0, end).join("").trimEnd() + ELLIPSIS;
}
function speakerExcerpt(turns) {
  return excerptText(turns.join(" "), MAX_SPEAKER_EXCERPT_LENGTH);
}
var speakerExcerptSchema = z28.strictObject({
  label: speakerLabelSchema,
  excerpt: z28.string().min(1).max(MAX_SPEAKER_EXCERPT_LENGTH * 2).refine((text) => Array.from(text).length <= MAX_SPEAKER_EXCERPT_LENGTH, "Within the cap").refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters")
});
var CALL_CHANNELS = ["left", "right"];
var callChannelSchema = z28.enum(CALL_CHANNELS);
var repChoiceSchema = z28.discriminatedUnion("by", [
  z28.strictObject({ by: z28.literal("speaker"), label: speakerLabelSchema }),
  z28.strictObject({ by: z28.literal("channel"), channel: callChannelSchema })
]);
function repChoiceSuits(kind, rep, when) {
  if (rep === null || rep === undefined) {
    return when === "upload" && kind === "recording";
  }
  if (kind === "transcript") {
    return rep.by === "speaker";
  }
  return when === "change" || rep.by === "channel";
}
var CALL_FAILURE_FIXES = Object.freeze({
  rep_label_not_found: "change_rep",
  not_per_side: "change_rep",
  transcription_failed: "reupload",
  transcription_timed_out: "reupload",
  processing_failed: "reupload",
  too_many_speakers: "delete_and_upload",
  no_turns: "delete_and_upload",
  too_few_speakers: "delete_and_upload",
  too_long: "delete_and_upload",
  unreadable: "delete_and_upload"
});
function callReuploadRequeues(failureReason) {
  return failureReason !== null && CALL_FAILURE_FIXES[failureReason] === "reupload";
}
function repChangeAllowed(state, failureReason) {
  if (state === "ready" || state === "awaiting_rep") {
    return true;
  }
  return state === "failed" && (failureReason === "rep_label_not_found" || failureReason === "not_per_side");
}

// src/playbook/search.ts
var MAX_SEARCH_LIMIT = 20;
var DEFAULT_SEARCH_LIMIT = 5;
var MAX_SEARCH_TURNS = 6;
var MAX_SEARCH_TEXT_CHARACTERS = 2000;
var MAX_MOMENT_SNIPPET_CHARACTERS = 512;
var MAX_SEARCH_CANDIDATES = 100;
var codePointCount = (text) => Array.from(text).length;
var searchTurnSchema = z29.strictObject({
  role: z29.enum(["rep", "prospect"]),
  text: z29.string().min(1).max(MAX_SEARCH_TEXT_CHARACTERS * 2).refine(isWellFormedText, "Well-formed text only").refine((text) => text.trim().length > 0, "Not only whitespace")
});
var searchMomentsRequestSchema = z29.strictObject({
  turns: z29.array(searchTurnSchema).min(1).max(MAX_SEARCH_TURNS),
  limit: z29.number().int().min(1).max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT)
}).superRefine((request, context) => {
  const total = request.turns.reduce((sum, turn) => sum + codePointCount(turn.text), 0);
  if (total > MAX_SEARCH_TEXT_CHARACTERS) {
    context.addIssue({
      code: "custom",
      path: ["turns"],
      message: "The turns together are within the character limit"
    });
  }
});
var momentSnippetSchema = z29.string().max(MAX_MOMENT_SNIPPET_CHARACTERS * 2).refine((text) => codePointCount(text) <= MAX_MOMENT_SNIPPET_CHARACTERS, "Within the snippet cap").refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters");
function momentSnippet(text) {
  return excerptText(text, MAX_MOMENT_SNIPPET_CHARACTERS);
}
var momentMatchSchema = z29.object({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema,
  score: z29.number().finite(),
  prospect: momentSnippetSchema,
  repNext: momentSnippetSchema
});
var searchEvidenceSchema = z29.object({
  moments: z29.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  deals: z29.number().int().min(0).max(MAX_SEARCH_CANDIDATES)
});
var searchMomentsResponseSchema = z29.object({
  items: z29.array(momentMatchSchema).max(MAX_SEARCH_LIMIT),
  evidence: searchEvidenceSchema
}).superRefine((response, context) => {
  const itemDeals = new Set(response.items.map((match) => match.dealRecordId)).size;
  if (response.evidence.deals > response.evidence.moments || response.items.length > response.evidence.moments || response.evidence.deals < itemDeals) {
    context.addIssue({
      code: "custom",
      path: ["evidence"],
      message: "The items and Deals fit within the candidate Moments, and the Deals cover the items"
    });
  }
});
var ROLE_LABELS = { rep: "Rep", prospect: "Prospect" };
function momentQueryText(turns) {
  return turns.map((turn) => `${ROLE_LABELS[turn.role]}: ${turn.text.trim()}`).join(`
`);
}
var route5 = (definition) => Object.freeze(definition);
var searchDocumentsRequestSchema = searchMomentsRequestSchema;
function documentQueryText(turns) {
  return turns.map((turn) => turn.text.trim()).join(`
`);
}
var documentMatchSchema = z29.object({
  documentId: documentIdSchema,
  fileName: documentFileNameSchema,
  page: z29.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  score: z29.number().finite(),
  snippet: momentSnippetSchema
});
var documentSearchEvidenceSchema = z29.object({
  chunks: z29.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  documents: z29.number().int().min(0).max(MAX_SEARCH_CANDIDATES)
});
var searchDocumentsResponseSchema = z29.object({
  items: z29.array(documentMatchSchema).max(MAX_SEARCH_LIMIT),
  evidence: documentSearchEvidenceSchema
}).superRefine((response, context) => {
  const itemDocuments = new Set(response.items.map((match) => match.documentId)).size;
  if (response.evidence.documents > response.evidence.chunks || response.items.length > response.evidence.chunks || response.evidence.documents < itemDocuments) {
    context.addIssue({
      code: "custom",
      path: ["evidence"],
      message: "The items and documents fit within the candidate chunks, and the documents cover the items"
    });
  }
});
var SEARCH_ROUTES = Object.freeze({
  searchMoments: route5({
    method: "POST",
    path: "/playbook/search/moments",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid", "server.timeout", "server.unavailable"],
    description: "Finds Moments in the Organization's won Deals that resemble the conversation so far, so the Copilot can show what worked. The body is the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best matches, best first, at most 20, each with the opaque callId and dealRecordId, a score and two snippets of at most 512 characters (what the Prospect said and what the Rep said next), and evidence: the number of candidate Moments and the distinct won Deals among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) Moments by similarity, after the eligibility checks), not every won Deal in the Organization. There is no cursor: the result is a bounded top-k. Only Moments of Calls whose Deal is won and whose Call is in search are returned, and only from the caller's Organization. It never returns the customer's dealId, name or amount. The request and the snippets are tenant conversation text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Owner and Admin only, as for all sales history (the owner's decision of 2026-10-13); a Manager or a Rep gets auth.forbidden, because a Rep sees only their own conversations. The phase-2 Copilot calls this service-to-service, not with a Rep's token."
  }),
  searchDocuments: route5({
    method: "POST",
    path: "/playbook/search/documents",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid", "server.timeout", "server.unavailable"],
    description: "Finds passages in the Organization's Playbook documents that resemble the conversation so far, so a Rep can see what the company's own material says. The body is the same as for the Moments search: the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best passages, best first, at most 20, one item per chunk, each with the documentId, the document's fileName (the Organization's own file name), the page (the 1-based page for a paginated format such as PDF, null for a format without pages such as TXT, MD or DOCX and anything else the parser reads as one page; the service decides by media type), a score and a snippet of at most 512 characters, and evidence: the number of candidate chunks that survive the staleness check and the distinct documents among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) chunks by similarity, after the staleness check), not every document in the Organization. The query is embedded with documentQueryText (the turns trimmed and joined by a newline, no role labels), because document chunks are embedded as plain text. There is no cursor: the result is a bounded top-k. Only chunks of documents that are ready and not replaced are returned, and only from the caller's Organization. The request and the snippets are the Organization's own conversation and sales text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Every role that reads the Playbook (Owner, Admin, Manager and Rep) may call it, because the text is the Organization's own sales material; any other is auth.forbidden."
  })
});

// src/playbook/all.ts
var ALL_PLAYBOOK_ROUTES = Object.freeze({ ...PLAYBOOK_ROUTES, ...SALES_HISTORY_ROUTES, ...SEARCH_ROUTES });
var ALL_PLAYBOOK_ERRORS = Object.freeze({ ...PLAYBOOK_ERRORS, ...SALES_HISTORY_ERRORS });
// src/playbook/call.ts
import { z as z31 } from "zod";

// src/playbook/deal-values.ts
import { z as z30 } from "zod";
var OUTCOMES = ["won", "lost", "open"];
var outcomeSchema = z30.enum(OUTCOMES);
var MAX_DEAL_ID_LENGTH = 128;
var MAX_RAW_DEAL_ID_LENGTH = 1000;
var MAX_DEAL_ID_BYTES = MAX_DEAL_ID_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
function isHangulFiller(codePoint) {
  return codePoint === 4447 || codePoint === 4448 || codePoint === 12644 || codePoint === 65440;
}
function hasInvisibleCharacter(text) {
  if (/\p{Cf}/u.test(text)) {
    return true;
  }
  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint === 8232 || codePoint === 8233 || isHangulFiller(codePoint)) {
      return true;
    }
  }
  return false;
}
function normaliseDealId(dealId) {
  return dealId.trim();
}
var dealIdSchema = z30.string().max(MAX_RAW_DEAL_ID_LENGTH).transform(normaliseDealId).pipe(z30.string().min(1).max(MAX_DEAL_ID_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((id) => !hasStrippableCharacter(id), "No control or direction characters").refine((id) => !hasInvisibleCharacter(id), "No invisible characters"));
var MAX_DEAL_NAME_LENGTH = 200;
var MAX_DEAL_NAME_BYTES = MAX_DEAL_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
var dealNameSchema = z30.string().max(1000).trim().pipe(z30.string().min(1).max(MAX_DEAL_NAME_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((name) => !hasStrippableCharacter(name), "No control or direction characters"));
var dealAmountSchema = z30.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,2})?$/);
var dealCurrencySchema = z30.string().regex(/^[A-Z]{3}$/);
var MAX_DEAL_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_DEAL_IMPORT_ROWS = 50000;
var MAX_QUEUED_DEAL_IMPORTS = 5;
var DEAL_IMPORT_REQUIRED_COLUMNS = [
  "deal_id",
  "outcome",
  "closed_at",
  "amount",
  "currency"
];
var DEAL_IMPORT_OPTIONAL_COLUMN = "name";
var MAX_DEAL_IMPORT_HEADER_LENGTH = 1024;
var DEAL_IMPORT_HEADER_PREFIX_CHARS = 8192;
var DEAL_IMPORT_HEADER_PROBLEMS = [
  "empty",
  "too_long",
  "missing_column",
  "unexpected_column",
  "wrong_order",
  "malformed_csv"
];
function checkDealImportHeader(record) {
  const refuse = (problem) => ({ ok: false, code: "deal_import.header_invalid", problem });
  const cells = record.map((cell) => cell.trim());
  if (cells.length === 0 || cells.length === 1 && cells[0] === "") {
    return refuse("empty");
  }
  if (cells.join(",").length > MAX_DEAL_IMPORT_HEADER_LENGTH) {
    return refuse("too_long");
  }
  const known = [...DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_OPTIONAL_COLUMN];
  if (cells.some((cell) => !known.includes(cell))) {
    return refuse("unexpected_column");
  }
  if (new Set(cells).size !== cells.length) {
    return refuse("unexpected_column");
  }
  if (DEAL_IMPORT_REQUIRED_COLUMNS.some((column) => !cells.includes(column))) {
    return refuse("missing_column");
  }
  const expected = [...DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_OPTIONAL_COLUMN].slice(0, cells.length);
  if (cells.some((cell, index) => cell !== expected[index])) {
    return refuse("wrong_order");
  }
  return { ok: true, hasName: cells.length === DEAL_IMPORT_REQUIRED_COLUMNS.length + 1 };
}
function checkDealImportHeaderText(text) {
  const cut = text.length >= DEAL_IMPORT_HEADER_PREFIX_CHARS;
  const first = firstCsvRecord(text);
  if (!first.ok) {
    if (cut && first.failure === "unterminated_quote") {
      return { ok: true, deferred: true };
    }
    return {
      ok: false,
      code: "deal_import.header_invalid",
      problem: first.failure === "cell_too_long" ? "too_long" : "malformed_csv"
    };
  }
  if (cut && !first.complete) {
    return { ok: true, deferred: true };
  }
  return checkDealImportHeader(first.record ?? []);
}
var DEAL_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var dealImportStateSchema = z30.enum(DEAL_IMPORT_STATES);
var DEAL_IMPORT_FAILURE_REASONS = [
  "too_many_rows",
  "unreadable",
  "processing_failed"
];
var dealImportFailureReasonSchema = z30.enum(DEAL_IMPORT_FAILURE_REASONS);
var DEAL_IMPORT_ROW_RESULTS = ["applied", "rejected"];
var dealImportRowResultSchema = z30.enum(DEAL_IMPORT_ROW_RESULTS);
var DEAL_IMPORT_ROW_REASONS = [
  "wrong_column_count",
  "invalid_deal_id",
  "duplicate_in_file",
  "invalid_outcome",
  "invalid_closed_at",
  "invalid_amount",
  "invalid_currency",
  "invalid_name",
  "outcome_already_decided",
  "deal_limit_reached",
  "blank_row"
];
var dealImportRowReasonSchema = z30.enum(DEAL_IMPORT_ROW_REASONS);
var INVALID_CELL = { ok: false };
var DEAL_CLOSED_AT_MIN_YEAR = 1970;
var DEAL_CLOSED_AT_MAX_YEAR = 2100;
function parseOutcomeCell(cell) {
  const result = outcomeSchema.safeParse(cell.trim().toLowerCase());
  return result.success ? { ok: true, value: result.data } : INVALID_CELL;
}
function isCalendarDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) {
    return false;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
function isDealCalendarDate(text) {
  const year = Number(text.slice(0, 4));
  return isCalendarDate(text) && year >= DEAL_CLOSED_AT_MIN_YEAR && year <= DEAL_CLOSED_AT_MAX_YEAR;
}
var calendarDateSchema = z30.iso.date().refine(isDealCalendarDate, "A real calendar date from 1970 to 2100");
function parseClosedAtCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  return isDealCalendarDate(text) ? { ok: true, value: text } : INVALID_CELL;
}
function parseAmountCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  return dealAmountSchema.safeParse(text).success ? { ok: true, value: text } : INVALID_CELL;
}
function parseCurrencyCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  const result = dealCurrencySchema.safeParse(text.toUpperCase());
  return result.success && /^[A-Za-z]{3}$/.test(text) ? { ok: true, value: result.data } : INVALID_CELL;
}
function checkDealImportRow(cells, hasName) {
  const reject = (reason) => ({ ok: false, reason });
  if (cells.length !== DEAL_IMPORT_REQUIRED_COLUMNS.length + (hasName ? 1 : 0)) {
    return reject("wrong_column_count");
  }
  const [dealCell = "", outcomeCell = "", closedCell = "", amountCell = "", currencyCell = ""] = cells;
  const dealId = dealIdSchema.safeParse(dealCell);
  if (!dealId.success) {
    return reject("invalid_deal_id");
  }
  const outcome = parseOutcomeCell(outcomeCell);
  if (!outcome.ok) {
    return reject("invalid_outcome");
  }
  const closedAt = parseClosedAtCell(closedCell);
  if (!closedAt.ok) {
    return reject("invalid_closed_at");
  }
  const amount = parseAmountCell(amountCell);
  if (!amount.ok) {
    return reject("invalid_amount");
  }
  const currency = parseCurrencyCell(currencyCell);
  if (!currency.ok || amount.value !== null && currency.value === null) {
    return reject("invalid_currency");
  }
  let name = null;
  const nameCell = (cells[DEAL_IMPORT_REQUIRED_COLUMNS.length] ?? "").trim();
  if (hasName && nameCell !== "") {
    const parsed = dealNameSchema.safeParse(nameCell);
    if (!parsed.success) {
      return reject("invalid_name");
    }
    name = parsed.data;
  }
  return {
    ok: true,
    row: {
      dealId: dealId.data,
      outcome: outcome.value,
      closedAt: closedAt.value,
      amount: amount.value,
      currency: currency.value,
      name
    }
  };
}
var MAX_DEAL_IMPORT_CELL_LENGTH = 1000;
var CSV_FAILURES = [
  "too_many_records",
  "cell_too_long",
  "unterminated_quote",
  "bad_quote"
];
var NEWLINE = 10;
var RETURN = 13;
var COMMA = 44;
var QUOTE = 34;
function readCsv(text, options, firstOnly) {
  const maxRecords = options?.maxRecords ?? MAX_DEAL_IMPORT_ROWS + 1;
  const maxCell = options?.maxCellLength ?? MAX_DEAL_IMPORT_CELL_LENGTH;
  const length = text.length;
  const records = [];
  let index = text.charCodeAt(0) === 65279 ? 1 : 0;
  const fail = (failure) => ({ ok: false, failure, recordsRead: records.length });
  while (index < length) {
    if (records.length >= maxRecords) {
      return fail("too_many_records");
    }
    const record = [];
    let ended = false;
    while (!ended) {
      let cell;
      let count = 0;
      if (text.charCodeAt(index) === QUOTE) {
        index += 1;
        let segment = index;
        let joined = "";
        for (;; ) {
          if (index >= length) {
            return fail("unterminated_quote");
          }
          const code = text.charCodeAt(index);
          if (code === QUOTE) {
            if (text.charCodeAt(index + 1) === QUOTE) {
              joined += text.slice(segment, index + 1);
              count += 1;
              index += 2;
              segment = index;
              if (count > maxCell) {
                return fail("cell_too_long");
              }
              continue;
            }
            cell = joined === "" ? text.slice(segment, index) : joined + text.slice(segment, index);
            index += 1;
            break;
          }
          if (code < 56320 || code > 57343) {
            count += 1;
            if (count > maxCell) {
              return fail("cell_too_long");
            }
          }
          index += 1;
        }
        const next = text.charCodeAt(index);
        if (index < length && next !== COMMA && next !== NEWLINE && next !== RETURN) {
          return fail("bad_quote");
        }
      } else {
        const start = index;
        while (index < length) {
          const code = text.charCodeAt(index);
          if (code === COMMA || code === NEWLINE || code === RETURN) {
            break;
          }
          if (code === QUOTE) {
            return fail("bad_quote");
          }
          if (code < 56320 || code > 57343) {
            count += 1;
            if (count > maxCell) {
              return fail("cell_too_long");
            }
          }
          index += 1;
        }
        cell = text.slice(start, index);
      }
      record.push(cell);
      const code = index < length ? text.charCodeAt(index) : -1;
      if (code === COMMA) {
        index += 1;
        continue;
      }
      ended = true;
      if (code === RETURN && text.charCodeAt(index + 1) === NEWLINE) {
        index += 2;
      } else if (code !== -1) {
        index += 1;
      }
      records.push(record);
      if (firstOnly) {
        return { ok: true, records, complete: code !== -1 };
      }
    }
  }
  return { ok: true, records, complete: false };
}
function parseCsv(text, options) {
  const result = readCsv(text, options, false);
  if (!result.ok) {
    return result;
  }
  const records = result.records;
  let end = records.length;
  while (end > 1 && isBlankCsvRecord(records[end - 1] ?? [])) {
    end--;
  }
  return { ok: true, records: end === records.length ? records : records.slice(0, end) };
}
function firstCsvRecord(text, options) {
  const result = readCsv(text, options, true);
  return result.ok ? { ok: true, record: result.records[0], complete: result.complete === true } : { ok: false, failure: result.failure, recordsRead: result.recordsRead };
}
function isBlankCsvRecord(record) {
  return record.length === 1 && record[0] === "";
}

// src/playbook/call.ts
var callShape = z31.object({
  id: callIdSchema,
  dealId: dealIdSchema,
  dealRecordId: dealRecordIdSchema,
  dealOutcome: outcomeSchema,
  inSearch: z31.boolean(),
  kind: callKindSchema,
  fileName: documentFileNameSchema,
  mediaType: callMediaTypeSchema,
  sizeBytes: z31.number().int().min(1).max(MAX_RECORDING_BYTES),
  durationSeconds: z31.number().int().min(1).max(MAX_RECORDING_SECONDS).nullable(),
  state: callStateSchema,
  failureReason: callFailureReasonSchema.nullable(),
  rep: repChoiceSchema.nullable(),
  speakerLabels: z31.array(speakerLabelSchema).max(MAX_CALL_SPEAKERS),
  speakers: z31.array(speakerExcerptSchema).max(MAX_CALL_SPEAKERS).optional(),
  deletedAt: timestampSchema.nullable(),
  purgeAt: timestampSchema.nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
function refineCall(call, context) {
  const issue = (path, message) => context.addIssue({ code: "custom", path: [path], message });
  if (call.state === "failed" !== (call.failureReason !== null)) {
    issue("failureReason", "A failure reason is set exactly when the state is failed");
  }
  const deleted = call.state === "deleted";
  if (deleted !== (call.deletedAt !== null) || deleted !== (call.purgeAt !== null)) {
    issue("purgeAt", "A deletion time and a purge time are set exactly when the state is deleted");
  }
  if (call.state === "awaiting_rep" && call.rep !== null) {
    issue("rep", "A Call awaiting its Rep has none");
  }
  if (call.state === "ready" && call.rep === null) {
    issue("rep", "A ready Call has a Rep");
  }
  if (call.kind === "transcript" && (call.state === "transcribing" || call.state === "awaiting_rep")) {
    issue("state", "A Transcript is not transcribed and has its Rep at upload");
  }
  if (call.kind === "transcript" && call.durationSeconds !== null) {
    issue("durationSeconds", "A Transcript has no duration");
  }
  if (call.kind === "transcript" && call.sizeBytes > MAX_TRANSCRIPT_BYTES) {
    issue("sizeBytes", "A Transcript is within the Transcript size limit");
  }
  if (call.kind === "recording" ? !call.mediaType.startsWith("audio/") : call.mediaType.startsWith("audio/")) {
    issue("mediaType", "The kind agrees with the media type");
  }
  if (call.failureReason === "too_many_speakers" && call.speakerLabels.length > 0) {
    issue("speakerLabels", "A Call with too many speakers lists none");
  }
  if (new Set(call.speakerLabels).size !== call.speakerLabels.length) {
    issue("speakerLabels", "Speaker labels are unique");
  }
  if (call.speakers !== undefined) {
    const labels = call.speakers.map((speaker) => speaker.label);
    if (call.kind !== "recording" || labels.length === 0) {
      issue("speakers", "Speaker excerpts are for a Recording and are absent when there are none");
    }
    if (new Set(labels).size !== labels.length) {
      issue("speakers", "Speaker excerpt labels are unique");
    }
    if (!labels.every((label) => call.speakerLabels.includes(label))) {
      issue("speakers", "Every excerpt belongs to one of the Call speakers");
    }
  }
  if (call.inSearch && (call.state !== "ready" || call.dealOutcome !== "won")) {
    issue("inSearch", "A Call is in search only when it is ready and its Deal is won");
  }
  if (call.state === "ready" && call.rep?.by === "speaker" && !call.speakerLabels.includes(call.rep.label)) {
    issue("rep", "A ready Call's Rep label is among its speakers");
  }
}
var callSchema = callShape.superRefine(refineCall);
var MAX_REP_FIELD_LENGTH = 512;
var uploadCallFieldsSchema = z31.strictObject({
  dealId: dealIdSchema,
  rep: z31.string().max(MAX_REP_FIELD_LENGTH).optional()
});
function parseRepField(text) {
  if (text === undefined) {
    return { ok: true, rep: null };
  }
  const invalid = { ok: false, code: "call.rep_invalid" };
  if (text.length === 0 || text.length > MAX_REP_FIELD_LENGTH) {
    return invalid;
  }
  try {
    const result = repChoiceSchema.safeParse(JSON.parse(text));
    return result.success ? { ok: true, rep: result.data } : invalid;
  } catch {
    return invalid;
  }
}
var callParamsSchema = z31.strictObject({ callId: callIdSchema });
var listCallsQuerySchema = pageQuerySchema.extend({ state: callStateSchema.optional(), dealRecordId: dealRecordIdSchema.optional() }).strict();
var callListItemSchema = callShape.omit({ speakers: true }).strict().superRefine(refineCall);
var listCallsResponseSchema = pageSchema(callListItemSchema);
var setCallRepRequestSchema = z31.strictObject({ rep: repChoiceSchema });
var CALL_FILE_KEYS = ["fileName", "declaredMediaType", "sizeBytes"];
var uploadCallFileSchema = z31.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z31.string().max(255).nullable(),
  sizeBytes: z31.number().int().min(1)
});
function callKindOf(fileName) {
  const lower = fileName.toLowerCase();
  if (ACCEPTED_TRANSCRIPT_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return "transcript";
  }
  if (ACCEPTED_RECORDING_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return "recording";
  }
  return;
}
function checkCallFile(input) {
  const invalid = { ok: false, code: "request.invalid" };
  if (typeof input !== "object" || input === null) {
    return invalid;
  }
  if (Object.keys(input).some((key) => !CALL_FILE_KEYS.includes(key))) {
    return invalid;
  }
  const copy = Object.create(null);
  for (const key of CALL_FILE_KEYS) {
    if (Object.hasOwn(input, key)) {
      copy[key] = input[key];
    }
  }
  const { fileName, sizeBytes } = copy;
  if (typeof fileName !== "string" || typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) {
    return invalid;
  }
  if (sizeBytes > MAX_RECORDING_BYTES) {
    return { ok: false, code: "call.too_large" };
  }
  const kind = callKindOf(normaliseFileName(fileName));
  if (kind === undefined) {
    return { ok: false, code: "call.unsupported_type" };
  }
  if (kind === "transcript" && sizeBytes > MAX_TRANSCRIPT_BYTES) {
    return { ok: false, code: "call.too_large" };
  }
  const parsed = uploadCallFileSchema.safeParse(copy);
  return parsed.success ? { ok: true, kind, file: parsed.data } : invalid;
}
var callCursorSchema = z31.strictObject({ createdAt: timestampSchema, id: callIdSchema });
// src/playbook/deal.ts
import { z as z32 } from "zod";
var dealSchema = z32.object({
  id: dealRecordIdSchema,
  dealId: dealIdSchema,
  name: dealNameSchema.nullable(),
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable(),
  amount: dealAmountSchema.nullable(),
  currency: dealCurrencySchema.nullable(),
  callCount: z32.number().int().min(0),
  appearedInImport: z32.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).refine((deal) => deal.amount === null || deal.currency !== null, {
  message: "An amount comes with a currency",
  path: ["currency"]
});
var dealParamsSchema = z32.strictObject({ dealRecordId: dealRecordIdSchema });
var listDealsQuerySchema = pageQuerySchema.extend({
  outcome: outcomeSchema.optional(),
  appearedInImport: z32.enum(["true", "false"]).transform((value) => value === "true").optional()
}).strict();
var listDealsResponseSchema = pageSchema(dealSchema);
var setDealOutcomeRequestSchema = z32.strictObject({
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable().optional()
});
var lookupDealRequestSchema = z32.strictObject({ dealId: dealIdSchema });
var dealCursorSchema = z32.strictObject({
  createdAt: timestampSchema,
  id: dealRecordIdSchema
});
var dealImportCursorSchema = z32.strictObject({
  createdAt: timestampSchema,
  id: dealImportIdSchema
});
var dealImportRowCursorSchema = z32.strictObject({ rowNumber: z32.number().int().min(2) });
var DEAL_IMPORT_FILE_FIELD = "file";
var dealImportSchema = z32.object({
  id: dealImportIdSchema,
  state: dealImportStateSchema,
  failureReason: dealImportFailureReasonSchema.nullable(),
  rowCount: z32.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  appliedCount: z32.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  rejectedCount: z32.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((item, context) => {
  if (item.state === "failed" !== (item.failureReason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "A failure reason is set exactly when the state is failed"
    });
  }
  const counted = item.rowCount !== null && item.appliedCount !== null && item.rejectedCount !== null;
  const none = item.rowCount === null && item.appliedCount === null && item.rejectedCount === null;
  if (item.state === "completed" ? !counted : !none) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The counts are set exactly when the import is completed"
    });
  }
  if (counted && item.appliedCount !== null && item.rejectedCount !== null && item.rowCount !== item.appliedCount + item.rejectedCount) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The row count is the applied and rejected rows together"
    });
  }
});
var dealImportParamsSchema = z32.strictObject({ importId: dealImportIdSchema });
var listDealImportsQuerySchema = pageQuerySchema.strict();
var listDealImportsResponseSchema = pageSchema(dealImportSchema);
var dealImportRowSchema = z32.object({
  rowNumber: z32.number().int().min(2).max(MAX_DEAL_IMPORT_ROWS + 1),
  dealId: dealIdSchema.nullable(),
  result: dealImportRowResultSchema,
  reason: dealImportRowReasonSchema.nullable()
}).superRefine((row, context) => {
  if (row.reason === "blank_row" && row.dealId !== null) {
    context.addIssue({
      code: "custom",
      path: ["dealId"],
      message: "A blank row has no deal id"
    });
  }
  if (row.result === "rejected" !== (row.reason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is set exactly when the row is rejected"
    });
  }
  if (row.dealId === null && row.reason !== "invalid_deal_id" && row.reason !== "wrong_column_count" && row.reason !== "blank_row") {
    context.addIssue({
      code: "custom",
      path: ["dealId"],
      message: "Only a row with no usable deal id has none"
    });
  }
});
var listDealImportRowsQuerySchema = pageQuerySchema.extend({ result: dealImportRowResultSchema.optional() }).strict();
var listDealImportRowsResponseSchema = pageSchema(dealImportRowSchema);
// src/playbook/document.ts
import { z as z33 } from "zod";
var documentSchema = z33.object({
  id: documentIdSchema,
  fileName: documentFileNameSchema,
  mediaType: documentMediaTypeSchema,
  sizeBytes: z33.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  pageCount: z33.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  state: documentStateSchema,
  failureReason: documentFailureReasonSchema.nullable(),
  deletedAt: timestampSchema.nullable(),
  purgeAt: timestampSchema.nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((document, context) => {
  if (document.state === "failed" !== (document.failureReason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "A failure reason is set exactly when the state is failed"
    });
  }
  const deleted = document.state === "deleted";
  if (deleted !== (document.deletedAt !== null) || deleted !== (document.purgeAt !== null)) {
    context.addIssue({
      code: "custom",
      path: ["purgeAt"],
      message: "A deletion time and a purge time are set exactly when the state is deleted"
    });
  }
});
var UPLOAD_FILE_FIELD = "file";
var UPLOAD_CONTENT_TYPE = "multipart/form-data";
var uploadDocumentFileSchema = z33.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z33.string().max(255).nullable(),
  sizeBytes: z33.number().int().min(1)
});
var documentParamsSchema = z33.strictObject({
  documentId: documentIdSchema
});
var listDocumentsQuerySchema = pageQuerySchema.extend({ state: documentStateSchema.optional() }).strict();
var listDocumentsResponseSchema = pageSchema(documentSchema);
var internalRemoveOrganizationDocumentsParamsSchema = z33.strictObject({
  organizationId: organizationIdSchema
});
var internalRemoveOrganizationDocumentsRequestSchema = z33.strictObject({});
var internalRemoveOrganizationDocumentsResponseSchema = z33.object({
  organizationId: organizationIdSchema,
  status: z33.literal("removed")
});
var UPLOAD_FILE_KEYS = ["fileName", "declaredMediaType", "sizeBytes"];
function checkUploadFile(input) {
  const invalid = { ok: false, code: "request.invalid" };
  if (typeof input !== "object" || input === null) {
    return invalid;
  }
  const keys = Object.keys(input);
  if (keys.some((key) => !UPLOAD_FILE_KEYS.includes(key))) {
    return invalid;
  }
  const copy = Object.create(null);
  for (const key of UPLOAD_FILE_KEYS) {
    if (Object.hasOwn(input, key)) {
      copy[key] = input[key];
    }
  }
  const { fileName, sizeBytes } = copy;
  if (typeof fileName !== "string" || typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) {
    return invalid;
  }
  if (!documentSizeCheckSchema.safeParse(sizeBytes).success) {
    return { ok: false, code: "document.too_large" };
  }
  if (!documentTypeCheckSchema.safeParse(fileName).success) {
    return { ok: false, code: "document.unsupported_type" };
  }
  const parsed = uploadDocumentFileSchema.safeParse(copy);
  return parsed.success ? { ok: true, file: parsed.data } : invalid;
}
// src/playbook/messages.ts
import { z as z34 } from "zod";
var documentUploadedPayloadSchema = z34.strictObject({
  documentId: documentIdSchema
});
var DOCUMENT_UPLOADED_MESSAGE = {
  type: "playbook.document_uploaded",
  version: 1,
  scope: "organization",
  payload: documentUploadedPayloadSchema
};
var MAX_DELETION_SEQ = 2147483647;
var documentDeletedPayloadSchema = z34.strictObject({
  documentId: documentIdSchema,
  deletionSeq: z34.number().int().min(1).max(MAX_DELETION_SEQ)
});
var DOCUMENT_DELETED_MESSAGE = {
  type: "playbook.document_deleted",
  version: 1,
  scope: "organization",
  payload: documentDeletedPayloadSchema
};
// src/playbook/sales-history-messages.ts
import { z as z35 } from "zod";
var MAX_SEQ = MAX_DELETION_SEQ;
var seqSchema = z35.number().int().min(1).max(MAX_SEQ);
var callUploadedPayloadSchema = z35.strictObject({ callId: callIdSchema });
var CALL_UPLOADED_MESSAGE = {
  type: "playbook.call_uploaded",
  version: 1,
  scope: "organization",
  payload: callUploadedPayloadSchema
};
var callTranscribedPayloadSchema = z35.strictObject({ callId: callIdSchema });
var CALL_TRANSCRIBED_MESSAGE = {
  type: "playbook.call_transcribed",
  version: 1,
  scope: "organization",
  payload: callTranscribedPayloadSchema
};
var callRepChangedPayloadSchema = z35.strictObject({
  callId: callIdSchema,
  repSeq: seqSchema
});
var CALL_REP_CHANGED_MESSAGE = {
  type: "playbook.call_rep_changed",
  version: 1,
  scope: "organization",
  payload: callRepChangedPayloadSchema
};
var callDeletedPayloadSchema = z35.strictObject({
  callId: callIdSchema,
  deletionSeq: seqSchema
});
var CALL_DELETED_MESSAGE = {
  type: "playbook.call_deleted",
  version: 1,
  scope: "organization",
  payload: callDeletedPayloadSchema
};
var dealOutcomeChangedPayloadSchema = z35.strictObject({
  dealRecordId: dealRecordIdSchema,
  outcomeSeq: seqSchema
});
var DEAL_OUTCOME_CHANGED_MESSAGE = {
  type: "playbook.deal_outcome_changed",
  version: 1,
  scope: "organization",
  payload: dealOutcomeChangedPayloadSchema
};
var dealImportUploadedPayloadSchema = z35.strictObject({ importId: dealImportIdSchema });
var DEAL_IMPORT_UPLOADED_MESSAGE = {
  type: "playbook.deal_import_uploaded",
  version: 1,
  scope: "organization",
  payload: dealImportUploadedPayloadSchema
};
// src/prospect/errors.ts
import { z as z36 } from "zod";
var PROSPECT_ERRORS = {
  ...defineErrors("prospect", {
    not_found: {
      status: 404,
      message: "The requested Prospect, Prospect Company, import or merge was not found."
    },
    duplicate_identity: {
      status: 409,
      message: "Another Prospect already has this email, phone or LinkedIn address."
    },
    import_invalid: { status: 422, message: "The import file cannot be accepted." },
    merge_conflict: {
      status: 409,
      message: "These Prospects cannot be merged, or this merge cannot be undone."
    },
    forbidden_owner: { status: 403, message: "This member cannot own the Prospect." }
  })
};
var prospectNotFoundDetailsSchema = z36.strictObject({
  resource: z36.enum(["prospect", "company", "import", "merge"])
});
var duplicateIdentityDetailsSchema = z36.strictObject({
  identityKind: prospectIdentityKindSchema,
  prospectId: prospectIdSchema.optional()
});
// src/prospect/events.ts
import { z as z38 } from "zod";

// src/prospect/merge.ts
import { z as z37 } from "zod";
var PROSPECT_MERGE_UNDO_DAYS = 30;
var MAX_MERGED_PROSPECTS = 5;
var prospectMergeParamsSchema = z37.strictObject({ mergeId: prospectMergeIdSchema });
var mergeProspectsRequestSchema = z37.strictObject({
  mergedProspectIds: z37.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids"),
  fieldChoices: z37.partialRecord(prospectFieldNameSchema, prospectIdSchema).default({})
});
var PROSPECT_MERGE_STATES = ["merged", "undone"];
var prospectMergeSchema = z37.object({
  id: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  mergedProspectIds: z37.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS),
  fieldChoices: z37.partialRecord(prospectFieldNameSchema, prospectIdSchema),
  state: z37.enum(PROSPECT_MERGE_STATES),
  mergedByUserId: userIdSchema,
  createdAt: timestampSchema,
  undoableUntil: timestampSchema,
  undoneAt: timestampSchema.nullable()
}).refine((merge) => merge.state === "undone" === (merge.undoneAt !== null), {
  path: ["undoneAt"],
  message: "undoneAt is set exactly when the state is undone"
});
var listProspectDuplicatesQuerySchema = pageQuerySchema.extend({ prospectId: prospectIdSchema.optional() }).strict();
var prospectDuplicateSchema = z37.object({
  prospectIds: z37.tuple([prospectIdSchema, prospectIdSchema]),
  matchedOn: z37.array(prospectIdentityKindSchema).min(1).max(3)
});
var listProspectDuplicatesResponseSchema = pageSchema(prospectDuplicateSchema);
var prospectDuplicateCursorSchema = z37.strictObject({
  first: prospectIdSchema,
  second: prospectIdSchema
});

// src/prospect/events.ts
var prospectCreatedEvent = defineEvent("prospect.created", 1, z38.strictObject({
  prospectId: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  source: sourceKindSchema
}));
var prospectUpdatedEvent = defineEvent("prospect.updated", 1, z38.strictObject({
  prospectId: prospectIdSchema,
  changedFields: z38.array(prospectFieldNameSchema).max(6),
  ownerChanged: z38.boolean(),
  companyChanged: z38.boolean(),
  statusChanged: z38.boolean(),
  source: sourceKindSchema
}));
var prospectMergedEvent = defineEvent("prospect.merged", 1, z38.strictObject({
  mergeId: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  mergedProspectIds: z38.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS)
}));
var prospectMergeUndoneEvent = defineEvent("prospect.merge_undone", 1, z38.strictObject({
  mergeId: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  restoredProspectIds: z38.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS)
}));
var prospectErasedEvent = defineEvent("prospect.erased", 1, z38.strictObject({ prospectId: prospectIdSchema }));
var PROSPECT_EVENTS = {
  "prospect.created": prospectCreatedEvent,
  "prospect.updated": prospectUpdatedEvent,
  "prospect.merged": prospectMergedEvent,
  "prospect.merge_undone": prospectMergeUndoneEvent,
  "prospect.erased": prospectErasedEvent
};
// src/prospect/import.ts
import { z as z39 } from "zod";
var MAX_PROSPECT_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_PROSPECT_IMPORT_ROWS = 50000;
var PROSPECT_IMPORT_FILE_FIELD = "file";
var PROSPECT_IMPORT_COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "linkedin_url",
  "job_title",
  "company_name",
  "company_domain",
  "owner_email",
  "tags"
];
var PROSPECT_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var prospectImportStateSchema = z39.enum(PROSPECT_IMPORT_STATES);
var PROSPECT_IMPORT_FAILURE_REASONS = ["too_many_rows", "unreadable"];
var prospectImportFailureReasonSchema = z39.enum(PROSPECT_IMPORT_FAILURE_REASONS);
var PROSPECT_IMPORT_ROW_RESULTS = ["created", "updated", "skipped", "rejected"];
var prospectImportRowResultSchema = z39.enum(PROSPECT_IMPORT_ROW_RESULTS);
var PROSPECT_IMPORT_SKIP_REASONS = ["no_change", "manual_values_kept"];
var PROSPECT_IMPORT_REJECT_REASONS = [
  "wrong_column_count",
  "blank_row",
  "missing_identity",
  "invalid_email",
  "invalid_phone",
  "invalid_linkedin_url",
  "invalid_name",
  "invalid_job_title",
  "invalid_company",
  "invalid_tags",
  "owner_not_found",
  "owner_not_allowed",
  "duplicate_in_file",
  "identity_conflict"
];
var prospectImportRowReasonSchema = z39.enum([
  ...PROSPECT_IMPORT_SKIP_REASONS,
  ...PROSPECT_IMPORT_REJECT_REASONS
]);
var countSchema = z39.number().int().min(0).max(MAX_PROSPECT_IMPORT_ROWS);
var prospectImportSchema = z39.object({
  id: prospectImportIdSchema,
  state: prospectImportStateSchema,
  failureReason: prospectImportFailureReasonSchema.nullable(),
  rowCount: countSchema.nullable(),
  createdCount: countSchema.nullable(),
  updatedCount: countSchema.nullable(),
  skippedCount: countSchema.nullable(),
  rejectedCount: countSchema.nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((item, context) => {
  if (item.state === "failed" !== (item.failureReason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "A failure reason is set exactly when the state is failed"
    });
  }
  const counts = [
    item.rowCount,
    item.createdCount,
    item.updatedCount,
    item.skippedCount,
    item.rejectedCount
  ];
  const allSet = counts.every((count) => count !== null);
  const noneSet = counts.every((count) => count === null);
  if (item.state === "completed" ? !allSet : !noneSet) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The counts are set exactly when the import is completed"
    });
  }
  if (allSet && item.rowCount !== (item.createdCount ?? 0) + (item.updatedCount ?? 0) + (item.skippedCount ?? 0) + (item.rejectedCount ?? 0)) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The row count is the four result counts together"
    });
  }
});
var prospectImportParamsSchema = z39.strictObject({ importId: prospectImportIdSchema });
var listProspectImportsQuerySchema = pageQuerySchema.strict();
var listProspectImportsResponseSchema = pageSchema(prospectImportSchema);
var prospectImportCursorSchema = z39.strictObject({
  createdAt: timestampSchema,
  id: prospectImportIdSchema
});
var prospectImportRowSchema = z39.object({
  rowNumber: z39.number().int().min(2).max(MAX_PROSPECT_IMPORT_ROWS + 1),
  result: prospectImportRowResultSchema,
  reason: prospectImportRowReasonSchema.nullable(),
  prospectId: prospectIdSchema.nullable()
}).superRefine((row, context) => {
  const wantsReason = row.result === "skipped" || row.result === "rejected";
  if (wantsReason !== (row.reason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is set exactly when the row is skipped or rejected"
    });
  }
  const isSkipReason = PROSPECT_IMPORT_SKIP_REASONS.includes(row.reason ?? "");
  if (row.reason !== null && row.result === "skipped" !== isSkipReason) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A skip reason belongs to a skipped row and a reject reason to a rejected row"
    });
  }
  if (row.result === "rejected" && row.prospectId !== null) {
    context.addIssue({
      code: "custom",
      path: ["prospectId"],
      message: "A rejected row has no Prospect"
    });
  }
  if ((row.result === "created" || row.result === "updated") && row.prospectId === null) {
    context.addIssue({
      code: "custom",
      path: ["prospectId"],
      message: "A created or updated row names its Prospect"
    });
  }
});
var listProspectImportRowsQuerySchema = pageQuerySchema.extend({ result: prospectImportRowResultSchema.optional() }).strict();
var listProspectImportRowsResponseSchema = pageSchema(prospectImportRowSchema);
var prospectImportRowCursorSchema = z39.strictObject({
  rowNumber: z39.number().int().min(2)
});
var PROSPECT_IMPORT_REPORT_COLUMNS = [
  "row_number",
  "result",
  "reason",
  "prospect_id"
];
var PROSPECT_IMPORT_INVALID_REASONS = [
  "unsupported_type",
  "too_large",
  "header_invalid",
  "too_many_rows"
];
var prospectImportInvalidDetailsSchema = z39.strictObject({
  reason: z39.enum(PROSPECT_IMPORT_INVALID_REASONS)
});
// src/prospect/prospect.ts
import { z as z40 } from "zod";
var PROSPECT_STATUSES = ["active", "archived"];
var prospectStatusSchema = z40.enum(PROSPECT_STATUSES);
var prospectSchema = z40.object({
  id: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  status: prospectStatusSchema,
  source: sourceKindSchema,
  tags: prospectTagsSchema,
  notes: z40.string().min(1).max(5000).nullable(),
  fields: z40.partialRecord(prospectFieldNameSchema, fieldValueSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var prospectParamsSchema = z40.strictObject({ prospectId: prospectIdSchema });
var hasPersonalField = (body) => body.firstName !== undefined || body.lastName !== undefined || body.email !== undefined || body.phone !== undefined || body.linkedinUrl !== undefined;
var createProspectRequestSchema = z40.strictObject({
  firstName: prospectNamePartSchema.optional(),
  lastName: prospectNamePartSchema.optional(),
  jobTitle: prospectJobTitleSchema.optional(),
  email: emailSchema.optional(),
  phone: rawPhoneSchema.optional(),
  linkedinUrl: rawLinkedinUrlSchema.optional(),
  companyId: prospectCompanyIdSchema.optional(),
  ownerMembershipId: membershipIdSchema.optional(),
  tags: prospectTagsSchema.optional(),
  notes: prospectNotesSchema.optional()
}).refine(hasPersonalField, "Give at least a name, an email, a phone or a LinkedIn address");
var updateProspectRequestSchema = z40.strictObject({
  firstName: prospectNamePartSchema.nullable().optional(),
  lastName: prospectNamePartSchema.nullable().optional(),
  jobTitle: prospectJobTitleSchema.nullable().optional(),
  email: emailSchema.nullable().optional(),
  phone: rawPhoneSchema.nullable().optional(),
  linkedinUrl: rawLinkedinUrlSchema.nullable().optional(),
  companyId: prospectCompanyIdSchema.nullable().optional(),
  status: prospectStatusSchema.optional(),
  tags: prospectTagsSchema.optional(),
  notes: prospectNotesSchema.nullable().optional()
}).refine((body) => Object.values(body).some((value) => value !== undefined), "Send a change");
var prospectSearchSchema = boundedTextSchema(MAX_PROSPECT_SEARCH_LENGTH);
var listProspectsQuerySchema = pageQuerySchema.extend({
  ownerMembershipId: membershipIdSchema.optional(),
  source: sourceKindSchema.optional(),
  companyId: prospectCompanyIdSchema.optional(),
  status: prospectStatusSchema.optional(),
  q: prospectSearchSchema.optional()
}).strict();
var listProspectsResponseSchema = pageSchema(prospectSchema);
var prospectCursorSchema = z40.strictObject({
  createdAt: timestampSchema,
  id: prospectIdSchema
});
var prospectFieldParamsSchema = z40.strictObject({
  prospectId: prospectIdSchema,
  field: prospectFieldNameSchema
});
var listFieldHistoryQuerySchema = pageQuerySchema.strict();
var listFieldHistoryResponseSchema = pageSchema(fieldHistoryEntrySchema);
var fieldHistoryCursorSchema = z40.strictObject({
  setAt: timestampSchema,
  seq: z40.number().int().min(0)
});
var setProspectOwnerRequestSchema = z40.strictObject({
  ownerMembershipId: membershipIdSchema
});
var MAX_BULK_ASSIGN_PROSPECTS = 5000;
var BULK_ASSIGN_SYNC_LIMIT = 500;
var bulkAssignProspectsRequestSchema = z40.strictObject({
  prospectIds: z40.array(prospectIdSchema).min(1).max(MAX_BULK_ASSIGN_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids"),
  ownerMembershipId: membershipIdSchema
});
var bulkAssignProspectsResponseSchema = z40.object({
  state: z40.enum(["applied", "queued"]),
  requested: z40.number().int().min(1).max(MAX_BULK_ASSIGN_PROSPECTS),
  assigned: z40.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable(),
  skipped: z40.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable()
}).refine((body) => body.state === "applied" ? body.assigned !== null && body.skipped !== null : body.assigned === null && body.skipped === null, "The counts are set exactly when the assignment was applied");
var eraseProspectResponseSchema = z40.object({
  prospectId: prospectIdSchema,
  state: z40.literal("queued")
});
var prospectCompanySchema = z40.object({
  id: prospectCompanyIdSchema,
  fields: z40.object({
    name: fieldValueSchema,
    domain: fieldValueSchema.optional()
  }),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var prospectCompanyParamsSchema = z40.strictObject({ companyId: prospectCompanyIdSchema });
var prospectCompanyFieldParamsSchema = z40.strictObject({
  companyId: prospectCompanyIdSchema,
  field: prospectCompanyFieldNameSchema
});
var createProspectCompanyRequestSchema = z40.strictObject({
  name: prospectCompanyNameSchema,
  domain: prospectCompanyDomainSchema.optional()
});
var updateProspectCompanyRequestSchema = z40.strictObject({
  name: prospectCompanyNameSchema.optional(),
  domain: prospectCompanyDomainSchema.nullable().optional()
}).refine((body) => body.name !== undefined || body.domain !== undefined, "Send a change");
var listProspectCompaniesQuerySchema = pageQuerySchema.extend({ q: prospectSearchSchema.optional() }).strict();
var listProspectCompaniesResponseSchema = pageSchema(prospectCompanySchema);
var prospectCompanyCursorSchema = z40.strictObject({
  createdAt: timestampSchema,
  id: prospectCompanyIdSchema
});
// src/prospect/routes.ts
var PROSPECT_ADMIN_ROLES = ["owner", "admin"];
var PROSPECT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var route6 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS2 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var VISIBILITY = "Visibility is decided from the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a record of another Organization.";
var PROSPECT_ROUTES = Object.freeze({
  createProspect: route6({
    method: "POST",
    path: "/v1/prospects",
    roles: PROSPECT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.duplicate_identity", "prospect.forbidden_owner", "prospect.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Creates a Prospect by hand with the Source manual. Every role may; a Rep becomes its owner and only Owner and Admin may name another owner (else prospect.forbidden_owner). An email, phone or LinkedIn address another Prospect already has is prospect.duplicate_identity; the answer names that Prospect only if the caller may see it. A Prospect Company that does not exist is prospect.not_found. Answers 201, or 200 with the original Prospect for a replay of the same Idempotency-Key."
  }),
  listProspects: route6({
    method: "GET",
    path: "/v1/prospects",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Prospects, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: ownerMembershipId, source, companyId, status and q (a search on name, email and company). ${VISIBILITY} A filter can narrow what the caller sees, never widen it.`
  }),
  getProspect: route6({
    method: "GET",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Prospect with every current field and its Source, time and actor. ${VISIBILITY}`
  }),
  updateProspect: route6({
    method: "PATCH",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.duplicate_identity"],
    commonErrors: ["request.invalid"],
    description: `Edits a Prospect; each field sent is written with the Source manual, which beats every other Source (ADR 0020). null clears a field. Changing an identity to one another Prospect has is prospect.duplicate_identity. Owner is changed by setProspectOwner. Publishes prospect.updated once per change. ${VISIBILITY}`
  }),
  setProspectOwner: route6({
    method: "PUT",
    path: "/v1/prospects/{prospectId}/owner",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.forbidden_owner"],
    commonErrors: ["request.invalid"],
    description: "Assigns or reassigns the owner Rep. Owner and Admin only. The new owner must be a Rep or Manager of the same Organization, else prospect.forbidden_owner. Idempotent by end state. Publishes prospect.updated."
  }),
  bulkAssignProspects: route6({
    method: "POST",
    path: "/v1/prospects/assign",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200, 202],
    idempotent: true,
    errors: ["prospect.forbidden_owner"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Assigns up to 5,000 Prospects to one owner. Owner and Admin only. Up to 500 are applied at once (200); more are queued (202) and finish in the background. The owner rules of setProspectOwner apply (prospect.forbidden_owner). Prospects that do not exist are counted as skipped, not named. A retry with the same Idempotency-Key changes nothing twice."
  }),
  eraseProspect: route6({
    method: "DELETE",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Erases a Prospect on request: a queued job deletes its fields, identities and notes, writes a salted-hash suppression entry and publishes prospect.erased, which carries no personal data. Owner and Admin only; a Rep or Manager gets auth.forbidden. Answers 202 at once; the Prospect is then prospect.not_found, and a retry after acceptance that gets prospect.not_found means the erasure was accepted."
  }),
  listProspectFieldHistory: route6({
    method: "GET",
    path: "/v1/prospects/{prospectId}/fields/{field}/history",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists one field's history, newest first, cursor-paginated (at most 100): the current value, earlier values and enrichment values kept as suggestions, each with Source, time and actor. At most 50 entries are kept per field. ${VISIBILITY}`
  }),
  createProspectCompany: route6({
    method: "POST",
    path: "/v1/prospect-companies",
    roles: PROSPECT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Creates a Prospect Company with the Source manual. Every role may. Answers 201, or 200 with the original record for a replay of the same Idempotency-Key."
  }),
  listProspectCompanies: route6({
    method: "GET",
    path: "/v1/prospect-companies",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization’s Prospect Companies, newest first, cursor-paginated (at most 100), with an optional q search on name and domain. Every role sees every Prospect Company; a Company carries no Prospect."
  }),
  getProspectCompany: route6({
    method: "GET",
    path: "/v1/prospect-companies/{companyId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Prospect Company with its fields and their Sources."
  }),
  updateProspectCompany: route6({
    method: "PATCH",
    path: "/v1/prospect-companies/{companyId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Edits a Prospect Company; each field sent is written with the Source manual (ADR 0020). null clears the domain."
  }),
  listProspectCompanyFieldHistory: route6({
    method: "GET",
    path: "/v1/prospect-companies/{companyId}/fields/{field}/history",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists one Prospect Company field’s history, newest first, cursor-paginated (at most 100), with Source, time and actor."
  }),
  listProspectDuplicates: route6({
    method: "GET",
    path: "/v1/prospect-duplicates",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists suspected duplicate pairs: Prospects that share a normalised email, phone or LinkedIn address, found from the indexed identities and bounded per request (at most 100 per page, cursor-paginated). Optionally for one prospectId. Owner and Admin only."
  }),
  mergeProspects: route6({
    method: "POST",
    path: "/v1/prospects/{prospectId}/merges",
    roles: PROSPECT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found", "prospect.merge_conflict"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Merges up to 5 Prospects into the survivor in the path, with a value chosen per field; both histories are kept and links move to the survivor. Owner and Admin only. A Prospect already merged or named twice is prospect.merge_conflict. Publishes prospect.merged. Undo is possible for 30 days."
  }),
  getProspectMerge: route6({
    method: "GET",
    path: "/v1/prospect-merges/{mergeId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one merge record, including until when it can be undone. Owner and Admin only."
  }),
  undoProspectMerge: route6({
    method: "POST",
    path: "/v1/prospect-merges/{mergeId}/undo",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.merge_conflict"],
    commonErrors: ["request.invalid"],
    description: "Reverses a merge, restoring both records exactly as the snapshot holds them. Owner and Admin only. After the 30-day window, or when a record has been merged again, it is prospect.merge_conflict. Undoing an undone merge answers 200 with the record as it is. Publishes prospect.merge_undone. Takes no body."
  }),
  uploadProspectImport: route6({
    method: "POST",
    path: "/v1/prospect-imports",
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: true,
    errors: ["prospect.import_invalid"],
    commonErrors: ["request.too_large", "request.unsupported_media_type", ...IDEMPOTENT_ERRORS2],
    description: 'Uploads the CSV template (PROSPECT_IMPORT_COLUMNS; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and header are checked before anything is stored; a refusal is prospect.import_invalid with details.reason. The rows are processed in a queued, resumable job that matches a row to an existing Prospect on any normalised identity (email, phone or LinkedIn address), writes the Source import and never replaces a manual value. Bad rows are reported, never dropped. Answers 202 with the import; the same Idempotency-Key creates nothing new.'
  }),
  listProspectImports: route6({
    method: "GET",
    path: "/v1/prospect-imports",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization’s imports, newest first, cursor-paginated (at most 100). Owner and Admin only."
  }),
  getProspectImport: route6({
    method: "GET",
    path: "/v1/prospect-imports/{importId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one import: its state, failure reason and counts, so a page opened mid-job shows live status. Owner and Admin only."
  }),
  listProspectImportRows: route6({
    method: "GET",
    path: "/v1/prospect-imports/{importId}/rows",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads the report in CSV order, cursor-paginated (at most 100), optionally only one result. Each row has its number, result, reason and Prospect id; no cell of the file is returned. Owner and Admin only."
  }),
  downloadProspectImportReport: route6({
    method: "GET",
    path: "/v1/prospect-imports/{importId}/report.csv",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Downloads the report as text/csv with the columns PROSPECT_IMPORT_REPORT_COLUMNS, streamed in pages and never held whole. Owner and Admin only. Contains no cell of the uploaded file."
  })
});
// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  ABANDON_MAX_AGE_HOURS,
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MEDIA_TYPES,
  ACCEPTED_RECORDING_EXTENSIONS,
  ACCEPTED_TRANSCRIPT_EXTENSIONS,
  ALL_PLAYBOOK_ERRORS,
  ALL_PLAYBOOK_ROUTES,
  AUTH_ERRORS,
  AUTH_OPTIONS_PATH,
  AUTH_OPTIONS_ROUTE,
  BULK_ASSIGN_SYNC_LIMIT,
  CALL_CHANNELS,
  CALL_DELETED_MESSAGE,
  CALL_FAILURE_FIXES,
  CALL_FAILURE_REASONS,
  CALL_KINDS,
  CALL_MEDIA_TYPES,
  CALL_REP_CHANGED_MESSAGE,
  CALL_STATES,
  CALL_TRANSCRIBED_MESSAGE,
  CALL_UPLOADED_MESSAGE,
  CONSENT_ADMIN_ROLES,
  CONSENT_ALL_ROLES,
  CONSENT_CHANNELS,
  CONSENT_ERRORS,
  CONSENT_EVENTS,
  CONSENT_FORM_STATES,
  CONSENT_GRANT_SOURCES,
  CONSENT_RECORDABLE_SOURCES,
  CONSENT_REQUIRED_CHANNELS,
  CONSENT_ROUTES,
  CONSENT_STATES,
  CONSENT_WITHDRAWAL_SOURCES,
  CONTACT_ALLOW_BASES,
  CONTACT_DENIAL_CODES,
  CONTACT_PURPOSES,
  CORE_ERRORS,
  CREATE_DEMO_REQUEST_ERROR_CODES,
  CREATE_INVITATION_ERROR_CODES,
  CSV_FAILURES,
  CURRENT_RIGHTS_WORDING_VERSION,
  DAILY_LIMIT_DETAILS_SCHEMA,
  DEAL_CLOSED_AT_MAX_YEAR,
  DEAL_CLOSED_AT_MIN_YEAR,
  DEAL_IMPORT_FAILURE_REASONS,
  DEAL_IMPORT_FILE_FIELD,
  DEAL_IMPORT_HEADER_PREFIX_CHARS,
  DEAL_IMPORT_HEADER_PROBLEMS,
  DEAL_IMPORT_OPTIONAL_COLUMN,
  DEAL_IMPORT_REQUIRED_COLUMNS,
  DEAL_IMPORT_ROW_REASONS,
  DEAL_IMPORT_ROW_RESULTS,
  DEAL_IMPORT_STATES,
  DEAL_IMPORT_UPLOADED_MESSAGE,
  DEAL_OUTCOME_CHANGED_MESSAGE,
  DEFAULT_MAX_CALLS,
  DEFAULT_MAX_DEALS,
  DEFAULT_MAX_DOCUMENTS,
  DEFAULT_MAX_DOCUMENT_BYTES_TOTAL,
  DEFAULT_MAX_RECORDING_BYTES_TOTAL,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_LIMIT,
  DELIVERY_FAILURE_REASONS,
  DOCUMENT_DELETED_MESSAGE,
  DOCUMENT_FAILURE_REASONS,
  DOCUMENT_RETENTION_DAYS,
  DOCUMENT_STATES,
  DOCUMENT_UPLOADED_MESSAGE,
  ERRORS,
  EVIDENCE_CSV_COLUMNS,
  FIELD_HISTORY_STATES,
  FIXED_SOURCE_KINDS,
  GOOGLE_ERROR_PARAM,
  GOOGLE_ERROR_PATH,
  GOOGLE_ROUTES,
  GOOGLE_SIGN_UP_ATTEMPT_PARAM,
  GOOGLE_SIGN_UP_PATH,
  IDEMPOTENCY_KEY_HEADER,
  INCOMPLETE_UPLOAD_PARTS_TTL_HOURS,
  INTERNAL_CALL_ERRORS,
  INVITABLE_ROLES,
  INVITATION_STATES,
  LIST_MEMBERS_MIN_ROLE,
  LIST_TEAM_MEMBERS_ERROR_CODES,
  LIST_TEAM_MEMBERS_MIN_ROLE,
  MARKETING_ERRORS,
  MARKETING_ROUTES,
  MAX_AUTHORIZATION_URL_LENGTH,
  MAX_BULK_ASSIGN_PROSPECTS,
  MAX_CALL_SPEAKERS,
  MAX_CONSENT_FORM_NAME_LENGTH,
  MAX_CONSENT_WORDING_LENGTH,
  MAX_CURSOR_LENGTH,
  MAX_DEAL_ID_BYTES,
  MAX_DEAL_ID_LENGTH,
  MAX_DEAL_IMPORT_BYTES,
  MAX_DEAL_IMPORT_CELL_LENGTH,
  MAX_DEAL_IMPORT_HEADER_LENGTH,
  MAX_DEAL_IMPORT_ROWS,
  MAX_DEAL_NAME_BYTES,
  MAX_DEAL_NAME_LENGTH,
  MAX_DELETION_SEQ,
  MAX_DEMO_REQUEST_FIELD_LENGTH,
  MAX_DEMO_REQUEST_MESSAGE_LENGTH,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_FILE_NAME_BYTES,
  MAX_DOCUMENT_FILE_NAME_LENGTH,
  MAX_DOCUMENT_PAGES,
  MAX_EMAIL_LENGTH,
  MAX_EVIDENCE_REF_LENGTH,
  MAX_FIELD_HISTORY_ENTRIES,
  MAX_MERGED_PROSPECTS,
  MAX_MOMENT_SNIPPET_CHARACTERS,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_PERSON_NAME_LENGTH,
  MAX_PROSPECT_COMPANY_NAME_LENGTH,
  MAX_PROSPECT_FIELD_VALUE_LENGTH,
  MAX_PROSPECT_IMPORT_BYTES,
  MAX_PROSPECT_IMPORT_ROWS,
  MAX_PROSPECT_JOB_TITLE_LENGTH,
  MAX_PROSPECT_NAME_PART_LENGTH,
  MAX_PROSPECT_NOTES_LENGTH,
  MAX_PROSPECT_SEARCH_LENGTH,
  MAX_PROSPECT_TAGS,
  MAX_PROSPECT_TAG_LENGTH,
  MAX_QUEUED_DEAL_IMPORTS,
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
  MAX_REP_FIELD_LENGTH,
  MAX_REP_FOLLOWING_CHARACTERS,
  MAX_REP_FOLLOWING_TURNS,
  MAX_RETURN_TO_LENGTH,
  MAX_RIGHTS_HEADING_LENGTH,
  MAX_RIGHTS_PARAGRAPHS,
  MAX_RIGHTS_TEXT_LENGTH,
  MAX_RIGHTS_WORDING_VERSION,
  MAX_SEARCH_CANDIDATES,
  MAX_SEARCH_LIMIT,
  MAX_SEARCH_TEXT_CHARACTERS,
  MAX_SEARCH_TURNS,
  MAX_SEQ,
  MAX_SOURCE_REF_LENGTH,
  MAX_SPEAKER_EXCERPT_LENGTH,
  MAX_SPEAKER_LABEL_BYTES,
  MAX_SPEAKER_LABEL_LENGTH,
  MAX_SUPPRESSION_IMPORT_BYTES,
  MAX_SUPPRESSION_IMPORT_ROWS,
  MAX_SUPPRESSION_NOTE_LENGTH,
  MAX_TRANSCRIPT_BYTES,
  MAX_UTF8_BYTES_PER_CODE_POINT,
  MEDIA_TYPE_BY_CALL_EXTENSION,
  MEDIA_TYPE_BY_EXTENSION,
  OIDC_COOKIE_BASE_NAME,
  OIDC_COOKIE_SECURE_PREFIX,
  ONE_ADDRESS_MESSAGE,
  ORGANIZATION_STATUSES,
  OUTCOMES,
  PACKAGE,
  PLAYBOOK_ERRORS,
  PLAYBOOK_READ_ROLES,
  PLAYBOOK_ROUTES,
  PLAYBOOK_WRITE_ROLES,
  PROSPECT_ADMIN_ROLES,
  PROSPECT_ALL_ROLES,
  PROSPECT_COMPANY_FIELD_NAMES,
  PROSPECT_ERRORS,
  PROSPECT_EVENTS,
  PROSPECT_FIELD_NAMES,
  PROSPECT_IDENTITY_KINDS,
  PROSPECT_IMPORT_COLUMNS,
  PROSPECT_IMPORT_FAILURE_REASONS,
  PROSPECT_IMPORT_FILE_FIELD,
  PROSPECT_IMPORT_INVALID_REASONS,
  PROSPECT_IMPORT_REJECT_REASONS,
  PROSPECT_IMPORT_REPORT_COLUMNS,
  PROSPECT_IMPORT_ROW_RESULTS,
  PROSPECT_IMPORT_SKIP_REASONS,
  PROSPECT_IMPORT_STATES,
  PROSPECT_MERGE_STATES,
  PROSPECT_MERGE_UNDO_DAYS,
  PROSPECT_ROUTES,
  PROSPECT_STATUSES,
  REGIONS,
  RIGHTS_WORDINGS,
  ROLES,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_READ_ROLES,
  SALES_HISTORY_ROUTES,
  SEARCH_ROUTES,
  SIGNUP_ERRORS,
  SUPPRESSION_ADDRESS_KINDS,
  SUPPRESSION_IMPORT_COLUMNS,
  SUPPRESSION_IMPORT_FAILURE_REASONS,
  SUPPRESSION_IMPORT_FILE_FIELD,
  SUPPRESSION_IMPORT_ROW_RESULTS,
  SUPPRESSION_IMPORT_STATES,
  SUPPRESSION_REASONS,
  SUPPRESSION_REMOVABLE_REASONS,
  UPLOAD_CONTENT_TYPE,
  UPLOAD_FILE_FIELD,
  addSuppressionRequestSchema,
  addTeamMemberRequestSchema,
  addressFieldsShape,
  attemptIdSchema,
  authOptionsResponseSchema,
  authProvidersSchema,
  authorizationUrlSchema,
  boundedTextSchema,
  browserSessionTokensSchema,
  bulkAssignProspectsRequestSchema,
  bulkAssignProspectsResponseSchema,
  calendarDateSchema,
  callChannelSchema,
  callCursorSchema,
  callDeletedPayloadSchema,
  callFailureReasonSchema,
  callIdSchema,
  callKindSchema,
  callListItemSchema,
  callMediaTypeSchema,
  callParamsSchema,
  callRepChangedPayloadSchema,
  callReuploadRequeues,
  callSchema,
  callStateSchema,
  callTranscribedPayloadSchema,
  callUploadedPayloadSchema,
  changeMemberRoleRequestSchema,
  channelConsentSchema,
  checkCallFile,
  checkDealImportHeader,
  checkDealImportHeaderText,
  checkDealImportRow,
  checkUploadFile,
  confirmRightsRequestSchema,
  consentChannelSchema,
  consentEventIdSchema,
  consentEventPageSchema,
  consentEventSchema,
  consentFormIdSchema,
  consentFormPageSchema,
  consentFormParamsSchema,
  consentFormSchema,
  consentFormStateSchema,
  consentGrantSourceSchema,
  consentGrantedEvent,
  consentProspectParamsSchema,
  consentSourceSchema,
  consentStateSchema,
  consentTokenParamsSchema,
  consentTokenSchema,
  consentWithdrawalSourceSchema,
  consentWithdrawnEvent,
  consentWordingIdSchema,
  consentWordingPageSchema,
  consentWordingParamsSchema,
  consentWordingSchema,
  consentWordingTextSchema,
  contactCheckIdSchema,
  contactCheckLogEntrySchema,
  contactCheckLogPageSchema,
  contactCheckRequestSchema,
  contactCheckResultSchema,
  contactDenialCodeSchema,
  contactPurposeSchema,
  createConsentFormRequestSchema,
  createConsentWordingRequestSchema,
  createDemoRequestRequestSchema,
  createDemoRequestResponseSchema,
  createInvitationRequestSchema,
  createProspectCompanyRequestSchema,
  createProspectRequestSchema,
  createTeamRequestSchema,
  dealAmountSchema,
  dealCurrencySchema,
  dealCursorSchema,
  dealIdSchema,
  dealImportCursorSchema,
  dealImportFailureReasonSchema,
  dealImportIdSchema,
  dealImportParamsSchema,
  dealImportRowCursorSchema,
  dealImportRowReasonSchema,
  dealImportRowResultSchema,
  dealImportRowSchema,
  dealImportSchema,
  dealImportStateSchema,
  dealImportUploadedPayloadSchema,
  dealNameSchema,
  dealOutcomeChangedPayloadSchema,
  dealParamsSchema,
  dealRecordIdSchema,
  dealSchema,
  decodeCursor,
  defineErrors,
  defineEvent,
  demoRequestIdSchema,
  demoRequestMessageSchema,
  demoRequestSourcePageSchema,
  documentDeletedPayloadSchema,
  documentExtension,
  documentFailureReasonSchema,
  documentFileNameSchema,
  documentIdSchema,
  documentMatchSchema,
  documentMediaTypeSchema,
  documentParamsSchema,
  documentQueryText,
  documentSchema,
  documentSearchEvidenceSchema,
  documentSizeCheckSchema,
  documentStateSchema,
  documentTypeCheckSchema,
  documentUploadedPayloadSchema,
  duplicateIdentityDetailsSchema,
  e164PhoneSchema,
  emailSchema,
  encodeCursor,
  eraseProspectResponseSchema,
  errorBodySchema,
  errorCodeSchema,
  eventEnvelopeSchema,
  eventIdSchema,
  eventTypeSchema,
  evidenceEventSchema,
  evidencePageSchema,
  evidenceRefSchema,
  excerptText,
  fieldHistoryCursorSchema,
  fieldHistoryEntrySchema,
  fieldHistoryStateSchema,
  fieldValueSchema,
  firstCsvRecord,
  foldAscii,
  formatId,
  googleCompleteRequestSchema,
  googleCompleteResponseSchema,
  googleErrorQuerySchema,
  googleIntentSchema,
  googleSignUpQuerySchema,
  googleStartRequestSchema,
  googleStartResponseSchema,
  hasControlCharacter2 as hasControlCharacter,
  hasExactlyOneAddress,
  hasStrippableCharacter,
  hostedConsentFormViewSchema,
  hostedConsentReceiptSchema,
  hostedConsentSubmissionSchema,
  idSchema,
  idempotencyKeySchema,
  internalAbandonOrganizationParamsSchema,
  internalAbandonOrganizationRequestSchema,
  internalAbandonOrganizationResponseSchema,
  internalAcceptInvitationRequestSchema,
  internalAcceptInvitationResponseSchema,
  internalCreateOrganizationRequestSchema,
  internalCreateOrganizationResponseSchema,
  internalMembershipRequestSchema,
  internalMembershipResponseSchema,
  internalRemoveOrganizationDocumentsParamsSchema,
  internalRemoveOrganizationDocumentsRequestSchema,
  internalRemoveOrganizationDocumentsResponseSchema,
  internalUpdateMemberProfileParamsSchema,
  internalUpdateMemberProfileRequestSchema,
  internalUpdateMemberProfileResponseSchema,
  invitableRoleSchema,
  invitationIdSchema,
  invitationParamsSchema,
  invitationSchema,
  invitationStateSchema,
  invitationTokenSchema,
  isBlankCsvRecord,
  isWellFormedText,
  listCallsQuerySchema,
  listCallsResponseSchema,
  listConsentEventsQuerySchema,
  listConsentFormsQuerySchema,
  listConsentWordingsQuerySchema,
  listContactChecksQuerySchema,
  listDealImportRowsQuerySchema,
  listDealImportRowsResponseSchema,
  listDealImportsQuerySchema,
  listDealImportsResponseSchema,
  listDealsQuerySchema,
  listDealsResponseSchema,
  listDocumentsQuerySchema,
  listDocumentsResponseSchema,
  listEvidenceQuerySchema,
  listFieldHistoryQuerySchema,
  listFieldHistoryResponseSchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  listProspectCompaniesQuerySchema,
  listProspectCompaniesResponseSchema,
  listProspectDuplicatesQuerySchema,
  listProspectDuplicatesResponseSchema,
  listProspectImportRowsQuerySchema,
  listProspectImportRowsResponseSchema,
  listProspectImportsQuerySchema,
  listProspectImportsResponseSchema,
  listProspectsQuerySchema,
  listProspectsResponseSchema,
  listSuppressionEntriesQuerySchema,
  listSuppressionImportRowsQuerySchema,
  listSuppressionImportsQuerySchema,
  listTeamMembersQuerySchema,
  listTeamMembersResponseSchema,
  listTeamsQuerySchema,
  listTeamsResponseSchema,
  lookupDealRequestSchema,
  lookupSuppressionRequestSchema,
  maskedAddressSchema,
  memberParamsSchema,
  memberSchema,
  membershipIdSchema,
  mergeProspectsRequestSchema,
  momentMatchSchema,
  momentQueryText,
  momentSnippet,
  momentSnippetSchema,
  normaliseDealId,
  normaliseFileName,
  normaliseMediaType,
  normaliseSpeakerLabel,
  oneClickUnsubscribeRequestSchema,
  organizationIdSchema,
  organizationNameSchema,
  organizationSchema,
  organizationStatusSchema,
  outcomeSchema,
  pageQuerySchema,
  pageSchema,
  parseAmountCell,
  parseClosedAtCell,
  parseCsv,
  parseCurrencyCell,
  parseOutcomeCell,
  parseRepField,
  personNameSchema,
  prospectCompanyCursorSchema,
  prospectCompanyDomainSchema,
  prospectCompanyFieldNameSchema,
  prospectCompanyFieldParamsSchema,
  prospectCompanyIdSchema,
  prospectCompanyNameSchema,
  prospectCompanyParamsSchema,
  prospectCompanySchema,
  prospectConsentSchema,
  prospectCreatedEvent,
  prospectCursorSchema,
  prospectDuplicateCursorSchema,
  prospectDuplicateSchema,
  prospectErasedEvent,
  prospectFieldNameSchema,
  prospectFieldParamsSchema,
  prospectIdSchema,
  prospectIdentityKindSchema,
  prospectImportCursorSchema,
  prospectImportFailureReasonSchema,
  prospectImportIdSchema,
  prospectImportInvalidDetailsSchema,
  prospectImportParamsSchema,
  prospectImportRowCursorSchema,
  prospectImportRowReasonSchema,
  prospectImportRowResultSchema,
  prospectImportRowSchema,
  prospectImportSchema,
  prospectImportStateSchema,
  prospectJobTitleSchema,
  prospectMergeIdSchema,
  prospectMergeParamsSchema,
  prospectMergeSchema,
  prospectMergeUndoneEvent,
  prospectMergedEvent,
  prospectNamePartSchema,
  prospectNotFoundDetailsSchema,
  prospectNotesSchema,
  prospectParamsSchema,
  prospectSchema,
  prospectSearchSchema,
  prospectStatusSchema,
  prospectTagsSchema,
  prospectUpdatedEvent,
  rawLinkedinUrlSchema,
  rawPhoneSchema,
  recordConsentRequestSchema,
  recordDeliveryFailureRequestSchema,
  recordWithdrawalRequestSchema,
  recordedConsentSchema,
  recordedSuppressionSchema,
  regionSchema,
  removeSuppressionRequestSchema,
  renameOrganizationRequestSchema,
  renameTeamRequestSchema,
  repChangeAllowed,
  repChoiceSchema,
  repChoiceSuits,
  requestIdSchema,
  retryAfterDetailsSchema,
  returnToSchema,
  rightsConfirmationSchema,
  rightsRequiredDetailsSchema,
  rightsStatusSchema,
  rightsWordingFor,
  rightsWordingSchema,
  rightsWordingVersionSchema,
  roleAtLeast,
  roleSchema,
  searchDocumentsRequestSchema,
  searchDocumentsResponseSchema,
  searchEvidenceSchema,
  searchMomentsRequestSchema,
  searchMomentsResponseSchema,
  searchTurnSchema,
  setCallRepRequestSchema,
  setDealOutcomeRequestSchema,
  setProspectOwnerRequestSchema,
  sourceKindSchema,
  speakerExcerpt,
  speakerExcerptSchema,
  speakerLabelSchema,
  storedNameSchema,
  suppressionAddedEvent,
  suppressionAddressKindSchema,
  suppressionEntryIdSchema,
  suppressionEntryPageSchema,
  suppressionEntryParamsSchema,
  suppressionEntrySchema,
  suppressionImportIdSchema,
  suppressionImportPageSchema,
  suppressionImportParamsSchema,
  suppressionImportRowPageSchema,
  suppressionImportRowSchema,
  suppressionImportSchema,
  suppressionImportStateSchema,
  suppressionListStateSchema,
  suppressionReasonSchema,
  suppressionRemovedEvent,
  teamIdSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamNameSchema,
  teamParamsSchema,
  teamSchema,
  timestampSchema,
  unsubscribePreviewSchema,
  unsubscribeReceiptSchema,
  updateConsentWordingRequestSchema,
  updateProspectCompanyRequestSchema,
  updateProspectRequestSchema,
  uploadCallFieldsSchema,
  uploadCallFileSchema,
  uploadDocumentFileSchema,
  userIdSchema,
  withdrawConsentRequestSchema
};
