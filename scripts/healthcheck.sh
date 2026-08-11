#!/usr/bin/env bash
# Liveness probe for the local BF6 Best Loadouts static server.
# Confirms key pages/assets answer 200; restarts the systemd unit if not.
# (GitHub Pages is not probed — this is for the local host only.)
set -u

BASE_URL="${BF6_HEALTH_URL:-http://127.0.0.1:5175}"
SERVICE="${BF6_HTTP_SERVICE:-bf6-loadouts-http.service}"
ATTEMPTS=3
PATHS=(
  "/"
  "/index.html"
  "/js/app.js"
  "/js/embedded-data.js"
  "/css/styles.css"
)

check_once() {
  local path
  for path in "${PATHS[@]}"; do
    if ! curl -fsS --max-time 5 "${BASE_URL}${path}" >/dev/null 2>&1; then
      echo "healthcheck fail: ${BASE_URL}${path}"
      return 1
    fi
  done
  return 0
}

for i in $(seq 1 "$ATTEMPTS"); do
  if check_once; then
    exit 0
  fi
  sleep 2
done

echo "BF6 Best Loadouts health check failed after ${ATTEMPTS} attempts — restarting ${SERVICE}"
systemctl --user restart "$SERVICE"
exit 1
