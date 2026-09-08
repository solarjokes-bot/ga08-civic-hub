import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { CivicResource } from "../../../src/lib/resourceTypes";

/**
 * Ask Bedrock for a short, plain-language answer to a citizen's question
 * that is GROUNDED in a handful of real catalog resources — the model
 * may only name those resources, and is told to say "check with the
 * agency" rather than guess a detail. Used by the Lex chat/voice bot so
 * it mirrors the /guide wizard's honesty rules.
 *
 * Returns null on any failure so the caller can fall back to a plain
 * templated reply.
 *
 * // VERIFY: BEDROCK_MODEL_ID default — confirm against the current
 * Bedrock model catalog and your account's model access before deploy.
 */
const DEFAULT_MODEL_ID = "us.anthropic.claude-sonnet-5-20250929-v1:0";

const SYSTEM = `
You are the voice/chat guide for the GA-08 Civic Resource Hub. Answer the caller's question in 2-3 short sentences, plain language (6th-8th grade), warm and neutral.
RULES:
- Only mention resources from the CANDIDATES list. Use their exact names. Never invent a program, phone number, or web address.
- Do NOT give legal, medical, or financial advice, and do NOT say whether someone qualifies — say the agency decides.
- If the candidates don't fit, say you're not sure and suggest talking to a person.
- End by telling them they can say "talk to a person" any time.
`.trim();

export async function composeGroundedAnswer(
  question: string,
  candidates: CivicResource[],
  region: string,
): Promise<string | null> {
  if (candidates.length === 0) return null;
  const modelId = process.env.BEDROCK_MODEL_ID || DEFAULT_MODEL_ID;
  const client = new BedrockRuntimeClient({ region });

  const candidateText = candidates
    .slice(0, 3)
    .map(
      (r) =>
        `- ${r.name} (${r.agency}). ${r.summary} Phone: ${r.phone ?? "n/a"}. Web: ${r.url}`,
    )
    .join("\n");

  try {
    const res = await client.send(
      new ConverseCommand({
        modelId,
        system: [{ text: SYSTEM }],
        messages: [
          {
            role: "user",
            content: [
              {
                text: `CANDIDATES:\n${candidateText}\n\nCaller asked: "${question}"\n\nGive the 2-3 sentence answer now.`,
              },
            ],
          },
        ],
        inferenceConfig: { maxTokens: 350, temperature: 0.3 },
      }),
    );
    const text = (res.output?.message?.content ?? [])
      .map((b) => ("text" in b ? b.text : ""))
      .join(" ")
      .trim();
    return text || null;
  } catch (err) {
    console.error("[groundedAnswer] Bedrock call failed:", err);
    return null;
  }
}

/** Deterministic fallback when the model is unavailable. */
export function templatedAnswer(candidates: CivicResource[]): string {
  if (candidates.length === 0) {
    return "I'm not sure I have the right program for that. You can say \"talk to a person\" and someone will help you look.";
  }
  const top = candidates.slice(0, 2);
  const list = top
    .map((r) => `${r.name}${r.phone ? ` at ${r.phone}` : ""}`)
    .join(", and ");
  return `Here's what might help: ${list}. Check the details with the agency before you rely on them. You can also say "talk to a person" any time.`;
}
