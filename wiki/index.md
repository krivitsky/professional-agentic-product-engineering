# Wiki Index

The central catalog of all wiki pages. Updated on every ingest.

## Source

This vault is generated from **`guide.md`** — the canonical field guide at the repo root (Alexey Krivitsky, mid-2026, updated continuously) on operating coding agents ([[Claude Code]]) to build software in real repos. Six tiers in three stages (Direct · Trust · Scale), from prompting to supervising agents in production — *Free the human to judge and innovate.* The guide lives at the root and is **referenced, never copied** into this vault; every page below links back to it.

## Concepts

> **Tip pages live under their tier.** Each of the 6 tier pages below is a hub that links every one of its tips (`[[Tip N.M — …]]`, 65 pages total). Open a tier to reach its tips — they're intentionally not listed here, to keep this index (and the graph) from flattening.

### The big idea
- [[From Prompts to Systems]] — Professional agentic engineering is engineering the system around the model, not prompt-tuning. Prompt shrinks, system grows.
- [[The Prompt Triad]] — Every prompt is three things: intent · context · constraint. The opening frame of Tier 1; threads up through T2 (spec, and context scaled into files and tools), T3 (intent as check), T4 (hardened constraints).
- [[The Harness]] — A workflow bounded by guidelines, autotests, and guardrails; inside those bounds the model converges on its own.
- [[Harness Audit]] — The diagnostic counterpart: rate a real repo's harness against the six tiers, and name the lowest rung that doesn't hold yet. Absence is the easy half; incoherent-and-unenforced is the valuable half.
- [[Loops of Agentic Engineering]] — Three nested loops: coding (red→green→refactor) inside feature (specify→refine→verify) inside impact (opportunities→hypothesis→impact).
- [[The Six Tiers]] — The simple→hard ladder in three stages; each tier hands one manual chore to the system and kills a specific failure of the one below. Climb only as high as the work demands.

### The six tiers
- [[Tier 1 — Prompt]] — T1 (Direct): write prompts the agent can act on (17 tips), opening with [[The Prompt Triad]] and closing with context hygiene. Hand over the outcome, be specific, constrain scope, say it all in the first message; feed high signal, `/clear`, steer compaction.
- [[Tier 2 — Plan]] — T2 (Direct): shape and slice before you build, and give the agent the context it needs (13 tips). Investigate first, approval checkpoints, vertical slices, spec-then-fresh-session; secrets out, CLAUDE.md, Skills, MCP, external memory.
- [[Tier 3 — Verify]] — T3 (Trust): make the agent prove it's done (13 tips). *The heart of the guide* — executable DoD, TDD/BDD, demand evidence, fresh-eyes review, diff-coverage and mutation gates, a commit at every green step.
- [[Tier 4 — Enforce]] — T4 (Trust): write the rules into the harness (5 tips). Hooks instead of reminders, CI/headless, `gh`, repeated corrections as rules, approvals as rules.
- [[Tier 5 — Orchestrate]] — T5 (Scale): run many agents at once (9 tips). The multi-model toolkit, self-orchestration, subagents, racing, specialist roles, long-horizon hand-off, agent-aware terminal, a worktree per agent.
- [[Tier 6 — Supervise]] — T6 (Scale): put agents into production (8 tips). An always-on box, phone, a secured server; sandbox the loop, gate the plan, cap the strikes, tracker as state machine, certify the evidence.

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
- [[Robert C. Martin]] — "Uncle Bob"; Clean Code / Agile Manifesto / SOLID. Cited in the Big Idea as outside validation: he stopped reading his agents' code and trusts the harness instead. His quote also opens [[Harness Audit]].
