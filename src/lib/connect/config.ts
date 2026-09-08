/**
 * Amazon Connect frontend configuration (Phase 4).
 *
 * Everything here is PUBLIC (Vite `VITE_*` env vars). No AWS credentials
 * and no secrets — starting a contact goes through the `startSupportContact`
 * backend mutation, which holds the credentials. These flags only decide
 * whether the UI *offers* chat/voice, so it never advertises a capability
 * that isn't wired up yet.
 *
 * Values are read at call time (not snapshotted at import) so tests can
 * vary them with `vi.stubEnv`.
 *
 * See `.env.example` and docs/connect-setup.md.
 */

function env(key: string): string {
  const v = (import.meta.env as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}
function flag(key: string): boolean {
  return env(key).toLowerCase() === "true";
}

export function connectRegion(): string {
  return env("VITE_CONNECT_REGION") || "us-east-1";
}

export function hostedWidgetConfig(): { snippetId: string; scriptUrl: string } {
  return {
    snippetId: env("VITE_CONNECT_HOSTED_WIDGET_SNIPPET_ID"),
    scriptUrl: env("VITE_CONNECT_HOSTED_WIDGET_URL"),
  };
}

export type ChatMode = "custom" | "hosted" | "off";

export function chatMode(): ChatMode {
  const { snippetId, scriptUrl } = hostedWidgetConfig();
  if (flag("VITE_CONNECT_USE_HOSTED_WIDGET") && snippetId && scriptUrl) {
    return "hosted";
  }
  if (flag("VITE_CONNECT_CHAT_ENABLED")) return "custom";
  return "off";
}

export function voiceOffered(): boolean {
  return flag("VITE_CONNECT_VOICE_ENABLED");
}

/** Back-compat object for components that read a few fields directly. */
export const connectConfig = {
  get region() {
    return connectRegion();
  },
  get hostedWidget() {
    return hostedWidgetConfig();
  },
};

/**
 * There are no staffed hours: this is AI self-service, available whenever
 * the site is. The Connect instance still has an hours-of-operation record
 * (the contact flow requires one), but nothing routes to a human, so the
 * UI must not advertise agent availability.
 */
export const SUPPORT_AVAILABILITY = "Available any time, day or night";
