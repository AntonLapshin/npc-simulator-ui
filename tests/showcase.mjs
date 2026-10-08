// tests/showcase.mjs — gallery registry + isolated object render smoke test.
// Runs without a DOM: validates the showcase registry (showcase pattern),
// the URL codec, and calls every object's draw() with a stub 2D context.
// Usage: node tests/showcase.mjs

import assert from "node:assert/strict";
import { OBJECT_MODULES, OBJECTS, variantProps, drawAsset, assetSortY } from "../js/render/objects/index.js";
import { showcaseFiles } from "../js/showcase/files.js";
import {
  createShowcaseRegistry,
  createShowcaseState,
  select,
  encodeUrlPath,
  decodeUrlPath,
} from "../js/showcase/core.js";

/** Minimal stub 2D context: every method is a no-op, gradients are dummies. */
function stubCtx() {
  const grad = { addColorStop() {} };
  return new Proxy(
    { canvas: { width: 560, height: 400 }, measureText: () => ({ width: 10 }) },
    {
      get(t, k) {
        if (k in t) return t[k];
        if (k === "createLinearGradient" || k === "createRadialGradient") return () => grad;
        return () => {};
      },
      set() {
        return true;
      },
    },
  );
}

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err.stack || err.message}`);
    process.exitCode = 1;
  }
}

console.log("showcase tests (registry + isolated objects)");

await test("every object module exposes showcase metadata", () => {
  assert.ok(OBJECT_MODULES.length >= 24, `expected ≥24 objects, got ${OBJECT_MODULES.length}`);
  const names = new Set();
  for (const m of OBJECT_MODULES) {
    assert.equal(typeof m.name, "string", "name");
    assert.equal(typeof m.title, "string", `title (${m.name})`);
    assert.equal(typeof m.supportsDirection, "boolean", `supportsDirection (${m.name})`);
    assert.ok(Array.isArray(m.variants) && m.variants.length > 0, `variants (${m.name})`);
    assert.equal(typeof m.defaultProps, "object", `defaultProps (${m.name})`);
    assert.equal(typeof m.draw, "function", `draw (${m.name})`);
    assert.equal(typeof m.sortY, "function", `sortY (${m.name})`);
    assert.ok(!names.has(m.name), `duplicate object name: ${m.name}`);
    names.add(m.name);
  }
});

await test("nothing rotates — every object is a fixed south-facing view", () => {
  for (const m of OBJECT_MODULES) {
    assert.equal(m.supportsDirection, false, `${m.name} must not rotate`);
    assert.deepEqual(m.variants.filter((v) => ["N", "E", "S", "W"].includes(v)), [],
      `${m.name} must not expose compass variants`);
  }
  // the window's City/Hills are decor views, not directions
  assert.deepEqual(OBJECTS.window.variants, ["City", "Hills"]);
});

await test("character exposes the showcase configuration panel", () => {
  const m = OBJECTS.character;
  const keys = m.controls.map((c) => c.key);
  for (const k of ["pose", "emotion", "skin", "hairStyle", "hair", "pants", "shoes", "holdCup", "holdLaptop", "speech"]) {
    assert.ok(keys.includes(k), `control '${k}' present`);
  }
  const poseCtl = m.controls.find((c) => c.key === "pose");
  assert.deepEqual(poseCtl.options.map((o) => o.value),
    ["stand", "sit", "kneel", "doggy", "prone"]);
});

await test("every character pose × prop draws without throwing", () => {
  const c = stubCtx();
  const m = OBJECTS.character;
  for (const pose of ["stand", "sit", "kneel", "doggy", "prone"]) {
    for (const prop of [null, "cup", "laptop"]) {
      const p = { ...m.defaultProps, pose, prop, holdCup: prop === "cup", holdLaptop: prop === "laptop", x: 280, y: 300 };
      m.draw(c, p);
      assert.equal(typeof m.sortY(p), "number");
    }
  }
  // config apply/get round-trip through the controls
  const p = { ...m.defaultProps, look: { ...m.defaultProps.look } };
  const emo = m.controls.find((c2) => c2.key === "emotion");
  emo.apply(p, "happy");
  assert.equal(emo.get(p), "happy");
  const skin = m.controls.find((c2) => c2.key === "skin");
  skin.apply(p, skin.options[3].value);
  assert.equal(skin.get(p), 3);
  const cup = m.controls.find((c2) => c2.key === "holdCup");
  cup.apply(p, true);
  assert.equal(p.prop, "cup");
  const lap = m.controls.find((c2) => c2.key === "holdLaptop");
  lap.apply(p, true);
  assert.equal(p.prop, "laptop"); // laptop wins when both are held
});

await test("registry validates files ( dupes / empty rejected )", () => {
  const reg = createShowcaseRegistry(showcaseFiles);
  assert.equal(reg.files.length, OBJECT_MODULES.length);
  assert.throws(() => createShowcaseRegistry([]), /at least one file/);
  assert.throws(
    () => createShowcaseRegistry([...showcaseFiles, showcaseFiles[0]]),
    /duplicate file name/,
  );
  assert.throws(() => createShowcaseRegistry([{ name: "x", showcases: {} }]), /no showcases/);
});

await test("select falls back, encode/decode round-trips (incl. spaces)", () => {
  const reg = createShowcaseRegistry(showcaseFiles);
  let s = select(createShowcaseState(), reg, "Window", "Hills");
  assert.equal(s.file, "Window");
  assert.equal(s.showcase, "Hills");
  // unknown names fall back instead of throwing (user-supplied URLs)
  s = select(createShowcaseState(), reg, "nope", "W");
  assert.equal(s.file, reg.files[0].name);
  s = select(createShowcaseState(), reg, "Window", "nope");
  assert.equal(s.showcase, reg.byName.get("Window") && Object.keys(reg.byName.get("Window").showcases)[0]);
  // round-trip with a spaced name
  const rt = select(createShowcaseState(), reg, "Round Table", "Default");
  const q = encodeUrlPath(rt);
  assert.match(q, /file=Round(%20|\+)Table/);
  const back = decodeUrlPath(q);
  assert.equal(back.file, "Round Table");
  assert.equal(back.showcase, "Default");
});

await test("every object draws every variant without throwing", () => {
  const c = stubCtx();
  let count = 0;
  for (const m of OBJECT_MODULES) {
    for (const v of m.variants) {
      const props = { ...variantProps(m, v), x: 280, y: 248 };
      m.draw(c, props); // must not throw
      const k = m.sortY(props);
      assert.equal(typeof k, "number", `sortY number (${m.name}/${v})`);
      count++;
    }
  }
  console.log(`    (drew ${count} object·variant pairs)`);
});

await test("compat layer draws via asset key (legacy dir fields ignored)", () => {
  const c = stubCtx();
  drawAsset(c, { asset: "chair", x: 10, y: 10, dir: "N", color: "#fff" }); // dir ignored
  drawAsset(c, { asset: "desk", x: 10, y: 10 });
  drawAsset(c, { asset: "nope" }); // unknown types are silently skipped
  assert.equal(assetSortY({ asset: "chair", x: 0, y: 100 }), 116);
});

console.log(`\n${passed} showcase test group(s) passed`);
if (process.exitCode) console.error("SHOWCASE TESTS FAILED");
