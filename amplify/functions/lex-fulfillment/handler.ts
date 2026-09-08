import type { LexV2Event, LexV2Response } from "./lexTypes";
import { closeResponse } from "./lexTypes";
import {
  FALLBACK_INTENT,
  HANDOFF_INTENT,
  categoriesForIntent,
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
 * Lex V2 fulfillment hook for the Georgia support bot.
 *
 * THIS IS AI SELF-SERVICE ONLY — there are no human agents staffing this
 * service. Nothing here may promise, imply, or attempt a transfer to a
 * person. Where someone wants a human we send them to lines that really
 * are answered by people: 2-1-1, 988 / the Georgia Crisis & Access Line,
 * or the agency's own number.
 *
 * Flow of one turn:
 *  1. "talk to a person" intent -> say plainly that this line is automated
 *     and point at 2-1-1 / 988 / the agency. No queue, no transfer.
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
  "It sounds like you're going through something really hard, and you deserve support right now. Please call or text 988 any time to reach the Suicide and Crisis Lifeline, or call the Georgia Crisis and Access Line at 1-800-715-4225. Both are free, confidential, and answered by trained counselors 24 hours a day. If you're in immediate danger, please call 911.";

/**
 * This service is AI self-service only — there are no human agents behind
 * it. When someone asks for a person we must NOT imply we will connect
 * them; we point them to lines that really are answered by people.
 */
const HUMAN_HELP_MESSAGE =
  "I'm an automated guide, so there isn't a person on this line to pass you to. For a real person, dial 2-1-1 - it's a free, confidential Georgia helpline answered 24 hours a day, and they can help you find local services. You can also call the agency for the program you need directly; I can give you their number if you tell me what you're looking for. If this is a mental health crisis, call or text 988.";

export const handler = async (event: LexV2Event): Promise<LexV2Response> => {
  const intentName = event.sessionState.intent?.name ?? FALLBACK_INTENT;
  const said = (event.inputTranscript ?? "").trim();
  const priorAttrs = event.sessionState.sessionAttributes ?? {};

  // 1. "Talk to a person" — we have no agents, so be straight about it and
  // hand off to lines that ARE answered by people (2-1-1, 988, the agency).
  if (intentName === HANDOFF_INTENT) {
    return closeResponse(intentName, HUMAN_HELP_MESSAGE, {
      sessionAttributes: { ...priorAttrs, askedForHuman: "true" },
    });
  }

  // 2. Distress screen (independent of the model).
  if (scanForDistress([said]).crisis) {
    return closeResponse(intentName, CRISIS_MESSAGE, {
      sessionAttributes: { ...priorAttrs, crisisDetected: "true" },
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
      "I want to make sure I point you the right way. Can you tell me a little more about what you need - like help with food, rent, health care, a job, or something else? If you would rather talk to a person, dial 2-1-1.",
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
      "I'm not finding a good match for that in our directory. Dial 2-1-1 to reach a person who can help you look - it is free and answered 24 hours a day.",
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
