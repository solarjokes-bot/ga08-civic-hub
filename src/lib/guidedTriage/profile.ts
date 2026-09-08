import type { ResourceCategory } from "../categories";
import type { ResourceChannel } from "../resourceTypes";
import type { GuidedSessionSummary, TriageAnswers, TriageStepId } from "./types";
import {
  NEEDS_BY_SITUATION,
  SITUATIONS_BY_VALUE,
  TEXT_CATEGORY_HINTS,
  TEXT_SIGNAL_HINTS,
} from "./questionLadder";
import type { TriageProfile } from "./retrieval";

/**
 * Turn the visitor's answers into a structured retrieval profile plus a
 * PII-free analytics summary.
 *
 * Shared, import-light (no "@/" alias) so BOTH the offline engine
 * (localEngine.ts) and the Bedrock Lambda pre-filter the catalog the
 * same way before ranking.
 */

const IMPLIED_SIGNAL: Record<string, string> = {
  veteran: "VETERAN",
  older_adult: "SENIOR_60_PLUS",
  disability: "DISABILITY",
};

function uniq<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

function answerFor(answers: TriageAnswers, step: TriageStepId) {
  return answers.find((a) => a.step === step);
}

export function allText(answers: TriageAnswers): string[] {
  return answers.map((a) => a.text ?? "").filter(Boolean);
}

function categoriesFromText(text: string): {
  categories: ResourceCategory[];
  keywords: string[];
} {
  const categories: ResourceCategory[] = [];
  const keywords: string[] = [];
  for (const hint of TEXT_CATEGORY_HINTS) {
    if (hint.test.test(text)) {
      categories.push(...hint.categories);
      keywords.push(...hint.keywords);
    }
  }
  return { categories, keywords };
}

function signalsFromText(text: string): string[] {
  return TEXT_SIGNAL_HINTS.filter((h) => h.test.test(text)).map((h) => h.signal);
}

export interface BuiltProfile {
  profile: TriageProfile;
  summary: Omit<GuidedSessionSummary, "recommendedSlugs">;
}

export function buildProfile(answers: TriageAnswers): BuiltProfile {
  const situation = answerFor(answers, "situation");
  const need = answerFor(answers, "need");
  const county = answerFor(answers, "county");
  const signals = answerFor(answers, "signals");
  const channel = answerFor(answers, "channel");

  let categories: ResourceCategory[] = [];
  let keywords: string[] = [];

  const situationValue = situation?.choices[0];
  if (situationValue && SITUATIONS_BY_VALUE[situationValue]) {
    categories.push(...SITUATIONS_BY_VALUE[situationValue].categories);
    keywords.push(...SITUATIONS_BY_VALUE[situationValue].keywords);
  }
  const needValue = need?.choices[0];
  if (situationValue && needValue) {
    const def = (NEEDS_BY_SITUATION[situationValue] ?? []).find(
      (n) => n.value === needValue,
    );
    if (def) {
      categories.push(...def.categories);
      keywords.push(...def.keywords);
    }
  }
  for (const t of [situation?.text, need?.text]) {
    if (!t) continue;
    const fromText = categoriesFromText(t);
    categories.push(...fromText.categories);
    keywords.push(...fromText.keywords);
  }
  categories = uniq(categories).filter((c) => c !== "OTHER");
  keywords = uniq(keywords);

  const signalSet: string[] = [];
  if (signals && !signals.skipped) signalSet.push(...signals.choices);
  if (situationValue && IMPLIED_SIGNAL[situationValue]) {
    signalSet.push(IMPLIED_SIGNAL[situationValue]);
  }
  for (const t of allText(answers)) signalSet.push(...signalsFromText(t));

  let countyValue: string | undefined;
  if (county && !county.skipped && county.choices[0]) {
    countyValue = county.choices[0];
  }

  const channels: ResourceChannel[] = [];
  const channelValue = channel?.choices[0];
  if (channelValue && channelValue !== "ANY") {
    channels.push(channelValue as ResourceChannel);
  }

  const profile: TriageProfile = {
    categories,
    keywords,
    county: countyValue,
    signals: uniq(signalSet),
    channels,
  };

  return {
    profile,
    summary: {
      situation: situationValue ?? (situation?.text ? "free-text" : undefined),
      need: needValue ?? (need?.text ? "free-text" : undefined),
      county: countyValue,
      signals: profile.signals,
      channel: channelValue,
      matchedCategories: categories,
      crisisDetected: false,
    },
  };
}
