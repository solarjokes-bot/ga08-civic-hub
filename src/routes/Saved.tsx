import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "@/lib/account/context";
import { useSavedServices } from "@/lib/account/context";
import { useResources } from "@/lib/useResources";
import { accountStrings as S } from "@/i18n/en/account";
import { fmt } from "@/i18n/en/resources";
import { ResourceCard } from "@/components/resources/ResourceCard";

/**
 * The signed-in visitor's saved services.
 *
 * Saved rows store only a catalog slug, so the cards here are rendered
 * from the live catalog — a saved item always shows currently verified
 * details rather than a snapshot taken when it was saved. A slug that no
 * longer exists is dropped silently rather than rendered as a broken card.
 */
export default function Saved() {
  const { status } = useAccount();
  const { saved, loading } = useSavedServices();
  const { resources } = useResources();

  const cards = useMemo(() => {
    const bySlug = new Map(resources.map((r) => [r.slug, r]));
    return saved
      .map((s) => bySlug.get(s.resourceSlug))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
  }, [saved, resources]);

  if (status === "unavailable") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-ink-900">{S.saved.title}</h1>
        <p className="mt-3 rounded-lg bg-warning-bg px-4 py-3 text-warning-text">
          {S.unavailable}
        </p>
      </div>
    );
  }

  if (status !== "signedIn") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-ink-900">{S.saved.title}</h1>
        <p className="mt-3 text-ink-700">{S.saved.signedOut}</p>
        <Link
          to="/account"
          className="mt-5 inline-block rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white no-underline hover:bg-primary-700"
        >
          {S.nav.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">{S.saved.title}</h1>

      <p className="mt-2 text-ink-700" aria-live="polite">
        {loading
          ? "Loading your saved services…"
          : fmt(
              cards.length === 1 ? S.saved.count_one : S.saved.count_other,
              { count: cards.length },
            )}
      </p>

      {!loading && cards.length === 0 && (
        <div className="mt-8 rounded-xl border border-ink-900/10 bg-surface p-8 text-center">
          <p className="text-ink-700">{S.saved.empty}</p>
          <Link
            to="/resources"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white no-underline hover:bg-primary-700"
          >
            {S.saved.emptyCta}
          </Link>
        </div>
      )}

      {cards.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {cards.map((r) => (
            <ResourceCard key={r.slug} resource={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
