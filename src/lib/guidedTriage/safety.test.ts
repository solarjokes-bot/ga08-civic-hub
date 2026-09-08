import { describe, it, expect } from "vitest";
import { scanForDistress } from "@/lib/guidedTriage/safety";

describe("scanForDistress", () => {
  it("flags explicit self-harm / suicide language", () => {
    expect(scanForDistress(["I want to kill myself"]).crisis).toBe(true);
    expect(scanForDistress(["i don't want to live anymore"]).crisis).toBe(true);
    expect(scanForDistress(["thinking about suicide"]).crisis).toBe(true);
    expect(scanForDistress(["I took a bunch of my pills"]).crisis).toBe(true);
  });

  it("flags immediate-danger and abuse language", () => {
    expect(scanForDistress(["my husband hits me"]).crisis).toBe(true);
    expect(scanForDistress(["I'm not safe at home"]).crisis).toBe(true);
    expect(scanForDistress(["this is domestic violence"]).crisis).toBe(true);
  });

  it("does not flag ordinary help-seeking text", () => {
    expect(scanForDistress(["I need help paying my rent"]).crisis).toBe(false);
    expect(scanForDistress(["looking for food stamps"]).crisis).toBe(false);
    expect(scanForDistress(["I lost my job and need training"]).crisis).toBe(false);
    expect(scanForDistress([undefined, "", null]).crisis).toBe(false);
  });
});
