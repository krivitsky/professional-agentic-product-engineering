# Agentic Primitives
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

The building blocks of agentic engineering. They're not hidden settings or LLM dark magic — they live as **plain-text files** (Markdown, JSON, a shell script or two). Study them, version them, share them: every teammate and every CI run inherits the same setup, not a config trapped on one laptop.

## The primitives — what / where / how to create

- **CLAUDE.md** — always-loaded project memory (conventions, gotchas). Lives at repo root + subdirs. Create it by writing the file (or `/init`).
- **Slash command** — a reusable prompt you trigger by hand with `/name`. Lives in `.claude/commands/name.md`. Create it by writing the file.
- **Skill** — knowledge/workflow the model **auto-loads when the task matches its description**. Lives in `.claude/skills/name/SKILL.md` (a *folder*). Create it by writing SKILL.md; add scripts/assets.
- **Subagent** — a separate Claude instance with its **own context window**, tools, and model; returns only a summary. Lives in `.claude/agents/name.md`. Create it with `/agents` (recommended) or write the file.
- **Hook** — a deterministic shell script on a lifecycle event. Lives in `.claude/settings.json` under `hooks`. See [[Checkpointing and Hardening]].
- **MCP server** — a connector giving Claude external tools (browser, DB, tracker). Lives in `.mcp.json` / `claude mcp add`. See [[Context Management]].
- **Permissions** — allow/deny rules + modes (default / auto / plan / bypass) for what runs without asking. Lives in `.claude/settings.json`. Create with `/permissions` or settings.
- **Plugin** — one installable unit bundling skills + hooks + subagents + MCP — how teams distribute all of the above. Lives in a marketplace / git repo. Browse & install with `/plugin`.

## The central config

- Most primitives are files you commit. The central config is **`.claude/settings.json`** (precedence: managed › CLI args › local › project › user) — where `permissions`, `hooks`, `mcpServers`, `model`, and inline `agents` can all be declared.
- A **plugin** is just a pre-packaged set of these files, so a teammate runs `/plugin install` on day one and inherits your whole setup.

## Subagent up close

- A subagent has its **own** context window, tools, and model; it does work and hands back only a result.
- Required frontmatter fields: `name` and `description`; the body is its system prompt.
- Omit `tools` and it inherits everything; whitelist to keep it tight.
- Invoke it three ways: **auto** (the parent delegates when the task matches the description — that's why the description matters most), **explicitly** ("use the security-reviewer subagent on the auth diff"), or **`@security-reviewer`**.

## Skill vs subagent vs command — the distinction that matters

- Same Markdown-plus-frontmatter shape; the difference is *where the work happens*.
- A **command/skill loads into your current conversation** — its instructions join the active context and every step accumulates in your main window.
- A **subagent runs in its own context window** and returns just a summary.
- So: reach for a **skill** to *teach the main thread* a workflow; reach for a **subagent** to *offload heavy work and protect the main thread's context*. (You can even preload skills into a subagent with a `skills:` frontmatter field.)

## Related
- [[The Harness]]
- [[Context Management]]
- [[Checkpointing and Hardening]]
- [[Orchestration]]
