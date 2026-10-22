# Tip 6.1 — Host long runs on a box that doesn't sleep; persist with tmux
**Part of:** [[Tier 6 — Supervise]] · tip 1 of 8
**Source:** `guide.md #tip-6-1` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** a run that dies the moment your laptop sleeps or wifi drops.
>
> **Prefer:** run on a small always-on server and wrap each agent in tmux.

Because Claude Code is *API-bound, not compute-bound*, a box that doesn't sleep keeps the agent moving: start a named tmux session, run the agent inside, detach with `Ctrl+b` then `d` so it keeps running on the server, and reattach later from any device — tmux survives disconnects, though not crashes or reboots.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.2 — Drive the fleet from your phone — clear blockers from anywhere]]
- [[Tier 5 — Orchestrate]]
