import { describe, it, expect } from "vitest";
import {
  nextCallState,
  isCallActive,
  type CallState,
} from "@/lib/connect/voiceSession";
import { formatDuration } from "@/lib/connect/useVoiceCall";

describe("nextCallState", () => {
  it("runs the happy path idle -> connected", () => {
    let s: CallState = "idle";
    s = nextCallState(s, { type: "START" });
    expect(s).toBe("requesting-mic");
    s = nextCallState(s, { type: "MIC_GRANTED" });
    expect(s).toBe("connecting");
    s = nextCallState(s, { type: "MEDIA_STARTED" });
    expect(s).toBe("ringing");
    s = nextCallState(s, { type: "AGENT_JOINED" });
    expect(s).toBe("connected");
    s = nextCallState(s, { type: "HANGUP" });
    expect(s).toBe("ended");
  });

  it("goes to error when the mic is denied", () => {
    const s = nextCallState("requesting-mic", { type: "MIC_DENIED" });
    expect(s).toBe("error");
  });

  it("can connect straight from connecting if the agent is already there", () => {
    expect(nextCallState("connecting", { type: "AGENT_JOINED" })).toBe(
      "connected",
    );
  });

  it("treats a remote hang-up like a local one", () => {
    expect(nextCallState("connected", { type: "REMOTE_ENDED" })).toBe("ended");
  });

  it("allows restarting a call from ended or error", () => {
    expect(nextCallState("ended", { type: "START" })).toBe("requesting-mic");
    expect(nextCallState("error", { type: "START" })).toBe("requesting-mic");
  });

  it("ignores irrelevant events", () => {
    expect(nextCallState("idle", { type: "AGENT_JOINED" })).toBe("idle");
    expect(nextCallState("connected", { type: "MEDIA_STARTED" })).toBe(
      "connected",
    );
  });
});

describe("isCallActive", () => {
  it("is true only while a call is in progress", () => {
    expect(isCallActive("requesting-mic")).toBe(true);
    expect(isCallActive("ringing")).toBe(true);
    expect(isCallActive("connected")).toBe(true);
    expect(isCallActive("idle")).toBe(false);
    expect(isCallActive("ended")).toBe(false);
    expect(isCallActive("error")).toBe(false);
  });
});

describe("formatDuration", () => {
  it("formats mm:ss with a zero-padded seconds field", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
  });
});
