# Tip 3.13 — Try risky work in a worktree — a disposable checkpoint you can throw away
**Part of:** [[Tier 3 — Verify]] · tip 13 of 13
**Source:** `guide.md #tip-3-13` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** a risky refactor or spike directly on your working branch, hoping you can `git reset` your way out.
>
> **Prefer:** `git worktree add ../spike-x spike-x` — experiment there; keep it if it works, delete the directory if it doesn't. Your main working copy never sees the mess.

Worktrees also isolate **parallel** agents so they don't clobber each other — that's the Tier 5 use ([[Tier 5 — Orchestrate]]).

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.12 — Commit every working step — checkpoints are what make a loop safe]]
- [[Tier 5 — Orchestrate]]
