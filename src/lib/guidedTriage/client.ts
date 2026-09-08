import type { Schema } from "../../../amplify/data/resource";
import { isBackendLive } from "@/lib/amplify";
import { loadResources } from "@/lib/resourceCatalog";
import type {
  GuidedSessionSummary,
  TriageAnswers,
  TriageStep,
} from "@/lib/guidedTriage/types";
import { nextTriageStep } from "@/lib/guidedTriage/localEngine";

/**
 * Frontend entry point for the guided triage flow. Hides whether the
 * "brain" is the deployed Bedrock Lambda or the local deterministic
 * engine — the wizard just calls `runTriageStep(answers)`.
 */

export async function runTriageStep(
  answers: TriageAnswers,
): Promise<TriageStep> {
  if (isBackendLive()) {
    try {
      const { generateClient } = await import("aws-amplify/data");
      const client = generateClient<Schema>();
      const res = await client.queries.guidedTriage(
        { answers: JSON.stringify(answers) },
        { authMode: "apiKey" },
      );
      if (res.errors?.length) throw new Error(res.errors[0]?.message ?? "triage error");
      const parsed =
        typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (parsed && typeof parsed === "object" && "kind" in parsed) {
        return parsed as TriageStep;
      }
      throw new Error("unexpected triage response shape");
    } catch (err) {
      console.warn(
        "[guidedTriage] live call failed, using offline engine:",
        err,
      );
    }
  }

  const corpus = await loadResources();
  return nextTriageStep(answers, corpus);
}

/**
 * Persist the anonymous, PII-free session summary for analytics. No-op
 * (console only) in offline/demo mode.
 */
export async function logGuidedSession(input: {
  sessionId: string;
  summary: GuidedSessionSummary;
  escalatedToHuman: boolean;
}): Promise<void> {
  const payload = {
    sessionId: input.sessionId,
    answers: JSON.stringify(input.summary),
    recommendedResourceSlugs: input.summary.recommendedSlugs,
    escalatedToHuman: input.escalatedToHuman,
  };

  if (!isBackendLive()) {
    console.info("[guidedTriage] (offline) would log GuidedSession:", payload);
    return;
  }
  try {
    const { generateClient } = await import("aws-amplify/data");
    const client = generateClient<Schema>();
    await client.models.GuidedSession.create(payload, { authMode: "apiKey" });
  } catch (err) {
    // Analytics logging must never break the visitor's experience.
    console.warn("[guidedTriage] could not log GuidedSession:", err);
  }
}
