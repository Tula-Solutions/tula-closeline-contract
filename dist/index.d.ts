import { ErrorDefinition as ErrorDefinition_8gwh45 } from "..";
/**
* The errors the Inbound Agent routes return, as `area.reason` codes. A role that is not allowed is
* the common `auth.forbidden`. A Handoff, question or try-it session of another Organization, or one
* the caller may not see, is the `*.not_found` code (404, never 403). `call.not_found` is the
* existing code from the Playbook registry and is not registered again here.
*
* - `agent.paused` (409): the Inbound Agent is paused, so no callback is placed and no Call is
*   answered by it. Returned by an action that would have made it act.
* - `agent.consent_required` (409): there is no Contact Consent for the channel, or it was revoked.
*   The Agent never acts without one, and there is no setting that changes that (ADR 0003).
* - `agent.outside_hours` (409): now is outside the hours the Agent may call, in the Prospect's time.
* - `agent.question_invalid` (422): a Qualification question refers to an unknown question or its
*   skip logic loops.
* - `agent.question_not_found` (404): the Qualification question is unknown.
* - `agent.settings_invalid` (422): the hours, caps or greeting are not usable.
* - `agent.not_enough_deals` (409): too few won Deals to suggest Qualification questions from.
* - `agent.session_not_found` (404): the try-it session is unknown, expired or not the caller's.
* - `handoff.no_rep_available` (409): no Rep could take the Handoff. The Agent then offers a
*   Booking instead.
* - `handoff.not_found` (404): the Handoff is unknown or not the caller's.
* - `handoff.not_pending` (409): the Handoff is no longer waiting for an answer (taken by another
*   Rep, declined, timed out or finished).
*/
declare const AGENT_ERRORS: {
	readonly "agent.consent_required": ErrorDefinition_8gwh45<"agent.consent_required">;
	readonly "agent.not_enough_deals": ErrorDefinition_8gwh45<"agent.not_enough_deals">;
	readonly "agent.outside_hours": ErrorDefinition_8gwh45<"agent.outside_hours">;
	readonly "agent.paused": ErrorDefinition_8gwh45<"agent.paused">;
	readonly "agent.question_invalid": ErrorDefinition_8gwh45<"agent.question_invalid">;
	readonly "agent.question_not_found": ErrorDefinition_8gwh45<"agent.question_not_found">;
	readonly "agent.session_not_found": ErrorDefinition_8gwh45<"agent.session_not_found">;
	readonly "agent.settings_invalid": ErrorDefinition_8gwh45<"agent.settings_invalid">;
	readonly "handoff.no_rep_available": ErrorDefinition_8gwh45<"handoff.no_rep_available">;
	readonly "handoff.not_found": ErrorDefinition_8gwh45<"handoff.not_found">;
	readonly "handoff.not_pending": ErrorDefinition_8gwh45<"handoff.not_pending">;
};
/** An Inbound Agent error code. */
type AgentErrorCode = keyof typeof AGENT_ERRORS;
import { z } from "zod";
/** How an Inbound Agent Call ended. */
declare const AGENT_CALL_OUTCOMES: readonly ["completed", "booked", "handed_off", "prospect_stopped", "failed"];
/** How an Inbound Agent Call ended. */
declare const agentCallOutcomeSchema: z.ZodEnum<{
	booked: "booked";
	completed: "completed";
	failed: "failed";
	handed_off: "handed_off";
	prospect_stopped: "prospect_stopped";
}>;
/**
* `voice.agent_call.ended` (version 1): an Inbound Agent Call is over. Ids, times and the outcome:
* no transcript, number, name or Qualification answer. A Call that was not `failed` carries the
* version of the Disclosure wording that was played; only a `failed` Call may have none.
*/
declare const voiceAgentCallEndedEvent: {
	type: "voice.agent_call.ended";
	version: 1;
	schema: z.ZodObject<{
		id: z.core.$ZodBranded<z.ZodString, "evt", "out">;
		occurredAt: z.ZodISODateTime;
		organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
		region: z.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z.ZodLiteral<"voice.agent_call.ended">;
		version: z.ZodLiteral<1>;
		data: z.ZodObject<{
			callId: z.core.$ZodBranded<z.ZodString, "call", "out">;
			inquiryId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "inq", "out">>;
			prospectId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "prs", "out">>;
			outcome: z.ZodEnum<{
				booked: "booked";
				completed: "completed";
				failed: "failed";
				handed_off: "handed_off";
				prospect_stopped: "prospect_stopped";
			}>;
			failureReason: z.ZodNullable<z.ZodEnum<{
				busy: "busy";
				carrier_dropped: "carrier_dropped";
				carrier_rejected: "carrier_rejected";
				disclosure_failed: "disclosure_failed";
				no_answer: "no_answer";
				provider_error: "provider_error";
				rep_unreachable: "rep_unreachable";
				timeout: "timeout";
			}>>;
			startedAt: z.ZodISODateTime;
			endedAt: z.ZodISODateTime;
			durationSeconds: z.ZodNumber;
			disclosureWordingVersion: z.ZodNullable<z.ZodNumber>;
		}, z.core.$strict>;
	}, z.core.$strip>;
	parse: (input: unknown) => {
		id: string & z.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z.$brand<"org">;
		region: "eu" | "us";
		type: "voice.agent_call.ended";
		version: 1;
		data: {
			callId: string & z.$brand<"call">;
			inquiryId: (string & z.$brand<"inq">) | null;
			prospectId: (string & z.$brand<"prs">) | null;
			outcome: "booked" | "completed" | "failed" | "handed_off" | "prospect_stopped";
			failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
			startedAt: string;
			endedAt: string;
			durationSeconds: number;
			disclosureWordingVersion: number | null;
		};
	};
	safeParse: (input: unknown) => z.ZodSafeParseResult<{
		id: string & z.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z.$brand<"org">;
		region: "eu" | "us";
		type: "voice.agent_call.ended";
		version: 1;
		data: {
			callId: string & z.$brand<"call">;
			inquiryId: (string & z.$brand<"inq">) | null;
			prospectId: (string & z.$brand<"prs">) | null;
			outcome: "booked" | "completed" | "failed" | "handed_off" | "prospect_stopped";
			failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
			startedAt: string;
			endedAt: string;
			durationSeconds: number;
			disclosureWordingVersion: number | null;
		};
	}>;
};
/**
* `voice.handoff.completed` (version 1): a Handoff is over. Ids, times, the channel and how it
* ended: no summary, transcript or Qualification answer.
*/
declare const voiceHandoffCompletedEvent: {
	type: "voice.handoff.completed";
	version: 1;
	schema: z.ZodObject<{
		id: z.core.$ZodBranded<z.ZodString, "evt", "out">;
		occurredAt: z.ZodISODateTime;
		organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
		region: z.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z.ZodLiteral<"voice.handoff.completed">;
		version: z.ZodLiteral<1>;
		data: z.ZodObject<{
			handoffId: z.core.$ZodBranded<z.ZodString, "hof", "out">;
			channel: z.ZodEnum<{
				call: "call";
				chat: "chat";
			}>;
			callId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "call", "out">>;
			chatId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "cht", "out">>;
			inquiryId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "inq", "out">>;
			prospectId: z.core.$ZodBranded<z.ZodString, "prs", "out">;
			repMembershipId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "mem", "out">>;
			result: z.ZodEnum<{
				abandoned: "abandoned";
				booking_offered: "booking_offered";
				bridged: "bridged";
			}>;
			attempts: z.ZodNumber;
			requestedAt: z.ZodISODateTime;
			answeredAt: z.ZodNullable<z.ZodISODateTime>;
			completedAt: z.ZodISODateTime;
		}, z.core.$strict>;
	}, z.core.$strip>;
	parse: (input: unknown) => {
		id: string & z.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z.$brand<"org">;
		region: "eu" | "us";
		type: "voice.handoff.completed";
		version: 1;
		data: {
			handoffId: string & z.$brand<"hof">;
			channel: "call" | "chat";
			callId: (string & z.$brand<"call">) | null;
			chatId: (string & z.$brand<"cht">) | null;
			inquiryId: (string & z.$brand<"inq">) | null;
			prospectId: string & z.$brand<"prs">;
			repMembershipId: (string & z.$brand<"mem">) | null;
			result: "abandoned" | "booking_offered" | "bridged";
			attempts: number;
			requestedAt: string;
			answeredAt: string | null;
			completedAt: string;
		};
	};
	safeParse: (input: unknown) => z.ZodSafeParseResult<{
		id: string & z.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z.$brand<"org">;
		region: "eu" | "us";
		type: "voice.handoff.completed";
		version: 1;
		data: {
			handoffId: string & z.$brand<"hof">;
			channel: "call" | "chat";
			callId: (string & z.$brand<"call">) | null;
			chatId: (string & z.$brand<"cht">) | null;
			inquiryId: (string & z.$brand<"inq">) | null;
			prospectId: string & z.$brand<"prs">;
			repMembershipId: (string & z.$brand<"mem">) | null;
			result: "abandoned" | "booking_offered" | "bridged";
			attempts: number;
			requestedAt: string;
			answeredAt: string | null;
			completedAt: string;
		};
	}>;
};
/** What made a Contact Consent end during a Call or Chat. */
declare const CONSENT_REVOKE_TRIGGERS: readonly ["agent_call", "chat", "sms_stop"];
/** What made a Contact Consent end. */
declare const consentRevokeTriggerSchema: z.ZodEnum<{
	agent_call: "agent_call";
	chat: "chat";
	sms_stop: "sms_stop";
}>;
/**
* `voice.consent.revoked` (version 1): a Prospect withdrew Contact Consent on a Call, in a Chat or
* by a stop reply. Core records the withdrawal; this event is the notice. Ids, the channel and the
* time only: never the words the Prospect said.
*/
declare const voiceConsentRevokedEvent: {
	type: "voice.consent.revoked";
	version: 1;
	schema: z.ZodObject<{
		id: z.core.$ZodBranded<z.ZodString, "evt", "out">;
		occurredAt: z.ZodISODateTime;
		organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
		region: z.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z.ZodLiteral<"voice.consent.revoked">;
		version: z.ZodLiteral<1>;
		data: z.ZodObject<{
			prospectId: z.core.$ZodBranded<z.ZodString, "prs", "out">;
			channel: z.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			trigger: z.ZodEnum<{
				agent_call: "agent_call";
				chat: "chat";
				sms_stop: "sms_stop";
			}>;
			callId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "call", "out">>;
			chatId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "cht", "out">>;
			revokedAt: z.ZodISODateTime;
		}, z.core.$strict>;
	}, z.core.$strip>;
	parse: (input: unknown) => {
		id: string & z.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z.$brand<"org">;
		region: "eu" | "us";
		type: "voice.consent.revoked";
		version: 1;
		data: {
			prospectId: string & z.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			trigger: "agent_call" | "chat" | "sms_stop";
			callId: (string & z.$brand<"call">) | null;
			chatId: (string & z.$brand<"cht">) | null;
			revokedAt: string;
		};
	};
	safeParse: (input: unknown) => z.ZodSafeParseResult<{
		id: string & z.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z.$brand<"org">;
		region: "eu" | "us";
		type: "voice.consent.revoked";
		version: 1;
		data: {
			prospectId: string & z.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			trigger: "agent_call" | "chat" | "sms_stop";
			callId: (string & z.$brand<"call">) | null;
			chatId: (string & z.$brand<"cht">) | null;
			revokedAt: string;
		};
	}>;
};
/** Every Inbound Agent event, by type. */
declare const AGENT_EVENTS: {
	readonly "voice.agent_call.ended": {
		type: "voice.agent_call.ended";
		version: 1;
		schema: z.ZodObject<{
			id: z.core.$ZodBranded<z.ZodString, "evt", "out">;
			occurredAt: z.ZodISODateTime;
			organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
			region: z.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z.ZodLiteral<"voice.agent_call.ended">;
			version: z.ZodLiteral<1>;
			data: z.ZodObject<{
				callId: z.core.$ZodBranded<z.ZodString, "call", "out">;
				inquiryId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "inq", "out">>;
				prospectId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "prs", "out">>;
				outcome: z.ZodEnum<{
					booked: "booked";
					completed: "completed";
					failed: "failed";
					handed_off: "handed_off";
					prospect_stopped: "prospect_stopped";
				}>;
				failureReason: z.ZodNullable<z.ZodEnum<{
					busy: "busy";
					carrier_dropped: "carrier_dropped";
					carrier_rejected: "carrier_rejected";
					disclosure_failed: "disclosure_failed";
					no_answer: "no_answer";
					provider_error: "provider_error";
					rep_unreachable: "rep_unreachable";
					timeout: "timeout";
				}>>;
				startedAt: z.ZodISODateTime;
				endedAt: z.ZodISODateTime;
				durationSeconds: z.ZodNumber;
				disclosureWordingVersion: z.ZodNullable<z.ZodNumber>;
			}, z.core.$strict>;
		}, z.core.$strip>;
		parse: (input: unknown) => {
			id: string & z.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z.$brand<"org">;
			region: "eu" | "us";
			type: "voice.agent_call.ended";
			version: 1;
			data: {
				callId: string & z.$brand<"call">;
				inquiryId: (string & z.$brand<"inq">) | null;
				prospectId: (string & z.$brand<"prs">) | null;
				outcome: "booked" | "completed" | "failed" | "handed_off" | "prospect_stopped";
				failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
				startedAt: string;
				endedAt: string;
				durationSeconds: number;
				disclosureWordingVersion: number | null;
			};
		};
		safeParse: (input: unknown) => z.ZodSafeParseResult<{
			id: string & z.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z.$brand<"org">;
			region: "eu" | "us";
			type: "voice.agent_call.ended";
			version: 1;
			data: {
				callId: string & z.$brand<"call">;
				inquiryId: (string & z.$brand<"inq">) | null;
				prospectId: (string & z.$brand<"prs">) | null;
				outcome: "booked" | "completed" | "failed" | "handed_off" | "prospect_stopped";
				failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
				startedAt: string;
				endedAt: string;
				durationSeconds: number;
				disclosureWordingVersion: number | null;
			};
		}>;
	};
	readonly "voice.handoff.completed": {
		type: "voice.handoff.completed";
		version: 1;
		schema: z.ZodObject<{
			id: z.core.$ZodBranded<z.ZodString, "evt", "out">;
			occurredAt: z.ZodISODateTime;
			organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
			region: z.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z.ZodLiteral<"voice.handoff.completed">;
			version: z.ZodLiteral<1>;
			data: z.ZodObject<{
				handoffId: z.core.$ZodBranded<z.ZodString, "hof", "out">;
				channel: z.ZodEnum<{
					call: "call";
					chat: "chat";
				}>;
				callId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "call", "out">>;
				chatId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "cht", "out">>;
				inquiryId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "inq", "out">>;
				prospectId: z.core.$ZodBranded<z.ZodString, "prs", "out">;
				repMembershipId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "mem", "out">>;
				result: z.ZodEnum<{
					abandoned: "abandoned";
					booking_offered: "booking_offered";
					bridged: "bridged";
				}>;
				attempts: z.ZodNumber;
				requestedAt: z.ZodISODateTime;
				answeredAt: z.ZodNullable<z.ZodISODateTime>;
				completedAt: z.ZodISODateTime;
			}, z.core.$strict>;
		}, z.core.$strip>;
		parse: (input: unknown) => {
			id: string & z.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z.$brand<"org">;
			region: "eu" | "us";
			type: "voice.handoff.completed";
			version: 1;
			data: {
				handoffId: string & z.$brand<"hof">;
				channel: "call" | "chat";
				callId: (string & z.$brand<"call">) | null;
				chatId: (string & z.$brand<"cht">) | null;
				inquiryId: (string & z.$brand<"inq">) | null;
				prospectId: string & z.$brand<"prs">;
				repMembershipId: (string & z.$brand<"mem">) | null;
				result: "abandoned" | "booking_offered" | "bridged";
				attempts: number;
				requestedAt: string;
				answeredAt: string | null;
				completedAt: string;
			};
		};
		safeParse: (input: unknown) => z.ZodSafeParseResult<{
			id: string & z.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z.$brand<"org">;
			region: "eu" | "us";
			type: "voice.handoff.completed";
			version: 1;
			data: {
				handoffId: string & z.$brand<"hof">;
				channel: "call" | "chat";
				callId: (string & z.$brand<"call">) | null;
				chatId: (string & z.$brand<"cht">) | null;
				inquiryId: (string & z.$brand<"inq">) | null;
				prospectId: string & z.$brand<"prs">;
				repMembershipId: (string & z.$brand<"mem">) | null;
				result: "abandoned" | "booking_offered" | "bridged";
				attempts: number;
				requestedAt: string;
				answeredAt: string | null;
				completedAt: string;
			};
		}>;
	};
	readonly "voice.consent.revoked": {
		type: "voice.consent.revoked";
		version: 1;
		schema: z.ZodObject<{
			id: z.core.$ZodBranded<z.ZodString, "evt", "out">;
			occurredAt: z.ZodISODateTime;
			organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
			region: z.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z.ZodLiteral<"voice.consent.revoked">;
			version: z.ZodLiteral<1>;
			data: z.ZodObject<{
				prospectId: z.core.$ZodBranded<z.ZodString, "prs", "out">;
				channel: z.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				trigger: z.ZodEnum<{
					agent_call: "agent_call";
					chat: "chat";
					sms_stop: "sms_stop";
				}>;
				callId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "call", "out">>;
				chatId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "cht", "out">>;
				revokedAt: z.ZodISODateTime;
			}, z.core.$strict>;
		}, z.core.$strip>;
		parse: (input: unknown) => {
			id: string & z.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z.$brand<"org">;
			region: "eu" | "us";
			type: "voice.consent.revoked";
			version: 1;
			data: {
				prospectId: string & z.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				trigger: "agent_call" | "chat" | "sms_stop";
				callId: (string & z.$brand<"call">) | null;
				chatId: (string & z.$brand<"cht">) | null;
				revokedAt: string;
			};
		};
		safeParse: (input: unknown) => z.ZodSafeParseResult<{
			id: string & z.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z.$brand<"org">;
			region: "eu" | "us";
			type: "voice.consent.revoked";
			version: 1;
			data: {
				prospectId: string & z.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				trigger: "agent_call" | "chat" | "sms_stop";
				callId: (string & z.$brand<"call">) | null;
				chatId: (string & z.$brand<"cht">) | null;
				revokedAt: string;
			};
		}>;
	};
};
/** The type of an Inbound Agent event. */
type AgentEventType = keyof typeof AGENT_EVENTS;
import { z as z2 } from "zod";
/** Where a Handoff happens: a phone Call or a Chat. */
declare const HANDOFF_CHANNELS: readonly ["call", "chat"];
/** Where a Handoff happens. */
declare const handoffChannelSchema: z2.ZodEnum<{
	call: "call";
	chat: "chat";
}>;
/**
* The states of a Handoff. `pending` waits for the Rep it is ringing; `accepted` is taken and
* `completed` is over; `declined` and `timed_out` pass to the next Rep; `no_rep` means none took
* it and the Agent offered a Booking instead.
*/
declare const HANDOFF_STATES: readonly ["pending", "accepted", "completed", "declined", "timed_out", "no_rep"];
/** The state of a Handoff. */
declare const handoffStateSchema: z2.ZodEnum<{
	accepted: "accepted";
	completed: "completed";
	declined: "declined";
	no_rep: "no_rep";
	pending: "pending";
	timed_out: "timed_out";
}>;
/** Why the Inbound Agent handed off: a closed list. */
declare const HANDOFF_REASONS: readonly ["asked_for_rep", "qualified", "agent_unsure", "prospect_frustrated"];
/** Why the Inbound Agent handed off. */
declare const handoffReasonSchema: z2.ZodEnum<{
	agent_unsure: "agent_unsure";
	asked_for_rep: "asked_for_rep";
	prospect_frustrated: "prospect_frustrated";
	qualified: "qualified";
}>;
/** How a Handoff ended, for the event: the Rep was bridged, a Booking was offered, or the Prospect left. */
declare const HANDOFF_RESULTS: readonly ["bridged", "booking_offered", "abandoned"];
/** How a Handoff ended. */
declare const handoffResultSchema: z2.ZodEnum<{
	abandoned: "abandoned";
	booking_offered: "booking_offered";
	bridged: "bridged";
}>;
/**
* A Handoff: the Inbound Agent passing a Call or Chat to a Rep. A Call Handoff names the Call and a
* Chat Handoff names the Chat. `repMembershipId` is the Rep it is currently offered to (null when
* none is left); `attempt` counts the Reps tried.
*/
declare const handoffSchema: z2.ZodObject<{
	id: z2.core.$ZodBranded<z2.ZodString, "hof", "out">;
	state: z2.ZodEnum<{
		accepted: "accepted";
		completed: "completed";
		declined: "declined";
		no_rep: "no_rep";
		pending: "pending";
		timed_out: "timed_out";
	}>;
	channel: z2.ZodEnum<{
		call: "call";
		chat: "chat";
	}>;
	callId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "call", "out">>;
	chatId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "cht", "out">>;
	repMembershipId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "mem", "out">>;
	attempt: z2.ZodNumber;
	reason: z2.ZodEnum<{
		agent_unsure: "agent_unsure";
		asked_for_rep: "asked_for_rep";
		prospect_frustrated: "prospect_frustrated";
		qualified: "qualified";
	}>;
	requestedAt: z2.ZodISODateTime;
	answeredAt: z2.ZodNullable<z2.ZodISODateTime>;
	completedAt: z2.ZodNullable<z2.ZodISODateTime>;
}, z2.core.$strict>;
/** A Handoff. */
type Handoff = z2.infer<typeof handoffSchema>;
/** The path parameters of a request about one Handoff. */
declare const handoffParamsSchema: z2.ZodObject<{
	handoffId: z2.core.$ZodBranded<z2.ZodString, "hof", "out">;
}, z2.core.$strict>;
/** The query parameters of a request to list Handoffs: latest first, cursor-paginated, optionally by state. */
declare const listHandoffsQuerySchema: z2.ZodObject<{
	cursor: z2.ZodOptional<z2.ZodString>;
	limit: z2.ZodDefault<z2.ZodPipe<z2.ZodPipe<z2.ZodUnion<readonly [z2.ZodNumber, z2.ZodString]>, z2.ZodTransform<number, string | number>>, z2.ZodNumber>>;
	state: z2.ZodOptional<z2.ZodEnum<{
		accepted: "accepted";
		completed: "completed";
		declined: "declined";
		no_rep: "no_rep";
		pending: "pending";
		timed_out: "timed_out";
	}>>;
}, z2.core.$strict>;
/** One page of Handoffs. */
declare const handoffPageSchema: z2.ZodObject<{
	items: z2.ZodArray<z2.ZodObject<{
		id: z2.core.$ZodBranded<z2.ZodString, "hof", "out">;
		state: z2.ZodEnum<{
			accepted: "accepted";
			completed: "completed";
			declined: "declined";
			no_rep: "no_rep";
			pending: "pending";
			timed_out: "timed_out";
		}>;
		channel: z2.ZodEnum<{
			call: "call";
			chat: "chat";
		}>;
		callId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "call", "out">>;
		chatId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "cht", "out">>;
		repMembershipId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "mem", "out">>;
		attempt: z2.ZodNumber;
		reason: z2.ZodEnum<{
			agent_unsure: "agent_unsure";
			asked_for_rep: "asked_for_rep";
			prospect_frustrated: "prospect_frustrated";
			qualified: "qualified";
		}>;
		requestedAt: z2.ZodISODateTime;
		answeredAt: z2.ZodNullable<z2.ZodISODateTime>;
		completedAt: z2.ZodNullable<z2.ZodISODateTime>;
	}, z2.core.$strict>>;
	nextCursor: z2.ZodNullable<z2.ZodString>;
}, z2.core.$strip>;
/**
* What the Rep the Handoff is offered to sees before answering: the Prospect, the Qualification so
* far and the last turns (at most 20). It carries no email or number; the Prospect's details come
* from the Prospect record under the usual role rules.
*/
declare const handoffContextSchema: z2.ZodObject<{
	handoffId: z2.core.$ZodBranded<z2.ZodString, "hof", "out">;
	prospectId: z2.core.$ZodBranded<z2.ZodString, "prs", "out">;
	qualification: z2.ZodObject<{
		answers: z2.ZodArray<z2.ZodObject<{
			questionId: z2.core.$ZodBranded<z2.ZodString, "qst", "out">;
			value: z2.ZodNullable<z2.ZodUnion<readonly [z2.ZodPipe<z2.ZodString, z2.ZodString>, z2.ZodNumber, z2.ZodBoolean]>>;
			skipped: z2.ZodBoolean;
		}, z2.core.$strict>>;
		summary: z2.ZodNullable<z2.ZodPipe<z2.ZodString, z2.ZodString>>;
	}, z2.core.$strict>;
	recentTurns: z2.ZodArray<z2.ZodObject<{
		index: z2.ZodNumber;
		role: z2.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z2.ZodPipe<z2.ZodString, z2.ZodString>;
		sources: z2.ZodArray<z2.ZodObject<{
			documentId: z2.core.$ZodBranded<z2.ZodString, "doc", "out">;
			page: z2.ZodNullable<z2.ZodNumber>;
			passage: z2.ZodString;
		}, z2.core.$strict>>;
		deferred: z2.ZodBoolean;
		toolCall: z2.ZodNullable<z2.ZodObject<{
			name: z2.ZodEnum<{
				book: "book";
				end_call: "end_call";
				find_slots: "find_slots";
				hand_off: "hand_off";
				record_answer: "record_answer";
				revoke_consent: "revoke_consent";
			}>;
		}, z2.core.$strict>>;
		at: z2.ZodISODateTime;
	}, z2.core.$strict>>;
}, z2.core.$strict>;
/** The context of a Handoff. */
type HandoffContext = z2.infer<typeof handoffContextSchema>;
/** The body of a request to accept or decline a Handoff: nothing, since the Rep is the token's. */
declare const answerHandoffRequestSchema: z2.ZodObject<{}, z2.core.$strict>;
import { z as z3 } from "zod";
/** An error code in `area.reason` form, such as `request.invalid`. */
declare const errorCodeSchema: z3.ZodString;
/** The one body every service returns for a failure. */
declare const errorBodySchema: z3.ZodObject<{
	error: z3.ZodObject<{
		code: z3.ZodString;
		message: z3.ZodString;
		details: z3.ZodOptional<z3.ZodRecord<z3.ZodString, z3.ZodUnknown>>;
	}, z3.core.$strip>;
}, z3.core.$strip>;
/** The body of a failure response, as returned by every service. */
type ErrorBody = z3.infer<typeof errorBodySchema>;
/** What a registry knows about one error: its code, HTTP status and default message. */
type ErrorDefinition<Code extends string = string> = {
	readonly code: Code;
	readonly status: number;
	readonly message: string;
};
declare const common: readonly [ErrorDefinition<"request.invalid">, ErrorDefinition<"request.not_found">, ErrorDefinition<"request.conflict">, ErrorDefinition<"request.idempotency_key_reused">, ErrorDefinition<"request.idempotency_in_progress">, ErrorDefinition<"request.too_large">, ErrorDefinition<"request.method_not_allowed">, ErrorDefinition<"request.unsupported_media_type">, ErrorDefinition<"request.unprocessable">, ErrorDefinition<"auth.unauthenticated">, ErrorDefinition<"auth.forbidden">, ErrorDefinition<"auth.token_expired">, ErrorDefinition<"auth.token_invalid">, ErrorDefinition<"auth.unavailable">, ErrorDefinition<"rate.limited">, ErrorDefinition<"server.internal">, ErrorDefinition<"server.unavailable">, ErrorDefinition<"server.timeout">];
type CommonEntry = (typeof common)[number];
/** The errors common to every service, keyed by code. */
declare const ERRORS: Readonly<{ [E in CommonEntry as E["code"]] : E }>;
/** A code from the {@link ERRORS} registry. */
type CommonErrorCode = keyof typeof ERRORS;
/** What a service supplies for one of its own errors; the code comes from the area and key. */
type ErrorInput = {
	readonly status: number;
	readonly message: string;
};
/** Declares a service's own errors: prefixes each reason with the area and returns a frozen registry. */
declare function defineErrors<
	const Area extends string,
	const Reason extends string
>(area: Area, entries: Readonly<Record<Reason, ErrorInput>>): Readonly<{ [R in Reason as `${Area}.${R}`] : ErrorDefinition<`${Area}.${R}`> }>;
import { z as z4 } from "zod";
/** Every Region an Organization can be created in. */
declare const REGIONS: readonly ["us", "eu"];
/** A Region: the geography whose boundary an Organization's data never crosses. */
declare const regionSchema: z4.ZodEnum<{
	eu: "eu";
	us: "us";
}>;
/** A Region. */
type Region = z4.infer<typeof regionSchema>;
/** Every role, ordered from most to least privileged. */
declare const ROLES: readonly ["owner", "admin", "manager", "rep"];
/** A member's role in an Organization. */
declare const roleSchema: z4.ZodEnum<{
	admin: "admin";
	manager: "manager";
	owner: "owner";
	rep: "rep";
}>;
/** A role. */
type Role = z4.infer<typeof roleSchema>;
/** Whether `role` is at least as privileged as `minimum`; an unrecognised role is never enough. */
declare function roleAtLeast(role: Role, minimum: Role): boolean;
/** The roles an Invitation can offer; ownership passes by promoting a member, never by Invitation. */
declare const INVITABLE_ROLES: readonly ["admin", "manager", "rep"];
/** A role an Invitation can offer: any role except `owner`. */
declare const invitableRoleSchema: z4.ZodEnum<{
	admin: "admin";
	manager: "manager";
	rep: "rep";
}>;
/** A role an Invitation can offer. */
type InvitableRole = z4.infer<typeof invitableRoleSchema>;
/** Every state an Organization is in; `deleted` keeps the record for the retention window. */
declare const ORGANIZATION_STATUSES: readonly ["active", "suspended", "deleted"];
/** The state of an Organization. */
declare const organizationStatusSchema: z4.ZodEnum<{
	active: "active";
	deleted: "deleted";
	suspended: "suspended";
}>;
/** The state of an Organization. */
type OrganizationStatus = z4.infer<typeof organizationStatusSchema>;
/** The shared shape of an inbound route (Inquiry, Agent and Chat): who may call it, what it answers. */
type InboundRoute<Code extends string> = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** The roles allowed. Empty for a public route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** True: the route takes no token and no Organization; the publishable key or session token stands in. */
	readonly public?: true;
	/** True: a service-to-service route under `/internal`, called with the shared secret (ADR 0013), never with a user token. */
	readonly internal?: true;
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when a retry of the route is safe by the `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** True when the `Idempotency-Key` header is required, not just accepted. */
	readonly keyRequired?: true;
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly Code[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/** The roles that read the Inbound Agent settings, questions and turns of their view. */
declare const AGENT_READ_ROLES: readonly ["owner", "admin", "manager"];
/** The roles that change the Inbound Agent settings and Qualification questions, and try it out. */
declare const AGENT_ADMIN_ROLES: readonly ["owner", "admin"];
/** Every role: each answers the Handoffs offered to them and reads the Calls they may see. */
declare const AGENT_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The Inbound Agent routes, by name. */
type AgentRouteName = "getAgentSettings" | "setAgentSettings" | "listQualificationQuestions" | "createQualificationQuestion" | "getQualificationQuestion" | "updateQualificationQuestion" | "deleteQualificationQuestion" | "reorderQualificationQuestions" | "suggestQualificationQuestions" | "startTrySession" | "sendTryMessage" | "listAgentTurns" | "listHandoffs" | "getHandoff" | "acceptHandoff" | "declineHandoff";
/** One Inbound Agent route. */
type AgentRoute = InboundRoute<AgentErrorCode | "call.not_found">;
/**
* The Inbound Agent routes (spec M14). All need a token. No route or body can switch off the
* Disclosure or waive Contact Consent: neither has a setting (ADR 0003).
*/
declare const AGENT_ROUTES: Readonly<Record<AgentRouteName, AgentRoute>>;
import { z as z5 } from "zod";
/**
* What an Admin may set on the Inbound Agent. There is deliberately no field for the Disclosure,
* the Recording or Contact Consent: they are not settings (ADR 0003), and an unknown field is
* refused. `hours` can only narrow the fixed calling window, in the Prospect's local time, and a
* paused Agent places and answers nothing. A set replaces the whole value, so a repeat is safe.
*/
declare const setAgentSettingsRequestSchema: z5.ZodObject<{
	paused: z5.ZodBoolean;
	greeting: z5.ZodPipe<z5.ZodString, z5.ZodString>;
	voiceStyle: z5.ZodEnum<{
		crisp: "crisp";
		neutral: "neutral";
		warm: "warm";
	}>;
	timeZone: z5.ZodString;
	hours: z5.ZodArray<z5.ZodObject<{
		day: z5.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>;
		windows: z5.ZodArray<z5.ZodObject<{
			start: z5.ZodString;
			end: z5.ZodString;
		}, z5.core.$strict>>;
	}, z5.core.$strict>>;
	maxCallSeconds: z5.ZodNumber;
	maxCostUsdCents: z5.ZodNumber;
	concurrencyCap: z5.ZodNumber;
}, z5.core.$strict>;
/** The body of a request to set the Inbound Agent settings. */
type SetAgentSettingsRequest = z5.infer<typeof setAgentSettingsRequestSchema>;
/** The Inbound Agent settings as stored: what was set, the languages (fixed) and who last changed them. */
declare const agentSettingsSchema: z5.ZodObject<{
	paused: z5.ZodBoolean;
	greeting: z5.ZodPipe<z5.ZodString, z5.ZodString>;
	voiceStyle: z5.ZodEnum<{
		crisp: "crisp";
		neutral: "neutral";
		warm: "warm";
	}>;
	timeZone: z5.ZodString;
	hours: z5.ZodArray<z5.ZodObject<{
		day: z5.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>;
		windows: z5.ZodArray<z5.ZodObject<{
			start: z5.ZodString;
			end: z5.ZodString;
		}, z5.core.$strict>>;
	}, z5.core.$strict>>;
	maxCallSeconds: z5.ZodNumber;
	maxCostUsdCents: z5.ZodNumber;
	concurrencyCap: z5.ZodNumber;
	languages: z5.ZodArray<z5.ZodEnum<{
		en: "en";
	}>>;
	updatedAt: z5.ZodISODateTime;
	updatedByMembershipId: z5.ZodNullable<z5.core.$ZodBranded<z5.ZodString, "mem", "out">>;
}, z5.core.$strict>;
/** The Inbound Agent settings. */
type AgentSettings = z5.infer<typeof agentSettingsSchema>;
import { z as z6 } from "zod";
/** Who spoke a turn: the Prospect (or the Admin trying it out) or the Inbound Agent. */
declare const agentTurnRoleSchema: z6.ZodEnum<{
	agent: "agent";
	prospect: "prospect";
}>;
/**
* One turn of an Inbound Agent Call or try-it session. `sources` are the Playbook passages the
* answer used (staff only; a visitor never gets them); `deferred` is true when the Agent said it
* would have someone follow up instead of answering. `toolCall` names the one tool it called, from a
* closed list. Text is untrusted data, never an instruction.
*/
declare const agentTurnSchema: z6.ZodObject<{
	index: z6.ZodNumber;
	role: z6.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
	}>;
	text: z6.ZodPipe<z6.ZodString, z6.ZodString>;
	sources: z6.ZodArray<z6.ZodObject<{
		documentId: z6.core.$ZodBranded<z6.ZodString, "doc", "out">;
		page: z6.ZodNullable<z6.ZodNumber>;
		passage: z6.ZodString;
	}, z6.core.$strict>>;
	deferred: z6.ZodBoolean;
	toolCall: z6.ZodNullable<z6.ZodObject<{
		name: z6.ZodEnum<{
			book: "book";
			end_call: "end_call";
			find_slots: "find_slots";
			hand_off: "hand_off";
			record_answer: "record_answer";
			revoke_consent: "revoke_consent";
		}>;
	}, z6.core.$strict>>;
	at: z6.ZodISODateTime;
}, z6.core.$strict>;
/** One turn of an Inbound Agent Call. */
type AgentTurn = z6.infer<typeof agentTurnSchema>;
/** The path parameters of a request about the turns of one Call. */
declare const agentCallParamsSchema: z6.ZodObject<{
	callId: z6.core.$ZodBranded<z6.ZodString, "call", "out">;
}, z6.core.$strict>;
/** The query parameters of a request to list turns: oldest first, cursor-paginated. */
declare const listAgentTurnsQuerySchema: z6.ZodObject<{
	cursor: z6.ZodOptional<z6.ZodString>;
	limit: z6.ZodDefault<z6.ZodPipe<z6.ZodPipe<z6.ZodUnion<readonly [z6.ZodNumber, z6.ZodString]>, z6.ZodTransform<number, string | number>>, z6.ZodNumber>>;
}, z6.core.$strict>;
/** One page of turns. */
declare const agentTurnPageSchema: z6.ZodObject<{
	items: z6.ZodArray<z6.ZodObject<{
		index: z6.ZodNumber;
		role: z6.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z6.ZodPipe<z6.ZodString, z6.ZodString>;
		sources: z6.ZodArray<z6.ZodObject<{
			documentId: z6.core.$ZodBranded<z6.ZodString, "doc", "out">;
			page: z6.ZodNullable<z6.ZodNumber>;
			passage: z6.ZodString;
		}, z6.core.$strict>>;
		deferred: z6.ZodBoolean;
		toolCall: z6.ZodNullable<z6.ZodObject<{
			name: z6.ZodEnum<{
				book: "book";
				end_call: "end_call";
				find_slots: "find_slots";
				hand_off: "hand_off";
				record_answer: "record_answer";
				revoke_consent: "revoke_consent";
			}>;
		}, z6.core.$strict>>;
		at: z6.ZodISODateTime;
	}, z6.core.$strict>>;
	nextCursor: z6.ZodNullable<z6.ZodString>;
}, z6.core.$strip>;
/** The path parameters of a request about one try-it session. */
declare const trySessionParamsSchema: z6.ZodObject<{
	sessionId: z6.core.$ZodBranded<z6.ZodString, "try", "out">;
}, z6.core.$strict>;
/** The body of a request to say something in a try-it session. */
declare const sendTryMessageRequestSchema: z6.ZodObject<{
	text: z6.ZodPipe<z6.ZodString, z6.ZodString>;
}, z6.core.$strict>;
/** The body of a request to start a try-it session: nothing to choose; it runs on the live settings. */
declare const startTrySessionRequestSchema: z6.ZodObject<{}, z6.core.$strict>;
/**
* A try-it session: a text rehearsal of the Inbound Agent for an Admin. No call is placed, no
* Prospect is created and nothing is sent; `opening` is the first turn, which states it is an AI.
*/
declare const trySessionSchema: z6.ZodObject<{
	id: z6.core.$ZodBranded<z6.ZodString, "try", "out">;
	opening: z6.ZodObject<{
		index: z6.ZodNumber;
		role: z6.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z6.ZodPipe<z6.ZodString, z6.ZodString>;
		sources: z6.ZodArray<z6.ZodObject<{
			documentId: z6.core.$ZodBranded<z6.ZodString, "doc", "out">;
			page: z6.ZodNullable<z6.ZodNumber>;
			passage: z6.ZodString;
		}, z6.core.$strict>>;
		deferred: z6.ZodBoolean;
		toolCall: z6.ZodNullable<z6.ZodObject<{
			name: z6.ZodEnum<{
				book: "book";
				end_call: "end_call";
				find_slots: "find_slots";
				hand_off: "hand_off";
				record_answer: "record_answer";
				revoke_consent: "revoke_consent";
			}>;
		}, z6.core.$strict>>;
		at: z6.ZodISODateTime;
	}, z6.core.$strict>;
	expiresAt: z6.ZodISODateTime;
}, z6.core.$strict>;
/** A try-it session. */
type TrySession = z6.infer<typeof trySessionSchema>;
/** The answer to a message in a try-it session: the reply turn. */
declare const tryReplySchema: z6.ZodObject<{
	reply: z6.ZodObject<{
		index: z6.ZodNumber;
		role: z6.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z6.ZodPipe<z6.ZodString, z6.ZodString>;
		sources: z6.ZodArray<z6.ZodObject<{
			documentId: z6.core.$ZodBranded<z6.ZodString, "doc", "out">;
			page: z6.ZodNullable<z6.ZodNumber>;
			passage: z6.ZodString;
		}, z6.core.$strict>>;
		deferred: z6.ZodBoolean;
		toolCall: z6.ZodNullable<z6.ZodObject<{
			name: z6.ZodEnum<{
				book: "book";
				end_call: "end_call";
				find_slots: "find_slots";
				hand_off: "hand_off";
				record_answer: "record_answer";
				revoke_consent: "revoke_consent";
			}>;
		}, z6.core.$strict>>;
		at: z6.ZodISODateTime;
	}, z6.core.$strict>;
}, z6.core.$strict>;
import { z as z7 } from "zod";
/** The voices an Organization may choose for its Inbound Agent: a closed list of stock styles, never a clone of a person. */
declare const AGENT_VOICE_STYLES: readonly ["warm", "neutral", "crisp"];
/** The voice style of the Inbound Agent. */
declare const agentVoiceStyleSchema: z7.ZodEnum<{
	crisp: "crisp";
	neutral: "neutral";
	warm: "warm";
}>;
/** The voice style of the Inbound Agent. */
type AgentVoiceStyle = z7.infer<typeof agentVoiceStyleSchema>;
/** The languages the Inbound Agent speaks in this release: English only. Read-only. */
declare const AGENT_LANGUAGES: readonly ["en"];
/** The language of the Inbound Agent. */
declare const agentLanguageSchema: z7.ZodEnum<{
	en: "en";
}>;
/** The longest the Inbound Agent may stay on one Call, whatever the setting, in seconds. */
declare const MAX_AGENT_CALL_SECONDS = 1800;
/** The default cap on one Inbound Agent Call, in seconds. */
declare const DEFAULT_AGENT_CALL_SECONDS = 600;
/** The highest cost cap on one Inbound Agent Call, in US cents. */
declare const MAX_AGENT_CALL_COST_USD_CENTS = 5e3;
/** The highest number of Inbound Agent Calls one Organization may run at once. */
declare const MAX_AGENT_CONCURRENCY = 50;
/** The longest greeting, in characters. The Disclosure is spoken before it and is not part of it. */
declare const MAX_AGENT_GREETING_LENGTH = 500;
/**
* The hours, in the Prospect's local time, outside which the Inbound Agent never places a callback.
* Fixed in the contract, not a setting: an Organization's own hours can only narrow it.
*/
declare const AGENT_CALLING_WINDOW: {
	readonly startHour: 8;
	readonly endHour: 21;
};
/** The tools the Inbound Agent may call during a Call or Chat. A closed list: none turns off the Disclosure or the consent check. */
declare const AGENT_TOOLS: readonly ["record_answer", "find_slots", "book", "hand_off", "end_call", "revoke_consent"];
/** The name of a tool the Inbound Agent may call. */
declare const agentToolNameSchema: z7.ZodEnum<{
	book: "book";
	end_call: "end_call";
	find_slots: "find_slots";
	hand_off: "hand_off";
	record_answer: "record_answer";
	revoke_consent: "revoke_consent";
}>;
/** The name of a tool the Inbound Agent may call. */
type AgentToolName = z7.infer<typeof agentToolNameSchema>;
/** The most Playbook passages one turn may cite. */
declare const MAX_TURN_SOURCES = 10;
/** The most turns of context a Rep gets with a Handoff. */
declare const MAX_HANDOFF_CONTEXT_TURNS = 20;
/** The longest text of one turn, in characters. */
declare const MAX_TURN_TEXT_LENGTH = 2e3;
import { ErrorDefinition as ErrorDefinition_8gwh452 } from "..";
/**
* Every `area.reason` code the auth service answers with, beyond the common ones in `ERRORS`:
* sign-in, sign-up verification, passwords, sessions and Sign in with Google (`oidc.*`; the 503
* `oidc.provider_unavailable` is answered with a `Retry-After` header). The sign-up codes and core's
* `organization.deleted` (returned by sign-in and refresh when the user's Organization was deleted)
* are the same entries as in `SIGNUP_ERRORS` and `CORE_ERRORS`, not copies. A missing or
* invalid access token is one of the common `auth.*` token codes in `ERRORS`; a refresh token that
* is not valid is `session.invalid_token`.
*/
declare const AUTH_ERRORS: {
	readonly "organization.deleted": ErrorDefinition_8gwh452<"organization.deleted">;
	readonly "auth.invalid_credentials": ErrorDefinition_8gwh452<"auth.invalid_credentials">;
	readonly "auth.no_organization": ErrorDefinition_8gwh452<"auth.no_organization">;
	readonly "auth.user_banned": ErrorDefinition_8gwh452<"auth.user_banned">;
	readonly "email.invalid": ErrorDefinition_8gwh452<"email.invalid">;
	readonly "flow.invalid_step": ErrorDefinition_8gwh452<"flow.invalid_step">;
	readonly "flow.not_found": ErrorDefinition_8gwh452<"flow.not_found">;
	readonly "mail.unavailable": ErrorDefinition_8gwh452<"mail.unavailable">;
	readonly "membership.unavailable": ErrorDefinition_8gwh452<"membership.unavailable">;
	readonly "oidc.access_denied": ErrorDefinition_8gwh452<"oidc.access_denied">;
	readonly "oidc.disabled": ErrorDefinition_8gwh452<"oidc.disabled">;
	readonly "oidc.email_unverified": ErrorDefinition_8gwh452<"oidc.email_unverified">;
	readonly "oidc.invitation_mismatch": ErrorDefinition_8gwh452<"oidc.invitation_mismatch">;
	readonly "oidc.provider_unavailable": ErrorDefinition_8gwh452<"oidc.provider_unavailable">;
	readonly "oidc.state_invalid": ErrorDefinition_8gwh452<"oidc.state_invalid">;
	readonly "password.breached": ErrorDefinition_8gwh452<"password.breached">;
	readonly "password.common": ErrorDefinition_8gwh452<"password.common">;
	readonly "password.contains_user_info": ErrorDefinition_8gwh452<"password.contains_user_info">;
	readonly "password.too_long": ErrorDefinition_8gwh452<"password.too_long">;
	readonly "password.too_short": ErrorDefinition_8gwh452<"password.too_short">;
	readonly "session.expired": ErrorDefinition_8gwh452<"session.expired">;
	readonly "session.invalid_token": ErrorDefinition_8gwh452<"session.invalid_token">;
	readonly "session.reuse_detected": ErrorDefinition_8gwh452<"session.reuse_detected">;
	readonly "session.revoked": ErrorDefinition_8gwh452<"session.revoked">;
	readonly "signup.invitation_invalid": ErrorDefinition_8gwh452<"signup.invitation_invalid">;
	readonly "signup.organization_name_invalid": ErrorDefinition_8gwh452<"signup.organization_name_invalid">;
	readonly "verification.expired": ErrorDefinition_8gwh452<"verification.expired">;
	readonly "verification.invalid_code": ErrorDefinition_8gwh452<"verification.invalid_code">;
	readonly "verification.too_many_attempts": ErrorDefinition_8gwh452<"verification.too_many_attempts">;
};
/** A code from the {@link AUTH_ERRORS} registry. */
type AuthErrorCode = keyof typeof AUTH_ERRORS;
import { z as z8 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh453 } from "..";
import { ZodObject as ZodObject_qx5az2 } from "zod";
import { ZodNumber as ZodNumber_qqlmmw } from "zod";
import { $strict as $strict_gffh7x } from "zod/v4/core";
/**
* The errors core returns, as `area.reason` codes. None says whether an email address or a user
* exists in another Organization: `invitation.invalid` covers an unknown, used, revoked and expired
* token alike, and `membership.already_member` is only ever about the user making the call (so
* an address that already belongs to a member of the inviting Organization is the distinct
* `invitation.already_member`, which only a caller allowed to invite sees). The Organization-wide
* invitation limits are their own codes, apart from the per-request `rate.limited`:
* `invitation.pending_limit` (1,000 pending) and `invitation.daily_limit` (2,000 in 24 hours,
* answered with `details` of `DAILY_LIMIT_DETAILS_SCHEMA` (`retryAfter` in seconds) and a `Retry-After` header). A role
* that is not allowed is the common `auth.forbidden`. `organization.not_abandonable` is the one
* answer when the abandon guard refuses, whichever of its conditions failed. Which internal call
* returns which code is `INTERNAL_CALL_ERRORS`.
*/
declare const CORE_ERRORS: {
	readonly "invitation.already_member": ErrorDefinition_8gwh453<"invitation.already_member">;
	readonly "invitation.already_pending": ErrorDefinition_8gwh453<"invitation.already_pending">;
	readonly "invitation.daily_limit": ErrorDefinition_8gwh453<"invitation.daily_limit">;
	readonly "invitation.invalid": ErrorDefinition_8gwh453<"invitation.invalid">;
	readonly "invitation.not_found": ErrorDefinition_8gwh453<"invitation.not_found">;
	readonly "invitation.pending_limit": ErrorDefinition_8gwh453<"invitation.pending_limit">;
	readonly "member.last_owner": ErrorDefinition_8gwh453<"member.last_owner">;
	readonly "member.not_found": ErrorDefinition_8gwh453<"member.not_found">;
	readonly "membership.already_member": ErrorDefinition_8gwh453<"membership.already_member">;
	readonly "organization.deleted": ErrorDefinition_8gwh453<"organization.deleted">;
	readonly "organization.not_abandonable": ErrorDefinition_8gwh453<"organization.not_abandonable">;
	readonly "organization.not_found": ErrorDefinition_8gwh453<"organization.not_found">;
	readonly "organization.suspended": ErrorDefinition_8gwh453<"organization.suspended">;
	readonly "team.name_taken": ErrorDefinition_8gwh453<"team.name_taken">;
	readonly "team.not_found": ErrorDefinition_8gwh453<"team.not_found">;
};
/** The `details` shape of `invitation.daily_limit`: `retryAfter` in seconds, the same as its `Retry-After` header. */
declare const DAILY_LIMIT_DETAILS_SCHEMA: ZodObject_qx5az2<{
	retryAfter: ZodNumber_qqlmmw;
}, $strict_gffh7x>;
/** A code from the {@link CORE_ERRORS} registry. */
type CoreErrorCode = keyof typeof CORE_ERRORS;
/**
* The errors the auth service returns about sign-up and Organization membership. They are named
* for what the person signing up sees; auth turns core's `invitation.invalid` into
* `signup.invitation_invalid` and an unreachable core into `membership.unavailable`.
*/
declare const SIGNUP_ERRORS: {
	readonly "auth.no_organization": ErrorDefinition_8gwh453<"auth.no_organization">;
	readonly "membership.unavailable": ErrorDefinition_8gwh453<"membership.unavailable">;
	readonly "signup.invitation_invalid": ErrorDefinition_8gwh453<"signup.invitation_invalid">;
	readonly "signup.organization_name_invalid": ErrorDefinition_8gwh453<"signup.organization_name_invalid">;
};
/** A code from the {@link SIGNUP_ERRORS} registry. */
type SignupErrorCode = keyof typeof SIGNUP_ERRORS;
/** The longest `returnTo` path, in UTF-16 code units. */
declare const MAX_RETURN_TO_LENGTH = 512;
/** The longest authorization URL the start route answers with. */
declare const MAX_AUTHORIZATION_URL_LENGTH = 2048;
/**
* Where to send the person after Google sign-in: a path on the same origin. It starts with `/` but
* never `//` or `/\`, has no backslash, no scheme, no control or bidirectional character and no
* lone surrogate, no whitespace or invisible format character, no `.` or `..` segment (which could
* collapse to `//host` when resolved), and is at most `MAX_RETURN_TO_LENGTH` long. A
* percent-encoded form is checked after decoding once too, so a consumer must decode exactly once; so `/%2F/evil` and `/%5Cevil` are refused, and so is a malformed escape. The
* service also checks it against the portal's route allow-list and keeps it in the attempt; it is
* never read from the callback. The value has already been decoded once by the query or JSON
* parser: a consumer must not decode it again.
*/
declare const returnToSchema: z8.ZodString;
/** Why the person is using Google: to `sign_in` to an account or to `sign_up` for one. */
declare const googleIntentSchema: z8.ZodEnum<{
	sign_in: "sign_in";
	sign_up: "sign_up";
}>;
/** Why the person is using Google. */
type GoogleIntent = z8.infer<typeof googleIntentSchema>;
/** The body that starts a Sign in with Google: the intent and an optional same-origin `returnTo`. Unknown keys are rejected. */
declare const googleStartRequestSchema: z8.ZodObject<{
	intent: z8.ZodEnum<{
		sign_in: "sign_in";
		sign_up: "sign_up";
	}>;
	returnTo: z8.ZodOptional<z8.ZodString>;
}, z8.core.$strict>;
/** The body that starts a Sign in with Google. */
type GoogleStartRequest = z8.infer<typeof googleStartRequestSchema>;
/**
* The URL the browser is sent to: `https`, or `http` only to a loopback host (for local
* development), with no credentials and no leading or trailing whitespace. The contract cannot
* pin the host, so a consumer must also check it against an allow-list (the portal checks
* `accounts.google.com` plus the local fake issuer).
*/
declare const authorizationUrlSchema: z8.ZodString;
/** The answer to a start: where to send the browser. It carries nothing else; the attempt secret is in a cookie. */
declare const googleStartResponseSchema: z8.ZodObject<{
	authorizationUrl: z8.ZodString;
}, z8.core.$strict>;
/** The answer to a start. */
type GoogleStartResponse = z8.infer<typeof googleStartResponseSchema>;
/** An attempt id as the portal receives it in the sign-up step's query and sends it to complete: 1 to 128 letters, digits, `_` or `-`. */
declare const attemptIdSchema: z8.ZodString;
/** The portal path of the step where a new Google user names an Organization or accepts an invitation. */
declare const GOOGLE_SIGN_UP_PATH = "/sign-up/google";
/** The query parameter of {@link GOOGLE_SIGN_UP_PATH} that holds the attempt id. */
declare const GOOGLE_SIGN_UP_ATTEMPT_PARAM = "attempt";
/** The portal path the callback redirects to when it fails. */
declare const GOOGLE_ERROR_PATH = "/sign-in";
/** The query parameter of {@link GOOGLE_ERROR_PATH} that holds the error code (an `area.reason` code). */
declare const GOOGLE_ERROR_PARAM = "error";
/** The base name of the attempt cookie. Auth adds {@link OIDC_COOKIE_SECURE_PREFIX} outside `local` only, because Safari refuses a `__Secure-` cookie over http even on loopback. */
declare const OIDC_COOKIE_BASE_NAME = "tula_oidc";
/** The prefix of the attempt cookie's name outside `local`. */
declare const OIDC_COOKIE_SECURE_PREFIX = "__Secure-";
/** The query of the portal's sign-up step after a Google sign-in: the attempt id. Unknown keys are rejected. */
declare const googleSignUpQuerySchema: z8.ZodObject<{
	attempt: z8.ZodString;
}, z8.core.$strict>;
/** The query of the portal's sign-in page after a failed Google sign-in: one error code. Unknown keys are rejected. */
declare const googleErrorQuerySchema: z8.ZodObject<{
	error: z8.ZodString;
}, z8.core.$strict>;
/**
* The body that finishes a Sign in with Google for a new user: the `attemptId` from the redirect
* (the secret is in the cookie) and exactly one way to get an Organization, an `organizationName`
* or an `invitationToken`. Unknown keys are rejected. The email is never sent: it is the one Google
* verified.
*/
declare const googleCompleteRequestSchema: z8.ZodObject<{
	attemptId: z8.ZodString;
	organizationName: z8.ZodOptional<z8.ZodString>;
	invitationToken: z8.ZodOptional<z8.ZodString>;
}, z8.core.$strict>;
/** The body that finishes a Sign in with Google. */
type GoogleCompleteRequest = z8.infer<typeof googleCompleteRequestSchema>;
/** The tokens of a signed-in session for the `browser` client: the refresh token is in the `Set-Cookie` header, never in the body. A secret: never log it. */
declare const browserSessionTokensSchema: z8.ZodObject<{
	sessionId: z8.ZodString;
	accessToken: z8.ZodString;
	accessTokenExpiresAt: z8.ZodISODateTime;
	organization: z8.ZodObject<{
		id: z8.ZodString;
		role: z8.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
	}, z8.core.$strict>;
	userId: z8.ZodOptional<z8.core.$ZodBranded<z8.ZodString, "usr", "out">>;
}, z8.core.$strict>;
/** The tokens of a signed-in session for the `browser` client. */
type BrowserSessionTokens = z8.infer<typeof browserSessionTokensSchema>;
/**
* The answer to a complete, shaped like the auth service's browser flow response so the portal has
* one completion path: the attempt `id`, its `kind`, `expiresAt`, a `complete` step and the
* `session` (for the `browser` client: the refresh token is in the cookie, never in the body).
* Fields it does not know, such as an attempt secret, are dropped. A secret: never log it.
*/
declare const googleCompleteResponseSchema: z8.ZodObject<{
	id: z8.ZodString;
	kind: z8.ZodEnum<{
		sign_in: "sign_in";
		sign_up: "sign_up";
	}>;
	expiresAt: z8.ZodISODateTime;
	step: z8.ZodObject<{
		status: z8.ZodLiteral<"complete">;
	}, z8.core.$strip>;
	session: z8.ZodObject<{
		sessionId: z8.ZodString;
		accessToken: z8.ZodString;
		accessTokenExpiresAt: z8.ZodISODateTime;
		organization: z8.ZodObject<{
			id: z8.ZodString;
			role: z8.ZodEnum<{
				admin: "admin";
				manager: "manager";
				owner: "owner";
				rep: "rep";
			}>;
		}, z8.core.$strict>;
		userId: z8.ZodOptional<z8.core.$ZodBranded<z8.ZodString, "usr", "out">>;
	}, z8.core.$strict>;
}, z8.core.$strip>;
/** The answer to a complete. */
type GoogleCompleteResponse = z8.infer<typeof googleCompleteResponseSchema>;
/** Which sign-in providers are on, so the portal hides a button that would only fail. */
declare const authProvidersSchema: z8.ZodObject<{
	google: z8.ZodDefault<z8.ZodBoolean>;
}, z8.core.$strip>;
/** Which sign-in providers are on. */
type AuthProviders = z8.infer<typeof authProvidersSchema>;
/** The path of the auth options route. */
declare const AUTH_OPTIONS_PATH = "/v1/client/auth-options";
/**
* The answer to the auth options route, `GET /v1/client/auth-options`, which the auth service
* owns (a new route): `providers` says which sign-in providers are on, so the portal hides a button
* that would only fail. A payload without `providers`, such as `{}`, parses with every provider
* off, and fields this schema does not know are dropped.
*/
declare const authOptionsResponseSchema: z8.ZodObject<{
	providers: z8.ZodDefault<z8.ZodObject<{
		google: z8.ZodDefault<z8.ZodBoolean>;
	}, z8.core.$strip>>;
}, z8.core.$strip>;
/** The answer to the auth options route. */
type AuthOptionsResponse = z8.infer<typeof authOptionsResponseSchema>;
/** What a service needs to describe one auth route for its OpenAPI document. */
type AuthRoute = {
	readonly method: "GET" | "POST";
	readonly path: string;
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly (AuthErrorCode | CoreErrorCode)[];
	/** Codes the route never answers as an HTTP status: they reach the browser as the `error` query parameter of a redirect. */
	readonly redirectErrors: readonly (AuthErrorCode | CoreErrorCode)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document. */
	readonly description: string;
};
/** The auth options route, owned by the auth service (a new route): which sign-in providers are on. */
declare const AUTH_OPTIONS_ROUTE: AuthRoute;
/**
* The Sign in with Google routes, by name: the description a service puts in its OpenAPI document,
* the success statuses and every error code each route may answer with. None needs a session. The
* callback answers every outcome but `oidc.disabled` with a 302, so its other codes are in
* `redirectErrors`: they reach the browser as the `error` query parameter of the redirect to
* `GOOGLE_ERROR_PATH`, not as an HTTP status.
*/
declare const GOOGLE_ROUTES: Readonly<Record<"start" | "callback" | "complete", AuthRoute>>;
import { z as z9 } from "zod";
/** A Booking: a time reserved on a Rep's calendar for a Prospect. `joinUrl` is the video link, null for a phone Booking. */
declare const bookingSchema: z9.ZodObject<{
	id: z9.core.$ZodBranded<z9.ZodString, "bkg", "out">;
	bookingTypeId: z9.core.$ZodBranded<z9.ZodString, "bkt", "out">;
	repMembershipId: z9.core.$ZodBranded<z9.ZodString, "mem", "out">;
	prospectId: z9.core.$ZodBranded<z9.ZodString, "prs", "out">;
	startsAt: z9.ZodISODateTime;
	endsAt: z9.ZodISODateTime;
	mode: z9.ZodEnum<{
		phone: "phone";
		video: "video";
	}>;
	state: z9.ZodEnum<{
		cancelled: "cancelled";
		confirmed: "confirmed";
		pending: "pending";
	}>;
	origin: z9.ZodEnum<{
		agent: "agent";
		member: "member";
		public: "public";
	}>;
	joinUrl: z9.ZodNullable<z9.ZodString>;
	routingDecisionId: z9.ZodNullable<z9.core.$ZodBranded<z9.ZodString, "rdc", "out">>;
	createdAt: z9.ZodISODateTime;
	cancelledAt: z9.ZodNullable<z9.ZodISODateTime>;
}, z9.core.$strict>;
/** A Booking. */
type Booking = z9.infer<typeof bookingSchema>;
/** The path parameters of a request about one Booking. */
declare const bookingParamsSchema: z9.ZodObject<{
	bookingId: z9.core.$ZodBranded<z9.ZodString, "bkg", "out">;
}, z9.core.$strict>;
/**
* The query parameters of a request for free times: the Booking Type, the Prospect (so routing
* can choose the Reps) and a range of at most 14 days. One cursor-paginated page at a time.
*/
declare const listSlotsQuerySchema: z9.ZodObject<{
	cursor: z9.ZodOptional<z9.ZodString>;
	limit: z9.ZodDefault<z9.ZodPipe<z9.ZodPipe<z9.ZodUnion<readonly [z9.ZodNumber, z9.ZodString]>, z9.ZodTransform<number, string | number>>, z9.ZodNumber>>;
	bookingTypeId: z9.core.$ZodBranded<z9.ZodString, "bkt", "out">;
	prospectId: z9.core.$ZodBranded<z9.ZodString, "prs", "out">;
	from: z9.ZodISODateTime;
	to: z9.ZodISODateTime;
}, z9.core.$strict>;
/** The query parameters of a request for free times. */
type ListSlotsQuery = z9.infer<typeof listSlotsQuerySchema>;
/** A free time with the Rep who would take it. */
declare const slotSchema: z9.ZodObject<{
	startsAt: z9.ZodISODateTime;
	endsAt: z9.ZodISODateTime;
	repMembershipId: z9.core.$ZodBranded<z9.ZodString, "mem", "out">;
}, z9.core.$strict>;
/** A free time with the Rep who would take it. */
type Slot = z9.infer<typeof slotSchema>;
/** One page of free times, earliest first. */
declare const slotPageSchema: z9.ZodObject<{
	items: z9.ZodArray<z9.ZodObject<{
		startsAt: z9.ZodISODateTime;
		endsAt: z9.ZodISODateTime;
		repMembershipId: z9.core.$ZodBranded<z9.ZodString, "mem", "out">;
	}, z9.core.$strict>>;
	nextCursor: z9.ZodNullable<z9.ZodString>;
}, z9.core.$strip>;
/**
* The headers of a request to book. The `Idempotency-Key` header is required (header names arrive
* lower-cased): a retry of the same key answers the original Booking and writes the calendar once,
* and the same key with a different body is `request.idempotency_key_reused`.
*/
declare const bookHeadersSchema: z9.ZodObject<{
	"idempotency-key": z9.ZodString;
}, z9.core.$strip>;
/**
* The body of a request to book a time for a Prospect. The idempotency key is not in the body:
* see `bookHeadersSchema`. `repMembershipId` is the Rep a slot named; when absent core routes
* the Prospect and takes the first candidate free at that time.
*/
declare const bookRequestSchema: z9.ZodObject<{
	bookingTypeId: z9.core.$ZodBranded<z9.ZodString, "bkt", "out">;
	prospectId: z9.core.$ZodBranded<z9.ZodString, "prs", "out">;
	startsAt: z9.ZodISODateTime;
	repMembershipId: z9.ZodOptional<z9.core.$ZodBranded<z9.ZodString, "mem", "out">>;
}, z9.core.$strict>;
/** The body of a request to book. */
type BookRequest = z9.infer<typeof bookRequestSchema>;
/** The body of a request to move a Booking to another start time; the length stays. Idempotent by end state. */
declare const rescheduleBookingRequestSchema: z9.ZodObject<{
	startsAt: z9.ZodISODateTime;
}, z9.core.$strict>;
/** The body of a request to move a Booking. */
type RescheduleBookingRequest = z9.infer<typeof rescheduleBookingRequestSchema>;
/** The cursor position a Booking list resumes from: latest start first, then id. */
declare const bookingCursorSchema: z9.ZodObject<{
	startsAt: z9.ZodISODateTime;
	id: z9.core.$ZodBranded<z9.ZodString, "bkg", "out">;
}, z9.core.$strict>;
/**
* The query parameters of a request to list Bookings: latest start first, one cursor-paginated
* page at a time, optionally narrowed by state, Rep, Prospect and a start range. What the caller
* sees is decided from the token and a filter never widens it.
*/
declare const listBookingsQuerySchema: z9.ZodObject<{
	cursor: z9.ZodOptional<z9.ZodString>;
	limit: z9.ZodDefault<z9.ZodPipe<z9.ZodPipe<z9.ZodUnion<readonly [z9.ZodNumber, z9.ZodString]>, z9.ZodTransform<number, string | number>>, z9.ZodNumber>>;
	state: z9.ZodOptional<z9.ZodEnum<{
		cancelled: "cancelled";
		confirmed: "confirmed";
		pending: "pending";
	}>>;
	repMembershipId: z9.ZodOptional<z9.core.$ZodBranded<z9.ZodString, "mem", "out">>;
	prospectId: z9.ZodOptional<z9.core.$ZodBranded<z9.ZodString, "prs", "out">>;
	from: z9.ZodOptional<z9.ZodISODateTime>;
	to: z9.ZodOptional<z9.ZodISODateTime>;
}, z9.core.$strict>;
/** The query parameters of a request to list Bookings. */
type ListBookingsQuery = z9.infer<typeof listBookingsQuerySchema>;
/** One page of Bookings. */
declare const bookingPageSchema: z9.ZodObject<{
	items: z9.ZodArray<z9.ZodObject<{
		id: z9.core.$ZodBranded<z9.ZodString, "bkg", "out">;
		bookingTypeId: z9.core.$ZodBranded<z9.ZodString, "bkt", "out">;
		repMembershipId: z9.core.$ZodBranded<z9.ZodString, "mem", "out">;
		prospectId: z9.core.$ZodBranded<z9.ZodString, "prs", "out">;
		startsAt: z9.ZodISODateTime;
		endsAt: z9.ZodISODateTime;
		mode: z9.ZodEnum<{
			phone: "phone";
			video: "video";
		}>;
		state: z9.ZodEnum<{
			cancelled: "cancelled";
			confirmed: "confirmed";
			pending: "pending";
		}>;
		origin: z9.ZodEnum<{
			agent: "agent";
			member: "member";
			public: "public";
		}>;
		joinUrl: z9.ZodNullable<z9.ZodString>;
		routingDecisionId: z9.ZodNullable<z9.core.$ZodBranded<z9.ZodString, "rdc", "out">>;
		createdAt: z9.ZodISODateTime;
		cancelledAt: z9.ZodNullable<z9.ZodISODateTime>;
	}, z9.core.$strict>>;
	nextCursor: z9.ZodNullable<z9.ZodString>;
}, z9.core.$strip>;
/** The path parameters of a public request: the Booking Type's unguessable token. */
declare const publicBookingParamsSchema: z9.ZodObject<{
	token: z9.ZodString;
}, z9.core.$strict>;
/**
* The query parameters of a public request for free times (nobody signed in): a range of at most
* 14 days, one cursor-paginated page at a time.
*/
declare const publicListSlotsQuerySchema: z9.ZodObject<{
	cursor: z9.ZodOptional<z9.ZodString>;
	limit: z9.ZodDefault<z9.ZodPipe<z9.ZodPipe<z9.ZodUnion<readonly [z9.ZodNumber, z9.ZodString]>, z9.ZodTransform<number, string | number>>, z9.ZodNumber>>;
	from: z9.ZodISODateTime;
	to: z9.ZodISODateTime;
}, z9.core.$strict>;
/**
* A free time as a Prospect sees it: a start and an end, nothing more. No Rep, no event title, no
* attendee and no busy block ever reaches a public page.
*/
declare const publicSlotSchema: z9.ZodObject<{
	startsAt: z9.ZodISODateTime;
	endsAt: z9.ZodISODateTime;
}, z9.core.$strict>;
/** A free time as a Prospect sees it. */
type PublicSlot = z9.infer<typeof publicSlotSchema>;
/** What a public page shows about the Booking Type: its name, length and mode. */
declare const publicBookingTypeSchema: z9.ZodObject<{
	name: z9.ZodString;
	lengthMinutes: z9.ZodNumber;
	mode: z9.ZodEnum<{
		phone: "phone";
		video: "video";
	}>;
}, z9.core.$strict>;
/** What a public page shows about the Booking Type. */
type PublicBookingType = z9.infer<typeof publicBookingTypeSchema>;
/** One page of free times for a public page, with the Booking Type they belong to. */
declare const publicSlotPageSchema: z9.ZodObject<{
	items: z9.ZodArray<z9.ZodObject<{
		startsAt: z9.ZodISODateTime;
		endsAt: z9.ZodISODateTime;
	}, z9.core.$strict>>;
	nextCursor: z9.ZodNullable<z9.ZodString>;
	bookingType: z9.ZodObject<{
		name: z9.ZodString;
		lengthMinutes: z9.ZodNumber;
		mode: z9.ZodEnum<{
			phone: "phone";
			video: "video";
		}>;
	}, z9.core.$strict>;
}, z9.core.$strip>;
/** The longest honeypot value a public booking form may send. */
declare const MAX_PUBLIC_BOOKING_FIELD_LENGTH = 200;
/**
* The body of a public request to book (nobody signed in): the Prospect's name and work email
* (folded to lower case), the chosen start and their time zone. The honeypot, `website`, is a
* field the form hides from people, so a non-empty value marks a bot: it still parses, so the
* service answers as for a real request and stores nothing. Core upserts the Prospect by email.
* The idempotency key is the `Idempotency-Key` header (`bookHeadersSchema`).
*/
declare const publicBookRequestSchema: z9.ZodObject<{
	name: z9.ZodPipe<z9.ZodString, z9.ZodString>;
	email: z9.ZodPipe<z9.ZodPipe<z9.ZodString, z9.ZodTransform<string, string>>, z9.ZodString>;
	startsAt: z9.ZodISODateTime;
	timeZone: z9.ZodString;
	website: z9.ZodDefault<z9.ZodString>;
}, z9.core.$strict>;
/** The body of a public request to book. */
type PublicBookRequest = z9.infer<typeof publicBookRequestSchema>;
/**
* The confirmation a Prospect gets: the time and how to join, and no id of a Rep, a Prospect or
* the Organization. The invitation itself is the calendar's own.
*/
declare const publicBookingConfirmationSchema: z9.ZodObject<{
	id: z9.core.$ZodBranded<z9.ZodString, "bkg", "out">;
	startsAt: z9.ZodISODateTime;
	endsAt: z9.ZodISODateTime;
	mode: z9.ZodEnum<{
		phone: "phone";
		video: "video";
	}>;
	joinUrl: z9.ZodNullable<z9.ZodString>;
}, z9.core.$strict>;
/** The confirmation a Prospect gets. */
type PublicBookingConfirmation = z9.infer<typeof publicBookingConfirmationSchema>;
import { z as z10 } from "zod";
/** The longest a Booking may be, in minutes. */
declare const MAX_BOOKING_LENGTH_MINUTES = 480;
/** The longest buffer before or after a Booking, in minutes. */
declare const MAX_BOOKING_BUFFER_MINUTES = 120;
/** The longest minimum notice before a Booking, in minutes: 30 days. */
declare const MAX_BOOKING_NOTICE_MINUTES = 43200;
/**
* A Booking Type: a named kind of Booking with a length, buffers, minimum notice and mode, such as
* "Discovery, 30 minutes". `publicToken` is the unguessable part of its public link and is shown
* to Owner and Admin only (null for everyone else).
*/
declare const bookingTypeSchema: z10.ZodObject<{
	name: z10.ZodPipe<z10.ZodString, z10.ZodString>;
	lengthMinutes: z10.ZodNumber;
	bufferBeforeMinutes: z10.ZodNumber;
	bufferAfterMinutes: z10.ZodNumber;
	minimumNoticeMinutes: z10.ZodNumber;
	mode: z10.ZodEnum<{
		phone: "phone";
		video: "video";
	}>;
	id: z10.core.$ZodBranded<z10.ZodString, "bkt", "out">;
	state: z10.ZodEnum<{
		active: "active";
		retired: "retired";
	}>;
	publicToken: z10.ZodNullable<z10.ZodString>;
	createdAt: z10.ZodISODateTime;
}, z10.core.$strict>;
/** A Booking Type. */
type BookingType = z10.infer<typeof bookingTypeSchema>;
/** The body of a request to create a Booking Type. Core makes the public token. */
declare const createBookingTypeRequestSchema: z10.ZodObject<{
	name: z10.ZodPipe<z10.ZodString, z10.ZodString>;
	lengthMinutes: z10.ZodNumber;
	bufferBeforeMinutes: z10.ZodNumber;
	bufferAfterMinutes: z10.ZodNumber;
	minimumNoticeMinutes: z10.ZodNumber;
	mode: z10.ZodEnum<{
		phone: "phone";
		video: "video";
	}>;
}, z10.core.$strict>;
/** The body of a request to create a Booking Type. */
type CreateBookingTypeRequest = z10.infer<typeof createBookingTypeRequestSchema>;
/** The body of a request to change a Booking Type: any of the fields, at least one. */
declare const updateBookingTypeRequestSchema: z10.ZodObject<{
	name: z10.ZodOptional<z10.ZodPipe<z10.ZodString, z10.ZodString>>;
	lengthMinutes: z10.ZodOptional<z10.ZodNumber>;
	bufferBeforeMinutes: z10.ZodOptional<z10.ZodNumber>;
	bufferAfterMinutes: z10.ZodOptional<z10.ZodNumber>;
	minimumNoticeMinutes: z10.ZodOptional<z10.ZodNumber>;
	mode: z10.ZodOptional<z10.ZodEnum<{
		phone: "phone";
		video: "video";
	}>>;
}, z10.core.$strict>;
/** The path parameters of a request about one Booking Type. */
declare const bookingTypeParamsSchema: z10.ZodObject<{
	bookingTypeId: z10.core.$ZodBranded<z10.ZodString, "bkt", "out">;
}, z10.core.$strict>;
/** The position a Booking Type list resumes from: by creation time then id. */
declare const bookingTypeCursorSchema: z10.ZodObject<{
	createdAt: z10.ZodISODateTime;
	id: z10.core.$ZodBranded<z10.ZodString, "bkt", "out">;
}, z10.core.$strict>;
/** The query parameters of a request to list Booking Types, optionally of one state. */
declare const listBookingTypesQuerySchema: z10.ZodObject<{
	cursor: z10.ZodOptional<z10.ZodString>;
	limit: z10.ZodDefault<z10.ZodPipe<z10.ZodPipe<z10.ZodUnion<readonly [z10.ZodNumber, z10.ZodString]>, z10.ZodTransform<number, string | number>>, z10.ZodNumber>>;
	state: z10.ZodOptional<z10.ZodEnum<{
		active: "active";
		retired: "retired";
	}>>;
}, z10.core.$strict>;
import { z as z11 } from "zod";
/**
* The body of a request to start connecting the caller's calendar. Core answers with the vendor's
* consent URL; the redirect address is core's own configuration and never comes from the request.
*/
declare const startCalendarConnectionRequestSchema: z11.ZodObject<{
	provider: z11.ZodEnum<{
		google: "google";
	}>;
}, z11.core.$strict>;
/** The body of a request to start a Calendar Connection. */
type StartCalendarConnectionRequest = z11.infer<typeof startCalendarConnectionRequestSchema>;
/** The answer to starting a Calendar Connection: where to send the Rep, and the `state` to hand back on completion. */
declare const startCalendarConnectionResponseSchema: z11.ZodObject<{
	authorizationUrl: z11.ZodURL;
	state: z11.ZodString;
}, z11.core.$strict>;
/** The answer to starting a Calendar Connection. */
type StartCalendarConnectionResponse = z11.infer<typeof startCalendarConnectionResponseSchema>;
/** The body of a request to complete a Calendar Connection with what the vendor returned. The code is used once and never stored or logged. */
declare const completeCalendarConnectionRequestSchema: z11.ZodObject<{
	state: z11.ZodString;
	code: z11.ZodString;
}, z11.core.$strict>;
/** The body of a request to complete a Calendar Connection. */
type CompleteCalendarConnectionRequest = z11.infer<typeof completeCalendarConnectionRequestSchema>;
/**
* A Rep's Calendar Connection: the vendor, whether it is healthy and when it was last checked.
* It carries no token and no calendar content; tokens are never returned.
*/
declare const calendarConnectionSchema: z11.ZodObject<{
	membershipId: z11.core.$ZodBranded<z11.ZodString, "mem", "out">;
	provider: z11.ZodEnum<{
		google: "google";
	}>;
	state: z11.ZodEnum<{
		healthy: "healthy";
		needs_reconnect: "needs_reconnect";
	}>;
	connectedAt: z11.ZodISODateTime;
	lastCheckedAt: z11.ZodNullable<z11.ZodISODateTime>;
}, z11.core.$strict>;
/** A Calendar Connection. */
type CalendarConnection = z11.infer<typeof calendarConnectionSchema>;
/** The days of the week, Monday first. */
declare const WEEKDAYS: readonly ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
/** A day of the week. */
declare const weekdaySchema: z11.ZodEnum<{
	fri: "fri";
	mon: "mon";
	sat: "sat";
	sun: "sun";
	thu: "thu";
	tue: "tue";
	wed: "wed";
}>;
/** A day of the week. */
type Weekday = z11.infer<typeof weekdaySchema>;
/** The most working windows one day may have. */
declare const MAX_WINDOWS_PER_DAY = 4;
/** A time of day as `HH:MM` on a 24-hour clock. */
declare const timeOfDaySchema: z11.ZodString;
/** A working window within one day: `start` before `end`, both `HH:MM`. */
declare const workingWindowSchema: z11.ZodObject<{
	start: z11.ZodString;
	end: z11.ZodString;
}, z11.core.$strict>;
/** A working window. */
type WorkingWindow = z11.infer<typeof workingWindowSchema>;
/** One day's working windows: ordered, not overlapping, at most {@link MAX_WINDOWS_PER_DAY}. */
declare const workingDaySchema: z11.ZodObject<{
	day: z11.ZodEnum<{
		fri: "fri";
		mon: "mon";
		sat: "sat";
		sun: "sun";
		thu: "thu";
		tue: "tue";
		wed: "wed";
	}>;
	windows: z11.ZodArray<z11.ZodObject<{
		start: z11.ZodString;
		end: z11.ZodString;
	}, z11.core.$strict>>;
}, z11.core.$strict>;
/** The most Bookings a Rep may allow in one day. */
declare const MAX_DAILY_BOOKING_CAP = 50;
/** The longest a Rep may be marked away, in days. */
declare const MAX_AWAY_DAYS = 365;
/**
* A Rep's availability: time zone, working hours (days not listed are off), an optional cap on
* Bookings per day (null for no cap) and an optional time they are away until (null when not away).
* Round-robin skips a Rep who is off shift, away or at the cap.
*/
declare const availabilitySchema: z11.ZodObject<{
	timeZone: z11.ZodString;
	hours: z11.ZodArray<z11.ZodObject<{
		day: z11.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>;
		windows: z11.ZodArray<z11.ZodObject<{
			start: z11.ZodString;
			end: z11.ZodString;
		}, z11.core.$strict>>;
	}, z11.core.$strict>>;
	dailyCap: z11.ZodNullable<z11.ZodNumber>;
	awayUntil: z11.ZodNullable<z11.ZodISODateTime>;
}, z11.core.$strict>;
/** A Rep's availability. */
type Availability = z11.infer<typeof availabilitySchema>;
import { ErrorDefinition as ErrorDefinition_8gwh454 } from "..";
/**
* The errors the booking, routing and calendar routes return, as `area.reason` codes. A role that
* is not allowed is the common `auth.forbidden`. A record of another Organization, or one the
* caller may not see (a Rep's view of another Rep's Booking, a Manager's view outside their Team),
* is the `not_found` code of its kind (404, never 403), so existence is not revealed. A public
* route answers a token it does not know as `booking.type_not_found`.
*
* - `booking.slot_taken` (409): the time was taken (or became busy) before the Booking was made;
*   the caller picks another time. Nothing is written.
* - `booking.calendar_unavailable` (503): the Rep's calendar could not be read or written in time;
*   the Booking was removed, nothing half-written remains, and a retry with the same
*   `Idempotency-Key` is safe.
* - `booking.no_eligible_rep` (409): routing found no Rep who can take this Prospect.
* - `booking.slot_invalid` (422): the start is in the past, inside the minimum notice, outside
*   the 14-day window or not on a time the slots offered.
* - `booking.type_invalid` (422): a Booking Type with a length, buffer or notice core refuses.
* - `booking.type_not_found` (404): the Booking Type is unknown, retired, or its token is wrong.
* - `booking.not_found` (404): the Booking is unknown or not the caller's to see.
* - `booking.not_active` (409): the Booking is cancelled and cannot be moved.
* - `routing.rule_invalid` (422): a Routing Rule names a Team, Rep or Booking Type that is not in
*   the Organization, is not a Rep, has a second default, or puts the default anywhere but last.
* - `routing.rule_not_found` (404): the Routing Rule is unknown or not the caller's to change.
* - `calendar.not_connected` (404): the caller has no Calendar Connection.
* - `calendar.authorization_failed` (422): the vendor refused the grant, or the `state` is wrong
*   or expired.
* - `calendar.hours_invalid` (422): the time zone is unknown or the hours cannot be kept.
*/
declare const BOOKING_ERRORS: {
	readonly "booking.calendar_unavailable": ErrorDefinition_8gwh454<"booking.calendar_unavailable">;
	readonly "booking.no_eligible_rep": ErrorDefinition_8gwh454<"booking.no_eligible_rep">;
	readonly "booking.not_active": ErrorDefinition_8gwh454<"booking.not_active">;
	readonly "booking.not_found": ErrorDefinition_8gwh454<"booking.not_found">;
	readonly "booking.slot_invalid": ErrorDefinition_8gwh454<"booking.slot_invalid">;
	readonly "booking.slot_taken": ErrorDefinition_8gwh454<"booking.slot_taken">;
	readonly "booking.type_invalid": ErrorDefinition_8gwh454<"booking.type_invalid">;
	readonly "booking.type_not_found": ErrorDefinition_8gwh454<"booking.type_not_found">;
	readonly "calendar.authorization_failed": ErrorDefinition_8gwh454<"calendar.authorization_failed">;
	readonly "calendar.hours_invalid": ErrorDefinition_8gwh454<"calendar.hours_invalid">;
	readonly "calendar.not_connected": ErrorDefinition_8gwh454<"calendar.not_connected">;
	readonly "routing.rule_invalid": ErrorDefinition_8gwh454<"routing.rule_invalid">;
	readonly "routing.rule_not_found": ErrorDefinition_8gwh454<"routing.rule_not_found">;
};
/** A booking, routing or calendar error code. */
type BookingErrorCode = keyof typeof BOOKING_ERRORS;
import { z as z12 } from "zod";
/**
* `booking.created` (version 1): a Booking was confirmed on a Rep's calendar. Ids, the times, the
* mode and where it came from: no Prospect name, email or number, no join link and no event text.
*/
declare const bookingCreatedEvent: {
	type: "booking.created";
	version: 1;
	schema: z12.ZodObject<{
		id: z12.core.$ZodBranded<z12.ZodString, "evt", "out">;
		occurredAt: z12.ZodISODateTime;
		organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
		region: z12.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z12.ZodLiteral<"booking.created">;
		version: z12.ZodLiteral<1>;
		data: z12.ZodObject<{
			bookingId: z12.core.$ZodBranded<z12.ZodString, "bkg", "out">;
			bookingTypeId: z12.core.$ZodBranded<z12.ZodString, "bkt", "out">;
			repMembershipId: z12.core.$ZodBranded<z12.ZodString, "mem", "out">;
			prospectId: z12.core.$ZodBranded<z12.ZodString, "prs", "out">;
			startsAt: z12.ZodISODateTime;
			endsAt: z12.ZodISODateTime;
			mode: z12.ZodEnum<{
				phone: "phone";
				video: "video";
			}>;
			origin: z12.ZodEnum<{
				agent: "agent";
				member: "member";
				public: "public";
			}>;
			routingDecisionId: z12.ZodNullable<z12.core.$ZodBranded<z12.ZodString, "rdc", "out">>;
		}, z12.core.$strict>;
	}, z12.core.$strip>;
	parse: (input: unknown) => {
		id: string & z12.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z12.$brand<"org">;
		region: "eu" | "us";
		type: "booking.created";
		version: 1;
		data: {
			bookingId: string & z12.$brand<"bkg">;
			bookingTypeId: string & z12.$brand<"bkt">;
			repMembershipId: string & z12.$brand<"mem">;
			prospectId: string & z12.$brand<"prs">;
			startsAt: string;
			endsAt: string;
			mode: "phone" | "video";
			origin: "agent" | "member" | "public";
			routingDecisionId: (string & z12.$brand<"rdc">) | null;
		};
	};
	safeParse: (input: unknown) => z12.ZodSafeParseResult<{
		id: string & z12.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z12.$brand<"org">;
		region: "eu" | "us";
		type: "booking.created";
		version: 1;
		data: {
			bookingId: string & z12.$brand<"bkg">;
			bookingTypeId: string & z12.$brand<"bkt">;
			repMembershipId: string & z12.$brand<"mem">;
			prospectId: string & z12.$brand<"prs">;
			startsAt: string;
			endsAt: string;
			mode: "phone" | "video";
			origin: "agent" | "member" | "public";
			routingDecisionId: (string & z12.$brand<"rdc">) | null;
		};
	}>;
};
/** Who cancelled a Booking: a member of the Organization, the Prospect, or the system (the Rep's calendar was removed). */
declare const BOOKING_CANCELLED_BY: readonly ["member", "prospect", "system"];
/** Who cancelled a Booking. */
declare const bookingCancelledBySchema: z12.ZodEnum<{
	member: "member";
	prospect: "prospect";
	system: "system";
}>;
/** `booking.cancelled` (version 1): a Booking was cancelled. Ids and times only. */
declare const bookingCancelledEvent: {
	type: "booking.cancelled";
	version: 1;
	schema: z12.ZodObject<{
		id: z12.core.$ZodBranded<z12.ZodString, "evt", "out">;
		occurredAt: z12.ZodISODateTime;
		organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
		region: z12.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z12.ZodLiteral<"booking.cancelled">;
		version: z12.ZodLiteral<1>;
		data: z12.ZodObject<{
			bookingId: z12.core.$ZodBranded<z12.ZodString, "bkg", "out">;
			bookingTypeId: z12.core.$ZodBranded<z12.ZodString, "bkt", "out">;
			repMembershipId: z12.core.$ZodBranded<z12.ZodString, "mem", "out">;
			prospectId: z12.core.$ZodBranded<z12.ZodString, "prs", "out">;
			startsAt: z12.ZodISODateTime;
			endsAt: z12.ZodISODateTime;
			cancelledBy: z12.ZodEnum<{
				member: "member";
				prospect: "prospect";
				system: "system";
			}>;
			cancelledAt: z12.ZodISODateTime;
		}, z12.core.$strict>;
	}, z12.core.$strip>;
	parse: (input: unknown) => {
		id: string & z12.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z12.$brand<"org">;
		region: "eu" | "us";
		type: "booking.cancelled";
		version: 1;
		data: {
			bookingId: string & z12.$brand<"bkg">;
			bookingTypeId: string & z12.$brand<"bkt">;
			repMembershipId: string & z12.$brand<"mem">;
			prospectId: string & z12.$brand<"prs">;
			startsAt: string;
			endsAt: string;
			cancelledBy: "member" | "prospect" | "system";
			cancelledAt: string;
		};
	};
	safeParse: (input: unknown) => z12.ZodSafeParseResult<{
		id: string & z12.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z12.$brand<"org">;
		region: "eu" | "us";
		type: "booking.cancelled";
		version: 1;
		data: {
			bookingId: string & z12.$brand<"bkg">;
			bookingTypeId: string & z12.$brand<"bkt">;
			repMembershipId: string & z12.$brand<"mem">;
			prospectId: string & z12.$brand<"prs">;
			startsAt: string;
			endsAt: string;
			cancelledBy: "member" | "prospect" | "system";
			cancelledAt: string;
		};
	}>;
};
/** `booking.rescheduled` (version 1): a Booking moved to another time. Carries the old start and the new times; ids only. */
declare const bookingRescheduledEvent: {
	type: "booking.rescheduled";
	version: 1;
	schema: z12.ZodObject<{
		id: z12.core.$ZodBranded<z12.ZodString, "evt", "out">;
		occurredAt: z12.ZodISODateTime;
		organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
		region: z12.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z12.ZodLiteral<"booking.rescheduled">;
		version: z12.ZodLiteral<1>;
		data: z12.ZodObject<{
			bookingId: z12.core.$ZodBranded<z12.ZodString, "bkg", "out">;
			bookingTypeId: z12.core.$ZodBranded<z12.ZodString, "bkt", "out">;
			repMembershipId: z12.core.$ZodBranded<z12.ZodString, "mem", "out">;
			prospectId: z12.core.$ZodBranded<z12.ZodString, "prs", "out">;
			previousStartsAt: z12.ZodISODateTime;
			startsAt: z12.ZodISODateTime;
			endsAt: z12.ZodISODateTime;
		}, z12.core.$strict>;
	}, z12.core.$strip>;
	parse: (input: unknown) => {
		id: string & z12.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z12.$brand<"org">;
		region: "eu" | "us";
		type: "booking.rescheduled";
		version: 1;
		data: {
			bookingId: string & z12.$brand<"bkg">;
			bookingTypeId: string & z12.$brand<"bkt">;
			repMembershipId: string & z12.$brand<"mem">;
			prospectId: string & z12.$brand<"prs">;
			previousStartsAt: string;
			startsAt: string;
			endsAt: string;
		};
	};
	safeParse: (input: unknown) => z12.ZodSafeParseResult<{
		id: string & z12.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z12.$brand<"org">;
		region: "eu" | "us";
		type: "booking.rescheduled";
		version: 1;
		data: {
			bookingId: string & z12.$brand<"bkg">;
			bookingTypeId: string & z12.$brand<"bkt">;
			repMembershipId: string & z12.$brand<"mem">;
			prospectId: string & z12.$brand<"prs">;
			previousStartsAt: string;
			startsAt: string;
			endsAt: string;
		};
	}>;
};
/** Every booking event, by type. */
declare const BOOKING_EVENTS: {
	readonly "booking.created": {
		type: "booking.created";
		version: 1;
		schema: z12.ZodObject<{
			id: z12.core.$ZodBranded<z12.ZodString, "evt", "out">;
			occurredAt: z12.ZodISODateTime;
			organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
			region: z12.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z12.ZodLiteral<"booking.created">;
			version: z12.ZodLiteral<1>;
			data: z12.ZodObject<{
				bookingId: z12.core.$ZodBranded<z12.ZodString, "bkg", "out">;
				bookingTypeId: z12.core.$ZodBranded<z12.ZodString, "bkt", "out">;
				repMembershipId: z12.core.$ZodBranded<z12.ZodString, "mem", "out">;
				prospectId: z12.core.$ZodBranded<z12.ZodString, "prs", "out">;
				startsAt: z12.ZodISODateTime;
				endsAt: z12.ZodISODateTime;
				mode: z12.ZodEnum<{
					phone: "phone";
					video: "video";
				}>;
				origin: z12.ZodEnum<{
					agent: "agent";
					member: "member";
					public: "public";
				}>;
				routingDecisionId: z12.ZodNullable<z12.core.$ZodBranded<z12.ZodString, "rdc", "out">>;
			}, z12.core.$strict>;
		}, z12.core.$strip>;
		parse: (input: unknown) => {
			id: string & z12.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z12.$brand<"org">;
			region: "eu" | "us";
			type: "booking.created";
			version: 1;
			data: {
				bookingId: string & z12.$brand<"bkg">;
				bookingTypeId: string & z12.$brand<"bkt">;
				repMembershipId: string & z12.$brand<"mem">;
				prospectId: string & z12.$brand<"prs">;
				startsAt: string;
				endsAt: string;
				mode: "phone" | "video";
				origin: "agent" | "member" | "public";
				routingDecisionId: (string & z12.$brand<"rdc">) | null;
			};
		};
		safeParse: (input: unknown) => z12.ZodSafeParseResult<{
			id: string & z12.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z12.$brand<"org">;
			region: "eu" | "us";
			type: "booking.created";
			version: 1;
			data: {
				bookingId: string & z12.$brand<"bkg">;
				bookingTypeId: string & z12.$brand<"bkt">;
				repMembershipId: string & z12.$brand<"mem">;
				prospectId: string & z12.$brand<"prs">;
				startsAt: string;
				endsAt: string;
				mode: "phone" | "video";
				origin: "agent" | "member" | "public";
				routingDecisionId: (string & z12.$brand<"rdc">) | null;
			};
		}>;
	};
	readonly "booking.cancelled": {
		type: "booking.cancelled";
		version: 1;
		schema: z12.ZodObject<{
			id: z12.core.$ZodBranded<z12.ZodString, "evt", "out">;
			occurredAt: z12.ZodISODateTime;
			organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
			region: z12.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z12.ZodLiteral<"booking.cancelled">;
			version: z12.ZodLiteral<1>;
			data: z12.ZodObject<{
				bookingId: z12.core.$ZodBranded<z12.ZodString, "bkg", "out">;
				bookingTypeId: z12.core.$ZodBranded<z12.ZodString, "bkt", "out">;
				repMembershipId: z12.core.$ZodBranded<z12.ZodString, "mem", "out">;
				prospectId: z12.core.$ZodBranded<z12.ZodString, "prs", "out">;
				startsAt: z12.ZodISODateTime;
				endsAt: z12.ZodISODateTime;
				cancelledBy: z12.ZodEnum<{
					member: "member";
					prospect: "prospect";
					system: "system";
				}>;
				cancelledAt: z12.ZodISODateTime;
			}, z12.core.$strict>;
		}, z12.core.$strip>;
		parse: (input: unknown) => {
			id: string & z12.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z12.$brand<"org">;
			region: "eu" | "us";
			type: "booking.cancelled";
			version: 1;
			data: {
				bookingId: string & z12.$brand<"bkg">;
				bookingTypeId: string & z12.$brand<"bkt">;
				repMembershipId: string & z12.$brand<"mem">;
				prospectId: string & z12.$brand<"prs">;
				startsAt: string;
				endsAt: string;
				cancelledBy: "member" | "prospect" | "system";
				cancelledAt: string;
			};
		};
		safeParse: (input: unknown) => z12.ZodSafeParseResult<{
			id: string & z12.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z12.$brand<"org">;
			region: "eu" | "us";
			type: "booking.cancelled";
			version: 1;
			data: {
				bookingId: string & z12.$brand<"bkg">;
				bookingTypeId: string & z12.$brand<"bkt">;
				repMembershipId: string & z12.$brand<"mem">;
				prospectId: string & z12.$brand<"prs">;
				startsAt: string;
				endsAt: string;
				cancelledBy: "member" | "prospect" | "system";
				cancelledAt: string;
			};
		}>;
	};
	readonly "booking.rescheduled": {
		type: "booking.rescheduled";
		version: 1;
		schema: z12.ZodObject<{
			id: z12.core.$ZodBranded<z12.ZodString, "evt", "out">;
			occurredAt: z12.ZodISODateTime;
			organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
			region: z12.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z12.ZodLiteral<"booking.rescheduled">;
			version: z12.ZodLiteral<1>;
			data: z12.ZodObject<{
				bookingId: z12.core.$ZodBranded<z12.ZodString, "bkg", "out">;
				bookingTypeId: z12.core.$ZodBranded<z12.ZodString, "bkt", "out">;
				repMembershipId: z12.core.$ZodBranded<z12.ZodString, "mem", "out">;
				prospectId: z12.core.$ZodBranded<z12.ZodString, "prs", "out">;
				previousStartsAt: z12.ZodISODateTime;
				startsAt: z12.ZodISODateTime;
				endsAt: z12.ZodISODateTime;
			}, z12.core.$strict>;
		}, z12.core.$strip>;
		parse: (input: unknown) => {
			id: string & z12.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z12.$brand<"org">;
			region: "eu" | "us";
			type: "booking.rescheduled";
			version: 1;
			data: {
				bookingId: string & z12.$brand<"bkg">;
				bookingTypeId: string & z12.$brand<"bkt">;
				repMembershipId: string & z12.$brand<"mem">;
				prospectId: string & z12.$brand<"prs">;
				previousStartsAt: string;
				startsAt: string;
				endsAt: string;
			};
		};
		safeParse: (input: unknown) => z12.ZodSafeParseResult<{
			id: string & z12.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z12.$brand<"org">;
			region: "eu" | "us";
			type: "booking.rescheduled";
			version: 1;
			data: {
				bookingId: string & z12.$brand<"bkg">;
				bookingTypeId: string & z12.$brand<"bkt">;
				repMembershipId: string & z12.$brand<"mem">;
				prospectId: string & z12.$brand<"prs">;
				previousStartsAt: string;
				startsAt: string;
				endsAt: string;
			};
		}>;
	};
};
/** The type of a booking event. */
type BookingEventType = keyof typeof BOOKING_EVENTS;
import { z as z13 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh455 } from "..";
/**
* The errors the Prospect routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A record of another Organization, or one the caller may not see (a
* Rep's view of another Rep's Prospect), is `prospect.not_found` (404, never 403), so existence is
* not revealed; `details.resource` names which kind of record it was.
*
* - `prospect.duplicate_identity` (409): another Prospect of the Organization already has this
*   normalised email, phone or LinkedIn address. `details` is {@link duplicateIdentityDetailsSchema};
*   `prospectId` is present only when the caller may see that Prospect.
* - `prospect.import_invalid` (422): the upload was refused before anything was stored;
*   `details.reason` is one of `PROSPECT_IMPORT_INVALID_REASONS`. A bad row is never an HTTP error:
*   it is a row in the report.
* - `prospect.merge_conflict` (409): the merge cannot be made or undone, for example a Prospect is
*   already merged, the same Prospect is named twice, or the thirty-day undo window has passed.
* - `prospect.forbidden_owner` (403): the named owner is not allowed: a member of another
*   Organization, someone who is not a Rep or Manager, or a Rep naming someone other than themselves.
*/
declare const PROSPECT_ERRORS: {
	readonly "prospect.duplicate_identity": ErrorDefinition_8gwh455<"prospect.duplicate_identity">;
	readonly "prospect.forbidden_owner": ErrorDefinition_8gwh455<"prospect.forbidden_owner">;
	readonly "prospect.import_invalid": ErrorDefinition_8gwh455<"prospect.import_invalid">;
	readonly "prospect.merge_conflict": ErrorDefinition_8gwh455<"prospect.merge_conflict">;
	readonly "prospect.not_found": ErrorDefinition_8gwh455<"prospect.not_found">;
};
/** A code from the {@link PROSPECT_ERRORS} registry. */
type ProspectErrorCode = keyof typeof PROSPECT_ERRORS;
/** The `details` of `prospect.not_found`: which kind of record was not found. */
declare const prospectNotFoundDetailsSchema: z13.ZodObject<{
	resource: z13.ZodEnum<{
		company: "company";
		import: "import";
		merge: "merge";
		prospect: "prospect";
	}>;
}, z13.core.$strict>;
/** The `details` of `prospect.not_found`. */
type ProspectNotFoundDetails = z13.infer<typeof prospectNotFoundDetailsSchema>;
/** The `details` of `prospect.duplicate_identity`: which kind of identity clashed and, when the caller may see it, the other Prospect. */
declare const duplicateIdentityDetailsSchema: z13.ZodObject<{
	identityKind: z13.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>;
	prospectId: z13.ZodOptional<z13.core.$ZodBranded<z13.ZodString, "prs", "out">>;
}, z13.core.$strict>;
/** The `details` of `prospect.duplicate_identity`. */
type DuplicateIdentityDetails = z13.infer<typeof duplicateIdentityDetailsSchema>;
/** Every role: each may use the calendar and availability that are their own, and read Booking Types and free times. */
declare const BOOKING_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that define Booking Types and manage every Routing Rule. */
declare const BOOKING_ADMIN_ROLES: readonly ["owner", "admin"];
/** The roles that read and test Routing Rules; a Manager changes only rules that target their own Team. */
declare const ROUTING_ROLES: readonly ["owner", "admin", "manager"];
/** The booking, routing and calendar routes, by name. */
type BookingRouteName = "startCalendarConnection" | "completeCalendarConnection" | "getCalendarConnection" | "disconnectCalendarConnection" | "getAvailability" | "setAvailability" | "listBookingTypes" | "createBookingType" | "getBookingType" | "updateBookingType" | "retireBookingType" | "listRoutingRules" | "createRoutingRule" | "getRoutingRule" | "updateRoutingRule" | "deleteRoutingRule" | "reorderRoutingRules" | "testRouting" | "route" | "listSlots" | "book" | "listBookings" | "getBooking" | "getBookingRouting" | "rescheduleBooking" | "cancelBooking" | "publicListSlots" | "publicBook";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type BookingRoute = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** The roles allowed. Empty for a public route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** True: the route takes no token and no Organization; anyone may call it. */
	readonly public?: true;
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when a retry of the route is safe by the `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** True when the `Idempotency-Key` header is required, not just accepted; see `bookHeadersSchema`. */
	readonly keyRequired?: true;
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly (BookingErrorCode | Extract<ProspectErrorCode, "prospect.not_found">)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The booking, routing and calendar routes (spec M10). Every authenticated route may also return
* the common `auth.*`, `rate.limited` and `server.*` codes. Every list is cursor-paginated with at
* most 100 items per page. A record of another Organization is always not found. The two public
* routes take no token: they are reached by an unguessable Booking Type token, are rate-limited by
* address and token, and show a Prospect only start and end times, never a Rep, an event title, an
* attendee or a busy block.
*/
declare const BOOKING_ROUTES: Readonly<Record<BookingRouteName, BookingRoute>>;
import { z as z14 } from "zod";
/** The company size bands a Routing Rule can match, by number of employees. */
declare const COMPANY_SIZE_BANDS: readonly ["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5001+"];
/** A company size band. */
declare const companySizeBandSchema: z14.ZodEnum<{
	"1-10": "1-10";
	"1001-5000": "1001-5000";
	"11-50": "11-50";
	"201-1000": "201-1000";
	"5001+": "5001+";
	"51-200": "51-200";
}>;
/** A company size band. */
type CompanySizeBand = z14.infer<typeof companySizeBandSchema>;
/** The most Routing Rules an Organization may have. */
declare const MAX_ROUTING_RULES = 200;
/** The most values one condition of a Routing Rule may list. */
declare const MAX_CONDITION_VALUES = 50;
/** The longest region name in a condition. */
declare const MAX_REGION_LENGTH = 100;
/**
* What a Routing Rule matches on. Every key is optional and a missing key matches anything; a
* rule matches when every key it has matches (within one key, any value matches). A rule with no
* key matches every Prospect, which is what the default rule is.
*/
declare const routingConditionsSchema: z14.ZodObject<{
	countries: z14.ZodOptional<z14.ZodArray<z14.ZodString>>;
	regions: z14.ZodOptional<z14.ZodArray<z14.ZodPipe<z14.ZodString, z14.ZodString>>>;
	companySizeBands: z14.ZodOptional<z14.ZodArray<z14.ZodEnum<{
		"1-10": "1-10";
		"1001-5000": "1001-5000";
		"11-50": "11-50";
		"201-1000": "201-1000";
		"5001+": "5001+";
		"51-200": "51-200";
	}>>>;
	accountOwnerMembershipIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>>;
	sources: z14.ZodOptional<z14.ZodArray<z14.ZodUnion<readonly [z14.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z14.ZodString]>>>;
	bookingTypeIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "bkt", "out">>>;
}, z14.core.$strict>;
/** What a Routing Rule matches on. */
type RoutingConditions = z14.infer<typeof routingConditionsSchema>;
/**
* Who a Routing Rule picks: one Rep, a Team in round-robin, or a named pool of 2 to 20 Reps in
* round-robin.
*/
declare const routingTargetSchema: z14.ZodDiscriminatedUnion<[z14.ZodObject<{
	kind: z14.ZodLiteral<"rep">;
	membershipId: z14.core.$ZodBranded<z14.ZodString, "mem", "out">;
}, z14.core.$strict>, z14.ZodObject<{
	kind: z14.ZodLiteral<"team">;
	teamId: z14.core.$ZodBranded<z14.ZodString, "team", "out">;
}, z14.core.$strict>, z14.ZodObject<{
	kind: z14.ZodLiteral<"pool">;
	membershipIds: z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>;
}, z14.core.$strict>], "kind">;
/** Who a Routing Rule picks. */
type RoutingTarget = z14.infer<typeof routingTargetSchema>;
/**
* A Routing Rule: ordered by `position` (1 first; the first rule that matches wins), with
* conditions and a target. The default rule matches when nothing else does, has no conditions and
* is last; an Organization has at most one.
*/
declare const routingRuleSchema: z14.ZodObject<{
	name: z14.ZodPipe<z14.ZodString, z14.ZodString>;
	conditions: z14.ZodObject<{
		countries: z14.ZodOptional<z14.ZodArray<z14.ZodString>>;
		regions: z14.ZodOptional<z14.ZodArray<z14.ZodPipe<z14.ZodString, z14.ZodString>>>;
		companySizeBands: z14.ZodOptional<z14.ZodArray<z14.ZodEnum<{
			"1-10": "1-10";
			"1001-5000": "1001-5000";
			"11-50": "11-50";
			"201-1000": "201-1000";
			"5001+": "5001+";
			"51-200": "51-200";
		}>>>;
		accountOwnerMembershipIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>>;
		sources: z14.ZodOptional<z14.ZodArray<z14.ZodUnion<readonly [z14.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z14.ZodString]>>>;
		bookingTypeIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "bkt", "out">>>;
	}, z14.core.$strict>;
	target: z14.ZodDiscriminatedUnion<[z14.ZodObject<{
		kind: z14.ZodLiteral<"rep">;
		membershipId: z14.core.$ZodBranded<z14.ZodString, "mem", "out">;
	}, z14.core.$strict>, z14.ZodObject<{
		kind: z14.ZodLiteral<"team">;
		teamId: z14.core.$ZodBranded<z14.ZodString, "team", "out">;
	}, z14.core.$strict>, z14.ZodObject<{
		kind: z14.ZodLiteral<"pool">;
		membershipIds: z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>;
	}, z14.core.$strict>], "kind">;
	isDefault: z14.ZodBoolean;
	id: z14.core.$ZodBranded<z14.ZodString, "rrl", "out">;
	position: z14.ZodNumber;
	createdAt: z14.ZodISODateTime;
}, z14.core.$strict>;
/** A Routing Rule. */
type RoutingRule = z14.infer<typeof routingRuleSchema>;
/** The body of a request to create a Routing Rule; it goes last, before the default rule if there is one. */
declare const createRoutingRuleRequestSchema: z14.ZodObject<{
	name: z14.ZodPipe<z14.ZodString, z14.ZodString>;
	conditions: z14.ZodObject<{
		countries: z14.ZodOptional<z14.ZodArray<z14.ZodString>>;
		regions: z14.ZodOptional<z14.ZodArray<z14.ZodPipe<z14.ZodString, z14.ZodString>>>;
		companySizeBands: z14.ZodOptional<z14.ZodArray<z14.ZodEnum<{
			"1-10": "1-10";
			"1001-5000": "1001-5000";
			"11-50": "11-50";
			"201-1000": "201-1000";
			"5001+": "5001+";
			"51-200": "51-200";
		}>>>;
		accountOwnerMembershipIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>>;
		sources: z14.ZodOptional<z14.ZodArray<z14.ZodUnion<readonly [z14.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z14.ZodString]>>>;
		bookingTypeIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "bkt", "out">>>;
	}, z14.core.$strict>;
	target: z14.ZodDiscriminatedUnion<[z14.ZodObject<{
		kind: z14.ZodLiteral<"rep">;
		membershipId: z14.core.$ZodBranded<z14.ZodString, "mem", "out">;
	}, z14.core.$strict>, z14.ZodObject<{
		kind: z14.ZodLiteral<"team">;
		teamId: z14.core.$ZodBranded<z14.ZodString, "team", "out">;
	}, z14.core.$strict>, z14.ZodObject<{
		kind: z14.ZodLiteral<"pool">;
		membershipIds: z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>;
	}, z14.core.$strict>], "kind">;
	isDefault: z14.ZodBoolean;
}, z14.core.$strict>;
/** The body of a request to create a Routing Rule. */
type CreateRoutingRuleRequest = z14.infer<typeof createRoutingRuleRequestSchema>;
/** The body of a request to replace a Routing Rule's name, conditions, target and default flag. */
declare const updateRoutingRuleRequestSchema: z14.ZodObject<{
	name: z14.ZodPipe<z14.ZodString, z14.ZodString>;
	conditions: z14.ZodObject<{
		countries: z14.ZodOptional<z14.ZodArray<z14.ZodString>>;
		regions: z14.ZodOptional<z14.ZodArray<z14.ZodPipe<z14.ZodString, z14.ZodString>>>;
		companySizeBands: z14.ZodOptional<z14.ZodArray<z14.ZodEnum<{
			"1-10": "1-10";
			"1001-5000": "1001-5000";
			"11-50": "11-50";
			"201-1000": "201-1000";
			"5001+": "5001+";
			"51-200": "51-200";
		}>>>;
		accountOwnerMembershipIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>>;
		sources: z14.ZodOptional<z14.ZodArray<z14.ZodUnion<readonly [z14.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z14.ZodString]>>>;
		bookingTypeIds: z14.ZodOptional<z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "bkt", "out">>>;
	}, z14.core.$strict>;
	target: z14.ZodDiscriminatedUnion<[z14.ZodObject<{
		kind: z14.ZodLiteral<"rep">;
		membershipId: z14.core.$ZodBranded<z14.ZodString, "mem", "out">;
	}, z14.core.$strict>, z14.ZodObject<{
		kind: z14.ZodLiteral<"team">;
		teamId: z14.core.$ZodBranded<z14.ZodString, "team", "out">;
	}, z14.core.$strict>, z14.ZodObject<{
		kind: z14.ZodLiteral<"pool">;
		membershipIds: z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>;
	}, z14.core.$strict>], "kind">;
	isDefault: z14.ZodBoolean;
}, z14.core.$strict>;
/** The path parameters of a request about one Routing Rule. */
declare const routingRuleParamsSchema: z14.ZodObject<{
	ruleId: z14.core.$ZodBranded<z14.ZodString, "rrl", "out">;
}, z14.core.$strict>;
/** The body of a request to set the order of every Routing Rule: all the ids, once each, first to last. */
declare const reorderRoutingRulesRequestSchema: z14.ZodObject<{
	ruleIds: z14.ZodArray<z14.core.$ZodBranded<z14.ZodString, "rrl", "out">>;
}, z14.core.$strict>;
/** The query parameters of a request to list Routing Rules, in order. */
declare const listRoutingRulesQuerySchema: z14.ZodObject<{
	cursor: z14.ZodOptional<z14.ZodString>;
	limit: z14.ZodDefault<z14.ZodPipe<z14.ZodPipe<z14.ZodUnion<readonly [z14.ZodNumber, z14.ZodString]>, z14.ZodTransform<number, string | number>>, z14.ZodNumber>>;
}, z14.core.$strict>;
/** The attributes of a Prospect that routing looks at; a missing one is null and matches no condition on it. */
declare const routingAttributesSchema: z14.ZodObject<{
	country: z14.ZodNullable<z14.ZodString>;
	region: z14.ZodNullable<z14.ZodPipe<z14.ZodString, z14.ZodString>>;
	companySizeBand: z14.ZodNullable<z14.ZodEnum<{
		"1-10": "1-10";
		"1001-5000": "1001-5000";
		"11-50": "11-50";
		"201-1000": "201-1000";
		"5001+": "5001+";
		"51-200": "51-200";
	}>>;
	accountOwnerMembershipId: z14.ZodNullable<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>;
	source: z14.ZodNullable<z14.ZodUnion<readonly [z14.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z14.ZodString]>>;
}, z14.core.$strict>;
/** The attributes of a Prospect that routing looks at. */
type RoutingAttributes = z14.infer<typeof routingAttributesSchema>;
/** The body of a request to route a Prospect: core reads its attributes. `bookingTypeId` narrows rules that name Booking Types. */
declare const routeRequestSchema: z14.ZodObject<{
	prospectId: z14.core.$ZodBranded<z14.ZodString, "prs", "out">;
	bookingTypeId: z14.ZodOptional<z14.core.$ZodBranded<z14.ZodString, "bkt", "out">>;
}, z14.core.$strict>;
/** The body of a request to route a Prospect. */
type RouteRequest = z14.infer<typeof routeRequestSchema>;
/** The body of a request to test the Routing Rules with a sample Prospect, nothing stored and nobody notified. */
declare const testRoutingRequestSchema: z14.ZodObject<{
	attributes: z14.ZodObject<{
		country: z14.ZodNullable<z14.ZodString>;
		region: z14.ZodNullable<z14.ZodPipe<z14.ZodString, z14.ZodString>>;
		companySizeBand: z14.ZodNullable<z14.ZodEnum<{
			"1-10": "1-10";
			"1001-5000": "1001-5000";
			"11-50": "11-50";
			"201-1000": "201-1000";
			"5001+": "5001+";
			"51-200": "51-200";
		}>>;
		accountOwnerMembershipId: z14.ZodNullable<z14.core.$ZodBranded<z14.ZodString, "mem", "out">>;
		source: z14.ZodNullable<z14.ZodUnion<readonly [z14.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z14.ZodString]>>;
	}, z14.core.$strict>;
	bookingTypeId: z14.ZodOptional<z14.core.$ZodBranded<z14.ZodString, "bkt", "out">>;
}, z14.core.$strict>;
/** The body of a request to test the Routing Rules. */
type TestRoutingRequest = z14.infer<typeof testRoutingRequestSchema>;
/** Why a Rep is a candidate: the rule named them, they are next in the Team's or pool's round-robin, or the default rule picked them. */
declare const ROUTING_CANDIDATE_REASONS: readonly ["named_rep", "round_robin_team", "round_robin_pool", "default_rule"];
/** Why a Rep is a candidate. */
declare const routingCandidateReasonSchema: z14.ZodEnum<{
	default_rule: "default_rule";
	named_rep: "named_rep";
	round_robin_pool: "round_robin_pool";
	round_robin_team: "round_robin_team";
}>;
/** Why a Rep was skipped: off shift, away, at the daily cap, or without a healthy calendar. */
declare const ROUTING_SKIP_REASONS: readonly ["off_shift", "on_leave", "daily_cap_reached", "calendar_not_connected", "needs_reconnect"];
/** Why a Rep was skipped. */
declare const routingSkipReasonSchema: z14.ZodEnum<{
	calendar_not_connected: "calendar_not_connected";
	daily_cap_reached: "daily_cap_reached";
	needs_reconnect: "needs_reconnect";
	off_shift: "off_shift";
	on_leave: "on_leave";
}>;
/** Why a Rep was skipped. */
type RoutingSkipReason = z14.infer<typeof routingSkipReasonSchema>;
/**
* The outcome of routing: the rule that won (null when none matched and there is no default),
* the candidates in the order to try them, each with a reason, and the Reps skipped, each with
* why. Only ids and closed reasons: no name and no calendar content. `decisionId` is null for a
* test, which stores nothing.
*/
declare const routingResultSchema: z14.ZodObject<{
	decisionId: z14.ZodNullable<z14.core.$ZodBranded<z14.ZodString, "rdc", "out">>;
	matchedRuleId: z14.ZodNullable<z14.core.$ZodBranded<z14.ZodString, "rrl", "out">>;
	candidates: z14.ZodArray<z14.ZodObject<{
		membershipId: z14.core.$ZodBranded<z14.ZodString, "mem", "out">;
		reason: z14.ZodEnum<{
			default_rule: "default_rule";
			named_rep: "named_rep";
			round_robin_pool: "round_robin_pool";
			round_robin_team: "round_robin_team";
		}>;
	}, z14.core.$strict>>;
	skipped: z14.ZodArray<z14.ZodObject<{
		membershipId: z14.core.$ZodBranded<z14.ZodString, "mem", "out">;
		reason: z14.ZodEnum<{
			calendar_not_connected: "calendar_not_connected";
			daily_cap_reached: "daily_cap_reached";
			needs_reconnect: "needs_reconnect";
			off_shift: "off_shift";
			on_leave: "on_leave";
		}>;
	}, z14.core.$strict>>;
	decidedAt: z14.ZodNullable<z14.ZodISODateTime>;
}, z14.core.$strict>;
/** The outcome of routing. */
type RoutingResult = z14.infer<typeof routingResultSchema>;
import { z as z15 } from "zod";
/** The vendors a Rep can connect a calendar from. Outlook follows later. */
declare const CALENDAR_PROVIDERS: readonly ["google"];
/** The vendor of a Calendar Connection. */
declare const calendarProviderSchema: z15.ZodEnum<{
	google: "google";
}>;
/** The vendor of a Calendar Connection. */
type CalendarProvider = z15.infer<typeof calendarProviderSchema>;
/** The states of a Calendar Connection that exists: `healthy`, or `needs_reconnect` once the grant was revoked or expired. A disconnected calendar has no connection at all. */
declare const CALENDAR_CONNECTION_STATES: readonly ["healthy", "needs_reconnect"];
/** The state of a Calendar Connection. */
declare const calendarConnectionStateSchema: z15.ZodEnum<{
	healthy: "healthy";
	needs_reconnect: "needs_reconnect";
}>;
/** The state of a Calendar Connection. */
type CalendarConnectionState = z15.infer<typeof calendarConnectionStateSchema>;
/** How a Booking is held: a phone Call, or a video conversation with a join link. */
declare const BOOKING_MODES: readonly ["phone", "video"];
/** How a Booking is held. */
declare const bookingModeSchema: z15.ZodEnum<{
	phone: "phone";
	video: "video";
}>;
/** How a Booking is held. */
type BookingMode = z15.infer<typeof bookingModeSchema>;
/** The states of a Booking: `pending` while the event is being written, `confirmed` once it is on the calendar, `cancelled` after. Rescheduling keeps a Booking `confirmed`. */
declare const BOOKING_STATES: readonly ["pending", "confirmed", "cancelled"];
/** The state of a Booking. */
declare const bookingStateSchema: z15.ZodEnum<{
	cancelled: "cancelled";
	confirmed: "confirmed";
	pending: "pending";
}>;
/** The state of a Booking. */
type BookingState = z15.infer<typeof bookingStateSchema>;
/** Where a Booking came from: a member in the portal, the Inbound Agent, or a Prospect on the public page. */
declare const BOOKING_ORIGINS: readonly ["member", "agent", "public"];
/** Where a Booking came from. */
declare const bookingOriginSchema: z15.ZodEnum<{
	agent: "agent";
	member: "member";
	public: "public";
}>;
/** Where a Booking came from. */
type BookingOrigin = z15.infer<typeof bookingOriginSchema>;
/** The states of a Booking Type: `active`, or `retired` (kept for old Bookings, no longer bookable). */
declare const BOOKING_TYPE_STATES: readonly ["active", "retired"];
/** The state of a Booking Type. */
declare const bookingTypeStateSchema: z15.ZodEnum<{
	active: "active";
	retired: "retired";
}>;
/** The state of a Booking Type. */
type BookingTypeState = z15.infer<typeof bookingTypeStateSchema>;
/** The most days ahead a slot search may cover. */
declare const MAX_SLOT_RANGE_DAYS = 14;
/** The most Reps considered for one slot search, and the most a pool may name. */
declare const MAX_ELIGIBLE_REPS = 20;
/** The longest name of a Booking Type or Routing Rule. */
declare const MAX_BOOKING_NAME_LENGTH = 100;
/** A name an Admin gives a Booking Type or a Routing Rule: bounded text with no control character. */
declare const bookingNameSchema: z15.ZodPipe<z15.ZodString, z15.ZodString>;
/** An IANA time zone name such as `Europe/Dublin` or `UTC`. Core checks it against the zone database. */
declare const timeZoneSchema: z15.ZodString;
/** A join link: an `https` URL of at most 2,048 characters. */
declare const joinUrlSchema: z15.ZodString;
/** The opaque, unguessable token of a Booking Type's public link: 32 to 64 URL-safe characters. */
declare const bookingLinkTokenSchema: z15.ZodString;
import { z as z16 } from "zod";
/**
* A Campaign's audience, by kind. `filter`: the Prospects the caller may see that match, read
* again when the audience is checked and at launch (every filter field is optional, and an empty
* filter means every Prospect the caller may see). `prospects`: 1 to 500 listed Prospects, unique.
* There is no saved Prospect list in this release.
*/
declare const audienceSchema: z16.ZodDiscriminatedUnion<[z16.ZodObject<{
	kind: z16.ZodLiteral<"filter">;
	ownerMembershipId: z16.ZodOptional<z16.core.$ZodBranded<z16.ZodString, "mem", "out">>;
	source: z16.ZodOptional<z16.ZodUnion<readonly [z16.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z16.ZodString]>>;
	companyId: z16.ZodOptional<z16.core.$ZodBranded<z16.ZodString, "pco", "out">>;
	status: z16.ZodOptional<z16.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	q: z16.ZodOptional<z16.ZodPipe<z16.ZodString, z16.ZodString>>;
}, z16.core.$strict>, z16.ZodObject<{
	kind: z16.ZodLiteral<"prospects">;
	prospectIds: z16.ZodArray<z16.core.$ZodBranded<z16.ZodString, "prs", "out">>;
}, z16.core.$strict>], "kind">;
/** A Campaign's audience. */
type Audience = z16.infer<typeof audienceSchema>;
/** How far an audience check has got. */
declare const AUDIENCE_CHECK_STATES: readonly ["pending", "ready", "failed"];
/** How far an audience check has got. */
declare const audienceCheckStateSchema: z16.ZodEnum<{
	failed: "failed";
	pending: "pending";
	ready: "ready";
}>;
/** How far an audience check has got. */
type AudienceCheckState = z16.infer<typeof audienceCheckStateSchema>;
/**
* What an audience check counted. `total` Prospects match; of them `verified` and `unverified`
* (an address not verified) add up to `total`; `suppressed`, `noConsent` (no Contact Consent for
* email) and `activeInOtherCampaign` (one active Campaign per Prospect) are Prospects that would
* be refused; `eligible` would be enrolled. No count is above `total`, and `eligible` is at most
* `total` less the largest refusal count. A count is a number, never a list of people.
*/
declare const audienceCountsSchema: z16.ZodObject<{
	total: z16.ZodNumber;
	verified: z16.ZodNumber;
	unverified: z16.ZodNumber;
	suppressed: z16.ZodNumber;
	noConsent: z16.ZodNumber;
	activeInOtherCampaign: z16.ZodNumber;
	eligible: z16.ZodNumber;
}, z16.core.$strict>;
/** What an audience check counted. */
type AudienceCounts = z16.infer<typeof audienceCountsSchema>;
/**
* The latest audience check of a Campaign. It runs in the background, so it is `pending` first;
* `counts` is null until `ready`. `failed` carries no detail: start another. `audienceVersion`
* says which audience it read, so a stale result is never taken for the current one.
*/
declare const audienceCheckSchema: z16.ZodObject<{
	campaignId: z16.core.$ZodBranded<z16.ZodString, "cpg", "out">;
	state: z16.ZodEnum<{
		failed: "failed";
		pending: "pending";
		ready: "ready";
	}>;
	audienceVersion: z16.ZodNumber;
	counts: z16.ZodNullable<z16.ZodObject<{
		total: z16.ZodNumber;
		verified: z16.ZodNumber;
		unverified: z16.ZodNumber;
		suppressed: z16.ZodNumber;
		noConsent: z16.ZodNumber;
		activeInOtherCampaign: z16.ZodNumber;
		eligible: z16.ZodNumber;
	}, z16.core.$strict>>;
	requestedAt: z16.ZodISODateTime;
	completedAt: z16.ZodNullable<z16.ZodISODateTime>;
}, z16.core.$strict>;
/** The latest audience check of a Campaign. */
type AudienceCheck = z16.infer<typeof audienceCheckSchema>;
/** The checks a launch needs, each reported once. */
declare const LAUNCH_CHECKS: readonly ["sequence", "preview", "audience", "mailbox"];
/** A check a launch needs. */
declare const launchCheckNameSchema: z16.ZodEnum<{
	audience: "audience";
	mailbox: "mailbox";
	preview: "preview";
	sequence: "sequence";
}>;
/** A check a launch needs. */
type LaunchCheckName = z16.infer<typeof launchCheckNameSchema>;
/** How one launch check came out: `pending` is not yet known (a preview or audience check not done). */
declare const LAUNCH_CHECK_RESULTS: readonly ["pass", "fail", "pending"];
/** How one launch check came out. */
declare const launchCheckResultSchema: z16.ZodEnum<{
	fail: "fail";
	pass: "pass";
	pending: "pending";
}>;
/** How one launch check came out. */
type LaunchCheckResult = z16.infer<typeof launchCheckResultSchema>;
/**
* One launch check: its result, and for a check that did not pass the error code a launch would
* return (null for a pass).
*/
declare const launchCheckItemSchema: z16.ZodObject<{
	check: z16.ZodEnum<{
		audience: "audience";
		mailbox: "mailbox";
		preview: "preview";
		sequence: "sequence";
	}>;
	result: z16.ZodEnum<{
		fail: "fail";
		pass: "pass";
		pending: "pending";
	}>;
	code: z16.ZodNullable<z16.ZodEnum<{
		"campaign.audience_check_pending": "campaign.audience_check_pending";
		"campaign.audience_empty": "campaign.audience_empty";
		"campaign.invalid_sequence": "campaign.invalid_sequence";
		"campaign.no_healthy_mailbox": "campaign.no_healthy_mailbox";
		"campaign.not_previewed": "campaign.not_previewed";
	}>>;
}, z16.core.$strict>;
/**
* Whether a Campaign can launch now. Four checks, each once: the Sequence is valid, the current
* version was previewed, the audience check is ready with someone eligible, and a healthy Mailbox
* exists. `canLaunch` is true only when all pass. The counts of Prospects refused for consent and
* suppression are shown so an Admin sees them first; they are reported, never bypassed: Contact
* Consent is checked again by core at send time (ADR 0003) and no setting skips it.
* `dailyCapacity` is what the healthy Mailboxes could send today.
*/
declare const launchCheckSchema: z16.ZodObject<{
	campaignId: z16.core.$ZodBranded<z16.ZodString, "cpg", "out">;
	checks: z16.ZodArray<z16.ZodObject<{
		check: z16.ZodEnum<{
			audience: "audience";
			mailbox: "mailbox";
			preview: "preview";
			sequence: "sequence";
		}>;
		result: z16.ZodEnum<{
			fail: "fail";
			pass: "pass";
			pending: "pending";
		}>;
		code: z16.ZodNullable<z16.ZodEnum<{
			"campaign.audience_check_pending": "campaign.audience_check_pending";
			"campaign.audience_empty": "campaign.audience_empty";
			"campaign.invalid_sequence": "campaign.invalid_sequence";
			"campaign.no_healthy_mailbox": "campaign.no_healthy_mailbox";
			"campaign.not_previewed": "campaign.not_previewed";
		}>>;
	}, z16.core.$strict>>;
	canLaunch: z16.ZodBoolean;
	suppressed: z16.ZodNullable<z16.ZodNumber>;
	noConsent: z16.ZodNullable<z16.ZodNumber>;
	eligible: z16.ZodNullable<z16.ZodNumber>;
	dailyCapacity: z16.ZodNumber;
	checkedAt: z16.ZodISODateTime;
}, z16.core.$strict>;
/** Whether a Campaign can launch now. */
type LaunchCheck = z16.infer<typeof launchCheckSchema>;
import { z as z17 } from "zod";
/**
* A Campaign: a Sequence run against an audience for a goal. `sequenceVersion` is the version
* saved last (0 while it has no Steps); `previewedVersion` is the Sequence version a preview was
* accepted for (null if none), so editing the Sequence makes the Campaign need a new preview.
* `sendWindow` is when it sends, read in the zone `windowZone` names; `dailyCap` bounds sends per
* day across all its Mailboxes. A Prospect is in at most one active Campaign, and there is no
* setting to change that. No message text is stored here.
*/
declare const campaignSchema: z17.ZodObject<{
	id: z17.core.$ZodBranded<z17.ZodString, "cpg", "out">;
	name: z17.ZodPipe<z17.ZodString, z17.ZodString>;
	goal: z17.ZodPipe<z17.ZodString, z17.ZodString>;
	state: z17.ZodEnum<{
		archived: "archived";
		draft: "draft";
		paused: "paused";
		ready: "ready";
		running: "running";
	}>;
	audience: z17.ZodDiscriminatedUnion<[z17.ZodObject<{
		kind: z17.ZodLiteral<"filter">;
		ownerMembershipId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "mem", "out">>;
		source: z17.ZodOptional<z17.ZodUnion<readonly [z17.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z17.ZodString]>>;
		companyId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "pco", "out">>;
		status: z17.ZodOptional<z17.ZodEnum<{
			active: "active";
			archived: "archived";
		}>>;
		q: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	}, z17.core.$strict>, z17.ZodObject<{
		kind: z17.ZodLiteral<"prospects">;
		prospectIds: z17.ZodArray<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
	}, z17.core.$strict>], "kind">;
	audienceVersion: z17.ZodNumber;
	sequenceVersion: z17.ZodNumber;
	previewedVersion: z17.ZodNullable<z17.ZodNumber>;
	previewedAt: z17.ZodNullable<z17.ZodISODateTime>;
	approvalMode: z17.ZodEnum<{
		auto: "auto";
		mixed: "mixed";
		review: "review";
	}>;
	language: z17.ZodEnum<{
		en: "en";
	}>;
	sendWindow: z17.ZodObject<{
		timeZone: z17.ZodString;
		days: z17.ZodArray<z17.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>>;
		startMinute: z17.ZodNumber;
		endMinute: z17.ZodNumber;
	}, z17.core.$strict>;
	windowZone: z17.ZodEnum<{
		campaign: "campaign";
		prospect: "prospect";
	}>;
	dailyCap: z17.ZodNumber;
	ownerMembershipId: z17.core.$ZodBranded<z17.ZodString, "mem", "out">;
	teamId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "team", "out">>;
	playId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "ply", "out">>;
	createdAt: z17.ZodISODateTime;
	updatedAt: z17.ZodISODateTime;
	launchedAt: z17.ZodNullable<z17.ZodISODateTime>;
	archivedAt: z17.ZodNullable<z17.ZodISODateTime>;
}, z17.core.$strict>;
/** A Campaign. */
type Campaign = z17.infer<typeof campaignSchema>;
/**
* The body that creates a Campaign in `draft` with no Steps. With `playId` the Sequence starts as
* a copy of that accepted Play. The creator owns it. `approvalMode` defaults to `review`, the
* safe choice, when left out.
*/
declare const createCampaignRequestSchema: z17.ZodObject<{
	name: z17.ZodPipe<z17.ZodString, z17.ZodString>;
	goal: z17.ZodPipe<z17.ZodString, z17.ZodString>;
	audience: z17.ZodDiscriminatedUnion<[z17.ZodObject<{
		kind: z17.ZodLiteral<"filter">;
		ownerMembershipId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "mem", "out">>;
		source: z17.ZodOptional<z17.ZodUnion<readonly [z17.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z17.ZodString]>>;
		companyId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "pco", "out">>;
		status: z17.ZodOptional<z17.ZodEnum<{
			active: "active";
			archived: "archived";
		}>>;
		q: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	}, z17.core.$strict>, z17.ZodObject<{
		kind: z17.ZodLiteral<"prospects">;
		prospectIds: z17.ZodArray<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
	}, z17.core.$strict>], "kind">;
	sendWindow: z17.ZodObject<{
		timeZone: z17.ZodString;
		days: z17.ZodArray<z17.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>>;
		startMinute: z17.ZodNumber;
		endMinute: z17.ZodNumber;
	}, z17.core.$strict>;
	dailyCap: z17.ZodNumber;
	approvalMode: z17.ZodDefault<z17.ZodEnum<{
		auto: "auto";
		mixed: "mixed";
		review: "review";
	}>>;
	language: z17.ZodDefault<z17.ZodEnum<{
		en: "en";
	}>>;
	windowZone: z17.ZodDefault<z17.ZodEnum<{
		campaign: "campaign";
		prospect: "prospect";
	}>>;
	teamId: z17.ZodDefault<z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "team", "out">>>;
	playId: z17.ZodDefault<z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "ply", "out">>>;
}, z17.core.$strict>;
/** The body that creates a Campaign. */
type CreateCampaignRequest = z17.input<typeof createCampaignRequestSchema>;
/**
* The body that changes a Campaign's settings: at least one field. Changing the audience or the
* send window of a `ready` Campaign returns it to `draft`; a `running` one keeps running and
* applies the change to Prospects not yet enrolled.
*/
declare const updateCampaignRequestSchema: z17.ZodObject<{
	name: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	goal: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	audience: z17.ZodOptional<z17.ZodDiscriminatedUnion<[z17.ZodObject<{
		kind: z17.ZodLiteral<"filter">;
		ownerMembershipId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "mem", "out">>;
		source: z17.ZodOptional<z17.ZodUnion<readonly [z17.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z17.ZodString]>>;
		companyId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "pco", "out">>;
		status: z17.ZodOptional<z17.ZodEnum<{
			active: "active";
			archived: "archived";
		}>>;
		q: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	}, z17.core.$strict>, z17.ZodObject<{
		kind: z17.ZodLiteral<"prospects">;
		prospectIds: z17.ZodArray<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
	}, z17.core.$strict>], "kind">>;
	approvalMode: z17.ZodOptional<z17.ZodEnum<{
		auto: "auto";
		mixed: "mixed";
		review: "review";
	}>>;
	sendWindow: z17.ZodOptional<z17.ZodObject<{
		timeZone: z17.ZodString;
		days: z17.ZodArray<z17.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>>;
		startMinute: z17.ZodNumber;
		endMinute: z17.ZodNumber;
	}, z17.core.$strict>>;
	windowZone: z17.ZodOptional<z17.ZodEnum<{
		campaign: "campaign";
		prospect: "prospect";
	}>>;
	dailyCap: z17.ZodOptional<z17.ZodNumber>;
	teamId: z17.ZodOptional<z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "team", "out">>>;
}, z17.core.$strict>;
/** The body that changes a Campaign's settings. */
type UpdateCampaignRequest = z17.infer<typeof updateCampaignRequestSchema>;
/** The body that duplicates a Campaign into a new `draft`: the new name only. Enrollments are not copied. */
declare const duplicateCampaignRequestSchema: z17.ZodObject<{
	name: z17.ZodPipe<z17.ZodString, z17.ZodString>;
}, z17.core.$strict>;
/** The path parameters of a request about one Campaign. */
declare const campaignParamsSchema: z17.ZodObject<{
	campaignId: z17.core.$ZodBranded<z17.ZodString, "cpg", "out">;
}, z17.core.$strict>;
/** The query parameters of a Campaign list: filters over what the caller may see. */
declare const listCampaignsQuerySchema: z17.ZodObject<{
	cursor: z17.ZodOptional<z17.ZodString>;
	limit: z17.ZodDefault<z17.ZodPipe<z17.ZodPipe<z17.ZodUnion<readonly [z17.ZodNumber, z17.ZodString]>, z17.ZodTransform<number, string | number>>, z17.ZodNumber>>;
	state: z17.ZodOptional<z17.ZodEnum<{
		archived: "archived";
		draft: "draft";
		paused: "paused";
		ready: "ready";
		running: "running";
	}>>;
	ownerMembershipId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "mem", "out">>;
	teamId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "team", "out">>;
}, z17.core.$strict>;
/** The query parameters of a Campaign list. */
type ListCampaignsQuery = z17.infer<typeof listCampaignsQuerySchema>;
/** One page of Campaigns, newest first (by `createdAt`, then id). */
declare const listCampaignsResponseSchema: z17.ZodObject<{
	items: z17.ZodArray<z17.ZodObject<{
		id: z17.core.$ZodBranded<z17.ZodString, "cpg", "out">;
		name: z17.ZodPipe<z17.ZodString, z17.ZodString>;
		goal: z17.ZodPipe<z17.ZodString, z17.ZodString>;
		state: z17.ZodEnum<{
			archived: "archived";
			draft: "draft";
			paused: "paused";
			ready: "ready";
			running: "running";
		}>;
		audience: z17.ZodDiscriminatedUnion<[z17.ZodObject<{
			kind: z17.ZodLiteral<"filter">;
			ownerMembershipId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "mem", "out">>;
			source: z17.ZodOptional<z17.ZodUnion<readonly [z17.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z17.ZodString]>>;
			companyId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "pco", "out">>;
			status: z17.ZodOptional<z17.ZodEnum<{
				active: "active";
				archived: "archived";
			}>>;
			q: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
		}, z17.core.$strict>, z17.ZodObject<{
			kind: z17.ZodLiteral<"prospects">;
			prospectIds: z17.ZodArray<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
		}, z17.core.$strict>], "kind">;
		audienceVersion: z17.ZodNumber;
		sequenceVersion: z17.ZodNumber;
		previewedVersion: z17.ZodNullable<z17.ZodNumber>;
		previewedAt: z17.ZodNullable<z17.ZodISODateTime>;
		approvalMode: z17.ZodEnum<{
			auto: "auto";
			mixed: "mixed";
			review: "review";
		}>;
		language: z17.ZodEnum<{
			en: "en";
		}>;
		sendWindow: z17.ZodObject<{
			timeZone: z17.ZodString;
			days: z17.ZodArray<z17.ZodEnum<{
				fri: "fri";
				mon: "mon";
				sat: "sat";
				sun: "sun";
				thu: "thu";
				tue: "tue";
				wed: "wed";
			}>>;
			startMinute: z17.ZodNumber;
			endMinute: z17.ZodNumber;
		}, z17.core.$strict>;
		windowZone: z17.ZodEnum<{
			campaign: "campaign";
			prospect: "prospect";
		}>;
		dailyCap: z17.ZodNumber;
		ownerMembershipId: z17.core.$ZodBranded<z17.ZodString, "mem", "out">;
		teamId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "team", "out">>;
		playId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "ply", "out">>;
		createdAt: z17.ZodISODateTime;
		updatedAt: z17.ZodISODateTime;
		launchedAt: z17.ZodNullable<z17.ZodISODateTime>;
		archivedAt: z17.ZodNullable<z17.ZodISODateTime>;
	}, z17.core.$strict>>;
	nextCursor: z17.ZodNullable<z17.ZodString>;
}, z17.core.$strip>;
/** The position in a Campaign list. */
declare const campaignCursorSchema: z17.ZodObject<{
	createdAt: z17.ZodISODateTime;
	id: z17.core.$ZodBranded<z17.ZodString, "cpg", "out">;
}, z17.core.$strict>;
/** The position in a Campaign list. */
type CampaignCursor = z17.infer<typeof campaignCursorSchema>;
/**
* Counts of a Campaign's Enrollments by outcome. `enrolled` is every Prospect ever enrolled;
* `active`, `completed` and `stopped` partition it; `replied`, `positiveReplied` (null until the
* reply classification exists), `meetings`, `bounced` and `unsubscribed` are among those and none
* is above `enrolled`. There are no open or click counts: nothing is tracked.
*/
declare const campaignStatsSchema: z17.ZodObject<{
	campaignId: z17.core.$ZodBranded<z17.ZodString, "cpg", "out">;
	enrolled: z17.ZodNumber;
	active: z17.ZodNumber;
	completed: z17.ZodNumber;
	stopped: z17.ZodNumber;
	sent: z17.ZodNumber;
	replied: z17.ZodNumber;
	positiveReplied: z17.ZodNullable<z17.ZodNumber>;
	meetings: z17.ZodNumber;
	bounced: z17.ZodNumber;
	unsubscribed: z17.ZodNumber;
	computedAt: z17.ZodISODateTime;
}, z17.core.$strict>;
/** Counts of a Campaign's Enrollments by outcome. */
type CampaignStats = z17.infer<typeof campaignStatsSchema>;
import { z as z18 } from "zod";
/** The state of an Enrollment: `active` (in the Sequence), `completed` (reached an end) or `stopped` (taken out, with a reason). */
declare const ENROLLMENT_STATES: readonly ["active", "completed", "stopped"];
/** The state of an Enrollment. */
declare const enrollmentStateSchema: z18.ZodEnum<{
	active: "active";
	completed: "completed";
	stopped: "stopped";
}>;
/** The state of an Enrollment. */
type EnrollmentState = z18.infer<typeof enrollmentStateSchema>;
/**
* Why an Enrollment stopped, a closed set: the Prospect `replied`, the address `hard_bounce`d,
* the Prospect `unsubscribed` or `complaint`ed, the address became `suppressed`, Contact Consent
* went (`no_consent`), the address is `unverified_address`, a Rep took them out
* (`removed_by_rep`), a `meeting_booked`, the Prospect was erased (`prospect_erased`), or the
* Campaign was archived (`campaign_archived`).
*/
declare const ENROLLMENT_STOP_REASONS: readonly ["replied", "hard_bounce", "unsubscribed", "complaint", "suppressed", "no_consent", "unverified_address", "removed_by_rep", "meeting_booked", "prospect_erased", "campaign_archived"];
/** Why an Enrollment stopped. */
declare const enrollmentStopReasonSchema: z18.ZodEnum<{
	campaign_archived: "campaign_archived";
	complaint: "complaint";
	hard_bounce: "hard_bounce";
	meeting_booked: "meeting_booked";
	no_consent: "no_consent";
	prospect_erased: "prospect_erased";
	removed_by_rep: "removed_by_rep";
	replied: "replied";
	suppressed: "suppressed";
	unsubscribed: "unsubscribed";
	unverified_address: "unverified_address";
}>;
/** Why an Enrollment stopped. */
type EnrollmentStopReason = z18.infer<typeof enrollmentStopReasonSchema>;
/**
* One Prospect in one Campaign. `currentStepKey` is where it is (null once ended) and
* `currentStep` that Step's position, the number in its send key; `attemptEpoch` is the send
* key's epoch; `nextDueAt` is when the next Step acts (null when it waits on nothing or has
* ended). A `stopped` Enrollment has a reason and a time; a `completed` one a time; neither of
* an ended one is due again. Ids and values only.
*/
declare const enrollmentSchema: z18.ZodObject<{
	id: z18.core.$ZodBranded<z18.ZodString, "enr", "out">;
	campaignId: z18.core.$ZodBranded<z18.ZodString, "cpg", "out">;
	prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
	state: z18.ZodEnum<{
		active: "active";
		completed: "completed";
		stopped: "stopped";
	}>;
	stopReason: z18.ZodNullable<z18.ZodEnum<{
		campaign_archived: "campaign_archived";
		complaint: "complaint";
		hard_bounce: "hard_bounce";
		meeting_booked: "meeting_booked";
		no_consent: "no_consent";
		prospect_erased: "prospect_erased";
		removed_by_rep: "removed_by_rep";
		replied: "replied";
		suppressed: "suppressed";
		unsubscribed: "unsubscribed";
		unverified_address: "unverified_address";
	}>>;
	currentStepKey: z18.ZodNullable<z18.ZodString>;
	currentStep: z18.ZodNullable<z18.ZodNumber>;
	attemptEpoch: z18.ZodNumber;
	nextDueAt: z18.ZodNullable<z18.ZodISODateTime>;
	enrolledAt: z18.ZodISODateTime;
	stoppedAt: z18.ZodNullable<z18.ZodISODateTime>;
	completedAt: z18.ZodNullable<z18.ZodISODateTime>;
}, z18.core.$strict>;
/** One Prospect in one Campaign. */
type Enrollment = z18.infer<typeof enrollmentSchema>;
/** The path parameters of a request about one Enrollment. */
declare const enrollmentParamsSchema: z18.ZodObject<{
	enrollmentId: z18.core.$ZodBranded<z18.ZodString, "enr", "out">;
}, z18.core.$strict>;
/** The path parameters of a request about the Enrollments of a Campaign. */
declare const campaignEnrollmentsParamsSchema: z18.ZodObject<{
	campaignId: z18.core.$ZodBranded<z18.ZodString, "cpg", "out">;
}, z18.core.$strict>;
/** The body that enrolls 1 to 100 unique Prospects into a Campaign. */
declare const enrollProspectsRequestSchema: z18.ZodObject<{
	prospectIds: z18.ZodArray<z18.core.$ZodBranded<z18.ZodString, "prs", "out">>;
}, z18.core.$strict>;
/** The body that enrolls Prospects. */
type EnrollProspectsRequest = z18.infer<typeof enrollProspectsRequestSchema>;
/** Why a Prospect was not enrolled: `suppressed`, `no_consent`, `already_active` (in another active Campaign, or this one) or `not_found` (unknown or out of view). */
declare const ENROLL_REFUSALS: readonly ["suppressed", "no_consent", "already_active", "not_found"];
/** Why a Prospect was not enrolled. */
declare const enrollRefusalSchema: z18.ZodEnum<{
	already_active: "already_active";
	no_consent: "no_consent";
	not_found: "not_found";
	suppressed: "suppressed";
}>;
/** Why a Prospect was not enrolled. */
type EnrollRefusal = z18.infer<typeof enrollRefusalSchema>;
/** The error code each refusal reports. */
declare const ENROLL_REFUSAL_CODES: {
	readonly suppressed: "enrollment.suppressed";
	readonly no_consent: "enrollment.no_consent";
	readonly already_active: "enrollment.already_active";
	readonly not_found: "enrollment.not_found";
};
/**
* What happened to one Prospect of an enroll request: `enrolled` with its Enrollment, or
* `refused` with the reason (and the existing Enrollment's id for `already_active` in this
* Campaign, otherwise null).
*/
declare const enrollResultSchema: z18.ZodObject<{
	prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
	outcome: z18.ZodEnum<{
		enrolled: "enrolled";
		refused: "refused";
	}>;
	refusal: z18.ZodNullable<z18.ZodEnum<{
		already_active: "already_active";
		no_consent: "no_consent";
		not_found: "not_found";
		suppressed: "suppressed";
	}>>;
	enrollmentId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "enr", "out">>;
}, z18.core.$strict>;
/** What happened to one Prospect of an enroll request. */
type EnrollResult = z18.infer<typeof enrollResultSchema>;
/** The answer to an enroll request: one result per Prospect, in the order asked, at most 100. */
declare const enrollProspectsResponseSchema: z18.ZodObject<{
	results: z18.ZodArray<z18.ZodObject<{
		prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
		outcome: z18.ZodEnum<{
			enrolled: "enrolled";
			refused: "refused";
		}>;
		refusal: z18.ZodNullable<z18.ZodEnum<{
			already_active: "already_active";
			no_consent: "no_consent";
			not_found: "not_found";
			suppressed: "suppressed";
		}>>;
		enrollmentId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "enr", "out">>;
	}, z18.core.$strict>>;
}, z18.core.$strict>;
/** The query parameters of an Enrollment list. */
declare const listEnrollmentsQuerySchema: z18.ZodObject<{
	cursor: z18.ZodOptional<z18.ZodString>;
	limit: z18.ZodDefault<z18.ZodPipe<z18.ZodPipe<z18.ZodUnion<readonly [z18.ZodNumber, z18.ZodString]>, z18.ZodTransform<number, string | number>>, z18.ZodNumber>>;
	state: z18.ZodOptional<z18.ZodEnum<{
		active: "active";
		completed: "completed";
		stopped: "stopped";
	}>>;
	stopReason: z18.ZodOptional<z18.ZodEnum<{
		campaign_archived: "campaign_archived";
		complaint: "complaint";
		hard_bounce: "hard_bounce";
		meeting_booked: "meeting_booked";
		no_consent: "no_consent";
		prospect_erased: "prospect_erased";
		removed_by_rep: "removed_by_rep";
		replied: "replied";
		suppressed: "suppressed";
		unsubscribed: "unsubscribed";
		unverified_address: "unverified_address";
	}>>;
	prospectId: z18.ZodOptional<z18.core.$ZodBranded<z18.ZodString, "prs", "out">>;
}, z18.core.$strict>;
/** The query parameters of an Enrollment list. */
type ListEnrollmentsQuery = z18.infer<typeof listEnrollmentsQuerySchema>;
/** One page of Enrollments, newest first (by `enrolledAt`, then id). */
declare const listEnrollmentsResponseSchema: z18.ZodObject<{
	items: z18.ZodArray<z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "enr", "out">;
		campaignId: z18.core.$ZodBranded<z18.ZodString, "cpg", "out">;
		prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
		state: z18.ZodEnum<{
			active: "active";
			completed: "completed";
			stopped: "stopped";
		}>;
		stopReason: z18.ZodNullable<z18.ZodEnum<{
			campaign_archived: "campaign_archived";
			complaint: "complaint";
			hard_bounce: "hard_bounce";
			meeting_booked: "meeting_booked";
			no_consent: "no_consent";
			prospect_erased: "prospect_erased";
			removed_by_rep: "removed_by_rep";
			replied: "replied";
			suppressed: "suppressed";
			unsubscribed: "unsubscribed";
			unverified_address: "unverified_address";
		}>>;
		currentStepKey: z18.ZodNullable<z18.ZodString>;
		currentStep: z18.ZodNullable<z18.ZodNumber>;
		attemptEpoch: z18.ZodNumber;
		nextDueAt: z18.ZodNullable<z18.ZodISODateTime>;
		enrolledAt: z18.ZodISODateTime;
		stoppedAt: z18.ZodNullable<z18.ZodISODateTime>;
		completedAt: z18.ZodNullable<z18.ZodISODateTime>;
	}, z18.core.$strict>>;
	nextCursor: z18.ZodNullable<z18.ZodString>;
}, z18.core.$strip>;
/** The position in an Enrollment list. */
declare const enrollmentCursorSchema: z18.ZodObject<{
	enrolledAt: z18.ZodISODateTime;
	id: z18.core.$ZodBranded<z18.ZodString, "enr", "out">;
}, z18.core.$strict>;
/** The body that takes an Enrollment out of its Campaign by a Rep or Admin; the reason is `removed_by_rep`. */
declare const removeEnrollmentRequestSchema: z18.ZodObject<{}, z18.core.$strict>;
/** The kinds of entry in an Enrollment's log. */
declare const ENROLLMENT_EVENT_KINDS: readonly ["enrolled", "step_entered", "sent", "deferred", "refused", "rep_task_created", "branch_taken", "stopped", "completed"];
/** The kind of an entry in an Enrollment's log. */
declare const enrollmentEventKindSchema: z18.ZodEnum<{
	branch_taken: "branch_taken";
	completed: "completed";
	deferred: "deferred";
	enrolled: "enrolled";
	refused: "refused";
	rep_task_created: "rep_task_created";
	sent: "sent";
	step_entered: "step_entered";
	stopped: "stopped";
}>;
/**
* One entry in an Enrollment's log: what happened at which Step, with the send record where one
* exists. It holds ids and closed values only: no message text, no subject, no address.
* `actorMembershipId` is the person who caused it (null for the engine).
*/
declare const enrollmentEventSchema: z18.ZodObject<{
	id: z18.core.$ZodBranded<z18.ZodString, "eev", "out">;
	enrollmentId: z18.core.$ZodBranded<z18.ZodString, "enr", "out">;
	kind: z18.ZodEnum<{
		branch_taken: "branch_taken";
		completed: "completed";
		deferred: "deferred";
		enrolled: "enrolled";
		refused: "refused";
		rep_task_created: "rep_task_created";
		sent: "sent";
		step_entered: "step_entered";
		stopped: "stopped";
	}>;
	stepKey: z18.ZodNullable<z18.ZodString>;
	variantKey: z18.ZodNullable<z18.ZodString>;
	sendId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "snd", "out">>;
	stopReason: z18.ZodNullable<z18.ZodEnum<{
		campaign_archived: "campaign_archived";
		complaint: "complaint";
		hard_bounce: "hard_bounce";
		meeting_booked: "meeting_booked";
		no_consent: "no_consent";
		prospect_erased: "prospect_erased";
		removed_by_rep: "removed_by_rep";
		replied: "replied";
		suppressed: "suppressed";
		unsubscribed: "unsubscribed";
		unverified_address: "unverified_address";
	}>>;
	actorMembershipId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "mem", "out">>;
	occurredAt: z18.ZodISODateTime;
}, z18.core.$strict>;
/** One entry in an Enrollment's log. */
type EnrollmentEvent = z18.infer<typeof enrollmentEventSchema>;
/** One page of an Enrollment's log, newest first (by `occurredAt`, then id). */
declare const listEnrollmentActivityResponseSchema: z18.ZodObject<{
	items: z18.ZodArray<z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "eev", "out">;
		enrollmentId: z18.core.$ZodBranded<z18.ZodString, "enr", "out">;
		kind: z18.ZodEnum<{
			branch_taken: "branch_taken";
			completed: "completed";
			deferred: "deferred";
			enrolled: "enrolled";
			refused: "refused";
			rep_task_created: "rep_task_created";
			sent: "sent";
			step_entered: "step_entered";
			stopped: "stopped";
		}>;
		stepKey: z18.ZodNullable<z18.ZodString>;
		variantKey: z18.ZodNullable<z18.ZodString>;
		sendId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "snd", "out">>;
		stopReason: z18.ZodNullable<z18.ZodEnum<{
			campaign_archived: "campaign_archived";
			complaint: "complaint";
			hard_bounce: "hard_bounce";
			meeting_booked: "meeting_booked";
			no_consent: "no_consent";
			prospect_erased: "prospect_erased";
			removed_by_rep: "removed_by_rep";
			replied: "replied";
			suppressed: "suppressed";
			unsubscribed: "unsubscribed";
			unverified_address: "unverified_address";
		}>>;
		actorMembershipId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "mem", "out">>;
		occurredAt: z18.ZodISODateTime;
	}, z18.core.$strict>>;
	nextCursor: z18.ZodNullable<z18.ZodString>;
}, z18.core.$strip>;
/** The position in an Enrollment's log. */
declare const enrollmentActivityCursorSchema: z18.ZodObject<{
	occurredAt: z18.ZodISODateTime;
	id: z18.core.$ZodBranded<z18.ZodString, "eev", "out">;
}, z18.core.$strict>;
import { ErrorDefinition as ErrorDefinition_8gwh456 } from "..";
/**
* The errors the campaign routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A Campaign, Enrollment or Play outside the caller's view (a Rep's
* view of another Rep's Campaign, or another Organization's) is its `*.not_found` (404, never
* 403), so existence is not revealed.
*
* - `campaign.not_found` (404): unknown or not the caller's to see.
* - `campaign.invalid_state` (409): the action does not fit the Campaign's state (launching an
*   archived one, editing a running Sequence, pausing a draft).
* - `campaign.invalid_sequence` (422): the Sequence has a cycle without a wait, an unreachable
*   Step, an unknown target, a duplicate key or a Step that cannot reach an end; `details` lists
*   the problems as closed codes (`SEQUENCE_PROBLEMS`). The body schema (`sequenceStepsSchema`)
*   rejects the same input, so the service answers this 422 code, not `request.invalid`, for a
*   body that fails it after the envelope parses; it recomputes `findSequenceProblems` for `details`.
* - `campaign.sequence_version_conflict` (409): the Sequence was saved since the caller read it.
* - `campaign.not_previewed` (409): launch needs the current Sequence version previewed.
* - `campaign.no_healthy_mailbox` (409): no healthy connected Mailbox can send for the Campaign.
* - `campaign.audience_empty` (409): nobody in the audience is eligible.
* - `campaign.audience_check_pending` (409): the audience check has not finished for the current
*   audience; start or wait for one.
* - `enrollment.not_found` (404): unknown or not the caller's to see.
* - `enrollment.suppressed` (409): the Prospect's address is suppressed; it is not enrolled.
* - `enrollment.no_consent` (409): the Prospect has no Contact Consent for email.
* - `enrollment.already_active` (409): the Prospect is already in an active Campaign.
* - `variant.not_found` (404): the Step has no such Variant, or the Step has no test.
* - `variant.invalid_weights` (422): Variants are not two to four with weights adding up to 100;
*   `details` carries the weights' total. As with
*   `campaign.invalid_sequence`, the service maps the schema's failure to this code.
* - `variant.already_promoted` (409): a winner was already promoted for the Step.
* - `play.not_found` (404): unknown or not in the Organization.
* - `play.no_evidence` (409): accepting a Play that cites no evidence needs the acknowledgement.
* - `play.read_only` (409): a built-in Play cannot be changed.
* - `play.invalid_state` (409): the Play's status does not allow it (accepting a discarded one).
*/
declare const CAMPAIGN_ERRORS: {
	readonly "campaign.audience_check_pending": ErrorDefinition_8gwh456<"campaign.audience_check_pending">;
	readonly "campaign.audience_empty": ErrorDefinition_8gwh456<"campaign.audience_empty">;
	readonly "campaign.invalid_sequence": ErrorDefinition_8gwh456<"campaign.invalid_sequence">;
	readonly "campaign.invalid_state": ErrorDefinition_8gwh456<"campaign.invalid_state">;
	readonly "campaign.no_healthy_mailbox": ErrorDefinition_8gwh456<"campaign.no_healthy_mailbox">;
	readonly "campaign.not_found": ErrorDefinition_8gwh456<"campaign.not_found">;
	readonly "campaign.not_previewed": ErrorDefinition_8gwh456<"campaign.not_previewed">;
	readonly "campaign.sequence_version_conflict": ErrorDefinition_8gwh456<"campaign.sequence_version_conflict">;
	readonly "enrollment.already_active": ErrorDefinition_8gwh456<"enrollment.already_active">;
	readonly "enrollment.no_consent": ErrorDefinition_8gwh456<"enrollment.no_consent">;
	readonly "enrollment.not_found": ErrorDefinition_8gwh456<"enrollment.not_found">;
	readonly "enrollment.suppressed": ErrorDefinition_8gwh456<"enrollment.suppressed">;
	readonly "play.invalid_state": ErrorDefinition_8gwh456<"play.invalid_state">;
	readonly "play.no_evidence": ErrorDefinition_8gwh456<"play.no_evidence">;
	readonly "play.not_found": ErrorDefinition_8gwh456<"play.not_found">;
	readonly "play.read_only": ErrorDefinition_8gwh456<"play.read_only">;
	readonly "variant.already_promoted": ErrorDefinition_8gwh456<"variant.already_promoted">;
	readonly "variant.invalid_weights": ErrorDefinition_8gwh456<"variant.invalid_weights">;
	readonly "variant.not_found": ErrorDefinition_8gwh456<"variant.not_found">;
};
/** An error code the campaign routes return. */
type CampaignErrorCode = keyof typeof CAMPAIGN_ERRORS;
import { z as z19 } from "zod";
/** `campaign.launched` (version 1): a Campaign started running at a Sequence version, by a person. Ids and values only. */
declare const campaignLaunchedEvent: {
	type: "campaign.launched";
	version: 1;
	schema: z19.ZodObject<{
		id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
		occurredAt: z19.ZodISODateTime;
		organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
		region: z19.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z19.ZodLiteral<"campaign.launched">;
		version: z19.ZodLiteral<1>;
		data: z19.ZodObject<{
			campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
			launchedByMembershipId: z19.core.$ZodBranded<z19.ZodString, "mem", "out">;
			sequenceVersion: z19.ZodNumber;
			launchedAt: z19.ZodISODateTime;
		}, z19.core.$strict>;
	}, z19.core.$strip>;
	parse: (input: unknown) => {
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "campaign.launched";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			launchedByMembershipId: string & z19.$brand<"mem">;
			sequenceVersion: number;
			launchedAt: string;
		};
	};
	safeParse: (input: unknown) => z19.ZodSafeParseResult<{
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "campaign.launched";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			launchedByMembershipId: string & z19.$brand<"mem">;
			sequenceVersion: number;
			launchedAt: string;
		};
	}>;
};
/** `enrollment.stopped` (version 1): an Enrollment stopped, with the closed reason. Ids and values only. */
declare const enrollmentStoppedEvent: {
	type: "enrollment.stopped";
	version: 1;
	schema: z19.ZodObject<{
		id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
		occurredAt: z19.ZodISODateTime;
		organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
		region: z19.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z19.ZodLiteral<"enrollment.stopped">;
		version: z19.ZodLiteral<1>;
		data: z19.ZodObject<{
			campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
			enrollmentId: z19.core.$ZodBranded<z19.ZodString, "enr", "out">;
			prospectId: z19.core.$ZodBranded<z19.ZodString, "prs", "out">;
			stopReason: z19.ZodEnum<{
				campaign_archived: "campaign_archived";
				complaint: "complaint";
				hard_bounce: "hard_bounce";
				meeting_booked: "meeting_booked";
				no_consent: "no_consent";
				prospect_erased: "prospect_erased";
				removed_by_rep: "removed_by_rep";
				replied: "replied";
				suppressed: "suppressed";
				unsubscribed: "unsubscribed";
				unverified_address: "unverified_address";
			}>;
			stoppedAt: z19.ZodISODateTime;
		}, z19.core.$strict>;
	}, z19.core.$strip>;
	parse: (input: unknown) => {
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "enrollment.stopped";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			enrollmentId: string & z19.$brand<"enr">;
			prospectId: string & z19.$brand<"prs">;
			stopReason: "campaign_archived" | "complaint" | "hard_bounce" | "meeting_booked" | "no_consent" | "prospect_erased" | "removed_by_rep" | "replied" | "suppressed" | "unsubscribed" | "unverified_address";
			stoppedAt: string;
		};
	};
	safeParse: (input: unknown) => z19.ZodSafeParseResult<{
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "enrollment.stopped";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			enrollmentId: string & z19.$brand<"enr">;
			prospectId: string & z19.$brand<"prs">;
			stopReason: "campaign_archived" | "complaint" | "hard_bounce" | "meeting_booked" | "no_consent" | "prospect_erased" | "removed_by_rep" | "replied" | "suppressed" | "unsubscribed" | "unverified_address";
			stoppedAt: string;
		};
	}>;
};
/**
* `step.sent` (version 1): an email Step was sent for an Enrollment. `step` is the Step's
* position, the number in the send key. `variantKey` is null when the Step has no test. No
* subject, body or address.
*/
declare const stepSentEvent: {
	type: "step.sent";
	version: 1;
	schema: z19.ZodObject<{
		id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
		occurredAt: z19.ZodISODateTime;
		organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
		region: z19.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z19.ZodLiteral<"step.sent">;
		version: z19.ZodLiteral<1>;
		data: z19.ZodObject<{
			campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
			enrollmentId: z19.core.$ZodBranded<z19.ZodString, "enr", "out">;
			prospectId: z19.core.$ZodBranded<z19.ZodString, "prs", "out">;
			sendId: z19.core.$ZodBranded<z19.ZodString, "snd", "out">;
			stepKey: z19.ZodString;
			step: z19.ZodNumber;
			variantKey: z19.ZodNullable<z19.ZodString>;
			sentAt: z19.ZodISODateTime;
		}, z19.core.$strict>;
	}, z19.core.$strip>;
	parse: (input: unknown) => {
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "step.sent";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			enrollmentId: string & z19.$brand<"enr">;
			prospectId: string & z19.$brand<"prs">;
			sendId: string & z19.$brand<"snd">;
			stepKey: string;
			step: number;
			variantKey: string | null;
			sentAt: string;
		};
	};
	safeParse: (input: unknown) => z19.ZodSafeParseResult<{
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "step.sent";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			enrollmentId: string & z19.$brand<"enr">;
			prospectId: string & z19.$brand<"prs">;
			sendId: string & z19.$brand<"snd">;
			stepKey: string;
			step: number;
			variantKey: string | null;
			sentAt: string;
		};
	}>;
};
/**
* `variant.promoted` (version 1): a Variant became a Step's winner, by a person (`manual`, with
* who) or by the engine (`auto`, with no one). Ids and values only.
*/
declare const variantPromotedEvent: {
	type: "variant.promoted";
	version: 1;
	schema: z19.ZodObject<{
		id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
		occurredAt: z19.ZodISODateTime;
		organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
		region: z19.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z19.ZodLiteral<"variant.promoted">;
		version: z19.ZodLiteral<1>;
		data: z19.ZodObject<{
			campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
			stepKey: z19.ZodString;
			variantKey: z19.ZodString;
			mode: z19.ZodEnum<{
				auto: "auto";
				manual: "manual";
			}>;
			promotedByMembershipId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "mem", "out">>;
			promotedAt: z19.ZodISODateTime;
		}, z19.core.$strict>;
	}, z19.core.$strip>;
	parse: (input: unknown) => {
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "variant.promoted";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			stepKey: string;
			variantKey: string;
			mode: "auto" | "manual";
			promotedByMembershipId: (string & z19.$brand<"mem">) | null;
			promotedAt: string;
		};
	};
	safeParse: (input: unknown) => z19.ZodSafeParseResult<{
		id: string & z19.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z19.$brand<"org">;
		region: "eu" | "us";
		type: "variant.promoted";
		version: 1;
		data: {
			campaignId: string & z19.$brand<"cpg">;
			stepKey: string;
			variantKey: string;
			mode: "auto" | "manual";
			promotedByMembershipId: (string & z19.$brand<"mem">) | null;
			promotedAt: string;
		};
	}>;
};
/** The events the campaign area publishes, by type. */
declare const CAMPAIGN_EVENTS: {
	readonly "campaign.launched": {
		type: "campaign.launched";
		version: 1;
		schema: z19.ZodObject<{
			id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
			occurredAt: z19.ZodISODateTime;
			organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
			region: z19.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z19.ZodLiteral<"campaign.launched">;
			version: z19.ZodLiteral<1>;
			data: z19.ZodObject<{
				campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
				launchedByMembershipId: z19.core.$ZodBranded<z19.ZodString, "mem", "out">;
				sequenceVersion: z19.ZodNumber;
				launchedAt: z19.ZodISODateTime;
			}, z19.core.$strict>;
		}, z19.core.$strip>;
		parse: (input: unknown) => {
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "campaign.launched";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				launchedByMembershipId: string & z19.$brand<"mem">;
				sequenceVersion: number;
				launchedAt: string;
			};
		};
		safeParse: (input: unknown) => z19.ZodSafeParseResult<{
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "campaign.launched";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				launchedByMembershipId: string & z19.$brand<"mem">;
				sequenceVersion: number;
				launchedAt: string;
			};
		}>;
	};
	readonly "enrollment.stopped": {
		type: "enrollment.stopped";
		version: 1;
		schema: z19.ZodObject<{
			id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
			occurredAt: z19.ZodISODateTime;
			organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
			region: z19.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z19.ZodLiteral<"enrollment.stopped">;
			version: z19.ZodLiteral<1>;
			data: z19.ZodObject<{
				campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
				enrollmentId: z19.core.$ZodBranded<z19.ZodString, "enr", "out">;
				prospectId: z19.core.$ZodBranded<z19.ZodString, "prs", "out">;
				stopReason: z19.ZodEnum<{
					campaign_archived: "campaign_archived";
					complaint: "complaint";
					hard_bounce: "hard_bounce";
					meeting_booked: "meeting_booked";
					no_consent: "no_consent";
					prospect_erased: "prospect_erased";
					removed_by_rep: "removed_by_rep";
					replied: "replied";
					suppressed: "suppressed";
					unsubscribed: "unsubscribed";
					unverified_address: "unverified_address";
				}>;
				stoppedAt: z19.ZodISODateTime;
			}, z19.core.$strict>;
		}, z19.core.$strip>;
		parse: (input: unknown) => {
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "enrollment.stopped";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				enrollmentId: string & z19.$brand<"enr">;
				prospectId: string & z19.$brand<"prs">;
				stopReason: "campaign_archived" | "complaint" | "hard_bounce" | "meeting_booked" | "no_consent" | "prospect_erased" | "removed_by_rep" | "replied" | "suppressed" | "unsubscribed" | "unverified_address";
				stoppedAt: string;
			};
		};
		safeParse: (input: unknown) => z19.ZodSafeParseResult<{
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "enrollment.stopped";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				enrollmentId: string & z19.$brand<"enr">;
				prospectId: string & z19.$brand<"prs">;
				stopReason: "campaign_archived" | "complaint" | "hard_bounce" | "meeting_booked" | "no_consent" | "prospect_erased" | "removed_by_rep" | "replied" | "suppressed" | "unsubscribed" | "unverified_address";
				stoppedAt: string;
			};
		}>;
	};
	readonly "step.sent": {
		type: "step.sent";
		version: 1;
		schema: z19.ZodObject<{
			id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
			occurredAt: z19.ZodISODateTime;
			organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
			region: z19.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z19.ZodLiteral<"step.sent">;
			version: z19.ZodLiteral<1>;
			data: z19.ZodObject<{
				campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
				enrollmentId: z19.core.$ZodBranded<z19.ZodString, "enr", "out">;
				prospectId: z19.core.$ZodBranded<z19.ZodString, "prs", "out">;
				sendId: z19.core.$ZodBranded<z19.ZodString, "snd", "out">;
				stepKey: z19.ZodString;
				step: z19.ZodNumber;
				variantKey: z19.ZodNullable<z19.ZodString>;
				sentAt: z19.ZodISODateTime;
			}, z19.core.$strict>;
		}, z19.core.$strip>;
		parse: (input: unknown) => {
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "step.sent";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				enrollmentId: string & z19.$brand<"enr">;
				prospectId: string & z19.$brand<"prs">;
				sendId: string & z19.$brand<"snd">;
				stepKey: string;
				step: number;
				variantKey: string | null;
				sentAt: string;
			};
		};
		safeParse: (input: unknown) => z19.ZodSafeParseResult<{
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "step.sent";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				enrollmentId: string & z19.$brand<"enr">;
				prospectId: string & z19.$brand<"prs">;
				sendId: string & z19.$brand<"snd">;
				stepKey: string;
				step: number;
				variantKey: string | null;
				sentAt: string;
			};
		}>;
	};
	readonly "variant.promoted": {
		type: "variant.promoted";
		version: 1;
		schema: z19.ZodObject<{
			id: z19.core.$ZodBranded<z19.ZodString, "evt", "out">;
			occurredAt: z19.ZodISODateTime;
			organizationId: z19.core.$ZodBranded<z19.ZodString, "org", "out">;
			region: z19.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z19.ZodLiteral<"variant.promoted">;
			version: z19.ZodLiteral<1>;
			data: z19.ZodObject<{
				campaignId: z19.core.$ZodBranded<z19.ZodString, "cpg", "out">;
				stepKey: z19.ZodString;
				variantKey: z19.ZodString;
				mode: z19.ZodEnum<{
					auto: "auto";
					manual: "manual";
				}>;
				promotedByMembershipId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "mem", "out">>;
				promotedAt: z19.ZodISODateTime;
			}, z19.core.$strict>;
		}, z19.core.$strip>;
		parse: (input: unknown) => {
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "variant.promoted";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				stepKey: string;
				variantKey: string;
				mode: "auto" | "manual";
				promotedByMembershipId: (string & z19.$brand<"mem">) | null;
				promotedAt: string;
			};
		};
		safeParse: (input: unknown) => z19.ZodSafeParseResult<{
			id: string & z19.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z19.$brand<"org">;
			region: "eu" | "us";
			type: "variant.promoted";
			version: 1;
			data: {
				campaignId: string & z19.$brand<"cpg">;
				stepKey: string;
				variantKey: string;
				mode: "auto" | "manual";
				promotedByMembershipId: (string & z19.$brand<"mem">) | null;
				promotedAt: string;
			};
		}>;
	};
};
/** The type of a campaign event. */
type CampaignEventType = keyof typeof CAMPAIGN_EVENTS;
import { z as z20 } from "zod";
/** What a Play is for: a cold intro, re-engaging closed-lost Deals, following up after an event, or nurturing. */
declare const PLAY_INTENTS: readonly ["cold_intro", "closed_lost_reengagement", "post_event_follow_up", "nurture"];
/** What a Play is for. */
declare const playIntentSchema: z20.ZodEnum<{
	closed_lost_reengagement: "closed_lost_reengagement";
	cold_intro: "cold_intro";
	nurture: "nurture";
	post_event_follow_up: "post_event_follow_up";
}>;
/** What a Play is for. */
type PlayIntent = z20.infer<typeof playIntentSchema>;
/** Where a Play came from: `builtin` (shipped), `seeded` (proposed from the Organization's won Deals) or `custom` (written by a person). */
declare const PLAY_SOURCES: readonly ["builtin", "seeded", "custom"];
/** Where a Play came from. */
declare const playSourceSchema: z20.ZodEnum<{
	builtin: "builtin";
	custom: "custom";
	seeded: "seeded";
}>;
/** Where a Play came from. */
type PlaySource = z20.infer<typeof playSourceSchema>;
/** A Play's status: `proposed` (awaiting a person), `accepted` (usable by Campaigns) or `discarded`. */
declare const PLAY_STATUSES: readonly ["proposed", "accepted", "discarded"];
/** A Play's status. */
declare const playStatusSchema: z20.ZodEnum<{
	accepted: "accepted";
	discarded: "discarded";
	proposed: "proposed";
}>;
/** A Play's status. */
type PlayStatus = z20.infer<typeof playStatusSchema>;
/**
* Evidence a Play rests on, by id only (no snippet is copied): a Moment of a won Deal's call
* (`callId` with its `dealRecordId`), or a page of a Playbook document.
*/
declare const playCitationSchema: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
	kind: z20.ZodLiteral<"moment">;
	callId: z20.core.$ZodBranded<z20.ZodString, "call", "out">;
	dealRecordId: z20.core.$ZodBranded<z20.ZodString, "deal", "out">;
}, z20.core.$strict>, z20.ZodObject<{
	kind: z20.ZodLiteral<"document">;
	documentId: z20.core.$ZodBranded<z20.ZodString, "doc", "out">;
	page: z20.ZodNullable<z20.ZodNumber>;
}, z20.core.$strict>], "kind">;
/** Evidence a Play rests on. */
type PlayCitation = z20.infer<typeof playCitationSchema>;
/**
* A Play: a reusable Sequence for a stated intent. A `seeded` Play cites the evidence it was
* proposed from; with no citation `noEvidence` is true and the portal says so. Accepting one with
* no evidence needs an explicit acknowledgement (`play.no_evidence` otherwise). A `builtin` Play
* is read-only.
*/
declare const playSchema: z20.ZodObject<{
	id: z20.core.$ZodBranded<z20.ZodString, "ply", "out">;
	name: z20.ZodPipe<z20.ZodString, z20.ZodString>;
	intent: z20.ZodEnum<{
		closed_lost_reengagement: "closed_lost_reengagement";
		cold_intro: "cold_intro";
		nurture: "nurture";
		post_event_follow_up: "post_event_follow_up";
	}>;
	goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
	source: z20.ZodEnum<{
		builtin: "builtin";
		custom: "custom";
		seeded: "seeded";
	}>;
	status: z20.ZodEnum<{
		accepted: "accepted";
		discarded: "discarded";
		proposed: "proposed";
	}>;
	steps: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
		kind: z20.ZodLiteral<"email">;
		key: z20.ZodString;
		goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		variants: z20.ZodNullable<z20.ZodObject<{
			variants: z20.ZodArray<z20.ZodObject<{
				key: z20.ZodString;
				label: z20.ZodPipe<z20.ZodString, z20.ZodString>;
				angle: z20.ZodPipe<z20.ZodString, z20.ZodString>;
				weight: z20.ZodNumber;
			}, z20.core.$strict>>;
			promotion: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
				mode: z20.ZodLiteral<"manual">;
			}, z20.core.$strict>, z20.ZodObject<{
				mode: z20.ZodLiteral<"auto">;
				minSamplePerVariant: z20.ZodNumber;
				marginPercentagePoints: z20.ZodNumber;
			}, z20.core.$strict>], "mode">;
		}, z20.core.$strict>>;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"wait">;
		key: z20.ZodString;
		waitHours: z20.ZodNumber;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"branch">;
		key: z20.ZodString;
		arms: z20.ZodArray<z20.ZodObject<{
			condition: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
				kind: z20.ZodLiteral<"out_of_office">;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"no_response">;
				afterHours: z20.ZodNumber;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"task_completed">;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"task_skipped">;
			}, z20.core.$strict>], "kind">;
			next: z20.ZodString;
		}, z20.core.$strict>>;
		default: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"rep_task">;
		key: z20.ZodString;
		task: z20.ZodEnum<{
			call: "call";
			manual_message: "manual_message";
			other: "other";
			research: "research";
		}>;
		instruction: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		dueInHours: z20.ZodNumber;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"end">;
		key: z20.ZodString;
	}, z20.core.$strict>], "kind">>;
	citations: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
		kind: z20.ZodLiteral<"moment">;
		callId: z20.core.$ZodBranded<z20.ZodString, "call", "out">;
		dealRecordId: z20.core.$ZodBranded<z20.ZodString, "deal", "out">;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"document">;
		documentId: z20.core.$ZodBranded<z20.ZodString, "doc", "out">;
		page: z20.ZodNullable<z20.ZodNumber>;
	}, z20.core.$strict>], "kind">>;
	evidenceCount: z20.ZodNumber;
	noEvidence: z20.ZodBoolean;
	createdByMembershipId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "mem", "out">>;
	createdAt: z20.ZodISODateTime;
	updatedAt: z20.ZodISODateTime;
}, z20.core.$strict>;
/** A Play. */
type Play = z20.infer<typeof playSchema>;
/** The path parameters of a request about one Play. */
declare const playParamsSchema: z20.ZodObject<{
	playId: z20.core.$ZodBranded<z20.ZodString, "ply", "out">;
}, z20.core.$strict>;
/** The query parameters of a Play list. */
declare const listPlaysQuerySchema: z20.ZodObject<{
	cursor: z20.ZodOptional<z20.ZodString>;
	limit: z20.ZodDefault<z20.ZodPipe<z20.ZodPipe<z20.ZodUnion<readonly [z20.ZodNumber, z20.ZodString]>, z20.ZodTransform<number, string | number>>, z20.ZodNumber>>;
	intent: z20.ZodOptional<z20.ZodEnum<{
		closed_lost_reengagement: "closed_lost_reengagement";
		cold_intro: "cold_intro";
		nurture: "nurture";
		post_event_follow_up: "post_event_follow_up";
	}>>;
	status: z20.ZodOptional<z20.ZodEnum<{
		accepted: "accepted";
		discarded: "discarded";
		proposed: "proposed";
	}>>;
	source: z20.ZodOptional<z20.ZodEnum<{
		builtin: "builtin";
		custom: "custom";
		seeded: "seeded";
	}>>;
}, z20.core.$strict>;
/** The query parameters of a Play list. */
type ListPlaysQuery = z20.infer<typeof listPlaysQuerySchema>;
/** One page of Plays, newest first (by `createdAt`, then id). */
declare const listPlaysResponseSchema: z20.ZodObject<{
	items: z20.ZodArray<z20.ZodObject<{
		id: z20.core.$ZodBranded<z20.ZodString, "ply", "out">;
		name: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		intent: z20.ZodEnum<{
			closed_lost_reengagement: "closed_lost_reengagement";
			cold_intro: "cold_intro";
			nurture: "nurture";
			post_event_follow_up: "post_event_follow_up";
		}>;
		goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		source: z20.ZodEnum<{
			builtin: "builtin";
			custom: "custom";
			seeded: "seeded";
		}>;
		status: z20.ZodEnum<{
			accepted: "accepted";
			discarded: "discarded";
			proposed: "proposed";
		}>;
		steps: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
			kind: z20.ZodLiteral<"email">;
			key: z20.ZodString;
			goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
			variants: z20.ZodNullable<z20.ZodObject<{
				variants: z20.ZodArray<z20.ZodObject<{
					key: z20.ZodString;
					label: z20.ZodPipe<z20.ZodString, z20.ZodString>;
					angle: z20.ZodPipe<z20.ZodString, z20.ZodString>;
					weight: z20.ZodNumber;
				}, z20.core.$strict>>;
				promotion: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
					mode: z20.ZodLiteral<"manual">;
				}, z20.core.$strict>, z20.ZodObject<{
					mode: z20.ZodLiteral<"auto">;
					minSamplePerVariant: z20.ZodNumber;
					marginPercentagePoints: z20.ZodNumber;
				}, z20.core.$strict>], "mode">;
			}, z20.core.$strict>>;
			next: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"wait">;
			key: z20.ZodString;
			waitHours: z20.ZodNumber;
			next: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"branch">;
			key: z20.ZodString;
			arms: z20.ZodArray<z20.ZodObject<{
				condition: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
					kind: z20.ZodLiteral<"out_of_office">;
				}, z20.core.$strict>, z20.ZodObject<{
					kind: z20.ZodLiteral<"no_response">;
					afterHours: z20.ZodNumber;
				}, z20.core.$strict>, z20.ZodObject<{
					kind: z20.ZodLiteral<"task_completed">;
				}, z20.core.$strict>, z20.ZodObject<{
					kind: z20.ZodLiteral<"task_skipped">;
				}, z20.core.$strict>], "kind">;
				next: z20.ZodString;
			}, z20.core.$strict>>;
			default: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"rep_task">;
			key: z20.ZodString;
			task: z20.ZodEnum<{
				call: "call";
				manual_message: "manual_message";
				other: "other";
				research: "research";
			}>;
			instruction: z20.ZodPipe<z20.ZodString, z20.ZodString>;
			dueInHours: z20.ZodNumber;
			next: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"end">;
			key: z20.ZodString;
		}, z20.core.$strict>], "kind">>;
		citations: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
			kind: z20.ZodLiteral<"moment">;
			callId: z20.core.$ZodBranded<z20.ZodString, "call", "out">;
			dealRecordId: z20.core.$ZodBranded<z20.ZodString, "deal", "out">;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"document">;
			documentId: z20.core.$ZodBranded<z20.ZodString, "doc", "out">;
			page: z20.ZodNullable<z20.ZodNumber>;
		}, z20.core.$strict>], "kind">>;
		evidenceCount: z20.ZodNumber;
		noEvidence: z20.ZodBoolean;
		createdByMembershipId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "mem", "out">>;
		createdAt: z20.ZodISODateTime;
		updatedAt: z20.ZodISODateTime;
	}, z20.core.$strict>>;
	nextCursor: z20.ZodNullable<z20.ZodString>;
}, z20.core.$strip>;
/** The position in a Play list. */
declare const playCursorSchema: z20.ZodObject<{
	createdAt: z20.ZodISODateTime;
	id: z20.core.$ZodBranded<z20.ZodString, "ply", "out">;
}, z20.core.$strict>;
/** The body that writes a custom Play, accepted at once. */
declare const createPlayRequestSchema: z20.ZodObject<{
	name: z20.ZodPipe<z20.ZodString, z20.ZodString>;
	intent: z20.ZodEnum<{
		closed_lost_reengagement: "closed_lost_reengagement";
		cold_intro: "cold_intro";
		nurture: "nurture";
		post_event_follow_up: "post_event_follow_up";
	}>;
	goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
	steps: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
		kind: z20.ZodLiteral<"email">;
		key: z20.ZodString;
		goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		variants: z20.ZodNullable<z20.ZodObject<{
			variants: z20.ZodArray<z20.ZodObject<{
				key: z20.ZodString;
				label: z20.ZodPipe<z20.ZodString, z20.ZodString>;
				angle: z20.ZodPipe<z20.ZodString, z20.ZodString>;
				weight: z20.ZodNumber;
			}, z20.core.$strict>>;
			promotion: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
				mode: z20.ZodLiteral<"manual">;
			}, z20.core.$strict>, z20.ZodObject<{
				mode: z20.ZodLiteral<"auto">;
				minSamplePerVariant: z20.ZodNumber;
				marginPercentagePoints: z20.ZodNumber;
			}, z20.core.$strict>], "mode">;
		}, z20.core.$strict>>;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"wait">;
		key: z20.ZodString;
		waitHours: z20.ZodNumber;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"branch">;
		key: z20.ZodString;
		arms: z20.ZodArray<z20.ZodObject<{
			condition: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
				kind: z20.ZodLiteral<"out_of_office">;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"no_response">;
				afterHours: z20.ZodNumber;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"task_completed">;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"task_skipped">;
			}, z20.core.$strict>], "kind">;
			next: z20.ZodString;
		}, z20.core.$strict>>;
		default: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"rep_task">;
		key: z20.ZodString;
		task: z20.ZodEnum<{
			call: "call";
			manual_message: "manual_message";
			other: "other";
			research: "research";
		}>;
		instruction: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		dueInHours: z20.ZodNumber;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"end">;
		key: z20.ZodString;
	}, z20.core.$strict>], "kind">>;
}, z20.core.$strict>;
/** The body that edits a custom or proposed Play: at least one field. A `builtin` Play is `play.read_only`. */
declare const editPlayRequestSchema: z20.ZodObject<{
	name: z20.ZodOptional<z20.ZodPipe<z20.ZodString, z20.ZodString>>;
	goal: z20.ZodOptional<z20.ZodPipe<z20.ZodString, z20.ZodString>>;
	steps: z20.ZodOptional<z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
		kind: z20.ZodLiteral<"email">;
		key: z20.ZodString;
		goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		variants: z20.ZodNullable<z20.ZodObject<{
			variants: z20.ZodArray<z20.ZodObject<{
				key: z20.ZodString;
				label: z20.ZodPipe<z20.ZodString, z20.ZodString>;
				angle: z20.ZodPipe<z20.ZodString, z20.ZodString>;
				weight: z20.ZodNumber;
			}, z20.core.$strict>>;
			promotion: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
				mode: z20.ZodLiteral<"manual">;
			}, z20.core.$strict>, z20.ZodObject<{
				mode: z20.ZodLiteral<"auto">;
				minSamplePerVariant: z20.ZodNumber;
				marginPercentagePoints: z20.ZodNumber;
			}, z20.core.$strict>], "mode">;
		}, z20.core.$strict>>;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"wait">;
		key: z20.ZodString;
		waitHours: z20.ZodNumber;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"branch">;
		key: z20.ZodString;
		arms: z20.ZodArray<z20.ZodObject<{
			condition: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
				kind: z20.ZodLiteral<"out_of_office">;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"no_response">;
				afterHours: z20.ZodNumber;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"task_completed">;
			}, z20.core.$strict>, z20.ZodObject<{
				kind: z20.ZodLiteral<"task_skipped">;
			}, z20.core.$strict>], "kind">;
			next: z20.ZodString;
		}, z20.core.$strict>>;
		default: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"rep_task">;
		key: z20.ZodString;
		task: z20.ZodEnum<{
			call: "call";
			manual_message: "manual_message";
			other: "other";
			research: "research";
		}>;
		instruction: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		dueInHours: z20.ZodNumber;
		next: z20.ZodString;
	}, z20.core.$strict>, z20.ZodObject<{
		kind: z20.ZodLiteral<"end">;
		key: z20.ZodString;
	}, z20.core.$strict>], "kind">>>;
}, z20.core.$strict>;
/**
* The body that asks for proposed Plays from the Organization's won Deals for an intent: at most
* 5, each citing its evidence. It answers at once with what the Playbook can support, possibly
* none.
*/
declare const proposePlaysRequestSchema: z20.ZodObject<{
	intent: z20.ZodEnum<{
		closed_lost_reengagement: "closed_lost_reengagement";
		cold_intro: "cold_intro";
		nurture: "nurture";
		post_event_follow_up: "post_event_follow_up";
	}>;
	count: z20.ZodDefault<z20.ZodNumber>;
}, z20.core.$strict>;
/** The answer to a proposal request: the new `proposed` Plays, at most 5. */
declare const proposePlaysResponseSchema: z20.ZodObject<{
	plays: z20.ZodArray<z20.ZodObject<{
		id: z20.core.$ZodBranded<z20.ZodString, "ply", "out">;
		name: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		intent: z20.ZodEnum<{
			closed_lost_reengagement: "closed_lost_reengagement";
			cold_intro: "cold_intro";
			nurture: "nurture";
			post_event_follow_up: "post_event_follow_up";
		}>;
		goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
		source: z20.ZodEnum<{
			builtin: "builtin";
			custom: "custom";
			seeded: "seeded";
		}>;
		status: z20.ZodEnum<{
			accepted: "accepted";
			discarded: "discarded";
			proposed: "proposed";
		}>;
		steps: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
			kind: z20.ZodLiteral<"email">;
			key: z20.ZodString;
			goal: z20.ZodPipe<z20.ZodString, z20.ZodString>;
			variants: z20.ZodNullable<z20.ZodObject<{
				variants: z20.ZodArray<z20.ZodObject<{
					key: z20.ZodString;
					label: z20.ZodPipe<z20.ZodString, z20.ZodString>;
					angle: z20.ZodPipe<z20.ZodString, z20.ZodString>;
					weight: z20.ZodNumber;
				}, z20.core.$strict>>;
				promotion: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
					mode: z20.ZodLiteral<"manual">;
				}, z20.core.$strict>, z20.ZodObject<{
					mode: z20.ZodLiteral<"auto">;
					minSamplePerVariant: z20.ZodNumber;
					marginPercentagePoints: z20.ZodNumber;
				}, z20.core.$strict>], "mode">;
			}, z20.core.$strict>>;
			next: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"wait">;
			key: z20.ZodString;
			waitHours: z20.ZodNumber;
			next: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"branch">;
			key: z20.ZodString;
			arms: z20.ZodArray<z20.ZodObject<{
				condition: z20.ZodDiscriminatedUnion<[z20.ZodObject<{
					kind: z20.ZodLiteral<"out_of_office">;
				}, z20.core.$strict>, z20.ZodObject<{
					kind: z20.ZodLiteral<"no_response">;
					afterHours: z20.ZodNumber;
				}, z20.core.$strict>, z20.ZodObject<{
					kind: z20.ZodLiteral<"task_completed">;
				}, z20.core.$strict>, z20.ZodObject<{
					kind: z20.ZodLiteral<"task_skipped">;
				}, z20.core.$strict>], "kind">;
				next: z20.ZodString;
			}, z20.core.$strict>>;
			default: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"rep_task">;
			key: z20.ZodString;
			task: z20.ZodEnum<{
				call: "call";
				manual_message: "manual_message";
				other: "other";
				research: "research";
			}>;
			instruction: z20.ZodPipe<z20.ZodString, z20.ZodString>;
			dueInHours: z20.ZodNumber;
			next: z20.ZodString;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"end">;
			key: z20.ZodString;
		}, z20.core.$strict>], "kind">>;
		citations: z20.ZodArray<z20.ZodDiscriminatedUnion<[z20.ZodObject<{
			kind: z20.ZodLiteral<"moment">;
			callId: z20.core.$ZodBranded<z20.ZodString, "call", "out">;
			dealRecordId: z20.core.$ZodBranded<z20.ZodString, "deal", "out">;
		}, z20.core.$strict>, z20.ZodObject<{
			kind: z20.ZodLiteral<"document">;
			documentId: z20.core.$ZodBranded<z20.ZodString, "doc", "out">;
			page: z20.ZodNullable<z20.ZodNumber>;
		}, z20.core.$strict>], "kind">>;
		evidenceCount: z20.ZodNumber;
		noEvidence: z20.ZodBoolean;
		createdByMembershipId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "mem", "out">>;
		createdAt: z20.ZodISODateTime;
		updatedAt: z20.ZodISODateTime;
	}, z20.core.$strict>>;
}, z20.core.$strict>;
/** The body that accepts a proposed Play; `acknowledgeNoEvidence` must be true to accept one with no evidence. */
declare const acceptPlayRequestSchema: z20.ZodObject<{
	acknowledgeNoEvidence: z20.ZodDefault<z20.ZodBoolean>;
}, z20.core.$strict>;
/** The body that accepts a proposed Play. */
type AcceptPlayRequest = z20.input<typeof acceptPlayRequestSchema>;
/** Every role: each works the Campaigns they may see. */
declare const CAMPAIGN_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that launch and archive Campaigns and manage Plays. */
declare const CAMPAIGN_ADMIN_ROLES: readonly ["owner", "admin"];
/** The campaign routes, by name. */
type CampaignRouteName = "listCampaigns" | "createCampaign" | "getCampaign" | "updateCampaign" | "duplicateCampaign" | "archiveCampaign" | "pauseCampaign" | "resumeCampaign" | "launchCampaign" | "getCampaignStats" | "getSequence" | "setSequence" | "startAudienceCheck" | "getAudienceCheck" | "getLaunchCheck" | "enrollProspects" | "listEnrollments" | "getEnrollment" | "listEnrollmentActivity" | "removeEnrollment" | "getVariantResults" | "promoteVariant" | "listPlays" | "getPlay" | "createPlay" | "editPlay" | "proposePlays" | "acceptPlay" | "discardPlay";
/** One campaign route. */
type CampaignRoute = InboundRoute<CampaignErrorCode>;
/**
* The campaign routes (spec M07). Outbound owns them. Lists are cursor-paginated with a page of
* at most 100. Every route that changes something needs an Idempotency-Key header. Contact
* Consent and suppression are checked by core at send time (ADR 0003) and again when a Prospect
* is enrolled; no route has a setting that skips either.
*/
declare const CAMPAIGN_ROUTES: Readonly<Record<CampaignRouteName, CampaignRoute>>;
import { z as z21 } from "zod";
/** The kinds of Step this release has. A new kind is a new member of {@link stepSchema}; none changes. */
declare const STEP_KINDS: readonly ["email", "wait", "branch", "rep_task", "end"];
/** A kind of Step. */
declare const stepKindSchema: z21.ZodEnum<{
	branch: "branch";
	email: "email";
	end: "end";
	rep_task: "rep_task";
	wait: "wait";
}>;
/** A kind of Step. */
type StepKind = z21.infer<typeof stepKindSchema>;
/**
* An email Step: send one email toward a `goal`, optionally as a test of two to four Variants,
* then go to `next`. Message text is drafted per Prospect from the goal and the Variant's angle.
*/
declare const emailStepSchema: z21.ZodObject<{
	kind: z21.ZodLiteral<"email">;
	key: z21.ZodString;
	goal: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	variants: z21.ZodNullable<z21.ZodObject<{
		variants: z21.ZodArray<z21.ZodObject<{
			key: z21.ZodString;
			label: z21.ZodPipe<z21.ZodString, z21.ZodString>;
			angle: z21.ZodPipe<z21.ZodString, z21.ZodString>;
			weight: z21.ZodNumber;
		}, z21.core.$strict>>;
		promotion: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
			mode: z21.ZodLiteral<"manual">;
		}, z21.core.$strict>, z21.ZodObject<{
			mode: z21.ZodLiteral<"auto">;
			minSamplePerVariant: z21.ZodNumber;
			marginPercentagePoints: z21.ZodNumber;
		}, z21.core.$strict>], "mode">;
	}, z21.core.$strict>>;
	next: z21.ZodString;
}, z21.core.$strict>;
/** A wait: nothing happens for `waitHours` (1 to 2,160), then go to `next`. */
declare const waitStepSchema: z21.ZodObject<{
	kind: z21.ZodLiteral<"wait">;
	key: z21.ZodString;
	waitHours: z21.ZodNumber;
	next: z21.ZodString;
}, z21.core.$strict>;
/**
* What a branch may test. Only recorded events and elapsed time are available: `out_of_office`
* (an automatic reply said the Prospect is away), `no_response` (no reply `afterHours` after the
* last email), `task_completed` and `task_skipped` (the outcome of the Rep task before it). A
* reply, a bounce, an unsubscribe or a suppression is never a condition: each stops the
* Enrollment. There is no condition on opens or clicks, because nothing is tracked.
*/
declare const branchConditionSchema: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
	kind: z21.ZodLiteral<"out_of_office">;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"no_response">;
	afterHours: z21.ZodNumber;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"task_completed">;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"task_skipped">;
}, z21.core.$strict>], "kind">;
/** What a branch may test. */
type BranchCondition = z21.infer<typeof branchConditionSchema>;
/** One arm of a branch: when the condition holds, go to `next`. */
declare const branchArmSchema: z21.ZodObject<{
	condition: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
		kind: z21.ZodLiteral<"out_of_office">;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"no_response">;
		afterHours: z21.ZodNumber;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"task_completed">;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"task_skipped">;
	}, z21.core.$strict>], "kind">;
	next: z21.ZodString;
}, z21.core.$strict>;
/** The most arms one branch has, besides its default. */
declare const MAX_BRANCH_ARMS = 5;
/**
* A branch: the arms are tried in order and the first whose condition holds is taken; when none
* does, `default` is. `default` is required, so a branch always leads somewhere.
*/
declare const branchStepSchema: z21.ZodObject<{
	kind: z21.ZodLiteral<"branch">;
	key: z21.ZodString;
	arms: z21.ZodArray<z21.ZodObject<{
		condition: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
			kind: z21.ZodLiteral<"out_of_office">;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"no_response">;
			afterHours: z21.ZodNumber;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"task_completed">;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"task_skipped">;
		}, z21.core.$strict>], "kind">;
		next: z21.ZodString;
	}, z21.core.$strict>>;
	default: z21.ZodString;
}, z21.core.$strict>;
/** The kinds of work a Rep task asks for. The Agent never cold-calls (ADR 0003), so a call is a task for a person. */
declare const REP_TASK_TYPES: readonly ["call", "manual_message", "research", "other"];
/** The kind of work a Rep task asks for. */
declare const repTaskTypeSchema: z21.ZodEnum<{
	call: "call";
	manual_message: "manual_message";
	other: "other";
	research: "research";
}>;
/** The kind of work a Rep task asks for. */
type RepTaskType = z21.infer<typeof repTaskTypeSchema>;
/**
* A task for the Prospect's owner (a Rep): do `task`, as `instruction` says, within `dueInHours`
* (1 to 2,160), then go to `next` whether it was done or skipped. A following branch may test which.
*/
declare const repTaskStepSchema: z21.ZodObject<{
	kind: z21.ZodLiteral<"rep_task">;
	key: z21.ZodString;
	task: z21.ZodEnum<{
		call: "call";
		manual_message: "manual_message";
		other: "other";
		research: "research";
	}>;
	instruction: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	dueInHours: z21.ZodNumber;
	next: z21.ZodString;
}, z21.core.$strict>;
/** The end: the Enrollment completes. */
declare const endStepSchema: z21.ZodObject<{
	kind: z21.ZodLiteral<"end">;
	key: z21.ZodString;
}, z21.core.$strict>;
/** One Step of a Sequence, by kind. */
declare const stepSchema: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
	kind: z21.ZodLiteral<"email">;
	key: z21.ZodString;
	goal: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	variants: z21.ZodNullable<z21.ZodObject<{
		variants: z21.ZodArray<z21.ZodObject<{
			key: z21.ZodString;
			label: z21.ZodPipe<z21.ZodString, z21.ZodString>;
			angle: z21.ZodPipe<z21.ZodString, z21.ZodString>;
			weight: z21.ZodNumber;
		}, z21.core.$strict>>;
		promotion: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
			mode: z21.ZodLiteral<"manual">;
		}, z21.core.$strict>, z21.ZodObject<{
			mode: z21.ZodLiteral<"auto">;
			minSamplePerVariant: z21.ZodNumber;
			marginPercentagePoints: z21.ZodNumber;
		}, z21.core.$strict>], "mode">;
	}, z21.core.$strict>>;
	next: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"wait">;
	key: z21.ZodString;
	waitHours: z21.ZodNumber;
	next: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"branch">;
	key: z21.ZodString;
	arms: z21.ZodArray<z21.ZodObject<{
		condition: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
			kind: z21.ZodLiteral<"out_of_office">;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"no_response">;
			afterHours: z21.ZodNumber;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"task_completed">;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"task_skipped">;
		}, z21.core.$strict>], "kind">;
		next: z21.ZodString;
	}, z21.core.$strict>>;
	default: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"rep_task">;
	key: z21.ZodString;
	task: z21.ZodEnum<{
		call: "call";
		manual_message: "manual_message";
		other: "other";
		research: "research";
	}>;
	instruction: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	dueInHours: z21.ZodNumber;
	next: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"end">;
	key: z21.ZodString;
}, z21.core.$strict>], "kind">;
/** One Step of a Sequence. */
type Step = z21.infer<typeof stepSchema>;
/**
* Why a Sequence is not valid, a closed set: `duplicate_key` (two Steps share a key),
* `unknown_target` (a `next`, arm or default names no Step), `unreachable_step` (no path from the
* first Step leads to it), `cycle_without_wait` (a loop that never passes a wait, so it would run
* without pause) and `no_path_to_end` (a reachable Step cannot lead to an end, so an Enrollment
* could never finish).
*/
declare const SEQUENCE_PROBLEMS: readonly ["duplicate_key", "unknown_target", "unreachable_step", "cycle_without_wait", "no_path_to_end"];
/** Why a Sequence is not valid. */
declare const sequenceProblemCodeSchema: z21.ZodEnum<{
	cycle_without_wait: "cycle_without_wait";
	duplicate_key: "duplicate_key";
	no_path_to_end: "no_path_to_end";
	unknown_target: "unknown_target";
	unreachable_step: "unreachable_step";
}>;
/** Why a Sequence is not valid. */
type SequenceProblemCode = z21.infer<typeof sequenceProblemCodeSchema>;
/** One problem found in a Sequence and the Step it concerns. */
declare const sequenceProblemSchema: z21.ZodObject<{
	code: z21.ZodEnum<{
		cycle_without_wait: "cycle_without_wait";
		duplicate_key: "duplicate_key";
		no_path_to_end: "no_path_to_end";
		unknown_target: "unknown_target";
		unreachable_step: "unreachable_step";
	}>;
	stepKey: z21.ZodString;
}, z21.core.$strict>;
/** One problem found in a Sequence. */
type SequenceProblem = z21.infer<typeof sequenceProblemSchema>;
/** The most problems an `campaign.invalid_sequence` error lists. */
declare const MAX_SEQUENCE_PROBLEMS = 50;
/** What `campaign.invalid_sequence` carries in `details`: the problems found, at most 50. */
declare const invalidSequenceDetailsSchema: z21.ZodObject<{
	problems: z21.ZodArray<z21.ZodObject<{
		code: z21.ZodEnum<{
			cycle_without_wait: "cycle_without_wait";
			duplicate_key: "duplicate_key";
			no_path_to_end: "no_path_to_end";
			unknown_target: "unknown_target";
			unreachable_step: "unreachable_step";
		}>;
		stepKey: z21.ZodString;
	}, z21.core.$strict>>;
}, z21.core.$strict>;
/** What `campaign.invalid_sequence` carries in `details`. */
type InvalidSequenceDetails = z21.infer<typeof invalidSequenceDetailsSchema>;
/**
* Finds what makes a list of Steps an invalid Sequence, without throwing. The first Step is where
* every Enrollment starts. Pure and bounded (at most 50 Steps), so a service may call it on every
* save.
*/
declare function findSequenceProblems(steps: readonly Step[]): SequenceProblem[];
/**
* The Steps of a Sequence: 1 to 50, the first being where every Enrollment starts, and a graph
* with no unknown target, no unreachable Step, no loop without a wait and no Step that cannot
* reach an end. A Step's position in this list is the `step` number in its send key.
*/
declare const sequenceStepsSchema: z21.ZodArray<z21.ZodDiscriminatedUnion<[z21.ZodObject<{
	kind: z21.ZodLiteral<"email">;
	key: z21.ZodString;
	goal: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	variants: z21.ZodNullable<z21.ZodObject<{
		variants: z21.ZodArray<z21.ZodObject<{
			key: z21.ZodString;
			label: z21.ZodPipe<z21.ZodString, z21.ZodString>;
			angle: z21.ZodPipe<z21.ZodString, z21.ZodString>;
			weight: z21.ZodNumber;
		}, z21.core.$strict>>;
		promotion: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
			mode: z21.ZodLiteral<"manual">;
		}, z21.core.$strict>, z21.ZodObject<{
			mode: z21.ZodLiteral<"auto">;
			minSamplePerVariant: z21.ZodNumber;
			marginPercentagePoints: z21.ZodNumber;
		}, z21.core.$strict>], "mode">;
	}, z21.core.$strict>>;
	next: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"wait">;
	key: z21.ZodString;
	waitHours: z21.ZodNumber;
	next: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"branch">;
	key: z21.ZodString;
	arms: z21.ZodArray<z21.ZodObject<{
		condition: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
			kind: z21.ZodLiteral<"out_of_office">;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"no_response">;
			afterHours: z21.ZodNumber;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"task_completed">;
		}, z21.core.$strict>, z21.ZodObject<{
			kind: z21.ZodLiteral<"task_skipped">;
		}, z21.core.$strict>], "kind">;
		next: z21.ZodString;
	}, z21.core.$strict>>;
	default: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"rep_task">;
	key: z21.ZodString;
	task: z21.ZodEnum<{
		call: "call";
		manual_message: "manual_message";
		other: "other";
		research: "research";
	}>;
	instruction: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	dueInHours: z21.ZodNumber;
	next: z21.ZodString;
}, z21.core.$strict>, z21.ZodObject<{
	kind: z21.ZodLiteral<"end">;
	key: z21.ZodString;
}, z21.core.$strict>], "kind">>;
/** The body that sets a Campaign's Sequence: the Steps, and the version the caller edited (`campaign.sequence_version_conflict` when it is not the latest). */
declare const setSequenceRequestSchema: z21.ZodObject<{
	expectedVersion: z21.ZodNumber;
	steps: z21.ZodArray<z21.ZodDiscriminatedUnion<[z21.ZodObject<{
		kind: z21.ZodLiteral<"email">;
		key: z21.ZodString;
		goal: z21.ZodPipe<z21.ZodString, z21.ZodString>;
		variants: z21.ZodNullable<z21.ZodObject<{
			variants: z21.ZodArray<z21.ZodObject<{
				key: z21.ZodString;
				label: z21.ZodPipe<z21.ZodString, z21.ZodString>;
				angle: z21.ZodPipe<z21.ZodString, z21.ZodString>;
				weight: z21.ZodNumber;
			}, z21.core.$strict>>;
			promotion: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
				mode: z21.ZodLiteral<"manual">;
			}, z21.core.$strict>, z21.ZodObject<{
				mode: z21.ZodLiteral<"auto">;
				minSamplePerVariant: z21.ZodNumber;
				marginPercentagePoints: z21.ZodNumber;
			}, z21.core.$strict>], "mode">;
		}, z21.core.$strict>>;
		next: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"wait">;
		key: z21.ZodString;
		waitHours: z21.ZodNumber;
		next: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"branch">;
		key: z21.ZodString;
		arms: z21.ZodArray<z21.ZodObject<{
			condition: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
				kind: z21.ZodLiteral<"out_of_office">;
			}, z21.core.$strict>, z21.ZodObject<{
				kind: z21.ZodLiteral<"no_response">;
				afterHours: z21.ZodNumber;
			}, z21.core.$strict>, z21.ZodObject<{
				kind: z21.ZodLiteral<"task_completed">;
			}, z21.core.$strict>, z21.ZodObject<{
				kind: z21.ZodLiteral<"task_skipped">;
			}, z21.core.$strict>], "kind">;
			next: z21.ZodString;
		}, z21.core.$strict>>;
		default: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"rep_task">;
		key: z21.ZodString;
		task: z21.ZodEnum<{
			call: "call";
			manual_message: "manual_message";
			other: "other";
			research: "research";
		}>;
		instruction: z21.ZodPipe<z21.ZodString, z21.ZodString>;
		dueInHours: z21.ZodNumber;
		next: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"end">;
		key: z21.ZodString;
	}, z21.core.$strict>], "kind">>;
}, z21.core.$strict>;
/** The body that sets a Campaign's Sequence. */
type SetSequenceRequest = z21.infer<typeof setSequenceRequestSchema>;
/** A saved Sequence: the Campaign's Steps at one `version`; every save makes the next. Version 0 is the empty Sequence of a new Campaign, which has no Steps and cannot launch. */
declare const sequenceSchema: z21.ZodObject<{
	campaignId: z21.core.$ZodBranded<z21.ZodString, "cpg", "out">;
	version: z21.ZodNumber;
	steps: z21.ZodArray<z21.ZodDiscriminatedUnion<[z21.ZodObject<{
		kind: z21.ZodLiteral<"email">;
		key: z21.ZodString;
		goal: z21.ZodPipe<z21.ZodString, z21.ZodString>;
		variants: z21.ZodNullable<z21.ZodObject<{
			variants: z21.ZodArray<z21.ZodObject<{
				key: z21.ZodString;
				label: z21.ZodPipe<z21.ZodString, z21.ZodString>;
				angle: z21.ZodPipe<z21.ZodString, z21.ZodString>;
				weight: z21.ZodNumber;
			}, z21.core.$strict>>;
			promotion: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
				mode: z21.ZodLiteral<"manual">;
			}, z21.core.$strict>, z21.ZodObject<{
				mode: z21.ZodLiteral<"auto">;
				minSamplePerVariant: z21.ZodNumber;
				marginPercentagePoints: z21.ZodNumber;
			}, z21.core.$strict>], "mode">;
		}, z21.core.$strict>>;
		next: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"wait">;
		key: z21.ZodString;
		waitHours: z21.ZodNumber;
		next: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"branch">;
		key: z21.ZodString;
		arms: z21.ZodArray<z21.ZodObject<{
			condition: z21.ZodDiscriminatedUnion<[z21.ZodObject<{
				kind: z21.ZodLiteral<"out_of_office">;
			}, z21.core.$strict>, z21.ZodObject<{
				kind: z21.ZodLiteral<"no_response">;
				afterHours: z21.ZodNumber;
			}, z21.core.$strict>, z21.ZodObject<{
				kind: z21.ZodLiteral<"task_completed">;
			}, z21.core.$strict>, z21.ZodObject<{
				kind: z21.ZodLiteral<"task_skipped">;
			}, z21.core.$strict>], "kind">;
			next: z21.ZodString;
		}, z21.core.$strict>>;
		default: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"rep_task">;
		key: z21.ZodString;
		task: z21.ZodEnum<{
			call: "call";
			manual_message: "manual_message";
			other: "other";
			research: "research";
		}>;
		instruction: z21.ZodPipe<z21.ZodString, z21.ZodString>;
		dueInHours: z21.ZodNumber;
		next: z21.ZodString;
	}, z21.core.$strict>, z21.ZodObject<{
		kind: z21.ZodLiteral<"end">;
		key: z21.ZodString;
	}, z21.core.$strict>], "kind">>;
	updatedAt: z21.ZodISODateTime;
}, z21.core.$strict>;
/** A saved Sequence. */
type Sequence = z21.infer<typeof sequenceSchema>;
import { z as z22 } from "zod";
/** The longest Campaign or Play name, in characters. */
declare const MAX_CAMPAIGN_NAME_LENGTH = 100;
/** The longest goal of a Campaign or Step, in characters. */
declare const MAX_GOAL_LENGTH = 500;
/** The longest instruction text of a Step, Variant angle or Rep task, in characters. */
declare const MAX_STEP_TEXT_LENGTH = 500;
/** The most Steps one Sequence has. A send key carries the Step's position, so this stays under `MAX_SEQUENCE_STEP`. */
declare const MAX_SEQUENCE_STEPS = 50;
/** The most Prospects one request may name. */
declare const MAX_PROSPECTS_PER_REQUEST = 100;
/** The most Prospects an explicit audience may list; larger audiences use a filter. */
declare const MAX_AUDIENCE_PROSPECTS = 500;
/** The most a Campaign may send in a day, whatever the Mailbox limits add up to. */
declare const MAX_CAMPAIGN_DAILY_CAP = 5e3;
/** The longest a wait or Rep task may last, in hours (90 days). */
declare const MAX_WAIT_HOURS = 2160;
/** The most Plays a proposal request returns. */
declare const MAX_PROPOSED_PLAYS = 5;
/** The most Citations one Play carries. */
declare const MAX_PLAY_CITATIONS = 20;
/** Text of 1 to `maxLength` characters, trimmed; line breaks and tabs are allowed, other control characters are not. */
declare function multilineTextSchema(maxLength: number): z22.ZodPipe<z22.ZodString, z22.ZodString>;
/** A Campaign or Play name: trimmed, 1 to 100 characters, no control character. */
declare const campaignNameSchema: z22.ZodPipe<z22.ZodString, z22.ZodString>;
/** A goal: what the Campaign or Step is for, 1 to 500 characters. */
declare const goalSchema: z22.ZodPipe<z22.ZodString, z22.ZodString>;
/** Instruction text for a Step, a Variant angle or a Rep task, 1 to 500 characters. */
declare const stepTextSchema: z22.ZodPipe<z22.ZodString, z22.ZodString>;
/**
* The key of a Step or Variant inside a Sequence: 1 to 40 characters of lowercase letters, digits,
* `_` and `-`, starting with a letter. Steps point at one another by key.
*/
declare const stepKeySchema: z22.ZodString;
/** The key of a Step or Variant. */
type StepKey = z22.infer<typeof stepKeySchema>;
/** A whole number of hours from 1 to `MAX_WAIT_HOURS`. */
declare const hoursSchema: z22.ZodNumber;
/**
* The state of a Campaign: `draft` (being built), `ready` (previewed, can launch), `running`,
* `paused` (nothing is sent; Enrollments keep their place) and `archived` (history kept, nothing
* runs). Editing the Sequence or the audience of a `ready` Campaign returns it to `draft`.
*/
declare const CAMPAIGN_STATES: readonly ["draft", "ready", "running", "paused", "archived"];
/** The state of a Campaign. */
declare const campaignStateSchema: z22.ZodEnum<{
	archived: "archived";
	draft: "draft";
	paused: "paused";
	ready: "ready";
	running: "running";
}>;
/** The state of a Campaign. */
type CampaignState = z22.infer<typeof campaignStateSchema>;
/**
* How drafts reach a Prospect: `auto` (the Agent sends grounded drafts that pass every check),
* `review` (every draft waits in the approvals inbox) or `mixed` (auto for grounded drafts, review
* for the rest). A draft that fails a check or is not grounded waits for review in every mode.
*/
declare const CAMPAIGN_APPROVAL_MODES: readonly ["auto", "review", "mixed"];
/** How drafts reach a Prospect. */
declare const campaignApprovalModeSchema: z22.ZodEnum<{
	auto: "auto";
	mixed: "mixed";
	review: "review";
}>;
/** How drafts reach a Prospect. */
type CampaignApprovalMode = z22.infer<typeof campaignApprovalModeSchema>;
/** The languages a Campaign writes in in this release: English only. */
declare const CAMPAIGN_LANGUAGES: readonly ["en"];
/** The language a Campaign writes in. */
declare const campaignLanguageSchema: z22.ZodEnum<{
	en: "en";
}>;
/** The language a Campaign writes in. */
type CampaignLanguage = z22.infer<typeof campaignLanguageSchema>;
/** Whose time zone the send window is read in: the Campaign's own, or each Prospect's where known (the Campaign's otherwise). */
declare const WINDOW_ZONES: readonly ["campaign", "prospect"];
/** Whose time zone the send window is read in. */
declare const windowZoneSchema: z22.ZodEnum<{
	campaign: "campaign";
	prospect: "prospect";
}>;
/** Whose time zone the send window is read in. */
type WindowZone = z22.infer<typeof windowZoneSchema>;
/**
* A count of Prospects, Enrollments or sends: a whole number from 0 up to a generous bound, so a
* schema never accepts an absurd value.
*/
declare const countSchema: z22.ZodNumber;
import { z as z23 } from "zod";
/** The fewest Variants a tested Step has. */
declare const MIN_VARIANTS = 2;
/** The most Variants a tested Step has. */
declare const MAX_VARIANTS = 4;
/** The weights of a Step's Variants add up to this. */
declare const VARIANT_WEIGHT_TOTAL = 100;
/** The fewest sends of every Variant before its results are anything but "not enough data". */
declare const MIN_VARIANT_SAMPLE = 100;
/** The largest sample an Admin may ask for before a Variant is promoted. */
declare const MAX_PROMOTION_SAMPLE = 1e5;
/**
* One Variant of an email Step: its `key` (unique in the Step), a `label` for the portal, the
* `angle` the drafter is told to take, and its `weight`, a whole percentage from 1 to 99. The
* message text is drafted per Prospect, not stored here.
*/
declare const variantSchema: z23.ZodObject<{
	key: z23.ZodString;
	label: z23.ZodPipe<z23.ZodString, z23.ZodString>;
	angle: z23.ZodPipe<z23.ZodString, z23.ZodString>;
	weight: z23.ZodNumber;
}, z23.core.$strict>;
/** One Variant of an email Step. */
type Variant = z23.infer<typeof variantSchema>;
/**
* How a winner is chosen. `manual`: only an Admin promotes one. `auto`: the engine promotes the
* Variant whose reply rate leads every other by at least `marginPercentagePoints` once each has
* at least `minSamplePerVariant` sends (not below `MIN_VARIANT_SAMPLE`). The change is logged and
* published as `variant.promoted`.
*/
declare const promotionPolicySchema: z23.ZodDiscriminatedUnion<[z23.ZodObject<{
	mode: z23.ZodLiteral<"manual">;
}, z23.core.$strict>, z23.ZodObject<{
	mode: z23.ZodLiteral<"auto">;
	minSamplePerVariant: z23.ZodNumber;
	marginPercentagePoints: z23.ZodNumber;
}, z23.core.$strict>], "mode">;
/** How a winner is chosen. */
type PromotionPolicy = z23.infer<typeof promotionPolicySchema>;
/**
* The test on an email Step: two to four Variants whose weights add up to exactly 100, with
* unique keys, and a promotion policy. Assignment is deterministic by Prospect and Step, so a
* retry never flips a Variant.
*/
declare const variantGroupSchema: z23.ZodObject<{
	variants: z23.ZodArray<z23.ZodObject<{
		key: z23.ZodString;
		label: z23.ZodPipe<z23.ZodString, z23.ZodString>;
		angle: z23.ZodPipe<z23.ZodString, z23.ZodString>;
		weight: z23.ZodNumber;
	}, z23.core.$strict>>;
	promotion: z23.ZodDiscriminatedUnion<[z23.ZodObject<{
		mode: z23.ZodLiteral<"manual">;
	}, z23.core.$strict>, z23.ZodObject<{
		mode: z23.ZodLiteral<"auto">;
		minSamplePerVariant: z23.ZodNumber;
		marginPercentagePoints: z23.ZodNumber;
	}, z23.core.$strict>], "mode">;
}, z23.core.$strict>;
/** The test on an email Step. */
type VariantGroup = z23.infer<typeof variantGroupSchema>;
/**
* A rate with its 95% interval, each in [0, 1], the estimate between the bounds. Present only once
* a Variant has the minimum sample.
*/
declare const rateIntervalSchema: z23.ZodObject<{
	estimate: z23.ZodNumber;
	lower: z23.ZodNumber;
	upper: z23.ZodNumber;
}, z23.core.$strict>;
/** A rate with its 95% interval. */
type RateInterval = z23.infer<typeof rateIntervalSchema>;
/**
* The results of one Variant: sent, delivered, replied, positive reply (null until the reply
* classification exists), bounced and unsubscribed, and the reply rate with an interval (null
* while the Step is `not_enough_data`). There is no open or click count: nothing is tracked.
*/
declare const variantResultSchema: z23.ZodObject<{
	key: z23.ZodString;
	sent: z23.ZodNumber;
	delivered: z23.ZodNumber;
	replied: z23.ZodNumber;
	positiveReplied: z23.ZodNullable<z23.ZodNumber>;
	bounced: z23.ZodNumber;
	unsubscribed: z23.ZodNumber;
	replyRate: z23.ZodNullable<z23.ZodObject<{
		estimate: z23.ZodNumber;
		lower: z23.ZodNumber;
		upper: z23.ZodNumber;
	}, z23.core.$strict>>;
}, z23.core.$strict>;
/** The results of one Variant. */
type VariantResult = z23.infer<typeof variantResultSchema>;
/** Whether the Variants have enough sends to compare. */
declare const VARIANT_RESULT_STATUSES: readonly ["not_enough_data", "measured"];
/** Whether the Variants have enough sends to compare. */
declare const variantResultStatusSchema: z23.ZodEnum<{
	measured: "measured";
	not_enough_data: "not_enough_data";
}>;
/** How a winner was promoted. */
declare const PROMOTION_SOURCES: readonly ["manual", "auto"];
/** How a winner was promoted. */
declare const promotionSourceSchema: z23.ZodEnum<{
	auto: "auto";
	manual: "manual";
}>;
/** How a winner was promoted. */
type PromotionSource = z23.infer<typeof promotionSourceSchema>;
/** The promoted Variant of a Step, how and by whom (null for an automatic promotion), and when. */
declare const promotionRecordSchema: z23.ZodObject<{
	variantKey: z23.ZodString;
	source: z23.ZodEnum<{
		auto: "auto";
		manual: "manual";
	}>;
	promotedByMembershipId: z23.ZodNullable<z23.core.$ZodBranded<z23.ZodString, "mem", "out">>;
	promotedAt: z23.ZodISODateTime;
}, z23.core.$strict>;
/**
* The results of the Variants of one email Step. Below `minimumSample` sends of any Variant the
* `status` is `not_enough_data` and no interval is given, so a winner is never called early.
* `promotion` is set once a winner was chosen; later sends all use it.
*/
declare const stepVariantResultsSchema: z23.ZodObject<{
	campaignId: z23.core.$ZodBranded<z23.ZodString, "cpg", "out">;
	stepKey: z23.ZodString;
	status: z23.ZodEnum<{
		measured: "measured";
		not_enough_data: "not_enough_data";
	}>;
	minimumSample: z23.ZodNumber;
	variants: z23.ZodArray<z23.ZodObject<{
		key: z23.ZodString;
		sent: z23.ZodNumber;
		delivered: z23.ZodNumber;
		replied: z23.ZodNumber;
		positiveReplied: z23.ZodNullable<z23.ZodNumber>;
		bounced: z23.ZodNumber;
		unsubscribed: z23.ZodNumber;
		replyRate: z23.ZodNullable<z23.ZodObject<{
			estimate: z23.ZodNumber;
			lower: z23.ZodNumber;
			upper: z23.ZodNumber;
		}, z23.core.$strict>>;
	}, z23.core.$strict>>;
	promotion: z23.ZodNullable<z23.ZodObject<{
		variantKey: z23.ZodString;
		source: z23.ZodEnum<{
			auto: "auto";
			manual: "manual";
		}>;
		promotedByMembershipId: z23.ZodNullable<z23.core.$ZodBranded<z23.ZodString, "mem", "out">>;
		promotedAt: z23.ZodISODateTime;
	}, z23.core.$strict>>;
	computedAt: z23.ZodISODateTime;
}, z23.core.$strict>;
/** The results of the Variants of one email Step. */
type StepVariantResults = z23.infer<typeof stepVariantResultsSchema>;
/** The path parameters of a request about the Variants of one Step. */
declare const stepVariantsParamsSchema: z23.ZodObject<{
	campaignId: z23.core.$ZodBranded<z23.ZodString, "cpg", "out">;
	stepKey: z23.ZodString;
}, z23.core.$strict>;
/** The path parameters of a request about one Variant. */
declare const variantParamsSchema: z23.ZodObject<{
	campaignId: z23.core.$ZodBranded<z23.ZodString, "cpg", "out">;
	stepKey: z23.ZodString;
	variantKey: z23.ZodString;
}, z23.core.$strict>;
/** The result of promoting a Variant: the Step's promotion record. */
declare const promoteVariantResponseSchema: z23.ZodObject<{
	variantKey: z23.ZodString;
	source: z23.ZodEnum<{
		auto: "auto";
		manual: "manual";
	}>;
	promotedByMembershipId: z23.ZodNullable<z23.core.$ZodBranded<z23.ZodString, "mem", "out">>;
	promotedAt: z23.ZodISODateTime;
}, z23.core.$strict>;
import { z as z24 } from "zod";
/** The text a visitor or the Inbound Agent says in a Chat: bounded, no control character, untrusted. */
declare const chatTextSchema: z24.ZodPipe<z24.ZodString, z24.ZodString>;
/** The secret token of a visitor's Chat session: 32 to 64 URL-safe characters. */
declare const chatSessionTokenSchema: z24.ZodString;
/** The states of a Chat: `open`, `handed_off` to a Rep, or `closed`. */
declare const CHAT_STATES: readonly ["open", "handed_off", "closed"];
/** The state of a Chat. */
declare const chatStateSchema: z24.ZodEnum<{
	closed: "closed";
	handed_off: "handed_off";
	open: "open";
}>;
/** The path parameters of every public route that begins a Chat: the publishable key. */
declare const publicChatKeyParamsSchema: z24.ZodObject<{
	key: z24.ZodString;
}, z24.core.$strict>;
/** The path parameters of every public route inside a Chat: the secret session token. */
declare const publicChatSessionParamsSchema: z24.ZodObject<{
	sessionToken: z24.ZodString;
}, z24.core.$strict>;
/** The headers of a public Chat request that changes nothing: the `Origin`. */
declare const publicChatOriginHeadersSchema: z24.ZodObject<{
	origin: z24.ZodString;
}, z24.core.$strip>;
/** The headers of a public Chat request that changes something: the `Origin` and a required `Idempotency-Key`. */
declare const publicChatHeadersSchema: z24.ZodObject<{
	origin: z24.ZodString;
	"idempotency-key": z24.ZodString;
}, z24.core.$strip>;
/**
* The body of a public request to start a Chat: the page address the widget is on. `website` is the
* honeypot, a field the widget hides from people; a non-empty value marks a bot, still parses, and
* is answered like a real request with nothing stored. A Chat needs no Contact Consent (the visitor
* started it); only a callback does (ADR 0003).
*/
declare const publicStartChatRequestSchema: z24.ZodObject<{
	sourceUrl: z24.ZodString;
	website: z24.ZodDefault<z24.ZodString>;
}, z24.core.$strict>;
/** What a visitor sees of one message: who said it and what, with no source, tool or id. */
declare const publicChatMessageSchema: z24.ZodObject<{
	index: z24.ZodNumber;
	role: z24.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
	}>;
	text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	at: z24.ZodISODateTime;
}, z24.core.$strict>;
/** What a visitor sees of one message. */
type PublicChatMessage = z24.infer<typeof publicChatMessageSchema>;
/**
* The answer to starting a Chat: the secret session token, when it expires and the opening
* message, which states the visitor is talking to an AI. No Chat, Prospect or Rep id.
*/
declare const publicStartChatResponseSchema: z24.ZodObject<{
	sessionToken: z24.ZodString;
	expiresAt: z24.ZodISODateTime;
	messages: z24.ZodArray<z24.ZodObject<{
		index: z24.ZodNumber;
		role: z24.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
		at: z24.ZodISODateTime;
	}, z24.core.$strict>>;
}, z24.core.$strict>;
/** The body of a public message from the visitor. */
declare const publicSendChatMessageRequestSchema: z24.ZodObject<{
	text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
}, z24.core.$strict>;
/**
* The Inbound Agent's reply as a visitor sees it. `deferred` is true when it said someone will
* follow up rather than answer; `handoffOffered` is true when it offered a Rep. No Playbook
* source, tool call, Rep or internal id.
*/
declare const publicChatReplySchema: z24.ZodObject<{
	text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	deferred: z24.ZodBoolean;
	handoffOffered: z24.ZodBoolean;
	at: z24.ZodISODateTime;
}, z24.core.$strict>;
/** The reply a visitor gets. */
type PublicChatReply = z24.infer<typeof publicChatReplySchema>;
/** The answer to a visitor's message. */
declare const publicChatMessageReplySchema: z24.ZodObject<{
	reply: z24.ZodObject<{
		text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
		deferred: z24.ZodBoolean;
		handoffOffered: z24.ZodBoolean;
		at: z24.ZodISODateTime;
	}, z24.core.$strict>;
}, z24.core.$strict>;
/** The query parameters of a public request to list a Chat's messages: oldest first, cursor-paginated. */
declare const publicListChatMessagesQuerySchema: z24.ZodObject<{
	cursor: z24.ZodOptional<z24.ZodString>;
	limit: z24.ZodDefault<z24.ZodPipe<z24.ZodPipe<z24.ZodUnion<readonly [z24.ZodNumber, z24.ZodString]>, z24.ZodTransform<number, string | number>>, z24.ZodNumber>>;
}, z24.core.$strict>;
/** One page of the messages a visitor sees. */
declare const publicChatMessagePageSchema: z24.ZodObject<{
	items: z24.ZodArray<z24.ZodObject<{
		index: z24.ZodNumber;
		role: z24.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
		at: z24.ZodISODateTime;
	}, z24.core.$strict>>;
	nextCursor: z24.ZodNullable<z24.ZodString>;
}, z24.core.$strip>;
/**
* The body of a public request to ask for a callback from inside a Chat: the visitor's name and
* number and the Consent Wording id and version shown, the choice and the page address. The wording
* version and page address are required, as for the form Inquiry; with `callbackConsent` false the
* details are kept and no call is placed.
*/
declare const publicChatConsentRequestSchema: z24.ZodObject<{
	name: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	phone: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	consentWordingId: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
	consentWordingVersion: z24.ZodNumber;
	callbackConsent: z24.ZodBoolean;
	sourceUrl: z24.ZodString;
}, z24.core.$strict>;
/** The body of a public callback request from a Chat. */
type PublicChatConsentRequest = z24.infer<typeof publicChatConsentRequestSchema>;
/**
* The receipt of a callback request from a Chat: that it arrived, and when. It does not say
* whether a call is coming, so it cannot reveal a suppressed number. No Inquiry, Prospect or Rep id.
*/
declare const publicChatConsentReceiptSchema: z24.ZodObject<{
	received: z24.ZodLiteral<true>;
	receivedAt: z24.ZodISODateTime;
}, z24.core.$strict>;
/** The receipt of a callback request from a Chat. */
type PublicChatConsentReceipt = z24.infer<typeof publicChatConsentReceiptSchema>;
/** The body of a public request to talk to a Rep: nothing; the Rep is chosen by routing. */
declare const publicChatHandoffRequestSchema: z24.ZodObject<{}, z24.core.$strict>;
/** The answer to asking for a Rep: that a Rep was asked to join. No Rep id or name. */
declare const publicChatHandoffReplySchema: z24.ZodObject<{
	requested: z24.ZodLiteral<true>;
	at: z24.ZodISODateTime;
}, z24.core.$strict>;
/** The path parameters of a request about one Chat. */
declare const chatParamsSchema: z24.ZodObject<{
	chatId: z24.core.$ZodBranded<z24.ZodString, "cht", "out">;
}, z24.core.$strict>;
/**
* A Chat as staff see it. `prospectId` and `inquiryId` are null until the visitor gave their
* details or asked for a callback.
*/
declare const chatSchema: z24.ZodObject<{
	id: z24.core.$ZodBranded<z24.ZodString, "cht", "out">;
	prospectId: z24.ZodNullable<z24.core.$ZodBranded<z24.ZodString, "prs", "out">>;
	inquiryId: z24.ZodNullable<z24.core.$ZodBranded<z24.ZodString, "inq", "out">>;
	state: z24.ZodEnum<{
		closed: "closed";
		handed_off: "handed_off";
		open: "open";
	}>;
	sourceUrl: z24.ZodString;
	startedAt: z24.ZodISODateTime;
	lastMessageAt: z24.ZodISODateTime;
	closedAt: z24.ZodNullable<z24.ZodISODateTime>;
}, z24.core.$strict>;
/** A Chat. */
type Chat = z24.infer<typeof chatSchema>;
/** One message of a Chat as staff see it, with the Playbook passages the Agent's answer used. */
declare const chatMessageSchema: z24.ZodObject<{
	index: z24.ZodNumber;
	role: z24.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
	}>;
	text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	sources: z24.ZodArray<z24.ZodObject<{
		documentId: z24.core.$ZodBranded<z24.ZodString, "doc", "out">;
		page: z24.ZodNullable<z24.ZodNumber>;
		passage: z24.ZodString;
	}, z24.core.$strict>>;
	deferred: z24.ZodBoolean;
	at: z24.ZodISODateTime;
}, z24.core.$strict>;
/** One message of a Chat. */
type ChatMessage = z24.infer<typeof chatMessageSchema>;
/** The query parameters of a request to list Chats: latest first, cursor-paginated, optionally by state. */
declare const listChatsQuerySchema: z24.ZodObject<{
	cursor: z24.ZodOptional<z24.ZodString>;
	limit: z24.ZodDefault<z24.ZodPipe<z24.ZodPipe<z24.ZodUnion<readonly [z24.ZodNumber, z24.ZodString]>, z24.ZodTransform<number, string | number>>, z24.ZodNumber>>;
	state: z24.ZodOptional<z24.ZodEnum<{
		closed: "closed";
		handed_off: "handed_off";
		open: "open";
	}>>;
}, z24.core.$strict>;
/** One page of Chats. */
declare const chatPageSchema: z24.ZodObject<{
	items: z24.ZodArray<z24.ZodObject<{
		id: z24.core.$ZodBranded<z24.ZodString, "cht", "out">;
		prospectId: z24.ZodNullable<z24.core.$ZodBranded<z24.ZodString, "prs", "out">>;
		inquiryId: z24.ZodNullable<z24.core.$ZodBranded<z24.ZodString, "inq", "out">>;
		state: z24.ZodEnum<{
			closed: "closed";
			handed_off: "handed_off";
			open: "open";
		}>;
		sourceUrl: z24.ZodString;
		startedAt: z24.ZodISODateTime;
		lastMessageAt: z24.ZodISODateTime;
		closedAt: z24.ZodNullable<z24.ZodISODateTime>;
	}, z24.core.$strict>>;
	nextCursor: z24.ZodNullable<z24.ZodString>;
}, z24.core.$strip>;
/** The query parameters of a request to list a Chat's messages: oldest first, cursor-paginated. */
declare const listChatMessagesQuerySchema: z24.ZodObject<{
	cursor: z24.ZodOptional<z24.ZodString>;
	limit: z24.ZodDefault<z24.ZodPipe<z24.ZodPipe<z24.ZodUnion<readonly [z24.ZodNumber, z24.ZodString]>, z24.ZodTransform<number, string | number>>, z24.ZodNumber>>;
}, z24.core.$strict>;
/** One page of a Chat's messages. */
declare const chatMessagePageSchema: z24.ZodObject<{
	items: z24.ZodArray<z24.ZodObject<{
		index: z24.ZodNumber;
		role: z24.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
		sources: z24.ZodArray<z24.ZodObject<{
			documentId: z24.core.$ZodBranded<z24.ZodString, "doc", "out">;
			page: z24.ZodNullable<z24.ZodNumber>;
			passage: z24.ZodString;
		}, z24.core.$strict>>;
		deferred: z24.ZodBoolean;
		at: z24.ZodISODateTime;
	}, z24.core.$strict>>;
	nextCursor: z24.ZodNullable<z24.ZodString>;
}, z24.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh457 } from "..";
/**
* The errors the Chat routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A Chat of another Organization, or one the caller may not see, is
* `chat.not_found` (404, never 403). The public routes answer an unknown, expired or rotated
* secret exactly as one that never existed.
*
* - `chat.origin_not_allowed` (403): the `Origin` of a public request is not one the Organization
*   allowed. Nothing is stored.
* - `chat.key_invalid` (404): the publishable key is unknown, rotated away or its embed is not live.
* - `chat.session_not_found` (404): the session token is unknown or expired.
* - `chat.session_closed` (409): the Chat has ended (closed, or handed to a Rep and finished); start another.
* - `chat.consent_wording_missing` (422): the wording id and version sent are not the Consent
*   Wording the Chat displays. No consent is recorded.
* - `chat.not_found` (404): the Chat is unknown or not the caller's to see.
*/
declare const CHAT_ERRORS: {
	readonly "chat.consent_wording_missing": ErrorDefinition_8gwh457<"chat.consent_wording_missing">;
	readonly "chat.key_invalid": ErrorDefinition_8gwh457<"chat.key_invalid">;
	readonly "chat.not_found": ErrorDefinition_8gwh457<"chat.not_found">;
	readonly "chat.origin_not_allowed": ErrorDefinition_8gwh457<"chat.origin_not_allowed">;
	readonly "chat.session_closed": ErrorDefinition_8gwh457<"chat.session_closed">;
	readonly "chat.session_not_found": ErrorDefinition_8gwh457<"chat.session_not_found">;
};
/** A Chat error code. */
type ChatErrorCode = keyof typeof CHAT_ERRORS;
/** Every role: each reads the Chats they may see. */
declare const CHAT_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The Chat routes, by name. */
type ChatRouteName = "publicStartChat" | "publicSendChatMessage" | "publicListChatMessages" | "publicChatConsent" | "publicRequestChatHandoff" | "listChats" | "getChat" | "listChatMessages";
/** One Chat route. */
type ChatRoute = InboundRoute<ChatErrorCode | Extract<AgentErrorCode, "handoff.no_rep_available">>;
/**
* The Chat routes (spec M14). The public routes take no token: the publishable key starts a Chat
* and the session token it returns carries it on, each with the browser's `Origin`. They reveal no
* Rep or internal id and never a Playbook source.
*/
declare const CHAT_ROUTES: Readonly<Record<ChatRouteName, ChatRoute>>;
import { z as z25 } from "zod";
/**
* The denial codes of a Contact Check (ADR 0003, ADR 0021). A denial is a typed result of a
* successful call, never an HTTP error: the caller branches on `code`. `consent.unavailable` is
* not answered by core: the kit's client synthesises it when core times out or answers 5xx, so a
* failed check is a denial and never an allowance.
*/
declare const CONTACT_DENIAL_CODES: readonly ["consent.missing", "consent.withdrawn", "consent.suppressed", "consent.unavailable"];
/** A code that denies a contact. */
declare const contactDenialCodeSchema: z25.ZodEnum<{
	"consent.missing": "consent.missing";
	"consent.suppressed": "consent.suppressed";
	"consent.unavailable": "consent.unavailable";
	"consent.withdrawn": "consent.withdrawn";
}>;
/** A code that denies a contact. */
type ContactDenialCode = z25.infer<typeof contactDenialCodeSchema>;
/** Why a contact was allowed: a granted consent, a Rep acting on a Prospect, an answer to the Prospect's own message, or an email to an address that is not suppressed. The basis is informative and the denial rules do not depend on it; a LinkedIn contact is allowed on `rep_initiated` or `reply`. */
declare const CONTACT_ALLOW_BASES: readonly ["consent_granted", "rep_initiated", "reply", "email_no_suppression"];
/**
* Internal: the body of a Contact Check. The calling service has no user token, so it names the
* Organization (ADR 0013) and itself as `caller`; the purpose is set by that service from what it
* is about to do, and there is no field that waives the check. The target is exactly one of a
* Prospect or an address (an email, a phone or a LinkedIn address), which core normalises.
*/
declare const contactCheckRequestSchema: z25.ZodObject<{
	email: z25.ZodOptional<z25.ZodPipe<z25.ZodPipe<z25.ZodString, z25.ZodTransform<string, string>>, z25.ZodString>>;
	phone: z25.ZodOptional<z25.ZodPipe<z25.ZodString, z25.ZodString>>;
	linkedinUrl: z25.ZodOptional<z25.ZodPipe<z25.ZodString, z25.ZodString>>;
	organizationId: z25.core.$ZodBranded<z25.ZodString, "org", "out">;
	prospectId: z25.ZodOptional<z25.core.$ZodBranded<z25.ZodString, "prs", "out">>;
	channel: z25.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	purpose: z25.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
	caller: z25.ZodString;
}, z25.core.$strict>;
/** The body of a Contact Check. */
type ContactCheckRequest = z25.infer<typeof contactCheckRequestSchema>;
/**
* The answer to a Contact Check: an allowance with its `basis`, or a denial with a `consent.*`
* `code`. Every answered check is logged under `checkId`; a denial for a Prospect that does not
* exist is `consent.missing`, so the answer never reveals whether a record exists.
*/
declare const contactCheckResultSchema: z25.ZodUnion<readonly [z25.ZodObject<{
	allowed: z25.ZodLiteral<true>;
	checkId: z25.core.$ZodBranded<z25.ZodString, "chk", "out">;
	basis: z25.ZodEnum<{
		consent_granted: "consent_granted";
		email_no_suppression: "email_no_suppression";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
}, z25.core.$strict>, z25.ZodObject<{
	allowed: z25.ZodLiteral<false>;
	checkId: z25.ZodNullable<z25.core.$ZodBranded<z25.ZodString, "chk", "out">>;
	code: z25.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>;
	suppressionReason: z25.ZodNullable<z25.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z25.core.$strict>]>;
/** The answer to a Contact Check. */
type ContactCheckResult = z25.infer<typeof contactCheckResultSchema>;
/** One logged Contact Check, for the Organization's audit. The address is never stored with it. */
declare const contactCheckLogEntrySchema: z25.ZodObject<{
	id: z25.core.$ZodBranded<z25.ZodString, "chk", "out">;
	prospectId: z25.ZodNullable<z25.core.$ZodBranded<z25.ZodString, "prs", "out">>;
	channel: z25.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	purpose: z25.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
	caller: z25.ZodString;
	allowed: z25.ZodBoolean;
	code: z25.ZodNullable<z25.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>>;
	basis: z25.ZodNullable<z25.ZodEnum<{
		consent_granted: "consent_granted";
		email_no_suppression: "email_no_suppression";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>>;
	checkedAt: z25.ZodISODateTime;
}, z25.core.$strip>;
/** One logged Contact Check. */
type ContactCheckLogEntry = z25.infer<typeof contactCheckLogEntrySchema>;
/** The query parameters of a request to list logged Contact Checks, newest first, with optional filters. */
declare const listContactChecksQuerySchema: z25.ZodObject<{
	cursor: z25.ZodOptional<z25.ZodString>;
	limit: z25.ZodDefault<z25.ZodPipe<z25.ZodPipe<z25.ZodUnion<readonly [z25.ZodNumber, z25.ZodString]>, z25.ZodTransform<number, string | number>>, z25.ZodNumber>>;
	channel: z25.ZodOptional<z25.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	purpose: z25.ZodOptional<z25.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>>;
	allowed: z25.ZodOptional<z25.ZodEnum<{
		false: "false";
		true: "true";
	}>>;
	prospectId: z25.ZodOptional<z25.core.$ZodBranded<z25.ZodString, "prs", "out">>;
	code: z25.ZodOptional<z25.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>>;
}, z25.core.$strict>;
/** The query parameters of a request to list logged Contact Checks. */
type ListContactChecksQuery = z25.infer<typeof listContactChecksQuerySchema>;
/** One page of logged Contact Checks. */
declare const contactCheckLogPageSchema: z25.ZodObject<{
	items: z25.ZodArray<z25.ZodObject<{
		id: z25.core.$ZodBranded<z25.ZodString, "chk", "out">;
		prospectId: z25.ZodNullable<z25.core.$ZodBranded<z25.ZodString, "prs", "out">>;
		channel: z25.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		purpose: z25.ZodEnum<{
			agent_initiated: "agent_initiated";
			rep_initiated: "rep_initiated";
			reply: "reply";
		}>;
		caller: z25.ZodString;
		allowed: z25.ZodBoolean;
		code: z25.ZodNullable<z25.ZodEnum<{
			"consent.missing": "consent.missing";
			"consent.suppressed": "consent.suppressed";
			"consent.unavailable": "consent.unavailable";
			"consent.withdrawn": "consent.withdrawn";
		}>>;
		basis: z25.ZodNullable<z25.ZodEnum<{
			consent_granted: "consent_granted";
			email_no_suppression: "email_no_suppression";
			rep_initiated: "rep_initiated";
			reply: "reply";
		}>>;
		checkedAt: z25.ZodISODateTime;
	}, z25.core.$strip>>;
	nextCursor: z25.ZodNullable<z25.ZodString>;
}, z25.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh458 } from "..";
/**
* The errors the consent routes return, as `area.reason` codes.
*
* - `consent.not_found` (404): a Consent Wording, form, Suppression entry or import that does not
*   exist or belongs to another Organization; `details.resource` is `wording`, `form`, `entry` or
*   `import`. An unknown Prospect is `prospect.not_found`.
* - `consent.wording_locked` (409): the wording is referenced by a consent event or a published
*   form, so it cannot be edited; write a new version.
* - `consent.invalid_token` (400): the token of a public route is tampered, expired or unknown. It
*   never says which, and never echoes an address.
* - `consent.entry_not_removable` (409): only a `manual` Suppression entry can be removed.
* - `consent.missing`, `consent.withdrawn`, `consent.suppressed` and `consent.unavailable` are the
*   denial codes of a Contact Check. They are results (see `CONTACT_DENIAL_CODES`), never the error
*   of a route; they sit in this registry so every service names them the same way. The status
*   shown is for a caller that chooses to surface a denial over HTTP; `consent.unavailable` is
*   synthesised by the kit's client, never answered by core.
*/
declare const CONSENT_ERRORS: {
	readonly "consent.entry_not_removable": ErrorDefinition_8gwh458<"consent.entry_not_removable">;
	readonly "consent.invalid_token": ErrorDefinition_8gwh458<"consent.invalid_token">;
	readonly "consent.missing": ErrorDefinition_8gwh458<"consent.missing">;
	readonly "consent.not_found": ErrorDefinition_8gwh458<"consent.not_found">;
	readonly "consent.suppressed": ErrorDefinition_8gwh458<"consent.suppressed">;
	readonly "consent.unavailable": ErrorDefinition_8gwh458<"consent.unavailable">;
	readonly "consent.withdrawn": ErrorDefinition_8gwh458<"consent.withdrawn">;
	readonly "consent.wording_locked": ErrorDefinition_8gwh458<"consent.wording_locked">;
};
/** A consent error code. */
type ConsentErrorCode = keyof typeof CONSENT_ERRORS;
import { z as z26 } from "zod";
/** `consent.granted` (version 1): a Contact Consent was recorded on a channel. Ids and kinds only: no address, no wording text. */
declare const consentGrantedEvent: {
	type: "consent.granted";
	version: 1;
	schema: z26.ZodObject<{
		id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
		occurredAt: z26.ZodISODateTime;
		organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
		region: z26.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z26.ZodLiteral<"consent.granted">;
		version: z26.ZodLiteral<1>;
		data: z26.ZodObject<{
			consentEventId: z26.core.$ZodBranded<z26.ZodString, "cev", "out">;
			prospectId: z26.core.$ZodBranded<z26.ZodString, "prs", "out">;
			channel: z26.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			source: z26.ZodEnum<{
				crm: "crm";
				hosted_form: "hosted_form";
				import_attestation: "import_attestation";
				manual: "manual";
				verbal_call: "verbal_call";
			}>;
			wordingId: z26.core.$ZodBranded<z26.ZodString, "cwd", "out">;
		}, z26.core.$strict>;
	}, z26.core.$strip>;
	parse: (input: unknown) => {
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "consent.granted";
		version: 1;
		data: {
			consentEventId: string & z26.$brand<"cev">;
			prospectId: string & z26.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
			wordingId: string & z26.$brand<"cwd">;
		};
	};
	safeParse: (input: unknown) => z26.ZodSafeParseResult<{
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "consent.granted";
		version: 1;
		data: {
			consentEventId: string & z26.$brand<"cev">;
			prospectId: string & z26.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
			wordingId: string & z26.$brand<"cwd">;
		};
	}>;
};
/** `consent.withdrawn` (version 1): a Contact Consent was withdrawn on a channel; `stopAll` is true for each event of a STOP-all. One event per channel. */
declare const consentWithdrawnEvent: {
	type: "consent.withdrawn";
	version: 1;
	schema: z26.ZodObject<{
		id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
		occurredAt: z26.ZodISODateTime;
		organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
		region: z26.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z26.ZodLiteral<"consent.withdrawn">;
		version: z26.ZodLiteral<1>;
		data: z26.ZodObject<{
			consentEventId: z26.core.$ZodBranded<z26.ZodString, "cev", "out">;
			prospectId: z26.core.$ZodBranded<z26.ZodString, "prs", "out">;
			channel: z26.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			source: z26.ZodEnum<{
				crm: "crm";
				manual: "manual";
				stop_reply: "stop_reply";
				unsubscribe: "unsubscribe";
			}>;
			stopAll: z26.ZodBoolean;
		}, z26.core.$strict>;
	}, z26.core.$strip>;
	parse: (input: unknown) => {
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "consent.withdrawn";
		version: 1;
		data: {
			consentEventId: string & z26.$brand<"cev">;
			prospectId: string & z26.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "manual" | "stop_reply" | "unsubscribe";
			stopAll: boolean;
		};
	};
	safeParse: (input: unknown) => z26.ZodSafeParseResult<{
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "consent.withdrawn";
		version: 1;
		data: {
			consentEventId: string & z26.$brand<"cev">;
			prospectId: string & z26.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "manual" | "stop_reply" | "unsubscribe";
			stopAll: boolean;
		};
	}>;
};
/** `suppression.added` (version 1): an address was added to the Suppression list. `prospectId` is null when no Prospect has the address. */
declare const suppressionAddedEvent: {
	type: "suppression.added";
	version: 1;
	schema: z26.ZodObject<{
		id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
		occurredAt: z26.ZodISODateTime;
		organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
		region: z26.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z26.ZodLiteral<"suppression.added">;
		version: z26.ZodLiteral<1>;
		data: z26.ZodObject<{
			suppressionEntryId: z26.core.$ZodBranded<z26.ZodString, "sup", "out">;
			addressKind: z26.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
			}>;
			reason: z26.ZodEnum<{
				bounce: "bounce";
				complaint: "complaint";
				crm: "crm";
				erased: "erased";
				manual: "manual";
				stop: "stop";
				unsubscribe: "unsubscribe";
			}>;
			prospectId: z26.ZodNullable<z26.core.$ZodBranded<z26.ZodString, "prs", "out">>;
		}, z26.core.$strict>;
	}, z26.core.$strip>;
	parse: (input: unknown) => {
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.added";
		version: 1;
		data: {
			suppressionEntryId: string & z26.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
			reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
			prospectId: (string & z26.$brand<"prs">) | null;
		};
	};
	safeParse: (input: unknown) => z26.ZodSafeParseResult<{
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.added";
		version: 1;
		data: {
			suppressionEntryId: string & z26.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
			reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
			prospectId: (string & z26.$brand<"prs">) | null;
		};
	}>;
};
/** `suppression.removed` (version 1): a manual entry was removed from the Suppression list. */
declare const suppressionRemovedEvent: {
	type: "suppression.removed";
	version: 1;
	schema: z26.ZodObject<{
		id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
		occurredAt: z26.ZodISODateTime;
		organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
		region: z26.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z26.ZodLiteral<"suppression.removed">;
		version: z26.ZodLiteral<1>;
		data: z26.ZodObject<{
			suppressionEntryId: z26.core.$ZodBranded<z26.ZodString, "sup", "out">;
			addressKind: z26.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
			}>;
		}, z26.core.$strict>;
	}, z26.core.$strip>;
	parse: (input: unknown) => {
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.removed";
		version: 1;
		data: {
			suppressionEntryId: string & z26.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
		};
	};
	safeParse: (input: unknown) => z26.ZodSafeParseResult<{
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.removed";
		version: 1;
		data: {
			suppressionEntryId: string & z26.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
		};
	}>;
};
/** Every consent event, by type. */
declare const CONSENT_EVENTS: {
	readonly "consent.granted": {
		type: "consent.granted";
		version: 1;
		schema: z26.ZodObject<{
			id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
			occurredAt: z26.ZodISODateTime;
			organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
			region: z26.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z26.ZodLiteral<"consent.granted">;
			version: z26.ZodLiteral<1>;
			data: z26.ZodObject<{
				consentEventId: z26.core.$ZodBranded<z26.ZodString, "cev", "out">;
				prospectId: z26.core.$ZodBranded<z26.ZodString, "prs", "out">;
				channel: z26.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				source: z26.ZodEnum<{
					crm: "crm";
					hosted_form: "hosted_form";
					import_attestation: "import_attestation";
					manual: "manual";
					verbal_call: "verbal_call";
				}>;
				wordingId: z26.core.$ZodBranded<z26.ZodString, "cwd", "out">;
			}, z26.core.$strict>;
		}, z26.core.$strip>;
		parse: (input: unknown) => {
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "consent.granted";
			version: 1;
			data: {
				consentEventId: string & z26.$brand<"cev">;
				prospectId: string & z26.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
				wordingId: string & z26.$brand<"cwd">;
			};
		};
		safeParse: (input: unknown) => z26.ZodSafeParseResult<{
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "consent.granted";
			version: 1;
			data: {
				consentEventId: string & z26.$brand<"cev">;
				prospectId: string & z26.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
				wordingId: string & z26.$brand<"cwd">;
			};
		}>;
	};
	readonly "consent.withdrawn": {
		type: "consent.withdrawn";
		version: 1;
		schema: z26.ZodObject<{
			id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
			occurredAt: z26.ZodISODateTime;
			organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
			region: z26.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z26.ZodLiteral<"consent.withdrawn">;
			version: z26.ZodLiteral<1>;
			data: z26.ZodObject<{
				consentEventId: z26.core.$ZodBranded<z26.ZodString, "cev", "out">;
				prospectId: z26.core.$ZodBranded<z26.ZodString, "prs", "out">;
				channel: z26.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				source: z26.ZodEnum<{
					crm: "crm";
					manual: "manual";
					stop_reply: "stop_reply";
					unsubscribe: "unsubscribe";
				}>;
				stopAll: z26.ZodBoolean;
			}, z26.core.$strict>;
		}, z26.core.$strip>;
		parse: (input: unknown) => {
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "consent.withdrawn";
			version: 1;
			data: {
				consentEventId: string & z26.$brand<"cev">;
				prospectId: string & z26.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "manual" | "stop_reply" | "unsubscribe";
				stopAll: boolean;
			};
		};
		safeParse: (input: unknown) => z26.ZodSafeParseResult<{
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "consent.withdrawn";
			version: 1;
			data: {
				consentEventId: string & z26.$brand<"cev">;
				prospectId: string & z26.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "manual" | "stop_reply" | "unsubscribe";
				stopAll: boolean;
			};
		}>;
	};
	readonly "suppression.added": {
		type: "suppression.added";
		version: 1;
		schema: z26.ZodObject<{
			id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
			occurredAt: z26.ZodISODateTime;
			organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
			region: z26.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z26.ZodLiteral<"suppression.added">;
			version: z26.ZodLiteral<1>;
			data: z26.ZodObject<{
				suppressionEntryId: z26.core.$ZodBranded<z26.ZodString, "sup", "out">;
				addressKind: z26.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
				}>;
				reason: z26.ZodEnum<{
					bounce: "bounce";
					complaint: "complaint";
					crm: "crm";
					erased: "erased";
					manual: "manual";
					stop: "stop";
					unsubscribe: "unsubscribe";
				}>;
				prospectId: z26.ZodNullable<z26.core.$ZodBranded<z26.ZodString, "prs", "out">>;
			}, z26.core.$strict>;
		}, z26.core.$strip>;
		parse: (input: unknown) => {
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.added";
			version: 1;
			data: {
				suppressionEntryId: string & z26.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
				reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
				prospectId: (string & z26.$brand<"prs">) | null;
			};
		};
		safeParse: (input: unknown) => z26.ZodSafeParseResult<{
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.added";
			version: 1;
			data: {
				suppressionEntryId: string & z26.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
				reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
				prospectId: (string & z26.$brand<"prs">) | null;
			};
		}>;
	};
	readonly "suppression.removed": {
		type: "suppression.removed";
		version: 1;
		schema: z26.ZodObject<{
			id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
			occurredAt: z26.ZodISODateTime;
			organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
			region: z26.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z26.ZodLiteral<"suppression.removed">;
			version: z26.ZodLiteral<1>;
			data: z26.ZodObject<{
				suppressionEntryId: z26.core.$ZodBranded<z26.ZodString, "sup", "out">;
				addressKind: z26.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
				}>;
			}, z26.core.$strict>;
		}, z26.core.$strip>;
		parse: (input: unknown) => {
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.removed";
			version: 1;
			data: {
				suppressionEntryId: string & z26.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
			};
		};
		safeParse: (input: unknown) => z26.ZodSafeParseResult<{
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.removed";
			version: 1;
			data: {
				suppressionEntryId: string & z26.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
			};
		}>;
	};
};
/** The type of a consent event. */
type ConsentEventType = keyof typeof CONSENT_EVENTS;
import { z as z27 } from "zod";
/**
* One ledger event with everything that proves it: the wording shown (id, version and exact text)
* and, for a hosted form, the IP address and user agent core read from the request. Only Owner and
* Admin read it. `submission` is set exactly for a `hosted_form` event.
*/
declare const evidenceEventSchema: z27.ZodIntersection<z27.ZodObject<{
	id: z27.core.$ZodBranded<z27.ZodString, "cev", "out">;
	prospectId: z27.core.$ZodBranded<z27.ZodString, "prs", "out">;
	channel: z27.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	kind: z27.ZodEnum<{
		granted: "granted";
		withdrawn: "withdrawn";
	}>;
	source: z27.ZodUnion<readonly [z27.ZodEnum<{
		crm: "crm";
		hosted_form: "hosted_form";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>, z27.ZodEnum<{
		crm: "crm";
		manual: "manual";
		stop_reply: "stop_reply";
		unsubscribe: "unsubscribe";
	}>]>;
	wordingId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "cwd", "out">>;
	evidenceRef: z27.ZodNullable<z27.ZodPipe<z27.ZodString, z27.ZodString>>;
	callId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "call", "out">>;
	formId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "cfm", "out">>;
	stopAll: z27.ZodBoolean;
	recordedByUserId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "usr", "out">>;
	occurredAt: z27.ZodISODateTime;
	recordedAt: z27.ZodISODateTime;
}, z27.core.$strip>, z27.ZodObject<{
	wording: z27.ZodNullable<z27.ZodObject<{
		id: z27.core.$ZodBranded<z27.ZodString, "cwd", "out">;
		version: z27.ZodNumber;
		text: z27.ZodString;
	}, z27.core.$strip>>;
	submission: z27.ZodNullable<z27.ZodObject<{
		ipAddress: z27.ZodString;
		userAgent: z27.ZodString;
	}, z27.core.$strip>>;
}, z27.core.$strip>>;
/** One ledger event with its evidence. */
type EvidenceEvent = z27.infer<typeof evidenceEventSchema>;
/** The query parameters of a request for a Prospect's evidence, newest first, optionally one channel. */
declare const listEvidenceQuerySchema: z27.ZodObject<{
	cursor: z27.ZodOptional<z27.ZodString>;
	limit: z27.ZodDefault<z27.ZodPipe<z27.ZodPipe<z27.ZodUnion<readonly [z27.ZodNumber, z27.ZodString]>, z27.ZodTransform<number, string | number>>, z27.ZodNumber>>;
	channel: z27.ZodOptional<z27.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z27.core.$strict>;
/** One page of evidence events. */
declare const evidencePageSchema: z27.ZodObject<{
	items: z27.ZodArray<z27.ZodIntersection<z27.ZodObject<{
		id: z27.core.$ZodBranded<z27.ZodString, "cev", "out">;
		prospectId: z27.core.$ZodBranded<z27.ZodString, "prs", "out">;
		channel: z27.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z27.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z27.ZodUnion<readonly [z27.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z27.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "cwd", "out">>;
		evidenceRef: z27.ZodNullable<z27.ZodPipe<z27.ZodString, z27.ZodString>>;
		callId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "call", "out">>;
		formId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "cfm", "out">>;
		stopAll: z27.ZodBoolean;
		recordedByUserId: z27.ZodNullable<z27.core.$ZodBranded<z27.ZodString, "usr", "out">>;
		occurredAt: z27.ZodISODateTime;
		recordedAt: z27.ZodISODateTime;
	}, z27.core.$strip>, z27.ZodObject<{
		wording: z27.ZodNullable<z27.ZodObject<{
			id: z27.core.$ZodBranded<z27.ZodString, "cwd", "out">;
			version: z27.ZodNumber;
			text: z27.ZodString;
		}, z27.core.$strip>>;
		submission: z27.ZodNullable<z27.ZodObject<{
			ipAddress: z27.ZodString;
			userAgent: z27.ZodString;
		}, z27.core.$strip>>;
	}, z27.core.$strip>>>;
	nextCursor: z27.ZodNullable<z27.ZodString>;
}, z27.core.$strip>;
/** The columns of the CSV evidence export, in order. The file carries the same fields as the JSON and no more. */
declare const EVIDENCE_CSV_COLUMNS: readonly ["event_id", "prospect_id", "channel", "kind", "source", "occurred_at", "recorded_at", "wording_id", "wording_version", "wording_text", "evidence_ref", "ip_address", "user_agent"];
import { z as z28 } from "zod";
/** The current state of one channel's Contact Consent, derived from the ledger and never edited. */
declare const CONSENT_STATES: readonly ["granted", "withdrawn", "none"];
/** The current state of a channel's Contact Consent. */
declare const consentStateSchema: z28.ZodEnum<{
	granted: "granted";
	none: "none";
	withdrawn: "withdrawn";
}>;
/** The current state of a channel's Contact Consent. */
type ConsentState = z28.infer<typeof consentStateSchema>;
/**
* One event of the append-only consent ledger (ADR 0021). A `granted` event carries the Consent
* Wording shown (`wordingId`), the `evidenceRef` and, by source, the Call (`verbal_call`) or the
* hosted form (`hosted_form`); a `withdrawn` event needs neither wording nor evidence and has a
* withdrawal source. `stopAll` is true on each event a STOP-all appended. `occurredAt` is when the
* Prospect agreed or withdrew, `recordedAt` when core stored it; `recordedByUserId` is null when a
* system (a form, a STOP reply, a sync) recorded it. The ledger is never updated or deleted.
*/
declare const consentEventSchema: z28.ZodObject<{
	id: z28.core.$ZodBranded<z28.ZodString, "cev", "out">;
	prospectId: z28.core.$ZodBranded<z28.ZodString, "prs", "out">;
	channel: z28.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	kind: z28.ZodEnum<{
		granted: "granted";
		withdrawn: "withdrawn";
	}>;
	source: z28.ZodUnion<readonly [z28.ZodEnum<{
		crm: "crm";
		hosted_form: "hosted_form";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>, z28.ZodEnum<{
		crm: "crm";
		manual: "manual";
		stop_reply: "stop_reply";
		unsubscribe: "unsubscribe";
	}>]>;
	wordingId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cwd", "out">>;
	evidenceRef: z28.ZodNullable<z28.ZodPipe<z28.ZodString, z28.ZodString>>;
	callId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "call", "out">>;
	formId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cfm", "out">>;
	stopAll: z28.ZodBoolean;
	recordedByUserId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "usr", "out">>;
	occurredAt: z28.ZodISODateTime;
	recordedAt: z28.ZodISODateTime;
}, z28.core.$strip>;
/** One event of the consent ledger. */
type ConsentEvent = z28.infer<typeof consentEventSchema>;
/** The state of one channel for a Prospect: `since` and the last event are null while there is no event. */
declare const channelConsentSchema: z28.ZodObject<{
	channel: z28.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	state: z28.ZodEnum<{
		granted: "granted";
		none: "none";
		withdrawn: "withdrawn";
	}>;
	since: z28.ZodNullable<z28.ZodISODateTime>;
	lastEventId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cev", "out">>;
	wordingId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cwd", "out">>;
}, z28.core.$strip>;
/**
* A Prospect's Contact Consent per channel, derived from the ledger, with whether the Prospect
* is on the Suppression list and why. Every channel appears exactly once. `suppressed` is true
* exactly when `suppressionReason` is set; a suppressed Prospect is refused on every channel.
*/
declare const prospectConsentSchema: z28.ZodObject<{
	prospectId: z28.core.$ZodBranded<z28.ZodString, "prs", "out">;
	channels: z28.ZodArray<z28.ZodObject<{
		channel: z28.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		state: z28.ZodEnum<{
			granted: "granted";
			none: "none";
			withdrawn: "withdrawn";
		}>;
		since: z28.ZodNullable<z28.ZodISODateTime>;
		lastEventId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cev", "out">>;
		wordingId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cwd", "out">>;
	}, z28.core.$strip>>;
	suppressed: z28.ZodBoolean;
	suppressionReason: z28.ZodNullable<z28.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z28.core.$strip>;
/** A Prospect's Contact Consent per channel. */
type ProspectConsent = z28.infer<typeof prospectConsentSchema>;
/**
* The body of a request to record a granted Contact Consent. `source` is one a person may claim
* (never `hosted_form`; core sets that from the form); the wording must be one the Organization
* wrote that covers the channel, and `evidenceRef` points at the artefact. A `verbal_call` grant
* names the Call as `callId`; other sources must not. The actor is the caller, set by core.
* `occurredAt` defaults to now and may not be in the future. Without a source, wording and
* reference core refuses the request: a checkbox is not proof. Accepts an `Idempotency-Key`.
*/
declare const recordConsentRequestSchema: z28.ZodObject<{
	channel: z28.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	source: z28.ZodEnum<{
		crm: "crm";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>;
	wordingId: z28.core.$ZodBranded<z28.ZodString, "cwd", "out">;
	evidenceRef: z28.ZodPipe<z28.ZodString, z28.ZodString>;
	callId: z28.ZodOptional<z28.core.$ZodBranded<z28.ZodString, "call", "out">>;
	occurredAt: z28.ZodOptional<z28.ZodISODateTime>;
}, z28.core.$strict>;
/** The body of a request to record a granted Contact Consent. */
type RecordConsentRequest = z28.infer<typeof recordConsentRequestSchema>;
/**
* The body of a request to record a withdrawal: the named `channels`, or `all: true` for a
* STOP-all that withdraws every channel. Exactly one of the two. A withdrawal on some channels
* leaves the others alone. The source is `manual` and the actor the caller, set by core.
*/
declare const withdrawConsentRequestSchema: z28.ZodObject<{
	channels: z28.ZodOptional<z28.ZodArray<z28.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>>;
	all: z28.ZodOptional<z28.ZodLiteral<true>>;
	occurredAt: z28.ZodOptional<z28.ZodISODateTime>;
}, z28.core.$strict>;
/** The body of a request to record a withdrawal. */
type WithdrawConsentRequest = z28.infer<typeof withdrawConsentRequestSchema>;
/** The path parameters of a request about one Prospect's consent. */
declare const consentProspectParamsSchema: z28.ZodObject<{
	prospectId: z28.core.$ZodBranded<z28.ZodString, "prs", "out">;
}, z28.core.$strict>;
/** The query parameters of a request to list a Prospect's consent events: newest first, optionally one channel. */
declare const listConsentEventsQuerySchema: z28.ZodObject<{
	cursor: z28.ZodOptional<z28.ZodString>;
	limit: z28.ZodDefault<z28.ZodPipe<z28.ZodPipe<z28.ZodUnion<readonly [z28.ZodNumber, z28.ZodString]>, z28.ZodTransform<number, string | number>>, z28.ZodNumber>>;
	channel: z28.ZodOptional<z28.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z28.core.$strict>;
/** The query parameters of a request to list consent events. */
type ListConsentEventsQuery = z28.infer<typeof listConsentEventsQuerySchema>;
/** One page of consent events. */
declare const consentEventPageSchema: z28.ZodObject<{
	items: z28.ZodArray<z28.ZodObject<{
		id: z28.core.$ZodBranded<z28.ZodString, "cev", "out">;
		prospectId: z28.core.$ZodBranded<z28.ZodString, "prs", "out">;
		channel: z28.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z28.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z28.ZodUnion<readonly [z28.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z28.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cwd", "out">>;
		evidenceRef: z28.ZodNullable<z28.ZodPipe<z28.ZodString, z28.ZodString>>;
		callId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "call", "out">>;
		formId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cfm", "out">>;
		stopAll: z28.ZodBoolean;
		recordedByUserId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "usr", "out">>;
		occurredAt: z28.ZodISODateTime;
		recordedAt: z28.ZodISODateTime;
	}, z28.core.$strip>>;
	nextCursor: z28.ZodNullable<z28.ZodString>;
}, z28.core.$strip>;
/** The answer to recording a grant or a withdrawal: the events appended (one per channel) and the Prospect's consent now. */
declare const recordedConsentSchema: z28.ZodObject<{
	events: z28.ZodArray<z28.ZodObject<{
		id: z28.core.$ZodBranded<z28.ZodString, "cev", "out">;
		prospectId: z28.core.$ZodBranded<z28.ZodString, "prs", "out">;
		channel: z28.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z28.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z28.ZodUnion<readonly [z28.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z28.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cwd", "out">>;
		evidenceRef: z28.ZodNullable<z28.ZodPipe<z28.ZodString, z28.ZodString>>;
		callId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "call", "out">>;
		formId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cfm", "out">>;
		stopAll: z28.ZodBoolean;
		recordedByUserId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "usr", "out">>;
		occurredAt: z28.ZodISODateTime;
		recordedAt: z28.ZodISODateTime;
	}, z28.core.$strip>>;
	consent: z28.ZodObject<{
		prospectId: z28.core.$ZodBranded<z28.ZodString, "prs", "out">;
		channels: z28.ZodArray<z28.ZodObject<{
			channel: z28.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			state: z28.ZodEnum<{
				granted: "granted";
				none: "none";
				withdrawn: "withdrawn";
			}>;
			since: z28.ZodNullable<z28.ZodISODateTime>;
			lastEventId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cev", "out">>;
			wordingId: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "cwd", "out">>;
		}, z28.core.$strip>>;
		suppressed: z28.ZodBoolean;
		suppressionReason: z28.ZodNullable<z28.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>>;
	}, z28.core.$strip>;
}, z28.core.$strip>;
/** The answer to recording a grant or a withdrawal. */
type RecordedConsent = z28.infer<typeof recordedConsentSchema>;
import { z as z29 } from "zod";
/** The path parameters of every public route: the signed token from the link. */
declare const consentTokenParamsSchema: z29.ZodObject<{
	token: z29.ZodString;
}, z29.core.$strict>;
/**
* The body of a hosted consent form submission. Each channel the form offers is an explicit,
* unticked-by-default choice (`agreed` has no default), at least one must be agreed, and the
* address a channel needs is required: a phone for phone, sms and whatsapp, an email for email.
* The wording is the one the page showed. The IP address and user agent are read from the request
* by core as evidence, and the Prospect is found or made by core: neither is in the body. Accepts
* an `Idempotency-Key`, so a double click records once.
*/
declare const hostedConsentSubmissionSchema: z29.ZodObject<{
	wordingId: z29.core.$ZodBranded<z29.ZodString, "cwd", "out">;
	firstName: z29.ZodOptional<z29.ZodPipe<z29.ZodString, z29.ZodString>>;
	lastName: z29.ZodOptional<z29.ZodPipe<z29.ZodString, z29.ZodString>>;
	email: z29.ZodOptional<z29.ZodPipe<z29.ZodPipe<z29.ZodString, z29.ZodTransform<string, string>>, z29.ZodString>>;
	phone: z29.ZodOptional<z29.ZodPipe<z29.ZodString, z29.ZodString>>;
	choices: z29.ZodArray<z29.ZodObject<{
		channel: z29.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		agreed: z29.ZodBoolean;
	}, z29.core.$strict>>;
}, z29.core.$strict>;
/** The body of a hosted consent form submission. */
type HostedConsentSubmission = z29.infer<typeof hostedConsentSubmissionSchema>;
/** What the hosted form page shows: the Organization's name, the exact wording and the channels offered. Nothing about any Prospect. */
declare const hostedConsentFormViewSchema: z29.ZodObject<{
	organizationName: z29.ZodPipe<z29.ZodString, z29.ZodString>;
	wordingId: z29.core.$ZodBranded<z29.ZodString, "cwd", "out">;
	wordingVersion: z29.ZodNumber;
	wordingText: z29.ZodPipe<z29.ZodString, z29.ZodString>;
	channels: z29.ZodArray<z29.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z29.core.$strip>;
/** What the hosted form page shows. */
type HostedConsentFormView = z29.infer<typeof hostedConsentFormViewSchema>;
/** The receipt of a hosted submission: the channels recorded and when. It never repeats the address. */
declare const hostedConsentReceiptSchema: z29.ZodObject<{
	channels: z29.ZodArray<z29.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	recordedAt: z29.ZodISODateTime;
}, z29.core.$strip>;
/** The receipt of a hosted submission. */
type HostedConsentReceipt = z29.infer<typeof hostedConsentReceiptSchema>;
/** What the unsubscribe page shows for a link: the Organization's name and the channel, never the address. */
declare const unsubscribePreviewSchema: z29.ZodObject<{
	organizationName: z29.ZodPipe<z29.ZodString, z29.ZodString>;
	channel: z29.ZodLiteral<"email">;
}, z29.core.$strip>;
/** What the unsubscribe page shows. */
type UnsubscribePreview = z29.infer<typeof unsubscribePreviewSchema>;
/** The one-click unsubscribe body of RFC 8058 (`List-Unsubscribe-Post`): exactly this pair. */
declare const oneClickUnsubscribeRequestSchema: z29.ZodObject<{
	"List-Unsubscribe": z29.ZodLiteral<"One-Click">;
}, z29.core.$strict>;
/** The one-click unsubscribe body. */
type OneClickUnsubscribeRequest = z29.infer<typeof oneClickUnsubscribeRequestSchema>;
/** The receipt of an unsubscribe: it happened and when. A replayed link answers the same. It never repeats the address. */
declare const unsubscribeReceiptSchema: z29.ZodObject<{
	unsubscribed: z29.ZodLiteral<true>;
	recordedAt: z29.ZodISODateTime;
}, z29.core.$strip>;
/** The receipt of an unsubscribe. */
type UnsubscribeReceipt = z29.infer<typeof unsubscribeReceiptSchema>;
/** The roles that may read and record consent for the Prospects they can see. */
declare const CONSENT_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that manage wordings, forms, the Suppression list, evidence and the check log. */
declare const CONSENT_ADMIN_ROLES: readonly ["owner", "admin"];
/** The consent routes, by name. */
type ConsentRouteName = "getProspectConsent" | "listProspectConsentEvents" | "recordConsent" | "withdrawConsent" | "getProspectConsentEvidence" | "listConsentWordings" | "getConsentWording" | "createConsentWording" | "updateConsentWording" | "createConsentWordingVersion" | "listConsentForms" | "getConsentForm" | "createConsentForm" | "publishConsentForm" | "closeConsentForm" | "addSuppression" | "listSuppressionEntries" | "lookupSuppression" | "getSuppressionEntry" | "removeSuppression" | "uploadSuppressionImport" | "listSuppressionImports" | "getSuppressionImport" | "listSuppressionImportRows" | "listContactChecks" | "getHostedConsentForm" | "submitHostedConsentForm" | "previewUnsubscribe" | "oneClickUnsubscribe" | "contactCheck" | "recordWithdrawal" | "recordDeliveryFailure";
/** Who calls a route: a signed-in member, anyone holding a signed link, or another service. */
type ConsentRouteAccess = "user" | "public" | "internal";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type ConsentRoute = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** `public` routes take a signed token in the path; `internal` ones the shared secret (ADR 0013). */
	readonly access: ConsentRouteAccess;
	/** The roles allowed; empty for a public or internal route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when the route accepts an `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** The domain codes the route may return, beyond the common ones. A Contact Check denial is never one. */
	readonly errors: readonly (ConsentErrorCode | ProspectErrorCode | CommonErrorCode)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The consent routes (spec M3). Every user route may also return the common `auth.*`, `rate.limited`
* and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record
* of another Organization is always not found. A Contact Check denial is a result in a 200 body,
* never an error of a route. No route or body can switch off Contact Consent or the AI and
* recording disclosure (ADR 0003).
*/
declare const CONSENT_ROUTES: Readonly<Record<ConsentRouteName, ConsentRoute>>;
import { z as z30 } from "zod";
/** The longest reason or note on a Suppression change, in characters. */
declare const MAX_SUPPRESSION_NOTE_LENGTH = 500;
/**
* A Suppression entry as core returns it (ADR 0021): an Organization's record that an address
* must not be contacted on any channel. The address itself and its salted hash are never
* returned: `maskedAddress` is for display and is `null` for an `erased` entry, which keeps no
* data about the person. `removable` is true exactly for a `manual` entry; the others are lifted
* only by a new granted consent with new evidence. `channel` is where the request arrived (a STOP
* on SMS), `sourceRef` the message, bounce or sync it came from. A removed entry says when, by
* whom and why.
*/
declare const suppressionEntrySchema: z30.ZodObject<{
	id: z30.core.$ZodBranded<z30.ZodString, "sup", "out">;
	addressKind: z30.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>;
	maskedAddress: z30.ZodNullable<z30.ZodString>;
	reason: z30.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>;
	channel: z30.ZodNullable<z30.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	sourceRef: z30.ZodNullable<z30.ZodString>;
	addedByUserId: z30.ZodNullable<z30.core.$ZodBranded<z30.ZodString, "usr", "out">>;
	removable: z30.ZodBoolean;
	createdAt: z30.ZodISODateTime;
	removedAt: z30.ZodNullable<z30.ZodISODateTime>;
	removedByUserId: z30.ZodNullable<z30.core.$ZodBranded<z30.ZodString, "usr", "out">>;
	removalReason: z30.ZodNullable<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
}, z30.core.$strip>;
/** A Suppression entry. */
type SuppressionEntry = z30.infer<typeof suppressionEntrySchema>;
/** The path parameters of a request about one Suppression entry. */
declare const suppressionEntryParamsSchema: z30.ZodObject<{
	entryId: z30.core.$ZodBranded<z30.ZodString, "sup", "out">;
}, z30.core.$strict>;
/**
* The body of a request to add an address by hand: exactly one of `email`, `phone` or
* `linkedinUrl`, normalised by core (ADR 0011). The reason is `manual` and the actor the caller,
* both set by core. Adding an address already suppressed answers 200 with the existing entry.
*/
declare const addSuppressionRequestSchema: z30.ZodObject<{
	email: z30.ZodOptional<z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>>;
	phone: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
	linkedinUrl: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
	note: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
}, z30.core.$strict>;
/** The body of a request to add an address to the Suppression list. */
type AddSuppressionRequest = z30.infer<typeof addSuppressionRequestSchema>;
/** The body of a request to remove a manual entry: the reason is recorded. */
declare const removeSuppressionRequestSchema: z30.ZodObject<{
	reason: z30.ZodPipe<z30.ZodString, z30.ZodString>;
}, z30.core.$strict>;
/** The body of a request to remove a manual entry. */
type RemoveSuppressionRequest = z30.infer<typeof removeSuppressionRequestSchema>;
/** Whether a list shows live entries or removed ones. */
declare const suppressionListStateSchema: z30.ZodEnum<{
	active: "active";
	removed: "removed";
}>;
/**
* The query parameters of a request to list the Suppression list, newest first: filters by
* reason, address kind and state (default `active`). An address is never a query parameter (query strings reach access logs): look one up with
* {@link lookupSuppressionRequestSchema}.
*/
declare const listSuppressionEntriesQuerySchema: z30.ZodObject<{
	cursor: z30.ZodOptional<z30.ZodString>;
	limit: z30.ZodDefault<z30.ZodPipe<z30.ZodPipe<z30.ZodUnion<readonly [z30.ZodNumber, z30.ZodString]>, z30.ZodTransform<number, string | number>>, z30.ZodNumber>>;
	reason: z30.ZodOptional<z30.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
	addressKind: z30.ZodOptional<z30.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>>;
	state: z30.ZodOptional<z30.ZodEnum<{
		active: "active";
		removed: "removed";
	}>>;
}, z30.core.$strict>;
/** The body of a lookup of one address on the Suppression list: exactly one address, normalised and hashed by core; there is no substring search. */
declare const lookupSuppressionRequestSchema: z30.ZodObject<{
	email: z30.ZodOptional<z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>>;
	phone: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
	linkedinUrl: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
}, z30.core.$strict>;
/** The query parameters of a request to list Suppression entries. */
type ListSuppressionEntriesQuery = z30.infer<typeof listSuppressionEntriesQuerySchema>;
/** One page of Suppression entries. */
declare const suppressionEntryPageSchema: z30.ZodObject<{
	items: z30.ZodArray<z30.ZodObject<{
		id: z30.core.$ZodBranded<z30.ZodString, "sup", "out">;
		addressKind: z30.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
		}>;
		maskedAddress: z30.ZodNullable<z30.ZodString>;
		reason: z30.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>;
		channel: z30.ZodNullable<z30.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		sourceRef: z30.ZodNullable<z30.ZodString>;
		addedByUserId: z30.ZodNullable<z30.core.$ZodBranded<z30.ZodString, "usr", "out">>;
		removable: z30.ZodBoolean;
		createdAt: z30.ZodISODateTime;
		removedAt: z30.ZodNullable<z30.ZodISODateTime>;
		removedByUserId: z30.ZodNullable<z30.core.$ZodBranded<z30.ZodString, "usr", "out">>;
		removalReason: z30.ZodNullable<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
	}, z30.core.$strip>>;
	nextCursor: z30.ZodNullable<z30.ZodString>;
}, z30.core.$strip>;
/**
* Internal: the body of a STOP the channel adapter received. The Organization comes from the
* adapter's own record of the message (an internal call has no token), the address from the
* message sender. Core appends a `stop_reply` withdrawal on `channel` (or on every channel when
* `stopAll`), adds a `stop` Suppression entry and publishes the events. Idempotent on `sourceRef`.
*/
declare const recordWithdrawalRequestSchema: z30.ZodObject<{
	email: z30.ZodOptional<z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>>;
	phone: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
	linkedinUrl: z30.ZodOptional<z30.ZodPipe<z30.ZodString, z30.ZodString>>;
	organizationId: z30.core.$ZodBranded<z30.ZodString, "org", "out">;
	channel: z30.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	stopAll: z30.ZodDefault<z30.ZodBoolean>;
	sourceRef: z30.ZodString;
}, z30.core.$strict>;
/** Internal: the body of a STOP. */
type RecordWithdrawalRequest = z30.infer<typeof recordWithdrawalRequestSchema>;
/** Why an email address was suppressed by delivery: it bounced or the recipient complained. */
declare const DELIVERY_FAILURE_REASONS: readonly ["bounce", "complaint"];
/** Internal: the body of a bounce or complaint the email channel received; core adds the Suppression entry. Idempotent on `sourceRef`. */
declare const recordDeliveryFailureRequestSchema: z30.ZodObject<{
	organizationId: z30.core.$ZodBranded<z30.ZodString, "org", "out">;
	email: z30.ZodPipe<z30.ZodPipe<z30.ZodString, z30.ZodTransform<string, string>>, z30.ZodString>;
	reason: z30.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
	}>;
	sourceRef: z30.ZodString;
}, z30.core.$strict>;
/** Internal: the body of a bounce or complaint. */
type RecordDeliveryFailureRequest = z30.infer<typeof recordDeliveryFailureRequestSchema>;
/** Internal: what recording a STOP or a delivery failure answers: the entry (an existing one on a replay) and the Prospect if one is known. */
declare const recordedSuppressionSchema: z30.ZodObject<{
	entryId: z30.core.$ZodBranded<z30.ZodString, "sup", "out">;
	prospectId: z30.ZodNullable<z30.core.$ZodBranded<z30.ZodString, "prs", "out">>;
}, z30.core.$strip>;
/** The largest Suppression import file, in bytes (10 MB). */
declare const MAX_SUPPRESSION_IMPORT_BYTES: number;
/** The most data rows a Suppression import may hold. */
declare const MAX_SUPPRESSION_IMPORT_ROWS = 5e4;
/** The name of the one file part of the multipart upload; the request carries an `Idempotency-Key` header. */
declare const SUPPRESSION_IMPORT_FILE_FIELD = "file";
/** The one column of the CSV: an email, a phone number or a LinkedIn address per row. */
declare const SUPPRESSION_IMPORT_COLUMNS: readonly ["address"];
/** The states of a Suppression import; `completed` and `failed` are final. */
declare const SUPPRESSION_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of a Suppression import. */
declare const suppressionImportStateSchema: z30.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** Why a whole Suppression import failed after it was accepted. */
declare const SUPPRESSION_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable"];
/**
* A Suppression import: a queued job that adds every address of an uploaded CSV with the reason
* `manual`. The counts are set exactly when `completed` and add up to `totalRows`; a failed import
* carries `failureReason`. A bad row is reported, never dropped.
*/
declare const suppressionImportSchema: z30.ZodObject<{
	id: z30.core.$ZodBranded<z30.ZodString, "simp", "out">;
	state: z30.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z30.ZodNullable<z30.ZodEnum<{
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	totalRows: z30.ZodNullable<z30.ZodNumber>;
	addedRows: z30.ZodNullable<z30.ZodNumber>;
	alreadySuppressedRows: z30.ZodNullable<z30.ZodNumber>;
	invalidRows: z30.ZodNullable<z30.ZodNumber>;
	createdAt: z30.ZodISODateTime;
	completedAt: z30.ZodNullable<z30.ZodISODateTime>;
	createdByUserId: z30.core.$ZodBranded<z30.ZodString, "usr", "out">;
}, z30.core.$strip>;
/** A Suppression import. */
type SuppressionImport = z30.infer<typeof suppressionImportSchema>;
/** The path parameters of a request about one Suppression import. */
declare const suppressionImportParamsSchema: z30.ZodObject<{
	importId: z30.core.$ZodBranded<z30.ZodString, "simp", "out">;
}, z30.core.$strict>;
/** The query parameters of a request to list Suppression imports, newest first. */
declare const listSuppressionImportsQuerySchema: z30.ZodObject<{
	cursor: z30.ZodOptional<z30.ZodString>;
	limit: z30.ZodDefault<z30.ZodPipe<z30.ZodPipe<z30.ZodUnion<readonly [z30.ZodNumber, z30.ZodString]>, z30.ZodTransform<number, string | number>>, z30.ZodNumber>>;
}, z30.core.$strict>;
/** One page of Suppression imports. */
declare const suppressionImportPageSchema: z30.ZodObject<{
	items: z30.ZodArray<z30.ZodObject<{
		id: z30.core.$ZodBranded<z30.ZodString, "simp", "out">;
		state: z30.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z30.ZodNullable<z30.ZodEnum<{
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		totalRows: z30.ZodNullable<z30.ZodNumber>;
		addedRows: z30.ZodNullable<z30.ZodNumber>;
		alreadySuppressedRows: z30.ZodNullable<z30.ZodNumber>;
		invalidRows: z30.ZodNullable<z30.ZodNumber>;
		createdAt: z30.ZodISODateTime;
		completedAt: z30.ZodNullable<z30.ZodISODateTime>;
		createdByUserId: z30.core.$ZodBranded<z30.ZodString, "usr", "out">;
	}, z30.core.$strip>>;
	nextCursor: z30.ZodNullable<z30.ZodString>;
}, z30.core.$strip>;
/** The result of one row of a Suppression import. */
declare const SUPPRESSION_IMPORT_ROW_RESULTS: readonly ["added", "already_suppressed", "invalid"];
/** One row of the import report: its number and result; no cell of the file is returned. */
declare const suppressionImportRowSchema: z30.ZodObject<{
	rowNumber: z30.ZodNumber;
	result: z30.ZodEnum<{
		added: "added";
		already_suppressed: "already_suppressed";
		invalid: "invalid";
	}>;
	reason: z30.ZodNullable<z30.ZodEnum<{
		unreadable_address: "unreadable_address";
		unsupported_address: "unsupported_address";
	}>>;
}, z30.core.$strip>;
/** One row of the import report. */
type SuppressionImportRow = z30.infer<typeof suppressionImportRowSchema>;
/** The query parameters of a request to read the import report in CSV order, optionally only one result. */
declare const listSuppressionImportRowsQuerySchema: z30.ZodObject<{
	cursor: z30.ZodOptional<z30.ZodString>;
	limit: z30.ZodDefault<z30.ZodPipe<z30.ZodPipe<z30.ZodUnion<readonly [z30.ZodNumber, z30.ZodString]>, z30.ZodTransform<number, string | number>>, z30.ZodNumber>>;
	result: z30.ZodOptional<z30.ZodEnum<{
		added: "added";
		already_suppressed: "already_suppressed";
		invalid: "invalid";
	}>>;
}, z30.core.$strict>;
/** One page of import report rows. */
declare const suppressionImportRowPageSchema: z30.ZodObject<{
	items: z30.ZodArray<z30.ZodObject<{
		rowNumber: z30.ZodNumber;
		result: z30.ZodEnum<{
			added: "added";
			already_suppressed: "already_suppressed";
			invalid: "invalid";
		}>;
		reason: z30.ZodNullable<z30.ZodEnum<{
			unreadable_address: "unreadable_address";
			unsupported_address: "unsupported_address";
		}>>;
	}, z30.core.$strip>>;
	nextCursor: z30.ZodNullable<z30.ZodString>;
}, z30.core.$strip>;
import { z as z31 } from "zod";
/** The channels a Prospect can be contacted on, and a Contact Consent or Suppression can name. */
declare const CONSENT_CHANNELS: readonly ["phone", "sms", "whatsapp", "email", "linkedin"];
/** A channel a Prospect can be contacted on. */
declare const consentChannelSchema: z31.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
	sms: "sms";
	whatsapp: "whatsapp";
}>;
/** A channel a Prospect can be contacted on. */
type ConsentChannel = z31.infer<typeof consentChannelSchema>;
/**
* The channels where an Agent-initiated contact needs a granted Contact Consent (ADR 0003). Email
* needs no Suppression and an unsubscribe path instead. This is a fact of the rule, not a setting.
*/
declare const CONSENT_REQUIRED_CHANNELS: readonly ["phone", "sms", "whatsapp"];
/** Where a granted Contact Consent came from. Core sets `hosted_form` from the public route; a person records the others. */
declare const CONSENT_GRANT_SOURCES: readonly ["hosted_form", "verbal_call", "import_attestation", "crm", "manual"];
/** Where a granted Contact Consent came from. */
declare const consentGrantSourceSchema: z31.ZodEnum<{
	crm: "crm";
	hosted_form: "hosted_form";
	import_attestation: "import_attestation";
	manual: "manual";
	verbal_call: "verbal_call";
}>;
/** Where a granted Contact Consent came from. */
type ConsentGrantSource = z31.infer<typeof consentGrantSourceSchema>;
/** The sources a Rep or Admin may name when recording a grant; the hosted form is never claimed in a body. */
declare const CONSENT_RECORDABLE_SOURCES: readonly ["verbal_call", "import_attestation", "crm", "manual"];
/** Where a withdrawal came from: a one-click unsubscribe, a STOP reply, or a person or sync. */
declare const CONSENT_WITHDRAWAL_SOURCES: readonly ["unsubscribe", "stop_reply", "manual", "crm"];
/** Where a withdrawal came from. */
declare const consentWithdrawalSourceSchema: z31.ZodEnum<{
	crm: "crm";
	manual: "manual";
	stop_reply: "stop_reply";
	unsubscribe: "unsubscribe";
}>;
/** Where a withdrawal came from. */
type ConsentWithdrawalSource = z31.infer<typeof consentWithdrawalSourceSchema>;
/** Every source a ledger event can have. */
declare const consentSourceSchema: z31.ZodUnion<readonly [z31.ZodEnum<{
	crm: "crm";
	hosted_form: "hosted_form";
	import_attestation: "import_attestation";
	manual: "manual";
	verbal_call: "verbal_call";
}>, z31.ZodEnum<{
	crm: "crm";
	manual: "manual";
	stop_reply: "stop_reply";
	unsubscribe: "unsubscribe";
}>]>;
/** Every source a ledger event can have. */
type ConsentSource = z31.infer<typeof consentSourceSchema>;
/** The longest evidence reference (a form submission, a Call, an attestation note), in characters. */
declare const MAX_EVIDENCE_REF_LENGTH = 200;
/** A reference to the artefact that shows a consent: bounded text with no control character. */
declare const evidenceRefSchema: z31.ZodPipe<z31.ZodString, z31.ZodString>;
/**
* The opaque signed token of a public route (an unsubscribe link, a hosted consent form): 22 to
* 256 URL-safe characters. It names no address; core verifies its signature and expiry and
* answers `consent.invalid_token` for a tampered, expired or unknown one.
*/
declare const consentTokenSchema: z31.ZodString;
/** The purposes a Contact Check is asked for, set by the calling service and never by an outside request body. */
declare const CONTACT_PURPOSES: readonly ["agent_initiated", "rep_initiated", "reply"];
/** The purpose of a Contact Check. */
declare const contactPurposeSchema: z31.ZodEnum<{
	agent_initiated: "agent_initiated";
	rep_initiated: "rep_initiated";
	reply: "reply";
}>;
/** The purpose of a Contact Check. */
type ContactPurpose = z31.infer<typeof contactPurposeSchema>;
/** Why an address is on the Suppression list. */
declare const SUPPRESSION_REASONS: readonly ["unsubscribe", "stop", "bounce", "complaint", "manual", "crm", "erased"];
/** Why an address is on the Suppression list. */
declare const suppressionReasonSchema: z31.ZodEnum<{
	bounce: "bounce";
	complaint: "complaint";
	crm: "crm";
	erased: "erased";
	manual: "manual";
	stop: "stop";
	unsubscribe: "unsubscribe";
}>;
/** Why an address is on the Suppression list. */
type SuppressionReason = z31.infer<typeof suppressionReasonSchema>;
/** The reasons an Admin may remove an entry for, with a recorded reason; every other entry is permanent (ADR 0021). */
declare const SUPPRESSION_REMOVABLE_REASONS: readonly ["manual"];
/** The kinds of address a Suppression entry is kept for. */
declare const SUPPRESSION_ADDRESS_KINDS: readonly ["email", "phone", "linkedin"];
/** The kind of address a Suppression entry is kept for. */
declare const suppressionAddressKindSchema: z31.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
}>;
/** The kind of address a Suppression entry is kept for. */
type SuppressionAddressKind = z31.infer<typeof suppressionAddressKindSchema>;
/** A masked address for display (`a***@example.com`): 1 to 100 characters, never the whole address. */
declare const maskedAddressSchema: z31.ZodString;
/** The address fields of a request that names one address: an email, a phone or a LinkedIn address. Pair with {@link hasExactlyOneAddress}. */
declare const addressFieldsShape: {
	email: z31.ZodOptional<z31.ZodPipe<z31.ZodPipe<z31.ZodString, z31.ZodTransform<string, string>>, z31.ZodString>>;
	phone: z31.ZodOptional<z31.ZodPipe<z31.ZodString, z31.ZodString>>;
	linkedinUrl: z31.ZodOptional<z31.ZodPipe<z31.ZodString, z31.ZodString>>;
};
/** True when exactly one of the address fields is present. */
declare const hasExactlyOneAddress: (body: {
	email?: unknown;
	phone?: unknown;
	linkedinUrl?: unknown;
}) => boolean;
/** The message of a request that must name exactly one address. */
declare const ONE_ADDRESS_MESSAGE = "Give exactly one of email, phone or linkedinUrl";
import { z as z32 } from "zod";
/** The longest Consent Wording, in characters. */
declare const MAX_CONSENT_WORDING_LENGTH = 5e3;
/** The longest name of a hosted consent form, in characters. */
declare const MAX_CONSENT_FORM_NAME_LENGTH = 100;
/** Consent Wording text: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
declare const consentWordingTextSchema: z32.ZodPipe<z32.ZodString, z32.ZodString>;
/**
* A Consent Wording: the exact text a Prospect is shown when agreeing, for the `channels` it
* covers. It is immutable once any consent event or published form references it (`locked`); a
* change is a new version, which names the one it replaces as `supersedesId`. `version` starts at
* 1 and grows by one per version of the same lineage.
*/
declare const consentWordingSchema: z32.ZodObject<{
	id: z32.core.$ZodBranded<z32.ZodString, "cwd", "out">;
	version: z32.ZodNumber;
	text: z32.ZodPipe<z32.ZodString, z32.ZodString>;
	channels: z32.ZodArray<z32.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	locked: z32.ZodBoolean;
	supersedesId: z32.ZodNullable<z32.core.$ZodBranded<z32.ZodString, "cwd", "out">>;
	createdAt: z32.ZodISODateTime;
	createdByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
}, z32.core.$strip>;
/** A Consent Wording. */
type ConsentWording = z32.infer<typeof consentWordingSchema>;
/** The path parameters of a request about one wording. */
declare const consentWordingParamsSchema: z32.ZodObject<{
	wordingId: z32.core.$ZodBranded<z32.ZodString, "cwd", "out">;
}, z32.core.$strict>;
/** The body of a request to write a Consent Wording (version 1) or the next version of one. Lawyer-reviewed text is the Organization's to supply. */
declare const createConsentWordingRequestSchema: z32.ZodObject<{
	text: z32.ZodPipe<z32.ZodString, z32.ZodString>;
	channels: z32.ZodArray<z32.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z32.core.$strict>;
/** The body of a request to write a Consent Wording. */
type CreateConsentWordingRequest = z32.infer<typeof createConsentWordingRequestSchema>;
/** The body of a request to edit a wording that is not yet locked; a locked one is `consent.wording_locked`. At least one field. */
declare const updateConsentWordingRequestSchema: z32.ZodObject<{
	text: z32.ZodOptional<z32.ZodPipe<z32.ZodString, z32.ZodString>>;
	channels: z32.ZodOptional<z32.ZodArray<z32.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>>;
}, z32.core.$strict>;
/** The body of a request to edit a wording. */
type UpdateConsentWordingRequest = z32.infer<typeof updateConsentWordingRequestSchema>;
/** The query parameters of a request to list wordings, newest first. */
declare const listConsentWordingsQuerySchema: z32.ZodObject<{
	cursor: z32.ZodOptional<z32.ZodString>;
	limit: z32.ZodDefault<z32.ZodPipe<z32.ZodPipe<z32.ZodUnion<readonly [z32.ZodNumber, z32.ZodString]>, z32.ZodTransform<number, string | number>>, z32.ZodNumber>>;
}, z32.core.$strict>;
/** One page of wordings. */
declare const consentWordingPageSchema: z32.ZodObject<{
	items: z32.ZodArray<z32.ZodObject<{
		id: z32.core.$ZodBranded<z32.ZodString, "cwd", "out">;
		version: z32.ZodNumber;
		text: z32.ZodPipe<z32.ZodString, z32.ZodString>;
		channels: z32.ZodArray<z32.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		locked: z32.ZodBoolean;
		supersedesId: z32.ZodNullable<z32.core.$ZodBranded<z32.ZodString, "cwd", "out">>;
		createdAt: z32.ZodISODateTime;
		createdByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
	}, z32.core.$strip>>;
	nextCursor: z32.ZodNullable<z32.ZodString>;
}, z32.core.$strip>;
/** The states of a hosted consent form; publishing locks its wording and closing stops submissions. */
declare const CONSENT_FORM_STATES: readonly ["draft", "published", "closed"];
/** The state of a hosted consent form. */
declare const consentFormStateSchema: z32.ZodEnum<{
	closed: "closed";
	draft: "draft";
	published: "published";
}>;
/** The state of a hosted consent form. */
type ConsentFormState = z32.infer<typeof consentFormStateSchema>;
/**
* A hosted consent form: a wording and the `channels` it offers, each with its own unticked
* choice. `publishedAt` is set exactly once published (a closed form keeps it). `token` goes in the
* hosted page's URL and is the only credential of the public routes, so core returns it to Owner
* and Admin only and it is `null` for a Manager or Rep, and for a draft.
*/
declare const consentFormSchema: z32.ZodObject<{
	id: z32.core.$ZodBranded<z32.ZodString, "cfm", "out">;
	wordingId: z32.core.$ZodBranded<z32.ZodString, "cwd", "out">;
	name: z32.ZodPipe<z32.ZodString, z32.ZodString>;
	channels: z32.ZodArray<z32.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	state: z32.ZodEnum<{
		closed: "closed";
		draft: "draft";
		published: "published";
	}>;
	token: z32.ZodNullable<z32.ZodString>;
	createdAt: z32.ZodISODateTime;
	createdByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
	publishedAt: z32.ZodNullable<z32.ZodISODateTime>;
	closedAt: z32.ZodNullable<z32.ZodISODateTime>;
}, z32.core.$strip>;
/** A hosted consent form. */
type ConsentForm = z32.infer<typeof consentFormSchema>;
/** The path parameters of a request about one form. */
declare const consentFormParamsSchema: z32.ZodObject<{
	formId: z32.core.$ZodBranded<z32.ZodString, "cfm", "out">;
}, z32.core.$strict>;
/** The body of a request to create a form (a draft) from a wording; the channels must be among the wording's. */
declare const createConsentFormRequestSchema: z32.ZodObject<{
	wordingId: z32.core.$ZodBranded<z32.ZodString, "cwd", "out">;
	name: z32.ZodPipe<z32.ZodString, z32.ZodString>;
	channels: z32.ZodArray<z32.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z32.core.$strict>;
/** The body of a request to create a form. */
type CreateConsentFormRequest = z32.infer<typeof createConsentFormRequestSchema>;
/** The query parameters of a request to list forms, newest first, optionally one state. */
declare const listConsentFormsQuerySchema: z32.ZodObject<{
	cursor: z32.ZodOptional<z32.ZodString>;
	limit: z32.ZodDefault<z32.ZodPipe<z32.ZodPipe<z32.ZodUnion<readonly [z32.ZodNumber, z32.ZodString]>, z32.ZodTransform<number, string | number>>, z32.ZodNumber>>;
	state: z32.ZodOptional<z32.ZodEnum<{
		closed: "closed";
		draft: "draft";
		published: "published";
	}>>;
}, z32.core.$strict>;
/** One page of forms. */
declare const consentFormPageSchema: z32.ZodObject<{
	items: z32.ZodArray<z32.ZodObject<{
		id: z32.core.$ZodBranded<z32.ZodString, "cfm", "out">;
		wordingId: z32.core.$ZodBranded<z32.ZodString, "cwd", "out">;
		name: z32.ZodPipe<z32.ZodString, z32.ZodString>;
		channels: z32.ZodArray<z32.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		state: z32.ZodEnum<{
			closed: "closed";
			draft: "draft";
			published: "published";
		}>;
		token: z32.ZodNullable<z32.ZodString>;
		createdAt: z32.ZodISODateTime;
		createdByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
		publishedAt: z32.ZodNullable<z32.ZodISODateTime>;
		closedAt: z32.ZodNullable<z32.ZodISODateTime>;
	}, z32.core.$strip>>;
	nextCursor: z32.ZodNullable<z32.ZodString>;
}, z32.core.$strip>;
import { z as z33 } from "zod";
/** One quote from a cited Moment: what the Prospect said and what the Rep said next. Tenant Transcript text, untrusted data, never logged. */
declare const copilotQuoteSchema: z33.ZodObject<{
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
	dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
	prospect: z33.ZodString;
	repNext: z33.ZodString;
}, z33.core.$strict>;
/** One quote from a cited Moment. */
type CopilotQuote = z33.infer<typeof copilotQuoteSchema>;
/** The passage of a Playbook document a `document` card shows: the document, its page (null for a format without pages) and the passage. The Organization's own sales material, untrusted data. */
declare const copilotDocumentSourceSchema: z33.ZodObject<{
	documentId: z33.core.$ZodBranded<z33.ZodString, "doc", "out">;
	page: z33.ZodNullable<z33.ZodNumber>;
	passage: z33.ZodString;
}, z33.core.$strict>;
/** The passage of a Playbook document a card shows. */
type CopilotDocumentSource = z33.infer<typeof copilotDocumentSourceSchema>;
/**
* A Copilot Card: one piece of advice shown to a Rep during a Call, with the Evidence it rests on.
*
* - It is invalid without at least one cited Moment, without Evidence of at least one Moment and
*   one won Deal, and when it counts more Deals than Moments. The Evidence also has to cover the
*   citations: no fewer Moments than cited, no fewer Deals than the distinct Deals cited.
* - The cards a service creates also meet the Organization's minimum Evidence (see the settings);
*   that minimum is a setting and not part of this shape.
* - Every quote is of a cited Moment. A `similar_moment` card shows at least one quote.
* - A card is dismissed or pinned, never both.
* - Quotes, passages and the model-composed `response` and `nextStep` are tenant text or model
*   output, so they are UNTRUSTED DATA. They are bounded, well-formed text with no control
*   character. The portal shows them as plain text, never as markup, never follows them as
*   instructions and never speaks them into the Call. They are never logged or sent to the error
*   reporter.
*/
declare const copilotCardSchema: z33.ZodDiscriminatedUnion<[z33.ZodObject<{
	id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
	sequence: z33.ZodNumber;
	evidence: z33.ZodObject<{
		moments: z33.ZodNumber;
		deals: z33.ZodNumber;
	}, z33.core.$strict>;
	citedMoments: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
	}, z33.core.$strict>>;
	quotes: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		prospect: z33.ZodString;
		repNext: z33.ZodString;
	}, z33.core.$strict>>;
	shownAt: z33.ZodISODateTime;
	rating: z33.ZodNullable<z33.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z33.ZodBoolean;
	pinned: z33.ZodBoolean;
	kind: z33.ZodLiteral<"similar_moment">;
}, z33.core.$strict>, z33.ZodObject<{
	id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
	sequence: z33.ZodNumber;
	evidence: z33.ZodObject<{
		moments: z33.ZodNumber;
		deals: z33.ZodNumber;
	}, z33.core.$strict>;
	citedMoments: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
	}, z33.core.$strict>>;
	quotes: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		prospect: z33.ZodString;
		repNext: z33.ZodString;
	}, z33.core.$strict>>;
	shownAt: z33.ZodISODateTime;
	rating: z33.ZodNullable<z33.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z33.ZodBoolean;
	pinned: z33.ZodBoolean;
	kind: z33.ZodLiteral<"objection">;
	objectionType: z33.ZodEnum<{
		authority: "authority";
		competitor: "competitor";
		need: "need";
		price: "price";
		timing: "timing";
		trust: "trust";
	}>;
	response: z33.ZodString;
}, z33.core.$strict>, z33.ZodObject<{
	id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
	sequence: z33.ZodNumber;
	evidence: z33.ZodObject<{
		moments: z33.ZodNumber;
		deals: z33.ZodNumber;
	}, z33.core.$strict>;
	citedMoments: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
	}, z33.core.$strict>>;
	quotes: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		prospect: z33.ZodString;
		repNext: z33.ZodString;
	}, z33.core.$strict>>;
	shownAt: z33.ZodISODateTime;
	rating: z33.ZodNullable<z33.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z33.ZodBoolean;
	pinned: z33.ZodBoolean;
	kind: z33.ZodLiteral<"next_step">;
	nextStep: z33.ZodString;
}, z33.core.$strict>, z33.ZodObject<{
	id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
	sequence: z33.ZodNumber;
	evidence: z33.ZodObject<{
		moments: z33.ZodNumber;
		deals: z33.ZodNumber;
	}, z33.core.$strict>;
	citedMoments: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
	}, z33.core.$strict>>;
	quotes: z33.ZodArray<z33.ZodObject<{
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		prospect: z33.ZodString;
		repNext: z33.ZodString;
	}, z33.core.$strict>>;
	shownAt: z33.ZodISODateTime;
	rating: z33.ZodNullable<z33.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z33.ZodBoolean;
	pinned: z33.ZodBoolean;
	kind: z33.ZodLiteral<"document">;
	source: z33.ZodObject<{
		documentId: z33.core.$ZodBranded<z33.ZodString, "doc", "out">;
		page: z33.ZodNullable<z33.ZodNumber>;
		passage: z33.ZodString;
	}, z33.core.$strict>;
}, z33.core.$strict>], "kind">;
/** A Copilot Card. */
type CopilotCard = z33.infer<typeof copilotCardSchema>;
/** Whether a kind of card is composed by the model (and so replaces a retrieval card in place). */
declare function isComposedKind(kind: CopilotCard["kind"]): boolean;
/** The path parameters of a request about the cards of one Call. */
declare const copilotCallParamsSchema: z33.ZodObject<{
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
}, z33.core.$strict>;
/** The path parameters of a request about one card. */
declare const copilotCardParamsSchema: z33.ZodObject<{
	callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
	cardId: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
}, z33.core.$strict>;
/** The position a card list resumes from: the sequence of the last card of the previous page. */
declare const copilotCardCursorSchema: z33.ZodObject<{
	sequence: z33.ZodNumber;
}, z33.core.$strict>;
/** The query parameters of a request to list the cards of a Call, oldest first, one cursor-paginated page at a time (at most 100), optionally of one kind. */
declare const listCopilotCardsQuerySchema: z33.ZodObject<{
	cursor: z33.ZodOptional<z33.ZodString>;
	limit: z33.ZodDefault<z33.ZodPipe<z33.ZodPipe<z33.ZodUnion<readonly [z33.ZodNumber, z33.ZodString]>, z33.ZodTransform<number, string | number>>, z33.ZodNumber>>;
	kind: z33.ZodOptional<z33.ZodEnum<{
		document: "document";
		next_step: "next_step";
		objection: "objection";
		similar_moment: "similar_moment";
	}>>;
}, z33.core.$strict>;
/** The query parameters of a request to list the cards of a Call. */
type ListCopilotCardsQuery = z33.infer<typeof listCopilotCardsQuerySchema>;
/** One page of the cards of a Call. */
declare const copilotCardPageSchema: z33.ZodObject<{
	items: z33.ZodArray<z33.ZodDiscriminatedUnion<[z33.ZodObject<{
		id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		sequence: z33.ZodNumber;
		evidence: z33.ZodObject<{
			moments: z33.ZodNumber;
			deals: z33.ZodNumber;
		}, z33.core.$strict>;
		citedMoments: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		}, z33.core.$strict>>;
		quotes: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
			prospect: z33.ZodString;
			repNext: z33.ZodString;
		}, z33.core.$strict>>;
		shownAt: z33.ZodISODateTime;
		rating: z33.ZodNullable<z33.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z33.ZodBoolean;
		pinned: z33.ZodBoolean;
		kind: z33.ZodLiteral<"similar_moment">;
	}, z33.core.$strict>, z33.ZodObject<{
		id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		sequence: z33.ZodNumber;
		evidence: z33.ZodObject<{
			moments: z33.ZodNumber;
			deals: z33.ZodNumber;
		}, z33.core.$strict>;
		citedMoments: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		}, z33.core.$strict>>;
		quotes: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
			prospect: z33.ZodString;
			repNext: z33.ZodString;
		}, z33.core.$strict>>;
		shownAt: z33.ZodISODateTime;
		rating: z33.ZodNullable<z33.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z33.ZodBoolean;
		pinned: z33.ZodBoolean;
		kind: z33.ZodLiteral<"objection">;
		objectionType: z33.ZodEnum<{
			authority: "authority";
			competitor: "competitor";
			need: "need";
			price: "price";
			timing: "timing";
			trust: "trust";
		}>;
		response: z33.ZodString;
	}, z33.core.$strict>, z33.ZodObject<{
		id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		sequence: z33.ZodNumber;
		evidence: z33.ZodObject<{
			moments: z33.ZodNumber;
			deals: z33.ZodNumber;
		}, z33.core.$strict>;
		citedMoments: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		}, z33.core.$strict>>;
		quotes: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
			prospect: z33.ZodString;
			repNext: z33.ZodString;
		}, z33.core.$strict>>;
		shownAt: z33.ZodISODateTime;
		rating: z33.ZodNullable<z33.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z33.ZodBoolean;
		pinned: z33.ZodBoolean;
		kind: z33.ZodLiteral<"next_step">;
		nextStep: z33.ZodString;
	}, z33.core.$strict>, z33.ZodObject<{
		id: z33.core.$ZodBranded<z33.ZodString, "ccard", "out">;
		callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
		sequence: z33.ZodNumber;
		evidence: z33.ZodObject<{
			moments: z33.ZodNumber;
			deals: z33.ZodNumber;
		}, z33.core.$strict>;
		citedMoments: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
		}, z33.core.$strict>>;
		quotes: z33.ZodArray<z33.ZodObject<{
			callId: z33.core.$ZodBranded<z33.ZodString, "call", "out">;
			dealRecordId: z33.core.$ZodBranded<z33.ZodString, "deal", "out">;
			prospect: z33.ZodString;
			repNext: z33.ZodString;
		}, z33.core.$strict>>;
		shownAt: z33.ZodISODateTime;
		rating: z33.ZodNullable<z33.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z33.ZodBoolean;
		pinned: z33.ZodBoolean;
		kind: z33.ZodLiteral<"document">;
		source: z33.ZodObject<{
			documentId: z33.core.$ZodBranded<z33.ZodString, "doc", "out">;
			page: z33.ZodNullable<z33.ZodNumber>;
			passage: z33.ZodString;
		}, z33.core.$strict>;
	}, z33.core.$strict>], "kind">>;
	nextCursor: z33.ZodNullable<z33.ZodString>;
}, z33.core.$strip>;
/**
* The body of a request to mark a card: set any of its rating, dismissal and pin to the state
* wanted. It names an end state and not a step, so a repeat changes nothing. At least one field is
* sent; `rating: null` clears the rating. Dismissing a card clears its pin and pinning it clears
* its dismissal, so asking for both is refused.
*/
declare const markCopilotCardRequestSchema: z33.ZodObject<{
	rating: z33.ZodOptional<z33.ZodNullable<z33.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>>;
	dismissed: z33.ZodOptional<z33.ZodBoolean>;
	pinned: z33.ZodOptional<z33.ZodBoolean>;
}, z33.core.$strict>;
/** The body of a request to mark a card. */
type MarkCopilotCardRequest = z33.infer<typeof markCopilotCardRequestSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh459 } from "..";
/**
* The errors the Copilot routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A Call the caller may not see, or of another Organization, is the
* existing `call.not_found` (404, never 403). A card of such a Call is `card.not_found` as well.
*
* - `copilot.disabled` (409): the Copilot is off for this Call, because the Organization has it
*   off or the Rep dialed without it; there is nothing to stream.
* - `copilot.not_started` (409): the Call has not yet reached its Disclosure (it is still
*   ringing or connecting), so there is no Copilot to stream from; try again shortly. Once the
*   Disclosure is playing, the stream opens and says it is waiting. The Copilot never runs before
*   the Disclosure has played, and no code or setting changes that (ADR 0003).
* - `copilot.min_evidence_invalid` (422): the minimum Evidence asked for is outside 1 to 20, or
*   asks for more distinct Deals than Moments.
* - `card.not_found` (404): no such card on that Call, or one the caller may not see.
*/
declare const COPILOT_ERRORS: {
	readonly "card.not_found": ErrorDefinition_8gwh459<"card.not_found">;
	readonly "copilot.disabled": ErrorDefinition_8gwh459<"copilot.disabled">;
	readonly "copilot.min_evidence_invalid": ErrorDefinition_8gwh459<"copilot.min_evidence_invalid">;
	readonly "copilot.not_started": ErrorDefinition_8gwh459<"copilot.not_started">;
};
/** A Copilot error code. */
type CopilotErrorCode = keyof typeof COPILOT_ERRORS;
import { z as z34 } from "zod";
/**
* `voice.copilot.card_shown` (version 1): a Copilot Card appeared on a Rep's screen. Ids, the kind,
* the Evidence and the cited Moments, and no card text, quote or Transcript: those are tenant text
* and are read through the routes by those who may see the Call.
*/
declare const voiceCopilotCardShownEvent: {
	type: "voice.copilot.card_shown";
	version: 1;
	schema: z34.ZodObject<{
		id: z34.core.$ZodBranded<z34.ZodString, "evt", "out">;
		occurredAt: z34.ZodISODateTime;
		organizationId: z34.core.$ZodBranded<z34.ZodString, "org", "out">;
		region: z34.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z34.ZodLiteral<"voice.copilot.card_shown">;
		version: z34.ZodLiteral<1>;
		data: z34.ZodObject<{
			callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
			cardId: z34.core.$ZodBranded<z34.ZodString, "ccard", "out">;
			repMembershipId: z34.core.$ZodBranded<z34.ZodString, "mem", "out">;
			kind: z34.ZodEnum<{
				document: "document";
				next_step: "next_step";
				objection: "objection";
				similar_moment: "similar_moment";
			}>;
			objectionType: z34.ZodNullable<z34.ZodEnum<{
				authority: "authority";
				competitor: "competitor";
				need: "need";
				price: "price";
				timing: "timing";
				trust: "trust";
			}>>;
			evidence: z34.ZodObject<{
				moments: z34.ZodNumber;
				deals: z34.ZodNumber;
			}, z34.core.$strict>;
			citedMoments: z34.ZodArray<z34.ZodObject<{
				callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
				dealRecordId: z34.core.$ZodBranded<z34.ZodString, "deal", "out">;
			}, z34.core.$strict>>;
			shownAt: z34.ZodISODateTime;
		}, z34.core.$strict>;
	}, z34.core.$strip>;
	parse: (input: unknown) => {
		id: string & z34.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z34.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_shown";
		version: 1;
		data: {
			callId: string & z34.$brand<"call">;
			cardId: string & z34.$brand<"ccard">;
			repMembershipId: string & z34.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
			evidence: {
				moments: number;
				deals: number;
			};
			citedMoments: {
				callId: string & z34.$brand<"call">;
				dealRecordId: string & z34.$brand<"deal">;
			}[];
			shownAt: string;
		};
	};
	safeParse: (input: unknown) => z34.ZodSafeParseResult<{
		id: string & z34.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z34.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_shown";
		version: 1;
		data: {
			callId: string & z34.$brand<"call">;
			cardId: string & z34.$brand<"ccard">;
			repMembershipId: string & z34.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
			evidence: {
				moments: number;
				deals: number;
			};
			citedMoments: {
				callId: string & z34.$brand<"call">;
				dealRecordId: string & z34.$brand<"deal">;
			}[];
			shownAt: string;
		};
	}>;
};
/**
* `voice.copilot.card_rated` (version 1): a Rep changed how they marked a card (rated, dismissed,
* pinned). Carries the end state after the change, so a consumer (M15) applies it without having
* seen the earlier events. A repeat that changes nothing publishes no event. No card text.
*/
declare const voiceCopilotCardRatedEvent: {
	type: "voice.copilot.card_rated";
	version: 1;
	schema: z34.ZodObject<{
		id: z34.core.$ZodBranded<z34.ZodString, "evt", "out">;
		occurredAt: z34.ZodISODateTime;
		organizationId: z34.core.$ZodBranded<z34.ZodString, "org", "out">;
		region: z34.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z34.ZodLiteral<"voice.copilot.card_rated">;
		version: z34.ZodLiteral<1>;
		data: z34.ZodObject<{
			callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
			cardId: z34.core.$ZodBranded<z34.ZodString, "ccard", "out">;
			repMembershipId: z34.core.$ZodBranded<z34.ZodString, "mem", "out">;
			kind: z34.ZodEnum<{
				document: "document";
				next_step: "next_step";
				objection: "objection";
				similar_moment: "similar_moment";
			}>;
			rating: z34.ZodNullable<z34.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z34.ZodBoolean;
			pinned: z34.ZodBoolean;
			ratedAt: z34.ZodISODateTime;
		}, z34.core.$strict>;
	}, z34.core.$strip>;
	parse: (input: unknown) => {
		id: string & z34.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z34.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_rated";
		version: 1;
		data: {
			callId: string & z34.$brand<"call">;
			cardId: string & z34.$brand<"ccard">;
			repMembershipId: string & z34.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			rating: "not_useful" | "useful" | null;
			dismissed: boolean;
			pinned: boolean;
			ratedAt: string;
		};
	};
	safeParse: (input: unknown) => z34.ZodSafeParseResult<{
		id: string & z34.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z34.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_rated";
		version: 1;
		data: {
			callId: string & z34.$brand<"call">;
			cardId: string & z34.$brand<"ccard">;
			repMembershipId: string & z34.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			rating: "not_useful" | "useful" | null;
			dismissed: boolean;
			pinned: boolean;
			ratedAt: string;
		};
	}>;
};
/** Every Copilot event, by type. */
declare const COPILOT_EVENTS: {
	readonly "voice.copilot.card_shown": {
		type: "voice.copilot.card_shown";
		version: 1;
		schema: z34.ZodObject<{
			id: z34.core.$ZodBranded<z34.ZodString, "evt", "out">;
			occurredAt: z34.ZodISODateTime;
			organizationId: z34.core.$ZodBranded<z34.ZodString, "org", "out">;
			region: z34.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z34.ZodLiteral<"voice.copilot.card_shown">;
			version: z34.ZodLiteral<1>;
			data: z34.ZodObject<{
				callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
				cardId: z34.core.$ZodBranded<z34.ZodString, "ccard", "out">;
				repMembershipId: z34.core.$ZodBranded<z34.ZodString, "mem", "out">;
				kind: z34.ZodEnum<{
					document: "document";
					next_step: "next_step";
					objection: "objection";
					similar_moment: "similar_moment";
				}>;
				objectionType: z34.ZodNullable<z34.ZodEnum<{
					authority: "authority";
					competitor: "competitor";
					need: "need";
					price: "price";
					timing: "timing";
					trust: "trust";
				}>>;
				evidence: z34.ZodObject<{
					moments: z34.ZodNumber;
					deals: z34.ZodNumber;
				}, z34.core.$strict>;
				citedMoments: z34.ZodArray<z34.ZodObject<{
					callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
					dealRecordId: z34.core.$ZodBranded<z34.ZodString, "deal", "out">;
				}, z34.core.$strict>>;
				shownAt: z34.ZodISODateTime;
			}, z34.core.$strict>;
		}, z34.core.$strip>;
		parse: (input: unknown) => {
			id: string & z34.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z34.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_shown";
			version: 1;
			data: {
				callId: string & z34.$brand<"call">;
				cardId: string & z34.$brand<"ccard">;
				repMembershipId: string & z34.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
				evidence: {
					moments: number;
					deals: number;
				};
				citedMoments: {
					callId: string & z34.$brand<"call">;
					dealRecordId: string & z34.$brand<"deal">;
				}[];
				shownAt: string;
			};
		};
		safeParse: (input: unknown) => z34.ZodSafeParseResult<{
			id: string & z34.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z34.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_shown";
			version: 1;
			data: {
				callId: string & z34.$brand<"call">;
				cardId: string & z34.$brand<"ccard">;
				repMembershipId: string & z34.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
				evidence: {
					moments: number;
					deals: number;
				};
				citedMoments: {
					callId: string & z34.$brand<"call">;
					dealRecordId: string & z34.$brand<"deal">;
				}[];
				shownAt: string;
			};
		}>;
	};
	readonly "voice.copilot.card_rated": {
		type: "voice.copilot.card_rated";
		version: 1;
		schema: z34.ZodObject<{
			id: z34.core.$ZodBranded<z34.ZodString, "evt", "out">;
			occurredAt: z34.ZodISODateTime;
			organizationId: z34.core.$ZodBranded<z34.ZodString, "org", "out">;
			region: z34.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z34.ZodLiteral<"voice.copilot.card_rated">;
			version: z34.ZodLiteral<1>;
			data: z34.ZodObject<{
				callId: z34.core.$ZodBranded<z34.ZodString, "call", "out">;
				cardId: z34.core.$ZodBranded<z34.ZodString, "ccard", "out">;
				repMembershipId: z34.core.$ZodBranded<z34.ZodString, "mem", "out">;
				kind: z34.ZodEnum<{
					document: "document";
					next_step: "next_step";
					objection: "objection";
					similar_moment: "similar_moment";
				}>;
				rating: z34.ZodNullable<z34.ZodEnum<{
					not_useful: "not_useful";
					useful: "useful";
				}>>;
				dismissed: z34.ZodBoolean;
				pinned: z34.ZodBoolean;
				ratedAt: z34.ZodISODateTime;
			}, z34.core.$strict>;
		}, z34.core.$strip>;
		parse: (input: unknown) => {
			id: string & z34.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z34.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_rated";
			version: 1;
			data: {
				callId: string & z34.$brand<"call">;
				cardId: string & z34.$brand<"ccard">;
				repMembershipId: string & z34.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				rating: "not_useful" | "useful" | null;
				dismissed: boolean;
				pinned: boolean;
				ratedAt: string;
			};
		};
		safeParse: (input: unknown) => z34.ZodSafeParseResult<{
			id: string & z34.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z34.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_rated";
			version: 1;
			data: {
				callId: string & z34.$brand<"call">;
				cardId: string & z34.$brand<"ccard">;
				repMembershipId: string & z34.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				rating: "not_useful" | "useful" | null;
				dismissed: boolean;
				pinned: boolean;
				ratedAt: string;
			};
		}>;
	};
};
/** The type of a Copilot event. */
type CopilotEventType = keyof typeof COPILOT_EVENTS;
import { z as z35 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh4510 } from "..";
/**
* The errors the sales-history routes return, as `area.reason` codes. No body carries a file name,
* a deal id, a speaker label or text from a Call: every message is fixed. A role that is not
* allowed is the common `auth.forbidden`.
*
* - A second upload of the same Call under the same Deal is an answer (200, the stored Call), as
*   for a document in ADR 0016, so it has no code; the same content under another Deal id is
*   `call.content_in_other_deal`, and the answer does not say which Deal.
* - A recording longer than `MAX_RECORDING_SECONDS` and a page-less Transcript with no turns are
*   found by the job, so they are failure reasons on the Call, not codes.
* - A CSV row that fails (including an Outcome already decided) is a row result in the import
*   report, never an HTTP error.
* - `call.quota_exceeded` covers the number of Calls, the Recording bytes and the number of Deals,
*   and says deleted Calls count until purged.
* - `call.not_restorable` (410) is for a deleted Call past its purge time that the purge has not
*   yet removed; once purged the answer is `call.not_found` (404).
* - `rights.confirmation_required` (403) carries `details` of {@link rightsRequiredDetailsSchema},
*   so the portal knows which version of the wording to show.
*/
declare const SALES_HISTORY_ERRORS: {
	readonly "call.content_in_other_deal": ErrorDefinition_8gwh4510<"call.content_in_other_deal">;
	readonly "call.not_found": ErrorDefinition_8gwh4510<"call.not_found">;
	readonly "call.not_restorable": ErrorDefinition_8gwh4510<"call.not_restorable">;
	readonly "call.quota_exceeded": ErrorDefinition_8gwh4510<"call.quota_exceeded">;
	readonly "call.rep_invalid": ErrorDefinition_8gwh4510<"call.rep_invalid">;
	readonly "call.rep_not_changeable": ErrorDefinition_8gwh4510<"call.rep_not_changeable">;
	readonly "call.too_large": ErrorDefinition_8gwh4510<"call.too_large">;
	readonly "call.unsupported_type": ErrorDefinition_8gwh4510<"call.unsupported_type">;
	readonly "deal.not_found": ErrorDefinition_8gwh4510<"deal.not_found">;
	readonly "deal_import.busy": ErrorDefinition_8gwh4510<"deal_import.busy">;
	readonly "deal_import.header_invalid": ErrorDefinition_8gwh4510<"deal_import.header_invalid">;
	readonly "deal_import.not_found": ErrorDefinition_8gwh4510<"deal_import.not_found">;
	readonly "deal_import.too_large": ErrorDefinition_8gwh4510<"deal_import.too_large">;
	readonly "deal_import.unsupported_type": ErrorDefinition_8gwh4510<"deal_import.unsupported_type">;
	readonly "rights.confirmation_required": ErrorDefinition_8gwh4510<"rights.confirmation_required">;
	readonly "rights.version_outdated": ErrorDefinition_8gwh4510<"rights.version_outdated">;
};
/** A code from the {@link SALES_HISTORY_ERRORS} registry. */
type SalesHistoryErrorCode = keyof typeof SALES_HISTORY_ERRORS;
/** The `details` of a `rights.confirmation_required` body: the version of the wording the portal must show. */
declare const rightsRequiredDetailsSchema: z35.ZodObject<{
	wordingVersion: z35.ZodNumber;
}, z35.core.$strict>;
/** The `details` of a `rights.confirmation_required` body. */
type RightsRequiredDetails = z35.infer<typeof rightsRequiredDetailsSchema>;
/** The Copilot routes, by name. */
type CopilotRouteName = "streamCopilot" | "listCopilotCards" | "markCopilotCard" | "getCopilotSettings" | "setCopilotSettings";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type CopilotRoute = {
	readonly method: "GET" | "PUT" | "PATCH";
	readonly path: string;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when a retry is safe by the `Idempotency-Key` header. No Copilot route takes the header: each is idempotent by end state. */
	readonly idempotent: false;
	/** True for a Server-Sent Events route, answered as `text/event-stream` and not JSON. */
	readonly stream?: true;
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly (CopilotErrorCode | Extract<SalesHistoryErrorCode, "call.not_found">)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The Copilot routes (spec M13). Every route may also return the common `auth.*`, `rate.limited`
* and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record of
* another Organization is always not found. No route takes the `Idempotency-Key` header: marking a
* card and setting the settings each name an end state, so a repeat is harmless by itself. No route
* or body can start the Copilot before the Disclosure has played or change what the Disclosure
* says; a Copilot Call always tells the Prospect it is recorded and that AI is assisting (ADR 0003).
*/
declare const COPILOT_ROUTES: Readonly<Record<CopilotRouteName, CopilotRoute>>;
import { z as z36 } from "zod";
/** The fewest Moments, and the fewest distinct won Deals, a card may be allowed to rest on: a card is never shown without evidence. */
declare const MIN_COPILOT_MIN_EVIDENCE = 1;
/** The most an Organization can ask of a card, in Moments and in Deals. */
declare const MAX_COPILOT_MIN_EVIDENCE = 20;
/** The default minimum Evidence, in Moments: 3. */
declare const DEFAULT_COPILOT_MIN_MOMENTS = 3;
/** The default minimum Evidence, in distinct won Deals: 2. */
declare const DEFAULT_COPILOT_MIN_DEALS = 2;
/**
* The Copilot settings of an Organization: whether Reps may choose the Copilot for a Call, and the
* least Evidence (similar Moments, and distinct won Deals among them) a card needs before it is
* shown. There is one row per Organization. Nothing here, and no request, changes what a Call
* tells the Prospect: the Disclosure of a Copilot Call always says the Call is recorded and that
* AI is assisting (ADR 0003), and the Copilot cannot start before it has played.
*/
declare const copilotSettingsSchema: z36.ZodObject<{
	enabled: z36.ZodBoolean;
	minMoments: z36.ZodNumber;
	minDeals: z36.ZodNumber;
	updatedAt: z36.ZodNullable<z36.ZodISODateTime>;
	updatedBy: z36.ZodNullable<z36.core.$ZodBranded<z36.ZodString, "mem", "out">>;
}, z36.core.$strict>;
/** The Copilot settings of an Organization. */
type CopilotSettings = z36.infer<typeof copilotSettingsSchema>;
/**
* The body of a request to set the Copilot settings; it replaces them, so a repeat of the same
* body changes nothing. A `minDeals` above `minMoments`, or a minimum outside 1 to 20, is refused
* by the service as `copilot.min_evidence_invalid`.
*/
declare const setCopilotSettingsRequestSchema: z36.ZodObject<{
	enabled: z36.ZodBoolean;
	minMoments: z36.ZodNumber;
	minDeals: z36.ZodNumber;
}, z36.core.$strict>;
/** The body of a request to set the Copilot settings. */
type SetCopilotSettingsRequest = z36.infer<typeof setCopilotSettingsRequestSchema>;
import { z as z37 } from "zod";
/** The longest id of a stream message, in characters. */
declare const MAX_COPILOT_STREAM_ID_LENGTH = 64;
/**
* The id of a message in a Call's stream, sent as the SSE `id:` line and read back from the
* `Last-Event-ID` header to resume. It is opaque to the client and only ever made of these
* characters, so it cannot carry a line break into the frame.
*/
declare const copilotStreamIdSchema: z37.ZodString;
/** The headers of a request to open the stream; header names arrive lower-cased. `Last-Event-ID` resumes after that message from what is stored. */
declare const copilotStreamHeadersSchema: z37.ZodObject<{
	"last-event-id": z37.ZodOptional<z37.ZodString>;
}, z37.core.$strip>;
/** The states of the Copilot on a Call, as the stream says them. */
declare const COPILOT_STREAM_STATES: readonly ["waiting_for_disclosure", "live", "ended"];
/** The state of the Copilot on a Call. */
declare const copilotStreamStateSchema: z37.ZodEnum<{
	ended: "ended";
	live: "live";
	waiting_for_disclosure: "waiting_for_disclosure";
}>;
/** Why the panel is quiet, for a Rep who wonders if it is broken; null when there is nothing to explain. */
declare const COPILOT_QUIET_REASONS: readonly ["not_enough_won_moments", "playbook_unavailable", "transcript_unavailable"];
/** Why the panel shows no cards. */
declare const copilotQuietReasonSchema: z37.ZodEnum<{
	not_enough_won_moments: "not_enough_won_moments";
	playbook_unavailable: "playbook_unavailable";
	transcript_unavailable: "transcript_unavailable";
}>;
/** Why the Transcript stopped: the speech-to-text failed or its stream could not be recovered. The Call itself goes on. */
declare const COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS: readonly ["speech_to_text_failed", "stream_dropped"];
/** `copilot.status`: the state of the Copilot on this Call, and why it is quiet. */
declare const copilotStatusDataSchema: z37.ZodObject<{
	callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
	state: z37.ZodEnum<{
		ended: "ended";
		live: "live";
		waiting_for_disclosure: "waiting_for_disclosure";
	}>;
	quietReason: z37.ZodNullable<z37.ZodEnum<{
		not_enough_won_moments: "not_enough_won_moments";
		playbook_unavailable: "playbook_unavailable";
		transcript_unavailable: "transcript_unavailable";
	}>>;
}, z37.core.$strict>;
/** `transcript.turn`: one final turn of the live Transcript, in order. The text is spoken words: untrusted data, never logged. */
declare const copilotTurnDataSchema: z37.ZodObject<{
	callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
	sequence: z37.ZodNumber;
	turn: z37.ZodObject<{
		speaker: z37.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		startMs: z37.ZodNumber;
		endMs: z37.ZodNumber;
		text: z37.ZodString;
	}, z37.core.$strict>;
}, z37.core.$strict>;
/** `transcript.unavailable`: the live Transcript stopped. The Call and its Recording are not affected. */
declare const copilotTranscriptUnavailableDataSchema: z37.ZodObject<{
	callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
	reason: z37.ZodEnum<{
		speech_to_text_failed: "speech_to_text_failed";
		stream_dropped: "stream_dropped";
	}>;
}, z37.core.$strict>;
/** `copilot.card` and `copilot.card_updated`: a card, whole, as it now stands. A card upgraded in place, rated, dismissed or pinned is sent again under its id. */
declare const copilotCardDataSchema: z37.ZodObject<{
	card: z37.ZodDiscriminatedUnion<[z37.ZodObject<{
		id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		sequence: z37.ZodNumber;
		evidence: z37.ZodObject<{
			moments: z37.ZodNumber;
			deals: z37.ZodNumber;
		}, z37.core.$strict>;
		citedMoments: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
		}, z37.core.$strict>>;
		quotes: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			prospect: z37.ZodString;
			repNext: z37.ZodString;
		}, z37.core.$strict>>;
		shownAt: z37.ZodISODateTime;
		rating: z37.ZodNullable<z37.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z37.ZodBoolean;
		pinned: z37.ZodBoolean;
		kind: z37.ZodLiteral<"similar_moment">;
	}, z37.core.$strict>, z37.ZodObject<{
		id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		sequence: z37.ZodNumber;
		evidence: z37.ZodObject<{
			moments: z37.ZodNumber;
			deals: z37.ZodNumber;
		}, z37.core.$strict>;
		citedMoments: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
		}, z37.core.$strict>>;
		quotes: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			prospect: z37.ZodString;
			repNext: z37.ZodString;
		}, z37.core.$strict>>;
		shownAt: z37.ZodISODateTime;
		rating: z37.ZodNullable<z37.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z37.ZodBoolean;
		pinned: z37.ZodBoolean;
		kind: z37.ZodLiteral<"objection">;
		objectionType: z37.ZodEnum<{
			authority: "authority";
			competitor: "competitor";
			need: "need";
			price: "price";
			timing: "timing";
			trust: "trust";
		}>;
		response: z37.ZodString;
	}, z37.core.$strict>, z37.ZodObject<{
		id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		sequence: z37.ZodNumber;
		evidence: z37.ZodObject<{
			moments: z37.ZodNumber;
			deals: z37.ZodNumber;
		}, z37.core.$strict>;
		citedMoments: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
		}, z37.core.$strict>>;
		quotes: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			prospect: z37.ZodString;
			repNext: z37.ZodString;
		}, z37.core.$strict>>;
		shownAt: z37.ZodISODateTime;
		rating: z37.ZodNullable<z37.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z37.ZodBoolean;
		pinned: z37.ZodBoolean;
		kind: z37.ZodLiteral<"next_step">;
		nextStep: z37.ZodString;
	}, z37.core.$strict>, z37.ZodObject<{
		id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		sequence: z37.ZodNumber;
		evidence: z37.ZodObject<{
			moments: z37.ZodNumber;
			deals: z37.ZodNumber;
		}, z37.core.$strict>;
		citedMoments: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
		}, z37.core.$strict>>;
		quotes: z37.ZodArray<z37.ZodObject<{
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			prospect: z37.ZodString;
			repNext: z37.ZodString;
		}, z37.core.$strict>>;
		shownAt: z37.ZodISODateTime;
		rating: z37.ZodNullable<z37.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z37.ZodBoolean;
		pinned: z37.ZodBoolean;
		kind: z37.ZodLiteral<"document">;
		source: z37.ZodObject<{
			documentId: z37.core.$ZodBranded<z37.ZodString, "doc", "out">;
			page: z37.ZodNullable<z37.ZodNumber>;
			passage: z37.ZodString;
		}, z37.core.$strict>;
	}, z37.core.$strict>], "kind">;
}, z37.core.$strict>;
/** The names of the events of the stream. */
declare const COPILOT_STREAM_EVENTS: readonly ["copilot.status", "transcript.turn", "transcript.unavailable", "copilot.card", "copilot.card_updated"];
/**
* One message of the Server-Sent Events stream of a Call, sent to the Rep's browser that holds the
* same token as every other call. The `event:` line is the name, `data:` the JSON of `data` and
* `id:` the id to resume from. The Transcript turns and the card text in a message are tenant text
* and model output, so UNTRUSTED DATA: shown as plain text, never as markup or instructions, never
* spoken into the Call and never logged. A stream carries no more than
* {@link MAX_COPILOT_CARDS_PER_CALL} cards.
*/
declare const copilotStreamMessageSchema: z37.ZodDiscriminatedUnion<[z37.ZodObject<{
	id: z37.ZodString;
	event: z37.ZodLiteral<"copilot.status">;
	data: z37.ZodObject<{
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		state: z37.ZodEnum<{
			ended: "ended";
			live: "live";
			waiting_for_disclosure: "waiting_for_disclosure";
		}>;
		quietReason: z37.ZodNullable<z37.ZodEnum<{
			not_enough_won_moments: "not_enough_won_moments";
			playbook_unavailable: "playbook_unavailable";
			transcript_unavailable: "transcript_unavailable";
		}>>;
	}, z37.core.$strict>;
}, z37.core.$strict>, z37.ZodObject<{
	id: z37.ZodString;
	event: z37.ZodLiteral<"transcript.turn">;
	data: z37.ZodObject<{
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		sequence: z37.ZodNumber;
		turn: z37.ZodObject<{
			speaker: z37.ZodEnum<{
				prospect: "prospect";
				rep: "rep";
			}>;
			startMs: z37.ZodNumber;
			endMs: z37.ZodNumber;
			text: z37.ZodString;
		}, z37.core.$strict>;
	}, z37.core.$strict>;
}, z37.core.$strict>, z37.ZodObject<{
	id: z37.ZodString;
	event: z37.ZodLiteral<"transcript.unavailable">;
	data: z37.ZodObject<{
		callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
		reason: z37.ZodEnum<{
			speech_to_text_failed: "speech_to_text_failed";
			stream_dropped: "stream_dropped";
		}>;
	}, z37.core.$strict>;
}, z37.core.$strict>, z37.ZodObject<{
	id: z37.ZodString;
	event: z37.ZodLiteral<"copilot.card">;
	data: z37.ZodObject<{
		card: z37.ZodDiscriminatedUnion<[z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"similar_moment">;
		}, z37.core.$strict>, z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"objection">;
			objectionType: z37.ZodEnum<{
				authority: "authority";
				competitor: "competitor";
				need: "need";
				price: "price";
				timing: "timing";
				trust: "trust";
			}>;
			response: z37.ZodString;
		}, z37.core.$strict>, z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"next_step">;
			nextStep: z37.ZodString;
		}, z37.core.$strict>, z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"document">;
			source: z37.ZodObject<{
				documentId: z37.core.$ZodBranded<z37.ZodString, "doc", "out">;
				page: z37.ZodNullable<z37.ZodNumber>;
				passage: z37.ZodString;
			}, z37.core.$strict>;
		}, z37.core.$strict>], "kind">;
	}, z37.core.$strict>;
}, z37.core.$strict>, z37.ZodObject<{
	id: z37.ZodString;
	event: z37.ZodLiteral<"copilot.card_updated">;
	data: z37.ZodObject<{
		card: z37.ZodDiscriminatedUnion<[z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"similar_moment">;
		}, z37.core.$strict>, z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"objection">;
			objectionType: z37.ZodEnum<{
				authority: "authority";
				competitor: "competitor";
				need: "need";
				price: "price";
				timing: "timing";
				trust: "trust";
			}>;
			response: z37.ZodString;
		}, z37.core.$strict>, z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"next_step">;
			nextStep: z37.ZodString;
		}, z37.core.$strict>, z37.ZodObject<{
			id: z37.core.$ZodBranded<z37.ZodString, "ccard", "out">;
			callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
			sequence: z37.ZodNumber;
			evidence: z37.ZodObject<{
				moments: z37.ZodNumber;
				deals: z37.ZodNumber;
			}, z37.core.$strict>;
			citedMoments: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
			}, z37.core.$strict>>;
			quotes: z37.ZodArray<z37.ZodObject<{
				callId: z37.core.$ZodBranded<z37.ZodString, "call", "out">;
				dealRecordId: z37.core.$ZodBranded<z37.ZodString, "deal", "out">;
				prospect: z37.ZodString;
				repNext: z37.ZodString;
			}, z37.core.$strict>>;
			shownAt: z37.ZodISODateTime;
			rating: z37.ZodNullable<z37.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z37.ZodBoolean;
			pinned: z37.ZodBoolean;
			kind: z37.ZodLiteral<"document">;
			source: z37.ZodObject<{
				documentId: z37.core.$ZodBranded<z37.ZodString, "doc", "out">;
				page: z37.ZodNullable<z37.ZodNumber>;
				passage: z37.ZodString;
			}, z37.core.$strict>;
		}, z37.core.$strict>], "kind">;
	}, z37.core.$strict>;
}, z37.core.$strict>], "event">;
/** One message of the stream of a Call. */
type CopilotStreamMessage = z37.infer<typeof copilotStreamMessageSchema>;
/** The name of an event of the stream. */
type CopilotStreamEventName = (typeof COPILOT_STREAM_EVENTS)[number];
/**
* Writes one message as an SSE frame (`id:`, `event:` and `data:` lines and a blank line). The
* message is parsed first and an invalid one throws, so a frame never carries an unbounded or
* malformed field. The data is one line of JSON, which cannot hold a raw line break, so text in a
* Transcript or card cannot end the frame or start another.
*/
declare function formatCopilotStreamFrame(input: CopilotStreamMessage): string;
import { z as z38 } from "zod";
/**
* The kinds of Copilot Card. `similar_moment` and `document` are built from retrieval alone, with
* no model call. `objection` and `next_step` are what a retrieval card is upgraded into, in place,
* by the model composer, which sees only the retrieved Moments.
*/
declare const COPILOT_CARD_KINDS: readonly ["similar_moment", "objection", "next_step", "document"];
/** The kind of a Copilot Card. */
declare const copilotCardKindSchema: z38.ZodEnum<{
	document: "document";
	next_step: "next_step";
	objection: "objection";
	similar_moment: "similar_moment";
}>;
/** The kind of a Copilot Card. */
type CopilotCardKind = z38.infer<typeof copilotCardKindSchema>;
/** The kinds a model composes (the rest are built from retrieval alone). */
declare const COPILOT_COMPOSED_KINDS: readonly ["objection", "next_step"];
/** The closed taxonomy of an objection a Copilot Card names. */
declare const COPILOT_OBJECTION_TYPES: readonly ["price", "timing", "competitor", "authority", "need", "trust"];
/** The type of an objection. */
declare const copilotObjectionTypeSchema: z38.ZodEnum<{
	authority: "authority";
	competitor: "competitor";
	need: "need";
	price: "price";
	timing: "timing";
	trust: "trust";
}>;
/** The type of an objection. */
type CopilotObjectionType = z38.infer<typeof copilotObjectionTypeSchema>;
/** How a Rep rated a card. A card with no rating has `null`. */
declare const COPILOT_RATINGS: readonly ["useful", "not_useful"];
/** How a Rep rated a card. */
declare const copilotRatingSchema: z38.ZodEnum<{
	not_useful: "not_useful";
	useful: "useful";
}>;
/** How a Rep rated a card. */
type CopilotRating = z38.infer<typeof copilotRatingSchema>;
/** The most cards one Call can show (spec M13). */
declare const MAX_COPILOT_CARDS_PER_CALL = 60;
/** The most Moments one card cites, and the most quotes it shows: the Playbook search the card is built from returns at most five. */
declare const MAX_COPILOT_CITED_MOMENTS = 5;
/** The most characters of the model-composed text of a card (an objection response or a next step). */
declare const MAX_COPILOT_CARD_TEXT_LENGTH = 600;
/** The most characters of one quote of a Moment, the same cap the Playbook search puts on its text. */
declare const MAX_COPILOT_QUOTE_LENGTH = 512;
/**
* Builds a schema for card text that is bounded in code points, well-formed, non-blank and free of
* control and bidirectional characters (newlines included). Such text is model output or
* the Organization's own Transcript text. It is untrusted data: the portal shows it as plain text,
* never as markup and never as an instruction to follow, and it is never spoken into the Call.
* @param max the most code points
*/
declare function copilotTextSchema(max: number): z38.ZodString;
/** The model-composed text of a card: untrusted model output, at most {@link MAX_COPILOT_CARD_TEXT_LENGTH} characters. */
declare const copilotCardTextSchema: z38.ZodString;
/** One quote of a Moment: what the Prospect said or what the Rep said next. Tenant Transcript text, untrusted, never logged. */
declare const copilotQuoteTextSchema: z38.ZodString;
/**
* A Moment a card cites. The Playbook gives a Moment no id of its own yet; its search names one by
* the opaque Call and Deal record it comes from, and so does a citation. Both ids already exist in
* the contract and neither carries the customer's own Deal identifier.
*/
declare const copilotMomentRefSchema: z38.ZodObject<{
	callId: z38.core.$ZodBranded<z38.ZodString, "call", "out">;
	dealRecordId: z38.core.$ZodBranded<z38.ZodString, "deal", "out">;
}, z38.core.$strict>;
/** A Moment a card cites. */
type CopilotMomentRef = z38.infer<typeof copilotMomentRefSchema>;
/** The Evidence behind a card: the similar Moments and the distinct won Deals among them. At least one of each, and never more Deals than Moments. */
declare const copilotEvidenceSchema: z38.ZodObject<{
	moments: z38.ZodNumber;
	deals: z38.ZodNumber;
}, z38.core.$strict>;
/** The Evidence behind a card. */
type CopilotEvidence = z38.infer<typeof copilotEvidenceSchema>;
/** The key of a Moment reference, to compare two. */
declare const copilotMomentKey: (ref: CopilotMomentRef) => string;
import { z as z39 } from "zod";
/** The internal calls, by name. */
type InternalCallName = "createOrganization" | "acceptInvitation" | "membership" | "updateMemberProfile" | "abandonOrganization";
/**
* The complete list of domain error codes each internal call may return, for core's tests to
* assert against. Common codes (`auth.*`, `request.*`, `server.*`) can come from any call and are
* not listed. Accepting an Invitation never returns an Organization status code, so a suspended or
* deleted Organization is indistinguishable from an unknown token. The membership lookup returns
* no domain error: it answers `found: false`. A profile change for a user with no membership is
* `member.not_found`, which the caller treats as nothing to do. Abandoning an Organization returns
* only `organization.not_abandonable`, for a live Organization that fails the guard; it has no
* not-found code (see `internalAbandonOrganizationRequestSchema`).
*/
declare const INTERNAL_CALL_ERRORS: Readonly<Record<InternalCallName, readonly CoreErrorCode[]>>;
/**
* Internal: `POST /internal/organizations`, the body of a sign-up that creates an Organization;
* the user becomes its Owner. `email` and `name` are the person's, copied onto the Membership for
* the member list (the auth service holds them; see `memberSchema`): `name` is the display name
* auth composes from the first and last names, or `null` when the person gave neither. Both are
* optional only so a `0.5.0` caller, which sends neither, still parses and core can deploy before
* auth sends them; each becomes required once auth sends them. Core returns only
* `membership.already_member`.
*/
declare const internalCreateOrganizationRequestSchema: z39.ZodObject<{
	userId: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
	organizationName: z39.ZodPipe<z39.ZodString, z39.ZodString>;
	email: z39.ZodOptional<z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>>;
	name: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
}, z39.core.$strict>;
/** Internal: the body of a sign-up that creates an Organization. */
type InternalCreateOrganizationRequest = z39.infer<typeof internalCreateOrganizationRequestSchema>;
/** Internal: the answer to creating an Organization at sign-up; the role is always `owner`. */
declare const internalCreateOrganizationResponseSchema: z39.ZodObject<{
	organizationId: z39.core.$ZodBranded<z39.ZodString, "org", "out">;
	role: z39.ZodLiteral<"owner">;
}, z39.core.$strip>;
/** Internal: the answer to creating an Organization at sign-up. */
type InternalCreateOrganizationResponse = z39.infer<typeof internalCreateOrganizationResponseSchema>;
/**
* Internal: `POST /internal/invitations/accept`, the body of a sign-up that accepts an Invitation
* with its raw token and the verified address. `name` is the person's display name as auth
* composes it, or `null` when the person gave none; the address is copied onto the Membership
* too. `name` is optional only so a `0.5.0` caller, which sends none, still parses and core can
* deploy before auth sends it; it becomes required once auth sends it. Core compares the address,
* folded, with the Invitation's and answers `invitation.invalid` on a mismatch, like an unknown,
* used, revoked or expired token. Core returns only `invitation.invalid` or
* `membership.already_member`, never an Organization status.
*/
declare const internalAcceptInvitationRequestSchema: z39.ZodObject<{
	userId: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
	email: z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>;
	name: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
	invitationToken: z39.ZodString;
}, z39.core.$strict>;
/** Internal: the body of a sign-up that accepts an Invitation. */
type InternalAcceptInvitationRequest = z39.infer<typeof internalAcceptInvitationRequestSchema>;
/** Internal: the answer to accepting an Invitation; the role is the one offered, never `owner`. */
declare const internalAcceptInvitationResponseSchema: z39.ZodObject<{
	organizationId: z39.core.$ZodBranded<z39.ZodString, "org", "out">;
	role: z39.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
}, z39.core.$strip>;
/** Internal: the answer to accepting an Invitation. */
type InternalAcceptInvitationResponse = z39.infer<typeof internalAcceptInvitationResponseSchema>;
/** Internal: the request for the membership of one user, which the token hook makes before issuing a token. */
declare const internalMembershipRequestSchema: z39.ZodObject<{
	userId: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
}, z39.core.$strict>;
/** Internal: the request for the membership of one user. */
type InternalMembershipRequest = z39.infer<typeof internalMembershipRequestSchema>;
/**
* Internal: the membership of a user, or `{ found: false }` for a user with none. A user with an
* Organization that is suspended or deleted is found: the token hook decides what to do with the
* status. The lookup returns no domain error.
*/
declare const internalMembershipResponseSchema: z39.ZodDiscriminatedUnion<[z39.ZodObject<{
	found: z39.ZodLiteral<true>;
	organizationId: z39.core.$ZodBranded<z39.ZodString, "org", "out">;
	role: z39.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	organizationStatus: z39.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
}, z39.core.$strip>, z39.ZodObject<{
	found: z39.ZodLiteral<false>;
}, z39.core.$strip>], "found">;
/** Internal: the membership of a user, or none. */
type InternalMembershipResponse = z39.infer<typeof internalMembershipResponseSchema>;
/** Internal: the path parameters of a profile change; the user is in the path, not the body. */
declare const internalUpdateMemberProfileParamsSchema: z39.ZodObject<{
	userId: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
}, z39.core.$strict>;
/** Internal: the path parameters of a profile change. */
type InternalUpdateMemberProfileParams = z39.infer<typeof internalUpdateMemberProfileParamsSchema>;
/**
* Internal: `PATCH /internal/members/{userId}`, the body of the call auth makes when a person's
* name or email changes, to bring core's copy up to date. Each field is the new value, never a
* delta, so the call is idempotent: a repeat leaves the same state and answers the same. At least
* one field is required. `name: null` clears the name; the address cannot be cleared. It applies
* to the person's Membership in whichever Organization holds it, and answers `member.not_found`
* for a user with none, which the caller treats as nothing to do. It carries an `Idempotency-Key`
* header. The auth service has no route that changes a name or an address yet; the call is
* defined ahead of it.
*/
declare const internalUpdateMemberProfileRequestSchema: z39.ZodObject<{
	email: z39.ZodOptional<z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>>;
	name: z39.ZodOptional<z39.ZodNullable<z39.ZodPipe<z39.ZodString, z39.ZodString>>>;
}, z39.core.$strict>;
/** Internal: the body of a profile change. */
type InternalUpdateMemberProfileRequest = z39.infer<typeof internalUpdateMemberProfileRequestSchema>;
/** Internal: the answer to a profile change: the address and name core now holds for the user. */
declare const internalUpdateMemberProfileResponseSchema: z39.ZodObject<{
	userId: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
	email: z39.ZodPipe<z39.ZodPipe<z39.ZodString, z39.ZodTransform<string, string>>, z39.ZodString>;
	name: z39.ZodNullable<z39.ZodString>;
}, z39.core.$strip>;
/** Internal: the answer to a profile change. */
type InternalUpdateMemberProfileResponse = z39.infer<typeof internalUpdateMemberProfileResponseSchema>;
/** The hours after creation during which an Organization can be abandoned. */
declare const ABANDON_MAX_AGE_HOURS = 24;
/** Internal: the path parameters of an abandon; the Organization is named in the path. */
declare const internalAbandonOrganizationParamsSchema: z39.ZodObject<{
	organizationId: z39.core.$ZodBranded<z39.ZodString, "org", "out">;
}, z39.core.$strict>;
/** Internal: the path parameters of an abandon. */
type InternalAbandonOrganizationParams = z39.infer<typeof internalAbandonOrganizationParamsSchema>;
/**
* Internal: `POST /internal/organizations/{organizationId}/abandon`, the body of the call auth
* makes when the account write fails after core created the Organization, and from its sweep of
* abandoned sign-ups. It carries an `Idempotency-Key` header.
*
* The call is defined by its end state. It answers success,
* `{ organizationId, status: 'deleted' }`, whenever no live Organization with that id exists when
* the call returns: abandoned by this call, abandoned or deleted earlier by anyone, or never
* created. A repeat with the same key, a new key or a different `userId` after the Organization
* is gone all answer success, so the caller must not read success as "this call deleted it". Only
* a live Organization that fails the guard answers `organization.not_abandonable`: it has another
* member, its one member is not `userId`, or it was created `ABANDON_MAX_AGE_HOURS` hours ago or
* more. Otherwise core marks the Organization `deleted` and frees the user id.
* Success means no live Organization remains, not that the user id is free yet: an Organization
* deleted earlier may still hold its members until the deletion job empties it, so auth must not
* depend on the id being free immediately.
*
* The holder of the internal token can tell a live Organization id from any other id (409 against
* 200); the single refusal code hides only which guard condition failed. Needing the Organization
* id and the user id together means a guess cannot abandon an Organization, not that an id cannot
* be probed.
*/
declare const internalAbandonOrganizationRequestSchema: z39.ZodObject<{
	userId: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
}, z39.core.$strict>;
/** Internal: the body of an abandon. */
type InternalAbandonOrganizationRequest = z39.infer<typeof internalAbandonOrganizationRequestSchema>;
/**
* Internal: the answer to an abandon: always `deleted`, whether this call, an earlier one or
* nobody ever created the Organization. A retry cannot be told from the original.
*/
declare const internalAbandonOrganizationResponseSchema: z39.ZodObject<{
	organizationId: z39.core.$ZodBranded<z39.ZodString, "org", "out">;
	status: z39.ZodLiteral<"deleted">;
}, z39.core.$strip>;
/** Internal: the answer to an abandon. */
type InternalAbandonOrganizationResponse = z39.infer<typeof internalAbandonOrganizationResponseSchema>;
import { z as z40 } from "zod";
/**
* An Invitation as core returns it. The raw token is not here and never will be: it is delivered
* by email only, so a response cannot leak it.
*/
declare const invitationSchema: z40.ZodObject<{
	id: z40.core.$ZodBranded<z40.ZodString, "inv", "out">;
	email: z40.ZodPipe<z40.ZodPipe<z40.ZodString, z40.ZodTransform<string, string>>, z40.ZodString>;
	role: z40.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z40.ZodNullable<z40.core.$ZodBranded<z40.ZodString, "team", "out">>;
	state: z40.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>;
	invitedByUserId: z40.core.$ZodBranded<z40.ZodString, "usr", "out">;
	expiresAt: z40.ZodISODateTime;
	createdAt: z40.ZodISODateTime;
}, z40.core.$strip>;
/** An Invitation as core returns it. */
type Invitation = z40.infer<typeof invitationSchema>;
/**
* The body of a request to invite someone: an address and a role that is never `owner`. The call
* accepts an `Idempotency-Key` header (`idempotencyKeySchema`): a replay returns the original
* Invitation instead of `invitation.already_pending`, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`.
*/
declare const createInvitationRequestSchema: z40.ZodObject<{
	email: z40.ZodPipe<z40.ZodPipe<z40.ZodString, z40.ZodTransform<string, string>>, z40.ZodString>;
	role: z40.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z40.ZodOptional<z40.core.$ZodBranded<z40.ZodString, "team", "out">>;
}, z40.core.$strict>;
/**
* Every error code `POST /v1/invitations` may answer with. `invitation.already_pending` and
* `invitation.already_member` (409) are about the address; `invitation.pending_limit` (409, 1,000
* pending) and `invitation.daily_limit` (429, 2,000 in 24 hours, with `details.retryAfter` and a
* `Retry-After` header) are the Organization-wide limits; `rate.limited` is only the per-request
* rate. `team.not_found` is a `teamId` that is not a Team of this Organization.
*/
declare const CREATE_INVITATION_ERROR_CODES: readonly ["invitation.already_pending", "invitation.already_member", "invitation.pending_limit", "invitation.daily_limit", "team.not_found", "request.invalid", "request.idempotency_key_reused", "request.idempotency_in_progress", "auth.unauthenticated", "auth.token_expired", "auth.token_invalid", "auth.forbidden", "auth.unavailable", "organization.suspended", "organization.deleted", "rate.limited"];
/** The body of a request to invite someone. */
type CreateInvitationRequest = z40.infer<typeof createInvitationRequestSchema>;
/**
* The query parameters of a request to list Invitations: a page, and the `state` to list, which
* is `pending` unless asked otherwise. An unknown parameter is rejected.
*/
declare const listInvitationsQuerySchema: z40.ZodObject<{
	cursor: z40.ZodOptional<z40.ZodString>;
	limit: z40.ZodDefault<z40.ZodPipe<z40.ZodPipe<z40.ZodUnion<readonly [z40.ZodNumber, z40.ZodString]>, z40.ZodTransform<number, string | number>>, z40.ZodNumber>>;
	state: z40.ZodDefault<z40.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>>;
}, z40.core.$strict>;
/** The query parameters of a request to list Invitations. */
type ListInvitationsQuery = z40.infer<typeof listInvitationsQuerySchema>;
/** One page of Invitations. */
declare const listInvitationsResponseSchema: z40.ZodObject<{
	items: z40.ZodArray<z40.ZodObject<{
		id: z40.core.$ZodBranded<z40.ZodString, "inv", "out">;
		email: z40.ZodPipe<z40.ZodPipe<z40.ZodString, z40.ZodTransform<string, string>>, z40.ZodString>;
		role: z40.ZodEnum<{
			admin: "admin";
			manager: "manager";
			rep: "rep";
		}>;
		teamId: z40.ZodNullable<z40.core.$ZodBranded<z40.ZodString, "team", "out">>;
		state: z40.ZodEnum<{
			accepted: "accepted";
			pending: "pending";
			revoked: "revoked";
		}>;
		invitedByUserId: z40.core.$ZodBranded<z40.ZodString, "usr", "out">;
		expiresAt: z40.ZodISODateTime;
		createdAt: z40.ZodISODateTime;
	}, z40.core.$strip>>;
	nextCursor: z40.ZodNullable<z40.ZodString>;
}, z40.core.$strip>;
/** One page of Invitations. */
type ListInvitationsResponse = z40.infer<typeof listInvitationsResponseSchema>;
/** The path parameters of a request about one Invitation, such as revoking it. */
declare const invitationParamsSchema: z40.ZodObject<{
	invitationId: z40.core.$ZodBranded<z40.ZodString, "inv", "out">;
}, z40.core.$strict>;
/** The path parameters of a request about one Invitation. */
type InvitationParams = z40.infer<typeof invitationParamsSchema>;
import { z as z41 } from "zod";
/**
* A member of the caller's Organization: a user's Membership and the role it holds. `email` and
* `name` are core's copy of what the auth service holds for the person: given at sign-up and kept
* current by the internal profile change. `name` is the display name auth composes from the first
* and last names, and is `null` when the person gave neither at sign-up (both are optional
* there). Neither is a search key or a filter in this version.
*/
declare const memberSchema: z41.ZodObject<{
	id: z41.core.$ZodBranded<z41.ZodString, "mem", "out">;
	userId: z41.core.$ZodBranded<z41.ZodString, "usr", "out">;
	email: z41.ZodPipe<z41.ZodPipe<z41.ZodString, z41.ZodTransform<string, string>>, z41.ZodString>;
	name: z41.ZodNullable<z41.ZodString>;
	role: z41.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	createdAt: z41.ZodISODateTime;
	updatedAt: z41.ZodISODateTime;
}, z41.core.$strip>;
/** A member of an Organization. */
type Member = z41.infer<typeof memberSchema>;
/**
* The least privileged role that may list the Organization's members (`GET /v1/members`): Owner,
* Admin and Manager (see `roleAtLeast`). Anyone who sees member emails needs at least this role.
*/
declare const LIST_MEMBERS_MIN_ROLE: "manager";
/** The query parameters of a request to list members: a cursor and a limit of at most the maximum page size. */
declare const listMembersQuerySchema: z41.ZodObject<{
	cursor: z41.ZodOptional<z41.ZodString>;
	limit: z41.ZodDefault<z41.ZodPipe<z41.ZodPipe<z41.ZodUnion<readonly [z41.ZodNumber, z41.ZodString]>, z41.ZodTransform<number, string | number>>, z41.ZodNumber>>;
}, z41.core.$strict>;
/** The query parameters of a request to list members. */
type ListMembersQuery = z41.infer<typeof listMembersQuerySchema>;
/** One page of members. */
declare const listMembersResponseSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		id: z41.core.$ZodBranded<z41.ZodString, "mem", "out">;
		userId: z41.core.$ZodBranded<z41.ZodString, "usr", "out">;
		email: z41.ZodPipe<z41.ZodPipe<z41.ZodString, z41.ZodTransform<string, string>>, z41.ZodString>;
		name: z41.ZodNullable<z41.ZodString>;
		role: z41.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z41.ZodISODateTime;
		updatedAt: z41.ZodISODateTime;
	}, z41.core.$strip>>;
	nextCursor: z41.ZodNullable<z41.ZodString>;
}, z41.core.$strip>;
/** One page of members. */
type ListMembersResponse = z41.infer<typeof listMembersResponseSchema>;
/** The path parameters of a request about one member. */
declare const memberParamsSchema: z41.ZodObject<{
	membershipId: z41.core.$ZodBranded<z41.ZodString, "mem", "out">;
}, z41.core.$strict>;
/** The path parameters of a request about one member. */
type MemberParams = z41.infer<typeof memberParamsSchema>;
/** The body of a request to change a member's role; promoting to `owner` is how ownership passes. */
declare const changeMemberRoleRequestSchema: z41.ZodObject<{
	role: z41.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
}, z41.core.$strict>;
/** The body of a request to change a member's role. */
type ChangeMemberRoleRequest = z41.infer<typeof changeMemberRoleRequestSchema>;
import { z as z42 } from "zod";
/** An Organization as core returns it, for both reading it and renaming it. */
declare const organizationSchema: z42.ZodObject<{
	id: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
	name: z42.ZodString;
	region: z42.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	status: z42.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
	createdAt: z42.ZodISODateTime;
	updatedAt: z42.ZodISODateTime;
}, z42.core.$strip>;
/** An Organization as core returns it. */
type Organization = z42.infer<typeof organizationSchema>;
/** The body of a request to rename the caller's Organization. */
declare const renameOrganizationRequestSchema: z42.ZodObject<{
	name: z42.ZodPipe<z42.ZodString, z42.ZodString>;
}, z42.core.$strict>;
/** The body of a request to rename the caller's Organization. */
type RenameOrganizationRequest = z42.infer<typeof renameOrganizationRequestSchema>;
import { z as z43 } from "zod";
/** A Team as core returns it. */
declare const teamSchema: z43.ZodObject<{
	id: z43.core.$ZodBranded<z43.ZodString, "team", "out">;
	name: z43.ZodString;
	createdAt: z43.ZodISODateTime;
	updatedAt: z43.ZodISODateTime;
}, z43.core.$strip>;
/** A Team as core returns it. */
type Team = z43.infer<typeof teamSchema>;
/**
* The body of a request to create a Team. The call accepts an `Idempotency-Key` header
* (`idempotencyKeySchema`): a replay returns the original Team, the same key with a different
* body is `request.idempotency_key_reused`, and the same key while the first request is still
* running is `request.idempotency_in_progress`.
*/
declare const createTeamRequestSchema: z43.ZodObject<{
	name: z43.ZodPipe<z43.ZodString, z43.ZodString>;
}, z43.core.$strict>;
/** The body of a request to create a Team. */
type CreateTeamRequest = z43.infer<typeof createTeamRequestSchema>;
/** The body of a request to rename a Team. */
declare const renameTeamRequestSchema: z43.ZodObject<{
	name: z43.ZodPipe<z43.ZodString, z43.ZodString>;
}, z43.core.$strict>;
/** The body of a request to rename a Team. */
type RenameTeamRequest = z43.infer<typeof renameTeamRequestSchema>;
/** The query parameters of a request to list Teams. */
declare const listTeamsQuerySchema: z43.ZodObject<{
	cursor: z43.ZodOptional<z43.ZodString>;
	limit: z43.ZodDefault<z43.ZodPipe<z43.ZodPipe<z43.ZodUnion<readonly [z43.ZodNumber, z43.ZodString]>, z43.ZodTransform<number, string | number>>, z43.ZodNumber>>;
}, z43.core.$strict>;
/** The query parameters of a request to list Teams. */
type ListTeamsQuery = z43.infer<typeof listTeamsQuerySchema>;
/** One page of Teams. */
declare const listTeamsResponseSchema: z43.ZodObject<{
	items: z43.ZodArray<z43.ZodObject<{
		id: z43.core.$ZodBranded<z43.ZodString, "team", "out">;
		name: z43.ZodString;
		createdAt: z43.ZodISODateTime;
		updatedAt: z43.ZodISODateTime;
	}, z43.core.$strip>>;
	nextCursor: z43.ZodNullable<z43.ZodString>;
}, z43.core.$strip>;
/** One page of Teams. */
type ListTeamsResponse = z43.infer<typeof listTeamsResponseSchema>;
/** The path parameters of a request about one Team, such as renaming or deleting it. */
declare const teamParamsSchema: z43.ZodObject<{
	teamId: z43.core.$ZodBranded<z43.ZodString, "team", "out">;
}, z43.core.$strict>;
/** The path parameters of a request about one Team. */
type TeamParams = z43.infer<typeof teamParamsSchema>;
/** The body of a request to add a member to a Team. */
declare const addTeamMemberRequestSchema: z43.ZodObject<{
	membershipId: z43.core.$ZodBranded<z43.ZodString, "mem", "out">;
}, z43.core.$strict>;
/** The body of a request to add a member to a Team. */
type AddTeamMemberRequest = z43.infer<typeof addTeamMemberRequestSchema>;
/** A member's place in a Team, as core returns it after adding one. */
declare const teamMemberSchema: z43.ZodObject<{
	teamId: z43.core.$ZodBranded<z43.ZodString, "team", "out">;
	membershipId: z43.core.$ZodBranded<z43.ZodString, "mem", "out">;
	createdAt: z43.ZodISODateTime;
}, z43.core.$strip>;
/** A member's place in a Team. */
type TeamMember = z43.infer<typeof teamMemberSchema>;
/** The path parameters of a request to remove a member from a Team. */
declare const teamMemberParamsSchema: z43.ZodObject<{
	teamId: z43.core.$ZodBranded<z43.ZodString, "team", "out">;
	membershipId: z43.core.$ZodBranded<z43.ZodString, "mem", "out">;
}, z43.core.$strict>;
/** The path parameters of a request to remove a member from a Team. */
type TeamMemberParams = z43.infer<typeof teamMemberParamsSchema>;
/** The query parameters of a request to list a Team's members: a cursor and a limit of at most the maximum page size. */
declare const listTeamMembersQuerySchema: z43.ZodObject<{
	cursor: z43.ZodOptional<z43.ZodString>;
	limit: z43.ZodDefault<z43.ZodPipe<z43.ZodPipe<z43.ZodUnion<readonly [z43.ZodNumber, z43.ZodString]>, z43.ZodTransform<number, string | number>>, z43.ZodNumber>>;
}, z43.core.$strict>;
/** The query parameters of a request to list a Team's members. */
type ListTeamMembersQuery = z43.infer<typeof listTeamMembersQuerySchema>;
/**
* One page of a Team's members, for `GET /v1/teams/{teamId}/members` (path parameters
* `teamParamsSchema`). Each item is a member exactly as the Organization's members list returns it.
*/
declare const listTeamMembersResponseSchema: z43.ZodObject<{
	items: z43.ZodArray<z43.ZodObject<{
		id: z43.core.$ZodBranded<z43.ZodString, "mem", "out">;
		userId: z43.core.$ZodBranded<z43.ZodString, "usr", "out">;
		email: z43.ZodPipe<z43.ZodPipe<z43.ZodString, z43.ZodTransform<string, string>>, z43.ZodString>;
		name: z43.ZodNullable<z43.ZodString>;
		role: z43.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z43.ZodISODateTime;
		updatedAt: z43.ZodISODateTime;
	}, z43.core.$strip>>;
	nextCursor: z43.ZodNullable<z43.ZodString>;
}, z43.core.$strip>;
/** One page of a Team's members. */
type ListTeamMembersResponse = z43.infer<typeof listTeamMembersResponseSchema>;
/**
* The least privileged role that may list a Team's members: exactly `LIST_MEMBERS_MIN_ROLE`, the
* role that lists the Organization's members, because each item carries the member's email and
* name. It is not loosened to the roles that may only view a Team.
*/
declare const LIST_TEAM_MEMBERS_MIN_ROLE: "manager";
/**
* Every error code `GET /v1/teams/{teamId}/members` may answer with. Who may call it is
* `LIST_TEAM_MEMBERS_MIN_ROLE`; a role that is not allowed is `auth.forbidden`. A Team in another
* Organization is `team.not_found`.
*/
declare const LIST_TEAM_MEMBERS_ERROR_CODES: readonly ["team.not_found", "request.invalid", "auth.unauthenticated", "auth.token_expired", "auth.token_invalid", "auth.forbidden", "auth.unavailable", "organization.suspended", "organization.deleted", "rate.limited"];
import { z as z44 } from "zod";
/** The longest Organization or Team name, in characters; the same bound as the database check. */
declare const MAX_NAME_LENGTH = 200;
/**
* An Organization's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no
* lone surrogate) and no control characters. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const organizationNameSchema: z44.ZodPipe<z44.ZodString, z44.ZodString>;
/**
* A Team's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no lone
* surrogate) and no control characters. Zero-width and direction-override characters are allowed,
* so display code must treat a name as untrusted text.
*/
declare const teamNameSchema: z44.ZodPipe<z44.ZodString, z44.ZodString>;
/**
* The longest name of a person in a request, in characters: a first and a last name of 100 each
* and the space between. The database column for a member's name must allow at least this many
* characters after trimming, which is more than the 200 of Organization and Team names.
*/
declare const MAX_PERSON_NAME_LENGTH = 201;
/**
* A person's display name in a request, as auth composes it from the first and last names it
* holds (each at most 100 characters, joined by one space): trimmed, then 1 to 201 characters,
* well-formed UTF-16 and no control characters. A person with no name is `null` where the
* request allows it, never an empty string. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const personNameSchema: z44.ZodPipe<z44.ZodString, z44.ZodString>;
/**
* A name as a response carries it: any 1 to 1000 character string. The database bounds the length
* of the name after trimming spaces, so a stored name may carry surrounding spaces and run past
* 200; the response form is loose enough for anything the database allows. Core writes only the
* trimmed output of the request schemas. Display code must treat a name as untrusted text.
*/
declare const storedNameSchema: z44.ZodString;
/** The states an Invitation is in; "expired" is not a state, it is read from `expiresAt`. */
declare const INVITATION_STATES: readonly ["pending", "accepted", "revoked"];
/** The state of an Invitation. */
declare const invitationStateSchema: z44.ZodEnum<{
	accepted: "accepted";
	pending: "pending";
	revoked: "revoked";
}>;
/** The state of an Invitation. */
type InvitationState = z44.infer<typeof invitationStateSchema>;
/** A point in time as an ISO 8601 string with an offset, as every response carries it. */
declare const timestampSchema: z44.ZodISODateTime;
/**
* The raw token of an Invitation: 22 to 256 URL-safe characters (128 bits or more). It exists in
* the email sent to the invitee and in the sign-up call to core, never in a response.
*/
declare const invitationTokenSchema: z44.ZodString;
/**
* The `details` of an error answered with a `Retry-After` header: how many whole seconds to wait,
* the same number as the header. Used by `invitation.daily_limit`.
*/
declare const retryAfterDetailsSchema: z44.ZodObject<{
	retryAfter: z44.ZodNumber;
}, z44.core.$strict>;
/** The `details` of an error answered with a `Retry-After` header. */
type RetryAfterDetails = z44.infer<typeof retryAfterDetailsSchema>;
/**
* The header that carries an idempotency key on a call that has effects. Every public POST accepts
* it too: a replay returns the original result, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`, answered with `details.retryAfter` in seconds and a
* `Retry-After` header, as a rate-limited call is.
*/
declare const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
/** The value of the {@link IDEMPOTENCY_KEY_HEADER} header: 16 to 128 characters from `A-Za-z0-9_.:-`, such as a UUID. */
declare const idempotencyKeySchema: z44.ZodString;
/** An idempotency key. */
type IdempotencyKey = z44.infer<typeof idempotencyKeySchema>;
import { z as z45 } from "zod";
/** The longest email address stored, in characters; the same bound as the database check. */
declare const MAX_EMAIL_LENGTH = 320;
/**
* Lower-cases the ASCII letters A to Z and nothing else, so the result does not depend on the
* locale. `toLowerCase()` is wrong here: it also folds letters such as `É`, and the database does
* not. Use this wherever an email or a Team name is compared or stored.
*/
declare function foldAscii(text: string): string;
/**
* An email address, folded to lower case (ASCII letters only) and checked with the rule the
* database enforces: 3 to 320 characters, exactly one `@` that is neither first nor last, and
* every character printable ASCII (`!` to `~`), so whitespace, control characters, zero-width and
* no-break spaces, bidirectional overrides and a fullwidth `@` are all refused. An
* internationalised domain is stored in its ASCII (A-label, punycode) form: the service converts
* it before validating, and this schema does not convert. It is a backstop, not an address
* parser; a verified address comes from the auth service.
*/
declare const emailSchema: z45.ZodPipe<z45.ZodPipe<z45.ZodString, z45.ZodTransform<string, string>>, z45.ZodString>;
/** An email address, folded to lower case. */
type Email = z45.output<typeof emailSchema>;
import { z as z46 } from "zod";
/** An event type in `area.event_name` or `area.subject.event_name` form, such as `team.created` or `voice.call.started`. */
declare const eventTypeSchema: z46.ZodString;
/** An event type. */
type EventType = z46.infer<typeof eventTypeSchema>;
/** The envelope every event shares, wrapping a payload validated by `dataSchema`. */
declare function eventEnvelopeSchema<D extends z46.ZodType>(dataSchema: D): z46.ZodObject<{
	id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
	type: z46.ZodString;
	version: z46.ZodNumber;
	occurredAt: z46.ZodISODateTime;
	organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
	region: z46.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	data: D;
}, z46.core.$strip>;
/** Declares one event type at one version; its schema accepts only that type and version. */
declare function defineEvent<
	const T extends string,
	const V extends number,
	D extends z46.ZodType
>(type: T, version: V, dataSchema: D): {
	type: T;
	version: V;
	schema: z46.ZodObject<{
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	}, z46.core.$strip>;
	/** Parses an envelope of this type and version; throws a ZodError for anything else. */
	parse: (input: unknown) => ({
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z46.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z46.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never;
	/** Parses without throwing. Queue consumers use this, so a malformed message is a result to handle, not an exception to retry. */
	safeParse: (input: unknown) => z46.ZodSafeParseResult<({
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z46.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z46.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z46.core.$ZodBranded<z46.ZodString, "evt", "out">;
		occurredAt: z46.ZodISODateTime;
		organizationId: z46.core.$ZodBranded<z46.ZodString, "org", "out">;
		region: z46.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z46.ZodLiteral<T>;
		version: z46.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never>;
};
import { z as z47 } from "zod";
/** An id string branded with its prefix, so ids of different kinds cannot be mixed up. */
type Id<Prefix extends string> = string & z47.core.$brand<Prefix>;
/** An id for one prefix: `<prefix>_<32 lowercase hex characters>`, branded with the prefix. */
declare function idSchema<const Prefix extends string>(prefix: Prefix): PropertyKey extends Prefix ? z47.ZodString : z47.core.$ZodBranded<z47.ZodString, Prefix, "out">;
/** The id of an Organization (`org_…`). */
declare const organizationIdSchema: z47.core.$ZodBranded<z47.ZodString, "org", "out">;
/** The id of a user (`usr_…`). */
declare const userIdSchema: z47.core.$ZodBranded<z47.ZodString, "usr", "out">;
/** The id of a membership of a user in an Organization (`mem_…`). */
declare const membershipIdSchema: z47.core.$ZodBranded<z47.ZodString, "mem", "out">;
/** The id of a Team (`team_…`). */
declare const teamIdSchema: z47.core.$ZodBranded<z47.ZodString, "team", "out">;
/** The id of an Invitation to join an Organization (`inv_…`). */
declare const invitationIdSchema: z47.core.$ZodBranded<z47.ZodString, "inv", "out">;
/** The id of a Prospect (`prs_…`). */
declare const prospectIdSchema: z47.core.$ZodBranded<z47.ZodString, "prs", "out">;
/** The id of a Prospect Company (`pco_…`). */
declare const prospectCompanyIdSchema: z47.core.$ZodBranded<z47.ZodString, "pco", "out">;
/** The id of a Prospect import (`pimp_…`). */
declare const prospectImportIdSchema: z47.core.$ZodBranded<z47.ZodString, "pimp", "out">;
/** The id of a Prospect merge record (`pmrg_…`). */
declare const prospectMergeIdSchema: z47.core.$ZodBranded<z47.ZodString, "pmrg", "out">;
/** The id of a consent event in the ledger (`cev_…`). */
declare const consentEventIdSchema: z47.core.$ZodBranded<z47.ZodString, "cev", "out">;
/** The id of a Consent Wording version (`cwd_…`). */
declare const consentWordingIdSchema: z47.core.$ZodBranded<z47.ZodString, "cwd", "out">;
/** The id of a Suppression entry (`sup_…`). */
declare const suppressionEntryIdSchema: z47.core.$ZodBranded<z47.ZodString, "sup", "out">;
/** The id of a hosted consent form (`cfm_…`). */
declare const consentFormIdSchema: z47.core.$ZodBranded<z47.ZodString, "cfm", "out">;
/** The id of one Contact Check, as its audit row is named (`chk_…`). */
declare const contactCheckIdSchema: z47.core.$ZodBranded<z47.ZodString, "chk", "out">;
/** The id of a Suppression import (`simp_…`). */
declare const suppressionImportIdSchema: z47.core.$ZodBranded<z47.ZodString, "simp", "out">;
/** The id of a Playbook document (`doc_…`). */
declare const documentIdSchema: z47.core.$ZodBranded<z47.ZodString, "doc", "out">;
/** The opaque id of a Deal record (`deal_…`), used in every URL path; the customer's own deal id never travels in a path. */
declare const dealRecordIdSchema: z47.core.$ZodBranded<z47.ZodString, "deal", "out">;
/** The id of a Call (`call_…`). */
declare const callIdSchema: z47.core.$ZodBranded<z47.ZodString, "call", "out">;
/** The id of a Copilot Card (`ccard_…`), one piece of advice shown to a Rep during a Call. */
declare const copilotCardIdSchema: z47.core.$ZodBranded<z47.ZodString, "ccard", "out">;
/** The id of a Line (`line_…`), a phone number an Organization uses to place and receive Calls. */
declare const lineIdSchema: z47.core.$ZodBranded<z47.ZodString, "line", "out">;
/** The id of a Deal import (`dimp_…`). */
declare const dealImportIdSchema: z47.core.$ZodBranded<z47.ZodString, "dimp", "out">;
/** The id of an event (`evt_…`). */
declare const eventIdSchema: z47.core.$ZodBranded<z47.ZodString, "evt", "out">;
/** The id of a request, for tracing (`req_…`). */
declare const requestIdSchema: z47.core.$ZodBranded<z47.ZodString, "req", "out">;
/** The id of a Demo Request (`dreq_…`), a Visitor's submitted wish to see Closeline. */
declare const demoRequestIdSchema: z47.core.$ZodBranded<z47.ZodString, "dreq", "out">;
/** The id of a Booking (`bkg_…`), a time reserved on a Rep's calendar for a Prospect. */
declare const bookingIdSchema: z47.core.$ZodBranded<z47.ZodString, "bkg", "out">;
/** The id of a Booking Type (`bkt_…`), a named kind of Booking with a length, buffers and mode. */
declare const bookingTypeIdSchema: z47.core.$ZodBranded<z47.ZodString, "bkt", "out">;
/** The id of a Routing Rule (`rrl_…`). */
declare const routingRuleIdSchema: z47.core.$ZodBranded<z47.ZodString, "rrl", "out">;
/** The id of a stored routing decision (`rdc_…`): which rule picked which Rep, and who was skipped. */
declare const routingDecisionIdSchema: z47.core.$ZodBranded<z47.ZodString, "rdc", "out">;
/** The id of an Inquiry (`inq_…`): a Prospect's request, through a form, a Chat or a Call, to talk to the Organization. */
declare const inquiryIdSchema: z47.core.$ZodBranded<z47.ZodString, "inq", "out">;
/** The id of a Qualification question (`qst_…`). */
declare const qualificationQuestionIdSchema: z47.core.$ZodBranded<z47.ZodString, "qst", "out">;
/** The id of a Chat (`cht_…`): a text conversation between a Prospect and the Inbound Agent on a website. */
declare const chatIdSchema: z47.core.$ZodBranded<z47.ZodString, "cht", "out">;
/** The id of a Handoff (`hof_…`): a live Call or Chat passed from the Inbound Agent to a Rep. */
declare const handoffIdSchema: z47.core.$ZodBranded<z47.ZodString, "hof", "out">;
/** The id of a text session an Admin uses to try the Inbound Agent before it speaks to anyone (`try_…`). */
declare const trySessionIdSchema: z47.core.$ZodBranded<z47.ZodString, "try", "out">;
/** The id of a Conversation (`cnv_…`): all Messages between one Prospect and an Organization on one channel. */
declare const conversationIdSchema: z47.core.$ZodBranded<z47.ZodString, "cnv", "out">;
/** The id of a Message (`msg_…`): one piece of text sent or received in a Conversation. */
declare const messageIdSchema: z47.core.$ZodBranded<z47.ZodString, "msg", "out">;
/** The id of a Draft (`drf_…`): text an Agent or a Rep wrote for a Conversation and not yet sent. */
declare const draftIdSchema: z47.core.$ZodBranded<z47.ZodString, "drf", "out">;
/** The id of an approval Decision (`dcs_…`): one recorded decision about a Draft or a Conversation. */
declare const decisionIdSchema: z47.core.$ZodBranded<z47.ZodString, "dcs", "out">;
/** The id of a Mailbox (`mbx_…`): an email account a Rep or Admin connected so the Outbound Agent can send from it. */
declare const mailboxIdSchema: z47.core.$ZodBranded<z47.ZodString, "mbx", "out">;
/** The id of a send decision record (`snd_…`): one attempt to send one Step of an Enrollment, sent or refused. */
declare const sendIdSchema: z47.core.$ZodBranded<z47.ZodString, "snd", "out">;
/** The id of a mail event (`mev_…`): a bounce, complaint, reply, out-of-office or unsubscribe seen on a Mailbox. */
declare const mailEventIdSchema: z47.core.$ZodBranded<z47.ZodString, "mev", "out">;
/** The id of a Campaign (`cpg_…`): a run of outreach to a set of Prospects. */
declare const campaignIdSchema: z47.core.$ZodBranded<z47.ZodString, "cpg", "out">;
/** The id of an Enrollment (`enr_…`): one Prospect's place in a Campaign's Sequence. */
declare const enrollmentIdSchema: z47.core.$ZodBranded<z47.ZodString, "enr", "out">;
/** The id of a Play (`ply_…`): a reusable Sequence for a stated goal, built in or proposed from won Deals. */
declare const playIdSchema: z47.core.$ZodBranded<z47.ZodString, "ply", "out">;
/** The id of an entry in an Enrollment's activity log (`eev_…`). */
declare const enrollmentEventIdSchema: z47.core.$ZodBranded<z47.ZodString, "eev", "out">;
/** The id of an Organization. */
type OrganizationId = z47.infer<typeof organizationIdSchema>;
/** The id of a user. */
type UserId = z47.infer<typeof userIdSchema>;
/** The id of a membership. */
type MembershipId = z47.infer<typeof membershipIdSchema>;
/** The id of a Team. */
type TeamId = z47.infer<typeof teamIdSchema>;
/** The id of an Invitation. */
type InvitationId = z47.infer<typeof invitationIdSchema>;
/** The id of a consent event. */
type ConsentEventId = z47.infer<typeof consentEventIdSchema>;
/** The id of a Consent Wording version. */
type ConsentWordingId = z47.infer<typeof consentWordingIdSchema>;
/** The id of a Suppression entry. */
type SuppressionEntryId = z47.infer<typeof suppressionEntryIdSchema>;
/** The id of a hosted consent form. */
type ConsentFormId = z47.infer<typeof consentFormIdSchema>;
/** The id of one Contact Check. */
type ContactCheckId = z47.infer<typeof contactCheckIdSchema>;
/** The id of a Suppression import. */
type SuppressionImportId = z47.infer<typeof suppressionImportIdSchema>;
/** The id of a Prospect. */
type ProspectId = z47.infer<typeof prospectIdSchema>;
/** The id of a Prospect Company. */
type ProspectCompanyId = z47.infer<typeof prospectCompanyIdSchema>;
/** The id of a Prospect import. */
type ProspectImportId = z47.infer<typeof prospectImportIdSchema>;
/** The id of a Prospect merge record. */
type ProspectMergeId = z47.infer<typeof prospectMergeIdSchema>;
/** The id of a Playbook document. */
type DocumentId = z47.infer<typeof documentIdSchema>;
/** The opaque id of a Deal record. */
type DealRecordId = z47.infer<typeof dealRecordIdSchema>;
/** The id of a Call. */
type CallId = z47.infer<typeof callIdSchema>;
/** The id of a Copilot Card. */
type CopilotCardId = z47.infer<typeof copilotCardIdSchema>;
/** The id of a Line. */
type LineId = z47.infer<typeof lineIdSchema>;
/** The id of a Deal import. */
type DealImportId = z47.infer<typeof dealImportIdSchema>;
/** The id of an event. */
type EventId = z47.infer<typeof eventIdSchema>;
/** The id of a request. */
type RequestId = z47.infer<typeof requestIdSchema>;
/** The id of a Demo Request. */
type DemoRequestId = z47.infer<typeof demoRequestIdSchema>;
/** The id of a Booking. */
type BookingId = z47.infer<typeof bookingIdSchema>;
/** The id of a Booking Type. */
type BookingTypeId = z47.infer<typeof bookingTypeIdSchema>;
/** The id of a Routing Rule. */
type RoutingRuleId = z47.infer<typeof routingRuleIdSchema>;
/** The id of a stored routing decision. */
type RoutingDecisionId = z47.infer<typeof routingDecisionIdSchema>;
/** The id of an Inquiry. */
type InquiryId = z47.infer<typeof inquiryIdSchema>;
/** The id of a Qualification question. */
type QualificationQuestionId = z47.infer<typeof qualificationQuestionIdSchema>;
/** The id of a Chat. */
type ChatId = z47.infer<typeof chatIdSchema>;
/** The id of a Handoff. */
type HandoffId = z47.infer<typeof handoffIdSchema>;
/** The id of a try-it session. */
type TrySessionId = z47.infer<typeof trySessionIdSchema>;
/** The id of a Mailbox. */
type MailboxId = z47.infer<typeof mailboxIdSchema>;
/** The id of a send decision record. */
type SendId = z47.infer<typeof sendIdSchema>;
/** The id of a mail event. */
type MailEventId = z47.infer<typeof mailEventIdSchema>;
/** The id of a Campaign. */
type CampaignId = z47.infer<typeof campaignIdSchema>;
/** The id of an Enrollment. */
type EnrollmentId = z47.infer<typeof enrollmentIdSchema>;
/** The id of a Play. */
type PlayId = z47.infer<typeof playIdSchema>;
/** The id of an entry in an Enrollment's activity log. */
type EnrollmentEventId = z47.infer<typeof enrollmentEventIdSchema>;
/** Turns a UUID (any case; 32 hex characters or the dashed 8-4-4-4-12 form) into an id with the given prefix; throws otherwise. */
declare function formatId<const Prefix extends string>(prefix: Prefix, uuid: string): Id<Prefix>;
/** The id of a Conversation. */
type ConversationId = z47.infer<typeof conversationIdSchema>;
/** The id of a Message. */
type MessageId = z47.infer<typeof messageIdSchema>;
/** The id of a Draft. */
type DraftId = z47.infer<typeof draftIdSchema>;
/** The id of an approval Decision. */
type DecisionId = z47.infer<typeof decisionIdSchema>;
import { z as z49 } from "zod";
import { z as z48 } from "zod";
/**
* The channels a Conversation runs on. SMS and WhatsApp are added here when their phases begin;
* until then a value outside this list is refused at the edge.
*/
declare const INBOX_CHANNELS: readonly ["email", "linkedin", "chat"];
/** A channel a Conversation runs on. */
declare const inboxChannelSchema: z48.ZodEnum<{
	chat: "chat";
	email: "email";
	linkedin: "linkedin";
}>;
/** A channel a Conversation runs on. */
type InboxChannel = z48.infer<typeof inboxChannelSchema>;
/** Who is answering a Conversation now: the Agent, or the Rep who took it over. */
declare const CONVERSATION_CONTROLLERS: readonly ["agent", "rep"];
/** Who is answering a Conversation now. */
declare const conversationControllerSchema: z48.ZodEnum<{
	agent: "agent";
	rep: "rep";
}>;
/** Who is answering a Conversation now. */
type ConversationController = z48.infer<typeof conversationControllerSchema>;
/**
* The states of a Conversation: `agent` (the Agent answers), `awaiting_approval` (a Draft waits for
* a person), `rep` (a Rep took over), `escalated` (it needs a person and has been routed) and
* `closed`.
*/
declare const CONVERSATION_STATES: readonly ["agent", "awaiting_approval", "rep", "escalated", "closed"];
/** The state of a Conversation. */
declare const conversationStateSchema: z48.ZodEnum<{
	agent: "agent";
	awaiting_approval: "awaiting_approval";
	closed: "closed";
	escalated: "escalated";
	rep: "rep";
}>;
/** The state of a Conversation. */
type ConversationState = z48.infer<typeof conversationStateSchema>;
/** Whether a Message came from the Prospect or went to them. */
declare const MESSAGE_DIRECTIONS: readonly ["inbound", "outbound"];
/** Whether a Message came from the Prospect or went to them. */
declare const messageDirectionSchema: z48.ZodEnum<{
	inbound: "inbound";
	outbound: "outbound";
}>;
/** Whether a Message came from the Prospect or went to them. */
type MessageDirection = z48.infer<typeof messageDirectionSchema>;
/** Who wrote a Message: the Prospect, an Agent or a Rep. */
declare const MESSAGE_AUTHOR_KINDS: readonly ["prospect", "agent", "rep"];
/** Who wrote a Message. */
declare const messageAuthorKindSchema: z48.ZodEnum<{
	agent: "agent";
	prospect: "prospect";
	rep: "rep";
}>;
/** Who wrote a Message. */
type MessageAuthorKind = z48.infer<typeof messageAuthorKindSchema>;
/**
* What an inbound Message means. The set is closed: a label outside it is refused by every schema
* here, and a classifier whose output is not in it records `other` (see {@link toReplyLabel}).
* `unsubscribe` and `bounce` also stop sends to the Prospect on that channel.
*/
declare const REPLY_LABELS: readonly ["positive", "question", "objection", "not_now", "wrong_person", "unsubscribe", "out_of_office", "bounce", "negative", "other"];
/** What an inbound Message means. */
declare const replyLabelSchema: z48.ZodEnum<{
	bounce: "bounce";
	negative: "negative";
	not_now: "not_now";
	objection: "objection";
	other: "other";
	out_of_office: "out_of_office";
	positive: "positive";
	question: "question";
	unsubscribe: "unsubscribe";
	wrong_person: "wrong_person";
}>;
/** What an inbound Message means. */
type ReplyLabel = z48.infer<typeof replyLabelSchema>;
/** Maps untrusted classifier output to a label: anything outside the closed set is `other`. */
declare function toReplyLabel(value: unknown): ReplyLabel;
/** The labels that stop further sends to the Prospect on the channel at once. */
declare const STOP_SENDING_LABELS: readonly ["unsubscribe"];
/** The labels that pause the sequence for the Prospect (a dead address or the wrong person). */
declare const PAUSE_SEQUENCE_LABELS: readonly ["bounce", "wrong_person"];
/** A confidence from 0 to 1. */
declare const confidenceSchema: z48.ZodNumber;
/** The longest Message body, in characters. */
declare const MAX_MESSAGE_BODY_LENGTH = 2e4;
/**
* The body of a Message or Draft: 1 to 20,000 characters, line breaks and tabs allowed, no other
* control character. It is the Prospect's or a model's text, so it is untrusted data for every
* consumer, and it is never logged, never put in an error and never in an event.
*/
declare const messageBodySchema: z48.ZodString;
/**
* The id a channel gives a Message (an email Message-ID, a LinkedIn message id): printable ASCII
* with no space, 1 to 255 characters. Core stores each (channel, provider id) once.
*/
declare const providerMessageIdSchema: z48.ZodString;
/** The longest note a person leaves with a decision, in characters. */
declare const MAX_DECISION_NOTE_LENGTH = 500;
/** A short note with a decision: 1 to 500 characters, line breaks and tabs allowed, no other control character. */
declare const decisionNoteSchema: z48.ZodString;
/** The longest sentence a Draft gives for its strategy, in characters. */
declare const MAX_STRATEGY_LENGTH = 300;
/** The most Sources a Draft may cite. */
declare const MAX_DRAFT_SOURCES = 10;
/** What Sources can be: a Moment of a won, lost or open Deal, or a chunk of a Playbook document. */
declare const DRAFT_SOURCE_KINDS: readonly ["moment", "document_chunk"];
/** What a Source can be. */
declare const draftSourceKindSchema: z48.ZodEnum<{
	document_chunk: "document_chunk";
	moment: "moment";
}>;
/** What a Source can be. */
type DraftSourceKind = z48.infer<typeof draftSourceKindSchema>;
/** The id of a Moment or document chunk in the Playbook: 1 to 128 characters from `A-Za-z0-9_.:-`. */
declare const sourceRefSchema: z48.ZodString;
/** The longest passage shown for a Source, in characters. */
declare const MAX_SOURCE_PASSAGE_LENGTH = 4e3;
/**
* Why a Draft waits for a person. These always hold, whatever the policy: `ungrounded`,
* `check_failed`, `escalated` and `first_message` (the first message to a Prospect). `policy` is
* the Organization's own approval policy asking for it.
*/
declare const DRAFT_HOLD_REASONS: readonly ["policy", "ungrounded", "check_failed", "escalated", "first_message"];
/** Why a Draft waits for a person. */
declare const draftHoldReasonSchema: z48.ZodEnum<{
	check_failed: "check_failed";
	escalated: "escalated";
	first_message: "first_message";
	policy: "policy";
	ungrounded: "ungrounded";
}>;
/** Why a Draft waits for a person. */
type DraftHoldReason = z48.infer<typeof draftHoldReasonSchema>;
/** The hold reasons no setting can turn off. */
declare const ALWAYS_HELD_REASONS: readonly ["ungrounded", "check_failed", "escalated", "first_message"];
/** The states of a Draft. */
declare const DRAFT_STATUSES: readonly ["pending", "approved", "rejected", "sent", "superseded", "void"];
/** The state of a Draft. */
declare const draftStatusSchema: z48.ZodEnum<{
	approved: "approved";
	pending: "pending";
	rejected: "rejected";
	sent: "sent";
	superseded: "superseded";
	void: "void";
}>;
/** The state of a Draft. */
type DraftStatus = z48.infer<typeof draftStatusSchema>;
/** Who wrote a Draft: an Agent, or a Rep composing a reply in the inbox. */
declare const DRAFT_AUTHORS: readonly ["agent", "rep"];
/** Who wrote a Draft. */
declare const draftAuthorSchema: z48.ZodEnum<{
	agent: "agent";
	rep: "rep";
}>;
/** Who wrote a Draft. */
type DraftAuthor = z48.infer<typeof draftAuthorSchema>;
/** Why a send failed: a closed list, never the provider's own text. */
declare const MESSAGE_FAILURE_REASONS: readonly ["provider_rejected", "recipient_invalid", "suppressed", "channel_unavailable", "timeout", "unknown"];
/** Why a send failed. */
declare const messageFailureReasonSchema: z48.ZodEnum<{
	channel_unavailable: "channel_unavailable";
	provider_rejected: "provider_rejected";
	recipient_invalid: "recipient_invalid";
	suppressed: "suppressed";
	timeout: "timeout";
	unknown: "unknown";
}>;
/** Why a send failed. */
type MessageFailureReason = z48.infer<typeof messageFailureReasonSchema>;
/**
* The meaning of an inbound Message: a label from the closed set, a confidence, and who decided
* it. `model` is the classifier; `rep` is a person's correction, which names them.
*/
declare const classificationSchema: z49.ZodObject<{
	label: z49.ZodEnum<{
		bounce: "bounce";
		negative: "negative";
		not_now: "not_now";
		objection: "objection";
		other: "other";
		out_of_office: "out_of_office";
		positive: "positive";
		question: "question";
		unsubscribe: "unsubscribe";
		wrong_person: "wrong_person";
	}>;
	confidence: z49.ZodNumber;
	decidedBy: z49.ZodEnum<{
		model: "model";
		rep: "rep";
	}>;
	correctedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	classifiedAt: z49.ZodISODateTime;
}, z49.core.$strict>;
/** The meaning of an inbound Message. */
type Classification = z49.infer<typeof classificationSchema>;
/**
* A Conversation: all Messages between one Prospect and the Organization on one channel, and who
* answers now. `controllerMembershipId` names the Rep exactly when `controller` is `rep`, and the
* `rep` state means the Rep controls it. `ownerMembershipId` is the Rep who owns the Prospect (the
* one whose inbox it is), null while unassigned in the Admin queue. `latestLabel` is the label of
* the latest inbound Message, null until one is classified.
*/
declare const conversationSchema: z49.ZodObject<{
	id: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
	prospectId: z49.core.$ZodBranded<z49.ZodString, "prs", "out">;
	channel: z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	controller: z49.ZodEnum<{
		agent: "agent";
		rep: "rep";
	}>;
	controllerMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	state: z49.ZodEnum<{
		agent: "agent";
		awaiting_approval: "awaiting_approval";
		closed: "closed";
		escalated: "escalated";
		rep: "rep";
	}>;
	ownerMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	latestLabel: z49.ZodNullable<z49.ZodEnum<{
		bounce: "bounce";
		negative: "negative";
		not_now: "not_now";
		objection: "objection";
		other: "other";
		out_of_office: "out_of_office";
		positive: "positive";
		question: "question";
		unsubscribe: "unsubscribe";
		wrong_person: "wrong_person";
	}>>;
	pendingDraftCount: z49.ZodNumber;
	lastMessageAt: z49.ZodISODateTime;
	createdAt: z49.ZodISODateTime;
}, z49.core.$strict>;
/** A Conversation. */
type Conversation = z49.infer<typeof conversationSchema>;
/**
* A Message: one piece of text in a Conversation. Messages are append-only. An inbound Message is
* written by the Prospect and carries a classification (null until classified); an outbound one is
* written by an Agent or a Rep, carries the Draft it came from and is recorded when the channel
* confirms it was sent. The body is the Prospect's or a model's text: untrusted, and never logged
* or put in an event or an error.
*/
declare const messageSchema: z49.ZodObject<{
	id: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
	conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
	direction: z49.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	authorKind: z49.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
		rep: "rep";
	}>;
	authorMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	providerMessageId: z49.ZodString;
	draftId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
	body: z49.ZodString;
	sentAt: z49.ZodISODateTime;
	classification: z49.ZodNullable<z49.ZodObject<{
		label: z49.ZodEnum<{
			bounce: "bounce";
			negative: "negative";
			not_now: "not_now";
			objection: "objection";
			other: "other";
			out_of_office: "out_of_office";
			positive: "positive";
			question: "question";
			unsubscribe: "unsubscribe";
			wrong_person: "wrong_person";
		}>;
		confidence: z49.ZodNumber;
		decidedBy: z49.ZodEnum<{
			model: "model";
			rep: "rep";
		}>;
		correctedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		classifiedAt: z49.ZodISODateTime;
	}, z49.core.$strict>>;
}, z49.core.$strict>;
/** A Message. */
type Message = z49.infer<typeof messageSchema>;
/**
* A Source a Draft cites: a Moment of a Deal (with that Deal's Outcome) or a chunk of a Playbook
* document (no Outcome), and how many Moments or passages support it. It is a reference, never
* the text: model output is untrusted, so a Source id is accepted only when the Playbook returned
* it for this request, and the passage is read from the Playbook (`DraftSourcePassage`).
*/
declare const sourceSchema: z49.ZodObject<{
	kind: z49.ZodEnum<{
		document_chunk: "document_chunk";
		moment: "moment";
	}>;
	sourceRef: z49.ZodString;
	dealRecordId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "deal", "out">>;
	documentId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "doc", "out">>;
	outcome: z49.ZodNullable<z49.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>>;
	evidenceCount: z49.ZodNumber;
}, z49.core.$strict>;
/** A Source a Draft cites. */
type Source = z49.infer<typeof sourceSchema>;
/** A Source with the passage it points to, read from the Playbook for display; untrusted text. */
declare const sourcePassageSchema: z49.ZodObject<{
	source: z49.ZodObject<{
		kind: z49.ZodEnum<{
			document_chunk: "document_chunk";
			moment: "moment";
		}>;
		sourceRef: z49.ZodString;
		dealRecordId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "deal", "out">>;
		documentId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "doc", "out">>;
		outcome: z49.ZodNullable<z49.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>>;
		evidenceCount: z49.ZodNumber;
	}, z49.core.$strict>;
	passage: z49.ZodString;
}, z49.core.$strict>;
/** A Source with its passage. */
type SourcePassage = z49.infer<typeof sourcePassageSchema>;
/** Why a Draft was written: the Message it answers, that Message's label and the strategy in one sentence. */
declare const draftReasonSchema: z49.ZodObject<{
	triggerMessageId: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
	label: z49.ZodEnum<{
		bounce: "bounce";
		negative: "negative";
		not_now: "not_now";
		objection: "objection";
		other: "other";
		out_of_office: "out_of_office";
		positive: "positive";
		question: "question";
		unsubscribe: "unsubscribe";
		wrong_person: "wrong_person";
	}>;
	strategy: z49.ZodString;
}, z49.core.$strict>;
/** Why a Draft was written. */
type DraftReason = z49.infer<typeof draftReasonSchema>;
/** The result of one check run on a Draft before release. */
declare const draftCheckSchema: z49.ZodObject<{
	name: z49.ZodString;
	passed: z49.ZodBoolean;
}, z49.core.$strict>;
/**
* A Draft: text an Agent wrote (or a Rep composed in the inbox) for a Conversation and has not
* sent. An Agent Draft has a reason, a confidence and its Sources; one with no Source is
* `ungrounded`. `hold` says why it waits for a person, null when it was released without one. A
* Draft that is ungrounded, or has a failed check, always has a hold: no setting releases it. A
* Rep's Draft is already approved by its author.
*/
declare const draftSchema: z49.ZodObject<{
	id: z49.core.$ZodBranded<z49.ZodString, "drf", "out">;
	conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
	author: z49.ZodEnum<{
		agent: "agent";
		rep: "rep";
	}>;
	authorMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	body: z49.ZodString;
	reason: z49.ZodNullable<z49.ZodObject<{
		triggerMessageId: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
		label: z49.ZodEnum<{
			bounce: "bounce";
			negative: "negative";
			not_now: "not_now";
			objection: "objection";
			other: "other";
			out_of_office: "out_of_office";
			positive: "positive";
			question: "question";
			unsubscribe: "unsubscribe";
			wrong_person: "wrong_person";
		}>;
		strategy: z49.ZodString;
	}, z49.core.$strict>>;
	sources: z49.ZodArray<z49.ZodObject<{
		kind: z49.ZodEnum<{
			document_chunk: "document_chunk";
			moment: "moment";
		}>;
		sourceRef: z49.ZodString;
		dealRecordId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "deal", "out">>;
		documentId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "doc", "out">>;
		outcome: z49.ZodNullable<z49.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>>;
		evidenceCount: z49.ZodNumber;
	}, z49.core.$strict>>;
	confidence: z49.ZodNullable<z49.ZodNumber>;
	ungrounded: z49.ZodBoolean;
	checks: z49.ZodArray<z49.ZodObject<{
		name: z49.ZodString;
		passed: z49.ZodBoolean;
	}, z49.core.$strict>>;
	hold: z49.ZodNullable<z49.ZodEnum<{
		check_failed: "check_failed";
		escalated: "escalated";
		first_message: "first_message";
		policy: "policy";
		ungrounded: "ungrounded";
	}>>;
	status: z49.ZodEnum<{
		approved: "approved";
		pending: "pending";
		rejected: "rejected";
		sent: "sent";
		superseded: "superseded";
		void: "void";
	}>;
	createdAt: z49.ZodISODateTime;
	decidedAt: z49.ZodNullable<z49.ZodISODateTime>;
}, z49.core.$strict>;
/** A Draft. */
type Draft = z49.infer<typeof draftSchema>;
/** What a recorded Decision was. */
declare const DECISION_KINDS: readonly ["approve", "edit_approve", "reject", "auto_release", "takeover", "hand_back"];
/** What a recorded Decision was. */
declare const decisionKindSchema: z49.ZodEnum<{
	approve: "approve";
	auto_release: "auto_release";
	edit_approve: "edit_approve";
	hand_back: "hand_back";
	reject: "reject";
	takeover: "takeover";
}>;
/** What a recorded Decision was. */
type DecisionKind = z49.infer<typeof decisionKindSchema>;
/**
* A Decision: one approval, edit, rejection, automatic release, takeover or hand-back, with who
* and when. It names its Draft except for a takeover or hand-back. Only an automatic release has
* no member. `acknowledgedUngrounded` is true when a person approved an ungrounded Draft knowing
* it cites no Source. The edited text is the Message that was sent, not stored here.
*/
declare const decisionSchema: z49.ZodObject<{
	id: z49.core.$ZodBranded<z49.ZodString, "dcs", "out">;
	conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
	draftId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
	kind: z49.ZodEnum<{
		approve: "approve";
		auto_release: "auto_release";
		edit_approve: "edit_approve";
		hand_back: "hand_back";
		reject: "reject";
		takeover: "takeover";
	}>;
	decidedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	note: z49.ZodNullable<z49.ZodString>;
	acknowledgedUngrounded: z49.ZodBoolean;
	decidedAt: z49.ZodISODateTime;
}, z49.core.$strict>;
/** A Decision. */
type Decision = z49.infer<typeof decisionSchema>;
/** What an Organization's approval policy asks for a channel. See {@link approvalRuleSchema}. */
declare const APPROVAL_MODES: readonly ["always", "below_confidence", "except"];
/** The most labels an `except` rule may name. */
declare const MAX_EXCEPT_LABELS = 10;
/**
* The approval rule for a channel. `always` (the default): every Draft waits for a person.
* `below_confidence`: a Draft waits only when its confidence is below `threshold`. `except`: a
* Draft waits unless its label is one of `labels`. The rule never overrides the holds that
* always apply (an ungrounded Draft, a failed check, an escalated Conversation, the first
* message to a Prospect).
*/
declare const approvalRuleSchema: z49.ZodDiscriminatedUnion<[z49.ZodObject<{
	mode: z49.ZodLiteral<"always">;
}, z49.core.$strict>, z49.ZodObject<{
	mode: z49.ZodLiteral<"below_confidence">;
	threshold: z49.ZodNumber;
}, z49.core.$strict>, z49.ZodObject<{
	mode: z49.ZodLiteral<"except">;
	labels: z49.ZodArray<z49.ZodEnum<{
		bounce: "bounce";
		negative: "negative";
		not_now: "not_now";
		objection: "objection";
		other: "other";
		out_of_office: "out_of_office";
		positive: "positive";
		question: "question";
		unsubscribe: "unsubscribe";
		wrong_person: "wrong_person";
	}>>;
}, z49.core.$strict>], "mode">;
/** The approval rule for a channel. */
type ApprovalRule = z49.infer<typeof approvalRuleSchema>;
/** The approval policy of one channel: its rule, and when and by whom it was last set (null while it is the default). */
declare const approvalPolicySchema: z49.ZodObject<{
	channel: z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	rule: z49.ZodDiscriminatedUnion<[z49.ZodObject<{
		mode: z49.ZodLiteral<"always">;
	}, z49.core.$strict>, z49.ZodObject<{
		mode: z49.ZodLiteral<"below_confidence">;
		threshold: z49.ZodNumber;
	}, z49.core.$strict>, z49.ZodObject<{
		mode: z49.ZodLiteral<"except">;
		labels: z49.ZodArray<z49.ZodEnum<{
			bounce: "bounce";
			negative: "negative";
			not_now: "not_now";
			objection: "objection";
			other: "other";
			out_of_office: "out_of_office";
			positive: "positive";
			question: "question";
			unsubscribe: "unsubscribe";
			wrong_person: "wrong_person";
		}>>;
	}, z49.core.$strict>], "mode">;
	updatedAt: z49.ZodNullable<z49.ZodISODateTime>;
	updatedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
}, z49.core.$strict>;
/** The approval policy of one channel. */
type ApprovalPolicy = z49.infer<typeof approvalPolicySchema>;
/** What decides whether a Draft waits for a person. */
type HoldFacts = {
	readonly label: z49.infer<typeof replyLabelSchema>;
	readonly confidence: number;
	readonly ungrounded: boolean;
	readonly failedCheck: boolean;
	readonly escalated: boolean;
	readonly firstMessage: boolean;
};
/**
* Says why a Draft waits for a person, or null when it may be released at once. The four holds
* that always apply come first and no rule can turn them off; only then is the policy's rule asked.
*/
declare function holdReasonFor(rule: ApprovalRule, facts: HoldFacts): z49.infer<typeof draftHoldReasonSchema> | null;
/** The path parameters of a request about one Conversation. */
declare const conversationParamsSchema: z49.ZodObject<{
	conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
}, z49.core.$strict>;
/** The path parameters of a request about one Message of a Conversation. */
declare const conversationMessageParamsSchema: z49.ZodObject<{
	conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
	messageId: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
}, z49.core.$strict>;
/** The path parameters of a request about one Draft. */
declare const draftParamsSchema: z49.ZodObject<{
	draftId: z49.core.$ZodBranded<z49.ZodString, "drf", "out">;
}, z49.core.$strict>;
/** The path parameters of a request about one channel's policy. */
declare const channelParamsSchema: z49.ZodObject<{
	channel: z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
}, z49.core.$strict>;
/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
declare const inboxKeyedHeadersSchema: z49.ZodObject<{
	"idempotency-key": z49.ZodString;
}, z49.core.$strip>;
/** The cursor position a Conversation list resumes from: latest activity first, then id. */
declare const conversationCursorSchema: z49.ZodObject<{
	lastMessageAt: z49.ZodISODateTime;
	id: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
}, z49.core.$strict>;
/**
* The query parameters of a request to list Conversations: latest activity first, one
* cursor-paginated page at a time, narrowed by channel, state, controller, the latest label and
* Prospect. What the caller sees is decided from the token and a filter never widens it.
*/
declare const listConversationsQuerySchema: z49.ZodObject<{
	cursor: z49.ZodOptional<z49.ZodString>;
	limit: z49.ZodDefault<z49.ZodPipe<z49.ZodPipe<z49.ZodUnion<readonly [z49.ZodNumber, z49.ZodString]>, z49.ZodTransform<number, string | number>>, z49.ZodNumber>>;
	channel: z49.ZodOptional<z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>>;
	state: z49.ZodOptional<z49.ZodEnum<{
		agent: "agent";
		awaiting_approval: "awaiting_approval";
		closed: "closed";
		escalated: "escalated";
		rep: "rep";
	}>>;
	controller: z49.ZodOptional<z49.ZodEnum<{
		agent: "agent";
		rep: "rep";
	}>>;
	label: z49.ZodOptional<z49.ZodEnum<{
		bounce: "bounce";
		negative: "negative";
		not_now: "not_now";
		objection: "objection";
		other: "other";
		out_of_office: "out_of_office";
		positive: "positive";
		question: "question";
		unsubscribe: "unsubscribe";
		wrong_person: "wrong_person";
	}>>;
	prospectId: z49.ZodOptional<z49.core.$ZodBranded<z49.ZodString, "prs", "out">>;
}, z49.core.$strict>;
/** The query parameters of a request to list Conversations. */
type ListConversationsQuery = z49.infer<typeof listConversationsQuerySchema>;
/** One page of Conversations. */
declare const conversationPageSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		id: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
		prospectId: z49.core.$ZodBranded<z49.ZodString, "prs", "out">;
		channel: z49.ZodEnum<{
			chat: "chat";
			email: "email";
			linkedin: "linkedin";
		}>;
		controller: z49.ZodEnum<{
			agent: "agent";
			rep: "rep";
		}>;
		controllerMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		state: z49.ZodEnum<{
			agent: "agent";
			awaiting_approval: "awaiting_approval";
			closed: "closed";
			escalated: "escalated";
			rep: "rep";
		}>;
		ownerMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		latestLabel: z49.ZodNullable<z49.ZodEnum<{
			bounce: "bounce";
			negative: "negative";
			not_now: "not_now";
			objection: "objection";
			other: "other";
			out_of_office: "out_of_office";
			positive: "positive";
			question: "question";
			unsubscribe: "unsubscribe";
			wrong_person: "wrong_person";
		}>>;
		pendingDraftCount: z49.ZodNumber;
		lastMessageAt: z49.ZodISODateTime;
		createdAt: z49.ZodISODateTime;
	}, z49.core.$strict>>;
	nextCursor: z49.ZodNullable<z49.ZodString>;
}, z49.core.$strip>;
/** The cursor position a Message list resumes from: oldest first, then id. */
declare const messageCursorSchema: z49.ZodObject<{
	sentAt: z49.ZodISODateTime;
	id: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
}, z49.core.$strict>;
/** The query parameters of a request to list the Messages of a Conversation, oldest first. */
declare const listMessagesQuerySchema: z49.ZodObject<{
	cursor: z49.ZodOptional<z49.ZodString>;
	limit: z49.ZodDefault<z49.ZodPipe<z49.ZodPipe<z49.ZodUnion<readonly [z49.ZodNumber, z49.ZodString]>, z49.ZodTransform<number, string | number>>, z49.ZodNumber>>;
}, z49.core.$strict>;
/** One page of Messages. */
declare const messagePageSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		id: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
		conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
		direction: z49.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		authorKind: z49.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
			rep: "rep";
		}>;
		authorMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		providerMessageId: z49.ZodString;
		draftId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
		body: z49.ZodString;
		sentAt: z49.ZodISODateTime;
		classification: z49.ZodNullable<z49.ZodObject<{
			label: z49.ZodEnum<{
				bounce: "bounce";
				negative: "negative";
				not_now: "not_now";
				objection: "objection";
				other: "other";
				out_of_office: "out_of_office";
				positive: "positive";
				question: "question";
				unsubscribe: "unsubscribe";
				wrong_person: "wrong_person";
			}>;
			confidence: z49.ZodNumber;
			decidedBy: z49.ZodEnum<{
				model: "model";
				rep: "rep";
			}>;
			correctedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
			classifiedAt: z49.ZodISODateTime;
		}, z49.core.$strict>>;
	}, z49.core.$strict>>;
	nextCursor: z49.ZodNullable<z49.ZodString>;
}, z49.core.$strip>;
/** The body of a request to correct the label of an inbound Message. */
declare const correctClassificationRequestSchema: z49.ZodObject<{
	label: z49.ZodEnum<{
		bounce: "bounce";
		negative: "negative";
		not_now: "not_now";
		objection: "objection";
		other: "other";
		out_of_office: "out_of_office";
		positive: "positive";
		question: "question";
		unsubscribe: "unsubscribe";
		wrong_person: "wrong_person";
	}>;
}, z49.core.$strict>;
/** The body of a request to take over or hand back a Conversation: none. */
declare const conversationActionRequestSchema: z49.ZodObject<{}, z49.core.$strict>;
/** The body of a Rep's reply from the inbox: the text to send through the Conversation's channel. */
declare const replyRequestSchema: z49.ZodObject<{
	body: z49.ZodString;
}, z49.core.$strict>;
/**
* The body of a request to approve a Draft. With `body` the Draft is edited and approved: that
* text is what is sent, and the Decision is `edit_approve`. A Draft with no Source is approved
* only with `acknowledgeUngrounded` true; without it the answer is `inbox.draft_ungrounded`.
*/
declare const approveDraftRequestSchema: z49.ZodObject<{
	body: z49.ZodOptional<z49.ZodString>;
	acknowledgeUngrounded: z49.ZodDefault<z49.ZodBoolean>;
}, z49.core.$strict>;
/** The body of a request to approve a Draft. */
type ApproveDraftRequest = z49.infer<typeof approveDraftRequestSchema>;
/** The body of a request to reject a Draft, with an optional short note. */
declare const rejectDraftRequestSchema: z49.ZodObject<{
	note: z49.ZodOptional<z49.ZodString>;
}, z49.core.$strict>;
/** The Sources of a Draft with their passages. */
declare const draftSourcesSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		source: z49.ZodObject<{
			kind: z49.ZodEnum<{
				document_chunk: "document_chunk";
				moment: "moment";
			}>;
			sourceRef: z49.ZodString;
			dealRecordId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "deal", "out">>;
			documentId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "doc", "out">>;
			outcome: z49.ZodNullable<z49.ZodEnum<{
				lost: "lost";
				open: "open";
				won: "won";
			}>>;
			evidenceCount: z49.ZodNumber;
		}, z49.core.$strict>;
		passage: z49.ZodString;
	}, z49.core.$strict>>;
}, z49.core.$strict>;
/** An entry of the approval queue: a Draft waiting for a person, the Conversation it belongs to, and whether the caller may decide it. */
declare const approvalQueueItemSchema: z49.ZodObject<{
	draft: z49.ZodObject<{
		id: z49.core.$ZodBranded<z49.ZodString, "drf", "out">;
		conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
		author: z49.ZodEnum<{
			agent: "agent";
			rep: "rep";
		}>;
		authorMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		body: z49.ZodString;
		reason: z49.ZodNullable<z49.ZodObject<{
			triggerMessageId: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
			label: z49.ZodEnum<{
				bounce: "bounce";
				negative: "negative";
				not_now: "not_now";
				objection: "objection";
				other: "other";
				out_of_office: "out_of_office";
				positive: "positive";
				question: "question";
				unsubscribe: "unsubscribe";
				wrong_person: "wrong_person";
			}>;
			strategy: z49.ZodString;
		}, z49.core.$strict>>;
		sources: z49.ZodArray<z49.ZodObject<{
			kind: z49.ZodEnum<{
				document_chunk: "document_chunk";
				moment: "moment";
			}>;
			sourceRef: z49.ZodString;
			dealRecordId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "deal", "out">>;
			documentId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "doc", "out">>;
			outcome: z49.ZodNullable<z49.ZodEnum<{
				lost: "lost";
				open: "open";
				won: "won";
			}>>;
			evidenceCount: z49.ZodNumber;
		}, z49.core.$strict>>;
		confidence: z49.ZodNullable<z49.ZodNumber>;
		ungrounded: z49.ZodBoolean;
		checks: z49.ZodArray<z49.ZodObject<{
			name: z49.ZodString;
			passed: z49.ZodBoolean;
		}, z49.core.$strict>>;
		hold: z49.ZodNullable<z49.ZodEnum<{
			check_failed: "check_failed";
			escalated: "escalated";
			first_message: "first_message";
			policy: "policy";
			ungrounded: "ungrounded";
		}>>;
		status: z49.ZodEnum<{
			approved: "approved";
			pending: "pending";
			rejected: "rejected";
			sent: "sent";
			superseded: "superseded";
			void: "void";
		}>;
		createdAt: z49.ZodISODateTime;
		decidedAt: z49.ZodNullable<z49.ZodISODateTime>;
	}, z49.core.$strict>;
	channel: z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	prospectId: z49.core.$ZodBranded<z49.ZodString, "prs", "out">;
	ownerMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	canApprove: z49.ZodBoolean;
}, z49.core.$strict>;
/** An entry of the approval queue. */
type ApprovalQueueItem = z49.infer<typeof approvalQueueItemSchema>;
/** The cursor position the approval queue resumes from: oldest first, then id. */
declare const approvalQueueCursorSchema: z49.ZodObject<{
	createdAt: z49.ZodISODateTime;
	id: z49.core.$ZodBranded<z49.ZodString, "drf", "out">;
}, z49.core.$strict>;
/** The query parameters of a request to list the approval queue, oldest first. */
declare const listApprovalQueueQuerySchema: z49.ZodObject<{
	cursor: z49.ZodOptional<z49.ZodString>;
	limit: z49.ZodDefault<z49.ZodPipe<z49.ZodPipe<z49.ZodUnion<readonly [z49.ZodNumber, z49.ZodString]>, z49.ZodTransform<number, string | number>>, z49.ZodNumber>>;
	channel: z49.ZodOptional<z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>>;
	conversationId: z49.ZodOptional<z49.core.$ZodBranded<z49.ZodString, "cnv", "out">>;
}, z49.core.$strict>;
/** One page of the approval queue. */
declare const approvalQueuePageSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		draft: z49.ZodObject<{
			id: z49.core.$ZodBranded<z49.ZodString, "drf", "out">;
			conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
			author: z49.ZodEnum<{
				agent: "agent";
				rep: "rep";
			}>;
			authorMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
			body: z49.ZodString;
			reason: z49.ZodNullable<z49.ZodObject<{
				triggerMessageId: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
				label: z49.ZodEnum<{
					bounce: "bounce";
					negative: "negative";
					not_now: "not_now";
					objection: "objection";
					other: "other";
					out_of_office: "out_of_office";
					positive: "positive";
					question: "question";
					unsubscribe: "unsubscribe";
					wrong_person: "wrong_person";
				}>;
				strategy: z49.ZodString;
			}, z49.core.$strict>>;
			sources: z49.ZodArray<z49.ZodObject<{
				kind: z49.ZodEnum<{
					document_chunk: "document_chunk";
					moment: "moment";
				}>;
				sourceRef: z49.ZodString;
				dealRecordId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "deal", "out">>;
				documentId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "doc", "out">>;
				outcome: z49.ZodNullable<z49.ZodEnum<{
					lost: "lost";
					open: "open";
					won: "won";
				}>>;
				evidenceCount: z49.ZodNumber;
			}, z49.core.$strict>>;
			confidence: z49.ZodNullable<z49.ZodNumber>;
			ungrounded: z49.ZodBoolean;
			checks: z49.ZodArray<z49.ZodObject<{
				name: z49.ZodString;
				passed: z49.ZodBoolean;
			}, z49.core.$strict>>;
			hold: z49.ZodNullable<z49.ZodEnum<{
				check_failed: "check_failed";
				escalated: "escalated";
				first_message: "first_message";
				policy: "policy";
				ungrounded: "ungrounded";
			}>>;
			status: z49.ZodEnum<{
				approved: "approved";
				pending: "pending";
				rejected: "rejected";
				sent: "sent";
				superseded: "superseded";
				void: "void";
			}>;
			createdAt: z49.ZodISODateTime;
			decidedAt: z49.ZodNullable<z49.ZodISODateTime>;
		}, z49.core.$strict>;
		channel: z49.ZodEnum<{
			chat: "chat";
			email: "email";
			linkedin: "linkedin";
		}>;
		prospectId: z49.core.$ZodBranded<z49.ZodString, "prs", "out">;
		ownerMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		canApprove: z49.ZodBoolean;
	}, z49.core.$strict>>;
	nextCursor: z49.ZodNullable<z49.ZodString>;
}, z49.core.$strip>;
/** The cursor position a Decision list resumes from: latest first, then id. */
declare const decisionCursorSchema: z49.ZodObject<{
	decidedAt: z49.ZodISODateTime;
	id: z49.core.$ZodBranded<z49.ZodString, "dcs", "out">;
}, z49.core.$strict>;
/** The query parameters of a request to list Decisions, latest first, optionally in a time range. */
declare const listDecisionsQuerySchema: z49.ZodObject<{
	cursor: z49.ZodOptional<z49.ZodString>;
	limit: z49.ZodDefault<z49.ZodPipe<z49.ZodPipe<z49.ZodUnion<readonly [z49.ZodNumber, z49.ZodString]>, z49.ZodTransform<number, string | number>>, z49.ZodNumber>>;
	conversationId: z49.ZodOptional<z49.core.$ZodBranded<z49.ZodString, "cnv", "out">>;
	draftId: z49.ZodOptional<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
	kind: z49.ZodOptional<z49.ZodEnum<{
		approve: "approve";
		auto_release: "auto_release";
		edit_approve: "edit_approve";
		hand_back: "hand_back";
		reject: "reject";
		takeover: "takeover";
	}>>;
	from: z49.ZodOptional<z49.ZodISODateTime>;
	to: z49.ZodOptional<z49.ZodISODateTime>;
}, z49.core.$strict>;
/** One page of Decisions. */
declare const decisionPageSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		id: z49.core.$ZodBranded<z49.ZodString, "dcs", "out">;
		conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
		draftId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
		kind: z49.ZodEnum<{
			approve: "approve";
			auto_release: "auto_release";
			edit_approve: "edit_approve";
			hand_back: "hand_back";
			reject: "reject";
			takeover: "takeover";
		}>;
		decidedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		note: z49.ZodNullable<z49.ZodString>;
		acknowledgedUngrounded: z49.ZodBoolean;
		decidedAt: z49.ZodISODateTime;
	}, z49.core.$strict>>;
	nextCursor: z49.ZodNullable<z49.ZodString>;
}, z49.core.$strip>;
/** The approval policy of every channel: one entry per channel, the default `always` until set. */
declare const approvalPoliciesSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		channel: z49.ZodEnum<{
			chat: "chat";
			email: "email";
			linkedin: "linkedin";
		}>;
		rule: z49.ZodDiscriminatedUnion<[z49.ZodObject<{
			mode: z49.ZodLiteral<"always">;
		}, z49.core.$strict>, z49.ZodObject<{
			mode: z49.ZodLiteral<"below_confidence">;
			threshold: z49.ZodNumber;
		}, z49.core.$strict>, z49.ZodObject<{
			mode: z49.ZodLiteral<"except">;
			labels: z49.ZodArray<z49.ZodEnum<{
				bounce: "bounce";
				negative: "negative";
				not_now: "not_now";
				objection: "objection";
				other: "other";
				out_of_office: "out_of_office";
				positive: "positive";
				question: "question";
				unsubscribe: "unsubscribe";
				wrong_person: "wrong_person";
			}>>;
		}, z49.core.$strict>], "mode">;
		updatedAt: z49.ZodNullable<z49.ZodISODateTime>;
		updatedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
	}, z49.core.$strict>>;
}, z49.core.$strict>;
/** The body of a request to set a channel's approval rule; it replaces the rule, so a repeat changes nothing. */
declare const setApprovalPolicyRequestSchema: z49.ZodObject<{
	rule: z49.ZodDiscriminatedUnion<[z49.ZodObject<{
		mode: z49.ZodLiteral<"always">;
	}, z49.core.$strict>, z49.ZodObject<{
		mode: z49.ZodLiteral<"below_confidence">;
		threshold: z49.ZodNumber;
	}, z49.core.$strict>, z49.ZodObject<{
		mode: z49.ZodLiteral<"except">;
		labels: z49.ZodArray<z49.ZodEnum<{
			bounce: "bounce";
			negative: "negative";
			not_now: "not_now";
			objection: "objection";
			other: "other";
			out_of_office: "out_of_office";
			positive: "positive";
			question: "question";
			unsubscribe: "unsubscribe";
			wrong_person: "wrong_person";
		}>>;
	}, z49.core.$strict>], "mode">;
}, z49.core.$strict>;
/**
* The body a channel service posts to `/internal/messages` for every Message it received or sent.
* Core stores one Message per channel and provider id. An inbound Message is the Prospect's;
* an outbound one carries its Draft's id when it came from one, else it is an Agent's sequence
* message. The body is untrusted text and never logged.
*/
declare const ingestMessageRequestSchema: z49.ZodObject<{
	channel: z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	providerMessageId: z49.ZodString;
	prospectId: z49.core.$ZodBranded<z49.ZodString, "prs", "out">;
	direction: z49.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	body: z49.ZodPipe<z49.ZodPipe<z49.ZodString, z49.ZodTransform<string, string>>, z49.ZodString>;
	draftId: z49.ZodOptional<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
	sentAt: z49.ZodISODateTime;
}, z49.core.$strict>;
/** The body posted to `/internal/messages`. */
type IngestMessageRequest = z49.infer<typeof ingestMessageRequestSchema>;
/** The answer to an ingest: the stored Message, and whether this call stored it (false for a repeat). */
declare const ingestMessageResultSchema: z49.ZodObject<{
	message: z49.ZodObject<{
		id: z49.core.$ZodBranded<z49.ZodString, "msg", "out">;
		conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
		direction: z49.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		authorKind: z49.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
			rep: "rep";
		}>;
		authorMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
		providerMessageId: z49.ZodString;
		draftId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "drf", "out">>;
		body: z49.ZodString;
		sentAt: z49.ZodISODateTime;
		classification: z49.ZodNullable<z49.ZodObject<{
			label: z49.ZodEnum<{
				bounce: "bounce";
				negative: "negative";
				not_now: "not_now";
				objection: "objection";
				other: "other";
				out_of_office: "out_of_office";
				positive: "positive";
				question: "question";
				unsubscribe: "unsubscribe";
				wrong_person: "wrong_person";
			}>;
			confidence: z49.ZodNumber;
			decidedBy: z49.ZodEnum<{
				model: "model";
				rep: "rep";
			}>;
			correctedByMembershipId: z49.ZodNullable<z49.core.$ZodBranded<z49.ZodString, "mem", "out">>;
			classifiedAt: z49.ZodISODateTime;
		}, z49.core.$strict>>;
	}, z49.core.$strict>;
	created: z49.ZodBoolean;
}, z49.core.$strict>;
/** What a channel service needs to send an approved Draft: where, to whom and the text. Sensitive; never logged. */
declare const draftReleaseSchema: z49.ZodObject<{
	draftId: z49.core.$ZodBranded<z49.ZodString, "drf", "out">;
	conversationId: z49.core.$ZodBranded<z49.ZodString, "cnv", "out">;
	prospectId: z49.core.$ZodBranded<z49.ZodString, "prs", "out">;
	channel: z49.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	body: z49.ZodString;
}, z49.core.$strict>;
/** What a channel service needs to send an approved Draft. */
type DraftRelease = z49.infer<typeof draftReleaseSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh4511 } from "..";
/**
* The errors the inbox routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A Conversation of another Organization, or one the caller may not see
* (a Rep's view of another Rep's Conversation), is `inbox.conversation_not_found` (404, never
* 403), and the same holds for its Messages and Drafts, so existence is not revealed.
*
* - `inbox.conversation_not_found` (404): unknown, or not the caller's to see.
* - `inbox.message_not_found` (404): the Message is unknown or not the caller's to see.
* - `inbox.draft_not_found` (404): the Draft is unknown or not the caller's to see.
* - `inbox.draft_not_pending` (409): the Draft was already decided, sent, superseded or voided.
* - `inbox.not_conversation_owner` (403): the caller can see the Conversation but is not the Rep
*   who controls it (or, to approve, the Rep who owns it or a role above).
* - `inbox.draft_ungrounded` (422): the Draft cites no Source and the approval did not
*   acknowledge it.
* - `inbox.already_controlled` (409): another Rep already took the Conversation over.
* - `inbox.takeover_required` (409): a Rep replies only in a Conversation they took over.
* - `inbox.not_taken_over` (409): the Conversation is not under a Rep's control.
* - `inbox.conversation_closed` (409): the Conversation is closed.
* - `inbox.message_not_inbound` (409): only an inbound Message has a label.
* - `inbox.prospect_not_found` (404): an ingested Message names a Prospect the caller's scope does
*   not know.
* - `inbox.prospect_suppressed` (409): the Prospect asked to stop on this channel, so nothing is
*   sent.
*/
declare const INBOX_ERRORS: {
	readonly "inbox.already_controlled": ErrorDefinition_8gwh4511<"inbox.already_controlled">;
	readonly "inbox.conversation_closed": ErrorDefinition_8gwh4511<"inbox.conversation_closed">;
	readonly "inbox.conversation_not_found": ErrorDefinition_8gwh4511<"inbox.conversation_not_found">;
	readonly "inbox.draft_not_found": ErrorDefinition_8gwh4511<"inbox.draft_not_found">;
	readonly "inbox.draft_not_pending": ErrorDefinition_8gwh4511<"inbox.draft_not_pending">;
	readonly "inbox.draft_ungrounded": ErrorDefinition_8gwh4511<"inbox.draft_ungrounded">;
	readonly "inbox.message_not_found": ErrorDefinition_8gwh4511<"inbox.message_not_found">;
	readonly "inbox.message_not_inbound": ErrorDefinition_8gwh4511<"inbox.message_not_inbound">;
	readonly "inbox.not_conversation_owner": ErrorDefinition_8gwh4511<"inbox.not_conversation_owner">;
	readonly "inbox.not_taken_over": ErrorDefinition_8gwh4511<"inbox.not_taken_over">;
	readonly "inbox.prospect_not_found": ErrorDefinition_8gwh4511<"inbox.prospect_not_found">;
	readonly "inbox.prospect_suppressed": ErrorDefinition_8gwh4511<"inbox.prospect_suppressed">;
	readonly "inbox.takeover_required": ErrorDefinition_8gwh4511<"inbox.takeover_required">;
};
/** An inbox error code. */
type InboxErrorCode = keyof typeof INBOX_ERRORS;
import { z as z50 } from "zod";
/**
* `message.approved` (version 1): a Draft was approved, by a person or released by the policy
* (`approvedByMembershipId` null). The Draft id is the idempotency key for the send: the channel
* service reads the text from core with it. Ids only: no body, no edit, no note.
*/
declare const messageApprovedEvent: {
	type: "message.approved";
	version: 1;
	schema: z50.ZodObject<{
		id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
		occurredAt: z50.ZodISODateTime;
		organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
		region: z50.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z50.ZodLiteral<"message.approved">;
		version: z50.ZodLiteral<1>;
		data: z50.ZodObject<{
			draftId: z50.core.$ZodBranded<z50.ZodString, "drf", "out">;
			conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
			prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
			channel: z50.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			approvedByMembershipId: z50.ZodNullable<z50.core.$ZodBranded<z50.ZodString, "mem", "out">>;
			edited: z50.ZodBoolean;
			acknowledgedUngrounded: z50.ZodBoolean;
			approvedAt: z50.ZodISODateTime;
		}, z50.core.$strict>;
	}, z50.core.$strip>;
	parse: (input: unknown) => {
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "message.approved";
		version: 1;
		data: {
			draftId: string & z50.$brand<"drf">;
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			approvedByMembershipId: (string & z50.$brand<"mem">) | null;
			edited: boolean;
			acknowledgedUngrounded: boolean;
			approvedAt: string;
		};
	};
	safeParse: (input: unknown) => z50.ZodSafeParseResult<{
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "message.approved";
		version: 1;
		data: {
			draftId: string & z50.$brand<"drf">;
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			approvedByMembershipId: (string & z50.$brand<"mem">) | null;
			edited: boolean;
			acknowledgedUngrounded: boolean;
			approvedAt: string;
		};
	}>;
};
/** `message.sent` (version 1): the channel service sent the approved Draft; `messageId` is the stored outbound Message. Ids only. */
declare const messageSentEvent: {
	type: "message.sent";
	version: 1;
	schema: z50.ZodObject<{
		id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
		occurredAt: z50.ZodISODateTime;
		organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
		region: z50.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z50.ZodLiteral<"message.sent">;
		version: z50.ZodLiteral<1>;
		data: z50.ZodObject<{
			draftId: z50.core.$ZodBranded<z50.ZodString, "drf", "out">;
			conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
			messageId: z50.core.$ZodBranded<z50.ZodString, "msg", "out">;
			prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
			channel: z50.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			sentAt: z50.ZodISODateTime;
		}, z50.core.$strict>;
	}, z50.core.$strip>;
	parse: (input: unknown) => {
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "message.sent";
		version: 1;
		data: {
			draftId: string & z50.$brand<"drf">;
			conversationId: string & z50.$brand<"cnv">;
			messageId: string & z50.$brand<"msg">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			sentAt: string;
		};
	};
	safeParse: (input: unknown) => z50.ZodSafeParseResult<{
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "message.sent";
		version: 1;
		data: {
			draftId: string & z50.$brand<"drf">;
			conversationId: string & z50.$brand<"cnv">;
			messageId: string & z50.$brand<"msg">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			sentAt: string;
		};
	}>;
};
/** `message.failed` (version 1): the channel service could not send the approved Draft. A closed reason, never the provider's text. Ids only. */
declare const messageFailedEvent: {
	type: "message.failed";
	version: 1;
	schema: z50.ZodObject<{
		id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
		occurredAt: z50.ZodISODateTime;
		organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
		region: z50.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z50.ZodLiteral<"message.failed">;
		version: z50.ZodLiteral<1>;
		data: z50.ZodObject<{
			draftId: z50.core.$ZodBranded<z50.ZodString, "drf", "out">;
			conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
			prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
			channel: z50.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			reason: z50.ZodEnum<{
				channel_unavailable: "channel_unavailable";
				provider_rejected: "provider_rejected";
				recipient_invalid: "recipient_invalid";
				suppressed: "suppressed";
				timeout: "timeout";
				unknown: "unknown";
			}>;
			retryable: z50.ZodBoolean;
			failedAt: z50.ZodISODateTime;
		}, z50.core.$strict>;
	}, z50.core.$strip>;
	parse: (input: unknown) => {
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "message.failed";
		version: 1;
		data: {
			draftId: string & z50.$brand<"drf">;
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			reason: "channel_unavailable" | "provider_rejected" | "recipient_invalid" | "suppressed" | "timeout" | "unknown";
			retryable: boolean;
			failedAt: string;
		};
	};
	safeParse: (input: unknown) => z50.ZodSafeParseResult<{
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "message.failed";
		version: 1;
		data: {
			draftId: string & z50.$brand<"drf">;
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			reason: "channel_unavailable" | "provider_rejected" | "recipient_invalid" | "suppressed" | "timeout" | "unknown";
			retryable: boolean;
			failedAt: string;
		};
	}>;
};
/**
* `reply.classified` (version 1): an inbound Message got its label. The suppression and sequence
* services act on `unsubscribe`, `bounce` and `wrong_person`. Ids, the label and the confidence:
* no text of the reply.
*/
declare const replyClassifiedEvent: {
	type: "reply.classified";
	version: 1;
	schema: z50.ZodObject<{
		id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
		occurredAt: z50.ZodISODateTime;
		organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
		region: z50.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z50.ZodLiteral<"reply.classified">;
		version: z50.ZodLiteral<1>;
		data: z50.ZodObject<{
			conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
			messageId: z50.core.$ZodBranded<z50.ZodString, "msg", "out">;
			prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
			channel: z50.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			label: z50.ZodEnum<{
				bounce: "bounce";
				negative: "negative";
				not_now: "not_now";
				objection: "objection";
				other: "other";
				out_of_office: "out_of_office";
				positive: "positive";
				question: "question";
				unsubscribe: "unsubscribe";
				wrong_person: "wrong_person";
			}>;
			confidence: z50.ZodNumber;
			classifiedAt: z50.ZodISODateTime;
		}, z50.core.$strict>;
	}, z50.core.$strip>;
	parse: (input: unknown) => {
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "reply.classified";
		version: 1;
		data: {
			conversationId: string & z50.$brand<"cnv">;
			messageId: string & z50.$brand<"msg">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			label: "bounce" | "negative" | "not_now" | "objection" | "other" | "out_of_office" | "positive" | "question" | "unsubscribe" | "wrong_person";
			confidence: number;
			classifiedAt: string;
		};
	};
	safeParse: (input: unknown) => z50.ZodSafeParseResult<{
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "reply.classified";
		version: 1;
		data: {
			conversationId: string & z50.$brand<"cnv">;
			messageId: string & z50.$brand<"msg">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			label: "bounce" | "negative" | "not_now" | "objection" | "other" | "out_of_office" | "positive" | "question" | "unsubscribe" | "wrong_person";
			confidence: number;
			classifiedAt: string;
		};
	}>;
};
/** `conversation.taken_over` (version 1): a Rep took a Conversation over; the sequence pauses and `voidedDraftCount` pending Drafts were voided. Ids only. */
declare const conversationTakenOverEvent: {
	type: "conversation.taken_over";
	version: 1;
	schema: z50.ZodObject<{
		id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
		occurredAt: z50.ZodISODateTime;
		organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
		region: z50.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z50.ZodLiteral<"conversation.taken_over">;
		version: z50.ZodLiteral<1>;
		data: z50.ZodObject<{
			conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
			prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
			channel: z50.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			takenOverByMembershipId: z50.core.$ZodBranded<z50.ZodString, "mem", "out">;
			voidedDraftCount: z50.ZodNumber;
			takenOverAt: z50.ZodISODateTime;
		}, z50.core.$strict>;
	}, z50.core.$strip>;
	parse: (input: unknown) => {
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.taken_over";
		version: 1;
		data: {
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			takenOverByMembershipId: string & z50.$brand<"mem">;
			voidedDraftCount: number;
			takenOverAt: string;
		};
	};
	safeParse: (input: unknown) => z50.ZodSafeParseResult<{
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.taken_over";
		version: 1;
		data: {
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			takenOverByMembershipId: string & z50.$brand<"mem">;
			voidedDraftCount: number;
			takenOverAt: string;
		};
	}>;
};
/** `conversation.handed_back` (version 1): a Rep handed a Conversation back to the Agent. Ids only. */
declare const conversationHandedBackEvent: {
	type: "conversation.handed_back";
	version: 1;
	schema: z50.ZodObject<{
		id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
		occurredAt: z50.ZodISODateTime;
		organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
		region: z50.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z50.ZodLiteral<"conversation.handed_back">;
		version: z50.ZodLiteral<1>;
		data: z50.ZodObject<{
			conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
			prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
			channel: z50.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			handedBackByMembershipId: z50.core.$ZodBranded<z50.ZodString, "mem", "out">;
			handedBackAt: z50.ZodISODateTime;
		}, z50.core.$strict>;
	}, z50.core.$strip>;
	parse: (input: unknown) => {
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.handed_back";
		version: 1;
		data: {
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			handedBackByMembershipId: string & z50.$brand<"mem">;
			handedBackAt: string;
		};
	};
	safeParse: (input: unknown) => z50.ZodSafeParseResult<{
		id: string & z50.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z50.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.handed_back";
		version: 1;
		data: {
			conversationId: string & z50.$brand<"cnv">;
			prospectId: string & z50.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			handedBackByMembershipId: string & z50.$brand<"mem">;
			handedBackAt: string;
		};
	}>;
};
/** Every inbox event, by type. */
declare const INBOX_EVENTS: {
	readonly "message.approved": {
		type: "message.approved";
		version: 1;
		schema: z50.ZodObject<{
			id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
			occurredAt: z50.ZodISODateTime;
			organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
			region: z50.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z50.ZodLiteral<"message.approved">;
			version: z50.ZodLiteral<1>;
			data: z50.ZodObject<{
				draftId: z50.core.$ZodBranded<z50.ZodString, "drf", "out">;
				conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
				prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
				channel: z50.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				approvedByMembershipId: z50.ZodNullable<z50.core.$ZodBranded<z50.ZodString, "mem", "out">>;
				edited: z50.ZodBoolean;
				acknowledgedUngrounded: z50.ZodBoolean;
				approvedAt: z50.ZodISODateTime;
			}, z50.core.$strict>;
		}, z50.core.$strip>;
		parse: (input: unknown) => {
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "message.approved";
			version: 1;
			data: {
				draftId: string & z50.$brand<"drf">;
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				approvedByMembershipId: (string & z50.$brand<"mem">) | null;
				edited: boolean;
				acknowledgedUngrounded: boolean;
				approvedAt: string;
			};
		};
		safeParse: (input: unknown) => z50.ZodSafeParseResult<{
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "message.approved";
			version: 1;
			data: {
				draftId: string & z50.$brand<"drf">;
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				approvedByMembershipId: (string & z50.$brand<"mem">) | null;
				edited: boolean;
				acknowledgedUngrounded: boolean;
				approvedAt: string;
			};
		}>;
	};
	readonly "message.sent": {
		type: "message.sent";
		version: 1;
		schema: z50.ZodObject<{
			id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
			occurredAt: z50.ZodISODateTime;
			organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
			region: z50.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z50.ZodLiteral<"message.sent">;
			version: z50.ZodLiteral<1>;
			data: z50.ZodObject<{
				draftId: z50.core.$ZodBranded<z50.ZodString, "drf", "out">;
				conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
				messageId: z50.core.$ZodBranded<z50.ZodString, "msg", "out">;
				prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
				channel: z50.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				sentAt: z50.ZodISODateTime;
			}, z50.core.$strict>;
		}, z50.core.$strip>;
		parse: (input: unknown) => {
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "message.sent";
			version: 1;
			data: {
				draftId: string & z50.$brand<"drf">;
				conversationId: string & z50.$brand<"cnv">;
				messageId: string & z50.$brand<"msg">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				sentAt: string;
			};
		};
		safeParse: (input: unknown) => z50.ZodSafeParseResult<{
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "message.sent";
			version: 1;
			data: {
				draftId: string & z50.$brand<"drf">;
				conversationId: string & z50.$brand<"cnv">;
				messageId: string & z50.$brand<"msg">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				sentAt: string;
			};
		}>;
	};
	readonly "message.failed": {
		type: "message.failed";
		version: 1;
		schema: z50.ZodObject<{
			id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
			occurredAt: z50.ZodISODateTime;
			organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
			region: z50.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z50.ZodLiteral<"message.failed">;
			version: z50.ZodLiteral<1>;
			data: z50.ZodObject<{
				draftId: z50.core.$ZodBranded<z50.ZodString, "drf", "out">;
				conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
				prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
				channel: z50.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				reason: z50.ZodEnum<{
					channel_unavailable: "channel_unavailable";
					provider_rejected: "provider_rejected";
					recipient_invalid: "recipient_invalid";
					suppressed: "suppressed";
					timeout: "timeout";
					unknown: "unknown";
				}>;
				retryable: z50.ZodBoolean;
				failedAt: z50.ZodISODateTime;
			}, z50.core.$strict>;
		}, z50.core.$strip>;
		parse: (input: unknown) => {
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "message.failed";
			version: 1;
			data: {
				draftId: string & z50.$brand<"drf">;
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				reason: "channel_unavailable" | "provider_rejected" | "recipient_invalid" | "suppressed" | "timeout" | "unknown";
				retryable: boolean;
				failedAt: string;
			};
		};
		safeParse: (input: unknown) => z50.ZodSafeParseResult<{
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "message.failed";
			version: 1;
			data: {
				draftId: string & z50.$brand<"drf">;
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				reason: "channel_unavailable" | "provider_rejected" | "recipient_invalid" | "suppressed" | "timeout" | "unknown";
				retryable: boolean;
				failedAt: string;
			};
		}>;
	};
	readonly "reply.classified": {
		type: "reply.classified";
		version: 1;
		schema: z50.ZodObject<{
			id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
			occurredAt: z50.ZodISODateTime;
			organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
			region: z50.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z50.ZodLiteral<"reply.classified">;
			version: z50.ZodLiteral<1>;
			data: z50.ZodObject<{
				conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
				messageId: z50.core.$ZodBranded<z50.ZodString, "msg", "out">;
				prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
				channel: z50.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				label: z50.ZodEnum<{
					bounce: "bounce";
					negative: "negative";
					not_now: "not_now";
					objection: "objection";
					other: "other";
					out_of_office: "out_of_office";
					positive: "positive";
					question: "question";
					unsubscribe: "unsubscribe";
					wrong_person: "wrong_person";
				}>;
				confidence: z50.ZodNumber;
				classifiedAt: z50.ZodISODateTime;
			}, z50.core.$strict>;
		}, z50.core.$strip>;
		parse: (input: unknown) => {
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "reply.classified";
			version: 1;
			data: {
				conversationId: string & z50.$brand<"cnv">;
				messageId: string & z50.$brand<"msg">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				label: "bounce" | "negative" | "not_now" | "objection" | "other" | "out_of_office" | "positive" | "question" | "unsubscribe" | "wrong_person";
				confidence: number;
				classifiedAt: string;
			};
		};
		safeParse: (input: unknown) => z50.ZodSafeParseResult<{
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "reply.classified";
			version: 1;
			data: {
				conversationId: string & z50.$brand<"cnv">;
				messageId: string & z50.$brand<"msg">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				label: "bounce" | "negative" | "not_now" | "objection" | "other" | "out_of_office" | "positive" | "question" | "unsubscribe" | "wrong_person";
				confidence: number;
				classifiedAt: string;
			};
		}>;
	};
	readonly "conversation.taken_over": {
		type: "conversation.taken_over";
		version: 1;
		schema: z50.ZodObject<{
			id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
			occurredAt: z50.ZodISODateTime;
			organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
			region: z50.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z50.ZodLiteral<"conversation.taken_over">;
			version: z50.ZodLiteral<1>;
			data: z50.ZodObject<{
				conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
				prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
				channel: z50.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				takenOverByMembershipId: z50.core.$ZodBranded<z50.ZodString, "mem", "out">;
				voidedDraftCount: z50.ZodNumber;
				takenOverAt: z50.ZodISODateTime;
			}, z50.core.$strict>;
		}, z50.core.$strip>;
		parse: (input: unknown) => {
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.taken_over";
			version: 1;
			data: {
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				takenOverByMembershipId: string & z50.$brand<"mem">;
				voidedDraftCount: number;
				takenOverAt: string;
			};
		};
		safeParse: (input: unknown) => z50.ZodSafeParseResult<{
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.taken_over";
			version: 1;
			data: {
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				takenOverByMembershipId: string & z50.$brand<"mem">;
				voidedDraftCount: number;
				takenOverAt: string;
			};
		}>;
	};
	readonly "conversation.handed_back": {
		type: "conversation.handed_back";
		version: 1;
		schema: z50.ZodObject<{
			id: z50.core.$ZodBranded<z50.ZodString, "evt", "out">;
			occurredAt: z50.ZodISODateTime;
			organizationId: z50.core.$ZodBranded<z50.ZodString, "org", "out">;
			region: z50.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z50.ZodLiteral<"conversation.handed_back">;
			version: z50.ZodLiteral<1>;
			data: z50.ZodObject<{
				conversationId: z50.core.$ZodBranded<z50.ZodString, "cnv", "out">;
				prospectId: z50.core.$ZodBranded<z50.ZodString, "prs", "out">;
				channel: z50.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				handedBackByMembershipId: z50.core.$ZodBranded<z50.ZodString, "mem", "out">;
				handedBackAt: z50.ZodISODateTime;
			}, z50.core.$strict>;
		}, z50.core.$strip>;
		parse: (input: unknown) => {
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.handed_back";
			version: 1;
			data: {
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				handedBackByMembershipId: string & z50.$brand<"mem">;
				handedBackAt: string;
			};
		};
		safeParse: (input: unknown) => z50.ZodSafeParseResult<{
			id: string & z50.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z50.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.handed_back";
			version: 1;
			data: {
				conversationId: string & z50.$brand<"cnv">;
				prospectId: string & z50.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				handedBackByMembershipId: string & z50.$brand<"mem">;
				handedBackAt: string;
			};
		}>;
	};
};
/** The type of an inbox event. */
type InboxEventType = keyof typeof INBOX_EVENTS;
/** Every role: each works the Conversations they may see. */
declare const INBOX_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that set the approval policy. */
declare const INBOX_ADMIN_ROLES: readonly ["owner", "admin"];
/** The roles that review the record of Decisions. */
declare const INBOX_REVIEW_ROLES: readonly ["owner", "admin", "manager"];
/** The inbox routes, by name. */
type InboxRouteName = "listConversations" | "getConversation" | "listConversationMessages" | "correctClassification" | "takeOverConversation" | "handBackConversation" | "replyToConversation" | "listApprovalQueue" | "getDraft" | "getDraftSources" | "approveDraft" | "rejectDraft" | "listDecisions" | "listApprovalPolicies" | "setApprovalPolicy" | "ingestMessage" | "getDraftRelease";
/** One inbox route. */
type InboxRoute = InboundRoute<InboxErrorCode>;
/**
* The inbox routes (spec M09). Core owns them; channel services use the two `/internal` routes
* with the shared secret. Lists are cursor-paginated with a page of at most 100. Nothing here
* sends text: an approval publishes `message.approved` and the channel service sends it.
*/
declare const INBOX_ROUTES: Readonly<Record<InboxRouteName, InboxRoute>>;
import { ErrorDefinition as ErrorDefinition_8gwh4512 } from "..";
/**
* The errors the Inquiry routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. An Inquiry of another Organization, or one the caller may not see (a
* Rep's view of another Rep's Inquiry), is `inquiry.not_found` (404, never 403), so existence is
* not revealed.
*
* - `inquiry.origin_not_allowed` (403): the `Origin` of a public request is not one the
*   Organization allowed for its publishable key. Nothing is stored.
* - `inquiry.key_invalid` (404): the publishable key is unknown, rotated away or its embed is not
*   live. It answers exactly as for a key that never existed.
* - `inquiry.consent_wording_missing` (422): the wording id and version sent are not the Consent
*   Wording the form is set to display, or the embed has none. The Inquiry is not stored.
* - `inquiry.embed_invalid` (422): an allowed-origin or wording the Organization cannot use (a
*   wording that does not exist or does not cover the phone channel).
* - `inquiry.retries_exhausted` (409): the callback already used its attempts, so a manual retry is
*   refused and nothing is queued.
* - `inquiry.not_found` (404): the Inquiry is unknown or not the caller's to see.
*/
declare const INQUIRY_ERRORS: {
	readonly "inquiry.consent_wording_missing": ErrorDefinition_8gwh4512<"inquiry.consent_wording_missing">;
	readonly "inquiry.embed_invalid": ErrorDefinition_8gwh4512<"inquiry.embed_invalid">;
	readonly "inquiry.key_invalid": ErrorDefinition_8gwh4512<"inquiry.key_invalid">;
	readonly "inquiry.not_found": ErrorDefinition_8gwh4512<"inquiry.not_found">;
	readonly "inquiry.origin_not_allowed": ErrorDefinition_8gwh4512<"inquiry.origin_not_allowed">;
	readonly "inquiry.retries_exhausted": ErrorDefinition_8gwh4512<"inquiry.retries_exhausted">;
};
/** An Inquiry error code. */
type InquiryErrorCode = keyof typeof INQUIRY_ERRORS;
import { z as z51 } from "zod";
/**
* `voice.inquiry.received` (version 1): an Inquiry was stored and the Prospect upserted. Ids, the
* source and the time: no name, email, number, message, page address or Qualification answer.
*/
declare const voiceInquiryReceivedEvent: {
	type: "voice.inquiry.received";
	version: 1;
	schema: z51.ZodObject<{
		id: z51.core.$ZodBranded<z51.ZodString, "evt", "out">;
		occurredAt: z51.ZodISODateTime;
		organizationId: z51.core.$ZodBranded<z51.ZodString, "org", "out">;
		region: z51.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z51.ZodLiteral<"voice.inquiry.received">;
		version: z51.ZodLiteral<1>;
		data: z51.ZodObject<{
			inquiryId: z51.core.$ZodBranded<z51.ZodString, "inq", "out">;
			source: z51.ZodEnum<{
				call: "call";
				chat: "chat";
				form: "form";
			}>;
			prospectId: z51.core.$ZodBranded<z51.ZodString, "prs", "out">;
			chatId: z51.ZodNullable<z51.core.$ZodBranded<z51.ZodString, "cht", "out">>;
			callId: z51.ZodNullable<z51.core.$ZodBranded<z51.ZodString, "call", "out">>;
			receivedAt: z51.ZodISODateTime;
		}, z51.core.$strict>;
	}, z51.core.$strip>;
	parse: (input: unknown) => {
		id: string & z51.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z51.$brand<"org">;
		region: "eu" | "us";
		type: "voice.inquiry.received";
		version: 1;
		data: {
			inquiryId: string & z51.$brand<"inq">;
			source: "call" | "chat" | "form";
			prospectId: string & z51.$brand<"prs">;
			chatId: (string & z51.$brand<"cht">) | null;
			callId: (string & z51.$brand<"call">) | null;
			receivedAt: string;
		};
	};
	safeParse: (input: unknown) => z51.ZodSafeParseResult<{
		id: string & z51.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z51.$brand<"org">;
		region: "eu" | "us";
		type: "voice.inquiry.received";
		version: 1;
		data: {
			inquiryId: string & z51.$brand<"inq">;
			source: "call" | "chat" | "form";
			prospectId: string & z51.$brand<"prs">;
			chatId: (string & z51.$brand<"cht">) | null;
			callId: (string & z51.$brand<"call">) | null;
			receivedAt: string;
		};
	}>;
};
/** Every Inquiry event, by type. */
declare const INQUIRY_EVENTS: {
	readonly "voice.inquiry.received": {
		type: "voice.inquiry.received";
		version: 1;
		schema: z51.ZodObject<{
			id: z51.core.$ZodBranded<z51.ZodString, "evt", "out">;
			occurredAt: z51.ZodISODateTime;
			organizationId: z51.core.$ZodBranded<z51.ZodString, "org", "out">;
			region: z51.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z51.ZodLiteral<"voice.inquiry.received">;
			version: z51.ZodLiteral<1>;
			data: z51.ZodObject<{
				inquiryId: z51.core.$ZodBranded<z51.ZodString, "inq", "out">;
				source: z51.ZodEnum<{
					call: "call";
					chat: "chat";
					form: "form";
				}>;
				prospectId: z51.core.$ZodBranded<z51.ZodString, "prs", "out">;
				chatId: z51.ZodNullable<z51.core.$ZodBranded<z51.ZodString, "cht", "out">>;
				callId: z51.ZodNullable<z51.core.$ZodBranded<z51.ZodString, "call", "out">>;
				receivedAt: z51.ZodISODateTime;
			}, z51.core.$strict>;
		}, z51.core.$strip>;
		parse: (input: unknown) => {
			id: string & z51.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z51.$brand<"org">;
			region: "eu" | "us";
			type: "voice.inquiry.received";
			version: 1;
			data: {
				inquiryId: string & z51.$brand<"inq">;
				source: "call" | "chat" | "form";
				prospectId: string & z51.$brand<"prs">;
				chatId: (string & z51.$brand<"cht">) | null;
				callId: (string & z51.$brand<"call">) | null;
				receivedAt: string;
			};
		};
		safeParse: (input: unknown) => z51.ZodSafeParseResult<{
			id: string & z51.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z51.$brand<"org">;
			region: "eu" | "us";
			type: "voice.inquiry.received";
			version: 1;
			data: {
				inquiryId: string & z51.$brand<"inq">;
				source: "call" | "chat" | "form";
				prospectId: string & z51.$brand<"prs">;
				chatId: (string & z51.$brand<"cht">) | null;
				callId: (string & z51.$brand<"call">) | null;
				receivedAt: string;
			};
		}>;
	};
};
/** The type of an Inquiry event. */
type InquiryEventType = keyof typeof INQUIRY_EVENTS;
import { z as z52 } from "zod";
/**
* The callback of a form Inquiry. `skipReason` is set exactly when the state is `skipped`, so a
* callback that did not happen always says why. `attempts` counts dials (at most three) and
* `nextAttemptAt` is set while a retry waits (`no_answer`). Each attempt re-checks the Contact
* Consent for the phone channel at dial time; no field here can waive that check (ADR 0003).
*/
declare const inquiryCallbackSchema: z52.ZodObject<{
	state: z52.ZodEnum<{
		connected: "connected";
		dialling: "dialling";
		failed: "failed";
		no_answer: "no_answer";
		not_applicable: "not_applicable";
		pending: "pending";
		skipped: "skipped";
	}>;
	skipReason: z52.ZodNullable<z52.ZodEnum<{
		agent_paused: "agent_paused";
		concurrency_cap: "concurrency_cap";
		consent_check_unavailable: "consent_check_unavailable";
		consent_revoked: "consent_revoked";
		no_consent: "no_consent";
		no_phone_number: "no_phone_number";
		outside_hours: "outside_hours";
		retries_exhausted: "retries_exhausted";
		suppressed: "suppressed";
	}>>;
	attempts: z52.ZodNumber;
	nextAttemptAt: z52.ZodNullable<z52.ZodISODateTime>;
	lastAttemptAt: z52.ZodNullable<z52.ZodISODateTime>;
}, z52.core.$strict>;
/** The callback of a form Inquiry. */
type InquiryCallback = z52.infer<typeof inquiryCallbackSchema>;
/**
* The Contact Consent evidence an Inquiry carries: the channel, the exact wording version shown
* and the page it was shown on. The wording text itself is in core's ledger. `phoneGranted` is
* whether the Prospect ticked the callback box.
*/
declare const inquiryConsentSchema: z52.ZodObject<{
	wordingId: z52.core.$ZodBranded<z52.ZodString, "cwd", "out">;
	wordingVersion: z52.ZodNumber;
	sourceUrl: z52.ZodString;
	phoneGranted: z52.ZodBoolean;
}, z52.core.$strict>;
/**
* An Inquiry: a request from a Prospect through a form, a Chat or a Call to talk to the
* Organization. `consent` is set for a form (and a Chat that captured a callback consent) and null
* for a Call. The Prospect's name, email and number are on the Prospect, not here. `chatId` is set
* exactly for a Chat Inquiry and `callId` for a Call Inquiry or once a callback connected.
*/
declare const inquirySchema: z52.ZodObject<{
	id: z52.core.$ZodBranded<z52.ZodString, "inq", "out">;
	source: z52.ZodEnum<{
		call: "call";
		chat: "chat";
		form: "form";
	}>;
	prospectId: z52.core.$ZodBranded<z52.ZodString, "prs", "out">;
	assignedToMembershipId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "mem", "out">>;
	chatId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "cht", "out">>;
	callId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "call", "out">>;
	consent: z52.ZodNullable<z52.ZodObject<{
		wordingId: z52.core.$ZodBranded<z52.ZodString, "cwd", "out">;
		wordingVersion: z52.ZodNumber;
		sourceUrl: z52.ZodString;
		phoneGranted: z52.ZodBoolean;
	}, z52.core.$strict>>;
	callback: z52.ZodObject<{
		state: z52.ZodEnum<{
			connected: "connected";
			dialling: "dialling";
			failed: "failed";
			no_answer: "no_answer";
			not_applicable: "not_applicable";
			pending: "pending";
			skipped: "skipped";
		}>;
		skipReason: z52.ZodNullable<z52.ZodEnum<{
			agent_paused: "agent_paused";
			concurrency_cap: "concurrency_cap";
			consent_check_unavailable: "consent_check_unavailable";
			consent_revoked: "consent_revoked";
			no_consent: "no_consent";
			no_phone_number: "no_phone_number";
			outside_hours: "outside_hours";
			retries_exhausted: "retries_exhausted";
			suppressed: "suppressed";
		}>>;
		attempts: z52.ZodNumber;
		nextAttemptAt: z52.ZodNullable<z52.ZodISODateTime>;
		lastAttemptAt: z52.ZodNullable<z52.ZodISODateTime>;
	}, z52.core.$strict>;
	qualification: z52.ZodObject<{
		answers: z52.ZodArray<z52.ZodObject<{
			questionId: z52.core.$ZodBranded<z52.ZodString, "qst", "out">;
			value: z52.ZodNullable<z52.ZodUnion<readonly [z52.ZodPipe<z52.ZodString, z52.ZodString>, z52.ZodNumber, z52.ZodBoolean]>>;
			skipped: z52.ZodBoolean;
		}, z52.core.$strict>>;
		summary: z52.ZodNullable<z52.ZodPipe<z52.ZodString, z52.ZodString>>;
	}, z52.core.$strict>;
	receivedAt: z52.ZodISODateTime;
}, z52.core.$strict>;
/** An Inquiry. */
type Inquiry = z52.infer<typeof inquirySchema>;
/** The path parameters of a request about one Inquiry. */
declare const inquiryParamsSchema: z52.ZodObject<{
	inquiryId: z52.core.$ZodBranded<z52.ZodString, "inq", "out">;
}, z52.core.$strict>;
/** The cursor position an Inquiry list resumes from: latest first, then id. */
declare const inquiryCursorSchema: z52.ZodObject<{
	receivedAt: z52.ZodISODateTime;
	id: z52.core.$ZodBranded<z52.ZodString, "inq", "out">;
}, z52.core.$strict>;
/**
* The query parameters of a request to list Inquiries: latest first, one cursor-paginated page at
* a time, optionally narrowed by source, callback state, Prospect and a time range. What the
* caller sees is decided from the token and a filter never widens it.
*/
declare const listInquiriesQuerySchema: z52.ZodObject<{
	cursor: z52.ZodOptional<z52.ZodString>;
	limit: z52.ZodDefault<z52.ZodPipe<z52.ZodPipe<z52.ZodUnion<readonly [z52.ZodNumber, z52.ZodString]>, z52.ZodTransform<number, string | number>>, z52.ZodNumber>>;
	source: z52.ZodOptional<z52.ZodEnum<{
		call: "call";
		chat: "chat";
		form: "form";
	}>>;
	callbackState: z52.ZodOptional<z52.ZodEnum<{
		connected: "connected";
		dialling: "dialling";
		failed: "failed";
		no_answer: "no_answer";
		not_applicable: "not_applicable";
		pending: "pending";
		skipped: "skipped";
	}>>;
	prospectId: z52.ZodOptional<z52.core.$ZodBranded<z52.ZodString, "prs", "out">>;
	from: z52.ZodOptional<z52.ZodISODateTime>;
	to: z52.ZodOptional<z52.ZodISODateTime>;
}, z52.core.$strict>;
/** The query parameters of a request to list Inquiries. */
type ListInquiriesQuery = z52.infer<typeof listInquiriesQuerySchema>;
/** One page of Inquiries. */
declare const inquiryPageSchema: z52.ZodObject<{
	items: z52.ZodArray<z52.ZodObject<{
		id: z52.core.$ZodBranded<z52.ZodString, "inq", "out">;
		source: z52.ZodEnum<{
			call: "call";
			chat: "chat";
			form: "form";
		}>;
		prospectId: z52.core.$ZodBranded<z52.ZodString, "prs", "out">;
		assignedToMembershipId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "mem", "out">>;
		chatId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "cht", "out">>;
		callId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "call", "out">>;
		consent: z52.ZodNullable<z52.ZodObject<{
			wordingId: z52.core.$ZodBranded<z52.ZodString, "cwd", "out">;
			wordingVersion: z52.ZodNumber;
			sourceUrl: z52.ZodString;
			phoneGranted: z52.ZodBoolean;
		}, z52.core.$strict>>;
		callback: z52.ZodObject<{
			state: z52.ZodEnum<{
				connected: "connected";
				dialling: "dialling";
				failed: "failed";
				no_answer: "no_answer";
				not_applicable: "not_applicable";
				pending: "pending";
				skipped: "skipped";
			}>;
			skipReason: z52.ZodNullable<z52.ZodEnum<{
				agent_paused: "agent_paused";
				concurrency_cap: "concurrency_cap";
				consent_check_unavailable: "consent_check_unavailable";
				consent_revoked: "consent_revoked";
				no_consent: "no_consent";
				no_phone_number: "no_phone_number";
				outside_hours: "outside_hours";
				retries_exhausted: "retries_exhausted";
				suppressed: "suppressed";
			}>>;
			attempts: z52.ZodNumber;
			nextAttemptAt: z52.ZodNullable<z52.ZodISODateTime>;
			lastAttemptAt: z52.ZodNullable<z52.ZodISODateTime>;
		}, z52.core.$strict>;
		qualification: z52.ZodObject<{
			answers: z52.ZodArray<z52.ZodObject<{
				questionId: z52.core.$ZodBranded<z52.ZodString, "qst", "out">;
				value: z52.ZodNullable<z52.ZodUnion<readonly [z52.ZodPipe<z52.ZodString, z52.ZodString>, z52.ZodNumber, z52.ZodBoolean]>>;
				skipped: z52.ZodBoolean;
			}, z52.core.$strict>>;
			summary: z52.ZodNullable<z52.ZodPipe<z52.ZodString, z52.ZodString>>;
		}, z52.core.$strict>;
		receivedAt: z52.ZodISODateTime;
	}, z52.core.$strict>>;
	nextCursor: z52.ZodNullable<z52.ZodString>;
}, z52.core.$strip>;
/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
declare const inquiryKeyedHeadersSchema: z52.ZodObject<{
	"idempotency-key": z52.ZodString;
}, z52.core.$strip>;
/**
* The embed settings of an Organization's Inquiry form and Chat: the publishable key, the origins
* allowed to submit and the Consent Wording the form displays (null until chosen; an embed with no
* wording is not live). Only Owner and Admin read them.
*/
declare const inquiryEmbedSchema: z52.ZodObject<{
	publishableKey: z52.ZodString;
	allowedOrigins: z52.ZodArray<z52.ZodString>;
	consentWordingId: z52.ZodNullable<z52.core.$ZodBranded<z52.ZodString, "cwd", "out">>;
	updatedAt: z52.ZodNullable<z52.ZodISODateTime>;
}, z52.core.$strict>;
/** The embed settings. */
type InquiryEmbed = z52.infer<typeof inquiryEmbedSchema>;
/** The body of a request to set the allowed origins and the displayed wording; it replaces them, so a repeat changes nothing. */
declare const setInquiryEmbedRequestSchema: z52.ZodObject<{
	allowedOrigins: z52.ZodArray<z52.ZodString>;
	consentWordingId: z52.core.$ZodBranded<z52.ZodString, "cwd", "out">;
}, z52.core.$strict>;
/** The body of a request to set the embed settings. */
type SetInquiryEmbedRequest = z52.infer<typeof setInquiryEmbedRequestSchema>;
/** The path parameters of every public Inquiry route: the publishable key. */
declare const publicInquiryParamsSchema: z52.ZodObject<{
	key: z52.ZodString;
}, z52.core.$strict>;
/**
* The headers of a public request that does not change anything: the `Origin` the browser sends,
* which must be one of the Organization's allowed origins (`inquiry.origin_not_allowed`).
*/
declare const publicOriginHeadersSchema: z52.ZodObject<{
	origin: z52.ZodString;
}, z52.core.$strip>;
/**
* The headers of a public submission: the `Origin` and a required `Idempotency-Key` (16 to 128
* characters; the client generates one per submission), so a double click records one Inquiry and
* causes one callback.
*/
declare const publicInquiryHeadersSchema: z52.ZodObject<{
	origin: z52.ZodString;
	"idempotency-key": z52.ZodString;
}, z52.core.$strip>;
/**
* What the embedded form displays: the Organization's name, the exact Consent Wording to show next
* to the callback box (and its id and version, to send back) and that an AI will make the call. It
* has nothing about any Prospect, Rep or internal id beyond the wording.
*/
declare const publicInquiryFormViewSchema: z52.ZodObject<{
	organizationName: z52.ZodPipe<z52.ZodString, z52.ZodString>;
	wordingId: z52.core.$ZodBranded<z52.ZodString, "cwd", "out">;
	wordingVersion: z52.ZodNumber;
	wordingText: z52.ZodPipe<z52.ZodString, z52.ZodString>;
	aiNotice: z52.ZodPipe<z52.ZodString, z52.ZodString>;
}, z52.core.$strict>;
/** What the embedded form displays. */
type PublicInquiryFormView = z52.infer<typeof publicInquiryFormViewSchema>;
/**
* The body of a public Inquiry from the embedded form. The wording id and version are the ones
* the form displayed and `sourceUrl` is the page it was on: all three are required, so an embed
* that omits the wording is refused here, and the service refuses a version that is not the one it
* served as `inquiry.consent_wording_missing`. `callbackConsent` has no default (the box is
* unticked); when false the Inquiry is stored and no callback is placed. The honeypot, `website`,
* is a field the form hides from people: a non-empty value marks a bot and still parses, so the
* service answers as for a real request and stores nothing. The idempotency key is the
* `Idempotency-Key` header (`publicInquiryHeadersSchema`).
*/
declare const publicInquiryRequestSchema: z52.ZodObject<{
	name: z52.ZodPipe<z52.ZodString, z52.ZodString>;
	phone: z52.ZodPipe<z52.ZodString, z52.ZodString>;
	email: z52.ZodOptional<z52.ZodPipe<z52.ZodPipe<z52.ZodString, z52.ZodTransform<string, string>>, z52.ZodString>>;
	message: z52.ZodOptional<z52.ZodPipe<z52.ZodString, z52.ZodString>>;
	consentWordingId: z52.core.$ZodBranded<z52.ZodString, "cwd", "out">;
	consentWordingVersion: z52.ZodNumber;
	callbackConsent: z52.ZodBoolean;
	sourceUrl: z52.ZodString;
	website: z52.ZodDefault<z52.ZodString>;
}, z52.core.$strict>;
/** The body of a public Inquiry. */
type PublicInquiryRequest = z52.infer<typeof publicInquiryRequestSchema>;
/**
* The receipt a Prospect gets: that it arrived, and when. It says nothing about whether a call is
* coming, so a public caller cannot learn whether a number is suppressed, revoked or blocked by a
* paused Agent or the hours. No Inquiry, Prospect, Rep or Organization id, and no echo of the
* address or number.
*/
declare const publicInquiryReceiptSchema: z52.ZodObject<{
	received: z52.ZodLiteral<true>;
	receivedAt: z52.ZodISODateTime;
}, z52.core.$strict>;
/** The receipt a Prospect gets. */
type PublicInquiryReceipt = z52.infer<typeof publicInquiryReceiptSchema>;
import { z as z53 } from "zod";
/** The kinds of Qualification question: free text, one choice from a list, a number, or yes or no. */
declare const QUALIFICATION_QUESTION_KINDS: readonly ["free_text", "choice", "number", "yes_no"];
/** The kind of a Qualification question. */
declare const qualificationQuestionKindSchema: z53.ZodEnum<{
	choice: "choice";
	free_text: "free_text";
	number: "number";
	yes_no: "yes_no";
}>;
/** The kind of a Qualification question. */
type QualificationQuestionKind = z53.infer<typeof qualificationQuestionKindSchema>;
/** The most Qualification questions an Organization may keep. */
declare const MAX_QUALIFICATION_QUESTIONS = 50;
/** The longest prompt of a Qualification question, in characters. */
declare const MAX_QUESTION_PROMPT_LENGTH = 500;
/** The longest choice or text answer, in characters. */
declare const MAX_ANSWER_LENGTH = 500;
/** The fewest and most choices a `choice` question offers. */
declare const MIN_QUESTION_CHOICES = 2;
/** The most choices a `choice` question offers. */
declare const MAX_QUESTION_CHOICES = 10;
/** The most skip conditions one question may carry. */
declare const MAX_SKIP_CONDITIONS = 5;
/** The most suggestions one request for suggested questions returns. */
declare const MAX_QUESTION_SUGGESTIONS = 10;
/** The wording of a Qualification question: bounded text with no control character. */
declare const questionPromptSchema: z53.ZodPipe<z53.ZodString, z53.ZodString>;
/** The value of a Qualification answer or a skip comparison: text, a number or a yes or no. */
declare const qualificationValueSchema: z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>;
/** The value of a Qualification answer or a skip comparison. */
type QualificationValue = z53.infer<typeof qualificationValueSchema>;
/** The tests a skip condition makes of an earlier answer. */
declare const SKIP_OPERATORS: readonly ["equals", "not_equals", "greater_than", "less_than", "answered", "not_answered"];
/** A test a skip condition makes of an earlier answer. */
declare const skipOperatorSchema: z53.ZodEnum<{
	answered: "answered";
	equals: "equals";
	greater_than: "greater_than";
	less_than: "less_than";
	not_answered: "not_answered";
	not_equals: "not_equals";
}>;
/**
* One condition of the skip logic: a test of the answer to an earlier question. `answered` and
* `not_answered` take no value; every other operator needs one. The service refuses a condition
* that names an unknown question, the question itself, or a later question (a cycle) as
* `agent.question_invalid`.
*/
declare const skipConditionSchema: z53.ZodObject<{
	questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
	operator: z53.ZodEnum<{
		answered: "answered";
		equals: "equals";
		greater_than: "greater_than";
		less_than: "less_than";
		not_answered: "not_answered";
		not_equals: "not_equals";
	}>;
	value: z53.ZodOptional<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
}, z53.core.$strict>;
/** One condition of the skip logic. */
type SkipCondition = z53.infer<typeof skipConditionSchema>;
/**
* A Qualification question an Admin wrote for the Inbound Agent to ask. `position` orders the
* questions from 1. The question is skipped when every condition of `skipWhen` holds (an empty list
* never skips). The questions feed routing as Prospect attributes; a question's wording is
* tenant data and untrusted for display.
*/
declare const qualificationQuestionSchema: z53.ZodObject<{
	id: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
	position: z53.ZodNumber;
	prompt: z53.ZodPipe<z53.ZodString, z53.ZodString>;
	kind: z53.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z53.ZodNullable<z53.ZodArray<z53.ZodPipe<z53.ZodString, z53.ZodString>>>;
	required: z53.ZodBoolean;
	skipWhen: z53.ZodArray<z53.ZodObject<{
		questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
		operator: z53.ZodEnum<{
			answered: "answered";
			equals: "equals";
			greater_than: "greater_than";
			less_than: "less_than";
			not_answered: "not_answered";
			not_equals: "not_equals";
		}>;
		value: z53.ZodOptional<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
	}, z53.core.$strict>>;
}, z53.core.$strict>;
/** A Qualification question. */
type QualificationQuestion = z53.infer<typeof qualificationQuestionSchema>;
/** The path parameters of a request about one Qualification question. */
declare const qualificationQuestionParamsSchema: z53.ZodObject<{
	questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
}, z53.core.$strict>;
/** The body of a request to write a Qualification question; it goes last unless `position` says otherwise. */
declare const createQualificationQuestionRequestSchema: z53.ZodObject<{
	prompt: z53.ZodPipe<z53.ZodString, z53.ZodString>;
	kind: z53.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z53.ZodDefault<z53.ZodNullable<z53.ZodArray<z53.ZodPipe<z53.ZodString, z53.ZodString>>>>;
	required: z53.ZodDefault<z53.ZodBoolean>;
	skipWhen: z53.ZodDefault<z53.ZodArray<z53.ZodObject<{
		questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
		operator: z53.ZodEnum<{
			answered: "answered";
			equals: "equals";
			greater_than: "greater_than";
			less_than: "less_than";
			not_answered: "not_answered";
			not_equals: "not_equals";
		}>;
		value: z53.ZodOptional<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
	}, z53.core.$strict>>>;
	position: z53.ZodOptional<z53.ZodNumber>;
}, z53.core.$strict>;
/** The body of a request to write a Qualification question. */
type CreateQualificationQuestionRequest = z53.infer<typeof createQualificationQuestionRequestSchema>;
/** The body of a request to replace a Qualification question's content; the position changes by reorder. */
declare const updateQualificationQuestionRequestSchema: z53.ZodObject<{
	prompt: z53.ZodPipe<z53.ZodString, z53.ZodString>;
	kind: z53.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z53.ZodNullable<z53.ZodArray<z53.ZodPipe<z53.ZodString, z53.ZodString>>>;
	required: z53.ZodBoolean;
	skipWhen: z53.ZodArray<z53.ZodObject<{
		questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
		operator: z53.ZodEnum<{
			answered: "answered";
			equals: "equals";
			greater_than: "greater_than";
			less_than: "less_than";
			not_answered: "not_answered";
			not_equals: "not_equals";
		}>;
		value: z53.ZodOptional<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
	}, z53.core.$strict>>;
}, z53.core.$strict>;
/** The body of a request to replace a Qualification question. */
type UpdateQualificationQuestionRequest = z53.infer<typeof updateQualificationQuestionRequestSchema>;
/** The body of a request to reorder the questions: every id once, in the new order. */
declare const reorderQualificationQuestionsRequestSchema: z53.ZodObject<{
	questionIds: z53.ZodArray<z53.core.$ZodBranded<z53.ZodString, "qst", "out">>;
}, z53.core.$strict>;
/** The query parameters of a request to list questions, in order of position. */
declare const listQualificationQuestionsQuerySchema: z53.ZodObject<{
	cursor: z53.ZodOptional<z53.ZodString>;
	limit: z53.ZodDefault<z53.ZodPipe<z53.ZodPipe<z53.ZodUnion<readonly [z53.ZodNumber, z53.ZodString]>, z53.ZodTransform<number, string | number>>, z53.ZodNumber>>;
}, z53.core.$strict>;
/** One page of Qualification questions. */
declare const qualificationQuestionPageSchema: z53.ZodObject<{
	items: z53.ZodArray<z53.ZodObject<{
		id: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
		position: z53.ZodNumber;
		prompt: z53.ZodPipe<z53.ZodString, z53.ZodString>;
		kind: z53.ZodEnum<{
			choice: "choice";
			free_text: "free_text";
			number: "number";
			yes_no: "yes_no";
		}>;
		choices: z53.ZodNullable<z53.ZodArray<z53.ZodPipe<z53.ZodString, z53.ZodString>>>;
		required: z53.ZodBoolean;
		skipWhen: z53.ZodArray<z53.ZodObject<{
			questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
			operator: z53.ZodEnum<{
				answered: "answered";
				equals: "equals";
				greater_than: "greater_than";
				less_than: "less_than";
				not_answered: "not_answered";
				not_equals: "not_equals";
			}>;
			value: z53.ZodOptional<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
		}, z53.core.$strict>>;
	}, z53.core.$strict>>;
	nextCursor: z53.ZodNullable<z53.ZodString>;
}, z53.core.$strip>;
/** A suggested question, drawn from the Organization's won Deals; an Admin approves it by creating it. It has no id and is not stored. */
declare const suggestedQualificationQuestionSchema: z53.ZodObject<{
	prompt: z53.ZodPipe<z53.ZodString, z53.ZodString>;
	kind: z53.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z53.ZodNullable<z53.ZodArray<z53.ZodPipe<z53.ZodString, z53.ZodString>>>;
}, z53.core.$strict>;
/** A suggested question. */
type SuggestedQualificationQuestion = z53.infer<typeof suggestedQualificationQuestionSchema>;
/** The answer to a request for suggestions: at most ten, not stored. */
declare const questionSuggestionsSchema: z53.ZodObject<{
	items: z53.ZodArray<z53.ZodObject<{
		prompt: z53.ZodPipe<z53.ZodString, z53.ZodString>;
		kind: z53.ZodEnum<{
			choice: "choice";
			free_text: "free_text";
			number: "number";
			yes_no: "yes_no";
		}>;
		choices: z53.ZodNullable<z53.ZodArray<z53.ZodPipe<z53.ZodString, z53.ZodString>>>;
	}, z53.core.$strict>>;
}, z53.core.$strict>;
/**
* One answer of a Qualification. `value` is null when the question was skipped by its skip logic or
* the Prospect declined; `skipped` says which of the two cases a null is.
*/
declare const qualificationAnswerSchema: z53.ZodObject<{
	questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
	value: z53.ZodNullable<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
	skipped: z53.ZodBoolean;
}, z53.core.$strict>;
/** One answer of a Qualification. */
type QualificationAnswer = z53.infer<typeof qualificationAnswerSchema>;
/** The longest Qualification summary, in characters. */
declare const MAX_QUALIFICATION_SUMMARY_LENGTH = 2e3;
/**
* The Qualification of an Inquiry: the answers so far and a short summary (null until the Agent
* writes one). It is tenant data about a Prospect, and untrusted text: it came from the Prospect.
*/
declare const qualificationSchema: z53.ZodObject<{
	answers: z53.ZodArray<z53.ZodObject<{
		questionId: z53.core.$ZodBranded<z53.ZodString, "qst", "out">;
		value: z53.ZodNullable<z53.ZodUnion<readonly [z53.ZodPipe<z53.ZodString, z53.ZodString>, z53.ZodNumber, z53.ZodBoolean]>>;
		skipped: z53.ZodBoolean;
	}, z53.core.$strict>>;
	summary: z53.ZodNullable<z53.ZodPipe<z53.ZodString, z53.ZodString>>;
}, z53.core.$strict>;
/** The Qualification of an Inquiry. */
type Qualification = z53.infer<typeof qualificationSchema>;
/** Every role: each reads the Inquiries they may see. */
declare const INQUIRY_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that set up the embed and its key. */
declare const INQUIRY_ADMIN_ROLES: readonly ["owner", "admin"];
/** The roles that retry a callback. */
declare const INQUIRY_MANAGER_ROLES: readonly ["owner", "admin", "manager"];
/** The Inquiry routes, by name. */
type InquiryRouteName = "publicGetInquiryForm" | "publicSubmitInquiry" | "getInquiryEmbed" | "setInquiryEmbed" | "rotateInquiryEmbedKey" | "listInquiries" | "getInquiry" | "retryInquiryCallback";
/** One Inquiry route. */
type InquiryRoute = InboundRoute<InquiryErrorCode | AgentErrorCode>;
/**
* The Inquiry routes (spec M14). The public routes take the Organization\'s publishable key in the
* path and the browser\'s `Origin` header, and reveal no Rep or internal id. No route or body can
* place a callback without a Contact Consent for the phone channel (ADR 0003).
*/
declare const INQUIRY_ROUTES: Readonly<Record<InquiryRouteName, InquiryRoute>>;
import { z as z54 } from "zod";
/** Where an Inquiry came from: a form embedded on the Organization's site, a Chat, or a Call to a Line. */
declare const INQUIRY_SOURCES: readonly ["form", "chat", "call"];
/** Where an Inquiry came from. */
declare const inquirySourceSchema: z54.ZodEnum<{
	call: "call";
	chat: "chat";
	form: "form";
}>;
/** Where an Inquiry came from. */
type InquirySource = z54.infer<typeof inquirySourceSchema>;
/**
* The states of the Agent's callback for a form Inquiry. `not_applicable` is a Chat or a Call
* Inquiry (the Prospect initiated it live); `pending` waits to be dialled; `dialling` and
* `connected` follow the attempt; `no_answer` waits for a retry (at most two); `skipped` did not
* happen and `skipReason` says why; `failed` ended in an error.
*/
declare const INQUIRY_CALLBACK_STATES: readonly ["not_applicable", "pending", "dialling", "connected", "no_answer", "skipped", "failed"];
/** The state of the callback for an Inquiry. */
declare const inquiryCallbackStateSchema: z54.ZodEnum<{
	connected: "connected";
	dialling: "dialling";
	failed: "failed";
	no_answer: "no_answer";
	not_applicable: "not_applicable";
	pending: "pending";
	skipped: "skipped";
}>;
/** The state of the callback for an Inquiry. */
type InquiryCallbackState = z54.infer<typeof inquiryCallbackStateSchema>;
/**
* Why a callback did not happen: a closed list the portal maps to its own wording (user story 27).
* Each one is a refusal of the gate, never a setting. `no_consent` includes a Prospect who did not
* tick the callback box; `consent_check_unavailable` is core unreachable, which counts as "no".
*/
declare const INQUIRY_SKIP_REASONS: readonly ["agent_paused", "no_consent", "consent_revoked", "suppressed", "outside_hours", "consent_check_unavailable", "no_phone_number", "concurrency_cap", "retries_exhausted"];
/** Why a callback did not happen. */
declare const inquirySkipReasonSchema: z54.ZodEnum<{
	agent_paused: "agent_paused";
	concurrency_cap: "concurrency_cap";
	consent_check_unavailable: "consent_check_unavailable";
	consent_revoked: "consent_revoked";
	no_consent: "no_consent";
	no_phone_number: "no_phone_number";
	outside_hours: "outside_hours";
	retries_exhausted: "retries_exhausted";
	suppressed: "suppressed";
}>;
/** Why a callback did not happen. */
type InquirySkipReason = z54.infer<typeof inquirySkipReasonSchema>;
/** The most callback attempts for one Inquiry: the first and at most two retries. */
declare const MAX_CALLBACK_ATTEMPTS = 3;
/** The most origins an Organization may allow to submit its Inquiry form or Chat. */
declare const MAX_ALLOWED_ORIGINS = 20;
/**
* A web origin: scheme, host and optional port, with no path, query or wildcard. `https` only,
* except `http://localhost` and `http://127.0.0.1` for development. It is what a browser sends in
* the `Origin` header.
*/
declare const allowedOriginSchema: z54.ZodString;
/** A web origin. */
type AllowedOrigin = z54.infer<typeof allowedOriginSchema>;
/**
* The publishable key of an Organization's Inquiry form and Chat: 32 to 64 URL-safe characters. It
* is shown in the Organization's web pages, so it is not a secret in itself; what it opens is
* limited to the allowed origins, and it can be rotated. Services still redact it from logs.
*/
declare const inquiryKeySchema: z54.ZodString;
/** The longest URL of the page a form or Chat was used on, in characters. */
declare const MAX_SOURCE_URL_LENGTH = 2048;
/** The address of the page a Prospect submitted the form on, or opened the Chat on: an `http(s)` URL with no whitespace. Evidence for the Contact Consent. */
declare const sourceUrlSchema: z54.ZodString;
/** The longest message a Prospect may leave with a form Inquiry, in characters. */
declare const MAX_INQUIRY_MESSAGE_LENGTH = 2e3;
/** The message a Prospect leaves with a form Inquiry: bounded text with no control character, untrusted. */
declare const inquiryMessageSchema: z54.ZodPipe<z54.ZodString, z54.ZodString>;
/** The longest honeypot value a public form may send. */
declare const MAX_HONEYPOT_LENGTH = 200;
import { z as z55 } from "zod";
/** The DNS records a domain check looks at. */
declare const DOMAIN_CHECK_RECORDS: readonly ["spf", "dkim", "dmarc"];
/** A DNS record a domain check looks at. */
declare const domainCheckRecordSchema: z55.ZodEnum<{
	dkim: "dkim";
	dmarc: "dmarc";
	spf: "spf";
}>;
/** A DNS record a domain check looks at. */
type DomainCheckRecord = z55.infer<typeof domainCheckRecordSchema>;
/**
* How one record came out: `pass`, `weak` (present but not enough, such as a DMARC policy of
* `none`), `fail` (present and wrong), `missing`, or `unknown` (the resolver could not answer, or
* DKIM selectors of the provider could not be found).
*/
declare const DOMAIN_CHECK_STATUSES: readonly ["pass", "weak", "fail", "missing", "unknown"];
/** How one record came out. */
declare const domainCheckStatusSchema: z55.ZodEnum<{
	fail: "fail";
	missing: "missing";
	pass: "pass";
	unknown: "unknown";
	weak: "weak";
}>;
/** How one record came out. */
type DomainCheckStatus = z55.infer<typeof domainCheckStatusSchema>;
/** The longest explanation or suggested record of a check, in characters. */
declare const MAX_DOMAIN_CHECK_TEXT_LENGTH = 1e3;
/**
* One record's result: its status, a plain-language explanation of what it means and what to
* fix, and, when there is something to add, the record to publish. The explanation is written
* by Closeline; DNS text read from the domain is not copied into it.
*/
declare const domainCheckResultSchema: z55.ZodObject<{
	record: z55.ZodEnum<{
		dkim: "dkim";
		dmarc: "dmarc";
		spf: "spf";
	}>;
	status: z55.ZodEnum<{
		fail: "fail";
		missing: "missing";
		pass: "pass";
		unknown: "unknown";
		weak: "weak";
	}>;
	explanation: z55.ZodString;
	suggestedRecord: z55.ZodNullable<z55.ZodString>;
}, z55.core.$strip>;
/** One record's result. */
type DomainCheckResult = z55.infer<typeof domainCheckResultSchema>;
/**
* The state of a Mailbox's domain: the domain the Mailbox sends from, one result for each of SPF,
* DKIM and DMARC, and when it was checked. `checkedAt` is null and `results` empty until the
* first check.
*/
declare const domainCheckSchema: z55.ZodObject<{
	mailboxId: z55.core.$ZodBranded<z55.ZodString, "mbx", "out">;
	domain: z55.ZodString;
	results: z55.ZodArray<z55.ZodObject<{
		record: z55.ZodEnum<{
			dkim: "dkim";
			dmarc: "dmarc";
			spf: "spf";
		}>;
		status: z55.ZodEnum<{
			fail: "fail";
			missing: "missing";
			pass: "pass";
			unknown: "unknown";
			weak: "weak";
		}>;
		explanation: z55.ZodString;
		suggestedRecord: z55.ZodNullable<z55.ZodString>;
	}, z55.core.$strip>>;
	checkedAt: z55.ZodNullable<z55.ZodISODateTime>;
}, z55.core.$strip>;
/** The state of a Mailbox's domain. */
type DomainCheck = z55.infer<typeof domainCheckSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh4513 } from "..";
/**
* The errors the mail routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A Mailbox of another Organization, or one the caller may not see (a
* Rep's view of another Rep's Mailbox), is `mailbox.not_found` (404, never 403), and the same
* holds for send records, so existence is not revealed. A refused send is never the provider's
* text: only these codes.
*
* - `mailbox.not_found` (404): unknown or not the caller's to see.
* - `mailbox.not_connected` (409): the Mailbox is disconnected, or none is connected to send from.
* - `mailbox.limit_reached` (429): a per-day, per-hour or minimum-gap limit stops the send now;
*   `details` carries which and `retryAfter` (the `Retry-After` header too).
* - `mailbox.paused` (409): the Mailbox is paused by a person or automatically; nothing is sent.
* - `mailbox.auth_revoked` (409): the provider revoked or expired the grant; the Mailbox is
*   `disconnected` until its owner reconnects.
* - `mailbox.already_connected` (409): the address is already a connected Mailbox of the
*   Organization.
* - `mailbox.limit_above_ceiling` (422): a limit is above the Organization's ceiling or its gap
*   below the floor.
* - `mailbox.oauth_state_invalid` (400): the connection attempt is unknown, expired, already used
*   or another person's.
* - `send.suppressed` (409): core says the Prospect's address is suppressed; nothing was sent.
* - `send.no_consent` (409): the channel needs a Contact Consent the Prospect has not given.
* - `send.unverified_address` (422): the address is not verified and the Admin did not accept
*   unverified ones.
* - `send.outside_window` (409): the Campaign's or Mailbox's send window is closed; the send is
*   deferred to the next opening.
* - `send.duplicate` (409): that send key was already used; the earlier record stands.
* - `send.campaign_not_running` (409): the Campaign is not running.
* - `send.organization_cap_reached` (429): the Organization's daily cap across Mailboxes is used.
* - `send.not_found` (404): the send record is unknown or not the caller's to see.
* - `unsubscribe.invalid_token` (400): the token of a public unsubscribe route is tampered,
*   expired or unknown. It answers the same for all three and never says which.
*/
declare const MAIL_ERRORS: {
	readonly "mailbox.already_connected": ErrorDefinition_8gwh4513<"mailbox.already_connected">;
	readonly "mailbox.auth_revoked": ErrorDefinition_8gwh4513<"mailbox.auth_revoked">;
	readonly "mailbox.limit_above_ceiling": ErrorDefinition_8gwh4513<"mailbox.limit_above_ceiling">;
	readonly "mailbox.limit_reached": ErrorDefinition_8gwh4513<"mailbox.limit_reached">;
	readonly "mailbox.not_connected": ErrorDefinition_8gwh4513<"mailbox.not_connected">;
	readonly "mailbox.not_found": ErrorDefinition_8gwh4513<"mailbox.not_found">;
	readonly "mailbox.oauth_state_invalid": ErrorDefinition_8gwh4513<"mailbox.oauth_state_invalid">;
	readonly "mailbox.paused": ErrorDefinition_8gwh4513<"mailbox.paused">;
	readonly "send.campaign_not_running": ErrorDefinition_8gwh4513<"send.campaign_not_running">;
	readonly "send.duplicate": ErrorDefinition_8gwh4513<"send.duplicate">;
	readonly "send.no_consent": ErrorDefinition_8gwh4513<"send.no_consent">;
	readonly "send.not_found": ErrorDefinition_8gwh4513<"send.not_found">;
	readonly "send.organization_cap_reached": ErrorDefinition_8gwh4513<"send.organization_cap_reached">;
	readonly "send.outside_window": ErrorDefinition_8gwh4513<"send.outside_window">;
	readonly "send.suppressed": ErrorDefinition_8gwh4513<"send.suppressed">;
	readonly "send.unverified_address": ErrorDefinition_8gwh4513<"send.unverified_address">;
	readonly "unsubscribe.invalid_token": ErrorDefinition_8gwh4513<"unsubscribe.invalid_token">;
};
/** A mail error code. */
type MailErrorCode = keyof typeof MAIL_ERRORS;
import { z as z56 } from "zod";
/**
* `mailbox.state_changed` (version 1): a Mailbox moved between states, by a person or by the
* service. `ownerMembershipId` is the person to tell (null for a shared Mailbox, whose Admins are
* told). `reason` is a closed value; it is null when the new state is not `paused` or
* `disconnected`. Ids and values only.
*/
declare const mailboxStateChangedEvent: {
	type: "mailbox.state_changed";
	version: 1;
	schema: z56.ZodObject<{
		id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
		occurredAt: z56.ZodISODateTime;
		organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
		region: z56.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z56.ZodLiteral<"mailbox.state_changed">;
		version: z56.ZodLiteral<1>;
		data: z56.ZodObject<{
			mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
			ownerMembershipId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "mem", "out">>;
			from: z56.ZodEnum<{
				disconnected: "disconnected";
				healthy: "healthy";
				limited: "limited";
				paused: "paused";
				warming: "warming";
			}>;
			to: z56.ZodEnum<{
				disconnected: "disconnected";
				healthy: "healthy";
				limited: "limited";
				paused: "paused";
				warming: "warming";
			}>;
			reason: z56.ZodNullable<z56.ZodEnum<{
				admin_paused: "admin_paused";
				auth_revoked: "auth_revoked";
				bounce_spike: "bounce_spike";
				complaint_spike: "complaint_spike";
				disconnected_by_owner: "disconnected_by_owner";
				health_warning: "health_warning";
				owner_paused: "owner_paused";
				provider_suspended: "provider_suspended";
			}>>;
			changedAt: z56.ZodISODateTime;
		}, z56.core.$strict>;
	}, z56.core.$strip>;
	parse: (input: unknown) => {
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mailbox.state_changed";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			ownerMembershipId: (string & z56.$brand<"mem">) | null;
			from: "disconnected" | "healthy" | "limited" | "paused" | "warming";
			to: "disconnected" | "healthy" | "limited" | "paused" | "warming";
			reason: "admin_paused" | "auth_revoked" | "bounce_spike" | "complaint_spike" | "disconnected_by_owner" | "health_warning" | "owner_paused" | "provider_suspended" | null;
			changedAt: string;
		};
	};
	safeParse: (input: unknown) => z56.ZodSafeParseResult<{
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mailbox.state_changed";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			ownerMembershipId: (string & z56.$brand<"mem">) | null;
			from: "disconnected" | "healthy" | "limited" | "paused" | "warming";
			to: "disconnected" | "healthy" | "limited" | "paused" | "warming";
			reason: "admin_paused" | "auth_revoked" | "bounce_spike" | "complaint_spike" | "disconnected_by_owner" | "health_warning" | "owner_paused" | "provider_suspended" | null;
			changedAt: string;
		};
	}>;
};
/**
* `mail.bounced` (version 1): a send bounced. A `hard` bounce suppresses the address and stops the
* Enrollment; a `soft` one is retried within bounds. No address, no provider text.
*/
declare const mailBouncedEvent: {
	type: "mail.bounced";
	version: 1;
	schema: z56.ZodObject<{
		id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
		occurredAt: z56.ZodISODateTime;
		organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
		region: z56.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z56.ZodLiteral<"mail.bounced">;
		version: z56.ZodLiteral<1>;
		data: z56.ZodObject<{
			mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
			prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
			sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
			campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
			enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
			providerMessageId: z56.ZodString;
			kind: z56.ZodEnum<{
				hard: "hard";
				soft: "soft";
			}>;
			bouncedAt: z56.ZodISODateTime;
		}, z56.core.$strict>;
	}, z56.core.$strip>;
	parse: (input: unknown) => {
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.bounced";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			kind: "hard" | "soft";
			bouncedAt: string;
		};
	};
	safeParse: (input: unknown) => z56.ZodSafeParseResult<{
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.bounced";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			kind: "hard" | "soft";
			bouncedAt: string;
		};
	}>;
};
/** `mail.complained` (version 1): the provider reported a spam complaint; the Mailbox is paused and the address suppressed. Ids only. */
declare const mailComplainedEvent: {
	type: "mail.complained";
	version: 1;
	schema: z56.ZodObject<{
		id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
		occurredAt: z56.ZodISODateTime;
		organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
		region: z56.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z56.ZodLiteral<"mail.complained">;
		version: z56.ZodLiteral<1>;
		data: z56.ZodObject<{
			mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
			prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
			sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
			campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
			enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
			providerMessageId: z56.ZodString;
			complainedAt: z56.ZodISODateTime;
		}, z56.core.$strict>;
	}, z56.core.$strip>;
	parse: (input: unknown) => {
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.complained";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			complainedAt: string;
		};
	};
	safeParse: (input: unknown) => z56.ZodSafeParseResult<{
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.complained";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			complainedAt: string;
		};
	}>;
};
/**
* `mail.replied` (version 1): a Prospect replied; the Enrollment stops and the inbox ingests the
* Message. Ids only: no body, no subject (the inbox fetches the text through its own API).
*/
declare const mailRepliedEvent: {
	type: "mail.replied";
	version: 1;
	schema: z56.ZodObject<{
		id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
		occurredAt: z56.ZodISODateTime;
		organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
		region: z56.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z56.ZodLiteral<"mail.replied">;
		version: z56.ZodLiteral<1>;
		data: z56.ZodObject<{
			mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
			prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
			sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
			campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
			enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
			providerMessageId: z56.ZodString;
			repliedAt: z56.ZodISODateTime;
		}, z56.core.$strict>;
	}, z56.core.$strip>;
	parse: (input: unknown) => {
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.replied";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			repliedAt: string;
		};
	};
	safeParse: (input: unknown) => z56.ZodSafeParseResult<{
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.replied";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			repliedAt: string;
		};
	}>;
};
/** `mail.out_of_office` (version 1): an automatic reply said the Prospect is away; no stop, the Sequence waits until `returnDate` when it is known. Ids and a date. */
declare const mailOutOfOfficeEvent: {
	type: "mail.out_of_office";
	version: 1;
	schema: z56.ZodObject<{
		id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
		occurredAt: z56.ZodISODateTime;
		organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
		region: z56.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z56.ZodLiteral<"mail.out_of_office">;
		version: z56.ZodLiteral<1>;
		data: z56.ZodObject<{
			mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
			prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
			sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
			campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
			enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
			providerMessageId: z56.ZodString;
			returnDate: z56.ZodNullable<z56.ZodISODate>;
			receivedAt: z56.ZodISODateTime;
		}, z56.core.$strict>;
	}, z56.core.$strip>;
	parse: (input: unknown) => {
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.out_of_office";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			returnDate: string | null;
			receivedAt: string;
		};
	};
	safeParse: (input: unknown) => z56.ZodSafeParseResult<{
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.out_of_office";
		version: 1;
		data: {
			mailboxId: string & z56.$brand<"mbx">;
			prospectId: string & z56.$brand<"prs">;
			sendId: (string & z56.$brand<"snd">) | null;
			campaignId: (string & z56.$brand<"cpg">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			providerMessageId: string;
			returnDate: string | null;
			receivedAt: string;
		};
	}>;
};
/**
* `mail.unsubscribed` (version 1): a Prospect unsubscribed through the link or the one-click
* header. Outbound has already told core to suppress the address; the Sequence stops. `source` is
* `link` or `one_click`. Ids only.
*/
declare const mailUnsubscribedEvent: {
	type: "mail.unsubscribed";
	version: 1;
	schema: z56.ZodObject<{
		id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
		occurredAt: z56.ZodISODateTime;
		organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
		region: z56.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z56.ZodLiteral<"mail.unsubscribed">;
		version: z56.ZodLiteral<1>;
		data: z56.ZodObject<{
			prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
			mailboxId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "mbx", "out">>;
			sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
			enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
			source: z56.ZodEnum<{
				link: "link";
				one_click: "one_click";
			}>;
			unsubscribedAt: z56.ZodISODateTime;
		}, z56.core.$strict>;
	}, z56.core.$strip>;
	parse: (input: unknown) => {
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.unsubscribed";
		version: 1;
		data: {
			prospectId: string & z56.$brand<"prs">;
			mailboxId: (string & z56.$brand<"mbx">) | null;
			sendId: (string & z56.$brand<"snd">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			source: "link" | "one_click";
			unsubscribedAt: string;
		};
	};
	safeParse: (input: unknown) => z56.ZodSafeParseResult<{
		id: string & z56.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z56.$brand<"org">;
		region: "eu" | "us";
		type: "mail.unsubscribed";
		version: 1;
		data: {
			prospectId: string & z56.$brand<"prs">;
			mailboxId: (string & z56.$brand<"mbx">) | null;
			sendId: (string & z56.$brand<"snd">) | null;
			enrollmentId: (string & z56.$brand<"enr">) | null;
			source: "link" | "one_click";
			unsubscribedAt: string;
		};
	}>;
};
/** Every mail event, by type. */
declare const MAIL_EVENTS: {
	readonly "mailbox.state_changed": {
		type: "mailbox.state_changed";
		version: 1;
		schema: z56.ZodObject<{
			id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
			occurredAt: z56.ZodISODateTime;
			organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
			region: z56.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z56.ZodLiteral<"mailbox.state_changed">;
			version: z56.ZodLiteral<1>;
			data: z56.ZodObject<{
				mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
				ownerMembershipId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "mem", "out">>;
				from: z56.ZodEnum<{
					disconnected: "disconnected";
					healthy: "healthy";
					limited: "limited";
					paused: "paused";
					warming: "warming";
				}>;
				to: z56.ZodEnum<{
					disconnected: "disconnected";
					healthy: "healthy";
					limited: "limited";
					paused: "paused";
					warming: "warming";
				}>;
				reason: z56.ZodNullable<z56.ZodEnum<{
					admin_paused: "admin_paused";
					auth_revoked: "auth_revoked";
					bounce_spike: "bounce_spike";
					complaint_spike: "complaint_spike";
					disconnected_by_owner: "disconnected_by_owner";
					health_warning: "health_warning";
					owner_paused: "owner_paused";
					provider_suspended: "provider_suspended";
				}>>;
				changedAt: z56.ZodISODateTime;
			}, z56.core.$strict>;
		}, z56.core.$strip>;
		parse: (input: unknown) => {
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mailbox.state_changed";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				ownerMembershipId: (string & z56.$brand<"mem">) | null;
				from: "disconnected" | "healthy" | "limited" | "paused" | "warming";
				to: "disconnected" | "healthy" | "limited" | "paused" | "warming";
				reason: "admin_paused" | "auth_revoked" | "bounce_spike" | "complaint_spike" | "disconnected_by_owner" | "health_warning" | "owner_paused" | "provider_suspended" | null;
				changedAt: string;
			};
		};
		safeParse: (input: unknown) => z56.ZodSafeParseResult<{
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mailbox.state_changed";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				ownerMembershipId: (string & z56.$brand<"mem">) | null;
				from: "disconnected" | "healthy" | "limited" | "paused" | "warming";
				to: "disconnected" | "healthy" | "limited" | "paused" | "warming";
				reason: "admin_paused" | "auth_revoked" | "bounce_spike" | "complaint_spike" | "disconnected_by_owner" | "health_warning" | "owner_paused" | "provider_suspended" | null;
				changedAt: string;
			};
		}>;
	};
	readonly "mail.bounced": {
		type: "mail.bounced";
		version: 1;
		schema: z56.ZodObject<{
			id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
			occurredAt: z56.ZodISODateTime;
			organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
			region: z56.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z56.ZodLiteral<"mail.bounced">;
			version: z56.ZodLiteral<1>;
			data: z56.ZodObject<{
				mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
				prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
				sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
				campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
				enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
				providerMessageId: z56.ZodString;
				kind: z56.ZodEnum<{
					hard: "hard";
					soft: "soft";
				}>;
				bouncedAt: z56.ZodISODateTime;
			}, z56.core.$strict>;
		}, z56.core.$strip>;
		parse: (input: unknown) => {
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.bounced";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				kind: "hard" | "soft";
				bouncedAt: string;
			};
		};
		safeParse: (input: unknown) => z56.ZodSafeParseResult<{
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.bounced";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				kind: "hard" | "soft";
				bouncedAt: string;
			};
		}>;
	};
	readonly "mail.complained": {
		type: "mail.complained";
		version: 1;
		schema: z56.ZodObject<{
			id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
			occurredAt: z56.ZodISODateTime;
			organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
			region: z56.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z56.ZodLiteral<"mail.complained">;
			version: z56.ZodLiteral<1>;
			data: z56.ZodObject<{
				mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
				prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
				sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
				campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
				enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
				providerMessageId: z56.ZodString;
				complainedAt: z56.ZodISODateTime;
			}, z56.core.$strict>;
		}, z56.core.$strip>;
		parse: (input: unknown) => {
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.complained";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				complainedAt: string;
			};
		};
		safeParse: (input: unknown) => z56.ZodSafeParseResult<{
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.complained";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				complainedAt: string;
			};
		}>;
	};
	readonly "mail.replied": {
		type: "mail.replied";
		version: 1;
		schema: z56.ZodObject<{
			id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
			occurredAt: z56.ZodISODateTime;
			organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
			region: z56.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z56.ZodLiteral<"mail.replied">;
			version: z56.ZodLiteral<1>;
			data: z56.ZodObject<{
				mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
				prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
				sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
				campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
				enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
				providerMessageId: z56.ZodString;
				repliedAt: z56.ZodISODateTime;
			}, z56.core.$strict>;
		}, z56.core.$strip>;
		parse: (input: unknown) => {
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.replied";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				repliedAt: string;
			};
		};
		safeParse: (input: unknown) => z56.ZodSafeParseResult<{
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.replied";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				repliedAt: string;
			};
		}>;
	};
	readonly "mail.out_of_office": {
		type: "mail.out_of_office";
		version: 1;
		schema: z56.ZodObject<{
			id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
			occurredAt: z56.ZodISODateTime;
			organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
			region: z56.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z56.ZodLiteral<"mail.out_of_office">;
			version: z56.ZodLiteral<1>;
			data: z56.ZodObject<{
				mailboxId: z56.core.$ZodBranded<z56.ZodString, "mbx", "out">;
				prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
				sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
				campaignId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "cpg", "out">>;
				enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
				providerMessageId: z56.ZodString;
				returnDate: z56.ZodNullable<z56.ZodISODate>;
				receivedAt: z56.ZodISODateTime;
			}, z56.core.$strict>;
		}, z56.core.$strip>;
		parse: (input: unknown) => {
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.out_of_office";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				returnDate: string | null;
				receivedAt: string;
			};
		};
		safeParse: (input: unknown) => z56.ZodSafeParseResult<{
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.out_of_office";
			version: 1;
			data: {
				mailboxId: string & z56.$brand<"mbx">;
				prospectId: string & z56.$brand<"prs">;
				sendId: (string & z56.$brand<"snd">) | null;
				campaignId: (string & z56.$brand<"cpg">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				providerMessageId: string;
				returnDate: string | null;
				receivedAt: string;
			};
		}>;
	};
	readonly "mail.unsubscribed": {
		type: "mail.unsubscribed";
		version: 1;
		schema: z56.ZodObject<{
			id: z56.core.$ZodBranded<z56.ZodString, "evt", "out">;
			occurredAt: z56.ZodISODateTime;
			organizationId: z56.core.$ZodBranded<z56.ZodString, "org", "out">;
			region: z56.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z56.ZodLiteral<"mail.unsubscribed">;
			version: z56.ZodLiteral<1>;
			data: z56.ZodObject<{
				prospectId: z56.core.$ZodBranded<z56.ZodString, "prs", "out">;
				mailboxId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "mbx", "out">>;
				sendId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "snd", "out">>;
				enrollmentId: z56.ZodNullable<z56.core.$ZodBranded<z56.ZodString, "enr", "out">>;
				source: z56.ZodEnum<{
					link: "link";
					one_click: "one_click";
				}>;
				unsubscribedAt: z56.ZodISODateTime;
			}, z56.core.$strict>;
		}, z56.core.$strip>;
		parse: (input: unknown) => {
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.unsubscribed";
			version: 1;
			data: {
				prospectId: string & z56.$brand<"prs">;
				mailboxId: (string & z56.$brand<"mbx">) | null;
				sendId: (string & z56.$brand<"snd">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				source: "link" | "one_click";
				unsubscribedAt: string;
			};
		};
		safeParse: (input: unknown) => z56.ZodSafeParseResult<{
			id: string & z56.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z56.$brand<"org">;
			region: "eu" | "us";
			type: "mail.unsubscribed";
			version: 1;
			data: {
				prospectId: string & z56.$brand<"prs">;
				mailboxId: (string & z56.$brand<"mbx">) | null;
				sendId: (string & z56.$brand<"snd">) | null;
				enrollmentId: (string & z56.$brand<"enr">) | null;
				source: "link" | "one_click";
				unsubscribedAt: string;
			};
		}>;
	};
};
/** The type of a mail event. */
type MailEventType = keyof typeof MAIL_EVENTS;
import { z as z57 } from "zod";
/** The days of sending a health score looks at. */
declare const HEALTH_WINDOW_DAYS = 14;
/** The fewest sends in the window below which a Mailbox shows `not_enough_data` instead of a score. A starting value. */
declare const HEALTH_MINIMUM_SAMPLE = 30;
/** The score below which a Mailbox's daily limit is halved. A starting value. */
declare const HEALTH_WARNING_SCORE = 70;
/** The score below which a Mailbox is paused. A starting value. */
declare const HEALTH_CRITICAL_SCORE = 40;
/**
* What a health score is made of: `hard_bounce_rate`, `complaint_rate`, `soft_bounce_error_rate`
* (soft bounces and send errors), `reply_rate` (a reply helps) and `provider_warnings` (a count).
*/
declare const HEALTH_COMPONENTS: readonly ["hard_bounce_rate", "complaint_rate", "soft_bounce_error_rate", "reply_rate", "provider_warnings"];
/** What a health score is made of. */
declare const healthComponentKindSchema: z57.ZodEnum<{
	complaint_rate: "complaint_rate";
	hard_bounce_rate: "hard_bounce_rate";
	provider_warnings: "provider_warnings";
	reply_rate: "reply_rate";
	soft_bounce_error_rate: "soft_bounce_error_rate";
}>;
/** What a health score is made of. */
type HealthComponentKind = z57.infer<typeof healthComponentKindSchema>;
/** How one component stands against its thresholds. */
declare const healthComponentStateSchema: z57.ZodEnum<{
	critical: "critical";
	ok: "ok";
	warning: "warning";
}>;
/** How one component stands. */
type HealthComponentState = z57.infer<typeof healthComponentStateSchema>;
/**
* One reason behind a health score: the component, its measured value over the window (a rate from
* 0 to 1, or a count for `provider_warnings`), its stated weight (0 to 100, all weights summing to
* 100) and its warning and critical thresholds in the same unit, and where it stands.
*/
declare const healthComponentSchema: z57.ZodObject<{
	component: z57.ZodEnum<{
		complaint_rate: "complaint_rate";
		hard_bounce_rate: "hard_bounce_rate";
		provider_warnings: "provider_warnings";
		reply_rate: "reply_rate";
		soft_bounce_error_rate: "soft_bounce_error_rate";
	}>;
	value: z57.ZodNumber;
	weight: z57.ZodNumber;
	warningThreshold: z57.ZodNumber;
	criticalThreshold: z57.ZodNumber;
	state: z57.ZodEnum<{
		critical: "critical";
		ok: "ok";
		warning: "warning";
	}>;
}, z57.core.$strip>;
/** One reason behind a health score. */
type HealthComponent = z57.infer<typeof healthComponentSchema>;
/**
* The health of a Mailbox over the last 14 days: a 0 to 100 score with its components, or
* `not_enough_data` with a null score when the sends are fewer than `minimumSample`. The
* `effect` says what the score does now: nothing, the daily limit halved, or the Mailbox paused.
*/
declare const mailboxHealthSchema: z57.ZodObject<{
	mailboxId: z57.core.$ZodBranded<z57.ZodString, "mbx", "out">;
	status: z57.ZodEnum<{
		not_enough_data: "not_enough_data";
		scored: "scored";
	}>;
	score: z57.ZodNullable<z57.ZodNumber>;
	effect: z57.ZodEnum<{
		limit_halved: "limit_halved";
		none: "none";
		paused: "paused";
	}>;
	windowDays: z57.ZodNumber;
	sampleSize: z57.ZodNumber;
	minimumSample: z57.ZodNumber;
	components: z57.ZodArray<z57.ZodObject<{
		component: z57.ZodEnum<{
			complaint_rate: "complaint_rate";
			hard_bounce_rate: "hard_bounce_rate";
			provider_warnings: "provider_warnings";
			reply_rate: "reply_rate";
			soft_bounce_error_rate: "soft_bounce_error_rate";
		}>;
		value: z57.ZodNumber;
		weight: z57.ZodNumber;
		warningThreshold: z57.ZodNumber;
		criticalThreshold: z57.ZodNumber;
		state: z57.ZodEnum<{
			critical: "critical";
			ok: "ok";
			warning: "warning";
		}>;
	}, z57.core.$strip>>;
	scoredAt: z57.ZodISODateTime;
}, z57.core.$strip>;
/** The short form of a Mailbox's health shown on the Mailbox itself: status, score, effect and when it was scored. */
declare const healthSummarySchema: z57.ZodObject<{
	status: z57.ZodEnum<{
		not_enough_data: "not_enough_data";
		scored: "scored";
	}>;
	score: z57.ZodNullable<z57.ZodNumber>;
	effect: z57.ZodEnum<{
		limit_halved: "limit_halved";
		none: "none";
		paused: "paused";
	}>;
	scoredAt: z57.ZodISODateTime;
}, z57.core.$strip>;
/** The short form of a Mailbox's health. */
type HealthSummary = z57.infer<typeof healthSummarySchema>;
/** The health of a Mailbox. */
type MailboxHealth = z57.infer<typeof mailboxHealthSchema>;
/** One day of a Mailbox's stored health: the date (`YYYY-MM-DD`, UTC), the score and the day's counts. */
declare const healthDailySchema: z57.ZodObject<{
	date: z57.ZodISODate;
	score: z57.ZodNullable<z57.ZodNumber>;
	sent: z57.ZodNumber;
	hardBounces: z57.ZodNumber;
	softBounces: z57.ZodNumber;
	complaints: z57.ZodNumber;
	replies: z57.ZodNumber;
	errors: z57.ZodNumber;
	components: z57.ZodArray<z57.ZodObject<{
		component: z57.ZodEnum<{
			complaint_rate: "complaint_rate";
			hard_bounce_rate: "hard_bounce_rate";
			provider_warnings: "provider_warnings";
			reply_rate: "reply_rate";
			soft_bounce_error_rate: "soft_bounce_error_rate";
		}>;
		value: z57.ZodNumber;
		weight: z57.ZodNumber;
		warningThreshold: z57.ZodNumber;
		criticalThreshold: z57.ZodNumber;
		state: z57.ZodEnum<{
			critical: "critical";
			ok: "ok";
			warning: "warning";
		}>;
	}, z57.core.$strip>>;
}, z57.core.$strip>;
/** One day of a Mailbox's stored health. */
type HealthDaily = z57.infer<typeof healthDailySchema>;
/** The query of a request for a Mailbox's daily health history, newest day first. */
declare const listHealthHistoryQuerySchema: z57.ZodObject<{
	cursor: z57.ZodOptional<z57.ZodString>;
	limit: z57.ZodDefault<z57.ZodPipe<z57.ZodPipe<z57.ZodUnion<readonly [z57.ZodNumber, z57.ZodString]>, z57.ZodTransform<number, string | number>>, z57.ZodNumber>>;
}, z57.core.$strict>;
/** One page of daily health. */
declare const healthDailyPageSchema: z57.ZodObject<{
	items: z57.ZodArray<z57.ZodObject<{
		date: z57.ZodISODate;
		score: z57.ZodNullable<z57.ZodNumber>;
		sent: z57.ZodNumber;
		hardBounces: z57.ZodNumber;
		softBounces: z57.ZodNumber;
		complaints: z57.ZodNumber;
		replies: z57.ZodNumber;
		errors: z57.ZodNumber;
		components: z57.ZodArray<z57.ZodObject<{
			component: z57.ZodEnum<{
				complaint_rate: "complaint_rate";
				hard_bounce_rate: "hard_bounce_rate";
				provider_warnings: "provider_warnings";
				reply_rate: "reply_rate";
				soft_bounce_error_rate: "soft_bounce_error_rate";
			}>;
			value: z57.ZodNumber;
			weight: z57.ZodNumber;
			warningThreshold: z57.ZodNumber;
			criticalThreshold: z57.ZodNumber;
			state: z57.ZodEnum<{
				critical: "critical";
				ok: "ok";
				warning: "warning";
			}>;
		}, z57.core.$strip>>;
	}, z57.core.$strip>>;
	nextCursor: z57.ZodNullable<z57.ZodString>;
}, z57.core.$strip>;
/** The cursor position a health history resumes from: the last date returned. */
declare const healthHistoryCursorSchema: z57.ZodObject<{
	date: z57.ZodISODate;
}, z57.core.$strict>;
import { z as z58 } from "zod";
/**
* What a Mailbox can see happen to a message: a `hard_bounce` (the address is dead; suppresses it
* and stops the Sequence), a `soft_bounce` (retried within bounds), a `complaint` (pauses the
* Mailbox and suppresses the address), a `reply` (stops the Enrollment and goes to the inbox), an
* `out_of_office` (no stop; the Sequence waits) and an `unsubscribe`.
*/
declare const MAIL_EVENT_KINDS: readonly ["hard_bounce", "soft_bounce", "complaint", "reply", "out_of_office", "unsubscribe"];
/** What a Mailbox can see happen to a message. */
declare const mailEventKindSchema: z58.ZodEnum<{
	complaint: "complaint";
	hard_bounce: "hard_bounce";
	out_of_office: "out_of_office";
	reply: "reply";
	soft_bounce: "soft_bounce";
	unsubscribe: "unsubscribe";
}>;
/** What a Mailbox can see happen to a message. */
type MailEventKind = z58.infer<typeof mailEventKindSchema>;
/** The id the provider gave a message (an email Message-ID or a Graph id): printable ASCII with no space, 1 to 255 characters. */
declare const mailProviderMessageIdSchema: z58.ZodString;
/**
* One mail event, as the Admin audits it. `sendId` is the send it concerns (null for an event on a
* message the Organization did not send through Closeline, such as an unsolicited reply),
* `enrollmentId` the Enrollment it stopped or paused. `returnDate` is the date an out-of-office
* gave, only on that kind. It holds no body, no subject and no address: replies are fetched only
* to be handed to the inbox and are never stored or logged here.
*/
declare const mailEventSchema: z58.ZodObject<{
	id: z58.core.$ZodBranded<z58.ZodString, "mev", "out">;
	mailboxId: z58.core.$ZodBranded<z58.ZodString, "mbx", "out">;
	kind: z58.ZodEnum<{
		complaint: "complaint";
		hard_bounce: "hard_bounce";
		out_of_office: "out_of_office";
		reply: "reply";
		soft_bounce: "soft_bounce";
		unsubscribe: "unsubscribe";
	}>;
	sendId: z58.ZodNullable<z58.core.$ZodBranded<z58.ZodString, "snd", "out">>;
	prospectId: z58.ZodNullable<z58.core.$ZodBranded<z58.ZodString, "prs", "out">>;
	enrollmentId: z58.ZodNullable<z58.core.$ZodBranded<z58.ZodString, "enr", "out">>;
	providerMessageId: z58.ZodString;
	returnDate: z58.ZodNullable<z58.ZodISODate>;
	occurredAt: z58.ZodISODateTime;
	recordedAt: z58.ZodISODateTime;
}, z58.core.$strip>;
/** One mail event. */
type MailEvent = z58.infer<typeof mailEventSchema>;
/** The cursor position a mail event list resumes from: newest first, then id. */
declare const mailEventCursorSchema: z58.ZodObject<{
	occurredAt: z58.ZodISODateTime;
	id: z58.core.$ZodBranded<z58.ZodString, "mev", "out">;
}, z58.core.$strict>;
/** The query of a request to list mail events, newest first, narrowed by Mailbox, kind, Prospect and time. */
declare const listMailEventsQuerySchema: z58.ZodObject<{
	cursor: z58.ZodOptional<z58.ZodString>;
	limit: z58.ZodDefault<z58.ZodPipe<z58.ZodPipe<z58.ZodUnion<readonly [z58.ZodNumber, z58.ZodString]>, z58.ZodTransform<number, string | number>>, z58.ZodNumber>>;
	mailboxId: z58.ZodOptional<z58.core.$ZodBranded<z58.ZodString, "mbx", "out">>;
	kind: z58.ZodOptional<z58.ZodEnum<{
		complaint: "complaint";
		hard_bounce: "hard_bounce";
		out_of_office: "out_of_office";
		reply: "reply";
		soft_bounce: "soft_bounce";
		unsubscribe: "unsubscribe";
	}>>;
	prospectId: z58.ZodOptional<z58.core.$ZodBranded<z58.ZodString, "prs", "out">>;
	from: z58.ZodOptional<z58.ZodISODateTime>;
	to: z58.ZodOptional<z58.ZodISODateTime>;
}, z58.core.$strict>;
/** The query of a request to list mail events. */
type ListMailEventsQuery = z58.infer<typeof listMailEventsQuerySchema>;
/** One page of mail events. */
declare const mailEventPageSchema: z58.ZodObject<{
	items: z58.ZodArray<z58.ZodObject<{
		id: z58.core.$ZodBranded<z58.ZodString, "mev", "out">;
		mailboxId: z58.core.$ZodBranded<z58.ZodString, "mbx", "out">;
		kind: z58.ZodEnum<{
			complaint: "complaint";
			hard_bounce: "hard_bounce";
			out_of_office: "out_of_office";
			reply: "reply";
			soft_bounce: "soft_bounce";
			unsubscribe: "unsubscribe";
		}>;
		sendId: z58.ZodNullable<z58.core.$ZodBranded<z58.ZodString, "snd", "out">>;
		prospectId: z58.ZodNullable<z58.core.$ZodBranded<z58.ZodString, "prs", "out">>;
		enrollmentId: z58.ZodNullable<z58.core.$ZodBranded<z58.ZodString, "enr", "out">>;
		providerMessageId: z58.ZodString;
		returnDate: z58.ZodNullable<z58.ZodISODate>;
		occurredAt: z58.ZodISODateTime;
		recordedAt: z58.ZodISODateTime;
	}, z58.core.$strip>>;
	nextCursor: z58.ZodNullable<z58.ZodString>;
}, z58.core.$strip>;
import { z as z59 } from "zod";
/** The longest display name of a Mailbox, in characters. */
declare const MAX_MAILBOX_NAME_LENGTH = 100;
/**
* A Mailbox as every response shows it. It has no token, secret, refresh token, authorization code
* or key field of any kind: those never leave outbound. The schema strips fields it does not
* name, so a row that carries a token loses it when the response is built from this schema.
* `ownerMembershipId` is null for a `shared` Mailbox, which lists the Teams that may use it in
* `teamIds` (empty for a personal one). `health` is the summary (full reasons are the health
* route); `limits` are the ones set and `effectiveLimits` those that apply now after the ramp and
* the health score.
*/
declare const mailboxSchema: z59.ZodObject<{
	id: z59.core.$ZodBranded<z59.ZodString, "mbx", "out">;
	provider: z59.ZodEnum<{
		gmail: "gmail";
		outlook: "outlook";
	}>;
	kind: z59.ZodEnum<{
		personal: "personal";
		shared: "shared";
	}>;
	address: z59.ZodPipe<z59.ZodPipe<z59.ZodString, z59.ZodTransform<string, string>>, z59.ZodString>;
	displayName: z59.ZodPipe<z59.ZodString, z59.ZodString>;
	ownerMembershipId: z59.ZodNullable<z59.core.$ZodBranded<z59.ZodString, "mem", "out">>;
	teamIds: z59.ZodArray<z59.core.$ZodBranded<z59.ZodString, "team", "out">>;
	state: z59.ZodEnum<{
		disconnected: "disconnected";
		healthy: "healthy";
		limited: "limited";
		paused: "paused";
		warming: "warming";
	}>;
	stateReason: z59.ZodNullable<z59.ZodEnum<{
		admin_paused: "admin_paused";
		auth_revoked: "auth_revoked";
		bounce_spike: "bounce_spike";
		complaint_spike: "complaint_spike";
		disconnected_by_owner: "disconnected_by_owner";
		health_warning: "health_warning";
		owner_paused: "owner_paused";
		provider_suspended: "provider_suspended";
	}>>;
	limits: z59.ZodObject<{
		perDay: z59.ZodNumber;
		perHour: z59.ZodNumber;
		minGapSeconds: z59.ZodNumber;
		window: z59.ZodObject<{
			timeZone: z59.ZodString;
			days: z59.ZodArray<z59.ZodEnum<{
				fri: "fri";
				mon: "mon";
				sat: "sat";
				sun: "sun";
				thu: "thu";
				tue: "tue";
				wed: "wed";
			}>>;
			startMinute: z59.ZodNumber;
			endMinute: z59.ZodNumber;
		}, z59.core.$strict>;
	}, z59.core.$strict>;
	effectiveLimits: z59.ZodObject<{
		perDay: z59.ZodNumber;
		perHour: z59.ZodNumber;
		minGapSeconds: z59.ZodNumber;
	}, z59.core.$strip>;
	ramp: z59.ZodObject<{
		active: z59.ZodBoolean;
		dayIndex: z59.ZodNumber;
		perDayNow: z59.ZodNullable<z59.ZodNumber>;
		steps: z59.ZodArray<z59.ZodObject<{
			fromDay: z59.ZodNumber;
			perDay: z59.ZodNumber;
		}, z59.core.$strict>>;
	}, z59.core.$strip>;
	health: z59.ZodObject<{
		status: z59.ZodEnum<{
			not_enough_data: "not_enough_data";
			scored: "scored";
		}>;
		score: z59.ZodNullable<z59.ZodNumber>;
		effect: z59.ZodEnum<{
			limit_halved: "limit_halved";
			none: "none";
			paused: "paused";
		}>;
		scoredAt: z59.ZodISODateTime;
	}, z59.core.$strip>;
	connectedAt: z59.ZodISODateTime;
	lastSyncedAt: z59.ZodNullable<z59.ZodISODateTime>;
}, z59.core.$strip>;
/** A Mailbox. */
type Mailbox = z59.infer<typeof mailboxSchema>;
/** The path parameters of a request about one Mailbox. */
declare const mailboxParamsSchema: z59.ZodObject<{
	mailboxId: z59.core.$ZodBranded<z59.ZodString, "mbx", "out">;
}, z59.core.$strict>;
/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
declare const mailKeyedHeadersSchema: z59.ZodObject<{
	"idempotency-key": z59.ZodString;
}, z59.core.$strip>;
/** The cursor position a Mailbox list resumes from: oldest connected first, then id. */
declare const mailboxCursorSchema: z59.ZodObject<{
	connectedAt: z59.ZodISODateTime;
	id: z59.core.$ZodBranded<z59.ZodString, "mbx", "out">;
}, z59.core.$strict>;
/** The query of a request to list Mailboxes, narrowed by state, provider, kind and owner. What the caller sees is decided from the token. */
declare const listMailboxesQuerySchema: z59.ZodObject<{
	cursor: z59.ZodOptional<z59.ZodString>;
	limit: z59.ZodDefault<z59.ZodPipe<z59.ZodPipe<z59.ZodUnion<readonly [z59.ZodNumber, z59.ZodString]>, z59.ZodTransform<number, string | number>>, z59.ZodNumber>>;
	state: z59.ZodOptional<z59.ZodEnum<{
		disconnected: "disconnected";
		healthy: "healthy";
		limited: "limited";
		paused: "paused";
		warming: "warming";
	}>>;
	provider: z59.ZodOptional<z59.ZodEnum<{
		gmail: "gmail";
		outlook: "outlook";
	}>>;
	kind: z59.ZodOptional<z59.ZodEnum<{
		personal: "personal";
		shared: "shared";
	}>>;
	ownerMembershipId: z59.ZodOptional<z59.core.$ZodBranded<z59.ZodString, "mem", "out">>;
}, z59.core.$strict>;
/** The query of a request to list Mailboxes. */
type ListMailboxesQuery = z59.infer<typeof listMailboxesQuerySchema>;
/** One page of Mailboxes. */
declare const mailboxPageSchema: z59.ZodObject<{
	items: z59.ZodArray<z59.ZodObject<{
		id: z59.core.$ZodBranded<z59.ZodString, "mbx", "out">;
		provider: z59.ZodEnum<{
			gmail: "gmail";
			outlook: "outlook";
		}>;
		kind: z59.ZodEnum<{
			personal: "personal";
			shared: "shared";
		}>;
		address: z59.ZodPipe<z59.ZodPipe<z59.ZodString, z59.ZodTransform<string, string>>, z59.ZodString>;
		displayName: z59.ZodPipe<z59.ZodString, z59.ZodString>;
		ownerMembershipId: z59.ZodNullable<z59.core.$ZodBranded<z59.ZodString, "mem", "out">>;
		teamIds: z59.ZodArray<z59.core.$ZodBranded<z59.ZodString, "team", "out">>;
		state: z59.ZodEnum<{
			disconnected: "disconnected";
			healthy: "healthy";
			limited: "limited";
			paused: "paused";
			warming: "warming";
		}>;
		stateReason: z59.ZodNullable<z59.ZodEnum<{
			admin_paused: "admin_paused";
			auth_revoked: "auth_revoked";
			bounce_spike: "bounce_spike";
			complaint_spike: "complaint_spike";
			disconnected_by_owner: "disconnected_by_owner";
			health_warning: "health_warning";
			owner_paused: "owner_paused";
			provider_suspended: "provider_suspended";
		}>>;
		limits: z59.ZodObject<{
			perDay: z59.ZodNumber;
			perHour: z59.ZodNumber;
			minGapSeconds: z59.ZodNumber;
			window: z59.ZodObject<{
				timeZone: z59.ZodString;
				days: z59.ZodArray<z59.ZodEnum<{
					fri: "fri";
					mon: "mon";
					sat: "sat";
					sun: "sun";
					thu: "thu";
					tue: "tue";
					wed: "wed";
				}>>;
				startMinute: z59.ZodNumber;
				endMinute: z59.ZodNumber;
			}, z59.core.$strict>;
		}, z59.core.$strict>;
		effectiveLimits: z59.ZodObject<{
			perDay: z59.ZodNumber;
			perHour: z59.ZodNumber;
			minGapSeconds: z59.ZodNumber;
		}, z59.core.$strip>;
		ramp: z59.ZodObject<{
			active: z59.ZodBoolean;
			dayIndex: z59.ZodNumber;
			perDayNow: z59.ZodNullable<z59.ZodNumber>;
			steps: z59.ZodArray<z59.ZodObject<{
				fromDay: z59.ZodNumber;
				perDay: z59.ZodNumber;
			}, z59.core.$strict>>;
		}, z59.core.$strip>;
		health: z59.ZodObject<{
			status: z59.ZodEnum<{
				not_enough_data: "not_enough_data";
				scored: "scored";
			}>;
			score: z59.ZodNullable<z59.ZodNumber>;
			effect: z59.ZodEnum<{
				limit_halved: "limit_halved";
				none: "none";
				paused: "paused";
			}>;
			scoredAt: z59.ZodISODateTime;
		}, z59.core.$strip>;
		connectedAt: z59.ZodISODateTime;
		lastSyncedAt: z59.ZodNullable<z59.ZodISODateTime>;
	}, z59.core.$strip>>;
	nextCursor: z59.ZodNullable<z59.ZodString>;
}, z59.core.$strip>;
/**
* The body of a request to start connecting a Mailbox: the provider and whose it is. A `shared`
* Mailbox (Owner or Admin only) names the Teams that may use it; a `personal` one takes none.
*/
declare const startMailboxConnectRequestSchema: z59.ZodObject<{
	provider: z59.ZodEnum<{
		gmail: "gmail";
		outlook: "outlook";
	}>;
	kind: z59.ZodDefault<z59.ZodEnum<{
		personal: "personal";
		shared: "shared";
	}>>;
	teamIds: z59.ZodDefault<z59.ZodArray<z59.core.$ZodBranded<z59.ZodString, "team", "out">>>;
}, z59.core.$strict>;
/** The body of a request to start connecting a Mailbox. */
type StartMailboxConnectRequest = z59.infer<typeof startMailboxConnectRequestSchema>;
/**
* The answer to starting a connection: where to send the person to consent (an `https` URL of the
* provider) and when that attempt expires. The `state` stays on the server's side of the link: it
* is carried in the URL and checked when the connection is completed.
*/
declare const mailboxConnectStartSchema: z59.ZodObject<{
	authorizationUrl: z59.ZodURL;
	expiresAt: z59.ZodISODateTime;
}, z59.core.$strip>;
/** The answer to starting a connection. */
type MailboxConnectStart = z59.infer<typeof mailboxConnectStartSchema>;
/**
* The body of the request that completes a connection after the provider sent the person back:
* the `state` of the attempt and the authorization `code`. Outbound exchanges the code for tokens
* and stores them encrypted; the code is single-use, is never logged and is never returned.
*/
declare const completeMailboxConnectRequestSchema: z59.ZodObject<{
	state: z59.ZodString;
	code: z59.ZodString;
}, z59.core.$strict>;
/** The body of a request to complete a connection. */
type CompleteMailboxConnectRequest = z59.infer<typeof completeMailboxConnectRequestSchema>;
/** The body of a request to set a Mailbox's limits: the whole set, replacing the old. */
declare const setMailboxLimitsRequestSchema: z59.ZodObject<{
	perDay: z59.ZodNumber;
	perHour: z59.ZodNumber;
	minGapSeconds: z59.ZodNumber;
	window: z59.ZodObject<{
		timeZone: z59.ZodString;
		days: z59.ZodArray<z59.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>>;
		startMinute: z59.ZodNumber;
		endMinute: z59.ZodNumber;
	}, z59.core.$strict>;
}, z59.core.$strict>;
/** The body of a request to set a Mailbox's limits. */
type SetMailboxLimitsRequest = z59.infer<typeof setMailboxLimitsRequestSchema>;
/**
* The Organization's limits: the ceiling no Mailbox may be set above, the floor of the gap, and
* the daily cap across every Mailbox of the Organization.
*/
declare const organizationMailLimitsSchema: z59.ZodObject<{
	perDayCeiling: z59.ZodNumber;
	perHourCeiling: z59.ZodNumber;
	minGapFloorSeconds: z59.ZodNumber;
	organizationDailyCap: z59.ZodNumber;
}, z59.core.$strict>;
/** The Organization's mail limits. */
type OrganizationMailLimits = z59.infer<typeof organizationMailLimitsSchema>;
/**
* What a Mailbox can still send, for a launch check: what remains today and this hour after the
* ramp, its health and what was already sent, whether it can send at all (`usable`) and, when
* not, the state that stops it.
*/
declare const mailboxCapacitySchema: z59.ZodObject<{
	mailboxId: z59.core.$ZodBranded<z59.ZodString, "mbx", "out">;
	state: z59.ZodEnum<{
		disconnected: "disconnected";
		healthy: "healthy";
		limited: "limited";
		paused: "paused";
		warming: "warming";
	}>;
	usable: z59.ZodBoolean;
	remainingToday: z59.ZodNumber;
	remainingThisHour: z59.ZodNumber;
	nextSendAt: z59.ZodNullable<z59.ZodISODateTime>;
}, z59.core.$strip>;
/** What a Mailbox can still send. */
type MailboxCapacity = z59.infer<typeof mailboxCapacitySchema>;
/** The capacity of the Organization's Mailboxes: each Mailbox the caller may see, and the Organization's remaining daily cap. */
declare const mailCapacitySchema: z59.ZodObject<{
	items: z59.ZodArray<z59.ZodObject<{
		mailboxId: z59.core.$ZodBranded<z59.ZodString, "mbx", "out">;
		state: z59.ZodEnum<{
			disconnected: "disconnected";
			healthy: "healthy";
			limited: "limited";
			paused: "paused";
			warming: "warming";
		}>;
		usable: z59.ZodBoolean;
		remainingToday: z59.ZodNumber;
		remainingThisHour: z59.ZodNumber;
		nextSendAt: z59.ZodNullable<z59.ZodISODateTime>;
	}, z59.core.$strip>>;
	nextCursor: z59.ZodNullable<z59.ZodString>;
	organizationRemainingToday: z59.ZodNumber;
	organizationDailyCap: z59.ZodNumber;
}, z59.core.$strip>;
/** The capacity of the Organization's Mailboxes. */
type MailCapacity = z59.infer<typeof mailCapacitySchema>;
/** Every role: each works the Mailboxes they may see. */
declare const MAIL_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that manage the Organization's mail setup. */
declare const MAIL_ADMIN_ROLES: readonly ["owner", "admin"];
/** The roles that review sends, events and capacity. */
declare const MAIL_REVIEW_ROLES: readonly ["owner", "admin", "manager"];
/** The mail routes, by name. */
type MailRouteName = "listMailboxes" | "getMailbox" | "startMailboxConnect" | "completeMailboxConnect" | "disconnectMailbox" | "setMailboxLimits" | "pauseMailbox" | "resumeMailbox" | "getMailboxHealth" | "listMailboxHealthHistory" | "getMailboxDomainCheck" | "checkMailboxDomain" | "getOrganizationMailLimits" | "setOrganizationMailLimits" | "getMailCapacity" | "listSends" | "getSend" | "listMailEvents" | "submitSend" | "receiveGmailNotification" | "receiveGraphNotification" | "getUnsubscribePage" | "confirmUnsubscribe";
/** One mail route. */
type MailRoute = InboundRoute<MailErrorCode>;
/**
* The mail routes (spec M08). Outbound owns them. The `/internal` route uses the shared secret;
* the webhooks and the unsubscribe routes are public and carry no user token. Lists are
* cursor-paginated with a page of at most 100. A route that sends or changes a Mailbox needs an
* Idempotency-Key header.
*/
declare const MAIL_ROUTES: Readonly<Record<MailRouteName, MailRoute>>;
import { z as z60 } from "zod";
/**
* The checks run before every send, in this order: the Campaign is running (`campaign`), the send
* is inside the window (`window`), the address is verified (`address`), core's decision allows it
* (`suppression` and `consent`), the Mailbox is usable (`mailbox`), it is under its limits
* (`limits`), the Organization is under its daily cap (`organization_cap`) and the key is new
* (`idempotency`). None has a setting that turns it off.
*/
declare const SEND_CHECKS: readonly ["campaign", "window", "address", "suppression", "consent", "mailbox", "limits", "organization_cap", "idempotency"];
/** A check run before a send. */
declare const sendCheckSchema: z60.ZodEnum<{
	address: "address";
	campaign: "campaign";
	consent: "consent";
	idempotency: "idempotency";
	limits: "limits";
	mailbox: "mailbox";
	organization_cap: "organization_cap";
	suppression: "suppression";
	window: "window";
}>;
/** A check run before a send. */
type SendCheck = z60.infer<typeof sendCheckSchema>;
/**
* The state of a send record: `sending` (recorded before the transport call; if the process stops
* here the send is reconciled against the provider's Sent folder, never repeated blind), `sent`,
* `refused` (a check said no; never retried blindly), `deferred` (a limit or window said not yet;
* it will be tried again) and `failed` (the provider refused it).
*/
declare const SEND_STATES: readonly ["sending", "sent", "refused", "deferred", "failed"];
/** The state of a send record. */
declare const sendStateSchema: z60.ZodEnum<{
	deferred: "deferred";
	failed: "failed";
	refused: "refused";
	sending: "sending";
	sent: "sent";
}>;
/** The state of a send record. */
type SendState = z60.infer<typeof sendStateSchema>;
/**
* Why a send was refused or deferred: a closed set, never free text. The first six match the
* checks; `campaign_not_running`, `mailbox_unavailable` and `limit_reached` and
* `organization_cap_reached` name the rest. `duplicate` is a key already used.
*/
declare const SEND_REFUSAL_REASONS: readonly ["campaign_not_running", "outside_window", "unverified_address", "suppressed", "no_consent", "mailbox_unavailable", "limit_reached", "organization_cap_reached", "duplicate"];
/** Why a send was refused or deferred. */
declare const sendRefusalReasonSchema: z60.ZodEnum<{
	campaign_not_running: "campaign_not_running";
	duplicate: "duplicate";
	limit_reached: "limit_reached";
	mailbox_unavailable: "mailbox_unavailable";
	no_consent: "no_consent";
	organization_cap_reached: "organization_cap_reached";
	outside_window: "outside_window";
	suppressed: "suppressed";
	unverified_address: "unverified_address";
}>;
/** Why a send was refused or deferred. */
type SendRefusalReason = z60.infer<typeof sendRefusalReasonSchema>;
/** The reasons that defer a send to a later try instead of refusing it for good. */
declare const SEND_DEFERRING_REASONS: readonly ["outside_window", "limit_reached", "organization_cap_reached"];
/** The longest attempt epoch of a send key. */
declare const MAX_ATTEMPT_EPOCH = 1e3;
/** The most Steps a Sequence has, as far as a send key goes. */
declare const MAX_SEQUENCE_STEP = 1e3;
/**
* The send key: an Enrollment, the Step and the attempt epoch. One key is sent at most once, and
* the transport call carries it where the provider allows; otherwise a header of the message does.
*/
declare const sendKeySchema: z60.ZodObject<{
	enrollmentId: z60.core.$ZodBranded<z60.ZodString, "enr", "out">;
	step: z60.ZodNumber;
	attemptEpoch: z60.ZodNumber;
}, z60.core.$strict>;
/** The send key. */
type SendKey = z60.infer<typeof sendKeySchema>;
/** One check and how it came out, as the decision record keeps it. */
declare const sendCheckResultSchema: z60.ZodObject<{
	check: z60.ZodEnum<{
		address: "address";
		campaign: "campaign";
		consent: "consent";
		idempotency: "idempotency";
		limits: "limits";
		mailbox: "mailbox";
		organization_cap: "organization_cap";
		suppression: "suppression";
		window: "window";
	}>;
	passed: z60.ZodBoolean;
}, z60.core.$strip>;
/**
* The record of one send decision: which Step of which Enrollment, through which Mailbox
* (null when none was chosen), what each check said, and the outcome with its reason. A `refused`
* or `deferred` record names the reason, and a `deferred` one `retryAt`; a `sent`, `sending` or
* `failed` one names the Mailbox. It holds no message body, no subject and no address: ids, closed
* values and times only.
*/
declare const sendRecordSchema: z60.ZodObject<{
	id: z60.core.$ZodBranded<z60.ZodString, "snd", "out">;
	campaignId: z60.core.$ZodBranded<z60.ZodString, "cpg", "out">;
	enrollmentId: z60.core.$ZodBranded<z60.ZodString, "enr", "out">;
	prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
	step: z60.ZodNumber;
	attemptEpoch: z60.ZodNumber;
	mailboxId: z60.ZodNullable<z60.core.$ZodBranded<z60.ZodString, "mbx", "out">>;
	state: z60.ZodEnum<{
		deferred: "deferred";
		failed: "failed";
		refused: "refused";
		sending: "sending";
		sent: "sent";
	}>;
	reason: z60.ZodNullable<z60.ZodEnum<{
		campaign_not_running: "campaign_not_running";
		duplicate: "duplicate";
		limit_reached: "limit_reached";
		mailbox_unavailable: "mailbox_unavailable";
		no_consent: "no_consent";
		organization_cap_reached: "organization_cap_reached";
		outside_window: "outside_window";
		suppressed: "suppressed";
		unverified_address: "unverified_address";
	}>>;
	checks: z60.ZodArray<z60.ZodObject<{
		check: z60.ZodEnum<{
			address: "address";
			campaign: "campaign";
			consent: "consent";
			idempotency: "idempotency";
			limits: "limits";
			mailbox: "mailbox";
			organization_cap: "organization_cap";
			suppression: "suppression";
			window: "window";
		}>;
		passed: z60.ZodBoolean;
	}, z60.core.$strip>>;
	retryAt: z60.ZodNullable<z60.ZodISODateTime>;
	decidedAt: z60.ZodISODateTime;
	sentAt: z60.ZodNullable<z60.ZodISODateTime>;
}, z60.core.$strip>;
/** The record of one send decision. */
type SendRecord = z60.infer<typeof sendRecordSchema>;
/** The path parameters of a request about one send record. */
declare const sendParamsSchema: z60.ZodObject<{
	sendId: z60.core.$ZodBranded<z60.ZodString, "snd", "out">;
}, z60.core.$strict>;
/**
* The body of a request to send one Step. The key is the Enrollment, Step and attempt epoch; the
* Idempotency-Key header must carry the same string form (`enr_…:step:epoch`) so a replay answers
* the same record. The message text is not in the body: outbound reads the Draft held by the
* sequence engine.
*/
declare const submitSendRequestSchema: z60.ZodObject<{
	campaignId: z60.core.$ZodBranded<z60.ZodString, "cpg", "out">;
	prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
	key: z60.ZodObject<{
		enrollmentId: z60.core.$ZodBranded<z60.ZodString, "enr", "out">;
		step: z60.ZodNumber;
		attemptEpoch: z60.ZodNumber;
	}, z60.core.$strict>;
	acceptUnverifiedAddress: z60.ZodDefault<z60.ZodBoolean>;
}, z60.core.$strict>;
/** The body of a request to send one Step. */
type SubmitSendRequest = z60.infer<typeof submitSendRequestSchema>;
/** The one string form of a send key used as an Idempotency-Key: `<enrollment id>:<step>:<epoch>`. */
declare function sendKeyToString(key: SendKey): string;
/**
* What a limit refusal carries in `details`: which limit was reached and how many whole seconds to
* wait, as a `Retry-After` header says too.
*/
declare const limitDetailsSchema: z60.ZodObject<{
	limit: z60.ZodEnum<{
		min_gap: "min_gap";
		organization_daily_cap: "organization_daily_cap";
		per_day: "per_day";
		per_hour: "per_hour";
	}>;
	retryAfter: z60.ZodNumber;
}, z60.core.$strict>;
/** What a limit refusal carries in `details`. */
type LimitDetails = z60.infer<typeof limitDetailsSchema>;
/** The cursor position a send list resumes from: newest first, then id. */
declare const sendCursorSchema: z60.ZodObject<{
	decidedAt: z60.ZodISODateTime;
	id: z60.core.$ZodBranded<z60.ZodString, "snd", "out">;
}, z60.core.$strict>;
/** The query of a request to list send records, newest first, narrowed by Campaign, Prospect, Mailbox, state, reason and time. */
declare const listSendsQuerySchema: z60.ZodObject<{
	cursor: z60.ZodOptional<z60.ZodString>;
	limit: z60.ZodDefault<z60.ZodPipe<z60.ZodPipe<z60.ZodUnion<readonly [z60.ZodNumber, z60.ZodString]>, z60.ZodTransform<number, string | number>>, z60.ZodNumber>>;
	campaignId: z60.ZodOptional<z60.core.$ZodBranded<z60.ZodString, "cpg", "out">>;
	prospectId: z60.ZodOptional<z60.core.$ZodBranded<z60.ZodString, "prs", "out">>;
	mailboxId: z60.ZodOptional<z60.core.$ZodBranded<z60.ZodString, "mbx", "out">>;
	state: z60.ZodOptional<z60.ZodEnum<{
		deferred: "deferred";
		failed: "failed";
		refused: "refused";
		sending: "sending";
		sent: "sent";
	}>>;
	reason: z60.ZodOptional<z60.ZodEnum<{
		campaign_not_running: "campaign_not_running";
		duplicate: "duplicate";
		limit_reached: "limit_reached";
		mailbox_unavailable: "mailbox_unavailable";
		no_consent: "no_consent";
		organization_cap_reached: "organization_cap_reached";
		outside_window: "outside_window";
		suppressed: "suppressed";
		unverified_address: "unverified_address";
	}>>;
	from: z60.ZodOptional<z60.ZodISODateTime>;
	to: z60.ZodOptional<z60.ZodISODateTime>;
}, z60.core.$strict>;
/** The query of a request to list send records. */
type ListSendsQuery = z60.infer<typeof listSendsQuerySchema>;
/** One page of send records. */
declare const sendPageSchema: z60.ZodObject<{
	items: z60.ZodArray<z60.ZodObject<{
		id: z60.core.$ZodBranded<z60.ZodString, "snd", "out">;
		campaignId: z60.core.$ZodBranded<z60.ZodString, "cpg", "out">;
		enrollmentId: z60.core.$ZodBranded<z60.ZodString, "enr", "out">;
		prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
		step: z60.ZodNumber;
		attemptEpoch: z60.ZodNumber;
		mailboxId: z60.ZodNullable<z60.core.$ZodBranded<z60.ZodString, "mbx", "out">>;
		state: z60.ZodEnum<{
			deferred: "deferred";
			failed: "failed";
			refused: "refused";
			sending: "sending";
			sent: "sent";
		}>;
		reason: z60.ZodNullable<z60.ZodEnum<{
			campaign_not_running: "campaign_not_running";
			duplicate: "duplicate";
			limit_reached: "limit_reached";
			mailbox_unavailable: "mailbox_unavailable";
			no_consent: "no_consent";
			organization_cap_reached: "organization_cap_reached";
			outside_window: "outside_window";
			suppressed: "suppressed";
			unverified_address: "unverified_address";
		}>>;
		checks: z60.ZodArray<z60.ZodObject<{
			check: z60.ZodEnum<{
				address: "address";
				campaign: "campaign";
				consent: "consent";
				idempotency: "idempotency";
				limits: "limits";
				mailbox: "mailbox";
				organization_cap: "organization_cap";
				suppression: "suppression";
				window: "window";
			}>;
			passed: z60.ZodBoolean;
		}, z60.core.$strip>>;
		retryAt: z60.ZodNullable<z60.ZodISODateTime>;
		decidedAt: z60.ZodISODateTime;
		sentAt: z60.ZodNullable<z60.ZodISODateTime>;
	}, z60.core.$strip>>;
	nextCursor: z60.ZodNullable<z60.ZodString>;
}, z60.core.$strip>;
import { z as z61 } from "zod";
/**
* The signed, expiring token in an unsubscribe link and in the `List-Unsubscribe` header: 22 to
* 512 URL-safe characters. It names the Organization and the message it came in; it is a
* credential, so services redact it from logs, traces and error reports.
*/
declare const unsubscribeTokenSchema: z61.ZodString;
/** The path parameters of the public unsubscribe routes. */
declare const unsubscribeParamsSchema: z61.ZodObject<{
	token: z61.ZodString;
}, z61.core.$strict>;
/**
* What the public unsubscribe page shows before the person confirms: who sent the message (the
* Organization's name) and nothing else. It never shows an address, and a token that is valid
* for an address that is already suppressed shows the same page.
*/
declare const unsubscribePageSchema: z61.ZodObject<{
	organizationName: z61.ZodString;
}, z61.core.$strip>;
/** What the public unsubscribe page shows. */
type UnsubscribePage = z61.infer<typeof unsubscribePageSchema>;
/**
* The answer to an unsubscribe, one click (RFC 8058) or a confirmation: always `unsubscribed`,
* the same for an address that was already suppressed and for one that is unknown, so nothing
* about whether an address exists is revealed.
*/
declare const unsubscribeResultSchema: z61.ZodObject<{
	status: z61.ZodLiteral<"unsubscribed">;
	organizationName: z61.ZodString;
}, z61.core.$strip>;
/** The answer to an unsubscribe. */
type UnsubscribeResult = z61.infer<typeof unsubscribeResultSchema>;
/**
* The one-click POST body a mail client sends (RFC 8058): the form field
* `List-Unsubscribe=One-Click`. Any other body is `request.invalid`.
*/
declare const oneClickUnsubscribeBodySchema: z61.ZodObject<{
	"List-Unsubscribe": z61.ZodLiteral<"One-Click">;
}, z61.core.$strict>;
import { z as z62 } from "zod";
/** The email providers a Mailbox can be connected through. Others are added behind the same port later. */
declare const MAILBOX_PROVIDERS: readonly ["gmail", "outlook"];
/** An email provider a Mailbox is connected through. */
declare const mailboxProviderSchema: z62.ZodEnum<{
	gmail: "gmail";
	outlook: "outlook";
}>;
/** An email provider a Mailbox is connected through. */
type MailboxProvider = z62.infer<typeof mailboxProviderSchema>;
/** Whose address a Mailbox is: a Rep's `personal` one, or a `shared` one an Admin connected for Teams. */
declare const MAILBOX_KINDS: readonly ["personal", "shared"];
/** Whose address a Mailbox is. */
declare const mailboxKindSchema: z62.ZodEnum<{
	personal: "personal";
	shared: "shared";
}>;
/** Whose address a Mailbox is. */
type MailboxKind = z62.infer<typeof mailboxKindSchema>;
/**
* The state of a Mailbox: `warming` (newly connected, following the published ramp), `healthy`,
* `limited` (its limits were lowered because its health fell), `paused` (nothing is sent) and
* `disconnected` (the grant is gone or the owner disconnected it; its tokens are deleted).
*/
declare const MAILBOX_STATES: readonly ["warming", "healthy", "limited", "paused", "disconnected"];
/** The state of a Mailbox. */
declare const mailboxStateSchema: z62.ZodEnum<{
	disconnected: "disconnected";
	healthy: "healthy";
	limited: "limited";
	paused: "paused";
	warming: "warming";
}>;
/** The state of a Mailbox. */
type MailboxState = z62.infer<typeof mailboxStateSchema>;
/**
* Why a Mailbox is in its state: a closed set, never the provider's text. `owner_paused` and
* `admin_paused` are a person's choice; `complaint_spike`, `bounce_spike` and `provider_suspended`
* are automatic; `auth_revoked` is a revoked grant; `disconnected_by_owner` is a disconnect.
*/
declare const MAILBOX_STATE_REASONS: readonly ["owner_paused", "admin_paused", "complaint_spike", "bounce_spike", "provider_suspended", "auth_revoked", "disconnected_by_owner", "health_warning"];
/** Why a Mailbox is in its state. */
declare const mailboxStateReasonSchema: z62.ZodEnum<{
	admin_paused: "admin_paused";
	auth_revoked: "auth_revoked";
	bounce_spike: "bounce_spike";
	complaint_spike: "complaint_spike";
	disconnected_by_owner: "disconnected_by_owner";
	health_warning: "health_warning";
	owner_paused: "owner_paused";
	provider_suspended: "provider_suspended";
}>;
/** Why a Mailbox is in its state. */
type MailboxStateReason = z62.infer<typeof mailboxStateReasonSchema>;
/** The largest number of sends a Mailbox may be set to in a day. */
declare const MAX_SENDS_PER_DAY = 500;
/** The largest number of sends a Mailbox may be set to in an hour. */
declare const MAX_SENDS_PER_HOUR = 100;
/** The longest minimum gap between two sends of a Mailbox, in seconds. */
declare const MAX_MIN_GAP_SECONDS = 3600;
/** The most Teams a shared Mailbox can be opened to. */
declare const MAX_MAILBOX_TEAMS = 50;
/** A time of day as minutes after midnight: 0 to 1439. */
declare const minuteOfDaySchema: z62.ZodNumber;
/**
* When a Mailbox may send: on the listed days, from `startMinute` to before `endMinute`, in the
* time zone. The window ends after it starts and never crosses midnight.
*/
declare const sendWindowSchema: z62.ZodObject<{
	timeZone: z62.ZodString;
	days: z62.ZodArray<z62.ZodEnum<{
		fri: "fri";
		mon: "mon";
		sat: "sat";
		sun: "sun";
		thu: "thu";
		tue: "tue";
		wed: "wed";
	}>>;
	startMinute: z62.ZodNumber;
	endMinute: z62.ZodNumber;
}, z62.core.$strict>;
/** When a Mailbox may send. */
type SendWindow = z62.infer<typeof sendWindowSchema>;
/**
* The limits an Admin or the owner sets on a Mailbox: sends per day and per hour, the least gap
* between two sends, and the send window. The Organization's ceiling bounds them
* (`mailbox.limit_above_ceiling`); the ramp and the health score can only lower what applies.
*/
declare const mailboxLimitsSchema: z62.ZodObject<{
	perDay: z62.ZodNumber;
	perHour: z62.ZodNumber;
	minGapSeconds: z62.ZodNumber;
	window: z62.ZodObject<{
		timeZone: z62.ZodString;
		days: z62.ZodArray<z62.ZodEnum<{
			fri: "fri";
			mon: "mon";
			sat: "sat";
			sun: "sun";
			thu: "thu";
			tue: "tue";
			wed: "wed";
		}>>;
		startMinute: z62.ZodNumber;
		endMinute: z62.ZodNumber;
	}, z62.core.$strict>;
}, z62.core.$strict>;
/** The limits set on a Mailbox. */
type MailboxLimits = z62.infer<typeof mailboxLimitsSchema>;
/** The sends a Mailbox may make now, after the ramp and its health have lowered its set limits. */
declare const effectiveLimitsSchema: z62.ZodObject<{
	perDay: z62.ZodNumber;
	perHour: z62.ZodNumber;
	minGapSeconds: z62.ZodNumber;
}, z62.core.$strip>;
/** The limits that apply to a Mailbox now. */
type EffectiveLimits = z62.infer<typeof effectiveLimitsSchema>;
/**
* The published ramp of a new Mailbox: from `fromDay` (days since it was connected) at most
* `perDay` sends a day. Starting values, tuned against real sending; there is no simulated
* warm-up traffic (ADR for email sending through connected Mailboxes).
*/
declare const MAILBOX_RAMP_STEPS: readonly [{
	readonly fromDay: 0;
	readonly perDay: 10;
}, {
	readonly fromDay: 7;
	readonly perDay: 15;
}, {
	readonly fromDay: 14;
	readonly perDay: 25;
}, {
	readonly fromDay: 21;
	readonly perDay: 40;
}];
/** The Mailbox ramp as shown to its owner. `active` is false once the last step is passed. */
declare const rampSchema: z62.ZodObject<{
	active: z62.ZodBoolean;
	dayIndex: z62.ZodNumber;
	perDayNow: z62.ZodNullable<z62.ZodNumber>;
	steps: z62.ZodArray<z62.ZodObject<{
		fromDay: z62.ZodNumber;
		perDay: z62.ZodNumber;
	}, z62.core.$strict>>;
}, z62.core.$strip>;
/** The ramp of a Mailbox. */
type Ramp = z62.infer<typeof rampSchema>;
import { z as z63 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh4514 } from "..";
/**
* The errors the marketing routes return, as `area.reason` codes. They are the only domain
* errors of the public Demo Request route. `marketing.invalid_request` (400) is a body that fails
* `createDemoRequestRequestSchema`, or a missing or malformed `Idempotency-Key` header; it
* replaces the common `request.invalid` on this route so a Visitor-facing form branches on one
* area. `marketing.rate_limited` (429) is the per-client-address limit, answered with `details`
* of `retryAfterDetailsSchema` (`retryAfter` in seconds) and a `Retry-After` header. Neither
* message says why a request was refused beyond that, and a filled honeypot is not an error.
*/
declare const MARKETING_ERRORS: {
	readonly "marketing.invalid_request": ErrorDefinition_8gwh4514<"marketing.invalid_request">;
	readonly "marketing.rate_limited": ErrorDefinition_8gwh4514<"marketing.rate_limited">;
};
/** A code from the {@link MARKETING_ERRORS} registry. */
type MarketingErrorCode = keyof typeof MARKETING_ERRORS;
/** The most characters a Demo Request message may carry. */
declare const MAX_DEMO_REQUEST_MESSAGE_LENGTH = 2e3;
/** The most characters of the source page path and of the honeypot field. */
declare const MAX_DEMO_REQUEST_FIELD_LENGTH = 200;
/**
* The free-text message of a Demo Request: at most 2,000 characters, trimmed, with line breaks
* and tabs allowed and every other control character refused. It is untrusted text: the team
* email and any display must escape it and never treat it as instructions.
*/
declare const demoRequestMessageSchema: z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>;
/**
* The site page a Visitor submitted from: an absolute path such as `/pricing`, at most 200
* characters of printable ASCII with no whitespace, so a full URL or a script cannot be put in it.
*/
declare const demoRequestSourcePageSchema: z63.ZodString;
/**
* The body of `POST /v1/marketing/demo-requests`, sent by a Visitor (nobody signed in): name, work
* email (folded to lower case), company name, an optional message, the page it came from and a
* honeypot. The honeypot, `website`, is a field the form hides from people: a Visitor leaves it
* empty (and may omit it), so a non-empty value marks a bot. It still parses, so the service can
* answer exactly as it does for a real request and store nothing. The idempotency key is not in
* the body; it is the `Idempotency-Key` header (`idempotencyKeySchema`). The schema is strict:
* an unknown key is `marketing.invalid_request`.
*/
declare const createDemoRequestRequestSchema: z63.ZodObject<{
	name: z63.ZodPipe<z63.ZodString, z63.ZodString>;
	workEmail: z63.ZodPipe<z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>, z63.ZodString>;
	companyName: z63.ZodPipe<z63.ZodString, z63.ZodString>;
	message: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>>;
	sourcePage: z63.ZodString;
	website: z63.ZodDefault<z63.ZodString>;
}, z63.core.$strict>;
/** The body of a request to submit a Demo Request. */
type CreateDemoRequestRequest = z63.infer<typeof createDemoRequestRequestSchema>;
/**
* The acknowledgement of a Demo Request: its id and nothing else, so no submitted field comes
* back. A replay under the same `Idempotency-Key` returns the same id.
*/
declare const createDemoRequestResponseSchema: z63.ZodObject<{
	id: z63.core.$ZodBranded<z63.ZodString, "dreq", "out">;
}, z63.core.$strip>;
/** The acknowledgement of a Demo Request. */
type CreateDemoRequestResponse = z63.infer<typeof createDemoRequestResponseSchema>;
/** What the service needs to describe a marketing route for its OpenAPI document. */
type MarketingRoute = {
	readonly method: "POST";
	readonly path: string;
	/** True: the route takes no token and no Organization; anyone may call it. */
	readonly public: true;
	/** Whether the `Idempotency-Key` header is `required` for this route. */
	readonly idempotencyKey: "required";
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return. */
	readonly errors: readonly MarketingErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document. */
	readonly description: string;
};
/** The marketing routes, by name. */
type MarketingRouteName = "createDemoRequest";
/**
* The marketing routes: the description a service puts in its OpenAPI document, the success
* statuses and every error code each route may answer with. No marketing route answers
* `auth.*`: it is public.
*/
declare const MARKETING_ROUTES: Readonly<Record<MarketingRouteName, MarketingRoute>>;
/**
* Every error code `POST /v1/marketing/demo-requests` may answer with: the two `marketing.*`
* codes first, then the common ones. It never answers `auth.*`, `request.invalid` or
* `rate.limited`: `marketing.invalid_request` and `marketing.rate_limited` stand in for them.
*/
declare const CREATE_DEMO_REQUEST_ERROR_CODES: readonly ["marketing.invalid_request", "marketing.rate_limited", "request.too_large", "request.unsupported_media_type", "request.idempotency_key_reused", "request.idempotency_in_progress", "server.internal", "server.unavailable", "server.timeout"];
import { z as z64 } from "zod";
/** The largest page any list endpoint returns. */
declare const MAX_PAGE_SIZE = 100;
/** The page size used when a request does not ask for one. */
declare const DEFAULT_PAGE_SIZE = 25;
/** The longest cursor accepted or produced; about 380 bytes of JSON. */
declare const MAX_CURSOR_LENGTH = 512;
/** The query parameters of a list request: an optional cursor and a bounded limit (from a number or digit string). */
declare const pageQuerySchema: z64.ZodObject<{
	cursor: z64.ZodOptional<z64.ZodString>;
	limit: z64.ZodDefault<z64.ZodPipe<z64.ZodPipe<z64.ZodUnion<readonly [z64.ZodNumber, z64.ZodString]>, z64.ZodTransform<number, string | number>>, z64.ZodNumber>>;
}, z64.core.$strip>;
/** The parsed query parameters of a list request. */
type PageQuery = z64.infer<typeof pageQuerySchema>;
/** Builds the schema of one page of `itemSchema` items and the cursor for the next page, or null at the end. */
declare function pageSchema<T extends z64.ZodType>(itemSchema: T): z64.ZodObject<{
	items: z64.ZodArray<T>;
	nextCursor: z64.ZodNullable<z64.ZodString>;
}, z64.core.$strip>;
/** One page of items, as returned by a list endpoint. */
type Page<T> = {
	items: T[];
	nextCursor: string | null;
};
/**
* Encodes a JSON-serialisable position as a URL-safe cursor (base64url of its JSON); throws if the
* result would exceed {@link MAX_CURSOR_LENGTH}. A cursor is not signed or encrypted: the client
* can read and forge it, so it must carry only a position. The Organization always comes from the
* verified token, never from a cursor.
*/
declare function encodeCursor(value: unknown): string;
/**
* Decodes a cursor made by {@link encodeCursor}; returns undefined, never throws, for anything
* invalid. The decoded value is client-controlled input: use it as a position only.
*/
declare function decodeCursor<T extends z64.ZodType>(text: string, schema: T): z64.output<T> | undefined;
import { ErrorDefinition as ErrorDefinition_8gwh4515 } from "..";
/**
* The errors the playbook service returns, as `area.reason` codes. No body carries a file name,
* file content or text taken from a document: every message is fixed. A role that is not allowed
* is the common `auth.forbidden`; a malformed multipart body is the common `request.invalid`.
* There is no page-limit code: the page count is checked in the ingestion job, so a document over
* the limit ends in state `failed` with `failureReason: 'too_many_pages'`. `quota_exceeded` covers
* both the document count and the total size and does not say which, as no domain error in this
* library carries typed details. `document.not_restorable` (410) is a deleted
* document whose purge time has passed but which the purge has not yet removed. There is no
* tombstone: once purged the record is gone and the answer is `document.not_found` (404).
*/
declare const PLAYBOOK_ERRORS: {
	readonly "document.not_found": ErrorDefinition_8gwh4515<"document.not_found">;
	readonly "document.not_restorable": ErrorDefinition_8gwh4515<"document.not_restorable">;
	readonly "document.quota_exceeded": ErrorDefinition_8gwh4515<"document.quota_exceeded">;
	readonly "document.too_large": ErrorDefinition_8gwh4515<"document.too_large">;
	readonly "document.unsupported_type": ErrorDefinition_8gwh4515<"document.unsupported_type">;
};
/** A code from the {@link PLAYBOOK_ERRORS} registry. */
type PlaybookErrorCode = keyof typeof PLAYBOOK_ERRORS;
/** The roles that may change the Playbook (ADR 0016, choice 4). */
declare const PLAYBOOK_WRITE_ROLES: readonly ["owner", "admin"];
/** The roles that may list and read documents: every role (ADR 0016, choice 4). */
declare const PLAYBOOK_READ_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The playbook routes, by name. */
type PlaybookRouteName = "uploadDocument" | "listDocuments" | "getDocument" | "deleteDocument" | "restoreDocument" | "removeOrganizationDocuments";
/** What the service needs to describe one route: its method, path, who may call it, what it answers. */
type PlaybookRoute = {
	readonly method: "GET" | "POST" | "DELETE";
	readonly path: string;
	/** True for a route on the internal network only; it takes no role and names the Organization in the path. */
	readonly internal: boolean;
	/** The roles allowed; empty for an internal route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly PlaybookErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The playbook routes: the description a service puts in its OpenAPI document, the roles, the
* success statuses and every error code each route may answer with. Every route may also return
* the common `auth.*`, `rate.limited` and `server.*` codes. A route on another Organization's
* document answers `document.not_found`.
*/
declare const PLAYBOOK_ROUTES: Readonly<Record<PlaybookRouteName, PlaybookRoute>>;
/** The roles that may read Calls, Deals, imports and the rights confirmation: Owner and Admin only, the owner's decision of 2026-10-13 (the writers are the same two roles). Managers and Reps get `auth.forbidden`. */
declare const SALES_HISTORY_READ_ROLES: readonly ["owner", "admin"];
/** The sales-history routes, by name. */
type SalesHistoryRouteName = "uploadCall" | "listCalls" | "getCall" | "deleteCall" | "restoreCall" | "setCallRep" | "listDeals" | "getDeal" | "lookupDeal" | "setDealOutcome" | "uploadDealImport" | "listDealImports" | "getDealImport" | "listDealImportRows" | "getRightsConfirmation" | "confirmRights";
/**
* What the service needs to describe one sales-history route. It has the shape of `PlaybookRoute`
* but its own method list (it adds `PUT`) and its own error codes, so the 0.7.0 `PlaybookRoute`
* type is not widened. Use `ALL_PLAYBOOK_ROUTES` for both tables in one map.
*/
type SalesHistoryRoute = {
	readonly method: "GET" | "POST" | "PUT" | "DELETE";
	readonly path: string;
	/** True for a route on the internal network only; none of these is. */
	readonly internal: boolean;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly SalesHistoryErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The sales-history routes (ADR 0018), described as `PLAYBOOK_ROUTES` describes the document
* routes: method, path, roles, success statuses, domain error codes and the OpenAPI description.
* Every route may also return the common `auth.*`, `rate.limited` and `server.*` codes. A route on
* another Organization's Call, Deal or import answers the not-found code. No response carries a
* Transcript, audio or a turn. Reads are Owner and Admin only ({@link SALES_HISTORY_READ_ROLES}).
*/
declare const SALES_HISTORY_ROUTES: Readonly<Record<SalesHistoryRouteName, SalesHistoryRoute>>;
import { z as z65 } from "zod";
/** The most Moments a search returns (the `limit` ceiling). */
declare const MAX_SEARCH_LIMIT = 20;
/** How many Moments a search returns when `limit` is left out. */
declare const DEFAULT_SEARCH_LIMIT = 5;
/** The most turns in a search query: the live window of the conversation, at most six turns. */
declare const MAX_SEARCH_TURNS = 6;
/** The most characters (Unicode code points) of all the turns of a search query together. */
declare const MAX_SEARCH_TEXT_CHARACTERS = 2e3;
/** The most characters (Unicode code points) of one snippet in a search result. */
declare const MAX_MOMENT_SNIPPET_CHARACTERS = 512;
/** The most candidate Moments a search looks at before it keeps the best `limit`; it bounds `evidence`. */
declare const MAX_SEARCH_CANDIDATES = 100;
/** One turn of the live conversation: who spoke (`rep` or `prospect`) and what was said. Tenant conversation text: never logged. */
declare const searchTurnSchema: z65.ZodObject<{
	role: z65.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
	}>;
	text: z65.ZodString;
}, z65.core.$strict>;
/** One turn of the live conversation. */
type SearchTurn = z65.infer<typeof searchTurnSchema>;
/**
* The body of a search over won Deals: the latest turns of the conversation (1 to
* `MAX_SEARCH_TURNS`, at most `MAX_SEARCH_TEXT_CHARACTERS` code points in all) and an optional
* `limit` (1 to `MAX_SEARCH_LIMIT`, default `DEFAULT_SEARCH_LIMIT`). It is conversation text of the
* Organization, so it is sent in a body and never logged. An unknown key is rejected.
*/
declare const searchMomentsRequestSchema: z65.ZodObject<{
	turns: z65.ZodArray<z65.ZodObject<{
		role: z65.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		text: z65.ZodString;
	}, z65.core.$strict>>;
	limit: z65.ZodDefault<z65.ZodNumber>;
}, z65.core.$strict>;
/** The body of a search over won Deals, with the default limit applied. */
type SearchMomentsRequest = z65.infer<typeof searchMomentsRequestSchema>;
/**
* A short piece of a Moment's text: at most `MAX_MOMENT_SNIPPET_CHARACTERS` code points, possibly
* empty, well-formed and with no control or bidirectional character (newlines and tabs included),
* the same rule as a speaker excerpt. Build one with {@link momentSnippet}. Tenant Transcript text.
*/
declare const momentSnippetSchema: z65.ZodString;
/**
* Makes a snippet from stored Transcript text: whitespace collapsed, control and bidirectional
* characters removed and the text cut to `MAX_MOMENT_SNIPPET_CHARACTERS` code points at a word
* boundary with an ellipsis. It always passes {@link momentSnippetSchema}. Never log the result.
*/
declare function momentSnippet(text: string): string;
/**
* One similar Moment from a won Deal: the Call and Deal it comes from (opaque ids), its similarity
* `score` (higher is closer) and two snippets, what the Prospect said and what the Rep said next.
* It never carries the customer's `dealId`, name or amount; unknown fields are dropped. The
* snippets are tenant Transcript text: never logged.
*/
declare const momentMatchSchema: z65.ZodObject<{
	callId: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
	dealRecordId: z65.core.$ZodBranded<z65.ZodString, "deal", "out">;
	score: z65.ZodNumber;
	prospect: z65.ZodString;
	repNext: z65.ZodString;
}, z65.core.$strip>;
/** One similar Moment from a won Deal. */
type MomentMatch = z65.infer<typeof momentMatchSchema>;
/** How much a search found: `moments` candidates that may be returned and the distinct won Deals (`deals`) among them, both at most `MAX_SEARCH_CANDIDATES`. */
declare const searchEvidenceSchema: z65.ZodObject<{
	moments: z65.ZodNumber;
	deals: z65.ZodNumber;
}, z65.core.$strip>;
/** How much a search found. */
type SearchEvidence = z65.infer<typeof searchEvidenceSchema>;
/**
* The answer to a search: the best matches, at most `MAX_SEARCH_LIMIT`, best first, and the
* evidence. There is no cursor: the result is a bounded top-k. The items are the first of the
* `moments` candidates and the Deals are among them, so neither count is above `evidence.moments`, and `evidence.deals` is at least the number of distinct Deals among the items.
*/
declare const searchMomentsResponseSchema: z65.ZodObject<{
	items: z65.ZodArray<z65.ZodObject<{
		callId: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
		dealRecordId: z65.core.$ZodBranded<z65.ZodString, "deal", "out">;
		score: z65.ZodNumber;
		prospect: z65.ZodString;
		repNext: z65.ZodString;
	}, z65.core.$strip>>;
	evidence: z65.ZodObject<{
		moments: z65.ZodNumber;
		deals: z65.ZodNumber;
	}, z65.core.$strip>;
}, z65.core.$strip>;
/** The answer to a search. */
type SearchMomentsResponse = z65.infer<typeof searchMomentsResponseSchema>;
/**
* The text that is embedded for a window of turns: one `Rep: ` or `Prospect: ` line per turn,
* joined by a newline. The indexer (a Moment's text) and the search (the query) both call this, so
* what is stored and what is asked cannot drift, so the indexer must use this function too. Each
* turn's text is trimmed. It adds no speaker label and no Rep reply. The
* result is tenant conversation text: never log it.
*/
declare function momentQueryText(turns: readonly SearchTurn[]): string;
/** The body of a search over Playbook documents: the same turns and limit as {@link searchMomentsRequestSchema}, with the same bounds. Tenant conversation text: never logged. */
declare const searchDocumentsRequestSchema: z65.ZodObject<{
	turns: z65.ZodArray<z65.ZodObject<{
		role: z65.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		text: z65.ZodString;
	}, z65.core.$strict>>;
	limit: z65.ZodDefault<z65.ZodNumber>;
}, z65.core.$strict>;
/**
* The text that is embedded to search Playbook documents: each turn's text trimmed and joined by a
* newline, with no role labels, because document chunks are embedded as plain text and a label
* would skew the similarity. The Moments search uses {@link momentQueryText} instead. The result
* is tenant conversation text: never log it.
*/
declare function documentQueryText(turns: readonly SearchTurn[]): string;
/** The body of a search over Playbook documents. */
type SearchDocumentsRequest = SearchMomentsRequest;
/**
* One matching passage of a Playbook document: the document (`documentId`, and its `fileName`, the
* Organization's own file name, the same as the document's `fileName`), the `page` it is on, its
* similarity `score` (higher is closer) and a `snippet` of the passage, cleaned and cut with
* {@link momentSnippet}. `page` is the 1-based page for a paginated format (PDF) and `null` for a
* format without pages (TXT, MD, DOCX, and anything else the parser reads as one page); the service
* decides by media type. One item per chunk. Unknown fields are dropped. The snippet is the
* Organization's own sales material: never log it.
*/
declare const documentMatchSchema: z65.ZodObject<{
	documentId: z65.core.$ZodBranded<z65.ZodString, "doc", "out">;
	fileName: z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>;
	page: z65.ZodNullable<z65.ZodNumber>;
	score: z65.ZodNumber;
	snippet: z65.ZodString;
}, z65.core.$strip>;
/** One matching passage of a Playbook document. */
type DocumentMatch = z65.infer<typeof documentMatchSchema>;
/** How much a document search found: `chunks` that may be returned and the distinct `documents` among them, both at most `MAX_SEARCH_CANDIDATES`. */
declare const documentSearchEvidenceSchema: z65.ZodObject<{
	chunks: z65.ZodNumber;
	documents: z65.ZodNumber;
}, z65.core.$strip>;
/** How much a document search found. */
type DocumentSearchEvidence = z65.infer<typeof documentSearchEvidenceSchema>;
/**
* The answer to a document search: the best passages, at most `MAX_SEARCH_LIMIT`, best first, and
* the evidence. There is no cursor. As for Moments, neither the items nor the documents exceed
* `evidence.chunks`, and `evidence.documents` is at least the number of distinct documents among
* the items.
*/
declare const searchDocumentsResponseSchema: z65.ZodObject<{
	items: z65.ZodArray<z65.ZodObject<{
		documentId: z65.core.$ZodBranded<z65.ZodString, "doc", "out">;
		fileName: z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>;
		page: z65.ZodNullable<z65.ZodNumber>;
		score: z65.ZodNumber;
		snippet: z65.ZodString;
	}, z65.core.$strip>>;
	evidence: z65.ZodObject<{
		chunks: z65.ZodNumber;
		documents: z65.ZodNumber;
	}, z65.core.$strip>;
}, z65.core.$strip>;
/** The answer to a document search. */
type SearchDocumentsResponse = z65.infer<typeof searchDocumentsResponseSchema>;
/** The search routes, by name. */
type SearchRouteName = "searchMoments" | "searchDocuments";
/**
* The search routes: read-only `POST`s (the body is conversation text). `searchMoments` is for
* Owner and Admin only (the roles that read sales history); `searchDocuments` is for every role
* that reads the Playbook. They use existing codes only, so they have no domain code of their own.
*/
declare const SEARCH_ROUTES: Readonly<Record<SearchRouteName, PlaybookRoute>>;
import { ErrorDefinition as ErrorDefinition_8gwh4516 } from "..";
/** Every Playbook route name: the document routes of 0.7.0, the sales-history routes and the search route. */
type AllPlaybookRouteName = PlaybookRouteName | SalesHistoryRouteName | SearchRouteName;
/**
* Every Playbook route in one map, for a service that builds one OpenAPI document. `PLAYBOOK_ROUTES`
* and `PLAYBOOK_ERRORS` keep their 0.7.0 types, so code written against them still compiles; use
* this map and `ALL_PLAYBOOK_ERRORS` when you want both areas.
*/
declare const ALL_PLAYBOOK_ROUTES: Readonly<Record<AllPlaybookRouteName, PlaybookRoute | SalesHistoryRoute>>;
/** Every Playbook error code in one registry: the document codes of 0.7.0 and the sales-history codes. */
declare const ALL_PLAYBOOK_ERRORS: Readonly<{
	"call.content_in_other_deal": ErrorDefinition_8gwh4516<"call.content_in_other_deal">;
	"call.not_found": ErrorDefinition_8gwh4516<"call.not_found">;
	"call.not_restorable": ErrorDefinition_8gwh4516<"call.not_restorable">;
	"call.quota_exceeded": ErrorDefinition_8gwh4516<"call.quota_exceeded">;
	"call.rep_invalid": ErrorDefinition_8gwh4516<"call.rep_invalid">;
	"call.rep_not_changeable": ErrorDefinition_8gwh4516<"call.rep_not_changeable">;
	"call.too_large": ErrorDefinition_8gwh4516<"call.too_large">;
	"call.unsupported_type": ErrorDefinition_8gwh4516<"call.unsupported_type">;
	"deal.not_found": ErrorDefinition_8gwh4516<"deal.not_found">;
	"deal_import.busy": ErrorDefinition_8gwh4516<"deal_import.busy">;
	"deal_import.header_invalid": ErrorDefinition_8gwh4516<"deal_import.header_invalid">;
	"deal_import.not_found": ErrorDefinition_8gwh4516<"deal_import.not_found">;
	"deal_import.too_large": ErrorDefinition_8gwh4516<"deal_import.too_large">;
	"deal_import.unsupported_type": ErrorDefinition_8gwh4516<"deal_import.unsupported_type">;
	"document.not_found": ErrorDefinition_8gwh4516<"document.not_found">;
	"document.not_restorable": ErrorDefinition_8gwh4516<"document.not_restorable">;
	"document.quota_exceeded": ErrorDefinition_8gwh4516<"document.quota_exceeded">;
	"document.too_large": ErrorDefinition_8gwh4516<"document.too_large">;
	"document.unsupported_type": ErrorDefinition_8gwh4516<"document.unsupported_type">;
	"rights.confirmation_required": ErrorDefinition_8gwh4516<"rights.confirmation_required">;
	"rights.version_outdated": ErrorDefinition_8gwh4516<"rights.version_outdated">;
}>;
import { z as z67 } from "zod";
import { z as z66 } from "zod";
/**
* The states a Call is in (ADR 0018, with ADR 0016). A Transcript goes `uploaded`, `processing`,
* `ready`; a Recording goes `uploaded`, `transcribing`, then `awaiting_rep` (no Rep chosen yet) or
* `processing`, then `ready`. `processing` is also where a Call goes when its Rep changes and its
* Moments are rebuilt, and where a restored Call goes. `awaiting_rep` is the named wait of choice 9:
* no Moments exist and the Call is not in search. `deleted` is soft-deleted and awaiting purge. A
* Call held back from search because its Deal is not won is `ready`: that is read from the Deal,
* not a state. An upload still streaming has no Call yet, so it has no state.
*/
declare const CALL_STATES: readonly ["uploaded", "transcribing", "awaiting_rep", "processing", "ready", "failed", "deleted"];
/** The state of a Call. */
declare const callStateSchema: z66.ZodEnum<{
	awaiting_rep: "awaiting_rep";
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	transcribing: "transcribing";
	uploaded: "uploaded";
}>;
/** The state of a Call. */
type CallState = z66.infer<typeof callStateSchema>;
/**
* Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text.
* `too_long` is found by the job from the audio, not at upload, so it is a reason and not an HTTP
* code. `too_many_speakers` is a Call with more speakers than `MAX_CALL_SPEAKERS`. `rep_label_not_found` and `not_per_side` can be fixed by changing the Rep (see {@link repChangeAllowed}). The list is the
* lead's reading of ADR 0018.
*/
declare const CALL_FAILURE_REASONS: readonly ["no_turns", "too_few_speakers", "too_many_speakers", "rep_label_not_found", "not_per_side", "too_long", "transcription_failed", "transcription_timed_out", "unreadable", "processing_failed"];
/** Why a Call ended in `failed`. */
declare const callFailureReasonSchema: z66.ZodEnum<{
	no_turns: "no_turns";
	not_per_side: "not_per_side";
	processing_failed: "processing_failed";
	rep_label_not_found: "rep_label_not_found";
	too_few_speakers: "too_few_speakers";
	too_long: "too_long";
	too_many_speakers: "too_many_speakers";
	transcription_failed: "transcription_failed";
	transcription_timed_out: "transcription_timed_out";
	unreadable: "unreadable";
}>;
/** Why a Call ended in `failed`. */
type CallFailureReason = z66.infer<typeof callFailureReasonSchema>;
/** What a Call was uploaded as: a written Transcript or an audio Recording. */
declare const CALL_KINDS: readonly ["transcript", "recording"];
/** What a Call was uploaded as. */
declare const callKindSchema: z66.ZodEnum<{
	recording: "recording";
	transcript: "transcript";
}>;
/** What a Call was uploaded as. */
type CallKind = z66.infer<typeof callKindSchema>;
/** The lead's default (ADR 0018, refinements; not the owner's): the Transcript extensions accepted: plain text, WebVTT, SRT and a JSON turn list. */
declare const ACCEPTED_TRANSCRIPT_EXTENSIONS: readonly [".txt", ".vtt", ".srt", ".json"];
/** The lead's default (ADR 0018, refinements; not the owner's): the Recording extensions accepted. */
declare const ACCEPTED_RECORDING_EXTENSIONS: readonly [".mp3", ".m4a", ".wav", ".ogg", ".webm", ".flac"];
/** An accepted Call file extension. */
type AcceptedCallExtension = (typeof ACCEPTED_TRANSCRIPT_EXTENSIONS)[number] | (typeof ACCEPTED_RECORDING_EXTENSIONS)[number];
/** The media type of a stored Call file, as the service detected it from the content. */
declare const CALL_MEDIA_TYPES: readonly ["text/plain", "text/vtt", "application/x-subrip", "application/json", "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm", "audio/flac"];
/** The media type of a stored Call file. */
declare const callMediaTypeSchema: z66.ZodEnum<{
	"application/json": "application/json";
	"application/x-subrip": "application/x-subrip";
	"audio/flac": "audio/flac";
	"audio/mp4": "audio/mp4";
	"audio/mpeg": "audio/mpeg";
	"audio/ogg": "audio/ogg";
	"audio/wav": "audio/wav";
	"audio/webm": "audio/webm";
	"text/plain": "text/plain";
	"text/vtt": "text/vtt";
}>;
/** The media type of a stored Call file. */
type CallMediaType = z66.infer<typeof callMediaTypeSchema>;
/** The media type each accepted Call extension stands for. */
declare const MEDIA_TYPE_BY_CALL_EXTENSION: Readonly<Record<AcceptedCallExtension, CallMediaType>>;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest Transcript accepted, 5 MB counted as 5 * 1024 * 1024 bytes. */
declare const MAX_TRANSCRIPT_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest Recording accepted, 500 MB counted as 500 * 1024 * 1024 bytes; streamed, never held whole. */
declare const MAX_RECORDING_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the longest Recording, 3 hours in seconds; the job checks it, so a longer one ends `failed` with `too_long`. */
declare const MAX_RECORDING_SECONDS: number;
/** The ticket's default (ADR 0018 leaves it open): hours after which the parts of an incomplete streamed upload are discarded. */
declare const INCOMPLETE_UPLOAD_PARTS_TTL_HOURS = 24;
/** The ticket's default (ADR 0018 leaves it open): the most Rep turns stored after a Moment (choice 11). */
declare const MAX_REP_FOLLOWING_TURNS = 5;
/** The ticket's default (ADR 0018 leaves it open): the most characters (Unicode code points) of Rep turns stored after a Moment, so a long turn cannot make it unbounded. */
declare const MAX_REP_FOLLOWING_CHARACTERS = 4e3;
/** The ticket's default (ADR 0018 leaves it open): Calls an Organization may hold, soft-deleted and `awaiting_rep` ones included until purged. */
declare const DEFAULT_MAX_CALLS = 2e3;
/** The ticket's default (ADR 0018 leaves it open): Recording bytes an Organization may hold, 50 GB counted as 50 * 1024^3. */
declare const DEFAULT_MAX_RECORDING_BYTES_TOTAL: number;
/** The ticket's default (ADR 0018 leaves it open): Deals an Organization may hold. */
declare const DEFAULT_MAX_DEALS = 2e4;
/** The ticket's default (ADR 0018 leaves it open): the most speakers a Call may have and list for a Rep pick; a Call with more fails with `too_many_speakers`. */
declare const MAX_CALL_SPEAKERS = 20;
/** The longest speaker label, in Unicode code points, once control and direction characters are stripped. */
declare const MAX_SPEAKER_LABEL_LENGTH = 64;
/** The most UTF-8 bytes a stored speaker label can take: 64 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_SPEAKER_LABEL_BYTES: number;
/** The stored form of a speaker label: control and bidirectional characters removed, then trimmed. Labels read from a file and labels in a request must both pass through this. */
declare function normaliseSpeakerLabel(label: string): string;
/**
* A speaker label, in a request and in a response: at most 1000 raw Unicode code points, then control and
* bidirectional characters are removed and the rest trimmed to 1 to 64 well-formed Unicode code
* points (at most `MAX_SPEAKER_LABEL_BYTES` bytes in UTF-8). It is text taken from a file (`Alice`, or `A` from the transcriber), so display code must
* treat it as untrusted text, and it never appears in an error body. It is compared exactly and
* case-sensitively with the labels in the file.
*/
declare const speakerLabelSchema: z66.ZodPipe<z66.ZodPipe<z66.ZodString, z66.ZodTransform<string, string>>, z66.ZodString>;
/** The most Unicode code points of a speaker excerpt, the ellipsis included. */
declare const MAX_SPEAKER_EXCERPT_LENGTH = 240;
/**
* Cleans text for a short excerpt or snippet and cuts it to `max` code points: whitespace
* (newlines and tabs included) collapsed to one space, control and bidirectional characters and
* lone surrogates removed, then, when still too long, cut at a word boundary with an ellipsis (a
* single word longer than `max` is cut hard); the cut never splits a code point. What it returns
* always passes the excerpt and snippet schemas. The result is tenant text: never log it.
*/
declare function excerptText(text: string, max: number): string;
/**
* Builds the excerpt that helps a person pick the Rep: the speaker's first turns joined with a
* space and cleaned and cut by {@link excerptText} to at most `MAX_SPEAKER_EXCERPT_LENGTH` code
* points. The result is tenant Transcript text: never log it.
*/
declare function speakerExcerpt(turns: readonly string[]): string;
/**
* One speaker of a Call with a short excerpt of what they said, so a person can tell who is the
* Rep. The label is untrusted text from the file and the excerpt is tenant Transcript text: both
* are returned only to the owning Organization's Owner and Admin and are never logged.
*/
declare const speakerExcerptSchema: z66.ZodObject<{
	label: z66.ZodPipe<z66.ZodPipe<z66.ZodString, z66.ZodTransform<string, string>>, z66.ZodString>;
	excerpt: z66.ZodString;
}, z66.core.$strict>;
/** One speaker of a Call with a short excerpt. */
type SpeakerExcerpt = z66.infer<typeof speakerExcerptSchema>;
/** The channels of a per-side Recording: the left one or the right one. */
declare const CALL_CHANNELS: readonly ["left", "right"];
/** A channel of a per-side Recording. */
declare const callChannelSchema: z66.ZodEnum<{
	left: "left";
	right: "right";
}>;
/**
* Which side of a Call is the Rep: a speaker label (a Transcript, or a Recording that waited in
* `awaiting_rep`) or a channel (a per-side Recording). A Recording whose Rep is not yet known has
* no choice at all (`null` on the Call, an absent `rep` at upload).
*/
declare const repChoiceSchema: z66.ZodDiscriminatedUnion<[z66.ZodObject<{
	by: z66.ZodLiteral<"speaker">;
	label: z66.ZodPipe<z66.ZodPipe<z66.ZodString, z66.ZodTransform<string, string>>, z66.ZodString>;
}, z66.core.$strict>, z66.ZodObject<{
	by: z66.ZodLiteral<"channel">;
	channel: z66.ZodEnum<{
		left: "left";
		right: "right";
	}>;
}, z66.core.$strict>], "by">;
/** Which side of a Call is the Rep. */
type RepChoice = z66.infer<typeof repChoiceSchema>;
/**
* Whether a Rep choice suits a Call of this kind, for the one moment named. At `upload`, a
* Transcript needs a speaker label (ADR 0018, refinements), and a Recording takes a channel (the
* uploader declares it per-side) or nothing (it then waits in `awaiting_rep`); a speaker label for
* a Recording is not known at upload. At `change`, a choice is required: a Transcript takes a
* speaker label and a Recording takes a speaker label (from the detected speakers) or a channel.
* Whether a channel fits the file (exactly two channels) is the service's check, and a mismatch
* ends the Call `failed` with `not_per_side`. A failure here is `call.rep_invalid`.
*/
declare function repChoiceSuits(kind: CallKind, rep: RepChoice | null | undefined, when: "upload" | "change"): boolean;
/** What fixes a failed Call: a different Rep, a re-upload of the same file (the reason may be transient), or deleting the Call and uploading a corrected file. */
type CallFailureFix = "change_rep" | "reupload" | "delete_and_upload";
/**
* What fixes each failure reason. `change_rep`: `rep_label_not_found` and `not_per_side` are fixed
* by choosing a different Rep. `reupload`: `transcription_failed`, `transcription_timed_out` and
* `processing_failed` may be transient, so a same-Deal re-upload of the same content re-queues the
* Call. `delete_and_upload`: `too_many_speakers`, `no_turns`, `too_few_speakers`, `too_long` and
* `unreadable` come from the file itself, so the Call must be deleted and a corrected file uploaded.
*/
declare const CALL_FAILURE_FIXES: Readonly<Record<CallFailureReason, CallFailureFix>>;
/**
* Whether a same-Deal re-upload of identical content re-queues a `failed` Call: only for a reason
* that can be transient (`reupload` in {@link CALL_FAILURE_FIXES}). For any other reason the upload
* answers 200 with the failed Call unchanged, as the same file would fail the same way.
*/
declare function callReuploadRequeues(failureReason: CallFailureReason | null): boolean;
/**
* Whether a Call's Rep may be picked or changed: when it is `ready` or `awaiting_rep`, or `failed`
* with a reason a different Rep can fix (`rep_label_not_found`, `not_per_side`). Any other state
* or reason is `call.rep_not_changeable`.
*/
declare function repChangeAllowed(state: CallState, failureReason: CallFailureReason | null): boolean;
/**
* A Call as the service returns it. It names the file and the Deal but never carries a Transcript,
* audio or any turn (only the short `speakers` excerpts below). `kind` is what it was uploaded as. `rep` is the chosen Rep and is `null`
* exactly while the state is `awaiting_rep` (and for a Recording not yet transcribed or failed
* before a choice); a `ready` Call always has one. `speakerLabels` are the labels the Call's
* speakers carry (those of the file, or `A`, `B` from the transcriber), at most
* `MAX_CALL_SPEAKERS`, for the portal's Rep pick; they are untrusted text. `failureReason` is set
* exactly when `state` is `failed`; `deletedAt` and `purgeAt` exactly when it is `deleted`. A
* Transcript is never `transcribing` or `awaiting_rep`, has no duration and is within
* `MAX_TRANSCRIPT_BYTES`; `kind` agrees with `mediaType` (text for a Transcript, audio for a
* Recording); the labels are unique; and a `ready` Call's speaker Rep is one of them. A Call with
* more speakers than `MAX_CALL_SPEAKERS` fails with `too_many_speakers`, lists no speaker labels and
* never reaches a response with more than the cap, so a read route cannot throw on it. `durationSeconds` is `null` for a
* Transcript and until a Recording has been read. `dealRecordId` is the Deal's opaque id (the one
* a Deal's path uses) and `dealOutcome` its Outcome; `inSearch` is true only for a `ready` Call of a
* `won` Deal, and may be false for a Call whose Deal has just become won until the re-tag job
* finishes (the database decides, the index may lag). `dealId` is the customer's text and is never
* logged. The service must send the output of
* `callSchema.parse(row)`, never the row.
*
* `speakers` is optional: a short excerpt per speaker label ({@link speakerExcerpt}, 1 to
* `MAX_SPEAKER_EXCERPT_LENGTH` code points) so a person can tell who is the Rep. It is present
* only for a Recording with labels (above all one in `awaiting_rep`), is never empty, repeats no
* label and names only labels in `speakerLabels`; a speaker with no text is left out. It is tenant
* Transcript text, returned only to the owning Organization's Owner and Admin, and never logged.
*/
declare const callSchema: z67.ZodObject<{
	id: z67.core.$ZodBranded<z67.ZodString, "call", "out">;
	dealId: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	dealRecordId: z67.core.$ZodBranded<z67.ZodString, "deal", "out">;
	dealOutcome: z67.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z67.ZodBoolean;
	kind: z67.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	mediaType: z67.ZodEnum<{
		"application/json": "application/json";
		"application/x-subrip": "application/x-subrip";
		"audio/flac": "audio/flac";
		"audio/mp4": "audio/mp4";
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
		"audio/webm": "audio/webm";
		"text/plain": "text/plain";
		"text/vtt": "text/vtt";
	}>;
	sizeBytes: z67.ZodNumber;
	durationSeconds: z67.ZodNullable<z67.ZodNumber>;
	state: z67.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z67.ZodNullable<z67.ZodEnum<{
		no_turns: "no_turns";
		not_per_side: "not_per_side";
		processing_failed: "processing_failed";
		rep_label_not_found: "rep_label_not_found";
		too_few_speakers: "too_few_speakers";
		too_long: "too_long";
		too_many_speakers: "too_many_speakers";
		transcription_failed: "transcription_failed";
		transcription_timed_out: "transcription_timed_out";
		unreadable: "unreadable";
	}>>;
	rep: z67.ZodNullable<z67.ZodDiscriminatedUnion<[z67.ZodObject<{
		by: z67.ZodLiteral<"speaker">;
		label: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	}, z67.core.$strict>, z67.ZodObject<{
		by: z67.ZodLiteral<"channel">;
		channel: z67.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z67.core.$strict>], "by">>;
	speakerLabels: z67.ZodArray<z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>>;
	speakers: z67.ZodOptional<z67.ZodArray<z67.ZodObject<{
		label: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
		excerpt: z67.ZodString;
	}, z67.core.$strict>>>;
	deletedAt: z67.ZodNullable<z67.ZodISODateTime>;
	purgeAt: z67.ZodNullable<z67.ZodISODateTime>;
	uploadedByUserId: z67.core.$ZodBranded<z67.ZodString, "usr", "out">;
	createdAt: z67.ZodISODateTime;
	updatedAt: z67.ZodISODateTime;
}, z67.core.$strip>;
/** A Call as the service returns it. */
type Call = z67.infer<typeof callSchema>;
/** The most characters the `rep` form field may hold; a longer text is refused without being parsed. */
declare const MAX_REP_FIELD_LENGTH = 512;
/**
* The text fields of the multipart upload of a Call, beside the one file part
* ({@link UPLOAD_FILE_FIELD} `file`, as for a document): `dealId` (a deal id; a Deal that does not
* exist is created `open`) and `rep`, the {@link repChoiceSchema} as JSON text, which is a speaker
* label for a Transcript, a channel for a per-side Recording (the uploader declares it), or absent
* for a Recording that will wait in `awaiting_rep`. The request carries an `Idempotency-Key`
* header. Parse the text of `rep` with {@link parseRepField}.
*/
declare const uploadCallFieldsSchema: z67.ZodObject<{
	dealId: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	rep: z67.ZodOptional<z67.ZodString>;
}, z67.core.$strict>;
/** The text fields of the multipart upload of a Call. */
type UploadCallFields = z67.infer<typeof uploadCallFieldsSchema>;
/** What {@link parseRepField} answers: a Rep choice, no Rep at all (the field was not sent), or an invalid field. */
type ParseRepFieldResult = {
	readonly ok: true;
	readonly rep: RepChoice | null;
} | {
	readonly ok: false;
	readonly code: "call.rep_invalid";
};
/**
* Reads the `rep` form field. An absent field (`undefined`) is `{ ok: true, rep: null }`, which
* suits a Recording that will wait in `awaiting_rep`; a field that is present but empty, longer
* than {@link MAX_REP_FIELD_LENGTH}, not JSON or not a valid Rep choice is `call.rep_invalid`
* (422), never silently treated as absent. It never throws.
*/
declare function parseRepField(text: string | undefined): ParseRepFieldResult;
/** The path parameters of a request about one Call. */
declare const callParamsSchema: z67.ZodObject<{
	callId: z67.core.$ZodBranded<z67.ZodString, "call", "out">;
}, z67.core.$strict>;
/** The path parameters of a request about one Call. */
type CallParams = z67.infer<typeof callParamsSchema>;
/**
* The query parameters of a request to list Calls: a page, and optionally one `state` and one
* `dealRecordId` (the Deal's opaque id; the customer's deal id never goes in a query string). With no `state`, every Call that is not `deleted` is listed; `state=deleted` lists
* those that can still be restored, and `state=awaiting_rep` the ones waiting for a Rep. An
* unknown parameter is rejected.
*/
declare const listCallsQuerySchema: z67.ZodObject<{
	cursor: z67.ZodOptional<z67.ZodString>;
	limit: z67.ZodDefault<z67.ZodPipe<z67.ZodPipe<z67.ZodUnion<readonly [z67.ZodNumber, z67.ZodString]>, z67.ZodTransform<number, string | number>>, z67.ZodNumber>>;
	state: z67.ZodOptional<z67.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>>;
	dealRecordId: z67.ZodOptional<z67.core.$ZodBranded<z67.ZodString, "deal", "out">>;
}, z67.core.$strict>;
/** The query parameters of a request to list Calls. */
type ListCallsQuery = z67.infer<typeof listCallsQuerySchema>;
/**
* A Call in a list: a {@link callSchema} Call without `speakers`, and strict, so one that carries
* excerpts is refused. Only the single-Call read returns speaker excerpts, which keeps a page of up
* to 100 Calls from carrying up to 20 excerpts each of tenant Transcript text.
*/
declare const callListItemSchema: z67.ZodObject<{
	id: z67.core.$ZodBranded<z67.ZodString, "call", "out">;
	dealId: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	dealRecordId: z67.core.$ZodBranded<z67.ZodString, "deal", "out">;
	dealOutcome: z67.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z67.ZodBoolean;
	kind: z67.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	mediaType: z67.ZodEnum<{
		"application/json": "application/json";
		"application/x-subrip": "application/x-subrip";
		"audio/flac": "audio/flac";
		"audio/mp4": "audio/mp4";
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
		"audio/webm": "audio/webm";
		"text/plain": "text/plain";
		"text/vtt": "text/vtt";
	}>;
	sizeBytes: z67.ZodNumber;
	durationSeconds: z67.ZodNullable<z67.ZodNumber>;
	state: z67.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z67.ZodNullable<z67.ZodEnum<{
		no_turns: "no_turns";
		not_per_side: "not_per_side";
		processing_failed: "processing_failed";
		rep_label_not_found: "rep_label_not_found";
		too_few_speakers: "too_few_speakers";
		too_long: "too_long";
		too_many_speakers: "too_many_speakers";
		transcription_failed: "transcription_failed";
		transcription_timed_out: "transcription_timed_out";
		unreadable: "unreadable";
	}>>;
	rep: z67.ZodNullable<z67.ZodDiscriminatedUnion<[z67.ZodObject<{
		by: z67.ZodLiteral<"speaker">;
		label: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	}, z67.core.$strict>, z67.ZodObject<{
		by: z67.ZodLiteral<"channel">;
		channel: z67.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z67.core.$strict>], "by">>;
	speakerLabels: z67.ZodArray<z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>>;
	deletedAt: z67.ZodNullable<z67.ZodISODateTime>;
	purgeAt: z67.ZodNullable<z67.ZodISODateTime>;
	uploadedByUserId: z67.core.$ZodBranded<z67.ZodString, "usr", "out">;
	createdAt: z67.ZodISODateTime;
	updatedAt: z67.ZodISODateTime;
}, z67.core.$strict>;
/** One page of Calls, without speaker excerpts. */
declare const listCallsResponseSchema: z67.ZodObject<{
	items: z67.ZodArray<z67.ZodObject<{
		id: z67.core.$ZodBranded<z67.ZodString, "call", "out">;
		dealId: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
		dealRecordId: z67.core.$ZodBranded<z67.ZodString, "deal", "out">;
		dealOutcome: z67.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		inSearch: z67.ZodBoolean;
		kind: z67.ZodEnum<{
			recording: "recording";
			transcript: "transcript";
		}>;
		fileName: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
		mediaType: z67.ZodEnum<{
			"application/json": "application/json";
			"application/x-subrip": "application/x-subrip";
			"audio/flac": "audio/flac";
			"audio/mp4": "audio/mp4";
			"audio/mpeg": "audio/mpeg";
			"audio/ogg": "audio/ogg";
			"audio/wav": "audio/wav";
			"audio/webm": "audio/webm";
			"text/plain": "text/plain";
			"text/vtt": "text/vtt";
		}>;
		sizeBytes: z67.ZodNumber;
		durationSeconds: z67.ZodNullable<z67.ZodNumber>;
		state: z67.ZodEnum<{
			awaiting_rep: "awaiting_rep";
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			transcribing: "transcribing";
			uploaded: "uploaded";
		}>;
		failureReason: z67.ZodNullable<z67.ZodEnum<{
			no_turns: "no_turns";
			not_per_side: "not_per_side";
			processing_failed: "processing_failed";
			rep_label_not_found: "rep_label_not_found";
			too_few_speakers: "too_few_speakers";
			too_long: "too_long";
			too_many_speakers: "too_many_speakers";
			transcription_failed: "transcription_failed";
			transcription_timed_out: "transcription_timed_out";
			unreadable: "unreadable";
		}>>;
		rep: z67.ZodNullable<z67.ZodDiscriminatedUnion<[z67.ZodObject<{
			by: z67.ZodLiteral<"speaker">;
			label: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
		}, z67.core.$strict>, z67.ZodObject<{
			by: z67.ZodLiteral<"channel">;
			channel: z67.ZodEnum<{
				left: "left";
				right: "right";
			}>;
		}, z67.core.$strict>], "by">>;
		speakerLabels: z67.ZodArray<z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>>;
		deletedAt: z67.ZodNullable<z67.ZodISODateTime>;
		purgeAt: z67.ZodNullable<z67.ZodISODateTime>;
		uploadedByUserId: z67.core.$ZodBranded<z67.ZodString, "usr", "out">;
		createdAt: z67.ZodISODateTime;
		updatedAt: z67.ZodISODateTime;
	}, z67.core.$strict>>;
	nextCursor: z67.ZodNullable<z67.ZodString>;
}, z67.core.$strip>;
/** One page of Calls. */
type ListCallsResponse = z67.infer<typeof listCallsResponseSchema>;
/**
* The body of the request that picks or changes a Call's Rep: a required choice (`null` is not a
* choice). It is for a Call `awaiting_rep`, `ready` or `failed`, otherwise `call.rep_not_changeable`;
* a choice that does not suit the Call's kind or, for a speaker, is not among its labels is
* `call.rep_invalid`. It is idempotent by end state.
*/
declare const setCallRepRequestSchema: z67.ZodObject<{
	rep: z67.ZodDiscriminatedUnion<[z67.ZodObject<{
		by: z67.ZodLiteral<"speaker">;
		label: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	}, z67.core.$strict>, z67.ZodObject<{
		by: z67.ZodLiteral<"channel">;
		channel: z67.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z67.core.$strict>], "by">;
}, z67.core.$strict>;
/** The body of the request that picks or changes a Call's Rep. */
type SetCallRepRequest = z67.infer<typeof setCallRepRequestSchema>;
/** What the service reads off the file part of a Call upload, and the kind it was recognised as. */
declare const uploadCallFileSchema: z67.ZodObject<{
	fileName: z67.ZodPipe<z67.ZodPipe<z67.ZodString, z67.ZodTransform<string, string>>, z67.ZodString>;
	declaredMediaType: z67.ZodNullable<z67.ZodString>;
	sizeBytes: z67.ZodNumber;
}, z67.core.$strict>;
/** The answer of {@link checkCallFile}: the parsed file and its kind, or the one error code to return. */
type CheckCallFileResult = {
	readonly ok: true;
	readonly kind: CallKind;
	readonly file: z67.infer<typeof uploadCallFileSchema>;
} | {
	readonly ok: false;
	readonly code: "call.too_large" | "call.unsupported_type" | "request.invalid";
};
/**
* The one call that checks the file part of a Call upload, in the style of `checkUploadFile`. It
* runs the size check first against the largest limit (`MAX_RECORDING_BYTES`, `call.too_large`
* 413), then the type on the stored form of the name (`call.unsupported_type` 415: the extension
* is judged after control and bidirectional characters are stripped and the name trimmed), then
* the limit of the recognised kind (a Transcript over `MAX_TRANSCRIPT_BYTES` is `call.too_large`),
* then the shape (`request.invalid`). The kind comes from the extension; the service confirms it
* from the content. Fields are read once, as own properties, into a copy all checks use, and a
* non-finite size, a missing field or an extra own key is `request.invalid`. The Recording's
* duration is not known here: the job checks `MAX_RECORDING_SECONDS`. The result carries no name or
* content, so it is safe to log.
*/
declare function checkCallFile(input: unknown): CheckCallFileResult;
/** The position a Call list continues from: `createdAt`, then the Call's own `id`. It never holds a deal id. */
declare const callCursorSchema: z67.ZodObject<{
	createdAt: z67.ZodISODateTime;
	id: z67.core.$ZodBranded<z67.ZodString, "call", "out">;
}, z67.core.$strict>;
/** The position a Call list continues from. */
type CallCursor = z67.infer<typeof callCursorSchema>;
import { z as z68 } from "zod";
/**
* A Deal as the service returns it. A Deal is named by the Organization's own `dealId` (customer
* text, never logged, never in a URL path) and addressed by its opaque `id` (`deal_…`). It is never
* deleted on its own in phase 1. `closedAt` is a calendar date `YYYY-MM-DD`
* (no time, no time zone; a timestamp until 0.11.0). An `open` Deal may carry a `closedAt`, an expected close date from
* a CRM; an `amount` always comes with a `currency`. `closedAt`, `amount`, `currency` and `name` are `null`
* until given. `callCount` counts Calls that are not deleted. `appearedInImport` is false for a
* Deal created by a Call upload that no CSV has named, so the portal can list likely typos. The
* Outcome sequence the re-tag job uses is not here. The service must send the output of
* `dealSchema.parse(row)`.
*/
declare const dealSchema: z68.ZodObject<{
	id: z68.core.$ZodBranded<z68.ZodString, "deal", "out">;
	dealId: z68.ZodPipe<z68.ZodPipe<z68.ZodString, z68.ZodTransform<string, string>>, z68.ZodString>;
	name: z68.ZodNullable<z68.ZodPipe<z68.ZodString, z68.ZodString>>;
	outcome: z68.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z68.ZodNullable<z68.ZodISODate>;
	amount: z68.ZodNullable<z68.ZodString>;
	currency: z68.ZodNullable<z68.ZodString>;
	callCount: z68.ZodNumber;
	appearedInImport: z68.ZodBoolean;
	createdAt: z68.ZodISODateTime;
	updatedAt: z68.ZodISODateTime;
}, z68.core.$strip>;
/** A Deal as the service returns it. */
type Deal = z68.infer<typeof dealSchema>;
/** The path parameters of a request about one Deal: its opaque id, never the customer's deal id. */
declare const dealParamsSchema: z68.ZodObject<{
	dealRecordId: z68.core.$ZodBranded<z68.ZodString, "deal", "out">;
}, z68.core.$strict>;
/** The path parameters of a request about one Deal. */
type DealParams = z68.infer<typeof dealParamsSchema>;
/**
* The query parameters of a request to list Deals: a page, and optionally one `outcome` and
* `appearedInImport` (`true` or `false`). `appearedInImport=false` lists the Deals that have Calls
* but never appeared in a CSV. An unknown parameter is rejected.
*/
declare const listDealsQuerySchema: z68.ZodObject<{
	cursor: z68.ZodOptional<z68.ZodString>;
	limit: z68.ZodDefault<z68.ZodPipe<z68.ZodPipe<z68.ZodUnion<readonly [z68.ZodNumber, z68.ZodString]>, z68.ZodTransform<number, string | number>>, z68.ZodNumber>>;
	outcome: z68.ZodOptional<z68.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>>;
	appearedInImport: z68.ZodOptional<z68.ZodPipe<z68.ZodEnum<{
		false: "false";
		true: "true";
	}>, z68.ZodTransform<boolean, "false" | "true">>>;
}, z68.core.$strict>;
/** The query parameters of a request to list Deals. */
type ListDealsQuery = z68.infer<typeof listDealsQuerySchema>;
/** One page of Deals. */
declare const listDealsResponseSchema: z68.ZodObject<{
	items: z68.ZodArray<z68.ZodObject<{
		id: z68.core.$ZodBranded<z68.ZodString, "deal", "out">;
		dealId: z68.ZodPipe<z68.ZodPipe<z68.ZodString, z68.ZodTransform<string, string>>, z68.ZodString>;
		name: z68.ZodNullable<z68.ZodPipe<z68.ZodString, z68.ZodString>>;
		outcome: z68.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		closedAt: z68.ZodNullable<z68.ZodISODate>;
		amount: z68.ZodNullable<z68.ZodString>;
		currency: z68.ZodNullable<z68.ZodString>;
		callCount: z68.ZodNumber;
		appearedInImport: z68.ZodBoolean;
		createdAt: z68.ZodISODateTime;
		updatedAt: z68.ZodISODateTime;
	}, z68.core.$strip>>;
	nextCursor: z68.ZodNullable<z68.ZodString>;
}, z68.core.$strip>;
/** One page of Deals. */
type ListDealsResponse = z68.infer<typeof listDealsResponseSchema>;
/**
* The body of the request that sets or corrects a Deal's Outcome (Owner and Admin, any Deal, even
* a decided one): the `outcome` and an optional `closedAt`, which an `open` Deal may carry too (an
* expected close date), as in the CSV. It is idempotent by end state, and a change queues the
* re-tag of the Deal's Moments.
*/
declare const setDealOutcomeRequestSchema: z68.ZodObject<{
	outcome: z68.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z68.ZodOptional<z68.ZodNullable<z68.ZodISODate>>;
}, z68.core.$strict>;
/** The body of the request that sets or corrects a Deal's Outcome. */
type SetDealOutcomeRequest = z68.infer<typeof setDealOutcomeRequestSchema>;
/**
* The body of the request that finds a Deal by the customer's deal id, so the id goes in a POST
* body and never in a URL. The answer is the Deal, or `deal.not_found`. Matching is exact after the
* trim.
*/
declare const lookupDealRequestSchema: z68.ZodObject<{
	dealId: z68.ZodPipe<z68.ZodPipe<z68.ZodString, z68.ZodTransform<string, string>>, z68.ZodString>;
}, z68.core.$strict>;
/** The body of the request that finds a Deal by the customer's deal id. */
type LookupDealRequest = z68.infer<typeof lookupDealRequestSchema>;
/** The position a Deal list continues from: `createdAt`, then the Deal's opaque `id`, never the customer's deal id. */
declare const dealCursorSchema: z68.ZodObject<{
	createdAt: z68.ZodISODateTime;
	id: z68.core.$ZodBranded<z68.ZodString, "deal", "out">;
}, z68.core.$strict>;
/** The position a Deal list continues from. */
type DealCursor = z68.infer<typeof dealCursorSchema>;
/** The position a Deal import list continues from: `createdAt`, then the import's `id`. */
declare const dealImportCursorSchema: z68.ZodObject<{
	createdAt: z68.ZodISODateTime;
	id: z68.core.$ZodBranded<z68.ZodString, "dimp", "out">;
}, z68.core.$strict>;
/** The position a Deal import list continues from. */
type DealImportCursor = z68.infer<typeof dealImportCursorSchema>;
/** The position an import report continues from: the `rowNumber` of the last row returned. */
declare const dealImportRowCursorSchema: z68.ZodObject<{
	rowNumber: z68.ZodNumber;
}, z68.core.$strict>;
/** The position an import report continues from. */
type DealImportRowCursor = z68.infer<typeof dealImportRowCursorSchema>;
/** The fields of the multipart upload of a Deal import: the CSV is the one file part (`file`), with no other part. The request carries an `Idempotency-Key` header. */
declare const DEAL_IMPORT_FILE_FIELD = "file";
/**
* A Deal import as the service returns it. It carries no file name and no cell. The counts are
* `null` until `completed`; `failureReason` is set exactly when `state` is `failed`. The report is
* the paginated rows ({@link listDealImportRowsResponseSchema}).
*/
declare const dealImportSchema: z68.ZodObject<{
	id: z68.core.$ZodBranded<z68.ZodString, "dimp", "out">;
	state: z68.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z68.ZodNullable<z68.ZodEnum<{
		processing_failed: "processing_failed";
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z68.ZodNullable<z68.ZodNumber>;
	appliedCount: z68.ZodNullable<z68.ZodNumber>;
	rejectedCount: z68.ZodNullable<z68.ZodNumber>;
	uploadedByUserId: z68.core.$ZodBranded<z68.ZodString, "usr", "out">;
	createdAt: z68.ZodISODateTime;
	updatedAt: z68.ZodISODateTime;
}, z68.core.$strip>;
/** A Deal import as the service returns it. */
type DealImport = z68.infer<typeof dealImportSchema>;
/** The path parameters of a request about one Deal import. */
declare const dealImportParamsSchema: z68.ZodObject<{
	importId: z68.core.$ZodBranded<z68.ZodString, "dimp", "out">;
}, z68.core.$strict>;
/** The path parameters of a request about one Deal import. */
type DealImportParams = z68.infer<typeof dealImportParamsSchema>;
/** The query parameters of a request to list Deal imports: a page. An unknown parameter is rejected. */
declare const listDealImportsQuerySchema: z68.ZodObject<{
	cursor: z68.ZodOptional<z68.ZodString>;
	limit: z68.ZodDefault<z68.ZodPipe<z68.ZodPipe<z68.ZodUnion<readonly [z68.ZodNumber, z68.ZodString]>, z68.ZodTransform<number, string | number>>, z68.ZodNumber>>;
}, z68.core.$strict>;
/** The query parameters of a request to list Deal imports. */
type ListDealImportsQuery = z68.infer<typeof listDealImportsQuerySchema>;
/** One page of Deal imports. */
declare const listDealImportsResponseSchema: z68.ZodObject<{
	items: z68.ZodArray<z68.ZodObject<{
		id: z68.core.$ZodBranded<z68.ZodString, "dimp", "out">;
		state: z68.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z68.ZodNullable<z68.ZodEnum<{
			processing_failed: "processing_failed";
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z68.ZodNullable<z68.ZodNumber>;
		appliedCount: z68.ZodNullable<z68.ZodNumber>;
		rejectedCount: z68.ZodNullable<z68.ZodNumber>;
		uploadedByUserId: z68.core.$ZodBranded<z68.ZodString, "usr", "out">;
		createdAt: z68.ZodISODateTime;
		updatedAt: z68.ZodISODateTime;
	}, z68.core.$strip>>;
	nextCursor: z68.ZodNullable<z68.ZodString>;
}, z68.core.$strip>;
/** One page of Deal imports. */
type ListDealImportsResponse = z68.infer<typeof listDealImportsResponseSchema>;
/**
* One row of an import report: the CSV `rowNumber`, the record number with the header as record 1
* (so the first data row is 2). A quoted cell that spans lines is one record, so `rowNumber` can
* differ from the physical line (see `parseCsv`),
* the `dealId` (the one free-text cell echoed; `null` when the cell was missing or not a valid deal
* id, so a bad cell is never echoed), the `result` and, for a rejected row, the `reason`. `reason`
* is `null` exactly when the result is `applied`. No other cell is ever part of a report.
*/
declare const dealImportRowSchema: z68.ZodObject<{
	rowNumber: z68.ZodNumber;
	dealId: z68.ZodNullable<z68.ZodPipe<z68.ZodPipe<z68.ZodString, z68.ZodTransform<string, string>>, z68.ZodString>>;
	result: z68.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>;
	reason: z68.ZodNullable<z68.ZodEnum<{
		blank_row: "blank_row";
		deal_limit_reached: "deal_limit_reached";
		duplicate_in_file: "duplicate_in_file";
		invalid_amount: "invalid_amount";
		invalid_closed_at: "invalid_closed_at";
		invalid_currency: "invalid_currency";
		invalid_deal_id: "invalid_deal_id";
		invalid_name: "invalid_name";
		invalid_outcome: "invalid_outcome";
		outcome_already_decided: "outcome_already_decided";
		wrong_column_count: "wrong_column_count";
	}>>;
}, z68.core.$strip>;
/** One row of an import report. */
type DealImportRow = z68.infer<typeof dealImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page, and optionally only the `rejected` or only the `applied` rows. Rows are in CSV order. An unknown parameter is rejected. */
declare const listDealImportRowsQuerySchema: z68.ZodObject<{
	cursor: z68.ZodOptional<z68.ZodString>;
	limit: z68.ZodDefault<z68.ZodPipe<z68.ZodPipe<z68.ZodUnion<readonly [z68.ZodNumber, z68.ZodString]>, z68.ZodTransform<number, string | number>>, z68.ZodNumber>>;
	result: z68.ZodOptional<z68.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>>;
}, z68.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListDealImportRowsQuery = z68.infer<typeof listDealImportRowsQuerySchema>;
/** One page of an import report. */
declare const listDealImportRowsResponseSchema: z68.ZodObject<{
	items: z68.ZodArray<z68.ZodObject<{
		rowNumber: z68.ZodNumber;
		dealId: z68.ZodNullable<z68.ZodPipe<z68.ZodPipe<z68.ZodString, z68.ZodTransform<string, string>>, z68.ZodString>>;
		result: z68.ZodEnum<{
			applied: "applied";
			rejected: "rejected";
		}>;
		reason: z68.ZodNullable<z68.ZodEnum<{
			blank_row: "blank_row";
			deal_limit_reached: "deal_limit_reached";
			duplicate_in_file: "duplicate_in_file";
			invalid_amount: "invalid_amount";
			invalid_closed_at: "invalid_closed_at";
			invalid_currency: "invalid_currency";
			invalid_deal_id: "invalid_deal_id";
			invalid_name: "invalid_name";
			invalid_outcome: "invalid_outcome";
			outcome_already_decided: "outcome_already_decided";
			wrong_column_count: "wrong_column_count";
		}>>;
	}, z68.core.$strip>>;
	nextCursor: z68.ZodNullable<z68.ZodString>;
}, z68.core.$strip>;
/** One page of an import report. */
type ListDealImportRowsResponse = z68.infer<typeof listDealImportRowsResponseSchema>;
import { z as z69 } from "zod";
/** The Outcome of a Deal: `won`, `lost` or still `open` (glossary). */
declare const OUTCOMES: readonly ["won", "lost", "open"];
/** The Outcome of a Deal. */
declare const outcomeSchema: z69.ZodEnum<{
	lost: "lost";
	open: "open";
	won: "won";
}>;
/** The Outcome of a Deal. */
type Outcome = z69.infer<typeof outcomeSchema>;
/** The ticket's choice (ADR 0018 leaves it open): the longest deal id, in Unicode code points, after trimming. */
declare const MAX_DEAL_ID_LENGTH = 128;
/** The most UTF-8 bytes a stored deal id can take: 128 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_ID_BYTES: number;
/**
* Normalises a deal id: trims surrounding whitespace and changes nothing else. The comparison is
* exact and case-sensitive (`A-1` and `a-1` are two Deals) with no Unicode normalisation, as ADR
* 0018 says, so two ids are the same only if they are the same code points after the trim.
*/
declare function normaliseDealId(dealId: string): string;
/**
* A deal id (the Organization's own identifier for a Deal), in a body, a CSV cell, the upload field,
* a list filter and a response, never in a URL path (a Deal's path id is the opaque `deal_…` id): at
* most 1000 raw Unicode code points, trimmed, then 1 to 128 Unicode code points (at most
* `MAX_DEAL_ID_BYTES` bytes in UTF-8), well-formed, with no control character, bidirectional
* character, Unicode format character (category Cf, so no soft hyphen, zero-width, word joiner or
* tag character), line or paragraph separator or Hangul filler; homoglyphs are accepted and stay
* distinct ids. It is customer-chosen text that may hold a person's or a company's name, so it is
* never logged. Unlike a file name it is rejected, not stripped, because stripping could make two
* ids equal. It is compared exactly and case-sensitively after the trim ({@link normaliseDealId}).
* It is the only free-text cell an import report may echo, and untrusted text for display.
*/
declare const dealIdSchema: z69.ZodPipe<z69.ZodPipe<z69.ZodString, z69.ZodTransform<string, string>>, z69.ZodString>;
/** A deal id. */
type DealId = z69.infer<typeof dealIdSchema>;
/** The longest Deal name, in Unicode code points, once trimmed. */
declare const MAX_DEAL_NAME_LENGTH = 200;
/** The most UTF-8 bytes a stored Deal name can take: 200 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_NAME_BYTES: number;
/** A Deal's optional name: trimmed, 1 to 200 well-formed Unicode code points (at most `MAX_DEAL_NAME_BYTES` bytes), no control character. Untrusted text for display, never logged. */
declare const dealNameSchema: z69.ZodPipe<z69.ZodString, z69.ZodString>;
/** A money amount as a decimal string, never a float: not negative, at most 15 integer digits (the maximum is 999999999999999.99) and 2 fraction digits, no leading zero beyond a single `0`. */
declare const dealAmountSchema: z69.ZodString;
/** A currency as an upper-case ISO 4217 code of three letters. */
declare const dealCurrencySchema: z69.ZodString;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest CSV accepted, 10 MB counted as 10 * 1024 * 1024 bytes. */
declare const MAX_DEAL_IMPORT_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the most data rows in one CSV. */
declare const MAX_DEAL_IMPORT_ROWS = 5e4;
/** The most Deal imports one Organization may have not yet finished (state `uploaded` or `processing`); a further upload is refused with `deal_import.busy` (429). */
declare const MAX_QUEUED_DEAL_IMPORTS = 5;
/** The required columns of the CSV template, in order. */
declare const DEAL_IMPORT_REQUIRED_COLUMNS: readonly ["deal_id", "outcome", "closed_at", "amount", "currency"];
/** The optional column of the CSV template, which may follow the required ones. */
declare const DEAL_IMPORT_OPTIONAL_COLUMN = "name";
/** The longest header, its trimmed cells joined by commas, in characters; a longer one is refused. A valid header is under 50, so this only bounds padding-free garbage. It is about the trimmed content, not how much of the file is read: that is {@link DEAL_IMPORT_HEADER_PREFIX_CHARS}. */
declare const MAX_DEAL_IMPORT_HEADER_LENGTH = 1024;
/**
* How much of the start of the file the upload route passes to {@link checkDealImportHeaderText}:
* 8192 characters, more than the largest header that is valid under the cell limit (six cells of
* 1000 characters, each also quoted, plus separators, a byte order mark and a line break, about
* 6020). A header record that is still not finished at the end of a full prefix cannot be judged, so
* the early check answers `{ ok: true, deferred: true }` (no refusal) and leaves the verdict to the
* job; it never refuses a header it has only seen part of.
*/
declare const DEAL_IMPORT_HEADER_PREFIX_CHARS = 8192;
/** Why a CSV header was refused: a closed list, so the answer never echoes a cell. */
declare const DEAL_IMPORT_HEADER_PROBLEMS: readonly ["empty", "too_long", "missing_column", "unexpected_column", "wrong_order", "malformed_csv"];
/** Why a CSV header was refused. */
type DealImportHeaderProblem = (typeof DEAL_IMPORT_HEADER_PROBLEMS)[number];
/** The answer of {@link checkDealImportHeader}. */
type CheckDealImportHeaderResult = {
	readonly ok: true;
	readonly hasName: boolean;
} | {
	readonly ok: false;
	readonly code: "deal_import.header_invalid";
	readonly problem: DealImportHeaderProblem;
};
/**
* Checks the first record of a CSV against the fixed template: `deal_id,outcome,closed_at,amount,
* currency` in that order, optionally followed by `name`. Column names are lower case and exact;
* each cell is trimmed. It takes the record as {@link parseCsv} or {@link firstCsvRecord} produced
* it, so quoting, a byte order mark and every line ending are already handled and both readers give
* one verdict. A refusal is `deal_import.header_invalid` (422) and names a closed `problem`, never a
* cell. The upload route calls {@link checkDealImportHeaderText} on the start of the file; the job
* re-checks the first record of its full parse with this.
*/
declare function checkDealImportHeader(record: readonly string[]): CheckDealImportHeaderResult;
/** The answer of {@link checkDealImportHeaderText}: the verdict, or `{ ok: true, deferred: true }` when the prefix ended before the header did and the job must decide. */
type CheckDealImportHeaderTextResult = CheckDealImportHeaderResult | {
	readonly ok: true;
	readonly deferred: true;
};
/**
* The early header check of the upload route: reads the first record of the start of the file with
* {@link firstCsvRecord} (the same rules and limits as the full parse) and checks it with
* {@link checkDealImportHeader}. The caller passes the first `DEAL_IMPORT_HEADER_PREFIX_CHARS`
* characters of the file (or all of it if shorter). If that is a full prefix and the header record is
* still unfinished, the answer is `{ ok: true, deferred: true }`, not a refusal. A cell over the limit is
* `too_long` and a quoting error is `malformed_csv`, and the verdict equals the one the job reaches
* from the whole file.
*/
declare function checkDealImportHeaderText(text: string): CheckDealImportHeaderTextResult;
/** The states a Deal import is in: `uploaded`, then `processing`, then `completed` or `failed`. */
declare const DEAL_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of a Deal import. */
declare const dealImportStateSchema: z69.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of a Deal import. */
type DealImportState = z69.infer<typeof dealImportStateSchema>;
/** Why a whole import ended `failed`: a closed list. A bad row is not a failure of the import. */
declare const DEAL_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable", "processing_failed"];
/** Why a whole import ended `failed`. */
declare const dealImportFailureReasonSchema: z69.ZodEnum<{
	processing_failed: "processing_failed";
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import ended `failed`. */
type DealImportFailureReason = z69.infer<typeof dealImportFailureReasonSchema>;
/** The result of one CSV row: `applied`, or `rejected` with a reason. */
declare const DEAL_IMPORT_ROW_RESULTS: readonly ["applied", "rejected"];
/** The result of one CSV row. */
declare const dealImportRowResultSchema: z69.ZodEnum<{
	applied: "applied";
	rejected: "rejected";
}>;
/** The result of one CSV row. */
type DealImportRowResult = z69.infer<typeof dealImportRowResultSchema>;
/**
* Why a row was rejected: a closed list, never a cell. A row is rejected, not silently dropped,
* and never an HTTP error. `outcome_already_decided` is a row for a Deal already `won` or `lost`
* (ADR 0018, choice 5); `duplicate_in_file` is a deal id repeated after its first row; `blank_row`
* is an interior blank line, reported so the report has no gap in its row numbers.
*/
declare const DEAL_IMPORT_ROW_REASONS: readonly ["wrong_column_count", "invalid_deal_id", "duplicate_in_file", "invalid_outcome", "invalid_closed_at", "invalid_amount", "invalid_currency", "invalid_name", "outcome_already_decided", "deal_limit_reached", "blank_row"];
/** Why a row was rejected. */
declare const dealImportRowReasonSchema: z69.ZodEnum<{
	blank_row: "blank_row";
	deal_limit_reached: "deal_limit_reached";
	duplicate_in_file: "duplicate_in_file";
	invalid_amount: "invalid_amount";
	invalid_closed_at: "invalid_closed_at";
	invalid_currency: "invalid_currency";
	invalid_deal_id: "invalid_deal_id";
	invalid_name: "invalid_name";
	invalid_outcome: "invalid_outcome";
	outcome_already_decided: "outcome_already_decided";
	wrong_column_count: "wrong_column_count";
}>;
/** Why a row was rejected. */
type DealImportRowReason = z69.infer<typeof dealImportRowReasonSchema>;
/** The answer of a CSV cell parser: the parsed value, or not valid. */
type CellResult<T> = {
	readonly ok: true;
	readonly value: T;
} | {
	readonly ok: false;
};
/** The earliest year a `closed_at` may have (inclusive), so a typo such as year 0001 or 9999 is caught. */
declare const DEAL_CLOSED_AT_MIN_YEAR = 1970;
/** The latest year a `closed_at` may have (inclusive). */
declare const DEAL_CLOSED_AT_MAX_YEAR = 2100;
/** Reads the `outcome` cell: `won`, `lost` or `open`, compared case-insensitively after trimming. A blank cell is not valid: the column is required. */
declare function parseOutcomeCell(cell: string): CellResult<Outcome>;
/** A calendar date as `YYYY-MM-DD`, with no time and no time zone, a real day (2026-02-30 is refused) in the years 1970 to 2100, as the CSV `closed_at` accepts. Used for a Deal's `closedAt`. */
declare const calendarDateSchema: z69.ZodISODate;
/**
* Reads the `closed_at` cell. Blank is none (`null`); `won` and `lost` do not require it, and an
* `open` Deal may carry an expected close date. Otherwise it is a plain calendar date `YYYY-MM-DD`
* (a real day), kept exactly as written: a value with a time or an offset is not valid (it would
* name a different day in another time zone). The year must be from `DEAL_CLOSED_AT_MIN_YEAR`
* (1970) to `DEAL_CLOSED_AT_MAX_YEAR` (2100) inclusive, else it is not valid.
*/
declare function parseClosedAtCell(cell: string): CellResult<string | null>;
/** Reads the `amount` cell: blank is none; otherwise a non-negative decimal as {@link dealAmountSchema} describes (at most 999999999999999.99). */
declare function parseAmountCell(cell: string): CellResult<string | null>;
/** Reads the `currency` cell: blank is none; otherwise three letters, folded to upper case. A currency is required when an amount is present, which {@link checkDealImportRow} checks. */
declare function parseCurrencyCell(cell: string): CellResult<string | null>;
/** One CSV data row once its cells are read. */
type ParsedDealImportRow = {
	readonly dealId: string;
	readonly outcome: Outcome;
	readonly closedAt: string | null;
	readonly amount: string | null;
	readonly currency: string | null;
	readonly name: string | null;
};
/** The answer of {@link checkDealImportRow}: the parsed row, or the one reason code of the report. */
type CheckDealImportRowResult = {
	readonly ok: true;
	readonly row: ParsedDealImportRow;
} | {
	readonly ok: false;
	readonly reason: DealImportRowReason;
};
/**
* Reads one CSV record's cells (already split, so a quoted cell with a comma or a line break is one
* cell; see {@link parseCsv}) against the template, so the portal and the service agree. Every cell
* is trimmed; blank optional cells are none. Cell count must be 5, or 6 when the header has `name`
* (`wrong_column_count`). The problems are reported in column order and only the first is returned:
* `invalid_deal_id`, `invalid_outcome`, `invalid_closed_at`, `invalid_amount`, `invalid_currency`
* (including an amount with no currency) and `invalid_name`. Whether the Deal is already decided,
* repeated in the file or over the quota is the service's, as those need its data.
*/
declare function checkDealImportRow(cells: readonly string[], hasName: boolean): CheckDealImportRowResult;
/**
* The longest cell {@link parseCsv} reads, in Unicode code points: 1000, the raw bound the deal id
* and Deal name schemas allow before they trim. It only bounds memory; the row checks do the
* reporting, so a name of 201 characters is a rejected row (`invalid_name`) and a valid name padded
* with spaces still imports. A cell over 1000 characters, like a quoting error, fails the whole file.
*/
declare const MAX_DEAL_IMPORT_CELL_LENGTH = 1e3;
/** Why a CSV could not be read: more records than allowed, a cell over the length limit, a quote that never closes, or a quote where RFC 4180 does not allow one. */
declare const CSV_FAILURES: readonly ["too_many_records", "cell_too_long", "unterminated_quote", "bad_quote"];
/** Why a CSV could not be read. */
type CsvFailure = (typeof CSV_FAILURES)[number];
/** The limits of a CSV read. */
type CsvOptions = {
	/** The most records to read, header and blank records included; default `MAX_DEAL_IMPORT_ROWS + 1`. */
	readonly maxRecords?: number;
	/** The longest cell, in Unicode code points; default `MAX_DEAL_IMPORT_CELL_LENGTH`. */
	readonly maxCellLength?: number;
};
/** The answer of {@link parseCsv}: the records, or the failure and how many records were read before it. */
type CsvResult = {
	readonly ok: true;
	readonly records: string[][];
} | {
	readonly ok: false;
	readonly failure: CsvFailure;
	readonly recordsRead: number;
};
/** The answer of {@link firstCsvRecord}: the first record (`undefined` for empty text) and whether a line break ended it, or the failure. */
type FirstCsvRecordResult = {
	readonly ok: true;
	readonly record: string[] | undefined;
	readonly complete: boolean;
} | {
	readonly ok: false;
	readonly failure: CsvFailure;
	readonly recordsRead: number;
};
/**
* Splits CSV text into records of cells under strict RFC 4180: a cell may be double-quoted, `""` is
* a quote inside one, and a quoted cell may hold commas and line breaks; a line break is `\n`, `\r\n`
* or `\r`, a leading byte order mark is dropped, and one final line break does not add a record. A
* quote inside an unquoted cell, or any text between a closing quote and the next comma or line
* break, fails the whole file as `bad_quote`, and a quote that never closes is `unterminated_quote`;
* there is no leniency.
*
* It stops as soon as a limit is passed, having built at most that much: more than
* `options.maxRecords` records is `too_many_records` and a cell longer than `options.maxCellLength`
* code points is `cell_too_long`, each with `recordsRead`. The caller passes
* `maxRecords: MAX_DEAL_IMPORT_ROWS + 1` (the default): the header is record 1, and blank records
* count toward the limit because they cost memory. It needs the whole text in memory (up to
* `MAX_DEAL_IMPORT_BYTES`), so it belongs in a background job, never on a request path; the upload
* route reads only the header, with {@link checkDealImportHeaderText}.
*
* The first record is the header, so the **record number** is the index plus one, with the header
* as record 1: a report's `rowNumber` is a record number, and a quoted cell spanning lines is one
* record, so it can differ from the physical line. A blank line is a record of one empty cell
* ({@link isBlankCsvRecord}); a run of them at the end of the file is dropped, and an interior one is kept, so numbers match what a spreadsheet shows, and the caller
* reports it as a rejected `blank_row` row.
*/
declare function parseCsv(text: string, options?: CsvOptions): CsvResult;
/**
* Reads only the first record of CSV text with the same rules and limits as {@link parseCsv}, and
* stops there: a later bad record does not change its answer. `record` is `undefined` for empty text, and `complete` is whether a line break ended it (false when the text ran out first).
*/
declare function firstCsvRecord(text: string, options?: CsvOptions): FirstCsvRecordResult;
/** Whether a CSV record is a blank line: one empty cell. A caller reports an interior one as a rejected `blank_row` row; it counts in the record number. {@link parseCsv} already drops a trailing run. */
declare function isBlankCsvRecord(record: readonly string[]): boolean;
import { z as z70 } from "zod";
/**
* A Playbook document as the service returns it. It names the file but never carries its content,
* and no text taken from it. The extension of `fileName` and `mediaType` are not checked against each other: that agreement is
* the service's job, as only it knows the declared and the detected type, and the contract does
* not enforce it. `failureReason` is set exactly when `state` is `failed`. `purgeAt` is
* set exactly when `state` is `deleted`: the time the file and record will be purged
* (`DOCUMENT_RETENTION_DAYS` after `deletedAt`); a restore is refused after it. `pageCount` is
* `null` until ingestion has counted the pages. The service must send the output of
* `documentSchema.parse(row)`, never the row.
*/
declare const documentSchema: z70.ZodObject<{
	id: z70.core.$ZodBranded<z70.ZodString, "doc", "out">;
	fileName: z70.ZodPipe<z70.ZodPipe<z70.ZodString, z70.ZodTransform<string, string>>, z70.ZodString>;
	mediaType: z70.ZodEnum<{
		"application/pdf": "application/pdf";
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		"text/markdown": "text/markdown";
		"text/plain": "text/plain";
	}>;
	sizeBytes: z70.ZodNumber;
	pageCount: z70.ZodNullable<z70.ZodNumber>;
	state: z70.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>;
	failureReason: z70.ZodNullable<z70.ZodEnum<{
		no_text: "no_text";
		password_protected: "password_protected";
		processing_failed: "processing_failed";
		too_many_pages: "too_many_pages";
		unreadable: "unreadable";
	}>>;
	deletedAt: z70.ZodNullable<z70.ZodISODateTime>;
	purgeAt: z70.ZodNullable<z70.ZodISODateTime>;
	uploadedByUserId: z70.core.$ZodBranded<z70.ZodString, "usr", "out">;
	createdAt: z70.ZodISODateTime;
	updatedAt: z70.ZodISODateTime;
}, z70.core.$strip>;
/** A Playbook document as the service returns it. */
type PlaybookDocument = z70.infer<typeof documentSchema>;
/** The name of the multipart form field that carries the file. */
declare const UPLOAD_FILE_FIELD = "file";
/** The content type of an upload request: `multipart/form-data` with one file part named {@link UPLOAD_FILE_FIELD}. */
declare const UPLOAD_CONTENT_TYPE = "multipart/form-data";
/**
* What the service reads off the file part of an upload before it stores anything: the
* `fileName` of the part, the media type the client declared (`declaredMediaType`, advisory only;
* the service inspects the content too, because an upload is untrusted data) and the `sizeBytes`
* counted while reading. The file itself is a multipart part, not a JSON field, and appears in no
* schema. The request has no other part; it carries an `Idempotency-Key` header.
*
* This schema checks only shape (a well-formed name, a non-empty file) and a failure is
* `request.invalid` (400). A service calls {@link checkUploadFile}, which runs it after the size
* and type checks so each gets its own code.
*/
declare const uploadDocumentFileSchema: z70.ZodObject<{
	fileName: z70.ZodPipe<z70.ZodPipe<z70.ZodString, z70.ZodTransform<string, string>>, z70.ZodString>;
	declaredMediaType: z70.ZodNullable<z70.ZodString>;
	sizeBytes: z70.ZodNumber;
}, z70.core.$strict>;
/** What the service reads off the file part of an upload. */
type UploadDocumentFile = z70.infer<typeof uploadDocumentFileSchema>;
/** The path parameters of a request about one document. */
declare const documentParamsSchema: z70.ZodObject<{
	documentId: z70.core.$ZodBranded<z70.ZodString, "doc", "out">;
}, z70.core.$strict>;
/** The path parameters of a request about one document. */
type DocumentParams = z70.infer<typeof documentParamsSchema>;
/**
* The query parameters of a request to list documents: a page, and optionally one `state`. With
* no `state`, every document that is not `deleted` is listed; `state=deleted` lists the documents
* that can still be restored. An unknown parameter is rejected.
*/
declare const listDocumentsQuerySchema: z70.ZodObject<{
	cursor: z70.ZodOptional<z70.ZodString>;
	limit: z70.ZodDefault<z70.ZodPipe<z70.ZodPipe<z70.ZodUnion<readonly [z70.ZodNumber, z70.ZodString]>, z70.ZodTransform<number, string | number>>, z70.ZodNumber>>;
	state: z70.ZodOptional<z70.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>>;
}, z70.core.$strict>;
/** The query parameters of a request to list documents. */
type ListDocumentsQuery = z70.infer<typeof listDocumentsQuerySchema>;
/** One page of documents. */
declare const listDocumentsResponseSchema: z70.ZodObject<{
	items: z70.ZodArray<z70.ZodObject<{
		id: z70.core.$ZodBranded<z70.ZodString, "doc", "out">;
		fileName: z70.ZodPipe<z70.ZodPipe<z70.ZodString, z70.ZodTransform<string, string>>, z70.ZodString>;
		mediaType: z70.ZodEnum<{
			"application/pdf": "application/pdf";
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			"text/markdown": "text/markdown";
			"text/plain": "text/plain";
		}>;
		sizeBytes: z70.ZodNumber;
		pageCount: z70.ZodNullable<z70.ZodNumber>;
		state: z70.ZodEnum<{
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			uploaded: "uploaded";
		}>;
		failureReason: z70.ZodNullable<z70.ZodEnum<{
			no_text: "no_text";
			password_protected: "password_protected";
			processing_failed: "processing_failed";
			too_many_pages: "too_many_pages";
			unreadable: "unreadable";
		}>>;
		deletedAt: z70.ZodNullable<z70.ZodISODateTime>;
		purgeAt: z70.ZodNullable<z70.ZodISODateTime>;
		uploadedByUserId: z70.core.$ZodBranded<z70.ZodString, "usr", "out">;
		createdAt: z70.ZodISODateTime;
		updatedAt: z70.ZodISODateTime;
	}, z70.core.$strip>>;
	nextCursor: z70.ZodNullable<z70.ZodString>;
}, z70.core.$strip>;
/** One page of documents. */
type ListDocumentsResponse = z70.infer<typeof listDocumentsResponseSchema>;
/**
* Internal: the path parameters of the call that removes everything an Organization has in the
* Playbook. The Organization is named in the path, never taken from the caller's token.
*/
declare const internalRemoveOrganizationDocumentsParamsSchema: z70.ZodObject<{
	organizationId: z70.core.$ZodBranded<z70.ZodString, "org", "out">;
}, z70.core.$strict>;
/** Internal: the path parameters of the remove-everything call. */
type InternalRemoveOrganizationDocumentsParams = z70.infer<typeof internalRemoveOrganizationDocumentsParamsSchema>;
/**
* Internal: `POST /internal/playbook/organizations/{organizationId}/remove-all`, for offboarding
* and erasure; no caller yet. The body is empty. It cancels ingestion in flight and removes every
* file, chunk, vector and record the Organization has, soft-deleted documents included, without
* waiting for retention. It carries an `Idempotency-Key` header and is defined by its end state:
* it answers success whenever nothing remains when it returns, whether this call, an earlier one
* or nobody ever stored anything, so a repeat under any key answers the same and success does not
* mean this call removed anything. It returns no domain error code.
*/
declare const internalRemoveOrganizationDocumentsRequestSchema: z70.ZodObject<{}, z70.core.$strict>;
/** Internal: the body of the remove-everything call. */
type InternalRemoveOrganizationDocumentsRequest = z70.infer<typeof internalRemoveOrganizationDocumentsRequestSchema>;
/** Internal: the answer to the remove-everything call: always `removed`. */
declare const internalRemoveOrganizationDocumentsResponseSchema: z70.ZodObject<{
	organizationId: z70.core.$ZodBranded<z70.ZodString, "org", "out">;
	status: z70.ZodLiteral<"removed">;
}, z70.core.$strip>;
/** Internal: the answer to the remove-everything call. */
type InternalRemoveOrganizationDocumentsResponse = z70.infer<typeof internalRemoveOrganizationDocumentsResponseSchema>;
/** The answer of {@link checkUploadFile}: the parsed file, or the one error code to return. */
type CheckUploadFileResult = {
	readonly ok: true;
	readonly file: UploadDocumentFile;
} | {
	readonly ok: false;
	readonly code: "document.too_large" | "document.unsupported_type" | "request.invalid";
};
/**
* The one call that checks the file part of an upload, so a service cannot skip a step. It runs
* the size check first (`document.too_large`, 413, so an over-size `.exe` is only too large), then
* the type check on the stored form of the name (`document.unsupported_type`, 415: the extension
* is judged after control and bidirectional characters are stripped and the name is trimmed, so
* `report.pdf ` is accepted and stored as `report.pdf`), then the shape
* ({@link uploadDocumentFileSchema}, `request.invalid`, 400). Input that is not an object with a
* string name and a finite numeric size (so `NaN` and the infinities too), or that has an own key
* other than the three, is `request.invalid`. Each field is read once, as an own property, into a
* copy that all three checks use, so a changing getter or an inherited property cannot pass a check
* the parsed value would fail. On success `file` is the parsed form, with
* the stored name. The result carries no name or content, so it is safe to log and to return.
*/
declare function checkUploadFile(input: unknown): CheckUploadFileResult;
import { z as z71 } from "zod";
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}: the document to ingest. */
declare const documentUploadedPayloadSchema: z71.ZodObject<{
	documentId: z71.core.$ZodBranded<z71.ZodString, "doc", "out">;
}, z71.core.$strict>;
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}. */
type DocumentUploadedPayload = z71.infer<typeof documentUploadedPayloadSchema>;
/**
* The message that starts ingestion of a document: published after an upload is stored, and again
* when a soft-deleted document is restored (it is re-ingested from the kept file). The job is
* idempotent and resumable, keyed on the document.
*/
declare const DOCUMENT_UPLOADED_MESSAGE: {
	readonly type: "playbook.document_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z71.ZodObject<{
		documentId: z71.core.$ZodBranded<z71.ZodString, "doc", "out">;
	}, z71.core.$strict>;
};
/** The largest `deletionSeq`: the db column is a Postgres `integer`, so the message cannot carry more. */
declare const MAX_DELETION_SEQ = 2147483647;
/**
* The payload of {@link DOCUMENT_DELETED_MESSAGE}: the document and its `deletionSeq`, an integer
* from 1 to {@link MAX_DELETION_SEQ} that the service increases in the same write as each delete. The cleanup applies only
* when the document is still `deleted` and its stored sequence equals this one, so a restore, or
* a later delete, makes an older message do nothing. A timestamp is not the guard: Postgres keeps
* microseconds, a JSON timestamp does not, and two deletions can share a clock tick. The sequence
* is not on the public document schema. Only a delete that changes the state bumps it: a repeated
* delete of an already deleted document does not bump the sequence and does not publish again.
*/
declare const documentDeletedPayloadSchema: z71.ZodObject<{
	documentId: z71.core.$ZodBranded<z71.ZodString, "doc", "out">;
	deletionSeq: z71.ZodNumber;
}, z71.core.$strict>;
/** The payload of {@link DOCUMENT_DELETED_MESSAGE}. */
type DocumentDeletedPayload = z71.infer<typeof documentDeletedPayloadSchema>;
/**
* The message that queues the removal of a deleted document's vectors, published by the delete
* request. It is cleanup only: search hides a deleted document by its state, never by this job.
*/
declare const DOCUMENT_DELETED_MESSAGE: {
	readonly type: "playbook.document_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z71.ZodObject<{
		documentId: z71.core.$ZodBranded<z71.ZodString, "doc", "out">;
		deletionSeq: z71.ZodNumber;
	}, z71.core.$strict>;
};
import { z as z72 } from "zod";
/** The largest wording version number; versions are positive integers, one for each entry of `RIGHTS_WORDINGS`. */
declare const MAX_RIGHTS_WORDING_VERSION = 1e6;
/** The version of the rights-confirmation wording: a positive integer. The text of each version is in `RIGHTS_WORDINGS`. */
declare const rightsWordingVersionSchema: z72.ZodNumber;
/**
* The recorded confirmation (ADR 0018, choice 12): that an Owner or Admin confirmed the
* Organization may share its Recordings and Transcripts, with the `wordingVersion` shown, who
* (`confirmedByUserId`) and when. There is one per Organization; a new one replaces it.
*/
declare const rightsConfirmationSchema: z72.ZodObject<{
	wordingVersion: z72.ZodNumber;
	confirmedByUserId: z72.core.$ZodBranded<z72.ZodString, "usr", "out">;
	confirmedAt: z72.ZodISODateTime;
}, z72.core.$strip>;
/** The recorded confirmation. */
type RightsConfirmation = z72.infer<typeof rightsConfirmationSchema>;
/**
* The answer to reading the confirmation: the `currentWordingVersion` the portal must show,
* the stored `confirmation` (`null` if none) and `confirmed`, true only when the stored version
* is the current one. `currentWording` is the text of the current version, optional so a service
* built before the wording moved into the contract still parses and a consumer reads the text from
* `RIGHTS_WORDINGS` when it is absent.
* The schema does not check that the text belongs to `currentWordingVersion` (a consumer on an older
* library has a shorter version table and must still parse a newer service's answer): a consumer
* shows the text for the version it sends from `rightsWordingFor`, and confirms that version only. Uploads of Calls are refused with `rights.confirmation_required` unless
* `confirmed`; existing Calls stay and stay searchable.
*/
declare const rightsStatusSchema: z72.ZodObject<{
	currentWordingVersion: z72.ZodNumber;
	confirmation: z72.ZodNullable<z72.ZodObject<{
		wordingVersion: z72.ZodNumber;
		confirmedByUserId: z72.core.$ZodBranded<z72.ZodString, "usr", "out">;
		confirmedAt: z72.ZodISODateTime;
	}, z72.core.$strip>>;
	confirmed: z72.ZodBoolean;
	currentWording: z72.ZodOptional<z72.ZodObject<{
		heading: z72.ZodString;
		paragraphs: z72.ZodArray<z72.ZodString>;
		checkbox: z72.ZodString;
		draft: z72.ZodOptional<z72.ZodLiteral<true>>;
	}, z72.core.$strict>>;
}, z72.core.$strip>;
/** The answer to reading the confirmation. */
type RightsStatus = z72.infer<typeof rightsStatusSchema>;
/**
* The body of the request that records the confirmation: the `wordingVersion` the member was shown,
* which must be the current one (else `rights.version_outdated`). Who and when come from the token
* and the clock, never from the body. Idempotent by end state.
*/
declare const confirmRightsRequestSchema: z72.ZodObject<{
	wordingVersion: z72.ZodNumber;
}, z72.core.$strict>;
/** The body of the request that records the confirmation. */
type ConfirmRightsRequest = z72.infer<typeof confirmRightsRequestSchema>;
import { z as z73 } from "zod";
/** The longest heading of a wording, in Unicode code points. */
declare const MAX_RIGHTS_HEADING_LENGTH = 200;
/** The most paragraphs a wording may have. */
declare const MAX_RIGHTS_PARAGRAPHS = 10;
/** The longest paragraph or confirmation sentence of a wording, in Unicode code points. */
declare const MAX_RIGHTS_TEXT_LENGTH = 2e3;
/**
* The text of one version of the rights confirmation: a `heading`, up to ten `paragraphs` and the
* `checkbox` sentence the member agrees to. It is plain text (no markup) and is shown exactly as
* written, never interpolated with a name or a value. `draft` is true while a lawyer has not
* checked the text; the screen says so.
*/
declare const rightsWordingSchema: z73.ZodObject<{
	heading: z73.ZodString;
	paragraphs: z73.ZodArray<z73.ZodString>;
	checkbox: z73.ZodString;
	draft: z73.ZodOptional<z73.ZodLiteral<true>>;
}, z73.core.$strict>;
/** The text of one version of the rights confirmation. */
type RightsWording = z73.infer<typeof rightsWordingSchema>;
/**
* The text of every version of the rights confirmation (ADR 0018, choice 12), keyed by version,
* frozen. A version is published once and never edited: a change to the text is a new version here
* and therefore a contract release, and the current version below follows from it.
*
* PENDING A LAWYER'S CHECK: version 1 is a draft (the owner decision of 2026-10-14 put the wording
* in the contract; ADR 0018 requires a lawyer to check it before real customers use it). Remove
* `draft` only in a new version, once it has been checked. It is taken verbatim from the portal's
* draft.
*/
declare const RIGHTS_WORDINGS: Readonly<Record<number, RightsWording>>;
/** The current version of the rights wording: the highest key of {@link RIGHTS_WORDINGS}. A service reads it instead of a setting. */
declare const CURRENT_RIGHTS_WORDING_VERSION: number;
/** The text of a version, or undefined when the contract has none; a version without text cannot be confirmed. */
declare function rightsWordingFor(version: number): RightsWording | undefined;
import { z as z74 } from "zod";
/** The largest Outcome or Rep sequence: the db column is a Postgres `integer`, like {@link MAX_DELETION_SEQ}. */
declare const MAX_SEQ = 2147483647;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
declare const callUploadedPayloadSchema: z74.ZodObject<{
	callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
}, z74.core.$strict>;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
type CallUploadedPayload = z74.infer<typeof callUploadedPayloadSchema>;
/** Starts ingestion of a Call: transcription of a Recording, or parsing of a Transcript. Published after the upload is stored and again on restore (the kept Transcript is reused, never transcribed twice). */
declare const CALL_UPLOADED_MESSAGE: {
	readonly type: "playbook.call_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z74.ZodObject<{
		callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
	}, z74.core.$strict>;
};
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
declare const callTranscribedPayloadSchema: z74.ZodObject<{
	callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
}, z74.core.$strict>;
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
type CallTranscribedPayload = z74.infer<typeof callTranscribedPayloadSchema>;
/** Moves a Recording from transcription to building Moments, published when the Transcript is stored and the Rep is known (a per-side Recording, or one whose Rep was picked). A Call with no Rep waits in `awaiting_rep` and publishes `playbook.call_rep_changed` when it is picked. */
declare const CALL_TRANSCRIBED_MESSAGE: {
	readonly type: "playbook.call_transcribed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z74.ZodObject<{
		callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
	}, z74.core.$strict>;
};
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}: the Call and its `repSeq`. */
declare const callRepChangedPayloadSchema: z74.ZodObject<{
	callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
	repSeq: z74.ZodNumber;
}, z74.core.$strict>;
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}. */
type CallRepChangedPayload = z74.infer<typeof callRepChangedPayloadSchema>;
/** Rebuilds a Call's Moments after its Rep is picked or changed. The service bumps `repSeq` in the same write as the change; the job applies only when the Call's stored sequence equals this one, and the Call is out of search until it finishes. */
declare const CALL_REP_CHANGED_MESSAGE: {
	readonly type: "playbook.call_rep_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z74.ZodObject<{
		callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
		repSeq: z74.ZodNumber;
	}, z74.core.$strict>;
};
/** The payload of {@link CALL_DELETED_MESSAGE}: the Call and its `deletionSeq`. */
declare const callDeletedPayloadSchema: z74.ZodObject<{
	callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
	deletionSeq: z74.ZodNumber;
}, z74.core.$strict>;
/** The payload of {@link CALL_DELETED_MESSAGE}. */
type CallDeletedPayload = z74.infer<typeof callDeletedPayloadSchema>;
/** Queues the removal of a deleted Call's Moments and vectors, as `playbook.document_deleted` does for a document: it applies only if the Call is still deleted and its stored `deletionSeq` equals this one. Only a delete that changes the state bumps it or publishes. Search hides a deleted Call by its state, never by this job. */
declare const CALL_DELETED_MESSAGE: {
	readonly type: "playbook.call_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z74.ZodObject<{
		callId: z74.core.$ZodBranded<z74.ZodString, "call", "out">;
		deletionSeq: z74.ZodNumber;
	}, z74.core.$strict>;
};
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}: the Deal's opaque id (never the customer's text) and its `outcomeSeq`. */
declare const dealOutcomeChangedPayloadSchema: z74.ZodObject<{
	dealRecordId: z74.core.$ZodBranded<z74.ZodString, "deal", "out">;
	outcomeSeq: z74.ZodNumber;
}, z74.core.$strict>;
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}. */
type DealOutcomeChangedPayload = z74.infer<typeof dealOutcomeChangedPayloadSchema>;
/** Re-tags a Deal's Moments in the index after its Outcome changes. The job reads the current Outcome from the database and applies only when the Deal's stored `outcomeSeq` equals this one, so two changes cannot finish in the wrong order. */
declare const DEAL_OUTCOME_CHANGED_MESSAGE: {
	readonly type: "playbook.deal_outcome_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z74.ZodObject<{
		dealRecordId: z74.core.$ZodBranded<z74.ZodString, "deal", "out">;
		outcomeSeq: z74.ZodNumber;
	}, z74.core.$strict>;
};
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
declare const dealImportUploadedPayloadSchema: z74.ZodObject<{
	importId: z74.core.$ZodBranded<z74.ZodString, "dimp", "out">;
}, z74.core.$strict>;
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
type DealImportUploadedPayload = z74.infer<typeof dealImportUploadedPayloadSchema>;
/** Starts the processing of an uploaded CSV. The job is idempotent and resumable, keyed on the import. */
declare const DEAL_IMPORT_UPLOADED_MESSAGE: {
	readonly type: "playbook.deal_import_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z74.ZodObject<{
		importId: z74.core.$ZodBranded<z74.ZodString, "dimp", "out">;
	}, z74.core.$strict>;
};
import { z as z75 } from "zod";
/**
* The states a Playbook document is in, in the order a document passes through them (ADR 0016).
* `deleted` means soft-deleted and awaiting purge. The db library builds its column from this
* same list, so the names are the contract between the two.
*/
declare const DOCUMENT_STATES: readonly ["uploaded", "processing", "ready", "failed", "deleted"];
/** The state of a Playbook document. */
declare const documentStateSchema: z75.ZodEnum<{
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	uploaded: "uploaded";
}>;
/** The state of a Playbook document. */
type DocumentState = z75.infer<typeof documentStateSchema>;
/**
* Why a document ended in `failed`: a closed list the portal maps to its own wording. Never free
* text, so a reason cannot carry the content or name of a file. This list is the lead's reading
* of ADR 0016, which names only the page limit; the owner did not choose the rest.
*/
declare const DOCUMENT_FAILURE_REASONS: readonly ["too_many_pages", "unreadable", "password_protected", "no_text", "processing_failed"];
/** Why a document ended in `failed`. */
declare const documentFailureReasonSchema: z75.ZodEnum<{
	no_text: "no_text";
	password_protected: "password_protected";
	processing_failed: "processing_failed";
	too_many_pages: "too_many_pages";
	unreadable: "unreadable";
}>;
/** Why a document ended in `failed`. */
type DocumentFailureReason = z75.infer<typeof documentFailureReasonSchema>;
/** Owner's choice (ADR 0016, choice 2): the file extensions phase 1 accepts, lower case with the dot. */
declare const ACCEPTED_DOCUMENT_EXTENSIONS: readonly [".pdf", ".docx", ".pptx", ".txt", ".md"];
/** An accepted file extension. */
type AcceptedDocumentExtension = (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number];
/** Owner's choice (ADR 0016, choice 2): the media types phase 1 accepts, one for each accepted extension. */
declare const ACCEPTED_DOCUMENT_MEDIA_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/markdown"];
/** The media type of a stored document, as the service detected it from the content. */
declare const documentMediaTypeSchema: z75.ZodEnum<{
	"application/pdf": "application/pdf";
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	"text/markdown": "text/markdown";
	"text/plain": "text/plain";
}>;
/** The media type of a stored document. */
type DocumentMediaType = z75.infer<typeof documentMediaTypeSchema>;
/** The media type each accepted extension stands for. */
declare const MEDIA_TYPE_BY_EXTENSION: Readonly<Record<AcceptedDocumentExtension, DocumentMediaType>>;
/** Owner's choice (ADR 0016, choice 2): the largest file accepted, 25 MB counted as 25 * 1024 * 1024 bytes. */
declare const MAX_DOCUMENT_BYTES: number;
/** Owner's choice (ADR 0016, choice 2): the most pages a document may have; checked by the ingestion job, not at upload. */
declare const MAX_DOCUMENT_PAGES = 300;
/** The lead's default (ADR 0016), not the owner's: days a soft-deleted document is kept before it is purged. */
declare const DOCUMENT_RETENTION_DAYS = 30;
/** The lead's default (ADR 0016), not the owner's: documents an Organization may hold, soft-deleted ones included until purged. */
declare const DEFAULT_MAX_DOCUMENTS = 500;
/** The lead's default (ADR 0016), not the owner's: bytes an Organization may hold, 2 GB counted as 2 * 1024^3. */
declare const DEFAULT_MAX_DOCUMENT_BYTES_TOTAL: number;
/**
* How lengths are counted in this area: in Unicode code points, as Zod's string `min` and `max`
* count them, so an astral-plane character counts as 1 (not 2 as JavaScript's `.length` has it). A
* database `varchar(n)` or `char_length` check counts code points too, so the column limit is the
* same number; a column must also allow {@link MAX_UTF8_BYTES_PER_CODE_POINT} bytes per code point
* (the most UTF-8 takes), such as `MAX_DOCUMENT_FILE_NAME_BYTES`.
*/
declare const MAX_UTF8_BYTES_PER_CODE_POINT = 4;
/** The longest file name, in Unicode code points, once control and direction characters are stripped. */
declare const MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
/** The most UTF-8 bytes a stored file name can take: 255 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DOCUMENT_FILE_NAME_BYTES: number;
/** The stored form of a file name: control and bidirectional characters removed, then trimmed. */
declare function normaliseFileName(name: string): string;
/** The accepted extension a file name ends with, compared without case, or undefined. */
declare function documentExtension(fileName: string): AcceptedDocumentExtension | undefined;
/**
* A document's file name, in a request and in a response: at most 1000 raw Unicode code points,
* then control and bidirectional characters are removed (not rejected) and the rest is trimmed to
* 1 to 255 well-formed Unicode code points with no `/` or `\` and a visible stem before the last
* dot (`.pdf`, or an invisible character plus `.pdf`, is rejected). It does not check the
* extension: that is {@link documentTypeCheckSchema}, which has its own error code. Parsing a
* stored name yields a safe one. The name is for display only and is never a storage key or a
* path: the service keys storage on the document id. It is stricter than a person's name (which
* keeps direction characters) because a file name is shown beside the person's own text in lists
* and downloads, where a right-to-left override can disguise an extension, and a person's name has
* no extension to disguise. Zero-width characters other than in the stem are allowed, so display
* code must still treat a name as untrusted text. A name is never part of an error body.
*/
declare const documentFileNameSchema: z75.ZodPipe<z75.ZodPipe<z75.ZodString, z75.ZodTransform<string, string>>, z75.ZodString>;
/** The name of an uploaded file. */
type DocumentFileName = z75.infer<typeof documentFileNameSchema>;
/**
* The type check of an upload, on the file name in its stored form (control and bidirectional
* characters stripped, then trimmed): it must end in an accepted extension. A failure is
* `document.unsupported_type` (415). Services call `checkUploadFile`, not this. The service also inspects the content, because the name
* and the declared type are untrusted.
*/
declare const documentTypeCheckSchema: z75.ZodPipe<z75.ZodPipe<z75.ZodString, z75.ZodTransform<string, string>>, z75.ZodString>;
/**
* The size check of an upload, on the byte count: at most {@link MAX_DOCUMENT_BYTES}. A failure
* is `document.too_large` (413). Services call `checkUploadFile`, not this. Emptiness is not checked here: an empty file fails the upload
* schema as `request.invalid`.
*/
declare const documentSizeCheckSchema: z75.ZodNumber;
/** Lower-cases a media type and drops its parameters, so `Text/Plain; charset=utf-8` becomes `text/plain`. */
declare function normaliseMediaType(mediaType: string): string;
/** Whether text holds a control or bidirectional character (the ones a file name has stripped), so an identifier can refuse it. */
declare function hasStrippableCharacter(text: string): boolean;
/** Whether text is well-formed UTF-16: no lone surrogate. */
declare function isWellFormedText(text: string): boolean;
import { z as z76 } from "zod";
/**
* `prospect.created` (version 1): a Prospect was created. Carries ids and the Source kind, no
* personal data; a consumer that needs the person reads the Prospect from core.
*/
declare const prospectCreatedEvent: {
	type: "prospect.created";
	version: 1;
	schema: z76.ZodObject<{
		id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
		occurredAt: z76.ZodISODateTime;
		organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
		region: z76.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z76.ZodLiteral<"prospect.created">;
		version: z76.ZodLiteral<1>;
		data: z76.ZodObject<{
			prospectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
			companyId: z76.ZodNullable<z76.core.$ZodBranded<z76.ZodString, "pco", "out">>;
			ownerMembershipId: z76.ZodNullable<z76.core.$ZodBranded<z76.ZodString, "mem", "out">>;
			source: z76.ZodUnion<readonly [z76.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z76.ZodString]>;
		}, z76.core.$strict>;
	}, z76.core.$strip>;
	parse: (input: unknown) => {
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.created";
		version: 1;
		data: {
			prospectId: string & z76.$brand<"prs">;
			companyId: (string & z76.$brand<"pco">) | null;
			ownerMembershipId: (string & z76.$brand<"mem">) | null;
			source: string;
		};
	};
	safeParse: (input: unknown) => z76.ZodSafeParseResult<{
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.created";
		version: 1;
		data: {
			prospectId: string & z76.$brand<"prs">;
			companyId: (string & z76.$brand<"pco">) | null;
			ownerMembershipId: (string & z76.$brand<"mem">) | null;
			source: string;
		};
	}>;
};
/**
* `prospect.updated` (version 1): a Prospect changed. `changedFields` names the fields whose
* current value changed (names only, never values); `ownerChanged`, `companyChanged` and
* `statusChanged` flag the other attributes. Published once per change.
*/
declare const prospectUpdatedEvent: {
	type: "prospect.updated";
	version: 1;
	schema: z76.ZodObject<{
		id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
		occurredAt: z76.ZodISODateTime;
		organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
		region: z76.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z76.ZodLiteral<"prospect.updated">;
		version: z76.ZodLiteral<1>;
		data: z76.ZodObject<{
			prospectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
			changedFields: z76.ZodArray<z76.ZodEnum<{
				email: "email";
				firstName: "firstName";
				jobTitle: "jobTitle";
				lastName: "lastName";
				linkedinUrl: "linkedinUrl";
				phone: "phone";
			}>>;
			ownerChanged: z76.ZodBoolean;
			companyChanged: z76.ZodBoolean;
			statusChanged: z76.ZodBoolean;
			source: z76.ZodUnion<readonly [z76.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z76.ZodString]>;
		}, z76.core.$strict>;
	}, z76.core.$strip>;
	parse: (input: unknown) => {
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.updated";
		version: 1;
		data: {
			prospectId: string & z76.$brand<"prs">;
			changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
			ownerChanged: boolean;
			companyChanged: boolean;
			statusChanged: boolean;
			source: string;
		};
	};
	safeParse: (input: unknown) => z76.ZodSafeParseResult<{
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.updated";
		version: 1;
		data: {
			prospectId: string & z76.$brand<"prs">;
			changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
			ownerChanged: boolean;
			companyChanged: boolean;
			statusChanged: boolean;
			source: string;
		};
	}>;
};
/** `prospect.merged` (version 1): Prospects were merged into a survivor; links (such as Deal links) move to the survivor. Ids only. */
declare const prospectMergedEvent: {
	type: "prospect.merged";
	version: 1;
	schema: z76.ZodObject<{
		id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
		occurredAt: z76.ZodISODateTime;
		organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
		region: z76.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z76.ZodLiteral<"prospect.merged">;
		version: z76.ZodLiteral<1>;
		data: z76.ZodObject<{
			mergeId: z76.core.$ZodBranded<z76.ZodString, "pmrg", "out">;
			survivorProspectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
			mergedProspectIds: z76.ZodArray<z76.core.$ZodBranded<z76.ZodString, "prs", "out">>;
		}, z76.core.$strict>;
	}, z76.core.$strip>;
	parse: (input: unknown) => {
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merged";
		version: 1;
		data: {
			mergeId: string & z76.$brand<"pmrg">;
			survivorProspectId: string & z76.$brand<"prs">;
			mergedProspectIds: (string & z76.$brand<"prs">)[];
		};
	};
	safeParse: (input: unknown) => z76.ZodSafeParseResult<{
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merged";
		version: 1;
		data: {
			mergeId: string & z76.$brand<"pmrg">;
			survivorProspectId: string & z76.$brand<"prs">;
			mergedProspectIds: (string & z76.$brand<"prs">)[];
		};
	}>;
};
/** `prospect.merge_undone` (version 1): a merge was reversed and the merged Prospects restored; links move back. Ids only. */
declare const prospectMergeUndoneEvent: {
	type: "prospect.merge_undone";
	version: 1;
	schema: z76.ZodObject<{
		id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
		occurredAt: z76.ZodISODateTime;
		organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
		region: z76.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z76.ZodLiteral<"prospect.merge_undone">;
		version: z76.ZodLiteral<1>;
		data: z76.ZodObject<{
			mergeId: z76.core.$ZodBranded<z76.ZodString, "pmrg", "out">;
			survivorProspectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
			restoredProspectIds: z76.ZodArray<z76.core.$ZodBranded<z76.ZodString, "prs", "out">>;
		}, z76.core.$strict>;
	}, z76.core.$strip>;
	parse: (input: unknown) => {
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merge_undone";
		version: 1;
		data: {
			mergeId: string & z76.$brand<"pmrg">;
			survivorProspectId: string & z76.$brand<"prs">;
			restoredProspectIds: (string & z76.$brand<"prs">)[];
		};
	};
	safeParse: (input: unknown) => z76.ZodSafeParseResult<{
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merge_undone";
		version: 1;
		data: {
			mergeId: string & z76.$brand<"pmrg">;
			survivorProspectId: string & z76.$brand<"prs">;
			restoredProspectIds: (string & z76.$brand<"prs">)[];
		};
	}>;
};
/**
* `prospect.erased` (version 1): a Prospect was erased. The Playbook consumes it to drop its
* links; it is idempotent on redelivery. It carries the opaque id and nothing about the person.
*/
declare const prospectErasedEvent: {
	type: "prospect.erased";
	version: 1;
	schema: z76.ZodObject<{
		id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
		occurredAt: z76.ZodISODateTime;
		organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
		region: z76.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z76.ZodLiteral<"prospect.erased">;
		version: z76.ZodLiteral<1>;
		data: z76.ZodObject<{
			prospectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
		}, z76.core.$strict>;
	}, z76.core.$strip>;
	parse: (input: unknown) => {
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.erased";
		version: 1;
		data: {
			prospectId: string & z76.$brand<"prs">;
		};
	};
	safeParse: (input: unknown) => z76.ZodSafeParseResult<{
		id: string & z76.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z76.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.erased";
		version: 1;
		data: {
			prospectId: string & z76.$brand<"prs">;
		};
	}>;
};
/** Every Prospect event, by type. */
declare const PROSPECT_EVENTS: {
	readonly "prospect.created": {
		type: "prospect.created";
		version: 1;
		schema: z76.ZodObject<{
			id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
			occurredAt: z76.ZodISODateTime;
			organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
			region: z76.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z76.ZodLiteral<"prospect.created">;
			version: z76.ZodLiteral<1>;
			data: z76.ZodObject<{
				prospectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
				companyId: z76.ZodNullable<z76.core.$ZodBranded<z76.ZodString, "pco", "out">>;
				ownerMembershipId: z76.ZodNullable<z76.core.$ZodBranded<z76.ZodString, "mem", "out">>;
				source: z76.ZodUnion<readonly [z76.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z76.ZodString]>;
			}, z76.core.$strict>;
		}, z76.core.$strip>;
		parse: (input: unknown) => {
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.created";
			version: 1;
			data: {
				prospectId: string & z76.$brand<"prs">;
				companyId: (string & z76.$brand<"pco">) | null;
				ownerMembershipId: (string & z76.$brand<"mem">) | null;
				source: string;
			};
		};
		safeParse: (input: unknown) => z76.ZodSafeParseResult<{
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.created";
			version: 1;
			data: {
				prospectId: string & z76.$brand<"prs">;
				companyId: (string & z76.$brand<"pco">) | null;
				ownerMembershipId: (string & z76.$brand<"mem">) | null;
				source: string;
			};
		}>;
	};
	readonly "prospect.updated": {
		type: "prospect.updated";
		version: 1;
		schema: z76.ZodObject<{
			id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
			occurredAt: z76.ZodISODateTime;
			organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
			region: z76.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z76.ZodLiteral<"prospect.updated">;
			version: z76.ZodLiteral<1>;
			data: z76.ZodObject<{
				prospectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
				changedFields: z76.ZodArray<z76.ZodEnum<{
					email: "email";
					firstName: "firstName";
					jobTitle: "jobTitle";
					lastName: "lastName";
					linkedinUrl: "linkedinUrl";
					phone: "phone";
				}>>;
				ownerChanged: z76.ZodBoolean;
				companyChanged: z76.ZodBoolean;
				statusChanged: z76.ZodBoolean;
				source: z76.ZodUnion<readonly [z76.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z76.ZodString]>;
			}, z76.core.$strict>;
		}, z76.core.$strip>;
		parse: (input: unknown) => {
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.updated";
			version: 1;
			data: {
				prospectId: string & z76.$brand<"prs">;
				changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
				ownerChanged: boolean;
				companyChanged: boolean;
				statusChanged: boolean;
				source: string;
			};
		};
		safeParse: (input: unknown) => z76.ZodSafeParseResult<{
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.updated";
			version: 1;
			data: {
				prospectId: string & z76.$brand<"prs">;
				changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
				ownerChanged: boolean;
				companyChanged: boolean;
				statusChanged: boolean;
				source: string;
			};
		}>;
	};
	readonly "prospect.merged": {
		type: "prospect.merged";
		version: 1;
		schema: z76.ZodObject<{
			id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
			occurredAt: z76.ZodISODateTime;
			organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
			region: z76.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z76.ZodLiteral<"prospect.merged">;
			version: z76.ZodLiteral<1>;
			data: z76.ZodObject<{
				mergeId: z76.core.$ZodBranded<z76.ZodString, "pmrg", "out">;
				survivorProspectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
				mergedProspectIds: z76.ZodArray<z76.core.$ZodBranded<z76.ZodString, "prs", "out">>;
			}, z76.core.$strict>;
		}, z76.core.$strip>;
		parse: (input: unknown) => {
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merged";
			version: 1;
			data: {
				mergeId: string & z76.$brand<"pmrg">;
				survivorProspectId: string & z76.$brand<"prs">;
				mergedProspectIds: (string & z76.$brand<"prs">)[];
			};
		};
		safeParse: (input: unknown) => z76.ZodSafeParseResult<{
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merged";
			version: 1;
			data: {
				mergeId: string & z76.$brand<"pmrg">;
				survivorProspectId: string & z76.$brand<"prs">;
				mergedProspectIds: (string & z76.$brand<"prs">)[];
			};
		}>;
	};
	readonly "prospect.merge_undone": {
		type: "prospect.merge_undone";
		version: 1;
		schema: z76.ZodObject<{
			id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
			occurredAt: z76.ZodISODateTime;
			organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
			region: z76.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z76.ZodLiteral<"prospect.merge_undone">;
			version: z76.ZodLiteral<1>;
			data: z76.ZodObject<{
				mergeId: z76.core.$ZodBranded<z76.ZodString, "pmrg", "out">;
				survivorProspectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
				restoredProspectIds: z76.ZodArray<z76.core.$ZodBranded<z76.ZodString, "prs", "out">>;
			}, z76.core.$strict>;
		}, z76.core.$strip>;
		parse: (input: unknown) => {
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merge_undone";
			version: 1;
			data: {
				mergeId: string & z76.$brand<"pmrg">;
				survivorProspectId: string & z76.$brand<"prs">;
				restoredProspectIds: (string & z76.$brand<"prs">)[];
			};
		};
		safeParse: (input: unknown) => z76.ZodSafeParseResult<{
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merge_undone";
			version: 1;
			data: {
				mergeId: string & z76.$brand<"pmrg">;
				survivorProspectId: string & z76.$brand<"prs">;
				restoredProspectIds: (string & z76.$brand<"prs">)[];
			};
		}>;
	};
	readonly "prospect.erased": {
		type: "prospect.erased";
		version: 1;
		schema: z76.ZodObject<{
			id: z76.core.$ZodBranded<z76.ZodString, "evt", "out">;
			occurredAt: z76.ZodISODateTime;
			organizationId: z76.core.$ZodBranded<z76.ZodString, "org", "out">;
			region: z76.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z76.ZodLiteral<"prospect.erased">;
			version: z76.ZodLiteral<1>;
			data: z76.ZodObject<{
				prospectId: z76.core.$ZodBranded<z76.ZodString, "prs", "out">;
			}, z76.core.$strict>;
		}, z76.core.$strip>;
		parse: (input: unknown) => {
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.erased";
			version: 1;
			data: {
				prospectId: string & z76.$brand<"prs">;
			};
		};
		safeParse: (input: unknown) => z76.ZodSafeParseResult<{
			id: string & z76.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z76.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.erased";
			version: 1;
			data: {
				prospectId: string & z76.$brand<"prs">;
			};
		}>;
	};
};
/** The type of a Prospect event. */
type ProspectEventType = keyof typeof PROSPECT_EVENTS;
import { z as z77 } from "zod";
/** The largest import file, in bytes (10 MB). */
declare const MAX_PROSPECT_IMPORT_BYTES: number;
/** The most data rows an import may hold. */
declare const MAX_PROSPECT_IMPORT_ROWS = 5e4;
/** The name of the one file part of the multipart upload; the request carries an `Idempotency-Key` header. */
declare const PROSPECT_IMPORT_FILE_FIELD = "file";
/**
* The columns of the CSV template, in order. A row needs an email, a phone or a LinkedIn address.
* `owner_email` names a member (Rep or Manager) of the Organization; `tags` is separated by `;`.
* Values are written with the Source `import` and never replace a manual value (ADR 0020).
*/
declare const PROSPECT_IMPORT_COLUMNS: readonly ["first_name", "last_name", "email", "phone", "linkedin_url", "job_title", "company_name", "company_domain", "owner_email", "tags"];
/** The states of an import; `completed` and `failed` are final. */
declare const PROSPECT_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of an import. */
declare const prospectImportStateSchema: z77.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of an import. */
type ProspectImportState = z77.infer<typeof prospectImportStateSchema>;
/** Why a whole import failed after it was accepted. */
declare const PROSPECT_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable"];
/** Why a whole import failed. */
declare const prospectImportFailureReasonSchema: z77.ZodEnum<{
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import failed. */
type ProspectImportFailureReason = z77.infer<typeof prospectImportFailureReasonSchema>;
/** What happened to one row. */
declare const PROSPECT_IMPORT_ROW_RESULTS: readonly ["created", "updated", "skipped", "rejected"];
/** What happened to one row. */
declare const prospectImportRowResultSchema: z77.ZodEnum<{
	created: "created";
	rejected: "rejected";
	skipped: "skipped";
	updated: "updated";
}>;
/** What happened to one row. */
type ProspectImportRowResult = z77.infer<typeof prospectImportRowResultSchema>;
/** Why a row was skipped: the file changes nothing for it. */
declare const PROSPECT_IMPORT_SKIP_REASONS: readonly ["no_change", "manual_values_kept"];
/** Why a row was rejected: the row is not applied and the file needs fixing. */
declare const PROSPECT_IMPORT_REJECT_REASONS: readonly ["wrong_column_count", "blank_row", "missing_identity", "invalid_email", "invalid_phone", "invalid_linkedin_url", "invalid_name", "invalid_job_title", "invalid_company", "invalid_tags", "owner_not_found", "owner_not_allowed", "duplicate_in_file", "identity_conflict"];
/** Why a row was skipped or rejected. */
declare const prospectImportRowReasonSchema: z77.ZodEnum<{
	blank_row: "blank_row";
	duplicate_in_file: "duplicate_in_file";
	identity_conflict: "identity_conflict";
	invalid_company: "invalid_company";
	invalid_email: "invalid_email";
	invalid_job_title: "invalid_job_title";
	invalid_linkedin_url: "invalid_linkedin_url";
	invalid_name: "invalid_name";
	invalid_phone: "invalid_phone";
	invalid_tags: "invalid_tags";
	manual_values_kept: "manual_values_kept";
	missing_identity: "missing_identity";
	no_change: "no_change";
	owner_not_allowed: "owner_not_allowed";
	owner_not_found: "owner_not_found";
	wrong_column_count: "wrong_column_count";
}>;
/** Why a row was skipped or rejected. */
type ProspectImportRowReason = z77.infer<typeof prospectImportRowReasonSchema>;
/**
* A Prospect import as core returns it. It carries no file name and no cell. The counts are
* `null` until `completed`, then `rowCount` is the sum of the other four; `failureReason` is set
* exactly when `state` is `failed`. The report is the paginated rows. An import is a queued,
* idempotent and resumable job, so the page can be closed and the import read again by id.
*/
declare const prospectImportSchema: z77.ZodObject<{
	id: z77.core.$ZodBranded<z77.ZodString, "pimp", "out">;
	state: z77.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z77.ZodNullable<z77.ZodEnum<{
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z77.ZodNullable<z77.ZodNumber>;
	createdCount: z77.ZodNullable<z77.ZodNumber>;
	updatedCount: z77.ZodNullable<z77.ZodNumber>;
	skippedCount: z77.ZodNullable<z77.ZodNumber>;
	rejectedCount: z77.ZodNullable<z77.ZodNumber>;
	uploadedByUserId: z77.core.$ZodBranded<z77.ZodString, "usr", "out">;
	createdAt: z77.ZodISODateTime;
	updatedAt: z77.ZodISODateTime;
}, z77.core.$strip>;
/** A Prospect import as core returns it. */
type ProspectImport = z77.infer<typeof prospectImportSchema>;
/** The path parameters of a request about one import. */
declare const prospectImportParamsSchema: z77.ZodObject<{
	importId: z77.core.$ZodBranded<z77.ZodString, "pimp", "out">;
}, z77.core.$strict>;
/** The path parameters of a request about one import. */
type ProspectImportParams = z77.infer<typeof prospectImportParamsSchema>;
/** The query parameters of a request to list imports: a page. */
declare const listProspectImportsQuerySchema: z77.ZodObject<{
	cursor: z77.ZodOptional<z77.ZodString>;
	limit: z77.ZodDefault<z77.ZodPipe<z77.ZodPipe<z77.ZodUnion<readonly [z77.ZodNumber, z77.ZodString]>, z77.ZodTransform<number, string | number>>, z77.ZodNumber>>;
}, z77.core.$strict>;
/** The query parameters of a request to list imports. */
type ListProspectImportsQuery = z77.infer<typeof listProspectImportsQuerySchema>;
/** One page of imports, newest first (by `createdAt`, then id, both descending). */
declare const listProspectImportsResponseSchema: z77.ZodObject<{
	items: z77.ZodArray<z77.ZodObject<{
		id: z77.core.$ZodBranded<z77.ZodString, "pimp", "out">;
		state: z77.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z77.ZodNullable<z77.ZodEnum<{
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z77.ZodNullable<z77.ZodNumber>;
		createdCount: z77.ZodNullable<z77.ZodNumber>;
		updatedCount: z77.ZodNullable<z77.ZodNumber>;
		skippedCount: z77.ZodNullable<z77.ZodNumber>;
		rejectedCount: z77.ZodNullable<z77.ZodNumber>;
		uploadedByUserId: z77.core.$ZodBranded<z77.ZodString, "usr", "out">;
		createdAt: z77.ZodISODateTime;
		updatedAt: z77.ZodISODateTime;
	}, z77.core.$strip>>;
	nextCursor: z77.ZodNullable<z77.ZodString>;
}, z77.core.$strip>;
/** One page of imports. */
type ListProspectImportsResponse = z77.infer<typeof listProspectImportsResponseSchema>;
/** The position in an import list. */
declare const prospectImportCursorSchema: z77.ZodObject<{
	createdAt: z77.ZodISODateTime;
	id: z77.core.$ZodBranded<z77.ZodString, "pimp", "out">;
}, z77.core.$strict>;
/** The position in an import list. */
type ProspectImportCursor = z77.infer<typeof prospectImportCursorSchema>;
/**
* One row of the report: the record number (the header is record 1, so the first data row is 2),
* the `result` and, for a skipped or rejected row, the `reason`. `prospectId` is the Prospect the
* row created or updated (or matched, when skipped) and is `null` for a rejected row. No cell of
* the file is echoed, so a report carries no personal data.
*/
declare const prospectImportRowSchema: z77.ZodObject<{
	rowNumber: z77.ZodNumber;
	result: z77.ZodEnum<{
		created: "created";
		rejected: "rejected";
		skipped: "skipped";
		updated: "updated";
	}>;
	reason: z77.ZodNullable<z77.ZodEnum<{
		blank_row: "blank_row";
		duplicate_in_file: "duplicate_in_file";
		identity_conflict: "identity_conflict";
		invalid_company: "invalid_company";
		invalid_email: "invalid_email";
		invalid_job_title: "invalid_job_title";
		invalid_linkedin_url: "invalid_linkedin_url";
		invalid_name: "invalid_name";
		invalid_phone: "invalid_phone";
		invalid_tags: "invalid_tags";
		manual_values_kept: "manual_values_kept";
		missing_identity: "missing_identity";
		no_change: "no_change";
		owner_not_allowed: "owner_not_allowed";
		owner_not_found: "owner_not_found";
		wrong_column_count: "wrong_column_count";
	}>>;
	prospectId: z77.ZodNullable<z77.core.$ZodBranded<z77.ZodString, "prs", "out">>;
}, z77.core.$strip>;
/** One row of an import report. */
type ProspectImportRow = z77.infer<typeof prospectImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page and optionally one `result`. Rows are in CSV order. An unknown parameter is refused. */
declare const listProspectImportRowsQuerySchema: z77.ZodObject<{
	cursor: z77.ZodOptional<z77.ZodString>;
	limit: z77.ZodDefault<z77.ZodPipe<z77.ZodPipe<z77.ZodUnion<readonly [z77.ZodNumber, z77.ZodString]>, z77.ZodTransform<number, string | number>>, z77.ZodNumber>>;
	result: z77.ZodOptional<z77.ZodEnum<{
		created: "created";
		rejected: "rejected";
		skipped: "skipped";
		updated: "updated";
	}>>;
}, z77.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListProspectImportRowsQuery = z77.infer<typeof listProspectImportRowsQuerySchema>;
/** One page of an import report. */
declare const listProspectImportRowsResponseSchema: z77.ZodObject<{
	items: z77.ZodArray<z77.ZodObject<{
		rowNumber: z77.ZodNumber;
		result: z77.ZodEnum<{
			created: "created";
			rejected: "rejected";
			skipped: "skipped";
			updated: "updated";
		}>;
		reason: z77.ZodNullable<z77.ZodEnum<{
			blank_row: "blank_row";
			duplicate_in_file: "duplicate_in_file";
			identity_conflict: "identity_conflict";
			invalid_company: "invalid_company";
			invalid_email: "invalid_email";
			invalid_job_title: "invalid_job_title";
			invalid_linkedin_url: "invalid_linkedin_url";
			invalid_name: "invalid_name";
			invalid_phone: "invalid_phone";
			invalid_tags: "invalid_tags";
			manual_values_kept: "manual_values_kept";
			missing_identity: "missing_identity";
			no_change: "no_change";
			owner_not_allowed: "owner_not_allowed";
			owner_not_found: "owner_not_found";
			wrong_column_count: "wrong_column_count";
		}>>;
		prospectId: z77.ZodNullable<z77.core.$ZodBranded<z77.ZodString, "prs", "out">>;
	}, z77.core.$strip>>;
	nextCursor: z77.ZodNullable<z77.ZodString>;
}, z77.core.$strip>;
/** One page of an import report. */
type ListProspectImportRowsResponse = z77.infer<typeof listProspectImportRowsResponseSchema>;
/** The position in an import report: the record number of the last row of the page. */
declare const prospectImportRowCursorSchema: z77.ZodObject<{
	rowNumber: z77.ZodNumber;
}, z77.core.$strict>;
/** The position in an import report. */
type ProspectImportRowCursor = z77.infer<typeof prospectImportRowCursorSchema>;
/** The columns of the downloadable report CSV, in order. */
declare const PROSPECT_IMPORT_REPORT_COLUMNS: readonly ["row_number", "result", "reason", "prospect_id"];
/** Why an upload is refused with `prospect.import_invalid`, carried in `details.reason`. */
declare const PROSPECT_IMPORT_INVALID_REASONS: readonly ["unsupported_type", "too_large", "header_invalid", "too_many_rows"];
/** The `details` of `prospect.import_invalid`: which check the upload failed. */
declare const prospectImportInvalidDetailsSchema: z77.ZodObject<{
	reason: z77.ZodEnum<{
		header_invalid: "header_invalid";
		too_large: "too_large";
		too_many_rows: "too_many_rows";
		unsupported_type: "unsupported_type";
	}>;
}, z77.core.$strict>;
/** The `details` of `prospect.import_invalid`. */
type ProspectImportInvalidDetails = z77.infer<typeof prospectImportInvalidDetailsSchema>;
import { z as z78 } from "zod";
/** How many days after a merge it can be undone (spec M2, story 13). */
declare const PROSPECT_MERGE_UNDO_DAYS = 30;
/** The most Prospects one merge folds into the survivor. */
declare const MAX_MERGED_PROSPECTS = 5;
/** The path parameters of a request about one merge. */
declare const prospectMergeParamsSchema: z78.ZodObject<{
	mergeId: z78.core.$ZodBranded<z78.ZodString, "pmrg", "out">;
}, z78.core.$strict>;
/** The path parameters of a request about one merge. */
type ProspectMergeParams = z78.infer<typeof prospectMergeParamsSchema>;
/**
* The body of a request to merge Prospects into the survivor named in the path (`prospectId`).
* `fieldChoices` says, per field, which of the merging Prospects' value to keep, by Prospect id
* (the survivor's or one of `mergedProspectIds`); a field not named keeps the value that ADR 0020
* would choose across all the records. Every merged Prospect's history is kept, with the
* survivor's. Owner and Admin only. A Prospect that is not visible, or already merged, is
* `prospect.merge_conflict` or `prospect.not_found`. Accepts an `Idempotency-Key` header.
*/
declare const mergeProspectsRequestSchema: z78.ZodObject<{
	mergedProspectIds: z78.ZodArray<z78.core.$ZodBranded<z78.ZodString, "prs", "out">>;
	fieldChoices: z78.ZodDefault<z78.ZodRecord<z78.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z78.core.$partial, z78.core.$ZodBranded<z78.ZodString, "prs", "out">>>;
}, z78.core.$strict>;
/** The body of a request to merge Prospects. */
type MergeProspectsRequest = z78.infer<typeof mergeProspectsRequestSchema>;
/** The states of a merge: `merged`, or `undone` once reversed. */
declare const PROSPECT_MERGE_STATES: readonly ["merged", "undone"];
/**
* A merge record. Undo is possible while `state` is `merged` and now is before `undoableUntil`
* (thirty days after `createdAt`); later it is `prospect.merge_conflict`. `undoneAt` is set exactly
* when the state is `undone`. The snapshot that restores both records stays in core and is not returned.
*/
declare const prospectMergeSchema: z78.ZodObject<{
	id: z78.core.$ZodBranded<z78.ZodString, "pmrg", "out">;
	survivorProspectId: z78.core.$ZodBranded<z78.ZodString, "prs", "out">;
	mergedProspectIds: z78.ZodArray<z78.core.$ZodBranded<z78.ZodString, "prs", "out">>;
	fieldChoices: z78.ZodRecord<z78.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z78.core.$partial, z78.core.$ZodBranded<z78.ZodString, "prs", "out">>;
	state: z78.ZodEnum<{
		merged: "merged";
		undone: "undone";
	}>;
	mergedByUserId: z78.core.$ZodBranded<z78.ZodString, "usr", "out">;
	createdAt: z78.ZodISODateTime;
	undoableUntil: z78.ZodISODateTime;
	undoneAt: z78.ZodNullable<z78.ZodISODateTime>;
}, z78.core.$strip>;
/** A merge record. */
type ProspectMerge = z78.infer<typeof prospectMergeSchema>;
/**
* The query parameters of a request to list suspected duplicates: a page and optionally the
* `prospectId` whose duplicates to list. Matching runs on the indexed normalised identities.
*/
declare const listProspectDuplicatesQuerySchema: z78.ZodObject<{
	cursor: z78.ZodOptional<z78.ZodString>;
	limit: z78.ZodDefault<z78.ZodPipe<z78.ZodPipe<z78.ZodUnion<readonly [z78.ZodNumber, z78.ZodString]>, z78.ZodTransform<number, string | number>>, z78.ZodNumber>>;
	prospectId: z78.ZodOptional<z78.core.$ZodBranded<z78.ZodString, "prs", "out">>;
}, z78.core.$strict>;
/** The query parameters of a request to list suspected duplicates. */
type ListProspectDuplicatesQuery = z78.infer<typeof listProspectDuplicatesQuerySchema>;
/** One suspected duplicate: two Prospects (in id order) and the identity kinds they share. */
declare const prospectDuplicateSchema: z78.ZodObject<{
	prospectIds: z78.ZodTuple<[z78.core.$ZodBranded<z78.ZodString, "prs", "out">, z78.core.$ZodBranded<z78.ZodString, "prs", "out">], null>;
	matchedOn: z78.ZodArray<z78.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>>;
}, z78.core.$strip>;
/** One suspected duplicate. */
type ProspectDuplicate = z78.infer<typeof prospectDuplicateSchema>;
/** One page of suspected duplicates. */
declare const listProspectDuplicatesResponseSchema: z78.ZodObject<{
	items: z78.ZodArray<z78.ZodObject<{
		prospectIds: z78.ZodTuple<[z78.core.$ZodBranded<z78.ZodString, "prs", "out">, z78.core.$ZodBranded<z78.ZodString, "prs", "out">], null>;
		matchedOn: z78.ZodArray<z78.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
		}>>;
	}, z78.core.$strip>>;
	nextCursor: z78.ZodNullable<z78.ZodString>;
}, z78.core.$strip>;
/** One page of suspected duplicates. */
type ListProspectDuplicatesResponse = z78.infer<typeof listProspectDuplicatesResponseSchema>;
/** The position in the suspected-duplicate list. */
declare const prospectDuplicateCursorSchema: z78.ZodObject<{
	first: z78.core.$ZodBranded<z78.ZodString, "prs", "out">;
	second: z78.core.$ZodBranded<z78.ZodString, "prs", "out">;
}, z78.core.$strict>;
/** The position in the suspected-duplicate list. */
type ProspectDuplicateCursor = z78.infer<typeof prospectDuplicateCursorSchema>;
import { z as z79 } from "zod";
/** The states of a Prospect: `active`, or `archived` to hide it from the default list without erasing it. */
declare const PROSPECT_STATUSES: readonly ["active", "archived"];
/** The state of a Prospect. */
declare const prospectStatusSchema: z79.ZodEnum<{
	active: "active";
	archived: "archived";
}>;
/** The state of a Prospect. */
type ProspectStatus = z79.infer<typeof prospectStatusSchema>;
/**
* A Prospect as core returns it. `fields` holds the current value of each field that has one, with
* its Source, time and actor (ADR 0020); a field with no value is absent. `email`, `phone` and
* `linkedinUrl` are the normalised identity values (ADR 0011: ASCII-folded email, E.164 phone,
* normalised LinkedIn address). `source` is the Source kind that created the Prospect.
* `ownerMembershipId` is the owner Rep's Membership, `null` while unassigned.
*/
declare const prospectSchema: z79.ZodObject<{
	id: z79.core.$ZodBranded<z79.ZodString, "prs", "out">;
	companyId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "pco", "out">>;
	ownerMembershipId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "mem", "out">>;
	status: z79.ZodEnum<{
		active: "active";
		archived: "archived";
	}>;
	source: z79.ZodUnion<readonly [z79.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z79.ZodString]>;
	tags: z79.ZodArray<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	notes: z79.ZodNullable<z79.ZodString>;
	fields: z79.ZodRecord<z79.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z79.core.$partial, z79.ZodObject<{
		value: z79.ZodString;
		source: z79.ZodUnion<readonly [z79.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z79.ZodString]>;
		sourceRef: z79.ZodNullable<z79.ZodString>;
		setAt: z79.ZodISODateTime;
		setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
	}, z79.core.$strip>>;
	createdAt: z79.ZodISODateTime;
	updatedAt: z79.ZodISODateTime;
}, z79.core.$strip>;
/** A Prospect as core returns it. */
type Prospect = z79.infer<typeof prospectSchema>;
/** The path parameters of a request about one Prospect. */
declare const prospectParamsSchema: z79.ZodObject<{
	prospectId: z79.core.$ZodBranded<z79.ZodString, "prs", "out">;
}, z79.core.$strict>;
/** The path parameters of a request about one Prospect. */
type ProspectParams = z79.infer<typeof prospectParamsSchema>;
/**
* The body of a request to create a Prospect by hand. It must carry at least one of a name, an
* email, a phone or a LinkedIn address. The Source is `manual` and the actor the caller, both set
* by core, never read from the body, so an unknown field such as `source` is refused. A Rep is the
* owner of the Prospect they create; only Owner and Admin may name another `ownerMembershipId`,
* and anyone else gets `prospect.forbidden_owner`. An identity another Prospect of the
* Organization already has is `prospect.duplicate_identity`. The call accepts an `Idempotency-Key`
* header (`idempotencyKeySchema`): a replay returns the original Prospect.
*/
declare const createProspectRequestSchema: z79.ZodObject<{
	firstName: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	lastName: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	jobTitle: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	email: z79.ZodOptional<z79.ZodPipe<z79.ZodPipe<z79.ZodString, z79.ZodTransform<string, string>>, z79.ZodString>>;
	phone: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	linkedinUrl: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	companyId: z79.ZodOptional<z79.core.$ZodBranded<z79.ZodString, "pco", "out">>;
	ownerMembershipId: z79.ZodOptional<z79.core.$ZodBranded<z79.ZodString, "mem", "out">>;
	tags: z79.ZodOptional<z79.ZodArray<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	notes: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
}, z79.core.$strict>;
/** The body of a request to create a Prospect. */
type CreateProspectRequest = z79.infer<typeof createProspectRequestSchema>;
/**
* The body of a request to edit a Prospect. Only the fields sent change; each is written with the
* Source `manual`, which beats every other Source (ADR 0020). A `null` clears a field or the
* Prospect Company, the explicit Rep or Admin action that is the only way to remove a manual
* value. At least one field is required. Ownership is changed by the owner routes, not here.
*/
declare const updateProspectRequestSchema: z79.ZodObject<{
	firstName: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	lastName: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	jobTitle: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	email: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodPipe<z79.ZodString, z79.ZodTransform<string, string>>, z79.ZodString>>>;
	phone: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	linkedinUrl: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	companyId: z79.ZodOptional<z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "pco", "out">>>;
	status: z79.ZodOptional<z79.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	tags: z79.ZodOptional<z79.ZodArray<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
	notes: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodString, z79.ZodString>>>;
}, z79.core.$strict>;
/** The body of a request to edit a Prospect. */
type UpdateProspectRequest = z79.infer<typeof updateProspectRequestSchema>;
/** The search text of a list request: trimmed, 1 to 100 characters, matched against name, email and company. */
declare const prospectSearchSchema: z79.ZodPipe<z79.ZodString, z79.ZodString>;
/**
* The query parameters of a request to list Prospects: a cursor and a limit of at most 100, and
* optionally `ownerMembershipId`, `source` (the Source kind that created it), `companyId`,
* `status` and `q`. An unknown parameter is refused. Who sees which Prospect is decided from the
* token's role and Team membership (a Rep sees what they own, a Manager what their Team's Reps
* own, Owner and Admin all); a filter can narrow that, never widen it.
*/
declare const listProspectsQuerySchema: z79.ZodObject<{
	cursor: z79.ZodOptional<z79.ZodString>;
	limit: z79.ZodDefault<z79.ZodPipe<z79.ZodPipe<z79.ZodUnion<readonly [z79.ZodNumber, z79.ZodString]>, z79.ZodTransform<number, string | number>>, z79.ZodNumber>>;
	ownerMembershipId: z79.ZodOptional<z79.core.$ZodBranded<z79.ZodString, "mem", "out">>;
	source: z79.ZodOptional<z79.ZodUnion<readonly [z79.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z79.ZodString]>>;
	companyId: z79.ZodOptional<z79.core.$ZodBranded<z79.ZodString, "pco", "out">>;
	status: z79.ZodOptional<z79.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	q: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
}, z79.core.$strict>;
/** The query parameters of a request to list Prospects. */
type ListProspectsQuery = z79.infer<typeof listProspectsQuerySchema>;
/** One page of Prospects, newest first (by `createdAt`, then id, both descending). */
declare const listProspectsResponseSchema: z79.ZodObject<{
	items: z79.ZodArray<z79.ZodObject<{
		id: z79.core.$ZodBranded<z79.ZodString, "prs", "out">;
		companyId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "pco", "out">>;
		ownerMembershipId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "mem", "out">>;
		status: z79.ZodEnum<{
			active: "active";
			archived: "archived";
		}>;
		source: z79.ZodUnion<readonly [z79.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z79.ZodString]>;
		tags: z79.ZodArray<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
		notes: z79.ZodNullable<z79.ZodString>;
		fields: z79.ZodRecord<z79.ZodEnum<{
			email: "email";
			firstName: "firstName";
			jobTitle: "jobTitle";
			lastName: "lastName";
			linkedinUrl: "linkedinUrl";
			phone: "phone";
		}> & z79.core.$partial, z79.ZodObject<{
			value: z79.ZodString;
			source: z79.ZodUnion<readonly [z79.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z79.ZodString]>;
			sourceRef: z79.ZodNullable<z79.ZodString>;
			setAt: z79.ZodISODateTime;
			setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
		}, z79.core.$strip>>;
		createdAt: z79.ZodISODateTime;
		updatedAt: z79.ZodISODateTime;
	}, z79.core.$strip>>;
	nextCursor: z79.ZodNullable<z79.ZodString>;
}, z79.core.$strip>;
/** One page of Prospects. */
type ListProspectsResponse = z79.infer<typeof listProspectsResponseSchema>;
/** The position in a Prospect list: where the last item of the page was. */
declare const prospectCursorSchema: z79.ZodObject<{
	createdAt: z79.ZodISODateTime;
	id: z79.core.$ZodBranded<z79.ZodString, "prs", "out">;
}, z79.core.$strict>;
/** The position in a Prospect list. */
type ProspectCursor = z79.infer<typeof prospectCursorSchema>;
/** The path parameters of a request for the history of one Prospect field. */
declare const prospectFieldParamsSchema: z79.ZodObject<{
	prospectId: z79.core.$ZodBranded<z79.ZodString, "prs", "out">;
	field: z79.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}>;
}, z79.core.$strict>;
/** The path parameters of a request for the history of one Prospect field. */
type ProspectFieldParams = z79.infer<typeof prospectFieldParamsSchema>;
/** The query parameters of a request for a field's history: a page. */
declare const listFieldHistoryQuerySchema: z79.ZodObject<{
	cursor: z79.ZodOptional<z79.ZodString>;
	limit: z79.ZodDefault<z79.ZodPipe<z79.ZodPipe<z79.ZodUnion<readonly [z79.ZodNumber, z79.ZodString]>, z79.ZodTransform<number, string | number>>, z79.ZodNumber>>;
}, z79.core.$strict>;
/** The query parameters of a request for a field's history. */
type ListFieldHistoryQuery = z79.infer<typeof listFieldHistoryQuerySchema>;
/** One page of a field's history, newest first; the current value, earlier values and enrichment suggestions all appear, each with its Source. */
declare const listFieldHistoryResponseSchema: z79.ZodObject<{
	items: z79.ZodArray<z79.ZodObject<{
		value: z79.ZodString;
		source: z79.ZodUnion<readonly [z79.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z79.ZodString]>;
		sourceRef: z79.ZodNullable<z79.ZodString>;
		setAt: z79.ZodISODateTime;
		setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
		state: z79.ZodEnum<{
			current: "current";
			suggested: "suggested";
			superseded: "superseded";
		}>;
	}, z79.core.$strip>>;
	nextCursor: z79.ZodNullable<z79.ZodString>;
}, z79.core.$strip>;
/** One page of a field's history. */
type ListFieldHistoryResponse = z79.infer<typeof listFieldHistoryResponseSchema>;
/** The position in a field's history. */
declare const fieldHistoryCursorSchema: z79.ZodObject<{
	setAt: z79.ZodISODateTime;
	seq: z79.ZodNumber;
}, z79.core.$strict>;
/** The position in a field's history. */
type FieldHistoryCursor = z79.infer<typeof fieldHistoryCursorSchema>;
/**
* The body of a request to change a Prospect's owner Rep. The new owner must be a Rep or Manager
* of the same Organization, else `prospect.forbidden_owner`. Owner and Admin only.
*/
declare const setProspectOwnerRequestSchema: z79.ZodObject<{
	ownerMembershipId: z79.core.$ZodBranded<z79.ZodString, "mem", "out">;
}, z79.core.$strict>;
/** The body of a request to change a Prospect's owner. */
type SetProspectOwnerRequest = z79.infer<typeof setProspectOwnerRequestSchema>;
/** The most Prospects one bulk assignment may name. */
declare const MAX_BULK_ASSIGN_PROSPECTS = 5e3;
/** Up to this many Prospects of a bulk assignment are applied before the call answers; more are queued and answered 202. */
declare const BULK_ASSIGN_SYNC_LIMIT = 500;
/**
* The body of a request to assign many Prospects to one owner: 1 to 5,000 distinct ids. Up to 500
* are applied at once (200); more are queued (202). A Prospect that does not exist or is not
* visible is not named in the answer, only counted as `skipped`. Accepts an `Idempotency-Key`
* header: a retry changes nothing twice.
*/
declare const bulkAssignProspectsRequestSchema: z79.ZodObject<{
	prospectIds: z79.ZodArray<z79.core.$ZodBranded<z79.ZodString, "prs", "out">>;
	ownerMembershipId: z79.core.$ZodBranded<z79.ZodString, "mem", "out">;
}, z79.core.$strict>;
/** The body of a request to assign many Prospects. */
type BulkAssignProspectsRequest = z79.infer<typeof bulkAssignProspectsRequestSchema>;
/** The answer to a bulk assignment: `applied` counts when it ran at once, `queued` when it was handed to a job (then the counts are `null`). */
declare const bulkAssignProspectsResponseSchema: z79.ZodObject<{
	state: z79.ZodEnum<{
		applied: "applied";
		queued: "queued";
	}>;
	requested: z79.ZodNumber;
	assigned: z79.ZodNullable<z79.ZodNumber>;
	skipped: z79.ZodNullable<z79.ZodNumber>;
}, z79.core.$strip>;
/** The answer to a bulk assignment. */
type BulkAssignProspectsResponse = z79.infer<typeof bulkAssignProspectsResponseSchema>;
/** The answer to an erasure request: it is a queued job, so the Prospect is gone once `prospect.erased` is published. Carries no personal data. */
declare const eraseProspectResponseSchema: z79.ZodObject<{
	prospectId: z79.core.$ZodBranded<z79.ZodString, "prs", "out">;
	state: z79.ZodLiteral<"queued">;
}, z79.core.$strip>;
/** The answer to an erasure request. */
type EraseProspectResponse = z79.infer<typeof eraseProspectResponseSchema>;
/**
* A Prospect Company as core returns it: the name and domain with their Source, time and actor.
* `domain` is the normalised domain (ASCII-folded host). `name` is always present.
*/
declare const prospectCompanySchema: z79.ZodObject<{
	id: z79.core.$ZodBranded<z79.ZodString, "pco", "out">;
	fields: z79.ZodObject<{
		name: z79.ZodObject<{
			value: z79.ZodString;
			source: z79.ZodUnion<readonly [z79.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z79.ZodString]>;
			sourceRef: z79.ZodNullable<z79.ZodString>;
			setAt: z79.ZodISODateTime;
			setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
		}, z79.core.$strip>;
		domain: z79.ZodOptional<z79.ZodObject<{
			value: z79.ZodString;
			source: z79.ZodUnion<readonly [z79.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z79.ZodString]>;
			sourceRef: z79.ZodNullable<z79.ZodString>;
			setAt: z79.ZodISODateTime;
			setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
		}, z79.core.$strip>>;
	}, z79.core.$strip>;
	createdAt: z79.ZodISODateTime;
	updatedAt: z79.ZodISODateTime;
}, z79.core.$strip>;
/** A Prospect Company as core returns it. */
type ProspectCompany = z79.infer<typeof prospectCompanySchema>;
/** The path parameters of a request about one Prospect Company. */
declare const prospectCompanyParamsSchema: z79.ZodObject<{
	companyId: z79.core.$ZodBranded<z79.ZodString, "pco", "out">;
}, z79.core.$strict>;
/** The path parameters of a request about one Prospect Company. */
type ProspectCompanyParams = z79.infer<typeof prospectCompanyParamsSchema>;
/** The path parameters of a request for the history of one Prospect Company field. */
declare const prospectCompanyFieldParamsSchema: z79.ZodObject<{
	companyId: z79.core.$ZodBranded<z79.ZodString, "pco", "out">;
	field: z79.ZodEnum<{
		domain: "domain";
		name: "name";
	}>;
}, z79.core.$strict>;
/** The path parameters of a request for the history of one Prospect Company field. */
type ProspectCompanyFieldParams = z79.infer<typeof prospectCompanyFieldParamsSchema>;
/**
* The body of a request to create a Prospect Company, written with the Source `manual`. Accepts an
* `Idempotency-Key` header: a replay returns the original record.
*/
declare const createProspectCompanyRequestSchema: z79.ZodObject<{
	name: z79.ZodPipe<z79.ZodString, z79.ZodString>;
	domain: z79.ZodOptional<z79.ZodPipe<z79.ZodPipe<z79.ZodString, z79.ZodTransform<string, string>>, z79.ZodString>>;
}, z79.core.$strict>;
/** The body of a request to create a Prospect Company. */
type CreateProspectCompanyRequest = z79.infer<typeof createProspectCompanyRequestSchema>;
/** The body of a request to edit a Prospect Company: only the fields sent change, written with the Source `manual`; `null` clears the domain. At least one field is required. */
declare const updateProspectCompanyRequestSchema: z79.ZodObject<{
	name: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
	domain: z79.ZodOptional<z79.ZodNullable<z79.ZodPipe<z79.ZodPipe<z79.ZodString, z79.ZodTransform<string, string>>, z79.ZodString>>>;
}, z79.core.$strict>;
/** The body of a request to edit a Prospect Company. */
type UpdateProspectCompanyRequest = z79.infer<typeof updateProspectCompanyRequestSchema>;
/** The query parameters of a request to list Prospect Companies: a page and optionally a `q` search on name and domain. An unknown parameter is refused. */
declare const listProspectCompaniesQuerySchema: z79.ZodObject<{
	cursor: z79.ZodOptional<z79.ZodString>;
	limit: z79.ZodDefault<z79.ZodPipe<z79.ZodPipe<z79.ZodUnion<readonly [z79.ZodNumber, z79.ZodString]>, z79.ZodTransform<number, string | number>>, z79.ZodNumber>>;
	q: z79.ZodOptional<z79.ZodPipe<z79.ZodString, z79.ZodString>>;
}, z79.core.$strict>;
/** The query parameters of a request to list Prospect Companies. */
type ListProspectCompaniesQuery = z79.infer<typeof listProspectCompaniesQuerySchema>;
/** One page of Prospect Companies, newest first (by `createdAt`, then id, both descending). */
declare const listProspectCompaniesResponseSchema: z79.ZodObject<{
	items: z79.ZodArray<z79.ZodObject<{
		id: z79.core.$ZodBranded<z79.ZodString, "pco", "out">;
		fields: z79.ZodObject<{
			name: z79.ZodObject<{
				value: z79.ZodString;
				source: z79.ZodUnion<readonly [z79.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z79.ZodString]>;
				sourceRef: z79.ZodNullable<z79.ZodString>;
				setAt: z79.ZodISODateTime;
				setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
			}, z79.core.$strip>;
			domain: z79.ZodOptional<z79.ZodObject<{
				value: z79.ZodString;
				source: z79.ZodUnion<readonly [z79.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z79.ZodString]>;
				sourceRef: z79.ZodNullable<z79.ZodString>;
				setAt: z79.ZodISODateTime;
				setByUserId: z79.ZodNullable<z79.core.$ZodBranded<z79.ZodString, "usr", "out">>;
			}, z79.core.$strip>>;
		}, z79.core.$strip>;
		createdAt: z79.ZodISODateTime;
		updatedAt: z79.ZodISODateTime;
	}, z79.core.$strip>>;
	nextCursor: z79.ZodNullable<z79.ZodString>;
}, z79.core.$strip>;
/** One page of Prospect Companies. */
type ListProspectCompaniesResponse = z79.infer<typeof listProspectCompaniesResponseSchema>;
/** The position in a Prospect Company list. */
declare const prospectCompanyCursorSchema: z79.ZodObject<{
	createdAt: z79.ZodISODateTime;
	id: z79.core.$ZodBranded<z79.ZodString, "pco", "out">;
}, z79.core.$strict>;
/** The position in a Prospect Company list. */
type ProspectCompanyCursor = z79.infer<typeof prospectCompanyCursorSchema>;
/** The roles that may do everything to every Prospect: merge, import, erase, assign in bulk. */
declare const PROSPECT_ADMIN_ROLES: readonly ["owner", "admin"];
/** The roles that may create, read and edit Prospects, each within what they may see (a Rep their own, a Manager their Team's Reps', Owner and Admin all). */
declare const PROSPECT_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The Prospect routes, by name. */
type ProspectRouteName = "createProspect" | "listProspects" | "getProspect" | "updateProspect" | "setProspectOwner" | "bulkAssignProspects" | "eraseProspect" | "listProspectFieldHistory" | "createProspectCompany" | "listProspectCompanies" | "getProspectCompany" | "updateProspectCompany" | "listProspectCompanyFieldHistory" | "listProspectDuplicates" | "mergeProspects" | "getProspectMerge" | "undoProspectMerge" | "uploadProspectImport" | "listProspectImports" | "getProspectImport" | "listProspectImportRows" | "downloadProspectImportReport";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type ProspectRoute = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when the route accepts an `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly ProspectErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The Prospect routes (spec M2), described as `SALES_HISTORY_ROUTES` describes its routes. Every
* route may also return the common `auth.*`, `rate.limited` and `server.*` codes. Every list is
* cursor-paginated with at most 100 items per page. A record of another Organization is always
* `prospect.not_found`. Source and actor are set by core from the route and the token, never read
* from a body.
*/
declare const PROSPECT_ROUTES: Readonly<Record<ProspectRouteName, ProspectRoute>>;
import { z as z80 } from "zod";
/** True when the text holds a control character; line breaks and tabs are allowed when `allowLineBreaks` is set. */
declare function hasControlCharacter(text: string, allowLineBreaks: boolean): boolean;
/** Trimmed text of 1 to `maxLength` characters with no control character; a request value is untrusted text for display code. */
declare function boundedTextSchema(maxLength: number): z80.ZodPipe<z80.ZodString, z80.ZodString>;
/** The longest first or last name, in characters. */
declare const MAX_PROSPECT_NAME_PART_LENGTH = 100;
/** The longest job title, in characters. */
declare const MAX_PROSPECT_JOB_TITLE_LENGTH = 200;
/** The longest Prospect Company name, in characters. */
declare const MAX_PROSPECT_COMPANY_NAME_LENGTH = 200;
/** The longest Prospect note, in characters. */
declare const MAX_PROSPECT_NOTES_LENGTH = 5e3;
/** The longest tag, in characters. */
declare const MAX_PROSPECT_TAG_LENGTH = 50;
/** The most tags one Prospect carries. */
declare const MAX_PROSPECT_TAGS = 20;
/** The longest search text of a list request, in characters. */
declare const MAX_PROSPECT_SEARCH_LENGTH = 100;
/** The longest value a stored field returns, in characters. */
declare const MAX_PROSPECT_FIELD_VALUE_LENGTH = 320;
/** The longest Source reference (an import job id, a CRM record id), in characters. */
declare const MAX_SOURCE_REF_LENGTH = 200;
/** A first or last name in a request: trimmed, 1 to 100 characters, no control character. */
declare const prospectNamePartSchema: z80.ZodPipe<z80.ZodString, z80.ZodString>;
/** A job title in a request: trimmed, 1 to 200 characters, no control character. */
declare const prospectJobTitleSchema: z80.ZodPipe<z80.ZodString, z80.ZodString>;
/** A Prospect Company name in a request: trimmed, 1 to 200 characters, no control character. */
declare const prospectCompanyNameSchema: z80.ZodPipe<z80.ZodString, z80.ZodString>;
/** Free-text notes on a Prospect: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
declare const prospectNotesSchema: z80.ZodPipe<z80.ZodString, z80.ZodString>;
/** The tags of a Prospect in a request: at most 20, each trimmed and 1 to 50 characters, no duplicates. */
declare const prospectTagsSchema: z80.ZodArray<z80.ZodPipe<z80.ZodString, z80.ZodString>>;
/**
* A phone number as typed in a request: 3 to 40 characters of digits, spaces, `+`, `(`, `)`, `.`
* and `-`. Core normalises it to E.164 (ADR 0011) and refuses what it cannot, as `request.invalid`.
*/
declare const rawPhoneSchema: z80.ZodPipe<z80.ZodString, z80.ZodString>;
/** A phone number in E.164 form, as a response carries a normalised one: `+` and 7 to 15 digits. */
declare const e164PhoneSchema: z80.ZodString;
/**
* A LinkedIn profile address as typed in a request: 1 to 300 characters naming `linkedin.com`.
* Core normalises it (ADR 0011) and refuses what it cannot, as `request.invalid`.
*/
declare const rawLinkedinUrlSchema: z80.ZodPipe<z80.ZodString, z80.ZodString>;
/**
* A company web domain in a request: folded to lower case, 3 to 253 characters, dotted ASCII
* labels of letters, digits and hyphens (an internationalised domain is sent in punycode).
*/
declare const prospectCompanyDomainSchema: z80.ZodPipe<z80.ZodPipe<z80.ZodString, z80.ZodTransform<string, string>>, z80.ZodString>;
/** The kinds of identity a Prospect is matched on (ADR 0011). */
declare const PROSPECT_IDENTITY_KINDS: readonly ["email", "phone", "linkedin"];
/** The kind of identity a Prospect is matched on. */
declare const prospectIdentityKindSchema: z80.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
}>;
/** The kind of identity a Prospect is matched on. */
type ProspectIdentityKind = z80.infer<typeof prospectIdentityKindSchema>;
/** The fields of a Prospect that carry a Source, in the camelCase the API uses. Email, phone and LinkedIn are also its identities. */
declare const PROSPECT_FIELD_NAMES: readonly ["firstName", "lastName", "jobTitle", "email", "phone", "linkedinUrl"];
/** The name of a Prospect field that carries a Source. */
declare const prospectFieldNameSchema: z80.ZodEnum<{
	email: "email";
	firstName: "firstName";
	jobTitle: "jobTitle";
	lastName: "lastName";
	linkedinUrl: "linkedinUrl";
	phone: "phone";
}>;
/** The name of a Prospect field that carries a Source. */
type ProspectFieldName = z80.infer<typeof prospectFieldNameSchema>;
/** The fields of a Prospect Company that carry a Source. */
declare const PROSPECT_COMPANY_FIELD_NAMES: readonly ["name", "domain"];
/** The name of a Prospect Company field that carries a Source. */
declare const prospectCompanyFieldNameSchema: z80.ZodEnum<{
	domain: "domain";
	name: "name";
}>;
/** The name of a Prospect Company field that carries a Source. */
type ProspectCompanyFieldName = z80.infer<typeof prospectCompanyFieldNameSchema>;
/** The most history entries kept per field (ADR 0020 bounds the history); the oldest non-current entries go first. */
declare const MAX_FIELD_HISTORY_ENTRIES = 50;
/** The Source kinds that are fixed words; `enrichment:<provider>` is the open one. */
declare const FIXED_SOURCE_KINDS: readonly ["manual", "import", "crm:hubspot", "crm:salesforce", "form"];
/**
* A Source kind (ADR 0020): `manual`, `import`, `crm:hubspot`, `crm:salesforce`, `form` or
* `enrichment:<provider>` with a provider of 1 to 32 lower-case letters, digits and underscores.
* Writers never choose it in a request body: core sets it from the route and the token.
*/
declare const sourceKindSchema: z80.ZodUnion<readonly [z80.ZodEnum<{
	"crm:hubspot": "crm:hubspot";
	"crm:salesforce": "crm:salesforce";
	form: "form";
	import: "import";
	manual: "manual";
}>, z80.ZodString]>;
/** A Source kind. */
type SourceKind = z80.infer<typeof sourceKindSchema>;
/**
* A stored value with where it came from, when and who set it (ADR 0020). `sourceRef` names the
* import job or CRM record and is `null` for manual entry; `setByUserId` is `null` when a system
* (an import job, a sync, a provider) set the value rather than a person.
*/
declare const fieldValueSchema: z80.ZodObject<{
	value: z80.ZodString;
	source: z80.ZodUnion<readonly [z80.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z80.ZodString]>;
	sourceRef: z80.ZodNullable<z80.ZodString>;
	setAt: z80.ZodISODateTime;
	setByUserId: z80.ZodNullable<z80.core.$ZodBranded<z80.ZodString, "usr", "out">>;
}, z80.core.$strip>;
/** A stored value with its Source, time and actor. */
type FieldValue = z80.infer<typeof fieldValueSchema>;
/** The states of a history entry: `current` is the value in force, `superseded` an earlier one, `suggested` an enrichment value kept beside an own value (ADR 0020). */
declare const FIELD_HISTORY_STATES: readonly ["current", "superseded", "suggested"];
/** The state of a history entry. */
declare const fieldHistoryStateSchema: z80.ZodEnum<{
	current: "current";
	suggested: "suggested";
	superseded: "superseded";
}>;
/** One entry of a field's history: the value with its Source, time and actor, and whether it is current, superseded or only suggested. */
declare const fieldHistoryEntrySchema: z80.ZodObject<{
	value: z80.ZodString;
	source: z80.ZodUnion<readonly [z80.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z80.ZodString]>;
	sourceRef: z80.ZodNullable<z80.ZodString>;
	setAt: z80.ZodISODateTime;
	setByUserId: z80.ZodNullable<z80.core.$ZodBranded<z80.ZodString, "usr", "out">>;
	state: z80.ZodEnum<{
		current: "current";
		suggested: "suggested";
		superseded: "superseded";
	}>;
}, z80.core.$strip>;
/** One entry of a field's history. */
type FieldHistoryEntry = z80.infer<typeof fieldHistoryEntrySchema>;
import { z as z81 } from "zod";
/** The longest a Call can last, in seconds: 12 hours. */
declare const MAX_CALL_DURATION_SECONDS = 43200;
/**
* The Disclosure a Call played: the version of the wording and when it finished playing, both null
* until it has. `aiAssisted` is whether it also told the Prospect an AI takes part (the Copilot,
* an Agent). Nothing here, and no request, can turn the Disclosure off.
*/
declare const callDisclosureSchema: z81.ZodObject<{
	wordingVersion: z81.ZodNullable<z81.ZodNumber>;
	playedAt: z81.ZodNullable<z81.ZodISODateTime>;
	aiAssisted: z81.ZodBoolean;
}, z81.core.$strict>;
/** The Disclosure a Call played. */
type CallDisclosure = z81.infer<typeof callDisclosureSchema>;
/**
* A Call placed or taken in the Softphone. The Prospect's number is tenant data: it is shown to
* those who may see the Call and never logged. The invariants of the state machine are checked:
* `live` and `ended` need a played Disclosure, a Recording exists only after it, `failed` has a
* reason and nothing else does, and the wrap-up (Deal identifier, note) exists only on `ended`.
*/
declare const voiceCallSchema: z81.ZodObject<{
	id: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
	direction: z81.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	state: z81.ZodEnum<{
		connecting: "connecting";
		disclosing: "disclosing";
		ended: "ended";
		failed: "failed";
		live: "live";
		missed: "missed";
		ringing: "ringing";
	}>;
	lineId: z81.core.$ZodBranded<z81.ZodString, "line", "out">;
	repMembershipId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "mem", "out">>;
	prospectId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "prs", "out">>;
	prospectNumber: z81.ZodString;
	disclosure: z81.ZodObject<{
		wordingVersion: z81.ZodNullable<z81.ZodNumber>;
		playedAt: z81.ZodNullable<z81.ZodISODateTime>;
		aiAssisted: z81.ZodBoolean;
	}, z81.core.$strict>;
	createdAt: z81.ZodISODateTime;
	answeredAt: z81.ZodNullable<z81.ZodISODateTime>;
	endedAt: z81.ZodNullable<z81.ZodISODateTime>;
	durationSeconds: z81.ZodNullable<z81.ZodNumber>;
	endedBy: z81.ZodNullable<z81.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
		system: "system";
	}>>;
	failureReason: z81.ZodNullable<z81.ZodEnum<{
		busy: "busy";
		carrier_dropped: "carrier_dropped";
		carrier_rejected: "carrier_rejected";
		disclosure_failed: "disclosure_failed";
		no_answer: "no_answer";
		provider_error: "provider_error";
		rep_unreachable: "rep_unreachable";
		timeout: "timeout";
	}>>;
	dealId: z81.ZodNullable<z81.ZodPipe<z81.ZodPipe<z81.ZodString, z81.ZodTransform<string, string>>, z81.ZodString>>;
	note: z81.ZodNullable<z81.ZodPipe<z81.ZodString, z81.ZodString>>;
	recordingState: z81.ZodEnum<{
		deleted: "deleted";
		none: "none";
		stored: "stored";
		storing: "storing";
	}>;
	transcriptState: z81.ZodEnum<{
		deleted: "deleted";
		pending: "pending";
		ready: "ready";
	}>;
}, z81.core.$strip>;
/** A Call. */
type VoiceCall = z81.infer<typeof voiceCallSchema>;
/** The path parameters of a request about one Call. */
declare const voiceCallParamsSchema: z81.ZodObject<{
	callId: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
}, z81.core.$strict>;
/** The position a Call list resumes from: newest first, by creation time then id. */
declare const voiceCallCursorSchema: z81.ZodObject<{
	createdAt: z81.ZodISODateTime;
	id: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
}, z81.core.$strict>;
/**
* The body of a request to place a Call to a number from the Rep's browser. The idempotency key is
* not in the body: see `placeCallHeadersSchema`. `to` is as typed; voice normalises it to
* E.164 and refuses what it cannot as `call.number_invalid`. `lineId` is the caller identity, the
* Rep's own Line when absent. `prospectId` links the Call to a Prospect the caller may see. There is
* no field that turns off the Disclosure or the Recording.
*/
declare const placeCallRequestSchema: z81.ZodObject<{
	to: z81.ZodPipe<z81.ZodString, z81.ZodString>;
	lineId: z81.ZodOptional<z81.core.$ZodBranded<z81.ZodString, "line", "out">>;
	prospectId: z81.ZodOptional<z81.core.$ZodBranded<z81.ZodString, "prs", "out">>;
}, z81.core.$strict>;
/**
* The headers of a request to place a Call. The `Idempotency-Key` header is required (header names
* arrive lower-cased): a retry of the same key answers the original Call and dials once, and the
* same key with a different body is `request.idempotency_key_reused`.
*/
declare const placeCallHeadersSchema: z81.ZodObject<{
	"idempotency-key": z81.ZodString;
}, z81.core.$strip>;
/** The body of a request to place a Call. */
type PlaceCallRequest = z81.infer<typeof placeCallRequestSchema>;
/**
* A warning for the Rep from the Contact Check on the number: the code of the denial and, for a
* suppressed number, the reason. A Rep may still call (ADR 0003); the warning is for their eyes.
*/
declare const contactWarningSchema: z81.ZodObject<{
	code: z81.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>;
	suppressionReason: z81.ZodNullable<z81.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z81.core.$strict>;
/** A warning from the Contact Check. */
type ContactWarning = z81.infer<typeof contactWarningSchema>;
/** The answer to placing a Call: the Call, as it stands, and any warnings from the Contact Check. */
declare const placedCallSchema: z81.ZodObject<{
	call: z81.ZodObject<{
		id: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
		direction: z81.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		state: z81.ZodEnum<{
			connecting: "connecting";
			disclosing: "disclosing";
			ended: "ended";
			failed: "failed";
			live: "live";
			missed: "missed";
			ringing: "ringing";
		}>;
		lineId: z81.core.$ZodBranded<z81.ZodString, "line", "out">;
		repMembershipId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "mem", "out">>;
		prospectId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "prs", "out">>;
		prospectNumber: z81.ZodString;
		disclosure: z81.ZodObject<{
			wordingVersion: z81.ZodNullable<z81.ZodNumber>;
			playedAt: z81.ZodNullable<z81.ZodISODateTime>;
			aiAssisted: z81.ZodBoolean;
		}, z81.core.$strict>;
		createdAt: z81.ZodISODateTime;
		answeredAt: z81.ZodNullable<z81.ZodISODateTime>;
		endedAt: z81.ZodNullable<z81.ZodISODateTime>;
		durationSeconds: z81.ZodNullable<z81.ZodNumber>;
		endedBy: z81.ZodNullable<z81.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
			system: "system";
		}>>;
		failureReason: z81.ZodNullable<z81.ZodEnum<{
			busy: "busy";
			carrier_dropped: "carrier_dropped";
			carrier_rejected: "carrier_rejected";
			disclosure_failed: "disclosure_failed";
			no_answer: "no_answer";
			provider_error: "provider_error";
			rep_unreachable: "rep_unreachable";
			timeout: "timeout";
		}>>;
		dealId: z81.ZodNullable<z81.ZodPipe<z81.ZodPipe<z81.ZodString, z81.ZodTransform<string, string>>, z81.ZodString>>;
		note: z81.ZodNullable<z81.ZodPipe<z81.ZodString, z81.ZodString>>;
		recordingState: z81.ZodEnum<{
			deleted: "deleted";
			none: "none";
			stored: "stored";
			storing: "storing";
		}>;
		transcriptState: z81.ZodEnum<{
			deleted: "deleted";
			pending: "pending";
			ready: "ready";
		}>;
	}, z81.core.$strip>;
	warnings: z81.ZodArray<z81.ZodObject<{
		code: z81.ZodEnum<{
			"consent.missing": "consent.missing";
			"consent.suppressed": "consent.suppressed";
			"consent.unavailable": "consent.unavailable";
			"consent.withdrawn": "consent.withdrawn";
		}>;
		suppressionReason: z81.ZodNullable<z81.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>>;
	}, z81.core.$strict>>;
}, z81.core.$strict>;
/** The answer to placing a Call. */
type PlacedCall = z81.infer<typeof placedCallSchema>;
/**
* The query parameters of a request to list Calls, newest first. Filters narrow what the caller
* may see and never widen it. `from` and `to` bound `createdAt` (from inclusive, to exclusive).
*/
declare const listVoiceCallsQuerySchema: z81.ZodObject<{
	cursor: z81.ZodOptional<z81.ZodString>;
	limit: z81.ZodDefault<z81.ZodPipe<z81.ZodPipe<z81.ZodUnion<readonly [z81.ZodNumber, z81.ZodString]>, z81.ZodTransform<number, string | number>>, z81.ZodNumber>>;
	direction: z81.ZodOptional<z81.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>>;
	state: z81.ZodOptional<z81.ZodEnum<{
		connecting: "connecting";
		disclosing: "disclosing";
		ended: "ended";
		failed: "failed";
		live: "live";
		missed: "missed";
		ringing: "ringing";
	}>>;
	repMembershipId: z81.ZodOptional<z81.core.$ZodBranded<z81.ZodString, "mem", "out">>;
	lineId: z81.ZodOptional<z81.core.$ZodBranded<z81.ZodString, "line", "out">>;
	prospectId: z81.ZodOptional<z81.core.$ZodBranded<z81.ZodString, "prs", "out">>;
	from: z81.ZodOptional<z81.ZodISODateTime>;
	to: z81.ZodOptional<z81.ZodISODateTime>;
}, z81.core.$strict>;
/** The query parameters of a request to list Calls. */
type ListVoiceCallsQuery = z81.infer<typeof listVoiceCallsQuerySchema>;
/** One page of Calls. */
declare const voiceCallPageSchema: z81.ZodObject<{
	items: z81.ZodArray<z81.ZodObject<{
		id: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
		direction: z81.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		state: z81.ZodEnum<{
			connecting: "connecting";
			disclosing: "disclosing";
			ended: "ended";
			failed: "failed";
			live: "live";
			missed: "missed";
			ringing: "ringing";
		}>;
		lineId: z81.core.$ZodBranded<z81.ZodString, "line", "out">;
		repMembershipId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "mem", "out">>;
		prospectId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "prs", "out">>;
		prospectNumber: z81.ZodString;
		disclosure: z81.ZodObject<{
			wordingVersion: z81.ZodNullable<z81.ZodNumber>;
			playedAt: z81.ZodNullable<z81.ZodISODateTime>;
			aiAssisted: z81.ZodBoolean;
		}, z81.core.$strict>;
		createdAt: z81.ZodISODateTime;
		answeredAt: z81.ZodNullable<z81.ZodISODateTime>;
		endedAt: z81.ZodNullable<z81.ZodISODateTime>;
		durationSeconds: z81.ZodNullable<z81.ZodNumber>;
		endedBy: z81.ZodNullable<z81.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
			system: "system";
		}>>;
		failureReason: z81.ZodNullable<z81.ZodEnum<{
			busy: "busy";
			carrier_dropped: "carrier_dropped";
			carrier_rejected: "carrier_rejected";
			disclosure_failed: "disclosure_failed";
			no_answer: "no_answer";
			provider_error: "provider_error";
			rep_unreachable: "rep_unreachable";
			timeout: "timeout";
		}>>;
		dealId: z81.ZodNullable<z81.ZodPipe<z81.ZodPipe<z81.ZodString, z81.ZodTransform<string, string>>, z81.ZodString>>;
		note: z81.ZodNullable<z81.ZodPipe<z81.ZodString, z81.ZodString>>;
		recordingState: z81.ZodEnum<{
			deleted: "deleted";
			none: "none";
			stored: "stored";
			storing: "storing";
		}>;
		transcriptState: z81.ZodEnum<{
			deleted: "deleted";
			pending: "pending";
			ready: "ready";
		}>;
	}, z81.core.$strip>>;
	nextCursor: z81.ZodNullable<z81.ZodString>;
}, z81.core.$strip>;
/** Who spoke a turn of a Call's Transcript: the Rep (channel 1) or the Prospect. */
declare const transcriptSpeakerSchema: z81.ZodEnum<{
	prospect: "prospect";
	rep: "rep";
}>;
/** The longest text of one Transcript turn, in characters. */
declare const MAX_TRANSCRIPT_TURN_LENGTH = 4e3;
/** One turn of a Transcript: who spoke, when (milliseconds from the start of the Recording) and what. The text is the Prospect's and Rep's words: untrusted text, never logged. */
declare const transcriptTurnSchema: z81.ZodObject<{
	speaker: z81.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
	}>;
	startMs: z81.ZodNumber;
	endMs: z81.ZodNumber;
	text: z81.ZodString;
}, z81.core.$strict>;
/** One turn of a Transcript. */
type TranscriptTurn = z81.infer<typeof transcriptTurnSchema>;
/** The position a Transcript resumes from: the index of the next turn. */
declare const transcriptCursorSchema: z81.ZodObject<{
	index: z81.ZodNumber;
}, z81.core.$strict>;
/** The query parameters of a request to read a Transcript, one cursor-paginated page of turns at a time. */
declare const getTranscriptQuerySchema: z81.ZodObject<{
	cursor: z81.ZodOptional<z81.ZodString>;
	limit: z81.ZodDefault<z81.ZodPipe<z81.ZodPipe<z81.ZodUnion<readonly [z81.ZodNumber, z81.ZodString]>, z81.ZodTransform<number, string | number>>, z81.ZodNumber>>;
}, z81.core.$strict>;
/** One page of a Call's Transcript, in time order, with the state of the Transcript. Turns are empty unless `ready`. */
declare const transcriptPageSchema: z81.ZodObject<{
	items: z81.ZodArray<z81.ZodObject<{
		speaker: z81.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		startMs: z81.ZodNumber;
		endMs: z81.ZodNumber;
		text: z81.ZodString;
	}, z81.core.$strict>>;
	nextCursor: z81.ZodNullable<z81.ZodString>;
	callId: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
	state: z81.ZodEnum<{
		deleted: "deleted";
		pending: "pending";
		ready: "ready";
	}>;
}, z81.core.$strip>;
/** One page of a Call's Transcript. */
type TranscriptPage = z81.infer<typeof transcriptPageSchema>;
/** The media types a Recording is played back as. */
declare const RECORDING_MEDIA_TYPES: readonly ["audio/mpeg", "audio/wav", "audio/ogg"];
/** The longest a playback URL can be, in characters. */
declare const MAX_PLAYBACK_URL_LENGTH = 2048;
/**
* A short-lived signed URL to play a Recording, two channels (Rep and Prospect). It is a
* credential: shown to the caller, never logged or stored, and it stops working at `expiresAt`.
*/
declare const recordingPlaybackSchema: z81.ZodObject<{
	callId: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
	url: z81.ZodURL;
	expiresAt: z81.ZodISODateTime;
	mediaType: z81.ZodEnum<{
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
	}>;
	channels: z81.ZodLiteral<2>;
	durationSeconds: z81.ZodNumber;
}, z81.core.$strict>;
/** A short-lived signed URL to play a Recording. */
type RecordingPlayback = z81.infer<typeof recordingPlaybackSchema>;
/**
* The body of a request to wrap up a Call: the Deal identifier (the customer's own, as in the
* Playbook) and a note. A field left out is left alone; null clears it. At least one is sent.
*/
declare const wrapUpRequestSchema: z81.ZodObject<{
	dealId: z81.ZodOptional<z81.ZodNullable<z81.ZodPipe<z81.ZodPipe<z81.ZodString, z81.ZodTransform<string, string>>, z81.ZodString>>>;
	note: z81.ZodOptional<z81.ZodNullable<z81.ZodPipe<z81.ZodString, z81.ZodString>>>;
}, z81.core.$strict>;
/** The body of a request to wrap up a Call. */
type WrapUpRequest = z81.infer<typeof wrapUpRequestSchema>;
/** The answer to deleting a Recording: the Call, whose Recording and Transcript are now `deleted`. */
declare const deletedRecordingSchema: z81.ZodObject<{
	id: z81.core.$ZodBranded<z81.ZodString, "call", "out">;
	direction: z81.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	state: z81.ZodEnum<{
		connecting: "connecting";
		disclosing: "disclosing";
		ended: "ended";
		failed: "failed";
		live: "live";
		missed: "missed";
		ringing: "ringing";
	}>;
	lineId: z81.core.$ZodBranded<z81.ZodString, "line", "out">;
	repMembershipId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "mem", "out">>;
	prospectId: z81.ZodNullable<z81.core.$ZodBranded<z81.ZodString, "prs", "out">>;
	prospectNumber: z81.ZodString;
	disclosure: z81.ZodObject<{
		wordingVersion: z81.ZodNullable<z81.ZodNumber>;
		playedAt: z81.ZodNullable<z81.ZodISODateTime>;
		aiAssisted: z81.ZodBoolean;
	}, z81.core.$strict>;
	createdAt: z81.ZodISODateTime;
	answeredAt: z81.ZodNullable<z81.ZodISODateTime>;
	endedAt: z81.ZodNullable<z81.ZodISODateTime>;
	durationSeconds: z81.ZodNullable<z81.ZodNumber>;
	endedBy: z81.ZodNullable<z81.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
		system: "system";
	}>>;
	failureReason: z81.ZodNullable<z81.ZodEnum<{
		busy: "busy";
		carrier_dropped: "carrier_dropped";
		carrier_rejected: "carrier_rejected";
		disclosure_failed: "disclosure_failed";
		no_answer: "no_answer";
		provider_error: "provider_error";
		rep_unreachable: "rep_unreachable";
		timeout: "timeout";
	}>>;
	dealId: z81.ZodNullable<z81.ZodPipe<z81.ZodPipe<z81.ZodString, z81.ZodTransform<string, string>>, z81.ZodString>>;
	note: z81.ZodNullable<z81.ZodPipe<z81.ZodString, z81.ZodString>>;
	recordingState: z81.ZodEnum<{
		deleted: "deleted";
		none: "none";
		stored: "stored";
		storing: "storing";
	}>;
	transcriptState: z81.ZodEnum<{
		deleted: "deleted";
		pending: "pending";
		ready: "ready";
	}>;
}, z81.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh4517 } from "..";
/**
* The errors the voice routes return, as `area.reason` codes. A role that is not allowed is the
* common `auth.forbidden`. A Line or Call of another Organization, or a Call the caller may not
* see (a Rep's view of another Rep's Call, a Manager's view of a Rep outside their Team), is
* `line.not_found` or `call.not_found` (404, never 403), so existence is not revealed.
* `call.not_found` is the code the Playbook already uses for an uploaded Call (`SALES_HISTORY_ERRORS`);
* voice returns that same code and does not register a second copy.
*
* - `call.number_invalid` (422): the number to dial cannot be normalised to E.164, or is one a
*   Call cannot be placed to. A Contact Check denial is never this error: for a Rep it is a warning
*   on the placed Call (ADR 0003).
* - `call.disclosure_failed` (502): the Disclosure could not be played, so the Call never went
*   live; `details.callId` names the Call, which is `failed`. There is no code or setting that lets
*   a Call go on without the Disclosure.
* - `call.line_unavailable` (409): the Organization has no active Line the caller may place a Call
*   from, or the Line named is released or porting.
* - `call.limit_reached` (429): the Organization is at its cap of concurrent Calls.
* - `call.not_ended` (409): the action (wrap-up) needs a Call that has ended.
* - `line.number_unavailable` (409): the number asked for cannot be bought or ported.
* - `line.released` (409): the Line is released and cannot be changed.
* - `line.assignment_invalid` (422): the Team or Rep named for a Line is not in the Organization,
*   or is not a Rep.
* - `recording.not_found` (404): the Call has no Recording, or it was deleted.
* - `recording.not_ready` (409): the Recording is still being stored; try again shortly.
*/
declare const VOICE_ERRORS: {
	readonly "call.disclosure_failed": ErrorDefinition_8gwh4517<"call.disclosure_failed">;
	readonly "call.limit_reached": ErrorDefinition_8gwh4517<"call.limit_reached">;
	readonly "call.line_unavailable": ErrorDefinition_8gwh4517<"call.line_unavailable">;
	readonly "call.not_ended": ErrorDefinition_8gwh4517<"call.not_ended">;
	readonly "call.number_invalid": ErrorDefinition_8gwh4517<"call.number_invalid">;
	readonly "line.assignment_invalid": ErrorDefinition_8gwh4517<"line.assignment_invalid">;
	readonly "line.not_found": ErrorDefinition_8gwh4517<"line.not_found">;
	readonly "line.number_unavailable": ErrorDefinition_8gwh4517<"line.number_unavailable">;
	readonly "line.released": ErrorDefinition_8gwh4517<"line.released">;
	readonly "recording.not_found": ErrorDefinition_8gwh4517<"recording.not_found">;
	readonly "recording.not_ready": ErrorDefinition_8gwh4517<"recording.not_ready">;
};
/** A voice error code. */
type VoiceErrorCode = keyof typeof VOICE_ERRORS;
import { z as z82 } from "zod";
/** The longest storage key of a Recording, in characters. */
declare const MAX_RECORDING_KEY_LENGTH = 512;
/** The key of a Recording in the Region's storage: opaque, made of ids, never a number or a name. */
declare const recordingKeySchema: z82.ZodString;
/**
* `voice.call.started` (version 1): a Call began to ring. Ids, the direction and a keyed hash of the
* Prospect's number: no number in clear, no name, no Transcript text.
*/
declare const voiceCallStartedEvent: {
	type: "voice.call.started";
	version: 1;
	schema: z82.ZodObject<{
		id: z82.core.$ZodBranded<z82.ZodString, "evt", "out">;
		occurredAt: z82.ZodISODateTime;
		organizationId: z82.core.$ZodBranded<z82.ZodString, "org", "out">;
		region: z82.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z82.ZodLiteral<"voice.call.started">;
		version: z82.ZodLiteral<1>;
		data: z82.ZodObject<{
			callId: z82.core.$ZodBranded<z82.ZodString, "call", "out">;
			direction: z82.ZodEnum<{
				inbound: "inbound";
				outbound: "outbound";
			}>;
			lineId: z82.core.$ZodBranded<z82.ZodString, "line", "out">;
			repMembershipId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "mem", "out">>;
			prospectId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "prs", "out">>;
			prospectPhoneHash: z82.ZodString;
			startedAt: z82.ZodISODateTime;
		}, z82.core.$strict>;
	}, z82.core.$strip>;
	parse: (input: unknown) => {
		id: string & z82.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z82.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.started";
		version: 1;
		data: {
			callId: string & z82.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z82.$brand<"line">;
			repMembershipId: (string & z82.$brand<"mem">) | null;
			prospectId: (string & z82.$brand<"prs">) | null;
			prospectPhoneHash: string;
			startedAt: string;
		};
	};
	safeParse: (input: unknown) => z82.ZodSafeParseResult<{
		id: string & z82.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z82.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.started";
		version: 1;
		data: {
			callId: string & z82.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z82.$brand<"line">;
			repMembershipId: (string & z82.$brand<"mem">) | null;
			prospectId: (string & z82.$brand<"prs">) | null;
			prospectPhoneHash: string;
			startedAt: string;
		};
	}>;
};
/** How a Call ended, as the event says it. */
declare const VOICE_CALL_OUTCOMES: readonly ["completed", "failed", "missed"];
/** How a Call ended. */
declare const voiceCallOutcomeSchema: z82.ZodEnum<{
	completed: "completed";
	failed: "failed";
	missed: "missed";
}>;
/**
* `voice.call.ended` (version 1): a Call reached a final state. Carries the Call id, the Rep, the
* Prospect's phone hash, the direction, the times, the Recording key (null when there is none) and
* the Deal identifier when the Rep has set one. The Playbook fetches the Recording from voice by
* the Call id (ADR 0013), never by the key. No number in clear, no Transcript text.
*/
declare const voiceCallEndedEvent: {
	type: "voice.call.ended";
	version: 1;
	schema: z82.ZodObject<{
		id: z82.core.$ZodBranded<z82.ZodString, "evt", "out">;
		occurredAt: z82.ZodISODateTime;
		organizationId: z82.core.$ZodBranded<z82.ZodString, "org", "out">;
		region: z82.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z82.ZodLiteral<"voice.call.ended">;
		version: z82.ZodLiteral<1>;
		data: z82.ZodObject<{
			callId: z82.core.$ZodBranded<z82.ZodString, "call", "out">;
			direction: z82.ZodEnum<{
				inbound: "inbound";
				outbound: "outbound";
			}>;
			lineId: z82.core.$ZodBranded<z82.ZodString, "line", "out">;
			repMembershipId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "mem", "out">>;
			prospectId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "prs", "out">>;
			prospectPhoneHash: z82.ZodString;
			outcome: z82.ZodEnum<{
				completed: "completed";
				failed: "failed";
				missed: "missed";
			}>;
			failureReason: z82.ZodNullable<z82.ZodEnum<{
				busy: "busy";
				carrier_dropped: "carrier_dropped";
				carrier_rejected: "carrier_rejected";
				disclosure_failed: "disclosure_failed";
				no_answer: "no_answer";
				provider_error: "provider_error";
				rep_unreachable: "rep_unreachable";
				timeout: "timeout";
			}>>;
			startedAt: z82.ZodISODateTime;
			answeredAt: z82.ZodNullable<z82.ZodISODateTime>;
			endedAt: z82.ZodISODateTime;
			durationSeconds: z82.ZodNullable<z82.ZodNumber>;
			disclosureWordingVersion: z82.ZodNullable<z82.ZodNumber>;
			recordingKey: z82.ZodNullable<z82.ZodString>;
			dealId: z82.ZodNullable<z82.ZodPipe<z82.ZodPipe<z82.ZodString, z82.ZodTransform<string, string>>, z82.ZodString>>;
		}, z82.core.$strict>;
	}, z82.core.$strip>;
	parse: (input: unknown) => {
		id: string & z82.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z82.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.ended";
		version: 1;
		data: {
			callId: string & z82.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z82.$brand<"line">;
			repMembershipId: (string & z82.$brand<"mem">) | null;
			prospectId: (string & z82.$brand<"prs">) | null;
			prospectPhoneHash: string;
			outcome: "completed" | "failed" | "missed";
			failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
			startedAt: string;
			answeredAt: string | null;
			endedAt: string;
			durationSeconds: number | null;
			disclosureWordingVersion: number | null;
			recordingKey: string | null;
			dealId: string | null;
		};
	};
	safeParse: (input: unknown) => z82.ZodSafeParseResult<{
		id: string & z82.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z82.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.ended";
		version: 1;
		data: {
			callId: string & z82.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z82.$brand<"line">;
			repMembershipId: (string & z82.$brand<"mem">) | null;
			prospectId: (string & z82.$brand<"prs">) | null;
			prospectPhoneHash: string;
			outcome: "completed" | "failed" | "missed";
			failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
			startedAt: string;
			answeredAt: string | null;
			endedAt: string;
			durationSeconds: number | null;
			disclosureWordingVersion: number | null;
			recordingKey: string | null;
			dealId: string | null;
		};
	}>;
};
/** Every voice event, by type. */
declare const VOICE_EVENTS: {
	readonly "voice.call.started": {
		type: "voice.call.started";
		version: 1;
		schema: z82.ZodObject<{
			id: z82.core.$ZodBranded<z82.ZodString, "evt", "out">;
			occurredAt: z82.ZodISODateTime;
			organizationId: z82.core.$ZodBranded<z82.ZodString, "org", "out">;
			region: z82.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z82.ZodLiteral<"voice.call.started">;
			version: z82.ZodLiteral<1>;
			data: z82.ZodObject<{
				callId: z82.core.$ZodBranded<z82.ZodString, "call", "out">;
				direction: z82.ZodEnum<{
					inbound: "inbound";
					outbound: "outbound";
				}>;
				lineId: z82.core.$ZodBranded<z82.ZodString, "line", "out">;
				repMembershipId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "mem", "out">>;
				prospectId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "prs", "out">>;
				prospectPhoneHash: z82.ZodString;
				startedAt: z82.ZodISODateTime;
			}, z82.core.$strict>;
		}, z82.core.$strip>;
		parse: (input: unknown) => {
			id: string & z82.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z82.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.started";
			version: 1;
			data: {
				callId: string & z82.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z82.$brand<"line">;
				repMembershipId: (string & z82.$brand<"mem">) | null;
				prospectId: (string & z82.$brand<"prs">) | null;
				prospectPhoneHash: string;
				startedAt: string;
			};
		};
		safeParse: (input: unknown) => z82.ZodSafeParseResult<{
			id: string & z82.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z82.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.started";
			version: 1;
			data: {
				callId: string & z82.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z82.$brand<"line">;
				repMembershipId: (string & z82.$brand<"mem">) | null;
				prospectId: (string & z82.$brand<"prs">) | null;
				prospectPhoneHash: string;
				startedAt: string;
			};
		}>;
	};
	readonly "voice.call.ended": {
		type: "voice.call.ended";
		version: 1;
		schema: z82.ZodObject<{
			id: z82.core.$ZodBranded<z82.ZodString, "evt", "out">;
			occurredAt: z82.ZodISODateTime;
			organizationId: z82.core.$ZodBranded<z82.ZodString, "org", "out">;
			region: z82.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z82.ZodLiteral<"voice.call.ended">;
			version: z82.ZodLiteral<1>;
			data: z82.ZodObject<{
				callId: z82.core.$ZodBranded<z82.ZodString, "call", "out">;
				direction: z82.ZodEnum<{
					inbound: "inbound";
					outbound: "outbound";
				}>;
				lineId: z82.core.$ZodBranded<z82.ZodString, "line", "out">;
				repMembershipId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "mem", "out">>;
				prospectId: z82.ZodNullable<z82.core.$ZodBranded<z82.ZodString, "prs", "out">>;
				prospectPhoneHash: z82.ZodString;
				outcome: z82.ZodEnum<{
					completed: "completed";
					failed: "failed";
					missed: "missed";
				}>;
				failureReason: z82.ZodNullable<z82.ZodEnum<{
					busy: "busy";
					carrier_dropped: "carrier_dropped";
					carrier_rejected: "carrier_rejected";
					disclosure_failed: "disclosure_failed";
					no_answer: "no_answer";
					provider_error: "provider_error";
					rep_unreachable: "rep_unreachable";
					timeout: "timeout";
				}>>;
				startedAt: z82.ZodISODateTime;
				answeredAt: z82.ZodNullable<z82.ZodISODateTime>;
				endedAt: z82.ZodISODateTime;
				durationSeconds: z82.ZodNullable<z82.ZodNumber>;
				disclosureWordingVersion: z82.ZodNullable<z82.ZodNumber>;
				recordingKey: z82.ZodNullable<z82.ZodString>;
				dealId: z82.ZodNullable<z82.ZodPipe<z82.ZodPipe<z82.ZodString, z82.ZodTransform<string, string>>, z82.ZodString>>;
			}, z82.core.$strict>;
		}, z82.core.$strip>;
		parse: (input: unknown) => {
			id: string & z82.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z82.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.ended";
			version: 1;
			data: {
				callId: string & z82.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z82.$brand<"line">;
				repMembershipId: (string & z82.$brand<"mem">) | null;
				prospectId: (string & z82.$brand<"prs">) | null;
				prospectPhoneHash: string;
				outcome: "completed" | "failed" | "missed";
				failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
				startedAt: string;
				answeredAt: string | null;
				endedAt: string;
				durationSeconds: number | null;
				disclosureWordingVersion: number | null;
				recordingKey: string | null;
				dealId: string | null;
			};
		};
		safeParse: (input: unknown) => z82.ZodSafeParseResult<{
			id: string & z82.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z82.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.ended";
			version: 1;
			data: {
				callId: string & z82.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z82.$brand<"line">;
				repMembershipId: (string & z82.$brand<"mem">) | null;
				prospectId: (string & z82.$brand<"prs">) | null;
				prospectPhoneHash: string;
				outcome: "completed" | "failed" | "missed";
				failureReason: "busy" | "carrier_dropped" | "carrier_rejected" | "disclosure_failed" | "no_answer" | "provider_error" | "rep_unreachable" | "timeout" | null;
				startedAt: string;
				answeredAt: string | null;
				endedAt: string;
				durationSeconds: number | null;
				disclosureWordingVersion: number | null;
				recordingKey: string | null;
				dealId: string | null;
			};
		}>;
	};
};
/** The type of a voice event. */
type VoiceEventType = keyof typeof VOICE_EVENTS;
import { z as z83 } from "zod";
/** The states of a Line: `porting` while a number moves to Closeline, `active` when Calls can use it, `released` once given up. */
declare const LINE_STATES: readonly ["porting", "active", "released"];
/** The state of a Line. */
declare const lineStateSchema: z83.ZodEnum<{
	active: "active";
	porting: "porting";
	released: "released";
}>;
/** The state of a Line. */
type LineState = z83.infer<typeof lineStateSchema>;
/** Who inbound Calls on a Line ring: nobody yet, a Team's Reps, or one Rep. */
declare const lineAssignmentSchema: z83.ZodDiscriminatedUnion<[z83.ZodObject<{
	kind: z83.ZodLiteral<"unassigned">;
}, z83.core.$strict>, z83.ZodObject<{
	kind: z83.ZodLiteral<"team">;
	teamId: z83.core.$ZodBranded<z83.ZodString, "team", "out">;
}, z83.core.$strict>, z83.ZodObject<{
	kind: z83.ZodLiteral<"rep">;
	membershipId: z83.core.$ZodBranded<z83.ZodString, "mem", "out">;
}, z83.core.$strict>], "kind">;
/** Who inbound Calls on a Line ring. */
type LineAssignment = z83.infer<typeof lineAssignmentSchema>;
/** A Line: a phone number the Organization uses to place and receive Calls. */
declare const lineSchema: z83.ZodObject<{
	id: z83.core.$ZodBranded<z83.ZodString, "line", "out">;
	number: z83.ZodString;
	country: z83.ZodString;
	label: z83.ZodNullable<z83.ZodPipe<z83.ZodString, z83.ZodString>>;
	state: z83.ZodEnum<{
		active: "active";
		porting: "porting";
		released: "released";
	}>;
	assignment: z83.ZodDiscriminatedUnion<[z83.ZodObject<{
		kind: z83.ZodLiteral<"unassigned">;
	}, z83.core.$strict>, z83.ZodObject<{
		kind: z83.ZodLiteral<"team">;
		teamId: z83.core.$ZodBranded<z83.ZodString, "team", "out">;
	}, z83.core.$strict>, z83.ZodObject<{
		kind: z83.ZodLiteral<"rep">;
		membershipId: z83.core.$ZodBranded<z83.ZodString, "mem", "out">;
	}, z83.core.$strict>], "kind">;
	createdAt: z83.ZodISODateTime;
	releasedAt: z83.ZodNullable<z83.ZodISODateTime>;
}, z83.core.$strip>;
/** A Line. */
type Line = z83.infer<typeof lineSchema>;
/** The path parameters of a request about one Line. */
declare const lineParamsSchema: z83.ZodObject<{
	lineId: z83.core.$ZodBranded<z83.ZodString, "line", "out">;
}, z83.core.$strict>;
/** The position a Line list resumes from: newest first, by creation time then id. */
declare const lineCursorSchema: z83.ZodObject<{
	createdAt: z83.ZodISODateTime;
	id: z83.core.$ZodBranded<z83.ZodString, "line", "out">;
}, z83.core.$strict>;
/** The query parameters of a request to list Lines, newest first, optionally of one state. */
declare const listLinesQuerySchema: z83.ZodObject<{
	cursor: z83.ZodOptional<z83.ZodString>;
	limit: z83.ZodDefault<z83.ZodPipe<z83.ZodPipe<z83.ZodUnion<readonly [z83.ZodNumber, z83.ZodString]>, z83.ZodTransform<number, string | number>>, z83.ZodNumber>>;
	state: z83.ZodOptional<z83.ZodEnum<{
		active: "active";
		porting: "porting";
		released: "released";
	}>>;
}, z83.core.$strict>;
/** The query parameters of a request to list Lines. */
type ListLinesQuery = z83.infer<typeof listLinesQuerySchema>;
/** One page of Lines. */
declare const linePageSchema: z83.ZodObject<{
	items: z83.ZodArray<z83.ZodObject<{
		id: z83.core.$ZodBranded<z83.ZodString, "line", "out">;
		number: z83.ZodString;
		country: z83.ZodString;
		label: z83.ZodNullable<z83.ZodPipe<z83.ZodString, z83.ZodString>>;
		state: z83.ZodEnum<{
			active: "active";
			porting: "porting";
			released: "released";
		}>;
		assignment: z83.ZodDiscriminatedUnion<[z83.ZodObject<{
			kind: z83.ZodLiteral<"unassigned">;
		}, z83.core.$strict>, z83.ZodObject<{
			kind: z83.ZodLiteral<"team">;
			teamId: z83.core.$ZodBranded<z83.ZodString, "team", "out">;
		}, z83.core.$strict>, z83.ZodObject<{
			kind: z83.ZodLiteral<"rep">;
			membershipId: z83.core.$ZodBranded<z83.ZodString, "mem", "out">;
		}, z83.core.$strict>], "kind">;
		createdAt: z83.ZodISODateTime;
		releasedAt: z83.ZodNullable<z83.ZodISODateTime>;
	}, z83.core.$strip>>;
	nextCursor: z83.ZodNullable<z83.ZodString>;
}, z83.core.$strip>;
/**
* The body of a request to add a Line: buy a new number (optionally with an area code) or port
* one the Organization already owns. The route accepts an `Idempotency-Key` header so a retry buys
* one number.
*/
declare const addLineRequestSchema: z83.ZodDiscriminatedUnion<[z83.ZodObject<{
	method: z83.ZodLiteral<"buy">;
	country: z83.ZodString;
	areaCode: z83.ZodOptional<z83.ZodString>;
	label: z83.ZodOptional<z83.ZodPipe<z83.ZodString, z83.ZodString>>;
}, z83.core.$strict>, z83.ZodObject<{
	method: z83.ZodLiteral<"port">;
	number: z83.ZodPipe<z83.ZodString, z83.ZodString>;
	label: z83.ZodOptional<z83.ZodPipe<z83.ZodString, z83.ZodString>>;
}, z83.core.$strict>], "method">;
/** The body of a request to add a Line. */
type AddLineRequest = z83.infer<typeof addLineRequestSchema>;
/** The body of a request to assign a Line: to a Team, to a Rep, or to nobody. */
declare const assignLineRequestSchema: z83.ZodDiscriminatedUnion<[z83.ZodObject<{
	kind: z83.ZodLiteral<"unassigned">;
}, z83.core.$strict>, z83.ZodObject<{
	kind: z83.ZodLiteral<"team">;
	teamId: z83.core.$ZodBranded<z83.ZodString, "team", "out">;
}, z83.core.$strict>, z83.ZodObject<{
	kind: z83.ZodLiteral<"rep">;
	membershipId: z83.core.$ZodBranded<z83.ZodString, "mem", "out">;
}, z83.core.$strict>], "kind">;
/** The body of a request to assign a Line. */
type AssignLineRequest = z83.infer<typeof assignLineRequestSchema>;
/** The roles that may use the Softphone and read the Lines and Calls they can see. */
declare const VOICE_ALL_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The roles that manage Lines and delete Recordings. */
declare const VOICE_ADMIN_ROLES: readonly ["owner", "admin"];
/** The voice routes, by name. */
type VoiceRouteName = "listLines" | "addLine" | "getLine" | "assignLine" | "releaseLine" | "placeCall" | "listCalls" | "getCall" | "getCallTranscript" | "getCallRecording" | "deleteCallRecording" | "wrapUpCall" | "mintSoftphoneToken";
/** What the service needs to describe one route: method, path, who may call it, what it answers. */
type VoiceRoute = {
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly path: string;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** True when a retry of the route is safe by the `Idempotency-Key` header. */
	readonly idempotent: boolean;
	/** True when the `Idempotency-Key` header is required, not just accepted; see `placeCallHeadersSchema`. */
	readonly keyRequired?: true;
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly (VoiceErrorCode | Extract<SalesHistoryErrorCode, "call.not_found"> | ProspectErrorCode)[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The voice routes (spec M12). Every route may also return the common `auth.*`, `rate.limited`
* and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record of
* another Organization is always not found. The Provider's webhooks are internal routes of the
* voice service and are not part of this contract. No route or body can switch off the Disclosure
* or the Recording, and none checks Contact Consent for a Rep: a Rep may call any Prospect, with a
* warning from the Contact Check (ADR 0003).
*/
declare const VOICE_ROUTES: Readonly<Record<VoiceRouteName, VoiceRoute>>;
import { z as z84 } from "zod";
/** The shortest a Softphone token lives, in seconds. */
declare const MIN_SOFTPHONE_TOKEN_TTL_SECONDS = 60;
/** The longest a Softphone token lives, in seconds: one hour. */
declare const MAX_SOFTPHONE_TOKEN_TTL_SECONDS = 3600;
/** The longest Softphone token, in characters. */
declare const MAX_SOFTPHONE_TOKEN_LENGTH = 4096;
/**
* A short-lived token the browser uses to register the Softphone with the telephony provider. It
* is a credential for one Rep: shown once to the caller, never logged or stored, and it stops
* working at `expiresAt`. The Rep takes Calls only while one is held.
*/
declare const softphoneTokenSchema: z84.ZodObject<{
	token: z84.ZodString;
	identity: z84.core.$ZodBranded<z84.ZodString, "mem", "out">;
	ttlSeconds: z84.ZodNumber;
	expiresAt: z84.ZodISODateTime;
}, z84.core.$strict>;
/** A short-lived Softphone token. */
type SoftphoneToken = z84.infer<typeof softphoneTokenSchema>;
import { z as z85 } from "zod";
/** The directions of a Call. */
declare const VOICE_CALL_DIRECTIONS: readonly ["inbound", "outbound"];
/** The direction of a Call: `outbound` is placed by a Rep to a Prospect, `inbound` rings on a Line. */
declare const voiceCallDirectionSchema: z85.ZodEnum<{
	inbound: "inbound";
	outbound: "outbound";
}>;
/** The direction of a Call. */
type VoiceCallDirection = z85.infer<typeof voiceCallDirectionSchema>;
/**
* The states of a Call. It moves `ringing`, `connecting`, `disclosing`, `live`, `ended`, or ends
* `failed` or `missed`. `live` is reached only after the Disclosure has played: a Call in `live` or
* `ended` always carries the time and wording version of its Disclosure.
*/
declare const VOICE_CALL_STATES: readonly ["ringing", "connecting", "disclosing", "live", "ended", "failed", "missed"];
/** The state of a Call. */
declare const voiceCallStateSchema: z85.ZodEnum<{
	connecting: "connecting";
	disclosing: "disclosing";
	ended: "ended";
	failed: "failed";
	live: "live";
	missed: "missed";
	ringing: "ringing";
}>;
/** The state of a Call. */
type VoiceCallState = z85.infer<typeof voiceCallStateSchema>;
/** The states a Call can no longer leave. */
declare const VOICE_CALL_FINAL_STATES: readonly ["ended", "failed", "missed"];
/** Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text. */
declare const VOICE_CALL_FAILURE_REASONS: readonly ["disclosure_failed", "carrier_dropped", "carrier_rejected", "busy", "no_answer", "rep_unreachable", "provider_error", "timeout"];
/** Why a Call ended in `failed`. */
declare const voiceCallFailureReasonSchema: z85.ZodEnum<{
	busy: "busy";
	carrier_dropped: "carrier_dropped";
	carrier_rejected: "carrier_rejected";
	disclosure_failed: "disclosure_failed";
	no_answer: "no_answer";
	provider_error: "provider_error";
	rep_unreachable: "rep_unreachable";
	timeout: "timeout";
}>;
/** Why a Call ended in `failed`. */
type VoiceCallFailureReason = z85.infer<typeof voiceCallFailureReasonSchema>;
/** Who ended a Call that ended: the Rep, the Prospect, or the system (a time limit). */
declare const VOICE_CALL_ENDED_BY: readonly ["rep", "prospect", "system"];
/** Who ended a Call. */
declare const voiceCallEndedBySchema: z85.ZodEnum<{
	prospect: "prospect";
	rep: "rep";
	system: "system";
}>;
/** The state of a Call's Recording. `none` until the Disclosure has played; `storing` while it is copied to the Region's storage; `stored` once playable; `deleted` after an Admin deleted it. */
declare const VOICE_RECORDING_STATES: readonly ["none", "storing", "stored", "deleted"];
/** The state of a Call's Recording. */
declare const voiceRecordingStateSchema: z85.ZodEnum<{
	deleted: "deleted";
	none: "none";
	stored: "stored";
	storing: "storing";
}>;
/** The state of a Call's Recording. */
type VoiceRecordingState = z85.infer<typeof voiceRecordingStateSchema>;
/** The state of a Call's Transcript: `pending` until it is made, `ready` once readable, `deleted` after the Recording and Transcript were deleted. */
declare const VOICE_TRANSCRIPT_STATES: readonly ["pending", "ready", "deleted"];
/** The state of a Call's Transcript. */
declare const voiceTranscriptStateSchema: z85.ZodEnum<{
	deleted: "deleted";
	pending: "pending";
	ready: "ready";
}>;
/** The state of a Call's Transcript. */
type VoiceTranscriptState = z85.infer<typeof voiceTranscriptStateSchema>;
/** The most characters of a wrap-up note. */
declare const MAX_WRAP_UP_NOTE_LENGTH = 2e3;
/** A wrap-up note: bounded text with no control character; untrusted text for display. */
declare const wrapUpNoteSchema: z85.ZodPipe<z85.ZodString, z85.ZodString>;
/** The longest label of a Line. */
declare const MAX_LINE_LABEL_LENGTH = 100;
/** A label an Admin gives a Line: bounded text with no control character. */
declare const lineLabelSchema: z85.ZodPipe<z85.ZodString, z85.ZodString>;
/** A two-letter ISO 3166-1 country code in upper case, such as `US` or `IE`. */
declare const countryCodeSchema: z85.ZodString;
/**
* A keyed SHA-256 of a Prospect's E.164 number, as lower-case hex (64 characters). The key is the
* Organization's, so a number cannot be recovered by hashing a list of guesses. Events carry this
* and never the number.
*/
declare const phoneHashSchema: z85.ZodString;
/** This library's package name, so a consumer can report which shared libraries it resolved. */
declare const PACKAGE = "tula-closeline-contract";
export { ABANDON_MAX_AGE_HOURS, ACCEPTED_DOCUMENT_EXTENSIONS, ACCEPTED_DOCUMENT_MEDIA_TYPES, ACCEPTED_RECORDING_EXTENSIONS, ACCEPTED_TRANSCRIPT_EXTENSIONS, AGENT_ADMIN_ROLES, AGENT_ALL_ROLES, AGENT_CALLING_WINDOW, AGENT_CALL_OUTCOMES, AGENT_ERRORS, AGENT_EVENTS, AGENT_LANGUAGES, AGENT_READ_ROLES, AGENT_ROUTES, AGENT_TOOLS, AGENT_VOICE_STYLES, ALL_PLAYBOOK_ERRORS, ALL_PLAYBOOK_ROUTES, ALWAYS_HELD_REASONS, APPROVAL_MODES, AUDIENCE_CHECK_STATES, AUTH_ERRORS, AUTH_OPTIONS_PATH, AUTH_OPTIONS_ROUTE, AcceptPlayRequest, AcceptedCallExtension, AcceptedDocumentExtension, AddLineRequest, AddSuppressionRequest, AddTeamMemberRequest, AgentErrorCode, AgentEventType, AgentRoute, AgentRouteName, AgentSettings, AgentToolName, AgentTurn, AgentVoiceStyle, AllPlaybookRouteName, AllowedOrigin, ApprovalPolicy, ApprovalQueueItem, ApprovalRule, ApproveDraftRequest, AssignLineRequest, Audience, AudienceCheck, AudienceCheckState, AudienceCounts, AuthErrorCode, AuthOptionsResponse, AuthProviders, AuthRoute, Availability, BOOKING_ADMIN_ROLES, BOOKING_ALL_ROLES, BOOKING_CANCELLED_BY, BOOKING_ERRORS, BOOKING_EVENTS, BOOKING_MODES, BOOKING_ORIGINS, BOOKING_ROUTES, BOOKING_STATES, BOOKING_TYPE_STATES, BULK_ASSIGN_SYNC_LIMIT, BookRequest, Booking, BookingErrorCode, BookingEventType, BookingId, BookingMode, BookingOrigin, BookingRoute, BookingRouteName, BookingState, BookingType, BookingTypeId, BookingTypeState, BranchCondition, BrowserSessionTokens, BulkAssignProspectsRequest, BulkAssignProspectsResponse, CALENDAR_CONNECTION_STATES, CALENDAR_PROVIDERS, CALL_CHANNELS, CALL_DELETED_MESSAGE, CALL_FAILURE_FIXES, CALL_FAILURE_REASONS, CALL_KINDS, CALL_MEDIA_TYPES, CALL_REP_CHANGED_MESSAGE, CALL_STATES, CALL_TRANSCRIBED_MESSAGE, CALL_UPLOADED_MESSAGE, CAMPAIGN_ADMIN_ROLES, CAMPAIGN_ALL_ROLES, CAMPAIGN_APPROVAL_MODES, CAMPAIGN_ERRORS, CAMPAIGN_EVENTS, CAMPAIGN_LANGUAGES, CAMPAIGN_ROUTES, CAMPAIGN_STATES, CHAT_ALL_ROLES, CHAT_ERRORS, CHAT_ROUTES, CHAT_STATES, COMPANY_SIZE_BANDS, CONSENT_ADMIN_ROLES, CONSENT_ALL_ROLES, CONSENT_CHANNELS, CONSENT_ERRORS, CONSENT_EVENTS, CONSENT_FORM_STATES, CONSENT_GRANT_SOURCES, CONSENT_RECORDABLE_SOURCES, CONSENT_REQUIRED_CHANNELS, CONSENT_REVOKE_TRIGGERS, CONSENT_ROUTES, CONSENT_STATES, CONSENT_WITHDRAWAL_SOURCES, CONTACT_ALLOW_BASES, CONTACT_DENIAL_CODES, CONTACT_PURPOSES, CONVERSATION_CONTROLLERS, CONVERSATION_STATES, COPILOT_CARD_KINDS, COPILOT_COMPOSED_KINDS, COPILOT_ERRORS, COPILOT_EVENTS, COPILOT_OBJECTION_TYPES, COPILOT_QUIET_REASONS, COPILOT_RATINGS, COPILOT_ROUTES, COPILOT_STREAM_EVENTS, COPILOT_STREAM_STATES, COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS, CORE_ERRORS, CREATE_DEMO_REQUEST_ERROR_CODES, CREATE_INVITATION_ERROR_CODES, CSV_FAILURES, CURRENT_RIGHTS_WORDING_VERSION, CalendarConnection, CalendarConnectionState, CalendarProvider, Call, CallCursor, CallDeletedPayload, CallDisclosure, CallFailureFix, CallFailureReason, CallId, CallKind, CallMediaType, CallParams, CallRepChangedPayload, CallState, CallTranscribedPayload, CallUploadedPayload, Campaign, CampaignApprovalMode, CampaignCursor, CampaignErrorCode, CampaignEventType, CampaignId, CampaignLanguage, CampaignRoute, CampaignRouteName, CampaignState, CampaignStats, CellResult, ChangeMemberRoleRequest, Chat, ChatErrorCode, ChatId, ChatMessage, ChatRoute, ChatRouteName, CheckCallFileResult, CheckDealImportHeaderResult, CheckDealImportHeaderTextResult, CheckDealImportRowResult, CheckUploadFileResult, Classification, CommonErrorCode, CompanySizeBand, CompleteCalendarConnectionRequest, CompleteMailboxConnectRequest, ConfirmRightsRequest, ConsentChannel, ConsentErrorCode, ConsentEvent, ConsentEventId, ConsentEventType, ConsentForm, ConsentFormId, ConsentFormState, ConsentGrantSource, ConsentRoute, ConsentRouteAccess, ConsentRouteName, ConsentSource, ConsentState, ConsentWithdrawalSource, ConsentWording, ConsentWordingId, ContactCheckId, ContactCheckLogEntry, ContactCheckRequest, ContactCheckResult, ContactDenialCode, ContactPurpose, ContactWarning, Conversation, ConversationController, ConversationId, ConversationState, CopilotCard, CopilotCardId, CopilotCardKind, CopilotDocumentSource, CopilotErrorCode, CopilotEventType, CopilotEvidence, CopilotMomentRef, CopilotObjectionType, CopilotQuote, CopilotRating, CopilotRoute, CopilotRouteName, CopilotSettings, CopilotStreamEventName, CopilotStreamMessage, CoreErrorCode, CreateBookingTypeRequest, CreateCampaignRequest, CreateConsentFormRequest, CreateConsentWordingRequest, CreateDemoRequestRequest, CreateDemoRequestResponse, CreateInvitationRequest, CreateProspectCompanyRequest, CreateProspectRequest, CreateQualificationQuestionRequest, CreateRoutingRuleRequest, CreateTeamRequest, CsvFailure, CsvOptions, CsvResult, DAILY_LIMIT_DETAILS_SCHEMA, DEAL_CLOSED_AT_MAX_YEAR, DEAL_CLOSED_AT_MIN_YEAR, DEAL_IMPORT_FAILURE_REASONS, DEAL_IMPORT_FILE_FIELD, DEAL_IMPORT_HEADER_PREFIX_CHARS, DEAL_IMPORT_HEADER_PROBLEMS, DEAL_IMPORT_OPTIONAL_COLUMN, DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_ROW_REASONS, DEAL_IMPORT_ROW_RESULTS, DEAL_IMPORT_STATES, DEAL_IMPORT_UPLOADED_MESSAGE, DEAL_OUTCOME_CHANGED_MESSAGE, DECISION_KINDS, DEFAULT_AGENT_CALL_SECONDS, DEFAULT_COPILOT_MIN_DEALS, DEFAULT_COPILOT_MIN_MOMENTS, DEFAULT_MAX_CALLS, DEFAULT_MAX_DEALS, DEFAULT_MAX_DOCUMENTS, DEFAULT_MAX_DOCUMENT_BYTES_TOTAL, DEFAULT_MAX_RECORDING_BYTES_TOTAL, DEFAULT_PAGE_SIZE, DEFAULT_SEARCH_LIMIT, DELIVERY_FAILURE_REASONS, DOCUMENT_DELETED_MESSAGE, DOCUMENT_FAILURE_REASONS, DOCUMENT_RETENTION_DAYS, DOCUMENT_STATES, DOCUMENT_UPLOADED_MESSAGE, DOMAIN_CHECK_RECORDS, DOMAIN_CHECK_STATUSES, DRAFT_AUTHORS, DRAFT_HOLD_REASONS, DRAFT_SOURCE_KINDS, DRAFT_STATUSES, Deal, DealCursor, DealId, DealImport, DealImportCursor, DealImportFailureReason, DealImportHeaderProblem, DealImportId, DealImportParams, DealImportRow, DealImportRowCursor, DealImportRowReason, DealImportRowResult, DealImportState, DealImportUploadedPayload, DealOutcomeChangedPayload, DealParams, DealRecordId, Decision, DecisionId, DecisionKind, DemoRequestId, DocumentDeletedPayload, DocumentFailureReason, DocumentFileName, DocumentId, DocumentMatch, DocumentMediaType, DocumentParams, DocumentSearchEvidence, DocumentState, DocumentUploadedPayload, DomainCheck, DomainCheckRecord, DomainCheckResult, DomainCheckStatus, Draft, DraftAuthor, DraftHoldReason, DraftId, DraftReason, DraftRelease, DraftSourceKind, DraftStatus, DuplicateIdentityDetails, ENROLLMENT_EVENT_KINDS, ENROLLMENT_STATES, ENROLLMENT_STOP_REASONS, ENROLL_REFUSALS, ENROLL_REFUSAL_CODES, ERRORS, EVIDENCE_CSV_COLUMNS, EffectiveLimits, Email, EnrollProspectsRequest, EnrollRefusal, EnrollResult, Enrollment, EnrollmentEvent, EnrollmentEventId, EnrollmentId, EnrollmentState, EnrollmentStopReason, EraseProspectResponse, ErrorBody, ErrorDefinition, ErrorInput, EventId, EventType, EvidenceEvent, FIELD_HISTORY_STATES, FIXED_SOURCE_KINDS, FieldHistoryCursor, FieldHistoryEntry, FieldValue, FirstCsvRecordResult, GOOGLE_ERROR_PARAM, GOOGLE_ERROR_PATH, GOOGLE_ROUTES, GOOGLE_SIGN_UP_ATTEMPT_PARAM, GOOGLE_SIGN_UP_PATH, GoogleCompleteRequest, GoogleCompleteResponse, GoogleIntent, GoogleStartRequest, GoogleStartResponse, HANDOFF_CHANNELS, HANDOFF_REASONS, HANDOFF_RESULTS, HANDOFF_STATES, HEALTH_COMPONENTS, HEALTH_CRITICAL_SCORE, HEALTH_MINIMUM_SAMPLE, HEALTH_WARNING_SCORE, HEALTH_WINDOW_DAYS, Handoff, HandoffContext, HandoffId, HealthComponent, HealthComponentKind, HealthComponentState, HealthDaily, HealthSummary, HoldFacts, HostedConsentFormView, HostedConsentReceipt, HostedConsentSubmission, IDEMPOTENCY_KEY_HEADER, INBOX_ADMIN_ROLES, INBOX_ALL_ROLES, INBOX_CHANNELS, INBOX_ERRORS, INBOX_EVENTS, INBOX_REVIEW_ROLES, INBOX_ROUTES, INCOMPLETE_UPLOAD_PARTS_TTL_HOURS, INQUIRY_ADMIN_ROLES, INQUIRY_ALL_ROLES, INQUIRY_CALLBACK_STATES, INQUIRY_ERRORS, INQUIRY_EVENTS, INQUIRY_MANAGER_ROLES, INQUIRY_ROUTES, INQUIRY_SKIP_REASONS, INQUIRY_SOURCES, INTERNAL_CALL_ERRORS, INVITABLE_ROLES, INVITATION_STATES, Id, IdempotencyKey, InboxChannel, InboxErrorCode, InboxEventType, InboxRoute, InboxRouteName, IngestMessageRequest, Inquiry, InquiryCallback, InquiryCallbackState, InquiryEmbed, InquiryErrorCode, InquiryEventType, InquiryId, InquiryRoute, InquiryRouteName, InquirySkipReason, InquirySource, InternalAbandonOrganizationParams, InternalAbandonOrganizationRequest, InternalAbandonOrganizationResponse, InternalAcceptInvitationRequest, InternalAcceptInvitationResponse, InternalCallName, InternalCreateOrganizationRequest, InternalCreateOrganizationResponse, InternalMembershipRequest, InternalMembershipResponse, InternalRemoveOrganizationDocumentsParams, InternalRemoveOrganizationDocumentsRequest, InternalRemoveOrganizationDocumentsResponse, InternalUpdateMemberProfileParams, InternalUpdateMemberProfileRequest, InternalUpdateMemberProfileResponse, InvalidSequenceDetails, InvitableRole, Invitation, InvitationId, InvitationParams, InvitationState, LAUNCH_CHECKS, LAUNCH_CHECK_RESULTS, LINE_STATES, LIST_MEMBERS_MIN_ROLE, LIST_TEAM_MEMBERS_ERROR_CODES, LIST_TEAM_MEMBERS_MIN_ROLE, LaunchCheck, LaunchCheckName, LaunchCheckResult, LimitDetails, Line, LineAssignment, LineId, LineState, ListBookingsQuery, ListCallsQuery, ListCallsResponse, ListCampaignsQuery, ListConsentEventsQuery, ListContactChecksQuery, ListConversationsQuery, ListCopilotCardsQuery, ListDealImportRowsQuery, ListDealImportRowsResponse, ListDealImportsQuery, ListDealImportsResponse, ListDealsQuery, ListDealsResponse, ListDocumentsQuery, ListDocumentsResponse, ListEnrollmentsQuery, ListFieldHistoryQuery, ListFieldHistoryResponse, ListInquiriesQuery, ListInvitationsQuery, ListInvitationsResponse, ListLinesQuery, ListMailEventsQuery, ListMailboxesQuery, ListMembersQuery, ListMembersResponse, ListPlaysQuery, ListProspectCompaniesQuery, ListProspectCompaniesResponse, ListProspectDuplicatesQuery, ListProspectDuplicatesResponse, ListProspectImportRowsQuery, ListProspectImportRowsResponse, ListProspectImportsQuery, ListProspectImportsResponse, ListProspectsQuery, ListProspectsResponse, ListSendsQuery, ListSlotsQuery, ListSuppressionEntriesQuery, ListTeamMembersQuery, ListTeamMembersResponse, ListTeamsQuery, ListTeamsResponse, ListVoiceCallsQuery, LookupDealRequest, MAILBOX_KINDS, MAILBOX_PROVIDERS, MAILBOX_RAMP_STEPS, MAILBOX_STATES, MAILBOX_STATE_REASONS, MAIL_ADMIN_ROLES, MAIL_ALL_ROLES, MAIL_ERRORS, MAIL_EVENTS, MAIL_EVENT_KINDS, MAIL_REVIEW_ROLES, MAIL_ROUTES, MARKETING_ERRORS, MARKETING_ROUTES, MAX_AGENT_CALL_COST_USD_CENTS, MAX_AGENT_CALL_SECONDS, MAX_AGENT_CONCURRENCY, MAX_AGENT_GREETING_LENGTH, MAX_ALLOWED_ORIGINS, MAX_ANSWER_LENGTH, MAX_ATTEMPT_EPOCH, MAX_AUDIENCE_PROSPECTS, MAX_AUTHORIZATION_URL_LENGTH, MAX_AWAY_DAYS, MAX_BOOKING_BUFFER_MINUTES, MAX_BOOKING_LENGTH_MINUTES, MAX_BOOKING_NAME_LENGTH, MAX_BOOKING_NOTICE_MINUTES, MAX_BRANCH_ARMS, MAX_BULK_ASSIGN_PROSPECTS, MAX_CALLBACK_ATTEMPTS, MAX_CALL_DURATION_SECONDS, MAX_CALL_SPEAKERS, MAX_CAMPAIGN_DAILY_CAP, MAX_CAMPAIGN_NAME_LENGTH, MAX_CONDITION_VALUES, MAX_CONSENT_FORM_NAME_LENGTH, MAX_CONSENT_WORDING_LENGTH, MAX_COPILOT_CARDS_PER_CALL, MAX_COPILOT_CARD_TEXT_LENGTH, MAX_COPILOT_CITED_MOMENTS, MAX_COPILOT_MIN_EVIDENCE, MAX_COPILOT_QUOTE_LENGTH, MAX_COPILOT_STREAM_ID_LENGTH, MAX_CURSOR_LENGTH, MAX_DAILY_BOOKING_CAP, MAX_DEAL_ID_BYTES, MAX_DEAL_ID_LENGTH, MAX_DEAL_IMPORT_BYTES, MAX_DEAL_IMPORT_CELL_LENGTH, MAX_DEAL_IMPORT_HEADER_LENGTH, MAX_DEAL_IMPORT_ROWS, MAX_DEAL_NAME_BYTES, MAX_DEAL_NAME_LENGTH, MAX_DECISION_NOTE_LENGTH, MAX_DELETION_SEQ, MAX_DEMO_REQUEST_FIELD_LENGTH, MAX_DEMO_REQUEST_MESSAGE_LENGTH, MAX_DOCUMENT_BYTES, MAX_DOCUMENT_FILE_NAME_BYTES, MAX_DOCUMENT_FILE_NAME_LENGTH, MAX_DOCUMENT_PAGES, MAX_DOMAIN_CHECK_TEXT_LENGTH, MAX_DRAFT_SOURCES, MAX_ELIGIBLE_REPS, MAX_EMAIL_LENGTH, MAX_EVIDENCE_REF_LENGTH, MAX_EXCEPT_LABELS, MAX_FIELD_HISTORY_ENTRIES, MAX_GOAL_LENGTH, MAX_HANDOFF_CONTEXT_TURNS, MAX_HONEYPOT_LENGTH, MAX_INQUIRY_MESSAGE_LENGTH, MAX_LINE_LABEL_LENGTH, MAX_MAILBOX_NAME_LENGTH, MAX_MAILBOX_TEAMS, MAX_MERGED_PROSPECTS, MAX_MESSAGE_BODY_LENGTH, MAX_MIN_GAP_SECONDS, MAX_MOMENT_SNIPPET_CHARACTERS, MAX_NAME_LENGTH, MAX_PAGE_SIZE, MAX_PERSON_NAME_LENGTH, MAX_PLAYBACK_URL_LENGTH, MAX_PLAY_CITATIONS, MAX_PROMOTION_SAMPLE, MAX_PROPOSED_PLAYS, MAX_PROSPECTS_PER_REQUEST, MAX_PROSPECT_COMPANY_NAME_LENGTH, MAX_PROSPECT_FIELD_VALUE_LENGTH, MAX_PROSPECT_IMPORT_BYTES, MAX_PROSPECT_IMPORT_ROWS, MAX_PROSPECT_JOB_TITLE_LENGTH, MAX_PROSPECT_NAME_PART_LENGTH, MAX_PROSPECT_NOTES_LENGTH, MAX_PROSPECT_SEARCH_LENGTH, MAX_PROSPECT_TAGS, MAX_PROSPECT_TAG_LENGTH, MAX_PUBLIC_BOOKING_FIELD_LENGTH, MAX_QUALIFICATION_QUESTIONS, MAX_QUALIFICATION_SUMMARY_LENGTH, MAX_QUESTION_CHOICES, MAX_QUESTION_PROMPT_LENGTH, MAX_QUESTION_SUGGESTIONS, MAX_QUEUED_DEAL_IMPORTS, MAX_RECORDING_BYTES, MAX_RECORDING_KEY_LENGTH, MAX_RECORDING_SECONDS, MAX_REGION_LENGTH, MAX_REP_FIELD_LENGTH, MAX_REP_FOLLOWING_CHARACTERS, MAX_REP_FOLLOWING_TURNS, MAX_RETURN_TO_LENGTH, MAX_RIGHTS_HEADING_LENGTH, MAX_RIGHTS_PARAGRAPHS, MAX_RIGHTS_TEXT_LENGTH, MAX_RIGHTS_WORDING_VERSION, MAX_ROUTING_RULES, MAX_SEARCH_CANDIDATES, MAX_SEARCH_LIMIT, MAX_SEARCH_TEXT_CHARACTERS, MAX_SEARCH_TURNS, MAX_SENDS_PER_DAY, MAX_SENDS_PER_HOUR, MAX_SEQ, MAX_SEQUENCE_PROBLEMS, MAX_SEQUENCE_STEP, MAX_SEQUENCE_STEPS, MAX_SKIP_CONDITIONS, MAX_SLOT_RANGE_DAYS, MAX_SOFTPHONE_TOKEN_LENGTH, MAX_SOFTPHONE_TOKEN_TTL_SECONDS, MAX_SOURCE_PASSAGE_LENGTH, MAX_SOURCE_REF_LENGTH, MAX_SOURCE_URL_LENGTH, MAX_SPEAKER_EXCERPT_LENGTH, MAX_SPEAKER_LABEL_BYTES, MAX_SPEAKER_LABEL_LENGTH, MAX_STEP_TEXT_LENGTH, MAX_STRATEGY_LENGTH, MAX_SUPPRESSION_IMPORT_BYTES, MAX_SUPPRESSION_IMPORT_ROWS, MAX_SUPPRESSION_NOTE_LENGTH, MAX_TRANSCRIPT_BYTES, MAX_TRANSCRIPT_TURN_LENGTH, MAX_TURN_SOURCES, MAX_TURN_TEXT_LENGTH, MAX_UTF8_BYTES_PER_CODE_POINT, MAX_VARIANTS, MAX_WAIT_HOURS, MAX_WINDOWS_PER_DAY, MAX_WRAP_UP_NOTE_LENGTH, MEDIA_TYPE_BY_CALL_EXTENSION, MEDIA_TYPE_BY_EXTENSION, MESSAGE_AUTHOR_KINDS, MESSAGE_DIRECTIONS, MESSAGE_FAILURE_REASONS, MIN_COPILOT_MIN_EVIDENCE, MIN_QUESTION_CHOICES, MIN_SOFTPHONE_TOKEN_TTL_SECONDS, MIN_VARIANTS, MIN_VARIANT_SAMPLE, MailCapacity, MailErrorCode, MailEvent, MailEventId, MailEventKind, MailEventType, MailRoute, MailRouteName, Mailbox, MailboxCapacity, MailboxConnectStart, MailboxHealth, MailboxId, MailboxKind, MailboxLimits, MailboxProvider, MailboxState, MailboxStateReason, MarkCopilotCardRequest, MarketingErrorCode, MarketingRoute, MarketingRouteName, Member, MemberParams, MembershipId, MergeProspectsRequest, Message, MessageAuthorKind, MessageDirection, MessageFailureReason, MessageId, MomentMatch, OIDC_COOKIE_BASE_NAME, OIDC_COOKIE_SECURE_PREFIX, ONE_ADDRESS_MESSAGE, ORGANIZATION_STATUSES, OUTCOMES, OneClickUnsubscribeRequest, Organization, OrganizationId, OrganizationMailLimits, OrganizationStatus, Outcome, PACKAGE, PAUSE_SEQUENCE_LABELS, PLAYBOOK_ERRORS, PLAYBOOK_READ_ROLES, PLAYBOOK_ROUTES, PLAYBOOK_WRITE_ROLES, PLAY_INTENTS, PLAY_SOURCES, PLAY_STATUSES, PROMOTION_SOURCES, PROSPECT_ADMIN_ROLES, PROSPECT_ALL_ROLES, PROSPECT_COMPANY_FIELD_NAMES, PROSPECT_ERRORS, PROSPECT_EVENTS, PROSPECT_FIELD_NAMES, PROSPECT_IDENTITY_KINDS, PROSPECT_IMPORT_COLUMNS, PROSPECT_IMPORT_FAILURE_REASONS, PROSPECT_IMPORT_FILE_FIELD, PROSPECT_IMPORT_INVALID_REASONS, PROSPECT_IMPORT_REJECT_REASONS, PROSPECT_IMPORT_REPORT_COLUMNS, PROSPECT_IMPORT_ROW_RESULTS, PROSPECT_IMPORT_SKIP_REASONS, PROSPECT_IMPORT_STATES, PROSPECT_MERGE_STATES, PROSPECT_MERGE_UNDO_DAYS, PROSPECT_ROUTES, PROSPECT_STATUSES, Page, PageQuery, ParseRepFieldResult, ParsedDealImportRow, PlaceCallRequest, PlacedCall, Play, PlayCitation, PlayId, PlayIntent, PlaySource, PlayStatus, PlaybookDocument, PlaybookErrorCode, PlaybookRoute, PlaybookRouteName, PromotionPolicy, PromotionSource, Prospect, ProspectCompany, ProspectCompanyCursor, ProspectCompanyFieldName, ProspectCompanyFieldParams, ProspectCompanyId, ProspectCompanyParams, ProspectConsent, ProspectCursor, ProspectDuplicate, ProspectDuplicateCursor, ProspectErrorCode, ProspectEventType, ProspectFieldName, ProspectFieldParams, ProspectId, ProspectIdentityKind, ProspectImport, ProspectImportCursor, ProspectImportFailureReason, ProspectImportId, ProspectImportInvalidDetails, ProspectImportParams, ProspectImportRow, ProspectImportRowCursor, ProspectImportRowReason, ProspectImportRowResult, ProspectImportState, ProspectMerge, ProspectMergeId, ProspectMergeParams, ProspectNotFoundDetails, ProspectParams, ProspectRoute, ProspectRouteName, ProspectStatus, PublicBookRequest, PublicBookingConfirmation, PublicBookingType, PublicChatConsentReceipt, PublicChatConsentRequest, PublicChatMessage, PublicChatReply, PublicInquiryFormView, PublicInquiryReceipt, PublicInquiryRequest, PublicSlot, QUALIFICATION_QUESTION_KINDS, Qualification, QualificationAnswer, QualificationQuestion, QualificationQuestionId, QualificationQuestionKind, QualificationValue, RECORDING_MEDIA_TYPES, REGIONS, REPLY_LABELS, REP_TASK_TYPES, RIGHTS_WORDINGS, ROLES, ROUTING_CANDIDATE_REASONS, ROUTING_ROLES, ROUTING_SKIP_REASONS, Ramp, RateInterval, RecordConsentRequest, RecordDeliveryFailureRequest, RecordWithdrawalRequest, RecordedConsent, RecordingPlayback, Region, RemoveSuppressionRequest, RenameOrganizationRequest, RenameTeamRequest, RepChoice, RepTaskType, ReplyLabel, RequestId, RescheduleBookingRequest, RetryAfterDetails, RightsConfirmation, RightsRequiredDetails, RightsStatus, RightsWording, Role, RouteRequest, RoutingAttributes, RoutingConditions, RoutingDecisionId, RoutingResult, RoutingRule, RoutingRuleId, RoutingSkipReason, RoutingTarget, SALES_HISTORY_ERRORS, SALES_HISTORY_READ_ROLES, SALES_HISTORY_ROUTES, SEARCH_ROUTES, SEND_CHECKS, SEND_DEFERRING_REASONS, SEND_REFUSAL_REASONS, SEND_STATES, SEQUENCE_PROBLEMS, SIGNUP_ERRORS, SKIP_OPERATORS, STEP_KINDS, STOP_SENDING_LABELS, SUPPRESSION_ADDRESS_KINDS, SUPPRESSION_IMPORT_COLUMNS, SUPPRESSION_IMPORT_FAILURE_REASONS, SUPPRESSION_IMPORT_FILE_FIELD, SUPPRESSION_IMPORT_ROW_RESULTS, SUPPRESSION_IMPORT_STATES, SUPPRESSION_REASONS, SUPPRESSION_REMOVABLE_REASONS, SalesHistoryErrorCode, SalesHistoryRoute, SalesHistoryRouteName, SearchDocumentsRequest, SearchDocumentsResponse, SearchEvidence, SearchMomentsRequest, SearchMomentsResponse, SearchRouteName, SearchTurn, SendCheck, SendId, SendKey, SendRecord, SendRefusalReason, SendState, SendWindow, Sequence, SequenceProblem, SequenceProblemCode, SetAgentSettingsRequest, SetCallRepRequest, SetCopilotSettingsRequest, SetDealOutcomeRequest, SetInquiryEmbedRequest, SetMailboxLimitsRequest, SetProspectOwnerRequest, SetSequenceRequest, SignupErrorCode, SkipCondition, Slot, SoftphoneToken, Source, SourceKind, SourcePassage, SpeakerExcerpt, StartCalendarConnectionRequest, StartCalendarConnectionResponse, StartMailboxConnectRequest, Step, StepKey, StepKind, StepVariantResults, SubmitSendRequest, SuggestedQualificationQuestion, SuppressionAddressKind, SuppressionEntry, SuppressionEntryId, SuppressionImport, SuppressionImportId, SuppressionImportRow, SuppressionReason, Team, TeamId, TeamMember, TeamMemberParams, TeamParams, TestRoutingRequest, TranscriptPage, TranscriptTurn, TrySession, TrySessionId, UPLOAD_CONTENT_TYPE, UPLOAD_FILE_FIELD, UnsubscribePage, UnsubscribePreview, UnsubscribeReceipt, UnsubscribeResult, UpdateCampaignRequest, UpdateConsentWordingRequest, UpdateProspectCompanyRequest, UpdateProspectRequest, UpdateQualificationQuestionRequest, UploadCallFields, UploadDocumentFile, UserId, VARIANT_RESULT_STATUSES, VARIANT_WEIGHT_TOTAL, VOICE_ADMIN_ROLES, VOICE_ALL_ROLES, VOICE_CALL_DIRECTIONS, VOICE_CALL_ENDED_BY, VOICE_CALL_FAILURE_REASONS, VOICE_CALL_FINAL_STATES, VOICE_CALL_OUTCOMES, VOICE_CALL_STATES, VOICE_ERRORS, VOICE_EVENTS, VOICE_RECORDING_STATES, VOICE_ROUTES, VOICE_TRANSCRIPT_STATES, Variant, VariantGroup, VariantResult, VoiceCall, VoiceCallDirection, VoiceCallFailureReason, VoiceCallState, VoiceErrorCode, VoiceEventType, VoiceRecordingState, VoiceRoute, VoiceRouteName, VoiceTranscriptState, WEEKDAYS, WINDOW_ZONES, Weekday, WindowZone, WithdrawConsentRequest, WorkingWindow, WrapUpRequest, acceptPlayRequestSchema, addLineRequestSchema, addSuppressionRequestSchema, addTeamMemberRequestSchema, addressFieldsShape, agentCallOutcomeSchema, agentCallParamsSchema, agentLanguageSchema, agentSettingsSchema, agentToolNameSchema, agentTurnPageSchema, agentTurnRoleSchema, agentTurnSchema, agentVoiceStyleSchema, allowedOriginSchema, answerHandoffRequestSchema, approvalPoliciesSchema, approvalPolicySchema, approvalQueueCursorSchema, approvalQueueItemSchema, approvalQueuePageSchema, approvalRuleSchema, approveDraftRequestSchema, assignLineRequestSchema, attemptIdSchema, audienceCheckSchema, audienceCheckStateSchema, audienceCountsSchema, audienceSchema, authOptionsResponseSchema, authProvidersSchema, authorizationUrlSchema, availabilitySchema, bookHeadersSchema, bookRequestSchema, bookingCancelledBySchema, bookingCancelledEvent, bookingCreatedEvent, bookingCursorSchema, bookingIdSchema, bookingLinkTokenSchema, bookingModeSchema, bookingNameSchema, bookingOriginSchema, bookingPageSchema, bookingParamsSchema, bookingRescheduledEvent, bookingSchema, bookingStateSchema, bookingTypeCursorSchema, bookingTypeIdSchema, bookingTypeParamsSchema, bookingTypeSchema, bookingTypeStateSchema, boundedTextSchema, branchArmSchema, branchConditionSchema, branchStepSchema, browserSessionTokensSchema, bulkAssignProspectsRequestSchema, bulkAssignProspectsResponseSchema, calendarConnectionSchema, calendarConnectionStateSchema, calendarDateSchema, calendarProviderSchema, callChannelSchema, callCursorSchema, callDeletedPayloadSchema, callDisclosureSchema, callFailureReasonSchema, callIdSchema, callKindSchema, callListItemSchema, callMediaTypeSchema, callParamsSchema, callRepChangedPayloadSchema, callReuploadRequeues, callSchema, callStateSchema, callTranscribedPayloadSchema, callUploadedPayloadSchema, campaignApprovalModeSchema, campaignCursorSchema, campaignEnrollmentsParamsSchema, campaignIdSchema, campaignLanguageSchema, campaignLaunchedEvent, campaignNameSchema, campaignParamsSchema, campaignSchema, campaignStateSchema, campaignStatsSchema, changeMemberRoleRequestSchema, channelConsentSchema, channelParamsSchema, chatIdSchema, chatMessagePageSchema, chatMessageSchema, chatPageSchema, chatParamsSchema, chatSchema, chatSessionTokenSchema, chatStateSchema, chatTextSchema, checkCallFile, checkDealImportHeader, checkDealImportHeaderText, checkDealImportRow, checkUploadFile, classificationSchema, companySizeBandSchema, completeCalendarConnectionRequestSchema, completeMailboxConnectRequestSchema, confidenceSchema, confirmRightsRequestSchema, consentChannelSchema, consentEventIdSchema, consentEventPageSchema, consentEventSchema, consentFormIdSchema, consentFormPageSchema, consentFormParamsSchema, consentFormSchema, consentFormStateSchema, consentGrantSourceSchema, consentGrantedEvent, consentProspectParamsSchema, consentRevokeTriggerSchema, consentSourceSchema, consentStateSchema, consentTokenParamsSchema, consentTokenSchema, consentWithdrawalSourceSchema, consentWithdrawnEvent, consentWordingIdSchema, consentWordingPageSchema, consentWordingParamsSchema, consentWordingSchema, consentWordingTextSchema, contactCheckIdSchema, contactCheckLogEntrySchema, contactCheckLogPageSchema, contactCheckRequestSchema, contactCheckResultSchema, contactDenialCodeSchema, contactPurposeSchema, contactWarningSchema, conversationActionRequestSchema, conversationControllerSchema, conversationCursorSchema, conversationHandedBackEvent, conversationIdSchema, conversationMessageParamsSchema, conversationPageSchema, conversationParamsSchema, conversationSchema, conversationStateSchema, conversationTakenOverEvent, copilotCallParamsSchema, copilotCardCursorSchema, copilotCardDataSchema, copilotCardIdSchema, copilotCardKindSchema, copilotCardPageSchema, copilotCardParamsSchema, copilotCardSchema, copilotCardTextSchema, copilotDocumentSourceSchema, copilotEvidenceSchema, copilotMomentKey, copilotMomentRefSchema, copilotObjectionTypeSchema, copilotQuietReasonSchema, copilotQuoteSchema, copilotQuoteTextSchema, copilotRatingSchema, copilotSettingsSchema, copilotStatusDataSchema, copilotStreamHeadersSchema, copilotStreamIdSchema, copilotStreamMessageSchema, copilotStreamStateSchema, copilotTextSchema, copilotTranscriptUnavailableDataSchema, copilotTurnDataSchema, correctClassificationRequestSchema, countSchema, countryCodeSchema, createBookingTypeRequestSchema, createCampaignRequestSchema, createConsentFormRequestSchema, createConsentWordingRequestSchema, createDemoRequestRequestSchema, createDemoRequestResponseSchema, createInvitationRequestSchema, createPlayRequestSchema, createProspectCompanyRequestSchema, createProspectRequestSchema, createQualificationQuestionRequestSchema, createRoutingRuleRequestSchema, createTeamRequestSchema, dealAmountSchema, dealCurrencySchema, dealCursorSchema, dealIdSchema, dealImportCursorSchema, dealImportFailureReasonSchema, dealImportIdSchema, dealImportParamsSchema, dealImportRowCursorSchema, dealImportRowReasonSchema, dealImportRowResultSchema, dealImportRowSchema, dealImportSchema, dealImportStateSchema, dealImportUploadedPayloadSchema, dealNameSchema, dealOutcomeChangedPayloadSchema, dealParamsSchema, dealRecordIdSchema, dealSchema, decisionCursorSchema, decisionIdSchema, decisionKindSchema, decisionNoteSchema, decisionPageSchema, decisionSchema, decodeCursor, defineErrors, defineEvent, deletedRecordingSchema, demoRequestIdSchema, demoRequestMessageSchema, demoRequestSourcePageSchema, documentDeletedPayloadSchema, documentExtension, documentFailureReasonSchema, documentFileNameSchema, documentIdSchema, documentMatchSchema, documentMediaTypeSchema, documentParamsSchema, documentQueryText, documentSchema, documentSearchEvidenceSchema, documentSizeCheckSchema, documentStateSchema, documentTypeCheckSchema, documentUploadedPayloadSchema, domainCheckRecordSchema, domainCheckResultSchema, domainCheckSchema, domainCheckStatusSchema, draftAuthorSchema, draftCheckSchema, draftHoldReasonSchema, draftIdSchema, draftParamsSchema, draftReasonSchema, draftReleaseSchema, draftSchema, draftSourceKindSchema, draftSourcesSchema, draftStatusSchema, duplicateCampaignRequestSchema, duplicateIdentityDetailsSchema, e164PhoneSchema, editPlayRequestSchema, effectiveLimitsSchema, emailSchema, emailStepSchema, encodeCursor, endStepSchema, enrollProspectsRequestSchema, enrollProspectsResponseSchema, enrollRefusalSchema, enrollResultSchema, enrollmentActivityCursorSchema, enrollmentCursorSchema, enrollmentEventIdSchema, enrollmentEventKindSchema, enrollmentEventSchema, enrollmentIdSchema, enrollmentParamsSchema, enrollmentSchema, enrollmentStateSchema, enrollmentStopReasonSchema, enrollmentStoppedEvent, eraseProspectResponseSchema, errorBodySchema, errorCodeSchema, eventEnvelopeSchema, eventIdSchema, eventTypeSchema, evidenceEventSchema, evidencePageSchema, evidenceRefSchema, excerptText, fieldHistoryCursorSchema, fieldHistoryEntrySchema, fieldHistoryStateSchema, fieldValueSchema, findSequenceProblems, firstCsvRecord, foldAscii, formatCopilotStreamFrame, formatId, getTranscriptQuerySchema, goalSchema, googleCompleteRequestSchema, googleCompleteResponseSchema, googleErrorQuerySchema, googleIntentSchema, googleSignUpQuerySchema, googleStartRequestSchema, googleStartResponseSchema, handoffChannelSchema, handoffContextSchema, handoffIdSchema, handoffPageSchema, handoffParamsSchema, handoffReasonSchema, handoffResultSchema, handoffSchema, handoffStateSchema, hasControlCharacter, hasExactlyOneAddress, hasStrippableCharacter, healthComponentKindSchema, healthComponentSchema, healthComponentStateSchema, healthDailyPageSchema, healthDailySchema, healthHistoryCursorSchema, healthSummarySchema, holdReasonFor, hostedConsentFormViewSchema, hostedConsentReceiptSchema, hostedConsentSubmissionSchema, hoursSchema, idSchema, idempotencyKeySchema, inboxChannelSchema, inboxKeyedHeadersSchema, ingestMessageRequestSchema, ingestMessageResultSchema, inquiryCallbackSchema, inquiryCallbackStateSchema, inquiryConsentSchema, inquiryCursorSchema, inquiryEmbedSchema, inquiryIdSchema, inquiryKeySchema, inquiryKeyedHeadersSchema, inquiryMessageSchema, inquiryPageSchema, inquiryParamsSchema, inquirySchema, inquirySkipReasonSchema, inquirySourceSchema, internalAbandonOrganizationParamsSchema, internalAbandonOrganizationRequestSchema, internalAbandonOrganizationResponseSchema, internalAcceptInvitationRequestSchema, internalAcceptInvitationResponseSchema, internalCreateOrganizationRequestSchema, internalCreateOrganizationResponseSchema, internalMembershipRequestSchema, internalMembershipResponseSchema, internalRemoveOrganizationDocumentsParamsSchema, internalRemoveOrganizationDocumentsRequestSchema, internalRemoveOrganizationDocumentsResponseSchema, internalUpdateMemberProfileParamsSchema, internalUpdateMemberProfileRequestSchema, internalUpdateMemberProfileResponseSchema, invalidSequenceDetailsSchema, invitableRoleSchema, invitationIdSchema, invitationParamsSchema, invitationSchema, invitationStateSchema, invitationTokenSchema, isBlankCsvRecord, isComposedKind, isWellFormedText, joinUrlSchema, launchCheckItemSchema, launchCheckNameSchema, launchCheckResultSchema, launchCheckSchema, limitDetailsSchema, lineAssignmentSchema, lineCursorSchema, lineIdSchema, lineLabelSchema, linePageSchema, lineParamsSchema, lineSchema, lineStateSchema, listAgentTurnsQuerySchema, listApprovalQueueQuerySchema, listBookingTypesQuerySchema, listBookingsQuerySchema, listCallsQuerySchema, listCallsResponseSchema, listCampaignsQuerySchema, listCampaignsResponseSchema, listChatMessagesQuerySchema, listChatsQuerySchema, listConsentEventsQuerySchema, listConsentFormsQuerySchema, listConsentWordingsQuerySchema, listContactChecksQuerySchema, listConversationsQuerySchema, listCopilotCardsQuerySchema, listDealImportRowsQuerySchema, listDealImportRowsResponseSchema, listDealImportsQuerySchema, listDealImportsResponseSchema, listDealsQuerySchema, listDealsResponseSchema, listDecisionsQuerySchema, listDocumentsQuerySchema, listDocumentsResponseSchema, listEnrollmentActivityResponseSchema, listEnrollmentsQuerySchema, listEnrollmentsResponseSchema, listEvidenceQuerySchema, listFieldHistoryQuerySchema, listFieldHistoryResponseSchema, listHandoffsQuerySchema, listHealthHistoryQuerySchema, listInquiriesQuerySchema, listInvitationsQuerySchema, listInvitationsResponseSchema, listLinesQuerySchema, listMailEventsQuerySchema, listMailboxesQuerySchema, listMembersQuerySchema, listMembersResponseSchema, listMessagesQuerySchema, listPlaysQuerySchema, listPlaysResponseSchema, listProspectCompaniesQuerySchema, listProspectCompaniesResponseSchema, listProspectDuplicatesQuerySchema, listProspectDuplicatesResponseSchema, listProspectImportRowsQuerySchema, listProspectImportRowsResponseSchema, listProspectImportsQuerySchema, listProspectImportsResponseSchema, listProspectsQuerySchema, listProspectsResponseSchema, listQualificationQuestionsQuerySchema, listRoutingRulesQuerySchema, listSendsQuerySchema, listSlotsQuerySchema, listSuppressionEntriesQuerySchema, listSuppressionImportRowsQuerySchema, listSuppressionImportsQuerySchema, listTeamMembersQuerySchema, listTeamMembersResponseSchema, listTeamsQuerySchema, listTeamsResponseSchema, listVoiceCallsQuerySchema, lookupDealRequestSchema, lookupSuppressionRequestSchema, mailBouncedEvent, mailCapacitySchema, mailComplainedEvent, mailEventCursorSchema, mailEventIdSchema, mailEventKindSchema, mailEventPageSchema, mailEventSchema, mailKeyedHeadersSchema, mailOutOfOfficeEvent, mailProviderMessageIdSchema, mailRepliedEvent, mailUnsubscribedEvent, mailboxCapacitySchema, mailboxConnectStartSchema, mailboxCursorSchema, mailboxHealthSchema, mailboxIdSchema, mailboxKindSchema, mailboxLimitsSchema, mailboxPageSchema, mailboxParamsSchema, mailboxProviderSchema, mailboxSchema, mailboxStateChangedEvent, mailboxStateReasonSchema, mailboxStateSchema, markCopilotCardRequestSchema, maskedAddressSchema, memberParamsSchema, memberSchema, membershipIdSchema, mergeProspectsRequestSchema, messageApprovedEvent, messageAuthorKindSchema, messageBodySchema, messageCursorSchema, messageDirectionSchema, messageFailedEvent, messageFailureReasonSchema, messageIdSchema, messagePageSchema, messageSchema, messageSentEvent, minuteOfDaySchema, momentMatchSchema, momentQueryText, momentSnippet, momentSnippetSchema, multilineTextSchema, normaliseDealId, normaliseFileName, normaliseMediaType, normaliseSpeakerLabel, oneClickUnsubscribeBodySchema, oneClickUnsubscribeRequestSchema, organizationIdSchema, organizationMailLimitsSchema, organizationNameSchema, organizationSchema, organizationStatusSchema, outcomeSchema, pageQuerySchema, pageSchema, parseAmountCell, parseClosedAtCell, parseCsv, parseCurrencyCell, parseOutcomeCell, parseRepField, personNameSchema, phoneHashSchema, placeCallHeadersSchema, placeCallRequestSchema, placedCallSchema, playCitationSchema, playCursorSchema, playIdSchema, playIntentSchema, playParamsSchema, playSchema, playSourceSchema, playStatusSchema, promoteVariantResponseSchema, promotionPolicySchema, promotionRecordSchema, promotionSourceSchema, proposePlaysRequestSchema, proposePlaysResponseSchema, prospectCompanyCursorSchema, prospectCompanyDomainSchema, prospectCompanyFieldNameSchema, prospectCompanyFieldParamsSchema, prospectCompanyIdSchema, prospectCompanyNameSchema, prospectCompanyParamsSchema, prospectCompanySchema, prospectConsentSchema, prospectCreatedEvent, prospectCursorSchema, prospectDuplicateCursorSchema, prospectDuplicateSchema, prospectErasedEvent, prospectFieldNameSchema, prospectFieldParamsSchema, prospectIdSchema, prospectIdentityKindSchema, prospectImportCursorSchema, prospectImportFailureReasonSchema, prospectImportIdSchema, prospectImportInvalidDetailsSchema, prospectImportParamsSchema, prospectImportRowCursorSchema, prospectImportRowReasonSchema, prospectImportRowResultSchema, prospectImportRowSchema, prospectImportSchema, prospectImportStateSchema, prospectJobTitleSchema, prospectMergeIdSchema, prospectMergeParamsSchema, prospectMergeSchema, prospectMergeUndoneEvent, prospectMergedEvent, prospectNamePartSchema, prospectNotFoundDetailsSchema, prospectNotesSchema, prospectParamsSchema, prospectSchema, prospectSearchSchema, prospectStatusSchema, prospectTagsSchema, prospectUpdatedEvent, providerMessageIdSchema, publicBookRequestSchema, publicBookingConfirmationSchema, publicBookingParamsSchema, publicBookingTypeSchema, publicChatConsentReceiptSchema, publicChatConsentRequestSchema, publicChatHandoffReplySchema, publicChatHandoffRequestSchema, publicChatHeadersSchema, publicChatKeyParamsSchema, publicChatMessagePageSchema, publicChatMessageReplySchema, publicChatMessageSchema, publicChatOriginHeadersSchema, publicChatReplySchema, publicChatSessionParamsSchema, publicInquiryFormViewSchema, publicInquiryHeadersSchema, publicInquiryParamsSchema, publicInquiryReceiptSchema, publicInquiryRequestSchema, publicListChatMessagesQuerySchema, publicListSlotsQuerySchema, publicOriginHeadersSchema, publicSendChatMessageRequestSchema, publicSlotPageSchema, publicSlotSchema, publicStartChatRequestSchema, publicStartChatResponseSchema, qualificationAnswerSchema, qualificationQuestionIdSchema, qualificationQuestionKindSchema, qualificationQuestionPageSchema, qualificationQuestionParamsSchema, qualificationQuestionSchema, qualificationSchema, qualificationValueSchema, questionPromptSchema, questionSuggestionsSchema, rampSchema, rateIntervalSchema, rawLinkedinUrlSchema, rawPhoneSchema, recordConsentRequestSchema, recordDeliveryFailureRequestSchema, recordWithdrawalRequestSchema, recordedConsentSchema, recordedSuppressionSchema, recordingKeySchema, recordingPlaybackSchema, regionSchema, rejectDraftRequestSchema, removeEnrollmentRequestSchema, removeSuppressionRequestSchema, renameOrganizationRequestSchema, renameTeamRequestSchema, reorderQualificationQuestionsRequestSchema, reorderRoutingRulesRequestSchema, repChangeAllowed, repChoiceSchema, repChoiceSuits, repTaskStepSchema, repTaskTypeSchema, replyClassifiedEvent, replyLabelSchema, replyRequestSchema, requestIdSchema, rescheduleBookingRequestSchema, retryAfterDetailsSchema, returnToSchema, rightsConfirmationSchema, rightsRequiredDetailsSchema, rightsStatusSchema, rightsWordingFor, rightsWordingSchema, rightsWordingVersionSchema, roleAtLeast, roleSchema, routeRequestSchema, routingAttributesSchema, routingCandidateReasonSchema, routingConditionsSchema, routingDecisionIdSchema, routingResultSchema, routingRuleIdSchema, routingRuleParamsSchema, routingRuleSchema, routingSkipReasonSchema, routingTargetSchema, searchDocumentsRequestSchema, searchDocumentsResponseSchema, searchEvidenceSchema, searchMomentsRequestSchema, searchMomentsResponseSchema, searchTurnSchema, sendCheckResultSchema, sendCheckSchema, sendCursorSchema, sendIdSchema, sendKeySchema, sendKeyToString, sendPageSchema, sendParamsSchema, sendRecordSchema, sendRefusalReasonSchema, sendStateSchema, sendTryMessageRequestSchema, sendWindowSchema, sequenceProblemCodeSchema, sequenceProblemSchema, sequenceSchema, sequenceStepsSchema, setAgentSettingsRequestSchema, setApprovalPolicyRequestSchema, setCallRepRequestSchema, setCopilotSettingsRequestSchema, setDealOutcomeRequestSchema, setInquiryEmbedRequestSchema, setMailboxLimitsRequestSchema, setProspectOwnerRequestSchema, setSequenceRequestSchema, skipConditionSchema, skipOperatorSchema, slotPageSchema, slotSchema, softphoneTokenSchema, sourceKindSchema, sourcePassageSchema, sourceRefSchema, sourceSchema, sourceUrlSchema, speakerExcerpt, speakerExcerptSchema, speakerLabelSchema, startCalendarConnectionRequestSchema, startCalendarConnectionResponseSchema, startMailboxConnectRequestSchema, startTrySessionRequestSchema, stepKeySchema, stepKindSchema, stepSchema, stepSentEvent, stepTextSchema, stepVariantResultsSchema, stepVariantsParamsSchema, storedNameSchema, submitSendRequestSchema, suggestedQualificationQuestionSchema, suppressionAddedEvent, suppressionAddressKindSchema, suppressionEntryIdSchema, suppressionEntryPageSchema, suppressionEntryParamsSchema, suppressionEntrySchema, suppressionImportIdSchema, suppressionImportPageSchema, suppressionImportParamsSchema, suppressionImportRowPageSchema, suppressionImportRowSchema, suppressionImportSchema, suppressionImportStateSchema, suppressionListStateSchema, suppressionReasonSchema, suppressionRemovedEvent, teamIdSchema, teamMemberParamsSchema, teamMemberSchema, teamNameSchema, teamParamsSchema, teamSchema, testRoutingRequestSchema, timeOfDaySchema, timeZoneSchema, timestampSchema, toReplyLabel, transcriptCursorSchema, transcriptPageSchema, transcriptSpeakerSchema, transcriptTurnSchema, tryReplySchema, trySessionIdSchema, trySessionParamsSchema, trySessionSchema, unsubscribePageSchema, unsubscribeParamsSchema, unsubscribePreviewSchema, unsubscribeReceiptSchema, unsubscribeResultSchema, unsubscribeTokenSchema, updateBookingTypeRequestSchema, updateCampaignRequestSchema, updateConsentWordingRequestSchema, updateProspectCompanyRequestSchema, updateProspectRequestSchema, updateQualificationQuestionRequestSchema, updateRoutingRuleRequestSchema, uploadCallFieldsSchema, uploadCallFileSchema, uploadDocumentFileSchema, userIdSchema, variantGroupSchema, variantParamsSchema, variantPromotedEvent, variantResultSchema, variantResultStatusSchema, variantSchema, voiceAgentCallEndedEvent, voiceCallCursorSchema, voiceCallDirectionSchema, voiceCallEndedBySchema, voiceCallEndedEvent, voiceCallFailureReasonSchema, voiceCallOutcomeSchema, voiceCallPageSchema, voiceCallParamsSchema, voiceCallSchema, voiceCallStartedEvent, voiceCallStateSchema, voiceConsentRevokedEvent, voiceCopilotCardRatedEvent, voiceCopilotCardShownEvent, voiceHandoffCompletedEvent, voiceInquiryReceivedEvent, voiceRecordingStateSchema, voiceTranscriptStateSchema, waitStepSchema, weekdaySchema, windowZoneSchema, withdrawConsentRequestSchema, workingDaySchema, workingWindowSchema, wrapUpNoteSchema, wrapUpRequestSchema };
