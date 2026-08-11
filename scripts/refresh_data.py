#!/usr/bin/env python3
"""Download BF6 weapon/attachment data and rebuild js/embedded-data.js.

Uses local files + ETag cache so unchanged upstream data is not re-downloaded
or re-embedded. The weekly timer is the normal refresh cadence; the browser
always reads the local embedded copy (no network on page load).

Security notes:
- Upstream host/path is fixed; redirects off that host are rejected.
- JSON is schema-checked before write/embed.
- Writes are atomic (temp + replace) and confined under data/ and js/.
"""

from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
JS_DIR = ROOT / "js"
OUT_PATH = JS_DIR / "embedded-data.js"
META_PATH = DATA_DIR / "last-refresh.json"
ETAG_PATH = DATA_DIR / ".etag-cache.json"

ALLOWED_HOST = "raw.githubusercontent.com"
BASE = f"https://{ALLOWED_HOST}/raymdl/BF6-Weapon-Analyzer/main/data/"
FILES = (
    "weapons.json",
    "attachments.json",
    "balance_tables.json",
    "ammo.json",
    "ballistics.json",
    "recoil_decay.json",
)
EMBED_FILES = (
    "weapons.json",
    "attachments.json",
    "balance_tables.json",
    "ammo.json",
)
SAFE_ID = __import__("re").compile(r"^[A-Za-z0-9_-]{1,64}$")
MAX_JSON_BYTES = 8 * 1024 * 1024


class HostLimitedRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        host = urlparse(newurl).hostname
        if host != ALLOWED_HOST:
            raise urllib.error.HTTPError(
                newurl,
                code,
                f"redirect blocked to unexpected host: {host}",
                headers,
                fp,
            )
        return super().redirect_request(req, fp, code, msg, headers, newurl)


OPENER = urllib.request.build_opener(HostLimitedRedirectHandler)


def load_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def safe_under(base: Path, name: str) -> Path:
    if name not in FILES:
        raise ValueError(f"disallowed filename: {name}")
    if "/" in name or "\\" in name or name.startswith("."):
        raise ValueError(f"unsafe filename: {name}")
    path = (base / name).resolve()
    if not path.is_relative_to(base.resolve()):
        raise ValueError(f"path escapes base: {path}")
    return path


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=path.parent,
        prefix=f".{path.name}.",
        suffix=".tmp",
        delete=False,
    ) as tmp:
        tmp.write(text)
        tmp_path = Path(tmp.name)
    tmp_path.replace(path)


def require_mapping(value: Any, label: str) -> dict:
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object")
    return value


def require_list(value: Any, label: str) -> list:
    if not isinstance(value, list):
        raise ValueError(f"{label} must be an array")
    return value


def require_id(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SAFE_ID.match(value):
        raise ValueError(f"{label} has invalid id: {value!r}")
    return value


def require_number(value: Any, label: str) -> None:
    if value is None:
        return
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{label} pts must be numeric, got {type(value).__name__}")
    if not (-1e6 < float(value) < 1e6):
        raise ValueError(f"{label} pts out of range")


def validate_attachment_list(items: Any, label: str) -> None:
    for item in require_list(items, label):
        obj = require_mapping(item, label)
        require_id(obj.get("id"), label)
        name = obj.get("name")
        if name is not None and (not isinstance(name, str) or len(name) > 120):
            raise ValueError(f"{label} has invalid name")
        require_number(obj.get("pts"), f"{label}:{obj.get('id')}")


def validate_weapons(data: Any) -> list:
    weapons = require_list(data, "weapons.json")
    if not weapons:
        raise ValueError("weapons.json is empty")
    if len(weapons) > 500:
        raise ValueError("weapons.json unexpectedly large")
    for weapon in weapons:
        obj = require_mapping(weapon, "weapon")
        require_id(obj.get("id"), "weapon")
        if not isinstance(obj.get("name"), str) or not obj["name"] or len(obj["name"]) > 80:
            raise ValueError(f"weapon {obj.get('id')} has invalid name")
        if not isinstance(obj.get("cls"), str) or not obj["cls"] or len(obj["cls"]) > 40:
            raise ValueError(f"weapon {obj.get('id')} has invalid class")
    return weapons


def validate_attachments(data: Any) -> dict:
    att = require_mapping(data, "attachments.json")
    for key in (
        "MUZZLES",
        "BARRELS",
        "GRIPS",
        "LASERS",
        "LIGHTS",
        "SIGHTS",
        "ERGOS",
        "WEAPON_ATTS",
        "WEAPON_MAG",
    ):
        if key not in att:
            raise ValueError(f"attachments.json missing {key}")
    for key in ("MUZZLES", "BARRELS", "GRIPS", "LASERS", "LIGHTS", "SIGHTS", "ERGOS"):
        validate_attachment_list(att[key], key)
    weapon_atts = require_mapping(att["WEAPON_ATTS"], "WEAPON_ATTS")
    if not weapon_atts:
        raise ValueError("WEAPON_ATTS is empty")
    for wid, slots in weapon_atts.items():
        require_id(wid, "WEAPON_ATTS")
        require_mapping(slots, f"WEAPON_ATTS.{wid}")
    return att


def validate_balance(data: Any) -> dict:
    return require_mapping(data, "balance_tables.json")


def validate_ammo(data: Any) -> dict:
    ammo = require_mapping(data, "ammo.json")
    if "AMMO" in ammo:
        validate_attachment_list(ammo["AMMO"], "AMMO")
    if "WEAPON_AMMO" in ammo:
        require_mapping(ammo["WEAPON_AMMO"], "WEAPON_AMMO")
    return ammo


def validate_recoil_decay(data: Any):
    if not isinstance(data, (dict, list)):
        raise ValueError("recoil_decay.json must be object or array")
    return data


VALIDATORS = {
    "weapons.json": validate_weapons,
    "attachments.json": validate_attachments,
    "balance_tables.json": validate_balance,
    "ammo.json": validate_ammo,
    "ballistics.json": lambda data: require_mapping(data, "ballistics.json"),
    "recoil_decay.json": validate_recoil_decay,
}


def parse_and_validate(name: str, body: str) -> Any:
    if len(body.encode("utf-8")) > MAX_JSON_BYTES:
        raise ValueError(f"{name} exceeds size limit")
    try:
        data = json.loads(body)
    except json.JSONDecodeError as err:
        raise ValueError(f"{name} is not valid JSON: {err}") from err
    validator = VALIDATORS.get(name)
    if validator:
        validator(data)
    return data


def fetch_conditional(url: str, etag: str | None, last_modified: str | None) -> tuple[str | None, dict]:
    """Return (body_or_None_if_unchanged, response_headers_of_interest)."""
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != ALLOWED_HOST:
        raise ValueError(f"refusing to fetch non-allowlisted URL: {url}")

    headers = {"User-Agent": "bf6-best-loadouts-refresh/1.1"}
    if etag:
        headers["If-None-Match"] = etag
    if last_modified:
        headers["If-Modified-Since"] = last_modified

    req = urllib.request.Request(url, headers=headers)
    try:
        with OPENER.open(req, timeout=60) as resp:
            final_host = urlparse(resp.geturl()).hostname
            if final_host != ALLOWED_HOST:
                raise ValueError(f"unexpected final host: {final_host}")
            raw = resp.read()
            if len(raw) > MAX_JSON_BYTES:
                raise ValueError("response exceeds size limit")
            body = raw.decode("utf-8")
            return body, {
                "etag": resp.headers.get("ETag"),
                "lastModified": resp.headers.get("Last-Modified"),
                "status": getattr(resp, "status", 200),
            }
    except urllib.error.HTTPError as err:
        if err.code == 304:
            return None, {
                "etag": etag,
                "lastModified": last_modified,
                "status": 304,
            }
        raise


def embed(refreshed_at: str) -> dict:
    weapons = validate_weapons(json.loads(safe_under(DATA_DIR, "weapons.json").read_text(encoding="utf-8")))
    attachments = validate_attachments(
        json.loads(safe_under(DATA_DIR, "attachments.json").read_text(encoding="utf-8"))
    )
    balance = validate_balance(
        json.loads(safe_under(DATA_DIR, "balance_tables.json").read_text(encoding="utf-8"))
    )
    ammo = validate_ammo(json.loads(safe_under(DATA_DIR, "ammo.json").read_text(encoding="utf-8")))

    payload = {
        "weapons": weapons,
        "attachments": attachments,
        "balance": balance,
        "ammo": ammo,
        "refreshedAt": refreshed_at,
    }
    body = (
        "/* Auto-generated by scripts/refresh_data.py — do not edit by hand */\n"
        f"window.BF6_DATA = {json.dumps(payload, separators=(',', ':'), ensure_ascii=False)};\n"
    )
    if "</script" in body.lower():
        raise ValueError("refusing to embed payload containing script breaker")
    atomic_write_text(OUT_PATH, body)
    return {
        "weaponCount": len(weapons),
        "bytes": len(body.encode("utf-8")),
    }


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    etags = load_json(ETAG_PATH, {})
    refreshed_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    changed = False
    checked = 0

    print(f"refresh start {refreshed_at}")
    for name in FILES:
        checked += 1
        url = BASE + name
        cached = etags.get(name, {})
        path = safe_under(DATA_DIR, name)

        try:
            body, meta = fetch_conditional(
                url,
                cached.get("etag"),
                cached.get("lastModified"),
            )
        except urllib.error.HTTPError as err:
            print(f"FAILED {name}: HTTP {err.code}", file=sys.stderr)
            return 1
        except Exception as err:  # noqa: BLE001
            print(f"FAILED {name}: {err}", file=sys.stderr)
            return 1

        if body is None:
            if not path.exists():
                print(f"FAILED {name}: 304 but local file missing", file=sys.stderr)
                return 1
            print(f"unchanged data/{name} (304 / etag)")
            continue

        try:
            parse_and_validate(name, body)
        except ValueError as err:
            print(f"FAILED {name}: validation: {err}", file=sys.stderr)
            return 1

        digest = sha256_text(body)
        if path.exists() and cached.get("sha256") == digest:
            print(f"unchanged data/{name} (same hash)")
            etags[name] = {
                "etag": meta.get("etag") or cached.get("etag"),
                "lastModified": meta.get("lastModified") or cached.get("lastModified"),
                "sha256": digest,
            }
            continue

        atomic_write_text(path, body)
        etags[name] = {
            "etag": meta.get("etag"),
            "lastModified": meta.get("lastModified"),
            "sha256": digest,
        }
        changed = True
        print(f"updated data/{name} ({len(body)} bytes)")

    atomic_write_text(ETAG_PATH, json.dumps(etags, indent=2) + "\n")

    if not changed and OUT_PATH.exists() and META_PATH.exists():
        prev = load_json(META_PATH, {})
        prev["lastCheckedAt"] = refreshed_at
        prev["changed"] = False
        atomic_write_text(META_PATH, json.dumps(prev, indent=2) + "\n")
        print(f"no upstream changes ({checked} files checked) — kept existing embedded data")
        print("refresh ok (noop)")
        return 0

    try:
        info = embed(refreshed_at)
    except Exception as err:  # noqa: BLE001
        print(f"FAILED embed: {err}", file=sys.stderr)
        return 1

    meta = {
        "refreshedAt": refreshed_at,
        "lastCheckedAt": refreshed_at,
        "changed": True,
        "source": BASE,
        "files": list(FILES),
        "embeddedFiles": list(EMBED_FILES),
        "weaponCount": info["weaponCount"],
        "embeddedBytes": info["bytes"],
    }
    atomic_write_text(META_PATH, json.dumps(meta, indent=2) + "\n")
    print(f"wrote js/embedded-data.js ({info['bytes']} bytes, {info['weaponCount']} weapons)")
    print("refresh ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
