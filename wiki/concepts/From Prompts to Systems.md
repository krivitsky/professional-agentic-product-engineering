# From Prompts to Systems
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

The Big Idea of the whole guide, in one line:

> Professional agentic engineering is **not prompt engineering. It's engineering the system around the model.**

## Two ways to run a model

- **Vibe coding (poke and hope).** Prompting alone: "you poke the model and hope it converges." It can — "but only under constant hand-steering, and left to prompts alone the product sprawls, features drift, and quality slides into slop, while your own attention drains into operating the model."
- **An agentic system.** The *same* model, placed inside a harness. "Inside those bounds the model converges on its own, and your attention is freed for what actually matters: growing understanding and driving impact."

## What the harness is

An agentic system "puts the same model inside a *harness*: a **workflow** — the loop it runs — bounded by three constraints":

- **Guidelines** — shape how it should behave.
- **Autotests** — give it ground truth from the environment.
- **Guardrails** — the limits it can't cross.

See [[The Harness]] for the full definition.

## The shift

- "As the work gets harder, your effort moves from *wording one prompt* to *engineering that harness* — the prompt shrinks while the system around it grows."
- The eight tiers are that climb: "from a single request (T1) to whole loops running autonomously in production (T8)."
- The harness has a shape — three nested loops, from the tight red-green cycle out to real-world impact.

## External validation

[[Robert C. Martin]] ("Uncle Bob") — Agile Manifesto signatory, author of *Clean Code*, namer of SOLID, and for a generation the loudest voice for reading and crafting every line — now says he does *not* read the code his agents write, and instead *"surround[s] the agents with extreme constraints. Unit tests, gherkin tests, QA procedures, quality metrics, mutation testing, test coverage… I have very high confidence in the code they produce because they've had to run the gauntlet of all my constraints and tests."*

- **Significance:** the industry's foremost advocate for *reading* code stops reading it — the strongest possible endorsement of this page's thesis that trust is engineered by the harness, not earned by watching the model.
- **Continuity:** his constraints *are* the craftsmanship disciplines (TDD/BDD/coverage) he preached for decades — craftsmanship didn't die, it moved from the hand-written code to the [[The Harness]] around the model. See [[Tier 4 — Loop Until Done]].
- **Caveat:** the guide keeps a review step (Tip 4.7) that his "read none of it" framing drops; it cites the *constraints* half, not the *never-read* half.

## External References
- [Robert C. Martin (@unclebobmartin) on surrounding agents with extreme constraints](https://x.com/unclebobmartin/status/2080257779395154409) — X, July 2026

## Related
- [[The Harness]]
- [[Loops of Agentic Engineering]]
- [[The Eight Tiers]]
- [[Agentic Primitives]]
- [[Robert C. Martin]]
