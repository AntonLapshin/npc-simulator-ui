// tests/render.mjs — visual check without a browser: boots the real
// SceneRenderer in Node (jsdom provides the DOM, the `canvas` package
// provides 2D contexts) and saves scene frames as PNG.
//
// Usage: npm i --no-save jsdom canvas && npm run test:render
// Output: tests/out/scene-boot.png, tests/out/scene-poses.png

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const dom = new JSDOM(`<!doctype html><html><body>
<canvas id="scene" style="width:1040px"></canvas>
</body></html>`, { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;

const { SceneRenderer } = await import("../js/render/sceneRenderer.js");
const { getScene } = await import("../js/data/scenes/index.js");
const { SAMPLE_CHARS, SAMPLE_BUBBLES, SAMPLE_GENERIC_OBJECTS } = await import("../js/data/samples.js");
const { viewOptions } = await import("../js/render/viewOptions.js");

async function saveFrame(canvas, name) {
  const out = join(ROOT, "tests/out", name);
  await mkdir(join(ROOT, "tests/out"), { recursive: true });
  await writeFile(out, Buffer.from(canvas.toDataURL("image/png").split(",")[1], "base64"));
  console.log(`saved tests/out/${name} (${canvas.width}×${canvas.height})`);
}

console.log("render visual check (jsdom + canvas, no server needed)");

const canvas = document.getElementById("scene");
const renderer = new SceneRenderer(canvas, getScene("office_floor3"));
renderer.resize();
viewOptions.showNames = true;

const chars = SAMPLE_CHARS.map((c) => ({ ...c, look: { ...c.look } }));
const byId = new Map(chars.map((c) => [c.id, c]));
const bubbles = SAMPLE_BUBBLES.filter((b) => byId.has(b.actorId)).map((b) => {
  const v = byId.get(b.actorId);
  return { x: v.x, y: v.y, text: b.text, kind: b.kind, name: v.name, color: v.color };
});

renderer.render({ chars, bubbles, objects: SAMPLE_GENERIC_OBJECTS });
await saveFrame(canvas, "scene-boot.png");

/* every pose at once, spread across the floor */
const poseRow = ["stand", "sit", "kneel", "doggy", "prone"].map((pose, i) => ({
  ...chars[i % chars.length],
  id: "pose_" + pose,
  name: pose,
  isUser: false,
  pose,
  prop: null,
  emotion: "happy",
  x: 200 + i * 160,
  y: 620,
}));
// seated figures need a chair under them: put them on the desk-pod chairs
poseRow[1].x = 660; poseRow[1].y = 434;
renderer.render({ chars: poseRow, bubbles: [], objects: [] });
await saveFrame(canvas, "scene-poses.png");

console.log("scene frames OK — no runtime errors");
