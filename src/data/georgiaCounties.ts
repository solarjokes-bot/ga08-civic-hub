/**
 * All 159 counties in Georgia.
 *
 * Replaces the earlier 29-county congressional-district list: the site is
 * no longer scoped to a district, and every seeded resource is a Georgia
 * program, so the county filter covers the whole state.
 *
 * // VERIFY: transcribed against the standard list of Georgia counties.
 * The length assertion below is a guard, not a correctness proof — spot-
 * check the spellings (particularly DeKalb, McDuffie, McIntosh, Ben Hill,
 * Jeff Davis) before a production launch.
 *
 * Used by the /resources county filter and the /guide wizard's county
 * question; resources marked STATEWIDE match any of these.
 */
export const GEORGIA_COUNTIES: string[] = [
  "Appling", "Atkinson", "Bacon", "Baker", "Baldwin", "Banks", "Barrow",
  "Bartow", "Ben Hill", "Berrien", "Bibb", "Bleckley", "Brantley", "Brooks",
  "Bryan", "Bulloch", "Burke", "Butts", "Calhoun", "Camden", "Candler",
  "Carroll", "Catoosa", "Charlton", "Chatham", "Chattahoochee", "Chattooga",
  "Cherokee", "Clarke", "Clay", "Clayton", "Clinch", "Cobb", "Coffee",
  "Colquitt", "Columbia", "Cook", "Coweta", "Crawford", "Crisp", "Dade",
  "Dawson", "Decatur", "DeKalb", "Dodge", "Dooly", "Dougherty", "Douglas",
  "Early", "Echols", "Effingham", "Elbert", "Emanuel", "Evans", "Fannin",
  "Fayette", "Floyd", "Forsyth", "Franklin", "Fulton", "Gilmer", "Glascock",
  "Glynn", "Gordon", "Grady", "Greene", "Gwinnett", "Habersham", "Hall",
  "Hancock", "Haralson", "Harris", "Hart", "Heard", "Henry", "Houston",
  "Irwin", "Jackson", "Jasper", "Jeff Davis", "Jefferson", "Jenkins",
  "Johnson", "Jones", "Lamar", "Lanier", "Laurens", "Lee", "Liberty",
  "Lincoln", "Long", "Lowndes", "Lumpkin", "Macon", "Madison", "Marion",
  "McDuffie", "McIntosh", "Meriwether", "Miller", "Mitchell", "Monroe",
  "Montgomery", "Morgan", "Murray", "Muscogee", "Newton", "Oconee",
  "Oglethorpe", "Paulding", "Peach", "Pickens", "Pierce", "Pike", "Polk",
  "Pulaski", "Putnam", "Quitman", "Rabun", "Randolph", "Richmond",
  "Rockdale", "Schley", "Screven", "Seminole", "Spalding", "Stephens",
  "Stewart", "Sumter", "Talbot", "Taliaferro", "Tattnall", "Taylor",
  "Telfair", "Terrell", "Thomas", "Tift", "Toombs", "Towns", "Treutlen",
  "Troup", "Turner", "Twiggs", "Union", "Upson", "Walker", "Walton", "Ware",
  "Warren", "Washington", "Wayne", "Webster", "Wheeler", "White",
  "Whitfield", "Wilcox", "Wilkes", "Wilkinson", "Worth",
];

/** Georgia has exactly 159 counties — catch transcription slips early. */
if (GEORGIA_COUNTIES.length !== 159) {
  throw new Error(
    `Expected 159 Georgia counties, got ${GEORGIA_COUNTIES.length}`,
  );
}

/**
 * Option for visitors outside Georgia. Only STATEWIDE/federal resources
 * match it, since everything in the catalog is a Georgia program.
 */
export const OUTSIDE_GEORGIA = "I'm outside Georgia";

export const COUNTY_FILTER_OPTIONS: string[] = [
  ...GEORGIA_COUNTIES,
  OUTSIDE_GEORGIA,
];
