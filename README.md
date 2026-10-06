# npc-simulator-ui

Standalone visual scene library for the NPC simulator: 2.5D office renderer,
object/character painters, object gallery and scene preview. It knows nothing
about the simulator engine — no `World`, `Actor` or `Scenario` types, no
network, no LLM. Everything is raw visual input: scenes, coordinates,
variants, directions, characters.

Work here when you want to focus on visuals only: polish objects, characters
and scene variants, or add new objects.

```bash
npm start          # static server → http://localhost:8123/
npm test           # gallery registry + every object·variant draws (stub canvas)
npm run test:render  # real canvas frames → tests/out/*.png
                     # (needs: npm i --no-save jsdom canvas; server running)
```

| page | purpose |
|---|---|
| `index.html` | landing: links to both views |
| `showcase.html` | isolated object gallery (Storybook-style, `?file=..&showcase=..`) |
| `scene.html` | full-scene preview from raw JSON (`?scene=..&char=..&dir=..&emotion=..`) |

---

## Raw input contract

```js
import { SceneRenderer, getScene } from "./js/render/index.js";

const renderer = new SceneRenderer(canvas, getScene("office_floor3"));
renderer.render({
  chars: [{ id, name, color, look, prop, x, y, dir, emotion, visible, isUser }],
  bubbles: [{ x, y, text, kind /* "say" | "thought" */, name, color, alpha? }],
  objects: [{ id, name, x, y, w, h, passable, blocksVision }], // fallback boxes
});
renderer.setScene(getScene("other_id")); // swap scenery
renderer.setNames(on);   // name plates
renderer.setZones(on);   // zone overlays (repaints the cached background)
```

* `dir` is a plan facing: `"up" | "down" | "left" | "right"`. The gallery's
  `N / E / S / W` variants map onto these (`N→up, E→right, S→down, W→left` —
  see `js/render/objects/direction.js`).
* `look` is `{ skin, skin2, hair, hairStyle, shirt, shirt2, pants, shoes }`.
* A scene is `{ meta, floor, corridor, walls, windows, door, wallDecor,
  floorDecals, lightPatches, assets }`. Coordinates are 1040×730 view units
  with `x/y` as the footprint **center** (except walls/windows/door, which
  use top-left rects on the wall band).
* Scene object `id`s already painted as `assets` are skipped by the
  fallback path; anything else in `objects` renders as a labelled generic
  box, so unknown content still shows up.

`js/data/samples.js` holds editable sample cast/bubbles/scenes for
`scene.html` — change looks there and refresh, no rebuild.

## Project layout

```
index.html / showcase.html / scene.html   standalone pages (native ES modules)
js/
  render/index.js      public API: SceneRenderer, painters, scenes, utils
  core/utils.js        math/color/canvas helpers + the 2.5D projection model
  render/
    sceneRenderer.js   canvas host, resize, frame pipeline, generic fallback
    background.js      cached background layer (composes objects/* painters)
    character.js       bodies, hair, emotion faces, mood FX, name plates
    bubble.js          speech & thought bubbles with collision placement
    avatar.js          small portraits (reuses character.js)
    assets.js          back-compat re-export (see objects/)
    viewOptions.js     Names / Zones toggles
    objects/           ONE FILE PER OBJECT (gallery source of truth)
      direction.js     shared N/E/S/W normalizer + COMPASS_VARIANTS
      index.js         registry: OBJECTS, ASSET_DRAW, showcaseFiles, variantProps
      desk.js …        one module per object (see "Adding an object")
  data/
    scenes/officeFloor3.js   bundled pretty-office scene DATA (no painters)
    scenes/index.js          scene registry: getScene(id)
    samples.js               editable raw cast/bubbles for scene.html
  showcase/            gallery app (core: pure registry/URL codec, no DOM)
  scene/preview.js     scene.html workbench (scene/char/dir/emotion controls)
styles/  base.css (tokens) · showcase.css (gallery) · scene.css (preview)
tools/serve.mjs        zero-dependency static server
tests/
  showcase.mjs         registry, URL codec, every object·variant draws (stub ctx)
  render.mjs           visual check: scene.html frames saved as PNG
```

## Adding an object

1. Create `js/render/objects/<thing>.js` exporting one uniquely-named
   showcase module (single-export pattern — files concatenate in some
   consumers, so generic `draw`/`name` exports would collide):
   ```js
   import { gemBox } from "../../core/utils.js";
   export const Thing = {
     name: "thing", title: "Thing",
     supportsDirection: false, variants: ["Default"],
     defaultProps: { asset: "thing", id: "thing", x: 0, y: 0 /* … */ },
     draw(c, p) { /* paint centered on p.x/p.y */ },
     sortY(p) { return p.y; }, // painters order: southern-most floor edge wins
   };
   ```
   Rotatable objects set `supportsDirection: true`, `variants:
   COMPASS_VARIANTS` and read `p.dir` (`N/E/S/W`, via `normDir`).
2. Register it in `js/render/objects/index.js` (`OBJECT_MODULES`, sidebar
   order: furniture → scenery → character).
3. Open `showcase.html` — the gallery picks it up automatically, including
   the `N / E / S / W` segmented control and `?file=..&showcase=..` links.
4. Run `npm test` — every variant is drawn with a stub context.

## Adding a scene variant

Scene files are pure data (no painter code): copy the shape of
`js/data/scenes/officeFloor3.js`, register the id in `js/data/scenes/index.js`
(`SCENES`), and it appears in the `scene.html` selector. New scenes should
reuse the existing object `asset` names so no new painters are needed.

## Relation to npc-simulator

The simulator (`../npc-simulator`, sibling checkout) consumes this project as
its scene layer: its `src/ui/graphic/js/scene/ui.js` bridge re-exports
`SceneRenderer` and friends through a `ui-lib` link, while panels, timeline,
composer, adapters and the engine stay on its side. This project never imports
from there — keep it that way.
