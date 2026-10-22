# Tip 4.1 — Replace “remember to run tests” with a hook
**Part of:** [[Tier 4 — Enforce]] · tip 1 of 5
**Source:** `guide.md #tip-4-1` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "run the tests after each change" (a request it can forget).
>
> **Prefer:** a hook that always runs them, and one that won't let it stop on red.

This is where Tier 3 becomes durable: the check you defined there gets wired into the harness (`.claude/settings.json`, committed so the team shares the gate), so it runs every time and can't be skipped or forgotten. A `PostToolUse` hook on `Edit|Write` runs related tests; a `Stop` hook re-runs the suite and forces the agent to keep working with `exit 2`.

## Related
- [[Tier 4 — Enforce]]
- [[Tip 4.2 — Move repetitive engineering into CI ∕ headless — run it without you in the seat]]
- [[Agentic Primitives]]
