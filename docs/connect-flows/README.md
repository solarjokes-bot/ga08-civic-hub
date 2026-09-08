# Exported Connect flows & Lex bot definitions

Version-controlled source for the Amazon Connect pieces that live in the
console. See [../connect-setup.md](../connect-setup.md) for how to import
them and wire up the references they can't carry.

| File | What it is | How to use |
|---|---|---|
| `inbound-flow.json` | The inbound contact flow (chat + WebRTC voice): greet → check hours → Lex bot (Bedrock-backed answers) → topic-routed hand-off to a queue. Flow language `2019-10-30`. | Connect console → Routing → Flows → **Import flow**. Then remap the Lex bot alias, the 3 queue ARNs, and the hours-of-operation id (marked `REPLACE_WITH_*`). |
| `lex-bot.json` | Design spec for **GA08SupportBot** — every intent, its sample utterances, and the fulfillment-hook wiring. Intent names match `amplify/functions/lex-fulfillment/intentMap.ts`. | Recreate via the Lex console or `aws lexv2-models` CLI (both paths in the runbook). Set the `lex-fulfillment` Lambda as the fulfillment hook on **every** intent. |

The bot is deliberately thin: it classifies the intent, and the
`lex-fulfillment` Lambda does retrieval + the grounded Bedrock answer, so
chat/voice give the same answers as the `/guide` wizard.
