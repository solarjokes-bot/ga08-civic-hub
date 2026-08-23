# Exported Connect flows & Lex bot definitions

Empty for now. Once the Amazon Connect instance and Lex V2 bot exist
(Phase 4, see [../connect-setup.md](../connect-setup.md)), this
directory will hold:

- The exported inbound contact flow JSON.
- The Lex V2 bot export (intents, slots, fallback intent wired to
  `amplify/functions/lex-fulfillment`).

Keeping these version-controlled lets a rebuilt Connect instance be
reconstructed from source rather than console memory.
