import { describe, it, expect } from "vitest";
import {
  categoriesForIntent,
  INTENT_CATEGORIES,
  HANDOFF_INTENT,
  FALLBACK_INTENT,
} from "../../../amplify/functions/lex-fulfillment/intentMap";
import { CATEGORY_META } from "@/lib/categories";

describe("lex intentMap", () => {
  it("maps every topic intent to at least one real catalog category", () => {
    const validCategories = new Set(Object.keys(CATEGORY_META));
    for (const [intent, cats] of Object.entries(INTENT_CATEGORIES)) {
      expect(cats.length, `${intent} has categories`).toBeGreaterThan(0);
      for (const c of cats) expect(validCategories.has(c)).toBe(true);
    }
  });

  it("returns no categories for the hand-off / fallback intents", () => {
    expect(categoriesForIntent(HANDOFF_INTENT)).toEqual([]);
    expect(categoriesForIntent(FALLBACK_INTENT)).toEqual([]);
    expect(categoriesForIntent(undefined)).toEqual([]);
  });

  it("does not map any intent to a Connect queue (AI self-service only)", () => {
    // The queue-routing map was removed with the human-agent hand-off.
    // If someone reintroduces it, this test should be revisited alongside
    // the copy that promises a person.
    const mod = INTENT_CATEGORIES as Record<string, unknown>;
    expect(Object.keys(mod)).not.toContain(HANDOFF_INTENT);
  });
});
