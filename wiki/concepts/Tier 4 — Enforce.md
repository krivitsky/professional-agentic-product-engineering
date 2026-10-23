# Tier 4 — Enforce
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

Tier 4 of [[The Six Tiers]], in the **Trust** stage. **Write the rules into the harness, so you stop reminding and approving.**

**You stop:** reminding and approving · **You do instead:** write the rules · **Climb when:** one agent is too slow, or a big build floods its context.

**Reach for this tier when** you give the agent the same correction again, or your prompt still says "remember to run the tests." A request can be forgotten; a hook can't. Recurring feedback becomes code: every correction you repeat, and every approval you click through, is a rule waiting to be written into the harness.

These are the constraints of [[The Prompt Triad]], hardened — from a line in the prompt into hooks, CI, and permissions the harness enforces for you.

## Hardening the Harness

This tier is where Tier 3's check becomes durable. In [[Tier 3 — Verify]] you *defined* the check; here you wire it into the harness so it runs every time and can't be skipped or forgotten. The harness around the loop — hooks that always run your tests, CI, the `gh` CLI — makes the whole loop deterministic and shareable with the team. See [[The Harness]].

## Corrections and Approvals Become Rules

A correction you give twice belongs in a lint rule or a hook whose failure message tells the agent the fix. An approval you always click through belongs in an `allow`/`deny` rule: Anthropic's telemetry showed Claude Code users approving roughly 93% of permission prompts, and paying less attention the more they saw ([How we contain Claude across products](https://www.anthropic.com/research/how-we-contain-claude)).

## The 5 Tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 4.1 — Replace “remember to run tests” with a hook]] — wire the check into `.claude/settings.json` so it always runs and won't let the agent stop on red.
- [[Tip 4.2 — Move repetitive engineering into CI ∕ headless — run it without you in the seat]] — run the agent non-interactively in your pipeline, scoped tightly with `claude -p` or the GitHub Action.
- [[Tip 4.3 — Let Claude drive `gh` — the collaboration layer is harness too]] — have Claude use the `gh` CLI to open PRs, read issues, check CI, and answer review comments.
- [[Tip 4.4 — Turn a correction you keep giving into a rule that tells the agent the fix]] — Lint rule or hook that blocks the mistake and tells the agent the fix; the failure message is the prompt.
- [[Tip 4.5 — Put approvals in rules, not prompts — a prompt you always approve has stopped being a check]] — Move repeated approvals into `allow`/`deny` rules and hooks; a prompt you always approve is no longer a check.

## Related

- [[The Six Tiers]]
- [[The Prompt Triad]]
- [[The Harness]]
- [[Agentic Primitives]]
- [[Tier 3 — Verify]]
- [[Tier 5 — Orchestrate]]
