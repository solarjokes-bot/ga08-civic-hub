/**
 * Persistent, unmissable disclaimer per project trust requirements: this
 * is an unofficial informational tool, not run by any government agency.
 * It is NOT a chrome/toast that can be dismissed forever — it stays in the
 * page flow on every screen.
 */
export function DisclaimerBanner() {
  return (
    <div
      role="note"
      aria-label="Site disclaimer"
      className="px-4 py-2 text-center text-sm"
      style={{
        backgroundColor: "var(--color-warning-bg)",
        color: "var(--color-warning-text)",
        borderBottom: "1px solid color-mix(in srgb, var(--color-warning-text) 20%, transparent)",
      }}
    >
      This is an <strong>unofficial, informational</strong> guide to public
      resources in Georgia. It is not run by any government agency. Always
      confirm details with the official agency before you rely on them.
    </div>
  );
}
