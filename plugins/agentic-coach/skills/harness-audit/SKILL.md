---
name: harness-audit
description: Use when the user asks what their repo is missing to run coding agents well — "audit my harness", "audit this repo", "run the gauntlet", "am I set up right for agents", "what am I missing", "check my agentic setup", "is this repo agent-ready", "do I have the right guardrails" — or right after they install the coach and ask "now what". Reads the harness configuration checked into the repo and reports findings: what's absent, and — more valuable — what's present but incoherent, unenforced, or failing open. Severity-rated, evidence-backed, with a recommended sequence. Do NOT use for a mid-task one-line nudge — that is the agentic-coach skill. Do NOT use to implement the fixes; the audit reads and reports, then stops.
argument-hint: "[--quick]"
---

# Harness audit — a static review of the agent configuration in a repo

The guide's Big Idea: a **harness** is a **workflow** bounded by three constraints — **guidelines** (how the agent should behave), **autotests** (ground truth from the environment), **guardrails** (limits it can't cross). This skill reviews the one a repo actually has.

The full guide ships at **`${CLAUDE_PLUGIN_ROOT}/guide.md`**. The check catalogue is **`${CLAUDE_PLUGIN_ROOT}/skills/harness-audit/checks.md`** — **read all of it before auditing.**

**Read-only, except the report.** Never edit, move, or delete a file. Never run tests, builds, installs, or migrations. Never `git add/commit/checkout/stash/clean`. The only writes are the two report files in `harness-audit/`.

---

## The distinction that makes this an audit and not an inventory

**Presence is the cheap half.** "Is there a hook?" is a glob. The findings worth the reader's time come from opening files and cross-referencing them:

- two `CLAUDE.md` files giving contradictory orders, so behaviour depends on working directory
- nine rules written as "never", one of them enforced
- a hook that `|| true`s its own failure — so the harness *looks* gated and is not
- a subagent instructed to dispatch subagents, which the runtime cannot do
- a `.gitignore` pattern that near-misses the file it was written to exclude

Every one passes a presence check. **`checks.md` has two classes and Class C is the point** — a run that reports only Class P has done the easy work and stopped.

---

## Findings

Every finding gets a stable ID (`H-001`, in severity order), and this shape. The middle three are what separate a report from a linter.

| | |
|---|---|
| **Criteria** | What should be true, stated as a standard — not "you're missing X" |
| **Condition** | What is true, with `file:line` and a quoted excerpt |
| **Cause** | *Why it drifted.* Almost always process, not ignorance: "the allowlist grew by accretion — each entry added to unblock one session, and nothing treats a permission change differently from any other config change." Guess honestly and say you're guessing |
| **Consequence** | What it costs in practice. Name the failure mode, not the rule |
| **Corrective action — now** | The smallest thing that closes it, with the literal lines to paste |
| **Corrective action — structural** | What stops it recurring |

**Say when findings compound.** *"Combined with H-001, the configuration reads as gated to anyone reviewing it, while in practice nothing blocks."* Two findings that multiply are worth more than their sum, and a reader who fixes one and not the other has fixed nothing. Look for these deliberately.

### Severity — the cost if it goes wrong

| | |
|---|---|
| **Critical** | A single bad turn is unrecoverable — destroyed work, rewritten shared history, leaked live credential |
| **High** | Silently wrong behaviour, or a guardrail that doesn't hold |
| **Medium** | Real cost, recoverable — waste, drift, inconsistency between sessions |
| **Low** | Friction or a latent trap |
| **Info** | Worth knowing, no action |

### Confidence — how sure you are, a *separate* axis

- **Confirmed** — read directly from a file. Quote it.
- **Probable** — inferred, and say from what: *"whether this server is loaded in practice cannot be determined from configuration alone."*

Never collapse these. `Medium / Probable` and `Medium / Confirmed` are different asks. A reader deciding what to do this afternoon needs both numbers.

**A finding may only assert what a file shows.** Absence of a positive is not a negative — if the tests might be in an unusual place, that's `Probable` with the search printed, never a confident miss.

**Redact secrets.** A credential is reported by shape and location, never reproduced: `"sk_live_••••••••••••"`. The report gets committed; do not put the key in it twice.

**Observations (`O-1`…) are not findings.** Things with no measurable effect on behaviour, recorded so they're not mistaken for oversights — including *praise that's actionable*: "the API file uses worked examples rather than prose rules; that's the strongest writing here and worth copying to root." Say explicitly they need no response.

---

## Rating categories

Rate each category in `checks.md` **Strong · Satisfactory · Moderate · Weak · Missing · Not assessed**, each with a one-line note that carries the actual meaning.

**Never total them.** No overall score, no percentage, no averaged bar. An earlier version drew a fill bar per group; the bars ended up identical and cheerful regardless of content, and a repo with excellent CI and no agent guardrails scored as healthy. **A gauge is read as a grade whatever the caption says** — so it may only ever appear per-category, next to the note that explains it, never summed.

**"Not assessed" is a distinct state, rendered differently, and always carries the line that it is not a pass.** Anything needing runtime evidence — does the suite pass, do the rules get followed, which skills ever trigger — is `Not assessed`, not `Weak`.

---

## Report structure

Both files, every run, same basename in `harness-audit/`:

| File | For |
|---|---|
| `<YYYY-MM-DD-HHMM>-report.html` | humans — self-contained, **no external fonts or assets**, print stylesheet |
| `<YYYY-MM-DD-HHMM>-report.md` | agents — same findings, stable headings, `file:line` intact |

Nine sections:

1. **Scope and coverage** — three columns: **Read** (every file consulted, counted) · **Absent** (what was looked for and isn't there) · **Not visible to this method** (runtime behaviour, real token cost, whether rules are obeyed). This is the trust device and it goes first.
2. **Questions this report answers** — 5–7 questions with one-line verdicts and finding pointers. The 90-second read.
3. **Summary** — three paragraphs of prose. The shape of the problem, the one urgent thing, and the pattern underneath. Credit what's good; a report that only accuses gets discounted.
4. **Scorecard** — categories, ratings, notes.
5. **Summary of findings** — severity counts, then a table: ID · finding · category · severity · confidence.
6. **Detailed findings** — the full shape above, severity order.
7. **Observations**
8. **Recommended sequence** — two columns, **This week** and **Structural**, each item referencing its IDs. Ordered by what unblocks what, not by severity alone.
9. **Limitations** — what this method cannot see, that the findings are not exhaustive, and that *Not assessed* means no evidence rather than no problem.

### Trend

**Two identifiers per finding, and they do different jobs.**

| | |
|---|---|
| **Display ID** — `H-001` | Assigned in severity order, **this run only**. For reading and cross-referencing within the report. |
| **Key** — `<check>@<primary location>` | e.g. `C-2@CLAUDE.md`, `C-12@ci.yml`, `P-hooks@.claude/settings.json`. Derived from *what the finding is about*. Stable across runs. **This is the only thing trend may compare on.** |

Never compare runs by display ID. Ranks shift as findings close — `H-001` next month is a different finding wearing the same badge, and reporting it as "still open" is a lie the reader can't catch.

**Before writing:** glob `harness-audit/*-report.md`, read the most recent, extract its keys. Then:

- **Closed** — key present before, absent now. Name it: *"C-7@.gitignore closed — the tracked worktree file is gone."*
- **Still open** — key in both. Say how long: *"C-2@CLAUDE.md open since 25 Jul."* A finding that survives three runs is itself a finding about the process.
- **New** — key only now.
- **Moved** — same key, different severity or a rating change, in either direction. **A regression outranks everything and leads the report.**
- **Drifted numbers** — same key, changed measurement: *"CLAUDE.md 516 → 604 lines."* The direction matters more than the value.

**Placement: a `## Trend` block immediately after the cover, in both files, before §1.** It is the first thing a returning reader wants and the whole reason timestamped reports are worth their clutter. No prior report → one line saying so, in the same place.

Carry the keys in the `.md` so the next run can read them without parsing prose:

```
keys-open:   C-2@CLAUDE.md · C-12@ci.yml · P-agents@.claude/agents
keys-closed: (none)
```

---

## Method

**Resolving a project command — precedence, highest first:** the CI workflow (the only place it's *proven*) → repo docs → manifest scripts → language convention. `checks.md` names no test frameworks on purpose; read the manifest and name what you find.

**Budget: ≤35 file reads, ≤15 bash calls.** Class C costs more than Class P — spend it there. Hit the cap and say which region went unexamined; that region is `Not assessed`.

**Verify every tip citation before printing it:** `rg '<a id="tip-5-4">' ${CLAUDE_PLUGIN_ROOT}/guide.md`. No anchor, no citation. Cite the live guide: `https://agentic-engineering.guide/tier-<T>#tip-<T>-<N>`.

**No tiers, no ceiling.** Don't infer how ambitious the repo is and don't gate on it. *"This is only a side project"* is a claim about intent, which a repo cannot observe — an earlier version guessed and classified a 561-commit live site as throwaway. Severity already carries the ranking. Where something genuinely doesn't apply, say what it depends on — *"only matters once agents run unattended"* — not *"above your level"*.

---

## Before you ship: walk your own corrective actions

**This is a step, not advice. Run it after drafting the report and before writing either file.**

Every failure this skill has shipped came from the same place: naming a mechanism without reading the thing that decides whether the mechanism works. It has never once been a novel mistake — it has been that mistake wearing a new costume. So the fix is a gate, not another rule.

For **each** corrective action, in order:

1. **Did I open the file this touches?** Not glob it, not infer it from a manifest — read it. If the action names a test runner, you have read its config. If it names a hook event, you know when that event fires. **If you cannot say which file you read, the action is not ready and becomes `Probable`, or is cut.**
2. **Does the command behave the same where the fix runs it?** CI-conditional config is the standard trap — a runner that starts a prebuilt server under CI and a dev server locally makes an identical command mean two different things. Read the branch, name the flag.
3. **Does it fire only at the moment the rule is about?** A rule about pushing that gates every commit, or every agent turn, costs the user something they didn't agree to. Match the trigger to the moment.
4. **Would this destroy anything §3 credited?** Grep your own summary. If it praises a habit, no corrective action may tax that habit. A report that contradicts its own praise is discarded on the spot.
5. **Is the output bounded?** Anything that returns text to the model — a blocking hook, a failing gate — surfaces a tail, never a whole log.

Then apply this skill's own §6 to itself: **the session that wrote a recommendation should not be the only one that checks it.** If any action survives all five and still rests on inference, say so in the finding rather than presenting it as settled.

### The three instances that produced this gate

Kept as worked examples, not as separate rules — they are what step 1 through 4 look like when skipped.

- **A `Stop` hook running a multi-minute build.** `Stop` fires at the end of *every* agent turn, including pure conversation. Minutes of waiting after every message; removed within a day. The rule said "before push", so it was `PreToolUse` matched on `git push` all along. *(step 3)*
- **`npm run verify` with no `CI=1`.** `playwright.config.ts` selected `start:e2e` under CI and `npm run dev` otherwise, with `reuseExistingServer: !CI`. The gate would have blocked good pushes at random, and a gate that cries wolf gets ripped out. *(step 2 — the config was never opened)*
- **Merging "test before commit" and "build before push" into one gate**, in a report whose summary had just praised 561 small checkpoint commits. *(step 4)*

## Five specifics, subordinate to the gate above

1. **Verify the path you recommend against what you already found.** A run once reported "no `.claude/settings.json` anywhere" and routed the fix to `site/.claude/` while its own skills check had found `.claude/` at the root. The file would never have been read.
2. **The command in the fix must be the command in the evidence.** Don't praise `npm run build` as the gate and then propose a hook running `npm test`.
3. **Ship the literal lines, not a description of them.** "Create settings.json with a `hooks.Stop` entry" is homework, not a corrective action.
4. **Then say how to prove it took.** An unverified hook is indistinguishable from no hook.
5. **Collapse gaps that share one fix.** Several checks can fail on one absent file. Report each honestly in §6; in §8 they are one item. Three findings, two files — say both numbers.

**Then stop.** The audit reports and offers. Implementation is the next turn, with explicit consent and ordinary permissions.
