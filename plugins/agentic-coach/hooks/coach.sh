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
dont_repeat="Do not repeat a tip you already gave earlier in this conversation; if the same moment recurs, stay silent."
attribute="If the guide shapes your reply even partially, attribute it: a quoted tip is credited by its '> Tip N' tag; a synthesized answer (no verbatim quote) ends with one line '↳ shaped by agentic-coach · Tip N'. No footer on turns the guide did not influence. EVERY 'Tip N' you write — nudge OR footer — MUST be a Markdown link with the bracket form so 'Tip N' itself is the clickable text and the URL stays hidden: [Tip N](https://github.com/krivitsky/professional-agentic-product-engineering/blob/main/guide.md#tip-N). Never print the raw URL next to 'Tip N'; a bare unlinked 'Tip N', or a visible https:// URL, is a bug."

emit() { # $1 = text, $2 = hookEventName
  jq -nc --arg c "$1" --arg e "$2" \
    '{hookSpecificOutput:{hookEventName:$e,additionalContext:$c}}'
}

# Explicit invocation ("coach", "coach me", "coach this") — only on a prompt event.
explicit=0
if [ "$ev" = "prompt" ]; then
  pr="$(printf '%s' "$in" | jq -r '.prompt // empty' 2>/dev/null)"
  # match "coach" as a whole word, but NOT "coaching" (so "stop coaching" doesn't trip it)
  printf '%s' "$pr" | grep -qiE '(^|[^a-z])coach([^a-z]|$)' && explicit=1
fi

# Off-switch: silent — UNLESS the user is explicitly asking to be coached this turn.
if [ "$explicit" != "1" ] && [ -f "$flag" ]; then
  exit 0
fi

case "$ev" in
  prompt)
    if [ "$explicit" = "1" ]; then
      emit "[agentic-coach] The user explicitly asked to be coached. Engage now: read their current prompt, plan, or recent changes, and surface the most relevant tip(s) from the agentic-coach skill (full text in ${CLAUDE_PLUGIN_ROOT}/guide.md), briefly. This OVERRIDES the usual 'silence by default'. ${dont_repeat} ${attribute}" "UserPromptSubmit"
    else
      emit "[agentic-coach] Consult the agentic-coach skill. If a clear agentic anti-pattern applies this turn, surface the SINGLE most relevant tip in one line (Tip N — name + one-line fix), then continue the task. If the user asks 'why' or 'how to / how do I' about how they're operating the agent (not about the code or domain itself), teach the answer from the guide and cite the tip. Otherwise stay silent. ${dont_repeat} Never nag, max one nudge. ${attribute}" "UserPromptSubmit"
    fi
    ;;
  bash)
    cmd="$(printf '%s' "$in" | jq -r '.tool_input.command // empty' 2>/dev/null)"
    printf '%s' "$cmd" | grep -qiE 'git commit|git push|npm run build|npm run test|vitest|next build|npm test|pytest|go test|cargo (test|build)' \
      && emit "[agentic-coach] A commit/build/test just ran — a checkpoint or done-claim moment. If it fits, surface ONE of Tip 31 (make the Definition of Done executable), 35 (demand evidence, not a claim), or 40 (commit every green step), then continue. Else silent. ${dont_repeat}" "PostToolUse"
    ;;
  edit)
    fp="$(printf '%s' "$in" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
    printf '%s' "$fp" | grep -qiE '(^|/)[^/]*(test|spec)[^/]*\.|\.(test|spec)\.|\.feature$|_test\.|test_' \
      && emit "[agentic-coach] A test/spec file was just edited. If the agent is weakening or rewriting tests to make them pass, surface Tip 32 (do TDD — implement against the test; do not edit tests to pass) in one line. Else silent. ${dont_repeat}" "PostToolUse"
    ;;
esac
exit 0
