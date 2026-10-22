# Tip 1.15 — Feed high-signal context, not the whole repo
**Part of:** [[Tier 1 — Prompt]] · tip 15 of 17
**Source:** `guide.md #tip-1-15` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "Here's the entire codebase." (even at 1M tokens)
>
> **Prefer:** just the affected modules + relevant docs, loaded just-in-time.

Even with a huge window, recall degrades as it fills — spend the budget on the smallest set of high-signal tokens that gets the result, not the whole tree.

## Related
- [[Tier 1 — Prompt]]
- [[Tip 1.14 — Say it all in your first message]]
- [[Tip 1.16 — `∕clear` between tasks; reset after repeated failure]]
- [[Context Rot]]
