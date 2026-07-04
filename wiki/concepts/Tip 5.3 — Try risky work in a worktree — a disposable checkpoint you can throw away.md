# Tip 5.3 — Try risky work in a worktree — a disposable checkpoint you can throw away
**Part of:** [[Tier 5 — Checkpointing and Hardening]] · tip 3 of 5
**Source:** `guide.md #tip-5-3` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** a risky refactor or spike directly on your working branch, hoping you can `git reset` your way out.
>
> **Prefer:** `git worktree add ../spike-x spike-x` — experiment there; keep it if it works, delete the directory if it doesn't. Your main working copy never sees the mess.

Worktrees also isolate **parallel** agents so they don't clobber each other — that's the Tier 7 use ([[Tier 7 — Fleet Ops]]).

## Related
- [[Tier 5 — Checkpointing and Hardening]]
- [[Tip 5.2 — Let Claude drive `gh` — the collaboration layer is harness too]]
- [[Tip 5.4 — Replace "remember to run tests" with a hook]]
- [[Tier 7 — Fleet Ops]]
