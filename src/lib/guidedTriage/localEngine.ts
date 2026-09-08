import type { CivicResource } from "../resourceTypes";
import type { TriageAnswers, TriageStep, TriageStepId } from "./types";
import { STATIC_QUESTIONS, buildNeedQuestion } from "./questionLadder";
import { buildProfile, allText } from "./profile";
import { crisisRecommendations, recommendResources } from "./retrieval";
import { scanForDistress } from "./safety";
import { makeSessionId } from "./session";

/**
 * Deterministic offline triage engine.
 *
 * Walks the fixed question ladder (questionLadder.ts), interprets typed
 * answers with keyword hints (profile.ts), then produces a grounded,
 * ranked shortlist via retrieval.ts. This powers `/guide` in offline/demo
 * mode and is the Bedrock Lambda's fallback if the model call fails — the
 * shape it returns is identical either way.
 *
 * Import-light (no "@/" alias) so the Lambda shares this exact file.
 *
 * Pure and synchronous: `nextTriageStep(answers)` is a function of the
 * answers gathered so far. The wizard calls it again after every submit;
 * "Back" just drops the last answer and re-calls.
 */

function isAnswered(answers: TriageAnswers, step: TriageStepId): boolean {
  return answers.some((a) => a.step === step);
}

/** Steps this run will show, in order — depends on the situation picked. */
function planSteps(answers: TriageAnswers): TriageStepId[] {
  const situationValue = answers.find((a) => a.step === "situation")?.choices[0];
  const hasNeed = !!situationValue && buildNeedQuestion(situationValue) !== null;
  return [
    "situation",
    ...(hasNeed ? (["need"] as TriageStepId[]) : []),
    "county",
    "signals",
    "channel",
  ];
}

export function nextTriageStep(
  answers: TriageAnswers,
  corpus: CivicResource[],
): TriageStep {
  // 1. Safety first — scan everything typed so far.
  if (scanForDistress(allText(answers)).crisis) {
    return {
      kind: "crisis",
      message:
        "It sounds like you're going through something really hard. You deserve to talk to someone right now — the people below are free, confidential, and available 24/7. If you're in immediate danger, call 911.",
      resources: crisisRecommendations(corpus),
    };
  }

  // 2. Ask the next unanswered question in the plan.
  const plan = planSteps(answers);
  const nextUnanswered = plan.find((step) => !isAnswered(answers, step));

  if (nextUnanswered) {
    const question =
      nextUnanswered === "need"
        ? buildNeedQuestion(
            answers.find((a) => a.step === "situation")?.choices[0] ?? "",
          )
        : STATIC_QUESTIONS[nextUnanswered as Exclude<TriageStepId, "need">];
    if (question) {
      return {
        kind: "question",
        question,
        progress: {
          current: plan.indexOf(nextUnanswered) + 1,
          total: plan.length,
        },
      };
    }
  }

  // 3. All answered → grounded recommendations.
  const { profile, summary } = buildProfile(answers);
  const recommendations = recommendResources(corpus, profile, 4);

  return {
    kind: "result",
    recommendations,
    noMatches: recommendations.length === 0,
    sessionId: makeSessionId(),
    loggedSummary: {
      ...summary,
      recommendedSlugs: recommendations.map((r) => r.slug),
    },
  };
}
