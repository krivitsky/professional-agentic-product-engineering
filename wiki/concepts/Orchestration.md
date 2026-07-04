# Orchestration
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

Tier 6 of [[The Eight Tiers]]. **Run many agents at once, to ship more work in parallel.**

**Reach for this tier when** one agent is too slow or floods its own context, and the build is too big for one pass. The next gain is parallelism — many subagents on independent slices, specialist roles, and a second model catching what the first missed.

## The multi-model toolkit leads off

Using more than one model works at any tier — but you lean on it hardest here (per-subagent models, racing agents across labs, specialist roles), which is why the [[Multi-Model Playbook]] leads off Tier 6. It works for one reason: **different models have different blind spots**, so a second model catches what the first missed. Reach for it when a task is high-stakes, decomposable, or verifiable; skip it when one strong model already clears the bar.

## The subagent primitive, up close

Every orchestration tip leans on subagents. A subagent is a separate Claude instance with its **own context window, tools, and model**; it does work and hands back only a result summary. Required frontmatter fields are `name` and `description`; the body is its system prompt. Create it with `/agents` or drop a `.claude/agents/*.md` file in. Omit `tools` and it inherits everything; whitelist to keep it tight. Invoke it three ways: auto (parent delegates when the task matches the description — that's why the description matters most), explicitly, or `@name`.

**Skill vs subagent vs command:** same shape, but a command/skill loads into your current conversation (accumulates in your main window), while a subagent runs in its own context and returns just a summary. Reach for a skill to *teach the main thread*; reach for a subagent to *offload heavy work and protect the main thread's context*. See [[Agentic Primitives]].

## The seven tips

- **6.1 Let it self-orchestrate big, parallel work — it fans out faster than you can by hand.**
  > ❌ Instead of: manually spawning and merging a dozen subagents.
  > ✅ Prefer: `/effort ultracode` → "audit every endpoint for missing auth, fix it, prove each fix with a test." It fans out parallel subagents and self-verifies; you spot-check the report.

- **6.2 Use subagents to isolate context.**
  > ❌ Instead of: a giant exploration that floods your main thread.
  > ✅ Prefer: "subagent: trace how auth is wired across the repo; return a summary plus the 3 files I should read." (Low effort for batch subagents to control cost.)

- **6.3 Race several agents on the same task; keep the winner.**
  > ❌ Instead of: betting a high-value task on one agent's single attempt.
  > ✅ Prefer: run the same spec in several parallel git worktrees — and vary the model across them (Claude, Codex, Gemini) so their blind spots differ — then diff the results and merge the best.
  - Budget ~2–4× the cost; reserve it for work where being right beats being cheap. Or assign the same issue to several agents in GitHub Agent HQ (Tier 8) and pick the winning PR.

- **6.4 Decompose complex builds into specialist roles — narrow context per role beats one big pass.**
  > ❌ Instead of: one prompt that builds everything in one pass.
  > ✅ Prefer: architect → backend → frontend → tests → security-review, each a subagent with narrow context, reviewing each other.
  - Each role is a `.claude/agents/<role>.md` with a tight tool list — architect read-only, backend gets `+ Write, Edit, Bash`, security-reviewer stays read-only — then chain them in one ask, each returning a summary.

- **6.5 Engineer the long-horizon hand-off — so the next session doesn't guess.**
  > ❌ Instead of: "build the whole app" in one window (it runs out of context mid-feature and the next session guesses).
  > ✅ Prefer: an initializer session that writes a checklist; fresh sessions execute it one item at a time.
  - When compaction starts losing detail, `/clear` and let the next session rebuild from `PROGRESS.md`. Keep the authoritative task ledger as **JSON, not prose** — models reliably "tidy" or overwrite Markdown but treat a `features.json` of `{name, passes: false}` as real data. Prose hand-off in the doc; the status registry in JSON.

- **6.6 Steer long runs mid-flight instead of restarting them.**
  > ❌ Instead of: killing a 40-minute run to change a permission, budget, or direction.
  > ✅ Prefer: inject a steering message while it runs.
  - Interactively, just type the correction mid-run. In an automated harness on the Agent SDK, push a `system` entry into the live `messages` array — current models accept mid-conversation system messages, so you change course without a restart or a cache rebuild.

- **6.7 Engineer the environment, not the wording.**
  > ❌ Instead of: endlessly tuning the perfect prompt.
  > ✅ Prefer: invest in CLAUDE.md, Skills, MCP, git discipline, tests as the check, hooks, and CI.
  - Every methodology converges on **research → plan → execute → review → ship**, human-gated. Build the system that runs that loop. That system, not the prompt, is the product of professional agentic engineering.

## Related
- [[Multi-Model Playbook]]
- [[Agentic Primitives]]
- [[Fleet Ops]]
- [[The Eight Tiers]]
