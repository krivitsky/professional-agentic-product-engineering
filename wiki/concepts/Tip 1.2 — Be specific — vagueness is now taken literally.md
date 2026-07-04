# Tip 1.2 — Be specific — vagueness is now taken literally
**Part of:** [[Tier 1 — Professional Prompting]] · tip 2 of 14
**Source:** `guide.md #tip-1-2` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "Clean up the auth code."
>
> **Prefer:** "Extract the token-refresh logic in @src/auth/session.ts into the existing retry helper."

Frontier models fill ambiguity with a literal reading, not your intent. Name the exact function, file, and change so there's nothing to guess.

## Related
- [[Tier 1 — Professional Prompting]]
- [[Tip 1.1 — Hand over the outcome, not a file list]]
- [[Tip 1.3 — Say what to do, not what to avoid]]
