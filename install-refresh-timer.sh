#!/usr/bin/env bash
# Install BF6 Best Loadouts user systemd units:
# - static HTTP server (survives SSH disconnect / reboot with lingering)
# - healthcheck timer (restarts server if content is unreachable)
# - weekly data refresh timer
# Run: ./install-refresh-timer.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNIT_DIR="${HOME}/.config/systemd/user"

mkdir -p "$UNIT_DIR"
chmod +x \
  "$SCRIPT_DIR/scripts/refresh-data.sh" \
  "$SCRIPT_DIR/scripts/refresh_data.py" \
  "$SCRIPT_DIR/scripts/healthcheck.sh"

cp "$SCRIPT_DIR/bf6-loadouts-refresh.service" "$UNIT_DIR/"
cp "$SCRIPT_DIR/bf6-loadouts-refresh.timer" "$UNIT_DIR/"
cp "$SCRIPT_DIR/bf6-loadouts-http.service" "$UNIT_DIR/"
cp "$SCRIPT_DIR/bf6-loadouts-http-health.service" "$UNIT_DIR/"
cp "$SCRIPT_DIR/bf6-loadouts-http-health.timer" "$UNIT_DIR/"

systemctl --user daemon-reload
systemctl --user enable --now bf6-loadouts-http.service
systemctl --user enable --now bf6-loadouts-http-health.timer
systemctl --user enable --now bf6-loadouts-refresh.timer

echo "Installed:"
echo "  bf6-loadouts-http.service          (static server on :5175, Restart=always)"
echo "  bf6-loadouts-http-health.timer     (every 2 minutes)"
echo "  bf6-loadouts-refresh.timer         (weekly Monday 03:15)"
echo ""
echo "Status:"
systemctl --user --no-pager --full status bf6-loadouts-http.service || true
echo ""
systemctl --user --no-pager --full status bf6-loadouts-http-health.timer || true
echo ""
echo "Manual health check:  systemctl --user start bf6-loadouts-http-health.service"
echo "HTTP logs:            journalctl --user -u bf6-loadouts-http.service -n 50"
echo "Health logs:          journalctl --user -u bf6-loadouts-http-health.service -n 50"
echo "Refresh logs:         journalctl --user -u bf6-loadouts-refresh.service -n 50"
