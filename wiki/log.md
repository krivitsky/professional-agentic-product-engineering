# Wiki Log

Chronological record of ingests, queries, and lint passes.

## [2026-07-04] ingest | Professional Agentic Product Engineering Guide

First ingest of this vault. Digested `guide.md` (the full eight-tier field guide) into a connected page set:

- **1 source page:** [guide.md](../guide.md)
- **18 concept pages:** [[From Prompts to Systems]], [[The Harness]], [[Loops of Agentic Engineering]], [[The Eight Tiers]], the 8 tier pages ([[Professional Prompting]], [[Shaping and Slicing]], [[Context Management]], [[Loop Until Done]], [[Checkpointing and Hardening]], [[Orchestration]], [[Fleet Ops]], [[Agent Execution Layer]]), plus [[Agentic Primitives]], [[Executable Definition of Done]], [[The Review-Agent Pattern]], [[Multi-Model Playbook]], [[Vertical Slicing]], [[Context Rot]].
- **3 entity pages:** [[Claude Code]], [[Anthropic]], [[Playwright MCP]].

22 pages total. All internal links verified to resolve against existing filenames — no broken links, no orphan stubs. Pages kept faithful to the guide's verbatim Instead/Prefer pairs.

## [2026-07-04] lint | Health check — clean

Verified vault against schema after a `guide.md` edit:
- **22 pages**, all `[[wikilinks]]` resolve to existing files — **0 broken links, 0 orphans**.
- Tier/tip counts still match the guide (T1=14, T2=8, T3=8, T4=9, T5=5, T6=7, T7=5, T8=4 = 60 tips).
- Structure unchanged; no stale contradictions found.

## [2026-07-04] update | Guide epigraph "Agentic engineering is a profession, not a prompt"

Guide's "Goal" chapter reframed around the profession / professional attitude and now opens with the epigraph. Reflected on [guide.md](../guide.md) — added the epigraph and a professional-attitude paragraph linking [[The Harness]].

## [2026-07-04] refactor | Remove in-vault guide summary — reference root guide.md

Deleted `sources/Professional Agentic Product Engineering Guide.md` (a 44-line summary, not a full copy). The vault now treats the repo-root `guide.md` as the single canonical source: every page's `**Source:**` line links to `../../guide.md` instead of an in-vault page, `index.md` points at `../guide.md`, and the schema (`CLAUDE.md`) codifies "reference the root guide, never copy it in." Removed the now-empty `sources/` directory.
