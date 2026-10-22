# Tip 4.5 — Put approvals in rules, not prompts — a prompt you always approve has stopped being a check
**Part of:** [[Tier 4 — Enforce]] · tip 5 of 5
**Source:** `guide.md #tip-4-5` (root — canonical, not copied)
**Created:** 2026-10-22

> **Instead of:** clicking "approve" on every `npm test`, `git diff`, and file edit, one prompt at a time.
>
> **Prefer:** write the decisions you keep making into `.claude/settings.json` — `allow` the safe commands, `deny` the dangerous ones — so the prompts that still reach you are the ones worth reading.

Anthropic's telemetry showed Claude Code users approving roughly 93% of permission prompts, and paying less attention the more they saw ([How we contain Claude across products](https://www.anthropic.com/research/how-we-contain-claude)). An approval given on reflex protects nothing; a committed rule holds on every run. Deny wins over allow, and a `PreToolUse` hook backs the deny list.

## Related
- [[Tier 4 — Enforce]]
- [[Tip 4.4 — Turn a correction you keep giving into a rule that tells the agent the fix]]
- [[Agentic Primitives]]
