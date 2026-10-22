# Tip 4.4 — Turn a correction you keep giving into a rule that tells the agent the fix
**Part of:** [[Tier 4 — Enforce]] · tip 4 of 5
**Source:** `guide.md #tip-4-4` (root — canonical, not copied)
**Created:** 2026-10-22

> **Instead of:** typing "use the logger, not `console.log`" into the chat for the third time this week.
>
> **Prefer:** a lint rule or a hook that blocks the mistake and says how to fix it: "No `console.log` in `src/` — use `logger.debug()` from `@/lib/logger`."

The failure message is the prompt: when the check fails, the agent reads why and makes the fix on its own, where a bare "lint failed" sends it guessing. A linter rule with a custom message is the cheapest home; a `PreToolUse` hook that exits 2 covers what no linter sees, and its stderr is the correction.

## Related
- [[Tier 4 — Enforce]]
- [[Tip 4.3 — Let Claude drive `gh` — the collaboration layer is harness too]]
- [[Tip 4.5 — Put approvals in rules, not prompts — a prompt you always approve has stopped being a check]]
- [[Agentic Primitives]]
