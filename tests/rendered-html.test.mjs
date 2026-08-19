import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Carmel Faraggi portfolio home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Carmel Faraggi/);
  assert.match(html, /Independent/);
  assert.match(html, /design studio/);
  assert.match(html, /WORK/);
  assert.match(html, /ABOUT/);
  assert.match(html, /CONTACT/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("portfolio source includes the real routes, design tokens and enquiry API", async () => {
  const [css, packageJson, hosting, contactRoute] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(css, /#f4f1ed/i);
  assert.match(css, /#0d0d0d/i);
  assert.match(css, /#e31d17/i);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(contactRoute, /contact_submissions/);
  assert.match(contactRoute, /submission_key/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)));
});

test("every inner page exposes an explicit route back home", async () => {
  const navigationSource = await readFile(new URL("../components/navigation.tsx", import.meta.url), "utf8");
  assert.match(navigationSource, /className="home-back-link"[^>]*href="\/"/);
  assert.match(navigationSource, /mobileLinks\s*=\s*\[\{\s*href:\s*"\/",\s*label:\s*"HOME"/);

  for (const path of ["/work", "/about", "/contact", "/work/proof"]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/"[^>]*>[^<]*HOME/i, `missing home link on ${path}`);
  }
});

test("internal navigation uses resilient browser links", async () => {
  const navigationSources = await Promise.all([
    readFile(new URL("../components/navigation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/project-card.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/work/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/work/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  for (const source of navigationSources) {
    assert.doesNotMatch(source, /from ["']next\/link["']/);
  }
});
