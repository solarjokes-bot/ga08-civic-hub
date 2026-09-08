import type { ChatStartData } from "@/lib/connect/startContact";

/**
 * Thin, typed facade over `amazon-connect-chatjs` for a CUSTOMER chat
 * session. The library is loaded lazily (it's ~heavy and only needed on
 * /help) and attaches a `connect` global.
 *
 * Verified against amazon-connect-chatjs v3 (2026-09-08): ChatSession
 * .create({ chatDetails, type: "CUSTOMER", options: { region } }),
 * .connect(), .onMessage/.onTyping/.onEnded, .sendMessage(),
 * .sendEvent(), .disconnectParticipant().
 */

export type ChatRole = "customer" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  at: number;
  displayName?: string;
}

export interface ChatSessionFacade {
  connect(): Promise<void>;
  onMessage(cb: (m: ChatMessage) => void): void;
  onTyping(cb: (who: ChatRole) => void): void;
  onEnded(cb: () => void): void;
  sendMessage(text: string): Promise<void>;
  sendTyping(): Promise<void>;
  end(): Promise<void>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function roleFrom(participantRole: string | undefined): ChatRole {
  const r = (participantRole ?? "").toUpperCase();
  if (r === "CUSTOMER") return "customer";
  if (r === "SYSTEM") return "system";
  return "agent"; // AGENT, BOT (Lex), SUPERVISOR, etc.
}

export async function createCustomerChatSession(
  data: ChatStartData,
): Promise<ChatSessionFacade> {
  // amazon-connect-chatjs ships a non-module global .d.ts; this import is
  // only for its side effect (it defines `globalThis.connect`).
  // @ts-expect-error non-module declaration file
  await import("amazon-connect-chatjs");
  const connect = (globalThis as any).connect;
  if (!connect?.ChatSession) {
    throw new Error("amazon-connect-chatjs failed to load");
  }

  connect.ChatSession.setGlobalConfig({
    region: data.region,
    loggerConfig: { useDefaultLogger: false },
  });

  const session = connect.ChatSession.create({
    chatDetails: {
      contactId: data.contactId,
      participantId: data.participantId,
      participantToken: data.participantToken,
    },
    type: "CUSTOMER",
    options: { region: data.region },
  });

  return {
    async connect() {
      await session.connect();
    },
    onMessage(cb) {
      session.onMessage((evt: any) => {
        const d = evt?.data ?? {};
        const ct: string = d.ContentType ?? "";
        if (!ct.startsWith("text/")) return; // skip event/attachment frames
        cb({
          id: String(d.Id ?? `${Date.now()}-${Math.random()}`),
          role: roleFrom(d.ParticipantRole),
          text: String(d.Content ?? ""),
          at: d.AbsoluteTime ? Date.parse(d.AbsoluteTime) : Date.now(),
          displayName: d.DisplayName,
        });
      });
    },
    onTyping(cb) {
      session.onTyping((evt: any) => {
        cb(roleFrom(evt?.data?.ParticipantRole));
      });
    },
    onEnded(cb) {
      session.onEnded(() => cb());
    },
    async sendMessage(text: string) {
      await session.sendMessage({ contentType: "text/plain", message: text });
    },
    async sendTyping() {
      await session.sendEvent({
        contentType: "application/vnd.amazonaws.connect.event.typing",
      });
    },
    async end() {
      await session.disconnectParticipant();
    },
  };
}
