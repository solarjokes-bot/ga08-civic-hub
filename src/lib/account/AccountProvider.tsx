import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Schema } from "../../../amplify/data/resource";
import { isBackendLive } from "@/lib/amplify";
import { toCognitoIdentifier, toDisplayName } from "@/lib/account/usernames";
import {
  AccountContext,
  type AccountStatus,
  type AccountValue,
} from "@/lib/account/context";

/**
 * Optional account state for the whole app.
 *
 * Accounts exist only so someone can save services and find them again.
 * Everything else — the directory, the guided wizard, chat and voice —
 * works signed out, and nothing here is allowed to gate that. With no
 * backend deployed this reports "unavailable" and the UI hides the
 * account affordances rather than offering a sign-in that cannot work.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus>("loading");
  const [username, setUsername] = useState("");

  useEffect(() => {
    let active = true;
    if (!isBackendLive()) {
      setStatus("unavailable");
      return;
    }
    (async () => {
      try {
        const { getCurrentUser } = await import("aws-amplify/auth");
        const user = await getCurrentUser();
        if (!active) return;
        setUsername(toDisplayName(user.signInDetails?.loginId ?? user.username));
        setStatus("signedIn");
      } catch {
        if (active) setStatus("signedOut");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const doSignIn = useCallback(async (u: string, password: string) => {
    const { signIn } = await import("aws-amplify/auth");
    await signIn({ username: toCognitoIdentifier(u), password });
    setUsername(u.trim());
    setStatus("signedIn");
  }, []);

  const doSignUp = useCallback(
    async (u: string, password: string) => {
      const identifier = toCognitoIdentifier(u);
      const { signUp } = await import("aws-amplify/auth");
      await signUp({
        username: identifier,
        password,
        // Cognito's username attribute is email, so the synthetic address
        // has to be set here too. It never reaches anyone: the .invalid
        // TLD cannot receive mail, and the pre-sign-up trigger
        // auto-confirms so nothing is ever sent.
        options: { userAttributes: { email: identifier } },
      });
      // No confirmation code can reach a .invalid address, so confirm the
      // account server-side before signing in. See
      // amplify/functions/confirm-account/.
      const { generateClient } = await import("aws-amplify/data");
      const client = generateClient<Schema>();
      const res = await client.mutations.confirmAccount(
        { identifier },
        { authMode: "apiKey" },
      );
      const parsed =
        typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (!parsed?.ok) {
        throw new Error(
          `Account created but could not be activated (${parsed?.reason ?? "unknown"}).`,
        );
      }
      await doSignIn(u, password);
    },
    [doSignIn],
  );

  const doSignOut = useCallback(async () => {
    const { signOut } = await import("aws-amplify/auth");
    await signOut();
    setUsername("");
    setStatus("signedOut");
  }, []);

  const value = useMemo<AccountValue>(
    () => ({
      status,
      username,
      signUp: doSignUp,
      signIn: doSignIn,
      signOut: doSignOut,
    }),
    [status, username, doSignUp, doSignIn, doSignOut],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}
