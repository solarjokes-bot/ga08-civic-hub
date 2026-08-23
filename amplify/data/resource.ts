import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Amplify Data (AppSync + DynamoDB) — Gen 2, code-first schema.
 * Targeted against @aws-amplify/backend ~1.13 (2026-08) — re-check
 * https://docs.amplify.aws/react/build-a-backend/data/ if the API has moved.
 *
 * PHASE 1 SCOPE ONLY. This file intentionally holds a single smoke-test
 * model so we can prove the Vite app <-> Amplify Data <-> DynamoDB path
 * end to end before committing to the full catalog schema.
 *
 * The full schema — Resource, ResourceCategory, GuidedSession, Legislator,
 * Bill, Initiative, as specified in docs/architecture.md — lands in Phase 2
 * (resource directory) and Phase 5 (representative section), each as its
 * own reviewable change. Public reads will use `allow.publicApiKey()`;
 * writes will be restricted to `allow.group('admin')`. GuidedSession will
 * allow anonymous *create* only (no read/update/delete from the client) so
 * triage logging can never be used to look up another visitor's session.
 */
const schema = a.schema({
  SiteStatus: a
    .model({
      key: a.string().required(), // e.g. "build-info"
      message: a.string().required(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.group("admin"),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // Public, unauthenticated citizens read via the API key. Admin
    // writes go through the Cognito `admin` group (see amplify/auth).
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
