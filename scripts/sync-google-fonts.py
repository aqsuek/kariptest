#!/usr/bin/env python3
"""Keep Google Font catalog cards, give each a unique /qarip/font/{slug}/ page."""
from __future__ import annotations

import json
import re
import zipfile
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site" / "qarip"
DATA = SITE / "data" / "fonts.json"
HOME = SITE / "index.html"
USER_FONTS = SITE / "fonts" / "user"
DOWNLOADS = SITE / "downloads"

CAT_MAP = {
    "Сериф": "Serif",
    "Санс-сериф": "Sans Serif",
    "Дисплей": "Display",
    "Қолжазба": "Handwritten",
    "Моно": "Monospace",
}

# No unique Kazakh letters (ӘҒҚҢӨҰҮҺ) — І/і alone does not count.
SKIP_GOOGLE = {
    "Alumni Sans",
    "Bona Nova",
    "Neucha",
    "Russo One",
    "Unbounded",
    "Jost",
    "IBM Plex Sans Condensed",
}


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower())
    return s.strip("-") or "font"


def parse_google_cards() -> list[dict]:
    html = HOME.read_text(encoding="utf-8")
    arts = re.findall(r'<article class="font-card[^"]*">(.*?)</article>', html)
    out = []
    seen = set()
    for a in arts:
        if "fonts.google.com" not in a:
            continue
        name_m = re.search(r"<h3>([^<]+)</h3>", a)
        if not name_m:
            continue
        name = unescape(name_m.group(1)).strip()
        if name in seen:
            continue
        seen.add(name)
        author_m = re.search(r"<h3>[^<]+</h3><p>([^<]*)</p>", a)
        author = unescape(author_m.group(1)).strip() if author_m else ""
        fam_m = re.search(r"font-family:&quot;([^&]+)&quot;", a)
        family = unescape(fam_m.group(1)).strip() if fam_m else name
        href_m = re.search(r'href="(https://fonts\.google\.com/specimen/[^"]+)"', a)
        download = href_m.group(1) if href_m else f"https://fonts.google.com/specimen/{name.replace(' ', '+')}"
        style_m = re.search(r'<div class="meta"><span>([^<]*)</span>', a)
        style = unescape(style_m.group(1)).strip() if style_m else "Қаріп"
        out.append(
            {
                "name": name,
                "author": author,
                "family": family,
                "download": download,
                "style": style,
                "category": CAT_MAP.get(style, "Display"),
            }
        )
    return out


def unique_slug(name: str, taken: set[str]) -> str:
    base = slugify(name)
    slug = base
    if slug in taken:
        slug = f"{base}-google"
    n = 2
    while slug in taken:
        slug = f"{base}-google-{n}"
        n += 1
    taken.add(slug)
    return slug


def extract_really_no_2() -> str:
    zpath = DOWNLOADS / "really-no-2.zip"
    dest = USER_FONTS / "really-no-2.ttf"
    if dest.exists():
        return "/qarip/fonts/user/really-no-2.ttf"
    if not zpath.exists():
        return ""
    USER_FONTS.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zpath) as zf:
        name = next((n for n in zf.namelist() if n.endswith("Regular.ttf")), None)
        if not name:
            name = next((n for n in zf.namelist() if n.lower().endswith(".ttf")), None)
        if not name:
            return ""
        dest.write_bytes(zf.read(name))
    return "/qarip/fonts/user/really-no-2.ttf"


def zip_loose_fonts(fonts: list[dict]) -> int:
    n = 0
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    for f in fonts:
        dl = f.get("download") or ""
        if not dl.endswith((".ttf", ".otf")):
            continue
        src = SITE / dl[len("/qarip/") :] if dl.startswith("/qarip/") else SITE / dl.lstrip("/")
        if not src.exists():
            continue
        zpath = DOWNLOADS / f"{f['slug']}.zip"
        if not zpath.exists():
            with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.write(src, src.name)
        f["download"] = f"/qarip/downloads/{f['slug']}.zip"
        n += 1
    return n


def similar_for(item: dict, pool: list[dict], n: int = 4) -> list[str]:
    same = [x["slug"] for x in pool if x["slug"] != item["slug"] and x.get("style") == item.get("style")]
    rest = [x["slug"] for x in pool if x["slug"] != item["slug"] and x["slug"] not in same]
    return (same + rest)[:n]


def main() -> None:
    fonts = json.loads(DATA.read_text(encoding="utf-8"))
    preview = extract_really_no_2()
    for f in fonts:
        if f.get("slug") == "really-no-2" and preview:
            f["preview"] = preview

    existing_google = {f["name"]: f for f in fonts if f.get("source") == "google"}
    local = [f for f in fonts if f.get("source") != "google"]
    taken = {f["slug"] for f in local}

    google_cards = [c for c in parse_google_cards() if c["name"] not in SKIP_GOOGLE]
    google_rows = []
    for card in google_cards:
        prev = existing_google.get(card["name"])
        slug = prev["slug"] if prev and prev["slug"] not in taken else unique_slug(card["name"], taken)
        row = {
            "slug": slug,
            "name": card["name"],
            "maker": "Google Fonts",
            "author": card["author"],
            "style": card["style"],
            "category": card["category"],
            "family": card["family"],
            "download": card["download"],
            "preview": f"google:{card['family']}",
            "license": "open",
            "local": False,
            "source": "google",
            "similar": [],
        }
        google_rows.append(row)

    for row in google_rows:
        row["similar"] = similar_for(row, google_rows)

    zipped = zip_loose_fonts(local)
    merged = local + google_rows
    DATA.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"local {len(local)} google {len(google_rows)} zipped-downloads {zipped}")
    print(f"google slugs colliding → -google: {sum(1 for g in google_rows if g['slug'].endswith('-google') or '-google-' in g['slug'])}")


if __name__ == "__main__":
    main()
