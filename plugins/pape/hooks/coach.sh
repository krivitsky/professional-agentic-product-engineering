#!/usr/bin/env bash
# Agentic coach hook helper.
#   $1 = event: prompt | bash | edit
# Reads the hook JSON on stdin, decides whether to inject a coaching reminder.
# Dedup of already-given tips is handled model-side (the skill rule); this script
# gates on the off-switch flag and the per-event triggers.
set -uo pipefail

# CLAUDE_PLUGIN_ROOT is set by Claude Code at runtime; fall back to this script's
# plugin dir so the hook also works under direct testing.
CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

ev="${1:-prompt}"
in="$(cat)"
flag="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/.agentic-coach-off"
# This text is injected on EVERY prompt, so every word is paid for on turns
# where no tip fires — which is most of them. It used to restate the whole
# citation format (tip numbering, anchor derivation, the footer template),
# ~350 tokens a turn, duplicating SKILL.md §Format. The skill already holds
# those rules and loads when it fires, so the hook's only jobs are: prompt the
# consideration, and make sure the model reads the skill before citing rather
# than citing from memory.
skill_first="Load the skill before citing — it holds the tip numbering, anchor form and credit footer. Never cite from memory. Don't repeat a tip already given this conversation."

emit() { # $1 = text, $2 = hookEventName
  jq -nc --arg c "$1" --arg e "$2" \
    '{hookSpecificOutput:{hookEventName:$e,additionalContext:$c}}'
}

# Explicit invocation ("coach", "coach me", "coach this") — only on a prompt event.
explicit=0
if [ "$ev" = "prompt" ]; then
  pr="$(printf '%s' "$in" | jq -r '.prompt // empty' 2>/dev/null)"
  # match "coach" as a whole word, but NOT "coaching" (so "stop coaching" doesn't
  # trip it) and NOT a hyphenated name ending in it — "/pape:agentic-coach" and
  # "the agentic-coach skill" name the skill, they don't ask to be coached.
  printf '%s' "$pr" | grep -qiE '(^|[^a-z-])coach([^a-z]|$)' && explicit=1
fi

# Off-switch: silent — UNLESS the user is explicitly asking to be coached this turn.
if [ "$explicit" != "1" ] && [ -f "$flag" ]; then
  exit 0
fi

case "$ev" in
  prompt)
    if [ "$explicit" = "1" ]; then
      emit "[pape] The user asked to be coached — engage now, overriding silence-by-default. Read what they are doing and give the most relevant tip(s), briefly. ${skill_first}" "UserPromptSubmit"
    else
      emit "[pape] agentic-coach: if a guide tip genuinely fits this turn — including a question about operating the agent, not just an anti-pattern — surface ONE, briefly, then continue. Silent when none fits. ${skill_first}" "UserPromptSubmit"
    fi
    ;;
  bash)
    cmd="$(printf '%s' "$in" | jq -r '.tool_input.command // empty' 2>/dev/null)"
    printf '%s' "$cmd" | grep -qiE 'git commit|git push|npm run build|npm run test|vitest|next build|npm test|pytest|go test|cargo (test|build)' \
      && emit "[pape] A commit/build/test just ran — checkpoint or done-claim moment. If it fits, surface ONE of Tip 4.1, 4.5 or 5.1. Else silent. ${skill_first}" "PostToolUse"
    ;;
  edit)
    fp="$(printf '%s' "$in" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
    printf '%s' "$fp" | grep -qiE '(^|/)[^/]*(test|spec)[^/]*\.|\.(test|spec)\.|\.feature$|_test\.|test_' \
      && emit "[pape] A test/spec file was just edited. If tests are being weakened to pass, surface Tip 4.2 in one line. Else silent. ${skill_first}" "PostToolUse"
    ;;
esac
exit 0
