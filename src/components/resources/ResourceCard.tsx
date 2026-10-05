import { Link } from "react-router-dom";
import type { CivicResource } from "@/lib/resourceTypes";
import { CHANNEL_ICON, CHANNEL_LABEL, CHANNEL_ORDER, STATEWIDE } from "@/lib/resourceTypes";
import { languageLabel } from "@/lib/resourceTypes";
import { resourcesStrings as S, fmt } from "@/i18n/en/resources";
import { CategoryBadge } from "./CategoryBadge";
import { SaveButton } from "@/components/account/SaveButton";

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

export function ResourceCard({ resource }: { resource: CivicResource }) {
  const isStatewide = resource.counties.includes(STATEWIDE);
  const channels = CHANNEL_ORDER.filter((c) => resource.channels.includes(c));
  const nonEnglish = resource.languages.filter((l) => l !== "en");

  return (
    <li>
      <article className="flex h-full flex-col rounded-xl border border-ink-900/10 bg-surface p-5 shadow-sm focus-within:border-primary-600 hover:border-primary-600 hover:shadow-md">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <CategoryBadge category={resource.category} />
          <span className="text-xs font-medium text-ink-500">
            {resource.agency}
          </span>
        </div>

        <h3 className="text-lg font-bold text-ink-900">
          <Link
            to={`/resources/${resource.slug}`}
            className="text-ink-900 no-underline hover:text-primary-700 hover:underline"
          >
            {resource.name}
          </Link>
        </h3>

        <p className="mt-1.5 text-ink-700">{resource.summary}</p>

        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-700">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{S.facets.channel}</dt>
            <dd className="flex flex-wrap gap-x-3">
              {channels.map((c) => (
                <span key={c} className="inline-flex items-center gap-1">
                  <span aria-hidden="true">{CHANNEL_ICON[c]}</span>
                  {CHANNEL_LABEL[c]}
                </span>
              ))}
            </dd>
          </div>
          {isStatewide && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">{S.facets.county}</dt>
              <dd>{S.card.servesYourArea}</dd>
            </div>
          )}
          {nonEnglish.length > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">{S.facets.language}</dt>
              <dd>
                {["English", ...nonEnglish.map(languageLabel)].join(", ")}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <p className="text-xs text-ink-500">
            {fmt(S.card.lastVerified, {
              date: formatVerified(resource.lastVerified),
            })}
          </p>
          <div className="flex items-center gap-2">
          <SaveButton slug={resource.slug} name={resource.name} />
          <Link
            to={`/resources/${resource.slug}`}
            className="whitespace-nowrap rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-primary-700"
          >
            {S.card.viewDetails}
            <span className="sr-only">: {resource.name}</span>
          </Link>
          </div>
        </div>
      </article>
    </li>
  );
}
