#!/usr/bin/env bash
# Lint the Obsidian vault in wiki/ against the rules in wiki/CLAUDE.md.
#
# The vault is the wikified view of the root guide.md, shaped as a 3-level tree
# (guide -> 8 tier hubs -> one page per tip). Every rule below exists because
# breaking it is invisible in Obsidian until someone clicks a dead link or the
# graph quietly flattens into a star.
#
# Run from anywhere; exits non-zero on any violation.
set -uo pipefail
cd "$(dirname "$0")/.."
exec python3 - "$@" <<'PY'
import re, sys, pathlib, collections

root = pathlib.Path('wiki')
guide = pathlib.Path('guide.md').read_text()
fail = []

pages = sorted(p for p in root.rglob('*.md') if p.name not in ('CLAUDE.md',))
by_title = {p.stem: p for p in pages}

def real_links(text):
    """Wikilinks inside a fence or a code span are illustrative, not real links.
    Blank those regions out rather than deleting them, so offsets survive — and
    never strip backticks *inside* a [[target]], because several tip titles
    legitimately contain them (`/clear`, `gh`)."""
    masked = list(text)
    for m in re.finditer(r'```.*?```|`[^`\n]*`', text, flags=re.S):
        if '[[' in m.group(0):                      # a fenced/inline example link
            masked[m.start():m.end()] = ' ' * (m.end() - m.start())
    masked = ''.join(masked)
    return [m.group(1).strip() for m in re.finditer(r'\[\[([^\]|]+)', masked)]

# ---- 1. every [[wikilink]] resolves -----------------------------------------
inbound = collections.Counter()
for p in pages:
    for t in real_links(p.read_text()):
        if t in by_title:
            if by_title[t] != p:            # self-links don't count as inbound
                inbound[t] += 1
        else:
            fail.append(f"{p}: broken wikilink [[{t}]]")

# ---- 2. no orphans (index/log are navigation, not content) ------------------
for p in pages:
    if p.parent == root:                    # index.md, log.md
        continue
    if inbound[p.stem] == 0:
        fail.append(f"{p}: orphan — no page links to it")

# ---- 3. filename == H1, and the metadata block exists ----------------------
for p in pages:
    if p.parent == root:
        continue
    first = p.read_text().lstrip().split('\n', 1)[0]
    m = re.match(r'#\s+(.*)', first)
    if not m:
        fail.append(f"{p}: first line is not an H1")
    elif m.group(1).strip() != p.stem:
        fail.append(f"{p}: H1 {m.group(1).strip()!r} != filename {p.stem!r} — wikilinks won't resolve")
    if '**Source:**' not in p.read_text() and '**Sources:**' not in p.read_text():
        fail.append(f"{p}: no **Source:** metadata line")

# ---- 4. the tree rule: tip pages never hard-link the root guide -------------
for p in pages:
    if p.stem.startswith('Tip ') and '](../../guide.md)' in p.read_text():
        fail.append(f"{p}: tip page links guide.md directly — flattens the graph into a star "
                    f"(wiki/CLAUDE.md: attribute as plain `guide.md #tip-N-M`)")

# ---- 5. tip coverage: guide.md anchors <-> tip pages, both ways -------------
anchors = {f"{t}.{n}" for t, n in re.findall(r'<a id="tip-(\d+)-(\d+)"></a>', guide)}
tip_pages = {m.group(1) for p in pages
             if (m := re.match(r'Tip (\d+\.\d+) —', p.stem))}
for a in sorted(anchors - tip_pages, key=lambda s: [int(x) for x in s.split('.')]):
    fail.append(f"guide.md has tip {a} but the vault has no page for it")
for t in sorted(tip_pages - anchors, key=lambda s: [int(x) for x in s.split('.')]):
    fail.append(f"vault has a page for tip {t} but guide.md has no <a id=\"tip-...\"> for it")

# ---- 6. every tip is listed by its tier hub --------------------------------
for tier in range(1, 9):
    hub = next((p for p in pages if p.stem.startswith(f'Tier {tier} —')), None)
    if not hub:
        fail.append(f"no tier hub page for Tier {tier}")
        continue
    listed = set(re.findall(r'\[\[Tip (\d+\.\d+) —', hub.read_text()))
    for a in sorted(anchors, key=lambda s: [int(x) for x in s.split('.')]):
        if a.startswith(f"{tier}.") and a not in listed:
            fail.append(f"{hub}: does not list Tip {a}")

# ---- 7. index.md stays at tier level (listing tips re-flattens the graph) ---
idx = (root / 'index.md').read_text()
if re.search(r'\[\[Tip \d+\.\d+', idx):
    fail.append("wiki/index.md links individual tips — keep it at tier level")

print(f"checked {len(pages)} pages · {len(anchors)} tips in guide.md · "
      f"{sum(inbound.values())} resolved wikilinks")
if fail:
    for f in fail:
        print(f"::error::{f}" if '--ci' in sys.argv else f"  FAIL {f}")
    sys.exit(1)
print("wiki lint clean")
PY
