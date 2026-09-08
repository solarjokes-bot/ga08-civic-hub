# GA-08 Civic Resource Hub

A free, non-partisan guide to public and government resources for
residents of Georgia's 8th Congressional District — with AI-guided
triage, live chat, and browser-based voice help, plus a factual
overview of Rep. Austin Scott's committee work and legislation.

**This is an unofficial, independent project** — not run by or
affiliated with Rep. Scott's office. See [`/about`](src/routes/About.tsx)
and [`/accessibility`](src/routes/Accessibility.tsx) in the app.

## Status: Phase 2 of 6 (resource directory)

See [Build order](#build-order) below. The app now has:

- **Phase 1** — app shell, full-IA routing, WCAG-tuned Tailwind design
  system, Amplify Gen 2 `auth` + `data` definitions.
- **Phase 2** — the resource directory: `Resource` / `ResourceCategory` /
  `GuidedSession` data models, a ~30-entry verified Georgia seed catalog
  (`src/data/resources.seed.ts`), the faceted `/resources` list, and
  `/resources/:slug` detail pages. Works fully offline against the seed;
  reads the live backend when one is deployed.

**No AWS resources have been deployed** — see
[What's real vs. stubbed](#whats-real-vs-stubbed).

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite, React Router, Zustand, Tailwind CSS v4.
- **Backend:** AWS Amplify Gen 2 (Amplify Data/AppSync/DynamoDB, Amplify Auth/Cognito, Amplify Functions/Lambda).
- **AI:** Amazon Bedrock (Claude via Bedrock Runtime) — planned, Phase 3.
- **Contact center:** Amazon Connect (Chat + web voice) with an Amazon Lex V2 bot — planned, Phase 4.
- **Hosting:** Amplify Hosting, Git-based CI/CD.

## Local development

> **On `package.json` versions:** pinned to floors that are known to be
> mutually compatible and have been exercised here via a real
> `npm install` + `tsc` + `eslint` + `vitest` + `vite build`. Newer
> majors exist for several packages (e.g. Vite 8, ESLint 10, React
> Router 7, Vitest 5) as of September 2026; Vitest is intentionally held
> at 3.x because 4.x/5.x require Vite 6+. Run `npm outdated` and upgrade
> deliberately (one major at a time, re-testing) if you want newer.

```bash
npm install
npm run dev        # app at http://localhost:5173
npm test           # Vitest: filter logic + directory a11y/interaction
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint
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
Then load the seed catalog into it:

```bash
npm run sandbox:seed   # runs amplify/seed/seed.ts against the sandbox
```

Optionally set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` sandbox
secrets first (`npx ampx sandbox secret set …`) to have the seed create
an `admin` Cognito user. The frontend reads the same seed array directly
when no backend is deployed, so the directory works either way.

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

1. ✅ **Scaffold** — Vite+React+TS app, Amplify Gen 2 backend skeleton.
2. ✅ **Resource directory** — `Resource`/`ResourceCategory`/`GuidedSession` models, ~30-entry verified Georgia seed catalog, faceted `/resources` list + `/resources/:slug` detail, URL-synced filters. *(Pause for review after this phase.)*
3. ✅ **AI Guided Help** — `/guide` conversational wizard, `guidedTriage` Bedrock Lambda + custom query, grounded lexical retrieval over the catalog, deterministic offline engine, distress → 988 hand-off, anonymous `GuidedSession` logging.
4. ✅ **Amazon Connect** — `/help` live-support hub, custom `amazon-connect-chatjs` chat widget (+ hosted-widget fallback), in-browser WebRTC voice (`amazon-chime-sdk-js`), `connect-contact` + `lex-fulfillment` Lambdas, `startSupportContact` mutation, exported contact flow + Lex bot (`docs/connect-flows/`), and the `docs/connect-setup.md` runbook. **Instance not provisioned** (cost gate). *Code-only-unverified — see the note below.* *(Pause for review after this phase.)*
5. ⬜ **Representative section** — seed content, Congress.gov sync, Bedrock plain-language bill summaries, legislation/initiatives pages.
6. ⬜ **Accessibility, performance, docs** — axe pass, Lighthouse, final docs.

## What's real vs. stubbed

**Real / working now:**
- App shell, routing for the full information architecture, Tailwind design tokens tuned for WCAG AA contrast, skip link, focus-visible styling, reduced-motion support.
- **Resource directory** — `/resources` faceted search (category, who-it's-for, channel, language, GA-08 county) with live facet counts, URL-synced shareable filters, `aria-live` result count, mobile filter toggle; `/resources/:slug` detail pages with contact channels, official-site links, related resources, and a "confirm with the agency" trust note.
- **Seed catalog** — ~30 real Georgia programs in `src/data/resources.seed.ts`, each with a `lastVerified` date; unconfirmed details carry inline `// VERIFY:` notes. The frontend reads this array directly in offline mode and the live `Resource` table when a backend is deployed (`src/lib/resourceCatalog.ts`).
- **AI Guided Help** — `/guide` asks 4–5 plain-language questions (large chips + free-text, progress bar, "I'm not sure", Back), then shows a ranked shortlist with a "why this fits" line and a next step per item, plus an always-offered "talk to a person" hand-off. A keyword screen routes anyone in distress straight to 988 / the Georgia Crisis & Access Line instead of triaging. Every recommendation is a real catalog row — the flow never invents a program, phone, or URL. Runs a deterministic offline engine now; calls the Bedrock Lambda automatically once a backend is deployed.
- **Live support (`/help`)** — a support hub with hours, "what to expect", an accessible custom chat widget (transcript `role="log"`/`aria-live`, labelled input, typing indicator), and an accessible "Call for help from your browser" WebRTC button (mic-permission messaging, connecting/ringing/connected states, mute with `aria-pressed`, a visible mm:ss timer, End call). Backed by `connect-contact` (StartChatContact / StartWebRTCContact) and `lex-fulfillment` (intent → retrieval → grounded Bedrock answer; distress → 988; "talk to a person" → topic-routed queue). Until the Connect instance is provisioned, `/help` shows a "not connected — dial 2-1-1" state.
- Amplify Gen 2 `auth` (Cognito, `admin` group), `data` (`Resource` / `ResourceCategory` / `GuidedSession` + `guidedTriage` query + `startSupportContact` mutation), `amplify/seed/seed.ts`, and `amplify/functions/{guided-triage,connect-contact,lex-fulfillment}` with least-privilege IAM in `backend.ts` — valid code, **not yet deployed**.
- `docs/connect-flows/inbound-flow.json` (importable Connect flow) + `docs/connect-flows/lex-bot.json` (GA08SupportBot design) + `docs/connect-setup.md` (step-by-step runbook incl. the no-AWS-keys-client-side credential path).
- Offline-mode detection so the app never silently pretends to be connected to a backend it isn't.
- Tests (~63): `resourceFilters`, `guidedTriage/{safety,retrieval,localEngine}`, `connect/{voiceSession,config,lexIntentMap}`, and route tests for `/resources`, `/resources/:slug`, `/guide` including `jest-axe` checks.

**Stubbed (placeholder UI, no backend yet):**
- `/representative`, `/representative/legislation`, `/representative/initiatives` — placeholders; real content + Congress.gov sync lands Phase 5.
- The **live Bedrock/Connect paths** are authored but unexercised — no sandbox and no Connect instance are deployed. `/guide` uses the deterministic offline engine; `/help` shows the "not connected" state. `BEDROCK_MODEL_ID` (`// VERIFY:` in the handlers) must be confirmed against the current Bedrock catalog before deploy.
- The **live Connect paths are unexercised** — no Connect instance is provisioned, so `/help` shows the "not connected" state. Verified in the browser that both the unconfigured state and (with the flags on) the chat/voice launchers render, and that starting a chat with no backend degrades to the 2-1-1 message rather than a broken widget.

**Not started:** `amplify/functions/congress-sync`; `Legislator`/`Bill`/`Initiative` models + seed; Amplify Hosting connection; Lighthouse pass; i18n runtime library (strings are externalised in `src/i18n/en/`, ready for it).

## Project structure

```
/            React + Vite app (src/)
/amplify     Gen 2 backend: data/, auth/, functions/ (mostly placeholders — see each README)
/docs        architecture.md, connect-setup.md, connect-flows/
.env.example
```
