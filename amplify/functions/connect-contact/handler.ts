import {
  ConnectClient,
  StartChatContactCommand,
  StartWebRTCContactCommand,
} from "@aws-sdk/client-connect";
import type { Schema } from "../../data/resource";

/**
 * Starts an Amazon Connect contact for an anonymous visitor.
 *
 * Returns a discriminated result the frontend can act on:
 *  - { ok: true, channel: "CHAT",  chat:  {...tokens} }
 *  - { ok: true, channel: "VOICE", voice: {...ConnectionData} }
 *  - { ok: false, reason: "not_configured" | "start_failed" }
 *
 * No PII is required or stored. `displayName` defaults to a generic
 * label; `topic` (optional) is passed through as a contact attribute so
 * the flow can route (e.g. to the Veterans or Housing queue).
 */

const REGION = process.env.AWS_REGION ?? "us-east-1";
const INSTANCE_ID = process.env.CONNECT_INSTANCE_ID || "";
const CHAT_FLOW_ID = process.env.CONNECT_CHAT_CONTACT_FLOW_ID || "";
const VOICE_FLOW_ID = process.env.CONNECT_VOICE_CONTACT_FLOW_ID || "";

const connect = new ConnectClient({ region: REGION });

/**
 * The shape returned to the browser. Kept as a plain object literal (no
 * explicit annotation on the handler) so it satisfies the `a.json()`
 * return type; the frontend re-declares/casts it in
 * src/lib/connect/startContact.ts.
 */
export const handler: Schema["startSupportContact"]["functionHandler"] = async (
  event,
) => {
  const channel = event.arguments.channel === "VOICE" ? "VOICE" : "CHAT";
  const displayName = sanitizeName(event.arguments.displayName);
  const topic = sanitizeTopic(event.arguments.topic);
  const attributes: Record<string, string> = {
    source: "ga08-civic-resource-hub",
    ...(topic ? { topic } : {}),
  };

  if (!INSTANCE_ID || (channel === "CHAT" ? !CHAT_FLOW_ID : !VOICE_FLOW_ID)) {
    // // LIVE SETUP: set CONNECT_INSTANCE_ID + the flow id(s) — see
    // docs/connect-setup.md. Not an error: the UI expects this shape.
    return { ok: false, reason: "not_configured" };
  }

  try {
    if (channel === "CHAT") {
      const res = await connect.send(
        new StartChatContactCommand({
          InstanceId: INSTANCE_ID,
          ContactFlowId: CHAT_FLOW_ID,
          ParticipantDetails: { DisplayName: displayName },
          Attributes: attributes,
          SupportedMessagingContentTypes: [
            "text/plain",
            "text/markdown",
          ],
        }),
      );
      return {
        ok: true,
        channel: "CHAT",
        chat: {
          contactId: res.ContactId,
          participantId: res.ParticipantId,
          participantToken: res.ParticipantToken,
          // The browser passes these to amazon-connect-chatjs
          // ChatSession.create({ chatDetails, type: "CUSTOMER", options: { region } }).
          region: REGION,
        },
      };
    }

    // VOICE — Amazon Connect in-app/web calling. The ConnectionData is
    // the Amazon Chime SDK meeting + attendee the browser joins with.
    const res = await connect.send(
      new StartWebRTCContactCommand({
        InstanceId: INSTANCE_ID,
        ContactFlowId: VOICE_FLOW_ID,
        ParticipantDetails: { DisplayName: displayName },
        Attributes: attributes,
        // Audio-only: omitting AllowedCapabilities means neither side is
        // granted video or screen-share (the SDK's capability enum only
        // has "SEND"; "not present" == disabled).
      }),
    );
    return {
      ok: true,
      channel: "VOICE",
      voice: {
        contactId: res.ContactId,
        participantId: res.ParticipantId,
        participantToken: res.ParticipantToken,
        connectionData: res.ConnectionData,
        region: REGION,
      },
    };
  } catch (err) {
    console.error(`[connect-contact] Start${channel}Contact failed:`, err);
    return { ok: false, reason: "start_failed" };
  }
};

function sanitizeName(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim().slice(0, 60) : "";
  return s || "Georgia Hub visitor";
}

function sanitizeTopic(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const s = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
  return s || undefined;
}
