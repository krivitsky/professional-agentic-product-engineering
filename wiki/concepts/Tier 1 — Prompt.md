# Tier 1 — Prompt
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04
**Updated:** 2026-10-22

Tier 1 of [[The Six Tiers]], in the **Direct** stage. **Write prompts the agent can act on, to get the right result the first time.**

**You stop:** — · **You do instead:** state the outcome · **Climb when:** you re-explain the same things; big asks go sideways.

**Reach for this tier when** the agent keeps doing *almost* the right thing — vague asks get literal, wrong results. The single request is your cheapest lever: say what you want so it can't guess wrong.

## The prompt triad

The tier opens with one frame — [[The Prompt Triad]]: every prompt is three things, **intent · context · constraint**. Fill all three in one message and the agent runs far on its own. The first 14 tips below are how you fill each slot well; each is tagged with the slot it serves.

## Context hygiene — managing the active window

The last three tips manage the window the prompt lands in. **Context is a finite budget with diminishing returns** — see [[Context Rot]]: load just-in-time, `/clear` between tasks, compact deliberately, and push heavy exploration to subagents ([[Tier 5 — Orchestrate]]).

## The 17 tips

Each tip has its own page — click through for the Instead/Prefer pair.

- [[Tip 1.1 — Hand over the outcome, not a file list]] *(intent)* — give the destination and the guardrails; let the agent choose the parts.
- [[Tip 1.2 — Be specific — vagueness is now taken literally]] *(intent)* — name the exact function, file, and change.
- [[Tip 1.3 — Say what to do, not what to avoid]] *(intent)* — positive instructions beat prohibitions.
- [[Tip 1.4 — Give the reason; motivation makes it generalize]] *(context)* — a "because" lets the agent apply the rule to cases you didn't list.
- [[Tip 1.5 — Specify the output shape, not just the goal]] *(intent)* — route, response format, ordering, limits.
- [[Tip 1.6 — Show examples instead of describing style]] *(context)* — 3–5 concrete examples work best.
- [[Tip 1.7 — Follow the house style, don't invent one]] *(context)* — point at the existing pattern in the repo.
- [[Tip 1.8 — Show, don't tell — use the input channels]] *(context)* — paste the screenshot, the component, the raw logs.
- [[Tip 1.9 — Invite uncertainty instead of forcing an answer]] *(the fourth move — the gaps in any slot)* — ask it to list assumptions and stop on genuine ambiguity.
- [[Tip 1.10 — Paste raw errors, don't paraphrase them]] *(context)* — full stack trace → diagnose root cause before changing anything.
- [[Tip 1.11 — Constrain scope — modern models over-engineer unless you stop them]] *(constraint)* — ask for the smallest change that works.
- [[Tip 1.12 — Narrow the edit surface — a small diff is a reviewable diff]] *(constraint)* — scope the change to one file.
- [[Tip 1.13 — Dial effort; don't beg for thoroughness]] *(constraint)* — leave it at high; add `ultrathink` for one gnarly turn; `/effort ultracode` for big async jobs.
- [[Tip 1.14 — Say it all in your first message]] *(all three at once)* — one complete brief beats ten corrections.
- [[Tip 1.15 — Feed high-signal context, not the whole repo]] — Just the affected modules + relevant docs, loaded just-in-time.
- [[Tip 1.16 — `∕clear` between tasks; reset after repeated failure]] — After ~2 failed fixes, `/clear` and rewrite the opening prompt.
- [[Tip 1.17 — Steer compaction, don't run it blind]] — Tell `/compact` what to keep (decisions, failing tests) and what to drop (exploration).

## Key Instead/Prefer pairs

**1.1 Hand over the outcome, not a file list.**
> ❌ Instead: "Add a dark-mode stylesheet, a toggle in the header, and save the choice in the browser."
> ✅ Prefer: "Let users switch to dark mode and remember their choice — match the styling already in the app."

**1.3 Say what to do, not what to avoid.**
> ❌ Instead: "Don't be verbose."
> ✅ Prefer: "Write for senior engineers — lead with the technical specifics."

**1.11 Constrain scope — modern models over-engineer unless you stop them.**
> ❌ Instead: "Fix this bug and improve the code."
> ✅ Prefer: "Fix only this bug — smallest change that works. No refactoring, no comments on untouched code, no handling for cases that can't happen."

**1.14 Say it all in your first message.**
> ❌ Instead: "Add a way to export reports." — then ten messages fixing what it guessed wrong.
> ✅ Prefer: "Add report export: a button on the reports page that downloads the current rows as a `.csv`. No new libraries. Work on your own; only stop if you hit a real decision."

## If you forget the rest, keep these five

1. **Hand over the goal, not the steps.** Say what you want and the limits; let the agent pick the how.
2. **Be specific and concrete.** Vague asks get taken literally now.
3. **Do one thing at a time.** A single goal, a small focused diff — not "fix this *and* improve that."
4. **Show, don't describe.** Paste the real error, the screenshot, an example.
5. **Say it all in the first message.** One full brief beats ten corrections.

## If you forget the rest, keep these five

1. **Hand over the goal, not the steps.** Say what you want and the limits; let the agent pick the how.
2. **Be specific and concrete.** Vague asks get taken literally now.
3. **Do one thing at a time.** A single goal, a small focused diff — not "fix this *and* improve that."
4. **Show, don't describe.** Paste the real error, the screenshot, an example.
5. **Say it all in the first message.** One full brief beats ten corrections.

## Related

- [[The Six Tiers]]
- [[The Prompt Triad]]
- [[Context Rot]]
- [[Tier 2 — Plan]]
