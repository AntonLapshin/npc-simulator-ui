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

import { ell, ellShadow, poly, rrPath, rgba, shade } from "../core/utils.js";

/** All supported poses, in showcase order. */
export const POSES = ["stand", "sit", "kneel", "doggy", "prone"];

export const POSE_TITLES = {
  stand: "Stand",
  sit: "Sit on chair",
  kneel: "Sit on knees",
  doggy: "Doggy",
  prone: "Face down",
};

const INK = "#2b2340";

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
  c.fillStyle = L.pants || "#39435c";
  rrPath(c, x - 8.4, top, 7.2, y - top - shoeH + 2, 3);
  c.fill();
  rrPath(c, x + 1.2, top, 7.2, y - top - shoeH + 2, 3);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.12)";
  c.fillRect(x - 8.4, top + 1, 1.8, y - top - shoeH);
  c.fillStyle = L.shoes || "#1e2434";
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
  c.fillStyle = L.shirt || "#7fb6ff";
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.16)";
  poly(c, [[x - 14, yTop - 2], [x - 4, yTop - 2], [x - 8, yBot], [x - 14, yBot]]);
  c.fillStyle = "rgba(0,0,0,.10)";
  c.fillRect(x + 5, yTop - 2, 10, yBot - yTop + 2);
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  c.fillRect(x - 14, yBot - 5, 28, 6);
  c.restore();
  c.fillStyle = shade(L.shirt || "#7fb6ff", -0.3);
  poly(c, [[x - 4.6, yTop - 2], [x + 4.6, yTop - 2], [x, yTop + 5]]);
}

/** One sleeve hanging at the side + skin hand. */
function armFront(c, sx, yTop, len, L) {
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  rrPath(c, sx - 2.8, yTop, 5.6, len, 2.8);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
  rrPath(c, sx - 2.4, yTop + len - 1, 4.8, 6.4, 2.4);
  c.fill();
}

/** Head + neck + ears, front view. Returns head centre y. */
function headFront(c, x, y, hy, L) {
  c.fillStyle = L.skin2 || shade(L.skin || "#f2cba6", -0.1);
  rrPath(c, x - 3.4, hy + 9, 6.8, 7, 2);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
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
  c.fillStyle = L.skin2 || shade(L.skin || "#f2cba6", -0.1);
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
    c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
    rrPath(c, x + 11, ty0 + 3, 5.6, 14, 2.8);
    c.fill();
    rrPath(c, x + 11, ty0 + 12, 10, 5.2, 2.6);
    c.fill();
    c.fillStyle = L.skin || "#f2cba6";
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
  c.fillStyle = L.pants || "#39435c";
  rrPath(c, x - 8.2, seat - 2, 7, y - seat - 3, 3);
  c.fill();
  rrPath(c, x + 1.2, seat - 2, 7, y - seat - 3, 3);
  c.fill();
  c.fillStyle = L.shoes || "#1e2434";
  rrPath(c, x - 9.4, y - 5.2, 9, 5.2, 2.6);
  c.fill();
  rrPath(c, x + 0.8, y - 5.2, 9, 5.2, 2.6);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.16)";
  c.fillRect(x - 9.4, y - 4.4, 9, 1.2);
  c.fillRect(x + 0.8, y - 4.4, 9, 1.2);
  // thighs: foreshortened, coming at the camera over the seat front edge
  c.fillStyle = shade(L.pants || "#39435c", 0.1);
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
    c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
    rrPath(c, x - 14.4, ty0 + 3, 5.4, 16, 2.7);
    c.fill();
    rrPath(c, x + 9, ty0 + 3, 5.4, 16, 2.7);
    c.fill();
    heldLaptop(c, x, seat - 12, L);
  } else {
    armFront(c, x - 12.2, ty0 + 3, 19, L);
    if (cup) {
      c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
      rrPath(c, x + 10.8, ty0 + 3, 5.4, 12, 2.7);
      c.fill();
      rrPath(c, x + 10.8, ty0 + 10, 9.6, 5, 2.5);
      c.fill();
      c.fillStyle = L.skin || "#f2cba6";
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
  c.fillStyle = L.skin || "#f2cba6";
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
  c.fillStyle = L.pants || "#39435c";
  rrPath(c, x - 6, y - 6.4, 20, 6.4, 3);
  c.fill();
  c.fillStyle = L.shoes || "#1e2434";
  rrPath(c, x + 8, y - 5.4, 7.4, 5.4, 2.4);
  c.fill();
  // folded thighs rise to the hips
  c.fillStyle = shade(L.pants || "#39435c", 0.08);
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
  c.fillStyle = L.shirt || "#7fb6ff";
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.15)";
  poly(c, [[-11, -28], [-3, -28], [-6, 0], [-11, 0]]);
  c.fillStyle = "rgba(0,0,0,.10)";
  c.fillRect(3.4, -28, 8, 28);
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  c.fillRect(-11, -5, 22, 5);
  c.restore();
  c.restore();
  // arm rests on the lap
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  rrPath(c, x - 9.6, y - 36, 5, 15, 2.5);
  c.fill();
  rrPath(c, x - 12.4, y - 24, 9, 4.8, 2.4);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
  rrPath(c, x - 14.6, y - 24.6, 5, 5, 2.4);
  c.fill();
  // head
  const hy = y - 53;
  drawHairBackProfile(c, x, hy, L);
  c.fillStyle = L.skin2 || shade(L.skin || "#f2cba6", -0.1);
  rrPath(c, x - 5.4, hy + 8, 6, 6.4, 2);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
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
  c.fillStyle = L.pants || "#39435c";
  rrPath(c, x + 6, y - 6, 16, 6, 3);
  c.fill();
  c.fillStyle = L.shoes || "#1e2434";
  rrPath(c, x + 16.6, y - 5.2, 7, 5.2, 2.4);
  c.fill();
  // thighs vertical (knees on the floor)
  c.fillStyle = shade(L.pants || "#39435c", 0.08);
  rrPath(c, x + 5.4, y - 20, 8.4, 16, 3.4);
  c.fill();
  // torso: horizontal band, hips a touch higher than shoulders
  c.beginPath();
  c.moveTo(x - 12, y - 20);
  c.quadraticCurveTo(x - 2, y - 27.5, x + 10, y - 24.5);
  c.lineTo(x + 12, y - 16);
  c.quadraticCurveTo(x, y - 19, x - 11, y - 13);
  c.closePath();
  c.fillStyle = L.shirt || "#7fb6ff";
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.14)";
  poly(c, [[x - 12, y - 22], [x + 12, y - 26], [x + 12, y - 22.6], [x - 12, y - 18.6]]);
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  poly(c, [[x + 6, y - 26], [x + 13, y - 24], [x + 13, y - 14], [x + 6, y - 16]]);
  c.restore();
  // arms straight down to the palms
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  rrPath(c, x - 15.4, y - 22, 5.2, 18, 2.6);
  c.fill();
  rrPath(c, x - 8.6, y - 21, 5.2, 17, 2.6);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
  rrPath(c, x - 16.2, y - 4.6, 6.4, 4.6, 2.2);
  c.fill();
  rrPath(c, x - 9.4, y - 4.2, 6.4, 4.2, 2.2);
  c.fill();
  // head, lowered between the arms, facing left
  const hx = x - 17, hy = y - 30;
  drawHairBackProfile(c, hx, hy, L);
  c.fillStyle = L.skin2 || shade(L.skin || "#f2cba6", -0.1);
  rrPath(c, hx + 1.4, hy + 7, 5.6, 6, 2);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
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
  c.fillStyle = L.shoes || "#1e2434";
  rrPath(c, x - 9.6, y - 62, 9, 6.6, 3);
  c.fill();
  rrPath(c, x + 0.6, y - 62, 9, 6.6, 3);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.18)";
  c.fillRect(x - 9.6, y - 61.2, 9, 1.4);
  c.fillRect(x + 0.6, y - 61.2, 9, 1.4);
  /* legs, seen from above */
  c.fillStyle = L.pants || "#39435c";
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
  c.fillStyle = L.shirt || "#7fb6ff";
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,.14)";
  poly(c, [[x - 14, y - 34], [x - 4, y - 34], [x - 7, y - 8], [x - 14, y - 8]]);
  c.fillStyle = "rgba(0,0,0,.08)";
  c.fillRect(x + 5, y - 35, 9, 28);
  c.restore();
  /* upper arms along the sides, forearms folded under the head */
  c.fillStyle = L.shirt2 || shade(L.shirt || "#7fb6ff", -0.18);
  rrPath(c, x - 16, y - 26, 5.2, 15, 2.6);
  c.fill();
  rrPath(c, x + 10.8, y - 26, 5.2, 15, 2.6);
  c.fill();
  rrPath(c, x - 15, y - 12.6, 26, 5.6, 2.8);
  c.fill();
  c.fillStyle = L.skin || "#f2cba6";
  rrPath(c, x - 14.4, y - 13.4, 6.4, 5.6, 2.7);
  c.fill();
  rrPath(c, x + 4, y - 13.4, 6.4, 5.6, 2.7);
  c.fill();
  /* head resting on the arms, turned left: cheek + profile face west */
  const hx = x - 2, hy = y - 6;
  c.fillStyle = L.skin || "#f2cba6";
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

/* ── hair ────────────────────────────────────────────────────────────── */

/** Hair masses that sit BEHIND the head (drawn before the head skin). */
export function drawHairBack(c, x, hy, L) {
  const col = L.hair || "#3d2a20", st = L.hairStyle || "short";
  if (st === "long") {
    c.fillStyle = shade(col, -0.2);
    rrPath(c, x - 14.4, hy - 4, 28.8, 30, 12);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.08)";
    rrPath(c, x - 12.4, hy, 4, 22, 2);
    c.fill();
  } else if (st === "ponytail") {
    c.fillStyle = shade(col, -0.18);
    poly(c, [
      [x + 9, hy - 4], [x + 16.4, hy + 4], [x + 13, hy + 22], [x + 6, hy + 14],
    ]);
  }
}

/** Profile back-hair (drawn before the head skin): fall / tail at the east. */
export function drawHairBackProfile(c, x, hy, L) {
  const col = L.hair || "#3d2a20", st = L.hairStyle || "short";
  if (st === "long") {
    c.fillStyle = shade(col, -0.16);
    rrPath(c, x + 4.4, hy - 5, 9.6, 27, 4.6);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.1)";
    rrPath(c, x + 5.8, hy - 2, 2.4, 20, 1.2);
    c.fill();
  } else if (st === "ponytail") {
    c.fillStyle = shade(col, -0.18);
    poly(c, [[x + 9, hy - 6], [x + 16, hy + 2], [x + 13.4, hy + 20], [x + 7.4, hy + 10]]);
    c.fillStyle = "#ffb648";
    rrPath(c, x + 8.4, hy - 5.4, 3.4, 4.2, 1.4);
    c.fill();
  }
}

/** Front-view hair. Covers the top of the head; style variants below. */
export function drawHairFront(c, x, hy, L) {
  const col = L.hair || "#3d2a20", st = L.hairStyle || "short";
  c.fillStyle = col;
  if (st === "short") {
    c.beginPath();
    c.moveTo(x - 13, hy + 1);
    c.quadraticCurveTo(x - 13.6, hy - 15.4, x, hy - 15.8);
    c.quadraticCurveTo(x + 13.6, hy - 15.4, x + 13, hy + 1);
    c.lineTo(x + 8.6, hy - 3.4);
    c.quadraticCurveTo(x, hy - 9, x - 8.6, hy - 3.4);
    c.closePath();
    c.fill();
    c.fillStyle = shade(col, -0.22);
    poly(c, [[x + 4, hy - 15], [x + 13, hy + 1], [x + 8.6, hy - 3.4]]);
    c.fillStyle = "rgba(255,255,255,.18)";
    poly(c, [[x - 8.6, hy - 11.6], [x - 2, hy - 15], [x - 4, hy - 8]]);
  } else if (st === "bun") {
    ell(c, x, hy - 16.4, 7.8, 7.4);
    c.fill();
    c.fillStyle = shade(col, 0.16);
    ell(c, x - 2.8, hy - 18.6, 3, 2.8);
    c.fill();
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - 12.8, hy + 3);
    c.quadraticCurveTo(x - 13.6, hy - 14.4, x, hy - 15);
    c.quadraticCurveTo(x + 13.6, hy - 14.4, x + 12.8, hy + 3);
    c.lineTo(x + 10.4, hy - 2.4);
    c.quadraticCurveTo(x + 4, hy - 8.6, x - 4, hy - 6);
    c.quadraticCurveTo(x - 8.6, hy - 4, x - 10.4, hy + 1);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,.15)";
    poly(c, [[x - 10.4, hy - 8.6], [x - 3, hy - 13.4], [x - 6, hy - 6]]);
  } else if (st === "long") {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - 14, hy + 12);
    c.quadraticCurveTo(x - 15.4, hy - 15.4, x, hy - 15.8);
    c.quadraticCurveTo(x + 15.4, hy - 15.4, x + 14, hy + 12);
    c.lineTo(x + 9.6, hy + 10);
    c.quadraticCurveTo(x + 11.6, hy - 4, x + 4.8, hy - 6.8);
    c.quadraticCurveTo(x, hy - 8.6, x - 4.8, hy - 6.8);
    c.quadraticCurveTo(x - 11.6, hy - 4, x - 9.6, hy + 10);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,.14)";
    poly(c, [[x - 11.4, hy - 7.6], [x - 4, hy - 14.4], [x - 6.6, hy - 4]]);
  } else if (st === "ponytail") {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - 13, hy + 2);
    c.quadraticCurveTo(x - 13.6, hy - 15.4, x, hy - 15.8);
    c.quadraticCurveTo(x + 13.6, hy - 15.4, x + 13, hy + 2);
    c.lineTo(x + 9.6, hy - 3.4);
    c.quadraticCurveTo(x + 2, hy - 9.6, x - 5.6, hy - 6);
    c.quadraticCurveTo(x - 9.6, hy - 3, x - 10.6, hy + 1);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,.2)";
    poly(c, [[x - 9.6, hy - 9.6], [x - 2, hy - 14.4], [x - 4.6, hy - 6]]);
    c.fillStyle = "#ffb648";
    rrPath(c, x + 7.4, hy - 3.4, 3.4, 4.4, 1.4);
    c.fill();
  } else {
    // curly
    const curls = [[-10.4, -7.6, 7], [-3, -13.4, 7.8], [5.6, -11.4, 7.4], [11.4, -3.6, 6.4], [-12.4, 1.4, 6], [12.4, 3.6, 5.8], [0, -16.4, 6.2]];
    for (const p of curls) {
      ell(c, x + p[0], hy + p[1], p[2], p[2]);
      c.fill();
    }
    c.fillStyle = "rgba(255,255,255,.16)";
    ell(c, x - 5.6, hy - 12.4, 3, 3);
    c.fill();
    ell(c, x + 3.6, hy - 14.4, 2.6, 2.6);
    c.fill();
    c.fillStyle = shade(col, -0.26);
    ell(c, x - 11.4, hy + 6, 5.2, 5.2);
    c.fill();
    ell(c, x + 11.4, hy + 7, 5, 5);
    c.fill();
  }
}

/** Profile hair (head faces left): cap + style mass at the back (east). */
export function drawHairProfile(c, x, hy, L) {
  const col = L.hair || "#3d2a20", st = L.hairStyle || "short";
  c.fillStyle = col;
  // cap: forehead (west) over the crown to the nape (east)
  c.beginPath();
  c.moveTo(x - 11.6, hy - 1);
  c.quadraticCurveTo(x - 12.6, hy - 12.6, x - 1, hy - 12.8);
  c.quadraticCurveTo(x + 11.8, hy - 12.4, x + 11.8, hy + 2);
  c.lineTo(x + 11.8, hy + 6);
  c.quadraticCurveTo(x + 6, hy + 2, x + 4, hy - 3);
  c.quadraticCurveTo(x - 2, hy - 7.4, x - 8, hy - 4.4);
  c.quadraticCurveTo(x - 10.6, hy - 3, x - 11.6, hy - 1);
  c.closePath();
  c.fill();
  c.fillStyle = "rgba(255,255,255,.16)";
  poly(c, [[x - 8, hy - 9.4], [x - 1, hy - 12], [x - 3.4, hy - 6]]);
  if (st === "bun") {
    c.fillStyle = col;
    ell(c, x + 11.4, hy - 8.4, 6, 5.8);
    c.fill();
    c.fillStyle = shade(col, 0.16);
    ell(c, x + 9.6, hy - 10, 2.4, 2.2);
    c.fill();
  } else if (st === "curly") {
    const curls = [[-8, -8, 5.6], [0, -11.6, 6], [7.4, -8.6, 5.8], [11, -1.6, 5.2], [10.4, 5.4, 4.8]];
    c.fillStyle = col;
    for (const p of curls) {
      ell(c, x + p[0], hy + p[1], p[2], p[2]);
      c.fill();
    }
    c.fillStyle = shade(col, -0.24);
    ell(c, x + 10.6, hy + 8.4, 4.4, 4.4);
    c.fill();
  } else {
    // short: small nape wedge
    c.fillStyle = shade(col, -0.14);
    poly(c, [[x + 8.4, hy + 1], [x + 12, hy + 2], [x + 10.4, hy + 7]]);
  }
}

/** Top-view hair (prone): dome over the skull, face crescent stays west. */
export function drawHairTop(c, x, hy, L) {
  const col = L.hair || "#3d2a20", st = L.hairStyle || "short";
  c.fillStyle = col;
  c.save();
  rrPath(c, x - 11.6, hy - 11.6, 23.2, 23.2, 11);
  c.clip();
  c.beginPath();
  c.arc(x + 6.2, hy, 11.9, 0, 6.2832);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.14)";
  ell(c, x + 3, hy - 5, 4.4, 3.4);
  c.fill();
  c.restore();
  if (st === "bun") {
    c.fillStyle = col;
    ell(c, x + 12.4, hy, 5.6, 5.4);
    c.fill();
  } else if (st === "ponytail" || st === "long") {
    c.fillStyle = shade(col, -0.16);
    rrPath(c, x + 9, hy - 5, 14, 10, 5);
    c.fill();
  } else if (st === "curly") {
    c.fillStyle = col;
    for (const p of [[6, -8, 5], [10, 0, 5.2], [6, 8, 5], [0, -10, 4.6], [0, 10, 4.6]]) {
      ell(c, x + p[0], hy + p[1], p[2], p[2]);
      c.fill();
    }
  }
}

/* ── faces ───────────────────────────────────────────────────────────── */

/**
 * Front-view face per emotion. Unknown emotion strings fall through to the
 * neutral default — never throws.
 */
export function drawFace(c, x, hy, emo, L) {
  const fx = x, ex = 4.7;
  c.lineCap = "round";
  c.lineJoin = "round";
  const blush = (a) => {
    c.fillStyle = "rgba(255,120,140," + a + ")";
    ell(c, fx - ex - 1.6, hy + 4.6, 3, 1.9);
    c.fill();
    ell(c, fx + ex + 1.6, hy + 4.6, 3, 1.9);
    c.fill();
  };
  const eyeDot = (px, py) => {
    c.fillStyle = INK;
    ell(c, px, py, 1.95, 1.95);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.85)";
    ell(c, px - 0.6, py - 0.7, 0.85, 0.85);
    c.fill();
  };
  const eyeArc = (px, py, up) => {
    c.strokeStyle = INK;
    c.lineWidth = 1.9;
    c.beginPath();
    c.arc(px, py + (up ? 1.2 : -1.2), 2.9, up ? Math.PI * 1.15 : Math.PI * 0.15, up ? Math.PI * 1.85 : Math.PI * 0.85);
    c.stroke();
  };
  const eyeWide = (px, py) => {
    c.fillStyle = "#fff";
    ell(c, px, py, 3.1, 3.5);
    c.fill();
    c.fillStyle = INK;
    ell(c, px, py + 0.4, 1.8, 1.8);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.9)";
    ell(c, px - 0.7, py - 0.5, 0.75, 0.75);
    c.fill();
    c.strokeStyle = "rgba(43,35,64,.5)";
    c.lineWidth = 1;
    ell(c, px, py, 3.1, 3.5);
    c.stroke();
  };
  const brow = (px, py, rot, len) => {
    len = len || 4.4;
    c.save();
    c.translate(px, py);
    c.rotate(rot);
    c.strokeStyle = shade(L.hair || "#3d2a20", -0.05);
    c.lineWidth = 1.9;
    c.beginPath();
    c.moveTo(-len, 0);
    c.lineTo(len, 0);
    c.stroke();
    c.restore();
  };
  const mouth = (fn) => {
    c.strokeStyle = INK;
    c.lineWidth = 1.8;
    fn();
    c.stroke();
  };
  switch (emo) {
    case "happy":
      eyeArc(fx - ex, hy + 0.6, true);
      eyeArc(fx + ex, hy + 0.6, true);
      brow(fx - ex, hy - 5.4, -0.06);
      brow(fx + ex, hy - 5.4, 0.06);
      mouth(() => {
        c.beginPath();
        c.arc(fx, hy + 5.2, 3.6, 0.15 * Math.PI, 0.85 * Math.PI);
      });
      blush(0.28);
      break;
    case "excited":
      c.fillStyle = INK;
      [[fx - ex, hy + 0.4], [fx + ex, hy + 0.4]].forEach((p) => {
        c.save();
        c.translate(p[0], p[1]);
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const a2 = (i * Math.PI) / 4, r2 = i % 2 ? 1.3 : 3.3;
          c.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
        }
        c.closePath();
        c.fill();
        c.restore();
      });
      brow(fx - ex, hy - 6.6, -0.14);
      brow(fx + ex, hy - 6.6, 0.14);
      c.fillStyle = "#7d3b4a";
      ell(c, fx, hy + 7, 4.1, 3.4);
      c.fill();
      c.fillStyle = "#fff";
      c.fillRect(fx - 3.6, hy + 4.1, 7.2, 1.9);
      blush(0.34);
      break;
    case "nervous":
      eyeWide(fx - ex, hy + 0.6);
      eyeWide(fx + ex, hy + 0.6);
      brow(fx - ex, hy - 5.8, 0.3);
      brow(fx + ex, hy - 5.8, -0.3);
      mouth(() => {
        c.beginPath();
        c.moveTo(fx - 3.4, hy + 7.2);
        for (let i = 0; i <= 4; i++) c.lineTo(fx - 3.4 + i * 1.7, hy + 7.2 + (i % 2 ? -1.2 : 1.2));
      });
      c.fillStyle = "#8fd3ff";
      poly(c, [[fx + 13, hy - 9], [fx + 16, hy - 4], [fx + 13, hy - 1], [fx + 10, hy - 4]]);
      c.fillStyle = "rgba(255,255,255,.7)";
      c.fillRect(fx + 11.4, hy - 7.4, 1.4, 3);
      break;
    case "surprised":
      eyeWide(fx - ex, hy + 0.2);
      eyeWide(fx + ex, hy + 0.2);
      brow(fx - ex, hy - 7.4, -0.1);
      brow(fx + ex, hy - 7.4, 0.1);
      c.fillStyle = "#6d3a48";
      ell(c, fx, hy + 7.4, 2.6, 3.2);
      c.fill();
      break;
    case "shy":
      eyeArc(fx - ex, hy + 1.4, false);
      eyeArc(fx + ex, hy + 1.4, false);
      brow(fx - ex, hy - 5.2, -0.2);
      brow(fx + ex, hy - 5.2, 0.2);
      mouth(() => {
        c.beginPath();
        c.arc(fx + 0.6, hy + 5.6, 2.4, 0.15 * Math.PI, 0.85 * Math.PI);
      });
      blush(0.55);
      break;
    case "confident":
      c.strokeStyle = INK;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(fx - ex - 2.6, hy + 0.6);
      c.lineTo(fx - ex + 2.6, hy + 0.6);
      c.stroke();
      c.beginPath();
      c.moveTo(fx + ex - 2.6, hy + 0.2);
      c.lineTo(fx + ex + 2.6, hy + 0.2);
      c.stroke();
      c.fillStyle = INK;
      ell(c, fx + ex, hy + 1.4, 1.5, 1.5);
      c.fill();
      brow(fx - ex, hy - 5.6, -0.05);
      brow(fx + ex, hy - 7.2, 0.22, 4.8);
      mouth(() => {
        c.beginPath();
        c.moveTo(fx - 3.4, hy + 6.6);
        c.quadraticCurveTo(fx + 2, hy + 8.6, fx + 4.4, hy + 5);
      });
      break;
    case "thinking":
      eyeDot(fx - ex - 1.2, hy - 0.6);
      eyeDot(fx + ex - 1.2, hy - 0.6);
      brow(fx - ex, hy - 6.2, 0.16);
      brow(fx + ex, hy - 5.2, -0.24);
      mouth(() => {
        c.beginPath();
        c.moveTo(fx - 2.4, hy + 7);
        c.lineTo(fx + 2.6, hy + 6.4);
      });
      c.fillStyle = "rgba(143,211,255,.9)";
      c.font = "800 10px Outfit, sans-serif";
      c.textAlign = "center";
      c.fillText("?", fx + 15, hy - 9);
      c.textAlign = "left";
      break;
    case "proud":
      eyeArc(fx - ex, hy + 0.6, true);
      eyeArc(fx + ex, hy + 0.6, true);
      brow(fx - ex, hy - 6, -0.1);
      brow(fx + ex, hy - 6, 0.1);
      mouth(() => {
        c.beginPath();
        c.arc(fx, hy + 4.8, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      });
      blush(0.26);
      c.fillStyle = "rgba(255,209,102,.9)";
      poly(c, [
        [fx + 13, hy - 13], [fx + 15, hy - 9], [fx + 19, hy - 8], [fx + 15.6, hy - 5.4], [fx + 16.4, hy - 1.4],
        [fx + 13, hy - 3.6], [fx + 9.6, hy - 1.4], [fx + 10.4, hy - 5.4], [fx + 7, hy - 8], [fx + 11, hy - 9],
      ]);
      break;
    case "sad":
      eyeDot(fx - ex, hy + 1.2);
      eyeDot(fx + ex, hy + 1.2);
      brow(fx - ex, hy - 5, 0.34);
      brow(fx + ex, hy - 5, -0.34);
      mouth(() => {
        c.beginPath();
        c.arc(fx, hy + 9.6, 3.2, Math.PI * 1.2, Math.PI * 1.8);
      });
      break;
    case "annoyed":
      c.strokeStyle = INK;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(fx - ex - 2.6, hy + 1);
      c.lineTo(fx - ex + 2.6, hy + 0.2);
      c.stroke();
      c.beginPath();
      c.moveTo(fx + ex - 2.6, hy + 0.2);
      c.lineTo(fx + ex + 2.6, hy + 1);
      c.stroke();
      brow(fx - ex, hy - 5.4, 0.3);
      brow(fx + ex, hy - 5.4, -0.3);
      mouth(() => {
        c.beginPath();
        c.moveTo(fx - 3.4, hy + 7.4);
        c.lineTo(fx + 3.4, hy + 7.4);
      });
      break;
    default:
      eyeDot(fx - ex, hy + 0.6);
      eyeDot(fx + ex, hy + 0.6);
      brow(fx - ex, hy - 5.4, -0.04);
      brow(fx + ex, hy - 5.4, 0.04);
      mouth(() => {
        c.beginPath();
        c.moveTo(fx - 2.8, hy + 6.8);
        c.lineTo(fx + 2.8, hy + 6.8);
      });
  }
  c.lineCap = "butt";
}

/** Profile face (head faces left). `s` scales the features (prone head). */
export function drawFaceProfile(c, x, hy, emo, L, s) {
  s = s || 1;
  const fx = x - 4.6 * s, ey = hy + 0.6 * s;
  c.lineCap = "round";
  c.lineJoin = "round";
  const eye = () => {
    if (emo === "happy" || emo === "proud" || emo === "excited") {
      c.strokeStyle = INK;
      c.lineWidth = 1.8 * s;
      c.beginPath();
      c.arc(fx, ey + 1 * s, 2.5 * s, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
    } else if (emo === "surprised" || emo === "nervous") {
      c.fillStyle = "#fff";
      ell(c, fx, ey, 2.7 * s, 3 * s);
      c.fill();
      c.fillStyle = INK;
      ell(c, fx - 0.4 * s, ey + 0.4 * s, 1.6 * s, 1.6 * s);
      c.fill();
    } else if (emo === "shy" || emo === "sad") {
      c.strokeStyle = INK;
      c.lineWidth = 1.8 * s;
      c.beginPath();
      c.arc(fx, ey - 1 * s, 2.5 * s, Math.PI * 0.15, Math.PI * 0.85);
      c.stroke();
    } else {
      c.fillStyle = INK;
      ell(c, fx, ey, 1.8 * s, 1.9 * s);
      c.fill();
      c.fillStyle = "rgba(255,255,255,.85)";
      ell(c, fx - 0.5 * s, ey - 0.6 * s, 0.8 * s, 0.8 * s);
      c.fill();
    }
  };
  eye();
  // brow
  c.save();
  c.translate(fx, hy - 5 * s);
  c.rotate(emo === "sad" ? 0.3 : emo === "annoyed" ? 0.24 : -0.05);
  c.strokeStyle = shade(L.hair || "#3d2a20", -0.05);
  c.lineWidth = 1.8 * s;
  c.beginPath();
  c.moveTo(-3.6 * s, 0);
  c.lineTo(3.4 * s, 0);
  c.stroke();
  c.restore();
  // mouth
  c.strokeStyle = INK;
  c.lineWidth = 1.7 * s;
  c.beginPath();
  if (emo === "happy" || emo === "proud") c.arc(fx + 0.6 * s, hy + 5 * s, 2.8 * s, 0.2 * Math.PI, 0.9 * Math.PI);
  else if (emo === "excited") {
    c.save();
    c.fillStyle = "#7d3b4a";
    ell(c, fx + 0.6 * s, hy + 6.4 * s, 3 * s, 2.6 * s);
    c.fill();
    c.restore();
  } else if (emo === "surprised") {
    c.save();
    c.fillStyle = "#6d3a48";
    ell(c, fx + 0.4 * s, hy + 6.6 * s, 2 * s, 2.5 * s);
    c.fill();
    c.restore();
  } else if (emo === "sad") c.arc(fx + 0.8 * s, hy + 8.6 * s, 2.6 * s, Math.PI * 1.2, Math.PI * 1.8);
  else if (emo === "nervous") {
    c.moveTo(fx - 2.6 * s, hy + 6.6 * s);
    for (let i = 1; i <= 3; i++) c.lineTo(fx - 2.6 * s + i * 1.9 * s, hy + 6.6 * s + (i % 2 ? -1.2 * s : 1.2 * s));
  } else {
    c.moveTo(fx - 2.2 * s, hy + 6.4 * s);
    c.lineTo(fx + 2.2 * s, hy + 6.2 * s);
  }
  c.stroke();
  // nose bump on the west silhouette
  c.fillStyle = L.skin2 || shade(L.skin || "#f2cba6", -0.1);
  poly(c, [[x - 11.4 * s, hy + 1.4 * s], [x - 14 * s, hy + 3.6 * s], [x - 11.4 * s, hy + 4.8 * s]]);
  if (emo === "shy" || emo === "happy") {
    c.fillStyle = "rgba(255,120,140,.4)";
    ell(c, fx - 1.4 * s, hy + 4.2 * s, 2.4 * s, 1.5 * s);
    c.fill();
  }
  c.lineCap = "butt";
}

/** Mood sparkles / marks around the head (front & profile poses). */
export function drawMoodFx(c, x, hy, emo) {
  if (emo === "excited") {
    c.strokeStyle = "rgba(255,209,102,.9)";
    c.lineWidth = 1.8;
    c.lineCap = "round";
    const sp = [[-19, -16], [19, -20], [0, -27]];
    sp.forEach((p) => {
      c.beginPath();
      c.moveTo(x + p[0] * 0.72, hy + p[1] * 0.8);
      c.lineTo(x + p[0], hy + p[1]);
      c.stroke();
    });
    c.lineCap = "butt";
  }
  if (emo === "surprised") {
    c.fillStyle = "rgba(143,211,255,.9)";
    c.font = "800 13px Outfit, sans-serif";
    c.textAlign = "center";
    c.fillText("!", x + 16, hy - 14);
    c.textAlign = "left";
  }
}
