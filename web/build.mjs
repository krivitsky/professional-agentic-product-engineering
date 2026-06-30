// Build the static site by *cutting* ../guide.md into one subpage per chapter.
// Each top-level `## ` section becomes its own page; the front matter becomes home.
// Re-run any time the guide changes — dist/ is fully regenerated. Vercel-ready.
import { readFile, writeFile, rm, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { marked } from 'marked';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(HERE, 'dist');
const GUIDE = join(ROOT, 'guide.md');
const LOGO_SRC = join(ROOT, 'assets', 'tutor-caveman.png');

const SITE_TITLE = 'Professional Agentic Product Engineering';
const REPO_URL = 'https://github.com/krivitsky/professional-agentic-product-engineering';
const AUTHOR_URL = 'https://www.krivitsky.com';
const AUTHOR_NAME = 'Alexey Krivitsky';
// Absolute origin for canonical/OG/sitemap. Override at build time: SITE_URL=https://… node build.mjs
// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is injected automatically.
const BASE = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://professional-agentic-product-engineering.vercel.app'
).replace(/\/+$/, '');
const SITE_DESC = 'A mid-2026 field guide to operating a coding agent professionally — eight tiers from prompting to autonomous production loops, using Claude Code as the worked example.';
const OG_IMAGE = `${BASE}/assets/tutor-caveman.png`;

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
   .replace(/\s/g, '-');

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
  return md.replace(/###\s+Contents[\s\S]*?(?=\n---\n)/, '').replace(/\n{3,}/g, '\n\n');
}

const anchorToPage = {}; // every known anchor/slug -> page slug
anchorToPage[slug('contents')] = 'index';

const usedSlugs = new Set(['index']);
const uniq = (base) => {
  let s = base, i = 2;
  while (usedSlugs.has(s)) s = `${base}-${i++}`;
  usedSlugs.add(s);
  return s;
};
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
        ? firstSentence(`Tier ${meta.n} — ${meta.label.replace(/^T\d+ · /, '')}. ${reachBlurb(body)}`)
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

// --------------------------------------------------- cross-page link fixer ---
// Rewrite every `](#anchor)` so it points at the right subpage.
function rewriteLinks(md, currentSlug) {
  return md.replace(/\]\(#([\w-]+)\)/g, (full, anchor) => {
    const target = anchorToPage[anchor];
    if (!target) return currentSlug === 'index' ? `](#${anchor})` : `](index.html#${anchor})`;
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
const navGroups = [
  { title: 'Start here', filter: (p) => p.kind === 'home' },
  { title: 'Get oriented', filter: (p) => p.kind === 'section' && p.orderIdx < tierStart },
  { title: 'The eight tiers', filter: (p) => p.kind === 'tier' },
  { title: 'Reference', filter: (p) => p.kind === 'section' && p.orderIdx > tierStart },
];
// index pages so "before/after tiers" splits cleanly
pages.forEach((p, i) => (p.orderIdx = i));
const firstTier = pages.find((p) => p.kind === 'tier');
const lastTier = [...pages].reverse().find((p) => p.kind === 'tier');
const tierStart = firstTier ? firstTier.orderIdx : 999;
const tierEnd = lastTier ? lastTier.orderIdx : 999;
navGroups[1].filter = (p) => p.kind === 'section' && p.orderIdx < tierStart;
navGroups[3].filter = (p) => p.kind === 'section' && p.orderIdx > tierEnd;

function renderNav(currentSlug) {
  let html = '';
  for (const g of navGroups) {
    const items = pages.filter(g.filter);
    if (!items.length) continue;
    html += `<div class="nav-group"><p class="nav-group-title">${g.title}</p><ul>`;
    for (const p of items) {
      const active = p.slug === currentSlug ? ' class="active"' : '';
      const num = p.kind === 'tier' ? `<span class="nav-num">T${p.n}</span>` : '';
      const label = p.kind === 'tier' ? p.menuLabel.replace(/^T\d+\s·\s/, '') : p.menuLabel;
      html += `<li><a${active} href="${p.file}">${num}<span>${escapeHtml(label)}</span></a></li>`;
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

function prevNext(currentSlug) {
  const idx = pages.findIndex((p) => p.slug === currentSlug);
  const prev = pages[idx - 1];
  const next = pages[idx + 1];
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
      name: SITE_TITLE + ' Guide',
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
  const fullTitle = isHome ? `${SITE_TITLE} Guide` : `${page.title} · ${SITE_TITLE}`;
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
<meta property="og:site_name" content="${SITE_TITLE} Guide">
<meta property="og:title" content="${escapeHtml(isHome ? fullTitle : page.title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(isHome ? fullTitle : page.title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" href="assets/tutor-caveman.png">
<link rel="alternate" type="text/markdown" href="${BASE}/llms-full.txt" title="Full guide as plain markdown">
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
  <a class="topbar-brand" href="index.html"><img src="assets/tutor-caveman.png" alt=""><span>Agentic Product Engineering</span></a>
  <button class="theme-btn" id="themeBtn" aria-label="Toggle dark mode">
    <svg class="i-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>
    <svg class="i-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  </button>
</header>
<div class="overlay" id="overlay"></div>
<aside class="sidebar" id="sidebar">
  <a class="sidebar-brand" href="index.html">
    <img src="assets/tutor-caveman.png" alt="">
    <span class="sidebar-brand-text">Agentic <strong>Product Engineering</strong> Guide</span>
  </a>
  <nav class="nav">${renderNav(pageSlug)}</nav>
</aside>
<main class="main">
  <article class="content" id="content">
${contentHtml}
  </article>
  ${isHome ? '' : prevNext(pageSlug)}
  <footer class="site-footer">
    <img src="assets/tutor-caveman.png" alt="" class="footer-logo">
    <div class="footer-text">
      <p>Field guide by <a href="${AUTHOR_URL}" target="_blank" rel="noopener">${AUTHOR_NAME}</a> — <a href="mailto:alexey@krivitsky.com">alexey@krivitsky.com</a></p>
      <p><a href="${REPO_URL}" target="_blank" rel="noopener">⭐ Star &amp; contribute on GitHub</a> · updated continuously</p>
    </div>
  </footer>
</main>
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
await writeFile(join(DIST, 'styles.css'), cssText);
await writeFile(join(DIST, 'app.js'), jsText);

for (const p of pages) {
  let contentHtml;
  if (p.kind === 'home') {
    const intro = renderMarkdown(stripContents(p.body), 'index');
    contentHtml =
      `<div class="hero-cta"><p class="eyebrow">Mid-2026 field guide · updated continuously</p></div>` +
      intro +
      `<h2 id="the-eight-tiers">Climb the eight tiers</h2>` +
      `<p>Each tier is its own chapter — open the one your work needs.</p>` +
      tierCards();
  } else {
    contentHtml =
      `<p class="eyebrow">${p.kind === 'tier' ? 'Tier ' + p.n : 'Chapter'}</p>` +
      `<h1 id="${p.anchorId}" class="page-title">${escapeHtml(p.title)}</h1>` +
      renderMarkdown(p.body, p.slug);
  }
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
  `The full guide as one markdown file: ${BASE}/llms-full.txt\n\n` +
  `- [Overview](${BASE}/): motivation, the one idea, the eight-tier ladder.\n`;
for (const [title, items] of llmsGroups) {
  if (!items.length) continue;
  llms += `\n## ${title}\n\n`;
  for (const p of items) llms += `- [${p.menuLabel}](${urlOf(p)}): ${p.description}\n`;
}
await writeFile(join(DIST, 'llms.txt'), llms);

// llms-full.txt — the entire guide as plain markdown, for direct ingestion.
await writeFile(join(DIST, 'llms-full.txt'), raw);

console.log(`Built ${pages.length} pages (assets v${ASSET_VER}) -> ${DIST}`);
console.log('  + robots.txt, sitemap.xml, llms.txt, llms-full.txt');
for (const p of pages) console.log(`  ${p.file.padEnd(50)} ${p.menuLabel}`);
