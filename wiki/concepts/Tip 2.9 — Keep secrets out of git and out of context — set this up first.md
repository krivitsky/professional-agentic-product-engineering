# Tip 2.9 — Keep secrets out of git and out of context — set this up first
**Part of:** [[Tier 2 — Plan]] · tip 9 of 13
**Source:** `guide.md #tip-2-9` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** real keys in the repo, or pasted into a prompt.
>
> **Prefer:** `.env` gitignored and referenced by variable, enforced with a hook.

A coding agent reads your whole tree and everything you paste; both leak. Gitignore secrets first, reference them by variable, and enforce it with a `PreToolUse` guard the model can't talk its way past.

## Related
- [[Tier 2 — Plan]]
- [[Tip 2.8 — Have one agent draft the spec and a different one critique it — before any code]]
- [[Tip 2.10 — CLAUDE.md = gotchas + conventions, not an encyclopedia]]
