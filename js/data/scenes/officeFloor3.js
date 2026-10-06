// data/scenes/officeFloor3.js — the bundled pretty-office scene (DATA ONLY).
//
// This used to live inline in data/staticScene.js. It is now one entry in the
// scene registry (data/scenes/index.js): the renderer never imports it
// directly, scenes are selected by id (`staticScene: "office_floor3"`).
// No painter code lives here — just footprint/colour data composed from the
// per-object defaults in js/render/objects/.

export const OFFICE_FLOOR3_ID = "office_floor3";

export const OFFICE_FLOOR3_SCENE = {
  meta: {
    name: "Northlight Studio · Floor 3",
    style: "gem-flat 2.5D",
    projection: "plan + vertical extrusion",
    world: { w: 1040, h: 730 },
  },
  floor: { x: 60, y: 110, w: 920, h: 550, plank: 56, base: "#efe3cf", tone: "#e6d8bf" },
  corridor: { x: 480, y: 680, w: 40, h: 50, color: "#1b2438" },
  walls: [
    { id: "wN", x: 40, y: 90, w: 960, h: 20, height: 70, face: "#dfe5f2", top: "#f4f7fd", layer: "back" },
    { id: "wW", x: 40, y: 90, w: 20, h: 590, height: 70, face: "#d3dae9", top: "#eef2fa", layer: "back" },
    { id: "wE", x: 980, y: 90, w: 20, h: 590, height: 70, face: "#cbd3e4", top: "#e8edf8", layer: "back" },
    { id: "wSa", x: 40, y: 660, w: 440, h: 20, height: 16, face: "#c4cde0", top: "#e6ebf6", layer: "front" },
    { id: "wSb", x: 520, y: 660, w: 480, h: 20, height: 16, face: "#c4cde0", top: "#e6ebf6", layer: "front" },
  ],
  windows: [
    { id: "win1", wall: "wN", x: 110, y: 50, w: 180, h: 46, view: "city" },
    { id: "win2", wall: "wN", x: 400, y: 50, w: 170, h: 46, view: "city" },
    { id: "win3", wall: "wN", x: 650, y: 50, w: 180, h: 46, view: "hills" },
  ],
  door: { id: "door1", x: 480, y: 660, w: 40, h: 20, frame: "#8f6b45", label: "ENTRANCE" },
  wallDecor: [
    { id: "board1", asset: "whiteboard", x: 852, y: 48, w: 132, h: 50, ink: "#4f7cff" },
    { id: "clock1", asset: "clock", x: 333, y: 64, r: 15 },
    { id: "poster1", asset: "poster", x: 588, y: 50, w: 36, h: 46, color: "#ff5d7a" },
  ],
  floorDecals: [
    { id: "rugLounge", asset: "rug", x: 205, y: 285, w: 290, h: 215, color: "#4f7cff", trim: "#9b6cf5" },
    { id: "rugEntrance", asset: "rug", x: 500, y: 616, w: 120, h: 76, color: "#2ec4a6", trim: "#ffb648" },
    { id: "zoneDesk", asset: "zone", x: 770, y: 390, w: 400, h: 330, color: "#ffb648", label: "DESK POD · A/B" },
    { id: "zoneLounge", asset: "zone", x: 205, y: 285, w: 300, h: 230, color: "#4f7cff", label: "LOUNGE" },
    { id: "zoneKitchen", asset: "zone", x: 520, y: 170, w: 260, h: 110, color: "#2ec4a6", label: "KITCHEN" },
  ],
  lightPatches: [{ x: 110, w: 180 }, { x: 400, w: 170 }, { x: 650, w: 180 }],

  assets: [
    /* ── lounge (sofa + table, everything faces south) ─────────── */
    { id: "sofa", asset: "sofa", x: 205, y: 205, w: 132, d: 62, color: "#9b6cf5" },
    { id: "tbl_lounge", asset: "roundTable", x: 205, y: 300, r: 74, h: 42, t: 9, color: "#f7f0e4", edge: "#c9b694" },
    { id: "ch_l2", asset: "chair", x: 116, y: 300, color: "#9b6cf5" },
    { id: "ch_l3", asset: "chair", x: 294, y: 300, color: "#2ec4a6" },
    { id: "cup_l1", asset: "cup", x: 178, y: 290, z: 42, color: "#ff5d7a", sort: 333.6 },
    { id: "cup_l2", asset: "cup", x: 238, y: 314, z: 42, color: "#4f7cff", sort: 333.7 },
    { id: "notes", asset: "papers", x: 206, y: 302, z: 42, sort: 333.8 },

    /* ── kitchen (counter against the north wall, fronts south) ── */
    { id: "counter", asset: "counter", x: 520, y: 158, w: 242, d: 58, h: 58, color: "#eaeef7", top: "#2b3550" },
    { id: "coffee", asset: "coffeeMachine", x: 452, y: 152, z: 58, sort: 187.2 },
    { id: "kettle", asset: "kettle", x: 536, y: 150, z: 58, color: "#ff5d7a", sort: 187.3 },
    { id: "cups", asset: "cupRow", x: 602, y: 154, z: 58, sort: 187.4 },
    { id: "cooler", asset: "waterCooler", x: 372, y: 170, w: 44, d: 42, h: 48 },
    { id: "stool1", asset: "stool", x: 474, y: 244, color: "#ffb648" },
    { id: "stool2", asset: "stool", x: 560, y: 244, color: "#2ec4a6" },

    /* ── west wall / storage ───────────────────────────────────── */
    { id: "cabinet", asset: "cabinet", x: 160, y: 546, w: 190, d: 60, h: 68, color: "#5b6b8c" },
    { id: "crates", asset: "crates", x: 296, y: 524, color: "#c98a5e" },
    { id: "printer", asset: "printer", x: 330, y: 600, w: 92, d: 64, h: 46, color: "#dfe5f0" },
    { id: "plant5", asset: "plant", x: 386, y: 520, s: 0.85, pot: "#2ec4a6" },

    /* ── desk pod (chairs north of desks, facing south; laptops
          face north so the camera sees their lid backs) ────────── */
    { id: "deskA1", asset: "desk", x: 660, y: 280, w: 170, d: 76, h: 44, t: 10, color: "#f4ece0", edge: "#c9b694" },
    { id: "deskA2", asset: "desk", x: 860, y: 280, w: 170, d: 76, h: 44, t: 10, color: "#f4ece0", edge: "#c9b694" },
    { id: "deskB1", asset: "desk", x: 660, y: 500, w: 170, d: 76, h: 44, t: 10, color: "#f4ece0", edge: "#c9b694" },
    { id: "deskB2", asset: "desk", x: 860, y: 500, w: 170, d: 76, h: 44, t: 10, color: "#f4ece0", edge: "#c9b694" },

    { id: "chA1", asset: "chair", x: 660, y: 214, color: "#2ec4a6" },
    { id: "chA2", asset: "chair", x: 860, y: 214, color: "#4f7cff" },
    { id: "chB1", asset: "chair", x: 660, y: 434, color: "#9b6cf5" },
    { id: "chB2", asset: "chair", x: 860, y: 434, color: "#ff5d7a" },

    { id: "lapA1", asset: "laptop", x: 660, y: 262, z: 44, sort: 318.2 },
    { id: "lapA2", asset: "laptop", x: 860, y: 262, z: 44, sort: 318.3 },
    { id: "lapB1", asset: "laptop", x: 660, y: 482, z: 44, sort: 538.2 },
    { id: "lapB2", asset: "laptop", x: 860, y: 482, z: 44, sort: 538.3 },

    { id: "mugA1", asset: "cup", x: 700, y: 280, z: 44, color: "#2ec4a6", sort: 318.4 },
    { id: "mugA2", asset: "cup", x: 898, y: 282, z: 44, color: "#ffb648", sort: 318.5 },
    { id: "mugB1", asset: "cup", x: 700, y: 500, z: 44, color: "#9b6cf5", sort: 538.4 },
    { id: "bookB2", asset: "papers", x: 900, y: 498, z: 44, sort: 538.5 },
    { id: "lampA1", asset: "lamp", x: 622, y: 300, z: 44, sort: 318.6 },
    { id: "lampB2", asset: "lamp", x: 822, y: 520, z: 44, sort: 538.6 },
    { id: "signNew", asset: "deskSign", x: 918, y: 298, z: 44, text: "NOAH", sort: 318.7 },

    /* ── plants ───────────────────────────────────────────────── */
    { id: "plant1", asset: "plant", x: 96, y: 152, s: 1.15, pot: "#ff5d7a" },
    { id: "plant2", asset: "plant", x: 956, y: 150, s: 1.0, pot: "#4f7cff" },
    { id: "plant3", asset: "plant", x: 98, y: 626, s: 0.95, pot: "#2ec4a6" },
    { id: "plant4", asset: "plant", x: 952, y: 626, s: 1.1, pot: "#ffb648" },
  ],
};

/** Walkable floor bounds for the office scene (used by the mock engine). */
export const OFFICE_FLOOR3_BOUNDS = {
  minX: 80,
  maxX: 960,
  minY: 130,
  maxY: 700,
};
