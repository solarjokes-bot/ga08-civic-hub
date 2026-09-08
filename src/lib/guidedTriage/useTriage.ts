import { useCallback, useRef, useState } from "react";
import type { TriageAnswer, TriageAnswers, TriageStep } from "@/lib/guidedTriage/types";
import { runTriageStep, logGuidedSession } from "@/lib/guidedTriage/client";
import { makeSessionId } from "@/lib/guidedTriage/session";

export type TriagePhase = "intro" | "loading" | "asking" | "done";

interface UseTriage {
  phase: TriagePhase;
  step: TriageStep | null;
  answers: TriageAnswers;
  start: () => void;
  submit: (answer: TriageAnswer) => void;
  back: () => void;
  restart: () => void;
  /** Record that the visitor asked to talk to a person. */
  markEscalated: () => void;
}

export function useTriage(): UseTriage {
  const [phase, setPhase] = useState<TriagePhase>("intro");
  const [step, setStep] = useState<TriageStep | null>(null);
  const [answers, setAnswers] = useState<TriageAnswers>([]);
  // Ignore responses from a superseded request (e.g. rapid Back/Next).
  const reqId = useRef(0);

  const advance = useCallback(async (nextAnswers: TriageAnswers) => {
    const mine = ++reqId.current;
    setAnswers(nextAnswers);
    setPhase("loading");
    let result: TriageStep;
    try {
      result = await runTriageStep(nextAnswers);
    } catch {
      // runTriageStep already falls back internally; this is a last resort.
      return;
    }
    if (mine !== reqId.current) return;
    setStep(result);
    setPhase(result.kind === "question" ? "asking" : "done");

    if (result.kind === "result") {
      void logGuidedSession({
        sessionId: result.sessionId,
        summary: result.loggedSummary,
        escalatedToHuman: false,
      });
    } else if (result.kind === "crisis") {
      void logGuidedSession({
        sessionId: makeSessionId(),
        summary: {
          signals: [],
          matchedCategories: [],
          recommendedSlugs: result.resources.map((r) => r.slug),
          crisisDetected: true,
        },
        escalatedToHuman: true,
      });
    }
  }, []);

  const start = useCallback(() => {
    void advance([]);
  }, [advance]);

  const submit = useCallback(
    (answer: TriageAnswer) => {
      void advance([...answers, answer]);
    },
    [advance, answers],
  );

  const back = useCallback(() => {
    if (answers.length === 0) {
      reqId.current++;
      setPhase("intro");
      setStep(null);
      return;
    }
    void advance(answers.slice(0, -1));
  }, [advance, answers]);

  const restart = useCallback(() => {
    reqId.current++;
    setAnswers([]);
    setStep(null);
    setPhase("intro");
  }, []);

  const markEscalated = useCallback(() => {
    const summary =
      step?.kind === "result"
        ? step.loggedSummary
        : {
            signals: [],
            matchedCategories: [],
            recommendedSlugs: [],
            crisisDetected: step?.kind === "crisis",
          };
    void logGuidedSession({
      sessionId: step?.kind === "result" ? step.sessionId : makeSessionId(),
      summary,
      escalatedToHuman: true,
    });
  }, [step]);

  return { phase, step, answers, start, submit, back, restart, markEscalated };
}
