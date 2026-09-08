/**
 * Anonymous session id for a guided-triage run. No PII, not tied to any
 * account — used only to group the analytics summary. Import-light so the
 * Lambda can use it too.
 */
export function makeSessionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to the non-crypto id below */
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
