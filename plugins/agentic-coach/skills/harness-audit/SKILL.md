---
name: harness-audit
description: Use when the user asks what their repo is missing to run coding agents well — "audit my harness", "audit this repo", "run the gauntlet", "am I set up right for agents", "what am I missing", "check my agentic setup", "is this repo agent-ready", "do I have the right guardrails" — or right after they install the coach and ask "now what". Sweeps the repo for the harness the Professional Agentic Product Engineering guide teaches (guidelines · autotests · guardrails), and reports have / can't-tell / missing for every check — no tiers, no ceiling — with exactly one recommended next action. Do NOT use for a mid-task one-line nudge — that is the agentic-coach skill. Do NOT use to implement the missing pieces; this audit is read-only and stops at the offer.
argument-hint: "[--full]"
---

# Harness audit — what your repo has, what it's missing, and the one thing to do

The guide's Big Idea: a **harness** is a **workflow** bounded by three constraints — **guidelines** (how the agent should behave), **autotests** (ground truth from the environment), and **guardrails** (limits it can't cross). This skill reads a repo and reports which of those it actually has.

The full guide ships with this plugin at **`${CLAUDE_PLUGIN_ROOT}/guide.md`**. The check registry is in **`${CLAUDE_PLUGIN_ROOT}/skills/harness-audit/checks.md`** — **read it before auditing.** It holds every check, its tip, and when it applies.

**Read-only. Always.** Never create, edit, move, or delete a file. Never run tests, builds, installs, or migrations. Never `git add/commit/checkout/stash/clean`. Never write the report to a file. If they want it saved, that is a separate action *after* the audit, which they ask for.

---

## The one rule that keeps this from rotting

> **Literal paths only for what the *agent harness* defines. For anything the *project's stack* defines, name the artifact and let your own judgement resolve it.**

`.claude/agents/*.md` is Anthropic's contract — stable for years. `vitest` vs `jest` vs `bun test` churns annually. So `checks.md` hardcodes the first kind and deliberately contains **no list of test frameworks**. You already know what `pytest`, `go test`, `cargo nextest`, and `bundle exec rspec` are — read the manifest and name the command. Don't look for a list here; there isn't one, on purpose.

**Resolving a project command — precedence, highest first:**
1. **The CI workflow** — the only place the command is *proven* to be the real one
2. Repo docs — `CLAUDE.md`, `README`, `CONTRIBUTING`
3. Manifest scripts — `package.json` `.scripts`, `pyproject.toml`, `Makefile`/`justfile`/`Taskfile`, `Rakefile`, `pom.xml`, `build.gradle`, `mix.exs`, `deno.json`, `composer.json`
4. Language convention — `go test ./...`, `cargo test`

**Budget: one tree listing, ≤25 file reads, ≤12 bash calls.** Hit the cap and everything unexamined is `⚠️` with the region named. An audit that floods its own context while teaching Tip 3.1 has failed Tip 3.1.

---

## No tiers, no ceiling — report everything

**There is no target tier and no user bucket. Every check runs, every result is shown, all in one list.** Don't infer how ambitious the repo is, don't ask, don't gate on it, don't store it.

The reason is simple: *"this is a side project"* is a claim about **intent**, and a repo cannot know intent. Commit counts are observable; whether someone wants to run autonomous loops next month is not. An earlier version of this skill guessed — and classified a 561-commit live site as *throwaway*. A guess that can suppress findings hasn't earned the power to.

The guide's *climb only as high as your work demands* discipline is still right — but it's **the reader's call, made from complete information**, not a filter the tool applies on their behalf. The audit reports; the reader decides where to stop.

**What replaces the gate: ranking.** Everything is visible; the single recommendation is chosen by leverage (see Step 4). One thing to do, and the whole list to decide from.

**`applies_when` is not a ceiling and stays.** It fires on *fact*, not ambition: a CLI has no browser to test; a repo with no autonomous loop has nothing to sandbox. That's `n/a` because the check doesn't apply, not because someone decided the reader shouldn't want it. Never use `applies_when` to express "you're not ready for this."

---

## Step 2 — Run the checks

Work through `checks.md`. Each row carries `group`, `tip`, `applies_when`, and `layer`. Run all of them.

**`applies_when` first.** A precondition that fails yields `– n/a`, never `❌`. Don't nag a Go CLI about browser tests or a docs repo about unit tests.

---

## Step 3 — Assign a verdict

Four states: **`✅` have it · `⚠️` can't tell · `❌` missing · `–` n/a** (the check genuinely doesn't apply to this repo).

> **A check may return `❌` only on a *negative observation*, never on the mere absence of a positive one.**

- **Layer A** (paths the harness defines) — absence *is* conclusive. `.mcp.json` exists or it doesn't. `❌` allowed.
- **Layer B** (things the stack defines) — absence is never conclusive alone. `❌` requires **two independent probes both empty**. Exactly one empty → `⚠️` naming the reason: *"found `tests/` but no runnable command declared anywhere — how do you run these?"*

**Mandatory `⚠️`, no exceptions:**
- Budget hit → everything unsearched, region named
- **Monorepo** with the signal in some packages and not others → `⚠️` + package list, **never a repo-wide `❌`**
- **Shallow clone** (`git log` depth 1) → author and commit-granularity signals are `⚠️`, not "solo throwaway"
- No git history → every history-derived signal is `⚠️`
- Anything needing runtime truth ("does CI pass?") → `⚠️` by construction; this audit does not execute

**Two wording rules that decide whether the report is believed:**
1. **Every `❌` prints the evidence under it.** `❌ CI — searched .github/workflows/, .gitlab-ci.yml, .circleci/, Jenkinsfile`. A bare `❌` is a claim, and Tip 4.5 says demand evidence, not a claim. This audit obeys 4.5 about itself.
2. **Phrase negatives as observations about the search, never verdicts about the repo.** Never *"no tests"* — always *"no test command I could resolve."* When the user knows the tests live in `t/`, that one word is the difference between a bug report and a useful question.

---

## Step 4 — Cite tips correctly

Cite to the **live guide**, which renders the tip in context — not to the raw GitHub markdown:

`[Tip 5.4](https://agentic-engineering.guide/tier-5#tip-5-4)`

The URL is mechanical: `https://agentic-engineering.guide/tier-<T>#tip-<T>-<N>`. Tip numbers are `T.N` (Tier.index); the anchor turns the dot into a hyphen. Visible text stays short so rows stay one line.

> **Before printing any tip citation, confirm it exists:** `rg '<a id="tip-4-10">' ${CLAUDE_PLUGIN_ROOT}/guide.md`
> **No anchor, no citation.** Print the prose form instead. Never a number you didn't confirm.

---

## Step 5 — Render

**Three parts, always in this order: ① Overall ② Details ③ Suggestions.**

**Every check, one list, no levels.** No "beyond your level" section, no bucket in the header, no tier range. A `✗` on sandboxing sits in the same list as a `✗` on secrets — ordered by leverage, not by permission to care about it.

**Say what a gap costs, not whether they're allowed to have it.** Instead of *"above your level — skip"*, write *"only matters once agents run unattended"*. Same information, and it leaves the judgement where it belongs. A reader running a static site reads that and moves on; a reader planning a loop reads it and acts.

**Collapse gaps that share one fix.** Several checks can fail on the same absent file — 4.7 (fresh-eyes review) and 6.2/6.4 (subagent roles) are both "no `.claude/agents/`". Report every check honestly in ②, but in ③ they are **one suggestion**, and the count line says so: *"4 gaps, 3 fixes."* Listing one missing file as three problems overstates the damage and makes the report feel like a shakedown.

```
NEXT → <the one action> · <the file it touches> · Tip N.M
       <Two lines: what they already own, and what this
       makes bind.>

<repo> · <n> checks · <date>

━━ ① OVERALL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  AUTOTESTS   ██████████   3 of 3
              <one line: what's working>

  GUARDRAILS  ████████░░   3 of 4
              <what's working>
              gap: <the gap>                    Tip N.M

  GUIDELINES  ███████░░░   2 of 3
              <what's working>
              gap: <the gap>                    Tip N.M

━━ ② DETAILS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  <Every in-scope check, grouped, with the evidence that
  produced the verdict — the actual file paths, counts,
  and commands found, or the exact searches that came
  back empty.>

━━ ③ SUGGESTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. <action>                                   Tip N.M
     <why — one line>
     <the concrete change, and its size>

  <More, ranked. The one in NEXT is #1.>

  Read-only: working tree unchanged (verified).
  Not visible from the repo: worktree habits and fleet
  ops — those live on your machine, not in git.
```

**Bars are counts, not a score** — `3 of 4` is the truth; the bar just draws it. Never a weighted total, never a percentage.

**Every `Tip N.M` in ③ is a live link** to `https://agentic-engineering.guide/tier-<T>#tip-<T>-<N>`, so the reader can go read the tip that generated the suggestion. In ① the same number appears as plain text — bars stay scannable.

## The HTML artifact — always written

**Every run writes exactly two files**, same basename, into `harness-audit/` in the audited repo:

| File | For |
|---|---|
| `<YYYY-MM-DD-HHMM>-report.html` | **humans** — self-contained, styled to match the guide (navy `#22303c`, accent `#1abc9c`), no external assets |
| `<YYYY-MM-DD-HHMM>-report.md` | **agents** — same findings, plain Markdown |

**Say in the report where both went and that nothing else was touched.**

Recommend **committing** the folder rather than gitignoring it: a tracked history of the harness maturing is the same checkpoint logic as [Tip 5.1](https://agentic-engineering.guide/tier-5#tip-5-1).

### The `.md` twin — write it for a machine, not as a downgrade

Same content, but the shape is the point: another agent should be able to answer *"what's missing and what should I do?"* without parsing prose, and the next audit run should be able to diff two of these cheaply.

- **Stable headings** — `## Verdict`, `## Overall`, `## Details`, `## Beyond this repo's level`, `## Suggestions`. Never renamed between runs.
- **A machine-readable block right after the title**, so nothing has to be inferred:
  ```
  repo: krivitskydotcom
  level: side-project
  at-level: 7 ok · 2 warn · 2 missing
  next: tip-5-4
  ```
- **One table row per check**, in a fixed column order: `verdict | check | tip | evidence`. Verdicts are the literal words `ok` / `warn` / `missing` / `n/a` — not emoji, which are miserable to match on.
- **Tip references as bare anchors** (`tip-5-4`) in the data block and full links in the prose. An agent greps the anchor; a human clicks the link.
- The fix in `## Suggestions` carries **the same literal lines** as the HTML. An agent asked to apply the recommendation must find something to apply.

### Trend — the reason timestamps are worth their clutter

**Before writing, glob `harness-audit/*-report.md` and read the most recent one** — the `.md`, not the HTML; that's what it's for. Compare its data block to this run's. If one exists, open the new report with what changed:

- **Counts moved:** *"Guardrails 3 of 4 → 4 of 4 — you added the Stop hook."*
- **Something regressed:** *"CI was green last run; the workflow file is gone."* Lead with a regression; it outranks the normal NEXT action.
- **A number drifted:** *"CLAUDE.md 516 → 604 lines."* Trends in the numbers are more useful than their absolute values.
- **Nothing changed:** say so plainly — *"No change since 12 Jun. The hooks gap is still the one thing."* Don't manufacture movement.

No prior report → `First run — no earlier report in harness-audit/ to compare against.`

---

## Five rules the first version of this skill got wrong

Learned from auditing a real repo. Each one produced a broken report.

1. **Verify the path you recommend against what you already found.** The first run said *"no `.claude/settings.json` anywhere"* and then routed the new file to `site/.claude/settings.json` — while its own skills check had found `.claude/skills/` **at the repo root**. Claude would never have read the file. **Put new config next to the `.claude/` that already exists**; if none exists, the repo root, and say why.
2. **Recommend the real command, not a plausible one.** It praised `npm run build` as the gate for a paragraph, then proposed a hook running `npm test` — silently dropping three-quarters of that gate. **The command in the fix must be the command in the evidence.**
3. **Ship the artifact, not a description of it.** *"Create settings.json with a `hooks.Stop` entry"* is not an action, it's homework. **Print the literal lines they paste.** If you can't produce them, you don't understand the fix well enough to recommend it.
4. **Then say how to prove it fires.** An unverified hook is indistinguishable from no hook. Every fix ends with the one concrete check that shows it took — Tip 4.5 applied to your own advice.
5. **`⚠` is a status, not just a footnote.** A `✓` that carries a criticism (*"CLAUDE.md present — but 516 lines, past the limit"*) makes ① and ③ disagree about how many problems exist. Over-budget → `⚠`. And a genuinely optional gap (no MCP on a solo site) is `⚠`, never a red `✗` — spend red only on things that are actually broken.

**Also: cut the passing rows.** ② is for findings the reader couldn't have guessed — a computed number, a threshold crossed, a caveat. Checks that passed with nothing to say collapse into one closing sentence. A row that says "fine" costs attention and returns nothing.

Emoji markers have an ASCII fallback for terminals that mangle them: `[+] [?] [-] [.]`.

**No numeric score.** Ever. "68/100" is fake precision, invites gaming, and fights the guide's core discipline — a throwaway repo with a thin harness is *correct*, not bad. Counts plus the tier lens carry all the signal without the lie.

**Selecting the ONE next action — deterministic, not vibes:**
1. Only `❌` rows. **Never a `⚠️`** — don't recommend fixing what you're not sure is broken. **Never an `– n/a`** — that check doesn't apply to this repo at all.
2. **Prefer the fix with the most leverage: the one that makes assets they already own start binding.** A repo with a green suite and a CI gate but no hook is one file away from that gate holding locally — that beats introducing a capability from scratch, because the value is already sitting there unused. Say this in the NEXT box: *"you already own the hard part."*
3. Only if nothing has that property, prefer the **lowest tier number** — the ladder says fix the lower rung first — tie-breaking on `3.2 → 3.5 → 4.1 → 4.2 → 5.1 → 5.4 → 5.5`.
4. **No `❌` but some `⚠️`** → the one thing becomes *"point me at X so I can finish the audit."*
5. **All green** → name the single lowest-cost rung above their level, explicitly optional. "Stop where your work demands" means this must not read as a demand.

*(Rule 2 exists because rule 3 alone gets it wrong. On a repo with tests, CI and no hook, "lowest tier number" picks "add a reviewer subagent" — real work, speculative payoff — over six lines that make an existing gate bind. Leverage is the principle; tier order is only the tie-break.)*

**Then stop.** Make the offer; don't take it. Implementation is the next turn, with ordinary permissions and explicit consent — that's Tip 2.3, and it's what makes the read-only claim true end to end.

**Prove the read-only claim:** capture `git status --porcelain` at start and end; close with *"Read-only: working tree unchanged (verified)."*

---

## `--full` — the whole gauntlet

Append the six-item gauntlet from Uncle Bob's tweet in the Big Idea, regardless of tier. See the `## The full gauntlet` section of `checks.md`.

**Three of the six are not taught by any tip yet.** Cite with exactly three forms — a fourth is forbidden:
- `[Tip 4.2]` — a real tip covers it
- `— guide: Big Idea (Uncle Bob's gauntlet)` — from the quoted tweet, linked to the Big Idea anchor, which does exist
- `— not yet a tip in this guide` — **plain text. No link. No number. Ever.**

Anything you add from outside the guide is tagged `(outside the guide)` — house policy, same as tutor mode.
