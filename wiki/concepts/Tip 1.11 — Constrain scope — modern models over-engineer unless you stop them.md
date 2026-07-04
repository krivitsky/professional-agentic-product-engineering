# Tip 1.11 — Constrain scope — modern models over-engineer unless you stop them
**Part of:** [[Tier 1 — Professional Prompting]] · tip 11 of 14
**Source:** `guide.md #tip-1-11` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "Fix this bug and improve the code."
>
> **Prefer:** "Fix only this bug — smallest change that works. No refactoring, no comments on untouched code, no handling for cases that can't happen."

Given room, frontier models gold-plate. Bound the scope to the smallest change that works. Bounding the *edit surface* is the sibling move — see [[Tip 1.12 — Narrow the edit surface — a small diff is a reviewable diff]].

## Related
- [[Tier 1 — Professional Prompting]]
- [[Tip 1.10 — Paste raw errors, don't paraphrase them]]
- [[Tip 1.12 — Narrow the edit surface — a small diff is a reviewable diff]]
