import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { guidedTriage } from "../functions/guided-triage/resource";

/**
 * Amplify Data (AppSync + DynamoDB) — Gen 2, code-first schema.
 * Targeted against @aws-amplify/backend ~1.24 (2026-09) — re-check
 * https://docs.amplify.aws/react/build-a-backend/data/ if the API has moved.
 *
 * PHASE 2 SCOPE: the resource directory.
 *  - Resource          — the civic/government resource catalog.
 *  - ResourceCategory   — taxonomy metadata (icon + plain-language label).
 *  - GuidedSession      — anonymous triage log; model defined here so the
 *                         Phase 3 wizard can write to it without a schema
 *                         change. Create-only from the public client — a
 *                         visitor can log a session but can never read,
 *                         list, or update one (so it can't be used to look
 *                         up another visitor's answers).
 *
 * Legislator, Bill, and Initiative land in Phase 5 (representative section),
 * each as its own reviewable change — see docs/architecture.md.
 *
 * AUTH MODEL (see amplify/auth/resource.ts):
 *  - Public, unauthenticated citizens READ the catalog via the API key.
 *  - The only signed-in role is the `admin` Cognito group, which manages
 *    catalog content and reviews GuidedSession analytics.
 */

/** Mirrors src/lib/resourceTypes.ts CATEGORY_VALUES — keep the two in sync. */
const CATEGORY_VALUES = [
  "HEALTH",
  "HOUSING",
  "FOOD_ASSISTANCE",
  "VETERANS",
  "EMPLOYMENT",
  "EDUCATION",
  "DISABILITY",
  "SENIORS",
  "LEGAL",
  "UTILITIES",
  "DISASTER",
  "SMALL_BUSINESS",
  "AGRICULTURE",
  "TRANSPORTATION",
  "TAXES",
  "VOTING",
  "CHILD_FAMILY",
  "MENTAL_HEALTH",
  "OTHER",
] as const;

const schema = a.schema({
  Resource: a
    .model({
      slug: a.string().required(),
      name: a.string().required(),
      /** One-sentence, plain-language ("what is this?"). 6th–8th grade. */
      summary: a.string().required(),
      /** Fuller description: who runs it, what you get, how it works. */
      description: a.string().required(),
      category: a.enum(CATEGORY_VALUES),
      level: a.enum(["STATE", "FEDERAL", "LOCAL"]),
      agency: a.string().required(),
      eligibilitySummary: a.string().required(),
      /** Controlled vocab — see src/data/eligibilityTags.ts. */
      eligibilityTags: a.string().required().array(),
      /**
       * County names this resource serves. The sentinel "STATEWIDE" means
       * every Georgia county (so it matches any GA-08 county filter). Local
       * resources list specific county names.
       */
      counties: a.string().required().array(),
      /** Delivery channels: PHONE | ONLINE | IN_PERSON | MAIL. */
      channels: a.string().required().array(),
      phone: a.string(),
      url: a.string().required(),
      applicationUrl: a.string(),
      /** BCP-47-ish language codes the service is offered in, e.g. "en", "es". */
      languages: a.string().required().array(),
      /** ISO-8601 date the listing's details were last checked. */
      lastVerified: a.date().required(),
      /** Free-text terms for search + (Phase 3) RAG retrieval. */
      keywords: a.string().required().array(),
    })
    .identifier(["slug"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.group("admin"),
    ]),

  ResourceCategory: a
    .model({
      key: a.enum(CATEGORY_VALUES),
      /** Plain-language label shown to citizens, e.g. "Food help". */
      label: a.string().required(),
      description: a.string().required(),
      /** Decorative emoji/icon token — always paired with the text label. */
      icon: a.string(),
      /** Show on the home page's quick-pick tiles. */
      featuredOnHome: a.boolean().default(false),
    })
    .identifier(["key"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.group("admin"),
    ]),

  GuidedSession: a
    .model({
      /** Client-generated random id (no PII, not tied to any account). */
      sessionId: a.string().required(),
      /**
       * PII-free structured summary of the triage run (derived signals,
       * matched categories, recommended slugs) — NOT the raw free text a
       * visitor typed, which could contain personal details.
       */
      answers: a.json(),
      recommendedResourceSlugs: a.string().array(),
      /** Whether the visitor then asked for a human (chat/voice handoff). */
      escalatedToHuman: a.boolean().default(false),
    })
    .authorization((allow) => [
      // Anonymous visitors may LOG a session but never read one back.
      allow.publicApiKey().to(["create"]),
      allow.group("admin").to(["read", "list", "delete"]),
    ]),

  /**
   * AI Guided Help triage step (Phase 3). Anonymous — the flow collects
   * no account and no PII. Takes the answers gathered so far as JSON and
   * returns the next step (a question, a grounded shortlist, or a crisis
   * hand-off). Handler: amplify/functions/guided-triage/. In offline/demo
   * mode the frontend runs the deterministic engine instead and never
   * calls this.
   */
  guidedTriage: a
    .query()
    .arguments({ answers: a.json() })
    .returns(a.json())
    .handler(a.handler.function(guidedTriage))
    .authorization((allow) => [allow.publicApiKey()]),
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
