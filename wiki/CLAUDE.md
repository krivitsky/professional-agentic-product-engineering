	# Professional Wiki — Schema

This is an LLM-maintained wiki for professional knowledge. The LLM writes and maintains all wiki pages. The human curates sources, directs analysis, and asks questions.

## Scope — professional knowledge only

This wiki holds **only Alexey's professional knowledge**: Org Topologies, AI × Org Design, agentic engineering, frameworks, case studies, sources, and people/orgs tied to that work. It feeds articles, talks, courses, and LinkedIn.

**Never ingest personal content here** — health, family, kids, finances/income, travel, Latin study, or anything from the `personal`, `Family`, `latin`, or `invoicing` streams. That content lives in its own stream folder and never enters the wiki, even if asked offhand. If a source is mixed or borderline, ask before ingesting.

Nothing lands in the wiki unless the human explicitly adds a source and asks to ingest it (see Ingest workflow). No auto-dumping.

## Directory structure

```
prof/
  raw/            # Source documents (immutable — never modified by LLM)
    assets/       # Downloaded images referenced by sources
  wiki/           # LLM-generated pages (LLM owns this entirely)
    index.md      # Catalog of all wiki pages, organized by category
    log.md        # Chronological record of ingests, queries, lint passes
    sources/      # One summary page per ingested source
    entities/     # Pages for people, organizations, products, tools
    concepts/     # Pages for ideas, frameworks, methodologies, patterns
    analyses/     # Filed query results — comparisons, syntheses, deep dives
  CLAUDE.md       # This file — the schema
```

## Page format

All wiki pages use plain markdown. No YAML frontmatter.

- Page title: `# Title` on the first line
- Metadata block immediately after title (plain text, not YAML):
  - `**Source:** [[link]]` or `**Sources:** [[link1]], [[link2]]`
  - `**Created:** YYYY-MM-DD`
  - `**Updated:** YYYY-MM-DD` (only if updated after creation)
- **Filenames must match the page title exactly** (e.g., page `# Multi-Learning` lives in `Multi-Learning.md`). This ensures `[[wikilinks]]` resolve correctly in Obsidian. Never use kebab-case or slug-style filenames.
- Use `[[wikilinks]]` for all internal cross-references (Obsidian-native). Use the simple form `[[Page Title]]`, not the pipe form `[[filename|Title]]`.
- Keep pages focused — one entity/concept/source per page
- Use bullet points and short paragraphs over long prose

## Source of truth for this vault

This vault is the wikified view of **`guide.md` at the repo root** — the single canonical source. **Never copy or summarize `guide.md` into `wiki/sources/`.** The guide lives at the root; the vault only *references* it:

- Every **tier hub, cross-cutting concept, and entity** page uses `**Source:** [guide.md](../../guide.md)` — a relative link to the root file, not a `[[wikilink]]` to an in-vault copy. **Exception: per-tip pages do NOT use that markdown link** — they attribute the guide as *plain text* `` `guide.md #tip-N-M` `` (see the tree rules below). This is deliberate: it's what keeps the graph a tree instead of a flat star.
- Re-run the wikification against the root `guide.md` whenever the guide changes; pages restate/reorganize its ideas for graph navigation, they don't duplicate its text.

This override applies to the repo-native guide only. The generic `raw/` → `sources/` ingest below still holds for *external* documents added to the vault.

## Vault structure — the guide as a 3-level tree

The vault mirrors `guide.md` as a **tree**, not a flat list. This is the shape to preserve on every re-wikification:

```
guide.md  (root — the only node the tiers point back to)
├── Tier 1 — Professional Prompting   ──┬── Tip 1.1 … Tip 1.14
├── Tier 2 — Shaping and Slicing       ─┼── Tip 2.1 … Tip 2.8
│   … (8 tier hubs)                     │
└── Tier 8 — Agent Execution Layer     ─┴── Tip 8.1 … Tip 8.4
Cross-cutting concepts (The Harness, Vertical Slicing, …) and entities (Claude Code, …) hang off the guide at the tier level.
```

**Why it matters:** if every tip links the root `guide.md`, the Obsidian graph collapses into a flat star with `guide` at the center and all ~60 tips orbiting it — the tier structure disappears. The rules below keep tips clustered under their tier.

### Tier hub pages — `concepts/Tier N — <Name>.md`

- Filename/H1 uses the guide's own em-dash heading form: `Tier 1 — Professional Prompting` (an em-dash `—`, **not** a colon — a colon is unsafe in macOS/Obsidian filenames).
- Has a `## The N tips` section that lists **every** tip as a wikilink: `- [[Tip N.M — Title]] — <gloss>`, in guide order, preceded by the line *"Each tip has its own page — click through for the Instead/Prefer pair."*
- Keeps `**Source:** [guide.md](../../guide.md)` (tier hubs *do* link the root — that's the `guide → tier` edge).

### Per-tip pages — `concepts/Tip N.M — <Title>.md` (one file per tip)

Template (copy structurally, fill from the guide verbatim):

```
# Tip N.M — <Title>
**Part of:** [[Tier N — <Name>]] · tip M of <total>
**Source:** `guide.md #tip-N-M`  (root — canonical, not copied)
**Created:** YYYY-MM-DD

> **Instead of:** "<guide's exact text>"
>
> **Prefer:** "<guide's exact text>"

<one gloss line — the guide's own italic gloss if present, else one faithful sentence; no new claims>

## Related
- [[Tier N — <Name>]]
- [[Tip N.(M-1) — …]]   (prev sibling, if any)
- [[Tip N.(M+1) — …]]   (next sibling, if any)
- <optionally ONE cross-link to a concept page you have verified exists>
```

Hard rules for tip pages:
- **Title = guide's tip title with any trailing period dropped**; keep all other punctuation (em-dashes, commas, semicolons, code spans). **Filename must equal the H1 exactly** or the wikilink won't resolve.
- **No `[guide.md](../../guide.md)` markdown link** anywhere on a tip page — attribute as the plain-text `` `guide.md #tip-N-M` `` code span. This is the single most important rule for keeping the tree.
- `**Part of:** [[Tier N — <Name>]]` is the tip's structural parent — the `tier → tip` edge.
- The `#tip-N-M` anchor is the **stable key**; the title drifts. When syncing, match tips by number, not by title.
- **`/` is illegal in filenames.** If a tip title contains a slash (e.g. `/clear`, `CI / headless`), substitute a division slash `∕` (U+2215) or reword, and make the filename = H1 = every inbound wikilink **identical** so it still resolves.

### Re-wikifying after a `guide.md` change (keep it granular)

For each tip that was **added / changed / removed / renamed**:
- **Added** → create its tip page from the template *and* add its bullet to the tier hub's `## The N tips` list.
- **Changed** (Instead/Prefer or gloss) → update the tip page body verbatim; hub gloss if it moved.
- **Removed** → delete the tip page and its hub bullet; grep for and fix any inbound `[[links]]`.
- **Renamed title** → rename the file, update the H1, and update **every** inbound `[[Tip N.M — …]]` link in one pass (hub + sibling tips). Key the match on the stable `#tip-N-M` anchor.
- **New/removed tier** → add/remove the `Tier N — <Name>` hub and re-tree its tips.

Finish by verifying: **every `[[wikilink]]` resolves, 0 broken links, 0 orphans**, and no tip page hard-links `guide.md`. Update `index.md` (tier level only — do **not** list all ~60 tips there, or `index` becomes a second star) and append a `log.md` entry.

## Workflows

### Ingest

When the human adds a source to `raw/` and asks to ingest it:

1. Read the source document fully
2. Discuss key takeaways with the human if they want to stay involved
3. Create a summary page in `wiki/sources/` — key claims, data points, and takeaways
   *(Exception: for a repo-native doc like the root `guide.md`, do not create a `sources/` page — reference the root file directly per "Source of truth for this vault" above.)*
4. Create or update entity pages in `wiki/entities/` and concept pages in `wiki/concepts/` — this is automatic, no approval needed. Use judgment: create pages for concepts that are distinct and referenceable, not for generic terms.
6. Add `[[wikilinks]]` across all touched pages for cross-referencing. **Critically: the source summary page must wikilink to every concept and entity page created during the ingest.** This ensures new pages appear connected in Obsidian's graph view. Pages that only link *to* the source but aren't linked *from* it will appear as disconnected leaf nodes.
7. Update `wiki/index.md` — add new pages, update summaries of changed pages
8. Append an entry to `wiki/log.md`: `## [YYYY-MM-DD] ingest | Source Title`

A single source may touch 5-15 wiki pages. That's expected.

### Query

When the human asks a question:

1. Read `wiki/index.md` to find relevant pages
2. Read those pages
3. Synthesize an answer using `[[wikilinks]]` for every concept, entity, or source that has a wiki page. Always use `[[Page Title]]` format — never plain text or bold for wiki page names. This makes links clickable in the wiki-chat UI.
4. If the answer is substantial or reusable, offer to file it as a page in `wiki/analyses/`
5. If filed, update `wiki/index.md` and append to `wiki/log.md`

### Lint

When asked to health-check the wiki:

- Flag contradictions between pages
- Flag stale claims superseded by newer sources
- Find orphan pages (no inbound links)
- Identify concepts mentioned but lacking their own page
- Suggest missing cross-references
- Suggest questions to investigate or sources to look for
- Append to `wiki/log.md`: `## [YYYY-MM-DD] lint | Summary of findings`

### External References

When creating or updating concept pages, search the web for high-quality external references — articles, talks, papers, interviews — that support or illustrate the concept. Add the best and most trusted ones in an `## External References` section using standard markdown links (not wikilinks). Prefer primary sources (original talks, published research, official blogs) over secondary coverage.

## Conventions

- Source files in `raw/` are never modified
- Wiki pages are the LLM's responsibility — the human reads, the LLM writes
- Prefer updating existing pages over creating new ones when information overlaps
- When new data contradicts existing wiki content, note the contradiction explicitly on the page
- Keep the index accurate — it's the primary navigation tool
- Log entries use the format: `## [YYYY-MM-DD] action | Description`

## Obsidian-specific rules (learned from experience)

- **Every `[[wikilink]]` must resolve to an existing page.** Before finishing an ingest, verify that every wikilink target has a matching file. Extract all unique targets and compare against filenames.
- **Only wikilink to pages that exist or will be created in the same operation.** For fictional characters, proper nouns without their own page, or general terms (e.g., "systems thinking"), use plain text — not wikilinks. Obsidian auto-creates empty stub files when the user clicks a broken wikilink, polluting the vault.
- **Never create files at the vault root.** All wiki pages go under `wiki/sources/`, `wiki/entities/`, `wiki/concepts/`, or `wiki/analyses/`.
- **Filenames = page titles.** Use spaces, not hyphens or underscores. The filename (minus `.md`) must exactly match the `# Title` heading. This is how Obsidian resolves `[[wikilinks]]`.
- **After creating or renaming files, check for orphaned stubs** at the vault root that Obsidian may have auto-created from previously broken links.
