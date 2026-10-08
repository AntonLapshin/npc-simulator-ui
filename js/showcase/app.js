// showcase/app.js — gallery view-model: binds the pure core (core.js:
// registry / select / URL + config codec) and the stage painter (stage.js)
// to the DOM — sidebar list, canvas stage, variant segmented control (decor
// views only — nothing rotates any more), a per-module configuration panel
// (character: emotion / skin / hair / pants / shoes / pose / speech / held
// props) and a props readout. Router-agnostic: syncs `?file=..&showcase=..`
// via window.history + popstate, mirroring AntonLapshin/showcase
// `useShowcase.ts`.

import {
  createShowcaseRegistry,
  createShowcaseState,
  select,
  encodeUrlPath,
  decodeUrlPath,
  decodeCfg,
  encodeCfg,
  applyCfg,
} from "./core.js";
import { STAGE, placement, paintStage } from "./stage.js";
import { showcaseFiles } from "./files.js";
import { variantProps } from "../render/objects/index.js";

// re-exported for tests / embedders (kept working after the stage split)
export { placement, paintStage, STAGE, applyCfg, decodeCfg };

/** Device-pixel-ratio-aware canvas fit (null when there is no 2D context). */
function fitCanvas(canvas) {
  try {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = STAGE.w * dpr;
    canvas.height = STAGE.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null; // headless DOM (plain jsdom): sidebar/seg still work
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  } catch {
    return null;
  }
}

/* ── configuration panel (character) ─────────────────────────────────── */

function buildControls(module, cfg, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "sc-cfg";
  const controls = module.controls || [];
  for (const ctl of controls) {
    const row = document.createElement("div");
    row.className = "sc-cfg-row";
    const lab = document.createElement("span");
    lab.className = "sc-cfg-label";
    lab.textContent = ctl.label;
    row.append(lab);

    if (ctl.type === "select") {
      const sel = document.createElement("select");
      for (const opt of ctl.options) {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        sel.append(o);
      }
      sel.dataset.key = ctl.key;
      sel.addEventListener("change", () => onChange(ctl, sel.value));
      row.append(sel);
    } else if (ctl.type === "swatches") {
      const box = document.createElement("div");
      box.className = "sc-swatches";
      box.dataset.key = ctl.key;
      ctl.options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.className = "sc-swatch";
        b.style.background = opt.color;
        b.title = opt.label;
        b.dataset.index = String(i);
        b.addEventListener("click", () => onChange(ctl, opt.value));
        box.append(b);
      });
      row.append(b);
    } else if (ctl.type === "toggle") {
      const b = document.createElement("button");
      b.className = "sc-toggle";
      b.dataset.key = ctl.key;
      b.textContent = "off";
      b.addEventListener("click", () => {
        const on = b.classList.toggle("on");
        b.textContent = on ? "on" : "off";
        onChange(ctl, on);
      });
      row.append(b);
    }
    wrap.append(row);
  }
  return wrap;
}

/** Reflect current props back into the widgets (after deep-link/apply). */
function syncControls(module, props, wrap) {
  for (const ctl of module.controls || []) {
    const cur = ctl.get(props);
    if (ctl.type === "select") {
      const sel = wrap.querySelector(`select[data-key="${ctl.key}"]`);
      if (sel) sel.value = cur;
    } else if (ctl.type === "swatches") {
      const box = wrap.querySelector(`.sc-swatches[data-key="${ctl.key}"]`);
      if (box) {
        for (const b of box.children) b.classList.toggle("on", Number(b.dataset.index) === cur);
      }
    } else if (ctl.type === "toggle") {
      const b = wrap.querySelector(`.sc-toggle[data-key="${ctl.key}"]`);
      if (b) {
        b.classList.toggle("on", Boolean(cur));
        b.textContent = cur ? "on" : "off";
      }
    }
  }
}

export function main() {
  if (typeof document === "undefined") return; // headless import (QA/tests)
  const registry = createShowcaseRegistry(showcaseFiles);
  const canvas = document.getElementById("scCanvas");
  const ctx = fitCanvas(canvas);
  const listEl = document.getElementById("scList");
  const titleEl = document.getElementById("scTitle");
  const subEl = document.getElementById("scSub");
  const segEl = document.getElementById("scSeg");
  const segNote = document.getElementById("scSegNote");
  const propsEl = document.getElementById("scProps");
  const countEl = document.getElementById("scCount");
  const cfgCard = document.getElementById("scCfgCard");
  const cfgBody = document.getElementById("scCfg");

  countEl.textContent = `${registry.files.length} objects`;

  // sidebar rows
  const rows = new Map();
  for (const f of registry.files) {
    const b = document.createElement("button");
    b.className = "sc-item";
    b.dataset.file = f.name;
    const dot = document.createElement("i");
    b.append(dot, document.createTextNode(f.name));
    b.addEventListener("click", () => apply(select(state, registry, f.name, firstVariant(f)), true));
    listEl.append(b);
    rows.set(f.name, b);
  }

  function firstVariant(f) {
    return Object.keys(f.showcases)[0];
  }

  let state = createShowcaseState();
  let cfg = decodeCfg(location.search);
  // initial selection from the URL (deep-linking), else the first file
  const initial = decodeUrlPath(location.search);
  state = select(state, registry, initial.file, initial.showcase);

  let cfgWrap = null;

  function render() {
    const file = registry.byName.get(state.file);
    const module = file.module;
    const props = placement(module, applyCfg(module, variantProps(module, state.showcase), cfg));
    // sidebar active
    rows.forEach((b, name) => b.classList.toggle("on", name === file.name));
    // header
    titleEl.textContent = file.name;
    subEl.textContent = `${module.name} · fixed view${module.name === "window" ? " · City/Hills views" : ""}`;
    // segmented control: one button per variant; hidden for single Default
    segEl.innerHTML = "";
    const variants = Object.keys(file.showcases);
    if (variants.length === 1 && variants[0] === "Default") {
      segEl.style.display = "none";
      segNote.style.display = "";
      segNote.textContent = "fixed view — no rotation";
    } else {
      segEl.style.display = "";
      segNote.style.display = "none";
      for (const v of variants) {
        const b = document.createElement("button");
        b.textContent = v;
        b.className = v === state.showcase ? "on" : "";
        b.setAttribute("role", "tab");
        b.addEventListener("click", () => apply(select(state, registry, file.name, v), true));
        segEl.append(b);
      }
    }
    // configuration panel (character only, for now)
    if (module.controls && module.controls.length) {
      cfgCard.style.display = "";
      if (!cfgWrap || cfgWrap.dataset.module !== module.name) {
        cfgBody.innerHTML = "";
        cfgWrap = buildControls(module, cfg, (ctl, value) => {
          cfg = { ...cfg, [ctl.key]: value };
          apply(select(state, registry, state.file, state.showcase), true);
        });
        cfgWrap.dataset.module = module.name;
        cfgBody.append(cfgWrap);
      }
      syncControls(module, props, cfgWrap);
    } else {
      cfgCard.style.display = "none";
      cfgWrap = null;
    }
    // stage + props (stage skipped headless — props + sidebar still render)
    if (ctx) {
      try {
        paintStage(ctx, module, props);
      } catch (err) {
        console.error(`[showcase:${module.name}]`, err);
      }
    }
    propsEl.textContent = JSON.stringify(props, null, 2);
  }

  function apply(next, push) {
    state = next;
    if (push) {
      const q = encodeUrlPath(state);
      const c = encodeCfg(cfg);
      const url = (q || location.pathname) + (c ? (q ? "&" : "?") + "cfg=" + encodeURIComponent(c) : "");
      history.pushState(state, "", url);
    }
    render();
  }

  window.addEventListener("popstate", (ev) => {
    if (ev.state && ev.state.file) {
      state = select(createShowcaseState(), registry, ev.state.file, ev.state.showcase);
    } else {
      const q = decodeUrlPath(location.search);
      state = select(createShowcaseState(), registry, q.file, q.showcase);
    }
    cfg = decodeCfg(location.search);
    cfgWrap = null;
    render();
  });

  // repaint once webfonts land so canvas text metrics are final
  (document.fonts?.ready ?? Promise.resolve()).then(() => render()).catch(() => {});
  render();
}

if (typeof window !== "undefined" && typeof document !== "undefined") main();
