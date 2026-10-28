import { z } from 'zod'
import {
  callEndReasonSchema,
  callResultSchema,
  MAX_CALL_ATTEMPTS,
  MIN_CALL_RETRY_HOURS,
} from '../agent-call/values'
import { timestampSchema } from '../core/values'
import { campaignIdSchema, lineIdSchema } from '../ids'
import {
  goalSchema,
  hoursSchema,
  MAX_SEQUENCE_STEPS,
  stepKeySchema,
  stepTextSchema,
} from './values'
import { variantGroupSchema } from './variant'

/** The kinds of Step this release has. A new kind is a new member of {@link stepSchema}; none changes. */
export const STEP_KINDS = ['email', 'wait', 'branch', 'rep_task', 'call', 'end'] as const

/** A kind of Step. */
export const stepKindSchema = z.enum(STEP_KINDS)

/** A kind of Step. */
export type StepKind = z.infer<typeof stepKindSchema>

/**
 * An email Step: send one email toward a `goal`, optionally as a test of two to four Variants,
 * then go to `next`. Message text is drafted per Prospect from the goal and the Variant's angle.
 */
export const emailStepSchema = z.strictObject({
  kind: z.literal('email'),
  key: stepKeySchema,
  goal: goalSchema,
  variants: variantGroupSchema.nullable(),
  next: stepKeySchema,
})

/** A wait: nothing happens for `waitHours` (1 to 2,160), then go to `next`. */
export const waitStepSchema = z.strictObject({
  kind: z.literal('wait'),
  key: stepKeySchema,
  waitHours: hoursSchema,
  next: stepKeySchema,
})

/**
 * What a branch may test. Only recorded events and elapsed time are available: `out_of_office`
 * (an automatic reply said the Prospect is away), `no_response` (no reply `afterHours` after the
 * last email), `task_completed` and `task_skipped` (the outcome of the Rep task before it),
 * `call_result` (the Call result of the call Step before it) and `call_end_reason` (why an
 * answered Call ended, such as `booked` or `opted_out`). A
 * reply, a bounce, an unsubscribe or a suppression is never a condition: each stops the
 * Enrollment. There is no condition on opens or clicks, because nothing is tracked.
 */
export const branchConditionSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('out_of_office') }),
  z.strictObject({ kind: z.literal('no_response'), afterHours: hoursSchema }),
  z.strictObject({ kind: z.literal('task_completed') }),
  z.strictObject({ kind: z.literal('task_skipped') }),
  z.strictObject({ kind: z.literal('call_result'), result: callResultSchema }),
  z.strictObject({ kind: z.literal('call_end_reason'), endReason: callEndReasonSchema }),
])

/** What a branch may test. */
export type BranchCondition = z.infer<typeof branchConditionSchema>

/** One arm of a branch: when the condition holds, go to `next`. */
export const branchArmSchema = z.strictObject({
  condition: branchConditionSchema,
  next: stepKeySchema,
})

/** The most arms one branch has, besides its default. */
export const MAX_BRANCH_ARMS = 5

/**
 * A branch: the arms are tried in order and the first whose condition holds is taken; when none
 * does, `default` is. `default` is required, so a branch always leads somewhere.
 */
export const branchStepSchema = z.strictObject({
  kind: z.literal('branch'),
  key: stepKeySchema,
  arms: z.array(branchArmSchema).min(1).max(MAX_BRANCH_ARMS),
  default: stepKeySchema,
})

/** The kinds of work a Rep task asks for. The Agent never cold-calls (ADR 0003), so a call is a task for a person. */
export const REP_TASK_TYPES = ['call', 'manual_message', 'research', 'other'] as const

/** The kind of work a Rep task asks for. */
export const repTaskTypeSchema = z.enum(REP_TASK_TYPES)

/** The kind of work a Rep task asks for. */
export type RepTaskType = z.infer<typeof repTaskTypeSchema>

/**
 * A task for the Prospect's owner (a Rep): do `task`, as `instruction` says, within `dueInHours`
 * (1 to 2,160), then go to `next` whether it was done or skipped. A following branch may test which.
 */
export const repTaskStepSchema = z.strictObject({
  kind: z.literal('rep_task'),
  key: stepKeySchema,
  task: repTaskTypeSchema,
  instruction: stepTextSchema,
  dueInHours: hoursSchema,
  next: stepKeySchema,
})

/**
 * A call Step: the Outbound Agent phones the Prospect toward `goal`, from `lineId` (null: the
 * Organization's default outbound Line), then goes to `next` once the Call result is final. A
 * result that retries (`no_answer`, `busy`, `voicemail`, `failed`) is tried again after
 * `retryAfterHours` (4 to 2,160; default 4) up to `maxAttempts` (1 to 3; default 3) in all. A
 * Contact Consent for the phone channel is checked on every attempt and cannot be waived
 * (ADR 0003). A branch after the Step tests the result.
 */
export const callStepSchema = z.strictObject({
  kind: z.literal('call'),
  key: stepKeySchema,
  goal: goalSchema,
  lineId: lineIdSchema.nullable(),
  maxAttempts: z.number().int().min(1).max(MAX_CALL_ATTEMPTS).default(MAX_CALL_ATTEMPTS),
  retryAfterHours: hoursSchema.min(MIN_CALL_RETRY_HOURS).default(MIN_CALL_RETRY_HOURS),
  next: stepKeySchema,
})

/** The end: the Enrollment completes. */
export const endStepSchema = z.strictObject({
  kind: z.literal('end'),
  key: stepKeySchema,
})

/** One Step of a Sequence, by kind. */
export const stepSchema = z.discriminatedUnion('kind', [
  emailStepSchema,
  waitStepSchema,
  branchStepSchema,
  repTaskStepSchema,
  callStepSchema,
  endStepSchema,
])

/** One Step of a Sequence. */
export type Step = z.infer<typeof stepSchema>

/**
 * Why a Sequence is not valid, a closed set: `duplicate_key` (two Steps share a key),
 * `unknown_target` (a `next`, arm or default names no Step), `unreachable_step` (no path from the
 * first Step leads to it), `cycle_without_wait` (a loop that never passes a wait, so it would run
 * without pause) and `no_path_to_end` (a reachable Step cannot lead to an end, so an Enrollment
 * could never finish).
 */
export const SEQUENCE_PROBLEMS = [
  'duplicate_key',
  'unknown_target',
  'unreachable_step',
  'cycle_without_wait',
  'no_path_to_end',
] as const

/** Why a Sequence is not valid. */
export const sequenceProblemCodeSchema = z.enum(SEQUENCE_PROBLEMS)

/** Why a Sequence is not valid. */
export type SequenceProblemCode = z.infer<typeof sequenceProblemCodeSchema>

/** One problem found in a Sequence and the Step it concerns. */
export const sequenceProblemSchema = z.strictObject({
  code: sequenceProblemCodeSchema,
  stepKey: stepKeySchema,
})

/** One problem found in a Sequence. */
export type SequenceProblem = z.infer<typeof sequenceProblemSchema>

/** The most problems an `campaign.invalid_sequence` error lists. */
export const MAX_SEQUENCE_PROBLEMS = 50

/** What `campaign.invalid_sequence` carries in `details`: the problems found, at most 50. */
export const invalidSequenceDetailsSchema = z.strictObject({
  problems: z.array(sequenceProblemSchema).min(1).max(MAX_SEQUENCE_PROBLEMS),
})

/** What `campaign.invalid_sequence` carries in `details`. */
export type InvalidSequenceDetails = z.infer<typeof invalidSequenceDetailsSchema>

/** The Steps a Step can go to next, by key. */
function targetsOf(step: Step): readonly string[] {
  switch (step.kind) {
    case 'email':
    case 'wait':
    case 'rep_task':
    case 'call':
      return [step.next]
    case 'branch':
      return [...step.arms.map((arm) => arm.next), step.default]
    case 'end':
      return []
  }
}

/** Walks the graph from `from` over `edges`, returning every key reached, `from` included. */
function reach(
  from: readonly string[],
  edges: ReadonlyMap<string, readonly string[]>
): Set<string> {
  const seen = new Set<string>(from)
  const stack = [...from]
  while (stack.length > 0) {
    const key = stack.pop() as string
    for (const next of edges.get(key) ?? []) {
      if (!seen.has(next)) {
        seen.add(next)
        stack.push(next)
      }
    }
  }
  return seen
}

/** The keys that sit on a loop of Steps none of which is a wait. */
function keysOnWaitlessCycles(steps: readonly Step[], known: ReadonlySet<string>): Set<string> {
  const waitless = new Map<string, readonly string[]>()
  for (const step of steps) {
    if (step.kind !== 'wait') {
      waitless.set(
        step.key,
        targetsOf(step).filter((t) => known.has(t) && !isWait(steps, t))
      )
    }
  }
  // A key is on a cycle when it can reach itself through at least one edge.
  const onCycle = new Set<string>()
  for (const [key, outs] of waitless) {
    if (reach(outs, waitless).has(key)) {
      onCycle.add(key)
    }
  }
  return onCycle
}

function isWait(steps: readonly Step[], key: string): boolean {
  return steps.some((s) => s.key === key && s.kind === 'wait')
}

/**
 * Finds what makes a list of Steps an invalid Sequence, without throwing. The first Step is where
 * every Enrollment starts. Pure and bounded (at most 50 Steps), so a service may call it on every
 * save.
 */
export function findSequenceProblems(steps: readonly Step[]): SequenceProblem[] {
  const problems: SequenceProblem[] = []
  const add = (code: SequenceProblemCode, stepKey: string) => {
    if (!problems.some((p) => p.code === code && p.stepKey === stepKey)) {
      problems.push({ code, stepKey })
    }
  }
  const known = new Set<string>()
  for (const step of steps) {
    if (known.has(step.key)) {
      add('duplicate_key', step.key)
    }
    known.add(step.key)
  }
  const edges = new Map<string, readonly string[]>()
  for (const step of steps) {
    const valid: string[] = []
    for (const target of targetsOf(step)) {
      if (known.has(target)) {
        valid.push(target)
      } else {
        add('unknown_target', step.key)
      }
    }
    edges.set(step.key, valid)
  }
  const first = steps[0]
  if (first === undefined) {
    return problems
  }
  const reachable = reach([first.key], edges)
  for (const step of steps) {
    if (!reachable.has(step.key)) {
      add('unreachable_step', step.key)
    }
  }
  for (const key of keysOnWaitlessCycles(steps, known)) {
    add('cycle_without_wait', key)
  }
  const reverse = new Map<string, string[]>()
  for (const [from, outs] of edges) {
    for (const to of outs) {
      reverse.set(to, [...(reverse.get(to) ?? []), from])
    }
  }
  const ends = steps.filter((s) => s.kind === 'end').map((s) => s.key)
  const canEnd = reach(ends, reverse)
  for (const step of steps) {
    if (reachable.has(step.key) && !canEnd.has(step.key)) {
      add('no_path_to_end', step.key)
    }
  }
  return problems.slice(0, MAX_SEQUENCE_PROBLEMS)
}

/**
 * The Steps of a Sequence: 1 to 50, the first being where every Enrollment starts, and a graph
 * with no unknown target, no unreachable Step, no loop without a wait and no Step that cannot
 * reach an end. A Step's position in this list is the `step` number in its send key.
 */
export const sequenceStepsSchema = z
  .array(stepSchema)
  .min(1)
  .max(MAX_SEQUENCE_STEPS)
  .superRefine((steps, ctx) => {
    for (const problem of findSequenceProblems(steps)) {
      ctx.addIssue({
        code: 'custom',
        path: [steps.findIndex((s) => s.key === problem.stepKey)],
        message: `${problem.code}: ${problem.stepKey}`,
      })
    }
  })

/** The body that sets a Campaign's Sequence: the Steps, and the version the caller edited (`campaign.sequence_version_conflict` when it is not the latest). */
export const setSequenceRequestSchema = z.strictObject({
  expectedVersion: z.number().int().min(0).max(1_000_000),
  steps: sequenceStepsSchema,
})

/** The body that sets a Campaign's Sequence. */
export type SetSequenceRequest = z.infer<typeof setSequenceRequestSchema>

/** A saved Sequence: the Campaign's Steps at one `version`; every save makes the next. Version 0 is the empty Sequence of a new Campaign, which has no Steps and cannot launch. */
export const sequenceSchema = z.strictObject({
  campaignId: campaignIdSchema,
  version: z.number().int().min(0).max(1_000_000),
  steps: z.array(stepSchema).max(MAX_SEQUENCE_STEPS),
  updatedAt: timestampSchema,
})

/** A saved Sequence. */
export type Sequence = z.infer<typeof sequenceSchema>
