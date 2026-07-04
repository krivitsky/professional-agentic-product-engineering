# The Eight Tiers
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

The guide is one ladder: **eight tiers, simple → hard.** A tier is a level of skill *and* a level of where you're applying effort. As you climb, the work shifts from **wording the prompt** to **engineering the system around the model** — prompts shrink, the system carries the intelligence.

You don't need all eight. **Climb only as high as your work demands, then stop.**

## The ladder — what you learn per tier

- **T1 [[Professional Prompting]]** — Write prompts that get the most from the agent's intelligence
- **T2 [[Shaping and Slicing]]** — Ideate, refine, spec, and plan before you build
- **T3 [[Context Management]]** — Give the agent the right context and tools
- **T4 [[Loop Until Done]]** — Make the agent prove it's done
- **T5 [[Checkpointing and Hardening]]** — Checkpoint in git; run tests and CI automatically
- **T6 [[Orchestration]]** — Run many agents at once
- **T7 [[Fleet Ops]]** — Operate your agents as a fleet
- **T8 [[Agent Execution Layer]]** — Put agents into production

## What pushes you up — read the right column as a diagnostic

The trick is knowing *what pushes you to the next tier* — it's always a specific pain, not ambition. Find the pain you feel now, climb to the tier that fixes it, then stop. **Each tier exists to kill a specific failure of the one below it.**

- **T1** — The agent keeps doing *almost* the right thing; vague asks get literal, wrong results.
- **T2** — Big asks go sideways; it edits the wrong things or tries to do everything in one pass.
- **T3** — You re-explain the same conventions every session; it can't see your DB/browser/docs.
- **T4** — You can't trust the output without reading every line; "done" means nothing concrete.
- **T5** — A long run goes wrong and you lose good work; nothing to roll back to.
- **T6** — One agent is too slow or floods its context; the build is too big for one pass.
- **T7** — Runs die when your laptop sleeps; parallel agents collide; you want to drive from your phone.
- **T8** — The team needs it: agents must pick up tickets and open PRs without anyone babysitting a terminal.

## Which tier do I need?

Match the job to a target tier and stop there — climbing higher than the work demands is wasted effort.

- **A landing page, throwaway script, or one-off for yourself** → **Tier 1–2** (or skip the agent for a one-shot builder like Lovable/v0/Bolt). Low stakes, short-lived; a clear prompt is enough.
- **A feature in a side project you intend to keep** → **Tier 1–4**. Correctness matters over time — you want a verify loop and checkpoints so it doesn't rot.
- **Production code in a shared team repo** → **Tier 1–5**, reaching into **6–8** as scale demands. Context engineering, git hygiene, and review become non-negotiable; orchestration and a hosted execution layer follow when one agent or one machine isn't enough.

The destination, if you go all the way, is **professional agentic product engineering**: agents running in a loop against a clear, testable standard, inside a real repo you own.

## Related

- [[From Prompts to Systems]]
- [[Loops of Agentic Engineering]]
- [[Professional Prompting]]
- [[Loop Until Done]]
- [[Agent Execution Layer]]
