import type { Schema } from "../../../amplify/data/resource";

/**
 * Saved-services data access.
 *
 * Every call uses `authMode: "userPool"` because the SavedService model is
 * owner-scoped — rows belong to the signed-in Cognito identity and are
 * invisible to everyone else, including admins. The public API key that
 * serves the rest of the site cannot read or write them.
 */

export interface SavedService {
  id: string;
  resourceSlug: string;
  note?: string;
}

async function client() {
  const { generateClient } = await import("aws-amplify/data");
  return generateClient<Schema>();
}

export async function listSavedServices(): Promise<SavedService[]> {
  const c = await client();
  const { data, errors } = await c.models.SavedService.list({
    authMode: "userPool",
  });
  if (errors?.length) {
    console.warn("[savedServices] list errors:", errors);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    resourceSlug: row.resourceSlug,
    note: row.note ?? undefined,
  }));
}

/** Idempotent: saving something already saved is a no-op, not a duplicate. */
export async function saveService(
  resourceSlug: string,
): Promise<SavedService | null> {
  const existing = await listSavedServices();
  const already = existing.find((s) => s.resourceSlug === resourceSlug);
  if (already) return already;

  const c = await client();
  const { data, errors } = await c.models.SavedService.create(
    { resourceSlug },
    { authMode: "userPool" },
  );
  if (errors?.length || !data) {
    console.warn("[savedServices] create errors:", errors);
    return null;
  }
  return { id: data.id, resourceSlug: data.resourceSlug, note: data.note ?? undefined };
}

export async function unsaveService(id: string): Promise<boolean> {
  const c = await client();
  const { errors } = await c.models.SavedService.delete(
    { id },
    { authMode: "userPool" },
  );
  if (errors?.length) {
    console.warn("[savedServices] delete errors:", errors);
    return false;
  }
  return true;
}
