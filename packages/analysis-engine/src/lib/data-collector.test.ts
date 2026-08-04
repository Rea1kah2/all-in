import assert from "node:assert/strict";
import { test } from "node:test";
import { toYahooSymbol } from "./data-collector.ts";

test("toYahooSymbol leaves a plain ticker untouched", () => {
  assert.equal(toYahooSymbol("AAPL"), "AAPL");
  assert.equal(toYahooSymbol("  msft "), "MSFT");
});

test("toYahooSymbol converts a US share class dot into a dash", () => {
  assert.equal(toYahooSymbol("BRK.B"), "BRK-B");
  assert.equal(toYahooSymbol("BF.B"), "BF-B");
});

test("toYahooSymbol keeps an exchange suffix intact", () => {
  // Mengubah ini menjadi BBCA-JK membuat Yahoo mengembalikan 404, dan itu
  // memutus seluruh pasar Indonesia.
  assert.equal(toYahooSymbol("BBCA.JK"), "BBCA.JK");
  assert.equal(toYahooSymbol("bbri.jk"), "BBRI.JK");
  assert.equal(toYahooSymbol("VOD.L"), "VOD-L");
  assert.equal(toYahooSymbol("0700.HK"), "0700.HK");
});
