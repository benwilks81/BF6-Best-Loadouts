# BF6 Best Loadouts

Pick a gun → see the **one best attachment layout** for close, medium, and long range.

Live site: https://benwilks81.github.io/BF6-Best-Loadouts/

Favourites are saved in your browser so you can jump back to guns you use.

This folder is self-contained: scripts only read/write under this directory, and browser storage uses the key `bf6-best-loadouts-favorites-v1`.

## Open in Chrome

You can double-click `index.html` — it works offline via embedded data (weapon images still need network).

Optional local server on **5175**:

```bash
cd "/home/ben/BF6 Visualisation Stats"
# Prefer localhost unless you intentionally need LAN access:
python3 -m http.server 5175 --bind 127.0.0.1
```

Then open **http://localhost:5175**.

For LAN access only when needed:

```bash
python3 -m http.server 5175 --bind 0.0.0.0
```

That exposes the whole project folder over cleartext HTTP with directory listing — keep it on a trusted network, or put a reverse proxy with TLS/headers in front.

Do **not** enable CSP `upgrade-insecure-requests` while serving plain HTTP, or the browser will block the local scripts.

Port map under `/home/ben`: Weather **8080**, switch-database **8081**, FeedBridge **8085**, NRL Stats **8003**, Petrol Prices **8004**, this app **5175**.

## How data stays up to date

Layouts are computed in the browser from **local** `js/embedded-data.js` (no GitHub fetch on page load).

Weapon pictures come from **battlefield6.gg** and, for guns they don’t host, **battlefieldmeta.gg**.

Upstream JSON comes from [raymdl/BF6-Weapon-Analyzer](https://github.com/raymdl/BF6-Weapon-Analyzer). A **weekly** systemd timer checks for updates (Monday 03:15). The refresh script:

- only fetches from `raw.githubusercontent.com` (redirects elsewhere are blocked)
- validates JSON shape / numeric `pts` before writing
- writes files atomically
- uses **ETags / hashes** so unchanged files are not re-downloaded or re-embedded
- **commits and pushes** changed data to this GitHub repo so GitHub Pages stays current

If a browser refresh feels slow, that is the local layout optimizer — not a network download.

### Install the weekly check (once)

```bash
cd "/home/ben/BF6 Visualisation Stats"
./install-refresh-timer.sh
```

Re-run the installer after pulling service-file hardening changes so `~/.config/systemd/user/` stays in sync.

### Manual refresh

```bash
"/home/ben/BF6 Visualisation Stats/scripts/refresh-data.sh"
# or:
systemctl --user start bf6-loadouts-refresh.service
```

If nothing changed upstream, the script exits quickly with `refresh ok (noop)`.

Logs: `journalctl --user -u bf6-loadouts-refresh.service -n 50`

## Security notes

- Page CSP blocks unexpected scripts/connections; favourites and weapon ids are validated before render.
- Browser never talks to GitHub for data — only the refresh timer/script does.
- Legacy `scripts/*.mjs` paths are unused; prefer `scripts/refresh_data.py`.
