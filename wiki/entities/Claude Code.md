# Claude Code

**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

[[Anthropic]]'s terminal-native coding agent, and the guide's running example throughout all tiers.

- A **coding agent**: works inside your *real repo* — your git, tools, tests, stack.
- Makes **targeted diffs** (not full-file rewrites), runs commands, and opens PRs.
- **No capability ceiling**, and **you own the code** — it demands engineering discipline (git, tests, architecture) in return.
- Configured through committed plain-text primitives — Markdown, JSON, a shell script or two — not hidden settings or LLM dark magic.

## Contrasted with one-shot app builders
- **One-shot builders** (Lovable, Bolt, v0, Replit, Base44) generate a full stack from a text box and deploy to a URL, managing infra for you — great for blank-canvas prototypes and MVPs.
- They **stall** on custom logic, odd integrations, or off-template architecture; apps that outgrow them are **rebuilt, not refactored**, with vendor lock-in.
- The dividing line is **prototype vs production** and **code ownership**. This guide is about the second mode — owning and operating the process and the result.
- Pragmatic play: prototype on a one-shot builder to validate, then rebuild on Claude Code once it has traction — or start in Claude Code if it's meant to live in production.

## Related
- [[Anthropic]]
- [[Agentic Primitives]]
- [[Playwright MCP]]
- [[The Eight Tiers]]
