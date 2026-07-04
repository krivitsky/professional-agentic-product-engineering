# Tip 5.4 — Replace "remember to run tests" with a hook
**Part of:** [[Tier 5 — Checkpointing and Hardening]] · tip 4 of 5
**Source:** `guide.md #tip-5-4` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "run the tests after each change" (a request it can forget).
>
> **Prefer:** a hook that always runs them, and one that won't let it stop on red.

This is where Tier 4 becomes durable: the check you defined there gets wired into the harness (`.claude/settings.json`, committed so the team shares the gate), so it runs every time and can't be skipped or forgotten. A `PostToolUse` hook on `Edit|Write` runs related tests; a `Stop` hook re-runs the suite and forces the agent to keep working with `exit 2`.

## Related
- [[Tier 5 — Checkpointing and Hardening]]
- [[Tip 5.3 — Try risky work in a worktree — a disposable checkpoint you can throw away]]
- [[Tip 5.5 — Move repetitive engineering into CI ∕ headless — run it without you in the seat]]
- [[Agentic Primitives]]
