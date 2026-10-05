import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useResources } from "@/lib/useResources";
import { getRelatedResources } from "@/lib/resourceCatalog";
import {
  CHANNEL_ICON,
  CHANNEL_LABEL,
  CHANNEL_ORDER,
  LEVEL_LABEL,
  STATEWIDE,
  languageLabel,
} from "@/lib/resourceTypes";
import { eligibilityTagLabel } from "@/data/eligibilityTags";
import { resourcesStrings as S, fmt } from "@/i18n/en/resources";
import { CategoryBadge } from "@/components/resources/CategoryBadge";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { SaveButton } from "@/components/account/SaveButton";

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

function formatVerified(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { resources, loading, error } = useResources();

  const resource = useMemo(
    () => resources.find((r) => r.slug === slug),
    [resources, slug],
  );
  const related = useMemo(
    () => (resource ? getRelatedResources(resource, resources) : []),
    [resource, resources],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16" role="status">
        Loading…
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-ink-900">
          {S.detail.notFoundTitle}
        </h1>
        <p className="mt-3 text-ink-700">{S.detail.notFoundBody}</p>
        <Link
          to="/resources"
          className="mt-6 inline-block rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white no-underline hover:bg-primary-700"
        >
          {S.directory.title}
        </Link>
      </div>
    );
  }

  const channels = CHANNEL_ORDER.filter((c) => resource.channels.includes(c));
  const isStatewide = resource.counties.includes(STATEWIDE);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/resources" className="text-sm font-semibold">
        {S.detail.backToDirectory}
      </Link>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={resource.category} />
          <span className="text-sm text-ink-500">
            {LEVEL_LABEL[resource.level]}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">
          {resource.name}
        </h1>
        <p className="mt-1 text-sm font-medium text-ink-500">
          Run by {resource.agency}
        </p>
        <p className="mt-3 text-lg text-ink-700">{resource.summary}</p>
      </header>

      {/* Primary actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SaveButton slug={resource.slug} name={resource.name} className="px-5 py-3 text-base" />
        {resource.applicationUrl && (
          <a
            href={resource.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white no-underline hover:bg-primary-700"
          >
            {S.detail.applyNow}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border-2 border-primary-600 px-5 py-3 font-semibold text-primary-700 no-underline hover:bg-primary-50"
        >
          {S.detail.officialSite}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {resource.phone && (
          <a
            href={telHref(resource.phone)}
            className="rounded-lg border-2 border-primary-600 px-5 py-3 font-semibold text-primary-700 no-underline hover:bg-primary-50"
          >
            {fmt(S.detail.callLabel, { phone: resource.phone })}
          </a>
        )}
      </div>

      <div className="prose-block mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-ink-900">
            {S.detail.whatItIs}
          </h2>
          <p className="mt-2 text-ink-700">{resource.description}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900">
            {S.detail.whoQualifies}
          </h2>
          <p className="mt-2 text-ink-700">{resource.eligibilitySummary}</p>
          {resource.eligibilityTags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {resource.eligibilityTags.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-surface-muted px-3 py-1 text-sm text-ink-700"
                >
                  {eligibilityTagLabel(t)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900">
            {S.detail.howToApply}
          </h2>
          <ul className="mt-2 space-y-1 text-ink-700">
            {channels.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span aria-hidden="true">{CHANNEL_ICON[c]}</span>
                {CHANNEL_LABEL[c]}
              </li>
            ))}
          </ul>
          {resource.phone && (
            <p className="mt-2 text-ink-700">
              Phone:{" "}
              <a href={telHref(resource.phone)}>{resource.phone}</a>
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900">
            {S.detail.countiesServed}
          </h2>
          {isStatewide ? (
            <p className="mt-2 text-ink-700">{S.detail.statewide}</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {resource.counties.map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-surface-muted px-3 py-1 text-sm text-ink-700"
                >
                  {c} County
                </li>
              ))}
            </ul>
          )}
        </section>

        {resource.languages.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-ink-900">
              {S.detail.languages}
            </h2>
            <p className="mt-2 text-ink-700">
              {resource.languages.map(languageLabel).join(", ")}
            </p>
          </section>
        )}
      </div>

      <p className="mt-8 rounded-lg bg-surface-muted px-4 py-3 text-sm text-ink-700">
        {fmt(S.detail.lastVerifiedLong, {
          date: formatVerified(resource.lastVerified),
        })}
      </p>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink-900">
            {S.detail.related}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
