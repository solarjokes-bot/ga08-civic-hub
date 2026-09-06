import type { ResourceCategory } from "@/lib/categories";
import { CATEGORY_META } from "@/lib/categories";

/**
 * Small category pill. The emoji is decorative (aria-hidden) and always
 * sits next to the text label, per the accessibility rules.
 */
export function CategoryBadge({ category }: { category: ResourceCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  );
}
