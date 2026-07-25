import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { TtlCache } from "./cache.ts";

function tempFile(): string {
  return join(mkdtempSync(join(tmpdir(), "cache-")), "cache.json");
}

test("TtlCache returns what was stored", () => {
  const cache = new TtlCache<string>(60_000);
  cache.set("a", "nilai");
  assert.equal(cache.get("a"), "nilai");
  assert.equal(cache.get("tidak ada"), null);
});

test("TtlCache treats a zero TTL as disabled", () => {
  const cache = new TtlCache<string>(0);
  cache.set("a", "nilai");
  assert.equal(cache.get("a"), null);
});

test("TtlCache survives a restart through its file", () => {
  const path = tempFile();

  const first = new TtlCache<{ verdict: string }>(60_000, path);
  first.set("AAPL:moderate", { verdict: "BUY" });

  const second = new TtlCache<{ verdict: string }>(60_000, path);

  assert.deepEqual(second.get("AAPL:moderate"), { verdict: "BUY" });

  rmSync(path, { force: true });
});

test("TtlCache drops entries that already expired on disk", () => {
  const path = tempFile();
  writeFileSync(
    path,
    JSON.stringify({ lama: { value: "basi", expiresAt: Date.now() - 1_000 } }),
    "utf8",
  );

  const cache = new TtlCache<string>(60_000, path);

  assert.equal(cache.get("lama"), null);

  rmSync(path, { force: true });
});

test("TtlCache starts clean when the file is corrupt", () => {
  const path = tempFile();
  writeFileSync(path, "bukan json sama sekali", "utf8");

  const cache = new TtlCache<string>(60_000, path);

  assert.equal(cache.get("apa pun"), null);
  cache.set("a", "nilai");
  assert.equal(cache.get("a"), "nilai");

  rmSync(path, { force: true });
});
