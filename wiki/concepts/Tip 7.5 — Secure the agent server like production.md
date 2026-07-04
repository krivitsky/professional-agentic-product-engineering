# Tip 7.5 — Secure the agent server like production
**Part of:** [[Tier 7 — Fleet Ops]] · tip 5 of 5
**Source:** `guide.md #tip-7-5` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** root login and API keys in a committed file on an internet-facing box.
>
> **Prefer:** non-root sudo user, SSH-keys-only, firewall, secrets in env / a secrets manager.

Disable password and root SSH login, UFW-allow only SSH, and keep `ANTHROPIC_API_KEY` in the environment; if you run unattended with `--dangerously-skip-permissions`, put it behind a `PreToolUse` guard hook that blocks destructive commands — the layer the model can't talk its way past.

## Related
- [[Tier 7 — Fleet Ops]]
- [[Tip 7.4 — Drive the fleet from your phone — clear blockers from anywhere]]
- [[Tier 8 — Agent Execution Layer]]
