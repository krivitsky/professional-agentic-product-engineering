# Loops of Agentic Engineering
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

The system you build around the model "isn't a line — it's **three nested loops**" (the value-factory model). Each wider loop is "slower, higher-stakes, and longer to close."

## The three nested loops

- **Coding loop** — red → green → refactor. The tight inner cycle.
- **Feature loop** — specify → refine → verify. Wraps the coding loop.
- **Impact loop** — opportunities → hypothesis → impact. The outermost, real-world loop.

The impact loop contains the feature loop, which contains the coding loop.

## Which tiers build which loop

- **Coding loop** (red → green → refactor) — "closed by Tier 4's tests; Tier 5 hardens that check so it runs every time." (see [[Tier 4 — Loop Until Done]])
- **Feature loop** (specify → refine → verify) — "runs from the spec you shape in Tier 2 to that same Tier 4 check, which is why Tier 4 belongs to both." (see [[Tier 2 — Shaping and Slicing]])
- **Impact loop** (opportunities → hypothesis → impact) — "Tiers 6–8 scale out to it, once one agent or one machine isn't enough." (see [[Tier 8 — Agent Execution Layer]])
- **Groundwork** — "Tiers 1 and 3 — prompting and context — are the groundwork under all three."

## The through-line

"Eight tiers, three loops: climbing the ladder is how you build the loops up." The Tier 4 check that closes the coding loop is the same check the feature loop verifies against — the [[Executable Definition of Done]].

## Related
- [[Tier 4 — Loop Until Done]]
- [[Tier 2 — Shaping and Slicing]]
- [[Tier 8 — Agent Execution Layer]]
- [[The Eight Tiers]]
- [[Executable Definition of Done]]
