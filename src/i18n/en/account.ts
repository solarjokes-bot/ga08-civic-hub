/**
 * Copy for optional accounts and saved services.
 *
 * Tone rules for this file: never imply an account is required, and never
 * soften the fact that a forgotten password cannot be recovered. People
 * are choosing to store something they may rely on later.
 */
export const accountStrings = {
  nav: { signIn: "Sign in", signOut: "Sign out", saved: "Saved" },
  signIn: {
    title: "Sign in",
    intro:
      "Signing in is optional. It lets you save services so you can find them again later. You can use everything else on this site without an account.",
    usernameLabel: "Username",
    passwordLabel: "Password",
    submit: "Sign in",
    switchPrompt: "Don't have an account?",
    switchAction: "Create one",
  },
  signUp: {
    title: "Create an account",
    intro:
      "Pick a username and a password. We don't ask for your name, email, or phone number — an account here only stores the services you choose to save.",
    submit: "Create account",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
    confirmLabel: "Type your password again",
    mismatch: "The two passwords don't match.",
    noResetWarning:
      "Please write your password down somewhere safe. Because we don't collect an email address, there is no way to reset it — if you forget it, you'll need to create a new account and save your services again.",
  },
  saved: {
    title: "Saved services",
    empty:
      "You haven't saved anything yet. Look for the “Save” button on any service to keep it here.",
    emptyCta: "Browse services",
    signedOut:
      "Sign in to see the services you've saved. Saving is optional — everything on this site works without an account.",
    count_one: "{count} saved service",
    count_other: "{count} saved services",
    remove: "Remove from saved",
  },
  save: { save: "Save", saved: "Saved", saving: "Saving…" },
  unavailable:
    "Accounts aren't available in this preview. Everything else on the site still works.",
} as const;
