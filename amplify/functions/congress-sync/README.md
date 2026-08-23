# congress-sync (planned — Phase 5)

Scheduled Amplify Function that pulls bills sponsored/cosponsored by
Rep. Austin Scott (bioguide `S001189`) from the Congress.gov API
(`api.congress.gov`, key read from Amplify secret
`CONGRESS_GOV_API_KEY`), upserts them into the `Bill` model, and
generates a neutral, 2-3 sentence plain-language summary of each new
bill via Bedrock.

Not implemented yet — placeholder directory so the structure exists
ahead of Phase 5.
