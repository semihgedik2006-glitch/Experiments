import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSecurityPolicy } from "../next.config";

const teile = Object.fromEntries(
  contentSecurityPolicy.split(";").map((t) => {
    const [name, ...werte] = t.trim().split(/\s+/);
    return [name, werte];
  }),
);

test("CSP: fremde Skripte nur von Google Analytics", () => {
  const quellen = teile["script-src"].filter((q: string) => q.startsWith("https:") || q.includes("."));
  assert.deepEqual(quellen, ["https://www.googletagmanager.com"]);
  assert.ok(!teile["script-src"].includes("'unsafe-eval'"));
});

test("CSP: Grundsperren gesetzt", () => {
  assert.deepEqual(teile["default-src"], ["'self'"]);
  assert.deepEqual(teile["object-src"], ["'none'"]);
  assert.deepEqual(teile["base-uri"], ["'self'"]);
  assert.deepEqual(teile["form-action"], ["'self'"]);
  assert.deepEqual(teile["frame-ancestors"], ["'self'"]);
});

test("CSP: Rahmen nur für Google Maps", () => {
  assert.deepEqual(teile["frame-src"], ["https://www.google.com", "https://maps.google.com"]);
});
