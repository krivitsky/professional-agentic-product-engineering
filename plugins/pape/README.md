# pape — Professional Agentic Product Engineering

Two skills for getting better at operating a coding agent, both drawing on the [Professional Agentic Product Engineering guide](https://agentic-engineering.guide/):

| Command | What it does |
|---|---|
| **`/pape:agentic-coach`** | Catches teachable moments *while you work* and surfaces the single most relevant tip, one nudge at a time, then gets out of the way. |
| **`/pape:harness-audit`** | Reads the harness checked into your repo *on demand* and reports which of the eight tiers hold, which don't, and the one next thing to fix. |

The coach is reactive, the audit is diagnostic. Together they're the counterpart to the repo's `CLAUDE.md` *tutor*: the tutor runs structured lessons; these two ride along on real work.

**`pape`** is the guide's acronym — Professional Agentic Product Engineering. It names both the marketplace and the plugin, which is why the install line reads `pape@pape` and the commands are namespaced `/pape:<skill>`.

## Install

```shell
/plugin marketplace add krivitsky/professional-agentic-product-engineering
/plugin install pape@pape
/reload-plugins
```

Or test locally without installing:

```shell
claude --plugin-dir ./plugins/pape
```

Needs `jq` on your PATH — the coach's hooks use it.

## `skills/agentic-coach` — the ambient nudge

Model-invoked. Holds the "nudge, don't nag" protocol. **Silence is the default.**

Just work. When you write a vague prompt, skip a plan, or accept "done" without proof, you get one line:

> 💡 **Tip 4.1 — Make your Definition of Done executable:** spell out "done" as commands the agent runs itself.

Say **"coach me"** to ask it directly, **"coach me on that"** to turn the last nudge into a short lesson, and **"stop coaching"** to silence it.

### How it triggers

Two layers, because skills alone trigger probabilistically:

- **Skill** (`skills/agentic-coach`) — model-invoked; Claude loads it when it judges the work matches.
- **Hooks** (`hooks/hooks.json` → `hooks/coach.sh`) — a deterministic trigger surface, three events:
  - **`UserPromptSubmit`** — injects a one-line "consult the coach" reminder on *every* prompt. The skill then decides whether a real anti-pattern applies (one nudge) or stays silent. Always-inject beats keyword-grep, which only caught the few moments where the user happened to type a trigger word and missed the semantic ones (no DoD, "it works" with no proof, file-list dumps).
  - **`PostToolUse` (Bash)** — fires after `git commit` / `git push` / build / test runs, nudging toward the checkpoint and verify tips (4.1 executable DoD · 4.5 demand evidence · 5.1 commit every green). Catches the build/commit moments a prompt-only hook can't see.
  - **`PostToolUse` (Edit|Write)** — fires when a `*test*` / `*spec*` / `.feature` file is edited, nudging Tip 4.2 (don't edit tests to pass) — the classic reward-hack.

The hooks guarantee the *reminder* fires; the skill keeps it quiet: **one nudge per turn, silence by default, never a tip already given this conversation.**

**Off switch.** Say "stop coaching" and the skill drops a flag (`.claude/.agentic-coach-off`) that the hooks check — coaching goes silent deterministically, not just by the model's goodwill. "Coach me again" removes it. Install the plugin for the audit alone and you'll still get the prompt hook; that flag is how you turn it off.

### Nudge vs lesson

The full guide ships with the plugin (`guide.md`, a snapshot of all 62 tips), kept byte-identical to the canonical copy by CI.

- **Default:** a one-line nudge that cites the tip.
- **Opt in** ("show the full tip", "teach me this", "why?") and the coach reads the real tip from the bundled guide — the exact *Instead / Prefer* text — or runs a single 4C micro-lesson on it. It never auto-lectures.

## `skills/harness-audit` — the on-demand audit

Ask *"audit my harness"*, *"what am I missing"*, *"is this repo agent-ready"* — or run `/pape:harness-audit`.

It reads the harness you've **checked into the repo** — instruction files, skills, agent definitions, hooks, permissions, tests, CI — and reports two kinds of finding. What's *absent* is the easy half. The valuable half is what's **present but incoherent, unenforced, or failing open**: two instruction files that contradict each other, a test gate that only runs after you've already pushed, a rule written down that nothing checks.

Every finding carries its evidence and cites the guide tip it comes from. All eight tiers get rated, and the report names **one next lever** — the lowest rung that doesn't hold yet, because a weak rung caps everything resting on it.

### It doesn't touch your repo

**Read-only, except the report.** It never edits, moves, or deletes a file; never runs tests, builds, installs, or migrations; never `git add/commit/checkout/stash/clean`. The only writes are the two report files. It stops at the offer — recommending fixes is the audit's job, applying them is a separate turn with your consent.

Secrets it finds are reported by shape and location only (`"sk_live_••••••••"`), never reproduced.

### What you get

Two files per run, in `harness-audits/`:

| File | For |
|---|---|
| `<YYYY-MM-DD-HHMM>-report.html` | **you** — a self-contained designed report, no external assets, prints cleanly |
| `<YYYY-MM-DD-HHMM>-report.md` | **agents** — the same findings as a briefing, so an agent with more context than the audit had can pick up where it stopped |

Commit the folder. A second run compares itself against the last one and tells you what moved — fixed, still open, newly found.

### Flags

| Flag | What changes |
|---|---|
| *(none)* | 2 finders + a verifier. The default. |
| `--quick` | 1 finder + the verifier. Looks at less; checks it just as hard. |
| `--deep` | 4 finders + the verifier. Two extra lenses. |
| `--theme:light` | Light report. The default. |
| `--theme:dark` | Dark report. Purely cosmetic — the audit is identical. |

**There is no flag that skips verification.** Findings come from parallel finders and are then handed to a separate agent whose only job is to try to *refute* them. Unverified findings are the exact failure this design exists to prevent, so cheap mode buys speed by looking at less, never by checking less.

## Files

```
pape/
├── .claude-plugin/plugin.json
├── guide.md                        bundled snapshot of the canonical guide (CI-enforced)
├── hooks/
│   ├── hooks.json                  plugin-level: applies to both skills
│   └── coach.sh
└── skills/
    ├── agentic-coach/SKILL.md      → /pape:agentic-coach
    └── harness-audit/
        ├── SKILL.md                → /pape:harness-audit
        ├── checks.md               the check catalogue
        ├── report.css              light theme — inlined into every report
        └── report-dark.css         dark override layer
```
