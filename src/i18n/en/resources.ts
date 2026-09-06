/**
 * User-facing copy for the resource directory (Phase 2).
 *
 * Strings are kept out of the components so they can be translated
 * later without touching markup. Spanish is the likely first target
 * given Georgia demographics — add `src/i18n/es/resources.ts` with the
 * same keys. A runtime i18n library (react-i18next) is slated for
 * Phase 6; until then, components import this object directly.
 *
 * Reading level target: grade 6–8. Avoid acronyms without expansion.
 */
export const resourcesStrings = {
  directory: {
    title: "Find a Resource",
    intro:
      "Search public and government programs that serve Georgia's 8th Congressional District. Every listing links to the official agency so you can confirm the details.",
    searchLabel: "Search by keyword",
    searchPlaceholder: "Try “rent help”, “SNAP”, “veterans”…",
    filtersHeading: "Narrow your results",
    showFilters: "Show filters",
    hideFilters: "Hide filters",
    clearAll: "Clear all filters",
    clearAllShort: "Clear all",
    activeFiltersLabel: "Active filters",
    removeFilter: "Remove filter",
    resultsCount_one: "{count} resource found",
    resultsCount_other: "{count} resources found",
    noResultsTitle: "No resources match those filters",
    noResultsBody:
      "Try removing a filter or searching a different word. You can also chat or call for free and a person will help you look.",
    skipToResults: "Skip to results",
    sortNote: "Sorted by best match",
    sortNoteAlpha: "Sorted A–Z",
  },
  facets: {
    category: "Category",
    county: "County",
    countyHint: "Counties in Georgia's 8th District",
    channel: "How you get help",
    eligibility: "Who it's for",
    language: "Language offered",
  },
  card: {
    viewDetails: "See details and how to apply",
    servesYourArea: "Serves all of Georgia",
    lastVerified: "Details last checked {date}",
  },
  detail: {
    backToDirectory: "← Back to all resources",
    whatItIs: "What this is",
    whoQualifies: "Who can get help",
    howToApply: "How to get help",
    contact: "Contact",
    countiesServed: "Areas served",
    statewide: "All Georgia counties, including all of Georgia's 8th District",
    languages: "Languages",
    officialSite: "Go to the official website",
    applyNow: "Start an application",
    callLabel: "Call {phone}",
    related: "Related resources",
    lastVerifiedLong:
      "We last checked this listing's details on {date}. Always confirm hours, eligibility, and contact information with the agency before you rely on them.",
    notFoundTitle: "We couldn't find that resource",
    notFoundBody:
      "The link may be out of date. Try searching the directory instead.",
  },
} as const;

/** Tiny interpolation helper until react-i18next lands: fills {name} slots. */
export function fmt(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

/** Pick the `_one` / `_other` form and interpolate `{count}`. */
export function pluralResults(count: number): string {
  const t =
    count === 1
      ? resourcesStrings.directory.resultsCount_one
      : resourcesStrings.directory.resultsCount_other;
  return fmt(t, { count });
}
