# Tip 3.9 — Iterate UI visually when there's no spec to assert
**Part of:** [[Tier 3 — Verify]] · tip 9 of 13
**Source:** `guide.md #tip-3-9` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "Make the dashboard look good."
>
> **Prefer:** mock → implement → screenshot → compare → fix (2–3 rounds). Override the model's default house style (on Opus 4.8 currently: cream, serif, terracotta) with a concrete palette spec.

When there's no spec to assert against, drive the UI by comparison over a few rounds and pin down the look with a concrete palette spec rather than the model's default house style.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.8 — Run a pre-mortem; treat it like a teammate]]
- [[Tip 3.10 — Gate on the coverage of this change, not the project's average]]
