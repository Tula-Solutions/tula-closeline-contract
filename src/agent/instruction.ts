import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { agentInstructionVersionIdSchema, membershipIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/** The kinds of Agent that take written instructions. A closed list. */
export const AGENT_KINDS = ['inbound', 'outbound'] as const

/** The kind of an Agent: Inbound or Outbound. */
export const agentKindSchema = z.enum(AGENT_KINDS)

/** The kind of an Agent. */
export type AgentKind = z.infer<typeof agentKindSchema>

/** The longest Agent instructions, in characters. A longer text is `agent.instruction_too_long`. */
export const MAX_AGENT_INSTRUCTION_LENGTH = 20_000

/**
 * The longest instructions text a request may carry, in characters. It is a guard on the wire only:
 * a text between this limit and {@link MAX_AGENT_INSTRUCTION_LENGTH} is the domain error
 * `agent.instruction_too_long` (422), not a bad request.
 */
export const MAX_AGENT_INSTRUCTION_REQUEST_LENGTH = 40_000

/** The state of an instruction version: saved as a draft, or the one an Agent runs under. */
export const INSTRUCTION_STATES = ['draft', 'published'] as const

/** The state of an instruction version. */
export const instructionStateSchema = z.enum(INSTRUCTION_STATES)

/** The state of an instruction version. */
export type InstructionState = z.infer<typeof instructionStateSchema>

/** Whether a character is a control character other than a tab or a line break. */
function isBadControl(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) || code === 0x7f
}

const instructionTextSchema = z
  .string()
  .min(1)
  .refine((text) => ![...text].some(isBadControl), {
    message: 'No control characters other than line breaks and tabs',
  })

/**
 * The body of a request to save instructions as a new draft version. The text is plain; it sits
 * beneath the fixed rules (Contact Consent, disclosure, suppression) and cannot override them
 * (ADR 0003). More than 20,000 characters is `agent.instruction_too_long`. Unknown fields are refused.
 */
export const saveInstructionVersionRequestSchema = z.strictObject({
  text: instructionTextSchema.max(MAX_AGENT_INSTRUCTION_REQUEST_LENGTH),
})

/** The body of a request to save instructions as a new draft version. */
export type SaveInstructionVersionRequest = z.infer<typeof saveInstructionVersionRequestSchema>

const versionShape = {
  id: agentInstructionVersionIdSchema,
  agentKind: agentKindSchema,
  number: z.number().int().min(1),
  state: instructionStateSchema,
  authorMembershipId: membershipIdSchema.nullable(),
  createdAt: timestampSchema,
  publishedAt: timestampSchema.nullable(),
}

/**
 * One instruction version: immutable once saved, numbered from 1 per Organization and Agent kind.
 * Only `state` and `publishedAt` ever change, when the version is published; the text never does.
 */
export const instructionVersionSchema = z.object({
  ...versionShape,
  text: instructionTextSchema.max(MAX_AGENT_INSTRUCTION_LENGTH),
})

/** One instruction version. */
export type InstructionVersion = z.infer<typeof instructionVersionSchema>

/** An instruction version without its text, for a list. */
export const instructionVersionSummarySchema = z.object({
  ...versionShape,
  length: z.number().int().min(1).max(MAX_AGENT_INSTRUCTION_LENGTH),
})

/** An instruction version without its text. */
export type InstructionVersionSummary = z.infer<typeof instructionVersionSummarySchema>

/** The query of an instruction version list: cursor and limit (at most 100). */
export const listInstructionVersionsQuerySchema = pageQuerySchema

/** One page of instruction versions without their text, newest first. */
export const listInstructionVersionsResponseSchema = pageSchema(instructionVersionSummarySchema)

/** The published instructions of an Agent kind: the version, or none yet (the Agent then runs on the fixed rules and the Playbook alone). */
export const publishedInstructionsSchema = z.object({
  agentKind: agentKindSchema,
  version: instructionVersionSchema.nullable(),
})

/** The published instructions of an Agent kind. */
export type PublishedInstructions = z.infer<typeof publishedInstructionsSchema>

/** The version numbers of a diff, as digits in the query. */
const versionNumberQuery = z
  .union([z.number(), z.string().regex(/^\d{1,9}$/)])
  .transform((value) => Number(value))
  .pipe(z.number().int().min(1))

/** The query of a diff between two versions of one Agent kind. */
export const diffInstructionVersionsQuerySchema = z.object({
  from: versionNumberQuery,
  to: versionNumberQuery,
})

/** The lines of a diff: unchanged, added in the later version or removed from the earlier. */
export const DIFF_LINE_KINDS = ['same', 'added', 'removed'] as const

/** The most lines of a diff: instructions are short, and a diff is not paginated. */
export const MAX_DIFF_LINES = 2 * MAX_AGENT_INSTRUCTION_LENGTH

/** The line-by-line difference between two instruction versions. */
export const instructionDiffSchema = z.object({
  agentKind: agentKindSchema,
  from: z.number().int().min(1),
  to: z.number().int().min(1),
  lines: z
    .array(
      z.object({
        kind: z.enum(DIFF_LINE_KINDS),
        text: z.string().max(MAX_AGENT_INSTRUCTION_LENGTH),
      })
    )
    .max(MAX_DIFF_LINES),
})

/** The line-by-line difference between two instruction versions. */
export type InstructionDiff = z.infer<typeof instructionDiffSchema>
