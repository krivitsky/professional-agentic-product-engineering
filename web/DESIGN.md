---
title: Site design spec — the "newstyle" blueprint redesign
status: built on branch newstyle, awaiting Alexey's approval; not merged, not in production
updated: 2026-10-23
owner: Alexey Krivitsky (approves) · built by Devi (agent), reviewed by Aidy
---

# Site design spec — the "newstyle" blueprint redesign

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
| Branch | `newstyle`, 6 commits on top of main `b2d495c`, pushed to origin 2026-10-23 |
| Commits | 384ae05 blueprint redesign · cf57583 home self-audit radar + harness diagram + loops figure · 22008e3 OG card · ce119dc tighter hero · e1fa2ff mermaid edges · 58cb1bd remove mockup |
| Preview | Vercel preview deploy of the branch (behind Vercel login): `vercel ls professional-agentic-product-engineering` → newest Preview row |
| Production | agenticengineering.guide still serves main. Nothing merged. |
| Local demo | `cd web && node build.mjs && cd dist && python3 -m http.server 3010` |

Files touched: `web/src/schemes.mjs` (new), `web/src/styles.css`, `web/src/app.js`, `web/build.mjs`, `web/make-og.mjs`, `assets/og.png`, `assets/og-2x.png`, `README.md`, `CLAUDE.md`.

## 3. The design system

Source of truth for the look: the header comment of `web/src/styles.css`.

- **Type:** Geist (400/500/600/700) and Geist Mono, from Google Fonts. Fallback system-ui.
- **Blueprint frame:** a 40px background grid (`--grid` token), a 2px framed "sheet", square corners everywhere, no shadows.
- **Spec-sheet tables:** bordered, label column + value column. Used for markdown tables, the tier cards and the footer.
- **Layout tokens** (`:root` in styles.css): `--topbar-h 56px`, `--sidebar-w 284px`, `--gutter 24px`, `--measure 72ch`.
- **Every color is a token.** No hex in styles.css. Tokens: `--bg --line --line2 --heading --body --muted --accent --accent-ink --code-bg`, plus derived `--grid --panel --syn-string --frame-bg --accent-soft`.

### 3.1 Color schemes — `web/src/schemes.mjs` (one source for all color)

| id | name | bg | accent | kind |
|---|---|---|---|---|
| `cyanotype` | Cyanotype (**default**, the brand) | #0B3A8C | #FFD23F | dark |
| `signal` | Signal | #111214 | #FF5A1F | dark |
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

### 3.2 Switcher and persistence

- Header: square swatch button → panel with seven radio chips + Intensity slider + Reset (markup in `headerHtml()`, behavior in `app.js`).
- A tiny pre-paint script (`PREPAINT` in build.mjs) runs in `<head>` before the stylesheet: sets `data-scheme`, `--intensity` and `data-nav` on `<html>`, so there is no flash.
- localStorage keys: `pape.scheme`, `pape.intensity.<scheme>` (intensity is remembered **per scheme**), `pape.nav`, `pape.selfAudit`. All access is wrapped in try/catch; the site works with storage blocked.
- URL parameters win and stick: `?scheme=signal`, `?intensity=0.6`.
- The OG share card is always Cyanotype (the brand), whatever a reader picks.

### 3.3 Menu

- **Inner pages, width ≥1024px:** menu docked open on the left; the user's open/closed choice is remembered (`pape.nav`). Current page highlighted and scrolled into view.
- **Homepage (any width) and every page below 1024px:** menu is a drawer, always starts closed; opened by "Contents" in the top-left; overlay click, × button or Escape closes it; focus moves into the drawer and back.
- Groups come from `NAV` in build.mjs (tiers, then "More"). A new guide section must be wired into `NAV` or it won't appear.

## 4. Homepage

Built in `build.mjs` (`p.kind === 'home'`), read from `guide.md` by `homeData()`. Order:

1. **Hero:** title "Professional Agentic Product Engineering", a ruler line carrying the subline ("From commanding the model to supervising the outcomes, a tier-by-tier guide."), the 5-line opener, the deep-dive line ("From coding features to designing systems…"), and the headline "Free the human. Elevate human intelligence."
2. **The six tiers:** three stage columns (Direct · Trust · Scale), each tier a spec card: T-number, name, "You stop" / "You do instead", linking to its tier page. CSS subgrid lines the cards up across columns.
3. **Buttons:** Start at T1 · How it works · All N tips · Learn it with your agent.
4. **Audit your harness (self-audit radar):** six 0–5 sliders beside a hexagon radar SVG. Shows **Strongest** (highest-rated tier[s]) and **Next tier** = the lowest-numbered tier rated ≤2, as a link. **No total and no average**, which is the guide's own audit rule. Ratings saved in `pape.selfAudit`. Points to `/pape:harness-audit` for a real audit. Radar maths is duplicated in build.mjs (server render) and app.js (live); keep them in sync.
5. **The harness around the agent** diagram, from the Big Idea's "An **agentic system** …" paragraph.
6. Remaining home markdown, then the footer CTA (spec-table style, Agentic Shift button).

The build fails, naming the part, if it can't read the opener, the `> **headline**` blockquote, the two tables in "The six tiers at a glance", or the harness paragraph from guide.md — or if the home links to a page that no longer exists.

## 5. Other pieces

- **Figures:** the nested-loops figure is inlined as SVG and colored from tokens (`injectLoops`); mermaid diagrams are recolored by CSS from tokens, so a scheme switch needs no re-render (edges use `--muted` so they're legible on light schemes).
- **Code:** highlight.js and mermaid load on demand from jsDelivr; if the CDN is down, menu and switcher still work. `prompt`/`text` blocks stay unhighlighted. Copy buttons on every code box.
- **OG image:** `node web/make-og.mjs` renders `assets/og.png` + `og-2x.png` (1200×630) with local Google Chrome — Vercel can't run it, so the PNGs are committed. Regenerate when the title, headline or tiers change.
- **Links:** pages link to `*.html`, so the local static server works; Vercel's `cleanUrls` serves them without the extension. Redirects for removed pages live in `web/vercel.json`.

## 6. Open items — need Alexey's call before or after merge

1. **Self-audit starting values.** It opens with example ratings `[4,3,2,2,1,0]` (`AUDIT_DEFAULT`), so a first-time visitor sees a "Next tier" they never rated. Options: label them "example ratings", or start at zero/empty.
2. **"Why this is now its own profession"** section from the mockup was not built. Bring it back with wording from the guide?
3. **"dark/light mode" wording** still in README and guide.md "Formats" section; the site now has seven schemes. Changing guide.md requires `scripts/sync-plugin.sh` and a plugin version bump.
4. **`assets/harness-audit-banner.png` still says "8-tier".** Source file is not in the repo; needs regenerating (tracked on the wiki PAPE Guide page).
5. Social previews (LinkedIn, WhatsApp) cache the old OG card until they re-scrape.

## 7. How to ship (once Alexey says "ship")

1. `git pull` main; merge `newstyle` into main (fast-forward if main hasn't moved).
2. `cd web && node build.mjs` must pass (contrast gate, home parts, link check).
3. Push main → Vercel builds production. `vercel ls professional-agentic-product-engineering` — top Production row must be `● Ready`; on error read `vercel inspect <url> --logs`.
4. Check the live site with a browser (screenshot): homepage in Cyanotype, `?scheme=paper`, the slider, menu drawer on home, docked menu on `/tier-3`, a 375px-wide mobile view, console clean. Check `/tier-7` still 301s to `/tier-5`.
5. Report the live URL to Alexey. Mark the task on the wiki page `PAPE Guide` (wiki repo, `wiki/projects/PAPE Guide.md`).

Workspace rules that apply: source edits are done by the Devi agent and reviewed; never report done before the Vercel deploy is Ready and the live page is checked; US English.
