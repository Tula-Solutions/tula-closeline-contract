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
/** The text a visitor or the Inbound Agent says in a Chat: bounded, no control character, untrusted. */
declare const chatTextSchema: z16.ZodPipe<z16.ZodString, z16.ZodString>;
/** The secret token of a visitor's Chat session: 32 to 64 URL-safe characters. */
declare const chatSessionTokenSchema: z16.ZodString;
/** The states of a Chat: `open`, `handed_off` to a Rep, or `closed`. */
declare const CHAT_STATES: readonly ["open", "handed_off", "closed"];
/** The state of a Chat. */
declare const chatStateSchema: z16.ZodEnum<{
	closed: "closed";
	handed_off: "handed_off";
	open: "open";
}>;
/** The path parameters of every public route that begins a Chat: the publishable key. */
declare const publicChatKeyParamsSchema: z16.ZodObject<{
	key: z16.ZodString;
}, z16.core.$strict>;
/** The path parameters of every public route inside a Chat: the secret session token. */
declare const publicChatSessionParamsSchema: z16.ZodObject<{
	sessionToken: z16.ZodString;
}, z16.core.$strict>;
/** The headers of a public Chat request that changes nothing: the `Origin`. */
declare const publicChatOriginHeadersSchema: z16.ZodObject<{
	origin: z16.ZodString;
}, z16.core.$strip>;
/** The headers of a public Chat request that changes something: the `Origin` and a required `Idempotency-Key`. */
declare const publicChatHeadersSchema: z16.ZodObject<{
	origin: z16.ZodString;
	"idempotency-key": z16.ZodString;
}, z16.core.$strip>;
/**
* The body of a public request to start a Chat: the page address the widget is on. `website` is the
* honeypot, a field the widget hides from people; a non-empty value marks a bot, still parses, and
* is answered like a real request with nothing stored. A Chat needs no Contact Consent (the visitor
* started it); only a callback does (ADR 0003).
*/
declare const publicStartChatRequestSchema: z16.ZodObject<{
	sourceUrl: z16.ZodString;
	website: z16.ZodDefault<z16.ZodString>;
}, z16.core.$strict>;
/** What a visitor sees of one message: who said it and what, with no source, tool or id. */
declare const publicChatMessageSchema: z16.ZodObject<{
	index: z16.ZodNumber;
	role: z16.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
	}>;
	text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
	at: z16.ZodISODateTime;
}, z16.core.$strict>;
/** What a visitor sees of one message. */
type PublicChatMessage = z16.infer<typeof publicChatMessageSchema>;
/**
* The answer to starting a Chat: the secret session token, when it expires and the opening
* message, which states the visitor is talking to an AI. No Chat, Prospect or Rep id.
*/
declare const publicStartChatResponseSchema: z16.ZodObject<{
	sessionToken: z16.ZodString;
	expiresAt: z16.ZodISODateTime;
	messages: z16.ZodArray<z16.ZodObject<{
		index: z16.ZodNumber;
		role: z16.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
		at: z16.ZodISODateTime;
	}, z16.core.$strict>>;
}, z16.core.$strict>;
/** The body of a public message from the visitor. */
declare const publicSendChatMessageRequestSchema: z16.ZodObject<{
	text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
}, z16.core.$strict>;
/**
* The Inbound Agent's reply as a visitor sees it. `deferred` is true when it said someone will
* follow up rather than answer; `handoffOffered` is true when it offered a Rep. No Playbook
* source, tool call, Rep or internal id.
*/
declare const publicChatReplySchema: z16.ZodObject<{
	text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
	deferred: z16.ZodBoolean;
	handoffOffered: z16.ZodBoolean;
	at: z16.ZodISODateTime;
}, z16.core.$strict>;
/** The reply a visitor gets. */
type PublicChatReply = z16.infer<typeof publicChatReplySchema>;
/** The answer to a visitor's message. */
declare const publicChatMessageReplySchema: z16.ZodObject<{
	reply: z16.ZodObject<{
		text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
		deferred: z16.ZodBoolean;
		handoffOffered: z16.ZodBoolean;
		at: z16.ZodISODateTime;
	}, z16.core.$strict>;
}, z16.core.$strict>;
/** The query parameters of a public request to list a Chat's messages: oldest first, cursor-paginated. */
declare const publicListChatMessagesQuerySchema: z16.ZodObject<{
	cursor: z16.ZodOptional<z16.ZodString>;
	limit: z16.ZodDefault<z16.ZodPipe<z16.ZodPipe<z16.ZodUnion<readonly [z16.ZodNumber, z16.ZodString]>, z16.ZodTransform<number, string | number>>, z16.ZodNumber>>;
}, z16.core.$strict>;
/** One page of the messages a visitor sees. */
declare const publicChatMessagePageSchema: z16.ZodObject<{
	items: z16.ZodArray<z16.ZodObject<{
		index: z16.ZodNumber;
		role: z16.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
		at: z16.ZodISODateTime;
	}, z16.core.$strict>>;
	nextCursor: z16.ZodNullable<z16.ZodString>;
}, z16.core.$strip>;
/**
* The body of a public request to ask for a callback from inside a Chat: the visitor's name and
* number and the Consent Wording id and version shown, the choice and the page address. The wording
* version and page address are required, as for the form Inquiry; with `callbackConsent` false the
* details are kept and no call is placed.
*/
declare const publicChatConsentRequestSchema: z16.ZodObject<{
	name: z16.ZodPipe<z16.ZodString, z16.ZodString>;
	phone: z16.ZodPipe<z16.ZodString, z16.ZodString>;
	consentWordingId: z16.core.$ZodBranded<z16.ZodString, "cwd", "out">;
	consentWordingVersion: z16.ZodNumber;
	callbackConsent: z16.ZodBoolean;
	sourceUrl: z16.ZodString;
}, z16.core.$strict>;
/** The body of a public callback request from a Chat. */
type PublicChatConsentRequest = z16.infer<typeof publicChatConsentRequestSchema>;
/**
* The receipt of a callback request from a Chat: that it arrived, and when. It does not say
* whether a call is coming, so it cannot reveal a suppressed number. No Inquiry, Prospect or Rep id.
*/
declare const publicChatConsentReceiptSchema: z16.ZodObject<{
	received: z16.ZodLiteral<true>;
	receivedAt: z16.ZodISODateTime;
}, z16.core.$strict>;
/** The receipt of a callback request from a Chat. */
type PublicChatConsentReceipt = z16.infer<typeof publicChatConsentReceiptSchema>;
/** The body of a public request to talk to a Rep: nothing; the Rep is chosen by routing. */
declare const publicChatHandoffRequestSchema: z16.ZodObject<{}, z16.core.$strict>;
/** The answer to asking for a Rep: that a Rep was asked to join. No Rep id or name. */
declare const publicChatHandoffReplySchema: z16.ZodObject<{
	requested: z16.ZodLiteral<true>;
	at: z16.ZodISODateTime;
}, z16.core.$strict>;
/** The path parameters of a request about one Chat. */
declare const chatParamsSchema: z16.ZodObject<{
	chatId: z16.core.$ZodBranded<z16.ZodString, "cht", "out">;
}, z16.core.$strict>;
/**
* A Chat as staff see it. `prospectId` and `inquiryId` are null until the visitor gave their
* details or asked for a callback.
*/
declare const chatSchema: z16.ZodObject<{
	id: z16.core.$ZodBranded<z16.ZodString, "cht", "out">;
	prospectId: z16.ZodNullable<z16.core.$ZodBranded<z16.ZodString, "prs", "out">>;
	inquiryId: z16.ZodNullable<z16.core.$ZodBranded<z16.ZodString, "inq", "out">>;
	state: z16.ZodEnum<{
		closed: "closed";
		handed_off: "handed_off";
		open: "open";
	}>;
	sourceUrl: z16.ZodString;
	startedAt: z16.ZodISODateTime;
	lastMessageAt: z16.ZodISODateTime;
	closedAt: z16.ZodNullable<z16.ZodISODateTime>;
}, z16.core.$strict>;
/** A Chat. */
type Chat = z16.infer<typeof chatSchema>;
/** One message of a Chat as staff see it, with the Playbook passages the Agent's answer used. */
declare const chatMessageSchema: z16.ZodObject<{
	index: z16.ZodNumber;
	role: z16.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
	}>;
	text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
	sources: z16.ZodArray<z16.ZodObject<{
		documentId: z16.core.$ZodBranded<z16.ZodString, "doc", "out">;
		page: z16.ZodNullable<z16.ZodNumber>;
		passage: z16.ZodString;
	}, z16.core.$strict>>;
	deferred: z16.ZodBoolean;
	at: z16.ZodISODateTime;
}, z16.core.$strict>;
/** One message of a Chat. */
type ChatMessage = z16.infer<typeof chatMessageSchema>;
/** The query parameters of a request to list Chats: latest first, cursor-paginated, optionally by state. */
declare const listChatsQuerySchema: z16.ZodObject<{
	cursor: z16.ZodOptional<z16.ZodString>;
	limit: z16.ZodDefault<z16.ZodPipe<z16.ZodPipe<z16.ZodUnion<readonly [z16.ZodNumber, z16.ZodString]>, z16.ZodTransform<number, string | number>>, z16.ZodNumber>>;
	state: z16.ZodOptional<z16.ZodEnum<{
		closed: "closed";
		handed_off: "handed_off";
		open: "open";
	}>>;
}, z16.core.$strict>;
/** One page of Chats. */
declare const chatPageSchema: z16.ZodObject<{
	items: z16.ZodArray<z16.ZodObject<{
		id: z16.core.$ZodBranded<z16.ZodString, "cht", "out">;
		prospectId: z16.ZodNullable<z16.core.$ZodBranded<z16.ZodString, "prs", "out">>;
		inquiryId: z16.ZodNullable<z16.core.$ZodBranded<z16.ZodString, "inq", "out">>;
		state: z16.ZodEnum<{
			closed: "closed";
			handed_off: "handed_off";
			open: "open";
		}>;
		sourceUrl: z16.ZodString;
		startedAt: z16.ZodISODateTime;
		lastMessageAt: z16.ZodISODateTime;
		closedAt: z16.ZodNullable<z16.ZodISODateTime>;
	}, z16.core.$strict>>;
	nextCursor: z16.ZodNullable<z16.ZodString>;
}, z16.core.$strip>;
/** The query parameters of a request to list a Chat's messages: oldest first, cursor-paginated. */
declare const listChatMessagesQuerySchema: z16.ZodObject<{
	cursor: z16.ZodOptional<z16.ZodString>;
	limit: z16.ZodDefault<z16.ZodPipe<z16.ZodPipe<z16.ZodUnion<readonly [z16.ZodNumber, z16.ZodString]>, z16.ZodTransform<number, string | number>>, z16.ZodNumber>>;
}, z16.core.$strict>;
/** One page of a Chat's messages. */
declare const chatMessagePageSchema: z16.ZodObject<{
	items: z16.ZodArray<z16.ZodObject<{
		index: z16.ZodNumber;
		role: z16.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
		}>;
		text: z16.ZodPipe<z16.ZodString, z16.ZodString>;
		sources: z16.ZodArray<z16.ZodObject<{
			documentId: z16.core.$ZodBranded<z16.ZodString, "doc", "out">;
			page: z16.ZodNullable<z16.ZodNumber>;
			passage: z16.ZodString;
		}, z16.core.$strict>>;
		deferred: z16.ZodBoolean;
		at: z16.ZodISODateTime;
	}, z16.core.$strict>>;
	nextCursor: z16.ZodNullable<z16.ZodString>;
}, z16.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh456 } from "..";
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
	readonly "chat.consent_wording_missing": ErrorDefinition_8gwh456<"chat.consent_wording_missing">;
	readonly "chat.key_invalid": ErrorDefinition_8gwh456<"chat.key_invalid">;
	readonly "chat.not_found": ErrorDefinition_8gwh456<"chat.not_found">;
	readonly "chat.origin_not_allowed": ErrorDefinition_8gwh456<"chat.origin_not_allowed">;
	readonly "chat.session_closed": ErrorDefinition_8gwh456<"chat.session_closed">;
	readonly "chat.session_not_found": ErrorDefinition_8gwh456<"chat.session_not_found">;
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
import { z as z17 } from "zod";
/**
* The denial codes of a Contact Check (ADR 0003, ADR 0021). A denial is a typed result of a
* successful call, never an HTTP error: the caller branches on `code`. `consent.unavailable` is
* not answered by core: the kit's client synthesises it when core times out or answers 5xx, so a
* failed check is a denial and never an allowance.
*/
declare const CONTACT_DENIAL_CODES: readonly ["consent.missing", "consent.withdrawn", "consent.suppressed", "consent.unavailable"];
/** A code that denies a contact. */
declare const contactDenialCodeSchema: z17.ZodEnum<{
	"consent.missing": "consent.missing";
	"consent.suppressed": "consent.suppressed";
	"consent.unavailable": "consent.unavailable";
	"consent.withdrawn": "consent.withdrawn";
}>;
/** A code that denies a contact. */
type ContactDenialCode = z17.infer<typeof contactDenialCodeSchema>;
/** Why a contact was allowed: a granted consent, a Rep acting on a Prospect, an answer to the Prospect's own message, or an email to an address that is not suppressed. The basis is informative and the denial rules do not depend on it; a LinkedIn contact is allowed on `rep_initiated` or `reply`. */
declare const CONTACT_ALLOW_BASES: readonly ["consent_granted", "rep_initiated", "reply", "email_no_suppression"];
/**
* Internal: the body of a Contact Check. The calling service has no user token, so it names the
* Organization (ADR 0013) and itself as `caller`; the purpose is set by that service from what it
* is about to do, and there is no field that waives the check. The target is exactly one of a
* Prospect or an address (an email, a phone or a LinkedIn address), which core normalises.
*/
declare const contactCheckRequestSchema: z17.ZodObject<{
	email: z17.ZodOptional<z17.ZodPipe<z17.ZodPipe<z17.ZodString, z17.ZodTransform<string, string>>, z17.ZodString>>;
	phone: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	linkedinUrl: z17.ZodOptional<z17.ZodPipe<z17.ZodString, z17.ZodString>>;
	organizationId: z17.core.$ZodBranded<z17.ZodString, "org", "out">;
	prospectId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
	channel: z17.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	purpose: z17.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
	caller: z17.ZodString;
}, z17.core.$strict>;
/** The body of a Contact Check. */
type ContactCheckRequest = z17.infer<typeof contactCheckRequestSchema>;
/**
* The answer to a Contact Check: an allowance with its `basis`, or a denial with a `consent.*`
* `code`. Every answered check is logged under `checkId`; a denial for a Prospect that does not
* exist is `consent.missing`, so the answer never reveals whether a record exists.
*/
declare const contactCheckResultSchema: z17.ZodUnion<readonly [z17.ZodObject<{
	allowed: z17.ZodLiteral<true>;
	checkId: z17.core.$ZodBranded<z17.ZodString, "chk", "out">;
	basis: z17.ZodEnum<{
		consent_granted: "consent_granted";
		email_no_suppression: "email_no_suppression";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
}, z17.core.$strict>, z17.ZodObject<{
	allowed: z17.ZodLiteral<false>;
	checkId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "chk", "out">>;
	code: z17.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>;
	suppressionReason: z17.ZodNullable<z17.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z17.core.$strict>]>;
/** The answer to a Contact Check. */
type ContactCheckResult = z17.infer<typeof contactCheckResultSchema>;
/** One logged Contact Check, for the Organization's audit. The address is never stored with it. */
declare const contactCheckLogEntrySchema: z17.ZodObject<{
	id: z17.core.$ZodBranded<z17.ZodString, "chk", "out">;
	prospectId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
	channel: z17.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	purpose: z17.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>;
	caller: z17.ZodString;
	allowed: z17.ZodBoolean;
	code: z17.ZodNullable<z17.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>>;
	basis: z17.ZodNullable<z17.ZodEnum<{
		consent_granted: "consent_granted";
		email_no_suppression: "email_no_suppression";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>>;
	checkedAt: z17.ZodISODateTime;
}, z17.core.$strip>;
/** One logged Contact Check. */
type ContactCheckLogEntry = z17.infer<typeof contactCheckLogEntrySchema>;
/** The query parameters of a request to list logged Contact Checks, newest first, with optional filters. */
declare const listContactChecksQuerySchema: z17.ZodObject<{
	cursor: z17.ZodOptional<z17.ZodString>;
	limit: z17.ZodDefault<z17.ZodPipe<z17.ZodPipe<z17.ZodUnion<readonly [z17.ZodNumber, z17.ZodString]>, z17.ZodTransform<number, string | number>>, z17.ZodNumber>>;
	channel: z17.ZodOptional<z17.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	purpose: z17.ZodOptional<z17.ZodEnum<{
		agent_initiated: "agent_initiated";
		rep_initiated: "rep_initiated";
		reply: "reply";
	}>>;
	allowed: z17.ZodOptional<z17.ZodEnum<{
		false: "false";
		true: "true";
	}>>;
	prospectId: z17.ZodOptional<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
	code: z17.ZodOptional<z17.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>>;
}, z17.core.$strict>;
/** The query parameters of a request to list logged Contact Checks. */
type ListContactChecksQuery = z17.infer<typeof listContactChecksQuerySchema>;
/** One page of logged Contact Checks. */
declare const contactCheckLogPageSchema: z17.ZodObject<{
	items: z17.ZodArray<z17.ZodObject<{
		id: z17.core.$ZodBranded<z17.ZodString, "chk", "out">;
		prospectId: z17.ZodNullable<z17.core.$ZodBranded<z17.ZodString, "prs", "out">>;
		channel: z17.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		purpose: z17.ZodEnum<{
			agent_initiated: "agent_initiated";
			rep_initiated: "rep_initiated";
			reply: "reply";
		}>;
		caller: z17.ZodString;
		allowed: z17.ZodBoolean;
		code: z17.ZodNullable<z17.ZodEnum<{
			"consent.missing": "consent.missing";
			"consent.suppressed": "consent.suppressed";
			"consent.unavailable": "consent.unavailable";
			"consent.withdrawn": "consent.withdrawn";
		}>>;
		basis: z17.ZodNullable<z17.ZodEnum<{
			consent_granted: "consent_granted";
			email_no_suppression: "email_no_suppression";
			rep_initiated: "rep_initiated";
			reply: "reply";
		}>>;
		checkedAt: z17.ZodISODateTime;
	}, z17.core.$strip>>;
	nextCursor: z17.ZodNullable<z17.ZodString>;
}, z17.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh457 } from "..";
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
	readonly "consent.entry_not_removable": ErrorDefinition_8gwh457<"consent.entry_not_removable">;
	readonly "consent.invalid_token": ErrorDefinition_8gwh457<"consent.invalid_token">;
	readonly "consent.missing": ErrorDefinition_8gwh457<"consent.missing">;
	readonly "consent.not_found": ErrorDefinition_8gwh457<"consent.not_found">;
	readonly "consent.suppressed": ErrorDefinition_8gwh457<"consent.suppressed">;
	readonly "consent.unavailable": ErrorDefinition_8gwh457<"consent.unavailable">;
	readonly "consent.withdrawn": ErrorDefinition_8gwh457<"consent.withdrawn">;
	readonly "consent.wording_locked": ErrorDefinition_8gwh457<"consent.wording_locked">;
};
/** A consent error code. */
type ConsentErrorCode = keyof typeof CONSENT_ERRORS;
import { z as z18 } from "zod";
/** `consent.granted` (version 1): a Contact Consent was recorded on a channel. Ids and kinds only: no address, no wording text. */
declare const consentGrantedEvent: {
	type: "consent.granted";
	version: 1;
	schema: z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
		occurredAt: z18.ZodISODateTime;
		organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
		region: z18.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z18.ZodLiteral<"consent.granted">;
		version: z18.ZodLiteral<1>;
		data: z18.ZodObject<{
			consentEventId: z18.core.$ZodBranded<z18.ZodString, "cev", "out">;
			prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
			channel: z18.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			source: z18.ZodEnum<{
				crm: "crm";
				hosted_form: "hosted_form";
				import_attestation: "import_attestation";
				manual: "manual";
				verbal_call: "verbal_call";
			}>;
			wordingId: z18.core.$ZodBranded<z18.ZodString, "cwd", "out">;
		}, z18.core.$strict>;
	}, z18.core.$strip>;
	parse: (input: unknown) => {
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "consent.granted";
		version: 1;
		data: {
			consentEventId: string & z18.$brand<"cev">;
			prospectId: string & z18.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
			wordingId: string & z18.$brand<"cwd">;
		};
	};
	safeParse: (input: unknown) => z18.ZodSafeParseResult<{
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "consent.granted";
		version: 1;
		data: {
			consentEventId: string & z18.$brand<"cev">;
			prospectId: string & z18.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
			wordingId: string & z18.$brand<"cwd">;
		};
	}>;
};
/** `consent.withdrawn` (version 1): a Contact Consent was withdrawn on a channel; `stopAll` is true for each event of a STOP-all. One event per channel. */
declare const consentWithdrawnEvent: {
	type: "consent.withdrawn";
	version: 1;
	schema: z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
		occurredAt: z18.ZodISODateTime;
		organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
		region: z18.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z18.ZodLiteral<"consent.withdrawn">;
		version: z18.ZodLiteral<1>;
		data: z18.ZodObject<{
			consentEventId: z18.core.$ZodBranded<z18.ZodString, "cev", "out">;
			prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
			channel: z18.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			source: z18.ZodEnum<{
				crm: "crm";
				manual: "manual";
				stop_reply: "stop_reply";
				unsubscribe: "unsubscribe";
			}>;
			stopAll: z18.ZodBoolean;
		}, z18.core.$strict>;
	}, z18.core.$strip>;
	parse: (input: unknown) => {
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "consent.withdrawn";
		version: 1;
		data: {
			consentEventId: string & z18.$brand<"cev">;
			prospectId: string & z18.$brand<"prs">;
			channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
			source: "crm" | "manual" | "stop_reply" | "unsubscribe";
			stopAll: boolean;
		};
	};
	safeParse: (input: unknown) => z18.ZodSafeParseResult<{
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "consent.withdrawn";
		version: 1;
		data: {
			consentEventId: string & z18.$brand<"cev">;
			prospectId: string & z18.$brand<"prs">;
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
	schema: z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
		occurredAt: z18.ZodISODateTime;
		organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
		region: z18.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z18.ZodLiteral<"suppression.added">;
		version: z18.ZodLiteral<1>;
		data: z18.ZodObject<{
			suppressionEntryId: z18.core.$ZodBranded<z18.ZodString, "sup", "out">;
			addressKind: z18.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
			}>;
			reason: z18.ZodEnum<{
				bounce: "bounce";
				complaint: "complaint";
				crm: "crm";
				erased: "erased";
				manual: "manual";
				stop: "stop";
				unsubscribe: "unsubscribe";
			}>;
			prospectId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "prs", "out">>;
		}, z18.core.$strict>;
	}, z18.core.$strip>;
	parse: (input: unknown) => {
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.added";
		version: 1;
		data: {
			suppressionEntryId: string & z18.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
			reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
			prospectId: (string & z18.$brand<"prs">) | null;
		};
	};
	safeParse: (input: unknown) => z18.ZodSafeParseResult<{
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.added";
		version: 1;
		data: {
			suppressionEntryId: string & z18.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
			reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
			prospectId: (string & z18.$brand<"prs">) | null;
		};
	}>;
};
/** `suppression.removed` (version 1): a manual entry was removed from the Suppression list. */
declare const suppressionRemovedEvent: {
	type: "suppression.removed";
	version: 1;
	schema: z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
		occurredAt: z18.ZodISODateTime;
		organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
		region: z18.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z18.ZodLiteral<"suppression.removed">;
		version: z18.ZodLiteral<1>;
		data: z18.ZodObject<{
			suppressionEntryId: z18.core.$ZodBranded<z18.ZodString, "sup", "out">;
			addressKind: z18.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
			}>;
		}, z18.core.$strict>;
	}, z18.core.$strip>;
	parse: (input: unknown) => {
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.removed";
		version: 1;
		data: {
			suppressionEntryId: string & z18.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
		};
	};
	safeParse: (input: unknown) => z18.ZodSafeParseResult<{
		id: string & z18.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z18.$brand<"org">;
		region: "eu" | "us";
		type: "suppression.removed";
		version: 1;
		data: {
			suppressionEntryId: string & z18.$brand<"sup">;
			addressKind: "email" | "linkedin" | "phone";
		};
	}>;
};
/** Every consent event, by type. */
declare const CONSENT_EVENTS: {
	readonly "consent.granted": {
		type: "consent.granted";
		version: 1;
		schema: z18.ZodObject<{
			id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
			occurredAt: z18.ZodISODateTime;
			organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
			region: z18.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z18.ZodLiteral<"consent.granted">;
			version: z18.ZodLiteral<1>;
			data: z18.ZodObject<{
				consentEventId: z18.core.$ZodBranded<z18.ZodString, "cev", "out">;
				prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
				channel: z18.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				source: z18.ZodEnum<{
					crm: "crm";
					hosted_form: "hosted_form";
					import_attestation: "import_attestation";
					manual: "manual";
					verbal_call: "verbal_call";
				}>;
				wordingId: z18.core.$ZodBranded<z18.ZodString, "cwd", "out">;
			}, z18.core.$strict>;
		}, z18.core.$strip>;
		parse: (input: unknown) => {
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "consent.granted";
			version: 1;
			data: {
				consentEventId: string & z18.$brand<"cev">;
				prospectId: string & z18.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
				wordingId: string & z18.$brand<"cwd">;
			};
		};
		safeParse: (input: unknown) => z18.ZodSafeParseResult<{
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "consent.granted";
			version: 1;
			data: {
				consentEventId: string & z18.$brand<"cev">;
				prospectId: string & z18.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "hosted_form" | "import_attestation" | "manual" | "verbal_call";
				wordingId: string & z18.$brand<"cwd">;
			};
		}>;
	};
	readonly "consent.withdrawn": {
		type: "consent.withdrawn";
		version: 1;
		schema: z18.ZodObject<{
			id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
			occurredAt: z18.ZodISODateTime;
			organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
			region: z18.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z18.ZodLiteral<"consent.withdrawn">;
			version: z18.ZodLiteral<1>;
			data: z18.ZodObject<{
				consentEventId: z18.core.$ZodBranded<z18.ZodString, "cev", "out">;
				prospectId: z18.core.$ZodBranded<z18.ZodString, "prs", "out">;
				channel: z18.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
					sms: "sms";
					whatsapp: "whatsapp";
				}>;
				source: z18.ZodEnum<{
					crm: "crm";
					manual: "manual";
					stop_reply: "stop_reply";
					unsubscribe: "unsubscribe";
				}>;
				stopAll: z18.ZodBoolean;
			}, z18.core.$strict>;
		}, z18.core.$strip>;
		parse: (input: unknown) => {
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "consent.withdrawn";
			version: 1;
			data: {
				consentEventId: string & z18.$brand<"cev">;
				prospectId: string & z18.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "manual" | "stop_reply" | "unsubscribe";
				stopAll: boolean;
			};
		};
		safeParse: (input: unknown) => z18.ZodSafeParseResult<{
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "consent.withdrawn";
			version: 1;
			data: {
				consentEventId: string & z18.$brand<"cev">;
				prospectId: string & z18.$brand<"prs">;
				channel: "email" | "linkedin" | "phone" | "sms" | "whatsapp";
				source: "crm" | "manual" | "stop_reply" | "unsubscribe";
				stopAll: boolean;
			};
		}>;
	};
	readonly "suppression.added": {
		type: "suppression.added";
		version: 1;
		schema: z18.ZodObject<{
			id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
			occurredAt: z18.ZodISODateTime;
			organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
			region: z18.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z18.ZodLiteral<"suppression.added">;
			version: z18.ZodLiteral<1>;
			data: z18.ZodObject<{
				suppressionEntryId: z18.core.$ZodBranded<z18.ZodString, "sup", "out">;
				addressKind: z18.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
				}>;
				reason: z18.ZodEnum<{
					bounce: "bounce";
					complaint: "complaint";
					crm: "crm";
					erased: "erased";
					manual: "manual";
					stop: "stop";
					unsubscribe: "unsubscribe";
				}>;
				prospectId: z18.ZodNullable<z18.core.$ZodBranded<z18.ZodString, "prs", "out">>;
			}, z18.core.$strict>;
		}, z18.core.$strip>;
		parse: (input: unknown) => {
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.added";
			version: 1;
			data: {
				suppressionEntryId: string & z18.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
				reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
				prospectId: (string & z18.$brand<"prs">) | null;
			};
		};
		safeParse: (input: unknown) => z18.ZodSafeParseResult<{
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.added";
			version: 1;
			data: {
				suppressionEntryId: string & z18.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
				reason: "bounce" | "complaint" | "crm" | "erased" | "manual" | "stop" | "unsubscribe";
				prospectId: (string & z18.$brand<"prs">) | null;
			};
		}>;
	};
	readonly "suppression.removed": {
		type: "suppression.removed";
		version: 1;
		schema: z18.ZodObject<{
			id: z18.core.$ZodBranded<z18.ZodString, "evt", "out">;
			occurredAt: z18.ZodISODateTime;
			organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
			region: z18.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z18.ZodLiteral<"suppression.removed">;
			version: z18.ZodLiteral<1>;
			data: z18.ZodObject<{
				suppressionEntryId: z18.core.$ZodBranded<z18.ZodString, "sup", "out">;
				addressKind: z18.ZodEnum<{
					email: "email";
					linkedin: "linkedin";
					phone: "phone";
				}>;
			}, z18.core.$strict>;
		}, z18.core.$strip>;
		parse: (input: unknown) => {
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.removed";
			version: 1;
			data: {
				suppressionEntryId: string & z18.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
			};
		};
		safeParse: (input: unknown) => z18.ZodSafeParseResult<{
			id: string & z18.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z18.$brand<"org">;
			region: "eu" | "us";
			type: "suppression.removed";
			version: 1;
			data: {
				suppressionEntryId: string & z18.$brand<"sup">;
				addressKind: "email" | "linkedin" | "phone";
			};
		}>;
	};
};
/** The type of a consent event. */
type ConsentEventType = keyof typeof CONSENT_EVENTS;
import { z as z19 } from "zod";
/**
* One ledger event with everything that proves it: the wording shown (id, version and exact text)
* and, for a hosted form, the IP address and user agent core read from the request. Only Owner and
* Admin read it. `submission` is set exactly for a `hosted_form` event.
*/
declare const evidenceEventSchema: z19.ZodIntersection<z19.ZodObject<{
	id: z19.core.$ZodBranded<z19.ZodString, "cev", "out">;
	prospectId: z19.core.$ZodBranded<z19.ZodString, "prs", "out">;
	channel: z19.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	kind: z19.ZodEnum<{
		granted: "granted";
		withdrawn: "withdrawn";
	}>;
	source: z19.ZodUnion<readonly [z19.ZodEnum<{
		crm: "crm";
		hosted_form: "hosted_form";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>, z19.ZodEnum<{
		crm: "crm";
		manual: "manual";
		stop_reply: "stop_reply";
		unsubscribe: "unsubscribe";
	}>]>;
	wordingId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "cwd", "out">>;
	evidenceRef: z19.ZodNullable<z19.ZodPipe<z19.ZodString, z19.ZodString>>;
	callId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "call", "out">>;
	formId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "cfm", "out">>;
	stopAll: z19.ZodBoolean;
	recordedByUserId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "usr", "out">>;
	occurredAt: z19.ZodISODateTime;
	recordedAt: z19.ZodISODateTime;
}, z19.core.$strip>, z19.ZodObject<{
	wording: z19.ZodNullable<z19.ZodObject<{
		id: z19.core.$ZodBranded<z19.ZodString, "cwd", "out">;
		version: z19.ZodNumber;
		text: z19.ZodString;
	}, z19.core.$strip>>;
	submission: z19.ZodNullable<z19.ZodObject<{
		ipAddress: z19.ZodString;
		userAgent: z19.ZodString;
	}, z19.core.$strip>>;
}, z19.core.$strip>>;
/** One ledger event with its evidence. */
type EvidenceEvent = z19.infer<typeof evidenceEventSchema>;
/** The query parameters of a request for a Prospect's evidence, newest first, optionally one channel. */
declare const listEvidenceQuerySchema: z19.ZodObject<{
	cursor: z19.ZodOptional<z19.ZodString>;
	limit: z19.ZodDefault<z19.ZodPipe<z19.ZodPipe<z19.ZodUnion<readonly [z19.ZodNumber, z19.ZodString]>, z19.ZodTransform<number, string | number>>, z19.ZodNumber>>;
	channel: z19.ZodOptional<z19.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z19.core.$strict>;
/** One page of evidence events. */
declare const evidencePageSchema: z19.ZodObject<{
	items: z19.ZodArray<z19.ZodIntersection<z19.ZodObject<{
		id: z19.core.$ZodBranded<z19.ZodString, "cev", "out">;
		prospectId: z19.core.$ZodBranded<z19.ZodString, "prs", "out">;
		channel: z19.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z19.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z19.ZodUnion<readonly [z19.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z19.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "cwd", "out">>;
		evidenceRef: z19.ZodNullable<z19.ZodPipe<z19.ZodString, z19.ZodString>>;
		callId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "call", "out">>;
		formId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "cfm", "out">>;
		stopAll: z19.ZodBoolean;
		recordedByUserId: z19.ZodNullable<z19.core.$ZodBranded<z19.ZodString, "usr", "out">>;
		occurredAt: z19.ZodISODateTime;
		recordedAt: z19.ZodISODateTime;
	}, z19.core.$strip>, z19.ZodObject<{
		wording: z19.ZodNullable<z19.ZodObject<{
			id: z19.core.$ZodBranded<z19.ZodString, "cwd", "out">;
			version: z19.ZodNumber;
			text: z19.ZodString;
		}, z19.core.$strip>>;
		submission: z19.ZodNullable<z19.ZodObject<{
			ipAddress: z19.ZodString;
			userAgent: z19.ZodString;
		}, z19.core.$strip>>;
	}, z19.core.$strip>>>;
	nextCursor: z19.ZodNullable<z19.ZodString>;
}, z19.core.$strip>;
/** The columns of the CSV evidence export, in order. The file carries the same fields as the JSON and no more. */
declare const EVIDENCE_CSV_COLUMNS: readonly ["event_id", "prospect_id", "channel", "kind", "source", "occurred_at", "recorded_at", "wording_id", "wording_version", "wording_text", "evidence_ref", "ip_address", "user_agent"];
import { z as z20 } from "zod";
/** The current state of one channel's Contact Consent, derived from the ledger and never edited. */
declare const CONSENT_STATES: readonly ["granted", "withdrawn", "none"];
/** The current state of a channel's Contact Consent. */
declare const consentStateSchema: z20.ZodEnum<{
	granted: "granted";
	none: "none";
	withdrawn: "withdrawn";
}>;
/** The current state of a channel's Contact Consent. */
type ConsentState = z20.infer<typeof consentStateSchema>;
/**
* One event of the append-only consent ledger (ADR 0021). A `granted` event carries the Consent
* Wording shown (`wordingId`), the `evidenceRef` and, by source, the Call (`verbal_call`) or the
* hosted form (`hosted_form`); a `withdrawn` event needs neither wording nor evidence and has a
* withdrawal source. `stopAll` is true on each event a STOP-all appended. `occurredAt` is when the
* Prospect agreed or withdrew, `recordedAt` when core stored it; `recordedByUserId` is null when a
* system (a form, a STOP reply, a sync) recorded it. The ledger is never updated or deleted.
*/
declare const consentEventSchema: z20.ZodObject<{
	id: z20.core.$ZodBranded<z20.ZodString, "cev", "out">;
	prospectId: z20.core.$ZodBranded<z20.ZodString, "prs", "out">;
	channel: z20.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	kind: z20.ZodEnum<{
		granted: "granted";
		withdrawn: "withdrawn";
	}>;
	source: z20.ZodUnion<readonly [z20.ZodEnum<{
		crm: "crm";
		hosted_form: "hosted_form";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>, z20.ZodEnum<{
		crm: "crm";
		manual: "manual";
		stop_reply: "stop_reply";
		unsubscribe: "unsubscribe";
	}>]>;
	wordingId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cwd", "out">>;
	evidenceRef: z20.ZodNullable<z20.ZodPipe<z20.ZodString, z20.ZodString>>;
	callId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "call", "out">>;
	formId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cfm", "out">>;
	stopAll: z20.ZodBoolean;
	recordedByUserId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "usr", "out">>;
	occurredAt: z20.ZodISODateTime;
	recordedAt: z20.ZodISODateTime;
}, z20.core.$strip>;
/** One event of the consent ledger. */
type ConsentEvent = z20.infer<typeof consentEventSchema>;
/** The state of one channel for a Prospect: `since` and the last event are null while there is no event. */
declare const channelConsentSchema: z20.ZodObject<{
	channel: z20.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	state: z20.ZodEnum<{
		granted: "granted";
		none: "none";
		withdrawn: "withdrawn";
	}>;
	since: z20.ZodNullable<z20.ZodISODateTime>;
	lastEventId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cev", "out">>;
	wordingId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cwd", "out">>;
}, z20.core.$strip>;
/**
* A Prospect's Contact Consent per channel, derived from the ledger, with whether the Prospect
* is on the Suppression list and why. Every channel appears exactly once. `suppressed` is true
* exactly when `suppressionReason` is set; a suppressed Prospect is refused on every channel.
*/
declare const prospectConsentSchema: z20.ZodObject<{
	prospectId: z20.core.$ZodBranded<z20.ZodString, "prs", "out">;
	channels: z20.ZodArray<z20.ZodObject<{
		channel: z20.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		state: z20.ZodEnum<{
			granted: "granted";
			none: "none";
			withdrawn: "withdrawn";
		}>;
		since: z20.ZodNullable<z20.ZodISODateTime>;
		lastEventId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cev", "out">>;
		wordingId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cwd", "out">>;
	}, z20.core.$strip>>;
	suppressed: z20.ZodBoolean;
	suppressionReason: z20.ZodNullable<z20.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z20.core.$strip>;
/** A Prospect's Contact Consent per channel. */
type ProspectConsent = z20.infer<typeof prospectConsentSchema>;
/**
* The body of a request to record a granted Contact Consent. `source` is one a person may claim
* (never `hosted_form`; core sets that from the form); the wording must be one the Organization
* wrote that covers the channel, and `evidenceRef` points at the artefact. A `verbal_call` grant
* names the Call as `callId`; other sources must not. The actor is the caller, set by core.
* `occurredAt` defaults to now and may not be in the future. Without a source, wording and
* reference core refuses the request: a checkbox is not proof. Accepts an `Idempotency-Key`.
*/
declare const recordConsentRequestSchema: z20.ZodObject<{
	channel: z20.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	source: z20.ZodEnum<{
		crm: "crm";
		import_attestation: "import_attestation";
		manual: "manual";
		verbal_call: "verbal_call";
	}>;
	wordingId: z20.core.$ZodBranded<z20.ZodString, "cwd", "out">;
	evidenceRef: z20.ZodPipe<z20.ZodString, z20.ZodString>;
	callId: z20.ZodOptional<z20.core.$ZodBranded<z20.ZodString, "call", "out">>;
	occurredAt: z20.ZodOptional<z20.ZodISODateTime>;
}, z20.core.$strict>;
/** The body of a request to record a granted Contact Consent. */
type RecordConsentRequest = z20.infer<typeof recordConsentRequestSchema>;
/**
* The body of a request to record a withdrawal: the named `channels`, or `all: true` for a
* STOP-all that withdraws every channel. Exactly one of the two. A withdrawal on some channels
* leaves the others alone. The source is `manual` and the actor the caller, set by core.
*/
declare const withdrawConsentRequestSchema: z20.ZodObject<{
	channels: z20.ZodOptional<z20.ZodArray<z20.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>>;
	all: z20.ZodOptional<z20.ZodLiteral<true>>;
	occurredAt: z20.ZodOptional<z20.ZodISODateTime>;
}, z20.core.$strict>;
/** The body of a request to record a withdrawal. */
type WithdrawConsentRequest = z20.infer<typeof withdrawConsentRequestSchema>;
/** The path parameters of a request about one Prospect's consent. */
declare const consentProspectParamsSchema: z20.ZodObject<{
	prospectId: z20.core.$ZodBranded<z20.ZodString, "prs", "out">;
}, z20.core.$strict>;
/** The query parameters of a request to list a Prospect's consent events: newest first, optionally one channel. */
declare const listConsentEventsQuerySchema: z20.ZodObject<{
	cursor: z20.ZodOptional<z20.ZodString>;
	limit: z20.ZodDefault<z20.ZodPipe<z20.ZodPipe<z20.ZodUnion<readonly [z20.ZodNumber, z20.ZodString]>, z20.ZodTransform<number, string | number>>, z20.ZodNumber>>;
	channel: z20.ZodOptional<z20.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z20.core.$strict>;
/** The query parameters of a request to list consent events. */
type ListConsentEventsQuery = z20.infer<typeof listConsentEventsQuerySchema>;
/** One page of consent events. */
declare const consentEventPageSchema: z20.ZodObject<{
	items: z20.ZodArray<z20.ZodObject<{
		id: z20.core.$ZodBranded<z20.ZodString, "cev", "out">;
		prospectId: z20.core.$ZodBranded<z20.ZodString, "prs", "out">;
		channel: z20.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z20.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z20.ZodUnion<readonly [z20.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z20.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cwd", "out">>;
		evidenceRef: z20.ZodNullable<z20.ZodPipe<z20.ZodString, z20.ZodString>>;
		callId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "call", "out">>;
		formId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cfm", "out">>;
		stopAll: z20.ZodBoolean;
		recordedByUserId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "usr", "out">>;
		occurredAt: z20.ZodISODateTime;
		recordedAt: z20.ZodISODateTime;
	}, z20.core.$strip>>;
	nextCursor: z20.ZodNullable<z20.ZodString>;
}, z20.core.$strip>;
/** The answer to recording a grant or a withdrawal: the events appended (one per channel) and the Prospect's consent now. */
declare const recordedConsentSchema: z20.ZodObject<{
	events: z20.ZodArray<z20.ZodObject<{
		id: z20.core.$ZodBranded<z20.ZodString, "cev", "out">;
		prospectId: z20.core.$ZodBranded<z20.ZodString, "prs", "out">;
		channel: z20.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		kind: z20.ZodEnum<{
			granted: "granted";
			withdrawn: "withdrawn";
		}>;
		source: z20.ZodUnion<readonly [z20.ZodEnum<{
			crm: "crm";
			hosted_form: "hosted_form";
			import_attestation: "import_attestation";
			manual: "manual";
			verbal_call: "verbal_call";
		}>, z20.ZodEnum<{
			crm: "crm";
			manual: "manual";
			stop_reply: "stop_reply";
			unsubscribe: "unsubscribe";
		}>]>;
		wordingId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cwd", "out">>;
		evidenceRef: z20.ZodNullable<z20.ZodPipe<z20.ZodString, z20.ZodString>>;
		callId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "call", "out">>;
		formId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cfm", "out">>;
		stopAll: z20.ZodBoolean;
		recordedByUserId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "usr", "out">>;
		occurredAt: z20.ZodISODateTime;
		recordedAt: z20.ZodISODateTime;
	}, z20.core.$strip>>;
	consent: z20.ZodObject<{
		prospectId: z20.core.$ZodBranded<z20.ZodString, "prs", "out">;
		channels: z20.ZodArray<z20.ZodObject<{
			channel: z20.ZodEnum<{
				email: "email";
				linkedin: "linkedin";
				phone: "phone";
				sms: "sms";
				whatsapp: "whatsapp";
			}>;
			state: z20.ZodEnum<{
				granted: "granted";
				none: "none";
				withdrawn: "withdrawn";
			}>;
			since: z20.ZodNullable<z20.ZodISODateTime>;
			lastEventId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cev", "out">>;
			wordingId: z20.ZodNullable<z20.core.$ZodBranded<z20.ZodString, "cwd", "out">>;
		}, z20.core.$strip>>;
		suppressed: z20.ZodBoolean;
		suppressionReason: z20.ZodNullable<z20.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>>;
	}, z20.core.$strip>;
}, z20.core.$strip>;
/** The answer to recording a grant or a withdrawal. */
type RecordedConsent = z20.infer<typeof recordedConsentSchema>;
import { z as z21 } from "zod";
/** The path parameters of every public route: the signed token from the link. */
declare const consentTokenParamsSchema: z21.ZodObject<{
	token: z21.ZodString;
}, z21.core.$strict>;
/**
* The body of a hosted consent form submission. Each channel the form offers is an explicit,
* unticked-by-default choice (`agreed` has no default), at least one must be agreed, and the
* address a channel needs is required: a phone for phone, sms and whatsapp, an email for email.
* The wording is the one the page showed. The IP address and user agent are read from the request
* by core as evidence, and the Prospect is found or made by core: neither is in the body. Accepts
* an `Idempotency-Key`, so a double click records once.
*/
declare const hostedConsentSubmissionSchema: z21.ZodObject<{
	wordingId: z21.core.$ZodBranded<z21.ZodString, "cwd", "out">;
	firstName: z21.ZodOptional<z21.ZodPipe<z21.ZodString, z21.ZodString>>;
	lastName: z21.ZodOptional<z21.ZodPipe<z21.ZodString, z21.ZodString>>;
	email: z21.ZodOptional<z21.ZodPipe<z21.ZodPipe<z21.ZodString, z21.ZodTransform<string, string>>, z21.ZodString>>;
	phone: z21.ZodOptional<z21.ZodPipe<z21.ZodString, z21.ZodString>>;
	choices: z21.ZodArray<z21.ZodObject<{
		channel: z21.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>;
		agreed: z21.ZodBoolean;
	}, z21.core.$strict>>;
}, z21.core.$strict>;
/** The body of a hosted consent form submission. */
type HostedConsentSubmission = z21.infer<typeof hostedConsentSubmissionSchema>;
/** What the hosted form page shows: the Organization's name, the exact wording and the channels offered. Nothing about any Prospect. */
declare const hostedConsentFormViewSchema: z21.ZodObject<{
	organizationName: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	wordingId: z21.core.$ZodBranded<z21.ZodString, "cwd", "out">;
	wordingVersion: z21.ZodNumber;
	wordingText: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	channels: z21.ZodArray<z21.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z21.core.$strip>;
/** What the hosted form page shows. */
type HostedConsentFormView = z21.infer<typeof hostedConsentFormViewSchema>;
/** The receipt of a hosted submission: the channels recorded and when. It never repeats the address. */
declare const hostedConsentReceiptSchema: z21.ZodObject<{
	channels: z21.ZodArray<z21.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	recordedAt: z21.ZodISODateTime;
}, z21.core.$strip>;
/** The receipt of a hosted submission. */
type HostedConsentReceipt = z21.infer<typeof hostedConsentReceiptSchema>;
/** What the unsubscribe page shows for a link: the Organization's name and the channel, never the address. */
declare const unsubscribePreviewSchema: z21.ZodObject<{
	organizationName: z21.ZodPipe<z21.ZodString, z21.ZodString>;
	channel: z21.ZodLiteral<"email">;
}, z21.core.$strip>;
/** What the unsubscribe page shows. */
type UnsubscribePreview = z21.infer<typeof unsubscribePreviewSchema>;
/** The one-click unsubscribe body of RFC 8058 (`List-Unsubscribe-Post`): exactly this pair. */
declare const oneClickUnsubscribeRequestSchema: z21.ZodObject<{
	"List-Unsubscribe": z21.ZodLiteral<"One-Click">;
}, z21.core.$strict>;
/** The one-click unsubscribe body. */
type OneClickUnsubscribeRequest = z21.infer<typeof oneClickUnsubscribeRequestSchema>;
/** The receipt of an unsubscribe: it happened and when. A replayed link answers the same. It never repeats the address. */
declare const unsubscribeReceiptSchema: z21.ZodObject<{
	unsubscribed: z21.ZodLiteral<true>;
	recordedAt: z21.ZodISODateTime;
}, z21.core.$strip>;
/** The receipt of an unsubscribe. */
type UnsubscribeReceipt = z21.infer<typeof unsubscribeReceiptSchema>;
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
import { z as z22 } from "zod";
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
declare const suppressionEntrySchema: z22.ZodObject<{
	id: z22.core.$ZodBranded<z22.ZodString, "sup", "out">;
	addressKind: z22.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>;
	maskedAddress: z22.ZodNullable<z22.ZodString>;
	reason: z22.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>;
	channel: z22.ZodNullable<z22.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	sourceRef: z22.ZodNullable<z22.ZodString>;
	addedByUserId: z22.ZodNullable<z22.core.$ZodBranded<z22.ZodString, "usr", "out">>;
	removable: z22.ZodBoolean;
	createdAt: z22.ZodISODateTime;
	removedAt: z22.ZodNullable<z22.ZodISODateTime>;
	removedByUserId: z22.ZodNullable<z22.core.$ZodBranded<z22.ZodString, "usr", "out">>;
	removalReason: z22.ZodNullable<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
}, z22.core.$strip>;
/** A Suppression entry. */
type SuppressionEntry = z22.infer<typeof suppressionEntrySchema>;
/** The path parameters of a request about one Suppression entry. */
declare const suppressionEntryParamsSchema: z22.ZodObject<{
	entryId: z22.core.$ZodBranded<z22.ZodString, "sup", "out">;
}, z22.core.$strict>;
/**
* The body of a request to add an address by hand: exactly one of `email`, `phone` or
* `linkedinUrl`, normalised by core (ADR 0011). The reason is `manual` and the actor the caller,
* both set by core. Adding an address already suppressed answers 200 with the existing entry.
*/
declare const addSuppressionRequestSchema: z22.ZodObject<{
	email: z22.ZodOptional<z22.ZodPipe<z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>, z22.ZodString>>;
	phone: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
	linkedinUrl: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
	note: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
}, z22.core.$strict>;
/** The body of a request to add an address to the Suppression list. */
type AddSuppressionRequest = z22.infer<typeof addSuppressionRequestSchema>;
/** The body of a request to remove a manual entry: the reason is recorded. */
declare const removeSuppressionRequestSchema: z22.ZodObject<{
	reason: z22.ZodPipe<z22.ZodString, z22.ZodString>;
}, z22.core.$strict>;
/** The body of a request to remove a manual entry. */
type RemoveSuppressionRequest = z22.infer<typeof removeSuppressionRequestSchema>;
/** Whether a list shows live entries or removed ones. */
declare const suppressionListStateSchema: z22.ZodEnum<{
	active: "active";
	removed: "removed";
}>;
/**
* The query parameters of a request to list the Suppression list, newest first: filters by
* reason, address kind and state (default `active`). An address is never a query parameter (query strings reach access logs): look one up with
* {@link lookupSuppressionRequestSchema}.
*/
declare const listSuppressionEntriesQuerySchema: z22.ZodObject<{
	cursor: z22.ZodOptional<z22.ZodString>;
	limit: z22.ZodDefault<z22.ZodPipe<z22.ZodPipe<z22.ZodUnion<readonly [z22.ZodNumber, z22.ZodString]>, z22.ZodTransform<number, string | number>>, z22.ZodNumber>>;
	reason: z22.ZodOptional<z22.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
	addressKind: z22.ZodOptional<z22.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>>;
	state: z22.ZodOptional<z22.ZodEnum<{
		active: "active";
		removed: "removed";
	}>>;
}, z22.core.$strict>;
/** The body of a lookup of one address on the Suppression list: exactly one address, normalised and hashed by core; there is no substring search. */
declare const lookupSuppressionRequestSchema: z22.ZodObject<{
	email: z22.ZodOptional<z22.ZodPipe<z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>, z22.ZodString>>;
	phone: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
	linkedinUrl: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
}, z22.core.$strict>;
/** The query parameters of a request to list Suppression entries. */
type ListSuppressionEntriesQuery = z22.infer<typeof listSuppressionEntriesQuerySchema>;
/** One page of Suppression entries. */
declare const suppressionEntryPageSchema: z22.ZodObject<{
	items: z22.ZodArray<z22.ZodObject<{
		id: z22.core.$ZodBranded<z22.ZodString, "sup", "out">;
		addressKind: z22.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
		}>;
		maskedAddress: z22.ZodNullable<z22.ZodString>;
		reason: z22.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>;
		channel: z22.ZodNullable<z22.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		sourceRef: z22.ZodNullable<z22.ZodString>;
		addedByUserId: z22.ZodNullable<z22.core.$ZodBranded<z22.ZodString, "usr", "out">>;
		removable: z22.ZodBoolean;
		createdAt: z22.ZodISODateTime;
		removedAt: z22.ZodNullable<z22.ZodISODateTime>;
		removedByUserId: z22.ZodNullable<z22.core.$ZodBranded<z22.ZodString, "usr", "out">>;
		removalReason: z22.ZodNullable<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
	}, z22.core.$strip>>;
	nextCursor: z22.ZodNullable<z22.ZodString>;
}, z22.core.$strip>;
/**
* Internal: the body of a STOP the channel adapter received. The Organization comes from the
* adapter's own record of the message (an internal call has no token), the address from the
* message sender. Core appends a `stop_reply` withdrawal on `channel` (or on every channel when
* `stopAll`), adds a `stop` Suppression entry and publishes the events. Idempotent on `sourceRef`.
*/
declare const recordWithdrawalRequestSchema: z22.ZodObject<{
	email: z22.ZodOptional<z22.ZodPipe<z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>, z22.ZodString>>;
	phone: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
	linkedinUrl: z22.ZodOptional<z22.ZodPipe<z22.ZodString, z22.ZodString>>;
	organizationId: z22.core.$ZodBranded<z22.ZodString, "org", "out">;
	channel: z22.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>;
	stopAll: z22.ZodDefault<z22.ZodBoolean>;
	sourceRef: z22.ZodString;
}, z22.core.$strict>;
/** Internal: the body of a STOP. */
type RecordWithdrawalRequest = z22.infer<typeof recordWithdrawalRequestSchema>;
/** Why an email address was suppressed by delivery: it bounced or the recipient complained. */
declare const DELIVERY_FAILURE_REASONS: readonly ["bounce", "complaint"];
/** Internal: the body of a bounce or complaint the email channel received; core adds the Suppression entry. Idempotent on `sourceRef`. */
declare const recordDeliveryFailureRequestSchema: z22.ZodObject<{
	organizationId: z22.core.$ZodBranded<z22.ZodString, "org", "out">;
	email: z22.ZodPipe<z22.ZodPipe<z22.ZodString, z22.ZodTransform<string, string>>, z22.ZodString>;
	reason: z22.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
	}>;
	sourceRef: z22.ZodString;
}, z22.core.$strict>;
/** Internal: the body of a bounce or complaint. */
type RecordDeliveryFailureRequest = z22.infer<typeof recordDeliveryFailureRequestSchema>;
/** Internal: what recording a STOP or a delivery failure answers: the entry (an existing one on a replay) and the Prospect if one is known. */
declare const recordedSuppressionSchema: z22.ZodObject<{
	entryId: z22.core.$ZodBranded<z22.ZodString, "sup", "out">;
	prospectId: z22.ZodNullable<z22.core.$ZodBranded<z22.ZodString, "prs", "out">>;
}, z22.core.$strip>;
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
declare const suppressionImportStateSchema: z22.ZodEnum<{
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
declare const suppressionImportSchema: z22.ZodObject<{
	id: z22.core.$ZodBranded<z22.ZodString, "simp", "out">;
	state: z22.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z22.ZodNullable<z22.ZodEnum<{
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	totalRows: z22.ZodNullable<z22.ZodNumber>;
	addedRows: z22.ZodNullable<z22.ZodNumber>;
	alreadySuppressedRows: z22.ZodNullable<z22.ZodNumber>;
	invalidRows: z22.ZodNullable<z22.ZodNumber>;
	createdAt: z22.ZodISODateTime;
	completedAt: z22.ZodNullable<z22.ZodISODateTime>;
	createdByUserId: z22.core.$ZodBranded<z22.ZodString, "usr", "out">;
}, z22.core.$strip>;
/** A Suppression import. */
type SuppressionImport = z22.infer<typeof suppressionImportSchema>;
/** The path parameters of a request about one Suppression import. */
declare const suppressionImportParamsSchema: z22.ZodObject<{
	importId: z22.core.$ZodBranded<z22.ZodString, "simp", "out">;
}, z22.core.$strict>;
/** The query parameters of a request to list Suppression imports, newest first. */
declare const listSuppressionImportsQuerySchema: z22.ZodObject<{
	cursor: z22.ZodOptional<z22.ZodString>;
	limit: z22.ZodDefault<z22.ZodPipe<z22.ZodPipe<z22.ZodUnion<readonly [z22.ZodNumber, z22.ZodString]>, z22.ZodTransform<number, string | number>>, z22.ZodNumber>>;
}, z22.core.$strict>;
/** One page of Suppression imports. */
declare const suppressionImportPageSchema: z22.ZodObject<{
	items: z22.ZodArray<z22.ZodObject<{
		id: z22.core.$ZodBranded<z22.ZodString, "simp", "out">;
		state: z22.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z22.ZodNullable<z22.ZodEnum<{
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		totalRows: z22.ZodNullable<z22.ZodNumber>;
		addedRows: z22.ZodNullable<z22.ZodNumber>;
		alreadySuppressedRows: z22.ZodNullable<z22.ZodNumber>;
		invalidRows: z22.ZodNullable<z22.ZodNumber>;
		createdAt: z22.ZodISODateTime;
		completedAt: z22.ZodNullable<z22.ZodISODateTime>;
		createdByUserId: z22.core.$ZodBranded<z22.ZodString, "usr", "out">;
	}, z22.core.$strip>>;
	nextCursor: z22.ZodNullable<z22.ZodString>;
}, z22.core.$strip>;
/** The result of one row of a Suppression import. */
declare const SUPPRESSION_IMPORT_ROW_RESULTS: readonly ["added", "already_suppressed", "invalid"];
/** One row of the import report: its number and result; no cell of the file is returned. */
declare const suppressionImportRowSchema: z22.ZodObject<{
	rowNumber: z22.ZodNumber;
	result: z22.ZodEnum<{
		added: "added";
		already_suppressed: "already_suppressed";
		invalid: "invalid";
	}>;
	reason: z22.ZodNullable<z22.ZodEnum<{
		unreadable_address: "unreadable_address";
		unsupported_address: "unsupported_address";
	}>>;
}, z22.core.$strip>;
/** One row of the import report. */
type SuppressionImportRow = z22.infer<typeof suppressionImportRowSchema>;
/** The query parameters of a request to read the import report in CSV order, optionally only one result. */
declare const listSuppressionImportRowsQuerySchema: z22.ZodObject<{
	cursor: z22.ZodOptional<z22.ZodString>;
	limit: z22.ZodDefault<z22.ZodPipe<z22.ZodPipe<z22.ZodUnion<readonly [z22.ZodNumber, z22.ZodString]>, z22.ZodTransform<number, string | number>>, z22.ZodNumber>>;
	result: z22.ZodOptional<z22.ZodEnum<{
		added: "added";
		already_suppressed: "already_suppressed";
		invalid: "invalid";
	}>>;
}, z22.core.$strict>;
/** One page of import report rows. */
declare const suppressionImportRowPageSchema: z22.ZodObject<{
	items: z22.ZodArray<z22.ZodObject<{
		rowNumber: z22.ZodNumber;
		result: z22.ZodEnum<{
			added: "added";
			already_suppressed: "already_suppressed";
			invalid: "invalid";
		}>;
		reason: z22.ZodNullable<z22.ZodEnum<{
			unreadable_address: "unreadable_address";
			unsupported_address: "unsupported_address";
		}>>;
	}, z22.core.$strip>>;
	nextCursor: z22.ZodNullable<z22.ZodString>;
}, z22.core.$strip>;
import { z as z23 } from "zod";
/** The channels a Prospect can be contacted on, and a Contact Consent or Suppression can name. */
declare const CONSENT_CHANNELS: readonly ["phone", "sms", "whatsapp", "email", "linkedin"];
/** A channel a Prospect can be contacted on. */
declare const consentChannelSchema: z23.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
	sms: "sms";
	whatsapp: "whatsapp";
}>;
/** A channel a Prospect can be contacted on. */
type ConsentChannel = z23.infer<typeof consentChannelSchema>;
/**
* The channels where an Agent-initiated contact needs a granted Contact Consent (ADR 0003). Email
* needs no Suppression and an unsubscribe path instead. This is a fact of the rule, not a setting.
*/
declare const CONSENT_REQUIRED_CHANNELS: readonly ["phone", "sms", "whatsapp"];
/** Where a granted Contact Consent came from. Core sets `hosted_form` from the public route; a person records the others. */
declare const CONSENT_GRANT_SOURCES: readonly ["hosted_form", "verbal_call", "import_attestation", "crm", "manual"];
/** Where a granted Contact Consent came from. */
declare const consentGrantSourceSchema: z23.ZodEnum<{
	crm: "crm";
	hosted_form: "hosted_form";
	import_attestation: "import_attestation";
	manual: "manual";
	verbal_call: "verbal_call";
}>;
/** Where a granted Contact Consent came from. */
type ConsentGrantSource = z23.infer<typeof consentGrantSourceSchema>;
/** The sources a Rep or Admin may name when recording a grant; the hosted form is never claimed in a body. */
declare const CONSENT_RECORDABLE_SOURCES: readonly ["verbal_call", "import_attestation", "crm", "manual"];
/** Where a withdrawal came from: a one-click unsubscribe, a STOP reply, or a person or sync. */
declare const CONSENT_WITHDRAWAL_SOURCES: readonly ["unsubscribe", "stop_reply", "manual", "crm"];
/** Where a withdrawal came from. */
declare const consentWithdrawalSourceSchema: z23.ZodEnum<{
	crm: "crm";
	manual: "manual";
	stop_reply: "stop_reply";
	unsubscribe: "unsubscribe";
}>;
/** Where a withdrawal came from. */
type ConsentWithdrawalSource = z23.infer<typeof consentWithdrawalSourceSchema>;
/** Every source a ledger event can have. */
declare const consentSourceSchema: z23.ZodUnion<readonly [z23.ZodEnum<{
	crm: "crm";
	hosted_form: "hosted_form";
	import_attestation: "import_attestation";
	manual: "manual";
	verbal_call: "verbal_call";
}>, z23.ZodEnum<{
	crm: "crm";
	manual: "manual";
	stop_reply: "stop_reply";
	unsubscribe: "unsubscribe";
}>]>;
/** Every source a ledger event can have. */
type ConsentSource = z23.infer<typeof consentSourceSchema>;
/** The longest evidence reference (a form submission, a Call, an attestation note), in characters. */
declare const MAX_EVIDENCE_REF_LENGTH = 200;
/** A reference to the artefact that shows a consent: bounded text with no control character. */
declare const evidenceRefSchema: z23.ZodPipe<z23.ZodString, z23.ZodString>;
/**
* The opaque signed token of a public route (an unsubscribe link, a hosted consent form): 22 to
* 256 URL-safe characters. It names no address; core verifies its signature and expiry and
* answers `consent.invalid_token` for a tampered, expired or unknown one.
*/
declare const consentTokenSchema: z23.ZodString;
/** The purposes a Contact Check is asked for, set by the calling service and never by an outside request body. */
declare const CONTACT_PURPOSES: readonly ["agent_initiated", "rep_initiated", "reply"];
/** The purpose of a Contact Check. */
declare const contactPurposeSchema: z23.ZodEnum<{
	agent_initiated: "agent_initiated";
	rep_initiated: "rep_initiated";
	reply: "reply";
}>;
/** The purpose of a Contact Check. */
type ContactPurpose = z23.infer<typeof contactPurposeSchema>;
/** Why an address is on the Suppression list. */
declare const SUPPRESSION_REASONS: readonly ["unsubscribe", "stop", "bounce", "complaint", "manual", "crm", "erased"];
/** Why an address is on the Suppression list. */
declare const suppressionReasonSchema: z23.ZodEnum<{
	bounce: "bounce";
	complaint: "complaint";
	crm: "crm";
	erased: "erased";
	manual: "manual";
	stop: "stop";
	unsubscribe: "unsubscribe";
}>;
/** Why an address is on the Suppression list. */
type SuppressionReason = z23.infer<typeof suppressionReasonSchema>;
/** The reasons an Admin may remove an entry for, with a recorded reason; every other entry is permanent (ADR 0021). */
declare const SUPPRESSION_REMOVABLE_REASONS: readonly ["manual"];
/** The kinds of address a Suppression entry is kept for. */
declare const SUPPRESSION_ADDRESS_KINDS: readonly ["email", "phone", "linkedin"];
/** The kind of address a Suppression entry is kept for. */
declare const suppressionAddressKindSchema: z23.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
}>;
/** The kind of address a Suppression entry is kept for. */
type SuppressionAddressKind = z23.infer<typeof suppressionAddressKindSchema>;
/** A masked address for display (`a***@example.com`): 1 to 100 characters, never the whole address. */
declare const maskedAddressSchema: z23.ZodString;
/** The address fields of a request that names one address: an email, a phone or a LinkedIn address. Pair with {@link hasExactlyOneAddress}. */
declare const addressFieldsShape: {
	email: z23.ZodOptional<z23.ZodPipe<z23.ZodPipe<z23.ZodString, z23.ZodTransform<string, string>>, z23.ZodString>>;
	phone: z23.ZodOptional<z23.ZodPipe<z23.ZodString, z23.ZodString>>;
	linkedinUrl: z23.ZodOptional<z23.ZodPipe<z23.ZodString, z23.ZodString>>;
};
/** True when exactly one of the address fields is present. */
declare const hasExactlyOneAddress: (body: {
	email?: unknown;
	phone?: unknown;
	linkedinUrl?: unknown;
}) => boolean;
/** The message of a request that must name exactly one address. */
declare const ONE_ADDRESS_MESSAGE = "Give exactly one of email, phone or linkedinUrl";
import { z as z24 } from "zod";
/** The longest Consent Wording, in characters. */
declare const MAX_CONSENT_WORDING_LENGTH = 5e3;
/** The longest name of a hosted consent form, in characters. */
declare const MAX_CONSENT_FORM_NAME_LENGTH = 100;
/** Consent Wording text: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
declare const consentWordingTextSchema: z24.ZodPipe<z24.ZodString, z24.ZodString>;
/**
* A Consent Wording: the exact text a Prospect is shown when agreeing, for the `channels` it
* covers. It is immutable once any consent event or published form references it (`locked`); a
* change is a new version, which names the one it replaces as `supersedesId`. `version` starts at
* 1 and grows by one per version of the same lineage.
*/
declare const consentWordingSchema: z24.ZodObject<{
	id: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
	version: z24.ZodNumber;
	text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	channels: z24.ZodArray<z24.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	locked: z24.ZodBoolean;
	supersedesId: z24.ZodNullable<z24.core.$ZodBranded<z24.ZodString, "cwd", "out">>;
	createdAt: z24.ZodISODateTime;
	createdByUserId: z24.core.$ZodBranded<z24.ZodString, "usr", "out">;
}, z24.core.$strip>;
/** A Consent Wording. */
type ConsentWording = z24.infer<typeof consentWordingSchema>;
/** The path parameters of a request about one wording. */
declare const consentWordingParamsSchema: z24.ZodObject<{
	wordingId: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
}, z24.core.$strict>;
/** The body of a request to write a Consent Wording (version 1) or the next version of one. Lawyer-reviewed text is the Organization's to supply. */
declare const createConsentWordingRequestSchema: z24.ZodObject<{
	text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	channels: z24.ZodArray<z24.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z24.core.$strict>;
/** The body of a request to write a Consent Wording. */
type CreateConsentWordingRequest = z24.infer<typeof createConsentWordingRequestSchema>;
/** The body of a request to edit a wording that is not yet locked; a locked one is `consent.wording_locked`. At least one field. */
declare const updateConsentWordingRequestSchema: z24.ZodObject<{
	text: z24.ZodOptional<z24.ZodPipe<z24.ZodString, z24.ZodString>>;
	channels: z24.ZodOptional<z24.ZodArray<z24.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>>;
}, z24.core.$strict>;
/** The body of a request to edit a wording. */
type UpdateConsentWordingRequest = z24.infer<typeof updateConsentWordingRequestSchema>;
/** The query parameters of a request to list wordings, newest first. */
declare const listConsentWordingsQuerySchema: z24.ZodObject<{
	cursor: z24.ZodOptional<z24.ZodString>;
	limit: z24.ZodDefault<z24.ZodPipe<z24.ZodPipe<z24.ZodUnion<readonly [z24.ZodNumber, z24.ZodString]>, z24.ZodTransform<number, string | number>>, z24.ZodNumber>>;
}, z24.core.$strict>;
/** One page of wordings. */
declare const consentWordingPageSchema: z24.ZodObject<{
	items: z24.ZodArray<z24.ZodObject<{
		id: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
		version: z24.ZodNumber;
		text: z24.ZodPipe<z24.ZodString, z24.ZodString>;
		channels: z24.ZodArray<z24.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		locked: z24.ZodBoolean;
		supersedesId: z24.ZodNullable<z24.core.$ZodBranded<z24.ZodString, "cwd", "out">>;
		createdAt: z24.ZodISODateTime;
		createdByUserId: z24.core.$ZodBranded<z24.ZodString, "usr", "out">;
	}, z24.core.$strip>>;
	nextCursor: z24.ZodNullable<z24.ZodString>;
}, z24.core.$strip>;
/** The states of a hosted consent form; publishing locks its wording and closing stops submissions. */
declare const CONSENT_FORM_STATES: readonly ["draft", "published", "closed"];
/** The state of a hosted consent form. */
declare const consentFormStateSchema: z24.ZodEnum<{
	closed: "closed";
	draft: "draft";
	published: "published";
}>;
/** The state of a hosted consent form. */
type ConsentFormState = z24.infer<typeof consentFormStateSchema>;
/**
* A hosted consent form: a wording and the `channels` it offers, each with its own unticked
* choice. `publishedAt` is set exactly once published (a closed form keeps it). `token` goes in the
* hosted page's URL and is the only credential of the public routes, so core returns it to Owner
* and Admin only and it is `null` for a Manager or Rep, and for a draft.
*/
declare const consentFormSchema: z24.ZodObject<{
	id: z24.core.$ZodBranded<z24.ZodString, "cfm", "out">;
	wordingId: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
	name: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	channels: z24.ZodArray<z24.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
	state: z24.ZodEnum<{
		closed: "closed";
		draft: "draft";
		published: "published";
	}>;
	token: z24.ZodNullable<z24.ZodString>;
	createdAt: z24.ZodISODateTime;
	createdByUserId: z24.core.$ZodBranded<z24.ZodString, "usr", "out">;
	publishedAt: z24.ZodNullable<z24.ZodISODateTime>;
	closedAt: z24.ZodNullable<z24.ZodISODateTime>;
}, z24.core.$strip>;
/** A hosted consent form. */
type ConsentForm = z24.infer<typeof consentFormSchema>;
/** The path parameters of a request about one form. */
declare const consentFormParamsSchema: z24.ZodObject<{
	formId: z24.core.$ZodBranded<z24.ZodString, "cfm", "out">;
}, z24.core.$strict>;
/** The body of a request to create a form (a draft) from a wording; the channels must be among the wording's. */
declare const createConsentFormRequestSchema: z24.ZodObject<{
	wordingId: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
	name: z24.ZodPipe<z24.ZodString, z24.ZodString>;
	channels: z24.ZodArray<z24.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
		sms: "sms";
		whatsapp: "whatsapp";
	}>>;
}, z24.core.$strict>;
/** The body of a request to create a form. */
type CreateConsentFormRequest = z24.infer<typeof createConsentFormRequestSchema>;
/** The query parameters of a request to list forms, newest first, optionally one state. */
declare const listConsentFormsQuerySchema: z24.ZodObject<{
	cursor: z24.ZodOptional<z24.ZodString>;
	limit: z24.ZodDefault<z24.ZodPipe<z24.ZodPipe<z24.ZodUnion<readonly [z24.ZodNumber, z24.ZodString]>, z24.ZodTransform<number, string | number>>, z24.ZodNumber>>;
	state: z24.ZodOptional<z24.ZodEnum<{
		closed: "closed";
		draft: "draft";
		published: "published";
	}>>;
}, z24.core.$strict>;
/** One page of forms. */
declare const consentFormPageSchema: z24.ZodObject<{
	items: z24.ZodArray<z24.ZodObject<{
		id: z24.core.$ZodBranded<z24.ZodString, "cfm", "out">;
		wordingId: z24.core.$ZodBranded<z24.ZodString, "cwd", "out">;
		name: z24.ZodPipe<z24.ZodString, z24.ZodString>;
		channels: z24.ZodArray<z24.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
			sms: "sms";
			whatsapp: "whatsapp";
		}>>;
		state: z24.ZodEnum<{
			closed: "closed";
			draft: "draft";
			published: "published";
		}>;
		token: z24.ZodNullable<z24.ZodString>;
		createdAt: z24.ZodISODateTime;
		createdByUserId: z24.core.$ZodBranded<z24.ZodString, "usr", "out">;
		publishedAt: z24.ZodNullable<z24.ZodISODateTime>;
		closedAt: z24.ZodNullable<z24.ZodISODateTime>;
	}, z24.core.$strip>>;
	nextCursor: z24.ZodNullable<z24.ZodString>;
}, z24.core.$strip>;
import { z as z25 } from "zod";
/** One quote from a cited Moment: what the Prospect said and what the Rep said next. Tenant Transcript text, untrusted data, never logged. */
declare const copilotQuoteSchema: z25.ZodObject<{
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
	prospect: z25.ZodString;
	repNext: z25.ZodString;
}, z25.core.$strict>;
/** One quote from a cited Moment. */
type CopilotQuote = z25.infer<typeof copilotQuoteSchema>;
/** The passage of a Playbook document a `document` card shows: the document, its page (null for a format without pages) and the passage. The Organization's own sales material, untrusted data. */
declare const copilotDocumentSourceSchema: z25.ZodObject<{
	documentId: z25.core.$ZodBranded<z25.ZodString, "doc", "out">;
	page: z25.ZodNullable<z25.ZodNumber>;
	passage: z25.ZodString;
}, z25.core.$strict>;
/** The passage of a Playbook document a card shows. */
type CopilotDocumentSource = z25.infer<typeof copilotDocumentSourceSchema>;
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
declare const copilotCardSchema: z25.ZodDiscriminatedUnion<[z25.ZodObject<{
	id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	sequence: z25.ZodNumber;
	evidence: z25.ZodObject<{
		moments: z25.ZodNumber;
		deals: z25.ZodNumber;
	}, z25.core.$strict>;
	citedMoments: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
	}, z25.core.$strict>>;
	quotes: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		prospect: z25.ZodString;
		repNext: z25.ZodString;
	}, z25.core.$strict>>;
	shownAt: z25.ZodISODateTime;
	rating: z25.ZodNullable<z25.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z25.ZodBoolean;
	pinned: z25.ZodBoolean;
	kind: z25.ZodLiteral<"similar_moment">;
}, z25.core.$strict>, z25.ZodObject<{
	id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	sequence: z25.ZodNumber;
	evidence: z25.ZodObject<{
		moments: z25.ZodNumber;
		deals: z25.ZodNumber;
	}, z25.core.$strict>;
	citedMoments: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
	}, z25.core.$strict>>;
	quotes: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		prospect: z25.ZodString;
		repNext: z25.ZodString;
	}, z25.core.$strict>>;
	shownAt: z25.ZodISODateTime;
	rating: z25.ZodNullable<z25.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z25.ZodBoolean;
	pinned: z25.ZodBoolean;
	kind: z25.ZodLiteral<"objection">;
	objectionType: z25.ZodEnum<{
		authority: "authority";
		competitor: "competitor";
		need: "need";
		price: "price";
		timing: "timing";
		trust: "trust";
	}>;
	response: z25.ZodString;
}, z25.core.$strict>, z25.ZodObject<{
	id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	sequence: z25.ZodNumber;
	evidence: z25.ZodObject<{
		moments: z25.ZodNumber;
		deals: z25.ZodNumber;
	}, z25.core.$strict>;
	citedMoments: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
	}, z25.core.$strict>>;
	quotes: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		prospect: z25.ZodString;
		repNext: z25.ZodString;
	}, z25.core.$strict>>;
	shownAt: z25.ZodISODateTime;
	rating: z25.ZodNullable<z25.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z25.ZodBoolean;
	pinned: z25.ZodBoolean;
	kind: z25.ZodLiteral<"next_step">;
	nextStep: z25.ZodString;
}, z25.core.$strict>, z25.ZodObject<{
	id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	sequence: z25.ZodNumber;
	evidence: z25.ZodObject<{
		moments: z25.ZodNumber;
		deals: z25.ZodNumber;
	}, z25.core.$strict>;
	citedMoments: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
	}, z25.core.$strict>>;
	quotes: z25.ZodArray<z25.ZodObject<{
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		prospect: z25.ZodString;
		repNext: z25.ZodString;
	}, z25.core.$strict>>;
	shownAt: z25.ZodISODateTime;
	rating: z25.ZodNullable<z25.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>;
	dismissed: z25.ZodBoolean;
	pinned: z25.ZodBoolean;
	kind: z25.ZodLiteral<"document">;
	source: z25.ZodObject<{
		documentId: z25.core.$ZodBranded<z25.ZodString, "doc", "out">;
		page: z25.ZodNullable<z25.ZodNumber>;
		passage: z25.ZodString;
	}, z25.core.$strict>;
}, z25.core.$strict>], "kind">;
/** A Copilot Card. */
type CopilotCard = z25.infer<typeof copilotCardSchema>;
/** Whether a kind of card is composed by the model (and so replaces a retrieval card in place). */
declare function isComposedKind(kind: CopilotCard["kind"]): boolean;
/** The path parameters of a request about the cards of one Call. */
declare const copilotCallParamsSchema: z25.ZodObject<{
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
}, z25.core.$strict>;
/** The path parameters of a request about one card. */
declare const copilotCardParamsSchema: z25.ZodObject<{
	callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
	cardId: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
}, z25.core.$strict>;
/** The position a card list resumes from: the sequence of the last card of the previous page. */
declare const copilotCardCursorSchema: z25.ZodObject<{
	sequence: z25.ZodNumber;
}, z25.core.$strict>;
/** The query parameters of a request to list the cards of a Call, oldest first, one cursor-paginated page at a time (at most 100), optionally of one kind. */
declare const listCopilotCardsQuerySchema: z25.ZodObject<{
	cursor: z25.ZodOptional<z25.ZodString>;
	limit: z25.ZodDefault<z25.ZodPipe<z25.ZodPipe<z25.ZodUnion<readonly [z25.ZodNumber, z25.ZodString]>, z25.ZodTransform<number, string | number>>, z25.ZodNumber>>;
	kind: z25.ZodOptional<z25.ZodEnum<{
		document: "document";
		next_step: "next_step";
		objection: "objection";
		similar_moment: "similar_moment";
	}>>;
}, z25.core.$strict>;
/** The query parameters of a request to list the cards of a Call. */
type ListCopilotCardsQuery = z25.infer<typeof listCopilotCardsQuerySchema>;
/** One page of the cards of a Call. */
declare const copilotCardPageSchema: z25.ZodObject<{
	items: z25.ZodArray<z25.ZodDiscriminatedUnion<[z25.ZodObject<{
		id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		sequence: z25.ZodNumber;
		evidence: z25.ZodObject<{
			moments: z25.ZodNumber;
			deals: z25.ZodNumber;
		}, z25.core.$strict>;
		citedMoments: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		}, z25.core.$strict>>;
		quotes: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
			prospect: z25.ZodString;
			repNext: z25.ZodString;
		}, z25.core.$strict>>;
		shownAt: z25.ZodISODateTime;
		rating: z25.ZodNullable<z25.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z25.ZodBoolean;
		pinned: z25.ZodBoolean;
		kind: z25.ZodLiteral<"similar_moment">;
	}, z25.core.$strict>, z25.ZodObject<{
		id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		sequence: z25.ZodNumber;
		evidence: z25.ZodObject<{
			moments: z25.ZodNumber;
			deals: z25.ZodNumber;
		}, z25.core.$strict>;
		citedMoments: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		}, z25.core.$strict>>;
		quotes: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
			prospect: z25.ZodString;
			repNext: z25.ZodString;
		}, z25.core.$strict>>;
		shownAt: z25.ZodISODateTime;
		rating: z25.ZodNullable<z25.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z25.ZodBoolean;
		pinned: z25.ZodBoolean;
		kind: z25.ZodLiteral<"objection">;
		objectionType: z25.ZodEnum<{
			authority: "authority";
			competitor: "competitor";
			need: "need";
			price: "price";
			timing: "timing";
			trust: "trust";
		}>;
		response: z25.ZodString;
	}, z25.core.$strict>, z25.ZodObject<{
		id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		sequence: z25.ZodNumber;
		evidence: z25.ZodObject<{
			moments: z25.ZodNumber;
			deals: z25.ZodNumber;
		}, z25.core.$strict>;
		citedMoments: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		}, z25.core.$strict>>;
		quotes: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
			prospect: z25.ZodString;
			repNext: z25.ZodString;
		}, z25.core.$strict>>;
		shownAt: z25.ZodISODateTime;
		rating: z25.ZodNullable<z25.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z25.ZodBoolean;
		pinned: z25.ZodBoolean;
		kind: z25.ZodLiteral<"next_step">;
		nextStep: z25.ZodString;
	}, z25.core.$strict>, z25.ZodObject<{
		id: z25.core.$ZodBranded<z25.ZodString, "ccard", "out">;
		callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
		sequence: z25.ZodNumber;
		evidence: z25.ZodObject<{
			moments: z25.ZodNumber;
			deals: z25.ZodNumber;
		}, z25.core.$strict>;
		citedMoments: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
		}, z25.core.$strict>>;
		quotes: z25.ZodArray<z25.ZodObject<{
			callId: z25.core.$ZodBranded<z25.ZodString, "call", "out">;
			dealRecordId: z25.core.$ZodBranded<z25.ZodString, "deal", "out">;
			prospect: z25.ZodString;
			repNext: z25.ZodString;
		}, z25.core.$strict>>;
		shownAt: z25.ZodISODateTime;
		rating: z25.ZodNullable<z25.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z25.ZodBoolean;
		pinned: z25.ZodBoolean;
		kind: z25.ZodLiteral<"document">;
		source: z25.ZodObject<{
			documentId: z25.core.$ZodBranded<z25.ZodString, "doc", "out">;
			page: z25.ZodNullable<z25.ZodNumber>;
			passage: z25.ZodString;
		}, z25.core.$strict>;
	}, z25.core.$strict>], "kind">>;
	nextCursor: z25.ZodNullable<z25.ZodString>;
}, z25.core.$strip>;
/**
* The body of a request to mark a card: set any of its rating, dismissal and pin to the state
* wanted. It names an end state and not a step, so a repeat changes nothing. At least one field is
* sent; `rating: null` clears the rating. Dismissing a card clears its pin and pinning it clears
* its dismissal, so asking for both is refused.
*/
declare const markCopilotCardRequestSchema: z25.ZodObject<{
	rating: z25.ZodOptional<z25.ZodNullable<z25.ZodEnum<{
		not_useful: "not_useful";
		useful: "useful";
	}>>>;
	dismissed: z25.ZodOptional<z25.ZodBoolean>;
	pinned: z25.ZodOptional<z25.ZodBoolean>;
}, z25.core.$strict>;
/** The body of a request to mark a card. */
type MarkCopilotCardRequest = z25.infer<typeof markCopilotCardRequestSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh458 } from "..";
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
	readonly "card.not_found": ErrorDefinition_8gwh458<"card.not_found">;
	readonly "copilot.disabled": ErrorDefinition_8gwh458<"copilot.disabled">;
	readonly "copilot.min_evidence_invalid": ErrorDefinition_8gwh458<"copilot.min_evidence_invalid">;
	readonly "copilot.not_started": ErrorDefinition_8gwh458<"copilot.not_started">;
};
/** A Copilot error code. */
type CopilotErrorCode = keyof typeof COPILOT_ERRORS;
import { z as z26 } from "zod";
/**
* `voice.copilot.card_shown` (version 1): a Copilot Card appeared on a Rep's screen. Ids, the kind,
* the Evidence and the cited Moments, and no card text, quote or Transcript: those are tenant text
* and are read through the routes by those who may see the Call.
*/
declare const voiceCopilotCardShownEvent: {
	type: "voice.copilot.card_shown";
	version: 1;
	schema: z26.ZodObject<{
		id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
		occurredAt: z26.ZodISODateTime;
		organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
		region: z26.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z26.ZodLiteral<"voice.copilot.card_shown">;
		version: z26.ZodLiteral<1>;
		data: z26.ZodObject<{
			callId: z26.core.$ZodBranded<z26.ZodString, "call", "out">;
			cardId: z26.core.$ZodBranded<z26.ZodString, "ccard", "out">;
			repMembershipId: z26.core.$ZodBranded<z26.ZodString, "mem", "out">;
			kind: z26.ZodEnum<{
				document: "document";
				next_step: "next_step";
				objection: "objection";
				similar_moment: "similar_moment";
			}>;
			objectionType: z26.ZodNullable<z26.ZodEnum<{
				authority: "authority";
				competitor: "competitor";
				need: "need";
				price: "price";
				timing: "timing";
				trust: "trust";
			}>>;
			evidence: z26.ZodObject<{
				moments: z26.ZodNumber;
				deals: z26.ZodNumber;
			}, z26.core.$strict>;
			citedMoments: z26.ZodArray<z26.ZodObject<{
				callId: z26.core.$ZodBranded<z26.ZodString, "call", "out">;
				dealRecordId: z26.core.$ZodBranded<z26.ZodString, "deal", "out">;
			}, z26.core.$strict>>;
			shownAt: z26.ZodISODateTime;
		}, z26.core.$strict>;
	}, z26.core.$strip>;
	parse: (input: unknown) => {
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_shown";
		version: 1;
		data: {
			callId: string & z26.$brand<"call">;
			cardId: string & z26.$brand<"ccard">;
			repMembershipId: string & z26.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
			evidence: {
				moments: number;
				deals: number;
			};
			citedMoments: {
				callId: string & z26.$brand<"call">;
				dealRecordId: string & z26.$brand<"deal">;
			}[];
			shownAt: string;
		};
	};
	safeParse: (input: unknown) => z26.ZodSafeParseResult<{
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_shown";
		version: 1;
		data: {
			callId: string & z26.$brand<"call">;
			cardId: string & z26.$brand<"ccard">;
			repMembershipId: string & z26.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
			evidence: {
				moments: number;
				deals: number;
			};
			citedMoments: {
				callId: string & z26.$brand<"call">;
				dealRecordId: string & z26.$brand<"deal">;
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
	schema: z26.ZodObject<{
		id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
		occurredAt: z26.ZodISODateTime;
		organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
		region: z26.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z26.ZodLiteral<"voice.copilot.card_rated">;
		version: z26.ZodLiteral<1>;
		data: z26.ZodObject<{
			callId: z26.core.$ZodBranded<z26.ZodString, "call", "out">;
			cardId: z26.core.$ZodBranded<z26.ZodString, "ccard", "out">;
			repMembershipId: z26.core.$ZodBranded<z26.ZodString, "mem", "out">;
			kind: z26.ZodEnum<{
				document: "document";
				next_step: "next_step";
				objection: "objection";
				similar_moment: "similar_moment";
			}>;
			rating: z26.ZodNullable<z26.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z26.ZodBoolean;
			pinned: z26.ZodBoolean;
			ratedAt: z26.ZodISODateTime;
		}, z26.core.$strict>;
	}, z26.core.$strip>;
	parse: (input: unknown) => {
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_rated";
		version: 1;
		data: {
			callId: string & z26.$brand<"call">;
			cardId: string & z26.$brand<"ccard">;
			repMembershipId: string & z26.$brand<"mem">;
			kind: "document" | "next_step" | "objection" | "similar_moment";
			rating: "not_useful" | "useful" | null;
			dismissed: boolean;
			pinned: boolean;
			ratedAt: string;
		};
	};
	safeParse: (input: unknown) => z26.ZodSafeParseResult<{
		id: string & z26.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z26.$brand<"org">;
		region: "eu" | "us";
		type: "voice.copilot.card_rated";
		version: 1;
		data: {
			callId: string & z26.$brand<"call">;
			cardId: string & z26.$brand<"ccard">;
			repMembershipId: string & z26.$brand<"mem">;
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
		schema: z26.ZodObject<{
			id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
			occurredAt: z26.ZodISODateTime;
			organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
			region: z26.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z26.ZodLiteral<"voice.copilot.card_shown">;
			version: z26.ZodLiteral<1>;
			data: z26.ZodObject<{
				callId: z26.core.$ZodBranded<z26.ZodString, "call", "out">;
				cardId: z26.core.$ZodBranded<z26.ZodString, "ccard", "out">;
				repMembershipId: z26.core.$ZodBranded<z26.ZodString, "mem", "out">;
				kind: z26.ZodEnum<{
					document: "document";
					next_step: "next_step";
					objection: "objection";
					similar_moment: "similar_moment";
				}>;
				objectionType: z26.ZodNullable<z26.ZodEnum<{
					authority: "authority";
					competitor: "competitor";
					need: "need";
					price: "price";
					timing: "timing";
					trust: "trust";
				}>>;
				evidence: z26.ZodObject<{
					moments: z26.ZodNumber;
					deals: z26.ZodNumber;
				}, z26.core.$strict>;
				citedMoments: z26.ZodArray<z26.ZodObject<{
					callId: z26.core.$ZodBranded<z26.ZodString, "call", "out">;
					dealRecordId: z26.core.$ZodBranded<z26.ZodString, "deal", "out">;
				}, z26.core.$strict>>;
				shownAt: z26.ZodISODateTime;
			}, z26.core.$strict>;
		}, z26.core.$strip>;
		parse: (input: unknown) => {
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_shown";
			version: 1;
			data: {
				callId: string & z26.$brand<"call">;
				cardId: string & z26.$brand<"ccard">;
				repMembershipId: string & z26.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
				evidence: {
					moments: number;
					deals: number;
				};
				citedMoments: {
					callId: string & z26.$brand<"call">;
					dealRecordId: string & z26.$brand<"deal">;
				}[];
				shownAt: string;
			};
		};
		safeParse: (input: unknown) => z26.ZodSafeParseResult<{
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_shown";
			version: 1;
			data: {
				callId: string & z26.$brand<"call">;
				cardId: string & z26.$brand<"ccard">;
				repMembershipId: string & z26.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				objectionType: "authority" | "competitor" | "need" | "price" | "timing" | "trust" | null;
				evidence: {
					moments: number;
					deals: number;
				};
				citedMoments: {
					callId: string & z26.$brand<"call">;
					dealRecordId: string & z26.$brand<"deal">;
				}[];
				shownAt: string;
			};
		}>;
	};
	readonly "voice.copilot.card_rated": {
		type: "voice.copilot.card_rated";
		version: 1;
		schema: z26.ZodObject<{
			id: z26.core.$ZodBranded<z26.ZodString, "evt", "out">;
			occurredAt: z26.ZodISODateTime;
			organizationId: z26.core.$ZodBranded<z26.ZodString, "org", "out">;
			region: z26.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z26.ZodLiteral<"voice.copilot.card_rated">;
			version: z26.ZodLiteral<1>;
			data: z26.ZodObject<{
				callId: z26.core.$ZodBranded<z26.ZodString, "call", "out">;
				cardId: z26.core.$ZodBranded<z26.ZodString, "ccard", "out">;
				repMembershipId: z26.core.$ZodBranded<z26.ZodString, "mem", "out">;
				kind: z26.ZodEnum<{
					document: "document";
					next_step: "next_step";
					objection: "objection";
					similar_moment: "similar_moment";
				}>;
				rating: z26.ZodNullable<z26.ZodEnum<{
					not_useful: "not_useful";
					useful: "useful";
				}>>;
				dismissed: z26.ZodBoolean;
				pinned: z26.ZodBoolean;
				ratedAt: z26.ZodISODateTime;
			}, z26.core.$strict>;
		}, z26.core.$strip>;
		parse: (input: unknown) => {
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_rated";
			version: 1;
			data: {
				callId: string & z26.$brand<"call">;
				cardId: string & z26.$brand<"ccard">;
				repMembershipId: string & z26.$brand<"mem">;
				kind: "document" | "next_step" | "objection" | "similar_moment";
				rating: "not_useful" | "useful" | null;
				dismissed: boolean;
				pinned: boolean;
				ratedAt: string;
			};
		};
		safeParse: (input: unknown) => z26.ZodSafeParseResult<{
			id: string & z26.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z26.$brand<"org">;
			region: "eu" | "us";
			type: "voice.copilot.card_rated";
			version: 1;
			data: {
				callId: string & z26.$brand<"call">;
				cardId: string & z26.$brand<"ccard">;
				repMembershipId: string & z26.$brand<"mem">;
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
import { z as z27 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh459 } from "..";
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
	readonly "call.content_in_other_deal": ErrorDefinition_8gwh459<"call.content_in_other_deal">;
	readonly "call.not_found": ErrorDefinition_8gwh459<"call.not_found">;
	readonly "call.not_restorable": ErrorDefinition_8gwh459<"call.not_restorable">;
	readonly "call.quota_exceeded": ErrorDefinition_8gwh459<"call.quota_exceeded">;
	readonly "call.rep_invalid": ErrorDefinition_8gwh459<"call.rep_invalid">;
	readonly "call.rep_not_changeable": ErrorDefinition_8gwh459<"call.rep_not_changeable">;
	readonly "call.too_large": ErrorDefinition_8gwh459<"call.too_large">;
	readonly "call.unsupported_type": ErrorDefinition_8gwh459<"call.unsupported_type">;
	readonly "deal.not_found": ErrorDefinition_8gwh459<"deal.not_found">;
	readonly "deal_import.busy": ErrorDefinition_8gwh459<"deal_import.busy">;
	readonly "deal_import.header_invalid": ErrorDefinition_8gwh459<"deal_import.header_invalid">;
	readonly "deal_import.not_found": ErrorDefinition_8gwh459<"deal_import.not_found">;
	readonly "deal_import.too_large": ErrorDefinition_8gwh459<"deal_import.too_large">;
	readonly "deal_import.unsupported_type": ErrorDefinition_8gwh459<"deal_import.unsupported_type">;
	readonly "rights.confirmation_required": ErrorDefinition_8gwh459<"rights.confirmation_required">;
	readonly "rights.version_outdated": ErrorDefinition_8gwh459<"rights.version_outdated">;
};
/** A code from the {@link SALES_HISTORY_ERRORS} registry. */
type SalesHistoryErrorCode = keyof typeof SALES_HISTORY_ERRORS;
/** The `details` of a `rights.confirmation_required` body: the version of the wording the portal must show. */
declare const rightsRequiredDetailsSchema: z27.ZodObject<{
	wordingVersion: z27.ZodNumber;
}, z27.core.$strict>;
/** The `details` of a `rights.confirmation_required` body. */
type RightsRequiredDetails = z27.infer<typeof rightsRequiredDetailsSchema>;
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
import { z as z28 } from "zod";
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
declare const copilotSettingsSchema: z28.ZodObject<{
	enabled: z28.ZodBoolean;
	minMoments: z28.ZodNumber;
	minDeals: z28.ZodNumber;
	updatedAt: z28.ZodNullable<z28.ZodISODateTime>;
	updatedBy: z28.ZodNullable<z28.core.$ZodBranded<z28.ZodString, "mem", "out">>;
}, z28.core.$strict>;
/** The Copilot settings of an Organization. */
type CopilotSettings = z28.infer<typeof copilotSettingsSchema>;
/**
* The body of a request to set the Copilot settings; it replaces them, so a repeat of the same
* body changes nothing. A `minDeals` above `minMoments`, or a minimum outside 1 to 20, is refused
* by the service as `copilot.min_evidence_invalid`.
*/
declare const setCopilotSettingsRequestSchema: z28.ZodObject<{
	enabled: z28.ZodBoolean;
	minMoments: z28.ZodNumber;
	minDeals: z28.ZodNumber;
}, z28.core.$strict>;
/** The body of a request to set the Copilot settings. */
type SetCopilotSettingsRequest = z28.infer<typeof setCopilotSettingsRequestSchema>;
import { z as z29 } from "zod";
/** The longest id of a stream message, in characters. */
declare const MAX_COPILOT_STREAM_ID_LENGTH = 64;
/**
* The id of a message in a Call's stream, sent as the SSE `id:` line and read back from the
* `Last-Event-ID` header to resume. It is opaque to the client and only ever made of these
* characters, so it cannot carry a line break into the frame.
*/
declare const copilotStreamIdSchema: z29.ZodString;
/** The headers of a request to open the stream; header names arrive lower-cased. `Last-Event-ID` resumes after that message from what is stored. */
declare const copilotStreamHeadersSchema: z29.ZodObject<{
	"last-event-id": z29.ZodOptional<z29.ZodString>;
}, z29.core.$strip>;
/** The states of the Copilot on a Call, as the stream says them. */
declare const COPILOT_STREAM_STATES: readonly ["waiting_for_disclosure", "live", "ended"];
/** The state of the Copilot on a Call. */
declare const copilotStreamStateSchema: z29.ZodEnum<{
	ended: "ended";
	live: "live";
	waiting_for_disclosure: "waiting_for_disclosure";
}>;
/** Why the panel is quiet, for a Rep who wonders if it is broken; null when there is nothing to explain. */
declare const COPILOT_QUIET_REASONS: readonly ["not_enough_won_moments", "playbook_unavailable", "transcript_unavailable"];
/** Why the panel shows no cards. */
declare const copilotQuietReasonSchema: z29.ZodEnum<{
	not_enough_won_moments: "not_enough_won_moments";
	playbook_unavailable: "playbook_unavailable";
	transcript_unavailable: "transcript_unavailable";
}>;
/** Why the Transcript stopped: the speech-to-text failed or its stream could not be recovered. The Call itself goes on. */
declare const COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS: readonly ["speech_to_text_failed", "stream_dropped"];
/** `copilot.status`: the state of the Copilot on this Call, and why it is quiet. */
declare const copilotStatusDataSchema: z29.ZodObject<{
	callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
	state: z29.ZodEnum<{
		ended: "ended";
		live: "live";
		waiting_for_disclosure: "waiting_for_disclosure";
	}>;
	quietReason: z29.ZodNullable<z29.ZodEnum<{
		not_enough_won_moments: "not_enough_won_moments";
		playbook_unavailable: "playbook_unavailable";
		transcript_unavailable: "transcript_unavailable";
	}>>;
}, z29.core.$strict>;
/** `transcript.turn`: one final turn of the live Transcript, in order. The text is spoken words: untrusted data, never logged. */
declare const copilotTurnDataSchema: z29.ZodObject<{
	callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
	sequence: z29.ZodNumber;
	turn: z29.ZodObject<{
		speaker: z29.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		startMs: z29.ZodNumber;
		endMs: z29.ZodNumber;
		text: z29.ZodString;
	}, z29.core.$strict>;
}, z29.core.$strict>;
/** `transcript.unavailable`: the live Transcript stopped. The Call and its Recording are not affected. */
declare const copilotTranscriptUnavailableDataSchema: z29.ZodObject<{
	callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
	reason: z29.ZodEnum<{
		speech_to_text_failed: "speech_to_text_failed";
		stream_dropped: "stream_dropped";
	}>;
}, z29.core.$strict>;
/** `copilot.card` and `copilot.card_updated`: a card, whole, as it now stands. A card upgraded in place, rated, dismissed or pinned is sent again under its id. */
declare const copilotCardDataSchema: z29.ZodObject<{
	card: z29.ZodDiscriminatedUnion<[z29.ZodObject<{
		id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		sequence: z29.ZodNumber;
		evidence: z29.ZodObject<{
			moments: z29.ZodNumber;
			deals: z29.ZodNumber;
		}, z29.core.$strict>;
		citedMoments: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
		}, z29.core.$strict>>;
		quotes: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			prospect: z29.ZodString;
			repNext: z29.ZodString;
		}, z29.core.$strict>>;
		shownAt: z29.ZodISODateTime;
		rating: z29.ZodNullable<z29.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z29.ZodBoolean;
		pinned: z29.ZodBoolean;
		kind: z29.ZodLiteral<"similar_moment">;
	}, z29.core.$strict>, z29.ZodObject<{
		id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		sequence: z29.ZodNumber;
		evidence: z29.ZodObject<{
			moments: z29.ZodNumber;
			deals: z29.ZodNumber;
		}, z29.core.$strict>;
		citedMoments: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
		}, z29.core.$strict>>;
		quotes: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			prospect: z29.ZodString;
			repNext: z29.ZodString;
		}, z29.core.$strict>>;
		shownAt: z29.ZodISODateTime;
		rating: z29.ZodNullable<z29.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z29.ZodBoolean;
		pinned: z29.ZodBoolean;
		kind: z29.ZodLiteral<"objection">;
		objectionType: z29.ZodEnum<{
			authority: "authority";
			competitor: "competitor";
			need: "need";
			price: "price";
			timing: "timing";
			trust: "trust";
		}>;
		response: z29.ZodString;
	}, z29.core.$strict>, z29.ZodObject<{
		id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		sequence: z29.ZodNumber;
		evidence: z29.ZodObject<{
			moments: z29.ZodNumber;
			deals: z29.ZodNumber;
		}, z29.core.$strict>;
		citedMoments: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
		}, z29.core.$strict>>;
		quotes: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			prospect: z29.ZodString;
			repNext: z29.ZodString;
		}, z29.core.$strict>>;
		shownAt: z29.ZodISODateTime;
		rating: z29.ZodNullable<z29.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z29.ZodBoolean;
		pinned: z29.ZodBoolean;
		kind: z29.ZodLiteral<"next_step">;
		nextStep: z29.ZodString;
	}, z29.core.$strict>, z29.ZodObject<{
		id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		sequence: z29.ZodNumber;
		evidence: z29.ZodObject<{
			moments: z29.ZodNumber;
			deals: z29.ZodNumber;
		}, z29.core.$strict>;
		citedMoments: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
		}, z29.core.$strict>>;
		quotes: z29.ZodArray<z29.ZodObject<{
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			prospect: z29.ZodString;
			repNext: z29.ZodString;
		}, z29.core.$strict>>;
		shownAt: z29.ZodISODateTime;
		rating: z29.ZodNullable<z29.ZodEnum<{
			not_useful: "not_useful";
			useful: "useful";
		}>>;
		dismissed: z29.ZodBoolean;
		pinned: z29.ZodBoolean;
		kind: z29.ZodLiteral<"document">;
		source: z29.ZodObject<{
			documentId: z29.core.$ZodBranded<z29.ZodString, "doc", "out">;
			page: z29.ZodNullable<z29.ZodNumber>;
			passage: z29.ZodString;
		}, z29.core.$strict>;
	}, z29.core.$strict>], "kind">;
}, z29.core.$strict>;
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
declare const copilotStreamMessageSchema: z29.ZodDiscriminatedUnion<[z29.ZodObject<{
	id: z29.ZodString;
	event: z29.ZodLiteral<"copilot.status">;
	data: z29.ZodObject<{
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		state: z29.ZodEnum<{
			ended: "ended";
			live: "live";
			waiting_for_disclosure: "waiting_for_disclosure";
		}>;
		quietReason: z29.ZodNullable<z29.ZodEnum<{
			not_enough_won_moments: "not_enough_won_moments";
			playbook_unavailable: "playbook_unavailable";
			transcript_unavailable: "transcript_unavailable";
		}>>;
	}, z29.core.$strict>;
}, z29.core.$strict>, z29.ZodObject<{
	id: z29.ZodString;
	event: z29.ZodLiteral<"transcript.turn">;
	data: z29.ZodObject<{
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		sequence: z29.ZodNumber;
		turn: z29.ZodObject<{
			speaker: z29.ZodEnum<{
				prospect: "prospect";
				rep: "rep";
			}>;
			startMs: z29.ZodNumber;
			endMs: z29.ZodNumber;
			text: z29.ZodString;
		}, z29.core.$strict>;
	}, z29.core.$strict>;
}, z29.core.$strict>, z29.ZodObject<{
	id: z29.ZodString;
	event: z29.ZodLiteral<"transcript.unavailable">;
	data: z29.ZodObject<{
		callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
		reason: z29.ZodEnum<{
			speech_to_text_failed: "speech_to_text_failed";
			stream_dropped: "stream_dropped";
		}>;
	}, z29.core.$strict>;
}, z29.core.$strict>, z29.ZodObject<{
	id: z29.ZodString;
	event: z29.ZodLiteral<"copilot.card">;
	data: z29.ZodObject<{
		card: z29.ZodDiscriminatedUnion<[z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"similar_moment">;
		}, z29.core.$strict>, z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"objection">;
			objectionType: z29.ZodEnum<{
				authority: "authority";
				competitor: "competitor";
				need: "need";
				price: "price";
				timing: "timing";
				trust: "trust";
			}>;
			response: z29.ZodString;
		}, z29.core.$strict>, z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"next_step">;
			nextStep: z29.ZodString;
		}, z29.core.$strict>, z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"document">;
			source: z29.ZodObject<{
				documentId: z29.core.$ZodBranded<z29.ZodString, "doc", "out">;
				page: z29.ZodNullable<z29.ZodNumber>;
				passage: z29.ZodString;
			}, z29.core.$strict>;
		}, z29.core.$strict>], "kind">;
	}, z29.core.$strict>;
}, z29.core.$strict>, z29.ZodObject<{
	id: z29.ZodString;
	event: z29.ZodLiteral<"copilot.card_updated">;
	data: z29.ZodObject<{
		card: z29.ZodDiscriminatedUnion<[z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"similar_moment">;
		}, z29.core.$strict>, z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"objection">;
			objectionType: z29.ZodEnum<{
				authority: "authority";
				competitor: "competitor";
				need: "need";
				price: "price";
				timing: "timing";
				trust: "trust";
			}>;
			response: z29.ZodString;
		}, z29.core.$strict>, z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"next_step">;
			nextStep: z29.ZodString;
		}, z29.core.$strict>, z29.ZodObject<{
			id: z29.core.$ZodBranded<z29.ZodString, "ccard", "out">;
			callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
			sequence: z29.ZodNumber;
			evidence: z29.ZodObject<{
				moments: z29.ZodNumber;
				deals: z29.ZodNumber;
			}, z29.core.$strict>;
			citedMoments: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
			}, z29.core.$strict>>;
			quotes: z29.ZodArray<z29.ZodObject<{
				callId: z29.core.$ZodBranded<z29.ZodString, "call", "out">;
				dealRecordId: z29.core.$ZodBranded<z29.ZodString, "deal", "out">;
				prospect: z29.ZodString;
				repNext: z29.ZodString;
			}, z29.core.$strict>>;
			shownAt: z29.ZodISODateTime;
			rating: z29.ZodNullable<z29.ZodEnum<{
				not_useful: "not_useful";
				useful: "useful";
			}>>;
			dismissed: z29.ZodBoolean;
			pinned: z29.ZodBoolean;
			kind: z29.ZodLiteral<"document">;
			source: z29.ZodObject<{
				documentId: z29.core.$ZodBranded<z29.ZodString, "doc", "out">;
				page: z29.ZodNullable<z29.ZodNumber>;
				passage: z29.ZodString;
			}, z29.core.$strict>;
		}, z29.core.$strict>], "kind">;
	}, z29.core.$strict>;
}, z29.core.$strict>], "event">;
/** One message of the stream of a Call. */
type CopilotStreamMessage = z29.infer<typeof copilotStreamMessageSchema>;
/** The name of an event of the stream. */
type CopilotStreamEventName = (typeof COPILOT_STREAM_EVENTS)[number];
/**
* Writes one message as an SSE frame (`id:`, `event:` and `data:` lines and a blank line). The
* message is parsed first and an invalid one throws, so a frame never carries an unbounded or
* malformed field. The data is one line of JSON, which cannot hold a raw line break, so text in a
* Transcript or card cannot end the frame or start another.
*/
declare function formatCopilotStreamFrame(input: CopilotStreamMessage): string;
import { z as z30 } from "zod";
/**
* The kinds of Copilot Card. `similar_moment` and `document` are built from retrieval alone, with
* no model call. `objection` and `next_step` are what a retrieval card is upgraded into, in place,
* by the model composer, which sees only the retrieved Moments.
*/
declare const COPILOT_CARD_KINDS: readonly ["similar_moment", "objection", "next_step", "document"];
/** The kind of a Copilot Card. */
declare const copilotCardKindSchema: z30.ZodEnum<{
	document: "document";
	next_step: "next_step";
	objection: "objection";
	similar_moment: "similar_moment";
}>;
/** The kind of a Copilot Card. */
type CopilotCardKind = z30.infer<typeof copilotCardKindSchema>;
/** The kinds a model composes (the rest are built from retrieval alone). */
declare const COPILOT_COMPOSED_KINDS: readonly ["objection", "next_step"];
/** The closed taxonomy of an objection a Copilot Card names. */
declare const COPILOT_OBJECTION_TYPES: readonly ["price", "timing", "competitor", "authority", "need", "trust"];
/** The type of an objection. */
declare const copilotObjectionTypeSchema: z30.ZodEnum<{
	authority: "authority";
	competitor: "competitor";
	need: "need";
	price: "price";
	timing: "timing";
	trust: "trust";
}>;
/** The type of an objection. */
type CopilotObjectionType = z30.infer<typeof copilotObjectionTypeSchema>;
/** How a Rep rated a card. A card with no rating has `null`. */
declare const COPILOT_RATINGS: readonly ["useful", "not_useful"];
/** How a Rep rated a card. */
declare const copilotRatingSchema: z30.ZodEnum<{
	not_useful: "not_useful";
	useful: "useful";
}>;
/** How a Rep rated a card. */
type CopilotRating = z30.infer<typeof copilotRatingSchema>;
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
declare function copilotTextSchema(max: number): z30.ZodString;
/** The model-composed text of a card: untrusted model output, at most {@link MAX_COPILOT_CARD_TEXT_LENGTH} characters. */
declare const copilotCardTextSchema: z30.ZodString;
/** One quote of a Moment: what the Prospect said or what the Rep said next. Tenant Transcript text, untrusted, never logged. */
declare const copilotQuoteTextSchema: z30.ZodString;
/**
* A Moment a card cites. The Playbook gives a Moment no id of its own yet; its search names one by
* the opaque Call and Deal record it comes from, and so does a citation. Both ids already exist in
* the contract and neither carries the customer's own Deal identifier.
*/
declare const copilotMomentRefSchema: z30.ZodObject<{
	callId: z30.core.$ZodBranded<z30.ZodString, "call", "out">;
	dealRecordId: z30.core.$ZodBranded<z30.ZodString, "deal", "out">;
}, z30.core.$strict>;
/** A Moment a card cites. */
type CopilotMomentRef = z30.infer<typeof copilotMomentRefSchema>;
/** The Evidence behind a card: the similar Moments and the distinct won Deals among them. At least one of each, and never more Deals than Moments. */
declare const copilotEvidenceSchema: z30.ZodObject<{
	moments: z30.ZodNumber;
	deals: z30.ZodNumber;
}, z30.core.$strict>;
/** The Evidence behind a card. */
type CopilotEvidence = z30.infer<typeof copilotEvidenceSchema>;
/** The key of a Moment reference, to compare two. */
declare const copilotMomentKey: (ref: CopilotMomentRef) => string;
import { z as z31 } from "zod";
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
declare const internalCreateOrganizationRequestSchema: z31.ZodObject<{
	userId: z31.core.$ZodBranded<z31.ZodString, "usr", "out">;
	organizationName: z31.ZodPipe<z31.ZodString, z31.ZodString>;
	email: z31.ZodOptional<z31.ZodPipe<z31.ZodPipe<z31.ZodString, z31.ZodTransform<string, string>>, z31.ZodString>>;
	name: z31.ZodOptional<z31.ZodNullable<z31.ZodPipe<z31.ZodString, z31.ZodString>>>;
}, z31.core.$strict>;
/** Internal: the body of a sign-up that creates an Organization. */
type InternalCreateOrganizationRequest = z31.infer<typeof internalCreateOrganizationRequestSchema>;
/** Internal: the answer to creating an Organization at sign-up; the role is always `owner`. */
declare const internalCreateOrganizationResponseSchema: z31.ZodObject<{
	organizationId: z31.core.$ZodBranded<z31.ZodString, "org", "out">;
	role: z31.ZodLiteral<"owner">;
}, z31.core.$strip>;
/** Internal: the answer to creating an Organization at sign-up. */
type InternalCreateOrganizationResponse = z31.infer<typeof internalCreateOrganizationResponseSchema>;
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
declare const internalAcceptInvitationRequestSchema: z31.ZodObject<{
	userId: z31.core.$ZodBranded<z31.ZodString, "usr", "out">;
	email: z31.ZodPipe<z31.ZodPipe<z31.ZodString, z31.ZodTransform<string, string>>, z31.ZodString>;
	name: z31.ZodOptional<z31.ZodNullable<z31.ZodPipe<z31.ZodString, z31.ZodString>>>;
	invitationToken: z31.ZodString;
}, z31.core.$strict>;
/** Internal: the body of a sign-up that accepts an Invitation. */
type InternalAcceptInvitationRequest = z31.infer<typeof internalAcceptInvitationRequestSchema>;
/** Internal: the answer to accepting an Invitation; the role is the one offered, never `owner`. */
declare const internalAcceptInvitationResponseSchema: z31.ZodObject<{
	organizationId: z31.core.$ZodBranded<z31.ZodString, "org", "out">;
	role: z31.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
}, z31.core.$strip>;
/** Internal: the answer to accepting an Invitation. */
type InternalAcceptInvitationResponse = z31.infer<typeof internalAcceptInvitationResponseSchema>;
/** Internal: the request for the membership of one user, which the token hook makes before issuing a token. */
declare const internalMembershipRequestSchema: z31.ZodObject<{
	userId: z31.core.$ZodBranded<z31.ZodString, "usr", "out">;
}, z31.core.$strict>;
/** Internal: the request for the membership of one user. */
type InternalMembershipRequest = z31.infer<typeof internalMembershipRequestSchema>;
/**
* Internal: the membership of a user, or `{ found: false }` for a user with none. A user with an
* Organization that is suspended or deleted is found: the token hook decides what to do with the
* status. The lookup returns no domain error.
*/
declare const internalMembershipResponseSchema: z31.ZodDiscriminatedUnion<[z31.ZodObject<{
	found: z31.ZodLiteral<true>;
	organizationId: z31.core.$ZodBranded<z31.ZodString, "org", "out">;
	role: z31.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	organizationStatus: z31.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
}, z31.core.$strip>, z31.ZodObject<{
	found: z31.ZodLiteral<false>;
}, z31.core.$strip>], "found">;
/** Internal: the membership of a user, or none. */
type InternalMembershipResponse = z31.infer<typeof internalMembershipResponseSchema>;
/** Internal: the path parameters of a profile change; the user is in the path, not the body. */
declare const internalUpdateMemberProfileParamsSchema: z31.ZodObject<{
	userId: z31.core.$ZodBranded<z31.ZodString, "usr", "out">;
}, z31.core.$strict>;
/** Internal: the path parameters of a profile change. */
type InternalUpdateMemberProfileParams = z31.infer<typeof internalUpdateMemberProfileParamsSchema>;
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
declare const internalUpdateMemberProfileRequestSchema: z31.ZodObject<{
	email: z31.ZodOptional<z31.ZodPipe<z31.ZodPipe<z31.ZodString, z31.ZodTransform<string, string>>, z31.ZodString>>;
	name: z31.ZodOptional<z31.ZodNullable<z31.ZodPipe<z31.ZodString, z31.ZodString>>>;
}, z31.core.$strict>;
/** Internal: the body of a profile change. */
type InternalUpdateMemberProfileRequest = z31.infer<typeof internalUpdateMemberProfileRequestSchema>;
/** Internal: the answer to a profile change: the address and name core now holds for the user. */
declare const internalUpdateMemberProfileResponseSchema: z31.ZodObject<{
	userId: z31.core.$ZodBranded<z31.ZodString, "usr", "out">;
	email: z31.ZodPipe<z31.ZodPipe<z31.ZodString, z31.ZodTransform<string, string>>, z31.ZodString>;
	name: z31.ZodNullable<z31.ZodString>;
}, z31.core.$strip>;
/** Internal: the answer to a profile change. */
type InternalUpdateMemberProfileResponse = z31.infer<typeof internalUpdateMemberProfileResponseSchema>;
/** The hours after creation during which an Organization can be abandoned. */
declare const ABANDON_MAX_AGE_HOURS = 24;
/** Internal: the path parameters of an abandon; the Organization is named in the path. */
declare const internalAbandonOrganizationParamsSchema: z31.ZodObject<{
	organizationId: z31.core.$ZodBranded<z31.ZodString, "org", "out">;
}, z31.core.$strict>;
/** Internal: the path parameters of an abandon. */
type InternalAbandonOrganizationParams = z31.infer<typeof internalAbandonOrganizationParamsSchema>;
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
declare const internalAbandonOrganizationRequestSchema: z31.ZodObject<{
	userId: z31.core.$ZodBranded<z31.ZodString, "usr", "out">;
}, z31.core.$strict>;
/** Internal: the body of an abandon. */
type InternalAbandonOrganizationRequest = z31.infer<typeof internalAbandonOrganizationRequestSchema>;
/**
* Internal: the answer to an abandon: always `deleted`, whether this call, an earlier one or
* nobody ever created the Organization. A retry cannot be told from the original.
*/
declare const internalAbandonOrganizationResponseSchema: z31.ZodObject<{
	organizationId: z31.core.$ZodBranded<z31.ZodString, "org", "out">;
	status: z31.ZodLiteral<"deleted">;
}, z31.core.$strip>;
/** Internal: the answer to an abandon. */
type InternalAbandonOrganizationResponse = z31.infer<typeof internalAbandonOrganizationResponseSchema>;
import { z as z32 } from "zod";
/**
* An Invitation as core returns it. The raw token is not here and never will be: it is delivered
* by email only, so a response cannot leak it.
*/
declare const invitationSchema: z32.ZodObject<{
	id: z32.core.$ZodBranded<z32.ZodString, "inv", "out">;
	email: z32.ZodPipe<z32.ZodPipe<z32.ZodString, z32.ZodTransform<string, string>>, z32.ZodString>;
	role: z32.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z32.ZodNullable<z32.core.$ZodBranded<z32.ZodString, "team", "out">>;
	state: z32.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>;
	invitedByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
	expiresAt: z32.ZodISODateTime;
	createdAt: z32.ZodISODateTime;
}, z32.core.$strip>;
/** An Invitation as core returns it. */
type Invitation = z32.infer<typeof invitationSchema>;
/**
* The body of a request to invite someone: an address and a role that is never `owner`. The call
* accepts an `Idempotency-Key` header (`idempotencyKeySchema`): a replay returns the original
* Invitation instead of `invitation.already_pending`, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`.
*/
declare const createInvitationRequestSchema: z32.ZodObject<{
	email: z32.ZodPipe<z32.ZodPipe<z32.ZodString, z32.ZodTransform<string, string>>, z32.ZodString>;
	role: z32.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z32.ZodOptional<z32.core.$ZodBranded<z32.ZodString, "team", "out">>;
}, z32.core.$strict>;
/**
* Every error code `POST /v1/invitations` may answer with. `invitation.already_pending` and
* `invitation.already_member` (409) are about the address; `invitation.pending_limit` (409, 1,000
* pending) and `invitation.daily_limit` (429, 2,000 in 24 hours, with `details.retryAfter` and a
* `Retry-After` header) are the Organization-wide limits; `rate.limited` is only the per-request
* rate. `team.not_found` is a `teamId` that is not a Team of this Organization.
*/
declare const CREATE_INVITATION_ERROR_CODES: readonly ["invitation.already_pending", "invitation.already_member", "invitation.pending_limit", "invitation.daily_limit", "team.not_found", "request.invalid", "request.idempotency_key_reused", "request.idempotency_in_progress", "auth.unauthenticated", "auth.token_expired", "auth.token_invalid", "auth.forbidden", "auth.unavailable", "organization.suspended", "organization.deleted", "rate.limited"];
/** The body of a request to invite someone. */
type CreateInvitationRequest = z32.infer<typeof createInvitationRequestSchema>;
/**
* The query parameters of a request to list Invitations: a page, and the `state` to list, which
* is `pending` unless asked otherwise. An unknown parameter is rejected.
*/
declare const listInvitationsQuerySchema: z32.ZodObject<{
	cursor: z32.ZodOptional<z32.ZodString>;
	limit: z32.ZodDefault<z32.ZodPipe<z32.ZodPipe<z32.ZodUnion<readonly [z32.ZodNumber, z32.ZodString]>, z32.ZodTransform<number, string | number>>, z32.ZodNumber>>;
	state: z32.ZodDefault<z32.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>>;
}, z32.core.$strict>;
/** The query parameters of a request to list Invitations. */
type ListInvitationsQuery = z32.infer<typeof listInvitationsQuerySchema>;
/** One page of Invitations. */
declare const listInvitationsResponseSchema: z32.ZodObject<{
	items: z32.ZodArray<z32.ZodObject<{
		id: z32.core.$ZodBranded<z32.ZodString, "inv", "out">;
		email: z32.ZodPipe<z32.ZodPipe<z32.ZodString, z32.ZodTransform<string, string>>, z32.ZodString>;
		role: z32.ZodEnum<{
			admin: "admin";
			manager: "manager";
			rep: "rep";
		}>;
		teamId: z32.ZodNullable<z32.core.$ZodBranded<z32.ZodString, "team", "out">>;
		state: z32.ZodEnum<{
			accepted: "accepted";
			pending: "pending";
			revoked: "revoked";
		}>;
		invitedByUserId: z32.core.$ZodBranded<z32.ZodString, "usr", "out">;
		expiresAt: z32.ZodISODateTime;
		createdAt: z32.ZodISODateTime;
	}, z32.core.$strip>>;
	nextCursor: z32.ZodNullable<z32.ZodString>;
}, z32.core.$strip>;
/** One page of Invitations. */
type ListInvitationsResponse = z32.infer<typeof listInvitationsResponseSchema>;
/** The path parameters of a request about one Invitation, such as revoking it. */
declare const invitationParamsSchema: z32.ZodObject<{
	invitationId: z32.core.$ZodBranded<z32.ZodString, "inv", "out">;
}, z32.core.$strict>;
/** The path parameters of a request about one Invitation. */
type InvitationParams = z32.infer<typeof invitationParamsSchema>;
import { z as z33 } from "zod";
/**
* A member of the caller's Organization: a user's Membership and the role it holds. `email` and
* `name` are core's copy of what the auth service holds for the person: given at sign-up and kept
* current by the internal profile change. `name` is the display name auth composes from the first
* and last names, and is `null` when the person gave neither at sign-up (both are optional
* there). Neither is a search key or a filter in this version.
*/
declare const memberSchema: z33.ZodObject<{
	id: z33.core.$ZodBranded<z33.ZodString, "mem", "out">;
	userId: z33.core.$ZodBranded<z33.ZodString, "usr", "out">;
	email: z33.ZodPipe<z33.ZodPipe<z33.ZodString, z33.ZodTransform<string, string>>, z33.ZodString>;
	name: z33.ZodNullable<z33.ZodString>;
	role: z33.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	createdAt: z33.ZodISODateTime;
	updatedAt: z33.ZodISODateTime;
}, z33.core.$strip>;
/** A member of an Organization. */
type Member = z33.infer<typeof memberSchema>;
/**
* The least privileged role that may list the Organization's members (`GET /v1/members`): Owner,
* Admin and Manager (see `roleAtLeast`). Anyone who sees member emails needs at least this role.
*/
declare const LIST_MEMBERS_MIN_ROLE: "manager";
/** The query parameters of a request to list members: a cursor and a limit of at most the maximum page size. */
declare const listMembersQuerySchema: z33.ZodObject<{
	cursor: z33.ZodOptional<z33.ZodString>;
	limit: z33.ZodDefault<z33.ZodPipe<z33.ZodPipe<z33.ZodUnion<readonly [z33.ZodNumber, z33.ZodString]>, z33.ZodTransform<number, string | number>>, z33.ZodNumber>>;
}, z33.core.$strict>;
/** The query parameters of a request to list members. */
type ListMembersQuery = z33.infer<typeof listMembersQuerySchema>;
/** One page of members. */
declare const listMembersResponseSchema: z33.ZodObject<{
	items: z33.ZodArray<z33.ZodObject<{
		id: z33.core.$ZodBranded<z33.ZodString, "mem", "out">;
		userId: z33.core.$ZodBranded<z33.ZodString, "usr", "out">;
		email: z33.ZodPipe<z33.ZodPipe<z33.ZodString, z33.ZodTransform<string, string>>, z33.ZodString>;
		name: z33.ZodNullable<z33.ZodString>;
		role: z33.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z33.ZodISODateTime;
		updatedAt: z33.ZodISODateTime;
	}, z33.core.$strip>>;
	nextCursor: z33.ZodNullable<z33.ZodString>;
}, z33.core.$strip>;
/** One page of members. */
type ListMembersResponse = z33.infer<typeof listMembersResponseSchema>;
/** The path parameters of a request about one member. */
declare const memberParamsSchema: z33.ZodObject<{
	membershipId: z33.core.$ZodBranded<z33.ZodString, "mem", "out">;
}, z33.core.$strict>;
/** The path parameters of a request about one member. */
type MemberParams = z33.infer<typeof memberParamsSchema>;
/** The body of a request to change a member's role; promoting to `owner` is how ownership passes. */
declare const changeMemberRoleRequestSchema: z33.ZodObject<{
	role: z33.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
}, z33.core.$strict>;
/** The body of a request to change a member's role. */
type ChangeMemberRoleRequest = z33.infer<typeof changeMemberRoleRequestSchema>;
import { z as z34 } from "zod";
/** An Organization as core returns it, for both reading it and renaming it. */
declare const organizationSchema: z34.ZodObject<{
	id: z34.core.$ZodBranded<z34.ZodString, "org", "out">;
	name: z34.ZodString;
	region: z34.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	status: z34.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
	createdAt: z34.ZodISODateTime;
	updatedAt: z34.ZodISODateTime;
}, z34.core.$strip>;
/** An Organization as core returns it. */
type Organization = z34.infer<typeof organizationSchema>;
/** The body of a request to rename the caller's Organization. */
declare const renameOrganizationRequestSchema: z34.ZodObject<{
	name: z34.ZodPipe<z34.ZodString, z34.ZodString>;
}, z34.core.$strict>;
/** The body of a request to rename the caller's Organization. */
type RenameOrganizationRequest = z34.infer<typeof renameOrganizationRequestSchema>;
import { z as z35 } from "zod";
/** A Team as core returns it. */
declare const teamSchema: z35.ZodObject<{
	id: z35.core.$ZodBranded<z35.ZodString, "team", "out">;
	name: z35.ZodString;
	createdAt: z35.ZodISODateTime;
	updatedAt: z35.ZodISODateTime;
}, z35.core.$strip>;
/** A Team as core returns it. */
type Team = z35.infer<typeof teamSchema>;
/**
* The body of a request to create a Team. The call accepts an `Idempotency-Key` header
* (`idempotencyKeySchema`): a replay returns the original Team, the same key with a different
* body is `request.idempotency_key_reused`, and the same key while the first request is still
* running is `request.idempotency_in_progress`.
*/
declare const createTeamRequestSchema: z35.ZodObject<{
	name: z35.ZodPipe<z35.ZodString, z35.ZodString>;
}, z35.core.$strict>;
/** The body of a request to create a Team. */
type CreateTeamRequest = z35.infer<typeof createTeamRequestSchema>;
/** The body of a request to rename a Team. */
declare const renameTeamRequestSchema: z35.ZodObject<{
	name: z35.ZodPipe<z35.ZodString, z35.ZodString>;
}, z35.core.$strict>;
/** The body of a request to rename a Team. */
type RenameTeamRequest = z35.infer<typeof renameTeamRequestSchema>;
/** The query parameters of a request to list Teams. */
declare const listTeamsQuerySchema: z35.ZodObject<{
	cursor: z35.ZodOptional<z35.ZodString>;
	limit: z35.ZodDefault<z35.ZodPipe<z35.ZodPipe<z35.ZodUnion<readonly [z35.ZodNumber, z35.ZodString]>, z35.ZodTransform<number, string | number>>, z35.ZodNumber>>;
}, z35.core.$strict>;
/** The query parameters of a request to list Teams. */
type ListTeamsQuery = z35.infer<typeof listTeamsQuerySchema>;
/** One page of Teams. */
declare const listTeamsResponseSchema: z35.ZodObject<{
	items: z35.ZodArray<z35.ZodObject<{
		id: z35.core.$ZodBranded<z35.ZodString, "team", "out">;
		name: z35.ZodString;
		createdAt: z35.ZodISODateTime;
		updatedAt: z35.ZodISODateTime;
	}, z35.core.$strip>>;
	nextCursor: z35.ZodNullable<z35.ZodString>;
}, z35.core.$strip>;
/** One page of Teams. */
type ListTeamsResponse = z35.infer<typeof listTeamsResponseSchema>;
/** The path parameters of a request about one Team, such as renaming or deleting it. */
declare const teamParamsSchema: z35.ZodObject<{
	teamId: z35.core.$ZodBranded<z35.ZodString, "team", "out">;
}, z35.core.$strict>;
/** The path parameters of a request about one Team. */
type TeamParams = z35.infer<typeof teamParamsSchema>;
/** The body of a request to add a member to a Team. */
declare const addTeamMemberRequestSchema: z35.ZodObject<{
	membershipId: z35.core.$ZodBranded<z35.ZodString, "mem", "out">;
}, z35.core.$strict>;
/** The body of a request to add a member to a Team. */
type AddTeamMemberRequest = z35.infer<typeof addTeamMemberRequestSchema>;
/** A member's place in a Team, as core returns it after adding one. */
declare const teamMemberSchema: z35.ZodObject<{
	teamId: z35.core.$ZodBranded<z35.ZodString, "team", "out">;
	membershipId: z35.core.$ZodBranded<z35.ZodString, "mem", "out">;
	createdAt: z35.ZodISODateTime;
}, z35.core.$strip>;
/** A member's place in a Team. */
type TeamMember = z35.infer<typeof teamMemberSchema>;
/** The path parameters of a request to remove a member from a Team. */
declare const teamMemberParamsSchema: z35.ZodObject<{
	teamId: z35.core.$ZodBranded<z35.ZodString, "team", "out">;
	membershipId: z35.core.$ZodBranded<z35.ZodString, "mem", "out">;
}, z35.core.$strict>;
/** The path parameters of a request to remove a member from a Team. */
type TeamMemberParams = z35.infer<typeof teamMemberParamsSchema>;
/** The query parameters of a request to list a Team's members: a cursor and a limit of at most the maximum page size. */
declare const listTeamMembersQuerySchema: z35.ZodObject<{
	cursor: z35.ZodOptional<z35.ZodString>;
	limit: z35.ZodDefault<z35.ZodPipe<z35.ZodPipe<z35.ZodUnion<readonly [z35.ZodNumber, z35.ZodString]>, z35.ZodTransform<number, string | number>>, z35.ZodNumber>>;
}, z35.core.$strict>;
/** The query parameters of a request to list a Team's members. */
type ListTeamMembersQuery = z35.infer<typeof listTeamMembersQuerySchema>;
/**
* One page of a Team's members, for `GET /v1/teams/{teamId}/members` (path parameters
* `teamParamsSchema`). Each item is a member exactly as the Organization's members list returns it.
*/
declare const listTeamMembersResponseSchema: z35.ZodObject<{
	items: z35.ZodArray<z35.ZodObject<{
		id: z35.core.$ZodBranded<z35.ZodString, "mem", "out">;
		userId: z35.core.$ZodBranded<z35.ZodString, "usr", "out">;
		email: z35.ZodPipe<z35.ZodPipe<z35.ZodString, z35.ZodTransform<string, string>>, z35.ZodString>;
		name: z35.ZodNullable<z35.ZodString>;
		role: z35.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z35.ZodISODateTime;
		updatedAt: z35.ZodISODateTime;
	}, z35.core.$strip>>;
	nextCursor: z35.ZodNullable<z35.ZodString>;
}, z35.core.$strip>;
/** One page of a Team's members. */
type ListTeamMembersResponse = z35.infer<typeof listTeamMembersResponseSchema>;
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
import { z as z36 } from "zod";
/** The longest Organization or Team name, in characters; the same bound as the database check. */
declare const MAX_NAME_LENGTH = 200;
/**
* An Organization's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no
* lone surrogate) and no control characters. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const organizationNameSchema: z36.ZodPipe<z36.ZodString, z36.ZodString>;
/**
* A Team's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no lone
* surrogate) and no control characters. Zero-width and direction-override characters are allowed,
* so display code must treat a name as untrusted text.
*/
declare const teamNameSchema: z36.ZodPipe<z36.ZodString, z36.ZodString>;
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
declare const personNameSchema: z36.ZodPipe<z36.ZodString, z36.ZodString>;
/**
* A name as a response carries it: any 1 to 1000 character string. The database bounds the length
* of the name after trimming spaces, so a stored name may carry surrounding spaces and run past
* 200; the response form is loose enough for anything the database allows. Core writes only the
* trimmed output of the request schemas. Display code must treat a name as untrusted text.
*/
declare const storedNameSchema: z36.ZodString;
/** The states an Invitation is in; "expired" is not a state, it is read from `expiresAt`. */
declare const INVITATION_STATES: readonly ["pending", "accepted", "revoked"];
/** The state of an Invitation. */
declare const invitationStateSchema: z36.ZodEnum<{
	accepted: "accepted";
	pending: "pending";
	revoked: "revoked";
}>;
/** The state of an Invitation. */
type InvitationState = z36.infer<typeof invitationStateSchema>;
/** A point in time as an ISO 8601 string with an offset, as every response carries it. */
declare const timestampSchema: z36.ZodISODateTime;
/**
* The raw token of an Invitation: 22 to 256 URL-safe characters (128 bits or more). It exists in
* the email sent to the invitee and in the sign-up call to core, never in a response.
*/
declare const invitationTokenSchema: z36.ZodString;
/**
* The `details` of an error answered with a `Retry-After` header: how many whole seconds to wait,
* the same number as the header. Used by `invitation.daily_limit`.
*/
declare const retryAfterDetailsSchema: z36.ZodObject<{
	retryAfter: z36.ZodNumber;
}, z36.core.$strict>;
/** The `details` of an error answered with a `Retry-After` header. */
type RetryAfterDetails = z36.infer<typeof retryAfterDetailsSchema>;
/**
* The header that carries an idempotency key on a call that has effects. Every public POST accepts
* it too: a replay returns the original result, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`, answered with `details.retryAfter` in seconds and a
* `Retry-After` header, as a rate-limited call is.
*/
declare const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
/** The value of the {@link IDEMPOTENCY_KEY_HEADER} header: 16 to 128 characters from `A-Za-z0-9_.:-`, such as a UUID. */
declare const idempotencyKeySchema: z36.ZodString;
/** An idempotency key. */
type IdempotencyKey = z36.infer<typeof idempotencyKeySchema>;
import { z as z37 } from "zod";
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
declare const emailSchema: z37.ZodPipe<z37.ZodPipe<z37.ZodString, z37.ZodTransform<string, string>>, z37.ZodString>;
/** An email address, folded to lower case. */
type Email = z37.output<typeof emailSchema>;
import { z as z38 } from "zod";
/** An event type in `area.event_name` or `area.subject.event_name` form, such as `team.created` or `voice.call.started`. */
declare const eventTypeSchema: z38.ZodString;
/** An event type. */
type EventType = z38.infer<typeof eventTypeSchema>;
/** The envelope every event shares, wrapping a payload validated by `dataSchema`. */
declare function eventEnvelopeSchema<D extends z38.ZodType>(dataSchema: D): z38.ZodObject<{
	id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
	type: z38.ZodString;
	version: z38.ZodNumber;
	occurredAt: z38.ZodISODateTime;
	organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
	region: z38.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	data: D;
}, z38.core.$strip>;
/** Declares one event type at one version; its schema accepts only that type and version. */
declare function defineEvent<
	const T extends string,
	const V extends number,
	D extends z38.ZodType
>(type: T, version: V, dataSchema: D): {
	type: T;
	version: V;
	schema: z38.ZodObject<{
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	}, z38.core.$strip>;
	/** Parses an envelope of this type and version; throws a ZodError for anything else. */
	parse: (input: unknown) => ({
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z38.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z38.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never;
	/** Parses without throwing. Queue consumers use this, so a malformed message is a result to handle, not an exception to retry. */
	safeParse: (input: unknown) => z38.ZodSafeParseResult<({
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z38.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z38.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z38.core.$ZodBranded<z38.ZodString, "evt", "out">;
		occurredAt: z38.ZodISODateTime;
		organizationId: z38.core.$ZodBranded<z38.ZodString, "org", "out">;
		region: z38.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z38.ZodLiteral<T>;
		version: z38.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never>;
};
import { z as z39 } from "zod";
/** An id string branded with its prefix, so ids of different kinds cannot be mixed up. */
type Id<Prefix extends string> = string & z39.core.$brand<Prefix>;
/** An id for one prefix: `<prefix>_<32 lowercase hex characters>`, branded with the prefix. */
declare function idSchema<const Prefix extends string>(prefix: Prefix): PropertyKey extends Prefix ? z39.ZodString : z39.core.$ZodBranded<z39.ZodString, Prefix, "out">;
/** The id of an Organization (`org_…`). */
declare const organizationIdSchema: z39.core.$ZodBranded<z39.ZodString, "org", "out">;
/** The id of a user (`usr_…`). */
declare const userIdSchema: z39.core.$ZodBranded<z39.ZodString, "usr", "out">;
/** The id of a membership of a user in an Organization (`mem_…`). */
declare const membershipIdSchema: z39.core.$ZodBranded<z39.ZodString, "mem", "out">;
/** The id of a Team (`team_…`). */
declare const teamIdSchema: z39.core.$ZodBranded<z39.ZodString, "team", "out">;
/** The id of an Invitation to join an Organization (`inv_…`). */
declare const invitationIdSchema: z39.core.$ZodBranded<z39.ZodString, "inv", "out">;
/** The id of a Prospect (`prs_…`). */
declare const prospectIdSchema: z39.core.$ZodBranded<z39.ZodString, "prs", "out">;
/** The id of a Prospect Company (`pco_…`). */
declare const prospectCompanyIdSchema: z39.core.$ZodBranded<z39.ZodString, "pco", "out">;
/** The id of a Prospect import (`pimp_…`). */
declare const prospectImportIdSchema: z39.core.$ZodBranded<z39.ZodString, "pimp", "out">;
/** The id of a Prospect merge record (`pmrg_…`). */
declare const prospectMergeIdSchema: z39.core.$ZodBranded<z39.ZodString, "pmrg", "out">;
/** The id of a consent event in the ledger (`cev_…`). */
declare const consentEventIdSchema: z39.core.$ZodBranded<z39.ZodString, "cev", "out">;
/** The id of a Consent Wording version (`cwd_…`). */
declare const consentWordingIdSchema: z39.core.$ZodBranded<z39.ZodString, "cwd", "out">;
/** The id of a Suppression entry (`sup_…`). */
declare const suppressionEntryIdSchema: z39.core.$ZodBranded<z39.ZodString, "sup", "out">;
/** The id of a hosted consent form (`cfm_…`). */
declare const consentFormIdSchema: z39.core.$ZodBranded<z39.ZodString, "cfm", "out">;
/** The id of one Contact Check, as its audit row is named (`chk_…`). */
declare const contactCheckIdSchema: z39.core.$ZodBranded<z39.ZodString, "chk", "out">;
/** The id of a Suppression import (`simp_…`). */
declare const suppressionImportIdSchema: z39.core.$ZodBranded<z39.ZodString, "simp", "out">;
/** The id of a Playbook document (`doc_…`). */
declare const documentIdSchema: z39.core.$ZodBranded<z39.ZodString, "doc", "out">;
/** The opaque id of a Deal record (`deal_…`), used in every URL path; the customer's own deal id never travels in a path. */
declare const dealRecordIdSchema: z39.core.$ZodBranded<z39.ZodString, "deal", "out">;
/** The id of a Call (`call_…`). */
declare const callIdSchema: z39.core.$ZodBranded<z39.ZodString, "call", "out">;
/** The id of a Copilot Card (`ccard_…`), one piece of advice shown to a Rep during a Call. */
declare const copilotCardIdSchema: z39.core.$ZodBranded<z39.ZodString, "ccard", "out">;
/** The id of a Line (`line_…`), a phone number an Organization uses to place and receive Calls. */
declare const lineIdSchema: z39.core.$ZodBranded<z39.ZodString, "line", "out">;
/** The id of a Deal import (`dimp_…`). */
declare const dealImportIdSchema: z39.core.$ZodBranded<z39.ZodString, "dimp", "out">;
/** The id of an event (`evt_…`). */
declare const eventIdSchema: z39.core.$ZodBranded<z39.ZodString, "evt", "out">;
/** The id of a request, for tracing (`req_…`). */
declare const requestIdSchema: z39.core.$ZodBranded<z39.ZodString, "req", "out">;
/** The id of a Demo Request (`dreq_…`), a Visitor's submitted wish to see Closeline. */
declare const demoRequestIdSchema: z39.core.$ZodBranded<z39.ZodString, "dreq", "out">;
/** The id of a Booking (`bkg_…`), a time reserved on a Rep's calendar for a Prospect. */
declare const bookingIdSchema: z39.core.$ZodBranded<z39.ZodString, "bkg", "out">;
/** The id of a Booking Type (`bkt_…`), a named kind of Booking with a length, buffers and mode. */
declare const bookingTypeIdSchema: z39.core.$ZodBranded<z39.ZodString, "bkt", "out">;
/** The id of a Routing Rule (`rrl_…`). */
declare const routingRuleIdSchema: z39.core.$ZodBranded<z39.ZodString, "rrl", "out">;
/** The id of a stored routing decision (`rdc_…`): which rule picked which Rep, and who was skipped. */
declare const routingDecisionIdSchema: z39.core.$ZodBranded<z39.ZodString, "rdc", "out">;
/** The id of an Inquiry (`inq_…`): a Prospect's request, through a form, a Chat or a Call, to talk to the Organization. */
declare const inquiryIdSchema: z39.core.$ZodBranded<z39.ZodString, "inq", "out">;
/** The id of a Qualification question (`qst_…`). */
declare const qualificationQuestionIdSchema: z39.core.$ZodBranded<z39.ZodString, "qst", "out">;
/** The id of a Chat (`cht_…`): a text conversation between a Prospect and the Inbound Agent on a website. */
declare const chatIdSchema: z39.core.$ZodBranded<z39.ZodString, "cht", "out">;
/** The id of a Handoff (`hof_…`): a live Call or Chat passed from the Inbound Agent to a Rep. */
declare const handoffIdSchema: z39.core.$ZodBranded<z39.ZodString, "hof", "out">;
/** The id of a text session an Admin uses to try the Inbound Agent before it speaks to anyone (`try_…`). */
declare const trySessionIdSchema: z39.core.$ZodBranded<z39.ZodString, "try", "out">;
/** The id of a Conversation (`cnv_…`): all Messages between one Prospect and an Organization on one channel. */
declare const conversationIdSchema: z39.core.$ZodBranded<z39.ZodString, "cnv", "out">;
/** The id of a Message (`msg_…`): one piece of text sent or received in a Conversation. */
declare const messageIdSchema: z39.core.$ZodBranded<z39.ZodString, "msg", "out">;
/** The id of a Draft (`drf_…`): text an Agent or a Rep wrote for a Conversation and not yet sent. */
declare const draftIdSchema: z39.core.$ZodBranded<z39.ZodString, "drf", "out">;
/** The id of an approval Decision (`dcs_…`): one recorded decision about a Draft or a Conversation. */
declare const decisionIdSchema: z39.core.$ZodBranded<z39.ZodString, "dcs", "out">;
/** The id of an Organization. */
type OrganizationId = z39.infer<typeof organizationIdSchema>;
/** The id of a user. */
type UserId = z39.infer<typeof userIdSchema>;
/** The id of a membership. */
type MembershipId = z39.infer<typeof membershipIdSchema>;
/** The id of a Team. */
type TeamId = z39.infer<typeof teamIdSchema>;
/** The id of an Invitation. */
type InvitationId = z39.infer<typeof invitationIdSchema>;
/** The id of a consent event. */
type ConsentEventId = z39.infer<typeof consentEventIdSchema>;
/** The id of a Consent Wording version. */
type ConsentWordingId = z39.infer<typeof consentWordingIdSchema>;
/** The id of a Suppression entry. */
type SuppressionEntryId = z39.infer<typeof suppressionEntryIdSchema>;
/** The id of a hosted consent form. */
type ConsentFormId = z39.infer<typeof consentFormIdSchema>;
/** The id of one Contact Check. */
type ContactCheckId = z39.infer<typeof contactCheckIdSchema>;
/** The id of a Suppression import. */
type SuppressionImportId = z39.infer<typeof suppressionImportIdSchema>;
/** The id of a Prospect. */
type ProspectId = z39.infer<typeof prospectIdSchema>;
/** The id of a Prospect Company. */
type ProspectCompanyId = z39.infer<typeof prospectCompanyIdSchema>;
/** The id of a Prospect import. */
type ProspectImportId = z39.infer<typeof prospectImportIdSchema>;
/** The id of a Prospect merge record. */
type ProspectMergeId = z39.infer<typeof prospectMergeIdSchema>;
/** The id of a Playbook document. */
type DocumentId = z39.infer<typeof documentIdSchema>;
/** The opaque id of a Deal record. */
type DealRecordId = z39.infer<typeof dealRecordIdSchema>;
/** The id of a Call. */
type CallId = z39.infer<typeof callIdSchema>;
/** The id of a Copilot Card. */
type CopilotCardId = z39.infer<typeof copilotCardIdSchema>;
/** The id of a Line. */
type LineId = z39.infer<typeof lineIdSchema>;
/** The id of a Deal import. */
type DealImportId = z39.infer<typeof dealImportIdSchema>;
/** The id of an event. */
type EventId = z39.infer<typeof eventIdSchema>;
/** The id of a request. */
type RequestId = z39.infer<typeof requestIdSchema>;
/** The id of a Demo Request. */
type DemoRequestId = z39.infer<typeof demoRequestIdSchema>;
/** The id of a Booking. */
type BookingId = z39.infer<typeof bookingIdSchema>;
/** The id of a Booking Type. */
type BookingTypeId = z39.infer<typeof bookingTypeIdSchema>;
/** The id of a Routing Rule. */
type RoutingRuleId = z39.infer<typeof routingRuleIdSchema>;
/** The id of a stored routing decision. */
type RoutingDecisionId = z39.infer<typeof routingDecisionIdSchema>;
/** The id of an Inquiry. */
type InquiryId = z39.infer<typeof inquiryIdSchema>;
/** The id of a Qualification question. */
type QualificationQuestionId = z39.infer<typeof qualificationQuestionIdSchema>;
/** The id of a Chat. */
type ChatId = z39.infer<typeof chatIdSchema>;
/** The id of a Handoff. */
type HandoffId = z39.infer<typeof handoffIdSchema>;
/** The id of a try-it session. */
type TrySessionId = z39.infer<typeof trySessionIdSchema>;
/** Turns a UUID (any case; 32 hex characters or the dashed 8-4-4-4-12 form) into an id with the given prefix; throws otherwise. */
declare function formatId<const Prefix extends string>(prefix: Prefix, uuid: string): Id<Prefix>;
/** The id of a Conversation. */
type ConversationId = z39.infer<typeof conversationIdSchema>;
/** The id of a Message. */
type MessageId = z39.infer<typeof messageIdSchema>;
/** The id of a Draft. */
type DraftId = z39.infer<typeof draftIdSchema>;
/** The id of an approval Decision. */
type DecisionId = z39.infer<typeof decisionIdSchema>;
import { z as z41 } from "zod";
import { z as z40 } from "zod";
/**
* The channels a Conversation runs on. SMS and WhatsApp are added here when their phases begin;
* until then a value outside this list is refused at the edge.
*/
declare const INBOX_CHANNELS: readonly ["email", "linkedin", "chat"];
/** A channel a Conversation runs on. */
declare const inboxChannelSchema: z40.ZodEnum<{
	chat: "chat";
	email: "email";
	linkedin: "linkedin";
}>;
/** A channel a Conversation runs on. */
type InboxChannel = z40.infer<typeof inboxChannelSchema>;
/** Who is answering a Conversation now: the Agent, or the Rep who took it over. */
declare const CONVERSATION_CONTROLLERS: readonly ["agent", "rep"];
/** Who is answering a Conversation now. */
declare const conversationControllerSchema: z40.ZodEnum<{
	agent: "agent";
	rep: "rep";
}>;
/** Who is answering a Conversation now. */
type ConversationController = z40.infer<typeof conversationControllerSchema>;
/**
* The states of a Conversation: `agent` (the Agent answers), `awaiting_approval` (a Draft waits for
* a person), `rep` (a Rep took over), `escalated` (it needs a person and has been routed) and
* `closed`.
*/
declare const CONVERSATION_STATES: readonly ["agent", "awaiting_approval", "rep", "escalated", "closed"];
/** The state of a Conversation. */
declare const conversationStateSchema: z40.ZodEnum<{
	agent: "agent";
	awaiting_approval: "awaiting_approval";
	closed: "closed";
	escalated: "escalated";
	rep: "rep";
}>;
/** The state of a Conversation. */
type ConversationState = z40.infer<typeof conversationStateSchema>;
/** Whether a Message came from the Prospect or went to them. */
declare const MESSAGE_DIRECTIONS: readonly ["inbound", "outbound"];
/** Whether a Message came from the Prospect or went to them. */
declare const messageDirectionSchema: z40.ZodEnum<{
	inbound: "inbound";
	outbound: "outbound";
}>;
/** Whether a Message came from the Prospect or went to them. */
type MessageDirection = z40.infer<typeof messageDirectionSchema>;
/** Who wrote a Message: the Prospect, an Agent or a Rep. */
declare const MESSAGE_AUTHOR_KINDS: readonly ["prospect", "agent", "rep"];
/** Who wrote a Message. */
declare const messageAuthorKindSchema: z40.ZodEnum<{
	agent: "agent";
	prospect: "prospect";
	rep: "rep";
}>;
/** Who wrote a Message. */
type MessageAuthorKind = z40.infer<typeof messageAuthorKindSchema>;
/**
* What an inbound Message means. The set is closed: a label outside it is refused by every schema
* here, and a classifier whose output is not in it records `other` (see {@link toReplyLabel}).
* `unsubscribe` and `bounce` also stop sends to the Prospect on that channel.
*/
declare const REPLY_LABELS: readonly ["positive", "question", "objection", "not_now", "wrong_person", "unsubscribe", "out_of_office", "bounce", "negative", "other"];
/** What an inbound Message means. */
declare const replyLabelSchema: z40.ZodEnum<{
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
type ReplyLabel = z40.infer<typeof replyLabelSchema>;
/** Maps untrusted classifier output to a label: anything outside the closed set is `other`. */
declare function toReplyLabel(value: unknown): ReplyLabel;
/** The labels that stop further sends to the Prospect on the channel at once. */
declare const STOP_SENDING_LABELS: readonly ["unsubscribe"];
/** The labels that pause the sequence for the Prospect (a dead address or the wrong person). */
declare const PAUSE_SEQUENCE_LABELS: readonly ["bounce", "wrong_person"];
/** A confidence from 0 to 1. */
declare const confidenceSchema: z40.ZodNumber;
/** The longest Message body, in characters. */
declare const MAX_MESSAGE_BODY_LENGTH = 2e4;
/**
* The body of a Message or Draft: 1 to 20,000 characters, line breaks and tabs allowed, no other
* control character. It is the Prospect's or a model's text, so it is untrusted data for every
* consumer, and it is never logged, never put in an error and never in an event.
*/
declare const messageBodySchema: z40.ZodString;
/**
* The id a channel gives a Message (an email Message-ID, a LinkedIn message id): printable ASCII
* with no space, 1 to 255 characters. Core stores each (channel, provider id) once.
*/
declare const providerMessageIdSchema: z40.ZodString;
/** The longest note a person leaves with a decision, in characters. */
declare const MAX_DECISION_NOTE_LENGTH = 500;
/** A short note with a decision: 1 to 500 characters, line breaks and tabs allowed, no other control character. */
declare const decisionNoteSchema: z40.ZodString;
/** The longest sentence a Draft gives for its strategy, in characters. */
declare const MAX_STRATEGY_LENGTH = 300;
/** The most Sources a Draft may cite. */
declare const MAX_DRAFT_SOURCES = 10;
/** What Sources can be: a Moment of a won, lost or open Deal, or a chunk of a Playbook document. */
declare const DRAFT_SOURCE_KINDS: readonly ["moment", "document_chunk"];
/** What a Source can be. */
declare const draftSourceKindSchema: z40.ZodEnum<{
	document_chunk: "document_chunk";
	moment: "moment";
}>;
/** What a Source can be. */
type DraftSourceKind = z40.infer<typeof draftSourceKindSchema>;
/** The id of a Moment or document chunk in the Playbook: 1 to 128 characters from `A-Za-z0-9_.:-`. */
declare const sourceRefSchema: z40.ZodString;
/** The longest passage shown for a Source, in characters. */
declare const MAX_SOURCE_PASSAGE_LENGTH = 4e3;
/**
* Why a Draft waits for a person. These always hold, whatever the policy: `ungrounded`,
* `check_failed`, `escalated` and `first_message` (the first message to a Prospect). `policy` is
* the Organization's own approval policy asking for it.
*/
declare const DRAFT_HOLD_REASONS: readonly ["policy", "ungrounded", "check_failed", "escalated", "first_message"];
/** Why a Draft waits for a person. */
declare const draftHoldReasonSchema: z40.ZodEnum<{
	check_failed: "check_failed";
	escalated: "escalated";
	first_message: "first_message";
	policy: "policy";
	ungrounded: "ungrounded";
}>;
/** Why a Draft waits for a person. */
type DraftHoldReason = z40.infer<typeof draftHoldReasonSchema>;
/** The hold reasons no setting can turn off. */
declare const ALWAYS_HELD_REASONS: readonly ["ungrounded", "check_failed", "escalated", "first_message"];
/** The states of a Draft. */
declare const DRAFT_STATUSES: readonly ["pending", "approved", "rejected", "sent", "superseded", "void"];
/** The state of a Draft. */
declare const draftStatusSchema: z40.ZodEnum<{
	approved: "approved";
	pending: "pending";
	rejected: "rejected";
	sent: "sent";
	superseded: "superseded";
	void: "void";
}>;
/** The state of a Draft. */
type DraftStatus = z40.infer<typeof draftStatusSchema>;
/** Who wrote a Draft: an Agent, or a Rep composing a reply in the inbox. */
declare const DRAFT_AUTHORS: readonly ["agent", "rep"];
/** Who wrote a Draft. */
declare const draftAuthorSchema: z40.ZodEnum<{
	agent: "agent";
	rep: "rep";
}>;
/** Who wrote a Draft. */
type DraftAuthor = z40.infer<typeof draftAuthorSchema>;
/** Why a send failed: a closed list, never the provider's own text. */
declare const MESSAGE_FAILURE_REASONS: readonly ["provider_rejected", "recipient_invalid", "suppressed", "channel_unavailable", "timeout", "unknown"];
/** Why a send failed. */
declare const messageFailureReasonSchema: z40.ZodEnum<{
	channel_unavailable: "channel_unavailable";
	provider_rejected: "provider_rejected";
	recipient_invalid: "recipient_invalid";
	suppressed: "suppressed";
	timeout: "timeout";
	unknown: "unknown";
}>;
/** Why a send failed. */
type MessageFailureReason = z40.infer<typeof messageFailureReasonSchema>;
/**
* The meaning of an inbound Message: a label from the closed set, a confidence, and who decided
* it. `model` is the classifier; `rep` is a person's correction, which names them.
*/
declare const classificationSchema: z41.ZodObject<{
	label: z41.ZodEnum<{
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
	confidence: z41.ZodNumber;
	decidedBy: z41.ZodEnum<{
		model: "model";
		rep: "rep";
	}>;
	correctedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	classifiedAt: z41.ZodISODateTime;
}, z41.core.$strict>;
/** The meaning of an inbound Message. */
type Classification = z41.infer<typeof classificationSchema>;
/**
* A Conversation: all Messages between one Prospect and the Organization on one channel, and who
* answers now. `controllerMembershipId` names the Rep exactly when `controller` is `rep`, and the
* `rep` state means the Rep controls it. `ownerMembershipId` is the Rep who owns the Prospect (the
* one whose inbox it is), null while unassigned in the Admin queue. `latestLabel` is the label of
* the latest inbound Message, null until one is classified.
*/
declare const conversationSchema: z41.ZodObject<{
	id: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
	prospectId: z41.core.$ZodBranded<z41.ZodString, "prs", "out">;
	channel: z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	controller: z41.ZodEnum<{
		agent: "agent";
		rep: "rep";
	}>;
	controllerMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	state: z41.ZodEnum<{
		agent: "agent";
		awaiting_approval: "awaiting_approval";
		closed: "closed";
		escalated: "escalated";
		rep: "rep";
	}>;
	ownerMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	latestLabel: z41.ZodNullable<z41.ZodEnum<{
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
	pendingDraftCount: z41.ZodNumber;
	lastMessageAt: z41.ZodISODateTime;
	createdAt: z41.ZodISODateTime;
}, z41.core.$strict>;
/** A Conversation. */
type Conversation = z41.infer<typeof conversationSchema>;
/**
* A Message: one piece of text in a Conversation. Messages are append-only. An inbound Message is
* written by the Prospect and carries a classification (null until classified); an outbound one is
* written by an Agent or a Rep, carries the Draft it came from and is recorded when the channel
* confirms it was sent. The body is the Prospect's or a model's text: untrusted, and never logged
* or put in an event or an error.
*/
declare const messageSchema: z41.ZodObject<{
	id: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
	conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
	direction: z41.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	authorKind: z41.ZodEnum<{
		agent: "agent";
		prospect: "prospect";
		rep: "rep";
	}>;
	authorMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	providerMessageId: z41.ZodString;
	draftId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
	body: z41.ZodString;
	sentAt: z41.ZodISODateTime;
	classification: z41.ZodNullable<z41.ZodObject<{
		label: z41.ZodEnum<{
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
		confidence: z41.ZodNumber;
		decidedBy: z41.ZodEnum<{
			model: "model";
			rep: "rep";
		}>;
		correctedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		classifiedAt: z41.ZodISODateTime;
	}, z41.core.$strict>>;
}, z41.core.$strict>;
/** A Message. */
type Message = z41.infer<typeof messageSchema>;
/**
* A Source a Draft cites: a Moment of a Deal (with that Deal's Outcome) or a chunk of a Playbook
* document (no Outcome), and how many Moments or passages support it. It is a reference, never
* the text: model output is untrusted, so a Source id is accepted only when the Playbook returned
* it for this request, and the passage is read from the Playbook (`DraftSourcePassage`).
*/
declare const sourceSchema: z41.ZodObject<{
	kind: z41.ZodEnum<{
		document_chunk: "document_chunk";
		moment: "moment";
	}>;
	sourceRef: z41.ZodString;
	dealRecordId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "deal", "out">>;
	documentId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "doc", "out">>;
	outcome: z41.ZodNullable<z41.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>>;
	evidenceCount: z41.ZodNumber;
}, z41.core.$strict>;
/** A Source a Draft cites. */
type Source = z41.infer<typeof sourceSchema>;
/** A Source with the passage it points to, read from the Playbook for display; untrusted text. */
declare const sourcePassageSchema: z41.ZodObject<{
	source: z41.ZodObject<{
		kind: z41.ZodEnum<{
			document_chunk: "document_chunk";
			moment: "moment";
		}>;
		sourceRef: z41.ZodString;
		dealRecordId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "deal", "out">>;
		documentId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "doc", "out">>;
		outcome: z41.ZodNullable<z41.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>>;
		evidenceCount: z41.ZodNumber;
	}, z41.core.$strict>;
	passage: z41.ZodString;
}, z41.core.$strict>;
/** A Source with its passage. */
type SourcePassage = z41.infer<typeof sourcePassageSchema>;
/** Why a Draft was written: the Message it answers, that Message's label and the strategy in one sentence. */
declare const draftReasonSchema: z41.ZodObject<{
	triggerMessageId: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
	label: z41.ZodEnum<{
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
	strategy: z41.ZodString;
}, z41.core.$strict>;
/** Why a Draft was written. */
type DraftReason = z41.infer<typeof draftReasonSchema>;
/** The result of one check run on a Draft before release. */
declare const draftCheckSchema: z41.ZodObject<{
	name: z41.ZodString;
	passed: z41.ZodBoolean;
}, z41.core.$strict>;
/**
* A Draft: text an Agent wrote (or a Rep composed in the inbox) for a Conversation and has not
* sent. An Agent Draft has a reason, a confidence and its Sources; one with no Source is
* `ungrounded`. `hold` says why it waits for a person, null when it was released without one. A
* Draft that is ungrounded, or has a failed check, always has a hold: no setting releases it. A
* Rep's Draft is already approved by its author.
*/
declare const draftSchema: z41.ZodObject<{
	id: z41.core.$ZodBranded<z41.ZodString, "drf", "out">;
	conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
	author: z41.ZodEnum<{
		agent: "agent";
		rep: "rep";
	}>;
	authorMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	body: z41.ZodString;
	reason: z41.ZodNullable<z41.ZodObject<{
		triggerMessageId: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
		label: z41.ZodEnum<{
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
		strategy: z41.ZodString;
	}, z41.core.$strict>>;
	sources: z41.ZodArray<z41.ZodObject<{
		kind: z41.ZodEnum<{
			document_chunk: "document_chunk";
			moment: "moment";
		}>;
		sourceRef: z41.ZodString;
		dealRecordId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "deal", "out">>;
		documentId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "doc", "out">>;
		outcome: z41.ZodNullable<z41.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>>;
		evidenceCount: z41.ZodNumber;
	}, z41.core.$strict>>;
	confidence: z41.ZodNullable<z41.ZodNumber>;
	ungrounded: z41.ZodBoolean;
	checks: z41.ZodArray<z41.ZodObject<{
		name: z41.ZodString;
		passed: z41.ZodBoolean;
	}, z41.core.$strict>>;
	hold: z41.ZodNullable<z41.ZodEnum<{
		check_failed: "check_failed";
		escalated: "escalated";
		first_message: "first_message";
		policy: "policy";
		ungrounded: "ungrounded";
	}>>;
	status: z41.ZodEnum<{
		approved: "approved";
		pending: "pending";
		rejected: "rejected";
		sent: "sent";
		superseded: "superseded";
		void: "void";
	}>;
	createdAt: z41.ZodISODateTime;
	decidedAt: z41.ZodNullable<z41.ZodISODateTime>;
}, z41.core.$strict>;
/** A Draft. */
type Draft = z41.infer<typeof draftSchema>;
/** What a recorded Decision was. */
declare const DECISION_KINDS: readonly ["approve", "edit_approve", "reject", "auto_release", "takeover", "hand_back"];
/** What a recorded Decision was. */
declare const decisionKindSchema: z41.ZodEnum<{
	approve: "approve";
	auto_release: "auto_release";
	edit_approve: "edit_approve";
	hand_back: "hand_back";
	reject: "reject";
	takeover: "takeover";
}>;
/** What a recorded Decision was. */
type DecisionKind = z41.infer<typeof decisionKindSchema>;
/**
* A Decision: one approval, edit, rejection, automatic release, takeover or hand-back, with who
* and when. It names its Draft except for a takeover or hand-back. Only an automatic release has
* no member. `acknowledgedUngrounded` is true when a person approved an ungrounded Draft knowing
* it cites no Source. The edited text is the Message that was sent, not stored here.
*/
declare const decisionSchema: z41.ZodObject<{
	id: z41.core.$ZodBranded<z41.ZodString, "dcs", "out">;
	conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
	draftId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
	kind: z41.ZodEnum<{
		approve: "approve";
		auto_release: "auto_release";
		edit_approve: "edit_approve";
		hand_back: "hand_back";
		reject: "reject";
		takeover: "takeover";
	}>;
	decidedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	note: z41.ZodNullable<z41.ZodString>;
	acknowledgedUngrounded: z41.ZodBoolean;
	decidedAt: z41.ZodISODateTime;
}, z41.core.$strict>;
/** A Decision. */
type Decision = z41.infer<typeof decisionSchema>;
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
declare const approvalRuleSchema: z41.ZodDiscriminatedUnion<[z41.ZodObject<{
	mode: z41.ZodLiteral<"always">;
}, z41.core.$strict>, z41.ZodObject<{
	mode: z41.ZodLiteral<"below_confidence">;
	threshold: z41.ZodNumber;
}, z41.core.$strict>, z41.ZodObject<{
	mode: z41.ZodLiteral<"except">;
	labels: z41.ZodArray<z41.ZodEnum<{
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
}, z41.core.$strict>], "mode">;
/** The approval rule for a channel. */
type ApprovalRule = z41.infer<typeof approvalRuleSchema>;
/** The approval policy of one channel: its rule, and when and by whom it was last set (null while it is the default). */
declare const approvalPolicySchema: z41.ZodObject<{
	channel: z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	rule: z41.ZodDiscriminatedUnion<[z41.ZodObject<{
		mode: z41.ZodLiteral<"always">;
	}, z41.core.$strict>, z41.ZodObject<{
		mode: z41.ZodLiteral<"below_confidence">;
		threshold: z41.ZodNumber;
	}, z41.core.$strict>, z41.ZodObject<{
		mode: z41.ZodLiteral<"except">;
		labels: z41.ZodArray<z41.ZodEnum<{
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
	}, z41.core.$strict>], "mode">;
	updatedAt: z41.ZodNullable<z41.ZodISODateTime>;
	updatedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
}, z41.core.$strict>;
/** The approval policy of one channel. */
type ApprovalPolicy = z41.infer<typeof approvalPolicySchema>;
/** What decides whether a Draft waits for a person. */
type HoldFacts = {
	readonly label: z41.infer<typeof replyLabelSchema>;
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
declare function holdReasonFor(rule: ApprovalRule, facts: HoldFacts): z41.infer<typeof draftHoldReasonSchema> | null;
/** The path parameters of a request about one Conversation. */
declare const conversationParamsSchema: z41.ZodObject<{
	conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
}, z41.core.$strict>;
/** The path parameters of a request about one Message of a Conversation. */
declare const conversationMessageParamsSchema: z41.ZodObject<{
	conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
	messageId: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
}, z41.core.$strict>;
/** The path parameters of a request about one Draft. */
declare const draftParamsSchema: z41.ZodObject<{
	draftId: z41.core.$ZodBranded<z41.ZodString, "drf", "out">;
}, z41.core.$strict>;
/** The path parameters of a request about one channel's policy. */
declare const channelParamsSchema: z41.ZodObject<{
	channel: z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
}, z41.core.$strict>;
/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
declare const inboxKeyedHeadersSchema: z41.ZodObject<{
	"idempotency-key": z41.ZodString;
}, z41.core.$strip>;
/** The cursor position a Conversation list resumes from: latest activity first, then id. */
declare const conversationCursorSchema: z41.ZodObject<{
	lastMessageAt: z41.ZodISODateTime;
	id: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
}, z41.core.$strict>;
/**
* The query parameters of a request to list Conversations: latest activity first, one
* cursor-paginated page at a time, narrowed by channel, state, controller, the latest label and
* Prospect. What the caller sees is decided from the token and a filter never widens it.
*/
declare const listConversationsQuerySchema: z41.ZodObject<{
	cursor: z41.ZodOptional<z41.ZodString>;
	limit: z41.ZodDefault<z41.ZodPipe<z41.ZodPipe<z41.ZodUnion<readonly [z41.ZodNumber, z41.ZodString]>, z41.ZodTransform<number, string | number>>, z41.ZodNumber>>;
	channel: z41.ZodOptional<z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>>;
	state: z41.ZodOptional<z41.ZodEnum<{
		agent: "agent";
		awaiting_approval: "awaiting_approval";
		closed: "closed";
		escalated: "escalated";
		rep: "rep";
	}>>;
	controller: z41.ZodOptional<z41.ZodEnum<{
		agent: "agent";
		rep: "rep";
	}>>;
	label: z41.ZodOptional<z41.ZodEnum<{
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
	prospectId: z41.ZodOptional<z41.core.$ZodBranded<z41.ZodString, "prs", "out">>;
}, z41.core.$strict>;
/** The query parameters of a request to list Conversations. */
type ListConversationsQuery = z41.infer<typeof listConversationsQuerySchema>;
/** One page of Conversations. */
declare const conversationPageSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		id: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
		prospectId: z41.core.$ZodBranded<z41.ZodString, "prs", "out">;
		channel: z41.ZodEnum<{
			chat: "chat";
			email: "email";
			linkedin: "linkedin";
		}>;
		controller: z41.ZodEnum<{
			agent: "agent";
			rep: "rep";
		}>;
		controllerMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		state: z41.ZodEnum<{
			agent: "agent";
			awaiting_approval: "awaiting_approval";
			closed: "closed";
			escalated: "escalated";
			rep: "rep";
		}>;
		ownerMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		latestLabel: z41.ZodNullable<z41.ZodEnum<{
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
		pendingDraftCount: z41.ZodNumber;
		lastMessageAt: z41.ZodISODateTime;
		createdAt: z41.ZodISODateTime;
	}, z41.core.$strict>>;
	nextCursor: z41.ZodNullable<z41.ZodString>;
}, z41.core.$strip>;
/** The cursor position a Message list resumes from: oldest first, then id. */
declare const messageCursorSchema: z41.ZodObject<{
	sentAt: z41.ZodISODateTime;
	id: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
}, z41.core.$strict>;
/** The query parameters of a request to list the Messages of a Conversation, oldest first. */
declare const listMessagesQuerySchema: z41.ZodObject<{
	cursor: z41.ZodOptional<z41.ZodString>;
	limit: z41.ZodDefault<z41.ZodPipe<z41.ZodPipe<z41.ZodUnion<readonly [z41.ZodNumber, z41.ZodString]>, z41.ZodTransform<number, string | number>>, z41.ZodNumber>>;
}, z41.core.$strict>;
/** One page of Messages. */
declare const messagePageSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		id: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
		conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
		direction: z41.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		authorKind: z41.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
			rep: "rep";
		}>;
		authorMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		providerMessageId: z41.ZodString;
		draftId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
		body: z41.ZodString;
		sentAt: z41.ZodISODateTime;
		classification: z41.ZodNullable<z41.ZodObject<{
			label: z41.ZodEnum<{
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
			confidence: z41.ZodNumber;
			decidedBy: z41.ZodEnum<{
				model: "model";
				rep: "rep";
			}>;
			correctedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
			classifiedAt: z41.ZodISODateTime;
		}, z41.core.$strict>>;
	}, z41.core.$strict>>;
	nextCursor: z41.ZodNullable<z41.ZodString>;
}, z41.core.$strip>;
/** The body of a request to correct the label of an inbound Message. */
declare const correctClassificationRequestSchema: z41.ZodObject<{
	label: z41.ZodEnum<{
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
}, z41.core.$strict>;
/** The body of a request to take over or hand back a Conversation: none. */
declare const conversationActionRequestSchema: z41.ZodObject<{}, z41.core.$strict>;
/** The body of a Rep's reply from the inbox: the text to send through the Conversation's channel. */
declare const replyRequestSchema: z41.ZodObject<{
	body: z41.ZodString;
}, z41.core.$strict>;
/**
* The body of a request to approve a Draft. With `body` the Draft is edited and approved: that
* text is what is sent, and the Decision is `edit_approve`. A Draft with no Source is approved
* only with `acknowledgeUngrounded` true; without it the answer is `inbox.draft_ungrounded`.
*/
declare const approveDraftRequestSchema: z41.ZodObject<{
	body: z41.ZodOptional<z41.ZodString>;
	acknowledgeUngrounded: z41.ZodDefault<z41.ZodBoolean>;
}, z41.core.$strict>;
/** The body of a request to approve a Draft. */
type ApproveDraftRequest = z41.infer<typeof approveDraftRequestSchema>;
/** The body of a request to reject a Draft, with an optional short note. */
declare const rejectDraftRequestSchema: z41.ZodObject<{
	note: z41.ZodOptional<z41.ZodString>;
}, z41.core.$strict>;
/** The Sources of a Draft with their passages. */
declare const draftSourcesSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		source: z41.ZodObject<{
			kind: z41.ZodEnum<{
				document_chunk: "document_chunk";
				moment: "moment";
			}>;
			sourceRef: z41.ZodString;
			dealRecordId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "deal", "out">>;
			documentId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "doc", "out">>;
			outcome: z41.ZodNullable<z41.ZodEnum<{
				lost: "lost";
				open: "open";
				won: "won";
			}>>;
			evidenceCount: z41.ZodNumber;
		}, z41.core.$strict>;
		passage: z41.ZodString;
	}, z41.core.$strict>>;
}, z41.core.$strict>;
/** An entry of the approval queue: a Draft waiting for a person, the Conversation it belongs to, and whether the caller may decide it. */
declare const approvalQueueItemSchema: z41.ZodObject<{
	draft: z41.ZodObject<{
		id: z41.core.$ZodBranded<z41.ZodString, "drf", "out">;
		conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
		author: z41.ZodEnum<{
			agent: "agent";
			rep: "rep";
		}>;
		authorMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		body: z41.ZodString;
		reason: z41.ZodNullable<z41.ZodObject<{
			triggerMessageId: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
			label: z41.ZodEnum<{
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
			strategy: z41.ZodString;
		}, z41.core.$strict>>;
		sources: z41.ZodArray<z41.ZodObject<{
			kind: z41.ZodEnum<{
				document_chunk: "document_chunk";
				moment: "moment";
			}>;
			sourceRef: z41.ZodString;
			dealRecordId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "deal", "out">>;
			documentId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "doc", "out">>;
			outcome: z41.ZodNullable<z41.ZodEnum<{
				lost: "lost";
				open: "open";
				won: "won";
			}>>;
			evidenceCount: z41.ZodNumber;
		}, z41.core.$strict>>;
		confidence: z41.ZodNullable<z41.ZodNumber>;
		ungrounded: z41.ZodBoolean;
		checks: z41.ZodArray<z41.ZodObject<{
			name: z41.ZodString;
			passed: z41.ZodBoolean;
		}, z41.core.$strict>>;
		hold: z41.ZodNullable<z41.ZodEnum<{
			check_failed: "check_failed";
			escalated: "escalated";
			first_message: "first_message";
			policy: "policy";
			ungrounded: "ungrounded";
		}>>;
		status: z41.ZodEnum<{
			approved: "approved";
			pending: "pending";
			rejected: "rejected";
			sent: "sent";
			superseded: "superseded";
			void: "void";
		}>;
		createdAt: z41.ZodISODateTime;
		decidedAt: z41.ZodNullable<z41.ZodISODateTime>;
	}, z41.core.$strict>;
	channel: z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	prospectId: z41.core.$ZodBranded<z41.ZodString, "prs", "out">;
	ownerMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	canApprove: z41.ZodBoolean;
}, z41.core.$strict>;
/** An entry of the approval queue. */
type ApprovalQueueItem = z41.infer<typeof approvalQueueItemSchema>;
/** The cursor position the approval queue resumes from: oldest first, then id. */
declare const approvalQueueCursorSchema: z41.ZodObject<{
	createdAt: z41.ZodISODateTime;
	id: z41.core.$ZodBranded<z41.ZodString, "drf", "out">;
}, z41.core.$strict>;
/** The query parameters of a request to list the approval queue, oldest first. */
declare const listApprovalQueueQuerySchema: z41.ZodObject<{
	cursor: z41.ZodOptional<z41.ZodString>;
	limit: z41.ZodDefault<z41.ZodPipe<z41.ZodPipe<z41.ZodUnion<readonly [z41.ZodNumber, z41.ZodString]>, z41.ZodTransform<number, string | number>>, z41.ZodNumber>>;
	channel: z41.ZodOptional<z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>>;
	conversationId: z41.ZodOptional<z41.core.$ZodBranded<z41.ZodString, "cnv", "out">>;
}, z41.core.$strict>;
/** One page of the approval queue. */
declare const approvalQueuePageSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		draft: z41.ZodObject<{
			id: z41.core.$ZodBranded<z41.ZodString, "drf", "out">;
			conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
			author: z41.ZodEnum<{
				agent: "agent";
				rep: "rep";
			}>;
			authorMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
			body: z41.ZodString;
			reason: z41.ZodNullable<z41.ZodObject<{
				triggerMessageId: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
				label: z41.ZodEnum<{
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
				strategy: z41.ZodString;
			}, z41.core.$strict>>;
			sources: z41.ZodArray<z41.ZodObject<{
				kind: z41.ZodEnum<{
					document_chunk: "document_chunk";
					moment: "moment";
				}>;
				sourceRef: z41.ZodString;
				dealRecordId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "deal", "out">>;
				documentId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "doc", "out">>;
				outcome: z41.ZodNullable<z41.ZodEnum<{
					lost: "lost";
					open: "open";
					won: "won";
				}>>;
				evidenceCount: z41.ZodNumber;
			}, z41.core.$strict>>;
			confidence: z41.ZodNullable<z41.ZodNumber>;
			ungrounded: z41.ZodBoolean;
			checks: z41.ZodArray<z41.ZodObject<{
				name: z41.ZodString;
				passed: z41.ZodBoolean;
			}, z41.core.$strict>>;
			hold: z41.ZodNullable<z41.ZodEnum<{
				check_failed: "check_failed";
				escalated: "escalated";
				first_message: "first_message";
				policy: "policy";
				ungrounded: "ungrounded";
			}>>;
			status: z41.ZodEnum<{
				approved: "approved";
				pending: "pending";
				rejected: "rejected";
				sent: "sent";
				superseded: "superseded";
				void: "void";
			}>;
			createdAt: z41.ZodISODateTime;
			decidedAt: z41.ZodNullable<z41.ZodISODateTime>;
		}, z41.core.$strict>;
		channel: z41.ZodEnum<{
			chat: "chat";
			email: "email";
			linkedin: "linkedin";
		}>;
		prospectId: z41.core.$ZodBranded<z41.ZodString, "prs", "out">;
		ownerMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		canApprove: z41.ZodBoolean;
	}, z41.core.$strict>>;
	nextCursor: z41.ZodNullable<z41.ZodString>;
}, z41.core.$strip>;
/** The cursor position a Decision list resumes from: latest first, then id. */
declare const decisionCursorSchema: z41.ZodObject<{
	decidedAt: z41.ZodISODateTime;
	id: z41.core.$ZodBranded<z41.ZodString, "dcs", "out">;
}, z41.core.$strict>;
/** The query parameters of a request to list Decisions, latest first, optionally in a time range. */
declare const listDecisionsQuerySchema: z41.ZodObject<{
	cursor: z41.ZodOptional<z41.ZodString>;
	limit: z41.ZodDefault<z41.ZodPipe<z41.ZodPipe<z41.ZodUnion<readonly [z41.ZodNumber, z41.ZodString]>, z41.ZodTransform<number, string | number>>, z41.ZodNumber>>;
	conversationId: z41.ZodOptional<z41.core.$ZodBranded<z41.ZodString, "cnv", "out">>;
	draftId: z41.ZodOptional<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
	kind: z41.ZodOptional<z41.ZodEnum<{
		approve: "approve";
		auto_release: "auto_release";
		edit_approve: "edit_approve";
		hand_back: "hand_back";
		reject: "reject";
		takeover: "takeover";
	}>>;
	from: z41.ZodOptional<z41.ZodISODateTime>;
	to: z41.ZodOptional<z41.ZodISODateTime>;
}, z41.core.$strict>;
/** One page of Decisions. */
declare const decisionPageSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		id: z41.core.$ZodBranded<z41.ZodString, "dcs", "out">;
		conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
		draftId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
		kind: z41.ZodEnum<{
			approve: "approve";
			auto_release: "auto_release";
			edit_approve: "edit_approve";
			hand_back: "hand_back";
			reject: "reject";
			takeover: "takeover";
		}>;
		decidedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		note: z41.ZodNullable<z41.ZodString>;
		acknowledgedUngrounded: z41.ZodBoolean;
		decidedAt: z41.ZodISODateTime;
	}, z41.core.$strict>>;
	nextCursor: z41.ZodNullable<z41.ZodString>;
}, z41.core.$strip>;
/** The approval policy of every channel: one entry per channel, the default `always` until set. */
declare const approvalPoliciesSchema: z41.ZodObject<{
	items: z41.ZodArray<z41.ZodObject<{
		channel: z41.ZodEnum<{
			chat: "chat";
			email: "email";
			linkedin: "linkedin";
		}>;
		rule: z41.ZodDiscriminatedUnion<[z41.ZodObject<{
			mode: z41.ZodLiteral<"always">;
		}, z41.core.$strict>, z41.ZodObject<{
			mode: z41.ZodLiteral<"below_confidence">;
			threshold: z41.ZodNumber;
		}, z41.core.$strict>, z41.ZodObject<{
			mode: z41.ZodLiteral<"except">;
			labels: z41.ZodArray<z41.ZodEnum<{
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
		}, z41.core.$strict>], "mode">;
		updatedAt: z41.ZodNullable<z41.ZodISODateTime>;
		updatedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
	}, z41.core.$strict>>;
}, z41.core.$strict>;
/** The body of a request to set a channel's approval rule; it replaces the rule, so a repeat changes nothing. */
declare const setApprovalPolicyRequestSchema: z41.ZodObject<{
	rule: z41.ZodDiscriminatedUnion<[z41.ZodObject<{
		mode: z41.ZodLiteral<"always">;
	}, z41.core.$strict>, z41.ZodObject<{
		mode: z41.ZodLiteral<"below_confidence">;
		threshold: z41.ZodNumber;
	}, z41.core.$strict>, z41.ZodObject<{
		mode: z41.ZodLiteral<"except">;
		labels: z41.ZodArray<z41.ZodEnum<{
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
	}, z41.core.$strict>], "mode">;
}, z41.core.$strict>;
/**
* The body a channel service posts to `/internal/messages` for every Message it received or sent.
* Core stores one Message per channel and provider id. An inbound Message is the Prospect's;
* an outbound one carries its Draft's id when it came from one, else it is an Agent's sequence
* message. The body is untrusted text and never logged.
*/
declare const ingestMessageRequestSchema: z41.ZodObject<{
	channel: z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	providerMessageId: z41.ZodString;
	prospectId: z41.core.$ZodBranded<z41.ZodString, "prs", "out">;
	direction: z41.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	body: z41.ZodPipe<z41.ZodPipe<z41.ZodString, z41.ZodTransform<string, string>>, z41.ZodString>;
	draftId: z41.ZodOptional<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
	sentAt: z41.ZodISODateTime;
}, z41.core.$strict>;
/** The body posted to `/internal/messages`. */
type IngestMessageRequest = z41.infer<typeof ingestMessageRequestSchema>;
/** The answer to an ingest: the stored Message, and whether this call stored it (false for a repeat). */
declare const ingestMessageResultSchema: z41.ZodObject<{
	message: z41.ZodObject<{
		id: z41.core.$ZodBranded<z41.ZodString, "msg", "out">;
		conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
		direction: z41.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		authorKind: z41.ZodEnum<{
			agent: "agent";
			prospect: "prospect";
			rep: "rep";
		}>;
		authorMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
		providerMessageId: z41.ZodString;
		draftId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "drf", "out">>;
		body: z41.ZodString;
		sentAt: z41.ZodISODateTime;
		classification: z41.ZodNullable<z41.ZodObject<{
			label: z41.ZodEnum<{
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
			confidence: z41.ZodNumber;
			decidedBy: z41.ZodEnum<{
				model: "model";
				rep: "rep";
			}>;
			correctedByMembershipId: z41.ZodNullable<z41.core.$ZodBranded<z41.ZodString, "mem", "out">>;
			classifiedAt: z41.ZodISODateTime;
		}, z41.core.$strict>>;
	}, z41.core.$strict>;
	created: z41.ZodBoolean;
}, z41.core.$strict>;
/** What a channel service needs to send an approved Draft: where, to whom and the text. Sensitive; never logged. */
declare const draftReleaseSchema: z41.ZodObject<{
	draftId: z41.core.$ZodBranded<z41.ZodString, "drf", "out">;
	conversationId: z41.core.$ZodBranded<z41.ZodString, "cnv", "out">;
	prospectId: z41.core.$ZodBranded<z41.ZodString, "prs", "out">;
	channel: z41.ZodEnum<{
		chat: "chat";
		email: "email";
		linkedin: "linkedin";
	}>;
	body: z41.ZodString;
}, z41.core.$strict>;
/** What a channel service needs to send an approved Draft. */
type DraftRelease = z41.infer<typeof draftReleaseSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh4510 } from "..";
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
	readonly "inbox.already_controlled": ErrorDefinition_8gwh4510<"inbox.already_controlled">;
	readonly "inbox.conversation_closed": ErrorDefinition_8gwh4510<"inbox.conversation_closed">;
	readonly "inbox.conversation_not_found": ErrorDefinition_8gwh4510<"inbox.conversation_not_found">;
	readonly "inbox.draft_not_found": ErrorDefinition_8gwh4510<"inbox.draft_not_found">;
	readonly "inbox.draft_not_pending": ErrorDefinition_8gwh4510<"inbox.draft_not_pending">;
	readonly "inbox.draft_ungrounded": ErrorDefinition_8gwh4510<"inbox.draft_ungrounded">;
	readonly "inbox.message_not_found": ErrorDefinition_8gwh4510<"inbox.message_not_found">;
	readonly "inbox.message_not_inbound": ErrorDefinition_8gwh4510<"inbox.message_not_inbound">;
	readonly "inbox.not_conversation_owner": ErrorDefinition_8gwh4510<"inbox.not_conversation_owner">;
	readonly "inbox.not_taken_over": ErrorDefinition_8gwh4510<"inbox.not_taken_over">;
	readonly "inbox.prospect_not_found": ErrorDefinition_8gwh4510<"inbox.prospect_not_found">;
	readonly "inbox.prospect_suppressed": ErrorDefinition_8gwh4510<"inbox.prospect_suppressed">;
	readonly "inbox.takeover_required": ErrorDefinition_8gwh4510<"inbox.takeover_required">;
};
/** An inbox error code. */
type InboxErrorCode = keyof typeof INBOX_ERRORS;
import { z as z42 } from "zod";
/**
* `message.approved` (version 1): a Draft was approved, by a person or released by the policy
* (`approvedByMembershipId` null). The Draft id is the idempotency key for the send: the channel
* service reads the text from core with it. Ids only: no body, no edit, no note.
*/
declare const messageApprovedEvent: {
	type: "message.approved";
	version: 1;
	schema: z42.ZodObject<{
		id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
		occurredAt: z42.ZodISODateTime;
		organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
		region: z42.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z42.ZodLiteral<"message.approved">;
		version: z42.ZodLiteral<1>;
		data: z42.ZodObject<{
			draftId: z42.core.$ZodBranded<z42.ZodString, "drf", "out">;
			conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
			prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
			channel: z42.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			approvedByMembershipId: z42.ZodNullable<z42.core.$ZodBranded<z42.ZodString, "mem", "out">>;
			edited: z42.ZodBoolean;
			acknowledgedUngrounded: z42.ZodBoolean;
			approvedAt: z42.ZodISODateTime;
		}, z42.core.$strict>;
	}, z42.core.$strip>;
	parse: (input: unknown) => {
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "message.approved";
		version: 1;
		data: {
			draftId: string & z42.$brand<"drf">;
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			approvedByMembershipId: (string & z42.$brand<"mem">) | null;
			edited: boolean;
			acknowledgedUngrounded: boolean;
			approvedAt: string;
		};
	};
	safeParse: (input: unknown) => z42.ZodSafeParseResult<{
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "message.approved";
		version: 1;
		data: {
			draftId: string & z42.$brand<"drf">;
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			approvedByMembershipId: (string & z42.$brand<"mem">) | null;
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
	schema: z42.ZodObject<{
		id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
		occurredAt: z42.ZodISODateTime;
		organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
		region: z42.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z42.ZodLiteral<"message.sent">;
		version: z42.ZodLiteral<1>;
		data: z42.ZodObject<{
			draftId: z42.core.$ZodBranded<z42.ZodString, "drf", "out">;
			conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
			messageId: z42.core.$ZodBranded<z42.ZodString, "msg", "out">;
			prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
			channel: z42.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			sentAt: z42.ZodISODateTime;
		}, z42.core.$strict>;
	}, z42.core.$strip>;
	parse: (input: unknown) => {
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "message.sent";
		version: 1;
		data: {
			draftId: string & z42.$brand<"drf">;
			conversationId: string & z42.$brand<"cnv">;
			messageId: string & z42.$brand<"msg">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			sentAt: string;
		};
	};
	safeParse: (input: unknown) => z42.ZodSafeParseResult<{
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "message.sent";
		version: 1;
		data: {
			draftId: string & z42.$brand<"drf">;
			conversationId: string & z42.$brand<"cnv">;
			messageId: string & z42.$brand<"msg">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			sentAt: string;
		};
	}>;
};
/** `message.failed` (version 1): the channel service could not send the approved Draft. A closed reason, never the provider's text. Ids only. */
declare const messageFailedEvent: {
	type: "message.failed";
	version: 1;
	schema: z42.ZodObject<{
		id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
		occurredAt: z42.ZodISODateTime;
		organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
		region: z42.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z42.ZodLiteral<"message.failed">;
		version: z42.ZodLiteral<1>;
		data: z42.ZodObject<{
			draftId: z42.core.$ZodBranded<z42.ZodString, "drf", "out">;
			conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
			prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
			channel: z42.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			reason: z42.ZodEnum<{
				channel_unavailable: "channel_unavailable";
				provider_rejected: "provider_rejected";
				recipient_invalid: "recipient_invalid";
				suppressed: "suppressed";
				timeout: "timeout";
				unknown: "unknown";
			}>;
			retryable: z42.ZodBoolean;
			failedAt: z42.ZodISODateTime;
		}, z42.core.$strict>;
	}, z42.core.$strip>;
	parse: (input: unknown) => {
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "message.failed";
		version: 1;
		data: {
			draftId: string & z42.$brand<"drf">;
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			reason: "channel_unavailable" | "provider_rejected" | "recipient_invalid" | "suppressed" | "timeout" | "unknown";
			retryable: boolean;
			failedAt: string;
		};
	};
	safeParse: (input: unknown) => z42.ZodSafeParseResult<{
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "message.failed";
		version: 1;
		data: {
			draftId: string & z42.$brand<"drf">;
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
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
	schema: z42.ZodObject<{
		id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
		occurredAt: z42.ZodISODateTime;
		organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
		region: z42.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z42.ZodLiteral<"reply.classified">;
		version: z42.ZodLiteral<1>;
		data: z42.ZodObject<{
			conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
			messageId: z42.core.$ZodBranded<z42.ZodString, "msg", "out">;
			prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
			channel: z42.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			label: z42.ZodEnum<{
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
			confidence: z42.ZodNumber;
			classifiedAt: z42.ZodISODateTime;
		}, z42.core.$strict>;
	}, z42.core.$strip>;
	parse: (input: unknown) => {
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "reply.classified";
		version: 1;
		data: {
			conversationId: string & z42.$brand<"cnv">;
			messageId: string & z42.$brand<"msg">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			label: "bounce" | "negative" | "not_now" | "objection" | "other" | "out_of_office" | "positive" | "question" | "unsubscribe" | "wrong_person";
			confidence: number;
			classifiedAt: string;
		};
	};
	safeParse: (input: unknown) => z42.ZodSafeParseResult<{
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "reply.classified";
		version: 1;
		data: {
			conversationId: string & z42.$brand<"cnv">;
			messageId: string & z42.$brand<"msg">;
			prospectId: string & z42.$brand<"prs">;
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
	schema: z42.ZodObject<{
		id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
		occurredAt: z42.ZodISODateTime;
		organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
		region: z42.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z42.ZodLiteral<"conversation.taken_over">;
		version: z42.ZodLiteral<1>;
		data: z42.ZodObject<{
			conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
			prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
			channel: z42.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			takenOverByMembershipId: z42.core.$ZodBranded<z42.ZodString, "mem", "out">;
			voidedDraftCount: z42.ZodNumber;
			takenOverAt: z42.ZodISODateTime;
		}, z42.core.$strict>;
	}, z42.core.$strip>;
	parse: (input: unknown) => {
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.taken_over";
		version: 1;
		data: {
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			takenOverByMembershipId: string & z42.$brand<"mem">;
			voidedDraftCount: number;
			takenOverAt: string;
		};
	};
	safeParse: (input: unknown) => z42.ZodSafeParseResult<{
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.taken_over";
		version: 1;
		data: {
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			takenOverByMembershipId: string & z42.$brand<"mem">;
			voidedDraftCount: number;
			takenOverAt: string;
		};
	}>;
};
/** `conversation.handed_back` (version 1): a Rep handed a Conversation back to the Agent. Ids only. */
declare const conversationHandedBackEvent: {
	type: "conversation.handed_back";
	version: 1;
	schema: z42.ZodObject<{
		id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
		occurredAt: z42.ZodISODateTime;
		organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
		region: z42.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z42.ZodLiteral<"conversation.handed_back">;
		version: z42.ZodLiteral<1>;
		data: z42.ZodObject<{
			conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
			prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
			channel: z42.ZodEnum<{
				chat: "chat";
				email: "email";
				linkedin: "linkedin";
			}>;
			handedBackByMembershipId: z42.core.$ZodBranded<z42.ZodString, "mem", "out">;
			handedBackAt: z42.ZodISODateTime;
		}, z42.core.$strict>;
	}, z42.core.$strip>;
	parse: (input: unknown) => {
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.handed_back";
		version: 1;
		data: {
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			handedBackByMembershipId: string & z42.$brand<"mem">;
			handedBackAt: string;
		};
	};
	safeParse: (input: unknown) => z42.ZodSafeParseResult<{
		id: string & z42.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z42.$brand<"org">;
		region: "eu" | "us";
		type: "conversation.handed_back";
		version: 1;
		data: {
			conversationId: string & z42.$brand<"cnv">;
			prospectId: string & z42.$brand<"prs">;
			channel: "chat" | "email" | "linkedin";
			handedBackByMembershipId: string & z42.$brand<"mem">;
			handedBackAt: string;
		};
	}>;
};
/** Every inbox event, by type. */
declare const INBOX_EVENTS: {
	readonly "message.approved": {
		type: "message.approved";
		version: 1;
		schema: z42.ZodObject<{
			id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
			occurredAt: z42.ZodISODateTime;
			organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
			region: z42.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z42.ZodLiteral<"message.approved">;
			version: z42.ZodLiteral<1>;
			data: z42.ZodObject<{
				draftId: z42.core.$ZodBranded<z42.ZodString, "drf", "out">;
				conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
				prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
				channel: z42.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				approvedByMembershipId: z42.ZodNullable<z42.core.$ZodBranded<z42.ZodString, "mem", "out">>;
				edited: z42.ZodBoolean;
				acknowledgedUngrounded: z42.ZodBoolean;
				approvedAt: z42.ZodISODateTime;
			}, z42.core.$strict>;
		}, z42.core.$strip>;
		parse: (input: unknown) => {
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "message.approved";
			version: 1;
			data: {
				draftId: string & z42.$brand<"drf">;
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				approvedByMembershipId: (string & z42.$brand<"mem">) | null;
				edited: boolean;
				acknowledgedUngrounded: boolean;
				approvedAt: string;
			};
		};
		safeParse: (input: unknown) => z42.ZodSafeParseResult<{
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "message.approved";
			version: 1;
			data: {
				draftId: string & z42.$brand<"drf">;
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				approvedByMembershipId: (string & z42.$brand<"mem">) | null;
				edited: boolean;
				acknowledgedUngrounded: boolean;
				approvedAt: string;
			};
		}>;
	};
	readonly "message.sent": {
		type: "message.sent";
		version: 1;
		schema: z42.ZodObject<{
			id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
			occurredAt: z42.ZodISODateTime;
			organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
			region: z42.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z42.ZodLiteral<"message.sent">;
			version: z42.ZodLiteral<1>;
			data: z42.ZodObject<{
				draftId: z42.core.$ZodBranded<z42.ZodString, "drf", "out">;
				conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
				messageId: z42.core.$ZodBranded<z42.ZodString, "msg", "out">;
				prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
				channel: z42.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				sentAt: z42.ZodISODateTime;
			}, z42.core.$strict>;
		}, z42.core.$strip>;
		parse: (input: unknown) => {
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "message.sent";
			version: 1;
			data: {
				draftId: string & z42.$brand<"drf">;
				conversationId: string & z42.$brand<"cnv">;
				messageId: string & z42.$brand<"msg">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				sentAt: string;
			};
		};
		safeParse: (input: unknown) => z42.ZodSafeParseResult<{
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "message.sent";
			version: 1;
			data: {
				draftId: string & z42.$brand<"drf">;
				conversationId: string & z42.$brand<"cnv">;
				messageId: string & z42.$brand<"msg">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				sentAt: string;
			};
		}>;
	};
	readonly "message.failed": {
		type: "message.failed";
		version: 1;
		schema: z42.ZodObject<{
			id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
			occurredAt: z42.ZodISODateTime;
			organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
			region: z42.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z42.ZodLiteral<"message.failed">;
			version: z42.ZodLiteral<1>;
			data: z42.ZodObject<{
				draftId: z42.core.$ZodBranded<z42.ZodString, "drf", "out">;
				conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
				prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
				channel: z42.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				reason: z42.ZodEnum<{
					channel_unavailable: "channel_unavailable";
					provider_rejected: "provider_rejected";
					recipient_invalid: "recipient_invalid";
					suppressed: "suppressed";
					timeout: "timeout";
					unknown: "unknown";
				}>;
				retryable: z42.ZodBoolean;
				failedAt: z42.ZodISODateTime;
			}, z42.core.$strict>;
		}, z42.core.$strip>;
		parse: (input: unknown) => {
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "message.failed";
			version: 1;
			data: {
				draftId: string & z42.$brand<"drf">;
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				reason: "channel_unavailable" | "provider_rejected" | "recipient_invalid" | "suppressed" | "timeout" | "unknown";
				retryable: boolean;
				failedAt: string;
			};
		};
		safeParse: (input: unknown) => z42.ZodSafeParseResult<{
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "message.failed";
			version: 1;
			data: {
				draftId: string & z42.$brand<"drf">;
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
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
		schema: z42.ZodObject<{
			id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
			occurredAt: z42.ZodISODateTime;
			organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
			region: z42.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z42.ZodLiteral<"reply.classified">;
			version: z42.ZodLiteral<1>;
			data: z42.ZodObject<{
				conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
				messageId: z42.core.$ZodBranded<z42.ZodString, "msg", "out">;
				prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
				channel: z42.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				label: z42.ZodEnum<{
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
				confidence: z42.ZodNumber;
				classifiedAt: z42.ZodISODateTime;
			}, z42.core.$strict>;
		}, z42.core.$strip>;
		parse: (input: unknown) => {
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "reply.classified";
			version: 1;
			data: {
				conversationId: string & z42.$brand<"cnv">;
				messageId: string & z42.$brand<"msg">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				label: "bounce" | "negative" | "not_now" | "objection" | "other" | "out_of_office" | "positive" | "question" | "unsubscribe" | "wrong_person";
				confidence: number;
				classifiedAt: string;
			};
		};
		safeParse: (input: unknown) => z42.ZodSafeParseResult<{
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "reply.classified";
			version: 1;
			data: {
				conversationId: string & z42.$brand<"cnv">;
				messageId: string & z42.$brand<"msg">;
				prospectId: string & z42.$brand<"prs">;
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
		schema: z42.ZodObject<{
			id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
			occurredAt: z42.ZodISODateTime;
			organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
			region: z42.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z42.ZodLiteral<"conversation.taken_over">;
			version: z42.ZodLiteral<1>;
			data: z42.ZodObject<{
				conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
				prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
				channel: z42.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				takenOverByMembershipId: z42.core.$ZodBranded<z42.ZodString, "mem", "out">;
				voidedDraftCount: z42.ZodNumber;
				takenOverAt: z42.ZodISODateTime;
			}, z42.core.$strict>;
		}, z42.core.$strip>;
		parse: (input: unknown) => {
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.taken_over";
			version: 1;
			data: {
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				takenOverByMembershipId: string & z42.$brand<"mem">;
				voidedDraftCount: number;
				takenOverAt: string;
			};
		};
		safeParse: (input: unknown) => z42.ZodSafeParseResult<{
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.taken_over";
			version: 1;
			data: {
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				takenOverByMembershipId: string & z42.$brand<"mem">;
				voidedDraftCount: number;
				takenOverAt: string;
			};
		}>;
	};
	readonly "conversation.handed_back": {
		type: "conversation.handed_back";
		version: 1;
		schema: z42.ZodObject<{
			id: z42.core.$ZodBranded<z42.ZodString, "evt", "out">;
			occurredAt: z42.ZodISODateTime;
			organizationId: z42.core.$ZodBranded<z42.ZodString, "org", "out">;
			region: z42.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z42.ZodLiteral<"conversation.handed_back">;
			version: z42.ZodLiteral<1>;
			data: z42.ZodObject<{
				conversationId: z42.core.$ZodBranded<z42.ZodString, "cnv", "out">;
				prospectId: z42.core.$ZodBranded<z42.ZodString, "prs", "out">;
				channel: z42.ZodEnum<{
					chat: "chat";
					email: "email";
					linkedin: "linkedin";
				}>;
				handedBackByMembershipId: z42.core.$ZodBranded<z42.ZodString, "mem", "out">;
				handedBackAt: z42.ZodISODateTime;
			}, z42.core.$strict>;
		}, z42.core.$strip>;
		parse: (input: unknown) => {
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.handed_back";
			version: 1;
			data: {
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				handedBackByMembershipId: string & z42.$brand<"mem">;
				handedBackAt: string;
			};
		};
		safeParse: (input: unknown) => z42.ZodSafeParseResult<{
			id: string & z42.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z42.$brand<"org">;
			region: "eu" | "us";
			type: "conversation.handed_back";
			version: 1;
			data: {
				conversationId: string & z42.$brand<"cnv">;
				prospectId: string & z42.$brand<"prs">;
				channel: "chat" | "email" | "linkedin";
				handedBackByMembershipId: string & z42.$brand<"mem">;
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
import { ErrorDefinition as ErrorDefinition_8gwh4511 } from "..";
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
	readonly "inquiry.consent_wording_missing": ErrorDefinition_8gwh4511<"inquiry.consent_wording_missing">;
	readonly "inquiry.embed_invalid": ErrorDefinition_8gwh4511<"inquiry.embed_invalid">;
	readonly "inquiry.key_invalid": ErrorDefinition_8gwh4511<"inquiry.key_invalid">;
	readonly "inquiry.not_found": ErrorDefinition_8gwh4511<"inquiry.not_found">;
	readonly "inquiry.origin_not_allowed": ErrorDefinition_8gwh4511<"inquiry.origin_not_allowed">;
	readonly "inquiry.retries_exhausted": ErrorDefinition_8gwh4511<"inquiry.retries_exhausted">;
};
/** An Inquiry error code. */
type InquiryErrorCode = keyof typeof INQUIRY_ERRORS;
import { z as z43 } from "zod";
/**
* `voice.inquiry.received` (version 1): an Inquiry was stored and the Prospect upserted. Ids, the
* source and the time: no name, email, number, message, page address or Qualification answer.
*/
declare const voiceInquiryReceivedEvent: {
	type: "voice.inquiry.received";
	version: 1;
	schema: z43.ZodObject<{
		id: z43.core.$ZodBranded<z43.ZodString, "evt", "out">;
		occurredAt: z43.ZodISODateTime;
		organizationId: z43.core.$ZodBranded<z43.ZodString, "org", "out">;
		region: z43.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z43.ZodLiteral<"voice.inquiry.received">;
		version: z43.ZodLiteral<1>;
		data: z43.ZodObject<{
			inquiryId: z43.core.$ZodBranded<z43.ZodString, "inq", "out">;
			source: z43.ZodEnum<{
				call: "call";
				chat: "chat";
				form: "form";
			}>;
			prospectId: z43.core.$ZodBranded<z43.ZodString, "prs", "out">;
			chatId: z43.ZodNullable<z43.core.$ZodBranded<z43.ZodString, "cht", "out">>;
			callId: z43.ZodNullable<z43.core.$ZodBranded<z43.ZodString, "call", "out">>;
			receivedAt: z43.ZodISODateTime;
		}, z43.core.$strict>;
	}, z43.core.$strip>;
	parse: (input: unknown) => {
		id: string & z43.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z43.$brand<"org">;
		region: "eu" | "us";
		type: "voice.inquiry.received";
		version: 1;
		data: {
			inquiryId: string & z43.$brand<"inq">;
			source: "call" | "chat" | "form";
			prospectId: string & z43.$brand<"prs">;
			chatId: (string & z43.$brand<"cht">) | null;
			callId: (string & z43.$brand<"call">) | null;
			receivedAt: string;
		};
	};
	safeParse: (input: unknown) => z43.ZodSafeParseResult<{
		id: string & z43.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z43.$brand<"org">;
		region: "eu" | "us";
		type: "voice.inquiry.received";
		version: 1;
		data: {
			inquiryId: string & z43.$brand<"inq">;
			source: "call" | "chat" | "form";
			prospectId: string & z43.$brand<"prs">;
			chatId: (string & z43.$brand<"cht">) | null;
			callId: (string & z43.$brand<"call">) | null;
			receivedAt: string;
		};
	}>;
};
/** Every Inquiry event, by type. */
declare const INQUIRY_EVENTS: {
	readonly "voice.inquiry.received": {
		type: "voice.inquiry.received";
		version: 1;
		schema: z43.ZodObject<{
			id: z43.core.$ZodBranded<z43.ZodString, "evt", "out">;
			occurredAt: z43.ZodISODateTime;
			organizationId: z43.core.$ZodBranded<z43.ZodString, "org", "out">;
			region: z43.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z43.ZodLiteral<"voice.inquiry.received">;
			version: z43.ZodLiteral<1>;
			data: z43.ZodObject<{
				inquiryId: z43.core.$ZodBranded<z43.ZodString, "inq", "out">;
				source: z43.ZodEnum<{
					call: "call";
					chat: "chat";
					form: "form";
				}>;
				prospectId: z43.core.$ZodBranded<z43.ZodString, "prs", "out">;
				chatId: z43.ZodNullable<z43.core.$ZodBranded<z43.ZodString, "cht", "out">>;
				callId: z43.ZodNullable<z43.core.$ZodBranded<z43.ZodString, "call", "out">>;
				receivedAt: z43.ZodISODateTime;
			}, z43.core.$strict>;
		}, z43.core.$strip>;
		parse: (input: unknown) => {
			id: string & z43.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z43.$brand<"org">;
			region: "eu" | "us";
			type: "voice.inquiry.received";
			version: 1;
			data: {
				inquiryId: string & z43.$brand<"inq">;
				source: "call" | "chat" | "form";
				prospectId: string & z43.$brand<"prs">;
				chatId: (string & z43.$brand<"cht">) | null;
				callId: (string & z43.$brand<"call">) | null;
				receivedAt: string;
			};
		};
		safeParse: (input: unknown) => z43.ZodSafeParseResult<{
			id: string & z43.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z43.$brand<"org">;
			region: "eu" | "us";
			type: "voice.inquiry.received";
			version: 1;
			data: {
				inquiryId: string & z43.$brand<"inq">;
				source: "call" | "chat" | "form";
				prospectId: string & z43.$brand<"prs">;
				chatId: (string & z43.$brand<"cht">) | null;
				callId: (string & z43.$brand<"call">) | null;
				receivedAt: string;
			};
		}>;
	};
};
/** The type of an Inquiry event. */
type InquiryEventType = keyof typeof INQUIRY_EVENTS;
import { z as z44 } from "zod";
/**
* The callback of a form Inquiry. `skipReason` is set exactly when the state is `skipped`, so a
* callback that did not happen always says why. `attempts` counts dials (at most three) and
* `nextAttemptAt` is set while a retry waits (`no_answer`). Each attempt re-checks the Contact
* Consent for the phone channel at dial time; no field here can waive that check (ADR 0003).
*/
declare const inquiryCallbackSchema: z44.ZodObject<{
	state: z44.ZodEnum<{
		connected: "connected";
		dialling: "dialling";
		failed: "failed";
		no_answer: "no_answer";
		not_applicable: "not_applicable";
		pending: "pending";
		skipped: "skipped";
	}>;
	skipReason: z44.ZodNullable<z44.ZodEnum<{
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
	attempts: z44.ZodNumber;
	nextAttemptAt: z44.ZodNullable<z44.ZodISODateTime>;
	lastAttemptAt: z44.ZodNullable<z44.ZodISODateTime>;
}, z44.core.$strict>;
/** The callback of a form Inquiry. */
type InquiryCallback = z44.infer<typeof inquiryCallbackSchema>;
/**
* The Contact Consent evidence an Inquiry carries: the channel, the exact wording version shown
* and the page it was shown on. The wording text itself is in core's ledger. `phoneGranted` is
* whether the Prospect ticked the callback box.
*/
declare const inquiryConsentSchema: z44.ZodObject<{
	wordingId: z44.core.$ZodBranded<z44.ZodString, "cwd", "out">;
	wordingVersion: z44.ZodNumber;
	sourceUrl: z44.ZodString;
	phoneGranted: z44.ZodBoolean;
}, z44.core.$strict>;
/**
* An Inquiry: a request from a Prospect through a form, a Chat or a Call to talk to the
* Organization. `consent` is set for a form (and a Chat that captured a callback consent) and null
* for a Call. The Prospect's name, email and number are on the Prospect, not here. `chatId` is set
* exactly for a Chat Inquiry and `callId` for a Call Inquiry or once a callback connected.
*/
declare const inquirySchema: z44.ZodObject<{
	id: z44.core.$ZodBranded<z44.ZodString, "inq", "out">;
	source: z44.ZodEnum<{
		call: "call";
		chat: "chat";
		form: "form";
	}>;
	prospectId: z44.core.$ZodBranded<z44.ZodString, "prs", "out">;
	assignedToMembershipId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "mem", "out">>;
	chatId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "cht", "out">>;
	callId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "call", "out">>;
	consent: z44.ZodNullable<z44.ZodObject<{
		wordingId: z44.core.$ZodBranded<z44.ZodString, "cwd", "out">;
		wordingVersion: z44.ZodNumber;
		sourceUrl: z44.ZodString;
		phoneGranted: z44.ZodBoolean;
	}, z44.core.$strict>>;
	callback: z44.ZodObject<{
		state: z44.ZodEnum<{
			connected: "connected";
			dialling: "dialling";
			failed: "failed";
			no_answer: "no_answer";
			not_applicable: "not_applicable";
			pending: "pending";
			skipped: "skipped";
		}>;
		skipReason: z44.ZodNullable<z44.ZodEnum<{
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
		attempts: z44.ZodNumber;
		nextAttemptAt: z44.ZodNullable<z44.ZodISODateTime>;
		lastAttemptAt: z44.ZodNullable<z44.ZodISODateTime>;
	}, z44.core.$strict>;
	qualification: z44.ZodObject<{
		answers: z44.ZodArray<z44.ZodObject<{
			questionId: z44.core.$ZodBranded<z44.ZodString, "qst", "out">;
			value: z44.ZodNullable<z44.ZodUnion<readonly [z44.ZodPipe<z44.ZodString, z44.ZodString>, z44.ZodNumber, z44.ZodBoolean]>>;
			skipped: z44.ZodBoolean;
		}, z44.core.$strict>>;
		summary: z44.ZodNullable<z44.ZodPipe<z44.ZodString, z44.ZodString>>;
	}, z44.core.$strict>;
	receivedAt: z44.ZodISODateTime;
}, z44.core.$strict>;
/** An Inquiry. */
type Inquiry = z44.infer<typeof inquirySchema>;
/** The path parameters of a request about one Inquiry. */
declare const inquiryParamsSchema: z44.ZodObject<{
	inquiryId: z44.core.$ZodBranded<z44.ZodString, "inq", "out">;
}, z44.core.$strict>;
/** The cursor position an Inquiry list resumes from: latest first, then id. */
declare const inquiryCursorSchema: z44.ZodObject<{
	receivedAt: z44.ZodISODateTime;
	id: z44.core.$ZodBranded<z44.ZodString, "inq", "out">;
}, z44.core.$strict>;
/**
* The query parameters of a request to list Inquiries: latest first, one cursor-paginated page at
* a time, optionally narrowed by source, callback state, Prospect and a time range. What the
* caller sees is decided from the token and a filter never widens it.
*/
declare const listInquiriesQuerySchema: z44.ZodObject<{
	cursor: z44.ZodOptional<z44.ZodString>;
	limit: z44.ZodDefault<z44.ZodPipe<z44.ZodPipe<z44.ZodUnion<readonly [z44.ZodNumber, z44.ZodString]>, z44.ZodTransform<number, string | number>>, z44.ZodNumber>>;
	source: z44.ZodOptional<z44.ZodEnum<{
		call: "call";
		chat: "chat";
		form: "form";
	}>>;
	callbackState: z44.ZodOptional<z44.ZodEnum<{
		connected: "connected";
		dialling: "dialling";
		failed: "failed";
		no_answer: "no_answer";
		not_applicable: "not_applicable";
		pending: "pending";
		skipped: "skipped";
	}>>;
	prospectId: z44.ZodOptional<z44.core.$ZodBranded<z44.ZodString, "prs", "out">>;
	from: z44.ZodOptional<z44.ZodISODateTime>;
	to: z44.ZodOptional<z44.ZodISODateTime>;
}, z44.core.$strict>;
/** The query parameters of a request to list Inquiries. */
type ListInquiriesQuery = z44.infer<typeof listInquiriesQuerySchema>;
/** One page of Inquiries. */
declare const inquiryPageSchema: z44.ZodObject<{
	items: z44.ZodArray<z44.ZodObject<{
		id: z44.core.$ZodBranded<z44.ZodString, "inq", "out">;
		source: z44.ZodEnum<{
			call: "call";
			chat: "chat";
			form: "form";
		}>;
		prospectId: z44.core.$ZodBranded<z44.ZodString, "prs", "out">;
		assignedToMembershipId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "mem", "out">>;
		chatId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "cht", "out">>;
		callId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "call", "out">>;
		consent: z44.ZodNullable<z44.ZodObject<{
			wordingId: z44.core.$ZodBranded<z44.ZodString, "cwd", "out">;
			wordingVersion: z44.ZodNumber;
			sourceUrl: z44.ZodString;
			phoneGranted: z44.ZodBoolean;
		}, z44.core.$strict>>;
		callback: z44.ZodObject<{
			state: z44.ZodEnum<{
				connected: "connected";
				dialling: "dialling";
				failed: "failed";
				no_answer: "no_answer";
				not_applicable: "not_applicable";
				pending: "pending";
				skipped: "skipped";
			}>;
			skipReason: z44.ZodNullable<z44.ZodEnum<{
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
			attempts: z44.ZodNumber;
			nextAttemptAt: z44.ZodNullable<z44.ZodISODateTime>;
			lastAttemptAt: z44.ZodNullable<z44.ZodISODateTime>;
		}, z44.core.$strict>;
		qualification: z44.ZodObject<{
			answers: z44.ZodArray<z44.ZodObject<{
				questionId: z44.core.$ZodBranded<z44.ZodString, "qst", "out">;
				value: z44.ZodNullable<z44.ZodUnion<readonly [z44.ZodPipe<z44.ZodString, z44.ZodString>, z44.ZodNumber, z44.ZodBoolean]>>;
				skipped: z44.ZodBoolean;
			}, z44.core.$strict>>;
			summary: z44.ZodNullable<z44.ZodPipe<z44.ZodString, z44.ZodString>>;
		}, z44.core.$strict>;
		receivedAt: z44.ZodISODateTime;
	}, z44.core.$strict>>;
	nextCursor: z44.ZodNullable<z44.ZodString>;
}, z44.core.$strip>;
/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
declare const inquiryKeyedHeadersSchema: z44.ZodObject<{
	"idempotency-key": z44.ZodString;
}, z44.core.$strip>;
/**
* The embed settings of an Organization's Inquiry form and Chat: the publishable key, the origins
* allowed to submit and the Consent Wording the form displays (null until chosen; an embed with no
* wording is not live). Only Owner and Admin read them.
*/
declare const inquiryEmbedSchema: z44.ZodObject<{
	publishableKey: z44.ZodString;
	allowedOrigins: z44.ZodArray<z44.ZodString>;
	consentWordingId: z44.ZodNullable<z44.core.$ZodBranded<z44.ZodString, "cwd", "out">>;
	updatedAt: z44.ZodNullable<z44.ZodISODateTime>;
}, z44.core.$strict>;
/** The embed settings. */
type InquiryEmbed = z44.infer<typeof inquiryEmbedSchema>;
/** The body of a request to set the allowed origins and the displayed wording; it replaces them, so a repeat changes nothing. */
declare const setInquiryEmbedRequestSchema: z44.ZodObject<{
	allowedOrigins: z44.ZodArray<z44.ZodString>;
	consentWordingId: z44.core.$ZodBranded<z44.ZodString, "cwd", "out">;
}, z44.core.$strict>;
/** The body of a request to set the embed settings. */
type SetInquiryEmbedRequest = z44.infer<typeof setInquiryEmbedRequestSchema>;
/** The path parameters of every public Inquiry route: the publishable key. */
declare const publicInquiryParamsSchema: z44.ZodObject<{
	key: z44.ZodString;
}, z44.core.$strict>;
/**
* The headers of a public request that does not change anything: the `Origin` the browser sends,
* which must be one of the Organization's allowed origins (`inquiry.origin_not_allowed`).
*/
declare const publicOriginHeadersSchema: z44.ZodObject<{
	origin: z44.ZodString;
}, z44.core.$strip>;
/**
* The headers of a public submission: the `Origin` and a required `Idempotency-Key` (16 to 128
* characters; the client generates one per submission), so a double click records one Inquiry and
* causes one callback.
*/
declare const publicInquiryHeadersSchema: z44.ZodObject<{
	origin: z44.ZodString;
	"idempotency-key": z44.ZodString;
}, z44.core.$strip>;
/**
* What the embedded form displays: the Organization's name, the exact Consent Wording to show next
* to the callback box (and its id and version, to send back) and that an AI will make the call. It
* has nothing about any Prospect, Rep or internal id beyond the wording.
*/
declare const publicInquiryFormViewSchema: z44.ZodObject<{
	organizationName: z44.ZodPipe<z44.ZodString, z44.ZodString>;
	wordingId: z44.core.$ZodBranded<z44.ZodString, "cwd", "out">;
	wordingVersion: z44.ZodNumber;
	wordingText: z44.ZodPipe<z44.ZodString, z44.ZodString>;
	aiNotice: z44.ZodPipe<z44.ZodString, z44.ZodString>;
}, z44.core.$strict>;
/** What the embedded form displays. */
type PublicInquiryFormView = z44.infer<typeof publicInquiryFormViewSchema>;
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
declare const publicInquiryRequestSchema: z44.ZodObject<{
	name: z44.ZodPipe<z44.ZodString, z44.ZodString>;
	phone: z44.ZodPipe<z44.ZodString, z44.ZodString>;
	email: z44.ZodOptional<z44.ZodPipe<z44.ZodPipe<z44.ZodString, z44.ZodTransform<string, string>>, z44.ZodString>>;
	message: z44.ZodOptional<z44.ZodPipe<z44.ZodString, z44.ZodString>>;
	consentWordingId: z44.core.$ZodBranded<z44.ZodString, "cwd", "out">;
	consentWordingVersion: z44.ZodNumber;
	callbackConsent: z44.ZodBoolean;
	sourceUrl: z44.ZodString;
	website: z44.ZodDefault<z44.ZodString>;
}, z44.core.$strict>;
/** The body of a public Inquiry. */
type PublicInquiryRequest = z44.infer<typeof publicInquiryRequestSchema>;
/**
* The receipt a Prospect gets: that it arrived, and when. It says nothing about whether a call is
* coming, so a public caller cannot learn whether a number is suppressed, revoked or blocked by a
* paused Agent or the hours. No Inquiry, Prospect, Rep or Organization id, and no echo of the
* address or number.
*/
declare const publicInquiryReceiptSchema: z44.ZodObject<{
	received: z44.ZodLiteral<true>;
	receivedAt: z44.ZodISODateTime;
}, z44.core.$strict>;
/** The receipt a Prospect gets. */
type PublicInquiryReceipt = z44.infer<typeof publicInquiryReceiptSchema>;
import { z as z45 } from "zod";
/** The kinds of Qualification question: free text, one choice from a list, a number, or yes or no. */
declare const QUALIFICATION_QUESTION_KINDS: readonly ["free_text", "choice", "number", "yes_no"];
/** The kind of a Qualification question. */
declare const qualificationQuestionKindSchema: z45.ZodEnum<{
	choice: "choice";
	free_text: "free_text";
	number: "number";
	yes_no: "yes_no";
}>;
/** The kind of a Qualification question. */
type QualificationQuestionKind = z45.infer<typeof qualificationQuestionKindSchema>;
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
declare const questionPromptSchema: z45.ZodPipe<z45.ZodString, z45.ZodString>;
/** The value of a Qualification answer or a skip comparison: text, a number or a yes or no. */
declare const qualificationValueSchema: z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>;
/** The value of a Qualification answer or a skip comparison. */
type QualificationValue = z45.infer<typeof qualificationValueSchema>;
/** The tests a skip condition makes of an earlier answer. */
declare const SKIP_OPERATORS: readonly ["equals", "not_equals", "greater_than", "less_than", "answered", "not_answered"];
/** A test a skip condition makes of an earlier answer. */
declare const skipOperatorSchema: z45.ZodEnum<{
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
declare const skipConditionSchema: z45.ZodObject<{
	questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
	operator: z45.ZodEnum<{
		answered: "answered";
		equals: "equals";
		greater_than: "greater_than";
		less_than: "less_than";
		not_answered: "not_answered";
		not_equals: "not_equals";
	}>;
	value: z45.ZodOptional<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
}, z45.core.$strict>;
/** One condition of the skip logic. */
type SkipCondition = z45.infer<typeof skipConditionSchema>;
/**
* A Qualification question an Admin wrote for the Inbound Agent to ask. `position` orders the
* questions from 1. The question is skipped when every condition of `skipWhen` holds (an empty list
* never skips). The questions feed routing as Prospect attributes; a question's wording is
* tenant data and untrusted for display.
*/
declare const qualificationQuestionSchema: z45.ZodObject<{
	id: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
	position: z45.ZodNumber;
	prompt: z45.ZodPipe<z45.ZodString, z45.ZodString>;
	kind: z45.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z45.ZodNullable<z45.ZodArray<z45.ZodPipe<z45.ZodString, z45.ZodString>>>;
	required: z45.ZodBoolean;
	skipWhen: z45.ZodArray<z45.ZodObject<{
		questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
		operator: z45.ZodEnum<{
			answered: "answered";
			equals: "equals";
			greater_than: "greater_than";
			less_than: "less_than";
			not_answered: "not_answered";
			not_equals: "not_equals";
		}>;
		value: z45.ZodOptional<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
	}, z45.core.$strict>>;
}, z45.core.$strict>;
/** A Qualification question. */
type QualificationQuestion = z45.infer<typeof qualificationQuestionSchema>;
/** The path parameters of a request about one Qualification question. */
declare const qualificationQuestionParamsSchema: z45.ZodObject<{
	questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
}, z45.core.$strict>;
/** The body of a request to write a Qualification question; it goes last unless `position` says otherwise. */
declare const createQualificationQuestionRequestSchema: z45.ZodObject<{
	prompt: z45.ZodPipe<z45.ZodString, z45.ZodString>;
	kind: z45.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z45.ZodDefault<z45.ZodNullable<z45.ZodArray<z45.ZodPipe<z45.ZodString, z45.ZodString>>>>;
	required: z45.ZodDefault<z45.ZodBoolean>;
	skipWhen: z45.ZodDefault<z45.ZodArray<z45.ZodObject<{
		questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
		operator: z45.ZodEnum<{
			answered: "answered";
			equals: "equals";
			greater_than: "greater_than";
			less_than: "less_than";
			not_answered: "not_answered";
			not_equals: "not_equals";
		}>;
		value: z45.ZodOptional<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
	}, z45.core.$strict>>>;
	position: z45.ZodOptional<z45.ZodNumber>;
}, z45.core.$strict>;
/** The body of a request to write a Qualification question. */
type CreateQualificationQuestionRequest = z45.infer<typeof createQualificationQuestionRequestSchema>;
/** The body of a request to replace a Qualification question's content; the position changes by reorder. */
declare const updateQualificationQuestionRequestSchema: z45.ZodObject<{
	prompt: z45.ZodPipe<z45.ZodString, z45.ZodString>;
	kind: z45.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z45.ZodNullable<z45.ZodArray<z45.ZodPipe<z45.ZodString, z45.ZodString>>>;
	required: z45.ZodBoolean;
	skipWhen: z45.ZodArray<z45.ZodObject<{
		questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
		operator: z45.ZodEnum<{
			answered: "answered";
			equals: "equals";
			greater_than: "greater_than";
			less_than: "less_than";
			not_answered: "not_answered";
			not_equals: "not_equals";
		}>;
		value: z45.ZodOptional<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
	}, z45.core.$strict>>;
}, z45.core.$strict>;
/** The body of a request to replace a Qualification question. */
type UpdateQualificationQuestionRequest = z45.infer<typeof updateQualificationQuestionRequestSchema>;
/** The body of a request to reorder the questions: every id once, in the new order. */
declare const reorderQualificationQuestionsRequestSchema: z45.ZodObject<{
	questionIds: z45.ZodArray<z45.core.$ZodBranded<z45.ZodString, "qst", "out">>;
}, z45.core.$strict>;
/** The query parameters of a request to list questions, in order of position. */
declare const listQualificationQuestionsQuerySchema: z45.ZodObject<{
	cursor: z45.ZodOptional<z45.ZodString>;
	limit: z45.ZodDefault<z45.ZodPipe<z45.ZodPipe<z45.ZodUnion<readonly [z45.ZodNumber, z45.ZodString]>, z45.ZodTransform<number, string | number>>, z45.ZodNumber>>;
}, z45.core.$strict>;
/** One page of Qualification questions. */
declare const qualificationQuestionPageSchema: z45.ZodObject<{
	items: z45.ZodArray<z45.ZodObject<{
		id: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
		position: z45.ZodNumber;
		prompt: z45.ZodPipe<z45.ZodString, z45.ZodString>;
		kind: z45.ZodEnum<{
			choice: "choice";
			free_text: "free_text";
			number: "number";
			yes_no: "yes_no";
		}>;
		choices: z45.ZodNullable<z45.ZodArray<z45.ZodPipe<z45.ZodString, z45.ZodString>>>;
		required: z45.ZodBoolean;
		skipWhen: z45.ZodArray<z45.ZodObject<{
			questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
			operator: z45.ZodEnum<{
				answered: "answered";
				equals: "equals";
				greater_than: "greater_than";
				less_than: "less_than";
				not_answered: "not_answered";
				not_equals: "not_equals";
			}>;
			value: z45.ZodOptional<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
		}, z45.core.$strict>>;
	}, z45.core.$strict>>;
	nextCursor: z45.ZodNullable<z45.ZodString>;
}, z45.core.$strip>;
/** A suggested question, drawn from the Organization's won Deals; an Admin approves it by creating it. It has no id and is not stored. */
declare const suggestedQualificationQuestionSchema: z45.ZodObject<{
	prompt: z45.ZodPipe<z45.ZodString, z45.ZodString>;
	kind: z45.ZodEnum<{
		choice: "choice";
		free_text: "free_text";
		number: "number";
		yes_no: "yes_no";
	}>;
	choices: z45.ZodNullable<z45.ZodArray<z45.ZodPipe<z45.ZodString, z45.ZodString>>>;
}, z45.core.$strict>;
/** A suggested question. */
type SuggestedQualificationQuestion = z45.infer<typeof suggestedQualificationQuestionSchema>;
/** The answer to a request for suggestions: at most ten, not stored. */
declare const questionSuggestionsSchema: z45.ZodObject<{
	items: z45.ZodArray<z45.ZodObject<{
		prompt: z45.ZodPipe<z45.ZodString, z45.ZodString>;
		kind: z45.ZodEnum<{
			choice: "choice";
			free_text: "free_text";
			number: "number";
			yes_no: "yes_no";
		}>;
		choices: z45.ZodNullable<z45.ZodArray<z45.ZodPipe<z45.ZodString, z45.ZodString>>>;
	}, z45.core.$strict>>;
}, z45.core.$strict>;
/**
* One answer of a Qualification. `value` is null when the question was skipped by its skip logic or
* the Prospect declined; `skipped` says which of the two cases a null is.
*/
declare const qualificationAnswerSchema: z45.ZodObject<{
	questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
	value: z45.ZodNullable<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
	skipped: z45.ZodBoolean;
}, z45.core.$strict>;
/** One answer of a Qualification. */
type QualificationAnswer = z45.infer<typeof qualificationAnswerSchema>;
/** The longest Qualification summary, in characters. */
declare const MAX_QUALIFICATION_SUMMARY_LENGTH = 2e3;
/**
* The Qualification of an Inquiry: the answers so far and a short summary (null until the Agent
* writes one). It is tenant data about a Prospect, and untrusted text: it came from the Prospect.
*/
declare const qualificationSchema: z45.ZodObject<{
	answers: z45.ZodArray<z45.ZodObject<{
		questionId: z45.core.$ZodBranded<z45.ZodString, "qst", "out">;
		value: z45.ZodNullable<z45.ZodUnion<readonly [z45.ZodPipe<z45.ZodString, z45.ZodString>, z45.ZodNumber, z45.ZodBoolean]>>;
		skipped: z45.ZodBoolean;
	}, z45.core.$strict>>;
	summary: z45.ZodNullable<z45.ZodPipe<z45.ZodString, z45.ZodString>>;
}, z45.core.$strict>;
/** The Qualification of an Inquiry. */
type Qualification = z45.infer<typeof qualificationSchema>;
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
import { z as z46 } from "zod";
/** Where an Inquiry came from: a form embedded on the Organization's site, a Chat, or a Call to a Line. */
declare const INQUIRY_SOURCES: readonly ["form", "chat", "call"];
/** Where an Inquiry came from. */
declare const inquirySourceSchema: z46.ZodEnum<{
	call: "call";
	chat: "chat";
	form: "form";
}>;
/** Where an Inquiry came from. */
type InquirySource = z46.infer<typeof inquirySourceSchema>;
/**
* The states of the Agent's callback for a form Inquiry. `not_applicable` is a Chat or a Call
* Inquiry (the Prospect initiated it live); `pending` waits to be dialled; `dialling` and
* `connected` follow the attempt; `no_answer` waits for a retry (at most two); `skipped` did not
* happen and `skipReason` says why; `failed` ended in an error.
*/
declare const INQUIRY_CALLBACK_STATES: readonly ["not_applicable", "pending", "dialling", "connected", "no_answer", "skipped", "failed"];
/** The state of the callback for an Inquiry. */
declare const inquiryCallbackStateSchema: z46.ZodEnum<{
	connected: "connected";
	dialling: "dialling";
	failed: "failed";
	no_answer: "no_answer";
	not_applicable: "not_applicable";
	pending: "pending";
	skipped: "skipped";
}>;
/** The state of the callback for an Inquiry. */
type InquiryCallbackState = z46.infer<typeof inquiryCallbackStateSchema>;
/**
* Why a callback did not happen: a closed list the portal maps to its own wording (user story 27).
* Each one is a refusal of the gate, never a setting. `no_consent` includes a Prospect who did not
* tick the callback box; `consent_check_unavailable` is core unreachable, which counts as "no".
*/
declare const INQUIRY_SKIP_REASONS: readonly ["agent_paused", "no_consent", "consent_revoked", "suppressed", "outside_hours", "consent_check_unavailable", "no_phone_number", "concurrency_cap", "retries_exhausted"];
/** Why a callback did not happen. */
declare const inquirySkipReasonSchema: z46.ZodEnum<{
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
type InquirySkipReason = z46.infer<typeof inquirySkipReasonSchema>;
/** The most callback attempts for one Inquiry: the first and at most two retries. */
declare const MAX_CALLBACK_ATTEMPTS = 3;
/** The most origins an Organization may allow to submit its Inquiry form or Chat. */
declare const MAX_ALLOWED_ORIGINS = 20;
/**
* A web origin: scheme, host and optional port, with no path, query or wildcard. `https` only,
* except `http://localhost` and `http://127.0.0.1` for development. It is what a browser sends in
* the `Origin` header.
*/
declare const allowedOriginSchema: z46.ZodString;
/** A web origin. */
type AllowedOrigin = z46.infer<typeof allowedOriginSchema>;
/**
* The publishable key of an Organization's Inquiry form and Chat: 32 to 64 URL-safe characters. It
* is shown in the Organization's web pages, so it is not a secret in itself; what it opens is
* limited to the allowed origins, and it can be rotated. Services still redact it from logs.
*/
declare const inquiryKeySchema: z46.ZodString;
/** The longest URL of the page a form or Chat was used on, in characters. */
declare const MAX_SOURCE_URL_LENGTH = 2048;
/** The address of the page a Prospect submitted the form on, or opened the Chat on: an `http(s)` URL with no whitespace. Evidence for the Contact Consent. */
declare const sourceUrlSchema: z46.ZodString;
/** The longest message a Prospect may leave with a form Inquiry, in characters. */
declare const MAX_INQUIRY_MESSAGE_LENGTH = 2e3;
/** The message a Prospect leaves with a form Inquiry: bounded text with no control character, untrusted. */
declare const inquiryMessageSchema: z46.ZodPipe<z46.ZodString, z46.ZodString>;
/** The longest honeypot value a public form may send. */
declare const MAX_HONEYPOT_LENGTH = 200;
import { z as z47 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh4512 } from "..";
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
	readonly "marketing.invalid_request": ErrorDefinition_8gwh4512<"marketing.invalid_request">;
	readonly "marketing.rate_limited": ErrorDefinition_8gwh4512<"marketing.rate_limited">;
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
declare const demoRequestMessageSchema: z47.ZodPipe<z47.ZodString, z47.ZodTransform<string, string>>;
/**
* The site page a Visitor submitted from: an absolute path such as `/pricing`, at most 200
* characters of printable ASCII with no whitespace, so a full URL or a script cannot be put in it.
*/
declare const demoRequestSourcePageSchema: z47.ZodString;
/**
* The body of `POST /v1/marketing/demo-requests`, sent by a Visitor (nobody signed in): name, work
* email (folded to lower case), company name, an optional message, the page it came from and a
* honeypot. The honeypot, `website`, is a field the form hides from people: a Visitor leaves it
* empty (and may omit it), so a non-empty value marks a bot. It still parses, so the service can
* answer exactly as it does for a real request and store nothing. The idempotency key is not in
* the body; it is the `Idempotency-Key` header (`idempotencyKeySchema`). The schema is strict:
* an unknown key is `marketing.invalid_request`.
*/
declare const createDemoRequestRequestSchema: z47.ZodObject<{
	name: z47.ZodPipe<z47.ZodString, z47.ZodString>;
	workEmail: z47.ZodPipe<z47.ZodPipe<z47.ZodString, z47.ZodTransform<string, string>>, z47.ZodString>;
	companyName: z47.ZodPipe<z47.ZodString, z47.ZodString>;
	message: z47.ZodOptional<z47.ZodPipe<z47.ZodString, z47.ZodTransform<string, string>>>;
	sourcePage: z47.ZodString;
	website: z47.ZodDefault<z47.ZodString>;
}, z47.core.$strict>;
/** The body of a request to submit a Demo Request. */
type CreateDemoRequestRequest = z47.infer<typeof createDemoRequestRequestSchema>;
/**
* The acknowledgement of a Demo Request: its id and nothing else, so no submitted field comes
* back. A replay under the same `Idempotency-Key` returns the same id.
*/
declare const createDemoRequestResponseSchema: z47.ZodObject<{
	id: z47.core.$ZodBranded<z47.ZodString, "dreq", "out">;
}, z47.core.$strip>;
/** The acknowledgement of a Demo Request. */
type CreateDemoRequestResponse = z47.infer<typeof createDemoRequestResponseSchema>;
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
import { z as z48 } from "zod";
/** The largest page any list endpoint returns. */
declare const MAX_PAGE_SIZE = 100;
/** The page size used when a request does not ask for one. */
declare const DEFAULT_PAGE_SIZE = 25;
/** The longest cursor accepted or produced; about 380 bytes of JSON. */
declare const MAX_CURSOR_LENGTH = 512;
/** The query parameters of a list request: an optional cursor and a bounded limit (from a number or digit string). */
declare const pageQuerySchema: z48.ZodObject<{
	cursor: z48.ZodOptional<z48.ZodString>;
	limit: z48.ZodDefault<z48.ZodPipe<z48.ZodPipe<z48.ZodUnion<readonly [z48.ZodNumber, z48.ZodString]>, z48.ZodTransform<number, string | number>>, z48.ZodNumber>>;
}, z48.core.$strip>;
/** The parsed query parameters of a list request. */
type PageQuery = z48.infer<typeof pageQuerySchema>;
/** Builds the schema of one page of `itemSchema` items and the cursor for the next page, or null at the end. */
declare function pageSchema<T extends z48.ZodType>(itemSchema: T): z48.ZodObject<{
	items: z48.ZodArray<T>;
	nextCursor: z48.ZodNullable<z48.ZodString>;
}, z48.core.$strip>;
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
declare function decodeCursor<T extends z48.ZodType>(text: string, schema: T): z48.output<T> | undefined;
import { ErrorDefinition as ErrorDefinition_8gwh4513 } from "..";
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
	readonly "document.not_found": ErrorDefinition_8gwh4513<"document.not_found">;
	readonly "document.not_restorable": ErrorDefinition_8gwh4513<"document.not_restorable">;
	readonly "document.quota_exceeded": ErrorDefinition_8gwh4513<"document.quota_exceeded">;
	readonly "document.too_large": ErrorDefinition_8gwh4513<"document.too_large">;
	readonly "document.unsupported_type": ErrorDefinition_8gwh4513<"document.unsupported_type">;
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
import { z as z49 } from "zod";
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
declare const searchTurnSchema: z49.ZodObject<{
	role: z49.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
	}>;
	text: z49.ZodString;
}, z49.core.$strict>;
/** One turn of the live conversation. */
type SearchTurn = z49.infer<typeof searchTurnSchema>;
/**
* The body of a search over won Deals: the latest turns of the conversation (1 to
* `MAX_SEARCH_TURNS`, at most `MAX_SEARCH_TEXT_CHARACTERS` code points in all) and an optional
* `limit` (1 to `MAX_SEARCH_LIMIT`, default `DEFAULT_SEARCH_LIMIT`). It is conversation text of the
* Organization, so it is sent in a body and never logged. An unknown key is rejected.
*/
declare const searchMomentsRequestSchema: z49.ZodObject<{
	turns: z49.ZodArray<z49.ZodObject<{
		role: z49.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		text: z49.ZodString;
	}, z49.core.$strict>>;
	limit: z49.ZodDefault<z49.ZodNumber>;
}, z49.core.$strict>;
/** The body of a search over won Deals, with the default limit applied. */
type SearchMomentsRequest = z49.infer<typeof searchMomentsRequestSchema>;
/**
* A short piece of a Moment's text: at most `MAX_MOMENT_SNIPPET_CHARACTERS` code points, possibly
* empty, well-formed and with no control or bidirectional character (newlines and tabs included),
* the same rule as a speaker excerpt. Build one with {@link momentSnippet}. Tenant Transcript text.
*/
declare const momentSnippetSchema: z49.ZodString;
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
declare const momentMatchSchema: z49.ZodObject<{
	callId: z49.core.$ZodBranded<z49.ZodString, "call", "out">;
	dealRecordId: z49.core.$ZodBranded<z49.ZodString, "deal", "out">;
	score: z49.ZodNumber;
	prospect: z49.ZodString;
	repNext: z49.ZodString;
}, z49.core.$strip>;
/** One similar Moment from a won Deal. */
type MomentMatch = z49.infer<typeof momentMatchSchema>;
/** How much a search found: `moments` candidates that may be returned and the distinct won Deals (`deals`) among them, both at most `MAX_SEARCH_CANDIDATES`. */
declare const searchEvidenceSchema: z49.ZodObject<{
	moments: z49.ZodNumber;
	deals: z49.ZodNumber;
}, z49.core.$strip>;
/** How much a search found. */
type SearchEvidence = z49.infer<typeof searchEvidenceSchema>;
/**
* The answer to a search: the best matches, at most `MAX_SEARCH_LIMIT`, best first, and the
* evidence. There is no cursor: the result is a bounded top-k. The items are the first of the
* `moments` candidates and the Deals are among them, so neither count is above `evidence.moments`, and `evidence.deals` is at least the number of distinct Deals among the items.
*/
declare const searchMomentsResponseSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		callId: z49.core.$ZodBranded<z49.ZodString, "call", "out">;
		dealRecordId: z49.core.$ZodBranded<z49.ZodString, "deal", "out">;
		score: z49.ZodNumber;
		prospect: z49.ZodString;
		repNext: z49.ZodString;
	}, z49.core.$strip>>;
	evidence: z49.ZodObject<{
		moments: z49.ZodNumber;
		deals: z49.ZodNumber;
	}, z49.core.$strip>;
}, z49.core.$strip>;
/** The answer to a search. */
type SearchMomentsResponse = z49.infer<typeof searchMomentsResponseSchema>;
/**
* The text that is embedded for a window of turns: one `Rep: ` or `Prospect: ` line per turn,
* joined by a newline. The indexer (a Moment's text) and the search (the query) both call this, so
* what is stored and what is asked cannot drift, so the indexer must use this function too. Each
* turn's text is trimmed. It adds no speaker label and no Rep reply. The
* result is tenant conversation text: never log it.
*/
declare function momentQueryText(turns: readonly SearchTurn[]): string;
/** The body of a search over Playbook documents: the same turns and limit as {@link searchMomentsRequestSchema}, with the same bounds. Tenant conversation text: never logged. */
declare const searchDocumentsRequestSchema: z49.ZodObject<{
	turns: z49.ZodArray<z49.ZodObject<{
		role: z49.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		text: z49.ZodString;
	}, z49.core.$strict>>;
	limit: z49.ZodDefault<z49.ZodNumber>;
}, z49.core.$strict>;
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
declare const documentMatchSchema: z49.ZodObject<{
	documentId: z49.core.$ZodBranded<z49.ZodString, "doc", "out">;
	fileName: z49.ZodPipe<z49.ZodPipe<z49.ZodString, z49.ZodTransform<string, string>>, z49.ZodString>;
	page: z49.ZodNullable<z49.ZodNumber>;
	score: z49.ZodNumber;
	snippet: z49.ZodString;
}, z49.core.$strip>;
/** One matching passage of a Playbook document. */
type DocumentMatch = z49.infer<typeof documentMatchSchema>;
/** How much a document search found: `chunks` that may be returned and the distinct `documents` among them, both at most `MAX_SEARCH_CANDIDATES`. */
declare const documentSearchEvidenceSchema: z49.ZodObject<{
	chunks: z49.ZodNumber;
	documents: z49.ZodNumber;
}, z49.core.$strip>;
/** How much a document search found. */
type DocumentSearchEvidence = z49.infer<typeof documentSearchEvidenceSchema>;
/**
* The answer to a document search: the best passages, at most `MAX_SEARCH_LIMIT`, best first, and
* the evidence. There is no cursor. As for Moments, neither the items nor the documents exceed
* `evidence.chunks`, and `evidence.documents` is at least the number of distinct documents among
* the items.
*/
declare const searchDocumentsResponseSchema: z49.ZodObject<{
	items: z49.ZodArray<z49.ZodObject<{
		documentId: z49.core.$ZodBranded<z49.ZodString, "doc", "out">;
		fileName: z49.ZodPipe<z49.ZodPipe<z49.ZodString, z49.ZodTransform<string, string>>, z49.ZodString>;
		page: z49.ZodNullable<z49.ZodNumber>;
		score: z49.ZodNumber;
		snippet: z49.ZodString;
	}, z49.core.$strip>>;
	evidence: z49.ZodObject<{
		chunks: z49.ZodNumber;
		documents: z49.ZodNumber;
	}, z49.core.$strip>;
}, z49.core.$strip>;
/** The answer to a document search. */
type SearchDocumentsResponse = z49.infer<typeof searchDocumentsResponseSchema>;
/** The search routes, by name. */
type SearchRouteName = "searchMoments" | "searchDocuments";
/**
* The search routes: read-only `POST`s (the body is conversation text). `searchMoments` is for
* Owner and Admin only (the roles that read sales history); `searchDocuments` is for every role
* that reads the Playbook. They use existing codes only, so they have no domain code of their own.
*/
declare const SEARCH_ROUTES: Readonly<Record<SearchRouteName, PlaybookRoute>>;
import { ErrorDefinition as ErrorDefinition_8gwh4514 } from "..";
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
	"call.content_in_other_deal": ErrorDefinition_8gwh4514<"call.content_in_other_deal">;
	"call.not_found": ErrorDefinition_8gwh4514<"call.not_found">;
	"call.not_restorable": ErrorDefinition_8gwh4514<"call.not_restorable">;
	"call.quota_exceeded": ErrorDefinition_8gwh4514<"call.quota_exceeded">;
	"call.rep_invalid": ErrorDefinition_8gwh4514<"call.rep_invalid">;
	"call.rep_not_changeable": ErrorDefinition_8gwh4514<"call.rep_not_changeable">;
	"call.too_large": ErrorDefinition_8gwh4514<"call.too_large">;
	"call.unsupported_type": ErrorDefinition_8gwh4514<"call.unsupported_type">;
	"deal.not_found": ErrorDefinition_8gwh4514<"deal.not_found">;
	"deal_import.busy": ErrorDefinition_8gwh4514<"deal_import.busy">;
	"deal_import.header_invalid": ErrorDefinition_8gwh4514<"deal_import.header_invalid">;
	"deal_import.not_found": ErrorDefinition_8gwh4514<"deal_import.not_found">;
	"deal_import.too_large": ErrorDefinition_8gwh4514<"deal_import.too_large">;
	"deal_import.unsupported_type": ErrorDefinition_8gwh4514<"deal_import.unsupported_type">;
	"document.not_found": ErrorDefinition_8gwh4514<"document.not_found">;
	"document.not_restorable": ErrorDefinition_8gwh4514<"document.not_restorable">;
	"document.quota_exceeded": ErrorDefinition_8gwh4514<"document.quota_exceeded">;
	"document.too_large": ErrorDefinition_8gwh4514<"document.too_large">;
	"document.unsupported_type": ErrorDefinition_8gwh4514<"document.unsupported_type">;
	"rights.confirmation_required": ErrorDefinition_8gwh4514<"rights.confirmation_required">;
	"rights.version_outdated": ErrorDefinition_8gwh4514<"rights.version_outdated">;
}>;
import { z as z51 } from "zod";
import { z as z50 } from "zod";
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
declare const callStateSchema: z50.ZodEnum<{
	awaiting_rep: "awaiting_rep";
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	transcribing: "transcribing";
	uploaded: "uploaded";
}>;
/** The state of a Call. */
type CallState = z50.infer<typeof callStateSchema>;
/**
* Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text.
* `too_long` is found by the job from the audio, not at upload, so it is a reason and not an HTTP
* code. `too_many_speakers` is a Call with more speakers than `MAX_CALL_SPEAKERS`. `rep_label_not_found` and `not_per_side` can be fixed by changing the Rep (see {@link repChangeAllowed}). The list is the
* lead's reading of ADR 0018.
*/
declare const CALL_FAILURE_REASONS: readonly ["no_turns", "too_few_speakers", "too_many_speakers", "rep_label_not_found", "not_per_side", "too_long", "transcription_failed", "transcription_timed_out", "unreadable", "processing_failed"];
/** Why a Call ended in `failed`. */
declare const callFailureReasonSchema: z50.ZodEnum<{
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
type CallFailureReason = z50.infer<typeof callFailureReasonSchema>;
/** What a Call was uploaded as: a written Transcript or an audio Recording. */
declare const CALL_KINDS: readonly ["transcript", "recording"];
/** What a Call was uploaded as. */
declare const callKindSchema: z50.ZodEnum<{
	recording: "recording";
	transcript: "transcript";
}>;
/** What a Call was uploaded as. */
type CallKind = z50.infer<typeof callKindSchema>;
/** The lead's default (ADR 0018, refinements; not the owner's): the Transcript extensions accepted: plain text, WebVTT, SRT and a JSON turn list. */
declare const ACCEPTED_TRANSCRIPT_EXTENSIONS: readonly [".txt", ".vtt", ".srt", ".json"];
/** The lead's default (ADR 0018, refinements; not the owner's): the Recording extensions accepted. */
declare const ACCEPTED_RECORDING_EXTENSIONS: readonly [".mp3", ".m4a", ".wav", ".ogg", ".webm", ".flac"];
/** An accepted Call file extension. */
type AcceptedCallExtension = (typeof ACCEPTED_TRANSCRIPT_EXTENSIONS)[number] | (typeof ACCEPTED_RECORDING_EXTENSIONS)[number];
/** The media type of a stored Call file, as the service detected it from the content. */
declare const CALL_MEDIA_TYPES: readonly ["text/plain", "text/vtt", "application/x-subrip", "application/json", "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm", "audio/flac"];
/** The media type of a stored Call file. */
declare const callMediaTypeSchema: z50.ZodEnum<{
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
type CallMediaType = z50.infer<typeof callMediaTypeSchema>;
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
declare const speakerLabelSchema: z50.ZodPipe<z50.ZodPipe<z50.ZodString, z50.ZodTransform<string, string>>, z50.ZodString>;
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
declare const speakerExcerptSchema: z50.ZodObject<{
	label: z50.ZodPipe<z50.ZodPipe<z50.ZodString, z50.ZodTransform<string, string>>, z50.ZodString>;
	excerpt: z50.ZodString;
}, z50.core.$strict>;
/** One speaker of a Call with a short excerpt. */
type SpeakerExcerpt = z50.infer<typeof speakerExcerptSchema>;
/** The channels of a per-side Recording: the left one or the right one. */
declare const CALL_CHANNELS: readonly ["left", "right"];
/** A channel of a per-side Recording. */
declare const callChannelSchema: z50.ZodEnum<{
	left: "left";
	right: "right";
}>;
/**
* Which side of a Call is the Rep: a speaker label (a Transcript, or a Recording that waited in
* `awaiting_rep`) or a channel (a per-side Recording). A Recording whose Rep is not yet known has
* no choice at all (`null` on the Call, an absent `rep` at upload).
*/
declare const repChoiceSchema: z50.ZodDiscriminatedUnion<[z50.ZodObject<{
	by: z50.ZodLiteral<"speaker">;
	label: z50.ZodPipe<z50.ZodPipe<z50.ZodString, z50.ZodTransform<string, string>>, z50.ZodString>;
}, z50.core.$strict>, z50.ZodObject<{
	by: z50.ZodLiteral<"channel">;
	channel: z50.ZodEnum<{
		left: "left";
		right: "right";
	}>;
}, z50.core.$strict>], "by">;
/** Which side of a Call is the Rep. */
type RepChoice = z50.infer<typeof repChoiceSchema>;
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
declare const callSchema: z51.ZodObject<{
	id: z51.core.$ZodBranded<z51.ZodString, "call", "out">;
	dealId: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	dealRecordId: z51.core.$ZodBranded<z51.ZodString, "deal", "out">;
	dealOutcome: z51.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z51.ZodBoolean;
	kind: z51.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	mediaType: z51.ZodEnum<{
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
	sizeBytes: z51.ZodNumber;
	durationSeconds: z51.ZodNullable<z51.ZodNumber>;
	state: z51.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z51.ZodNullable<z51.ZodEnum<{
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
	rep: z51.ZodNullable<z51.ZodDiscriminatedUnion<[z51.ZodObject<{
		by: z51.ZodLiteral<"speaker">;
		label: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	}, z51.core.$strict>, z51.ZodObject<{
		by: z51.ZodLiteral<"channel">;
		channel: z51.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z51.core.$strict>], "by">>;
	speakerLabels: z51.ZodArray<z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>>;
	speakers: z51.ZodOptional<z51.ZodArray<z51.ZodObject<{
		label: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
		excerpt: z51.ZodString;
	}, z51.core.$strict>>>;
	deletedAt: z51.ZodNullable<z51.ZodISODateTime>;
	purgeAt: z51.ZodNullable<z51.ZodISODateTime>;
	uploadedByUserId: z51.core.$ZodBranded<z51.ZodString, "usr", "out">;
	createdAt: z51.ZodISODateTime;
	updatedAt: z51.ZodISODateTime;
}, z51.core.$strip>;
/** A Call as the service returns it. */
type Call = z51.infer<typeof callSchema>;
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
declare const uploadCallFieldsSchema: z51.ZodObject<{
	dealId: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	rep: z51.ZodOptional<z51.ZodString>;
}, z51.core.$strict>;
/** The text fields of the multipart upload of a Call. */
type UploadCallFields = z51.infer<typeof uploadCallFieldsSchema>;
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
declare const callParamsSchema: z51.ZodObject<{
	callId: z51.core.$ZodBranded<z51.ZodString, "call", "out">;
}, z51.core.$strict>;
/** The path parameters of a request about one Call. */
type CallParams = z51.infer<typeof callParamsSchema>;
/**
* The query parameters of a request to list Calls: a page, and optionally one `state` and one
* `dealRecordId` (the Deal's opaque id; the customer's deal id never goes in a query string). With no `state`, every Call that is not `deleted` is listed; `state=deleted` lists
* those that can still be restored, and `state=awaiting_rep` the ones waiting for a Rep. An
* unknown parameter is rejected.
*/
declare const listCallsQuerySchema: z51.ZodObject<{
	cursor: z51.ZodOptional<z51.ZodString>;
	limit: z51.ZodDefault<z51.ZodPipe<z51.ZodPipe<z51.ZodUnion<readonly [z51.ZodNumber, z51.ZodString]>, z51.ZodTransform<number, string | number>>, z51.ZodNumber>>;
	state: z51.ZodOptional<z51.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>>;
	dealRecordId: z51.ZodOptional<z51.core.$ZodBranded<z51.ZodString, "deal", "out">>;
}, z51.core.$strict>;
/** The query parameters of a request to list Calls. */
type ListCallsQuery = z51.infer<typeof listCallsQuerySchema>;
/**
* A Call in a list: a {@link callSchema} Call without `speakers`, and strict, so one that carries
* excerpts is refused. Only the single-Call read returns speaker excerpts, which keeps a page of up
* to 100 Calls from carrying up to 20 excerpts each of tenant Transcript text.
*/
declare const callListItemSchema: z51.ZodObject<{
	id: z51.core.$ZodBranded<z51.ZodString, "call", "out">;
	dealId: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	dealRecordId: z51.core.$ZodBranded<z51.ZodString, "deal", "out">;
	dealOutcome: z51.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z51.ZodBoolean;
	kind: z51.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	mediaType: z51.ZodEnum<{
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
	sizeBytes: z51.ZodNumber;
	durationSeconds: z51.ZodNullable<z51.ZodNumber>;
	state: z51.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z51.ZodNullable<z51.ZodEnum<{
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
	rep: z51.ZodNullable<z51.ZodDiscriminatedUnion<[z51.ZodObject<{
		by: z51.ZodLiteral<"speaker">;
		label: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	}, z51.core.$strict>, z51.ZodObject<{
		by: z51.ZodLiteral<"channel">;
		channel: z51.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z51.core.$strict>], "by">>;
	speakerLabels: z51.ZodArray<z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>>;
	deletedAt: z51.ZodNullable<z51.ZodISODateTime>;
	purgeAt: z51.ZodNullable<z51.ZodISODateTime>;
	uploadedByUserId: z51.core.$ZodBranded<z51.ZodString, "usr", "out">;
	createdAt: z51.ZodISODateTime;
	updatedAt: z51.ZodISODateTime;
}, z51.core.$strict>;
/** One page of Calls, without speaker excerpts. */
declare const listCallsResponseSchema: z51.ZodObject<{
	items: z51.ZodArray<z51.ZodObject<{
		id: z51.core.$ZodBranded<z51.ZodString, "call", "out">;
		dealId: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
		dealRecordId: z51.core.$ZodBranded<z51.ZodString, "deal", "out">;
		dealOutcome: z51.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		inSearch: z51.ZodBoolean;
		kind: z51.ZodEnum<{
			recording: "recording";
			transcript: "transcript";
		}>;
		fileName: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
		mediaType: z51.ZodEnum<{
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
		sizeBytes: z51.ZodNumber;
		durationSeconds: z51.ZodNullable<z51.ZodNumber>;
		state: z51.ZodEnum<{
			awaiting_rep: "awaiting_rep";
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			transcribing: "transcribing";
			uploaded: "uploaded";
		}>;
		failureReason: z51.ZodNullable<z51.ZodEnum<{
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
		rep: z51.ZodNullable<z51.ZodDiscriminatedUnion<[z51.ZodObject<{
			by: z51.ZodLiteral<"speaker">;
			label: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
		}, z51.core.$strict>, z51.ZodObject<{
			by: z51.ZodLiteral<"channel">;
			channel: z51.ZodEnum<{
				left: "left";
				right: "right";
			}>;
		}, z51.core.$strict>], "by">>;
		speakerLabels: z51.ZodArray<z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>>;
		deletedAt: z51.ZodNullable<z51.ZodISODateTime>;
		purgeAt: z51.ZodNullable<z51.ZodISODateTime>;
		uploadedByUserId: z51.core.$ZodBranded<z51.ZodString, "usr", "out">;
		createdAt: z51.ZodISODateTime;
		updatedAt: z51.ZodISODateTime;
	}, z51.core.$strict>>;
	nextCursor: z51.ZodNullable<z51.ZodString>;
}, z51.core.$strip>;
/** One page of Calls. */
type ListCallsResponse = z51.infer<typeof listCallsResponseSchema>;
/**
* The body of the request that picks or changes a Call's Rep: a required choice (`null` is not a
* choice). It is for a Call `awaiting_rep`, `ready` or `failed`, otherwise `call.rep_not_changeable`;
* a choice that does not suit the Call's kind or, for a speaker, is not among its labels is
* `call.rep_invalid`. It is idempotent by end state.
*/
declare const setCallRepRequestSchema: z51.ZodObject<{
	rep: z51.ZodDiscriminatedUnion<[z51.ZodObject<{
		by: z51.ZodLiteral<"speaker">;
		label: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	}, z51.core.$strict>, z51.ZodObject<{
		by: z51.ZodLiteral<"channel">;
		channel: z51.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z51.core.$strict>], "by">;
}, z51.core.$strict>;
/** The body of the request that picks or changes a Call's Rep. */
type SetCallRepRequest = z51.infer<typeof setCallRepRequestSchema>;
/** What the service reads off the file part of a Call upload, and the kind it was recognised as. */
declare const uploadCallFileSchema: z51.ZodObject<{
	fileName: z51.ZodPipe<z51.ZodPipe<z51.ZodString, z51.ZodTransform<string, string>>, z51.ZodString>;
	declaredMediaType: z51.ZodNullable<z51.ZodString>;
	sizeBytes: z51.ZodNumber;
}, z51.core.$strict>;
/** The answer of {@link checkCallFile}: the parsed file and its kind, or the one error code to return. */
type CheckCallFileResult = {
	readonly ok: true;
	readonly kind: CallKind;
	readonly file: z51.infer<typeof uploadCallFileSchema>;
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
declare const callCursorSchema: z51.ZodObject<{
	createdAt: z51.ZodISODateTime;
	id: z51.core.$ZodBranded<z51.ZodString, "call", "out">;
}, z51.core.$strict>;
/** The position a Call list continues from. */
type CallCursor = z51.infer<typeof callCursorSchema>;
import { z as z52 } from "zod";
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
declare const dealSchema: z52.ZodObject<{
	id: z52.core.$ZodBranded<z52.ZodString, "deal", "out">;
	dealId: z52.ZodPipe<z52.ZodPipe<z52.ZodString, z52.ZodTransform<string, string>>, z52.ZodString>;
	name: z52.ZodNullable<z52.ZodPipe<z52.ZodString, z52.ZodString>>;
	outcome: z52.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z52.ZodNullable<z52.ZodISODate>;
	amount: z52.ZodNullable<z52.ZodString>;
	currency: z52.ZodNullable<z52.ZodString>;
	callCount: z52.ZodNumber;
	appearedInImport: z52.ZodBoolean;
	createdAt: z52.ZodISODateTime;
	updatedAt: z52.ZodISODateTime;
}, z52.core.$strip>;
/** A Deal as the service returns it. */
type Deal = z52.infer<typeof dealSchema>;
/** The path parameters of a request about one Deal: its opaque id, never the customer's deal id. */
declare const dealParamsSchema: z52.ZodObject<{
	dealRecordId: z52.core.$ZodBranded<z52.ZodString, "deal", "out">;
}, z52.core.$strict>;
/** The path parameters of a request about one Deal. */
type DealParams = z52.infer<typeof dealParamsSchema>;
/**
* The query parameters of a request to list Deals: a page, and optionally one `outcome` and
* `appearedInImport` (`true` or `false`). `appearedInImport=false` lists the Deals that have Calls
* but never appeared in a CSV. An unknown parameter is rejected.
*/
declare const listDealsQuerySchema: z52.ZodObject<{
	cursor: z52.ZodOptional<z52.ZodString>;
	limit: z52.ZodDefault<z52.ZodPipe<z52.ZodPipe<z52.ZodUnion<readonly [z52.ZodNumber, z52.ZodString]>, z52.ZodTransform<number, string | number>>, z52.ZodNumber>>;
	outcome: z52.ZodOptional<z52.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>>;
	appearedInImport: z52.ZodOptional<z52.ZodPipe<z52.ZodEnum<{
		false: "false";
		true: "true";
	}>, z52.ZodTransform<boolean, "false" | "true">>>;
}, z52.core.$strict>;
/** The query parameters of a request to list Deals. */
type ListDealsQuery = z52.infer<typeof listDealsQuerySchema>;
/** One page of Deals. */
declare const listDealsResponseSchema: z52.ZodObject<{
	items: z52.ZodArray<z52.ZodObject<{
		id: z52.core.$ZodBranded<z52.ZodString, "deal", "out">;
		dealId: z52.ZodPipe<z52.ZodPipe<z52.ZodString, z52.ZodTransform<string, string>>, z52.ZodString>;
		name: z52.ZodNullable<z52.ZodPipe<z52.ZodString, z52.ZodString>>;
		outcome: z52.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		closedAt: z52.ZodNullable<z52.ZodISODate>;
		amount: z52.ZodNullable<z52.ZodString>;
		currency: z52.ZodNullable<z52.ZodString>;
		callCount: z52.ZodNumber;
		appearedInImport: z52.ZodBoolean;
		createdAt: z52.ZodISODateTime;
		updatedAt: z52.ZodISODateTime;
	}, z52.core.$strip>>;
	nextCursor: z52.ZodNullable<z52.ZodString>;
}, z52.core.$strip>;
/** One page of Deals. */
type ListDealsResponse = z52.infer<typeof listDealsResponseSchema>;
/**
* The body of the request that sets or corrects a Deal's Outcome (Owner and Admin, any Deal, even
* a decided one): the `outcome` and an optional `closedAt`, which an `open` Deal may carry too (an
* expected close date), as in the CSV. It is idempotent by end state, and a change queues the
* re-tag of the Deal's Moments.
*/
declare const setDealOutcomeRequestSchema: z52.ZodObject<{
	outcome: z52.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z52.ZodOptional<z52.ZodNullable<z52.ZodISODate>>;
}, z52.core.$strict>;
/** The body of the request that sets or corrects a Deal's Outcome. */
type SetDealOutcomeRequest = z52.infer<typeof setDealOutcomeRequestSchema>;
/**
* The body of the request that finds a Deal by the customer's deal id, so the id goes in a POST
* body and never in a URL. The answer is the Deal, or `deal.not_found`. Matching is exact after the
* trim.
*/
declare const lookupDealRequestSchema: z52.ZodObject<{
	dealId: z52.ZodPipe<z52.ZodPipe<z52.ZodString, z52.ZodTransform<string, string>>, z52.ZodString>;
}, z52.core.$strict>;
/** The body of the request that finds a Deal by the customer's deal id. */
type LookupDealRequest = z52.infer<typeof lookupDealRequestSchema>;
/** The position a Deal list continues from: `createdAt`, then the Deal's opaque `id`, never the customer's deal id. */
declare const dealCursorSchema: z52.ZodObject<{
	createdAt: z52.ZodISODateTime;
	id: z52.core.$ZodBranded<z52.ZodString, "deal", "out">;
}, z52.core.$strict>;
/** The position a Deal list continues from. */
type DealCursor = z52.infer<typeof dealCursorSchema>;
/** The position a Deal import list continues from: `createdAt`, then the import's `id`. */
declare const dealImportCursorSchema: z52.ZodObject<{
	createdAt: z52.ZodISODateTime;
	id: z52.core.$ZodBranded<z52.ZodString, "dimp", "out">;
}, z52.core.$strict>;
/** The position a Deal import list continues from. */
type DealImportCursor = z52.infer<typeof dealImportCursorSchema>;
/** The position an import report continues from: the `rowNumber` of the last row returned. */
declare const dealImportRowCursorSchema: z52.ZodObject<{
	rowNumber: z52.ZodNumber;
}, z52.core.$strict>;
/** The position an import report continues from. */
type DealImportRowCursor = z52.infer<typeof dealImportRowCursorSchema>;
/** The fields of the multipart upload of a Deal import: the CSV is the one file part (`file`), with no other part. The request carries an `Idempotency-Key` header. */
declare const DEAL_IMPORT_FILE_FIELD = "file";
/**
* A Deal import as the service returns it. It carries no file name and no cell. The counts are
* `null` until `completed`; `failureReason` is set exactly when `state` is `failed`. The report is
* the paginated rows ({@link listDealImportRowsResponseSchema}).
*/
declare const dealImportSchema: z52.ZodObject<{
	id: z52.core.$ZodBranded<z52.ZodString, "dimp", "out">;
	state: z52.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z52.ZodNullable<z52.ZodEnum<{
		processing_failed: "processing_failed";
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z52.ZodNullable<z52.ZodNumber>;
	appliedCount: z52.ZodNullable<z52.ZodNumber>;
	rejectedCount: z52.ZodNullable<z52.ZodNumber>;
	uploadedByUserId: z52.core.$ZodBranded<z52.ZodString, "usr", "out">;
	createdAt: z52.ZodISODateTime;
	updatedAt: z52.ZodISODateTime;
}, z52.core.$strip>;
/** A Deal import as the service returns it. */
type DealImport = z52.infer<typeof dealImportSchema>;
/** The path parameters of a request about one Deal import. */
declare const dealImportParamsSchema: z52.ZodObject<{
	importId: z52.core.$ZodBranded<z52.ZodString, "dimp", "out">;
}, z52.core.$strict>;
/** The path parameters of a request about one Deal import. */
type DealImportParams = z52.infer<typeof dealImportParamsSchema>;
/** The query parameters of a request to list Deal imports: a page. An unknown parameter is rejected. */
declare const listDealImportsQuerySchema: z52.ZodObject<{
	cursor: z52.ZodOptional<z52.ZodString>;
	limit: z52.ZodDefault<z52.ZodPipe<z52.ZodPipe<z52.ZodUnion<readonly [z52.ZodNumber, z52.ZodString]>, z52.ZodTransform<number, string | number>>, z52.ZodNumber>>;
}, z52.core.$strict>;
/** The query parameters of a request to list Deal imports. */
type ListDealImportsQuery = z52.infer<typeof listDealImportsQuerySchema>;
/** One page of Deal imports. */
declare const listDealImportsResponseSchema: z52.ZodObject<{
	items: z52.ZodArray<z52.ZodObject<{
		id: z52.core.$ZodBranded<z52.ZodString, "dimp", "out">;
		state: z52.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z52.ZodNullable<z52.ZodEnum<{
			processing_failed: "processing_failed";
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z52.ZodNullable<z52.ZodNumber>;
		appliedCount: z52.ZodNullable<z52.ZodNumber>;
		rejectedCount: z52.ZodNullable<z52.ZodNumber>;
		uploadedByUserId: z52.core.$ZodBranded<z52.ZodString, "usr", "out">;
		createdAt: z52.ZodISODateTime;
		updatedAt: z52.ZodISODateTime;
	}, z52.core.$strip>>;
	nextCursor: z52.ZodNullable<z52.ZodString>;
}, z52.core.$strip>;
/** One page of Deal imports. */
type ListDealImportsResponse = z52.infer<typeof listDealImportsResponseSchema>;
/**
* One row of an import report: the CSV `rowNumber`, the record number with the header as record 1
* (so the first data row is 2). A quoted cell that spans lines is one record, so `rowNumber` can
* differ from the physical line (see `parseCsv`),
* the `dealId` (the one free-text cell echoed; `null` when the cell was missing or not a valid deal
* id, so a bad cell is never echoed), the `result` and, for a rejected row, the `reason`. `reason`
* is `null` exactly when the result is `applied`. No other cell is ever part of a report.
*/
declare const dealImportRowSchema: z52.ZodObject<{
	rowNumber: z52.ZodNumber;
	dealId: z52.ZodNullable<z52.ZodPipe<z52.ZodPipe<z52.ZodString, z52.ZodTransform<string, string>>, z52.ZodString>>;
	result: z52.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>;
	reason: z52.ZodNullable<z52.ZodEnum<{
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
}, z52.core.$strip>;
/** One row of an import report. */
type DealImportRow = z52.infer<typeof dealImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page, and optionally only the `rejected` or only the `applied` rows. Rows are in CSV order. An unknown parameter is rejected. */
declare const listDealImportRowsQuerySchema: z52.ZodObject<{
	cursor: z52.ZodOptional<z52.ZodString>;
	limit: z52.ZodDefault<z52.ZodPipe<z52.ZodPipe<z52.ZodUnion<readonly [z52.ZodNumber, z52.ZodString]>, z52.ZodTransform<number, string | number>>, z52.ZodNumber>>;
	result: z52.ZodOptional<z52.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>>;
}, z52.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListDealImportRowsQuery = z52.infer<typeof listDealImportRowsQuerySchema>;
/** One page of an import report. */
declare const listDealImportRowsResponseSchema: z52.ZodObject<{
	items: z52.ZodArray<z52.ZodObject<{
		rowNumber: z52.ZodNumber;
		dealId: z52.ZodNullable<z52.ZodPipe<z52.ZodPipe<z52.ZodString, z52.ZodTransform<string, string>>, z52.ZodString>>;
		result: z52.ZodEnum<{
			applied: "applied";
			rejected: "rejected";
		}>;
		reason: z52.ZodNullable<z52.ZodEnum<{
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
	}, z52.core.$strip>>;
	nextCursor: z52.ZodNullable<z52.ZodString>;
}, z52.core.$strip>;
/** One page of an import report. */
type ListDealImportRowsResponse = z52.infer<typeof listDealImportRowsResponseSchema>;
import { z as z53 } from "zod";
/** The Outcome of a Deal: `won`, `lost` or still `open` (glossary). */
declare const OUTCOMES: readonly ["won", "lost", "open"];
/** The Outcome of a Deal. */
declare const outcomeSchema: z53.ZodEnum<{
	lost: "lost";
	open: "open";
	won: "won";
}>;
/** The Outcome of a Deal. */
type Outcome = z53.infer<typeof outcomeSchema>;
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
declare const dealIdSchema: z53.ZodPipe<z53.ZodPipe<z53.ZodString, z53.ZodTransform<string, string>>, z53.ZodString>;
/** A deal id. */
type DealId = z53.infer<typeof dealIdSchema>;
/** The longest Deal name, in Unicode code points, once trimmed. */
declare const MAX_DEAL_NAME_LENGTH = 200;
/** The most UTF-8 bytes a stored Deal name can take: 200 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_NAME_BYTES: number;
/** A Deal's optional name: trimmed, 1 to 200 well-formed Unicode code points (at most `MAX_DEAL_NAME_BYTES` bytes), no control character. Untrusted text for display, never logged. */
declare const dealNameSchema: z53.ZodPipe<z53.ZodString, z53.ZodString>;
/** A money amount as a decimal string, never a float: not negative, at most 15 integer digits (the maximum is 999999999999999.99) and 2 fraction digits, no leading zero beyond a single `0`. */
declare const dealAmountSchema: z53.ZodString;
/** A currency as an upper-case ISO 4217 code of three letters. */
declare const dealCurrencySchema: z53.ZodString;
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
declare const dealImportStateSchema: z53.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of a Deal import. */
type DealImportState = z53.infer<typeof dealImportStateSchema>;
/** Why a whole import ended `failed`: a closed list. A bad row is not a failure of the import. */
declare const DEAL_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable", "processing_failed"];
/** Why a whole import ended `failed`. */
declare const dealImportFailureReasonSchema: z53.ZodEnum<{
	processing_failed: "processing_failed";
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import ended `failed`. */
type DealImportFailureReason = z53.infer<typeof dealImportFailureReasonSchema>;
/** The result of one CSV row: `applied`, or `rejected` with a reason. */
declare const DEAL_IMPORT_ROW_RESULTS: readonly ["applied", "rejected"];
/** The result of one CSV row. */
declare const dealImportRowResultSchema: z53.ZodEnum<{
	applied: "applied";
	rejected: "rejected";
}>;
/** The result of one CSV row. */
type DealImportRowResult = z53.infer<typeof dealImportRowResultSchema>;
/**
* Why a row was rejected: a closed list, never a cell. A row is rejected, not silently dropped,
* and never an HTTP error. `outcome_already_decided` is a row for a Deal already `won` or `lost`
* (ADR 0018, choice 5); `duplicate_in_file` is a deal id repeated after its first row; `blank_row`
* is an interior blank line, reported so the report has no gap in its row numbers.
*/
declare const DEAL_IMPORT_ROW_REASONS: readonly ["wrong_column_count", "invalid_deal_id", "duplicate_in_file", "invalid_outcome", "invalid_closed_at", "invalid_amount", "invalid_currency", "invalid_name", "outcome_already_decided", "deal_limit_reached", "blank_row"];
/** Why a row was rejected. */
declare const dealImportRowReasonSchema: z53.ZodEnum<{
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
type DealImportRowReason = z53.infer<typeof dealImportRowReasonSchema>;
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
declare const calendarDateSchema: z53.ZodISODate;
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
import { z as z54 } from "zod";
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
declare const documentSchema: z54.ZodObject<{
	id: z54.core.$ZodBranded<z54.ZodString, "doc", "out">;
	fileName: z54.ZodPipe<z54.ZodPipe<z54.ZodString, z54.ZodTransform<string, string>>, z54.ZodString>;
	mediaType: z54.ZodEnum<{
		"application/pdf": "application/pdf";
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		"text/markdown": "text/markdown";
		"text/plain": "text/plain";
	}>;
	sizeBytes: z54.ZodNumber;
	pageCount: z54.ZodNullable<z54.ZodNumber>;
	state: z54.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>;
	failureReason: z54.ZodNullable<z54.ZodEnum<{
		no_text: "no_text";
		password_protected: "password_protected";
		processing_failed: "processing_failed";
		too_many_pages: "too_many_pages";
		unreadable: "unreadable";
	}>>;
	deletedAt: z54.ZodNullable<z54.ZodISODateTime>;
	purgeAt: z54.ZodNullable<z54.ZodISODateTime>;
	uploadedByUserId: z54.core.$ZodBranded<z54.ZodString, "usr", "out">;
	createdAt: z54.ZodISODateTime;
	updatedAt: z54.ZodISODateTime;
}, z54.core.$strip>;
/** A Playbook document as the service returns it. */
type PlaybookDocument = z54.infer<typeof documentSchema>;
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
declare const uploadDocumentFileSchema: z54.ZodObject<{
	fileName: z54.ZodPipe<z54.ZodPipe<z54.ZodString, z54.ZodTransform<string, string>>, z54.ZodString>;
	declaredMediaType: z54.ZodNullable<z54.ZodString>;
	sizeBytes: z54.ZodNumber;
}, z54.core.$strict>;
/** What the service reads off the file part of an upload. */
type UploadDocumentFile = z54.infer<typeof uploadDocumentFileSchema>;
/** The path parameters of a request about one document. */
declare const documentParamsSchema: z54.ZodObject<{
	documentId: z54.core.$ZodBranded<z54.ZodString, "doc", "out">;
}, z54.core.$strict>;
/** The path parameters of a request about one document. */
type DocumentParams = z54.infer<typeof documentParamsSchema>;
/**
* The query parameters of a request to list documents: a page, and optionally one `state`. With
* no `state`, every document that is not `deleted` is listed; `state=deleted` lists the documents
* that can still be restored. An unknown parameter is rejected.
*/
declare const listDocumentsQuerySchema: z54.ZodObject<{
	cursor: z54.ZodOptional<z54.ZodString>;
	limit: z54.ZodDefault<z54.ZodPipe<z54.ZodPipe<z54.ZodUnion<readonly [z54.ZodNumber, z54.ZodString]>, z54.ZodTransform<number, string | number>>, z54.ZodNumber>>;
	state: z54.ZodOptional<z54.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>>;
}, z54.core.$strict>;
/** The query parameters of a request to list documents. */
type ListDocumentsQuery = z54.infer<typeof listDocumentsQuerySchema>;
/** One page of documents. */
declare const listDocumentsResponseSchema: z54.ZodObject<{
	items: z54.ZodArray<z54.ZodObject<{
		id: z54.core.$ZodBranded<z54.ZodString, "doc", "out">;
		fileName: z54.ZodPipe<z54.ZodPipe<z54.ZodString, z54.ZodTransform<string, string>>, z54.ZodString>;
		mediaType: z54.ZodEnum<{
			"application/pdf": "application/pdf";
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			"text/markdown": "text/markdown";
			"text/plain": "text/plain";
		}>;
		sizeBytes: z54.ZodNumber;
		pageCount: z54.ZodNullable<z54.ZodNumber>;
		state: z54.ZodEnum<{
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			uploaded: "uploaded";
		}>;
		failureReason: z54.ZodNullable<z54.ZodEnum<{
			no_text: "no_text";
			password_protected: "password_protected";
			processing_failed: "processing_failed";
			too_many_pages: "too_many_pages";
			unreadable: "unreadable";
		}>>;
		deletedAt: z54.ZodNullable<z54.ZodISODateTime>;
		purgeAt: z54.ZodNullable<z54.ZodISODateTime>;
		uploadedByUserId: z54.core.$ZodBranded<z54.ZodString, "usr", "out">;
		createdAt: z54.ZodISODateTime;
		updatedAt: z54.ZodISODateTime;
	}, z54.core.$strip>>;
	nextCursor: z54.ZodNullable<z54.ZodString>;
}, z54.core.$strip>;
/** One page of documents. */
type ListDocumentsResponse = z54.infer<typeof listDocumentsResponseSchema>;
/**
* Internal: the path parameters of the call that removes everything an Organization has in the
* Playbook. The Organization is named in the path, never taken from the caller's token.
*/
declare const internalRemoveOrganizationDocumentsParamsSchema: z54.ZodObject<{
	organizationId: z54.core.$ZodBranded<z54.ZodString, "org", "out">;
}, z54.core.$strict>;
/** Internal: the path parameters of the remove-everything call. */
type InternalRemoveOrganizationDocumentsParams = z54.infer<typeof internalRemoveOrganizationDocumentsParamsSchema>;
/**
* Internal: `POST /internal/playbook/organizations/{organizationId}/remove-all`, for offboarding
* and erasure; no caller yet. The body is empty. It cancels ingestion in flight and removes every
* file, chunk, vector and record the Organization has, soft-deleted documents included, without
* waiting for retention. It carries an `Idempotency-Key` header and is defined by its end state:
* it answers success whenever nothing remains when it returns, whether this call, an earlier one
* or nobody ever stored anything, so a repeat under any key answers the same and success does not
* mean this call removed anything. It returns no domain error code.
*/
declare const internalRemoveOrganizationDocumentsRequestSchema: z54.ZodObject<{}, z54.core.$strict>;
/** Internal: the body of the remove-everything call. */
type InternalRemoveOrganizationDocumentsRequest = z54.infer<typeof internalRemoveOrganizationDocumentsRequestSchema>;
/** Internal: the answer to the remove-everything call: always `removed`. */
declare const internalRemoveOrganizationDocumentsResponseSchema: z54.ZodObject<{
	organizationId: z54.core.$ZodBranded<z54.ZodString, "org", "out">;
	status: z54.ZodLiteral<"removed">;
}, z54.core.$strip>;
/** Internal: the answer to the remove-everything call. */
type InternalRemoveOrganizationDocumentsResponse = z54.infer<typeof internalRemoveOrganizationDocumentsResponseSchema>;
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
import { z as z55 } from "zod";
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}: the document to ingest. */
declare const documentUploadedPayloadSchema: z55.ZodObject<{
	documentId: z55.core.$ZodBranded<z55.ZodString, "doc", "out">;
}, z55.core.$strict>;
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}. */
type DocumentUploadedPayload = z55.infer<typeof documentUploadedPayloadSchema>;
/**
* The message that starts ingestion of a document: published after an upload is stored, and again
* when a soft-deleted document is restored (it is re-ingested from the kept file). The job is
* idempotent and resumable, keyed on the document.
*/
declare const DOCUMENT_UPLOADED_MESSAGE: {
	readonly type: "playbook.document_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z55.ZodObject<{
		documentId: z55.core.$ZodBranded<z55.ZodString, "doc", "out">;
	}, z55.core.$strict>;
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
declare const documentDeletedPayloadSchema: z55.ZodObject<{
	documentId: z55.core.$ZodBranded<z55.ZodString, "doc", "out">;
	deletionSeq: z55.ZodNumber;
}, z55.core.$strict>;
/** The payload of {@link DOCUMENT_DELETED_MESSAGE}. */
type DocumentDeletedPayload = z55.infer<typeof documentDeletedPayloadSchema>;
/**
* The message that queues the removal of a deleted document's vectors, published by the delete
* request. It is cleanup only: search hides a deleted document by its state, never by this job.
*/
declare const DOCUMENT_DELETED_MESSAGE: {
	readonly type: "playbook.document_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z55.ZodObject<{
		documentId: z55.core.$ZodBranded<z55.ZodString, "doc", "out">;
		deletionSeq: z55.ZodNumber;
	}, z55.core.$strict>;
};
import { z as z56 } from "zod";
/** The largest wording version number; versions are positive integers, one for each entry of `RIGHTS_WORDINGS`. */
declare const MAX_RIGHTS_WORDING_VERSION = 1e6;
/** The version of the rights-confirmation wording: a positive integer. The text of each version is in `RIGHTS_WORDINGS`. */
declare const rightsWordingVersionSchema: z56.ZodNumber;
/**
* The recorded confirmation (ADR 0018, choice 12): that an Owner or Admin confirmed the
* Organization may share its Recordings and Transcripts, with the `wordingVersion` shown, who
* (`confirmedByUserId`) and when. There is one per Organization; a new one replaces it.
*/
declare const rightsConfirmationSchema: z56.ZodObject<{
	wordingVersion: z56.ZodNumber;
	confirmedByUserId: z56.core.$ZodBranded<z56.ZodString, "usr", "out">;
	confirmedAt: z56.ZodISODateTime;
}, z56.core.$strip>;
/** The recorded confirmation. */
type RightsConfirmation = z56.infer<typeof rightsConfirmationSchema>;
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
declare const rightsStatusSchema: z56.ZodObject<{
	currentWordingVersion: z56.ZodNumber;
	confirmation: z56.ZodNullable<z56.ZodObject<{
		wordingVersion: z56.ZodNumber;
		confirmedByUserId: z56.core.$ZodBranded<z56.ZodString, "usr", "out">;
		confirmedAt: z56.ZodISODateTime;
	}, z56.core.$strip>>;
	confirmed: z56.ZodBoolean;
	currentWording: z56.ZodOptional<z56.ZodObject<{
		heading: z56.ZodString;
		paragraphs: z56.ZodArray<z56.ZodString>;
		checkbox: z56.ZodString;
		draft: z56.ZodOptional<z56.ZodLiteral<true>>;
	}, z56.core.$strict>>;
}, z56.core.$strip>;
/** The answer to reading the confirmation. */
type RightsStatus = z56.infer<typeof rightsStatusSchema>;
/**
* The body of the request that records the confirmation: the `wordingVersion` the member was shown,
* which must be the current one (else `rights.version_outdated`). Who and when come from the token
* and the clock, never from the body. Idempotent by end state.
*/
declare const confirmRightsRequestSchema: z56.ZodObject<{
	wordingVersion: z56.ZodNumber;
}, z56.core.$strict>;
/** The body of the request that records the confirmation. */
type ConfirmRightsRequest = z56.infer<typeof confirmRightsRequestSchema>;
import { z as z57 } from "zod";
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
declare const rightsWordingSchema: z57.ZodObject<{
	heading: z57.ZodString;
	paragraphs: z57.ZodArray<z57.ZodString>;
	checkbox: z57.ZodString;
	draft: z57.ZodOptional<z57.ZodLiteral<true>>;
}, z57.core.$strict>;
/** The text of one version of the rights confirmation. */
type RightsWording = z57.infer<typeof rightsWordingSchema>;
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
import { z as z58 } from "zod";
/** The largest Outcome or Rep sequence: the db column is a Postgres `integer`, like {@link MAX_DELETION_SEQ}. */
declare const MAX_SEQ = 2147483647;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
declare const callUploadedPayloadSchema: z58.ZodObject<{
	callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
}, z58.core.$strict>;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
type CallUploadedPayload = z58.infer<typeof callUploadedPayloadSchema>;
/** Starts ingestion of a Call: transcription of a Recording, or parsing of a Transcript. Published after the upload is stored and again on restore (the kept Transcript is reused, never transcribed twice). */
declare const CALL_UPLOADED_MESSAGE: {
	readonly type: "playbook.call_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z58.ZodObject<{
		callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
	}, z58.core.$strict>;
};
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
declare const callTranscribedPayloadSchema: z58.ZodObject<{
	callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
}, z58.core.$strict>;
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
type CallTranscribedPayload = z58.infer<typeof callTranscribedPayloadSchema>;
/** Moves a Recording from transcription to building Moments, published when the Transcript is stored and the Rep is known (a per-side Recording, or one whose Rep was picked). A Call with no Rep waits in `awaiting_rep` and publishes `playbook.call_rep_changed` when it is picked. */
declare const CALL_TRANSCRIBED_MESSAGE: {
	readonly type: "playbook.call_transcribed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z58.ZodObject<{
		callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
	}, z58.core.$strict>;
};
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}: the Call and its `repSeq`. */
declare const callRepChangedPayloadSchema: z58.ZodObject<{
	callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
	repSeq: z58.ZodNumber;
}, z58.core.$strict>;
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}. */
type CallRepChangedPayload = z58.infer<typeof callRepChangedPayloadSchema>;
/** Rebuilds a Call's Moments after its Rep is picked or changed. The service bumps `repSeq` in the same write as the change; the job applies only when the Call's stored sequence equals this one, and the Call is out of search until it finishes. */
declare const CALL_REP_CHANGED_MESSAGE: {
	readonly type: "playbook.call_rep_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z58.ZodObject<{
		callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
		repSeq: z58.ZodNumber;
	}, z58.core.$strict>;
};
/** The payload of {@link CALL_DELETED_MESSAGE}: the Call and its `deletionSeq`. */
declare const callDeletedPayloadSchema: z58.ZodObject<{
	callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
	deletionSeq: z58.ZodNumber;
}, z58.core.$strict>;
/** The payload of {@link CALL_DELETED_MESSAGE}. */
type CallDeletedPayload = z58.infer<typeof callDeletedPayloadSchema>;
/** Queues the removal of a deleted Call's Moments and vectors, as `playbook.document_deleted` does for a document: it applies only if the Call is still deleted and its stored `deletionSeq` equals this one. Only a delete that changes the state bumps it or publishes. Search hides a deleted Call by its state, never by this job. */
declare const CALL_DELETED_MESSAGE: {
	readonly type: "playbook.call_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z58.ZodObject<{
		callId: z58.core.$ZodBranded<z58.ZodString, "call", "out">;
		deletionSeq: z58.ZodNumber;
	}, z58.core.$strict>;
};
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}: the Deal's opaque id (never the customer's text) and its `outcomeSeq`. */
declare const dealOutcomeChangedPayloadSchema: z58.ZodObject<{
	dealRecordId: z58.core.$ZodBranded<z58.ZodString, "deal", "out">;
	outcomeSeq: z58.ZodNumber;
}, z58.core.$strict>;
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}. */
type DealOutcomeChangedPayload = z58.infer<typeof dealOutcomeChangedPayloadSchema>;
/** Re-tags a Deal's Moments in the index after its Outcome changes. The job reads the current Outcome from the database and applies only when the Deal's stored `outcomeSeq` equals this one, so two changes cannot finish in the wrong order. */
declare const DEAL_OUTCOME_CHANGED_MESSAGE: {
	readonly type: "playbook.deal_outcome_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z58.ZodObject<{
		dealRecordId: z58.core.$ZodBranded<z58.ZodString, "deal", "out">;
		outcomeSeq: z58.ZodNumber;
	}, z58.core.$strict>;
};
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
declare const dealImportUploadedPayloadSchema: z58.ZodObject<{
	importId: z58.core.$ZodBranded<z58.ZodString, "dimp", "out">;
}, z58.core.$strict>;
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
type DealImportUploadedPayload = z58.infer<typeof dealImportUploadedPayloadSchema>;
/** Starts the processing of an uploaded CSV. The job is idempotent and resumable, keyed on the import. */
declare const DEAL_IMPORT_UPLOADED_MESSAGE: {
	readonly type: "playbook.deal_import_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z58.ZodObject<{
		importId: z58.core.$ZodBranded<z58.ZodString, "dimp", "out">;
	}, z58.core.$strict>;
};
import { z as z59 } from "zod";
/**
* The states a Playbook document is in, in the order a document passes through them (ADR 0016).
* `deleted` means soft-deleted and awaiting purge. The db library builds its column from this
* same list, so the names are the contract between the two.
*/
declare const DOCUMENT_STATES: readonly ["uploaded", "processing", "ready", "failed", "deleted"];
/** The state of a Playbook document. */
declare const documentStateSchema: z59.ZodEnum<{
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	uploaded: "uploaded";
}>;
/** The state of a Playbook document. */
type DocumentState = z59.infer<typeof documentStateSchema>;
/**
* Why a document ended in `failed`: a closed list the portal maps to its own wording. Never free
* text, so a reason cannot carry the content or name of a file. This list is the lead's reading
* of ADR 0016, which names only the page limit; the owner did not choose the rest.
*/
declare const DOCUMENT_FAILURE_REASONS: readonly ["too_many_pages", "unreadable", "password_protected", "no_text", "processing_failed"];
/** Why a document ended in `failed`. */
declare const documentFailureReasonSchema: z59.ZodEnum<{
	no_text: "no_text";
	password_protected: "password_protected";
	processing_failed: "processing_failed";
	too_many_pages: "too_many_pages";
	unreadable: "unreadable";
}>;
/** Why a document ended in `failed`. */
type DocumentFailureReason = z59.infer<typeof documentFailureReasonSchema>;
/** Owner's choice (ADR 0016, choice 2): the file extensions phase 1 accepts, lower case with the dot. */
declare const ACCEPTED_DOCUMENT_EXTENSIONS: readonly [".pdf", ".docx", ".pptx", ".txt", ".md"];
/** An accepted file extension. */
type AcceptedDocumentExtension = (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number];
/** Owner's choice (ADR 0016, choice 2): the media types phase 1 accepts, one for each accepted extension. */
declare const ACCEPTED_DOCUMENT_MEDIA_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/markdown"];
/** The media type of a stored document, as the service detected it from the content. */
declare const documentMediaTypeSchema: z59.ZodEnum<{
	"application/pdf": "application/pdf";
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	"text/markdown": "text/markdown";
	"text/plain": "text/plain";
}>;
/** The media type of a stored document. */
type DocumentMediaType = z59.infer<typeof documentMediaTypeSchema>;
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
declare const documentFileNameSchema: z59.ZodPipe<z59.ZodPipe<z59.ZodString, z59.ZodTransform<string, string>>, z59.ZodString>;
/** The name of an uploaded file. */
type DocumentFileName = z59.infer<typeof documentFileNameSchema>;
/**
* The type check of an upload, on the file name in its stored form (control and bidirectional
* characters stripped, then trimmed): it must end in an accepted extension. A failure is
* `document.unsupported_type` (415). Services call `checkUploadFile`, not this. The service also inspects the content, because the name
* and the declared type are untrusted.
*/
declare const documentTypeCheckSchema: z59.ZodPipe<z59.ZodPipe<z59.ZodString, z59.ZodTransform<string, string>>, z59.ZodString>;
/**
* The size check of an upload, on the byte count: at most {@link MAX_DOCUMENT_BYTES}. A failure
* is `document.too_large` (413). Services call `checkUploadFile`, not this. Emptiness is not checked here: an empty file fails the upload
* schema as `request.invalid`.
*/
declare const documentSizeCheckSchema: z59.ZodNumber;
/** Lower-cases a media type and drops its parameters, so `Text/Plain; charset=utf-8` becomes `text/plain`. */
declare function normaliseMediaType(mediaType: string): string;
/** Whether text holds a control or bidirectional character (the ones a file name has stripped), so an identifier can refuse it. */
declare function hasStrippableCharacter(text: string): boolean;
/** Whether text is well-formed UTF-16: no lone surrogate. */
declare function isWellFormedText(text: string): boolean;
import { z as z60 } from "zod";
/**
* `prospect.created` (version 1): a Prospect was created. Carries ids and the Source kind, no
* personal data; a consumer that needs the person reads the Prospect from core.
*/
declare const prospectCreatedEvent: {
	type: "prospect.created";
	version: 1;
	schema: z60.ZodObject<{
		id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
		occurredAt: z60.ZodISODateTime;
		organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
		region: z60.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z60.ZodLiteral<"prospect.created">;
		version: z60.ZodLiteral<1>;
		data: z60.ZodObject<{
			prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
			companyId: z60.ZodNullable<z60.core.$ZodBranded<z60.ZodString, "pco", "out">>;
			ownerMembershipId: z60.ZodNullable<z60.core.$ZodBranded<z60.ZodString, "mem", "out">>;
			source: z60.ZodUnion<readonly [z60.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z60.ZodString]>;
		}, z60.core.$strict>;
	}, z60.core.$strip>;
	parse: (input: unknown) => {
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.created";
		version: 1;
		data: {
			prospectId: string & z60.$brand<"prs">;
			companyId: (string & z60.$brand<"pco">) | null;
			ownerMembershipId: (string & z60.$brand<"mem">) | null;
			source: string;
		};
	};
	safeParse: (input: unknown) => z60.ZodSafeParseResult<{
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.created";
		version: 1;
		data: {
			prospectId: string & z60.$brand<"prs">;
			companyId: (string & z60.$brand<"pco">) | null;
			ownerMembershipId: (string & z60.$brand<"mem">) | null;
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
	schema: z60.ZodObject<{
		id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
		occurredAt: z60.ZodISODateTime;
		organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
		region: z60.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z60.ZodLiteral<"prospect.updated">;
		version: z60.ZodLiteral<1>;
		data: z60.ZodObject<{
			prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
			changedFields: z60.ZodArray<z60.ZodEnum<{
				email: "email";
				firstName: "firstName";
				jobTitle: "jobTitle";
				lastName: "lastName";
				linkedinUrl: "linkedinUrl";
				phone: "phone";
			}>>;
			ownerChanged: z60.ZodBoolean;
			companyChanged: z60.ZodBoolean;
			statusChanged: z60.ZodBoolean;
			source: z60.ZodUnion<readonly [z60.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z60.ZodString]>;
		}, z60.core.$strict>;
	}, z60.core.$strip>;
	parse: (input: unknown) => {
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.updated";
		version: 1;
		data: {
			prospectId: string & z60.$brand<"prs">;
			changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
			ownerChanged: boolean;
			companyChanged: boolean;
			statusChanged: boolean;
			source: string;
		};
	};
	safeParse: (input: unknown) => z60.ZodSafeParseResult<{
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.updated";
		version: 1;
		data: {
			prospectId: string & z60.$brand<"prs">;
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
	schema: z60.ZodObject<{
		id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
		occurredAt: z60.ZodISODateTime;
		organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
		region: z60.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z60.ZodLiteral<"prospect.merged">;
		version: z60.ZodLiteral<1>;
		data: z60.ZodObject<{
			mergeId: z60.core.$ZodBranded<z60.ZodString, "pmrg", "out">;
			survivorProspectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
			mergedProspectIds: z60.ZodArray<z60.core.$ZodBranded<z60.ZodString, "prs", "out">>;
		}, z60.core.$strict>;
	}, z60.core.$strip>;
	parse: (input: unknown) => {
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merged";
		version: 1;
		data: {
			mergeId: string & z60.$brand<"pmrg">;
			survivorProspectId: string & z60.$brand<"prs">;
			mergedProspectIds: (string & z60.$brand<"prs">)[];
		};
	};
	safeParse: (input: unknown) => z60.ZodSafeParseResult<{
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merged";
		version: 1;
		data: {
			mergeId: string & z60.$brand<"pmrg">;
			survivorProspectId: string & z60.$brand<"prs">;
			mergedProspectIds: (string & z60.$brand<"prs">)[];
		};
	}>;
};
/** `prospect.merge_undone` (version 1): a merge was reversed and the merged Prospects restored; links move back. Ids only. */
declare const prospectMergeUndoneEvent: {
	type: "prospect.merge_undone";
	version: 1;
	schema: z60.ZodObject<{
		id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
		occurredAt: z60.ZodISODateTime;
		organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
		region: z60.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z60.ZodLiteral<"prospect.merge_undone">;
		version: z60.ZodLiteral<1>;
		data: z60.ZodObject<{
			mergeId: z60.core.$ZodBranded<z60.ZodString, "pmrg", "out">;
			survivorProspectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
			restoredProspectIds: z60.ZodArray<z60.core.$ZodBranded<z60.ZodString, "prs", "out">>;
		}, z60.core.$strict>;
	}, z60.core.$strip>;
	parse: (input: unknown) => {
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merge_undone";
		version: 1;
		data: {
			mergeId: string & z60.$brand<"pmrg">;
			survivorProspectId: string & z60.$brand<"prs">;
			restoredProspectIds: (string & z60.$brand<"prs">)[];
		};
	};
	safeParse: (input: unknown) => z60.ZodSafeParseResult<{
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.merge_undone";
		version: 1;
		data: {
			mergeId: string & z60.$brand<"pmrg">;
			survivorProspectId: string & z60.$brand<"prs">;
			restoredProspectIds: (string & z60.$brand<"prs">)[];
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
	schema: z60.ZodObject<{
		id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
		occurredAt: z60.ZodISODateTime;
		organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
		region: z60.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z60.ZodLiteral<"prospect.erased">;
		version: z60.ZodLiteral<1>;
		data: z60.ZodObject<{
			prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
		}, z60.core.$strict>;
	}, z60.core.$strip>;
	parse: (input: unknown) => {
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.erased";
		version: 1;
		data: {
			prospectId: string & z60.$brand<"prs">;
		};
	};
	safeParse: (input: unknown) => z60.ZodSafeParseResult<{
		id: string & z60.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z60.$brand<"org">;
		region: "eu" | "us";
		type: "prospect.erased";
		version: 1;
		data: {
			prospectId: string & z60.$brand<"prs">;
		};
	}>;
};
/** Every Prospect event, by type. */
declare const PROSPECT_EVENTS: {
	readonly "prospect.created": {
		type: "prospect.created";
		version: 1;
		schema: z60.ZodObject<{
			id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
			occurredAt: z60.ZodISODateTime;
			organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
			region: z60.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z60.ZodLiteral<"prospect.created">;
			version: z60.ZodLiteral<1>;
			data: z60.ZodObject<{
				prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
				companyId: z60.ZodNullable<z60.core.$ZodBranded<z60.ZodString, "pco", "out">>;
				ownerMembershipId: z60.ZodNullable<z60.core.$ZodBranded<z60.ZodString, "mem", "out">>;
				source: z60.ZodUnion<readonly [z60.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z60.ZodString]>;
			}, z60.core.$strict>;
		}, z60.core.$strip>;
		parse: (input: unknown) => {
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.created";
			version: 1;
			data: {
				prospectId: string & z60.$brand<"prs">;
				companyId: (string & z60.$brand<"pco">) | null;
				ownerMembershipId: (string & z60.$brand<"mem">) | null;
				source: string;
			};
		};
		safeParse: (input: unknown) => z60.ZodSafeParseResult<{
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.created";
			version: 1;
			data: {
				prospectId: string & z60.$brand<"prs">;
				companyId: (string & z60.$brand<"pco">) | null;
				ownerMembershipId: (string & z60.$brand<"mem">) | null;
				source: string;
			};
		}>;
	};
	readonly "prospect.updated": {
		type: "prospect.updated";
		version: 1;
		schema: z60.ZodObject<{
			id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
			occurredAt: z60.ZodISODateTime;
			organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
			region: z60.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z60.ZodLiteral<"prospect.updated">;
			version: z60.ZodLiteral<1>;
			data: z60.ZodObject<{
				prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
				changedFields: z60.ZodArray<z60.ZodEnum<{
					email: "email";
					firstName: "firstName";
					jobTitle: "jobTitle";
					lastName: "lastName";
					linkedinUrl: "linkedinUrl";
					phone: "phone";
				}>>;
				ownerChanged: z60.ZodBoolean;
				companyChanged: z60.ZodBoolean;
				statusChanged: z60.ZodBoolean;
				source: z60.ZodUnion<readonly [z60.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z60.ZodString]>;
			}, z60.core.$strict>;
		}, z60.core.$strip>;
		parse: (input: unknown) => {
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.updated";
			version: 1;
			data: {
				prospectId: string & z60.$brand<"prs">;
				changedFields: ("email" | "firstName" | "jobTitle" | "lastName" | "linkedinUrl" | "phone")[];
				ownerChanged: boolean;
				companyChanged: boolean;
				statusChanged: boolean;
				source: string;
			};
		};
		safeParse: (input: unknown) => z60.ZodSafeParseResult<{
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.updated";
			version: 1;
			data: {
				prospectId: string & z60.$brand<"prs">;
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
		schema: z60.ZodObject<{
			id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
			occurredAt: z60.ZodISODateTime;
			organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
			region: z60.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z60.ZodLiteral<"prospect.merged">;
			version: z60.ZodLiteral<1>;
			data: z60.ZodObject<{
				mergeId: z60.core.$ZodBranded<z60.ZodString, "pmrg", "out">;
				survivorProspectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
				mergedProspectIds: z60.ZodArray<z60.core.$ZodBranded<z60.ZodString, "prs", "out">>;
			}, z60.core.$strict>;
		}, z60.core.$strip>;
		parse: (input: unknown) => {
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merged";
			version: 1;
			data: {
				mergeId: string & z60.$brand<"pmrg">;
				survivorProspectId: string & z60.$brand<"prs">;
				mergedProspectIds: (string & z60.$brand<"prs">)[];
			};
		};
		safeParse: (input: unknown) => z60.ZodSafeParseResult<{
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merged";
			version: 1;
			data: {
				mergeId: string & z60.$brand<"pmrg">;
				survivorProspectId: string & z60.$brand<"prs">;
				mergedProspectIds: (string & z60.$brand<"prs">)[];
			};
		}>;
	};
	readonly "prospect.merge_undone": {
		type: "prospect.merge_undone";
		version: 1;
		schema: z60.ZodObject<{
			id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
			occurredAt: z60.ZodISODateTime;
			organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
			region: z60.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z60.ZodLiteral<"prospect.merge_undone">;
			version: z60.ZodLiteral<1>;
			data: z60.ZodObject<{
				mergeId: z60.core.$ZodBranded<z60.ZodString, "pmrg", "out">;
				survivorProspectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
				restoredProspectIds: z60.ZodArray<z60.core.$ZodBranded<z60.ZodString, "prs", "out">>;
			}, z60.core.$strict>;
		}, z60.core.$strip>;
		parse: (input: unknown) => {
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merge_undone";
			version: 1;
			data: {
				mergeId: string & z60.$brand<"pmrg">;
				survivorProspectId: string & z60.$brand<"prs">;
				restoredProspectIds: (string & z60.$brand<"prs">)[];
			};
		};
		safeParse: (input: unknown) => z60.ZodSafeParseResult<{
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.merge_undone";
			version: 1;
			data: {
				mergeId: string & z60.$brand<"pmrg">;
				survivorProspectId: string & z60.$brand<"prs">;
				restoredProspectIds: (string & z60.$brand<"prs">)[];
			};
		}>;
	};
	readonly "prospect.erased": {
		type: "prospect.erased";
		version: 1;
		schema: z60.ZodObject<{
			id: z60.core.$ZodBranded<z60.ZodString, "evt", "out">;
			occurredAt: z60.ZodISODateTime;
			organizationId: z60.core.$ZodBranded<z60.ZodString, "org", "out">;
			region: z60.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z60.ZodLiteral<"prospect.erased">;
			version: z60.ZodLiteral<1>;
			data: z60.ZodObject<{
				prospectId: z60.core.$ZodBranded<z60.ZodString, "prs", "out">;
			}, z60.core.$strict>;
		}, z60.core.$strip>;
		parse: (input: unknown) => {
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.erased";
			version: 1;
			data: {
				prospectId: string & z60.$brand<"prs">;
			};
		};
		safeParse: (input: unknown) => z60.ZodSafeParseResult<{
			id: string & z60.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z60.$brand<"org">;
			region: "eu" | "us";
			type: "prospect.erased";
			version: 1;
			data: {
				prospectId: string & z60.$brand<"prs">;
			};
		}>;
	};
};
/** The type of a Prospect event. */
type ProspectEventType = keyof typeof PROSPECT_EVENTS;
import { z as z61 } from "zod";
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
declare const prospectImportStateSchema: z61.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of an import. */
type ProspectImportState = z61.infer<typeof prospectImportStateSchema>;
/** Why a whole import failed after it was accepted. */
declare const PROSPECT_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable"];
/** Why a whole import failed. */
declare const prospectImportFailureReasonSchema: z61.ZodEnum<{
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import failed. */
type ProspectImportFailureReason = z61.infer<typeof prospectImportFailureReasonSchema>;
/** What happened to one row. */
declare const PROSPECT_IMPORT_ROW_RESULTS: readonly ["created", "updated", "skipped", "rejected"];
/** What happened to one row. */
declare const prospectImportRowResultSchema: z61.ZodEnum<{
	created: "created";
	rejected: "rejected";
	skipped: "skipped";
	updated: "updated";
}>;
/** What happened to one row. */
type ProspectImportRowResult = z61.infer<typeof prospectImportRowResultSchema>;
/** Why a row was skipped: the file changes nothing for it. */
declare const PROSPECT_IMPORT_SKIP_REASONS: readonly ["no_change", "manual_values_kept"];
/** Why a row was rejected: the row is not applied and the file needs fixing. */
declare const PROSPECT_IMPORT_REJECT_REASONS: readonly ["wrong_column_count", "blank_row", "missing_identity", "invalid_email", "invalid_phone", "invalid_linkedin_url", "invalid_name", "invalid_job_title", "invalid_company", "invalid_tags", "owner_not_found", "owner_not_allowed", "duplicate_in_file", "identity_conflict"];
/** Why a row was skipped or rejected. */
declare const prospectImportRowReasonSchema: z61.ZodEnum<{
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
type ProspectImportRowReason = z61.infer<typeof prospectImportRowReasonSchema>;
/**
* A Prospect import as core returns it. It carries no file name and no cell. The counts are
* `null` until `completed`, then `rowCount` is the sum of the other four; `failureReason` is set
* exactly when `state` is `failed`. The report is the paginated rows. An import is a queued,
* idempotent and resumable job, so the page can be closed and the import read again by id.
*/
declare const prospectImportSchema: z61.ZodObject<{
	id: z61.core.$ZodBranded<z61.ZodString, "pimp", "out">;
	state: z61.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z61.ZodNullable<z61.ZodEnum<{
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z61.ZodNullable<z61.ZodNumber>;
	createdCount: z61.ZodNullable<z61.ZodNumber>;
	updatedCount: z61.ZodNullable<z61.ZodNumber>;
	skippedCount: z61.ZodNullable<z61.ZodNumber>;
	rejectedCount: z61.ZodNullable<z61.ZodNumber>;
	uploadedByUserId: z61.core.$ZodBranded<z61.ZodString, "usr", "out">;
	createdAt: z61.ZodISODateTime;
	updatedAt: z61.ZodISODateTime;
}, z61.core.$strip>;
/** A Prospect import as core returns it. */
type ProspectImport = z61.infer<typeof prospectImportSchema>;
/** The path parameters of a request about one import. */
declare const prospectImportParamsSchema: z61.ZodObject<{
	importId: z61.core.$ZodBranded<z61.ZodString, "pimp", "out">;
}, z61.core.$strict>;
/** The path parameters of a request about one import. */
type ProspectImportParams = z61.infer<typeof prospectImportParamsSchema>;
/** The query parameters of a request to list imports: a page. */
declare const listProspectImportsQuerySchema: z61.ZodObject<{
	cursor: z61.ZodOptional<z61.ZodString>;
	limit: z61.ZodDefault<z61.ZodPipe<z61.ZodPipe<z61.ZodUnion<readonly [z61.ZodNumber, z61.ZodString]>, z61.ZodTransform<number, string | number>>, z61.ZodNumber>>;
}, z61.core.$strict>;
/** The query parameters of a request to list imports. */
type ListProspectImportsQuery = z61.infer<typeof listProspectImportsQuerySchema>;
/** One page of imports, newest first (by `createdAt`, then id, both descending). */
declare const listProspectImportsResponseSchema: z61.ZodObject<{
	items: z61.ZodArray<z61.ZodObject<{
		id: z61.core.$ZodBranded<z61.ZodString, "pimp", "out">;
		state: z61.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z61.ZodNullable<z61.ZodEnum<{
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z61.ZodNullable<z61.ZodNumber>;
		createdCount: z61.ZodNullable<z61.ZodNumber>;
		updatedCount: z61.ZodNullable<z61.ZodNumber>;
		skippedCount: z61.ZodNullable<z61.ZodNumber>;
		rejectedCount: z61.ZodNullable<z61.ZodNumber>;
		uploadedByUserId: z61.core.$ZodBranded<z61.ZodString, "usr", "out">;
		createdAt: z61.ZodISODateTime;
		updatedAt: z61.ZodISODateTime;
	}, z61.core.$strip>>;
	nextCursor: z61.ZodNullable<z61.ZodString>;
}, z61.core.$strip>;
/** One page of imports. */
type ListProspectImportsResponse = z61.infer<typeof listProspectImportsResponseSchema>;
/** The position in an import list. */
declare const prospectImportCursorSchema: z61.ZodObject<{
	createdAt: z61.ZodISODateTime;
	id: z61.core.$ZodBranded<z61.ZodString, "pimp", "out">;
}, z61.core.$strict>;
/** The position in an import list. */
type ProspectImportCursor = z61.infer<typeof prospectImportCursorSchema>;
/**
* One row of the report: the record number (the header is record 1, so the first data row is 2),
* the `result` and, for a skipped or rejected row, the `reason`. `prospectId` is the Prospect the
* row created or updated (or matched, when skipped) and is `null` for a rejected row. No cell of
* the file is echoed, so a report carries no personal data.
*/
declare const prospectImportRowSchema: z61.ZodObject<{
	rowNumber: z61.ZodNumber;
	result: z61.ZodEnum<{
		created: "created";
		rejected: "rejected";
		skipped: "skipped";
		updated: "updated";
	}>;
	reason: z61.ZodNullable<z61.ZodEnum<{
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
	prospectId: z61.ZodNullable<z61.core.$ZodBranded<z61.ZodString, "prs", "out">>;
}, z61.core.$strip>;
/** One row of an import report. */
type ProspectImportRow = z61.infer<typeof prospectImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page and optionally one `result`. Rows are in CSV order. An unknown parameter is refused. */
declare const listProspectImportRowsQuerySchema: z61.ZodObject<{
	cursor: z61.ZodOptional<z61.ZodString>;
	limit: z61.ZodDefault<z61.ZodPipe<z61.ZodPipe<z61.ZodUnion<readonly [z61.ZodNumber, z61.ZodString]>, z61.ZodTransform<number, string | number>>, z61.ZodNumber>>;
	result: z61.ZodOptional<z61.ZodEnum<{
		created: "created";
		rejected: "rejected";
		skipped: "skipped";
		updated: "updated";
	}>>;
}, z61.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListProspectImportRowsQuery = z61.infer<typeof listProspectImportRowsQuerySchema>;
/** One page of an import report. */
declare const listProspectImportRowsResponseSchema: z61.ZodObject<{
	items: z61.ZodArray<z61.ZodObject<{
		rowNumber: z61.ZodNumber;
		result: z61.ZodEnum<{
			created: "created";
			rejected: "rejected";
			skipped: "skipped";
			updated: "updated";
		}>;
		reason: z61.ZodNullable<z61.ZodEnum<{
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
		prospectId: z61.ZodNullable<z61.core.$ZodBranded<z61.ZodString, "prs", "out">>;
	}, z61.core.$strip>>;
	nextCursor: z61.ZodNullable<z61.ZodString>;
}, z61.core.$strip>;
/** One page of an import report. */
type ListProspectImportRowsResponse = z61.infer<typeof listProspectImportRowsResponseSchema>;
/** The position in an import report: the record number of the last row of the page. */
declare const prospectImportRowCursorSchema: z61.ZodObject<{
	rowNumber: z61.ZodNumber;
}, z61.core.$strict>;
/** The position in an import report. */
type ProspectImportRowCursor = z61.infer<typeof prospectImportRowCursorSchema>;
/** The columns of the downloadable report CSV, in order. */
declare const PROSPECT_IMPORT_REPORT_COLUMNS: readonly ["row_number", "result", "reason", "prospect_id"];
/** Why an upload is refused with `prospect.import_invalid`, carried in `details.reason`. */
declare const PROSPECT_IMPORT_INVALID_REASONS: readonly ["unsupported_type", "too_large", "header_invalid", "too_many_rows"];
/** The `details` of `prospect.import_invalid`: which check the upload failed. */
declare const prospectImportInvalidDetailsSchema: z61.ZodObject<{
	reason: z61.ZodEnum<{
		header_invalid: "header_invalid";
		too_large: "too_large";
		too_many_rows: "too_many_rows";
		unsupported_type: "unsupported_type";
	}>;
}, z61.core.$strict>;
/** The `details` of `prospect.import_invalid`. */
type ProspectImportInvalidDetails = z61.infer<typeof prospectImportInvalidDetailsSchema>;
import { z as z62 } from "zod";
/** How many days after a merge it can be undone (spec M2, story 13). */
declare const PROSPECT_MERGE_UNDO_DAYS = 30;
/** The most Prospects one merge folds into the survivor. */
declare const MAX_MERGED_PROSPECTS = 5;
/** The path parameters of a request about one merge. */
declare const prospectMergeParamsSchema: z62.ZodObject<{
	mergeId: z62.core.$ZodBranded<z62.ZodString, "pmrg", "out">;
}, z62.core.$strict>;
/** The path parameters of a request about one merge. */
type ProspectMergeParams = z62.infer<typeof prospectMergeParamsSchema>;
/**
* The body of a request to merge Prospects into the survivor named in the path (`prospectId`).
* `fieldChoices` says, per field, which of the merging Prospects' value to keep, by Prospect id
* (the survivor's or one of `mergedProspectIds`); a field not named keeps the value that ADR 0020
* would choose across all the records. Every merged Prospect's history is kept, with the
* survivor's. Owner and Admin only. A Prospect that is not visible, or already merged, is
* `prospect.merge_conflict` or `prospect.not_found`. Accepts an `Idempotency-Key` header.
*/
declare const mergeProspectsRequestSchema: z62.ZodObject<{
	mergedProspectIds: z62.ZodArray<z62.core.$ZodBranded<z62.ZodString, "prs", "out">>;
	fieldChoices: z62.ZodDefault<z62.ZodRecord<z62.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z62.core.$partial, z62.core.$ZodBranded<z62.ZodString, "prs", "out">>>;
}, z62.core.$strict>;
/** The body of a request to merge Prospects. */
type MergeProspectsRequest = z62.infer<typeof mergeProspectsRequestSchema>;
/** The states of a merge: `merged`, or `undone` once reversed. */
declare const PROSPECT_MERGE_STATES: readonly ["merged", "undone"];
/**
* A merge record. Undo is possible while `state` is `merged` and now is before `undoableUntil`
* (thirty days after `createdAt`); later it is `prospect.merge_conflict`. `undoneAt` is set exactly
* when the state is `undone`. The snapshot that restores both records stays in core and is not returned.
*/
declare const prospectMergeSchema: z62.ZodObject<{
	id: z62.core.$ZodBranded<z62.ZodString, "pmrg", "out">;
	survivorProspectId: z62.core.$ZodBranded<z62.ZodString, "prs", "out">;
	mergedProspectIds: z62.ZodArray<z62.core.$ZodBranded<z62.ZodString, "prs", "out">>;
	fieldChoices: z62.ZodRecord<z62.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z62.core.$partial, z62.core.$ZodBranded<z62.ZodString, "prs", "out">>;
	state: z62.ZodEnum<{
		merged: "merged";
		undone: "undone";
	}>;
	mergedByUserId: z62.core.$ZodBranded<z62.ZodString, "usr", "out">;
	createdAt: z62.ZodISODateTime;
	undoableUntil: z62.ZodISODateTime;
	undoneAt: z62.ZodNullable<z62.ZodISODateTime>;
}, z62.core.$strip>;
/** A merge record. */
type ProspectMerge = z62.infer<typeof prospectMergeSchema>;
/**
* The query parameters of a request to list suspected duplicates: a page and optionally the
* `prospectId` whose duplicates to list. Matching runs on the indexed normalised identities.
*/
declare const listProspectDuplicatesQuerySchema: z62.ZodObject<{
	cursor: z62.ZodOptional<z62.ZodString>;
	limit: z62.ZodDefault<z62.ZodPipe<z62.ZodPipe<z62.ZodUnion<readonly [z62.ZodNumber, z62.ZodString]>, z62.ZodTransform<number, string | number>>, z62.ZodNumber>>;
	prospectId: z62.ZodOptional<z62.core.$ZodBranded<z62.ZodString, "prs", "out">>;
}, z62.core.$strict>;
/** The query parameters of a request to list suspected duplicates. */
type ListProspectDuplicatesQuery = z62.infer<typeof listProspectDuplicatesQuerySchema>;
/** One suspected duplicate: two Prospects (in id order) and the identity kinds they share. */
declare const prospectDuplicateSchema: z62.ZodObject<{
	prospectIds: z62.ZodTuple<[z62.core.$ZodBranded<z62.ZodString, "prs", "out">, z62.core.$ZodBranded<z62.ZodString, "prs", "out">], null>;
	matchedOn: z62.ZodArray<z62.ZodEnum<{
		email: "email";
		linkedin: "linkedin";
		phone: "phone";
	}>>;
}, z62.core.$strip>;
/** One suspected duplicate. */
type ProspectDuplicate = z62.infer<typeof prospectDuplicateSchema>;
/** One page of suspected duplicates. */
declare const listProspectDuplicatesResponseSchema: z62.ZodObject<{
	items: z62.ZodArray<z62.ZodObject<{
		prospectIds: z62.ZodTuple<[z62.core.$ZodBranded<z62.ZodString, "prs", "out">, z62.core.$ZodBranded<z62.ZodString, "prs", "out">], null>;
		matchedOn: z62.ZodArray<z62.ZodEnum<{
			email: "email";
			linkedin: "linkedin";
			phone: "phone";
		}>>;
	}, z62.core.$strip>>;
	nextCursor: z62.ZodNullable<z62.ZodString>;
}, z62.core.$strip>;
/** One page of suspected duplicates. */
type ListProspectDuplicatesResponse = z62.infer<typeof listProspectDuplicatesResponseSchema>;
/** The position in the suspected-duplicate list. */
declare const prospectDuplicateCursorSchema: z62.ZodObject<{
	first: z62.core.$ZodBranded<z62.ZodString, "prs", "out">;
	second: z62.core.$ZodBranded<z62.ZodString, "prs", "out">;
}, z62.core.$strict>;
/** The position in the suspected-duplicate list. */
type ProspectDuplicateCursor = z62.infer<typeof prospectDuplicateCursorSchema>;
import { z as z63 } from "zod";
/** The states of a Prospect: `active`, or `archived` to hide it from the default list without erasing it. */
declare const PROSPECT_STATUSES: readonly ["active", "archived"];
/** The state of a Prospect. */
declare const prospectStatusSchema: z63.ZodEnum<{
	active: "active";
	archived: "archived";
}>;
/** The state of a Prospect. */
type ProspectStatus = z63.infer<typeof prospectStatusSchema>;
/**
* A Prospect as core returns it. `fields` holds the current value of each field that has one, with
* its Source, time and actor (ADR 0020); a field with no value is absent. `email`, `phone` and
* `linkedinUrl` are the normalised identity values (ADR 0011: ASCII-folded email, E.164 phone,
* normalised LinkedIn address). `source` is the Source kind that created the Prospect.
* `ownerMembershipId` is the owner Rep's Membership, `null` while unassigned.
*/
declare const prospectSchema: z63.ZodObject<{
	id: z63.core.$ZodBranded<z63.ZodString, "prs", "out">;
	companyId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "pco", "out">>;
	ownerMembershipId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "mem", "out">>;
	status: z63.ZodEnum<{
		active: "active";
		archived: "archived";
	}>;
	source: z63.ZodUnion<readonly [z63.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z63.ZodString]>;
	tags: z63.ZodArray<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	notes: z63.ZodNullable<z63.ZodString>;
	fields: z63.ZodRecord<z63.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}> & z63.core.$partial, z63.ZodObject<{
		value: z63.ZodString;
		source: z63.ZodUnion<readonly [z63.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z63.ZodString]>;
		sourceRef: z63.ZodNullable<z63.ZodString>;
		setAt: z63.ZodISODateTime;
		setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
	}, z63.core.$strip>>;
	createdAt: z63.ZodISODateTime;
	updatedAt: z63.ZodISODateTime;
}, z63.core.$strip>;
/** A Prospect as core returns it. */
type Prospect = z63.infer<typeof prospectSchema>;
/** The path parameters of a request about one Prospect. */
declare const prospectParamsSchema: z63.ZodObject<{
	prospectId: z63.core.$ZodBranded<z63.ZodString, "prs", "out">;
}, z63.core.$strict>;
/** The path parameters of a request about one Prospect. */
type ProspectParams = z63.infer<typeof prospectParamsSchema>;
/**
* The body of a request to create a Prospect by hand. It must carry at least one of a name, an
* email, a phone or a LinkedIn address. The Source is `manual` and the actor the caller, both set
* by core, never read from the body, so an unknown field such as `source` is refused. A Rep is the
* owner of the Prospect they create; only Owner and Admin may name another `ownerMembershipId`,
* and anyone else gets `prospect.forbidden_owner`. An identity another Prospect of the
* Organization already has is `prospect.duplicate_identity`. The call accepts an `Idempotency-Key`
* header (`idempotencyKeySchema`): a replay returns the original Prospect.
*/
declare const createProspectRequestSchema: z63.ZodObject<{
	firstName: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	lastName: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	jobTitle: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	email: z63.ZodOptional<z63.ZodPipe<z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>, z63.ZodString>>;
	phone: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	linkedinUrl: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	companyId: z63.ZodOptional<z63.core.$ZodBranded<z63.ZodString, "pco", "out">>;
	ownerMembershipId: z63.ZodOptional<z63.core.$ZodBranded<z63.ZodString, "mem", "out">>;
	tags: z63.ZodOptional<z63.ZodArray<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	notes: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
}, z63.core.$strict>;
/** The body of a request to create a Prospect. */
type CreateProspectRequest = z63.infer<typeof createProspectRequestSchema>;
/**
* The body of a request to edit a Prospect. Only the fields sent change; each is written with the
* Source `manual`, which beats every other Source (ADR 0020). A `null` clears a field or the
* Prospect Company, the explicit Rep or Admin action that is the only way to remove a manual
* value. At least one field is required. Ownership is changed by the owner routes, not here.
*/
declare const updateProspectRequestSchema: z63.ZodObject<{
	firstName: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	lastName: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	jobTitle: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	email: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>, z63.ZodString>>>;
	phone: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	linkedinUrl: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	companyId: z63.ZodOptional<z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "pco", "out">>>;
	status: z63.ZodOptional<z63.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	tags: z63.ZodOptional<z63.ZodArray<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
	notes: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodString, z63.ZodString>>>;
}, z63.core.$strict>;
/** The body of a request to edit a Prospect. */
type UpdateProspectRequest = z63.infer<typeof updateProspectRequestSchema>;
/** The search text of a list request: trimmed, 1 to 100 characters, matched against name, email and company. */
declare const prospectSearchSchema: z63.ZodPipe<z63.ZodString, z63.ZodString>;
/**
* The query parameters of a request to list Prospects: a cursor and a limit of at most 100, and
* optionally `ownerMembershipId`, `source` (the Source kind that created it), `companyId`,
* `status` and `q`. An unknown parameter is refused. Who sees which Prospect is decided from the
* token's role and Team membership (a Rep sees what they own, a Manager what their Team's Reps
* own, Owner and Admin all); a filter can narrow that, never widen it.
*/
declare const listProspectsQuerySchema: z63.ZodObject<{
	cursor: z63.ZodOptional<z63.ZodString>;
	limit: z63.ZodDefault<z63.ZodPipe<z63.ZodPipe<z63.ZodUnion<readonly [z63.ZodNumber, z63.ZodString]>, z63.ZodTransform<number, string | number>>, z63.ZodNumber>>;
	ownerMembershipId: z63.ZodOptional<z63.core.$ZodBranded<z63.ZodString, "mem", "out">>;
	source: z63.ZodOptional<z63.ZodUnion<readonly [z63.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z63.ZodString]>>;
	companyId: z63.ZodOptional<z63.core.$ZodBranded<z63.ZodString, "pco", "out">>;
	status: z63.ZodOptional<z63.ZodEnum<{
		active: "active";
		archived: "archived";
	}>>;
	q: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
}, z63.core.$strict>;
/** The query parameters of a request to list Prospects. */
type ListProspectsQuery = z63.infer<typeof listProspectsQuerySchema>;
/** One page of Prospects, newest first (by `createdAt`, then id, both descending). */
declare const listProspectsResponseSchema: z63.ZodObject<{
	items: z63.ZodArray<z63.ZodObject<{
		id: z63.core.$ZodBranded<z63.ZodString, "prs", "out">;
		companyId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "pco", "out">>;
		ownerMembershipId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "mem", "out">>;
		status: z63.ZodEnum<{
			active: "active";
			archived: "archived";
		}>;
		source: z63.ZodUnion<readonly [z63.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z63.ZodString]>;
		tags: z63.ZodArray<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
		notes: z63.ZodNullable<z63.ZodString>;
		fields: z63.ZodRecord<z63.ZodEnum<{
			email: "email";
			firstName: "firstName";
			jobTitle: "jobTitle";
			lastName: "lastName";
			linkedinUrl: "linkedinUrl";
			phone: "phone";
		}> & z63.core.$partial, z63.ZodObject<{
			value: z63.ZodString;
			source: z63.ZodUnion<readonly [z63.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z63.ZodString]>;
			sourceRef: z63.ZodNullable<z63.ZodString>;
			setAt: z63.ZodISODateTime;
			setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
		}, z63.core.$strip>>;
		createdAt: z63.ZodISODateTime;
		updatedAt: z63.ZodISODateTime;
	}, z63.core.$strip>>;
	nextCursor: z63.ZodNullable<z63.ZodString>;
}, z63.core.$strip>;
/** One page of Prospects. */
type ListProspectsResponse = z63.infer<typeof listProspectsResponseSchema>;
/** The position in a Prospect list: where the last item of the page was. */
declare const prospectCursorSchema: z63.ZodObject<{
	createdAt: z63.ZodISODateTime;
	id: z63.core.$ZodBranded<z63.ZodString, "prs", "out">;
}, z63.core.$strict>;
/** The position in a Prospect list. */
type ProspectCursor = z63.infer<typeof prospectCursorSchema>;
/** The path parameters of a request for the history of one Prospect field. */
declare const prospectFieldParamsSchema: z63.ZodObject<{
	prospectId: z63.core.$ZodBranded<z63.ZodString, "prs", "out">;
	field: z63.ZodEnum<{
		email: "email";
		firstName: "firstName";
		jobTitle: "jobTitle";
		lastName: "lastName";
		linkedinUrl: "linkedinUrl";
		phone: "phone";
	}>;
}, z63.core.$strict>;
/** The path parameters of a request for the history of one Prospect field. */
type ProspectFieldParams = z63.infer<typeof prospectFieldParamsSchema>;
/** The query parameters of a request for a field's history: a page. */
declare const listFieldHistoryQuerySchema: z63.ZodObject<{
	cursor: z63.ZodOptional<z63.ZodString>;
	limit: z63.ZodDefault<z63.ZodPipe<z63.ZodPipe<z63.ZodUnion<readonly [z63.ZodNumber, z63.ZodString]>, z63.ZodTransform<number, string | number>>, z63.ZodNumber>>;
}, z63.core.$strict>;
/** The query parameters of a request for a field's history. */
type ListFieldHistoryQuery = z63.infer<typeof listFieldHistoryQuerySchema>;
/** One page of a field's history, newest first; the current value, earlier values and enrichment suggestions all appear, each with its Source. */
declare const listFieldHistoryResponseSchema: z63.ZodObject<{
	items: z63.ZodArray<z63.ZodObject<{
		value: z63.ZodString;
		source: z63.ZodUnion<readonly [z63.ZodEnum<{
			"crm:hubspot": "crm:hubspot";
			"crm:salesforce": "crm:salesforce";
			form: "form";
			import: "import";
			manual: "manual";
		}>, z63.ZodString]>;
		sourceRef: z63.ZodNullable<z63.ZodString>;
		setAt: z63.ZodISODateTime;
		setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
		state: z63.ZodEnum<{
			current: "current";
			suggested: "suggested";
			superseded: "superseded";
		}>;
	}, z63.core.$strip>>;
	nextCursor: z63.ZodNullable<z63.ZodString>;
}, z63.core.$strip>;
/** One page of a field's history. */
type ListFieldHistoryResponse = z63.infer<typeof listFieldHistoryResponseSchema>;
/** The position in a field's history. */
declare const fieldHistoryCursorSchema: z63.ZodObject<{
	setAt: z63.ZodISODateTime;
	seq: z63.ZodNumber;
}, z63.core.$strict>;
/** The position in a field's history. */
type FieldHistoryCursor = z63.infer<typeof fieldHistoryCursorSchema>;
/**
* The body of a request to change a Prospect's owner Rep. The new owner must be a Rep or Manager
* of the same Organization, else `prospect.forbidden_owner`. Owner and Admin only.
*/
declare const setProspectOwnerRequestSchema: z63.ZodObject<{
	ownerMembershipId: z63.core.$ZodBranded<z63.ZodString, "mem", "out">;
}, z63.core.$strict>;
/** The body of a request to change a Prospect's owner. */
type SetProspectOwnerRequest = z63.infer<typeof setProspectOwnerRequestSchema>;
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
declare const bulkAssignProspectsRequestSchema: z63.ZodObject<{
	prospectIds: z63.ZodArray<z63.core.$ZodBranded<z63.ZodString, "prs", "out">>;
	ownerMembershipId: z63.core.$ZodBranded<z63.ZodString, "mem", "out">;
}, z63.core.$strict>;
/** The body of a request to assign many Prospects. */
type BulkAssignProspectsRequest = z63.infer<typeof bulkAssignProspectsRequestSchema>;
/** The answer to a bulk assignment: `applied` counts when it ran at once, `queued` when it was handed to a job (then the counts are `null`). */
declare const bulkAssignProspectsResponseSchema: z63.ZodObject<{
	state: z63.ZodEnum<{
		applied: "applied";
		queued: "queued";
	}>;
	requested: z63.ZodNumber;
	assigned: z63.ZodNullable<z63.ZodNumber>;
	skipped: z63.ZodNullable<z63.ZodNumber>;
}, z63.core.$strip>;
/** The answer to a bulk assignment. */
type BulkAssignProspectsResponse = z63.infer<typeof bulkAssignProspectsResponseSchema>;
/** The answer to an erasure request: it is a queued job, so the Prospect is gone once `prospect.erased` is published. Carries no personal data. */
declare const eraseProspectResponseSchema: z63.ZodObject<{
	prospectId: z63.core.$ZodBranded<z63.ZodString, "prs", "out">;
	state: z63.ZodLiteral<"queued">;
}, z63.core.$strip>;
/** The answer to an erasure request. */
type EraseProspectResponse = z63.infer<typeof eraseProspectResponseSchema>;
/**
* A Prospect Company as core returns it: the name and domain with their Source, time and actor.
* `domain` is the normalised domain (ASCII-folded host). `name` is always present.
*/
declare const prospectCompanySchema: z63.ZodObject<{
	id: z63.core.$ZodBranded<z63.ZodString, "pco", "out">;
	fields: z63.ZodObject<{
		name: z63.ZodObject<{
			value: z63.ZodString;
			source: z63.ZodUnion<readonly [z63.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z63.ZodString]>;
			sourceRef: z63.ZodNullable<z63.ZodString>;
			setAt: z63.ZodISODateTime;
			setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
		}, z63.core.$strip>;
		domain: z63.ZodOptional<z63.ZodObject<{
			value: z63.ZodString;
			source: z63.ZodUnion<readonly [z63.ZodEnum<{
				"crm:hubspot": "crm:hubspot";
				"crm:salesforce": "crm:salesforce";
				form: "form";
				import: "import";
				manual: "manual";
			}>, z63.ZodString]>;
			sourceRef: z63.ZodNullable<z63.ZodString>;
			setAt: z63.ZodISODateTime;
			setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
		}, z63.core.$strip>>;
	}, z63.core.$strip>;
	createdAt: z63.ZodISODateTime;
	updatedAt: z63.ZodISODateTime;
}, z63.core.$strip>;
/** A Prospect Company as core returns it. */
type ProspectCompany = z63.infer<typeof prospectCompanySchema>;
/** The path parameters of a request about one Prospect Company. */
declare const prospectCompanyParamsSchema: z63.ZodObject<{
	companyId: z63.core.$ZodBranded<z63.ZodString, "pco", "out">;
}, z63.core.$strict>;
/** The path parameters of a request about one Prospect Company. */
type ProspectCompanyParams = z63.infer<typeof prospectCompanyParamsSchema>;
/** The path parameters of a request for the history of one Prospect Company field. */
declare const prospectCompanyFieldParamsSchema: z63.ZodObject<{
	companyId: z63.core.$ZodBranded<z63.ZodString, "pco", "out">;
	field: z63.ZodEnum<{
		domain: "domain";
		name: "name";
	}>;
}, z63.core.$strict>;
/** The path parameters of a request for the history of one Prospect Company field. */
type ProspectCompanyFieldParams = z63.infer<typeof prospectCompanyFieldParamsSchema>;
/**
* The body of a request to create a Prospect Company, written with the Source `manual`. Accepts an
* `Idempotency-Key` header: a replay returns the original record.
*/
declare const createProspectCompanyRequestSchema: z63.ZodObject<{
	name: z63.ZodPipe<z63.ZodString, z63.ZodString>;
	domain: z63.ZodOptional<z63.ZodPipe<z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>, z63.ZodString>>;
}, z63.core.$strict>;
/** The body of a request to create a Prospect Company. */
type CreateProspectCompanyRequest = z63.infer<typeof createProspectCompanyRequestSchema>;
/** The body of a request to edit a Prospect Company: only the fields sent change, written with the Source `manual`; `null` clears the domain. At least one field is required. */
declare const updateProspectCompanyRequestSchema: z63.ZodObject<{
	name: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
	domain: z63.ZodOptional<z63.ZodNullable<z63.ZodPipe<z63.ZodPipe<z63.ZodString, z63.ZodTransform<string, string>>, z63.ZodString>>>;
}, z63.core.$strict>;
/** The body of a request to edit a Prospect Company. */
type UpdateProspectCompanyRequest = z63.infer<typeof updateProspectCompanyRequestSchema>;
/** The query parameters of a request to list Prospect Companies: a page and optionally a `q` search on name and domain. An unknown parameter is refused. */
declare const listProspectCompaniesQuerySchema: z63.ZodObject<{
	cursor: z63.ZodOptional<z63.ZodString>;
	limit: z63.ZodDefault<z63.ZodPipe<z63.ZodPipe<z63.ZodUnion<readonly [z63.ZodNumber, z63.ZodString]>, z63.ZodTransform<number, string | number>>, z63.ZodNumber>>;
	q: z63.ZodOptional<z63.ZodPipe<z63.ZodString, z63.ZodString>>;
}, z63.core.$strict>;
/** The query parameters of a request to list Prospect Companies. */
type ListProspectCompaniesQuery = z63.infer<typeof listProspectCompaniesQuerySchema>;
/** One page of Prospect Companies, newest first (by `createdAt`, then id, both descending). */
declare const listProspectCompaniesResponseSchema: z63.ZodObject<{
	items: z63.ZodArray<z63.ZodObject<{
		id: z63.core.$ZodBranded<z63.ZodString, "pco", "out">;
		fields: z63.ZodObject<{
			name: z63.ZodObject<{
				value: z63.ZodString;
				source: z63.ZodUnion<readonly [z63.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z63.ZodString]>;
				sourceRef: z63.ZodNullable<z63.ZodString>;
				setAt: z63.ZodISODateTime;
				setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
			}, z63.core.$strip>;
			domain: z63.ZodOptional<z63.ZodObject<{
				value: z63.ZodString;
				source: z63.ZodUnion<readonly [z63.ZodEnum<{
					"crm:hubspot": "crm:hubspot";
					"crm:salesforce": "crm:salesforce";
					form: "form";
					import: "import";
					manual: "manual";
				}>, z63.ZodString]>;
				sourceRef: z63.ZodNullable<z63.ZodString>;
				setAt: z63.ZodISODateTime;
				setByUserId: z63.ZodNullable<z63.core.$ZodBranded<z63.ZodString, "usr", "out">>;
			}, z63.core.$strip>>;
		}, z63.core.$strip>;
		createdAt: z63.ZodISODateTime;
		updatedAt: z63.ZodISODateTime;
	}, z63.core.$strip>>;
	nextCursor: z63.ZodNullable<z63.ZodString>;
}, z63.core.$strip>;
/** One page of Prospect Companies. */
type ListProspectCompaniesResponse = z63.infer<typeof listProspectCompaniesResponseSchema>;
/** The position in a Prospect Company list. */
declare const prospectCompanyCursorSchema: z63.ZodObject<{
	createdAt: z63.ZodISODateTime;
	id: z63.core.$ZodBranded<z63.ZodString, "pco", "out">;
}, z63.core.$strict>;
/** The position in a Prospect Company list. */
type ProspectCompanyCursor = z63.infer<typeof prospectCompanyCursorSchema>;
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
import { z as z64 } from "zod";
/** True when the text holds a control character; line breaks and tabs are allowed when `allowLineBreaks` is set. */
declare function hasControlCharacter(text: string, allowLineBreaks: boolean): boolean;
/** Trimmed text of 1 to `maxLength` characters with no control character; a request value is untrusted text for display code. */
declare function boundedTextSchema(maxLength: number): z64.ZodPipe<z64.ZodString, z64.ZodString>;
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
declare const prospectNamePartSchema: z64.ZodPipe<z64.ZodString, z64.ZodString>;
/** A job title in a request: trimmed, 1 to 200 characters, no control character. */
declare const prospectJobTitleSchema: z64.ZodPipe<z64.ZodString, z64.ZodString>;
/** A Prospect Company name in a request: trimmed, 1 to 200 characters, no control character. */
declare const prospectCompanyNameSchema: z64.ZodPipe<z64.ZodString, z64.ZodString>;
/** Free-text notes on a Prospect: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
declare const prospectNotesSchema: z64.ZodPipe<z64.ZodString, z64.ZodString>;
/** The tags of a Prospect in a request: at most 20, each trimmed and 1 to 50 characters, no duplicates. */
declare const prospectTagsSchema: z64.ZodArray<z64.ZodPipe<z64.ZodString, z64.ZodString>>;
/**
* A phone number as typed in a request: 3 to 40 characters of digits, spaces, `+`, `(`, `)`, `.`
* and `-`. Core normalises it to E.164 (ADR 0011) and refuses what it cannot, as `request.invalid`.
*/
declare const rawPhoneSchema: z64.ZodPipe<z64.ZodString, z64.ZodString>;
/** A phone number in E.164 form, as a response carries a normalised one: `+` and 7 to 15 digits. */
declare const e164PhoneSchema: z64.ZodString;
/**
* A LinkedIn profile address as typed in a request: 1 to 300 characters naming `linkedin.com`.
* Core normalises it (ADR 0011) and refuses what it cannot, as `request.invalid`.
*/
declare const rawLinkedinUrlSchema: z64.ZodPipe<z64.ZodString, z64.ZodString>;
/**
* A company web domain in a request: folded to lower case, 3 to 253 characters, dotted ASCII
* labels of letters, digits and hyphens (an internationalised domain is sent in punycode).
*/
declare const prospectCompanyDomainSchema: z64.ZodPipe<z64.ZodPipe<z64.ZodString, z64.ZodTransform<string, string>>, z64.ZodString>;
/** The kinds of identity a Prospect is matched on (ADR 0011). */
declare const PROSPECT_IDENTITY_KINDS: readonly ["email", "phone", "linkedin"];
/** The kind of identity a Prospect is matched on. */
declare const prospectIdentityKindSchema: z64.ZodEnum<{
	email: "email";
	linkedin: "linkedin";
	phone: "phone";
}>;
/** The kind of identity a Prospect is matched on. */
type ProspectIdentityKind = z64.infer<typeof prospectIdentityKindSchema>;
/** The fields of a Prospect that carry a Source, in the camelCase the API uses. Email, phone and LinkedIn are also its identities. */
declare const PROSPECT_FIELD_NAMES: readonly ["firstName", "lastName", "jobTitle", "email", "phone", "linkedinUrl"];
/** The name of a Prospect field that carries a Source. */
declare const prospectFieldNameSchema: z64.ZodEnum<{
	email: "email";
	firstName: "firstName";
	jobTitle: "jobTitle";
	lastName: "lastName";
	linkedinUrl: "linkedinUrl";
	phone: "phone";
}>;
/** The name of a Prospect field that carries a Source. */
type ProspectFieldName = z64.infer<typeof prospectFieldNameSchema>;
/** The fields of a Prospect Company that carry a Source. */
declare const PROSPECT_COMPANY_FIELD_NAMES: readonly ["name", "domain"];
/** The name of a Prospect Company field that carries a Source. */
declare const prospectCompanyFieldNameSchema: z64.ZodEnum<{
	domain: "domain";
	name: "name";
}>;
/** The name of a Prospect Company field that carries a Source. */
type ProspectCompanyFieldName = z64.infer<typeof prospectCompanyFieldNameSchema>;
/** The most history entries kept per field (ADR 0020 bounds the history); the oldest non-current entries go first. */
declare const MAX_FIELD_HISTORY_ENTRIES = 50;
/** The Source kinds that are fixed words; `enrichment:<provider>` is the open one. */
declare const FIXED_SOURCE_KINDS: readonly ["manual", "import", "crm:hubspot", "crm:salesforce", "form"];
/**
* A Source kind (ADR 0020): `manual`, `import`, `crm:hubspot`, `crm:salesforce`, `form` or
* `enrichment:<provider>` with a provider of 1 to 32 lower-case letters, digits and underscores.
* Writers never choose it in a request body: core sets it from the route and the token.
*/
declare const sourceKindSchema: z64.ZodUnion<readonly [z64.ZodEnum<{
	"crm:hubspot": "crm:hubspot";
	"crm:salesforce": "crm:salesforce";
	form: "form";
	import: "import";
	manual: "manual";
}>, z64.ZodString]>;
/** A Source kind. */
type SourceKind = z64.infer<typeof sourceKindSchema>;
/**
* A stored value with where it came from, when and who set it (ADR 0020). `sourceRef` names the
* import job or CRM record and is `null` for manual entry; `setByUserId` is `null` when a system
* (an import job, a sync, a provider) set the value rather than a person.
*/
declare const fieldValueSchema: z64.ZodObject<{
	value: z64.ZodString;
	source: z64.ZodUnion<readonly [z64.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z64.ZodString]>;
	sourceRef: z64.ZodNullable<z64.ZodString>;
	setAt: z64.ZodISODateTime;
	setByUserId: z64.ZodNullable<z64.core.$ZodBranded<z64.ZodString, "usr", "out">>;
}, z64.core.$strip>;
/** A stored value with its Source, time and actor. */
type FieldValue = z64.infer<typeof fieldValueSchema>;
/** The states of a history entry: `current` is the value in force, `superseded` an earlier one, `suggested` an enrichment value kept beside an own value (ADR 0020). */
declare const FIELD_HISTORY_STATES: readonly ["current", "superseded", "suggested"];
/** The state of a history entry. */
declare const fieldHistoryStateSchema: z64.ZodEnum<{
	current: "current";
	suggested: "suggested";
	superseded: "superseded";
}>;
/** One entry of a field's history: the value with its Source, time and actor, and whether it is current, superseded or only suggested. */
declare const fieldHistoryEntrySchema: z64.ZodObject<{
	value: z64.ZodString;
	source: z64.ZodUnion<readonly [z64.ZodEnum<{
		"crm:hubspot": "crm:hubspot";
		"crm:salesforce": "crm:salesforce";
		form: "form";
		import: "import";
		manual: "manual";
	}>, z64.ZodString]>;
	sourceRef: z64.ZodNullable<z64.ZodString>;
	setAt: z64.ZodISODateTime;
	setByUserId: z64.ZodNullable<z64.core.$ZodBranded<z64.ZodString, "usr", "out">>;
	state: z64.ZodEnum<{
		current: "current";
		suggested: "suggested";
		superseded: "superseded";
	}>;
}, z64.core.$strip>;
/** One entry of a field's history. */
type FieldHistoryEntry = z64.infer<typeof fieldHistoryEntrySchema>;
import { z as z65 } from "zod";
/** The longest a Call can last, in seconds: 12 hours. */
declare const MAX_CALL_DURATION_SECONDS = 43200;
/**
* The Disclosure a Call played: the version of the wording and when it finished playing, both null
* until it has. `aiAssisted` is whether it also told the Prospect an AI takes part (the Copilot,
* an Agent). Nothing here, and no request, can turn the Disclosure off.
*/
declare const callDisclosureSchema: z65.ZodObject<{
	wordingVersion: z65.ZodNullable<z65.ZodNumber>;
	playedAt: z65.ZodNullable<z65.ZodISODateTime>;
	aiAssisted: z65.ZodBoolean;
}, z65.core.$strict>;
/** The Disclosure a Call played. */
type CallDisclosure = z65.infer<typeof callDisclosureSchema>;
/**
* A Call placed or taken in the Softphone. The Prospect's number is tenant data: it is shown to
* those who may see the Call and never logged. The invariants of the state machine are checked:
* `live` and `ended` need a played Disclosure, a Recording exists only after it, `failed` has a
* reason and nothing else does, and the wrap-up (Deal identifier, note) exists only on `ended`.
*/
declare const voiceCallSchema: z65.ZodObject<{
	id: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
	direction: z65.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	state: z65.ZodEnum<{
		connecting: "connecting";
		disclosing: "disclosing";
		ended: "ended";
		failed: "failed";
		live: "live";
		missed: "missed";
		ringing: "ringing";
	}>;
	lineId: z65.core.$ZodBranded<z65.ZodString, "line", "out">;
	repMembershipId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "mem", "out">>;
	prospectId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "prs", "out">>;
	prospectNumber: z65.ZodString;
	disclosure: z65.ZodObject<{
		wordingVersion: z65.ZodNullable<z65.ZodNumber>;
		playedAt: z65.ZodNullable<z65.ZodISODateTime>;
		aiAssisted: z65.ZodBoolean;
	}, z65.core.$strict>;
	createdAt: z65.ZodISODateTime;
	answeredAt: z65.ZodNullable<z65.ZodISODateTime>;
	endedAt: z65.ZodNullable<z65.ZodISODateTime>;
	durationSeconds: z65.ZodNullable<z65.ZodNumber>;
	endedBy: z65.ZodNullable<z65.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
		system: "system";
	}>>;
	failureReason: z65.ZodNullable<z65.ZodEnum<{
		busy: "busy";
		carrier_dropped: "carrier_dropped";
		carrier_rejected: "carrier_rejected";
		disclosure_failed: "disclosure_failed";
		no_answer: "no_answer";
		provider_error: "provider_error";
		rep_unreachable: "rep_unreachable";
		timeout: "timeout";
	}>>;
	dealId: z65.ZodNullable<z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>>;
	note: z65.ZodNullable<z65.ZodPipe<z65.ZodString, z65.ZodString>>;
	recordingState: z65.ZodEnum<{
		deleted: "deleted";
		none: "none";
		stored: "stored";
		storing: "storing";
	}>;
	transcriptState: z65.ZodEnum<{
		deleted: "deleted";
		pending: "pending";
		ready: "ready";
	}>;
}, z65.core.$strip>;
/** A Call. */
type VoiceCall = z65.infer<typeof voiceCallSchema>;
/** The path parameters of a request about one Call. */
declare const voiceCallParamsSchema: z65.ZodObject<{
	callId: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
}, z65.core.$strict>;
/** The position a Call list resumes from: newest first, by creation time then id. */
declare const voiceCallCursorSchema: z65.ZodObject<{
	createdAt: z65.ZodISODateTime;
	id: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
}, z65.core.$strict>;
/**
* The body of a request to place a Call to a number from the Rep's browser. The idempotency key is
* not in the body: see `placeCallHeadersSchema`. `to` is as typed; voice normalises it to
* E.164 and refuses what it cannot as `call.number_invalid`. `lineId` is the caller identity, the
* Rep's own Line when absent. `prospectId` links the Call to a Prospect the caller may see. There is
* no field that turns off the Disclosure or the Recording.
*/
declare const placeCallRequestSchema: z65.ZodObject<{
	to: z65.ZodPipe<z65.ZodString, z65.ZodString>;
	lineId: z65.ZodOptional<z65.core.$ZodBranded<z65.ZodString, "line", "out">>;
	prospectId: z65.ZodOptional<z65.core.$ZodBranded<z65.ZodString, "prs", "out">>;
}, z65.core.$strict>;
/**
* The headers of a request to place a Call. The `Idempotency-Key` header is required (header names
* arrive lower-cased): a retry of the same key answers the original Call and dials once, and the
* same key with a different body is `request.idempotency_key_reused`.
*/
declare const placeCallHeadersSchema: z65.ZodObject<{
	"idempotency-key": z65.ZodString;
}, z65.core.$strip>;
/** The body of a request to place a Call. */
type PlaceCallRequest = z65.infer<typeof placeCallRequestSchema>;
/**
* A warning for the Rep from the Contact Check on the number: the code of the denial and, for a
* suppressed number, the reason. A Rep may still call (ADR 0003); the warning is for their eyes.
*/
declare const contactWarningSchema: z65.ZodObject<{
	code: z65.ZodEnum<{
		"consent.missing": "consent.missing";
		"consent.suppressed": "consent.suppressed";
		"consent.unavailable": "consent.unavailable";
		"consent.withdrawn": "consent.withdrawn";
	}>;
	suppressionReason: z65.ZodNullable<z65.ZodEnum<{
		bounce: "bounce";
		complaint: "complaint";
		crm: "crm";
		erased: "erased";
		manual: "manual";
		stop: "stop";
		unsubscribe: "unsubscribe";
	}>>;
}, z65.core.$strict>;
/** A warning from the Contact Check. */
type ContactWarning = z65.infer<typeof contactWarningSchema>;
/** The answer to placing a Call: the Call, as it stands, and any warnings from the Contact Check. */
declare const placedCallSchema: z65.ZodObject<{
	call: z65.ZodObject<{
		id: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
		direction: z65.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		state: z65.ZodEnum<{
			connecting: "connecting";
			disclosing: "disclosing";
			ended: "ended";
			failed: "failed";
			live: "live";
			missed: "missed";
			ringing: "ringing";
		}>;
		lineId: z65.core.$ZodBranded<z65.ZodString, "line", "out">;
		repMembershipId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "mem", "out">>;
		prospectId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "prs", "out">>;
		prospectNumber: z65.ZodString;
		disclosure: z65.ZodObject<{
			wordingVersion: z65.ZodNullable<z65.ZodNumber>;
			playedAt: z65.ZodNullable<z65.ZodISODateTime>;
			aiAssisted: z65.ZodBoolean;
		}, z65.core.$strict>;
		createdAt: z65.ZodISODateTime;
		answeredAt: z65.ZodNullable<z65.ZodISODateTime>;
		endedAt: z65.ZodNullable<z65.ZodISODateTime>;
		durationSeconds: z65.ZodNullable<z65.ZodNumber>;
		endedBy: z65.ZodNullable<z65.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
			system: "system";
		}>>;
		failureReason: z65.ZodNullable<z65.ZodEnum<{
			busy: "busy";
			carrier_dropped: "carrier_dropped";
			carrier_rejected: "carrier_rejected";
			disclosure_failed: "disclosure_failed";
			no_answer: "no_answer";
			provider_error: "provider_error";
			rep_unreachable: "rep_unreachable";
			timeout: "timeout";
		}>>;
		dealId: z65.ZodNullable<z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>>;
		note: z65.ZodNullable<z65.ZodPipe<z65.ZodString, z65.ZodString>>;
		recordingState: z65.ZodEnum<{
			deleted: "deleted";
			none: "none";
			stored: "stored";
			storing: "storing";
		}>;
		transcriptState: z65.ZodEnum<{
			deleted: "deleted";
			pending: "pending";
			ready: "ready";
		}>;
	}, z65.core.$strip>;
	warnings: z65.ZodArray<z65.ZodObject<{
		code: z65.ZodEnum<{
			"consent.missing": "consent.missing";
			"consent.suppressed": "consent.suppressed";
			"consent.unavailable": "consent.unavailable";
			"consent.withdrawn": "consent.withdrawn";
		}>;
		suppressionReason: z65.ZodNullable<z65.ZodEnum<{
			bounce: "bounce";
			complaint: "complaint";
			crm: "crm";
			erased: "erased";
			manual: "manual";
			stop: "stop";
			unsubscribe: "unsubscribe";
		}>>;
	}, z65.core.$strict>>;
}, z65.core.$strict>;
/** The answer to placing a Call. */
type PlacedCall = z65.infer<typeof placedCallSchema>;
/**
* The query parameters of a request to list Calls, newest first. Filters narrow what the caller
* may see and never widen it. `from` and `to` bound `createdAt` (from inclusive, to exclusive).
*/
declare const listVoiceCallsQuerySchema: z65.ZodObject<{
	cursor: z65.ZodOptional<z65.ZodString>;
	limit: z65.ZodDefault<z65.ZodPipe<z65.ZodPipe<z65.ZodUnion<readonly [z65.ZodNumber, z65.ZodString]>, z65.ZodTransform<number, string | number>>, z65.ZodNumber>>;
	direction: z65.ZodOptional<z65.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>>;
	state: z65.ZodOptional<z65.ZodEnum<{
		connecting: "connecting";
		disclosing: "disclosing";
		ended: "ended";
		failed: "failed";
		live: "live";
		missed: "missed";
		ringing: "ringing";
	}>>;
	repMembershipId: z65.ZodOptional<z65.core.$ZodBranded<z65.ZodString, "mem", "out">>;
	lineId: z65.ZodOptional<z65.core.$ZodBranded<z65.ZodString, "line", "out">>;
	prospectId: z65.ZodOptional<z65.core.$ZodBranded<z65.ZodString, "prs", "out">>;
	from: z65.ZodOptional<z65.ZodISODateTime>;
	to: z65.ZodOptional<z65.ZodISODateTime>;
}, z65.core.$strict>;
/** The query parameters of a request to list Calls. */
type ListVoiceCallsQuery = z65.infer<typeof listVoiceCallsQuerySchema>;
/** One page of Calls. */
declare const voiceCallPageSchema: z65.ZodObject<{
	items: z65.ZodArray<z65.ZodObject<{
		id: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
		direction: z65.ZodEnum<{
			inbound: "inbound";
			outbound: "outbound";
		}>;
		state: z65.ZodEnum<{
			connecting: "connecting";
			disclosing: "disclosing";
			ended: "ended";
			failed: "failed";
			live: "live";
			missed: "missed";
			ringing: "ringing";
		}>;
		lineId: z65.core.$ZodBranded<z65.ZodString, "line", "out">;
		repMembershipId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "mem", "out">>;
		prospectId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "prs", "out">>;
		prospectNumber: z65.ZodString;
		disclosure: z65.ZodObject<{
			wordingVersion: z65.ZodNullable<z65.ZodNumber>;
			playedAt: z65.ZodNullable<z65.ZodISODateTime>;
			aiAssisted: z65.ZodBoolean;
		}, z65.core.$strict>;
		createdAt: z65.ZodISODateTime;
		answeredAt: z65.ZodNullable<z65.ZodISODateTime>;
		endedAt: z65.ZodNullable<z65.ZodISODateTime>;
		durationSeconds: z65.ZodNullable<z65.ZodNumber>;
		endedBy: z65.ZodNullable<z65.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
			system: "system";
		}>>;
		failureReason: z65.ZodNullable<z65.ZodEnum<{
			busy: "busy";
			carrier_dropped: "carrier_dropped";
			carrier_rejected: "carrier_rejected";
			disclosure_failed: "disclosure_failed";
			no_answer: "no_answer";
			provider_error: "provider_error";
			rep_unreachable: "rep_unreachable";
			timeout: "timeout";
		}>>;
		dealId: z65.ZodNullable<z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>>;
		note: z65.ZodNullable<z65.ZodPipe<z65.ZodString, z65.ZodString>>;
		recordingState: z65.ZodEnum<{
			deleted: "deleted";
			none: "none";
			stored: "stored";
			storing: "storing";
		}>;
		transcriptState: z65.ZodEnum<{
			deleted: "deleted";
			pending: "pending";
			ready: "ready";
		}>;
	}, z65.core.$strip>>;
	nextCursor: z65.ZodNullable<z65.ZodString>;
}, z65.core.$strip>;
/** Who spoke a turn of a Call's Transcript: the Rep (channel 1) or the Prospect. */
declare const transcriptSpeakerSchema: z65.ZodEnum<{
	prospect: "prospect";
	rep: "rep";
}>;
/** The longest text of one Transcript turn, in characters. */
declare const MAX_TRANSCRIPT_TURN_LENGTH = 4e3;
/** One turn of a Transcript: who spoke, when (milliseconds from the start of the Recording) and what. The text is the Prospect's and Rep's words: untrusted text, never logged. */
declare const transcriptTurnSchema: z65.ZodObject<{
	speaker: z65.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
	}>;
	startMs: z65.ZodNumber;
	endMs: z65.ZodNumber;
	text: z65.ZodString;
}, z65.core.$strict>;
/** One turn of a Transcript. */
type TranscriptTurn = z65.infer<typeof transcriptTurnSchema>;
/** The position a Transcript resumes from: the index of the next turn. */
declare const transcriptCursorSchema: z65.ZodObject<{
	index: z65.ZodNumber;
}, z65.core.$strict>;
/** The query parameters of a request to read a Transcript, one cursor-paginated page of turns at a time. */
declare const getTranscriptQuerySchema: z65.ZodObject<{
	cursor: z65.ZodOptional<z65.ZodString>;
	limit: z65.ZodDefault<z65.ZodPipe<z65.ZodPipe<z65.ZodUnion<readonly [z65.ZodNumber, z65.ZodString]>, z65.ZodTransform<number, string | number>>, z65.ZodNumber>>;
}, z65.core.$strict>;
/** One page of a Call's Transcript, in time order, with the state of the Transcript. Turns are empty unless `ready`. */
declare const transcriptPageSchema: z65.ZodObject<{
	items: z65.ZodArray<z65.ZodObject<{
		speaker: z65.ZodEnum<{
			prospect: "prospect";
			rep: "rep";
		}>;
		startMs: z65.ZodNumber;
		endMs: z65.ZodNumber;
		text: z65.ZodString;
	}, z65.core.$strict>>;
	nextCursor: z65.ZodNullable<z65.ZodString>;
	callId: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
	state: z65.ZodEnum<{
		deleted: "deleted";
		pending: "pending";
		ready: "ready";
	}>;
}, z65.core.$strip>;
/** One page of a Call's Transcript. */
type TranscriptPage = z65.infer<typeof transcriptPageSchema>;
/** The media types a Recording is played back as. */
declare const RECORDING_MEDIA_TYPES: readonly ["audio/mpeg", "audio/wav", "audio/ogg"];
/** The longest a playback URL can be, in characters. */
declare const MAX_PLAYBACK_URL_LENGTH = 2048;
/**
* A short-lived signed URL to play a Recording, two channels (Rep and Prospect). It is a
* credential: shown to the caller, never logged or stored, and it stops working at `expiresAt`.
*/
declare const recordingPlaybackSchema: z65.ZodObject<{
	callId: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
	url: z65.ZodURL;
	expiresAt: z65.ZodISODateTime;
	mediaType: z65.ZodEnum<{
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
	}>;
	channels: z65.ZodLiteral<2>;
	durationSeconds: z65.ZodNumber;
}, z65.core.$strict>;
/** A short-lived signed URL to play a Recording. */
type RecordingPlayback = z65.infer<typeof recordingPlaybackSchema>;
/**
* The body of a request to wrap up a Call: the Deal identifier (the customer's own, as in the
* Playbook) and a note. A field left out is left alone; null clears it. At least one is sent.
*/
declare const wrapUpRequestSchema: z65.ZodObject<{
	dealId: z65.ZodOptional<z65.ZodNullable<z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>>>;
	note: z65.ZodOptional<z65.ZodNullable<z65.ZodPipe<z65.ZodString, z65.ZodString>>>;
}, z65.core.$strict>;
/** The body of a request to wrap up a Call. */
type WrapUpRequest = z65.infer<typeof wrapUpRequestSchema>;
/** The answer to deleting a Recording: the Call, whose Recording and Transcript are now `deleted`. */
declare const deletedRecordingSchema: z65.ZodObject<{
	id: z65.core.$ZodBranded<z65.ZodString, "call", "out">;
	direction: z65.ZodEnum<{
		inbound: "inbound";
		outbound: "outbound";
	}>;
	state: z65.ZodEnum<{
		connecting: "connecting";
		disclosing: "disclosing";
		ended: "ended";
		failed: "failed";
		live: "live";
		missed: "missed";
		ringing: "ringing";
	}>;
	lineId: z65.core.$ZodBranded<z65.ZodString, "line", "out">;
	repMembershipId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "mem", "out">>;
	prospectId: z65.ZodNullable<z65.core.$ZodBranded<z65.ZodString, "prs", "out">>;
	prospectNumber: z65.ZodString;
	disclosure: z65.ZodObject<{
		wordingVersion: z65.ZodNullable<z65.ZodNumber>;
		playedAt: z65.ZodNullable<z65.ZodISODateTime>;
		aiAssisted: z65.ZodBoolean;
	}, z65.core.$strict>;
	createdAt: z65.ZodISODateTime;
	answeredAt: z65.ZodNullable<z65.ZodISODateTime>;
	endedAt: z65.ZodNullable<z65.ZodISODateTime>;
	durationSeconds: z65.ZodNullable<z65.ZodNumber>;
	endedBy: z65.ZodNullable<z65.ZodEnum<{
		prospect: "prospect";
		rep: "rep";
		system: "system";
	}>>;
	failureReason: z65.ZodNullable<z65.ZodEnum<{
		busy: "busy";
		carrier_dropped: "carrier_dropped";
		carrier_rejected: "carrier_rejected";
		disclosure_failed: "disclosure_failed";
		no_answer: "no_answer";
		provider_error: "provider_error";
		rep_unreachable: "rep_unreachable";
		timeout: "timeout";
	}>>;
	dealId: z65.ZodNullable<z65.ZodPipe<z65.ZodPipe<z65.ZodString, z65.ZodTransform<string, string>>, z65.ZodString>>;
	note: z65.ZodNullable<z65.ZodPipe<z65.ZodString, z65.ZodString>>;
	recordingState: z65.ZodEnum<{
		deleted: "deleted";
		none: "none";
		stored: "stored";
		storing: "storing";
	}>;
	transcriptState: z65.ZodEnum<{
		deleted: "deleted";
		pending: "pending";
		ready: "ready";
	}>;
}, z65.core.$strip>;
import { ErrorDefinition as ErrorDefinition_8gwh4515 } from "..";
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
	readonly "call.disclosure_failed": ErrorDefinition_8gwh4515<"call.disclosure_failed">;
	readonly "call.limit_reached": ErrorDefinition_8gwh4515<"call.limit_reached">;
	readonly "call.line_unavailable": ErrorDefinition_8gwh4515<"call.line_unavailable">;
	readonly "call.not_ended": ErrorDefinition_8gwh4515<"call.not_ended">;
	readonly "call.number_invalid": ErrorDefinition_8gwh4515<"call.number_invalid">;
	readonly "line.assignment_invalid": ErrorDefinition_8gwh4515<"line.assignment_invalid">;
	readonly "line.not_found": ErrorDefinition_8gwh4515<"line.not_found">;
	readonly "line.number_unavailable": ErrorDefinition_8gwh4515<"line.number_unavailable">;
	readonly "line.released": ErrorDefinition_8gwh4515<"line.released">;
	readonly "recording.not_found": ErrorDefinition_8gwh4515<"recording.not_found">;
	readonly "recording.not_ready": ErrorDefinition_8gwh4515<"recording.not_ready">;
};
/** A voice error code. */
type VoiceErrorCode = keyof typeof VOICE_ERRORS;
import { z as z66 } from "zod";
/** The longest storage key of a Recording, in characters. */
declare const MAX_RECORDING_KEY_LENGTH = 512;
/** The key of a Recording in the Region's storage: opaque, made of ids, never a number or a name. */
declare const recordingKeySchema: z66.ZodString;
/**
* `voice.call.started` (version 1): a Call began to ring. Ids, the direction and a keyed hash of the
* Prospect's number: no number in clear, no name, no Transcript text.
*/
declare const voiceCallStartedEvent: {
	type: "voice.call.started";
	version: 1;
	schema: z66.ZodObject<{
		id: z66.core.$ZodBranded<z66.ZodString, "evt", "out">;
		occurredAt: z66.ZodISODateTime;
		organizationId: z66.core.$ZodBranded<z66.ZodString, "org", "out">;
		region: z66.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z66.ZodLiteral<"voice.call.started">;
		version: z66.ZodLiteral<1>;
		data: z66.ZodObject<{
			callId: z66.core.$ZodBranded<z66.ZodString, "call", "out">;
			direction: z66.ZodEnum<{
				inbound: "inbound";
				outbound: "outbound";
			}>;
			lineId: z66.core.$ZodBranded<z66.ZodString, "line", "out">;
			repMembershipId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "mem", "out">>;
			prospectId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "prs", "out">>;
			prospectPhoneHash: z66.ZodString;
			startedAt: z66.ZodISODateTime;
		}, z66.core.$strict>;
	}, z66.core.$strip>;
	parse: (input: unknown) => {
		id: string & z66.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z66.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.started";
		version: 1;
		data: {
			callId: string & z66.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z66.$brand<"line">;
			repMembershipId: (string & z66.$brand<"mem">) | null;
			prospectId: (string & z66.$brand<"prs">) | null;
			prospectPhoneHash: string;
			startedAt: string;
		};
	};
	safeParse: (input: unknown) => z66.ZodSafeParseResult<{
		id: string & z66.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z66.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.started";
		version: 1;
		data: {
			callId: string & z66.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z66.$brand<"line">;
			repMembershipId: (string & z66.$brand<"mem">) | null;
			prospectId: (string & z66.$brand<"prs">) | null;
			prospectPhoneHash: string;
			startedAt: string;
		};
	}>;
};
/** How a Call ended, as the event says it. */
declare const VOICE_CALL_OUTCOMES: readonly ["completed", "failed", "missed"];
/** How a Call ended. */
declare const voiceCallOutcomeSchema: z66.ZodEnum<{
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
	schema: z66.ZodObject<{
		id: z66.core.$ZodBranded<z66.ZodString, "evt", "out">;
		occurredAt: z66.ZodISODateTime;
		organizationId: z66.core.$ZodBranded<z66.ZodString, "org", "out">;
		region: z66.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z66.ZodLiteral<"voice.call.ended">;
		version: z66.ZodLiteral<1>;
		data: z66.ZodObject<{
			callId: z66.core.$ZodBranded<z66.ZodString, "call", "out">;
			direction: z66.ZodEnum<{
				inbound: "inbound";
				outbound: "outbound";
			}>;
			lineId: z66.core.$ZodBranded<z66.ZodString, "line", "out">;
			repMembershipId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "mem", "out">>;
			prospectId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "prs", "out">>;
			prospectPhoneHash: z66.ZodString;
			outcome: z66.ZodEnum<{
				completed: "completed";
				failed: "failed";
				missed: "missed";
			}>;
			failureReason: z66.ZodNullable<z66.ZodEnum<{
				busy: "busy";
				carrier_dropped: "carrier_dropped";
				carrier_rejected: "carrier_rejected";
				disclosure_failed: "disclosure_failed";
				no_answer: "no_answer";
				provider_error: "provider_error";
				rep_unreachable: "rep_unreachable";
				timeout: "timeout";
			}>>;
			startedAt: z66.ZodISODateTime;
			answeredAt: z66.ZodNullable<z66.ZodISODateTime>;
			endedAt: z66.ZodISODateTime;
			durationSeconds: z66.ZodNullable<z66.ZodNumber>;
			disclosureWordingVersion: z66.ZodNullable<z66.ZodNumber>;
			recordingKey: z66.ZodNullable<z66.ZodString>;
			dealId: z66.ZodNullable<z66.ZodPipe<z66.ZodPipe<z66.ZodString, z66.ZodTransform<string, string>>, z66.ZodString>>;
		}, z66.core.$strict>;
	}, z66.core.$strip>;
	parse: (input: unknown) => {
		id: string & z66.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z66.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.ended";
		version: 1;
		data: {
			callId: string & z66.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z66.$brand<"line">;
			repMembershipId: (string & z66.$brand<"mem">) | null;
			prospectId: (string & z66.$brand<"prs">) | null;
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
	safeParse: (input: unknown) => z66.ZodSafeParseResult<{
		id: string & z66.$brand<"evt">;
		occurredAt: string;
		organizationId: string & z66.$brand<"org">;
		region: "eu" | "us";
		type: "voice.call.ended";
		version: 1;
		data: {
			callId: string & z66.$brand<"call">;
			direction: "inbound" | "outbound";
			lineId: string & z66.$brand<"line">;
			repMembershipId: (string & z66.$brand<"mem">) | null;
			prospectId: (string & z66.$brand<"prs">) | null;
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
		schema: z66.ZodObject<{
			id: z66.core.$ZodBranded<z66.ZodString, "evt", "out">;
			occurredAt: z66.ZodISODateTime;
			organizationId: z66.core.$ZodBranded<z66.ZodString, "org", "out">;
			region: z66.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z66.ZodLiteral<"voice.call.started">;
			version: z66.ZodLiteral<1>;
			data: z66.ZodObject<{
				callId: z66.core.$ZodBranded<z66.ZodString, "call", "out">;
				direction: z66.ZodEnum<{
					inbound: "inbound";
					outbound: "outbound";
				}>;
				lineId: z66.core.$ZodBranded<z66.ZodString, "line", "out">;
				repMembershipId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "mem", "out">>;
				prospectId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "prs", "out">>;
				prospectPhoneHash: z66.ZodString;
				startedAt: z66.ZodISODateTime;
			}, z66.core.$strict>;
		}, z66.core.$strip>;
		parse: (input: unknown) => {
			id: string & z66.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z66.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.started";
			version: 1;
			data: {
				callId: string & z66.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z66.$brand<"line">;
				repMembershipId: (string & z66.$brand<"mem">) | null;
				prospectId: (string & z66.$brand<"prs">) | null;
				prospectPhoneHash: string;
				startedAt: string;
			};
		};
		safeParse: (input: unknown) => z66.ZodSafeParseResult<{
			id: string & z66.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z66.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.started";
			version: 1;
			data: {
				callId: string & z66.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z66.$brand<"line">;
				repMembershipId: (string & z66.$brand<"mem">) | null;
				prospectId: (string & z66.$brand<"prs">) | null;
				prospectPhoneHash: string;
				startedAt: string;
			};
		}>;
	};
	readonly "voice.call.ended": {
		type: "voice.call.ended";
		version: 1;
		schema: z66.ZodObject<{
			id: z66.core.$ZodBranded<z66.ZodString, "evt", "out">;
			occurredAt: z66.ZodISODateTime;
			organizationId: z66.core.$ZodBranded<z66.ZodString, "org", "out">;
			region: z66.ZodEnum<{
				eu: "eu";
				us: "us";
			}>;
			type: z66.ZodLiteral<"voice.call.ended">;
			version: z66.ZodLiteral<1>;
			data: z66.ZodObject<{
				callId: z66.core.$ZodBranded<z66.ZodString, "call", "out">;
				direction: z66.ZodEnum<{
					inbound: "inbound";
					outbound: "outbound";
				}>;
				lineId: z66.core.$ZodBranded<z66.ZodString, "line", "out">;
				repMembershipId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "mem", "out">>;
				prospectId: z66.ZodNullable<z66.core.$ZodBranded<z66.ZodString, "prs", "out">>;
				prospectPhoneHash: z66.ZodString;
				outcome: z66.ZodEnum<{
					completed: "completed";
					failed: "failed";
					missed: "missed";
				}>;
				failureReason: z66.ZodNullable<z66.ZodEnum<{
					busy: "busy";
					carrier_dropped: "carrier_dropped";
					carrier_rejected: "carrier_rejected";
					disclosure_failed: "disclosure_failed";
					no_answer: "no_answer";
					provider_error: "provider_error";
					rep_unreachable: "rep_unreachable";
					timeout: "timeout";
				}>>;
				startedAt: z66.ZodISODateTime;
				answeredAt: z66.ZodNullable<z66.ZodISODateTime>;
				endedAt: z66.ZodISODateTime;
				durationSeconds: z66.ZodNullable<z66.ZodNumber>;
				disclosureWordingVersion: z66.ZodNullable<z66.ZodNumber>;
				recordingKey: z66.ZodNullable<z66.ZodString>;
				dealId: z66.ZodNullable<z66.ZodPipe<z66.ZodPipe<z66.ZodString, z66.ZodTransform<string, string>>, z66.ZodString>>;
			}, z66.core.$strict>;
		}, z66.core.$strip>;
		parse: (input: unknown) => {
			id: string & z66.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z66.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.ended";
			version: 1;
			data: {
				callId: string & z66.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z66.$brand<"line">;
				repMembershipId: (string & z66.$brand<"mem">) | null;
				prospectId: (string & z66.$brand<"prs">) | null;
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
		safeParse: (input: unknown) => z66.ZodSafeParseResult<{
			id: string & z66.$brand<"evt">;
			occurredAt: string;
			organizationId: string & z66.$brand<"org">;
			region: "eu" | "us";
			type: "voice.call.ended";
			version: 1;
			data: {
				callId: string & z66.$brand<"call">;
				direction: "inbound" | "outbound";
				lineId: string & z66.$brand<"line">;
				repMembershipId: (string & z66.$brand<"mem">) | null;
				prospectId: (string & z66.$brand<"prs">) | null;
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
import { z as z67 } from "zod";
/** The states of a Line: `porting` while a number moves to Closeline, `active` when Calls can use it, `released` once given up. */
declare const LINE_STATES: readonly ["porting", "active", "released"];
/** The state of a Line. */
declare const lineStateSchema: z67.ZodEnum<{
	active: "active";
	porting: "porting";
	released: "released";
}>;
/** The state of a Line. */
type LineState = z67.infer<typeof lineStateSchema>;
/** Who inbound Calls on a Line ring: nobody yet, a Team's Reps, or one Rep. */
declare const lineAssignmentSchema: z67.ZodDiscriminatedUnion<[z67.ZodObject<{
	kind: z67.ZodLiteral<"unassigned">;
}, z67.core.$strict>, z67.ZodObject<{
	kind: z67.ZodLiteral<"team">;
	teamId: z67.core.$ZodBranded<z67.ZodString, "team", "out">;
}, z67.core.$strict>, z67.ZodObject<{
	kind: z67.ZodLiteral<"rep">;
	membershipId: z67.core.$ZodBranded<z67.ZodString, "mem", "out">;
}, z67.core.$strict>], "kind">;
/** Who inbound Calls on a Line ring. */
type LineAssignment = z67.infer<typeof lineAssignmentSchema>;
/** A Line: a phone number the Organization uses to place and receive Calls. */
declare const lineSchema: z67.ZodObject<{
	id: z67.core.$ZodBranded<z67.ZodString, "line", "out">;
	number: z67.ZodString;
	country: z67.ZodString;
	label: z67.ZodNullable<z67.ZodPipe<z67.ZodString, z67.ZodString>>;
	state: z67.ZodEnum<{
		active: "active";
		porting: "porting";
		released: "released";
	}>;
	assignment: z67.ZodDiscriminatedUnion<[z67.ZodObject<{
		kind: z67.ZodLiteral<"unassigned">;
	}, z67.core.$strict>, z67.ZodObject<{
		kind: z67.ZodLiteral<"team">;
		teamId: z67.core.$ZodBranded<z67.ZodString, "team", "out">;
	}, z67.core.$strict>, z67.ZodObject<{
		kind: z67.ZodLiteral<"rep">;
		membershipId: z67.core.$ZodBranded<z67.ZodString, "mem", "out">;
	}, z67.core.$strict>], "kind">;
	createdAt: z67.ZodISODateTime;
	releasedAt: z67.ZodNullable<z67.ZodISODateTime>;
}, z67.core.$strip>;
/** A Line. */
type Line = z67.infer<typeof lineSchema>;
/** The path parameters of a request about one Line. */
declare const lineParamsSchema: z67.ZodObject<{
	lineId: z67.core.$ZodBranded<z67.ZodString, "line", "out">;
}, z67.core.$strict>;
/** The position a Line list resumes from: newest first, by creation time then id. */
declare const lineCursorSchema: z67.ZodObject<{
	createdAt: z67.ZodISODateTime;
	id: z67.core.$ZodBranded<z67.ZodString, "line", "out">;
}, z67.core.$strict>;
/** The query parameters of a request to list Lines, newest first, optionally of one state. */
declare const listLinesQuerySchema: z67.ZodObject<{
	cursor: z67.ZodOptional<z67.ZodString>;
	limit: z67.ZodDefault<z67.ZodPipe<z67.ZodPipe<z67.ZodUnion<readonly [z67.ZodNumber, z67.ZodString]>, z67.ZodTransform<number, string | number>>, z67.ZodNumber>>;
	state: z67.ZodOptional<z67.ZodEnum<{
		active: "active";
		porting: "porting";
		released: "released";
	}>>;
}, z67.core.$strict>;
/** The query parameters of a request to list Lines. */
type ListLinesQuery = z67.infer<typeof listLinesQuerySchema>;
/** One page of Lines. */
declare const linePageSchema: z67.ZodObject<{
	items: z67.ZodArray<z67.ZodObject<{
		id: z67.core.$ZodBranded<z67.ZodString, "line", "out">;
		number: z67.ZodString;
		country: z67.ZodString;
		label: z67.ZodNullable<z67.ZodPipe<z67.ZodString, z67.ZodString>>;
		state: z67.ZodEnum<{
			active: "active";
			porting: "porting";
			released: "released";
		}>;
		assignment: z67.ZodDiscriminatedUnion<[z67.ZodObject<{
			kind: z67.ZodLiteral<"unassigned">;
		}, z67.core.$strict>, z67.ZodObject<{
			kind: z67.ZodLiteral<"team">;
			teamId: z67.core.$ZodBranded<z67.ZodString, "team", "out">;
		}, z67.core.$strict>, z67.ZodObject<{
			kind: z67.ZodLiteral<"rep">;
			membershipId: z67.core.$ZodBranded<z67.ZodString, "mem", "out">;
		}, z67.core.$strict>], "kind">;
		createdAt: z67.ZodISODateTime;
		releasedAt: z67.ZodNullable<z67.ZodISODateTime>;
	}, z67.core.$strip>>;
	nextCursor: z67.ZodNullable<z67.ZodString>;
}, z67.core.$strip>;
/**
* The body of a request to add a Line: buy a new number (optionally with an area code) or port
* one the Organization already owns. The route accepts an `Idempotency-Key` header so a retry buys
* one number.
*/
declare const addLineRequestSchema: z67.ZodDiscriminatedUnion<[z67.ZodObject<{
	method: z67.ZodLiteral<"buy">;
	country: z67.ZodString;
	areaCode: z67.ZodOptional<z67.ZodString>;
	label: z67.ZodOptional<z67.ZodPipe<z67.ZodString, z67.ZodString>>;
}, z67.core.$strict>, z67.ZodObject<{
	method: z67.ZodLiteral<"port">;
	number: z67.ZodPipe<z67.ZodString, z67.ZodString>;
	label: z67.ZodOptional<z67.ZodPipe<z67.ZodString, z67.ZodString>>;
}, z67.core.$strict>], "method">;
/** The body of a request to add a Line. */
type AddLineRequest = z67.infer<typeof addLineRequestSchema>;
/** The body of a request to assign a Line: to a Team, to a Rep, or to nobody. */
declare const assignLineRequestSchema: z67.ZodDiscriminatedUnion<[z67.ZodObject<{
	kind: z67.ZodLiteral<"unassigned">;
}, z67.core.$strict>, z67.ZodObject<{
	kind: z67.ZodLiteral<"team">;
	teamId: z67.core.$ZodBranded<z67.ZodString, "team", "out">;
}, z67.core.$strict>, z67.ZodObject<{
	kind: z67.ZodLiteral<"rep">;
	membershipId: z67.core.$ZodBranded<z67.ZodString, "mem", "out">;
}, z67.core.$strict>], "kind">;
/** The body of a request to assign a Line. */
type AssignLineRequest = z67.infer<typeof assignLineRequestSchema>;
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
import { z as z68 } from "zod";
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
declare const softphoneTokenSchema: z68.ZodObject<{
	token: z68.ZodString;
	identity: z68.core.$ZodBranded<z68.ZodString, "mem", "out">;
	ttlSeconds: z68.ZodNumber;
	expiresAt: z68.ZodISODateTime;
}, z68.core.$strict>;
/** A short-lived Softphone token. */
type SoftphoneToken = z68.infer<typeof softphoneTokenSchema>;
import { z as z69 } from "zod";
/** The directions of a Call. */
declare const VOICE_CALL_DIRECTIONS: readonly ["inbound", "outbound"];
/** The direction of a Call: `outbound` is placed by a Rep to a Prospect, `inbound` rings on a Line. */
declare const voiceCallDirectionSchema: z69.ZodEnum<{
	inbound: "inbound";
	outbound: "outbound";
}>;
/** The direction of a Call. */
type VoiceCallDirection = z69.infer<typeof voiceCallDirectionSchema>;
/**
* The states of a Call. It moves `ringing`, `connecting`, `disclosing`, `live`, `ended`, or ends
* `failed` or `missed`. `live` is reached only after the Disclosure has played: a Call in `live` or
* `ended` always carries the time and wording version of its Disclosure.
*/
declare const VOICE_CALL_STATES: readonly ["ringing", "connecting", "disclosing", "live", "ended", "failed", "missed"];
/** The state of a Call. */
declare const voiceCallStateSchema: z69.ZodEnum<{
	connecting: "connecting";
	disclosing: "disclosing";
	ended: "ended";
	failed: "failed";
	live: "live";
	missed: "missed";
	ringing: "ringing";
}>;
/** The state of a Call. */
type VoiceCallState = z69.infer<typeof voiceCallStateSchema>;
/** The states a Call can no longer leave. */
declare const VOICE_CALL_FINAL_STATES: readonly ["ended", "failed", "missed"];
/** Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text. */
declare const VOICE_CALL_FAILURE_REASONS: readonly ["disclosure_failed", "carrier_dropped", "carrier_rejected", "busy", "no_answer", "rep_unreachable", "provider_error", "timeout"];
/** Why a Call ended in `failed`. */
declare const voiceCallFailureReasonSchema: z69.ZodEnum<{
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
type VoiceCallFailureReason = z69.infer<typeof voiceCallFailureReasonSchema>;
/** Who ended a Call that ended: the Rep, the Prospect, or the system (a time limit). */
declare const VOICE_CALL_ENDED_BY: readonly ["rep", "prospect", "system"];
/** Who ended a Call. */
declare const voiceCallEndedBySchema: z69.ZodEnum<{
	prospect: "prospect";
	rep: "rep";
	system: "system";
}>;
/** The state of a Call's Recording. `none` until the Disclosure has played; `storing` while it is copied to the Region's storage; `stored` once playable; `deleted` after an Admin deleted it. */
declare const VOICE_RECORDING_STATES: readonly ["none", "storing", "stored", "deleted"];
/** The state of a Call's Recording. */
declare const voiceRecordingStateSchema: z69.ZodEnum<{
	deleted: "deleted";
	none: "none";
	stored: "stored";
	storing: "storing";
}>;
/** The state of a Call's Recording. */
type VoiceRecordingState = z69.infer<typeof voiceRecordingStateSchema>;
/** The state of a Call's Transcript: `pending` until it is made, `ready` once readable, `deleted` after the Recording and Transcript were deleted. */
declare const VOICE_TRANSCRIPT_STATES: readonly ["pending", "ready", "deleted"];
/** The state of a Call's Transcript. */
declare const voiceTranscriptStateSchema: z69.ZodEnum<{
	deleted: "deleted";
	pending: "pending";
	ready: "ready";
}>;
/** The state of a Call's Transcript. */
type VoiceTranscriptState = z69.infer<typeof voiceTranscriptStateSchema>;
/** The most characters of a wrap-up note. */
declare const MAX_WRAP_UP_NOTE_LENGTH = 2e3;
/** A wrap-up note: bounded text with no control character; untrusted text for display. */
declare const wrapUpNoteSchema: z69.ZodPipe<z69.ZodString, z69.ZodString>;
/** The longest label of a Line. */
declare const MAX_LINE_LABEL_LENGTH = 100;
/** A label an Admin gives a Line: bounded text with no control character. */
declare const lineLabelSchema: z69.ZodPipe<z69.ZodString, z69.ZodString>;
/** A two-letter ISO 3166-1 country code in upper case, such as `US` or `IE`. */
declare const countryCodeSchema: z69.ZodString;
/**
* A keyed SHA-256 of a Prospect's E.164 number, as lower-case hex (64 characters). The key is the
* Organization's, so a number cannot be recovered by hashing a list of guesses. Events carry this
* and never the number.
*/
declare const phoneHashSchema: z69.ZodString;
/** This library's package name, so a consumer can report which shared libraries it resolved. */
declare const PACKAGE = "tula-closeline-contract";
export { ABANDON_MAX_AGE_HOURS, ACCEPTED_DOCUMENT_EXTENSIONS, ACCEPTED_DOCUMENT_MEDIA_TYPES, ACCEPTED_RECORDING_EXTENSIONS, ACCEPTED_TRANSCRIPT_EXTENSIONS, AGENT_ADMIN_ROLES, AGENT_ALL_ROLES, AGENT_CALLING_WINDOW, AGENT_CALL_OUTCOMES, AGENT_ERRORS, AGENT_EVENTS, AGENT_LANGUAGES, AGENT_READ_ROLES, AGENT_ROUTES, AGENT_TOOLS, AGENT_VOICE_STYLES, ALL_PLAYBOOK_ERRORS, ALL_PLAYBOOK_ROUTES, ALWAYS_HELD_REASONS, APPROVAL_MODES, AUTH_ERRORS, AUTH_OPTIONS_PATH, AUTH_OPTIONS_ROUTE, AcceptedCallExtension, AcceptedDocumentExtension, AddLineRequest, AddSuppressionRequest, AddTeamMemberRequest, AgentErrorCode, AgentEventType, AgentRoute, AgentRouteName, AgentSettings, AgentToolName, AgentTurn, AgentVoiceStyle, AllPlaybookRouteName, AllowedOrigin, ApprovalPolicy, ApprovalQueueItem, ApprovalRule, ApproveDraftRequest, AssignLineRequest, AuthErrorCode, AuthOptionsResponse, AuthProviders, AuthRoute, Availability, BOOKING_ADMIN_ROLES, BOOKING_ALL_ROLES, BOOKING_CANCELLED_BY, BOOKING_ERRORS, BOOKING_EVENTS, BOOKING_MODES, BOOKING_ORIGINS, BOOKING_ROUTES, BOOKING_STATES, BOOKING_TYPE_STATES, BULK_ASSIGN_SYNC_LIMIT, BookRequest, Booking, BookingErrorCode, BookingEventType, BookingId, BookingMode, BookingOrigin, BookingRoute, BookingRouteName, BookingState, BookingType, BookingTypeId, BookingTypeState, BrowserSessionTokens, BulkAssignProspectsRequest, BulkAssignProspectsResponse, CALENDAR_CONNECTION_STATES, CALENDAR_PROVIDERS, CALL_CHANNELS, CALL_DELETED_MESSAGE, CALL_FAILURE_FIXES, CALL_FAILURE_REASONS, CALL_KINDS, CALL_MEDIA_TYPES, CALL_REP_CHANGED_MESSAGE, CALL_STATES, CALL_TRANSCRIBED_MESSAGE, CALL_UPLOADED_MESSAGE, CHAT_ALL_ROLES, CHAT_ERRORS, CHAT_ROUTES, CHAT_STATES, COMPANY_SIZE_BANDS, CONSENT_ADMIN_ROLES, CONSENT_ALL_ROLES, CONSENT_CHANNELS, CONSENT_ERRORS, CONSENT_EVENTS, CONSENT_FORM_STATES, CONSENT_GRANT_SOURCES, CONSENT_RECORDABLE_SOURCES, CONSENT_REQUIRED_CHANNELS, CONSENT_REVOKE_TRIGGERS, CONSENT_ROUTES, CONSENT_STATES, CONSENT_WITHDRAWAL_SOURCES, CONTACT_ALLOW_BASES, CONTACT_DENIAL_CODES, CONTACT_PURPOSES, CONVERSATION_CONTROLLERS, CONVERSATION_STATES, COPILOT_CARD_KINDS, COPILOT_COMPOSED_KINDS, COPILOT_ERRORS, COPILOT_EVENTS, COPILOT_OBJECTION_TYPES, COPILOT_QUIET_REASONS, COPILOT_RATINGS, COPILOT_ROUTES, COPILOT_STREAM_EVENTS, COPILOT_STREAM_STATES, COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS, CORE_ERRORS, CREATE_DEMO_REQUEST_ERROR_CODES, CREATE_INVITATION_ERROR_CODES, CSV_FAILURES, CURRENT_RIGHTS_WORDING_VERSION, CalendarConnection, CalendarConnectionState, CalendarProvider, Call, CallCursor, CallDeletedPayload, CallDisclosure, CallFailureFix, CallFailureReason, CallId, CallKind, CallMediaType, CallParams, CallRepChangedPayload, CallState, CallTranscribedPayload, CallUploadedPayload, CellResult, ChangeMemberRoleRequest, Chat, ChatErrorCode, ChatId, ChatMessage, ChatRoute, ChatRouteName, CheckCallFileResult, CheckDealImportHeaderResult, CheckDealImportHeaderTextResult, CheckDealImportRowResult, CheckUploadFileResult, Classification, CommonErrorCode, CompanySizeBand, CompleteCalendarConnectionRequest, ConfirmRightsRequest, ConsentChannel, ConsentErrorCode, ConsentEvent, ConsentEventId, ConsentEventType, ConsentForm, ConsentFormId, ConsentFormState, ConsentGrantSource, ConsentRoute, ConsentRouteAccess, ConsentRouteName, ConsentSource, ConsentState, ConsentWithdrawalSource, ConsentWording, ConsentWordingId, ContactCheckId, ContactCheckLogEntry, ContactCheckRequest, ContactCheckResult, ContactDenialCode, ContactPurpose, ContactWarning, Conversation, ConversationController, ConversationId, ConversationState, CopilotCard, CopilotCardId, CopilotCardKind, CopilotDocumentSource, CopilotErrorCode, CopilotEventType, CopilotEvidence, CopilotMomentRef, CopilotObjectionType, CopilotQuote, CopilotRating, CopilotRoute, CopilotRouteName, CopilotSettings, CopilotStreamEventName, CopilotStreamMessage, CoreErrorCode, CreateBookingTypeRequest, CreateConsentFormRequest, CreateConsentWordingRequest, CreateDemoRequestRequest, CreateDemoRequestResponse, CreateInvitationRequest, CreateProspectCompanyRequest, CreateProspectRequest, CreateQualificationQuestionRequest, CreateRoutingRuleRequest, CreateTeamRequest, CsvFailure, CsvOptions, CsvResult, DAILY_LIMIT_DETAILS_SCHEMA, DEAL_CLOSED_AT_MAX_YEAR, DEAL_CLOSED_AT_MIN_YEAR, DEAL_IMPORT_FAILURE_REASONS, DEAL_IMPORT_FILE_FIELD, DEAL_IMPORT_HEADER_PREFIX_CHARS, DEAL_IMPORT_HEADER_PROBLEMS, DEAL_IMPORT_OPTIONAL_COLUMN, DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_ROW_REASONS, DEAL_IMPORT_ROW_RESULTS, DEAL_IMPORT_STATES, DEAL_IMPORT_UPLOADED_MESSAGE, DEAL_OUTCOME_CHANGED_MESSAGE, DECISION_KINDS, DEFAULT_AGENT_CALL_SECONDS, DEFAULT_COPILOT_MIN_DEALS, DEFAULT_COPILOT_MIN_MOMENTS, DEFAULT_MAX_CALLS, DEFAULT_MAX_DEALS, DEFAULT_MAX_DOCUMENTS, DEFAULT_MAX_DOCUMENT_BYTES_TOTAL, DEFAULT_MAX_RECORDING_BYTES_TOTAL, DEFAULT_PAGE_SIZE, DEFAULT_SEARCH_LIMIT, DELIVERY_FAILURE_REASONS, DOCUMENT_DELETED_MESSAGE, DOCUMENT_FAILURE_REASONS, DOCUMENT_RETENTION_DAYS, DOCUMENT_STATES, DOCUMENT_UPLOADED_MESSAGE, DRAFT_AUTHORS, DRAFT_HOLD_REASONS, DRAFT_SOURCE_KINDS, DRAFT_STATUSES, Deal, DealCursor, DealId, DealImport, DealImportCursor, DealImportFailureReason, DealImportHeaderProblem, DealImportId, DealImportParams, DealImportRow, DealImportRowCursor, DealImportRowReason, DealImportRowResult, DealImportState, DealImportUploadedPayload, DealOutcomeChangedPayload, DealParams, DealRecordId, Decision, DecisionId, DecisionKind, DemoRequestId, DocumentDeletedPayload, DocumentFailureReason, DocumentFileName, DocumentId, DocumentMatch, DocumentMediaType, DocumentParams, DocumentSearchEvidence, DocumentState, DocumentUploadedPayload, Draft, DraftAuthor, DraftHoldReason, DraftId, DraftReason, DraftRelease, DraftSourceKind, DraftStatus, DuplicateIdentityDetails, ERRORS, EVIDENCE_CSV_COLUMNS, Email, EraseProspectResponse, ErrorBody, ErrorDefinition, ErrorInput, EventId, EventType, EvidenceEvent, FIELD_HISTORY_STATES, FIXED_SOURCE_KINDS, FieldHistoryCursor, FieldHistoryEntry, FieldValue, FirstCsvRecordResult, GOOGLE_ERROR_PARAM, GOOGLE_ERROR_PATH, GOOGLE_ROUTES, GOOGLE_SIGN_UP_ATTEMPT_PARAM, GOOGLE_SIGN_UP_PATH, GoogleCompleteRequest, GoogleCompleteResponse, GoogleIntent, GoogleStartRequest, GoogleStartResponse, HANDOFF_CHANNELS, HANDOFF_REASONS, HANDOFF_RESULTS, HANDOFF_STATES, Handoff, HandoffContext, HandoffId, HoldFacts, HostedConsentFormView, HostedConsentReceipt, HostedConsentSubmission, IDEMPOTENCY_KEY_HEADER, INBOX_ADMIN_ROLES, INBOX_ALL_ROLES, INBOX_CHANNELS, INBOX_ERRORS, INBOX_EVENTS, INBOX_REVIEW_ROLES, INBOX_ROUTES, INCOMPLETE_UPLOAD_PARTS_TTL_HOURS, INQUIRY_ADMIN_ROLES, INQUIRY_ALL_ROLES, INQUIRY_CALLBACK_STATES, INQUIRY_ERRORS, INQUIRY_EVENTS, INQUIRY_MANAGER_ROLES, INQUIRY_ROUTES, INQUIRY_SKIP_REASONS, INQUIRY_SOURCES, INTERNAL_CALL_ERRORS, INVITABLE_ROLES, INVITATION_STATES, Id, IdempotencyKey, InboxChannel, InboxErrorCode, InboxEventType, InboxRoute, InboxRouteName, IngestMessageRequest, Inquiry, InquiryCallback, InquiryCallbackState, InquiryEmbed, InquiryErrorCode, InquiryEventType, InquiryId, InquiryRoute, InquiryRouteName, InquirySkipReason, InquirySource, InternalAbandonOrganizationParams, InternalAbandonOrganizationRequest, InternalAbandonOrganizationResponse, InternalAcceptInvitationRequest, InternalAcceptInvitationResponse, InternalCallName, InternalCreateOrganizationRequest, InternalCreateOrganizationResponse, InternalMembershipRequest, InternalMembershipResponse, InternalRemoveOrganizationDocumentsParams, InternalRemoveOrganizationDocumentsRequest, InternalRemoveOrganizationDocumentsResponse, InternalUpdateMemberProfileParams, InternalUpdateMemberProfileRequest, InternalUpdateMemberProfileResponse, InvitableRole, Invitation, InvitationId, InvitationParams, InvitationState, LINE_STATES, LIST_MEMBERS_MIN_ROLE, LIST_TEAM_MEMBERS_ERROR_CODES, LIST_TEAM_MEMBERS_MIN_ROLE, Line, LineAssignment, LineId, LineState, ListBookingsQuery, ListCallsQuery, ListCallsResponse, ListConsentEventsQuery, ListContactChecksQuery, ListConversationsQuery, ListCopilotCardsQuery, ListDealImportRowsQuery, ListDealImportRowsResponse, ListDealImportsQuery, ListDealImportsResponse, ListDealsQuery, ListDealsResponse, ListDocumentsQuery, ListDocumentsResponse, ListFieldHistoryQuery, ListFieldHistoryResponse, ListInquiriesQuery, ListInvitationsQuery, ListInvitationsResponse, ListLinesQuery, ListMembersQuery, ListMembersResponse, ListProspectCompaniesQuery, ListProspectCompaniesResponse, ListProspectDuplicatesQuery, ListProspectDuplicatesResponse, ListProspectImportRowsQuery, ListProspectImportRowsResponse, ListProspectImportsQuery, ListProspectImportsResponse, ListProspectsQuery, ListProspectsResponse, ListSlotsQuery, ListSuppressionEntriesQuery, ListTeamMembersQuery, ListTeamMembersResponse, ListTeamsQuery, ListTeamsResponse, ListVoiceCallsQuery, LookupDealRequest, MARKETING_ERRORS, MARKETING_ROUTES, MAX_AGENT_CALL_COST_USD_CENTS, MAX_AGENT_CALL_SECONDS, MAX_AGENT_CONCURRENCY, MAX_AGENT_GREETING_LENGTH, MAX_ALLOWED_ORIGINS, MAX_ANSWER_LENGTH, MAX_AUTHORIZATION_URL_LENGTH, MAX_AWAY_DAYS, MAX_BOOKING_BUFFER_MINUTES, MAX_BOOKING_LENGTH_MINUTES, MAX_BOOKING_NAME_LENGTH, MAX_BOOKING_NOTICE_MINUTES, MAX_BULK_ASSIGN_PROSPECTS, MAX_CALLBACK_ATTEMPTS, MAX_CALL_DURATION_SECONDS, MAX_CALL_SPEAKERS, MAX_CONDITION_VALUES, MAX_CONSENT_FORM_NAME_LENGTH, MAX_CONSENT_WORDING_LENGTH, MAX_COPILOT_CARDS_PER_CALL, MAX_COPILOT_CARD_TEXT_LENGTH, MAX_COPILOT_CITED_MOMENTS, MAX_COPILOT_MIN_EVIDENCE, MAX_COPILOT_QUOTE_LENGTH, MAX_COPILOT_STREAM_ID_LENGTH, MAX_CURSOR_LENGTH, MAX_DAILY_BOOKING_CAP, MAX_DEAL_ID_BYTES, MAX_DEAL_ID_LENGTH, MAX_DEAL_IMPORT_BYTES, MAX_DEAL_IMPORT_CELL_LENGTH, MAX_DEAL_IMPORT_HEADER_LENGTH, MAX_DEAL_IMPORT_ROWS, MAX_DEAL_NAME_BYTES, MAX_DEAL_NAME_LENGTH, MAX_DECISION_NOTE_LENGTH, MAX_DELETION_SEQ, MAX_DEMO_REQUEST_FIELD_LENGTH, MAX_DEMO_REQUEST_MESSAGE_LENGTH, MAX_DOCUMENT_BYTES, MAX_DOCUMENT_FILE_NAME_BYTES, MAX_DOCUMENT_FILE_NAME_LENGTH, MAX_DOCUMENT_PAGES, MAX_DRAFT_SOURCES, MAX_ELIGIBLE_REPS, MAX_EMAIL_LENGTH, MAX_EVIDENCE_REF_LENGTH, MAX_EXCEPT_LABELS, MAX_FIELD_HISTORY_ENTRIES, MAX_HANDOFF_CONTEXT_TURNS, MAX_HONEYPOT_LENGTH, MAX_INQUIRY_MESSAGE_LENGTH, MAX_LINE_LABEL_LENGTH, MAX_MERGED_PROSPECTS, MAX_MESSAGE_BODY_LENGTH, MAX_MOMENT_SNIPPET_CHARACTERS, MAX_NAME_LENGTH, MAX_PAGE_SIZE, MAX_PERSON_NAME_LENGTH, MAX_PLAYBACK_URL_LENGTH, MAX_PROSPECT_COMPANY_NAME_LENGTH, MAX_PROSPECT_FIELD_VALUE_LENGTH, MAX_PROSPECT_IMPORT_BYTES, MAX_PROSPECT_IMPORT_ROWS, MAX_PROSPECT_JOB_TITLE_LENGTH, MAX_PROSPECT_NAME_PART_LENGTH, MAX_PROSPECT_NOTES_LENGTH, MAX_PROSPECT_SEARCH_LENGTH, MAX_PROSPECT_TAGS, MAX_PROSPECT_TAG_LENGTH, MAX_PUBLIC_BOOKING_FIELD_LENGTH, MAX_QUALIFICATION_QUESTIONS, MAX_QUALIFICATION_SUMMARY_LENGTH, MAX_QUESTION_CHOICES, MAX_QUESTION_PROMPT_LENGTH, MAX_QUESTION_SUGGESTIONS, MAX_QUEUED_DEAL_IMPORTS, MAX_RECORDING_BYTES, MAX_RECORDING_KEY_LENGTH, MAX_RECORDING_SECONDS, MAX_REGION_LENGTH, MAX_REP_FIELD_LENGTH, MAX_REP_FOLLOWING_CHARACTERS, MAX_REP_FOLLOWING_TURNS, MAX_RETURN_TO_LENGTH, MAX_RIGHTS_HEADING_LENGTH, MAX_RIGHTS_PARAGRAPHS, MAX_RIGHTS_TEXT_LENGTH, MAX_RIGHTS_WORDING_VERSION, MAX_ROUTING_RULES, MAX_SEARCH_CANDIDATES, MAX_SEARCH_LIMIT, MAX_SEARCH_TEXT_CHARACTERS, MAX_SEARCH_TURNS, MAX_SEQ, MAX_SKIP_CONDITIONS, MAX_SLOT_RANGE_DAYS, MAX_SOFTPHONE_TOKEN_LENGTH, MAX_SOFTPHONE_TOKEN_TTL_SECONDS, MAX_SOURCE_PASSAGE_LENGTH, MAX_SOURCE_REF_LENGTH, MAX_SOURCE_URL_LENGTH, MAX_SPEAKER_EXCERPT_LENGTH, MAX_SPEAKER_LABEL_BYTES, MAX_SPEAKER_LABEL_LENGTH, MAX_STRATEGY_LENGTH, MAX_SUPPRESSION_IMPORT_BYTES, MAX_SUPPRESSION_IMPORT_ROWS, MAX_SUPPRESSION_NOTE_LENGTH, MAX_TRANSCRIPT_BYTES, MAX_TRANSCRIPT_TURN_LENGTH, MAX_TURN_SOURCES, MAX_TURN_TEXT_LENGTH, MAX_UTF8_BYTES_PER_CODE_POINT, MAX_WINDOWS_PER_DAY, MAX_WRAP_UP_NOTE_LENGTH, MEDIA_TYPE_BY_CALL_EXTENSION, MEDIA_TYPE_BY_EXTENSION, MESSAGE_AUTHOR_KINDS, MESSAGE_DIRECTIONS, MESSAGE_FAILURE_REASONS, MIN_COPILOT_MIN_EVIDENCE, MIN_QUESTION_CHOICES, MIN_SOFTPHONE_TOKEN_TTL_SECONDS, MarkCopilotCardRequest, MarketingErrorCode, MarketingRoute, MarketingRouteName, Member, MemberParams, MembershipId, MergeProspectsRequest, Message, MessageAuthorKind, MessageDirection, MessageFailureReason, MessageId, MomentMatch, OIDC_COOKIE_BASE_NAME, OIDC_COOKIE_SECURE_PREFIX, ONE_ADDRESS_MESSAGE, ORGANIZATION_STATUSES, OUTCOMES, OneClickUnsubscribeRequest, Organization, OrganizationId, OrganizationStatus, Outcome, PACKAGE, PAUSE_SEQUENCE_LABELS, PLAYBOOK_ERRORS, PLAYBOOK_READ_ROLES, PLAYBOOK_ROUTES, PLAYBOOK_WRITE_ROLES, PROSPECT_ADMIN_ROLES, PROSPECT_ALL_ROLES, PROSPECT_COMPANY_FIELD_NAMES, PROSPECT_ERRORS, PROSPECT_EVENTS, PROSPECT_FIELD_NAMES, PROSPECT_IDENTITY_KINDS, PROSPECT_IMPORT_COLUMNS, PROSPECT_IMPORT_FAILURE_REASONS, PROSPECT_IMPORT_FILE_FIELD, PROSPECT_IMPORT_INVALID_REASONS, PROSPECT_IMPORT_REJECT_REASONS, PROSPECT_IMPORT_REPORT_COLUMNS, PROSPECT_IMPORT_ROW_RESULTS, PROSPECT_IMPORT_SKIP_REASONS, PROSPECT_IMPORT_STATES, PROSPECT_MERGE_STATES, PROSPECT_MERGE_UNDO_DAYS, PROSPECT_ROUTES, PROSPECT_STATUSES, Page, PageQuery, ParseRepFieldResult, ParsedDealImportRow, PlaceCallRequest, PlacedCall, PlaybookDocument, PlaybookErrorCode, PlaybookRoute, PlaybookRouteName, Prospect, ProspectCompany, ProspectCompanyCursor, ProspectCompanyFieldName, ProspectCompanyFieldParams, ProspectCompanyId, ProspectCompanyParams, ProspectConsent, ProspectCursor, ProspectDuplicate, ProspectDuplicateCursor, ProspectErrorCode, ProspectEventType, ProspectFieldName, ProspectFieldParams, ProspectId, ProspectIdentityKind, ProspectImport, ProspectImportCursor, ProspectImportFailureReason, ProspectImportId, ProspectImportInvalidDetails, ProspectImportParams, ProspectImportRow, ProspectImportRowCursor, ProspectImportRowReason, ProspectImportRowResult, ProspectImportState, ProspectMerge, ProspectMergeId, ProspectMergeParams, ProspectNotFoundDetails, ProspectParams, ProspectRoute, ProspectRouteName, ProspectStatus, PublicBookRequest, PublicBookingConfirmation, PublicBookingType, PublicChatConsentReceipt, PublicChatConsentRequest, PublicChatMessage, PublicChatReply, PublicInquiryFormView, PublicInquiryReceipt, PublicInquiryRequest, PublicSlot, QUALIFICATION_QUESTION_KINDS, Qualification, QualificationAnswer, QualificationQuestion, QualificationQuestionId, QualificationQuestionKind, QualificationValue, RECORDING_MEDIA_TYPES, REGIONS, REPLY_LABELS, RIGHTS_WORDINGS, ROLES, ROUTING_CANDIDATE_REASONS, ROUTING_ROLES, ROUTING_SKIP_REASONS, RecordConsentRequest, RecordDeliveryFailureRequest, RecordWithdrawalRequest, RecordedConsent, RecordingPlayback, Region, RemoveSuppressionRequest, RenameOrganizationRequest, RenameTeamRequest, RepChoice, ReplyLabel, RequestId, RescheduleBookingRequest, RetryAfterDetails, RightsConfirmation, RightsRequiredDetails, RightsStatus, RightsWording, Role, RouteRequest, RoutingAttributes, RoutingConditions, RoutingDecisionId, RoutingResult, RoutingRule, RoutingRuleId, RoutingSkipReason, RoutingTarget, SALES_HISTORY_ERRORS, SALES_HISTORY_READ_ROLES, SALES_HISTORY_ROUTES, SEARCH_ROUTES, SIGNUP_ERRORS, SKIP_OPERATORS, STOP_SENDING_LABELS, SUPPRESSION_ADDRESS_KINDS, SUPPRESSION_IMPORT_COLUMNS, SUPPRESSION_IMPORT_FAILURE_REASONS, SUPPRESSION_IMPORT_FILE_FIELD, SUPPRESSION_IMPORT_ROW_RESULTS, SUPPRESSION_IMPORT_STATES, SUPPRESSION_REASONS, SUPPRESSION_REMOVABLE_REASONS, SalesHistoryErrorCode, SalesHistoryRoute, SalesHistoryRouteName, SearchDocumentsRequest, SearchDocumentsResponse, SearchEvidence, SearchMomentsRequest, SearchMomentsResponse, SearchRouteName, SearchTurn, SetAgentSettingsRequest, SetCallRepRequest, SetCopilotSettingsRequest, SetDealOutcomeRequest, SetInquiryEmbedRequest, SetProspectOwnerRequest, SignupErrorCode, SkipCondition, Slot, SoftphoneToken, Source, SourceKind, SourcePassage, SpeakerExcerpt, StartCalendarConnectionRequest, StartCalendarConnectionResponse, SuggestedQualificationQuestion, SuppressionAddressKind, SuppressionEntry, SuppressionEntryId, SuppressionImport, SuppressionImportId, SuppressionImportRow, SuppressionReason, Team, TeamId, TeamMember, TeamMemberParams, TeamParams, TestRoutingRequest, TranscriptPage, TranscriptTurn, TrySession, TrySessionId, UPLOAD_CONTENT_TYPE, UPLOAD_FILE_FIELD, UnsubscribePreview, UnsubscribeReceipt, UpdateConsentWordingRequest, UpdateProspectCompanyRequest, UpdateProspectRequest, UpdateQualificationQuestionRequest, UploadCallFields, UploadDocumentFile, UserId, VOICE_ADMIN_ROLES, VOICE_ALL_ROLES, VOICE_CALL_DIRECTIONS, VOICE_CALL_ENDED_BY, VOICE_CALL_FAILURE_REASONS, VOICE_CALL_FINAL_STATES, VOICE_CALL_OUTCOMES, VOICE_CALL_STATES, VOICE_ERRORS, VOICE_EVENTS, VOICE_RECORDING_STATES, VOICE_ROUTES, VOICE_TRANSCRIPT_STATES, VoiceCall, VoiceCallDirection, VoiceCallFailureReason, VoiceCallState, VoiceErrorCode, VoiceEventType, VoiceRecordingState, VoiceRoute, VoiceRouteName, VoiceTranscriptState, WEEKDAYS, Weekday, WithdrawConsentRequest, WorkingWindow, WrapUpRequest, addLineRequestSchema, addSuppressionRequestSchema, addTeamMemberRequestSchema, addressFieldsShape, agentCallOutcomeSchema, agentCallParamsSchema, agentLanguageSchema, agentSettingsSchema, agentToolNameSchema, agentTurnPageSchema, agentTurnRoleSchema, agentTurnSchema, agentVoiceStyleSchema, allowedOriginSchema, answerHandoffRequestSchema, approvalPoliciesSchema, approvalPolicySchema, approvalQueueCursorSchema, approvalQueueItemSchema, approvalQueuePageSchema, approvalRuleSchema, approveDraftRequestSchema, assignLineRequestSchema, attemptIdSchema, authOptionsResponseSchema, authProvidersSchema, authorizationUrlSchema, availabilitySchema, bookHeadersSchema, bookRequestSchema, bookingCancelledBySchema, bookingCancelledEvent, bookingCreatedEvent, bookingCursorSchema, bookingIdSchema, bookingLinkTokenSchema, bookingModeSchema, bookingNameSchema, bookingOriginSchema, bookingPageSchema, bookingParamsSchema, bookingRescheduledEvent, bookingSchema, bookingStateSchema, bookingTypeCursorSchema, bookingTypeIdSchema, bookingTypeParamsSchema, bookingTypeSchema, bookingTypeStateSchema, boundedTextSchema, browserSessionTokensSchema, bulkAssignProspectsRequestSchema, bulkAssignProspectsResponseSchema, calendarConnectionSchema, calendarConnectionStateSchema, calendarDateSchema, calendarProviderSchema, callChannelSchema, callCursorSchema, callDeletedPayloadSchema, callDisclosureSchema, callFailureReasonSchema, callIdSchema, callKindSchema, callListItemSchema, callMediaTypeSchema, callParamsSchema, callRepChangedPayloadSchema, callReuploadRequeues, callSchema, callStateSchema, callTranscribedPayloadSchema, callUploadedPayloadSchema, changeMemberRoleRequestSchema, channelConsentSchema, channelParamsSchema, chatIdSchema, chatMessagePageSchema, chatMessageSchema, chatPageSchema, chatParamsSchema, chatSchema, chatSessionTokenSchema, chatStateSchema, chatTextSchema, checkCallFile, checkDealImportHeader, checkDealImportHeaderText, checkDealImportRow, checkUploadFile, classificationSchema, companySizeBandSchema, completeCalendarConnectionRequestSchema, confidenceSchema, confirmRightsRequestSchema, consentChannelSchema, consentEventIdSchema, consentEventPageSchema, consentEventSchema, consentFormIdSchema, consentFormPageSchema, consentFormParamsSchema, consentFormSchema, consentFormStateSchema, consentGrantSourceSchema, consentGrantedEvent, consentProspectParamsSchema, consentRevokeTriggerSchema, consentSourceSchema, consentStateSchema, consentTokenParamsSchema, consentTokenSchema, consentWithdrawalSourceSchema, consentWithdrawnEvent, consentWordingIdSchema, consentWordingPageSchema, consentWordingParamsSchema, consentWordingSchema, consentWordingTextSchema, contactCheckIdSchema, contactCheckLogEntrySchema, contactCheckLogPageSchema, contactCheckRequestSchema, contactCheckResultSchema, contactDenialCodeSchema, contactPurposeSchema, contactWarningSchema, conversationActionRequestSchema, conversationControllerSchema, conversationCursorSchema, conversationHandedBackEvent, conversationIdSchema, conversationMessageParamsSchema, conversationPageSchema, conversationParamsSchema, conversationSchema, conversationStateSchema, conversationTakenOverEvent, copilotCallParamsSchema, copilotCardCursorSchema, copilotCardDataSchema, copilotCardIdSchema, copilotCardKindSchema, copilotCardPageSchema, copilotCardParamsSchema, copilotCardSchema, copilotCardTextSchema, copilotDocumentSourceSchema, copilotEvidenceSchema, copilotMomentKey, copilotMomentRefSchema, copilotObjectionTypeSchema, copilotQuietReasonSchema, copilotQuoteSchema, copilotQuoteTextSchema, copilotRatingSchema, copilotSettingsSchema, copilotStatusDataSchema, copilotStreamHeadersSchema, copilotStreamIdSchema, copilotStreamMessageSchema, copilotStreamStateSchema, copilotTextSchema, copilotTranscriptUnavailableDataSchema, copilotTurnDataSchema, correctClassificationRequestSchema, countryCodeSchema, createBookingTypeRequestSchema, createConsentFormRequestSchema, createConsentWordingRequestSchema, createDemoRequestRequestSchema, createDemoRequestResponseSchema, createInvitationRequestSchema, createProspectCompanyRequestSchema, createProspectRequestSchema, createQualificationQuestionRequestSchema, createRoutingRuleRequestSchema, createTeamRequestSchema, dealAmountSchema, dealCurrencySchema, dealCursorSchema, dealIdSchema, dealImportCursorSchema, dealImportFailureReasonSchema, dealImportIdSchema, dealImportParamsSchema, dealImportRowCursorSchema, dealImportRowReasonSchema, dealImportRowResultSchema, dealImportRowSchema, dealImportSchema, dealImportStateSchema, dealImportUploadedPayloadSchema, dealNameSchema, dealOutcomeChangedPayloadSchema, dealParamsSchema, dealRecordIdSchema, dealSchema, decisionCursorSchema, decisionIdSchema, decisionKindSchema, decisionNoteSchema, decisionPageSchema, decisionSchema, decodeCursor, defineErrors, defineEvent, deletedRecordingSchema, demoRequestIdSchema, demoRequestMessageSchema, demoRequestSourcePageSchema, documentDeletedPayloadSchema, documentExtension, documentFailureReasonSchema, documentFileNameSchema, documentIdSchema, documentMatchSchema, documentMediaTypeSchema, documentParamsSchema, documentQueryText, documentSchema, documentSearchEvidenceSchema, documentSizeCheckSchema, documentStateSchema, documentTypeCheckSchema, documentUploadedPayloadSchema, draftAuthorSchema, draftCheckSchema, draftHoldReasonSchema, draftIdSchema, draftParamsSchema, draftReasonSchema, draftReleaseSchema, draftSchema, draftSourceKindSchema, draftSourcesSchema, draftStatusSchema, duplicateIdentityDetailsSchema, e164PhoneSchema, emailSchema, encodeCursor, eraseProspectResponseSchema, errorBodySchema, errorCodeSchema, eventEnvelopeSchema, eventIdSchema, eventTypeSchema, evidenceEventSchema, evidencePageSchema, evidenceRefSchema, excerptText, fieldHistoryCursorSchema, fieldHistoryEntrySchema, fieldHistoryStateSchema, fieldValueSchema, firstCsvRecord, foldAscii, formatCopilotStreamFrame, formatId, getTranscriptQuerySchema, googleCompleteRequestSchema, googleCompleteResponseSchema, googleErrorQuerySchema, googleIntentSchema, googleSignUpQuerySchema, googleStartRequestSchema, googleStartResponseSchema, handoffChannelSchema, handoffContextSchema, handoffIdSchema, handoffPageSchema, handoffParamsSchema, handoffReasonSchema, handoffResultSchema, handoffSchema, handoffStateSchema, hasControlCharacter, hasExactlyOneAddress, hasStrippableCharacter, holdReasonFor, hostedConsentFormViewSchema, hostedConsentReceiptSchema, hostedConsentSubmissionSchema, idSchema, idempotencyKeySchema, inboxChannelSchema, inboxKeyedHeadersSchema, ingestMessageRequestSchema, ingestMessageResultSchema, inquiryCallbackSchema, inquiryCallbackStateSchema, inquiryConsentSchema, inquiryCursorSchema, inquiryEmbedSchema, inquiryIdSchema, inquiryKeySchema, inquiryKeyedHeadersSchema, inquiryMessageSchema, inquiryPageSchema, inquiryParamsSchema, inquirySchema, inquirySkipReasonSchema, inquirySourceSchema, internalAbandonOrganizationParamsSchema, internalAbandonOrganizationRequestSchema, internalAbandonOrganizationResponseSchema, internalAcceptInvitationRequestSchema, internalAcceptInvitationResponseSchema, internalCreateOrganizationRequestSchema, internalCreateOrganizationResponseSchema, internalMembershipRequestSchema, internalMembershipResponseSchema, internalRemoveOrganizationDocumentsParamsSchema, internalRemoveOrganizationDocumentsRequestSchema, internalRemoveOrganizationDocumentsResponseSchema, internalUpdateMemberProfileParamsSchema, internalUpdateMemberProfileRequestSchema, internalUpdateMemberProfileResponseSchema, invitableRoleSchema, invitationIdSchema, invitationParamsSchema, invitationSchema, invitationStateSchema, invitationTokenSchema, isBlankCsvRecord, isComposedKind, isWellFormedText, joinUrlSchema, lineAssignmentSchema, lineCursorSchema, lineIdSchema, lineLabelSchema, linePageSchema, lineParamsSchema, lineSchema, lineStateSchema, listAgentTurnsQuerySchema, listApprovalQueueQuerySchema, listBookingTypesQuerySchema, listBookingsQuerySchema, listCallsQuerySchema, listCallsResponseSchema, listChatMessagesQuerySchema, listChatsQuerySchema, listConsentEventsQuerySchema, listConsentFormsQuerySchema, listConsentWordingsQuerySchema, listContactChecksQuerySchema, listConversationsQuerySchema, listCopilotCardsQuerySchema, listDealImportRowsQuerySchema, listDealImportRowsResponseSchema, listDealImportsQuerySchema, listDealImportsResponseSchema, listDealsQuerySchema, listDealsResponseSchema, listDecisionsQuerySchema, listDocumentsQuerySchema, listDocumentsResponseSchema, listEvidenceQuerySchema, listFieldHistoryQuerySchema, listFieldHistoryResponseSchema, listHandoffsQuerySchema, listInquiriesQuerySchema, listInvitationsQuerySchema, listInvitationsResponseSchema, listLinesQuerySchema, listMembersQuerySchema, listMembersResponseSchema, listMessagesQuerySchema, listProspectCompaniesQuerySchema, listProspectCompaniesResponseSchema, listProspectDuplicatesQuerySchema, listProspectDuplicatesResponseSchema, listProspectImportRowsQuerySchema, listProspectImportRowsResponseSchema, listProspectImportsQuerySchema, listProspectImportsResponseSchema, listProspectsQuerySchema, listProspectsResponseSchema, listQualificationQuestionsQuerySchema, listRoutingRulesQuerySchema, listSlotsQuerySchema, listSuppressionEntriesQuerySchema, listSuppressionImportRowsQuerySchema, listSuppressionImportsQuerySchema, listTeamMembersQuerySchema, listTeamMembersResponseSchema, listTeamsQuerySchema, listTeamsResponseSchema, listVoiceCallsQuerySchema, lookupDealRequestSchema, lookupSuppressionRequestSchema, markCopilotCardRequestSchema, maskedAddressSchema, memberParamsSchema, memberSchema, membershipIdSchema, mergeProspectsRequestSchema, messageApprovedEvent, messageAuthorKindSchema, messageBodySchema, messageCursorSchema, messageDirectionSchema, messageFailedEvent, messageFailureReasonSchema, messageIdSchema, messagePageSchema, messageSchema, messageSentEvent, momentMatchSchema, momentQueryText, momentSnippet, momentSnippetSchema, normaliseDealId, normaliseFileName, normaliseMediaType, normaliseSpeakerLabel, oneClickUnsubscribeRequestSchema, organizationIdSchema, organizationNameSchema, organizationSchema, organizationStatusSchema, outcomeSchema, pageQuerySchema, pageSchema, parseAmountCell, parseClosedAtCell, parseCsv, parseCurrencyCell, parseOutcomeCell, parseRepField, personNameSchema, phoneHashSchema, placeCallHeadersSchema, placeCallRequestSchema, placedCallSchema, prospectCompanyCursorSchema, prospectCompanyDomainSchema, prospectCompanyFieldNameSchema, prospectCompanyFieldParamsSchema, prospectCompanyIdSchema, prospectCompanyNameSchema, prospectCompanyParamsSchema, prospectCompanySchema, prospectConsentSchema, prospectCreatedEvent, prospectCursorSchema, prospectDuplicateCursorSchema, prospectDuplicateSchema, prospectErasedEvent, prospectFieldNameSchema, prospectFieldParamsSchema, prospectIdSchema, prospectIdentityKindSchema, prospectImportCursorSchema, prospectImportFailureReasonSchema, prospectImportIdSchema, prospectImportInvalidDetailsSchema, prospectImportParamsSchema, prospectImportRowCursorSchema, prospectImportRowReasonSchema, prospectImportRowResultSchema, prospectImportRowSchema, prospectImportSchema, prospectImportStateSchema, prospectJobTitleSchema, prospectMergeIdSchema, prospectMergeParamsSchema, prospectMergeSchema, prospectMergeUndoneEvent, prospectMergedEvent, prospectNamePartSchema, prospectNotFoundDetailsSchema, prospectNotesSchema, prospectParamsSchema, prospectSchema, prospectSearchSchema, prospectStatusSchema, prospectTagsSchema, prospectUpdatedEvent, providerMessageIdSchema, publicBookRequestSchema, publicBookingConfirmationSchema, publicBookingParamsSchema, publicBookingTypeSchema, publicChatConsentReceiptSchema, publicChatConsentRequestSchema, publicChatHandoffReplySchema, publicChatHandoffRequestSchema, publicChatHeadersSchema, publicChatKeyParamsSchema, publicChatMessagePageSchema, publicChatMessageReplySchema, publicChatMessageSchema, publicChatOriginHeadersSchema, publicChatReplySchema, publicChatSessionParamsSchema, publicInquiryFormViewSchema, publicInquiryHeadersSchema, publicInquiryParamsSchema, publicInquiryReceiptSchema, publicInquiryRequestSchema, publicListChatMessagesQuerySchema, publicListSlotsQuerySchema, publicOriginHeadersSchema, publicSendChatMessageRequestSchema, publicSlotPageSchema, publicSlotSchema, publicStartChatRequestSchema, publicStartChatResponseSchema, qualificationAnswerSchema, qualificationQuestionIdSchema, qualificationQuestionKindSchema, qualificationQuestionPageSchema, qualificationQuestionParamsSchema, qualificationQuestionSchema, qualificationSchema, qualificationValueSchema, questionPromptSchema, questionSuggestionsSchema, rawLinkedinUrlSchema, rawPhoneSchema, recordConsentRequestSchema, recordDeliveryFailureRequestSchema, recordWithdrawalRequestSchema, recordedConsentSchema, recordedSuppressionSchema, recordingKeySchema, recordingPlaybackSchema, regionSchema, rejectDraftRequestSchema, removeSuppressionRequestSchema, renameOrganizationRequestSchema, renameTeamRequestSchema, reorderQualificationQuestionsRequestSchema, reorderRoutingRulesRequestSchema, repChangeAllowed, repChoiceSchema, repChoiceSuits, replyClassifiedEvent, replyLabelSchema, replyRequestSchema, requestIdSchema, rescheduleBookingRequestSchema, retryAfterDetailsSchema, returnToSchema, rightsConfirmationSchema, rightsRequiredDetailsSchema, rightsStatusSchema, rightsWordingFor, rightsWordingSchema, rightsWordingVersionSchema, roleAtLeast, roleSchema, routeRequestSchema, routingAttributesSchema, routingCandidateReasonSchema, routingConditionsSchema, routingDecisionIdSchema, routingResultSchema, routingRuleIdSchema, routingRuleParamsSchema, routingRuleSchema, routingSkipReasonSchema, routingTargetSchema, searchDocumentsRequestSchema, searchDocumentsResponseSchema, searchEvidenceSchema, searchMomentsRequestSchema, searchMomentsResponseSchema, searchTurnSchema, sendTryMessageRequestSchema, setAgentSettingsRequestSchema, setApprovalPolicyRequestSchema, setCallRepRequestSchema, setCopilotSettingsRequestSchema, setDealOutcomeRequestSchema, setInquiryEmbedRequestSchema, setProspectOwnerRequestSchema, skipConditionSchema, skipOperatorSchema, slotPageSchema, slotSchema, softphoneTokenSchema, sourceKindSchema, sourcePassageSchema, sourceRefSchema, sourceSchema, sourceUrlSchema, speakerExcerpt, speakerExcerptSchema, speakerLabelSchema, startCalendarConnectionRequestSchema, startCalendarConnectionResponseSchema, startTrySessionRequestSchema, storedNameSchema, suggestedQualificationQuestionSchema, suppressionAddedEvent, suppressionAddressKindSchema, suppressionEntryIdSchema, suppressionEntryPageSchema, suppressionEntryParamsSchema, suppressionEntrySchema, suppressionImportIdSchema, suppressionImportPageSchema, suppressionImportParamsSchema, suppressionImportRowPageSchema, suppressionImportRowSchema, suppressionImportSchema, suppressionImportStateSchema, suppressionListStateSchema, suppressionReasonSchema, suppressionRemovedEvent, teamIdSchema, teamMemberParamsSchema, teamMemberSchema, teamNameSchema, teamParamsSchema, teamSchema, testRoutingRequestSchema, timeOfDaySchema, timeZoneSchema, timestampSchema, toReplyLabel, transcriptCursorSchema, transcriptPageSchema, transcriptSpeakerSchema, transcriptTurnSchema, tryReplySchema, trySessionIdSchema, trySessionParamsSchema, trySessionSchema, unsubscribePreviewSchema, unsubscribeReceiptSchema, updateBookingTypeRequestSchema, updateConsentWordingRequestSchema, updateProspectCompanyRequestSchema, updateProspectRequestSchema, updateQualificationQuestionRequestSchema, updateRoutingRuleRequestSchema, uploadCallFieldsSchema, uploadCallFileSchema, uploadDocumentFileSchema, userIdSchema, voiceAgentCallEndedEvent, voiceCallCursorSchema, voiceCallDirectionSchema, voiceCallEndedBySchema, voiceCallEndedEvent, voiceCallFailureReasonSchema, voiceCallOutcomeSchema, voiceCallPageSchema, voiceCallParamsSchema, voiceCallSchema, voiceCallStartedEvent, voiceCallStateSchema, voiceConsentRevokedEvent, voiceCopilotCardRatedEvent, voiceCopilotCardShownEvent, voiceHandoffCompletedEvent, voiceInquiryReceivedEvent, voiceRecordingStateSchema, voiceTranscriptStateSchema, weekdaySchema, withdrawConsentRequestSchema, workingDaySchema, workingWindowSchema, wrapUpNoteSchema, wrapUpRequestSchema };
