# Tip 4.3 — Let Claude drive `gh` — the collaboration layer is harness too
**Part of:** [[Tier 4 — Enforce]] · tip 3 of 5
**Source:** `guide.md #tip-4-3` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** copy-pasting diffs into the GitHub web UI.
>
> **Prefer:** have Claude use the `gh` CLI to open PRs, read issues, check CI, and answer review comments.

Claude has native git (stage/commit/branch/PR) and can run `gh` — `gh issue view` pulls task context, `gh pr create --fill` opens the PR, `gh pr checks` watches CI. In CI, `claude -p` + `gh` closes the loop from issue → branch → PR → review.

## Related
- [[Tier 4 — Enforce]]
- [[Tip 4.2 — Move repetitive engineering into CI ∕ headless — run it without you in the seat]]
- [[Tip 4.4 — Turn a correction you keep giving into a rule that tells the agent the fix]]
- [[The Harness]]
