# Tip 3.2 — Keep secrets out of git and out of context — set this up first
**Part of:** [[Tier 3 — Context Management]] · tip 2 of 8
**Source:** `guide.md #tip-3-2` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** real keys in the repo, or pasted into a prompt.
>
> **Prefer:** `.env` gitignored and referenced by variable, enforced with a hook.

A coding agent reads your whole tree and everything you paste; both leak. Gitignore secrets first, reference them by variable, and enforce it with a `PreToolUse` guard the model can't talk its way past.

## Related
- [[Tier 3 — Context Management]]
- [[Tip 3.1 — Feed high-signal context, not the whole repo]]
- [[Tip 3.3 — `clear` between tasks; reset after repeated failure]]
