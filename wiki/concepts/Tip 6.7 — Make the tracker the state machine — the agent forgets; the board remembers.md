# Tip 6.7 — Make the tracker the state machine — the agent forgets; the board remembers
**Part of:** [[Tier 6 — Supervise]] · tip 7 of 8
**Source:** `guide.md #tip-6-7` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** holding workflow state in the agent's conversation (it gets archived/compacted away).
>
> **Prefer:** store state as ticket status/labels (Todo → Planning → Approved → In Review). It survives restarts, and a human can override by moving the card.

The conversation is disposable; the tracker's workflow state is the durable state machine the loop reads on every event.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.6 — Cap the strikes — a stuck agent shouldn't burn tokens forever]]
- [[Tip 6.8 — Certify the evidence instead of reading the diff — review the proof, not every line]]
