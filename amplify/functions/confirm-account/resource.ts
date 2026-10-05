import { defineFunction } from "@aws-amplify/backend";

/**
 * Confirms a newly created account server-side.
 *
 * Accounts are username + password with no email collected, so Cognito's
 * emailed confirmation code can never arrive — the synthetic address sits
 * in the reserved `.invalid` TLD. A Cognito preSignUp trigger would be the
 * obvious fix, but attaching one to an existing pool makes CloudFormation
 * re-emit the pool Schema and Cognito rejects that (pool schema is
 * immutable after creation). This Lambda calls AdminConfirmSignUp instead,
 * which needs no change to the pool itself.
 */
export const confirmAccount = defineFunction({
  name: "confirm-account",
  entry: "./handler.ts",
  resourceGroupName: "data",
  timeoutSeconds: 15,
  memoryMB: 256,
});
