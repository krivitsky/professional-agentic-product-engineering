# agentic-coach

An **ambient coach** for operating a coding agent. It catches teachable moments while you work and surfaces the single most relevant tip from the [Professional Agentic Product Engineering guide](https://github.com/krivitsky/professional-agentic-product-engineering) — one nudge at a time, then gets out of the way.

This is the *coaching* counterpart to the repo's CLAUDE.md *tutor*: the tutor runs structured lessons; the coach rides along on real work.

## How it triggers

Two layers, because skills alone trigger probabilistically:

- **Skill** (`skills/agentic-coach`) — model-invoked. Holds the tip catalog and the "nudge, don't nag" protocol; Claude loads it when it judges the work matches.
- **Hooks** (`hooks/hooks.json` → `hooks/coach.sh`) — deterministic trigger surface, three events:
  - **`UserPromptSubmit`** — injects a one-line "consult the coach" reminder on *every* prompt. The skill then decides whether a real anti-pattern applies (one nudge) or stays silent. Always-inject beats keyword-grep, which only caught the few moments where the user happened to type a trigger word and missed semantic ones (no DoD, "it works" with no proof, file-list dumps).
  - **`PostToolUse` (Bash)** — fires after `git commit` / `git push` / build / test runs, nudging toward the checkpoint/verify tips (4.1 executable DoD · 4.5 demand evidence · 5.1 commit every green). Catches the build/commit moments a prompt-only hook can't see.
  - **`PostToolUse` (Edit|Write)** — fires when a `*test*` / `*spec*` / `.feature` file is edited, nudging Tip 4.2 (don't edit tests to pass) — the classic reward-hack.

The hooks guarantee the *reminder* fires; the skill keeps it quiet: **one nudge per turn, silence by default, and never repeats a tip already given this conversation.**

**Off switch.** Say "stop coaching" and the skill drops a flag (`.claude/.agentic-coach-off`) that the hooks check — coaching goes silent deterministically (not just by my goodwill). "Coach me again" removes it.

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

> 💡 **Tip 4.1 — Make your Definition of Done executable:** spell out "done" as commands the agent runs itself.

Say **"stop coaching"** to silence it for the session.
