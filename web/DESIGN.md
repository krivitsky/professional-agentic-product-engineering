---
title: Site design spec — the "newstyle" blueprint redesign
status: shipped 2026-10-23 (merged into main, live on agenticengineering.guide; branch newstyle deleted)
updated: 2026-10-23
owner: Alexey Krivitsky (approves) · built by Devi (agent), reviewed by Aidy
---

# Site Design Spec — The "newstyle" Blueprint Redesign

What was built, how it works, and what is still open, so another agent can take over without the chat history.

## 1. Why

Alexey, 2026-10-22: the site "looks like it's built by Claude — standard Claude Code colors; make it look professional." He supplied a mockup ("R3 Cyanotype", once in `temp/`, removed in 58cb1bd because the design now lives in the code). His requirements, in order given:

1. Work in branch `newstyle`; demo at `localhost:3010`.
2. Keep the left menu, restyled in the new look.
3. Menu collapsed on the homepage, open on inner pages ("to help navigate as the user goes deeper").
4. Five bold, modern color schemes and a toggle; then he added a monochrome gray and a monochrome "paper" → **seven schemes**.
5. An intensity slider per scheme.

Content is out of scope: `guide.md` is unchanged by this branch. The six-tier content (T1 Prompt … T6 Supervise, stages Direct/Trust/Scale) shipped to production on main before this work (751f430).

## 2. State

| | |
|---|---|
| Shipped | 2026-10-23: `newstyle` fast-forwarded into `main` (60 commits on top of `b2d495c`), then polished on `main`. The branch is deleted. |
| Production | agenticengineering.guide serves `main`; Vercel builds every push. |
| Local demo | `cd web && node build.mjs && cd dist && python3 -m http.server 3010` |

Files the redesign touched: `web/src/schemes.mjs` (new), `web/src/styles.css`, `web/src/app.js`, `web/build.mjs`, `web/make-og.mjs`, `assets/og.png`, `assets/og-2x.png`, `README.md`, `CLAUDE.md`.

## 3. The Design System

Source of truth for the look: the header comment of `web/src/styles.css`.

- **Logo:** a solid rounded square (the harness) with one dot in its upper right (the agent). In the top bar next to "PAPE" (`.wordmark .logo`) it follows the reader's scheme: square in `--accent`, dot in `--accent-ink`. The favicon is white square, black dot; the OG card (Paper) inverts it to a black square with a light dot. Both are rendered by `make-og.mjs`.
- **Type:** Geist (400/500/600/700) and Geist Mono, from Google Fonts. Fallback system-ui.
- **Blueprint frame:** a 40px background grid (`--grid` token), a 2px framed "sheet", square corners everywhere, no shadows.
- **Spec-sheet tables:** bordered, label column + value column. Used for markdown tables, the tier cards and the footer.
- **Layout tokens** (`:root` in styles.css): `--topbar-h 56px`, `--sidebar-w 284px`, `--gutter 24px`, `--measure 72ch`.
- **Every color is a token.** No hex in styles.css. Tokens: `--bg --line --line2 --heading --body --muted --accent --accent-ink --code-bg`, plus derived `--grid --panel --syn-string --frame-bg --accent-soft`.

### 3.1 Color Schemes — `web/src/schemes.mjs` (One Source for All Color)

| id | name | bg | accent | kind |
|---|---|---|---|---|
| `signal` | Signal (**default**, first in the list since 2026-10-23) | #111214 | #FF5A1F | dark |
| `cyanotype` | Cyanotype (the brand: logo and OG card colors) | #0B3A8C | #FFD23F | dark |
| `acid` | Acid | #0E2A1F | #C6FF3D | dark |
| `klein` | Klein | #F4F1EA | #1F3BFF | light |
| `ultraviolet` | Ultraviolet | #1A0B2E | #FF3D9A | dark |
| `graphite` | Graphite | #1C1C1E | #FFFFFF | mono dark |
| `paper` | Paper | #FAFAF7 | #0A0A0A | mono light |

To change a color, edit the hex in `SCHEMES` — never the generated CSS. The build:

1. Converts each hex to OKLCH and emits `[data-scheme="<id>"]` blocks appended to `dist/styles.css` (`schemeCSS()`).
2. **Intensity** scales chroma only: `oklch(L, C × intensity, H)`, L fixed so text keeps its lightness; chroma capped at the sRGB gamut edge per token. The accent never drops below 60% chroma. Mono schemes have no hue, so the slider moves line and grid strength instead. Range `0.3–1.3`, default `1` (`INTENSITY`).
3. Emits an `@supports not (...)` fallback with the exact default hex for browsers that can't do the oklch maths (and hides the slider there).
4. **Contrast gate:** `contrastReport()` checks every text pair the site uses (body, heading, muted, links, accent, button text, quote text, code, comment, keyword, string) at intensity min, default and max. **Any pair below WCAG AA 4.5:1 fails the build** (`build.mjs` exits 1). Lowest pair at hand-over: 4.66:1 (Paper, code comments). `line2` (rules/borders) is reported, never gated.

### 3.2 Switcher and Persistence

- Header: square swatch button → panel with seven radio chips + Intensity slider + Reset (markup in `headerHtml()`, behavior in `app.js`).
- A tiny pre-paint script (`PREPAINT` in build.mjs) runs in `<head>` before the stylesheet: sets `data-scheme`, `--intensity` and `data-nav` on `<html>`, so there is no flash.
- localStorage keys: `pape.scheme`, `pape.intensity.<scheme>` (intensity is remembered **per scheme**), `pape.selfAudit`, `pape.palette.seen` (the palette opens by itself once, on a first visit, without taking focus; any click outside closes it). All access is wrapped in try/catch; the site works with storage blocked.
- URL parameters win and stick: `?scheme=signal`, `?intensity=0.6`.
- The OG share card is always Paper (black ink on off-white, black logo with a light dot), whatever a reader picks.

### 3.3 Menu

- **Inner pages, width ≥1024px:** the menu always opens docked on the left, so following a link deeper into the guide keeps it in view. Closing it lasts for that page only (nothing is remembered). Current page highlighted and scrolled into view.
- **Homepage (any width) and every page below 1024px:** menu is a drawer, always starts closed; opened by "Contents" in the top-left; overlay click, × button or Escape closes it; focus moves into the drawer and back.
- Groups come from `NAV` in build.mjs: Start (Overview, Start Here, TL;DR, Who This Is For, Goal), The Six Tiers, How It Works, Tier by Tier, More. A new guide section must be wired into `NAV` or it won't appear.

## 4. Homepage

Built in `build.mjs` (`p.kind === 'home'`), read from `guide.md` by `homeData()`. Order:

1. **Hero:** one message in charge. Above 1000px, two columns: left holds eyebrow, headline, subheader and buttons; right holds the opener quote, vertically centered. Below 1000px it stacks in the order listed. The site name as a small accent eyebrow (the `<h1>`; the top bar carries it too); the headline "Free the human to judge and innovate." as the big type; the subheader "From coding features to designing agentic systems" (the guide's shift line up to its colon, read by `homeData()`); the 3-line opener as a signed quote under a large accent “ mark, no side rule ("â **Alexey Krivitsky**, the creator of the PAPE guide", read from the last `> â â¦` line of the guide's opener blockquote); one row of buttons: Start now (primary, opens the Start Here page), Guide's big idea, Claude Code plugin â (`plugins/pape` on GitHub), Obsidian vault â (`wiki/` on GitHub). The hero no longer links to agentic-shift.com; the footer does.
2. **Why the PAPE Guide and How to Use It** (the home block, added 2026-10-27 after reader feedback that the site never said what you gain or how to begin): read from the guide's "Start Here" section, so the text lives once. The section's first paragraph (the problem) as the lede; **What You Gain** as a stacked list (Time, Trust, Control), deliberately not three columns, so it does not read as one gain per step card; **Three Ways to Start** as three linked cards (1 read the guide, 2 point your agent at this repo, 3 install the plugin), each opening its own step on Start Here (`#start-step-N`, anchors in guide.md), so every start link lands on the same page. Step 3 itself says "Already shipping a product? Start here", so there is no separate shortcut line. Each card ends in a link naming what it opens there (`STEP_GO`: where to begin reading · the clone and the prompt · the install commands); there is no separate link to the page. The build fails if the guide stops having one paragraph, three gains and three steps in that shape.
3. **The Six Tiers of Professional Agentic Product Engineering** (section heading): the subline ("From commanding the model to supervising the outcomes, a tier-by-tier guide.") as the section's subheader, then three stage columns (Direct · Trust · Scale), each tier a spec card: T-number, name, "You stop" / "You do instead", linking to its tier page. CSS subgrid lines the cards up across columns.
4. **Buttons:** Find your tier (primary, to "Which Tier Do You Need?") · Start at T1 · How it works · All N tips · Learn it with your agent.
5. **Where Do You Stand? (self-audit radar, then the audit commands):** six 0–5 sliders beside a hexagon radar SVG. Shows **Strongest** (highest-rated tier[s]) and **Next tier** = the lowest-numbered tier rated ≤2, as a link. **No total and no average**, which is the guide's own audit rule. Ratings saved in `pape.selfAudit`. Under the sliders (left column, so the right holds only the radar and its result): the four Claude Code commands that install the plugin and run `/pape:harness-audit` (a code box with Copy), a link to the plugin on GitHub, and "How the audit works". Radar maths is duplicated in build.mjs (server render) and app.js (live); keep them in sync.
6. **The Harness Around the Agent:** a one-line lede, then the live vibe-coding-vs-agentic-system figure (the same widget the Big Idea page uses). On the homepage the figure carries no captions and no explanation: under it come three questions (why the same model acts so differently on each side, what you would need to build to stop steering it, what skills it takes to move from vibe coding to harness engineering), then a "Read the Big Idea →" link: the Big Idea page shows the same figure with the guide's text under it, so the homepage doesn't repeat it. The "vibe coding" label is struck through in the accent color, on both pages.
7. Remaining home markdown, then the footer spec table. (The Agentic Shift invitation was removed 2026-10-23.)

The build fails, naming the part, if it can't read the opener, the `> **headline**` blockquote, the two tables in "The six tiers at a glance", or the harness paragraph from guide.md — or if the home links to a page that no longer exists.

## 5. Other Pieces

- **Figures:** the nested-loops figure is inlined as SVG and colored from tokens (`injectLoops`); mermaid diagrams are recolored by CSS from tokens, so a scheme switch needs no re-render (edges use `--muted` so they're legible on light schemes).
- **Code:** highlight.js and mermaid load on demand from jsDelivr; if the CDN is down, menu and switcher still work. `prompt`/`text` blocks stay unhighlighted. Copy buttons on every code box.
- **OG image:** `node web/make-og.mjs` renders `assets/og.png` + `og-2x.png` (1200×630) with local Google Chrome — Vercel can't run it, so the PNGs are committed. Regenerate when the title, headline or tiers change.
- **Links:** pages link to `*.html`, so the local static server works; links to home are written as `./`, so the address bar shows `/`, never `index.html`; every link off the site opens in a new tab (added at write time, so guide Markdown needs nothing); Vercel's `cleanUrls` serves them without the extension. Redirects for removed pages live in `web/vercel.json`.

## 6. Open Items — Need Alexey's Call Before or After Merge

1. **Self-audit starting values.** Resolved 2026-10-23: the section was titled "Audit Your Harness: Example" (renamed "Where Do You Stand?" on 2026-10-27), so the opening ratings `[4,3,2,2,1,0]` (`AUDIT_DEFAULT`) read as an example. Starting at zero is still an option.
2. **"Why this is now its own profession"** section from the mockup was not built. Bring it back with wording from the guide?
3. **"dark/light mode" wording** still in README and guide.md "Formats" section; the site now has seven schemes. Changing guide.md requires `scripts/sync-plugin.sh` and a plugin version bump.
4. **`assets/harness-audit-banner.png`.** Resolved 2026-10-23: it now reads "a six-tier method", repainted in place (the source file is not in the repo).
5. Social previews (LinkedIn, WhatsApp) cache the old OG card until they re-scrape.

## 7. How to Ship (Once Alexey Says "Ship")

1. `git pull` main; merge `newstyle` into main (fast-forward if main hasn't moved).
2. `cd web && node build.mjs` must pass (contrast gate, home parts, link check).
3. Push main → Vercel builds production. `vercel ls professional-agentic-product-engineering` — top Production row must be `● Ready`; on error read `vercel inspect <url> --logs`.
4. Check the live site with a browser (screenshot): homepage in Signal (the default), `?scheme=cyanotype`, `?scheme=paper`, the slider, menu drawer on home, docked menu on `/tier-3`, a 375px-wide mobile view, console clean. Check `/tier-7` still 301s to `/tier-5`.
5. Report the live URL to Alexey. Mark the task on the wiki page `PAPE Guide` (wiki repo, `wiki/projects/PAPE Guide.md`).

Workspace rules that apply: source edits are done by the Devi agent and reviewed; never report done before the Vercel deploy is Ready and the live page is checked; US English.
