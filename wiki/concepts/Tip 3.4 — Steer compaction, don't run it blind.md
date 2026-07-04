# Tip 3.4 — Steer compaction, don't run it blind
**Part of:** [[Tier 3 — Context Management]] · tip 4 of 8
**Source:** `guide.md #tip-3-4` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "/compact"
>
> **Prefer:** "/compact keep the data-model decisions and the failing-test list; drop the exploration."

Tell compaction what to keep and what to drop, so the summary retains the decisions and open threads instead of whatever the model happens to salvage.

## Related
- [[Tier 3 — Context Management]]
- [[Tip 3.3 — `clear` between tasks; reset after repeated failure]]
- [[Tip 3.5 — CLAUDE.md = gotchas + conventions, not an encyclopedia]]
