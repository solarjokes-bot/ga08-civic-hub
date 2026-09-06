# Seed data

`seed.ts` populates a **deployed** Amplify sandbox with:

- **`ResourceCategory`** rows — the taxonomy in `src/lib/categories.ts`.
- **`Resource`** rows — the ~30-entry civic catalog in
  `src/data/resources.seed.ts` (the single source of truth; the frontend
  reads the same array directly in offline/demo mode). Entries carry a
  `lastVerified` date, and anything that couldn't be confirmed from an
  official source has an inline `// VERIFY:` note.
- One **`admin`** Cognito user, if the `SEED_ADMIN_EMAIL` /
  `SEED_ADMIN_PASSWORD` sandbox secrets are set (never hardcoded).

## Run

```bash
npx ampx sandbox        # in one terminal — deploys the backend
npx ampx sandbox seed   # in another — runs seed.ts against it
```

`// LIVE SETUP:` this needs real AWS credentials and a deployed sandbox.
It is a no-op in offline/demo mode — there's no backend to write to, and
the directory already works from the bundled seed array.

## Phase 5

`Legislator`, `Bill`, and `Initiative` seed rows for Rep. Austin Scott
land here in Phase 5, alongside the Congress.gov sync function.
