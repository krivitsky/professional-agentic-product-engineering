# Tip 6.1 — Let it self-orchestrate big, parallel work — it fans out faster than you can by hand
**Part of:** [[Tier 6 — Orchestration]] · tip 1 of 7
**Source:** `guide.md #tip-6-1` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** manually spawning and merging a dozen subagents.
>
> **Prefer:** `/effort ultracode` → "audit every endpoint for missing auth, fix it, prove each fix with a test." It fans out parallel subagents and self-verifies; you spot-check the report.

Hand the whole parallel job to the agent and let it fan out its own subagents — it decomposes and self-verifies faster than you can orchestrate by hand.

## Related
- [[Tier 6 — Orchestration]]
- [[Tip 6.2 — Use subagents to isolate context]]
- [[Agentic Primitives]]
