// data/samples.js — raw visual samples for the scene preview (scene.html).
//
// Plain renderer input, deliberately engine-free: no World, Actor or
// Scenario shapes here — just scene ids, character paint descriptors and
// bubbles as documented in js/render/index.js. Edit these to try new looks.
// Characters never rotate: everyone faces south. `pose` drives the body.

/** Sample cast: visual actors in 1040×730 view coordinates. */
export const SAMPLE_CHARS = [
  {
    id: "noah", name: "Noah", color: "#4f7cff", prop: null,
    look: { skin: "#f2cba6", skin2: "#e0b189", hair: "#3d2a20", hairStyle: "short", shirt: "#7fb6ff", shirt2: "#5b95e8", pants: "#39435c", shoes: "#1e2434" },
    x: 500, y: 600, pose: "stand", emotion: "nervous", visible: true, isUser: true,
  },
  {
    id: "maya", name: "Maya", color: "#2ec4a6", prop: "laptop",
    look: { skin: "#c98a5e", skin2: "#b0744a", hair: "#22191a", hairStyle: "bun", shirt: "#2ec4a6", shirt2: "#1f9e85", pants: "#2b3550", shoes: "#1a2032" },
    x: 660, y: 214, pose: "sit", emotion: "neutral", visible: true, isUser: false,
  },
  {
    id: "priya", name: "Priya", color: "#9b6cf5", prop: null,
    look: { skin: "#e2a97c", skin2: "#c98f63", hair: "#2b1f22", hairStyle: "long", shirt: "#9b6cf5", shirt2: "#7d51d3", pants: "#3a3357", shoes: "#221d33" },
    x: 352, y: 372, pose: "stand", emotion: "happy", visible: true, isUser: false,
  },
  {
    id: "lena", name: "Lena", color: "#ffb648", prop: "cup",
    look: { skin: "#ffe0cb", skin2: "#eec7ae", hair: "#b5502f", hairStyle: "ponytail", shirt: "#ffb648", shirt2: "#e2952c", pants: "#4a6fa5", shoes: "#26313f" },
    x: 860, y: 434, pose: "sit", emotion: "happy", visible: true, isUser: false,
  },
  {
    id: "dana", name: "Dana", color: "#ff5d7a", prop: "cup",
    look: { skin: "#8d5a3b", skin2: "#78492e", hair: "#191315", hairStyle: "curly", shirt: "#ff5d7a", shirt2: "#dd3f5e", pants: "#2c3444", shoes: "#171d29" },
    x: 424, y: 240, pose: "stand", emotion: "happy", visible: true, isUser: false,
  },
];

/** Sample speech anchored to the cast above (x/y follow the speaker). */
export const SAMPLE_BUBBLES = [
  { actorId: "dana", text: "Morning! Coffee's almost ready.", kind: "say" },
  { actorId: "noah", text: "Deep breath. First day, brand new team.", kind: "thought" },
];

/** Minimal raw scene: floor + walls + door, no furniture (variant check). */
export const EMPTY_STUDIO_SCENE = {
  meta: {
    name: "Empty Studio",
    style: "gem-flat 2.5D",
    projection: "plan + vertical extrusion",
    world: { w: 1040, h: 730 },
  },
  floor: { x: 60, y: 110, w: 920, h: 550, plank: 56, base: "#efe3cf", tone: "#e6d8bf" },
  corridor: { x: 0, y: 730, w: 0, h: 0, color: "#1b2438" },
  walls: [
    { id: "wN", x: 40, y: 90, w: 960, h: 20, height: 70, face: "#dfe5f2", top: "#f4f7fd", layer: "back" },
    { id: "wW", x: 40, y: 90, w: 20, h: 590, height: 70, face: "#d3dae9", top: "#eef2fa", layer: "back" },
    { id: "wE", x: 980, y: 90, w: 20, h: 590, height: 70, face: "#cbd3e4", top: "#e8edf8", layer: "back" },
  ],
  windows: [{ id: "win1", wall: "wN", x: 420, y: 50, w: 200, h: 46, view: "city" }],
  door: { id: "door1", x: 455, y: 660, w: 130, h: 20, frame: "#8f6b45", label: "ENTRANCE" },
  wallDecor: [],
  floorDecals: [],
  lightPatches: [{ x: 420, w: 200 }],
  assets: [],
};

/** A generic fallback box (ids the scene doesn't paint get this treatment). */
export const SAMPLE_GENERIC_OBJECTS = [
  { id: "crate_01", name: "mystery crate", x: 300, y: 560, w: 90, h: 60, passable: false, blocksVision: false },
];
