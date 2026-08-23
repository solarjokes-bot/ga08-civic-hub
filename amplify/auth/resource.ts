import { defineAuth } from "@aws-amplify/backend";

/**
 * Amplify Gen 2 Auth (Cognito).
 * Targeted against @aws-amplify/backend ~1.13 (2026-08) — re-check
 * https://docs.amplify.aws/react/build-a-backend/auth/ if the API has moved.
 *
 * Model:
 *  - Public site visitors are UNAUTHENTICATED. They never sign in. All
 *    citizen-facing reads (resources, bills, initiatives) use Amplify
 *    Data's public API-key auth mode — see amplify/data/resource.ts.
 *  - A small `admin` Cognito group is the only signed-in role. Admins
 *    edit the resource catalog, legislator/committee content, and
 *    review GuidedSession analytics. There is no citizen account system
 *    by design — the guided-help flow is explicitly anonymous (see
 *    project privacy requirements), so we do not collect end-user PII
 *    or offer end-user login.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["admin"],
});
