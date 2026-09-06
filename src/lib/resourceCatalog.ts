import type { Schema } from "../../amplify/data/resource";
import { isBackendLive } from "@/lib/amplify";
import type { ResourceCategory } from "@/lib/categories";
import type {
  CivicResource,
  ResourceChannel,
  ResourceLevel,
} from "@/lib/resourceTypes";
import { STATEWIDE } from "@/lib/resourceTypes";
import { RESOURCE_SEED } from "@/data/resources.seed";

/**
 * Data-access layer for the resource catalog.
 *
 * The rest of the app calls `loadResources()` and gets back a
 * `CivicResource[]` — it never has to know whether the data came from a
 * deployed AppSync/DynamoDB backend or the bundled seed file. When
 * `isBackendLive()` is false (no `amplify_outputs.json` yet, i.e.
 * offline/demo mode), or a live query fails, we serve the seed so the
 * directory always works.
 *
 * The results are memoised for the session — the catalog is small and
 * changes rarely.
 */

let cache: Promise<CivicResource[]> | null = null;

export function loadResources(): Promise<CivicResource[]> {
  if (!cache) {
    cache = isBackendLive() ? fetchFromBackend() : Promise.resolve(RESOURCE_SEED);
  }
  return cache;
}

/** Test/HMR helper — forget the memoised catalog. */
export function resetResourceCache(): void {
  cache = null;
}

export async function getResourceBySlug(
  slug: string,
): Promise<CivicResource | undefined> {
  const all = await loadResources();
  return all.find((r) => r.slug === slug);
}

/**
 * Other resources a visitor on a detail page is likely to also want:
 * same category first, then anything that shares a county, de-duplicated
 * and excluding the current resource.
 */
export function getRelatedResources(
  resource: CivicResource,
  all: CivicResource[],
  limit = 3,
): CivicResource[] {
  const others = all.filter((r) => r.slug !== resource.slug);
  const sameCategory = others.filter((r) => r.category === resource.category);
  // Only a *specific* shared county counts as "nearby" — the STATEWIDE
  // sentinel is on most records and would otherwise match everything.
  const localCounties = resource.counties.filter((c) => c !== STATEWIDE);
  const sharesCounty = others.filter(
    (r) =>
      !sameCategory.includes(r) &&
      r.counties.some((c) => c !== STATEWIDE && localCounties.includes(c)),
  );
  return [...sameCategory, ...sharesCounty].slice(0, limit);
}

// ───────────────────────────── live backend ─────────────────────────────

async function fetchFromBackend(): Promise<CivicResource[]> {
  try {
    // Imported lazily so the aws-amplify/data client isn't pulled into
    // the initial bundle for offline-mode visitors.
    const { generateClient } = await import("aws-amplify/data");
    const client = generateClient<Schema>();
    const { data, errors } = await client.models.Resource.list({
      // Public read path — see amplify/data/resource.ts authorization.
      authMode: "apiKey",
    });
    if (errors?.length) {
      console.warn("[resourceCatalog] AppSync returned errors, using seed:", errors);
      return RESOURCE_SEED;
    }
    if (!data?.length) return RESOURCE_SEED;
    return data.map(mapRow);
  } catch (err) {
    console.warn(
      "[resourceCatalog] live fetch failed, falling back to seed data:",
      err,
    );
    return RESOURCE_SEED;
  }
}

type ResourceRow = Schema["Resource"]["type"];

/** Normalise a raw AppSync row into the app's `CivicResource` shape. */
function mapRow(row: ResourceRow): CivicResource {
  const strings = (xs: readonly (string | null)[] | null | undefined): string[] =>
    (xs ?? []).filter((x): x is string => typeof x === "string");

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    category: (row.category ?? "OTHER") as ResourceCategory,
    level: (row.level ?? "STATE") as ResourceLevel,
    agency: row.agency,
    eligibilitySummary: row.eligibilitySummary,
    eligibilityTags: strings(row.eligibilityTags),
    counties: strings(row.counties),
    channels: strings(row.channels) as ResourceChannel[],
    phone: row.phone ?? undefined,
    url: row.url,
    applicationUrl: row.applicationUrl ?? undefined,
    languages: strings(row.languages),
    lastVerified: String(row.lastVerified ?? ""),
    keywords: strings(row.keywords),
  };
}
