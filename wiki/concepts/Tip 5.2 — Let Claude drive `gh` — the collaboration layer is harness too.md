# Tip 5.2 — Let Claude drive `gh` — the collaboration layer is harness too
**Part of:** [[Tier 5 — Checkpointing and Hardening]] · tip 2 of 5
**Source:** `guide.md #tip-5-2` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** copy-pasting diffs into the GitHub web UI.
>
> **Prefer:** have Claude use the `gh` CLI to open PRs, read issues, check CI, and answer review comments.

Claude has native git (stage/commit/branch/PR) and can run `gh` — `gh issue view` pulls task context, `gh pr create --fill` opens the PR, `gh pr checks` watches CI. In CI, `claude -p` + `gh` closes the loop from issue → branch → PR → review.

## Related
- [[Tier 5 — Checkpointing and Hardening]]
- [[Tip 5.1 — Commit every working step — checkpoints are what make a loop safe]]
- [[Tip 5.3 — Try risky work in a worktree — a disposable checkpoint you can throw away]]
- [[The Harness]]
