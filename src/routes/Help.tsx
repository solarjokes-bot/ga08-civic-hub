import { Link } from "react-router-dom";
import { helpStrings as S } from "@/i18n/en/help";
import { chatMode, voiceOffered, SUPPORT_AVAILABILITY } from "@/lib/connect/config";
import { ChatLauncher } from "@/components/help/ChatLauncher";
import { HostedChatWidget } from "@/components/help/HostedChatWidget";
import { VoiceCallPanel } from "@/components/help/VoiceCallPanel";

export default function Help() {
  const mode = chatMode();
  const showVoice = voiceOffered();
  const nothingLive = mode === "off" && !showVoice;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">{S.title}</h1>
      <p className="mt-3 text-lg text-ink-700">{S.intro}</p>

      <p className="mt-4 rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-700">
        {S.crisisNote.split("988")[0]}
        <a href="tel:988" className="font-semibold">
          988
        </a>
        {S.crisisNote.split("988")[1]}
      </p>

      {nothingLive && (
        <p className="mt-6 rounded-lg bg-warning-bg px-4 py-3 text-warning-text">
          {S.unavailable.offline}{" "}
          <Link to="/resources">Find a Resource</Link> ·{" "}
          <Link to="/guide">Ask our guide</Link>
        </p>
      )}

      <section aria-labelledby="automated-h" className="mt-8">
        <h2 id="automated-h" className="text-xl font-bold text-ink-900">
          {S.automated.heading}
        </h2>
        <p className="mt-1 text-ink-700">{S.automated.body}</p>
        <p className="mt-2 text-ink-700">
          <strong>{SUPPORT_AVAILABILITY}.</strong> {S.automated.wantAPerson}
        </p>
      </section>

      <section aria-labelledby="expect-h" className="mt-8">
        <h2 id="expect-h" className="text-xl font-bold text-ink-900">
          {S.whatToExpect.heading}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-ink-700">
          {S.whatToExpect.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {(mode !== "off" || showVoice) && (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {mode !== "off" && (
            <section aria-labelledby="chat-h">
              <h2 id="chat-h" className="text-xl font-bold text-ink-900">
                {S.chat.heading}
              </h2>
              <div className="mt-3">
                {mode === "hosted" ? <HostedChatWidget /> : <ChatLauncher />}
              </div>
            </section>
          )}

          {showVoice && (
            <section aria-labelledby="voice-h">
              <h2 id="voice-h" className="text-xl font-bold text-ink-900">
                {S.voice.heading}
              </h2>
              <div className="mt-3">
                <VoiceCallPanel />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
