#!/usr/bin/env bash
# Agentic coach hook helper.
#   $1 = event: prompt | bash | edit
# Reads the hook JSON on stdin, decides whether to inject a coaching reminder.
# Dedup of already-given tips is handled model-side (the skill rule); this script
# only gates on the off-switch flag and the per-event triggers.
set -uo pipefail

ev="${1:-prompt}"
in="$(cat)"

# Off-switch: if the user said "stop coaching", the skill drops this flag. Stay silent.
flag="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/.agentic-coach-off"
[ -f "$flag" ] && exit 0

dont_repeat="Do not repeat a tip you already gave earlier in this conversation; if the same moment recurs, stay silent."

emit() { # $1 = text, $2 = hookEventName
  jq -nc --arg c "$1" --arg e "$2" \
    '{hookSpecificOutput:{hookEventName:$e,additionalContext:$c}}'
}

case "$ev" in
  prompt)
    emit "[agentic-coach] Consult the agentic-coach skill. If a clear agentic anti-pattern applies this turn, surface the SINGLE most relevant tip in one line (Tip N — name + one-line fix), then continue the task. If none clearly applies, stay silent. ${dont_repeat} Never nag, max one nudge." "UserPromptSubmit"
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
