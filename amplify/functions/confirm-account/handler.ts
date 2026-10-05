import {
  CognitoIdentityProviderClient,
  AdminConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../../data/resource";

/**
 * Confirms a just-created username account.
 *
 * SAFETY: this is a public (API-key) mutation, so it deliberately refuses
 * any identifier that is not one of our synthetic username accounts. Only
 * addresses under the reserved `.invalid` domain are eligible. That means
 * it can never be used to confirm a real staff/admin account created by
 * another route, and it cannot leak whether an arbitrary address exists.
 *
 * Confirming an account is not itself a privilege escalation: the caller
 * still needs the password to sign in. The account was created moments
 * earlier by the same browser.
 */

const REGION = process.env.AWS_REGION ?? "us-east-1";
const USER_POOL_ID = process.env.USER_POOL_ID || "";
const SYNTHETIC_SUFFIX = "@users.noreply.invalid";

const cognito = new CognitoIdentityProviderClient({ region: REGION });

export const handler: Schema["confirmAccount"]["functionHandler"] = async (
  event,
) => {
  const identifier = String(event.arguments.identifier ?? "").toLowerCase();

  if (!USER_POOL_ID) {
    console.error("[confirm-account] USER_POOL_ID not set");
    return { ok: false, reason: "not_configured" };
  }
  if (!identifier.endsWith(SYNTHETIC_SUFFIX)) {
    // Not one of ours — refuse without revealing anything about it.
    console.warn("[confirm-account] refused non-synthetic identifier");
    return { ok: false, reason: "not_eligible" };
  }

  try {
    await cognito.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: USER_POOL_ID,
        Username: identifier,
      }),
    );
    return { ok: true };
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "";
    // Already confirmed is a success from the caller's point of view.
    if (name === "NotAuthorizedException") return { ok: true };
    console.error("[confirm-account] AdminConfirmSignUp failed:", name);
    return { ok: false, reason: "confirm_failed" };
  }
};
