import type { ResourceCategory } from "../categories";
import { GEORGIA_COUNTIES, OUTSIDE_GEORGIA } from "../../data/georgiaCounties";
import { ELIGIBILITY_TAGS } from "../../data/eligibilityTags";
import type { TriageOption, TriageQuestion, TriageStepId } from "./types";

/**
 * The question ladder and the "what does this answer mean?" mappings for
 * the guided triage flow.
 *
 * The offline engine (localEngine.ts) walks this ladder deterministically.
 * The Bedrock Lambda uses the SAME step ids, category maps, and keyword
 * hints so chat, voice, and the web wizard stay consistent — it just gets
 * to phrase follow-ups and the "why this fits" rationale more naturally.
 *
 * Design rules (from the spec):
 *  - one question at a time, ≤ 5–6 total, plain language, no jargon
 *  - large tappable chips AND a free-text box
 *  - eligibility questions are always optional ("prefer not to say")
 *  - "I'm not sure" is always allowed
 *
 * Import-light (no "@/" alias) so the Lambda can reuse it.
 */

// ───────────────────────── step 1: situation ─────────────────────────

export interface SituationDef extends TriageOption {
  categories: ResourceCategory[];
  keywords: string[];
  /** If true, jump straight past the "need" step (already specific enough). */
  skipNeed?: boolean;
}

export const SITUATIONS: SituationDef[] = [
  {
    value: "money_housing",
    label: "Money, rent, or bills",
    hint: "Rent, eviction, power or water bills, or making ends meet",
    categories: ["HOUSING", "UTILITIES"],
    keywords: ["rent", "bills", "eviction", "utility", "money"],
  },
  {
    value: "food",
    label: "Food",
    hint: "Food stamps (SNAP), a food pantry, or food for kids",
    categories: ["FOOD_ASSISTANCE"],
    keywords: ["food", "snap", "groceries", "hungry", "pantry", "wic"],
  },
  {
    value: "health",
    label: "Health or health insurance",
    hint: "A doctor, a clinic, Medicaid, or prescriptions",
    categories: ["HEALTH"],
    keywords: ["doctor", "clinic", "medicaid", "insurance", "medicine", "health"],
  },
  {
    value: "mental_health",
    label: "Mental health, stress, or a crisis",
    hint: "Counseling, substance use, or feeling overwhelmed",
    categories: ["MENTAL_HEALTH"],
    keywords: ["counseling", "depression", "anxiety", "addiction", "crisis", "mental health"],
    skipNeed: true,
  },
  {
    value: "job",
    label: "A job or job training",
    hint: "Finding work, training, or help after a layoff",
    categories: ["EMPLOYMENT"],
    keywords: ["job", "work", "unemployment", "training", "laid off", "hiring"],
  },
  {
    value: "veteran",
    label: "I'm a veteran or military family member",
    hint: "VA benefits, health care, or claims help",
    categories: ["VETERANS"],
    keywords: ["veteran", "va", "military", "service member"],
    skipNeed: true,
  },
  {
    value: "older_adult",
    label: "Help for an older adult",
    hint: "Meals, in-home care, caregiver support, or Medicare",
    categories: ["SENIORS"],
    keywords: ["senior", "elderly", "medicare", "caregiver", "aging", "in-home care"],
    skipNeed: true,
  },
  {
    value: "disability",
    label: "A disability",
    hint: "Benefits, services, or help finding work",
    categories: ["DISABILITY"],
    keywords: ["disability", "disabled", "ssi", "ssdi", "vocational"],
    skipNeed: true,
  },
  {
    value: "child_family",
    label: "Children or family support",
    hint: "Child care, kids' health coverage, or family services",
    categories: ["CHILD_FAMILY"],
    keywords: ["child care", "daycare", "kids", "children", "family", "peachcare"],
  },
  {
    value: "legal",
    label: "Legal help",
    hint: "A civil (non-criminal) legal problem",
    categories: ["LEGAL"],
    keywords: ["legal", "lawyer", "court", "eviction", "custody"],
    skipNeed: true,
  },
  {
    value: "disaster",
    label: "A storm or disaster",
    hint: "Damage, cleanup, or recovery help",
    categories: ["DISASTER"],
    keywords: ["storm", "hurricane", "tornado", "flood", "disaster", "fema"],
    skipNeed: true,
  },
  {
    value: "business_farm",
    label: "A small business or farm",
    hint: "Starting or running a business, or farm programs",
    categories: ["SMALL_BUSINESS", "AGRICULTURE"],
    keywords: ["business", "farm", "loan", "startup", "crop", "agriculture"],
  },
  {
    value: "taxes",
    label: "Taxes",
    hint: "Free help filing, or a tax question",
    categories: ["TAXES"],
    keywords: ["tax", "taxes", "refund", "irs", "filing"],
    skipNeed: true,
  },
  {
    value: "id_voting",
    label: "An ID, license, or voting",
    hint: "Driver's license, state ID, or voter registration",
    categories: ["TRANSPORTATION", "VOTING"],
    keywords: ["license", "id", "real id", "vote", "voter", "registration"],
    skipNeed: true,
  },
  {
    value: "other",
    label: "Something else, or I'm not sure",
    hint: "Tell us in your own words and we'll help you narrow it down",
    categories: ["OTHER"],
    keywords: [],
  },
];

export const SITUATIONS_BY_VALUE: Record<string, SituationDef> =
  Object.fromEntries(SITUATIONS.map((s) => [s.value, s]));

// ───────────────────────── step 2: need (disambiguation) ─────────────────────────

export interface NeedDef extends TriageOption {
  categories: ResourceCategory[];
  keywords: string[];
}

export const NEEDS_BY_SITUATION: Record<string, NeedDef[]> = {
  money_housing: [
    { value: "rent", label: "Help paying rent", categories: ["HOUSING"], keywords: ["rent", "rental assistance"] },
    { value: "eviction", label: "I'm facing eviction", categories: ["HOUSING", "LEGAL"], keywords: ["eviction", "evicted", "landlord"] },
    { value: "utility", label: "Help with a power, gas, or water bill", categories: ["UTILITIES"], keywords: ["utility", "power bill", "energy", "liheap"] },
    { value: "homeless", label: "I have nowhere to stay tonight", categories: ["HOUSING"], keywords: ["homeless", "shelter", "nowhere to stay"] },
    { value: "buy_home", label: "Help buying a home", categories: ["HOUSING"], keywords: ["homebuyer", "mortgage", "down payment"] },
    { value: "general_money", label: "General help making ends meet", categories: ["FOOD_ASSISTANCE", "UTILITIES", "OTHER"], keywords: ["cash assistance", "tanf", "financial help"] },
  ],
  food: [
    { value: "snap", label: "Apply for food stamps (SNAP)", categories: ["FOOD_ASSISTANCE"], keywords: ["snap", "food stamps", "ebt"] },
    { value: "pantry", label: "Find a food pantry today", categories: ["FOOD_ASSISTANCE"], keywords: ["food pantry", "food bank", "free food"] },
    { value: "kids_food", label: "Food for my children", categories: ["FOOD_ASSISTANCE", "CHILD_FAMILY"], keywords: ["kids", "school meals", "summer meals"] },
    { value: "wic", label: "Food for pregnancy or a young child (WIC)", categories: ["FOOD_ASSISTANCE"], keywords: ["wic", "pregnant", "infant", "formula"] },
  ],
  health: [
    { value: "coverage", label: "Get health insurance or Medicaid", categories: ["HEALTH"], keywords: ["medicaid", "insurance", "coverage", "pathways"] },
    { value: "kids_coverage", label: "Health coverage for my children", categories: ["CHILD_FAMILY", "HEALTH"], keywords: ["peachcare", "chip", "kids coverage"] },
    { value: "clinic", label: "Find a clinic or health department", categories: ["HEALTH"], keywords: ["clinic", "health department", "immunizations"] },
    { value: "records", label: "A birth or death certificate", categories: ["HEALTH"], keywords: ["birth certificate", "vital records", "death certificate"] },
  ],
  job: [
    { value: "find_work", label: "Find a job", categories: ["EMPLOYMENT"], keywords: ["job search", "hiring", "employ georgia"] },
    { value: "unemployment", label: "File for unemployment", categories: ["EMPLOYMENT"], keywords: ["unemployment", "ui benefits", "myui"] },
    { value: "training", label: "Get job training or new skills", categories: ["EMPLOYMENT", "EDUCATION"], keywords: ["job training", "wioa", "worksource", "apprenticeship"] },
    { value: "ged", label: "Finish my GED or learn English", categories: ["EDUCATION"], keywords: ["ged", "adult education", "english classes", "esl"] },
    { value: "disability_work", label: "Work with a disability", categories: ["DISABILITY", "EMPLOYMENT"], keywords: ["vocational rehabilitation", "gvra", "disability employment"] },
  ],
  child_family: [
    { value: "childcare", label: "Help paying for child care", categories: ["CHILD_FAMILY"], keywords: ["child care", "caps", "daycare subsidy"] },
    { value: "kids_health", label: "Health coverage for my children", categories: ["CHILD_FAMILY", "HEALTH"], keywords: ["peachcare", "medicaid", "kids coverage"] },
    { value: "kids_food", label: "Food for my children", categories: ["FOOD_ASSISTANCE", "CHILD_FAMILY"], keywords: ["wic", "school meals", "snap"] },
    { value: "family_services", label: "Family support or child safety", categories: ["CHILD_FAMILY"], keywords: ["dfcs", "foster care", "child protective services"] },
  ],
  business_farm: [
    { value: "start_business", label: "Start or grow a small business", categories: ["SMALL_BUSINESS"], keywords: ["business plan", "sbdc", "small business loan"] },
    { value: "farm_programs", label: "Farm loans or disaster help for a farm", categories: ["AGRICULTURE"], keywords: ["farm loan", "fsa", "crop insurance", "disaster"] },
    { value: "farm_market", label: "Sell what my farm produces", categories: ["AGRICULTURE"], keywords: ["georgia grown", "farmers market", "export"] },
  ],
};

// ───────────────────────── step 3: county ─────────────────────────

export const COUNTY_OPTIONS: TriageOption[] = [
  ...GEORGIA_COUNTIES.map((c) => ({ label: `${c} County`, value: c })),
  { label: OUTSIDE_GEORGIA, value: OUTSIDE_GEORGIA },
];

// ───────────────────────── step 4: eligibility signals ─────────────────────────

export const SIGNAL_OPTIONS: TriageOption[] = ELIGIBILITY_TAGS.filter(
  (t) => t.key !== "ALL_RESIDENTS",
).map((t) => ({ label: t.label, value: t.key, hint: t.hint }));

// ───────────────────────── step 5: channel ─────────────────────────

export const CHANNEL_OPTIONS: TriageOption[] = [
  { label: "Online", value: "ONLINE" },
  { label: "By phone", value: "PHONE" },
  { label: "In person", value: "IN_PERSON" },
  { label: "Any of these is fine", value: "ANY" },
];

// ───────────────────────── free-text interpretation ─────────────────────────

/**
 * Keyword → category hints for interpreting a typed answer when the
 * visitor doesn't pick a chip (offline engine). High-recall and rough on
 * purpose; the Lambda does this far better with the model.
 */
export const TEXT_CATEGORY_HINTS: Array<{
  test: RegExp;
  categories: ResourceCategory[];
  keywords: string[];
}> = [
  { test: /\b(rent|evict|eviction|landlord|homeless|shelter|housing|section 8|voucher)\b/i, categories: ["HOUSING"], keywords: ["rent", "eviction", "housing"] },
  { test: /\b(power|electric|electricity|water bill|gas bill|utility|utilities|liheap|disconnect)\b/i, categories: ["UTILITIES"], keywords: ["utility", "energy bill"] },
  { test: /\b(food|snap|food stamps|ebt|grocer|hungry|pantry|meal|wic)\b/i, categories: ["FOOD_ASSISTANCE"], keywords: ["food", "snap"] },
  { test: /\b(doctor|clinic|medicaid|insurance|prescription|medicine|hospital|health)\b/i, categories: ["HEALTH"], keywords: ["medicaid", "clinic"] },
  { test: /\b(depress|anxiet|suicid|counsel|therapy|mental|addict|substance|overwhelm|stress)\b/i, categories: ["MENTAL_HEALTH"], keywords: ["counseling", "mental health"] },
  { test: /\b(job|work|unemploy|hire|hiring|layoff|laid off|career|training|resume)\b/i, categories: ["EMPLOYMENT"], keywords: ["job", "unemployment"] },
  { test: /\b(ged|adult education|english class|esl|literacy|college)\b/i, categories: ["EDUCATION"], keywords: ["ged", "adult education"] },
  { test: /\b(veteran|military|va benefits|gi bill|service member)\b/i, categories: ["VETERANS"], keywords: ["veteran", "va"] },
  { test: /\b(senior|elder|older adult|medicare|caregiver|aging|nursing home)\b/i, categories: ["SENIORS"], keywords: ["senior", "aging"] },
  { test: /\b(disab|ssi|ssdi|wheelchair|vocational rehab|blind)\b/i, categories: ["DISABILITY"], keywords: ["disability"] },
  { test: /\b(child care|childcare|daycare|kids|children|peachcare|foster|custody|family)\b/i, categories: ["CHILD_FAMILY"], keywords: ["child care", "family"] },
  { test: /\b(lawyer|legal|court|attorney|sue|tenant rights)\b/i, categories: ["LEGAL"], keywords: ["legal aid"] },
  { test: /\b(storm|hurricane|tornado|flood|disaster|fema|damage)\b/i, categories: ["DISASTER"], keywords: ["disaster"] },
  { test: /\b(business|entrepreneur|startup|small business|llc)\b/i, categories: ["SMALL_BUSINESS"], keywords: ["small business"] },
  { test: /\b(farm|crop|livestock|agricult|fsa|usda)\b/i, categories: ["AGRICULTURE"], keywords: ["farm"] },
  { test: /\b(tax|taxes|irs|refund|filing|vita)\b/i, categories: ["TAXES"], keywords: ["tax help"] },
  { test: /\b(license|driver'?s license|state id|real id|dmv|dds)\b/i, categories: ["TRANSPORTATION"], keywords: ["drivers license", "id"] },
  { test: /\b(vote|voter|register to vote|ballot|polling)\b/i, categories: ["VOTING"], keywords: ["vote", "registration"] },
];

/** Rough signal (eligibility-tag) hints from typed text. */
export const TEXT_SIGNAL_HINTS: Array<{ test: RegExp; signal: string }> = [
  { test: /\b(veteran|military|army|navy|marine|air force)\b/i, signal: "VETERAN" },
  { test: /\b(senior|elderly|older|retire|65|medicare)\b/i, signal: "SENIOR_60_PLUS" },
  { test: /\b(kid|kids|child|children|son|daughter|baby)\b/i, signal: "HAS_CHILDREN" },
  { test: /\b(pregnan|expecting|newborn|infant)\b/i, signal: "PREGNANT" },
  { test: /\b(disab|wheelchair|blind|deaf|ssi|ssdi)\b/i, signal: "DISABILITY" },
  { test: /\b(unemploy|laid off|lost my job|out of work|no income)\b/i, signal: "UNEMPLOYED" },
  { test: /\b(low income|no money|broke|can'?t afford|poverty)\b/i, signal: "LOW_INCOME" },
  { test: /\b(farm|farmer|crop|livestock)\b/i, signal: "FARMER" },
  { test: /\b(business owner|my business|self[-\s]?employed)\b/i, signal: "SMALL_BUSINESS_OWNER" },
];

// ───────────────────────── question builders ─────────────────────────

const SITUATION_QUESTION: TriageQuestion = {
  id: "situation",
  title: "What's going on right now?",
  help: "Pick the closest match, or type it in your own words. There are no wrong answers.",
  kind: "chips",
  options: SITUATIONS,
  allowText: true,
  multiSelect: false,
  allowSkip: false,
};

const COUNTY_QUESTION: TriageQuestion = {
  id: "county",
  title: "Which county do you live in?",
  help: "This helps us show services near you. Choose “I'm outside Georgia” if you don't live in Georgia.",
  kind: "county",
  options: COUNTY_OPTIONS,
  allowText: false,
  multiSelect: false,
  allowSkip: true,
};

const SIGNALS_QUESTION: TriageQuestion = {
  id: "signals",
  title: "Do any of these describe you?",
  help: "This is optional. It only helps us sort results — we never decide whether you qualify. Choose as many as apply, or skip.",
  kind: "signals",
  options: SIGNAL_OPTIONS,
  allowText: false,
  multiSelect: true,
  allowSkip: true,
};

const CHANNEL_QUESTION: TriageQuestion = {
  id: "channel",
  title: "How would you like to get help?",
  help: "We'll put the option you prefer first.",
  kind: "chips",
  options: CHANNEL_OPTIONS,
  allowText: false,
  multiSelect: false,
  allowSkip: true,
};

export function buildNeedQuestion(situationValue: string): TriageQuestion | null {
  const needs = NEEDS_BY_SITUATION[situationValue];
  if (!needs || needs.length === 0) return null;
  const situation = SITUATIONS_BY_VALUE[situationValue];
  return {
    id: "need",
    title: "Which of these is closest?",
    help: situation
      ? `You picked “${situation.label}”. Narrowing it down helps us point you to the right service.`
      : undefined,
    kind: "chips",
    options: needs,
    allowText: true,
    multiSelect: false,
    allowSkip: true,
  };
}

export const STATIC_QUESTIONS: Record<
  Exclude<TriageStepId, "need">,
  TriageQuestion
> = {
  situation: SITUATION_QUESTION,
  county: COUNTY_QUESTION,
  signals: SIGNALS_QUESTION,
  channel: CHANNEL_QUESTION,
};
