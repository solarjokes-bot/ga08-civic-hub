import type { Schema } from "../../../amplify/data/resource";
import { isBackendLive } from "@/lib/amplify";

/**
 * Calls the `startSupportContact` backend mutation to begin an Amazon
 * Connect chat or voice contact. The browser never touches AWS
 * credentials — it gets back only short-lived participant tokens.
 */

export interface ChatStartData {
  contactId: string;
  participantId: string;
  participantToken: string;
  region: string;
}

export interface VoiceStartData {
  contactId: string;
  participantId: string;
  participantToken: string;
  region: string;
  /** Amazon Chime SDK Meeting + Attendee to join with. */
  connectionData: {
    Meeting: unknown;
    Attendee: unknown;
  };
}

export type StartContactFailure = {
  ok: false;
  reason: "not_configured" | "start_failed" | "offline";
};
export type StartChatResult =
  | { ok: true; channel: "CHAT"; chat: ChatStartData }
  | StartContactFailure;
export type StartVoiceResult =
  | { ok: true; channel: "VOICE"; voice: VoiceStartData }
  | StartContactFailure;
export type StartContactResult = StartChatResult | StartVoiceResult;

export function startSupportContact(
  channel: "CHAT",
  opts?: { displayName?: string; topic?: string },
): Promise<StartChatResult>;
export function startSupportContact(
  channel: "VOICE",
  opts?: { displayName?: string; topic?: string },
): Promise<StartVoiceResult>;
export async function startSupportContact(
  channel: "CHAT" | "VOICE",
  opts: { displayName?: string; topic?: string } = {},
): Promise<StartContactResult> {
  if (!isBackendLive()) {
    // No deployed backend -> no Connect instance to talk to.
    return { ok: false, reason: "offline" };
  }
  try {
    const { generateClient } = await import("aws-amplify/data");
    const client = generateClient<Schema>();
    const res = await client.mutations.startSupportContact(
      { channel, displayName: opts.displayName, topic: opts.topic },
      { authMode: "apiKey" },
    );
    if (res.errors?.length) {
      console.warn("[connect] startSupportContact errors:", res.errors);
      return { ok: false, reason: "start_failed" };
    }
    const parsed =
      typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    if (parsed && typeof parsed === "object") {
      return parsed as StartContactResult;
    }
    return { ok: false, reason: "start_failed" };
  } catch (err) {
    console.warn("[connect] startSupportContact failed:", err);
    return { ok: false, reason: "start_failed" };
  }
}
