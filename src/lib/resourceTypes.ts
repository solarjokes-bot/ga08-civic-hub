// Relative (not "@/") import: this module and its dependency chain
// (categories.ts) are also imported by amplify/seed/seed.ts, which
// doesn't have the "@/*" path alias. Keep this chain alias-free.
import type { ResourceCategory } from "./categories";

/**
 * Shared shape of a catalog resource, plus the small controlled
 * vocabularies that go with it (level, delivery channel).
 *
 * This is the single definition the whole frontend uses — the seed data
 * (src/data/resources.seed.ts), the data-access layer
 * (src/lib/resourceCatalog.ts), and the filter logic
 * (src/lib/resourceFilters.ts). It deliberately mirrors the `Resource`
 * model in amplify/data/resource.ts; when the backend is live, the
 * data-access layer maps AppSync rows into this exact shape so the UI
 * never has to care whether it's online or offline.
 */

export type ResourceLevel = "STATE" | "FEDERAL" | "LOCAL";

export type ResourceChannel = "PHONE" | "ONLINE" | "IN_PERSON" | "MAIL";

/** Sentinel used in `counties` to mean "every Georgia county". */
export const STATEWIDE = "STATEWIDE" as const;

/** A question the guide can answer directly from catalog content. */
export interface ProgramQuestion {
  question: string;
  answer: string;
}

export interface CivicResource {
  /** Stable id. For seed data this equals the slug. */
  id: string;
  slug: string;
  name: string;
  /** One plain-language sentence: "what is this?" (6th–8th grade). */
  summary: string;
  /** Fuller detail: who runs it, what you get, how it works. */
  description: string;
  category: ResourceCategory;
  level: ResourceLevel;
  agency: string;
  eligibilitySummary: string;
  /** Controlled vocab — keys of ELIGIBILITY_TAGS in src/data/eligibilityTags.ts. */
  eligibilityTags: string[];
  /** County names, or `[STATEWIDE]`. */
  counties: string[];
  channels: ResourceChannel[];
  phone?: string;
  url: string;
  applicationUrl?: string;
  /** Language codes the service is offered in, e.g. "en", "es". */
  languages: string[];
  /** ISO-8601 date (YYYY-MM-DD) the details were last checked. */
  lastVerified: string;
  keywords: string[];

  /*
   * ── Deeper program knowledge ──────────────────────────────────────
   * Optional, and deliberately so: these feed the chat/voice guide so it
   * can answer "how do I apply", "what do I bring", "what does it cost"
   * instead of only pointing at a website. Every value must come from an
   * official source — an empty field is always better than a guessed one,
   * because the guide is instructed to say "ask the agency" when a detail
   * is missing but will happily repeat a wrong one.
   */

  /** Ordered, plain-language steps to apply. */
  howToApply?: string[];
  /** What to have ready / bring. */
  documentsNeeded?: string[];
  /** What it costs, or what you receive, where the agency publishes it. */
  costNote?: string;
  /** Questions the guide can answer directly, without a web lookup. */
  commonQuestions?: ProgramQuestion[];
}

export const LEVEL_LABEL: Record<ResourceLevel, string> = {
  STATE: "Georgia state program",
  FEDERAL: "Federal program",
  LOCAL: "Local / district service",
};

export const CHANNEL_LABEL: Record<ResourceChannel, string> = {
  PHONE: "By phone",
  ONLINE: "Online",
  IN_PERSON: "In person",
  MAIL: "By mail",
};

/** Decorative only — always rendered next to the text label. */
export const CHANNEL_ICON: Record<ResourceChannel, string> = {
  PHONE: "📞",
  ONLINE: "💻",
  IN_PERSON: "🏢",
  MAIL: "✉️",
};

export const CHANNEL_ORDER: ResourceChannel[] = [
  "ONLINE",
  "PHONE",
  "IN_PERSON",
  "MAIL",
];

/** Common language codes to labels. Extend as the catalog grows. */
export const LANGUAGE_LABEL: Record<string, string> = {
  en: "English",
  es: "Spanish",
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABEL[code] ?? code.toUpperCase();
}
