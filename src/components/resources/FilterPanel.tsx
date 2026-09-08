import { useId } from "react";
import { CATEGORY_META } from "@/lib/categories";
import type { ResourceCategory } from "@/lib/categories";
import {
  CHANNEL_LABEL,
  CHANNEL_ORDER,
  LANGUAGE_LABEL,
} from "@/lib/resourceTypes";
import type { ResourceChannel } from "@/lib/resourceTypes";
import {
  type ResourceFilterState,
  type FacetCounts,
  hasActiveFilters,
  toggleValue,
} from "@/lib/resourceFilters";
import {
  COUNTY_FILTER_OPTIONS,
  OUTSIDE_GEORGIA,
} from "@/data/georgiaCounties";
import { ELIGIBILITY_TAGS } from "@/data/eligibilityTags";
import { resourcesStrings as S } from "@/i18n/en/resources";

interface FilterPanelProps {
  filters: ResourceFilterState;
  facetCounts: FacetCounts;
  onChange: (next: ResourceFilterState) => void;
  onClearAll: () => void;
}

interface OptionRowProps {
  name: string;
  value: string;
  label: string;
  hint?: string;
  count: number | undefined;
  checked: boolean;
  onToggle: () => void;
}

function OptionRow({
  name,
  value,
  label,
  hint,
  count,
  checked,
  onToggle,
}: OptionRowProps) {
  const id = `${name}-${value}`;
  const n = count ?? 0;
  const disabled = n === 0 && !checked;
  return (
    <li>
      <label
        htmlFor={id}
        className={[
          "flex items-start gap-2 rounded-md px-1.5 py-1 text-sm",
          disabled ? "text-ink-500" : "text-ink-900",
          "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary-600",
        ].join(" ")}
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
        />
        <span className="flex-1">
          <span className="font-medium">{label}</span>{" "}
          <span className="text-ink-500">({n})</span>
          {hint && (
            <span className="block text-xs font-normal text-ink-500">
              {hint}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}

export function FilterPanel({
  filters,
  facetCounts,
  onChange,
  onClearAll,
}: FilterPanelProps) {
  const countyListId = useId();

  const set = (patch: Partial<ResourceFilterState>) =>
    onChange({ ...filters, ...patch });

  const languageCodes = Object.keys(LANGUAGE_LABEL).filter(
    (code) => code !== "en" || (facetCounts.languages["en"] ?? 0) > 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">
          {S.directory.filtersHeading}
        </h2>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-md px-2 py-1 text-sm font-semibold text-primary-700 underline hover:text-primary-900"
          >
            {S.directory.clearAllShort}
          </button>
        )}
      </div>

      {/* Category */}
      <fieldset className="border-0 p-0">
        <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-700">
          {S.facets.category}
        </legend>
        <ul className="space-y-0.5">
          {Object.values(CATEGORY_META).map((meta) => (
            <OptionRow
              key={meta.category}
              name="category"
              value={meta.category}
              label={meta.label}
              count={facetCounts.categories[meta.category]}
              checked={filters.categories.includes(meta.category)}
              onToggle={() =>
                set({
                  categories: toggleValue<ResourceCategory>(
                    filters.categories,
                    meta.category,
                  ),
                })
              }
            />
          ))}
        </ul>
      </fieldset>

      {/* Who it's for */}
      <fieldset className="border-0 p-0">
        <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-700">
          {S.facets.eligibility}
        </legend>
        <ul className="space-y-0.5">
          {ELIGIBILITY_TAGS.map((tag) => (
            <OptionRow
              key={tag.key}
              name="for"
              value={tag.key}
              label={tag.label}
              hint={tag.hint}
              count={facetCounts.eligibilityTags[tag.key]}
              checked={filters.eligibilityTags.includes(tag.key)}
              onToggle={() =>
                set({
                  eligibilityTags: toggleValue(
                    filters.eligibilityTags,
                    tag.key,
                  ),
                })
              }
            />
          ))}
        </ul>
      </fieldset>

      {/* How you get help */}
      <fieldset className="border-0 p-0">
        <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-700">
          {S.facets.channel}
        </legend>
        <ul className="space-y-0.5">
          {CHANNEL_ORDER.map((ch) => (
            <OptionRow
              key={ch}
              name="channel"
              value={ch}
              label={CHANNEL_LABEL[ch]}
              count={facetCounts.channels[ch]}
              checked={filters.channels.includes(ch)}
              onToggle={() =>
                set({
                  channels: toggleValue<ResourceChannel>(filters.channels, ch),
                })
              }
            />
          ))}
        </ul>
      </fieldset>

      {/* Language */}
      {languageCodes.length > 0 && (
        <fieldset className="border-0 p-0">
          <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-700">
            {S.facets.language}
          </legend>
          <ul className="space-y-0.5">
            {languageCodes.map((code) => (
              <OptionRow
                key={code}
                name="lang"
                value={code}
                label={LANGUAGE_LABEL[code]}
                count={facetCounts.languages[code]}
                checked={filters.languages.includes(code)}
                onToggle={() =>
                  set({ languages: toggleValue(filters.languages, code) })
                }
              />
            ))}
          </ul>
        </fieldset>
      )}

      {/*
        County is a dropdown, not a checkbox list. Georgia has 159
        counties: rendering them as checkboxes put ~160 inputs in the DOM
        and made every keystroke in the search box recompute a per-county
        tally across the whole catalog, which was measurably slow — bad
        for the low-bandwidth, older-device audience this site targets.
        A single select is lighter, far better on mobile, and matches the
        county picker the /guide wizard already uses. `filters.counties`
        stays an array so URL round-tripping is unchanged.
      */}
      <div>
        <label
          htmlFor={countyListId}
          className="mb-1 block text-sm font-bold uppercase tracking-wide text-ink-700"
        >
          {S.facets.county}
        </label>
        <select
          id={countyListId}
          value={filters.counties[0] ?? ""}
          onChange={(e) =>
            set({ counties: e.target.value ? [e.target.value] : [] })
          }
          className="w-full rounded-md border border-ink-900/20 bg-surface px-3 py-2 text-sm"
        >
          <option value="">{S.facets.countyAny}</option>
          {COUNTY_FILTER_OPTIONS.map((county) => (
            <option key={county} value={county}>
              {county === OUTSIDE_GEORGIA ? county : `${county} County`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
