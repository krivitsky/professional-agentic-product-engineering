# Check catalogue

Two classes. **Class P** asks *is it there* — cheap, mechanical, and the easy half. **Class C** asks *is it coherent, enforced, and safe* — it opens files and cross-references them, and it is where every finding worth reading comes from.

A run that reports only Class P has done the inventory and called it an audit.

---

## Categories

Every finding is filed under one, and every category gets a rating in the report's §3 Scorecard.

| Category | Code | Tier | Covers |
|---|---|---|---|
| Instruction architecture | INSTR | T3 | `CLAUDE.md` hierarchy — scope, conflicts, overrides |
| Context economy | CTX | T3 · T6 | What's in the always-loaded budget and whether it earns its place |
| Permission model | PERM | T8 | Tool grants, allow/deny, per-agent narrowing |
| Deterministic enforcement | ENFORCE | T5 · T4 | Hooks, CI, and whether stated rules have anything behind them |
| Autotests | TEST | T4 | Suite, e2e, coverage, mutation — the ground truth the loop converges to |
| Delegation design | DELEG | T6 · T4 | Subagents — roles, tool scoping, runtime feasibility |
| Extension surface | EXT | T3 | Skills, commands — overlap and trigger collisions |
| External integrations | MCP | T3 | MCP servers, scope, trust boundary |
| Repo hygiene | HYGIENE | T3 | Secrets, machine-specific state, what's tracked |
| Verification and feedback | VERIFY | T4 · T7 | Evals, golden outputs, recorded regressions |
| Runtime behaviour | RUNTIME | T1 · T2 | Prompting and shaping habits, which skills ever fire, whether rules are followed. **Not visible in files; visible in local transcripts with consent** — see below |

**The Tier column feeds the scorecard**, which is indexed T1–T8 (see SKILL.md §The scorecard). A finding's authoritative tier is the tier of the tip it cites; this column is the coarse default for checks whose tip varies.

**Two rungs no *file* reaches — but the transcript does.** **T1 Professional Prompting** and **T2 Shaping & Slicing** are invisible in checked-in configuration: prompt quality and shaping both happen before the commit. They are **not** invisible to this method. The local session transcripts at `~/.claude/projects/<slug>/*.jsonl` record every prompt the user typed in this project, and `scripts/mine-prompts.sh` in the guide repo already extracts them read-only. **With consent, rate T1 and T2 from real prompts** — bare imperatives versus outcome-plus-constraint, `@file` use, plan-mode and verify habits — against Tier 1 and Tier 2's tips. Static proxies (`specs/`, `*.plan.md`, commit granularity) are the fallback, not the ceiling.

**`Not assessed` must name which reason.** *"Consent not given"* and *"nothing in the repo runs unattended"* and *"needs evidence this method cannot reach"* are three different states, and only the last is a limit of the audit. Writing the blanket phrase for all three hides a choice as a constraint — an earlier run marked T1 unassessable while the auditing session was itself reading transcripts for other purposes.

**T7 Fleet Ops** stays `Not assessed` unless something in the repo actually runs unattended — say that, rather than scoring an absent fleet as a weakness.

---

## Class P — presence

Literal paths, because the *harness* defines them and they're stable for years. Absence here **is** conclusive: there's no unusual place to hide a `.mcp.json`. Everything a project's *stack* defines (test/lint/typecheck commands, e2e runner) is resolved by judgement via the precedence chain in SKILL.md — **this file names no frameworks, on purpose.**

| What | Where | Category | Tip |
|---|---|---|---|
| Project memory | `CLAUDE.md`, `AGENTS.md` — root and subdirs | INSTR | 3.5 |
| Skills / commands | `.claude/skills/*/SKILL.md`, `.claude/commands/*.md` | EXT | 3.6 |
| Subagents | `.claude/agents/*.md` | DELEG | 6.2, 6.4 |
| Hooks | `.claude/settings.json` → `hooks` | ENFORCE | 5.4 |
| Permissions | `.claude/settings.json` → `permissions` | PERM | 8.2 |
| MCP servers | `.mcp.json`, or `mcpServers` in settings | MCP | 3.7 |
| Secrets hygiene | `.gitignore` ⊇ `.env*`/`*.pem`/`*.key`; `git ls-files` | HYGIENE | 3.2 |
| Executable DoD | one command composing test + lint + typecheck | TEST | 4.1 |
| Test suite | test-shaped files **and** a resolvable command | TEST | 4.2 |
| BDD | `**/*.feature`, step defs, `gherkin-guidelines.md` | TEST | 4.3 |
| Browser e2e | Playwright/Cypress config, `e2e/` | TEST | 4.4 |
| Coverage gate | a **diff**-coverage threshold wired into CI | TEST | 4.10 |
| Mutation testing | Stryker · mutmut · cargo-mutants · PIT | TEST | 4.11 |
| Fresh-eyes review | read-only reviewer in `.claude/agents/`, or a CI review job | DELEG | 4.7 |
| CI | `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/` | ENFORCE | 5.5 |
| Commit granularity | `git log` — count and median diff size | ENFORCE | 5.1 |
| Session hand-off | `STATUS.md`, `PROGRESS.md`, `features.json` | CTX | 3.8, 6.5 |
| Sandboxing / gates / strike caps | loop config, `environment:` protection, max-attempt cap | PERM | 8.1, 8.2, 8.3 |
| Evals | `.claude/evals/`, golden outputs, recorded regressions | VERIFY | — |

**Test-file glob union**, excluding `node_modules` · `vendor` · `target` · `.venv` · `dist` · `build`:
`**/*[._]test.*` · `**/test_*.*` · `**/*[._]spec.*` · `**/{test,tests,spec,__tests__}/**` · `**/*Test.java` · `**/*_test.go` · and for Rust `rg '#\[cfg\(test\)\]'` — named because a Rust repo with excellent tests has **zero** files matching `*test*`.

A Class P absence is only a finding if it has a consequence worth stating. "No `.mcp.json`" on a repo with no external systems is an Observation, not a High.

---

## Class C — coherence, enforcement, safety

Open the files. Cross-reference them. Each check states the standard, how to detect the failure, and the severity band it usually lands in — adjust to what you actually find.

### C-1 · Instruction files contradict each other — INSTR, usually High
**Criteria:** no two instruction files give conflicting orders on the same subject; where a narrower file overrides a broader one, it says so.
**Detect:** read every `CLAUDE.md`/`AGENTS.md` in the tree. Extract imperative rules. Compare across files on the same subject — testing, commits, formatting, dependencies, branching. A contradiction is two rules that cannot both be obeyed.
**Consequence to state:** behaviour depends on working directory — and once one "never" is visibly ignored, every other "never" in the file loses force.

### C-2 · Absolutes with nothing enforcing them — ENFORCE, usually High
**Criteria:** a rule written as an absolute is either mechanically enforced or demoted to a preference. Absolutes that rely on the model remembering are preferences with misleading grammar.
**Detect:** count rules phrased **never / always / must / do not** across instruction files. For each, ask what would catch a violation — a hook, a lint rule, a CI job, a type. Report the ratio. **Call out any that existing tooling could already check** (a no-console rule the ESLint config would catch); that's the cheap fix.
**Consequence:** compliance degrades as context fills, and it degrades *silently* — the failure is a rule quietly not applied, not an error.

### C-3 · Dead weight in the always-loaded budget — CTX, High if large
**Criteria:** everything in an always-loaded file changes what the agent does. Reference material it could read on demand doesn't belong in resident context.
**Detect:** line-count each `CLAUDE.md`; classify sections as operative (rules, conventions, gotchas) vs reference (changelogs, onboarding narrative, architecture essays, API dumps). Report the share and the line ranges. Estimate tokens (~4 chars/token) spent every session.
**Consequence:** operative rules end up buried below hundreds of lines of history, which is where adherence falls off. Compounds with C-2.

### C-4 · A gate that fails open — ENFORCE, High
**Criteria:** a hook that cannot complete reports failure. **A gate that fails open is worse than no gate, because it is trusted.**
**Detect:** read every hook command and script. Look for `|| true`, `|| exit 0`, a trailing `exit 0` after a command whose status was discarded, `set +e`, suppressed stderr. Also: a `Stop` hook with no `stop_hook_active` guard (loops forever), and a hook whose binary isn't a declared dependency.
**Consequence:** the config reads as gated to anyone reviewing it while nothing blocks. **This one compounds with everything** — always check whether it does.

### C-5 · Destructive grants with no blocking layer — PERM, Critical
**Criteria:** any command that destroys work or rewrites shared history is denied outright, or gated by a hook that can block it.
**Detect:** read `permissions.allow`. Flag `rm`, `git push --force`, `git reset --hard`, `git clean`, `DROP`, `truncate`, `kubectl delete`, `terraform destroy`, and bare wildcards. Then check whether a `deny` list or **any `PreToolUse` hook** exists to intercept. Grant with no interception → Critical.
**Consequence:** a single misread instruction destroys uncommitted work or a colleague's branch, with no prompt and no record beyond the transcript. Say plainly when a finding is the one that's unrecoverable.

### C-6 · Agent definitions describing impossible behaviour — DELEG, High
**Criteria:** agent definitions describe what the runtime can actually do. Subagents run one level deep and cannot spawn subagents.
**Detect:** read every `.claude/agents/*.md` body. Flag instructions to dispatch, spawn, or delegate to other subagents; references to tools not in its own `tools:` list; a read-only agent told to fix things.
**Consequence:** the described hierarchy silently collapses into one context window — the exact context pressure the delegation was meant to relieve — while the config keeps suggesting it's handled.

### C-7 · Secrets and machine state in tracked config — HYGIENE, Critical if live
**Criteria:** local and machine-scoped config stays out of version control; no harness file contains a credential.
**Detect:** `git ls-files` for `.claude/settings.local.json`, `.env*`, `*.pem`. **Verify each `.gitignore` pattern actually matches the file it targets** — `.claude/*.local.json` does *not* match `.claude/settings.local.json`; near-miss globs are the common failure. Scan tracked config for credential-shaped values (`sk_`, `ghp_`, `AKIA`, long base64, `-----BEGIN`). Scan for absolute paths under `/Users/`, `/home/`, `C:\`.
**Report:** redact — `"sk_live_••••••••••••"`. **Rotation is the corrective action; deleting the file does not remove it from history.** Absolute paths mean hooks silently don't run for anyone else — shared enforcement quietly became personal.

### C-8 · Competing triggers — EXT, Low to Medium
**Criteria:** skill and command descriptions partition the trigger space; two shouldn't both claim the same request.
**Detect:** read every `description:` frontmatter plus command names. Flag pairs leading with the same task, and any command duplicating a subagent.
**Consequence:** selection is arbitrary, so the same request behaves differently between sessions.

### C-9 · Over-scoped integrations — MCP, Medium
**Criteria:** an MCP server is scoped to the narrowest path the work requires.
**Detect:** read `.mcp.json` args and env. Flag a filesystem root at `$HOME` or `/`, write-capable servers without stated justification, credentials inline rather than by env reference. Count total servers — the tip is *keep the surface small*.
**Confidence:** usually **Probable** — whether a server is loaded in practice can't be determined from config alone. Say so.

### C-10 · Enforcement that only exists locally — ENFORCE, Medium
**Criteria:** harness primitives are versioned and shared. The guide: *"not a config trapped on one laptop."*
**Detect:** hooks or permissions present in `.claude/settings.local.json` but not `settings.json`; `settings.json` untracked; a `.claude/` largely gitignored.
**Consequence:** the author believes the team is gated; nobody else is, and CI isn't.

### C-11 · Tests that don't defend anything — TEST, Medium
**Criteria:** coverage proves a line ran, not that anything checked it.
**Detect:** assertion-free test bodies (a call, no `expect`/`assert`); snapshot-only suites; tests skipped or `.only`'d in tracked code; a suite whose command excludes whole directories. Check whether coverage is gated on the **diff** rather than a global percentage, and whether any mutation tooling exists.
**Consequence:** the signature failure of agent-written tests — they call the function, assert nothing meaningful, and light up coverage anyway.

### C-12 · The DoD isn't what CI runs — TEST/ENFORCE, Medium
**Criteria:** the command the agent is told to converge to is the command that actually gates the branch.
**Detect:** compare the DoD named in `CLAUDE.md` (or the hook) against what the CI workflow invokes. Flag divergence in either direction — CI stricter than the local gate, or a hook running a narrower command than the documented one.
**Consequence:** the agent converges on a bar that isn't the real bar, so "done" and "mergeable" drift apart.

---

## The gauntlet

Dropped under `--quick`; otherwise rendered. Uncle Bob's six constraints, quoted in the guide's Big Idea, against what the repo has and what the guide teaches.

| Constraint | Guide | Detection |
|---|---|---|
| Unit tests | `[Tip 4.2]` | Class P + C-11 |
| Gherkin tests | `[Tip 4.3]` | Class P |
| QA procedures | `[Tip 4.4]` `[Tip 4.7]` | e2e config, reviewer subagent, review job |
| Test coverage | `[Tip 4.10]` | diff-coverage gate in CI |
| Mutation testing | `[Tip 4.11]` | Stryker · mutmut · cargo-mutants · PIT |
| Quality metrics | *not yet a tip in this guide* | lint/complexity/Sonar config |

**Citation vocabulary — three forms, a fourth is forbidden:** `[Tip 4.2]` when a real tip covers it (anchor grepped first) · `— guide: Big Idea (Uncle Bob's gauntlet)` for the tweet itself · `— not yet a tip in this guide` as **plain text, no link, no number, ever**.

Close with: *"The guide doesn't teach quality metrics yet — [open an issue or PR](https://github.com/krivitsky/professional-agentic-product-engineering/issues)."*
