# Wiki Index

The central catalog of all wiki pages. Updated on every ingest.

## Source

This vault is generated from **`guide.md`** — the canonical field guide at the repo root (Alexey Krivitsky, mid-2026, updated continuously) on operating coding agents ([[Claude Code]]) to build software in real repos. Eight-tier ladder from professional prompting to autonomous production loops. The guide lives at the root and is **referenced, never copied** into this vault; every page below links back to it.

## Concepts

> **Tip pages live under their tier.** Each of the 8 tier pages below is a hub that links every one of its tips (`[[Tip N.M — …]]`, ~60 pages total). Open a tier to reach its tips — they're intentionally not listed here, to keep this index (and the graph) from flattening.

### The big idea
- [[From Prompts to Systems]] — Professional agentic engineering is engineering the system around the model, not prompt-tuning. Prompt shrinks, system grows.
- [[The Prompt Triad]] — Every prompt is three things: intent · context · constraint. The opening frame of Tier 1; threads up through T2 (spec), T3 (context), T4 (intent as check), T5 (hardened constraints).
- [[The Harness]] — A workflow bounded by guidelines, autotests, and guardrails; inside those bounds the model converges on its own.
- [[Loops of Agentic Engineering]] — Three nested loops: coding (red→green→refactor) inside feature (specify→refine→verify) inside impact (opportunities→hypothesis→impact).
- [[The Eight Tiers]] — The simple→hard ladder; each tier kills a specific failure of the one below. Climb only as high as the work demands.

### The eight tiers
- [[Tier 1 — Professional Prompting]] — T1: write prompts the agent can act on (14 tips), opening with [[The Prompt Triad]] (intent · context · constraint). Hand over the outcome, be specific, say what to do not avoid, constrain scope, say it all in the first message.
- [[Tier 2 — Shaping and Slicing]] — T2: plan and slice before you build (8 tips). Investigate first, approval checkpoints, options not first idea, vertical slices, spec-then-fresh-session.
- [[Tier 3 — Context Management]] — T3: give the agent the right context and tools (8 tips). High-signal context, secrets out, /clear, CLAUDE.md, Skills, MCP, external memory.
- [[Tier 4 — Loop Until Done]] — T4: make the agent prove it's done (9 tips). *The heart of the guide* — verification over prompts, TDD/BDD, executable DoD, demand evidence, fresh-eyes review.
- [[Tier 5 — Checkpointing and Hardening]] — T5: checkpoint in git, harden the harness (5 tips). Commit every green step, drive `gh`, worktrees, test hooks, CI/headless.
- [[Tier 6 — Orchestration]] — T6: run many agents at once (7 tips). Self-orchestrate, isolate context in subagents, race agents, specialist roles, long-horizon hand-off.
- [[Tier 7 — Fleet Ops]] — T7: operate agents as a fleet (5 tips). Agent-aware terminal, worktree isolation, non-sleeping box + tmux, drive from phone, secure the server.
- [[Tier 8 — Agent Execution Layer]] — T8: put agents into production (4 tips). Sandbox the loop, gate the plan not every keystroke, cap the strikes, tracker as state machine.

### Cross-cutting
- [[Agentic Primitives]] — The committed plain-text building blocks: CLAUDE.md, slash commands, Skills, subagents, hooks, MCP servers, permissions, plugins.
- [[Executable Definition of Done]] — The DoD made machine-checkable; the bar the loop iterates toward.
- [[Vertical Slicing]] — Thin, end-to-end, independently testable increments; a working checkpoint after each.
- [[Context Rot]] — Context is a finite budget with diminishing returns; recall degrades as the window fills.
- [[Multi-Model Playbook]] — Different models, different blind spots; opusplan, per-subagent models, cross-lab review.
- [[The Review-Agent Pattern]] — The first production loop most teams ship: an agent reviews the PR before a human.

## Entities

- [[Claude Code]] — Anthropic's terminal-native coding agent; the guide's running example. Works in your real repo, makes targeted diffs, opens PRs.
- [[Anthropic]] — Maker of Claude Code and the Claude model family (Opus / Sonnet / Haiku / Fable) used throughout the guide.
- [[Playwright MCP]] — MCP server for driving a live browser to test the UI for real, off the accessibility tree.
