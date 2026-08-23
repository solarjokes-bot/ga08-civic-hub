interface ComingSoonProps {
  title: string;
  phase: string;
  description: string;
}

/**
 * Placeholder for routes whose real implementation lands in a later
 * build phase (see README.md "Build order"). Keeps the site's
 * information architecture and navigation fully in place — and every
 * route reachable and screen-reader friendly — from Phase 1 onward,
 * without faking data or features that don't exist yet.
 */
export default function ComingSoon({ title, phase, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="mb-2 inline-block rounded-full bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700">
        {phase}
      </p>
      <h1 className="text-3xl font-bold text-ink-900">{title}</h1>
      <p className="mt-4 text-lg text-ink-700">{description}</p>
    </div>
  );
}
