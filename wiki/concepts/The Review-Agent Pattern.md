# The Review-Agent Pattern
**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-04

A separate agent reviews the PR before a human; findings get fixed first. This is where most teams start — **high value, low risk** — and often their first production loop.

## The pattern

- **Feed the diff, not the codebase.** Pull only the changed lines + surrounding functions. Dumping the whole repo destroys the reviewer's context.
- **Load the rulebook.** Inject your `ARCHITECTURE.md` or a `code-review` Skill ("always use the repository pattern for DB access") so it reviews against *your* standards.
- **Prompt adversarially.** "Identify side effects this diff introduces that are **not** covered by the modified tests." And ask for all findings, severity-labeled — never tell it to be conservative.
- **Use a different model than the author.** A cross-lab reviewer catches blind spots a self-review shares.
- A **human still owns the merge.**

## Why a different model

> ❌ Instead of: the model that wrote the code reviewing its own code — it carries the same blind spots into the review.
>
> ✅ Prefer: Claude writes, Codex (GPT-5.5-class) or Gemini reviews the diff. A different training distribution catches bug classes self-review misses. Loop until the reviewer comes back clean — a human still owns the merge.

- Practitioner reports are consistent: a cross-lab reviewer routinely finds real bugs (logic errors, injection vulns) the authoring model missed.
- Two models agreeing is strong signal, not proof.

## Related
- [[Agent Execution Layer]]
- [[Multi-Model Playbook]]
- [[Loop Until Done]]
- [[Executable Definition of Done]]
