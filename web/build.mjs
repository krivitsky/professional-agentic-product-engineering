// Build the static site by *cutting* ../guide.md into one subpage per chapter.
// Each top-level `## ` section becomes its own page; the front matter becomes home.
// Re-run any time the guide changes — dist/ is fully regenerated. Vercel-ready.
import { readFile, writeFile, rm, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { marked } from 'marked';
import { schemeCSS, schemeChips, contrastReport, SCHEMES, INTENSITY, DEFAULT_SCHEME } from './src/schemes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(HERE, 'dist');
const GUIDE = join(ROOT, 'guide.md');
const LOGO_SRC = join(ROOT, 'assets', 'tutor-caveman.png');

const SITE_TITLE = 'PAPE: Professional Agentic Product Engineering';
const REPO_URL = 'https://github.com/krivitsky/professional-agentic-product-engineering';
const AUTHOR_URL = 'https://www.krivitsky.com';
const AUTHOR_NAME = 'Alexey Krivitsky';
// Absolute origin for canonical/OG/sitemap. Override at build time: SITE_URL=https://… node build.mjs
// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is injected automatically.
const BASE = (process.env.SITE_URL || 'https://agenticengineering.guide').replace(/\/+$/, '');
const SITE_DESC = 'Free the human to judge and innovate. A continuously updated field guide to operating coding agents professionally — six tiers from prompting to autonomous production loops, using Claude Code as the worked example.';
// Build stamp — time + commit, surfaced as "updated at" / build #. Refreshes each deploy.
const BUILD_TIME = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
const BUILD_SHA_FULL =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  (() => { try { return execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch { return ''; } })();
const BUILD_SHA = BUILD_SHA_FULL.slice(0, 7) || 'local';
const OG_IMAGE = `${BASE}/og.png`; // 1200x630 social card — regenerate with `node make-og.mjs`

// Strip markdown to plain text for descriptions / llms.txt.
const stripMd = (s) =>
  s.replace(/^\s*\|.*$/gm, ' ')                 // tables make poor descriptions
   .replace(/^\s*-{3,}\s*$/gm, ' ')               // nor do section rules
   .replace(/<a id="[^"]*">\s*<\/a>/g, ' ')
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
// scoped under .pae-fig and drawn from the page's color tokens.
const animRaw = await readFile(join(ROOT, 'assets', 'vibing-vs-agentic-engineering.html'), 'utf8');
const animMarkup = (animRaw.match(/<!--FIG:START-->([\s\S]*?)<!--FIG:END-->/) || [, ''])[1].trim();
const animScript = (animRaw.match(/<script>([\s\S]*?)<\/script>/) || [, ''])[1].trim();
const ANIM_CSS = `
.pae-fig{--fg:var(--heading);--sub:var(--body);--card:var(--code-bg);--teal:var(--accent);--coral:var(--muted);--ball:var(--accent);--ballstroke:var(--bg);--myth-fill:color-mix(in oklab,var(--muted) 14%,transparent);--real-fill:var(--bg);background:var(--panel);color:var(--fg);font-family:var(--mono);display:flex;flex-direction:column;align-items:center;padding:32px 20px;margin:24px 0;border:1px solid var(--line2)}
.pae-fig *{box-sizing:border-box}
.pae-fig .cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;width:100%;max-width:760px;justify-items:center;margin:0}
@media (max-width:560px){.pae-fig .cols{grid-template-columns:1fr}}
.pae-fig .col{display:flex;flex-direction:column;align-items:center;width:100%;max-width:340px}
.pae-fig .lab{font-size:16px;margin:0 0 8px}
.pae-fig .lab.myth{color:var(--coral);text-decoration:line-through;text-decoration-color:var(--accent);text-decoration-thickness:2px}
.pae-fig .lab.real{color:var(--teal)}
.pae-fig svg{width:100%;height:auto;display:block;max-width:340px}
.pae-fig .ball{fill:var(--ball);stroke:var(--ballstroke);stroke-width:1.5}
.pae-fig .sq{fill:var(--real-fill);stroke:var(--teal);stroke-width:1.3}
.pae-fig .bnd{fill:var(--myth-fill);stroke:var(--muted);stroke-width:1;stroke-dasharray:5 4}
.pae-fig .trail{fill:none;stroke:var(--sub);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round}
.pae-fig .lbl{font-family:var(--mono);font-size:13px;fill:var(--fg)}
.pae-fig .cap{color:var(--muted);font-size:12px;margin:16px 0 0;text-align:center;max-width:100%;line-height:1.6}
.pae-fig .credit{margin-top:30px;width:100%;max-width:520px;text-align:center}
.pae-fig .credit hr{border:0;border-top:1px solid var(--line2);margin:0 0 12px}
.pae-fig .credit p{color:var(--muted);font-size:11px;margin:0;line-height:1.5}
.pae-fig .credit a{color:inherit;text-decoration:underline;text-underline-offset:2px}`;
const ANIM_FIGURE =
  `<figure class="pae-fig"><style>${ANIM_CSS}</style>${animMarkup}` +
  `<noscript><img src="assets/vibing-vs-agentic-engineering.png" alt="Vibe coding vs an agentic system" style="width:100%;max-width:760px"></noscript>` +
  `<script>${animScript}</script></figure>`;
const injectAnim = (html) =>
  html
    // swap the static PNG for the live widget on the website…
    // (not the <noscript> fallback inside a figure that's already live)
    .replace(/(?:<p>\s*)?(?<!<noscript>)<img[^>]*src="assets\/vibing-vs-agentic-engineering\.png"[^>]*>(?:\s*<\/p>)?/, ANIM_FIGURE)
    // …and drop the "watch it animate / interactive" caption (redundant here)
    .replace(/<p><em>[\s\S]*?vibing-vs-agentic-engineering\.gif[\s\S]*?<\/em><\/p>\s*/, '');

// --- Nested-loops figure ------------------------------------------------------
// guide.md shows assets/nested-loops.svg as an image (GitHub, the plugin). The
// site inlines it with every color mapped to a scheme token, so the figure
// follows the active scheme instead of sitting on the page as a dark card.
const LOOPS_COLORS = [
  ['rgb(16, 44, 39)', 'var(--panel)'], ['rgb(54, 42, 16)', 'var(--bg)'], ['rgb(56, 27, 23)', 'var(--panel)'],
  ['rgb(43, 212, 176)', 'var(--accent)'], ['rgb(26, 188, 156)', 'var(--accent)'], ['#2bd4b0', 'var(--accent)'],
  ['rgb(245, 179, 66)', 'var(--line)'], ['rgb(243, 156, 18)', 'var(--line)'], ['#f5b342', 'var(--line)'],
  ['rgb(255, 122, 107)', 'var(--muted)'], ['rgb(231, 76, 60)', 'var(--muted)'], ['#ff7a6b', 'var(--muted)'],
  ['rgb(18, 18, 20)', 'var(--code-bg)'], ['rgb(244, 245, 247)', 'var(--heading)'], ['rgb(231,237,242)', 'var(--heading)'],
  ['rgb(178, 183, 187)', 'var(--body)'], ['rgb(150, 153, 158)', 'var(--muted)'], ['rgb(138,153,168)', 'var(--muted)'],
  ['rgb(11, 11, 11)', 'var(--heading)'],
  ['font-family:&quot;Anthropic Sans&quot;, -apple-system, &quot;system-ui&quot;, &quot;Segoe UI&quot;, sans-serif', 'font-family:var(--font)'],
  ["font-family:'Anthropic Sans',-apple-system,'system-ui','Segoe UI',sans-serif", 'font-family:var(--font)'],
  ['font-family:ui-monospace, monospace', 'font-family:var(--mono)'], ['font-family:var(--font-mono)', 'font-family:var(--mono)'],
];
let LOOPS_SVG = await readFile(join(ROOT, 'assets', 'nested-loops.svg'), 'utf8');
for (const [from, to] of LOOPS_COLORS) LOOPS_SVG = LOOPS_SVG.split(from).join(to);
LOOPS_SVG = LOOPS_SVG
  .replace(/\brx="\d+"/g, 'rx="0"')
  .replace(/id="arrow"/g, 'id="nl-arrow"').replace(/url\(#arrow\)/g, 'url(#nl-arrow)')
  .replace(/^<svg /, '<svg class="loops-svg" ');
{
  const stray = LOOPS_SVG.match(/rgb\([^)]*\)|#[0-9a-fA-F]{6}\b/g);
  if (stray) {
    console.error(`✖ nested-loops.svg has colors the site cannot map to a scheme: ${[...new Set(stray)].join(', ')} — add them to LOOPS_COLORS`);
    process.exit(1);
  }
}
const injectLoops = (html) =>
  html.replace(/(?:<p>\s*)?<img[^>]*src="assets\/nested-loops\.svg"[^>]*>(?:\s*<\/p>)?/, `<figure class="loops-figure">${LOOPS_SVG}</figure>`);
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

// ------------------------------------------------------------- page chrome ---
// The slim header: the menu toggle, the PAPE wordmark, the scheme switcher.
const ICON_MENU = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
function headerHtml() {
  const opts = schemeChips().map((c) =>
    `<label class="scheme-opt"><input type="radio" name="scheme" value="${c.id}">` +
    `<span class="chip" style="--c-bg:${c.bg};--c-line:${c.line};--c-accent:${c.accent}"></span>` +
    `<span>${escapeHtml(c.name)}</span></label>`).join('');
  return `<header class="topbar">
  <button class="nav-toggle" type="button" aria-controls="sidebar" aria-expanded="false" data-nav-toggle>${ICON_MENU}<span>Contents</span></button>
  <a class="wordmark" href="index.html" aria-label="PAPE — home">PAPE</a>
  <span class="topbar-sub">Professional Agentic Product Engineering</span>
  <div class="topbar-end">
    <a class="topbar-link" href="${REPO_URL}" target="_blank" rel="noopener">GitHub</a>
    <div class="scheme">
      <button class="scheme-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="scheme-panel" aria-label="Color scheme"><span></span></button>
      <div class="scheme-panel" id="scheme-panel" role="dialog" aria-label="Color scheme" hidden>
        <fieldset><legend>Color scheme</legend>${opts}</fieldset>
        <div class="scheme-intensity">
          <div class="row"><label class="scheme-label" for="intensity">Intensity</label><output id="intensity-out" for="intensity">${INTENSITY.def.toFixed(2)}</output></div>
          <input type="range" id="intensity" min="${INTENSITY.min}" max="${INTENSITY.max}" step="0.05" value="${INTENSITY.def}">
          <button type="button" class="scheme-reset">Reset to default</button>
        </div>
      </div>
    </div>
  </div>
</header>`;
}
// The footer: the guide's spec sheet.
function footerHtml() {
  const build = BUILD_SHA_FULL
    ? `built ${BUILD_TIME} · <a href="${REPO_URL}/commit/${BUILD_SHA_FULL}" target="_blank" rel="noopener">build ${BUILD_SHA}</a>`
    : `built ${BUILD_TIME} · build ${BUILD_SHA}`;
  return `<footer class="site-footer">
  <dl class="spec">
    <div><dt>Title</dt><dd>Professional Agentic Product Engineering</dd></div>
    <div><dt>Author</dt><dd><a href="${AUTHOR_URL}" target="_blank" rel="noopener">${AUTHOR_NAME}</a></dd></div>
    <div><dt>Source</dt><dd><a href="${REPO_URL}" target="_blank" rel="noopener">GitHub repository</a> · <a href="${REPO_URL}/blob/main/guide.md" target="_blank" rel="noopener">guide.md</a></dd></div>
    <div><dt>Revision</dt><dd>Updated continuously<span class="buildmeta">${build}</span></dd></div>
  </dl>
  <nav class="footer-links" aria-label="Site files">
    <a href="sitemap.xml">Sitemap</a>
    <a href="robots.txt">robots.txt</a>
    <a href="llms.txt">llms.txt</a>
    <a href="mailto:alexey@krivitsky.com">alexey@krivitsky.com</a>
  </nav>
</footer>`;
}
// Runs in <head> before the stylesheet: picks the scheme, its intensity and
// the menu state before first paint. ?scheme= and ?intensity= win and stick.
const PREPAINT = `(function(){var d=document.documentElement,L;try{L=window.localStorage}catch(e){}
function g(k){try{return L?L.getItem(k):null}catch(e){return null}}function p(k,v){try{if(L)L.setItem(k,v)}catch(e){}}
var S=${JSON.stringify(SCHEMES.map((x) => x.id))},q=new URLSearchParams(location.search),s=q.get('scheme');
if(S.indexOf(s)>=0)p('pape.scheme',s);else s=g('pape.scheme');if(S.indexOf(s)<0)s='${DEFAULT_SCHEME}';
var i=parseFloat(q.get('intensity'));if(i>=${INTENSITY.min}&&i<=${INTENSITY.max})p('pape.intensity.'+s,String(i));else i=parseFloat(g('pape.intensity.'+s));
if(!(i>=${INTENSITY.min}&&i<=${INTENSITY.max}))i=${INTENSITY.def};
d.setAttribute('data-scheme',s);d.style.setProperty('--intensity',String(i));
var w=window.matchMedia&&matchMedia('(min-width: 1024px)').matches;
d.setAttribute('data-nav',!d.hasAttribute('data-home')&&w?'open':'closed');})();`;

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
    title: 'All Tips — The Complete Index',
    menuLabel: 'All tips',
    kind: 'section',
    n: 0,
    anchorId: 'all-tips',
    body: tipsBody,
    description: `Every tip in the guide — all ${harvestedTips.length}, grouped by tier, each linking to its Instead → Prefer pair.`,
  });
  anchorToPage['all-tips'] = 'all-tips';
}

// --- Home: the opener, the headline and the six tiers as cards, read from
// guide.md (the front matter + "The six tiers at a glance") so the ladder sits
// on the first screen. Nothing is hard-coded: a guide edit that breaks the
// shape fails the build instead of shipping an empty home.
function homeData() {
  const paras = HOME_INTRO_MD.trim().split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  // Two blockquotes: the headline ("> **…**" + subline) and the opener, quoted
  // and signed ("> …" lines, then "> — **Name**, role").
  const quote = paras.find((s) => /^>\s*\*\*/.test(s));
  const shift = paras.find((s) => s.startsWith('**'));
  const opener = paras.find((s) => s !== quote && s !== shift && !s.startsWith('<'));
  const openerLines = (opener || '').split('\n').map((l) => l.replace(/^>\s?/, '').trim()).filter(Boolean);
  const cite = /^—\s/.test(openerLines[openerLines.length - 1] || '') ? openerLines.pop().replace(/^—\s*/, '') : '';
  const q = (quote || '').split('\n').map((l) => l.replace(/^>\s?/, '').trim()).filter(Boolean);
  const headline = (q[0] || '').replace(/^\*\*|\*\*$/g, '');
  const subline = q[1] || '';
  const glance = sections.find((s) => /^The six tiers at a glance/i.test(s.heading));
  const body = glance ? glance.lines.join('\n') : '';
  const tiers = [...body.matchAll(/^\|\s*(\w+)\s*\|\s*\*\*T(\d+) ([^*]+)\*\*\s*\|([^|\n]*)\|([^|\n]*)\|([^|\n]*)\|\s*$/gm)]
    .map((m) => ({ stage: m[1], n: +m[2], name: m[3].trim(), stop: m[4].trim(), instead: m[5].trim() }));
  const stages = [...body.matchAll(/^\|\s*\*\*(\w+)\*\*\s*\|[^|\n]*\|([^|\n]*)\|\s*$/gm)]
    .map((m) => ({ name: m[1], gets: m[2].trim() }));
  const lede = ((body.match(/^Three stages[^\n]*$/m) || [''])[0]).replace(/:\s*$/, '.');
  const tierCount = pages.filter((p) => p.kind === 'tier').length;
  const problems = [];
  if (!opener) problems.push('no opener paragraph in the front matter');
  if (!headline || !subline) problems.push('no "> **headline**" + subline blockquote in the front matter');
  if (tiers.length !== tierCount) problems.push(`"The six tiers at a glance" has ${tiers.length} tier rows, the guide has ${tierCount} tiers`);
  if (!stages.length || tiers.some((t) => !stages.some((s) => s.name === t.stage))) problems.push('the stages table does not cover every tier row');
  if (problems.length) {
    console.error(`✖ home page: ${problems.join('; ')}`);
    process.exit(1);
  }
  const rest = paras.filter((s) => s !== opener && s !== shift && s !== quote).join('\n\n');
  // The hero subheader: the shift line up to its colon ("From coding features to designing agentic systems").
  const shiftHead = (shift || '').replace(/^\*\*|\*\*$/g, '').split(':')[0].trim();
  if (!shiftHead) problems.push('no "**From …: …**" shift line in the front matter');
  return { opener: openerLines, cite, shift, shiftHead, headline, subline, tiers, stages, lede, rest };
}
const HOME = homeData();
function harnessParagraph() {
  const big = sections.find((x) => /^Big Idea/i.test(x.heading));
  const para = big && big.lines.join('\n').split(/\n\s*\n/).map((x) => x.trim()).find((x) => x.startsWith('An **agentic system**'));
  if (!para) {
    console.error('✖ home page: the Big Idea no longer has the "An **agentic system** …" paragraph the harness section quotes');
    process.exit(1);
  }
  return para;
}
const HARNESS_MD = harnessParagraph();
// The other half of the contrast, from the same Big Idea section.
function vibeParagraph() {
  const big = sections.find((x) => /^Big Idea/i.test(x.heading));
  const para = big && big.lines.join('\n').split(/\n\s*\n/).map((x) => x.trim()).find((x) => x.startsWith('Prompting alone is **vibe coding**'));
  if (!para) {
    console.error('✖ home page: the Big Idea no longer has the "Prompting alone is **vibe coding**" paragraph the harness section quotes');
    process.exit(1);
  }
  return para;
}
const VIBE_MD = vibeParagraph();
const stageOfTier = Object.fromEntries(HOME.tiers.map((t) => [t.n, t.stage]));

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
  // Mark the contrast labels: "Instead of:" is muted, "Prefer:" takes the accent.
  r.strong = (text) => {
    const plain = text.replace(/<[^>]+>/g, '');
    let cls = '';
    if (/^Instead of\b/i.test(plain)) cls = ' class="lbl-instead"';
    else if (/^Prefer\b/i.test(plain)) cls = ' class="lbl-prefer"';
    return `<strong${cls}>${text}</strong>`;
  };
  r.table = (header, body) =>
    `<div class="table-wrap"><table><thead>${header}</thead>${body ? `<tbody>${body}</tbody>` : ''}</table></div>`;
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
// Explicit menu order (decoupled from guide.md section order).
const tierSlugs = pages.filter((p) => p.kind === 'tier').map((p) => p.slug);
const NAV = [
  { title: 'The Six Tiers', slugs: ['index', 'the-six-tiers-at-a-glance'] },
  { title: 'How It Works', slugs: ['big-idea', 'loops-of-agentic-engineering', 'climb-the-six-tiers', 'learn-the-primitives'] },
  { title: 'Tier by Tier', slugs: tierSlugs },
  { title: 'More', slugs: ['common-failure-patterns', 'all-tips', 'port-these-habits-to-any-model', 'audit-your-harness', 'goal-of-this-guide', 'who-this-is-for', 'tldr', 'unlearn-the-old-playbook', 'pick-the-right-tool', 'learn-this-with-an-agent', 'formats-of-this-guide', 'part-of-the-agentic-shift-system', 'tip-map', 'sources'] },
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
<html lang="en"${isHome ? ' data-home' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="author" content="${AUTHOR_NAME}">
<meta name="theme-color" content="#0B3A8C">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:site_name" content="${SITE_TITLE}">
<meta property="og:title" content="${escapeHtml(isHome ? fullTitle : page.title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Professional Agentic Product Engineering — Free the human to judge and innovate. The six tiers, from Prompt to Supervise.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(isHome ? fullTitle : page.title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="favicon.png">
<script>${PREPAINT}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd(page)}</script>
<link rel="stylesheet" href="styles.css?v=${ASSET_VER}">
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<div class="sheet">
${headerHtml()}
<div class="layout">
<aside class="sidebar" id="sidebar" aria-label="Contents">
  <div class="drawer-head"><span>Contents</span><button type="button" class="drawer-close" data-nav-close aria-label="Close contents">×</button></div>
  <nav class="nav">${renderNav(pageSlug)}</nav>
</aside>
<main class="main">
  <article class="content${isHome ? ' home' : ''}" id="content">
${contentHtml}
  </article>
  ${isHome ? '' : prevNext(pageSlug)}
</main>
</div>
${footerHtml()}
</div>
<div class="overlay" id="overlay"></div>
<script type="module" src="app.js?v=${ASSET_VER}"></script>
</body>
</html>`;
}

// --- home: the self-audit radar ----------------------------------------------
// Six axes, T1 at the top, clockwise. The same maths runs in app.js.
const AUDIT_DEFAULT = [4, 3, 2, 2, 1, 0];
const RADAR = { cx: 220, cy: 220, r: 150 };
const axisPoint = (i, frac) => {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return [RADAR.cx + RADAR.r * frac * Math.cos(a), RADAR.cy + RADAR.r * frac * Math.sin(a)];
};
const pts = (fracs) => fracs.map((f, i) => axisPoint(i, f).map((v) => v.toFixed(1)).join(',')).join(' ');
function radarSvg(tiers, values) {
  const rings = [1, 2, 3, 4, 5].map((k) => `<polygon class="radar-ring" points="${pts(Array(6).fill(k / 5))}"/>`).join('');
  const axes = tiers.map((_, i) => { const [x, y] = axisPoint(i, 1); return `<line class="radar-axis" x1="${RADAR.cx}" y1="${RADAR.cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
  const scale = [1, 2, 3, 4, 5].map((k) => `<text class="radar-scale" x="${RADAR.cx + 6}" y="${(RADAR.cy - RADAR.r * k / 5 + 4).toFixed(1)}">${k}</text>`).join('');
  const labels = tiers.map((t, i) => {
    const [x, y] = axisPoint(i, 1.2);
    const anchor = Math.abs(x - RADAR.cx) < 1 ? 'middle' : x > RADAR.cx ? 'start' : 'end';
    const top = i === 0 ? -14 : i === 3 ? 6 : -4;
    return `<text class="radar-label" x="${x.toFixed(1)}" y="${(y + top).toFixed(1)}" text-anchor="${anchor}">T${t.n}</text>` +
      `<text class="radar-name" x="${x.toFixed(1)}" y="${(y + top + 17).toFixed(1)}" text-anchor="${anchor}">${escapeHtml(t.name)}</text>`;
  }).join('');
  const shape = pts(values.map((v) => v / 5));
  const dots = values.map((v, i) => { const [x, y] = axisPoint(i, v / 5); return `<circle class="radar-dot" r="5" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"/>`; }).join('');
  return `<svg class="radar" viewBox="-60 0 560 440" role="img" aria-label="Your ratings: ${tiers.map((t, i) => `T${t.n} ${t.name} ${values[i]}`).join(', ')}">` +
    `<g>${rings}${axes}</g>${scale}<polygon class="radar-shape" points="${shape}"/><g data-radar-dots>${dots}</g>${labels}</svg>`;
}
function auditSummary(tiers, values, fileOf) {
  const max = Math.max(...values);
  const strongest = max > 0 ? tiers.filter((_, i) => values[i] === max).map((t) => `T${t.n} ${t.name}`).join(' · ') : '—';
  const next = tiers.find((_, i) => values[i] <= 2);
  const nextHtml = next
    ? `<a href="${fileOf(`tier-${next.n}`)}">T${next.n} ${escapeHtml(next.name)}</a>`
    : 'None — every tier is rated 3 or higher';
  return { strongest: escapeHtml(strongest), nextHtml };
}

function selfAuditHtml(fileOf) {
  const v = AUDIT_DEFAULT;
  const rows = HOME.tiers.map((t, i) =>
    `<label class="audit-row"><span class="ar-n">T${t.n}</span><span class="ar-name">${escapeHtml(t.name)}</span>` +
    `<input type="range" min="0" max="5" step="1" value="${v[i]}" data-tier="${i}" aria-label="T${t.n} ${escapeHtml(t.name)}, rated 0 to 5">` +
    `<output class="ar-v">${v[i]}</output></label>`).join('');
  const sum = auditSummary(HOME.tiers, v, fileOf);
  return `<section class="home-section self-audit" id="self-audit" aria-labelledby="audit-h" data-audit ` +
    `data-tiers="${escapeHtml(JSON.stringify(HOME.tiers.map((t) => ({ n: t.n, name: t.name, href: fileOf(`tier-${t.n}`) }))))}">` +
    `<div class="audit-grid"><div class="audit-left">` +
    `<h2 id="audit-h">Audit Your Harness: Example</h2>` +
    `<p class="section-lede">Rate your practice on each tier from 0 to 5. The shape shows where you are strong and where to climb next.</p>` +
    `<div class="audit-rows">${rows}</div>` +
    `<p class="audit-note">Your ratings stay in this browser.</p>` +
    `<div class="audit-real">` +
    `<p>This is a self-check. For a real one, run the <strong class="hl">harness audit</strong> in Claude Code, in a repo you work in: it reads the harness you've checked in, rates all six tiers, and names the one next thing to fix.</p>` +
    `<div class="codebox" data-lang="in Claude Code"><button class="copy" type="button" aria-label="Copy to clipboard">${COPY_ICON}<span>Copy</span></button>` +
    `<pre><code class="language-text">/plugin marketplace add krivitsky/professional-agentic-product-engineering\n/plugin install pape@pape\n/reload-plugins\n/pape:harness-audit</code></pre></div>` +
    `<p><a href="${REPO_URL}/tree/main/plugins/pape" target="_blank" rel="noopener">The plugin on GitHub ↗</a> · <a href="${fileOf('audit-your-harness')}">How the audit works →</a></p>` +
    `</div>` +
    `</div><div class="audit-right">${radarSvg(HOME.tiers, v)}` +
    `<dl class="spec audit-result">` +
    `<div><dt>Strongest</dt><dd data-strongest>${sum.strongest}</dd></div>` +
    `<div><dt>Next tier to work on</dt><dd><span data-next>${sum.nextHtml}</span><span class="buildmeta">The lowest-numbered tier rated 2 or less — each tier rests on the ones below.</span></dd></div>` +
    `</dl>` +
    `</div></div></section>`;
}
function harnessHtml(fileOf) {
  return `<section class="home-section harness" aria-labelledby="harness-h">` +
    `<h2 id="harness-h">The Harness Around the Agent</h2>` +
    `<p class="section-lede">The same model, two ways to run it. On the left it is poked with prompt after prompt; on the right it runs inside a harness that keeps it on course.</p>` +
    ANIM_FIGURE +
    `<div class="harness-text"><p>${marked.parseInline(VIBE_MD)}</p><p>${marked.parseInline(HARNESS_MD)}</p></div>` +
    `<p class="hd-more"><a href="${fileOf('big-idea')}">Read the Big Idea →</a></p>` +
    `</section>`;
}

// ------------------------------------------------------------------- emit ---
await rm(DIST, { recursive: true, force: true });
await mkdir(join(DIST, 'assets'), { recursive: true });
// Contrast gate: every text pair, every scheme, both ends of the intensity slider.
const contrast = contrastReport();
if (contrast.fails.length) {
  console.error(`✖ ${contrast.fails.length} color pair(s) below WCAG AA 4.5:1:`);
  for (const f of contrast.fails) console.error(`   ${f}`);
  process.exit(1);
}
const cssText = (await readFile(join(HERE, 'src', 'styles.css'), 'utf8')) + '\n' + schemeCSS();
const jsText = await readFile(join(HERE, 'src', 'app.js'), 'utf8');
ASSET_VER = createHash('sha1').update(cssText + jsText).digest('hex').slice(0, 8);
await copyFile(LOGO_SRC, join(DIST, 'assets', 'tutor-caveman.png'));
await copyFile(join(ROOT, 'assets', 'nested-loops.svg'), join(DIST, 'assets', 'nested-loops.svg'));
await copyFile(join(ROOT, 'assets', 'nested-loops.png'), join(DIST, 'assets', 'nested-loops.png'));
await copyFile(join(ROOT, 'assets', 'vibing-vs-agentic-engineering.png'), join(DIST, 'assets', 'vibing-vs-agentic-engineering.png'));
await copyFile(join(ROOT, 'assets', 'vibing-vs-agentic-engineering.gif'), join(DIST, 'assets', 'vibing-vs-agentic-engineering.gif'));
await copyFile(join(ROOT, 'assets', 'uncle-bob-tweet.jpg'), join(DIST, 'assets', 'uncle-bob-tweet.jpg'));
await copyFile(join(ROOT, 'assets', 'harness-audit-banner.png'), join(DIST, 'assets', 'harness-audit-banner.png'));
await copyFile(join(ROOT, 'assets', 'og.png'), join(DIST, 'og.png'));
await copyFile(join(ROOT, 'assets', 'og-2x.png'), join(DIST, 'og-2x.png'));
await copyFile(join(ROOT, 'assets', 'favicon.png'), join(DIST, 'favicon.png'));
await writeFile(join(DIST, 'styles.css'), cssText);
await writeFile(join(DIST, 'app.js'), jsText);

for (const p of pages) {
  let contentHtml;
  if (p.kind === 'home') {
    const fileOf = (slugName) => {
      if (!bySlug[slugName]) { console.error(`✖ home page links to a page that no longer exists: ${slugName}`); process.exit(1); }
      return bySlug[slugName].file;
    };
    const block = (t) =>
      `<a class="tier-block" href="${fileOf(`tier-${t.n}`)}">` +
      `<span class="tb-head"><span class="tb-n">T${t.n}</span><span class="tb-name">${escapeHtml(t.name)}</span><span class="tb-go" aria-hidden="true">→</span></span>` +
      `<span class="tb-row"><span class="tb-k">You stop</span><span class="tb-v">${escapeHtml(t.stop)}</span></span>` +
      `<span class="tb-row"><span class="tb-k">You do instead</span><span class="tb-v">${escapeHtml(t.instead)}</span></span>` +
      `</a>`;
    const stages = HOME.stages.map((st) =>
      `<section class="stage" aria-label="${escapeHtml(st.name)}: ${escapeHtml(st.gets)}">` +
      `<p class="stage-name"><strong>${escapeHtml(st.name)}</strong><span>${escapeHtml(st.gets)}</span></p>` +
      HOME.tiers.filter((t) => t.stage === st.name).map(block).join('') +
      `</section>`).join('');
    contentHtml =
      `<section class="hero">` +
      `<h1 class="hero-title">Professional Agentic Product Engineering</h1>` +
      `<p class="hero-headline">${escapeHtml(HOME.headline)}</p>` +
      `<p class="hero-sub">${escapeHtml(HOME.shiftHead)}</p>` +
      `<figure class="hero-opener"><blockquote>${HOME.opener.map((l) => `<p>${marked.parseInline(l)}</p>`).join('')}</blockquote>` +
      (HOME.cite ? `<figcaption>— ${marked.parseInline(HOME.cite).replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http')}</figcaption>` : '') + `</figure>` +
      `<p class="hero-get">` +
      `<a class="btn btn-primary" href="${fileOf('big-idea')}">Guide's big idea →</a>` +
      `<a class="btn" href="${REPO_URL}/tree/main/plugins/pape" target="_blank" rel="noopener">Claude Code plugin ↗</a>` +
      `<a class="btn" href="${REPO_URL}/tree/main/wiki" target="_blank" rel="noopener">Obsidian vault ↗</a>` +
      `</p>` +
      `</section>` +
      `<section class="home-section" aria-labelledby="tiers-h">` +
      `<h2 id="tiers-h">The Six Tiers of Professional Agentic Product Engineering</h2>` +
      `<p class="section-subhead">${escapeHtml(HOME.subline)}</p>` +
      (HOME.lede ? `<p class="section-lede">${escapeHtml(HOME.lede)}</p>` : '') +
      `<div class="stage-grid">${stages}</div>` +
      `<nav class="home-cta" aria-label="Where to go next">` +
      `<a class="btn btn-primary" href="${fileOf('tier-1')}">Start at T1 →</a>` +
      `<a class="btn" href="${fileOf('big-idea')}">How it works</a>` +
      `<a class="btn" href="${fileOf('all-tips')}">All ${harvestedTips.length} tips</a>` +
      `<a class="btn" href="${fileOf('learn-this-with-an-agent')}">Learn it with your agent</a>` +
      `</nav>` +
      `</section>` +
      selfAuditHtml(fileOf) +
      harnessHtml(fileOf) +
      (HOME.rest ? renderMarkdown(linkifyTiers(HOME.rest), 'index') : '');
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
      `<p class="eyebrow">${p.kind === 'tier' ? `Tier ${p.n}${stageOfTier[p.n] ? ' · ' + stageOfTier[p.n] : ''}` : 'Chapter'}</p>` +
      `<h1 id="${p.anchorId}" class="page-title">${escapeHtml(p.title)}</h1>` +
      renderMarkdown(body, p.slug);
  }
  contentHtml = injectLoops(injectAnim(contentHtml));
  // Home is served at "/", so links to it say "./" and the address bar never
  // shows index.html (locally or on Vercel).
  await writeFile(join(DIST, p.file), shell({ page: p, contentHtml }).replace(/href="index\.html(#[^"]*)?"/g, (m, h) => `href="./${h || ''}"`)
    // every link off this site opens in a new tab
    .replace(/<a\b([^>]*)>/g, (m, attrs) => {
      const href = (attrs.match(/\bhref="([^"]*)"/) || [])[1] || '';
      if (!/^https?:\/\//.test(href) || href.startsWith(BASE) || /\btarget=/.test(attrs)) return m;
      return `<a${attrs} target="_blank" rel="noopener">`;
    }));
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

// llms.txt — curated index for agents (https://llmstxt.org), grouped as the menu is.
const llmsGroups = NAV.map((g) => [g.title, g.slugs.map((s) => bySlug[s]).filter((p) => p && p.kind !== 'home')]);
let llms =
  `# Professional Agentic Product Engineering Guide\n\n` +
  `> ${SITE_DESC}\n\n` +
  `Maintained by ${AUTHOR_NAME} (${AUTHOR_URL}). Source: ${REPO_URL}\n` +
  `- [Overview](${BASE}/): the six tiers at a glance — what each one hands to the system, and where to start.\n`;
for (const [title, items] of llmsGroups) {
  if (!items.length) continue;
  llms += `\n## ${title}\n\n`;
  for (const p of items) llms += `- [${p.menuLabel}](${urlOf(p)}): ${p.description}\n`;
}
await writeFile(join(DIST, 'llms.txt'), llms);


console.log(`Built ${pages.length} pages (assets v${ASSET_VER}) -> ${DIST}`);
console.log('  + robots.txt, sitemap.xml, llms.txt');
{
  const textRows = contrast.rows.filter((r) => !r.pair.startsWith('line2'));
  const worst = textRows.reduce((m, r) => Math.min(m, r.low, r.def, r.high), Infinity);
  console.log(`  color: ${SCHEMES.length} schemes · ${textRows.length / SCHEMES.length} text pairs each · intensity ${INTENSITY.min}–${INTENSITY.max} · lowest ${worst.toFixed(2)}:1 (AA 4.5)`);
}
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
