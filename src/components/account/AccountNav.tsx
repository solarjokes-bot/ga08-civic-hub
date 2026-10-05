import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "@/lib/account/context";
import { accountStrings as S } from "@/i18n/en/account";

/**
 * Header account controls. Renders nothing when there's no backend, so a
 * preview build doesn't advertise a sign-in that cannot work.
 */
export function AccountNav() {
  const { status, username, signOut } = useAccount();
  const navigate = useNavigate();

  if (status === "unavailable" || status === "loading") return null;

  if (status === "signedOut") {
    return (
      <Link
        to="/account"
        className="rounded-md px-3 py-2 text-sm font-semibold text-ink-700 no-underline hover:bg-surface-muted hover:text-primary-600"
      >
        {S.nav.signIn}
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Link
        to="/saved"
        className="rounded-md px-3 py-2 text-sm font-semibold text-ink-700 no-underline hover:bg-surface-muted hover:text-primary-600"
      >
        {S.nav.saved}
      </Link>
      <span className="text-sm text-ink-500">
        <span className="sr-only">Signed in as </span>
        {username}
      </span>
      <button
        type="button"
        onClick={() => {
          void signOut().then(() => navigate("/"));
        }}
        className="rounded-md px-2 py-2 text-sm font-semibold text-primary-700 underline"
      >
        {S.nav.signOut}
      </button>
    </span>
  );
}
