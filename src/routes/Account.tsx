import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, friendlyAuthError } from "@/lib/account/context";
import {
  validatePassword,
  validateUsername,
} from "@/lib/account/usernames";
import { accountStrings as S } from "@/i18n/en/account";

type Mode = "signIn" | "signUp";

/**
 * Optional sign-in / create-account page.
 *
 * Deliberately plain: two fields, real <label>s, autocomplete hints so
 * password managers work, and errors announced in a live region. The
 * create-account path states up front that there is no password reset,
 * because for this audience discovering that later would be the worst
 * possible time.
 */
export default function Account() {
  const { status, signIn, signUp } = useAccount();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "unavailable") {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-ink-900">{S.signIn.title}</h1>
        <p className="mt-3 rounded-lg bg-warning-bg px-4 py-3 text-warning-text">
          {S.unavailable}
        </p>
        <Link to="/resources" className="mt-4 inline-block font-semibold">
          Browse services
        </Link>
      </div>
    );
  }

  if (status === "signedIn") {
    navigate("/saved", { replace: true });
    return null;
  }

  const copy = mode === "signIn" ? S.signIn : S.signUp;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const uErr = validateUsername(username);
    if (uErr) return setError(uErr);
    const pErr = validatePassword(password);
    if (pErr) return setError(pErr);
    if (mode === "signUp" && password !== confirm)
      return setError(S.signUp.mismatch);

    setBusy(true);
    try {
      if (mode === "signUp") await signUp(username, password);
      else await signIn(username, password);
      navigate("/saved");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-ink-900">{copy.title}</h1>
      <p className="mt-3 text-ink-700">{copy.intro}</p>

      {mode === "signUp" && (
        <p className="mt-4 rounded-lg bg-warning-bg px-4 py-3 text-sm text-warning-text">
          <strong>Important:</strong> {S.signUp.noResetWarning}
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-semibold text-ink-900"
          >
            {S.signIn.usernameLabel}
          </label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            className="mt-1 w-full rounded-lg border border-ink-900/20 px-3 py-2.5 text-base"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-ink-900"
          >
            {S.signIn.passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            required
            className="mt-1 w-full rounded-lg border border-ink-900/20 px-3 py-2.5 text-base"
          />
        </div>

        {mode === "signUp" && (
          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-semibold text-ink-900"
            >
              {S.signUp.confirmLabel}
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className="mt-1 w-full rounded-lg border border-ink-900/20 px-3 py-2.5 text-base"
            />
          </div>
        )}

        <p role="alert" aria-live="polite" className="min-h-[1.5rem] text-sm">
          {error && (
            <span style={{ color: "var(--color-alert-700)" }}>{error}</span>
          )}
        </p>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary-600 px-5 py-3 font-bold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {busy ? "Please wait…" : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-700">
        {copy.switchPrompt}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="font-semibold text-primary-700 underline"
        >
          {copy.switchAction}
        </button>
      </p>
    </div>
  );
}
