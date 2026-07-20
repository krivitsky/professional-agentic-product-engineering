// Build the static site by *cutting* ../guide.md into one subpage per chapter.
// Each top-level `## ` section becomes its own page; the front matter becomes home.
// Re-run any time the guide changes — dist/ is fully regenerated. Vercel-ready.
import { readFile, writeFile, rm, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { marked } from 'marked';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(HERE, 'dist');
const GUIDE = join(ROOT, 'guide.md');
const LOGO_SRC = join(ROOT, 'assets', 'tutor-caveman.png');

const SITE_TITLE = 'Professional Agentic Product Engineering (PAPE) — Field Guide';
const REPO_URL = 'https://github.com/krivitsky/professional-agentic-product-engineering';
const AUTHOR_URL = 'https://www.krivitsky.com';
const AUTHOR_NAME = 'Alexey Krivitsky';
// Absolute origin for canonical/OG/sitemap. Override at build time: SITE_URL=https://… node build.mjs
// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is injected automatically.
const BASE = (process.env.SITE_URL || 'https://agentic-engineering.guide').replace(/\/+$/, '');
const SITE_DESC = 'A continuously updated field guide to operating a coding agent professionally — eight tiers from prompting to autonomous production loops, using Claude Code as the worked example.';
// Build stamp — time + commit, surfaced as "updated at" / build #. Refreshes each deploy.
const BUILD_TIME = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
const BUILD_SHA_FULL =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  (() => { try { return execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch { return ''; } })();
const BUILD_SHA = BUILD_SHA_FULL.slice(0, 7) || 'local';
const OG_IMAGE = `${BASE}/og.png`; // 1200x630 social card — regenerate with `node make-og.mjs`

// Strip markdown to plain text for descriptions / llms.txt.
const stripMd = (s) =>
  s.replace(/<a id="[^"]*">\s*<\/a>/g, ' ')
   .replace(/```[\s\S]*?```/g, ' ')
   .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
   .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
   .replace(/[#>*`_|]/g, ' ')
   .replace(/\s+/g, ' ').trim();
function firstSentence(body, max = 185) {
  const t = stripMd(body);
  if (!t) return SITE_DESC;
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
const urlOf = (p) => (p.slug === 'index' ? `${BASE}/` : `${BASE}/${p.slug}`);

// ---------------------------------------------------------------- helpers ---
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;');

// GitHub-flavoured heading slug (matches the anchors used inside guide.md).
const slug = (s) =>
  s.toLowerCase().trim()
   .replace(/`/g, '')
   .replace(/[^\w\s-]/g, '')
   .replace(/\s/g, '-')
   .replace(/^-+|-+$/g, '');

// First non-empty paragraph that introduces a tier ("Reach for this tier when …").
function reachBlurb(body) {
  const m = body.match(/\*\*Reach for this tier when\*\*([^\n]*)/);
  if (!m) return '';
  // strip markdown emphasis/links for the card blurb
  return m[1]
    .replace(/\*\*/g, '').replace(/\*/g, '')
    .replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[—-]\s*/, '')
    .trim();
}

// ------------------------------------------------------------- parse guide ---
const raw = await readFile(GUIDE, 'utf8');

// --- Animated figure (vibe coding vs agentic system) ------------------------
// guide.md references the GIF (so GitHub + the plugin get motion); on the
// website we swap that <img> for the self-contained live widget, its CSS
// scoped under .pae-fig so its :root vars can't leak into the site theme.
const animRaw = await readFile(join(ROOT, 'assets', 'vibing-vs-agentic-engineering.html'), 'utf8');
const animMarkup = (animRaw.match(/<!--FIG:START-->([\s\S]*?)<!--FIG:END-->/) || [, ''])[1].trim();
const animScript = (animRaw.match(/<script>([\s\S]*?)<\/script>/) || [, ''])[1].trim();
const ANIM_CSS = `
.pae-fig{--bg:#102c27;--fg:#f4f5f7;--muted:#96999e;--sub:#b2b7bb;--card:#1b2530;--line:#2a3742;--line2:#3a4a44;--teal:#2bd4b0;--amber:#f5b342;--coral:#ff7a6b;--ball:#2bd4b0;--ballstroke:#16a085;--myth-fill:#2e1b18;--real-fill:#12241f;--mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--bg);color:var(--fg);font-family:var(--mono);display:flex;flex-direction:column;align-items:center;padding:32px 20px;margin:24px 0;border-radius:14px}
.pae-fig *{box-sizing:border-box}
.pae-fig .cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;width:100%;max-width:760px;justify-items:center;margin:0}
@media (max-width:560px){.pae-fig .cols{grid-template-columns:1fr}}
.pae-fig .col{display:flex;flex-direction:column;align-items:center;width:100%;max-width:340px}
.pae-fig .lab{font-size:16px;margin:0 0 8px}
.pae-fig .lab.myth{color:var(--coral)}
.pae-fig .lab.real{color:var(--teal)}
.pae-fig svg{width:100%;height:auto;display:block;max-width:340px}
.pae-fig .ball{fill:var(--ball);stroke:var(--ballstroke);stroke-width:1.5}
.pae-fig .sq{fill:var(--real-fill);stroke:var(--teal);stroke-width:1.3}
.pae-fig .bnd{fill:var(--myth-fill);stroke:var(--muted);stroke-width:1;stroke-dasharray:5 4}
.pae-fig .trail{fill:none;stroke:var(--sub);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round}
.pae-fig .lbl{font-family:var(--mono);font-size:13px;fill:var(--fg)}
.pae-fig .cap{color:var(--muted);font-size:12px;margin:16px 0 0;text-align:center;max-width:100%;line-height:1.6}
.pae-fig .credit{margin-top:30px;width:100%;max-width:520px;text-align:center}
.pae-fig .credit hr{border:0;border-top:1px solid var(--line);margin:0 0 12px}
.pae-fig .credit p{color:var(--muted);font-size:11px;margin:0;line-height:1.5}
.pae-fig .credit a{color:inherit;text-decoration:underline;text-underline-offset:2px}`;
const ANIM_FIGURE =
  `<figure class="pae-fig"><style>${ANIM_CSS}</style>${animMarkup}` +
  `<noscript><img src="assets/vibing-vs-agentic-engineering.png" alt="Vibe coding vs an agentic system" style="width:100%;max-width:760px;border-radius:14px"></noscript>` +
  `<script>${animScript}</script></figure>`;
const injectAnim = (html) =>
  html
    // swap the static PNG for the live widget on the website…
    .replace(/(?:<p>\s*)?<img[^>]*src="assets\/vibing-vs-agentic-engineering\.png"[^>]*>(?:\s*<\/p>)?/, ANIM_FIGURE)
    // …and drop the "watch it animate / interactive" caption (redundant here)
    .replace(/<p><em>[\s\S]*?vibing-vs-agentic-engineering\.gif[\s\S]*?<\/em><\/p>\s*/, '');

// Split into front matter (before first `## `) + an ordered list of `## ` sections.
const lines = raw.split('\n');
let frontEnd = lines.findIndex((l) => /^## /.test(l));
if (frontEnd === -1) frontEnd = lines.length;
const frontMatter = lines.slice(0, frontEnd).join('\n');

const sections = [];
let cur = null;
let inFence = false;
for (let i = frontEnd; i < lines.length; i++) {
  const l = lines[i];
  if (/^\s*(```|~~~)/.test(l)) inFence = !inFence;
  if (!inFence && /^## /.test(l)) {
    if (cur) sections.push(cur);
    cur = { heading: l.replace(/^##\s+/, '').trim(), lines: [], anchor: null };
    // a `<a id="...">` immediately above the heading is the section's canonical anchor
    const prev = (lines[i - 1] || '').match(/<a id="([^"]+)">/);
    if (prev) cur.anchor = prev[1];
  } else if (cur) {
    cur.lines.push(l);
  }
}
if (cur) sections.push(cur);

// Short menu label + page kind for each section.
function shortLabel(heading) {
  const tier = heading.match(/^Tier\s+(\d+)\s+—\s+([^:]+):/);
  if (tier) return { kind: 'tier', n: +tier[1], label: `T${tier[1]} · ${tier[2].trim()}` };
  // otherwise cut at the first em dash / colon / comma / opening paren
  const label = heading.split(/\s+—\s+|:\s|,\s|\s+\(/)[0].trim();
  return { kind: 'section', n: 0, label };
}

const pages = [];
// Home page first.
pages.push({
  slug: 'index',
  file: 'index.html',
  title: SITE_TITLE,
  menuLabel: 'Overview',
  kind: 'home',
  body: frontMatter,
  description: SITE_DESC,
});

// Drop the in-guide "### Contents" block from home — we build our own nav.
function stripContents(md) {
  // Remove the Contents list *and* its trailing `---` (else it renders as an
  // <hr> right above the footer's own divider — a double separator).
  return md.replace(/###\s+Contents[\s\S]*?\n---\n/, '').replace(/\n{3,}/g, '\n\n');
}

// Split the home front matter: pull out the H1, and strip the raw
// maintainer/repo block (shown instead as the shared, styled credit row).
// Content fixes (title text, tables) live in guide.md — not here.
function homeParts(md) {
  const title = (md.match(/^#\s+(.+)$/m) || [, SITE_TITLE])[1];
  const body = md
    .replace(/^#\s+.+\n/, '')
    .replace(/\*\*Main maintainer:\*\*[\s\S]*?learn better\.\s*\n/, '');
  return { title, body };
}

// Link the at-a-glance table's tier names to their chapter pages (web nav
// sugar — the text itself is verbatim from guide.md).
function linkifyTiers(md) {
  return md.replace(/\*\*(T(\d) [^*|]+?)\*\*/g, (_, label, n) => `**[${label}](tier-${n}.html)**`);
}

// Author/repo/build credit — the text block (used in the sidebar) ...
function creditText() {
  return (
    `<p>Field guide by <a href="${AUTHOR_URL}" target="_blank" rel="noopener">${AUTHOR_NAME}</a> — <a href="mailto:alexey@krivitsky.com">alexey@krivitsky.com</a></p>` +
    `<p><a href="${REPO_URL}" target="_blank" rel="noopener">⭐ Star &amp; contribute on GitHub</a> · updated continuously</p>` +
    `<p class="buildmeta">Auto-generated from <a href="${REPO_URL}/blob/main/guide.md" target="_blank" rel="noopener">guide.md</a> · built ${BUILD_TIME}` +
    (BUILD_SHA_FULL ? ` · <a href="${REPO_URL}/commit/${BUILD_SHA_FULL}" target="_blank" rel="noopener">build ${BUILD_SHA}</a>` : ` · build ${BUILD_SHA}`) +
    `</p>`
  );
}
// ... and the same with the caveman logo, for the page footer.
function creditRow() {
  return `<img class="cred-logo" src="assets/tutor-caveman.png" alt=""><div class="cred-text">${creditText()}</div>`;
}

// Theme toggle — lives in the sidebar on desktop, in the topbar on mobile.
const THEME_TOGGLE = (cls = '') =>
  `<button class="theme-btn ${cls}" data-theme-toggle aria-label="Toggle dark mode">` +
  `<svg class="i-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>` +
  `<svg class="i-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>` +
  `</button>`;

const anchorToPage = {}; // every known anchor/slug -> page slug
anchorToPage[slug('contents')] = 'index';

const usedSlugs = new Set(['index']);
const uniq = (base) => {
  let s = base, i = 2;
  while (usedSlugs.has(s)) s = `${base}-${i++}`;
  usedSlugs.add(s);
  return s;
};

// --- Overview: keep "Goal" on the landing, split the rest of the front
// matter's `###` sections into their own subpages nested under Overview ---
const { title: HOME_TITLE, body: fmBodyRaw } = homeParts(frontMatter);
const fmParts = stripContents(fmBodyRaw).split(/(?=^### )/m).map((p) => p.trim()).filter(Boolean);
let HOME_INTRO_MD = '';
for (const part of fmParts) {
  const h = (part.match(/^###\s+(.+)$/m) || [, ''])[1].trim();
  if (!h || /^Goal\b/i.test(h)) { HOME_INTRO_MD += part + '\n\n'; continue; }
  const subSlug = uniq(slug(shortLabel(h).label));
  const subBody = part.replace(/^###\s+.+\n?/, '').replace(/^\n+/, '');
  pages.push({
    slug: subSlug, file: `${subSlug}.html`, title: h,
    menuLabel: shortLabel(h).label, kind: 'overview-sub',
    anchorId: slug(h), body: subBody, description: firstSentence(subBody),
  });
  anchorToPage[slug(h)] = subSlug;
  anchorToPage[subSlug] = subSlug;
}

for (const s of sections) {
  const meta = shortLabel(s.heading);
  const headSlug = slug(s.heading);
  // tiers -> tier-N (explicit anchor); other chapters -> short, friendly slug
  const pageSlug = meta.kind === 'tier' ? (s.anchor || headSlug) : uniq(slug(meta.label));
  if (meta.kind === 'tier') usedSlugs.add(pageSlug);
  const body = s.lines.join('\n').replace(/^\n+/, '');
  const page = {
    slug: pageSlug,
    anchorId: meta.kind === 'tier' ? pageSlug : headSlug, // h1 id the guide links to
    file: `${pageSlug}.html`,
    title: s.heading,
    menuLabel: meta.label,
    kind: meta.kind,
    n: meta.n,
    body,
    reach: meta.kind === 'tier' ? reachBlurb(body) : '',
    description:
      meta.kind === 'tier'
        ? firstSentence(`Tier ${meta.n} — ${meta.label.replace(/^T\d+ · /, '')}. ${reachBlurb(body).replace(/^./, (c) => c.toUpperCase())}`)
        : firstSentence(body),
  };
  pages.push(page);
  // map the section's own anchors -> this page
  anchorToPage[headSlug] = pageSlug;
  anchorToPage[pageSlug] = pageSlug;
  // sub-headings (### / ####) inside the section also live on this page
  for (const m of body.matchAll(/^#{3,5}\s+(.+)$/gm)) anchorToPage[slug(m[1])] = pageSlug;
  // explicit <a id="..."> anchors (tips etc.) inside the section
  for (const m of body.matchAll(/<a id="([^"]+)">/g)) anchorToPage[m[1]] = pageSlug;
}

// Front-matter heading slugs resolve to home.
for (const m of frontMatter.matchAll(/^#{3,5}\s+(.+)$/gm)) {
  const a = slug(m[1]);
  if (!anchorToPage[a]) anchorToPage[a] = 'index';
}

// --- Reference page: "All tips" — a derived index of every tip, harvested
// straight from guide.md so it can never drift. Each tip links to its full
// Instead → Prefer pair on the tier page (rewriteLinks resolves #tip-T-N).
const harvestedTips = [];
for (const m of raw.matchAll(/<a id="(tip-(\d+)-(\d+))"><\/a>\s*\n\*\*(\d+\.\d+)\s+(.+?)\*\*/g)) {
  harvestedTips.push({ anchor: m[1], tier: +m[2], label: m[4], title: m[5].replace(/\.\s*$/, '') });
}
if (harvestedTips.length) {
  const tierPages = pages.filter((p) => p.kind === 'tier');
  const tierName = Object.fromEntries(tierPages.map((p) => [p.n, p.menuLabel.replace(/^T\d+\s·\s/, '')]));
  const tierFile = Object.fromEntries(tierPages.map((p) => [p.n, p.file]));
  let tipsBody =
    `Every tip in the guide — all ${harvestedTips.length}, grouped by tier and numbered \`T.N\` (tier · index). ` +
    `Each links to its full **Instead → Prefer** pair on the tier page.\n\n`;
  for (const p of tierPages) {
    const items = harvestedTips.filter((t) => t.tier === p.n);
    if (!items.length) continue;
    const name = tierName[p.n] || `Tier ${p.n}`;
    tipsBody += `### [T${p.n} — ${name}](${tierFile[p.n]})\n\n`;
    for (const t of items) tipsBody += `- **[Tip ${t.label}](#${t.anchor})** — ${t.title}\n`;
    tipsBody += '\n';
  }
  pages.push({
    slug: 'all-tips',
    file: 'all-tips.html',
    title: 'All tips — the complete index',
    menuLabel: 'All tips',
    kind: 'section',
    n: 0,
    anchorId: 'all-tips',
    body: tipsBody,
    description: `Every tip in the guide — all ${harvestedTips.length}, grouped by tier, each linking to its Instead → Prefer pair.`,
  });
  anchorToPage['all-tips'] = 'all-tips';
}

// --------------------------------------------------- cross-page link fixer ---
// Dead in-guide anchors are collected here and fail the build (see end of file).
const brokenLinks = [];
// Rewrite every `](#anchor)` so it points at the right subpage.
function rewriteLinks(md, currentSlug) {
  return md.replace(/\]\(#([\w-]+)\)/g, (full, anchor) => {
    const target = anchorToPage[anchor];
    if (!target) {
      brokenLinks.push(`${currentSlug} → #${anchor}`);
      return currentSlug === 'index' ? `](#${anchor})` : `](index.html#${anchor})`;
    }
    if (target === currentSlug) return `](#${anchor})`;
    const file = target === 'index' ? 'index.html' : `${target}.html`;
    // if the anchor *is* the page's primary anchor, no fragment needed
    if (anchor === target) return `](${file})`;
    return `](${file}#${anchor})`;
  });
}

// ----------------------------------------------------------- markdown -> html ---
const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

function makeRenderer() {
  const r = new marked.Renderer();
  r.heading = (text, level, rawText) => {
    const id = slug(rawText.replace(/<[^>]+>/g, ''));
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };
  // Colour the contrast labels: "Instead of:" -> flat red, "Prefer:" -> teal.
  r.strong = (text) => {
    const plain = text.replace(/<[^>]+>/g, '');
    let cls = '';
    if (/^Instead of\b/i.test(plain)) cls = ' class="lbl-instead"';
    else if (/^Prefer\b/i.test(plain)) cls = ' class="lbl-prefer"';
    return `<strong${cls}>${text}</strong>`;
  };
  r.code = (code, infostring) => {
    const lang = (infostring || '').trim().split(/\s+/)[0];
    if (lang === 'mermaid') return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
    const label = lang || 'prompt';
    return (
      `<div class="codebox" data-lang="${escapeHtml(label)}">` +
      `<button class="copy" type="button" aria-label="Copy to clipboard">${COPY_ICON}<span>Copy</span></button>` +
      `<pre><code class="language-${escapeHtml(label)}">${escapeHtml(code)}</code></pre></div>`
    );
  };
  return r;
}

marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });

// marked 9 mis-reads a `---` on the first line inside a fence as a setext
// underline unless a blank line separates the fence from the prose above it.
// Guarantee blank lines around every fenced block before parsing.
function padFences(md) {
  const out = [];
  const ls = md.split('\n');
  let inFence = false;
  for (let i = 0; i < ls.length; i++) {
    const isFence = /^\s*(```|~~~)/.test(ls[i]);
    if (isFence && !inFence) {
      if (out.length && out[out.length - 1].trim() !== '') out.push('');
      out.push(ls[i]); inFence = true;
    } else if (isFence && inFence) {
      out.push(ls[i]); inFence = false;
      if (i + 1 < ls.length && ls[i + 1].trim() !== '') out.push('');
    } else {
      out.push(ls[i]);
    }
  }
  return out.join('\n');
}

function renderMarkdown(md, currentSlug) {
  return marked.parse(padFences(rewriteLinks(md, currentSlug)), { renderer: makeRenderer() });
}

// ------------------------------------------------------------- nav + shell ---
pages.forEach((p, i) => (p.orderIdx = i));
const firstTier = pages.find((p) => p.kind === 'tier');
const lastTier = [...pages].reverse().find((p) => p.kind === 'tier');
const tierStart = firstTier ? firstTier.orderIdx : 999;
const tierEnd = lastTier ? lastTier.orderIdx : 999;

// Explicit menu order (decoupled from guide.md section order).
const tierSlugs = pages.filter((p) => p.kind === 'tier').map((p) => p.slug);
const NAV = [
  { title: 'Start here', slugs: ['index', 'formats-of-this-guide', 'learn-this-with-an-agent'] },
  { title: 'Get oriented', slugs: ['big-idea', 'loops-of-agentic-engineering', 'the-eight-tiers-at-a-glance', 'climb-the-eight-tiers', 'who-this-is-for', 'tldr', 'unlearn-the-old-playbook', 'pick-the-right-tool', 'learn-the-primitives'] },
  { title: 'The eight tiers', slugs: tierSlugs },
  { title: 'Reference', slugs: ['all-tips', 'port-these-habits-to-any-model', 'sources'] },
];
const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));

function renderNav(currentSlug) {
  let html = '';
  for (const g of NAV) {
    const items = g.slugs.map((s) => bySlug[s]).filter(Boolean);
    if (!items.length) continue;
    html += `<div class="nav-group"><p class="nav-group-title">${g.title}</p><ul>`;
    for (const p of items) {
      const attr = p.slug === currentSlug ? ' class="active"' : '';
      const num = p.kind === 'tier' ? `<span class="nav-num">T${p.n}</span>` : '';
      const label = p.kind === 'tier' ? p.menuLabel.replace(/^T\d+\s·\s/, '') : p.menuLabel;
      html += `<li><a${attr} href="${p.file}">${num}<span>${escapeHtml(label)}</span></a></li>`;
    }
    html += '</ul></div>';
  }
  return html;
}

function tierCards() {
  const tiers = pages.filter((p) => p.kind === 'tier');
  let html = '<div class="tier-cards">';
  for (const p of tiers) {
    const name = p.menuLabel.replace(/^T\d+\s·\s/, '');
    html +=
      `<a class="tier-card" href="${p.file}">` +
      `<span class="tier-card-n">T${p.n}</span>` +
      `<span class="tier-card-name">${escapeHtml(name)}</span>` +
      `<span class="tier-card-blurb">${escapeHtml(p.reach)}</span></a>`;
  }
  return html + '</div>';
}

// Reading order = the menu order (so prev/next always match the sidebar).
const NAV_ORDER = NAV.flatMap((g) => g.slugs).map((s) => bySlug[s]).filter(Boolean);
function prevNext(currentSlug) {
  const idx = NAV_ORDER.findIndex((p) => p.slug === currentSlug);
  const prev = NAV_ORDER[idx - 1];
  const next = NAV_ORDER[idx + 1];
  let html = '<nav class="pager">';
  html += prev
    ? `<a class="pager-prev" href="${prev.file}"><span>← Previous</span><strong>${escapeHtml(prev.menuLabel)}</strong></a>`
    : '<span></span>';
  html += next
    ? `<a class="pager-next" href="${next.file}"><span>Next →</span><strong>${escapeHtml(next.menuLabel)}</strong></a>`
    : '<span></span>';
  return html + '</nav>';
}

let ASSET_VER = 'dev';

function jsonLd(page) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: `${BASE}/`,
      name: SITE_TITLE,
      description: SITE_DESC,
      inLanguage: 'en',
      publisher: { '@id': `${BASE}/#author` },
    },
    {
      '@type': 'Person',
      '@id': `${BASE}/#author`,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      email: 'alexey@krivitsky.com',
    },
  ];
  if (page.kind !== 'home') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${urlOf(page)}#article`,
      headline: page.title,
      description: page.description,
      url: urlOf(page),
      inLanguage: 'en',
      author: { '@id': `${BASE}/#author` },
      isPartOf: { '@id': `${BASE}/#website` },
      ...(page.kind === 'tier' ? { articleSection: `Tier ${page.n}` } : {}),
    });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Guide', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: page.menuLabel, item: urlOf(page) },
      ],
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function shell({ page, contentHtml }) {
  const isHome = page.kind === 'home';
  const pageSlug = page.slug;
  const canonical = urlOf(page);
  const fullTitle = isHome ? SITE_TITLE : `${page.title} · ${SITE_TITLE}`;
  const desc = page.description || SITE_DESC;
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="author" content="${AUTHOR_NAME}">
<meta name="theme-color" content="#2c3e50" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f7f8fa" media="(prefers-color-scheme: light)">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:site_name" content="${SITE_TITLE}">
<meta property="og:title" content="${escapeHtml(isHome ? fullTitle : page.title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Professional Agentic Product Engineering — a field guide by Alexey Krivitsky">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(isHome ? fullTitle : page.title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd(page)}</script>
<script>(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;}catch(e){}})();</script>
<link rel="stylesheet" href="styles.css?v=${ASSET_VER}">
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header class="topbar">
  <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
  <a class="topbar-brand" href="index.html">
    <img src="assets/tutor-caveman.png" alt="">
    <span class="sidebar-brand-text"><strong>Professional</strong> Agentic <strong>Product</strong> Engineering</span>
  </a>
  ${THEME_TOGGLE('theme-top')}
</header>
<div class="overlay" id="overlay"></div>
<div class="layout">
<aside class="sidebar" id="sidebar">
  <nav class="nav">${renderNav(pageSlug)}</nav>
</aside>
<main class="main">
  <article class="content" id="content">
${contentHtml}
  </article>
  ${prevNext(pageSlug)}
  <footer class="site-footer">
    <div class="creditrow">${creditRow()}</div>
    <nav class="footer-links">
      <a href="sitemap.xml">Sitemap</a>
      <a href="robots.txt">robots.txt</a>
      <a href="llms.txt">llms.txt</a>
      <a href="${REPO_URL}/blob/main/guide.md" target="_blank" rel="noopener">guide.md</a>
      <a href="${REPO_URL}" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </footer>
</main>
</div>
<script type="module" src="app.js?v=${ASSET_VER}"></script>
</body>
</html>`;
}

// ------------------------------------------------------------------- emit ---
await rm(DIST, { recursive: true, force: true });
await mkdir(join(DIST, 'assets'), { recursive: true });
const cssText = await readFile(join(HERE, 'src', 'styles.css'), 'utf8');
const jsText = await readFile(join(HERE, 'src', 'app.js'), 'utf8');
ASSET_VER = createHash('sha1').update(cssText + jsText).digest('hex').slice(0, 8);
await copyFile(LOGO_SRC, join(DIST, 'assets', 'tutor-caveman.png'));
await copyFile(join(ROOT, 'assets', 'nested-loops.svg'), join(DIST, 'assets', 'nested-loops.svg'));
await copyFile(join(ROOT, 'assets', 'nested-loops.png'), join(DIST, 'assets', 'nested-loops.png'));
await copyFile(join(ROOT, 'assets', 'vibing-vs-agentic-engineering.png'), join(DIST, 'assets', 'vibing-vs-agentic-engineering.png'));
await copyFile(join(ROOT, 'assets', 'vibing-vs-agentic-engineering.gif'), join(DIST, 'assets', 'vibing-vs-agentic-engineering.gif'));
await copyFile(join(ROOT, 'assets', 'og.png'), join(DIST, 'og.png'));
await copyFile(join(ROOT, 'assets', 'og-2x.png'), join(DIST, 'og-2x.png'));
await copyFile(join(ROOT, 'assets', 'favicon.png'), join(DIST, 'favicon.png'));
await writeFile(join(DIST, 'styles.css'), cssText);
await writeFile(join(DIST, 'app.js'), jsText);

for (const p of pages) {
  let contentHtml;
  if (p.kind === 'home') {
    const intro = renderMarkdown(linkifyTiers(HOME_INTRO_MD), 'index');
    contentHtml =
      `<h1 class="sr-only">${escapeHtml(HOME_TITLE)}</h1>` +
      `<img class="hero-banner" src="og-2x.png?v=${ASSET_VER}" alt="${escapeHtml(HOME_TITLE)}" width="1200" height="630">` +
      intro +
      `<div class="learn-callout">` +
      `<p class="learn-callout-title">Learn it with your agent — way more fun than reading.</p>` +
      `<p>Point Claude Code (or any agentic harness) at <a href="${REPO_URL}" target="_blank" rel="noopener">this repository</a> and have it tutor you through the guide, one concept at a time.</p>` +
      `</div>`;
  } else if (p.kind === 'overview-sub') {
    contentHtml =
      `<p class="eyebrow">Overview</p>` +
      `<h1 id="${p.anchorId}" class="page-title">${escapeHtml(p.title)}</h1>` +
      renderMarkdown(linkifyTiers(p.body), p.slug);
  } else {
    // Chapter pages (e.g. the at-a-glance and climb tables) get their **Tn …**
    // tier names linked to the tier pages; tier pages themselves don't self-link.
    const body = p.kind === 'tier' ? p.body : linkifyTiers(p.body);
    contentHtml =
      `<p class="eyebrow">${p.kind === 'tier' ? 'Tier ' + p.n : 'Chapter'}</p>` +
      `<h1 id="${p.anchorId}" class="page-title">${escapeHtml(p.title)}</h1>` +
      renderMarkdown(body, p.slug);
  }
  contentHtml = injectAnim(contentHtml);
  await writeFile(join(DIST, p.file), shell({ page: p, contentHtml }));
}

// ----------------------------------------------------- SEO + agent files ---
// robots.txt — explicitly welcome the AI crawlers (krivitsky.com pattern).
const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Googlebot', 'Bingbot',
  'DuckDuckBot', 'CCBot', 'Applebot', 'Applebot-Extended', 'Meta-ExternalAgent',
  'FacebookBot', 'Amazonbot', 'Cohere-ai', 'YouBot',
];
const robots =
  AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n') +
  `\n\nUser-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\nHost: ${BASE}\n`;
await writeFile(join(DIST, 'robots.txt'), robots);

// sitemap.xml
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages
    .map((p) => {
      const priority = p.kind === 'home' ? '1.0' : p.kind === 'tier' ? '0.8' : '0.6';
      return `  <url>\n    <loc>${urlOf(p)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n') +
  `\n</urlset>\n`;
await writeFile(join(DIST, 'sitemap.xml'), sitemap);

// llms.txt — curated index for agents (https://llmstxt.org).
const llmsGroups = [
  ['Get oriented', pages.filter((p) => p.kind === 'section' && p.orderIdx < tierStart)],
  ['The eight tiers', pages.filter((p) => p.kind === 'tier')],
  ['Reference', pages.filter((p) => p.kind === 'section' && p.orderIdx > tierEnd)],
];
let llms =
  `# Professional Agentic Product Engineering Guide\n\n` +
  `> ${SITE_DESC}\n\n` +
  `Maintained by ${AUTHOR_NAME} (${AUTHOR_URL}). Source: ${REPO_URL}\n` +
  `- [Overview](${BASE}/): motivation, the one idea, the eight-tier ladder.\n`;
for (const [title, items] of llmsGroups) {
  if (!items.length) continue;
  llms += `\n## ${title}\n\n`;
  for (const p of items) llms += `- [${p.menuLabel}](${urlOf(p)}): ${p.description}\n`;
}
await writeFile(join(DIST, 'llms.txt'), llms);


console.log(`Built ${pages.length} pages (assets v${ASSET_VER}) -> ${DIST}`);
console.log('  + robots.txt, sitemap.xml, llms.txt');
for (const p of pages) console.log(`  ${p.file.padEnd(50)} ${p.menuLabel}`);

// Link-integrity gate — a dead `](#anchor)` in guide.md fails the build (and
// blocks the Vercel deploy) instead of shipping a broken link silently.
const uniqueBroken = [...new Set(brokenLinks)].sort();
if (uniqueBroken.length) {
  console.error(`\n✖ ${uniqueBroken.length} unresolved in-guide anchor link(s):`);
  for (const b of uniqueBroken) console.error(`   ${b}`);
  console.error('Fix the anchor in guide.md, or add the section it points to.');
  process.exit(1);
}
