# The Harness
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

The harness is the system you build *around* the model. It is what turns vibe coding into an agentic system.

## Definition

An agentic system "puts the same model inside a *harness*: a **workflow** — the loop it runs — bounded by three constraints":

- **Guidelines** — "shape how it should behave."
- **Autotests** — "give it ground truth from the environment."
- **Guardrails** — "are the limits it can't cross."

"Inside those bounds the model converges on its own, and your attention is freed for what actually matters: growing understanding and driving impact."

## Git and tooling are harness too

The harness isn't only prompts and constraints — the surrounding machinery counts:

- "Git isn't bookkeeping here — it's the loop's memory and undo. And the harness around it — hooks that always run your tests, CI, the `gh` CLI — makes the whole loop deterministic and shareable with the team." (see [[Checkpointing and Hardening]])
- The guide's closing move (Tip 6.7) — "Engineer the environment, not the wording": "invest in CLAUDE.md, Skills, MCP, git discipline, tests as the check, hooks, and CI."

## The system is the product

- "Every methodology converges on **research → plan → execute → review → ship**, human-gated — build the system that runs that loop."
- "That system, not the prompt, is the product of professional agentic engineering."

## Related
- [[From Prompts to Systems]]
- [[Checkpointing and Hardening]]
- [[Agentic Primitives]]
- [[Loops of Agentic Engineering]]
