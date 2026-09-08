import { useChat } from "@/lib/connect/useChat";
import { helpStrings as S } from "@/i18n/en/help";
import { ChatPanel } from "@/components/help/ChatPanel";

/**
 * Custom in-page chat launcher (amazon-connect-chatjs). Shows a start
 * button; once a session begins it renders <ChatPanel>. If the backend
 * isn't deployed or the Connect instance isn't configured, it shows a
 * plain-language fallback instead of a broken widget.
 */
export function ChatLauncher({ topic }: { topic?: string }) {
  const chat = useChat();

  if (chat.status === "unavailable") {
    return (
      <p className="rounded-lg bg-surface-muted px-4 py-3 text-ink-700">
        {chat.unavailableReason === "not_configured"
          ? S.unavailable.notConfigured
          : S.unavailable.offline}
      </p>
    );
  }

  if (chat.status === "idle") {
    return (
      <button
        type="button"
        onClick={() => void chat.startChat(topic)}
        className="rounded-lg bg-primary-600 px-6 py-3 text-lg font-bold text-white hover:bg-primary-700"
      >
        {S.chat.start}
      </button>
    );
  }

  if (chat.status === "error") {
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-warning-bg px-4 py-3 text-warning-text">
          {S.unavailable.startFailed}
        </p>
        <button
          type="button"
          onClick={() => void chat.startChat(topic)}
          className="rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50"
        >
          {S.chat.restart}
        </button>
      </div>
    );
  }

  return (
    <ChatPanel
      status={chat.status}
      messages={chat.messages}
      agentTyping={chat.agentTyping}
      send={chat.send}
      endChat={chat.endChat}
      onRestart={() => void chat.startChat(topic)}
    />
  );
}
