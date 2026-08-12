# BF6 Best Loadouts

Pick a gun → see the **one best attachment layout** for close, medium, long, hipfire, recoil, and ADS.

Live site: https://benwilks81.github.io/BF6-Best-Loadouts/

Set your **player level** and **weapon mastery** so recommendations only use attachments you can unlock. Each gun also shows the player level required to unlock it.

Favourites and level prefs are saved in your browser (`bf6-best-loadouts-favorites-v1`, `bf6-best-loadouts-levels-v1`).

This folder is self-contained: scripts only read/write under this directory.

## Keep the local site online

The **local** static server and healthcheck run as **user systemd** units so they keep working after SSH disconnect (user lingering is already enabled for `ben`). That keeps this host available for the weekly data refresh → GitHub sync. GitHub Pages itself is not health-checked.

```bash
cd "/home/ben/BF6 Visualisation Stats"
./install-refresh-timer.sh
```

That installs:

- `bf6-loadouts-http.service` — serves the site on **5175**, restarts on crash
- `bf6-loadouts-http-health.timer` — every 2 minutes checks local `/`, `index.html`, JS, and CSS; restarts the local server if anything fails
- `bf6-loadouts-refresh.timer` — weekly data refresh + push to GitHub

```bash
systemctl --user status bf6-loadouts-http.service
systemctl --user start bf6-loadouts-http-health.service   # run one health check now
journalctl --user -u bf6-loadouts-http.service -n 50
journalctl --user -u bf6-loadouts-http-health.service -n 50
```

Do **not** also run a manual `python3 -m http.server 5175` — it will conflict on the port.

## Open in Chrome

You can double-click `index.html` — layouts work offline via embedded data (weapon images still need network).

Or use the systemd server on **5175**:

- http://localhost:5175
- http://192.168.1.45:5175 (LAN)

For a one-off manual server (only if the systemd unit is stopped):

```bash
cd "/home/ben/BF6 Visualisation Stats"
python3 -m http.server 5175 --bind 127.0.0.1
```

Do **not** enable CSP `upgrade-insecure-requests` while serving plain HTTP, or the browser will block the local scripts.

Port map under `/home/ben`: Weather **8080**, switch-database **8081**, FeedBridge **8085**, NRL Stats **8003**, Petrol Prices **8004**, this app **5175**.

## How data stays up to date

Layouts are computed in the browser from **local** `js/embedded-data.js` (no GitHub fetch on page load).

Weapon pictures come from **battlefield6.gg** and, for guns they don’t host, **battlefieldmeta.gg**.

Upstream weapon/attachment JSON comes from [raymdl/BF6-Weapon-Analyzer](https://github.com/raymdl/BF6-Weapon-Analyzer). Unlock levels come from [battlefieldmeta.gg](https://app.battlefieldmeta.gg/). A **weekly** systemd timer checks for updates (Monday 03:15). The refresh script:

- only fetches from allowlisted hosts (redirects elsewhere are blocked)
- validates JSON shape / numeric `pts` before writing
- fetches unlock levels into `data/unlocks.json` and embeds them with the rest
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
