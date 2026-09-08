import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

let configured = false;
let isLive = false;

/**
 * Configure the Amplify client from amplify_outputs.json, or fall back to
 * "offline/demo mode" if that file is still the checked-in placeholder
 * (i.e. nobody has run `npm run sandbox` / deployed via Amplify Hosting
 * yet). Safe to call multiple times.
 *
 * In offline mode: the resource directory still works against local seed
 * data (Phase 2), but anything needing AppSync, Cognito, Bedrock, or
 * Connect (guided help, live chat, web voice, admin login) shows a clear
 * "not connected" state instead of crashing. See README.md "what's real
 * vs. stubbed".
 */
export function configureAmplify(): { isLive: boolean } {
  if (!configured) {
    const placeholder = outputs.auth?.user_pool_id === "REPLACE_ME";
    if (placeholder) {
      console.warn(
        "[amplify] amplify_outputs.json is still the placeholder — running in offline/demo mode. " +
          "The resource directory and guided help work from bundled data; run `npm run sandbox` to deploy a dev " +
          "backend for live data, the Bedrock triage path, and (Phase 4) Connect chat/voice."
      );
      isLive = false;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Amplify.configure(outputs as any);
      isLive = true;
    }
    configured = true;
  }
  return { isLive };
}

export function isBackendLive(): boolean {
  return isLive;
}
