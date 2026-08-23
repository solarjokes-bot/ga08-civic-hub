# GA-08 Civic Resource Hub

A free, non-partisan guide to public and government resources for
residents of Georgia's 8th Congressional District — with AI-guided
triage, live chat, and browser-based voice help, plus a factual
overview of Rep. Austin Scott's committee work and legislation.

**This is an unofficial, independent project** — not run by or
affiliated with Rep. Scott's office. See [`/about`](src/routes/About.tsx)
and [`/accessibility`](src/routes/Accessibility.tsx) in the app.

## Status: Phase 1 of 6 (scaffold)

See [Build order](#build-order) below. This commit contains the app
shell, routing, styling system, and the Amplify Gen 2 backend skeleton
(auth + a smoke-test data model). **No AWS resources have been
deployed** — see [What's real vs. stubbed](#whats-real-vs-stubbed).

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite, React Router, Zustand, Tailwind CSS v4.
- **Backend:** AWS Amplify Gen 2 (Amplify Data/AppSync/DynamoDB, Amplify Auth/Cognito, Amplify Functions/Lambda).
- **AI:** Amazon Bedrock (Claude via Bedrock Runtime) — planned, Phase 3.
- **Contact center:** Amazon Connect (Chat + web voice) with an Amazon Lex V2 bot — planned, Phase 4.
- **Hosting:** Amplify Hosting, Git-based CI/CD.

## Local development

> **This scaffold was authored in an environment without Node.js/npm
> installed**, so none of the commands below have been run yet by
> Claude — they're written against the documented/current CLI syntax,
> but you should be the first to actually run them and report back if
> anything's off.

```bash
npm install
npm run dev
```

The app runs in **offline/demo mode** without a deployed backend (see
`src/lib/amplify.ts`) — static pages work, and a dev-only banner says
so. To connect a real dev backend:

```bash
npm run sandbox
```

This deploys a personal Amplify sandbox (Cognito + AppSync + DynamoDB
for the current schema) and writes a real `amplify_outputs.json`.
Requires AWS credentials configured locally (`aws configure` / SSO).

## Deploy (production)

Not yet configured. Phase 1 doesn't include a Hosting connection. When
ready: connect this repo to Amplify Hosting via the console or
`ampx pipeline-deploy` in your CI, per
[Amplify Hosting docs](https://docs.amplify.aws/react/deploy-and-host/).

## Cost notes

Nothing in this repo provisions AWS resources on its own — `npm run
sandbox` does, and only when you run it. Rough shape of ongoing costs
once later phases are live, so you can budget before approving each:

| Component | Phase | Cost shape |
|---|---|---|
| AppSync + DynamoDB + Cognito (sandbox/prod) | 1-2 | Pay-per-request, low at this traffic scale |
| Bedrock Runtime (Claude calls) | 3, 5 | Pay-per-token, scales with usage |
| Retrieval for guided help | 3 | Dev-tier: DynamoDB/Aurora embeddings, low cost. **Not** OpenSearch Serverless (~$700+/mo minimum) — see `docs/architecture.md` |
| Amazon Connect instance | 4 | No base fee for the instance itself; usage-based (chat/voice minutes) once traffic exists |
| Claimed phone number | 4 | ~$1-$25/mo depending on type — **only if** you want traditional phone dial-in; web voice via WebRTC doesn't require one |
| Amplify Hosting | 6 | Small monthly + build-minute cost |

**Nothing above gets provisioned without asking you first**, per this
project's ground rules — especially the Connect instance and any
vector-store choice.

## Build order

1. ✅ **Scaffold** — Vite+React+TS app, Amplify Gen 2 backend skeleton (this commit).
2. ⬜ **Resource directory** — full data model, seed data, `/resources` list + detail, faceted search. *(Pause for review after this phase.)*
3. ⬜ **AI Guided Help** — `/guide` wizard, Bedrock triage function, retrieval over the catalog.
4. ⬜ **Amazon Connect** — Lex bot, contact flows, chat widget, web voice button, setup runbook. *(Pause for review after this phase.)*
5. ⬜ **Representative section** — seed content, Congress.gov sync, Bedrock plain-language bill summaries, legislation/initiatives pages.
6. ⬜ **Accessibility, performance, docs** — axe pass, Lighthouse, final docs.

## What's real vs. stubbed

**Real / working now:**
- App shell, routing for the full information architecture, Tailwind design tokens tuned for WCAG AA contrast, skip link, focus-visible styling, reduced-motion support.
- Amplify Gen 2 `auth` (Cognito, `admin` group) and `data` (one smoke-test model) definitions — valid code, not yet deployed.
- Offline-mode detection so the app never silently pretends to be connected to a backend it isn't.

**Stubbed (placeholder UI, no backend yet):**
- `/resources`, `/resources/:slug` — "coming soon" pages; real directory lands Phase 2.
- `/guide` — placeholder; real Bedrock-powered wizard lands Phase 3.
- `/help` — placeholder; real Connect chat/voice lands Phase 4.
- `/representative`, `/representative/legislation`, `/representative/initiatives` — placeholders; real content + Congress.gov sync lands Phase 5.

**Not started:** everything under `amplify/functions/*` beyond a README each; `amplify/seed/`; `docs/connect-flows/`; Bedrock/Connect/Lex integration of any kind; Amplify Hosting connection; axe/Lighthouse testing.

## Project structure

```
/            React + Vite app (src/)
/amplify     Gen 2 backend: data/, auth/, functions/ (mostly placeholders — see each README)
/docs        architecture.md, connect-setup.md, connect-flows/
.env.example
```
