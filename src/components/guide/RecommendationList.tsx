import { Link } from "react-router-dom";
import type { TriageRecommendation } from "@/lib/guidedTriage/types";
import { guideStrings as S } from "@/i18n/en/guide";
import { CategoryBadge } from "@/components/resources/CategoryBadge";

function ActionButton({
  action,
}: {
  action: TriageRecommendation["nextAction"];
}) {
  const isTel = action.href.startsWith("tel:");
  const className =
    "inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-primary-700";
  if (isTel) {
    return (
      <a href={action.href} className={className}>
        {action.label}
      </a>
    );
  }
  return (
    <a
      href={action.href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {action.label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function RecommendationList({
  recommendations,
}: {
  recommendations: TriageRecommendation[];
}) {
  return (
    <ul className="mt-5 space-y-4">
      {recommendations.map((rec) => (
        <li key={rec.slug}>
          <article className="rounded-xl border border-ink-900/10 bg-surface p-5 shadow-sm">
            <div className="mb-1">
              <CategoryBadge category={rec.category} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">
              <Link
                to={`/resources/${rec.slug}`}
                className="text-ink-900 no-underline hover:text-primary-700 hover:underline"
              >
                {rec.name}
              </Link>
            </h3>
            <p className="mt-1 text-ink-700">{rec.summary}</p>
            <p className="mt-2 rounded-md bg-surface-muted px-3 py-2 text-sm text-ink-700">
              <span className="font-semibold">{S.results.whyThisFits}: </span>
              {rec.rationale}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ActionButton action={rec.nextAction} />
              <Link
                to={`/resources/${rec.slug}`}
                className="text-sm font-semibold"
              >
                Full details
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
