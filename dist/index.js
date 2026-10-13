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

// src/core/errors.ts
var CORE_ERRORS = {
  ...defineErrors("organization", {
    not_found: { status: 404, message: "The Organization was not found." },
    suspended: { status: 403, message: "This Organization is suspended." },
    deleted: { status: 410, message: "This Organization has been deleted." }
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
    }
  }),
  ...defineErrors("team", {
    not_found: { status: 404, message: "The Team was not found." },
    name_taken: { status: 409, message: "A Team with that name already exists." }
  })
};
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
// src/core/internal.ts
import { z as z6 } from "zod";

// src/email.ts
import { z as z2 } from "zod";
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
var emailSchema = z2.string().max(MAX_EMAIL_LENGTH).transform(foldAscii).pipe(z2.string().min(3).refine(hasOneInteriorAt, "Exactly one @, neither first nor last").refine(isPrintableAscii, "Printable ASCII only"));

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
var eventIdSchema = idSchema("evt");
var requestIdSchema = idSchema("req");
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

// src/core/values.ts
import { z as z5 } from "zod";
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
var nameSchema = z5.string().trim().pipe(z5.string().min(1).max(MAX_NAME_LENGTH).refine(isWellFormed, "Well-formed text only").refine((text) => !hasControlCharacter(text), "No control characters"));
var organizationNameSchema = nameSchema;
var teamNameSchema = nameSchema;
var storedNameSchema = z5.string().min(1).max(MAX_NAME_LENGTH);
var INVITATION_STATES = ["pending", "accepted", "revoked"];
var invitationStateSchema = z5.enum(INVITATION_STATES);
var timestampSchema = z5.iso.datetime({ offset: true }).max(64);
var invitationTokenSchema = z5.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
var idempotencyKeySchema = z5.string().min(16).max(128).regex(/^[A-Za-z0-9_.:-]+$/);

// src/core/internal.ts
var INTERNAL_CALL_ERRORS = Object.freeze({
  createOrganization: Object.freeze(["membership.already_member"]),
  acceptInvitation: Object.freeze(["invitation.invalid", "membership.already_member"]),
  membership: Object.freeze([])
});
var internalCreateOrganizationRequestSchema = z6.strictObject({
  userId: userIdSchema,
  organizationName: organizationNameSchema
});
var internalCreateOrganizationResponseSchema = z6.object({
  organizationId: organizationIdSchema,
  role: z6.literal("owner")
});
var internalAcceptInvitationRequestSchema = z6.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  invitationToken: invitationTokenSchema
});
var internalAcceptInvitationResponseSchema = z6.object({
  organizationId: organizationIdSchema,
  role: invitableRoleSchema
});
var internalMembershipRequestSchema = z6.strictObject({
  userId: userIdSchema
});
var internalMembershipResponseSchema = z6.discriminatedUnion("found", [
  z6.object({
    found: z6.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema
  }),
  z6.object({ found: z6.literal(false) })
]);
// src/core/invitation.ts
import { z as z8 } from "zod";

// src/pagination.ts
import { z as z7 } from "zod";
var MAX_PAGE_SIZE = 100;
var DEFAULT_PAGE_SIZE = 25;
var MAX_CURSOR_LENGTH = 512;
var cursorTextSchema = z7.string().min(1).max(MAX_CURSOR_LENGTH);
var pageQuerySchema = z7.object({
  cursor: cursorTextSchema.optional(),
  limit: z7.union([z7.number(), z7.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z7.number().int().min(1).max(MAX_PAGE_SIZE)).default(DEFAULT_PAGE_SIZE)
});
function pageSchema(itemSchema) {
  return z7.object({
    items: z7.array(itemSchema).max(MAX_PAGE_SIZE),
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

// src/core/invitation.ts
var invitationSchema = z8.object({
  id: invitationIdSchema,
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.nullable(),
  state: invitationStateSchema,
  invitedByUserId: userIdSchema,
  expiresAt: timestampSchema,
  createdAt: timestampSchema
});
var createInvitationRequestSchema = z8.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional()
});
var listInvitationsQuerySchema = pageQuerySchema.extend({ state: invitationStateSchema.default("pending") }).strict();
var listInvitationsResponseSchema = pageSchema(invitationSchema);
var invitationParamsSchema = z8.strictObject({
  invitationId: invitationIdSchema
});
// src/core/member.ts
import { z as z9 } from "zod";
var memberSchema = z9.object({
  id: membershipIdSchema,
  userId: userIdSchema,
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var listMembersQuerySchema = pageQuerySchema;
var listMembersResponseSchema = pageSchema(memberSchema);
var memberParamsSchema = z9.strictObject({
  membershipId: membershipIdSchema
});
var changeMemberRoleRequestSchema = z9.strictObject({
  role: roleSchema
});
// src/core/organization.ts
import { z as z10 } from "zod";
var organizationSchema = z10.object({
  id: organizationIdSchema,
  name: storedNameSchema,
  region: regionSchema,
  status: organizationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var renameOrganizationRequestSchema = z10.strictObject({
  name: organizationNameSchema
});
// src/core/team.ts
import { z as z11 } from "zod";
var teamSchema = z11.object({
  id: teamIdSchema,
  name: storedNameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var createTeamRequestSchema = z11.strictObject({
  name: teamNameSchema
});
var renameTeamRequestSchema = z11.strictObject({
  name: teamNameSchema
});
var listTeamsQuerySchema = pageQuerySchema;
var listTeamsResponseSchema = pageSchema(teamSchema);
var teamParamsSchema = z11.strictObject({
  teamId: teamIdSchema
});
var addTeamMemberRequestSchema = z11.strictObject({
  membershipId: membershipIdSchema
});
var teamMemberSchema = z11.object({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
  createdAt: timestampSchema
});
var teamMemberParamsSchema = z11.strictObject({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema
});
// src/events.ts
import { z as z12 } from "zod";
var eventTypeSchema = errorCodeSchema;
var versionSchema = z12.number().int().positive();
var occurredAtSchema = z12.iso.datetime({ offset: true }).max(64);
var envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: occurredAtSchema,
  organizationId: organizationIdSchema,
  region: regionSchema
};
function eventEnvelopeSchema(dataSchema) {
  return z12.object({ ...envelopeShape, data: dataSchema });
}
function defineEvent(type, version, dataSchema) {
  const schema = z12.object({
    ...envelopeShape,
    type: z12.literal(eventTypeSchema.parse(type)),
    version: z12.literal(versionSchema.parse(version)),
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

// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  CORE_ERRORS,
  DEFAULT_PAGE_SIZE,
  ERRORS,
  IDEMPOTENCY_KEY_HEADER,
  INTERNAL_CALL_ERRORS,
  INVITABLE_ROLES,
  INVITATION_STATES,
  MAX_CURSOR_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  ORGANIZATION_STATUSES,
  PACKAGE,
  REGIONS,
  ROLES,
  SIGNUP_ERRORS,
  addTeamMemberRequestSchema,
  changeMemberRoleRequestSchema,
  createInvitationRequestSchema,
  createTeamRequestSchema,
  decodeCursor,
  defineErrors,
  defineEvent,
  emailSchema,
  encodeCursor,
  errorBodySchema,
  errorCodeSchema,
  eventEnvelopeSchema,
  eventIdSchema,
  eventTypeSchema,
  foldAscii,
  formatId,
  idSchema,
  idempotencyKeySchema,
  internalAcceptInvitationRequestSchema,
  internalAcceptInvitationResponseSchema,
  internalCreateOrganizationRequestSchema,
  internalCreateOrganizationResponseSchema,
  internalMembershipRequestSchema,
  internalMembershipResponseSchema,
  invitableRoleSchema,
  invitationIdSchema,
  invitationParamsSchema,
  invitationSchema,
  invitationStateSchema,
  invitationTokenSchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  listTeamsQuerySchema,
  listTeamsResponseSchema,
  memberParamsSchema,
  memberSchema,
  membershipIdSchema,
  organizationIdSchema,
  organizationNameSchema,
  organizationSchema,
  organizationStatusSchema,
  pageQuerySchema,
  pageSchema,
  prospectIdSchema,
  regionSchema,
  renameOrganizationRequestSchema,
  renameTeamRequestSchema,
  requestIdSchema,
  roleAtLeast,
  roleSchema,
  storedNameSchema,
  teamIdSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamNameSchema,
  teamParamsSchema,
  teamSchema,
  timestampSchema,
  userIdSchema
};
