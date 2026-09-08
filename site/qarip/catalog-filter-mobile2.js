(() => {
  const ALL = "Барлығы";
  const STORIES_GROUP = "Stories";
  const PAGE_SIZE = 32;
  const KZ_GLYPHS = ["Ә", "Ғ", "Қ", "Ң", "Ө", "Ұ", "Ү", "Һ"];
  let visibleLimit = PAGE_SIZE;
  let mode = "all";
  let style = ALL;
  let licenseMode = "all";
  let localIndex = new Map();
  let googleIndex = new Map();

  const styleSheet = document.createElement("style");
  styleSheet.textContent =
    '.font-card[data-filter-hide="1"]{display:none!important}.font-sticker,.qarip-sticker-toast{display:none!important}.catalog-more{display:block;width:min(100%,520px);margin:32px auto 0;padding:16px 22px;border:1px solid #1c1c1a;background:#d9ff47;color:#181816;font:700 14px/1.2 Arial,sans-serif;cursor:pointer}.catalog-more:hover{background:#181816;color:#d9ff47}.categories button small,.fav-filter small{margin-left:5px;opacity:.55;font:inherit}.meta .license-check{color:#8b4a14}.meta .license-open{color:#286332}.font-favorite{border:1px solid #181816;background:transparent;color:#181816;border-radius:99px;width:30px;height:30px;font-size:18px;line-height:1;cursor:pointer}.font-favorite[aria-pressed="true"]{background:#181816;color:#d9ff47}.fav-filter{cursor:pointer;background:transparent;border:0;align-items:center;gap:8px;padding:0 18px;font:700 13px/1 Arial,sans-serif;color:#181816;white-space:nowrap}.fav-filter.active{background:#181816;color:#d9ff47}.catalog-empty{width:min(100%,520px);margin:28px auto 0;color:#5c5c56;font:600 14px/1.45 Arial,sans-serif;text-align:center}.intro-cta-row{position:relative;z-index:2;margin-top:22px}.intro-cta{display:inline-flex;align-items:center;padding:14px 22px;border:1px solid #181816;border-radius:999px;background:#181816;color:#d9ff47;font:800 14px/1 Arial,sans-serif;letter-spacing:.03em;text-decoration:none}.intro-cta:hover{background:#d9ff47;color:#181816}html{scroll-padding-top:16px}@media(max-width:900px){.topbar{height:auto!important;min-height:76px;padding-top:12px;padding-bottom:12px;grid-template-columns:1fr auto;grid-template-areas:"brand social" "nav nav";row-gap:8px}.topbar .brand{grid-area:brand}.topbar .header-end{grid-area:social}.topbar nav{grid-area:nav;display:flex!important;flex-wrap:wrap;gap:10px 16px;font-size:13px}.intro-cta{min-height:44px}.fav-filter{min-height:44px;padding:0 12px}}@media(max-width:640px){.catalog-more{margin-top:20px;padding:15px 16px;font-size:13px}}';
  document.head.appendChild(styleSheet);

  function slugify(name, download) {
    const Q = window.Qarip;
    const raw = Q?.cleanText(name) || "";
    const fromName = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (fromName) return fromName;
    const file = String(download || "").split("/").pop() || "font";
    return file.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "font";
  }

  function isGoogleCard(card) {
    return [...card.querySelectorAll("a")].some((a) => /fonts\.google\.com/.test(a.getAttribute("href") || ""));
  }

  function recordFor(card) {
    const name = (card.querySelector("h3")?.textContent || "").trim();
    if (isGoogleCard(card)) return googleIndex.get(name) || null;
    return localIndex.get(name) || null;
  }

  function pruneDroppedCards() {
    if (localIndex.size + googleIndex.size < 50) return 0;
    const grid = document.querySelector(".font-grid");
    if (!grid) return 0;
    let n = 0;
    grid.querySelectorAll(":scope > .font-card").forEach((card) => {
      if (recordFor(card)) return;
      card.remove();
      n += 1;
    });
    return n;
  }

  function ensureFiltersUi() {
    const controls = document.querySelector(".controls");
    if (!controls) return;
    controls.querySelectorAll(".filters-toggle").forEach((el) => el.remove());
    delete controls.dataset.filtersOpen;
    const cats = controls.querySelector(".categories");
    if (cats && !cats.querySelector('[data-group="stories"]')) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.group = "stories";
      btn.dataset.style = STORIES_GROUP;
      btn.title = "Stories және 9:16 мәтінге арналған әдемі қаріптер";
      btn.innerHTML = 'Stories<small>0</small>';
      const first = cats.querySelector("button");
      if (first) first.after(btn);
      else cats.append(btn);
    }
    controls.querySelectorAll(".license-filters").forEach((el) => el.remove());
    ensureCatCarousel(controls, cats);
  }

  function ensureCatCarousel(controls, cats) {
    if (!cats) return;
    let wrap = cats.closest(".cat-carousel");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "cat-carousel";
      wrap.dataset.open = "0";
      cats.replaceWith(wrap);
      wrap.append(cats);
    }
    let more = wrap.querySelector(".cat-more");
    if (!more) {
      more = document.createElement("button");
      more.type = "button";
      more.className = "cat-more";
      more.setAttribute("aria-expanded", "false");
      more.setAttribute("aria-label", "Барлық сүзгілерді көрсету");
      more.textContent = "↓";
      more.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const open = wrap.dataset.open === "1" ? "0" : "1";
        wrap.dataset.open = open;
        more.textContent = open === "1" ? "↑" : "↓";
        more.setAttribute("aria-expanded", String(open === "1"));
        more.setAttribute("aria-label", open === "1" ? "Сүзгілерді жию" : "Барлық сүзгілерді көрсету");
        requestAnimationFrame(syncCatOverflow);
      });
      wrap.append(more);
    }
    const fav = controls.querySelector(".fav-filter");
    if (fav && fav.parentElement !== cats) cats.append(fav);
    requestAnimationFrame(syncCatOverflow);
  }

  function syncCatOverflow() {
    const wrap = document.querySelector(".cat-carousel");
    if (!wrap) return;
    const cats = wrap.querySelector(".categories");
    const more = wrap.querySelector(".cat-more");
    if (!cats || !more) return;
    if (wrap.dataset.open === "1") {
      more.hidden = false;
      wrap.classList.add("has-more");
      return;
    }
    more.hidden = false;
    wrap.classList.add("has-more");
    const overflow = cats.scrollWidth > cats.clientWidth + 2;
    more.hidden = !overflow;
    wrap.classList.toggle("has-more", overflow);
  }

  function styleName(button) {
    if (!button) return ALL;
    if (button.dataset.style) return button.dataset.style;
    const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const raw = (textNode ? textNode.textContent : button.textContent) || "";
    return raw.replace(/\d+/g, " ").replace(/\s+/g, " ").trim() || ALL;
  }

  function savedNames() {
    if (window.Qarip?.savedNames) return window.Qarip.savedNames();
    try {
      return new Set(JSON.parse(localStorage.getItem("qarip-favorites") || "[]"));
    } catch {
      return new Set();
    }
  }

  function query() {
    const input = document.querySelector(".search input");
    return ((input && input.value) || "").trim().toLowerCase();
  }

  function paintActive() {
    document.querySelectorAll(".categories button").forEach((button) => {
      if (button.classList.contains("fav-filter")) return;
      const name = styleName(button);
      button.classList.toggle("active", mode !== "fav" && name === style);
    });
    document.querySelector(".fav-filter")?.classList.toggle("active", mode === "fav");
  }

  function renderMoreButton(matching) {
    let more = document.querySelector(".catalog-more");
    if (matching.length <= visibleLimit) {
      more?.remove();
      return;
    }
    if (!more) {
      more = document.createElement("button");
      more.type = "button";
      more.className = "catalog-more";
      more.addEventListener("click", () => {
        visibleLimit += PAGE_SIZE;
        apply();
      });
      document.querySelector(".font-grid")?.after(more);
    }
    const shown = Math.min(matching.length, visibleLimit);
    const remaining = matching.length - shown;
    more.textContent = `Тағы ${Math.min(remaining, PAGE_SIZE)} қаріпті ашу · ${shown} / ${matching.length}`;
  }

  function renderEmpty(matching) {
    let empty = document.querySelector(".catalog-empty");
    if (mode === "fav" && matching.length === 0) {
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "catalog-empty";
        document.querySelector(".font-grid")?.after(empty);
      }
      empty.textContent = "Ұнаған қаріп жоқ. Карточкадағы ♡ белгісін басыңыз.";
      return;
    }
    empty?.remove();
  }

  function kazakhGlyphsMissing(family) {
    const report = window.Qarip?.kazakhGlyphReport?.(family);
    if (!report) return false;
    return report.status !== "full";
  }

  function applyGlyphDataset(card, family) {
    const report = window.Qarip?.kazakhGlyphReport?.(family);
    if (!report || !report.loaded) {
      card.dataset.glyph = "wait";
      delete card.dataset.missing;
      return;
    }
    card.dataset.glyph = report.status;
    if (report.status === "some" && report.missing.length) {
      card.dataset.missing = report.missing.join(" ");
    } else {
      delete card.dataset.missing;
    }
  }

  function stripStickers(cards) {
    cards.forEach((card) => {
      card.querySelectorAll(".font-sticker").forEach((btn) => btn.remove());
      const actions = card.querySelector(".card-actions");
      if (!actions) return;
      const parent = actions.parentNode;
      while (actions.firstChild) parent.insertBefore(actions.firstChild, actions);
      actions.remove();
    });
    document.querySelector(".qarip-sticker-toast")?.remove();
  }

  function labelGlyphStatus(card) {
    const glyphStatus = card.querySelector(".meta > span:nth-child(2)");
    if (!glyphStatus || glyphStatus.dataset.glyphChecked === "1") return;
    const raw = glyphStatus.textContent.replace(/\s+/g, " ").trim();
    if (raw !== "Жүктелген файл" && !raw.includes("Кодтауды тексеру")) return;
    glyphStatus.dataset.glyphChecked = "1";
    const family = card.querySelector(".font-preview")?.style.fontFamily || "";
    if (kazakhGlyphsMissing(family)) {
      glyphStatus.hidden = false;
      glyphStatus.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = "Кодтауды тексеру";
      });
      if (!/Кодтауды тексеру/.test(glyphStatus.textContent)) {
        glyphStatus.append("Кодтауды тексеру");
      }
      glyphStatus.classList.add("license-check");
    } else {
      glyphStatus.hidden = true;
      glyphStatus.classList.remove("license-check");
    }
  }

  function ensureFavButton() {
    const controls = document.querySelector(".controls");
    if (!controls) return;
    const cats = document.querySelector(".cat-carousel .categories") || controls.querySelector(".categories");
    let button = controls.querySelector(".fav-filter");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button fav-filter";
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = 'Ұнағандар<small>0</small>';
      (cats || controls).append(button);
    } else if (cats && button.parentElement !== cats) {
      cats.append(button);
    }
  }

  function updateFavCount() {
    const small = document.querySelector(".fav-filter small");
    if (small) small.textContent = String(savedNames().size);
  }

  function decorateCatalog(cards) {
    const Q = window.Qarip;
    const categoryTotals = new Map();
    const seen = new Set();
    cards.forEach((card) => {
      const name = Q?.cleanText(card.querySelector("h3")?.textContent) || card.querySelector("h3")?.textContent?.trim();
      if (!name) return;
      const rec = recordFor(card);
      const uniq = `${isGoogleCard(card) ? "g" : "l"}:${name}`;
      if (!seen.has(uniq)) {
        seen.add(uniq);
        const category = rec?.style || card.querySelector(".meta > span")?.textContent?.trim();
        if (category) {
          categoryTotals.set(category, (categoryTotals.get(category) || 0) + 1);
        }
      }
      const category = rec?.style || card.querySelector(".meta > span")?.textContent?.trim();
      if (category) card.dataset.style = category;
      const makerEl = card.querySelector(".card-top p");
      const author = rec ? rec.author : Q?.displayAuthor(makerEl?.textContent);
      if (makerEl) {
        if (author) makerEl.textContent = author;
        else makerEl.hidden = true;
      }
      card.querySelector(".card-top .pick")?.setAttribute("hidden", "");
      card.querySelectorAll(".meta > span").forEach((span, index) => {
        const raw = (span.textContent || "").replace(/\s+/g, " ").trim();
        if (raw === "Жүктелген файл" || raw === "Тікелей" || raw === "Жеке жинақ") {
          span.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) node.textContent = "";
          });
        }
        if (index > 0) return;
      });
      const licenseKey = rec?.license || (isGoogleCard(card) ? "open" : "check");
      card.dataset.license = licenseKey;
      card.dataset.slug = rec?.slug || slugify(name, rec?.download);
      card.dataset.source = rec?.source || (isGoogleCard(card) ? "google" : "local");
      const h3 = card.querySelector("h3");
      if (h3 && card.dataset.slug && !h3.querySelector("a")) {
        const label = h3.textContent;
        h3.replaceChildren();
        const link = document.createElement("a");
        link.href = `/qarip/font/${card.dataset.slug}/`;
        link.textContent = label;
        h3.append(link);
      }
      if (rec?.category) card.dataset.category = rec.category;
      if (rec?.useCase) card.dataset.usecase = rec.useCase;
      if (Array.isArray(rec?.tags)) card.dataset.tags = rec.tags.join(" ");
      else if (rec?.tags) card.dataset.tags = rec.tags;
      const family = rec?.family || card.querySelector(".font-preview")?.style.fontFamily || "";
      card.dataset.family = family.replace(/^["']|["']$/g, "");
      if (rec?.preview) card.dataset.preview = rec.preview;
      if (rec?.download) card.dataset.download = rec.download;
      const license = card.querySelector(".meta > span:last-child");
      if (license) {
        license.title = Q?.licenseInfo(licenseKey).title || "";
      }
      if (card.dataset.fontLoaded === "1") applyGlyphDataset(card, `"${card.dataset.family}"`);
      else card.dataset.glyph = "wait";
    });

    ensureFiltersUi();
    ensureFavButton();
    document.querySelectorAll(".categories button").forEach((button) => {
      if (button.classList.contains("fav-filter")) return;
      const category = styleName(button);
      button.dataset.style = category;
      let total = 0;
      if (category === ALL) total = seen.size;
      else if (category === STORIES_GROUP) {
        seen.forEach((key) => {
          const nm = key.slice(2);
          const rec = key.startsWith("g:") ? googleIndex.get(nm) : localIndex.get(nm);
          if (rec?.useCase === "stories") total += 1;
        });
      } else total = categoryTotals.get(category) || 0;
      let count = button.querySelector("small");
      if (!count) {
        count = document.createElement("small");
        button.appendChild(count);
      }
      count.textContent = String(total);
    });
    updateFavCount();
  }

  function addFavorites(cards) {
    const saved = savedNames();
    cards.forEach((card) => {
      const name = card.querySelector("h3")?.textContent?.trim();
      const top = card.querySelector(".card-top");
      if (!name || !top || top.querySelector(".font-favorite")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "font-favorite";
      button.title = "Ұнағандарға сақтау";
      button.setAttribute("aria-label", `${name} қаріпін ұнағандарға сақтау`);
      button.setAttribute("aria-pressed", String(saved.has(name)));
      button.textContent = saved.has(name) ? "♥" : "♡";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = savedNames();
        if (next.has(name)) next.delete(name);
        else next.add(name);
        localStorage.setItem("qarip-favorites", JSON.stringify([...next]));
        button.setAttribute("aria-pressed", String(next.has(name)));
        button.textContent = next.has(name) ? "♥" : "♡";
        updateFavCount();
        if (mode === "fav") apply();
      });
      top.append(button);
    });
  }

  function apply(resetLimit = false) {
    if (resetLimit) visibleLimit = PAGE_SIZE;
    const q = query();
    const grid = document.querySelector(".font-grid");
    if (!grid) return;
    const cards = grid.querySelectorAll(":scope > .font-card");
    const fav = savedNames();
    const seen = new Set();
    const matching = [];
    cards.forEach((card) => {
      const name = (card.querySelector("h3")?.textContent || "").trim();
      const maker = (card.querySelector(".card-top p")?.textContent || "").trim();
      const fontStyle = card.dataset.style || (card.querySelector(".meta > span")?.textContent || "").trim();
      const license = card.dataset.license || "check";
      const duplicate = name !== "" && seen.has(name);
      if (name) seen.add(name);
      const matchStyle =
        mode === "fav"
          ? fav.has(name)
          : style === ALL
            ? true
            : style === STORIES_GROUP
              ? card.dataset.usecase === "stories"
              : fontStyle === style;
      const matchLicense = licenseMode === "all" || license === licenseMode;
      const hay = `${name} ${maker} ${fontStyle} ${card.dataset.category || ""} ${card.dataset.tags || ""} ${card.dataset.usecase || ""}`.toLowerCase();
      const matchQ = !q || hay.includes(q);
      if (matchStyle && matchLicense && matchQ && !duplicate) matching.push(card);
    });

    const shownCards = new Set(matching.slice(0, visibleLimit));
    cards.forEach((card) => {
      const show = shownCards.has(card);
      if (show) {
        card.removeAttribute("data-filter-hide");
        card.style.removeProperty("display");
      } else {
        card.setAttribute("data-filter-hide", "1");
        card.style.display = "none";
      }
    });
    const count = document.querySelector(".workspace-heading .count");
    if (count) {
      count.textContent = `${Math.min(matching.length, visibleLimit)} / ${matching.length} қаріп`;
    }
    renderMoreButton(matching);
    renderEmpty(matching);
    paintActive();
    const favBtn = document.querySelector(".fav-filter");
    if (favBtn) favBtn.setAttribute("aria-pressed", String(mode === "fav"));
    requestAnimationFrame(syncCatOverflow);
  }

  function applyGroupFromUrl() {
    try {
      if (new URLSearchParams(location.search).get("group") === "stories") selectStyle(STORIES_GROUP);
    } catch {}
  }

  function selectStyle(name) {
    mode = name === ALL ? "all" : "style";
    style = name;
    apply(true);
  }

  function selectFav() {
    mode = "fav";
    apply(true);
  }

  document.addEventListener(
    "click",
    (event) => {
      const favBtn = event.target.closest(".fav-filter");
      if (favBtn) {
        event.preventDefault();
        event.stopPropagation();
        if (mode === "fav") selectStyle(ALL);
        else selectFav();
        return;
      }
      const btn = event.target.closest(".categories button");
      if (!btn) return;
      event.stopPropagation();
      selectStyle(styleName(btn));
    },
    true
  );

  document.addEventListener("click", (event) => {
    const download = event.target.closest(".card-bottom a[download], .card-bottom a[aria-label$='жүктеу'], a.font-download, .card-bottom a[href*='fonts.google.com']");
    if (download && window.Qarip) {
      const card = download.closest(".font-card") || download.closest(".font-detail");
      const href = download.getAttribute("href") || card?.dataset.download || "";
      const filename = (href.split("/").pop() || "").split("?")[0];
      const license = card?.dataset.license || "check";
      if (window.Qarip.handleDownloadClick(event, license, href, filename)) return;
    }
    const card = event.target.closest(".font-card");
    if (card && !event.target.closest("a,button,.font-favorite")) {
      const slug = card.dataset.slug;
      if (slug) {
        event.preventDefault();
        location.href = `/qarip/font/${slug}/`;
      }
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.closest(".search input")) apply(true);
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.target === "_blank") return;
    const id = (link.getAttribute("href") || "").slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${id}`);
  });

  function observeVisibleFonts(cards) {
    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => loadCardFont(card));
      return;
    }
    if (!observeVisibleFonts.io) {
      observeVisibleFonts.io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadCardFont(entry.target);
        });
      }, { rootMargin: "120px 0px", threshold: 0.01 });
    }
    cards.forEach((card) => observeVisibleFonts.io.observe(card));
  }

  async function loadCardFont(card) {
    if (card.dataset.fontReady === "1") return;
    const family = card.dataset.family || "";
    const url = card.dataset.preview || "";
    const ok = window.Qarip?.loadFamily ? await window.Qarip.loadFamily(family, url) : false;
    if (!ok) {
      card.dataset.glyph = "wait";
      return;
    }
    card.dataset.fontReady = "1";
    card.dataset.fontLoaded = "1";
    applyGlyphDataset(card, `"${family}"`);
  }

  function polishFooter() {
    const text =
      "Qarip қаріптердің қазақ әліпбиін қолдауын тексеруге және оларды табуды жеңілдетуге арналған. Қаріптердің авторлық құқықтары тиісті құқық иелеріне тиесілі. Коммерциялық қолданар алдында әр қаріптің лицензия шарттарын тексеріңіз.";
    document.querySelectorAll("#about p, footer p").forEach((el) => {
      el.textContent = text;
      el.dataset.qaripDisclaimer = "1";
    });
  }

  function bindPreviewDefault() {
    const tester = document.querySelector("#tester.sticky-tester");
    const input = tester?.querySelector('input[aria-label="Қаріпті тексеру мәтіні"]') || document.querySelector('.sticky-tester input[aria-label="Қаріпті тексеру мәтіні"]');
    const next = window.Qarip?.PREVIEW_TEXT;
    if (!input || !next) return;
    const label = tester?.querySelector(".tester-label span");
    if (label) label.textContent = "Өз мәтініңді жаз";
    if (tester && !tester.dataset.hintBound) {
      tester.dataset.hintBound = "1";
      tester.querySelector(".tester-label")?.addEventListener("click", () => input.focus());
    }
    if (!input.value.trim() || input.value === "Қазақ елі — тәуелсіз, заманауи және болашаққа сенімді ел. Ә Ғ Қ Ң Ө Ұ Ү Һ І" || input.value === "Қазақша мәтін үлгісі") {
      const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      proto?.set?.call(input, next);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function isStoriesPage() {
    return window.QaripSite?.isStoriesPage?.() || /\/qarip\/stories\/?$/.test(location.pathname);
  }

  async function loadFontIndex() {
    if (localIndex.size || googleIndex.size) return;
    try {
      const res = await fetch("/qarip/data/fonts.json", { cache: "no-store" });
      const rows = await res.json();
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        if (!row?.name) return;
        if (row.source === "google") googleIndex.set(row.name, row);
        else localIndex.set(row.name, row);
      });
    } catch {}
  }

  function start() {
    if (isStoriesPage()) {
      polishFooter();
      window.QaripSite?.apply?.();
      return;
    }
    const grid = document.querySelector(".font-grid");
    if (!grid || grid.dataset.filterObserved === "1") return;
    grid.dataset.filterObserved = "1";
    loadFontIndex().then(() => {
      pruneDroppedCards();
      decorateCatalog(grid.querySelectorAll(":scope > .font-card"));
      addFavorites(grid.querySelectorAll(":scope > .font-card"));
      stripStickers(grid.querySelectorAll(":scope > .font-card"));
      observeVisibleFonts(grid.querySelectorAll(":scope > .font-card"));
      apply();
      applyGroupFromUrl();
    });
    polishFooter();
    bindPreviewDefault();
    window.QaripSite?.apply?.();
    window.Qarip?.ensureModal?.();
    window.addEventListener("resize", () => requestAnimationFrame(syncCatOverflow));
    let timer = 0;
    new MutationObserver(() => {
      clearTimeout(timer);
        timer = setTimeout(() => {
          pruneDroppedCards();
          decorateCatalog(grid.querySelectorAll(":scope > .font-card"));
          addFavorites(grid.querySelectorAll(":scope > .font-card"));
          stripStickers(grid.querySelectorAll(":scope > .font-card"));
          observeVisibleFonts(grid.querySelectorAll(":scope > .font-card"));
          apply();
        }, 40);
    }).observe(grid, { childList: true, subtree: true });
  }

  function refreshGlyphs() {
    const grid = document.querySelector(".font-grid");
    if (!grid) return;
    grid.querySelectorAll(":scope > .font-card .meta > span:nth-child(2)").forEach((span) => {
      delete span.dataset.glyphChecked;
    });
    decorateCatalog(grid.querySelectorAll(":scope > .font-card"));
    stripStickers(grid.querySelectorAll(":scope > .font-card"));
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (isStoriesPage()) {
        polishFooter();
        window.QaripSite?.apply?.();
        return;
      }
      const grid = document.querySelector(".font-grid");
      if (!grid) return;
      pruneDroppedCards();
      const cards = grid.querySelectorAll(":scope > .font-card");
      decorateCatalog(cards);
      addFavorites(cards);
      stripStickers(cards);
      observeVisibleFonts(cards);
      apply();
      polishFooter();
      bindPreviewDefault();
      window.QaripSite?.apply?.();
      const ready = document.fonts?.ready;
      if (ready && typeof ready.then === "function") ready.then(() => setTimeout(refreshGlyphs, 50));
      else setTimeout(refreshGlyphs, 400);
    }, 220);
  });
})();
