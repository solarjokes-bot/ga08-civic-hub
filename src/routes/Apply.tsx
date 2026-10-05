import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Link } from "react-router-dom";
import { applyStrings as S, APPLY_SERVICES } from "@/i18n/en/apply";
import { fmt } from "@/i18n/en/resources";
import { useResources } from "@/lib/useResources";
import { VoiceFormAssistant } from "@/components/apply/VoiceFormAssistant";
import type { VoiceField } from "@/lib/voiceForm";

/**
 * "Apply for government services" worksheet.
 *
 * PRIVACY: this page collects personal details, so it is deliberately
 * device-only. Nothing is sent over the network, nothing is written to
 * localStorage/sessionStorage/cookies, and there is no analytics call. State
 * lives in React memory and disappears on refresh. Do not add persistence or
 * a submit endpoint without revisiting the site's "no personal information"
 * promises (About page, footer) and the privacy copy in i18n/en/apply.ts.
 *
 * The voice option uses the browser's own speech recognition (see
 * VoiceFormAssistant); this site still never receives the audio or answers.
 */

type FormState = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  householdSize: string;
  services: string[]; // APPLY_SERVICES ids
  urgency: string;
  notes: string;
};

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  householdSize: "",
  services: [],
  urgency: "",
  notes: "",
};

// Eleven required answers; unit, email, and notes are the optional ones.
const REQUIRED: (keyof FormState)[] = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "street",
  "city",
  "state",
  "zip",
  "phone",
  "householdSize",
  "services",
  "urgency",
];

const inputClass =
  "mt-1 block w-full rounded-lg border-2 border-ink-500 bg-surface px-3 py-2.5 text-base text-ink-900";

function Req() {
  return (
    <abbr
      title={S.requiredMark}
      className="text-alert-600 no-underline"
      aria-label={S.requiredMark}
    >
      *
    </abbr>
  );
}

function Field({
  id,
  label,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-semibold text-ink-900">
        {label} {required && <Req />}
      </label>
      {children}
    </div>
  );
}

function Section({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-ink-900/15 bg-surface p-5">
      <legend className="px-2 text-lg font-bold text-ink-900">{legend}</legend>
      {children}
    </fieldset>
  );
}

export default function Apply() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showSummary, setShowSummary] = useState(false);
  const summaryHeading = useRef<HTMLHeadingElement>(null);
  const { resources } = useResources();

  // Move focus to the summary heading when it appears, so screen-reader and
  // keyboard users land on the new content instead of a vanished form.
  useEffect(() => {
    if (showSummary) summaryHeading.current?.focus();
  }, [showSummary]);

  const done = useMemo(
    () =>
      REQUIRED.filter((field) => {
        const value = form[field];
        return Array.isArray(value) ? value.length > 0 : value.trim() !== "";
      }).length,
    [form],
  );

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleService(id: string) {
    set(
      "services",
      form.services.includes(id)
        ? form.services.filter((s) => s !== id)
        : [...form.services, id],
    );
  }

  const chosen = APPLY_SERVICES.filter((s) => form.services.includes(s.id));

  function isFilled(field: VoiceField) {
    const value = form[field];
    return Array.isArray(value) ? value.length > 0 : value.trim() !== "";
  }

  function fillFromVoice(field: VoiceField, value: string | string[]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  if (showSummary) {
    return (
      <Summary
        form={form}
        chosen={chosen}
        resources={resources}
        headingRef={summaryHeading}
        onEdit={() => setShowSummary(false)}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-ink-500">
          {S.eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink-900 sm:text-4xl">
          {S.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-700">{S.lede}</p>

        <div
          role="note"
          className="mt-5 rounded-lg border-l-4 border-primary-600 bg-primary-50 px-4 py-3"
        >
          <p className="font-bold text-primary-900">{S.privacy.heading}</p>
          <p className="mt-1 text-ink-700">{S.privacy.body}</p>
        </div>

        <p className="mt-5 font-semibold text-ink-700" role="status">
          {fmt(done === 1 ? S.progress_one : S.progress_other, {
            done,
            total: REQUIRED.length,
          })}
        </p>

        <form
          className="mt-4 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setShowSummary(true);
          }}
        >
          <Section legend={S.sections.about}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label={S.fields.firstName} required>
                <input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </Field>
              <Field id="lastName" label={S.fields.lastName} required>
                <input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </Field>
            </div>
            <Field id="dateOfBirth" label={S.fields.dateOfBirth} required>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                required
                className={inputClass}
                value={form.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
              />
            </Field>
          </Section>

          <Section legend={S.sections.address}>
            <Field id="street" label={S.fields.street} required>
              <input
                id="street"
                name="street"
                autoComplete="address-line1"
                required
                className={inputClass}
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
              />
            </Field>
            <Field id="unit" label={S.fields.unit}>
              <input
                id="unit"
                name="unit"
                autoComplete="address-line2"
                className={inputClass}
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem_9rem]">
              <Field id="city" label={S.fields.city} required>
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  required
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>
              <Field id="state" label={S.fields.state} required>
                <input
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  maxLength={2}
                  required
                  className={inputClass}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value.toUpperCase())}
                />
              </Field>
              <Field id="zip" label={S.fields.zip} required>
                <input
                  id="zip"
                  name="zip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[0-9]{5}"
                  title="5-digit ZIP code"
                  required
                  className={inputClass}
                  value={form.zip}
                  onChange={(e) => set("zip", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section legend={S.sections.contact}>
            <Field id="phone" label={S.fields.phone} required>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field id="email" label={S.fields.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
          </Section>

          <Section legend={S.sections.need}>
            <Field
              id="householdSize"
              label={S.fields.householdSize}
              required
              className="max-w-[12rem]"
            >
              <input
                id="householdSize"
                name="householdSize"
                type="number"
                min={1}
                inputMode="numeric"
                required
                className={inputClass}
                value={form.householdSize}
                onChange={(e) => set("householdSize", e.target.value)}
              />
            </Field>

            <fieldset id="services-group">
              <legend className="font-semibold text-ink-900">
                {S.fields.services} <Req />
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {APPLY_SERVICES.map((service) => (
                  <label
                    key={service.id}
                    htmlFor={`service-${service.id}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-900/15 px-3 py-2.5 hover:bg-surface-muted"
                  >
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      className="mt-1 h-5 w-5 shrink-0"
                      checked={form.services.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />
                    <span>{service.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="urgency" label={S.fields.urgency} required>
              <select
                id="urgency"
                name="urgency"
                required
                className={inputClass}
                value={form.urgency}
                onChange={(e) => set("urgency", e.target.value)}
              >
                <option value="">{S.urgencyPlaceholder}</option>
                {S.urgencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="notes" label={S.fields.notes}>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className={inputClass}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </Section>

          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-6 py-3 text-lg font-bold text-white hover:bg-primary-700"
          >
            {S.submit}
          </button>
        </form>
      </div>

      <aside
        aria-labelledby="voice-heading"
        className="h-fit rounded-xl border border-ink-900/15 bg-surface p-5 shadow-sm print:hidden lg:sticky lg:top-6"
      >
        <VoiceFormAssistant
          isFilled={isFilled}
          onFill={fillFromVoice}
          context={{
            urgencyOptions: S.urgencyOptions,
            services: APPLY_SERVICES,
          }}
        />
        <p className="mt-5 border-t border-ink-900/10 pt-4 text-ink-700">
          {S.voice.guideLead}{" "}
          <Link to="/help">{S.voice.guideCta}</Link>
        </p>
      </aside>
    </div>
  );
}

function Summary({
  form,
  chosen,
  resources,
  headingRef,
  onEdit,
}: {
  form: FormState;
  chosen: (typeof APPLY_SERVICES)[number][];
  resources: ReturnType<typeof useResources>["resources"];
  headingRef: RefObject<HTMLHeadingElement>;
  onEdit: () => void;
}) {
  const bySlug = new Map(resources.map((r) => [r.slug, r]));
  const seen = new Set<string>();

  const address = [
    form.street,
    form.unit,
    [form.city, form.state].filter(Boolean).join(", "),
    form.zip,
  ]
    .filter((p) => p.trim() !== "")
    .join(" · ");

  const rows: [string, string][] = [
    ["Name", `${form.firstName} ${form.lastName}`.trim()],
    ["Date of birth", form.dateOfBirth],
    ["Address", address],
    ["Phone", form.phone],
    ["Email", form.email],
    ["People in household", form.householdSize],
    ["Services needed", chosen.map((c) => c.label).join("; ")],
    ["How soon", form.urgency],
    ["Notes", form.notes],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl font-bold text-ink-900 outline-offset-4"
      >
        {S.summary.title}
      </h1>
      <p
        role="note"
        className="mt-3 rounded-lg border-l-4 border-primary-600 bg-primary-50 px-4 py-3 text-ink-700"
      >
        {S.summary.privacyReminder}
      </p>

      <section aria-labelledby="answers-heading" className="mt-8">
        <h2 id="answers-heading" className="text-xl font-bold text-ink-900">
          {S.summary.answersHeading}
        </h2>
        <dl className="mt-3 divide-y divide-ink-900/10 rounded-xl border border-ink-900/15 bg-surface">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr]">
              <dt className="font-semibold text-ink-700">{label}</dt>
              <dd className="whitespace-pre-line text-ink-900">
                {value.trim() === "" ? (
                  <span className="text-ink-500">{S.summary.notAnswered}</span>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="where-heading" className="mt-10">
        <h2 id="where-heading" className="text-xl font-bold text-ink-900">
          {S.summary.whereHeading}
        </h2>
        {chosen.length === 0 ? (
          <p className="mt-2 text-ink-700">{S.summary.noServices}</p>
        ) : (
          <>
            <p className="mt-2 text-ink-700">{S.summary.whereIntro}</p>
            <div className="mt-4 space-y-6">
              {chosen.map((service) => {
                const programs = service.slugs
                  .map((slug) => bySlug.get(slug))
                  .filter((r): r is NonNullable<typeof r> => Boolean(r))
                  .filter((r) => {
                    // A program shared by two services is listed once.
                    if (seen.has(r.slug)) return false;
                    seen.add(r.slug);
                    return true;
                  });
                if (programs.length === 0) return null;
                return (
                  <div key={service.id}>
                    <h3 className="font-bold text-ink-900">{service.label}</h3>
                    <ul className="mt-2 space-y-3">
                      {programs.map((r) => (
                        <li
                          key={r.slug}
                          className="rounded-xl border border-ink-900/15 bg-surface p-4"
                        >
                          <p className="font-semibold text-ink-900">{r.name}</p>
                          <p className="text-sm text-ink-500">{r.agency}</p>
                          <p className="mt-1 text-ink-700">{r.summary}</p>
                          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                            <a
                              href={r.applicationUrl ?? r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold"
                            >
                              {S.summary.applyAt}{" "}
                              <span className="sr-only">
                                for {r.name} (opens in a new tab)
                              </span>
                            </a>
                            <Link to={`/resources/${r.slug}`}>{S.summary.details}</Link>
                          </p>
                          <p className="mt-2 text-xs text-ink-500">
                            {fmt(S.summary.verified, { date: r.lastVerified })}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <p className="mt-6 text-sm text-ink-700">{S.summary.confirm}</p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-primary-600 px-5 py-3 font-bold text-white hover:bg-primary-700"
        >
          {S.summary.print}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border-2 border-primary-600 px-5 py-3 font-bold text-primary-700 hover:bg-primary-50"
        >
          {S.summary.edit}
        </button>
      </div>
    </div>
  );
}
