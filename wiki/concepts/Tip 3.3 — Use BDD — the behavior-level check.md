# Tip 3.3 — Use BDD — the behavior-level check
**Part of:** [[Tier 3 — Verify]] · tip 3 of 13
**Source:** `guide.md #tip-3-3` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** vague acceptance ("it should handle bad input").
>
> **Prefer:** Given/When/Then scenarios the agent codes against and runs.

Implement one scenario at a time — red → green → commit before the next — and sanity-check each by mutation; that keeps work-in-progress small and every green a checkpoint.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.2 — Do TDD — the unit-level check]]
- [[Tip 3.4 — Test the UI for real with Playwright MCP — don't eyeball it]]
