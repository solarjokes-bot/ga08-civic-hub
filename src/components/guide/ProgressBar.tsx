import { guideStrings as S } from "@/i18n/en/guide";
import { fmt } from "@/i18n/en/resources";

/** Accessible step progress for the guided wizard. */
export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((current / Math.max(total, 1)) * 100));
  const label = fmt(S.progress.label, { current, total });
  return (
    <div className="mb-6">
      <p className="mb-1 text-sm font-semibold text-ink-700">{label}</p>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
