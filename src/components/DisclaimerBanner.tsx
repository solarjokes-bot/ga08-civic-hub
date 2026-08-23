/**
 * Persistent, unmissable disclaimer per project trust requirements: this
 * is an unofficial informational tool unless/until officially sanctioned
 * by Rep. Scott's office. It is NOT a chrome/toast that can be dismissed
 * forever — it stays in the page flow on every screen.
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
      resources in Georgia&apos;s 8th District. It is not run by
      Rep.&nbsp;Austin Scott&apos;s office. Always confirm details with the
      official agency before you rely on them.
    </div>
  );
}
