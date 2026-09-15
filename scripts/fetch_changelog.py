#!/usr/bin/env python3
"""Discover and fetch the latest BF6 game-update patch notes from ea.com.

The version is fluid: starting from the newest version we know about (hub page
links plus the previously saved changelog), we probe upward (x.y.z.w+1,
x.y.z+1.0, x.y+1.0.0, x+1.0.0.0) until no newer article exists. EA returns a
real 404 for updates that don't exist, so probing is reliable.

Security notes (same posture as refresh_data.py):
- Only https://www.ea.com is fetched; redirects off-host are rejected.
- Extracted text is length-capped and tag-stripped; output is plain JSON.
"""

from __future__ import annotations

import html as html_mod
import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
CHANGELOG_PATH = ROOT / "data" / "changelog.json"

ALLOWED_HOST = "www.ea.com"
NEWS_BASE = f"https://{ALLOWED_HOST}/games/battlefield/battlefield-6/news"
SLUG_PREFIX = "battlefield-6-game-update-"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/128.0 Safari/537.36"
)
MAX_HTML_BYTES = 4 * 1024 * 1024
MAX_PROBES = 12
MAX_BULLETS = 6
MAX_BULLET_CHARS = 180
# Section header that marks weapon notes inside the CHANGELOG block.
WEAPON_HEADER = re.compile(r"<strong[^>]*>\s*WEAPONS\s*</strong>", re.I)
# Any ALL-CAPS category header (PLAYER, VEHICLES, GADGETS, MAPS &amp; MODES…).
CATEGORY_HEADER = re.compile(r"<strong[^>]*>\s*([A-Z][A-Z &;]{2,30})\s*</strong>")


class HostLimitedRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        host = urlparse(newurl).hostname
        if host != ALLOWED_HOST:
            raise urllib.error.HTTPError(
                newurl, code, f"redirect blocked to unexpected host: {host}", headers, fp
            )
        return super().redirect_request(req, fp, code, msg, headers, newurl)


OPENER = urllib.request.build_opener(HostLimitedRedirectHandler)


def fetch(url: str) -> str | None:
    """Return page HTML, or None on 404 (article doesn't exist)."""
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != ALLOWED_HOST:
        raise ValueError(f"refusing to fetch non-allowlisted URL: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with OPENER.open(req, timeout=60) as resp:
            raw = resp.read(MAX_HTML_BYTES + 1)
            if len(raw) > MAX_HTML_BYTES:
                raise ValueError("response exceeds size limit")
            return raw.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return None
        raise


def version_to_slug(version: tuple[int, ...]) -> str:
    return SLUG_PREFIX + "-".join(str(p) for p in version)


def slug_to_url(slug: str) -> str:
    return f"{NEWS_BASE}/{slug}"


def parse_version(text: str) -> tuple[int, ...] | None:
    m = re.fullmatch(r"(\d+)[.-](\d+)[.-](\d+)[.-](\d+)", text.strip())
    if not m:
        return None
    parts = tuple(int(g) for g in m.groups())
    if any(p > 999 for p in parts):
        return None
    return parts


def hub_versions() -> list[tuple[int, ...]]:
    """Versions of game-update articles linked from the news hub."""
    try:
        page = fetch(NEWS_BASE)
    except Exception as err:  # noqa: BLE001
        print(f"changelog: hub fetch failed ({err}); continuing with known version")
        return []
    if not page:
        return []
    found = set()
    for m in re.finditer(re.escape(SLUG_PREFIX) + r"(\d+(?:-\d+){3})", page):
        v = parse_version(m.group(1))
        if v:
            found.add(v)
    return sorted(found)


def next_candidates(v: tuple[int, ...]) -> list[tuple[int, ...]]:
    a, b, c, d = v
    return [(a, b, c, d + 1), (a, b, c + 1, 0), (a, b + 1, 0, 0), (a + 1, 0, 0, 0)]


def article_exists(version: tuple[int, ...]) -> str | None:
    """Return the article HTML if this version's page exists, else None."""
    page = fetch(slug_to_url(version_to_slug(version)))
    if page is None:
        return None
    dotted = ".".join(str(p) for p in version)
    if f"GAME UPDATE {dotted}" not in page.upper():
        # Soft page without matching content — treat as missing.
        return None
    return page


def discover_latest(start: tuple[int, ...]) -> tuple[tuple[int, ...], str] | None:
    """Walk upward from `start` until no newer game-update article exists."""
    best = start
    best_page = article_exists(best)
    probes = 0
    moved = True
    while moved and probes < MAX_PROBES:
        moved = False
        for cand in next_candidates(best):
            probes += 1
            time.sleep(0.3)  # be polite
            page = article_exists(cand)
            if page is not None:
                best, best_page = cand, page
                moved = True
                break
            if probes >= MAX_PROBES:
                break
    if best_page is None:
        return None
    return best, best_page


def strip_tags(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", " ", fragment)
    text = html_mod.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def extract_bullets(page: str) -> list[str]:
    """Weapon bullets from the CHANGELOG block's WEAPONS section."""
    pos = page.find('id="changelog"')
    tail = page[pos:] if pos >= 0 else page
    m = WEAPON_HEADER.search(tail)
    if not m:
        return []
    section = tail[m.end():]
    # Stop at the next ALL-CAPS category header (e.g. MAPS &amp; MODES).
    nxt = CATEGORY_HEADER.search(section)
    if nxt:
        section = section[: nxt.start()]
    bullets = []
    for li in re.findall(r"<li[^>]*>(.*?)</li>", section, re.S):
        text = strip_tags(li)
        if len(text) < 10:
            continue
        bullets.append(text[:MAX_BULLET_CHARS])
        if len(bullets) >= MAX_BULLETS:
            break
    return bullets


def extract_title_and_date(page: str, version: tuple[int, ...]) -> tuple[str, str]:
    dotted = ".".join(str(p) for p in version)
    title = f"Update {dotted}"
    m = re.search(r'"title":"(BATTLEFIELD 6 GAME UPDATE [^"]{1,40})"', page)
    title_pos = m.start() if m else -1
    if m:
        title = m.group(1).title().replace("Battlefield 6 ", "")

    date_label = ""
    dates = [(mm.start(), mm.group(1)) for mm in re.finditer(r'"publishingDate":"([^"]+)"', page)]
    if dates:
        # The article's own date sits nearest its title in the embedded JSON.
        anchor = title_pos if title_pos >= 0 else 0
        _, iso = min(dates, key=lambda item: abs(item[0] - anchor))
        try:
            date_label = datetime.fromisoformat(iso).strftime("%-d %b %Y")
        except ValueError:
            date_label = ""
    return title, date_label


def build_changelog(known_version_id: str | None) -> dict | None:
    """Return the latest changelog dict, or None if nothing could be found."""
    known = parse_version(known_version_id or "") or (1, 0, 0, 0)
    candidates = hub_versions() + [known]
    start = max(candidates)
    found = discover_latest(start)
    if found is None:
        return None
    version, page = found
    dotted = ".".join(str(p) for p in version)
    title, date_label = extract_title_and_date(page, version)
    bullets = extract_bullets(page)
    if not bullets:
        bullets = ["Weapon-facing notes not detected — read the full patch notes."]
    return {
        "id": dotted,
        "title": title,
        "dateLabel": date_label,
        "url": slug_to_url(version_to_slug(version)),
        "bullets": [{"text": b, "weapons": None} for b in bullets],
    }


def main() -> int:
    prev = None
    if CHANGELOG_PATH.exists():
        try:
            prev = json.loads(CHANGELOG_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            prev = None
    log = build_changelog((prev or {}).get("id"))
    if log is None:
        print("changelog: no update article found")
        return 1
    CHANGELOG_PATH.write_text(json.dumps(log, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"changelog: {log['title']} ({log['dateLabel']}) — {len(log['bullets'])} bullets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
