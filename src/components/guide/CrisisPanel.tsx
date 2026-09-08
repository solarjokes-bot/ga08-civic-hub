import type { TriageRecommendation } from "@/lib/guidedTriage/types";
import { guideStrings as S } from "@/i18n/en/guide";

/**
 * Shown instead of the normal results when the safety screen (or the
 * model) detects distress. Warm, brief, no counseling — just the fastest
 * routes to a real person. Rendered with an assertive live region so a
 * screen reader announces it immediately.
 */
export function CrisisPanel({
  message,
  resources,
  onSeeResources,
}: {
  message: string;
  resources: TriageRecommendation[];
  onSeeResources: () => void;
}) {
  return (
    <section
      aria-live="assertive"
      className="rounded-xl border-2 p-6"
      style={{
        borderColor: "var(--color-alert-600)",
        backgroundColor: "color-mix(in srgb, var(--color-alert-600) 6%, white)",
      }}
    >
      <h2 className="text-2xl font-bold" style={{ color: "var(--color-alert-700)" }}>
        {S.crisis.title}
      </h2>
      <p className="mt-2 text-ink-900">{message}</p>

      <ul className="mt-4 space-y-3">
        {resources.map((r) => (
          <li
            key={r.slug}
            className="rounded-lg border border-ink-900/10 bg-surface p-4"
          >
            <h3 className="font-bold text-ink-900">{r.name}</h3>
            <p className="mt-1 text-sm text-ink-700">{r.summary}</p>
            <a
              href={r.nextAction.href}
              className="mt-2 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-primary-700"
            >
              {r.nextAction.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-semibold" style={{ color: "var(--color-alert-700)" }}>
        {S.crisis.call911}
      </p>

      <button
        type="button"
        onClick={onSeeResources}
        className="mt-4 rounded-lg border border-ink-900/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-surface-muted"
      >
        {S.crisis.stillSeeResources}
      </button>
    </section>
  );
}
