import type { ResourceCategory } from "../categories";

/**
 * Shared contract for the AI Guided Help triage flow.
 *
 * The wizard (src/routes/Guide.tsx) is stateless between steps: it holds
 * the full set of answers so far and, on every submit, asks the engine
 * "given these answers, what's next?". The engine is either:
 *   - the deterministic offline engine (src/lib/guidedTriage/localEngine.ts),
 *     used in offline/demo mode and as the Lambda's own fallback, or
 *   - the Bedrock-powered Lambda (amplify/functions/guided-triage/), used
 *     when a backend is deployed.
 * Both return the SAME `TriageStep` shape, so the UI doesn't care which
 * one answered.
 *
 * Kept import-light (only a type from ../categories, itself dependency-free)
 * so the Lambda can import this module without the app's "@/" path alias.
 */

/** A single question the wizard shows, one at a time. */
export interface TriageQuestion {
  /** Stable id — the ladder step this question belongs to. */
  id: TriageStepId;
  /** Plain-language prompt (6th–8th grade). */
  title: string;
  /** Optional helper text, shown under the title. */
  help?: string;
  /** How the answer is collected. */
  kind: "chips" | "county" | "signals";
  /** Tappable options. For `county`/`signals` the UI may render its own. */
  options: TriageOption[];
  /** Show a free-text box in addition to the chips. */
  allowText: boolean;
  /** Allow selecting more than one option (signals step). */
  multiSelect: boolean;
  /** Offer an explicit "I'm not sure / skip" choice. */
  allowSkip: boolean;
}

export interface TriageOption {
  label: string;
  value: string;
  /** Optional one-line clarifier under the label. */
  hint?: string;
}

export type TriageStepId =
  | "situation"
  | "need"
  | "county"
  | "signals"
  | "channel";

/** The answer to one step. */
export interface TriageAnswer {
  step: TriageStepId;
  /** Selected option value(s). Empty if the visitor only typed, or skipped. */
  choices: string[];
  /** Free text the visitor typed, if any. */
  text?: string;
  /** True if the visitor chose "I'm not sure / skip". */
  skipped?: boolean;
}

/** All answers gathered so far, in the order they were given. */
export type TriageAnswers = TriageAnswer[];

/** One recommended resource with a plain-language "why this fits you". */
export interface TriageRecommendation {
  /** Slug of a REAL catalog resource — never invented. */
  slug: string;
  name: string;
  category: ResourceCategory;
  summary: string;
  /** 1 sentence: why this resource matches what the visitor told us. */
  rationale: string;
  /** The single most useful next step. */
  nextAction: {
    kind: "apply" | "call" | "visit";
    label: string;
    href: string;
  };
}

/** What the engine returns after each answer. */
export type TriageStep =
  | {
      kind: "question";
      question: TriageQuestion;
      progress: { current: number; total: number };
    }
  | {
      kind: "result";
      recommendations: TriageRecommendation[];
      /** True when nothing in the catalog matched — be honest, offer a human. */
      noMatches: boolean;
      /** Anonymous id for the logged GuidedSession (no PII). */
      sessionId: string;
      /** Structured, PII-free summary of what was asked/answered. */
      loggedSummary: GuidedSessionSummary;
    }
  | {
      kind: "crisis";
      /** Short, non-clinical message. Never counsels. */
      message: string;
      /** 988 and related crisis resources, pulled from the real catalog. */
      resources: TriageRecommendation[];
    };

/**
 * The only thing persisted for analytics. Deliberately excludes raw
 * free-text (which could contain personal details) — just the structured
 * signals we derived and the resources we suggested.
 */
export interface GuidedSessionSummary {
  situation?: string;
  need?: string;
  county?: string;
  signals: string[];
  channel?: string;
  matchedCategories: ResourceCategory[];
  recommendedSlugs: string[];
  crisisDetected: boolean;
}

export const TRIAGE_STEP_ORDER: TriageStepId[] = [
  "situation",
  "need",
  "county",
  "signals",
  "channel",
];
