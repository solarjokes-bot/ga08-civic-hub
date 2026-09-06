import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResources } from "@/lib/useResources";
import {
  computeFacetCounts,
  countActiveFilters,
  filterResources,
  filtersFromSearchParams,
  filtersToSearchParams,
  type ResourceFilterState,
} from "@/lib/resourceFilters";
import { resourcesStrings as S, pluralResults } from "@/i18n/en/resources";
import { FilterPanel } from "@/components/resources/FilterPanel";
import { ActiveFilterChips } from "@/components/resources/ActiveFilterChips";
import { ResourceCard } from "@/components/resources/ResourceCard";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { resources, loading, error } = useResources();
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const applyFilters = (next: ResourceFilterState) => {
    setSearchParams(filtersToSearchParams(next), { replace: true });
  };
  const clearAll = () => setSearchParams(new URLSearchParams(), { replace: true });

  const results = useMemo(
    () => filterResources(resources, filters),
    [resources, filters],
  );
  const facetCounts = useMemo(
    () => computeFacetCounts(resources, filters),
    [resources, filters],
  );

  // Announce the result count politely after the list settles, without
  // stealing focus. The count text itself lives in an aria-live region.
  const [announce, setAnnounce] = useState("");
  useEffect(() => {
    if (loading) return;
    setAnnounce(pluralResults(results.length));
  }, [results.length, loading]);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <a href="#results" className="skip-link">
        {S.directory.skipToResults}
      </a>

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-ink-900">
          {S.directory.title}
        </h1>
        <p className="mt-2 text-ink-700">{S.directory.intro}</p>
      </header>

      {/* Search box */}
      <div className="mt-6 max-w-xl">
        <label
          htmlFor="resource-search"
          className="block text-sm font-semibold text-ink-900"
        >
          {S.directory.searchLabel}
        </label>
        <input
          id="resource-search"
          type="search"
          value={filters.q}
          onChange={(e) => applyFilters({ ...filters, q: e.target.value })}
          placeholder={S.directory.searchPlaceholder}
          className="mt-1 w-full rounded-lg border border-ink-900/20 bg-surface px-4 py-2.5 text-base shadow-sm placeholder:text-ink-500"
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        {/* Filters */}
        <aside aria-label={S.directory.filtersHeading}>
          <button
            type="button"
            className="mb-3 w-full rounded-lg border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 lg:hidden"
            aria-expanded={showFiltersMobile}
            aria-controls="filter-panel"
            onClick={() => setShowFiltersMobile((v) => !v)}
          >
            {showFiltersMobile
              ? S.directory.hideFilters
              : S.directory.showFilters}
            {activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <div
            id="filter-panel"
            className={cx(
              "rounded-xl border border-ink-900/10 bg-surface p-4 lg:block",
              showFiltersMobile ? "block" : "hidden",
            )}
          >
            <FilterPanel
              filters={filters}
              facetCounts={facetCounts}
              onChange={applyFilters}
              onClearAll={clearAll}
            />
          </div>
        </aside>

        {/* Results */}
        <div>
          <div
            id="results"
            tabIndex={-1}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            {/*
              Heading doubles as the polite live region so screen readers
              hear the new count after each filter change. `role="status"`
              is intentionally NOT set here — it isn't a valid role on a
              heading; `aria-live` alone gives the announcement.
            */}
            <h2
              className="text-xl font-bold text-ink-900"
              aria-live="polite"
              aria-atomic="true"
            >
              {loading ? "Loading resources…" : announce}
            </h2>
            <p className="text-sm text-ink-500">
              {filters.q.trim()
                ? S.directory.sortNote
                : S.directory.sortNoteAlpha}
            </p>
          </div>

          {activeCount > 0 && (
            <div className="mt-3">
              <ActiveFilterChips
                filters={filters}
                onChange={applyFilters}
                onClearAll={clearAll}
              />
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-lg bg-warning-bg px-4 py-3 text-warning-text">
              Something went wrong loading the directory. Please refresh, or{" "}
              <Link to="/help">chat or call for help</Link>.
            </p>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="mt-8 rounded-xl border border-ink-900/10 bg-surface p-8 text-center">
              <h3 className="text-lg font-bold text-ink-900">
                {S.directory.noResultsTitle}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-ink-700">
                {S.directory.noResultsBody}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50"
                >
                  {S.directory.clearAll}
                </button>
                <Link
                  to="/help"
                  className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white no-underline hover:bg-primary-700"
                >
                  Chat or call for help
                </Link>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {results.map((r) => (
                <ResourceCard key={r.slug} resource={r} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
