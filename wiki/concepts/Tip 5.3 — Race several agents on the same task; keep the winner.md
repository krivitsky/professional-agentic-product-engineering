# Tip 5.3 — Race several agents on the same task; keep the winner
**Part of:** [[Tier 5 — Orchestrate]] · tip 3 of 9
**Source:** `guide.md #tip-5-3` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** betting a high-value task on one agent's single attempt.
>
> **Prefer:** run the same spec in several parallel git worktrees — and vary the model across them (Claude, Codex, Gemini) so their blind spots differ — then diff the results and merge the best. Budget ~2–4× the cost; reserve it for work where being right beats being cheap.

Parallel attempts in separate worktrees, ideally across different models, give you several shots at a high-value task — then you diff and merge the best.

## Related
- [[Tier 5 — Orchestrate]]
- [[Tip 5.2 — Use subagents to isolate context]]
- [[Tip 5.4 — Decompose complex builds into specialist roles — narrow context per role beats one big pass]]
- [[Multi-Model Playbook]]
