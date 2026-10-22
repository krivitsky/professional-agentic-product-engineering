# Tip 3.1 — Make your Definition of Done executable — a command is what the loop converges to
**Part of:** [[Tier 3 — Verify]] · tip 1 of 13
**Source:** `guide.md #tip-3-1` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "Make it work."
>
> **Prefer:** spell out the DoD as commands the agent runs itself:
> "Done when: `npm test` green, `npm run lint` clean, `npm run typecheck` passes, and `curl /health` returns 200. Loop until all four pass; show each output. Flag anything you couldn't verify."

A Definition of Done precise enough to be commands is what the loop converges to — the agent can tell, without you, whether it's done.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.2 — Do TDD — the unit-level check]]
- [[Executable Definition of Done]]
