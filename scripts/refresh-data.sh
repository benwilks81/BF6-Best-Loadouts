#!/usr/bin/env bash
# Refresh BF6 loadout data from raymdl/BF6-Weapon-Analyzer, rebuild embedded JS,
# and push changes to GitHub so Pages stays in sync.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

/usr/bin/python3 scripts/refresh_data.py

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return
  fi
  find "$HOME/.cursor-server/bin" "$HOME/.vscode-server" -type f -name node -executable -print -quit 2>/dev/null || true
}

NODE_BIN="$(find_node || true)"
if [[ -z "$NODE_BIN" ]]; then
  echo "loadout reasons: node not found — README section left unchanged" >&2
else
  "$NODE_BIN" scripts/explain_loadouts.js
fi

if ! /usr/bin/git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "git: not a repository — skipped GitHub sync"
  exit 0
fi

if ! /usr/bin/git remote get-url origin >/dev/null 2>&1; then
  echo "git: no origin remote — skipped GitHub sync"
  exit 0
fi

# Only publish the data artifacts the site needs.
SYNC_PATHS=(
  data/weapons.json
  data/attachments.json
  data/balance_tables.json
  data/ammo.json
  data/ballistics.json
  data/recoil_decay.json
  data/unlocks.json
  data/changelog.json
  data/last-refresh.json
  js/embedded-data.js
  README.md
)

/usr/bin/git add -- "${SYNC_PATHS[@]}"

if /usr/bin/git diff --cached --quiet; then
  echo "git: no data changes to publish"
  exit 0
fi

export GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-benwilks81}"
export GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-benwilks81@users.noreply.github.com}"
export GIT_COMMITTER_NAME="${GIT_COMMITTER_NAME:-$GIT_AUTHOR_NAME}"
export GIT_COMMITTER_EMAIL="${GIT_COMMITTER_EMAIL:-$GIT_AUTHOR_EMAIL}"

STAGED="$(/usr/bin/git diff --cached --name-only)"
if printf '%s\n' "$STAGED" | grep -qx 'README.md' && printf '%s\n' "$STAGED" | grep -qv '^README.md$'; then
  COMMIT_MSG="Refresh weapon data and the loadout reasons."
elif printf '%s\n' "$STAGED" | grep -qx 'README.md'; then
  COMMIT_MSG="Update loadout reasons for the current weapon and attachment stats."
else
  COMMIT_MSG="Refresh weapon data for GitHub Pages."
fi

/usr/bin/git commit -m "$COMMIT_MSG"

# Use gh credentials for this push only (no permanent git config change).
/usr/bin/git -c "credential.helper=!/usr/bin/gh auth git-credential" push origin HEAD

echo "git: published data update to origin"
