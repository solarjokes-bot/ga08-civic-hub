import { describe, it, expect } from "vitest";
import {
  type TriageProfile,
  crisisRecommendations,
  recommendResources,
  scoreResources,
} from "@/lib/guidedTriage/retrieval";
import { RESOURCE_SEED } from "@/data/resources.seed";

const profile = (p: Partial<TriageProfile> = {}): TriageProfile => ({
  categories: [],
  keywords: [],
  county: undefined,
  signals: [],
  channels: [],
  ...p,
});

describe("scoreResources", () => {
  it("ranks category matches above keyword-only matches", () => {
    const scored = scoreResources(
      RESOURCE_SEED,
      profile({ categories: ["HOUSING"] }),
    );
    expect(scored.length).toBeGreaterThan(0);
    expect(scored[0].resource.category).toBe("HOUSING");
  });

  it("excludes a local resource that does not serve the chosen county", () => {
    const scored = scoreResources(
      RESOURCE_SEED,
      profile({ categories: ["VETERANS"], county: "Echols" }),
    );
    // Carl Vinson VA lists specific counties (Houston/Bibb/Baldwin/Tift),
    // not Echols — it must not appear for an Echols resident.
    expect(scored.some((s) => s.resource.slug === "carl-vinson-va-medical-center")).toBe(
      false,
    );
    // The statewide GA Dept of Veterans Service still does.
    expect(
      scored.some((s) => s.resource.slug === "georgia-department-of-veterans-service"),
    ).toBe(true);
  });

  it("returns nothing when the profile has no usable signal", () => {
    expect(scoreResources(RESOURCE_SEED, profile())).toHaveLength(0);
  });
});

describe("recommendResources", () => {
  it("only ever returns slugs that exist in the catalog", () => {
    const recs = recommendResources(
      RESOURCE_SEED,
      profile({ categories: ["FOOD_ASSISTANCE"], county: "Tift" }),
      5,
    );
    expect(recs.length).toBeGreaterThan(0);
    const known = new Set(RESOURCE_SEED.map((r) => r.slug));
    for (const rec of recs) expect(known.has(rec.slug)).toBe(true);
  });

  it("caps the list and gives every item a rationale + next action", () => {
    const recs = recommendResources(
      RESOURCE_SEED,
      profile({ categories: ["HEALTH", "FOOD_ASSISTANCE", "HOUSING"] }),
      3,
    );
    expect(recs.length).toBeLessThanOrEqual(3);
    for (const rec of recs) {
      expect(rec.rationale.length).toBeGreaterThan(0);
      expect(["apply", "call", "visit"]).toContain(rec.nextAction.kind);
      expect(rec.nextAction.href).toMatch(/^(https?:|tel:)/);
    }
  });

  it("honors a phone channel preference in the next action", () => {
    const recs = recommendResources(
      RESOURCE_SEED,
      profile({ categories: ["MENTAL_HEALTH"], channels: ["PHONE"] }),
      3,
    );
    const withPhone = recs.filter((r) => r.nextAction.kind === "call");
    expect(withPhone.length).toBeGreaterThan(0);
  });
});

describe("crisisRecommendations", () => {
  it("pulls 988 and GCAL straight from the catalog", () => {
    const recs = crisisRecommendations(RESOURCE_SEED);
    expect(recs.map((r) => r.slug)).toEqual([
      "988-suicide-and-crisis-lifeline",
      "georgia-crisis-and-access-line",
    ]);
    expect(recs[0].nextAction.href).toBe("tel:988");
  });
});
