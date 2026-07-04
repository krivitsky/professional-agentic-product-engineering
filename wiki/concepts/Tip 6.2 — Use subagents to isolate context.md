# Tip 6.2 — Use subagents to isolate context
**Part of:** [[Tier 6 — Orchestration]] · tip 2 of 7
**Source:** `guide.md #tip-6-2` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** a giant exploration that floods your main thread.
>
> **Prefer:** "subagent: trace how auth is wired across the repo; return a summary plus the 3 files I should read." (Low effort for batch subagents to control cost.)

A subagent runs the heavy exploration in its own context window and hands back only a summary — so the noise never lands in your main thread.

## Related
- [[Tier 6 — Orchestration]]
- [[Tip 6.1 — Let it self-orchestrate big, parallel work — it fans out faster than you can by hand]]
- [[Tip 6.3 — Race several agents on the same task; keep the winner]]
- [[Context Rot]]
