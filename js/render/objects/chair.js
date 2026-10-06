// render/objects/chair.js — office chair showcase file. FIXED orientation:
// the chair always faces south (seat opens toward the camera, backrest at
// the north side). No rotation, no direction variants.

import { ell, ellShadow, gemBox, rrPath, shade, solidBox } from "../../core/utils.js";

export const Chair = {
  name: "chair",
  title: "Chair",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.35, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "chair", x: 0, y: 0, color: "#4f7cff" },

  /** Seat plane sits at y-26 (characters' "sit" pose relies on this). */
  draw(c, a) {
    const x = a.x, y = a.y, col = a.color || "#4f7cff";
    const sw = a.w || 34, sd = a.d || 32, sh = a.h || 26, st = 8, bh = a.bh || 56;
    ellShadow(c, x, y + sd * 0.28, sw * 0.72, sd * 0.5, 0.24);

    /* 5-star base with casters */
    const floorY = y + sd * 0.28;
    c.strokeStyle = "#6f7c99";
    c.lineWidth = 3.4;
    c.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const an = Math.PI * 0.5 + (i * 2 * Math.PI) / 5;
      const tx = x + Math.cos(an) * 15, ty = floorY + Math.sin(an) * 6;
      c.beginPath();
      c.moveTo(x, floorY);
      c.lineTo(tx, ty);
      c.stroke();
      c.fillStyle = "#4c5670";
      ell(c, tx, ty + 1, 2.5, 2.5);
      c.fill();
    }
    c.lineCap = "butt";
    c.fillStyle = "#6f7c99";
    c.fillRect(x - 3, y - sh + st - 4, 6, floorY - (y - sh + st) + 5);
    c.fillStyle = "rgba(255,255,255,.25)";
    c.fillRect(x - 3, y - sh + st - 4, 1.8, floorY - (y - sh + st) + 5);

    /* backrest (north side): front face + top edge read from the south */
    const by = y - sd / 2 + 3;
    solidBox(c, x, by, sw + 6, 10, bh, shade(col, 0.16), shade(col, -0.36), 6);
    c.fillStyle = "rgba(255,255,255,.14)";
    rrPath(c, x - (sw + 6) / 2 + 5, by + 5 - bh + 10, sw + 6 - 10, bh - 26, 5);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.18)";
    c.lineWidth = 1.1;
    rrPath(c, x - (sw + 6) / 2 + 5, by + 5 - bh + 10, sw + 6 - 10, bh - 26, 5);
    c.stroke();

    /* seat cushion */
    gemBox(c, x, y, sw, sd, sh, st, col, shade(col, -0.36), 7);
    c.strokeStyle = "rgba(255,255,255,.22)";
    c.lineWidth = 1.2;
    rrPath(c, x - sw / 2 + 6, y - sd / 2 - sh + 5, sw - 12, sd - 10, 4);
    c.stroke();

    /* armrests: posts + pads hugging the seat sides */
    for (const s of [-1, 1]) {
      const ax = x + s * (sw / 2 + 2.5);
      c.fillStyle = "#5d6883";
      rrPath(c, ax - 2.2, y - 34, 4.4, 26, 2);
      c.fill();
      c.fillStyle = shade(col, -0.45);
      rrPath(c, ax - 3.6, y - 39, 7.2, 20, 3.6);
      c.fill();
      c.fillStyle = "rgba(255,255,255,.2)";
      rrPath(c, ax - 3.6, y - 39, 7.2, 3, 1.5);
      c.fill();
    }
  },

  sortY(a) {
    return a.y + (a.d || 32) / 2;
  },
};
