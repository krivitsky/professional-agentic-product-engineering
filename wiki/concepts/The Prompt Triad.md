# The Prompt Triad

**Source:** [guide.md](../../guide.md) (root of repo — canonical, not copied here)
**Created:** 2026-07-20

The opening mental model of [[Tier 1 — Professional Prompting]]: every prompt is three things — **intent · context · constraint**. Fill all three in one message and the agent runs far on its own. The 14 Tier 1 tips are how you fill each slot well.

## The three slots

- **Intent** — the outcome, not the steps. You own the destination; the agent owns the route.
- **Context** — the world the agent reasons inside. Without it, the model fills the gaps with its priors — it guesses. Context is how you replace guessing with knowing.
- **Constraint** — the boundary: what not to do, how far, how much. What keeps a powerful generator small, safe, and reviewable.

**The through-line:** you give the ends and the edges; the agent works out the means — grounded in the context you supply.

## Which Tier 1 tip fills which slot

- **Intent** — [[Tip 1.1 — Hand over the outcome, not a file list]], [[Tip 1.2 — Be specific — vagueness is now taken literally]], [[Tip 1.3 — Say what to do, not what to avoid]], [[Tip 1.5 — Specify the output shape, not just the goal]]
- **Context** — [[Tip 1.4 — Give the reason; motivation makes it generalize]], [[Tip 1.6 — Show examples instead of describing style]], [[Tip 1.7 — Follow the house style, don't invent one]], [[Tip 1.8 — Show, don't tell — use the input channels]], [[Tip 1.10 — Paste raw errors, don't paraphrase them]]
- **Constraint** — [[Tip 1.11 — Constrain scope — modern models over-engineer unless you stop them]], [[Tip 1.12 — Narrow the edit surface — a small diff is a reviewable diff]], [[Tip 1.13 — Dial effort; don't beg for thoroughness]]
- **The fourth move** (handling the gaps in any slot) — [[Tip 1.9 — Invite uncertainty instead of forcing an answer]]
- **All three at once** — [[Tip 1.14 — Say it all in your first message]]

## The triad up the ladder

The triad isn't only a Tier 1 device — it's the spine the later tiers build on:

- [[Tier 2 — Shaping and Slicing]] — the triad externalized: intent becomes a written spec, context comes from investigating first, and each slice is a constraint small enough to check and undo.
- [[Tier 3 — Context Management]] — the context slot, scaled: from pasting context into a prompt to engineering it (@files, tools, MCP, durable memory).
- [[Tier 4 — Loop Until Done]] — intent made executable: the Given/When/Then you specced becomes the check the loop must pass.
- [[Tier 5 — Checkpointing and Hardening]] — constraints hardened: from a line in the prompt into checkpoints, CI, and rollback the harness enforces.

## Related
- [[Tier 1 — Professional Prompting]]
- [[From Prompts to Systems]]
- [[The Eight Tiers]]
