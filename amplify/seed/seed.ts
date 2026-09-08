import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  type BatchWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { RESOURCE_SEED } from "../../src/data/resources.seed";
import { CATEGORY_META } from "../../src/lib/categories";

/**
 * Seeds the deployed catalog tables.
 *
 * Run with:
 *   npm run seed
 * (see package.json — it resolves the table names first, then runs this.)
 *
 * WHY NOT `ampx sandbox seed`?
 * `@aws-amplify/seed@1.1.3` pins `aws-amplify` to exactly 6.14.4, while this
 * app runs 6.20.x. `@aws-amplify/core` dropped the `getId` export in between,
 * so the seed runtime dies with:
 *   SyntaxError: The requested module '@aws-amplify/core' does not provide
 *   an export named 'getId'
 * Downgrading the app's runtime Amplify to satisfy a dev-only seeding tool
 * would be the wrong trade, so this writes to DynamoDB directly instead.
 * That also avoids needing an admin Cognito user just to load seed rows —
 * the Resource/ResourceCategory models are admin-write via AppSync, but this
 * script runs with your own AWS credentials against the table itself.
 *
 * TABLE NAMES are passed in as env vars rather than guessed. Amplify names
 * tables `<Model>-<appsyncApiId>-NONE`, and the API id is NOT the hostname in
 * amplify_outputs.json, so it can't be derived from that file. Get them with:
 *
 *   API_ID=$(aws appsync list-graphql-apis \
 *     --query "graphqlApis[?uris.GRAPHQL=='<data.url from amplify_outputs.json>'].apiId | [0]" \
 *     --output text)
 *   export RESOURCE_TABLE_NAME="Resource-$API_ID-NONE"
 *   export RESOURCE_CATEGORY_TABLE_NAME="ResourceCategory-$API_ID-NONE"
 *
 * ADMIN USER (optional, for the /admin write path) — not handled here:
 *   aws cognito-idp admin-create-user --user-pool-id <auth.user_pool_id> \
 *     --username <email> --user-attributes Name=email,Value=<email> Name=email_verified,Value=true
 *   aws cognito-idp admin-add-user-to-group --user-pool-id <id> \
 *     --username <email> --group-name admin
 */

const REGION = process.env.AWS_REGION ?? "us-east-1";
const RESOURCE_TABLE = requireEnv("RESOURCE_TABLE_NAME");
const CATEGORY_TABLE = requireEnv("RESOURCE_CATEGORY_TABLE_NAME");

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(
      `Missing ${name}. See the header of amplify/seed/seed.ts for how to resolve table names.`,
    );
    process.exit(1);
  }
  return v;
}

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const now = new Date().toISOString();

/** DynamoDB BatchWrite caps at 25 items per request. */
async function batchPut(
  table: string,
  items: Record<string, unknown>[],
): Promise<number> {
  let written = 0;
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    // Typed as the SDK's RequestItems so the UnprocessedItems handed back on
    // the retry path (WriteRequest[], with optional Put/DeleteRequest) is
    // assignable — a bare object literal infers too narrowly here.
    let unprocessed: NonNullable<BatchWriteCommandInput["RequestItems"]> = {
      [table]: chunk.map((Item) => ({ PutRequest: { Item } })),
    };
    // Retry whatever DynamoDB throttles back to us.
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await doc.send(
        new BatchWriteCommand({ RequestItems: unprocessed }),
      );
      const left = res.UnprocessedItems?.[table] ?? [];
      written += (unprocessed[table]?.length ?? 0) - left.length;
      if (left.length === 0) break;
      unprocessed = { [table]: left };
      await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
    }
  }
  return written;
}

async function main() {
  const categories = Object.values(CATEGORY_META).map((meta) => ({
    key: meta.category,
    label: meta.label,
    description: meta.description,
    icon: meta.icon,
    featuredOnHome: meta.featuredOnHome,
    __typename: "ResourceCategory",
    createdAt: now,
    updatedAt: now,
  }));

  const resources = RESOURCE_SEED.map((r) => ({
    slug: r.slug,
    name: r.name,
    summary: r.summary,
    description: r.description,
    category: r.category,
    level: r.level,
    agency: r.agency,
    eligibilitySummary: r.eligibilitySummary,
    eligibilityTags: r.eligibilityTags,
    counties: r.counties,
    channels: r.channels,
    ...(r.phone ? { phone: r.phone } : {}),
    url: r.url,
    ...(r.applicationUrl ? { applicationUrl: r.applicationUrl } : {}),
    languages: r.languages,
    lastVerified: r.lastVerified,
    keywords: r.keywords,
    __typename: "Resource",
    createdAt: now,
    updatedAt: now,
  }));

  const c = await batchPut(CATEGORY_TABLE, categories);
  console.log(`Seeded ${c}/${categories.length} categories -> ${CATEGORY_TABLE}`);
  const n = await batchPut(RESOURCE_TABLE, resources);
  console.log(`Seeded ${n}/${resources.length} resources  -> ${RESOURCE_TABLE}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
