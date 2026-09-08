import { describe, it, expect } from "vitest";
import {
  EMPTY_FILTERS,
  computeFacetCounts,
  countActiveFilters,
  filterResources,
  filtersFromSearchParams,
  filtersToSearchParams,
  servesCounty,
  toggleValue,
  type ResourceFilterState,
} from "@/lib/resourceFilters";
import { RESOURCE_SEED } from "@/data/resources.seed";
import type { CivicResource } from "@/lib/resourceTypes";
import { STATEWIDE } from "@/lib/resourceTypes";
import { OUTSIDE_GEORGIA } from "@/data/georgiaCounties";

const f = (patch: Partial<ResourceFilterState> = {}): ResourceFilterState => ({
  ...EMPTY_FILTERS,
  ...patch,
});

function make(overrides: Partial<CivicResource>): CivicResource {
  return {
    id: "x",
    slug: "x",
    name: "Example Resource",
    summary: "A short plain-language summary.",
    description: "A longer description.",
    category: "OTHER",
    level: "STATE",
    agency: "Example Agency",
    eligibilitySummary: "Anyone.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE"],
    url: "https://example.gov",
    languages: ["en"],
    lastVerified: "2026-09-06",
    keywords: [],
    ...overrides,
  };
}

describe("filterResources", () => {
  it("returns the whole catalog when no filters are set", () => {
    expect(filterResources(RESOURCE_SEED, EMPTY_FILTERS)).toHaveLength(
      RESOURCE_SEED.length,
    );
  });

  it("filters by category (OR within the facet)", () => {
    const out = filterResources(RESOURCE_SEED, f({ categories: ["HOUSING"] }));
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((r) => r.category === "HOUSING")).toBe(true);
  });

  it("AND-combines different facets", () => {
    const housing = filterResources(
      RESOURCE_SEED,
      f({ categories: ["HOUSING"] }),
    );
    const housingByPhone = filterResources(
      RESOURCE_SEED,
      f({ categories: ["HOUSING"], channels: ["PHONE"] }),
    );
    expect(housingByPhone.length).toBeLessThanOrEqual(housing.length);
    expect(
      housingByPhone.every(
        (r) => r.category === "HOUSING" && r.channels.includes("PHONE"),
      ),
    ).toBe(true);
  });

  it("matches free-text as AND-of-terms across name, summary, and keywords", () => {
    const sample = [
      make({ slug: "a", name: "Rent Help Program", keywords: ["eviction"] }),
      make({ slug: "b", name: "Farm Loan Program", keywords: ["tractor"] }),
    ];
    expect(filterResources(sample, f({ q: "rent" })).map((r) => r.slug)).toEqual([
      "a",
    ]);
    expect(filterResources(sample, f({ q: "rent eviction" }))).toHaveLength(1);
    expect(filterResources(sample, f({ q: "rent tractor" }))).toHaveLength(0);
  });

  it("treats a STATEWIDE resource as serving any Georgia county", () => {
    const statewide = make({ slug: "s", counties: [STATEWIDE] });
    const local = make({ slug: "l", counties: ["Tift"] });
    const out = filterResources([statewide, local], f({ counties: ["Bibb"] }));
    expect(out.map((r) => r.slug)).toEqual(["s"]);
  });

  it("'Elsewhere in Georgia' matches only statewide resources", () => {
    const statewide = make({ slug: "s", counties: [STATEWIDE] });
    const local = make({ slug: "l", counties: ["Tift"] });
    const out = filterResources(
      [statewide, local],
      f({ counties: [OUTSIDE_GEORGIA] }),
    );
    expect(out.map((r) => r.slug)).toEqual(["s"]);
  });

  it("sorts alphabetically with no query and by relevance with a query", () => {
    const sample = [
      make({ slug: "zebra", name: "Zebra Services", keywords: [] }),
      make({ slug: "apple", name: "Apple Services", keywords: [] }),
      make({ slug: "rent", name: "Housing", keywords: ["rent"] }),
    ];
    expect(
      filterResources(sample, EMPTY_FILTERS).map((r) => r.slug),
    ).toEqual(["apple", "rent", "zebra"]);
    // "rent" is only in keywords of the third item -> it ranks first.
    expect(filterResources(sample, f({ q: "rent" })).map((r) => r.slug)).toEqual([
      "rent",
    ]);
  });
});

describe("servesCounty", () => {
  it("matches statewide, exact county, and rejects unrelated county", () => {
    expect(servesCounty(make({ counties: [STATEWIDE] }), "Bibb")).toBe(true);
    expect(servesCounty(make({ counties: ["Tift"] }), "Tift")).toBe(true);
    expect(servesCounty(make({ counties: ["Tift"] }), "Bibb")).toBe(false);
  });
});

describe("computeFacetCounts", () => {
  it("counts categories over the unfiltered catalog when nothing is selected", () => {
    const counts = computeFacetCounts(RESOURCE_SEED, EMPTY_FILTERS);
    const summed = Object.values(counts.categories).reduce(
      (a, b) => a + (b ?? 0),
      0,
    );
    expect(summed).toBe(RESOURCE_SEED.length);
  });

  it("holds other facets fixed when counting one facet", () => {
    // With HOUSING selected, category counts still reflect what each
    // category WOULD yield if added (they ignore the current category
    // selection), so HOUSING's own count is unchanged from baseline.
    const base = computeFacetCounts(RESOURCE_SEED, EMPTY_FILTERS);
    const withHousing = computeFacetCounts(
      RESOURCE_SEED,
      f({ categories: ["HOUSING"] }),
    );
    expect(withHousing.categories.HOUSING).toBe(base.categories.HOUSING);
    // Channel counts, by contrast, are now constrained to HOUSING rows.
    const housingRows = RESOURCE_SEED.filter((r) => r.category === "HOUSING");
    const onlineHousing = housingRows.filter((r) =>
      r.channels.includes("ONLINE"),
    ).length;
    expect(withHousing.channels.ONLINE ?? 0).toBe(onlineHousing);
  });
});

describe("URL <-> filter state round-trip", () => {
  it("survives a serialize/parse round trip", () => {
    const state = f({
      q: "rent help",
      categories: ["HOUSING", "UTILITIES"],
      counties: ["Tift"],
      channels: ["ONLINE"],
      eligibilityTags: ["LOW_INCOME"],
      languages: ["es"],
    });
    const round = filtersFromSearchParams(filtersToSearchParams(state));
    expect(round).toEqual(state);
  });

  it("drops unknown category values from the URL", () => {
    const params = new URLSearchParams("category=HOUSING&category=NOT_A_CATEGORY");
    expect(filtersFromSearchParams(params).categories).toEqual(["HOUSING"]);
  });
});

describe("helpers", () => {
  it("toggleValue adds then removes", () => {
    expect(toggleValue([], "a")).toEqual(["a"]);
    expect(toggleValue(["a"], "a")).toEqual([]);
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
  });

  it("countActiveFilters counts query + every selected value", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(
      countActiveFilters(
        f({ q: "x", categories: ["HOUSING"], channels: ["ONLINE", "PHONE"] }),
      ),
    ).toBe(4);
  });
});
