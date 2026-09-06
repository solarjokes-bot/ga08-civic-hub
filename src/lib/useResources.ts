import { useEffect, useState } from "react";
import type { CivicResource } from "@/lib/resourceTypes";
import { loadResources } from "@/lib/resourceCatalog";

interface UseResourcesResult {
  resources: CivicResource[];
  loading: boolean;
  error: boolean;
}

/**
 * Load the resource catalog (from the live backend or the bundled seed —
 * see resourceCatalog.ts) with simple loading/error state. The catalog
 * is memoised in resourceCatalog.ts, so mounting several consumers only
 * triggers one fetch.
 */
export function useResources(): UseResourcesResult {
  const [resources, setResources] = useState<CivicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadResources()
      .then((data) => {
        if (!active) return;
        setResources(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { resources, loading, error };
}
