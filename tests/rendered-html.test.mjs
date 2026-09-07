import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const routes = [
  "/",
  "/founder",
  "/portfolio",
  "/projects/child-mortality",
  "/projects/malaria",
  "/projects/syla",
  "/projects/tinospora",
  "/research",
  "/ventures/market-systems",
];

const criticalAssets = [
  "brand/wordmark.png",
  "brand/symbol.png",
  "brand/favicon.png",
  "favicon.ico",
  "apple-touch-icon.png",
  "founder/hero-white-shirt-cutout.webp",
  "founder/profile-suit-standing.webp",
  "founder/profile-auditorium-bw.webp",
  "founder/origin-childhood-clean.webp",
  "experience/qa-boardroom.webp",
  "experience/bsc-graduation.webp",
  "experience/laboratory-standing.webp",
];

async function render(route) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${route}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${route}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders every public route", async () => {
  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});

test("renders the approved G$LIDE branding and hero assets", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.match(html, /href="https:\/\/golide-hub\.esiahkapinga\.chatgpt\.site\/favicon\.ico\?v=20260907-final"/);
  assert.match(html, /src="\/brand\/wordmark\.png\?v=20260907-final" alt="G\$LIDE"/);
  assert.match(html, /src="\/founder\/hero-white-shirt-cutout\.webp\?v=20260908-final"/);
  assert.match(html, /class="hero-ribbons"/);
  assert.match(html, /class="hero-ribbon ribbon-g"/);
});

test("packages every critical media file", async () => {
  for (const asset of criticalAssets) {
    await access(new URL(`../dist/client/${asset}`, import.meta.url));
  }
});
