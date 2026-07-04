# Tier 3 — Context Management
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

**Tier 3 — Give the agent the right context and tools, so it stops guessing.**

**Reach for this tier when** you re-explain the same conventions every session, or the agent can't see your DB, browser, or docs. Engineer that context once — durable project memory plus the right tools — and it stops re-asking and guessing.

## The context budget

The mental model under this whole tier: **context is a finite budget with diminishing returns.** As the window fills, the model's recall degrades — Anthropic names this **[[Context Rot]]**. So the job isn't to load everything (even at 1M); it's to find the **smallest set of high-signal tokens** that gets the result.

Every tip spends that budget: load just-in-time over pre-loading, `/clear` between tasks, compact deliberately, and push heavy exploration to subagents whose context stays isolated (Tier 6). Check usage any time with `/context`.

## The 8 tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 3.1 — Feed high-signal context, not the whole repo]] — Just the affected modules + relevant docs, loaded just-in-time.
- [[Tip 3.2 — Keep secrets out of git and out of context — set this up first]] — `.env` gitignored and referenced by variable, enforced with a `PreToolUse` hook.
- [[Tip 3.3 — `clear` between tasks; reset after repeated failure]] — After ~2 failed fixes, `/clear` and rewrite the opening prompt.
- [[Tip 3.4 — Steer compaction, don't run it blind]] — Tell `/compact` what to keep (decisions, failing tests) and what to drop (exploration).
- [[Tip 3.5 — CLAUDE.md = gotchas + conventions, not an encyclopedia]] — Architecture, key commands, forbidden patterns, and the mistakes it keeps repeating — pruned often.
- [[Tip 3.6 — Put occasional knowledge in Skills — loaded only when the task matches]] — A Skill that auto-loads on its description, rather than cramming everything into CLAUDE.md.
- [[Tip 3.7 — Add the right MCP servers; keep the surface small]] — A few high-value servers (browser, DB, issue tracker) beat many thin REST mirrors — >~20k tokens of definitions already eats working context.
- [[Tip 3.8 — Use external memory for multi-session work — compaction won't carry decisions across sessions]] — Compaction won't carry decisions across sessions — write `STATUS.md` at session end; reload it at the next session's start.

## Key Instead/Prefer pairs

**3.1 Feed high-signal context, not the whole repo.**
> ❌ Instead: "Here's the entire codebase." (even at 1M tokens)
> ✅ Prefer: just the affected modules + relevant docs, loaded just-in-time.

**3.5 CLAUDE.md = gotchas + conventions, not an encyclopedia.**
> ❌ Instead: a 500-line style manual.
> ✅ Prefer: architecture, key commands, forbidden patterns, and the mistakes it keeps repeating — pruned often.

Skills and slash commands are the same idea (commands are now skills under the hood); MCP servers connect real tools like Playwright directly — see [[Agentic Primitives]].

## Related

- [[Context Rot]]
- [[Agentic Primitives]]
- [[The Eight Tiers]]
- [[Tier 6 — Orchestration]]
