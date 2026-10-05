/**
 * Username <-> Cognito identifier mapping.
 *
 * WHY THIS EXISTS
 * The site offers username + password accounts and deliberately collects no
 * email address — accounts are optional and exist only to save services, so
 * there is no reason to hold anyone's personal contact details.
 *
 * Amplify Gen 2's `defineAuth` only supports email / phone / webAuthn /
 * external providers as login identifiers — there is no username option —
 * and a Cognito pool's `UsernameAttributes` is immutable after creation.
 * So each username is mapped to a synthetic address under the IANA-reserved
 * `.invalid` TLD (RFC 2606), which is guaranteed never to resolve and can
 * never receive mail. Combined with the pre-sign-up trigger that
 * auto-confirms accounts, no email is ever collected, stored, or sent.
 *
 * CONSEQUENCE: there is no password reset. Nothing can be emailed to a
 * `.invalid` address. The sign-up form says so plainly.
 */

/** Reserved by RFC 2606 — guaranteed non-resolvable. */
const SYNTHETIC_DOMAIN = "users.noreply.invalid";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const PASSWORD_MIN = 8;

/** Letters, digits, dot, dash, underscore. No spaces, no "@". */
const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

export function validateUsername(raw: string): string | null {
  const u = raw.trim();
  if (u.length < USERNAME_MIN)
    return `Username must be at least ${USERNAME_MIN} characters.`;
  if (u.length > USERNAME_MAX)
    return `Username must be ${USERNAME_MAX} characters or fewer.`;
  if (!USERNAME_RE.test(u))
    return "Username can use letters, numbers, dots, dashes and underscores only.";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN)
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  return null;
}

/** Username -> the identifier Cognito actually stores. Case-insensitive. */
export function toCognitoIdentifier(username: string): string {
  return `${username.trim().toLowerCase()}@${SYNTHETIC_DOMAIN}`;
}

/** Cognito identifier -> the username to show. Falls back to the raw value. */
export function toDisplayName(identifier: string | undefined | null): string {
  if (!identifier) return "";
  const at = identifier.indexOf("@");
  return at === -1 ? identifier : identifier.slice(0, at);
}

/** True when the identifier is one of our synthetic, email-free accounts. */
export function isSyntheticIdentifier(identifier: string): boolean {
  return identifier.toLowerCase().endsWith(`@${SYNTHETIC_DOMAIN}`);
}
