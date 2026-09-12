import { test } from "node:test";
import assert from "node:assert/strict";
import { staleItems } from "@/lib/checks/facts";
import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";

const article = (file: string, path: string, sources: { title: string; checkedAt: string }[]) =>
  ({ file, path, fm: { title: path, sources, status: "published" } }) as never;

const idx = (articles: unknown[]) => ({ hubs: [], articles, categories: [] }) as unknown as ContentIndex;

const offers = (list: { id: string; priceCheckedAt?: string }[]) =>
  new Map(list.map((o) => [o.id, o as Offer]));

test("staleItems reports only sources older than the threshold", () => {
  const items = staleItems(
    idx([
      article("a.mdx", "/a", [
        { title: "fresh", checkedAt: "2026-09-01" },
        { title: "old", checkedAt: "2026-01-01" },
      ]),
    ]),
    offers([]),
    "2026-09-12",
    90,
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].source, "old");
  assert.equal(items[0].path, "/a");
});

test("staleItems sorts oldest first, so the worklist is already prioritised", () => {
  const items = staleItems(
    idx([
      article("a.mdx", "/a", [{ title: "older", checkedAt: "2025-01-01" }]),
      article("b.mdx", "/b", [{ title: "less old", checkedAt: "2026-01-01" }]),
    ]),
    offers([]),
    "2026-09-12",
    90,
  );
  assert.deepEqual(items.map((i) => i.source), ["older", "less old"]);
  assert.ok(items[0].days > items[1].days);
});

test("staleItems includes offer prices and labels them", () => {
  const items = staleItems(idx([]), offers([{ id: "arex", priceCheckedAt: "2025-06-01" }]), "2026-09-12", 90);
  assert.equal(items.length, 1);
  assert.equal(items[0].kind, "offer");
  assert.equal(items[0].path, "arex");
});

test("staleItems ignores offers with no recorded price check", () => {
  assert.deepEqual(staleItems(idx([]), offers([{ id: "x" }]), "2026-09-12", 90), []);
});

test("staleItems honours a custom threshold", () => {
  const one = idx([article("a.mdx", "/a", [{ title: "s", checkedAt: "2026-08-01" }])]);
  assert.equal(staleItems(one, offers([]), "2026-09-12", 90).length, 0);
  assert.equal(staleItems(one, offers([]), "2026-09-12", 30).length, 1);
});
