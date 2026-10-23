import { type InboundRoute, inboundRoute } from '../inbound-route'
import type { AgentErrorCode } from './errors'

/** The Agent runtime route names. */
export type AgentRuntimeRouteName = 'getAgentRuntimeConfig'

/** One Agent runtime route. */
export type AgentRuntimeRoute = InboundRoute<AgentErrorCode>

/**
 * The route the voice and outbound services call to run an Agent (spec M16). Internal: served on
 * the internal network only, called with a service token.
 */
export const AGENT_RUNTIME_ROUTES: Readonly<Record<AgentRuntimeRouteName, AgentRuntimeRoute>> =
  Object.freeze({
    getAgentRuntimeConfig: inboundRoute({
      method: 'GET',
      path: '/internal/v1/agent/runtime-config',
      roles: [],
      internal: true,
      serviceToken: { audiences: ['voice', 'outbound'] },
      etag: true,
      success: [200, 304],
      idempotent: false,
      errors: ['agent.no_published_instructions'],
      commonErrors: ['auth.unauthenticated', 'auth.forbidden', 'server.unavailable'],
      description:
        "Internal: a service reads what it needs to run an Agent in one answer: the published instruction version id and text, the controls (default and per-channel) and whether the Agent is paused. The Organization is the service token's subject, never a path, query or body field. Only a service token whose audience is voice (the Inbound Agent) or outbound (the Outbound Agent) may call it; the audience also picks the Agent kind, and any other caller, including a user token, is auth.forbidden (403). An Organization with no published version is agent.no_published_instructions (409): the caller must fail closed and start no conversation. The answer carries an ETag, opaque, that changes when the published version, the controls or the pause change, and Cache-Control: private, no-cache so every call is revalidated; a caller that sends it back in If-None-Match gets 304 with no body while nothing changed. Conversations under way finish on the version they started with. Instructions sit beneath the fixed rules (Contact Consent, the AI and recording disclosure, suppression) and can never override them; nothing here turns any of them off (ADR 0003). The text is never logged.",
    }),
  })
