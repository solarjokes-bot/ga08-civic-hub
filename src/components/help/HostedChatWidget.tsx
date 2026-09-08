import { useEffect } from "react";
import { connectConfig } from "@/lib/connect/config";

/**
 * Fallback: the hosted Amazon Connect communications widget.
 *
 * Used instead of the custom <ChatLauncher> when
 * `VITE_CONNECT_USE_HOSTED_WIDGET=true` and the snippet id + script URL
 * are set (see `.env.example`). The custom widget is preferred because it
 * matches the site's styling and accessibility work; this exists so a
 * deployer can switch to the zero-code hosted widget with one env var.
 *
 * The snippet is the one Amazon Connect generates under
 * Communications widgets → Get widget script. We only inject it when
 * configured, and remove it on unmount.
 */
export function HostedChatWidget() {
  const { snippetId, scriptUrl } = connectConfig.hostedWidget;

  useEffect(() => {
    if (!snippetId || !scriptUrl) return;

    type AcFn = ((...args: unknown[]) => void) & { ac?: unknown[] };
    const w = window as unknown as { amazon_connect?: AcFn };

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.id = "amazon-connect-hosted-widget";
    document.head.appendChild(script);

    let ac = w.amazon_connect;
    if (!ac) {
      const fn: AcFn = (...args: unknown[]) => {
        (fn.ac = fn.ac ?? []).push(args);
      };
      fn.ac = [];
      w.amazon_connect = fn;
      ac = fn;
    }
    ac("snippetId", snippetId);
    ac("supportedMessagingContentTypes", ["text/plain", "text/markdown"]);

    return () => {
      document.getElementById("amazon-connect-hosted-widget")?.remove();
      document.getElementById("amazon-connect-container")?.remove();
    };
  }, [snippetId, scriptUrl]);

  if (!snippetId || !scriptUrl) return null;
  return (
    <p className="text-sm text-ink-500">
      The chat window opens in the corner of the screen.
    </p>
  );
}
