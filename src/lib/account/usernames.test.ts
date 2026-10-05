import { describe, it, expect } from "vitest";
import {
  toCognitoIdentifier,
  toDisplayName,
  isSyntheticIdentifier,
  validateUsername,
  validatePassword,
} from "@/lib/account/usernames";

describe("username <-> Cognito identifier", () => {
  it("maps a username onto the reserved .invalid TLD, lower-cased", () => {
    expect(toCognitoIdentifier("Alice")).toBe("alice@users.noreply.invalid");
    expect(toCognitoIdentifier("  Bob_2 ")).toBe("bob_2@users.noreply.invalid");
  });

  it("round-trips back to the username for display", () => {
    const id = toCognitoIdentifier("maria.lopez");
    expect(toDisplayName(id)).toBe("maria.lopez");
  });

  it("never exposes the synthetic domain to the user", () => {
    expect(toDisplayName(toCognitoIdentifier("sam"))).not.toContain("@");
    expect(toDisplayName(toCognitoIdentifier("sam"))).not.toContain("invalid");
  });

  it("recognises its own identifiers and leaves real addresses alone", () => {
    expect(isSyntheticIdentifier("sam@users.noreply.invalid")).toBe(true);
    expect(isSyntheticIdentifier("sam@gmail.com")).toBe(false);
  });

  it("degrades safely on empty input", () => {
    expect(toDisplayName(undefined)).toBe("");
    expect(toDisplayName(null)).toBe("");
    expect(toDisplayName("no-at-sign")).toBe("no-at-sign");
  });
});

describe("validation", () => {
  it("accepts reasonable usernames", () => {
    for (const u of ["abc", "maria.lopez", "bob_2", "a-b-c"]) {
      expect(validateUsername(u), u).toBeNull();
    }
  });

  it("rejects usernames that would break the identifier mapping", () => {
    expect(validateUsername("ab")).toMatch(/at least/i);
    expect(validateUsername("a".repeat(31))).toMatch(/or fewer/i);
    // An "@" would produce a second at-sign and corrupt the mapping.
    expect(validateUsername("me@you")).toMatch(/letters, numbers/i);
    expect(validateUsername("has space")).toMatch(/letters, numbers/i);
  });

  it("enforces the password floor", () => {
    expect(validatePassword("1234567")).toMatch(/at least 8/);
    expect(validatePassword("12345678")).toBeNull();
  });
});
