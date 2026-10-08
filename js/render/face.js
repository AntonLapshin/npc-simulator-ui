// render/face.js — character faces per emotion (front + profile) and mood FX.
//
// Extracted from render/character.js. Unknown emotion strings fall through
// to the neutral default — the painters never throw.

import { ell, poly, shade } from "../core/utils.js";
import { hairOf, skin2Of } from "./look.js";

const INK = "#2b2340";

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
    c.strokeStyle = shade(hairOf(L), -0.05);
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
  c.strokeStyle = shade(hairOf(L), -0.05);
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
  c.fillStyle = skin2Of(L);
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
