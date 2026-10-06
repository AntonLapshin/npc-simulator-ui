// render/objects/character.js — character showcase file (showcase pattern).
//
// Wraps render/character.js so people appear in the object gallery next to
// furniture. Characters NEVER rotate (always face south), so there is no
// direction switcher; instead the showcase exposes a configuration panel
// (`controls` below): emotion, skin, hair, pants, shoes, pose, speech and
// held props (cup / laptop).

import { drawCharacter } from "../character.js";
import { Chair } from "./chair.js";

/** Palette options offered by the showcase config panel. */
export const SKIN_OPTIONS = [
  { label: "Fair", skin: "#ffe0cb", skin2: "#eec7ae" },
  { label: "Light", skin: "#f2cba6", skin2: "#e0b189" },
  { label: "Tan", skin: "#e2a97c", skin2: "#c98f63" },
  { label: "Brown", skin: "#c98a5e", skin2: "#b0744a" },
  { label: "Deep", skin: "#8d5a3b", skin2: "#78492e" },
];

export const HAIR_COLORS = ["#3d2a20", "#22191a", "#b5502f", "#d9a441", "#6b7280", "#9b6cf5"];
export const HAIR_STYLES = ["short", "bun", "long", "ponytail", "curly"];
export const PANTS_COLORS = ["#39435c", "#2b3550", "#4a6fa5", "#3a3357", "#6b4a2f", "#2c3444"];
export const SHOES_COLORS = ["#1e2434", "#1a2032", "#26313f", "#7d3b4a", "#f7f4ee"];
export const EMOTIONS = [
  "neutral", "happy", "nervous", "sad", "excited",
  "surprised", "thinking", "confident", "shy", "proud", "annoyed",
];
export const POSE_OPTIONS = [
  { value: "stand", label: "Stand" },
  { value: "sit", label: "Sit on chair" },
  { value: "kneel", label: "Sit on knees" },
  { value: "doggy", label: "Doggy" },
  { value: "prone", label: "Face down" },
];

export const Character = {
  name: "character",
  title: "Character",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.3, // gallery zoom (scene stays 1:1)
  defaultProps: {
    asset: "character",
    id: "noah",
    name: "Noah",
    color: "#4f7cff",
    look: {
      skin: "#f2cba6", skin2: "#e0b189",
      hair: "#3d2a20", hairStyle: "short",
      shirt: "#7fb6ff", shirt2: "#5b95e8",
      pants: "#39435c", shoes: "#1e2434",
    },
    prop: null,          // "cup" | "laptop" | null
    holdCup: false,      // showcase config source of truth
    holdLaptop: false,
    speech: false,       // showcase: draw a speech bubble
    x: 0,
    y: 0,
    pose: "stand",
    emotion: "neutral",
    visible: true,
    isUser: false,
  },

  /**
   * Showcase config panel description. app.js renders one row per entry:
   * select / swatches / toggle. `apply(props, value)` writes back into props.
   */
  controls: [
    {
      key: "pose", label: "Pose", type: "select",
      options: POSE_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
      get: (p) => p.pose || "stand",
      apply: (p, v) => { p.pose = v; },
    },
    {
      key: "emotion", label: "Emotion", type: "select",
      options: EMOTIONS.map((e) => ({ value: e, label: e })),
      get: (p) => p.emotion || "neutral",
      apply: (p, v) => { p.emotion = v; },
    },
    {
      key: "skin", label: "Skin", type: "swatches",
      options: SKIN_OPTIONS.map((s) => ({ value: s, color: s.skin, label: s.label })),
      get: (p) => SKIN_OPTIONS.findIndex((s) => s.skin === (p.look || {}).skin),
      apply: (p, v) => { p.look = { ...p.look, skin: v.skin, skin2: v.skin2 }; },
    },
    {
      key: "hairStyle", label: "Hair style", type: "select",
      options: HAIR_STYLES.map((h) => ({ value: h, label: h })),
      get: (p) => (p.look || {}).hairStyle || "short",
      apply: (p, v) => { p.look = { ...p.look, hairStyle: v }; },
    },
    {
      key: "hair", label: "Hair color", type: "swatches",
      options: HAIR_COLORS.map((h) => ({ value: h, color: h, label: h })),
      get: (p) => HAIR_COLORS.indexOf((p.look || {}).hair),
      apply: (p, v) => { p.look = { ...p.look, hair: v }; },
    },
    {
      key: "pants", label: "Pants", type: "swatches",
      options: PANTS_COLORS.map((h) => ({ value: h, color: h, label: h })),
      get: (p) => PANTS_COLORS.indexOf((p.look || {}).pants),
      apply: (p, v) => { p.look = { ...p.look, pants: v }; },
    },
    {
      key: "shoes", label: "Shoes", type: "swatches",
      options: SHOES_COLORS.map((h) => ({ value: h, color: h, label: h })),
      get: (p) => SHOES_COLORS.indexOf((p.look || {}).shoes),
      apply: (p, v) => { p.look = { ...p.look, shoes: v }; },
    },
    {
      key: "holdCup", label: "Hold cup", type: "toggle",
      get: (p) => Boolean(p.holdCup),
      apply: (p, v) => { p.holdCup = v; syncProp(p); },
    },
    {
      key: "holdLaptop", label: "Hold laptop", type: "toggle",
      get: (p) => Boolean(p.holdLaptop),
      apply: (p, v) => { p.holdLaptop = v; syncProp(p); },
    },
    {
      key: "speech", label: "Speech bubble", type: "toggle",
      get: (p) => Boolean(p.speech),
      apply: (p, v) => { p.speech = v; },
    },
  ],

  draw(c, a) {
    const pose = a.pose || "stand";
    // "sit" seats the character on a chair (the scene owns its chair assets;
    // here the showcase composes one so the pose reads correctly).
    if (pose === "sit" && a.withChair !== false) {
      Chair.draw(c, { x: a.x, y: a.y, color: a.chairColor || "#4f7cff" });
    }
    drawCharacter(c, { ...a, dir: "down" }, { showNames: false });
  },

  sortY(a) {
    // seated characters paint after the chair carrying them
    return (a.y || 0) + ((a.pose || "stand") === "sit" ? 18 : 0);
  },
};

/** prop = the single held item the painter understands (laptop wins). */
function syncProp(p) {
  p.prop = p.holdLaptop ? "laptop" : p.holdCup ? "cup" : null;
}
