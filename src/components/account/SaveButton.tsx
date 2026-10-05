import { useSavedServices } from "@/lib/account/context";
import { accountStrings as S } from "@/i18n/en/account";

/**
 * Save / unsave toggle for one service.
 *
 * Renders nothing at all when signed out: an account is optional, and a
 * disabled button that nags anonymous visitors to sign up would undercut
 * that. `aria-pressed` carries the on/off state so it reads correctly to
 * a screen reader without relying on the label change alone.
 */
export function SaveButton({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { canSave, isSaved, toggle, pending } = useSavedServices();
  if (!canSave) return null;

  const on = isSaved(slug);
  const busy = pending === slug;

  return (
    <button
      type="button"
      onClick={() => void toggle(slug)}
      aria-pressed={on}
      disabled={busy}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-semibold",
        on
          ? "border-primary-600 bg-primary-50 text-primary-700"
          : "border-ink-900/20 text-ink-700 hover:border-primary-600 hover:text-primary-700",
        busy ? "opacity-60" : "",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">{on ? "★" : "☆"}</span>
      {busy ? S.save.saving : on ? S.save.saved : S.save.save}
      <span className="sr-only">: {name}</span>
    </button>
  );
}
