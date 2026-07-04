# Context Rot
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

The mental model under all of [[Context Management]] (Tier 3):

> **context is a finite budget with diminishing returns.** As the window fills, the model's recall degrades — Anthropic names this **context rot**.

## The core idea

- Context is a **budget**, not free space. Spending more tokens is not automatically better.
- As the window fills, recall degrades — even inside a large window.
- So the job "isn't to load everything (even at 1M); it's to find the **smallest set of high-signal tokens** that gets the result."
- "1M is the default; manage by **signal**, not a percentage (rot is still real)." Don't cram everything under a limit and trim obsessively — that's outdated context-babysitting.

## Practices that spend the budget well

Every Tier 3 tip is a way to spend this budget:

- **Load just-in-time** over pre-loading.
- **`/clear` between tasks** so stale context doesn't bleed into the next.
- **Compact deliberately** rather than trusting it to happen.
- **Push heavy exploration to subagents** whose context stays isolated (see [[Orchestration]]).
- Check usage any time with `/context`.

## Watch the hidden costs

- Even tool definitions cost budget: "~20k tokens of MCP definitions already eats your working context. Few powerful gateway tools beat many thin REST mirrors."

## Related
- [[Context Management]]
- [[Orchestration]]
- [[Agentic Primitives]]
