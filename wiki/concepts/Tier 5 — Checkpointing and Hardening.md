# Tier 5 — Checkpointing and Hardening
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

Tier 5 of [[The Eight Tiers]]. **Checkpoint in git and harden the harness, so you can always roll back.**

**Reach for this tier when** a long run goes wrong and you've lost good work with nothing to roll back to. With a checkpoint at every green step, a bad run costs minutes to undo, not a rewrite.

These are the constraints of [[The Prompt Triad]], hardened — from a line in the prompt into checkpoints, CI, and rollback the harness enforces for you.

## Git as the loop's memory

Git isn't bookkeeping here — it's the loop's memory and undo. And the harness around it (hooks that always run your tests, CI, the `gh` CLI) makes the whole loop deterministic and shareable with the team.

## Hardening the harness

This tier is where Tier 4's check becomes durable. In [[Tier 4 — Loop Until Done]] you *defined* the check; here you wire it into the harness so it runs every time and can't be skipped or forgotten. The gate stops depending on the agent remembering.

## The five tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 5.1 — Commit every working step — checkpoints are what make a loop safe]] — commit after each green step so every checkpoint is a working state the loop can revert to.
- [[Tip 5.2 — Let Claude drive `gh` — the collaboration layer is harness too]] — have Claude use the `gh` CLI to open PRs, read issues, check CI, and answer review comments.
- [[Tip 5.3 — Try risky work in a worktree — a disposable checkpoint you can throw away]] — spike in `git worktree add ../spike-x`; keep it if it works, delete the directory if it doesn't.
- [[Tip 5.4 — Replace “remember to run tests” with a hook]] — wire the check into `.claude/settings.json` so it always runs and won't let the agent stop on red.
- [[Tip 5.5 — Move repetitive engineering into CI ∕ headless — run it without you in the seat]] — run the agent non-interactively in your pipeline, scoped tightly with `claude -p` or the GitHub Action.

## Related
- [[The Prompt Triad]]
- [[The Harness]]
- [[Agentic Primitives]]
- [[Tier 4 — Loop Until Done]]
- [[The Eight Tiers]]
