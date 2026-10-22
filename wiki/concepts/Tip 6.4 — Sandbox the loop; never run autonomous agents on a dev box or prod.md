# Tip 6.4 — Sandbox the loop; never run autonomous agents on a dev box or prod
**Part of:** [[Tier 6 — Supervise]] · tip 4 of 8
**Source:** `guide.md #tip-6-4` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** an unattended agent with write access on your laptop or a shared CI runner.
>
> **Prefer:** an ephemeral sandbox (E2B/Modal/Daytona/Northflank, or Claude Code's web VMs) — a runaway loop burns a throwaway container, not your environment.

Run untrusted agent code and tests in throwaway isolation so a runaway loop burns a cheap container, not prod.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.3 — Secure the agent server like production]]
- [[Tip 6.5 — Gate the plan, not every keystroke]]
- [[The Review-Agent Pattern]]
