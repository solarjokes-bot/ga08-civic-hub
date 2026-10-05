import { describe, it, expect } from "vitest";
import {
  commandFrom,
  parseDate,
  parseEmail,
  parseHousehold,
  parsePhone,
  parseServices,
  parseState,
  parseUrgency,
  parseZip,
  VOICE_STEPS,
} from "@/lib/voiceForm";
import { APPLY_SERVICES, applyStrings } from "@/i18n/en/apply";

const ctx = { urgencyOptions: applyStrings.urgencyOptions, services: APPLY_SERVICES };
const value = (r: ReturnType<typeof parseDate>) => (r.ok ? r.value : undefined);

describe("voice answers -> form values", () => {
  it("parses spoken and numeric dates to ISO, and rejects impossible ones", () => {
    expect(value(parseDate("April 12th, 1980"))).toBe("1980-04-12");
    expect(value(parseDate("my date of birth is 4/12/1980"))).toBe("1980-04-12");
    expect(value(parseDate("december 1 2001"))).toBe("2001-12-01");
    expect(parseDate("February 30, 1990").ok).toBe(false);
    expect(parseDate("April 12, 2999").ok).toBe(false);
    expect(parseDate("sometime in spring").ok).toBe(false);
  });

  it("maps state names and spelled-out letters to abbreviations", () => {
    expect(value(parseState("Georgia"))).toBe("GA");
    expect(value(parseState("G A"))).toBe("GA");
    expect(value(parseState("it's North Carolina."))).toBe("NC");
    expect(parseState("Narnia").ok).toBe(false);
    expect(parseState("zz").ok).toBe(false);
  });

  it("accepts 5-digit ZIPs (and ZIP+4), spoken as digits or words", () => {
    expect(value(parseZip("3 1 0 8 8"))).toBe("31088");
    expect(value(parseZip("three one zero eight eight"))).toBe("31088");
    expect(value(parseZip("31088-1234"))).toBe("31088");
    expect(parseZip("3108").ok).toBe(false);
    expect(parseZip("310888").ok).toBe(false);
  });

  it("formats ten-digit phone numbers and drops a leading 1", () => {
    expect(value(parsePhone("478 555 0100"))).toBe("478-555-0100");
    expect(value(parsePhone("1-478-555-0100"))).toBe("478-555-0100");
    expect(value(parsePhone("four seven eight five five five oh one oh oh"))).toBe(
      "478-555-0100",
    );
    expect(parsePhone("555 0100").ok).toBe(false);
  });

  it("turns spoken email into an address", () => {
    expect(value(parseEmail("jordan dot rivera at example dot com"))).toBe(
      "jordan.rivera@example.com",
    );
    expect(parseEmail("not an email").ok).toBe(false);
  });

  it("reads household size as digits or words", () => {
    expect(value(parseHousehold("3"))).toBe("3");
    expect(value(parseHousehold("there are four of us"))).toBe("4");
    expect(parseHousehold("lots").ok).toBe(false);
    expect(parseHousehold("0").ok).toBe(false);
  });

  it("picks every service that is mentioned, by id", () => {
    expect(value(parseServices("health coverage and food", ctx))).toEqual([
      "health",
      "food",
    ]);
    expect(value(parseServices("I need help with rent and my electric bill", ctx))).toEqual([
      "housing",
      "utilities",
    ]);
    expect(parseServices("purple", ctx).ok).toBe(false);
  });

  it("every service id has a way to be spoken", () => {
    const sayings: Record<string, string> = {
      health: "health", food: "food", housing: "housing", utilities: "utilities",
      jobs: "jobs", veterans: "veterans", family: "child care", seniors: "seniors",
      disability: "disability", other: "something else",
    };
    expect(Object.keys(sayings).sort()).toEqual(APPLY_SERVICES.map((s) => s.id).sort());
    for (const [id, phrase] of Object.entries(sayings)) {
      expect(value(parseServices(phrase, ctx))).toEqual([id]);
    }
  });

  it("matches urgency to one of the real option strings", () => {
    expect(value(parseUrgency("it's urgent", ctx))).toBe(applyStrings.urgencyOptions[0]);
    expect(value(parseUrgency("within a few weeks", ctx))).toBe(
      applyStrings.urgencyOptions[1],
    );
    expect(value(parseUrgency("just planning ahead", ctx))).toBe(
      applyStrings.urgencyOptions[2],
    );
    expect(parseUrgency("banana", ctx).ok).toBe(false);
  });

  it("recognizes control commands but not ordinary answers", () => {
    expect(commandFrom("Stop.")).toBe("stop");
    expect(commandFrom("go back")).toBe("back");
    expect(commandFrom("repeat that")).toBe("repeat");
    expect(commandFrom("Skip")).toBe("skip");
    expect(commandFrom("Jordan")).toBeNull();
    expect(commandFrom("Stopford")).toBeNull();
  });

  it("title-cases names and keeps the field order the form uses", () => {
    const first = VOICE_STEPS[0]!.parse("my first name is JORDAN", ctx);
    expect(value(first)).toBe("Jordan");
    expect(VOICE_STEPS.map((s) => s.field)).toEqual([
      "firstName", "lastName", "dateOfBirth", "street", "unit", "city", "state",
      "zip", "phone", "email", "householdSize", "services", "urgency", "notes",
    ]);
  });
});
