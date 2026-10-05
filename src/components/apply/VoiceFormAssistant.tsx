import { useEffect, useRef, useState } from "react";
import { applyStrings as S } from "@/i18n/en/apply";
import {
  VOICE_STEPS,
  commandFrom,
  type ParseContext,
  type VoiceField,
} from "@/lib/voiceForm";

/**
 * Voice interview for the /apply worksheet: asks one question at a time,
 * listens, and writes each answer into the form on screen.
 *
 * PRIVACY: speech recognition is the *browser's* built-in service (the Web
 * Speech API). This site never receives audio or transcripts: everything below
 * runs in the page, and answers go only into React state via `onFill`. The
 * browser vendor's speech service may still hear the audio, which is why the
 * panel says so before the first click. Do not swap in a server-side
 * recognizer without revisiting that copy and the site's privacy promises.
 */

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Element id to highlight for each field. */
const TARGET_ID: Record<VoiceField, string> = {
  firstName: "firstName",
  lastName: "lastName",
  dateOfBirth: "dateOfBirth",
  street: "street",
  unit: "unit",
  city: "city",
  state: "state",
  zip: "zip",
  phone: "phone",
  email: "email",
  householdSize: "householdSize",
  services: "services-group",
  urgency: "urgency",
  notes: "notes",
};

type Phase = "idle" | "speaking" | "listening" | "stopped" | "done" | "error";
const RUNNING: Phase[] = ["speaking", "listening"];

function highlight(field?: VoiceField) {
  document
    .querySelectorAll("[data-voice-active]")
    .forEach((el) => el.removeAttribute("data-voice-active"));
  if (!field) return;
  const el = document.getElementById(TARGET_ID[field]);
  el?.setAttribute("data-voice-active", "true");
  el?.scrollIntoView?.({ block: "center" });
}

const buttonPrimary =
  "rounded-lg bg-primary-600 px-4 py-3 font-bold text-white hover:bg-primary-700";
const buttonSecondary =
  "rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50";

export function VoiceFormAssistant({
  isFilled,
  onFill,
  context,
}: {
  isFilled: (field: VoiceField) => boolean;
  onFill: (field: VoiceField, value: string | string[]) => void;
  context: ParseContext;
}) {
  const Ctor = recognitionCtor();
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [heard, setHeard] = useState("");
  const [readAloud, setReadAloud] = useState(true);

  // Callbacks fire long after the render that created them; read the latest
  // props through a ref instead of closing over stale ones.
  const live = useRef({ isFilled, onFill, context, readAloud });
  live.current = { isFilled, onFill, context, readAloud };

  const run = useRef({
    active: false,
    index: 0,
    silent: 0,
    failures: 0,
    token: 0,
    rec: null as Recognition | null,
  });

  const startRef = useRef<HTMLButtonElement>(null);
  const stopRef = useRef<HTMLButtonElement>(null);
  const previous = useRef<Phase>("idle");

  // Keep keyboard focus on a real control as the buttons swap.
  useEffect(() => {
    const wasRunning = RUNNING.includes(previous.current);
    const isRunning = RUNNING.includes(phase);
    if (!wasRunning && isRunning) stopRef.current?.focus();
    if (wasRunning && !isRunning) startRef.current?.focus();
    previous.current = phase;
  }, [phase]);

  useEffect(() => {
    const r = run.current;
    return () => {
      r.active = false;
      r.token += 1;
      r.rec?.abort();
      r.rec = null;
      if (canSpeak) window.speechSynthesis.cancel();
      highlight();
    };
  }, [canSpeak]);

  function abortListening() {
    const rec = run.current.rec;
    run.current.rec = null;
    rec?.abort();
  }

  function say(text: string, then: () => void) {
    const r = run.current;
    r.token += 1;
    const mine = r.token;
    if (!live.current.readAloud || !canSpeak) {
      then();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const finish = () => {
      window.clearTimeout(timer);
      if (mine === r.token && r.active) then();
    };
    const timer = window.setTimeout(finish, Math.max(4000, text.length * 120));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = finish;
    utterance.onerror = finish;
    synth.speak(utterance);
  }

  function halt(next: Phase, message: string) {
    const r = run.current;
    r.active = false;
    r.token += 1;
    abortListening();
    if (canSpeak) window.speechSynthesis.cancel();
    highlight();
    setPhase(next);
    setStatus(message);
  }

  function nextUnfilled(from: number): number {
    for (let i = from; i < VOICE_STEPS.length; i++) {
      if (!live.current.isFilled(VOICE_STEPS[i]!.field)) return i;
    }
    return -1;
  }

  function ask(from: number, lead = "", force = false) {
    const r = run.current;
    abortListening();
    const i = force ? from : nextUnfilled(from);
    if (i < 0) {
      halt("done", S.voice.done);
      if (canSpeak && live.current.readAloud) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(S.voice.done));
      }
      return;
    }
    r.index = i;
    r.silent = 0;
    const step = VOICE_STEPS[i]!;
    highlight(step.field);
    const text = `${lead} ${step.prompt}`.trim();
    setStatus(`Question ${i + 1} of ${VOICE_STEPS.length}. ${text}`);
    setPhase("speaking");
    say(text, listen);
  }

  function reprompt(message: string) {
    abortListening();
    setStatus(message);
    setPhase("speaking");
    say(message, listen);
  }

  function listen() {
    const r = run.current;
    if (!r.active || !Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    let gotResult = false;
    let error = "";
    rec.onresult = (event) => {
      gotResult = true;
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setHeard(transcript);
      handle(transcript);
    };
    rec.onerror = (event) => {
      error = event.error;
    };
    rec.onend = () => {
      if (gotResult || !r.active || r.rec !== rec) return;
      if (error === "not-allowed" || error === "service-not-allowed") {
        halt("error", S.voice.micBlocked);
      } else if (error === "audio-capture") {
        halt("error", S.voice.noMic);
      } else if (error === "network") {
        halt("error", S.voice.network);
      } else if (error && error !== "no-speech" && error !== "aborted") {
        halt("error", S.voice.failed);
      } else {
        r.silent += 1;
        if (r.silent >= 3) halt("stopped", S.voice.paused);
        else listen();
      }
    };

    r.rec = rec;
    setPhase("listening");
    try {
      rec.start();
    } catch {
      halt("error", S.voice.failed);
    }
  }

  function handle(text: string) {
    const r = run.current;
    if (!r.active) return;
    const step = VOICE_STEPS[r.index]!;
    const command = commandFrom(text);

    if (command === "stop") return halt("stopped", S.voice.stopped);
    if (command === "repeat") return ask(r.index, "", true);
    if (command === "back") return ask(Math.max(0, r.index - 1), "", true);
    if (command === "skip") {
      if (step.optional) return ask(r.index + 1, "Okay, skipping that one.");
      return reprompt(`That question is required. ${step.prompt}`);
    }

    const result = step.parse(text, live.current.context);
    if (!result.ok) {
      r.failures += 1;
      if (r.failures >= 3) {
        r.failures = 0;
        return ask(r.index + 1, "Let's skip that one. You can type it in yourself.");
      }
      return reprompt(result.hint);
    }
    r.failures = 0;
    live.current.onFill(step.field, result.value);
    ask(r.index + 1, `Got it: ${result.spoken}.`);
  }

  function start() {
    const r = run.current;
    r.active = true;
    r.silent = 0;
    r.failures = 0;
    setHeard("");
    ask(0, phase === "stopped" ? "" : S.voice.intro);
  }

  const running = RUNNING.includes(phase);

  return (
    <div>
      <h2 id="voice-heading" className="text-lg font-bold text-ink-900">
        <span aria-hidden="true">🎙️</span> {S.voice.heading}
      </h2>
      <p className="mt-2 text-ink-700">{S.voice.body}</p>

      <div className="mt-3 rounded-lg bg-surface-muted px-3 py-2">
        <p className="text-sm font-bold text-ink-900">{S.voice.privacyHeading}</p>
        <p id="voice-privacy" className="mt-1 text-sm text-ink-700">
          {S.voice.privacy}
        </p>
      </div>

      {Ctor ? (
        <>
          {canSpeak && (
            <label className="mt-3 flex items-center gap-2 text-ink-900">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={readAloud}
                onChange={(e) => setReadAloud(e.target.checked)}
              />
              {S.voice.readAloud}
            </label>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {running ? (
              <>
                <button ref={stopRef} type="button" onClick={() => halt("stopped", S.voice.stopped)} className={buttonPrimary}>
                  {S.voice.stop}
                </button>
                <button type="button" className={buttonSecondary} onClick={() => ask(run.current.index, "", true)}>
                  {S.voice.repeat}
                </button>
                <button type="button" className={buttonSecondary} onClick={() => handle("skip")}>
                  {S.voice.skip}
                </button>
              </>
            ) : (
              <button
                ref={startRef}
                type="button"
                onClick={start}
                aria-describedby="voice-privacy"
                className={buttonPrimary}
              >
                {phase === "stopped"
                  ? S.voice.resume
                  : phase === "idle"
                    ? S.voice.start
                    : S.voice.again}
              </button>
            )}
          </div>

          {phase === "listening" && (
            <p aria-hidden="true" className="mt-3 font-semibold text-primary-700">
              🎙️ {S.voice.listening}
            </p>
          )}
          {running && (
            <p className="mt-2 text-sm text-ink-500">{S.voice.commands}</p>
          )}
          {heard && running && (
            <p className="mt-2 text-sm text-ink-700">
              {S.voice.heard} “{heard}”
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-warning-bg px-3 py-2 text-warning-text">
          {S.voice.unsupported}
        </p>
      )}

      <p
        role="status"
        aria-live="polite"
        className={status && Ctor ? "mt-3 font-semibold text-ink-900" : "sr-only"}
      >
        {Ctor ? status : ""}
      </p>
    </div>
  );
}
