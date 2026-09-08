import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatSessionFacade } from "@/lib/connect/chatSession";
import { createCustomerChatSession } from "@/lib/connect/chatSession";
import { startSupportContact } from "@/lib/connect/startContact";

export type ChatStatus =
  | "idle"
  | "starting"
  | "connected"
  | "ended"
  | "unavailable"
  | "error";

interface UseChat {
  status: ChatStatus;
  messages: ChatMessage[];
  agentTyping: boolean;
  /** Present when status is "unavailable". */
  unavailableReason?: "offline" | "not_configured" | "start_failed";
  startChat: (topic?: string) => Promise<void>;
  send: (text: string) => Promise<void>;
  endChat: () => Promise<void>;
}

export function useChat(): UseChat {
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentTyping, setAgentTyping] = useState(false);
  const [unavailableReason, setUnavailableReason] =
    useState<UseChat["unavailableReason"]>();
  const sessionRef = useRef<ChatSessionFacade | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const startChat = useCallback(async (topic?: string) => {
    setStatus("starting");
    setMessages([]);
    seenIds.current = new Set();

    const res = await startSupportContact("CHAT", { topic });
    if (!res.ok) {
      setUnavailableReason(res.reason === "start_failed" ? "start_failed" : res.reason);
      setStatus(res.reason === "start_failed" ? "error" : "unavailable");
      return;
    }

    try {
      const session = await createCustomerChatSession(res.chat);
      sessionRef.current = session;

      session.onMessage((m) => {
        if (seenIds.current.has(m.id)) return;
        seenIds.current.add(m.id);
        setMessages((prev) => [...prev, m]);
        if (m.role !== "customer") setAgentTyping(false);
      });
      session.onTyping((who) => {
        if (who === "customer") return;
        setAgentTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setAgentTyping(false), 4000);
      });
      session.onEnded(() => setStatus("ended"));

      await session.connect();
      setStatus("connected");
    } catch (err) {
      console.error("[useChat] failed to connect chat:", err);
      setStatus("error");
    }
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionRef.current) return;
    await sessionRef.current.sendMessage(trimmed);
  }, []);

  const endChat = useCallback(async () => {
    try {
      await sessionRef.current?.end();
    } finally {
      sessionRef.current = null;
      setStatus("ended");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      sessionRef.current?.end().catch(() => undefined);
    };
  }, []);

  return {
    status,
    messages,
    agentTyping,
    unavailableReason,
    startChat,
    send,
    endChat,
  };
}
