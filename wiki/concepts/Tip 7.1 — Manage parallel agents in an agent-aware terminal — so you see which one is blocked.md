# Tip 7.1 — Manage parallel agents in an agent-aware terminal — so you see which one is blocked
**Part of:** [[Tier 7 — Fleet Ops]] · tip 1 of 5
**Source:** `guide.md #tip-7-1` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** a dozen plain terminal tabs where you lose track of which agent is blocked.
>
> **Prefer:** a terminal built for agents (Warp) — panes per agent, notifications when one needs input, a built-in diff/review panel.

Claude Code runs inside Warp: one tab per repo, `Cmd+D` splits a pane per agent, a session that needs input is flagged while the rest run in the background, and `Cmd+Shift++` opens a code-review panel to diff changes and send inline comments back.

## Related
- [[Tier 7 — Fleet Ops]]
- [[Tip 7.2 — Isolate parallel agents with worktrees + one session each]]
- [[Tier 6 — Orchestration]]
