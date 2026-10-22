# Tip 6.8 — Certify the evidence instead of reading the diff — review the proof, not every line
**Part of:** [[Tier 6 — Supervise]] · tip 8 of 8
**Source:** `guide.md #tip-6-8` (root — canonical, not copied)
**Created:** 2026-10-22

> **Instead of:** reading every line of every PR the agents open, until your review is the bottleneck the agents were meant to remove.
>
> **Prefer:** have every run attach its evidence — test and e2e output, a screenshot of the changed UI, coverage of the changed lines, the mutation score, the review agent's findings — and certify that: does it cover the change, and does it prove what the ticket asked for? Open the code only where the evidence is thin.

The Big Idea at full scale: confidence comes from the gauntlet the output survives, not from reading it. Each piece of evidence is a tip already in use (3.5, 3.10, 3.11, the review agent), now read by the human at the merge gate; the time no longer spent on diffs goes into the system.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.7 — Make the tracker the state machine — the agent forgets; the board remembers]]
- [[From Prompts to Systems]]
