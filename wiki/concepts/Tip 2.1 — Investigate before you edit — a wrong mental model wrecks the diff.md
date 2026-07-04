# Tip 2.1 — Investigate before you edit — a wrong mental model wrecks the diff
**Part of:** [[Tier 2 — Shaping and Slicing]] · tip 1 of 8
**Source:** `guide.md #tip-2-1` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "Add OAuth." (straight to code)
>
> **Prefer:** "Explore @src/auth, explain how it works, change nothing." → then "now implement OAuth."

Make the agent build the right mental model first — explore and explain, change nothing — before it touches a line, or a wrong model wrecks the whole diff.

## Related
- [[Tier 2 — Shaping and Slicing]]
- [[Tip 2.2 — Plan the uncertain; skip the plan for the trivial]]
