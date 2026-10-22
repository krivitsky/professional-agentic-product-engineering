# Tip 4.2 — Move repetitive engineering into CI ∕ headless — run it without you in the seat
**Part of:** [[Tier 4 — Enforce]] · tip 2 of 5
**Source:** `guide.md #tip-4-2` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** doing PR review, issue triage, and release notes by hand each time.
>
> **Prefer:** run the agent non-interactively in your pipeline, scoped tightly.

Use `claude -p "..." --allowedTools "..."`, or the Claude Code GitHub Action on `pull_request`. Note: as of mid-2026, programmatic use (`claude -p`, Agent SDK, Actions) bills from a separate Agent-SDK pool at API rates — budget for it.

## Related
- [[Tier 4 — Enforce]]
- [[Tip 4.1 — Replace “remember to run tests” with a hook]]
- [[Tip 4.3 — Let Claude drive `gh` — the collaboration layer is harness too]]
- [[The Harness]]
