# Tier 6 — Supervise
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

Tier 6 of [[The Six Tiers]], in the **Scale** stage, and the top of the climb. **Put agents into production, so they work without you.**

**You stop:** starting and watching runs · **You do instead:** certify the evidence; improve the system · **Climb when:** — (top).

**Reach for this tier when** runs die because your laptop slept, or every run still waits for you to start it — and the team needs agents to pick up tickets and open PRs without anyone babysitting a terminal.

## From Your Box to the Team's System

Once runs go longer than you'll sit and watch, **where they run and who starts them** becomes its own engineering problem. Two steps:

1. **Your box** — a small always-on server, one tmux session per run; you start runs, from your desk or your phone, and secure the server like production.
2. **The execution layer** — a hosted runtime (managed cloud sessions, or sandboxes you run); a ticket or an event starts the run, behind a human gate on the plan and the merge.

## API-Bound, Not Compute-Bound

Claude Code is **API-bound, not compute-bound** — inference runs on Anthropic's servers; your machine just holds the thread. So a box that doesn't sleep keeps the agent moving, and the hardware bar is modest: a 4 GB VPS handles one agent, but budget **16 GB+** for dynamic workflows or many parallel subagents (heavy orchestration OOM-kills small boxes and takes the tmux session with it).

## The Execution Layer — The Same Loop You Already Built

Enterprise agentic loops need a dedicated Agent Execution Layer: loops run **hosted, isolated, and event-triggered**. Everything from [[Tier 3 — Verify]] and [[Tier 4 — Enforce]] is unchanged; the layer only answers three new questions: *where does it run, what triggers it, and how do many agents avoid colliding?* Start fully managed (GitHub `@claude`, Linear agents, Anthropic-managed cloud VMs); self-host only when you need the control.

## The Stack — Four Parts When You Build Your Own

- **Runtime sandbox** — run untrusted agent code + tests in throwaway isolation (E2B, Modal, Daytona / Northflank, or Claude Code's `/sandbox` and web VMs), so a runaway loop burns a cheap container, not prod.
- **Connectivity (MCP)** — let the agent read Slack / Notion / Postgres / Sentry without hardcoded creds (see [[Tier 2 — Plan]]).
- **Orchestration / state** — track which phase each agent is in (LangGraph, Claude Agent SDK, Warp Oz, dynamic workflows).
- **System of record** — the ground truth + state machine (Linear / GitHub issues, whose workflow states *are* the state machine). Make the tracker the agent's memory: the conversation is disposable; the workflow state is durable.

## The Loop — From Ticket to Merged PR

Just [[Tier 3 — Verify]]'s loop, hosted and gated:

1. **Trigger & context.** A human moves a ticket to "Agent Todo"; a webhook fires. The agent reads the ticket (MCP) and pulls only the relevant files — *not* the whole repo.
2. **Plan (spec sub-agent).** A planning subagent drafts a short spec, posts it to the ticket; the loop **pauses for a human "Approve."** Keep this gate.
3. **Isolated execution.** The execution agent spins up a sandbox, clones, and works in its own git worktree/branch — so ten agents on ten tickets never touch each other's files.
4. **Build & test loop.** Writes code, runs the suite in the sandbox; on failure the orchestrator feeds the raw error back; loops until green, **capped at ~3–5 strikes**. (Definition of Done is the exit condition; the cap is the give-up condition.)
5. **PR.** Commits and opens a PR via `gh`, under your identity so `git blame` stays useful.
6. **Review agent.** A separate review agent triggers on the PR, posts findings, and the execution agent fixes them before a human looks.

## The Review-Agent Pattern (Most Teams' First Loop)

PR review is where to start: high value, low risk. The pattern (see [[The Review-Agent Pattern]]):

- **Feed the diff, not the codebase.** Pull only changed lines + surrounding functions; dumping the whole repo destroys the reviewer's context.
- **Load the rulebook.** Inject your `ARCHITECTURE.md` or a `code-review` Skill so it reviews against *your* standards.
- **Prompt adversarially.** "Identify side effects this diff introduces that are **not** covered by the modified tests." Ask for all findings, severity-labeled — never tell it to be conservative.
- **Use a different model than the author.** A cross-lab reviewer catches blind spots a self-review shares.

## Certify the Evidence

At this volume the human reviews the proof, not every line: every run attaches its evidence — tests, e2e, screenshots, diff coverage, mutation score, the review agent's findings — and the human certifies it at the merge gate, then spends the saved time improving the system. This is [[From Prompts to Systems]] at full scale.

## The 8 Tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 6.1 — Host long runs on a box that doesn't sleep; persist with tmux]] — run on a small always-on server and wrap each agent in tmux so the run survives your laptop sleeping.
- [[Tip 6.2 — Drive the fleet from your phone — clear blockers from anywhere]] — SSH in from a mobile client and clear decision points from anywhere.
- [[Tip 6.3 — Secure the agent server like production]] — non-root sudo user, SSH-keys-only, firewall, secrets in env / a secrets manager.
- [[Tip 6.4 — Sandbox the loop; never run autonomous agents on a dev box or prod]] — run the loop in an ephemeral sandbox so a runaway agent burns a throwaway container, not your environment.
- [[Tip 6.5 — Gate the plan, not every keystroke]] — auto-run the loop but pause for human approval at the spec and before merge; gate the irreversible, automate the rest.
- [[Tip 6.6 — Cap the strikes — a stuck agent shouldn't burn tokens forever]] — loop until green with a max-attempts cap, then stop and summarize what's blocking.
- [[Tip 6.7 — Make the tracker the state machine — the agent forgets; the board remembers]] — store workflow state as ticket status/labels so it survives restarts and a human can override by moving the card.
- [[Tip 6.8 — Certify the evidence instead of reading the diff — review the proof, not every line]] — Every run attaches its evidence; you certify it, open the code only where it is thin, and spend the saved time on the system.

## The Reality Check

**Most pilots die before production.** IDC found 88% of AI proof-of-concepts never reach wide deployment; Gartner predicts over 40% of agentic AI projects will be canceled by end of 2027 — costs, unclear value, inadequate risk controls. For a coding agent that means the boring parts: isolation, governance, least-privilege permissions, audit, data residency. Treat the execution layer like any production system, and start with one managed loop (PR review), prove it, then expand.

This is the top of the climb: the agent stops being a chatbot and becomes an **asynchronous worker operating inside your org's system of record.** When the inner two loops run themselves, your attention is freed for the impact loop no agent can close for you — see [[Loops of Agentic Engineering]].

## Related

- [[The Six Tiers]]
- [[The Review-Agent Pattern]]
- [[Loops of Agentic Engineering]]
- [[From Prompts to Systems]]
- [[Tier 5 — Orchestrate]]
