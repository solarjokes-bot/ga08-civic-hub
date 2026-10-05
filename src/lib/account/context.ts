import { createContext, useContext } from "react";
import type { SavedService } from "@/lib/account/savedServices";

/**
 * Context objects and hooks for optional accounts.
 *
 * Kept separate from the provider components so each module exports only
 * one kind of thing — otherwise react-refresh can't hot-reload the
 * providers (the `only-export-components` rule).
 */

export type AccountStatus =
  | "loading"
  | "signedOut"
  | "signedIn"
  | "unavailable";

export interface AccountValue {
  status: AccountStatus;
  /** The username to display (never an email — none is collected). */
  username: string;
  signUp: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AccountContext = createContext<AccountValue | null>(null);

/**
 * Inert fallbacks, used when no provider is mounted.
 *
 * These hooks deliberately do NOT throw. Accounts are an optional extra
 * bolted onto a site whose core job — showing people where to get help —
 * must keep working no matter what. A <SaveButton> inside a resource card
 * rendered outside the provider (a test, a future embed, a partial
 * hydration) should quietly render nothing, not take the whole directory
 * down with it.
 */
const SIGNED_OUT: AccountValue = {
  status: "unavailable",
  username: "",
  signUp: async () => undefined,
  signIn: async () => undefined,
  signOut: async () => undefined,
};

const NO_SAVES: SavedValue = {
  saved: [],
  loading: false,
  canSave: false,
  isSaved: () => false,
  toggle: async () => undefined,
  pending: null,
};

export function useAccount(): AccountValue {
  return useContext(AccountContext) ?? SIGNED_OUT;
}

export interface SavedValue {
  saved: SavedService[];
  loading: boolean;
  canSave: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
  /** Slug currently being written, so the button can show progress. */
  pending: string | null;
}

export const SavedContext = createContext<SavedValue | null>(null);

export function useSavedServices(): SavedValue {
  return useContext(SavedContext) ?? NO_SAVES;
}

/** Turn Cognito's error shapes into something a citizen can act on. */
export function friendlyAuthError(err: unknown): string {
  const name =
    (err as { name?: string })?.name ??
    (err as { __type?: string })?.__type ??
    "";
  switch (name) {
    case "UsernameExistsException":
      return "That username is already taken. Try another one.";
    case "NotAuthorizedException":
      return "That username and password don't match. Remember there is no password reset, so check your spelling carefully.";
    case "UserNotFoundException":
      return "We couldn't find an account with that username.";
    case "InvalidPasswordException":
      return "That password doesn't meet the minimum requirements. Use at least 8 characters.";
    case "TooManyRequestsException":
    case "LimitExceededException":
      return "Too many tries just now. Please wait a minute and try again.";
    default:
      return "Something went wrong. Please try again in a moment.";
  }
}
