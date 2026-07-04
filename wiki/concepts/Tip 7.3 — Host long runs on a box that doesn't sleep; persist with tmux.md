# Tip 7.3 — Host long runs on a box that doesn't sleep; persist with tmux
**Part of:** [[Tier 7 — Fleet Ops]] · tip 3 of 5
**Source:** `guide.md #tip-7-3` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** a run that dies the moment your laptop sleeps or wifi drops.
>
> **Prefer:** run on a small always-on server and wrap each agent in tmux.

Because Claude Code is *API-bound, not compute-bound*, a box that doesn't sleep keeps the agent moving: start a named tmux session, run the agent inside, detach with `Ctrl+b` then `d` so it keeps running on the server, and reattach later from any device — tmux survives disconnects, though not crashes or reboots.

## Related
- [[Tier 7 — Fleet Ops]]
- [[Tip 7.2 — Isolate parallel agents with worktrees + one session each]]
- [[Tip 7.4 — Drive the fleet from your phone — clear blockers from anywhere]]
