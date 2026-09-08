import { defineFunction } from "@aws-amplify/backend";

/**
 * Bedrock-powered guided-triage function (Phase 3).
 * Verified against https://docs.amplify.aws/react/build-a-backend/data/custom-business-logic/
 * and https://docs.amplify.aws/react/build-a-backend/functions/set-up-function/
 * on 2026-09-06 (@aws-amplify/backend ~1.24).
 *
 * Exposed as the `guidedTriage` custom query in amplify/data/resource.ts
 * (public API-key auth — the flow is anonymous). IAM for Bedrock and the
 * Resource table is attached in amplify/backend.ts.
 *
 * // LIVE SETUP:
 *  - Set the BEDROCK_MODEL_ID secret/var to a model your account has been
 *    granted in the target region (see the handler for the current
 *    default and how to confirm it).
 *  - The frontend calls this only when a backend is deployed; in
 *    offline/demo mode it runs src/lib/guidedTriage/localEngine.ts
 *    instead, so nothing here needs to run for the wizard to work.
 */
export const guidedTriage = defineFunction({
  name: "guided-triage",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    // Bedrock model id (Bedrock Runtime / Converse API). Override per
    // environment. See handler.ts DEFAULT_MODEL_ID for notes.
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID ?? "",
    // Optional: a Bedrock Knowledge Base id to retrieve from instead of
    // the in-Lambda lexical scorer. Empty = use the lexical fallback.
    KNOWLEDGE_BASE_ID: process.env.KNOWLEDGE_BASE_ID ?? "",
  },
});
