(() => {
  const STORE = "qarip-reels-layers";
  const COLORS = ["#ffffff", "#d9ff47", "#ff2d7b", "#64b5ff", "#ff9f1c", "#171715"];
  const LAYERS = [
    ["hook", ".sub-hook", "Акцент"],
    ["mark", ".sub-mark", "Қосымша"],
    ["extra", ".sub-extra", "Жаңа мәтін"],
  ];

  const css = `
    .reels-pick{
      position:relative;overflow:visible;
      background:radial-gradient(circle at 12% 20%,#253d9b55 0,transparent 28%),radial-gradient(circle at 92% 82%,#d9ff4730 0,transparent 23%),#151513;
      overscroll-behavior:contain;
    }
    .reels-pick:before{content:"";position:absolute;inset:20px;border:1px solid #ffffff12;pointer-events:none}
    .reels-copy{position:relative;z-index:1;text-align:center}
    .reels-copy h2{letter-spacing:-.055em;line-height:.88}
    .reels-copy h2:after{display:none}
    .phone-preview{
      position:relative;
      width:min(360px,86vw)!important;
      max-width:100%;
      aspect-ratio:9/16!important;
      height:auto!important;
      border:1px solid #ffffff22!important;
      border-radius:24px!important;
      background:#101014!important;
      box-shadow:0 18px 40px #0006;
      overflow:hidden!important;
      touch-action:none;
      overscroll-behavior:none;
    }
    .phone-preview:before,.phone-preview:after{display:none!important}
    .reel-ui,.reel-progress,.reel-orbit,.font-chip{display:none!important}
    .subtitle-stack{z-index:4!important;inset:0!important;width:auto!important;height:auto!important;overflow:hidden!important;transform:none!important;text-align:center!important;text-shadow:0 4px 18px #000!important;pointer-events:none}
    .subtitle-stack .sub-hook,.subtitle-stack .sub-mark,.subtitle-stack .sub-extra{position:absolute;left:50%;display:inline-block!important;box-sizing:border-box!important;text-align:center;max-width:calc(100% - 28px);margin:0!important;overflow-wrap:anywhere;word-break:break-word;white-space:normal!important;touch-action:none;user-select:none;cursor:grab;pointer-events:auto}
    .subtitle-stack .sub-hook{top:38%;letter-spacing:-.045em;text-transform:none!important;line-height:.92!important;transform:translate(calc(-50% + var(--hook-x,0px)),calc(-50% + var(--hook-y,0px))) rotate(var(--hook-rotate,0deg)) scale(var(--hook-scale,1))}
    .subtitle-stack .sub-mark{top:58%;padding:8px 16px!important;border-radius:999px!important;box-shadow:0 7px 18px #0005;transform:translate(calc(-50% + var(--mark-x,0px)),calc(-50% + var(--mark-y,0px))) rotate(var(--mark-rotate,0deg)) scale(var(--mark-scale,1))}
    .subtitle-stack .sub-extra{top:74%;color:#fff;font:700 18px/1.1 Arial,sans-serif;transform:translate(calc(-50% + var(--extra-x,0px)),calc(-50% + var(--extra-y,0px))) rotate(var(--extra-rotate,0deg)) scale(var(--extra-scale,1))}
    .subtitle-stack .sub-hook:active,.subtitle-stack .sub-mark:active,.subtitle-stack .sub-extra:active{cursor:grabbing}
    .subtitle-stack .sub-hook[data-editing="1"],
    .subtitle-stack .sub-mark[data-editing="1"],
    .subtitle-stack .sub-extra[data-editing="1"]{
      cursor:text!important;user-select:text!important;-webkit-user-select:text!important;
      touch-action:manipulation!important;caret-color:#d9ff47;min-width:48px;min-height:1em
    }
    .subtitle-stack [data-selected="1"]{outline:2px solid #d9ff47;outline-offset:4px}
    .reels-hud{
      position:absolute;inset:0;z-index:20;pointer-events:none;
    }
    .reels-hud[data-show="0"]{display:none!important}
    .reels-hud .reels-handle{
      display:block!important;position:absolute;z-index:12;margin:0;
      width:30px;height:30px;border:2px solid #fff;border-radius:50%;
      background:#171715;box-shadow:0 2px 10px #000a;touch-action:none;pointer-events:auto;transform:none!important
    }
    .reels-hud .reels-handle.resize,.reels-hud .reels-handle.stretch-l{
      width:18px;height:32px;border-radius:9px;background:#d9ff47;border-color:#171715;cursor:ew-resize
    }
    .reels-hud .reels-handle.scale{
      width:22px;height:22px;background:#d9ff47;border-color:#171715;cursor:nwse-resize
    }
    .reels-hud .reels-handle.rotate:after{content:"";position:absolute;width:2px;height:12px;background:#fff;left:50%;top:28px;transform:translateX(-50%)}
    .reels-hud .reels-handle.delete{width:26px;height:26px;background:#ff2d7b;border-color:#fff;color:#fff;font:800 16px/26px Arial,sans-serif;text-align:center}
    .reels-hud .reels-handle.delete:before{content:"×"}
    .reels-hud[data-one="1"] .reels-handle.delete{display:none!important}
    .subtitle-stack .reels-handle{display:none!important}
    .reels-guide{position:absolute;z-index:6;background:#d9ff47;pointer-events:none;opacity:0}
    .reels-guide.x{top:0;bottom:0;left:50%;width:1px;transform:translateX(-50%)}
    .reels-guide.y{left:0;right:0;top:50%;height:1px;transform:translateY(-50%)}
    .phone-preview[data-snap-x="1"] .reels-guide.x,
    .phone-preview[data-snap-y="1"] .reels-guide.y{opacity:.9}
    .subtitle-stack [data-snap-rot="1"]{outline-color:#fff}
    .text-add{display:none!important}
    .text-color-tools{display:grid;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid #ffffff16}
    .text-add-btn{width:100%;min-height:42px;border:1px dashed #d9ff4788;border-radius:10px;background:#191918;color:#d9ff47;font:800 12px/1 Arial,sans-serif;letter-spacing:.06em;cursor:pointer}
    .text-add-btn:hover{background:#d9ff47;color:#171715}
    .text-add-btn[hidden]{display:none!important}
    .text-layer-picks{display:flex;flex-wrap:wrap;gap:6px}
    .text-layer-picks button{position:relative;min-height:32px;padding:0 26px 0 10px;border:1px solid #ffffff22;border-radius:8px;background:#191918;color:#fff;font:700 11px/1 Arial,sans-serif;cursor:pointer}
    .text-layer-picks button.active{background:#d9ff47;color:#171715;border-color:#d9ff47}
    .text-layer-picks .layer-x{position:absolute;right:5px;top:50%;transform:translateY(-50%);width:18px;height:18px;border:0;border-radius:50%;background:#ffffff18;color:inherit;font:800 13px/18px Arial,sans-serif;padding:0;cursor:pointer}
    .text-layer-picks button.active .layer-x{background:#17171522}
    .text-layer-picks button[data-last="1"] .layer-x{display:none}
    .sub-hook[data-layer-off="1"],.sub-mark[data-layer-off="1"],.sub-extra[data-layer-off="1"]{display:none!important}
    .subtitle-stack[data-one="1"] .reels-handle.delete{display:none!important}
    .text-tool-row{display:flex;align-items:center;flex-wrap:wrap;gap:7px}
    .text-tool-row span{width:42px;color:#9b9b94;font:800 9px/1 Arial,sans-serif;letter-spacing:.08em}
    .text-tool-row button{width:26px;height:26px;border:2px solid #fff4;border-radius:50%;padding:0;cursor:pointer}
    .text-tool-row button.active{outline:2px solid #d9ff47;outline-offset:2px}
    .text-tool-row .bg-off{width:auto;height:26px;border-radius:7px;padding:0 8px;background:#191918;color:#fff;font:800 9px/1 Arial,sans-serif}
    .text-tool-row .bg-off.active{background:#d9ff47;color:#171715}
    .text-tool-row input[type=color]{width:32px;height:28px;padding:0;border:1px solid #ffffff33;border-radius:6px;background:transparent;cursor:pointer}
    .text-face-row button{width:auto!important;height:32px!important;min-width:72px;border:1px solid #ffffff22!important;border-radius:8px!important;background:#191918;color:#fff;padding:0 12px;font:700 12px/1 Arial,sans-serif}
    .text-face-row button.active{background:#d9ff47;color:#171715;outline:none}
    .text-face-row button[data-face="regular"]{font-weight:400}
    .text-face-row button[data-face="bold"]{font-weight:800}
    .text-face-row button[data-face="italic"]{font-style:italic;font-weight:600}
    .reels-controls{position:relative;z-index:1;width:min(520px,100%);padding:22px;border:1px solid #ffffff18;border-radius:22px;background:#20201d;box-shadow:0 20px 45px #0004}
    .reels-label{display:flex;align-items:center;gap:10px;margin:0!important;color:#d9ff47!important;font:800 10px/1 Arial,sans-serif!important;letter-spacing:.16em}
    .reels-label:after{content:"";height:1px;flex:1;background:#ffffff20}
    .reels-controls>.reels-label{font-size:0!important;letter-spacing:0!important;padding-top:4px}
    .reels-controls>.reels-label:before{font:800 11px/1 Arial,sans-serif;letter-spacing:.12em}
    .reels-controls>.reels-label:nth-of-type(1):before{content:"01 · СУБТИТР СТИЛІ"}
    .reels-controls>.reels-label:nth-of-type(2):before{content:"02 · ТҮС ПАЛИТРАСЫ"}
    .reels-controls>.reels-label:nth-of-type(3):before{content:"03 · МӘТІНІҢІЗ"}
    .reels-controls>.reels-label[data-section="text"]:before{content:"01 · МӘТІНІҢІЗ"}
    .reels-controls>.reels-label[data-section="style"]:before{content:"02 · ҚАРІП"}
    .reels-controls>.reels-label[data-section="palette"],
    .reels-options{display:none!important}
    html.qarip-stories .reels-options{display:grid!important}
    html.qarip-stories .reels-controls>.reels-label[data-section="palette"]{display:flex!important}
    .reels-font-pick{margin-top:10px}
    .reels-font-search{width:100%;box-sizing:border-box;min-height:44px;border:1px solid #ffffff22;border-radius:10px;background:#161615;color:#fff;padding:12px 14px;font:700 14px/1 Arial,sans-serif}
    .reels-font-list{margin-top:8px;max-height:min(32vh,260px);overflow:auto;display:grid;gap:6px;-webkit-overflow-scrolling:touch}
    .reels-font-item{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;min-height:54px;padding:8px 12px;border:1px solid #ffffff18;border-radius:10px;background:#191918;color:#fff;text-align:left;cursor:pointer}
    .reels-font-item b{font-size:20px;font-weight:700;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .reels-font-item small{color:#8a8a84;font:700 11px/1 Arial,sans-serif;letter-spacing:.04em}
    .reels-font-item.active{background:#d9ff47;color:#171715;border-color:#d9ff47}
    .reels-font-item.active small{color:#4d4d47}
    .reels-font-empty{color:#8a8a84;margin:0;padding:14px 4px;font:700 13px/1.4 Arial,sans-serif}
    .reels-copy-edit{margin-top:12px!important;display:flex!important;flex-wrap:wrap;gap:8px}
    .reels-copy-edit input{flex:1;min-width:140px;border-radius:10px!important;border-color:#ffffff22!important;background:#161615!important;color:#fff!important;padding:12px!important}
    .reels-copy-edit input.extra-input{flex-basis:100%}
    .reels-copy-edit input[data-layer-off="1"]{display:none!important}
    .reels-size{display:none!important}
    .reels-actions{display:grid!important;grid-template-columns:1fr;gap:8px;margin-top:14px}
    .reels-actions .reels-act:not(.reels-sticker){display:none!important}
    .reels-actions .reels-sticker{grid-column:1/-1;background:#d9ff47!important;color:#171715!important;border-color:#d9ff47!important;min-height:46px}
    .reels-sticker-toast{display:none;margin:0 0 10px;padding:10px 12px;border-radius:10px;background:#d9ff47;color:#171715;font:800 12px/1.35 Arial,sans-serif}
    .reels-sticker-toast[data-show="1"]{display:block}
    .phone-preview.exporting:before{display:none}
    .phone-preview.exporting .reels-hud,.phone-preview.exporting .text-add{display:none!important}
    .phone-preview.exporting .subtitle-stack [data-selected="1"]{outline:none!important}
    .phone-preview.sticker-export{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
    .phone-preview.sticker-export:before,
    .phone-preview.sticker-export .reel-orbit,
    .phone-preview.sticker-export .reel-ui,
    .phone-preview.sticker-export .reel-progress,
    .phone-preview.sticker-export .font-chip,
    .phone-preview.sticker-export .reels-guide,
    .phone-preview.sticker-export .reels-hud{display:none!important}
    @media(max-width:900px){
      .reels-pick{padding:24px 16px 36px!important}
      .reels-pick:before{inset:10px}
      .reels-controls{box-sizing:border-box}
      .reels-copy h2:after{margin-top:12px}
      .phone-preview{width:min(100%,88vw)!important;aspect-ratio:9/16!important}
    }
    @media(max-width:390px){.reels-controls{padding:14px}}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const emptyLayer = (on = false) => ({
    x: 0,
    y: 0,
    scale: 1,
    boxW: 0,
    rotation: 0,
    color: "",
    bg: null,
    bgOpacity: 1,
    radius: null,
    letterSpacing: null,
    on,
    text: "",
    family: "",
    face: "",
  });
  function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== "string" || hex[0] !== "#") return hex;
    const h = hex.slice(1);
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(full.slice(0, 2), 16) || 0;
    const g = parseInt(full.slice(2, 4), 16) || 0;
    const b = parseInt(full.slice(4, 6), 16) || 0;
    const a = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1;
    return `rgba(${r},${g},${b},${a})`;
  }
  let state = { hook: emptyLayer(true), mark: emptyLayer(true), extra: emptyLayer(false) };
  try {
    const stored = JSON.parse(localStorage.getItem(STORE) || "{}");
    const oldPos = JSON.parse(localStorage.getItem("qarip-reels-text-position") || "{}");
    ["hook", "mark", "extra"].forEach((key) => {
      const fallbackOn = key !== "extra";
      const saved = stored[key] || {};
      const moved = oldPos[key] || {};
      state[key] = { ...emptyLayer(fallbackOn), ...moved, ...saved };
      state[key].stretch = 1;
      if (!(state[key].boxW > 0)) state[key].boxW = 0;
      if (!Object.prototype.hasOwnProperty.call(saved, "on") && !Object.prototype.hasOwnProperty.call(moved, "on")) {
        state[key].on = fallbackOn;
      }
    });
  } catch {}

  function save() {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function applyBox(el, key) {
    if (!el) return;
    const w = Number(state[key].boxW) || 0;
    if (w > 0) {
      el.style.setProperty("width", `${Math.round(w)}px`, "important");
      el.style.setProperty("box-sizing", "border-box", "important");
    } else {
      el.style.removeProperty("width");
    }
  }

  function paint(stack) {
    ["hook", "mark", "extra"].forEach((key) => {
      const layer = state[key];
      stack.style.setProperty(`--${key}-x`, `${layer.x}px`);
      stack.style.setProperty(`--${key}-y`, `${layer.y}px`);
      stack.style.setProperty(`--${key}-scale`, layer.scale);
      stack.style.setProperty(`--${key}-rotate`, `${layer.rotation}deg`);
      applyBox(stack.querySelector(layerSelector(key)), key);
    });
    layoutHud(stack);
  }

  function containLayer(stack, key, mayScale = true) {
    const preview = stack?.closest(".phone-preview") || document.querySelector(".phone-preview");
    const el = stack?.querySelector(layerSelector(key));
    if (!preview || !el || !isOn(key)) return;
    const pad = 44;
    const frame = preview.getBoundingClientRect();
    const innerW = frame.width - pad * 2;
    const innerH = frame.height - pad * 2;
    if (innerW < 24 || innerH < 24) return;
    for (let i = 0; i < 5; i += 1) {
      const box = el.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      if (box.width > innerW + 0.5) {
        if (mayScale) {
          state[key].scale = Math.max(0.25, state[key].scale * (innerW / box.width));
        } else {
          const layoutW = Math.max(48, el.offsetWidth);
          state[key].boxW = Math.max(48, layoutW * (innerW / box.width));
        }
        paint(stack);
        continue;
      }
      if (mayScale && box.height > innerH + 0.5) {
        state[key].scale = Math.max(0.25, state[key].scale * (innerH / box.height));
        paint(stack);
        continue;
      }
      let dx = 0;
      let dy = 0;
      const left = box.left - (frame.left + pad);
      const right = frame.right - pad - box.right;
      const top = box.top - (frame.top + pad);
      const bottom = frame.bottom - pad - box.bottom;
      if (left < 0 && right >= 0) dx = -left;
      else if (right < 0 && left >= 0) dx = right;
      if (top < 0 && bottom >= 0) dy = -top;
      else if (bottom < 0 && top >= 0) dy = bottom;
      if (!dx && !dy) return;
      state[key].x += dx;
      state[key].y += dy;
      paint(stack);
    }
  }

  function containAll(stack) {
    visibleKeys().forEach((key) => containLayer(stack, key, true));
  }

  const ANGLE_STOPS = [0, 45, 90, 135, 180, 225, 270, 315];
  const ANGLE_SNAP = 8;
  const AXIS_SNAP = 8;

  function snapAngle(deg) {
    const a = ((deg % 360) + 360) % 360;
    let nearest = 0;
    let best = 999;
    ANGLE_STOPS.forEach((stop) => {
      let delta = Math.abs(a - stop);
      if (delta > 180) delta = 360 - delta;
      if (delta < best) {
        best = delta;
        nearest = stop;
      }
    });
    if (best <= ANGLE_SNAP) return nearest;
    return deg;
  }

  function ensureGuides(preview) {
    if (!preview || preview.querySelector(".reels-guide")) return;
    const x = document.createElement("i");
    x.className = "reels-guide x";
    const y = document.createElement("i");
    y.className = "reels-guide y";
    preview.append(x, y);
  }

  function ensureHud(preview) {
    if (!preview) return null;
    let hud = preview.querySelector(":scope > .reels-hud");
    if (hud) return hud;
    hud = document.createElement("div");
    hud.className = "reels-hud";
    hud.dataset.show = "0";
    hud.innerHTML =
      '<span class="reels-handle stretch-l" aria-label="Рамканы созу"></span>' +
      '<span class="reels-handle resize" aria-label="Рамканы созу"></span>' +
      '<span class="reels-handle scale" aria-label="Мәтін өлшемі"></span>' +
      '<span class="reels-handle rotate" aria-label="Бұру"></span>' +
      '<span class="reels-handle delete" aria-label="Өшіру"></span>';
    preview.append(hud);
    return hud;
  }

  function layoutHud(stack) {
    const preview = stack?.closest(".phone-preview") || document.querySelector(".phone-preview");
    if (!preview || !stack) return;
    const hud = ensureHud(preview);
    if (hud.dataset.bound !== "1") bindHud(preview);
    hud.dataset.one = stack.dataset.one || "0";
    const selected = stack.querySelector("[data-selected='1']:not([data-layer-off])");
    if (!selected || preview.classList.contains("exporting") || selected.dataset.editing === "1") {
      hud.dataset.show = "0";
      return;
    }
    hud.dataset.show = "1";
    const frame = preview.getBoundingClientRect();
    const box = selected.getBoundingClientRect();
    const w = frame.width;
    const h = frame.height;
    if (w < 8 || h < 8) return;
    const left = box.left - frame.left;
    const top = box.top - frame.top;
    const right = box.right - frame.left;
    const bottom = box.bottom - frame.top;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const place = (sel, x, y, hw, hh) => {
      const node = hud.querySelector(sel);
      if (!node) return;
      const px = Math.max(hw, Math.min(w - hw, x));
      const py = Math.max(hh, Math.min(h - hh, y));
      node.style.left = `${px - hw}px`;
      node.style.top = `${py - hh}px`;
    };
    place(".stretch-l", left, cy, 9, 16);
    place(".resize", right, cy, 9, 16);
    place(".scale", right, bottom, 11, 11);
    place(".rotate", cx, top - 22, 15, 15);
    place(".delete", left, top, 13, 13);
  }

  function setSnap(preview, el, flags) {
    if (preview) {
      preview.dataset.snapX = flags.x ? "1" : "0";
      preview.dataset.snapY = flags.y ? "1" : "0";
    }
    if (el) {
      if (flags.rot) el.dataset.snapRot = "1";
      else el.removeAttribute("data-snap-rot");
    }
  }

  function clearSnap(preview, el) {
    setSnap(preview, el, { x: false, y: false, rot: false });
  }

  function magnetMove(stack, key) {
    const preview = stack.closest(".phone-preview") || document.querySelector(".phone-preview");
    const el = stack.querySelector(layerSelector(key));
    if (!preview || !el) return;
    ensureGuides(preview);
    const frame = preview.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const cx = frame.left + frame.width / 2;
    const cy = frame.top + frame.height / 2;
    const lx = box.left + box.width / 2;
    const ly = box.top + box.height / 2;
    const flags = { x: false, y: false, rot: false };
    if (Math.abs(lx - cx) <= AXIS_SNAP) {
      state[key].x += cx - lx;
      flags.x = true;
    }
    if (Math.abs(ly - cy) <= AXIS_SNAP) {
      state[key].y += cy - ly;
      flags.y = true;
    }
    paint(stack);
    setSnap(preview, el, flags);
  }

  function magnetRotate(stack, key, raw) {
    const snapped = snapAngle(raw);
    state[key].rotation = snapped;
    const preview = stack.closest(".phone-preview") || document.querySelector(".phone-preview");
    const el = stack.querySelector(layerSelector(key));
    if (preview) ensureGuides(preview);
    const a = ((snapped % 360) + 360) % 360;
    setSnap(preview, el, { x: false, y: false, rot: ANGLE_STOPS.includes(a) });
  }

  function isOn(key) {
    return state[key].on !== false;
  }

  function visibleKeys() {
    return ["hook", "mark", "extra"].filter(isOn);
  }

  function layerSelector(key) {
    return key === "hook" ? ".sub-hook" : key === "mark" ? ".sub-mark" : ".sub-extra";
  }

  function layerInput(editor, key) {
    if (key === "hook") return editor?.querySelector('input[aria-label="Акцент"]');
    if (key === "mark") return editor?.querySelector('input[aria-label="Қосымша"]');
    return editor?.querySelector(".extra-input");
  }

  function syncLayerVisibility(stack, editor) {
    stack = stack || document.querySelector(".subtitle-stack");
    editor = editor || document.querySelector(".reels-copy-edit");
    const live = visibleKeys();
    if (stack) stack.dataset.one = live.length === 1 ? "1" : "0";
    ["hook", "mark", "extra"].forEach((key) => {
      const on = isOn(key);
      const el = stack?.querySelector(layerSelector(key));
      if (el) {
        if (on) el.removeAttribute("data-layer-off");
        else el.setAttribute("data-layer-off", "1");
      }
      const input = layerInput(editor, key);
      if (input) {
        if (on) input.removeAttribute("data-layer-off");
        else input.setAttribute("data-layer-off", "1");
      }
      const chip = document.querySelector(`.text-layer-picks [data-layer="${key}"]`);
      if (chip) {
        chip.hidden = !on;
        if (on && live.length === 1) chip.setAttribute("data-last", "1");
        else chip.removeAttribute("data-last");
      }
    });
    const addBtn = document.querySelector(".text-add-btn");
    if (addBtn) addBtn.hidden = live.length >= 3;
    if (stack) layoutHud(stack);
  }

  function removeLayer(stack, editor, key) {
    if (visibleKeys().length <= 1) {
      toast("Кемінде бір мәтін қалу керек.");
      return;
    }
    state[key].on = false;
    syncLayerVisibility(stack, editor);
    const next = visibleKeys()[0] || "hook";
    selectLayer(stack, next);
    save();
  }

  function addLayer(stack, editor) {
    const next = ["hook", "mark", "extra"].find((key) => !isOn(key));
    if (!next) return;
    if (next === "extra") {
      createExtra(stack, editor, true);
      syncLayerVisibility(stack, editor);
      return;
    }
    state[next].on = true;
    syncLayerVisibility(stack, editor);
    bindLayer(stack, next, layerSelector(next));
    selectLayer(stack, next);
    requestAnimationFrame(() => startEdit(stack, next, true));
    save();
  }

  function setLayerText(el, value) {
    if (!el || el.dataset.editing === "1") return;
    const next = value ?? "";
    let text = [...el.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (!text) {
      text = document.createTextNode(next);
      el.insertBefore(text, el.firstChild);
    } else text.nodeValue = next;
  }

  function writeInput(input, text, pushReact) {
    if (!input) return;
    const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    if (desc?.set) desc.set.call(input, text);
    else input.value = text;
    if (pushReact) input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function readLayerText(el, key, pushReact) {
    if (!el) return;
    const text = (el.innerText || "").replace(/\u00a0/g, " ").replace(/\n+$/g, "");
    state[key].text = text;
    writeInput(layerInput(document.querySelector(".reels-copy-edit"), key), text, pushReact);
    save();
  }

  function stopEdit(stack, exceptKey) {
    ["hook", "mark", "extra"].forEach((key) => {
      if (key === exceptKey) return;
      const el = stack?.querySelector(layerSelector(key));
      if (!el || el.dataset.editing !== "1") return;
      el.removeAttribute("data-editing");
      el.removeAttribute("contenteditable");
      readLayerText(el, key, true);
      const s = stack || document.querySelector(".subtitle-stack");
      if (s) containLayer(s, key, true);
    });
    layoutHud(stack || document.querySelector(".subtitle-stack"));
  }

  function startEdit(stack, key, selectAll = false) {
    const el = stack?.querySelector(layerSelector(key));
    if (!el || !isOn(key)) return;
    stopEdit(stack, key);
    selectLayer(stack, key);
    el.dataset.editing = "1";
    el.contentEditable = "plaintext-only";
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.spellcheck = false;
    el.setAttribute("enterkeyhint", "done");
    layoutHud(stack);
    const placeCaret = () => {
      el.focus({ preventScroll: true });
      const sel = window.getSelection();
      if (selectAll) {
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      if (!sel.rangeCount || !el.contains(sel.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };
    placeCaret();
    requestAnimationFrame(placeCaret);
  }

  function applyLayerLook(el, key) {
    if (!el) return;
    const layer = state[key];
    applyBox(el, key);
    if (layer.family) el.style.setProperty("font-family", layer.family, "important");
    const FACE_LOOK = {
      thin: ["100", "normal"],
      light: ["300", "normal"],
      regular: ["400", "normal"],
      medium: ["500", "normal"],
      semibold: ["600", "normal"],
      bold: ["700", "normal"],
      black: ["900", "normal"],
      italic: ["400", "italic"],
    };
    const look = FACE_LOOK[layer.face];
    if (look) {
      el.style.setProperty("font-weight", look[0], "important");
      el.style.setProperty("font-style", look[1], "important");
    }
    if (layer.color) el.style.setProperty("color", layer.color, "important");
    if (layer.letterSpacing != null && layer.letterSpacing !== "") {
      el.style.setProperty("letter-spacing", `${layer.letterSpacing}px`, "important");
    } else {
      el.style.removeProperty("letter-spacing");
    }
    if (layer.bg) {
      const alpha = layer.bgOpacity == null ? 1 : Number(layer.bgOpacity);
      const radius = layer.radius == null ? 999 : Number(layer.radius);
      el.style.setProperty("background", hexToRgba(layer.bg, alpha), "important");
      el.style.setProperty("padding", "7px 11px", "important");
      el.style.setProperty("border-radius", `${radius}px`, "important");
      el.style.setProperty("box-shadow", alpha > 0.08 ? "0 6px 16px #0005" : "none", "important");
      el.dataset.hasBg = "1";
    } else if (layer.bg === "") {
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("box-shadow", "none", "important");
      if (key !== "mark") el.style.setProperty("padding", "0", "important");
      el.dataset.hasBg = "0";
    }
  }

  function selectedKey(stack) {
    const current = stack.querySelector("[data-selected='1']:not([data-layer-off])");
    if (current?.classList.contains("sub-mark")) return "mark";
    if (current?.classList.contains("sub-extra")) return "extra";
    if (current?.classList.contains("sub-hook")) return "hook";
    return visibleKeys()[0] || "hook";
  }

  function clearSelect(stack) {
    stopEdit(stack);
    stack?.querySelectorAll("[data-selected]").forEach((item) => item.removeAttribute("data-selected"));
    document.querySelectorAll(".text-layer-picks button").forEach((btn) => btn.classList.remove("active"));
    layoutHud(stack);
    requestAnimationFrame(() => layoutHud(stack));
  }

  function selectLayer(stack, key) {
    if (!isOn(key)) return;
    stopEdit(stack, key);
    stack.querySelectorAll("[data-selected]").forEach((item) => item.removeAttribute("data-selected"));
    const el = stack.querySelector(layerSelector(key));
    if (el) el.dataset.selected = "1";
    document.querySelectorAll(".text-layer-picks button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.layer === key);
    });
    syncSwatches(key);
    syncFace(key);
    syncFontActive();
    layoutHud(stack);
    requestAnimationFrame(() => layoutHud(stack));
  }

  function inferFace(el, layer) {
    if (layer?.face) return layer.face;
    if (!el) return "regular";
    const style = getComputedStyle(el);
    const italic = style.fontStyle === "italic" || style.fontStyle === "oblique";
    const w = parseInt(style.fontWeight, 10) || 400;
    if (italic) return "italic";
    if (w <= 150) return "thin";
    if (w <= 350) return "light";
    if (w >= 600) return "bold";
    return "regular";
  }

  function syncFace(key) {
    const tools = document.querySelector(".text-color-tools");
    if (!tools) return;
    const stack = document.querySelector(".subtitle-stack");
    const el = stack?.querySelector(layerSelector(key));
    const face = inferFace(el, state[key]);
    tools.querySelectorAll("[data-face]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.face === face);
    });
  }

  function ensureBgColor(key, el) {
    if (state[key].bg) return;
    const bg = el ? getComputedStyle(el).backgroundColor : "";
    const m = bg && bg.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    state[key].bg = m
      ? `#${[1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("")}`
      : "#d9ff47";
  }

  function syncSwatches(key) {
    const layer = state[key];
    const tools = document.querySelector(".text-color-tools");
    if (!tools) return;
    tools.querySelectorAll("[data-text-color]").forEach((btn) => {
      btn.classList.toggle("active", !!layer.color && btn.dataset.textColor === layer.color);
    });
    tools.querySelectorAll("[data-bg-color]").forEach((btn) => {
      btn.classList.toggle("active", !!layer.bg && btn.dataset.bgColor === layer.bg);
    });
    const off = tools.querySelector(".bg-off");
    if (off) off.classList.toggle("active", layer.bg === "");
    const textNative = tools.querySelector("[data-native='text']");
    const bgNative = tools.querySelector("[data-native='bg']");
    if (textNative && layer.color) textNative.value = layer.color;
    if (bgNative && layer.bg) bgNative.value = layer.bg;
    const opacityNative = tools.querySelector("[data-native='bgOpacity']");
    const radiusNative = tools.querySelector("[data-native='radius']");
    const trackingNative = tools.querySelector("[data-native='tracking']");
    if (opacityNative) opacityNative.value = layer.bgOpacity == null ? 1 : layer.bgOpacity;
    if (radiusNative) radiusNative.value = layer.radius == null ? 999 : layer.radius;
    if (trackingNative) trackingNative.value = layer.letterSpacing == null ? 0 : layer.letterSpacing;
  }

  function layerCenter(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function axisX(center, rotationDeg, x, y) {
    const rot = (rotationDeg * Math.PI) / 180;
    return (x - center.x) * Math.cos(rot) + (y - center.y) * Math.sin(rot);
  }

  function blurEditor() {
    const active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) active.blur();
  }

  function lockWindowScroll() {
    if (lockWindowScroll.on) return;
    lockWindowScroll.on = true;
    const block = (event) => {
      if (event.cancelable) event.preventDefault();
    };
    const stop = () => {
      lockWindowScroll.on = false;
      window.removeEventListener("touchmove", block, true);
      window.removeEventListener("pointerup", stop, true);
      window.removeEventListener("pointercancel", stop, true);
      window.removeEventListener("touchend", stop, true);
    };
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("pointerup", stop, { capture: true });
    window.addEventListener("pointercancel", stop, { capture: true });
    window.addEventListener("touchend", stop, { capture: true });
  }

  function liveLayer(stack) {
    const element = stack?.querySelector("[data-selected='1']:not([data-layer-off])");
    if (!element) return null;
    const key = element.classList.contains("sub-mark")
      ? "mark"
      : element.classList.contains("sub-extra")
        ? "extra"
        : "hook";
    return { key, element };
  }

  function bindStretchHandle(handle, stack) {
    handle.addEventListener("pointerdown", (event) => {
      const live = liveLayer(stack);
      if (!live) return;
      const { key, element } = live;
      event.preventDefault();
      event.stopPropagation();
      blurEditor();
      lockWindowScroll();
      selectLayer(stack, key);
      const center = layerCenter(element);
      const startHalf = Math.max(12, element.getBoundingClientRect().width / 2);
      const startW = Math.max(48, state[key].boxW || element.offsetWidth);
      handle.setPointerCapture(event.pointerId);
      const move = (moveEvent) => {
        const now = Math.abs(axisX(center, state[key].rotation, moveEvent.clientX, moveEvent.clientY));
        const preview = stack.closest(".phone-preview");
        const innerW = (preview?.getBoundingClientRect().width || 720) - 88;
        const maxW = innerW / Math.max(0.25, state[key].scale || 1);
        state[key].boxW = Math.max(48, Math.min(maxW, startW * (now / startHalf)));
        paint(stack);
        containLayer(stack, key, false);
      };
      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        save();
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    }, { passive: false });
  }

  function bindScaleHandle(handle, stack) {
    handle.addEventListener("pointerdown", (event) => {
      const live = liveLayer(stack);
      if (!live) return;
      const { key, element } = live;
      event.preventDefault();
      event.stopPropagation();
      blurEditor();
      lockWindowScroll();
      selectLayer(stack, key);
      const center = layerCenter(element);
      const startDist = Math.max(12, Math.hypot(event.clientX - center.x, event.clientY - center.y));
      const startScale = state[key].scale;
      handle.setPointerCapture(event.pointerId);
      const move = (moveEvent) => {
        const dist = Math.hypot(moveEvent.clientX - center.x, moveEvent.clientY - center.y);
        state[key].scale = Math.max(0.25, Math.min(4, startScale * (dist / startDist)));
        paint(stack);
        containLayer(stack, key, true);
      };
      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        save();
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    }, { passive: false });
  }

  function bindHud(preview) {
    const stack = preview?.querySelector(".subtitle-stack");
    const hud = ensureHud(preview);
    if (!stack || !hud || hud.dataset.bound === "1") return;
    hud.dataset.bound = "1";
    const resize = hud.querySelector(".resize");
    const stretchL = hud.querySelector(".stretch-l");
    const scaleH = hud.querySelector(".scale");
    const rotate = hud.querySelector(".rotate");
    const del = hud.querySelector(".delete");
    bindStretchHandle(resize, stack);
    bindStretchHandle(stretchL, stack);
    bindScaleHandle(scaleH, stack);
    rotate.addEventListener("pointerdown", (event) => {
      const live = liveLayer(stack);
      if (!live) return;
      const { key, element } = live;
      event.preventDefault();
      event.stopPropagation();
      blurEditor();
      lockWindowScroll();
      selectLayer(stack, key);
      const center = layerCenter(element);
      const startAng = Math.atan2(event.clientY - center.y, event.clientX - center.x) * (180 / Math.PI);
      const startRot = state[key].rotation;
      rotate.setPointerCapture(event.pointerId);
      const move = (moveEvent) => {
        const ang = Math.atan2(moveEvent.clientY - center.y, moveEvent.clientX - center.x) * (180 / Math.PI);
        magnetRotate(stack, key, startRot + (ang - startAng));
        paint(stack);
        containLayer(stack, key, true);
      };
      const end = () => {
        rotate.removeEventListener("pointermove", move);
        rotate.removeEventListener("pointerup", end);
        rotate.removeEventListener("pointercancel", end);
        clearSnap(stack.closest(".phone-preview"), element);
        save();
      };
      rotate.addEventListener("pointermove", move);
      rotate.addEventListener("pointerup", end);
      rotate.addEventListener("pointercancel", end);
    }, { passive: false });
    del.addEventListener("pointerdown", (event) => {
      const live = liveLayer(stack);
      event.preventDefault();
      event.stopPropagation();
      if (!live) return;
      removeLayer(stack, document.querySelector(".reels-copy-edit"), live.key);
    }, { passive: false });
  }

  function bindLayer(stack, key, selector) {
    const element = stack.querySelector(selector);
    if (!element) return;
    applyLayerLook(element, key);
    element.querySelectorAll(":scope > .reels-handle").forEach((node) => node.remove());
    if (element.dataset.layerReady === "1") return;
    element.dataset.layerReady = "1";

    const select = () => selectLayer(stack, key);
    element.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".reels-handle")) return;
      if (element._qaripPinch) return;
      if (element.dataset.editing === "1") return;
      const already = element.dataset.selected === "1";
      if (!already) {
        event.preventDefault();
        blurEditor();
        lockWindowScroll();
      }
      select();
      const start = { pointerX: event.clientX, pointerY: event.clientY, x: state[key].x, y: state[key].y, moved: false };
      if (!already) {
        try { element.setPointerCapture(event.pointerId); } catch {}
      }
      const move = (moveEvent) => {
        if (element._qaripPinch || element.dataset.editing === "1") return;
        const dist = Math.hypot(moveEvent.clientX - start.pointerX, moveEvent.clientY - start.pointerY);
        if (dist > 8) {
          if (!start.moved) {
            start.moved = true;
            event.preventDefault();
            blurEditor();
            lockWindowScroll();
            try { element.setPointerCapture(moveEvent.pointerId); } catch {}
          }
          state[key].x = start.x + moveEvent.clientX - start.pointerX;
          state[key].y = start.y + moveEvent.clientY - start.pointerY;
          paint(stack);
          magnetMove(stack, key);
          containLayer(stack, key, false);
        }
      };
      const end = () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", end);
        element.removeEventListener("pointercancel", end);
        clearSnap(stack.closest(".phone-preview"), element);
        if (already && !start.moved) startEdit(stack, key);
        else save();
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", end);
      element.addEventListener("pointercancel", end);
    }, { passive: false });
    element.addEventListener("input", () => {
      if (element.dataset.editing !== "1") return;
      readLayerText(element, key, false);
      layoutHud(stack);
      containLayer(stack, key, true);
    });
    element.addEventListener("keydown", (event) => {
      if (element.dataset.editing !== "1") return;
      if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
        event.preventDefault();
        stopEdit(stack);
      }
    });
    element.addEventListener("paste", (event) => {
      if (element.dataset.editing !== "1") return;
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData)?.getData("text/plain") || "";
      document.execCommand("insertText", false, text.replace(/\r\n/g, "\n"));
    });
    element.addEventListener("focusout", () => {
      if (element.dataset.editing !== "1") return;
      setTimeout(() => {
        if (element.dataset.editing !== "1") return;
        if (element.contains(document.activeElement)) return;
        stopEdit(stack);
      }, 10);
    });
    const pinchDist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const pinchAng = (a, b) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * (180 / Math.PI);
    element.addEventListener(
      "touchstart",
      (event) => {
        if (element.dataset.editing === "1") return;
        if (event.touches.length === 2) {
          event.preventDefault();
          select();
          element._qaripPinch = {
            dist: pinchDist(event.touches[0], event.touches[1]),
            ang: pinchAng(event.touches[0], event.touches[1]),
            scale: state[key].scale,
            rotation: state[key].rotation,
          };
          return;
        }
        if (element.dataset.selected !== "1") {
          event.preventDefault();
          blurEditor();
          lockWindowScroll();
        }
      },
      { passive: false }
    );
    element.addEventListener(
      "touchmove",
      (event) => {
        const pinch = element._qaripPinch;
        if (!pinch || event.touches.length !== 2) return;
        event.preventDefault();
        const dist = pinchDist(event.touches[0], event.touches[1]);
        state[key].scale = Math.max(0.25, Math.min(4, pinch.scale * (dist / Math.max(12, pinch.dist))));
        magnetRotate(stack, key, pinch.rotation + (pinchAng(event.touches[0], event.touches[1]) - pinch.ang));
        paint(stack);
        containLayer(stack, key, true);
      },
      { passive: false }
    );
    element.addEventListener("touchend", (event) => {
      if (event.touches.length < 2 && element._qaripPinch) {
        element._qaripPinch = null;
        clearSnap(stack.closest(".phone-preview"), element);
        save();
      }
    });
  }

  function extraInput(editor) {
    let input = editor?.querySelector(".extra-input");
    if (input || !editor) return input;
    input = document.createElement("input");
    input.className = "extra-input";
    input.placeholder = "Жаңа мәтін";
    input.setAttribute("aria-label", "Жаңа мәтін");
    input.value = state.extra.text || "Жаңа мәтін";
    input.addEventListener("input", () => {
      const extra = document.querySelector(".sub-extra");
      state.extra.text = input.value;
      if (extra?.dataset.editing !== "1") setLayerText(extra, input.value);
      const stack = document.querySelector(".subtitle-stack");
      if (stack) containLayer(stack, "extra", true);
      save();
    });
    input.addEventListener("focus", () => {
      const stack = document.querySelector(".subtitle-stack");
      if (stack) {
        stopEdit(stack);
        selectLayer(stack, "extra");
      }
    });
    editor.append(input);
    return input;
  }

  function createExtra(stack, editor, select = true) {
    let extra = stack.querySelector(".sub-extra");
    if (!extra) {
      extra = document.createElement("span");
      extra.className = "sub-extra";
      extra.append(document.createTextNode(state.extra.text || "Жаңа мәтін"));
      stack.append(extra);
    }
    state.extra.on = true;
    if (!state.extra.text) state.extra.text = "Жаңа мәтін";
    extraInput(editor);
    const chip = document.querySelector('.text-layer-picks [data-layer="extra"]');
    if (chip) chip.hidden = false;
    bindLayer(stack, "extra", ".sub-extra");
    applyLayerLook(extra, "extra");
    if (select) {
      selectLayer(stack, "extra");
      requestAnimationFrame(() => startEdit(stack, "extra", true));
    }
    syncLayerVisibility(stack, editor);
    save();
    return extra;
  }

  function swatchButtons(kind) {
    return COLORS.map(
      (color) =>
        `<button type="button" data-${kind}-color="${color}" style="background:${color}" aria-label="${color}"></button>`
    ).join("");
  }

  function toast(message) {
    const controls = document.querySelector(".reels-controls");
    if (!controls) return;
    let el = controls.querySelector(".reels-sticker-toast");
    if (!el) {
      el = document.createElement("p");
      el.className = "reels-sticker-toast";
      controls.prepend(el);
    }
    el.textContent = message;
    el.dataset.show = "1";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.dataset.show = "0";
    }, 3200);
  }

  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(label || "timeout")), ms)),
    ]);
  }

  function cropTransparent(canvas) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] > 12) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) return canvas;
    const pad = 36;
    const x = Math.max(0, minX - pad);
    const y = Math.max(0, minY - pad);
    const w = Math.min(width - x, maxX - minX + pad * 2);
    const h = Math.min(height - y, maxY - minY + pad * 2);
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    out.getContext("2d").drawImage(canvas, x, y, w, h, 0, 0, w, h);
    return out;
  }

  function layerPlainText(el) {
    return (el?.innerText || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\s+/g, " ")
      .trim();
  }

  function liveTextLines(el) {
    const raw = layerPlainText(el);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (!nodes.length || !raw) return [raw];
    const range = document.createRange();
    const lines = [];
    let buf = "";
    let lastTop = null;
    nodes.forEach((node) => {
      const text = node.nodeValue || "";
      for (let i = 0; i < text.length; i += 1) {
        range.setStart(node, i);
        range.setEnd(node, Math.min(text.length, i + 1));
        const box = range.getClientRects()[0];
        if (!box) continue;
        if (lastTop !== null && Math.abs(box.top - lastTop) > 3) {
          const piece = buf.replace(/\s+/g, " ").trim();
          if (piece) lines.push(piece);
          buf = "";
        }
        buf += text[i];
        lastTop = box.top;
      }
    });
    const tail = buf.replace(/\s+/g, " ").trim();
    if (tail) lines.push(tail);
    return lines.length ? lines : [raw];
  }

  function fillRoundRect(ctx, x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
    else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    ctx.fill();
  }

  function liveLayers(stack) {
    return ["hook", "mark", "extra"]
      .filter(isOn)
      .map((key) => ({ key, el: stack.querySelector(layerSelector(key)) }))
      .filter((item) => item.el && getComputedStyle(item.el).display !== "none");
  }

  function paintLayer(ctx, item, originX, originY, outScale) {
    const { el, key } = item;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const scale = state[key].scale || 1;
    const rot = ((state[key].rotation || 0) * Math.PI) / 180;
    const cx = (rect.left + rect.width / 2 - originX) * outScale;
    const cy = (rect.top + rect.height / 2 - originY) * outScale;
    const fontSize = parseFloat(cs.fontSize) * scale * outScale;
    const padL = parseFloat(cs.paddingLeft) * scale * outScale || 0;
    const padR = parseFloat(cs.paddingRight) * scale * outScale || 0;
    const padT = parseFloat(cs.paddingTop) * scale * outScale || 0;
    const padB = parseFloat(cs.paddingBottom) * scale * outScale || 0;
    const radius = parseFloat(cs.borderRadius) * scale * outScale || 0;
    const bg = cs.backgroundColor || "rgba(0, 0, 0, 0)";
    const hasBg = !bg.includes("0)") && bg !== "transparent";
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = cs.letterSpacing;
    const lines = liveTextLines(el);
    const parsedLh = parseFloat(cs.lineHeight);
    const lh = Number.isFinite(parsedLh) ? parsedLh * scale * outScale : fontSize * 1.08;
    const textW = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
    const italicPad = /italic|oblique/.test(cs.fontStyle) ? fontSize * 0.32 : fontSize * 0.06;
    const w = Math.max(el.offsetWidth * scale * outScale, textW + padL + padR + italicPad * 2, 2);
    const h = Math.max(el.offsetHeight * scale * outScale, lh * lines.length + padT + padB, 2);
    if (hasBg) {
      ctx.fillStyle = bg;
      fillRoundRect(ctx, -w / 2, -h / 2, w, h, radius || h / 2);
      ctx.fillStyle = cs.color;
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 10 * outScale * scale;
      ctx.shadowOffsetY = 2 * outScale * scale;
    }
    const block = lh * lines.length;
    let y = -block / 2 + lh / 2;
    lines.forEach((line) => {
      ctx.fillText(line, 0, y);
      y += lh;
    });
    ctx.restore();
  }

  function renderStackSticker(preview, stack) {
    const layers = liveLayers(stack);
    if (!layers.length) throw new Error("layers");
    const pad = 72;
    const outScale = 2;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    layers.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    });
    const out = document.createElement("canvas");
    out.width = Math.max(8, Math.ceil((maxX - minX) * outScale + pad * 2));
    out.height = Math.max(8, Math.ceil((maxY - minY) * outScale + pad * 2));
    const ctx = out.getContext("2d");
    layers.forEach((item) => paintLayer(ctx, item, minX - pad / outScale, minY - pad / outScale, outScale));
    return cropTransparent(out);
  }

  async function writePng(blob) {
    try {
      await withTimeout(navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]), 2500, "clipboard");
      return "copied";
    } catch {}
    const link = document.createElement("a");
    link.download = "qarip.png";
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2500);
    return "saved";
  }

  async function copySticker() {
    const preview = document.querySelector(".phone-preview");
    const stack = preview?.querySelector(".subtitle-stack");
    const btn = document.querySelector(".reels-sticker");
    if (!preview || !stack || !btn) return;
    stopEdit(stack);
    btn.disabled = true;
    btn.textContent = "Көшірілуде…";
    preview.classList.add("exporting", "sticker-export");
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = renderStackSticker(preview, stack);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("blob");
      const result = await writePng(blob);
      toast(
        result === "copied"
          ? "Көшірілді. Instagram Stories-қа қойыңыз."
          : "Сақталды. Stories-қа фотодан қосыңыз."
      );
    } catch (error) {
      console.warn(error);
      toast("Көшіру шықпады. Қайта көріңіз.");
    } finally {
      preview.classList.remove("exporting", "sticker-export");
      btn.disabled = false;
      btn.textContent = "Көшіру";
    }
  }

  function escHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function catalogFonts() {
    const seen = new Set();
    const fonts = [];
    document.querySelectorAll(".font-card").forEach((card) => {
      const name = card.querySelector("h3")?.textContent?.trim();
      const preview = card.querySelector(".font-preview");
      const family = preview?.style.fontFamily || "";
      if (!name || !family || seen.has(name)) return;
      seen.add(name);
      fonts.push({ name, family });
    });
    return fonts;
  }

  function applyFontToSelected(stack, family, name) {
    const key = selectedKey(stack);
    state[key].family = family;
    state[key].fontName = name;
    applyLayerLook(stack.querySelector(layerSelector(key)), key);
    if (document.fonts?.load && family) {
      const face = state[key].face;
      const FACE_LOOK = {
        thin: ["100", "normal"],
        light: ["300", "normal"],
        regular: ["400", "normal"],
        bold: ["700", "normal"],
        italic: ["400", "italic"],
      };
      const look = FACE_LOOK[face] || ["400", "normal"];
      document.fonts.load(`${look[1]} ${look[0]} 48px ${family}`).catch(() => {}).finally(() => containLayer(stack, key, true));
    } else {
      containLayer(stack, key, true);
    }
    save();
    syncFontActive();
  }

  function syncFontActive() {
    const stack = document.querySelector(".subtitle-stack");
    const pick = document.querySelector(".reels-font-pick");
    if (!stack || !pick) return;
    const key = selectedKey(stack);
    const selectedName = state[key]?.fontName || "";
    const selectedFamily = state[key]?.family || "";
    const list = pick.querySelector(".reels-font-list");
    list?.querySelectorAll(".reels-font-item").forEach((item) => {
      const family = decodeURIComponent(item.dataset.family || "");
      const on = selectedName ? item.dataset.name === selectedName : family === selectedFamily;
      item.classList.toggle("active", on);
    });
    const active = list?.querySelector(".reels-font-item.active");
    if (!list || !active) return;
    const listBox = list.getBoundingClientRect();
    const itemBox = active.getBoundingClientRect();
    if (itemBox.top < listBox.top) list.scrollTop -= listBox.top - itemBox.top;
    else if (itemBox.bottom > listBox.bottom) list.scrollTop += itemBox.bottom - listBox.bottom;
  }

  function renderFontList(stack) {
    const pick = document.querySelector(".reels-font-pick");
    if (!pick) return;
    const query = pick.querySelector(".reels-font-search")?.value.trim().toLowerCase() || "";
    const list = pick.querySelector(".reels-font-list");
    const fonts = catalogFonts().filter((font) => !query || font.name.toLowerCase().includes(query));
    if (!list) return;
    if (!fonts.length) {
      list.innerHTML = '<p class="reels-font-empty">Қаріп табылмады.</p>';
      return;
    }
    const key = selectedKey(stack || document.querySelector(".subtitle-stack"));
    const selectedName = state[key]?.fontName || "";
    const selectedFamily = state[key]?.family || "";
    list.innerHTML = fonts
      .map((font) => {
        const on = selectedName ? font.name === selectedName : font.family === selectedFamily;
        return `<button type="button" class="reels-font-item${on ? " active" : ""}" data-name="${escHtml(font.name)}" data-family="${encodeURIComponent(font.family)}"><b style="font-family:${escHtml(font.family)}">${escHtml(font.name)}</b><small>Әә Ғғ Ққ</small></button>`;
      })
      .join("");
  }

  function ensureFontPicker(stack) {
    const controls = document.querySelector(".reels-controls");
    if (!controls) return;
    const styleLabel =
      controls.querySelector('.reels-label[data-section="style"]') ||
      [...controls.querySelectorAll(":scope > .reels-label")].find((label) => label.dataset.section !== "text" && label.dataset.section !== "palette");
    let pick = controls.querySelector(".reels-font-pick");
    if (!pick) {
      pick = document.createElement("div");
      pick.className = "reels-font-pick";
      pick.innerHTML =
        '<input class="reels-font-search" type="search" placeholder="Қаріп атауын іздеу..." aria-label="Қаріп іздеу"><div class="reels-font-list"></div>';
      if (styleLabel) styleLabel.after(pick);
      else controls.append(pick);
      pick.querySelector(".reels-font-search").addEventListener("input", () => renderFontList(stack));
      pick.querySelector(".reels-font-list").addEventListener("click", (event) => {
        const item = event.target.closest(".reels-font-item");
        if (!item) return;
        const named = catalogFonts().find((font) => font.name === item.dataset.name);
        const family = named?.family || decodeURIComponent(item.dataset.family || "");
        applyFontToSelected(stack, family, item.dataset.name);
      });
    }
    if (controls.dataset.fontPickObserve !== "1") {
      controls.dataset.fontPickObserve = "1";
      let restore = 0;
      new MutationObserver(() => {
        if (controls.querySelector(".reels-font-pick")) return;
        clearTimeout(restore);
        restore = setTimeout(() => ensureFontPicker(stack), 40);
      }).observe(controls, { childList: true });
    }
    renderFontList(stack);
    const grid = document.querySelector(".font-grid");
    if (grid && grid.dataset.fontPickWatch !== "1") {
      grid.dataset.fontPickWatch = "1";
      let timer = 0;
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => renderFontList(stack), 80);
      }).observe(grid, { childList: true });
    }
  }

  function ensureFaceRow(stack) {
    const tools = document.querySelector(".text-color-tools");
    if (!tools) return;
    if (!tools.querySelector(".text-face-row")) {
      const row = document.createElement("div");
      row.className = "text-tool-row text-face-row";
      row.dataset.row = "face";
      row.innerHTML =
        '<span>СТИЛЬ</span><button type="button" data-face="regular">Қалыпты</button><button type="button" data-face="bold">Қалың</button><button type="button" data-face="italic">Курсив</button>';
      const textRow = tools.querySelector('[data-row="text"]');
      if (textRow) textRow.before(row);
      else tools.append(row);
    }
    syncFace(selectedKey(stack));
  }

  function ensureStickerButton() {
    const actions = document.querySelector(".reels-actions");
    if (!actions) return;
    let button = actions.querySelector(".reels-sticker");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "reels-act reels-sticker";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        copySticker();
      });
      actions.prepend(button);
    }
    button.textContent = "Көшіру";
    button.setAttribute("aria-label", "Көшіру");
  }

  function boot() {
    if (!/\/qarip\/(stories|reels)\/?$/.test(location.pathname)) return;
    const preview = document.querySelector(".phone-preview");
    const stack = preview?.querySelector(".subtitle-stack");
    const editor = document.querySelector(".reels-copy-edit");
    if (!preview || !stack) return;
    ensureGuides(preview);
    bindHud(preview);
    paint(stack);
    if (state.extra.on) {
      if (!stack.querySelector(".sub-extra")) createExtra(stack, editor, false);
      else {
        extraInput(editor);
        const chip = document.querySelector('.text-layer-picks [data-layer="extra"]');
        if (chip) chip.hidden = false;
      }
    }
    LAYERS.forEach(([key, selector]) => bindLayer(stack, key, selector));
    syncLayerVisibility(stack, editor);

    const hookInput = editor?.querySelector('input[aria-label="Акцент"]');
    const markInput = editor?.querySelector('input[aria-label="Қосымша"]');
    hookInput?.addEventListener("focus", () => {
      stopEdit(stack);
      selectLayer(stack, "hook");
    });
    markInput?.addEventListener("focus", () => {
      stopEdit(stack);
      selectLayer(stack, "mark");
    });
    if (hookInput && hookInput.dataset.containReady !== "1") {
      hookInput.dataset.containReady = "1";
      hookInput.addEventListener("input", () => requestAnimationFrame(() => containLayer(stack, "hook", true)));
    }
    if (markInput && markInput.dataset.containReady !== "1") {
      markInput.dataset.containReady = "1";
      markInput.addEventListener("input", () => requestAnimationFrame(() => containLayer(stack, "mark", true)));
    }
    containAll(stack);
    if (preview.dataset.editOutside !== "1") {
      preview.dataset.editOutside = "1";
      document.addEventListener("pointerdown", (event) => {
        const editing = document.querySelector(".subtitle-stack [data-editing='1']");
        if (!editing) return;
        if (editing.contains(event.target)) return;
        stopEdit(editing.closest(".subtitle-stack"));
      }, true);
    }
    if (preview.dataset.containObserve !== "1") {
      preview.dataset.containObserve = "1";
      new ResizeObserver(() => {
        containAll(stack);
        layoutHud(stack);
      }).observe(preview);
    }
    if (preview.dataset.hudObserve !== "1") {
      preview.dataset.hudObserve = "1";
      new MutationObserver(() => {
        if (!preview.querySelector(":scope > .reels-hud")) {
          bindHud(preview);
          layoutHud(stack);
        }
      }).observe(preview, { childList: true });
    }

    if (preview.dataset.toolsReady === "1") {
      applyLayerLook(stack.querySelector(".sub-hook"), "hook");
      applyLayerLook(stack.querySelector(".sub-mark"), "mark");
      applyLayerLook(stack.querySelector(".sub-extra"), "extra");
      containAll(stack);
      syncLayerVisibility(stack, editor);
      ensureStickerButton();
      ensureFontPicker(stack);
      ensureFaceRow(stack);
      if (preview.dataset.deselectReady !== "1") {
        preview.dataset.deselectReady = "1";
        preview.addEventListener("pointerdown", (event) => {
          if (event.target.closest(".sub-hook, .sub-mark, .sub-extra, .reels-handle")) return;
          clearSelect(stack);
        });
      }
      return;
    }
    preview.dataset.toolsReady = "1";

    const tools = document.createElement("div");
    tools.className = "text-color-tools";
    tools.innerHTML = `
      <button type="button" class="text-add-btn">+ Мәтін қосу</button>
      <div class="text-layer-picks">
        <button type="button" class="active" data-layer="hook">Акцент<span class="layer-x" aria-label="Өшіру">×</span></button>
        <button type="button" data-layer="mark">Қосымша<span class="layer-x" aria-label="Өшіру">×</span></button>
        <button type="button" data-layer="extra" hidden>Жаңа мәтін<span class="layer-x" aria-label="Өшіру">×</span></button>
      </div>
      <div class="text-tool-row text-face-row" data-row="face">
        <span>СТИЛЬ</span>
        <button type="button" data-face="regular">Қалыпты</button>
        <button type="button" data-face="bold">Қалың</button>
        <button type="button" data-face="italic">Курсив</button>
      </div>
      <div class="text-tool-row" data-row="text">
        <span>ТҮС</span>
        ${swatchButtons("text")}
        <input type="color" data-native="text" value="#ffffff" aria-label="Мәтін түсі">
      </div>
      <div class="text-tool-row" data-row="bg">
        <span>ФОН</span>
        ${swatchButtons("bg")}
        <input type="color" data-native="bg" value="#d9ff47" aria-label="Мәтін фоны">
        <button type="button" class="bg-off">ЖОҚ</button>
      </div>
      <div class="text-tool-row" data-row="bg-opacity">
        <span>МӨЛД</span>
        <input type="range" data-native="bgOpacity" min="0" max="1" step="0.05" value="1" aria-label="Фон мөлдірлігі">
      </div>
      <div class="text-tool-row" data-row="bg-radius">
        <span>ДӨҢГ</span>
        <input type="range" data-native="radius" min="0" max="60" step="2" value="999" aria-label="Дөңгелектену">
      </div>
      <div class="text-tool-row" data-row="tracking">
        <span>АРАЛ</span>
        <input type="range" data-native="tracking" min="-4" max="16" step="0.5" value="0" aria-label="Әріп аралығы">
      </div>
    `;
    editor?.after(tools);

    const controls = document.querySelector(".reels-controls");
    const labels = controls?.querySelectorAll(":scope > .reels-label");
    const styleLabel = labels?.[0];
    const paletteLabel = labels?.[1];
    const textLabel = labels?.[2];
    if (styleLabel && paletteLabel && textLabel) {
      styleLabel.dataset.section = "style";
      paletteLabel.dataset.section = "palette";
      textLabel.dataset.section = "text";
      controls.insertBefore(textLabel, styleLabel);
      controls.insertBefore(editor, styleLabel);
      controls.insertBefore(tools, styleLabel);
    }

    tools.querySelector(".text-add-btn").addEventListener("click", () => addLayer(stack, editor));
    tools.querySelector(".text-layer-picks").addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-layer]");
      if (!btn || btn.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.target.closest(".layer-x")) {
        removeLayer(stack, editor, btn.dataset.layer);
        return;
      }
      selectLayer(stack, btn.dataset.layer);
    });
    tools.addEventListener("click", (event) => {
      const off = event.target.closest(".bg-off");
      const textBtn = event.target.closest("[data-text-color]");
      const bgBtn = event.target.closest("[data-bg-color]");
      const faceBtn = event.target.closest("[data-face]");
      if (!off && !textBtn && !bgBtn && !faceBtn) return;
      const key = selectedKey(stack);
      const el = stack.querySelector(layerSelector(key));
      if (off) state[key].bg = "";
      if (textBtn) state[key].color = textBtn.dataset.textColor;
      if (bgBtn) state[key].bg = bgBtn.dataset.bgColor;
      if (faceBtn) state[key].face = faceBtn.dataset.face;
      applyLayerLook(el, key);
      syncSwatches(key);
      syncFace(key);
      if (faceBtn) containLayer(stack, key, true);
      save();
    });
    tools.querySelector("[data-native='text']").addEventListener("input", (event) => {
      const key = selectedKey(stack);
      state[key].color = event.target.value;
      applyLayerLook(
        stack.querySelector(key === "hook" ? ".sub-hook" : key === "mark" ? ".sub-mark" : ".sub-extra"),
        key
      );
      syncSwatches(key);
      save();
    });
    tools.querySelector("[data-native='bg']").addEventListener("input", (event) => {
      const key = selectedKey(stack);
      state[key].bg = event.target.value;
      applyLayerLook(
        stack.querySelector(key === "hook" ? ".sub-hook" : key === "mark" ? ".sub-mark" : ".sub-extra"),
        key
      );
      syncSwatches(key);
      save();
    });
    tools.querySelector("[data-native='bgOpacity']").addEventListener("input", (event) => {
      const key = selectedKey(stack);
      const el = stack.querySelector(layerSelector(key));
      ensureBgColor(key, el);
      state[key].bgOpacity = parseFloat(event.target.value);
      applyLayerLook(el, key);
      syncSwatches(key);
      save();
    });
    tools.querySelector("[data-native='radius']").addEventListener("input", (event) => {
      const key = selectedKey(stack);
      const el = stack.querySelector(layerSelector(key));
      ensureBgColor(key, el);
      state[key].radius = parseFloat(event.target.value);
      applyLayerLook(el, key);
      syncSwatches(key);
      save();
    });
    tools.querySelector("[data-native='tracking']").addEventListener("input", (event) => {
      const key = selectedKey(stack);
      state[key].letterSpacing = parseFloat(event.target.value);
      applyLayerLook(stack.querySelector(layerSelector(key)), key);
      save();
    });

    if (preview.dataset.deselectReady !== "1") {
      preview.dataset.deselectReady = "1";
      preview.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".sub-hook, .sub-mark, .sub-extra, .reels-handle")) return;
        clearSelect(stack);
      });
    }
    ensureStickerButton();
    ensureFontPicker(stack);
    ensureFaceRow(stack);
    syncLayerVisibility(stack, editor);
    if (preview.dataset.observeReady !== "1") {
      preview.dataset.observeReady = "1";
      let timer = 0;
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => boot(), 30);
      }).observe(stack, { childList: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.addEventListener("load", () => setTimeout(boot, 220));
})();
