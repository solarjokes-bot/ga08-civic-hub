import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetResourceCache } from "@/lib/resourceCatalog";

// Reset shared module state between tests so each starts clean.
afterEach(() => {
  cleanup();
  resetResourceCache();
});
