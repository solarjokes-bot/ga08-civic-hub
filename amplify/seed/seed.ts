import { readFile } from "node:fs/promises";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import {
  createAndSignUpUser,
  addToUserGroup,
  getSecret,
} from "@aws-amplify/seed";
import type { Schema } from "../data/resource";
import { RESOURCE_SEED } from "../../src/data/resources.seed";
import { CATEGORY_META } from "../../src/lib/categories";

/**
 * Sandbox seed script — Amplify Gen 2.
 * Verified against https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/seed/
 * on 2026-09-06 (@aws-amplify/backend-cli ~1.9). Run with:
 *
 *     npx ampx sandbox seed
 *
 * // LIVE SETUP: this only does anything against a DEPLOYED sandbox — it
 * reads the generated amplify_outputs.json and talks to the real AppSync
 * endpoint. It is a no-op path in offline/demo mode (there is no backend
 * to write to). The frontend reads the SAME RESOURCE_SEED array directly
 * when offline, so the directory works either way.
 *
 * WHAT IT SEEDS
 *  - ResourceCategory: taxonomy rows, from src/lib/categories.ts.
 *  - Resource: the ~30-row civic catalog, from src/data/resources.seed.ts
 *    (the single source of truth — see that file's header for sourcing
 *    rules and `// VERIFY:` notes).
 *  - One `admin` Cognito user, so there's an account that can edit
 *    catalog content and review GuidedSession analytics. Credentials come
 *    from sandbox secrets, never hardcoded:
 *        npx ampx sandbox secret set SEED_ADMIN_EMAIL
 *        npx ampx sandbox secret set SEED_ADMIN_PASSWORD
 */

const outputsUrl = new URL("../../amplify_outputs.json", import.meta.url);
const outputs = JSON.parse(await readFile(outputsUrl, { encoding: "utf8" }));
Amplify.configure(outputs);

const client = generateClient<Schema>();

async function seedCategories() {
  let created = 0;
  for (const meta of Object.values(CATEGORY_META)) {
    const { errors } = await client.models.ResourceCategory.create({
      key: meta.category,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      featuredOnHome: meta.featuredOnHome,
    });
    if (errors?.length) {
      console.error(`  category ${meta.category}:`, errors);
    } else {
      created += 1;
    }
  }
  console.log(`Seeded ${created}/${Object.keys(CATEGORY_META).length} categories.`);
}

async function seedResources() {
  let created = 0;
  for (const r of RESOURCE_SEED) {
    const { errors } = await client.models.Resource.create({
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
      phone: r.phone,
      url: r.url,
      applicationUrl: r.applicationUrl,
      languages: r.languages,
      lastVerified: r.lastVerified,
      keywords: r.keywords,
    });
    if (errors?.length) {
      console.error(`  resource ${r.slug}:`, errors);
    } else {
      created += 1;
    }
  }
  console.log(`Seeded ${created}/${RESOURCE_SEED.length} resources.`);
}

async function seedAdminUser() {
  let email: string;
  let password: string;
  try {
    email = await getSecret("SEED_ADMIN_EMAIL");
    password = await getSecret("SEED_ADMIN_PASSWORD");
  } catch {
    console.warn(
      "Skipping admin user: set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD sandbox secrets to create one.",
    );
    return;
  }
  // @aws-amplify/seed ~1.1 (2026-09): the sign-up flow is tagged.
  const user = await createAndSignUpUser({
    username: email,
    password,
    signInFlow: "Password",
    signInAfterCreation: false,
  });
  await addToUserGroup(user, "admin");
  console.log(`Created admin user ${email} and added to 'admin' group.`);
}

await seedCategories();
await seedResources();
await seedAdminUser();
console.log("Seed complete.");
