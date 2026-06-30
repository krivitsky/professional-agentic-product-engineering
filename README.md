# Professional Agentic Product Engineering

The field guide — **plus an Agentic Coach** that catches your thinking mistakes and nudges you to the right tip while you code.

A mid-2026 field guide — updated continuously — to getting good at operating a coding agent (using the example of a popular agentic coding harness, Claude Code by Anthropic) for creating new software and working on real codebases. It spans the full range: from "fix bug xyz" to autonomous engineering loops in production.

Calibrated for the current frontier class — Opus 4.8+, GPT-5.5-class+, Gemini 3.x+.

## See it catch you

The Guide also ships as an **ambient coach** — install it once, then work in Claude Code exactly as you normally would. It watches silently; most turns it says nothing. It speaks up *only* when it catches a learning opportunity, and links you straight to the fix.

You're mid-task, about to take a shortcut:

> **You → Claude:** "Delete these failing tests — I just need the build green."
>
> **🧭 Agentic Coach** — *catching a learning opportunity:*
>
> 💡 **Red test? Find out *why* before you delete it.** Code regressed → fix the code (deleting it buries a live bug); feature gone or test stale → cleanup's fine. → **[Tier 4 — make the agent prove it's done](guide.md#tier-4--make-the-agent-prove-its-done-so-you-can-trust-the-output-the-loop)**

You're talking to Claude; the coach just listens in — one catch, one nudge, one click to the Guide, then quiet again. It catches the *thinking*, not the syntax.

That's just one of **three ways to use this** — read the Guide, get tutored through it, or get coached while you work. Here's the full picture:

## Who this is for

- **Engineers and technical founders** — *operate* an agent in a real repo, not vibe-code a demo.
- **Product managers** closing the tech gap — ship real changes, not just specs.
- **Senior leaders** who want real hands-on experience, not slideware.
- **Non-IT professionals** entering product development in the age of AI.

## Big idea — engineer the system, not the prompt

It all reduces to **one** climb. Professional agentic engineering is **not prompt engineering — it's engineering the system around the model.** As the work gets harder, *where you apply effort* moves up the ladder; the prompt shrinks while the system around it grows:

```mermaid
flowchart LR
  P[Prompt] --> T[Task] --> C[Context] --> V[Verification] --> E[Environment] --> X[Execution]
```

The eight tiers below are the rungs; learn the ladder and the 60 tips fall into place.

## What's inside

**Three in one** — the same material in three forms: read it, get tutored through it, or get coached *while you work*.

### 1) The Guide — [`guide.md`](guide.md)

One ladder of **eight tiers, simple → hard**, where the work shifts from wording the prompt to engineering the system around the model:

| Tier | You learn to… |
|---|---|
| **T1 Prompts** | Write prompts the agent can act on |
| **T2 Plan & slice** | Plan and slice before you build |
| **T3 Context** | Give the agent the right context and tools |
| **T4 Verify loop** | Make the agent prove it's done *(the heart of it)* |
| **T5 Git** | Checkpoint everything so you can roll back |
| **T6 Orchestrate** | Run many agents at once |
| **T7 Fleet** | Operate your agents as a fleet |
| **T8 Production** | Put agents into production (the execution layer) |

Climb only as high as your work demands. New to this? Start at **T1**; already fluent? jump straight to the tier that matches you.

Every tip is a concrete **Instead → Prefer** pair — the anti-example, then the fix. E.g. Tip 2:

> ❌ "Clean up the auth code."
>
> ✅ "Extract token refresh in `session.ts` into the existing `RetryPolicy` class."

### 2) The Tutor — [`CLAUDE.md`](CLAUDE.md)

Turns Claude Code into an interactive tutor for the Guide: one small concept at a time, you do each one, and a separate quizmaster checks that it stuck.

**Use it** — clone the repo, open Claude Code in the folder, and say `hi`. It diagnoses your level and starts teaching:

```shell
git clone https://github.com/krivitsky/professional-agentic-product-engineering
cd professional-agentic-product-engineering
claude        # then type:  hi
```

*Shown with [Claude Code](https://claude.com/claude-code), the example harness used throughout — but the Guide and Tutor are harness-agnostic; this repo ships both `CLAUDE.md` and `AGENTS.md`, so any agent that reads them works.*

**It reads your real prompts first (with consent).** Instead of interrogating you, the tutor offers to glance at your past Claude Code prompts across your local projects and build a *portrait* — your stack, your prompting habits, the tier those imply.

Then it tailors each lesson's examples to *your* stack and repos — and aims its advice at the prompting habits it actually saw in your history — instead of a generic textbook example.

Read-only and local — nothing leaves your machine.

### 3) The Coach — [`agentic-coach`](plugins/agentic-coach)

The ambient coach plugin from above: in-the-flow nudges to the right tip, no lesson required.

**Install it** — add the marketplace, install, reload:

```shell
/plugin marketplace add krivitsky/professional-agentic-product-engineering
/plugin install agentic-coach@pae
/reload-plugins
```

Then just work — it nudges when it catches something. Say `coach me` to ask it directly, or `stop coaching` to silence it. *(Needs `jq` on your PATH.)*

## Contributing

⭐ [Star the repo](https://github.com/krivitsky/professional-agentic-product-engineering) if it helps.

Found a better example, a fix, or a new tip? **Submit an issue or PR** — or just ask your harness (Claude, etc.) to open one for you. Help yourself and the next person learn better.

## Credits

**Maintainer:** [Alexey Krivitsky](https://www.linkedin.com/in/alexeykrivitsky/) (alexey@krivitsky.com)  
**Upstream:** https://github.com/krivitsky/professional-agentic-product-engineering
