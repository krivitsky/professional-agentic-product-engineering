# Tier 7 — Fleet Ops
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

Tier 7 of [[The Eight Tiers]]. **Operate your agents as a fleet, so long runs don't die on you.**

**Reach for this tier when** runs die because your laptop slept, parallel agents collide, or you want to drive them from your phone. Get this right and a run survives your laptop closing and keeps going while you're away.

Once you're running more than one agent, or runs longer than you'll sit and watch, **where and how you run them** becomes its own engineering problem. This is the operations layer of agentic work, one step up from [[Tier 6 — Orchestration]].

## API-bound, not compute-bound

Claude Code is **API-bound, not compute-bound** — inference runs on Anthropic's servers; your machine just holds the thread. So a box that doesn't sleep keeps the agent moving, and the hardware bar is modest: a 4 GB VPS handles one agent, but budget **16 GB+** for dynamic workflows or many parallel subagents (heavy orchestration OOM-kills small boxes and takes the tmux session with it).

## The five tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 7.1 — Manage parallel agents in an agent-aware terminal — so you see which one is blocked]] — run agents in a terminal built for them (Warp): panes per agent, a flag when one needs input, a built-in diff/review panel.
- [[Tip 7.2 — Isolate parallel agents with worktrees + one session each]] — one git worktree + branch + session per agent so parallel agents don't clobber each other.
- [[Tip 7.3 — Host long runs on a box that doesn't sleep; persist with tmux]] — run on a small always-on server and wrap each agent in tmux so the run survives your laptop sleeping.
- [[Tip 7.4 — Drive the fleet from your phone — clear blockers from anywhere]] — SSH in from a mobile client and clear decision points from anywhere.
- [[Tip 7.5 — Secure the agent server like production]] — non-root sudo user, SSH-keys-only, firewall, secrets in env / a secrets manager.

The managed version of all this is the next level up ([[Tier 8 — Agent Execution Layer]]): Warp's Oz and Claude Code's dynamic workflows run agents in the cloud on schedules/triggers with central tracking — the same fleet ideas, hosted.

## Related
- [[Tier 6 — Orchestration]]
- [[Tier 8 — Agent Execution Layer]]
- [[The Eight Tiers]]
