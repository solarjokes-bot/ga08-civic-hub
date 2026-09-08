import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { guidedTriage } from "./functions/guided-triage/resource";

/**
 * Amplify Gen 2 backend entry point.
 *
 * PHASES 1–3: auth + data + the Bedrock-powered guided-triage function.
 *
 * Later phases add (each as its own reviewable change):
 *  - amplify/functions/lex-fulfillment (Phase 4 — Lex V2 -> Bedrock)
 *  - amplify/functions/congress-sync   (Phase 5 — scheduled Congress.gov
 *    pull + Bedrock plain-language bill summaries)
 *  - storage (Phase 5+, if resource/legislator photos need hosting)
 *
 * See docs/architecture.md for the target end-state diagram and IAM
 * notes, and docs/connect-setup.md for the Amazon Connect / Lex pieces.
 */
const backend = defineBackend({
  auth,
  data,
  guidedTriage,
});

// ───────────────────────── guided-triage IAM (least privilege) ─────────────────────────
//
// The function calls the Bedrock Runtime Converse API and reads the
// Resource catalog table. Nothing else.

const triageLambda = backend.guidedTriage.resources.lambda;

// Bedrock: InvokeModel on Anthropic Claude models + the US cross-region
// inference profiles that front them. // LIVE SETUP: once BEDROCK_MODEL_ID
// is pinned, narrow these to that one model/profile ARN.
triageLambda.addToRolePolicy(
  new iam.PolicyStatement({
    sid: "InvokeAnthropicClaudeModels",
    actions: ["bedrock:InvokeModel"],
    resources: [
      "arn:aws:bedrock:*::foundation-model/anthropic.*",
      `arn:aws:bedrock:*:${backend.stack.account}:inference-profile/*anthropic.*`,
    ],
  }),
);

// DynamoDB: read-only on the Resource table, so triage is grounded in
// the live catalog (admin edits included), not just the build-time seed.
const resourceTable = backend.data.resources.tables["Resource"];
if (resourceTable) {
  resourceTable.grantReadData(triageLambda);
  backend.guidedTriage.addEnvironment(
    "RESOURCE_TABLE_NAME",
    resourceTable.tableName,
  );
}

export default backend;
