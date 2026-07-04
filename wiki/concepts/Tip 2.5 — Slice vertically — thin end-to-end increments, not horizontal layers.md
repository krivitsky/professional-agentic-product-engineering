# Tip 2.5 — Slice vertically — thin end-to-end increments, not horizontal layers
**Part of:** [[Tier 2 — Shaping and Slicing]] · tip 5 of 8
**Source:** `guide.md #tip-2-5` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "Build the whole course-catalog feature."
>
> **Prefer:** "Slice 1: a user searches courses by department and sees results — UI → API → DB → test. Ship it green before slice 2."

*A vertical slice is narrow, end-to-end, independently testable. It keeps each agent task inside the context window, makes dependencies explicit, and gives a working checkpoint after every slice instead of one giant unverifiable diff.*

## Related
- [[Tier 2 — Shaping and Slicing]]
- [[Tip 2.4 — Ask for options, not the first idea]]
- [[Tip 2.6 — Turn big features into a spec, then a fresh session]]
- [[Vertical Slicing]]
