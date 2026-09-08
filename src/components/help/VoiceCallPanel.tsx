import { useEffect, useRef } from "react";
import { useVoiceCall, formatDuration } from "@/lib/connect/useVoiceCall";
import { isCallActive } from "@/lib/connect/voiceSession";
import { helpStrings as S } from "@/i18n/en/help";

/**
 * "Call for help from your browser" — an accessible WebRTC voice call
 * into Amazon Connect. Fully keyboard operable and labelled for screen
 * readers: every state change is announced via a polite live region,
 * the mute button reports its pressed state, and a visible call timer
 * runs while connected.
 */
export function VoiceCallPanel({ topic }: { topic?: string }) {
  const call = useVoiceCall();
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);

  // Announce the coarse timer (every 30s) without spamming the SR.
  useEffect(() => {
    if (call.status === "connected" && call.durationSec % 30 === 0) {
      timerRef.current?.setAttribute(
        "aria-label",
        `${S.voice.timerLabel}: ${formatDuration(call.durationSec)}`,
      );
    }
  }, [call.durationSec, call.status]);

  const start = () => {
    if (audioRef.current) void call.startCall(audioRef.current, topic);
  };

  const statusLine = (() => {
    switch (call.status) {
      case "requesting-mic":
        return S.voice.requestingMic;
      case "connecting":
        return S.voice.connecting;
      case "ringing":
        return S.voice.ringing;
      case "connected":
        return S.voice.connected;
      case "ended":
        return S.voice.ended;
      case "error":
        return call.error ?? S.voice.micDeniedHelp;
      default:
        return "";
    }
  })();

  return (
    <div className="rounded-xl border border-ink-900/15 bg-surface p-4">
      {/* Remote (agent) audio sink. Hidden but present in the DOM.
          Captions don't apply to a live 1:1 phone call. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay />

      {call.status === "idle" || call.status === "ended" ? (
        <div>
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-primary-600 px-6 py-3 text-lg font-bold text-white hover:bg-primary-700"
          >
            {call.status === "ended" ? S.voice.callAgain : S.voice.start}
          </button>
          <p className="mt-2 text-sm text-ink-500">{S.voice.startHint}</p>
          {call.status === "ended" && (
            <p className="mt-2 text-ink-700" role="status">
              {S.voice.ended}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p role="status" aria-live="polite" className="font-semibold text-ink-900">
            {statusLine}
          </p>

          {call.status === "connected" && (
            <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
              <span ref={timerRef} aria-label={`${S.voice.timerLabel}: ${formatDuration(call.durationSec)}`}>
                {formatDuration(call.durationSec)}
              </span>
            </p>
          )}

          {isCallActive(call.status) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {(call.status === "connected" || call.status === "ringing") && (
                <button
                  type="button"
                  onClick={call.toggleMute}
                  aria-pressed={call.muted}
                  className="rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50"
                >
                  {call.muted ? S.voice.unmuteLabel : S.voice.muteLabel}
                </button>
              )}
              <button
                type="button"
                onClick={call.hangUp}
                className="rounded-lg px-4 py-2 font-semibold text-white"
                style={{ backgroundColor: "var(--color-alert-600)" }}
              >
                {S.voice.hangUpLabel}
              </button>
            </div>
          )}

          {call.status === "error" && (
            <div className="mt-3">
              <p className="rounded-lg bg-warning-bg px-4 py-3 text-sm text-warning-text">
                {call.error ?? S.voice.micDeniedHelp}
              </p>
              <button
                type="button"
                onClick={start}
                className="mt-3 rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50"
              >
                {S.voice.callAgain}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
