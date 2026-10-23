import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { AgentErrorCode } from './errors'

/** The roles that read Agent instructions and controls. */
export const AGENT_CONTROL_READ_ROLES = [
  'owner',
  'admin',
  'manager',
] as const satisfies readonly Role[]

/** The roles that save and publish instructions and change controls. */
export const AGENT_CONTROL_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The Agent instruction and control route names. */
export type AgentControlRouteName =
  | 'listInstructionVersions'
  | 'getPublishedInstructions'
  | 'getInstructionVersion'
  | 'diffInstructionVersions'
  | 'saveInstructionVersion'
  | 'publishInstructionVersion'
  | 'listAgentControls'
  | 'setAgentControl'
  | 'getAgentsPaused'
  | 'setAgentsPaused'

/** One Agent instruction or control route. */
export type AgentControlRoute = InboundRoute<AgentErrorCode>

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

const FIXED_RULES =
  'Instructions sit beneath the fixed rules (Contact Consent, the AI and recording disclosure, suppression) and can never override them; nothing here turns any of them off (ADR 0003).'

/**
 * The Agent instruction versions and control settings routes (spec M16). They cover the Inbound
 * and the Outbound Agent, keyed by kind. Every change is audited.
 */
export const AGENT_CONTROL_ROUTES: Readonly<Record<AgentControlRouteName, AgentControlRoute>> =
  Object.freeze({
    listInstructionVersions: inboundRoute({
      method: 'GET',
      path: '/v1/agent-instructions/{agentKind}/versions',
      roles: AGENT_CONTROL_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        'Lists the instruction versions of an Agent kind (inbound or outbound), newest first, one cursor-paginated page at a time (at most 100). Each row shows its number, state, author and length, not the text. Owner, Admin and Manager.',
    }),
    getPublishedInstructions: inboundRoute({
      method: 'GET',
      path: '/v1/agent-instructions/{agentKind}/published',
      roles: AGENT_CONTROL_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: [],
      description: `Reads the published instructions of an Agent kind, or version null when none was published (the Agent then runs on the fixed rules and the Playbook alone). ${FIXED_RULES} Owner, Admin and Manager.`,
    }),
    getInstructionVersion: inboundRoute({
      method: 'GET',
      path: '/v1/agent-instructions/{agentKind}/versions/{versionNumber}',
      roles: AGENT_CONTROL_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: ['agent.version_not_found'],
      commonErrors: [],
      description:
        'Reads one instruction version with its text. A version of another Organization or Agent kind is agent.version_not_found (404). Owner, Admin and Manager.',
    }),
    diffInstructionVersions: inboundRoute({
      method: 'GET',
      path: '/v1/agent-instructions/{agentKind}/diff',
      roles: AGENT_CONTROL_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: ['agent.version_not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Compares two instruction versions of one Agent kind (query from and to, version numbers) line by line, each line marked same, added or removed. Instructions are at most 20,000 characters, so the diff is one bounded answer and not paginated. Owner, Admin and Manager.',
    }),
    saveInstructionVersion: inboundRoute({
      method: 'POST',
      path: '/v1/agent-instructions/{agentKind}/versions',
      roles: AGENT_CONTROL_ADMIN_ROLES,
      success: [201, 200],
      idempotent: true,
      keyRequired: true,
      errors: ['agent.instruction_too_long'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Saves instructions as a new draft version; it does not change what the Agent runs until published. Text over 20,000 characters is agent.instruction_too_long (422). ${FIXED_RULES} ${KEY} Owner and Admin only. The save is audited.`,
    }),
    publishInstructionVersion: inboundRoute({
      method: 'POST',
      path: '/v1/agent-instructions/{agentKind}/versions/{versionNumber}/publish',
      roles: AGENT_CONTROL_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['agent.version_not_found'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Publishes a version: new conversations use it from then on, those under way finish on the version they started with. Publishing an earlier version is the rollback. A version already published answers 200 unchanged. ${FIXED_RULES} ${KEY} Owner and Admin only. The publication is audited.`,
    }),
    listAgentControls: inboundRoute({
      method: 'GET',
      path: '/v1/agent-controls',
      roles: AGENT_CONTROL_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        'Lists the control settings (control level, send window and escalation rules) of each Agent kind: its default and its per-channel overrides, one cursor-paginated page at a time (at most 100), optionally for one kind. Owner, Admin and Manager.',
    }),
    setAgentControl: inboundRoute({
      method: 'PUT',
      path: '/v1/agent-controls/{agentKind}/{channel}',
      roles: AGENT_CONTROL_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['agent.settings_invalid'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Replaces the controls of an Agent kind on one channel (phone, sms, whatsapp, email, linkedin, or default for the kind's fallback): control level (supervised, assisted or autonomous), send window and escalation rules. A window that is not usable is agent.settings_invalid (422). The send window can only narrow the fixed calling window and quiet hours. There is no field for Contact Consent, the AI and recording disclosure or suppression: they have no setting (ADR 0003), and an unknown field is refused. ${KEY} Owner and Admin only. The change is audited.`,
    }),
    getAgentsPaused: inboundRoute({
      method: 'GET',
      path: '/v1/agent-controls/organization-pause',
      roles: AGENT_CONTROL_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: [],
      description:
        'Reads whether every Agent of the Organization is paused, when it last changed and by whom. Owner, Admin and Manager.',
    }),
    setAgentsPaused: inboundRoute({
      method: 'PUT',
      path: '/v1/agent-controls/organization-pause',
      roles: AGENT_CONTROL_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: [],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Pauses or resumes every Agent of the Organization at once: a paused Agent starts no conversation and sends nothing, and one under way hands over. ${KEY} Owner and Admin only. The change is audited.`,
    }),
  })
