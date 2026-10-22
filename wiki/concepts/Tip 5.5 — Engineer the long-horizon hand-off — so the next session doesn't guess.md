# Tip 5.5 — Engineer the long-horizon hand-off — so the next session doesn't guess
**Part of:** [[Tier 5 — Orchestrate]] · tip 5 of 9
**Source:** `guide.md #tip-5-5` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "build the whole app" in one window (it runs out of context mid-feature and the next session guesses).
>
> **Prefer:** an initializer session that writes a checklist; fresh sessions execute it one item at a time.

An initializer session writes the plan and status ledger; fresh worker sessions execute one item at a time — so the next session rebuilds from the record instead of guessing.

## Related
- [[Tier 5 — Orchestrate]]
- [[Tip 5.4 — Decompose complex builds into specialist roles — narrow context per role beats one big pass]]
- [[Tip 5.6 — Steer long runs mid-flight instead of restarting them]]
- [[Context Rot]]
