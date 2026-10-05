import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import type { CfnUserPool } from "aws-cdk-lib/aws-cognito";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { guidedTriage } from "./functions/guided-triage/resource";
import { connectContact } from "./functions/connect-contact/resource";
import { lexFulfillment } from "./functions/lex-fulfillment/resource";
import { confirmAccount } from "./functions/confirm-account/resource";

/**
 * Amplify Gen 2 backend entry point.
 *
 * PHASES 1–4: auth + data + guided-triage (Bedrock) + Amazon Connect
 * brokers (connect-contact, lex-fulfillment).
 *
 * The representative/Congress.gov section was dropped: the site is a
 * generic civic resource directory with no elected-official content.
 *
 * See docs/architecture.md for the target diagram + IAM notes and
 * docs/connect-setup.md for the console/CLI runbook that provisions the
 * Connect instance, Lex bot, contact flows, and queues.
 */
const backend = defineBackend({
  auth,
  data,
  guidedTriage,
  connectContact,
  lexFulfillment,
  confirmAccount,
});

const account = backend.stack.account;

// Anthropic Claude models + US cross-region inference profiles.
// // LIVE SETUP: once BEDROCK_MODEL_ID is pinned, narrow these to that
// one model/profile ARN.
const bedrockInvoke = new iam.PolicyStatement({
  sid: "InvokeAnthropicClaudeModels",
  actions: ["bedrock:InvokeModel"],
  resources: [
    "arn:aws:bedrock:*::foundation-model/anthropic.*",
    `arn:aws:bedrock:*:${account}:inference-profile/*anthropic.*`,
  ],
});

const resourceTable = backend.data.resources.tables["Resource"];

// ───────────────────────── guided-triage ─────────────────────────
{
  const fn = backend.guidedTriage.resources.lambda;
  fn.addToRolePolicy(bedrockInvoke);
  if (resourceTable) {
    resourceTable.grantReadData(fn);
    backend.guidedTriage.addEnvironment(
      "RESOURCE_TABLE_NAME",
      resourceTable.tableName,
    );
  }
}

// ───────────────────────── lex-fulfillment ─────────────────────────
{
  const fn = backend.lexFulfillment.resources.lambda;
  fn.addToRolePolicy(bedrockInvoke);
  if (resourceTable) {
    resourceTable.grantReadData(fn);
    backend.lexFulfillment.addEnvironment(
      "RESOURCE_TABLE_NAME",
      resourceTable.tableName,
    );
  }
  // Let Amazon Lex V2 invoke this function as a code hook.
  // // LIVE SETUP: after you import the bot, tighten `sourceArn` to the
  // bot alias ARN (arn:aws:lex:REGION:ACCT:bot-alias/BOT_ID/ALIAS_ID).
  fn.addPermission("AllowLexV2Invoke", {
    principal: new iam.ServicePrincipal("lexv2.amazonaws.com"),
    action: "lambda:InvokeFunction",
    sourceAccount: account,
  });
}

// ───────────────────────── connect-contact ─────────────────────────
{
  const fn = backend.connectContact.resources.lambda;
  // Start chat / WebRTC voice contacts on the Connect instance.
  // // LIVE SETUP: replace the wildcard with your instance ARN:
  // arn:aws:connect:REGION:ACCT:instance/INSTANCE_ID  (and .../contact/*)
  fn.addToRolePolicy(
    new iam.PolicyStatement({
      sid: "StartConnectContacts",
      actions: [
        "connect:StartChatContact",
        "connect:StartWebRTCContact",
      ],
      resources: [
        `arn:aws:connect:*:${account}:instance/*`,
        `arn:aws:connect:*:${account}:instance/*/contact/*`,
      ],
    }),
  );
}

// ───────────────────────── auth: suppress Schema on update ─────────────────────────
// The auth nested stack is part of every deploy regardless of whether
// anything here references it, and CDK always serializes the full Cognito
// `Schema` property into the UserPool's CloudFormation resource — even
// when nothing about it changed. `UpdateUserPool` does not support
// modifying standard-attribute Schema on an existing pool at all, so
// CloudFormation gets "Invalid AttributeDataType" on *every* deploy, not
// just ones that touch auth. `Schema` only matters at creation time, so
// deleting it from the template means CloudFormation stops trying to set
// it on updates and leaves the already-created pool's attributes alone.
{
  const cfnUserPool = backend.auth.resources.userPool.node
    .defaultChild as CfnUserPool;
  cfnUserPool.addPropertyDeletionOverride("Schema");
}

// ───────────────────────── confirm-account ─────────────────────────
// Confirms new username accounts server-side (there is no email to send a
// code to). Scoped to exactly one Cognito action on exactly this pool.
{
  const fn = backend.confirmAccount.resources.lambda;
  const poolId = process.env.USER_POOL_ID ?? "";
  backend.confirmAccount.addEnvironment("USER_POOL_ID", poolId);
  fn.addToRolePolicy(
    new iam.PolicyStatement({
      sid: "ConfirmNewUsernameAccounts",
      actions: ["cognito-idp:AdminConfirmSignUp"],
      resources: poolId
        ? [`arn:aws:cognito-idp:${backend.stack.region}:${account}:userpool/${poolId}`]
        : [`arn:aws:cognito-idp:${backend.stack.region}:${account}:userpool/*`],
    }),
  );
}

export default backend;
