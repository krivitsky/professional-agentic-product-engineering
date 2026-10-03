#!/usr/bin/env bash
# Blocks Claude Code's SendFeedback tool in this repo (issue #3). Another T5
# gate: a PreToolUse exit 2, per guide.md Tip 5.4.
#
# SendFeedback drafts a report to Anthropic about Claude Code. The tutor reached
# for it after deciding its own teaching rules were wrong — but those rules are
# CLAUDE.md and guide.md, which Anthropic can't fix. The report belongs here, as
# an issue or PR the user decides to raise. CLAUDE.md's Non-negotiable rules
# say never; this is what makes the never hold (checks.md C-2). The tool asks
# for no permission and the model is told not to mention it, so nothing else
# would catch the call.
#
# Tradeoff: genuine Claude Code product feedback drafted from inside this repo
# is blocked too. Accepted — that report should come from the user via
# /feedback (a slash command, not a tool call, so this hook never sees it), not
# be drafted by the tutor on its own initiative.
#
# No jq, no stdin parsing, no `|| exit 0`, on purpose: the matcher already picks
# the tool, and a gate that can exit 0 fails open (checks.md C-4).
set -uo pipefail

echo "Blocked: SendFeedback reports to Anthropic about Claude Code. This repo IS the tutor — a flaw in how it teaches is a flaw in CLAUDE.md or guide.md, and belongs in a pull request to krivitsky/professional-agentic-product-engineering. Tell the user what you found and suggest an issue or PR there instead." >&2
exit 2
