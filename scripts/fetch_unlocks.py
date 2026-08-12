#!/usr/bin/env python3
"""Fetch weapon / attachment unlock levels from battlefieldmeta.gg.

Writes data/unlocks.json mapped onto local weapon and attachment IDs used by
the loadout optimizer. Intended to run alongside the weekly raymdl refresh.
"""

from __future__ import annotations

import json
import re
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT_PATH = DATA_DIR / "unlocks.json"

ALLOWED_HOST = "app.battlefieldmeta.gg"
API_BASE = f"https://{ALLOWED_HOST}/api"
UA = "bf6-best-loadouts-unlocks/1.0"
MAX_JSON_BYTES = 8 * 1024 * 1024
REQUEST_PAUSE_S = 0.05

SAFE_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

# Local weapon id -> meta API slug when they differ.
WEAPON_ID_MAP = {
    "sor556": "sor-556-mk2",
    "tr7": "tr-7",
    "kord6p67": "kord-6p67",
    "nvo228e": "nvo-228e",
    "vcr2": "vcr-2",
    "ak205": "ak-205",
    "m417a2": "m417-a2",
    "grtbc": "grt-bc",
    "qbz192": "qbz-192",
    "sg553r": "sg-553r",
    "sor300sc": "sor-300sc",
    "umg40": "umg-40",
    "usg90": "usg-90",
    "scw10": "scw-10",
    "pp19": "pp-19",
    "drsiar": "drs-iar",
    "kts100": "kts100-mk8",
    "m121a2": "m121-a2",
    "rpk74m": "rpk-74m",
    "m39emr": "m39-emr",
    "svk86": "svk-86",
    "grtcps": "grt-cps",
    "m2010esr": "m2010-esr",
    "sv98": "sv-98",
    "miniscout": "mini-scout",
    "ks18k": "185ks-k",
    "db12": "db-12",
    "ggh22": "ggh-22",
    "m357trait": "m357-trait",
    "vz61": "vz-61",
    "brod3": "brod-3",
}

NAME_ALIASES = {
    "flashcomp": "flash_comp",
    "flashhider": "flash_hider",
    "singleportbrake": "sp_brake",
    "doubleportbrake": "dp_brake",
    "tripleportbrake": "tp_brake",
    "compensatedbrake": "comp_brake",
    "linearcomp": "linear_comp",
    "standardsuppressor": "std_supp",
    "longsuppressor": "long_supp",
    "cqbsuppressor": "cqb_supp",
    "lightenedsuppressor": "light_supp",
    "threadprotector": "thread_prot",
    "slantbrake": "slant_brake",
    "compensator": "compensator",
    "foldingvertical": "fold_vert",
    "alloyvertical": "alloy_vert",
    "ribbedvertical": "ribbed_vert",
    "classicvertical": "classic_vert",
    "6h64vertical": "6h64_vert",
    "foldingstubby": "fold_stubby",
    "ribbedstubby": "ribbed_stubby",
    "cantedstubby": "canted_stubby",
    "stippledstubby": "stipp_stubby",
    "lowprofilestubby": "lp_stubby",
    "adjustableangled": "adj_angled",
    "slimangled": "slim_angled",
    "fullangled": "full_angled",
    "slimhandstop": "slim_handstop",
    "compacthandstop": "cmpct_handstop",
    "underslungmount": "underslung_mount",
    "pttgrippod": "ptt_grip_pod",
    "qdgrippod": "qd_grip_pod",
    "classicgrippod": "classic_grip_pod",
    "mount": "underslung_mount",
    "bipod": "bipod",
    "factoryangled": "factory_angled",
    "5mwred": "5mw_red",
    "5mwgreen": "5mw_green",
    "50mwviolet": "50mw_violet",
    "50mwgreen": "50mw_green",
    "50mwblue": "50mw_blue",
    "120mwblue": "120mw_blue",
    "laserlightcombored": "combo_red",
    "laserlightcombogreen": "combo_green",
    "flashlight": "flashlight",
    "taclightaimed": "ads_taclight",
    "taclightaimedaimed": "ads_taclight",
    "taclighthip": "hip_taclight",
    "rangefinder": "range_finder",
    "aftermarketbuffer": "buffer",
    "improvedmagcatch": "mag_catch",
    "magwellflare": "mag_flare",
    "matchtrigger": "match_trigger",
    "railcover": "rail_cover",
    "tungstencore": "penetration",
    "polymercase": "lightweight",
    "hollowpoint": "hollow_pt",
    "fmj": "standard",
    "standard": "standard",
    "penetration": "penetration",
    "lightweight": "lightweight",
    "longrange": "long_range",
    "frangible": "frangible",
    "synthetic": "synthetic",
    "subsonic": "subsonic",
    "subhp": "subsonic_hp",
    "subpen": "subsonic_pen",
    "rangepen": "range_pen",
    "01buck": "buckshot",
    "00buck": "buckshot_00",
    "flechette": "flechette",
    "slugs": "slugs",
}


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


def norm(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", (value or "").lower())


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


def api_get(path: str) -> Any:
    url = API_BASE + path
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != ALLOWED_HOST:
        raise ValueError(f"refusing non-allowlisted URL: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with OPENER.open(req, timeout=45) as resp:
        final_host = urlparse(resp.geturl()).hostname
        if final_host != ALLOWED_HOST:
            raise ValueError(f"unexpected final host: {final_host}")
        raw = resp.read()
        if len(raw) > MAX_JSON_BYTES:
            raise ValueError("response exceeds size limit")
        payload = json.loads(raw.decode("utf-8"))
    if not isinstance(payload, dict) or "data" not in payload:
        raise ValueError(f"unexpected API payload for {path}")
    return payload["data"]


def catalog_norms(items: list[dict]) -> dict[str, str]:
    out: dict[str, str] = {}
    for item in items:
        iid = item.get("id")
        if not isinstance(iid, str) or not SAFE_ID.match(iid):
            continue
        out[norm(iid)] = iid
        name = item.get("name")
        if isinstance(name, str):
            out[norm(name)] = iid
    return out


def resolve_id(raw: str | None, catalog: dict[str, str], known_ids: set[str]) -> str | None:
    key = norm(raw)
    if not key:
        return None
    if key in catalog:
        return catalog[key]
    alias = NAME_ALIASES.get(key)
    if alias and alias in known_ids:
        return alias
    if alias and alias in catalog:
        return catalog[alias]
    return None


def optic_category(att: dict) -> str | None:
    name = (att.get("name") or "").upper()
    summary = (att.get("summaryName") or "").upper()
    if "CANTED" in name:
        return None
    if "THERMAL HYBRID" in summary or "THERMAL HYBRID" in name:
        return "therm_hyb"
    if "THERMAL" in summary or "THERMAL" in name:
        return "thermal"
    if "VARIABLE 1-5" in summary:
        return "var_high"
    if "VARIABLE" in summary:
        return "var_low"
    if "IRON" in name:
        return "iron"
    match = re.search(r"(\d+(?:\.\d+)?)\s*X", summary) or re.search(r"(\d+(?:\.\d+)?)\s*X", name)
    if match:
        mag = float(match.group(1))
        if mag >= 5:
            return "var_high"
        if mag >= 2.5:
            return "var_low"
        return "std_optic"
    if summary.startswith("SCOPE"):
        return "var_low"
    if summary.startswith("SIGHT") or "CCO" in name:
        return "std_optic"
    return None


def mag_id(att: dict) -> str | None:
    blob = f"{att.get('summaryName') or ''} {att.get('name') or ''}"
    key = norm(blob)
    match = re.search(r"(\d+)(?:rnd)?(fast)?", key)
    if not match:
        return None
    size = match.group(1)
    if "fast" in key:
        return f"{size}_fast"
    return f"{size}_rnd"


def set_level(bucket: dict[str, int], att_id: str, level: int) -> None:
    prev = bucket.get(att_id)
    if prev is None or level < prev:
        bucket[att_id] = int(level)


def expand_grip_ids(base_id: str, grips: list[dict]) -> list[str]:
    base = next((g for g in grips if g.get("id") == base_id), None)
    if not base:
        return [base_id]
    base_name = norm(base.get("name"))
    out = {base_id}
    for grip in grips:
        gid = grip.get("id")
        if not isinstance(gid, str):
            continue
        if gid == base_id or gid.startswith(base_id + "_") or norm(grip.get("name")) == base_name:
            # Avoid collapsing unrelated factory_angled_* onto a generic id.
            if base_id == "factory_angled" and gid.startswith("factory_angled_"):
                continue
            out.add(gid)
    if base_id.startswith("factory_angled"):
        out = {base_id}
    return sorted(out)


def resolve_meta_id(local_id: str, local_name: str, meta_by_id: dict[str, dict]) -> str | None:
    if local_id in WEAPON_ID_MAP:
        mapped = WEAPON_ID_MAP[local_id]
        if mapped in meta_by_id:
            return mapped
    if local_id in meta_by_id:
        return local_id
    target = norm(local_name)
    hits = [mid for mid, meta in meta_by_id.items() if norm(meta.get("name")) == target]
    if len(hits) == 1:
        return hits[0]
    return None


def load_local() -> tuple[list[dict], dict, dict]:
    weapons = json.loads((DATA_DIR / "weapons.json").read_text(encoding="utf-8"))
    attachments = json.loads((DATA_DIR / "attachments.json").read_text(encoding="utf-8"))
    ammo = json.loads((DATA_DIR / "ammo.json").read_text(encoding="utf-8"))
    return weapons, attachments, ammo


def build_unlocks() -> dict:
    weapons, attachments, ammo = load_local()
    meta_list = api_get("/weapons")
    if not isinstance(meta_list, list):
        raise ValueError("meta weapons list must be an array")
    meta_by_id = {w["id"]: w for w in meta_list if isinstance(w, dict) and isinstance(w.get("id"), str)}

    muzzle_cat = catalog_norms(attachments["MUZZLES"])
    barrel_cat = catalog_norms(attachments["BARRELS"])
    grip_cat = catalog_norms(attachments["GRIPS"])
    laser_cat = catalog_norms(attachments["LASERS"])
    light_cat = catalog_norms(attachments["LIGHTS"])
    ergo_cat = catalog_norms(attachments["ERGOS"])
    ammo_cat = catalog_norms(ammo.get("AMMO", []))

    muzzle_ids = {m["id"] for m in attachments["MUZZLES"]}
    barrel_ids = {b["id"] for b in attachments["BARRELS"]}
    grip_ids = {g["id"] for g in attachments["GRIPS"]}
    laser_ids = {x["id"] for x in attachments["LASERS"]}
    light_ids = {x["id"] for x in attachments["LIGHTS"]}
    ergo_ids = {x["id"] for x in attachments["ERGOS"]}
    ammo_ids = {x["id"] for x in ammo.get("AMMO", [])}
    sight_ids = {x["id"] for x in attachments["SIGHTS"]}

    out_weapons: dict[str, Any] = {}
    missing: list[str] = []
    unmapped: dict[str, int] = {}

    for weapon in weapons:
        local_id = weapon.get("id")
        if not isinstance(local_id, str) or not SAFE_ID.match(local_id):
            continue
        if weapon.get("cls") == "Sidearm":
            continue

        meta_id = resolve_meta_id(local_id, str(weapon.get("name") or local_id), meta_by_id)
        if not meta_id:
            missing.append(local_id)
            continue

        meta_weapon = meta_by_id[meta_id]
        unlock_player = meta_weapon.get("unlockAtPlayerLevel")
        if not isinstance(unlock_player, (int, float)):
            # Fall back to dedicated weapon endpoint if list payload omits it.
            detail = api_get(f"/weapons/{meta_id}")
            unlock_player = detail.get("unlockAtPlayerLevel", 0)
            time.sleep(REQUEST_PAUSE_S)

        slots: dict[str, dict[str, int]] = {
            "muzzle": {"none": 0},
            "barrel": {"none": 0},
            "grip": {"none": 0},
            "laser": {"none": 0},
            "light": {"none": 0},
            "sight": {"iron": 0},
            "mag": {"default": 0},
            "ammo": {"standard": 0},
            "ergo": {"none": 0},
        }

        atts = api_get(f"/weapons/{meta_id}/unlocked-attachments")
        time.sleep(REQUEST_PAUSE_S)
        if not isinstance(atts, list):
            raise ValueError(f"attachments for {meta_id} must be an array")

        for att in atts:
            if not isinstance(att, dict):
                continue
            slot = att.get("slotId")
            level = att.get("unlockAtWeaponLevel")
            if not isinstance(level, (int, float)):
                continue
            level = int(level)

            if slot == "muzzle":
                lid = resolve_id(att.get("name"), muzzle_cat, muzzle_ids) or resolve_id(
                    att.get("summaryName"), muzzle_cat, muzzle_ids
                )
                if lid:
                    set_level(slots["muzzle"], lid, level)
                else:
                    unmapped[f"muzzle:{att.get('name')}"] = unmapped.get(f"muzzle:{att.get('name')}", 0) + 1

            elif slot == "barrel":
                lid = resolve_id(att.get("summaryName"), barrel_cat, barrel_ids) or resolve_id(
                    att.get("name"), barrel_cat, barrel_ids
                )
                if lid:
                    set_level(slots["barrel"], lid, level)
                else:
                    key = f"barrel:{att.get('summaryName')}"
                    unmapped[key] = unmapped.get(key, 0) + 1

            elif slot == "underbarrel":
                name = att.get("name") or ""
                if "LASER/LIGHT COMBO" in name.upper():
                    lid = resolve_id(name, laser_cat, laser_ids)
                    if lid:
                        set_level(slots["laser"], lid, level)
                    continue
                lid = resolve_id(name, grip_cat, grip_ids)
                if not lid:
                    for grip in attachments["GRIPS"]:
                        if norm(grip.get("name")) == norm(name):
                            lid = grip["id"]
                            break
                if lid:
                    for gid in expand_grip_ids(lid, attachments["GRIPS"]):
                        if gid in grip_ids:
                            set_level(slots["grip"], gid, level)
                else:
                    key = f"grip:{name}"
                    unmapped[key] = unmapped.get(key, 0) + 1

            elif slot in ("top-accessory", "right-accessory", "left-accessory"):
                name = att.get("name") or ""
                lid = resolve_id(name, laser_cat, laser_ids) or resolve_id(
                    att.get("summaryName"), laser_cat, laser_ids
                )
                if lid:
                    set_level(slots["laser"], lid, level)
                    continue
                lid = resolve_id(name, light_cat, light_ids) or resolve_id(
                    att.get("summaryName"), light_cat, light_ids
                )
                if lid:
                    set_level(slots["light"], lid, level)
                else:
                    key = f"acc:{slot}:{name}"
                    unmapped[key] = unmapped.get(key, 0) + 1

            elif slot == "scope":
                cat = optic_category(att)
                if cat and cat in sight_ids:
                    set_level(slots["sight"], cat, level)

            elif slot == "magazine":
                mid = mag_id(att)
                if mid:
                    set_level(slots["mag"], mid, level)
                else:
                    key = f"mag:{att.get('name')}"
                    unmapped[key] = unmapped.get(key, 0) + 1

            elif slot == "ammunition":
                lid = resolve_id(att.get("summaryName"), ammo_cat, ammo_ids) or resolve_id(
                    att.get("name"), ammo_cat, ammo_ids
                )
                if lid:
                    set_level(slots["ammo"], lid, level)
                else:
                    key = f"ammo:{att.get('name')}/{att.get('summaryName')}"
                    unmapped[key] = unmapped.get(key, 0) + 1

            elif slot == "ergonomics":
                lid = resolve_id(att.get("name"), ergo_cat, ergo_ids) or resolve_id(
                    att.get("summaryName"), ergo_cat, ergo_ids
                )
                if lid:
                    set_level(slots["ergo"], lid, level)
                else:
                    key = f"ergo:{att.get('name')}"
                    unmapped[key] = unmapped.get(key, 0) + 1

        # Default barrel is usually available early; keep basic at 0 if absent.
        slots["barrel"].setdefault("basic", 0)

        out_weapons[local_id] = {
            "metaId": meta_id,
            "unlockAtPlayerLevel": int(unlock_player or 0),
            "attachments": slots,
        }

    if missing:
        raise ValueError(f"could not map weapons to meta IDs: {', '.join(missing)}")

    fetched_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    payload = {
        "source": API_BASE,
        "fetchedAt": fetched_at,
        "playerMaxLevel": 50,
        "weaponMasteryMax": 50,
        "weapons": out_weapons,
        "unmappedSample": sorted(unmapped.items(), key=lambda item: (-item[1], item[0]))[:30],
    }
    return payload


def main() -> int:
    try:
        payload = build_unlocks()
    except Exception as err:  # noqa: BLE001
        print(f"FAILED unlocks: {err}", file=sys.stderr)
        return 1

    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    atomic_write_text(OUT_PATH, text)
    print(
        f"wrote {OUT_PATH.relative_to(ROOT)} "
        f"({len(payload['weapons'])} weapons, {len(text)} bytes)"
    )
    if payload.get("unmappedSample"):
        print("unmapped sample:")
        for key, count in payload["unmappedSample"][:10]:
            print(f"  {count:3} {key}")
    print("unlocks ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
