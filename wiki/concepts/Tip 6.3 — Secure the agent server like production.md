# Tip 6.3 — Secure the agent server like production
**Part of:** [[Tier 6 — Supervise]] · tip 3 of 8
**Source:** `guide.md #tip-6-3` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** root login and API keys in a committed file on an internet-facing box.
>
> **Prefer:** non-root sudo user, SSH-keys-only, firewall, secrets in env / a secrets manager.

Disable password and root SSH login, UFW-allow only SSH, and keep `ANTHROPIC_API_KEY` in the environment; if you run unattended with `--dangerously-skip-permissions`, put it behind a `PreToolUse` guard hook that blocks destructive commands — the layer the model can't talk its way past.

## Related
- [[Tier 6 — Supervise]]
- [[Tip 6.2 — Drive the fleet from your phone — clear blockers from anywhere]]
- [[Tip 6.4 — Sandbox the loop; never run autonomous agents on a dev box or prod]]
- [[Tier 5 — Orchestrate]]
