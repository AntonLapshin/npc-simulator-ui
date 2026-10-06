// render/objects/roundTable.js — round pedestal table showcase file.
// FIXED orientation (rotationally symmetric anyway): top ellipse + edge
// band from above, pedestal column and base disc below.

import { SQ, ell, ellShadow, poly } from "../../core/utils.js";

/** Top ellipse centre is exactly (x, y-h). */
export const RoundTable = {
  name: "roundTable",
  title: "Round Table",
  supportsDirection: false,
  variants: ["Default"],
  defaultProps: {
    asset: "roundTable", x: 0, y: 0, r: 74, h: 42, t: 9,
    color: "#f7f0e4", edge: "#c9b694",
  },

  draw(c, a) {
    const x = a.x, y = a.y, r = a.r || 70, h = a.h || 42, t = a.t || 9;
    const rx = r, ry = r * SQ, topCY = y - h;

    ellShadow(c, x, y + ry * 0.42, rx * 0.98, ry * 0.94, 0.24);

    /* base disc on the floor */
    c.fillStyle = "#7f8ca8";
    ell(c, x, y + ry * 0.4, rx * 0.4, ry * 0.42);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.18)";
    ell(c, x - rx * 0.1, y + ry * 0.34, rx * 0.16, ry * 0.16);
    c.fill();
    c.strokeStyle = "rgba(20,26,48,.25)";
    c.lineWidth = 1;
    ell(c, x, y + ry * 0.4, rx * 0.4, ry * 0.42);
    c.stroke();

    /* pedestal column */
    const pTop = topCY + t - 2, pBot = y + ry * 0.4;
    c.fillStyle = "#98a4be";
    c.fillRect(x - 6.5, pTop, 13, Math.max(1, pBot - pTop));
    c.fillStyle = "rgba(255,255,255,.3)";
    c.fillRect(x - 6.5, pTop, 3.6, Math.max(1, pBot - pTop));
    c.fillStyle = "rgba(0,0,0,.18)";
    c.fillRect(x + 2.6, pTop, 3.9, Math.max(1, pBot - pTop));

    /* top: edge band (side) then the top face */
    c.fillStyle = a.edge || "#c9b694";
    ell(c, x, topCY + t, rx, ry);
    c.fill();
    c.fillRect(x - rx, topCY + t / 2, rx * 2, t);
    c.fillStyle = a.color || "#f7f0e4";
    ell(c, x, topCY, rx, ry);
    c.fill();
    c.save();
    ell(c, x, topCY, rx, ry);
    c.clip();
    c.fillStyle = "rgba(255,255,255,.30)";
    poly(c, [[x - rx, topCY - ry], [x + rx * 0.1, topCY - ry], [x - rx * 0.15, topCY + ry], [x - rx, topCY + ry]]);
    c.fillStyle = "rgba(0,0,0,.05)";
    poly(c, [[x + rx, topCY], [x + rx * 0.2, topCY + ry], [x + rx, topCY + ry]]);
    /* inner ring detail */
    c.strokeStyle = "rgba(120,100,70,.12)";
    c.lineWidth = 1.4;
    c.beginPath();
    c.ellipse(x, topCY, rx * 0.72, ry * 0.72, 0, 0, 6.2832);
    c.stroke();
    c.restore();
    c.strokeStyle = "rgba(60,45,25,.24)";
    c.lineWidth = 1.6;
    ell(c, x, topCY, rx, ry);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,.45)";
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(x, topCY, Math.max(1, rx - 3), Math.max(1, ry - 2), 0, Math.PI * 1.05, Math.PI * 1.75);
    c.stroke();
  },

  sortY(a) {
    return a.y + (a.r || 60) * SQ * 0.9;
  },
};
