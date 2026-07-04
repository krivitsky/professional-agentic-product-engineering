# Tip 6.6 — Steer long runs mid-flight instead of restarting them
**Part of:** [[Tier 6 — Orchestration]] · tip 6 of 7
**Source:** `guide.md #tip-6-6` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** killing a 40-minute run to change a permission, budget, or direction.
>
> **Prefer:** inject a steering message while it runs.

Type a correction mid-run (or push a `system` message into the live `messages` array) — current models accept mid-conversation steering, so you change course without a restart or cache rebuild.

## Related
- [[Tier 6 — Orchestration]]
- [[Tip 6.5 — Engineer the long-horizon hand-off — so the next session doesn't guess]]
- [[Tip 6.7 — Engineer the environment, not the wording]]
