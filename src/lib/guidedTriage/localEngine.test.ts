import { describe, it, expect } from "vitest";
import { nextTriageStep } from "@/lib/guidedTriage/localEngine";
import type { TriageAnswer } from "@/lib/guidedTriage/types";
import { RESOURCE_SEED } from "@/data/resources.seed";

const ans = (
  step: TriageAnswer["step"],
  choices: string[],
  extra: Partial<TriageAnswer> = {},
): TriageAnswer => ({ step, choices, ...extra });

describe("nextTriageStep — ladder", () => {
  it("asks the situation question first", () => {
    const step = nextTriageStep([], RESOURCE_SEED);
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("situation");
    expect(step.progress.current).toBe(1);
  });

  it("asks a follow-up 'need' question for a broad situation", () => {
    const step = nextTriageStep([ans("situation", ["money_housing"])], RESOURCE_SEED);
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("need");
    expect(step.progress.total).toBe(5);
  });

  it("skips the 'need' step for an already-specific situation", () => {
    const step = nextTriageStep([ans("situation", ["veteran"])], RESOURCE_SEED);
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("county");
    expect(step.progress.total).toBe(4); // no "need" step in the plan
  });

  it("walks to a grounded result and logs a PII-free summary", () => {
    const answers: TriageAnswer[] = [
      ans("situation", ["money_housing"]),
      ans("need", ["rent"]),
      ans("county", ["Tift"]),
      ans("signals", ["LOW_INCOME"]),
      ans("channel", ["ONLINE"]),
    ];
    const step = nextTriageStep(answers, RESOURCE_SEED);
    expect(step.kind).toBe("result");
    if (step.kind !== "result") return;

    expect(step.recommendations.length).toBeGreaterThan(0);
    const known = new Set(RESOURCE_SEED.map((r) => r.slug));
    for (const rec of step.recommendations) expect(known.has(rec.slug)).toBe(true);
    // housing help should be in there
    expect(
      step.recommendations.some((r) => r.category === "HOUSING"),
    ).toBe(true);

    // logged summary carries derived signals, not raw free text
    expect(step.loggedSummary.county).toBe("Tift");
    expect(step.loggedSummary.matchedCategories).toContain("HOUSING");
    expect(step.loggedSummary.recommendedSlugs).toEqual(
      step.recommendations.map((r) => r.slug),
    );
    expect(JSON.stringify(step.loggedSummary)).not.toContain("free text");
  });

  it("short-circuits to a crisis hand-off when free text signals distress", () => {
    const step = nextTriageStep(
      [ans("situation", [], { text: "honestly I want to kill myself" })],
      RESOURCE_SEED,
    );
    expect(step.kind).toBe("crisis");
    if (step.kind !== "crisis") return;
    expect(step.resources.map((r) => r.slug)).toContain(
      "988-suicide-and-crisis-lifeline",
    );
  });

  it("is honest when nothing matches", () => {
    const answers: TriageAnswer[] = [
      ans("situation", [], { text: "asdfqwer nothing relevant here" }),
      ans("county", [], { skipped: true }),
      ans("signals", [], { skipped: true }),
      ans("channel", [], { skipped: true }),
    ];
    const step = nextTriageStep(answers, RESOURCE_SEED);
    expect(step.kind).toBe("result");
    if (step.kind !== "result") return;
    expect(step.noMatches).toBe(true);
    expect(step.recommendations).toHaveLength(0);
  });

  it("interprets a typed situation without a chip", () => {
    const answers: TriageAnswer[] = [
      ans("situation", [], { text: "my power is about to be cut off" }),
      ans("county", ["Lowndes"]),
      ans("signals", [], { skipped: true }),
      ans("channel", [], { skipped: true }),
    ];
    const step = nextTriageStep(answers, RESOURCE_SEED);
    expect(step.kind).toBe("result");
    if (step.kind !== "result") return;
    expect(step.recommendations.some((r) => r.category === "UTILITIES")).toBe(true);
  });
});
