(() => {
  const KZ_PAIRS = [
    ["Ә", "ә"],
    ["Ғ", "ғ"],
    ["Қ", "қ"],
    ["Ң", "ң"],
    ["Ө", "ө"],
    ["Ұ", "ұ"],
    ["Ү", "ү"],
    ["Һ", "һ"],
    ["І", "і"],
  ];
  const KZ_GLYPHS = KZ_PAIRS.flat();
  const PREVIEW_TEXT =
    "Қазақ тілі — ғажап тіл. Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І";
  const GENERIC_AUTHORS = new Set([
    "жеке жинақ",
    "жеке жинақ · архив",
    "жеке жинак",
    "жеке жинақ. архив",
  ]);
  const LICENSE = {
    open: {
      key: "open",
      badge: "Open Source",
      title: "Ашық лицензия. Жеке және коммерциялық жобаларда қолдануға болады.",
      warn: false,
    },
    commercial: {
      key: "commercial",
      badge: "Commercial use",
      title: "Коммерциялық қолдануға рұқсат етілген.",
      warn: false,
    },
    personal: {
      key: "personal",
      badge: "Personal use",
      title: "Жеке қолдануға арналған. Коммерциялық жобада қолданбас бұрын лицензиясын тексеріңіз.",
      warn: true,
    },
    check: {
      key: "check",
      badge: "Лицензияны тексеріңіз",
      title: "Лицензия туралы толық ақпарат расталмаған. Коммерциялық қолданбас бұрын құқық иесінің шарттарын тексеріңіз.",
      warn: true,
    },
  };

  function cleanText(value) {
    if (value == null) return "";
    if (typeof value === "number" && !Number.isFinite(value)) return "";
    const text = String(value).trim();
    if (!text) return "";
    if (/^(nan|undefined|null)$/i.test(text)) return "";
    return text;
  }

  function displayAuthor(maker) {
    const text = cleanText(maker);
    if (!text) return "";
    if (GENERIC_AUTHORS.has(text.toLowerCase())) return "";
    return text.replace(/\s*·\s*архив$/i, "").trim();
  }

  function licenseInfo(key) {
    return LICENSE[key] || LICENSE.check;
  }

  function glyphInk(ctx, fam, ch) {
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = "#000";
    ctx.font = `72px ${fam}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(ch, 48, 52);
    const data = ctx.getImageData(0, 0, 96, 96).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 12) n += 1;
    return n;
  }

  function kazakhGlyphReport(family) {
    const fontFamily = cleanText(family).replace(/^["']|["']$/g, "");
    if (!fontFamily) {
      return { status: "none", missing: KZ_GLYPHS.slice(), loaded: false };
    }
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return { status: "none", missing: KZ_GLYPHS.slice(), loaded: false };
    }
    const stack = `"${fontFamily}"`;
    const notdef = Math.max(glyphInk(ctx, stack, "\uFFFD"), glyphInk(ctx, stack, "\uFFFF"), glyphInk(ctx, stack, "\uFFFE"));
    const missing = [];
    KZ_GLYPHS.forEach((ch) => {
      const a = glyphInk(ctx, stack, ch);
      if (a < 10) missing.push(ch);
      else if (notdef >= 10 && Math.abs(a - notdef) <= 8) missing.push(ch);
    });
    if (missing.length === 0) return { status: "full", missing, loaded: true };
    if (missing.length >= KZ_GLYPHS.length) return { status: "none", missing, loaded: true };
    return { status: "some", missing, loaded: true };
  }

  function glyphLabel(report) {
    if (!report || report.status === "wait") return "";
    if (report.status === "full") return "Толық қолдау";
    if (report.status === "none") return "Қолдау жоқ";
    const miss = (report.missing || []).join(" ");
    return miss ? `Жартылай қолдау · жоқ ${miss}` : "Жартылай қолдау";
  }

  function savedNames() {
    try {
      const raw = JSON.parse(localStorage.getItem("qarip-favorites") || "[]");
      return new Set((Array.isArray(raw) ? raw : []).map(cleanText).filter(Boolean));
    } catch {
      return new Set();
    }
  }

  function toggleFavorite(name) {
    const next = savedNames();
    const key = cleanText(name);
    if (!key) return next;
    if (next.has(key)) next.delete(key);
    else next.add(key);
    localStorage.setItem("qarip-favorites", JSON.stringify([...next]));
    return next;
  }

  const loadedFamilies = new Set();

  function googleCssUrl(family) {
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,400;0,700;1,400&display=swap`;
  }

  function ensureGoogleCss(family) {
    const fam = cleanText(family).replace(/^["']|["']$/g, "");
    if (!fam) return;
    const id = `qarip-gf-${fam.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = googleCssUrl(fam);
    document.head.appendChild(link);
  }

  async function loadFamily(family, url) {
    const fam = cleanText(family).replace(/^["']|["']$/g, "");
    let src = cleanText(url);
    if (!fam) return false;
    if (src.startsWith("google:")) {
      src = src.slice(7) || fam;
      ensureGoogleCss(src);
      try {
        await document.fonts.load(`72px "${fam}"`);
        await document.fonts.ready;
      } catch {}
      loadedFamilies.add(fam);
      return true;
    }
    if (!src) return false;
    if (loadedFamilies.has(fam)) return true;
    if ([...document.fonts].some((face) => face.family === fam)) {
      loadedFamilies.add(fam);
      return true;
    }
    try {
      const face = new FontFace(fam, `url("${src}")`);
      await face.load();
      document.fonts.add(face);
      loadedFamilies.add(fam);
      return true;
    } catch {
      return false;
    }
  }

  function ensureModal() {
    let modal = document.querySelector(".qarip-license-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "qarip-license-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="qarip-license-dialog" role="dialog" aria-modal="true" aria-labelledby="qarip-dl-title">
        <h2 id="qarip-dl-title">Қаріпті жүктеу</h2>
        <p>Бұл қаріптің лицензия шарттары толық расталмаған.</p>
        <p>Коммерциялық жобаға қолданбас бұрын автордың немесе құқық иесінің лицензия шарттарын тексеруді ұсынамыз.</p>
        <div class="qarip-license-actions">
          <button type="button" class="qarip-dl-go">Жүктеу</button>
          <a class="qarip-dl-info" href="/qarip/#about">Лицензия туралы ақпарат</a>
        </div>
        <button type="button" class="qarip-dl-close" aria-label="Жабу">×</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) hideModal();
    });
    modal.querySelector(".qarip-dl-close").addEventListener("click", hideModal);
    modal.querySelector(".qarip-dl-go").addEventListener("click", () => {
      const href = modal.dataset.href;
      const filename = modal.dataset.filename || "";
      hideModal();
      if (href) startDownload(href, filename);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) hideModal();
    });
    return modal;
  }

  function hideModal() {
    const modal = document.querySelector(".qarip-license-modal");
    if (modal) modal.hidden = true;
  }

  function startDownload(href, filename) {
    const link = document.createElement("a");
    link.href = href;
    if (filename) link.download = filename;
    else link.setAttribute("download", "");
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function showDownloadWarning(href, filename) {
    const modal = ensureModal();
    modal.dataset.href = href;
    modal.dataset.filename = filename || "";
    modal.hidden = false;
    modal.querySelector(".qarip-dl-go")?.focus();
  }

  function handleDownloadClick(event, licenseKey, href, filename) {
    const info = licenseInfo(licenseKey);
    if (!info.warn) return false;
    event.preventDefault();
    event.stopPropagation();
    showDownloadWarning(href, filename);
    return true;
  }

  window.Qarip = {
    KZ_GLYPHS,
    PREVIEW_TEXT,
    LICENSE,
    cleanText,
    displayAuthor,
    licenseInfo,
    kazakhGlyphReport,
    glyphLabel,
    googleCssUrl,
    ensureGoogleCss,
    savedNames,
    toggleFavorite,
    loadFamily,
    startDownload,
    showDownloadWarning,
    handleDownloadClick,
    ensureModal,
  };
})();
