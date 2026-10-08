// render/character.js — character rendering (prototype §8), refined for the
// 3/4 top-down "gem-flat" look. Characters ALWAYS face south (down): there is
// no rotation any more. A visual actor is:
//   { id, name, color, look, prop, x, y, pose, emotion, visible, isUser }
//
// Poses (see POSES):
//   stand — upright, front view
//   sit   — seated on a chair (seat plane at y-26); the chair itself is NOT
//           painted here (the scene owns chair assets; the showcase composes
//           one via objects/character.js)
//   kneel — seiza on the floor, profile, always faces LEFT
//   doggy — on hands & knees, profile, always faces LEFT
//   prone — lying face down, top view, head turned LEFT (cheek shows)
//
// Props: "cup" | "laptop" | null. A held laptop always shows its lid back
// (laptops face north); a held cup sits in the right hand (screen-right).
//
// Hair, faces and mood FX live in render/hair.js and render/face.js;
// look-field defaults in render/look.js. They are re-exported here so the
// public surface of this module is unchanged.

import { ell, ellShadow, poly, rrPath, rgba, shade } from "../core/utils.js";
import { pantsOf, shirtOf, shirtShadeOf, shoesOf, skin2Of, skinOf } from "./look.js";
import { drawFace, drawFaceProfile, drawMoodFx } from "./face.js";
import {
  drawHairBack, drawHairBackProfile, drawHairFront, drawHairProfile, drawHairTop,
} from "./hair.js";

export { drawFace, drawFaceProfile, drawMoodFx } from "./face.js";
export {
  drawHairBack, drawHairBackProfile, drawHairFront, drawHairProfile, drawHairTop,
} from "./hair.js";

export const POSES = ["stand", "sit", "kneel", "doggy", "prone"];

export const POSE_TITLES = {
  stand: "Stand",
  sit: "Sit on chair",
  kneel: "Sit on knees",
  doggy: "Doggy",
  prone: "Face down",
};


/**
 * Draw one character. `opts.showNames` toggles the name plate; the user's
 * actor gets a "· YOU" suffix so the player can always spot themselves.
 * `ch.dir` is accepted (legacy input) and ignored — everyone faces south.
 */
export function drawCharacter(c, ch, opts = {}) {
  const L = ch.look || {};
  const x = ch.x, y = ch.y;
  const emo = ch.emotion || "neutral";
  const pose = POSES.includes(ch.pose) ? ch.pose : "stand";

  if (pose === "stand") drawStand(c, x, y, L, emo, ch.prop);
  else if (pose === "sit") drawSit(c, x, y, L, emo, ch.prop);
  else if (pose === "kneel") drawKneel(c, x, y, L, emo, ch.prop);
  else if (pose === "doggy") drawDoggy(c, x, y, L, emo, ch.prop);
  else drawProne(c, x, y, L, emo, ch.prop);

  if (opts.showNames) drawNamePlate(c, ch, x, y + (pose === "prone" ? 16 : 6));
}

/* ── shared bits ─────────────────────────────────────────────────────── */

function drawNamePlate(c, ch, x, y) {
  const nm = ((ch.name || "") + (ch.isUser ? " · YOU" : "")).toUpperCase();
  c.font = "800 9px Outfit, sans-serif";
  const w = c.measureText(nm).width + 13;
  c.fillStyle = "rgba(8,12,22,.62)";
  rrPath(c, x - w / 2, y, w, 14, 7);
  c.fill();
  c.strokeStyle = rgba(ch.color, ch.isUser ? 0.9 : 0.55);
  c.lineWidth = ch.isUser ? 1.6 : 1;
  rrPath(c, x - w / 2, y, w, 14, 7);
  c.stroke();
  c.fillStyle = ch.color;
  c.textAlign = "center";
  c.fillText(nm, x, y + 10.2);
  c.textAlign = "left";
}

/** Two legs in pants + shoes, front view. Feet point south (at camera). */
function legsFront(c, x, y, L, top, shoeH) {
  c.fillStyle = pantsOf(L);
  rrPath(c, x - 8.4, top, 7.2, y - top - shoeH + 2, 3);
  c.fill();
  rrPath(c, x + 1.2, top, 7.2, y - top - shoeH + 2, 3);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.12)";
  c.fillRect(x - 8.4, top + 1, 1.8, y - top - shoeH);
  c.fillStyle = shoesOf(L);
  rrPath(c, x - 9.6, y - shoeH, 9, shoeH, 2.6);
  c.fill();
  rrPath(c, x + 0.6, y - shoeH, 9, shoeH, 2.6);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.16)";
  c.fillRect(x - 9.6, y - shoeH + 0.8, 9, 1.2);
  c.fillRect(x + 0.6, y - shoeH + 0.8, 9, 1.2);
}

/** Torso, front view: rounded shoulders, hem band, collar notch. */
function torsoFront(c, x, yTop, yBot, L) {
  c.beginPath();
  c.moveTo(x - 9, yBot);
  c.lineTo(x - 12.6, yTop + 9);
  c.quadraticCurveTo(x - 13.2, yTop - 1, x - 6, yTop - 2);
  c.lineTo(x + 6, yTop - 2);
  c.quadraticCurveTo(x + 13.2, yTop - 1, x + 12.6, yTop + 9);
  c.lineTo(x + 9, yBot);
  c.closePath();
  c.fillStyle = shirtOf(L);
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.16)";
  poly(c, [[x - 14, yTop - 2], [x - 4, yTop - 2], [x - 8, yBot], [x - 14, yBot]]);
  c.fillStyle = "rgba(0,0,0,.10)";
  c.fillRect(x + 5, yTop - 2, 10, yBot - yTop + 2);
  c.fillStyle = shirtShadeOf(L);
  c.fillRect(x - 14, yBot - 5, 28, 6);
  c.restore();
  c.fillStyle = shade(shirtOf(L), -0.3);
  poly(c, [[x - 4.6, yTop - 2], [x + 4.6, yTop - 2], [x, yTop + 5]]);
}

/** One sleeve hanging at the side + skin hand. */
function armFront(c, sx, yTop, len, L) {
  c.fillStyle = shirtShadeOf(L);
  rrPath(c, sx - 2.8, yTop, 5.6, len, 2.8);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, sx - 2.4, yTop + len - 1, 4.8, 6.4, 2.4);
  c.fill();
}

/** Head + neck + ears, front view. Returns head centre y. */
function headFront(c, x, y, hy, L) {
  c.fillStyle = skin2Of(L);
  rrPath(c, x - 3.4, hy + 9, 6.8, 7, 2);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, x - 12.2, hy - 13, 24.4, 26, 11.5);
  c.fill();
  c.save();
  rrPath(c, x - 12.2, hy - 13, 24.4, 26, 11.5);
  c.clip();
  c.fillStyle = "rgba(255,255,255,.14)";
  poly(c, [[x - 13, hy - 14], [x - 4, hy - 14], [x - 9, hy + 14], [x - 13, hy + 14]]);
  c.fillStyle = "rgba(0,0,0,.06)";
  c.fillRect(x + 5, hy - 14, 9, 28);
  c.restore();
  c.fillStyle = skin2Of(L);
  ell(c, x - 12.6, hy + 2.5, 2.8, 3);
  c.fill();
  ell(c, x + 12.6, hy + 2.5, 2.8, 3);
  c.fill();
  return hy;
}

/* ── pose: stand ─────────────────────────────────────────────────────── */

function drawStand(c, x, y, L, emo, prop) {
  ellShadow(c, x, y + 1, 16, 6.2, 0.3);
  legsFront(c, x, y, L, y - 21, 5.4);
  const ty0 = y - 45, ty1 = y - 16;
  torsoFront(c, x, ty0, ty1, L);
  const laptop = prop === "laptop";
  const cup = prop === "cup";
  armFront(c, x - 12.2, ty0 + 3, 22, L);
  if (!laptop) armFront(c, x + 12.2, ty0 + 3, 22, L);
  if (laptop) {
    // held laptop: lid back faces the camera (laptops face north)
    heldLaptop(c, x, y - 27, L);
  } else if (cup) {
    // right arm bent up, mug in hand
    c.fillStyle = shirtShadeOf(L);
    rrPath(c, x + 11, ty0 + 3, 5.6, 14, 2.8);
    c.fill();
    rrPath(c, x + 11, ty0 + 12, 10, 5.2, 2.6);
    c.fill();
    c.fillStyle = skinOf(L);
    rrPath(c, x + 15.4, ty0 + 9.6, 5, 5.4, 2.4);
    c.fill();
    mugInHand(c, x + 17.6, ty0 + 4);
  }
  drawHairBack(c, x, y - 56, L);
  const hy = headFront(c, x, y, y - 56, L);
  drawHairFront(c, x, hy, L);
  drawFace(c, x, hy, emo, L);
  drawMoodFx(c, x, hy, emo);
}

/* ── pose: sit (on a chair, seat plane y-26) ─────────────────────────── */

function drawSit(c, x, y, L, emo, prop) {
  const seat = y - 26;
  ellShadow(c, x, y + 1, 17, 6.4, 0.3);
  // shins drop from the knees (south of the seat edge) to the floor
  c.fillStyle = pantsOf(L);
  rrPath(c, x - 8.2, seat - 2, 7, y - seat - 3, 3);
  c.fill();
  rrPath(c, x + 1.2, seat - 2, 7, y - seat - 3, 3);
  c.fill();
  c.fillStyle = shoesOf(L);
  rrPath(c, x - 9.4, y - 5.2, 9, 5.2, 2.6);
  c.fill();
  rrPath(c, x + 0.8, y - 5.2, 9, 5.2, 2.6);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.16)";
  c.fillRect(x - 9.4, y - 4.4, 9, 1.2);
  c.fillRect(x + 0.8, y - 4.4, 9, 1.2);
  // thighs: foreshortened, coming at the camera over the seat front edge
  c.fillStyle = shade(pantsOf(L), 0.1);
  rrPath(c, x - 11.6, seat - 6, 10.4, 10, 4);
  c.fill();
  rrPath(c, x + 1.2, seat - 6, 10.4, 10, 4);
  c.fill();
  // torso rises from the seat
  const ty0 = seat - 26, ty1 = seat - 1;
  torsoFront(c, x, ty0, ty1, L);
  const laptop = prop === "laptop";
  const cup = prop === "cup";
  if (laptop) {
    // arms forward to a laptop resting on the lap
    c.fillStyle = shirtShadeOf(L);
    rrPath(c, x - 14.4, ty0 + 3, 5.4, 16, 2.7);
    c.fill();
    rrPath(c, x + 9, ty0 + 3, 5.4, 16, 2.7);
    c.fill();
    heldLaptop(c, x, seat - 12, L);
  } else {
    armFront(c, x - 12.2, ty0 + 3, 19, L);
    if (cup) {
      c.fillStyle = shirtShadeOf(L);
      rrPath(c, x + 10.8, ty0 + 3, 5.4, 12, 2.7);
      c.fill();
      rrPath(c, x + 10.8, ty0 + 10, 9.6, 5, 2.5);
      c.fill();
      c.fillStyle = skinOf(L);
      rrPath(c, x + 14.8, ty0 + 7.4, 5, 5.2, 2.4);
      c.fill();
      mugInHand(c, x + 17, ty0 + 2.4);
    } else {
      armFront(c, x + 12.2, ty0 + 3, 19, L);
    }
  }
  drawHairBack(c, x, ty0 - 11, L);
  const hy = headFront(c, x, y, ty0 - 11, L);
  drawHairFront(c, x, hy, L);
  drawFace(c, x, hy, emo, L);
  drawMoodFx(c, x, hy, emo);
}

/** Open laptop seen from behind the lid (laptops face north). */
function heldLaptop(c, x, y, L) {
  c.fillStyle = "rgba(24,28,54,.18)";
  rrPath(c, x - 17, y + 8, 34, 5, 2.5);
  c.fill();
  // base slab (hinge side, south edge peeks under the lid)
  c.fillStyle = "#b9c3d8";
  rrPath(c, x - 16, y + 5, 32, 6, 2.5);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.4)";
  c.fillRect(x - 16, y + 5, 32, 1.2);
  // lid back
  c.fillStyle = "#2b3757";
  rrPath(c, x - 15, y - 15, 30, 21, 3);
  c.fill();
  c.fillStyle = "rgba(190,225,255,.16)";
  rrPath(c, x - 12.5, y - 12.5, 25, 16, 2);
  c.fill();
  c.save();
  c.translate(x, y - 4.5);
  c.rotate(Math.PI / 4);
  c.fillStyle = "rgba(190,225,255,.8)";
  c.fillRect(-2.6, -2.6, 5.2, 5.2);
  c.restore();
  c.fillStyle = "rgba(170,220,255,.3)";
  c.fillRect(x - 15, y - 15, 30, 1.4);
  // hands on the lid edges
  c.fillStyle = skinOf(L);
  ell(c, x - 15.6, y + 2, 2.8, 3);
  c.fill();
  ell(c, x + 15.6, y + 2, 2.8, 3);
  c.fill();
}

/** Mug held in a hand (rim + coffee from above, handle right). */
function mugInHand(c, x, y) {
  c.fillStyle = "#f7f4ee";
  rrPath(c, x - 4.4, y - 8, 8.8, 10.4, 2.4);
  c.fill();
  c.strokeStyle = "#e2dbcd";
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(x + 5.4, y - 3.4, 2.8, -1.2, 1.2);
  c.stroke();
  c.fillStyle = "rgba(120,80,50,.6)";
  ell(c, x, y - 8, 3.6, 1.5);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.5)";
  c.fillRect(x - 3.2, y - 6.4, 1.6, 7);
}

/* ── pose: kneel (seiza, profile, faces left) ────────────────────────── */

function drawKneel(c, x, y, L, emo, prop) {
  ellShadow(c, x + 2, y + 1, 17, 5.6, 0.3);
  if (prop) floorProp(c, x - 26, y, prop);
  // shins flat on the floor, toes pointing back (east)
  c.fillStyle = pantsOf(L);
  rrPath(c, x - 6, y - 6.4, 20, 6.4, 3);
  c.fill();
  c.fillStyle = shoesOf(L);
  rrPath(c, x + 8, y - 5.4, 7.4, 5.4, 2.4);
  c.fill();
  // folded thighs rise to the hips
  c.fillStyle = shade(pantsOf(L), 0.08);
  rrPath(c, x - 7.4, y - 15, 9.4, 12, 3.6);
  c.fill();
  // upright torso, slight forward lean
  c.save();
  c.translate(x - 2, y - 13);
  c.rotate(-0.06);
  c.beginPath();
  c.moveTo(-8.2, 0);
  c.quadraticCurveTo(-9.4, -8, -11.4, -19);
  c.quadraticCurveTo(-12, -27.6, -4, -28.8);
  c.lineTo(4, -28.8);
  c.quadraticCurveTo(11.6, -27.6, 11, -19);
  c.quadraticCurveTo(9.2, -8, 8.2, 0);
  c.closePath();
  c.fillStyle = shirtOf(L);
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.15)";
  poly(c, [[-11, -28], [-3, -28], [-6, 0], [-11, 0]]);
  c.fillStyle = "rgba(0,0,0,.10)";
  c.fillRect(3.4, -28, 8, 28);
  c.fillStyle = shirtShadeOf(L);
  c.fillRect(-11, -5, 22, 5);
  c.restore();
  c.restore();
  // arm rests on the lap
  c.fillStyle = shirtShadeOf(L);
  rrPath(c, x - 9.6, y - 36, 5, 15, 2.5);
  c.fill();
  rrPath(c, x - 12.4, y - 24, 9, 4.8, 2.4);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, x - 14.6, y - 24.6, 5, 5, 2.4);
  c.fill();
  // head
  const hy = y - 53;
  drawHairBackProfile(c, x, hy, L);
  c.fillStyle = skin2Of(L);
  rrPath(c, x - 5.4, hy + 8, 6, 6.4, 2);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, x - 12, hy - 12.4, 24, 25, 11.4);
  c.fill();
  drawHairProfile(c, x, hy, L);
  drawFaceProfile(c, x, hy, emo, L);
  drawMoodFx(c, x - 2, hy, emo);
}

/* ── pose: doggy (hands & knees, profile, faces left) ────────────────── */

function drawDoggy(c, x, y, L, emo, prop) {
  ellShadow(c, x, y + 1, 22, 6, 0.3);
  if (prop) floorProp(c, x - 32, y, prop);
  // shins + feet flat behind (east)
  c.fillStyle = pantsOf(L);
  rrPath(c, x + 6, y - 6, 16, 6, 3);
  c.fill();
  c.fillStyle = shoesOf(L);
  rrPath(c, x + 16.6, y - 5.2, 7, 5.2, 2.4);
  c.fill();
  // thighs vertical (knees on the floor)
  c.fillStyle = shade(pantsOf(L), 0.08);
  rrPath(c, x + 5.4, y - 20, 8.4, 16, 3.4);
  c.fill();
  // torso: horizontal band, hips a touch higher than shoulders
  c.beginPath();
  c.moveTo(x - 12, y - 20);
  c.quadraticCurveTo(x - 2, y - 27.5, x + 10, y - 24.5);
  c.lineTo(x + 12, y - 16);
  c.quadraticCurveTo(x, y - 19, x - 11, y - 13);
  c.closePath();
  c.fillStyle = shirtOf(L);
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.14)";
  poly(c, [[x - 12, y - 22], [x + 12, y - 26], [x + 12, y - 22.6], [x - 12, y - 18.6]]);
  c.fillStyle = shirtShadeOf(L);
  poly(c, [[x + 6, y - 26], [x + 13, y - 24], [x + 13, y - 14], [x + 6, y - 16]]);
  c.restore();
  // arms straight down to the palms
  c.fillStyle = shirtShadeOf(L);
  rrPath(c, x - 15.4, y - 22, 5.2, 18, 2.6);
  c.fill();
  rrPath(c, x - 8.6, y - 21, 5.2, 17, 2.6);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, x - 16.2, y - 4.6, 6.4, 4.6, 2.2);
  c.fill();
  rrPath(c, x - 9.4, y - 4.2, 6.4, 4.2, 2.2);
  c.fill();
  // head, lowered between the arms, facing left
  const hx = x - 17, hy = y - 30;
  drawHairBackProfile(c, hx, hy, L);
  c.fillStyle = skin2Of(L);
  rrPath(c, hx + 1.4, hy + 7, 5.6, 6, 2);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, hx - 11, hy - 11.4, 22.6, 23.4, 10.8);
  c.fill();
  drawHairProfile(c, hx, hy, L);
  drawFaceProfile(c, hx, hy, emo, L);
  drawMoodFx(c, hx - 2, hy, emo);
}

/* ── pose: prone (face down, top view, head turned left) ─────────────── */

function drawProne(c, x, y, L, emo, prop) {
  ellShadow(c, x, y - 20, 19, 32, 0.24);
  if (prop) floorProp(c, x - 34, y - 6, prop);
  /* shoes at the north end, soles toward the camera */
  c.fillStyle = shoesOf(L);
  rrPath(c, x - 9.6, y - 62, 9, 6.6, 3);
  c.fill();
  rrPath(c, x + 0.6, y - 62, 9, 6.6, 3);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.18)";
  c.fillRect(x - 9.6, y - 61.2, 9, 1.4);
  c.fillRect(x + 0.6, y - 61.2, 9, 1.4);
  /* legs, seen from above */
  c.fillStyle = pantsOf(L);
  rrPath(c, x - 8.8, y - 57, 8.6, 26, 3.8);
  c.fill();
  rrPath(c, x + 0.2, y - 57, 8.6, 26, 3.8);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.1)";
  c.fillRect(x - 8.8, y - 55, 2.2, 22);
  /* torso from above: shoulder line wide, tapering to the hips */
  c.beginPath();
  c.moveTo(x - 9, y - 34);
  c.quadraticCurveTo(x - 14.6, y - 30, x - 14, y - 23);
  c.lineTo(x - 11, y - 12);
  c.quadraticCurveTo(x, y - 8.4, x + 11, y - 12);
  c.lineTo(x + 14, y - 23);
  c.quadraticCurveTo(x + 14.6, y - 30, x + 9, y - 34);
  c.closePath();
  c.fillStyle = shirtOf(L);
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.14)";
  poly(c, [[x - 14, y - 34], [x - 4, y - 34], [x - 7, y - 8], [x - 14, y - 8]]);
  c.fillStyle = "rgba(0,0,0,.08)";
  c.fillRect(x + 5, y - 35, 9, 28);
  c.restore();
  /* upper arms along the sides, forearms folded under the head */
  c.fillStyle = shirtShadeOf(L);
  rrPath(c, x - 16, y - 26, 5.2, 15, 2.6);
  c.fill();
  rrPath(c, x + 10.8, y - 26, 5.2, 15, 2.6);
  c.fill();
  rrPath(c, x - 15, y - 12.6, 26, 5.6, 2.8);
  c.fill();
  c.fillStyle = skinOf(L);
  rrPath(c, x - 14.4, y - 13.4, 6.4, 5.6, 2.7);
  c.fill();
  rrPath(c, x + 4, y - 13.4, 6.4, 5.6, 2.7);
  c.fill();
  /* head resting on the arms, turned left: cheek + profile face west */
  const hx = x - 2, hy = y - 6;
  c.fillStyle = skinOf(L);
  rrPath(c, hx - 12, hy - 12, 24, 24, 11.4);
  c.fill();
  drawHairTop(c, hx, hy, L);
  drawFaceProfile(c, hx - 4.4, hy + 1.2, emo, L, 0.92);
  drawMoodFx(c, hx - 4, hy, emo);
}

/** Cup/laptop placed on the floor for floor poses. */
function floorProp(c, x, y, prop) {
  if (prop === "cup") {
    mugInHand(c, x, y - 2);
    return;
  }
  // closed laptop: thin slab, top face + south edge
  c.fillStyle = "rgba(24,28,54,.18)";
  rrPath(c, x - 15, y - 3, 30, 7, 3);
  c.fill();
  c.fillStyle = "#3b4c78";
  rrPath(c, x - 15, y - 6, 30, 6, 2.6);
  c.fill();
  c.fillStyle = "#2b3757";
  rrPath(c, x - 15, y - 8.4, 30, 4.4, 2.2);
  c.fill();
  c.fillStyle = "rgba(170,220,255,.3)";
  c.fillRect(x - 15, y - 8.4, 30, 1.2);
}
