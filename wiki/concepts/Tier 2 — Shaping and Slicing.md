# Tier 2 — Shaping and Slicing
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

**Tier 2 — Plan and slice before you build, to keep every change small and safe.**

**Reach for this tier when** big asks go sideways — the agent edits the wrong things or tries to do everything in one pass. Plan first, then cut the work into small slices, each one small enough to check and cheap to undo.

## The 8 tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 2.1 — Investigate before you edit — a wrong mental model wrecks the diff]] — Explore and explain first, change nothing, *then* implement.
- [[Tip 2.2 — Plan the uncertain; skip the plan for the trivial]] — Plan multi-file or unfamiliar work; do one-sentence diffs directly.
- [[Tip 2.3 — Force an approval checkpoint and see what it will touch — nothing irreversible runs unseen]] — Numbered plan, risk per step, exact files to create/modify/delete, then STOP for approval — nothing irreversible runs unseen.
- [[Tip 2.4 — Ask for options, not the first idea]] — "Give me 2–3 approaches with a one-line trade-off each; I'll choose."
- [[Tip 2.5 — Slice vertically — thin end-to-end increments, not horizontal layers]] — UI → API → DB → test, ship green before the next slice. See [[Vertical Slicing]].
- [[Tip 2.6 — Turn big features into a spec, then a fresh session]] — Interview me, write SPEC.md → new session: "Implement SPEC.md." Shape behavior as a Story, Given/When/Then scenarios, and Non-goals.
- [[Tip 2.7 — Plan with the smart model, build with the cheap one]] — `/model opusplan` — Opus reasons through the plan, Sonnet writes the code.
- [[Tip 2.8 — Have one agent draft the spec and a different one critique it — before any code]] — The critic's different blind spots are the point. See [[Multi-Model Playbook]].

## Spec-driven shaping

Shape the behavior into the spec itself so "done" is concrete *before* any code:

- **Story** — one user-value sentence.
- **Scenarios (`.feature`)** — Given/When/Then, one behavior each, concrete Then steps.
- **Non-goals** — what's explicitly out of scope.

This is the **shape**; Tier 4 turns these scenarios into the loop's executable check (Tip 4.3). The spec becomes the contract the whole build runs against — see [[Executable Definition of Done]].

## Slicing

> ❌ Instead: "Build the whole course-catalog feature."
> ✅ Prefer: "Slice 1: a user searches courses by department and sees results — UI → API → DB → test. Ship it green before slice 2."

A vertical slice is narrow, end-to-end, independently testable. It keeps each agent task inside the context window, makes dependencies explicit, and gives a working checkpoint after every slice instead of one giant unverifiable diff.

## Related

- [[Vertical Slicing]]
- [[Executable Definition of Done]]
- [[Multi-Model Playbook]]
- [[The Eight Tiers]]
- [[Tier 4 — Loop Until Done]]
