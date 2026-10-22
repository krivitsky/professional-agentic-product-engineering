# Tier 5 — Orchestrate
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

Tier 5 of [[The Six Tiers]], in the **Scale** stage. **Run many agents at once, to ship more work in parallel.**

**You stop:** running agents one by one · **You do instead:** split and coordinate the work · **Climb when:** runs die when you leave; you start every run yourself.

**Reach for this tier when** one agent is too slow or floods its own context, and the build is too big for one pass. The next gain is parallelism — many subagents on independent slices, specialist roles, and a second model catching what the first missed.

## The multi-model toolkit leads off

Using more than one model works at any tier — but you lean on it hardest here (per-subagent models, racing agents across labs, specialist roles), which is why the [[Multi-Model Playbook]] leads off Tier 5. It works for one reason: **different models have different blind spots**, so a second model catches what the first missed. Reach for it when a task is high-stakes, decomposable, or verifiable; skip it when one strong model already clears the bar.

## The subagent primitive, up close

Every orchestration tip leans on subagents. A subagent is a separate Claude instance with its **own context window, tools, and model**; it does work and hands back only a result summary. Required frontmatter fields are `name` and `description`; the body is its system prompt. Create it with `/agents` or drop a `.claude/agents/*.md` file in. Omit `tools` and it inherits everything; whitelist to keep it tight. Invoke it three ways: auto (parent delegates when the task matches the description — that's why the description matters most), explicitly, or `@name`.

**Skill vs subagent vs command:** same shape, but a command/skill loads into your current conversation (accumulates in your main window), while a subagent runs in its own context and returns just a summary. Reach for a skill to *teach the main thread*; reach for a subagent to *offload heavy work and protect the main thread's context*. See [[Agentic Primitives]].

## Running agents side by side

Once several agents run at once, you need to see which one is blocked and keep them from clobbering each other: an agent-aware terminal, and one git worktree + branch + session per agent.

## The 9 tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 5.1 — Let it self-orchestrate big, parallel work — it fans out faster than you can by hand]] — hand off the whole parallel job; it fans out subagents and self-verifies faster than you can by hand.
- [[Tip 5.2 — Use subagents to isolate context]] — run heavy exploration in a subagent that returns only a summary, keeping your main thread clean.
- [[Tip 5.3 — Race several agents on the same task; keep the winner]] — run the same spec across parallel worktrees and models, then diff and merge the best.
- [[Tip 5.4 — Decompose complex builds into specialist roles — narrow context per role beats one big pass]] — split a big build into specialist subagents with narrow context that review each other.
- [[Tip 5.5 — Engineer the long-horizon hand-off — so the next session doesn't guess]] — an initializer writes the plan and JSON ledger; fresh sessions execute one item at a time.
- [[Tip 5.6 — Steer long runs mid-flight instead of restarting them]] — inject a steering message into a live run instead of killing and restarting it.
- [[Tip 5.7 — Engineer the environment, not the wording]] — invest in the system around the model (CLAUDE.md, skills, MCP, git, tests, hooks, CI), not prompt polish.
- [[Tip 5.8 — Manage parallel agents in an agent-aware terminal — so you see which one is blocked]] — run agents in a terminal built for them (Warp): panes per agent, a flag when one needs input, a built-in diff/review panel.
- [[Tip 5.9 — Isolate parallel agents with worktrees + one session each]] — one git worktree + branch + session per agent so parallel agents don't clobber each other.

## Related

- [[The Six Tiers]]
- [[Multi-Model Playbook]]
- [[Agentic Primitives]]
- [[Context Rot]]
- [[Tier 6 — Supervise]]
