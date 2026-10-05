import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { guidedTriage } from "../functions/guided-triage/resource";
import { connectContact } from "../functions/connect-contact/resource";
import { confirmAccount } from "../functions/confirm-account/resource";

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
 * (An earlier plan added Legislator/Bill/Initiative for a representative
 * section; that was dropped — the site carries no elected-official content.)
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
  /**
   * Top-level named enum, referenced with a.ref() below.
   *
   * It must NOT be declared inline on `Resource.category`: an inline
   * a.enum() generates a GraphQL enum named <Model><Field> — i.e.
   * "ResourceCategory" — which collides with the ResourceCategory model
   * ("There can be only one type named ResourceCategory" at schema
   * validation). Hoisting it under a distinct name keeps both the model
   * name and real enum validation.
   */
  CategoryKey: a.enum(CATEGORY_VALUES),

  Resource: a
    .model({
      slug: a.string().required(),
      name: a.string().required(),
      /** One-sentence, plain-language ("what is this?"). 6th–8th grade. */
      summary: a.string().required(),
      /** Fuller description: who runs it, what you get, how it works. */
      description: a.string().required(),
      category: a.ref("CategoryKey"),
      level: a.enum(["STATE", "FEDERAL", "LOCAL"]),
      agency: a.string().required(),
      eligibilitySummary: a.string().required(),
      /** Controlled vocab — see src/data/eligibilityTags.ts. */
      eligibilityTags: a.string().required().array(),
      /**
       * County names this resource serves. The sentinel "STATEWIDE" means
       * every Georgia county (so it matches any Georgia county filter). Local
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

      /*
       * Deeper program knowledge, surfaced to the chat/voice guide so it
       * can answer "how do I apply" / "what do I bring" / "what does it
       * cost" rather than only linking out. Optional by design: an empty
       * field makes the guide say "ask the agency", which is correct,
       * whereas a guessed one would be repeated as fact.
       */
      howToApply: a.string().array(),
      documentsNeeded: a.string().array(),
      costNote: a.string(),
      /** Array of { question, answer } — see ProgramQuestion in src/lib/resourceTypes.ts. */
      commonQuestions: a.json(),
    })
    .identifier(["slug"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.group("admin"),
    ]),

  ResourceCategory: a
    .model({
      /**
       * One of CATEGORY_VALUES. Typed as a required string, NOT a.enum():
       * Amplify enum fields can't be `.required()`, and an identifier must
       * reference a required or DB-generated field — `.identifier(["key"])`
       * on an enum fails at CDK synth with InvalidSchemaError. The allowed
       * values are enforced by src/lib/categories.ts (the taxonomy's source
       * of truth) and by the seed script that writes these rows.
       */
      key: a.string().required(),
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
      // "read" already covers get/list/search/listen/sync — naming both
      // "read" and "list" is rejected as an InvalidDirectiveError.
      allow.group("admin").to(["read", "delete"]),
    ]),

  /**
   * A service an account holder saved to come back to.
   *
   * Owner-scoped: `allow.owner()` means a row is readable and writable
   * ONLY by the Cognito identity that created it. There is no public and
   * no admin read — a saved list is nobody else's business, including
   * ours.
   *
   * Deliberately thin. It stores a catalog slug, not a copy of the
   * resource, so a saved item always reflects the currently verified
   * details rather than a stale snapshot. Nothing here identifies the
   * person: accounts carry a username and no email (see
   * amplify/auth/resource.ts).
   */
  SavedService: a
    .model({
      /** Slug of a row in the Resource catalog. */
      resourceSlug: a.string().required(),
      /** Optional private note, e.g. "called them, waiting to hear back". */
      note: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

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

  /**
   * Confirms a newly created username account (see
   * amplify/functions/confirm-account/). Public API key, because it runs
   * immediately after sign-up before any session exists. The handler
   * refuses any identifier outside the synthetic `.invalid` domain, so it
   * cannot be pointed at a staff account.
   */
  confirmAccount: a
    .mutation()
    .arguments({ identifier: a.string().required() })
    .returns(a.json())
    .handler(a.handler.function(confirmAccount))
    .authorization((allow) => [allow.publicApiKey()]),

  /**
   * Live support hand-off (Phase 4). Starts an Amazon Connect CHAT or
   * WebRTC VOICE contact server-side and returns only the short-lived
   * tokens the browser needs — no AWS credentials ever reach the client.
   * Anonymous (public API key). Handler: amplify/functions/connect-contact/.
   * Returns { ok: false, reason: "not_configured" } until the Connect
   * instance env vars are set (see docs/connect-setup.md); the UI
   * degrades gracefully.
   */
  startSupportContact: a
    .mutation()
    .arguments({
      channel: a.string().required(), // "CHAT" | "VOICE"
      displayName: a.string(),
      topic: a.string(),
    })
    .returns(a.json())
    .handler(a.handler.function(connectContact))
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
