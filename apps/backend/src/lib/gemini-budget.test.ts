import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { GeminiBudget, pacificDate } from "./gemini-budget.ts";

function tempFile(): string {
  return join(mkdtempSync(join(tmpdir(), "budget-")), "budget.json");
}

test("GeminiBudget counts per model, not globally", () => {
  const budget = new GeminiBudget(3);

  budget.record("flash");
  budget.record("flash");

  assert.equal(budget.used("flash"), 2);
  assert.equal(budget.remaining("flash"), 1);
  assert.equal(budget.used("lite"), 0);
  assert.equal(budget.remaining("lite"), 3);
});

test("GeminiBudget refuses once the limit is reached", () => {
  const budget = new GeminiBudget(2);

  assert.equal(budget.hasRoom("flash"), true);
  budget.record("flash");
  assert.equal(budget.hasRoom("flash"), true);
  budget.record("flash");

  assert.equal(budget.hasRoom("flash"), false);
  assert.equal(budget.remaining("flash"), 0);
});

test("GeminiBudget survives a restart through its file", () => {
  const path = tempFile();

  const first = new GeminiBudget(10, path);
  first.record("flash");
  first.record("flash");
  first.record("lite");

  // Proses baru membaca berkas yang sama, seperti yang terjadi tiap tsx watch
  // me-restart backend.
  const second = new GeminiBudget(10, path);

  assert.equal(second.used("flash"), 2);
  assert.equal(second.used("lite"), 1);

  rmSync(path, { force: true });
});

test("GeminiBudget discards a count from a previous Pacific day", () => {
  const path = tempFile();
  writeFileSync(
    path,
    JSON.stringify({ date: "2000-01-01", counts: { flash: 99 } }),
    "utf8",
  );

  const budget = new GeminiBudget(5, path);

  assert.equal(budget.used("flash"), 0, "hitungan hari lama harus dibuang");
  assert.equal(budget.hasRoom("flash"), true);

  rmSync(path, { force: true });
});

test("GeminiBudget starts clean when the file is corrupt", () => {
  const path = tempFile();
  writeFileSync(path, "{ bukan json", "utf8");

  const budget = new GeminiBudget(5, path);

  assert.equal(budget.used("flash"), 0);
  budget.record("flash");
  assert.equal(JSON.parse(readFileSync(path, "utf8")).counts.flash, 1);

  rmSync(path, { force: true });
});

test("pacificDate produces a sortable ISO style date", () => {
  assert.match(pacificDate(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(pacificDate(new Date("2026-07-25T12:00:00Z")), "2026-07-25");
  // 03:00 UTC masih hari sebelumnya di Pacific, dan di situlah kuota Google reset.
  assert.equal(pacificDate(new Date("2026-07-26T03:00:00Z")), "2026-07-25");
});
