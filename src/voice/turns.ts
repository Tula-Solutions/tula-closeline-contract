import { z } from 'zod'

/** The most turns a transcript window may reach on each side of the asked-for turn. */
export const MAX_TURN_WINDOW = 20

/** One turn of a Call's Transcript. The text is tenant speech: personal data, untrusted, never logged. */
export const callTurnSchema = z.object({
  index: z.number().int().min(0),
  role: z.enum(['prospect', 'agent']),
  text: z.string(),
})
/** One turn of a Call's Transcript. */
export type CallTurn = z.infer<typeof callTurnSchema>

/** The turns around the asked-for one, oldest first; clipped at the Call's first and last turn. */
export const callTurnsResponseSchema = z.object({
  around: z.number().int().min(0),
  turns: z.array(callTurnSchema).max(2 * MAX_TURN_WINDOW + 1),
})
/** The turns around the asked-for one. */
export type CallTurnsResponse = z.infer<typeof callTurnsResponseSchema>
