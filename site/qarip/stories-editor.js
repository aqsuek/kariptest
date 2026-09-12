(() => {
  if (!/\/qarip\/(stories|reels)\/?$/.test(location.pathname)) return;

  const STORE = "qarip-stories-editor-v2";
  const FAV_FONTS = "qarip-stories-font-favs";
  const FAV_PAIRS = "qarip-stories-combo-favs";
  const ASSET_V = "leto20";

  let FONT_DATA = null;
  let fontDataPromise = null;
  function loadFontData() {
    if (fontDataPromise) return fontDataPromise;
    fontDataPromise = fetch("/qarip/data/fonts.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        FONT_DATA = Array.isArray(list) ? list : [];
        return FONT_DATA;
      })
      .catch(() => {
        FONT_DATA = [];
        return FONT_DATA;
      });
    return fontDataPromise;
  }

  const fontFaceCache = new Map();
  function ensureFontFace(family, url) {
    if (!family || !url || typeof FontFace === "undefined") return Promise.resolve(null);
    if (fontFaceCache.has(family)) return fontFaceCache.get(family);
    const ext = (url.split(".").pop() || "").toLowerCase();
    const fmt = ext === "otf" ? "opentype" : ext === "woff2" ? "woff2" : ext === "woff" ? "woff" : "truetype";
    let face;
    try {
      face = new FontFace(family, `url("${url}") format("${fmt}")`);
    } catch {
      return Promise.resolve(null);
    }
    const p = face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        return loaded;
      })
      .catch(() => null);
    fontFaceCache.set(family, p);
    return p;
  }

  function loadPreviewFont(family, url) {
    const fam = decodeURIComponent(family || "");
    const src = url || "";
    if (src.startsWith("google:")) return ensureGoogleFont(src.slice(7) || fam);
    if (src) return ensureFontFace(fam, src);
    return Promise.resolve();
  }

  let fontCardObserver = null;
  function observeFontCards(container) {
    const run = (btn) => loadPreviewFont(btn.dataset.fontFamily || "", btn.dataset.fontUrl);
    if (typeof IntersectionObserver === "undefined") {
      qsa(".leto-font-grid button[data-font-url]", container).forEach(run);
      return;
    }
    if (fontCardObserver) fontCardObserver.disconnect();
    fontCardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          fontCardObserver.unobserve(entry.target);
        });
      },
      { root: container, rootMargin: "300px 0px" }
    );
    qsa(".leto-font-grid button[data-font-url]", container).forEach((btn) => fontCardObserver.observe(btn));
  }

  function fontCategoryOf(styleText, categoryText) {
    const t = `${styleText || ""} ${categoryText || ""}`.toLowerCase();
    if (/сериф|serif/.test(t)) return "serif";
    if (/дисплей|display/.test(t)) return "display";
    if (/қолжазба|hand|script/.test(t)) return "script";
    if (/моно|mono/.test(t)) return "mono";
    return "sans";
  }

  const SOLID = ["#101014", "#ffffff", "#f5c518", "#ff2d7b", "#64b5ff", "#0f3d2e", "#7c3aed", "#1e293b", "#f97316", "#000000"];
  const GRADS = [
    { id: "night", label: "Night", css: "linear-gradient(160deg,#0b1020,#1a1030 55%,#101014)" },
    { id: "warm", label: "Warm", css: "linear-gradient(160deg,#3a2218,#8b5a2b 50%,#1a120e)" },
    { id: "rose", label: "Rose", css: "linear-gradient(160deg,#4a1830,#d96b8a 55%,#2a1020)" },
    { id: "ocean", label: "Ocean", css: "linear-gradient(160deg,#0b2a40,#1f6f8b 50%,#062018)" },
    { id: "mint", label: "Mint", css: "linear-gradient(160deg,#11332a,#4db6a0 55%,#0b1c18)" },
    { id: "paper", label: "Paper", css: "linear-gradient(180deg,#f7f6f2,#e8e2d6)" },
  ];
  const PHOTOS = [
    { id: "minimal", label: "Minimal", src: `/qarip/assets/story-bg/minimal.jpg?v=${ASSET_V}`, tags: ["эстетика"] },
    { id: "coffee", label: "Coffee", src: `/qarip/assets/story-bg/coffee.jpg?v=${ASSET_V}`, tags: ["эстетика"] },
    { id: "beauty", label: "Beauty", src: `/qarip/assets/story-bg/beauty.jpg?v=${ASSET_V}`, tags: ["гүл"] },
    { id: "travel", label: "Travel", src: `/qarip/assets/story-bg/travel.jpg?v=${ASSET_V}`, tags: ["жаз"] },
    { id: "lifestyle", label: "Lifestyle", src: `/qarip/assets/story-bg/lifestyle.jpg?v=${ASSET_V}`, tags: ["эстетика"] },
    { id: "nature", label: "Nature", src: `/qarip/assets/story-bg/nature.jpg?v=${ASSET_V}`, tags: ["жаз"] },
    { id: "business", label: "Business", src: `/qarip/assets/story-bg/business.jpg?v=${ASSET_V}`, tags: ["бренд"] },
  ];
  const PAIR_META = [
    { name: "Playfair × Montserrat", group: "Luxury", sampleA: "Balance", sampleB: "қазақша стиль" },
    { name: "Prata × Gilroy", group: "Luxury", sampleA: "Chic", sampleB: "editorial look" },
    { name: "Oswald × Onest", group: "Bold", sampleA: "BOLD", sampleB: "қысқа сөз" },
    { name: "Yeseva × Manrope", group: "Beauty", sampleA: "Stylish", sampleB: "soft & clean" },
    { name: "Cormorant × Gotham", group: "Minimal", sampleA: "Minimal", sampleB: "тыныш дизайн" },
    { name: "Rubik × Inter", group: "Business", sampleA: "WORK", sampleB: "business tone" },
    { name: "Forum × Oswald", group: "Travel", sampleA: "GO", sampleB: "travel mood" },
  ];
  const STICKERS = ["✨", "♡", "★", "🔥", "✦", "✿", "●", "▲", "■", "♪", "✧", "❖"];
  const LAYOUTS = {
    center: { hook: 42, mark: 58, extra: 72 },
    top: { hook: 22, mark: 34, extra: 46 },
    bottom: { hook: 58, mark: 70, extra: 82 },
    promo: { hook: 28, mark: 68, extra: 80 },
  };

  const defaultState = () => ({
    bg: { type: "transparent", value: "", fit: "cover", posX: 50, posY: 50 },
    logo: { src: "", pos: "top-right", size: 18, opacity: 100, margin: 8 },
    layout: "center",
    text: { size: 100, align: "center", lineHeight: 100, letterSpacing: 0, maxWidth: 86 },
    customGrad: { from: "#0b1020", to: "#ff4d8d", angle: 160 },
    stickers: [],
    lastPair: "",
  });

  let state = defaultState();
  try {
    state = { ...defaultState(), ...JSON.parse(localStorage.getItem(STORE) || "{}") };
    state.bg = { ...defaultState().bg, ...(state.bg || {}) };
    state.logo = { ...defaultState().logo, ...(state.logo || {}) };
    state.text = { ...defaultState().text, ...(state.text || {}) };
    state.customGrad = { ...defaultState().customGrad, ...(state.customGrad || {}) };
    if (!Array.isArray(state.stickers)) state.stickers = [];
  } catch {}

  let fontFavs = [];
  let pairFavs = [];
  try {
    fontFavs = JSON.parse(localStorage.getItem(FAV_FONTS) || "[]");
    pairFavs = JSON.parse(localStorage.getItem(FAV_PAIRS) || "[]");
  } catch {}

  const history = [];
  let histIdx = -1;
  let activeSheet = "";
  let fontCat = "all";
  let fontQuery = "";
  let pairGroup = "all";
  let bgTab = "colors";

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return [...root.querySelectorAll(sel)];
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      localStorage.setItem(FAV_FONTS, JSON.stringify(fontFavs));
      localStorage.setItem(FAV_PAIRS, JSON.stringify(pairFavs));
    } catch {}
  }
  function pushHistory() {
    const snap = JSON.stringify(state);
    if (histIdx >= 0 && history[histIdx] === snap) return;
    history.splice(histIdx + 1);
    history.push(snap);
    if (history.length > 30) history.shift();
    histIdx = history.length - 1;
  }
  function restoreHistory(dir) {
    const next = histIdx + dir;
    if (next < 0 || next >= history.length) return;
    histIdx = next;
    try {
      state = { ...defaultState(), ...JSON.parse(history[histIdx]) };
      applyAll();
    } catch {}
  }

  function ensureStyleLink() {
    if (qs("link[data-stories-editor-css]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/qarip/stories-editor.css?v=${ASSET_V}`;
    link.dataset.storiesEditorCss = "1";
    document.head.appendChild(link);
  }

  function icon(svg) {
    return svg;
  }
  const ICO = {
    back: "←",
    undo: "↶",
    redo: "↷",
    more: "⋯",
    export: "⇧",
    layers: "⧉",
  };

  function ensureShell() {
    const pick = qs(".reels-pick");
    const preview = qs(".phone-preview");
    const controls = qs(".reels-controls");
    if (!pick || !preview) return null;
    if (pick.dataset.leto === "1") {
      return {
        pick,
        preview,
        controls,
        app: qs(".leto-app"),
        stage: qs(".leto-stage"),
      };
    }
    pick.dataset.leto = "1";

    const app = document.createElement("div");
    app.className = "leto-app";
    app.innerHTML = `
      <div class="leto-topbar">
        <button type="button" class="leto-icon" data-acto="back" aria-label="Артқа">${ICO.back}</button>
        <div class="leto-top-center">
          <button type="button" class="leto-icon" data-acto="undo" aria-label="Болдырмау">${ICO.undo}</button>
          <button type="button" class="leto-icon" data-acto="redo" aria-label="Қайталау">${ICO.redo}</button>
        </div>
        <div class="leto-top-right">
          <button type="button" class="leto-icon" data-acto="more" aria-label="Тағы">${ICO.more}</button>
          <button type="button" class="leto-export" data-acto="export" aria-label="Экспорт">↑</button>
        </div>
      </div>
      <div class="leto-stage"></div>
    `;

    const editor = document.createElement("div");
    editor.className = "stories-editor";
    const previewCol = document.createElement("div");
    previewCol.className = "stories-editor-preview";
    const panelCol = document.createElement("div");
    panelCol.className = "stories-editor-panel";

    preview.parentNode.insertBefore(app, preview);
    const stage = app.querySelector(".leto-stage");
    stage.append(editor);
    previewCol.append(preview);
    editor.append(previewCol, panelCol);
    if (controls) panelCol.append(controls);

    // dock
    const dock = document.createElement("div");
    dock.className = "leto-dock";
    dock.innerHTML = `
      <button type="button" class="leto-text-btn" data-acto="text" aria-label="Мәтін">Aa</button>
      <button type="button" class="leto-add" data-acto="add"><div class="plus">+</div><span>Қосу</span></button>
      <button type="button" class="leto-layers-btn" data-acto="layers" aria-label="Қабаттар">${ICO.layers}</button>
    `;
    document.body.append(dock);

    // text bar
    const textbar = document.createElement("div");
    textbar.className = "leto-textbar";
    textbar.innerHTML = `
      <div class="leto-face-group" role="group" aria-label="Қаріп стилі">
        <button type="button" data-text-tool="face-regular" title="Қалыпты" aria-label="Қалыпты"><span>Aa</span></button>
        <button type="button" data-text-tool="face-bold" class="tb-bold" title="Қалың" aria-label="Қалың"><span>Aa</span></button>
        <button type="button" data-text-tool="face-italic" class="tb-italic" title="Курсив" aria-label="Курсив"><span>Aa</span></button>
      </div>
      <button type="button" data-text-tool="align-left">Сол</button>
      <button type="button" data-text-tool="align-center" class="active">Орта</button>
      <button type="button" data-text-tool="align-right">Оң</button>
      <button type="button" data-text-tool="size-down">A−</button>
      <button type="button" data-text-tool="size-up">A+</button>
      <button type="button" data-text-tool="font" class="tb-font">Шрифт</button>
      <button type="button" data-text-tool="style" class="tb-style">Түс</button>
    `;
    document.body.append(textbar);

    // scrim + sheets container
    const scrim = document.createElement("div");
    scrim.className = "leto-scrim";
    scrim.dataset.acto = "close";
    document.body.append(scrim);

    ["add", "text", "fonts", "pairs", "bg", "stickers", "gallery", "layers", "more", "style", "layout"].forEach((id) => {
      const sheet = document.createElement("div");
      sheet.className = "leto-sheet";
      sheet.dataset.sheet = id;
      sheet.innerHTML = `
        <div class="leto-handle"></div>
        <div class="leto-sheet-head">
          <h3></h3>
          <button type="button" data-acto="close" aria-label="Жабу">×</button>
        </div>
        <div class="leto-sheet-body"></div>
      `;
      document.body.append(sheet);
    });

    bindChrome(app, dock, textbar, scrim);
    return { pick, preview, controls, app, stage };
  }

  function sheetEl(id) {
    return qs(`.leto-sheet[data-sheet="${id}"]`);
  }

  function openSheet(id) {
    activeSheet = id;
    qs(".leto-scrim")?.classList.add("on");
    qsa(".leto-sheet").forEach((el) => el.classList.toggle("on", el.dataset.sheet === id));
    renderSheet(id);
  }
  function closeSheets() {
    activeSheet = "";
    qs(".leto-scrim")?.classList.remove("on");
    qsa(".leto-sheet").forEach((el) => el.classList.remove("on"));
    unmountTextInputs();
  }

  function bindChrome(app, dock, textbar) {
    const onAct = (e) => {
      const btn = e.target.closest("[data-acto]");
      if (!btn) return;
      const act = btn.dataset.acto;
      if (act === "back") {
        const choice = qs(".leto-choice");
        if (choice && choice.classList.contains("done")) {
          closeSheets();
          choice.classList.remove("done");
        } else {
          location.href = "/qarip/";
        }
      }
      if (act === "undo") restoreHistory(-1);
      if (act === "redo") restoreHistory(1);
      if (act === "export") {
        if (quickMode) copyStickerNative();
        else exportPng({ transparent: state.bg.type === "transparent" });
      }
      if (act === "add") openSheet("add");
      if (act === "text") {
        showTextbar();
        openSheet("text");
      }
      if (act === "layers") openSheet("layers");
      if (act === "more") openSheet("more");
      if (act === "close") closeSheets();
    };
    app.addEventListener("click", onAct);
    dock.addEventListener("click", onAct);
    qs(".leto-scrim")?.addEventListener("click", onAct);
    qsa(".leto-sheet").forEach((s) => s.addEventListener("click", onAct));

    textbar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-text-tool]");
      if (!btn) return;
      const t = btn.dataset.textTool;
      if (t.startsWith("align-")) {
        state.text.align = t.replace("align-", "");
        textbar.querySelectorAll("[data-text-tool^=align-]").forEach((b) => b.classList.toggle("active", b === btn));
      }
      if (t === "size-up") state.text.size = Math.min(140, (state.text.size || 100) + 8);
      if (t === "size-down") state.text.size = Math.max(70, (state.text.size || 100) - 8);
      if (t.startsWith("face-")) {
        applyFace(t.replace("face-", ""));
        return;
      }
      if (t === "style") {
        openSheet("style");
        return;
      }
      if (t === "font") {
        openSheet("fonts");
        return;
      }
      pushHistory();
      save();
      applyLayout();
    });

    document.addEventListener(
      "pointerdown",
      (e) => {
        if (e.target.closest(".sub-hook, .sub-mark, .sub-extra")) {
          showTextbar();
          return;
        }
        if (e.target.closest(".leto-textbar, .leto-sheet, .leto-dock")) return;
        if (qs(".subtitle-stack [data-selected='1']")) return;
        textbar.classList.remove("on");
      },
      true
    );

    const stack = qs(".subtitle-stack");
    if (stack && stack.dataset.faceObserve !== "1") {
      stack.dataset.faceObserve = "1";
      new MutationObserver(() => {
        if (stack.querySelector("[data-selected='1']")) showTextbar();
        else if (!activeSheet) textbar.classList.remove("on");
      }).observe(stack, { subtree: true, attributes: true, attributeFilter: ["data-selected"] });
    }
  }

  function renderSheet(id) {
    const sheet = sheetEl(id);
    if (!sheet) return;
    const title = sheet.querySelector("h3");
    const body = sheet.querySelector(".leto-sheet-body");
    const titles = {
      add: "Қабат қосу",
      text: "Мәтін",
      fonts: "Шрифттер",
      pairs: "Қаріп жұптары",
      bg: "Фондар",
      stickers: "Стикерлер",
      gallery: "Галерея",
      layers: "Қабаттар",
      more: "Тағы",
      style: "Мәтін түсі мен фоны",
      layout: "Макет",
    };
    title.textContent = titles[id] || "";
    // Detach live text <input> nodes before any body.innerHTML swap so we never lose them.
    unmountTextInputs();
    if (id === "add") body.innerHTML = renderAddMenu();
    if (id === "text") body.innerHTML = renderTextSheet();
    if (id === "fonts") body.innerHTML = renderFonts();
    if (id === "pairs") body.innerHTML = renderPairs();
    if (id === "bg") body.innerHTML = renderBg();
    if (id === "stickers") body.innerHTML = renderStickers();
    if (id === "gallery") body.innerHTML = renderGallery();
    if (id === "layers") body.innerHTML = renderLayers();
    if (id === "more") body.innerHTML = renderMore();
    if (id === "style") body.innerHTML = renderStyleSheet();
    if (id === "layout") body.innerHTML = renderLayoutSheet();
    if (id === "text") mountTextInputs(body);
    if (id === "fonts") observeFontCards(body);
    bindSheetBody(id, body);
  }

  function renderAddMenu() {
    const items = [
      { id: "text", ico: "Aa", label: "Мәтін қосу" },
      { id: "fonts", ico: "Ff", label: "Шрифттер" },
      { id: "pairs", ico: "&", label: "Қаріп жұптары" },
      { id: "bg", ico: "⛰", label: "Фон" },
      { id: "stickers", ico: "✦", label: "Стикерлер" },
      { id: "gallery", ico: "❀", label: "Лого/сурет" },
      { id: "layout", ico: "▦", label: "Макет" },
    ];
    return `<div class="leto-add-grid">${items
      .map((it) => `<button type="button" data-add="${it.id}"><div class="ico">${it.ico}</div><small>${it.label}</small></button>`)
      .join("")}</div>`;
  }

  function renderLayoutSheet() {
    const items = [
      { id: "top", label: "Жоғарыда", desc: "Мәтін жоғарғы бөлікте" },
      { id: "center", label: "Ортада", desc: "Классикалық орталық композиция" },
      { id: "bottom", label: "Төменде", desc: "Мәтін төменгі бөлікте" },
      { id: "promo", label: "Промо", desc: "Акцент жоғарыда, ақпарат төменде" },
    ];
    return `
      <p class="leto-hint">Мәтін блоктарының тік орналасуын таңда — canvas-та бірден өзгереді.</p>
      <div class="leto-layout-grid">
        ${items
          .map((it) => {
            const pos = LAYOUTS[it.id];
            const active = state.layout === it.id;
            return `<button type="button" data-layout="${it.id}" class="${active ? "active" : ""}">
              <div class="lo-frame">
                <span class="lo-line" style="top:${pos.hook}%"></span>
                <span class="lo-line" style="top:${pos.mark}%"></span>
                <span class="lo-line lo-sm" style="top:${pos.extra}%"></span>
              </div>
              <b>${it.label}</b>
              <small>${it.desc}</small>
            </button>`;
          })
          .join("")}
      </div>
    `;
  }

  function catalogFonts() {
    if (FONT_DATA && FONT_DATA.length) {
      return FONT_DATA.filter((f) => f.name && f.family && f.preview).map((f) => ({
        name: f.name,
        family: f.family,
        cat: fontCategoryOf(f.style, f.category),
        url: f.preview,
      }));
    }
    const seen = new Set();
    const fonts = [];
    qsa(".font-card").forEach((card) => {
      const name = card.querySelector("h3")?.textContent?.trim();
      const preview = card.querySelector(".font-preview");
      const family = preview?.style.fontFamily || "";
      const style = (card.querySelector(".meta")?.textContent || "").toLowerCase();
      if (!name || !family || seen.has(name + family)) return;
      seen.add(name + family);
      const rec = (FONT_DATA || []).find((f) => f.name === name && (card.querySelector("a[href*='fonts.google.com']") ? f.source === "google" : f.source !== "google"));
      const fallback = (FONT_DATA || []).find((f) => f.name === name);
      const row = rec || fallback;
      const url = row?.preview || "";
      fonts.push({ name, family, cat: fontCategoryOf(style, row?.category || ""), url });
    });
    // fallback from pair families if catalog hidden empty
    if (!fonts.length) {
      PAIR_META.forEach((p) => {
        fonts.push({ name: p.name.split(" × ")[0], family: `"${p.name.split(" × ")[0]}"`, cat: "display" });
      });
    }
    return fonts;
  }

  function renderFonts() {
    const cats = [
      ["all", "Барлығы"],
      ["fav", "♥"],
      ["serif", "Сериф"],
      ["sans", "Санс"],
      ["display", "Дисплей"],
      ["script", "Қолжазба"],
    ];
    let fonts = catalogFonts();
    if (fontCat === "fav") fonts = fonts.filter((f) => fontFavs.includes(f.name));
    else if (fontCat !== "all") fonts = fonts.filter((f) => f.cat === fontCat);
    if (fontQuery) {
      const q = fontQuery.toLowerCase();
      fonts = fonts.filter((f) => f.name.toLowerCase().includes(q));
    }
    const { key: selKey } = selectedLayerInfo();
    return `
      <p class="leto-style-tag">Қаріп қолданылады: <b>${TEXT_LAYER_LABEL[selKey] || selKey}</b> мәтініне</p>
      <div class="leto-chips" data-font-cats>
        ${cats.map(([id, label]) => `<button type="button" data-font-cat="${id}" class="${fontCat === id ? "active" : ""}">${label}</button>`).join("")}
      </div>
      <input class="leto-search" data-font-search type="search" placeholder="Қаріп іздеу..." value="${fontQuery.replace(/"/g, "&quot;")}">
      <div class="leto-font-grid">
        ${fonts
          .slice(0, 60)
          .map((f) => {
            const on = fontFavs.includes(f.name);
            return `<button type="button" data-font-name="${escapeAttr(f.name)}" data-font-family="${encodeURIComponent(f.family)}" ${f.url ? `data-font-url="${escapeAttr(f.url)}"` : ""}>
              <span class="fc-glyph" style="font-family:${escapeAttr(f.family)}">Aa</span>
              <b style="font-family:${escapeAttr(f.family)}">${escapeHtml(f.name)}</b>
              <span class="heart ${on ? "on" : ""}" data-fav-font="${escapeAttr(f.name)}">${on ? "♥" : "♡"}</span>
            </button>`;
          })
          .join("") || '<p class="leto-hint">Қаріп табылмады</p>'}
      </div>
    `;
  }

  function renderPairs() {
    const groups = ["all", "Minimal", "Bold", "Luxury", "Beauty", "Business", "Travel", "fav"];
    let list = PAIR_META.slice();
    if (pairGroup === "fav") list = list.filter((p) => pairFavs.includes(p.name));
    else if (pairGroup !== "all") list = list.filter((p) => p.group === pairGroup);
    // get live font families from existing buttons if possible
    const live = qsa(".reels-options:not(.reels-colors) > button");
    return `
      <div class="leto-chips">
        ${groups
          .map((g) => `<button type="button" data-pair-group="${g}" class="${pairGroup === g ? "active" : ""}">${g === "all" ? "Барлығы" : g === "fav" ? "♥" : g}</button>`)
          .join("")}
      </div>
      <div class="leto-pair-grid">
        ${list
          .map((p) => {
            const btn = live.find((b) => (b.textContent || "").includes(p.name.split(" × ")[0]));
            const aStyle = btn?.querySelector("i")?.getAttribute("style") || "";
            const bStyle = btn?.querySelector("em")?.getAttribute("style") || "";
            const on = pairFavs.includes(p.name);
            return `<button type="button" data-pair="${escapeAttr(p.name)}">
              <div class="pair-a" style="${aStyle}">${escapeHtml(p.sampleA)}</div>
              <div class="pair-b" style="${bStyle}">${escapeHtml(p.sampleB)}</div>
              <span class="heart ${on ? "on" : ""}" data-fav-pair="${escapeAttr(p.name)}">${on ? "♥" : "♡"}</span>
            </button>`;
          })
          .join("")}
        <button type="button" data-pair="random"><div class="pair-a">?</div><div class="pair-b">Кездейсоқ</div></button>
      </div>
    `;
  }

  function currentBgPhotoCard() {
    const isPhoto = state.bg.type === "photo" || state.bg.type === "upload";
    if (!isPhoto || !state.bg.value) return "";
    const label =
      state.bg.type === "upload"
        ? "Жүктелген фото"
        : PHOTOS.find((p) => p.src === state.bg.value)?.label || "Фон фотосы";
    return `
      <div class="leto-bg-current">
        <div class="leto-bg-thumb" style="background-image:url('${escapeAttr(state.bg.value)}')"></div>
        <div class="leto-bg-current-meta">
          <b>Қазіргі фон</b>
          <small>${escapeHtml(label)}</small>
        </div>
        <button type="button" data-bg-clear>Фонды өшіру</button>
      </div>`;
  }

  function renderBg() {
    const tabs = [
      ["colors", "Түстер"],
      ["grads", "Градиент"],
      ["photos", "Фото"],
      ["upload", "Жүктеу"],
      ["transparent", "Мөлдір"],
    ];
    const current = currentBgPhotoCard();
    let pane = "";
    if (bgTab === "colors") {
      pane = `<div class="leto-swatches">${SOLID.map((c) => `<button type="button" data-solid="${c}" style="background:${c}"></button>`).join("")}
        <label class="leto-file" style="width:100%;margin-top:8px">Өз түс<input type="color" data-solid-custom value="#101014"></label></div>`;
    } else if (bgTab === "grads") {
      const cg = state.customGrad;
      pane = `
        <div class="leto-grad-grid">${GRADS.map((g) => `<button type="button" data-grad="${g.id}" style="background:${g.css}">${g.label}</button>`).join("")}</div>
        <p class="leto-hint" style="margin-top:14px">Өз градиентіңді жаса</p>
        <div class="leto-custom-grad">
          <div class="leto-custom-grad-preview" data-grad-preview style="background:${customGradCss()}"></div>
          <div class="leto-custom-grad-row">
            <label class="leto-custom-swatch">Бастау<input type="color" data-grad-from value="${cg.from}"></label>
            <label class="leto-custom-swatch">Аяғы<input type="color" data-grad-to value="${cg.to}"></label>
          </div>
          <input type="range" min="0" max="360" value="${cg.angle}" data-grad-angle style="width:100%;margin-top:10px">
          <button type="button" class="leto-custom-apply" data-grad-apply>Осы градиентті қолдану</button>
        </div>`;
    } else if (bgTab === "photos") {
      pane = `<div class="leto-chips">
        <button type="button" data-photo-tag="all" class="active">Барлығы</button>
        <button type="button" data-photo-tag="жаз">Жаз</button>
        <button type="button" data-photo-tag="эстетика">Эстетика</button>
        <button type="button" data-photo-tag="бренд">Бренд</button>
      </div>
      <p class="leto-hint">Басқа фотоны басыңыз — фон ауысады.</p>
      <div class="leto-photo-grid" data-photo-grid>
        ${PHOTOS.map((p) => `<button type="button" data-photo="${p.id}" data-tags="${p.tags.join(" ")}" class="${state.bg.type === "photo" && state.bg.value === p.src ? "is-current" : ""}" style="background-image:url('${p.src}')"><span>${p.label}</span></button>`).join("")}
      </div>`;
    } else if (bgTab === "upload") {
      pane = `<label class="leto-file">${state.bg.type === "upload" ? "Басқа сурет жүктеу" : "Фон суретін жүктеу"}<input type="file" accept="image/*" data-bg-upload></label>
        <p class="leto-hint">${state.bg.type === "upload" ? "Жаңа файл ескі фонды ауыстырады." : "Cover режимінде орналасады."}</p>`;
    } else {
      pane = `<p class="leto-hint">Мөлдір фон — PNG экспортында фонсыз шығады. Алдын ала қарауда checkerboard көрінеді.</p>
        <button type="button" data-transparent="1" style="min-height:44px;width:100%;border:0;border-radius:14px;background:#2a2a33;color:#fff;font:800 13px/1 Arial,sans-serif">Мөлдір қосу</button>`;
    }
    return `
      <div class="leto-chips" data-bg-tabs>
        ${tabs.map(([id, label]) => `<button type="button" data-bg-tab="${id}" class="${bgTab === id ? "active" : ""}">${label}</button>`).join("")}
      </div>
      ${current}
      ${pane}
    `;
  }

  function customGradCss() {
    const g = state.customGrad;
    return `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`;
  }

  function renderStickers() {
    return `
      <p class="leto-hint">Стикерді басып қосыңыз. Кейін canvas-та жылжытуға болады.</p>
      <div class="leto-sticker-grid">
        ${STICKERS.map((s) => `<button type="button" data-sticker="${s}">${s}</button>`).join("")}
      </div>
    `;
  }

  const TEXT_LAYER_LABEL = { hook: "Акцент", mark: "Қосымша", extra: "Жаңа мәтін" };

  function textInputEls() {
    const editor = qs(".reels-copy-edit");
    return {
      editor,
      hook: editor?.querySelector('input[aria-label="Акцент"]') || null,
      mark: editor?.querySelector('input[aria-label="Қосымша"]') || null,
      extra: editor?.querySelector(".extra-input") || null,
    };
  }

  function renderTextSheet() {
    const chips = qsa(".text-layer-picks button[data-layer]");
    const active = chips.filter((c) => !c.hidden).map((c) => c.dataset.layer);
    const addBtn = qs(".text-add-btn");
    const canAdd = !!addBtn && !addBtn.hidden;
    if (!active.length) {
      return `<p class="leto-hint">Мәтін қабаттарын табу мүмкін болмады. Бетті жаңартып көріңіз.</p>`;
    }
    return `
      <p class="leto-hint">Түртіп теріңіз — canvas-та бірден өзгереді. Ретімен қосылады: Акцент → Қосымша → Жаңа мәтін.</p>
      <div class="leto-text-list">
        ${active
          .map(
            (key) => `
          <div class="leto-text-row">
            <div class="row-head">
              <b>${TEXT_LAYER_LABEL[key] || key}</b>
              <div class="row-actions">
                <button type="button" class="row-font" data-font-layer="${key}">Aa Шрифт</button>
                <button type="button" class="row-style" data-style-layer="${key}">🎨 Стиль</button>
                ${active.length > 1 ? `<button type="button" class="row-remove" data-remove-layer="${key}">Өшіру ×</button>` : ""}
              </div>
            </div>
            <div class="row-slot" data-slot="${key}"></div>
          </div>`
          )
          .join("")}
      </div>
      ${
        canAdd
          ? `<button type="button" class="leto-text-add" data-native-add-text>+ Жаңа мәтін қосу</button>`
          : `<p class="leto-hint">Барлық мәтін орны қолданылды (макс 3).</p>`
      }
    `;
  }

  function mountTextInputs(body) {
    const inputs = textInputEls();
    qsa(".row-slot", body).forEach((slot) => {
      const key = slot.dataset.slot;
      const input = inputs[key];
      if (input) slot.appendChild(input);
    });
  }

  function unmountTextInputs() {
    const sheet = sheetEl("text");
    if (!sheet) return;
    const editor = qs(".reels-copy-edit");
    if (!editor) return;
    ["hook", "mark", "extra"].forEach((key) => {
      const slot = sheet.querySelector(`[data-slot="${key}"]`);
      const input = slot?.querySelector("input");
      if (input) editor.appendChild(input);
    });
  }

  function layerSelKey(el) {
    if (!el) return "hook";
    if (el.classList.contains("sub-mark")) return "mark";
    if (el.classList.contains("sub-extra")) return "extra";
    return "hook";
  }

  function selectedLayerInfo() {
    const stack = qs(".subtitle-stack");
    const selected = stack?.querySelector("[data-selected='1']");
    const key = layerSelKey(selected);
    const el = selected || stack?.querySelector(".sub-hook") || null;
    return { stack, el, key };
  }

  function currentFace() {
    const native = qs(".text-color-tools [data-face].active");
    if (native?.dataset.face) return native.dataset.face;
    const { el } = selectedLayerInfo();
    if (!el) return "regular";
    const style = getComputedStyle(el);
    if (style.fontStyle === "italic" || style.fontStyle === "oblique") return "italic";
    if (parseInt(style.fontWeight, 10) >= 600) return "bold";
    return "regular";
  }

  function syncTextbarFace() {
    const face = currentFace();
    qsa(".leto-textbar [data-text-tool^='face-']").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.textTool === `face-${face}`);
    });
    qsa(".leto-face-row [data-face]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.face === face);
    });
  }

  function showTextbar() {
    qs(".leto-textbar")?.classList.add("on");
    syncTextbarFace();
  }

  function applyFace(face) {
    const key = selectedLayerInfo().key;
    const native = qs(`.text-layer-picks [data-layer="${key}"]`);
    if (native && !native.classList.contains("active")) native.click();
    const btn = qs(`.text-color-tools [data-face="${face}"]`);
    if (btn) btn.click();
    else {
      const { el } = selectedLayerInfo();
      if (el) {
        if (face === "regular") {
          el.style.setProperty("font-weight", "400", "important");
          el.style.setProperty("font-style", "normal", "important");
        } else if (face === "bold") {
          el.style.setProperty("font-weight", "800", "important");
          el.style.setProperty("font-style", "normal", "important");
        } else {
          el.style.setProperty("font-weight", "700", "important");
          el.style.setProperty("font-style", "italic", "important");
        }
      }
    }
    syncTextbarFace();
    pushHistory();
    save();
  }

  function setNative(name, value) {
    const input = qs(`.text-color-tools [data-native="${name}"]`);
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function renderStyleSheet() {
    const { el, key } = selectedLayerInfo();
    const cs = el ? getComputedStyle(el) : null;
    const bg = cs?.backgroundColor || "";
    const rgbaMatch = bg.match(/^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)$/);
    const alpha = rgbaMatch ? parseFloat(rgbaMatch[1]) : bg.startsWith("rgb(") ? 1 : bg && bg !== "transparent" ? 1 : 0;
    const hasBg = !!bg && bg !== "transparent" && alpha > 0.03;
    const radiusPx = cs ? parseFloat(cs.borderRadius) || 0 : 0;
    const trackingPx = cs ? parseFloat(cs.letterSpacing) || 0 : 0;
    const face = currentFace();
    return `
      <p class="leto-style-tag">Таңдалған қабат: <b>${TEXT_LAYER_LABEL[key] || key}</b></p>

      <p class="leto-style-label">Қаріп стилі</p>
      <div class="leto-face-row" role="group" aria-label="Қаріп стилі">
        <button type="button" data-face="regular" class="${face === "regular" ? "active" : ""}"><span>Aa</span> Қалыпты</button>
        <button type="button" data-face="bold" class="tb-bold ${face === "bold" ? "active" : ""}"><span>Aa</span> Қалың</button>
        <button type="button" data-face="italic" class="tb-italic ${face === "italic" ? "active" : ""}"><span>Aa</span> Курсив</button>
      </div>

      <p class="leto-style-label">Мәтін түсі</p>
      <div class="leto-swatches">
        ${SOLID.map((c) => `<button type="button" data-style-text-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}
      </div>

      <p class="leto-style-label">Әріп аралығы (interval)</p>
      <div class="leto-style-range-row">
        <input type="range" data-style-tracking min="-4" max="16" step="0.5" value="${trackingPx}">
        <span class="leto-style-val" data-style-tracking-val>${trackingPx}px</span>
      </div>

      <div class="leto-style-row-head">
        <p class="leto-style-label">Мәтін фоны (пилл)</p>
        <button type="button" class="leto-style-bgoff${!hasBg ? " active" : ""}" data-style-bg-off>Фонсыз</button>
      </div>
      <div class="leto-swatches">
        ${SOLID.map((c) => `<button type="button" data-style-bg-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}
      </div>

      <p class="leto-style-label${!hasBg ? " disabled" : ""}">Мөлдірлік (transparency)</p>
      <div class="leto-style-range-row">
        <input type="range" data-style-bg-opacity min="0" max="1" step="0.05" value="${hasBg ? alpha : 1}" ${!hasBg ? "disabled" : ""}>
        <span class="leto-style-val" data-style-opacity-val>${Math.round((hasBg ? alpha : 1) * 100)}%</span>
      </div>

      <p class="leto-style-label${!hasBg ? " disabled" : ""}">Дөңгелектену (rounding)</p>
      <div class="leto-style-range-row">
        <input type="range" data-style-bg-radius min="0" max="60" step="2" value="${hasBg ? Math.min(60, radiusPx) : 24}" ${!hasBg ? "disabled" : ""}>
        <span class="leto-style-val" data-style-radius-val>${hasBg ? Math.min(60, Math.round(radiusPx)) : 24}px</span>
      </div>
    `;
  }

  function renderGallery() {
    return `
      <p class="leto-hint">Логотип немесе сурет жүктеңіз — Stories үстіне қойылады.</p>
      <label class="leto-file">Сурет / логотип жүктеу<input type="file" accept="image/*" data-logo-upload></label>
      <div class="leto-chips">
        ${["top-left","top-center","top-right","center","bottom-left","bottom-center","bottom-right"]
          .map((p) => `<button type="button" data-logo-pos="${p}" class="${state.logo.pos === p ? "active" : ""}">${p}</button>`)
          .join("")}
      </div>
      <p class="leto-hint">Өлшем: ${state.logo.size}% · Мөлдірлік: ${state.logo.opacity}%</p>
      <input type="range" min="8" max="40" value="${state.logo.size}" data-logo-size style="width:100%">
      <input type="range" min="20" max="100" value="${state.logo.opacity}" data-logo-opacity style="width:100%;margin-top:8px">
      ${state.logo.src ? `<button type="button" data-logo-clear style="margin-top:10px;min-height:42px;width:100%;border:0;border-radius:12px;background:#2a2a33;color:#fff">Логотипті өшіру</button>` : ""}
    `;
  }

  function renderLayers() {
    const layers = [
      { id: "bg", label: "Фон" },
      { id: "hook", label: "Акцент мәтін" },
      { id: "mark", label: "Қосымша мәтін" },
      { id: "extra", label: "Қосымша жол" },
      { id: "logo", label: "Логотип", off: !state.logo.src },
      ...state.stickers.map((s, i) => ({ id: `sticker-${i}`, label: `Стикер ${s.char}` })),
    ].filter((l) => !l.off);
    return `<div class="leto-layer-list">${layers
      .map((l) => `<button type="button" data-layer-focus="${l.id}"><span>${l.label}</span><span>›</span></button>`)
      .join("")}</div>`;
  }

  function renderMore() {
    return `
      <div class="leto-add-grid" style="grid-template-columns:1fr 1fr">
        <button type="button" data-more="png"><div class="ico">⇩</div><small>PNG жүктеу</small></button>
        <button type="button" data-more="transparent"><div class="ico">◇</div><small>Мөлдір PNG</small></button>
        <button type="button" data-more="share"><div class="ico">↗</div><small>Бөлісу</small></button>
        <button type="button" data-more="sticker"><div class="ico">⧉</div><small>Мәтін көшіру</small></button>
      </div>
      <p class="leto-hint" style="margin-top:12px">Qarip Stories — жеңіл редактор. Leto стиліндегі ағын: Қосу → таңдау → экспорт.</p>
    `;
  }

  function bindSheetBody(id, body) {
    body.onclick = (e) => {
      const removeLayerBtn = e.target.closest("[data-remove-layer]");
      if (removeLayerBtn) {
        const key = removeLayerBtn.dataset.removeLayer;
        unmountTextInputs();
        qs(`.text-layer-picks [data-layer="${key}"] .layer-x`)?.click();
        pushHistory();
        save();
        renderSheet("text");
        return;
      }
      const styleLayerBtn = e.target.closest("[data-style-layer]");
      if (styleLayerBtn) {
        const key = styleLayerBtn.dataset.styleLayer;
        unmountTextInputs();
        qs(`.text-layer-picks [data-layer="${key}"]`)?.click();
        openSheet("style");
        return;
      }
      const fontLayerBtn = e.target.closest("[data-font-layer]");
      if (fontLayerBtn) {
        const key = fontLayerBtn.dataset.fontLayer;
        unmountTextInputs();
        qs(`.text-layer-picks [data-layer="${key}"]`)?.click();
        openSheet("fonts");
        return;
      }
      if (e.target.closest("[data-native-add-text]")) {
        unmountTextInputs();
        qs(".text-add-btn")?.click();
        pushHistory();
        save();
        renderSheet("text");
        setTimeout(() => {
          const chips = qsa(".text-layer-picks button[data-layer]").filter((c) => !c.hidden);
          const last = chips[chips.length - 1];
          const key = last?.dataset.layer;
          const input = key && textInputEls()[key];
          input?.focus();
        }, 30);
        return;
      }

      const add = e.target.closest("[data-add]");
      if (add) {
        openSheet(add.dataset.add);
        return;
      }

      const layoutBtn = e.target.closest("[data-layout]");
      if (layoutBtn) {
        state.layout = layoutBtn.dataset.layout;
        pushHistory();
        save();
        applyLayout();
        renderSheet("layout");
        return;
      }

      const favFont = e.target.closest("[data-fav-font]");
      if (favFont) {
        e.stopPropagation();
        const name = favFont.dataset.favFont;
        if (fontFavs.includes(name)) fontFavs = fontFavs.filter((x) => x !== name);
        else fontFavs.push(name);
        save();
        renderSheet("fonts");
        return;
      }
      const fontBtn = e.target.closest("[data-font-name]");
      if (fontBtn && !e.target.closest("[data-fav-font]")) {
        applyFont(decodeURIComponent(fontBtn.dataset.fontFamily), fontBtn.dataset.fontName, fontBtn.dataset.fontUrl);
        closeSheets();
        return;
      }
      const fontCatBtn = e.target.closest("[data-font-cat]");
      if (fontCatBtn) {
        fontCat = fontCatBtn.dataset.fontCat;
        renderSheet("fonts");
        return;
      }

      const favPair = e.target.closest("[data-fav-pair]");
      if (favPair) {
        e.stopPropagation();
        const name = favPair.dataset.favPair;
        if (pairFavs.includes(name)) pairFavs = pairFavs.filter((x) => x !== name);
        else pairFavs.push(name);
        save();
        renderSheet("pairs");
        return;
      }
      const pairBtn = e.target.closest("[data-pair]");
      if (pairBtn && !e.target.closest("[data-fav-pair]")) {
        applyPair(pairBtn.dataset.pair);
        closeSheets();
        return;
      }
      const pairGroupBtn = e.target.closest("[data-pair-group]");
      if (pairGroupBtn) {
        pairGroup = pairGroupBtn.dataset.pairGroup;
        renderSheet("pairs");
        return;
      }

      const bgTabBtn = e.target.closest("[data-bg-tab]");
      if (bgTabBtn) {
        bgTab = bgTabBtn.dataset.bgTab;
        renderSheet("bg");
        return;
      }
      const solid = e.target.closest("[data-solid]");
      if (solid) {
        state.bg = { ...state.bg, type: "solid", value: solid.dataset.solid };
        pushHistory();
        save();
        applyBackground();
        return;
      }
      const grad = e.target.closest("[data-grad]");
      if (grad) {
        const g = GRADS.find((x) => x.id === grad.dataset.grad);
        state.bg = { ...state.bg, type: "gradient", value: g.css };
        pushHistory();
        save();
        applyBackground();
        return;
      }
      const photo = e.target.closest("[data-photo]");
      if (photo) {
        const p = PHOTOS.find((x) => x.id === photo.dataset.photo);
        state.bg = { ...state.bg, type: "photo", value: p.src };
        pushHistory();
        save();
        applyBackground();
        renderSheet("bg");
        return;
      }
      const photoTag = e.target.closest("[data-photo-tag]");
      if (photoTag) {
        const tag = photoTag.dataset.photoTag;
        body.querySelectorAll("[data-photo-tag]").forEach((b) => b.classList.toggle("active", b === photoTag));
        body.querySelectorAll("[data-photo]").forEach((b) => {
          b.hidden = tag !== "all" && !(b.dataset.tags || "").includes(tag);
        });
        return;
      }
      if (e.target.closest("[data-grad-apply]")) {
        state.bg = { ...state.bg, type: "gradient", value: customGradCss() };
        pushHistory();
        save();
        applyBackground();
        return;
      }
      if (e.target.closest("[data-transparent]") || e.target.closest("[data-bg-clear]")) {
        state.bg = { ...state.bg, type: "transparent", value: "" };
        pushHistory();
        save();
        applyBackground();
        renderSheet("bg");
        return;
      }

      const sticker = e.target.closest("[data-sticker]");
      if (sticker) {
        addSticker(sticker.dataset.sticker);
        closeSheets();
        return;
      }

      const logoPos = e.target.closest("[data-logo-pos]");
      if (logoPos) {
        state.logo.pos = logoPos.dataset.logoPos;
        pushHistory();
        save();
        applyLogo();
        renderSheet("gallery");
        return;
      }
      if (e.target.closest("[data-logo-clear]")) {
        state.logo.src = "";
        pushHistory();
        save();
        applyLogo();
        renderSheet("gallery");
        return;
      }

      const layer = e.target.closest("[data-layer-focus]");
      if (layer) {
        focusLayer(layer.dataset.layerFocus);
        closeSheets();
        return;
      }

      const more = e.target.closest("[data-more]");
      if (more) {
        const m = more.dataset.more;
        if (m === "png") exportPng({ transparent: false });
        if (m === "transparent") exportPng({ transparent: true });
        if (m === "share") qsa(".reels-act").find((b) => /Бөлісу|Көшірілді/i.test(b.textContent || ""))?.click();
        if (m === "sticker") qs(".reels-sticker")?.click();
        closeSheets();
      }

      const faceBtn = e.target.closest(".leto-face-row [data-face]");
      if (faceBtn) {
        applyFace(faceBtn.dataset.face);
        renderSheet("style");
        return;
      }

      const styleTextColor = e.target.closest("[data-style-text-color]");
      if (styleTextColor) {
        setNative("text", styleTextColor.dataset.styleTextColor);
        return;
      }
      const styleBgColor = e.target.closest("[data-style-bg-color]");
      if (styleBgColor) {
        setNative("bg", styleBgColor.dataset.styleBgColor);
        renderSheet("style");
        return;
      }
      if (e.target.closest("[data-style-bg-off]")) {
        qs(".text-color-tools .bg-off")?.click();
        renderSheet("style");
        return;
      }
    };

    body.oninput = (e) => {
      if (e.target.matches("[data-font-search]")) {
        fontQuery = e.target.value;
        clearTimeout(body._t);
        body._t = setTimeout(() => renderSheet("fonts"), 120);
      }
      if (e.target.matches("[data-solid-custom]")) {
        state.bg = { ...state.bg, type: "solid", value: e.target.value };
        save();
        applyBackground();
      }
      if (e.target.matches("[data-grad-from], [data-grad-to], [data-grad-angle]")) {
        if (e.target.matches("[data-grad-from]")) state.customGrad.from = e.target.value;
        if (e.target.matches("[data-grad-to]")) state.customGrad.to = e.target.value;
        if (e.target.matches("[data-grad-angle]")) state.customGrad.angle = Number(e.target.value);
        const preview = qs("[data-grad-preview]", body);
        if (preview) preview.style.background = customGradCss();
        state.bg = { ...state.bg, type: "gradient", value: customGradCss() };
        applyBackground();
      }
      if (e.target.matches("[data-logo-size]")) {
        state.logo.size = Number(e.target.value);
        save();
        applyLogo();
      }
      if (e.target.matches("[data-logo-opacity]")) {
        state.logo.opacity = Number(e.target.value);
        save();
        applyLogo();
      }
      if (e.target.matches("[data-style-tracking]")) {
        setNative("tracking", e.target.value);
        const val = qs("[data-style-tracking-val]", body);
        if (val) val.textContent = `${e.target.value}px`;
      }
      if (e.target.matches("[data-style-bg-opacity]")) {
        setNative("bgOpacity", e.target.value);
        const val = qs("[data-style-opacity-val]", body);
        if (val) val.textContent = `${Math.round(Number(e.target.value) * 100)}%`;
      }
      if (e.target.matches("[data-style-bg-radius]")) {
        setNative("radius", e.target.value);
        const val = qs("[data-style-radius-val]", body);
        if (val) val.textContent = `${e.target.value}px`;
      }
    };
    body.onchange = (e) => {
      if (e.target.matches("[data-grad-from], [data-grad-to], [data-grad-angle]")) {
        pushHistory();
        save();
        return;
      }
      if (e.target.matches("[data-bg-upload]")) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          state.bg = { ...state.bg, type: "upload", value: String(reader.result || ""), fit: "cover" };
          pushHistory();
          save();
          applyBackground();
          renderSheet("bg");
        };
        reader.readAsDataURL(file);
      }
      if (e.target.matches("[data-logo-upload]")) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          state.logo.src = String(reader.result || "");
          pushHistory();
          save();
          applyLogo();
          closeSheets();
        };
        reader.readAsDataURL(file);
      }
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function applyPair(name) {
    if (name === "random") {
      qs(".reels-options:not(.reels-colors) button.random")?.click();
      state.lastPair = "random";
    } else {
      const btn = qsa(".reels-options:not(.reels-colors) > button").find((b) => (b.textContent || "").includes(name.split(" × ")[0]));
      btn?.click();
      state.lastPair = name;
    }
    pushHistory();
    save();
  }

  function ensureGoogleFont(family) {
    const fam = String(family || "").replace(/^["']|["']$/g, "").split(",")[0].trim();
    if (!fam) return Promise.resolve();
    const id = `qarip-gf-${fam.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:ital,wght@0,400;0,700;1,400&display=swap`;
      document.head.appendChild(link);
    }
    return document.fonts?.load ? document.fonts.load(`24px "${fam}"`) : Promise.resolve();
  }

  function applyFont(family, name, url) {
    const rec = (FONT_DATA || []).find((f) => f.name === name);
    const src = url || rec?.preview || "";
    const fam = String(family || "").replace(/^["']|["']$/g, "").split(",")[0].trim();
    const paint = () => {
      const item = qsa(".reels-font-item").find((el) => el.dataset.name === name);
      if (item) {
        item.click();
        return;
      }
      const stack = qs(".subtitle-stack");
      const selected =
        stack?.querySelector('[data-selected="1"]') ||
        stack?.querySelector(".sub-hook");
      if (selected) {
        selected.style.setProperty("font-family", `"${fam}"`, "important");
      }
    };
    if (src.startsWith("google:")) {
      ensureGoogleFont(src.slice(7) || fam).then(paint);
      return;
    }
    if (src && !src.startsWith("http")) {
      ensureFontFace(fam, src).then(paint);
      return;
    }
    if (src.startsWith("https://fonts.googleapis.com")) {
      ensureGoogleFont(fam).then(paint);
      return;
    }
    paint();
  }

  function ensureBg(preview) {
    let bg = qs(".stories-bg", preview);
    if (!bg) {
      bg = document.createElement("div");
      bg.className = "stories-bg";
      preview.insertBefore(bg, preview.firstChild);
    }
    return bg;
  }
  function ensureLogo(preview) {
    let logo = qs(".stories-logo", preview);
    if (!logo) {
      logo = document.createElement("img");
      logo.className = "stories-logo";
      logo.alt = "Logo";
      logo.hidden = true;
      preview.append(logo);
    }
    return logo;
  }

  function applyBackground() {
    const preview = qs(".phone-preview");
    if (!preview) return;
    const bg = ensureBg(preview);
    const b = state.bg;
    preview.dataset.bg = b.type;
    bg.style.backgroundPosition = `${b.posX || 50}% ${b.posY || 50}%`;
    bg.style.backgroundSize = b.fit || "cover";
    if (b.type === "solid") {
      bg.style.backgroundImage = "none";
      bg.style.backgroundColor = b.value || "#101014";
    } else if (b.type === "gradient") {
      bg.style.backgroundColor = "transparent";
      bg.style.backgroundImage = b.value;
    } else if (b.type === "photo" || b.type === "upload") {
      bg.style.backgroundColor = "#101014";
      bg.style.backgroundImage = b.value ? `url("${b.value}")` : "none";
    } else {
      bg.style.backgroundColor = "transparent";
      bg.style.backgroundImage = "";
    }
  }

  function applyLogo() {
    const preview = qs(".phone-preview");
    if (!preview) return;
    const logo = ensureLogo(preview);
    const L = state.logo;
    if (!L.src) {
      logo.hidden = true;
      return;
    }
    logo.hidden = false;
    if (logo.getAttribute("src") !== L.src) logo.src = L.src;
    const map = {
      "top-left": [10, 8],
      "top-center": [50, 8],
      "top-right": [90, 8],
      center: [50, 50],
      "bottom-left": [10, 92],
      "bottom-center": [50, 92],
      "bottom-right": [90, 92],
    };
    const [x, y] = map[L.pos] || map["top-right"];
    logo.style.left = `${x}%`;
    logo.style.top = `${y}%`;
    logo.style.transform = `translate(-${x}%, -${y}%)`;
    logo.style.width = `${L.size}%`;
    logo.style.opacity = String((L.opacity || 100) / 100);
  }

  function applyLayout() {
    const stack = qs(".subtitle-stack");
    if (!stack) return;
    const layout = LAYOUTS[state.layout] || LAYOUTS.center;
    const align = state.text.align || "center";
    [
      [".sub-hook", layout.hook],
      [".sub-mark", layout.mark],
      [".sub-extra", layout.extra],
    ].forEach(([sel, top]) => {
      const el = qs(sel, stack);
      if (!el) return;
      el.style.setProperty("top", `${top}%`, "important");
      el.style.setProperty("text-align", align, "important");
      el.style.setProperty("left", align === "left" ? "12%" : align === "right" ? "88%" : "50%", "important");
      el.style.setProperty("max-width", `${state.text.maxWidth || 86}%`, "important");
      el.style.setProperty("letter-spacing", `${state.text.letterSpacing || 0}px`, "important");
      el.style.setProperty("line-height", String((state.text.lineHeight || 100) / 100), "important");
    });
    const scale = (state.text.size || 100) / 100;
    const hook = qs(".sub-hook", stack);
    const mark = qs(".sub-mark", stack);
    if (hook) hook.style.setProperty("font-size", `calc(var(--reel-hook, 34px) * ${scale})`, "important");
    if (mark) mark.style.setProperty("font-size", `calc(var(--reel-mark, 18px) * ${scale})`, "important");
  }

  function addSticker(char) {
    const preview = qs(".phone-preview");
    if (!preview) return;
    const id = `s${Date.now()}`;
    const item = { id, char, x: 50, y: 40 + Math.random() * 20 };
    state.stickers.push(item);
    pushHistory();
    save();
    paintStickers();
  }

  function paintStickers() {
    const preview = qs(".phone-preview");
    if (!preview) return;
    qsa(".leto-sticker", preview).forEach((el) => el.remove());
    state.stickers.forEach((s) => {
      const el = document.createElement("div");
      el.className = "leto-sticker";
      el.dataset.stickerId = s.id;
      el.textContent = s.char;
      el.style.left = `${s.x}%`;
      el.style.top = `${s.y}%`;
      bindStickerDrag(el, s);
      preview.append(el);
    });
  }

  function bindStickerDrag(el, data) {
    let ox = 0;
    let oy = 0;
    let start = null;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const preview = qs(".phone-preview");
      const r = preview.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, sx: data.x, sy: data.y, rw: r.width, rh: r.height };
    });
    el.addEventListener("pointermove", (e) => {
      if (!start) return;
      const dx = ((e.clientX - start.x) / start.rw) * 100;
      const dy = ((e.clientY - start.y) / start.rh) * 100;
      data.x = Math.max(5, Math.min(95, start.sx + dx));
      data.y = Math.max(5, Math.min(95, start.sy + dy));
      el.style.left = `${data.x}%`;
      el.style.top = `${data.y}%`;
    });
    el.addEventListener("pointerup", () => {
      start = null;
      save();
    });
  }

  function focusLayer(id) {
    const stack = qs(".subtitle-stack");
    if (id === "hook" || id === "mark" || id === "extra") {
      const el = qs(`.sub-${id}`, stack);
      el?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      qs(".leto-textbar")?.classList.add("on");
    }
    if (id === "bg") openSheet("bg");
    if (id === "logo") openSheet("gallery");
  }

  async function ensureHtml2Canvas() {
    if (window.html2canvas) return window.html2canvas;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/qarip/vendor/html2canvas.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return window.html2canvas;
  }

  async function exportPng({ transparent = false } = {}) {
    const preview = qs(".phone-preview");
    if (!preview) return;
    const force = transparent || state.bg.type === "transparent";
    preview.classList.add("exporting");
    if (force) {
      preview.dataset.bg = "transparent";
      const bg = qs(".stories-bg", preview);
      if (bg) {
        bg.style.opacity = "0";
        bg.style.background = "transparent";
      }
      preview.style.background = "transparent";
    }
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const html2canvas = await ensureHtml2Canvas();
      const canvas = await html2canvas(preview, { scale: 3, useCORS: true, backgroundColor: null, logging: false });
      const a = document.createElement("a");
      a.download = force ? "qarip-story-transparent.png" : "qarip-story.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (err) {
      console.warn(err);
      qsa(".reels-act").find((b) => /9:16|PNG/i.test(b.textContent || ""))?.click();
    } finally {
      preview.classList.remove("exporting");
      applyBackground();
    }
  }

  function applyAll() {
    applyBackground();
    applyLogo();
    applyLayout();
    paintStickers();
  }

  let quickMode = false;

  function letoToast(msg) {
    let el = qs(".leto-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "leto-toast";
      document.body.append(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function watchNativeToast(cb) {
    const read = () => {
      const el = qs(".reels-sticker-toast");
      if (el && el.dataset.show === "1") {
        cb(el.textContent || "");
        return true;
      }
      return false;
    };
    if (read()) return;
    const obs = new MutationObserver(() => {
      if (read()) obs.disconnect();
    });
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-show"], childList: true });
    setTimeout(() => obs.disconnect(), 4000);
  }

  function copyStickerNative() {
    const btn = qs(".reels-sticker");
    if (!btn) return;
    btn.click();
    watchNativeToast((msg) => letoToast(msg || "Көшірілді."));
  }

  function updateExportButtonForMode() {
    const btn = qs(".leto-export");
    if (!btn) return;
    if (quickMode) {
      btn.textContent = "⧉";
      btn.setAttribute("aria-label", "Стикер етіп көшіру");
      btn.classList.add("is-sticker");
    } else {
      btn.textContent = "↑";
      btn.setAttribute("aria-label", "Экспорт");
      btn.classList.remove("is-sticker");
    }
  }

  function renderChoiceHome() {
    return `
      <button type="button" class="leto-choice-back" data-choice-back aria-label="Артқа">←</button>
      <div class="leto-choice-head">
        <p class="leto-choice-eyebrow">QARIP STORIES</p>
        <h1>Не істейміз?</h1>
        <p class="leto-choice-sub">Толық фонымен дайын сурет жасайсың ба, әлде тек мәтін стикерін көшіріп аласың ба?</p>
      </div>
      <div class="leto-choice-cards">
        <button type="button" class="leto-choice-card" data-choice="editor">
          <span class="cc-ico">🎨</span>
          <span class="cc-body">
            <b>Stories жасап көру</b>
            <small>Мәтін, қаріп, фон, лого қосып, дайын 9:16 сурет жасаңыз</small>
          </span>
          <span class="cc-arrow">→</span>
        </button>
        <button type="button" class="leto-choice-card" data-choice="sticker">
          <span class="cc-ico">🏷️</span>
          <span class="cc-body">
            <b>Мәтін стикерін жасау</b>
            <small>Қаріп таңда, мәтінді жаз, өлшемін реттеп PNG стикер ретінде көшіріп ал</small>
          </span>
          <span class="cc-arrow">→</span>
        </button>
      </div>
    `;
  }

  function ensureChoice() {
    let choice = qs(".leto-choice");
    if (choice) {
      markLetoReady();
      return choice;
    }
    choice = document.createElement("div");
    choice.className = "leto-choice";
    document.body.append(choice);
    choice.innerHTML = renderChoiceHome();
    markLetoReady();
    choice.addEventListener("click", (e) => {
      if (e.target.closest("[data-choice-back]")) {
        location.href = "/qarip/";
        return;
      }
      const editorBtn = e.target.closest('[data-choice="editor"]');
      if (editorBtn) {
        quickMode = false;
        updateExportButtonForMode();
        choice.classList.add("done");
        return;
      }
      const stickerBtn = e.target.closest('[data-choice="sticker"]');
      if (stickerBtn) {
        quickMode = true;
        updateExportButtonForMode();
        choice.classList.add("done");
        openSheet("fonts");
        letoToast("Қаріп таңда, мәтінді жаз да, жоғарғы батырмамен стикер етіп көшір.");
        return;
      }
    });
    return choice;
  }

  function markLetoReady() {
    document.documentElement.classList.add("leto-ready");
  }

  function syncLegacyPairButtons() {
    const rewrites = [
      {
        needle: "Unbounded",
        html: '<span>07</span><b><i style="font-family:&quot;Forum&quot;, serif">Forum</i> × <em style="font-family:&quot;Oswald&quot;, sans-serif;font-weight:700">Oswald</em></b>',
      },
      {
        needle: "Russo",
        html: '<span>06</span><b><i style="font-family:&quot;Rubik&quot;, sans-serif;font-weight:700">Rubik</i> × <em style="font-family:&quot;Inter&quot;, sans-serif;font-weight:800">Inter</em></b>',
      },
    ];
    qsa(".reels-options:not(.reels-colors) > button").forEach((btn) => {
      const text = btn.textContent || "";
      const hit = rewrites.find((r) => text.includes(r.needle));
      if (hit) btn.innerHTML = hit.html;
    });
  }

  function boot() {
    syncLegacyPairButtons();
    ensureStyleLink();
    const nodes = ensureShell();
    if (!nodes?.preview) return;
    ensureBg(nodes.preview);
    ensureLogo(nodes.preview);
    applyAll();
    if (!history.length) pushHistory();
    ensureChoice();
    markLetoReady();
    loadFontData().then(() => {
      if (activeSheet === "fonts") renderSheet("fonts");
    });

    if (nodes.preview.dataset.letoObs !== "1") {
      nodes.preview.dataset.letoObs = "1";
      let t = 0;
      new MutationObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => {
          ensureBg(nodes.preview);
          ensureLogo(nodes.preview);
          applyBackground();
          applyLogo();
          applyLayout();
          paintStickers();
        }, 50);
      }).observe(nodes.preview, { childList: true, subtree: true });
    }
  }

  // Defense-in-depth: physically remove legacy homepage chrome from the DOM (not just
  // hide it) so it can never flash on screen, even for a frame, regardless of CSS timing.
  // Runs immediately and re-applies on every DOM change.
  const LEGACY_HIDE_SELECTORS = [
    ".intro",
    "#tester",
    "#about",
    ".qarip-landing",
    ".stories-promo",
    ".topbar",
    ".stories-page-hero",
    "footer",
    ".reels-copy",
  ];
  function hideLegacyChrome() {
    LEGACY_HIDE_SELECTORS.forEach((sel) => {
      qsa(sel).forEach((el) => {
        // Fully remove purely decorative legacy nodes instead of just hiding them —
        // guarantees they can never flash on screen, on any device/network speed.
        el.remove();
      });
    });
    // #catalog is only hidden, not removed — legacy font-list fallback still reads its cards.
    const catalog = qs("#catalog");
    if (catalog && catalog.style.display !== "none") catalog.style.setProperty("display", "none", "important");
  }

  function start() {
    hideLegacyChrome();
    let n = 0;
    const tick = () => {
      hideLegacyChrome();
      if (qs(".phone-preview") && qs(".reels-controls")) {
        boot();
        return;
      }
      if (++n < 90) requestAnimationFrame(tick);
    };
    tick();
    if (!start.observed) {
      start.observed = true;
      let hideT = 0;
      new MutationObserver(() => {
        clearTimeout(hideT);
        hideT = setTimeout(hideLegacyChrome, 60);
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  ensureStyleLink();
  hideLegacyChrome();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  window.addEventListener("load", () => setTimeout(start, 100));
})();
