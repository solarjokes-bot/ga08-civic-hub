import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount, SavedContext, type SavedValue } from "@/lib/account/context";
import {
  listSavedServices,
  saveService,
  unsaveService,
  type SavedService,
} from "@/lib/account/savedServices";

/**
 * Holds the signed-in visitor's saved services for the whole app, so a
 * page of resource cards asks the API once rather than once per card.
 * Signed out this is an empty list with `canSave` false, and the save
 * affordance is hidden rather than shown-and-broken.
 */
export function SavedServicesProvider({ children }: { children: ReactNode }) {
  const { status } = useAccount();
  const [saved, setSaved] = useState<SavedService[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const canSave = status === "signedIn";

  useEffect(() => {
    let active = true;
    if (!canSave) {
      setSaved([]);
      return;
    }
    setLoading(true);
    listSavedServices()
      .then((rows) => {
        if (active) setSaved(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canSave]);

  const isSaved = useCallback(
    (slug: string) => saved.some((s) => s.resourceSlug === slug),
    [saved],
  );

  const toggle = useCallback(
    async (slug: string) => {
      if (!canSave || pending) return;
      setPending(slug);
      try {
        const existing = saved.find((s) => s.resourceSlug === slug);
        if (existing) {
          // Optimistic removal; put it back if the write fails.
          setSaved((prev) => prev.filter((s) => s.id !== existing.id));
          const ok = await unsaveService(existing.id);
          if (!ok) setSaved((prev) => [...prev, existing]);
        } else {
          const row = await saveService(slug);
          if (row)
            setSaved((prev) =>
              prev.some((s) => s.id === row.id) ? prev : [...prev, row],
            );
        }
      } finally {
        setPending(null);
      }
    },
    [canSave, pending, saved],
  );

  const value = useMemo<SavedValue>(
    () => ({ saved, loading, canSave, isSaved, toggle, pending }),
    [saved, loading, canSave, isSaved, toggle, pending],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}
