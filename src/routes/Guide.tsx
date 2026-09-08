import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTriage } from "@/lib/guidedTriage/useTriage";
import { guideStrings as S } from "@/i18n/en/guide";
import { ProgressBar } from "@/components/guide/ProgressBar";
import { QuestionCard } from "@/components/guide/QuestionCard";
import { RecommendationList } from "@/components/guide/RecommendationList";
import { CrisisPanel } from "@/components/guide/CrisisPanel";

export default function Guide() {
  const navigate = useNavigate();
  const { phase, step, answers, start, submit, back, restart, markEscalated } =
    useTriage();
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "done") resultsHeadingRef.current?.focus();
  }, [phase, step]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Persistent crisis line — always one tap away. */}
      <p className="mb-6 rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-700">
        In a crisis or feeling unsafe? Call or text{" "}
        <a href="tel:988" className="font-semibold">
          988
        </a>{" "}
        any time, or call 911 for an emergency.
      </p>

      {/* Async status for screen readers */}
      <p className="sr-only" role="status" aria-live="polite">
        {phase === "loading" ? S.thinking : ""}
      </p>

      {phase === "intro" && (
        <section>
          <h1 className="text-3xl font-bold text-ink-900">{S.intro.title}</h1>
          <p className="mt-3 text-lg text-ink-700">{S.intro.body}</p>
          <button
            type="button"
            onClick={start}
            className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-lg font-bold text-white hover:bg-primary-700"
          >
            {S.intro.start}
          </button>
          <p className="mt-6 text-sm text-ink-500">{S.intro.privacyNote}</p>
          <p className="mt-2 text-sm text-ink-500">{S.intro.disclaimer}</p>
          <p className="mt-4">
            <Link to="/resources" className="text-sm font-semibold">
              {S.actions.seeAllResources}
            </Link>
          </p>
        </section>
      )}

      {phase === "loading" && (
        <p className="py-16 text-center text-lg text-ink-700">{S.thinking}</p>
      )}

      {phase === "asking" && step?.kind === "question" && (
        <section>
          <ProgressBar
            current={step.progress.current}
            total={step.progress.total}
          />
          <QuestionCard
            key={`${step.question.id}-${answers.length}`}
            question={step.question}
            canGoBack
            onSubmit={submit}
            onBack={back}
          />
        </section>
      )}

      {phase === "done" && step?.kind === "crisis" && (
        <CrisisPanel
          message={step.message}
          resources={step.resources}
          onSeeResources={() => navigate("/resources")}
        />
      )}

      {phase === "done" && step?.kind === "result" && (
        <section>
          <h2
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-ink-900 focus:outline-none"
          >
            {step.noMatches ? S.results.noneTitle : S.results.title}
          </h2>

          {step.noMatches ? (
            <p className="mt-2 text-ink-700">{S.results.noneBody}</p>
          ) : (
            <>
              <p className="mt-2 text-ink-700">{S.results.subtitle}</p>
              <RecommendationList recommendations={step.recommendations} />
            </>
          )}

          {/* Human hand-off — always offered. */}
          <div className="mt-6 rounded-xl border border-primary-600 bg-primary-50 p-5">
            <h3 className="text-lg font-bold text-primary-900">
              {S.results.talkToPerson}
            </h3>
            <p className="mt-1 text-ink-700">{S.results.talkToPersonBody}</p>
            <Link
              to="/help"
              onClick={markEscalated}
              className="mt-3 inline-block rounded-lg bg-primary-600 px-5 py-2.5 font-semibold text-white no-underline hover:bg-primary-700"
            >
              Chat or call for help
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={restart}
              className="rounded-lg border-2 border-primary-600 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50"
            >
              {S.results.restart}
            </button>
            <Link to="/resources" className="self-center text-sm font-semibold">
              {S.actions.seeAllResources}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
