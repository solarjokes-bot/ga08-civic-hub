import type { VoiceStartData } from "@/lib/connect/startContact";

/**
 * In-browser WebRTC voice call to Amazon Connect (Phase 4).
 *
 * Transport = Amazon Chime SDK for JavaScript. Amazon Connect's
 * `StartWebRTCContact` API (called by the connect-contact Lambda)
 * returns `ConnectionData.Meeting` + `ConnectionData.Attendee`, which is
 * exactly what the Chime SDK joins with. (The project spec names
 * `amazon-connect-streams`; that library is agent-side / CCP only — the
 * customer-side in-browser call path is the Chime SDK. See
 * docs/architecture.md "Key decisions".)
 *
 * This module owns the CALL STATE MACHINE (pure, testable) and the Chime
 * side effects. The state machine is exercised by voiceSession.test.ts;
 * the Chime glue is marked `// LIVE SETUP:` — it can't be run here (no
 * Connect instance) but is written against the documented SDK surface.
 */

export type CallState =
  | "idle"
  | "requesting-mic"
  | "connecting"
  | "ringing"
  | "connected"
  | "ended"
  | "error";

export type CallEvent =
  | { type: "START" }
  | { type: "MIC_GRANTED" }
  | { type: "MIC_DENIED" }
  | { type: "MEDIA_STARTED" }
  | { type: "AGENT_JOINED" }
  | { type: "HANGUP" }
  | { type: "REMOTE_ENDED" }
  | { type: "ERROR" };

/** Pure transition function — the single source of truth for call flow. */
export function nextCallState(state: CallState, event: CallEvent): CallState {
  switch (state) {
    case "idle":
      return event.type === "START" ? "requesting-mic" : state;
    case "requesting-mic":
      if (event.type === "MIC_GRANTED") return "connecting";
      if (event.type === "MIC_DENIED") return "error";
      if (event.type === "HANGUP") return "ended";
      if (event.type === "ERROR") return "error";
      return state;
    case "connecting":
      if (event.type === "MEDIA_STARTED") return "ringing";
      if (event.type === "AGENT_JOINED") return "connected";
      if (event.type === "HANGUP") return "ended";
      if (event.type === "REMOTE_ENDED") return "ended";
      if (event.type === "ERROR") return "error";
      return state;
    case "ringing":
      if (event.type === "AGENT_JOINED") return "connected";
      if (event.type === "HANGUP") return "ended";
      if (event.type === "REMOTE_ENDED") return "ended";
      if (event.type === "ERROR") return "error";
      return state;
    case "connected":
      if (event.type === "HANGUP" || event.type === "REMOTE_ENDED")
        return "ended";
      if (event.type === "ERROR") return "error";
      return state;
    case "ended":
    case "error":
      return event.type === "START" ? "requesting-mic" : state;
    default:
      return state;
  }
}

export const ACTIVE_CALL_STATES: CallState[] = [
  "requesting-mic",
  "connecting",
  "ringing",
  "connected",
];

export function isCallActive(s: CallState): boolean {
  return ACTIVE_CALL_STATES.includes(s);
}

interface VoiceControllerOpts {
  /** <audio> element the remote (agent) audio is bound to. */
  audioElement: HTMLAudioElement;
  onState: (s: CallState) => void;
  onMuteChange: (muted: boolean) => void;
  onError: (message: string) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export class VoiceCallController {
  private state: CallState = "idle";
  private muted = false;
  private connectedAt: number | null = null;
  private meetingSession: any = null;
  private micStream: MediaStream | null = null;

  constructor(private opts: VoiceControllerOpts) {}

  getState(): CallState {
    return this.state;
  }
  getDurationSec(): number {
    if (!this.connectedAt) return 0;
    return Math.floor((Date.now() - this.connectedAt) / 1000);
  }
  isMuted(): boolean {
    return this.muted;
  }

  private dispatch(event: CallEvent) {
    const prev = this.state;
    this.state = nextCallState(prev, event);
    if (this.state !== prev) {
      if (this.state === "connected") this.connectedAt = Date.now();
      this.opts.onState(this.state);
    }
  }

  /**
   * @param starter called AFTER mic permission is granted, to obtain the
   * Connect/Chime connection data from the backend.
   */
  async start(starter: () => Promise<VoiceStartData>): Promise<void> {
    this.dispatch({ type: "START" });

    // 1. Microphone permission — surfaced to the UI as its own state so
    // we can explain the browser prompt.
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.dispatch({ type: "MIC_GRANTED" });
    } catch {
      this.opts.onError(
        "We couldn't use your microphone. Check your browser's site permissions and try again.",
      );
      this.dispatch({ type: "MIC_DENIED" });
      return;
    }

    // 2. Start the Connect contact + join the Chime meeting.
    try {
      const data = await starter();
      await this.joinChime(data);
    } catch (err) {
      console.error("[voice] failed to start call:", err);
      this.opts.onError(
        "We couldn't connect the call. Please try again in a moment, or use chat.",
      );
      this.cleanup();
      this.dispatch({ type: "ERROR" });
    }
  }

  // // LIVE SETUP: unverifiable here (needs a real StartWebRTCContact
  // response). Written against amazon-chime-sdk-js v3 — re-confirm the
  // ConnectionData -> MeetingSessionConfiguration mapping on first run.
  private async joinChime(data: VoiceStartData): Promise<void> {
    const chime = await import("amazon-chime-sdk-js");
    const {
      ConsoleLogger,
      DefaultDeviceController,
      DefaultMeetingSession,
      LogLevel,
      MeetingSessionConfiguration,
    } = chime;

    const logger = new ConsoleLogger("ga08-voice", LogLevel.WARN);
    const deviceController = new DefaultDeviceController(logger);
    const configuration = new MeetingSessionConfiguration(
      { Meeting: data.connectionData.Meeting } as any,
      { Attendee: data.connectionData.Attendee } as any,
    );
    const session = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController,
    );
    this.meetingSession = session;

    const av = session.audioVideo;
    av.addObserver({
      audioVideoDidStart: () => this.dispatch({ type: "MEDIA_STARTED" }),
      audioVideoDidStop: () => {
        this.dispatch({ type: "REMOTE_ENDED" });
        this.cleanup();
      },
    });

    // An agent (any non-self attendee) joining => "connected".
    const selfAttendeeId = configuration.credentials?.attendeeId;
    av.realtimeSubscribeToAttendeeIdPresence(
      (attendeeId: string, present: boolean) => {
        if (present && attendeeId !== selfAttendeeId) {
          this.dispatch({ type: "AGENT_JOINED" });
        }
      },
    );

    const devices = await av.listAudioInputDevices();
    await av.startAudioInput(devices[0]?.deviceId ?? (this.micStream as any));
    av.bindAudioElement(this.opts.audioElement);
    av.start();
  }

  toggleMute(): void {
    if (this.state !== "connected" && this.state !== "ringing") return;
    const av = this.meetingSession?.audioVideo;
    if (!av) return;
    if (this.muted) {
      av.realtimeUnmuteLocalAudio();
      this.muted = false;
    } else {
      av.realtimeMuteLocalAudio();
      this.muted = true;
    }
    this.opts.onMuteChange(this.muted);
  }

  hangUp(): void {
    try {
      this.meetingSession?.audioVideo?.stop();
    } catch {
      /* ignore */
    }
    this.cleanup();
    this.dispatch({ type: "HANGUP" });
  }

  private cleanup(): void {
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.meetingSession = null;
    this.connectedAt = null;
  }
}
