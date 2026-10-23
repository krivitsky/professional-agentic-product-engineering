# The Six Tiers
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-23

The guide opens with its headline: **Free the human to judge and innovate.** — *from commanding the model to supervising the outcomes, a tier-by-tier guide.*

The opener behind it: writing code was maybe never the human task; understanding the problem and deciding what's worth building was the real job. Now that machines can build software, the new profession is designing the systems that ensure quality and spending the freed-up time on purely human work: judgment and innovation. Each tier hands one more manual chore to that system while the human keeps the judgment. The guide calls itself a deep dive into that agentic shift, from coding features to designing agentic systems.

## The Ladder — Three Stages, Two Tiers Each

Every tier name is a verb for what you do.

- **Direct** — get the right work.
  - **T1 [[Tier 1 — Prompt]]** — you stop writing the code by hand · you state the outcome.
  - **T2 [[Tier 2 — Plan]]** — you stop explaining the project and steering each step · you decide the plan and the slice.
- **Trust** — stop checking it yourself.
  - **T3 [[Tier 3 — Verify]]** — you stop reading every line · you define "done".
  - **T4 [[Tier 4 — Enforce]]** — you stop reminding and approving · you write the rules.
- **Scale** — stop running it yourself.
  - **T5 [[Tier 5 — Orchestrate]]** — you stop running agents one by one · you split and coordinate the work.
  - **T6 [[Tier 6 — Supervise]]** — you stop starting and watching runs · you certify the evidence and improve the system.

## What Pushes You Up — Read the Pain Column as a Diagnostic

The trick is knowing *what pushes you to the next tier* — it's always a specific pain, not ambition. Find the pain you feel now; the next tier is the one that fixes it. **Each tier exists to kill a specific failure of the one below it.**

- **T1** → you re-explain the same things; big asks go sideways.
- **T2** → you can't trust the output without reading every line.
- **T3** → you give the same correction again; "remember to run the tests".
- **T4** → one agent is too slow, or a big build floods its context.
- **T5** → runs die when you leave; you start every run yourself.
- **T6** — the top.

Climb as your skill, your harness and your confidence grow. **Climb only as high as your work demands.**

## Which Tier Do You Need?

- **A landing page, throwaway script, or one-off for yourself** → **Tier 1–2** (or skip the agent for a one-shot builder like Lovable/v0/Bolt). Low stakes, short-lived; a clear prompt is enough.
- **A feature in a side project you intend to keep** → **Tier 1–3**. Correctness matters over time — you want a verify loop and checkpoints so it doesn't rot.
- **Production code in a shared team repo** → **Tier 1–4**, reaching into **5–6** as scale demands. Context engineering, git hygiene, and review become non-negotiable; orchestration and a hosted execution layer follow when one agent or one machine isn't enough.

The destination, if you go all the way, is **professional agentic product engineering**: agents running in a loop against a clear, testable standard, inside a real repo you own.

## Related

- [[From Prompts to Systems]]
- [[Loops of Agentic Engineering]]
- [[Harness Audit]]
- [[Tier 1 — Prompt]]
- [[Tier 3 — Verify]]
- [[Tier 6 — Supervise]]
