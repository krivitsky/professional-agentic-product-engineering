# Tip 4.2 — Do TDD — the unit-level check
**Part of:** [[Tier 4 — Loop Until Done]] · tip 2 of 9
**Source:** `guide.md #tip-4-2` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "Implement and test calculateTotal."
>
> **Prefer:** drive the code with a failing test first.

Committing the failing tests first means any quiet test-weakening shows up in the diff; implement to green without editing the tests.

## Related
- [[Tier 4 — Loop Until Done]]
- [[Tip 4.1 — Make your Definition of Done executable — a command is what the loop converges to]]
- [[Tip 4.3 — Use BDD — the behavior-level check]]
