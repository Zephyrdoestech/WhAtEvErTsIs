// Run: node --test server/quoteRules.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeQuote } from "./quoteRules.js";

test("DIN-03: ₱1 flight + ₱320 meal + window seat fee", () => {
  const q = computeQuote({
    flight: { price: 1 },
    seat: { code: "4A", window: true },
    extras: [{ label: "Meal", price: 320 }],
    fees: [{ label: "Window Appreciation Fee", amount: 500 }],
  });
  assert.equal(q.total, 1969.01);
  assert.equal(q.items.filter((i) => i.label === "Window Appreciation Fee").length, 1);
});

test("RICKS-02: aisle seat pays no window fee", () => {
  const q = computeQuote({ flight: { price: 1 }, seat: { code: "4C", window: false }, fees: [] });
  assert.ok(!q.items.some((i) => i.label === "Window Appreciation Fee"));
  assert.equal(q.total, 1149.01);
});

test("zero-price promo keeps a ₱0 base fare", () => {
  assert.equal(computeQuote({ flight: { price: 0 } }).items[0].amount, 0);
});

test("missing flight falls back to ₱1", () => {
  assert.equal(computeQuote({}).items[0].amount, 1);
});
