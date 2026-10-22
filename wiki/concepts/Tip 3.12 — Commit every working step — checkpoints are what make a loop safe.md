# Tip 3.12 — Commit every working step — checkpoints are what make a loop safe
**Part of:** [[Tier 3 — Verify]] · tip 12 of 13
**Source:** `guide.md #tip-3-12` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** one giant commit at the end (or none).
>
> **Prefer:** commit after each green step; each commit is a state the loop (or you) can revert to.

Combine "commit after each step that passes tests" with a `Stop` hook that won't let it stop on red, and every checkpoint is a *working* state — the agent can iterate hard and never lose ground. Start from a clean tree; back up anything it can't regenerate before granting write access.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.11 — Mutation-test the suite itself — coverage proves the line ran, not that anything checked it]]
- [[Tip 3.13 — Try risky work in a worktree — a disposable checkpoint you can throw away]]
- [[The Harness]]
