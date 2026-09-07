(() => {
  const HOME_TITLE = "Qarip — қазақша Stories және қаріптер";
  const HOME_DESC =
    "Қазақша Stories үшін дайын мәтін стильдерін жасаңыз және қазақ әріптерін қолдайтын қаріптерді онлайн тексеріп, жүктеңіз.";
  const STORIES_TITLE = "Қазақша Stories редакторы | Qarip";
  const STORIES_DESC =
    "Қазақша Stories үшін мәтін, қаріп, фон және логотиппен дайын 9:16 PNG жасаңыз.";
  const DISCLAIMER =
    "Qarip қаріптердің қазақ әліпбиін қолдауын тексеруге және оларды табуды жеңілдетуге арналған. Қаріптердің авторлық құқықтары тиісті құқық иелеріне тиесілі. Коммерциялық қолданар алдында әр қаріптің лицензия шарттарын тексеріңіз.";

  const STYLE_PREVIEWS = [
    {
      title: "Create",
      sub: "Идеяңды бүгін баста",
      name: "Create",
      bg: "#efe8dc",
      photo: "/qarip/assets/story-cards/create.jpg",
    },
    {
      title: "Good Days",
      sub: "Жақсы күндер алда",
      name: "Good Days",
      bg: "#f4ebe8",
      photo: "/qarip/assets/story-cards/good-days.jpg",
    },
    {
      title: "Dream Big",
      sub: "Арманнан қорықпа",
      name: "Dream Big",
      bg: "#3a4550",
      photo: "/qarip/assets/story-cards/dream-big.jpg",
    },
    {
      title: "City Girl",
      sub: "Кішкентай сәттерден шабыт тап",
      name: "City Girl",
      bg: "#e8e4dc",
      photo: "/qarip/assets/story-cards/city-girl.jpg",
    },
    {
      title: "Coffee Time",
      sub: "Кофе, тыныштық, жаңа ойлар",
      name: "Coffee Time",
      bg: "#f0ebe3",
      photo: "/qarip/assets/story-cards/coffee-time.jpg",
    },
    {
      title: "Travel Mood",
      sub: "Жаңа жерлер, жаңа сезімдер",
      name: "Travel Mood",
      bg: "#dbe8f0",
      photo: "/qarip/assets/story-cards/travel-mood.jpg",
    },
    {
      title: "Soft Life",
      sub: "Әдемілік тыныштықта",
      name: "Soft Life",
      bg: "#f2ebe4",
      photo: "/qarip/assets/story-cards/soft-life.jpg",
    },
    {
      title: "Slow Morning",
      sub: "Бүгін өзіңе уақыт бер",
      name: "Slow Morning",
      bg: "#efe8dc",
      photo: "/qarip/assets/story-cards/slow-morning.jpg",
    },
    {
      title: "Glow",
      sub: "Өзіңе арналған әдемі сәттер",
      name: "Glow",
      bg: "#f5efe6",
      photo: "/qarip/assets/story-cards/glow.jpg",
    },
    {
      title: "Weekend",
      sub: "Кішкентай демалыс — үлкен қуат",
      name: "Weekend",
      bg: "#e8efe0",
      photo: "/qarip/assets/story-cards/weekend.jpg",
    },
  ];

  const READY = "v2f";
  let timer = 0;

  function isStoriesPage() {
    return /\/qarip\/stories\/?$/.test(location.pathname);
  }

  function isLegacyReelsPage() {
    return /\/qarip\/reels\/?$/.test(location.pathname);
  }

  function redirectLegacy() {
    if (isLegacyReelsPage()) {
      location.replace("/qarip/stories/");
      return true;
    }
    if (!isStoriesPage() && location.hash === "#reels") {
      location.replace("/qarip/stories/");
      return true;
    }
    return false;
  }

  function markPage() {
    document.documentElement.classList.toggle("qarip-stories", isStoriesPage());
    document.documentElement.classList.toggle("qarip-home", !isStoriesPage());
    document.documentElement.classList.add("qarip-v2");
  }

  function fontCount() {
    const count = document.querySelector(".workspace-heading .count");
    const match = count?.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) return match[2];
    const cards = document.querySelectorAll(".font-grid > .font-card").length;
    return cards ? String(cards) : "";
  }

  function storyHTML(item, extraClass = "") {
    const photo = item.photo ? `background-image:url('${item.photo}')` : "";
    const label = `${item.title} — ${item.sub}`;
    return `<a class="qarip-story qarip-story-life ${extraClass}" href="/qarip/stories/" style="--story-bg:${item.bg};${photo}" aria-label="${label}" title="${label}"></a>`;
  }

  function polishNav() {
    document.querySelectorAll(".topbar nav a").forEach((link) => {
      const label = (link.textContent || "").replace(/\s+/g, " ").trim();
      const href = link.getAttribute("href") || "";
      if (label === "Reels" || label === "Reels беті" || href === "#reels" || /\/qarip\/reels\/?$/.test(href)) {
        link.textContent = "Stories";
        link.setAttribute("href", "/qarip/stories/");
        return;
      }
      if (label === "Қаріптер") {
        link.setAttribute("href", isStoriesPage() ? "/qarip/#catalog" : "#catalog");
        return;
      }
      if (label === "Онлайн тексеру") {
        link.setAttribute("href", isStoriesPage() ? "/qarip/#tester" : "#tester");
        return;
      }
      if (label === "Жоба туралы") {
        link.setAttribute("href", isStoriesPage() ? "/qarip/#about" : "#about");
      }
    });
    const brand = document.querySelector(".topbar .brand");
    if (brand) brand.setAttribute("href", isStoriesPage() ? "/qarip/" : "#top");

    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    let actions = topbar.querySelector(".qarip-nav-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "qarip-nav-actions";
      topbar.append(actions);
    }

    if (!actions.querySelector(".qarip-nav-search")) {
      const search = document.createElement("a");
      search.className = "qarip-nav-search";
      search.href = isStoriesPage() ? "/qarip/#catalog" : "#catalog";
      search.setAttribute("aria-label", "Қаріптерді іздеу");
      search.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
      actions.append(search);
    } else {
      actions.querySelector(".qarip-nav-search").href = isStoriesPage() ? "/qarip/#catalog" : "#catalog";
    }

    if (!actions.querySelector(".qarip-nav-start")) {
      const start = document.createElement("a");
      start.className = "qarip-nav-start";
      start.href = "/qarip/stories/";
      start.textContent = "Бастау →";
      actions.append(start);
    }

    if (!actions.querySelector(".qarip-nav-toggle")) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "qarip-nav-toggle";
      toggle.setAttribute("aria-label", "Мәзір");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = `<span></span><span></span><span></span>`;
      toggle.addEventListener("click", () => {
        const open = document.documentElement.classList.toggle("qarip-nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      actions.append(toggle);
    }

    if (topbar.dataset.v2Nav !== "1") {
      topbar.dataset.v2Nav = "1";
      topbar.querySelector("nav")?.addEventListener("click", (event) => {
        if (!(event.target instanceof Element) || !event.target.closest("a")) return;
        document.documentElement.classList.remove("qarip-nav-open");
        actions.querySelector(".qarip-nav-toggle")?.setAttribute("aria-expanded", "false");
      });
    }
  }

  function setMeta(title, desc, canonical) {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.append(tag);
    }
    tag.setAttribute("content", desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", desc);
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.append(canon);
    }
    canon.href = canonical;
  }

  function polishHomeHero() {
    if (isStoriesPage()) return;
    const intro = document.querySelector(".intro");
    if (!intro) return;
    intro.classList.add("qarip-hero");

    let copy = intro.querySelector(".qarip-hero-copy");
    if (!copy) {
      copy = document.createElement("div");
      copy.className = "qarip-hero-copy";
      intro.prepend(copy);
    }
    [...intro.children].forEach((child) => {
      if (child === copy || child.classList.contains("alphabet") || child.classList.contains("qarip-hero-visual")) return;
      copy.append(child);
    });

    const eyebrow = copy.querySelector(".eyebrow");
    if (eyebrow) {
      eyebrow.replaceChildren();
      eyebrow.classList.add("qarip-hero-label");
      eyebrow.textContent = "ҚАЗАҚША STORIES ҚҰРАЛЫ ✨";
    }

    const h1 = copy.querySelector("h1");
    if (h1) {
      h1.innerHTML = `Қазақша Stories-ты<br><span class="qarip-accent">әдемі</span> жасаңыз`;
    }

    let desc = copy.querySelector(".qarip-hero-desc");
    if (!desc) {
      desc = copy.querySelector(":scope > p:not(.qarip-hero-glyphs)");
      if (desc) desc.className = "qarip-hero-desc";
    }
    if (desc) {
      desc.textContent =
        "Қазақ әріптерін толық қолдайтын дайын стильдер. Мәтін жазып, 9:16 PNG алыңыз.";
    }

    const row = copy.querySelector(".intro-cta-row");
    if (row) {
      row.innerHTML = `
        <a class="intro-cta qarip-cta-primary" href="/qarip/stories/">Stories жасап көру →</a>
        <a class="qarip-cta-secondary" href="#catalog"><i class="qarip-grid-ico" aria-hidden="true"></i>Қаріптерді көру</a>
      `;
    }

    copy.querySelector(".qarip-trust")?.remove();

    let glyphs = copy.querySelector(".qarip-hero-glyphs");
    if (!glyphs) {
      glyphs = document.createElement("p");
      glyphs.className = "qarip-hero-glyphs";
      glyphs.lang = "kk";
      row?.after(glyphs);
    }
    glyphs.textContent = "Ә Ғ Қ Ң Ө Ұ Ү Һ І";

    let features = copy.querySelector(".qarip-features");
    if (!features) {
      features = document.createElement("ul");
      features.className = "qarip-features";
      glyphs.after(features);
    }
    features.innerHTML = `
      <li><i class="qarip-ico qarip-ico-bolt" aria-hidden="true"></i><span>Тез және оңай</span></li>
      <li><i class="qarip-ico qarip-ico-heart" aria-hidden="true"></i><span>Қазақша қаріптер</span></li>
      <li><i class="qarip-ico qarip-ico-frame" aria-hidden="true"></i><span>Жоғары сапалы PNG</span></li>
    `;

    intro.querySelector(".alphabet")?.setAttribute("hidden", "");

    let visual = intro.querySelector(".qarip-hero-visual");
    if (!visual) {
      visual = document.createElement("div");
      visual.className = "qarip-hero-visual";
      intro.append(visual);
    }
    const heroItems = [STYLE_PREVIEWS[0], STYLE_PREVIEWS[1], STYLE_PREVIEWS[2]];
    visual.innerHTML = `
      <div class="qarip-hero-stack" aria-hidden="true">
        ${storyHTML(heroItems[1], "qarip-story-side qarip-story-left")}
        ${storyHTML(heroItems[0], "qarip-story-main")}
        ${storyHTML(heroItems[2], "qarip-story-side qarip-story-right")}
        <p class="qarip-hero-note qarip-hero-note-top">Дайын stories бірнеше минутта!</p>
        <p class="qarip-hero-note qarip-hero-note-bottom">Stories-қа дайын 9:16 PNG</p>
      </div>
      <div class="qarip-hero-mobile-story">
        ${storyHTML(heroItems[0], "qarip-story-main")}
      </div>
    `;
  }

  function ensureLanding() {
    if (isStoriesPage()) {
      document.querySelector(".qarip-landing")?.remove();
      document.querySelector(".stories-promo")?.remove();
      return;
    }
    document.querySelector(".stories-promo")?.remove();
    const intro = document.querySelector(".intro");
    const catalog = document.getElementById("catalog");
    if (!intro || !catalog) return;
    let landing = document.querySelector(".qarip-landing");
    if (!landing) {
      landing = document.createElement("div");
      landing.className = "qarip-landing";
    }
    if (landing.dataset.ready === READY && landing.querySelector("#qarip-how-title")) {
      if (landing.previousElementSibling !== intro) intro.after(landing);
      if (catalog.previousElementSibling !== landing) landing.after(catalog);
      return;
    }

    const n = fontCount();
    landing.innerHTML = `
      <section class="qarip-how" aria-labelledby="qarip-how-title">
        <div class="qarip-section-head qarip-how-head">
          <h2 id="qarip-how-title">3 қадамда дайын Stories</h2>
          <p class="qarip-how-note">Әркім жасай алады! ♡</p>
        </div>
        <ol class="qarip-steps">
          <li class="qarip-step">
            <span class="qarip-step-ico qarip-step-ico-1" aria-hidden="true"></span>
            <strong>1. Мәтінді жазыңыз</strong>
            <p>Қазақша мәтінді бірден енгізіңіз</p>
          </li>
          <li class="qarip-step-arrow" aria-hidden="true">→</li>
          <li class="qarip-step">
            <span class="qarip-step-ico qarip-step-ico-2" aria-hidden="true"></span>
            <strong>2. Стиль таңдаңыз</strong>
            <p>Дайын қаріп комбинациясын таңдаңыз</p>
          </li>
          <li class="qarip-step-arrow" aria-hidden="true">→</li>
          <li class="qarip-step">
            <span class="qarip-step-ico qarip-step-ico-3" aria-hidden="true"></span>
            <strong>3. PNG жүктеп алыңыз</strong>
            <p>9:16 дайын Stories алыңыз</p>
          </li>
        </ol>
      </section>

      <section class="qarip-styles" aria-labelledby="qarip-styles-title">
        <div class="qarip-styles-head">
          <div>
            <h2 id="qarip-styles-title">Дайын стильдер</h2>
            <p class="qarip-styles-sub">Оңай, жылдам, әдемі. Дайын стильдерді қолданып көріңіз.</p>
          </div>
          <a class="qarip-styles-cta" href="/qarip/stories/">Барлығын көру →</a>
        </div>
        <div class="qarip-style-rail">
          ${STYLE_PREVIEWS.map((item, i) => storyHTML(item, `qarip-style-card qarip-style-${i}`)).join("")}
        </div>
      </section>

      <section class="qarip-toolcta" aria-labelledby="qarip-toolcta-title">
        <div class="qarip-toolcta-copy">
          <h2 id="qarip-toolcta-title">Өз идеяларыңызды әдемі етіңіз</h2>
          <p>Қазақша мәтінді жазып, дайын 9:16 PNG алыңыз.${n ? ` ${n} қаріп қолжетімді.` : ""}</p>
        </div>
        <a class="qarip-cta-primary" href="/qarip/stories/">Stories жасап көру →</a>
      </section>
      <div id="pricing-slot" hidden></div>
    `;
    intro.after(landing);
    landing.after(catalog);
    landing.dataset.ready = READY;
  }

  function polishCatalog() {
    if (isStoriesPage()) return;
    const heading = document.querySelector(".workspace-heading h2");
    if (heading) heading.textContent = "Қазақша қаріптер каталогы";
    const wrap = document.querySelector(".workspace-heading > div");
    if (wrap && !wrap.querySelector(".qarip-catalog-lead")) {
      const lead = document.createElement("p");
      lead.className = "qarip-catalog-lead";
      lead.textContent =
        "Қазақ әріптерін қолдайтын қаріптерді тексеріп, өз мәтініңізбен көріп және жүктеп алыңыз.";
      wrap.append(lead);
    }
  }

  function polishGeneratorCopy() {
    const copy = document.querySelector(".reels-copy .section-number");
    if (copy) copy.textContent = "STORIES / 2026";
    const title = document.querySelector(".reels-copy h2");
    if (title && /Субтитр|Reels|REELS/i.test(title.textContent || "")) {
      title.innerHTML = "Stories<br><em>мәтін стильдері</em>";
    }
    document.querySelectorAll(".reel-ui span").forEach((el) => {
      if ((el.textContent || "").trim() === "REELS") el.textContent = "STORIES";
    });
  }

  function ensureStoriesHero() {
    if (!isStoriesPage()) {
      document.querySelector(".stories-page-hero")?.remove();
      return;
    }
    const reels = document.getElementById("reels");
    if (!reels) return;
    let hero = document.querySelector(".stories-page-hero");
    if (!hero) {
      hero = document.createElement("header");
      hero.className = "stories-page-hero";
      reels.parentNode.insertBefore(hero, reels);
    }
    hero.innerHTML = `
      <p class="stories-page-eyebrow">QARIP STORIES</p>
      <h1>Қазақша Stories редакторы</h1>
      <p>Мәтін, қаріп, фон және логотиппен дайын 9:16 Stories жасап, PNG жүктеп алыңыз.</p>
    `;
    setMeta(STORIES_TITLE, STORIES_DESC, "https://aqsuek.kz/qarip/stories/");
  }

  function ensureStoriesEditorAssets() {
    if (!isStoriesPage()) return;
    if (!document.querySelector('link[data-stories-editor-css]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/qarip/stories-editor.css?v=leto14";
      link.dataset.storiesEditorCss = "1";
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-stories-editor]')) {
      const script = document.createElement("script");
      script.src = "/qarip/stories-editor.js?v=leto14";
      script.defer = true;
      script.dataset.storiesEditor = "1";
      document.body.appendChild(script);
    }
  }

  function polishAboutFooter() {
    const aboutH = document.querySelector("#about h2");
    if (aboutH) aboutH.textContent = "Жоба туралы";
    const aboutP = document.querySelector("#about p");
    if (aboutP) aboutP.textContent = DISCLAIMER;
    const footerP = document.querySelector("footer p");
    if (footerP) footerP.textContent = DISCLAIMER;
    const footer = document.querySelector("footer");
    if (!footer) return;
    if (!footer.querySelector(".qarip-footer-nav")) {
      const nav = document.createElement("nav");
      nav.className = "qarip-footer-nav";
      nav.setAttribute("aria-label", "Төменгі мәзір");
      nav.innerHTML = `
        <a href="${isStoriesPage() ? "/qarip/#catalog" : "#catalog"}">Қаріптер</a>
        <a href="/qarip/stories/">Stories</a>
        <a href="${isStoriesPage() ? "/qarip/#about" : "#about"}">Жоба туралы</a>
      `;
      footerP?.after(nav);
    }
    let slogan = footer.querySelector(".qarip-footer-slogan");
    if (!slogan) {
      slogan = document.createElement("p");
      slogan.className = "qarip-footer-slogan";
      footer.append(slogan);
    }
    slogan.textContent = "Жақсы Stories — жарқын күндерге! ♡";
  }

  function apply() {
    if (redirectLegacy()) return;
    markPage();
    polishNav();
    if (isStoriesPage()) {
      polishGeneratorCopy();
      ensureStoriesHero();
      ensureStoriesEditorAssets();
    } else {
      polishHomeHero();
      ensureLanding();
      polishCatalog();
      setMeta(HOME_TITLE, HOME_DESC, "https://aqsuek.kz/qarip/");
    }
    polishAboutFooter();
  }

  function watch() {
    apply();
    const topbar = document.querySelector(".topbar");
    if (topbar) {
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(apply, 40);
      }).observe(topbar, { childList: true, subtree: true });
    }
    if (isStoriesPage()) {
      new MutationObserver(() => {
        if (document.title !== STORIES_TITLE) document.title = STORIES_TITLE;
      }).observe(document.head, { childList: true, subtree: true });
    }
    const main = document.querySelector("main");
    if (main) {
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(apply, 40);
      }).observe(main, { childList: true });
    }
  }

  window.QaripSite = { isStoriesPage, apply, fontCount };

  if (redirectLegacy()) return;
  markPage();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();
  window.addEventListener("load", () => setTimeout(apply, 80));
})();
