/**
 * Controlled vocabulary for a resource's `eligibilityTags`.
 *
 * These are deliberately BROAD, self-identified signals — never a
 * determination. They power the /resources "who is this for?" filter and
 * (Phase 3) the guided wizard's optional eligibility questions. The
 * project rule: the site must never tell someone whether they qualify;
 * only the agency can. Labels are written plainly and phrased as the
 * visitor would describe themselves.
 */
export interface EligibilityTagMeta {
  key: string;
  /** Filter-chip label, e.g. "Veterans & military families". */
  label: string;
  /** Short helper text shown under the label in the filter panel. */
  hint: string;
}

export const ELIGIBILITY_TAGS: EligibilityTagMeta[] = [
  {
    key: "LOW_INCOME",
    label: "Limited income",
    hint: "Programs with an income limit",
  },
  {
    key: "VETERAN",
    label: "Veterans & military families",
    hint: "Current or former service members and their families",
  },
  {
    key: "SENIOR_60_PLUS",
    label: "Older adults (60+)",
    hint: "Services for seniors and their caregivers",
  },
  {
    key: "HAS_CHILDREN",
    label: "Families with children",
    hint: "Help for parents, guardians, and kids",
  },
  {
    key: "PREGNANT",
    label: "Pregnant or new parents",
    hint: "Prenatal, postpartum, and infant support",
  },
  {
    key: "DISABILITY",
    label: "People with disabilities",
    hint: "Services for adults or children with a disability",
  },
  {
    key: "UNEMPLOYED",
    label: "Out of work",
    hint: "Job loss, job search, and retraining",
  },
  {
    key: "STUDENT",
    label: "Students & adult learners",
    hint: "School, GED, and continuing education",
  },
  {
    key: "SMALL_BUSINESS_OWNER",
    label: "Small business owners",
    hint: "Starting or running a small business",
  },
  {
    key: "FARMER",
    label: "Farmers & agricultural producers",
    hint: "Farm operations and rural land",
  },
  {
    key: "ALL_RESIDENTS",
    label: "Open to all residents",
    hint: "No special eligibility needed",
  },
];

export const ELIGIBILITY_TAG_LABEL: Record<string, string> = Object.fromEntries(
  ELIGIBILITY_TAGS.map((t) => [t.key, t.label]),
);

export function eligibilityTagLabel(key: string): string {
  return ELIGIBILITY_TAG_LABEL[key] ?? key;
}
