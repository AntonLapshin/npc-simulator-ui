// showcase/app.js — thin gallery view-model (showcase pattern).
//
// Binds the pure core (core.js: registry / select / URL codec) to the DOM:
// sidebar list, canvas stage, variant segmented control (decor views only —
// nothing rotates any more), a per-module configuration panel (character:
// emotion / skin / hair / pants / shoes / pose / speech / held props) and a
// props readout. Router-agnostic: syncs `?file=..&showcase=..&cfg=..` via
// window.history + popstate, mirroring AntonLapshin/showcase `useShowcase.ts`.

import {
  createShowcaseRegistry,
  createShowcaseState,
  select,
  encodeUrlPath,
  decodeUrlPath,
} from "./core.js";
import { showcaseFiles } from "./files.js";
import { variantProps } from "../render/objects/index.js";
import { drawBubble } from "../render/bubble.js";

const STAGE = { w: 560, h: 400 };

/** Wall-mounted pieces hang in the upper half; floor pieces stand lower. */
const WALL_MOUNTED = new Set(["wall", "window", "door", "whiteboard", "clock", "poster"]);

function placement(module, props) {
  const p = { ...props };
  if (WALL_MOUNTED.has(module.name)) {
    const w = p.w || 180;
    p.x = STAGE.w / 2 - w / 2;
    // Wall segments paint downward from y; decor hangs near the top.
    p.y = module.name === "wall" ? 150 : 130;
    if (module.name === "clock") {
      p.x = STAGE.w / 2;
      p.y = 150;
    }
    if (module.name === "door") {
      p.x = STAGE.w / 2 - p.w / 2;
      p.y = 170;
    }
    return p;
  }
  if (module.name === "rug" || module.name === "zone") {
    p.x = STAGE.w / 2;
    p.y = STAGE.h / 2;
    return p;
  }
  if (module.name === "character") {
    p.x = STAGE.w / 2;
    p.y = Math.round(STAGE.h * 0.78);
    return p;
  }
  p.x = STAGE.w / 2;
  p.y = Math.round(STAGE.h * 0.62);
  return p;
}

function paintStage(ctx, module, props) {
  const { w: W, h: H } = STAGE;
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0d1526");
  bg.addColorStop(1, "#080d18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // faint studio grid
  ctx.strokeStyle = "rgba(255,255,255,.045)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
  // gallery zoom around the placement anchor (scene renders stay 1:1)
  const zs = module.showcaseScale || 1;
  ctx.save();
  if (zs !== 1) {
    ctx.translate(props.x, props.y);
    ctx.scale(zs, zs);
    ctx.translate(-props.x, -props.y);
  }
  // floor line for standing objects (inside the zoom so it stays glued)
  if (!WALL_MOUNTED.has(module.name) && module.name !== "rug" && module.name !== "zone") {
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1.5 / zs;
    ctx.beginPath();
    ctx.moveTo(40, props.y + 14.5);
    ctx.lineTo(W - 40, props.y + 14.5);
    ctx.stroke();
  }
  let stageErr = null;
  try {
    module.draw(ctx, props);
    // optional speech bubble (character config)
    if (props.speech) {
      drawBubble(ctx, {
        x: props.x, y: props.y - (props.pose === "prone" ? 26 : 0),
        text: props.speechText || "Hi! Nice to meet you.",
        kind: "say", name: props.name || "NPC", color: props.color || "#4f7cff",
      }, [], STAGE);
    }
  } catch (err) {
    stageErr = err;
  }
  ctx.restore();
  if (stageErr) {
    console.error(`[showcase:${module.name}]`, stageErr);
    ctx.fillStyle = "#ff5d7a";
    ctx.font = "600 13px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`render error: ${stageErr.message}`, W / 2, H / 2);
    ctx.textAlign = "left";
  }
}

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

function decodeCfg(search) {
  const q = new URLSearchParams(String(search || "").replace(/^[?#]/, ""));
  const raw = q.get("cfg");
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function encodeCfg(cfg) {
  return Object.keys(cfg).length ? JSON.stringify(cfg) : null;
}

/** Apply stored config values on top of module defaults (in props order). */
function applyCfg(module, props, cfg) {
  const controls = module.controls || [];
  for (const ctl of controls) {
    if (ctl.key in cfg) ctl.apply(props, cfg[ctl.key]);
  }
  return props;
}

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
      row.append(box);
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

export { placement, paintStage, STAGE, applyCfg, decodeCfg };

if (typeof window !== "undefined" && typeof document !== "undefined") main();
