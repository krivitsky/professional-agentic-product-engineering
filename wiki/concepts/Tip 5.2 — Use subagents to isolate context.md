# Tip 5.2 — Use subagents to isolate context
**Part of:** [[Tier 5 — Orchestrate]] · tip 2 of 9
**Source:** `guide.md #tip-5-2` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** a giant exploration that floods your main thread.
>
> **Prefer:** "subagent: trace how auth is wired across the repo; return a summary plus the 3 files I should read." (Low effort for batch subagents to control cost.)

A subagent runs the heavy exploration in its own context window and hands back only a summary — so the noise never lands in your main thread.

## Related
- [[Tier 5 — Orchestrate]]
- [[Tip 5.1 — Let it self-orchestrate big, parallel work — it fans out faster than you can by hand]]
- [[Tip 5.3 — Race several agents on the same task; keep the winner]]
- [[Context Rot]]
