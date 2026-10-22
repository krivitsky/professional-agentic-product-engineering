# Tip 3.4 — Test the UI for real with Playwright MCP — don't eyeball it
**Part of:** [[Tier 3 — Verify]] · tip 4 of 13
**Source:** `guide.md #tip-3-4` (root — canonical, not copied)
**Created:** 2026-07-04
**Updated:** 2026-10-22

> **Instead of:** "make sure the checkout page looks right."
>
> **Prefer:** have the agent drive a live browser, perform the flow, and assert.

[[Playwright MCP]] works off the accessibility tree, not screenshot guessing — the agent performs the flow, asserts, and saves the run as an e2e spec.

## Related
- [[Tier 3 — Verify]]
- [[Tip 3.3 — Use BDD — the behavior-level check]]
- [[Tip 3.5 — Demand evidence, not a claim of success]]
- [[Playwright MCP]]
