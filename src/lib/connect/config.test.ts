import { afterEach, describe, expect, it, vi } from "vitest";
import { chatMode, voiceOffered } from "@/lib/connect/config";

afterEach(() => vi.unstubAllEnvs());

describe("chatMode", () => {
  it("is 'off' by default", () => {
    expect(chatMode()).toBe("off");
  });

  it("is 'custom' when chat is enabled and hosted isn't chosen", () => {
    vi.stubEnv("VITE_CONNECT_CHAT_ENABLED", "true");
    expect(chatMode()).toBe("custom");
  });

  it("is 'hosted' only when the toggle AND both snippet fields are set", () => {
    vi.stubEnv("VITE_CONNECT_USE_HOSTED_WIDGET", "true");
    expect(chatMode()).toBe("off"); // snippet not configured yet
    vi.stubEnv("VITE_CONNECT_HOSTED_WIDGET_SNIPPET_ID", "abc123");
    vi.stubEnv("VITE_CONNECT_HOSTED_WIDGET_URL", "https://example/widget.js");
    expect(chatMode()).toBe("hosted");
  });

  it("prefers hosted over custom when both are configured", () => {
    vi.stubEnv("VITE_CONNECT_CHAT_ENABLED", "true");
    vi.stubEnv("VITE_CONNECT_USE_HOSTED_WIDGET", "true");
    vi.stubEnv("VITE_CONNECT_HOSTED_WIDGET_SNIPPET_ID", "abc123");
    vi.stubEnv("VITE_CONNECT_HOSTED_WIDGET_URL", "https://example/widget.js");
    expect(chatMode()).toBe("hosted");
  });
});

describe("voiceOffered", () => {
  it("follows VITE_CONNECT_VOICE_ENABLED", () => {
    expect(voiceOffered()).toBe(false);
    vi.stubEnv("VITE_CONNECT_VOICE_ENABLED", "true");
    expect(voiceOffered()).toBe(true);
  });
});
