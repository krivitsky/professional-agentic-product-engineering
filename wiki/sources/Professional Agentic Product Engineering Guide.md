# Professional Agentic Product Engineering Guide

**Source:** [`guide.md`](../../guide.md) — the canonical field guide by Alexey Krivitsky, at the repo root (updated continuously). This page is a **summary**, not a copy; read the root `guide.md` for the full text.
**Created:** 2026-07-04
**Updated:** 2026-07-04

> *Agentic engineering is a profession, not a prompt.* — the guide's epigraph

A mid-2026 field guide to getting genuinely good at operating coding agents ([[Claude Code]] by [[Anthropic]] as the running example) for building new software and working on real codebases. Calibrated for the current frontier class — Opus 4.8+, GPT-5.5-class+, Gemini 3.x+.

## Goal

Take engineers and technical founders from "used a coding agent a few times" to **professional agentic product engineering**: agents running in a loop against a clear, testable standard, inside a real repo you own. It spans the full range — from "fix bug xyz" to autonomous engineering loops running in production.

## The core thesis

- **[[From Prompts to Systems]]** — professional agentic engineering is *not* prompt engineering; it's engineering the system around the model. As the work gets harder, effort shifts from wording one prompt to building the [[The Harness]] around it — the prompt shrinks, the system grows.
- **[[The Harness]]** — a workflow (the loop) bounded by guidelines, autotests, and guardrails. Inside those bounds the model converges on its own.
- **[[Loops of Agentic Engineering]]** — the harness is three nested loops: coding (red → green → refactor) inside feature (specify → refine → verify) inside impact (opportunities → hypothesis → impact).

## The ladder — [[The Eight Tiers]]

One ladder, simple → hard. Climb only as high as your work demands, then stop.

1. [[Professional Prompting]] (T1) — write prompts the agent can act on
2. [[Shaping and Slicing]] (T2) — plan and slice before you build
3. [[Context Management]] (T3) — give the agent the right context and tools
4. [[Loop Until Done]] (T4) — make the agent prove it's done (*the heart of the guide*)
5. [[Checkpointing and Hardening]] (T5) — checkpoint in git; harden the harness
6. [[Orchestration]] (T6) — run many agents at once
7. [[Fleet Ops]] (T7) — operate your agents as a fleet
8. [[Agent Execution Layer]] (T8) — put agents into production

## Cross-cutting ideas

- [[Agentic Primitives]] — the committed plain-text building blocks (CLAUDE.md, Skills, subagents, hooks, MCP, permissions, plugins)
- [[Executable Definition of Done]] — the machine-checkable contract the loop runs against
- [[Vertical Slicing]] — thin, end-to-end, independently testable increments
- [[Context Rot]] — context is a finite budget with diminishing returns
- [[Multi-Model Playbook]] — different models have different blind spots; a second model catches what the first missed
- [[The Review-Agent Pattern]] — the first production loop most teams ship

## Related
[[The Eight Tiers]] · [[From Prompts to Systems]] · [[The Harness]] · [[Loops of Agentic Engineering]] · [[Claude Code]] · [[Agentic Primitives]]
