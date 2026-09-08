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

/** Support hours shown on /help. Plain content, not infrastructure. */
export const SUPPORT_HOURS = {
  timezone: "Eastern time",
  weekdays: "Monday to Friday, 8:00 a.m. to 6:00 p.m.",
  weekend: "Closed weekends and federal holidays",
  // // VERIFY: set real staffed hours before launch; the bot answers
  // 24/7 but a live person is only available during these hours.
} as const;
