# Tip 8.1 — Sandbox the loop; never run autonomous agents on a dev box or prod
**Part of:** [[Tier 8 — Agent Execution Layer]] · tip 1 of 4
**Source:** `guide.md #tip-8-1` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** an unattended agent with write access on your laptop or a shared CI runner.
>
> **Prefer:** an ephemeral sandbox (E2B/Modal/Daytona/Northflank, or Claude Code's web VMs) — a runaway loop burns a throwaway container, not your environment.

Run untrusted agent code and tests in throwaway isolation so a runaway loop burns a cheap container, not prod.

## Related
- [[Tier 8 — Agent Execution Layer]]
- [[Tip 8.2 — Gate the plan, not every keystroke]]
- [[The Review-Agent Pattern]]
