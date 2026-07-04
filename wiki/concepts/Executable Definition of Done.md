# Executable Definition of Done
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

Your Definition of Done, made executable — the machine-checkable contract the loop runs against.

## From team discipline to machine contract

- In agile, the DoD is the shared, explicit checklist a work item must satisfy to count as finished — tests pass, code reviewed, lint clean, types check, docs updated, deployed to staging.
- It used to be enforced by team discipline. With agents it becomes the **machine-checkable contract the loop runs against**.
- Every DoD item that *can* be a command (tests, lint, typecheck, build, e2e, coverage threshold) becomes part of the bar the agent iterates toward.
- The few that can't be automated — "does this actually solve the user's problem?" — stay **human gates**.

## The skill

- The whole skill is **writing a DoD precise enough that the agent knows, without you, whether it's done.**
- **You decide what to test for; the agent doesn't.** The tests that catch real bugs are usually integration and end-to-end, not single units — treat those as first-class. Build the rails; don't let the agent build its own.
- The deeper shift: **the spec is the new source code.** When the loop regenerates the implementation on demand against an executable spec, the code becomes throwaway output and `SPEC.md` + tests become the artifact you author, version, and review.

## Tip 4.1 — Make your Definition of Done executable

> ❌ Instead of: "Make it work."
>
> ✅ Prefer: spell out the DoD as commands the agent runs itself:
> "Done when: `npm test` green, `npm run lint` clean, `npm run typecheck` passes, and `curl /health` returns 200. Loop until all four pass; show each output. Flag anything you couldn't verify."

A command is what the loop converges to.

## Related
- [[Loop Until Done]]
- [[Loops of Agentic Engineering]]
- [[The Harness]]
- [[Vertical Slicing]]
