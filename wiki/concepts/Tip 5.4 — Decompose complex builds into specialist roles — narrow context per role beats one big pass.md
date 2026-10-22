# Tip 5.4 — Decompose complex builds into specialist roles — narrow context per role beats one big pass
**Part of:** [[Tier 5 — Orchestrate]] · tip 4 of 9
**Source:** `guide.md #tip-5-4` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** one prompt that builds everything in one pass.
>
> **Prefer:** architect → backend → frontend → tests → security-review, each a subagent with narrow context, reviewing each other.

Split a big build into specialist subagents, each with a tight tool list and narrow context, chained so they review each other — narrow context per role beats one overloaded pass.

## Related
- [[Tier 5 — Orchestrate]]
- [[Tip 5.3 — Race several agents on the same task; keep the winner]]
- [[Tip 5.5 — Engineer the long-horizon hand-off — so the next session doesn't guess]]
- [[Agentic Primitives]]
