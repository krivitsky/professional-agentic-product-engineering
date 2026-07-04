# Vertical Slicing
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

A vertical slice is narrow, **end-to-end, independently testable** — UI → API → DB → test — shipped green before the next, not built as horizontal layers.

## Tip 2.5 — Slice vertically

> ❌ Instead of: "Build the whole course-catalog feature."
>
> ✅ Prefer: "Slice 1: a user searches courses by department and sees results — UI → API → DB → test. Ship it green before slice 2."

## Why it works

- **Keeps each agent task inside the context window** — a thin slice fits; a whole feature doesn't.
- **Makes dependencies explicit.**
- **Gives a working checkpoint after every slice** instead of one giant unverifiable diff.

## Same discipline at the scenario level

- The vertical-slice discipline reappears in BDD: hand the agent the `.feature` and implement **one scenario at a time** — red → green → commit before starting the next, not all at once.
- Left alone, the agent codes every scenario in a single sprawling pass, blowing up work-in-progress into one diff you can't review. One at a time keeps WIP small and makes every green a checkpoint.
- Sanity-check each by mutation: break the implementation on purpose, confirm the scenario fails, then revert.

## Related
- [[Tier 2 — Shaping and Slicing]]
- [[Tier 4 — Loop Until Done]]
- [[Executable Definition of Done]]
- [[Loops of Agentic Engineering]]
