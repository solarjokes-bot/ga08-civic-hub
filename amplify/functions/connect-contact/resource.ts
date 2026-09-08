import { defineFunction } from "@aws-amplify/backend";

/**
 * connect-contact (Phase 4).
 *
 * Server-side broker that starts an Amazon Connect CHAT or WebRTC VOICE
 * contact on behalf of an anonymous website visitor and hands back only
 * the short-lived tokens the browser needs. The browser never holds AWS
 * credentials — it calls the `startSupportContact` custom mutation
 * (public API key), this function calls the Connect API with its own
 * least-privilege role (see amplify/backend.ts).
 *
 * Verified 2026-09-08 against:
 *  - Amazon Connect API: StartChatContact, StartWebRTCContact
 *  - Amplify Gen 2 custom mutation function handlers
 *
 * // LIVE SETUP: these env vars come from the Connect instance you
 * provision per docs/connect-setup.md. Until they're set, the function
 * returns { ok: false, reason: "not_configured" } and the UI shows a
 * graceful "not available yet" state instead of a broken widget.
 */
export const connectContact = defineFunction({
  name: "connect-contact",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    CONNECT_INSTANCE_ID: process.env.CONNECT_INSTANCE_ID ?? "",
    // Flow that greets, runs the Lex bot, and offers a human hand-off.
    CONNECT_CHAT_CONTACT_FLOW_ID: process.env.CONNECT_CHAT_CONTACT_FLOW_ID ?? "",
    CONNECT_VOICE_CONTACT_FLOW_ID:
      process.env.CONNECT_VOICE_CONTACT_FLOW_ID ?? "",
  },
});
