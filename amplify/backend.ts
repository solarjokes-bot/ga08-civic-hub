import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

/**
 * Amplify Gen 2 backend entry point.
 *
 * PHASE 1: auth + data only, enough to deploy a sandbox and prove the
 * frontend can read/write through Amplify Data.
 *
 * Later phases add (each as its own reviewable change):
 *  - amplify/functions/guided-triage  (Phase 3 — Bedrock-powered triage)
 *  - amplify/functions/lex-fulfillment (Phase 4 — Lex V2 -> Bedrock)
 *  - amplify/functions/congress-sync   (Phase 5 — scheduled Congress.gov
 *    pull + Bedrock plain-language bill summaries)
 *  - storage (Phase 5+, if resource/legislator photos need hosting)
 *
 * See docs/architecture.md for the target end-state diagram and
 * docs/connect-setup.md for the Amazon Connect / Lex pieces that are
 * partly console/CLI-driven and documented as a runbook rather than
 * pure IaC.
 */
const backend = defineBackend({
  auth,
  data,
});

export default backend;
