/**
 * Shared category taxonomy for the resource catalog.
 *
 * This mirrors the `category` enum that will land on the Resource model in
 * Phase 2 (amplify/data/resource.ts). It lives here, independent of the
 * backend, so the Home page's quick-category tiles and (later) the
 * /resources filter UI both read from one source of truth instead of two
 * copies drifting apart.
 *
 * Labels are written at a 6th-8th grade reading level per the project's
 * plain-language requirement — no agency jargon.
 */
export type ResourceCategory =
  | "HEALTH"
  | "HOUSING"
  | "FOOD_ASSISTANCE"
  | "VETERANS"
  | "EMPLOYMENT"
  | "EDUCATION"
  | "DISABILITY"
  | "SENIORS"
  | "LEGAL"
  | "UTILITIES"
  | "DISASTER"
  | "SMALL_BUSINESS"
  | "AGRICULTURE"
  | "TRANSPORTATION"
  | "TAXES"
  | "VOTING"
  | "CHILD_FAMILY"
  | "MENTAL_HEALTH"
  | "OTHER";

export interface CategoryMeta {
  category: ResourceCategory;
  label: string;
  description: string;
  /** Decorative only — always paired with the text label. */
  icon: string;
  /** Show on the home page's quick-pick tiles. */
  featuredOnHome: boolean;
}

export const CATEGORY_META: Record<ResourceCategory, CategoryMeta> = {
  HEALTH: {
    category: "HEALTH",
    label: "Health care",
    description: "Doctors, clinics, health insurance, and Medicaid.",
    icon: "🩺",
    featuredOnHome: true,
  },
  HOUSING: {
    category: "HOUSING",
    label: "Housing",
    description: "Rent help, avoiding eviction, and finding a place to live.",
    icon: "🏠",
    featuredOnHome: true,
  },
  FOOD_ASSISTANCE: {
    category: "FOOD_ASSISTANCE",
    label: "Food help",
    description: "SNAP benefits, food banks, and meals for kids.",
    icon: "🥫",
    featuredOnHome: true,
  },
  VETERANS: {
    category: "VETERANS",
    label: "Veterans services",
    description: "Benefits, health care, and support for veterans and families.",
    icon: "🎖️",
    featuredOnHome: true,
  },
  EMPLOYMENT: {
    category: "EMPLOYMENT",
    label: "Jobs & job training",
    description: "Find work, job training, and unemployment help.",
    icon: "💼",
    featuredOnHome: true,
  },
  EDUCATION: {
    category: "EDUCATION",
    label: "Education",
    description: "Schools, financial aid, and adult education.",
    icon: "🎓",
    featuredOnHome: false,
  },
  DISABILITY: {
    category: "DISABILITY",
    label: "Disability services",
    description: "Support and benefits for people with disabilities.",
    icon: "♿",
    featuredOnHome: true,
  },
  SENIORS: {
    category: "SENIORS",
    label: "Senior services",
    description: "Help for older adults and their caregivers.",
    icon: "🧓",
    featuredOnHome: true,
  },
  LEGAL: {
    category: "LEGAL",
    label: "Legal help",
    description: "Free or low-cost legal advice and services.",
    icon: "⚖️",
    featuredOnHome: false,
  },
  UTILITIES: {
    category: "UTILITIES",
    label: "Utility bill help",
    description: "Help paying power, water, and heating bills.",
    icon: "💡",
    featuredOnHome: true,
  },
  DISASTER: {
    category: "DISASTER",
    label: "Disaster help",
    description: "Storm, flood, and emergency recovery assistance.",
    icon: "🌪️",
    featuredOnHome: false,
  },
  SMALL_BUSINESS: {
    category: "SMALL_BUSINESS",
    label: "Small business",
    description: "Loans, grants, and advice for small business owners.",
    icon: "🏪",
    featuredOnHome: false,
  },
  AGRICULTURE: {
    category: "AGRICULTURE",
    label: "Farming & agriculture",
    description: "Farm programs, crop insurance, and rural support.",
    icon: "🌾",
    featuredOnHome: true,
  },
  TRANSPORTATION: {
    category: "TRANSPORTATION",
    label: "Transportation",
    description: "Rides, transit, and help getting where you need to go.",
    icon: "🚌",
    featuredOnHome: false,
  },
  TAXES: {
    category: "TAXES",
    label: "Tax help",
    description: "Free tax filing help and tax credit information.",
    icon: "🧾",
    featuredOnHome: false,
  },
  VOTING: {
    category: "VOTING",
    label: "Voting & elections",
    description: "Register to vote and find your polling place.",
    icon: "🗳️",
    featuredOnHome: false,
  },
  CHILD_FAMILY: {
    category: "CHILD_FAMILY",
    label: "Children & family",
    description: "Child care, family support, and youth programs.",
    icon: "👨‍👩‍👧",
    featuredOnHome: true,
  },
  MENTAL_HEALTH: {
    category: "MENTAL_HEALTH",
    label: "Mental health",
    description: "Counseling, crisis support, and mental health care.",
    icon: "💬",
    featuredOnHome: true,
  },
  OTHER: {
    category: "OTHER",
    label: "Something else",
    description: "Not sure which category fits? We can still help.",
    icon: "❓",
    featuredOnHome: false,
  },
};

export const HOME_CATEGORY_TILES = Object.values(CATEGORY_META).filter(
  (c) => c.featuredOnHome
);
