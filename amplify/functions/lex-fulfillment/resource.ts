import { defineFunction } from "@aws-amplify/backend";

/**
 * lex-fulfillment (Phase 4).
 *
 * Amazon Lex V2 fulfillment code hook for the chat/voice bot. Maps each
 * intent to catalog categories, retrieves matching resources, and asks
 * Bedrock for a short grounded answer — the same honesty rules and
 * retrieval as the /guide wizard. The fallback intent handles anything
 * open-ended.
 *
 * Lex invokes this Lambda directly (not through AppSync), so it is
 * registered in amplify/backend.ts and granted a resource-based policy
 * allowing `lexv2.amazonaws.com` to invoke it. It is NOT a data
 * resolver and has no custom query/mutation.
 *
 * // LIVE SETUP: associate this function as the fulfillment hook on the
 * bot's intents when you import docs/connect-flows/lex-bot.json — see
 * docs/connect-setup.md.
 */
export const lexFulfillment = defineFunction({
  name: "lex-fulfillment",
  entry: "./handler.ts",
  // Not a data resolver (Lex invokes it directly), but it reads the Resource
  // table, so keep it in the data stack too — that keeps every data
  // dependency inside one stack instead of crossing nested-stack boundaries.
  resourceGroupName: "data",
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID ?? "",
    // RESOURCE_TABLE_NAME is injected by amplify/backend.ts.
  },
});
