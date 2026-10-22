# Tip 5.8 — Manage parallel agents in an agent-aware terminal — so you see which one is blocked
**Part of:** [[Tier 5 — Orchestrate]] · tip 8 of 9
**Source:** `guide.md #tip-5-8` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** a dozen plain terminal tabs where you lose track of which agent is blocked.
>
> **Prefer:** a terminal built for agents (Warp) — panes per agent, notifications when one needs input, a built-in diff/review panel.

Claude Code runs inside Warp: one tab per repo, `Cmd+D` splits a pane per agent, a session that needs input is flagged while the rest run in the background, and `Cmd+Shift++` opens a code-review panel to diff changes and send inline comments back.

## Related
- [[Tier 5 — Orchestrate]]
- [[Tip 5.7 — Engineer the environment, not the wording]]
- [[Tip 5.9 — Isolate parallel agents with worktrees + one session each]]
- [[Tier 5 — Orchestrate]]
