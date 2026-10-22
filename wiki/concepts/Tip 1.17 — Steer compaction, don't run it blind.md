# Tip 1.17 — Steer compaction, don't run it blind
**Part of:** [[Tier 1 — Prompt]] · tip 17 of 17
**Source:** `guide.md #tip-1-17` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "/compact"
>
> **Prefer:** "/compact keep the data-model decisions and the failing-test list; drop the exploration."

Tell compaction what to keep and what to drop, so the summary retains the decisions and open threads instead of whatever the model happens to salvage.

## Related
- [[Tier 1 — Prompt]]
- [[Tip 1.16 — `∕clear` between tasks; reset after repeated failure]]
