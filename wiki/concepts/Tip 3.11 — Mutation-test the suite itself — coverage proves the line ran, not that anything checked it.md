# Tip 3.11 — Mutation-test the suite itself — coverage proves the line ran, not that anything checked it
**Part of:** [[Tier 3 — Verify]] · tip 11 of 13
**Source:** `guide.md #tip-3-11` (root — canonical, not copied)
**Created:** 2026-07-25
**Updated:** 2026-10-22

> **Instead of:** trusting a green suite because coverage is high.
>
> **Prefer:** break the implementation on purpose and confirm a test goes red. Automate it — Stryker (JS/TS), mutmut (Python), cargo-mutants (Rust), PIT (Java) — on the changed files.

The check that catches **tests that don't test anything** — the signature failure of agent-written tests, which call the function, assert nothing meaningful, and light up coverage anyway. A surviving mutant is a line the suite executes but does not defend. Scope it to what the change touched; whole-repo mutation runs are slow enough to get switched off.

Closes the loop on [[Robert C. Martin]]'s gauntlet, quoted in [[From Prompts to Systems]] — mutation testing is one of the constraints he names.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.10 — Gate on the coverage of this change, not the project's average]]
- [[Tip 3.12 — Commit every working step — checkpoints are what make a loop safe]]
- [[Robert C. Martin]]
