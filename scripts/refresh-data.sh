#!/usr/bin/env bash
# Refresh BF6 loadout data from raymdl/BF6-Weapon-Analyzer and rebuild embedded JS.
set -euo pipefail
cd "$(dirname "$0")/.."
exec /usr/bin/python3 scripts/refresh_data.py
