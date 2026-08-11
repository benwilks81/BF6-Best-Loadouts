#!/usr/bin/env bash
# Install weekly BF6 data refresh as a user systemd timer.
# Run: ./install-refresh-timer.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNIT_DIR="${HOME}/.config/systemd/user"

mkdir -p "$UNIT_DIR"
chmod +x "$SCRIPT_DIR/scripts/refresh-data.sh" "$SCRIPT_DIR/scripts/refresh_data.py"

cp "$SCRIPT_DIR/bf6-loadouts-refresh.service" "$UNIT_DIR/"
cp "$SCRIPT_DIR/bf6-loadouts-refresh.timer" "$UNIT_DIR/"

systemctl --user daemon-reload
systemctl --user enable --now bf6-loadouts-refresh.timer

echo "Installed bf6-loadouts-refresh.timer (weekly Monday 03:15)."
echo "Status:"
systemctl --user status bf6-loadouts-refresh.timer --no-pager || true
echo ""
echo "Manual run: systemctl --user start bf6-loadouts-refresh.service"
echo "Logs:       journalctl --user -u bf6-loadouts-refresh.service -n 50"
