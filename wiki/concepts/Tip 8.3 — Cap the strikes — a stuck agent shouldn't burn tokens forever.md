# Tip 8.3 — Cap the strikes — a stuck agent shouldn't burn tokens forever
**Part of:** [[Tier 8 — Agent Execution Layer]] · tip 3 of 4
**Source:** `guide.md #tip-8-3` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "loop until the tests pass," unbounded.
>
> **Prefer:** "loop until green, max 5 attempts, then stop and summarize what's blocking." An exit condition needs a give-up condition too.

Your Definition of Done is the exit condition; the strike cap is the give-up condition.

## Related
- [[Tier 8 — Agent Execution Layer]]
- [[Tip 8.2 — Gate the plan, not every keystroke]]
- [[Tip 8.4 — Make the tracker the state machine — the agent forgets; the board remembers]]
- [[Executable Definition of Done]]
