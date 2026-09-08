# Amazon Connect setup runbook (Phase 4)

Status: **LIVE and verified end-to-end** in account `352223710766`,
`us-east-1`, on 2026-09-08. A real browser chat reached the Lex bot, the
fulfillment Lambda retrieved from DynamoDB, Bedrock wrote a grounded
answer naming real catalog resources, and "talk to a person" routed to a
queue. `StartWebRTCContact` returns a valid Chime meeting + attendee.

## Provisioned resources (this deployment)

| Thing | Id |
|---|---|
| Connect instance `ga08-civic-hub` | `9c1c2dce-2cbd-420c-8b3b-012e990f6f64` |
| Hours `GA08 Staffed Hours` | `ba6123f8-4990-407a-8ad5-6d86e44c4496` |
| Queue `General Help` | `1173ef72-456e-4bfd-aec6-8053375f3a57` |
| Queue `Veterans` | `f7a32876-15ea-4734-8822-c62ceb14f535` |
| Queue `Housing` | `14ec4551-5928-4090-ad9c-9355700fa59d` |
| Routing profile `GA08 Agents` | `cd92c5b8-66c4-401c-a816-d5d97e283bc8` |
| Lex bot `GA08SupportBot` / alias `prod` | `3CHIKCQIPT` / `DSAZUSCGT2` |
| Contact flow | `bd237d4b-d510-4576-a102-388abd83e8f2` |
| AppSync API id (for table names) | `u2chp54osfhvfjoarrlk63kchy` |

These live in a gitignored `.env`; source it before deploying:
`set -a; source .env; set +a; npx ampx sandbox`

## Gotchas found while doing this for real

Things the docs don't warn you about, all of which cost a deploy cycle:

- **`ampx sandbox seed` is unusable here.** `@aws-amplify/seed@1.1.3` pins
  `aws-amplify` to exactly `6.14.4`; this app runs `6.20.x`, and
  `@aws-amplify/core` dropped the `getId` export in between, so the seed
  runtime dies with a `SyntaxError`. `amplify/seed/seed.ts` now writes to
  DynamoDB directly (`npx tsx amplify/seed/seed.ts` with the two
  `*_TABLE_NAME` vars). That also sidesteps needing an admin Cognito user
  just to load rows.
- **Lex in a flow is `ConnectParticipantWithLexBot`, not
  `GetParticipantInput`.** The latter rejects a `LexV2Bot` parameter and
  demands `StoreInput`.
- **`Compare` blocks need a `NoMatchingCondition` error handler**, not
  `NoMatchingError`.
- **Keep flow prompt text ASCII-only.** An em-dash uploaded via
  `--content file://` came back as `â€"` in the live transcript (and would
  be read aloud by TTS on voice contacts).
- **Amplify table names use the AppSync *API id*, which is NOT the
  hostname** in `amplify_outputs.json`. Resolve it with
  `aws appsync list-graphql-apis` and match on `uris.GRAPHQL`.
- **Functions that are data resolvers must set
  `resourceGroupName: "data"`** in `defineFunction`, or CloudFormation
  fails with a circular dependency between the data and function nested
  stacks.

---

## Original runbook (for a fresh instance)

Status if you're starting from scratch: **code + IaC complete.**
Amazon Connect instance creation, Lex bot import, and contact-flow
authoring need console/CLI steps that aren't expressible as Amplify Gen 2
IaC, so they live here. The version-controlled parts are:

| Part | Where |
|---|---|
| Lex fulfillment Lambda | `amplify/functions/lex-fulfillment/` |
| Contact-start broker (chat + WebRTC voice) | `amplify/functions/connect-contact/` |
| Least-privilege IAM for both | `amplify/backend.ts` |
| Inbound contact flow (import into Connect) | `docs/connect-flows/inbound-flow.json` |
| Lex V2 bot definition (import into Lex) | `docs/connect-flows/lex-bot.json` |
| Frontend chat + voice widgets | `src/components/help/`, `src/lib/connect/` |

> **Cost gate.** An Amazon Connect instance has **no base fee**, but you
> pay per chat message and per voice minute once there's traffic, and a
> **claimed phone number is ~$1–$25/month**. Web voice via WebRTC does
> **not** require a claimed number. Do not provision anything below
> without the project owner's go-ahead.

---

## 0. Prerequisites

- The Amplify backend deployed (`npx ampx sandbox` or a Hosting branch),
  so `connect-contact` and `lex-fulfillment` Lambdas exist. Note their
  ARNs: `aws lambda list-functions --query "Functions[?contains(FunctionName, 'lex-fulfillment') || contains(FunctionName, 'connect-contact')].FunctionArn"`.
- A `BEDROCK_MODEL_ID` your account can invoke in the instance's Region
  (see `.env.example`).

## 1. Create the Connect instance

Console: **Amazon Connect → Add an instance**.

- **Identity management:** *Store users in Amazon Connect* (no directory
  needed — there are no citizen logins; agents are staff).
- **Admin:** create one admin login.
- **Telephony:** **uncheck "Incoming calls"** and **uncheck "Outbound
  calls"** — this project uses in-app web calling only, no PSTN. (You can
  enable them later if you want a fallback phone line.)
- **Data storage:** accept defaults (S3 bucket for recordings/transcripts).

CLI equivalent:

```bash
aws connect create-instance \
  --identity-management-type CONNECT_MANAGED \
  --inbound-calls-enabled --no-outbound-calls-enabled \
  --instance-alias ga08-civic-hub
# note the Id and Arn from the response
```

> `--inbound-calls-enabled` is required by the API even though we won't
> claim a number; WebRTC contacts are "inbound" from Connect's point of
> view.

Record the **instance ID** (GUID) → this is `CONNECT_INSTANCE_ID`.

## 2. Enable Chat and Web/WebRTC calling

- **Chat** is on by default for `CONNECT_MANAGED` instances.
- **Web/in-app/video calling:** Console → your instance → **Telephony**
  → enable **"Enable Web and in-app calling"**. (Or it's available once
  the instance exists; `StartWebRTCContact` will fail with
  `AccessDeniedException` until it's on.)

## 3. Hours of operation

Console → **Routing → Hours of operation → New**.

- Name: `GA08 Staffed Hours`
- Time zone: `America/New_York`
- Mon–Fri 08:00–18:00; Sat/Sun closed.

Keep the config value `SUPPORT_HOURS` in `src/lib/connect/config.ts` in
sync with whatever you set here (`// VERIFY:` note is there).

## 4. Queues + routing profile

Console → **Routing → Queues → New queue** (Hours of operation =
`GA08 Staffed Hours` for each):

| Queue | Purpose |
|---|---|
| `General Help` | default |
| `Veterans` | veteran / military callers |
| `Housing` | rent, eviction, utilities |

Console → **Users → Routing profiles → New**: `GA08 Agents`, default
queue `General Help`, add all three queues, channels **Chat** and
**Voice** (concurrency 1–3 as you like). Assign staff users to it.

## 5. Import the Lex V2 bot

1. **Lex console → Bots → Import.** Upload `docs/connect-flows/lex-bot.json`
   (zip it first if the console asks: `zip lex-bot.zip lex-bot.json`).
   The import creates bot **GA08SupportBot** with locale `en_US` and the
   intents in `intentMap.ts` (`HousingHelp`, `FoodHelp`, …, `TalkToAgent`,
   `FallbackIntent`).
2. For **every intent**, set the **Fulfillment → Lambda function** to the
   `lex-fulfillment` Lambda (alias `$LATEST` for dev; a published alias
   for prod). `amplify/backend.ts` already grants
   `lexv2.amazonaws.com` permission to invoke it.
3. **Build** the locale, then **Create a version** and an **alias**
   (`prod`). Note the **bot ID** and **alias ID**.
4. **Associate the bot with the Connect instance:**

```bash
aws connect associate-bot \
  --instance-id "$CONNECT_INSTANCE_ID" \
  --lex-v2-bot AliasArn=arn:aws:lex:us-east-1:ACCOUNT:bot-alias/BOT_ID/ALIAS_ID
```

5. Tighten IAM: in `amplify/backend.ts`, replace the `sourceAccount`-only
   permission on `lexFulfillment` with `sourceArn` = the bot-alias ARN,
   and redeploy.

## 6. Import the contact flow

1. **Connect console → Routing → Flows → Create flow → (⋮) Import flow.**
   Upload `docs/connect-flows/inbound-flow.json`.
2. Fix up the references the export can't carry:
   - **Get customer input / Lex** block → pick `GA08SupportBot` + alias.
   - **Set working queue** blocks → map `General Help` / `Veterans` /
     `Housing` to your queue ARNs.
   - **Hours of operation check** → `GA08 Staffed Hours`.
3. **Save** and **Publish**. Under **Show additional flow information**,
   copy the **flow ID** (last path segment of the ARN). Use the same
   flow for both `CONNECT_CHAT_CONTACT_FLOW_ID` and
   `CONNECT_VOICE_CONTACT_FLOW_ID`, or clone it if you want different
   greetings per channel.

What the flow does: greet → check hours → run the Lex bot (bot answers
via `lex-fulfillment` → Bedrock) → loop for follow-ups → on `TalkToAgent`
(or the bot setting `handoff=true`) read `routeToQueue` from session
attributes, set the working queue, and transfer to queue → if outside
hours or no agents, play a message pointing to 2-1-1 and disconnect.

## 7. Set the backend env vars and redeploy

```bash
npx ampx sandbox secret set CONNECT_INSTANCE_ID           # step 1
npx ampx sandbox secret set CONNECT_CHAT_CONTACT_FLOW_ID  # step 6
npx ampx sandbox secret set CONNECT_VOICE_CONTACT_FLOW_ID # step 6
npx ampx sandbox secret set BEDROCK_MODEL_ID              # see .env.example
npx ampx sandbox   # redeploy so the Lambdas pick up the values
```

For **Amplify Hosting**, set the same names as environment variables on
the branch instead.

## 8. Turn on the frontend

In the frontend env (`.env` / Hosting env):

```
VITE_CONNECT_CHAT_ENABLED=true
VITE_CONNECT_VOICE_ENABLED=true   # only after step 2 + a real test call
```

Rebuild. `/help` now shows the live chat launcher and the "Call for help
from your browser" button. Until then it shows a graceful "not connected"
message and points to 2-1-1 / the resource directory.

## 9. Credential path (how the browser starts a contact — no AWS keys client-side)

1. Browser calls the AppSync **`startSupportContact`** mutation with the
   **public API key** (no user, no AWS creds).
2. AppSync invokes **`connect-contact`** (Lambda), which uses its own
   IAM role (`connect:StartChatContact` / `connect:StartWebRTCContact`,
   scoped to the instance) to call the Connect API.
3. Connect returns short-lived **participant tokens** (chat) or a **Chime
   SDK meeting + attendee join token** (voice). The Lambda returns only
   those to the browser.
4. Browser uses `amazon-connect-chatjs` (chat) or `amazon-chime-sdk-js`
   (voice) with those tokens. Tokens are per-contact and expire with the
   contact; there is nothing long-lived and no AWS signing in the client.

## 10. Verify (live)

- **Chat:** open `/help`, Start a chat, send "I need help with rent" →
  the bot replies via `lex-fulfillment` naming real catalog resources.
  Say "talk to a person" → routed to the `Housing` queue; answer from the
  agent CCP.
- **Voice:** click "Call for help from your browser", allow the mic →
  states go requesting-mic → connecting → ringing → connected; the timer
  runs; Mute toggles; End call hangs up cleanly.
- **Distress:** type "I want to hurt myself" in chat → the bot returns
  988 / GCAL immediately, no triage.
- **axe / keyboard:** tab through `/help`; every control is reachable and
  labelled; the transcript announces new messages; the mute button
  reports `aria-pressed`.
