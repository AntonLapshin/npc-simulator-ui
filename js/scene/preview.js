// scene/preview.js — raw-input scene preview (scene.html).
//
// Standalone visual workbench: pick a registered scene, move characters
// around by facing/emotion, toggle sample bubbles — no engine, no network.
// Selection deep-links via ?scene=..&char=..&pose=..&emotion=.. so a visual
// state can be shared as a URL, exactly like the object gallery.

import { SceneRenderer } from "../render/sceneRenderer.js";
import { getScene, sceneIds, OFFICE_FLOOR3_ID } from "../data/scenes/index.js";
import { SAMPLE_CHARS, SAMPLE_BUBBLES, EMPTY_STUDIO_SCENE, SAMPLE_GENERIC_OBJECTS } from "../data/samples.js";
import { POSES, POSE_TITLES } from "../render/character.js";
import { EMOTIONS } from "../render/objects/character.js";

const SCENE_ALIASES = { empty: EMPTY_STUDIO_SCENE };

function sceneById(id) {
  if (SCENE_ALIASES[id]) return { id, scene: SCENE_ALIASES[id], name: SCENE_ALIASES[id].meta.name };
  const scene = getScene(id);
  return scene ? { id, scene, name: scene.meta.name } : null;
}

function allSceneIds() {
  return [...sceneIds(), ...Object.keys(SCENE_ALIASES)];
}

function decodeSelection(search) {
  const q = new URLSearchParams(String(search || "").replace(/^[?#]/, ""));
  return {
    scene: q.get("scene"),
    char: q.get("char"),
    pose: q.get("pose"),
    emotion: q.get("emotion"),
    bubbles: q.get("bubbles"),
  };
}

function encodeSelection(sel) {
  const q = new URLSearchParams();
  if (sel.scene) q.set("scene", sel.scene);
  if (sel.char) q.set("char", sel.char);
  if (sel.pose) q.set("pose", sel.pose);
  if (sel.emotion) q.set("emotion", sel.emotion);
  if (sel.bubbles === "0") q.set("bubbles", "0");
  const s = q.toString();
  return s ? `?${s}` : "";
}

function main() {
  const canvas = document.getElementById("scene");
  const sceneSel = document.getElementById("pvScene");
  const charSel = document.getElementById("pvChar");
  const poseSel = document.getElementById("pvPose");
  const emoSel = document.getElementById("pvEmotion");
  const propsEl = document.getElementById("pvProps");
  const countEl = document.getElementById("pvCount");
  const tgNames = document.getElementById("tgNames");
  const tgBubbles = document.getElementById("tgBubbles");

  // deep-copied working state — the page owns it, nothing else mutates it
  const chars = SAMPLE_CHARS.map((c) => ({ ...c, look: { ...c.look } }));

  const initial = decodeSelection(location.search);
  let sceneEntry = sceneById(initial.scene) || sceneById(OFFICE_FLOOR3_ID) || sceneById(allSceneIds()[0]);
  let selChar = chars.find((c) => c.id === initial.char) || chars[0];
  if (initial.pose && POSES.includes(initial.pose)) selChar.pose = initial.pose;
  if (initial.emotion && EMOTIONS.includes(initial.emotion)) selChar.emotion = initial.emotion;
  let showBubbles = initial.bubbles !== "0";

  const renderer = new SceneRenderer(canvas, sceneEntry.scene);

  for (const id of allSceneIds()) {
    const entry = sceneById(id);
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = entry.name;
    sceneSel.append(opt);
  }
  sceneSel.value = sceneEntry.id;

  for (const c of chars) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    charSel.append(opt);
  }
  charSel.value = selChar.id;

  for (const e of EMOTIONS) {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    emoSel.append(opt);
  }
  emoSel.value = selChar.emotion;

  for (const p of POSES) {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = POSE_TITLES[p] || p;
    poseSel.append(opt);
  }
  poseSel.value = selChar.pose || "stand";

  function syncUrl() {
    const sel = {
      scene: sceneEntry.id,
      char: selChar.id,
      pose: selChar.pose || "stand",
      emotion: selChar.emotion,
      bubbles: showBubbles ? "1" : "0",
    };
    history.replaceState(sel, "", encodeSelection(sel) || location.pathname);
  }

  function snapshot() {
    const byId = new Map(chars.map((c) => [c.id, c]));
    const bubbles = showBubbles
      ? SAMPLE_BUBBLES.filter((b) => byId.has(b.actorId)).map((b) => {
          const v = byId.get(b.actorId);
          return { x: v.x, y: v.y, text: b.text, kind: b.kind, name: v.name, color: v.color };
        })
      : [];
    return { chars, bubbles, objects: SAMPLE_GENERIC_OBJECTS };
  }

  function render() {
    poseSel.value = selChar.pose || "stand";
    emoSel.value = selChar.emotion;
    countEl.textContent = `${chars.length} characters · ${sceneEntry.name}`;
    propsEl.textContent = JSON.stringify(selChar, null, 2);
    renderer.render(snapshot());
  }

  sceneSel.addEventListener("change", () => {
    sceneEntry = sceneById(sceneSel.value) || sceneEntry;
    renderer.setScene(sceneEntry.scene);
    renderer.resize();
    syncUrl();
    render();
  });
  charSel.addEventListener("change", () => {
    selChar = chars.find((c) => c.id === charSel.value) || selChar;
    emoSel.value = selChar.emotion;
    poseSel.value = selChar.pose || "stand";
    syncUrl();
    render();
  });
  emoSel.addEventListener("change", () => {
    selChar.emotion = emoSel.value;
    syncUrl();
    render();
  });
  poseSel.addEventListener("change", () => {
    selChar.pose = poseSel.value;
    syncUrl();
    render();
  });

  tgNames.addEventListener("click", () => {
    const on = tgNames.classList.toggle("on");
    renderer.setNames(on);
    render();
  });
  tgBubbles.addEventListener("click", () => {
    showBubbles = !showBubbles;
    tgBubbles.classList.toggle("on", showBubbles);
    syncUrl();
    render();
  });
  tgBubbles.classList.toggle("on", showBubbles);

  try {
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        renderer.resize();
        render();
      }).observe(document.getElementById("stage"));
    }
  } catch (err) {
    console.error("[resize-observer]", err);
  }
  window.addEventListener("resize", () => {
    renderer.resize();
    render();
  });

  renderer.resize();
  (document.fonts?.ready ?? Promise.resolve())
    .then(() => {
      renderer.repaintBackground();
      render();
    })
    .catch(() => {});
  syncUrl();
  render();
}

main();
