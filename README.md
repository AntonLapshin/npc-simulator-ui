# npc-simulator-ui

Standalone visual scene library for the NPC simulator: 2.5D office renderer,
object/character painters, object gallery and scene preview. It knows nothing
about the simulator engine — no `World`, `Actor` or `Scenario` types, no
network, no LLM. Everything is raw visual input: scenes, coordinates,
variants, characters.

Work here when you want to focus on visuals only: polish objects, characters
and scene variants, or add new objects.

```bash
npm start          # static server → http://localhost:8123/
npm test           # gallery registry + every object·pose draws (stub canvas)
npm run test:render  # real canvas frames → tests/out/*.png
                     # (needs: npm i --no-save jsdom canvas)
```

## Full-stack start (engine + Ollama + Laya + this UI)

From the sibling `../npc-simulator` checkout, one command boots everything —
Ollama, `laya-serve`, the engine-backed graphic console (`:8123`), plus this
project's gallery/preview on `:8124` (a separate port, since the engine
already owns `:8123`):

```bash
cd ../npc-simulator && npm start
# → console : http://localhost:8123/  (real engine: office-anton, ollama/stheno, --debug)
# → gallery : http://localhost:8124/showcase.html
# → preview : http://localhost:8124/scene.html
```

Defaults are `scenarios/office-anton.json --provider ollama
--model fluffy/l3-8b-stheno-v3.2 --debug`; override with e.g.
`npm start -- --model huihui_ai/llama3.2-abliterate:3b`,
`npm start -- --ui-port 8134`, or `--engine-only`. `npm start -- --help`
lists everything. Details live in `../npc-simulator/README.md`
("Quick start") and `../npc-simulator/scripts/start.sh`.

| page | purpose |
|---|---|
| `index.html` | landing: links to both views |
| `showcase.html` | isolated object gallery (Storybook-style, `?file=..&showcase=..&cfg=..`) |
| `scene.html` | full-scene preview from raw JSON (`?scene=..&char=..&pose=..&emotion=..`) |

---

## The view: 3/4 top-down, everything faces south

The projection is plan + vertical extrusion ("gem-flat 2.5D"): the floor maps
1:1 to screen, height extrudes straight up, so every object shows its top
face plus its **south** face. To keep the world readable nothing rotates:

* **Every object is built in one fixed orientation.** Chairs, sofas, desks,
  counters, cabinets… all face south — the camera looks at their front.
  Legacy `dir` fields in scene data are accepted and ignored.
* **The laptop is the only north-facing object:** a person sits south of it
  in a desk chair (facing south at the desk… see the office scene), so the
  camera always sees the **lid back** + hinge + a sliver of the base.
* **Characters always face south (down).** There is no character rotation;
  body language comes from *poses* instead.

### Character poses

| pose | read |
|---|---|
| `stand` | upright, front view |
| `sit` | seated on a chair (seat plane `y-26`); the chair is a scene asset — the showcase composes one automatically |
| `kneel` | seiza on the floor, profile, always faces **left** |
| `doggy` | on hands & knees, profile, always faces **left** |
| `prone` | lying face down, top view, head turned **left** (cheek shows) |

Seated characters sort after their chair in painters order, so they paint
in front of the backrest.

### Character configuration (showcase)

The gallery's Character page exposes a config panel (deep-linked via `cfg`):
**pose · emotion · skin · hair style · hair color · pants · shoes ·
hold cup · hold laptop · speech bubble**. A held laptop shows its lid back
(laptops face north); with both props on, the laptop is held and the mug
stands on the floor. `speech` paints a `drawBubble` say-bubble over the head.

---

## Raw input contract

```js
import { SceneRenderer, getScene } from "./js/render/index.js";

const renderer = new SceneRenderer(canvas, getScene("office_floor3"));
renderer.render({
  chars: [{ id, name, color, look, prop, x, y, pose, emotion, visible, isUser }],
  bubbles: [{ x, y, text, kind /* "say" | "thought" */, name, color, alpha? }],
  objects: [{ id, name, x, y, w, h, passable, blocksVision }], // fallback boxes
});
renderer.setScene(getScene("other_id")); // swap scenery
renderer.setNames(on);   // name plates
renderer.setZones(on);   // zone overlays (repaints the cached background)
```

* `pose` is one of `stand | sit | kneel | doggy | prone` (default `stand`).
  A legacy `dir` field is tolerated and ignored — nobody rotates.
* `prop` is `"cup" | "laptop" | null` (floor poses put the prop on the floor
  in front of the character).
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
    character.js       poses, faces per emotion, hair, mood FX, name plates
    bubble.js          speech & thought bubbles with collision placement
    avatar.js          small portraits (reuses character.js)
    assets.js          back-compat re-export (see objects/)
    viewOptions.js     Names / Zones toggles
    objects/           ONE FILE PER OBJECT (gallery source of truth)
      direction.js     legacy N/E/S/W normalizer (kept for old world data)
      index.js         registry: OBJECTS, ASSET_DRAW, showcaseFiles, variantProps
      desk.js …        one module per object (see "Adding an object")
  data/
    scenes/officeFloor3.js   bundled pretty-office scene DATA (no painters)
    scenes/index.js          scene registry: getScene(id)
    samples.js               editable raw cast/bubbles for scene.html
  showcase/            gallery app (core: pure registry/URL codec, no DOM)
  scene/preview.js     scene.html workbench (scene/char/pose/emotion controls)
styles/  base.css (tokens) · showcase.css (gallery) · scene.css (preview)
tools/serve.mjs        zero-dependency static server
tests/
  showcase.mjs         registry, URL codec, every object·pose draws (stub ctx)
  render.mjs           visual check: scene frames saved as PNG (jsdom+canvas)
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
     draw(c, p) { /* paint centered on p.x/p.y, front face south */ },
     sortY(p) { return p.y; }, // painters order: southern-most floor edge wins
     showcaseScale: 1.5, // optional gallery zoom (scene renders stay 1:1)
   };
   ```
   **Draw it facing south** — top face + south face, no rotation, no
   direction variants. (North-facing lids are a laptop privilege.)
2. Register it in `js/render/objects/index.js` (`OBJECT_MODULES`, sidebar
   order: furniture → scenery → character).
3. Open `showcase.html` — the gallery picks it up automatically, including
   `?file=..&showcase=..` deep links. Objects with a single `Default`
   variant show a "fixed view — no rotation" note instead of a switcher.
4. Run `npm test` — every variant is drawn with a stub context.

## Adding a scene variant

Scene files are pure data (no painter code): copy the shape of
`js/data/scenes/officeFloor3.js`, register the id in `js/data/scenes/index.js`
(`SCENES`), and it appears in the `scene.html` selector. New scenes should
reuse the existing object `asset` names so no new painters are needed, and
place sitters **north** of their desk/chair facing south.

## Relation to npc-simulator

The simulator (`../npc-simulator`, sibling checkout) consumes this project as
its scene layer: its `src/ui/graphic/js/scene/ui.js` bridge re-exports
`SceneRenderer` and friends through a `ui-lib` link, while panels, timeline,
composer, adapters and the engine stay on its side. This project never imports
from there — keep it that way.
