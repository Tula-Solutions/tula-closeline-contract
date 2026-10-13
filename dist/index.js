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
  freezeEntry("auth.unauthenticated", 401, "Authentication is required."),
  freezeEntry("auth.forbidden", 403, "You are not allowed to do this."),
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
// src/events.ts
import { z as z4 } from "zod";

// src/ids.ts
import { z as z2 } from "zod";
var PREFIX_PATTERN = /^[a-z]{2,5}$/;
var HEX_PATTERN = /^[0-9a-f]{32}$/;
function idSchema(prefix) {
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(`Invalid id prefix: ${prefix}`);
  }
  return z2.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`)).brand();
}
var organizationIdSchema = idSchema("org");
var userIdSchema = idSchema("usr");
var membershipIdSchema = idSchema("mem");
var teamIdSchema = idSchema("team");
var prospectIdSchema = idSchema("prs");
var eventIdSchema = idSchema("evt");
var requestIdSchema = idSchema("req");
function formatId(prefix, uuid) {
  const hex = uuid.replaceAll("-", "").toLowerCase();
  if (!HEX_PATTERN.test(hex)) {
    throw new Error("Not a UUID: expected 32 hexadecimal characters");
  }
  return idSchema(prefix).parse(`${prefix}_${hex}`);
}

// src/tenancy.ts
import { z as z3 } from "zod";
var REGIONS = ["us", "eu"];
var regionSchema = z3.enum(REGIONS);
var ROLES = ["owner", "admin", "manager", "rep"];
var roleSchema = z3.enum(ROLES);
function roleAtLeast(role, minimum) {
  const have = ROLES.indexOf(role);
  const need = ROLES.indexOf(minimum);
  return have !== -1 && need !== -1 && have <= need;
}

// src/events.ts
var eventTypeSchema = errorCodeSchema;
var versionSchema = z4.number().int().positive();
var occurredAtSchema = z4.iso.datetime({ offset: true }).max(64);
var envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: occurredAtSchema,
  organizationId: organizationIdSchema,
  region: regionSchema
};
function eventEnvelopeSchema(dataSchema) {
  return z4.object({ ...envelopeShape, data: dataSchema });
}
function defineEvent(type, version, dataSchema) {
  const schema = z4.object({
    ...envelopeShape,
    type: z4.literal(eventTypeSchema.parse(type)),
    version: z4.literal(versionSchema.parse(version)),
    data: dataSchema
  });
  return {
    type,
    version,
    schema,
    parse: (input) => schema.parse(input)
  };
}
// src/pagination.ts
import { z as z5 } from "zod";
var MAX_PAGE_SIZE = 100;
var DEFAULT_PAGE_SIZE = 25;
var MAX_CURSOR_LENGTH = 512;
var cursorTextSchema = z5.string().min(1).max(MAX_CURSOR_LENGTH);
var pageQuerySchema = z5.object({
  cursor: cursorTextSchema.optional(),
  limit: z5.union([z5.number(), z5.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z5.number().int().min(1).max(MAX_PAGE_SIZE)).default(DEFAULT_PAGE_SIZE)
});
function pageSchema(itemSchema) {
  return z5.object({
    items: z5.array(itemSchema).max(MAX_PAGE_SIZE),
    nextCursor: cursorTextSchema.nullable()
  });
}
function encodeCursor(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function decodeCursor(text, schema) {
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length > MAX_CURSOR_LENGTH) {
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

// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  DEFAULT_PAGE_SIZE,
  ERRORS,
  MAX_PAGE_SIZE,
  PACKAGE,
  REGIONS,
  ROLES,
  decodeCursor,
  defineErrors,
  defineEvent,
  encodeCursor,
  errorBodySchema,
  errorCodeSchema,
  eventEnvelopeSchema,
  eventIdSchema,
  eventTypeSchema,
  formatId,
  idSchema,
  membershipIdSchema,
  organizationIdSchema,
  pageQuerySchema,
  pageSchema,
  prospectIdSchema,
  regionSchema,
  requestIdSchema,
  roleAtLeast,
  roleSchema,
  teamIdSchema,
  userIdSchema
};
