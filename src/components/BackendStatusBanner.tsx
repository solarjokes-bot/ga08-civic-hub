import { isBackendLive } from "@/lib/amplify";

/**
 * Dev-only notice so it's obvious when you're looking at the app without
 * a deployed Amplify backend (i.e. amplify_outputs.json is still the
 * checked-in placeholder). Never shown in a production build — once you
 * deploy, `npm run amplify:generate` overwrites amplify_outputs.json and
 * this disappears on its own.
 */
export function BackendStatusBanner() {
  if (import.meta.env.PROD || isBackendLive()) return null;

  return (
    <div
      role="status"
      className="bg-ink-900 px-4 py-1.5 text-center text-xs text-white"
    >
      Dev mode: no Amplify backend deployed yet. Run{" "}
      <code className="rounded bg-white/10 px-1 py-0.5">npm run sandbox</code>{" "}
      to connect live data.
    </div>
  );
}
