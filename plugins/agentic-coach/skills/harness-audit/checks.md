# Check registry

Every check the harness audit runs. Read this whole file before auditing.

**Fields:** `group` (guidelines · autotests · guardrails) · `tip` · `expected_at` (earliest bucket where it's expected: `throwaway` → `side-project` → `production`) · `applies_when` (precondition; fails → `– n/a`, never `❌`) · `layer` (**A** = path the harness defines, absence is conclusive · **B** = the stack defines it, absence is never conclusive alone).

`expected_at` is **not** the tip's tier. Tip 3.2 lives in Tier 3 but the guide says *"set this up first"* — so `expected_at: throwaway`.

---

## Where commands are declared — the Layer B lookup

Manifest *filenames* are decade-stable; tool names are not. **This file names no test frameworks, on purpose.** Read the manifest and name the command from what you find.

| Manifest | Where the commands are |
|---|---|
| `package.json` | `.scripts` |
| `pyproject.toml` | `[project.scripts]`, `[tool.*]`; also `tox.ini`, `noxfile.py` |
| `Makefile` · `justfile` · `Taskfile.yml` | targets |
| `go.mod` | no script block exists — convention: `go test ./...`, `go vet` |
| `Cargo.toml` | convention: `cargo test`, `cargo clippy`; `[dev-dependencies]` |
| `Gemfile` · `Rakefile` | rake tasks |
| `pom.xml` · `build.gradle*` | `mvn test` · `gradle test` |
| `mix.exs` · `composer.json` · `deno.json` · `*.csproj` | their own task blocks |

**Precedence, highest first:** CI workflow → repo docs (`CLAUDE.md`/`README`/`CONTRIBUTING`) → manifest scripts → language convention. CI wins because it's the only place the command is *proven* to be the real one.

**Test-file glob union** (Layer B probe_a), excluding `node_modules` · `vendor` · `target` · `.venv` · `dist` · `build` · `third_party`:

```
**/*[._]test.*   **/test_*.*   **/*[._]spec.*   **/{test,tests,spec,__tests__}/**
**/*Test.java    **/*_test.go   and for Rust: rg '#\[cfg\(test\)\]'
```

Rust inline `#[cfg(test)]` is named explicitly because it's the canonical false-negative trap: a Rust repo with excellent tests has zero files matching `*test*`.

---

## Guidelines — what the agent knows before it starts

### 3.5 — Project memory
`group: guidelines` · `tip: 3.5` · `expected_at: throwaway` · `layer: A`
`applies_when:` always
`probe:` `CLAUDE.md` (or `AGENTS.md`) at repo root, and in subdirs
`verdict:` present → `✅`, and report its line count. The tip's anti-pattern is "a 500-line style manual" — over ~200 lines, still `✅` but note it's drifting toward an encyclopedia. Absent → `❌`.

### 3.6 — Skills
`group: guidelines` · `tip: 3.6` · `expected_at: side-project` · `layer: A`
`applies_when:` always
`probe:` `.claude/skills/*/SKILL.md`; also `.claude/commands/*.md`
`verdict:` present → `✅` with the count. Absent → `❌` *"no .claude/skills/ or .claude/commands/"*.

### 3.7 — MCP servers
`group: guidelines` · `tip: 3.7` · `expected_at: side-project` · `layer: A`
`applies_when:` always
`probe:` `.mcp.json` → `mcpServers`, or `mcpServers` in `.claude/settings.json`
`verdict:` present → `✅` with the server count; the tip is "keep the surface small", so flag an unusually large surface rather than praising it. Absent → `❌`.

### 3.8 — Session hand-off
`group: guidelines` · `tip: 3.8` · `expected_at: production` · `layer: A`
`applies_when:` evidence of multi-session work (long history, or a `PROGRESS`/`STATUS`-shaped doc)
`probe:` `STATUS.md` (the guide's named file)
`verdict:` present → `✅`. Absent but a plausible substitute exists (`docs/notes/`, `NOTES.md`) → `⚠️` naming it. Absent with no substitute → `❌`.

### 6.2 / 6.4 — Subagents
`group: guidelines` · `tip: 6.2` (roles → `6.4`) · `expected_at: production` · `layer: A`
`applies_when:` always
`probe:` `.claude/agents/*.md`
`verdict:` ≥1 → `✅`; several role-named ones with tight `tools:` whitelists → cite `6.4` too. None → `❌`.

### 6.5 — Long-horizon hand-off
`group: guidelines` · `tip: 6.5` · `expected_at: production` · `layer: A`
`applies_when:` evidence of multi-session builds
`probe:` `PROGRESS.md` with checkboxes, or a JSON task ledger (`features.json`)
`verdict:` present → `✅`. Absent → `❌`.

---

## Autotests — ground truth from the environment

### 4.1 — Executable Definition of Done
`group: autotests` · `tip: 4.1` · `expected_at: side-project` · `layer: B`
`applies_when:` repo contains source code (not docs-only)
`probe_a:` a **test** command resolved via the precedence chain
`probe_b:` **lint** and/or **typecheck** commands, and whether anything runs them as one gate (a `check`/`verify` target, a CI job, a documented DoD)
`verdict:` commands exist **and** something composes them into one gate → `✅`. Commands exist but nothing gates them → `⚠️` *"the pieces exist but nothing runs them as one bar."* Neither → `❌`, printing both searches.
**Always say "declared, not verified green"** — this audit does not execute commands.

### 4.2 — Unit test suite
`group: autotests` · `tip: 4.2` · `expected_at: side-project` · `layer: B`
`applies_when:` repo contains source code (not docs-only)
`probe_a:` test-shaped files (glob union above)
`probe_b:` a runnable test command (precedence chain)
`verdict:` both → `✅` with the file count. Exactly one → `⚠️` naming which is missing. Neither → `❌`, printing both searches.

### 4.3 — BDD / behaviour specs
`group: autotests` · `tip: 4.3` · `expected_at: production` · `layer: B`
`applies_when:` the repo has user-facing behaviour worth specifying (not a pure library of pure functions)
`probe_a:` `**/*.feature`, step-definition files, `gherkin-guidelines.md`
`probe_b:` an acceptance/integration test dir serving the same purpose
`verdict:` `.feature` files → `✅`. Acceptance tests but no Gherkin → `⚠️` *"no \*.feature; `tests/acceptance/` may cover this."* Neither → `❌`.

### 4.4 — Browser / e2e testing
`group: autotests` · `tip: 4.4` · `expected_at: side-project` · `layer: B`
`applies_when:` **the repo serves a UI.** No UI → `– n/a`. This precondition matters more than any other in the file: it is what stops the audit nagging a CLI or a library.
`probe_a:` Playwright MCP in `.mcp.json`
`probe_b:` `playwright.config.*`, `cypress.config.*`, an `e2e/` dir, `*.spec.ts` under an e2e path
`verdict:` either → `✅`. Neither, and there is a UI → `❌`.

### 4.7 — Fresh-eyes review
`group: autotests` · `tip: 4.7` · `expected_at: production` · `layer: A`
`applies_when:` always
`probe:` a **read-only** reviewer in `.claude/agents/*.md` (`tools: Read, Grep, Glob`), and/or a review job in CI. A different `model:` in its frontmatter is a bonus signal.
`verdict:` present → `✅`. Absent → `❌`.

---

## Guardrails — the limits it can't cross

### 3.2 — Secrets hygiene
`group: guardrails` · `tip: 3.2` · `expected_at: throwaway` · `layer: A`
`applies_when:` always — the guide says *"set this up first"*
`probe:` `.gitignore` covers `.env*`, `*.pem`, `*.key`; a committed `.env.example`; **and** `git ls-files` shows no tracked secret-shaped file
`verdict:` all → `✅`. A tracked secret-shaped file → `❌` **and say so first, above everything else in the report** — this is the one finding that outranks the rest.

### 5.1 — Commit granularity
`group: guardrails` · `tip: 5.1` · `expected_at: side-project` · `layer: A`
`applies_when:` git history deeper than a shallow clone
`probe:` `git log --oneline | wc -l`, and median diff size across recent commits
`verdict:` many small commits → `✅` with the median. Few huge ones → `⚠️` (a habit, not a missing file — never `❌`). **Shallow clone → `⚠️`, never a granularity verdict.**

### 5.2 — `gh` / PR flow
`group: guardrails` · `tip: 5.2` · `expected_at: production` · `layer: A`
`applies_when:` the repo has a remote
`probe:` merge commits / PR refs in history; `Bash(gh …)` in `.claude/settings.json` permissions
`verdict:` PR-based history → `✅`. Direct-to-main only → `⚠️` (a workflow choice, not a defect).

### 5.4 — Test hook
`group: guardrails` · `tip: 5.4` · `expected_at: side-project` · `layer: A`
`applies_when:` a test command exists (else there is nothing for the hook to run)
`probe:` a `hooks` block in **committed** `.claude/settings.json` — `PostToolUse` on `Edit|Write`, a `Stop` hook exiting non-zero on red, `PreToolUse` denies protecting `.env` / lockfiles / `.git/`
`verdict:` present → `✅` naming which events. Only in `.claude/settings.local.json` → `⚠️` *"local-only — not shared with teammates or CI"* (the guide: primitives "must be versioned and shared, not trapped on one laptop"). Absent → `❌`.

### 5.5 — CI
`group: guardrails` · `tip: 5.5` · `expected_at: side-project` · `layer: A`
`applies_when:` the repo has a remote
`probe:` `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`, `azure-pipelines.yml`
`verdict:` present → `✅` naming what it runs and on which triggers. Absent → `❌`, **printing every path searched**.

### 8.1 — Sandboxing
`group: guardrails` · `tip: 8.1` · `expected_at: production` · `layer: A`
`applies_when:` the repo contains autonomous-loop config (an agent CI job, a hosted runner, a loop script)
`probe:` sandbox config (E2B/Modal/Daytona/Northflank), a container the agent runs in, `/sandbox` settings
`verdict:` no autonomous loop → `– n/a`. Loop but no sandbox → `❌`.

### 8.2 — Approval gate
`group: guardrails` · `tip: 8.2` · `expected_at: production` · `layer: A`
`applies_when:` autonomous-loop config present
`probe:` required PR reviews, `environment:` protection rules in workflows, a documented "STOP for approval" step
`verdict:` as above.

### 8.3 — Strike cap
`group: guardrails` · `tip: 8.3` · `expected_at: production` · `layer: A`
`applies_when:` autonomous-loop config present
`probe:` an explicit max-attempt cap (~3–5) in the loop config; `stop_hook_active` guarding a `Stop` hook
`verdict:` as above.

---

## Not visible from the repo — say so, don't guess

List these in the closing footnote so it's clear they weren't forgotten: **Tip 5.3** (worktree habits) and **Tips 7.1–7.5** (agent-aware terminal, worktree isolation, a box that doesn't sleep, phone access, server hardening). These are habits and infrastructure, not files. Also: whether the suite actually passes — this audit does not execute.

---

## The full gauntlet

Rendered only under `--full`. Uncle Bob's six constraints from the tweet in the guide's Big Idea, regardless of tier.

| Gauntlet item | Guide coverage | Detection |
|---|---|---|
| Unit tests | `[Tip 4.2]` | check 4.2 above |
| Gherkin tests | `[Tip 4.3]` | check 4.3 above |
| QA procedures | `[Tip 4.4]` `[Tip 4.7]` | e2e config, reviewer subagent, review docs |
| *— below this line the guide doesn't teach it yet —* | | |
| Quality metrics | *not yet a tip in this guide* | lint/complexity/Sonar config, quality gates |
| Mutation testing | *prose only, inside Tip 4.3's "How"* | Stryker · mutmut · cargo-mutants · PIT |
| Test coverage | *prose only, in the Tier 4 intro* | coverage config, a threshold, a CI gate |

**Citation vocabulary — exactly three forms, a fourth is forbidden:**
1. `[Tip 4.2]` — a real tip covers it (anchor confirmed by grep first)
2. `— guide: Big Idea (Uncle Bob's gauntlet)` — from the quoted tweet; link the Big Idea anchor, which does exist
3. `— not yet a tip in this guide` — **plain text. No link. No number. Ever.**

Guidance offered for the bottom three is tool-agnostic and tagged `(outside the guide)`.

Close the `--full` section with one line: *"The guide doesn't teach these three yet — [open an issue or PR](https://github.com/krivitsky/professional-agentic-product-engineering/issues)."* An honest gap becomes a contribution funnel.
