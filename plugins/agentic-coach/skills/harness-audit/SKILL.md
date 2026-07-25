---
name: harness-audit
description: Use when the user asks what their repo is missing to run coding agents well — "audit my harness", "audit this repo", "run the gauntlet", "am I set up right for agents", "what am I missing", "check my agentic setup", "is this repo agent-ready", "do I have the right guardrails" — or right after they install the coach and ask "now what". Sweeps the repo for the harness the Professional Agentic Product Engineering guide teaches (guidelines · autotests · guardrails), judges it against the tier their work actually needs, and reports have / can't-tell / missing with exactly one recommended next action. Do NOT use for a mid-task one-line nudge — that is the agentic-coach skill. Do NOT use to implement the missing pieces; this audit is read-only and stops at the offer.
argument-hint: "[--full] [--tier=throwaway|side-project|production]"
---

# Harness audit — what your repo has, what it's missing, at your tier

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

## Step 1 — Establish the target tier

The guide's "Which tier do you need?" gives three buckets. Classify into three, never guess one-of-eight:

| Bucket | Target | 
|---|---|
| Throwaway / one-off | **T1–2** |
| Side project you intend to keep | **T1–4** |
| Production code in a shared team repo | **T1–5**, reaching 6–8 as scale demands |

**Ladder — first match wins:**
1. ≥2 recent authors **OR** `CODEOWNERS`/PR template **OR** (deploy config **AND** CI) → **production**
2. Solo but >~3 months old **AND** (tags **OR** `CHANGELOG` **OR** CI **OR** deploy target) → **side project**
3. Otherwise → **throwaway**

Signals: `git shortlog -sne --since=12.months`, `.github/CODEOWNERS`, PR templates, CI files, `Dockerfile`/`k8s/`/`terraform/`/`vercel.json`/`fly.toml`, `git tag`, `CHANGELOG.md`, first-commit date. **A stated intent in CLAUDE.md or README beats every heuristic.**

**Confirm in ONE step, confidence-gated:**
- **Confident** (≥3 agreeing signals, no conflict) → no question. One banner with the evidence and a correction affordance.
- **Ambiguous or conflicting** → one `AskUserQuestion`, the three buckets as options, inferred one first, evidence in the body.
- **`--tier=` given** → skip inference.

**Detection is tier-independent; only the verdict label is tier-dependent.** Run every check once, apply the tier lens at render time — so "wrong? just say so" costs a re-render, not a re-scan.

---

## Step 2 — Run the checks

Work through `checks.md`. Each row carries `group`, `tip`, `expected_at`, `applies_when`, and `layer`.

**`applies_when` first.** A precondition that fails yields `– n/a`, never `❌`. Don't nag a Go CLI about browser tests or a docs repo about unit tests.

**Note `expected_at` is not the tip's tier.** Tip 3.2 (secrets) sits in Tier 3 but the guide says *"set this up first"* — it's expected even on a throwaway.

---

## Step 3 — Assign a verdict

Four states: **`✅` have it · `⚠️` can't tell · `❌` missing · `–` skipped** (above tier, or n/a).

> **A check may return `❌` only on a *negative observation*, never on the mere absence of a positive one.**

- **Layer A** (paths the harness defines) — absence *is* conclusive. `.mcp.json` exists or it doesn't. `❌` allowed.
- **Layer B** (things the stack defines) — absence is never conclusive alone. `❌` requires **two independent probes both empty**. Exactly one empty → `⚠️` naming the reason: *"found `tests/` but no runnable command declared anywhere — how do you run these?"*

**Mandatory `⚠️`, no exceptions:**
- Budget hit → everything unsearched, region named
- **Monorepo** with the signal in some packages and not others → `⚠️` + package list, **never a repo-wide `❌`**
- **Shallow clone** (`git log` depth 1) → author and commit-granularity signals are `⚠️`, not "solo throwaway"
- No git history → tier inference falls to the question branch
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

**Rows above the user's bucket do not appear at all.** Not as `–`, not as "n/a" — they are absent. Showing a Tier 8 row to someone auditing a side project is what makes the bucket look decorative. They live in `--full` only, and one closing line says they were skipped.

**Name the bucket, never a tier range.** Say *"side project you intend to keep"*, not *"→ T1–4"*. Scope comes from `expected_at`, not from tip numbers — printing a tier range next to a Tier 5 check that is in scope is a contradiction the reader will catch.

```
NEXT → <the one action> · <the file it touches> · Tip N.M
       <Two lines: what they already own, and what this
       makes bind.>

<repo> · <bucket>

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

**Every run writes exactly one file:** `harness-audit/<YYYY-MM-DD-HHMM>-report.html` in the audited repo. Self-contained — same three parts, styled to match the guide (navy `#22303c`, accent `#1abc9c`), every tip a live link, no external assets. **Say in the report where it was written and that nothing else was touched.**

Recommend **committing** the folder rather than gitignoring it: a tracked history of the harness maturing is the same checkpoint logic as [Tip 5.1](https://agentic-engineering.guide/tier-5#tip-5-1).

### Trend — the reason timestamps are worth their clutter

**Before writing, glob `harness-audit/*-report.html` and read the most recent one.** If it exists, open the new report with what changed since — this is what makes a second run worth doing:

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
1. Only `❌` rows at or below the target tier. **Never a `⚠️`** — don't recommend fixing what you're not sure is broken.
2. Prefer the **lowest tier number** — the ladder says fix the lower rung first.
3. Tie-break on the guide's dependency order: `3.2 → 3.5 → 4.1 → 4.2 → 5.1 → 5.4 → 5.5`.
4. **No `❌` but some `⚠️`** → the one thing becomes *"point me at X so I can finish the audit."*
5. **All green at tier** → name the single lowest-cost rung of the *next* tier, explicitly optional. "Stop where your work demands" means this must not read as a demand.

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
