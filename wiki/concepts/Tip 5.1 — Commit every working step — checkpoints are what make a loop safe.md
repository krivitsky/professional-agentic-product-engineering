# Tip 5.1 — Commit every working step — checkpoints are what make a loop safe
**Part of:** [[Tier 5 — Checkpointing and Hardening]] · tip 1 of 5
**Source:** `guide.md #tip-5-1` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** one giant commit at the end (or none).
>
> **Prefer:** commit after each green step; each commit is a state the loop (or you) can revert to.

Combine "commit after each step that passes tests" with a `Stop` hook that won't let it stop on red, and every checkpoint is a *working* state — the agent can iterate hard and never lose ground. Start from a clean tree; back up anything it can't regenerate before granting write access.

## Related
- [[Tier 5 — Checkpointing and Hardening]]
- [[Tip 5.2 — Let Claude drive `gh` — the collaboration layer is harness too]]
- [[The Harness]]
