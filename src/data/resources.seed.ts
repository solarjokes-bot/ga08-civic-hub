// Relative (not "@/") import so amplify/seed/seed.ts can import this file
// without needing the app's path alias. See src/lib/resourceTypes.ts.
import type { CivicResource } from "../lib/resourceTypes";
import { STATEWIDE } from "../lib/resourceTypes";

/**
 * Seed catalog for the GA-08 Civic Resource Hub.
 *
 * WHAT THIS IS
 *  - The single source of truth for the resource directory. The frontend
 *    reads this directly in offline/demo mode; the Amplify seed script
 *    (amplify/seed/seed.ts) upserts the same records into DynamoDB for a
 *    live backend.
 *
 * SOURCING RULES (per project ground rules)
 *  - Every entry is a real public or government program. Names, URLs, and
 *    phone numbers were checked against official/authoritative sources on
 *    the `lastVerified` date.
 *  - Anything that could NOT be confirmed from an official source in that
 *    pass carries an inline `// VERIFY:` note. Treat those as "confirm
 *    before a production launch", not as settled fact.
 *  - `counties: [STATEWIDE]` means the program serves every Georgia
 *    county (so it matches any GA-08 county filter). Only genuinely
 *    local services list specific counties.
 *
 * Plain-language copy target: 6th–8th grade reading level, no acronyms
 * without expansion.
 */

const VERIFIED = "2026-09-06";

export const RESOURCE_SEED: CivicResource[] = [
  // ─────────────────────────────  FOOD & FAMILY BENEFITS  ─────────────────────────────
  {
    id: "georgia-gateway",
    slug: "georgia-gateway",
    name: "Georgia Gateway",
    summary:
      "One website to apply for food stamps, Medicaid, cash help, and child care help.",
    description:
      "Georgia Gateway is the state's online portal to apply for and manage benefits: SNAP (food stamps), Medicaid and PeachCare for Kids, TANF (cash assistance), WIC, and Childcare and Parent Services (CAPS). You can create an account to apply, renew, upload documents, report changes, and check your status. You can also apply by phone, by mail, or in person at a county Division of Family and Children Services office.",
    category: "FOOD_ASSISTANCE",
    level: "STATE",
    agency: "Georgia Division of Family and Children Services (DFCS)",
    eligibilitySummary:
      "Each program has its own income and household rules. Applying is free, and one application can cover several programs.",
    eligibilityTags: ["LOW_INCOME", "HAS_CHILDREN", "PREGNANT"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "IN_PERSON", "MAIL"],
    phone: "1-877-423-4746",
    url: "https://gateway.ga.gov",
    applicationUrl: "https://gateway.ga.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "snap",
      "food stamps",
      "ebt",
      "medicaid",
      "peachcare",
      "tanf",
      "cash assistance",
      "wic",
      "caps",
      "child care",
      "benefits",
      "dfcs",
    ],
  },
  {
    id: "dfcs-family-support",
    slug: "dfcs-family-support",
    name: "Division of Family and Children Services (DFCS)",
    summary:
      "Your county office for food stamps, cash help, child care help, foster care, and child safety.",
    description:
      "DFCS runs Georgia's economic-support programs (SNAP, TANF, Medicaid intake, and Childcare and Parent Services) and its child welfare system (child protective services, foster care, and adoption). Most benefit business is handled online through Georgia Gateway or by phone, but every county has a DFCS office for in-person help.",
    category: "CHILD_FAMILY",
    level: "STATE",
    agency: "Georgia Division of Family and Children Services (DFCS)",
    eligibilitySummary:
      "Benefit programs have income limits. Child protective services and foster/adoption support are open to anyone who needs them.",
    eligibilityTags: ["LOW_INCOME", "HAS_CHILDREN"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "IN_PERSON"],
    phone: "1-877-423-4746",
    url: "https://dfcs.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "dfcs",
      "child protective services",
      "cps",
      "foster care",
      "adoption",
      "snap",
      "tanf",
      "child care",
      "family",
    ],
  },
  {
    id: "georgia-wic",
    slug: "georgia-wic",
    name: "Georgia WIC (Women, Infants, and Children)",
    summary:
      "Healthy food, nutrition advice, and breastfeeding support for pregnant women and young children.",
    description:
      "WIC gives pregnant, postpartum, and breastfeeding women, and children under age 5, a monthly benefit for healthy foods (loaded onto an eWIC card), plus nutrition counseling, breastfeeding support, and referrals to health care. It is run in Georgia by the Department of Public Health through county health departments.",
    category: "FOOD_ASSISTANCE",
    level: "STATE",
    agency: "Georgia Department of Public Health",
    eligibilitySummary:
      "For pregnant, postpartum, or breastfeeding women and children under 5 who meet an income guideline (being on Medicaid, SNAP, or TANF meets it automatically). A nutrition need is also assessed.",
    eligibilityTags: ["PREGNANT", "HAS_CHILDREN", "LOW_INCOME"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "PHONE"],
    phone: "1-800-228-9173",
    url: "https://dph.georgia.gov/wic",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "wic",
      "nutrition",
      "formula",
      "breastfeeding",
      "pregnancy",
      "infant",
      "ewic",
      "healthy food",
    ],
  },
  {
    id: "feeding-georgia-food-banks",
    slug: "feeding-georgia-food-banks",
    name: "Feeding Georgia — Find a Food Bank",
    summary: "Find a free food pantry or food bank near you.",
    description:
      "Feeding Georgia is the network of the state's regional food banks. Its website lets you pick your county and get the contact details for the food bank that serves your area, which can point you to nearby pantries, mobile food distributions, and programs like Kids Cafe. In much of GA-08, the regional food bank is Second Harvest of South Georgia (Valdosta, Thomasville, and Tifton).",
    category: "FOOD_ASSISTANCE",
    level: "STATE",
    agency: "Feeding Georgia (Georgia Food Bank Association)",
    eligibilitySummary:
      "Food pantries are generally open to anyone who needs food. Some ask for ID or proof of address; requirements vary by pantry.",
    eligibilityTags: ["ALL_RESIDENTS", "LOW_INCOME"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "IN_PERSON"],
    // VERIFY: no single statewide phone line; help is routed to regional
    // food banks. Second Harvest of South Georgia HQ (Valdosta) is
    // (229) 244-2678 per feedingsga.org — re-confirm before publishing.
    url: "https://feedinggeorgia.org/find-help/",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "food bank",
      "food pantry",
      "free food",
      "hunger",
      "second harvest",
      "mobile pantry",
      "emergency food",
    ],
  },

  // ─────────────────────────────  HEALTH  ─────────────────────────────
  {
    id: "georgia-medicaid",
    slug: "georgia-medicaid",
    name: "Georgia Medicaid",
    summary:
      "Free or low-cost health coverage for people with limited income, children, pregnant women, seniors, and people with disabilities.",
    description:
      "Medicaid pays for doctor visits, hospital care, prescriptions, and more for eligible Georgians. It is managed by the Department of Community Health. You apply through Georgia Gateway. Related programs include Planning for Healthy Babies (family planning coverage) and Georgia Pathways to Coverage.",
    category: "HEALTH",
    level: "STATE",
    agency: "Georgia Department of Community Health",
    eligibilitySummary:
      "Eligibility depends on income, household size, age, disability, and pregnancy status. Children often qualify at higher income levels than adults.",
    eligibilityTags: ["LOW_INCOME", "HAS_CHILDREN", "PREGNANT", "DISABILITY", "SENIOR_60_PLUS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "IN_PERSON", "MAIL"],
    phone: "1-877-423-4746",
    url: "https://medicaid.georgia.gov",
    applicationUrl: "https://gateway.ga.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "medicaid",
      "health insurance",
      "medical assistance",
      "pathways",
      "planning for healthy babies",
      "coverage",
    ],
  },
  {
    id: "peachcare-for-kids",
    slug: "peachcare-for-kids",
    name: "PeachCare for Kids",
    summary: "Low-cost health coverage for uninsured children up to age 19.",
    description:
      "PeachCare for Kids provides comprehensive health coverage — checkups, immunizations, doctor and hospital visits, dental, vision, and prescriptions — for children in families that earn too much for Medicaid but still need affordable coverage. Families may pay a small monthly premium based on income; there is no premium for children under 6. You apply through Georgia Gateway.",
    category: "CHILD_FAMILY",
    level: "STATE",
    agency: "Georgia Department of Community Health",
    eligibilitySummary:
      "For children age 18 and under (covered until their 19th birthday) who are uninsured, not eligible for Medicaid, and are U.S. citizens or in an eligible immigration category. Income is compared to a state guideline.",
    eligibilityTags: ["HAS_CHILDREN", "LOW_INCOME"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "MAIL"],
    phone: "1-877-427-3224",
    // VERIFY: official info page is under dch.georgia.gov; exact path has
    // moved before (peachcare-kids vs peachcarekids). Applications are on
    // Georgia Gateway.
    url: "https://dch.georgia.gov/peachcare-kids",
    applicationUrl: "https://gateway.ga.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "peachcare",
      "children health insurance",
      "chip",
      "kids coverage",
      "uninsured children",
    ],
  },
  {
    id: "georgia-public-health-districts",
    slug: "georgia-public-health-districts",
    name: "Georgia Department of Public Health — County Health Departments",
    summary:
      "Local clinics for shots, screenings, WIC, family planning, and birth or death certificates.",
    description:
      "Every county in Georgia has a health department, organized into regional public health districts. Services commonly include immunizations for children and adults, sexually transmitted infection testing and treatment, family planning, tuberculosis services, WIC, environmental health (septic and well permits), and vital records such as certified copies of birth and death certificates.",
    category: "HEALTH",
    level: "STATE",
    agency: "Georgia Department of Public Health",
    eligibilitySummary:
      "Open to the public. Many services use a sliding fee scale based on income; some (like certain vaccines and communicable-disease services) are free.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "PHONE", "ONLINE"],
    // VERIFY: DPH central switchboard commonly listed as (404) 657-2700;
    // residents should contact their county health department directly.
    phone: "1-404-657-2700",
    url: "https://dph.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "health department",
      "immunizations",
      "vaccines",
      "birth certificate",
      "death certificate",
      "vital records",
      "std testing",
      "family planning",
      "public health",
    ],
  },

  // ─────────────────────────────  MENTAL HEALTH & CRISIS  ─────────────────────────────
  {
    id: "988-lifeline",
    slug: "988-suicide-and-crisis-lifeline",
    name: "988 Suicide & Crisis Lifeline",
    summary:
      "Free, confidential support 24/7 for anyone in emotional distress — call, text, or chat 988.",
    description:
      "If you or someone you care about is struggling with thoughts of suicide, a mental health or substance use crisis, or any kind of emotional distress, you can call or text 988, or chat online, any time. In Georgia, 988 contacts are answered by the Georgia Crisis & Access Line, which can also connect you to local services and, if needed, a mobile crisis team. For a life-threatening emergency, call 911.",
    category: "MENTAL_HEALTH",
    level: "FEDERAL",
    agency: "988 Suicide & Crisis Lifeline (SAMHSA)",
    eligibilitySummary: "For anyone, at any time. No cost. No insurance needed.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["PHONE", "ONLINE"],
    phone: "988",
    url: "https://988lifeline.org",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "988",
      "suicide",
      "crisis",
      "mental health emergency",
      "hotline",
      "lifeline",
      "distress",
      "self harm",
    ],
  },
  {
    id: "georgia-crisis-access-line",
    slug: "georgia-crisis-and-access-line",
    name: "Georgia Crisis & Access Line (GCAL)",
    summary:
      "24/7 line for mental health, drug or alcohol, and developmental disability crises — 1-800-715-4225.",
    description:
      "GCAL, part of the state's behavioral health system, helps Georgians in crisis find urgent care. Staff can talk you through a crisis, help you find a counselor or treatment opening, and dispatch a mobile crisis team to come to you when needed. GCAL also answers 988 calls, texts, and chats made from Georgia. Available every day, all day.",
    category: "MENTAL_HEALTH",
    level: "STATE",
    agency: "Georgia Department of Behavioral Health and Developmental Disabilities",
    eligibilitySummary:
      "For any Georgian experiencing or worried about a behavioral health crisis. No cost to call.",
    eligibilityTags: ["ALL_RESIDENTS", "DISABILITY"],
    counties: [STATEWIDE],
    channels: ["PHONE", "ONLINE"],
    phone: "1-800-715-4225",
    // VERIFY: GCAL is also promoted via the "My GCAL" app and dbhdd.georgia.gov;
    // confirm the current landing URL before publishing.
    url: "https://dbhdd.georgia.gov/BeWellGeorgia",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "gcal",
      "crisis line",
      "mental health",
      "substance use",
      "mobile crisis",
      "988",
      "behavioral health",
    ],
  },
  {
    id: "dbhdd-behavioral-health",
    slug: "georgia-behavioral-health-services",
    name: "Georgia Department of Behavioral Health and Developmental Disabilities (DBHDD)",
    summary:
      "Public mental health, addiction, and developmental disability services through local providers.",
    description:
      "DBHDD funds and oversees community mental health and substance use treatment, crisis services, and supports for people with intellectual and developmental disabilities across Georgia. Services are delivered by community service boards and other local provider organizations. Start with the Georgia Crisis & Access Line to be routed to services near you.",
    category: "MENTAL_HEALTH",
    level: "STATE",
    agency: "Georgia Department of Behavioral Health and Developmental Disabilities",
    eligibilitySummary:
      "Priority is given to people with serious mental illness, serious emotional disturbance (children), substance use disorders, or developmental disabilities. Many services use a sliding fee scale.",
    eligibilityTags: ["DISABILITY", "LOW_INCOME", "ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["PHONE", "IN_PERSON", "ONLINE"],
    phone: "1-800-715-4225",
    url: "https://dbhdd.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "dbhdd",
      "mental health",
      "substance abuse",
      "addiction treatment",
      "developmental disability",
      "community service board",
      "counseling",
    ],
  },

  // ─────────────────────────────  HOUSING & UTILITIES  ─────────────────────────────
  {
    id: "dca-housing-choice-voucher",
    slug: "housing-choice-voucher",
    name: "Housing Choice Voucher Program (Section 8)",
    summary:
      "Rental help that pays part of your rent to a private landlord if your income is very low.",
    description:
      "The Housing Choice Voucher program helps very low-income families, seniors, and people with disabilities afford safe housing in the regular rental market. You pay roughly 30% of your income toward rent and the voucher covers the rest, up to a limit. In most of GA-08 the program is run by the Georgia Department of Community Affairs; some cities and counties run their own housing authorities. Waiting lists are common and open only at certain times.",
    category: "HOUSING",
    level: "STATE",
    agency: "Georgia Department of Community Affairs",
    eligibilitySummary:
      "Based mainly on household income (generally at or below 50% of the local median), family size, and citizenship or eligible immigration status. Waiting lists apply.",
    eligibilityTags: ["LOW_INCOME", "SENIOR_60_PLUS", "DISABILITY", "HAS_CHILDREN"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "MAIL"],
    phone: "1-888-621-9885",
    url: "https://dca.georgia.gov/housing-choice-voucher",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "section 8",
      "housing voucher",
      "rental assistance",
      "hud",
      "rent help",
      "dca",
      "housing authority",
    ],
  },
  {
    id: "georgia-housing-search",
    slug: "georgia-housing-search",
    name: "GeorgiaHousingSearch.org",
    summary:
      "Free search for affordable and available rental homes across Georgia.",
    description:
      "GeorgiaHousingSearch.org is a no-cost listing service, funded by the Georgia Department of Community Affairs, where you can search for affordable rental housing by location, price, size, and accessibility features. A toll-free, bilingual call center can help you search by phone.",
    category: "HOUSING",
    level: "STATE",
    agency: "Georgia Department of Community Affairs",
    eligibilitySummary:
      "Open to anyone looking for housing. Individual properties set their own income and screening rules.",
    eligibilityTags: ["ALL_RESIDENTS", "LOW_INCOME"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE"],
    phone: "1-877-428-8844",
    url: "https://www.georgiahousingsearch.org",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "affordable housing",
      "rental listings",
      "apartments",
      "find housing",
      "accessible housing",
    ],
  },
  {
    id: "georgia-dream-homeownership",
    slug: "georgia-dream-homeownership",
    name: "Georgia Dream Homeownership Program",
    summary:
      "Affordable mortgage and down-payment help for first-time homebuyers.",
    description:
      "Georgia Dream offers 30-year fixed-rate mortgages with below-market interest and down-payment assistance to eligible first-time buyers (or buyers who haven't owned a home in three years). You work with a participating lender and complete a homebuyer education course. It is run by the Georgia Department of Community Affairs.",
    category: "HOUSING",
    level: "STATE",
    agency: "Georgia Department of Community Affairs",
    eligibilitySummary:
      "Income and home-price limits apply and vary by county and household size. You must be a first-time buyer (or not have owned in 3 years), have modest savings, and meet a credit-score minimum.",
    eligibilityTags: ["LOW_INCOME", "ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE"],
    // VERIFY: Georgia Dream information line is commonly listed as
    // 1-800-359-4663 (1-800-359-HOME); confirm before publishing.
    phone: "1-800-359-4663",
    url: "https://dca.georgia.gov/safe-affordable-housing/homeownership/georgia-dream",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "first time homebuyer",
      "down payment assistance",
      "mortgage",
      "georgia dream",
      "home loan",
    ],
  },
  {
    id: "liheap-energy-assistance",
    slug: "liheap-energy-assistance",
    name: "Low-Income Home Energy Assistance Program (LIHEAP)",
    summary: "Help paying your heating and cooling bills.",
    description:
      "LIHEAP makes a payment toward your home energy bill (gas, electric, propane, wood) for eligible households. You apply through your local Community Action Agency. The heating program opens each December (earlier for households age 65+ or medically homebound); the cooling program opens in spring. Bring proof of income, Social Security numbers, a recent energy bill, and proof of citizenship or eligible immigration status.",
    category: "UTILITIES",
    level: "STATE",
    agency: "Georgia Division of Family and Children Services",
    eligibilitySummary:
      "Household income must be at or below 60% of the state median income, and you must be responsible for the home's energy costs.",
    eligibilityTags: ["LOW_INCOME", "SENIOR_60_PLUS"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "PHONE"],
    phone: "1-877-423-4746",
    // Use georgiacaa.org to find the Community Action Agency for your county.
    url: "https://dfcs.georgia.gov/services/low-income-home-energy-assistance-program-liheap",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "liheap",
      "energy assistance",
      "power bill help",
      "heating bill",
      "cooling",
      "utility help",
      "community action agency",
    ],
  },
  {
    id: "georgia-power-project-share",
    slug: "project-share-energy-help",
    name: "Project SHARE (energy bill help)",
    summary:
      "Emergency help with energy bills, especially for older adults and people with disabilities.",
    description:
      "Project SHARE is a partnership between Georgia Power and The Salvation Army that gives one-time emergency assistance with home energy bills to households in hardship. Funds are limited and distributed through local Salvation Army service centers. It is open to customers of any utility, not just Georgia Power.",
    category: "UTILITIES",
    level: "STATE",
    agency: "Georgia Power and The Salvation Army",
    eligibilitySummary:
      "For households facing a financial emergency; priority for seniors (65+) and people with disabilities. Local offices confirm eligibility and available funds.",
    eligibilityTags: ["LOW_INCOME", "SENIOR_60_PLUS", "DISABILITY"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "PHONE"],
    // VERIFY: no single statewide Project SHARE number; applicants contact
    // their local Salvation Army. Georgia Power residential customer
    // service is 1-888-660-5890. Confirm the current program page URL.
    url: "https://www.georgiapower.com/residential/billing-and-rates/payment-assistance.html",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "project share",
      "salvation army",
      "energy bill",
      "disconnection",
      "utility emergency",
      "georgia power",
    ],
  },

  // ─────────────────────────────  VETERANS  ─────────────────────────────
  {
    id: "ga-veterans-service",
    slug: "georgia-department-of-veterans-service",
    name: "Georgia Department of Veterans Service",
    summary:
      "Free help filing VA claims and getting the veteran benefits you've earned.",
    description:
      "The Georgia Department of Veterans Service employs trained Veterans Service Officers who help veterans, their families, caregivers, and survivors apply for federal VA benefits (disability compensation, pension, health care, education, home loans) and state benefits. Field Service Offices are located around the state, including in the GA-08 area; you can schedule an appointment online.",
    category: "VETERANS",
    level: "STATE",
    agency: "Georgia Department of Veterans Service",
    eligibilitySummary:
      "For veterans and their dependents or survivors. There is no charge for claims assistance.",
    eligibilityTags: ["VETERAN"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "PHONE", "ONLINE"],
    phone: "1-404-656-2300",
    url: "https://veterans.georgia.gov",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "veterans",
      "va claim",
      "va benefits",
      "veterans service officer",
      "disability compensation",
      "gi bill",
      "military",
    ],
  },
  {
    id: "carl-vinson-va-dublin",
    slug: "carl-vinson-va-medical-center",
    name: "Carl Vinson VA Medical Center (Dublin) and Clinics",
    summary:
      "VA health care for veterans in middle and south Georgia, with clinics in Perry, Macon, Milledgeville, and Tifton.",
    description:
      "The Carl Vinson VA Medical Center in Dublin provides primary care, mental health care, women's health, surgery, rehabilitation, and more for enrolled veterans. It also runs community-based outpatient clinics closer to home, including in Perry, Macon, Milledgeville, and Tifton, which serve several GA-08 counties. You can apply for VA health care online, by phone, by mail, or in person.",
    category: "VETERANS",
    level: "FEDERAL",
    agency: "U.S. Department of Veterans Affairs",
    eligibilitySummary:
      "For veterans who meet VA enrollment criteria (based on service history, disability rating, income, and other factors). Some services are available regardless of enrollment or discharge status.",
    eligibilityTags: ["VETERAN"],
    // Clinics that serve GA-08 residents. The main hospital is in Dublin
    // (Laurens County), just outside the district.
    counties: ["Houston", "Bibb", "Baldwin", "Tift"],
    channels: ["IN_PERSON", "PHONE", "ONLINE"],
    phone: "1-478-272-1210",
    url: "https://www.va.gov/dublin-health-care/",
    applicationUrl: "https://www.va.gov/health-care/how-to-apply/",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "va hospital",
      "veterans health",
      "carl vinson",
      "dublin va",
      "va clinic",
      "enroll va health care",
      "veteran mental health",
    ],
  },

  // ─────────────────────────────  JOBS & EDUCATION  ─────────────────────────────
  {
    id: "ga-dol-unemployment",
    slug: "georgia-department-of-labor",
    name: "Georgia Department of Labor",
    summary:
      "Unemployment benefits, career centers, and free job-search help.",
    description:
      "The Georgia Department of Labor handles unemployment insurance claims (through the MyUI Claimant Portal), runs career centers across the state, and hosts the Employ Georgia job board. Its Reemployment Services program offers one-on-one career counseling and training referrals for people receiving unemployment.",
    category: "EMPLOYMENT",
    level: "STATE",
    agency: "Georgia Department of Labor",
    eligibilitySummary:
      "Unemployment benefits are for workers who lost a job through no fault of their own and meet past-earnings rules. Career-center and job-board services are free and open to everyone.",
    eligibilityTags: ["UNEMPLOYED", "ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "IN_PERSON"],
    phone: "1-877-709-8185",
    url: "https://dol.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "unemployment",
      "ui benefits",
      "myui",
      "job search",
      "employ georgia",
      "career center",
      "reemployment",
    ],
  },
  {
    id: "worksource-georgia",
    slug: "worksource-georgia",
    name: "WorkSource Georgia",
    summary:
      "Free job training and career help paid for by the Workforce Innovation and Opportunity Act (WIOA).",
    description:
      "WorkSource Georgia connects job seekers with paid training, skills programs, resume and interview help, and support services through regional workforce boards and local career centers. It focuses on adults, dislocated workers (people laid off), and youth. It is coordinated by the Technical College System of Georgia.",
    category: "EMPLOYMENT",
    level: "STATE",
    agency: "Technical College System of Georgia",
    eligibilitySummary:
      "Basic career services are open to all. Funded training targets adults with low income, workers who were laid off, and young people ages 16–24; each regional board sets details.",
    eligibilityTags: ["UNEMPLOYED", "LOW_INCOME", "STUDENT"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "ONLINE", "PHONE"],
    // VERIFY: WorkSource is delivered through regional workforce boards;
    // there is no single public 800 number. The TCSG call center handled
    // WorkSource account help at (404) 982-7985 during the 2025 federal
    // shutdown response — confirm this is a standing public line.
    phone: "1-404-982-7985",
    url: "https://worksourcega.org",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "wioa",
      "job training",
      "workforce",
      "dislocated worker",
      "career services",
      "retraining",
      "apprenticeship",
    ],
  },
  {
    id: "tcsg-adult-education",
    slug: "adult-education-and-ged",
    name: "Adult Education and GED Prep",
    summary:
      "Free classes to improve reading and math, learn English, and prepare for the GED test.",
    description:
      "The Technical College System of Georgia's Office of Adult Education offers free adult basic education, English-language classes, and GED test preparation at technical colleges and community sites across the state. The HOPE High School Equivalency grant can cover up to $200 of GED exam fees for eligible Georgians.",
    category: "EDUCATION",
    level: "STATE",
    agency: "Technical College System of Georgia — Office of Adult Education",
    eligibilitySummary:
      "For adults 16 and older who are not enrolled in school and need a high school equivalency, stronger basic skills, or English-language instruction. Classes are free.",
    eligibilityTags: ["STUDENT", "ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "ONLINE"],
    // VERIFY: contact is normally the local technical college's adult
    // education office; confirm whether TCSG publishes a central number.
    url: "https://www.tcsg.edu/adult-education/",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "ged",
      "adult education",
      "high school equivalency",
      "esl",
      "english classes",
      "literacy",
      "hope grant",
    ],
  },
  {
    id: "gvra",
    slug: "georgia-vocational-rehabilitation-agency",
    name: "Georgia Vocational Rehabilitation Agency (GVRA)",
    summary:
      "Training, counseling, and support to help people with disabilities get and keep a job.",
    description:
      "GVRA helps people whose disability makes it hard to work. Services can include career counseling, job training and placement, assistive technology, and help staying employed. GVRA also runs services for people who are blind or have low vision, the Roosevelt Warm Springs rehabilitation campus, and Georgia's disability determination office for Social Security.",
    category: "DISABILITY",
    level: "STATE",
    agency: "Georgia Vocational Rehabilitation Agency",
    eligibilitySummary:
      "For people with a physical, mental, or emotional disability that is a barrier to employment, who need and can benefit from services to work. Submit a referral to get started.",
    eligibilityTags: ["DISABILITY", "UNEMPLOYED"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "ONLINE", "PHONE"],
    phone: "1-844-367-4872",
    url: "https://gvs.georgia.gov",
    applicationUrl: "https://referral.gvs.ga.gov",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "vocational rehabilitation",
      "gvra",
      "disability employment",
      "job coach",
      "assistive technology",
      "blind services",
      "disability determination",
    ],
  },

  // ─────────────────────────────  SENIORS & DISABILITY SUPPORT  ─────────────────────────────
  {
    id: "ga-aging-adrc",
    slug: "aging-and-disability-resource-connection",
    name: "Aging & Disability Resource Connection (ADRC)",
    summary:
      "One phone call to find senior and disability help: meals, in-home care, caregiver support, and Medicare questions.",
    description:
      "The ADRC is a free, no-wrong-door information and referral service run by Georgia's Division of Aging Services and regional Area Agencies on Aging. Staff can connect you to home-delivered and group meals, in-home personal care, transportation, caregiver respite, legal help for seniors, Medicare counseling (GeorgiaCares), and adult protective services for reporting abuse or neglect.",
    category: "SENIORS",
    level: "STATE",
    agency: "Georgia Division of Aging Services",
    eligibilitySummary:
      "For older adults (generally 60+), adults with disabilities of any age, and family caregivers. Many services are free; some ask for a voluntary contribution.",
    eligibilityTags: ["SENIOR_60_PLUS", "DISABILITY"],
    counties: [STATEWIDE],
    channels: ["PHONE", "ONLINE", "IN_PERSON"],
    phone: "1-866-552-4464",
    url: "https://aging.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "adrc",
      "aging",
      "seniors",
      "meals on wheels",
      "in-home care",
      "caregiver support",
      "medicare counseling",
      "georgiacares",
      "adult protective services",
      "elder abuse",
    ],
  },
  {
    id: "ssa-benefits",
    slug: "social-security-administration",
    name: "Social Security Administration",
    summary:
      "Retirement, disability (SSDI), and Supplemental Security Income (SSI) benefits.",
    description:
      "The Social Security Administration pays retirement and survivors benefits, Social Security Disability Insurance (SSDI) for people who can no longer work, and Supplemental Security Income (SSI) for people with very low income who are 65+, blind, or disabled. You can apply and manage most business online with a free 'my Social Security' account, by phone, or at a local field office (offices serving GA-08 include Macon, Valdosta, Tifton, and Warner Robins).",
    category: "SENIORS",
    level: "FEDERAL",
    agency: "U.S. Social Security Administration",
    eligibilitySummary:
      "Retirement benefits are based on your work history. SSDI requires a qualifying disability and recent work. SSI is based on age or disability plus strict income and asset limits.",
    eligibilityTags: ["SENIOR_60_PLUS", "DISABILITY", "LOW_INCOME"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "IN_PERSON"],
    phone: "1-800-772-1213",
    url: "https://www.ssa.gov",
    applicationUrl: "https://www.ssa.gov/apply",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "social security",
      "retirement",
      "ssdi",
      "ssi",
      "disability benefits",
      "survivors benefits",
      "my social security",
    ],
  },

  // ─────────────────────────────  LEGAL  ─────────────────────────────
  {
    id: "georgia-legal-services",
    slug: "georgia-legal-services-program",
    name: "Georgia Legal Services Program",
    summary:
      "Free civil (non-criminal) legal help for lower-income Georgians outside metro Atlanta.",
    description:
      "Georgia Legal Services Program is a nonprofit law firm with offices across the 154 counties outside the five-county Atlanta metro. It helps with civil legal problems such as eviction and housing conditions, domestic violence and family safety, denial of public benefits, consumer and debt issues, and disaster recovery. Apply online or by phone to see if you qualify.",
    category: "LEGAL",
    level: "STATE",
    agency: "Georgia Legal Services Program (nonprofit)",
    eligibilitySummary:
      "Generally for households at or below 200% of the federal poverty level, or people age 60 and older. Does not serve Clayton, Cobb, DeKalb, Fulton, or Gwinnett counties (Atlanta Legal Aid covers those).",
    eligibilityTags: ["LOW_INCOME", "SENIOR_60_PLUS"],
    counties: [STATEWIDE],
    channels: ["PHONE", "ONLINE"],
    phone: "1-833-457-7529",
    url: "https://www.glsp.org",
    applicationUrl: "https://www.glsp.org/need-help/",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "legal aid",
      "free lawyer",
      "eviction defense",
      "domestic violence",
      "benefits denial",
      "consumer law",
      "civil legal help",
    ],
  },

  // ─────────────────────────────  SMALL BUSINESS & AGRICULTURE  ─────────────────────────────
  {
    id: "georgia-sbdc",
    slug: "georgia-small-business-development-center",
    name: "University of Georgia Small Business Development Center (SBDC)",
    summary:
      "Free one-on-one business advising and low-cost training for Georgia small business owners.",
    description:
      "The Georgia SBDC, a University of Georgia public service program partly funded by the U.S. Small Business Administration, provides no-cost, confidential consulting on business plans, financing and loan packages, marketing, cash flow, and growth. It has offices across the state and offers low-cost workshops. There is no charge for consulting.",
    category: "SMALL_BUSINESS",
    level: "STATE",
    agency: "University of Georgia Small Business Development Center",
    eligibilitySummary:
      "For Georgia residents starting or running a small business. Consulting is free; some training classes have a fee.",
    eligibilityTags: ["SMALL_BUSINESS_OWNER"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "ONLINE", "PHONE"],
    // VERIFY: clients normally contact their nearest SBDC office; confirm
    // whether a single statewide intake number is published.
    url: "https://www.georgiasbdc.org",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "small business",
      "sbdc",
      "business plan",
      "sba loan",
      "startup help",
      "business consulting",
      "entrepreneur",
    ],
  },
  {
    id: "usda-fsa-georgia",
    slug: "usda-farm-service-agency-georgia",
    name: "USDA Farm Service Agency — Georgia",
    summary:
      "Farm loans, disaster payments, and commodity and conservation programs for farmers.",
    description:
      "The USDA Farm Service Agency runs programs that help farmers and ranchers: direct and guaranteed farm loans (including loans for beginning and underserved producers), disaster assistance for crop and livestock losses, price-support and safety-net programs, and the Conservation Reserve Program. Business is done through USDA Service Centers located in or near most agricultural counties in GA-08.",
    category: "AGRICULTURE",
    level: "FEDERAL",
    agency: "U.S. Department of Agriculture, Farm Service Agency",
    eligibilitySummary:
      "For agricultural producers. Each program has its own rules on farm size, income, production history, and losses. Local Service Center staff help you apply.",
    eligibilityTags: ["FARMER", "SMALL_BUSINESS_OWNER"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "ONLINE", "PHONE"],
    // VERIFY: FSA Georgia state office (Athens) is commonly listed as
    // (706) 546-2266; producers should contact their county Service Center.
    phone: "1-706-546-2266",
    url: "https://www.fsa.usda.gov/state-offices/Georgia",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "farm loan",
      "fsa",
      "usda",
      "crop insurance",
      "disaster assistance",
      "conservation reserve",
      "agriculture",
      "rural",
    ],
  },
  {
    id: "ga-dept-agriculture",
    slug: "georgia-department-of-agriculture",
    name: "Georgia Department of Agriculture",
    summary:
      "Farm licensing, food safety, and resources that connect Georgia farmers to markets.",
    description:
      "The Georgia Department of Agriculture licenses and inspects food businesses, kennels, and gas pumps and scales; runs the state farmers markets; supports the Georgia Grown marketing program; and helps producers reach buyers and export markets. It also administers programs for fuel and consumer protection.",
    category: "AGRICULTURE",
    level: "STATE",
    agency: "Georgia Department of Agriculture",
    eligibilitySummary:
      "Services are for farmers, food businesses, and consumers statewide. Licensing and inspection fees apply to regulated businesses.",
    eligibilityTags: ["FARMER", "SMALL_BUSINESS_OWNER", "ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "IN_PERSON"],
    // VERIFY: main line commonly listed as (404) 656-3600.
    phone: "1-404-656-3600",
    url: "https://agr.georgia.gov",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "georgia grown",
      "farmers market",
      "food safety",
      "agriculture license",
      "farm inspection",
      "export",
    ],
  },

  // ─────────────────────────────  DISASTER  ─────────────────────────────
  {
    id: "gema-hs",
    slug: "georgia-emergency-management",
    name: "Georgia Emergency Management and Homeland Security Agency (GEMA/HS)",
    summary:
      "Storm, flood, and disaster preparedness and recovery help, coordinated with your county.",
    description:
      "GEMA/HS coordinates Georgia's response to hurricanes, tornadoes, floods, and other emergencies. It works with county emergency management agencies on preparedness, sheltering, and recovery, and administers state and federal disaster-assistance grants for individuals, businesses, and local governments after a declared disaster. Ready Georgia (ready.ga.gov) has family emergency-plan tools.",
    category: "DISASTER",
    level: "STATE",
    agency: "Georgia Emergency Management and Homeland Security Agency",
    eligibilitySummary:
      "Preparedness information is for everyone. Individual disaster assistance is available only after a qualifying declared disaster and has its own rules.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE"],
    phone: "1-800-879-4362",
    url: "https://gema.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "gema",
      "disaster assistance",
      "hurricane",
      "tornado",
      "flood",
      "emergency",
      "fema",
      "ready georgia",
      "recovery",
    ],
  },

  // ─────────────────────────────  MONEY, TAXES, ID, VOTING  ─────────────────────────────
  {
    id: "irs-vita",
    slug: "free-tax-preparation-vita",
    name: "Free Tax Preparation (IRS VITA/TCE)",
    summary:
      "Free, trained help preparing and filing your federal and state tax returns.",
    description:
      "The IRS Volunteer Income Tax Assistance (VITA) and Tax Counseling for the Elderly (TCE) programs offer free tax-return preparation by certified volunteers, usually from late January through April, at libraries, community centers, and colleges. Volunteers can also check whether you qualify for credits like the Earned Income Tax Credit. Use the IRS locator tool or call to find a site near you.",
    category: "TAXES",
    level: "FEDERAL",
    agency: "Internal Revenue Service (VITA/TCE partners)",
    eligibilitySummary:
      "VITA generally serves people who make about $67,000 a year or less, people with disabilities, and limited-English speakers. TCE focuses on taxpayers age 60 and older. // VERIFY: income threshold changes yearly.",
    eligibilityTags: ["LOW_INCOME", "SENIOR_60_PLUS", "DISABILITY"],
    counties: [STATEWIDE],
    channels: ["IN_PERSON", "PHONE"],
    phone: "1-800-906-9887",
    url: "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "free tax help",
      "vita",
      "tce",
      "tax preparation",
      "earned income tax credit",
      "eitc",
      "file taxes",
    ],
  },
  {
    id: "ga-dept-revenue",
    slug: "georgia-department-of-revenue",
    name: "Georgia Department of Revenue",
    summary:
      "File your Georgia income taxes, check a refund, or set up a payment plan.",
    description:
      "The Georgia Department of Revenue collects state taxes and runs the Georgia Tax Center, a free online system to file and pay individual income tax, check refund status, respond to notices, and request payment plans. Its Taxpayer Information and Services line can answer general questions.",
    category: "TAXES",
    level: "STATE",
    agency: "Georgia Department of Revenue",
    eligibilitySummary:
      "For anyone who owes or files Georgia state taxes. Free online filing and payment options are available.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE", "MAIL"],
    phone: "1-877-423-6711",
    url: "https://dor.georgia.gov",
    applicationUrl: "https://gtc.dor.ga.gov",
    languages: ["en"],
    lastVerified: VERIFIED,
    keywords: [
      "state taxes",
      "georgia tax center",
      "income tax refund",
      "payment plan",
      "tax notice",
      "gtc",
    ],
  },
  {
    id: "georgia-dds",
    slug: "georgia-department-of-driver-services",
    name: "Georgia Department of Driver Services (DDS)",
    summary:
      "Driver's licenses, state ID cards, learner's permits, and Real ID.",
    description:
      "DDS issues and renews Georgia driver's licenses and identification cards, learner's permits, and commercial licenses, and handles Real ID upgrades needed for domestic air travel. Many services can be done online through a DDS Online account; others require a visit to a Customer Service Center. A state ID card is available to non-drivers, including seniors and people who don't drive.",
    category: "TRANSPORTATION",
    level: "STATE",
    agency: "Georgia Department of Driver Services",
    eligibilitySummary:
      "Open to Georgia residents. You'll need documents proving identity, Social Security number, and Georgia residency; fees apply.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "IN_PERSON"],
    // VERIFY: DDS customer contact is commonly listed as (678) 413-8400.
    phone: "1-678-413-8400",
    url: "https://dds.georgia.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "drivers license",
      "state id",
      "id card",
      "learners permit",
      "real id",
      "dds",
      "license renewal",
    ],
  },
  {
    id: "ga-my-voter-page",
    slug: "georgia-my-voter-page",
    name: "Georgia My Voter Page",
    summary:
      "Check or update your voter registration, see your sample ballot, and find your polling place.",
    description:
      "The Georgia My Voter Page, run by the Secretary of State, is your one stop for voting information: confirm you're registered, register or update your address online, view your specific sample ballot, find your Election Day and early-voting locations, check the status of an absentee ballot, and see your elected officials.",
    category: "VOTING",
    level: "STATE",
    agency: "Georgia Secretary of State",
    eligibilitySummary:
      "To register in Georgia you must be a U.S. citizen and Georgia resident, at least 17½ years old (18 to vote), and not serving a sentence for a felony conviction.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["ONLINE", "PHONE"],
    // VERIFY: Secretary of State Elections Division general line is
    // commonly listed as (404) 656-2871.
    phone: "1-404-656-2871",
    url: "https://mvp.sos.ga.gov/s/",
    applicationUrl: "https://registertovote.sos.ga.gov",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "register to vote",
      "voter registration",
      "polling place",
      "sample ballot",
      "absentee ballot",
      "my voter page",
      "elections",
    ],
  },

  // ─────────────────────────────  GENERAL REFERRAL  ─────────────────────────────
  {
    id: "georgia-211",
    slug: "georgia-211",
    name: "Georgia 2-1-1 (United Way)",
    summary:
      "Free, confidential help finding local resources — dial 2-1-1 or search online.",
    description:
      "2-1-1 is a free helpline and searchable database, run by United Ways across Georgia, that connects people to local services for food, housing and rent, utility help, health care, child care, job programs, and disaster relief. Trained specialists (with bilingual support) can talk through your situation and give you specific referrals near you. Available in most of Georgia by dialing 2-1-1.",
    category: "OTHER",
    level: "STATE",
    agency: "United Ways of Georgia",
    eligibilitySummary:
      "Open to everyone. The service is free and you do not have to give your name.",
    eligibilityTags: ["ALL_RESIDENTS"],
    counties: [STATEWIDE],
    channels: ["PHONE", "ONLINE"],
    phone: "211",
    url: "https://www.unitedwayga.org/ga211/",
    languages: ["en", "es"],
    lastVerified: VERIFIED,
    keywords: [
      "211",
      "united way",
      "resource referral",
      "help line",
      "find help",
      "community services",
      "rent help",
      "utility help",
    ],
  },
];

/** Quick lookup by slug. */
export const RESOURCE_SEED_BY_SLUG: Record<string, CivicResource> =
  Object.fromEntries(RESOURCE_SEED.map((r) => [r.slug, r]));
