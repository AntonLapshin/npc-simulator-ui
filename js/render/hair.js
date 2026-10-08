// render/hair.js — character hair painters (front, profile, top views).
//
// Extracted from render/character.js. Hair is painted in two passes: a back
// mass (drawHairBack* — before the head skin) and a front/top mass
// (drawHairFront / drawHairProfile / drawHairTop — after the head skin).

import { ell, poly, rrPath, shade } from "../core/utils.js";
import { hairOf, hairStyleOf } from "./look.js";

/* ── hair ────────────────────────────────────────────────────────────── */

/** Hair masses that sit BEHIND the head (drawn before the head skin). */
export function drawHairBack(c, x, hy, L) {
  const col = hairOf(L), st = hairStyleOf(L);
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
  const col = hairOf(L), st = hairStyleOf(L);
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
  const col = hairOf(L), st = hairStyleOf(L);
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
  const col = hairOf(L), st = hairStyleOf(L);
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
  const col = hairOf(L), st = hairStyleOf(L);
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
