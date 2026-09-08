import type { LexV2Event, LexV2Response } from "./lexTypes";
import { closeResponse } from "./lexTypes";
import {
  FALLBACK_INTENT,
  HANDOFF_INTENT,
  categoriesForIntent,
  queueForIntent,
} from "./intentMap";
import { loadCorpus } from "../shared/corpus";
import {
  composeGroundedAnswer,
  templatedAnswer,
} from "../shared/groundedAnswer";
import { scanForDistress } from "../../../src/lib/guidedTriage/safety";
import { TEXT_CATEGORY_HINTS } from "../../../src/lib/guidedTriage/questionLadder";
import { scoreResources } from "../../../src/lib/guidedTriage/retrieval";
import type { ResourceCategory } from "../../../src/lib/categories";

/**
 * Lex V2 fulfillment hook for the GA-08 support bot.
 *
 * Flow of one turn:
 *  1. "talk to a person" intent -> set a session attribute the contact
 *     flow reads to route to the right queue, and close politely.
 *  2. distress in what the caller said -> 988 / Georgia Crisis & Access
 *     Line, no model call.
 *  3. otherwise -> category from the intent (or keyword hints for the
 *     fallback intent) -> retrieve real resources -> Bedrock writes a
 *     2-3 sentence grounded answer (templated fallback if unavailable).
 *
 * Every intent in docs/connect-flows/lex-bot.json uses this as its
 * fulfillmentCodeHook.
 */

const REGION = process.env.AWS_REGION ?? "us-east-1";

const CRISIS_MESSAGE =
  "It sounds like you're going through something really hard, and you deserve support right now. You can call or text 988 any time to reach the Suicide and Crisis Lifeline, or call the Georgia Crisis and Access Line at 1-800-715-4225. If you're in immediate danger, please call 911. Would you like me to connect you with a person?";

export const handler = async (event: LexV2Event): Promise<LexV2Response> => {
  const intentName = event.sessionState.intent?.name ?? FALLBACK_INTENT;
  const said = (event.inputTranscript ?? "").trim();
  const priorAttrs = event.sessionState.sessionAttributes ?? {};

  // 1. Human hand-off.
  if (intentName === HANDOFF_INTENT) {
    const queue = queueForIntent(priorAttrs.lastTopicIntent);
    return closeResponse(
      intentName,
      `Okay — I'll connect you with someone who can help. Hold on just a moment.`,
      {
        sessionAttributes: { ...priorAttrs, handoff: "true", routeToQueue: queue },
      },
    );
  }

  // 2. Distress screen (independent of the model).
  if (scanForDistress([said]).crisis) {
    return closeResponse(intentName, CRISIS_MESSAGE, {
      sessionAttributes: {
        ...priorAttrs,
        crisisDetected: "true",
        // Nudge the flow toward a person if they say yes next.
        suggestHandoff: "true",
      },
    });
  }

  // 3. Grounded answer.
  let categories: ResourceCategory[] = categoriesForIntent(intentName);
  const keywords: string[] = [];
  if (categories.length === 0) {
    // FallbackIntent (or an unmapped intent): interpret the free text.
    for (const hint of TEXT_CATEGORY_HINTS) {
      if (hint.test.test(said)) {
        categories.push(...hint.categories);
        keywords.push(...hint.keywords);
      }
    }
    categories = [...new Set(categories)];
  }

  if (categories.length === 0 && keywords.length === 0) {
    return closeResponse(
      intentName,
      "I want to make sure I point you the right way. Can you tell me a little more about what you need — like help with food, rent, health care, a job, or something else? Or say \"talk to a person\".",
      { state: "Fulfilled", sessionAttributes: priorAttrs },
    );
  }

  const corpus = await loadCorpus(REGION);
  const candidates = scoreResources(corpus, {
    categories,
    keywords,
    county: undefined,
    signals: [],
    channels: [],
  })
    .slice(0, 3)
    .map((s) => s.resource);

  if (candidates.length === 0) {
    return closeResponse(
      intentName,
      "I'm not finding a good match for that in our directory. A person can help you look — just say \"talk to a person\".",
      { sessionAttributes: priorAttrs },
    );
  }

  const answer =
    (await composeGroundedAnswer(said || intentName, candidates, REGION)) ??
    templatedAnswer(candidates);

  return closeResponse(intentName, answer, {
    sessionAttributes: {
      ...priorAttrs,
      lastTopicIntent: intentName,
      lastTopicCategories: categories.join(","),
    },
  });
};
