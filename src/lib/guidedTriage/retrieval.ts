import type { ResourceCategory } from "../categories";
import { CATEGORY_META } from "../categories";
import type { CivicResource, ResourceChannel } from "../resourceTypes";
import { STATEWIDE } from "../resourceTypes";
import { ELSEWHERE_IN_GEORGIA } from "../../data/districtCounties";
import { eligibilityTagLabel } from "../../data/eligibilityTags";
import type { TriageRecommendation } from "./types";

/**
 * Grounded retrieval + ranking over the REAL resource catalog for the
 * guided triage flow.
 *
 * This is the "dev-tier" retrieval the architecture doc commits to: a
 * lightweight structured + lexical score over the catalog rows, no vector
 * store, no OpenSearch Serverless (~$700+/mo). When a Bedrock Knowledge
 * Base is wired up later, the Lambda can swap this for a `retrieve` call
 * and keep the same ranking/‑shape contract — but every recommendation
 * still points at a row that exists here. The model never invents a
 * program, phone number, or URL.
 *
 * Import-light (no "@/" alias) so the Lambda shares this exact file.
 */

export interface TriageProfile {
  categories: ResourceCategory[];
  keywords: string[];
  /** A GA-08 county name, ELSEWHERE_IN_GEORGIA, or undefined (skipped). */
  county?: string;
  /** Eligibility-tag keys the visitor self-identified with (optional). */
  signals: string[];
  /** Preferred channels; empty or ["ANY"] means no preference. */
  channels: ResourceChannel[];
}

export interface ScoredResource {
  resource: CivicResource;
  score: number;
  reasons: string[];
}

const CATEGORY_HIT = 5;
const KEYWORD_HIT = 2;
const COUNTY_LOCAL_HIT = 3;
const COUNTY_STATEWIDE = 1;
const SIGNAL_HIT = 2;
const CHANNEL_HIT = 1;
const OPEN_TO_ALL_BASELINE = 0.5;

function servesCounty(r: CivicResource, county: string): boolean {
  if (r.counties.includes(STATEWIDE)) return true;
  if (county === ELSEWHERE_IN_GEORGIA) return false;
  return r.counties.includes(county);
}

function keywordHits(r: CivicResource, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const haystack = [
    r.name,
    r.summary,
    r.description,
    r.agency,
    ...r.keywords,
  ]
    .join(" ")
    .toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    if (haystack.includes(kw.toLowerCase())) hits += 1;
  }
  return hits;
}

/** Score every resource in the corpus against the profile. */
export function scoreResources(
  corpus: CivicResource[],
  profile: TriageProfile,
): ScoredResource[] {
  const preferChannels = profile.channels.filter((c) => c !== ("ANY" as ResourceChannel));

  return corpus
    .map<ScoredResource>((resource) => {
      let score = 0;
      const reasons: string[] = [];

      if (profile.categories.includes(resource.category)) {
        score += CATEGORY_HIT;
        reasons.push(`covers ${CATEGORY_META[resource.category].label.toLowerCase()}`);
      }

      const kw = keywordHits(resource, profile.keywords);
      if (kw > 0) score += kw * KEYWORD_HIT;

      if (profile.county && profile.county !== ELSEWHERE_IN_GEORGIA) {
        if (resource.counties.includes(STATEWIDE)) {
          score += COUNTY_STATEWIDE;
        } else if (servesCounty(resource, profile.county)) {
          score += COUNTY_LOCAL_HIT;
          reasons.push(`serves ${profile.county} County`);
        } else {
          // A local resource that doesn't reach this county isn't useful.
          score -= 100;
        }
      } else if (profile.county === ELSEWHERE_IN_GEORGIA) {
        if (!resource.counties.includes(STATEWIDE)) score -= 100;
      }

      const matchedSignals = profile.signals.filter((s) =>
        resource.eligibilityTags.includes(s),
      );
      if (matchedSignals.length > 0) {
        score += matchedSignals.length * SIGNAL_HIT;
        reasons.push(
          `for ${matchedSignals.map((s) => eligibilityTagLabel(s).toLowerCase()).join(" and ")}`,
        );
      }

      if (preferChannels.length > 0) {
        const overlap = preferChannels.some((c) => resource.channels.includes(c));
        if (overlap) score += CHANNEL_HIT;
      }

      // Small nudge so "open to all" resources aren't buried BENEATH weaker
      // matches — but only among things that already matched on something
      // real. Never enough to qualify a resource on its own.
      if (
        score > 0 &&
        matchedSignals.length === 0 &&
        resource.eligibilityTags.includes("ALL_RESIDENTS")
      ) {
        score += OPEN_TO_ALL_BASELINE;
      }

      return { resource, score, reasons };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.resource.name.localeCompare(b.resource.name);
    });
}

/** Plain-language "why this fits you" for the offline engine. */
export function explainMatch(
  scored: ScoredResource,
  profile: TriageProfile,
): string {
  const parts = scored.reasons.slice();
  if (parts.length === 0) {
    // keyword-only match
    return `This came up for what you described${
      profile.county && profile.county !== ELSEWHERE_IN_GEORGIA
        ? `, and it's available in ${profile.county} County`
        : ""
    }.`;
  }
  const joined =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  const sentence = `Matches because it ${joined}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/** The single best next step for a resource, given a channel preference. */
export function nextActionFor(
  r: CivicResource,
  preferredChannel: ResourceChannel | "ANY" | undefined,
): TriageRecommendation["nextAction"] {
  const telHref = r.phone ? `tel:${r.phone.replace(/[^0-9+]/g, "")}` : undefined;

  if (preferredChannel === "PHONE" && telHref) {
    return { kind: "call", label: `Call ${r.phone}`, href: telHref };
  }
  if (r.applicationUrl) {
    return {
      kind: "apply",
      label: "Start an application",
      href: r.applicationUrl,
    };
  }
  if (telHref && (preferredChannel === "PHONE" || !r.url)) {
    return { kind: "call", label: `Call ${r.phone}`, href: telHref };
  }
  return { kind: "visit", label: "Visit the official website", href: r.url };
}

export function toRecommendation(
  scored: ScoredResource,
  profile: TriageProfile,
): TriageRecommendation {
  const { resource } = scored;
  const preferred = profile.channels.find((c) => c !== ("ANY" as ResourceChannel));
  return {
    slug: resource.slug,
    name: resource.name,
    category: resource.category,
    summary: resource.summary,
    rationale: explainMatch(scored, profile),
    nextAction: nextActionFor(resource, preferred),
  };
}

/**
 * Top-N recommendations for a profile. Returns `[]` honestly when nothing
 * clears the bar — the caller then offers a human instead of guessing.
 */
export function recommendResources(
  corpus: CivicResource[],
  profile: TriageProfile,
  limit = 4,
): TriageRecommendation[] {
  return scoreResources(corpus, profile)
    .slice(0, limit)
    .map((s) => toRecommendation(s, profile));
}

/** Crisis resources, looked up by slug from the real catalog. */
export const CRISIS_SLUGS = [
  "988-suicide-and-crisis-lifeline",
  "georgia-crisis-and-access-line",
] as const;

export function crisisRecommendations(
  corpus: CivicResource[],
): TriageRecommendation[] {
  const out: TriageRecommendation[] = [];
  for (const slug of CRISIS_SLUGS) {
    const r = corpus.find((x) => x.slug === slug);
    if (!r) continue;
    out.push({
      slug: r.slug,
      name: r.name,
      category: r.category,
      summary: r.summary,
      rationale:
        "Free, confidential, and available right now. You do not have to be in danger to reach out.",
      nextAction: r.phone
        ? {
            kind: "call",
            label: `Call or text ${r.phone}`,
            href: `tel:${r.phone.replace(/[^0-9+]/g, "")}`,
          }
        : { kind: "visit", label: "Open the website", href: r.url },
    });
  }
  return out;
}
