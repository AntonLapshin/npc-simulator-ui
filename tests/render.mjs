// tests/render.mjs — visual check: boots scene.html in jsdom *with* the
// node-canvas backend and saves canvas frames to PNG so the 2.5D scene can
// be inspected without a browser.
//
// Usage: npm i --no-save jsdom canvas && npm start &
//        node tests/render.mjs   (serves scene.html from the static server)
// Output: tests/out/scene-boot.png, tests/out/scene-noah-n.png
//
// The page is plain ES modules (no bundle step in this project); jsdom
// loads them over HTTP from the local static server.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env["UI_BASE_URL"] || "http://localhost:8123";
const sleep = (ms) => new Promise((r) => setTimeout(ms));

async function open(path) {
  const errors = [];
  const virtualConsole = new VirtualConsole()
    .on("jsdomError", (e) => errors.push(String(e.message || e)))
    .on("error", (...a) => errors.push(a.join(" ")))
    .on("warn", () => {});
  const dom = await JSDOM.fromURL(BASE + path, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
  });
  return { dom, errors };
}

async function saveFrame(document, name) {
  const canvas = document.getElementById("scene");
  const dataUrl = canvas.toDataURL("image/png");
  const b64 = dataUrl.split(",")[1];
  const out = join(ROOT, "tests/out", name);
  await mkdir(join(ROOT, "tests/out"), { recursive: true });
  await writeFile(out, Buffer.from(b64, "base64"));
  console.log(`saved ${out} (${canvas.width}×${canvas.height})`);
}

console.log(`render visual check (jsdom + canvas ← ${BASE})`);

{
  const { dom, errors } = await open("/scene.html");
  const { document } = dom.window;
  await sleep(900); // boot + fonts + first frame
  await saveFrame(document, "scene-boot.png");
  const fatal = errors.filter((e) => !/Could not parse CSS/i.test(e));
  if (fatal.length) {
    console.error("jsdom errors:", fatal.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("scene.html OK — no runtime errors");
  }
  dom.window.close();
}

{
  const { dom, errors } = await open("/scene.html?scene=office_floor3&char=noah&dir=N&emotion=happy");
  const { document } = dom.window;
  await sleep(900);
  await saveFrame(document, "scene-noah-n.png");
  const fatal = errors.filter((e) => !/Could not parse CSS/i.test(e));
  if (fatal.length) {
    console.error("jsdom errors:", fatal.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("scene.html deep-link OK — no runtime errors");
  }
  dom.window.close();
}
