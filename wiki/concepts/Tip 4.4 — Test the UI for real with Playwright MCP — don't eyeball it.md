# Tip 4.4 — Test the UI for real with Playwright MCP — don't eyeball it
**Part of:** [[Tier 4 — Loop Until Done]] · tip 4 of 9
**Source:** `guide.md #tip-4-4` (root — canonical, not copied)
**Created:** 2026-07-04

> **Instead of:** "make sure the checkout page looks right."
>
> **Prefer:** have the agent drive a live browser, perform the flow, and assert.

[[Playwright MCP]] works off the accessibility tree, not screenshot guessing — the agent performs the flow, asserts, and saves the run as an e2e spec.

## Related
- [[Tier 4 — Loop Until Done]]
- [[Tip 4.3 — Use BDD — the behavior-level check]]
- [[Tip 4.5 — Demand evidence, not a claim of success]]
- [[Playwright MCP]]
