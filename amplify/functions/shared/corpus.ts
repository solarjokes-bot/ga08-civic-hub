import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { CivicResource } from "../../../src/lib/resourceTypes";
import { RESOURCE_SEED } from "../../../src/data/resources.seed";

/**
 * Load the resource catalog for a Lambda: the live `Resource` DynamoDB
 * table when `RESOURCE_TABLE_NAME` is set (admin edits included), else
 * the build-time seed — the same content. Shared by guided-triage and
 * lex-fulfillment so chat/voice and the /guide wizard ground on the
 * same data.
 */
export async function loadCorpus(region: string): Promise<CivicResource[]> {
  const table = process.env.RESOURCE_TABLE_NAME;
  if (!table) return RESOURCE_SEED;
  try {
    const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
    const items: CivicResource[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const page = await doc.send(
        new ScanCommand({ TableName: table, ExclusiveStartKey }),
      );
      for (const it of page.Items ?? []) items.push(it as CivicResource);
      ExclusiveStartKey = page.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (ExclusiveStartKey);
    return items.length ? items : RESOURCE_SEED;
  } catch (err) {
    console.error("[corpus] Resource table scan failed, using seed:", err);
    return RESOURCE_SEED;
  }
}
