# guided-triage (planned — Phase 3)

Bedrock-powered Amplify Function backing `/guide`. Will:

- Interpret free-text answers to the triage question ladder.
- Decide the next best question (max ~5-6 questions).
- Retrieve matching `Resource` records (Bedrock embeddings + a
  structured filter query — see `docs/architecture.md` for the
  dev-tier retrieval decision) and return a ranked top 3-5 shortlist,
  each with a one-sentence "why this fits" rationale grounded in the
  actual catalog record (never fabricated).
- Log an anonymous `GuidedSession` (no PII).
- Enforce guardrails: no legal/medical/financial advice beyond pointing
  to official resources, no fabricated eligibility determinations,
  escalate distress signals to 988/crisis resources and the human-help
  handoff instead of counseling the user.

Not implemented yet — placeholder directory so the structure exists
ahead of Phase 3.
