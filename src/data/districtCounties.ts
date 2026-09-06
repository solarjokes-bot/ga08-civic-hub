/**
 * Counties in Georgia's 8th Congressional District.
 *
 * // VERIFY: Sourced from Wikipedia "Georgia's 8th congressional district"
 * (119th Congress) on 2026-09-06, cross-checked against the district's
 * major cities (Perry, Cordele, Tifton, Moultrie, Valdosta, part of
 * Macon). Some counties are only PARTIALLY in GA-08. Before a production
 * launch, re-confirm against an authoritative source (the Census Bureau
 * TIGER/congressional-district files or Congress.gov) and update — district
 * lines can change with redistricting or court order.
 *
 * Used by:
 *  - the /resources county filter and the /guide wizard's county question
 *  - matching resources whose `counties` is `[STATEWIDE]` to any of these
 */
export const GA08_COUNTIES: string[] = [
  "Atkinson",
  "Baldwin",
  "Ben Hill",
  "Berrien",
  "Bibb",
  "Bleckley",
  "Brooks",
  "Clinch",
  "Coffee",
  "Colquitt",
  "Cook",
  "Crisp",
  "Dodge",
  "Echols",
  "Houston",
  "Irwin",
  "Jeff Davis",
  "Jones",
  "Lanier",
  "Lowndes",
  "Monroe",
  "Pulaski",
  "Telfair",
  "Tift",
  "Turner",
  "Twiggs",
  "Wilcox",
  "Wilkinson",
  "Worth",
];

/**
 * Option shown in county pickers for people who live in Georgia but
 * outside GA-08 — many listed resources are statewide, so they're still
 * useful.
 */
export const ELSEWHERE_IN_GEORGIA = "Elsewhere in Georgia";

export const COUNTY_FILTER_OPTIONS: string[] = [
  ...GA08_COUNTIES,
  ELSEWHERE_IN_GEORGIA,
];
