# Tip 4.3 — Use BDD — the behavior-level check
**Part of:** [[Tier 4 — Loop Until Done]] · tip 3 of 9
**Source:** `guide.md #tip-4-3` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** vague acceptance ("it should handle bad input").
>
> **Prefer:** Given/When/Then scenarios the agent codes against and runs.

Implement one scenario at a time — red → green → commit before the next — and sanity-check each by mutation; that keeps work-in-progress small and every green a checkpoint.

## Related
- [[Tier 4 — Loop Until Done]]
- [[Tip 4.2 — Do TDD — the unit-level check]]
- [[Tip 4.4 — Test the UI for real with Playwright MCP — don't eyeball it]]
