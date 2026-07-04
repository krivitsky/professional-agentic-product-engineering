# Professional Prompting
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

**Tier 1 — Write prompts the agent can act on, to get the right result the first time.**

**Reach for this tier when** the agent keeps doing *almost* the right thing — vague asks get literal, wrong results. The single request is your cheapest lever: say what you want so it can't guess wrong.

## The 14 tips

- **1.1 Hand over the outcome, not a file list.** Give the destination and the guardrails; let the agent choose the parts.
- **1.2 Be specific — vagueness is now taken literally.** Name the exact function, file, and change.
- **1.3 Say what to do, not what to avoid.** Positive instructions beat prohibitions.
- **1.4 Give the reason; motivation makes it generalize.** A "because" lets the agent apply the rule to cases you didn't list.
- **1.5 Specify the output shape, not just the goal.** Route, response format, ordering, limits.
- **1.6 Show examples instead of describing style.** 3–5 concrete examples work best.
- **1.7 Follow the house style, don't invent one.** Point at the existing pattern in the repo.
- **1.8 Show, don't tell — use the input channels.** Paste the screenshot, the component, the raw logs.
- **1.9 Invite uncertainty instead of forcing an answer.** Ask it to list assumptions and stop on genuine ambiguity.
- **1.10 Paste raw errors, don't paraphrase them.** Full stack trace → diagnose root cause before changing anything.
- **1.11 Constrain scope — modern models over-engineer unless you stop them.** Ask for the smallest change that works.
- **1.12 Narrow the edit surface — a small diff is a reviewable diff.** Scope the change to one file.
- **1.13 Dial effort; don't beg for thoroughness.** Leave it at high; add `ultrathink` for one gnarly turn; `/effort ultracode` for big async jobs.
- **1.14 Say it all in your first message.** One complete brief beats ten corrections.

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

## Related

- [[The Eight Tiers]]
- [[Shaping and Slicing]]
- [[Context Management]]
