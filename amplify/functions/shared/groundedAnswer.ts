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
 * Model id VERIFIED 2026-09-08 in us-east-1 (ACTIVE inference profile +
 * live Converse call). No date/version suffix — see the note in
 * amplify/functions/guided-triage/handler.ts. Override with BEDROCK_MODEL_ID.
 */
const DEFAULT_MODEL_ID = "us.anthropic.claude-sonnet-5";

const SYSTEM = `
You are the voice/chat guide for the Civic Resource Hub. You help people in Georgia find and understand public and government programs.

ANSWERING
- Plain language, 6th-8th grade reading level, warm and neutral. Expand acronyms the first time ("SNAP, the food stamp program").
- Default to 2-4 sentences. If the person asks a specific question the CANDIDATES actually answer - how to apply, what to bring, what it costs, how long it takes, who it's for - answer it properly and concretely, using the detail provided. Don't be terse when the information is right there.
- Prefer concrete next steps ("apply online at gateway.ga.gov, or call 1-877-423-4746") over vague encouragement.
- This is often spoken aloud: read phone numbers naturally and avoid URLs longer than a short domain when you can give a phone number instead.

GROUNDING - the hard rules
- Only use facts present in the CANDIDATES block. Use their exact program names, phone numbers and web addresses.
- NEVER invent or guess a program, phone number, web address, dollar amount, income limit, deadline, or document requirement. If the detail isn't in CANDIDATES, say you don't have it and tell them to ask the agency.
- Do NOT give legal, medical, or financial advice, and NEVER say whether someone qualifies, how much they'd get, or whether they'd be approved - the agency decides. You may describe who a program is generally for.
- If the candidates don't fit, say so plainly instead of padding the answer.

NO HUMAN AGENTS
- You are automated and there is no one to transfer to. Never say or imply that you will connect them to a person, put them through, or that someone will take over.
- If they want a person: dial 2-1-1 (free Georgia helpline, real people, 24/7), or call the agency directly - give its number from CANDIDATES. Mental health crisis: call or text 988.
`.trim();

export async function composeGroundedAnswer(
  question: string,
  candidates: CivicResource[],
  region: string,
): Promise<string | null> {
  if (candidates.length === 0) return null;
  const modelId = process.env.BEDROCK_MODEL_ID || DEFAULT_MODEL_ID;
  const client = new BedrockRuntimeClient({ region });

  // Give the model everything the website itself shows about a program —
  // previously only `summary` was passed, so the bot knew less than the
  // resource page and could only ever answer at headline level.
  const candidateText = candidates
    .slice(0, 3)
    .map((r) =>
      [
        `### ${r.name} (run by ${r.agency})`,
        `Summary: ${r.summary}`,
        `Details: ${r.description}`,
        `Who can get help: ${r.eligibilitySummary}`,
        r.howToApply?.length
          ? `How to apply: ${r.howToApply.join(" ")}`
          : null,
        r.documentsNeeded?.length
          ? `What to bring: ${r.documentsNeeded.join("; ")}`
          : null,
        r.costNote ? `Cost: ${r.costNote}` : null,
        r.commonQuestions?.length
          ? `Common questions:\n${r.commonQuestions
              .map((q) => `  Q: ${q.question}\n  A: ${q.answer}`)
              .join("\n")}`
          : null,
        `Ways to reach them: ${r.channels.join(", ").toLowerCase()}`,
        `Phone: ${r.phone ?? "not published"}`,
        `Web: ${r.url}${r.applicationUrl ? ` | Apply: ${r.applicationUrl}` : ""}`,
        r.languages.length > 1
          ? `Languages: ${r.languages.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

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
        // No `temperature`: sampling params are REMOVED on Claude Sonnet 5
        // and return a ValidationException. Verified live 2026-09-08.
        // Room for a proper answer to "how do I apply / what do I bring"
        // now that the catalog carries those details. Still short enough
        // to be read aloud comfortably on a voice call.
        inferenceConfig: { maxTokens: 700 },
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
    return "I'm not sure I have the right program for that. Dial 2-1-1 to reach a person who can help you look - it is free and answered 24 hours a day.";
  }
  const top = candidates.slice(0, 2);
  const list = top
    .map((r) => `${r.name}${r.phone ? ` at ${r.phone}` : ""}`)
    .join(", and ");
  return `Here's what might help: ${list}. Check the details with the agency before you rely on them. If you would rather talk to a person, dial 2-1-1.`;
}
