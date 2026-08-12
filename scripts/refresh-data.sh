#!/usr/bin/env bash
# Refresh BF6 loadout data from raymdl/BF6-Weapon-Analyzer, rebuild embedded JS,
# and push changes to GitHub so Pages stays in sync.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

/usr/bin/python3 scripts/refresh_data.py

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
  data/last-refresh.json
  js/embedded-data.js
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

/usr/bin/git commit -m "$(cat <<'EOF'
Refresh weapon data for GitHub Pages.

EOF
)"

# Use gh credentials for this push only (no permanent git config change).
/usr/bin/git -c "credential.helper=!/usr/bin/gh auth git-credential" push origin HEAD

echo "git: published data update to origin"
