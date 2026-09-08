import type { ResourceCategory } from "../../../src/lib/categories";

/**
 * Maps Lex V2 intents to catalog categories and Connect queues, so the
 * chat/voice bot gives the SAME answers as the /guide wizard.
 *
 * Intent names here must match docs/connect-flows/lex-bot.json.
 * Import-light (no "@/" alias) — bundled into the Lambda.
 */

export const INTENT_CATEGORIES: Record<string, ResourceCategory[]> = {
  HousingHelp: ["HOUSING", "UTILITIES"],
  FoodHelp: ["FOOD_ASSISTANCE"],
  HealthCoverageHelp: ["HEALTH", "CHILD_FAMILY"],
  MentalHealthHelp: ["MENTAL_HEALTH"],
  VeteransHelp: ["VETERANS"],
  JobHelp: ["EMPLOYMENT", "EDUCATION"],
  SeniorHelp: ["SENIORS"],
  DisabilityHelp: ["DISABILITY"],
  ChildFamilyHelp: ["CHILD_FAMILY"],
  LegalHelp: ["LEGAL"],
  TaxHelp: ["TAXES"],
  DisasterHelp: ["DISASTER"],
  BusinessFarmHelp: ["SMALL_BUSINESS", "AGRICULTURE"],
  IdVotingHelp: ["TRANSPORTATION", "VOTING"],
};

/** Which Connect queue a hand-off from this intent should route to. */
export const INTENT_QUEUE: Record<string, string> = {
  VeteransHelp: "Veterans",
  HousingHelp: "Housing",
  // everything else -> General Help (the flow's default)
};

export const HANDOFF_INTENT = "TalkToAgent";
export const FALLBACK_INTENT = "FallbackIntent";

export function queueForIntent(intentName: string | undefined): string {
  if (!intentName) return "General Help";
  return INTENT_QUEUE[intentName] ?? "General Help";
}

export function categoriesForIntent(
  intentName: string | undefined,
): ResourceCategory[] {
  if (!intentName) return [];
  return INTENT_CATEGORIES[intentName] ?? [];
}
