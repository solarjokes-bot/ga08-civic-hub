import { describe, it, expect } from "vitest";
import {
  categoriesForIntent,
  queueForIntent,
  INTENT_CATEGORIES,
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

  it("routes veterans and housing to their own queues, everything else to General Help", () => {
    expect(queueForIntent("VeteransHelp")).toBe("Veterans");
    expect(queueForIntent("HousingHelp")).toBe("Housing");
    expect(queueForIntent("FoodHelp")).toBe("General Help");
    expect(queueForIntent(undefined)).toBe("General Help");
    expect(queueForIntent("SomethingUnmapped")).toBe("General Help");
  });

  it("returns no categories for the hand-off / fallback intents", () => {
    expect(categoriesForIntent("TalkToAgent")).toEqual([]);
    expect(categoriesForIntent("FallbackIntent")).toEqual([]);
  });
});
