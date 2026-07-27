#!/usr/bin/env bash
# This repo's own T5 gate — see guide.md Tier 5, and checks.md C-2.
#
# CLAUDE.md lists four things that must be re-synced "in the same session" after
# a guide.md change. Until now, nothing enforced that: the rules were prose, and
# the only check ran in CI, after a push. That is precisely the defect this
# repo's own audit catalogue files as C-2 — "absolutes with nothing enforcing
# them" — so the guide's repo was failing a check the guide teaches.
#
# Fires after an edit, never blocks, and says only what is actually out of sync.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
command -v jq >/dev/null || exit 0

fp="$(cat | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -z "$fp" ] && exit 0
rel="${fp#"$PWD/"}"
msg=""

case "$rel" in
  wiki/*)
    # A broken wikilink is invisible in Obsidian until someone clicks it.
    if ! out=$(./scripts/lint-wiki.sh 2>&1); then
      msg="[pape] The wiki vault no longer lints. Fix before finishing:
$(printf '%s' "$out" | grep FAIL | head -10)"
    fi
    ;;
  guide.md)
    # The bundled copy is CI-enforced byte-identical; catching it here saves a
    # red build, and the version bump is the half people forget.
    if ! diff -q guide.md plugins/pape/guide.md >/dev/null 2>&1; then
      msg="[pape] guide.md changed but plugins/pape/guide.md is stale. Run ./scripts/sync-plugin.sh, bump \`version\` in plugins/pape/.claude-plugin/plugin.json, and re-check the wiki + web NAV per CLAUDE.md."
    fi
    ;;
  plugins/pape/skills/*/SKILL.md)
    # A `: ` in an unquoted description silently voids the whole frontmatter,
    # taking every natural-language trigger with it. This shipped once.
    if command -v python3 >/dev/null; then
      bad=$(python3 - "$rel" <<'PY' 2>/dev/null
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); raw = p.read_text()
if not raw.startswith('---\n'):
    print("no frontmatter"); raise SystemExit
block = raw.split('---\n', 2)[1]
for line in block.split('\n'):
    m = re.match(r'^(\w[\w-]*):\s+(.*)$', line)
    if m and not m[2].startswith(('"', "'", '|', '>')) and ': ' in m[2]:
        print(f"`{m[1]}` contains ': ' unquoted — YAML reads it as a nested key "
              f"and drops every field. Use an em dash, or quote the value.")
PY
)
      [ -n "$bad" ] && msg="[pape] $rel frontmatter is invalid: $bad"
    fi
    ;;
esac

[ -z "$msg" ] && exit 0
jq -nc --arg c "$msg" \
  '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$c}}'
exit 0
