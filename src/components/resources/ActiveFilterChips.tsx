import { CATEGORY_META } from "@/lib/categories";
import type { ResourceCategory } from "@/lib/categories";
import { CHANNEL_LABEL, LANGUAGE_LABEL } from "@/lib/resourceTypes";
import type { ResourceChannel } from "@/lib/resourceTypes";
import {
  type ResourceFilterState,
  countActiveFilters,
} from "@/lib/resourceFilters";
import { eligibilityTagLabel } from "@/data/eligibilityTags";
import { ELSEWHERE_IN_GEORGIA } from "@/data/districtCounties";
import { resourcesStrings as S } from "@/i18n/en/resources";

interface Chip {
  key: string;
  label: string;
  remove: () => void;
}

interface ActiveFilterChipsProps {
  filters: ResourceFilterState;
  onChange: (next: ResourceFilterState) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onChange,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (countActiveFilters(filters) === 0) return null;

  const drop = <K extends keyof ResourceFilterState>(
    key: K,
    value: string,
  ) =>
    onChange({
      ...filters,
      [key]: (filters[key] as string[]).filter((v) => v !== value),
    });

  const chips: Chip[] = [];

  if (filters.q.trim()) {
    chips.push({
      key: "q",
      label: `“${filters.q.trim()}”`,
      remove: () => onChange({ ...filters, q: "" }),
    });
  }
  for (const c of filters.categories) {
    chips.push({
      key: `category-${c}`,
      label: CATEGORY_META[c as ResourceCategory].label,
      remove: () => drop("categories", c),
    });
  }
  for (const t of filters.eligibilityTags) {
    chips.push({
      key: `for-${t}`,
      label: eligibilityTagLabel(t),
      remove: () => drop("eligibilityTags", t),
    });
  }
  for (const ch of filters.channels) {
    chips.push({
      key: `channel-${ch}`,
      label: CHANNEL_LABEL[ch as ResourceChannel],
      remove: () => drop("channels", ch),
    });
  }
  for (const l of filters.languages) {
    chips.push({
      key: `lang-${l}`,
      label: LANGUAGE_LABEL[l] ?? l.toUpperCase(),
      remove: () => drop("languages", l),
    });
  }
  for (const county of filters.counties) {
    chips.push({
      key: `county-${county}`,
      label:
        county === ELSEWHERE_IN_GEORGIA ? county : `${county} County`,
      remove: () => drop("counties", county),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-ink-700">
        {S.directory.activeFiltersLabel}:
      </span>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={chip.remove}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-600 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              <span className="sr-only">{S.directory.removeFilter}: </span>
              <span>{chip.label}</span>
              <span aria-hidden="true" className="text-base leading-none">
                ×
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-md px-2 py-1 text-sm font-semibold text-primary-700 underline hover:text-primary-900"
      >
        {S.directory.clearAll}
      </button>
    </div>
  );
}
