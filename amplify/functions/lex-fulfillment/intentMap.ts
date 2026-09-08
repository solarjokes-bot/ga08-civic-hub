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

/**
 * The intent fired when someone asks for a human. This service is AI
 * self-service only — there are no agents — so this does NOT route to a
 * Connect queue. The fulfillment Lambda answers it by pointing at lines
 * that really are staffed (2-1-1, 988, the agency's own number).
 *
 * The queue-routing map that used to live here was removed with the
 * human-agent hand-off; the Connect queues still exist but nothing
 * transfers into them.
 */
export const HANDOFF_INTENT = "TalkToAgent";
export const FALLBACK_INTENT = "FallbackIntent";

export function categoriesForIntent(
  intentName: string | undefined,
): ResourceCategory[] {
  if (!intentName) return [];
  return INTENT_CATEGORIES[intentName] ?? [];
}
