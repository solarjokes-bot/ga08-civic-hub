# Amazon Connect setup runbook

Status: **not started — planned for Phase 4.**

This will be the step-by-step runbook for provisioning the Amazon
Connect instance, Lex V2 bot, contact flows, queues, and web voice/chat
integration described in the project spec. Amazon Connect instance
creation and contact-flow authoring largely require console/CLI steps
that aren't fully expressible as Amplify Gen 2 IaC, so this file will
carry the manual runbook while `amplify/functions/lex-fulfillment/` and
the exported flow/bot JSON in `docs/connect-flows/` carry the
version-controlled parts.

## What will live here (Phase 4)

1. Connect instance creation (identity management, telephony options,
   data storage) — console/CLI steps, screenshots or exact CLI commands.
2. Enabling Chat and Web/WebRTC voice on the instance.
3. Hours of operation, queues (**General Help**, **Veterans**,
   **Housing**), and a routing profile.
4. Lex V2 bot creation and association with the instance.
5. Contact flow: greet → invoke Lex bot → bot/Bedrock answer → "talk to
   a person" → route to queue.
6. How the frontend obtains a short-lived participant token to start a
   chat/voice contact (no long-lived credentials in the browser — see
   `docs/architecture.md` security notes).
7. Cost note and a low-cost/dev-tier path (this step requires your
   explicit go-ahead before anything is provisioned, per project ground
   rules — a claimed phone number and an always-on Connect instance both
   carry real monthly cost).

Until Phase 4, `/help` in the app shows a "coming soon" placeholder
rather than a non-functional widget.
