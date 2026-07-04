# Tip 8.4 — Make the tracker the state machine — the agent forgets; the board remembers
**Part of:** [[Tier 8 — Agent Execution Layer]] · tip 4 of 4
**Source:** `guide.md #tip-8-4` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** holding workflow state in the agent's conversation (it gets archived/compacted away).
>
> **Prefer:** store state as ticket status/labels (Todo → Planning → Approved → In Review). It survives restarts, and a human can override by moving the card.

The conversation is disposable; the tracker's workflow state is the durable state machine the loop reads on every event.

## Related
- [[Tier 8 — Agent Execution Layer]]
- [[Tip 8.3 — Cap the strikes — a stuck agent shouldn't burn tokens forever]]
