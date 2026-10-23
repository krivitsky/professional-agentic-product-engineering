# The Harness
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

The harness is the system you build *around* the model. It is what turns vibe coding into an agentic system.

## Definition

An agentic system "puts the same model inside a *harness*: a **workflow** — the loop it runs — bounded by three constraints":

- **Guidelines** — "shape how it should behave."
- **Autotests** — "give it ground truth from the environment."
- **Guardrails** — "are the limits it can't cross."

"Inside those bounds the model converges on its own, and your attention is freed for what actually matters: growing understanding and driving impact."

## Git and Tooling Are Harness Too

The harness isn't only prompts and constraints — the surrounding machinery counts:

- "Git isn't bookkeeping here — it's the loop's memory and undo." (see [[Tier 3 — Verify]]) And "the harness around the loop — hooks that always run your tests, CI, the `gh` CLI — makes the whole loop deterministic and shareable with the team." (see [[Tier 4 — Enforce]])
- The guide's closing move (Tip 5.7) — "Engineer the environment, not the wording": "invest in CLAUDE.md, Skills, MCP, git discipline, tests as the check, hooks, and CI."

## The System Is the Product

- "Every methodology converges on **research → plan → execute → review → ship**, human-gated — build the system that runs that loop."
- "That system, not the prompt, is the product of professional agentic engineering."

## Knowing Whether Yours Holds

A harness you built yourself is the hardest one to judge — every gap looks intentional from the inside. The guide's answer is the [[Harness Audit]]: read the harness as checked in, rate it against [[The Six Tiers]], and name the lowest rung that doesn't hold yet.

## Related
- [[From Prompts to Systems]]
- [[Harness Audit]]
- [[Tier 4 — Enforce]]
- [[Agentic Primitives]]
- [[Loops of Agentic Engineering]]
