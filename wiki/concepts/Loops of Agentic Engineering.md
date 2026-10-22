# Loops of Agentic Engineering
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

The system you build around the model "isn't a line — it's **three nested loops**" (the value-factory model). Each wider loop is "slower, higher-stakes, and longer to close."

## The three nested loops

- **Coding loop** — red → green → refactor. The tight inner cycle.
- **Feature loop** — specify → refine → verify. Wraps the coding loop.
- **Impact loop** — opportunities → hypothesis → impact. The outermost, real-world loop.

The impact loop contains the feature loop, which contains the coding loop.

## Which tiers build which loop

Each loop is built by a stage of the ladder: **Direct** (T1–T2) builds the request and the feature loop's *specify*; **Trust** (T3–T4) closes the coding loop and the feature loop's *verify*; **Scale** (T5–T6) reaches the impact loop.

- **Coding loop** (red → green → refactor) — "closed by Tier 3's tests; Tier 4 hardens that check so it runs every time." (see [[Tier 3 — Verify]], [[Tier 4 — Enforce]])
- **Feature loop** (specify → refine → verify) — "runs from the spec you shape in Tier 2 to that same Tier 3 check, which is why Tier 3 belongs to both." (see [[Tier 2 — Plan]])
- **Impact loop** (opportunities → hypothesis → impact) — "Tiers 5–6 scale out to it, once one agent or one machine isn't enough." (see [[Tier 6 — Supervise]])

## The through-line

"Six tiers, three loops: climbing the ladder is how you build the loops up." The Tier 3 check that closes the coding loop is the same check the feature loop verifies against — the [[Executable Definition of Done]].

## Related
- [[Tier 3 — Verify]]
- [[Tier 2 — Plan]]
- [[Tier 6 — Supervise]]
- [[The Six Tiers]]
- [[Executable Definition of Done]]
