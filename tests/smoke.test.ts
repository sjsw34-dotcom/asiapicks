import { test } from "node:test";
import assert from "node:assert/strict";

test("test runner works with path aliases", async () => {
  const mod = await import("@/lib/site");
  assert.equal(typeof mod, "object");
});
