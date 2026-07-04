# Tip 7.4 — Drive the fleet from your phone — clear blockers from anywhere
**Part of:** [[Tier 7 — Fleet Ops]] · tip 4 of 5
**Source:** `guide.md #tip-7-4` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** being chained to a desk to answer one permission prompt.
>
> **Prefer:** SSH in from a mobile client and clear decision points from anywhere.

Tailscale for a private network, Termius/Blink as the SSH client, and `tmux attach` to look in and unblock a run; for unattended runs give an explicit stopping condition so it doesn't loop, and consider a notification bridge.

## Related
- [[Tier 7 — Fleet Ops]]
- [[Tip 7.3 — Host long runs on a box that doesn't sleep; persist with tmux]]
- [[Tip 7.5 — Secure the agent server like production]]
