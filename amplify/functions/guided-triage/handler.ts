import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Tool,
  type Message,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Schema } from "../../data/resource";
import type { CivicResource } from "../../../src/lib/resourceTypes";
import type {
  TriageAnswers,
  TriageQuestion,
  TriageRecommendation,
  TriageStep,
} from "../../../src/lib/guidedTriage/types";
import { STATIC_QUESTIONS } from "../../../src/lib/guidedTriage/questionLadder";
import { buildProfile, allText } from "../../../src/lib/guidedTriage/profile";
import {
  scoreResources,
  toRecommendation,
  nextActionFor,
  crisisRecommendations,
} from "../../../src/lib/guidedTriage/retrieval";
import { scanForDistress } from "../../../src/lib/guidedTriage/safety";
import { makeSessionId } from "../../../src/lib/guidedTriage/session";
import { RESOURCE_SEED } from "../../../src/data/resources.seed";
import { nextTriageStep } from "../../../src/lib/guidedTriage/localEngine";
import { TRIAGE_SYSTEM_PROMPT } from "./triagePrompt";

/**
 * Bedrock-powered guided triage (Phase 3).
 *
 * Verified 2026-09-06 against:
 *  - @aws-sdk/client-bedrock-runtime Converse API (tool use)
 *  - Amplify Gen 2 custom-query function handlers
 *
 * Contract: takes the answers gathered so far, returns the next
 * `TriageStep` (a question, a grounded result, or a crisis hand-off) —
 * the SAME shape the offline engine returns, so the UI is identical
 * either way.
 *
 * Grounding: the model only ever sees, and may only recommend from, a
 * pre-filtered candidate set drawn from the real catalog. Any slug it
 * returns that isn't in the catalog is dropped. It cannot invent a
 * program, phone number, or URL.
 *
 * Resilience: any model/permission/parse failure falls back to the
 * deterministic offline engine so the visitor still gets help.
 */

const REGION = process.env.AWS_REGION ?? "us-east-1";

// // VERIFY: confirm this id (and that your account has access to it in
// REGION) against the current Bedrock model catalog before deploying —
// https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
// Use the "us." cross-region inference profile in US regions. Override
// with the BEDROCK_MODEL_ID environment variable / Amplify secret.
const DEFAULT_MODEL_ID = "us.anthropic.claude-sonnet-5-20250929-v1:0";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || DEFAULT_MODEL_ID;

const bedrock = new BedrockRuntimeClient({ region: REGION });

export const handler: Schema["guidedTriage"]["functionHandler"] = async (
  event,
) => {
  const answers = parseAnswers(event.arguments.answers);
  const corpus = await loadCorpus();

  // 1. Safety screen — never send a distressed visitor into the model loop.
  if (scanForDistress(allText(answers)).crisis) {
    return crisisStep(corpus);
  }

  // 2. Ground: pre-filter the catalog to a small candidate set.
  const { profile } = buildProfile(answers);
  const scored = scoreResources(corpus, profile);
  const candidates = (scored.length ? scored.map((s) => s.resource) : corpus).slice(
    0,
    12,
  );

  // 3. Ask the model for the next step, grounded in those candidates.
  try {
    const step = await runModel(answers, candidates, corpus);
    if (step) return step;
  } catch (err) {
    console.error("[guided-triage] model call failed, using offline engine:", err);
  }

  // 4. Fallback: deterministic engine.
  return nextTriageStep(answers, corpus);
};

// ───────────────────────── model loop ─────────────────────────

const TOOLS: Tool[] = [
  {
    toolSpec: {
      name: "ask_question",
      description:
        "Ask the visitor ONE more short question to narrow down what they need.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            step: {
              type: "string",
              enum: ["situation", "need", "county", "signals", "channel"],
            },
            title: { type: "string", description: "The question, plain language." },
            help: { type: "string" },
            kind: { type: "string", enum: ["chips", "county", "signals"] },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" },
                  hint: { type: "string" },
                },
                required: ["label", "value"],
              },
            },
            allowText: { type: "boolean" },
            multiSelect: { type: "boolean" },
            allowSkip: { type: "boolean" },
          },
          required: ["step", "title", "kind", "options", "allowText"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "give_recommendations",
      description:
        "Finish the triage: return a ranked shortlist of resources, hand off to a person, or (if distress) show crisis resources.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["results", "no_matches", "crisis"] },
            message: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  slug: {
                    type: "string",
                    description: "Exact slug from the candidate list.",
                  },
                  rationale: {
                    type: "string",
                    description:
                      "One sentence: why this fits what the visitor said.",
                  },
                },
                required: ["slug", "rationale"],
              },
            },
          },
          required: ["mode"],
        },
      },
    },
  },
];

function candidateContext(candidates: CivicResource[]): string {
  const rows = candidates.map((r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category,
    summary: r.summary,
    agency: r.agency,
    counties: r.counties,
    channels: r.channels,
    eligibilityTags: r.eligibilityTags,
    phone: r.phone ?? null,
    url: r.url,
    applicationUrl: r.applicationUrl ?? null,
  }));
  return [
    "CATALOG (the ONLY resources you may recommend — use exact slugs):",
    JSON.stringify(rows, null, 1),
  ].join("\n");
}

function answersTranscript(answers: TriageAnswers): string {
  if (answers.length === 0) return "The visitor has not answered anything yet.";
  return answers
    .map((a) => {
      const picked = a.skipped
        ? "(skipped / prefer not to say)"
        : [a.choices.join(", "), a.text].filter(Boolean).join(" — ");
      return `- ${a.step}: ${picked || "(no answer)"}`;
    })
    .join("\n");
}

async function runModel(
  answers: TriageAnswers,
  candidates: CivicResource[],
  corpus: CivicResource[],
): Promise<TriageStep | null> {
  const messages: Message[] = [
    {
      role: "user",
      content: [
        {
          text: [
            candidateContext(candidates),
            "",
            "Answers so far:",
            answersTranscript(answers),
            "",
            `The visitor has answered ${answers.length} question(s). Ask the next question with "ask_question", or if you have enough (or after ~5 questions) call "give_recommendations". Always use a tool.`,
          ].join("\n"),
        },
      ],
    },
  ];

  const res = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: TRIAGE_SYSTEM_PROMPT }],
      messages,
      inferenceConfig: { maxTokens: 1200, temperature: 0.2 },
      toolConfig: { tools: TOOLS, toolChoice: { any: {} } },
    }),
  );

  const blocks = res.output?.message?.content ?? [];
  const toolUse = blocks.find((b) => "toolUse" in b && b.toolUse)?.toolUse;
  if (!toolUse) return null;

  const input = (toolUse.input ?? {}) as Record<string, unknown>;

  if (toolUse.name === "ask_question") {
    return {
      kind: "question",
      question: coerceQuestion(input),
      progress: { current: answers.length + 1, total: 5 },
    };
  }

  if (toolUse.name === "give_recommendations") {
    const mode = String(input.mode ?? "results");
    if (mode === "crisis") return crisisStep(corpus);

    const recs = groundRecommendations(
      Array.isArray(input.recommendations) ? input.recommendations : [],
      corpus,
      answers,
    );
    return {
      kind: "result",
      recommendations: recs,
      noMatches: mode === "no_matches" || recs.length === 0,
      sessionId: makeSessionId(),
      loggedSummary: {
        ...buildProfile(answers).summary,
        recommendedSlugs: recs.map((r) => r.slug),
      },
    };
  }

  return null;
}

// ───────────────────────── coercion / grounding ─────────────────────────

function coerceQuestion(input: Record<string, unknown>): TriageQuestion {
  const step = String(input.step ?? "situation") as TriageQuestion["id"];
  // For county/signals, prefer our canonical option lists over the model's.
  if (step === "county" || step === "signals") {
    return {
      ...STATIC_QUESTIONS[step],
      title: String(input.title ?? STATIC_QUESTIONS[step].title),
      help: input.help ? String(input.help) : STATIC_QUESTIONS[step].help,
    };
  }
  const rawOptions = Array.isArray(input.options) ? input.options : [];
  return {
    id: step,
    title: String(input.title ?? "What's going on?"),
    help: input.help ? String(input.help) : undefined,
    kind: (input.kind as TriageQuestion["kind"]) ?? "chips",
    options: rawOptions
      .map((o) => o as Record<string, unknown>)
      .filter((o) => o && o.label && o.value)
      .map((o) => ({
        label: String(o.label),
        value: String(o.value),
        hint: o.hint ? String(o.hint) : undefined,
      })),
    allowText: input.allowText !== false,
    multiSelect: input.multiSelect === true,
    allowSkip: input.allowSkip !== false,
  };
}

/**
 * Keep only recommendations whose slug is a REAL catalog row. Build the
 * card from the catalog row (trusted) + the model's rationale (advisory).
 */
function groundRecommendations(
  raw: unknown[],
  corpus: CivicResource[],
  answers: TriageAnswers,
): TriageRecommendation[] {
  const { profile } = buildProfile(answers);
  const preferred = profile.channels.find((c) => c !== ("ANY" as never));
  const out: TriageRecommendation[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const rec = item as Record<string, unknown>;
    const slug = String(rec.slug ?? "");
    if (!slug || seen.has(slug)) continue;
    const row = corpus.find((r) => r.slug === slug);
    if (!row) {
      console.warn(`[guided-triage] model recommended unknown slug "${slug}" — dropped`);
      continue;
    }
    seen.add(slug);
    out.push({
      slug: row.slug,
      name: row.name,
      category: row.category,
      summary: row.summary,
      rationale:
        typeof rec.rationale === "string" && rec.rationale.trim()
          ? rec.rationale.trim()
          : toRecommendation({ resource: row, score: 0, reasons: [] }, profile)
              .rationale,
      nextAction: nextActionFor(row, preferred),
    });
    if (out.length >= 5) break;
  }
  return out;
}

function crisisStep(corpus: CivicResource[]): TriageStep {
  return {
    kind: "crisis",
    message:
      "It sounds like you're going through something really hard, and you deserve support right now. The lines below are free, confidential, and open 24/7. If you're in immediate danger, call 911.",
    resources: crisisRecommendations(corpus),
  };
}

// ───────────────────────── corpus loading ─────────────────────────

async function loadCorpus(): Promise<CivicResource[]> {
  const table = process.env.RESOURCE_TABLE_NAME;
  if (!table) {
    // // LIVE SETUP: grant this function read on the Resource table and
    // set RESOURCE_TABLE_NAME (see amplify/backend.ts) so admin edits to
    // the catalog are reflected. Until then the build-time seed — the
    // same content — is the grounding corpus.
    return RESOURCE_SEED;
  }
  try {
    const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
    const items: CivicResource[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const page = await doc.send(
        new ScanCommand({ TableName: table, ExclusiveStartKey }),
      );
      for (const it of page.Items ?? []) items.push(it as CivicResource);
      ExclusiveStartKey = page.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (ExclusiveStartKey);
    return items.length ? items : RESOURCE_SEED;
  } catch (err) {
    console.error("[guided-triage] Resource table scan failed, using seed:", err);
    return RESOURCE_SEED;
  }
}

function parseAnswers(raw: unknown): TriageAnswers {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed as TriageAnswers;
  } catch (err) {
    console.warn("[guided-triage] could not parse answers:", err);
  }
  return [];
}
