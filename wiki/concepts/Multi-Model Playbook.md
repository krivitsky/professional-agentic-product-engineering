# Multi-Model Playbook
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

It works for one reason: **different models have different blind spots**, so a second model catches what the first missed. Reach for it when a task is **high-stakes, decomposable, or verifiable**; skip it when one strong model already clears the bar.

## The basics (Tier 2)

Two moves, no infrastructure:

- **Tip 2.7 — Plan with the smart model, build with the cheap one.**
  > ❌ Instead of: running planning and coding on the same single model.
  >
  > ✅ Prefer: `/model opusplan` — Opus reasons through the plan, Sonnet writes the code. One command, top-tier planning, without paying Opus rates on every edit.
- **Tip 2.8 — Have one agent draft the spec and a different one critique it — before any code.** One agent drafts SPEC.md; a *different* model attacks it ("Find gaps, wrong assumptions, missing edge cases; list them, don't rewrite"). The spec is the contract the whole build runs against, so this is the highest-leverage place to spend a second model.

## The full toolkit (Tier 6) — two levels

Get fluent with Level 1 before reaching for Level 2.

### Level 1 — Multiple Anthropic models inside Claude Code

Native path: built in, fully supported, costs nothing but a flag or a frontmatter line. Default division of labor: **Opus** for reasoning/planning/judgment, **Sonnet** for implementation, **Haiku** for search/explore/classification.

- **Assign a model per subagent.** Set `model:` in each `.claude/agents/*.md` — routing a grep-heavy explorer to Haiku instead of Opus is free money. (Or a session-wide default via `CLAUDE_CODE_SUBAGENT_MODEL` for everything set to `inherit`.)
- **The advisor.** Run a cheaper main model and let it consult a stronger one only at decision points. Anthropic's numbers: Sonnet + an Opus advisor beat Sonnet alone by 2.7 pts on SWE-bench Multilingual *while cutting cost per task ~12%*. The advisor reads shared context and writes only a short plan (~400–700 tokens), never tools or user-facing output. A **quality/cost** lever.
- **Fallback chains.** Declare an ordered fallback (`claude --fallback-model sonnet,haiku`) so the turn retries on the next model instead of dying on a single `overloaded` response. A **reliability** lever, distinct from the advisor.

### Level 2 — Reaching beyond Anthropic

The advanced case: other frontier labs (GPT-5.5-class, Gemini 3.x), open-weight models (DeepSeek/Qwen/Llama-class), or models you self-host. More power and more cost/privacy control, but you leave the natively-supported path and take on compatibility + governance work.

- **Cross-lab diff review** — the cross-model form of the review-agent pattern: Claude writes, a different lab reviews. See [[The Review-Agent Pattern]].
- **Wiring in.** Claude Code speaks the **Anthropic Messages API**, so anything you route to must present an Anthropic-compatible endpoint. Options: **OpenRouter** (managed, hosted, one key + "Anthropic Skin", swap env vars) or **Claude Code Router / LiteLLM** (rules-based local gateway; also how you reach self-hosted/open-weight via Ollama, vLLM, LM Studio — keep code on your own hardware).
- **The Level-2 tax.** More models = more latency, cost, aggregation seams. Non-Anthropic models routed natively may lose tool use, extended thinking, or prompt caching. Open-weight/self-hosted still trail the frontier; self-hosting is real ops. There's also a **trust boundary** — routing through a third party means that provider's data handling, not Anthropic's.
- **Try the cheaper trick first:** run your *best* model a few times and pick the best answer — research (Self-MoA) finds that often beats mixing in weaker models, which can drag the average down.

## Related
- [[Orchestration]]
- [[The Review-Agent Pattern]]
- [[Shaping and Slicing]]
- [[Claude Code]]
