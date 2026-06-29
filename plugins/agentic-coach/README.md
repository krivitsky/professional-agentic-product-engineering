# agentic-coach

An **ambient coach** for operating a coding agent. It catches teachable moments while you work and surfaces the single most relevant tip from the [Professional Agentic Product Engineering guide](https://github.com/krivitsky/professional-agentic-product-engineering) — one nudge at a time, then gets out of the way.

This is the *coaching* counterpart to the repo's CLAUDE.md *tutor*: the tutor runs structured lessons; the coach rides along on real work.

## How it triggers

Two layers, because skills alone trigger probabilistically:

- **Skill** (`skills/agentic-coach`) — model-invoked. Holds the tip catalog and the "nudge, don't nag" protocol; Claude loads it when it judges the work matches.
- **Hook** (`hooks/hooks.json`, `UserPromptSubmit`) — deterministic. Pattern-matches obvious anti-patterns in your prompt ("clean up", "make it work", "think hard", "don't do X", "the whole repo"…) and injects a one-line reminder to surface the matching tip. Silent otherwise.

Lexical moments (phrasing) are caught reliably by the hook; semantic moments (no Definition of Done, accepting "it works" with no proof, giant context) rely on the skill's judgment.

## Nudge vs lesson

The full guide ships with the plugin (`guide.md`, a snapshot of all 60 tips), kept in sync with the canonical copy by CI.

- **Default:** a one-line nudge that cites the tip.
- **Opt in** ("show the full tip", "teach me this", "why?") and the coach reads the real tip from the bundled guide — exact *Instead / Prefer* text — or runs a single 4C micro-lesson on it. It never auto-lectures.

## Install

```shell
/plugin marketplace add krivitsky/professional-agentic-product-engineering
/plugin install agentic-coach@pae
```

Or test locally without installing:

```shell
claude --plugin-dir ./plugins/agentic-coach
```

## Use

Just work. When you write a vague prompt, skip a plan, or accept "done" without proof, you'll get a one-line nudge like:

> 💡 **Tip 31 — Make your Definition of Done executable:** spell out "done" as commands the agent runs itself.

Say **"stop coaching"** to silence it for the session.
