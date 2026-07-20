# Tip 1.5 — Specify the output shape, not just the goal
**Part of:** [[Tier 1 — Professional Prompting]] · tip 5 of 14
**Source:** `guide.md #tip-1-5` (root — canonical, not copied)
**Triad slot:** intent
**Created:** 2026-07-04

> **Instead of:** "Add a search endpoint."
>
> **Prefer:** "Add search: `GET /search?q=`, returns JSON — an array of `{title, url, date}`, newest first, max 20."

Route, response format, ordering, limits. The shape is where a "correct" implementation still misses what you needed.

## Related
- [[Tier 1 — Professional Prompting]]
- [[Tip 1.4 — Give the reason; motivation makes it generalize]]
- [[Tip 1.6 — Show examples instead of describing style]]
- [[The Prompt Triad]]
