---
name: harness-audit
description: Use when the user asks what their repo is missing to run coding agents well — "audit my harness", "audit this repo", "run the gauntlet", "am I set up right for agents", "what am I missing", "check my agentic setup", "is this repo agent-ready", "do I have the right guardrails" — or right after they install the coach and ask "now what". Reads the harness configuration checked into the repo and reports findings — what's absent, and, more valuable, what's present but incoherent, unenforced, or failing open. Severity-rated, evidence-backed, with a recommended sequence. Do NOT use for a mid-task one-line nudge — that is the agentic-coach skill. Do NOT use to implement the fixes; the audit reads and reports, then stops.
argument-hint: "[--quick | --deep] [--theme:light | --theme:dark]"
---

# Harness audit — a static review of the agent configuration in a repo

The guide's Big Idea: a **harness** is a **workflow** bounded by three constraints — **guidelines** (how the agent should behave), **autotests** (ground truth from the environment), **guardrails** (limits it can't cross). This skill reviews the one a repo actually has.

The full guide ships at **`${CLAUDE_PLUGIN_ROOT}/guide.md`**. The check catalogue is **`${CLAUDE_PLUGIN_ROOT}/skills/harness-audit/checks.md`** — **read all of it before auditing.**

**Read-only, except the report.** Never edit, move, or delete a file. Never run tests, builds, installs, or migrations. Never `git add/commit/checkout/stash/clean`. The only writes are the two report files in `harness-audits/`.

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

## Three passes: find wide, then falsify

An independent review of a shipped report re-checked every claim against the working tree and returned: *diagnosis sound · three of seven findings misstated · one false.* **Its architecture held; its citations did not.** The single pass that wrote it had used 14 of its 35 allowed reads — budget was never the constraint. A grep hit was being treated as a read.

That is not fixable by trying harder in one context, and the skill already knew why: *the session that wrote a recommendation should not be the only one that checks it.* This is [Tip 4.7](https://agentic-engineering.guide/tier-4#tip-4-7) — *review with fresh eyes, not the context that wrote it* — applied to the audit itself.

| Pass | Job | Count |
|---|---|---|
| **1 · Finders** | Produce candidate findings. Run **in parallel**, each with a different lens, each read-only | 2 by default |
| **1b · Re-checker** | Re-test the previous run's open issues. Runs **beside** the finders and returns first | 1, when a prior report exists |
| **2 · Pooling** | Merge, dedupe, flag conflicts. Mechanical — done in the orchestrating context, no agent | — |
| **3 · Verifier** | Falsify every pooled finding against the tree. Returns verdicts, not opinions | 1, always |

### Pass 1 — finders, for recall

Fan-out buys **coverage**, not correctness. Class C checks are open-ended — *"find contradictions between instruction files"* has no fixed answer set, and one pass finds what its lens is shaped for. The shipped report cited `ci.yml` **and** `playwright.config.ts` and never noticed that a comment in one contradicts the ternary in the other; a finder told to cross-read pairs would plausibly have caught it.

Spawn each as a subagent with the read-only constraint, `checks.md`, and one lens:

| Lens | Told to look for |
|---|---|
| **Enforcement** | Class P absences, C-2, C-4, C-5, C-10, C-12 — what is stated versus what holds |
| **Coherence** | C-1, C-3, C-6, C-8, C-9, C-11 — contradictions *between* files. **Every claim must rest on two files read together** |

**Under `--quick` the single finder carries both lenses, not one of them.** An earlier version ran Enforcement alone, which quietly made the cheap mode the *shallow* mode: Coherence owns the cross-file reading — C-1, C-3, C-6, C-8, C-9, C-11 — and dropping it drops the half this skill opens by calling the point. Class P absences are the easy half; a `--quick` run that returns only those has done the inventory and called it an audit.

**Specialisation is a two-finder technique.** With two, divergence is the product: different lenses read differently, and where they clash pooling has a signal. With one, there is nothing to diverge from, so a narrow lens is loss with no compensating gain. **Give the single finder the union and a smaller budget** — it sees less of everything rather than none of something.

Under `--deep`, add **Hygiene** (C-7, secrets, tracked state, machine paths) and **Economy** (context budget, always-loaded cost, duplication between instruction files and skills).

Each finder returns candidate findings in the §Findings shape, each with the `file:line` it rests on. **Finders do not write the report.**

### Pass 1b — the re-checker, when a prior report exists

**Spawn it alongside the finders, not after them.** It re-tests the previous run's open issues against the tree, and because every one of them arrives with a `file:line` and a stated condition, its work is targeted reads rather than an open-ended sweep. It finishes long before the finders do.

**Give it the issues inline — never the report path.** The orchestrating context has already opened the previous report; it extracts each open issue's subject, `file:line` and the condition claimed, and passes that list in the prompt. **Handing over a path instead makes the re-checker read a hundred-kilobyte document to find its own worklist** — an observed run spent ~90k tokens this way, more than the finder it was supposed to undercut, and most of it before any re-testing began.

The whole premise of this pass is that it is cheap because its targets are known. **Make them known to it.**

**Worst first, capped at ten.** All Highs, then fill by severity. More than that and it stops being the fast pass.

Three verdicts per issue, and the third is not a failure:

| Verdict | Means |
|---|---|
| **fixed** | The condition is gone. Name what changed — *"the gate now exits non-zero"* |
| **still open** | The condition holds. It carries into this run's findings with its original `open since` date |
| **can't tell** | The evidence moved or the check no longer applies. Say so; do not guess either way |

**This is what makes Trend evidence instead of inference.** Trend has been deriving `fixed` from a key's *absence* in the new run — but a key can vanish because the problem was solved, or because nothing looked there this time. Under `--quick`, with one finder on a smaller budget, the second is likely and indistinguishable. **A re-checked `fixed` is a fact; a diffed `fixed` is a guess wearing the same word.** Where the two disagree, the re-checker wins.

**A correction to the previous report gets its own line, not a subordinate clause.** A re-check re-derived one issue's measurement to 66% where the earlier report said 69%, and reported it at the tail of a sentence about what was still open. **The audit correcting its own prior number is the strongest trust signal it has** — stronger than any finding, because it is the only evidence a reader gets that the process catches itself. Give it the line:

> Correction to the 27 Jul 11:28 report: `ISSUE-3`'s measurement re-derives to **66%**, not 69% — `CLAUDE.md` has grown ~800 characters since.

**Report it the moment it lands, before the finders return:**

> Re-checked the last run's 7 Highs and top 3 Mediums: **2 fixed, 8 still open.**
>
> `ISSUE-5` and `ISSUE-6` **of the 27 Jul 11:28 report** both closed — the pre-push hook now blocks instead of waving a push through, and an unauthenticated CLI now exits 2 instead of printing green. Both were gates that failed open; both now fail closed. **That is the T5 move** — the harness catches what it used to wave through.
>
> Still open, including five Highs: `ISSUE-1` publish callbacks still poll Vercel alone, `ISSUE-2` two skills still forbid the dev server six places require. Now finding what's new.

**Cite the ID, and always say which report it belongs to.** Display IDs follow table order and renumber as issues close, so `ISSUE-5` in the previous report is a different row from `ISSUE-5` in this one. **An unqualified ID sends the reader to the wrong line of the document they already have open.** `ISSUE-5 of the 27 Jul 11:28 report` costs six words and is the only form that resolves.

**Name what the fix demonstrates, on the rung it belongs to.** Two closed gates are a tally; *"both were gates that failed open, both now fail closed — that is the T5 move"* is the same fact carrying what it taught. **This is the audit's only opportunity to reward work rather than catalogue failure**, and it lands better than praise because it is a description, not a compliment.

**Never manufacture it.** Nothing fixed means nothing to say — no *"good effort"*, no *"encouraging progress"*. A run that congratulates an unchanged repo has spent the credibility it needs for the twenty-four findings behind it. **The acknowledgement is earned by evidence or it is not made.**

**This is the fastest good news the audit can give**, and it arrives in the first minutes instead of the last. A reader who fixed things since the last run deserves to hear it before they spend half an hour learning what they missed — and it is the one moment the audit rewards effort rather than cataloguing failure.

**No prior report, no phase.** Do not invent a baseline, and do not report `0 fixed` on a first run — there is nothing to have fixed.

### While research runs, the orchestrating context works the cheap checks

**A subagent returns everything at once, so a finder cannot stream.** That is architectural: an eight-minute research pass is eight minutes of silence no matter how the prompt is written. The fix is not to make the finder chattier — it is to stop the orchestrating context idling while it waits.

**The table appears with the first row, not when the finders return.** A run announced *"presence checks are in"* and showed nothing, because the table was specified to arrive with the research pass — so findings that had already landed had nowhere to sit. **A streamed finding that is only counted has not been streamed.** The table opens as soon as there is one row in it and grows from there.

**Class P is a glob.** *Is there a `CLAUDE.md`, a `.claude/settings.json`, a CI workflow, a test command, a coverage gate* — these resolve in seconds and need no agent. **Run them here, in the gap, and add each to the claims table as it lands.** The reader watches rows appear from the first seconds instead of at minute eight.

**Tell the finder to skip Class P.** Split the work by *cost*, not only by lens: the instant checks belong to whoever is otherwise waiting, the expensive cross-file reading to the agent with the budget for it. Duplicated work would be deduped at pooling anyway, but paying for it twice is avoidable by saying so in the prompt.

**Streamed rows are candidates like any other.** They arrive `⏳`, they go to the verifier with everything else, and an absence found by glob is exactly the kind of claim §Pass 3 exists to narrow — *"no `.claude/settings.json`"* is refuted by one at a path the glob missed. **Nothing shipped here bypasses fact-check**, and the row resolving to `✗` later is the system working.

**This does not make Class P the audit.** §The distinction that makes this an audit and not an inventory still holds: presence is the cheap half, and a run that reports only what streamed here has done the inventory and stopped. It is filling dead time with the easy findings so the expensive ones have somewhere to land.

*If that is still too quiet, the next lever is chunking research into several shorter agents so results arrive in waves — but that multiplies the per-agent context cost, and it should not be paid until the free option has been tried.*

### Pass 2 — pooling, and what agreement is not

Merge on the **key** (`<check>@<location>`). Then:

- **Same key, same claim** → one finding. **Agreement is not corroboration.** Two finders that took the same shortcut reach the same wrong answer — the false `edge-tts` finding, the gitlink read as an empty file, and the blind-spot violation would each have been produced by both lenses identically. Never write *"both passes confirmed"*; it converts a shared method error into manufactured confidence.
- **Same key, incompatible claims** → mark `conflict`. This is high-signal and goes to the verifier **first**, but conflict sets *priority*, never *eligibility* — pass 3 verifies everything either way. A conflict that survives verification is often itself the finding: *"two passes read this file differently; the ambiguity is the problem."*

### Pass 3 — the verifier, for precision

**It re-derives from the tree. It does not review the finders' reasoning** — reviewing reasoning inherits the error that produced it. Hand it the claims and their cited locations, nothing else. This is exactly what the review that produced this design did, and why it worked.

Two claim types, falsified two different ways:

| Claim | How to falsify |
|---|---|
| **Quote claim** — *"`file:24` says X"* | Open the file **in full context**, far enough around the line to see what it belongs to. A report quoted `"/Users/alexey/.local/bin/edge-tts";` as a hardcoded path; the line above was `process.env.EDGE_TTS_BIN ||`, making it the fallback and the finding false. **A quote beginning mid-expression is not evidence.** |
| **Absence claim** — *"nothing reviews a diff"* | You cannot open a file that isn't there, so check it against the **scope declaration** instead. An absence asserted inside a declared blind spot is refuted on its face: that report declared `~/.claude/` invisible, then rated the claim `Confirmed` against eight subagents living there. |

It applies the checks in §Gate 1 and returns one verdict per finding:

| Verdict | Effect on what ships |
|---|---|
| **Holds** | Ships as written. `Confirmed` is permitted only here |
| **Misstated** | Ships **corrected**, downgraded to `Probable`, with the correction applied — not the original claim |
| **Over-scoped** | Renarrowed to what the evidence supports, confidence dropped. Don't delete a finding that survives at a smaller scope |
| **False** | **Cut.** It does not appear in the report, not even as an Observation |

The verifier **may not add findings.** Anything it notices in passing goes to Observations or open questions, marked unverified — its own additions would be the one thing in the report nobody checked.

**Then the orchestrating context writes both files.** Writing is never delegated: the report's voice, trend keys, and cross-finding compounding all need the whole picture.

### Say something at each pass boundary

A run is half an hour or more, and between spawning the finders and writing the report there is nothing to look at but a token counter climbing past 300k. **Four lines, one at each state change, each carrying a fact rather than a reassurance:**

The display is **one block, described in §Show the candidates below**. This section says *when* it is emitted and *what has changed* by then — the block is the only mechanism, so nothing here prescribes a second stream of prose beside it.

| Emit when | What has changed in the block | Plus one line |
|---|---|---|
| setup agreed | strip shows `✓ setup`, shape and theme resolved | — |
| re-checker returns *(early)* | `✓ re-check` | `Re-checked last run's 7 Highs: 3 fixed, 4 still open.` |
| finders return | `✓ research`; the finder's rows join the table, every one `⏳` | `19 candidates, 1 conflict.` |
| pooling done | `✓ cross-check`; a conflicted row resolves early | Name the file and who was right: `site/eslint.config.mjs exists (465 bytes) — the absence claim is false.` |
| *(`--quick` only)* | `· cross-check` stays unfilled | `One lens, so nothing to cross-check — every claim still goes to the verifier.` |
| verifier returns | `✓ fact-check`; every `⏳` row becomes `✓` or `✗` | `15 hold · 2 corrected · 2 cut.` |

**Every number in that column is one the run already has.** No progress bar, no estimate, no *"working on it…"* — the runtime already draws a spinner, and a second one would say less than the first.

### Every block ends by saying what it is waiting for

**The block is a snapshot; the gaps between them are long.** A reader who has just been handed `4m · 102k` watches that figure stay frozen for ten minutes while the runtime's own counter climbs underneath it, and has no way to know whether that is normal or whether the run has died. A run was observed doing exactly this, and the reader's question was *"what is happening now?"*

**So close every block with the next event, named:**

> Now finding what's new — the research pass is still reading. Next update when it returns.

**Name the thing being waited on and what will end the wait.** Not *"this may take a few minutes"* (an estimate, and they are banned) and not *"please wait"* (which adds nothing to a spinner). **The reader needs to know that silence is the expected state**, and roughly what breaks it.

**This matters most before `research` and `fact-check`** — the two long phases — and before `report`, where the orchestrating context is writing and no agent activity appears on screen at all. Those three silences are where a run looks hung, and each costs one clause to explain.

**The conflict line is the most valuable and the easiest to skip.** It is the only moment where the user sees the architecture do the thing it exists for, and it costs one sentence. A run that resolves a conflict silently has hidden its best evidence that the report can be trusted.

### Show the candidates as they resolve — pending, then confirmed or cut

Ten more minutes of verification is easier to wait through once there is a sign the wait is buying something. **List the top candidates when the finders return, each marked unverified, and update each one as the verifier settles it** — the pattern a test runner uses, for the same reason.

**One block, re-emitted whole at each boundary.** A terminal cannot repaint, so every update is a fresh copy and the old ones scroll up as history — which is the point: the reader can look back and see a row change its mind.

**The strip goes last, under the content.** It is a status line, and a status line belongs where the eye stops — the block is followed by minutes of silence, so whatever sits at the bottom is what the reader stares at while waiting. A run put fifteen lines of re-check prose *below* the strip and the reader's last view was text about a phase that had already finished; their words were *"I am missing a redrawn progress with phases after the last sentence."*

So each block reads: **what just happened**, then the **claims table**, then the **strip**, then the **one line naming what it is waiting for**. The last two lines on screen are always *where the run is* and *what will end the wait*.

The strip carries the steps and the running cost:

> *(what just happened — the re-check result, a resolved conflict, the verifier's tally)*
>
> | Tip | Claim | Where | Status |
> |---|---|---|---|
> | [3.5](https://agentic-engineering.guide/tier-3#tip-3-5) | Instruction layers disagree on "done" | `CLAUDE.md` + 5 skills | ✓ **High** |
> | [4.1](https://agentic-engineering.guide/tier-4#tip-4-1) | Test gate only bites after a push | `ci.yml` | ✓ **High** |
> | [4.1](https://agentic-engineering.guide/tier-4#tip-4-1) | eslint config missing | `site/` | ✗ cut — the file exists (465 B) |
> | [3.2](https://agentic-engineering.guide/tier-3#tip-3-2) | Worktree entry tracked in git | `.gitignore` | ⏳ |
> | [6.2](https://agentic-engineering.guide/tier-6#tip-6-2) | No versioned agent definition | `.claude/agents/` | ⏳ |
> | | *…14 more* | | |
>
> **Harness audit · krivitskydotcom** — Standard · 2 finders + verifier · light
> `✓ setup → ✓ re-check → ✓ research → ✓ cross-check → ▸ fact-check 12/19 → · report` · 12m · 287k
>
> Verifying each claim now. Next update when the verifier returns.

**Name the phases in the reader's words, not this file's.** *Finders*, *pooling* and *verifier* are the vocabulary of the design; nobody watching a progress strip knows what pooling is. The strip shows five phases, and each says what is happening to the repo rather than which agent is running:

| Shown | Is | Means |
|---|---|---|
| **setup** | flags + confirmation | what shape was agreed, before anything spawns |
| **re-check** | pass 1b · re-checker | re-testing last run's open issues — skipped when there is no prior report |
| **research** | pass 1 · finders | reading the repo and collecting candidate claims |
| **cross-check** | pass 2 · pooling | comparing what the lenses found, resolving disagreements |
| **fact-check** | pass 3 · verifier | re-opening the file behind every claim, trying to break it |
| **report** | writing | both files land in `harness-audits/` |

**`fact-check` carries a counter — `fact-check 12/19` — because it is the long one.** It is the phase where the user has already seen the candidates and is waiting to learn which survive, and it is the only phase whose progress is a number the run actually knows.

**Under `--quick` there is one lens, so `cross-check` has nothing to do — show it, unfilled, and say why.** Deleting the phase would be worse: the reader who compares this run against a Standard one should be able to see *which step they traded away*, and the strip is the only place that shows it. **The line that matters is that verification is unaffected** — one finder still sends every claim to the verifier, so the trade is coverage, never rigour. A run that quietly drops a phase has hidden the cost of the option the user chose.

### The strip closes every message; the table only moves at boundaries

**These are two things with two different costs, and bundling them was a mistake.** The strip is two lines. The claims table is up to seven, plus whatever content the boundary carries.

| | Emitted |
|---|---|
| **The strip** — identity, phases, meter, and the line naming what it waits for | **at the end of every message this skill sends during a run**, without exception |
| **The claims table** — and the content above it | only when a boundary actually changed something: setup, re-check, research, cross-check, fact-check |

**A run sent *"Presence checks are in. Now waiting on the two reading passes"* with no strip beneath it**, because that moment is not one of the boundaries — so a reader who had just been given a phase display was shown a bare sentence and left to wonder whether the display still applied. **Any message without the strip under it is a message that abandons the reader mid-run.**

Two lines is not a token sink. Repeating the full table on every message would be, which is why only the strip repeats.

**Boundaries stay at five blocks.** One per verified claim would bury the report under its own progress; that rule was right, it was just being applied to the cheap half as well as the expensive one.

**The strip is the steps, the table is the claims.** Keep them apart: a reader glances at the strip to see *where the run is*, and at the table to see *what it found*. Merging them produces a table where half the rows are machinery.

**Cap the table at five rows plus a `…N more`.** Every displayed row must reach a terminal state (see below), and twenty rows cannot. Order by the finders' proposed severity — but **display severity only once verified**, because a `High` on a `⏳` row is the settled half of an unsettled claim.

**Three status values, and the third earns its width:** `⏳` · `✓ <severity>` · `✗ cut — <one clause saying why>`. The cut reason is the most informative cell in the table and the one most likely to be trimmed for space. Trim the claim text instead.

**The first column is the cited tip, linked — not a row number.** A row index is decoration; the tip is both a stable identifier *and* somewhere to go. Every finding already carries a tip citation, so this costs no extra work and turns ten minutes of waiting into the best reading moment the guide ever gets: the reader is looking at a real gap in their own repo and can go find out why it matters, instead of browsing a ladder cold.

Link the live guide, `https://agentic-engineering.guide/tier-<T>#tip-<T>-<N>`, exactly as §Method requires everywhere else.

**Verify the anchor before printing it here too.** `rg '<a id="tip-6-2">' ${CLAUDE_PLUGIN_ROOT}/guide.md` — **no anchor, no link.** A dead link in the one place the reader is most likely to click is worse than a bare tip number, and the rule that governs citations in the report does not stop applying because the surface is a progress table.

**A tip on a `⏳` row is fine, and on a `✗` row it stays.** The claim may die; the tip that made it worth checking was still real. Severity is withheld until verification because it is a judgement about *this* claim — the tip is not.

**When several rows cite one tip, that is signal, not repetition.** Three claims all pointing at 4.1 says the gap is one gap wearing three faces, which is exactly what §1's lead has to say later. Do not dedupe the column to make it look tidier.

### Say what the audit looks for, once, while it looks

**A user thirty minutes into a real run asked *"what is this audit? common issues it finds?"*** — which is the run's own fault. It had shown them agent names, tool counts and a token meter, and never once said what it was for.

So the block that appears when research finishes carries **one short paragraph, once**, naming the shapes it hunts. Absences are the cheap half and everyone expects them; name the other half:

> **What this is looking for.** Not "you're missing a file" — that half is easy. The valuable findings are where the setup *looks* complete: two instruction files giving opposite orders · a rule written as NEVER with nothing that could catch a violation · a gate that exits clean when it couldn't run · the command you're told to run not being the command CI runs · reference material in the file that loads every session, crowding out the real rules.

**Then, if the claims already show it, say so:** *"Your repo has four of those five."* That single sentence is the moment the reader stops watching a tool and starts reading about themselves — and by then the run has the evidence to say it honestly.

**Once, and never again.** It is orientation, not a lesson: a paragraph on the second block and nothing on the third or fourth. A run that re-teaches at every boundary is a run that has confused the reader's attention with its own.

**This is the same content the tip links serve, at a different altitude.** The paragraph says what kind of thing goes wrong; the per-row links say what to do about the specific one. Neither replaces the other, and both cost almost nothing next to a thirty-minute wait.

### Three lines that show the reader their repo, not the machinery

The strip shows agents, phases and tokens — all of it about the audit. These three are about *them*, and each costs one line at a boundary that is already emitting one.

**Open with the delta, when there is one.** A repo with a prior report gets this in the *first* block, before any finding exists:

> Last audit, 25 Jul: 16 issues, 5 High. Let's see what moved.

**This is the retention line and it is currently buried in §4 of a document nobody has opened yet.** The audit's product is not a report — it is the difference between two of them, and a reader who never sees that difference has no reason to run a third. Close the loop at the end: *"5 fixed since 25 Jul, 3 still open, 16 new."*

**But it may not claim a fix count — only §Pass 1b may do that.** A run opened with *"you've since shipped `15207ce` closing three of them"*, read off the commit; the re-checker then tested them and found **two**. Commit messages describe intent, and intent overshoots. **Say what is observable without opening a file** — that commits have landed since — and let the re-check supply the number a minute later with the files behind it.

> ✅ *"Last audit, 27 Jul 11:28: 24 issues, 7 High. You've shipped since — let's see what actually moved."*
> ❌ *"…and you've since shipped `15207ce` closing three of them."*

The second reads better and is wrong, which is the whole reason this pass exists.

**Say one thing the repo does well, at cross-check.** The scorecard's credit line is the only place the report says anything good, and it lands half an hour in:

> Worth saying: 561 commits, median two files — T5 checkpointing already holds.

One line, drawn from what the finders actually counted, never invented. **It changes the shape of the wait from *how bad is this* to *here is where you stand*** — and it is what makes the criticism land instead of bounce. A run that lists twenty-four problems and never once says what works has written an accusation.

**Show where the gaps cluster, at fact-check**, once the tiers are known:

> Clustering: T3 (9) · T4 (7) · T5 (5) · T8 (1).

**That histogram is the most transferable thing the audit produces.** A specific issue is about this repo; the shape of the distribution is about how the reader works, and it will look similar in their next one. It also previews the lever honestly — the reader can see T3 leading before §1 says so, which makes the verdict feel derived rather than pronounced.

**All three are facts the run already holds.** None requires an extra pass, an estimate, or a judgement it has not already made.

**Carry elapsed time and tokens in the strip** — the only place the user watches cost accrue against the estimate they agreed to. *"12m · 287k"* against a quoted *"38m · 520k"* says *on track* without anyone claiming it.

**The token figure must be on the same basis as the estimate, or it is noise.** Count **every pass** — each finder, the verifier, and this context — not the orchestrator's own slice. A run showed `1m · 34k` while its finder was still working: the finder's ~120k had not landed, so the number was a third of the truth and would have stayed flat for ten minutes before jumping. A meter that cannot be compared to the quoted figure fails the only job it has.

**Subagent cost is unknown until the agent returns.** That is a fact about the runtime, so state it rather than hiding it:

> `✓ setup → ▸ research → · cross-check → · fact-check → · report · 1m · 34k + 1 finder running`

**Then drop the qualifier the moment it resolves** — `12m · 287k` once every spawned agent has reported. **Never print a bare total while an agent is outstanding**; a number that silently excludes the largest contributor is worse than no number, because it reads as reassurance.

**Elapsed time needs no qualifier** — it is wall clock and always true.

**The user is a better verifier than the verifier, for their own repo.** Shown *"eslint config missing — pending"*, someone who works there says *"no it isn't"* in two seconds, faster and more reliably than a subagent re-deriving it from scratch. Withholding the claim to protect them from it also denies the run its fastest available check.

Four rules keep that from becoming a liability:

| Rule | Why |
|---|---|
| **The state marker sits on every row, never in a header above them** | Rows get read one at a time and scroll apart. A caveat twenty lines up is not attached to anything. |
| **A pending row carries its location but never a severity** | Severity is assigned after verification. A `High` on an unsettled row is the settled part of a claim that has not been settled. |
| **Every pending row must reach ✓ or ✗ in the output** | A row left ⏳ when the report lands reads as *"we forgot"* or, worse, as quietly true. Cap the list at about five so this stays possible. |
| **Cut rows stay visible as cut** | Deleting a falsified row hides the best evidence the run has. |

**The ✗ line is the payoff, not the embarrassment.** Showing a candidate and then killing it in front of the reader is the strongest demonstration available that verification is real rather than a step the report claims to have run. **A run that lists candidates and then goes quiet has spent the trust without repaying it.**

**The list is progress, never the record.** It scrolls; the report does not. Nothing may appear only in this list — if the verifier confirms it, it is in the report, and a reader who walked away and came back should lose nothing by having missed the live view.

**Nothing here loosens §Pass 3.** A `False` verdict still means the finding does not appear in the report, not even as an Observation. Having shown it live earns it a `✗` row and a sentence in §6 recording what was cut — never a place among the findings.

### Keep the subagents' tool calls legible

**Nothing `cd`s — not the subagents, and not the orchestrating context.** Everything already starts in the repo root. Runs have been observed emitting `cd /Users/alexey/src/aidy/repos/<repo>` before every command, which spends the visible width of the line on a constant, and then the actual command is what gets truncated. The reader is left with a path they already know and an ellipsis where the evidence was.

**This binds the orchestrating context too.** It now runs the presence checks itself while research is out, and a run was observed prefixing each of those with `cd /Users/alexey/src/aidy/repos/<repo>` — the same waste, on the line the reader is actually watching, since these are the only tool calls visible during the wait.

**Ask for short tool descriptions too.** A finder's Bash calls are the only window into what it is doing while it runs; `rg for hook definitions` tells the watcher something, and a truncated multi-line `echo` banner does not.

### Name each subagent after the phase it belongs to

The runtime prints every subagent's description directly beneath the strip, so the two are read together. A run showed `▸ research` in the strip and `Agent(Enforcement lens finder)` on the next line — **two vocabularies for one activity, stacked, with nothing connecting them.** A reader who has just been taught five phase names is then shown a word from none of them and cannot tell whether it is the same step or a different one.

**Every subagent description begins with its phase name:**

| Phase | Agent description |
|---|---|
| re-check | `re-check · last run's open issues` |
| research | `research · what's declared vs what actually holds` · `research · contradictions between files` |
| fact-check | `fact-check · try to break each claim` |

**The phase word does the joining; the clause after it says which pass this is.** Under `--quick` there is one research agent, so it carries both jobs: `research · what holds, and what contradicts`.

**Lens names never appear here either.** `Enforcement` and `Coherence` are this file's labels for bundles of check IDs — useful when spawning, meaningless to whoever is watching. The same rule that keeps `pooling` out of the strip keeps it out of the agent list.

**Only three of the five phases spawn anything** — `re-check`, `research`, `fact-check`. `cross-check` and `report` run in the orchestrating context, so **the screen shows no agent activity at all while they work**, and those are the two phases most likely to look hung. They are also, not coincidentally, where a reader has most recently been promised something: the candidates have just appeared, or every claim has just resolved and the file is being written.

**So the strip is the only signal during those two, which is why the block must be emitted at both boundaries** — and why the report phase says where the file will land rather than going quiet until it exists.

---

## Flags

**Determine the mode before spawning anything.** Two ways a user arrives, and both must resolve to exactly one row of the table below:

| How they invoke | Resolve by |
|---|---|
| **Slash command** — `/pape:harness-audit --deep` | Read the literal flag. It wins over everything, including contradicting prose |
| **Natural language** — *"audit my harness"*, *"is this repo agent-ready"* | Map intent: *quick · fast · just a look · rough* → `--quick` · *thorough · deep · comprehensive · don't miss anything · be exhaustive* → `--deep` · **anything else, including a bare request, is the default** |

**Never upgrade *silently*.** A plain *"audit this repo"* may pre-select two finders, and *"don't miss anything"* may pre-select four — but neither spawns anything until the user has seen the shape and its cost and said go. The word doing the work is *silently*: mapping intent is fine, spending on it unasked is not.

### Say what you are before you touch anything

**Introduce yourself before doing any work.** A run was observed reading two files, listing a directory and running three shell commands *before* it said what it was — so the user's first information about the skill was a tool-use summary.

**One exception, and only one: locating a previous report.** A single glob of `harness-audits/` costs nothing and buys a better opening — *"There's a run from earlier today"* tells the reader more than *"checking for a previous run"*, and they were never going to notice the intervening second. **Reading that report's contents waits until after the introduction**; so does everything else.

The test is what the user sees first. A directory listing that resolves instantly, then the introduction, is fine. A tool-use summary standing alone at the top of the transcript is not.

```
harness-audit v0.34 · from the Professional Agentic Product Engineering (PAPE) guide

I read the agent setup checked into this repo — instruction files, skills,
hooks, permissions, tests, CI — and rate it against the guide's eight tiers.
I change nothing: read-only, apart from the report I write to harness-audits/.

Checking for a previous run here, then two questions before anything spawns.
```

**Name the version, and read it from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`** — the same source the report cover uses. A user comparing two reports, or reporting a bug, needs to know which version produced what, and the cover is too late: it arrives half an hour in, and only if the run finishes.

**Say what happens next, in one clause.** Not a plan, not a numbered procedure — *"checking for a previous run, then two questions"* is enough to tell someone the tool calls they are about to see are not the audit starting without them.

### Confirm before spawning — every run

**This is expensive and slow, and how expensive is not predictable.** Observed Standard runs came in at 26 and 38 minutes; a `--quick` markdown-only run is a different animal again, and repo size moves it as much as depth does. That is far past the point where committing someone silently is acceptable — so the introduction is followed by a two-line frame and one `AskUserQuestion`. Short: they came for an audit, not a form.

**Never predict a duration or a token count.** Every figure this file has carried was wrong: it said 5–10 minutes, then 15–20, then 18 — against real runs of 26 and 38. **An estimate that undershoots is worse than none**, because the reader budgets against it, and the correction arrives as a broken promise rather than as information. Say it is slow, recommend backgrounding, and let the live meter report what is actually happening.

```
Harness audit — rates this repo's agent config against the eight tiers.
Read-only; writes to harness-audits/. Last run here: 38m · 520k tokens.
```

Then **one** `AskUserQuestion` call carrying **two** questions, so it is a single interaction:

| Question | Options | Default |
|---|---|---|
| **How deep?** | *Quick look* · *Standard* · *Thorough* | pre-select whatever the flag or the phrasing implied — **`Standard` when nothing did** |
| **What output?** | *Markdown only* · *Markdown + light HTML* · *Markdown + dark HTML* | `Markdown + light HTML`, or whichever theme `--theme:` named |

**Format and theme are one question, not two.** Theme is the least consequential axis in the run and asking it separately spends a decision on it. Folded in, it is only asked where it means something — and the *Markdown only* path never has to answer it at all.

**Say what `Markdown only` buys, in the option label: about a third off the run.** That is measured, not estimated. The write phase emits roughly 13k output tokens of markdown and 22k of HTML, generated serially by one context, so the HTML is about 62% of it — and ~15% of the HTML is the stylesheet, transcribed verbatim. A reader who wants the findings and not the artifact should not pay half an hour for a layout pass.

**Recommend `Standard`, and say why it is the recommendation** — the reason is not "more coverage", and stating it wrong oversells the other two:

| Option | What to tell them |
|---|---|
| **Quick look** | One lens. Every finding is still verified, so nothing unchecked ships — you just see less of the repo, and **no finding gets flagged as contested**, because there is no second reading to disagree with it. |
| **Standard — recommended** | Two lenses read independently. **Where they disagree, the clash itself is the signal**: pooling flags it and the verifier takes it first. A real run had one finder report `site/eslint.config.mjs` missing when it exists — the second lens is what turned that from a shipped finding into a caught error. |
| **Thorough** | Four lenses, adding hygiene and context-economy — twice the finders, so materially more time and spend. Worth it when you want the sweep exhaustive, not when you want it right. |

**Do not claim the second finder is what makes findings true.** The verifier does that, and it runs in every mode. What the second lens buys is *disagreement* — a contested claim surfaced before the verifier sees it, and prioritised when it gets there. Say that, not more.

**Pre-select, don't interrogate.** A user who typed `--deep` has answered the first question; show it answered and let them confirm with one tap. The interview exists to make the spend visible, not to make them specify it twice.

**Ask for intent, never for a number.** *"Quick look / Standard / Thorough"*, not *"how many finders?"* — nobody's first question is how many agents they want, because nothing has told them what a finder is. The mapping to `--quick` / default / `--deep` is this skill's job.

**Say the cost structurally, in the option labels** — *"one lens instead of two"*, *"twice the finders"*. **That is a fact about what runs, not a prediction about the clock**, and it is the honest way to make the trade visible where the choice is made. A number nobody can stand behind belongs nowhere; a number two paragraphs above the buttons belongs nowhere either.

**Say what it writes before it writes it.** Two files into `harness-audits/`, and nothing else touched. That is the only write this skill makes, and it lands in the user's repo — it is the real consent moment, more than the finder count is.

### The estimate comes from the last run, not from this file

**Glob `harness-audits/*-report.md` and read the `cost:` line off the most recent cover.** A number measured in *this* repo beats any figure written here, and it improves every run. **Where there is no prior report, say nothing about duration.** Not a range, not a hedge, not *"a few minutes"*. A first run has no data behind it, and inventing one is how every wrong figure in this file's history got written. *"First run here, so no baseline — it takes a while; `ctrl+b` if you'd rather not watch"* is the whole of it.

**A hardcoded estimate in this file will be wrong.** An earlier version of this section claimed 5–10 minutes; the first real run took over 20. Numbers about a run belong in the record a run writes, not in its instructions.

### Then emit the block — it *is* the confirmation

**The moment the answers come back, emit the progress block and nothing else.** Its header line already carries the resolved config, so a separate *"Running Standard — 2 finders + verifier…"* sentence says the same thing twice:

> **Harness audit · krivitskydotcom** — Quick look · 1 finder + verifier · markdown only
> `✓ setup → · re-check → · research → · cross-check → · fact-check → · report`
>
> This takes a while and only reads, so `ctrl+b` backgrounds it safely. Spawning both passes now.

**A run given both forms emitted the sentence and skipped the block**, then produced the strip two minutes later once the agents were already out — so the reader spent the opening with no phase display at all, which is the one moment it is most needed. **One mechanism: the block is the confirmation.**

The header echoes the **resolved** config, so a misread is catchable while it is still cheap.

**Describe the lenses, never name them.** *"1 finder (Enforcement)"* tells the reader nothing — `Enforcement` is this file's word for a bundle of check IDs, and it leaks the same way `pooling` and `finders` did before the strip was rewritten. Say what the pass is doing: *"one pass, reading what's declared against what actually holds"*. Under Standard, *"two passes reading independently — one for what holds, one for what contradicts"*.

**Recommend `ctrl+b`, don't merely allow it.** Twenty minutes of watching a spinner is not a thing to leave to the user to figure out; the runtime's own `(ctrl+b to run in background)` is an affordance, not advice.

**No preamble before any of this — including a plan.** The introduction is the first thing said; the frame is the second. Nothing precedes them.

> ❌ *"I'll run the harness audit on this repo."* — restates the command back at the person who typed it
> ❌ *"I'll start with the frame, then confirm the shape before spawning anything."* — narrates the procedure it is about to perform

The second is the one that keeps returning, because it reads as helpful orientation. It is not: the reader learns the shape from the frame one line later, and announcing an intention to do a thing is never worth a line when the thing itself is the next line.

The `auditor` field on the report cover carries the resolved shape, so the mode is also verifiable after the fact.

| Flag | Finders | Gauntlet | Budget | Verifier |
|---|---|---|---|---|
| *(none)* | 2 — Enforcement, Coherence | rendered | ≤20 reads each | **always** |
| `--quick` | 1 — **both lenses in one pass** | dropped | ≤12 reads | **always** |
| `--deep` | 4 — adds Hygiene, Economy | rendered | ≤25 reads each | **always** |

**`--theme:light` · `--theme:dark`** is orthogonal to the three above and combines with any of them. It changes the report's appearance and nothing about the audit.

| Value | Build |
|---|---|
| `--theme:light` *(default)* | inline `report.css` |
| `--theme:dark` | inline `report.css`, then `report-dark.css` after it |

**Both themes are named.** Not a bare `--dark` — a boolean flag leaves the other theme with no way to ask for it, so the report can only tell a reader to *remove* something rather than to request what they want.

**The report says which theme it is and how to get the other**, in one line under the cover — *"Light theme. For the dark version, re-run the audit with `--theme:dark`."* Whoever opens the HTML is often not whoever ran the skill, and a frozen record cannot offer a toggle.

**Cheap mode reduces recall, never precision.** `--quick` buys speed by looking at less, never by checking less — there is no flag that skips verification, because unverified findings are the failure this design exists to prevent. A user who wants it faster gets fewer lenses and the same standard of evidence.

---

## Write it plainly

**The report's default register drifts abstract, and abstract prose reads as authoritative while saying nothing.** A shipped scorecard note read: *"Two instruction layers, neither authoritative and both resident, with no step that reconciles them when one changes."* The reader's verdict was *"I don't understand this."* They were right — three nominalisations, no picture, nothing a person could point at.

> ❌ *"Two instruction layers, neither authoritative and both resident, with no step that reconciles them when one changes."*
> ✅ *"`CLAUDE.md` and five skills both hold rules. Neither one wins, both load every session, and when one changes nothing updates the other."*

Same claim, same length, and the second one can be pictured.

- **Name the thing.** `CLAUDE.md`, not *"the instruction layer"*. Five skills, not *"the extension surface"*.
- **Verbs, not nominalisations.** *"nothing updates the other"* beats *"no reconciliation step exists"*.
- **One idea per sentence.** A clause stack joined by commas is where meaning goes to hide.
- **Words to distrust in your own draft:** *surface · layer · resident · authoritative · reconcile · instance of · structural · leverage · posture · in practice.* Each is sometimes right and usually a sign you stopped at the first phrasing.
- **No compressed triplets.** *"right context, proof it's done, a way back"* — the reader asked what "a way back" meant. It meant rollback. Three noun phrases in a row read as cadence, and cadence hides that one of them stopped being a description. Write the sentence: *"giving the agent the right context, checking that work is actually finished, and being able to undo a bad change."*
- **No aphorisms.** *"You can't harden a gate you don't have."* *"Climb only as far as the work needs."* They sound settled and carry nothing a reader can act on. Cut them; the sentence before them was already finished.
- **Never use a severity word as a bare noun.** *"every High below"* — High what, and below where? The scorecard opens the report, so a reader meets the severity scale a section later. Write *"all five high-severity issues."* The same goes for `Confirmed`, `Probable` and `Not assessed`: they are labels in a table, not nouns in a sentence.
- **"Below" must point at something on the same screen.** Once sections moved, half the cross-references pointed a section away. Name the section or name the thing.

This applies everywhere — scorecard notes, summary, issue prose, backlog items. **Evidence gets to be technical; the sentence around it does not.** `LINK_CHECK_SKIP=1` is precise and belongs; *"disables a deterministic verification pathway"* is fog around it.

---

## Findings

Every finding gets a display ID — **`ISSUE-1`, `ISSUE-2`, …** — unpadded, assigned in table order. And this shape; the middle three are what separate a report from a linter.

**Sort by severity, then by tier ascending — in the issues table and the backlog alike, and check the backlog against §1 before shipping.** A run shipped a §1 reading *"the next lever is T3"* above a backlog opening `T5 · T5 · T4`, with the first T3 item fourth. Both halves were defensible on their own — the backlog had ordered itself by cost, cheapest-and-loudest first, and said so in its own lead — and together they told the reader two different things to do first. **The lever is the report's single most actionable sentence; a backlog that opens somewhere else has overruled it silently.**

**The check is mechanical: the first backlog item must sit on the rung §1 named.** Where it does not, one of the two is wrong — fix that, don't reword around it. Severity-then-tier produces the right order by itself, because the lever is by definition the lowest rung that doesn't hold, so its Highs sort above every other High.

**And §3's lead must describe the order it actually used.** The same run's lead promised *"items early on are cheap and stop something from lying to you; items later are larger reorganisations"* — a third ordering, matching neither the sort above nor the lever, and not consistently followed either. A lead that describes a different sort than the list below it is worse than no lead.

Severity alone interleaves rungs inside a band — a High on T3 sitting under a High on T5 — which contradicts the scorecard's lever and the backlog's order in the same document. The lower rung comes first because the higher one rests on it. **The backlog uses the same key**, and each backlog item carries its rung (`— T3 · ISSUE-1`) so the ordering is visible rather than asserted.

**Not `H-`.** An earlier version used it (for *harness*), never defined it anywhere, and put it one column away from a severity column containing **High** — so `H-013 · Low` read as a contradiction to anyone scanning the table. **A prefix that collides with a value in the neighbouring column is a bad prefix however defensible its etymology**, and an abbreviation the report never expands is a decoding tax on every reader to save four characters. Spell it.

| | |
|---|---|
| **Criteria** | The standard, stated positively — not "you're missing X". **Take it from the guide tip the finding cites**, so the bar is the guide's and not this pass's invention. A criteria line the audit made up is the first place a wrong finding hides |
| **Condition** | What is true, with `file:line` and an excerpt **quoted from the file read in full context** — never lifted from a grep hit. Where two files bear on one claim, read both and say what the pair shows; a contradiction between them is usually the better finding |
| **Cause** | *Why it drifted.* Almost always process, not ignorance: "the allowlist grew by accretion — each entry added to unblock one session, and nothing treats a permission change differently from any other config change." Guess honestly and say you're guessing |
| **Consequence** | What it costs in practice. Name the failure mode, not the rule |
| **Corrective action — now** | The smallest thing that closes it, with the literal lines to paste |
| **Corrective action — structural** | What stops it recurring |

### The finding asserts. The fix proposes. Keep the voices apart.

A report once recommended the wrong hook event with total confidence. The reader's verdict — *"trust the report's problem, not its wiring"* — is the whole design brief: when diagnosis and prescription speak in one voice, a wrong prescription discredits a correct diagnosis. Separate them and a bad fix costs only the fix.

**Every corrective action carries three things the finding does not:**

| | |
|---|---|
| **The requirement, stated before the mechanism** | *"The rule fires at push time; the gate must fire there too."* A reader can then accept the requirement and reject your mechanism — which is the point. Fuse them and they can only accept or reject both. |
| **The assumption it rests on, written as a refutable sentence** | *"This assumes `npm run verify` is deterministic outside CI — checked at `playwright.config.ts:38`."* This line is the actual control: you cannot write it without opening the file, and once written it can be proved wrong by someone who knows more than you. Unstated assumptions are the ones that ship. |
| **Its own confidence** | A `Confirmed` finding routinely carries a `Probable` fix. Say so: *"Fix: Probable — I have not run this against your dev-server setup."* Collapsing them into one number is how a solid diagnosis inherits a shaky prescription's risk. |

**Where the reader knows more than the audit, ask instead of answer.** A static review cannot see which server is warm on :3007, how long the suite takes, or which rules the team has already given up on. Turning those into questions — *"before wiring this into a gate, check how your Playwright config resolves the server outside CI"* — gets the right answer from the person holding it, and costs nothing when they already know.

**Ship runnable content, at the altitude you can defend.** This is not a licence to hand back homework — a corrective action with nothing executable in it is worthless. But the mechanism is the part this pass is most often wrong about, and the acting reader can check it in seconds where the audit could not. So the requirement binds, the lines illustrate, and the check that would falsify them is named. *"Baseline — confirm `X` before applying"* is worth more than a confident block of JSON, because the confident block is what shipped wrong twice.

### Write for a reader who can do better than you

**Design target: a report an agent with more context can trust and act on.** Whoever acts on this — a person who has worked in the repo for a year, or an agent that can run the suite, read every file, and try three approaches — is very often **better positioned than this pass was.** That sets the altitude for everything below. This audit is a budgeted, read-only, single-pass review; where it descends into specifics it cannot check, it manufactures exactly the claims a better-positioned reader will refute, and each refuted claim spends trust the sound findings needed.

**So state the standard, state what was seen, and mark the uncertainty — then stop descending.** Requirement-level statements anchored in a guide tip survive review; mechanism-level assertions are what get overturned.

The failure to avoid is a **ceiling**: hand an agent working JSON and it pastes the JSON. It will not look for the better mechanism, because nothing asked it to — and the one thing this audit was most confident about is the thing it got wrong.

So each corrective action makes the requirement the contract and the code the baseline:

> **Requirement:** the gate must fire at push time, run the same command CI runs, and not tax commits.
> **Baseline that meets it:** *(the literal lines)*
> **Better welcome:** if you can satisfy the requirement more cheaply or more robustly with what you can see from inside the repo, do that instead — the requirement is the contract, not this implementation.

And give them what they need to go past you. The `.md` twin's job is not "the same report, machine-readable" — it is a **briefing**, so it carries what the HTML doesn't need:

```
open-questions:
  - Does `npm run verify` complete in under 60s on a warm machine?
    Not measurable statically; decides whether a push gate is tolerable.
  - Are any of the 56 rules already known-dead? Killing them beats enforcing them.
  - Is `edge-tts` expected on PATH for other contributors, or is audio a solo task?
budget-hit: no — finders 18 + 14 of 20 each · verifier 21 of 25
cost:       18m · 340k tokens · 2 finders + verifier
```

**`cost:` is what the next run quotes back to the user**, so it is not optional bookkeeping — it is the input to the confirmation step in §Flags. Wall time from start to report written, total tokens across every pass, and the shape that produced them. Without it the next run has nothing to say but a guess, and the guess has already been wrong once.

**Open questions are not hedging.** Each one names something the audit genuinely could not determine and says what it would change. A question that would not change a recommendation is noise; cut it.

**Then say so in §6:** *"If you find a better solution than the one proposed, the finding is what mattered — take it."*

**The correction is altitude, not breadth.** Do not offer three options and let the reader choose — that is decision-dumping, and it is the same mistake as gating by tier. Climb *one rung* above the mechanism, state the requirement there, then commit to a single mechanism that meets it:

> ❌ *"Add a `Stop` hook running `npm run verify`."*
> ✅ *"The rule fires at push time, so the gate must too — that means `PreToolUse` matched on `git push`, the only event that fires there."*

Same one recommendation, one sentence longer, and now refutable. The failure it prevents is pattern-matching: *enforcement means hook* reaches for the hook in the tip's example instead of the hook the rule needs. Writing the requirement first forces the mechanism; skipping it lets the example pick.

Say it once in §6: **corrective actions are proposals; a finding stands even if its fix is wrong.**

**Say when findings compound.** *"Combined with ISSUE-1, the configuration reads as gated to anyone reviewing it, while in practice nothing blocks."* Two findings that multiply are worth more than their sum, and a reader who fixes one and not the other has fixed nothing. Look for these deliberately.

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

## The scorecard rates the guide's eight tiers

**The axis is the tier ladder, not the check catalogue.** `checks.md` categories stay where they are good — filing a finding — but the scorecard is indexed **T1–T8**, so a reader who sees a weak rung knows which part of the guide to open. Take the names from `guide.md`'s `## Tier N —` headings, never from a mirror:

`T1 Professional Prompting · T2 Shaping & Slicing · T3 Context Management · T4 Loop Until Done · T5 Checkpointing & Hardening · T6 Orchestration · T7 Fleet Ops · T8 Agent Execution Layer`

Each finding already cites a tip; the tip number gives its tier. **A finding that blocks two tiers counts against both** — a missing `.claude/settings.json` genuinely stops you doing T5's hardening *and* T8's permission work, and a rating reads as *"can this repo do this tier's work"*, not as a fault tally.

Rate each **Strong · Satisfactory · Moderate · Weak · Missing · Not assessed**, with a one-line note.

**This is not tier-gating.** `## Method` forbids inferring *how ambitious a repo should be* and withholding findings above an imagined ceiling — a claim about intent a repo cannot support. Reporting where the harness currently sits is an observation, and the guide's own *"which tier do you need?"* exists so the reader sets their own finish line.

### Recommend where to focus — from evidence, never from guessed intent

**Close the lead with a short "where that is, for this repo" paragraph.** Which rungs carry this repo's weight is the most useful thing the tier axis can produce, and leaving the reader to derive it from eight ratings wastes the axis.

Three conditions make it a recommendation rather than the ceiling `## Method` bans:

| | |
|---|---|
| **Built on what the repo shows** | *"All 561 commits are by one author and only three are merges, so work lands on `main` directly."* Countable. Not *"this looks like a side project"* — an earlier run guessed exactly that about a 561-commit live site and was wrong. |
| **Marked as an assumption** | Say plainly it is drawn from the repo's shape and can be wrong. The reader knows their own plans; the audit is offering a reading, not a verdict. |
| **Changes nothing that ships** | **State outright that no issue was withheld, renamed, or downgraded because of it.** Every issue is listed at its own severity regardless of which rung it lands on. The moment focus starts filtering findings, it has become the ceiling. |

Signals worth reading for this: author count and merge ratio (`git log --format=%an`, `--merges`), whether anything runs unattended, whether a push reaches production directly, whether skills already dispatch subagents. **Where a rung genuinely doesn't bite, say what it depends on** — *"nothing here runs unattended, so T7 has nothing to operate"* — never *"above your level."* That belongs in the rung's own note, not the lead.

**Name only the rungs that carry the weight.** A draft went on to say *"T7 has nothing to operate. T8 matters in one way only…"* — both of which are the table's own rows, in the table's own words, eight lines above the table. **The lead says where to look; every other rung speaks for itself in its row.**

### Name one next lever, and derive it

**Walk the rungs from T1 upward. The next lever is the lowest one not rated `Strong` or `Satisfactory`.** Name that rung and no other.

The rule falls out of the ladder itself: each rung rests on the ones below, so a weak lower rung caps everything above it. Working on T5 while T3 is broken is effort spent on a rung that cannot hold.

| Ratings | The lead says |
|---|---|
| T1 Satisfactory · T2 Satisfactory · T3 Weak · T4 Moderate · T5 Weak | *"T1 and T2 hold, so the next lever is T3. T4 and T5 are weak too, but both rest on T3, so it goes first."* |
| T1 Weak, anything above | *"T1 is the next lever"* — even if the interesting problems look higher up |
| Everything holds to where the work stops | Say so plainly; no lever is a real answer |

**Higher weak rungs get named as resting on the lever, never as parallel priorities.** A range — *"the weight sits on T3–T5"* — is not an answer to *what do I do next*, and it contradicts the sentence above it by implying T1 and T2 were skipped. **Where lower rungs hold, say they hold**; they were passed, not ignored.

**When the lever lands on T1 or T2, the fix is a person, not a file.** Those two rungs are how the operator prompts and shapes work — there is nothing to add to the repo, so the usual corrective action has nothing to act on and *"write better prompts"* is not one. Name the two things that do work, in one line: **the coach** (`/pape:agentic-coach`, catches it in the flow of real work) and **the tutor** (the guide repo's `CLAUDE.md`, which teaches the rung and reads real prompts to tailor it). This is the only place in the report where the recommendation is a tool rather than a change.

### The lead's whole order

`what this repo is` → `how it is doing` → `how it is rated and where the weight sits`. Roughly 130 words, three paragraphs.

Context comes first because it frames everything after it, and a draft that opened with the verdict and put the methodology second read as three disconnected blocks — the reader's verdict was that it did not hold together. Rating machinery is never the second thing anyone needs.

**Where a tier genuinely doesn't bite yet, say what it depends on** — *"nothing here runs unattended, so T7 has nothing to operate"* — never *"above your level."* That is `Not assessed` with a reason, and it is a real answer, not a gap.

### The note describes a condition, not an incident

**The failure to avoid: notes written as findings-in-miniature**, which turn the scorecard into another index of the same events.

> ❌ *"Four live contradictions between `CLAUDE.md` and the skills, one of which already produced a false 'done' in production."*
> ✅ *"Two instruction layers — `CLAUDE.md` and five skills — with no reconciliation step between them."*

The first is an event and belongs in the findings table. The second is a standing condition, and a rating is a rating *of* a condition. **Test each note: if it could be pasted into the findings table unchanged, it is written wrong.** Findings say what happened; the scorecard says what the repo is like.

### Every rung says what would lift it

A rating of a condition raises a question the report has to answer, and a reader asked it outright: *"T3 is Weak and there are three High T3 issues — is fixing those three all it takes?"* **Usually not**, and nothing in the report said so.

So each rung carries a third line beside `FOR` and `HERE`:

> **T3 · Context Management** — Weak
> **FOR** Give the agent the right context and tools, so it stops guessing.
> **HERE** Two instruction files and five skills hold rules on the same subjects. Neither wins, both load every session, and when one changes nothing updates the others.
> **TO LIFT IT** One layer wins, or a step reconciles them when either changes. Closing ISSUE-1, 2 and 3 clears today's contradictions — not the structure that keeps producing them.

**Name the condition that has to change, then say plainly whether the listed issues are sufficient.** They usually are not, and saying so is the difference between a rating and a score: a fault tally goes down when you fix faults, a condition does not change until the thing generating the faults does.

**Where the issues *are* sufficient, say that too** — *"closing ISSUE-7 lifts this; there is nothing structural behind it."* That is the cheerful case and the reader deserves to know which one they are in.

**Do not turn it into a fix list.** §3 owns the backlog. One sentence naming the structural change, one clause on whether the issues cover it, and stop.

**A rung with no findings still gets the line.** *"Nothing to lift — checked and it holds."* Silence there reads as an omission rather than a pass.

This matters most for tiers with **no** findings — those notes are the section's actual contribution, and they have nothing to restate. A tier where the audit looked and found the work already done should say so plainly; *"checked, and it holds"* is information the findings list structurally cannot carry.

**Never total them.** No overall score, no percentage, no averaged bar, and **no "you are at T4" sentence.** An earlier version drew a fill bar per group; the bars ended up identical and cheerful regardless of content, and a repo with excellent CI and no agent guardrails scored as healthy. **A gauge is read as a grade whatever the caption says** — so a rating may only ever appear per tier, next to the note that explains it, never summed and never collapsed into a level.

### Three non-ratings, not one

`Not assessed` was doing three incompatible jobs, and a reader could not tell them apart. Use the one that is true:

| Mark | Means | Test |
|---|---|---|
| **Not applicable** | This rung does not apply to this work — *"nothing here runs unattended, so there is no fleet to operate."* **Explicitly not a gap.** | Would the mature version of this repo still have nothing here? Then it applies |
| **Not assessed** | The audit did not reach the evidence. **Always name why** — *"consent for transcript access was not given"* is a different state from *"needs evidence this method cannot reach"*, and only the second is a limit of the audit rather than a choice | Could another pass have got this? Then say what it would take |
| **A real rating** | The audit looked and found the answer, **including when the answer is "nothing is there."** | Is this backed by a finding? Then it is assessed |

**The trap: marking a confirmed finding as `Not assessed` because the thing is absent.** A rung where delegation is dispatched from three skills but no agent definition is versioned has been *assessed* — the answer is that it does not hold. That is `Weak`, and a run once wrote `Not assessed` over exactly that, burying a Medium finding behind a non-rating. **Absence you looked for and confirmed is evidence, not a gap in evidence.**

Render the two non-ratings visibly but neutrally — they are answers, not footnotes, and a mark that whispers reads as a pass.

**Link every tier name to its chapter** — `https://agentic-engineering.guide/tier-<N>` — and the section's opening line to `…/climb-the-eight-tiers`. A weak rung that does not tell the reader where to read is the tier axis doing none of the work it was chosen for.

### The report never promises what it did not do

**A guarantee is addressed to a suspicion, and printing it is how the suspicion arrives.** Three separate lines were cut for this, all saying the same kind of thing to the wrong audience:

> ❌ *"That is a reading, not a filter: every issue below keeps its own severity."*
> ❌ *"Ratings are per tier, never totalled, and never collapsed into a level."*
> ❌ *"19 candidate claims · 15 hold · 2 misstated · 0 cut."*

Each states a rule this file already enforces at write time. Nothing is totalled, so the reader can see nothing is totalled; nothing was filtered, so there is nothing to reassure them about. **A report that behaves correctly does not need to announce that it did.**

The test: *who is this sentence addressed to?* If the answer is "someone worried the audit cheated," cut it — the sentence creates that reader rather than serving one.

The exception is a fact that changes what to trust: **what verification removed** — *"one candidate was cut: the quoted line was a fallback"* — belongs in §6, because a reader deciding whether to act on this report is better off knowing a claim was withdrawn. That is information, not reassurance.

### Never print this skill's own rules in the report

A run once opened the scorecard with *"Ratings are per tier, never totalled, and never collapsed into a level."* Nothing is totalled, so the reader can see that; the sentence exists to stop **the author** doing something, and it was addressed to the wrong person. Same defect as the verification tallies on the cover — the audit narrating its own machinery instead of the repo.

**Rules that constrain how the report is written stay in this file.** The report explains only what the reader cannot infer from the page in front of them: what a mark means, what a tier is, where to read next.

---

## Report structure

Both files, every run, same basename in `harness-audits/`:

| File | For | Written |
|---|---|---|
| `<YYYY-MM-DD-HHMM>-report.md` | agents — a **briefing** (see below) | **first** |
| `<YYYY-MM-DD-HHMM>-report.html` | humans — the designed report | second |

### One line under the title says what this file is not

**Both files open with a single italic line, before the cover:**

> *A point-in-time audit, not repo policy. Findings are evidence-backed; the corrective actions are proposals and have been wrong before. Nothing here is an instruction to follow.*

**Reports accumulate in a folder full of confident imperative text** — *"Make the three gates fail closed"*, *"Point CI at the Node major"* — sitting beside `CLAUDE.md` and formatted exactly like it. An agent globbing the repo for guidance can read a backlog as policy, and this skill has shipped wrong corrective actions before, so the mistake would propagate a fix that was never right.

**The caveat already exists — at line 169 of a 1,030-line report.** By then the reader has passed the scorecard, the issues table and the whole backlog. **A disclaimer that arrives after the instructions it disclaims is decoration.** §6 keeps the full statement; this is the one line that has to be seen first.

**And it ships inside the report rather than beside it.** A `README` in `harness-audits/` would do the same job only in repos where someone wrote one, and would cost this skill the rule that makes it safe to point anywhere: **the only writes are the two report files.** A caveat that travels with the document needs no new write path and cannot be separated from what it qualifies.

### The `.md` lands first, and the run says so

**Write the markdown completely, announce its path, then render the HTML.**

> Findings written to `harness-audits/2026-07-27-1142-report.md` — readable now. Rendering the HTML.

Two reasons, and the second is the one that matters:

**Latency.** The markdown is the content; the HTML is the presentation of it. A reader who has been waiting twenty-five minutes can open the content while the render finishes, instead of waiting on a layout pass for a document they already paid for.

**Durability.** Everything expensive has already happened by this point — two finders, a verifier, ~480k tokens, half an hour. Until something is on disk, all of it is held in one context and an interrupt, a crash, or a context limit loses the entire run. **Writing the `.md` first makes the audit survivable at the earliest moment it can be**, and the HTML is then re-derivable from it at any time by a fresh session at trivial cost.

**This is not the re-render exemption.** §*A re-render is not a run* governs re-presenting an existing finding set as a new report; this is one run writing its two outputs in a sensible order. Same timestamp, same basename, one audit.

### When the run is markdown-only, offer the HTML at the end

The findings are written and the reader has them. **Then ask once, and stop:**

> Findings are in `harness-audits/2026-07-27-1128-report.md`. Want the designed HTML too — light or dark? It renders from this file, so it costs about 22k tokens and no re-auditing.

**Ask after, not before, because now the question is cheap.** Up front, *"do you want HTML?"* is a guess about a document they have not read. Afterwards they have the findings in hand and know whether this is something to send someone.

**Rendering later is the same run, not a new one.** Same timestamp, same basename, same `auditor` line — the audit happened once and is emitting its second output late. It spawns nothing, re-reads nothing, and re-derives every word from the `.md` already on disk. **A later session can do it too**, which is the durability point paying off: the `.md` is sufficient input, so the render is never trapped in the context that produced it.

**One offer. If they decline, do not ask again**, and do not append it to the hand-off as a fourth option — §The hand-off already caps that at two.

| File | For |
|---|---|
| `<YYYY-MM-DD-HHMM>-report.html` | humans — self-contained, **no external fonts or assets**, print stylesheet |
| `<YYYY-MM-DD-HHMM>-report.md` | agents — a **briefing**: same findings plus `open-questions` and the budget actually spent, so a better-positioned reader can go past where this pass stopped |

### The cover carries four facts

**`target` · `branch` · `audited` · `auditor`.** That is the whole HTML cover:

```
target    krivitskydotcom
branch    main
audited   2026-07-25 21:35
auditor   harness-audit v0.24 · 2 finders + verifier · claude-opus-5 · xhigh
```

**The `auditor` value is `<skill> v<version> · <shape> · <model id> · <effort>`.** **Read `<version>` from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` at run time** — never from the example above, which is a sample cover and goes stale every release. No `effort` label — beside a model ID, `xhigh` can only be one thing. Shape is one of `1 finder + verifier` (`--quick`) · `2 finders + verifier` (default) · `4 finders + verifier` (`--deep`).

**Count agents, not steps.** Pooling is bookkeeping in the orchestrating context — no agent, no model, no tokens — so it is not a pass. An earlier cover said *"three-pass (2 finders · pooling · verifier)"*, which inflated the number and spent a line saying nothing.

**Record the resolved model ID and the effort level — never an alias.** Which model ran the finders, and how hard it was allowed to think, decide what the output is worth; a reader comparing two reports needs both. `opus` is a request, not a fact: it is what you *passed*, and it resolves to something else.

Resolve it from the session transcript rather than assuming — the values are recorded per turn:

```bash
f=$(ls -t ~/.claude/projects/"$(pwd | tr '/.' '--')"/*.jsonl | head -1)
grep -o '"model":"[^"]*"'  "$f" | sort | uniq -c | sort -rn | head -3
grep -o '"effort":"[^"]*"' "$f" | sort | uniq -c | sort -rn | head -3
```

The alias you passed appears alongside the resolved ID — take the resolved one. If passes ran different models, write `finders <id> / verifier <id>`. **If effort was inherited rather than overridden, it is still a fact about the run and still gets recorded** — inherited is not unknown, and the command above tells you which it was. What is forbidden is printing a level you did not verify.

`target` is the repo name alone. **No `(local checkout)` qualifier** — this skill only ever reads the working directory, so the parenthetical distinguishes against alternatives that do not exist, and `branch` already says where in the repo. Add a qualifier the day a run can target something else.

Not `findings` — the severity counts are already tiles in §2, and a cover that repeats them is a cover doing §2's job.

Everything else the run knows — `keys-open`, `keys-was-wrong`, verification tallies, per-pass read budgets, the method sentence — goes **only** in the `.md` cover fence. It is provenance written for the next run to parse, not for a person.

**The audit does not report on itself in the human file.** *"19 candidate claims · 15 hold · 2 misstated · 2 over-scoped · 0 cut"* is the audit admiring its own machinery; the reader came to learn about their repo. The one place verification belongs in the HTML is a single line in §6 stating what it removed — *"one candidate was cut: the quoted line was a fallback"* — because that changes what they should trust, and a tally does not.

A cover that fills a screen has already failed. If it does not fit in three lines of a grid, cut fields, not font size.

**Nothing on the cover appears twice.** It accumulated a kicker reading *"Agent Harness Audit — Static Configuration Review"* above a title reading *"Harness Audit Report"*, and the repo name as a subtitle above a `target` field holding the same string. **If a line restates the title or a field, cut the line.**

The whole cover, in order:

```
Professional Agentic Product Engineering | See on GitHub   ← 11px kicker, both linked
HARNESS AUDIT REPORT                                       ← title
target · branch · audited · auditor                        ← the four fields
Light theme. For the dark version, …                       ← theme note
```

The kicker's two links are the guide (`agentic-engineering.guide`) and its source repo. A reader who finds a rule wrong or a check missing can go straight to where it is written and open a PR — the report is the most likely place someone meets this material, so it carries the way back.

**The kicker carries the brand, never a description of the report.** *"Professional Agentic Product Engineering"* names where the method comes from and says nothing the title says — that is why it earns the line. A kicker that describes the report instead is both duplication and a decorative constant nobody re-checks when the method changes.

The kicker was also quietly false: once a run reads session transcripts to rate T1, *"static configuration review"* stops being true. Method belongs in `auditor`, where it is one string that changes with the run instead of a decorative constant nobody re-checks.

### The footer carries the way onward, in one line

The kicker at the top says where the method comes from. The footer says what to do with it, for the reader who has now read sixteen findings and wants somewhere to go:

> Method: the [Professional Agentic Product Engineering guide](https://agentic-engineering.guide/) — 62 tips across eight tiers. To get these caught while you work, install the coach (`/pape:agentic-coach`); to learn a rung properly, the guide repo tutors you through it.

**One line, in the `footer`, and only there.** Not in §1, not in the backlog, not repeated per tier. A report whose *findings* advertise are an advertisement with findings attached, and the reader stops crediting the findings.

**It is a pointer, never a pitch.** No benefit claims, no "supercharge", no second sentence. It earns its line the same way the kicker does: a reader who disagrees with a rating, or wants the rung explained rather than scored, currently has nowhere to go — this is the way back to the material the ratings came from.

**The exception that outranks this** is §The scorecard's T1/T2 rule: when the next lever is a rung no file can fix, the tools *are* the recommendation and belong in the lead. That is not promotion, it is the only correct corrective action — and it does not remove the footer line.

### The HTML is designed, not derived

**Inline `${CLAUDE_PLUGIN_ROOT}/skills/harness-audit/report.css` verbatim into a `<style>` block.** Never link it, never rewrite it, never invent a stylesheet per run.

Two rules, and the second is the one with teeth:

- **Self-contained** — reports travel. Emailed, dropped in a ticket, opened from `~/Downloads`. A linked stylesheet breaks the moment the HTML moves without its neighbour.
- **A timestamped report is an immutable record.** If every report linked one shared file, editing that file would silently re-render *every past report* — a report from three months ago gaining a palette it was never written under. The stylesheet is the source of truth; the copy inside each report is a frozen build artifact.

This exists because the design was left unspecified once, and the next run reinvented it: a markdown dump in a system sans stack, with a dark-mode block that rendered the whole thing dark on a dark-themed browser. The reader's verdict was *"we lost the style — it was white and more readable."* **Unspecified means reinvented**, the same way `Scorecard` grew into *Maturity scorecard* and the first-run Trend line grew into an essay.

`report.css` carries its own constraints in comments — light-only, serif body, and **no gauge class**. Honour them. The report before last rendered eleven fill bars that §Rating categories forbids in prose; the rule lived in this file and the CSS lived in the output, so nothing reconciled them. Now the prohibition is in both.

### Every ID is a link, in both files

`ISSUE-3` is clickable **everywhere it appears** — the §2 table, the Trend entries, the compounding notes, the §3 recommended backlog. All of them are same-document anchors; the report never links out to another file for its own content.

**Emit the anchor explicitly. Do not rely on heading slugs.**

| File | Anchor target | Link |
|---|---|---|
| `.html` | `<h3 id="issue-3" class="finding">` | `<a href="#issue-3">ISSUE-3</a>` |
| `.md` | `<a id="issue-3"></a>` on its own line, immediately above the `###` heading | `[ISSUE-3](#issue-3)` |

The markdown case is the one that bites. A heading reading `### ISSUE-3 · Skills declare "done" off Vercel alone` slugifies on GitHub to `#issue-3--skills-declare-done-off-vercel-alone` — so a bare `[ISSUE-3](#issue-3)` points at nothing, and renders as a live link that goes nowhere. **`guide.md` already uses the explicit-anchor pattern for every tip**; follow it. Renaming a finding then silently breaks every reference to it, which is why the anchor must not be derived from the title.

Check before shipping: every `#issue-N` referenced has a matching anchor emitted, and every finding has one.

**The HTML must carry the class contract** — `.cover` + `.meta`, `.sechead` with a `.num`, `.trend` with `.tag`, `.cov` columns, `ol.q`, `.score`/`.row`/`.rating`, `.counts`, `.tbl` + `.chip`, `.finding` + `.f-meta` + `.attr`, `.limit` for requirement boxes, `.seq`, `.obs`, `footer`. The markup is what carries the design; `report.css` styles almost none of a bare `<h2>`/`<table>` document.

*How* you emit it is open — typed directly, or built by a converter that knows this report's structure. **What fails is a generic markdown-to-HTML pass**, which can only produce headings, paragraphs, and tables, and silently downgrades the report to a styled document dump. That has happened; it is what replaced a designed report with a markdown render in a system sans stack.

**The check is on the output, not the method:** if the emitted HTML contains no `.finding`, no `.attr`, and no `.sechead`, it does not ship regardless of how it was made.

### The head is part of the contract, and `charset` is not optional

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Harness Audit — <target> — <YYYY-MM-DD HH:MM></title>
```

**`<meta charset="utf-8">` is load-bearing.** A report carries hundreds of em dashes and middots — one run emitted 308 and 92 — and a browser opening a local file with no declared charset falls back to latin-1 and renders every one of them as mojibake. The reader who hits this is the one opening it from `~/Downloads`, which is exactly the travelling case the self-contained rule exists to serve.

**Grep for it before shipping**, alongside the class contract: `grep -q 'charset' report.html`. It is one line and it closes the whole class.

### Do not render the report to check it

**Verification of this artifact is textual: the class contract and the head above.** Do not start a web server, do not drive a browser, do not screenshot it. A run did all three — losing minutes to a port collision — because a global instruction file said to verify UI changes in a real browser, and it read the report as UI.

**It isn't UI.** It is a static document with no interactivity, no state and no responsive behaviour worth exercising; everything that can break in it is visible in the markup. The one real defect a render ever caught here was the missing `charset`, and that is now a mandated line and a grep — which is why the render is no longer buying anything.

**A repo-level rule about verifying UI does not reach this file.** The audit is read-only except its two reports, it is already the longest-running thing in the session, and an instruction written for the user's application code has no jurisdiction over the audit's own output. Where a global rule and this skill disagree about the audit's scope, **this skill wins** — and note that a global file quietly overriding a skill's scope is `C-1`, which this skill reports as a finding when it meets it in someone else's repo.

**Three blocks: the news, the evidence and what to do about it, then the method.** Same order in both files.

An earlier version opened with scope, then open questions — two screens in which the reader learned nothing about their own repo, reaching the first fact about it in section four. **Method is a lookup, consulted when a finding surprises the reader; it is not a preamble.** The cover block already carries `budget: N files read of ~35`, which is the trust signal doing its job in one line.

**Register: the decision half carries no evidence.** §§1–4 state *shape*; §7 carries the proof. This is the report's most persistent defect — every section drifts toward finding-level detail, because that is the register the issues were written in and it leaks upward.

**In §§1–4: no `file:line` citations, no quoted config, no occurrence counts.** A number appears only where the number *is* the shape, and then approximately — *"roughly two-thirds of the always-loaded file"*, not *"346 of 516 lines (67%)"*. The precise figure lives in the issue, where its command is printed beside it.

**Naming a file is not evidence — name it.** §*Write it plainly* requires `CLAUDE.md` over *"the instruction layer"* everywhere, scorecard notes included, and the model note in §*The note describes a condition* uses a code span for exactly that reason. An earlier draft of this rule banned code spans outright and so contradicted both. **The line is between the file's *name* and the file's *contents*:** a name is the subject of the sentence, a line number is the proof, and only proof belongs in §7. Trend's dates and its `516 → 604` measurements are likewise the section's whole point, not a leak.

**Test:** a reader who stops after §4 should hold a correct mental model of the repo and be unable to quote a single line number. If a sentence in §§1–4 could be moved into an issue unchanged, it belongs there instead.

**Decide** — everything the reader needs to act on, before any evidence

1. **Scorecard** — the eight tiers, rated. See §The scorecard above. **It opens the report**, and its lead paragraph carries the two jobs a separate summary used to do:

   | | |
   |---|---|
   | **Credit** | The only place the report says what is *good*. Everything below is a ranked list of problems, a backlog of fixes and a long appendix; without this line the document is pure accusation and gets discounted as one. |
   | **Synthesis** | The only place that says several issues are *one* thing — *"every High below comes from one gap."* Each issue is local by construction and each rung is separate, so nothing else in the report can say it. |

   **Two or three sentences, and no issue-level detail.** A standalone `Summary` section was cut for restating what the ranked sections already said. Naming *which* files disagree, or *which* rule contradicts which, is an issue — the lead states the shape and stops. **If a sentence here could be a finding, it is a finding.**

2. **Issues Summary** — severity counts, then a table: ID · finding · tier · severity · confidence. Every row has cleared pass 3; a row that did not, isn't here.
3. **Recommended backlog** — one flat ranked list, each item naming the IDs it closes.

**Context** — how this run relates to the last, and what the method could see

4. **Trend** — what changed since the last run. See §Trend below.
5. **Observations** — explicitly labelled as needing no response.
6. **Method and limits** — **Read** (every file consulted, counted) · **Absent** (what was looked for and isn't there) · **Not visible to this method** (runtime behaviour, real token cost, whether the rules are obeyed) · the **open questions** · and the limits: that issues are not exhaustive, that *Not assessed* means **the evidence was not reached** — never "absent, so unrateable", which §Three non-ratings forbids — that **corrective actions are proposals, so an issue stands even if its fix is wrong**, and that a reader who finds a better solution should take it.

**Evidence** — the reference appendix

7. **Issues** — the full shape above, severity order. **Last.** It is the longest section by far and nobody reads it front-to-back; every reference to it is a link, so it sits under everything decision-shaped rather than pushing that below the fold.

These were once the first and last sections, saying the same thing twice at opposite ends of the report, which is why neither landed: *"whether the stated rules are followed at runtime"* in one and *"a rule can be present, correct, and still ignored at runtime"* in the other. **Open questions belong in §6 too, never at the front** — *"if solo by design, ISSUE-6 is a non-issue"* is unreadable before ISSUE-6 exists, and opening with five things the audit could not determine discounts every issue behind it.

**An index does not need to sit beside its detail once both are anchored.** An earlier version kept the issues table welded above the detailed issues for exactly that reason — a rule written before every row became a link. With anchors, adjacency buys nothing and costs §2 the lead position.

### Cut: "Questions this report answers"

A former section, removed. It posed 5–7 questions with verdicts and finding pointers, sold as the 90-second read — and every question turned out to be a finding title with a question mark: *"Does the done check match the repo's definition of done?"* → the top finding. *"Can a bad turn reach the live site?"* → another one. Same content as §2, same ranking, one extra phrasing.

Its one distinct move was the **"checked, and it's fine"** answer, which a findings list structurally cannot carry. **That belongs in the scorecard note**, which exists precisely to cover ground where nothing was found. Do not reintroduce the section to say it.

**The scope declaration binds the report that writes it.** Whatever §6 lists as not visible, no finding may assert a negative about — see Gate 1, step 2. A report that declares a blind spot and then rates a finding `Confirmed` inside it has done worse than not declaring one.

**§6 also reports what verification removed** — in prose, in one line, naming the subject rather than restating the claim: *"One candidate about a hardcoded path was cut: the quoted line was a fallback."* This is the report's strongest trust signal and it costs a sentence. A run where the verifier cut nothing says so plainly rather than omitting the line; silence there reads as the check not having run.

**Prose, never a tally.** `verification: 9 candidates · 7 hold · 1 corrected · 1 cut` is the forbidden form — see §The report never promises what it did not do. The counts go in the `.md` cover fence, where a machine reads them; the human file gets the one fact that changes what to trust, which is *what was withdrawn and why*. A tally tells the reader the machinery ran; a withdrawal tells them which claim not to act on.

### Trend

**Two identifiers per finding, and they do different jobs.**

| | |
|---|---|
| **Display ID** — `ISSUE-1` | Assigned in severity order, **this run only**. For reading and cross-referencing within the report. Anchor is the lowercased ID: `#issue-1`. |
| **Key** — `<check>@<primary location>` | e.g. `C-2@CLAUDE.md`, `C-12@ci.yml`, `P-hooks@.claude/settings.json`. Derived from *what the finding is about*. Stable across runs. **This is the only thing trend may compare on.** |

Never compare runs by display ID. Ranks shift as findings close — `ISSUE-1` next month is a different finding wearing the same badge, and reporting it as "still open" is a lie the reader can't catch.

**Keys never appear in the HTML.** Not as a heading, not as a sentence subject, not as trailing metadata on a finding line. `C-7@generate-audio.mjs` is undecodable without `checks.md` open beside it — `C-7` is the seventh check in the Class C catalogue, which the reader has never seen and does not have. A report that prints it is asking the reader to hold a lookup table they were never given.

Keys exist for exactly one job: letting the next run compare findings across reports without relying on display IDs, which shift as findings close. That job is done entirely by the `keys-open` / `keys-withdrawn` / `keys-carried` block in the **`.md` cover fence**, which is written for a machine to parse.

So Trend entries in the HTML read in plain words, and stop there:

> ❌ *"`C-7@generate-audio.mjs` was wrong — the quoted line was a fallback."*
> ❌ *"**The hardcoded audio path — was wrong.** …the earlier finding was false, not fixed." · `key: C-7@generate-audio.mjs`*
> ✅ *"**The hardcoded audio path — was wrong.** The quoted line was a fallback behind an environment variable; the earlier finding was false, not fixed."*

The second form was a half-fix — demoting an undecodable token to the end of the line does not make it decodable. **If the reader cannot resolve an identifier from the document in front of them, it does not go in the document.**

**A re-render is not a run. It replaces its source; it never adds a file.**

Re-presenting an existing finding set — new section order, new scorecard axis, corrected register — spawns no agents and gathers no evidence. It is the same audit wearing a new layout, and it **overwrites the report it came from** rather than earning a fresh timestamp. Two files whose cover `auditor` lines match are the same run by definition, and leaving both makes the directory claim an audit that never happened.

The failure this prevents is quiet and compounding: trend globs the newest file, so a re-render becomes the baseline the *next* real run compares against — reporting "still open since 22:45" for a finding first seen at 21:35, and silently resetting how long anything has been open.

**Check before writing:** if the newest existing report carries the same `auditor` value the run is about to write, and no new pass was spawned, overwrite it. Only a run that actually gathered evidence takes a new timestamp.

**Before writing:** glob `harness-audits/*-report.md`, read the most recent **whose `auditor` line differs from this run's**, extract its keys. Then:

**Four tags, and there is no fifth.** A key either appeared, persisted, or disappeared — and when it disappeared, *why* is the only thing worth a separate word:

| Tag | Means |
|---|---|
| **new** | Key only in this run |
| **open** | Key in both runs |
| **fixed** | Key gone because someone did the work |
| **was wrong** | Key gone because the earlier finding did not hold up |

Not *closed*, not *withdrawn*, not *regressed*, not *carried* — a reader asked outright what "withdrawn" meant, which answered whether it was carrying its meaning, and "carried" was in an earlier list without ever being defined, which answered the same question about it. **A tag nobody can define on sight is not a status; it's a synonym.** These sit beside each other in one list, so each has to read without a key.

**Severity changes and changed numbers are not tags** — they are notes on an `open` row, because the key persisted either way: *"still open, now High"* · *"still open, CLAUDE.md 516 → 604 lines."* A rating that got **worse** leads the section; that is emphasis, not a fifth status.

- **fixed** — the condition is gone because someone did the work. Name the evidence: *"the tracked worktree file is gone."* **Prefer the re-checker's verdict over a key diff** — see §Pass 1b. A key absent from this run may mean the problem was solved, or that nothing looked there; only a re-test tells them apart, and where the two disagree the re-test wins.
- **was wrong** — the key is gone because the earlier finding did not hold up. **A false finding and a fixed problem look identical from key-diffing alone**, and calling a retraction *fixed* credits the reader with work they never did while quietly burying the audit's own error. Say what was wrong: *"the quoted line was the fallback, not the value; the fix suggested was what the code already did."*

**When a key disappears, establish which of the two it is before writing either word.**

**Open the tagged list with `What changed since the last run — <YYYY-MM-DD HH:MM>:`** — the section's job stated, not implied, and the baseline named. *"The last run"* is a pointer the reader cannot resolve; the timestamp of the report being compared against makes the whole section checkable, and tells them at a glance whether they are looking at yesterday's drift or last quarter's.

**Trend owns cross-run state, with exactly one thing shared out.** No run history in the issue bodies, and nothing in the ID column but an ID — a run once hung `open since …` off the ID, which is the one column that carries an identifier and nothing else.

**The single exception is persistence, and it earns its place:** an `open since <timestamp>` marker in the issues table, in its own column. How long something has been open is the one cross-run fact a reader needs *while weighing severity*, and sending them to §4 to get it separates the two halves of one judgement. Everything else about the runs — what closed, what moved, what changed — stays in §4.

### Trend never lists the new issues

**`new` is a count, never an enumeration.** On a run where twelve of sixteen issues are new, listing them reproduces the issues table one section later — the reader's verdict was *"this just duplicates the issues list, this is not a trend."* They were right: when most issues are new, "what's new" is simply the report.

**The durable signal is the opposite one — which issues have survived across runs.** There are always few of those, and being open for three runs is a fact about the process that severity alone never shows. That is why persistence is the one cross-run fact marked in the issues table rather than only here; **Trend carries the count, the table carries the `open since`.**
Write each one the way §Keys never appear in the HTML requires — **name the thing, not its key**:

> ✅ *"The two instruction layers still disagree — open since 25 Jul, and now High."*
> ❌ *"C-2@CLAUDE.md open since 25 Jul, moved to High."*

A reader shown the second asked *"what is C-2? sounds like noise to me."* That is the whole rule, confirmed by the only test that counts: `C-2` is decodable only with `checks.md` open beside the report, and nobody reads a report that way.

**Placement: §4, in both files** — after the backlog, before Observations. It is what a returning reader looks for first, but it only means something once they have seen the ratings and the backlog it refers to.

**First run — write exactly this line and nothing more:**

> **First run.** No earlier report in `harness-audits/` to compare against.

A run produced five lines here plus an explainer on display IDs versus keys, on a first run with nothing to compare. **The display-ID/key distinction is specification, not report content** — it belongs in this file and never in a report. One sentence, then §5.

Carry the keys in the `.md` so the next run can read them without parsing prose:

```
keys-open:   C-2@CLAUDE.md · C-12@ci.yml · P-agents@.claude/agents
keys-closed: (none)
```

### The `.md` states the next lever as a field

The `.md` is read by agents, and the most common one is a **tutor deciding where to start teaching**. Make the answer a field rather than a sentence it has to parse out of §1:

```
next-lever:  T3
ratings:     T1 Satisfactory · T2 Satisfactory · T3 Weak · T4 Moderate · T5 Weak · T6 Missing · T7 n/a · T8 Weak
```

Same values as §1's prose and the scorecard table — this is the machine-readable copy, not a second opinion. If they disagree, §1 is right and the fence is a bug.

`ratings` carries all eight so a reader can see which rungs hold without re-reading the table; `next-lever` is one rung, derived by the rule above. Where T1/T2 are unrated, write `not-assessed` rather than omitting them — a missing key reads as an oversight, and the reason belongs in the rung's note.

---

## Method

**Resolving a project command — precedence, highest first:** the CI workflow (the only place it's *proven*) → repo docs → manifest scripts → language convention. `checks.md` names no test frameworks on purpose; read the manifest and name what you find.

**Budget is per pass, not per run** — see §Flags for the finder allowance. The verifier gets **≤25 reads** and must spend them opening the file behind every cited claim; it is the one pass whose budget is not a ceiling to economise against. Class C costs more than Class P — spend the finder budget there. Hit a cap and say which region went unexamined; that region is `Not assessed`.

**Report the budget actually spent, per pass**, in the cover block: `finders: 18 + 14 reads · verifier: 21 · caps not hit`. The shipped report that failed used 14 of 35 — a low number next to a high cap is the signature of under-reading, and it is only visible if both numbers are printed.

**Verify every tip citation before printing it:** `rg '<a id="tip-5-4">' ${CLAUDE_PLUGIN_ROOT}/guide.md`. No anchor, no citation. Cite the live guide: `https://agentic-engineering.guide/tier-<T>#tip-<T>-<N>`.

**No tiers, no ceiling.** Don't infer how ambitious the repo is and don't gate on it. *"This is only a side project"* is a claim about intent, which a repo cannot observe — an earlier version guessed and classified a 561-commit live site as throwaway. Severity already carries the ranking. Where something genuinely doesn't apply, say what it depends on — *"only matters once agents run unattended"* — not *"above your level"*.

---

## The two gates

**These are steps, not advice. Nothing is written until both have run.**

Every failure this skill has shipped came from one place: **naming a thing without reading what decides whether the naming is true.** Never a novel mistake — that mistake wearing a new costume. It happens in two places, and a gate on the prescription catches nothing in the diagnosis: a report can reason impeccably about a file it misquoted.

**Gate 1 is administered by pass 3, not by the context that wrote the finding.** That is the whole difference. A self-check does not hold here and there is direct evidence: the report that shipped a false finding *already contained the rule* — *"a finding may only assert what a file shows"* — and broke it anyway. A rule you recite to yourself while holding the conclusion you want is not a gate. Gate 2 stays with the writing context, because it is about a proposal that context is authoring.

Finders should apply Gate 1 to their own candidates as a matter of craft. **The verifier's application is the binding one.**

### Gate 1 — every finding · run by the verifier

The brief, from the review that produced this design: **"trust its architecture, verify its citations."**

For **each** finding, before it may ship:

1. **Did I read the quoted line in full file context?** Not the grep hit, not the diff hunk — the file, far enough around the line to see what the line belongs to. A shipped report quoted `"/Users/alexey/.local/bin/edge-tts";` and called it a hardcoded path. The line above it was `process.env.EDGE_TTS_BIN ||`, which makes it the *fallback*. The finding was false, and its corrective action recommended reading the value from an env var — which is what the code already did. **A quote that begins mid-expression is not evidence.**
2. **Does this finding stay inside the scope §6 declared?** Grep the coverage section. Where it lists something as *not visible to this method*, no finding may assert a negative about it. The same report declared user-scope `~/.claude/` invisible, then rated *"nothing reviews a diff with fresh eyes"* as `Confirmed` — against eight subagents living exactly there. **A declared blind spot binds the report that declared it.** Where the finding survives at a narrower scope, narrow it and drop the confidence; don't delete it.
3. **Is the object the kind of thing I called it?** Mode `160000` in `git ls-files -s` is a gitlink, not "an empty file". When a finding names a file's *kind* — empty, tracked, generated, executable — the command establishing that kind must have been run.
4. **Can I reproduce every number I print?** *"56 rules phrased never/always/must/do not"* re-grepped to 50, or 65 counting *don't*. **Print the command beside the count**, or give a range. A figure carrying more precision than the method supports discredits an argument that never needed it.
5. **Could I have answered my own open question from a file I already read?** One shipped question — *"how long does `verify` take? Not measurable statically"* — sat answered as `~1-2m` in a comment in a file the report cited by line number. An open question the audit could have closed is not epistemics; it is abdication. Close it or cut it.

**`Confirmed` means read in full file context.** Short of that it is `Probable` with the search printed, or it does not ship.

### Gate 2 — every corrective action

For **each** corrective action, in order:

1. **Did I open the file this touches?** Not glob it, not infer it from a manifest — read it. If the action names a test runner, you have read its config. If it names a hook event, you know when that event fires. **If you cannot say which file you read, the action is not ready and becomes `Probable`, or is cut.**
2. **Does the command behave the same where the fix runs it?** CI-conditional config is the standard trap — a runner that starts a prebuilt server under CI and a dev server locally makes an identical command mean two different things. Read the branch, name the flag.
3. **Does it fire only at the moment the rule is about?** A rule about pushing that gates every commit, or every agent turn, costs the user something they didn't agree to. Match the trigger to the moment.
4. **Would this destroy anything §1 credited?** Grep your own summary. If it praises a habit, no corrective action may tax that habit. A report that contradicts its own praise is discarded on the spot.
5. **Is the output bounded?** Anything that returns text to the model — a blocking hook, a failing gate — surfaces a tail, never a whole log.
6. **Have I written the assumption down as a sentence that could be wrong?** Not "this should work" — *"this assumes X, checked at `file:line`"*. If you cannot name the file, you have not checked it. This step is the one that catches reasoning errors, where the evidence is right and the inference is not; the other five only catch evidence errors.

If an action survives all six and still rests on inference, say so in the finding rather than presenting it as settled. **Gate 2 is the one check still administered by the context that authored the thing being checked** — pass 3 verifies findings, not fixes, because a static verifier cannot run a proposed hook either. Treat its verdicts as weaker evidence than Gate 1's and let the confidence reflect that.

### The three instances that produced Gate 2

Kept as worked examples, not as separate rules — they are what steps 1 through 4 look like when skipped.

- **A `Stop` hook running a multi-minute build.** `Stop` fires at the end of *every* agent turn, including pure conversation. Minutes of waiting after every message; removed within a day. The rule said "before push", so it was `PreToolUse` matched on `git push` all along. *(step 3)*
- **`npm run verify` with no `CI=1`.** `playwright.config.ts` selected `start:e2e` under CI and `npm run dev` otherwise, with `reuseExistingServer: !CI`. The gate would have blocked good pushes at random, and a gate that cries wolf gets ripped out. *(step 2 — the config was never opened)*
- **Merging "test before commit" and "build before push" into one gate**, in a report whose summary had just praised 561 small checkpoint commits. *(step 4)*

## Five specifics, subordinate to the gates above

1. **Verify the path you recommend against what you already found.** A run once reported "no `.claude/settings.json` anywhere" and routed the fix to `site/.claude/` while its own skills check had found `.claude/` at the root. The file would never have been read.
2. **The command in the fix must be the command in the evidence.** Don't praise `npm run build` as the gate and then propose a hook running `npm test`.
3. **Ship the literal lines, not a description of them.** "Create settings.json with a `hooks.Stop` entry" is homework, not a corrective action. The lines are a baseline under a binding requirement, not a paste-ready answer — see §*Ship runnable content, at the altitude you can defend*.
4. **Then say how to prove it took.** An unverified hook is indistinguishable from no hook.
5. **Collapse gaps that share one fix.** Several checks can fail on one absent file. Report each honestly in §7; in §3 they are one item. Three findings, two files — say both numbers.

**Then stop.** The audit reports and offers. Implementation is the next turn, with explicit consent and ordinary permissions.

---

## The hand-off — what to say in the chat when it's done

The report is a document; this is the message beside it. **Four short lines, in this order, and nothing else:**

```
Wrote harness-audits/2026-07-26-1420-report.md    ← the findings
      harness-audits/2026-07-26-1420-report.html  ← the same, designed

Sixteen issues, five High. T1 and T2 hold; the next lever is T3 —
two instruction layers with nothing reconciling them. Every issue
links the tip behind it, if you want the why.

Top one first — start a fresh session and paste this:

    Read harness-audits/2026-07-26-1420-report.md and implement
    ISSUE-1. Follow its corrective action; prove it with the
    command the issue names.

Or turn on the coach, so this gets caught as you work.
```

**Name the file, always.** A run that writes a report and doesn't say where it is has hidden its own deliverable. Path first, before the verdict — it's the thing they need and the thing they'll scroll back for.

**One sentence of verdict, and it is the lead's sentence, not a new one.** Do not re-summarise the report in the chat; the report exists. Say the count and the next lever. If the chat version disagrees with §1 by a word, the reader now has two verdicts and trusts neither.

**Then offer the three ways forward — but only the ones that fit:**

**Hand the fix to a fresh session, not to this one.** By now the audit context holds two finders' output, a verifier's, and the whole report — several hundred thousand tokens, none of it about the fix. Offering to implement here contradicts three tips this skill audits against: [3.3](https://agentic-engineering.guide/tier-3#tip-3-3) `/clear` between tasks, [6.5](https://agentic-engineering.guide/tier-6#tip-6-5) engineer the long-horizon hand-off, [2.6](https://agentic-engineering.guide/tier-2#tip-2-6) spec, then a fresh session.

**So give them the prompt, ready to paste**, naming the report path and the issue. The `.md` is the spec — that is what it was written for, and until something says so out loud, *"for an agent to pick up"* is a label nobody knows how to act on.

**Say once that the issues link their tips.** It is a clause, not an offer — the teaching is already built into the report and costs nothing to point at. Offers stay capped at two.

| Offer | When it's the right one |
|---|---|
| **The paste-able fix prompt** — name the single top issue by ID | Nearly always. It's the shortest path from report to changed repo, and it starts clean. |
| **`/pape:agentic-coach`** — let the coach catch it in the flow | The gaps are habits — vague asks, no runnable "done", claims without proof. A hook fires on those tomorrow; a report doesn't. |
| **The tutor** — `git clone` the guide repo, open Claude Code, say `hi` | The next lever is a rung they need to *learn*, not a file they need to write. Point it at the rung: *"start at T3."* |

**Offer at most two.** Three options is a menu and a menu defers the decision; pick the two the report actually argues for. **Never all three plus a re-run** — the audit doesn't sell its own second run.

**When the next lever is T1 or T2, the tutor and the coach are the answer — say so plainly.** Those rungs are prompting and shaping, so there is no file to add and no gate to wire; a corrective action that says *"write better prompts"* is not one. This is the single case where the hand-off outranks "fix it now", and §The scorecard says the same thing from the rating side.

**If the audit couldn't rate T1/T2 at all** — no consent for transcript access — say what would change that, once: *"T1 and T2 are unrated; the tutor reads your real prompts (with consent) and rates them, or re-run this with transcript access."* One line, not a pitch.

**Not in this message:** how many finders ran, what the verifier cut, the budget, the theme, how long it took. All of that is on the cover for anyone who wants it. **The chat message is for deciding what to do next, and nothing that isn't a decision belongs in it.**
