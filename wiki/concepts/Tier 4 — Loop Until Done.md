# Tier 4 — Loop Until Done
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

**Tier 4 — Make the agent prove it's done, so you can trust the output.**

**Reach for this tier when** you can't trust the output without reading every line, and "done" means nothing concrete. **This is the heart of professional agentic engineering.**

## The framing

> **Prompts don't make agents reliable. Verification does.**

You don't get great output from one prompt — you get it from a **loop**: the agent acts, checks, improves, repeats. A loop only works if it has a target it can test itself against — something that reports *done / not done* without you checking every cycle.

- **That target is tests.** **Red → green is the ideal loop condition** — the innermost of the [[Loops of Agentic Engineering]]: unambiguous, automatable, and the agent can run it itself.
- **TDD and BDD are now mandatory.** Once *highly recommended*, in the agentic era they're what turns a wandering agent into one that converges instead of declaring success on vibes. That's what makes it *engineering* and not just generation.
- **This is just your Definition of Done, made executable.** Every DoD item that *can* be a command (tests, lint, typecheck, build, e2e, coverage) becomes part of the bar the agent iterates toward; the few that can't — "does this actually solve the user's problem?" — stay human gates. See [[Executable Definition of Done]].
- **The spec is the new source code.** When the loop regenerates the implementation on demand against an executable spec, the code becomes throwaway output and `SPEC.md` + tests become the artifact you author, version, and review. Your job moves up — from writing syntax to writing the rules the agent executes against.
- **You decide what to test for; the agent doesn't.** The tests that catch real bugs are usually integration and end-to-end. You say what they must check; the agent writes them to your spec and adds them to CI; you confirm they check the right things. Build the rails; don't let the agent build its own.

## The 9 tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 4.1 — Make your Definition of Done executable — a command is what the loop converges to]] — Spell out DoD as commands the agent runs itself; loop until all pass; show each output.
- [[Tip 4.2 — Do TDD — the unit-level check]] — Drive the code with a failing test first; commit the failing test as a safety net, then implement to green without editing the tests.
- [[Tip 4.3 — Use BDD — the behavior-level check]] — Given/When/Then scenarios the agent codes against and runs, **one scenario at a time** (red → green → commit), sanity-checked by mutation.
- [[Tip 4.4 — Test the UI for real with Playwright MCP — don't eyeball it]] — Drive a live browser, perform the flow, assert, and save the run as an e2e spec. Uses [[Playwright MCP]].
- [[Tip 4.5 — Demand evidence, not a claim of success]] — "Paste the exact test command and its output before you say it's done."
- [[Tip 4.6 — Ask for all findings, not a conservative review]] — "List every issue with a severity label and line reference. Don't pre-filter — I'll triage."
- [[Tip 4.7 — Review with fresh eyes, not the context that wrote it]] — A fresh subagent/session (or a different model) reviews the diff against the criteria; correctness only. See [[The Review-Agent Pattern]].
- [[Tip 4.8 — Run a pre-mortem; treat it like a teammate]] — "What could fail here? What did you assume? What's missing?"
- [[Tip 4.9 — Iterate UI visually when there's no spec to assert]] — Mock → implement → screenshot → compare → fix (2–3 rounds); override the model's default house style with a concrete palette spec.

## Key Instead/Prefer pairs

**4.1 Make your Definition of Done executable.**
> ❌ Instead: "Make it work."
> ✅ Prefer: "Done when: `npm test` green, `npm run lint` clean, `npm run typecheck` passes, and `curl /health` returns 200. Loop until all four pass; show each output. Flag anything you couldn't verify."

**4.5 Demand evidence, not a claim of success.**
> ❌ Instead: accepting "done, it works."
> ✅ Prefer: "Paste the exact test command and its output before you say it's done."

**Mental model:** TDD = test first (developer level) · BDD = behavior first in business language (acceptance level) · SDD = whole spec first, agent generates code + tests + docs. They nest — that nesting *is* the [[Loops of Agentic Engineering]].

## Related

- [[Executable Definition of Done]]
- [[Loops of Agentic Engineering]]
- [[The Review-Agent Pattern]]
- [[Playwright MCP]]
- [[The Eight Tiers]]
