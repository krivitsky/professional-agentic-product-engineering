# Tip 3.2 — Do TDD — the unit-level check
**Part of:** [[Tier 3 — Verify]] · tip 2 of 13
**Source:** `guide.md #tip-3-2` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "Implement and test calculateTotal."
>
> **Prefer:** drive the code with a failing test first.

Committing the failing tests first means any quiet test-weakening shows up in the diff; implement to green without editing the tests.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.1 — Make your Definition of Done executable — a command is what the loop converges to]]
- [[Tip 3.3 — Use BDD — the behavior-level check]]
