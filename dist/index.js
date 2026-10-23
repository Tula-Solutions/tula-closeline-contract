// src/agent/control.ts
import { z as z10 } from "zod";

// src/booking/calendar.ts
import { z as z6 } from "zod";

// src/core/values.ts
import { z } from "zod";
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
  return z.string().max(MAX_RAW_NAME_LENGTH).trim().pipe(z.string().min(1).max(maxLength).refine(isWellFormed, "Well-formed text only").refine((text) => !hasControlCharacter(text), "No control characters"));
}
var nameSchema = boundedName(MAX_NAME_LENGTH);
var organizationNameSchema = nameSchema;
var teamNameSchema = nameSchema;
var MAX_PERSON_NAME_LENGTH = 201;
var personNameSchema = boundedName(MAX_PERSON_NAME_LENGTH);
var storedNameSchema = z.string().min(1).max(1000);
var INVITATION_STATES = ["pending", "accepted", "revoked"];
var invitationStateSchema = z.enum(INVITATION_STATES);
var timestampSchema = z.iso.datetime({ offset: true }).max(64);
var invitationTokenSchema = z.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var retryAfterDetailsSchema = z.strictObject({
  retryAfter: z.number().int().positive()
});
var IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
var idempotencyKeySchema = z.string().min(16).max(128).regex(/^[A-Za-z0-9_.:-]+$/);

// src/ids.ts
import { z as z2 } from "zod";
var PREFIX_PATTERN = /^[a-z]{2,5}$/;
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
var copilotCardIdSchema = idSchema("ccard");
var lineIdSchema = idSchema("line");
var dealImportIdSchema = idSchema("dimp");
var eventIdSchema = idSchema("evt");
var requestIdSchema = idSchema("req");
var demoRequestIdSchema = idSchema("dreq");
var bookingIdSchema = idSchema("bkg");
var bookingTypeIdSchema = idSchema("bkt");
var routingRuleIdSchema = idSchema("rrl");
var routingDecisionIdSchema = idSchema("rdc");
var inquiryIdSchema = idSchema("inq");
var qualificationQuestionIdSchema = idSchema("qst");
var chatIdSchema = idSchema("cht");
var handoffIdSchema = idSchema("hof");
var trySessionIdSchema = idSchema("try");
var conversationIdSchema = idSchema("cnv");
var messageIdSchema = idSchema("msg");
var draftIdSchema = idSchema("drf");
var decisionIdSchema = idSchema("dcs");
var mailboxIdSchema = idSchema("mbx");
var sendIdSchema = idSchema("snd");
var mailEventIdSchema = idSchema("mev");
var campaignIdSchema = idSchema("cpg");
var enrollmentIdSchema = idSchema("enr");
var playIdSchema = idSchema("ply");
var enrollmentEventIdSchema = idSchema("eev");
var briefIdSchema = idSchema("brf");
var brandVoiceIdSchema = idSchema("bvo");
var signalIdSchema = idSchema("sig");
var enrichmentRunIdSchema = idSchema("erun");
var enrichmentRunSetIdSchema = idSchema("erset");
var fitCriterionIdSchema = idSchema("fcr");
var agentInstructionVersionIdSchema = idSchema("ains");
var auditEventIdSchema = idSchema("aud");
var exportJobIdSchema = idSchema("exp");
var assessmentIdSchema = idSchema("asm");
var findingIdSchema = idSchema("fnd");
var suggestionIdSchema = idSchema("sgs");
var touchIdSchema = idSchema("tch");
var apiKeyIdSchema = idSchema("akey");
var linkedinAccountIdSchema = idSchema("lia");
var linkedinRiskAcceptanceIdSchema = idSchema("lra");
var UUID_PATTERN = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
function formatId(prefix, uuid) {
  if (typeof uuid !== "string" || !UUID_PATTERN.test(uuid)) {
    throw new Error("Not a UUID: expected 32 hexadecimal characters or the 8-4-4-4-12 form");
  }
  const hex = uuid.replaceAll("-", "").toLowerCase();
  return idSchema(prefix).parse(`${prefix}_${hex}`);
}

// src/booking/values.ts
import { z as z5 } from "zod";

// src/prospect/values.ts
import { z as z4 } from "zod";

// src/email.ts
import { z as z3 } from "zod";
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
var emailSchema = z3.string().max(MAX_EMAIL_LENGTH).transform(foldAscii).pipe(z3.string().min(3).refine(hasOneInteriorAt, "Exactly one @, neither first nor last").refine(isPrintableAscii, "Printable ASCII only"));

// src/prospect/values.ts
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
  return z4.string().max(Math.max(MAX_RAW_LENGTH, maxLength)).trim().pipe(z4.string().min(1).max(maxLength).refine((text) => !hasControlCharacter2(text, false), "No control characters"));
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
var prospectNotesSchema = z4.string().max(MAX_PROSPECT_NOTES_LENGTH * 2).trim().pipe(z4.string().min(1).max(MAX_PROSPECT_NOTES_LENGTH).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
var prospectTagsSchema = z4.array(boundedTextSchema(MAX_PROSPECT_TAG_LENGTH)).max(MAX_PROSPECT_TAGS).refine((tags) => new Set(tags).size === tags.length, "No duplicate tags");
var rawPhoneSchema = z4.string().max(MAX_RAW_LENGTH).trim().pipe(z4.string().min(3).max(40).regex(/^\+?[0-9 ().-]+$/));
var e164PhoneSchema = z4.string().regex(/^\+[1-9][0-9]{6,14}$/);
var rawLinkedinUrlSchema = z4.string().max(MAX_RAW_LENGTH).trim().pipe(z4.string().min(1).max(300).refine((text) => /linkedin\.com\//i.test(text), "A linkedin.com address").refine((text) => !hasControlCharacter2(text, false), "No control characters"));
var prospectCompanyDomainSchema = z4.string().max(MAX_RAW_LENGTH).trim().transform(foldAscii).pipe(z4.string().min(3).max(253).regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/));
var PROSPECT_IDENTITY_KINDS = ["email", "phone", "linkedin"];
var prospectIdentityKindSchema = z4.enum(PROSPECT_IDENTITY_KINDS);
var PROSPECT_FIELD_NAMES = [
  "firstName",
  "lastName",
  "jobTitle",
  "email",
  "phone",
  "linkedinUrl"
];
var prospectFieldNameSchema = z4.enum(PROSPECT_FIELD_NAMES);
var PROSPECT_COMPANY_FIELD_NAMES = ["name", "domain"];
var prospectCompanyFieldNameSchema = z4.enum(PROSPECT_COMPANY_FIELD_NAMES);
var MAX_FIELD_HISTORY_ENTRIES = 50;
var FIXED_SOURCE_KINDS = [
  "manual",
  "import",
  "crm:hubspot",
  "crm:salesforce",
  "form"
];
var sourceKindSchema = z4.union([
  z4.enum(FIXED_SOURCE_KINDS),
  z4.string().regex(/^enrichment:[a-z][a-z0-9_]{0,31}$/)
]);
var fieldValueSchema = z4.object({
  value: z4.string().min(1).max(MAX_PROSPECT_FIELD_VALUE_LENGTH),
  source: sourceKindSchema,
  sourceRef: z4.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  setAt: timestampSchema,
  setByUserId: userIdSchema.nullable()
});
var FIELD_HISTORY_STATES = ["current", "superseded", "suggested"];
var fieldHistoryStateSchema = z4.enum(FIELD_HISTORY_STATES);
var fieldHistoryEntrySchema = fieldValueSchema.extend({ state: fieldHistoryStateSchema });

// src/booking/values.ts
var CALENDAR_PROVIDERS = ["google"];
var calendarProviderSchema = z5.enum(CALENDAR_PROVIDERS);
var CALENDAR_CONNECTION_STATES = ["healthy", "needs_reconnect"];
var calendarConnectionStateSchema = z5.enum(CALENDAR_CONNECTION_STATES);
var BOOKING_MODES = ["phone", "video"];
var bookingModeSchema = z5.enum(BOOKING_MODES);
var BOOKING_STATES = ["pending", "confirmed", "cancelled"];
var bookingStateSchema = z5.enum(BOOKING_STATES);
var BOOKING_ORIGINS = ["member", "agent", "public"];
var bookingOriginSchema = z5.enum(BOOKING_ORIGINS);
var BOOKING_TYPE_STATES = ["active", "retired"];
var bookingTypeStateSchema = z5.enum(BOOKING_TYPE_STATES);
var MAX_SLOT_RANGE_DAYS = 14;
var MAX_ELIGIBLE_REPS = 20;
var MAX_BOOKING_NAME_LENGTH = 100;
var bookingNameSchema = boundedTextSchema(MAX_BOOKING_NAME_LENGTH);
var timeZoneSchema = z5.string().max(64).regex(/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+){0,2}$/);
var joinUrlSchema = z5.string().max(2048).regex(/^https:\/\/[^\s]+$/);
var bookingLinkTokenSchema = z5.string().regex(/^[A-Za-z0-9_-]{32,64}$/);

// src/booking/calendar.ts
var startCalendarConnectionRequestSchema = z6.strictObject({
  provider: calendarProviderSchema
});
var startCalendarConnectionResponseSchema = z6.strictObject({
  authorizationUrl: z6.url().max(2048),
  state: z6.string().min(1).max(512)
});
var completeCalendarConnectionRequestSchema = z6.strictObject({
  state: z6.string().min(1).max(512),
  code: z6.string().min(1).max(2048)
});
var calendarConnectionSchema = z6.strictObject({
  membershipId: membershipIdSchema,
  provider: calendarProviderSchema,
  state: calendarConnectionStateSchema,
  connectedAt: timestampSchema,
  lastCheckedAt: timestampSchema.nullable()
});
var WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var weekdaySchema = z6.enum(WEEKDAYS);
var MAX_WINDOWS_PER_DAY = 4;
var timeOfDaySchema = z6.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/);
var workingWindowSchema = z6.strictObject({ start: timeOfDaySchema, end: timeOfDaySchema }).refine((window) => window.start < window.end, { message: "A window ends after it starts" });
var workingDaySchema = z6.strictObject({
  day: weekdaySchema,
  windows: z6.array(workingWindowSchema).min(1).max(MAX_WINDOWS_PER_DAY)
}).refine((day) => day.windows.every((window, i) => i === 0 || window.start >= (day.windows[i - 1]?.end ?? "")), { message: "Windows are in order and do not overlap", path: ["windows"] });
var MAX_DAILY_BOOKING_CAP = 50;
var MAX_AWAY_DAYS = 365;
var availabilitySchema = z6.strictObject({
  timeZone: timeZoneSchema,
  hours: z6.array(workingDaySchema).max(7).refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
    message: "Each day appears once"
  }),
  dailyCap: z6.number().int().min(1).max(MAX_DAILY_BOOKING_CAP).nullable(),
  awayUntil: timestampSchema.nullable()
});

// src/consent/values.ts
import { z as z7 } from "zod";
var CONSENT_CHANNELS = ["phone", "sms", "whatsapp", "email", "linkedin"];
var consentChannelSchema = z7.enum(CONSENT_CHANNELS);
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
var consentGrantSourceSchema = z7.enum(CONSENT_GRANT_SOURCES);
var CONSENT_RECORDABLE_SOURCES = [
  "verbal_call",
  "import_attestation",
  "crm",
  "manual"
];
var CONSENT_WITHDRAWAL_SOURCES = ["unsubscribe", "stop_reply", "manual", "crm"];
var consentWithdrawalSourceSchema = z7.enum(CONSENT_WITHDRAWAL_SOURCES);
var consentSourceSchema = z7.union([
  consentGrantSourceSchema,
  consentWithdrawalSourceSchema
]);
var MAX_EVIDENCE_REF_LENGTH = 200;
var evidenceRefSchema = boundedTextSchema(MAX_EVIDENCE_REF_LENGTH);
var consentTokenSchema = z7.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var CONTACT_PURPOSES = ["agent_initiated", "rep_initiated", "reply"];
var contactPurposeSchema = z7.enum(CONTACT_PURPOSES);
var SUPPRESSION_REASONS = [
  "unsubscribe",
  "stop",
  "bounce",
  "complaint",
  "manual",
  "crm",
  "erased"
];
var suppressionReasonSchema = z7.enum(SUPPRESSION_REASONS);
var SUPPRESSION_REMOVABLE_REASONS = ["manual"];
var SUPPRESSION_ADDRESS_KINDS = ["email", "phone", "linkedin"];
var suppressionAddressKindSchema = z7.enum(SUPPRESSION_ADDRESS_KINDS);
var maskedAddressSchema = z7.string().min(1).max(100);
var addressFieldsShape = {
  email: emailSchema.optional(),
  phone: rawPhoneSchema.optional(),
  linkedinUrl: rawLinkedinUrlSchema.optional()
};
var hasExactlyOneAddress = (body) => [body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1;
var ONE_ADDRESS_MESSAGE = "Give exactly one of email, phone or linkedinUrl";

// src/pagination.ts
import { z as z8 } from "zod";
var MAX_PAGE_SIZE = 100;
var DEFAULT_PAGE_SIZE = 25;
var MAX_CURSOR_LENGTH = 512;
var cursorTextSchema = z8.string().min(1).max(MAX_CURSOR_LENGTH);
var pageQuerySchema = z8.object({
  cursor: cursorTextSchema.optional(),
  limit: z8.union([z8.number(), z8.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z8.number().int().min(1).max(MAX_PAGE_SIZE)).default(DEFAULT_PAGE_SIZE)
});
function pageSchema(itemSchema) {
  return z8.object({
    items: z8.array(itemSchema).max(MAX_PAGE_SIZE),
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

// src/agent/instruction.ts
import { z as z9 } from "zod";
var AGENT_KINDS = ["inbound", "outbound"];
var agentKindSchema = z9.enum(AGENT_KINDS);
var MAX_AGENT_INSTRUCTION_LENGTH = 20000;
var INSTRUCTION_STATES = ["draft", "published"];
var instructionStateSchema = z9.enum(INSTRUCTION_STATES);
function isBadControl(char) {
  const code = char.codePointAt(0) ?? 0;
  return code < 32 && code !== 9 && code !== 10 && code !== 13 || code === 127;
}
var instructionTextSchema = z9.string().min(1).refine((text) => ![...text].some(isBadControl), {
  message: "No control characters other than line breaks and tabs"
});
var saveInstructionVersionRequestSchema = z9.strictObject({
  text: instructionTextSchema.max(MAX_AGENT_INSTRUCTION_LENGTH)
});
var versionShape = {
  id: agentInstructionVersionIdSchema,
  agentKind: agentKindSchema,
  number: z9.number().int().min(1),
  state: instructionStateSchema,
  authorMembershipId: membershipIdSchema.nullable(),
  createdAt: timestampSchema,
  publishedAt: timestampSchema.nullable()
};
var instructionVersionSchema = z9.object({
  ...versionShape,
  text: instructionTextSchema.max(MAX_AGENT_INSTRUCTION_LENGTH)
});
var instructionVersionSummarySchema = z9.object({
  ...versionShape,
  length: z9.number().int().min(1).max(MAX_AGENT_INSTRUCTION_LENGTH)
});
var listInstructionVersionsQuerySchema = pageQuerySchema;
var listInstructionVersionsResponseSchema = pageSchema(instructionVersionSummarySchema);
var publishedInstructionsSchema = z9.object({
  agentKind: agentKindSchema,
  version: instructionVersionSchema.nullable()
});
var versionNumberQuery = z9.union([z9.number(), z9.string().regex(/^\d{1,9}$/)]).transform((value) => Number(value)).pipe(z9.number().int().min(1));
var diffInstructionVersionsQuerySchema = z9.object({
  from: versionNumberQuery,
  to: versionNumberQuery
});
var DIFF_LINE_KINDS = ["same", "added", "removed"];
var MAX_DIFF_LINES = 2 * MAX_AGENT_INSTRUCTION_LENGTH;
var instructionDiffSchema = z9.object({
  agentKind: agentKindSchema,
  from: z9.number().int().min(1),
  to: z9.number().int().min(1),
  lines: z9.array(z9.object({
    kind: z9.enum(DIFF_LINE_KINDS),
    text: z9.string().max(MAX_AGENT_INSTRUCTION_LENGTH)
  })).max(MAX_DIFF_LINES)
});

// src/agent/control.ts
var CONTROL_LEVELS = ["supervised", "assisted", "autonomous"];
var controlLevelSchema = z10.enum(CONTROL_LEVELS);
var DEFAULT_CONTROL_LEVEL = "supervised";
var agentChannelSchema = consentChannelSchema;
var agentControlChannelParamSchema = z10.union([agentChannelSchema, z10.literal("default")]);
var ESCALATION_TRIGGERS = [
  "pricing_question",
  "contract_or_legal",
  "complaint",
  "competitor_mentioned",
  "senior_decision_maker",
  "negative_sentiment",
  "out_of_playbook"
];
var escalationTriggerSchema = z10.enum(ESCALATION_TRIGGERS);
var ESCALATION_ACTIONS = ["hand_over", "notify_manager"];
var escalationActionSchema = z10.enum(ESCALATION_ACTIONS);
var escalationRuleSchema = z10.strictObject({
  trigger: escalationTriggerSchema,
  action: escalationActionSchema
});
var escalationRulesSchema = z10.array(escalationRuleSchema).max(ESCALATION_TRIGGERS.length).refine((rules) => new Set(rules.map((r) => r.trigger)).size === rules.length, {
  message: "Each trigger appears once"
});
var agentSendWindowSchema = z10.strictObject({
  timeZone: timeZoneSchema,
  days: z10.array(workingDaySchema).max(7).refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
    message: "Each day appears once"
  })
});
var setAgentControlRequestSchema = z10.strictObject({
  level: controlLevelSchema,
  sendWindow: agentSendWindowSchema,
  escalationRules: escalationRulesSchema
});
var agentControlSchema = z10.object({
  agentKind: agentKindSchema,
  channel: agentChannelSchema.nullable(),
  level: controlLevelSchema,
  sendWindow: z10.object({
    timeZone: timeZoneSchema,
    days: z10.array(z10.object({
      day: weekdaySchema,
      windows: z10.array(z10.object({ start: timeOfDaySchema, end: timeOfDaySchema }))
    })).max(7)
  }),
  escalationRules: z10.array(z10.object({ trigger: escalationTriggerSchema, action: escalationActionSchema })).max(ESCALATION_TRIGGERS.length),
  updatedAt: timestampSchema,
  updatedByMembershipId: membershipIdSchema.nullable()
});
var listAgentControlsQuerySchema = pageQuerySchema.extend({
  agentKind: agentKindSchema.optional()
});
var listAgentControlsResponseSchema = pageSchema(agentControlSchema);
var setAgentsPausedRequestSchema = z10.strictObject({ paused: z10.boolean() });
var agentsPausedSchema = z10.object({
  paused: z10.boolean(),
  updatedAt: timestampSchema.nullable(),
  updatedByMembershipId: membershipIdSchema.nullable()
});
// src/inbound-route.ts
var inboundRoute = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var PUBLIC_ERRORS = [
  "request.too_large",
  "request.unsupported_media_type",
  "request.invalid",
  "rate.limited",
  "server.internal",
  "server.unavailable",
  "server.timeout"
];

// src/agent/control-routes.ts
var AGENT_CONTROL_READ_ROLES = [
  "owner",
  "admin",
  "manager"
];
var AGENT_CONTROL_ADMIN_ROLES = ["owner", "admin"];
var KEY = "Requires an Idempotency-Key header: a replay answers the same result and does the work once.";
var FIXED_RULES = "Instructions sit beneath the fixed rules (Contact Consent, the AI and recording disclosure, suppression) and can never override them; nothing here turns any of them off (ADR 0003).";
var AGENT_CONTROL_ROUTES = Object.freeze({
  listInstructionVersions: inboundRoute({
    method: "GET",
    path: "/v1/agent-instructions/{agentKind}/versions",
    roles: AGENT_CONTROL_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the instruction versions of an Agent kind (inbound or outbound), newest first, one cursor-paginated page at a time (at most 100). Each row shows its number, state, author and length, not the text. Owner, Admin and Manager."
  }),
  getPublishedInstructions: inboundRoute({
    method: "GET",
    path: "/v1/agent-instructions/{agentKind}/published",
    roles: AGENT_CONTROL_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: `Reads the published instructions of an Agent kind, or version null when none was published (the Agent then runs on the fixed rules and the Playbook alone). ${FIXED_RULES} Owner, Admin and Manager.`
  }),
  getInstructionVersion: inboundRoute({
    method: "GET",
    path: "/v1/agent-instructions/{agentKind}/versions/{versionNumber}",
    roles: AGENT_CONTROL_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["agent.version_not_found"],
    commonErrors: [],
    description: "Reads one instruction version with its text. A version of another Organization or Agent kind is agent.version_not_found (404). Owner, Admin and Manager."
  }),
  diffInstructionVersions: inboundRoute({
    method: "GET",
    path: "/v1/agent-instructions/{agentKind}/diff",
    roles: AGENT_CONTROL_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["agent.version_not_found"],
    commonErrors: ["request.invalid"],
    description: "Compares two instruction versions of one Agent kind (query from and to, version numbers) line by line, each line marked same, added or removed. Instructions are at most 20,000 characters, so the diff is one bounded answer and not paginated. Owner, Admin and Manager."
  }),
  saveInstructionVersion: inboundRoute({
    method: "POST",
    path: "/v1/agent-instructions/{agentKind}/versions",
    roles: AGENT_CONTROL_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.instruction_too_long"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Saves instructions as a new draft version; it does not change what the Agent runs until published. Text over 20,000 characters is agent.instruction_too_long (422). ${FIXED_RULES} ${KEY} Owner and Admin only. The save is audited.`
  }),
  publishInstructionVersion: inboundRoute({
    method: "POST",
    path: "/v1/agent-instructions/{agentKind}/versions/{versionNumber}/publish",
    roles: AGENT_CONTROL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.version_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Publishes a version: new conversations use it from then on, those under way finish on the version they started with. Publishing an earlier version is the rollback. A version already published answers 200 unchanged. ${FIXED_RULES} ${KEY} Owner and Admin only. The publication is audited.`
  }),
  listAgentControls: inboundRoute({
    method: "GET",
    path: "/v1/agent-controls",
    roles: AGENT_CONTROL_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the control settings (control level, send window and escalation rules) of each Agent kind: its default and its per-channel overrides, one cursor-paginated page at a time (at most 100), optionally for one kind. Owner, Admin and Manager."
  }),
  setAgentControl: inboundRoute({
    method: "PUT",
    path: "/v1/agent-controls/{agentKind}/{channel}",
    roles: AGENT_CONTROL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.settings_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Replaces the controls of an Agent kind on one channel (phone, sms, whatsapp, email, linkedin, or default for the kind's fallback): control level (supervised, assisted or autonomous), send window and escalation rules. A window that is not usable is agent.settings_invalid (422). The send window can only narrow the fixed calling window and quiet hours. There is no field for Contact Consent, the AI and recording disclosure or suppression: they have no setting (ADR 0003), and an unknown field is refused. ${KEY} Owner and Admin only. The change is audited.`
  }),
  getAgentsPaused: inboundRoute({
    method: "GET",
    path: "/v1/agent-controls/organization-pause",
    roles: AGENT_CONTROL_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads whether every Agent of the Organization is paused, when it last changed and by whom. Owner, Admin and Manager."
  }),
  setAgentsPaused: inboundRoute({
    method: "PUT",
    path: "/v1/agent-controls/organization-pause",
    roles: AGENT_CONTROL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Pauses or resumes every Agent of the Organization at once: a paused Agent starts no conversation and sends nothing, and one under way hands over. ${KEY} Owner and Admin only. The change is audited.`
  })
});
// src/errors.ts
import { z as z11 } from "zod";
var CODE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
var AREA_PATTERN = /^[a-z][a-z0-9_]*$/;
var errorCodeSchema = z11.string().max(100).regex(CODE_PATTERN);
var errorBodySchema = z11.object({
  error: z11.object({
    code: errorCodeSchema,
    message: z11.string().min(1).max(2000),
    details: z11.record(z11.string(), z11.unknown()).optional()
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
var statusSchema = z11.number().int().min(400).max(599);
var messageSchema = z11.string().min(1).max(2000);
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

// src/agent/errors.ts
var AGENT_ERRORS = {
  ...defineErrors("agent", {
    paused: { status: 409, message: "The Inbound Agent is paused." },
    consent_required: {
      status: 409,
      message: "There is no Contact Consent for this channel, so the Inbound Agent will not act."
    },
    outside_hours: {
      status: 409,
      message: "It is outside the hours the Inbound Agent may call."
    },
    question_invalid: { status: 422, message: "The Qualification question is not valid." },
    question_not_found: { status: 404, message: "The Qualification question was not found." },
    settings_invalid: { status: 422, message: "The Inbound Agent settings are not valid." },
    version_not_found: { status: 404, message: "The instruction version was not found." },
    instruction_too_long: {
      status: 422,
      message: "The instructions are longer than 20,000 characters."
    },
    not_enough_deals: {
      status: 409,
      message: "There are not enough won Deals to suggest Qualification questions."
    },
    session_not_found: { status: 404, message: "The try-it session was not found." },
    no_published_instructions: {
      status: 409,
      message: "The Agent has no published instructions."
    }
  }),
  ...defineErrors("handoff", {
    no_rep_available: { status: 409, message: "No Rep is available to take the Handoff." },
    not_found: { status: 404, message: "The Handoff was not found." },
    not_pending: { status: 409, message: "The Handoff is no longer waiting for an answer." }
  })
};
// src/agent/events.ts
import { z as z24 } from "zod";

// src/events.ts
import { z as z13 } from "zod";

// src/tenancy.ts
import { z as z12 } from "zod";
var REGIONS = ["us", "eu"];
var regionSchema = z12.enum(REGIONS);
var ROLES = ["owner", "admin", "manager", "rep"];
var roleSchema = z12.enum(ROLES);
function roleAtLeast(role, minimum) {
  const have = ROLES.indexOf(role);
  const need = ROLES.indexOf(minimum);
  return have !== -1 && need !== -1 && have <= need;
}
var INVITABLE_ROLES = ["admin", "manager", "rep"];
var invitableRoleSchema = z12.enum(INVITABLE_ROLES);
var ORGANIZATION_STATUSES = ["active", "suspended", "deleted"];
var organizationStatusSchema = z12.enum(ORGANIZATION_STATUSES);

// src/events.ts
var EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){1,2}$/;
var eventTypeSchema = z13.string().max(100).regex(EVENT_TYPE_PATTERN);
var versionSchema = z13.number().int().positive();
var occurredAtSchema = z13.iso.datetime({ offset: true }).max(64);
var envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: occurredAtSchema,
  organizationId: organizationIdSchema,
  region: regionSchema
};
function eventEnvelopeSchema(dataSchema) {
  return z13.object({ ...envelopeShape, data: dataSchema });
}
function defineEvent(type, version, dataSchema) {
  const schema = z13.object({
    ...envelopeShape,
    type: z13.literal(eventTypeSchema.parse(type)),
    version: z13.literal(versionSchema.parse(version)),
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

// src/voice/values.ts
import { z as z14 } from "zod";
var VOICE_CALL_DIRECTIONS = ["inbound", "outbound"];
var voiceCallDirectionSchema = z14.enum(VOICE_CALL_DIRECTIONS);
var VOICE_CALL_STATES = [
  "ringing",
  "connecting",
  "disclosing",
  "live",
  "ended",
  "failed",
  "missed"
];
var voiceCallStateSchema = z14.enum(VOICE_CALL_STATES);
var VOICE_CALL_FINAL_STATES = [
  "ended",
  "failed",
  "missed"
];
var VOICE_CALL_FAILURE_REASONS = [
  "disclosure_failed",
  "carrier_dropped",
  "carrier_rejected",
  "busy",
  "no_answer",
  "rep_unreachable",
  "provider_error",
  "timeout"
];
var voiceCallFailureReasonSchema = z14.enum(VOICE_CALL_FAILURE_REASONS);
var VOICE_CALL_ENDED_BY = ["rep", "prospect", "system"];
var voiceCallEndedBySchema = z14.enum(VOICE_CALL_ENDED_BY);
var VOICE_RECORDING_STATES = ["none", "storing", "stored", "deleted"];
var voiceRecordingStateSchema = z14.enum(VOICE_RECORDING_STATES);
var VOICE_TRANSCRIPT_STATES = ["pending", "ready", "deleted"];
var voiceTranscriptStateSchema = z14.enum(VOICE_TRANSCRIPT_STATES);
var MAX_WRAP_UP_NOTE_LENGTH = 2000;
var wrapUpNoteSchema = boundedTextSchema(MAX_WRAP_UP_NOTE_LENGTH);
var MAX_LINE_LABEL_LENGTH = 100;
var lineLabelSchema = boundedTextSchema(MAX_LINE_LABEL_LENGTH);
var countryCodeSchema = z14.string().regex(/^[A-Z]{2}$/);
var phoneHashSchema = z14.string().regex(/^[0-9a-f]{64}$/);

// src/agent/handoff.ts
import { z as z23 } from "zod";

// src/inquiry/qualification.ts
import { z as z15 } from "zod";
var QUALIFICATION_QUESTION_KINDS = ["free_text", "choice", "number", "yes_no"];
var qualificationQuestionKindSchema = z15.enum(QUALIFICATION_QUESTION_KINDS);
var MAX_QUALIFICATION_QUESTIONS = 50;
var MAX_QUESTION_PROMPT_LENGTH = 500;
var MAX_ANSWER_LENGTH = 500;
var MIN_QUESTION_CHOICES = 2;
var MAX_QUESTION_CHOICES = 10;
var MAX_SKIP_CONDITIONS = 5;
var MAX_QUESTION_SUGGESTIONS = 10;
var questionPromptSchema = boundedTextSchema(MAX_QUESTION_PROMPT_LENGTH);
var qualificationValueSchema = z15.union([
  boundedTextSchema(MAX_ANSWER_LENGTH),
  z15.number().finite(),
  z15.boolean()
]);
var SKIP_OPERATORS = [
  "equals",
  "not_equals",
  "greater_than",
  "less_than",
  "answered",
  "not_answered"
];
var skipOperatorSchema = z15.enum(SKIP_OPERATORS);
var skipConditionSchema = z15.strictObject({
  questionId: qualificationQuestionIdSchema,
  operator: skipOperatorSchema,
  value: qualificationValueSchema.optional()
}).refine((c) => (c.operator === "answered" || c.operator === "not_answered") === (c.value === undefined), { message: "Only answered and not_answered take no value", path: ["value"] });
var choicesSchema = z15.array(boundedTextSchema(MAX_ANSWER_LENGTH)).min(MIN_QUESTION_CHOICES).max(MAX_QUESTION_CHOICES).refine((choices) => new Set(choices).size === choices.length, "No repeats");
var skipWhenSchema = z15.array(skipConditionSchema).max(MAX_SKIP_CONDITIONS);
var choicesMatchKind = (q) => q.kind === "choice" === (q.choices !== null);
var CHOICES_ISSUE = {
  message: "Only a choice question has choices, and it must",
  path: ["choices"]
};
var qualificationQuestionSchema = z15.strictObject({
  id: qualificationQuestionIdSchema,
  position: z15.number().int().min(1).max(MAX_QUALIFICATION_QUESTIONS),
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable(),
  required: z15.boolean(),
  skipWhen: skipWhenSchema
}).refine(choicesMatchKind, CHOICES_ISSUE);
var qualificationQuestionParamsSchema = z15.strictObject({
  questionId: qualificationQuestionIdSchema
});
var createQualificationQuestionRequestSchema = z15.strictObject({
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable().default(null),
  required: z15.boolean().default(false),
  skipWhen: skipWhenSchema.default([]),
  position: z15.number().int().min(1).max(MAX_QUALIFICATION_QUESTIONS).optional()
}).refine(choicesMatchKind, CHOICES_ISSUE);
var updateQualificationQuestionRequestSchema = z15.strictObject({
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable(),
  required: z15.boolean(),
  skipWhen: skipWhenSchema
}).refine(choicesMatchKind, CHOICES_ISSUE);
var reorderQualificationQuestionsRequestSchema = z15.strictObject({
  questionIds: z15.array(qualificationQuestionIdSchema).min(1).max(MAX_QUALIFICATION_QUESTIONS).refine((ids) => new Set(ids).size === ids.length, "Each question once")
});
var listQualificationQuestionsQuerySchema = pageQuerySchema.strict();
var qualificationQuestionPageSchema = pageSchema(qualificationQuestionSchema);
var suggestedQualificationQuestionSchema = z15.strictObject({
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable()
}).refine(choicesMatchKind, CHOICES_ISSUE);
var questionSuggestionsSchema = z15.strictObject({
  items: z15.array(suggestedQualificationQuestionSchema).max(MAX_QUESTION_SUGGESTIONS)
});
var qualificationAnswerSchema = z15.strictObject({
  questionId: qualificationQuestionIdSchema,
  value: qualificationValueSchema.nullable(),
  skipped: z15.boolean()
}).refine((a) => !a.skipped || a.value === null, {
  message: "A skipped question has no value",
  path: ["value"]
});
var MAX_QUALIFICATION_SUMMARY_LENGTH = 2000;
var qualificationSchema = z15.strictObject({
  answers: z15.array(qualificationAnswerSchema).max(MAX_QUALIFICATION_QUESTIONS).refine((a) => new Set(a.map((x) => x.questionId)).size === a.length, "Each question once"),
  summary: boundedTextSchema(MAX_QUALIFICATION_SUMMARY_LENGTH).nullable()
});

// src/agent/turn.ts
import { z as z22 } from "zod";

// src/copilot/card.ts
import { z as z20 } from "zod";

// src/playbook/values.ts
import { z as z16 } from "zod";
var DOCUMENT_STATES = ["uploaded", "processing", "ready", "failed", "deleted"];
var documentStateSchema = z16.enum(DOCUMENT_STATES);
var DOCUMENT_FAILURE_REASONS = [
  "too_many_pages",
  "unreadable",
  "password_protected",
  "no_text",
  "processing_failed"
];
var documentFailureReasonSchema = z16.enum(DOCUMENT_FAILURE_REASONS);
var ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt", ".md"];
var ACCEPTED_DOCUMENT_MEDIA_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown"
];
var documentMediaTypeSchema = z16.enum(ACCEPTED_DOCUMENT_MEDIA_TYPES);
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
var documentFileNameSchema = z16.string().max(MAX_RAW_FILE_NAME_LENGTH).transform(normaliseFileName).pipe(z16.string().min(1).max(MAX_DOCUMENT_FILE_NAME_LENGTH).refine(isWellFormed2, "Well-formed text only").refine((name) => !/[/\\]/.test(name), "No path separators").refine(hasStem, "A name before the extension"));
var documentTypeCheckSchema = z16.string().transform(normaliseFileName).pipe(z16.string().refine((name) => documentExtension(name) !== undefined, "An accepted file type only"));
var documentSizeCheckSchema = z16.number().max(MAX_DOCUMENT_BYTES);
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

// src/copilot/values.ts
import { z as z19 } from "zod";

// src/playbook/search.ts
import { z as z18 } from "zod";

// src/playbook/call-values.ts
import { z as z17 } from "zod";
var CALL_STATES = [
  "uploaded",
  "transcribing",
  "awaiting_rep",
  "processing",
  "ready",
  "failed",
  "deleted"
];
var callStateSchema = z17.enum(CALL_STATES);
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
var callFailureReasonSchema = z17.enum(CALL_FAILURE_REASONS);
var CALL_KINDS = ["transcript", "recording"];
var callKindSchema = z17.enum(CALL_KINDS);
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
var callMediaTypeSchema = z17.enum(CALL_MEDIA_TYPES);
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
var speakerLabelSchema = z17.string().max(1000).transform(normaliseSpeakerLabel).pipe(z17.string().min(1).max(MAX_SPEAKER_LABEL_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((label) => !hasStrippableCharacter(label), "No control characters"));
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
var speakerExcerptSchema = z17.strictObject({
  label: speakerLabelSchema,
  excerpt: z17.string().min(1).max(MAX_SPEAKER_EXCERPT_LENGTH * 2).refine((text) => Array.from(text).length <= MAX_SPEAKER_EXCERPT_LENGTH, "Within the cap").refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters")
});
var CALL_CHANNELS = ["left", "right"];
var callChannelSchema = z17.enum(CALL_CHANNELS);
var repChoiceSchema = z17.discriminatedUnion("by", [
  z17.strictObject({ by: z17.literal("speaker"), label: speakerLabelSchema }),
  z17.strictObject({ by: z17.literal("channel"), channel: callChannelSchema })
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

// src/playbook/routes.ts
var PLAYBOOK_WRITE_ROLES = ["owner", "admin"];
var PLAYBOOK_READ_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var route = (definition) => Object.freeze(definition);
var PLAYBOOK_ROUTES = Object.freeze({
  uploadDocument: route({
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
  listDocuments: route({
    method: "GET",
    path: "/playbook/documents",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's documents, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner, Admin, Manager and Rep may read. Soft-deleted documents are left out unless state=deleted is asked for."
  }),
  getDocument: route({
    method: "GET",
    path: "/playbook/documents/{documentId}",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: ["document.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one document and its state, with the failure reason when it failed and the purge time when it was deleted. Owner, Admin, Manager and Rep may read."
  }),
  deleteDocument: route({
    method: "DELETE",
    path: "/playbook/documents/{documentId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["document.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Soft-deletes a document: it is hidden at once and purged after the retention period, and can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the document in state "deleted" and its purge time, and deleting an already deleted document answers the same. Takes no body.'
  }),
  restoreDocument: route({
    method: "POST",
    path: "/playbook/documents/{documentId}/restore",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["document.not_found", "document.not_restorable"],
    commonErrors: ["request.invalid"],
    description: 'Restores a soft-deleted document within the retention period; it is re-ingested from the kept file and shows as "processing". Owner and Admin only. Idempotent by end state: a document that is no longer deleted (restored by an earlier call, or never deleted) answers 200 with the document as it is. A deleted document whose purge time has passed but which the purge has not yet removed is document.not_restorable (410); once purged the record is gone and the answer is document.not_found (404). Takes no body.'
  }),
  removeOrganizationDocuments: route({
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

// src/playbook/sales-history-routes.ts
var SALES_HISTORY_READ_ROLES = PLAYBOOK_WRITE_ROLES;
var route2 = (definition) => Object.freeze(definition);
var ENVELOPE_ERRORS = [
  "request.invalid",
  "request.too_large",
  "request.unsupported_media_type",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var SALES_HISTORY_ROUTES = Object.freeze({
  uploadCall: route2({
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
  listCalls: route2({
    method: "GET",
    path: "/playbook/calls",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Calls, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. Deleted Calls are left out unless state=deleted is asked for; state=awaiting_rep lists the Calls waiting for a Rep and dealRecordId (the opaque Deal id) limits the list to one Deal. A list item never carries speakers: only the single-Call read returns speaker excerpts."
  }),
  getCall: route2({
    method: "GET",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Call and its state, with the failure reason when it failed, the speaker labels to pick a Rep from and the purge time when it was deleted. For a Recording with speaker labels, above all one awaiting its Rep, it also returns speakers: a short excerpt per label (the first turns of the speaker, at most 240 characters, cut at a word boundary with an ellipsis; at most 20 speakers) so a person can tell who is the Rep. The excerpts are tenant Transcript text: returned only to the Owner and Admin of the owning Organization and never logged. No other Transcript text or audio is returned. Owner and Admin only."
  }),
  deleteCall: route2({
    method: "DELETE",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Soft-deletes a Call: it and its Moments are hidden from search at once and purged after 30 days, and it can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the Call in state "deleted" and its purge time, and deleting an already deleted Call answers the same. Takes no body.'
  }),
  restoreCall: route2({
    method: "POST",
    path: "/playbook/calls/{callId}/restore",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found", "call.not_restorable"],
    commonErrors: ["request.invalid"],
    description: 'Restores a soft-deleted Call within the retention period; it is processed again from the kept Transcript (a Recording is never transcribed twice) and shows as "processing". Owner and Admin only. Idempotent by end state: a Call that is no longer deleted answers 200 with the Call as it is. A deleted Call whose purge time has passed but which the purge has not yet removed is call.not_restorable (410); once purged the record is gone and the answer is call.not_found (404). Takes no body.'
  }),
  setCallRep: route2({
    method: "PUT",
    path: "/playbook/calls/{callId}/rep",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found", "call.rep_invalid", "call.rep_not_changeable"],
    commonErrors: ["request.invalid"],
    description: 'Picks the Rep of a Call waiting in "awaiting_rep", or changes the Rep of a "ready" Call or a "failed" Call whose failureReason is rep_label_not_found or not_per_side, with {"rep":{"by":"speaker","label":...}} or {"rep":{"by":"channel","channel":...}}. Owner and Admin only, and any of them may pick, not only the uploader. A choice that does not suit the Call, or a label that is not among its speakers, is call.rep_invalid; a Call in any other state or with any other failure reason is call.rep_not_changeable. A different Rep answers 200 with the Call in state "processing": its Moments are rebuilt by a queued job and the Call is out of search until it finishes. Idempotent by end state: choosing the Rep the Call already has changes nothing and answers 200 with the Call as it is.'
  }),
  listDeals: route2({
    method: "GET",
    path: "/playbook/deals",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Deals, newest first (sorted by createdAt, then id, the opaque Deal id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. outcome limits the list to one Outcome and appearedInImport=false lists the Deals that have Calls but never appeared in a CSV, so a mistyped deal id is visible."
  }),
  getDeal: route2({
    method: "GET",
    path: "/playbook/deals/{dealRecordId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Deal by its opaque id (the deal_ id from a list or a lookup, never the customer deal id, which is found with the lookup route). Owner and Admin only. A Deal cannot be deleted on its own."
  }),
  lookupDeal: route2({
    method: "POST",
    path: "/playbook/deals/lookup",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Finds a Deal by the customer deal id, sent in the JSON body {"dealId":...} so it never appears in a URL, a query string or a cursor (trimmed, otherwise exact and case-sensitive). Answers 200 with the Deal, whose opaque id is then used in every path, or deal.not_found. Owner and Admin only. It changes nothing.'
  }),
  setDealOutcome: route2({
    method: "PUT",
    path: "/playbook/deals/{dealRecordId}/outcome",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: "Sets or corrects a Deal's Outcome (won, lost or open), even a decided one. Owner and Admin only. Idempotent by end state. A change bumps the Deal's Outcome sequence and queues the re-tag of its Moments; search follows the database at once for a lost Deal and may lag for a Deal that has just become won."
  }),
  uploadDealImport: route2({
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
  listDealImports: route2({
    method: "GET",
    path: "/playbook/deal-imports",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Deal imports, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only."
  }),
  getDealImport: route2({
    method: "GET",
    path: "/playbook/deal-imports/{importId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal_import.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one import: its state, failure reason and the counts of rows, applied rows and rejected rows. Owner and Admin only."
  }),
  listDealImportRows: route2({
    method: "GET",
    path: "/playbook/deal-imports/{importId}/rows",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal_import.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads the report of an import, in CSV order, one cursor-paginated page at a time (at most 100); result=rejected lists only the rows that need fixing. Each row has its row number (the header is row 1), the deal id when it was valid, the result and a reason code. No other cell is returned. Owner and Admin only."
  }),
  getRightsConfirmation: route2({
    method: "GET",
    path: "/playbook/rights-confirmation",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's recorded confirmation that it may share Recordings and Transcripts, with who confirmed and when, the version of the wording they saw, the current wording version, optionally the text of that version (also in RIGHTS_WORDINGS) and whether the stored one is current. Owner and Admin only. Without a current confirmation, uploads of Calls are refused; existing Calls are kept and stay searchable."
  }),
  confirmRights: route2({
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
var MAX_SEARCH_LIMIT = 20;
var DEFAULT_SEARCH_LIMIT = 5;
var MAX_SEARCH_TURNS = 6;
var MAX_SEARCH_TEXT_CHARACTERS = 2000;
var MAX_MOMENT_SNIPPET_CHARACTERS = 512;
var MAX_SEARCH_CANDIDATES = 100;
var codePointCount = (text) => Array.from(text).length;
var searchTurnSchema = z18.strictObject({
  role: z18.enum(["rep", "prospect"]),
  text: z18.string().min(1).max(MAX_SEARCH_TEXT_CHARACTERS * 2).refine(isWellFormedText, "Well-formed text only").refine((text) => text.trim().length > 0, "Not only whitespace")
});
var searchMomentsRequestSchema = z18.strictObject({
  turns: z18.array(searchTurnSchema).min(1).max(MAX_SEARCH_TURNS),
  limit: z18.number().int().min(1).max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT)
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
var momentSnippetSchema = z18.string().max(MAX_MOMENT_SNIPPET_CHARACTERS * 2).refine((text) => codePointCount(text) <= MAX_MOMENT_SNIPPET_CHARACTERS, "Within the snippet cap").refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters");
function momentSnippet(text) {
  return excerptText(text, MAX_MOMENT_SNIPPET_CHARACTERS);
}
var momentMatchSchema = z18.object({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema,
  score: z18.number().finite(),
  prospect: momentSnippetSchema,
  repNext: momentSnippetSchema
});
var searchEvidenceSchema = z18.object({
  moments: z18.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  deals: z18.number().int().min(0).max(MAX_SEARCH_CANDIDATES)
});
var searchMomentsResponseSchema = z18.object({
  items: z18.array(momentMatchSchema).max(MAX_SEARCH_LIMIT),
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
var route3 = (definition) => Object.freeze(definition);
var searchDocumentsRequestSchema = searchMomentsRequestSchema;
function documentQueryText(turns) {
  return turns.map((turn) => turn.text.trim()).join(`
`);
}
var documentMatchSchema = z18.object({
  documentId: documentIdSchema,
  fileName: documentFileNameSchema,
  page: z18.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  score: z18.number().finite(),
  snippet: momentSnippetSchema
});
var documentSearchEvidenceSchema = z18.object({
  chunks: z18.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  documents: z18.number().int().min(0).max(MAX_SEARCH_CANDIDATES)
});
var searchDocumentsResponseSchema = z18.object({
  items: z18.array(documentMatchSchema).max(MAX_SEARCH_LIMIT),
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
  searchMoments: route3({
    method: "POST",
    path: "/playbook/search/moments",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid", "server.timeout", "server.unavailable"],
    description: "Finds Moments in the Organization's won Deals that resemble the conversation so far, so the Copilot can show what worked. The body is the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best matches, best first, at most 20, each with the opaque callId and dealRecordId, a score and two snippets of at most 512 characters (what the Prospect said and what the Rep said next), and evidence: the number of candidate Moments and the distinct won Deals among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) Moments by similarity, after the eligibility checks), not every won Deal in the Organization. There is no cursor: the result is a bounded top-k. Only Moments of Calls whose Deal is won and whose Call is in search are returned, and only from the caller's Organization. It never returns the customer's dealId, name or amount. The request and the snippets are tenant conversation text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Owner and Admin only, as for all sales history (the owner's decision of 2026-10-13); a Manager or a Rep gets auth.forbidden, because a Rep sees only their own conversations. The phase-2 Copilot calls this service-to-service, not with a Rep's token."
  }),
  searchDocuments: route3({
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

// src/copilot/values.ts
var COPILOT_CARD_KINDS = ["similar_moment", "objection", "next_step", "document"];
var copilotCardKindSchema = z19.enum(COPILOT_CARD_KINDS);
var COPILOT_COMPOSED_KINDS = [
  "objection",
  "next_step"
];
var COPILOT_OBJECTION_TYPES = [
  "price",
  "timing",
  "competitor",
  "authority",
  "need",
  "trust"
];
var copilotObjectionTypeSchema = z19.enum(COPILOT_OBJECTION_TYPES);
var COPILOT_RATINGS = ["useful", "not_useful"];
var copilotRatingSchema = z19.enum(COPILOT_RATINGS);
var MAX_COPILOT_CARDS_PER_CALL = 60;
var MAX_COPILOT_CITED_MOMENTS = 5;
var MAX_COPILOT_CARD_TEXT_LENGTH = 600;
var MAX_COPILOT_QUOTE_LENGTH = 512;
var codePointCount2 = (text) => Array.from(text).length;
function copilotTextSchema(max) {
  return z19.string().max(max * 4).refine((text) => codePointCount2(text) <= max, `At most ${max} characters`).refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters").refine((text) => text.trim().length > 0, "Not only whitespace");
}
var copilotCardTextSchema = copilotTextSchema(MAX_COPILOT_CARD_TEXT_LENGTH);
var copilotQuoteTextSchema = copilotTextSchema(MAX_COPILOT_QUOTE_LENGTH);
var copilotMomentRefSchema = z19.strictObject({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema
});
var copilotEvidenceSchema = z19.strictObject({
  moments: z19.number().int().min(1).max(MAX_SEARCH_CANDIDATES),
  deals: z19.number().int().min(1).max(MAX_SEARCH_CANDIDATES)
}).refine((evidence) => evidence.deals <= evidence.moments, {
  path: ["deals"],
  message: "There are no more distinct Deals than Moments"
});
var copilotMomentKey = (ref) => `${ref.callId}|${ref.dealRecordId}`;

// src/copilot/card.ts
var copilotQuoteSchema = z20.strictObject({
  ...copilotMomentRefSchema.shape,
  prospect: copilotQuoteTextSchema,
  repNext: copilotQuoteTextSchema
});
var copilotDocumentSourceSchema = z20.strictObject({
  documentId: documentIdSchema,
  page: z20.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  passage: copilotQuoteTextSchema
});
var cardBase = {
  id: copilotCardIdSchema,
  callId: callIdSchema,
  sequence: z20.number().int().min(1).max(MAX_COPILOT_CARDS_PER_CALL),
  evidence: copilotEvidenceSchema,
  citedMoments: z20.array(copilotMomentRefSchema).min(1).max(MAX_COPILOT_CITED_MOMENTS),
  quotes: z20.array(copilotQuoteSchema).max(MAX_COPILOT_CITED_MOMENTS),
  shownAt: timestampSchema,
  rating: copilotRatingSchema.nullable(),
  dismissed: z20.boolean(),
  pinned: z20.boolean()
};
var similarMomentCard = z20.strictObject({ ...cardBase, kind: z20.literal("similar_moment") });
var objectionCard = z20.strictObject({
  ...cardBase,
  kind: z20.literal("objection"),
  objectionType: copilotObjectionTypeSchema,
  response: copilotCardTextSchema
});
var nextStepCard = z20.strictObject({
  ...cardBase,
  kind: z20.literal("next_step"),
  nextStep: copilotCardTextSchema
});
var documentCard = z20.strictObject({
  ...cardBase,
  kind: z20.literal("document"),
  source: copilotDocumentSourceSchema
});
var copilotCardSchema = z20.discriminatedUnion("kind", [similarMomentCard, objectionCard, nextStepCard, documentCard]).superRefine((card, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  const cited = new Set(card.citedMoments.map(copilotMomentKey));
  if (cited.size !== card.citedMoments.length) {
    issue("citedMoments", "A Moment is cited once");
  }
  if (card.citedMoments.length > card.evidence.moments) {
    issue("evidence", "The Evidence counts at least the Moments cited");
  }
  if (new Set(card.citedMoments.map((ref) => ref.dealRecordId)).size > card.evidence.deals) {
    issue("evidence", "The Evidence counts at least the Deals cited");
  }
  if (card.quotes.some((quote) => !cited.has(copilotMomentKey(quote)))) {
    issue("quotes", "Every quote is of a cited Moment");
  }
  if (card.kind === "similar_moment" && card.quotes.length === 0) {
    issue("quotes", "A similar-Moment card shows at least one quote");
  }
  if (card.dismissed && card.pinned) {
    issue("pinned", "A card is dismissed or pinned, not both");
  }
});
function isComposedKind(kind) {
  return COPILOT_COMPOSED_KINDS.includes(kind);
}
var copilotCallParamsSchema = z20.strictObject({ callId: callIdSchema });
var copilotCardParamsSchema = z20.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema
});
var copilotCardCursorSchema = z20.strictObject({
  sequence: z20.number().int().min(1).max(MAX_COPILOT_CARDS_PER_CALL)
});
var listCopilotCardsQuerySchema = pageQuerySchema.extend({ kind: copilotCardKindSchema.optional() }).strict();
var copilotCardPageSchema = pageSchema(copilotCardSchema);
var markCopilotCardRequestSchema = z20.strictObject({
  rating: copilotRatingSchema.nullable().optional(),
  dismissed: z20.boolean().optional(),
  pinned: z20.boolean().optional()
}).refine((body) => body.rating !== undefined || body.dismissed !== undefined || body.pinned !== undefined, { message: "Give a rating, dismissed or pinned" }).refine((body) => !(body.dismissed === true && body.pinned === true), {
  message: "A card is dismissed or pinned, not both"
});

// src/agent/values.ts
import { z as z21 } from "zod";
var AGENT_VOICE_STYLES = ["warm", "neutral", "crisp"];
var agentVoiceStyleSchema = z21.enum(AGENT_VOICE_STYLES);
var AGENT_LANGUAGES = ["en"];
var agentLanguageSchema = z21.enum(AGENT_LANGUAGES);
var MAX_AGENT_CALL_SECONDS = 1800;
var DEFAULT_AGENT_CALL_SECONDS = 600;
var MAX_AGENT_CALL_COST_USD_CENTS = 5000;
var MAX_AGENT_CONCURRENCY = 50;
var MAX_AGENT_GREETING_LENGTH = 500;
var AGENT_CALLING_WINDOW = { startHour: 8, endHour: 21 };
var AGENT_TOOLS = [
  "record_answer",
  "find_slots",
  "book",
  "hand_off",
  "end_call",
  "revoke_consent"
];
var agentToolNameSchema = z21.enum(AGENT_TOOLS);
var MAX_TURN_SOURCES = 10;
var MAX_HANDOFF_CONTEXT_TURNS = 20;
var MAX_TURN_TEXT_LENGTH = 2000;

// src/agent/turn.ts
var agentTurnRoleSchema = z22.enum(["prospect", "agent"]);
var agentTurnSchema = z22.strictObject({
  index: z22.number().int().min(0),
  role: agentTurnRoleSchema,
  text: boundedTextSchema(MAX_TURN_TEXT_LENGTH),
  sources: z22.array(copilotDocumentSourceSchema).max(MAX_TURN_SOURCES),
  deferred: z22.boolean(),
  toolCall: z22.strictObject({ name: agentToolNameSchema }).nullable(),
  at: timestampSchema
});
var agentCallParamsSchema = z22.strictObject({ callId: callIdSchema });
var listAgentTurnsQuerySchema = pageQuerySchema.strict();
var agentTurnPageSchema = pageSchema(agentTurnSchema);
var trySessionParamsSchema = z22.strictObject({ sessionId: trySessionIdSchema });
var sendTryMessageRequestSchema = z22.strictObject({
  text: boundedTextSchema(MAX_TURN_TEXT_LENGTH)
});
var startTrySessionRequestSchema = z22.strictObject({});
var trySessionSchema = z22.strictObject({
  id: trySessionIdSchema,
  opening: agentTurnSchema,
  expiresAt: timestampSchema
});
var tryReplySchema = z22.strictObject({ reply: agentTurnSchema });

// src/agent/handoff.ts
var HANDOFF_CHANNELS = ["call", "chat"];
var handoffChannelSchema = z23.enum(HANDOFF_CHANNELS);
var HANDOFF_STATES = [
  "pending",
  "accepted",
  "completed",
  "declined",
  "timed_out",
  "no_rep"
];
var handoffStateSchema = z23.enum(HANDOFF_STATES);
var HANDOFF_REASONS = [
  "asked_for_rep",
  "qualified",
  "agent_unsure",
  "prospect_frustrated"
];
var handoffReasonSchema = z23.enum(HANDOFF_REASONS);
var HANDOFF_RESULTS = ["bridged", "booking_offered", "abandoned"];
var handoffResultSchema = z23.enum(HANDOFF_RESULTS);
var handoffSchema = z23.strictObject({
  id: handoffIdSchema,
  state: handoffStateSchema,
  channel: handoffChannelSchema,
  callId: callIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  repMembershipId: membershipIdSchema.nullable(),
  attempt: z23.number().int().min(1).max(10),
  reason: handoffReasonSchema,
  requestedAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  completedAt: timestampSchema.nullable()
}).superRefine((h, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (h.channel === "call" && (h.callId === null || h.chatId !== null)) {
    issue("callId", "A call Handoff names its Call and no Chat");
  }
  if (h.channel === "chat" && (h.chatId === null || h.callId !== null)) {
    issue("chatId", "A chat Handoff names its Chat and no Call");
  }
});
var handoffParamsSchema = z23.strictObject({ handoffId: handoffIdSchema });
var listHandoffsQuerySchema = pageQuerySchema.extend({ state: handoffStateSchema.optional() }).strict();
var handoffPageSchema = pageSchema(handoffSchema);
var handoffContextSchema = z23.strictObject({
  handoffId: handoffIdSchema,
  prospectId: prospectIdSchema,
  qualification: qualificationSchema,
  recentTurns: z23.array(agentTurnSchema).max(MAX_HANDOFF_CONTEXT_TURNS)
});
var answerHandoffRequestSchema = z23.strictObject({});

// src/agent/events.ts
var AGENT_CALL_OUTCOMES = [
  "completed",
  "booked",
  "handed_off",
  "prospect_stopped",
  "failed"
];
var agentCallOutcomeSchema = z24.enum(AGENT_CALL_OUTCOMES);
var voiceAgentCallEndedEvent = defineEvent("voice.agent_call.ended", 1, z24.strictObject({
  callId: callIdSchema,
  inquiryId: inquiryIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  outcome: agentCallOutcomeSchema,
  failureReason: voiceCallFailureReasonSchema.nullable(),
  startedAt: timestampSchema,
  endedAt: timestampSchema,
  durationSeconds: z24.number().int().min(0).max(MAX_AGENT_CALL_SECONDS),
  disclosureWordingVersion: z24.number().int().min(1).nullable()
}).superRefine((d, ctx) => {
  if (d.outcome === "failed" !== (d.failureReason !== null)) {
    ctx.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "Only a failed Call has a failure reason"
    });
  }
  if (d.outcome !== "failed" && d.disclosureWordingVersion === null) {
    ctx.addIssue({
      code: "custom",
      path: ["disclosureWordingVersion"],
      message: "A Call that connected played the Disclosure"
    });
  }
}));
var voiceHandoffCompletedEvent = defineEvent("voice.handoff.completed", 1, z24.strictObject({
  handoffId: handoffIdSchema,
  channel: handoffChannelSchema,
  callId: callIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  inquiryId: inquiryIdSchema.nullable(),
  prospectId: prospectIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  result: handoffResultSchema,
  attempts: z24.number().int().min(1).max(10),
  requestedAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  completedAt: timestampSchema
}));
var CONSENT_REVOKE_TRIGGERS = ["agent_call", "chat", "sms_stop"];
var consentRevokeTriggerSchema = z24.enum(CONSENT_REVOKE_TRIGGERS);
var voiceConsentRevokedEvent = defineEvent("voice.consent.revoked", 1, z24.strictObject({
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  trigger: consentRevokeTriggerSchema,
  callId: callIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  revokedAt: timestampSchema
}));
var AGENT_EVENTS = {
  "voice.agent_call.ended": voiceAgentCallEndedEvent,
  "voice.handoff.completed": voiceHandoffCompletedEvent,
  "voice.consent.revoked": voiceConsentRevokedEvent
};
// src/agent/routes.ts
var AGENT_READ_ROLES = ["owner", "admin", "manager"];
var AGENT_ADMIN_ROLES = ["owner", "admin"];
var AGENT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var HANDOFF_VISIBILITY = "A Rep sees and answers only the Handoffs offered to them; a Manager sees those offered to Reps of their Team; an Owner or Admin sees all. A Handoff outside the caller's view is handoff.not_found (404), never 403.";
var AGENT_ROUTES = Object.freeze({
  getAgentSettings: inboundRoute({
    method: "GET",
    path: "/v1/agent/settings",
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Inbound Agent settings: paused, greeting, voice style, hours, the fixed language list and the caps on Call length, cost and concurrency. Owner, Admin and Manager; a Rep gets auth.forbidden."
  }),
  setAgentSettings: inboundRoute({
    method: "PUT",
    path: "/v1/agent/settings",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["agent.settings_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the Inbound Agent settings, so a repeat changes nothing. Pausing stops callbacks and answers at once. Hours must not be empty and are checked in the Organization's zone (timeZone) against the fixed calling window; the service applies the Prospect-local window separately, so a call is placed only inside both. The body has no field for the Disclosure, the Recording or Contact Consent: they are not settings and an unknown field is request.invalid (ADR 0003). A greeting is spoken after the Disclosure, never in place of it. Owner and Admin only."
  }),
  listQualificationQuestions: inboundRoute({
    method: "GET",
    path: "/v1/agent/questions",
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Qualification questions in the order the Inbound Agent asks them, one cursor-paginated page at a time (at most 100). Owner, Admin and Manager."
  }),
  createQualificationQuestion: inboundRoute({
    method: "POST",
    path: "/v1/agent/questions",
    roles: AGENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["agent.question_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Adds a Qualification question (at most 50), last unless a position is given. Skip logic may only look at earlier questions; a reference to an unknown question or a loop is agent.question_invalid (422). An Idempotency-Key header is accepted: a replay answers 200 with the original question. Owner and Admin only."
  }),
  getQualificationQuestion: inboundRoute({
    method: "GET",
    path: "/v1/agent/questions/{questionId}",
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["agent.question_not_found"],
    commonErrors: [],
    description: "Reads one Qualification question. Owner, Admin and Manager."
  }),
  updateQualificationQuestion: inboundRoute({
    method: "PATCH",
    path: "/v1/agent/questions/{questionId}",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["agent.question_not_found", "agent.question_invalid"],
    commonErrors: ["request.invalid"],
    description: "Changes a Qualification question's prompt, kind, choices, required flag or skip logic; the same body again changes nothing. Past answers keep the wording they were given under. Owner and Admin only."
  }),
  deleteQualificationQuestion: inboundRoute({
    method: "DELETE",
    path: "/v1/agent/questions/{questionId}",
    roles: AGENT_ADMIN_ROLES,
    success: [204],
    idempotent: false,
    errors: ["agent.question_not_found", "agent.question_invalid"],
    commonErrors: [],
    description: "Removes a Qualification question. Skip logic in a later question that looks at it is agent.question_invalid (422) until that logic is changed. Answers already given are kept on their Inquiries. Owner and Admin only."
  }),
  reorderQualificationQuestions: inboundRoute({
    method: "PUT",
    path: "/v1/agent/question-order",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["agent.question_invalid", "agent.question_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Sets the order of all Qualification questions by listing every id once, so a repeat changes nothing. A question whose skip logic would then look at a later one is agent.question_invalid (422). Owner and Admin only."
  }),
  suggestQualificationQuestions: inboundRoute({
    method: "POST",
    path: "/v1/agent/questions/suggestions",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.not_enough_deals"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Suggests up to 10 Qualification questions from what the Organization's won Deals have in common. It changes nothing: an Admin adds the ones they want. Needs enough won Deals, else agent.not_enough_deals (409). Requires an Idempotency-Key header: a replay answers the same suggestions without calling the model again. Owner and Admin only."
  }),
  startTrySession: inboundRoute({
    method: "POST",
    path: "/v1/agent/try-sessions",
    roles: AGENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Starts a text rehearsal of the Inbound Agent on the live settings and Playbook. No call is placed, no Prospect is created and nothing is sent. The first turn states that it is an AI. Requires an Idempotency-Key header: a replay answers the same session. Owner and Admin only."
  }),
  sendTryMessage: inboundRoute({
    method: "POST",
    path: "/v1/agent/try-sessions/{sessionId}/messages",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.session_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Says something to the Inbound Agent in a try-it session and answers its reply turn with the Playbook passages it used. Requires an Idempotency-Key header: a replay answers the original reply and does not ask the model again. An unknown or expired session is agent.session_not_found (404). Owner and Admin only."
  }),
  listAgentTurns: inboundRoute({
    method: "GET",
    path: "/v1/calls/{callId}/agent-turns",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists the turns of an Inbound Agent Call, oldest first, one cursor-paginated page at a time (at most 100), with the Playbook passages each answer used. A Rep sees only Calls handed to them; a Manager those of their Team; an Owner or Admin all. A Call outside the caller's view, or one the Agent did not take, is call.not_found (404)."
  }),
  listHandoffs: inboundRoute({
    method: "GET",
    path: "/v1/handoffs",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Handoffs, latest first, one cursor-paginated page at a time (at most 100), optionally by state. ${HANDOFF_VISIBILITY}`
  }),
  getHandoff: inboundRoute({
    method: "GET",
    path: "/v1/handoffs/{handoffId}",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["handoff.not_found"],
    commonErrors: [],
    description: `Reads one Handoff with the context the Rep needs before answering: the Prospect, the Qualification so far and the last 20 turns, without the Prospect's email or number. ${HANDOFF_VISIBILITY}`
  }),
  acceptHandoff: inboundRoute({
    method: "POST",
    path: "/v1/handoffs/{handoffId}/accept",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["handoff.not_found", "handoff.not_pending"],
    commonErrors: [],
    description: "The Rep the Handoff is offered to takes it and the Prospect is bridged. Repeating it as the same Rep after it was accepted answers 200 with the same Handoff; if another Rep took it, it timed out or it was declined, it is handoff.not_pending (409). When no Rep takes a Handoff, handoff.no_rep_available is what the Agent reports to the Prospect and a Booking is offered. The Rep is the token's: the body names no one."
  }),
  declineHandoff: inboundRoute({
    method: "POST",
    path: "/v1/handoffs/{handoffId}/decline",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["handoff.not_found", "handoff.not_pending"],
    commonErrors: [],
    description: "The Rep the Handoff is offered to declines it and it passes to the next Rep. Repeating it as the same Rep after it was declined answers 200 with the same Handoff; if it is no longer pending for any other reason it is handoff.not_pending (409). The Rep is the token's: the body names no one."
  })
});
// src/agent/runtime-config.ts
import { z as z25 } from "zod";
function runtimeAgentKind(audience) {
  return audience === "voice" ? "inbound" : "outbound";
}
var agentRuntimeControlSchema = z25.strictObject({
  channel: agentChannelSchema.nullable(),
  level: controlLevelSchema,
  sendWindow: agentSendWindowSchema,
  escalationRules: escalationRulesSchema
});
var agentRuntimeConfigSchema = z25.strictObject({
  agentKind: agentKindSchema,
  paused: z25.boolean(),
  instructionVersionId: agentInstructionVersionIdSchema,
  instructions: instructionVersionSchema.shape.text,
  controls: z25.array(agentRuntimeControlSchema).max(CONSENT_CHANNELS.length + 1).refine((controls) => new Set(controls.map((c) => c.channel)).size === controls.length, {
    message: "Each channel appears once"
  })
});
// src/agent/runtime-routes.ts
var AGENT_RUNTIME_ROUTES = Object.freeze({
  getAgentRuntimeConfig: inboundRoute({
    method: "GET",
    path: "/internal/v1/agent/runtime-config",
    roles: [],
    internal: true,
    serviceToken: { audiences: ["voice", "outbound"] },
    etag: true,
    success: [200, 304],
    idempotent: false,
    errors: ["agent.no_published_instructions"],
    commonErrors: ["auth.unauthenticated", "auth.forbidden", "server.unavailable"],
    description: "Internal: a service reads what it needs to run an Agent in one answer: the published instruction version id and text, the controls (default and per-channel) and whether the Agent is paused. The Organization is the service token's subject, never a path, query or body field. Only a service token whose audience is voice (the Inbound Agent) or outbound (the Outbound Agent) may call it; the audience also picks the Agent kind, and any other caller, including a user token, is auth.forbidden (403). An Organization with no published version is agent.no_published_instructions (409): the caller must fail closed and start no conversation. The answer carries an ETag, opaque, that changes when the published version, the controls or the pause change, and Cache-Control: private, no-cache so every call is revalidated; a caller that sends it back in If-None-Match gets 304 with no body while nothing changed. Conversations under way finish on the version they started with. Instructions sit beneath the fixed rules (Contact Consent, the AI and recording disclosure, suppression) and can never override them; nothing here turns any of them off (ADR 0003). The text is never logged."
  })
});
// src/agent/settings.ts
import { z as z26 } from "zod";
var minutesOf = (time) => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
};
var hoursSchema = z26.array(workingDaySchema).min(1).max(7).refine((days) => days.every((d) => d.windows.every((w) => minutesOf(w.start) >= AGENT_CALLING_WINDOW.startHour * 60 && minutesOf(w.end) <= AGENT_CALLING_WINDOW.endHour * 60)), { message: "Hours lie within the fixed calling window" }).refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
  message: "Each day appears once"
});
var setAgentSettingsRequestSchema = z26.strictObject({
  paused: z26.boolean(),
  greeting: boundedTextSchema(MAX_AGENT_GREETING_LENGTH),
  voiceStyle: agentVoiceStyleSchema,
  timeZone: timeZoneSchema,
  hours: hoursSchema,
  maxCallSeconds: z26.number().int().min(30).max(MAX_AGENT_CALL_SECONDS),
  maxCostUsdCents: z26.number().int().min(1).max(MAX_AGENT_CALL_COST_USD_CENTS),
  concurrencyCap: z26.number().int().min(1).max(MAX_AGENT_CONCURRENCY)
});
var agentSettingsSchema = setAgentSettingsRequestSchema.extend({
  languages: z26.array(agentLanguageSchema).min(1).max(1),
  updatedAt: timestampSchema,
  updatedByMembershipId: membershipIdSchema.nullable()
});
// src/analytics/errors.ts
var ANALYTICS_ERRORS = defineErrors("analytics", {
  range_too_large: {
    status: 422,
    message: "The date range is too large. Ask for 13 months or fewer."
  }
});
// src/analytics/routes.ts
var ANALYTICS_READ_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var ANALYTICS_ADMIN_ROLES = ["owner", "admin"];
var SCOPE = "Rows are scoped by role: a Rep sees only their own, a Manager the Reps on their own Team, an Admin and an Owner all of the Organization's. A second Organization sees nothing of the first. A row outside the caller's view is request.not_found (404), never 403.";
var RANGE = "The range (from, to) is two real calendar days, from not after to, and spans at most 13 calendar months (to is not after from plus 13 months minus one day), else analytics.range_too_large (422).";
var SAMPLE = "Every value carries recordCount, the number of records it rests on. A rate with fewer than 20 records has state not_enough_data and a null value: that is an answer, not an error.";
var ANALYTICS_ROUTES = Object.freeze({
  getSeries: inboundRoute({
    method: "GET",
    path: "/v1/analytics/series",
    roles: ANALYTICS_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["analytics.range_too_large"],
    commonErrors: ["request.invalid"],
    description: `Reads one metric (sends, replies, positive_replies, meetings, outcomes_won or outcomes_lost) per day, optionally split by channel, agent_kind, campaign or rep and filtered by channel, Agent kind, Campaign and Rep. Lines (groups) are cursor-paginated, at most 20 a page (limit, cursor), each of at most 400 days. ${RANGE} ${SAMPLE} ${SCOPE}`
  }),
  listTable: inboundRoute({
    method: "GET",
    path: "/v1/analytics/table",
    roles: ANALYTICS_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["analytics.range_too_large"],
    commonErrors: ["request.invalid"],
    description: `Compares Campaigns or Reps side by side: one row each with sends, replies, positive replies, meetings, won and lost Outcomes, and the reply, positive-reply and win rates. One cursor-paginated page at a time (at most 100). ${RANGE} ${SAMPLE} ${SCOPE}`
  }),
  downloadTableCsv: inboundRoute({
    method: "GET",
    path: "/v1/analytics/table.csv",
    roles: ANALYTICS_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["analytics.range_too_large"],
    commonErrors: ["request.invalid"],
    description: `Downloads the comparison table as text/csv, one cursor-paginated page at a time (at most 1,000 rows); the next cursor is in the x-next-cursor response header, absent on the last page. The filters are those of the table. Cells that start with =, +, - or @ are escaped so a spreadsheet does not run them. ${RANGE} ${SCOPE}`
  }),
  getDealAttribution: inboundRoute({
    method: "GET",
    path: "/v1/analytics/deals/{dealRecordId}/attribution",
    roles: ANALYTICS_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid", "request.not_found"],
    description: "Shows the Attribution of one won or lost Deal: the Messages and Calls that touched the Prospect in the 180-day look-back (a proposal), with first-touch and last-touch credit side by side (firstTouchId and lastTouchId) and the Playbook sources each touch cited. Touches are one cursor-paginated page (at most 100). Ids and times only, never Message text. An open Deal, an unknown Deal or one of another Organization is request.not_found (404), never 403. Owner and Admin only."
  }),
  listSourcePerformance: inboundRoute({
    method: "GET",
    path: "/v1/analytics/source-performance",
    roles: ANALYTICS_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Moments and Document passages the Agents cited, each with the Deals it touched, the Deals won and a win rate. The win rate is shown only from 20 Deals touched, else state not_enough_data; recordCount is the Deals touched. The optional flag cited_often_lost keeps only sources cited often but correlated with lost Deals. One cursor-paginated page at a time (at most 100). Owner and Admin only; a second Organization sees nothing of the first."
  }),
  getConversationSummary: inboundRoute({
    method: "GET",
    path: "/v1/conversations/{conversationId}/summary",
    roles: ANALYTICS_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.not_found"],
    description: `Reads the short summary (at most 500 characters) and Outcome label (won, lost, open, no_response or meeting_booked) of a Conversation. The summary is model output: untrusted data, never executed. The route returns the summary only, never a Message body. ${SCOPE}`
  })
});
// src/analytics/values.ts
import { z as z30 } from "zod";

// src/inbox/values.ts
import { z as z27 } from "zod";
var INBOX_CHANNELS = ["email", "linkedin", "chat"];
var inboxChannelSchema = z27.enum(INBOX_CHANNELS);
var CONVERSATION_CONTROLLERS = ["agent", "rep"];
var conversationControllerSchema = z27.enum(CONVERSATION_CONTROLLERS);
var CONVERSATION_STATES = [
  "agent",
  "awaiting_approval",
  "rep",
  "escalated",
  "closed"
];
var conversationStateSchema = z27.enum(CONVERSATION_STATES);
var MESSAGE_DIRECTIONS = ["inbound", "outbound"];
var messageDirectionSchema = z27.enum(MESSAGE_DIRECTIONS);
var MESSAGE_AUTHOR_KINDS = ["prospect", "agent", "rep"];
var messageAuthorKindSchema = z27.enum(MESSAGE_AUTHOR_KINDS);
var REPLY_LABELS = [
  "positive",
  "question",
  "objection",
  "not_now",
  "wrong_person",
  "unsubscribe",
  "out_of_office",
  "bounce",
  "negative",
  "other"
];
var replyLabelSchema = z27.enum(REPLY_LABELS);
function toReplyLabel(value) {
  const parsed = replyLabelSchema.safeParse(value);
  return parsed.success ? parsed.data : "other";
}
var STOP_SENDING_LABELS = ["unsubscribe"];
var PAUSE_SEQUENCE_LABELS = [
  "bounce",
  "wrong_person"
];
var confidenceSchema = z27.number().min(0).max(1);
var MAX_MESSAGE_BODY_LENGTH = 20000;
var messageBodySchema = z27.string().min(1).max(MAX_MESSAGE_BODY_LENGTH).refine((text) => text.trim().length > 0, "The body is not blank").refine((text) => !hasControlCharacter2(text, true), "No control characters");
var providerMessageIdSchema = z27.string().regex(/^[\x21-\x7e]{1,255}$/);
var MAX_DECISION_NOTE_LENGTH = 500;
var decisionNoteSchema = z27.string().min(1).max(MAX_DECISION_NOTE_LENGTH).refine((text) => text.trim().length > 0, "The note is not blank").refine((text) => !hasControlCharacter2(text, true), "No control characters");
var MAX_STRATEGY_LENGTH = 300;
var MAX_DRAFT_SOURCES = 10;
var DRAFT_SOURCE_KINDS = ["moment", "document_chunk"];
var draftSourceKindSchema = z27.enum(DRAFT_SOURCE_KINDS);
var sourceRefSchema = z27.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var MAX_SOURCE_PASSAGE_LENGTH = 4000;
var DRAFT_HOLD_REASONS = [
  "policy",
  "ungrounded",
  "check_failed",
  "escalated",
  "first_message"
];
var draftHoldReasonSchema = z27.enum(DRAFT_HOLD_REASONS);
var ALWAYS_HELD_REASONS = [
  "ungrounded",
  "check_failed",
  "escalated",
  "first_message"
];
var DRAFT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "sent",
  "superseded",
  "void"
];
var draftStatusSchema = z27.enum(DRAFT_STATUSES);
var DRAFT_AUTHORS = ["agent", "rep"];
var draftAuthorSchema = z27.enum(DRAFT_AUTHORS);
var MESSAGE_FAILURE_REASONS = [
  "provider_rejected",
  "recipient_invalid",
  "suppressed",
  "channel_unavailable",
  "timeout",
  "unknown"
];
var messageFailureReasonSchema = z27.enum(MESSAGE_FAILURE_REASONS);

// src/playbook/citation.ts
import { z as z28 } from "zod";
var MAX_CITATION_REFS = 20;
var citationRefSchema = z28.discriminatedUnion("kind", [
  z28.strictObject({
    kind: z28.literal("moment"),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema
  }),
  z28.strictObject({
    kind: z28.literal("document"),
    documentId: documentIdSchema,
    page: z28.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable()
  })
]);
var resolveCitationsRequestSchema = z28.strictObject({
  refs: z28.array(citationRefSchema).min(1).max(MAX_CITATION_REFS)
});
var resolvedCitationSchema = z28.union([
  z28.object({
    state: z28.literal("available"),
    kind: z28.literal("moment"),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema,
    prospect: momentSnippetSchema,
    repNext: momentSnippetSchema
  }),
  z28.object({
    state: z28.literal("available"),
    kind: z28.literal("document"),
    documentId: documentIdSchema,
    page: z28.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
    fileName: documentFileNameSchema,
    snippet: momentSnippetSchema
  }),
  z28.object({
    state: z28.literal("removed"),
    kind: z28.literal("moment"),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema
  }),
  z28.object({
    state: z28.literal("removed"),
    kind: z28.literal("document"),
    documentId: documentIdSchema,
    page: z28.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable()
  })
]);
var resolveCitationsResponseSchema = z28.object({
  items: z28.array(resolvedCitationSchema).min(1).max(MAX_CITATION_REFS)
});
var route4 = (definition) => Object.freeze(definition);
var CITATION_ROUTES = Object.freeze({
  resolveCitations: route4({
    method: "POST",
    path: "/playbook/citations/resolve",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid", "server.timeout", "server.unavailable"],
    description: "Resolves the Citations on a Draft back to the text they point at, so a Rep sees why a sentence was written. The body is refs: one to 20 references, each a Moment (callId, dealRecordId) or a document page (documentId, page or null). It answers one item per reference, in request order. An item is state available, with the snippets of at most 512 characters (what the Prospect said and the Rep said next for a Moment; the file name and passage for a document), or state removed, with the ids only and no text, when the Call, Deal or document was deleted, is no longer searchable, never existed or belongs to another Organization; none of those is an error, so existence is not revealed. It never returns the customer's dealId, name or amount. The snippets are tenant text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the store cannot answer. Every role that reads the Playbook (Owner, Admin, Manager and Rep) may call it; any other is auth.forbidden."
  })
});

// src/playbook/deal-values.ts
import { z as z29 } from "zod";
var OUTCOMES = ["won", "lost", "open"];
var outcomeSchema = z29.enum(OUTCOMES);
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
var dealIdSchema = z29.string().max(MAX_RAW_DEAL_ID_LENGTH).transform(normaliseDealId).pipe(z29.string().min(1).max(MAX_DEAL_ID_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((id) => !hasStrippableCharacter(id), "No control or direction characters").refine((id) => !hasInvisibleCharacter(id), "No invisible characters"));
var MAX_DEAL_NAME_LENGTH = 200;
var MAX_DEAL_NAME_BYTES = MAX_DEAL_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
var dealNameSchema = z29.string().max(1000).trim().pipe(z29.string().min(1).max(MAX_DEAL_NAME_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((name) => !hasStrippableCharacter(name), "No control or direction characters"));
var dealAmountSchema = z29.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,2})?$/);
var dealCurrencySchema = z29.string().regex(/^[A-Z]{3}$/);
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
var dealImportStateSchema = z29.enum(DEAL_IMPORT_STATES);
var DEAL_IMPORT_FAILURE_REASONS = [
  "too_many_rows",
  "unreadable",
  "processing_failed"
];
var dealImportFailureReasonSchema = z29.enum(DEAL_IMPORT_FAILURE_REASONS);
var DEAL_IMPORT_ROW_RESULTS = ["applied", "rejected"];
var dealImportRowResultSchema = z29.enum(DEAL_IMPORT_ROW_RESULTS);
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
var dealImportRowReasonSchema = z29.enum(DEAL_IMPORT_ROW_REASONS);
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
var calendarDateSchema = z29.iso.date().refine(isDealCalendarDate, "A real calendar date from 1970 to 2100");
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

// src/analytics/values.ts
var ANALYTICS_METRICS = [
  "sends",
  "replies",
  "positive_replies",
  "meetings",
  "outcomes_won",
  "outcomes_lost"
];
var analyticsMetricSchema = z30.enum(ANALYTICS_METRICS);
var ANALYTICS_GROUP_BYS = ["channel", "agent_kind", "campaign", "rep"];
var analyticsGroupBySchema = z30.enum(ANALYTICS_GROUP_BYS);
var ANALYTICS_TABLE_GROUPS = ["campaign", "rep"];
var analyticsTableGroupSchema = z30.enum(ANALYTICS_TABLE_GROUPS);
var MAX_ANALYTICS_RANGE_MONTHS = 13;
var MAX_SERIES_POINTS = 400;
var MAX_SERIES_GROUPS_PER_PAGE = 20;
var MIN_RATE_SAMPLE = 20;
var MIN_SOURCE_SAMPLE = 20;
var MAX_ANALYTICS_CSV_PAGE_SIZE = 1000;
var ATTRIBUTION_LOOKBACK_DAYS = 180;
var MAX_TOUCH_SOURCES = 20;
var ANALYTICS_RANGE_ISSUE_MESSAGE = "analytics.range_too_large";
var parseDay = (day) => {
  const [y, m, d] = day.split("-").map(Number);
  return [y, m, d];
};
var lastDayOfMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
function lastAllowedAnalyticsDay(from) {
  const [year, month, day] = parseDay(from);
  const target = month - 1 + MAX_ANALYTICS_RANGE_MONTHS;
  const targetYear = year + Math.floor(target / 12);
  const targetMonth = target % 12;
  const clamped = Math.min(day, lastDayOfMonth(targetYear, targetMonth));
  const end = new Date(Date.UTC(targetYear, targetMonth, clamped) - 24 * 60 * 60 * 1000);
  return end.toISOString().slice(0, 10);
}
function isAnalyticsRangeTooLarge(from, to) {
  return from > to || to > lastAllowedAnalyticsDay(from);
}
function checkAnalyticsRange(range, ctx) {
  if (range.from !== undefined && range.to !== undefined) {
    if (isAnalyticsRangeTooLarge(range.from, range.to)) {
      ctx.addIssue({ code: "custom", path: ["to"], message: ANALYTICS_RANGE_ISSUE_MESSAGE });
    }
  }
}
var analyticsRangeShape = {
  from: calendarDateSchema,
  to: calendarDateSchema
};
var dateRangeSchema = z30.strictObject(analyticsRangeShape).superRefine((range, ctx) => checkAnalyticsRange(range, ctx));
var analyticsFilterShape = {
  channel: inboxChannelSchema.optional(),
  agentKind: agentKindSchema.optional(),
  campaignId: campaignIdSchema.optional(),
  repMembershipId: membershipIdSchema.optional()
};
var getSeriesQuerySchema = z30.object({
  metric: analyticsMetricSchema,
  groupBy: analyticsGroupBySchema.optional(),
  ...analyticsRangeShape,
  ...analyticsFilterShape,
  cursor: pageQuerySchema.shape.cursor,
  limit: z30.union([z30.number(), z30.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z30.number().int().min(1).max(MAX_SERIES_GROUPS_PER_PAGE)).default(MAX_SERIES_GROUPS_PER_PAGE)
}).superRefine((query, ctx) => checkAnalyticsRange(query, ctx));
var listTableQuerySchema = z30.object({
  groupBy: analyticsTableGroupSchema,
  ...analyticsRangeShape,
  ...analyticsFilterShape
}).extend(pageQuerySchema.shape).superRefine((query, ctx) => checkAnalyticsRange(query, ctx));
var tableCsvQuerySchema = z30.object({
  groupBy: analyticsTableGroupSchema,
  ...analyticsRangeShape,
  ...analyticsFilterShape,
  cursor: pageQuerySchema.shape.cursor,
  limit: z30.union([z30.number(), z30.string().regex(/^\d{1,4}$/)]).transform((value) => Number(value)).pipe(z30.number().int().min(1).max(MAX_ANALYTICS_CSV_PAGE_SIZE)).default(MAX_ANALYTICS_CSV_PAGE_SIZE)
}).superRefine((query, ctx) => checkAnalyticsRange(query, ctx));
var countValueSchema = z30.strictObject({
  kind: z30.literal("count"),
  value: z30.number().int().min(0),
  recordCount: z30.number().int().min(0)
});
var okRateValueSchema = z30.strictObject({
  kind: z30.literal("rate"),
  state: z30.literal("ok"),
  value: z30.number().min(0).max(1),
  recordCount: z30.number().int().min(MIN_RATE_SAMPLE)
});
var notEnoughDataRateValueSchema = z30.strictObject({
  kind: z30.literal("rate"),
  state: z30.literal("not_enough_data"),
  value: z30.null(),
  recordCount: z30.number().int().min(0).max(MIN_RATE_SAMPLE - 1)
});
var rateValueSchema = z30.union([okRateValueSchema, notEnoughDataRateValueSchema]);
var metricValueSchema = z30.union([
  countValueSchema,
  okRateValueSchema,
  notEnoughDataRateValueSchema
]);
var analyticsGroupKeySchema = z30.string().min(1).max(64).regex(/^[a-z][a-z0-9_]*$/);
var seriesPointSchema = z30.union([
  countValueSchema.extend({ day: calendarDateSchema }),
  okRateValueSchema.extend({ day: calendarDateSchema }),
  notEnoughDataRateValueSchema.extend({ day: calendarDateSchema })
]);
var seriesLineSchema = z30.strictObject({
  group: analyticsGroupKeySchema.nullable(),
  points: z30.array(seriesPointSchema).max(MAX_SERIES_POINTS)
});
var getSeriesResponseSchema = z30.strictObject({
  metric: analyticsMetricSchema,
  groupBy: analyticsGroupBySchema.nullable(),
  ...analyticsRangeShape,
  series: z30.array(seriesLineSchema).max(MAX_SERIES_GROUPS_PER_PAGE),
  nextCursor: pageSchema(z30.never()).shape.nextCursor
});
var tableRowSchema = z30.strictObject({
  group: analyticsGroupKeySchema,
  sends: countValueSchema,
  replies: countValueSchema,
  positiveReplies: countValueSchema,
  meetings: countValueSchema,
  outcomesWon: countValueSchema,
  outcomesLost: countValueSchema,
  replyRate: rateValueSchema,
  positiveReplyRate: rateValueSchema,
  winRate: rateValueSchema
});
var listTableResponseSchema = pageSchema(tableRowSchema);
var TOUCH_KINDS = ["message", "call"];
var touchShape = {
  id: touchIdSchema,
  prospectId: prospectIdSchema,
  occurredAt: timestampSchema,
  credit: z30.strictObject({ firstTouch: z30.boolean(), lastTouch: z30.boolean() }),
  sources: z30.array(citationRefSchema).max(MAX_TOUCH_SOURCES)
};
var touchSchema = z30.discriminatedUnion("kind", [
  z30.strictObject({ kind: z30.literal("message"), messageId: messageIdSchema, ...touchShape }),
  z30.strictObject({ kind: z30.literal("call"), callId: callIdSchema, ...touchShape })
]);
var ATTRIBUTION_OUTCOMES = ["won", "lost"];
var getDealAttributionQuerySchema = pageQuerySchema;
var dealAttributionSchema = z30.strictObject({
  dealRecordId: dealRecordIdSchema,
  outcome: z30.enum(ATTRIBUTION_OUTCOMES),
  lookbackDays: z30.number().int().min(1).max(366),
  firstTouchId: touchIdSchema.nullable(),
  lastTouchId: touchIdSchema.nullable(),
  touches: pageSchema(touchSchema)
});
var SOURCE_FLAGS = ["cited_often_lost"];
var sourceFlagSchema = z30.enum(SOURCE_FLAGS);
var listSourcePerformanceQuerySchema = pageQuerySchema.extend({
  flag: sourceFlagSchema.optional()
});
var sourcePerformanceSchema = z30.strictObject({
  source: citationRefSchema,
  dealsTouched: z30.number().int().min(0),
  dealsWon: z30.number().int().min(0),
  recordCount: z30.number().int().min(0),
  winRate: z30.union([
    z30.strictObject({ state: z30.literal("ok"), value: z30.number().min(0).max(1) }),
    z30.strictObject({ state: z30.literal("not_enough_data"), value: z30.null() })
  ]),
  flag: sourceFlagSchema.nullable()
}).superRefine((row, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (row.dealsWon > row.dealsTouched) {
    issue("dealsWon", "Won Deals are a part of the Deals touched");
  }
  if (row.recordCount !== row.dealsTouched) {
    issue("recordCount", "The record count is the number of Deals touched");
  }
  if (row.winRate.state === "ok" !== row.dealsTouched >= MIN_SOURCE_SAMPLE) {
    issue("winRate", "A win rate is shown only from 20 Deals touched");
  }
});
var listSourcePerformanceResponseSchema = pageSchema(sourcePerformanceSchema);
var CONVERSATION_OUTCOME_LABELS = [
  "won",
  "lost",
  "open",
  "no_response",
  "meeting_booked"
];
var conversationOutcomeLabelSchema = z30.enum(CONVERSATION_OUTCOME_LABELS);
var MAX_SUMMARY_LENGTH = 500;
var conversationSummarySchema = z30.strictObject({
  conversationId: conversationIdSchema,
  summary: z30.string().trim().min(1).max(MAX_SUMMARY_LENGTH),
  outcomeLabel: conversationOutcomeLabelSchema,
  generatedAt: timestampSchema
});
// src/apikey/errors.ts
var APIKEY_ERRORS = defineErrors("apikey", {
  not_found: { status: 404, message: "The API key was not found." },
  scope_not_allowed: {
    status: 403,
    message: "You cannot give an API key that scope or role."
  },
  revoked: { status: 401, message: "The API key was revoked or has expired." },
  invalid: { status: 401, message: "The API key is not valid." },
  rate_limited: { status: 429, message: "This API key made too many requests. Try again later." }
});
// src/apikey/routes.ts
var APIKEY_ADMIN_ROLES = ["owner", "admin"];
var KEY2 = "Requires an Idempotency-Key header: a replay answers the same result and does the work once.";
var ORG_ONLY = "Keys belong to the caller's Organization alone: a key of another Organization is apikey.not_found (404), never 403.";
var APIKEY_ROUTES = Object.freeze({
  createApiKey: inboundRoute({
    method: "POST",
    path: "/v1/api-keys",
    roles: APIKEY_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["apikey.scope_not_allowed"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Creates an API key with a name, one or more scopes (<area>:read or <area>:write, from a closed list), the highest role it may act as (default rep, never above the creator's own) and an optional expiry. The answer carries the secret, returned this once: it is never returned by any read, never logged and never put in an audit event, and only a SHA-256 hash and a display prefix are stored. A scope or role ceiling above what the creator may give is apikey.scope_not_allowed (403). ${KEY2} A replay with the same key answers 200 with the same key and secret null: the secret is not kept to be replayed, so a caller that lost the response revokes the key and makes another. Owner and Admin only. The creation is audited. ${ORG_ONLY}`
  }),
  listApiKeys: inboundRoute({
    method: "GET",
    path: "/v1/api-keys",
    roles: APIKEY_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the Organization's API keys, newest first, one cursor-paginated page at a time (at most 100), revoked keys only when asked for. Each key shows its name, display prefix, scopes, role ceiling, expiry, last use and whether it is revoked; never the secret or its hash. Owner and Admin only. ${ORG_ONLY}`
  }),
  revokeApiKey: inboundRoute({
    method: "POST",
    path: "/v1/api-keys/{apiKeyId}/revoke",
    roles: APIKEY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["apikey.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Revokes an API key at once; a repeat on a revoked key answers 200 with the same key and keeps the first revocation time. A token already minted from the key keeps working until it expires, at most 10 minutes; no new token can be minted. ${KEY2} Owner and Admin only. The revocation is audited. ${ORG_ONLY}`
  }),
  verifyApiKey: inboundRoute({
    method: "POST",
    path: "/internal/api-keys/verify",
    roles: [],
    internal: true,
    success: [200],
    idempotent: false,
    errors: ["apikey.invalid", "apikey.revoked", "apikey.rate_limited"],
    commonErrors: ["request.invalid"],
    description: "Internal, auth to core with the shared secret (ADR 0013): checks a presented key secret in constant time against the stored hash and answers the key id, Organization, scopes, role ceiling and expiry that auth puts in a short-lived token. A secret that matches no key is apikey.invalid (401); a revoked or expired key is apikey.revoked (401). The use is counted against the key; a key over its limit is apikey.rate_limited (429). The secret is never logged. It never takes an Organization from the caller."
  })
});
// src/apikey/values.ts
import { z as z31 } from "zod";
var API_KEY_AREAS = [
  "prospects",
  "consent",
  "enrichment",
  "campaigns",
  "messaging",
  "bookings",
  "playbook",
  "calls"
];
var apiKeyAreaSchema = z31.enum(API_KEY_AREAS);
var API_KEY_SCOPES = [
  "prospects:read",
  "prospects:write",
  "consent:read",
  "consent:write",
  "enrichment:read",
  "enrichment:write",
  "campaigns:read",
  "campaigns:write",
  "messaging:read",
  "messaging:write",
  "bookings:read",
  "bookings:write",
  "playbook:read",
  "playbook:write",
  "calls:read",
  "calls:write"
];
var apiKeyScopeSchema = z31.enum(API_KEY_SCOPES);
var MAX_API_KEY_NAME_LENGTH = 80;
var API_KEY_SECRET_PREFIX = "clk_";
var API_KEY_DISPLAY_PREFIX_LENGTH = 12;
var apiKeySecretSchema = z31.string().regex(/^clk_[A-Za-z0-9_-]{43}$/);
var apiKeyDisplayPrefixSchema = z31.string().regex(/^clk_[A-Za-z0-9_-]{8}$/);
var scopeListSchema = z31.array(apiKeyScopeSchema).min(1).max(API_KEY_SCOPES.length).refine((scopes) => new Set(scopes).size === scopes.length, {
  message: "Each scope appears once"
});
var createApiKeyRequestSchema = z31.strictObject({
  name: boundedTextSchema(MAX_API_KEY_NAME_LENGTH),
  scopes: scopeListSchema,
  roleCeiling: roleSchema.default("rep"),
  expiresAt: timestampSchema.nullable().default(null)
});
var apiKeySchema = z31.object({
  id: apiKeyIdSchema,
  name: boundedTextSchema(MAX_API_KEY_NAME_LENGTH),
  prefix: apiKeyDisplayPrefixSchema,
  scopes: scopeListSchema,
  roleCeiling: roleSchema,
  expiresAt: timestampSchema.nullable(),
  lastUsedAt: timestampSchema.nullable(),
  revokedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  createdByMembershipId: membershipIdSchema
});
var createApiKeyResponseSchema = apiKeySchema.extend({
  secret: apiKeySecretSchema.nullable()
});
var listApiKeysQuerySchema = pageQuerySchema.extend({
  includeRevoked: z31.union([z31.boolean(), z31.enum(["true", "false"]).transform((text) => text === "true")]).optional()
});
var listApiKeysResponseSchema = pageSchema(apiKeySchema);
var verifyApiKeyRequestSchema = z31.strictObject({ secret: apiKeySecretSchema });
var verifyApiKeyResponseSchema = z31.object({
  apiKeyId: apiKeyIdSchema,
  organizationId: organizationIdSchema,
  scopes: scopeListSchema,
  roleCeiling: roleSchema,
  expiresAt: timestampSchema.nullable()
});
// src/assessment/errors.ts
var ASSESSMENT_ERRORS = defineErrors("assessment", {
  not_found: { status: 404, message: "The Assessment was not found." }
});
// src/assessment/events.ts
import { z as z33 } from "zod";

// src/assessment/values.ts
import { z as z32 } from "zod";
var ASSESSMENT_VERDICTS = ["pass", "warn", "fail"];
var assessmentVerdictSchema = z32.enum(ASSESSMENT_VERDICTS);
var FINDING_CATEGORIES = [
  "unsupported_claim",
  "policy_deviation",
  "missing_disclosure",
  "tone"
];
var findingCategorySchema = z32.enum(FINDING_CATEGORIES);
var FINDING_SEVERITIES = ["low", "medium", "high"];
var findingSeveritySchema = z32.enum(FINDING_SEVERITIES);
var ASSESSMENT_SUBJECT_KINDS = ["draft", "call_turn"];
var FINDING_FEEDBACKS = ["correct", "false_alarm"];
var findingFeedbackSchema = z32.enum(FINDING_FEEDBACKS);
var MAX_FINDINGS = 50;
var MAX_FINDING_EXPLANATION_LENGTH = 500;
var MAX_FINDING_SPAN_OFFSET = 20000;
var MAX_FINDING_CATEGORIES = FINDING_CATEGORIES.length;
var ASSESSMENT_SORTS = ["newest", "worst_first"];
var findingSpanSchema = z32.strictObject({
  start: z32.number().int().min(0).max(MAX_FINDING_SPAN_OFFSET),
  end: z32.number().int().min(1).max(MAX_FINDING_SPAN_OFFSET)
}).refine((span) => span.end > span.start, {
  message: "A span ends after it starts",
  path: ["end"]
});
var findingSchema = z32.strictObject({
  id: findingIdSchema,
  category: findingCategorySchema,
  severity: findingSeveritySchema,
  span: findingSpanSchema,
  explanation: z32.string().trim().min(1).max(MAX_FINDING_EXPLANATION_LENGTH),
  feedback: findingFeedbackSchema.nullable()
});
var assessmentSubjectSchema = z32.discriminatedUnion("kind", [
  z32.strictObject({ kind: z32.literal("draft"), draftId: draftIdSchema }),
  z32.strictObject({
    kind: z32.literal("call_turn"),
    callId: callIdSchema,
    turnIndex: z32.number().int().min(0).max(1e5)
  })
]);
var assessmentJudgeSourceSchema = z32.enum(["model", "rules"]);
var assessmentSchema = z32.strictObject({
  id: assessmentIdSchema,
  subject: assessmentSubjectSchema,
  prospectId: prospectIdSchema.nullable(),
  agentKind: agentKindSchema,
  instructionVersion: z32.number().int().min(1).nullable(),
  verdict: assessmentVerdictSchema,
  findings: z32.array(findingSchema).max(MAX_FINDINGS),
  judgeSource: assessmentJudgeSourceSchema.optional(),
  createdAt: timestampSchema
}).superRefine((assessment, ctx) => {
  if (assessment.verdict === "pass" && assessment.findings.length > 0) {
    ctx.addIssue({ code: "custom", path: ["findings"], message: "A pass has no findings" });
  }
  if (assessment.verdict === "fail" && assessment.findings.length === 0) {
    ctx.addIssue({ code: "custom", path: ["findings"], message: "A fail has a finding" });
  }
});
var giveFindingFeedbackRequestSchema = z32.strictObject({ feedback: findingFeedbackSchema });
var listAssessmentsQuerySchema = pageQuerySchema.extend({
  verdict: assessmentVerdictSchema.optional(),
  category: findingCategorySchema.optional(),
  agentKind: agentKindSchema.optional(),
  from: analyticsRangeShape.from.optional(),
  to: analyticsRangeShape.to.optional(),
  sort: z32.enum(ASSESSMENT_SORTS).default("newest")
}).superRefine((query, ctx) => {
  if (query.from === undefined !== (query.to === undefined)) {
    ctx.addIssue({ code: "custom", path: ["to"], message: "Give both from and to, or neither" });
  }
  checkAnalyticsRange(query, ctx);
});
var listAssessmentsResponseSchema = pageSchema(assessmentSchema);
var getAssessmentRatesQuerySchema = z32.object({ ...analyticsRangeShape, agentKind: agentKindSchema.optional() }).extend(pageQuerySchema.shape).superRefine((query, ctx) => checkAnalyticsRange(query, ctx));
var isoWeekSchema = z32.string().regex(/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/);
var rateItem = {
  week: isoWeekSchema,
  weekStart: calendarDateSchema,
  agentKind: agentKindSchema,
  instructionVersion: z32.number().int().min(1).nullable()
};
var assessmentRateItemSchema = z32.union([
  rateValueSchema.options[0].extend(rateItem),
  rateValueSchema.options[1].extend(rateItem)
]);
var getAssessmentRatesResponseSchema = z32.strictObject({
  ...analyticsRangeShape,
  ...pageSchema(assessmentRateItemSchema).shape
});

// src/assessment/events.ts
var assessmentCompletedEvent = defineEvent("assessment.completed", 1, z33.strictObject({
  assessmentId: assessmentIdSchema,
  subject: assessmentSubjectSchema,
  prospectId: prospectIdSchema.nullable(),
  agentKind: agentKindSchema,
  instructionVersion: z33.number().int().min(1).nullable(),
  verdict: assessmentVerdictSchema,
  findingCount: z33.number().int().min(0).max(MAX_FINDINGS),
  categories: z33.array(findingCategorySchema).max(MAX_FINDING_CATEGORIES),
  completedAt: timestampSchema
}).superRefine((data, ctx) => {
  if (new Set(data.categories).size !== data.categories.length) {
    ctx.addIssue({ code: "custom", path: ["categories"], message: "Categories are unique" });
  }
  if (data.findingCount === 0 !== (data.categories.length === 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["categories"],
      message: "Categories are listed exactly when there are findings"
    });
  }
  if (data.verdict === "pass" && data.findingCount > 0) {
    ctx.addIssue({ code: "custom", path: ["findingCount"], message: "A pass has no findings" });
  }
  if (data.verdict === "fail" && data.findingCount === 0) {
    ctx.addIssue({ code: "custom", path: ["findingCount"], message: "A fail has a finding" });
  }
}));
var ASSESSMENT_EVENTS = {
  "assessment.completed": assessmentCompletedEvent
};
// src/assessment/routes.ts
var ASSESSMENT_READ_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var ASSESSMENT_ADMIN_ROLES = ["owner", "admin"];
var NO_TEXT = "A finding holds a category, a severity, a character span and a short explanation, never the text of the Draft or the Call turn.";
var ASSESSMENT_ROUTES = Object.freeze({
  listAssessments: inboundRoute({
    method: "GET",
    path: "/v1/assessments",
    roles: ["owner", "admin", "manager"],
    success: [200],
    idempotent: false,
    errors: ["analytics.range_too_large"],
    commonErrors: ["request.invalid"],
    description: `Lists Assessments, one cursor-paginated page at a time (at most 100), filtered by verdict, finding category, Agent kind and a date range (from and to together, at most 13 months, else analytics.range_too_large (422)). sort=newest (the default) or worst_first, which puts flagged turns first by severity. Owner and Admin see all; a Manager only those of their Team's Prospects; a Rep none here (auth.forbidden) and reads the Assessment of a Draft they can see with getAssessment. ${NO_TEXT}`
  }),
  getAssessment: inboundRoute({
    method: "GET",
    path: "/v1/assessments/{assessmentId}",
    roles: ASSESSMENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["assessment.not_found"],
    commonErrors: [],
    description: `Reads one Assessment with its findings. The service enforces the view: a Rep may read only the Assessment of a Draft they can see (their own Prospects'), a Manager their Team's. One outside the caller's view, or of another Organization, is assessment.not_found (404), never 403. ${NO_TEXT}`
  }),
  giveFindingFeedback: inboundRoute({
    method: "POST",
    path: "/v1/assessments/{assessmentId}/findings/{findingId}/feedback",
    roles: ASSESSMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["assessment.not_found"],
    commonErrors: [
      "request.invalid",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: "Marks a finding correct or a false alarm, so the checks can be measured. The body is feedback: correct or false_alarm. Setting the same value again changes nothing, and a different value replaces the last. Answers the finding. An unknown finding or Assessment, or one of another Organization, is assessment.not_found (404), never 403. Owner and Admin only. Accepts an Idempotency-Key header."
  }),
  getAssessmentRates: inboundRoute({
    method: "GET",
    path: "/v1/assessment-rates",
    roles: ASSESSMENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["analytics.range_too_large"],
    commonErrors: ["request.invalid"],
    description: "Reads the weekly rate of failed Assessments, per ISO week, Agent kind and instruction version, so an Admin sees whether a change helped. Each item carries recordCount, the Assessments judged that week; below 20 the state is not_enough_data with a null value. The range (from, to) spans at most 13 calendar months, else analytics.range_too_large (422). One cursor-paginated page at a time (at most 100 items). Owner and Admin only."
  })
});
// src/audit/errors.ts
var AUDIT_ERRORS = defineErrors("audit", {
  range_too_large: {
    status: 422,
    message: "The time range is too large. Ask for 366 days or fewer."
  },
  event_not_found: { status: 404, message: "The audit event was not found." }
});
// src/audit/events.ts
import { z as z35 } from "zod";

// src/audit/values.ts
import { z as z34 } from "zod";
var AUDIT_ACTOR_KINDS = ["member", "agent", "api_key", "system"];
var auditActorKindSchema = z34.enum(AUDIT_ACTOR_KINDS);
var auditActorSchema = z34.discriminatedUnion("kind", [
  z34.object({ kind: z34.literal("member"), membershipId: membershipIdSchema }),
  z34.object({ kind: z34.literal("agent"), agentKind: z34.enum(AGENT_KINDS) }),
  z34.object({ kind: z34.literal("api_key"), apiKeyId: apiKeyIdSchema }),
  z34.object({ kind: z34.literal("system") })
]);
var strictAuditActorSchema = z34.discriminatedUnion("kind", [
  z34.strictObject({ kind: z34.literal("member"), membershipId: membershipIdSchema }),
  z34.strictObject({ kind: z34.literal("agent"), agentKind: z34.enum(AGENT_KINDS) }),
  z34.strictObject({ kind: z34.literal("api_key"), apiKeyId: apiKeyIdSchema }),
  z34.strictObject({ kind: z34.literal("system") })
]);
var auditActionSchema = z34.string().max(100).regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/);
var auditSubjectTypeSchema = z34.string().max(40).regex(/^[a-z][a-z0-9_]*$/);
var auditSubjectIdSchema = z34.string().max(64).regex(/^[a-z][a-z0-9_]*_[0-9a-f]{32}$/);
var auditSubjectSchema = z34.object({
  type: auditSubjectTypeSchema,
  id: auditSubjectIdSchema
});
var strictAuditSubjectSchema = z34.strictObject({
  type: auditSubjectTypeSchema,
  id: auditSubjectIdSchema
});
var MAX_AUDIT_METADATA_KEYS = 20;
var MAX_AUDIT_METADATA_VALUE_LENGTH = 200;
var FORBIDDEN_AUDIT_METADATA_WORDS = [
  "body",
  "text",
  "message",
  "content",
  "transcript",
  "recording",
  "secret",
  "token",
  "password",
  "html"
];
var keyWords = (key) => key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
var auditMetadataKeySchema = z34.string().max(40).regex(/^[a-z][A-Za-z0-9_]*$/).refine((key) => {
  const squashed = keyWords(key).join("");
  return !FORBIDDEN_AUDIT_METADATA_WORDS.some((word) => squashed.includes(word));
}, { message: "A metadata key may not name free text, a recording or a secret" });
var auditMetadataValueSchema = z34.union([
  z34.string().max(MAX_AUDIT_METADATA_VALUE_LENGTH).refine((value) => ![...value].some((c) => (c.codePointAt(0) ?? 0) < 32 || c === ""), "No control characters"),
  z34.number().finite(),
  z34.boolean(),
  z34.null()
]);
var auditMetadataSchema = z34.record(auditMetadataKeySchema, auditMetadataValueSchema).refine((metadata) => Object.keys(metadata).length <= MAX_AUDIT_METADATA_KEYS, {
  message: `At most ${MAX_AUDIT_METADATA_KEYS} metadata entries`
});
var auditContent = (actor, subject) => ({
  occurredAt: timestampSchema,
  actor,
  action: auditActionSchema,
  subject: subject.nullable(),
  prospectId: prospectIdSchema.nullable(),
  instructionVersion: z34.number().int().min(1).nullable(),
  requestId: requestIdSchema.nullable(),
  metadata: auditMetadataSchema
});
var auditContentShape = auditContent(auditActorSchema, auditSubjectSchema);
var strictAuditContentShape = auditContent(strictAuditActorSchema, strictAuditSubjectSchema);
var auditHashSchema = z34.string().regex(/^[0-9a-f]{64}$/);
var auditEventSchema = z34.object({
  id: auditEventIdSchema,
  sequence: z34.number().int().min(1),
  ...auditContentShape,
  previousHash: auditHashSchema.nullable(),
  hash: auditHashSchema
});
var MAX_AUDIT_RANGE_DAYS = 366;
var MAX_AUDIT_CSV_PAGE_SIZE = 1000;
var MAX_AUDIT_VERIFY_COUNT = 1000;
var filterShape = {
  actorKind: auditActorKindSchema.optional(),
  actorId: z34.string().max(64).regex(/^[a-z][a-z0-9_]*$/).optional(),
  action: auditActionSchema.optional(),
  subjectType: auditSubjectTypeSchema.optional(),
  subjectId: auditSubjectIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
};
var auditFilterSchema = z34.object(filterShape).refine((filter) => {
  if (!filter.from || !filter.to) {
    return true;
  }
  return Date.parse(filter.from) <= Date.parse(filter.to);
}, { message: "from is not after to", path: ["from"] });
var listAuditEventsQuerySchema = pageQuerySchema.extend(filterShape);
var listAuditEventsResponseSchema = pageSchema(auditEventSchema);
var auditCsvQuerySchema = z34.object({
  ...filterShape,
  cursor: pageQuerySchema.shape.cursor,
  limit: z34.union([z34.number(), z34.string().regex(/^\d{1,4}$/)]).transform((value) => Number(value)).pipe(z34.number().int().min(1).max(MAX_AUDIT_CSV_PAGE_SIZE)).default(MAX_AUDIT_CSV_PAGE_SIZE)
});
var verifyAuditQuerySchema = z34.object({
  fromSequence: z34.union([z34.number(), z34.string().regex(/^\d{1,12}$/)]).transform((value) => Number(value)).pipe(z34.number().int().min(1)).default(1),
  count: z34.union([z34.number(), z34.string().regex(/^\d{1,4}$/)]).transform((value) => Number(value)).pipe(z34.number().int().min(1).max(MAX_AUDIT_VERIFY_COUNT)).default(MAX_AUDIT_VERIFY_COUNT)
});
var verifyAuditResponseSchema = z34.object({
  checked: z34.number().int().min(0).max(MAX_AUDIT_VERIFY_COUNT),
  firstBrokenSequence: z34.number().int().min(1).nullable(),
  nextSequence: z34.number().int().min(1).nullable()
});

// src/audit/events.ts
var auditRecordedEvent = defineEvent("audit.recorded", 1, z35.strictObject({
  auditEventId: auditEventIdSchema,
  ...strictAuditContentShape
}));
var AUDIT_EVENTS = {
  "audit.recorded": auditRecordedEvent
};
// src/audit/routes.ts
var AUDIT_READ_ROLES = ["owner", "admin", "manager"];
var AUDIT_ADMIN_ROLES = ["owner", "admin"];
var NO_WRITE = "There is no route to write, change or delete an event: services record them through the audit.recorded event, and core writes its own.";
var RANGE2 = "The time range (from, to) spans at most 366 days, else audit.range_too_large (422).";
var NO_TEXT2 = "An event holds ids and labels only: never Message text, recordings, secrets or free text.";
var AUDIT_ROUTES = Object.freeze({
  listAuditEvents: inboundRoute({
    method: "GET",
    path: "/v1/audit-events",
    roles: AUDIT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["audit.range_too_large"],
    commonErrors: ["request.invalid"],
    description: `Lists audit events, newest first, one cursor-paginated page at a time (at most 100), filtered by actor kind and id, action, subject, Prospect and time. ${RANGE2} An Owner or Admin sees every event; a Manager only events about Prospects owned by Reps on their Team; a Rep none (auth.forbidden). Each event names its actor (member, agent, api_key or system), the instruction version it ran under, the request id and its place in the hash chain. ${NO_TEXT2} ${NO_WRITE}`
  }),
  getAuditEvent: inboundRoute({
    method: "GET",
    path: "/v1/audit-events/{auditEventId}",
    roles: AUDIT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["audit.event_not_found"],
    commonErrors: [],
    description: "Reads one audit event. An event outside the caller's view, or of another Organization, is audit.event_not_found (404), never 403. Owner and Admin see every event; a Manager only those about their Team's Prospects."
  }),
  downloadAuditCsv: inboundRoute({
    method: "GET",
    path: "/v1/audit-csv",
    roles: AUDIT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["audit.range_too_large"],
    commonErrors: ["request.invalid"],
    description: `Downloads the filtered log as text/csv, oldest first, one cursor-paginated page at a time (at most 1,000 rows); the next cursor is in the x-next-cursor response header, absent on the last page. The filters are those of the list. ${RANGE2} Cells that start with =, +, - or @ are escaped so a spreadsheet does not run them. Owner and Admin only. The download is itself audited. ${NO_TEXT2}`
  }),
  verifyAuditLog: inboundRoute({
    method: "GET",
    path: "/v1/audit-verification",
    roles: AUDIT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Checks that the hash chain has not been altered, from a sequence number for at most 1,000 events per call, so the work does not grow with the log. Answers how many events were checked, the first sequence whose hash or link is wrong (null when intact) and where to continue (null at the end). A caller walks the log with nextSequence. Owner and Admin only."
  })
});
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
import { z as z36 } from "zod";
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
var returnToSchema = z36.string().refine((path) => path.length <= MAX_RETURN_TO_LENGTH, "Within the length limit").refine((path) => isLocalPath(path, true), "A path on this site").refine((path) => {
  try {
    return isLocalPath(decodeURIComponent(path), false);
  } catch {
    return false;
  }
}, "A path on this site");
var googleIntentSchema = z36.enum(["sign_in", "sign_up"]);
var googleStartRequestSchema = z36.strictObject({
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
var authorizationUrlSchema = z36.string().max(MAX_AUTHORIZATION_URL_LENGTH).refine(isAuthorizationUrl, "An https URL, or http to a loopback host");
var googleStartResponseSchema = z36.strictObject({
  authorizationUrl: authorizationUrlSchema
});
var attemptIdSchema = z36.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
var GOOGLE_SIGN_UP_PATH = "/sign-up/google";
var GOOGLE_SIGN_UP_ATTEMPT_PARAM = "attempt";
var GOOGLE_ERROR_PATH = "/sign-in";
var GOOGLE_ERROR_PARAM = "error";
var OIDC_COOKIE_BASE_NAME = "tula_oidc";
var OIDC_COOKIE_SECURE_PREFIX = "__Secure-";
var googleSignUpQuerySchema = z36.strictObject({
  [GOOGLE_SIGN_UP_ATTEMPT_PARAM]: attemptIdSchema
});
var googleErrorQuerySchema = z36.strictObject({
  [GOOGLE_ERROR_PARAM]: errorCodeSchema
});
var storable = (text) => !text.includes(String.fromCharCode(0)) && !hasUnsafeCharacter(text);
var googleCompleteRequestSchema = z36.strictObject({
  attemptId: attemptIdSchema,
  organizationName: z36.string().trim().min(1).max(120).refine(storable, "Storable text").optional(),
  invitationToken: z36.string().min(1).max(512).refine(storable, "Storable text").optional()
}).refine((body) => body.organizationName === undefined !== (body.invitationToken === undefined), {
  message: "Send exactly one of organizationName and invitationToken.",
  path: ["organizationName"]
});
var browserSessionTokensSchema = z36.strictObject({
  sessionId: z36.string().min(1).max(128),
  accessToken: z36.string().min(1).max(4096),
  accessTokenExpiresAt: timestampSchema,
  organization: z36.strictObject({ id: z36.string().min(1).max(128), role: roleSchema }),
  userId: userIdSchema.optional()
});
var googleCompleteResponseSchema = z36.object({
  id: z36.string().min(1).max(128),
  kind: z36.enum(["sign_in", "sign_up"]),
  expiresAt: timestampSchema,
  step: z36.object({ status: z36.literal("complete") }),
  session: browserSessionTokensSchema
});
var authProvidersSchema = z36.object({ google: z36.boolean().default(false) });
var AUTH_OPTIONS_PATH = "/v1/client/auth-options";
var authOptionsResponseSchema = z36.object({
  providers: authProvidersSchema.default({ google: false })
});
var route5 = (definition) => Object.freeze(definition);
var AUTH_OPTIONS_ROUTE = route5({
  method: "GET",
  path: AUTH_OPTIONS_PATH,
  success: [200],
  errors: [],
  redirectErrors: [],
  commonErrors: ["rate.limited", "server.unavailable"],
  description: "Tells a client which sign-in providers are on, so the portal can hide the Continue with Google button when Google is not set up. The auth service owns this route; it is a new route, not a change to an existing one. It needs no session and returns nothing about any account."
});
var GOOGLE_ROUTES = Object.freeze({
  start: route5({
    method: "POST",
    path: "/v1/client/google/start",
    success: [200],
    errors: ["oidc.disabled", "oidc.provider_unavailable"],
    redirectErrors: [],
    commonErrors: ["request.invalid", "rate.limited", "server.unavailable"],
    description: "Starts a Sign in with Google with an intent (sign_in or sign_up) and an optional same-origin returnTo path. It runs the OpenID Connect authorization-code flow with PKCE (S256), a state and a nonce, keeps them in an attempt that lives 10 minutes, sets a short-lived attempt cookie (named tula_oidc, with the __Secure- prefix outside local only, because Safari refuses a __Secure- cookie over http even on loopback) that holds the attempt secret, and answers the authorizationUrl to send the browser to (https, or http to a loopback host in local development; a consumer also checks its host against an allow-list). It asks for openid, email and profile only, with no offline access. The returnTo is checked against the portal route allow-list and kept in the attempt; it is never read from the callback. oidc.disabled (404) when Google is not set up; oidc.provider_unavailable (503) with a Retry-After header when Google cannot be reached."
  }),
  callback: route5({
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
  complete: route5({
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
// src/booking/booking.ts
import { z as z37 } from "zod";
var DAY_MS = 86400000;
var withinRange = (query) => {
  const span = Date.parse(query.to) - Date.parse(query.from);
  return span > 0 && span <= MAX_SLOT_RANGE_DAYS * DAY_MS;
};
var RANGE_MESSAGE = `The range is after its start and at most ${MAX_SLOT_RANGE_DAYS} days`;
var bookingSchema = z37.strictObject({
  id: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  state: bookingStateSchema,
  origin: bookingOriginSchema,
  joinUrl: joinUrlSchema.nullable(),
  routingDecisionId: routingDecisionIdSchema.nullable(),
  createdAt: timestampSchema,
  cancelledAt: timestampSchema.nullable()
}).refine((booking) => Date.parse(booking.endsAt) > Date.parse(booking.startsAt), {
  message: "A Booking ends after it starts",
  path: ["endsAt"]
}).refine((booking) => booking.state === "cancelled" === (booking.cancelledAt !== null), {
  message: "Only a cancelled Booking has a cancellation time",
  path: ["cancelledAt"]
}).refine((booking) => booking.mode === "video" || booking.joinUrl === null, {
  message: "Only a video Booking has a join link",
  path: ["joinUrl"]
});
var bookingParamsSchema = z37.strictObject({ bookingId: bookingIdSchema });
var listSlotsQuerySchema = pageQuerySchema.extend({
  bookingTypeId: bookingTypeIdSchema,
  prospectId: prospectIdSchema,
  from: timestampSchema,
  to: timestampSchema
}).strict().refine(withinRange, { message: RANGE_MESSAGE, path: ["to"] });
var slotSchema = z37.strictObject({
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  repMembershipId: membershipIdSchema
});
var slotPageSchema = pageSchema(slotSchema);
var bookHeadersSchema = z37.object({ "idempotency-key": idempotencyKeySchema });
var bookRequestSchema = z37.strictObject({
  bookingTypeId: bookingTypeIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  repMembershipId: membershipIdSchema.optional()
});
var rescheduleBookingRequestSchema = z37.strictObject({ startsAt: timestampSchema });
var bookingCursorSchema = z37.strictObject({
  startsAt: timestampSchema,
  id: bookingIdSchema
});
var listBookingsQuerySchema = pageQuerySchema.extend({
  state: bookingStateSchema.optional(),
  repMembershipId: membershipIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from), {
  message: "The range ends after it starts",
  path: ["to"]
});
var bookingPageSchema = pageSchema(bookingSchema);
var publicBookingParamsSchema = z37.strictObject({ token: bookingLinkTokenSchema });
var publicListSlotsQuerySchema = pageQuerySchema.extend({ from: timestampSchema, to: timestampSchema }).strict().refine(withinRange, { message: RANGE_MESSAGE, path: ["to"] });
var publicSlotSchema = z37.strictObject({
  startsAt: timestampSchema,
  endsAt: timestampSchema
});
var publicBookingTypeSchema = z37.strictObject({
  name: z37.string().min(1).max(100),
  lengthMinutes: z37.number().int().min(5).max(480),
  mode: bookingModeSchema
});
var publicSlotPageSchema = pageSchema(publicSlotSchema).extend({
  bookingType: publicBookingTypeSchema
});
var MAX_PUBLIC_BOOKING_FIELD_LENGTH = 200;
var publicBookRequestSchema = z37.strictObject({
  name: personNameSchema,
  email: emailSchema,
  startsAt: timestampSchema,
  timeZone: timeZoneSchema,
  website: z37.string().max(MAX_PUBLIC_BOOKING_FIELD_LENGTH).default("")
});
var publicBookingConfirmationSchema = z37.strictObject({
  id: bookingIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  joinUrl: joinUrlSchema.nullable()
});
// src/booking/booking-type.ts
import { z as z38 } from "zod";
var MAX_BOOKING_LENGTH_MINUTES = 480;
var MAX_BOOKING_BUFFER_MINUTES = 120;
var MAX_BOOKING_NOTICE_MINUTES = 43200;
var bookingTypeFields = {
  name: bookingNameSchema,
  lengthMinutes: z38.number().int().min(5).max(MAX_BOOKING_LENGTH_MINUTES),
  bufferBeforeMinutes: z38.number().int().min(0).max(MAX_BOOKING_BUFFER_MINUTES),
  bufferAfterMinutes: z38.number().int().min(0).max(MAX_BOOKING_BUFFER_MINUTES),
  minimumNoticeMinutes: z38.number().int().min(0).max(MAX_BOOKING_NOTICE_MINUTES),
  mode: bookingModeSchema
};
var bookingTypeSchema = z38.strictObject({
  id: bookingTypeIdSchema,
  ...bookingTypeFields,
  state: bookingTypeStateSchema,
  publicToken: bookingLinkTokenSchema.nullable(),
  createdAt: timestampSchema
});
var createBookingTypeRequestSchema = z38.strictObject(bookingTypeFields);
var updateBookingTypeRequestSchema = z38.strictObject({
  name: bookingTypeFields.name.optional(),
  lengthMinutes: bookingTypeFields.lengthMinutes.optional(),
  bufferBeforeMinutes: bookingTypeFields.bufferBeforeMinutes.optional(),
  bufferAfterMinutes: bookingTypeFields.bufferAfterMinutes.optional(),
  minimumNoticeMinutes: bookingTypeFields.minimumNoticeMinutes.optional(),
  mode: bookingTypeFields.mode.optional()
}).refine((body) => Object.values(body).some((v) => v !== undefined), {
  message: "Change at least one field"
});
var bookingTypeParamsSchema = z38.strictObject({ bookingTypeId: bookingTypeIdSchema });
var bookingTypeCursorSchema = z38.strictObject({
  createdAt: timestampSchema,
  id: bookingTypeIdSchema
});
var listBookingTypesQuerySchema = pageQuerySchema.extend({ state: bookingTypeStateSchema.optional() }).strict();
// src/booking/errors.ts
var BOOKING_ERRORS = {
  ...defineErrors("booking", {
    slot_taken: { status: 409, message: "That time was just taken. Pick another." },
    calendar_unavailable: {
      status: 503,
      message: "The calendar is not available right now. Try again shortly."
    },
    no_eligible_rep: { status: 409, message: "No Rep is available for this Prospect." },
    slot_invalid: { status: 422, message: "That time cannot be booked." },
    type_invalid: { status: 422, message: "The Booking Type is not valid." },
    type_not_found: { status: 404, message: "The Booking Type was not found." },
    not_found: { status: 404, message: "The Booking was not found." },
    not_active: { status: 409, message: "The Booking was cancelled." }
  }),
  ...defineErrors("routing", {
    rule_invalid: { status: 422, message: "The Routing Rule is not valid." },
    rule_not_found: { status: 404, message: "The Routing Rule was not found." }
  }),
  ...defineErrors("calendar", {
    not_connected: { status: 404, message: "No calendar is connected." },
    authorization_failed: {
      status: 422,
      message: "The calendar could not be connected. Start again."
    },
    hours_invalid: { status: 422, message: "The working hours are not valid." }
  })
};
// src/booking/events.ts
import { z as z39 } from "zod";
var ordered = (data) => Date.parse(data.endsAt) > Date.parse(data.startsAt);
var ORDER_ISSUE = { message: "A Booking ends after it starts", path: ["endsAt"] };
var bookingCreatedEvent = defineEvent("booking.created", 1, z39.strictObject({
  bookingId: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  origin: bookingOriginSchema,
  routingDecisionId: routingDecisionIdSchema.nullable()
}).refine(ordered, ORDER_ISSUE));
var BOOKING_CANCELLED_BY = ["member", "prospect", "system"];
var bookingCancelledBySchema = z39.enum(BOOKING_CANCELLED_BY);
var bookingCancelledEvent = defineEvent("booking.cancelled", 1, z39.strictObject({
  bookingId: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  cancelledBy: bookingCancelledBySchema,
  cancelledAt: timestampSchema
}).refine(ordered, ORDER_ISSUE));
var bookingRescheduledEvent = defineEvent("booking.rescheduled", 1, z39.strictObject({
  bookingId: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  previousStartsAt: timestampSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema
}).refine(ordered, ORDER_ISSUE));
var BOOKING_EVENTS = {
  "booking.created": bookingCreatedEvent,
  "booking.cancelled": bookingCancelledEvent,
  "booking.rescheduled": bookingRescheduledEvent
};
// src/booking/routes.ts
var BOOKING_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var BOOKING_ADMIN_ROLES = ["owner", "admin"];
var ROUTING_ROLES = ["owner", "admin", "manager"];
var route6 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS2 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var PUBLIC_ERRORS2 = [
  "request.too_large",
  "request.unsupported_media_type",
  "request.invalid",
  "rate.limited",
  "server.internal",
  "server.unavailable",
  "server.timeout"
];
var BOOKING_VISIBILITY = "Visibility is decided from the token: a Rep sees the Bookings they take, a Manager those of the Reps on their Team, Owner and Admin every Booking; anything else is booking.not_found (404), as is a Booking of another Organization.";
var RULE_ROLES = "A Manager may change only rules whose target is a Rep or Team they manage, or a pool of such Reps; any other rule is routing.rule_not_found (404). A rule of another Organization is routing.rule_not_found.";
var BOOKING_ROUTES = Object.freeze({
  startCalendarConnection: route6({
    method: "POST",
    path: "/v1/calendar-connection/start",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Starts connecting the caller's own calendar and answers the vendor's consent URL and a one-time state. The redirect address is core's own and never comes from the request. A caller connects only their own calendar; there is no route to connect another member's."
  }),
  completeCalendarConnection: route6({
    method: "POST",
    path: "/v1/calendar-connection/complete",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["calendar.authorization_failed"],
    commonErrors: ["request.invalid"],
    description: "Completes the caller's Calendar Connection with the state and the one-time code the vendor returned. The tokens are stored encrypted and are never returned or logged. A refused grant or a wrong or expired state is calendar.authorization_failed (422). Answers the connection, healthy."
  }),
  getCalendarConnection: route6({
    method: "GET",
    path: "/v1/calendar-connection",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["calendar.not_connected"],
    commonErrors: [],
    description: "Reads the caller's own Calendar Connection: healthy, or needs_reconnect when the grant was revoked. No token is returned. A caller with no connection gets calendar.not_connected (404); no route reads another member's connection."
  }),
  disconnectCalendarConnection: route6({
    method: "DELETE",
    path: "/v1/calendar-connection",
    roles: BOOKING_ALL_ROLES,
    success: [204],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Disconnects the caller's own calendar: the grant is revoked and the stored tokens are deleted. Idempotent by end state: disconnecting a calendar that is not connected answers 204 as well. Future Bookings on the calendar stay."
  }),
  getAvailability: route6({
    method: "GET",
    path: "/v1/availability",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the caller's own availability: time zone, working hours, daily cap and away-until time."
  }),
  setAvailability: route6({
    method: "PUT",
    path: "/v1/availability",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["calendar.hours_invalid"],
    commonErrors: ["request.invalid"],
    description: "Replaces the caller's own availability. An unknown time zone is calendar.hours_invalid (422). Setting what is already set answers 200 unchanged. A caller sets only their own; an Admin cannot set another member's."
  }),
  listBookingTypes: route6({
    method: "GET",
    path: "/v1/booking-types",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Booking Types, one cursor-paginated page at a time (at most 100); optionally one state. Every role may read them. The public token is shown to Owner and Admin only and is null for everyone else."
  }),
  createBookingType: route6({
    method: "POST",
    path: "/v1/booking-types",
    roles: BOOKING_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["booking.type_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Creates a Booking Type: name, length (5 to 480 minutes), buffers, minimum notice and mode (phone or video). Core makes the unguessable public token. A length, buffer or notice core refuses is booking.type_invalid (422). Owner and Admin only. Answers 201, or 200 with the original Booking Type for a replay of the same Idempotency-Key."
  }),
  getBookingType: route6({
    method: "GET",
    path: "/v1/booking-types/{bookingTypeId}",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:read" },
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Booking Type. The public token is shown to Owner and Admin only. A Booking Type of another Organization is booking.type_not_found (404)."
  }),
  updateBookingType: route6({
    method: "PATCH",
    path: "/v1/booking-types/{bookingTypeId}",
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found", "booking.type_invalid"],
    commonErrors: ["request.invalid"],
    description: "Changes any of the fields of a Booking Type; at least one. Bookings already made keep their time. Owner and Admin only."
  }),
  retireBookingType: route6({
    method: "POST",
    path: "/v1/booking-types/{bookingTypeId}/retire",
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found"],
    commonErrors: ["request.invalid"],
    description: "Retires a Booking Type: it can no longer be booked and its public link stops answering, but its Bookings stay. Idempotent by end state: retiring a retired Booking Type answers 200 with it. Takes no body. Owner and Admin only."
  }),
  listRoutingRules: route6({
    method: "GET",
    path: "/v1/routing-rules",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Routing Rules in the order they are tried, one cursor-paginated page at a time (at most 100). Owner, Admin and Manager; a Manager sees every rule but may change only those that target their own Team."
  }),
  createRoutingRule: route6({
    method: "POST",
    path: "/v1/routing-rules",
    roles: ROUTING_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["routing.rule_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: `Creates a Routing Rule: conditions (country, region, company size band, named-account owner, source, Booking Type), and a target of one Rep, a Team in round-robin or a pool of 2 to 20 Reps. It goes last, before the default rule if there is one. A target, Rep or Booking Type that is not in the Organization, a target that is not a Rep, or a second default rule is routing.rule_invalid (422). ${RULE_ROLES} Answers 201, or 200 with the original rule for a replay of the same Idempotency-Key.`
  }),
  getRoutingRule: route6({
    method: "GET",
    path: "/v1/routing-rules/{ruleId}",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["routing.rule_not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Routing Rule. A rule of another Organization is routing.rule_not_found (404)."
  }),
  updateRoutingRule: route6({
    method: "PUT",
    path: "/v1/routing-rules/{ruleId}",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["routing.rule_not_found", "routing.rule_invalid"],
    commonErrors: ["request.invalid"],
    description: `Replaces a Routing Rule's name, conditions, target and default flag; its place in the order stays. ${RULE_ROLES} A change that makes the rule invalid is routing.rule_invalid (422).`
  }),
  deleteRoutingRule: route6({
    method: "DELETE",
    path: "/v1/routing-rules/{ruleId}",
    roles: ROUTING_ROLES,
    success: [204],
    idempotent: false,
    errors: ["routing.rule_not_found"],
    commonErrors: ["request.invalid"],
    description: `Deletes a Routing Rule; decisions already stored keep naming it. Idempotent by end state for a rule the caller may change: deleting a rule already gone answers 204. ${RULE_ROLES}`
  }),
  reorderRoutingRules: route6({
    method: "POST",
    path: "/v1/routing-rules/reorder",
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["routing.rule_invalid"],
    commonErrors: ["request.invalid"],
    description: "Sets the order of every Routing Rule from a list of all their ids, once each, first to last. A list that misses a rule, names an unknown one or puts the default rule anywhere but last is routing.rule_invalid (422). Answers 200 with the first page of rules in the new order. Owner and Admin only."
  }),
  testRouting: route6({
    method: "POST",
    path: "/v1/routing-rules/test",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Tests the Routing Rules with a sample Prospect (its country, region, company size band, account owner and source) and optionally a Booking Type. Answers which rule wins, the candidate Reps in order with a reason each, and the Reps skipped with why. Nothing is stored, no round-robin state advances and nobody is notified; the answer has no decision id."
  }),
  route: route6({
    method: "POST",
    path: "/v1/routing/route",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Routes a Prospect: reads its attributes and answers the ordered candidate Reps with a reason each, and the Reps skipped (off shift, on leave, at the daily cap, calendar not connected or needing reconnection) with why. The decision is stored and its id answered. Also gives a Handoff its live-transfer candidates in order. A prospectId the caller may not see is prospect.not_found. An empty candidate list is a 200; booking answers booking.no_eligible_rep."
  }),
  listSlots: route6({
    method: "GET",
    path: "/v1/booking-slots",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:read" },
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found", "booking.no_eligible_rep", "prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists free times for a Booking Type and a Prospect, earliest first, one cursor-paginated page at a time (at most 100). The range is at most 14 days and at most 20 Reps are considered. Each time names the Rep who would take it. Times are read from stored busy blocks, working hours and Bookings; the live calendar is not called. Routing finding nobody is booking.no_eligible_rep (409). This is also the route the Inbound Agent uses."
  }),
  book: route6({
    method: "POST",
    path: "/v1/bookings",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:write" },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "booking.slot_taken",
      "booking.calendar_unavailable",
      "booking.no_eligible_rep",
      "booking.slot_invalid",
      "booking.type_not_found",
      "prospect.not_found"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Books a time for a Prospect. The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Booking and writes the calendar once; the same key with another body is request.idempotency_key_reused. Core locks the Rep's slot, re-checks the live calendar, stores the Booking pending, writes the event and confirms it. A time taken meanwhile is booking.slot_taken (409); a calendar that cannot be read or written in time is booking.calendar_unavailable (503) with the Booking removed and nothing half-written, and a retry with the same key is safe; routing finding nobody is booking.no_eligible_rep (409); a start in the past, inside the minimum notice or past 14 days is booking.slot_invalid (422). Publishes booking.created. Answers 201, or 200 for a replay."
  }),
  listBookings: route6({
    method: "GET",
    path: "/v1/bookings",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Bookings, latest start first, one cursor-paginated page at a time (at most 100). Filters: state, repMembershipId, prospectId and a start range. ${BOOKING_VISIBILITY} A filter can narrow what the caller sees, never widen it.`
  }),
  getBooking: route6({
    method: "GET",
    path: "/v1/bookings/{bookingId}",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:read" },
    success: [200],
    idempotent: false,
    errors: ["booking.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Booking. ${BOOKING_VISIBILITY}`
  }),
  getBookingRouting: route6({
    method: "GET",
    path: "/v1/bookings/{bookingId}/routing",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads why a Booking went to its Rep: the rule that matched, the candidates and who was skipped and why. Owner and Admin for every Booking, a Manager for their Team's; anything else is booking.not_found (404)."
  }),
  rescheduleBooking: route6({
    method: "POST",
    path: "/v1/bookings/{bookingId}/reschedule",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:write" },
    success: [200],
    idempotent: false,
    errors: [
      "booking.not_found",
      "booking.not_active",
      "booking.slot_taken",
      "booking.calendar_unavailable",
      "booking.slot_invalid"
    ],
    commonErrors: ["request.invalid"],
    description: `Moves a Booking to another start time with the same Rep; the length stays. Idempotent by end state: asking for the time it already has answers 200 with it. A cancelled Booking is booking.not_active (409); a taken time is booking.slot_taken (409); the calendar failing is booking.calendar_unavailable (503) and the Booking keeps its old time. Publishes booking.rescheduled. ${BOOKING_VISIBILITY}`
  }),
  cancelBooking: route6({
    method: "POST",
    path: "/v1/bookings/{bookingId}/cancel",
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: "bookings:write" },
    success: [200],
    idempotent: false,
    errors: ["booking.not_found", "booking.calendar_unavailable"],
    commonErrors: ["request.invalid"],
    description: `Cancels a Booking and removes its calendar event. Idempotent by end state: cancelling a cancelled Booking answers 200 with it and publishes nothing. Takes no body. A calendar that cannot be written is booking.calendar_unavailable (503) and the Booking stays confirmed. Publishes booking.cancelled. ${BOOKING_VISIBILITY}`
  }),
  publicListSlots: route6({
    method: "GET",
    path: "/v1/public/booking-types/{token}/slots",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found", "booking.no_eligible_rep"],
    commonErrors: [...PUBLIC_ERRORS2],
    description: "Public: no token, no Organization; the Booking Type's unguessable token in the path stands in for both. Lists free times for that Booking Type, earliest first, one cursor-paginated page at a time (at most 100), over a range of at most 14 days, with the Booking Type's name, length and mode. A time is only a start and an end: never a Rep, an event title, an attendee or a busy block. An unknown, wrong or retired token is booking.type_not_found (404). Rate-limited by client address and by token (rate.limited, 429, with a Retry-After header). The token is a secret: services redact it from logs, traces and error reports."
  }),
  publicBook: route6({
    method: "POST",
    path: "/v1/public/booking-types/{token}/bookings",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "booking.slot_taken",
      "booking.calendar_unavailable",
      "booking.no_eligible_rep",
      "booking.slot_invalid",
      "booking.type_not_found"
    ],
    commonErrors: [
      ...PUBLIC_ERRORS2,
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: "Public: no token, no Organization; the Booking Type's unguessable token stands in for both. A Prospect books a time with their name, work email, the start and their time zone; core upserts the Prospect by email and routes it. Requires an Idempotency-Key header (16 to 128 characters; the client generates one per submission): a replay answers the original confirmation with 200 and writes the calendar once, the same key with another body is request.idempotency_key_reused, and the same key while the first request runs is request.idempotency_in_progress. Answers 201 with the id, the times, the mode and the join link, and no Rep or Prospect id. A time taken meanwhile is booking.slot_taken (409); a calendar that fails is booking.calendar_unavailable (503) with nothing half-written. A filled honeypot is answered exactly as a real request and stores nothing. Rate-limited by client address and by token (rate.limited, 429). The invitation to the Prospect is the calendar's own; Closeline sends no email. Publishes booking.created. The token in the path is a secret: services redact it from logs, traces and error reports. A 429 (rate.limited) carries a Retry-After header."
  })
});
// src/booking/routing.ts
import { z as z40 } from "zod";
var COMPANY_SIZE_BANDS = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1001-5000",
  "5001+"
];
var companySizeBandSchema = z40.enum(COMPANY_SIZE_BANDS);
var MAX_ROUTING_RULES = 200;
var MAX_CONDITION_VALUES = 50;
var MAX_REGION_LENGTH = 100;
var conditionList = (item, max = MAX_CONDITION_VALUES) => z40.array(item).min(1).max(max).refine((values) => new Set(values).size === values.length, "No duplicate values").optional();
var routingConditionsSchema = z40.strictObject({
  countries: conditionList(countryCodeSchema),
  regions: conditionList(boundedTextSchema(MAX_REGION_LENGTH)),
  companySizeBands: conditionList(companySizeBandSchema, COMPANY_SIZE_BANDS.length),
  accountOwnerMembershipIds: conditionList(membershipIdSchema),
  sources: conditionList(sourceKindSchema, 20),
  bookingTypeIds: conditionList(bookingTypeIdSchema, 20)
});
var routingTargetSchema = z40.discriminatedUnion("kind", [
  z40.strictObject({ kind: z40.literal("rep"), membershipId: membershipIdSchema }),
  z40.strictObject({ kind: z40.literal("team"), teamId: teamIdSchema }),
  z40.strictObject({
    kind: z40.literal("pool"),
    membershipIds: z40.array(membershipIdSchema).min(2).max(MAX_ELIGIBLE_REPS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids")
  })
]);
var hasCondition = (conditions) => Object.values(conditions).some((v) => v !== undefined);
var ruleFields = {
  name: bookingNameSchema,
  conditions: routingConditionsSchema,
  target: routingTargetSchema,
  isDefault: z40.boolean()
};
var defaultMatchesNoConditions = {
  check: (rule) => rule.isDefault === !hasCondition(rule.conditions),
  message: "The default rule has no conditions, and a rule with no conditions is the default"
};
var routingRuleSchema = z40.strictObject({
  id: routingRuleIdSchema,
  ...ruleFields,
  position: z40.number().int().min(1).max(MAX_ROUTING_RULES),
  createdAt: timestampSchema
}).refine(defaultMatchesNoConditions.check, { message: defaultMatchesNoConditions.message });
var createRoutingRuleRequestSchema = z40.strictObject(ruleFields).refine(defaultMatchesNoConditions.check, { message: defaultMatchesNoConditions.message });
var updateRoutingRuleRequestSchema = createRoutingRuleRequestSchema;
var routingRuleParamsSchema = z40.strictObject({ ruleId: routingRuleIdSchema });
var reorderRoutingRulesRequestSchema = z40.strictObject({
  ruleIds: z40.array(routingRuleIdSchema).min(1).max(MAX_ROUTING_RULES).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids")
});
var listRoutingRulesQuerySchema = pageQuerySchema.strict();
var routingAttributesSchema = z40.strictObject({
  country: countryCodeSchema.nullable(),
  region: boundedTextSchema(MAX_REGION_LENGTH).nullable(),
  companySizeBand: companySizeBandSchema.nullable(),
  accountOwnerMembershipId: membershipIdSchema.nullable(),
  source: sourceKindSchema.nullable()
});
var routeRequestSchema = z40.strictObject({
  prospectId: prospectIdSchema,
  bookingTypeId: bookingTypeIdSchema.optional()
});
var testRoutingRequestSchema = z40.strictObject({
  attributes: routingAttributesSchema,
  bookingTypeId: bookingTypeIdSchema.optional()
});
var ROUTING_CANDIDATE_REASONS = [
  "named_rep",
  "round_robin_team",
  "round_robin_pool",
  "default_rule"
];
var routingCandidateReasonSchema = z40.enum(ROUTING_CANDIDATE_REASONS);
var ROUTING_SKIP_REASONS = [
  "off_shift",
  "on_leave",
  "daily_cap_reached",
  "calendar_not_connected",
  "needs_reconnect"
];
var routingSkipReasonSchema = z40.enum(ROUTING_SKIP_REASONS);
var routingResultSchema = z40.strictObject({
  decisionId: routingDecisionIdSchema.nullable(),
  matchedRuleId: routingRuleIdSchema.nullable(),
  candidates: z40.array(z40.strictObject({ membershipId: membershipIdSchema, reason: routingCandidateReasonSchema })).max(MAX_ELIGIBLE_REPS),
  skipped: z40.array(z40.strictObject({ membershipId: membershipIdSchema, reason: routingSkipReasonSchema })).max(MAX_ELIGIBLE_REPS),
  decidedAt: timestampSchema.nullable()
});
// src/campaign/audience.ts
import { z as z47 } from "zod";

// src/prospect/errors.ts
import { z as z41 } from "zod";
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
    forbidden_owner: { status: 403, message: "This member cannot own the Prospect." },
    company_domain_taken: {
      status: 409,
      message: "Another Prospect Company already has this domain."
    }
  })
};
var prospectNotFoundDetailsSchema = z41.strictObject({
  resource: z41.enum(["prospect", "company", "import", "merge"])
});
var duplicateIdentityDetailsSchema = z41.strictObject({
  identityKind: prospectIdentityKindSchema,
  prospectId: prospectIdSchema.optional()
});
// src/prospect/events.ts
import { z as z43 } from "zod";

// src/prospect/merge.ts
import { z as z42 } from "zod";
var PROSPECT_MERGE_UNDO_DAYS = 30;
var MAX_MERGED_PROSPECTS = 5;
var prospectMergeParamsSchema = z42.strictObject({ mergeId: prospectMergeIdSchema });
var mergeProspectsRequestSchema = z42.strictObject({
  mergedProspectIds: z42.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids"),
  fieldChoices: z42.partialRecord(prospectFieldNameSchema, prospectIdSchema).default({})
});
var PROSPECT_MERGE_STATES = ["merged", "undone"];
var prospectMergeSchema = z42.object({
  id: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  mergedProspectIds: z42.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS),
  fieldChoices: z42.partialRecord(prospectFieldNameSchema, prospectIdSchema),
  state: z42.enum(PROSPECT_MERGE_STATES),
  mergedByUserId: userIdSchema,
  createdAt: timestampSchema,
  undoableUntil: timestampSchema,
  undoneAt: timestampSchema.nullable()
}).refine((merge) => merge.state === "undone" === (merge.undoneAt !== null), {
  path: ["undoneAt"],
  message: "undoneAt is set exactly when the state is undone"
});
var listProspectDuplicatesQuerySchema = pageQuerySchema.extend({ prospectId: prospectIdSchema.optional() }).strict();
var prospectDuplicateSchema = z42.object({
  prospectIds: z42.tuple([prospectIdSchema, prospectIdSchema]),
  matchedOn: z42.array(prospectIdentityKindSchema).min(1).max(3)
});
var listProspectDuplicatesResponseSchema = pageSchema(prospectDuplicateSchema);
var prospectDuplicateCursorSchema = z42.strictObject({
  first: prospectIdSchema,
  second: prospectIdSchema
});

// src/prospect/events.ts
var prospectCreatedEvent = defineEvent("prospect.created", 1, z43.strictObject({
  prospectId: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  source: sourceKindSchema
}));
var prospectUpdatedEvent = defineEvent("prospect.updated", 1, z43.strictObject({
  prospectId: prospectIdSchema,
  changedFields: z43.array(prospectFieldNameSchema).max(6),
  ownerChanged: z43.boolean(),
  companyChanged: z43.boolean(),
  statusChanged: z43.boolean(),
  source: sourceKindSchema
}));
var prospectMergedEvent = defineEvent("prospect.merged", 1, z43.strictObject({
  mergeId: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  mergedProspectIds: z43.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS)
}));
var prospectMergeUndoneEvent = defineEvent("prospect.merge_undone", 1, z43.strictObject({
  mergeId: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  restoredProspectIds: z43.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS)
}));
var prospectErasedEvent = defineEvent("prospect.erased", 1, z43.strictObject({ prospectId: prospectIdSchema }));
var PROSPECT_EVENTS = {
  "prospect.created": prospectCreatedEvent,
  "prospect.updated": prospectUpdatedEvent,
  "prospect.merged": prospectMergedEvent,
  "prospect.merge_undone": prospectMergeUndoneEvent,
  "prospect.erased": prospectErasedEvent
};
// src/prospect/import.ts
import { z as z44 } from "zod";
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
var prospectImportStateSchema = z44.enum(PROSPECT_IMPORT_STATES);
var PROSPECT_IMPORT_FAILURE_REASONS = ["too_many_rows", "unreadable"];
var prospectImportFailureReasonSchema = z44.enum(PROSPECT_IMPORT_FAILURE_REASONS);
var PROSPECT_IMPORT_ROW_RESULTS = ["created", "updated", "skipped", "rejected"];
var prospectImportRowResultSchema = z44.enum(PROSPECT_IMPORT_ROW_RESULTS);
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
var prospectImportRowReasonSchema = z44.enum([
  ...PROSPECT_IMPORT_SKIP_REASONS,
  ...PROSPECT_IMPORT_REJECT_REASONS
]);
var countSchema = z44.number().int().min(0).max(MAX_PROSPECT_IMPORT_ROWS);
var prospectImportSchema = z44.object({
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
var prospectImportParamsSchema = z44.strictObject({ importId: prospectImportIdSchema });
var listProspectImportsQuerySchema = pageQuerySchema.strict();
var listProspectImportsResponseSchema = pageSchema(prospectImportSchema);
var prospectImportCursorSchema = z44.strictObject({
  createdAt: timestampSchema,
  id: prospectImportIdSchema
});
var prospectImportRowSchema = z44.object({
  rowNumber: z44.number().int().min(2).max(MAX_PROSPECT_IMPORT_ROWS + 1),
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
var prospectImportRowCursorSchema = z44.strictObject({
  rowNumber: z44.number().int().min(2)
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
var prospectImportInvalidDetailsSchema = z44.strictObject({
  reason: z44.enum(PROSPECT_IMPORT_INVALID_REASONS)
});
// src/prospect/prospect.ts
import { z as z45 } from "zod";
var PROSPECT_STATUSES = ["active", "archived"];
var prospectStatusSchema = z45.enum(PROSPECT_STATUSES);
var prospectSchema = z45.object({
  id: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  status: prospectStatusSchema,
  source: sourceKindSchema,
  tags: prospectTagsSchema,
  notes: z45.string().min(1).max(5000).nullable(),
  fields: z45.partialRecord(prospectFieldNameSchema, fieldValueSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var prospectParamsSchema = z45.strictObject({ prospectId: prospectIdSchema });
var hasPersonalField = (body) => body.firstName !== undefined || body.lastName !== undefined || body.email !== undefined || body.phone !== undefined || body.linkedinUrl !== undefined;
var createProspectRequestSchema = z45.strictObject({
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
var updateProspectRequestSchema = z45.strictObject({
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
var prospectCursorSchema = z45.strictObject({
  createdAt: timestampSchema,
  id: prospectIdSchema
});
var prospectFieldParamsSchema = z45.strictObject({
  prospectId: prospectIdSchema,
  field: prospectFieldNameSchema
});
var listFieldHistoryQuerySchema = pageQuerySchema.strict();
var listFieldHistoryResponseSchema = pageSchema(fieldHistoryEntrySchema);
var fieldHistoryCursorSchema = z45.strictObject({
  setAt: timestampSchema,
  seq: z45.number().int().min(0)
});
var setProspectOwnerRequestSchema = z45.strictObject({
  ownerMembershipId: membershipIdSchema
});
var MAX_BULK_ASSIGN_PROSPECTS = 5000;
var BULK_ASSIGN_SYNC_LIMIT = 500;
var bulkAssignProspectsRequestSchema = z45.strictObject({
  prospectIds: z45.array(prospectIdSchema).min(1).max(MAX_BULK_ASSIGN_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids"),
  ownerMembershipId: membershipIdSchema
});
var bulkAssignProspectsResponseSchema = z45.object({
  state: z45.enum(["applied", "queued"]),
  requested: z45.number().int().min(1).max(MAX_BULK_ASSIGN_PROSPECTS),
  assigned: z45.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable(),
  skipped: z45.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable()
}).refine((body) => body.state === "applied" ? body.assigned !== null && body.skipped !== null : body.assigned === null && body.skipped === null, "The counts are set exactly when the assignment was applied");
var eraseProspectResponseSchema = z45.object({
  prospectId: prospectIdSchema,
  state: z45.literal("queued")
});
var prospectCompanySchema = z45.object({
  id: prospectCompanyIdSchema,
  fields: z45.object({
    name: fieldValueSchema,
    domain: fieldValueSchema.optional()
  }),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var prospectCompanyParamsSchema = z45.strictObject({ companyId: prospectCompanyIdSchema });
var prospectCompanyFieldParamsSchema = z45.strictObject({
  companyId: prospectCompanyIdSchema,
  field: prospectCompanyFieldNameSchema
});
var createProspectCompanyRequestSchema = z45.strictObject({
  name: prospectCompanyNameSchema,
  domain: prospectCompanyDomainSchema.optional()
});
var updateProspectCompanyRequestSchema = z45.strictObject({
  name: prospectCompanyNameSchema.optional(),
  domain: prospectCompanyDomainSchema.nullable().optional()
}).refine((body) => body.name !== undefined || body.domain !== undefined, "Send a change");
var listProspectCompaniesQuerySchema = pageQuerySchema.extend({ q: prospectSearchSchema.optional() }).strict();
var listProspectCompaniesResponseSchema = pageSchema(prospectCompanySchema);
var prospectCompanyCursorSchema = z45.strictObject({
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
var route7 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS3 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var VISIBILITY = "Visibility is decided from the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a record of another Organization.";
var PROSPECT_ROUTES = Object.freeze({
  createProspect: route7({
    method: "POST",
    path: "/v1/prospects",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:write" },
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.duplicate_identity", "prospect.forbidden_owner", "prospect.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Creates a Prospect by hand with the Source manual. Every role may; a Rep becomes its owner and only Owner and Admin may name another owner (else prospect.forbidden_owner). An email, phone or LinkedIn address another Prospect already has is prospect.duplicate_identity; the answer names that Prospect only if the caller may see it. A Prospect Company that does not exist is prospect.not_found. Answers 201, or 200 with the original Prospect for a replay of the same Idempotency-Key."
  }),
  listProspects: route7({
    method: "GET",
    path: "/v1/prospects",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Prospects, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: ownerMembershipId, source, companyId, status and q (a search on name, email and company). ${VISIBILITY} A filter can narrow what the caller sees, never widen it.`
  }),
  getProspect: route7({
    method: "GET",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Prospect with every current field and its Source, time and actor. ${VISIBILITY}`
  }),
  updateProspect: route7({
    method: "PATCH",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:write" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.duplicate_identity"],
    commonErrors: ["request.invalid"],
    description: `Edits a Prospect; each field sent is written with the Source manual, which beats every other Source (ADR 0020). null clears a field. Changing an identity to one another Prospect has is prospect.duplicate_identity. Owner is changed by setProspectOwner. Publishes prospect.updated once per change. ${VISIBILITY}`
  }),
  setProspectOwner: route7({
    method: "PUT",
    path: "/v1/prospects/{prospectId}/owner",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.forbidden_owner"],
    commonErrors: ["request.invalid"],
    description: "Assigns or reassigns the owner Rep. Owner and Admin only. The new owner must be a Rep or Manager of the same Organization, else prospect.forbidden_owner. Idempotent by end state. Publishes prospect.updated."
  }),
  bulkAssignProspects: route7({
    method: "POST",
    path: "/v1/prospects/assign",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200, 202],
    idempotent: true,
    errors: ["prospect.forbidden_owner"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Assigns up to 5,000 Prospects to one owner. Owner and Admin only. Up to 500 are applied at once (200); more are queued (202) and finish in the background. The owner rules of setProspectOwner apply (prospect.forbidden_owner). Prospects that do not exist are counted as skipped, not named. A retry with the same Idempotency-Key changes nothing twice."
  }),
  eraseProspect: route7({
    method: "DELETE",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Erases a Prospect on request: a queued job deletes its fields, identities and notes, writes a salted-hash suppression entry and publishes prospect.erased, which carries no personal data. Owner and Admin only; a Rep or Manager gets auth.forbidden. Answers 202 at once; the Prospect is then prospect.not_found, and a retry after acceptance that gets prospect.not_found means the erasure was accepted."
  }),
  listProspectFieldHistory: route7({
    method: "GET",
    path: "/v1/prospects/{prospectId}/fields/{field}/history",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists one field's history, newest first, cursor-paginated (at most 100): the current value, earlier values and enrichment values kept as suggestions, each with Source, time and actor. At most 50 entries are kept per field. ${VISIBILITY}`
  }),
  createProspectCompany: route7({
    method: "POST",
    path: "/v1/prospect-companies",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:write" },
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.company_domain_taken"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Creates a Prospect Company with the Source manual. Every role may. A domain another Prospect Company of the Organization already has is prospect.company_domain_taken (409). Answers 201, or 200 with the original record for a replay of the same Idempotency-Key."
  }),
  listProspectCompanies: route7({
    method: "GET",
    path: "/v1/prospect-companies",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization’s Prospect Companies, newest first, cursor-paginated (at most 100), with an optional q search on name and domain. Every role sees every Prospect Company; a Company carries no Prospect."
  }),
  getProspectCompany: route7({
    method: "GET",
    path: "/v1/prospect-companies/{companyId}",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Prospect Company with its fields and their Sources."
  }),
  updateProspectCompany: route7({
    method: "PATCH",
    path: "/v1/prospect-companies/{companyId}",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:write" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.company_domain_taken"],
    commonErrors: ["request.invalid"],
    description: "Edits a Prospect Company; each field sent is written with the Source manual (ADR 0020). null clears the domain. A domain another Prospect Company of the Organization already has is prospect.company_domain_taken (409)."
  }),
  listProspectCompanyFieldHistory: route7({
    method: "GET",
    path: "/v1/prospect-companies/{companyId}/fields/{field}/history",
    roles: PROSPECT_ALL_ROLES,
    publicApi: { scope: "prospects:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists one Prospect Company field’s history, newest first, cursor-paginated (at most 100), with Source, time and actor."
  }),
  listProspectDuplicates: route7({
    method: "GET",
    path: "/v1/prospect-duplicates",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists suspected duplicate pairs: Prospects that share a normalised email, phone or LinkedIn address, found from the indexed identities and bounded per request (at most 100 per page, cursor-paginated). Optionally for one prospectId. Owner and Admin only."
  }),
  mergeProspects: route7({
    method: "POST",
    path: "/v1/prospects/{prospectId}/merges",
    roles: PROSPECT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found", "prospect.merge_conflict"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Merges up to 5 Prospects into the survivor in the path, with a value chosen per field; both histories are kept and links move to the survivor. Owner and Admin only. A Prospect already merged or named twice is prospect.merge_conflict. Publishes prospect.merged. Undo is possible for 30 days."
  }),
  getProspectMerge: route7({
    method: "GET",
    path: "/v1/prospect-merges/{mergeId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one merge record, including until when it can be undone. Owner and Admin only."
  }),
  undoProspectMerge: route7({
    method: "POST",
    path: "/v1/prospect-merges/{mergeId}/undo",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.merge_conflict"],
    commonErrors: ["request.invalid"],
    description: "Reverses a merge, restoring both records exactly as the snapshot holds them. Owner and Admin only. After the 30-day window, or when a record has been merged again, it is prospect.merge_conflict. Undoing an undone merge answers 200 with the record as it is. Publishes prospect.merge_undone. Takes no body."
  }),
  uploadProspectImport: route7({
    method: "POST",
    path: "/v1/prospect-imports",
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: true,
    errors: ["prospect.import_invalid"],
    commonErrors: ["request.too_large", "request.unsupported_media_type", ...IDEMPOTENT_ERRORS3],
    description: 'Uploads the CSV template (PROSPECT_IMPORT_COLUMNS; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and header are checked before anything is stored; a refusal is prospect.import_invalid with details.reason. The rows are processed in a queued, resumable job that matches a row to an existing Prospect on any normalised identity (email, phone or LinkedIn address), writes the Source import and never replaces a manual value. Bad rows are reported, never dropped. Answers 202 with the import; the same Idempotency-Key creates nothing new.'
  }),
  listProspectImports: route7({
    method: "GET",
    path: "/v1/prospect-imports",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization’s imports, newest first, cursor-paginated (at most 100). Owner and Admin only."
  }),
  getProspectImport: route7({
    method: "GET",
    path: "/v1/prospect-imports/{importId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one import: its state, failure reason and counts, so a page opened mid-job shows live status. Owner and Admin only."
  }),
  listProspectImportRows: route7({
    method: "GET",
    path: "/v1/prospect-imports/{importId}/rows",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads the report in CSV order, cursor-paginated (at most 100), optionally only one result. Each row has its number, result, reason and Prospect id; no cell of the file is returned. Owner and Admin only."
  }),
  downloadProspectImportReport: route7({
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
// src/campaign/values.ts
import { z as z46 } from "zod";
var MAX_CAMPAIGN_NAME_LENGTH = 100;
var MAX_GOAL_LENGTH = 500;
var MAX_STEP_TEXT_LENGTH = 500;
var MAX_SEQUENCE_STEPS = 50;
var MAX_PROSPECTS_PER_REQUEST = 100;
var MAX_AUDIENCE_PROSPECTS = 500;
var MAX_CAMPAIGN_DAILY_CAP = 5000;
var MAX_WAIT_HOURS = 2160;
var MAX_PROPOSED_PLAYS = 5;
var MAX_PLAY_CITATIONS = 20;
function multilineTextSchema(maxLength) {
  return z46.string().max(maxLength * 2).trim().pipe(z46.string().min(1).max(maxLength).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
}
var campaignNameSchema = z46.string().max(MAX_CAMPAIGN_NAME_LENGTH * 2).trim().pipe(z46.string().min(1).max(MAX_CAMPAIGN_NAME_LENGTH).refine((text) => !hasControlCharacter2(text, false), "No control characters"));
var goalSchema = multilineTextSchema(MAX_GOAL_LENGTH);
var stepTextSchema = multilineTextSchema(MAX_STEP_TEXT_LENGTH);
var stepKeySchema = z46.string().min(1).max(40).regex(/^[a-z][a-z0-9_-]*$/);
var hoursSchema2 = z46.number().int().min(1).max(MAX_WAIT_HOURS);
var CAMPAIGN_STATES = ["draft", "ready", "running", "paused", "archived"];
var campaignStateSchema = z46.enum(CAMPAIGN_STATES);
var CAMPAIGN_APPROVAL_MODES = ["auto", "review", "mixed"];
var campaignApprovalModeSchema = z46.enum(CAMPAIGN_APPROVAL_MODES);
var CAMPAIGN_LANGUAGES = ["en"];
var campaignLanguageSchema = z46.enum(CAMPAIGN_LANGUAGES);
var WINDOW_ZONES = ["campaign", "prospect"];
var windowZoneSchema = z46.enum(WINDOW_ZONES);
var countSchema2 = z46.number().int().min(0).max(1e8);

// src/campaign/audience.ts
var audienceSchema = z47.discriminatedUnion("kind", [
  z47.strictObject({
    kind: z47.literal("filter"),
    ownerMembershipId: membershipIdSchema.optional(),
    source: sourceKindSchema.optional(),
    companyId: prospectCompanyIdSchema.optional(),
    status: prospectStatusSchema.optional(),
    q: prospectSearchSchema.optional()
  }),
  z47.strictObject({
    kind: z47.literal("prospects"),
    prospectIds: z47.array(prospectIdSchema).min(1).max(MAX_AUDIENCE_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "A Prospect is listed once")
  })
]);
var AUDIENCE_CHECK_STATES = ["pending", "ready", "failed"];
var audienceCheckStateSchema = z47.enum(AUDIENCE_CHECK_STATES);
var audienceCountsSchema = z47.strictObject({
  total: countSchema2,
  verified: countSchema2,
  unverified: countSchema2,
  suppressed: countSchema2,
  noConsent: countSchema2,
  activeInOtherCampaign: countSchema2,
  eligible: countSchema2
}).superRefine((c, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (c.verified + c.unverified !== c.total) {
    issue("unverified", "Verified and unverified add up to the total");
  }
  const refused = Math.max(c.suppressed, c.noConsent, c.activeInOtherCampaign);
  if (c.eligible + refused > c.total) {
    issue("eligible", "Eligible and the largest refusal count fit in the total");
  }
  for (const field of ["suppressed", "noConsent", "activeInOtherCampaign", "eligible"]) {
    if (c[field] > c.total) {
      issue(field, "No count is above the total");
    }
  }
});
var audienceCheckSchema = z47.strictObject({
  campaignId: campaignIdSchema,
  state: audienceCheckStateSchema,
  audienceVersion: z47.number().int().min(0).max(1e6),
  counts: audienceCountsSchema.nullable(),
  requestedAt: timestampSchema,
  completedAt: timestampSchema.nullable()
}).superRefine((c, ctx) => {
  if (c.state === "ready" !== (c.counts !== null)) {
    ctx.addIssue({
      code: "custom",
      path: ["counts"],
      message: "Exactly a ready check has counts"
    });
  }
  if (c.state === "pending" !== (c.completedAt === null)) {
    ctx.addIssue({
      code: "custom",
      path: ["completedAt"],
      message: "Exactly a finished check has a completion time"
    });
  }
});
var LAUNCH_CHECKS = ["sequence", "preview", "audience", "mailbox"];
var launchCheckNameSchema = z47.enum(LAUNCH_CHECKS);
var LAUNCH_CHECK_RESULTS = ["pass", "fail", "pending"];
var launchCheckResultSchema = z47.enum(LAUNCH_CHECK_RESULTS);
var launchFailureCodeSchema = z47.enum([
  "campaign.invalid_sequence",
  "campaign.not_previewed",
  "campaign.audience_empty",
  "campaign.audience_check_pending",
  "campaign.no_healthy_mailbox"
]);
var LAUNCH_CHECK_CODES = {
  sequence: ["campaign.invalid_sequence"],
  preview: ["campaign.not_previewed"],
  audience: ["campaign.audience_empty", "campaign.audience_check_pending"],
  mailbox: ["campaign.no_healthy_mailbox"]
};
var launchCheckItemSchema = z47.strictObject({
  check: launchCheckNameSchema,
  result: launchCheckResultSchema,
  code: launchFailureCodeSchema.nullable()
}).refine((c) => c.result === "pass" === (c.code === null), {
  message: "Exactly a check that did not pass names a code",
  path: ["code"]
}).refine((c) => c.code === null || LAUNCH_CHECK_CODES[c.check].includes(c.code), {
  message: "The code belongs to the check",
  path: ["code"]
});
var launchCheckSchema = z47.strictObject({
  campaignId: campaignIdSchema,
  checks: z47.array(launchCheckItemSchema).length(LAUNCH_CHECKS.length),
  canLaunch: z47.boolean(),
  suppressed: countSchema2.nullable(),
  noConsent: countSchema2.nullable(),
  eligible: countSchema2.nullable(),
  dailyCapacity: countSchema2,
  checkedAt: timestampSchema
}).superRefine((c, ctx) => {
  const names = c.checks.map((i) => i.check);
  if (LAUNCH_CHECKS.some((name) => names.filter((n) => n === name).length !== 1)) {
    ctx.addIssue({ code: "custom", path: ["checks"], message: "Each check is reported once" });
  }
  if (c.canLaunch !== c.checks.every((i) => i.result === "pass")) {
    ctx.addIssue({
      code: "custom",
      path: ["canLaunch"],
      message: "A Campaign can launch only when every check passes"
    });
  }
});
// src/campaign/campaign.ts
import { z as z49 } from "zod";

// src/mail/values.ts
import { z as z48 } from "zod";
var MAILBOX_PROVIDERS = ["gmail", "outlook"];
var mailboxProviderSchema = z48.enum(MAILBOX_PROVIDERS);
var MAILBOX_KINDS = ["personal", "shared"];
var mailboxKindSchema = z48.enum(MAILBOX_KINDS);
var MAILBOX_STATES = ["warming", "healthy", "limited", "paused", "disconnected"];
var mailboxStateSchema = z48.enum(MAILBOX_STATES);
var MAILBOX_STATE_REASONS = [
  "owner_paused",
  "admin_paused",
  "complaint_spike",
  "bounce_spike",
  "provider_suspended",
  "auth_revoked",
  "disconnected_by_owner",
  "health_warning"
];
var mailboxStateReasonSchema = z48.enum(MAILBOX_STATE_REASONS);
var MAX_SENDS_PER_DAY = 500;
var MAX_SENDS_PER_HOUR = 100;
var MAX_MIN_GAP_SECONDS = 3600;
var MAX_MAILBOX_TEAMS = 50;
var countSchema3 = (max) => z48.number().int().min(0).max(max);
var minuteOfDaySchema = z48.number().int().min(0).max(1439);
var sendWindowSchema = z48.strictObject({
  timeZone: timeZoneSchema,
  days: z48.array(weekdaySchema).min(1).max(7),
  startMinute: minuteOfDaySchema,
  endMinute: z48.number().int().min(1).max(1440)
}).superRefine((w, ctx) => {
  if (w.endMinute <= w.startMinute) {
    ctx.addIssue({
      code: "custom",
      path: ["endMinute"],
      message: "The window ends after it starts"
    });
  }
  if (new Set(w.days).size !== w.days.length) {
    ctx.addIssue({ code: "custom", path: ["days"], message: "A day is listed once" });
  }
});
var mailboxLimitsSchema = z48.strictObject({
  perDay: z48.number().int().min(1).max(MAX_SENDS_PER_DAY),
  perHour: z48.number().int().min(1).max(MAX_SENDS_PER_HOUR),
  minGapSeconds: z48.number().int().min(0).max(MAX_MIN_GAP_SECONDS),
  window: sendWindowSchema
});
var effectiveLimitsSchema = z48.object({
  perDay: countSchema3(MAX_SENDS_PER_DAY),
  perHour: countSchema3(MAX_SENDS_PER_HOUR),
  minGapSeconds: z48.number().int().min(0).max(MAX_MIN_GAP_SECONDS)
});
var MAILBOX_RAMP_STEPS = [
  { fromDay: 0, perDay: 10 },
  { fromDay: 7, perDay: 15 },
  { fromDay: 14, perDay: 25 },
  { fromDay: 21, perDay: 40 }
];
var rampSchema = z48.object({
  active: z48.boolean(),
  dayIndex: z48.number().int().min(0).max(36500),
  perDayNow: z48.number().int().min(0).max(MAX_SENDS_PER_DAY).nullable(),
  steps: z48.array(z48.strictObject({
    fromDay: z48.number().int().min(0).max(365),
    perDay: countSchema3(MAX_SENDS_PER_DAY)
  })).max(20)
});

// src/campaign/campaign.ts
var campaignSchema = z49.strictObject({
  id: campaignIdSchema,
  name: campaignNameSchema,
  goal: goalSchema,
  state: campaignStateSchema,
  audience: audienceSchema,
  audienceVersion: z49.number().int().min(0).max(1e6),
  sequenceVersion: z49.number().int().min(0).max(1e6),
  previewedVersion: z49.number().int().min(1).max(1e6).nullable(),
  previewedAt: timestampSchema.nullable(),
  approvalMode: campaignApprovalModeSchema,
  language: campaignLanguageSchema,
  sendWindow: sendWindowSchema,
  windowZone: windowZoneSchema,
  dailyCap: z49.number().int().min(1).max(MAX_CAMPAIGN_DAILY_CAP),
  ownerMembershipId: membershipIdSchema,
  teamId: teamIdSchema.nullable(),
  playId: playIdSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  launchedAt: timestampSchema.nullable(),
  archivedAt: timestampSchema.nullable()
});
var campaignSettingsShape = {
  name: campaignNameSchema,
  goal: goalSchema,
  audience: audienceSchema,
  approvalMode: campaignApprovalModeSchema,
  language: campaignLanguageSchema,
  sendWindow: sendWindowSchema,
  windowZone: windowZoneSchema,
  dailyCap: z49.number().int().min(1).max(MAX_CAMPAIGN_DAILY_CAP),
  teamId: teamIdSchema.nullable()
};
var createCampaignRequestSchema = z49.strictObject({
  ...campaignSettingsShape,
  approvalMode: campaignApprovalModeSchema.default("review"),
  language: campaignLanguageSchema.default("en"),
  windowZone: windowZoneSchema.default("campaign"),
  teamId: teamIdSchema.nullable().default(null),
  playId: playIdSchema.nullable().default(null)
});
var updateCampaignRequestSchema = z49.strictObject({
  name: campaignSettingsShape.name.optional(),
  goal: campaignSettingsShape.goal.optional(),
  audience: campaignSettingsShape.audience.optional(),
  approvalMode: campaignSettingsShape.approvalMode.optional(),
  sendWindow: campaignSettingsShape.sendWindow.optional(),
  windowZone: campaignSettingsShape.windowZone.optional(),
  dailyCap: campaignSettingsShape.dailyCap.optional(),
  teamId: campaignSettingsShape.teamId.optional()
}).refine((body) => Object.keys(body).length > 0, "Change at least one field");
var duplicateCampaignRequestSchema = z49.strictObject({ name: campaignNameSchema });
var campaignParamsSchema = z49.strictObject({ campaignId: campaignIdSchema });
var listCampaignsQuerySchema = pageQuerySchema.extend({
  state: campaignStateSchema.optional(),
  ownerMembershipId: membershipIdSchema.optional(),
  teamId: teamIdSchema.optional()
}).strict();
var listCampaignsResponseSchema = pageSchema(campaignSchema);
var campaignCursorSchema = z49.strictObject({
  createdAt: timestampSchema,
  id: campaignIdSchema
});
var campaignStatsSchema = z49.strictObject({
  campaignId: campaignIdSchema,
  enrolled: countSchema2,
  active: countSchema2,
  completed: countSchema2,
  stopped: countSchema2,
  sent: countSchema2,
  replied: countSchema2,
  positiveReplied: countSchema2.nullable(),
  meetings: countSchema2,
  bounced: countSchema2,
  unsubscribed: countSchema2,
  computedAt: timestampSchema
}).superRefine((s, ctx) => {
  if (s.active + s.completed + s.stopped !== s.enrolled) {
    ctx.addIssue({
      code: "custom",
      path: ["enrolled"],
      message: "Active, completed and stopped add up to the enrolled"
    });
  }
  for (const field of ["replied", "meetings", "bounced", "unsubscribed"]) {
    if (s[field] > s.enrolled) {
      ctx.addIssue({ code: "custom", path: [field], message: "No count is above the enrolled" });
    }
  }
});
// src/campaign/enrollment.ts
import { z as z51 } from "zod";

// src/mail/send.ts
import { z as z50 } from "zod";
var SEND_CHECKS = [
  "campaign",
  "window",
  "address",
  "suppression",
  "consent",
  "mailbox",
  "limits",
  "organization_cap",
  "idempotency"
];
var sendCheckSchema = z50.enum(SEND_CHECKS);
var SEND_STATES = ["sending", "sent", "refused", "deferred", "failed"];
var sendStateSchema = z50.enum(SEND_STATES);
var SEND_REFUSAL_REASONS = [
  "campaign_not_running",
  "outside_window",
  "unverified_address",
  "suppressed",
  "no_consent",
  "mailbox_unavailable",
  "limit_reached",
  "organization_cap_reached",
  "duplicate"
];
var sendRefusalReasonSchema = z50.enum(SEND_REFUSAL_REASONS);
var SEND_DEFERRING_REASONS = [
  "outside_window",
  "limit_reached",
  "organization_cap_reached"
];
var MAX_ATTEMPT_EPOCH = 1000;
var MAX_SEQUENCE_STEP = 1000;
var sendKeySchema = z50.strictObject({
  enrollmentId: enrollmentIdSchema,
  step: z50.number().int().min(0).max(MAX_SEQUENCE_STEP),
  attemptEpoch: z50.number().int().min(0).max(MAX_ATTEMPT_EPOCH)
});
var sendCheckResultSchema = z50.object({
  check: sendCheckSchema,
  passed: z50.boolean()
});
var sendRecordSchema = z50.object({
  id: sendIdSchema,
  campaignId: campaignIdSchema,
  enrollmentId: enrollmentIdSchema,
  prospectId: prospectIdSchema,
  step: z50.number().int().min(0).max(MAX_SEQUENCE_STEP),
  attemptEpoch: z50.number().int().min(0).max(MAX_ATTEMPT_EPOCH),
  mailboxId: mailboxIdSchema.nullable(),
  state: sendStateSchema,
  reason: sendRefusalReasonSchema.nullable(),
  checks: z50.array(sendCheckResultSchema).max(SEND_CHECKS.length),
  retryAt: timestampSchema.nullable(),
  decidedAt: timestampSchema,
  sentAt: timestampSchema.nullable()
}).superRefine((r, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  const declined = r.state === "refused" || r.state === "deferred";
  if (declined !== (r.reason !== null)) {
    issue("reason", "Exactly a refused or deferred send names a reason");
  }
  if (r.state === "deferred" !== (r.retryAt !== null)) {
    issue("retryAt", "Exactly a deferred send says when it is tried again");
  }
  if (r.state === "deferred" && r.reason !== null && !SEND_DEFERRING_REASONS.includes(r.reason)) {
    issue("reason", "This reason refuses a send, it does not defer it");
  }
  if (r.state === "refused" && r.reason !== null && SEND_DEFERRING_REASONS.includes(r.reason)) {
    issue("reason", "This reason defers a send, it does not refuse it");
  }
  if (["sending", "sent", "failed"].includes(r.state) && r.mailboxId === null) {
    issue("mailboxId", "A send that reached the transport names its Mailbox");
  }
  if (r.state === "sent" !== (r.sentAt !== null)) {
    issue("sentAt", "Exactly a sent send has a sent time");
  }
});
var sendParamsSchema = z50.strictObject({ sendId: sendIdSchema });
var submitSendRequestSchema = z50.strictObject({
  campaignId: campaignIdSchema,
  prospectId: prospectIdSchema,
  key: sendKeySchema,
  acceptUnverifiedAddress: z50.boolean().default(false)
});
function sendKeyToString(key) {
  return idempotencyKeySchema.parse(`${key.enrollmentId}:${key.step}:${key.attemptEpoch}`);
}
var limitDetailsSchema = z50.strictObject({
  limit: z50.enum(["per_day", "per_hour", "min_gap", "organization_daily_cap"]),
  retryAfter: z50.number().int().positive()
});
var sendCursorSchema = z50.strictObject({ decidedAt: timestampSchema, id: sendIdSchema });
var listSendsQuerySchema = pageQuerySchema.extend({
  campaignId: campaignIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  mailboxId: mailboxIdSchema.optional(),
  state: sendStateSchema.optional(),
  reason: sendRefusalReasonSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict();
var sendPageSchema = pageSchema(sendRecordSchema);

// src/campaign/enrollment.ts
var ENROLLMENT_STATES = ["active", "completed", "stopped"];
var enrollmentStateSchema = z51.enum(ENROLLMENT_STATES);
var ENROLLMENT_STOP_REASONS = [
  "replied",
  "hard_bounce",
  "unsubscribed",
  "complaint",
  "suppressed",
  "no_consent",
  "unverified_address",
  "removed_by_rep",
  "meeting_booked",
  "prospect_erased",
  "campaign_archived"
];
var enrollmentStopReasonSchema = z51.enum(ENROLLMENT_STOP_REASONS);
var enrollmentSchema = z51.strictObject({
  id: enrollmentIdSchema,
  campaignId: campaignIdSchema,
  prospectId: prospectIdSchema,
  state: enrollmentStateSchema,
  stopReason: enrollmentStopReasonSchema.nullable(),
  currentStepKey: stepKeySchema.nullable(),
  currentStep: z51.number().int().min(0).max(MAX_SEQUENCE_STEP).nullable(),
  attemptEpoch: z51.number().int().min(0).max(MAX_ATTEMPT_EPOCH),
  nextDueAt: timestampSchema.nullable(),
  enrolledAt: timestampSchema,
  stoppedAt: timestampSchema.nullable(),
  completedAt: timestampSchema.nullable()
}).superRefine((e, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (e.state === "stopped" !== (e.stopReason !== null)) {
    issue("stopReason", "Exactly a stopped Enrollment has a reason");
  }
  if (e.state === "stopped" !== (e.stoppedAt !== null)) {
    issue("stoppedAt", "Exactly a stopped Enrollment has a stop time");
  }
  if (e.state === "completed" !== (e.completedAt !== null)) {
    issue("completedAt", "Exactly a completed Enrollment has a completion time");
  }
  if (e.state !== "active" && e.nextDueAt !== null) {
    issue("nextDueAt", "An ended Enrollment is not due again");
  }
  if (e.currentStepKey === null !== (e.currentStep === null)) {
    issue("currentStep", "A Step has both a key and a position, or neither");
  }
  if (e.state === "active" && e.currentStepKey === null) {
    issue("currentStepKey", "An active Enrollment is at a Step");
  }
});
var enrollmentParamsSchema = z51.strictObject({ enrollmentId: enrollmentIdSchema });
var campaignEnrollmentsParamsSchema = z51.strictObject({ campaignId: campaignIdSchema });
var enrollProspectsRequestSchema = z51.strictObject({
  prospectIds: z51.array(prospectIdSchema).min(1).max(MAX_PROSPECTS_PER_REQUEST).refine((ids) => new Set(ids).size === ids.length, "A Prospect is listed once")
});
var ENROLL_REFUSALS = ["suppressed", "no_consent", "already_active", "not_found"];
var enrollRefusalSchema = z51.enum(ENROLL_REFUSALS);
var ENROLL_REFUSAL_CODES = {
  suppressed: "enrollment.suppressed",
  no_consent: "enrollment.no_consent",
  already_active: "enrollment.already_active",
  not_found: "enrollment.not_found"
};
var enrollResultSchema = z51.strictObject({
  prospectId: prospectIdSchema,
  outcome: z51.enum(["enrolled", "refused"]),
  refusal: enrollRefusalSchema.nullable(),
  enrollmentId: enrollmentIdSchema.nullable()
}).superRefine((r, ctx) => {
  if (r.outcome === "refused" !== (r.refusal !== null)) {
    ctx.addIssue({
      code: "custom",
      path: ["refusal"],
      message: "Exactly a refused Prospect has a reason"
    });
  }
  if (r.outcome === "refused" && r.refusal !== "already_active" && r.enrollmentId !== null) {
    ctx.addIssue({
      code: "custom",
      path: ["enrollmentId"],
      message: "Only an already_active refusal names an Enrollment"
    });
  }
  if (r.outcome === "enrolled" && r.enrollmentId === null) {
    ctx.addIssue({
      code: "custom",
      path: ["enrollmentId"],
      message: "An enrolled Prospect has an Enrollment"
    });
  }
});
var enrollProspectsResponseSchema = z51.strictObject({
  results: z51.array(enrollResultSchema).min(1).max(MAX_PROSPECTS_PER_REQUEST)
});
var listEnrollmentsQuerySchema = pageQuerySchema.extend({
  state: enrollmentStateSchema.optional(),
  stopReason: enrollmentStopReasonSchema.optional(),
  prospectId: prospectIdSchema.optional()
}).strict();
var listEnrollmentsResponseSchema = pageSchema(enrollmentSchema);
var enrollmentCursorSchema = z51.strictObject({
  enrolledAt: timestampSchema,
  id: enrollmentIdSchema
});
var removeEnrollmentRequestSchema = z51.strictObject({});
var ENROLLMENT_EVENT_KINDS = [
  "enrolled",
  "step_entered",
  "sent",
  "deferred",
  "refused",
  "rep_task_created",
  "branch_taken",
  "stopped",
  "completed"
];
var enrollmentEventKindSchema = z51.enum(ENROLLMENT_EVENT_KINDS);
var enrollmentEventSchema = z51.strictObject({
  id: enrollmentEventIdSchema,
  enrollmentId: enrollmentIdSchema,
  kind: enrollmentEventKindSchema,
  stepKey: stepKeySchema.nullable(),
  variantKey: stepKeySchema.nullable(),
  sendId: sendIdSchema.nullable(),
  stopReason: enrollmentStopReasonSchema.nullable(),
  actorMembershipId: membershipIdSchema.nullable(),
  occurredAt: timestampSchema
});
var listEnrollmentActivityResponseSchema = pageSchema(enrollmentEventSchema);
var enrollmentActivityCursorSchema = z51.strictObject({
  occurredAt: timestampSchema,
  id: enrollmentEventIdSchema
});
// src/campaign/errors.ts
var CAMPAIGN_ERRORS = {
  ...defineErrors("campaign", {
    not_found: { status: 404, message: "The Campaign was not found." },
    invalid_state: { status: 409, message: "The Campaign is not in a state that allows this." },
    invalid_sequence: { status: 422, message: "The Sequence is not valid." },
    sequence_version_conflict: {
      status: 409,
      message: "The Sequence changed since it was read. Reload it and try again."
    },
    not_previewed: { status: 409, message: "Preview the current Sequence before launching." },
    no_healthy_mailbox: { status: 409, message: "No healthy Mailbox is available to send from." },
    audience_empty: { status: 409, message: "Nobody in the audience can be contacted." },
    audience_check_pending: {
      status: 409,
      message: "The audience check has not finished for the current audience."
    }
  }),
  ...defineErrors("enrollment", {
    not_found: { status: 404, message: "The Enrollment was not found." },
    suppressed: { status: 409, message: "This address must not be contacted." },
    no_consent: { status: 409, message: "There is no consent to contact this Prospect by email." },
    already_active: { status: 409, message: "The Prospect is already in an active Campaign." }
  }),
  ...defineErrors("variant", {
    not_found: { status: 404, message: "The Variant was not found." },
    invalid_weights: {
      status: 422,
      message: "A test needs two to four Variants whose weights add up to 100."
    },
    already_promoted: { status: 409, message: "A winner was already promoted for this Step." }
  }),
  ...defineErrors("play", {
    not_found: { status: 404, message: "The Play was not found." },
    no_evidence: {
      status: 409,
      message: "This Play cites no evidence. Confirm that you want to accept it anyway."
    },
    read_only: { status: 409, message: "A built-in Play cannot be changed." },
    invalid_state: { status: 409, message: "The Play is not in a state that allows this." }
  })
};
// src/campaign/events.ts
import { z as z53 } from "zod";

// src/campaign/variant.ts
import { z as z52 } from "zod";
var MIN_VARIANTS = 2;
var MAX_VARIANTS = 4;
var VARIANT_WEIGHT_TOTAL = 100;
var MIN_VARIANT_SAMPLE = 100;
var MAX_PROMOTION_SAMPLE = 1e5;
var variantSchema = z52.strictObject({
  key: stepKeySchema,
  label: campaignNameSchema,
  angle: stepTextSchema,
  weight: z52.number().int().min(1).max(VARIANT_WEIGHT_TOTAL - 1)
});
var promotionPolicySchema = z52.discriminatedUnion("mode", [
  z52.strictObject({ mode: z52.literal("manual") }),
  z52.strictObject({
    mode: z52.literal("auto"),
    minSamplePerVariant: z52.number().int().min(MIN_VARIANT_SAMPLE).max(MAX_PROMOTION_SAMPLE),
    marginPercentagePoints: z52.number().min(1).max(50)
  })
]);
var variantGroupSchema = z52.strictObject({
  variants: z52.array(variantSchema).min(MIN_VARIANTS).max(MAX_VARIANTS),
  promotion: promotionPolicySchema
}).superRefine((group, ctx) => {
  const total = group.variants.reduce((sum, v) => sum + v.weight, 0);
  if (total !== VARIANT_WEIGHT_TOTAL) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: `The weights add up to ${VARIANT_WEIGHT_TOTAL}`
    });
  }
  if (new Set(group.variants.map((v) => v.key)).size !== group.variants.length) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: "A Variant key is used once"
    });
  }
});
var rateIntervalSchema = z52.strictObject({
  estimate: z52.number().min(0).max(1),
  lower: z52.number().min(0).max(1),
  upper: z52.number().min(0).max(1)
}).refine((r) => r.lower <= r.estimate && r.estimate <= r.upper, "The estimate is inside its interval");
var variantResultSchema = z52.strictObject({
  key: stepKeySchema,
  sent: countSchema2,
  delivered: countSchema2,
  replied: countSchema2,
  positiveReplied: countSchema2.nullable(),
  bounced: countSchema2,
  unsubscribed: countSchema2,
  replyRate: rateIntervalSchema.nullable()
}).superRefine((r, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  for (const field of ["delivered", "replied", "bounced", "unsubscribed"]) {
    if (r[field] > r.sent) {
      issue(field, "No count is above the number sent");
    }
  }
  if (r.positiveReplied !== null && r.positiveReplied > r.replied) {
    issue("positiveReplied", "Positive replies are among the replies");
  }
});
var VARIANT_RESULT_STATUSES = ["not_enough_data", "measured"];
var variantResultStatusSchema = z52.enum(VARIANT_RESULT_STATUSES);
var PROMOTION_SOURCES = ["manual", "auto"];
var promotionSourceSchema = z52.enum(PROMOTION_SOURCES);
var promotionRecordSchema = z52.strictObject({
  variantKey: stepKeySchema,
  source: promotionSourceSchema,
  promotedByMembershipId: membershipIdSchema.nullable(),
  promotedAt: timestampSchema
}).refine((p) => p.source === "manual" === (p.promotedByMembershipId !== null), {
  message: "Exactly a manual promotion names the person",
  path: ["promotedByMembershipId"]
});
var stepVariantResultsSchema = z52.strictObject({
  campaignId: campaignIdSchema,
  stepKey: stepKeySchema,
  status: variantResultStatusSchema,
  minimumSample: z52.number().int().min(MIN_VARIANT_SAMPLE).max(MAX_PROMOTION_SAMPLE),
  variants: z52.array(variantResultSchema).min(MIN_VARIANTS).max(MAX_VARIANTS),
  promotion: promotionRecordSchema.nullable(),
  computedAt: timestampSchema
}).superRefine((r, ctx) => {
  const noData = r.status === "not_enough_data";
  r.variants.forEach((v, i) => {
    if (noData && v.replyRate !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["variants", i, "replyRate"],
        message: "No interval is given while there is not enough data"
      });
    }
    if (!noData && v.replyRate === null) {
      ctx.addIssue({
        code: "custom",
        path: ["variants", i, "replyRate"],
        message: "A measured Step gives every Variant an interval"
      });
    }
  });
});
var stepVariantsParamsSchema = z52.strictObject({
  campaignId: campaignIdSchema,
  stepKey: stepKeySchema
});
var variantParamsSchema = z52.strictObject({
  campaignId: campaignIdSchema,
  stepKey: stepKeySchema,
  variantKey: stepKeySchema
});
var promoteVariantResponseSchema = promotionRecordSchema;

// src/campaign/events.ts
var campaignLaunchedEvent = defineEvent("campaign.launched", 1, z53.strictObject({
  campaignId: campaignIdSchema,
  launchedByMembershipId: membershipIdSchema,
  sequenceVersion: z53.number().int().min(1).max(1e6),
  launchedAt: timestampSchema
}));
var enrollmentStoppedEvent = defineEvent("enrollment.stopped", 1, z53.strictObject({
  campaignId: campaignIdSchema,
  enrollmentId: enrollmentIdSchema,
  prospectId: prospectIdSchema,
  stopReason: enrollmentStopReasonSchema,
  stoppedAt: timestampSchema
}));
var stepSentEvent = defineEvent("step.sent", 1, z53.strictObject({
  campaignId: campaignIdSchema,
  enrollmentId: enrollmentIdSchema,
  prospectId: prospectIdSchema,
  sendId: sendIdSchema,
  stepKey: stepKeySchema,
  step: z53.number().int().min(0).max(MAX_SEQUENCE_STEP),
  variantKey: stepKeySchema.nullable(),
  sentAt: timestampSchema
}));
var variantPromotedEvent = defineEvent("variant.promoted", 1, z53.strictObject({
  campaignId: campaignIdSchema,
  stepKey: stepKeySchema,
  variantKey: stepKeySchema,
  mode: promotionSourceSchema,
  promotedByMembershipId: membershipIdSchema.nullable(),
  promotedAt: timestampSchema
}));
var CAMPAIGN_EVENTS = {
  "campaign.launched": campaignLaunchedEvent,
  "enrollment.stopped": enrollmentStoppedEvent,
  "step.sent": stepSentEvent,
  "variant.promoted": variantPromotedEvent
};
// src/campaign/play.ts
import { z as z55 } from "zod";

// src/campaign/sequence.ts
import { z as z54 } from "zod";
var STEP_KINDS = ["email", "wait", "branch", "rep_task", "end"];
var stepKindSchema = z54.enum(STEP_KINDS);
var emailStepSchema = z54.strictObject({
  kind: z54.literal("email"),
  key: stepKeySchema,
  goal: goalSchema,
  variants: variantGroupSchema.nullable(),
  next: stepKeySchema
});
var waitStepSchema = z54.strictObject({
  kind: z54.literal("wait"),
  key: stepKeySchema,
  waitHours: hoursSchema2,
  next: stepKeySchema
});
var branchConditionSchema = z54.discriminatedUnion("kind", [
  z54.strictObject({ kind: z54.literal("out_of_office") }),
  z54.strictObject({ kind: z54.literal("no_response"), afterHours: hoursSchema2 }),
  z54.strictObject({ kind: z54.literal("task_completed") }),
  z54.strictObject({ kind: z54.literal("task_skipped") })
]);
var branchArmSchema = z54.strictObject({
  condition: branchConditionSchema,
  next: stepKeySchema
});
var MAX_BRANCH_ARMS = 5;
var branchStepSchema = z54.strictObject({
  kind: z54.literal("branch"),
  key: stepKeySchema,
  arms: z54.array(branchArmSchema).min(1).max(MAX_BRANCH_ARMS),
  default: stepKeySchema
});
var REP_TASK_TYPES = ["call", "manual_message", "research", "other"];
var repTaskTypeSchema = z54.enum(REP_TASK_TYPES);
var repTaskStepSchema = z54.strictObject({
  kind: z54.literal("rep_task"),
  key: stepKeySchema,
  task: repTaskTypeSchema,
  instruction: stepTextSchema,
  dueInHours: hoursSchema2,
  next: stepKeySchema
});
var endStepSchema = z54.strictObject({
  kind: z54.literal("end"),
  key: stepKeySchema
});
var stepSchema = z54.discriminatedUnion("kind", [
  emailStepSchema,
  waitStepSchema,
  branchStepSchema,
  repTaskStepSchema,
  endStepSchema
]);
var SEQUENCE_PROBLEMS = [
  "duplicate_key",
  "unknown_target",
  "unreachable_step",
  "cycle_without_wait",
  "no_path_to_end"
];
var sequenceProblemCodeSchema = z54.enum(SEQUENCE_PROBLEMS);
var sequenceProblemSchema = z54.strictObject({
  code: sequenceProblemCodeSchema,
  stepKey: stepKeySchema
});
var MAX_SEQUENCE_PROBLEMS = 50;
var invalidSequenceDetailsSchema = z54.strictObject({
  problems: z54.array(sequenceProblemSchema).min(1).max(MAX_SEQUENCE_PROBLEMS)
});
function targetsOf(step) {
  switch (step.kind) {
    case "email":
    case "wait":
    case "rep_task":
      return [step.next];
    case "branch":
      return [...step.arms.map((arm) => arm.next), step.default];
    case "end":
      return [];
  }
}
function reach(from, edges) {
  const seen = new Set(from);
  const stack = [...from];
  while (stack.length > 0) {
    const key = stack.pop();
    for (const next of edges.get(key) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}
function keysOnWaitlessCycles(steps, known) {
  const waitless = new Map;
  for (const step of steps) {
    if (step.kind !== "wait") {
      waitless.set(step.key, targetsOf(step).filter((t) => known.has(t) && !isWait(steps, t)));
    }
  }
  const onCycle = new Set;
  for (const [key, outs] of waitless) {
    if (reach(outs, waitless).has(key)) {
      onCycle.add(key);
    }
  }
  return onCycle;
}
function isWait(steps, key) {
  return steps.some((s) => s.key === key && s.kind === "wait");
}
function findSequenceProblems(steps) {
  const problems = [];
  const add = (code, stepKey) => {
    if (!problems.some((p) => p.code === code && p.stepKey === stepKey)) {
      problems.push({ code, stepKey });
    }
  };
  const known = new Set;
  for (const step of steps) {
    if (known.has(step.key)) {
      add("duplicate_key", step.key);
    }
    known.add(step.key);
  }
  const edges = new Map;
  for (const step of steps) {
    const valid = [];
    for (const target of targetsOf(step)) {
      if (known.has(target)) {
        valid.push(target);
      } else {
        add("unknown_target", step.key);
      }
    }
    edges.set(step.key, valid);
  }
  const first = steps[0];
  if (first === undefined) {
    return problems;
  }
  const reachable = reach([first.key], edges);
  for (const step of steps) {
    if (!reachable.has(step.key)) {
      add("unreachable_step", step.key);
    }
  }
  for (const key of keysOnWaitlessCycles(steps, known)) {
    add("cycle_without_wait", key);
  }
  const reverse = new Map;
  for (const [from, outs] of edges) {
    for (const to of outs) {
      reverse.set(to, [...reverse.get(to) ?? [], from]);
    }
  }
  const ends = steps.filter((s) => s.kind === "end").map((s) => s.key);
  const canEnd = reach(ends, reverse);
  for (const step of steps) {
    if (reachable.has(step.key) && !canEnd.has(step.key)) {
      add("no_path_to_end", step.key);
    }
  }
  return problems.slice(0, MAX_SEQUENCE_PROBLEMS);
}
var sequenceStepsSchema = z54.array(stepSchema).min(1).max(MAX_SEQUENCE_STEPS).superRefine((steps, ctx) => {
  for (const problem of findSequenceProblems(steps)) {
    ctx.addIssue({
      code: "custom",
      path: [steps.findIndex((s) => s.key === problem.stepKey)],
      message: `${problem.code}: ${problem.stepKey}`
    });
  }
});
var setSequenceRequestSchema = z54.strictObject({
  expectedVersion: z54.number().int().min(0).max(1e6),
  steps: sequenceStepsSchema
});
var sequenceSchema = z54.strictObject({
  campaignId: campaignIdSchema,
  version: z54.number().int().min(0).max(1e6),
  steps: z54.array(stepSchema).max(MAX_SEQUENCE_STEPS),
  updatedAt: timestampSchema
});

// src/campaign/play.ts
var PLAY_INTENTS = [
  "cold_intro",
  "closed_lost_reengagement",
  "post_event_follow_up",
  "nurture"
];
var playIntentSchema = z55.enum(PLAY_INTENTS);
var PLAY_SOURCES = ["builtin", "seeded", "custom"];
var playSourceSchema = z55.enum(PLAY_SOURCES);
var PLAY_STATUSES = ["proposed", "accepted", "discarded"];
var playStatusSchema = z55.enum(PLAY_STATUSES);
var playCitationSchema = z55.discriminatedUnion("kind", [
  z55.strictObject({
    kind: z55.literal("moment"),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema
  }),
  z55.strictObject({
    kind: z55.literal("document"),
    documentId: documentIdSchema,
    page: z55.number().int().min(1).max(1e5).nullable()
  })
]);
var playSchema = z55.strictObject({
  id: playIdSchema,
  name: campaignNameSchema,
  intent: playIntentSchema,
  goal: goalSchema,
  source: playSourceSchema,
  status: playStatusSchema,
  steps: sequenceStepsSchema,
  citations: z55.array(playCitationSchema).max(MAX_PLAY_CITATIONS),
  evidenceCount: countSchema2,
  noEvidence: z55.boolean(),
  createdByMembershipId: membershipIdSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((p, ctx) => {
  if (p.noEvidence !== (p.citations.length === 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["noEvidence"],
      message: "noEvidence is true exactly when there is no citation"
    });
  }
  if (p.evidenceCount < p.citations.length) {
    ctx.addIssue({
      code: "custom",
      path: ["evidenceCount"],
      message: "The evidence count is at least the citations shown"
    });
  }
});
var playParamsSchema = z55.strictObject({ playId: playIdSchema });
var listPlaysQuerySchema = pageQuerySchema.extend({
  intent: playIntentSchema.optional(),
  status: playStatusSchema.optional(),
  source: playSourceSchema.optional()
}).strict();
var listPlaysResponseSchema = pageSchema(playSchema);
var playCursorSchema = z55.strictObject({ createdAt: timestampSchema, id: playIdSchema });
var createPlayRequestSchema = z55.strictObject({
  name: campaignNameSchema,
  intent: playIntentSchema,
  goal: goalSchema,
  steps: sequenceStepsSchema
});
var editPlayRequestSchema = z55.strictObject({
  name: campaignNameSchema.optional(),
  goal: goalSchema.optional(),
  steps: sequenceStepsSchema.optional()
}).refine((body) => Object.keys(body).length > 0, "Change at least one field");
var proposePlaysRequestSchema = z55.strictObject({
  intent: playIntentSchema,
  count: z55.number().int().min(1).max(MAX_PROPOSED_PLAYS).default(3)
});
var proposePlaysResponseSchema = z55.strictObject({
  plays: z55.array(playSchema).max(MAX_PROPOSED_PLAYS)
});
var acceptPlayRequestSchema = z55.strictObject({
  acknowledgeNoEvidence: z55.boolean().default(false)
});
// src/campaign/routes.ts
var CAMPAIGN_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var CAMPAIGN_ADMIN_ROLES = ["owner", "admin"];
var VISIBILITY2 = "An Owner or Admin sees every Campaign; a Manager sees those owned by Reps on their Team; a Rep sees only their own. A Campaign, Enrollment or Prospect outside the caller's view is campaign.not_found or enrollment.not_found (404), never 403, and one of another Organization the same.";
var NO_TRACKING = "Closeline puts no open or click tracking in any message; nothing here reports or branches on opens or clicks.";
var NO_TEXT3 = "No response, event or log carries a message body, a subject or an address: ids and closed values only.";
var KEY3 = "Requires an Idempotency-Key header: a replay answers the same result and does the work once.";
var CAMPAIGN_ROUTES = Object.freeze({
  listCampaigns: inboundRoute({
    method: "GET",
    path: "/v1/campaigns",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Campaigns, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by state, owner and Team. A filter never widens what the caller may see. ${VISIBILITY2}`
  }),
  createCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["play.not_found", "play.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Creates a Campaign in draft with no Steps, owned by the caller: name, goal, audience, approval mode (review when left out), send window and its zone, and a daily cap. With a playId the Sequence starts as a copy of that accepted Play; one that is not accepted is play.invalid_state. ${KEY3} A replay answers 200 with the same Campaign. Prospects are not enrolled until launch.`
  }),
  getCampaign: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found"],
    commonErrors: [],
    description: `Reads one Campaign: settings, audience, state, the Sequence version saved and the version previewed. ${VISIBILITY2}`
  }),
  updateCampaign: inboundRoute({
    method: "PATCH",
    path: "/v1/campaigns/{campaignId}",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found", "campaign.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Changes the settings of a Campaign (name, goal, audience, approval mode, send window and zone, daily cap, Team) in the fields sent. Changing the audience or window of a ready Campaign returns it to draft; an archived Campaign cannot change (campaign.invalid_state). A change to the audience makes the last audience check stale. ${KEY3} The owner may change their own; an Admin or Owner any; a Manager one owned by a Rep on their Team. ${VISIBILITY2}`
  }),
  duplicateCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/duplicate",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Copies a Campaign into a new draft owned by the caller, with the same settings, audience and Sequence under a new name; Enrollments, results and the preview are not copied. ${KEY3} A replay answers 200 with the same copy. ${VISIBILITY2}`
  }),
  archiveCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/archive",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Archives a Campaign: nothing more is sent, every active Enrollment stops with the reason campaign_archived (and enrollment.stopped is published for each, in batches off the request path), and history stays. ${KEY3} Archiving one already archived answers 200 and changes nothing. Owner and Admin only. ${VISIBILITY2}`
  }),
  pauseCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/pause",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found", "campaign.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Pauses a running Campaign: nothing is sent and Enrollments keep their place. ${KEY3} Pausing one already paused answers 200; a Campaign that is not running or paused is campaign.invalid_state. The owner may pause their own; an Admin or Owner any; a Manager one owned by a Rep on their Team. ${VISIBILITY2}`
  }),
  resumeCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/resume",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found", "campaign.invalid_state", "campaign.no_healthy_mailbox"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Resumes a paused Campaign. Steps that came due while paused are sent within the send window and the Mailbox limits, not all at once; Contact Consent and suppression are checked again at each send. ${KEY3} Resuming one already running answers 200. With no healthy Mailbox it is campaign.no_healthy_mailbox. ${VISIBILITY2}`
  }),
  launchCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/launch",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "campaign.not_found",
      "campaign.invalid_state",
      "campaign.invalid_sequence",
      "campaign.not_previewed",
      "campaign.audience_check_pending",
      "campaign.audience_empty",
      "campaign.no_healthy_mailbox"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Launches a draft or ready Campaign: it runs the launch check again and, if every check passes, starts running and publishes campaign.launched. It fails with the code of the first check that does not pass: campaign.invalid_sequence, campaign.not_previewed (the current Sequence version was not previewed), campaign.audience_check_pending, campaign.audience_empty or campaign.no_healthy_mailbox. Prospects are enrolled in bounded batches off the request path. There is no way to launch past a failed check and no setting that skips consent or suppression. ${KEY3} Launching one already running answers 200. Owner and Admin only. ${VISIBILITY2}`
  }),
  getCampaignStats: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}/stats",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found"],
    commonErrors: [],
    description: `Reads counts for a Campaign: enrolled, active, completed, stopped, sent, replied, positive replies (empty until replies are classified), meetings, bounced and unsubscribed. ${NO_TRACKING} ${VISIBILITY2}`
  }),
  getSequence: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}/sequence",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found"],
    commonErrors: [],
    description: `Reads the saved Sequence of a Campaign: its version and Steps (email, wait, branch, Rep task, end), at most 50. Version 0 is the empty Sequence of a new Campaign. ${VISIBILITY2}`
  }),
  setSequence: inboundRoute({
    method: "PUT",
    path: "/v1/campaigns/{campaignId}/sequence",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "campaign.not_found",
      "campaign.invalid_state",
      "campaign.invalid_sequence",
      "campaign.sequence_version_conflict",
      "variant.invalid_weights"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Replaces the Steps of a draft, ready or paused Campaign with a new Sequence version, given the version the caller edited (expectedVersion). The Sequence must be valid: no loop that passes no wait, no unreachable Step, every target a known Step, every Step able to reach an end, every branch with a default. The body schema rejects these inputs, and the service answers with the area codes rather than request.invalid once the envelope parses: a graph problem is campaign.invalid_sequence (422) with the problems in details; a test whose Variants are not two to four with weights adding up to 100 is variant.invalid_weights (422); a stale expectedVersion is campaign.sequence_version_conflict (409); a running or archived Campaign is campaign.invalid_state. A new version needs a new preview and returns a ready Campaign to draft. Enrollments already in the Sequence keep the version they started on. ${KEY3} Repeating the same body at the same expectedVersion changes nothing. ${NO_TEXT3} ${VISIBILITY2}`
  }),
  startAudienceCheck: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/audience-check",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found", "campaign.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Starts an audience check of the Campaign's current audience in the background and answers 202 with the check in the pending state. The check counts verified and unverified addresses, suppressed Prospects, Prospects with no Contact Consent for email and Prospects already in another active Campaign; it never lists people and the work is off the request path. ${KEY3} A replay returns the same check; a check already pending for the same audience is returned, not repeated. An archived Campaign is campaign.invalid_state. ${VISIBILITY2}`
  }),
  getAudienceCheck: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}/audience-check",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found"],
    commonErrors: [],
    description: `Reads the latest audience check: pending, ready with the counts, or failed, and the audience version it read so a stale result is not taken for the current one. Poll until it is not pending. ${VISIBILITY2}`
  }),
  getLaunchCheck: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}/launch-check",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found"],
    commonErrors: [],
    description: `Reports whether the Campaign can launch now: four checks (Sequence, preview, audience, Mailbox) each pass, fail or pending with the code a launch would return, and canLaunch only when all pass. It shows the counts of Prospects that would be refused for suppression and for missing Contact Consent, and the daily capacity of the healthy Mailboxes. It changes nothing and has no bypass. ${VISIBILITY2}`
  }),
  enrollProspects: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/enrollments",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found", "campaign.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Enrolls 1 to 100 listed Prospects into a running or paused Campaign and answers one result per Prospect in the order asked: enrolled, or refused with suppressed (enrollment.suppressed), no_consent (enrollment.no_consent) or already_active (enrollment.already_active; one active Campaign per Prospect, with no setting to change that). A refusal does not fail the request. ${KEY3} A Prospect already in this Campaign is already_active with its Enrollment's id; a replay changes nothing. Only Prospects the caller may see are enrolled; any other, and an unknown one, is refused as not_found (enrollment.not_found) with no Enrollment id, so existence is not revealed. A draft or archived Campaign is campaign.invalid_state. ${VISIBILITY2}`
  }),
  listEnrollments: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}/enrollments",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the Enrollments of a Campaign, newest first (by enrolledAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by state, stop reason and Prospect. Each shows its Step, attempt epoch and when it is next due. ${VISIBILITY2}`
  }),
  getEnrollment: inboundRoute({
    method: "GET",
    path: "/v1/enrollments/{enrollmentId}",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["enrollment.not_found"],
    commonErrors: [],
    description: `Reads one Enrollment with its state, stop reason, current Step and when it is next due. ${VISIBILITY2}`
  }),
  listEnrollmentActivity: inboundRoute({
    method: "GET",
    path: "/v1/enrollments/{enrollmentId}/activity",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["enrollment.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the log of one Enrollment, newest first (by occurredAt, then id), one cursor-paginated page at a time (at most 100): Steps entered, sends with their send record id, branches taken, Rep tasks, and how it ended. ${NO_TEXT3} ${VISIBILITY2}`
  }),
  removeEnrollment: inboundRoute({
    method: "DELETE",
    path: "/v1/enrollments/{enrollmentId}",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrollment.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Takes a Prospect out of the Campaign: the Enrollment stops with the reason removed_by_rep, nothing more is sent, and enrollment.stopped is published. ${KEY3} Removing one already ended answers 200 and publishes nothing again. The Campaign's owner, an Admin or an Owner may; a Manager one owned by a Rep on their Team. ${VISIBILITY2}`
  }),
  getVariantResults: inboundRoute({
    method: "GET",
    path: "/v1/campaigns/{campaignId}/steps/{stepKey}/variants",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["campaign.not_found", "variant.not_found"],
    commonErrors: [],
    description: `Reads the results of the Variants of one email Step: sent, delivered, replied, positive replies (empty until classified), bounced and unsubscribed, and the reply rate with a 95% interval. Below the minimum sample for every Variant the status is not_enough_data and no interval is shown, so a winner is never called early. A Step with no test is variant.not_found. ${NO_TRACKING} ${VISIBILITY2}`
  }),
  promoteVariant: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/steps/{stepKey}/variants/{variantKey}/promote",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["campaign.not_found", "variant.not_found", "variant.already_promoted"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Promotes a Variant to the winner of its Step: every later send of the Step uses it, and variant.promoted is published with the person. ${KEY3} Promoting the same Variant again answers 200 and changes nothing; promoting a different one once a winner exists is variant.already_promoted (409). Owner and Admin only. ${VISIBILITY2}`
  }),
  listPlays: inboundRoute({
    method: "GET",
    path: "/v1/plays",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the Organization's Plays, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by intent, status and source. Each shows the evidence it cites, by id, and noEvidence when it cites none. Every role may read; proposed and discarded Plays are listed to Owner and Admin only.`
  }),
  getPlay: inboundRoute({
    method: "GET",
    path: "/v1/plays/{playId}",
    roles: CAMPAIGN_ALL_ROLES,
    publicApi: { scope: "campaigns:read" },
    success: [200],
    idempotent: false,
    errors: ["play.not_found"],
    commonErrors: [],
    description: `Reads one Play with its Steps and the evidence it cites, by id: Moments of won Deals' calls and pages of documents, never their text. A Play of another Organization is play.not_found (404), and so is a proposed or discarded Play for anyone but an Owner or Admin.`
  }),
  createPlay: inboundRoute({
    method: "POST",
    path: "/v1/plays",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Writes a custom Play, accepted at once: a name, an intent, a goal and a valid Sequence. ${KEY3} A replay answers 200 with the same Play. Owner and Admin only.`
  }),
  editPlay: inboundRoute({
    method: "PATCH",
    path: "/v1/plays/{playId}",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["play.not_found", "play.read_only", "play.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Edits the name, goal or Steps of a custom or proposed Play in the fields sent. A built-in Play is play.read_only (409) and a discarded one play.invalid_state. Campaigns made from a Play are copies and do not change. ${KEY3} Owner and Admin only.`
  }),
  proposePlays: inboundRoute({
    method: "POST",
    path: "/v1/plays/propose",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS, "server.unavailable", "server.timeout"],
    description: `Proposes up to 5 Plays for an intent from the Organization's won Deals and Playbook, each in the proposed status and citing the Moments and pages it rests on by id. It answers at once, and with fewer than asked, or none, when the Playbook cannot support them; a Play with no evidence says so (noEvidence). Source material is untrusted data and never instructions. ${KEY3} A replay returns the same proposals. A model or search that does not answer in time is server.unavailable or server.timeout and nothing is stored. Owner and Admin only.`
  }),
  acceptPlay: inboundRoute({
    method: "POST",
    path: "/v1/plays/{playId}/accept",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["play.not_found", "play.no_evidence", "play.invalid_state", "play.read_only"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Accepts a proposed Play so Campaigns can start from it. A Play that cites no evidence is play.no_evidence (409) unless the body acknowledges that (acknowledgeNoEvidence). ${KEY3} Accepting one already accepted answers 200; a discarded one is play.invalid_state; a built-in one is play.read_only. Owner and Admin only.`
  }),
  discardPlay: inboundRoute({
    method: "POST",
    path: "/v1/plays/{playId}/discard",
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["play.not_found", "play.read_only"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Discards a proposed or custom Play; Campaigns already made from it are unaffected. ${KEY3} Discarding one already discarded answers 200; a built-in one is play.read_only. Owner and Admin only.`
  })
});
// src/chat/chat.ts
import { z as z57 } from "zod";

// src/inquiry/values.ts
import { z as z56 } from "zod";
var INQUIRY_SOURCES = ["form", "chat", "call"];
var inquirySourceSchema = z56.enum(INQUIRY_SOURCES);
var INQUIRY_CALLBACK_STATES = [
  "not_applicable",
  "pending",
  "dialling",
  "connected",
  "no_answer",
  "skipped",
  "failed"
];
var inquiryCallbackStateSchema = z56.enum(INQUIRY_CALLBACK_STATES);
var INQUIRY_SKIP_REASONS = [
  "agent_paused",
  "no_consent",
  "consent_revoked",
  "suppressed",
  "outside_hours",
  "consent_check_unavailable",
  "no_phone_number",
  "concurrency_cap",
  "retries_exhausted"
];
var inquirySkipReasonSchema = z56.enum(INQUIRY_SKIP_REASONS);
var MAX_CALLBACK_ATTEMPTS = 3;
var MAX_ALLOWED_ORIGINS = 20;
var allowedOriginSchema = z56.string().max(255).regex(/^(https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:[0-9]{1,5})?|http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{1,5})?)$/);
var inquiryKeySchema = z56.string().regex(/^[A-Za-z0-9_-]{32,64}$/);
var MAX_SOURCE_URL_LENGTH = 2048;
var sourceUrlSchema = z56.string().max(MAX_SOURCE_URL_LENGTH).regex(/^https?:\/\/[^\s]+$/);
var MAX_INQUIRY_MESSAGE_LENGTH = 2000;
var inquiryMessageSchema = boundedTextSchema(MAX_INQUIRY_MESSAGE_LENGTH);
var MAX_HONEYPOT_LENGTH = 200;

// src/chat/chat.ts
var chatTextSchema = boundedTextSchema(MAX_TURN_TEXT_LENGTH);
var chatSessionTokenSchema = z57.string().regex(/^[A-Za-z0-9_-]{32,64}$/);
var CHAT_STATES = ["open", "handed_off", "closed"];
var chatStateSchema = z57.enum(CHAT_STATES);
var publicChatKeyParamsSchema = z57.strictObject({ key: inquiryKeySchema });
var publicChatSessionParamsSchema = z57.strictObject({
  sessionToken: chatSessionTokenSchema
});
var publicChatOriginHeadersSchema = z57.object({ origin: allowedOriginSchema });
var publicChatHeadersSchema = z57.object({
  origin: allowedOriginSchema,
  "idempotency-key": idempotencyKeySchema
});
var publicStartChatRequestSchema = z57.strictObject({
  sourceUrl: sourceUrlSchema,
  website: z57.string().max(MAX_HONEYPOT_LENGTH).default("")
});
var publicChatMessageSchema = z57.strictObject({
  index: z57.number().int().min(0),
  role: agentTurnRoleSchema,
  text: chatTextSchema,
  at: timestampSchema
});
var publicStartChatResponseSchema = z57.strictObject({
  sessionToken: chatSessionTokenSchema,
  expiresAt: timestampSchema,
  messages: z57.array(publicChatMessageSchema).min(1).max(5)
});
var publicSendChatMessageRequestSchema = z57.strictObject({ text: chatTextSchema });
var publicChatReplySchema = z57.strictObject({
  text: chatTextSchema,
  deferred: z57.boolean(),
  handoffOffered: z57.boolean(),
  at: timestampSchema
});
var publicChatMessageReplySchema = z57.strictObject({ reply: publicChatReplySchema });
var publicListChatMessagesQuerySchema = pageQuerySchema.strict();
var publicChatMessagePageSchema = pageSchema(publicChatMessageSchema);
var publicChatConsentRequestSchema = z57.strictObject({
  name: personNameSchema,
  phone: rawPhoneSchema,
  consentWordingId: consentWordingIdSchema,
  consentWordingVersion: z57.number().int().min(1),
  callbackConsent: z57.boolean(),
  sourceUrl: sourceUrlSchema
});
var publicChatConsentReceiptSchema = z57.strictObject({
  received: z57.literal(true),
  receivedAt: timestampSchema
});
var publicChatHandoffRequestSchema = z57.strictObject({});
var publicChatHandoffReplySchema = z57.strictObject({
  requested: z57.literal(true),
  at: timestampSchema
});
var chatParamsSchema = z57.strictObject({ chatId: chatIdSchema });
var chatSchema = z57.strictObject({
  id: chatIdSchema,
  prospectId: prospectIdSchema.nullable(),
  inquiryId: inquiryIdSchema.nullable(),
  state: chatStateSchema,
  sourceUrl: sourceUrlSchema,
  startedAt: timestampSchema,
  lastMessageAt: timestampSchema,
  closedAt: timestampSchema.nullable()
});
var chatMessageSchema = z57.strictObject({
  index: z57.number().int().min(0),
  role: agentTurnRoleSchema,
  text: chatTextSchema,
  sources: z57.array(copilotDocumentSourceSchema).max(MAX_TURN_SOURCES),
  deferred: z57.boolean(),
  at: timestampSchema
});
var listChatsQuerySchema = pageQuerySchema.extend({ state: chatStateSchema.optional() }).strict();
var chatPageSchema = pageSchema(chatSchema);
var listChatMessagesQuerySchema = pageQuerySchema.strict();
var chatMessagePageSchema = pageSchema(chatMessageSchema);
// src/chat/errors.ts
var CHAT_ERRORS = {
  ...defineErrors("chat", {
    origin_not_allowed: { status: 403, message: "This site is not allowed to start a Chat." },
    key_invalid: { status: 404, message: "The Chat was not found." },
    session_not_found: { status: 404, message: "The Chat session was not found." },
    session_closed: { status: 409, message: "This Chat has ended." },
    consent_wording_missing: {
      status: 422,
      message: "The consent wording shown with the Chat is missing or out of date."
    },
    not_found: { status: 404, message: "The Chat was not found." }
  })
};
// src/chat/routes.ts
var CHAT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var VISIBILITY3 = "An Owner or Admin sees every Chat; a Manager sees those handed to Reps of their Team; a Rep sees only those handed to them. A Chat outside the caller's view is chat.not_found (404), never 403.";
var PUBLIC_SECRET = "The key or token in the path is a secret: services redact it from logs, traces and error reports. A 429 (rate.limited) carries a Retry-After header.";
var PUBLIC_REPLAY = ["request.idempotency_key_reused", "request.idempotency_in_progress"];
var CHAT_ROUTES = Object.freeze({
  publicStartChat: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/{key}/sessions",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["chat.origin_not_allowed", "chat.key_invalid"],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the Organization's publishable key in the path stands in for both. Starts a Chat from the website widget with the page address. The Origin header must be an allowed origin (chat.origin_not_allowed, 403). Requires an Idempotency-Key header (16 to 128 characters; the client generates one per Chat): a replay answers the original session with 200 and starts one Chat. Answers 201 with a secret session token, its expiry and the opening message, which says the visitor is talking to an AI. No Chat, Prospect or Rep id. A visitor-started Chat needs no Contact Consent; only a callback does. A filled honeypot (website) is answered like an accepted start but stores nothing: the session token it returns is an unusable session token, and any later call with it is chat.session_not_found. Rate-limited by client address and by key. ${PUBLIC_SECRET}`
  }),
  publicSendChatMessage: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/sessions/{sessionToken}/messages",
    roles: [],
    public: true,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["chat.origin_not_allowed", "chat.session_not_found", "chat.session_closed"],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor says something and gets the Inbound Agent's reply: its text, whether it deferred to a follow-up and whether it offered a Rep. Never a Playbook source, a tool call, or a Rep or internal id. Requires an Idempotency-Key header: a replay answers the original reply and does not ask the model again; the same key with another body is request.idempotency_key_reused. An unknown or expired token is chat.session_not_found (404) and an ended Chat is chat.session_closed (409). The Origin header must match an allowed origin. Rate-limited by client address and by session. ${PUBLIC_SECRET}`
  }),
  publicListChatMessages: inboundRoute({
    method: "GET",
    path: "/v1/public/chat/sessions/{sessionToken}/messages",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["chat.origin_not_allowed", "chat.session_not_found"],
    commonErrors: [...PUBLIC_ERRORS],
    description: `Public: no token, no Organization; the session token in the path stands in for both. Lists the messages of the visitor's own Chat, oldest first, one cursor-paginated page at a time (at most 100), so a reloaded page can show them again. Each is a role, text and time only. The Origin header must match an allowed origin. Rate-limited by client address and by session. ${PUBLIC_SECRET}`
  }),
  publicChatConsent: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/sessions/{sessionToken}/callback-consent",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "chat.origin_not_allowed",
      "chat.session_not_found",
      "chat.session_closed",
      "chat.consent_wording_missing"
    ],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor asks for a callback from inside the Chat with their name, phone number, the Consent Wording id and version shown, whether they agreed, and the page address. The wording version and page address are required; a version that is not the one shown is chat.consent_wording_missing (422) and nothing is recorded. Core upserts the Prospect, records the Contact Consent for the phone channel from the wording version, the page address and the time, and the Chat becomes an Inquiry; with the box unticked the details are kept and no call is placed. Requires an Idempotency-Key header: a replay answers the original receipt. Answers a receipt with no Inquiry, Prospect or Rep id. Publishes voice.inquiry.received. ${PUBLIC_SECRET}`
  }),
  publicRequestChatHandoff: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/sessions/{sessionToken}/handoff",
    roles: [],
    public: true,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "chat.origin_not_allowed",
      "chat.session_not_found",
      "chat.session_closed",
      "handoff.no_rep_available"
    ],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor asks to talk to a Rep. The Handoff is routed by the Organization's rules and answers 202 that a Rep was asked to join, with no Rep id or name. If no Rep is available it is handoff.no_rep_available (409) and the Inbound Agent offers a Booking in the Chat. Requires an Idempotency-Key header: a replay answers the original result and does not ask a second Rep. ${PUBLIC_SECRET}`
  }),
  listChats: inboundRoute({
    method: "GET",
    path: "/v1/chats",
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Chats, latest first, one cursor-paginated page at a time (at most 100), optionally by state (open, handed_off or closed). ${VISIBILITY3}`
  }),
  getChat: inboundRoute({
    method: "GET",
    path: "/v1/chats/{chatId}",
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["chat.not_found"],
    commonErrors: [],
    description: `Reads one Chat: its state, the page it began on and the Prospect and Inquiry it led to, if any. ${VISIBILITY3}`
  }),
  listChatMessages: inboundRoute({
    method: "GET",
    path: "/v1/chats/{chatId}/messages",
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["chat.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the messages of a Chat, oldest first, one cursor-paginated page at a time (at most 100), with the Playbook passages each Agent answer used. Message text is the visitor's own words and untrusted. ${VISIBILITY3}`
  })
});
// src/consent/contact-check.ts
import { z as z58 } from "zod";
var CONTACT_DENIAL_CODES = [
  "consent.missing",
  "consent.withdrawn",
  "consent.suppressed",
  "consent.unavailable"
];
var contactDenialCodeSchema = z58.enum(CONTACT_DENIAL_CODES);
var CONTACT_ALLOW_BASES = [
  "consent_granted",
  "rep_initiated",
  "reply",
  "email_no_suppression"
];
var MAX_CALLER_LENGTH = 32;
var contactCheckRequestSchema = z58.strictObject({
  organizationId: organizationIdSchema,
  prospectId: prospectIdSchema.optional(),
  ...addressFieldsShape,
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z58.string().min(1).max(MAX_CALLER_LENGTH).regex(/^[a-z][a-z0-9_-]*$/)
}).refine((body) => [body.prospectId, body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1, "Give exactly one of prospectId, email, phone or linkedinUrl");
var allowedSchema = z58.strictObject({
  allowed: z58.literal(true),
  checkId: contactCheckIdSchema,
  basis: z58.enum(CONTACT_ALLOW_BASES)
});
var deniedSchema = z58.strictObject({
  allowed: z58.literal(false),
  checkId: contactCheckIdSchema.nullable(),
  code: contactDenialCodeSchema,
  suppressionReason: suppressionReasonSchema.nullable()
}).refine((r) => r.code === "consent.suppressed" === (r.suppressionReason !== null), "Only a suppressed denial carries a Suppression reason").refine((r) => r.code === "consent.unavailable" === (r.checkId === null), "Only an unavailable denial has no logged check");
var contactCheckResultSchema = z58.union([allowedSchema, deniedSchema]);
var contactCheckLogEntrySchema = z58.object({
  id: contactCheckIdSchema,
  prospectId: prospectIdSchema.nullable(),
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z58.string().min(1).max(MAX_CALLER_LENGTH),
  allowed: z58.boolean(),
  code: contactDenialCodeSchema.nullable(),
  basis: z58.enum(CONTACT_ALLOW_BASES).nullable(),
  checkedAt: timestampSchema
});
var listContactChecksQuerySchema = pageQuerySchema.extend({
  channel: consentChannelSchema.optional(),
  purpose: contactPurposeSchema.optional(),
  allowed: z58.enum(["true", "false"]).optional(),
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
import { z as z59 } from "zod";
var consentGrantedEvent = defineEvent("consent.granted", 1, z59.strictObject({
  consentEventId: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  source: consentGrantSourceSchema,
  wordingId: consentWordingIdSchema
}));
var consentWithdrawnEvent = defineEvent("consent.withdrawn", 1, z59.strictObject({
  consentEventId: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  source: consentWithdrawalSourceSchema,
  stopAll: z59.boolean()
}));
var suppressionAddedEvent = defineEvent("suppression.added", 1, z59.strictObject({
  suppressionEntryId: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema,
  reason: suppressionReasonSchema,
  prospectId: prospectIdSchema.nullable()
}));
var suppressionRemovedEvent = defineEvent("suppression.removed", 1, z59.strictObject({
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
import { z as z61 } from "zod";

// src/consent/ledger.ts
import { z as z60 } from "zod";
var CONSENT_STATES = ["granted", "withdrawn", "none"];
var consentStateSchema = z60.enum(CONSENT_STATES);
var consentEventSchema = z60.object({
  id: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  kind: z60.enum(["granted", "withdrawn"]),
  source: consentSourceSchema,
  wordingId: consentWordingIdSchema.nullable(),
  evidenceRef: evidenceRefSchema.nullable(),
  callId: callIdSchema.nullable(),
  formId: consentFormIdSchema.nullable(),
  stopAll: z60.boolean(),
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
var channelConsentSchema = z60.object({
  channel: consentChannelSchema,
  state: consentStateSchema,
  since: timestampSchema.nullable(),
  lastEventId: consentEventIdSchema.nullable(),
  wordingId: consentWordingIdSchema.nullable()
}).refine((c) => c.state === "none" === (c.since === null && c.lastEventId === null) && (c.state === "granted" || c.wordingId === null), "A channel with no event has no time or event; only a grant carries wording");
var prospectConsentSchema = z60.object({
  prospectId: prospectIdSchema,
  channels: z60.array(channelConsentSchema).length(CONSENT_CHANNELS.length),
  suppressed: z60.boolean(),
  suppressionReason: suppressionReasonSchema.nullable()
}).refine((c) => new Set(c.channels.map((channel) => channel.channel)).size === CONSENT_CHANNELS.length, "Each channel appears once").refine((c) => c.suppressed === (c.suppressionReason !== null), "A suppressed Prospect has a reason");
var recordConsentRequestSchema = z60.strictObject({
  channel: consentChannelSchema,
  source: z60.enum(CONSENT_RECORDABLE_SOURCES),
  wordingId: consentWordingIdSchema,
  evidenceRef: evidenceRefSchema,
  callId: callIdSchema.optional(),
  occurredAt: timestampSchema.optional()
}).refine((body) => body.source === "verbal_call" === (body.callId !== undefined), "A verbal grant names the Call, and only a verbal grant does");
var withdrawConsentRequestSchema = z60.strictObject({
  channels: z60.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length).refine((channels) => new Set(channels).size === channels.length, "No repeats").optional(),
  all: z60.literal(true).optional(),
  occurredAt: timestampSchema.optional()
}).refine((body) => body.channels === undefined !== (body.all === undefined), "Give channels or all");
var consentProspectParamsSchema = z60.strictObject({ prospectId: prospectIdSchema });
var listConsentEventsQuerySchema = pageQuerySchema.extend({ channel: consentChannelSchema.optional() }).strict();
var consentEventPageSchema = pageSchema(consentEventSchema);
var recordedConsentSchema = z60.object({
  events: z60.array(consentEventSchema).min(1).max(CONSENT_CHANNELS.length),
  consent: prospectConsentSchema
});

// src/consent/evidence.ts
var MAX_IP_LENGTH = 64;
var MAX_USER_AGENT_LENGTH = 512;
var evidenceEventSchema = consentEventSchema.and(z61.object({
  wording: z61.object({
    id: consentWordingIdSchema,
    version: z61.number().int().min(1),
    text: z61.string().min(1).max(1e4)
  }).nullable(),
  submission: z61.object({
    ipAddress: z61.string().min(1).max(MAX_IP_LENGTH),
    userAgent: z61.string().max(MAX_USER_AGENT_LENGTH)
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
import { z as z63 } from "zod";

// src/consent/wording.ts
import { z as z62 } from "zod";
var MAX_CONSENT_WORDING_LENGTH = 5000;
var MAX_CONSENT_FORM_NAME_LENGTH = 100;
var consentWordingTextSchema = z62.string().max(MAX_CONSENT_WORDING_LENGTH * 2).trim().pipe(z62.string().min(1).max(MAX_CONSENT_WORDING_LENGTH).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
var channelsSchema = z62.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length).refine((channels) => new Set(channels).size === channels.length, "No repeats");
var consentWordingSchema = z62.object({
  id: consentWordingIdSchema,
  version: z62.number().int().min(1),
  text: consentWordingTextSchema,
  channels: channelsSchema,
  locked: z62.boolean(),
  supersedesId: consentWordingIdSchema.nullable(),
  createdAt: timestampSchema,
  createdByUserId: userIdSchema
}).refine((w) => w.version === 1 === (w.supersedesId === null), "Only version 1 supersedes nothing");
var consentWordingParamsSchema = z62.strictObject({ wordingId: consentWordingIdSchema });
var createConsentWordingRequestSchema = z62.strictObject({
  text: consentWordingTextSchema,
  channels: channelsSchema
});
var updateConsentWordingRequestSchema = z62.strictObject({ text: consentWordingTextSchema.optional(), channels: channelsSchema.optional() }).refine((body) => body.text !== undefined || body.channels !== undefined, "Change something");
var listConsentWordingsQuerySchema = pageQuerySchema.strict();
var consentWordingPageSchema = pageSchema(consentWordingSchema);
var CONSENT_FORM_STATES = ["draft", "published", "closed"];
var consentFormStateSchema = z62.enum(CONSENT_FORM_STATES);
var consentFormSchema = z62.object({
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
var consentFormParamsSchema = z62.strictObject({ formId: consentFormIdSchema });
var createConsentFormRequestSchema = z62.strictObject({
  wordingId: consentWordingIdSchema,
  name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
  channels: channelsSchema
});
var listConsentFormsQuerySchema = pageQuerySchema.extend({ state: consentFormStateSchema.optional() }).strict();
var consentFormPageSchema = pageSchema(consentFormSchema);

// src/consent/public.ts
var consentTokenParamsSchema = z63.strictObject({ token: consentTokenSchema });
var MAX_NAME_LENGTH2 = 100;
var PHONE_CHANNELS = ["phone", "sms", "whatsapp"];
var choiceSchema = z63.strictObject({
  channel: consentChannelSchema,
  agreed: z63.boolean()
});
var hostedConsentSubmissionSchema = z63.strictObject({
  wordingId: consentWordingIdSchema,
  firstName: boundedTextSchema(MAX_NAME_LENGTH2).optional(),
  lastName: boundedTextSchema(MAX_NAME_LENGTH2).optional(),
  email: addressFieldsShape.email,
  phone: addressFieldsShape.phone,
  choices: z63.array(choiceSchema).min(1).max(CONSENT_CHANNELS.length).refine((choices) => new Set(choices.map((c) => c.channel)).size === choices.length, "No repeats")
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
var hostedConsentFormViewSchema = z63.object({
  organizationName: boundedTextSchema(200),
  wordingId: consentWordingIdSchema,
  wordingVersion: z63.number().int().min(1),
  wordingText: consentWordingTextSchema,
  channels: z63.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length)
});
var hostedConsentReceiptSchema = z63.object({
  channels: z63.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length),
  recordedAt: timestampSchema
});
var unsubscribePreviewSchema = z63.object({
  organizationName: boundedTextSchema(200),
  channel: z63.literal("email")
});
var oneClickUnsubscribeRequestSchema = z63.strictObject({
  "List-Unsubscribe": z63.literal("One-Click")
});
var unsubscribeReceiptSchema = z63.object({
  unsubscribed: z63.literal(true),
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
var route8 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS4 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var CONSENT_ROUTES = Object.freeze({
  getProspectConsent: route8({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: "consent:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads a Prospect's Contact Consent on each channel, derived from the ledger, and whether the Prospect is suppressed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  listProspectConsentEvents: route8({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent-events",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: "consent:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists a Prospect's consent ledger events, newest first, one cursor-paginated page at a time (at most 100); optionally one channel. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  recordConsent: route8({
    method: "POST",
    path: "/v1/prospects/{prospectId}/consents",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: "consent:write" },
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found", "consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Records a granted Contact Consent on one channel with the Consent Wording shown, the source and an evidence reference; without them it is refused (request.invalid). The source is never hosted_form. A verbal_call grant names the Call. Appends to the ledger and publishes consent.granted; answers 201, or 200 for a replay of the same Idempotency-Key. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  withdrawConsent: route8({
    method: "POST",
    path: "/v1/prospects/{prospectId}/consent-withdrawals",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: "consent:write" },
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Records a withdrawal of Contact Consent on the named channels, or on every channel with all: true. Appends to the ledger and publishes consent.withdrawn once per channel; the source is manual. A withdrawal never needs a reason and is always allowed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  getProspectConsentEvidence: route8({
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
  listConsentWordings: route8({
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
  getConsentWording: route8({
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
  createConsentWording: route8({
    method: "POST",
    path: "/v1/consent-wordings",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Writes a new Consent Wording (version 1) for the channels it covers. The text is the Organization's own, reviewed by its own counsel; Closeline ships none. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  updateConsentWording: route8({
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
  createConsentWordingVersion: route8({
    method: "POST",
    path: "/v1/consent-wordings/{wordingId}/versions",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Writes the next version of a Consent Wording; the old version stays as it was and keeps its evidence. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  listConsentForms: route8({
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
  getConsentForm: route8({
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
  createConsentForm: route8({
    method: "POST",
    path: "/v1/consent-forms",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Creates a draft hosted consent form from a Consent Wording and the channels to offer, each its own unticked choice. A wording that does not exist is consent.not_found. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  publishConsentForm: route8({
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
  closeConsentForm: route8({
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
  addSuppression: route8({
    method: "POST",
    path: "/v1/suppression-entries",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Adds one email, phone or LinkedIn address to the Suppression list with the reason manual. Adding an address already suppressed answers 200 with the existing entry. The address is never returned. Owner and Admin only. Publishes suppression.added."
  }),
  listSuppressionEntries: route8({
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
  lookupSuppression: route8({
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
  getSuppressionEntry: route8({
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
  removeSuppression: route8({
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
  uploadSuppressionImport: route8({
    method: "POST",
    path: "/v1/suppression-imports",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [202, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Uploads a CSV of up to 50,000 addresses (one column, address; at most 10 MB) as multipart form data in the part named file. It is queued and answers 202 with the import; a replay of the same Idempotency-Key answers 200. Every address is added with the reason manual. A file that cannot be read is request.invalid; a larger one is request.too_large. Owner and Admin only."
  }),
  listSuppressionImports: route8({
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
  getSuppressionImport: route8({
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
  listSuppressionImportRows: route8({
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
  listContactChecks: route8({
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
  getHostedConsentForm: route8({
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
  submitHostedConsentForm: route8({
    method: "POST",
    path: "/v1/public/consent-forms/{token}/submissions",
    access: "public",
    roles: [],
    success: [201, 200],
    idempotent: true,
    errors: ["consent.invalid_token"],
    commonErrors: [...IDEMPOTENT_ERRORS4, "rate.limited"],
    description: "Submits a hosted consent form: an explicit choice per channel and the address each needs. Core finds or creates the Prospect, reads the IP address and user agent from the request as evidence, appends the ledger and publishes consent.granted. Answers 201, or 200 for a replay of the same Idempotency-Key. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  previewUnsubscribe: route8({
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
  oneClickUnsubscribe: route8({
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
  contactCheck: route8({
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
  recordWithdrawal: route8({
    method: "POST",
    path: "/internal/v1/consent-withdrawals",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Records a STOP the channel received: a withdrawal on the channel (or every channel), a Suppression entry with the reason stop, and the events. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  }),
  recordDeliveryFailure: route8({
    method: "POST",
    path: "/internal/v1/delivery-failures",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Records a bounce or complaint on an email address: a Suppression entry with that reason and the event. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  })
});
// src/consent/suppression.ts
import { z as z64 } from "zod";
var MAX_SUPPRESSION_NOTE_LENGTH = 500;
var isRemovableReason = (reason) => SUPPRESSION_REMOVABLE_REASONS.includes(reason);
var suppressionEntrySchema = z64.object({
  id: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema,
  maskedAddress: maskedAddressSchema.nullable(),
  reason: suppressionReasonSchema,
  channel: consentChannelSchema.nullable(),
  sourceRef: z64.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  addedByUserId: userIdSchema.nullable(),
  removable: z64.boolean(),
  createdAt: timestampSchema,
  removedAt: timestampSchema.nullable(),
  removedByUserId: userIdSchema.nullable(),
  removalReason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).nullable()
}).refine((e) => e.removable === isRemovableReason(e.reason), "Only a manual entry is removable").refine((e) => e.reason === "erased" === (e.maskedAddress === null), "An erased entry keeps no address").refine((e) => e.removedAt === null === (e.removedByUserId === null) && e.removedAt === null === (e.removalReason === null), "A removed entry says when, by whom and why");
var suppressionEntryParamsSchema = z64.strictObject({ entryId: suppressionEntryIdSchema });
var addSuppressionRequestSchema = z64.strictObject({
  ...addressFieldsShape,
  note: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).optional()
}).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var removeSuppressionRequestSchema = z64.strictObject({
  reason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH)
});
var suppressionListStateSchema = z64.enum(["active", "removed"]);
var listSuppressionEntriesQuerySchema = pageQuerySchema.extend({
  reason: suppressionReasonSchema.optional(),
  addressKind: suppressionAddressKindSchema.optional(),
  state: suppressionListStateSchema.optional()
}).strict();
var lookupSuppressionRequestSchema = z64.strictObject(addressFieldsShape).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var suppressionEntryPageSchema = pageSchema(suppressionEntrySchema);
var recordWithdrawalRequestSchema = z64.strictObject({
  organizationId: organizationIdSchema,
  channel: consentChannelSchema,
  ...addressFieldsShape,
  stopAll: z64.boolean().default(false),
  sourceRef: z64.string().min(1).max(MAX_SOURCE_REF_LENGTH)
}).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var DELIVERY_FAILURE_REASONS = ["bounce", "complaint"];
var recordDeliveryFailureRequestSchema = z64.strictObject({
  organizationId: organizationIdSchema,
  email: addressFieldsShape.email.unwrap(),
  reason: z64.enum(DELIVERY_FAILURE_REASONS),
  sourceRef: z64.string().min(1).max(MAX_SOURCE_REF_LENGTH)
});
var recordedSuppressionSchema = z64.object({
  entryId: suppressionEntryIdSchema,
  prospectId: prospectIdSchema.nullable()
});
var MAX_SUPPRESSION_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_SUPPRESSION_IMPORT_ROWS = 50000;
var SUPPRESSION_IMPORT_FILE_FIELD = "file";
var SUPPRESSION_IMPORT_COLUMNS = ["address"];
var SUPPRESSION_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var suppressionImportStateSchema = z64.enum(SUPPRESSION_IMPORT_STATES);
var SUPPRESSION_IMPORT_FAILURE_REASONS = ["too_many_rows", "unreadable"];
var suppressionImportSchema = z64.object({
  id: suppressionImportIdSchema,
  state: suppressionImportStateSchema,
  failureReason: z64.enum(SUPPRESSION_IMPORT_FAILURE_REASONS).nullable(),
  totalRows: z64.number().int().min(0).max(MAX_SUPPRESSION_IMPORT_ROWS).nullable(),
  addedRows: z64.number().int().min(0).nullable(),
  alreadySuppressedRows: z64.number().int().min(0).nullable(),
  invalidRows: z64.number().int().min(0).nullable(),
  createdAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
  createdByUserId: userIdSchema
}).refine((i) => i.failureReason !== null === (i.state === "failed"), "A failed import has a reason").refine((i) => i.completedAt !== null === (i.state === "completed" || i.state === "failed"), "A final import has a completion time").refine((i) => {
  if (i.state !== "completed") {
    return i.totalRows === null && i.addedRows === null && i.alreadySuppressedRows === null && i.invalidRows === null;
  }
  return i.totalRows !== null && i.addedRows !== null && i.alreadySuppressedRows !== null && i.invalidRows !== null && i.addedRows + i.alreadySuppressedRows + i.invalidRows === i.totalRows;
}, "The counts are set exactly when completed and add up");
var suppressionImportParamsSchema = z64.strictObject({ importId: suppressionImportIdSchema });
var listSuppressionImportsQuerySchema = pageQuerySchema.strict();
var suppressionImportPageSchema = pageSchema(suppressionImportSchema);
var SUPPRESSION_IMPORT_ROW_RESULTS = ["added", "already_suppressed", "invalid"];
var suppressionImportRowSchema = z64.object({
  rowNumber: z64.number().int().min(1).max(MAX_SUPPRESSION_IMPORT_ROWS + 1),
  result: z64.enum(SUPPRESSION_IMPORT_ROW_RESULTS),
  reason: z64.enum(["unreadable_address", "unsupported_address"]).nullable()
});
var listSuppressionImportRowsQuerySchema = pageQuerySchema.extend({ result: z64.enum(SUPPRESSION_IMPORT_ROW_RESULTS).optional() }).strict();
var suppressionImportRowPageSchema = pageSchema(suppressionImportRowSchema);
// src/copilot/errors.ts
var COPILOT_ERRORS = {
  ...defineErrors("copilot", {
    disabled: { status: 409, message: "The Copilot is off for this Call." },
    not_started: { status: 409, message: "The Copilot has not started on this Call yet." },
    min_evidence_invalid: {
      status: 422,
      message: "The minimum evidence is not valid."
    }
  }),
  ...defineErrors("card", {
    not_found: { status: 404, message: "The card was not found." }
  })
};
// src/copilot/events.ts
import { z as z65 } from "zod";
var voiceCopilotCardShownEvent = defineEvent("voice.copilot.card_shown", 1, z65.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema,
  repMembershipId: membershipIdSchema,
  kind: copilotCardKindSchema,
  objectionType: copilotObjectionTypeSchema.nullable(),
  evidence: copilotEvidenceSchema,
  citedMoments: z65.array(copilotMomentRefSchema).min(1).max(MAX_COPILOT_CITED_MOMENTS),
  shownAt: timestampSchema
}).refine((data) => data.kind === "objection" === (data.objectionType !== null), {
  path: ["objectionType"],
  message: "Only an objection card names an objection type"
}));
var voiceCopilotCardRatedEvent = defineEvent("voice.copilot.card_rated", 1, z65.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema,
  repMembershipId: membershipIdSchema,
  kind: copilotCardKindSchema,
  rating: copilotRatingSchema.nullable(),
  dismissed: z65.boolean(),
  pinned: z65.boolean(),
  ratedAt: timestampSchema
}).refine((data) => !(data.dismissed && data.pinned), {
  path: ["pinned"],
  message: "A card is dismissed or pinned, not both"
}));
var COPILOT_EVENTS = {
  "voice.copilot.card_shown": voiceCopilotCardShownEvent,
  "voice.copilot.card_rated": voiceCopilotCardRatedEvent
};
// src/voice/routes.ts
var VOICE_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var VOICE_ADMIN_ROLES = ["owner", "admin"];
var route9 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS5 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var CALL_VISIBILITY = "Visibility is decided from the token: a Rep sees the Calls they took, a Manager those of the Reps on their Team, Owner and Admin every Call; anything else is call.not_found (404), as is a Call of another Organization.";
var VOICE_ROUTES = Object.freeze({
  listLines: route9({
    method: "GET",
    path: "/v1/lines",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Lines, newest first, one cursor-paginated page at a time (at most 100); optionally one state. Every role may read them, to choose a caller identity."
  }),
  addLine: route9({
    method: "POST",
    path: "/v1/lines",
    roles: VOICE_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["line.number_unavailable"],
    commonErrors: [...IDEMPOTENT_ERRORS5],
    description: "Adds a Line by buying a new number (country, optional area code) or porting one the Organization owns (the Line is porting until the carrier completes). A number that cannot be had is line.number_unavailable (409). Owner and Admin only. Answers 201, or 200 with the original Line for a replay of the same Idempotency-Key."
  }),
  getLine: route9({
    method: "GET",
    path: "/v1/lines/{lineId}",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["line.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Line. A Line of another Organization is line.not_found (404)."
  }),
  assignLine: route9({
    method: "PUT",
    path: "/v1/lines/{lineId}/assignment",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["line.not_found", "line.released", "line.assignment_invalid"],
    commonErrors: ["request.invalid"],
    description: "Sets who inbound Calls on a Line ring: a Team, one Rep, or nobody. Setting the assignment it already has answers 200 with the Line unchanged. A released Line is line.released (409); a Team or Rep that is not in the Organization, or is not a Rep, is line.assignment_invalid (422). Owner and Admin only."
  }),
  releaseLine: route9({
    method: "POST",
    path: "/v1/lines/{lineId}/release",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["line.not_found"],
    commonErrors: ["request.invalid"],
    description: "Gives a Line up: its number goes back to the carrier and its assignment is cleared. Calls already made on it stay. Idempotent by end state: releasing a released Line answers 200 with it. Takes no body. Owner and Admin only."
  }),
  placeCall: route9({
    method: "POST",
    path: "/v1/calls",
    roles: VOICE_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "call.number_invalid",
      "call.line_unavailable",
      "call.limit_reached",
      "call.disclosure_failed",
      "line.not_found",
      "prospect.not_found"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS5],
    description: "Places a Call from the caller's browser to a number. The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Call and dials once; the same key with another body is request.idempotency_key_reused. The number is normalised to E.164 (call.number_invalid, 422, when it cannot be). The Call is recorded and a Disclosure plays before the two sides are bridged; a Call whose Disclosure fails ends failed and never goes live (call.disclosure_failed, 502, with the Call id in details). A Rep may call any Prospect (ADR 0003): the Contact Check on the number is a warning in the answer, never a refusal. A Line the caller may not use is line.not_found; a prospectId the caller may not see is prospect.not_found. At the Organization's cap of concurrent Calls it is call.limit_reached (429). Answers 201, or 200 for a replay."
  }),
  listCalls: route9({
    method: "GET",
    path: "/v1/calls",
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: "calls:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Calls, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: direction, state, repMembershipId, lineId, prospectId, and from and to on createdAt. ${CALL_VISIBILITY} A filter can narrow what the caller sees, never widen it.`
  }),
  getCall: route9({
    method: "GET",
    path: "/v1/calls/{callId}",
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: "calls:read" },
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Call with its state, times, the wording version and time of its Disclosure, and the state of its Recording and Transcript. ${CALL_VISIBILITY}`
  }),
  getCallTranscript: route9({
    method: "GET",
    path: "/v1/calls/{callId}/transcript",
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: "calls:read" },
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads the Transcript of a Call in time order, one cursor-paginated page of turns at a time (at most 100), each attributed to the Rep or the Prospect. The state says whether it is pending, ready or deleted; turns exist only when ready. The text is never logged. ${CALL_VISIBILITY}`
  }),
  getCallRecording: route9({
    method: "GET",
    path: "/v1/calls/{callId}/recording",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "recording.not_found", "recording.not_ready"],
    commonErrors: ["request.invalid"],
    description: `Answers a short-lived signed URL to play the two-channel Recording of a Call. A Call with no Recording, or whose Recording was deleted, is recording.not_found (404); one still being stored is recording.not_ready (409). The URL is a credential and is never logged. ${CALL_VISIBILITY}`
  }),
  deleteCallRecording: route9({
    method: "DELETE",
    path: "/v1/calls/{callId}/recording",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "call.not_ended"],
    commonErrors: ["request.invalid"],
    description: "Deletes the Recording of a Call and its Transcript, to honour a deletion request; the Call record stays with both states deleted. Idempotent by end state: a Call whose Recording is already deleted, or never existed, answers 200 with the Call. A Call that has not ended is call.not_ended (409). Owner and Admin only."
  }),
  wrapUpCall: route9({
    method: "PUT",
    path: "/v1/calls/{callId}/wrap-up",
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: "calls:write" },
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "call.not_ended"],
    commonErrors: ["request.invalid"],
    description: "Sets the wrap-up of an ended Call: the Deal identifier that joins it to a Deal in the Playbook, and a note. A field left out is left alone and null clears it. A Call that has not ended is call.not_ended (409). Only the Rep who took the Call, Owner and Admin may wrap it up; for any other caller the Call is call.not_found (404), a Manager of that Rep included."
  }),
  mintSoftphoneToken: route9({
    method: "POST",
    path: "/v1/softphone/token",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Mints a short-lived token (at most an hour) for the caller's browser to register the Softphone with the telephony provider. Each call mints a new one. The token is a credential for the caller alone and is never logged. If the provider cannot be reached it is server.unavailable. Takes no body."
  })
});

// src/copilot/routes.ts
var route10 = (definition) => Object.freeze(definition);
var CARD_VISIBILITY = "Visibility is decided from the token: a Rep sees the cards of the Calls they took, a Manager those of the Reps on their Team, Owner and Admin every Call; anything else is call.not_found (404), as is a Call of another Organization. Cards come only from the Organization's own Playbook.";
var UNTRUSTED = "Quotes, passages and the composed text of a card, and the Transcript turns of the stream, are tenant text or model output and so untrusted data: bounded, shown as plain text, never as markup or instructions, never spoken into the Call, never logged.";
var COPILOT_ROUTES = Object.freeze({
  streamCopilot: route10({
    method: "GET",
    path: "/v1/calls/{callId}/copilot/stream",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    stream: true,
    errors: ["call.not_found", "copilot.disabled", "copilot.not_started"],
    commonErrors: ["request.invalid"],
    description: `Streams the live Transcript and the Copilot Cards of a Call to the Rep's browser as Server-Sent Events (text/event-stream), with the same token as every other route. Messages are copilot.status, transcript.turn, transcript.unavailable, copilot.card and copilot.card_updated, each with an id. The stream opens once the Call is disclosing and says waiting_for_disclosure until the Disclosure has played; before that, while the Call is ringing or connecting, it is copilot.not_started (409). A Call with the Copilot off is copilot.disabled (409). The Last-Event-ID header resumes after that message, replaying from what is stored, so a reconnect misses nothing. If speech-to-text fails, transcript.unavailable is sent and the Call goes on. ${UNTRUSTED} ${CARD_VISIBILITY}`
  }),
  listCopilotCards: route10({
    method: "GET",
    path: "/v1/calls/{callId}/copilot/cards",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the Copilot Cards shown on a Call, oldest first, one cursor-paginated page at a time (at most 100); optionally one kind. Each card carries its kind, the Evidence (similar Moments and distinct won Deals), the Moments it cites and its quotes, and the Rep's rating, dismissal and pin. A Call that never had the Copilot has no cards: an empty page, not an error. ${UNTRUSTED} ${CARD_VISIBILITY}`
  }),
  markCopilotCard: route10({
    method: "PATCH",
    path: "/v1/calls/{callId}/copilot/cards/{cardId}",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "card.not_found"],
    commonErrors: ["request.invalid"],
    description: "Marks a card: rates it useful or not useful (null clears the rating), dismisses it or pins it. The body names the end state wanted, so the route is idempotent by end state: a repeat of the same body answers 200 with the card unchanged and publishes no second voice.copilot.card_rated event. Dismissing a card clears its pin and pinning it clears its dismissal; asking for both is request.invalid. Only the Rep who took the Call may mark its cards; for any other caller, a Manager, Admin or Owner included, the Call is call.not_found (404), so their view of the cards stays read-only. A card that is not on the Call is card.not_found (404). Takes no Idempotency-Key header."
  }),
  getCopilotSettings: route10({
    method: "GET",
    path: "/v1/copilot/settings",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's Copilot settings: whether the Copilot is on and the minimum Evidence (similar Moments and distinct won Deals) a card needs. Every role may read them, because the Softphone needs to know whether to offer the Copilot before dialing; an Organization that never set them has the Copilot off with the defaults of 3 Moments and 2 Deals. There is no setting that changes the Disclosure."
  }),
  setCopilotSettings: route10({
    method: "PUT",
    path: "/v1/copilot/settings",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["copilot.min_evidence_invalid"],
    commonErrors: ["request.invalid"],
    description: "Sets the Copilot settings: on or off for the Organization, and the minimum Evidence a card needs (1 to 20 Moments, and 1 to 20 distinct Deals that are no more than the Moments). The body replaces the settings, so it is idempotent by end state: the same body again answers 200 with the same settings. A minimum outside 1 to 20 or more Deals than Moments is copilot.min_evidence_invalid (422); a malformed body is request.invalid. Turning the Copilot off stops new Copilot Calls from being offered and leaves the cards already shown. Owner and Admin only."
  })
});
// src/copilot/settings.ts
import { z as z66 } from "zod";
var MIN_COPILOT_MIN_EVIDENCE = 1;
var MAX_COPILOT_MIN_EVIDENCE = 20;
var DEFAULT_COPILOT_MIN_MOMENTS = 3;
var DEFAULT_COPILOT_MIN_DEALS = 2;
var minEvidenceSchema = z66.number().int().min(MIN_COPILOT_MIN_EVIDENCE).max(MAX_COPILOT_MIN_EVIDENCE);
var copilotSettingsSchema = z66.strictObject({
  enabled: z66.boolean(),
  minMoments: minEvidenceSchema,
  minDeals: minEvidenceSchema,
  updatedAt: timestampSchema.nullable(),
  updatedBy: membershipIdSchema.nullable()
}).refine((settings) => settings.minDeals <= settings.minMoments, {
  path: ["minDeals"],
  message: "The minimum Deals are no more than the minimum Moments"
});
var setCopilotSettingsRequestSchema = z66.strictObject({
  enabled: z66.boolean(),
  minMoments: minEvidenceSchema,
  minDeals: minEvidenceSchema
}).refine((settings) => settings.minDeals <= settings.minMoments, {
  path: ["minDeals"],
  message: "The minimum Deals are no more than the minimum Moments"
});
// src/copilot/stream.ts
import { z as z68 } from "zod";

// src/voice/call.ts
import { z as z67 } from "zod";
var MAX_CALL_DURATION_SECONDS = 43200;
var callDisclosureSchema = z67.strictObject({
  wordingVersion: z67.number().int().min(1).nullable(),
  playedAt: timestampSchema.nullable(),
  aiAssisted: z67.boolean()
}).refine((d) => d.wordingVersion === null === (d.playedAt === null), {
  message: "The wording version and the time are both set once the Disclosure has played"
});
var voiceCallSchema = z67.object({
  id: callIdSchema,
  direction: voiceCallDirectionSchema,
  state: voiceCallStateSchema,
  lineId: lineIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  prospectNumber: e164PhoneSchema,
  disclosure: callDisclosureSchema,
  createdAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  endedAt: timestampSchema.nullable(),
  durationSeconds: z67.number().int().min(0).max(MAX_CALL_DURATION_SECONDS).nullable(),
  endedBy: voiceCallEndedBySchema.nullable(),
  failureReason: voiceCallFailureReasonSchema.nullable(),
  dealId: dealIdSchema.nullable(),
  note: wrapUpNoteSchema.nullable(),
  recordingState: voiceRecordingStateSchema,
  transcriptState: voiceTranscriptStateSchema
}).superRefine((call, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  const played = call.disclosure.playedAt !== null;
  const final = call.state === "ended" || call.state === "failed" || call.state === "missed";
  if ((call.state === "live" || call.state === "ended") && !played) {
    issue("disclosure", "A live or ended Call has played its Disclosure");
  }
  if (call.state === "failed" !== (call.failureReason !== null)) {
    issue("failureReason", "Only a failed Call has a failure reason");
  }
  if (call.failureReason === "disclosure_failed" && played) {
    issue("failureReason", "A Call whose Disclosure played did not fail on it");
  }
  if (final !== (call.endedAt !== null)) {
    issue("endedAt", "Only a Call in a final state has an end time");
  }
  if ((call.state === "live" || call.state === "ended") !== (call.answeredAt !== null)) {
    issue("answeredAt", "A Call is answered once it is live or ended, and not before");
  }
  if (call.state === "ended" !== (call.durationSeconds !== null)) {
    issue("durationSeconds", "Only an ended Call has a duration");
  }
  if (call.endedBy !== null && !final) {
    issue("endedBy", "Only a Call in a final state says who ended it");
  }
  if (call.state !== "ended" && (call.dealId !== null || call.note !== null)) {
    issue("dealId", "Only an ended Call has a wrap-up");
  }
  if (call.recordingState !== "none" && !played) {
    issue("recordingState", "A Recording starts after the Disclosure has played");
  }
  if (call.transcriptState === "ready" && call.recordingState !== "stored") {
    issue("transcriptState", "A ready Transcript comes from a stored Recording");
  }
});
var voiceCallParamsSchema = z67.strictObject({ callId: callIdSchema });
var voiceCallCursorSchema = z67.strictObject({
  createdAt: timestampSchema,
  id: callIdSchema
});
var placeCallRequestSchema = z67.strictObject({
  to: rawPhoneSchema,
  lineId: lineIdSchema.optional(),
  prospectId: prospectIdSchema.optional()
});
var placeCallHeadersSchema = z67.object({ "idempotency-key": idempotencyKeySchema });
var contactWarningSchema = z67.strictObject({
  code: contactDenialCodeSchema,
  suppressionReason: suppressionReasonSchema.nullable()
});
var placedCallSchema = z67.strictObject({
  call: voiceCallSchema,
  warnings: z67.array(contactWarningSchema).max(4)
});
var MAX_FILTER_TIME_LENGTH = 64;
var listVoiceCallsQuerySchema = pageQuerySchema.extend({
  direction: voiceCallDirectionSchema.optional(),
  state: voiceCallStateSchema.optional(),
  repMembershipId: membershipIdSchema.optional(),
  lineId: lineIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.max(MAX_FILTER_TIME_LENGTH).optional(),
  to: timestampSchema.max(MAX_FILTER_TIME_LENGTH).optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.from) < Date.parse(q.to), {
  message: "from is before to"
});
var voiceCallPageSchema = pageSchema(voiceCallSchema);
var transcriptSpeakerSchema = z67.enum(["rep", "prospect"]);
var MAX_TRANSCRIPT_TURN_LENGTH = 4000;
var transcriptTurnSchema = z67.strictObject({
  speaker: transcriptSpeakerSchema,
  startMs: z67.number().int().min(0).max(MAX_CALL_DURATION_SECONDS * 1000),
  endMs: z67.number().int().min(0).max(MAX_CALL_DURATION_SECONDS * 1000),
  text: z67.string().min(1).max(MAX_TRANSCRIPT_TURN_LENGTH)
}).refine((turn) => turn.endMs >= turn.startMs, { message: "A turn ends after it starts" });
var transcriptCursorSchema = z67.strictObject({ index: z67.number().int().min(0) });
var getTranscriptQuerySchema = pageQuerySchema.strict();
var transcriptPageSchema = pageSchema(transcriptTurnSchema).extend({ callId: callIdSchema, state: voiceTranscriptStateSchema }).refine((page) => page.state === "ready" || page.items.length === 0, {
  message: "Only a ready Transcript has turns"
});
var RECORDING_MEDIA_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"];
var MAX_PLAYBACK_URL_LENGTH = 2048;
var recordingPlaybackSchema = z67.strictObject({
  callId: callIdSchema,
  url: z67.url({ protocol: /^https$/ }).max(MAX_PLAYBACK_URL_LENGTH),
  expiresAt: timestampSchema,
  mediaType: z67.enum(RECORDING_MEDIA_TYPES),
  channels: z67.literal(2),
  durationSeconds: z67.number().int().min(0).max(MAX_CALL_DURATION_SECONDS)
});
var wrapUpRequestSchema = z67.strictObject({
  dealId: dealIdSchema.nullable().optional(),
  note: wrapUpNoteSchema.nullable().optional()
}).refine((body) => body.dealId !== undefined || body.note !== undefined, {
  message: "Give a dealId or a note"
});
var deletedRecordingSchema = voiceCallSchema;

// src/copilot/stream.ts
var MAX_COPILOT_STREAM_ID_LENGTH = 64;
var copilotStreamIdSchema = z68.string().min(1).max(MAX_COPILOT_STREAM_ID_LENGTH).regex(/^[A-Za-z0-9_.:-]+$/);
var copilotStreamHeadersSchema = z68.object({
  "last-event-id": copilotStreamIdSchema.optional()
});
var COPILOT_STREAM_STATES = ["waiting_for_disclosure", "live", "ended"];
var copilotStreamStateSchema = z68.enum(COPILOT_STREAM_STATES);
var COPILOT_QUIET_REASONS = [
  "not_enough_won_moments",
  "playbook_unavailable",
  "transcript_unavailable"
];
var copilotQuietReasonSchema = z68.enum(COPILOT_QUIET_REASONS);
var COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS = [
  "speech_to_text_failed",
  "stream_dropped"
];
var copilotStatusDataSchema = z68.strictObject({
  callId: callIdSchema,
  state: copilotStreamStateSchema,
  quietReason: copilotQuietReasonSchema.nullable()
});
var copilotTurnDataSchema = z68.strictObject({
  callId: callIdSchema,
  sequence: z68.number().int().min(1),
  turn: transcriptTurnSchema
});
var copilotTranscriptUnavailableDataSchema = z68.strictObject({
  callId: callIdSchema,
  reason: z68.enum(COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS)
});
var copilotCardDataSchema = z68.strictObject({ card: copilotCardSchema });
var COPILOT_STREAM_EVENTS = [
  "copilot.status",
  "transcript.turn",
  "transcript.unavailable",
  "copilot.card",
  "copilot.card_updated"
];
var message = (event, data) => z68.strictObject({ id: copilotStreamIdSchema, event: z68.literal(event), data });
var copilotStreamMessageSchema = z68.discriminatedUnion("event", [
  message("copilot.status", copilotStatusDataSchema),
  message("transcript.turn", copilotTurnDataSchema),
  message("transcript.unavailable", copilotTranscriptUnavailableDataSchema),
  message("copilot.card", copilotCardDataSchema),
  message("copilot.card_updated", copilotCardDataSchema)
]);
function formatCopilotStreamFrame(input) {
  const parsed = copilotStreamMessageSchema.parse(input);
  return `id: ${parsed.id}
event: ${parsed.event}
data: ${JSON.stringify(parsed.data)}

`;
}
// src/core/internal.ts
import { z as z69 } from "zod";
var INTERNAL_CALL_ERRORS = Object.freeze({
  createOrganization: Object.freeze(["membership.already_member"]),
  acceptInvitation: Object.freeze(["invitation.invalid", "membership.already_member"]),
  membership: Object.freeze([]),
  updateMemberProfile: Object.freeze(["member.not_found"]),
  abandonOrganization: Object.freeze(["organization.not_abandonable"])
});
var internalCreateOrganizationRequestSchema = z69.strictObject({
  userId: userIdSchema,
  organizationName: organizationNameSchema,
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
});
var internalCreateOrganizationResponseSchema = z69.object({
  organizationId: organizationIdSchema,
  role: z69.literal("owner")
});
var internalAcceptInvitationRequestSchema = z69.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  name: personNameSchema.nullable().optional(),
  invitationToken: invitationTokenSchema
});
var internalAcceptInvitationResponseSchema = z69.object({
  organizationId: organizationIdSchema,
  role: invitableRoleSchema
});
var internalMembershipRequestSchema = z69.strictObject({
  userId: userIdSchema
});
var internalMembershipResponseSchema = z69.discriminatedUnion("found", [
  z69.object({
    found: z69.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema
  }),
  z69.object({ found: z69.literal(false) })
]);
var internalUpdateMemberProfileParamsSchema = z69.strictObject({
  userId: userIdSchema
});
var internalUpdateMemberProfileRequestSchema = z69.strictObject({
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
}).refine((body) => body.email !== undefined || body.name !== undefined, {
  message: "Send an email, a name or both"
});
var internalUpdateMemberProfileResponseSchema = z69.object({
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable()
});
var ABANDON_MAX_AGE_HOURS = 24;
var internalAbandonOrganizationParamsSchema = z69.strictObject({
  organizationId: organizationIdSchema
});
var internalAbandonOrganizationRequestSchema = z69.strictObject({
  userId: userIdSchema
});
var internalAbandonOrganizationResponseSchema = z69.object({
  organizationId: organizationIdSchema,
  status: z69.literal("deleted")
});
// src/core/invitation.ts
import { z as z70 } from "zod";
var invitationSchema = z70.object({
  id: invitationIdSchema,
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.nullable(),
  state: invitationStateSchema,
  invitedByUserId: userIdSchema,
  expiresAt: timestampSchema,
  createdAt: timestampSchema
});
var createInvitationRequestSchema = z70.strictObject({
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
var invitationParamsSchema = z70.strictObject({
  invitationId: invitationIdSchema
});
// src/core/member.ts
import { z as z71 } from "zod";
var memberSchema = z71.object({
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
var memberParamsSchema = z71.strictObject({
  membershipId: membershipIdSchema
});
var changeMemberRoleRequestSchema = z71.strictObject({
  role: roleSchema
});
// src/core/organization.ts
import { z as z72 } from "zod";
var organizationSchema = z72.object({
  id: organizationIdSchema,
  name: storedNameSchema,
  region: regionSchema,
  status: organizationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var renameOrganizationRequestSchema = z72.strictObject({
  name: organizationNameSchema
});
// src/core/team.ts
import { z as z73 } from "zod";
var teamSchema = z73.object({
  id: teamIdSchema,
  name: storedNameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var createTeamRequestSchema = z73.strictObject({
  name: teamNameSchema
});
var renameTeamRequestSchema = z73.strictObject({
  name: teamNameSchema
});
var listTeamsQuerySchema = pageQuerySchema.strict();
var listTeamsResponseSchema = pageSchema(teamSchema);
var teamParamsSchema = z73.strictObject({
  teamId: teamIdSchema
});
var addTeamMemberRequestSchema = z73.strictObject({
  membershipId: membershipIdSchema
});
var teamMemberSchema = z73.object({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
  createdAt: timestampSchema
});
var teamMemberParamsSchema = z73.strictObject({
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
// src/enrichment/errors.ts
var ENRICHMENT_ERRORS = {
  ...defineErrors("enrichment", {
    budget_exceeded: { status: 429, message: "The enrichment budget for this month is spent." },
    provider_unavailable: {
      status: 503,
      message: "No enrichment provider is available for this request."
    },
    prospect_not_found: { status: 404, message: "The Prospect was not found." },
    verification_failed: {
      status: 422,
      message: "There is no email address on this Prospect that can be verified."
    },
    run_not_found: { status: 404, message: "The enrichment run was not found." },
    run_set_not_found: { status: 404, message: "The enrichment request was not found." },
    provider_unknown: { status: 404, message: "There is no such provider." },
    invalid_waterfall: { status: 422, message: "The provider order is not valid." },
    version_conflict: {
      status: 409,
      message: "This changed since it was read. Reload it and try again."
    }
  }),
  ...defineErrors("signal", {
    invalid: { status: 422, message: "The signal is not valid." },
    not_found: { status: 404, message: "The signal was not found." },
    webhook_unauthorized: { status: 401, message: "The webhook request is not authorised." }
  }),
  ...defineErrors("fit", {
    invalid_criteria: { status: 422, message: "The fit criteria are not valid." },
    criterion_not_found: { status: 404, message: "The fit criterion was not found." }
  })
};
// src/enrichment/events.ts
import { z as z77 } from "zod";

// src/enrichment/signal.ts
import { z as z76 } from "zod";

// src/messaging/values.ts
import { z as z74 } from "zod";
var MAX_PREVIEW_PROSPECTS = 5;
var MAX_BRIEF_STATEMENTS = 20;
var MAX_BRIEF_STATEMENT_LENGTH = 500;
var MAX_ANGLE_LENGTH = 500;
var MAX_DRAFT_CITATIONS = 20;
var MAX_DRAFT_SUBJECT_LENGTH = 200;
var MAX_DRAFT_BODY_LENGTH = 5000;
var MAX_TONE_LENGTH = 500;
var MAX_PREFERRED_WORDS = 50;
var MAX_BANNED_PHRASES = 100;
var MAX_VOICE_TERM_LENGTH = 100;
var MAX_SIGN_OFF_LENGTH = 200;
var MAX_VOICE_LENGTH_CHARACTERS = 5000;
var MAX_CITATION_URL_LENGTH = 2048;
function messagingTextSchema(maxLength, multiline = false) {
  return z74.string().max(maxLength * 2).trim().pipe(z74.string().min(1).max(maxLength).refine((text) => !hasControlCharacter2(text, multiline), "No control characters"));
}
var citationUrlSchema = z74.string().max(MAX_CITATION_URL_LENGTH).refine((text) => {
  try {
    const url = new URL(text);
    return (url.protocol === "http:" || url.protocol === "https:") && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}, "An http or https address without credentials");
var DRAFT_CHANNELS = ["email"];
var draftChannelSchema = z74.enum(DRAFT_CHANNELS);

// src/enrichment/values.ts
import { z as z75 } from "zod";
var MAX_ENRICH_PROSPECTS = 500;
var MAX_ENRICHED_VALUE_LENGTH = 320;
var MAX_PROVIDERS = 50;
var MAX_PROVIDER_KEY_LENGTH = 32;
var MAX_PROVIDER_API_KEY_LENGTH = 512;
var MAX_ATTEMPTS_PER_RUN = 150;
var MAX_MICRO_DOLLARS = 1000000000000;
var MAX_SIGNAL_TEXT_LENGTH = 1000;
var MAX_SIGNAL_LABEL_LENGTH = 200;
var MAX_SIGNAL_URL_LENGTH = 2048;
var MAX_SIGNAL_FRESHNESS_DAYS = 3650;
var MAX_FIT_CRITERIA = 50;
var MAX_CRITERION_NAME_LENGTH = 100;
var MAX_CRITERION_VALUES = 20;
var MAX_CRITERION_VALUE_LENGTH = 100;
var MAX_CRITERION_WEIGHT = 100;
function enrichmentTextSchema(maxLength, multiline = false) {
  return z75.string().max(maxLength * 2).trim().pipe(z75.string().min(1).max(maxLength).refine((text) => !hasControlCharacter2(text, multiline), "No control characters"));
}
function vendorTextSchema(maxLength) {
  return z75.string().max(maxLength * 20).transform((text) => {
    const clean = text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
    return clean.slice(0, maxLength);
  }).pipe(z75.string().min(1).max(maxLength));
}
var microDollarsSchema = z75.number().int().min(0).max(MAX_MICRO_DOLLARS);
var providerKeySchema = z75.string().max(MAX_PROVIDER_KEY_LENGTH).regex(/^[a-z][a-z0-9_]*$/);
var FIELD_GROUPS = ["person", "company", "email_verification"];
var fieldGroupSchema = z75.enum(FIELD_GROUPS);
var ENRICHED_FIELDS = [
  "firstName",
  "lastName",
  "jobTitle",
  "linkedinUrl",
  "email",
  "companyName",
  "companyDomain",
  "industry",
  "employeeCount",
  "region",
  "technologies"
];
var enrichedFieldNameSchema = z75.enum(ENRICHED_FIELDS);
var FIELD_GROUP_OF = Object.freeze({
  firstName: "person",
  lastName: "person",
  jobTitle: "person",
  linkedinUrl: "person",
  email: "email_verification",
  companyName: "company",
  companyDomain: "company",
  industry: "company",
  employeeCount: "company",
  region: "company",
  technologies: "company"
});
var monthSchema = z75.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

// src/enrichment/signal.ts
var SIGNAL_KINDS = [
  "funding",
  "hiring_spike",
  "job_change",
  "technology_change",
  "website_visit",
  "note"
];
var signalKindSchema = z76.enum(SIGNAL_KINDS);
var signalSourceSchema = z76.discriminatedUnion("type", [
  z76.object({ type: z76.literal("provider"), provider: providerKeySchema }),
  z76.object({ type: z76.literal("webhook") }),
  z76.object({ type: z76.literal("manual"), userId: userIdSchema })
]);
var FUNDING_ROUNDS = [
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "later_stage",
  "debt",
  "grant",
  "other"
];
var label = vendorTextSchema(MAX_SIGNAL_LABEL_LENGTH);
var signalBase = {
  id: signalIdSchema,
  prospectId: prospectIdSchema,
  source: signalSourceSchema,
  observedAt: timestampSchema,
  recordedAt: timestampSchema,
  expiresAt: timestampSchema,
  fresh: z76.boolean()
};
var signalSchema = z76.discriminatedUnion("kind", [
  z76.object({
    ...signalBase,
    kind: z76.literal("funding"),
    round: z76.enum(FUNDING_ROUNDS),
    amountMajorUnits: z76.number().int().min(0).max(1000000000000).nullable(),
    currency: z76.string().regex(/^[A-Z]{3}$/).nullable()
  }),
  z76.object({
    ...signalBase,
    kind: z76.literal("hiring_spike"),
    openRoles: z76.number().int().min(1).max(1e5),
    windowDays: z76.number().int().min(1).max(365),
    department: label.nullable()
  }),
  z76.object({
    ...signalBase,
    kind: z76.literal("job_change"),
    previousTitle: label.nullable(),
    newTitle: label,
    previousCompany: label.nullable(),
    newCompany: label.nullable()
  }),
  z76.object({
    ...signalBase,
    kind: z76.literal("technology_change"),
    technology: label,
    change: z76.enum(["adopted", "dropped"])
  }),
  z76.object({
    ...signalBase,
    kind: z76.literal("website_visit"),
    pageUrl: citationUrlSchema,
    visitCount: z76.number().int().min(1).max(1e6)
  }),
  z76.object({
    ...signalBase,
    kind: z76.literal("note"),
    text: vendorTextSchema(MAX_SIGNAL_TEXT_LENGTH)
  })
]);
var recordNoteRequestSchema = z76.strictObject({
  kind: z76.literal("note"),
  text: enrichmentTextSchema(MAX_SIGNAL_TEXT_LENGTH, true),
  observedAt: timestampSchema.optional()
});
var listSignalsQuerySchema = pageQuerySchema.extend({
  kind: signalKindSchema.optional(),
  fresh: z76.union([z76.boolean(), z76.enum(["true", "false"]).transform((text) => text === "true")]).optional()
});
var listSignalsResponseSchema = pageSchema(signalSchema);
var SIGNAL_WEBHOOK_TIMESTAMP_HEADER = "x-closeline-timestamp";
var SIGNAL_WEBHOOK_SIGNATURE_HEADER = "x-closeline-signature";
var SIGNAL_WEBHOOK_TOLERANCE_SECONDS = 300;
var signalWebhookRequestSchema = z76.union([
  z76.strictObject({
    eventId: z76.string().regex(/^[A-Za-z0-9_-]{8,100}$/),
    kind: z76.literal("website_visit"),
    prospectId: prospectIdSchema,
    pageUrl: citationUrlSchema,
    visitedAt: timestampSchema
  }),
  z76.strictObject({
    eventId: z76.string().regex(/^[A-Za-z0-9_-]{8,100}$/),
    kind: z76.literal("website_visit"),
    email: emailSchema,
    pageUrl: citationUrlSchema,
    visitedAt: timestampSchema
  })
]);
var signalWebhookResponseSchema = z76.object({
  recorded: z76.boolean(),
  duplicate: z76.boolean(),
  signalId: signalIdSchema.nullable()
});
var kindSettingShape = {
  kind: signalKindSchema,
  enabled: z76.boolean(),
  freshnessDays: z76.number().int().min(1).max(MAX_SIGNAL_FRESHNESS_DAYS)
};
var signalKindSettingSchema = z76.object(kindSettingShape);
var kindSettingRequestSchema = z76.strictObject(kindSettingShape);
var signalWebhookStateSchema = z76.object({
  configured: z76.boolean(),
  rotatedAt: timestampSchema.nullable()
});
var signalSettingsSchema = z76.object({
  kinds: z76.array(signalKindSettingSchema).length(SIGNAL_KINDS.length),
  webhook: signalWebhookStateSchema,
  version: z76.number().int().min(0).max(1e6),
  updatedAt: timestampSchema.nullable()
});
var setSignalSettingsRequestSchema = z76.strictObject({
  kinds: z76.array(kindSettingRequestSchema).length(SIGNAL_KINDS.length),
  expectedVersion: z76.number().int().min(0).max(1e6)
}).refine((body) => new Set(body.kinds.map((setting) => setting.kind)).size === SIGNAL_KINDS.length, "Each kind is set once");
var signalWebhookSecretSchema = z76.string().regex(/^[A-Za-z0-9_-]{43}$/);
var rotateSignalWebhookResponseSchema = z76.object({
  organizationId: organizationIdSchema,
  secret: signalWebhookSecretSchema,
  rotatedAt: timestampSchema
});

// src/enrichment/events.ts
var RUN_END_STATUSES = ["complete", "incomplete", "stopped"];
var enrichmentCompletedEvent = defineEvent("enrichment.completed", 1, z77.strictObject({
  runId: enrichmentRunIdSchema,
  runSetId: enrichmentRunSetIdSchema.nullable(),
  prospectId: prospectIdSchema,
  status: z77.enum(RUN_END_STATUSES),
  fieldsFilled: z77.number().int().min(0).max(100),
  costMicros: microDollarsSchema,
  completedAt: timestampSchema
}));
var signalRecordedEvent = defineEvent("signal.recorded", 1, z77.strictObject({
  signalId: signalIdSchema,
  prospectId: prospectIdSchema,
  kind: signalKindSchema,
  observedAt: timestampSchema,
  recordedAt: timestampSchema
}));
var scoreSchema = z77.number().int().min(0).max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT);
var prospectFitChangedEvent = defineEvent("prospect.fit_changed", 1, z77.strictObject({
  prospectId: prospectIdSchema,
  previousScore: scoreSchema.nullable(),
  score: scoreSchema,
  maxScore: scoreSchema,
  criteriaVersion: z77.number().int().min(0).max(1e6),
  changedAt: timestampSchema
}));
var ENRICHMENT_EVENTS = {
  "enrichment.completed": enrichmentCompletedEvent,
  "signal.recorded": signalRecordedEvent,
  "prospect.fit_changed": prospectFitChangedEvent
};
// src/enrichment/fit.ts
import { z as z78 } from "zod";
var FIT_FIELDS = [
  "jobTitle",
  "industry",
  "employeeCount",
  "region",
  "technologies"
];
var fitFieldSchema = z78.enum(FIT_FIELDS);
var valuesSchema = z78.array(enrichmentTextSchema(MAX_CRITERION_VALUE_LENGTH)).min(1).max(MAX_CRITERION_VALUES);
var bound = z78.number().int().min(0).max(1e8);
function conditionOf(strict) {
  const make = (shape) => strict ? z78.strictObject(shape) : z78.object(shape);
  return z78.discriminatedUnion("operator", [
    make({ operator: z78.literal("one_of"), values: valuesSchema }),
    make({ operator: z78.literal("contains_any"), values: valuesSchema }),
    make({
      operator: z78.literal("between"),
      min: bound.nullable(),
      max: bound.nullable()
    }).refine((condition) => condition.min !== null || condition.max !== null, "Give min or max").refine((condition) => condition.min === null || condition.max === null || condition.min <= condition.max, "min is not above max")
  ]);
}
var fitConditionSchema = conditionOf(false);
var fitConditionRequestSchema = conditionOf(true);
function fitConditionSuitsField(field, condition) {
  return field === "employeeCount" === (condition.operator === "between");
}
var WEIGHT = z78.number().int().min(1).max(MAX_CRITERION_WEIGHT);
var fitCriterionSchema = z78.object({
  id: fitCriterionIdSchema,
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH),
  field: fitFieldSchema,
  condition: fitConditionSchema,
  weight: WEIGHT,
  enabled: z78.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var createFitCriterionRequestSchema = z78.strictObject({
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH),
  field: fitFieldSchema,
  condition: fitConditionRequestSchema,
  weight: WEIGHT,
  enabled: z78.boolean().default(true)
});
var updateFitCriterionRequestSchema = z78.strictObject({
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH).optional(),
  field: fitFieldSchema.optional(),
  condition: fitConditionRequestSchema.optional(),
  weight: WEIGHT.optional(),
  enabled: z78.boolean().optional()
}).refine((body) => Object.keys(body).length > 0, "Change at least one part");
var listFitCriteriaQuerySchema = pageQuerySchema;
var listFitCriteriaResponseSchema = pageSchema(fitCriterionSchema).extend({
  criteriaVersion: z78.number().int().min(0).max(1e6)
});
var FIT_RESULTS = ["matched", "missed", "unknown"];
var fitResultSchema = z78.enum(FIT_RESULTS);
var fitMatchSchema = z78.object({
  criterionId: fitCriterionIdSchema,
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH),
  weight: WEIGHT,
  result: fitResultSchema
});
var fitScoreSchema = z78.object({
  prospectId: prospectIdSchema,
  score: z78.number().int().min(0).max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT),
  maxScore: z78.number().int().min(0).max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT),
  matches: z78.array(fitMatchSchema).max(MAX_FIT_CRITERIA),
  criteriaVersion: z78.number().int().min(0).max(1e6),
  scoredAt: timestampSchema
}).refine((fit) => fit.score <= fit.maxScore, "The score is not above the maximum");
var listFitScoresQuerySchema = pageQuerySchema.extend({
  minScore: z78.union([z78.number(), z78.string().regex(/^\d{1,5}$/)]).transform((value) => Number(value)).pipe(z78.number().int().min(0).max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT)).optional()
});
var listFitScoresResponseSchema = pageSchema(fitScoreSchema);
// src/enrichment/routes.ts
var ENRICHMENT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var ENRICHMENT_READ_ROLES = [
  "owner",
  "admin",
  "manager"
];
var ENRICHMENT_ADMIN_ROLES = ["owner", "admin"];
var VISIBILITY4 = "An Owner or Admin sees every Prospect; a Manager those owned by Reps on their Team; a Rep only their own. A Prospect (enrichment.prospect_not_found) outside the caller's view is its not_found code (404), never 403, and one of another Organization the same.";
var ORG_ONLY2 = "Everything here belongs to the caller's Organization alone: provider data bought by one Organization is never visible to another, and an id of another Organization is its not_found code (404), never 403.";
var KEY4 = "Requires an Idempotency-Key header: a replay answers the same result and does the work once.";
var UNTRUSTED2 = "Provider, web and webhook text is untrusted data: validated, bounded, shown to people and never run as an instruction, and never put in a log or an event.";
var SECRETS = "A provider key is write-only: stored encrypted, never returned, logged or put in an error report.";
var PAGED = "one cursor-paginated page at a time (at most 100)";
var ENRICHMENT_ROUTES = Object.freeze({
  createEnrichment: inboundRoute({
    method: "POST",
    path: "/v1/enrichment-runs",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:write" },
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "enrichment.prospect_not_found",
      "enrichment.budget_exceeded",
      "enrichment.provider_unavailable",
      "enrichment.verification_failed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Enriches one to 500 Prospects, optionally for some field groups only (person, company, email_verification). It makes a run set with one run per Prospect, queues the runs in bounded batches and answers 202 with the run set; nothing runs on the request. Each run walks the Organization's provider order per group, asks only for what is still missing, stops on the first result with enough confidence, and records every attempt with its provider, outcome and cost in micro-dollars. The monthly budget and the run ceiling are checked before each provider call, never after: a run that reaches either ends stopped with the reason. An Organization's own imported value is never overwritten; the provider's value is kept beside it as suggested. Written values reach the Prospect with the Source enrichment:<provider>. ${KEY4} The key is the request id: the same key twice charges once and answers 200 with the same run set. A named Prospect outside the caller's view fails the whole call with enrichment.prospect_not_found (404). enrichment.budget_exceeded (429) when this month's budget is already spent; enrichment.provider_unavailable (503) when no provider is enabled with a key for a group asked for; enrichment.verification_failed (422) when email verification is asked for a Prospect with no address. Publishes enrichment.completed as each run ends. ${UNTRUSTED2} ${VISIBILITY4}`
  }),
  getEnrichmentRunSet: inboundRoute({
    method: "GET",
    path: "/v1/enrichment-run-sets/{runSetId}",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: ["enrichment.run_set_not_found"],
    commonErrors: [],
    description: `Reads the progress of one bulk request: total runs, counts by status, the cost so far and whether every run has ended. A Rep sees a run set only if they made it; a Manager those made by their Team; an Owner or Admin all. ${ORG_ONLY2}`
  }),
  getEnrichmentRun: inboundRoute({
    method: "GET",
    path: "/v1/enrichment-runs/{runId}",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: ["enrichment.run_not_found"],
    commonErrors: [],
    description: `Reads one run: its status and stop reason, every attempt (provider, group, outcome, failure, cost), the fields it filled with provider, confidence, time, cost and whether each was written or only suggested, the email verification and the total cost against the ceiling. ${UNTRUSTED2} ${VISIBILITY4}`
  }),
  listEnrichmentRuns: inboundRoute({
    method: "GET",
    path: "/v1/enrichment-runs",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists runs, newest first (by createdAt, then id), ${PAGED}, optionally narrowed by prospectId, runSetId and status. A filter never widens what the caller may see. ${UNTRUSTED2} ${VISIBILITY4}`
  }),
  getProspectEnrichment: inboundRoute({
    method: "GET",
    path: "/v1/prospects/{prospectId}/enrichment",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: ["enrichment.prospect_not_found"],
    commonErrors: [],
    description: `Reads what enrichment knows about one Prospect: each current field with its provider, confidence, time and cost, the latest email verification (valid, risky or invalid, with a reason), and the cost in total and by provider. A Prospect never enriched has empty lists. ${UNTRUSTED2} ${VISIBILITY4}`
  }),
  deleteProspectEnrichment: inboundRoute({
    method: "DELETE",
    path: "/v1/prospects/{prospectId}/enrichment",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrichment.prospect_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Erases everything outbound holds from enrichment for one Prospect: runs, attempts, field copies and verification. Spend totals stay, without any Prospect link. Owner and Admin only; any other is auth.forbidden. Erasing nothing answers 200. ${KEY4} ${VISIBILITY4}`
  }),
  listEnrichmentProviders: inboundRoute({
    method: "GET",
    path: "/v1/enrichment/providers",
    roles: ENRICHMENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the providers this deployment offers with whether each is switched on, whether the Organization stored a key (credentialSet) and the field groups it serves, by provider key, ${PAGED}. No key is ever returned. Owner, Admin and Manager; any other is auth.forbidden. ${SECRETS} ${ORG_ONLY2}`
  }),
  setEnrichmentProvider: inboundRoute({
    method: "PUT",
    path: "/v1/enrichment/providers/{provider}",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrichment.provider_unknown"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Switches a provider on or off for the Organization and optionally stores its own key (apiKey), removes it (null) or keeps it (left out). The answer is the provider's settings, which hold no key. Owner and Admin only; any other is auth.forbidden. ${KEY4} ${SECRETS} ${ORG_ONLY2}`
  }),
  getEnrichmentWaterfall: inboundRoute({
    method: "GET",
    path: "/v1/enrichment/waterfall",
    roles: ENRICHMENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: `Reads the provider order per field group (person, company, email_verification) and its version; version 0 is the default order. Owner, Admin and Manager; any other is auth.forbidden. ${ORG_ONLY2}`
  }),
  setEnrichmentWaterfall: inboundRoute({
    method: "PUT",
    path: "/v1/enrichment/waterfall",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrichment.version_conflict", "enrichment.invalid_waterfall"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Saves the provider order per group. The body names the expectedVersion the caller read; a stale one is enrichment.version_conflict (409), a provider that does not exist or cannot serve that group is enrichment.invalid_waterfall (422). Owner and Admin only; any other is auth.forbidden. ${KEY4} ${ORG_ONLY2}`
  }),
  getEnrichmentBudget: inboundRoute({
    method: "GET",
    path: "/v1/enrichment/budget",
    roles: ENRICHMENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: `Reads this month's enrichment budget: the monthly limit, the run ceiling, what was spent and what is left in micro-dollars, and when the month resets (UTC). Owner, Admin and Manager; any other is auth.forbidden. ${ORG_ONLY2}`
  }),
  setEnrichmentBudget: inboundRoute({
    method: "PUT",
    path: "/v1/enrichment/budget",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrichment.version_conflict"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Sets the monthly limit and the per-run ceiling (not above the limit), in micro-dollars. The body names the expectedVersion the caller read; a stale one is enrichment.version_conflict (409). Owner and Admin only; any other is auth.forbidden. ${KEY4} ${ORG_ONLY2}`
  }),
  listEnrichmentSpend: inboundRoute({
    method: "GET",
    path: "/v1/enrichment/spend",
    roles: ENRICHMENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists spend by month and provider (cost in micro-dollars and calls), newest month first, ${PAGED}, optionally for one month. Owner, Admin and Manager; any other is auth.forbidden. ${ORG_ONLY2}`
  }),
  recordSignalNote: inboundRoute({
    method: "POST",
    path: "/v1/prospects/{prospectId}/signals",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:write" },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrichment.prospect_not_found", "signal.invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Records a note, a signal of kind note in the Rep's own words (such as "met at the conference"), on a Prospect, observed now unless observedAt says when (not in the future: signal.invalid, 422). Other kinds come from providers and the webhook, not from people. ${KEY4} A replay answers 200 with the same signal. Publishes signal.recorded. ${UNTRUSTED2} ${VISIBILITY4}`
  }),
  listProspectSignals: inboundRoute({
    method: "GET",
    path: "/v1/prospects/{prospectId}/signals",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: ["enrichment.prospect_not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists a Prospect's signals as a timeline, newest first (by observedAt, then id), ${PAGED}, optionally only one kind or only fresh ones. Each carries when it expires and whether it is still fresh. ${UNTRUSTED2} ${VISIBILITY4}`
  }),
  getSignal: inboundRoute({
    method: "GET",
    path: "/v1/signals/{signalId}",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: ["signal.not_found"],
    commonErrors: [],
    description: `Reads one signal, the target of a Citation of kind signal. A signal on a Prospect outside the caller's view is signal.not_found (404), never 403, and one of another Organization the same. ${UNTRUSTED2}`
  }),
  getSignalSettings: inboundRoute({
    method: "GET",
    path: "/v1/signal-settings",
    roles: ENRICHMENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: `Reads which kinds of signal matter and how many days each stays fresh, and whether the webhook signing secret is set (never the secret). Every role may read it. ${ORG_ONLY2}`
  }),
  setSignalSettings: inboundRoute({
    method: "PUT",
    path: "/v1/signal-settings",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["enrichment.version_conflict"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Saves, for every kind once, whether it matters and its freshness in days. The body names the expectedVersion the caller read; a stale one is enrichment.version_conflict (409). A stale signal is never used in a message. Owner and Admin only; any other is auth.forbidden. ${KEY4} ${ORG_ONLY2}`
  }),
  rotateSignalWebhookSecret: inboundRoute({
    method: "POST",
    path: "/v1/signal-webhook/rotate",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Makes a new signing secret for the Organization's signal webhook and answers it this once; the old one stops working at once. ${KEY4} A replay within the idempotency window answers the same secret from a stored reply that is encrypted and discarded when the window ends. Owner and Admin only; any other is auth.forbidden. The secret is stored encrypted and is never returned again, logged or put in an error report.`
  }),
  receiveSignalWebhook: inboundRoute({
    method: "POST",
    path: "/v1/public/signals/webhook/{organizationId}",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    errors: ["signal.webhook_unauthorized", "enrichment.prospect_not_found", "signal.invalid"],
    commonErrors: [...PUBLIC_ERRORS],
    description: `Public: records one website visit from the Organization's own site, with no user token. The request carries x-closeline-timestamp and x-closeline-signature, the lower-case hex HMAC-SHA256 of "<timestamp>.<raw body>" with the Organization's signing secret, compared in constant time; a timestamp more than 300 seconds from the receiver's clock, a bad signature or an unknown Organization is signal.webhook_unauthorized (401) and nothing is read. The Prospect is named by id or email and must be the path Organization's own, else enrichment.prospect_not_found (404). The eventId makes a replay answer 200 with duplicate true and record nothing. Publishes signal.recorded. No Idempotency-Key header is needed. ${UNTRUSTED2}`
  }),
  listFitCriteria: inboundRoute({
    method: "GET",
    path: "/v1/fit-criteria",
    roles: ENRICHMENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the Organization's fit criteria, oldest first (by createdAt, then id), ${PAGED}, with the version of the whole set. Every role may read them. ${ORG_ONLY2}`
  }),
  createFitCriterion: inboundRoute({
    method: "POST",
    path: "/v1/fit-criteria",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["fit.invalid_criteria"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Adds a named, weighted criterion on title, industry, employee count, region or technology. At most 50 per Organization with unique names; an operator that does not suit the attribute is fit.invalid_criteria (422). Prospects are scored again in the background and prospect.fit_changed is published for each score that changes. Owner and Admin only; any other is auth.forbidden. ${KEY4} A replay answers 200 with the same criterion. ${ORG_ONLY2}`
  }),
  updateFitCriterion: inboundRoute({
    method: "PATCH",
    path: "/v1/fit-criteria/{criterionId}",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["fit.criterion_not_found", "fit.invalid_criteria"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Changes any part of a criterion. The result must be valid as a whole (fit.invalid_criteria, 422). Prospects are scored again in the background. Owner and Admin only; any other is auth.forbidden. ${KEY4} ${ORG_ONLY2}`
  }),
  deleteFitCriterion: inboundRoute({
    method: "DELETE",
    path: "/v1/fit-criteria/{criterionId}",
    roles: ENRICHMENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["fit.criterion_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Removes a criterion; Prospects are scored again in the background. Removing one already removed answers 200. Owner and Admin only; any other is auth.forbidden. ${KEY4} ${ORG_ONLY2}`
  }),
  getProspectFit: inboundRoute({
    method: "GET",
    path: "/v1/prospects/{prospectId}/fit",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: ["enrichment.prospect_not_found"],
    commonErrors: [],
    description: `Reads a Prospect's fit score: the sum of the weights of the matched criteria out of the sum of all enabled ones, and every criterion with its result (matched, missed, or unknown when the Prospect has no value for it). ${VISIBILITY4}`
  }),
  listFitScores: inboundRoute({
    method: "GET",
    path: "/v1/fit-scores",
    roles: ENRICHMENT_ALL_ROLES,
    publicApi: { scope: "enrichment:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists fit scores, highest first (by score, then Prospect id), ${PAGED}, optionally from a lowest score. Only Prospects the caller may see are listed; a filter never widens that. ${VISIBILITY4}`
  })
});
// src/enrichment/run.ts
import { z as z79 } from "zod";
var RUN_STATUSES = ["queued", "running", "complete", "incomplete", "stopped"];
var runStatusSchema = z79.enum(RUN_STATUSES);
var STOP_REASONS = ["monthly_budget", "run_ceiling"];
var stopReasonSchema = z79.enum(STOP_REASONS);
var ATTEMPT_OUTCOMES = [
  "filled",
  "no_result",
  "failed",
  "skipped_disabled",
  "skipped_circuit_open",
  "skipped_budget"
];
var attemptOutcomeSchema = z79.enum(ATTEMPT_OUTCOMES);
var ATTEMPT_FAILURES = [
  "timeout",
  "rate_limited",
  "provider_error",
  "invalid_response",
  "key_rejected"
];
var attemptFailureSchema = z79.enum(ATTEMPT_FAILURES);
var enrichmentAttemptSchema = z79.object({
  provider: providerKeySchema,
  group: fieldGroupSchema,
  outcome: attemptOutcomeSchema,
  failure: attemptFailureSchema.nullable(),
  costMicros: microDollarsSchema,
  startedAt: timestampSchema,
  durationMs: z79.number().int().min(0).max(600000)
});
var FIELD_APPLICATIONS = ["written", "suggested"];
var fieldApplicationSchema = z79.enum(FIELD_APPLICATIONS);
var fieldProvenanceSchema = z79.object({
  field: enrichedFieldNameSchema,
  value: vendorTextSchema(MAX_ENRICHED_VALUE_LENGTH),
  truncated: z79.boolean(),
  provider: providerKeySchema,
  confidence: z79.number().int().min(0).max(100),
  obtainedAt: timestampSchema,
  costMicros: microDollarsSchema,
  application: fieldApplicationSchema
});
var VERIFICATION_STATUSES = ["valid", "risky", "invalid"];
var verificationStatusSchema = z79.enum(VERIFICATION_STATUSES);
var VERIFICATION_REASONS = [
  "accepted",
  "catch_all",
  "role_based",
  "disposable",
  "mailbox_full",
  "mailbox_not_found",
  "domain_invalid",
  "unknown"
];
var verificationReasonSchema = z79.enum(VERIFICATION_REASONS);
var emailVerificationSchema = z79.object({
  status: verificationStatusSchema,
  reason: verificationReasonSchema,
  provider: providerKeySchema,
  checkedAt: timestampSchema
});
var enrichmentRunSchema = z79.object({
  id: enrichmentRunIdSchema,
  runSetId: enrichmentRunSetIdSchema.nullable(),
  prospectId: prospectIdSchema,
  status: runStatusSchema,
  stopReason: stopReasonSchema.nullable(),
  groups: z79.array(fieldGroupSchema).min(1).max(3),
  attempts: z79.array(enrichmentAttemptSchema).max(MAX_ATTEMPTS_PER_RUN),
  fields: z79.array(fieldProvenanceSchema).max(ENRICHED_FIELDS.length),
  emailVerification: emailVerificationSchema.nullable(),
  costMicros: microDollarsSchema,
  ceilingMicros: microDollarsSchema,
  requestedByUserId: userIdSchema.nullable(),
  createdAt: timestampSchema,
  startedAt: timestampSchema.nullable(),
  completedAt: timestampSchema.nullable()
}).refine((run) => run.status === "stopped" === (run.stopReason !== null), "A stop reason is set exactly when the run is stopped");
var createEnrichmentRequestSchema = z79.strictObject({
  prospectIds: z79.array(prospectIdSchema).min(1).max(MAX_ENRICH_PROSPECTS),
  groups: z79.array(fieldGroupSchema).min(1).max(3).optional()
});
var runSetCountsSchema = z79.object({
  queued: z79.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  running: z79.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  complete: z79.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  incomplete: z79.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  stopped: z79.number().int().min(0).max(MAX_ENRICH_PROSPECTS)
});
var enrichmentRunSetSchema = z79.object({
  id: enrichmentRunSetIdSchema,
  total: z79.number().int().min(1).max(MAX_ENRICH_PROSPECTS),
  counts: runSetCountsSchema,
  costMicros: microDollarsSchema,
  done: z79.boolean(),
  requestedByUserId: userIdSchema.nullable(),
  createdAt: timestampSchema,
  completedAt: timestampSchema.nullable()
});
var listEnrichmentRunsQuerySchema = pageQuerySchema.extend({
  prospectId: prospectIdSchema.optional(),
  runSetId: enrichmentRunSetIdSchema.optional(),
  status: runStatusSchema.optional()
});
var listEnrichmentRunsResponseSchema = pageSchema(enrichmentRunSchema);
var providerCostSchema = z79.object({
  provider: providerKeySchema,
  costMicros: microDollarsSchema,
  calls: z79.number().int().min(0).max(1e6)
});
var prospectEnrichmentSchema = z79.object({
  prospectId: prospectIdSchema,
  fields: z79.array(fieldProvenanceSchema).max(ENRICHED_FIELDS.length),
  emailVerification: emailVerificationSchema.nullable(),
  costMicros: microDollarsSchema,
  costByProvider: z79.array(providerCostSchema).max(MAX_PROVIDERS),
  lastRunId: enrichmentRunIdSchema.nullable(),
  lastEnrichedAt: timestampSchema.nullable()
});
// src/enrichment/settings.ts
import { z as z80 } from "zod";
var providerSettingsSchema = z80.object({
  provider: providerKeySchema,
  enabled: z80.boolean(),
  credentialSet: z80.boolean(),
  credentialUpdatedAt: timestampSchema.nullable(),
  groups: z80.array(fieldGroupSchema).max(FIELD_GROUPS.length),
  updatedAt: timestampSchema.nullable()
});
var providerApiKeySchema = z80.string().min(8).max(MAX_PROVIDER_API_KEY_LENGTH).regex(/^[\x21-\x7e]+$/);
var setProviderRequestSchema = z80.strictObject({
  enabled: z80.boolean(),
  apiKey: providerApiKeySchema.nullable().optional()
});
var listProvidersQuerySchema = pageQuerySchema;
var listProvidersResponseSchema = pageSchema(providerSettingsSchema);
var orderSchema = z80.array(providerKeySchema).max(MAX_PROVIDERS).refine((order) => new Set(order).size === order.length, "A provider is listed once");
var orderShape = {
  person: orderSchema,
  company: orderSchema,
  email_verification: orderSchema
};
var waterfallOrderSchema = z80.object(orderShape);
var waterfallSchema = z80.object({
  order: waterfallOrderSchema,
  version: z80.number().int().min(0).max(1e6),
  updatedAt: timestampSchema.nullable()
});
var setWaterfallRequestSchema = z80.strictObject({
  order: z80.strictObject(orderShape),
  expectedVersion: z80.number().int().min(0).max(1e6)
});
var enrichmentBudgetSchema = z80.object({
  month: monthSchema,
  monthlyLimitMicros: microDollarsSchema,
  perRunCeilingMicros: microDollarsSchema,
  spentMicros: microDollarsSchema,
  remainingMicros: microDollarsSchema,
  resetsAt: timestampSchema,
  version: z80.number().int().min(0).max(1e6),
  updatedAt: timestampSchema.nullable()
});
var setBudgetRequestSchema = z80.strictObject({
  monthlyLimitMicros: microDollarsSchema,
  perRunCeilingMicros: microDollarsSchema,
  expectedVersion: z80.number().int().min(0).max(1e6)
}).refine((budget) => budget.perRunCeilingMicros <= budget.monthlyLimitMicros, "The run ceiling is not above the monthly limit");
var spendEntrySchema = z80.object({
  month: monthSchema,
  provider: providerKeySchema,
  costMicros: microDollarsSchema,
  calls: z80.number().int().min(0).max(1e9)
});
var listSpendQuerySchema = pageQuerySchema.extend({ month: monthSchema.optional() });
var listSpendResponseSchema = pageSchema(spendEntrySchema);
// src/export/errors.ts
var EXPORT_ERRORS = defineErrors("export", {
  already_running: { status: 409, message: "An export is already running." },
  daily_limit: { status: 429, message: "The daily limit of exports was reached. Try again later." },
  not_found: { status: 404, message: "The export was not found." },
  not_ready: { status: 409, message: "The export is not ready to download." },
  expired: { status: 410, message: "The export has expired. Request a new one." }
});
// src/export/events.ts
import { z as z82 } from "zod";

// src/export/values.ts
import { z as z81 } from "zod";
var EXPORT_SERVICES = ["core", "playbook", "voice", "outbound"];
var exportServiceSchema = z81.enum(EXPORT_SERVICES);
var EXPORT_STATES = ["queued", "running", "ready", "failed", "expired"];
var exportStateSchema = z81.enum(EXPORT_STATES);
var EXPORT_ACTIVE_STATES = ["queued", "running"];
var EXPORT_PART_STATES = ["pending", "ready", "failed"];
var exportPartStateSchema = z81.enum(EXPORT_PART_STATES);
var EXPORT_FAILURE_REASONS = ["part_failed", "timed_out", "storage_unavailable"];
var exportFailureReasonSchema = z81.enum(EXPORT_FAILURE_REASONS);
var EXPORT_PART_FAILURE_REASONS = [
  "write_failed",
  "storage_unavailable",
  "source_unavailable"
];
var exportPartFailureReasonSchema = z81.enum(EXPORT_PART_FAILURE_REASONS);
var MAX_EXPORTS_PER_DAY = 2;
var EXPORT_LINK_HOURS = 24;
var MAX_EXPORT_PART_FILES = 1e4;
var MAX_EXPORT_PART_BYTES = 50000000000;
var exportPrefixSchema = z81.string().max(300).regex(/^[A-Za-z0-9_][A-Za-z0-9_\-./]*$/).refine((prefix) => !prefix.split("/").includes(".."), "No parent directory in a prefix");
var createExportRequestSchema = z81.strictObject({
  includeRecordingLinks: z81.boolean().default(false)
});
var exportPartSchema = z81.object({
  service: exportServiceSchema,
  state: exportPartStateSchema,
  fileCount: z81.number().int().min(0).max(MAX_EXPORT_PART_FILES).nullable(),
  bytes: z81.number().int().min(0).max(MAX_EXPORT_PART_BYTES).nullable(),
  readyAt: timestampSchema.nullable()
});
var exportJobSchema = z81.object({
  id: exportJobIdSchema,
  state: exportStateSchema,
  requestedByMembershipId: membershipIdSchema,
  includeRecordingLinks: z81.boolean(),
  parts: z81.array(exportPartSchema).max(EXPORT_SERVICES.length),
  failureReason: exportFailureReasonSchema.nullable(),
  requestedAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
  expiresAt: timestampSchema.nullable()
}).superRefine((job, ctx) => {
  if (job.state === "failed" !== (job.failureReason !== null)) {
    ctx.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "Only a failed export has a failure reason"
    });
  }
});
var listExportsQuerySchema = pageQuerySchema;
var listExportsResponseSchema = pageSchema(exportJobSchema);
var exportDownloadSchema = z81.object({
  exportId: exportJobIdSchema,
  url: z81.url({ protocol: /^https$/ }).max(2048),
  expiresAt: timestampSchema
});

// src/export/events.ts
var exportRequestedEvent = defineEvent("export.requested", 1, z82.strictObject({
  exportId: exportJobIdSchema,
  requestedByMembershipId: membershipIdSchema,
  includeRecordingLinks: z82.boolean(),
  requestedAt: timestampSchema
}));
var exportPartReadyEvent = defineEvent("export.part_ready", 1, z82.strictObject({
  exportId: exportJobIdSchema,
  service: exportServiceSchema,
  prefix: exportPrefixSchema,
  fileCount: z82.number().int().min(0).max(MAX_EXPORT_PART_FILES),
  bytes: z82.number().int().min(0).max(MAX_EXPORT_PART_BYTES),
  readyAt: timestampSchema
}));
var exportPartFailedEvent = defineEvent("export.part_failed", 1, z82.strictObject({
  exportId: exportJobIdSchema,
  service: exportServiceSchema,
  reason: exportPartFailureReasonSchema,
  failedAt: timestampSchema
}));
var EXPORT_EVENTS = {
  "export.requested": exportRequestedEvent,
  "export.part_ready": exportPartReadyEvent,
  "export.part_failed": exportPartFailedEvent
};
// src/export/routes.ts
var EXPORT_ROLES = ["owner", "admin"];
var KEY5 = "Requires an Idempotency-Key header: a replay answers the same result and does the work once.";
var ORG_ONLY3 = "An export belongs to the caller's Organization alone; one of another Organization is export.not_found (404), never 403.";
var SAFE = "The export leaves out password hashes, tokens, API keys and their hashes, and every row of another Organization.";
var EXPORT_ROUTES = Object.freeze({
  createExport: inboundRoute({
    method: "POST",
    path: "/v1/exports",
    roles: EXPORT_ROLES,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["export.already_running", "export.daily_limit"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Starts an export of the Organization's data and answers 202 with the job; nothing is built on the request. It publishes export.requested, each service writes its slice and publishes export.part_ready (or export.part_failed, which fails the job at once; the timeout is the backstop), and core builds the manifest. Recordings are included as links on request, never copied inline. ${SAFE} Only one export runs at a time (export.already_running, 409) and at most two are requested in 24 hours (export.daily_limit, 429). ${KEY5} The same key twice answers 200 with the same job. Owner and Admin only. ${ORG_ONLY3}`
  }),
  listExports: inboundRoute({
    method: "GET",
    path: "/v1/exports",
    roles: EXPORT_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the Organization's export jobs, newest first, one cursor-paginated page at a time (at most 100). A job shows its state, each service's slice, the failure reason when it failed and when it expires; never a download link. Owner and Admin only. ${ORG_ONLY3}`
  }),
  getExport: inboundRoute({
    method: "GET",
    path: "/v1/exports/{exportId}",
    roles: EXPORT_ROLES,
    success: [200],
    idempotent: false,
    errors: ["export.not_found"],
    commonErrors: [],
    description: `Reads one export job: its state, the state of each service's slice, the failure reason (part_failed, timed_out or storage_unavailable) and its expiry. A service that cannot write its slice reports export.part_failed and the job fails at once; the timeout (timed_out) is only the backstop for a service that never answers. Poll it, or wait for the notice that it finished or failed. Never carries a download link. Owner and Admin only. ${ORG_ONLY3}`
  }),
  createExportDownload: inboundRoute({
    method: "POST",
    path: "/v1/exports/{exportId}/download-links",
    roles: EXPORT_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["export.not_found", "export.not_ready", "export.expired"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Makes a download link for a ready export, valid for 24 hours from the export finishing and no longer than that. An export that has not finished or has failed is export.not_ready (409); one past its expiry is export.expired (410). ${KEY5} The same key answers the same link. The link is never logged and never stored on the job. Owner and Admin only. The download is audited. ${ORG_ONLY3}`
  })
});
// src/inbox/conversation.ts
import { z as z83 } from "zod";
var issueAt = (ctx) => (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
var classificationSchema = z83.strictObject({
  label: replyLabelSchema,
  confidence: confidenceSchema,
  decidedBy: z83.enum(["model", "rep"]),
  correctedByMembershipId: membershipIdSchema.nullable(),
  classifiedAt: timestampSchema
}).superRefine((c, ctx) => {
  if (c.decidedBy === "rep" !== (c.correctedByMembershipId !== null)) {
    issueAt(ctx)("correctedByMembershipId", "Only a correction names who made it");
  }
});
var conversationSchema = z83.strictObject({
  id: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  controller: conversationControllerSchema,
  controllerMembershipId: membershipIdSchema.nullable(),
  state: conversationStateSchema,
  ownerMembershipId: membershipIdSchema.nullable(),
  latestLabel: replyLabelSchema.nullable(),
  pendingDraftCount: z83.number().int().min(0).max(1000),
  lastMessageAt: timestampSchema,
  createdAt: timestampSchema
}).superRefine((c, ctx) => {
  const issue = issueAt(ctx);
  if (c.controller === "rep" !== (c.controllerMembershipId !== null)) {
    issue("controllerMembershipId", "Exactly a Rep-controlled Conversation names its Rep");
  }
  if (c.state === "rep" && c.controller !== "rep") {
    issue("controller", "A Conversation in the rep state is controlled by a Rep");
  }
  if (c.controller === "rep" && c.state !== "rep" && c.state !== "closed") {
    issue("state", "A Rep-controlled Conversation is in the rep or closed state");
  }
});
var messageSchema2 = z83.strictObject({
  id: messageIdSchema,
  conversationId: conversationIdSchema,
  direction: messageDirectionSchema,
  authorKind: messageAuthorKindSchema,
  authorMembershipId: membershipIdSchema.nullable(),
  providerMessageId: providerMessageIdSchema,
  draftId: draftIdSchema.nullable(),
  body: messageBodySchema,
  sentAt: timestampSchema,
  classification: classificationSchema.nullable()
}).superRefine((m, ctx) => {
  const issue = issueAt(ctx);
  if (m.direction === "inbound" !== (m.authorKind === "prospect")) {
    issue("authorKind", "An inbound Message is the Prospect’s and an outbound one is not");
  }
  if (m.authorKind === "rep" !== (m.authorMembershipId !== null)) {
    issue("authorMembershipId", "Exactly a Rep’s Message names the Rep");
  }
  if (m.direction === "inbound" && m.draftId !== null) {
    issue("draftId", "An inbound Message has no Draft");
  }
  if (m.authorKind === "rep" && m.draftId === null) {
    issue("draftId", "A Rep’s Message comes from a Draft; only an Agent’s sequence Message has none");
  }
  if (m.direction === "outbound" && m.classification !== null) {
    issue("classification", "Only an inbound Message has a classification");
  }
});
var sourceSchema = z83.strictObject({
  kind: draftSourceKindSchema,
  sourceRef: sourceRefSchema,
  dealRecordId: dealRecordIdSchema.nullable(),
  documentId: documentIdSchema.nullable(),
  outcome: outcomeSchema.nullable(),
  evidenceCount: z83.number().int().min(1).max(1e5)
}).superRefine((s, ctx) => {
  const issue = issueAt(ctx);
  if (s.kind === "moment") {
    if (s.dealRecordId === null) {
      issue("dealRecordId", "A Moment names its Deal");
    }
    if (s.documentId !== null) {
      issue("documentId", "A Moment has no document");
    }
    if (s.outcome === null) {
      issue("outcome", "A Moment carries its Deal’s Outcome");
    }
  } else {
    if (s.documentId === null) {
      issue("documentId", "A document chunk names its document");
    }
    if (s.dealRecordId !== null) {
      issue("dealRecordId", "A document chunk has no Deal");
    }
    if (s.outcome !== null) {
      issue("outcome", "A document chunk has no Outcome");
    }
  }
});
var sourcePassageSchema = z83.strictObject({
  source: sourceSchema,
  passage: z83.string().min(1).max(MAX_SOURCE_PASSAGE_LENGTH)
});
var draftReasonSchema = z83.strictObject({
  triggerMessageId: messageIdSchema,
  label: replyLabelSchema,
  strategy: z83.string().min(1).max(MAX_STRATEGY_LENGTH)
});
var draftCheckSchema = z83.strictObject({
  name: z83.string().regex(/^[a-z][a-z0-9_]{0,49}$/),
  passed: z83.boolean()
});
var draftSchema = z83.strictObject({
  id: draftIdSchema,
  conversationId: conversationIdSchema,
  author: draftAuthorSchema,
  authorMembershipId: membershipIdSchema.nullable(),
  body: messageBodySchema,
  reason: draftReasonSchema.nullable(),
  sources: z83.array(sourceSchema).max(MAX_DRAFT_SOURCES),
  confidence: confidenceSchema.nullable(),
  ungrounded: z83.boolean(),
  checks: z83.array(draftCheckSchema).max(20),
  hold: draftHoldReasonSchema.nullable(),
  status: draftStatusSchema,
  createdAt: timestampSchema,
  decidedAt: timestampSchema.nullable()
}).superRefine((d, ctx) => {
  const issue = issueAt(ctx);
  const agent = d.author === "agent";
  if (agent !== (d.reason !== null)) {
    issue("reason", "Exactly an Agent Draft has a reason");
  }
  if (agent !== (d.confidence !== null)) {
    issue("confidence", "Exactly an Agent Draft has a confidence");
  }
  if (agent === (d.authorMembershipId !== null)) {
    issue("authorMembershipId", "Exactly a Rep’s Draft names its author");
  }
  if (!agent && (d.sources.length > 0 || d.ungrounded || d.hold !== null)) {
    issue("sources", "A Rep’s Draft has no Sources, is not ungrounded and is not held");
  }
  if (agent && d.ungrounded !== (d.sources.length === 0)) {
    issue("ungrounded", "A Draft is ungrounded exactly when it cites no Source");
  }
  if (new Set(d.sources.map((s) => `${s.kind}:${s.sourceRef}`)).size !== d.sources.length) {
    issue("sources", "A Source is cited once");
  }
  const failedCheck = d.checks.some((c) => !c.passed);
  if ((d.ungrounded || failedCheck) && d.hold === null) {
    issue("hold", "An ungrounded Draft or one that failed a check is always held");
  }
  if (d.ungrounded && d.hold !== null && d.hold !== "ungrounded") {
    issue("hold", "An ungrounded Draft is held as ungrounded, whatever else holds it");
  }
  if (!d.ungrounded && failedCheck && d.hold !== null && d.hold !== "check_failed") {
    issue("hold", "A Draft that failed a check is held as check_failed");
  }
  if (d.hold === "ungrounded" && !d.ungrounded) {
    issue("hold", "Only an ungrounded Draft is held as ungrounded");
  }
  if (d.hold === "check_failed" && !failedCheck) {
    issue("hold", "Only a Draft that failed a check is held as check_failed");
  }
  if (d.status === "pending" && d.hold === null) {
    issue("hold", "A pending Draft waits because it is held");
  }
  if (d.status === "pending" && d.decidedAt !== null) {
    issue("decidedAt", "A pending Draft has no decision time");
  }
});
var DECISION_KINDS = [
  "approve",
  "edit_approve",
  "reject",
  "auto_release",
  "takeover",
  "hand_back"
];
var decisionKindSchema = z83.enum(DECISION_KINDS);
var decisionSchema = z83.strictObject({
  id: decisionIdSchema,
  conversationId: conversationIdSchema,
  draftId: draftIdSchema.nullable(),
  kind: decisionKindSchema,
  decidedByMembershipId: membershipIdSchema.nullable(),
  note: decisionNoteSchema.nullable(),
  acknowledgedUngrounded: z83.boolean(),
  decidedAt: timestampSchema
}).superRefine((d, ctx) => {
  const issue = issueAt(ctx);
  const aboutConversation = d.kind === "takeover" || d.kind === "hand_back";
  if (aboutConversation !== (d.draftId === null)) {
    issue("draftId", "A Draft decision names its Draft and a takeover or hand-back does not");
  }
  if (d.kind === "auto_release" !== (d.decidedByMembershipId === null)) {
    issue("decidedByMembershipId", "Only an automatic release has no member");
  }
  if (d.acknowledgedUngrounded && d.kind !== "approve" && d.kind !== "edit_approve") {
    issue("acknowledgedUngrounded", "Only an approval can acknowledge an ungrounded Draft");
  }
  if (d.note !== null && d.kind !== "reject") {
    issue("note", "Only a rejection carries a note");
  }
});
var APPROVAL_MODES = ["always", "below_confidence", "except"];
var MAX_EXCEPT_LABELS = 10;
var approvalRuleSchema = z83.discriminatedUnion("mode", [
  z83.strictObject({ mode: z83.literal("always") }),
  z83.strictObject({
    mode: z83.literal("below_confidence"),
    threshold: z83.number().gt(0).max(1)
  }),
  z83.strictObject({
    mode: z83.literal("except"),
    labels: z83.array(replyLabelSchema).min(1).max(MAX_EXCEPT_LABELS).refine((labels) => new Set(labels).size === labels.length, "No repeats")
  })
]);
var approvalPolicySchema = z83.strictObject({
  channel: inboxChannelSchema,
  rule: approvalRuleSchema,
  updatedAt: timestampSchema.nullable(),
  updatedByMembershipId: membershipIdSchema.nullable()
});
function holdReasonFor(rule, facts) {
  if (facts.ungrounded) {
    return "ungrounded";
  }
  if (facts.failedCheck) {
    return "check_failed";
  }
  if (facts.escalated) {
    return "escalated";
  }
  if (facts.firstMessage) {
    return "first_message";
  }
  switch (rule.mode) {
    case "always":
      return "policy";
    case "below_confidence":
      return facts.confidence < rule.threshold ? "policy" : null;
    case "except":
      return rule.labels.includes(facts.label) ? null : "policy";
  }
}
var conversationParamsSchema = z83.strictObject({ conversationId: conversationIdSchema });
var conversationMessageParamsSchema = z83.strictObject({
  conversationId: conversationIdSchema,
  messageId: messageIdSchema
});
var draftParamsSchema = z83.strictObject({ draftId: draftIdSchema });
var channelParamsSchema = z83.strictObject({ channel: inboxChannelSchema });
var inboxKeyedHeadersSchema = z83.object({ "idempotency-key": idempotencyKeySchema });
var conversationCursorSchema = z83.strictObject({
  lastMessageAt: timestampSchema,
  id: conversationIdSchema
});
var listConversationsQuerySchema = pageQuerySchema.extend({
  channel: inboxChannelSchema.optional(),
  state: conversationStateSchema.optional(),
  controller: conversationControllerSchema.optional(),
  label: replyLabelSchema.optional(),
  prospectId: prospectIdSchema.optional()
}).strict();
var conversationPageSchema = pageSchema(conversationSchema);
var messageCursorSchema = z83.strictObject({
  sentAt: timestampSchema,
  id: messageIdSchema
});
var listMessagesQuerySchema = pageQuerySchema.strict();
var messagePageSchema = pageSchema(messageSchema2);
var correctClassificationRequestSchema = z83.strictObject({ label: replyLabelSchema });
var conversationActionRequestSchema = z83.strictObject({});
var replyRequestSchema = z83.strictObject({ body: messageBodySchema });
var approveDraftRequestSchema = z83.strictObject({
  body: messageBodySchema.optional(),
  acknowledgeUngrounded: z83.boolean().default(false)
});
var rejectDraftRequestSchema = z83.strictObject({ note: decisionNoteSchema.optional() });
var draftSourcesSchema = z83.strictObject({
  items: z83.array(sourcePassageSchema).max(MAX_DRAFT_SOURCES)
});
var approvalQueueItemSchema = z83.strictObject({
  draft: draftSchema,
  channel: inboxChannelSchema,
  prospectId: prospectIdSchema,
  ownerMembershipId: membershipIdSchema.nullable(),
  canApprove: z83.boolean()
});
var approvalQueueCursorSchema = z83.strictObject({
  createdAt: timestampSchema,
  id: draftIdSchema
});
var listApprovalQueueQuerySchema = pageQuerySchema.extend({
  channel: inboxChannelSchema.optional(),
  conversationId: conversationIdSchema.optional()
}).strict();
var approvalQueuePageSchema = pageSchema(approvalQueueItemSchema);
var decisionCursorSchema = z83.strictObject({
  decidedAt: timestampSchema,
  id: decisionIdSchema
});
var listDecisionsQuerySchema = pageQuerySchema.extend({
  conversationId: conversationIdSchema.optional(),
  draftId: draftIdSchema.optional(),
  kind: decisionKindSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from), { message: "The range ends after it starts", path: ["to"] });
var decisionPageSchema = pageSchema(decisionSchema);
var approvalPoliciesSchema = z83.strictObject({
  items: z83.array(approvalPolicySchema).max(3)
});
var setApprovalPolicyRequestSchema = z83.strictObject({ rule: approvalRuleSchema });
var ingestBodySchema = z83.string().max(MAX_MESSAGE_BODY_LENGTH).transform((text) => text.replace(/\r\n?/g, `
`).split("").filter((ch) => !hasControlCharacter2(ch, true)).join("")).pipe(messageBodySchema);
var ingestMessageRequestSchema = z83.strictObject({
  channel: inboxChannelSchema,
  providerMessageId: providerMessageIdSchema,
  prospectId: prospectIdSchema,
  direction: messageDirectionSchema,
  body: ingestBodySchema,
  draftId: draftIdSchema.optional(),
  sentAt: timestampSchema
}).superRefine((m, ctx) => {
  if (m.direction === "inbound" && m.draftId !== undefined) {
    issueAt(ctx)("draftId", "An inbound Message has no Draft");
  }
});
var ingestMessageResultSchema = z83.strictObject({
  message: messageSchema2,
  created: z83.boolean()
});
var draftReleaseSchema = z83.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  body: messageBodySchema
});
// src/inbox/errors.ts
var INBOX_ERRORS = {
  ...defineErrors("inbox", {
    conversation_not_found: { status: 404, message: "The Conversation was not found." },
    message_not_found: { status: 404, message: "The Message was not found." },
    draft_not_found: { status: 404, message: "The Draft was not found." },
    draft_not_pending: { status: 409, message: "The Draft is no longer waiting for a decision." },
    not_conversation_owner: {
      status: 403,
      message: "This Conversation is not yours to act on."
    },
    draft_ungrounded: {
      status: 422,
      message: "The Draft cites no Playbook source. Confirm it before it is approved."
    },
    already_controlled: {
      status: 409,
      message: "Another Rep has already taken over this Conversation."
    },
    takeover_required: { status: 409, message: "Take over the Conversation before replying." },
    not_taken_over: { status: 409, message: "The Conversation is not taken over." },
    conversation_closed: { status: 409, message: "The Conversation is closed." },
    message_not_inbound: { status: 409, message: "Only a reply from a Prospect has a label." },
    prospect_not_found: { status: 404, message: "The Prospect was not found." },
    prospect_suppressed: {
      status: 409,
      message: "The Prospect asked not to be contacted on this channel."
    }
  })
};
// src/inbox/events.ts
import { z as z84 } from "zod";
var messageApprovedEvent = defineEvent("message.approved", 1, z84.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  approvedByMembershipId: membershipIdSchema.nullable(),
  edited: z84.boolean(),
  acknowledgedUngrounded: z84.boolean(),
  approvedAt: timestampSchema
}));
var messageSentEvent = defineEvent("message.sent", 1, z84.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  messageId: messageIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  sentAt: timestampSchema
}));
var messageFailedEvent = defineEvent("message.failed", 1, z84.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  reason: messageFailureReasonSchema,
  retryable: z84.boolean(),
  failedAt: timestampSchema
}));
var replyClassifiedEvent = defineEvent("reply.classified", 1, z84.strictObject({
  conversationId: conversationIdSchema,
  messageId: messageIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  label: replyLabelSchema,
  confidence: confidenceSchema,
  classifiedAt: timestampSchema
}));
var conversationTakenOverEvent = defineEvent("conversation.taken_over", 1, z84.strictObject({
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  takenOverByMembershipId: membershipIdSchema,
  voidedDraftCount: z84.number().int().min(0).max(1000),
  takenOverAt: timestampSchema
}));
var conversationHandedBackEvent = defineEvent("conversation.handed_back", 1, z84.strictObject({
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  handedBackByMembershipId: membershipIdSchema,
  handedBackAt: timestampSchema
}));
var INBOX_EVENTS = {
  "message.approved": messageApprovedEvent,
  "message.sent": messageSentEvent,
  "message.failed": messageFailedEvent,
  "reply.classified": replyClassifiedEvent,
  "conversation.taken_over": conversationTakenOverEvent,
  "conversation.handed_back": conversationHandedBackEvent
};
// src/inbox/routes.ts
var INBOX_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var INBOX_ADMIN_ROLES = ["owner", "admin"];
var INBOX_REVIEW_ROLES = ["owner", "admin", "manager"];
var VISIBILITY5 = "An Owner or Admin sees every Conversation; a Manager sees those of the Reps on their Team; a Rep sees only those they own. A Conversation, Message or Draft outside the caller's view is inbox.conversation_not_found, inbox.message_not_found or inbox.draft_not_found (404), never 403, and one of another Organization the same.";
var SENSITIVE = "Message and Draft text is the Prospect’s or a model’s words: it is untrusted data for every consumer, and services never log it or put it in an error report or an event.";
var INBOX_ROUTES = Object.freeze({
  listConversations: inboundRoute({
    method: "GET",
    path: "/v1/conversations",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Conversations, latest activity first, one cursor-paginated page at a time (at most 100), optionally narrowed by channel, state, controller, latest label and Prospect. Each shows who is answering now (the Agent or a Rep), its state and the label of the latest reply. A filter never widens what the caller may see. ${VISIBILITY5}`
  }),
  getConversation: inboundRoute({
    method: "GET",
    path: "/v1/conversations/{conversationId}",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.conversation_not_found"],
    commonErrors: [],
    description: `Reads one Conversation: its channel, Prospect, who controls it, its state and pending Draft count. ${VISIBILITY5}`
  }),
  listConversationMessages: inboundRoute({
    method: "GET",
    path: "/v1/conversations/{conversationId}/messages",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.conversation_not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the Messages of a Conversation, oldest first, one cursor-paginated page at a time (at most 100), each inbound Message with its label. ${SENSITIVE} ${VISIBILITY5}`
  }),
  correctClassification: inboundRoute({
    method: "PUT",
    path: "/v1/conversations/{conversationId}/messages/{messageId}/classification",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.message_not_found",
      "inbox.message_not_inbound"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Corrects the label of an inbound Message to one of the closed set of labels (any other value is request.invalid). The correction is recorded with who made it, replaces the model's label, and a repeat with the same label changes nothing. A correction to unsubscribe or bounce publishes reply.classified. An outbound Message has no label: inbox.message_not_inbound (409). ${VISIBILITY5}`
  }),
  takeOverConversation: inboundRoute({
    method: "POST",
    path: "/v1/conversations/{conversationId}/takeover",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.already_controlled",
      "inbox.conversation_closed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Takes the Conversation over from the Agent in one step: the caller becomes its controller, every pending Draft is voided, no Agent Draft is created while they control it, and conversation.taken_over is published (the sequence pauses). Requires an Idempotency-Key header; taking over a Conversation the caller already controls answers 200 and publishes nothing again. Another Rep who already controls it is inbox.already_controlled (409). A closed Conversation is inbox.conversation_closed (409). A Rep can take over only what they own; a Manager, Admin or Owner may step in on any they can see. The full history, labels and cited Sources stay readable. ${VISIBILITY5}`
  }),
  handBackConversation: inboundRoute({
    method: "POST",
    path: "/v1/conversations/{conversationId}/handback",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.not_conversation_owner",
      "inbox.not_taken_over"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Hands the Conversation back to the Agent: new replies are classified and drafted again, and conversation.handed_back is published. Requires an Idempotency-Key header; a replay answers the same result and publishes once. Only the Rep who took it over, or an Admin or Owner, may hand it back; any other caller who can see it gets inbox.not_conversation_owner (403). A Conversation no Rep controls is inbox.not_taken_over (409). ${VISIBILITY5}`
  }),
  replyToConversation: inboundRoute({
    method: "POST",
    path: "/v1/conversations/{conversationId}/replies",
    roles: INBOX_ALL_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.not_conversation_owner",
      "inbox.takeover_required",
      "inbox.conversation_closed",
      "inbox.prospect_suppressed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `A Rep replies from the inbox, and the text is sent through the Conversation's channel: core records an approved Draft authored by the Rep and publishes message.approved; the channel service sends it. Answers 202 with that Draft; the Message exists once the channel confirms with message.sent. Requires an Idempotency-Key header: a replay answers the same Draft and sends once. Only the Rep who controls the Conversation may reply (inbox.not_conversation_owner, 403); one the Agent still controls is inbox.takeover_required (409); a closed one is inbox.conversation_closed (409); a Prospect who asked to stop on the channel is inbox.prospect_suppressed (409) and nothing is sent. ${SENSITIVE} ${VISIBILITY5}`
  }),
  listApprovalQueue: inboundRoute({
    method: "GET",
    path: "/v1/approvals",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the Drafts waiting for a person, oldest first, one cursor-paginated page at a time (at most 100), optionally narrowed by channel or Conversation. Each entry says whether the caller may decide it (canApprove) and which Rep owns the Conversation. ${VISIBILITY5}`
  }),
  getDraft: inboundRoute({
    method: "GET",
    path: "/v1/drafts/{draftId}",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.draft_not_found"],
    commonErrors: [],
    description: `Reads one Draft with its reason (the reply it answers, its label and the strategy), its confidence, its checks, why it is held, and its cited Sources with their Outcome and evidence count. ${SENSITIVE} ${VISIBILITY5}`
  }),
  getDraftSources: inboundRoute({
    method: "GET",
    path: "/v1/drafts/{draftId}/sources",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.draft_not_found"],
    commonErrors: ["server.unavailable", "server.timeout"],
    description: `Reads the passage of each Source a Draft cites (a Moment or a Playbook document passage) with its Deal Outcome and evidence count, resolved from the Playbook for display only. The passages are the Organization's own content treated as untrusted text. If the Playbook cannot answer in time the route answers server.unavailable or server.timeout; the Draft is still readable. ${VISIBILITY5}`
  }),
  approveDraft: inboundRoute({
    method: "POST",
    path: "/v1/drafts/{draftId}/approve",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.draft_not_found",
      "inbox.draft_not_pending",
      "inbox.not_conversation_owner",
      "inbox.draft_ungrounded",
      "inbox.prospect_suppressed",
      "inbox.conversation_closed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Approves a pending Draft, optionally with edited text (the edited text is what is sent; the Decision is recorded as edit_approve with who and when), and publishes exactly one message.approved. The Decision and the event both record acknowledgedUngrounded. Requires an Idempotency-Key header: a replay answers the same result and publishes once. A Draft already decided, sent, superseded or voided is inbox.draft_not_pending (409). A Draft with no Source is inbox.draft_ungrounded (422) unless the body sets acknowledgeUngrounded to true. Only the Rep who owns the Conversation, a Manager for their Team's, or an Admin or Owner may approve; another caller who can see it gets inbox.not_conversation_owner (403). A Prospect who asked to stop on the channel is inbox.prospect_suppressed (409). ${SENSITIVE} ${VISIBILITY5}`
  }),
  rejectDraft: inboundRoute({
    method: "POST",
    path: "/v1/drafts/{draftId}/reject",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["inbox.draft_not_found", "inbox.draft_not_pending", "inbox.not_conversation_owner"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Rejects a pending Draft with an optional short note, which is recorded with who and when. Nothing is sent. Requires an Idempotency-Key header: a replay answers the same result. Who may reject is who may approve (inbox.not_conversation_owner, 403 for the rest). A Draft no longer pending is inbox.draft_not_pending (409). ${VISIBILITY5}`
  }),
  listDecisions: inboundRoute({
    method: "GET",
    path: "/v1/decisions",
    roles: INBOX_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the record of approvals, edits, rejections, automatic releases, takeovers and hand-backs, latest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Conversation, Draft, kind and time range. Each entry says who decided and when. Owner and Admin see all; a Manager sees those of Conversations of their Team's Reps; a Rep is auth.forbidden.`
  }),
  listApprovalPolicies: inboundRoute({
    method: "GET",
    path: "/v1/approval-policies",
    roles: INBOX_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the approval rule of every channel (always, below a confidence, or except for named labels), the default being that every Draft waits for a person. Owner and Admin only; any other role is auth.forbidden."
  }),
  setApprovalPolicy: inboundRoute({
    method: "PUT",
    path: "/v1/approval-policies/{channel}",
    roles: INBOX_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the approval rule of one channel; a repeat with the same body changes nothing, so a retry is safe. The rule never releases an ungrounded Draft, one that failed a check, one from an escalated Conversation, or the first message to a Prospect: those always wait for a person and there is no setting for it. A rule that is not one of the three shapes is request.invalid. Owner and Admin only."
  }),
  ingestMessage: inboundRoute({
    method: "POST",
    path: "/internal/messages",
    roles: [],
    internal: true,
    success: [201, 200],
    idempotent: true,
    errors: ["inbox.prospect_not_found"],
    commonErrors: ["request.invalid", "auth.unauthenticated", "server.unavailable"],
    description: `Internal: a channel service posts every inbound and outbound Message with the shared secret (ADR 0013); no user token. The Organization is never taken from the body: the Prospect id is looked up under the Organization the shared-secret caller states, and a Prospect outside that scope (unknown, or of another Organization) is inbox.prospect_not_found (404) and nothing is stored. The body is at most 20,000 characters; line endings are normalised and other control characters dropped. Idempotent on channel plus provider message id: the first post stores the Message and answers 201, any repeat answers 200 with the same Message and stores nothing. Core finds or creates the Conversation for the Prospect and channel, queues classification of an inbound Message, and never calls a vendor. ${SENSITIVE}`
  }),
  getDraftRelease: inboundRoute({
    method: "GET",
    path: "/internal/drafts/{draftId}/release",
    roles: [],
    internal: true,
    success: [200],
    idempotent: false,
    errors: ["inbox.draft_not_found", "inbox.draft_not_pending"],
    commonErrors: ["auth.unauthenticated", "server.unavailable"],
    description: `Internal: after message.approved, the channel service reads the text to send with the Draft id (also its idempotency key) and the shared secret (ADR 0013); events carry no text. A Draft that is not approved (rejected, voided because a Rep took over, superseded) is inbox.draft_not_pending (409) and must not be sent. ${SENSITIVE}`
  })
});
// src/inquiry/errors.ts
var INQUIRY_ERRORS = {
  ...defineErrors("inquiry", {
    origin_not_allowed: { status: 403, message: "This site is not allowed to send Inquiries." },
    key_invalid: { status: 404, message: "The form was not found." },
    consent_wording_missing: {
      status: 422,
      message: "The consent wording shown with the form is missing or out of date."
    },
    embed_invalid: { status: 422, message: "The embed settings are not valid." },
    not_found: { status: 404, message: "The Inquiry was not found." },
    retries_exhausted: {
      status: 409,
      message: "The callback has used all its attempts."
    }
  })
};
// src/inquiry/events.ts
import { z as z85 } from "zod";
var voiceInquiryReceivedEvent = defineEvent("voice.inquiry.received", 1, z85.strictObject({
  inquiryId: inquiryIdSchema,
  source: inquirySourceSchema,
  prospectId: prospectIdSchema,
  chatId: chatIdSchema.nullable(),
  callId: callIdSchema.nullable(),
  receivedAt: timestampSchema
}));
var INQUIRY_EVENTS = {
  "voice.inquiry.received": voiceInquiryReceivedEvent
};
// src/inquiry/inquiry.ts
import { z as z86 } from "zod";
var inquiryCallbackSchema = z86.strictObject({
  state: inquiryCallbackStateSchema,
  skipReason: inquirySkipReasonSchema.nullable(),
  attempts: z86.number().int().min(0).max(MAX_CALLBACK_ATTEMPTS),
  nextAttemptAt: timestampSchema.nullable(),
  lastAttemptAt: timestampSchema.nullable()
}).superRefine((cb, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (cb.state === "skipped" !== (cb.skipReason !== null)) {
    issue("skipReason", "Only a skipped callback has a reason");
  }
  if (cb.state !== "no_answer" && cb.nextAttemptAt !== null) {
    issue("nextAttemptAt", "Only a callback waiting for a retry has a next attempt");
  }
  if (cb.state === "not_applicable" && cb.attempts !== 0) {
    issue("attempts", "A callback that does not apply was never dialled");
  }
});
var inquiryConsentSchema = z86.strictObject({
  wordingId: consentWordingIdSchema,
  wordingVersion: z86.number().int().min(1),
  sourceUrl: sourceUrlSchema,
  phoneGranted: z86.boolean()
});
var inquirySchema = z86.strictObject({
  id: inquiryIdSchema,
  source: inquirySourceSchema,
  prospectId: prospectIdSchema,
  assignedToMembershipId: membershipIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  callId: callIdSchema.nullable(),
  consent: inquiryConsentSchema.nullable(),
  callback: inquiryCallbackSchema,
  qualification: qualificationSchema,
  receivedAt: timestampSchema
}).superRefine((inq, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (inq.source === "form" && inq.consent === null) {
    issue("consent", "A form Inquiry carries its consent evidence");
  }
  if (inq.source === "chat" && inq.chatId === null) {
    issue("chatId", "A Chat Inquiry names its Chat");
  }
  if (inq.source !== "chat" && inq.chatId !== null) {
    issue("chatId", "Only a Chat Inquiry names a Chat");
  }
  if (inq.source === "call" && inq.callId === null) {
    issue("callId", "A Call Inquiry names its Call");
  }
  if (inq.source !== "form" && inq.callback.state !== "not_applicable" && inq.consent === null) {
    issue("callback", "A callback needs the consent evidence it was based on");
  }
  const dialled = !["not_applicable", "skipped"].includes(inq.callback.state);
  if (dialled && inq.consent?.phoneGranted !== true) {
    issue("callback", "A callback is placed only with phone consent (ADR 0003)");
  }
  if (inq.source === "call" && inq.callback.state !== "not_applicable") {
    issue("callback", "A Call Inquiry is not called back");
  }
});
var inquiryParamsSchema = z86.strictObject({ inquiryId: inquiryIdSchema });
var inquiryCursorSchema = z86.strictObject({
  receivedAt: timestampSchema,
  id: inquiryIdSchema
});
var listInquiriesQuerySchema = pageQuerySchema.extend({
  source: inquirySourceSchema.optional(),
  callbackState: z86.enum(INQUIRY_CALLBACK_STATES).optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from), { message: "The range ends after it starts", path: ["to"] });
var inquiryPageSchema = pageSchema(inquirySchema);
var inquiryKeyedHeadersSchema = z86.object({ "idempotency-key": idempotencyKeySchema });
var inquiryEmbedSchema = z86.strictObject({
  publishableKey: inquiryKeySchema,
  allowedOrigins: z86.array(allowedOriginSchema).max(MAX_ALLOWED_ORIGINS),
  consentWordingId: consentWordingIdSchema.nullable(),
  updatedAt: timestampSchema.nullable()
});
var setInquiryEmbedRequestSchema = z86.strictObject({
  allowedOrigins: z86.array(allowedOriginSchema).max(MAX_ALLOWED_ORIGINS).refine((o) => new Set(o).size === o.length, "No repeats"),
  consentWordingId: consentWordingIdSchema
});
var publicInquiryParamsSchema = z86.strictObject({ key: inquiryKeySchema });
var publicOriginHeadersSchema = z86.object({ origin: allowedOriginSchema });
var publicInquiryHeadersSchema = z86.object({
  origin: allowedOriginSchema,
  "idempotency-key": idempotencyKeySchema
});
var publicNameSchema = boundedTextSchema(200);
var publicInquiryFormViewSchema = z86.strictObject({
  organizationName: publicNameSchema,
  wordingId: consentWordingIdSchema,
  wordingVersion: z86.number().int().min(1),
  wordingText: boundedTextSchema(5000),
  aiNotice: boundedTextSchema(500)
});
var publicInquiryRequestSchema = z86.strictObject({
  name: personNameSchema,
  phone: rawPhoneSchema,
  email: emailSchema.optional(),
  message: inquiryMessageSchema.optional(),
  consentWordingId: consentWordingIdSchema,
  consentWordingVersion: z86.number().int().min(1),
  callbackConsent: z86.boolean(),
  sourceUrl: sourceUrlSchema,
  website: z86.string().max(MAX_HONEYPOT_LENGTH).default("")
});
var publicInquiryReceiptSchema = z86.strictObject({
  received: z86.literal(true),
  receivedAt: timestampSchema
});
// src/inquiry/routes.ts
var INQUIRY_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var INQUIRY_ADMIN_ROLES = ["owner", "admin"];
var INQUIRY_MANAGER_ROLES = [
  "owner",
  "admin",
  "manager"
];
var VISIBILITY6 = "An Owner or Admin sees every Inquiry; a Manager sees those assigned to Reps of their Team; a Rep sees only those assigned to them. An Inquiry outside the caller's view is inquiry.not_found (404), never 403.";
var INQUIRY_ROUTES = Object.freeze({
  publicGetInquiryForm: inboundRoute({
    method: "GET",
    path: "/v1/public/inquiry/{key}/form",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["inquiry.origin_not_allowed", "inquiry.key_invalid"],
    commonErrors: [...PUBLIC_ERRORS],
    description: "Public: no token, no Organization; the Organization's publishable key in the path stands in for both. Returns what the embedded Inquiry form displays: the Organization's name, the exact Consent Wording to show beside the callback box with its id and version (the form sends them back), and the notice that an AI will make the call. Nothing about any Prospect, Rep or internal id. The Origin header must be one of the Organization's allowed origins (inquiry.origin_not_allowed, 403); an unknown, rotated or not-yet-live key is inquiry.key_invalid (404). Rate-limited by client address and by key (rate.limited, 429, with a Retry-After header). The key is a secret-like identifier: services redact it from logs, traces and error reports."
  }),
  publicSubmitInquiry: inboundRoute({
    method: "POST",
    path: "/v1/public/inquiry/{key}/inquiries",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inquiry.origin_not_allowed",
      "inquiry.key_invalid",
      "inquiry.consent_wording_missing"
    ],
    commonErrors: [
      ...PUBLIC_ERRORS,
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: "Public: no token, no Organization; the Organization's publishable key in the path stands in for both. A Prospect sends an Inquiry from the embedded form with their name, phone number, optional work email and message, the Consent Wording id and version the form displayed, whether they agreed to the callback, and the page address the form was on. The wording version and the page address are required: without them the body is request.invalid, and a version that is not the one the form displays is inquiry.consent_wording_missing (422), with nothing stored. The Origin header must be an allowed origin (inquiry.origin_not_allowed, 403). Requires an Idempotency-Key header (16 to 128 characters; the client generates one per submission): a replay answers the original receipt with 200 and stores one Inquiry and places one callback, the same key with another body is request.idempotency_key_reused, and the same key while the first request runs is request.idempotency_in_progress. Answers 201 with a receipt that says only that it arrived and whether a call is coming: no Inquiry, Prospect or Rep id. Core upserts the Prospect and records the Contact Consent for the phone channel from the wording version, the page address and the time; with the box unticked the Inquiry is stored and no call is placed. A filled honeypot (website) is answered exactly as a real request and stores nothing. Rate-limited by client address and by key (rate.limited, 429, with a Retry-After header). Publishes voice.inquiry.received. The key in the path is a secret-like identifier: services redact it from logs, traces and error reports."
  }),
  getInquiryEmbed: inboundRoute({
    method: "GET",
    path: "/v1/inquiry-embed",
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's Inquiry form and Chat settings: the publishable key, the allowed origins and the Consent Wording the form displays. Owner and Admin only; any other role is auth.forbidden. The key is not a credential for anything but these public routes, and services redact it from logs."
  }),
  setInquiryEmbed: inboundRoute({
    method: "PUT",
    path: "/v1/inquiry-embed",
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["inquiry.embed_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the allowed origins (at most 20 exact web origins: https, or http on localhost; no path and no wildcard) and the Consent Wording the form displays; a repeat with the same body changes nothing, so a retry is safe. A wording that does not exist or does not cover the phone channel is inquiry.embed_invalid (422). Owner and Admin only."
  }),
  rotateInquiryEmbedKey: inboundRoute({
    method: "POST",
    path: "/v1/inquiry-embed/rotate-key",
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Issues a new publishable key; the old one stops working at once (inquiry.key_invalid on the public routes), so every embed must be updated. Requires an Idempotency-Key header: a replay answers the same new key and rotates once. Owner and Admin only."
  }),
  listInquiries: inboundRoute({
    method: "GET",
    path: "/v1/inquiries",
    roles: INQUIRY_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Inquiries, latest first, one cursor-paginated page at a time (at most 100), optionally narrowed by source (form, chat or call), callback state, Prospect and a time range. A filter never widens what the caller may see. Each Inquiry shows its callback state and, when no callback happened, the reason. ${VISIBILITY6}`
  }),
  getInquiry: inboundRoute({
    method: "GET",
    path: "/v1/inquiries/{inquiryId}",
    roles: INQUIRY_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inquiry.not_found"],
    commonErrors: [],
    description: `Reads one Inquiry with its Qualification answers, callback state, and the Contact Consent evidence it was based on. ${VISIBILITY6}`
  }),
  retryInquiryCallback: inboundRoute({
    method: "POST",
    path: "/v1/inquiries/{inquiryId}/callback",
    roles: INQUIRY_MANAGER_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inquiry.not_found",
      "inquiry.retries_exhausted",
      "agent.paused",
      "agent.consent_required",
      "agent.outside_hours"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Asks the Inbound Agent to place a callback again for an Inquiry whose callback was skipped or did not connect. It is queued, not dialled in the request, and every gate is checked again at dial time: a paused Agent is agent.paused (409), no Contact Consent for the phone channel (or one revoked) is agent.consent_required (409), and a time outside the calling hours is agent.outside_hours (409). Nothing can override those checks (ADR 0003). A callback that already has the maximum number of attempts (including after retries_exhausted) is inquiry.retries_exhausted (409) and nothing is queued, so a retry never pushes attempts past the maximum. Requires an Idempotency-Key header: a replay answers 202 without queueing a second callback. Owner, Admin, and a Manager for Inquiries assigned to Reps of their Team."
  })
});
// src/linkedin/errors.ts
var LINKEDIN_ERRORS = defineErrors("linkedin", {
  channel_disabled: {
    status: 409,
    message: "The LinkedIn channel is switched off for this Organization."
  },
  risk_not_accepted: {
    status: 409,
    message: "An Admin has not accepted the current LinkedIn risk statement."
  },
  account_not_connected: {
    status: 409,
    message: "The LinkedIn account is not connected."
  },
  limit_reached: {
    status: 429,
    message: "The LinkedIn account has reached its limit for now."
  },
  not_account_owner: {
    status: 403,
    message: "Only the Rep who owns this LinkedIn account can do that."
  },
  limit_above_ceiling: {
    status: 422,
    message: "A LinkedIn limit is above the maximum Closeline allows."
  }
});
// src/linkedin/events.ts
import { z as z88 } from "zod";

// src/linkedin/values.ts
import { z as z87 } from "zod";
var LINKEDIN_DAILY_CONNECTION_CEILING = 20;
var LINKEDIN_DAILY_MESSAGE_CEILING = 40;
var LINKEDIN_WEEKLY_CONNECTION_CEILING = 80;
var LINKEDIN_LIMIT_ISSUE_MESSAGE = "linkedin.limit_above_ceiling";
var LINKEDIN_ACCOUNT_STATUSES = [
  "connected",
  "needs_login",
  "paused",
  "restricted",
  "disconnected"
];
var linkedinAccountStatusSchema = z87.enum(LINKEDIN_ACCOUNT_STATUSES);
var LINKEDIN_PAUSE_REASONS = [
  "restricted",
  "checkpoint",
  "provider_unavailable",
  "admin",
  "rate_limited"
];
var linkedinPauseReasonSchema = z87.enum(LINKEDIN_PAUSE_REASONS);
var LINKEDIN_RISK_WORDING_VERSION = "2026-10-1";
var LINKEDIN_RISK_WORDING = [
  "Automated activity on LinkedIn breaks LinkedIn's terms of use.",
  "LinkedIn can restrict or close an account that sends connection requests or messages this way.",
  "The penalty lands on the Rep who owns the account, not on Closeline.",
  "Closeline enforces low daily and weekly limits and spreads sends through working hours, but this lowers the risk and does not remove it.",
  "The LinkedIn channel can be switched off at any time, and revoking this acceptance stops every LinkedIn send at once.",
  "This acceptance is tied to this wording version. If the wording changes, it must be accepted again."
].join(`
`);
var MAX_LINKEDIN_TYPED_NAME_LENGTH = 200;
var limitField = (ceiling) => z87.number().int().min(0).superRefine((value, ctx) => {
  if (value > ceiling) {
    ctx.addIssue({ code: "custom", message: LINKEDIN_LIMIT_ISSUE_MESSAGE });
  }
});
var linkedinLimitsSchema = z87.strictObject({
  dailyConnections: limitField(LINKEDIN_DAILY_CONNECTION_CEILING),
  dailyMessages: limitField(LINKEDIN_DAILY_MESSAGE_CEILING),
  weeklyConnections: limitField(LINKEDIN_WEEKLY_CONNECTION_CEILING)
});
var linkedinAccountSchema = z87.strictObject({
  id: linkedinAccountIdSchema,
  membershipId: membershipIdSchema,
  status: linkedinAccountStatusSchema,
  pauseReason: linkedinPauseReasonSchema.nullable(),
  limits: linkedinLimitsSchema,
  connectedAt: timestampSchema,
  updatedAt: timestampSchema
});
var startLinkedinConnectionRequestSchema = z87.strictObject({});
var startLinkedinConnectionResponseSchema = z87.strictObject({
  hostedLoginUrl: z87.url({ protocol: /^https$/ }).max(2048),
  expiresAt: timestampSchema
});
var linkedinRiskStatementSchema = z87.strictObject({
  version: z87.string().min(1).max(40),
  text: z87.string().min(1).max(4000)
});
var linkedinTypedNameSchema = z87.string().trim().min(2).max(MAX_LINKEDIN_TYPED_NAME_LENGTH).refine((value) => !/\p{Cc}/u.test(value), "No control characters");
var acceptLinkedinRiskRequestSchema = z87.strictObject({
  wordingVersion: z87.literal(LINKEDIN_RISK_WORDING_VERSION),
  typedFullName: linkedinTypedNameSchema
});
var linkedinRiskAcceptanceSchema = z87.strictObject({
  id: linkedinRiskAcceptanceIdSchema,
  wordingVersion: z87.string().min(1).max(40),
  acceptedByMembershipId: membershipIdSchema,
  typedFullName: z87.string().min(2).max(MAX_LINKEDIN_TYPED_NAME_LENGTH),
  acceptedAt: timestampSchema,
  revokedAt: timestampSchema.nullable()
});
var linkedinSettingsSchema = z87.strictObject({
  enabled: z87.boolean(),
  currentWordingVersion: z87.string().min(1).max(40),
  acceptedAt: timestampSchema.nullable(),
  effectivelyEnabled: z87.boolean()
});
var updateLinkedinSettingsRequestSchema = z87.strictObject({ enabled: z87.boolean() });
var updateLinkedinAccountLimitsRequestSchema = linkedinLimitsSchema;
var listLinkedinAccountsQuerySchema = pageQuerySchema;
var linkedinAccountPageSchema = pageSchema(linkedinAccountSchema);
var listLinkedinRiskAcceptancesQuerySchema = pageQuerySchema;
var linkedinRiskAcceptancePageSchema = pageSchema(linkedinRiskAcceptanceSchema);
var linkedinUsageSchema = z87.strictObject({
  accountId: linkedinAccountIdSchema,
  day: calendarDateSchema,
  connectionsUsed: z87.number().int().min(0),
  messagesUsed: z87.number().int().min(0),
  weeklyConnectionsUsed: z87.number().int().min(0),
  limits: linkedinLimitsSchema
});
var listLinkedinUsageQuerySchema = pageQuerySchema.extend({
  day: calendarDateSchema.optional()
});
var linkedinUsagePageSchema = pageSchema(linkedinUsageSchema);
var LINKEDIN_SEND_GUARD_ORDER = [
  "channel_enabled",
  "account_connected",
  "contact_consent",
  "suppression",
  "quota"
];

// src/linkedin/events.ts
var linkedinInvitationAcceptedEvent = defineEvent("linkedin.invitation_accepted", 1, z88.strictObject({
  accountId: linkedinAccountIdSchema,
  membershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  acceptedAt: timestampSchema
}));
var linkedinAccountPausedEvent = defineEvent("linkedin.account_paused", 1, z88.strictObject({
  accountId: linkedinAccountIdSchema,
  membershipId: membershipIdSchema,
  status: linkedinAccountStatusSchema,
  reason: linkedinPauseReasonSchema
}));
var LINKEDIN_CHANNEL_DISABLED_REASONS = [
  "admin_switch",
  "acceptance_revoked",
  "wording_changed"
];
var linkedinChannelDisabledEvent = defineEvent("linkedin.channel_disabled", 1, z88.strictObject({
  reason: z88.enum(LINKEDIN_CHANNEL_DISABLED_REASONS),
  byMembershipId: membershipIdSchema.nullable()
}));
var LINKEDIN_EVENTS = {
  "linkedin.invitation_accepted": linkedinInvitationAcceptedEvent,
  "linkedin.account_paused": linkedinAccountPausedEvent,
  "linkedin.channel_disabled": linkedinChannelDisabledEvent
};
// src/linkedin/routes.ts
var LINKEDIN_CONNECT_ROLES = ["rep"];
var LINKEDIN_READ_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var LINKEDIN_ADMIN_ROLES = ["owner", "admin"];
var SCOPE2 = "Rows are scoped by role: a Rep sees only their own account, a Manager the accounts of Reps on their own Team, an Admin and an Owner all of the Organization's. A second Organization sees nothing of the first. A row outside the caller's view is request.not_found (404), never 403.";
var LIMITS = "Limits are whole numbers from 0 up to the system ceilings (20 connection requests and 40 messages a day, 80 connection requests a week); a limit above its ceiling is linkedin.limit_above_ceiling (422). An Organization can only lower them.";
var LINKEDIN_ROUTES = Object.freeze({
  startConnection: inboundRoute({
    method: "POST",
    path: "/v1/linkedin/accounts/connection",
    roles: LINKEDIN_CONNECT_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["linkedin.channel_disabled", "linkedin.risk_not_accepted"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Starts connecting the calling Rep's own LinkedIn account and returns the provider's hosted login URL and when it expires; the Rep signs in there and Closeline never sees the password. Rep only: an Owner, Admin or Manager is auth.forbidden, because every account belongs to its person. One account per Rep; a retry with the same Idempotency-Key returns the same login. Needs the channel switched on (linkedin.channel_disabled, 409) and a risk acceptance of the current wording (linkedin.risk_not_accepted, 409)."
  }),
  listAccounts: inboundRoute({
    method: "GET",
    path: "/v1/linkedin/accounts",
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists LinkedIn accounts with their status, pause reason and limits, one cursor-paginated page at a time (limit, cursor; at most 100). The provider's account reference is never returned. ${SCOPE2}`
  }),
  getAccount: inboundRoute({
    method: "GET",
    path: "/v1/linkedin/accounts/{accountId}",
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid", "request.not_found"],
    description: `Reads one LinkedIn account with its status, pause reason and limits. ${SCOPE2}`
  }),
  disconnectAccount: inboundRoute({
    method: "DELETE",
    path: "/v1/linkedin/accounts/{accountId}",
    roles: LINKEDIN_READ_ROLES,
    success: [204],
    idempotent: true,
    errors: ["linkedin.not_account_owner"],
    commonErrors: ["request.invalid", "request.not_found"],
    description: "Disconnects a LinkedIn account so nothing sends in its name. The owning Rep may disconnect their own at any time; an Owner or Admin may remove a leaver's account. Any other Rep is linkedin.not_account_owner (403) for an account they can see; a Manager may not disconnect. An account of another Organization is request.not_found (404), never 403. Disconnecting a disconnected account is a no-op."
  }),
  updateAccountLimits: inboundRoute({
    method: "PATCH",
    path: "/v1/linkedin/accounts/{accountId}/limits",
    roles: LINKEDIN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["linkedin.limit_above_ceiling"],
    commonErrors: [...IDEMPOTENT_ERRORS, "request.not_found"],
    description: `Lowers the limits of one account. Owner and Admin only. ${LIMITS} An account of another Organization is request.not_found (404), never 403.`
  }),
  getRiskStatement: inboundRoute({
    method: "GET",
    path: "/v1/linkedin/risk-statement",
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the current LinkedIn risk statement and its wording version. Every role reads it, so a Rep sees the risk before connecting and an Admin before accepting. The text is the same for every Organization."
  }),
  acceptRisk: inboundRoute({
    method: "POST",
    path: "/v1/linkedin/risk-acceptance",
    roles: LINKEDIN_ADMIN_ROLES,
    success: [201],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Records the Organization's written acceptance of the LinkedIn risk: the wording version (it must be the current one, else request.invalid) and the Admin's typed full name. Owner and Admin only. The acceptance is tied to that version; a changed wording needs a new one. Accepting again while an acceptance of the current version is active returns it unchanged."
  }),
  revokeRiskAcceptance: inboundRoute({
    method: "DELETE",
    path: "/v1/linkedin/risk-acceptance",
    roles: LINKEDIN_ADMIN_ROLES,
    success: [204],
    idempotent: true,
    errors: [],
    commonErrors: [],
    description: "Revokes the active risk acceptance. Every LinkedIn send stops at once, with linkedin.risk_not_accepted for anything still queued; email and other channels keep running. Owner and Admin only. Revoking with no active acceptance is a no-op."
  }),
  listRiskAcceptances: inboundRoute({
    method: "GET",
    path: "/v1/linkedin/risk-acceptances",
    roles: LINKEDIN_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's risk acceptances, newest first, with who accepted, the typed name, the wording version and any revocation. One cursor-paginated page at a time (limit, cursor; at most 100). Owner and Admin only; a second Organization sees nothing of the first."
  }),
  getSettings: inboundRoute({
    method: "GET",
    path: "/v1/linkedin/settings",
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the channel settings: the Admin switch, the current wording version, the active risk acceptance and effectivelyEnabled, which is true only with the switch on and a non-revoked acceptance of the current wording. Every role reads it, so the sequence builder shows LinkedIn steps only while the channel is enabled. Scoped to the Organization in the token."
  }),
  updateSettings: inboundRoute({
    method: "PATCH",
    path: "/v1/linkedin/settings",
    roles: LINKEDIN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["linkedin.risk_not_accepted"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Turns the LinkedIn channel on or off with the one Admin switch (enabled). Owner and Admin only. Switching off stops all LinkedIn sends and leaves other channels running. Switching on without an active risk acceptance of the current wording is linkedin.risk_not_accepted (409). There is no setting for consent, suppression or the limit guards."
  }),
  listUsage: inboundRoute({
    method: "GET",
    path: "/v1/linkedin/usage",
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists each account's use on one day (default today) against its limits: connection requests and messages sent and the week's connection requests. One cursor-paginated page at a time (limit, cursor; at most 100). ${SCOPE2}`
  })
});
// src/mail/domain-check.ts
import { z as z89 } from "zod";
var DOMAIN_CHECK_RECORDS = ["spf", "dkim", "dmarc"];
var domainCheckRecordSchema = z89.enum(DOMAIN_CHECK_RECORDS);
var DOMAIN_CHECK_STATUSES = ["pass", "weak", "fail", "missing", "unknown"];
var domainCheckStatusSchema = z89.enum(DOMAIN_CHECK_STATUSES);
var MAX_DOMAIN_CHECK_TEXT_LENGTH = 1000;
var domainCheckResultSchema = z89.object({
  record: domainCheckRecordSchema,
  status: domainCheckStatusSchema,
  explanation: z89.string().min(1).max(MAX_DOMAIN_CHECK_TEXT_LENGTH),
  suggestedRecord: z89.string().min(1).max(MAX_DOMAIN_CHECK_TEXT_LENGTH).nullable()
});
var domainCheckSchema = z89.object({
  mailboxId: mailboxIdSchema,
  domain: z89.string().min(1).max(253),
  results: z89.array(domainCheckResultSchema).max(DOMAIN_CHECK_RECORDS.length),
  checkedAt: timestampSchema.nullable()
}).superRefine((d, ctx) => {
  if (d.checkedAt === null !== (d.results.length === 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["results"],
      message: "Exactly a checked domain has results"
    });
  }
  if (new Set(d.results.map((r) => r.record)).size !== d.results.length) {
    ctx.addIssue({ code: "custom", path: ["results"], message: "A record is reported once" });
  }
});
// src/mail/errors.ts
var MAIL_ERRORS = {
  ...defineErrors("mailbox", {
    not_found: { status: 404, message: "The Mailbox was not found." },
    not_connected: { status: 409, message: "The Mailbox is not connected." },
    limit_reached: {
      status: 429,
      message: "The Mailbox has reached a sending limit. Try again later."
    },
    paused: { status: 409, message: "The Mailbox is paused." },
    auth_revoked: {
      status: 409,
      message: "The email provider no longer allows access. Reconnect the Mailbox."
    },
    already_connected: { status: 409, message: "This address is already a connected Mailbox." },
    limit_above_ceiling: {
      status: 422,
      message: "A limit is outside what the Organization allows."
    },
    oauth_state_invalid: {
      status: 400,
      message: "This connection attempt is not valid or has expired. Start again."
    }
  }),
  ...defineErrors("send", {
    suppressed: { status: 409, message: "This address must not be contacted." },
    no_consent: { status: 409, message: "There is no consent to contact this Prospect by email." },
    unverified_address: { status: 422, message: "The address has not been verified." },
    outside_window: {
      status: 409,
      message: "The send window is closed. The send waits for it to open."
    },
    duplicate: { status: 409, message: "This message was already sent or is being sent." },
    campaign_not_running: { status: 409, message: "The Campaign is not running." },
    organization_cap_reached: {
      status: 429,
      message: "The Organization has reached its daily sending cap. Try again tomorrow."
    },
    not_found: { status: 404, message: "The send record was not found." }
  }),
  ...defineErrors("unsubscribe", {
    invalid_token: { status: 400, message: "This link is not valid or has expired." }
  })
};
// src/mail/events.ts
import { z as z91 } from "zod";

// src/mail/mail-event.ts
import { z as z90 } from "zod";
var MAIL_EVENT_KINDS = [
  "hard_bounce",
  "soft_bounce",
  "complaint",
  "reply",
  "out_of_office",
  "unsubscribe"
];
var mailEventKindSchema = z90.enum(MAIL_EVENT_KINDS);
var mailProviderMessageIdSchema = z90.string().regex(/^[\x21-\x7e]{1,255}$/);
var mailEventSchema = z90.object({
  id: mailEventIdSchema,
  mailboxId: mailboxIdSchema,
  kind: mailEventKindSchema,
  sendId: sendIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  enrollmentId: enrollmentIdSchema.nullable(),
  providerMessageId: mailProviderMessageIdSchema,
  returnDate: z90.iso.date().nullable(),
  occurredAt: timestampSchema,
  recordedAt: timestampSchema
}).superRefine((e, ctx) => {
  if (e.kind !== "out_of_office" && e.returnDate !== null) {
    ctx.addIssue({
      code: "custom",
      path: ["returnDate"],
      message: "Only an out-of-office has a return date"
    });
  }
});
var mailEventCursorSchema = z90.strictObject({
  occurredAt: timestampSchema,
  id: mailEventIdSchema
});
var listMailEventsQuerySchema = pageQuerySchema.extend({
  mailboxId: mailboxIdSchema.optional(),
  kind: mailEventKindSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict();
var mailEventPageSchema = pageSchema(mailEventSchema);

// src/mail/events.ts
var mailboxStateChangedEvent = defineEvent("mailbox.state_changed", 1, z91.strictObject({
  mailboxId: mailboxIdSchema,
  ownerMembershipId: membershipIdSchema.nullable(),
  from: mailboxStateSchema,
  to: mailboxStateSchema,
  reason: mailboxStateReasonSchema.nullable(),
  changedAt: timestampSchema
}));
var mailEventShape = {
  mailboxId: mailboxIdSchema,
  prospectId: prospectIdSchema,
  sendId: sendIdSchema.nullable(),
  campaignId: campaignIdSchema.nullable(),
  enrollmentId: enrollmentIdSchema.nullable(),
  providerMessageId: mailProviderMessageIdSchema
};
var mailBouncedEvent = defineEvent("mail.bounced", 1, z91.strictObject({
  ...mailEventShape,
  kind: z91.enum(["hard", "soft"]),
  bouncedAt: timestampSchema
}));
var mailComplainedEvent = defineEvent("mail.complained", 1, z91.strictObject({ ...mailEventShape, complainedAt: timestampSchema }));
var mailRepliedEvent = defineEvent("mail.replied", 1, z91.strictObject({ ...mailEventShape, repliedAt: timestampSchema }));
var mailOutOfOfficeEvent = defineEvent("mail.out_of_office", 1, z91.strictObject({
  ...mailEventShape,
  returnDate: z91.iso.date().nullable(),
  receivedAt: timestampSchema
}));
var mailUnsubscribedEvent = defineEvent("mail.unsubscribed", 1, z91.strictObject({
  prospectId: prospectIdSchema,
  mailboxId: mailboxIdSchema.nullable(),
  sendId: sendIdSchema.nullable(),
  enrollmentId: enrollmentIdSchema.nullable(),
  source: z91.enum(["link", "one_click"]),
  unsubscribedAt: timestampSchema
}));
var MAIL_EVENTS = {
  "mailbox.state_changed": mailboxStateChangedEvent,
  "mail.bounced": mailBouncedEvent,
  "mail.complained": mailComplainedEvent,
  "mail.replied": mailRepliedEvent,
  "mail.out_of_office": mailOutOfOfficeEvent,
  "mail.unsubscribed": mailUnsubscribedEvent
};
// src/mail/health.ts
import { z as z92 } from "zod";
var HEALTH_WINDOW_DAYS = 14;
var HEALTH_MINIMUM_SAMPLE = 30;
var HEALTH_WARNING_SCORE = 70;
var HEALTH_CRITICAL_SCORE = 40;
var HEALTH_COMPONENTS = [
  "hard_bounce_rate",
  "complaint_rate",
  "soft_bounce_error_rate",
  "reply_rate",
  "provider_warnings"
];
var healthComponentKindSchema = z92.enum(HEALTH_COMPONENTS);
var healthComponentStateSchema = z92.enum(["ok", "warning", "critical"]);
var healthComponentSchema = z92.object({
  component: healthComponentKindSchema,
  value: z92.number().min(0).max(1e6),
  weight: z92.number().int().min(0).max(100),
  warningThreshold: z92.number().min(0).max(1e6),
  criticalThreshold: z92.number().min(0).max(1e6),
  state: healthComponentStateSchema
});
var mailboxHealthSchema = z92.object({
  mailboxId: mailboxIdSchema,
  status: z92.enum(["scored", "not_enough_data"]),
  score: z92.number().int().min(0).max(100).nullable(),
  effect: z92.enum(["none", "limit_halved", "paused"]),
  windowDays: z92.number().int().min(1).max(90),
  sampleSize: z92.number().int().min(0).max(1e7),
  minimumSample: z92.number().int().min(1).max(1e4),
  components: z92.array(healthComponentSchema).max(10),
  scoredAt: timestampSchema
}).superRefine((h, ctx) => {
  if (h.status === "scored" !== (h.score !== null)) {
    ctx.addIssue({
      code: "custom",
      path: ["score"],
      message: "Exactly a scored Mailbox has a score"
    });
  }
  if (h.status === "not_enough_data" && h.effect !== "none") {
    ctx.addIssue({ code: "custom", path: ["effect"], message: "No score means no effect" });
  }
});
var healthSummarySchema = z92.object({
  status: z92.enum(["scored", "not_enough_data"]),
  score: z92.number().int().min(0).max(100).nullable(),
  effect: z92.enum(["none", "limit_halved", "paused"]),
  scoredAt: timestampSchema
});
var healthDailySchema = z92.object({
  date: z92.iso.date(),
  score: z92.number().int().min(0).max(100).nullable(),
  sent: z92.number().int().min(0).max(1e7),
  hardBounces: z92.number().int().min(0).max(1e7),
  softBounces: z92.number().int().min(0).max(1e7),
  complaints: z92.number().int().min(0).max(1e7),
  replies: z92.number().int().min(0).max(1e7),
  errors: z92.number().int().min(0).max(1e7),
  components: z92.array(healthComponentSchema).max(10)
});
var listHealthHistoryQuerySchema = pageQuerySchema.strict();
var healthDailyPageSchema = pageSchema(healthDailySchema);
var healthHistoryCursorSchema = z92.strictObject({ date: z92.iso.date() });
// src/mail/mailbox.ts
import { z as z93 } from "zod";
var MAX_MAILBOX_NAME_LENGTH = 100;
var mailboxSchema = z93.object({
  id: mailboxIdSchema,
  provider: mailboxProviderSchema,
  kind: mailboxKindSchema,
  address: emailSchema,
  displayName: boundedTextSchema(MAX_MAILBOX_NAME_LENGTH),
  ownerMembershipId: membershipIdSchema.nullable(),
  teamIds: z93.array(teamIdSchema).max(MAX_MAILBOX_TEAMS),
  state: mailboxStateSchema,
  stateReason: mailboxStateReasonSchema.nullable(),
  limits: mailboxLimitsSchema,
  effectiveLimits: effectiveLimitsSchema,
  ramp: rampSchema,
  health: healthSummarySchema,
  connectedAt: timestampSchema,
  lastSyncedAt: timestampSchema.nullable()
}).superRefine((m, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (m.kind === "personal" !== (m.ownerMembershipId !== null)) {
    issue("ownerMembershipId", "Exactly a personal Mailbox names its owner");
  }
  if (m.kind === "personal" && m.teamIds.length > 0) {
    issue("teamIds", "Only a shared Mailbox is opened to Teams");
  }
  if (m.state === "limited" && m.stateReason === null) {
    issue("stateReason", "A limited Mailbox says why");
  }
  if ((m.state === "paused" || m.state === "disconnected") !== (m.stateReason !== null) && m.state !== "limited") {
    issue("stateReason", "A paused, limited or disconnected Mailbox says why, and no other does");
  }
});
var mailboxParamsSchema = z93.strictObject({ mailboxId: mailboxIdSchema });
var mailKeyedHeadersSchema = z93.object({ "idempotency-key": idempotencyKeySchema });
var mailboxCursorSchema = z93.strictObject({
  connectedAt: timestampSchema,
  id: mailboxIdSchema
});
var listMailboxesQuerySchema = pageQuerySchema.extend({
  state: mailboxStateSchema.optional(),
  provider: mailboxProviderSchema.optional(),
  kind: mailboxKindSchema.optional(),
  ownerMembershipId: membershipIdSchema.optional()
}).strict();
var mailboxPageSchema = pageSchema(mailboxSchema);
var startMailboxConnectRequestSchema = z93.strictObject({
  provider: mailboxProviderSchema,
  kind: mailboxKindSchema.default("personal"),
  teamIds: z93.array(teamIdSchema).max(MAX_MAILBOX_TEAMS).default([])
}).refine((b) => b.kind === "shared" || b.teamIds.length === 0, {
  path: ["teamIds"],
  message: "Only a shared Mailbox is opened to Teams"
});
var mailboxConnectStartSchema = z93.object({
  authorizationUrl: z93.url({ protocol: /^https?$/ }).max(2048),
  expiresAt: timestampSchema
});
var completeMailboxConnectRequestSchema = z93.strictObject({
  state: z93.string().regex(/^[A-Za-z0-9_-]{16,256}$/),
  code: z93.string().regex(/^[\x21-\x7e]{1,2048}$/)
});
var setMailboxLimitsRequestSchema = mailboxLimitsSchema;
var organizationMailLimitsSchema = z93.strictObject({
  perDayCeiling: z93.number().int().min(1).max(MAX_SENDS_PER_DAY),
  perHourCeiling: z93.number().int().min(1).max(MAX_SENDS_PER_HOUR),
  minGapFloorSeconds: z93.number().int().min(0).max(MAX_MIN_GAP_SECONDS),
  organizationDailyCap: z93.number().int().min(1).max(1e5)
});
var mailboxCapacitySchema = z93.object({
  mailboxId: mailboxIdSchema,
  state: mailboxStateSchema,
  usable: z93.boolean(),
  remainingToday: z93.number().int().min(0).max(MAX_SENDS_PER_DAY),
  remainingThisHour: z93.number().int().min(0).max(MAX_SENDS_PER_HOUR),
  nextSendAt: timestampSchema.nullable()
});
var mailCapacitySchema = z93.object({
  ...pageSchema(mailboxCapacitySchema).shape,
  organizationRemainingToday: z93.number().int().min(0).max(1e5),
  organizationDailyCap: z93.number().int().min(1).max(1e5)
});
// src/mail/routes.ts
var MAIL_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var MAIL_ADMIN_ROLES = ["owner", "admin"];
var MAIL_REVIEW_ROLES = ["owner", "admin", "manager"];
var VISIBILITY7 = "An Owner or Admin sees every Mailbox; a Manager sees those of the Reps on their Team and the shared ones opened to it; a Rep sees only their own and the shared ones opened to their Team. A Mailbox or send record outside the caller's view is mailbox.not_found or send.not_found (404), never 403, and one of another Organization the same.";
var SECRETS2 = "No response, event, log line or error report carries a token, refresh token, authorization code, client secret or key of a Mailbox, and no message body or subject.";
var NO_TRACKING2 = "Closeline puts no open or click tracking in any message; nothing here reports opens or clicks.";
var MAIL_ROUTES = Object.freeze({
  listMailboxes: inboundRoute({
    method: "GET",
    path: "/v1/mailboxes",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Mailboxes, oldest connection first, one cursor-paginated page at a time (at most 100), optionally narrowed by state, provider, kind and owner. Each shows its owner, state and reason, the limits set, the limits that apply now after the ramp and its health, the ramp, and a health summary. A filter never widens what the caller may see. ${SECRETS2} ${VISIBILITY7}`
  }),
  getMailbox: inboundRoute({
    method: "GET",
    path: "/v1/mailboxes/{mailboxId}",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["mailbox.not_found"],
    commonErrors: [],
    description: `Reads one Mailbox with its owner, state, limits, ramp and health summary. ${SECRETS2} ${VISIBILITY7}`
  }),
  startMailboxConnect: inboundRoute({
    method: "POST",
    path: "/v1/mailboxes/connect",
    roles: MAIL_ALL_ROLES,
    success: [201],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS, "server.unavailable"],
    description: `Starts connecting a Mailbox through Gmail or Outlook: answers the provider's consent URL and when the attempt expires. Requires an Idempotency-Key header: a replay answers the same URL. Any role may connect a personal Mailbox; a shared one (with the Teams that may use it) is Owner and Admin only, and any other role is auth.forbidden. Scopes are the least needed to send and read replies. ${SECRETS2}`
  }),
  completeMailboxConnect: inboundRoute({
    method: "POST",
    path: "/v1/mailboxes/connect/complete",
    roles: MAIL_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["mailbox.oauth_state_invalid", "mailbox.already_connected"],
    commonErrors: [...IDEMPOTENT_ERRORS, "server.unavailable", "server.timeout"],
    description: `Completes a connection after the provider sent the person back, with the state of the attempt and the authorization code. The code is exchanged for tokens, which are encrypted at rest and never returned; the Mailbox starts in the warming state on the published ramp with default limits at or below the Organization's ceiling. Requires an Idempotency-Key header: a replay answers the same Mailbox with 200. An unknown, expired, used or foreign attempt is mailbox.oauth_state_invalid (400); an address already connected is mailbox.already_connected (409). A provider that does not answer in time is server.unavailable or server.timeout and nothing is stored. ${SECRETS2}`
  }),
  disconnectMailbox: inboundRoute({
    method: "DELETE",
    path: "/v1/mailboxes/{mailboxId}",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["mailbox.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Disconnects a Mailbox: its tokens are deleted at once, the grant is revoked where the provider allows, the state becomes disconnected and mailbox.state_changed is published. History (sends, events, health) stays. Requires an Idempotency-Key header; disconnecting one already disconnected answers 200 and publishes nothing again. The owner may disconnect their own; an Admin or Owner any. A Manager or another Rep who can see it but does not own it is auth.forbidden. ${SECRETS2} ${VISIBILITY7}`
  }),
  setMailboxLimits: inboundRoute({
    method: "PUT",
    path: "/v1/mailboxes/{mailboxId}/limits",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    errors: ["mailbox.not_found", "mailbox.limit_above_ceiling", "mailbox.not_connected"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Replaces the limits of a Mailbox: sends per day and per hour, the least gap between sends and the send window. A repeat with the same body changes nothing, so a retry is safe. A value above the Organization's ceiling, or a gap below its floor, is mailbox.limit_above_ceiling (422); a disconnected Mailbox is mailbox.not_connected (409). The ramp and the health score can only lower what applies, never raise it. The owner may set their own (within the ceiling, which they cannot change); an Admin or Owner any. ${VISIBILITY7}`
  }),
  pauseMailbox: inboundRoute({
    method: "POST",
    path: "/v1/mailboxes/{mailboxId}/pause",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["mailbox.not_found", "mailbox.not_connected"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Pauses a Mailbox: nothing more is sent from it and mailbox.state_changed is published with the reason owner_paused or admin_paused. Requires an Idempotency-Key header; pausing one already paused answers 200 and publishes nothing again. A disconnected Mailbox is mailbox.not_connected (409). The owner or an Admin or Owner may pause it. ${VISIBILITY7}`
  }),
  resumeMailbox: inboundRoute({
    method: "POST",
    path: "/v1/mailboxes/{mailboxId}/resume",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["mailbox.not_found", "mailbox.not_connected", "mailbox.auth_revoked"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Resumes a paused Mailbox into the state its health allows (limited if its score is under the warning level), and publishes mailbox.state_changed. Requires an Idempotency-Key header. A Mailbox paused automatically for a complaint spike or a provider suspension may be resumed only by an Admin or Owner; the owner may resume one they paused. A disconnected Mailbox is mailbox.not_connected (409) and one whose grant was revoked is mailbox.auth_revoked (409): reconnect it instead. ${VISIBILITY7}`
  }),
  getMailboxHealth: inboundRoute({
    method: "GET",
    path: "/v1/mailboxes/{mailboxId}/health",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["mailbox.not_found"],
    commonErrors: [],
    description: `Reads a Mailbox's health: a 0 to 100 score over the last 14 days with every component (hard bounce rate, complaint rate, soft bounce and error rate, reply rate, provider warnings), its measured value, its weight and its warning and critical thresholds, and what the score does now (nothing, the daily limit halved, or paused). Below the minimum sample the status is not_enough_data and the score null, never a number. ${NO_TRACKING2} ${VISIBILITY7}`
  }),
  listMailboxHealthHistory: inboundRoute({
    method: "GET",
    path: "/v1/mailboxes/{mailboxId}/health/history",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["mailbox.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the stored daily health of a Mailbox, newest day first, one cursor-paginated page at a time (at most 100), each day with its score, counts and components, open for the Admin to audit. ${VISIBILITY7}`
  }),
  getMailboxDomainCheck: inboundRoute({
    method: "GET",
    path: "/v1/mailboxes/{mailboxId}/domain-check",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["mailbox.not_found"],
    commonErrors: [],
    description: `Reads the latest check of the domain a Mailbox sends from: SPF, DKIM and DMARC, each with its status (pass, weak, fail, missing or unknown) and a plain explanation of what to fix. Before the first check the results are empty and checkedAt null. ${VISIBILITY7}`
  }),
  checkMailboxDomain: inboundRoute({
    method: "POST",
    path: "/v1/mailboxes/{mailboxId}/domain-check",
    roles: MAIL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["mailbox.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS, "rate.limited", "server.unavailable", "server.timeout"],
    description: `Checks the Mailbox's domain now through DNS and stores the result. Requires an Idempotency-Key header: a replay answers the same result without new lookups. Rate limited (rate.limited, 429, with a Retry-After header). A resolver that does not answer in time marks the record unknown, it does not fail the route. Owner and Admin only. ${VISIBILITY7}`
  }),
  getOrganizationMailLimits: inboundRoute({
    method: "GET",
    path: "/v1/mail/limits",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's mail limits: the per-day and per-hour ceiling no Mailbox may be set above, the floor of the gap between sends, and the daily cap across every Mailbox of the Organization."
  }),
  setOrganizationMailLimits: inboundRoute({
    method: "PUT",
    path: "/v1/mail/limits",
    roles: MAIL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the Organization's mail limits; a repeat with the same body changes nothing. Lowering a ceiling lowers the effective limit of any Mailbox above it at once, and the set limits stay as they were. Owner and Admin only."
  }),
  getMailCapacity: inboundRoute({
    method: "GET",
    path: "/v1/mail/capacity",
    roles: MAIL_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Reads what can still be sent for a launch check, one cursor-paginated page of Mailboxes at a time (at most 100), with the Organization's remaining daily cap on every page: for each Mailbox the caller may see, whether it is usable and what remains today and this hour after the ramp and its health, and what remains of the Organization's daily cap. Owner and Admin see every Mailbox, a Manager those of their Team's Reps; a Rep is auth.forbidden. ${VISIBILITY7}`
  }),
  listSends: inboundRoute({
    method: "GET",
    path: "/v1/mail/sends",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists send records, newest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Campaign, Prospect, Mailbox, state, reason and time range. Each says what each check decided and the reason a send was refused or deferred, so "why was this not sent" has an answer. A record holds no message body, subject or address. ${VISIBILITY7}`
  }),
  getSend: inboundRoute({
    method: "GET",
    path: "/v1/mail/sends/{sendId}",
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["send.not_found"],
    commonErrors: [],
    description: `Reads one send record: the Step and Enrollment, the Mailbox chosen, the result of every check in order, the state and the reason for a refusal or deferral. ${VISIBILITY7}`
  }),
  listMailEvents: inboundRoute({
    method: "GET",
    path: "/v1/mail/events",
    roles: MAIL_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists mail events (hard and soft bounces, complaints, replies, out-of-office notices, unsubscribes), newest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Mailbox, kind, Prospect and time range. An event holds no body, subject or address. Owner and Admin see all; a Manager sees those of Mailboxes of their Team's Reps; a Rep is auth.forbidden. ${NO_TRACKING2}`
  }),
  submitSend: inboundRoute({
    method: "POST",
    path: "/internal/mail/sends",
    roles: [],
    internal: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "send.suppressed",
      "send.no_consent",
      "send.unverified_address",
      "send.outside_window",
      "send.duplicate",
      "send.campaign_not_running",
      "send.organization_cap_reached",
      "mailbox.not_connected",
      "mailbox.paused",
      "mailbox.limit_reached",
      "mailbox.auth_revoked"
    ],
    commonErrors: [
      "request.invalid",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress",
      "auth.unauthenticated",
      "server.unavailable",
      "server.timeout"
    ],
    description: `Internal: the sequence engine asks for one Step to be sent, with the shared secret (ADR 0013); no user token. The Organization is derived from the Enrollment, never taken from the body. The Idempotency-Key header is required and is the send key (Enrollment, Step and attempt epoch, as enr_…:step:epoch); a replay answers 200 with the same record and sends nothing again. Before the transport is called the checks run in this order: the Campaign is running, the send window, the address is verified (or the body accepts an unverified one), core's decision on suppression and consent, the Mailbox is usable, its limits (day, hour, gap), the Organization's daily cap and the key. Every refusal is recorded with its reason and answers its error: send.campaign_not_running, send.outside_window (deferred), send.unverified_address, send.suppressed, send.no_consent, mailbox.not_connected, mailbox.paused, mailbox.auth_revoked, mailbox.limit_reached (deferred, with retryAfter in details), send.organization_cap_reached (deferred) or send.duplicate; the transport saw no call. No setting turns the suppression or consent check off. An Enrollment keeps the Mailbox of its thread; a new one is chosen fairly among the permitted Mailboxes within their limits. Each message carries a one-click unsubscribe header and a visible link. ${NO_TRACKING2} ${SECRETS2}`
  }),
  receiveGmailNotification: inboundRoute({
    method: "POST",
    path: "/v1/public/mail/webhooks/gmail",
    roles: [],
    public: true,
    success: [204],
    idempotent: true,
    errors: [],
    commonErrors: [...PUBLIC_ERRORS, "auth.unauthenticated"],
    description: "Public: Gmail's push notification, with no user token. The request is authenticated by the provider's signed token, which is verified and replay-limited; anything else is auth.unauthenticated (401) and nothing is read. A notification says only that a Mailbox changed: outbound then reads the changes by history cursor, and processing is idempotent on the provider message id, so a replayed notification changes nothing. A missed notification is covered by polling. Message bodies are fetched only for replies and never logged."
  }),
  receiveGraphNotification: inboundRoute({
    method: "POST",
    path: "/v1/public/mail/webhooks/graph",
    roles: [],
    public: true,
    success: [202, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...PUBLIC_ERRORS, "auth.unauthenticated"],
    description: "Public: Microsoft Graph's change notification, with no user token. A subscription validation (the validationToken query parameter) is answered 200 with that token as plain text; a notification is verified against the subscription's client state, replay-limited and answered 202, and anything else is auth.unauthenticated (401). Processing is idempotent on the provider message id, so a replayed notification changes nothing, and polling covers a missed one. Message bodies are fetched only for replies and never logged."
  }),
  getUnsubscribePage: inboundRoute({
    method: "GET",
    path: "/v1/public/mail/unsubscribe/{token}",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["unsubscribe.invalid_token"],
    commonErrors: [...PUBLIC_ERRORS],
    description: "Public: no session, no token header; the signed, expiring token in the path is the only credential. Returns what the unsubscribe page shows: the name of the Organization that sent the message and nothing else. It never shows an address, and it is the same for an address already suppressed. A tampered, expired or unknown token is unsubscribe.invalid_token (400), without saying which. Rate-limited by client address (rate.limited, 429, with a Retry-After header). The token is a credential: services redact it from logs, traces and error reports."
  }),
  confirmUnsubscribe: inboundRoute({
    method: "POST",
    path: "/v1/public/mail/unsubscribe/{token}",
    roles: [],
    public: true,
    success: [200],
    idempotent: true,
    errors: ["unsubscribe.invalid_token"],
    commonErrors: [...PUBLIC_ERRORS],
    description: "Public: unsubscribes the address behind the token, both for the page's button and for the one-click POST a mail client sends from the List-Unsubscribe header (RFC 8058, the form field List-Unsubscribe=One-Click); a mail client sends no Idempotency-Key, so a replay is safe by design and answers the same result. It works without a session: the Organization is resolved from the token. The address is suppressed Organization-wide at once, core is told to suppress it and withdraw email consent, the Sequence stops, and mail.unsubscribed is published. The answer is the same for an address already suppressed and for one that is unknown, so nothing about whether an address exists is revealed. A tampered, expired or unknown token is unsubscribe.invalid_token (400), without saying which. Rate-limited by client address (rate.limited, 429, with a Retry-After header). The token is a credential: services redact it from logs, traces and error reports."
  })
});
// src/mail/unsubscribe.ts
import { z as z94 } from "zod";
var unsubscribeTokenSchema = z94.string().min(22).max(512).regex(/^[A-Za-z0-9_-]+$/);
var unsubscribeParamsSchema = z94.strictObject({ token: unsubscribeTokenSchema });
var unsubscribePageSchema = z94.object({
  organizationName: z94.string().min(1).max(200)
});
var unsubscribeResultSchema = z94.object({
  status: z94.literal("unsubscribed"),
  organizationName: z94.string().min(1).max(200)
});
var oneClickUnsubscribeBodySchema = z94.strictObject({
  "List-Unsubscribe": z94.literal("One-Click")
});
// src/marketing/demo-request.ts
import { z as z95 } from "zod";
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
var demoRequestMessageSchema = z95.string().max(MAX_DEMO_REQUEST_MESSAGE_LENGTH).refine((text) => !hasForbiddenControlCharacter(text), "No control characters").transform((text) => text.trim());
var demoRequestSourcePageSchema = z95.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).regex(/^\/[\x21-\x7e]*$/, "An absolute path");
var createDemoRequestRequestSchema = z95.strictObject({
  name: personNameSchema,
  workEmail: emailSchema,
  companyName: organizationNameSchema,
  message: demoRequestMessageSchema.optional(),
  sourcePage: demoRequestSourcePageSchema,
  website: z95.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).default("")
});
var createDemoRequestResponseSchema = z95.object({
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
// src/messaging/citation.ts
import { z as z96 } from "zod";
var citationSourceSchema = z96.discriminatedUnion("kind", [
  z96.object({
    kind: z96.literal("prospect_field"),
    prospectId: prospectIdSchema,
    field: prospectFieldNameSchema
  }),
  z96.object({ kind: z96.literal("signal"), signalId: signalIdSchema, observedAt: timestampSchema }),
  z96.object({ kind: z96.literal("web_page"), url: citationUrlSchema, retrievedAt: timestampSchema }),
  z96.object({ kind: z96.literal("moment"), callId: callIdSchema, dealRecordId: dealRecordIdSchema }),
  z96.object({
    kind: z96.literal("document"),
    documentId: documentIdSchema,
    page: z96.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable()
  })
]);
var draftCitationSchema = z96.intersection(citationSourceSchema, z96.object({ applies: z96.boolean(), score: z96.number().finite().optional() }));
// src/messaging/draft.ts
import { z as z97 } from "zod";
var DRAFT_CHECKS = [
  "citations_resolve",
  "claims_supported",
  "banned_phrase",
  "length",
  "name_match"
];
var draftCheckNameSchema = z97.enum(DRAFT_CHECKS);
var outreachDraftCheckSchema = z97.strictObject({
  check: draftCheckNameSchema,
  result: z97.enum(["pass", "fail"]),
  count: z97.number().int().min(0).max(1000)
}).refine((check) => check.result === "pass" === (check.count === 0), "Pass means nothing found");
var draftSourceSchema = z97.enum(["generated", "edited"]);
var outreachDraftSchema = z97.strictObject({
  id: draftIdSchema,
  prospectId: prospectIdSchema,
  campaignId: campaignIdSchema.nullable(),
  stepKey: stepKeySchema.nullable(),
  channel: draftChannelSchema,
  goal: goalSchema,
  language: campaignLanguageSchema,
  subject: messagingTextSchema(MAX_DRAFT_SUBJECT_LENGTH),
  body: messagingTextSchema(MAX_DRAFT_BODY_LENGTH, true),
  revision: z97.number().int().min(1).max(1e4),
  source: draftSourceSchema,
  citations: z97.array(draftCitationSchema).max(MAX_DRAFT_CITATIONS),
  ungrounded: z97.boolean(),
  wonDealCount: z97.number().int().min(0).max(100),
  checks: z97.array(outreachDraftCheckSchema).length(DRAFT_CHECKS.length),
  autoSendable: z97.boolean(),
  brandVoiceId: brandVoiceIdSchema,
  voiceVersion: z97.number().int().min(1).max(1e6),
  briefId: briefIdSchema.nullable(),
  model: z97.string().min(1).max(100),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((draft, ctx) => {
  const grounded = draft.citations.some((c) => c.kind === "moment" && c.applies);
  if (draft.ungrounded === grounded) {
    ctx.addIssue({ code: "custom", message: "ungrounded is true exactly when no Moment applies" });
  }
  const names = new Set(draft.checks.map((check) => check.check));
  if (names.size !== DRAFT_CHECKS.length) {
    ctx.addIssue({ code: "custom", message: "Each check appears once" });
  }
  const allPass = draft.checks.every((check) => check.result === "pass");
  if (draft.autoSendable !== (!draft.ungrounded && allPass)) {
    ctx.addIssue({
      code: "custom",
      message: "autoSendable needs grounding and every check passed"
    });
  }
});
var createDraftRequestSchema = z97.strictObject({
  prospectId: prospectIdSchema,
  campaignId: campaignIdSchema.optional(),
  stepKey: stepKeySchema.optional(),
  goal: goalSchema.optional(),
  angle: messagingTextSchema(MAX_ANGLE_LENGTH).optional()
});
var editDraftRequestSchema = z97.strictObject({
  expectedRevision: z97.number().int().min(1).max(1e4),
  subject: messagingTextSchema(MAX_DRAFT_SUBJECT_LENGTH).optional(),
  body: messagingTextSchema(MAX_DRAFT_BODY_LENGTH, true).optional()
}).refine((body) => body.subject !== undefined || body.body !== undefined, "Change something");
var regenerateDraftRequestSchema = z97.strictObject({
  angle: messagingTextSchema(MAX_ANGLE_LENGTH).optional(),
  tone: messagingTextSchema(MAX_TONE_LENGTH).optional()
});
var listDraftsQuerySchema = pageQuerySchema.extend({
  prospectId: prospectIdSchema.optional(),
  campaignId: campaignIdSchema.optional(),
  ungrounded: z97.union([z97.boolean(), z97.enum(["true", "false"]).transform((v) => v === "true")]).optional()
});
var listDraftsResponseSchema = pageSchema(outreachDraftSchema);
// src/messaging/errors.ts
var MESSAGING_ERRORS = {
  ...defineErrors("research", {
    not_found: { status: 404, message: "The Research Brief was not found." },
    timeout: { status: 504, message: "Research on the Prospect took too long. Try again." }
  }),
  ...defineErrors("draft", {
    not_found: { status: 404, message: "The Draft was not found." },
    invalid_state: { status: 409, message: "The Draft is not in a state that allows this." },
    no_prospect_data: {
      status: 422,
      message: "There is too little about this Prospect to write a message from."
    },
    model_unavailable: { status: 503, message: "The writing model is not available. Try again." },
    budget_exceeded: { status: 429, message: "The drafting budget for this period is spent." }
  }),
  ...defineErrors("voice", {
    not_found: { status: 404, message: "There is no Brand Voice yet." },
    version_conflict: {
      status: 409,
      message: "The Brand Voice changed since it was read. Reload it and try again."
    },
    invalid: { status: 422, message: "The Brand Voice is not valid." }
  }),
  ...defineErrors("preview", {
    too_many_prospects: { status: 422, message: "A preview covers at most five Prospects." }
  })
};
// src/messaging/events.ts
import { z as z98 } from "zod";
var draftCreatedEvent = defineEvent("draft.created", 1, z98.strictObject({
  draftId: draftIdSchema,
  prospectId: prospectIdSchema,
  campaignId: campaignIdSchema.nullable(),
  stepKey: stepKeySchema.nullable(),
  channel: draftChannelSchema,
  ungrounded: z98.boolean(),
  checksPassed: z98.boolean(),
  voiceVersion: z98.number().int().min(1).max(1e6),
  createdAt: timestampSchema
}));
var APPROVAL_REASONS = ["ungrounded", "check_failed", "review_mode"];
var draftApprovalRequiredEvent = defineEvent("draft.approved_required", 1, z98.strictObject({
  draftId: draftIdSchema,
  prospectId: prospectIdSchema,
  campaignId: campaignIdSchema.nullable(),
  reasons: z98.array(z98.enum(APPROVAL_REASONS)).min(1).max(APPROVAL_REASONS.length),
  requiredAt: timestampSchema
}));
var MESSAGING_EVENTS = {
  "draft.created": draftCreatedEvent,
  "draft.approved_required": draftApprovalRequiredEvent
};
// src/messaging/preview.ts
import { z as z100 } from "zod";

// src/messaging/research.ts
import { z as z99 } from "zod";
var briefStatementSchema = z99.strictObject({
  text: messagingTextSchema(MAX_BRIEF_STATEMENT_LENGTH),
  source: citationSourceSchema
});
var ANGLE_ORIGINS = ["won_deals", "model_default"];
var angleOriginSchema = z99.enum(ANGLE_ORIGINS);
var briefAngleSchema = z99.strictObject({
  text: messagingTextSchema(MAX_ANGLE_LENGTH),
  origin: angleOriginSchema,
  sources: z99.array(citationSourceSchema).max(MAX_BRIEF_STATEMENTS)
}).refine((angle) => angle.origin === "won_deals" ? angle.sources.some((source) => source.kind === "moment") : angle.sources.length === 0, "An angle from won Deals cites a Moment; a default angle cites nothing");
var researchBriefSchema = z99.strictObject({
  id: briefIdSchema,
  prospectId: prospectIdSchema,
  statements: z99.array(briefStatementSchema).min(1).max(MAX_BRIEF_STATEMENTS),
  angle: briefAngleSchema,
  droppedCount: z99.number().int().min(0).max(1000),
  prospectUpdatedAt: timestampSchema,
  language: campaignLanguageSchema,
  model: z99.string().min(1).max(100),
  createdAt: timestampSchema,
  expiresAt: timestampSchema
});
var createBriefRequestSchema = z99.strictObject({
  refresh: z99.boolean().default(false)
});
var listBriefsQuerySchema = pageQuerySchema;
var listBriefsResponseSchema = pageSchema(researchBriefSchema);

// src/messaging/preview.ts
var PREVIEW_FAILURE_CODES = [
  "draft.no_prospect_data",
  "draft.model_unavailable",
  "draft.budget_exceeded",
  "research.timeout"
];
var previewFailureCodeSchema = z100.enum(PREVIEW_FAILURE_CODES);
var previewRequestSchema = z100.strictObject({
  sequenceVersion: z100.number().int().min(1).max(1e6),
  stepKey: stepKeySchema.optional(),
  prospectIds: z100.array(prospectIdSchema).min(1).max(MAX_PREVIEW_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "Each Prospect once")
});
var previewItemSchema = z100.strictObject({
  prospectId: prospectIdSchema,
  brief: researchBriefSchema.nullable(),
  draft: outreachDraftSchema.nullable(),
  failureCode: previewFailureCodeSchema.nullable()
}).refine((item) => item.draft === null === (item.failureCode !== null), "A Draft or a failure");
var previewResultSchema = z100.strictObject({
  sequenceVersion: z100.number().int().min(1).max(1e6),
  stepKey: stepKeySchema,
  items: z100.array(previewItemSchema).min(1).max(MAX_PREVIEW_PROSPECTS)
});
var acceptPreviewRequestSchema = z100.strictObject({
  sequenceVersion: z100.number().int().min(1).max(1e6)
});
// src/messaging/routes.ts
var MESSAGING_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var MESSAGING_ADMIN_ROLES = ["owner", "admin"];
var VISIBILITY8 = "An Owner or Admin sees every Prospect; a Manager those owned by Reps on their Team; a Rep only their own. A Prospect (prospect.not_found), Campaign (campaign.not_found), Research Brief (research.not_found) or Draft (draft.not_found) outside the caller's view is its not_found code (404), never 403, and one of another Organization the same.";
var KEY6 = "Requires an Idempotency-Key header: a replay answers the same result and does the work once.";
var UNTRUSTED3 = "Model output is untrusted data: statements and Draft text are shown with their Citations, never run as instructions, and never put in a log or an event.";
var NOTHING_SENT = "Nothing is sent, and no Contact Consent or suppression state changes; sending is checked by core at send time (ADR 0003).";
var MESSAGING_ROUTES = Object.freeze({
  createBrief: inboundRoute({
    method: "POST",
    path: "/v1/prospects/{prospectId}/briefs",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:write" },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "research.not_found",
      "research.timeout",
      "draft.no_prospect_data",
      "draft.model_unavailable",
      "draft.budget_exceeded"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Makes a Research Brief for a Prospect: statements, each with exactly one Citation source, and a suggested angle that comes from the Organization's won Deals when it has any and says so when it does not. A statement the model proposed without a source that resolves is dropped and counted in droppedCount. A fresh cached Brief is returned (200) unless refresh is true; a new one is 201. ${KEY6} ${UNTRUSTED3} ${VISIBILITY8}`
  }),
  getBrief: inboundRoute({
    method: "GET",
    path: "/v1/briefs/{briefId}",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:read" },
    success: [200],
    idempotent: false,
    errors: ["research.not_found"],
    commonErrors: [],
    description: `Reads one Research Brief with its statements, their Citation sources, the angle and when it expires. ${UNTRUSTED3} ${VISIBILITY8}`
  }),
  listBriefs: inboundRoute({
    method: "GET",
    path: "/v1/prospects/{prospectId}/briefs",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:read" },
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists a Prospect's Research Briefs, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). ${VISIBILITY8}`
  }),
  createDraft: inboundRoute({
    method: "POST",
    path: "/v1/outreach-drafts",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:write" },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "prospect.not_found",
      "campaign.not_found",
      "draft.no_prospect_data",
      "draft.model_unavailable",
      "draft.budget_exceeded",
      "research.timeout",
      "voice.not_found"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Writes a Draft for a Prospect, optionally for a Step of a Campaign and with an angle, from a Research Brief and the current Brand Voice. The Draft carries its Citations, five checks (citations_resolve, claims_supported, banned_phrase, length, name_match), whether it is ungrounded (no Moment from a won Deal) and autoSendable (grounded and every check passed). It does not send. A stepKey the Campaign does not have is request.invalid (400). ${KEY6} A replay answers 200 with the same Draft. Publishes draft.created, and draft.approved_required when a person must approve it. ${UNTRUSTED3} ${VISIBILITY8}`
  }),
  getOutreachDraft: inboundRoute({
    method: "GET",
    path: "/v1/outreach-drafts/{draftId}",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:read" },
    success: [200],
    idempotent: false,
    errors: ["draft.not_found"],
    commonErrors: [],
    description: `Reads one Draft with its Citations (use the Playbook's citation resolve route for the text behind a Moment or document), checks, Brand Voice version and model. ${UNTRUSTED3} ${VISIBILITY8}`
  }),
  listOutreachDrafts: inboundRoute({
    method: "GET",
    path: "/v1/outreach-drafts",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:read" },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Drafts, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by prospectId, campaignId and whether the Draft is ungrounded. A filter never widens what the caller may see. ${VISIBILITY8}`
  }),
  editOutreachDraft: inboundRoute({
    method: "PATCH",
    path: "/v1/outreach-drafts/{draftId}",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["draft.not_found", "draft.invalid_state"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Changes the subject and/or body of a Draft by a person. The body names the expectedRevision the caller read; a stale one is draft.invalid_state (409). The text becomes source edited, the revision rises, the checks run again and a Citation whose sentence was removed gets applies false. ${KEY6} ${VISIBILITY8}`
  }),
  regenerateDraft: inboundRoute({
    method: "POST",
    path: "/v1/outreach-drafts/{draftId}/regenerate",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "draft.not_found",
      "draft.invalid_state",
      "draft.model_unavailable",
      "draft.budget_exceeded",
      "research.timeout"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Writes the Draft again with a new angle and/or tone for the same Prospect and Step; the revision rises. ${KEY6} ${UNTRUSTED3} ${VISIBILITY8}`
  }),
  getBrandVoice: inboundRoute({
    method: "GET",
    path: "/v1/brand-voice",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:read" },
    success: [200],
    idempotent: false,
    errors: ["voice.not_found"],
    commonErrors: [],
    description: "Reads the Organization's current Brand Voice: tone, preferred words, banned phrases, sign-off and the longest message. Every role may read it; voice.not_found (404) when none was saved yet."
  }),
  setBrandVoice: inboundRoute({
    method: "PUT",
    path: "/v1/brand-voice",
    roles: MESSAGING_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["voice.version_conflict", "voice.invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Saves a new Brand Voice version. The body is the settings and the expectedVersion the caller read (0 when none exists); a stale one is voice.version_conflict (409), a rule across fields that fails is voice.invalid (422). Owner and Admin only; any other is auth.forbidden. ${KEY6}`
  }),
  listBrandVoiceVersions: inboundRoute({
    method: "GET",
    path: "/v1/brand-voice/versions",
    roles: MESSAGING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the saved Brand Voice versions, newest first, one cursor-paginated page at a time (at most 100). Owner and Admin only; any other is auth.forbidden."
  }),
  previewCampaign: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/preview",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "campaign.not_found",
      "campaign.sequence_version_conflict",
      "preview.too_many_prospects",
      "prospect.not_found",
      "voice.not_found"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Shows what a Campaign's Step would send to one to five named Prospects, at the Sequence version given (the first email Step when stepKey is left out). More than five Prospects is preview.too_many_prospects (422); a stale Sequence version is campaign.sequence_version_conflict (409). Each row is a Research Brief and Draft, or the failure code that stopped that Prospect (draft.no_prospect_data, draft.model_unavailable, draft.budget_exceeded, research.timeout); one failing row does not fail the call. A named Prospect outside the caller's view fails the whole call with prospect.not_found (404). ${NOTHING_SENT} ${KEY6} ${UNTRUSTED3} ${VISIBILITY8}`
  }),
  acceptCampaignPreview: inboundRoute({
    method: "POST",
    path: "/v1/campaigns/{campaignId}/preview/accept",
    roles: MESSAGING_ALL_ROLES,
    publicApi: { scope: "messaging:write" },
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "campaign.not_found",
      "campaign.invalid_state",
      "campaign.sequence_version_conflict"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Marks the Campaign previewed at the Sequence version given, so the launch check stops reporting campaign.not_previewed for that version. It answers the Campaign with previewedVersion and previewedAt set. An archived Campaign is campaign.invalid_state (409); a Sequence saved since is campaign.sequence_version_conflict (409). ${KEY6} ${VISIBILITY8}`
  })
});
// src/messaging/voice.ts
import { z as z101 } from "zod";
var termSchema = messagingTextSchema(MAX_VOICE_TERM_LENGTH);
var brandVoiceSettingsSchema = z101.strictObject({
  tone: messagingTextSchema(MAX_TONE_LENGTH, true),
  preferredWords: z101.array(termSchema).max(MAX_PREFERRED_WORDS).default([]),
  bannedPhrases: z101.array(termSchema).max(MAX_BANNED_PHRASES).default([]),
  signOff: messagingTextSchema(MAX_SIGN_OFF_LENGTH, true).nullable().default(null),
  maxLengthCharacters: z101.number().int().min(100).max(MAX_VOICE_LENGTH_CHARACTERS).default(1500)
});
var brandVoiceSchema = z101.strictObject({
  id: brandVoiceIdSchema,
  version: z101.number().int().min(1).max(1e6),
  ...brandVoiceSettingsSchema.shape,
  createdByMembershipId: membershipIdSchema,
  createdAt: timestampSchema
});
var setBrandVoiceRequestSchema = z101.strictObject({
  ...brandVoiceSettingsSchema.shape,
  expectedVersion: z101.number().int().min(0).max(1e6)
});
var listBrandVoiceVersionsQuerySchema = pageQuerySchema;
var listBrandVoiceVersionsResponseSchema = pageSchema(brandVoiceSchema);
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

// src/playbook/sales-history-errors.ts
import { z as z104 } from "zod";

// src/playbook/rights.ts
import { z as z103 } from "zod";

// src/playbook/rights-wording.ts
import { z as z102 } from "zod";
var MAX_RIGHTS_HEADING_LENGTH = 200;
var MAX_RIGHTS_PARAGRAPHS = 10;
var MAX_RIGHTS_TEXT_LENGTH = 2000;
var textSchema = (max) => z102.string().min(1).max(max).refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control or direction characters").refine((text) => text.trim() === text, "No surrounding spaces");
var rightsWordingSchema = z102.strictObject({
  heading: textSchema(MAX_RIGHTS_HEADING_LENGTH),
  paragraphs: z102.array(textSchema(MAX_RIGHTS_TEXT_LENGTH)).min(1).max(MAX_RIGHTS_PARAGRAPHS),
  checkbox: textSchema(MAX_RIGHTS_TEXT_LENGTH),
  draft: z102.literal(true).optional()
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
var rightsWordingVersionSchema = z103.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION);
var rightsConfirmationSchema = z103.object({
  wordingVersion: rightsWordingVersionSchema,
  confirmedByUserId: userIdSchema,
  confirmedAt: timestampSchema
});
var rightsStatusSchema = z103.object({
  currentWordingVersion: rightsWordingVersionSchema,
  confirmation: rightsConfirmationSchema.nullable(),
  confirmed: z103.boolean(),
  currentWording: rightsWordingSchema.optional()
}).refine((status) => status.confirmed === (status.confirmation !== null && status.confirmation.wordingVersion === status.currentWordingVersion), { message: "Confirmed exactly when the stored version is the current one", path: ["confirmed"] });
var confirmRightsRequestSchema = z103.strictObject({
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
var rightsRequiredDetailsSchema = z104.strictObject({
  wordingVersion: z104.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION)
});

// src/playbook/suggestion.ts
import { z as z105 } from "zod";
var MOMENT_ORIGINS = ["imported", "rep", "agent"];
var momentOriginSchema = z105.enum(MOMENT_ORIGINS);
var SUGGESTION_KINDS = ["objection_answer", "discovery_question", "closing_move"];
var suggestionKindSchema = z105.enum(SUGGESTION_KINDS);
var SUGGESTION_STATUSES = ["pending", "accepted", "rejected"];
var suggestionStatusSchema = z105.enum(SUGGESTION_STATUSES);
var MAX_SUGGESTION_TEXT_LENGTH = 1000;
var MAX_SUGGESTION_MOMENTS = 10;
var suggestionTextSchema = z105.string().trim().min(1).max(MAX_SUGGESTION_TEXT_LENGTH);
var momentRefSchema = citationRefSchema.options[0];
var suggestionProvenanceSchema = z105.strictObject({
  dealRecordId: dealRecordIdSchema,
  moments: z105.array(momentRefSchema).max(MAX_SUGGESTION_MOMENTS)
});
var suggestionSchema = z105.strictObject({
  id: suggestionIdSchema,
  kind: suggestionKindSchema,
  status: suggestionStatusSchema,
  text: suggestionTextSchema,
  provenance: suggestionProvenanceSchema,
  createdAt: timestampSchema,
  decidedAt: timestampSchema.nullable(),
  decidedByMembershipId: membershipIdSchema.nullable()
}).superRefine((suggestion, ctx) => {
  const pending = suggestion.status === "pending";
  if (pending !== (suggestion.decidedAt === null)) {
    ctx.addIssue({
      code: "custom",
      path: ["decidedAt"],
      message: "Only a pending Suggestion has no decision time"
    });
  }
  if (pending !== (suggestion.decidedByMembershipId === null)) {
    ctx.addIssue({
      code: "custom",
      path: ["decidedByMembershipId"],
      message: "Only a pending Suggestion has no decider"
    });
  }
});
var acceptSuggestionRequestSchema = z105.strictObject({
  text: suggestionTextSchema.optional()
});
var rejectSuggestionRequestSchema = z105.strictObject({});
var listSuggestionsQuerySchema = pageQuerySchema.extend({
  status: suggestionStatusSchema.optional()
});
var listSuggestionsResponseSchema = pageSchema(suggestionSchema);
var SUGGESTION_ERRORS = defineErrors("suggestion", {
  not_found: { status: 404, message: "The Suggestion was not found." },
  not_pending: { status: 409, message: "The Suggestion was already accepted or rejected." }
});
var route11 = (definition) => Object.freeze(definition);
var SUGGESTION_ROUTES = Object.freeze({
  listSuggestions: route11({
    method: "GET",
    path: "/playbook/suggestions",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists proposed Playbook Suggestions, newest first, one cursor-paginated page at a time (at most 100), optionally only one status (pending, accepted or rejected). Each names its kind (objection_answer, discovery_question or closing_move), its text (untrusted data) and its provenance: the Deal (opaque id) and the Moments it cites. Owner and Admin only."
  }),
  getSuggestion: route11({
    method: "GET",
    path: "/playbook/suggestions/{suggestionId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["suggestion.not_found"],
    commonErrors: [],
    description: "Reads one Suggestion with its provenance. An unknown one, or one of another Organization, is suggestion.not_found (404), never 403. Owner and Admin only."
  }),
  acceptSuggestion: route11({
    method: "POST",
    path: "/playbook/suggestions/{suggestionId}/accept",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["suggestion.not_found", "suggestion.not_pending"],
    commonErrors: [
      "request.invalid",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: 'Accepts a pending Suggestion, optionally with edited text (the body is empty or {"text"}). The accepted text is indexed for search with its provenance; nothing reaches an Agent before this. Answers the Suggestion in state accepted. A Suggestion already decided is suggestion.not_pending (409). Owner and Admin only. Accepts an Idempotency-Key header.'
  }),
  rejectSuggestion: route11({
    method: "POST",
    path: "/playbook/suggestions/{suggestionId}/reject",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["suggestion.not_found", "suggestion.not_pending"],
    commonErrors: [
      "request.invalid",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: "Rejects a pending Suggestion (the body is empty). It is kept, in state rejected, so it is not proposed again. A Suggestion already decided is suggestion.not_pending (409). Owner and Admin only. Accepts an Idempotency-Key header."
  })
});

// src/playbook/all.ts
var ALL_PLAYBOOK_ROUTES = Object.freeze({
  ...PLAYBOOK_ROUTES,
  ...SALES_HISTORY_ROUTES,
  ...SEARCH_ROUTES,
  ...CITATION_ROUTES,
  ...SUGGESTION_ROUTES
});
var ALL_PLAYBOOK_ERRORS = Object.freeze({
  ...PLAYBOOK_ERRORS,
  ...SALES_HISTORY_ERRORS,
  ...SUGGESTION_ERRORS
});
// src/playbook/call.ts
import { z as z106 } from "zod";
var callShape = z106.object({
  id: callIdSchema,
  dealId: dealIdSchema,
  dealRecordId: dealRecordIdSchema,
  dealOutcome: outcomeSchema,
  inSearch: z106.boolean(),
  kind: callKindSchema,
  fileName: documentFileNameSchema,
  mediaType: callMediaTypeSchema,
  sizeBytes: z106.number().int().min(1).max(MAX_RECORDING_BYTES),
  durationSeconds: z106.number().int().min(1).max(MAX_RECORDING_SECONDS).nullable(),
  state: callStateSchema,
  failureReason: callFailureReasonSchema.nullable(),
  rep: repChoiceSchema.nullable(),
  speakerLabels: z106.array(speakerLabelSchema).max(MAX_CALL_SPEAKERS),
  speakers: z106.array(speakerExcerptSchema).max(MAX_CALL_SPEAKERS).optional(),
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
var uploadCallFieldsSchema = z106.strictObject({
  dealId: dealIdSchema,
  rep: z106.string().max(MAX_REP_FIELD_LENGTH).optional()
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
var callParamsSchema = z106.strictObject({ callId: callIdSchema });
var listCallsQuerySchema = pageQuerySchema.extend({ state: callStateSchema.optional(), dealRecordId: dealRecordIdSchema.optional() }).strict();
var callListItemSchema = callShape.omit({ speakers: true }).strict().superRefine(refineCall);
var listCallsResponseSchema = pageSchema(callListItemSchema);
var setCallRepRequestSchema = z106.strictObject({ rep: repChoiceSchema });
var CALL_FILE_KEYS = ["fileName", "declaredMediaType", "sizeBytes"];
var uploadCallFileSchema = z106.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z106.string().max(255).nullable(),
  sizeBytes: z106.number().int().min(1)
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
var callCursorSchema = z106.strictObject({ createdAt: timestampSchema, id: callIdSchema });
// src/playbook/deal.ts
import { z as z107 } from "zod";
var dealSchema = z107.object({
  id: dealRecordIdSchema,
  dealId: dealIdSchema,
  name: dealNameSchema.nullable(),
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable(),
  amount: dealAmountSchema.nullable(),
  currency: dealCurrencySchema.nullable(),
  callCount: z107.number().int().min(0),
  appearedInImport: z107.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).refine((deal) => deal.amount === null || deal.currency !== null, {
  message: "An amount comes with a currency",
  path: ["currency"]
});
var dealParamsSchema = z107.strictObject({ dealRecordId: dealRecordIdSchema });
var listDealsQuerySchema = pageQuerySchema.extend({
  outcome: outcomeSchema.optional(),
  appearedInImport: z107.enum(["true", "false"]).transform((value) => value === "true").optional()
}).strict();
var listDealsResponseSchema = pageSchema(dealSchema);
var setDealOutcomeRequestSchema = z107.strictObject({
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable().optional()
});
var lookupDealRequestSchema = z107.strictObject({ dealId: dealIdSchema });
var dealCursorSchema = z107.strictObject({
  createdAt: timestampSchema,
  id: dealRecordIdSchema
});
var dealImportCursorSchema = z107.strictObject({
  createdAt: timestampSchema,
  id: dealImportIdSchema
});
var dealImportRowCursorSchema = z107.strictObject({ rowNumber: z107.number().int().min(2) });
var DEAL_IMPORT_FILE_FIELD = "file";
var dealImportSchema = z107.object({
  id: dealImportIdSchema,
  state: dealImportStateSchema,
  failureReason: dealImportFailureReasonSchema.nullable(),
  rowCount: z107.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  appliedCount: z107.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  rejectedCount: z107.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
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
var dealImportParamsSchema = z107.strictObject({ importId: dealImportIdSchema });
var listDealImportsQuerySchema = pageQuerySchema.strict();
var listDealImportsResponseSchema = pageSchema(dealImportSchema);
var dealImportRowSchema = z107.object({
  rowNumber: z107.number().int().min(2).max(MAX_DEAL_IMPORT_ROWS + 1),
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
// src/playbook/deal-events.ts
import { z as z108 } from "zod";
var dealOutcomeChangedEvent = defineEvent("deal.outcome_changed", 1, z108.strictObject({
  dealRecordId: dealRecordIdSchema,
  prospectId: prospectIdSchema.nullable(),
  previousOutcome: outcomeSchema,
  outcome: outcomeSchema,
  changedAt: timestampSchema
}).refine((data) => data.previousOutcome !== data.outcome, {
  message: "The Outcome must change",
  path: ["outcome"]
}));
var PLAYBOOK_EVENTS = {
  "deal.outcome_changed": dealOutcomeChangedEvent
};
// src/playbook/document.ts
import { z as z109 } from "zod";
var documentSchema = z109.object({
  id: documentIdSchema,
  fileName: documentFileNameSchema,
  mediaType: documentMediaTypeSchema,
  sizeBytes: z109.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  pageCount: z109.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
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
var uploadDocumentFileSchema = z109.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z109.string().max(255).nullable(),
  sizeBytes: z109.number().int().min(1)
});
var documentParamsSchema = z109.strictObject({
  documentId: documentIdSchema
});
var listDocumentsQuerySchema = pageQuerySchema.extend({ state: documentStateSchema.optional() }).strict();
var listDocumentsResponseSchema = pageSchema(documentSchema);
var internalRemoveOrganizationDocumentsParamsSchema = z109.strictObject({
  organizationId: organizationIdSchema
});
var internalRemoveOrganizationDocumentsRequestSchema = z109.strictObject({});
var internalRemoveOrganizationDocumentsResponseSchema = z109.object({
  organizationId: organizationIdSchema,
  status: z109.literal("removed")
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
import { z as z110 } from "zod";
var documentUploadedPayloadSchema = z110.strictObject({
  documentId: documentIdSchema
});
var DOCUMENT_UPLOADED_MESSAGE = {
  type: "playbook.document_uploaded",
  version: 1,
  scope: "organization",
  payload: documentUploadedPayloadSchema
};
var MAX_DELETION_SEQ = 2147483647;
var documentDeletedPayloadSchema = z110.strictObject({
  documentId: documentIdSchema,
  deletionSeq: z110.number().int().min(1).max(MAX_DELETION_SEQ)
});
var DOCUMENT_DELETED_MESSAGE = {
  type: "playbook.document_deleted",
  version: 1,
  scope: "organization",
  payload: documentDeletedPayloadSchema
};
// src/playbook/sales-history-messages.ts
import { z as z111 } from "zod";
var MAX_SEQ = MAX_DELETION_SEQ;
var seqSchema = z111.number().int().min(1).max(MAX_SEQ);
var callUploadedPayloadSchema = z111.strictObject({ callId: callIdSchema });
var CALL_UPLOADED_MESSAGE = {
  type: "playbook.call_uploaded",
  version: 1,
  scope: "organization",
  payload: callUploadedPayloadSchema
};
var callTranscribedPayloadSchema = z111.strictObject({ callId: callIdSchema });
var CALL_TRANSCRIBED_MESSAGE = {
  type: "playbook.call_transcribed",
  version: 1,
  scope: "organization",
  payload: callTranscribedPayloadSchema
};
var callRepChangedPayloadSchema = z111.strictObject({
  callId: callIdSchema,
  repSeq: seqSchema
});
var CALL_REP_CHANGED_MESSAGE = {
  type: "playbook.call_rep_changed",
  version: 1,
  scope: "organization",
  payload: callRepChangedPayloadSchema
};
var callDeletedPayloadSchema = z111.strictObject({
  callId: callIdSchema,
  deletionSeq: seqSchema
});
var CALL_DELETED_MESSAGE = {
  type: "playbook.call_deleted",
  version: 1,
  scope: "organization",
  payload: callDeletedPayloadSchema
};
var dealOutcomeChangedPayloadSchema = z111.strictObject({
  dealRecordId: dealRecordIdSchema,
  outcomeSeq: seqSchema
});
var DEAL_OUTCOME_CHANGED_MESSAGE = {
  type: "playbook.deal_outcome_changed",
  version: 1,
  scope: "organization",
  payload: dealOutcomeChangedPayloadSchema
};
var dealImportUploadedPayloadSchema = z111.strictObject({ importId: dealImportIdSchema });
var DEAL_IMPORT_UPLOADED_MESSAGE = {
  type: "playbook.deal_import_uploaded",
  version: 1,
  scope: "organization",
  payload: dealImportUploadedPayloadSchema
};
// src/voice/errors.ts
var VOICE_ERRORS = {
  ...defineErrors("call", {
    number_invalid: { status: 422, message: "The number is not valid for a Call." },
    disclosure_failed: {
      status: 502,
      message: "The Disclosure could not be played, so the Call did not connect."
    },
    line_unavailable: {
      status: 409,
      message: "There is no active Line to place this Call from."
    },
    limit_reached: {
      status: 429,
      message: "The Organization has reached its limit of concurrent Calls."
    },
    not_ended: { status: 409, message: "The Call has not ended yet." }
  }),
  ...defineErrors("line", {
    not_found: { status: 404, message: "The Line was not found." },
    number_unavailable: { status: 409, message: "This number is not available." },
    released: { status: 409, message: "The Line was released and cannot be changed." },
    assignment_invalid: {
      status: 422,
      message: "The Team or Rep named for this Line is not valid."
    }
  }),
  ...defineErrors("recording", {
    not_found: { status: 404, message: "The Call has no Recording." },
    not_ready: { status: 409, message: "The Recording is still being stored. Try again shortly." }
  })
};
// src/voice/events.ts
import { z as z112 } from "zod";
var MAX_RECORDING_KEY_LENGTH = 512;
var recordingKeySchema = z112.string().min(1).max(MAX_RECORDING_KEY_LENGTH).regex(/^[A-Za-z0-9][A-Za-z0-9/_.-]*$/);
var voiceCallStartedEvent = defineEvent("voice.call.started", 1, z112.strictObject({
  callId: callIdSchema,
  direction: voiceCallDirectionSchema,
  lineId: lineIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  prospectPhoneHash: phoneHashSchema,
  startedAt: timestampSchema
}));
var VOICE_CALL_OUTCOMES = ["completed", "failed", "missed"];
var voiceCallOutcomeSchema = z112.enum(VOICE_CALL_OUTCOMES);
var voiceCallEndedEvent = defineEvent("voice.call.ended", 1, z112.strictObject({
  callId: callIdSchema,
  direction: voiceCallDirectionSchema,
  lineId: lineIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  prospectPhoneHash: phoneHashSchema,
  outcome: voiceCallOutcomeSchema,
  failureReason: voiceCallFailureReasonSchema.nullable(),
  startedAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  endedAt: timestampSchema,
  durationSeconds: z112.number().int().min(0).max(MAX_CALL_DURATION_SECONDS).nullable(),
  disclosureWordingVersion: z112.number().int().min(1).nullable(),
  recordingKey: recordingKeySchema.nullable(),
  dealId: dealIdSchema.nullable()
}).superRefine((data, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (data.outcome === "failed" !== (data.failureReason !== null)) {
    issue("failureReason", "Only a failed Call has a failure reason");
  }
  if (data.outcome === "completed" !== (data.durationSeconds !== null)) {
    issue("durationSeconds", "Only a completed Call has a duration");
  }
  if (data.failureReason === "disclosure_failed" && data.disclosureWordingVersion !== null) {
    issue("failureReason", "A Call whose Disclosure played did not fail on it");
  }
  if (data.outcome === "completed" && data.disclosureWordingVersion === null) {
    issue("disclosureWordingVersion", "A completed Call played its Disclosure");
  }
  if (data.recordingKey !== null && data.disclosureWordingVersion === null) {
    issue("recordingKey", "A Recording exists only after the Disclosure");
  }
  if (data.outcome !== "completed" && data.dealId !== null) {
    issue("dealId", "Only a completed Call has a Deal identifier");
  }
}));
var callTurnCompletedEvent = defineEvent("call.turn_completed", 1, z112.strictObject({
  callId: callIdSchema,
  turnIndex: z112.number().int().min(0).max(1e5),
  agentKind: agentKindSchema,
  instructionVersion: z112.number().int().min(1).nullable(),
  prospectId: prospectIdSchema.nullable(),
  citedSources: z112.array(citationRefSchema).max(MAX_CITATION_REFS),
  completedAt: timestampSchema
}));
var VOICE_EVENTS = {
  "voice.call.started": voiceCallStartedEvent,
  "voice.call.ended": voiceCallEndedEvent,
  "call.turn_completed": callTurnCompletedEvent
};
// src/voice/line.ts
import { z as z113 } from "zod";
var LINE_STATES = ["porting", "active", "released"];
var lineStateSchema = z113.enum(LINE_STATES);
var lineAssignmentSchema = z113.discriminatedUnion("kind", [
  z113.strictObject({ kind: z113.literal("unassigned") }),
  z113.strictObject({ kind: z113.literal("team"), teamId: teamIdSchema }),
  z113.strictObject({ kind: z113.literal("rep"), membershipId: membershipIdSchema })
]);
var lineSchema = z113.object({
  id: lineIdSchema,
  number: e164PhoneSchema,
  country: countryCodeSchema,
  label: lineLabelSchema.nullable(),
  state: lineStateSchema,
  assignment: lineAssignmentSchema,
  createdAt: timestampSchema,
  releasedAt: timestampSchema.nullable()
}).refine((line) => line.state === "released" === (line.releasedAt !== null), {
  message: "Only a released Line has a release time"
}).refine((line) => line.state !== "released" || line.assignment.kind === "unassigned", {
  message: "A released Line is unassigned"
});
var lineParamsSchema = z113.strictObject({ lineId: lineIdSchema });
var lineCursorSchema = z113.strictObject({ createdAt: timestampSchema, id: lineIdSchema });
var listLinesQuerySchema = pageQuerySchema.extend({ state: lineStateSchema.optional() }).strict();
var linePageSchema = pageSchema(lineSchema);
var addLineRequestSchema = z113.discriminatedUnion("method", [
  z113.strictObject({
    method: z113.literal("buy"),
    country: countryCodeSchema,
    areaCode: z113.string().regex(/^[0-9]{2,6}$/).optional(),
    label: lineLabelSchema.optional()
  }),
  z113.strictObject({
    method: z113.literal("port"),
    number: rawPhoneSchema,
    label: lineLabelSchema.optional()
  })
]);
var assignLineRequestSchema = lineAssignmentSchema;
// src/voice/softphone.ts
import { z as z114 } from "zod";
var MIN_SOFTPHONE_TOKEN_TTL_SECONDS = 60;
var MAX_SOFTPHONE_TOKEN_TTL_SECONDS = 3600;
var MAX_SOFTPHONE_TOKEN_LENGTH = 4096;
var softphoneTokenSchema = z114.strictObject({
  token: z114.string().min(1).max(MAX_SOFTPHONE_TOKEN_LENGTH),
  identity: membershipIdSchema,
  ttlSeconds: z114.number().int().min(MIN_SOFTPHONE_TOKEN_TTL_SECONDS).max(MAX_SOFTPHONE_TOKEN_TTL_SECONDS),
  expiresAt: timestampSchema
});
// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  ABANDON_MAX_AGE_HOURS,
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MEDIA_TYPES,
  ACCEPTED_RECORDING_EXTENSIONS,
  ACCEPTED_TRANSCRIPT_EXTENSIONS,
  AGENT_ADMIN_ROLES,
  AGENT_ALL_ROLES,
  AGENT_CALLING_WINDOW,
  AGENT_CALL_OUTCOMES,
  AGENT_CONTROL_ADMIN_ROLES,
  AGENT_CONTROL_READ_ROLES,
  AGENT_CONTROL_ROUTES,
  AGENT_ERRORS,
  AGENT_EVENTS,
  AGENT_KINDS,
  AGENT_LANGUAGES,
  AGENT_READ_ROLES,
  AGENT_ROUTES,
  AGENT_RUNTIME_ROUTES,
  AGENT_TOOLS,
  AGENT_VOICE_STYLES,
  ALL_PLAYBOOK_ERRORS,
  ALL_PLAYBOOK_ROUTES,
  ALWAYS_HELD_REASONS,
  ANALYTICS_ADMIN_ROLES,
  ANALYTICS_ERRORS,
  ANALYTICS_GROUP_BYS,
  ANALYTICS_METRICS,
  ANALYTICS_RANGE_ISSUE_MESSAGE,
  ANALYTICS_READ_ROLES,
  ANALYTICS_ROUTES,
  ANALYTICS_TABLE_GROUPS,
  ANGLE_ORIGINS,
  APIKEY_ADMIN_ROLES,
  APIKEY_ERRORS,
  APIKEY_ROUTES,
  API_KEY_AREAS,
  API_KEY_DISPLAY_PREFIX_LENGTH,
  API_KEY_SCOPES,
  API_KEY_SECRET_PREFIX,
  APPROVAL_MODES,
  APPROVAL_REASONS,
  ASSESSMENT_ADMIN_ROLES,
  ASSESSMENT_ERRORS,
  ASSESSMENT_EVENTS,
  ASSESSMENT_READ_ROLES,
  ASSESSMENT_ROUTES,
  ASSESSMENT_SORTS,
  ASSESSMENT_SUBJECT_KINDS,
  ASSESSMENT_VERDICTS,
  ATTEMPT_FAILURES,
  ATTEMPT_OUTCOMES,
  ATTRIBUTION_LOOKBACK_DAYS,
  ATTRIBUTION_OUTCOMES,
  AUDIENCE_CHECK_STATES,
  AUDIT_ACTOR_KINDS,
  AUDIT_ADMIN_ROLES,
  AUDIT_ERRORS,
  AUDIT_EVENTS,
  AUDIT_READ_ROLES,
  AUDIT_ROUTES,
  AUTH_ERRORS,
  AUTH_OPTIONS_PATH,
  AUTH_OPTIONS_ROUTE,
  BOOKING_ADMIN_ROLES,
  BOOKING_ALL_ROLES,
  BOOKING_CANCELLED_BY,
  BOOKING_ERRORS,
  BOOKING_EVENTS,
  BOOKING_MODES,
  BOOKING_ORIGINS,
  BOOKING_ROUTES,
  BOOKING_STATES,
  BOOKING_TYPE_STATES,
  BULK_ASSIGN_SYNC_LIMIT,
  CALENDAR_CONNECTION_STATES,
  CALENDAR_PROVIDERS,
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
  CAMPAIGN_ADMIN_ROLES,
  CAMPAIGN_ALL_ROLES,
  CAMPAIGN_APPROVAL_MODES,
  CAMPAIGN_ERRORS,
  CAMPAIGN_EVENTS,
  CAMPAIGN_LANGUAGES,
  CAMPAIGN_ROUTES,
  CAMPAIGN_STATES,
  CHAT_ALL_ROLES,
  CHAT_ERRORS,
  CHAT_ROUTES,
  CHAT_STATES,
  CITATION_ROUTES,
  COMPANY_SIZE_BANDS,
  CONSENT_ADMIN_ROLES,
  CONSENT_ALL_ROLES,
  CONSENT_CHANNELS,
  CONSENT_ERRORS,
  CONSENT_EVENTS,
  CONSENT_FORM_STATES,
  CONSENT_GRANT_SOURCES,
  CONSENT_RECORDABLE_SOURCES,
  CONSENT_REQUIRED_CHANNELS,
  CONSENT_REVOKE_TRIGGERS,
  CONSENT_ROUTES,
  CONSENT_STATES,
  CONSENT_WITHDRAWAL_SOURCES,
  CONTACT_ALLOW_BASES,
  CONTACT_DENIAL_CODES,
  CONTACT_PURPOSES,
  CONTROL_LEVELS,
  CONVERSATION_CONTROLLERS,
  CONVERSATION_OUTCOME_LABELS,
  CONVERSATION_STATES,
  COPILOT_CARD_KINDS,
  COPILOT_COMPOSED_KINDS,
  COPILOT_ERRORS,
  COPILOT_EVENTS,
  COPILOT_OBJECTION_TYPES,
  COPILOT_QUIET_REASONS,
  COPILOT_RATINGS,
  COPILOT_ROUTES,
  COPILOT_STREAM_EVENTS,
  COPILOT_STREAM_STATES,
  COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS,
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
  DECISION_KINDS,
  DEFAULT_AGENT_CALL_SECONDS,
  DEFAULT_CONTROL_LEVEL,
  DEFAULT_COPILOT_MIN_DEALS,
  DEFAULT_COPILOT_MIN_MOMENTS,
  DEFAULT_MAX_CALLS,
  DEFAULT_MAX_DEALS,
  DEFAULT_MAX_DOCUMENTS,
  DEFAULT_MAX_DOCUMENT_BYTES_TOTAL,
  DEFAULT_MAX_RECORDING_BYTES_TOTAL,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_LIMIT,
  DELIVERY_FAILURE_REASONS,
  DIFF_LINE_KINDS,
  DOCUMENT_DELETED_MESSAGE,
  DOCUMENT_FAILURE_REASONS,
  DOCUMENT_RETENTION_DAYS,
  DOCUMENT_STATES,
  DOCUMENT_UPLOADED_MESSAGE,
  DOMAIN_CHECK_RECORDS,
  DOMAIN_CHECK_STATUSES,
  DRAFT_AUTHORS,
  DRAFT_CHANNELS,
  DRAFT_CHECKS,
  DRAFT_HOLD_REASONS,
  DRAFT_SOURCE_KINDS,
  DRAFT_STATUSES,
  ENRICHED_FIELDS,
  ENRICHMENT_ADMIN_ROLES,
  ENRICHMENT_ALL_ROLES,
  ENRICHMENT_ERRORS,
  ENRICHMENT_EVENTS,
  ENRICHMENT_READ_ROLES,
  ENRICHMENT_ROUTES,
  ENROLLMENT_EVENT_KINDS,
  ENROLLMENT_STATES,
  ENROLLMENT_STOP_REASONS,
  ENROLL_REFUSALS,
  ENROLL_REFUSAL_CODES,
  ERRORS,
  ESCALATION_ACTIONS,
  ESCALATION_TRIGGERS,
  EVIDENCE_CSV_COLUMNS,
  EXPORT_ACTIVE_STATES,
  EXPORT_ERRORS,
  EXPORT_EVENTS,
  EXPORT_FAILURE_REASONS,
  EXPORT_LINK_HOURS,
  EXPORT_PART_FAILURE_REASONS,
  EXPORT_PART_STATES,
  EXPORT_ROLES,
  EXPORT_ROUTES,
  EXPORT_SERVICES,
  EXPORT_STATES,
  FIELD_APPLICATIONS,
  FIELD_GROUPS,
  FIELD_GROUP_OF,
  FIELD_HISTORY_STATES,
  FINDING_CATEGORIES,
  FINDING_FEEDBACKS,
  FINDING_SEVERITIES,
  FIT_FIELDS,
  FIT_RESULTS,
  FIXED_SOURCE_KINDS,
  FORBIDDEN_AUDIT_METADATA_WORDS,
  FUNDING_ROUNDS,
  GOOGLE_ERROR_PARAM,
  GOOGLE_ERROR_PATH,
  GOOGLE_ROUTES,
  GOOGLE_SIGN_UP_ATTEMPT_PARAM,
  GOOGLE_SIGN_UP_PATH,
  HANDOFF_CHANNELS,
  HANDOFF_REASONS,
  HANDOFF_RESULTS,
  HANDOFF_STATES,
  HEALTH_COMPONENTS,
  HEALTH_CRITICAL_SCORE,
  HEALTH_MINIMUM_SAMPLE,
  HEALTH_WARNING_SCORE,
  HEALTH_WINDOW_DAYS,
  IDEMPOTENCY_KEY_HEADER,
  INBOX_ADMIN_ROLES,
  INBOX_ALL_ROLES,
  INBOX_CHANNELS,
  INBOX_ERRORS,
  INBOX_EVENTS,
  INBOX_REVIEW_ROLES,
  INBOX_ROUTES,
  INCOMPLETE_UPLOAD_PARTS_TTL_HOURS,
  INQUIRY_ADMIN_ROLES,
  INQUIRY_ALL_ROLES,
  INQUIRY_CALLBACK_STATES,
  INQUIRY_ERRORS,
  INQUIRY_EVENTS,
  INQUIRY_MANAGER_ROLES,
  INQUIRY_ROUTES,
  INQUIRY_SKIP_REASONS,
  INQUIRY_SOURCES,
  INSTRUCTION_STATES,
  INTERNAL_CALL_ERRORS,
  INVITABLE_ROLES,
  INVITATION_STATES,
  LAUNCH_CHECKS,
  LAUNCH_CHECK_RESULTS,
  LINE_STATES,
  LINKEDIN_ACCOUNT_STATUSES,
  LINKEDIN_ADMIN_ROLES,
  LINKEDIN_CHANNEL_DISABLED_REASONS,
  LINKEDIN_CONNECT_ROLES,
  LINKEDIN_DAILY_CONNECTION_CEILING,
  LINKEDIN_DAILY_MESSAGE_CEILING,
  LINKEDIN_ERRORS,
  LINKEDIN_EVENTS,
  LINKEDIN_LIMIT_ISSUE_MESSAGE,
  LINKEDIN_PAUSE_REASONS,
  LINKEDIN_READ_ROLES,
  LINKEDIN_RISK_WORDING,
  LINKEDIN_RISK_WORDING_VERSION,
  LINKEDIN_ROUTES,
  LINKEDIN_SEND_GUARD_ORDER,
  LINKEDIN_WEEKLY_CONNECTION_CEILING,
  LIST_MEMBERS_MIN_ROLE,
  LIST_TEAM_MEMBERS_ERROR_CODES,
  LIST_TEAM_MEMBERS_MIN_ROLE,
  MAILBOX_KINDS,
  MAILBOX_PROVIDERS,
  MAILBOX_RAMP_STEPS,
  MAILBOX_STATES,
  MAILBOX_STATE_REASONS,
  MAIL_ADMIN_ROLES,
  MAIL_ALL_ROLES,
  MAIL_ERRORS,
  MAIL_EVENTS,
  MAIL_EVENT_KINDS,
  MAIL_REVIEW_ROLES,
  MAIL_ROUTES,
  MARKETING_ERRORS,
  MARKETING_ROUTES,
  MAX_AGENT_CALL_COST_USD_CENTS,
  MAX_AGENT_CALL_SECONDS,
  MAX_AGENT_CONCURRENCY,
  MAX_AGENT_GREETING_LENGTH,
  MAX_AGENT_INSTRUCTION_LENGTH,
  MAX_ALLOWED_ORIGINS,
  MAX_ANALYTICS_CSV_PAGE_SIZE,
  MAX_ANALYTICS_RANGE_MONTHS,
  MAX_ANGLE_LENGTH,
  MAX_ANSWER_LENGTH,
  MAX_API_KEY_NAME_LENGTH,
  MAX_ATTEMPTS_PER_RUN,
  MAX_ATTEMPT_EPOCH,
  MAX_AUDIENCE_PROSPECTS,
  MAX_AUDIT_CSV_PAGE_SIZE,
  MAX_AUDIT_METADATA_KEYS,
  MAX_AUDIT_METADATA_VALUE_LENGTH,
  MAX_AUDIT_RANGE_DAYS,
  MAX_AUDIT_VERIFY_COUNT,
  MAX_AUTHORIZATION_URL_LENGTH,
  MAX_AWAY_DAYS,
  MAX_BANNED_PHRASES,
  MAX_BOOKING_BUFFER_MINUTES,
  MAX_BOOKING_LENGTH_MINUTES,
  MAX_BOOKING_NAME_LENGTH,
  MAX_BOOKING_NOTICE_MINUTES,
  MAX_BRANCH_ARMS,
  MAX_BRIEF_STATEMENTS,
  MAX_BRIEF_STATEMENT_LENGTH,
  MAX_BULK_ASSIGN_PROSPECTS,
  MAX_CALLBACK_ATTEMPTS,
  MAX_CALL_DURATION_SECONDS,
  MAX_CALL_SPEAKERS,
  MAX_CAMPAIGN_DAILY_CAP,
  MAX_CAMPAIGN_NAME_LENGTH,
  MAX_CITATION_REFS,
  MAX_CITATION_URL_LENGTH,
  MAX_CONDITION_VALUES,
  MAX_CONSENT_FORM_NAME_LENGTH,
  MAX_CONSENT_WORDING_LENGTH,
  MAX_COPILOT_CARDS_PER_CALL,
  MAX_COPILOT_CARD_TEXT_LENGTH,
  MAX_COPILOT_CITED_MOMENTS,
  MAX_COPILOT_MIN_EVIDENCE,
  MAX_COPILOT_QUOTE_LENGTH,
  MAX_COPILOT_STREAM_ID_LENGTH,
  MAX_CRITERION_NAME_LENGTH,
  MAX_CRITERION_VALUES,
  MAX_CRITERION_VALUE_LENGTH,
  MAX_CRITERION_WEIGHT,
  MAX_CURSOR_LENGTH,
  MAX_DAILY_BOOKING_CAP,
  MAX_DEAL_ID_BYTES,
  MAX_DEAL_ID_LENGTH,
  MAX_DEAL_IMPORT_BYTES,
  MAX_DEAL_IMPORT_CELL_LENGTH,
  MAX_DEAL_IMPORT_HEADER_LENGTH,
  MAX_DEAL_IMPORT_ROWS,
  MAX_DEAL_NAME_BYTES,
  MAX_DEAL_NAME_LENGTH,
  MAX_DECISION_NOTE_LENGTH,
  MAX_DELETION_SEQ,
  MAX_DEMO_REQUEST_FIELD_LENGTH,
  MAX_DEMO_REQUEST_MESSAGE_LENGTH,
  MAX_DIFF_LINES,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_FILE_NAME_BYTES,
  MAX_DOCUMENT_FILE_NAME_LENGTH,
  MAX_DOCUMENT_PAGES,
  MAX_DOMAIN_CHECK_TEXT_LENGTH,
  MAX_DRAFT_BODY_LENGTH,
  MAX_DRAFT_CITATIONS,
  MAX_DRAFT_SOURCES,
  MAX_DRAFT_SUBJECT_LENGTH,
  MAX_ELIGIBLE_REPS,
  MAX_EMAIL_LENGTH,
  MAX_ENRICHED_VALUE_LENGTH,
  MAX_ENRICH_PROSPECTS,
  MAX_EVIDENCE_REF_LENGTH,
  MAX_EXCEPT_LABELS,
  MAX_EXPORTS_PER_DAY,
  MAX_EXPORT_PART_BYTES,
  MAX_EXPORT_PART_FILES,
  MAX_FIELD_HISTORY_ENTRIES,
  MAX_FINDINGS,
  MAX_FINDING_CATEGORIES,
  MAX_FINDING_EXPLANATION_LENGTH,
  MAX_FINDING_SPAN_OFFSET,
  MAX_FIT_CRITERIA,
  MAX_GOAL_LENGTH,
  MAX_HANDOFF_CONTEXT_TURNS,
  MAX_HONEYPOT_LENGTH,
  MAX_INQUIRY_MESSAGE_LENGTH,
  MAX_LINE_LABEL_LENGTH,
  MAX_LINKEDIN_TYPED_NAME_LENGTH,
  MAX_MAILBOX_NAME_LENGTH,
  MAX_MAILBOX_TEAMS,
  MAX_MERGED_PROSPECTS,
  MAX_MESSAGE_BODY_LENGTH,
  MAX_MICRO_DOLLARS,
  MAX_MIN_GAP_SECONDS,
  MAX_MOMENT_SNIPPET_CHARACTERS,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_PERSON_NAME_LENGTH,
  MAX_PLAYBACK_URL_LENGTH,
  MAX_PLAY_CITATIONS,
  MAX_PREFERRED_WORDS,
  MAX_PREVIEW_PROSPECTS,
  MAX_PROMOTION_SAMPLE,
  MAX_PROPOSED_PLAYS,
  MAX_PROSPECTS_PER_REQUEST,
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
  MAX_PROVIDERS,
  MAX_PROVIDER_API_KEY_LENGTH,
  MAX_PROVIDER_KEY_LENGTH,
  MAX_PUBLIC_BOOKING_FIELD_LENGTH,
  MAX_QUALIFICATION_QUESTIONS,
  MAX_QUALIFICATION_SUMMARY_LENGTH,
  MAX_QUESTION_CHOICES,
  MAX_QUESTION_PROMPT_LENGTH,
  MAX_QUESTION_SUGGESTIONS,
  MAX_QUEUED_DEAL_IMPORTS,
  MAX_RECORDING_BYTES,
  MAX_RECORDING_KEY_LENGTH,
  MAX_RECORDING_SECONDS,
  MAX_REGION_LENGTH,
  MAX_REP_FIELD_LENGTH,
  MAX_REP_FOLLOWING_CHARACTERS,
  MAX_REP_FOLLOWING_TURNS,
  MAX_RETURN_TO_LENGTH,
  MAX_RIGHTS_HEADING_LENGTH,
  MAX_RIGHTS_PARAGRAPHS,
  MAX_RIGHTS_TEXT_LENGTH,
  MAX_RIGHTS_WORDING_VERSION,
  MAX_ROUTING_RULES,
  MAX_SEARCH_CANDIDATES,
  MAX_SEARCH_LIMIT,
  MAX_SEARCH_TEXT_CHARACTERS,
  MAX_SEARCH_TURNS,
  MAX_SENDS_PER_DAY,
  MAX_SENDS_PER_HOUR,
  MAX_SEQ,
  MAX_SEQUENCE_PROBLEMS,
  MAX_SEQUENCE_STEP,
  MAX_SEQUENCE_STEPS,
  MAX_SERIES_GROUPS_PER_PAGE,
  MAX_SERIES_POINTS,
  MAX_SIGNAL_FRESHNESS_DAYS,
  MAX_SIGNAL_LABEL_LENGTH,
  MAX_SIGNAL_TEXT_LENGTH,
  MAX_SIGNAL_URL_LENGTH,
  MAX_SIGN_OFF_LENGTH,
  MAX_SKIP_CONDITIONS,
  MAX_SLOT_RANGE_DAYS,
  MAX_SOFTPHONE_TOKEN_LENGTH,
  MAX_SOFTPHONE_TOKEN_TTL_SECONDS,
  MAX_SOURCE_PASSAGE_LENGTH,
  MAX_SOURCE_REF_LENGTH,
  MAX_SOURCE_URL_LENGTH,
  MAX_SPEAKER_EXCERPT_LENGTH,
  MAX_SPEAKER_LABEL_BYTES,
  MAX_SPEAKER_LABEL_LENGTH,
  MAX_STEP_TEXT_LENGTH,
  MAX_STRATEGY_LENGTH,
  MAX_SUGGESTION_MOMENTS,
  MAX_SUGGESTION_TEXT_LENGTH,
  MAX_SUMMARY_LENGTH,
  MAX_SUPPRESSION_IMPORT_BYTES,
  MAX_SUPPRESSION_IMPORT_ROWS,
  MAX_SUPPRESSION_NOTE_LENGTH,
  MAX_TONE_LENGTH,
  MAX_TOUCH_SOURCES,
  MAX_TRANSCRIPT_BYTES,
  MAX_TRANSCRIPT_TURN_LENGTH,
  MAX_TURN_SOURCES,
  MAX_TURN_TEXT_LENGTH,
  MAX_UTF8_BYTES_PER_CODE_POINT,
  MAX_VARIANTS,
  MAX_VOICE_LENGTH_CHARACTERS,
  MAX_VOICE_TERM_LENGTH,
  MAX_WAIT_HOURS,
  MAX_WINDOWS_PER_DAY,
  MAX_WRAP_UP_NOTE_LENGTH,
  MEDIA_TYPE_BY_CALL_EXTENSION,
  MEDIA_TYPE_BY_EXTENSION,
  MESSAGE_AUTHOR_KINDS,
  MESSAGE_DIRECTIONS,
  MESSAGE_FAILURE_REASONS,
  MESSAGING_ADMIN_ROLES,
  MESSAGING_ALL_ROLES,
  MESSAGING_ERRORS,
  MESSAGING_EVENTS,
  MESSAGING_ROUTES,
  MIN_COPILOT_MIN_EVIDENCE,
  MIN_QUESTION_CHOICES,
  MIN_RATE_SAMPLE,
  MIN_SOFTPHONE_TOKEN_TTL_SECONDS,
  MIN_SOURCE_SAMPLE,
  MIN_VARIANTS,
  MIN_VARIANT_SAMPLE,
  MOMENT_ORIGINS,
  OIDC_COOKIE_BASE_NAME,
  OIDC_COOKIE_SECURE_PREFIX,
  ONE_ADDRESS_MESSAGE,
  ORGANIZATION_STATUSES,
  OUTCOMES,
  PACKAGE,
  PAUSE_SEQUENCE_LABELS,
  PLAYBOOK_ERRORS,
  PLAYBOOK_EVENTS,
  PLAYBOOK_READ_ROLES,
  PLAYBOOK_ROUTES,
  PLAYBOOK_WRITE_ROLES,
  PLAY_INTENTS,
  PLAY_SOURCES,
  PLAY_STATUSES,
  PREVIEW_FAILURE_CODES,
  PROMOTION_SOURCES,
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
  QUALIFICATION_QUESTION_KINDS,
  RECORDING_MEDIA_TYPES,
  REGIONS,
  REPLY_LABELS,
  REP_TASK_TYPES,
  RIGHTS_WORDINGS,
  ROLES,
  ROUTING_CANDIDATE_REASONS,
  ROUTING_ROLES,
  ROUTING_SKIP_REASONS,
  RUN_END_STATUSES,
  RUN_STATUSES,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_READ_ROLES,
  SALES_HISTORY_ROUTES,
  SEARCH_ROUTES,
  SEND_CHECKS,
  SEND_DEFERRING_REASONS,
  SEND_REFUSAL_REASONS,
  SEND_STATES,
  SEQUENCE_PROBLEMS,
  SIGNAL_KINDS,
  SIGNAL_WEBHOOK_SIGNATURE_HEADER,
  SIGNAL_WEBHOOK_TIMESTAMP_HEADER,
  SIGNAL_WEBHOOK_TOLERANCE_SECONDS,
  SIGNUP_ERRORS,
  SKIP_OPERATORS,
  SOURCE_FLAGS,
  STEP_KINDS,
  STOP_REASONS,
  STOP_SENDING_LABELS,
  SUGGESTION_ERRORS,
  SUGGESTION_KINDS,
  SUGGESTION_ROUTES,
  SUGGESTION_STATUSES,
  SUPPRESSION_ADDRESS_KINDS,
  SUPPRESSION_IMPORT_COLUMNS,
  SUPPRESSION_IMPORT_FAILURE_REASONS,
  SUPPRESSION_IMPORT_FILE_FIELD,
  SUPPRESSION_IMPORT_ROW_RESULTS,
  SUPPRESSION_IMPORT_STATES,
  SUPPRESSION_REASONS,
  SUPPRESSION_REMOVABLE_REASONS,
  TOUCH_KINDS,
  UPLOAD_CONTENT_TYPE,
  UPLOAD_FILE_FIELD,
  VARIANT_RESULT_STATUSES,
  VARIANT_WEIGHT_TOTAL,
  VERIFICATION_REASONS,
  VERIFICATION_STATUSES,
  VOICE_ADMIN_ROLES,
  VOICE_ALL_ROLES,
  VOICE_CALL_DIRECTIONS,
  VOICE_CALL_ENDED_BY,
  VOICE_CALL_FAILURE_REASONS,
  VOICE_CALL_FINAL_STATES,
  VOICE_CALL_OUTCOMES,
  VOICE_CALL_STATES,
  VOICE_ERRORS,
  VOICE_EVENTS,
  VOICE_RECORDING_STATES,
  VOICE_ROUTES,
  VOICE_TRANSCRIPT_STATES,
  WEEKDAYS,
  WINDOW_ZONES,
  acceptLinkedinRiskRequestSchema,
  acceptPlayRequestSchema,
  acceptPreviewRequestSchema,
  acceptSuggestionRequestSchema,
  addLineRequestSchema,
  addSuppressionRequestSchema,
  addTeamMemberRequestSchema,
  addressFieldsShape,
  agentCallOutcomeSchema,
  agentCallParamsSchema,
  agentChannelSchema,
  agentControlChannelParamSchema,
  agentControlSchema,
  agentInstructionVersionIdSchema,
  agentKindSchema,
  agentLanguageSchema,
  agentRuntimeConfigSchema,
  agentRuntimeControlSchema,
  agentSendWindowSchema,
  agentSettingsSchema,
  agentToolNameSchema,
  agentTurnPageSchema,
  agentTurnRoleSchema,
  agentTurnSchema,
  agentVoiceStyleSchema,
  agentsPausedSchema,
  allowedOriginSchema,
  analyticsFilterShape,
  analyticsGroupBySchema,
  analyticsGroupKeySchema,
  analyticsMetricSchema,
  analyticsRangeShape,
  analyticsTableGroupSchema,
  angleOriginSchema,
  answerHandoffRequestSchema,
  apiKeyAreaSchema,
  apiKeyDisplayPrefixSchema,
  apiKeyIdSchema,
  apiKeySchema,
  apiKeyScopeSchema,
  apiKeySecretSchema,
  approvalPoliciesSchema,
  approvalPolicySchema,
  approvalQueueCursorSchema,
  approvalQueueItemSchema,
  approvalQueuePageSchema,
  approvalRuleSchema,
  approveDraftRequestSchema,
  assessmentCompletedEvent,
  assessmentIdSchema,
  assessmentJudgeSourceSchema,
  assessmentRateItemSchema,
  assessmentSchema,
  assessmentSubjectSchema,
  assessmentVerdictSchema,
  assignLineRequestSchema,
  attemptFailureSchema,
  attemptIdSchema,
  attemptOutcomeSchema,
  audienceCheckSchema,
  audienceCheckStateSchema,
  audienceCountsSchema,
  audienceSchema,
  auditActionSchema,
  auditActorKindSchema,
  auditActorSchema,
  auditContentShape,
  auditCsvQuerySchema,
  auditEventIdSchema,
  auditEventSchema,
  auditFilterSchema,
  auditHashSchema,
  auditMetadataKeySchema,
  auditMetadataSchema,
  auditMetadataValueSchema,
  auditRecordedEvent,
  auditSubjectIdSchema,
  auditSubjectSchema,
  auditSubjectTypeSchema,
  authOptionsResponseSchema,
  authProvidersSchema,
  authorizationUrlSchema,
  availabilitySchema,
  bookHeadersSchema,
  bookRequestSchema,
  bookingCancelledBySchema,
  bookingCancelledEvent,
  bookingCreatedEvent,
  bookingCursorSchema,
  bookingIdSchema,
  bookingLinkTokenSchema,
  bookingModeSchema,
  bookingNameSchema,
  bookingOriginSchema,
  bookingPageSchema,
  bookingParamsSchema,
  bookingRescheduledEvent,
  bookingSchema,
  bookingStateSchema,
  bookingTypeCursorSchema,
  bookingTypeIdSchema,
  bookingTypeParamsSchema,
  bookingTypeSchema,
  bookingTypeStateSchema,
  boundedTextSchema,
  branchArmSchema,
  branchConditionSchema,
  branchStepSchema,
  brandVoiceIdSchema,
  brandVoiceSchema,
  brandVoiceSettingsSchema,
  briefAngleSchema,
  briefIdSchema,
  briefStatementSchema,
  browserSessionTokensSchema,
  bulkAssignProspectsRequestSchema,
  bulkAssignProspectsResponseSchema,
  calendarConnectionSchema,
  calendarConnectionStateSchema,
  calendarDateSchema,
  calendarProviderSchema,
  callChannelSchema,
  callCursorSchema,
  callDeletedPayloadSchema,
  callDisclosureSchema,
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
  callTurnCompletedEvent,
  callUploadedPayloadSchema,
  campaignApprovalModeSchema,
  campaignCursorSchema,
  campaignEnrollmentsParamsSchema,
  campaignIdSchema,
  campaignLanguageSchema,
  campaignLaunchedEvent,
  campaignNameSchema,
  campaignParamsSchema,
  campaignSchema,
  campaignStateSchema,
  campaignStatsSchema,
  changeMemberRoleRequestSchema,
  channelConsentSchema,
  channelParamsSchema,
  chatIdSchema,
  chatMessagePageSchema,
  chatMessageSchema,
  chatPageSchema,
  chatParamsSchema,
  chatSchema,
  chatSessionTokenSchema,
  chatStateSchema,
  chatTextSchema,
  checkAnalyticsRange,
  checkCallFile,
  checkDealImportHeader,
  checkDealImportHeaderText,
  checkDealImportRow,
  checkUploadFile,
  citationRefSchema,
  citationSourceSchema,
  citationUrlSchema,
  classificationSchema,
  companySizeBandSchema,
  completeCalendarConnectionRequestSchema,
  completeMailboxConnectRequestSchema,
  confidenceSchema,
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
  consentRevokeTriggerSchema,
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
  contactWarningSchema,
  controlLevelSchema,
  conversationActionRequestSchema,
  conversationControllerSchema,
  conversationCursorSchema,
  conversationHandedBackEvent,
  conversationIdSchema,
  conversationMessageParamsSchema,
  conversationOutcomeLabelSchema,
  conversationPageSchema,
  conversationParamsSchema,
  conversationSchema,
  conversationStateSchema,
  conversationSummarySchema,
  conversationTakenOverEvent,
  copilotCallParamsSchema,
  copilotCardCursorSchema,
  copilotCardDataSchema,
  copilotCardIdSchema,
  copilotCardKindSchema,
  copilotCardPageSchema,
  copilotCardParamsSchema,
  copilotCardSchema,
  copilotCardTextSchema,
  copilotDocumentSourceSchema,
  copilotEvidenceSchema,
  copilotMomentKey,
  copilotMomentRefSchema,
  copilotObjectionTypeSchema,
  copilotQuietReasonSchema,
  copilotQuoteSchema,
  copilotQuoteTextSchema,
  copilotRatingSchema,
  copilotSettingsSchema,
  copilotStatusDataSchema,
  copilotStreamHeadersSchema,
  copilotStreamIdSchema,
  copilotStreamMessageSchema,
  copilotStreamStateSchema,
  copilotTextSchema,
  copilotTranscriptUnavailableDataSchema,
  copilotTurnDataSchema,
  correctClassificationRequestSchema,
  countSchema2 as countSchema,
  countValueSchema,
  countryCodeSchema,
  createApiKeyRequestSchema,
  createApiKeyResponseSchema,
  createBookingTypeRequestSchema,
  createBriefRequestSchema,
  createCampaignRequestSchema,
  createConsentFormRequestSchema,
  createConsentWordingRequestSchema,
  createDemoRequestRequestSchema,
  createDemoRequestResponseSchema,
  createDraftRequestSchema,
  createEnrichmentRequestSchema,
  createExportRequestSchema,
  createFitCriterionRequestSchema,
  createInvitationRequestSchema,
  createPlayRequestSchema,
  createProspectCompanyRequestSchema,
  createProspectRequestSchema,
  createQualificationQuestionRequestSchema,
  createRoutingRuleRequestSchema,
  createTeamRequestSchema,
  dateRangeSchema,
  dealAmountSchema,
  dealAttributionSchema,
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
  dealOutcomeChangedEvent,
  dealOutcomeChangedPayloadSchema,
  dealParamsSchema,
  dealRecordIdSchema,
  dealSchema,
  decisionCursorSchema,
  decisionIdSchema,
  decisionKindSchema,
  decisionNoteSchema,
  decisionPageSchema,
  decisionSchema,
  decodeCursor,
  defineErrors,
  defineEvent,
  deletedRecordingSchema,
  demoRequestIdSchema,
  demoRequestMessageSchema,
  demoRequestSourcePageSchema,
  diffInstructionVersionsQuerySchema,
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
  domainCheckRecordSchema,
  domainCheckResultSchema,
  domainCheckSchema,
  domainCheckStatusSchema,
  draftApprovalRequiredEvent,
  draftAuthorSchema,
  draftChannelSchema,
  draftCheckNameSchema,
  draftCheckSchema,
  draftCitationSchema,
  draftCreatedEvent,
  draftHoldReasonSchema,
  draftIdSchema,
  draftParamsSchema,
  draftReasonSchema,
  draftReleaseSchema,
  draftSchema,
  draftSourceKindSchema,
  draftSourceSchema,
  draftSourcesSchema,
  draftStatusSchema,
  duplicateCampaignRequestSchema,
  duplicateIdentityDetailsSchema,
  e164PhoneSchema,
  editDraftRequestSchema,
  editPlayRequestSchema,
  effectiveLimitsSchema,
  emailSchema,
  emailStepSchema,
  emailVerificationSchema,
  encodeCursor,
  endStepSchema,
  enrichedFieldNameSchema,
  enrichmentAttemptSchema,
  enrichmentBudgetSchema,
  enrichmentCompletedEvent,
  enrichmentRunIdSchema,
  enrichmentRunSchema,
  enrichmentRunSetIdSchema,
  enrichmentRunSetSchema,
  enrichmentTextSchema,
  enrollProspectsRequestSchema,
  enrollProspectsResponseSchema,
  enrollRefusalSchema,
  enrollResultSchema,
  enrollmentActivityCursorSchema,
  enrollmentCursorSchema,
  enrollmentEventIdSchema,
  enrollmentEventKindSchema,
  enrollmentEventSchema,
  enrollmentIdSchema,
  enrollmentParamsSchema,
  enrollmentSchema,
  enrollmentStateSchema,
  enrollmentStopReasonSchema,
  enrollmentStoppedEvent,
  eraseProspectResponseSchema,
  errorBodySchema,
  errorCodeSchema,
  escalationActionSchema,
  escalationRuleSchema,
  escalationRulesSchema,
  escalationTriggerSchema,
  eventEnvelopeSchema,
  eventIdSchema,
  eventTypeSchema,
  evidenceEventSchema,
  evidencePageSchema,
  evidenceRefSchema,
  excerptText,
  exportDownloadSchema,
  exportFailureReasonSchema,
  exportJobIdSchema,
  exportJobSchema,
  exportPartFailedEvent,
  exportPartFailureReasonSchema,
  exportPartReadyEvent,
  exportPartSchema,
  exportPartStateSchema,
  exportPrefixSchema,
  exportRequestedEvent,
  exportServiceSchema,
  exportStateSchema,
  fieldApplicationSchema,
  fieldGroupSchema,
  fieldHistoryCursorSchema,
  fieldHistoryEntrySchema,
  fieldHistoryStateSchema,
  fieldProvenanceSchema,
  fieldValueSchema,
  findSequenceProblems,
  findingCategorySchema,
  findingFeedbackSchema,
  findingIdSchema,
  findingSchema,
  findingSeveritySchema,
  findingSpanSchema,
  firstCsvRecord,
  fitConditionSchema,
  fitConditionSuitsField,
  fitCriterionIdSchema,
  fitCriterionSchema,
  fitFieldSchema,
  fitMatchSchema,
  fitResultSchema,
  fitScoreSchema,
  foldAscii,
  formatCopilotStreamFrame,
  formatId,
  getAssessmentRatesQuerySchema,
  getAssessmentRatesResponseSchema,
  getDealAttributionQuerySchema,
  getSeriesQuerySchema,
  getSeriesResponseSchema,
  getTranscriptQuerySchema,
  giveFindingFeedbackRequestSchema,
  goalSchema,
  googleCompleteRequestSchema,
  googleCompleteResponseSchema,
  googleErrorQuerySchema,
  googleIntentSchema,
  googleSignUpQuerySchema,
  googleStartRequestSchema,
  googleStartResponseSchema,
  handoffChannelSchema,
  handoffContextSchema,
  handoffIdSchema,
  handoffPageSchema,
  handoffParamsSchema,
  handoffReasonSchema,
  handoffResultSchema,
  handoffSchema,
  handoffStateSchema,
  hasControlCharacter2 as hasControlCharacter,
  hasExactlyOneAddress,
  hasStrippableCharacter,
  healthComponentKindSchema,
  healthComponentSchema,
  healthComponentStateSchema,
  healthDailyPageSchema,
  healthDailySchema,
  healthHistoryCursorSchema,
  healthSummarySchema,
  holdReasonFor,
  hostedConsentFormViewSchema,
  hostedConsentReceiptSchema,
  hostedConsentSubmissionSchema,
  hoursSchema2 as hoursSchema,
  idSchema,
  idempotencyKeySchema,
  inboxChannelSchema,
  inboxKeyedHeadersSchema,
  ingestMessageRequestSchema,
  ingestMessageResultSchema,
  inquiryCallbackSchema,
  inquiryCallbackStateSchema,
  inquiryConsentSchema,
  inquiryCursorSchema,
  inquiryEmbedSchema,
  inquiryIdSchema,
  inquiryKeySchema,
  inquiryKeyedHeadersSchema,
  inquiryMessageSchema,
  inquiryPageSchema,
  inquiryParamsSchema,
  inquirySchema,
  inquirySkipReasonSchema,
  inquirySourceSchema,
  instructionDiffSchema,
  instructionStateSchema,
  instructionVersionSchema,
  instructionVersionSummarySchema,
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
  invalidSequenceDetailsSchema,
  invitableRoleSchema,
  invitationIdSchema,
  invitationParamsSchema,
  invitationSchema,
  invitationStateSchema,
  invitationTokenSchema,
  isAnalyticsRangeTooLarge,
  isBlankCsvRecord,
  isComposedKind,
  isWellFormedText,
  isoWeekSchema,
  joinUrlSchema,
  lastAllowedAnalyticsDay,
  launchCheckItemSchema,
  launchCheckNameSchema,
  launchCheckResultSchema,
  launchCheckSchema,
  limitDetailsSchema,
  lineAssignmentSchema,
  lineCursorSchema,
  lineIdSchema,
  lineLabelSchema,
  linePageSchema,
  lineParamsSchema,
  lineSchema,
  lineStateSchema,
  linkedinAccountIdSchema,
  linkedinAccountPageSchema,
  linkedinAccountPausedEvent,
  linkedinAccountSchema,
  linkedinAccountStatusSchema,
  linkedinChannelDisabledEvent,
  linkedinInvitationAcceptedEvent,
  linkedinLimitsSchema,
  linkedinPauseReasonSchema,
  linkedinRiskAcceptanceIdSchema,
  linkedinRiskAcceptancePageSchema,
  linkedinRiskAcceptanceSchema,
  linkedinRiskStatementSchema,
  linkedinSettingsSchema,
  linkedinTypedNameSchema,
  linkedinUsagePageSchema,
  linkedinUsageSchema,
  listAgentControlsQuerySchema,
  listAgentControlsResponseSchema,
  listAgentTurnsQuerySchema,
  listApiKeysQuerySchema,
  listApiKeysResponseSchema,
  listApprovalQueueQuerySchema,
  listAssessmentsQuerySchema,
  listAssessmentsResponseSchema,
  listAuditEventsQuerySchema,
  listAuditEventsResponseSchema,
  listBookingTypesQuerySchema,
  listBookingsQuerySchema,
  listBrandVoiceVersionsQuerySchema,
  listBrandVoiceVersionsResponseSchema,
  listBriefsQuerySchema,
  listBriefsResponseSchema,
  listCallsQuerySchema,
  listCallsResponseSchema,
  listCampaignsQuerySchema,
  listCampaignsResponseSchema,
  listChatMessagesQuerySchema,
  listChatsQuerySchema,
  listConsentEventsQuerySchema,
  listConsentFormsQuerySchema,
  listConsentWordingsQuerySchema,
  listContactChecksQuerySchema,
  listConversationsQuerySchema,
  listCopilotCardsQuerySchema,
  listDealImportRowsQuerySchema,
  listDealImportRowsResponseSchema,
  listDealImportsQuerySchema,
  listDealImportsResponseSchema,
  listDealsQuerySchema,
  listDealsResponseSchema,
  listDecisionsQuerySchema,
  listDocumentsQuerySchema,
  listDocumentsResponseSchema,
  listDraftsQuerySchema,
  listDraftsResponseSchema,
  listEnrichmentRunsQuerySchema,
  listEnrichmentRunsResponseSchema,
  listEnrollmentActivityResponseSchema,
  listEnrollmentsQuerySchema,
  listEnrollmentsResponseSchema,
  listEvidenceQuerySchema,
  listExportsQuerySchema,
  listExportsResponseSchema,
  listFieldHistoryQuerySchema,
  listFieldHistoryResponseSchema,
  listFitCriteriaQuerySchema,
  listFitCriteriaResponseSchema,
  listFitScoresQuerySchema,
  listFitScoresResponseSchema,
  listHandoffsQuerySchema,
  listHealthHistoryQuerySchema,
  listInquiriesQuerySchema,
  listInstructionVersionsQuerySchema,
  listInstructionVersionsResponseSchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
  listLinesQuerySchema,
  listLinkedinAccountsQuerySchema,
  listLinkedinRiskAcceptancesQuerySchema,
  listLinkedinUsageQuerySchema,
  listMailEventsQuerySchema,
  listMailboxesQuerySchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  listMessagesQuerySchema,
  listPlaysQuerySchema,
  listPlaysResponseSchema,
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
  listProvidersQuerySchema,
  listProvidersResponseSchema,
  listQualificationQuestionsQuerySchema,
  listRoutingRulesQuerySchema,
  listSendsQuerySchema,
  listSignalsQuerySchema,
  listSignalsResponseSchema,
  listSlotsQuerySchema,
  listSourcePerformanceQuerySchema,
  listSourcePerformanceResponseSchema,
  listSpendQuerySchema,
  listSpendResponseSchema,
  listSuggestionsQuerySchema,
  listSuggestionsResponseSchema,
  listSuppressionEntriesQuerySchema,
  listSuppressionImportRowsQuerySchema,
  listSuppressionImportsQuerySchema,
  listTableQuerySchema,
  listTableResponseSchema,
  listTeamMembersQuerySchema,
  listTeamMembersResponseSchema,
  listTeamsQuerySchema,
  listTeamsResponseSchema,
  listVoiceCallsQuerySchema,
  lookupDealRequestSchema,
  lookupSuppressionRequestSchema,
  mailBouncedEvent,
  mailCapacitySchema,
  mailComplainedEvent,
  mailEventCursorSchema,
  mailEventIdSchema,
  mailEventKindSchema,
  mailEventPageSchema,
  mailEventSchema,
  mailKeyedHeadersSchema,
  mailOutOfOfficeEvent,
  mailProviderMessageIdSchema,
  mailRepliedEvent,
  mailUnsubscribedEvent,
  mailboxCapacitySchema,
  mailboxConnectStartSchema,
  mailboxCursorSchema,
  mailboxHealthSchema,
  mailboxIdSchema,
  mailboxKindSchema,
  mailboxLimitsSchema,
  mailboxPageSchema,
  mailboxParamsSchema,
  mailboxProviderSchema,
  mailboxSchema,
  mailboxStateChangedEvent,
  mailboxStateReasonSchema,
  mailboxStateSchema,
  markCopilotCardRequestSchema,
  maskedAddressSchema,
  memberParamsSchema,
  memberSchema,
  membershipIdSchema,
  mergeProspectsRequestSchema,
  messageApprovedEvent,
  messageAuthorKindSchema,
  messageBodySchema,
  messageCursorSchema,
  messageDirectionSchema,
  messageFailedEvent,
  messageFailureReasonSchema,
  messageIdSchema,
  messagePageSchema,
  messageSchema2 as messageSchema,
  messageSentEvent,
  messagingTextSchema,
  metricValueSchema,
  microDollarsSchema,
  minuteOfDaySchema,
  momentMatchSchema,
  momentOriginSchema,
  momentQueryText,
  momentSnippet,
  momentSnippetSchema,
  monthSchema,
  multilineTextSchema,
  normaliseDealId,
  normaliseFileName,
  normaliseMediaType,
  normaliseSpeakerLabel,
  notEnoughDataRateValueSchema,
  okRateValueSchema,
  oneClickUnsubscribeBodySchema,
  oneClickUnsubscribeRequestSchema,
  organizationIdSchema,
  organizationMailLimitsSchema,
  organizationNameSchema,
  organizationSchema,
  organizationStatusSchema,
  outcomeSchema,
  outreachDraftCheckSchema,
  outreachDraftSchema,
  pageQuerySchema,
  pageSchema,
  parseAmountCell,
  parseClosedAtCell,
  parseCsv,
  parseCurrencyCell,
  parseOutcomeCell,
  parseRepField,
  personNameSchema,
  phoneHashSchema,
  placeCallHeadersSchema,
  placeCallRequestSchema,
  placedCallSchema,
  playCitationSchema,
  playCursorSchema,
  playIdSchema,
  playIntentSchema,
  playParamsSchema,
  playSchema,
  playSourceSchema,
  playStatusSchema,
  previewFailureCodeSchema,
  previewItemSchema,
  previewRequestSchema,
  previewResultSchema,
  promoteVariantResponseSchema,
  promotionPolicySchema,
  promotionRecordSchema,
  promotionSourceSchema,
  proposePlaysRequestSchema,
  proposePlaysResponseSchema,
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
  prospectEnrichmentSchema,
  prospectErasedEvent,
  prospectFieldNameSchema,
  prospectFieldParamsSchema,
  prospectFitChangedEvent,
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
  providerApiKeySchema,
  providerCostSchema,
  providerKeySchema,
  providerMessageIdSchema,
  providerSettingsSchema,
  publicBookRequestSchema,
  publicBookingConfirmationSchema,
  publicBookingParamsSchema,
  publicBookingTypeSchema,
  publicChatConsentReceiptSchema,
  publicChatConsentRequestSchema,
  publicChatHandoffReplySchema,
  publicChatHandoffRequestSchema,
  publicChatHeadersSchema,
  publicChatKeyParamsSchema,
  publicChatMessagePageSchema,
  publicChatMessageReplySchema,
  publicChatMessageSchema,
  publicChatOriginHeadersSchema,
  publicChatReplySchema,
  publicChatSessionParamsSchema,
  publicInquiryFormViewSchema,
  publicInquiryHeadersSchema,
  publicInquiryParamsSchema,
  publicInquiryReceiptSchema,
  publicInquiryRequestSchema,
  publicListChatMessagesQuerySchema,
  publicListSlotsQuerySchema,
  publicOriginHeadersSchema,
  publicSendChatMessageRequestSchema,
  publicSlotPageSchema,
  publicSlotSchema,
  publicStartChatRequestSchema,
  publicStartChatResponseSchema,
  publishedInstructionsSchema,
  qualificationAnswerSchema,
  qualificationQuestionIdSchema,
  qualificationQuestionKindSchema,
  qualificationQuestionPageSchema,
  qualificationQuestionParamsSchema,
  qualificationQuestionSchema,
  qualificationSchema,
  qualificationValueSchema,
  questionPromptSchema,
  questionSuggestionsSchema,
  rampSchema,
  rateIntervalSchema,
  rateValueSchema,
  rawLinkedinUrlSchema,
  rawPhoneSchema,
  recordConsentRequestSchema,
  recordDeliveryFailureRequestSchema,
  recordNoteRequestSchema,
  recordWithdrawalRequestSchema,
  recordedConsentSchema,
  recordedSuppressionSchema,
  recordingKeySchema,
  recordingPlaybackSchema,
  regenerateDraftRequestSchema,
  regionSchema,
  rejectDraftRequestSchema,
  rejectSuggestionRequestSchema,
  removeEnrollmentRequestSchema,
  removeSuppressionRequestSchema,
  renameOrganizationRequestSchema,
  renameTeamRequestSchema,
  reorderQualificationQuestionsRequestSchema,
  reorderRoutingRulesRequestSchema,
  repChangeAllowed,
  repChoiceSchema,
  repChoiceSuits,
  repTaskStepSchema,
  repTaskTypeSchema,
  replyClassifiedEvent,
  replyLabelSchema,
  replyRequestSchema,
  requestIdSchema,
  rescheduleBookingRequestSchema,
  researchBriefSchema,
  resolveCitationsRequestSchema,
  resolveCitationsResponseSchema,
  resolvedCitationSchema,
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
  rotateSignalWebhookResponseSchema,
  routeRequestSchema,
  routingAttributesSchema,
  routingCandidateReasonSchema,
  routingConditionsSchema,
  routingDecisionIdSchema,
  routingResultSchema,
  routingRuleIdSchema,
  routingRuleParamsSchema,
  routingRuleSchema,
  routingSkipReasonSchema,
  routingTargetSchema,
  runSetCountsSchema,
  runStatusSchema,
  runtimeAgentKind,
  saveInstructionVersionRequestSchema,
  searchDocumentsRequestSchema,
  searchDocumentsResponseSchema,
  searchEvidenceSchema,
  searchMomentsRequestSchema,
  searchMomentsResponseSchema,
  searchTurnSchema,
  sendCheckResultSchema,
  sendCheckSchema,
  sendCursorSchema,
  sendIdSchema,
  sendKeySchema,
  sendKeyToString,
  sendPageSchema,
  sendParamsSchema,
  sendRecordSchema,
  sendRefusalReasonSchema,
  sendStateSchema,
  sendTryMessageRequestSchema,
  sendWindowSchema,
  sequenceProblemCodeSchema,
  sequenceProblemSchema,
  sequenceSchema,
  sequenceStepsSchema,
  seriesLineSchema,
  seriesPointSchema,
  setAgentControlRequestSchema,
  setAgentSettingsRequestSchema,
  setAgentsPausedRequestSchema,
  setApprovalPolicyRequestSchema,
  setBrandVoiceRequestSchema,
  setBudgetRequestSchema,
  setCallRepRequestSchema,
  setCopilotSettingsRequestSchema,
  setDealOutcomeRequestSchema,
  setInquiryEmbedRequestSchema,
  setMailboxLimitsRequestSchema,
  setProspectOwnerRequestSchema,
  setProviderRequestSchema,
  setSequenceRequestSchema,
  setSignalSettingsRequestSchema,
  setWaterfallRequestSchema,
  signalIdSchema,
  signalKindSchema,
  signalKindSettingSchema,
  signalRecordedEvent,
  signalSchema,
  signalSettingsSchema,
  signalSourceSchema,
  signalWebhookRequestSchema,
  signalWebhookResponseSchema,
  signalWebhookSecretSchema,
  signalWebhookStateSchema,
  skipConditionSchema,
  skipOperatorSchema,
  slotPageSchema,
  slotSchema,
  softphoneTokenSchema,
  sourceFlagSchema,
  sourceKindSchema,
  sourcePassageSchema,
  sourcePerformanceSchema,
  sourceRefSchema,
  sourceSchema,
  sourceUrlSchema,
  speakerExcerpt,
  speakerExcerptSchema,
  speakerLabelSchema,
  spendEntrySchema,
  startCalendarConnectionRequestSchema,
  startCalendarConnectionResponseSchema,
  startLinkedinConnectionRequestSchema,
  startLinkedinConnectionResponseSchema,
  startMailboxConnectRequestSchema,
  startTrySessionRequestSchema,
  stepKeySchema,
  stepKindSchema,
  stepSchema,
  stepSentEvent,
  stepTextSchema,
  stepVariantResultsSchema,
  stepVariantsParamsSchema,
  stopReasonSchema,
  storedNameSchema,
  strictAuditActorSchema,
  strictAuditContentShape,
  strictAuditSubjectSchema,
  submitSendRequestSchema,
  suggestedQualificationQuestionSchema,
  suggestionIdSchema,
  suggestionKindSchema,
  suggestionProvenanceSchema,
  suggestionSchema,
  suggestionStatusSchema,
  suggestionTextSchema,
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
  tableCsvQuerySchema,
  tableRowSchema,
  teamIdSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamNameSchema,
  teamParamsSchema,
  teamSchema,
  testRoutingRequestSchema,
  timeOfDaySchema,
  timeZoneSchema,
  timestampSchema,
  toReplyLabel,
  touchIdSchema,
  touchSchema,
  transcriptCursorSchema,
  transcriptPageSchema,
  transcriptSpeakerSchema,
  transcriptTurnSchema,
  tryReplySchema,
  trySessionIdSchema,
  trySessionParamsSchema,
  trySessionSchema,
  unsubscribePageSchema,
  unsubscribeParamsSchema,
  unsubscribePreviewSchema,
  unsubscribeReceiptSchema,
  unsubscribeResultSchema,
  unsubscribeTokenSchema,
  updateBookingTypeRequestSchema,
  updateCampaignRequestSchema,
  updateConsentWordingRequestSchema,
  updateFitCriterionRequestSchema,
  updateLinkedinAccountLimitsRequestSchema,
  updateLinkedinSettingsRequestSchema,
  updateProspectCompanyRequestSchema,
  updateProspectRequestSchema,
  updateQualificationQuestionRequestSchema,
  updateRoutingRuleRequestSchema,
  uploadCallFieldsSchema,
  uploadCallFileSchema,
  uploadDocumentFileSchema,
  userIdSchema,
  variantGroupSchema,
  variantParamsSchema,
  variantPromotedEvent,
  variantResultSchema,
  variantResultStatusSchema,
  variantSchema,
  vendorTextSchema,
  verificationReasonSchema,
  verificationStatusSchema,
  verifyApiKeyRequestSchema,
  verifyApiKeyResponseSchema,
  verifyAuditQuerySchema,
  verifyAuditResponseSchema,
  voiceAgentCallEndedEvent,
  voiceCallCursorSchema,
  voiceCallDirectionSchema,
  voiceCallEndedBySchema,
  voiceCallEndedEvent,
  voiceCallFailureReasonSchema,
  voiceCallOutcomeSchema,
  voiceCallPageSchema,
  voiceCallParamsSchema,
  voiceCallSchema,
  voiceCallStartedEvent,
  voiceCallStateSchema,
  voiceConsentRevokedEvent,
  voiceCopilotCardRatedEvent,
  voiceCopilotCardShownEvent,
  voiceHandoffCompletedEvent,
  voiceInquiryReceivedEvent,
  voiceRecordingStateSchema,
  voiceTranscriptStateSchema,
  waitStepSchema,
  waterfallOrderSchema,
  waterfallSchema,
  weekdaySchema,
  windowZoneSchema,
  withdrawConsentRequestSchema,
  workingDaySchema,
  workingWindowSchema,
  wrapUpNoteSchema,
  wrapUpRequestSchema
};
