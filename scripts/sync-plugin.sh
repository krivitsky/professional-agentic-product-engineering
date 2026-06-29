#!/usr/bin/env bash
# Copy the canonical guide into the agentic-coach plugin so the bundled copy
# never drifts. Run this whenever guide.md changes (CI enforces it on push).
set -euo pipefail
cd "$(dirname "$0")/.."
cp guide.md plugins/agentic-coach/guide.md
echo "Synced guide.md -> plugins/agentic-coach/guide.md"
