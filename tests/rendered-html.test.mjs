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

test("home uses the approved wordmark artwork with accessible heading text", async () => {
  const [pageSource, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /wordmarks\/carmel-mobile\.png/);
  assert.match(pageSource, /wordmarks\/carmel-desktop\.png/);
  assert.match(pageSource, /wordmarks\/faraggi\.png/);
  assert.match(pageSource, /wordmarks\/faraggi-desktop\.png/);
  assert.match(pageSource, /visually-hidden">Carmel Faraggi/);
  assert.match(css, /\.home-carmel\s*\{[^}]*top:/);
  assert.match(css, /\.home-faraggi\s*\{[^}]*top:/);
  assert.match(css, /--red-hinge-x:/);
  assert.match(css, /--faraggi-art-top:\s*calc\(var\(--red-hinge-y\)/);
  assert.match(css, /clip-path:\s*polygon\([^}]*var\(--red-hinge-x\)/);
  assert.match(css, /\.display\s*\{[^}]*letter-spacing:\s*\.01em;[^}]*line-height:\s*\.92;/);
  assert.match(css, /\.artists-title\s*\{[^}]*line-height:\s*\.98;[^}]*letter-spacing:\s*\.015em;/);
  assert.doesNotMatch(pageSource, /home-mobile-line/);
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

  for (const path of ["/work", "/for-artists", "/about", "/contact", "/work/clawd", "/work/flower-traffic", "/work/iconic", "/work/cold-hearted-gelato", "/work/proof", "/work/vivi"]) {
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

test("review-locked portfolio labels and placeholder removals are rendered", async () => {
  const response = await render("/work");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const category of ["FOOD + HOSPITALITY", "BEAUTY + WELLNESS", "RETAIL + LIFESTYLE"]) {
    assert.match(html, new RegExp(category.replaceAll("+", "\\+")));
  }
  assert.doesNotMatch(html, /NORTH BOUND|STUDIO AURORA|MAREA/);
  assert.doesNotMatch(html, /MOLT|VIVI|ELI MOSS/);
  for (const title of ["CLAWD", "FLOWER TRAFFIC", "ICON!C", "COLD HEARTED GELATO", "PROOF", "ANNA VALE", "TAVLA", "SOPHIA GREEN"]) {
    assert.ok(html.includes(title), `missing work project: ${title}`);
  }
  for (const [before, after] of [
    ["CLAWD", "FLOWER TRAFFIC"],
    ["FLOWER TRAFFIC", "ICON!C"],
    ["ICON!C", "COLD HEARTED GELATO"],
    ["COLD HEARTED GELATO", "PROOF"],
    ["PROOF", "ANNA VALE"],
    ["ANNA VALE", "TAVLA"],
    ["TAVLA", "SOPHIA GREEN"],
  ]) {
    assert.ok(html.indexOf(before) < html.indexOf(after), `${before} should appear before ${after}`);
  }
  assert.match(html, /href="\/for-artists"/);
});

test("For Artists renders the locked copy, project order and real cover rail", async () => {
  const [response, css] = await Promise.all([
    render("/for-artists"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Cover Art &amp; Artist Branding — Carmel Faraggi Art &amp; Design/);
  assert.match(html, /Cover art, artist identities and release visuals by Carmel Faraggi — graphic design and art direction for musicians and artists\./);

  for (const copy of [
    "VISUAL", "WORLDS", "FOR ARTISTS", "START A PROJECT", "FEATURED PROJECTS",
    "SELECTED COVERS", "ARTIST IDENTITY", "COVER ART", "RELEASE VISUALS",
    "SOCIAL CONTENT", "PRINT &amp; MERCH", "HAVE A RELEASE IN MIND?", "TELL ME ABOUT IT",
  ]) assert.ok(html.includes(copy), `missing locked For Artists copy: ${copy}`);
  assert.ok(html.indexOf("MOLT — NEW SKIN") < html.indexOf("VIVI"));
  assert.ok(html.indexOf("VIVI") < html.indexOf("ELI MOSS"));
  assert.match(html, /href="\/contact\?type=music"/);
  assert.match(html, /aria-label="Selected cover artwork"/);
  assert.match(css, /\.mobile-menu nav a\s*\{[^}]*white-space:\s*nowrap;/);
  assert.match(css, /\.artists-hero-copy\s*\{[^}]*width:\s*min\(52vw, 320px\);[^}]*margin:\s*50px 0 0;/);
  assert.doesNotMatch(html, /placeholder|coming soon/i);
});

test("About and Contact preserve the approved copy and form schema", async () => {
  const [aboutResponse, contactResponse, musicContactResponse, contactFormSource] = await Promise.all([
    render("/about"),
    render("/contact"),
    render("/contact?type=music"),
    readFile(new URL("../components/contact-form.tsx", import.meta.url), "utf8"),
  ]);
  const about = await aboutResponse.text();
  const contact = await contactResponse.text();
  const musicContact = await musicContactResponse.text();

  assert.match(about, /I came to design through art, music and fashion/);
  assert.match(about, /I tend to think about the whole picture/);
  assert.match(about, /Art direction is a big part of how I work/);
  assert.match(about, /That might mean a full identity/);
  assert.match(contact, /Have a project in mind/);
  assert.match(contact, /carmelfaraggi@gmail.com/);
  for (const option of ["Brand Identity", "Graphic Design", "One-off Project", "Music / Artist Visuals", "Not Sure Yet"]) {
    assert.match(contactFormSource, new RegExp(option));
  }
  assert.doesNotMatch(contactFormSource, /name="interest"[^>]*required/);
  assert.match(musicContact, /<option selected="">Music \/ Artist Visuals<\/option>/);
});

test("the corrected site keeps restrained interaction motion with an accessible fallback", async () => {
  const [css, layoutSource, workResponse, artistsResponse, aboutResponse, projectResponse] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    render("/work"),
    render("/for-artists"),
    render("/about"),
    render("/work/proof"),
  ]);
  const renderedPages = await Promise.all(
    [workResponse, artistsResponse, aboutResponse, projectResponse].map((response) => response.text()),
  );

  assert.match(layoutSource, /IntersectionObserver/);
  assert.match(layoutSource, /MutationObserver/);
  assert.match(css, /html\.js \[data-reveal\]\.is-visible/);
  assert.match(css, /\.mobile-menu\.is-open nav a[\s\S]*transition-delay/);
  assert.match(css, /\.project-card a:hover \.artwork-image[^}]*transform:\s*none/);
  assert.match(css, /prefers-reduced-motion[\s\S]*html\.js \[data-reveal\]/);
  const revealAttribute = /<[^>]+\sdata-reveal(?:=|\s|>)/;
  assert.match(renderedPages[0], revealAttribute);
  assert.doesNotMatch(renderedPages[1], revealAttribute);
  assert.doesNotMatch(renderedPages[2], revealAttribute);
  assert.match(renderedPages[3], revealAttribute);
});


test("Carmel Studio is private, storage-backed and leaves the public portfolio resilient", async () => {
  const [hosting, schema, studioPageSource, projectApi, mediaApi, publicWorkSource, storeSource, editorSource] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/projects/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/media/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/work/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/portfolio-store.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/studio/project-editor.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(hosting, /"d1"\s*:\s*"DB"/);
  assert.match(hosting, /"r2"\s*:\s*"MEDIA"/);
  assert.match(schema, /portfolioProjects/);
  assert.match(schema, /portfolioMedia/);
  assert.match(schema, /studioAdmins/);
  assert.match(projectApi, /requireStudioApiUser/);
  assert.match(mediaApi, /assertSameOrigin/);
  assert.match(mediaApi, /image\/webp/);
  assert.match(publicWorkSource, /listPublishedProjects/);
  assert.match(storeSource, /legacyProjects/);
  assert.match(storeSource, /status = 'published'/);
  assert.match(editorSource, /SAVE DRAFT/);
  assert.match(editorSource, /PUBLISH/);
  assert.match(editorSource, /ALT TEXT/);
  assert.match(studioPageSource, /does not receive your conversations/);

  const response = await render("/studio");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /CARMEL/);
  assert.match(html, /STUDIO/);
  assert.match(html, /SIGN IN WITH CHATGPT/);
  assert.match(html, /does not receive your conversations/);
  assert.doesNotMatch(html, /YOUR WORK,.*YOUR CONTROL/s);
});
