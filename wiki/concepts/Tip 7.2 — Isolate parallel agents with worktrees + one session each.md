# Tip 7.2 — Isolate parallel agents with worktrees + one session each
**Part of:** [[Tier 7 — Fleet Ops]] · tip 2 of 5
**Source:** `guide.md #tip-7-2` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** two agents editing the same working copy and clobbering each other.
>
> **Prefer:** one git worktree + branch + session per agent.

A `git worktree add` gives each agent a separate directory and branch; run one agent in each, in its own tmux/Warp session, so they never collide — and as a bonus you can run the same task with Claude Code in one worktree and Codex in another, then diff the two approaches.

## Related
- [[Tier 7 — Fleet Ops]]
- [[Tip 7.1 — Manage parallel agents in an agent-aware terminal — so you see which one is blocked]]
- [[Tip 7.3 — Host long runs on a box that doesn't sleep; persist with tmux]]
