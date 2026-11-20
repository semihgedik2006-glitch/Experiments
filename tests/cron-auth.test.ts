import { test } from "node:test";
import assert from "node:assert/strict";
import { cronPruefen } from "../src/lib/cron-auth";

const anfrage = (auth?: string) =>
  new Request("http://x/api/cron", { headers: auth ? { authorization: auth } : {} });

test("Cron: ohne CRON_SECRET wird abgelehnt", () => {
  assert.equal(cronPruefen(anfrage(), {} as NodeJS.ProcessEnv)?.status, 401);
  assert.equal(cronPruefen(anfrage("Bearer "), {} as NodeJS.ProcessEnv)?.status, 401);
  assert.equal(cronPruefen(anfrage("Bearer undefined"), {} as NodeJS.ProcessEnv)?.status, 401);
});

test("Cron: falscher oder fehlender Header wird abgelehnt", () => {
  const env = { CRON_SECRET: "abc" } as unknown as NodeJS.ProcessEnv;
  assert.equal(cronPruefen(anfrage(), env)?.status, 401);
  assert.equal(cronPruefen(anfrage("Bearer x"), env)?.status, 401);
});

test("Cron: richtiger Header geht durch", () => {
  const env = { CRON_SECRET: "abc" } as unknown as NodeJS.ProcessEnv;
  assert.equal(cronPruefen(anfrage("Bearer abc"), env), null);
});
