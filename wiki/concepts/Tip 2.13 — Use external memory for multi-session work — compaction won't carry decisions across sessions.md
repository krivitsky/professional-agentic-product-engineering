# Tip 2.13 — Use external memory for multi-session work — compaction won't carry decisions across sessions
**Part of:** [[Tier 2 — Plan]] · tip 13 of 13
**Source:** `guide.md #tip-2-13` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** trusting compaction to carry decisions across sessions.
>
> **Prefer:** write `STATUS.md` at session end; reload it at the next session's start.

Compaction summarizes within a session but won't survive a reset — a durable `STATUS.md` is the memory that carries decisions across sessions.

## Related
- [[Tier 2 — Plan]]
- [[Tip 2.12 — Add the right MCP servers; keep the surface small]]
