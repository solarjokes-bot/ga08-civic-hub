import { useEffect, useId, useRef, useState } from "react";
import type { TriageAnswer, TriageQuestion } from "@/lib/guidedTriage/types";
import { guideStrings as S } from "@/i18n/en/guide";

interface QuestionCardProps {
  question: TriageQuestion;
  canGoBack: boolean;
  onSubmit: (answer: TriageAnswer) => void;
  onBack: () => void;
}

export function QuestionCard({
  question,
  canGoBack,
  onSubmit,
  onBack,
}: QuestionCardProps) {
  const headingId = useId();
  const helpId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");

  const isMulti = question.multiSelect || question.kind === "signals";

  // Move focus to the new question so keyboard and screen-reader users
  // land on it after each step (reset local state too).
  useEffect(() => {
    setSelected([]);
    setText("");
    headingRef.current?.focus();
  }, [question.id, question.title]);

  const submit = (choices: string[], opts: { skipped?: boolean } = {}) => {
    onSubmit({
      step: question.id,
      choices,
      text: text.trim() || undefined,
      skipped: opts.skipped,
    });
  };

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <div>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-ink-900 focus:outline-none"
      >
        {question.title}
      </h2>
      {question.help && (
        <p id={helpId} className="mt-2 text-ink-700">
          {question.help}
        </p>
      )}

      {/* Single-select chips: tapping a chip answers immediately. */}
      {question.kind === "chips" && !isMulti && (
        <ul
          className="mt-5 grid gap-2 sm:grid-cols-2"
          aria-labelledby={headingId}
          aria-describedby={question.help ? helpId : undefined}
        >
          {question.options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => submit([opt.value])}
                className="flex w-full flex-col items-start rounded-xl border-2 border-ink-900/15 bg-surface px-4 py-3 text-left hover:border-primary-600 hover:bg-primary-50"
              >
                <span className="font-semibold text-ink-900">{opt.label}</span>
                {opt.hint && (
                  <span className="text-sm text-ink-500">{opt.hint}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Multi-select (signals): checkboxes + Continue. */}
      {isMulti && (
        <fieldset className="mt-5 border-0 p-0">
          <legend className="sr-only">{question.title}</legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {question.options.map((opt) => {
              const id = `${question.id}-${opt.value}`;
              return (
                <li key={opt.value}>
                  <label
                    htmlFor={id}
                    className="flex items-start gap-2 rounded-xl border-2 border-ink-900/15 bg-surface px-4 py-3 hover:border-primary-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
                  >
                    <input
                      type="checkbox"
                      id={id}
                      checked={selected.includes(opt.value)}
                      onChange={() => toggle(opt.value)}
                      className="mt-1 h-4 w-4 accent-primary-600"
                    />
                    <span>
                      <span className="font-semibold text-ink-900">
                        {opt.label}
                      </span>
                      {opt.hint && (
                        <span className="block text-sm text-ink-500">
                          {opt.hint}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      {/* County picker. */}
      {question.kind === "county" && (
        <div className="mt-5 max-w-sm">
          <label
            htmlFor={`${question.id}-select`}
            className="block text-sm font-semibold text-ink-900"
          >
            {S.actions.chooseCounty}
          </label>
          <select
            id={`${question.id}-select`}
            value={selected[0] ?? ""}
            onChange={(e) => setSelected(e.target.value ? [e.target.value] : [])}
            className="mt-1 w-full rounded-lg border border-ink-900/20 bg-surface px-3 py-2.5 text-base"
          >
            <option value="">{S.actions.chooseCounty}…</option>
            {question.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Free-text box (in addition to chips). */}
      {question.allowText && (
        <div className="mt-4 max-w-xl">
          <label
            htmlFor={`${question.id}-text`}
            className="block text-sm font-semibold text-ink-900"
          >
            {S.actions.otherTextLabel}
          </label>
          <textarea
            id={`${question.id}-text`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={S.actions.otherTextPlaceholder}
            className="mt-1 w-full rounded-lg border border-ink-900/20 bg-surface px-3 py-2 text-base placeholder:text-ink-500"
          />
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {(isMulti ||
          question.kind === "county" ||
          (question.allowText && text.trim())) && (
          <button
            type="button"
            onClick={() =>
              submit(question.kind === "county" ? selected.slice(0, 1) : selected)
            }
            className="rounded-lg bg-primary-600 px-5 py-2.5 font-semibold text-white hover:bg-primary-700"
          >
            {question.kind === "county" || isMulti
              ? S.actions.next
              : S.actions.submitAnswer}
          </button>
        )}
        {question.allowSkip && (
          <button
            type="button"
            onClick={() => submit([], { skipped: true })}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 underline hover:text-primary-900"
          >
            {S.actions.skip}
          </button>
        )}
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-ink-900/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-surface-muted"
          >
            {S.actions.back}
          </button>
        )}
      </div>
    </div>
  );
}
