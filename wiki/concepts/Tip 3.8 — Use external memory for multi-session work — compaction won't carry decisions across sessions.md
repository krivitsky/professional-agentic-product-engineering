# Tip 3.8 — Use external memory for multi-session work — compaction won't carry decisions across sessions
**Part of:** [[Tier 3 — Context Management]] · tip 8 of 8
**Source:** `guide.md #tip-3-8` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** trusting compaction to carry decisions across sessions.
>
> **Prefer:** write `STATUS.md` at session end; reload it at the next session's start.

Compaction summarizes within a session but won't survive a reset — a durable `STATUS.md` is the memory that carries decisions across sessions.

## Related
- [[Tier 3 — Context Management]]
- [[Tip 3.7 — Add the right MCP servers; keep the surface small]]
