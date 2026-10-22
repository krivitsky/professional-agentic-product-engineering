# Tip 6.6 — Cap the strikes — a stuck agent shouldn't burn tokens forever
**Part of:** [[Tier 6 — Supervise]] · tip 6 of 8
**Source:** `guide.md #tip-6-6` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "loop until the tests pass," unbounded.
>
> **Prefer:** "loop until green, max 5 attempts, then stop and summarize what's blocking." An exit condition needs a give-up condition too.

Your Definition of Done is the exit condition; the strike cap is the give-up condition.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.5 — Gate the plan, not every keystroke]]
- [[Tip 6.7 — Make the tracker the state machine — the agent forgets; the board remembers]]
- [[Executable Definition of Done]]
