import { defineAuth } from "@aws-amplify/backend";

/**
 * Amplify Gen 2 Auth (Cognito).
 *
 * TWO KINDS OF SIGNED-IN USER, and a large anonymous majority:
 *
 *  - Anonymous visitors are still the default and the priority. Browsing
 *    the directory, the guided-help wizard, and chat/voice all work with
 *    no account, using Amplify Data's public API-key auth. Nothing about
 *    the accounts below gates or degrades that path.
 *  - Optional citizen accounts, used only to save services to come back
 *    to. Username + password, with NO email or other personal detail
 *    collected: `defineAuth` has no username option and a pool's
 *    UsernameAttributes is immutable, so each username maps to a
 *    synthetic address in the reserved `.invalid` TLD (see
 *    src/lib/account/usernames.ts) and the pre-sign-up trigger
 *    auto-confirms so no mail is ever attempted.
 *  - A small `admin` group for staff who edit the catalog.
 *
 * CONSEQUENCE, by design: there is no password reset. Nothing can be sent
 * to a `.invalid` address. The sign-up form states this plainly, and
 * saved services are a convenience rather than a system of record.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["admin"],
});
