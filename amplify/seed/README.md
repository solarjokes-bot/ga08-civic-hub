# Seed data

`seed.ts` populates a **deployed** Amplify sandbox with:

- **`ResourceCategory`** rows — the taxonomy in `src/lib/categories.ts`.
- **`Resource`** rows — the ~30-entry civic catalog in
  `src/data/resources.seed.ts` (the single source of truth; the frontend
  reads the same array directly in offline/demo mode). Entries carry a
  `lastVerified` date, and anything that couldn't be confirmed from an
  official source has an inline `// VERIFY:` note.
- Deeper per-program knowledge from `src/data/programKnowledge.ts`,
  merged into the catalog rows.

## Run

```bash
set -a; source .env; set +a     # table names + Connect ids
npm run sandbox:seed            # tsx amplify/seed/seed.ts
```

(`ampx sandbox seed` is not used — see the header of `seed.ts` for why.)

`// LIVE SETUP:` this needs real AWS credentials and a deployed sandbox.
It is a no-op in offline/demo mode — there's no backend to write to, and
the directory already works from the bundled seed array.

## Deeper program knowledge

`src/data/programKnowledge.ts` adds how-to-apply steps, document lists,
cost notes and FAQs for the highest-traffic programs, merged into the
catalog at export. It exists so the chat/voice guide can answer follow-up
questions without a human to escalate to. Every value must come from an
official source — an empty field makes the guide say "ask the agency",
which is correct; a guessed one gets repeated as fact.
