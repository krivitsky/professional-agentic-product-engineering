# Harness Audit

**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-26

The diagnostic counterpart to [[The Harness]]. If trust comes from the gauntlet the output survives, the obvious next question is whether *your* gauntlet is any good — and the guide's answer is to audit it rather than judge it by eye. The chapter's premise: **"You are the worst-placed person to judge it, because you wrote it — every gap looks intentional from the inside."**

Shipped as a skill, `/pape:harness-audit`, in the repo's `pape` plugin. It reads the harness checked into a repo — instruction files, Skills, agent definitions, hooks, permissions, tests, CI (see [[Agentic Primitives]]) — and rates it against [[The Eight Tiers]].

## Absence is the easy half

The distinction that makes it an audit rather than an inventory: what's *missing* is cheap to spot and usually already known. The valuable findings are what is **present but incoherent, unenforced, or failing open** — where the harness looks complete and isn't:

- Two instruction layers that contradict each other, with nothing reconciling them when one changes.
- A rule written down that nothing checks — so it holds only while the agent feels like it.
- A gate that bites *after* the push, which is a report rather than a gate (see [[Tier 5 — Checkpointing and Hardening]]).
- A verify command that behaves differently in CI than locally, so green means two things.
- Delegation dispatched from several places with no versioned agent definition behind it (see [[Tier 6 — Orchestration]]).

Every finding names the file and line it came from and cites the tip behind it, so a rating always traces to something the reader can open and dispute.

## One next lever, derived from the ladder

All eight tiers get a rating and a one-line note. Then the report walks the rungs from T1 upward and names **the lowest one that doesn't hold yet** — that single rung is the recommendation.

The rule falls out of the ladder itself: each rung rests on the ones below, so a weak lower rung caps everything above it. Hardening CI while nothing tells the agent what "done" means is effort spent on a rung that cannot hold (see [[Executable Definition of Done]]).

> *"T1 and T2 hold, so the next lever is T3. T4 and T5 are weak too, but both rest on T3, so it goes first."*

Where a tier genuinely doesn't apply, the report says what the tier depends on — *"nothing here runs unattended, so there is no fleet to operate"* — instead of scoring it as a gap. **Climb only as high as the work demands** is the guide's own advice, so an audit that manufactured eight problems would argue against the material it comes from.

## Two rungs no file reaches

[[Tier 1 — Professional Prompting]] and [[Tier 2 — Shaping and Slicing]] are invisible in checked-in configuration — they live in how the operator prompts and shapes work, not in the repo. When the next lever lands on either, there is nothing to add and *"write better prompts"* is not a corrective action, so the audit points at the coach or the tutor instead. This is the one place the report recommends a tool rather than a change.

The inverse holds too: the tutor can read an audit report and start teaching at the rung it named. Prompts place T1–T2, the repo places T3–T8.

## Findings are refuted, not just generated

An audit's failure mode is not missing things — it is **confidently reporting something untrue**, which costs an afternoon and the reader's trust. Two agents given the same instructions and budget make the *same* shortcut, so parallel finders cannot catch it; agreement between them is not corroboration.

So the passes are asymmetric. Finders sweep for candidates; then a **separate agent whose only job is to refute them** opens the file behind every quoted line and every printed number. What it cannot stand up is cut or narrowed — and the report states what it cut, because a withdrawn claim changes what the reader should trust. There is no flag that skips that check.

The design came from a real failure: a shipped report quoted a hardcoded path that was actually the fallback in an `env ||` expression, and recommended reading the value from an environment variable — which the code already did.

## What it produces

Two files per run, in `harness-audits/`: a self-contained HTML report for the reader, and a markdown briefing written for an agent to carry on from. The human report runs decisions first, evidence last — scorecard, issue summary, ranked backlog, trend against the previous run, observations, method and limits, then the full findings appendix.

The audit is **read-only except the report**: it never edits a file, runs a build, or touches git, and it stops at the offer. Secrets are reported by shape and location, never reproduced.

## Related
- [[The Harness]]
- [[The Eight Tiers]]
- [[Robert C. Martin]]
- [[Agentic Primitives]]
- [[From Prompts to Systems]]
- [[Executable Definition of Done]]
