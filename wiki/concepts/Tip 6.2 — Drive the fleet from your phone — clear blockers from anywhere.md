# Tip 6.2 — Drive the fleet from your phone — clear blockers from anywhere
**Part of:** [[Tier 6 — Supervise]] · tip 2 of 8
**Source:** `guide.md #tip-6-2` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** being chained to a desk to answer one permission prompt.
>
> **Prefer:** SSH in from a mobile client and clear decision points from anywhere.

Tailscale for a private network, Termius/Blink as the SSH client, and `tmux attach` to look in and unblock a run; for unattended runs give an explicit stopping condition so it doesn't loop, and consider a notification bridge.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.1 — Host long runs on a box that doesn't sleep; persist with tmux]]
- [[Tip 6.3 — Secure the agent server like production]]
- [[Tier 5 — Orchestrate]]
