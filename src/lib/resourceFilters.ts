import type { ResourceCategory } from "@/lib/categories";
import { CATEGORY_META } from "@/lib/categories";
import type { CivicResource, ResourceChannel } from "@/lib/resourceTypes";
import { STATEWIDE } from "@/lib/resourceTypes";
import {
  COUNTY_FILTER_OPTIONS,
  ELSEWHERE_IN_GEORGIA,
} from "@/data/districtCounties";

/**
 * Pure, framework-free filtering + faceting for the resource directory.
 *
 * The catalog is small (tens of records), so everything runs client-side
 * on the full list — no server-side search. Keeping this logic pure and
 * separate from React makes it straightforward to unit-test (see
 * resourceFilters.test.ts) and to reuse from the Phase 3 guided wizard.
 */

export interface ResourceFilterState {
  /** Free-text query. Matched as AND-of-terms across several fields. */
  q: string;
  categories: ResourceCategory[];
  /** County names, and/or the ELSEWHERE_IN_GEORGIA sentinel. */
  counties: string[];
  channels: ResourceChannel[];
  /** Eligibility-tag keys (see src/data/eligibilityTags.ts). */
  eligibilityTags: string[];
  /** Language codes, e.g. "es". */
  languages: string[];
}

export const EMPTY_FILTERS: ResourceFilterState = {
  q: "",
  categories: [],
  counties: [],
  channels: [],
  eligibilityTags: [],
  languages: [],
};

export function hasActiveFilters(f: ResourceFilterState): boolean {
  return (
    f.q.trim() !== "" ||
    f.categories.length > 0 ||
    f.counties.length > 0 ||
    f.channels.length > 0 ||
    f.eligibilityTags.length > 0 ||
    f.languages.length > 0
  );
}

export function countActiveFilters(f: ResourceFilterState): number {
  return (
    (f.q.trim() ? 1 : 0) +
    f.categories.length +
    f.counties.length +
    f.channels.length +
    f.eligibilityTags.length +
    f.languages.length
  );
}

// ───────────────────────────── matching ─────────────────────────────

function matchesQuery(r: CivicResource, q: string): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [
    r.name,
    r.summary,
    r.description,
    r.agency,
    CATEGORY_META[r.category]?.label ?? "",
    ...r.keywords,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

/** A resource "serves" a county if it's statewide or lists that county. */
export function servesCounty(r: CivicResource, county: string): boolean {
  if (r.counties.includes(STATEWIDE)) return true;
  if (county === ELSEWHERE_IN_GEORGIA) return false; // only statewide resources
  return r.counties.includes(county);
}

function matchesCounties(r: CivicResource, counties: string[]): boolean {
  if (counties.length === 0) return true;
  return counties.some((c) => servesCounty(r, c));
}

function overlaps<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === 0 || a.some((x) => b.includes(x));
}

function passesAllExcept(
  r: CivicResource,
  f: ResourceFilterState,
  skip: keyof ResourceFilterState,
): boolean {
  if (skip !== "q" && !matchesQuery(r, f.q)) return false;
  if (skip !== "categories" && f.categories.length && !f.categories.includes(r.category))
    return false;
  if (skip !== "counties" && !matchesCounties(r, f.counties)) return false;
  if (skip !== "channels" && !overlaps(f.channels, r.channels)) return false;
  if (skip !== "eligibilityTags" && !overlaps(f.eligibilityTags, r.eligibilityTags))
    return false;
  if (skip !== "languages" && !overlaps(f.languages, r.languages)) return false;
  return true;
}

function passesAll(r: CivicResource, f: ResourceFilterState): boolean {
  return (
    matchesQuery(r, f.q) &&
    (f.categories.length === 0 || f.categories.includes(r.category)) &&
    matchesCounties(r, f.counties) &&
    overlaps(f.channels, r.channels) &&
    overlaps(f.eligibilityTags, r.eligibilityTags) &&
    overlaps(f.languages, r.languages)
  );
}

// ───────────────────────────── public API ─────────────────────────────

export function filterResources(
  all: CivicResource[],
  f: ResourceFilterState,
): CivicResource[] {
  const matched = all.filter((r) => passesAll(r, f));
  return sortResources(matched, f.q);
}

function relevanceScore(r: CivicResource, q: string): number {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;
  const name = r.name.toLowerCase();
  const summary = r.summary.toLowerCase();
  const keywords = r.keywords.join(" ").toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (name.includes(t)) score += 3;
    if (summary.includes(t)) score += 2;
    if (keywords.includes(t)) score += 1;
  }
  return score;
}

export function sortResources(rs: CivicResource[], q = ""): CivicResource[] {
  const byName = (a: CivicResource, b: CivicResource) =>
    a.name.localeCompare(b.name);
  if (!q.trim()) return [...rs].sort(byName);
  return [...rs].sort((a, b) => {
    const diff = relevanceScore(b, q) - relevanceScore(a, q);
    return diff !== 0 ? diff : byName(a, b);
  });
}

/**
 * For each value of a facet, how many resources would still match if the
 * user also selected that value (holding every OTHER active filter). Lets
 * the UI show "Housing (4)" and grey out zero-result options.
 */
export interface FacetCounts {
  categories: Partial<Record<ResourceCategory, number>>;
  channels: Partial<Record<ResourceChannel, number>>;
  eligibilityTags: Record<string, number>;
  languages: Record<string, number>;
  counties: Record<string, number>;
}

export function computeFacetCounts(
  all: CivicResource[],
  f: ResourceFilterState,
): FacetCounts {
  const counts: FacetCounts = {
    categories: {},
    channels: {},
    eligibilityTags: {},
    languages: {},
    counties: {},
  };

  for (const r of all) {
    if (passesAllExcept(r, f, "categories")) {
      counts.categories[r.category] = (counts.categories[r.category] ?? 0) + 1;
    }
    if (passesAllExcept(r, f, "channels")) {
      for (const ch of r.channels) {
        counts.channels[ch] = (counts.channels[ch] ?? 0) + 1;
      }
    }
    if (passesAllExcept(r, f, "eligibilityTags")) {
      for (const tag of r.eligibilityTags) {
        counts.eligibilityTags[tag] = (counts.eligibilityTags[tag] ?? 0) + 1;
      }
    }
    if (passesAllExcept(r, f, "languages")) {
      for (const lng of r.languages) {
        counts.languages[lng] = (counts.languages[lng] ?? 0) + 1;
      }
    }
    if (passesAllExcept(r, f, "counties")) {
      for (const county of COUNTY_FILTER_OPTIONS) {
        if (servesCounty(r, county)) {
          counts.counties[county] = (counts.counties[county] ?? 0) + 1;
        }
      }
    }
  }
  return counts;
}

// ───────────────────────── URL <-> filter state ─────────────────────────
//
// Filters live in the URL query string so a filtered view is shareable,
// bookmarkable, and survives a refresh. Keys are short and human-readable.

const PARAM_KEYS = {
  q: "q",
  categories: "category",
  counties: "county",
  channels: "channel",
  eligibilityTags: "for",
  languages: "lang",
} as const;

export function filtersToSearchParams(
  f: ResourceFilterState,
): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set(PARAM_KEYS.q, f.q.trim());
  for (const c of f.categories) p.append(PARAM_KEYS.categories, c);
  for (const c of f.counties) p.append(PARAM_KEYS.counties, c);
  for (const c of f.channels) p.append(PARAM_KEYS.channels, c);
  for (const t of f.eligibilityTags) p.append(PARAM_KEYS.eligibilityTags, t);
  for (const l of f.languages) p.append(PARAM_KEYS.languages, l);
  return p;
}

export function filtersFromSearchParams(
  p: URLSearchParams,
): ResourceFilterState {
  const validCategories = new Set(Object.keys(CATEGORY_META));
  return {
    q: p.get(PARAM_KEYS.q) ?? "",
    categories: p
      .getAll(PARAM_KEYS.categories)
      .filter((c) => validCategories.has(c)) as ResourceCategory[],
    counties: p.getAll(PARAM_KEYS.counties),
    channels: p.getAll(PARAM_KEYS.channels) as ResourceChannel[],
    eligibilityTags: p.getAll(PARAM_KEYS.eligibilityTags),
    languages: p.getAll(PARAM_KEYS.languages),
  };
}

/** Toggle one value in an array-valued facet, returning a new array. */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}
