import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/connect/chatSession";
import type { ChatStatus } from "@/lib/connect/useChat";
import { helpStrings as S } from "@/i18n/en/help";

interface ChatPanelProps {
  status: ChatStatus;
  messages: ChatMessage[];
  agentTyping: boolean;
  send: (text: string) => Promise<void>;
  endChat: () => Promise<void>;
  onRestart: () => void;
}

export function ChatPanel({
  status,
  messages,
  agentTyping,
  send,
  endChat,
  onRestart,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "connected") inputRef.current?.focus();
  }, [status]);

  useEffect(() => {
    // Keep the newest message in view.
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, agentTyping]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await send(text);
    inputRef.current?.focus();
  };

  const active = status === "connected";

  return (
    <div className="rounded-xl border border-ink-900/15 bg-surface">
      <div className="flex items-center justify-between border-b border-ink-900/10 px-4 py-2">
        <p className="text-sm font-semibold text-ink-900">
          {status === "starting"
            ? S.chat.starting
            : status === "connected"
              ? S.chat.connected
              : S.chat.ended}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => void endChat()}
            className="rounded-md px-2 py-1 text-sm font-semibold text-primary-700 underline"
          >
            {S.chat.endLabel}
          </button>
        )}
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={S.chat.transcriptLabel}
        className="max-h-80 space-y-2 overflow-y-auto px-4 py-3"
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
        {agentTyping && (
          <p className="text-sm italic text-ink-500">{S.chat.agentTyping}</p>
        )}
        {messages.length === 0 && status === "connected" && (
          <p className="text-sm text-ink-500">{S.chat.connected}</p>
        )}
      </div>

      {active ? (
        <form
          className="flex items-end gap-2 border-t border-ink-900/10 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="flex-1">
            <label htmlFor="chat-input" className="sr-only">
              {S.chat.inputLabel}
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
              rows={2}
              className="w-full rounded-lg border border-ink-900/20 px-3 py-2 text-base"
              placeholder={S.chat.inputLabel}
            />
          </div>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {S.chat.sendLabel}
          </button>
        </form>
      ) : (
        status === "ended" && (
          <div className="border-t border-ink-900/10 p-3">
            <button
              type="button"
              onClick={onRestart}
              className="rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50"
            >
              {S.chat.restart}
            </button>
          </div>
        )
      )}
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "customer";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          mine
            ? "bg-primary-600 text-white"
            : message.role === "system"
              ? "bg-surface-muted text-ink-700"
              : "bg-surface-muted text-ink-900",
        ].join(" ")}
      >
        <span className="sr-only">{mine ? S.chat.you : S.chat.guide}: </span>
        {message.text}
      </div>
    </div>
  );
}
