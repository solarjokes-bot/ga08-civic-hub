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
3. ⬜ **AI Guided Help** — `/guide` wizard, Bedrock triage function, retrieval over the catalog.
4. ⬜ **Amazon Connect** — Lex bot, contact flows, chat widget, web voice button, setup runbook. *(Pause for review after this phase.)*
5. ⬜ **Representative section** — seed content, Congress.gov sync, Bedrock plain-language bill summaries, legislation/initiatives pages.
6. ⬜ **Accessibility, performance, docs** — axe pass, Lighthouse, final docs.

## What's real vs. stubbed

**Real / working now:**
- App shell, routing for the full information architecture, Tailwind design tokens tuned for WCAG AA contrast, skip link, focus-visible styling, reduced-motion support.
- **Resource directory** — `/resources` faceted search (category, who-it's-for, channel, language, GA-08 county) with live facet counts, URL-synced shareable filters, `aria-live` result count, mobile filter toggle; `/resources/:slug` detail pages with contact channels, official-site links, related resources, and a "confirm with the agency" trust note.
- **Seed catalog** — ~30 real Georgia programs in `src/data/resources.seed.ts`, each with a `lastVerified` date; unconfirmed details carry inline `// VERIFY:` notes. The frontend reads this array directly in offline mode and the live `Resource` table when a backend is deployed (`src/lib/resourceCatalog.ts`).
- Amplify Gen 2 `auth` (Cognito, `admin` group), `data` (`Resource` / `ResourceCategory` / `GuidedSession`, public API-key read + `admin` write), and `amplify/seed/seed.ts` — valid code, **not yet deployed**.
- Offline-mode detection so the app never silently pretends to be connected to a backend it isn't.
- Tests: `src/lib/resourceFilters.test.ts` (filter/facet/URL logic) and route tests for `/resources` + `/resources/:slug` including `jest-axe` checks.

**Stubbed (placeholder UI, no backend yet):**
- `/guide` — placeholder; real Bedrock-powered wizard lands Phase 3 (the `GuidedSession` model is already defined so it needs no schema change).
- `/help` — placeholder; real Connect chat/voice lands Phase 4.
- `/representative`, `/representative/legislation`, `/representative/initiatives` — placeholders; real content + Congress.gov sync lands Phase 5.

**Not started:** everything under `amplify/functions/*` beyond a README each; `Legislator`/`Bill`/`Initiative` models + seed; `docs/connect-flows/`; Bedrock/Connect/Lex integration of any kind; Amplify Hosting connection; Lighthouse pass; i18n runtime library (Phase 2 strings are externalised in `src/i18n/en/`, ready for it).

## Project structure

```
/            React + Vite app (src/)
/amplify     Gen 2 backend: data/, auth/, functions/ (mostly placeholders — see each README)
/docs        architecture.md, connect-setup.md, connect-flows/
.env.example
```
