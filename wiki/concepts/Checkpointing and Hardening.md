# Checkpointing and Hardening
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

Tier 5 of [[The Eight Tiers]]. **Checkpoint in git and harden the harness, so you can always roll back.**

**Reach for this tier when** a long run goes wrong and you've lost good work with nothing to roll back to. With a checkpoint at every green step, a bad run costs minutes to undo, not a rewrite.

## Git as the loop's memory

Git isn't bookkeeping here — it's the loop's memory and undo. And the harness around it (hooks that always run your tests, CI, the `gh` CLI) makes the whole loop deterministic and shareable with the team.

## Hardening the harness

This tier is where Tier 4's check becomes durable. In [[Loop Until Done]] you *defined* the check; here you wire it into the harness so it runs every time and can't be skipped or forgotten. The gate stops depending on the agent remembering.

## The five tips

- **5.1 Commit every working step — checkpoints are what make a loop safe.**
  > ❌ Instead of: one giant commit at the end (or none).
  > ✅ Prefer: commit after each green step; each commit is a state the loop (or you) can revert to.
  - "After each task step that passes tests, commit with a descriptive message." Combined with a `Stop` hook that won't let it stop on red, every checkpoint is a *working* state — it can iterate hard and never lose ground.
  - Start from a clean tree; back up anything it can't regenerate before granting write access.

- **5.2 Let Claude drive `gh` — the collaboration layer is harness too.**
  > ❌ Instead of: copy-pasting diffs into the GitHub web UI.
  > ✅ Prefer: have Claude use the `gh` CLI to open PRs, read issues, check CI, and answer review comments.
  - `gh issue view` pulls task context, `gh pr create --fill` opens the PR, `gh pr checks` watches CI and feeds failures back into the loop. In CI, `claude -p` + `gh` closes the loop from issue → branch → PR → review.

- **5.3 Try risky work in a worktree — a disposable checkpoint you can throw away.**
  > ❌ Instead of: a risky refactor or spike directly on your working branch, hoping you can `git reset` your way out.
  > ✅ Prefer: `git worktree add ../spike-x spike-x` — experiment there; keep it if it works, delete the directory if it doesn't. Your main working copy never sees the mess.
  - Worktrees also isolate parallel agents so they don't clobber each other — that's the Tier 7 use ([[Fleet Ops]]).

- **5.4 Replace "remember to run tests" with a hook.**
  > ❌ Instead of: "run the tests after each change" (a request it can forget).
  > ✅ Prefer: a hook that always runs them, and one that won't let it stop on red.
  - Wired in `.claude/settings.json` (commit it so the team shares the gate): a `PostToolUse` hook on `Edit|Write` runs related tests, and a `Stop` hook runs the suite and forces the agent to keep working with `exit 2`.
  - `exit 2` on a `Stop` hook forces the agent to keep working (guard with `stop_hook_active`; Claude overrides a Stop hook after 8 consecutive blocks). `PreToolUse` `exit 2` blocks a tool outright — protect `.env`, `package-lock.json`, `.git/`; a `PreToolUse` deny fires before the permission check, so it holds even under `--dangerously-skip-permissions` (hooks can tighten, never loosen).
  - Hooks aren't only shell + exit codes: a hook can also be a `prompt` (a quick Haiku yes/no) or an `agent` (a subagent that verifies before allowing stop).

- **5.5 Move repetitive engineering into CI / headless — run it without you in the seat.**
  > ❌ Instead of: doing PR review, issue triage, and release notes by hand each time.
  > ✅ Prefer: run the agent non-interactively in your pipeline, scoped tightly.
  - `claude -p "..." --allowedTools "..."`, or the Claude Code GitHub Action on `pull_request`. Note: as of mid-2026, programmatic use (`claude -p`, Agent SDK, Actions) bills from a separate Agent-SDK pool at API rates — budget for it.

## Related
- [[The Harness]]
- [[Agentic Primitives]]
- [[Loop Until Done]]
- [[The Eight Tiers]]
