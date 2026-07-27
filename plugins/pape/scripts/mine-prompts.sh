#!/usr/bin/env bash
# Mine the user's real Claude Code prompts across all local projects so the
# tutor can build a portrait (stack, prompting style, tier) for USER.md instead
# of interrogating the learner.
#
# DESIGN — hybrid, two jobs kept separate:
#   1. EXTRACT (this script, mechanical): pull typed prompts out of the JSONL
#      transcripts. Structural, deterministic, cheap. jq is the right tool;
#      an LLM should never chew hundreds of MB of JSON.
#   2. JUDGE (the tutor LLM, downstream): read this digest and infer stack,
#      prompting style, and tier — and discard whatever harness noise slips
#      through. Semantic, robust to new junk.
#   So this script does ONLY a LIGHT structural pre-filter (drop <xml>-ish
#   blocks + blanks). It deliberately does NOT maintain a blocklist of every
#   harness-noise phrase — that judgment is the LLM's, the backstop downstream.
#
# Reads ~/.claude/projects/<slug>/*.jsonl (read-only). Emits a markdown digest.
#
# Usage:
#   scripts/mine-prompts.sh [--per-project N] [--max-len L] [FILTER]
#     --per-project N   sample N prompts per project (default 14)
#     --max-len L       truncate each prompt to L chars (default 220)
#     FILTER            only projects whose slug contains FILTER (substring)
#
# Privacy: this touches EVERY local project (incl. Dropbox/Drive paths), not
# just this repo. Only run it with the learner's consent.
set -euo pipefail

PER_PROJECT=14
MAX_LEN=220
FILTER=""
ROOT="${CLAUDE_PROJECTS_DIR:-$HOME/.claude/projects}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --per-project) PER_PROJECT="$2"; shift 2 ;;
    --max-len)     MAX_LEN="$2"; shift 2 ;;
    -h|--help)     sed -n '2,28p' "$0"; exit 0 ;;
    *)             FILTER="$1"; shift ;;
  esac
done

command -v jq >/dev/null || { echo "mine-prompts: jq required on PATH" >&2; exit 1; }
[[ -d "$ROOT" ]] || { echo "mine-prompts: no history dir at $ROOT" >&2; exit 1; }

# Pull typed prompts (one per line): type=="user" turns whose content is a plain
# string — array content is tool_results / structured blocks, skip it. Filtering
# is STRUCTURAL only — deterministic machine markers, never semantic judgment
# (that's the LLM's job downstream): drop <xml>-ish harness blocks (system
# reminders, command echoes, caveats all open with '<'), the two fixed
# harness-injected prefixes (context-continuation summaries + Stop-hook
# directives), and blanks.
extract_lines() {
  jq -rc 'select(.type=="user")
            | .message.content
            | select(type=="string")
            | gsub("\n";" ")' "$1" 2>/dev/null \
    | grep -vE '^[[:space:]]*<' \
    | grep -viE '^[[:space:]]*This session is being continued from a previous conversation' \
    | grep -viE '^[[:space:]]*A session-scoped Stop hook is now active' \
    | grep -vE '^[[:space:]]*$' \
    | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//' || true
}

ALL_TMP="$(mktemp)"
trap 'rm -f "$ALL_TMP"' EXIT

total_projects=0
total_prompts=0

echo "# Claude Code prompt history digest"
echo
echo "_Source: \`$ROOT\` (read-only). For the tutor portrait._"
echo "_Light structural filter only — IGNORE any leftover harness noise (caveats,"
echo "slash-command output, context-continuation summaries) when judging._"
echo

for dir in "$ROOT"/*/; do
  slug="$(basename "$dir")"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && continue
  shopt -s nullglob 2>/dev/null || true
  files=("$dir"*.jsonl)
  [[ ${#files[@]} -eq 0 ]] && continue

  proj_tmp="$(mktemp)"
  for f in "${files[@]}"; do
    extract_lines "$f"
  done > "$proj_tmp"

  count=$(grep -cve '^$' "$proj_tmp" || true)
  [[ "$count" -eq 0 ]] && { rm -f "$proj_tmp"; continue; }

  total_projects=$((total_projects + 1))
  total_prompts=$((total_prompts + count))
  cat "$proj_tmp" >> "$ALL_TMP"

  # Human-readable project name from the slug (drop the -Users-<user>- prefix).
  pretty="${slug#-Users-*-src-}"; pretty="${pretty#-Users-*-}"
  echo "## ${pretty}  ·  ${count} prompts"
  tail -n "$PER_PROJECT" "$proj_tmp" | while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    printf -- '- %s\n' "${line:0:$MAX_LEN}"
  done
  echo
  rm -f "$proj_tmp"
done

echo "---"
echo
echo "## Global signal"
echo
echo "**Totals:** ${total_prompts} prompts across ${total_projects} projects."
echo
echo "### Most-repeated prompts (mechanical frequency — read as habits)"
# `… | head` closes the pipe early; under `set -e`+pipefail the upstream sort's
# SIGPIPE would abort the whole script. `|| true` keeps the clean exit.
{ sort "$ALL_TMP" | uniq -c | sort -rn | head -20 \
  | sed -E 's/^[[:space:]]*([0-9]+) /- (×\1) /'; } || true
echo
echo "_Tutor: from the samples above, identify (a) tech stacks & tools, (b)"
echo "prompting style — vague bare-imperatives vs outcome+constraint, path/@-file"
echo "use, plan/verify habits, and (c) the tier this implies. Write it to USER.md._"
