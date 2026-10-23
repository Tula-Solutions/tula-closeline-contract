import { z } from 'zod'

/** The voices an Organization may choose for its Inbound Agent: a closed list of stock styles, never a clone of a person. */
export const AGENT_VOICE_STYLES = ['warm', 'neutral', 'crisp'] as const

/** The voice style of the Inbound Agent. */
export const agentVoiceStyleSchema = z.enum(AGENT_VOICE_STYLES)

/** The voice style of the Inbound Agent. */
export type AgentVoiceStyle = z.infer<typeof agentVoiceStyleSchema>

/** The languages the Inbound Agent speaks in this release: English only. Read-only. */
export const AGENT_LANGUAGES = ['en'] as const

/** The language of the Inbound Agent. */
export const agentLanguageSchema = z.enum(AGENT_LANGUAGES)

/** The longest the Inbound Agent may stay on one Call, whatever the setting, in seconds. */
export const MAX_AGENT_CALL_SECONDS = 1800

/** The default cap on one Inbound Agent Call, in seconds. */
export const DEFAULT_AGENT_CALL_SECONDS = 600

/** The highest cost cap on one Inbound Agent Call, in US cents. */
export const MAX_AGENT_CALL_COST_USD_CENTS = 5000

/** The highest number of Inbound Agent Calls one Organization may run at once. */
export const MAX_AGENT_CONCURRENCY = 50

/** The longest greeting, in characters. The Disclosure is spoken before it and is not part of it. */
export const MAX_AGENT_GREETING_LENGTH = 500

/**
 * The hours, in the Prospect's local time, outside which the Inbound Agent never places a callback.
 * Fixed in the contract, not a setting: an Organization's own hours can only narrow it.
 */
export const AGENT_CALLING_WINDOW = { startHour: 8, endHour: 21 } as const

/** The tools the Inbound Agent may call during a Call or Chat. A closed list: none turns off the Disclosure or the consent check. */
export const AGENT_TOOLS = [
  'record_answer',
  'find_slots',
  'book',
  'hand_off',
  'end_call',
  'revoke_consent',
] as const

/** The name of a tool the Inbound Agent may call. */
export const agentToolNameSchema = z.enum(AGENT_TOOLS)

/** The name of a tool the Inbound Agent may call. */
export type AgentToolName = z.infer<typeof agentToolNameSchema>

/** The most Playbook passages one turn may cite. */
export const MAX_TURN_SOURCES = 10

/** The most turns of context a Rep gets with a Handoff. */
export const MAX_HANDOFF_CONTEXT_TURNS = 20

/** The longest text of one turn, in characters. */
export const MAX_TURN_TEXT_LENGTH = 2000
