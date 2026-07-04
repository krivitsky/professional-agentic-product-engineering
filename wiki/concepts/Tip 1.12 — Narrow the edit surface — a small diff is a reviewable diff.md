# Tip 1.12 — Narrow the edit surface — a small diff is a reviewable diff
**Part of:** [[Tier 1 — Professional Prompting]] · tip 12 of 14
**Source:** `guide.md #tip-1-12` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "Refactor the whole checkout flow."
>
> **Prefer:** "Change only `@src/checkout/total.ts` — don't touch anything else."

Scope of *goal* (1.11) and scope of *files touched* are different levers. A diff confined to one file is one you can actually review.

## Related
- [[Tier 1 — Professional Prompting]]
- [[Tip 1.11 — Constrain scope — modern models over-engineer unless you stop them]]
- [[Tip 1.13 — Dial effort; don't beg for thoroughness]]
