import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-3 text-ink-700">
        We couldn&apos;t find that page. Try searching the resource
        directory, or go back home.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          to="/"
          className="rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white no-underline hover:bg-primary-700"
        >
          Go home
        </Link>
        <Link
          to="/resources"
          className="rounded-lg border-2 border-primary-600 px-5 py-3 font-semibold text-primary-700 no-underline hover:bg-primary-50"
        >
          Find a resource
        </Link>
      </div>
    </div>
  );
}
