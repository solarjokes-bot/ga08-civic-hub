import { useCallback, useEffect, useRef, useState } from "react";
import {
  VoiceCallController,
  type CallState,
} from "@/lib/connect/voiceSession";
import { startSupportContact } from "@/lib/connect/startContact";

interface UseVoiceCall {
  status: CallState;
  muted: boolean;
  durationSec: number;
  error?: string;
  /** `audioEl` is the <audio> element the agent's audio is bound to. */
  startCall: (audioEl: HTMLAudioElement, topic?: string) => Promise<void>;
  toggleMute: () => void;
  hangUp: () => void;
}

export function useVoiceCall(): UseVoiceCall {
  const [status, setStatus] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string>();
  const controllerRef = useRef<VoiceCallController | null>(null);

  const startCall = useCallback(
    async (audioEl: HTMLAudioElement, topic?: string) => {
      setError(undefined);
      setMuted(false);
      setDurationSec(0);

      const controller = new VoiceCallController({
        audioElement: audioEl,
        onState: setStatus,
        onMuteChange: setMuted,
        onError: setError,
      });
      controllerRef.current = controller;

      await controller.start(async () => {
        const res = await startSupportContact("VOICE", { topic });
        if (!res.ok) {
          throw new Error(`voice unavailable: ${res.reason}`);
        }
        return res.voice;
      });
    },
    [],
  );

  const toggleMute = useCallback(() => {
    controllerRef.current?.toggleMute();
  }, []);

  const hangUp = useCallback(() => {
    controllerRef.current?.hangUp();
  }, []);

  // Tick the visible timer once per second while the call is up.
  useEffect(() => {
    if (status !== "connected") return;
    const id = setInterval(() => {
      setDurationSec(controllerRef.current?.getDurationSec() ?? 0);
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    return () => controllerRef.current?.hangUp();
  }, []);

  return { status, muted, durationSec, error, startCall, toggleMute, hangUp };
}

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
