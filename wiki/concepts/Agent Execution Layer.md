# Agent Execution Layer
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

Tier 8 of [[The Eight Tiers]] — the top of the arc. **Put agents into production, so they work without you.**

**Reach for this tier when** the team needs it — agents must pick up tickets and open PRs without anyone babysitting a terminal.

While a local loop is perfect for individual spec-driven development, enterprise agentic loops require a dedicated Agent Execution Layer: the layer beyond your own server ([[Fleet Ops]]), where loops run **hosted, isolated, and event-triggered**.

**Don't be scared — it's the same loop you already built.** Everything from Tier 4 (act → test → fix against a Definition of Done) and Tier 5 (commit, `gh`, CI) is unchanged. The execution layer only answers three new questions: *where does it run, what triggers it, and how do many agents avoid colliding?* You adopt it gradually — start fully managed (GitHub `@claude`, Linear agents, Anthropic-managed cloud VMs), self-host only when you need the control.

## The stack — four parts when you build your own

- **Runtime sandbox** — run untrusted agent code + tests in throwaway isolation (E2B, Modal, Daytona / Northflank, or Claude Code's `/sandbox` and web VMs), so a runaway loop burns a cheap container, not prod.
- **Connectivity (MCP)** — let the agent read Slack / Notion / Postgres / Sentry without hardcoded creds (see [[Context Management]]).
- **Orchestration / state** — track which phase each agent is in (LangGraph, Claude Agent SDK, Warp Oz, dynamic workflows).
- **System of record** — the ground truth + state machine (Linear / GitHub issues, whose workflow states *are* the state machine). Make the tracker the agent's memory: the conversation is disposable; the workflow state is durable.

## The loop — from ticket to merged PR

Just [[Loop Until Done]]'s loop, hosted and gated:

1. **Trigger & context.** A human moves a ticket to "Agent Todo"; a webhook fires. The agent reads the ticket (MCP) and pulls only the relevant files — *not* the whole repo.
2. **Plan (spec sub-agent).** A planning subagent drafts a short spec, posts it to the ticket; the loop **pauses for a human "Approve."** Keep this gate.
3. **Isolated execution.** The execution agent spins up a sandbox, clones, and works in its own git worktree/branch — so ten agents on ten tickets never touch each other's files.
4. **Build & test loop.** Writes code, runs the suite in the sandbox; on failure the orchestrator feeds the raw error back; loops until green, **capped at ~3–5 strikes**. (Definition of Done is the exit condition; the cap is the give-up condition.)
5. **PR.** Commits and opens a PR via `gh`, under your identity so `git blame` stays useful.
6. **Review agent.** A separate review agent triggers on the PR, posts findings, and the execution agent fixes them before a human looks.

## The review-agent pattern (most teams' first loop)

PR review is where to start: high value, low risk. The pattern (see [[The Review-Agent Pattern]]):

- **Feed the diff, not the codebase.** Pull only changed lines + surrounding functions; dumping the whole repo destroys the reviewer's context.
- **Load the rulebook.** Inject your `ARCHITECTURE.md` or a `code-review` Skill so it reviews against *your* standards.
- **Prompt adversarially.** "Identify side effects this diff introduces that are **not** covered by the modified tests." Ask for all findings, severity-labeled — never tell it to be conservative.
- **Use a different model than the author.** A cross-lab reviewer catches blind spots a self-review shares.

## The four tips

- **8.1 Sandbox the loop; never run autonomous agents on a dev box or prod.**
  > ❌ Instead of: an unattended agent with write access on your laptop or a shared CI runner.
  > ✅ Prefer: an ephemeral sandbox (E2B/Modal/Daytona/Northflank, or Claude Code's web VMs) — a runaway loop burns a throwaway container, not your environment.

- **8.2 Gate the plan, not every keystroke.**
  > ❌ Instead of: full autopilot from ticket to merge, or approving every edit.
  > ✅ Prefer: auto-run the loop but pause for human approval at the spec and before merge. Gate the irreversible; automate the rest.

- **8.3 Cap the strikes — a stuck agent shouldn't burn tokens forever.**
  > ❌ Instead of: "loop until the tests pass," unbounded.
  > ✅ Prefer: "loop until green, max 5 attempts, then stop and summarize what's blocking." An exit condition needs a give-up condition too.

- **8.4 Make the tracker the state machine — the agent forgets; the board remembers.**
  > ❌ Instead of: holding workflow state in the agent's conversation (it gets archived/compacted away).
  > ✅ Prefer: store state as ticket status/labels (Todo → Planning → Approved → In Review). It survives restarts, and a human can override by moving the card.

## The honest part

**Most pilots die before production.** IDC found 88% of AI proof-of-concepts never reach wide deployment; Gartner predicts over 40% of agentic AI projects will be canceled by end of 2027 — costs, unclear value, inadequate risk controls. For a coding agent that means the boring parts: isolation, governance, least-privilege permissions, audit, data residency. Treat the execution layer like any production system, and start with one managed loop (PR review), prove it, then expand.

This is the top of the climb: the agent stops being a chatbot and becomes an **asynchronous worker operating inside your org's system of record.** When the inner two loops run themselves, your attention is freed for the impact loop no agent can close for you — see [[Loops of Agentic Engineering]].

## Related
- [[The Review-Agent Pattern]]
- [[Fleet Ops]]
- [[Loops of Agentic Engineering]]
- [[The Eight Tiers]]
