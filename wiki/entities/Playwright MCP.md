# Playwright MCP

**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

An MCP server that lets the agent drive a **live browser** to test the UI for real — perform the flow and assert — instead of eyeballing it (Tip 4.4).

- Instead of "make sure the checkout page looks right," have the agent open the app, run the flow, verify concrete outcomes, and save the run as an e2e spec.
- Works off the **accessibility tree** (~200–400 tokens/snapshot), not screenshot guessing.

## Division of labor
- **Claude in Chrome** — interactive dev.
- **Playwright MCP** — the suite / CI.
- **Chrome DevTools MCP** — performance.

## Related
- [[Tier 4 — Loop Until Done]]
- [[Agentic Primitives]]
- [[Claude Code]]
