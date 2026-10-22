# Tip 3.10 — Gate on the coverage of this change, not the project's average
**Part of:** [[Tier 3 — Verify]] · tip 10 of 13
**Source:** `guide.md #tip-3-10` (root — canonical, not copied)
**Created:** 2026-07-25
**Updated:** 2026-10-22

> **Instead of:** "keep coverage above 80%." (a big enough codebase absorbs an untested change without moving the number)
>
> **Prefer:** "every line you changed must be covered — `--changed-since=HEAD~1`, and it fails the build if not."

Global coverage is the wrong dial in the agentic era: an agent adding 300 lines to a 50,000-line repo can leave them entirely untested and still raise the percentage. Diff coverage asks the only question that matters at merge time — is the code you just wrote exercised?

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.9 — Iterate UI visually when there's no spec to assert]]
- [[Tip 3.11 — Mutation-test the suite itself — coverage proves the line ran, not that anything checked it]]
