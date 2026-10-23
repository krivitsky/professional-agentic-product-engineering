# Tier 2 — Plan
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

Tier 2 of [[The Six Tiers]], in the **Direct** stage. **Shape and slice the work before you build, and give the agent the context it needs.**

**You stop:** explaining the project; steering each step · **You do instead:** decide the plan and the slice · **Climb when:** you can't trust the output without reading every line.

**Reach for this tier when** big asks go sideways — the agent edits the wrong things or tries to do everything in one pass — or you re-explain the same conventions every session and it can't see your DB, browser, or docs. Plan first, then cut the work into small slices, each one small enough to check and cheap to undo. Engineer the project's context once — durable project memory plus the right tools — and it stops re-asking and guessing.

This is [[The Prompt Triad]] externalized onto the page: intent becomes a written spec, context comes from investigating first, and each slice is a constraint small enough to check and undo.

## Spec-Driven Shaping

Shape the behavior into the spec itself so "done" is concrete *before* any code:

- **Story** — one user-value sentence.
- **Scenarios (`.feature`)** — Given/When/Then, one behavior each, concrete Then steps.
- **Non-goals** — what's explicitly out of scope.

This is the **shape**; Tier 3 turns these scenarios into the loop's executable check (Tip 3.3). The spec becomes the contract the whole build runs against — see [[Executable Definition of Done]].

## Slicing

> ❌ Instead: "Build the whole course-catalog feature."
> ✅ Prefer: "Slice 1: a user searches courses by department and sees results — UI → API → DB → test. Ship it green before slice 2."

A vertical slice is narrow, end-to-end, independently testable. It keeps each agent task inside the context window, makes dependencies explicit, and gives a working checkpoint after every slice instead of one giant unverifiable diff.

## Knowledge Encoding — Engineering What's Always Available

The triad's context slot, scaled — from pasting context into a prompt to engineering it: `@files`, tools, MCP, durable memory. Secrets out of git first, then project memory in `CLAUDE.md`, occasional knowledge in Skills, a few high-value MCP servers, and external memory for multi-session work. These are files in the repo, which is why the [[Harness Audit]] rates this half of the tier from what is checked in. See [[Agentic Primitives]].

## The 13 Tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 2.1 — Investigate before you edit — a wrong mental model wrecks the diff]] — Explore and explain first, change nothing, *then* implement.
- [[Tip 2.2 — Plan the uncertain; skip the plan for the trivial]] — Plan multi-file or unfamiliar work; do one-sentence diffs directly.
- [[Tip 2.3 — Force an approval checkpoint and see what it will touch — nothing irreversible runs unseen]] — Numbered plan, risk per step, exact files to create/modify/delete, then STOP for approval — nothing irreversible runs unseen.
- [[Tip 2.4 — Ask for options, not the first idea]] — "Give me 2–3 approaches with a one-line trade-off each; I'll choose."
- [[Tip 2.5 — Slice vertically — thin end-to-end increments, not horizontal layers]] — UI → API → DB → test, ship green before the next slice. See [[Vertical Slicing]].
- [[Tip 2.6 — Turn big features into a spec, then a fresh session]] — Interview me, write SPEC.md → new session: "Implement SPEC.md." Shape behavior as a Story, Given/When/Then scenarios, and Non-goals.
- [[Tip 2.7 — Plan with the smart model, build with the cheap one]] — `/model opusplan` — Opus reasons through the plan, Sonnet writes the code.
- [[Tip 2.8 — Have one agent draft the spec and a different one critique it — before any code]] — The critic's different blind spots are the point. See [[Multi-Model Playbook]].
- [[Tip 2.9 — Keep secrets out of git and out of context — set this up first]] — `.env` gitignored and referenced by variable, enforced with a `PreToolUse` hook.
- [[Tip 2.10 — CLAUDE.md = gotchas + conventions, not an encyclopedia]] — Architecture, key commands, forbidden patterns, and the mistakes it keeps repeating — pruned often.
- [[Tip 2.11 — Put occasional knowledge in Skills — loaded only when the task matches]] — A Skill that auto-loads on its description, rather than cramming everything into CLAUDE.md.
- [[Tip 2.12 — Add the right MCP servers; keep the surface small]] — A few high-value servers (browser, DB, issue tracker) beat many thin REST mirrors — >~20k tokens of definitions already eats working context.
- [[Tip 2.13 — Use external memory for multi-session work — compaction won't carry decisions across sessions]] — Compaction won't carry decisions across sessions — write `STATUS.md` at session end; reload it at the next session's start.

## Related

- [[The Six Tiers]]
- [[The Prompt Triad]]
- [[Vertical Slicing]]
- [[Executable Definition of Done]]
- [[Multi-Model Playbook]]
- [[Agentic Primitives]]
- [[Tier 3 — Verify]]
