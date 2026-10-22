# Tip 5.9 — Isolate parallel agents with worktrees + one session each
**Part of:** [[Tier 5 — Orchestrate]] · tip 9 of 9
**Source:** `guide.md #tip-5-9` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** two agents editing the same working copy and clobbering each other.
>
> **Prefer:** one git worktree + branch + session per agent.

A `git worktree add` gives each agent a separate directory and branch; run one agent in each, in its own tmux/Warp session, so they never collide — and as a bonus you can run the same task with Claude Code in one worktree and Codex in another, then diff the two approaches.

## Related
- [[Tier 5 — Orchestrate]]
- [[Tip 5.8 — Manage parallel agents in an agent-aware terminal — so you see which one is blocked]]
- [[Tier 5 — Orchestrate]]
