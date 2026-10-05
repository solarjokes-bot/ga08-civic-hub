/**
 * Turns spoken answers into /apply form values. Pure functions only — no
 * network, no storage, no browser APIs — so it is easy to test and easy to
 * audit for the privacy rule that applies to the whole page (see Apply.tsx).
 */

export type VoiceField =
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "street"
  | "unit"
  | "city"
  | "state"
  | "zip"
  | "phone"
  | "email"
  | "householdSize"
  | "services"
  | "urgency"
  | "notes";

export type ParseResult =
  | { ok: true; value: string | string[]; spoken: string }
  | { ok: false; hint: string };

export interface VoiceStep {
  field: VoiceField;
  /** The question, read aloud and shown on screen. */
  prompt: string;
  optional?: boolean;
  parse: (heard: string, ctx: ParseContext) => ParseResult;
}

export interface ParseContext {
  urgencyOptions: readonly string[];
  services: ReadonlyArray<{ id: string; label: string }>;
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june", "july",
  "august", "september", "october", "november", "december",
];

const STATES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL",
  indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI",
  minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT",
  nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC",
  "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY",
};

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

/** Keywords per service id (ids from APPLY_SERVICES). */
const SERVICE_WORDS: Record<string, RegExp> = {
  health: /\b(health|medicaid|medical|insurance|peachcare|doctor)\b/,
  food: /\b(food|snap|wic|groceries|grocery|meals?|hungry)\b/,
  housing: /\b(housing|rent|apartment|eviction|homeless|voucher)\b/,
  utilities: /\b(utilit(y|ies)|electric(ity)?|power|heating|liheap|gas bill|water bill|energy)\b/,
  jobs: /\b(jobs?|work|training|employment|unemployment|career)\b/,
  veterans: /\b(veterans?|military|va)\b/,
  family: /\b(child ?care|family|families|kids|children|daycare)\b/,
  seniors: /\b(seniors?|older|elderly|aging|retire(d|ment)|social security)\b/,
  disability: /\b(disabilit(y|ies)|disabled)\b/,
  other: /\b(something else|other|anything else|not sure|don'?t know)\b/,
};

const STOP = /^(stop|quit|exit|cancel|end|i'?m done|that'?s all)\.?$/;
const REPEAT = /^(repeat|say that again|again|what|what was that|repeat that|repeat the question)\??\.?$/;
const BACK = /^(go back|back|previous|last question|previous question)\.?$/;
const SKIP = /^(skip|skip it|skip this|pass|next|none|no|nope|nothing|n\/a|not applicable|no thanks|i don'?t have (one|any))\.?$/;

function clean(heard: string): string {
  return heard.trim().replace(/\s+/g, " ");
}

export type Command = "stop" | "repeat" | "back" | "skip" | null;

/** Spoken commands that control the interview rather than answer it. */
export function commandFrom(heard: string): Command {
  const t = clean(heard).toLowerCase().replace(/[.!?]+$/, "");
  if (STOP.test(t)) return "stop";
  if (REPEAT.test(t)) return "repeat";
  if (BACK.test(t)) return "back";
  if (SKIP.test(t)) return "skip";
  return null;
}

function stripLeadIn(heard: string): string {
  return clean(heard)
    .replace(
      /^(?:(?:my|the)\s+(?:first\s+name|last\s+name|name|address|street address|city|state|zip(?: code)?|phone(?: number)?|email(?: address)?|date of birth|birthday|birth date)\s+is|it'?s|it is|i'?m|i am|i live (?:at|in|on)|we live (?:at|in|on)|that'?s|this is)\s+/i,
      "",
    )
    .replace(/[.,!?]+$/, "")
    .trim();
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s'-])([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

function spellDigits(digits: string): string {
  return digits.split("").join(" ");
}

function wordsToDigits(s: string): string {
  return s
    .toLowerCase()
    .split(/[\s,.-]+/)
    .map((w) => {
      if (/^\d+$/.test(w)) return w;
      const n = NUMBER_WORDS[w];
      return n !== undefined && n < 10 ? String(n) : "";
    })
    .join("");
}

function nameParser(label: string): VoiceStep["parse"] {
  return (heard) => {
    const name = stripLeadIn(heard).replace(/[^A-Za-z'’ .-]/g, "").trim();
    if (name.length < 1 || /\d/.test(heard)) {
      return { ok: false, hint: `Sorry, I didn't catch your ${label}. Please say it again.` };
    }
    const value = titleCase(name);
    return { ok: true, value, spoken: value };
  };
}

function toIsoDate(year: number, month: number, day: number): string | null {
  const now = new Date();
  if (year < 1900 || year > now.getFullYear()) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  if (d.getTime() > now.getTime()) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDate(heard: string): ParseResult {
  const text = stripLeadIn(heard).toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1");
  let month: number | undefined;
  let day: number | undefined;
  let year: number | undefined;

  const named = text.match(
    new RegExp(`\\b(${MONTHS.join("|")})\\b\\s+(\\d{1,2})\\b[\\s,]*(?:of\\s+)?(\\d{4})\\b`),
  );
  const numeric = text.match(/\b(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})\b/);
  if (named) {
    month = MONTHS.indexOf(named[1]!) + 1;
    day = Number(named[2]);
    year = Number(named[3]);
  } else if (numeric) {
    month = Number(numeric[1]);
    day = Number(numeric[2]);
    year = Number(numeric[3]);
  }
  const iso = month && day && year ? toIsoDate(year, month, day) : null;
  if (!iso || !month || !day || !year) {
    return {
      ok: false,
      hint: "Sorry, I couldn't understand that date. Please say the month, day and four-digit year, like April 12, 1980.",
    };
  }
  const monthName = MONTHS[month - 1]!;
  return {
    ok: true,
    value: iso,
    spoken: `${monthName[0]!.toUpperCase()}${monthName.slice(1)} ${day}, ${year}`,
  };
}

export function parseState(heard: string): ParseResult {
  const text = stripLeadIn(heard).toLowerCase().replace(/[.,]/g, "").trim();
  const byName = STATES[text];
  // "G A" or "g.a." -> "ga"
  const letters = text.replace(/\s+/g, "");
  const abbrev = /^[a-z]{2}$/.test(letters)
    ? Object.values(STATES).find((a) => a.toLowerCase() === letters)
    : undefined;
  const value = byName ?? abbrev;
  if (!value) {
    return { ok: false, hint: "Sorry, I didn't catch the state. Please say it again, like Georgia." };
  }
  return { ok: true, value, spoken: value.split("").join(" ") };
}

export function parseZip(heard: string): ParseResult {
  const digits = wordsToDigits(stripLeadIn(heard));
  if (digits.length !== 5 && digits.length !== 9) {
    return { ok: false, hint: "Sorry, I need a five-digit ZIP code. Please say the five numbers." };
  }
  const zip = digits.slice(0, 5);
  return { ok: true, value: zip, spoken: spellDigits(zip) };
}

export function parsePhone(heard: string): ParseResult {
  let digits = wordsToDigits(stripLeadIn(heard));
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) {
    return {
      ok: false,
      hint: "Sorry, I need a ten-digit phone number, including the area code. Please say the numbers again.",
    };
  }
  return {
    ok: true,
    value: `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`,
    spoken: spellDigits(digits),
  };
}

export function parseEmail(heard: string): ParseResult {
  const value = stripLeadIn(heard)
    .toLowerCase()
    .replace(/\s+at\s+/g, "@")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+(dash|hyphen)\s+/g, "-")
    .replace(/\s+/g, "")
    .replace(/\.$/, "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return {
      ok: false,
      hint: "Sorry, I couldn't make out an email address. Say it like: jordan at example dot com. Or say skip.",
    };
  }
  return { ok: true, value, spoken: value.replace("@", " at ").replace(/\./g, " dot ") };
}

export function parseHousehold(heard: string): ParseResult {
  const text = stripLeadIn(heard).toLowerCase();
  const digit = text.match(/\b(\d{1,2})\b/);
  const word = text.split(/[\s,.-]+/).map((w) => NUMBER_WORDS[w]).find((n) => n !== undefined && n >= 1);
  const n = digit ? Number(digit[1]) : word;
  if (!n || n < 1 || n > 20) {
    return { ok: false, hint: "Sorry, how many people live in your home, counting you? Please say a number." };
  }
  return { ok: true, value: String(n), spoken: String(n) };
}

export function parseServices(heard: string, ctx: ParseContext): ParseResult {
  const text = clean(heard).toLowerCase();
  const picked = ctx.services.filter((s) => SERVICE_WORDS[s.id]?.test(text));
  if (picked.length === 0) {
    return {
      ok: false,
      hint: "Sorry, I didn't catch which services. You can say things like health coverage, food, or housing, and name more than one.",
    };
  }
  const names = picked.map((s) => s.label.replace(/\s*\(.*\)\s*$/, ""));
  return {
    ok: true,
    value: picked.map((s) => s.id),
    spoken: names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]!,
  };
}

export function parseUrgency(heard: string, ctx: ParseContext): ParseResult {
  const text = clean(heard).toLowerCase();
  let index = -1;
  if (/\b(urgent|right away|immediately|asap|emergency|today|now)\b/.test(text)) index = 0;
  else if (/\b(few weeks|weeks|soon|month|couple)\b/.test(text)) index = 1;
  else if (/\b(planning|ahead|later|no rush|not urgent|future|someday)\b/.test(text)) index = 2;
  const value = ctx.urgencyOptions[index];
  if (!value) {
    return {
      ok: false,
      hint: "Sorry, please say urgent, within a few weeks, or just planning ahead.",
    };
  }
  return { ok: true, value, spoken: value.replace(/\s*[—-]\s*/g, ", ") };
}

function freeText(label: string, min = 1): (heard: string) => ParseResult {
  return (heard) => {
    const value = stripLeadIn(heard);
    if (value.length < min) {
      return { ok: false, hint: `Sorry, I didn't catch your ${label}. Please say it again.` };
    }
    return { ok: true, value, spoken: value };
  };
}

function capitalizeFirst(s: string): string {
  return s ? s[0]!.toUpperCase() + s.slice(1) : s;
}

export const VOICE_STEPS: readonly VoiceStep[] = [
  { field: "firstName", prompt: "What is your first name?", parse: nameParser("first name") },
  { field: "lastName", prompt: "What is your last name?", parse: nameParser("last name") },
  { field: "dateOfBirth", prompt: "What is your date of birth?", parse: (h) => parseDate(h) },
  {
    field: "street",
    prompt: "What is your street address? Just the house number and street.",
    parse: (h) => {
      const r = freeText("street address", 3)(h);
      return r.ok && typeof r.value === "string"
        ? { ok: true, value: capitalizeFirst(r.value), spoken: r.value }
        : r;
    },
  },
  {
    field: "unit",
    prompt: "Is there an apartment or unit number? Say skip if not.",
    optional: true,
    parse: freeText("unit number"),
  },
  {
    field: "city",
    prompt: "What city do you live in?",
    parse: (h) => {
      const r = freeText("city", 2)(h);
      return r.ok && typeof r.value === "string"
        ? { ok: true, value: titleCase(r.value), spoken: titleCase(r.value) }
        : r;
    },
  },
  { field: "state", prompt: "What state?", parse: (h) => parseState(h) },
  { field: "zip", prompt: "What is your ZIP code?", parse: (h) => parseZip(h) },
  { field: "phone", prompt: "What is the best phone number to reach you?", parse: (h) => parsePhone(h) },
  {
    field: "email",
    prompt: "Do you have an email address? Say skip if not.",
    optional: true,
    parse: (h) => parseEmail(h),
  },
  {
    field: "householdSize",
    prompt: "How many people live in your household, counting you?",
    parse: (h) => parseHousehold(h),
  },
  {
    field: "services",
    prompt:
      "What do you need help with? You can name more than one, like health coverage and food.",
    parse: parseServices,
  },
  {
    field: "urgency",
    prompt: "How soon do you need help? Say urgent, within a few weeks, or just planning ahead.",
    parse: parseUrgency,
  },
  {
    field: "notes",
    prompt: "Is there anything else we should know? Say skip if not.",
    optional: true,
    parse: freeText("note"),
  },
];
