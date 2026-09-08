#!/usr/bin/env python3
"""Regenerate Qarip font detail pages + sitemap from fonts.json (does NOT strip @font-face)."""
from __future__ import annotations

import json
from html import escape
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site" / "qarip"
DATA = SITE / "data" / "fonts.json"
FONT_DIR = SITE / "font"
SITEMAP = SITE / "sitemap-fonts.xml"
ASSET_V = "fontseo4"
OG_IMAGE = "https://aqsuek.kz/qarip/assets/story-cards/create.jpg"

PREVIEW = "Қазақ тілі — ғажап тіл. Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І"
GLYPHS = "Әә · Ғғ · Ққ · Ңң · Өө · Ұұ · Үү · Һһ · Іі"
DISCLAIMER = (
    "Qarip қаріптердің қазақ әліпбиін қолдауын тексеруге және оларды табуды жеңілдетуге арналған. "
    "Қаріптердің авторлық құқықтары тиісті құқық иелеріне тиесілі. "
    "Коммерциялық қолданар алдында әр қаріптің лицензия шарттарын тексеріңіз."
)

LICENSE = {
    "open": (
        "Open Source",
        "Бұл қаріп open source (көбіне SIL OFL). Коммерциялық қолданар алдында лицензия шарттарын тексеріңіз.",
    ),
    "commercial": (
        "Commercial use",
        "Коммерциялық қолдануға рұқсат етілген болуы мүмкін. Шарттарды тексеріңіз.",
    ),
    "personal": (
        "Personal use",
        "Негізінен жеке қолдануға арналған. Коммерциялық қолданар алдында шарттарды тексеріңіз.",
    ),
    "check": (
        "Лицензияны тексеріңіз",
        "Лицензия туралы толық ақпарат расталмаған. Коммерциялық қолданбас бұрын құқық иесінің шарттарын тексеріңіз.",
    ),
}


def google_css(family: str) -> str:
    q = quote_plus(family)
    return f"https://fonts.googleapis.com/css2?family={q}:ital,wght@0,400;0,700;1,400&display=swap"


def detail_html(font: dict, names: dict[str, str]) -> str:
    name = font["name"]
    slug = font["slug"]
    style = font.get("style") or "Қаріп"
    category = font.get("category") or ""
    license_key = font.get("license") or "check"
    badge, license_copy = LICENSE.get(license_key, LICENSE["check"])
    author = (font.get("author") or "").strip()
    is_google = font.get("source") == "google" or str(font.get("preview") or "").startswith("google:")
    family = font["family"]
    preview = font.get("preview") or ""
    download = font.get("download") or ""
    author_block = (
        f'<p class="font-detail-author">Автор: {escape(author)}</p>'
        if author
        else '<p class="font-detail-author">Автор көрсетілмеген</p>'
    )
    similar_links = "".join(
        f'<a class="font-similar-card" href="/qarip/font/{escape(s)}/"><strong>{escape(names.get(s, s))}</strong></a>'
        for s in font.get("similar") or []
    )
    similar = (
        f'<section class="font-detail-similar" aria-labelledby="similar-title">'
        f'<h2 id="similar-title">Ұқсас қаріптер</h2>'
        f'<div class="similar-grid">{similar_links}</div></section>'
        if similar_links
        else ""
    )

    url = f"https://aqsuek.kz/qarip/font/{slug}/"
    title = f"{name} қазақша қаріп — жүктеу және онлайн тексеру | Qarip"
    origin = "Google Fonts. " if is_google else ""
    description = (
        f"{name} қазақша қаріпін онлайн тексеріп, қазақ әріптерін (Ә Ғ Қ Ң Ө Ұ Ү Һ І) қарап "
        f"және жүктеп алыңыз. {origin}Санат: {style}. Qarip каталогы."
    )
    style_line = f"{style} · {category}" if category else style
    google_link = (
        f'<link rel="stylesheet" href="{escape(google_css(family))}"/>\n'
        if is_google
        else ""
    )
    if is_google:
        dl_btn = (
            f'<a class="font-download" href="{escape(download)}" target="_blank" rel="noreferrer">'
            f"Google Fonts →</a>"
        )
        kicker = "GOOGLE FONTS · ҚАЗАҚША"
    else:
        dl_btn = f'<a class="font-download" href="{escape(download)}" download>Жүктеу ↓</a>'
        kicker = "ҚАЗАҚША ҚАРІП"

    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Qarip", "item": "https://aqsuek.kz/qarip/"},
                    {"@type": "ListItem", "position": 2, "name": "Қаріптер", "item": "https://aqsuek.kz/qarip/#catalog"},
                    {"@type": "ListItem", "position": 3, "name": name, "item": url},
                ],
            },
            {
                "@type": "WebPage",
                "@id": url,
                "url": url,
                "name": title,
                "description": description,
                "inLanguage": "kk",
                "isPartOf": {"@type": "WebSite", "name": "Qarip", "url": "https://aqsuek.kz/qarip/"},
                "about": {
                    "@type": "CreativeWork",
                    "name": name,
                    "genre": style,
                    "inLanguage": "kk",
                },
            },
        ],
    }
    ld = json.dumps(json_ld, ensure_ascii=False, separators=(",", ":"))
    source_attr = "google" if is_google else "local"

    return f"""<!DOCTYPE html>
<html lang="kk" class="qarip-v2">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{escape(title)}</title>
<meta name="description" content="{escape(description)}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<link rel="canonical" href="{escape(url)}"/>
<link rel="icon" href="/qarip/favicon.svg" type="image/svg+xml"/>
<meta property="og:type" content="website"/>
<meta property="og:locale" content="kk_KZ"/>
<meta property="og:site_name" content="Qarip"/>
<meta property="og:title" content="{escape(title)}"/>
<meta property="og:description" content="{escape(description)}"/>
<meta property="og:url" content="{escape(url)}"/>
<meta property="og:image" content="{OG_IMAGE}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{escape(title)}"/>
<meta name="twitter:description" content="{escape(description)}"/>
<meta name="twitter:image" content="{OG_IMAGE}"/>
<link rel="stylesheet" href="/qarip/_next/static/css/index.Bx9punr5.css?v={ASSET_V}" media="print"/>
<link rel="stylesheet" href="/qarip/catalog-pages.css?v={ASSET_V}"/>
{google_link}<script type="application/ld+json">{ld}</script>
</head>
<body class="qarip-font-page">
<header class="topbar">
  <a class="brand" href="/qarip/"><span class="brand-mark">Ә</span><span>Qarip<span class="brand-dot">.</span></span></a>
  <nav aria-label="Негізгі мәзір">
    <a href="/qarip/#catalog">Қаріптер</a>
    <a href="/qarip/stories/">Stories</a>
    <a href="/qarip/#tester">Онлайн тексеру</a>
    <a href="/qarip/#about">Жоба туралы</a>
  </nav>
  <div class="qarip-nav-actions">
    <a class="qarip-nav-start" href="/qarip/stories/">Бастау →</a>
    <button type="button" class="qarip-nav-toggle" aria-label="Мәзір" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
<main class="font-detail" data-slug="{escape(slug)}" data-name="{escape(name)}" data-family="{escape(family)}" data-preview="{escape(preview)}" data-download="{escape(download)}" data-license="{escape(license_key)}" data-style="{escape(style)}" data-source="{source_attr}">
  <nav class="font-detail-crumbs" aria-label="Навигация">
    <a href="/qarip/">Qarip</a>
    <span aria-hidden="true">/</span>
    <a href="/qarip/#catalog">Қаріптер</a>
    <span aria-hidden="true">/</span>
    <span>{escape(name)}</span>
  </nav>

  <header class="font-detail-head">
    <p class="font-detail-kicker">{kicker}</p>
    <h1>{escape(name)}</h1>
    {author_block}
    <p class="font-detail-lead">{escape(name)} қаріпін өз мәтініңізбен тексеріп, қазақ әріптерін қарап және жүктеп алыңыз.</p>
  </header>

  <section class="font-detail-stage" aria-label="Қаріп үлгісі">
    <label class="tester-label">Өз мәтініңді жаз
      <input class="detail-preview-input" value="{escape(PREVIEW)}" aria-label="Қаріпті тексеру мәтіні"/>
    </label>
    <div class="size-control"><span>A</span><input class="detail-size" type="range" min="20" max="72" value="40"/><strong>40px</strong></div>
    <p class="font-detail-preview" style="font-family:'{escape(family)}', sans-serif">{escape(PREVIEW)}</p>
    <p class="font-detail-letters" style="font-family:'{escape(family)}', sans-serif">{GLYPHS}</p>
    <p class="glyph-live">Қазақ әліпбиі: тексерілуде</p>
  </section>

  <section class="font-detail-panel" aria-label="Жүктеу және лицензия">
    <div class="font-detail-meta">
      <span>{escape(style_line)}</span>
      <span class="license-badge">{escape(badge)}</span>
    </div>
    <p class="license-copy">{escape(license_copy)}</p>
    <div class="font-detail-actions">
      {dl_btn}
      <button type="button" class="font-favorite" aria-pressed="false" aria-label="Ұнағандарға қосу">♡</button>
      <a class="qarip-cta-secondary font-detail-stories" href="/qarip/stories/">Stories жасап көру</a>
    </div>
  </section>

  {similar}
</main>
<footer class="font-detail-footer">
  <p class="disclaimer">{escape(DISCLAIMER)}</p>
  <nav class="qarip-footer-nav" aria-label="Төменгі мәзір">
    <a href="/qarip/#catalog">Қаріптер</a>
    <a href="/qarip/stories/">Stories</a>
    <a href="/qarip/#about">Жоба туралы</a>
  </nav>
</footer>
<script src="/qarip/qarip-lib.js?v={ASSET_V}"></script>
<script src="/qarip/font-detail.js?v={ASSET_V}"></script>
</body>
</html>
"""


def write_sitemap(fonts: list[dict]) -> None:
    urls = [
        "https://aqsuek.kz/qarip/",
        "https://aqsuek.kz/qarip/stories/",
    ] + [f"https://aqsuek.kz/qarip/font/{f['slug']}/" for f in fonts]
    body = "\n".join(
        f"  <url><loc>{escape(u)}</loc><changefreq>weekly</changefreq></url>" for u in urls
    )
    SITEMAP.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>\n",
        encoding="utf-8",
    )
    print(f"wrote sitemap {len(urls)} urls → {SITEMAP.relative_to(ROOT)}")


def main() -> None:
    fonts = json.loads(DATA.read_text(encoding="utf-8"))
    names = {f["slug"]: f["name"] for f in fonts}
    keep = {f["slug"] for f in fonts}
    for path in FONT_DIR.glob("*/index.html"):
        if path.parent.name not in keep:
            path.unlink()
            try:
                path.parent.rmdir()
            except OSError:
                pass
    for font in fonts:
        path = FONT_DIR / font["slug"] / "index.html"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(detail_html(font, names), encoding="utf-8")
    write_sitemap(fonts)
    print(f"wrote {len(fonts)} font pages")


if __name__ == "__main__":
    main()
