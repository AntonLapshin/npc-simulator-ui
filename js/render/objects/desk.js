// render/objects/desk.js — office desk showcase file. FIXED orientation:
// the working side faces south (the sitter approaches from the north side
// of the desk in scenes, facing south; the camera sees the desk's south
// face, the slab top and the drawer pedestal front).

import { ellShadow, gemBox, rrPath, shade, solidBox } from "../../core/utils.js";

/** Slab (t) at height h on legs + under-desk drawer pedestal on the right. */
export const Desk = {
  name: "desk",
  title: "Desk",
  supportsDirection: false,
  variants: ["Default"],
  defaultProps: {
    asset: "desk",
    x: 0,
    y: 0,
    w: 170,
    d: 76,
    h: 44,
    t: 10,
    color: "#f4ece0",
    edge: "#c9b694",
  },

  draw(c, a) {
    const x = a.x, y = a.y;
    const w = a.w || 170, d = a.d || 76, h = a.h || 44, t = a.t || 10;
    const top = a.color || "#f4ece0", edge = a.edge || "#c9b694";
    const legH = Math.max(4, h - t);
    const x0 = x - w / 2, y0 = y - d / 2, x1 = x + w / 2, y1 = y + d / 2;

    ellShadow(c, x, y1 - 2, w * 0.53, d * 0.46, 0.24);

    /* back legs (dimmer, behind everything) */
    c.fillStyle = "#78839f";
    c.fillRect(x0 + 14, y0 + 12 - legH, 8, legH);
    c.fillRect(x1 - 22, y0 + 12 - legH, 8, legH);

    /* drawer pedestal (right side), front faces south */
    const px = x1 - 45, py = y + 2;
    solidBox(c, px, py, 56, 54, legH, shade(top, -0.04), shade(edge, -0.24), 4);
    const pfTop = py + 27 - legH;
    c.fillStyle = "rgba(20,26,48,.16)";
    c.fillRect(px - 28, pfTop + legH * 0.42, 56, 1);
    c.fillStyle = "#98a4be";
    rrPath(c, px - 10, pfTop + legH * 0.52, 20, 3, 1.5);
    c.fill();
    rrPath(c, px - 10, pfTop + legH * 0.82, 20, 3, 1.5);
    c.fill();

    /* front-left leg */
    c.fillStyle = "#93a0bb";
    c.fillRect(x0 + 14, y1 - 14 - legH, 8, legH);
    c.fillStyle = "rgba(255,255,255,.22)";
    c.fillRect(x0 + 14, y1 - 14 - legH, 2, legH);
    c.fillStyle = "#5d6883";
    c.fillRect(x0 + 13, y1 - 17, 10, 3);

    /* modesty rail between leg and pedestal */
    c.fillStyle = "rgba(120,132,160,.55)";
    c.fillRect(x0 + 22, y1 - 16 - legH + 4, px - 28 - (x0 + 22), 5);

    /* slab */
    gemBox(c, x, y, w, d, h, t, top, shade(edge, -0.1), 8);
    c.strokeStyle = "rgba(120,100,70,.16)";
    c.lineWidth = 1;
    rrPath(c, x0 + 8, y0 - h + 7, w - 16, d - 14, 5);
    c.stroke();
    /* faint grain */
    c.strokeStyle = "rgba(120,100,70,.08)";
    for (let i = 1; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x0 + 12, y0 - h + (d * i) / 3);
      c.lineTo(x1 - 12, y0 - h + (d * i) / 3 - 3);
      c.stroke();
    }
  },

  sortY(a) {
    return a.y + (a.d || 0) / 2;
  },
};
