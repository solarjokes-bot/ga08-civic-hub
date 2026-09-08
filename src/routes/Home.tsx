import { Link } from "react-router-dom";
import { HOME_CATEGORY_TILES } from "@/lib/categories";

export default function Home() {
  return (
    <div>
      <section className="bg-primary-600 px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-semibold">
            Public and government services across Georgia
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            Find help. Fast, free, and in plain language.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-50">
            Search public and government resources across Georgia, or let
            our guide ask a few quick questions and point you in the right
            direction.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/resources"
              className="rounded-lg bg-white px-6 py-4 text-lg font-bold text-primary-700 no-underline shadow-sm hover:bg-primary-50"
            >
              🔎 Find a Resource
            </Link>
            <Link
              to="/guide"
              className="rounded-lg border-2 border-white px-6 py-4 text-lg font-bold text-white no-underline hover:bg-white/10"
            >
              🧭 Not sure what you need? Ask our guide
            </Link>
          </div>

          <p className="mt-6 text-sm text-primary-50">
            Prefer to ask a question?{" "}
            <Link to="/help" className="text-white underline">
              Chat or call our guide for free
            </Link>{" "}
            — no phone dialing required.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="quick-categories-heading"
        className="mx-auto max-w-6xl px-4 py-12"
      >
        <h2
          id="quick-categories-heading"
          className="mb-6 text-2xl font-bold text-ink-900"
        >
          What do you need help with?
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {HOME_CATEGORY_TILES.map((tile) => (
            <li key={tile.category}>
              <Link
                to={`/resources?category=${tile.category}`}
                className="flex h-full flex-col gap-1 rounded-xl border border-ink-900/10 bg-surface p-4 no-underline shadow-sm hover:border-primary-600 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden="true">
                  {tile.icon}
                </span>
                <span className="font-semibold text-ink-900">
                  {tile.label}
                </span>
                <span className="text-sm text-ink-500">
                  {tile.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
