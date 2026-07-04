# Tip 2.8 — Have one agent draft the spec and a different one critique it — before any code
**Part of:** [[Tier 2 — Shaping and Slicing]] · tip 8 of 8
**Source:** `guide.md #tip-2-8` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** one model writing SPEC.md and you trusting it.
>
> **Prefer:** let one agent draft the spec, then hand it to a *different* model to attack: "You're the reviewer. Find gaps, wrong assumptions, missing edge cases, and unstated requirements in this spec. List them; don't rewrite." Feed the findings back to the author to revise. One or two rounds and the spec is far harder than a single model produces.

The critic's *different* blind spots are the point — a second model attacking the spec before any code catches gaps the author can't see.

## Related
- [[Tier 2 — Shaping and Slicing]]
- [[Tip 2.7 — Plan with the smart model, build with the cheap one]]
- [[Multi-Model Playbook]]
